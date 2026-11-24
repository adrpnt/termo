import { afterEach, describe, expect, it, vi } from "vitest";
import { SOLUTIONS_BASE } from "../data/words";
import { getDailySolutions, getDailyWords } from "./dailyWord";

// Mudança no banco de respostas registrada para valer a partir de 21/11/2026,
// como se tivesse entrado num deploy feito no dia 20.
const { change } = vi.hoisted(() => ({
  change: { from: "2026-11-21", added: [] as string[], removed: [] as string[] },
}));

vi.mock("../data/words", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../data/words")>();
  return { ...actual, SOLUTIONS_CHANGES: [change] };
});

describe("getDailyWords com mudanças no banco de respostas", () => {
  const today = new Date("2026-11-20T22:00:00-03:00");
  const tomorrow = new Date("2026-11-21T12:00:00-03:00");
  const wordsOn = (date: Date) => [1, 2, 4].map((count) => getDailyWords(count, date));

  afterEach(() => {
    change.added = [];
    change.removed = [];
  });

  it("mantém as palavras de hoje mesmo se elas forem removidas a partir de amanhã", () => {
    const before = wordsOn(today);
    change.added = ["nuvem"];
    change.removed = before.flat();
    expect(wordsOn(today)).toEqual(before);
  });

  it("aplica a mudança a partir do dia registrado", () => {
    const removed = wordsOn(today).flat();
    change.added = ["nuvem"];
    change.removed = removed;
    expect(getDailySolutions(today)).toEqual(SOLUTIONS_BASE);
    expect(getDailySolutions(tomorrow)).toContain("nuvem");
    for (const word of wordsOn(tomorrow).flat()) {
      expect(removed).not.toContain(word);
    }
  });
});
