import { describe, expect, it } from "vitest";
import { SOLUTIONS, SOLUTIONS_BASE, SOLUTIONS_CHANGES } from "../data/words";
import { getLatestSolutions, getSolutionsOn } from "./solutionsBank";

/** Hash FNV-1a de 32 bits, só para detectar alterações na lista. */
function fingerprint(words: readonly string[]): string {
  let hash = 0x811c9dc5;
  for (const char of words.join("\n")) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

describe("getSolutionsOn", () => {
  const base = ["carne", "praça", "mundo"];

  it("usa o banco base quando não há mudanças", () => {
    expect(getSolutionsOn(base, [], "2026-11-20")).toEqual(base);
  });

  it("ignora mudanças que ainda não valem no dia", () => {
    const changes = [{ from: "2026-11-21", added: ["livro"], removed: ["praça"] }];
    expect(getSolutionsOn(base, changes, "2026-11-20")).toEqual(base);
  });

  it("aplica a mudança a partir do dia registrado", () => {
    const changes = [{ from: "2026-11-21", added: ["livro"], removed: ["praça"] }];
    expect(getSolutionsOn(base, changes, "2026-11-21")).toEqual(["carne", "mundo", "livro"]);
    expect(getSolutionsOn(base, changes, "2026-12-01")).toEqual(["carne", "mundo", "livro"]);
  });

  it("aplica várias mudanças em ordem e não repete palavras", () => {
    const changes = [
      { from: "2026-11-21", added: ["livro"] },
      { from: "2026-11-25", added: ["livro", "tempo"], removed: ["carne"] },
    ];
    expect(getSolutionsOn(base, changes, "2026-11-25")).toEqual([
      "praça",
      "mundo",
      "livro",
      "tempo",
    ]);
  });

  it("não altera o banco base", () => {
    getSolutionsOn(base, [{ from: "2026-11-21", removed: ["carne"] }], "2026-11-21");
    expect(base).toEqual(["carne", "praça", "mundo"]);
  });
});

describe("getLatestSolutions", () => {
  it("aplica todas as mudanças, mesmo as futuras", () => {
    const changes = [{ from: "2099-01-01", added: ["livro"] }];
    expect(getLatestSolutions(["carne"], changes)).toEqual(["carne", "livro"]);
  });
});

describe("banco de respostas", () => {
  it("não altera o banco base, que define as palavras de dias já sorteados", () => {
    // Se este teste falhou, SOLUTIONS_BASE foi editado. Desfaça a edição e
    // registre a mudança em SOLUTIONS_CHANGES, com uma data posterior ao deploy.
    expect(SOLUTIONS_BASE).toHaveLength(231);
    expect(fingerprint(SOLUTIONS_BASE)).toBe("7d6dee85");
  });

  it("registra as mudanças em ordem cronológica e com datas válidas", () => {
    const dates = SOLUTIONS_CHANGES.map((change) => change.from);
    for (const date of dates) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(dates).toEqual([...dates].sort());
  });

  it("só adiciona palavras de 5 letras", () => {
    for (const change of SOLUTIONS_CHANGES) {
      for (const word of change.added ?? []) {
        expect(word).toMatch(/^\p{Ll}{5}$/u);
      }
    }
  });

  it("monta SOLUTIONS com todas as mudanças aplicadas", () => {
    expect(SOLUTIONS).toEqual(getLatestSolutions(SOLUTIONS_BASE, SOLUTIONS_CHANGES));
  });
});
