import type { Result } from "./engine";

export function lowestDimensions(dimensions: Result["dimensions"]) {
  const available = dimensions.filter((d) => d.index !== null);
  if (!available.length) return [];
  const minimum = Math.min(...available.map((d) => d.index!));
  return available.filter((d) => Math.abs(d.index! - minimum) < 0.000001);
}
