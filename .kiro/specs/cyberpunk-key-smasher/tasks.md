# Implementation Plan: Cyberpunk Key Smasher

## Overview

Implementation in TypeScript (Vite + React + Tailwind CSS). Pure game logic comes first (name, keys, target helpers, reducer), then the edge modules (leaderboard, SoundPlayer, useGame hook), then the screens, and finally the App wiring. Each property test lives in its own file so test tasks stay independent.

## Tasks

- [x] 1. Set up project foundation
  - [x] 1.1 Scaffold the Vite + React + TypeScript project with Tailwind CSS and Vitest
    - Create `package.json` (pinned versions), `vite.config.ts`, `tsconfig.json`, `index.html`, `tailwind.config`, `postcss.config`, `src/main.tsx`, `src/index.css`
    - Add dev dependencies for Vitest, React Testing Library, jsdom, and fast-check, and a `test` script using `vitest --run`
    - No backend; audio comes only from static mp3 files in `public/sounds/` (see task 1.3)
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 1.2 Create shared types and constants
    - `src/game/types.ts`: `Level`, `Phase`, `Size`, `Position`, `GameState`, `GameAction`
    - `src/game/constants.ts`: `LEVEL_SECONDS`, `MAX_NAME_LENGTH`, `MAX_LIVES`, `POINTS_PER_HIT`, `STORAGE_KEY`, `CHARSET` (A-Z, 0-9, symbols), `SLOGANS` (at least 5)
    - _Requirements: 1.3, 3.2, 7.2, 8.1_

  - [x] 1.3 Create the `public/sounds/` folder for user-provided mp3 files
    - Add `public/sounds/README.md` (and a `.gitkeep`) stating that the user must add `correct.mp3`, `wrong.mp3`, and `game-over.mp3` to this folder; Vite serves them at `/sounds/correct.mp3`, `/sounds/wrong.mp3`, and `/sounds/game-over.mp3`
    - Do not generate or commit audio files; the game must keep working without sound if a file is missing
    - _Requirements: 9.1, 9.5, 10.3_

- [x] 2. Implement pure helper modules
  - [x] 2.1 Implement `name.ts`
    - `sanitizeName` truncates to 16 characters
    - `canStart` is true only for a non-whitespace name and a selected level
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 2.2 Implement `keys.ts` and `target.ts`
    - `isModifierKey` (Shift, Control, Alt, Meta) and case-insensitive `matchesTarget`
    - `pickTargetChar(previous, rng)` returns a `CHARSET` character different from the previous one
    - `randomPosition(arena, box, rng)` returns a position fully inside the arena, clamped to 0 when the arena is smaller than the box
    - _Requirements: 3.1, 3.2, 3.6, 4.2, 5.5_

  - [x] 2.3 Write property test for name sanitizing
    - File: `src/game/name.sanitize.property.test.ts`
    - **Property 1: Player name is limited to 16 characters**
    - **Validates: Requirements 1.3**

  - [x] 2.4 Write property test for start enablement
    - File: `src/game/name.canStart.property.test.ts`
    - **Property 2: Start is enabled only for a valid name and a selected level**
    - **Validates: Requirements 1.4, 1.5**

  - [x] 2.5 Write property test for target position
    - File: `src/game/target.position.property.test.ts`
    - **Property 3: Target position is fully inside the arena**
    - **Validates: Requirements 3.1**

  - [x] 2.6 Write property test for target character
    - File: `src/game/target.char.property.test.ts`
    - **Property 4: Target character is from the set and differs from the previous one**
    - **Validates: Requirements 3.2, 3.6**

