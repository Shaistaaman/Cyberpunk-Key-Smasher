export type SoundName = "correct" | "wrong" | "gameOver";

export const SOUND_URLS: Record<SoundName, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  gameOver: "/sounds/game-over.mp3",
};

const SOUND_NAMES = Object.keys(SOUND_URLS) as SoundName[];

type AudioFactory = (src: string) => HTMLAudioElement;

/** Swallow a rejected promise (or an undefined return) from play(). */
function safePlay(el: HTMLAudioElement): void {
  try {
    const result = el.play() as Promise<void> | undefined;
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch {
    /* silent no-op */
  }
}

/**
 * Plays mp3 sound effects using HTMLAudioElement only.
 * Every failure is swallowed so gameplay never breaks.
 */
export class SoundPlayer {
  private readonly createAudio: AudioFactory;
  private readonly elements = new Map<SoundName, HTMLAudioElement>();

  constructor(createAudio?: AudioFactory) {
    this.createAudio = createAudio ?? ((src: string) => new Audio(src));
  }

  /** Create and cache one element per file; each file is handled independently. */
  preload(): void {
    try {
      for (const name of SOUND_NAMES) {
        try {
          if (this.elements.has(name)) continue;
          const el = this.createAudio(SOUND_URLS[name]);
          this.elements.set(name, el);
          el.preload = "auto";
          el.load();
        } catch {
          /* skip this file */
        }
      }
    } catch {
      /* silent no-op */
    }
  }

  /** Unlock playback; call inside a user gesture (START GAME click). */
  prime(): void {
    try {
      this.preload();
      for (const name of SOUND_NAMES) {
        const el = this.elements.get(name);
        if (!el) continue;
        let wasMuted = false;
        try {
          wasMuted = el.muted;
          el.muted = true;
          const result = el.play() as Promise<void> | undefined;
          const restore = () => {
            try {
              el.pause();
              el.currentTime = 0;
              el.muted = wasMuted;
            } catch {
              /* ignore */
            }
          };
          // Pause synchronously so the muted clip is never audible.
          restore();
          if (result && typeof result.catch === "function") {
            result.then(restore, restore).catch(() => {});
          }
        } catch {
          try {
            el.muted = wasMuted;
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      /* silent no-op */
    }
  }

  play(name: SoundName): void {
    try {
      let el = this.elements.get(name);
      if (!el) {
        this.preload();
        el = this.elements.get(name);
      }
      if (!el) return;
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
      safePlay(el);
    } catch {
      /* silent no-op */
    }
  }

  playCorrect(): void {
    this.play("correct");
  }

  playWrong(): void {
    this.play("wrong");
  }

  playGameOver(): void {
    this.play("gameOver");
  }
}
