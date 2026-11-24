import { useCallback, useEffect, useState } from "react";
import { Game } from "./components/Game";
import type { BoardCount } from "./types";
import { loadBoardCount, saveBoardCount, VARIANTS } from "./utils/variants";
import { applyTheme, loadTheme, nextTheme, saveTheme, type Theme } from "./utils/theme";

export default function App() {
  const [boardCount, setBoardCount] = useState<BoardCount>(() => loadBoardCount());
  const [theme, setTheme] = useState<Theme>(() => loadTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const changeBoardCount = useCallback((next: BoardCount) => {
    setBoardCount(next);
    saveBoardCount(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = nextTheme(current);
      saveTheme(next);
      return next;
    });
  }, []);

  // A `key` remonta o jogo ao trocar a quantidade de palavras, carregando do
  // zero a partida e as estatísticas da variante escolhida.
  return (
    <Game
      key={boardCount}
      variant={VARIANTS[boardCount]}
      onChangeBoardCount={changeBoardCount}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
