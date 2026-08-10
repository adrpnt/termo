/**
 * Remove acentos e coloca em minúsculas, para permitir comparação de
 * palavras digitadas sem acento (o teclado do jogo não tem teclas
 * acentuadas) contra o banco de palavras, que mantém a grafia correta.
 */
export function normalize(word: string): string {
  return word
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase();
}
