import { MAX_NAME_LENGTH } from "./constants";
import type { Level } from "./types";

/** Truncates the raw player name to MAX_NAME_LENGTH characters. */
export function sanitizeName(raw: string): string {
  return raw.slice(0, MAX_NAME_LENGTH);
}

/** True only for a name with a non-whitespace character and a selected level. */
export function canStart(name: string, level: Level | null): boolean {
  return name.trim().length > 0 && level !== null;
}
