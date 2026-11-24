import { describe, expect, it } from "vitest";
import { nextTheme, resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("usa o tema salvo pelo jogador, mesmo que o sistema prefira outro", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("segue o tema do sistema quando o jogador nunca escolheu", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignora valores salvos inválidos e segue o sistema", () => {
    expect(resolveTheme("azul", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});

describe("nextTheme", () => {
  it("alterna entre claro e escuro", () => {
    expect(nextTheme("dark")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
  });
});
