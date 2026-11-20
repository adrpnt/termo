import { describe, expect, it } from "vitest";
import { getBoards, getGameStatus, getKeyboardStatuses } from "./boards";

describe("getBoards", () => {
  it("avalia cada tentativa contra a palavra de cada tabuleiro", () => {
    const [first, second] = getBoards(["carne", "praça"], ["porta"]);
    expect(first.evaluations).toEqual([["absent", "absent", "correct", "absent", "present"]]);
    expect(second.evaluations).toEqual([["correct", "absent", "present", "absent", "correct"]]);
  });

  it("para de mostrar tentativas no tabuleiro depois que a palavra é descoberta", () => {
    const [first, second] = getBoards(["carne", "praça"], ["porta", "carne", "mundo"]);
    expect(first.isSolved).toBe(true);
    expect(first.guesses).toEqual(["porta", "carne"]);
    expect(second.isSolved).toBe(false);
    expect(second.guesses).toEqual(["porta", "carne", "mundo"]);
  });

  it("considera resolvida a tentativa que só difere nos acentos", () => {
    const [board] = getBoards(["praça"], ["praca"]);
    expect(board.isSolved).toBe(true);
  });
});

describe("getGameStatus", () => {
  it("vence só quando todas as palavras são descobertas", () => {
    const solutions = ["carne", "praça"];
    expect(getGameStatus(getBoards(solutions, ["carne"]), 1, 7)).toBe("playing");
    expect(getGameStatus(getBoards(solutions, ["carne", "praça"]), 2, 7)).toBe("won");
  });

  it("vence com quatro palavras quando a última delas é descoberta", () => {
    const solutions = ["carne", "praça", "mundo", "livro"];
    expect(getGameStatus(getBoards(solutions, ["carne", "praça", "mundo"]), 3, 9)).toBe(
      "playing",
    );
    expect(
      getGameStatus(getBoards(solutions, ["livro", "carne", "praça", "mundo"]), 4, 9),
    ).toBe("won");
  });

  it("perde ao esgotar as tentativas com alguma palavra sem descobrir", () => {
    const guesses = ["carne", "porta", "mundo", "livro", "tempo", "festa", "noite"];
    expect(getGameStatus(getBoards(["carne", "praça"], guesses), 7, 7)).toBe("lost");
  });

  it("vence se a última tentativa descobre a última palavra", () => {
    const guesses = ["carne", "porta", "mundo", "livro", "tempo", "festa", "praça"];
    expect(getGameStatus(getBoards(["carne", "praça"], guesses), 7, 7)).toBe("won");
  });
});

describe("getKeyboardStatuses", () => {
  it("guarda o status das letras separado por tabuleiro", () => {
    const [first, second] = getKeyboardStatuses(getBoards(["carne", "praça"], ["porta"]));
    expect(first.p).toBe("absent");
    expect(second.p).toBe("correct");
    expect(first.r).toBe("correct");
    expect(second.r).toBe("present");
  });

  it("não rebaixa o status de uma letra em tentativas seguintes", () => {
    const [board] = getKeyboardStatuses(getBoards(["carne"], ["carta", "rosca"]));
    expect(board.c).toBe("correct");
    expect(board.r).toBe("correct");
  });
});
