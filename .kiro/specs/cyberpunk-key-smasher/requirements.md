# Requirements Document

## Introduction

Cyberpunk Key Smasher is a single-page browser game built with Vite, React, TypeScript and Tailwind CSS. The player registers a name, picks a difficulty level, and then presses the keyboard key shown inside a neon target box that appears at random positions in an arena. Correct presses earn points, while wrong presses and timeouts cost lives. The game ends after three mistakes, and the final score is stored in a localStorage leaderboard. All sound effects are played from user-provided mp3 files located in `public/sounds/` and served by Vite at `/sounds/...`, with no Web Audio API synthesis.

## Glossary

- **Game**: The Cyberpunk Key Smasher single-page application.
- **Welcome_Screen**: The screen where the player enters a name, selects a level, and starts the game.
- **Arena_Screen**: The screen where gameplay takes place.
- **Game_Over_Screen**: The screen shown after the player loses all lives.
- **Player_Name**: The text the player enters on the Welcome_Screen.
- **Level**: A difficulty setting. Easy has a 3-second Target_Timer, Medium has a 2-second Target_Timer, and Hard has a 1-second Target_Timer.
- **Target_Box**: The neon-styled box displayed in the Arena_Screen that contains the Target_Character.
- **Target_Character**: A single character randomly chosen from A-Z, 0-9, and symbols. The symbol set is: ! @ # $ % & \* ? + - = / < > ( ) [ ] { } ; : , . \_ ~ ^ |
- **Target_Timer**: The countdown, in seconds, allowed for the player to press the Target_Character, determined by the selected Level.
- **Score**: The integer points total for the current round, starting at 0.
- **Lives**: The remaining mistakes allowed in the current round, starting at 3.
- **Mistake**: A wrong key press or a Target_Timer expiry.
- **Modifier_Key**: Any of Shift, Control, Alt, or Meta.
- **Top_Bar**: The header of the Arena_Screen showing Player_Name, Score, and Lives.
- **Sound_Player**: The module that plays mp3 files using HTMLAudioElement.
- **Sound_Files**: The three mp3 files served from `/sounds/`: `correct.mp3` (correct key press), `wrong.mp3` (Mistake), and `game-over.mp3` (Game_Over_Screen displayed). The source files are `public/sounds/correct.mp3`, `public/sounds/wrong.mp3`, and `public/sounds/game-over.mp3`.
- **Leaderboard**: The list of saved score entries persisted in localStorage.
- **Leaderboard_Entry**: A record containing Player_Name, Score, and Level.
- **Slogan**: A short encouraging cyberpunk-themed message shown on the Game_Over_Screen.

## Requirements

### Requirement 1: Welcome and Registration

**User Story:** As a player, I want to enter my name and choose a difficulty on a welcome screen, so that I can start a game tailored to my skill.

#### Acceptance Criteria

1. WHEN the Game loads, THE Game SHALL display the Welcome_Screen.
2. THE Welcome_Screen SHALL provide a text input for the Player_Name, a selector offering Easy, Medium, and Hard Levels, and a START GAME button.
3. THE Welcome_Screen SHALL limit the Player_Name input to 16 characters.
4. IF the Player_Name is empty or contains only whitespace, THEN THE Welcome_Screen SHALL disable the START GAME button.
5. IF no Level is selected, THEN THE Welcome_Screen SHALL disable the START GAME button.
6. WHEN the player activates the START GAME button with a valid Player_Name and a selected Level, THE Game SHALL display the Arena_Screen.
7. THE Welcome_Screen SHALL present a cyberpunk visual style using neon colors on a dark background.

### Requirement 2: Arena Status Bar

**User Story:** As a player, I want to see my status at the top of the arena, so that I can track my progress.

#### Acceptance Criteria

1. THE Top_Bar SHALL display the Player_Name, the Score, and the Lives.
2. WHEN the Arena_Screen is displayed at the start of a round, THE Game SHALL set the Score to 0 and the Lives to 3.
3. WHEN the Score changes, THE Top_Bar SHALL display the updated Score.
4. WHEN the Lives change, THE Top_Bar SHALL display the updated Lives as a count of 3 or fewer life indicators.

### Requirement 3: Target Box

**User Story:** As a player, I want a target box with a random character at a random position, so that each press is a fresh challenge.

#### Acceptance Criteria

1. WHEN the Arena_Screen is displayed, THE Game SHALL display the Target_Box at a random position fully inside the arena area below the Top_Bar.
2. WHEN the Target_Box is displayed, THE Game SHALL show a randomly chosen Target_Character in neon styling inside the Target_Box.
3. WHEN the Target_Box is displayed, THE Game SHALL start the Target_Timer for the selected Level.
4. WHEN the Target_Box is relocated, THE Game SHALL choose a new random position and a new random Target_Character.
5. WHEN the Target_Box is relocated, THE Game SHALL restart the Target_Timer from the full duration of the selected Level.
6. WHEN the Target_Box is relocated, THE Game SHALL choose a Target_Character different from the previous Target_Character.

### Requirement 4: Correct Key Handling

**User Story:** As a player, I want correct key presses to be rewarded, so that I feel progress and excitement.

#### Acceptance Criteria

