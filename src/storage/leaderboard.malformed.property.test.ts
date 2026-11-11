import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { parseLeaderboard } from "./leaderboard";

/** True when the string is not parseable JSON, or parses to a non-array. */
function isMalformed(raw: string): boolean {
  try {
    return !Array.isArray(JSON.parse(raw));
  } catch {
    return true;
  }
}

// Feature: cyberpunk-key-smasher, Property 11: Malformed storage yields an empty leaderboard without throwing
describe("Property 11: Malformed storage yields an empty leaderboard without throwing", () => {
  /** **Validates: Requirements 8.4** */
  it("never throws and always returns an array for any string or null", () => {
    fc.assert(
      fc.property(fc.option(fc.string(), { nil: null }), (raw) => {
        const result = parseLeaderboard(raw);
        expect(Array.isArray(result)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /** **Validates: Requirements 8.4** */
  it("returns an empty array for any string that is not valid leaderboard JSON", () => {
    const malformedArb = fc
      .oneof(fc.string(), fc.json(), fc.string({ unit: "binary" }))
      .filter(isMalformed);
    fc.assert(
      fc.property(malformedArb, (raw) => {
        expect(parseLeaderboard(raw)).toEqual([]);
      }),
      { numRuns: 100 },
    );
  });

  /** **Validates: Requirements 8.4** */
  it("returns an empty array for null", () => {
    expect(parseLeaderboard(null)).toEqual([]);
  });
});
