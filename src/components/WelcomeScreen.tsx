import type { ChangeEvent } from "react";
import type { SoundPlayer } from "../audio/SoundPlayer";
import { MAX_NAME_LENGTH } from "../game/constants";
import { canStart, sanitizeName } from "../game/name";
import type { Level } from "../game/types";

export interface WelcomeScreenProps {
  name: string;
  level: Level | null;
  onNameChange: (name: string) => void;
  onLevelChange: (level: Level) => void;
  onStart: () => void;
  sound: Pick<SoundPlayer, "prime">;
}

const LEVELS: { value: Level; label: string; hint: string }[] = [
  { value: "easy", label: "EASY", hint: "3s" },
  { value: "medium", label: "MEDIUM", hint: "2s" },
  { value: "hard", label: "HARD", hint: "1s" },
];

export function WelcomeScreen({
  name,
  level,
  onNameChange,
  onLevelChange,
  onStart,
  sound,
}: WelcomeScreenProps) {
  const startEnabled = canStart(name, level);

  const handleName = (e: ChangeEvent<HTMLInputElement>) =>
    onNameChange(sanitizeName(e.target.value));

  const handleStart = () => {
    if (!startEnabled) return;
    // Must run synchronously inside the click (user gesture) for autoplay policy.
    sound.prime();
    onStart();
  };

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-center text-4xl font-bold tracking-widest text-neon-pink text-glow-pink sm:text-6xl">
        CYBERPUNK KEY SMASHER
      </h1>

      <form
        className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-neon-cyan bg-night/80 p-6 shadow-neon-cyan"
        onSubmit={(e) => {
          e.preventDefault();
          handleStart();
        }}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="player-name"
            className="text-sm uppercase tracking-widest text-neon-cyan"
          >
            Player name
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={handleName}
            autoComplete="off"
            placeholder="ENTER NAME"
            className="rounded border border-neon-purple bg-black/60 px-3 py-2 text-lg text-neon-green placeholder:text-neon-purple/60 focus:border-neon-cyan"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm uppercase tracking-widest text-neon-cyan">
            Level
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map(({ value, label, hint }) => {
              const selected = level === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer flex-col items-center rounded border px-2 py-3 text-center focus-within:outline focus-within:outline-2 focus-within:outline-neon-cyan ${
                    selected
                      ? "border-neon-pink text-neon-pink shadow-neon-pink"
                      : "border-neon-purple text-neon-purple"
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={value}
                    checked={selected}
                    onChange={() => onLevelChange(value)}
                    className="sr-only"
                  />
                  <span className="font-bold">{label}</span>
                  <span className="text-xs opacity-80">{hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!startEnabled}
          className="rounded border-2 border-neon-green px-4 py-3 text-xl font-bold tracking-widest text-neon-green shadow-neon-green transition enabled:hover:bg-neon-green enabled:hover:text-night disabled:cursor-not-allowed disabled:border-neon-purple/40 disabled:text-neon-purple/40 disabled:shadow-none"
        >
          START GAME
        </button>
      </form>
    </main>
  );
}
