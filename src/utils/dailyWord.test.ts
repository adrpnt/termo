import { describe, expect, it, vi } from "vitest";
import { SOLUTIONS } from "../data/words";
import {
  getDailyWord,
  getDailyWords,
  getDayKey,
  getDayNumber,
  getRandomWords,
} from "./dailyWord";

/** Executa `fn` com o processo simulando o fuso horário de outro aparelho. */
function withTimeZone<T>(timeZone: string, fn: () => T): T {
  vi.stubEnv("TZ", timeZone);
  try {
    return fn();
  } finally {
    vi.unstubAllEnvs();
  }
}

describe("getDailyWords", () => {
  const date = new Date("2026-11-20T12:00:00-03:00");

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
    expect(getDailyWords(2, new Date("2026-11-20T08:00:00-03:00"))).toEqual(
      getDailyWords(2, new Date("2026-11-20T22:00:00-03:00")),
    );
  });

  it("muda as palavras de um dia para o outro", () => {
    expect(getDailyWords(2, new Date("2026-11-20T12:00:00-03:00"))).not.toEqual(
      getDailyWords(2, new Date("2026-11-21T12:00:00-03:00")),
    );
  });

  it("devolve as mesmas palavras para aparelhos em fusos diferentes", () => {
    const now = new Date("2026-11-20T22:30:00-03:00");
    const timeZones = ["America/Sao_Paulo", "Europe/Lisbon", "Asia/Tokyo", "America/Los_Angeles"];
    const results = timeZones.map((timeZone) =>
      withTimeZone(timeZone, () => [1, 2, 4].map((count) => getDailyWords(count, now))),
    );
    for (const result of results) {
      expect(result).toEqual(results[0]);
    }
  });
});

describe("getDayKey", () => {
  it("segue o horário de Brasília, mesmo quando já é outro dia no fuso do aparelho", () => {
    const now = new Date("2026-11-20T23:30:00-03:00");
    expect(withTimeZone("Asia/Tokyo", () => getDayKey(now))).toBe("2026-11-20");
    expect(withTimeZone("Europe/Lisbon", () => getDayKey(now))).toBe("2026-11-20");
  });

  it("vira o dia à meia-noite de Brasília", () => {
    expect(getDayKey(new Date("2026-11-20T23:59:59-03:00"))).toBe("2026-11-20");
    expect(getDayKey(new Date("2026-11-21T00:00:00-03:00"))).toBe("2026-11-21");
  });
});

describe("getDayNumber", () => {
  it("conta os dias desde 1º de janeiro de 2024 no horário de Brasília", () => {
    expect(getDayNumber(new Date("2024-01-01T00:00:00-03:00"))).toBe(0);
    expect(getDayNumber(new Date("2024-01-02T02:00:00Z"))).toBe(0);
    expect(getDayNumber(new Date("2024-01-02T03:00:00Z"))).toBe(1);
  });

  it("mantém a mesma contagem em qualquer fuso do aparelho", () => {
    const now = new Date("2026-11-20T22:30:00-03:00");
    expect(withTimeZone("Asia/Tokyo", () => getDayNumber(now))).toBe(
      withTimeZone("America/Los_Angeles", () => getDayNumber(now)),
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
