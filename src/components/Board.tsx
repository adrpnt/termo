import { Tile, type TileSize } from "./Tile";
import type { LetterStatus } from "../types";

interface BoardProps {
  guesses: string[];
  evaluations: LetterStatus[][];
  currentLetters: string[];
  cursor: number;
  /** Se este tabuleiro ainda recebe tentativas (partida em andamento e
   * palavra ainda não descoberta). */
  isPlaying: boolean;
  isSolved: boolean;
  onTileClick: (index: number) => void;
  wordLength: number;
  maxGuesses: number;
  isShaking: boolean;
  size?: TileSize;
}

const gapClasses: Record<TileSize, string> = {
  lg: "gap-[1.1dvh]",
  md: "gap-[min(0.8dvh,1.2vw)]",
  sm: "gap-[min(0.45dvh,1vw)] lg:gap-[min(0.7dvh,0.5vw)]",
};

export function Board({
  guesses,
  evaluations,
  currentLetters,
  cursor,
  isPlaying,
  isSolved,
  onTileClick,
  wordLength,
  maxGuesses,
  isShaking,
  size = "lg",
}: BoardProps) {
  const rows = Array.from({ length: maxGuesses }, (_, rowIndex) => {
    if (rowIndex < guesses.length) {
      const guess = guesses[rowIndex];
      const evaluation = evaluations[rowIndex];
      return { letters: guess.split(""), evaluation, isCurrent: false };
    }
    if (rowIndex === guesses.length && isPlaying) {
      return { letters: currentLetters, evaluation: null, isCurrent: true };
    }
    return {
      letters: new Array(wordLength).fill(""),
      evaluation: null,
      isCurrent: false,
    };
  });

  const gap = gapClasses[size];

  return (
    <div className={`flex flex-col ${gap}`}>
      {rows.map((row, rowIndex) => {
        const isWinningRow = isSolved && rowIndex === guesses.length - 1;
        return (
          <div
            key={rowIndex}
            className={`flex ${gap} ${row.isCurrent && isShaking ? "animate-shake" : ""} ${
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
                isCursor={row.isCurrent && colIndex === cursor}
                isClickable={row.isCurrent}
                onClick={() => onTileClick(colIndex)}
                revealDelayMs={colIndex * 250}
                size={size}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
