import { ALL_WORDS } from "../data/words";
import { normalize } from "./normalize";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

// Mapa de "palavra sem acento" -> "palavra com a grafia correta".
// Permite validar tentativas digitadas sem acento e exibi-las já com os
// acentos preenchidos automaticamente.
const dictionary = new Map<string, string>();
for (const word of ALL_WORDS) {
  dictionary.set(normalize(word), word);
}

export function isValidWord(input: string): boolean {
  return dictionary.has(normalize(input));
}

export function canonicalWord(input: string): string {
  return dictionary.get(normalize(input)) ?? input;
}
