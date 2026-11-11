import { MAX_LIVES } from "../game/constants";

interface TopBarProps {
  playerName: string;
  score: number;
  lives: number;
}

export function TopBar({ playerName, score, lives }: TopBarProps) {
  const shown = Math.max(0, Math.min(MAX_LIVES, lives));
  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-neon-purple bg-night px-4 font-bold uppercase tracking-widest shadow-neon-purple">
      <span data-testid="player-name" className="truncate text-neon-cyan">
        {playerName}
      </span>
      <span className="text-white">
        Score:{" "}
        <span data-testid="score" className="text-neon-green">
          {score}
        </span>
      </span>
      <span
        data-testid="lives"
        role="img"
        aria-label={`Lives: ${shown}`}
        className="flex gap-1 text-xl text-neon-pink drop-shadow-neon-pink"
      >
        {Array.from({ length: shown }, (_, i) => (
          <span key={i} data-testid="life" aria-hidden="true">
            ♥
          </span>
        ))}
      </span>
    </header>
  );
}
