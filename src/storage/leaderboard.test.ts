import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { STORAGE_KEY } from "../game/constants";
import { loadLeaderboard, saveEntry } from "./leaderboard";

const entry = { name: "NEO", score: 7, level: "easy" as const, savedAt: 1 };

describe("leaderboard storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes under the fixed STORAGE_KEY (Req 8.1, 8.2)", () => {
    const setSpy = vi.spyOn(Storage.prototype, "setItem");
    const result = saveEntry(entry);
    expect(result.saved).toBe(true);
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy.mock.calls[0][0]).toBe(STORAGE_KEY);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("reads from the fixed STORAGE_KEY (Req 8.1)", () => {
    saveEntry(entry);
    const getSpy = vi.spyOn(Storage.prototype, "getItem");
    const loaded = loadLeaderboard();
    expect(getSpy).toHaveBeenCalledWith(STORAGE_KEY);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe("NEO");
  });

  it("returns saved: false with the in-memory list when setItem throws (Req 8.5)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const result = saveEntry(entry);
    expect(result.saved).toBe(false);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject(entry);
  });

  it("yields an empty list when getItem throws (Req 8.4)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(loadLeaderboard()).toEqual([]);
  });
});
