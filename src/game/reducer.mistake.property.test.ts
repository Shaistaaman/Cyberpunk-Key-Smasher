import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { gameReducer } from "./reducer";
import { CHARSET, LEVEL_SECONDS } from "./constants";
import { isModifierKey, matchesTarget } from "./keys";
import type { GameAction, GameState, Level } from "./types";

// Feature: cyberpunk-key-smasher, Property 7: Mistakes cost one life
// **Validates: Requirements 5.1, 5.2**

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

// Any key a user might press: charset keys plus assorted non-character keys.
const keyArb = fc.oneof(
  charArb,
  fc.constantFrom(
    "Enter",
    "Escape",
    "Tab",
    " ",
    "ArrowUp",
    "Backspace",
    "F1",
    "Shift",
    "Control",
    "Alt",
    "Meta",
  ),
);

// In-play states: lives >= 1, not over.
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

const scenarioArb = fc.record({
  state: stateArb,
  isTimeout: fc.boolean(),
  key: keyArb,
  seed: fc.integer({ min: 0, max: 2 ** 31 }),
  arena: sizeArb,
  box: sizeArb,
});

describe("Property 7: Mistakes cost one life", () => {
  it("wrong non-modifier keys and timeouts reduce lives by exactly 1 and keep score", () => {
    fc.assert(
      fc.property(
        scenarioArb.filter(
          (s) =>
            s.isTimeout ||
            (!isModifierKey(s.key) && !matchesTarget(s.key, s.state.targetChar)),
        ),
        (s) => {
          const common = { rng: seededRng(s.seed), arena: s.arena, box: s.box };
          const action: GameAction = s.isTimeout
            ? { type: "TIMEOUT", ...common }
            : { type: "KEY", key: s.key, repeat: false, ...common };

          const next = gameReducer(s.state, action);

          expect(next.lives).toBe(s.state.lives - 1);
          expect(next.score).toBe(s.state.score);
        },
      ),
      { numRuns: 200 },
    );
  });
});
