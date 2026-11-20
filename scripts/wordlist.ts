// Regras para montar o banco de palavras de 5 letras a partir dos arquivos do
// projeto https://github.com/fserb/pt-br.
//
// O arquivo "lexico" traz só a forma base de cada palavra (singular,
// masculino), então plurais como "gatos" e femininos como "lerda" não
// aparecem nele. As funções abaixo geram essas flexões por regra.

import { normalize } from "../src/utils/normalize.ts";

export const WORD_LENGTH = 5;

// Letras do alfabeto português (minúsculas). Exclui nomes próprios e
// estrangeirismos com grafia estranha ao teclado, como "aïoli" e "boîte".
const PORTUGUESE_WORD = /^[a-zçáàâãéêíóôõúü]+$/;
const DIACRITIC = /[áàâãéêíóôõúü]/;
const STRESSED_FINAL_S = /^(.*)([áéíóúê])s$/;
const FINAL_VOWEL = /[aeiouáéíóúâêôã]$/;

const UNACCENTED: Record<string, string> = {
  á: "a",
  é: "e",
  ê: "e",
  í: "i",
  ó: "o",
  ú: "u",
};

export type Plurals = {
  // Formas que seguem uma regra sem ambiguidade.
  regular: string[];
  // Formas possíveis, mas que só são aceitas se aparecerem no corpus (icf),
  // porque a regra admite mais de um resultado (ex.: "-ão" vira "-ãos",
  // "-ães" ou "-ões").
  needsCorpus: string[];
};

export type Sources = {
  lexicon: string[];
  conjugations: string[];
  // Pontuação ICF por palavra: quanto menor, mais comum.
  icf: Map<string, number>;
  blocked: Set<string>;
  // Palavras base que não têm plural nem feminino (advérbios, pronomes...).
  invariable: Set<string>;
};

export type WordLists = {
  lexicon: string[];
  conjugations: string[];
  inflections: string[];
};

export function letterCount(word: string): number {
  return [...word].length;
}

export function isPortugueseWord(word: string): boolean {
  return PORTUGUESE_WORD.test(word);
}

export function plurals(word: string): Plurals {
  if (word.endsWith("ão")) {
    const stem = word.slice(0, -2);
    return { regular: [], needsCorpus: [`${word}s`, `${stem}ães`, `${stem}ões`] };
  }
  if (FINAL_VOWEL.test(word)) return { regular: [`${word}s`], needsCorpus: [] };

  // Monossílabos tônicos em "s": mês -> meses, gás -> gases. Há exceções
  // ("nós", "vós"), por isso dependem do corpus.
  const stressed = word.match(STRESSED_FINAL_S);
  if (stressed) {
    const [, stem, vowel] = stressed;
    return { regular: [], needsCorpus: [`${stem}${UNACCENTED[vowel]}ses`] };
  }

  // Sem acento gráfico, palavras terminadas em r, z, m e l são oxítonas,
  // o que torna as regras abaixo seguras. Com acento, há exceções.
  if (DIACRITIC.test(word)) return { regular: [], needsCorpus: [] };

  const rules: [RegExp, string][] = [
    [/([rz])$/, "$1es"],
    [/m$/, "ns"],
    [/al$/, "ais"],
    [/el$/, "éis"],
    [/il$/, "is"],
    [/ol$/, "óis"],
    [/ul$/, "uis"],
  ];
  for (const [pattern, replacement] of rules) {
    if (pattern.test(word)) {
      return { regular: [word.replace(pattern, replacement)], needsCorpus: [] };
    }
  }
  return { regular: [], needsCorpus: [] };
}

export function feminine(word: string): string | null {
  if (!word.endsWith("o") || word.endsWith("ão")) return null;
  return `${word.slice(0, -1)}a`;
}

export function buildWordLists(sources: Sources): WordLists {
  const { icf, blocked, invariable } = sources;
  const accepts = (word: string) =>
    letterCount(word) === WORD_LENGTH && isPortugueseWord(word) && !blocked.has(word);

  const lemmas = sources.lexicon.filter(isPortugueseWord);
  const lexicon = new Set(lemmas.filter(accepts));
  const conjugations = new Set(sources.conjugations.filter(accepts));

  const inflections = new Set<string>();
  const add = (word: string) => {
    if (accepts(word)) inflections.add(word);
  };

  for (const lemma of lemmas) {
    if (invariable.has(lemma) || blocked.has(lemma)) continue;

    const { regular, needsCorpus } = plurals(lemma);
    regular.forEach(add);
    needsCorpus.filter((word) => icf.has(word)).forEach(add);

    // Nem todo substantivo em "-o" tem feminino ("carro" -> "carra"), então
    // o feminino só entra se ele ou seu plural aparecer no corpus.
    const female = feminine(lemma);
    if (female && (icf.has(female) || icf.has(`${female}s`))) {
      add(female);
      add(`${female}s`);
    }
  }

  // O teclado do jogo não tem acentos, então só uma grafia por palavra sem
  // acento pode ser exibida. Fica a mais comum no corpus; no empate, vale a
  // ordem léxico, conjugações, flexões.
  const frequency = (word: string) => icf.get(word) ?? Number.POSITIVE_INFINITY;
  const chosen = new Map<string, string>();
  for (const word of [...lexicon, ...conjugations, ...inflections]) {
    const key = normalize(word);
    const current = chosen.get(key);
    if (current === undefined || frequency(word) < frequency(current)) {
      chosen.set(key, word);
    }
  }
  const kept = new Set(chosen.values());

  const collator = new Intl.Collator("pt-BR");
  const sorted = (words: Iterable<string>) =>
    [...words].filter((word) => kept.has(word)).sort(collator.compare);

  return {
    lexicon: sorted(lexicon),
    conjugations: sorted(conjugations),
    inflections: sorted(
      [...inflections].filter((word) => !lexicon.has(word) && !conjugations.has(word)),
    ),
  };
}
