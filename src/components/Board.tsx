import { Tile } from "./Tile";
import type { LetterStatus } from "../types";

interface BoardProps {
  guesses: string[];
  evaluations: LetterStatus[][];
  currentLetters: string[];
  cursor: number;
  isPlaying: boolean;
  didWin: boolean;
  onTileClick: (index: number) => void;
  wordLength: number;
  maxGuesses: number;
  isShaking: boolean;
}

export function Board({
  guesses,
  evaluations,
  currentLetters,
  cursor,
  isPlaying,
  didWin,
  onTileClick,
  wordLength,
  maxGuesses,
  isShaking,
}: BoardProps) {
  const rows = Array.from({ length: maxGuesses }, (_, rowIndex) => {
    if (rowIndex < guesses.length) {
      const guess = guesses[rowIndex];
      const evaluation = evaluations[rowIndex];
      return { letters: guess.split(""), evaluation, isCurrent: false };
    }
    if (rowIndex === guesses.length) {
      return { letters: currentLetters, evaluation: null, isCurrent: true };
    }
    return {
      letters: new Array(wordLength).fill(""),
      evaluation: null,
      isCurrent: false,
    };
  });

  return (
    <div className="flex flex-col items-center gap-2 px-3 py-5">
      {rows.map((row, rowIndex) => {
        const isClickableRow = row.isCurrent && isPlaying;
        const isWinningRow = didWin && rowIndex === guesses.length - 1;
        return (
          <div
            key={rowIndex}
            className={`flex gap-2 ${row.isCurrent && isShaking ? "animate-shake" : ""} ${
              isWinningRow ? "animate-win" : ""
            }`}
            style={isWinningRow ? { animationDelay: "1.3s" } : undefined}
          >
            {row.letters.map((letter, colIndex) => (
              <Tile
                key={colIndex}
                letter={letter}
                status={row.evaluation ? row.evaluation[colIndex] : undefined}
                isActive={row.isCurrent}
                isFilled={letter !== ""}
                isCursor={isClickableRow && colIndex === cursor}
                isClickable={isClickableRow}
                onClick={() => onTileClick(colIndex)}
                revealDelayMs={colIndex * 250}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