- [x] 3. Implement the game reducer
  - [x] 3.1 Implement `reducer.ts`
    - `createInitialState(level, rng, arena, box)` with score 0, lives 3, full timer duration, epoch 0
    - `gameReducer` handling `KEY` and `TIMEOUT`: ignore repeats, modifiers, and input after `over`; correct key adds 10 and relocates; mistake removes a life and relocates while lives remain, otherwise sets `over`
    - Relocation sets a new position and character and increments `timerEpoch`
    - _Requirements: 2.2, 3.3, 3.4, 3.5, 4.2, 4.3, 5.1, 5.2, 5.3, 5.5, 5.6, 6.1_

  - [x] 3.2 Write property test for relocation
    - File: `src/game/reducer.relocate.property.test.ts`
    - **Property 5: Relocation restarts the timer**
    - **Validates: Requirements 3.4, 3.5, 4.3, 5.3**

  - [x] 3.3 Write property test for correct key scoring
    - File: `src/game/reducer.score.property.test.ts`
    - **Property 6: Correct key scores**
    - **Validates: Requirements 4.2**

  - [x] 3.4 Write property test for mistakes
    - File: `src/game/reducer.mistake.property.test.ts`
    - **Property 7: Mistakes cost one life**
    - **Validates: Requirements 5.1, 5.2**

  - [x] 3.5 Write property test for ignored inputs
    - File: `src/game/reducer.ignored.property.test.ts`
    - **Property 8: Ignored inputs are no-ops**
    - **Validates: Requirements 5.5, 5.6**

  - [x] 3.6 Write property test for game termination
    - File: `src/game/reducer.gameover.property.test.ts`
    - **Property 9: Game ends exactly when lives reach 0**
    - **Validates: Requirements 6.1**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement leaderboard persistence
  - [x] 5.1 Implement `src/storage/leaderboard.ts`
    - `parseLeaderboard` (validates shape, never throws), `serializeLeaderboard`, `loadLeaderboard` (never throws), `saveEntry` (assigns `seq`, returns `saved: false` when the write throws), `topFive` (score desc, ties by earlier `seq`)
    - Use the single fixed `STORAGE_KEY` and JSON storage
    - _Requirements: 6.4, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 5.2 Write property test for serialization round trip
    - File: `src/storage/leaderboard.roundtrip.property.test.ts`
    - **Property 10: Leaderboard serialization round trip**
    - **Validates: Requirements 8.3**

  - [x] 5.3 Write property test for malformed storage
    - File: `src/storage/leaderboard.malformed.property.test.ts`
    - **Property 11: Malformed storage yields an empty leaderboard without throwing**
    - **Validates: Requirements 8.4**

  - [x] 5.4 Write property test for top five ordering
    - File: `src/storage/leaderboard.topfive.property.test.ts`
    - **Property 12: Top five ordering**
    - **Validates: Requirements 7.3, 7.4**

  - [x] 5.5 Write unit tests for storage behavior
    - File: `src/storage/leaderboard.test.ts`
    - Fixed key used, throwing `setItem` returns `saved: false` with the in-memory list, throwing `getItem` yields an empty list
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 6. Implement the sound player
  - [x] 6.1 Implement `src/audio/SoundPlayer.ts`
    - Export `SoundName`, `SOUND_URLS` (`/sounds/correct.mp3`, `/sounds/wrong.mp3`, `/sounds/game-over.mp3`), and the `SoundPlayer` class with an injectable `createAudio` factory (defaults to `new Audio(src)`)
    - `preload()` creates and caches one `HTMLAudioElement` per file with `preload = 'auto'` and calls `load()`
    - `prime()` plays each element muted, then pauses, rewinds, and restores the muted state (called inside the START GAME click)
    - `play(name)` sets `currentTime = 0` and calls `play()`; plus `playCorrect`, `playWrong`, `playGameOver`
    - Wrap every public method and each file in try/catch, and swallow rejected `play()` promises (and `undefined` returns) so failures are silent no-ops
    - Use only `HTMLAudioElement`; no `AudioContext`, `OscillatorNode`, or `GainNode`
    - _Requirements: 4.4, 5.4, 6.2, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 6.2 Write property test for sound failure tolerance
    - File: `src/audio/SoundPlayer.failures.property.test.ts` (fake audio injected via `createAudio`)
    - **Property 13: Sound failures never break gameplay**
    - **Validates: Requirements 9.5**

  - [x] 6.3 Write property test for sound restart
    - File: `src/audio/SoundPlayer.restart.property.test.ts`
    - **Property 14: Playing a sound always restarts it**
    - **Validates: Requirements 9.4**

  - [x] 6.4 Write unit tests for SoundPlayer
    - File: `src/audio/SoundPlayer.test.ts`
    - `preload` creates elements for the three `/sounds/` URLs; `prime` plays and pauses each element; a source scan finds no `AudioContext`, `webkitAudioContext`, `OscillatorNode`, or `GainNode`
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 7. Implement the useGame hook
  - [x] 7.1 Implement `src/hooks/useGame.ts`
    - Create the initial state on mount and attach one `keydown` listener on `document`
    - Run a `setTimeout` keyed on `timerEpoch` that dispatches `TIMEOUT`; the cleanup clears it
    - Compare previous and next state to play sounds through `SoundPlayer`: score increase plays `correct`, any lives decrease plays `wrong`, and the transition to over plays `gameOver` (after `wrong`)
    - When `over` becomes true, clear the timer, remove the listener, and call `onGameOver(score)`
    - Clear the timer and remove the listener on unmount
    - _Requirements: 3.3, 3.5, 4.1, 4.4, 5.2, 5.4, 6.1, 6.2, 6.3, 10.4, 10.5_

  - [x] 7.2 Write unit tests for useGame
    - File: `src/hooks/useGame.test.tsx` (fake timers, mocked `SoundPlayer`)
    - Listener attached and removed on game over and on unmount, no timers remain after unmount
    - Timer durations of 3, 2, and 1 seconds per level; timeout costs a life
    - `playCorrect` on correct key, `playWrong` on mistake, `playGameOver` on game over
    - _Requirements: 3.3, 4.1, 4.4, 5.4, 6.2, 6.3, 10.4, 10.5_

