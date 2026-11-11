import type { Level } from "./types";

export const LEVEL_SECONDS: Record<Level, number> = {
  easy: 3,
  medium: 2,
  hard: 1,
};
export const MAX_NAME_LENGTH = 16;
export const MAX_LIVES = 3;
export const POINTS_PER_HIT = 10;
export const STORAGE_KEY = "cyberpunk-key-smasher:leaderboard";

export const CHARSET: readonly string[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  ..."!@#$%&*?+-=/<>()[]{};:,._~^|",
];

export const SLOGANS: readonly string[] = [
  "Jack out and try again, choom.",
  "Your reflexes just got flatlined.",
  "The grid never forgets a missed key.",
  "Neon fades, legends reboot.",
  "System crashed. Ego intact.",
  "Faster fingers, fewer regrets.",
];
