import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { gameReducer } from "./reducer";
import { CHARSET, LEVEL_SECONDS } from "./constants";
import type { GameAction, GameState, Level } from "./types";

// Feature: cyberpunk-key-smasher, Property 5: Relocation restarts the timer
// **Validates: Requirements 3.4, 3.5, 4.3, 5.3**

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

// In-play states always carry the full level duration in timerSeconds.
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

type ActionKind = "correct" | "wrong" | "timeout";

const scenarioArb = fc
  .record({
    state: stateArb,
    kind: fc.constantFrom<ActionKind>("correct", "wrong", "timeout"),
    wrongKey: charArb,
    upper: fc.boolean(),
    seed: fc.integer({ min: 0, max: 2 ** 31 }),
    arena: sizeArb,
    box: sizeArb,
  })
  // Mistakes only relocate when lives remain afterwards.
  .filter((s) => s.kind === "correct" || s.state.lives >= 2)
  // A "wrong" key must not match the target (case-insensitive).
  .filter(
    (s) =>
      s.kind !== "wrong" ||
      s.wrongKey.toLowerCase() !== s.state.targetChar.toLowerCase(),
  );

describe("Property 5: Relocation restarts the timer", () => {
  it("relocating actions bump the epoch, stay in bounds, change char, and reset the timer", () => {
    fc.assert(
      fc.property(scenarioArb, (s) => {
        const rng = seededRng(s.seed);
        const common = { rng, arena: s.arena, box: s.box };
        let action: GameAction;
        if (s.kind === "timeout") {
          action = { type: "TIMEOUT", ...common };
        } else {
          const base = s.kind === "correct" ? s.state.targetChar : s.wrongKey;
          const key = s.upper ? base.toUpperCase() : base.toLowerCase();
          action = { type: "KEY", key, repeat: false, ...common };
        }

        const next = gameReducer(s.state, action);

        expect(next.over).toBe(false);
        expect(next.timerEpoch).toBe(s.state.timerEpoch + 1);
        expect(next.timerSeconds).toBe(LEVEL_SECONDS[s.state.level]);
        expect(next.targetChar).not.toBe(s.state.targetChar);
        expect(CHARSET).toContain(next.targetChar);

        const maxX = Math.max(0, s.arena.width - s.box.width);
        const maxY = Math.max(0, s.arena.height - s.box.height);
        expect(next.position.x).toBeGreaterThanOrEqual(0);
        expect(next.position.x).toBeLessThanOrEqual(maxX);
        expect(next.position.y).toBeGreaterThanOrEqual(0);
        expect(next.position.y).toBeLessThanOrEqual(maxY);
      }),
      { numRuns: 200 },
    );
  });
});
