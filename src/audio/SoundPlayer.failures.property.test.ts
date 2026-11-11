import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { SoundPlayer, type SoundName } from "./SoundPlayer";

// Feature: cyberpunk-key-smasher, Property 13: Sound failures never break gameplay
// **Validates: Requirements 9.5**

type PlayMode = "ok" | "throw" | "reject" | "undefined";

interface FailureConfig {
  factoryThrows: boolean;
  loadThrows: boolean;
  playMode: PlayMode;
  pauseThrows: boolean;
  currentTimeThrows: boolean;
}

type Action =
  | { kind: "preload" }
  | { kind: "prime" }
  | { kind: "play"; name: SoundName }
  | { kind: "playUnknown"; name: string }
  | { kind: "helper"; which: "playCorrect" | "playWrong" | "playGameOver" };

const configArb: fc.Arbitrary<FailureConfig> = fc.record({
  factoryThrows: fc.boolean(),
  loadThrows: fc.boolean(),
  playMode: fc.constantFrom<PlayMode>("ok", "throw", "reject", "undefined"),
  pauseThrows: fc.boolean(),
  currentTimeThrows: fc.boolean(),
});

const actionArb: fc.Arbitrary<Action> = fc.oneof(
  fc.constant<Action>({ kind: "preload" }),
  fc.constant<Action>({ kind: "prime" }),
  fc.constantFrom<SoundName>("correct", "wrong", "gameOver").map<Action>((name) => ({ kind: "play", name })),
  fc.string().map<Action>((name) => ({ kind: "playUnknown", name })),
  fc
    .constantFrom<"playCorrect" | "playWrong" | "playGameOver">("playCorrect", "playWrong", "playGameOver")
    .map<Action>((which) => ({ kind: "helper", which })),
);

function makeFakeAudio(cfg: FailureConfig): HTMLAudioElement {
  const fake = {
    preload: "",
    muted: false,
    load() {
      if (cfg.loadThrows) throw new Error("load failed");
    },
    play(): Promise<void> | undefined {
      switch (cfg.playMode) {
        case "throw":
          throw new Error("play failed");
        case "reject":
          return Promise.reject(new Error("play rejected"));
        case "undefined":
          return undefined;
        default:
          return Promise.resolve();
      }
    },
    pause() {
      if (cfg.pauseThrows) throw new Error("pause failed");
    },
    set currentTime(_v: number) {
      if (cfg.currentTimeThrows) throw new Error("currentTime failed");
    },
    get currentTime() {
      return 0;
    },
  };
  return fake as unknown as HTMLAudioElement;
}

function run(player: SoundPlayer, action: Action): void {
  switch (action.kind) {
    case "preload":
      player.preload();
      break;
    case "prime":
      player.prime();
      break;
    case "play":
      player.play(action.name);
      break;
    case "playUnknown":
      player.play(action.name as SoundName);
      break;
    case "helper":
      player[action.which]();
      break;
  }
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe("Property 13: Sound failures never break gameplay", () => {
  it("never throws and never causes unhandled rejections under any audio failure mode", async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onUnhandled);

    try {
      await fc.assert(
        fc.asyncProperty(configArb, fc.array(actionArb, { maxLength: 30 }), async (cfg, actions) => {
          const player = new SoundPlayer((_src: string) => {
            if (cfg.factoryThrows) throw new Error("Audio constructor failed");
            return makeFakeAudio(cfg);
          });

          for (const action of actions) {
            expect(() => run(player, action)).not.toThrow();
          }

          await flush();
          expect(unhandled).toEqual([]);
        }),
        { numRuns: 100 },
      );
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });
});
