import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  parseLeaderboard,
  serializeLeaderboard,
  type LeaderboardEntry,
} from "./leaderboard";

// Feature: cyberpunk-key-smasher, Property 10: Leaderboard serialization round trip
describe("Property 10: Leaderboard serialization round trip", () => {
  // Finite doubles, excluding -0 (JSON serializes -0 as 0).
  const scoreArb = fc
    .double({ noNaN: true, noDefaultInfinity: true })
    .map((n) => (Object.is(n, -0) ? 0 : n));

  const entryArb: fc.Arbitrary<LeaderboardEntry> = fc.record({
    name: fc.string(),
    score: scoreArb,
    level: fc.constantFrom("easy" as const, "medium" as const, "hard" as const),
    savedAt: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
    seq: fc.nat(),
  });

  /** **Validates: Requirements 8.3** */
  it("parse(serialize(entries)) equals the original list", () => {
    fc.assert(
      fc.property(fc.array(entryArb), (entries) => {
        expect(parseLeaderboard(serializeLeaderboard(entries))).toEqual(entries);
      }),
      { numRuns: 100 },
    );
  });
});
