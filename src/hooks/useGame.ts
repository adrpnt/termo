import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { canonicalWord, isValidWord, WORD_LENGTH } from "../utils/dictionary";
import { getDailyWords, getDayKey, getDayNumber, getRandomWords } from "../utils/dailyWord";
import { getBoards, getGameStatus, getKeyboardStatuses } from "../utils/boards";
import type { Variant } from "../utils/variants";
import type { GameMode, GameStatus, ToastMessage, ToastType } from "../types";
import { useStats } from "./useStats";

interface GameState {
  solutions: string[];
  guesses: string[];
}

interface SavedGame extends GameState {
  status: GameStatus;
}

const MODE_STORAGE_KEY = "termo:mode";

function dailyStorageKey(variant: Variant, dayKey: string): string {
  return `${variant.storagePrefix}:daily:${dayKey}`;
}

function randomStorageKey(variant: Variant): string {
  return `${variant.storagePrefix}:random`;
}

function loadGame(key: string, variant: Variant): GameState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    // Partidas salvas antes do modo de várias palavras guardavam `solution`.
    const parsed = JSON.parse(raw) as Partial<SavedGame> & { solution?: string };
    const solutions = parsed.solutions ?? (parsed.solution ? [parsed.solution] : null);
    if (!solutions || solutions.length !== variant.boardCount) return null;
    return { solutions, guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [] };
  } catch {
    return null;
  }
}

function saveGame(key: string, game: SavedGame) {
  try {
    localStorage.setItem(key, JSON.stringify(game));
  } catch {
    // ignora se localStorage não estiver disponível
  }
}

function loadMode(): GameMode {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) === "random" ? "random" : "daily";
  } catch {
    return "daily";
  }
}

function saveMode(mode: GameMode) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // ignora se localStorage não estiver disponível
  }
}

function loadGameForMode(mode: GameMode, variant: Variant, today: Date): GameState {
  if (mode === "random") {
    return (
      loadGame(randomStorageKey(variant), variant) ?? {
        solutions: getRandomWords(variant.boardCount),
        guesses: [],
      }
    );
  }
  return (
    loadGame(dailyStorageKey(variant, getDayKey(today)), variant) ?? {
      solutions: getDailyWords(variant.boardCount, today),
      guesses: [],
    }
  );
}

