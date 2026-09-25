import { describe, it, expect } from "vitest";
import {
  attemptSchema,
  makeOrder,
  newAttempt,
  score,
} from "../lib/assessment/engine";
import { dimensions, items, itemById } from "../lib/assessment/items";
import { buildPdf } from "../lib/export/pdf";
import { reportModel } from "../lib/export/report";
describe("instrument and scoring", () => {
  it("has 50 unique stable IDs, 10 per dimension, exactly 2 reverse", () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(50);
    for (const d of dimensions) {
      const group = items.filter((i) => i.dimension === d.id);
      expect(group).toHaveLength(10);
      expect(group.filter((i) => i.reverse)).toHaveLength(2);
      expect(
        group.every(
          (i) => i.rationale && i.reviewStatus === "draft_self_report",
        ),
      ).toBe(true);
    }
  });
  it("preserves balanced coverage, deterministic shuffle and variation", () => {
    const orders = [0, 1, 42, 100, 4294967295].map(makeOrder);
    expect(new Set(orders.map((o) => o.join())).size).toBeGreaterThan(1);
    expect(makeOrder(42)).toEqual(makeOrder(42));
    for (const order of orders) {
      expect(new Set(order).size).toBe(50);
      for (let s = 0; s < 5; s++)
        for (const d of dimensions)
          expect(
            order
              .slice(s * 10, s * 10 + 10)
              .filter((id) => itemById[id].dimension === d.id),
          ).toHaveLength(2);
    }
  });
  it("directed minimum and maximum map exactly to 0 and 100", () => {
    for (const [raw, expected] of [
      [1, 0],
      [5, 100],
    ]) {
      const r = Object.fromEntries(
        items.map((i) => [i.id, i.reverse ? 6 - raw : raw]),
      );
      expect(score(r).summary).toBe(expected);
      expect(score(r).dimensions.every((d) => d.index === expected)).toBe(true);
    }
  });
  it("handles reverse and excludes missing, cutoff 7 versus 8", () => {
    const r: Record<string, number | null> = Object.fromEntries(
      items.map((i) => [i.id, 3]),
    );
    r["awareness-01"] = null;
    r["awareness-02"] = null;
    r["awareness-09"] = 1;
    expect(score(r).dimensions[0].index).toBe(56.25);
    r["awareness-03"] = null;
    expect(score(r).dimensions[0].index).toBeNull();
    expect(score(r).summary).toBeNull();
  });
  it("does not depend on display order", () => {
    const r = Object.fromEntries(items.map((i, n) => [i.id, (n % 5) + 1]));
    expect(score(r)).toEqual(
      score(Object.fromEntries(makeOrder(7).map((id) => [id, r[id]]))),
    );
  });
  it("validates version, unknown IDs, range, duplicate order and completion", () => {
    const a = newAttempt();
    expect(attemptSchema.safeParse(a).success).toBe(true);
    for (const bad of [
      { ...a, instrumentVersion: "unknown" },
      { ...a, responsesByItemId: { alien: 3 } },
      { ...a, responsesByItemId: { "awareness-01": 6 } },
      { ...a, itemOrder: Array(50).fill("awareness-01") },
      { ...a, status: "completed" },
    ])
      expect(attemptSchema.safeParse(bad).success).toBe(false);
  });
  it("creates four-page text PDFs below hard byte limit, including partial data", async () => {
    for (const responses of [
      Object.fromEntries(items.map((i) => [i.id, 3])),
      {},
    ]) {
      const a = { ...newAttempt(), responsesByItemId: responses };
      const blob = buildPdf(reportModel(a, score(responses)));
      expect(blob.size).toBeLessThanOrEqual(5_000_000);
      const data = Buffer.from(await blob.arrayBuffer()).toString("latin1");
      expect(data).toContain("/Count 4");
      expect(data.startsWith("%PDF")).toBe(true);
    }
  });
});
