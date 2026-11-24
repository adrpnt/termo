/** Mudança no banco de respostas, válida no modo diário a partir de `from`. */
export interface SolutionsChange {
  /** Primeiro dia em que a mudança vale (AAAA-MM-DD, horário de Brasília). */
  from: string;
  added?: string[];
  removed?: string[];
}

/**
 * Banco de respostas em vigor no dia `dayKey`: o banco base com as mudanças
 * que já valem nesse dia, na ordem em que foram registradas. Palavras
 * adicionadas entram no fim da lista, para não mexer na posição das demais.
 */
export function getSolutionsOn(
  base: readonly string[],
  changes: readonly SolutionsChange[],
  dayKey: string,
): string[] {
  let solutions = [...base];
  for (const change of changes) {
    if (change.from > dayKey) continue;
    const removed = new Set(change.removed ?? []);
    solutions = solutions.filter((word) => !removed.has(word));
    for (const word of change.added ?? []) {
      if (!solutions.includes(word)) solutions.push(word);
    }
  }
  return solutions;
}

/** Banco de respostas depois de aplicar todas as mudanças registradas. */
export function getLatestSolutions(
  base: readonly string[],
  changes: readonly SolutionsChange[],
): string[] {
  return getSolutionsOn(base, changes, "9999-12-31");
}
