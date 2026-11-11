import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { gameReducer } from "./reducer";
import { CHARSET, LEVEL_SECONDS } from "./constants";
import type { GameState, Level } from "./types";

// Feature: cyberpunk-key-smasher, Property 6: Correct key scores
// **Validates: Requirements 4.2**

/** Deterministic rng returning values in [0, 1). */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) % 1_000_000) / 1_000_000;
  };
}

const levelArb = fc.constantFrom<Level>("easy", "medium", "hard");
const charArb = fc.constantFrom(...CHARSET);
const sizeArb = fc.record({
  width: fc.integer({ min: 1, max: 2000 }),
  height: fc.integer({ min: 1, max: 2000 }),
});

const stateArb: fc.Arbitrary<GameState> = fc
  .record({
    score: fc.integer({ min: 0, max: 10_000 }).map((n) => n * 10),
    lives: fc.integer({ min: 1, max: 3 }),
    level: levelArb,
    targetChar: charArb,
    position: fc.record({
      x: fc.integer({ min: 0, max: 2000 }),
      y: fc.integer({ min: 0, max: 2000 }),
    }),
    timerEpoch: fc.integer({ min: 0, max: 1_000_000 }),
  })
  .map((s) => ({
    ...s,
    timerSeconds: LEVEL_SECONDS[s.level],
    over: false,
  }));

describe("Property 6: Correct key scores", () => {
  it("a matching non-repeat key adds exactly 10 points and keeps lives unchanged", () => {
    fc.assert(
      fc.property(
        stateArb,
        fc.boolean(),
        fc.integer({ min: 0, max: 2 ** 31 }),
        sizeArb,
        sizeArb,
        (state, upper, seed, arena, box) => {
          const key = upper
            ? state.targetChar.toUpperCase()
            : state.targetChar.toLowerCase();
          const next = gameReducer(state, {
            type: "KEY",
            key,
            repeat: false,
            rng: seededRng(seed),
            arena,
            box,
          });

          expect(next.score).toBe(state.score + 10);
          expect(next.lives).toBe(state.lives);
          expect(next.over).toBe(false);
        },
      ),
      { numRuns: 200 },
    );
  });
});
