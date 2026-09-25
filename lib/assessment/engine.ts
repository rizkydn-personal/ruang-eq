import { z } from "zod";
import { dimensions, items, itemById } from "./items";
import { rules, tendency } from "./interpretation-rules";
import { versions } from "../config/product";
export const answerSchema = z.union([z.number().int().min(1).max(5), z.null()]);
export const attemptSchema = z
  .object({
    id: z.uuid(),
    seed: z.number().int().min(0).max(4294967295),
    ...Object.fromEntries(
      Object.entries(versions).map(([k, v]) => [k, z.literal(v)]),
    ),
    instrumentVersion: z.literal(versions.instrumentVersion),
    scoringVersion: z.literal(versions.scoringVersion),
    interpretationVersion: z.literal(versions.interpretationVersion),
    itemOrder: z.array(z.string()).length(50),
    responsesByItemId: z.record(z.string(), answerSchema),
    status: z.enum(["draft", "completed"]),
    createdAt: z.string().datetime(),
    completedAt: z.string().datetime().nullable(),
    revision: z.number().int().min(0),
  })
  .strict()
  .superRefine((a, ctx) => {
    if (JSON.stringify(a.itemOrder) !== JSON.stringify(makeOrder(a.seed)))
      ctx.addIssue({
        code: "custom",
        message: "Urutan atau seed tidak sesuai.",
      });
    if (Object.keys(a.responsesByItemId).some((id) => !itemById[id]))
      ctx.addIssue({ code: "custom", message: "Item tidak dikenal." });
    if (
      a.status === "completed" &&
      (a.itemOrder.some((id) => !(id in a.responsesByItemId)) || !a.completedAt)
    )
      ctx.addIssue({ code: "custom", message: "Jawaban belum lengkap." });
  });
export type Attempt = z.infer<typeof attemptSchema>;
export function makeOrder(seed: number) {
  let n = seed >>> 0;
  const random = () => {
    n += 0x6d2b79f5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const shuffle = <T>(arr: T[]) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const groups = dimensions.map((d) =>
    shuffle(items.filter((i) => i.dimension === d.id).map((i) => i.id)),
  );
  return Array.from({ length: 5 }, (_, stage) =>
    shuffle(groups.flatMap((g) => g.slice(stage * 2, stage * 2 + 2))),
  ).flat();
}
export function newAttempt(): Attempt {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  return {
    id: crypto.randomUUID(),
    seed,
    ...versions,
    itemOrder: makeOrder(seed),
    responsesByItemId: {},
    status: "draft",
    createdAt: new Date().toISOString(),
    completedAt: null,
    revision: 0,
  };
}
export function score(responses: Record<string, number | null>) {
  const profiles = dimensions.map((d) => {
    const valid = items
      .filter((i) => i.dimension === d.id)
      .flatMap((i) => {
        const x = responses[i.id];
        return typeof x === "number" && Number.isInteger(x) && x >= 1 && x <= 5
          ? [i.reverse ? 6 - x : x]
          : [];
      });
    const mean =
      valid.length >= 8
        ? valid.reduce((a, b) => a + b, 0) / valid.length
        : null;
    const rule = rules[d.id];
    const related = rule.itemIds.flatMap((id) => {
      const x = responses[id];
      return typeof x === "number" ? [itemById[id].reverse ? 6 - x : x] : [];
    });
    return {
      ...d,
      count: valid.length,
      index: mean === null ? null : (mean - 1) * 25,
      mean,
      recommendationId: rule.id,
      interpretation:
        mean === null
          ? "Jawaban belum cukup. Isi minimal 8 dari 10 butir untuk dimensi ini."
          : tendency(
              related.length >= 2
                ? related.reduce((a, b) => a + b, 0) / related.length
                : null,
              rule.behavior,
            ),
      exercises: rule.exercises,
    };
  });
  const summary = profiles.every((d) => d.index !== null)
    ? profiles.reduce((a, d) => a + d.index!, 0) / 5
    : null;
  const focus = profiles
    .filter((d) => d.index !== null)
    .sort((a, b) => a.index! - b.index!)
    .slice(0, 3)
    .map((d) => d.id);
  return { dimensions: profiles, summary, focus };
}
export type Result = ReturnType<typeof score>;