1. WHILE the Arena_Screen is displayed, THE Game SHALL listen for global keydown events on the document.
2. WHEN a keydown event key matches the Target_Character, ignoring letter case, THE Game SHALL increase the Score by 10.
3. WHEN a keydown event key matches the Target_Character, THE Game SHALL relocate the Target_Box immediately.
4. WHEN a keydown event key matches the Target_Character, THE Sound_Player SHALL play `correct.mp3`.

### Requirement 5: Mistake Handling

**User Story:** As a player, I want wrong presses and timeouts to cost lives, so that the game has meaningful challenge.

#### Acceptance Criteria

1. WHEN a keydown event key does not match the Target_Character, ignoring letter case, and is not a Modifier_Key, THE Game SHALL decrease the Lives by 1.
2. WHEN the Target_Timer expires, THE Game SHALL decrease the Lives by 1.
3. WHEN a Mistake occurs and Lives remain above 0, THE Game SHALL relocate the Target_Box immediately.
4. WHEN a Mistake occurs, THE Sound_Player SHALL play `wrong.mp3`.
5. WHEN a keydown event key is a Modifier_Key pressed alone, THE Game SHALL leave the Score, the Lives, and the Target_Timer unchanged.
6. WHEN a keydown event has the repeat flag set, THE Game SHALL leave the Score, the Lives, and the Target_Timer unchanged.

### Requirement 6: Game Termination

**User Story:** As a player, I want the game to end after three mistakes, so that each round has a clear conclusion.

#### Acceptance Criteria

1. WHEN the Lives reach 0, THE Game SHALL stop the Target_Timer and display the Game_Over_Screen.
2. WHEN the Game_Over_Screen is displayed, THE Sound_Player SHALL play `game-over.mp3`.
3. WHEN the Game transitions to the Game_Over_Screen, THE Game SHALL remove the global keydown listener.
4. WHEN the Game_Over_Screen is displayed, THE Game SHALL save a Leaderboard_Entry for the finished round.

### Requirement 7: Game Over Presentation

**User Story:** As a player, I want to see my final result and an encouraging message, so that I stay motivated to play again.

#### Acceptance Criteria

1. THE Game_Over_Screen SHALL display the final Score.
2. THE Game_Over_Screen SHALL display one Slogan selected randomly from a list of at least 5 encouraging cyberpunk-themed Slogans.
3. THE Game_Over_Screen SHALL display the Top 5 Leaderboard_Entries sorted by Score in descending order.
4. WHEN two Leaderboard_Entries have equal Score, THE Game_Over_Screen SHALL list the earlier saved entry first.
5. WHERE the current round's Leaderboard_Entry is within the Top 5, THE Game_Over_Screen SHALL visually highlight that entry.
6. THE Game_Over_Screen SHALL provide a PLAY AGAIN button.
7. WHEN the player activates the PLAY AGAIN button, THE Game SHALL display the Welcome_Screen with the level selection available.
8. WHEN the Welcome_Screen is displayed after PLAY AGAIN, THE Welcome_Screen SHALL retain the previously entered Player_Name.

### Requirement 8: Leaderboard Persistence

**User Story:** As a player, I want my scores to persist between sessions, so that I can compete against my past results.

#### Acceptance Criteria

1. WHEN a Leaderboard_Entry is saved, THE Game SHALL write the Leaderboard to localStorage under a single fixed key.
2. WHEN the Game_Over_Screen is displayed, THE Game SHALL read the Leaderboard from localStorage.
3. THE Game SHALL store the Leaderboard in localStorage as JSON.
4. IF the localStorage data is missing, malformed, or unreadable, THEN THE Game SHALL treat the Leaderboard as empty and continue operation.
5. IF writing to localStorage fails, THEN THE Game SHALL display the current round's result on the Game_Over_Screen and continue operation.

### Requirement 9: Audio Playback

**User Story:** As a player, I want sound effects from mp3 files, so that the game feels immersive with audio of my choosing.

#### Acceptance Criteria

1. THE Sound_Player SHALL play every sound from the Sound_Files using HTMLAudioElement, without Web Audio API synthesis.
2. WHEN the Game loads, THE Sound_Player SHALL preload each of the Sound_Files.
3. WHEN the player activates the START GAME button, THE Sound_Player SHALL prime audio playback for each of the Sound_Files within that user gesture.
4. WHEN the Sound_Player is asked to play a sound that is still playing, THE Sound_Player SHALL rewind that sound to its start and play it again.
5. IF a Sound_File is missing, autoplay is blocked, or a playback error occurs, THEN THE Game SHALL continue gameplay without sound.

### Requirement 10: Technical Foundation

**User Story:** As a developer, I want a defined technical foundation, so that the project is maintainable and runs as a single-page app.

#### Acceptance Criteria

1. THE Game SHALL be implemented as a single-page application using Vite, React, and TypeScript.
2. THE Game SHALL use Tailwind CSS for styling.
3. THE Game SHALL operate entirely in the browser without a backend service, reading only static mp3 assets from `/sounds/`.
4. WHEN the Arena_Screen is unmounted, THE Game SHALL clear all active timers and remove all keydown listeners.
5. WHILE the Welcome_Screen or the Game_Over_Screen is displayed, THE Game SHALL leave the global keydown listener for gameplay detached.
