import { STORAGE_KEY } from "../game/constants";
import type { Level } from "../game/types";

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: Level;
  savedAt: number;
  seq: number;
}

const LEVELS: readonly string[] = ["easy", "medium", "hard"];

function isEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    typeof v.score === "number" &&
    Number.isFinite(v.score) &&
    typeof v.level === "string" &&
    LEVELS.includes(v.level) &&
    typeof v.savedAt === "number" &&
    Number.isFinite(v.savedAt) &&
    typeof v.seq === "number" &&
    Number.isFinite(v.seq)
  );
}

/** Parses stored JSON; drops invalid items; never throws. */
export function parseLeaderboard(raw: string | null): LeaderboardEntry[] {
  if (raw === null) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(isEntry).map((e) => ({
      name: e.name,
      score: e.score,
      level: e.level,
      savedAt: e.savedAt,
      seq: e.seq,
    }));
  } catch {
    return [];
  }
}

export function serializeLeaderboard(entries: LeaderboardEntry[]): string {
  return JSON.stringify(entries);
}

/** Reads the leaderboard from localStorage; never throws. */
export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    return parseLeaderboard(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/**
 * Appends an entry with a monotonically increasing seq and persists it.
 * If writing fails, returns the in-memory list with saved: false.
 */
export function saveEntry(entry: Omit<LeaderboardEntry, "seq">): {
  entries: LeaderboardEntry[];
  saved: boolean;
} {
  const existing = loadLeaderboard();
  const seq = existing.reduce((max, e) => Math.max(max, e.seq), -1) + 1;
  const entries = [...existing, { ...entry, seq }];
  try {
    localStorage.setItem(STORAGE_KEY, serializeLeaderboard(entries));
    return { entries, saved: true };
  } catch {
    return { entries, saved: false };
  }
}

/** Top 5 by score descending; ties ordered by earlier seq. */
export function topFive(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || a.seq - b.seq)
    .slice(0, 5);
}
