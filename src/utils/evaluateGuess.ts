export type LetterStatus = "correct" | "present" | "absent";

/**
 * Compara uma tentativa normalizada (sem acento) com a solução normalizada,
 * seguindo o algoritmo clássico do Wordle/Termo, incluindo o tratamento
 * correto de letras repetidas.
 */
export function evaluateGuess(
  guessNormalized: string,
  solutionNormalized: string,
): LetterStatus[] {
  const length = solutionNormalized.length;
  const guessLetters = guessNormalized.split("");
  const solutionLetters = solutionNormalized.split("");
  const result: LetterStatus[] = new Array(length).fill("absent");
  const consumed = new Array(length).fill(false);

  // 1ª passada: letras na posição correta.
  for (let i = 0; i < length; i++) {
    if (guessLetters[i] === solutionLetters[i]) {
      result[i] = "correct";
      consumed[i] = true;
    }
  }

  // 2ª passada: letras que existem na palavra, em outra posição.
  for (let i = 0; i < length; i++) {
    if (result[i] === "correct") continue;
    const letter = guessLetters[i];
    const foundIndex = solutionLetters.findIndex(
      (solutionLetter, idx) => solutionLetter === letter && !consumed[idx],
    );
    if (foundIndex !== -1) {
      result[i] = "present";
      consumed[foundIndex] = true;
    }
  }

  return result;
}

/** Combina o status atual de uma letra do teclado com um novo status,
 * sem nunca rebaixar (correct > present > absent). */
export function mergeStatus(
  current: LetterStatus | undefined,
  next: LetterStatus,
): LetterStatus {
  const priority: Record<LetterStatus, number> = {
    absent: 0,
    present: 1,
    correct: 2,
  };
  if (!current) return next;
  return priority[next] > priority[current] ? next : current;
}
