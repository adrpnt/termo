import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { canonicalWord, isValidWord, MAX_GUESSES, WORD_LENGTH } from "../utils/dictionary";
import { getDailyWord, getDayKey, getDayNumber, getRandomWord } from "../utils/dailyWord";
import { evaluateGuess, mergeStatus, type LetterStatus } from "../utils/evaluateGuess";
import { normalize } from "../utils/normalize";
import type { GameMode, GameStatus, ToastMessage, ToastType } from "../types";
import { useStats } from "./useStats";

interface DailyState {
  solution: string;
  guesses: string[];
  status: GameStatus;
}

interface RandomState {
  solution: string;
  guesses: string[];
  status: GameStatus;
}

const MODE_STORAGE_KEY = "termo:mode";
const RANDOM_STORAGE_KEY = "termo:random";

function dailyStorageKey(dayKey: string): string {
  return `termo:daily:${dayKey}`;
}

function loadDailyState(dayKey: string): DailyState | null {
  try {
    const raw = localStorage.getItem(dailyStorageKey(dayKey));
    if (!raw) return null;
    return JSON.parse(raw) as DailyState;
  } catch {
    return null;
  }
}

function saveDailyState(dayKey: string, state: DailyState) {
  try {
    localStorage.setItem(dailyStorageKey(dayKey), JSON.stringify(state));
  } catch {
    // ignora se localStorage não estiver disponível
  }
}

function loadRandomState(): RandomState | null {
  try {
    const raw = localStorage.getItem(RANDOM_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RandomState;
  } catch {
    return null;
  }
}

function saveRandomState(state: RandomState) {
  try {
    localStorage.setItem(RANDOM_STORAGE_KEY, JSON.stringify(state));
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

export function useGame() {
  const { stats, recordResult } = useStats();
  const [mode, setMode] = useState<GameMode>(() => loadMode());

  const dayKey = useMemo(() => getDayKey(), []);
  const dayNumber = useMemo(() => getDayNumber(), []);

  const [solution, setSolution] = useState<string>(() => {
    if (loadMode() === "random") {
      return loadRandomState()?.solution ?? getRandomWord();
    }
    return loadDailyState(dayKey)?.solution ?? getDailyWord();
  });
  const [guesses, setGuesses] = useState<string[]>(() => {
    if (loadMode() === "random") {
      return loadRandomState()?.guesses ?? [];
    }
    return loadDailyState(dayKey)?.guesses ?? [];
  });
  const [status, setStatus] = useState<GameStatus>(() => {
    if (loadMode() === "random") {
      return loadRandomState()?.status ?? "playing";
    }
    return loadDailyState(dayKey)?.status ?? "playing";
  });
  const [currentLetters, setCurrentLetters] = useState<string[]>(() =>
    new Array(WORD_LENGTH).fill(""),
  );
  const [cursor, setCursor] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);
  const shakeTimeoutRef = useRef<number | undefined>(undefined);

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

  // Persiste o estado do desafio diário sempre que ele mudar. A solução é
  // salva junto para o resultado (ex.: letras verdes) não depender de
  // recalcular getDailyWord() — se o banco de palavras mudar de tamanho,
  // o índice do dia muda e a palavra recalculada pode não ser mais a mesma.
  useEffect(() => {
    if (mode === "daily") {
      saveDailyState(dayKey, { solution, guesses, status });
    }
  }, [mode, dayKey, solution, guesses, status]);

  // Persiste o estado do modo infinito sempre que ele mudar, para não
  // perder o progresso ao sair e voltar para a tela.
  useEffect(() => {
    if (mode === "random") {
      saveRandomState({ solution, guesses, status });
    }
  }, [mode, solution, guesses, status]);

  const solutionNormalized = normalize(solution);

  const evaluations = useMemo(
    () => guesses.map((guess) => evaluateGuess(normalize(guess), solutionNormalized)),
    [guesses, solutionNormalized],
  );

  const keyboardStatuses = useMemo(() => {
    const map: Record<string, LetterStatus> = {};
    guesses.forEach((guess, rowIndex) => {
      const letters = normalize(guess).split("");
      const evaluation = evaluations[rowIndex];
      letters.forEach((letter, i) => {
        map[letter] = mergeStatus(map[letter], evaluation[i]);
      });
    });
    return map;
  }, [guesses, evaluations]);

  const resetInput = useCallback(() => {
    setCurrentLetters(new Array(WORD_LENGTH).fill(""));
    setCursor(0);
  }, []);

  const startRandomGame = useCallback(() => {
    setSolution((prev) => getRandomWord(prev));
    setGuesses([]);
    setStatus("playing");
    resetInput();
  }, [resetInput]);

  const switchMode = useCallback(
    (nextMode: GameMode) => {
      setMode(nextMode);
      saveMode(nextMode);
      resetInput();
      if (nextMode === "daily") {
        const saved = loadDailyState(dayKey);
        setSolution(saved?.solution ?? getDailyWord());
        setGuesses(saved?.guesses ?? []);
        setStatus(saved?.status ?? "playing");
      } else {
        const saved = loadRandomState();
        setSolution(saved?.solution ?? getRandomWord());
        setGuesses(saved?.guesses ?? []);
        setStatus(saved?.status ?? "playing");
      }
    },
    [dayKey, resetInput],
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

    const canonical = canonicalWord(currentGuess);
    const nextGuesses = [...guesses, canonical];
    setGuesses(nextGuesses);
    resetInput();

    const won = normalize(canonical) === solutionNormalized;
    const attempts = nextGuesses.length;

    if (won) {
      setStatus("won");
      pushToast(attempts === 1 ? "Genial!" : "Parabéns!", "success");
      if (mode === "daily") {
        recordResult({ won: true, attempts, dayKey, dayNumber });
      }
    } else if (attempts >= MAX_GUESSES) {
      setStatus("lost");
      pushToast(solution.toUpperCase(), "info");
      if (mode === "daily") {
        recordResult({ won: false, attempts, dayKey, dayNumber });
      }
    }
  }, [
    currentLetters,
    guesses,
    status,
    solution,
    solutionNormalized,
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
    solution,
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
    dismissToast,
    stats,
    wordLength: WORD_LENGTH,
    maxGuesses: MAX_GUESSES,
  };
}
