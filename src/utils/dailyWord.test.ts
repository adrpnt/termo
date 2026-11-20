import { describe, expect, it } from "vitest";
import { SOLUTIONS } from "../data/words";
import { getDailyWord, getDailyWords, getRandomWords } from "./dailyWord";

describe("getDailyWords", () => {
  const date = new Date(2026, 10, 20);

  it("usa a palavra do dia de sempre com um tabuleiro", () => {
    expect(getDailyWords(1, date)).toEqual([getDailyWord(date)]);
  });

  it("sorteia palavras diferentes entre si e da palavra do dia", () => {
    const words = getDailyWords(2, date);
    expect(words).toHaveLength(2);
    expect(new Set(words).size).toBe(2);
    expect(words).not.toContain(getDailyWord(date));
    for (const word of words) {
      expect(SOLUTIONS).toContain(word);
    }
  });

  it("sorteia quatro palavras distintas no modo de quatro palavras", () => {
    const words = getDailyWords(4, date);
    expect(words).toHaveLength(4);
    expect(new Set(words).size).toBe(4);
    expect(words).not.toContain(getDailyWord(date));
  });

  it("devolve as mesmas palavras no mesmo dia", () => {
    expect(getDailyWords(2, new Date(2026, 10, 20, 8))).toEqual(
      getDailyWords(2, new Date(2026, 10, 20, 22)),
    );
  });

  it("muda as palavras de um dia para o outro", () => {
    expect(getDailyWords(2, new Date(2026, 10, 20))).not.toEqual(
      getDailyWords(2, new Date(2026, 10, 21)),
    );
  });
});

describe("getRandomWords", () => {
  it("sorteia palavras distintas fora das excluídas", () => {
    const exclude = SOLUTIONS.slice(0, 10);
    for (let i = 0; i < 50; i++) {
      const words = getRandomWords(2, exclude);
      expect(new Set(words).size).toBe(2);
      for (const word of words) {
        expect(exclude).not.toContain(word);
      }
    }
  });
});
