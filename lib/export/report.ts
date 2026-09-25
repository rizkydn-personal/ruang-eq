import type { Attempt, Result } from "../assessment/engine";
import { disclaimer, product } from "../config/product";
import { sevenDays } from "../assessment/interpretation-rules";
export function reportModel(attempt: Attempt, result: Result) {
  return {
    title: `${product.name} | Profil refleksi diri`,
    date: new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString(
      "id-ID",
      { day: "numeric", month: "long", year: "numeric" },
    ),
    version: attempt.instrumentVersion,
    disclaimer,
    dimensions: result.dimensions,
    summary: result.summary,
    focus: result.focus,
    plan: sevenDays,
  };
}
export type Report = ReturnType<typeof reportModel>;
export const fileName = (format: string) =>
  `ruang-eq-${new Date().toISOString().slice(0, 10)}.${format}`;
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
