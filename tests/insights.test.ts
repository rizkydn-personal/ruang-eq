import { expect, it } from "vitest";
import { score } from "../lib/assessment/engine";
import { lowestDimensions } from "../lib/assessment/insights";
import { items } from "../lib/assessment/items";

it("selects the actual lowest dimension after reverse scoring", () => {
  const responses = Object.fromEntries(
    items.map((item) => {
      const directed = item.dimension === "regulation" ? 1 : 4;
      return [item.id, item.reverse ? 6 - directed : directed];
    }),
  );
  const focus = lowestDimensions(score(responses).dimensions);
  expect(focus.map((d) => d.id)).toEqual(["regulation"]);
  expect(focus[0].index).toBe(0);
  expect(focus[0].exercises.length).toBeGreaterThanOrEqual(2);
});
it("keeps ties and excludes insufficient data rather than treating it as zero", () => {
  expect(lowestDimensions(score({}).dimensions)).toEqual([]);
  const responses = Object.fromEntries(
    items.filter((i) => i.dimension !== "empathy").map((i) => [i.id, 3]),
  );
  const focus = lowestDimensions(score(responses).dimensions);
  expect(focus).toHaveLength(4);
  expect(focus.some((d) => d.id === "empathy")).toBe(false);
});
