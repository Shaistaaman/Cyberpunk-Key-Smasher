import { useEffect, useReducer, useRef } from "react";
import type { SoundPlayer } from "../audio/SoundPlayer";
import { createInitialState, gameReducer } from "../game/reducer";
import type { GameState, Level, Size } from "../game/types";

export interface UseGameOptions {
  level: Level;
  sound: Pick<SoundPlayer, "playCorrect" | "playWrong" | "playGameOver">;
  /** Returns the latest measured arena size (read at dispatch time). */
  getArena: () => Size;
  /** Size of the Target_Box. */
  box: Size;
  onGameOver: (score: number) => void;
  rng?: () => number;
}

export function useGame(options: UseGameOptions): GameState {
  const { level, sound, getArena, box, onGameOver, rng = Math.random } = options;

  // Keep the latest callbacks/values without re-running effects.
  const latest = useRef({ sound, getArena, box, onGameOver, rng });
  latest.current = { sound, getArena, box, onGameOver, rng };

  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createInitialState(level, rng, getArena(), box),
  );

  // One keydown listener on document; removed when the round is over/unmounted.
  useEffect(() => {
    if (state.over) return;
    const handler = (e: KeyboardEvent) => {
      const { getArena, box, rng } = latest.current;
      dispatch({
        type: "KEY",
        key: e.key,
        repeat: e.repeat,
        rng,
        arena: getArena(),
        box,
      });
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [state.over]);

  // Target_Timer: restarts from the full duration on every relocation.
  useEffect(() => {
    if (state.over) return;
    const id = setTimeout(() => {
      const { getArena, box, rng } = latest.current;
      dispatch({ type: "TIMEOUT", rng, arena: getArena(), box });
    }, state.timerSeconds * 1000);
    return () => clearTimeout(id);
  }, [state.timerEpoch, state.timerSeconds, state.over]);

  // Sounds and game-over notification, derived from previous vs next state.
  const prev = useRef<GameState>(state);
  const notified = useRef(false);
  useEffect(() => {
    const before = prev.current;
    prev.current = state;
    if (before === state) return;
    const { sound, onGameOver } = latest.current;
    if (state.score > before.score) sound.playCorrect();
    if (state.lives < before.lives) sound.playWrong();
    if (state.over && !before.over && !notified.current) {
      notified.current = true;
      sound.playGameOver();
      onGameOver(state.score);
    }
  }, [state]);

  return state;
}
