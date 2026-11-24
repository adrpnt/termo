import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Board } from "./Board";
import type { TileSize } from "./Tile";
import { Keyboard } from "./Keyboard";
import { Toast } from "./Toast";
import { HelpModal } from "./HelpModal";
import { StatsModal } from "./StatsModal";
import { useGame } from "../hooks/useGame";
import type { BoardCount } from "../types";
import type { Variant } from "../utils/variants";
import type { Theme } from "../utils/theme";

const LETTER_KEY_RE = /^[a-z]$/i;

const tileSizes: Record<BoardCount, TileSize> = { 1: "lg", 2: "md", 4: "sm" };

// Com 4 palavras os quadros ficam em grade 2x2 até o breakpoint lg e em uma
// linha a partir dele. O Keyboard divide as teclas seguindo a mesma regra.
const boardsLayout: Record<BoardCount, string> = {
  1: "flex items-center justify-center",
  2: "flex items-center justify-center gap-[max(0.75rem,2.5vw)]",
  4: "grid grid-cols-2 place-content-center gap-x-[max(0.75rem,2.5vw)] gap-y-[1.5dvh] lg:grid-cols-4 lg:gap-x-[2vw]",
};

interface GameProps {
  variant: Variant;
  onChangeBoardCount: (boardCount: BoardCount) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Game({ variant, onChangeBoardCount, theme, onToggleTheme }: GameProps) {
  const { boardCount } = variant;
  const {
    mode,
    switchMode,
    startRandomGame,
    boards,
    currentLetters,
    cursor,
    setCursorPosition,
    status,
    keyboardStatuses,
    addLetter,
    deleteLetter,
    submitGuess,
    isShaking,
    toasts,
    stats,
    wordLength,
    maxGuesses,
  } = useGame(variant);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Enter") {
        submitGuess();
        return;
      }
      if (event.key === "Backspace") {
        deleteLetter();
        return;
      }
      if (event.key === "ArrowLeft") {
        setCursorPosition(cursor - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        setCursorPosition(cursor + 1);
        return;
      }
      if (LETTER_KEY_RE.test(event.key)) {
        addLetter(event.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addLetter, deleteLetter, submitGuess, setCursorPosition, cursor]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header
        mode={mode}
        onSwitchMode={switchMode}
        boardCount={boardCount}
        onChangeBoardCount={onChangeBoardCount}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <main className="flex min-h-0 flex-1 flex-col items-center justify-between gap-1 overflow-y-auto py-1">
        <div className={`flex-1 px-2 py-2 sm:px-3 ${boardsLayout[boardCount]}`}>
          {boards.map((board, index) => (
            <Board
              key={index}
              guesses={board.guesses}
              evaluations={board.evaluations}
              currentLetters={currentLetters}
              cursor={cursor}
              isPlaying={status === "playing" && !board.isSolved}
              isSolved={board.isSolved}
              onTileClick={setCursorPosition}
              wordLength={wordLength}
              maxGuesses={maxGuesses}
              isShaking={isShaking}
              size={tileSizes[boardCount]}
            />
          ))}
        </div>

        {mode === "random" && status !== "playing" && (
          <button
            type="button"
            onClick={startRandomGame}
            className="flex shrink-0 items-center gap-2 rounded-full bg-(--color-correct) px-6 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-(--shadow-sm) transition-all hover:brightness-110 active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M16.5 10a6.5 6.5 0 1 1-2.1-4.8M16.5 3v4h-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Jogar novamente
          </button>
        )}

        <Keyboard
          statuses={keyboardStatuses}
          onKey={addLetter}
          onEnter={submitGuess}
          onBackspace={deleteLetter}
        />
      </main>

      <Toast toasts={toasts} />

      {isHelpOpen && (
        <HelpModal
          boardCount={boardCount}
          maxGuesses={maxGuesses}
          onClose={() => setIsHelpOpen(false)}
        />
      )}
      {isStatsOpen && (
        <StatsModal
          stats={stats}
          boardCount={boardCount}
          onClose={() => setIsStatsOpen(false)}
        />
      )}
    </div>
  );
}
