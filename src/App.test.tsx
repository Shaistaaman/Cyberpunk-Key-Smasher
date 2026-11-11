import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  preload: vi.fn(),
  prime: vi.fn(),
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
  playGameOver: vi.fn(),
}));

vi.mock("./audio/SoundPlayer", () => ({
  SoundPlayer: class {
    preload = mocks.preload;
    prime = mocks.prime;
    playCorrect = mocks.playCorrect;
    playWrong = mocks.playWrong;
    playGameOver = mocks.playGameOver;
  },
}));

import App from "./App";
import { SLOGANS } from "./game/constants";

const WRONG_KEY = "€"; // never in CHARSET

function press(key: string) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });
}

function startGame(name = "NEO", level = /easy/i) {
  fireEvent.change(screen.getByLabelText(/player name/i), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("radio", { name: level }));
  fireEvent.click(screen.getByRole("button", { name: /start game/i }));
}

function loseAllLives() {
  for (let i = 0; i < 3; i++) press(WRONG_KEY);
}

describe("App", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((m) => m.mockClear());
    localStorage.clear();
  });

  it("shows the Welcome screen on load with input, selector and START GAME", () => {
    render(<App />);
    expect(screen.getByLabelText(/player name/i)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    const start = screen.getByRole("button", { name: /start game/i });
    expect(start).toBeInTheDocument();
    expect(start).toBeDisabled();
  });

  it("preloads sounds on load", () => {
    render(<App />);
    expect(mocks.preload).toHaveBeenCalled();
  });

  it("START GAME primes the sound player and enters the arena", () => {
    render(<App />);
    expect(mocks.prime).not.toHaveBeenCalled();
    startGame();
    expect(mocks.prime).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("arena")).toBeInTheDocument();
    expect(screen.getByTestId("target-box")).toBeInTheDocument();
  });

  it("starts the arena at score 0 with 3 lives", () => {
    render(<App />);
    startGame();
    expect(screen.getByTestId("score")).toHaveTextContent("0");
    expect(screen.getAllByTestId("life")).toHaveLength(3);
  });

  it("scores and loses lives during play", () => {
    render(<App />);
    startGame();
    press(screen.getByTestId("target-box").textContent!.trim());
    expect(screen.getByTestId("score")).toHaveTextContent("10");
    press(WRONG_KEY);
    expect(screen.getAllByTestId("life")).toHaveLength(2);
  });

  it("game over shows score, a slogan, and a highlighted entry", () => {
    render(<App />);
    startGame("NEO");
    press(screen.getByTestId("target-box").textContent!.trim());
    loseAllLives();

    expect(screen.getByTestId("final-score")).toHaveTextContent("10");
    expect(SLOGANS).toContain(screen.getByTestId("slogan").textContent);
    const current = document.querySelector('[data-current="true"]');
    expect(current).not.toBeNull();
    expect(current).toHaveTextContent("NEO");
    expect(current).toHaveTextContent("10");
    expect(mocks.playGameOver).toHaveBeenCalledTimes(1);
  });

  it("PLAY AGAIN returns to Welcome with the name retained", () => {
    render(<App />);
    startGame("NEO");
    loseAllLives();
    fireEvent.click(screen.getByRole("button", { name: /play again/i }));

    expect(screen.getByRole("button", { name: /start game/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/player name/i)).toHaveValue("NEO");
  });
});
