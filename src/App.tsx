import { useCallback, useState } from "react";
import { Game } from "./components/Game";
import type { BoardCount } from "./types";
import { loadBoardCount, saveBoardCount, VARIANTS } from "./utils/variants";

export default function App() {
  const [boardCount, setBoardCount] = useState<BoardCount>(() => loadBoardCount());

  const changeBoardCount = useCallback((next: BoardCount) => {
    setBoardCount(next);
    saveBoardCount(next);
  }, []);

  // A `key` remonta o jogo ao trocar a quantidade de palavras, carregando do
  // zero a partida e as estatísticas da variante escolhida.
  return (
    <Game
      key={boardCount}
      variant={VARIANTS[boardCount]}
      onChangeBoardCount={changeBoardCount}
    />
  );
}