- [x] 8. Build the UI and wire the app
  - [x] 8.1 Configure the cyberpunk theme
    - Extend `tailwind.config` with a neon palette and glow shadows; set a dark background and base styles in `src/index.css`
    - _Requirements: 1.7, 10.2_

  - [x] 8.2 Implement `WelcomeScreen`
    - Name input (`maxLength=16`, passed through `sanitizeName`), level radio group with no default selection, START GAME button with `disabled={!canStart(name, level)}`
    - Click handler calls `sound.prime()` (inside the user gesture) and then starts the game
    - Visible focus styles and accessible labels
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 9.3_

  - [x] 8.3 Implement `TopBar`, `TargetBox`, and `ArenaScreen`
    - `TopBar` shows name, score, and up to 3 life indicators
    - `TargetBox` is absolutely positioned at `state.position` with neon styling
    - `ArenaScreen` measures the arena with a ref, uses `useGame`, and passes the latest arena size for relocation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

  - [x] 8.4 Implement `Leaderboard` and `GameOverScreen`
    - Show final score, one slogan chosen once per mount, top 5 list with the current entry (by `seq`) highlighted, and a PLAY AGAIN button
    - Save the entry on display and still show the current round if the save fails
    - _Requirements: 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.2, 8.5_

  - [x] 8.5 Implement `App.tsx` and wire everything
    - Hold `phase`, `playerName`, `level`, and a shared `SoundPlayer`; call `sound.preload()` once when the Game loads
    - Welcome → Arena → GameOver → Welcome; PLAY AGAIN returns to Welcome with the name retained and level selection available
    - Mount the app from `src/main.tsx`
    - _Requirements: 1.1, 1.6, 6.1, 7.7, 7.8, 9.2, 10.5_

  - [x] 8.6 Write component and integration tests
    - File: `src/App.test.tsx` (React Testing Library, mocked `SoundPlayer` and `localStorage`)
    - Welcome screen on load with input, selector, and START GAME; arena starts at score 0 and 3 lives
    - Game over shows score, a slogan from the list, highlighted entry, and PLAY AGAIN returns to Welcome with the name retained
    - `SoundPlayer.preload` is called on load; START GAME calls `SoundPlayer.prime`
    - _Requirements: 1.1, 1.2, 1.6, 2.1, 2.2, 6.4, 7.1, 7.2, 7.5, 7.6, 7.7, 7.8, 9.2, 9.3_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (at least 100 iterations, tagged `Feature: cyberpunk-key-smasher, Property N: <title>`)
- Unit tests validate specific examples and edge cases
- The visual style (Requirement 1.7) requires manual review

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "5.1", "6.1", "8.1"] },
    {
      "id": 3,
      "tasks": [
        "2.3",
        "2.4",
        "2.5",
        "2.6",
        "3.1",
        "5.2",
        "5.3",
        "5.4",
        "5.5",
        "6.2",
        "6.3",
        "6.4"
      ]
    },
    {
      "id": 4,
      "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "7.1", "8.2", "8.4"]
    },
    { "id": 5, "tasks": ["7.2", "8.3"] },
    { "id": 6, "tasks": ["8.5"] },
    { "id": 7, "tasks": ["8.6"] }
  ]
}
```
