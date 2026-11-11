import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { canStart } from "./name";
import type { Level } from "./types";

// Feature: cyberpunk-key-smasher, Property 2: Start is enabled only for a valid name and a selected level
describe("Property 2: Start is enabled only for a valid name and a selected level", () => {
  const levelArb = fc.constantFrom<Level | null>("easy", "medium", "hard", null);
  const whitespaceOnlyArb = fc
    .array(fc.constantFrom(" ", "\t", "\n", "\r", "\u00a0", "\u2003"))
    .map((chars) => chars.join(""));

  /** **Validates: Requirements 1.4, 1.5** */
  it("is true iff the name has a non-whitespace char and a level is selected", () => {
    fc.assert(
      fc.property(fc.string(), levelArb, (name, level) => {
        const expected = /\S/.test(name) && level !== null;
        expect(canStart(name, level)).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });

  /** **Validates: Requirements 1.4, 1.5** */
  it("is false for whitespace-only names regardless of level", () => {
    fc.assert(
      fc.property(whitespaceOnlyArb, levelArb, (name, level) => {
        expect(canStart(name, level)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
