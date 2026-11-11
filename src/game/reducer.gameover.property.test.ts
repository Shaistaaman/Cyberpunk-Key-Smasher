import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createInitialState, gameReducer } from "./reducer";
import { CHARSET, MAX_LIVES } from "./constants";
import type { GameAction, Level } from "./types";

// Feature: cyberpunk-key-smasher, Property 9: Game ends exactly when lives reach 0
// **Validates: Requirements 6.1**

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
const sizeArb = fc.record({
  width: fc.integer({ min: 1, max: 2000 }),
  height: fc.integer({ min: 1, max: 2000 }),
});

// Actions are generated without rng; the rng is attached per test run.
type RawAction =
  | { type: "KEY"; key: string; repeat: boolean }
  | { type: "TIMEOUT" };

const rawActionArb: fc.Arbitrary<RawAction> = fc.oneof(
  fc.record({
    type: fc.constant("KEY" as const),
    key: fc.oneof(
      fc.constantFrom(...CHARSET),
      fc.constantFrom("Shift", "Control", "Alt", "Meta", "Enter", "Escape"),
    ),
    repeat: fc.boolean(),
  }),
  fc.record({ type: fc.constant("TIMEOUT" as const) }),
);

describe("Property 9: Game ends exactly when lives reach 0", () => {
  it("over iff lives is 0, lives never negative, and over state is frozen", () => {
    fc.assert(
      fc.property(
        levelArb,
        fc.integer({ min: 0, max: 2 ** 31 }),
        sizeArb,
        sizeArb,
        fc.array(rawActionArb, { minLength: 0, maxLength: 60 }),
        (level, seed, arena, box, raws) => {
          const rng = seededRng(seed);
          let state = createInitialState(level, rng, arena, box);

          for (const raw of raws) {
            const action: GameAction =
              raw.type === "TIMEOUT"
                ? { type: "TIMEOUT", rng, arena, box }
                : { type: "KEY", key: raw.key, repeat: raw.repeat, rng, arena, box };

            const next = gameReducer(state, action);

            if (state.over) {
              // No action changes state once the game is over.
              expect(next).toEqual(state);
            }

            expect(next.lives).toBeGreaterThanOrEqual(0);
            expect(next.lives).toBeLessThanOrEqual(MAX_LIVES);
            expect(next.over).toBe(next.lives === 0);

            state = next;
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
