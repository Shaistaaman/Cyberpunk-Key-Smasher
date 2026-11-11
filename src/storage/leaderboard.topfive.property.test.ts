import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { topFive, type LeaderboardEntry } from "./leaderboard";

// Feature: cyberpunk-key-smasher, Property 12: Top five ordering
describe("Property 12: Top five ordering", () => {
  const entryArb = fc.record({
    name: fc.string(),
    // Small score range to force frequent ties.
    score: fc.integer({ min: 0, max: 20 }),
    level: fc.constantFrom("easy" as const, "medium" as const, "hard" as const),
    savedAt: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
  });

  // Assign unique seq values per list, in shuffled order.
  const listArb: fc.Arbitrary<LeaderboardEntry[]> = fc
    .array(entryArb, { maxLength: 30 })
    .chain((items) =>
      fc.shuffledSubarray(items.map((_, i) => i), {
        minLength: items.length,
        maxLength: items.length,
      }).map((seqs) => items.map((e, i) => ({ ...e, seq: seqs[i] }))),
    );

  /** **Validates: Requirements 7.3, 7.4** */
  it("returns at most 5 entries, sorted by score desc then seq asc, none excluded outranks any included", () => {
    fc.assert(
      fc.property(listArb, (entries) => {
        const result = topFive(entries);

        expect(result.length).toBe(Math.min(5, entries.length));

        for (let i = 1; i < result.length; i++) {
          const prev = result[i - 1];
          const cur = result[i];
          expect(
            prev.score > cur.score ||
              (prev.score === cur.score && prev.seq < cur.seq),
          ).toBe(true);
        }

        const returned = new Set(result.map((e) => e.seq));
        const minReturned = result.length
          ? Math.min(...result.map((e) => e.score))
          : Infinity;
        for (const e of entries) {
          if (!returned.has(e.seq)) {
            expect(minReturned).toBeGreaterThanOrEqual(e.score);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
