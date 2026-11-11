import { useEffect, useRef, useState } from "react";
import { SLOGANS } from "../game/constants";
import type { Level } from "../game/types";
import { saveEntry, type LeaderboardEntry } from "../storage/leaderboard";
import { Leaderboard } from "./Leaderboard";

interface GameOverScreenProps {
  playerName: string;
  level: Level;
  score: number;
  onPlayAgain: () => void;
}

interface SaveResult {
  entries: LeaderboardEntry[];
  currentSeq: number;
  saved: boolean;
}

export function GameOverScreen({
  playerName,
  level,
  score,
  onPlayAgain,
}: GameOverScreenProps) {
  // One slogan per mount.
  const [slogan] = useState(
    () => SLOGANS[Math.floor(Math.random() * SLOGANS.length)],
  );
  const [result, setResult] = useState<SaveResult | null>(null);
  const savedRef = useRef(false);

  // Save the entry once when the screen is displayed. saveEntry never throws;
  // on write failure it returns the in-memory list so the round still shows.
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const { entries, saved } = saveEntry({
      name: playerName,
      score,
      level,
      savedAt: Date.now(),
    });
    const currentSeq = entries.reduce((max, e) => Math.max(max, e.seq), -1);
    setResult({ entries, currentSeq, saved });
  }, [playerName, score, level]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-black uppercase tracking-widest text-neon-pink drop-shadow-neon-pink">
        Game Over
      </h1>
      <p className="text-lg text-white">
        Final score:{" "}
        <span
          data-testid="final-score"
          className="text-3xl font-bold text-neon-green"
        >
          {score}
        </span>
      </p>
      <p data-testid="slogan" className="italic text-neon-cyan">
        {slogan}
      </p>
      {result && (
        <>
          <Leaderboard
            entries={result.entries}
            currentSeq={result.currentSeq}
          />
          {!result.saved && (
            <p role="status" className="text-sm text-neon-yellow">
              Could not save your score to this browser.
            </p>
          )}
        </>
      )}
      <button
        type="button"
        onClick={onPlayAgain}
        className="rounded border-2 border-neon-cyan px-8 py-3 font-bold uppercase tracking-widest text-neon-cyan shadow-neon-cyan hover:bg-neon-cyan hover:text-night focus:outline-none focus-visible:ring-4 focus-visible:ring-neon-yellow"
      >
        Play Again
      </button>
    </main>
  );
}
