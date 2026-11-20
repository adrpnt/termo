import { useCallback, useEffect, useState } from "react";
import type { Variant } from "../utils/variants";

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  lastWinDayNumber: number | null;
  lastRecordedDayKey: string | null;
}

function defaultStats(maxGuesses: number): Stats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: new Array(maxGuesses).fill(0),
    lastWinDayNumber: null,
    lastRecordedDayKey: null,
  };
}

function statsStorageKey(variant: Variant): string {
  return `${variant.storagePrefix}:stats`;
}

function loadStats(variant: Variant): Stats {
  try {
    const raw = localStorage.getItem(statsStorageKey(variant));
    if (!raw) return defaultStats(variant.maxGuesses);
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return { ...defaultStats(variant.maxGuesses), ...parsed };
  } catch {
    return defaultStats(variant.maxGuesses);
  }
}

function saveStats(variant: Variant, stats: Stats) {
  try {
    localStorage.setItem(statsStorageKey(variant), JSON.stringify(stats));
  } catch {
    // localStorage indisponível (modo privado, etc.) — ignora silenciosamente.
  }
}

export function useStats(variant: Variant) {
  const { maxGuesses } = variant;
  const [stats, setStats] = useState<Stats>(() => loadStats(variant));

  useEffect(() => {
    saveStats(variant, stats);
  }, [variant, stats]);

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
          const index = Math.min(params.attempts, maxGuesses) - 1;
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
    [maxGuesses],
  );

  return { stats, recordResult };
}
