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

/** Gerador pseudoaleatório determinístico (mulberry32) a partir de uma semente. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Sorteia `count` palavras distintas do banco, fora das excluídas. */
function pickWords(count: number, random: () => number, exclude: string[]): string[] {
  const available = SOLUTIONS.filter((word) => !exclude.includes(word));
  const pool = available.length >= count ? available : [...SOLUTIONS];
  const picked: string[] = [];
  while (picked.length < count) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool[index]);
    pool.splice(index, 1);
  }
  return picked;
}

/**
 * Palavras do dia para uma partida com `count` tabuleiros. Com 1 tabuleiro é
 * a palavra do dia de sempre. Com mais, as palavras são sorteadas de forma
 * determinística pela data, todas diferentes entre si e da palavra do dia do
 * modo simples.
 */
export function getDailyWords(count: number, date: Date = new Date()): string[] {
  const dailyWord = getDailyWord(date);
  if (count === 1) return [dailyWord];
  const random = seededRandom(getDayNumber(date) * 1_000 + count);
  return pickWords(count, random, [dailyWord]);
}

/** Palavras aleatórias para o modo infinito, evitando repetir as da partida anterior. */
export function getRandomWords(count: number, exclude: string[] = []): string[] {
  return pickWords(count, Math.random, exclude);
}
