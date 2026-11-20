import { ALL_WORDS } from "../data/words";
import { normalize } from "./normalize";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

// Mapa de "palavra sem acento" -> "palavra com a grafia correta".
// Permite validar tentativas digitadas sem acento e exibi-las já com os
// acentos preenchidos automaticamente.
// Quando duas grafias coincidem sem acento (ex.: "carne" e "carnê"), vale a
// primeira que aparece em ALL_WORDS, que lista as respostas antes das demais.
const dictionary = new Map<string, string>();
for (const word of ALL_WORDS) {
  const key = normalize(word);
  if (!dictionary.has(key)) dictionary.set(key, word);
}

export function isValidWord(input: string): boolean {
  return dictionary.has(normalize(input));
}

export function canonicalWord(input: string): string {
  return dictionary.get(normalize(input)) ?? input;
}
