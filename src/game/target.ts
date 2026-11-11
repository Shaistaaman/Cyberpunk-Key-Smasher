import { CHARSET } from "./constants";
import type { Position, Size } from "./types";

/** Picks a CHARSET character different from `previous`. rng returns [0, 1). */
export function pickTargetChar(
  previous: string | null,
  rng: () => number,
): string {
  const pool = CHARSET.filter((c) => c !== previous);
  const i = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
  return pool[Math.max(0, i)];
}

/** Random top-left position keeping the box inside the arena (clamped to 0). */
export function randomPosition(
  arena: Size,
  box: Size,
  rng: () => number,
): Position {
  const maxX = Math.max(0, arena.width - box.width);
  const maxY = Math.max(0, arena.height - box.height);
  const x = Math.min(maxX, Math.max(0, Math.floor(rng() * (maxX + 1))));
  const y = Math.min(maxY, Math.max(0, Math.floor(rng() * (maxY + 1))));
  return { x, y };
}
