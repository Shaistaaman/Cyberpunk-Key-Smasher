import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGame } from "./useGame";
import type { Level } from "../game/types";

const arena = { width: 800, height: 600 };
const box = { width: 80, height: 80 };
const WRONG_KEY = "€"; // never in CHARSET

function setup(level: Level = "easy") {
  const sound = {
    playCorrect: vi.fn(),
    playWrong: vi.fn(),
    playGameOver: vi.fn(),
  };
  const onGameOver = vi.fn();
  const hook = renderHook(() =>
    useGame({ level, sound, getArena: () => arena, box, onGameOver }),
  );
  return { ...hook, sound, onGameOver };
}

function press(key: string) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });
}

describe("useGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("keydown listener", () => {
    it("is attached to document, removed on game over and on unmount", () => {
      const add = vi.spyOn(document, "addEventListener");
      const remove = vi.spyOn(document, "removeEventListener");
      const { result, unmount } = setup();
      expect(add.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(1);

      for (let i = 0; i < 3; i++) press(WRONG_KEY);
      expect(result.current.over).toBe(true);
      expect(remove.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(
        1,
      );

      unmount();
      const second = setup();
      second.unmount();
      expect(remove.mock.calls.filter((c) => c[0] === "keydown")).toHaveLength(
        2,
      );
    });

    it("leaves no timers after unmount", () => {
      const { unmount } = setup();
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("leaves no timers after game over", () => {
      const { result } = setup();
      for (let i = 0; i < 3; i++) press(WRONG_KEY);
      expect(result.current.over).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("target timer", () => {
    it.each([
      ["easy", 3000],
      ["medium", 2000],
      ["hard", 1000],
    ] as const)(
      "%s level times out after %d ms and costs a life",
      (level, ms) => {
        const { result, sound } = setup(level);
        expect(result.current.lives).toBe(3);

        act(() => {
          vi.advanceTimersByTime(ms - 1);
        });
        expect(result.current.lives).toBe(3);

        act(() => {
          vi.advanceTimersByTime(1);
        });
        expect(result.current.lives).toBe(2);
        expect(sound.playWrong).toHaveBeenCalledTimes(1);
      },
    );

    it("restarts the timer from the full duration after a correct key", () => {
      const { result } = setup("easy");
      act(() => {
        vi.advanceTimersByTime(2500);
      });
      press(result.current.targetChar);
      expect(result.current.score).toBe(10);
      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(result.current.lives).toBe(3);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.lives).toBe(2);
    });
  });

  describe("sounds and game over", () => {
    it("plays correct sound on a correct key", () => {
      const { result, sound } = setup();
      press(result.current.targetChar);
      expect(sound.playCorrect).toHaveBeenCalledTimes(1);
      expect(sound.playWrong).not.toHaveBeenCalled();
    });

    it("plays wrong sound on a mistake", () => {
      const { sound } = setup();
      press(WRONG_KEY);
      expect(sound.playWrong).toHaveBeenCalledTimes(1);
      expect(sound.playCorrect).not.toHaveBeenCalled();
      expect(sound.playGameOver).not.toHaveBeenCalled();
    });

    it("plays game over after wrong and calls onGameOver once with the score", () => {
      const { result, sound, onGameOver } = setup();
      press(result.current.targetChar); // score 10
      for (let i = 0; i < 3; i++) press(WRONG_KEY);
      expect(result.current.over).toBe(true);

      expect(sound.playGameOver).toHaveBeenCalledTimes(1);
      expect(sound.playWrong).toHaveBeenCalledTimes(3);
      expect(sound.playWrong.mock.invocationCallOrder.at(-1)!).toBeLessThan(
        sound.playGameOver.mock.invocationCallOrder[0],
      );
      expect(onGameOver).toHaveBeenCalledTimes(1);
      expect(onGameOver).toHaveBeenCalledWith(10);

      press(WRONG_KEY);
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(onGameOver).toHaveBeenCalledTimes(1);
      expect(sound.playGameOver).toHaveBeenCalledTimes(1);
    });

    it("ends the game via timeouts too", () => {
      const { result, onGameOver } = setup("hard");
      // Each timeout re-arms the timer in an effect, so advance one at a time.
      for (let i = 0; i < 3; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }
      expect(result.current.over).toBe(true);
      expect(onGameOver).toHaveBeenCalledWith(0);
    });
  });
});
