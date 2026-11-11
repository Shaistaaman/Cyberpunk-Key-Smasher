import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { SoundPlayer } from "../audio/SoundPlayer";
import type { Level, Size } from "../game/types";
import { useGame } from "../hooks/useGame";
import { TargetBox, TARGET_BOX_SIZE } from "./TargetBox";
import { TopBar } from "./TopBar";

interface ArenaScreenProps {
  playerName: string;
  level: Level;
  sound: Pick<SoundPlayer, "playCorrect" | "playWrong" | "playGameOver">;
  onGameOver: (score: number) => void;
}

const TOP_BAR_HEIGHT = 64;

/**
 * The first target position is computed before the arena element exists, so it
 * uses a viewport-based fallback. Once the arena is measured, the round is
 * remounted once (still score 0 / full lives) so the first target is placed
 * using the real arena size.
 */
export function ArenaScreen(props: ArenaScreenProps) {
  const measured = useRef<Size | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const handleMeasured = useCallback(() => setRoundKey((k) => k + 1), []);
  return (
    <ArenaRound
      key={roundKey}
      {...props}
      measured={measured}
      onMeasured={handleMeasured}
    />
  );
}

interface ArenaRoundProps extends ArenaScreenProps {
  measured: { current: Size | null };
  onMeasured: () => void;
}

function ArenaRound({
  playerName,
  level,
  sound,
  onGameOver,
  measured,
  onMeasured,
}: ArenaRoundProps) {
  const arenaRef = useRef<HTMLDivElement>(null);

  // Read the latest measured size at dispatch time. Before the arena is
  // measured, fall back to the viewport minus the top bar.
  const getArena = useCallback((): Size => {
    const el = arenaRef.current;
    if (el && el.clientWidth > 0 && el.clientHeight > 0) {
      return { width: el.clientWidth, height: el.clientHeight };
    }
    if (measured.current) return measured.current;
    return {
      width: window.innerWidth,
      height: Math.max(0, window.innerHeight - TOP_BAR_HEIGHT),
    };
  }, [measured]);

  const state = useGame({
    level,
    sound,
    getArena,
    box: TARGET_BOX_SIZE,
    onGameOver,
  });

  // First measurement: restart the (untouched) round with the real arena size.
  useLayoutEffect(() => {
    if (measured.current) return;
    const el = arenaRef.current;
    if (el && el.clientWidth > 0 && el.clientHeight > 0) {
      measured.current = { width: el.clientWidth, height: el.clientHeight };
      onMeasured();
    }
  }, [measured, onMeasured]);

  return (
    <div className="flex h-screen flex-col bg-night">
      <TopBar playerName={playerName} score={state.score} lives={state.lives} />
      <div
        ref={arenaRef}
        data-testid="arena"
        className="relative flex-1 overflow-hidden"
      >
        <TargetBox char={state.targetChar} position={state.position} />
      </div>
    </div>
  );
}
