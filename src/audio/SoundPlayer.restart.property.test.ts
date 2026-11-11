// Feature: cyberpunk-key-smasher, Property 14: Playing a sound always restarts it
// **Validates: Requirements 9.4**
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { SoundPlayer, SOUND_URLS, type SoundName } from "./SoundPlayer";

const names = Object.keys(SOUND_URLS) as SoundName[];

describe("Property 14: Playing a sound always restarts it", () => {
  it("sets currentTime to 0 before play() is invoked", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...names),
        fc.double({ min: 0, max: 1e6, noNaN: true }),
        (name, startTime) => {
          const ops: string[] = [];
          let currentTimeAtPlay: number | undefined;
          const fakes: HTMLAudioElement[] = [];

          const createAudio = (src: string) => {
            let time = src === SOUND_URLS[name] ? startTime : 0;
            const fake = {
              preload: "",
              muted: false,
              load() {},
              pause() {},
              play() {
                ops.push("play");
                currentTimeAtPlay = time;
                return Promise.resolve();
              },
              get currentTime() {
                return time;
              },
              set currentTime(v: number) {
                ops.push(`set:${v}`);
                time = v;
              },
            } as unknown as HTMLAudioElement;
            fakes.push(fake);
            return fake;
          };

          const player = new SoundPlayer(createAudio);
          player.preload();
          ops.length = 0;
          player.play(name);

          expect(currentTimeAtPlay).toBe(0);
          expect(ops).toEqual(["set:0", "play"]);
        },
      ),
      { numRuns: 100 },
    );
  });
});
