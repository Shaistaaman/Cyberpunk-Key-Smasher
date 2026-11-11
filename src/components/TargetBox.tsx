import type { Position, Size } from "../game/types";

export const TARGET_BOX_SIZE: Size = { width: 80, height: 80 };

interface TargetBoxProps {
  char: string;
  position: Position;
}

export function TargetBox({ char, position }: TargetBoxProps) {
  return (
    <div
      data-testid="target-box"
      aria-live="off"
      className="absolute flex items-center justify-center rounded border-2 border-neon-green bg-night text-4xl font-black text-neon-green shadow-neon-green drop-shadow-neon-green"
      style={{
        left: position.x,
        top: position.y,
        width: TARGET_BOX_SIZE.width,
        height: TARGET_BOX_SIZE.height,
      }}
    >
      {char}
    </div>
  );
}
