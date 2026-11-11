import { useEffect, useState } from "react";
import { SoundPlayer } from "./audio/SoundPlayer";
import type { Level, Phase } from "./game/types";
import { ArenaScreen } from "./components/ArenaScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";

export default function App() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [playerName, setPlayerName] = useState("");
  const [level, setLevel] = useState<Level | null>(null);
  const [score, setScore] = useState(0);
  const [sound] = useState(() => new SoundPlayer());

  // Preload the mp3 files once when the game loads.
  useEffect(() => {
    sound.preload();
  }, [sound]);

  if (phase === "arena" && level) {
    return (
      <ArenaScreen
        playerName={playerName}
        level={level}
        sound={sound}
        onGameOver={(finalScore) => {
          setScore(finalScore);
          setPhase("gameover");
        }}
      />
    );
  }

  if (phase === "gameover" && level) {
    return (
      <GameOverScreen
        playerName={playerName}
        level={level}
        score={score}
        onPlayAgain={() => {
          // Keep the name; require the player to re-select a level.
          setLevel(null);
          setPhase("welcome");
        }}
      />
    );
  }

  return (
    <WelcomeScreen
      name={playerName}
      level={level}
      onNameChange={setPlayerName}
      onLevelChange={setLevel}
      onStart={() => setPhase("arena")}
      sound={sound}
    />
  );
}
