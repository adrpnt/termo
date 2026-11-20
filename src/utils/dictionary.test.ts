import { describe, expect, it } from "vitest";
import { SOLUTIONS } from "../data/words";
import { canonicalWord, isValidWord } from "./dictionary";

describe("isValidWord", () => {
  it("aceita palavras digitadas sem acento", () => {
    expect(isValidWord("radio")).toBe(true);
    expect(isValidWord("PRACA")).toBe(true);
  });

  it("aceita plurais e femininos", () => {
    for (const word of ["gatos", "patas", "rotas", "votos", "lerda", "itens", "anéis"]) {
      expect(isValidWord(word)).toBe(true);
    }
  });

  it("recusa palavras fora do banco", () => {
    expect(isValidWord("xzxzx")).toBe(false);
  });
});

describe("canonicalWord", () => {
  it("preenche os acentos da grafia correta", () => {
    expect(canonicalWord("radio")).toBe("rádio");
    expect(canonicalWord("braco")).toBe("braço");
  });

  it("prefere a grafia das respostas quando há outra igual sem acento", () => {
    expect(canonicalWord("carne")).toBe("carne");
    expect(canonicalWord("lugar")).toBe("lugar");
    expect(canonicalWord("metro")).toBe("metrô");
  });

  it("mantém a grafia de todas as respostas", () => {
    for (const solution of SOLUTIONS) {
      expect(canonicalWord(solution)).toBe(solution);
    }
  });
});
