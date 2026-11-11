import { describe, it } from "vitest";
import fc from "fast-check";
import { randomPosition } from "./target";

// Feature: cyberpunk-key-smasher, Property 3: Target position is fully inside the arena
// **Validates: Requirements 3.1**
describe("Property 3: Target position is fully inside the arena", () => {
  it("randomPosition keeps the box within the arena bounds", () => {
    const sizes = fc
      .record({
        bw: fc.integer({ min: 1, max: 500 }),
        bh: fc.integer({ min: 1, max: 500 }),
        extraW: fc.integer({ min: 0, max: 2000 }),
        extraH: fc.integer({ min: 0, max: 2000 }),
      })
      .map(({ bw, bh, extraW, extraH }) => ({
        box: { width: bw, height: bh },
        arena: { width: bw + extraW, height: bh + extraH },
      }));

    fc.assert(
      fc.property(
        sizes,
        fc.double({ min: 0, max: 1, noNaN: true, maxExcluded: true }),
        fc.double({ min: 0, max: 1, noNaN: true, maxExcluded: true }),
        ({ arena, box }, r1, r2) => {
          const seq = [r1, r2];
          let i = 0;
          const pos = randomPosition(arena, box, () => seq[i++ % 2]);
          return (
            pos.x >= 0 &&
            pos.x <= arena.width - box.width &&
            pos.y >= 0 &&
            pos.y <= arena.height - box.height
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
