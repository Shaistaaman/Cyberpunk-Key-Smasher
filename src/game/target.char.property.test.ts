import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { CHARSET } from "./constants";
import { pickTargetChar } from "./target";

describe("pickTargetChar", () => {
  // Feature: cyberpunk-key-smasher, Property 4: Target character is from the set and differs from the previous one
  // **Validates: Requirements 3.2, 3.6**
  it("returns a CHARSET char different from the previous one", () => {
    fc.assert(
      fc.property(
        fc.option(fc.constantFrom(...CHARSET), { nil: null }),
        fc.double({ min: 0, max: 1, maxExcluded: true, noNaN: true }),
        (previous, r) => {
          const result = pickTargetChar(previous, () => r);
          expect(CHARSET).toContain(result);
          expect(result).not.toBe(previous);
        },
      ),
      { numRuns: 100 },
    );
  });
});
