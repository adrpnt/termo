// Gera os arquivos de palavras aceitas (src/data/*Extra.ts) a partir do
// projeto https://github.com/fserb/pt-br (MIT License).
//
// Uso: npm run build:words
//
// Os arquivos de origem são baixados uma vez para .cache/pt-br/ e fixados em
// um commit, para que a geração seja reproduzível.

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildWordLists } from "./wordlist.ts";

const SOURCE_COMMIT = "93ba2a6f3b2f85262fba72df09d448c6bb2fa50a";
const SOURCE_URL = `https://raw.githubusercontent.com/fserb/pt-br/${SOURCE_COMMIT}`;

const root = path.resolve(import.meta.dirname, "..");
const cacheDir = path.join(root, ".cache", "pt-br", SOURCE_COMMIT);
const dataDir = path.join(root, "src", "data");

// Termos ofensivos/vulgares excluídos das palavras aceitas. Uma palavra base
// bloqueada (ex.: "puta") também bloqueia as flexões geradas a partir dela.
const BLOCKED = [
  "bicha", "bixa", "cagai", "cagam", "cagão", "cagar", "cagas", "cagoã", "cagou", "cague",
  "foda", "foder", "gozai", "gozam", "gozar", "gozas", "gozei", "gozem", "gozes", "gozou",
  "merda", "picas", "piças", "porra", "porro", "porró", "puta", "putal", "puto", "putto",
  "trepa", "trepe", "trepo", "veada", "veado", "viado", "xana", "xota",
];

// Palavras base sem plural nem feminino, que as regras de flexão
// transformariam em formas inexistentes ("aquis", "quens").
const INVARIABLE = [
  "algo", "aqui", "cada", "cedo", "cima", "como", "dela", "dele", "hoje", "indo",
  "isso", "isto", "nela", "nele", "onde", "quem", "tudo",
];

async function readSource(name: string): Promise<string[]> {
  const file = path.join(cacheDir, name);
  if (!existsSync(file)) {
    const response = await fetch(`${SOURCE_URL}/${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error(`Falha ao baixar "${name}": HTTP ${response.status}`);
    }
    await mkdir(cacheDir, { recursive: true });
    await writeFile(file, await response.text());
  }
  const content = await readFile(file, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim().normalize("NFC"))
    .filter(Boolean);
}

function readIcf(lines: string[]): Map<string, number> {
  const icf = new Map<string, number>();
  for (const line of lines) {
    const [word, score] = line.split(",");
    icf.set(word, Number(score));
  }
  return icf;
}

function formatList(header: string, name: string, words: string[]): string {
  const rows: string[] = [];
  for (let i = 0; i < words.length; i += 10) {
    const row = words.slice(i, i + 10).map((word) => `"${word}"`);
    rows.push(`  ${row.join(", ")},`);
  }
  return `${header}\n\nexport const ${name}: string[] = [\n${rows.join("\n")}\n];\n`;
}

const HEADER_NOTE = "Arquivo gerado por scripts/build-words.ts, não edite à mão.";

const LEXICON_HEADER = `// Palavras de 5 letras extraídas do léxico de português (pt-BR) do projeto
// https://github.com/fserb/pt-br (MIT License), filtradas para excluir
// termos ofensivos/vulgares. Usadas como tentativas aceitas (não são
// sorteadas como resposta, pois incluem termos raros ou pouco comuns).
// ${HEADER_NOTE}`;

const CONJUGATIONS_HEADER = `// Formas verbais conjugadas de 5 letras extraídas do arquivo de conjugações do
// projeto https://github.com/fserb/pt-br (MIT License), filtradas para excluir
// termos ofensivos/vulgares. Usadas como tentativas aceitas (não são sorteadas
// como resposta, pois muitas são formas verbais pouco naturais como resposta
// de um jogo de palavras).
// ${HEADER_NOTE}`;

const INFLECTIONS_HEADER = `// Plurais e femininos de 5 letras gerados por regra a partir do léxico do
// projeto https://github.com/fserb/pt-br (MIT License), que só traz a forma
// base das palavras (ex.: "gato", mas não "gatos"). Femininos e plurais
// ambíguos só entram se aparecerem no corpus (arquivo "icf"). Usadas como
// tentativas aceitas, nunca como resposta.
// ${HEADER_NOTE}`;

async function main() {
  const [lexicon, conjugations, icfLines] = await Promise.all([
    readSource("lexico"),
    readSource("conjugações"),
    readSource("icf"),
  ]);

  const lists = buildWordLists({
    lexicon,
    conjugations,
    icf: readIcf(icfLines),
    blocked: new Set(BLOCKED),
    invariable: new Set(INVARIABLE),
  });

  await Promise.all([
    writeFile(
      path.join(dataDir, "lexicoExtra.ts"),
      formatList(LEXICON_HEADER, "LEXICO_EXTRA", lists.lexicon),
    ),
    writeFile(
      path.join(dataDir, "conjugacoesExtra.ts"),
      formatList(CONJUGATIONS_HEADER, "CONJUGACOES_EXTRA", lists.conjugations),
    ),
    writeFile(
      path.join(dataDir, "flexoesExtra.ts"),
      formatList(INFLECTIONS_HEADER, "FLEXOES_EXTRA", lists.inflections),
    ),
  ]);

  console.log(
    `léxico: ${lists.lexicon.length}, conjugações: ${lists.conjugations.length}, ` +
      `flexões: ${lists.inflections.length}`,
  );
}

await main();
