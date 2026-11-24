import { SOLUTIONS } from "../data/words";

// O dia do desafio segue o horário de Brasília para todos, independente do
// fuso do aparelho: assim quem joga de outro fuso recebe as mesmas palavras.
const DAILY_TIME_ZONE = "America/Sao_Paulo";

// Data de referência (dia 0 do desafio diário).
const EPOCH_UTC = Date.UTC(2024, 0, 1);

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DAILY_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

/** Ano, mês (1-12) e dia da data no fuso do desafio diário. */
function getDailyDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = dayFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Número de dias corridos desde a data de referência. */
export function getDayNumber(date: Date = new Date()): number {
  const { year, month, day } = getDailyDateParts(date);
  return Math.round((Date.UTC(year, month - 1, day) - EPOCH_UTC) / 86_400_000);
}

/** Chave única do dia, usada para persistência (ex.: "2026-08-08"). */
export function getDayKey(date: Date = new Date()): string {
  const { year, month, day } = getDailyDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
