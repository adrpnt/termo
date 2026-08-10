import { useCallback, useEffect, useState } from "react";
import { MAX_GUESSES } from "../utils/dictionary";

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  lastWinDayNumber: number | null;
  lastRecordedDayKey: string | null;
}

const STORAGE_KEY = "termo:stats";

function defaultStats(): Stats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: new Array(MAX_GUESSES).fill(0),
    lastWinDayNumber: null,
    lastRecordedDayKey: null,
  };
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return { ...defaultStats(), ...parsed };
  } catch {
    return defaultStats();
  }
}

function saveStats(stats: Stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage indisponível (modo privado, etc.) — ignora silenciosamente.
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(() => loadStats());

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const recordResult = useCallback(
    (params: {
      won: boolean;
      attempts: number;
      dayKey: string;
      dayNumber: number;
    }) => {
      setStats((prev) => {
        if (prev.lastRecordedDayKey === params.dayKey) {
          return prev;
        }

        const distribution = [...prev.distribution];
        let currentStreak = prev.currentStreak;
        let lastWinDayNumber = prev.lastWinDayNumber;

        if (params.won) {
          const index = Math.min(params.attempts, MAX_GUESSES) - 1;
          if (index >= 0 && index < distribution.length) {
            distribution[index] += 1;
          }
          currentStreak =
            lastWinDayNumber !== null && lastWinDayNumber === params.dayNumber - 1
              ? currentStreak + 1
              : 1;
          lastWinDayNumber = params.dayNumber;
        } else {
          currentStreak = 0;
        }

        return {
          played: prev.played + 1,
          wins: prev.wins + (params.won ? 1 : 0),
          currentStreak,
          maxStreak: Math.max(prev.maxStreak, currentStreak),
          distribution,
          lastWinDayNumber,
          lastRecordedDayKey: params.dayKey,
        };
      });
    },
    [],
  );

  return { stats, recordResult };
}
