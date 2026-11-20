import { describe, expect, it } from "vitest";
import { buildWordLists, feminine, plurals, type Sources } from "./wordlist.ts";

function sources(overrides: Partial<Sources> = {}): Sources {
  return {
    lexicon: [],
    conjugations: [],
    icf: new Map(),
    blocked: new Set(),
    invariable: new Set(),
    ...overrides,
  };
}

describe("plurals", () => {
  it("acrescenta s às palavras terminadas em vogal", () => {
    expect(plurals("gato").regular).toEqual(["gatos"]);
    expect(plurals("café").regular).toEqual(["cafés"]);
    expect(plurals("irmã").regular).toEqual(["irmãs"]);
  });

  it("acrescenta es às palavras terminadas em r ou z", () => {
    expect(plurals("cor").regular).toEqual(["cores"]);
    expect(plurals("luz").regular).toEqual(["luzes"]);
  });

  it("troca m por ns", () => {
    expect(plurals("item").regular).toEqual(["itens"]);
  });

  it("flexiona as terminações em l", () => {
    expect(plurals("real").regular).toEqual(["reais"]);
    expect(plurals("anel").regular).toEqual(["anéis"]);
    expect(plurals("azul").regular).toEqual(["azuis"]);
    expect(plurals("lençol").regular).toEqual(["lençóis"]);
  });

  it("deixa os plurais ambíguos para o corpus decidir", () => {
    expect(plurals("leão")).toEqual({ regular: [], needsCorpus: ["leãos", "leães", "leões"] });
    expect(plurals("mês")).toEqual({ regular: [], needsCorpus: ["meses"] });
  });

  it("não gera plural para palavras com acento terminadas em consoante", () => {
    expect(plurals("túnel")).toEqual({ regular: [], needsCorpus: [] });
  });
});

describe("feminine", () => {
  it("troca o final o por a", () => {
    expect(feminine("lerdo")).toBe("lerda");
  });

  it("ignora palavras que não terminam em o", () => {
    expect(feminine("leão")).toBeNull();
    expect(feminine("casa")).toBeNull();
  });
});

describe("buildWordLists", () => {
  it("gera plurais de 5 letras a partir das palavras base", () => {
    const lists = buildWordLists(sources({ lexicon: ["gato", "pata", "rota", "casa"] }));
    expect(lists.inflections).toEqual(["casas", "gatos", "patas", "rotas"]);
  });

  it("só aceita o feminino quando ele ou seu plural está no corpus", () => {
    const lists = buildWordLists(
      sources({ lexicon: ["lerdo", "carro"], icf: new Map([["lerdas", 16.9]]) }),
    );
    expect(lists.inflections).toEqual(["lerda"]);
  });

  it("só aceita plurais ambíguos presentes no corpus", () => {
    const lists = buildWordLists(sources({ lexicon: ["leão"], icf: new Map([["leões", 11]]) }));
    expect(lists.inflections).toEqual(["leões"]);
  });

  it("não flexiona palavras invariáveis", () => {
    const lists = buildWordLists(sources({ lexicon: ["aqui"], invariable: new Set(["aqui"]) }));
    expect(lists.inflections).toEqual([]);
  });

  it("exclui palavras bloqueadas e as flexões delas", () => {
    const lists = buildWordLists(
      sources({ lexicon: ["merda", "puta"], blocked: new Set(["merda", "puta"]) }),
    );
    expect(lists).toEqual({ lexicon: [], conjugations: [], inflections: [] });
  });

  it("exclui nomes próprios e letras fora do alfabeto português", () => {
    const lists = buildWordLists(sources({ lexicon: ["Paulo", "aïoli", "pedra"] }));
    expect(lists.lexicon).toEqual(["pedra"]);
  });

  it("mantém só a grafia mais comum entre palavras iguais sem acento", () => {
    const lists = buildWordLists(
      sources({
        lexicon: ["carne", "carnê"],
        icf: new Map([
          ["carne", 9],
          ["carnê", 14],
        ]),
      }),
    );
    expect(lists.lexicon).toEqual(["carne"]);
  });

  it("não repete nas flexões palavras que já estão nas conjugações", () => {
    const lists = buildWordLists(sources({ lexicon: ["nada"], conjugations: ["nadas"] }));
    expect(lists.conjugations).toEqual(["nadas"]);
    expect(lists.inflections).toEqual([]);
  });
});
