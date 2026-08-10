import { SOLUTIONS } from "../data/words";

// Data de referência (dia 0 do desafio diário).
const EPOCH = new Date(2024, 0, 1);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Número de dias corridos desde a data de referência. */
export function getDayNumber(date: Date = new Date()): number {
  const start = startOfDay(EPOCH).getTime();
  const current = startOfDay(date).getTime();
  return Math.round((current - start) / 86_400_000);
}

/** Chave única do dia, usada para persistência (ex.: "2026-08-08"). */
export function getDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Índice determinístico da palavra do dia dentro do banco de soluções. */
export function getDailyWordIndex(date: Date = new Date()): number {
  const dayNumber = getDayNumber(date);
  return ((dayNumber % SOLUTIONS.length) + SOLUTIONS.length) % SOLUTIONS.length;
}

/** Palavra do dia (sempre a mesma para todos, no mesmo dia). */
export function getDailyWord(date: Date = new Date()): string {
  return SOLUTIONS[getDailyWordIndex(date)];
}

/** Palavra aleatória para o modo infinito. */
export function getRandomWord(exclude?: string): string {
  if (SOLUTIONS.length <= 1) return SOLUTIONS[0];
  let word = SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)];
  while (exclude && word === exclude) {
    word = SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)];
  }
  return word;
}
