# Termo

Clone do [term.ooo](https://term.ooo/) feito com Vite, React 19, TypeScript e Tailwind CSS 4.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`).

Outros comandos:

```bash
npm run build    # build de produção (roda o type-check e gera dist/)
npm run preview  # serve o build de produção localmente
npm run lint      # ESLint
```

## Como jogar

Descubra a palavra de 5 letras em até 6 tentativas. Depois de cada tentativa,
as peças mudam de cor: verde indica letra na posição certa, amarelo indica
letra que existe na palavra mas em outra posição, e cinza indica letra que
não existe na palavra. Os acentos são preenchidos automaticamente e não
contam para as dicas.

Existem dois modos, alternáveis no topo da tela:

- **Diário** — mesma palavra para todo mundo no dia, com progresso salvo no
  navegador (localStorage) e estatísticas/sequência de vitórias.
- **Infinito** — palavra aleatória a cada partida, sem limite de jogos.

## Estrutura

```text
src/
  data/words.ts        banco de palavras (soluções + palavras extras aceitas)
  utils/                normalização de acentos, dicionário, palavra do dia,
                         avaliação de tentativas
  hooks/useGame.ts       estado principal do jogo
  hooks/useStats.ts      estatísticas e sequência (streak)
  components/            Board, Tile, Keyboard, modais, toasts
```

## Banco de palavras

- `SOLUTIONS` (`src/data/words.ts`) — ~200 palavras comuns, curadas à mão,
  sorteáveis como resposta (palavra do dia / modo infinito).
- `EXTRA_VALID` (`src/data/words.ts`) — palavras adicionais aceitas como
  tentativa, mas nunca sorteadas como resposta.
- `LEXICO_EXTRA` (`src/data/lexicoExtra.ts`) — 6.280 palavras de 5 letras
  extraídas do léxico de português do projeto
  [fserb/pt-br](https://github.com/fserb/pt-br) (MIT License), também
  aceitas apenas como tentativa. Não são usadas como resposta por incluírem
  termos raros/pouco comuns.
- `CONJUGACOES_EXTRA` (`src/data/conjugacoesExtra.ts`) — 3.525 formas
  verbais conjugadas de 5 letras, também do projeto fserb/pt-br, aceitas
  apenas como tentativa.

Ambas as listas externas foram filtradas para remover termos
ofensivos/vulgares (o filtro é manual e pode não ser exaustivo).

Para estender, basta adicionar entradas a `SOLUTIONS` (se for uma boa
resposta) ou `EXTRA_VALID` (se for só para ser aceita como tentativa).
