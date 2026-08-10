import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Keyboard } from "./components/Keyboard";
import { Toast } from "./components/Toast";
import { HelpModal } from "./components/HelpModal";
import { StatsModal } from "./components/StatsModal";
import { useGame } from "./hooks/useGame";

const LETTER_KEY_RE = /^[a-z]$/i;

export default function App() {
  const {
    mode,
    switchMode,
    startRandomGame,
    guesses,
    evaluations,
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
  } = useGame();

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
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <main className="flex min-h-0 flex-1 flex-col items-center justify-between gap-1 overflow-y-auto py-1">
        <Board
          guesses={guesses}
          evaluations={evaluations}
          currentLetters={currentLetters}
          cursor={cursor}
          isPlaying={status === "playing"}
          didWin={status === "won"}
          onTileClick={setCursorPosition}
          wordLength={wordLength}
          maxGuesses={maxGuesses}
          isShaking={isShaking}
        />

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

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      {isStatsOpen && <StatsModal stats={stats} onClose={() => setIsStatsOpen(false)} />}
    </div>
  );
}
