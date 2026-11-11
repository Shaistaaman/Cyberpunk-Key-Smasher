export type Level = "easy" | "medium" | "hard";
export type Phase = "welcome" | "arena" | "gameover";

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  lives: number;
  level: Level;
  targetChar: string;
  position: Position; // top-left of Target_Box inside the arena
  timerSeconds: number; // full Target_Timer duration for the level
  timerEpoch: number; // incremented on every relocation; restarts the timer
  over: boolean;
}

export type GameAction =
  | {
      type: "KEY";
      key: string;
      repeat: boolean;
      rng: () => number;
      arena: Size;
      box: Size;
    }
  | { type: "TIMEOUT"; rng: () => number; arena: Size; box: Size };
