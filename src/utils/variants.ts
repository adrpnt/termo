import type { BoardCount } from "../types";
import { MAX_GUESSES } from "./dictionary";

export interface Variant {
  boardCount: BoardCount;
  maxGuesses: number;
  /** Prefixo das chaves do localStorage. O modo de 1 palavra mantém as
   * chaves originais ("termo:..."), para não perder progresso salvo. */
  storagePrefix: string;
}

export const VARIANTS: Record<BoardCount, Variant> = {
  1: { boardCount: 1, maxGuesses: MAX_GUESSES, storagePrefix: "termo" },
  2: { boardCount: 2, maxGuesses: 7, storagePrefix: "termo:2" },
  4: { boardCount: 4, maxGuesses: 9, storagePrefix: "termo:4" },
};

export const BOARD_COUNTS = Object.keys(VARIANTS).map(Number) as BoardCount[];

const BOARD_COUNT_STORAGE_KEY = "termo:boards";

function isBoardCount(value: number): value is BoardCount {
  return value in VARIANTS;
}

export function loadBoardCount(): BoardCount {
  try {
    const value = Number(localStorage.getItem(BOARD_COUNT_STORAGE_KEY));
    return isBoardCount(value) ? value : 1;
  } catch {
    return 1;
  }
}

export function saveBoardCount(boardCount: BoardCount) {
  try {
    localStorage.setItem(BOARD_COUNT_STORAGE_KEY, String(boardCount));
  } catch {
    // ignora se localStorage não estiver disponível
  }
}
