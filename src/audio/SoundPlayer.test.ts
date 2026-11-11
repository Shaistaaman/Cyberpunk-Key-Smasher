import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SoundPlayer } from "./SoundPlayer";

function makeFake(src: string) {
  return {
    src,
    preload: "" as string,
    muted: false,
    currentTime: 5,
    load: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
  };
}

function setup() {
  const created: ReturnType<typeof makeFake>[] = [];
  const createAudio = vi.fn((src: string) => {
    const el = makeFake(src);
    created.push(el);
    return el as unknown as HTMLAudioElement;
  });
  return { created, createAudio, player: new SoundPlayer(createAudio) };
}

describe("SoundPlayer", () => {
  it("preload creates elements for the three sound URLs with preload=auto and load()", () => {
    const { created, createAudio, player } = setup();
    player.preload();
    expect(createAudio.mock.calls.map((c) => c[0]).sort()).toEqual(
      ["/sounds/correct.mp3", "/sounds/game-over.mp3", "/sounds/wrong.mp3"].sort(),
    );
    for (const el of created) {
      expect(el.preload).toBe("auto");
      expect(el.load).toHaveBeenCalledTimes(1);
    }
  });

  it("prime plays and pauses each element, rewinds, and restores muted state", async () => {
    const { created, player } = setup();
    player.preload();
    created[0].muted = true; // one starts muted, others unmuted
    player.prime();
    await Promise.resolve();
    await Promise.resolve();
    expect(created).toHaveLength(3);
    for (const el of created) {
      expect(el.play).toHaveBeenCalledTimes(1);
      expect(el.pause).toHaveBeenCalled();
      expect(el.currentTime).toBe(0);
    }
    expect(created[0].muted).toBe(true);
    expect(created[1].muted).toBe(false);
    expect(created[2].muted).toBe(false);
  });

  it("source uses no Web Audio API", () => {
    const src = readFileSync(resolve(__dirname, "SoundPlayer.ts"), "utf8");
    for (const word of ["AudioContext", "webkitAudioContext", "OscillatorNode", "GainNode"]) {
      expect(src).not.toContain(word);
    }
  });
});
