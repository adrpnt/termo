import type { GameStatus } from "../types";
import { evaluateGuess, mergeStatus, type LetterStatus } from "./evaluateGuess";
import { normalize } from "./normalize";

export interface BoardState {
  solution: string;
  /** Tentativas exibidas neste tabuleiro: todas, ou só até a que acertou a
   * palavra, já que um tabuleiro resolvido para de receber tentativas. */
  guesses: string[];
  evaluations: LetterStatus[][];
  isSolved: boolean;
}

export function getBoards(solutions: string[], guesses: string[]): BoardState[] {
  return solutions.map((solution) => {
    const target = normalize(solution);
    const solvedIndex = guesses.findIndex((guess) => normalize(guess) === target);
    const rows = solvedIndex === -1 ? guesses : guesses.slice(0, solvedIndex + 1);
    return {
      solution,
      guesses: rows,
      evaluations: rows.map((guess) => evaluateGuess(normalize(guess), target)),
      isSolved: solvedIndex !== -1,
    };
  });
}

export function getGameStatus(
  boards: BoardState[],
  guessCount: number,
  maxGuesses: number,
): GameStatus {
  if (boards.every((board) => board.isSolved)) return "won";
  return guessCount >= maxGuesses ? "lost" : "playing";
}

/** Status de cada letra do teclado, separado por tabuleiro. */
export function getKeyboardStatuses(boards: BoardState[]): Record<string, LetterStatus>[] {
  return boards.map((board) => {
    const map: Record<string, LetterStatus> = {};
    board.guesses.forEach((guess, rowIndex) => {
      normalize(guess)
        .split("")
        .forEach((letter, i) => {
          map[letter] = mergeStatus(map[letter], board.evaluations[rowIndex][i]);
        });
    });
    return map;
  });
}
