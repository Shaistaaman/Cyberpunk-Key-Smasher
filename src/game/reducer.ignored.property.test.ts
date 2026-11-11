import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { gameReducer } from "./reducer";
import { CHARSET, LEVEL_SECONDS } from "./constants";
import type { GameState, Level } from "./types";

// Feature: cyberpunk-key-smasher, Property 8: Ignored inputs are no-ops
// **Validates: Requirements 5.5, 5.6**

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
const modifierArb = fc.constantFrom("Shift", "Control", "Alt", "Meta");
const sizeArb = fc.record({
  width: fc.integer({ min: 1, max: 2000 }),
  height: fc.integer({ min: 1, max: 2000 }),
});

const stateArb: fc.Arbitrary<GameState> = fc
  .record({
    score: fc.integer({ min: 0, max: 10_000 }).map((n) => n * 10),
    lives: fc.integer({ min: 0, max: 3 }),
    level: levelArb,
    targetChar: charArb,
    position: fc.record({
      x: fc.integer({ min: 0, max: 2000 }),
      y: fc.integer({ min: 0, max: 2000 }),
    }),
    timerEpoch: fc.integer({ min: 0, max: 1_000_000 }),
    over: fc.boolean(),
  })
  .map((s) => ({ ...s, timerSeconds: LEVEL_SECONDS[s.level] }));

const envArb = fc.record({
  seed: fc.integer({ min: 0, max: 2 ** 31 }),
  arena: sizeArb,
  box: sizeArb,
});

describe("Property 8: Ignored inputs are no-ops", () => {
  it("modifier key presses leave score, lives, and timerEpoch unchanged", () => {
    fc.assert(
      fc.property(
        stateArb,
        modifierArb,
        fc.boolean(),
        envArb,
        (state, key, repeat, env) => {
          const next = gameReducer(state, {
            type: "KEY",
            key,
            repeat,
            rng: seededRng(env.seed),
            arena: env.arena,
            box: env.box,
          });

          expect(next.score).toBe(state.score);
          expect(next.lives).toBe(state.lives);
          expect(next.timerEpoch).toBe(state.timerEpoch);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("repeated key events leave score, lives, and timerEpoch unchanged", () => {
    fc.assert(
      fc.property(
        stateArb,
        // Any key, including the current target and modifiers.
        fc.oneof(charArb, modifierArb, fc.string({ minLength: 1, maxLength: 8 })),
        fc.boolean(),
        envArb,
        (state, rawKey, useTarget, env) => {
          const key = useTarget ? state.targetChar : rawKey;
          const next = gameReducer(state, {
            type: "KEY",
            key,
            repeat: true,
            rng: seededRng(env.seed),
            arena: env.arena,
            box: env.box,
          });

          expect(next.score).toBe(state.score);
          expect(next.lives).toBe(state.lives);
          expect(next.timerEpoch).toBe(state.timerEpoch);
        },
      ),
      { numRuns: 200 },
    );
  });
});
