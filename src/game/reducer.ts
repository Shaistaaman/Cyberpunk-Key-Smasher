import { LEVEL_SECONDS, MAX_LIVES, POINTS_PER_HIT } from "./constants";
import { isModifierKey, matchesTarget } from "./keys";
import { pickTargetChar, randomPosition } from "./target";
import type { GameAction, GameState, Level, Size } from "./types";

export function createInitialState(
  level: Level,
  rng: () => number,
  arena: Size,
  box: Size,
): GameState {
  return {
    score: 0,
    lives: MAX_LIVES,
    level,
    targetChar: pickTargetChar(null, rng),
    position: randomPosition(arena, box, rng),
    timerSeconds: LEVEL_SECONDS[level],
    timerEpoch: 0,
    over: false,
  };
}

function relocate(
  state: GameState,
  rng: () => number,
  arena: Size,
  box: Size,
): GameState {
  return {
    ...state,
    targetChar: pickTargetChar(state.targetChar, rng),
    position: randomPosition(arena, box, rng),
    timerEpoch: state.timerEpoch + 1,
  };
}

function miss(
  state: GameState,
  rng: () => number,
  arena: Size,
  box: Size,
): GameState {
  const lives = state.lives - 1;
  if (lives <= 0) return { ...state, lives: 0, over: true };
  return relocate({ ...state, lives }, rng, arena, box);
}

export function gameReducer(
  state: GameState,
  action: GameAction,
): GameState {
  if (state.over) return state;

  switch (action.type) {
    case "KEY": {
      if (action.repeat || isModifierKey(action.key)) return state;
      if (matchesTarget(action.key, state.targetChar)) {
        return relocate(
          { ...state, score: state.score + POINTS_PER_HIT },
          action.rng,
          action.arena,
          action.box,
        );
      }
      return miss(state, action.rng, action.arena, action.box);
    }
    case "TIMEOUT":
      return miss(state, action.rng, action.arena, action.box);
    default:
      return state;
  }
}