export function useGame(variant: Variant) {
  const { boardCount, maxGuesses } = variant;
  const { stats, recordResult } = useStats(variant);
  const [mode, setMode] = useState<GameMode>(() => loadMode());

  // Um único instante de referência, para a chave salva e as palavras do dia
  // nunca caírem em dias diferentes perto da meia-noite.
  const today = useMemo(() => new Date(), []);
  const dayKey = useMemo(() => getDayKey(today), [today]);
  const dayNumber = useMemo(() => getDayNumber(today), [today]);

  const [game, setGame] = useState<GameState>(() =>
    loadGameForMode(loadMode(), variant, today),
  );
  const { solutions, guesses } = game;
  const [currentLetters, setCurrentLetters] = useState<string[]>(() =>
    new Array(WORD_LENGTH).fill(""),
  );
  const [cursor, setCursor] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);
  const shakeTimeoutRef = useRef<number | undefined>(undefined);

  const boards = useMemo(() => getBoards(solutions, guesses), [solutions, guesses]);
  const status = getGameStatus(boards, guesses.length, maxGuesses);
  const keyboardStatuses = useMemo(() => getKeyboardStatuses(boards), [boards]);

  const pushToast = useCallback((text: string, type: ToastType = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  const triggerShake = useCallback(() => {
    window.clearTimeout(shakeTimeoutRef.current);
    setIsShaking(true);
    shakeTimeoutRef.current = window.setTimeout(() => setIsShaking(false), 500);
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(shakeTimeoutRef.current);
  }, []);

  // Persiste a partida sempre que ela mudar, para não perder o progresso ao
  // sair e voltar. As soluções são salvas junto para o resultado não depender
  // de recalcular a palavra do dia: se o banco de palavras mudar de tamanho,
  // o índice do dia muda e a palavra recalculada pode não ser mais a mesma.
  useEffect(() => {
    const key =
      mode === "daily" ? dailyStorageKey(variant, dayKey) : randomStorageKey(variant);
    saveGame(key, { solutions, guesses, status });
  }, [mode, variant, dayKey, solutions, guesses, status]);

  const resetInput = useCallback(() => {
    setCurrentLetters(new Array(WORD_LENGTH).fill(""));
    setCursor(0);
  }, []);

  const startRandomGame = useCallback(() => {
    setGame((prev) => ({ solutions: getRandomWords(boardCount, prev.solutions), guesses: [] }));
    resetInput();
  }, [boardCount, resetInput]);

  const switchMode = useCallback(
    (nextMode: GameMode) => {
      setMode(nextMode);
      saveMode(nextMode);
      resetInput();
      setGame(loadGameForMode(nextMode, variant, today));
    },
    [variant, today, resetInput],
  );

  const setCursorPosition = useCallback(
    (index: number) => {
      if (status !== "playing") return;
      setCursor(Math.max(0, Math.min(index, WORD_LENGTH - 1)));
    },
    [status],
  );

  const addLetter = useCallback(
    (letter: string) => {
      if (status !== "playing") return;
      const value = letter.toLowerCase();
      setCurrentLetters((prev) => {
        const next = [...prev];
        next[cursor] = value;
        return next;
      });
      setCursor((prev) => Math.min(prev + 1, WORD_LENGTH - 1));
    },
    [status, cursor],
  );

  const deleteLetter = useCallback(() => {
    if (status !== "playing") return;
    if (currentLetters[cursor]) {
      setCurrentLetters((prev) => {
        const next = [...prev];
        next[cursor] = "";
        return next;
      });
      return;
    }
    if (cursor > 0) {
      const prevCursor = cursor - 1;
      setCurrentLetters((prev) => {
        const next = [...prev];
        next[prevCursor] = "";
        return next;
      });
      setCursor(prevCursor);
    }
  }, [status, cursor, currentLetters]);

  const submitGuess = useCallback(() => {
    if (status !== "playing") return;

    const currentGuess = currentLetters.join("");

    if (currentGuess.length < WORD_LENGTH) {
      pushToast("Letras insuficientes", "error");
      triggerShake();
      return;
    }

    if (!isValidWord(currentGuess)) {
      pushToast("Palavra não encontrada", "error");
      triggerShake();
      return;
    }

    const nextGuesses = [...guesses, canonicalWord(currentGuess)];
    setGame({ solutions, guesses: nextGuesses });
    resetInput();

    const nextBoards = getBoards(solutions, nextGuesses);
    const nextStatus = getGameStatus(nextBoards, nextGuesses.length, maxGuesses);
    const attempts = nextGuesses.length;

    if (nextStatus === "won") {
      pushToast(attempts === boardCount ? "Genial!" : "Parabéns!", "success");
      if (mode === "daily") {
        recordResult({ won: true, attempts, dayKey, dayNumber });
      }
    } else if (nextStatus === "lost") {
      const missed = nextBoards
        .filter((board) => !board.isSolved)
        .map((board) => board.solution.toUpperCase());
      pushToast(missed.join(" · "), "info");
      if (mode === "daily") {
        recordResult({ won: false, attempts, dayKey, dayNumber });
      }
    }
  }, [
    currentLetters,
    guesses,
    solutions,
    status,
    boardCount,
    maxGuesses,
    mode,
    dayKey,
    dayNumber,
    recordResult,
    pushToast,
    triggerShake,
    resetInput,
  ]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
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
    dismissToast,
    stats,
    wordLength: WORD_LENGTH,
    maxGuesses,
  };
}
