import { topFive, type LeaderboardEntry } from "../storage/leaderboard";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  /** `seq` of the current round's entry; highlighted when within the top 5. */
  currentSeq: number | null;
}

export function Leaderboard({ entries, currentSeq }: LeaderboardProps) {
  const top = topFive(entries);

  return (
    <section aria-labelledby="leaderboard-heading" className="w-full">
      <h2
        id="leaderboard-heading"
        className="mb-3 text-center text-xl font-bold uppercase tracking-widest text-neon-cyan"
      >
        Top 5
      </h2>
      {top.length === 0 ? (
        <p className="text-center text-neon-purple">No scores yet.</p>
      ) : (
        <ol className="space-y-2">
          {top.map((entry, index) => {
            const current = entry.seq === currentSeq;
            return (
              <li
                key={entry.seq}
                aria-current={current ? "true" : undefined}
                data-current={current ? "true" : undefined}
                className={
                  "flex items-center justify-between gap-3 rounded border px-3 py-2 font-mono " +
                  (current
                    ? "border-neon-yellow bg-neon-yellow/10 text-neon-yellow shadow-neon-yellow"
                    : "border-neon-purple/50 text-white")
                }
              >
                <span className="w-6 text-right">{index + 1}.</span>
                <span className="flex-1 truncate">{entry.name}</span>
                <span className="text-xs uppercase opacity-70">
                  {entry.level}
                </span>
                <span className="font-bold">{entry.score}</span>
                {current && <span className="sr-only">(this round)</span>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
