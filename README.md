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
npm test          # testes unitários (Vitest)
npm run build:words  # regenera as listas de palavras aceitas
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

Também dá para jogar com mais de uma palavra ao mesmo tempo, escolhendo a
quantidade no seletor ao lado do botão de ajuda:

- **1 palavra**, 6 tentativas.
- **2 palavras**, 7 tentativas. Cada tentativa vale para os dois quadros; um
  quadro para de receber tentativas quando sua palavra é descoberta. No
  teclado, a metade esquerda de cada tecla mostra a dica do primeiro quadro e
  a direita, do segundo.
- **4 palavras**, 9 tentativas. Os quadros ficam em grade 2x2 no celular e
  em uma linha em telas largas. No teclado, cada tecla é dividida em quatro
  partes na mesma posição dos quadros: quadrantes na grade, faixas na linha.

Cada quantidade de palavras tem sua própria partida salva e suas próprias
estatísticas, nos dois modos (Diário e Infinito).

## Estrutura

```text
src/
  data/words.ts        banco de palavras (respostas + palavras extras aceitas)
  data/*Extra.ts       listas geradas a partir do fserb/pt-br
  utils/                normalização de acentos, dicionário, palavra do dia,
                         avaliação de tentativas, tabuleiros e variantes
                         (quantidade de palavras e tentativas)
  hooks/useGame.ts       estado principal do jogo
  hooks/useStats.ts      estatísticas e sequência (streak)
  components/            Game, Board, Tile, Keyboard, modais, toasts
scripts/
  build-words.ts         gera as listas de src/data/*Extra.ts
  wordlist.ts            regras de flexão e filtragem das listas
```

## Banco de palavras

- `SOLUTIONS_BASE` e `SOLUTIONS_CHANGES` (`src/data/words.ts`): ~230
  palavras comuns, curadas à mão, sorteáveis como resposta (palavra do dia /
  modo infinito). Veja abaixo como mudar essa lista.
- `EXTRA_VALID` (`src/data/words.ts`): palavras adicionais aceitas como
  tentativa, mas nunca sorteadas como resposta.
- `LEXICO_EXTRA` (`src/data/lexicoExtra.ts`): palavras de 5 letras do léxico
  de português do projeto [fserb/pt-br](https://github.com/fserb/pt-br)
  (MIT License).
- `CONJUGACOES_EXTRA` (`src/data/conjugacoesExtra.ts`): formas verbais
  conjugadas de 5 letras, do mesmo projeto.
- `FLEXOES_EXTRA` (`src/data/flexoesExtra.ts`): plurais e femininos de 5
  letras gerados por regra. O léxico do fserb/pt-br só traz a forma base das
  palavras ("gato", mas não "gatos"; "lerdo", mas não "lerda"), por isso essas
  formas são geradas à parte.

As três listas são aceitas apenas como tentativa, nunca como resposta, e são
geradas por `npm run build:words`. Não edite esses arquivos à mão.

### Como as listas são geradas

O script `scripts/build-words.ts` baixa os arquivos `lexico`, `conjugações` e
`icf` do fserb/pt-br, fixados em um commit, para `.cache/pt-br/`, e então:

- mantém só palavras em minúsculas com letras do alfabeto português, o que
  exclui nomes próprios e estrangeirismos como "aïoli";
- gera plurais regulares (gato → gatos, cor → cores, item → itens,
  anel → anéis);
- aceita plurais ambíguos (leão → leões) e femininos (lerdo → lerda) só
  quando a forma, ou o plural dela, aparece no corpus `icf`, que lista
  palavras encontradas em textos reais;
- não flexiona palavras invariáveis (lista `INVARIABLE`, ex.: "aqui", "quem");
- remove termos ofensivos/vulgares (lista `BLOCKED`), inclusive as flexões
  geradas a partir deles. O filtro é manual e pode não ser exaustivo;
- mantém uma única grafia por palavra sem acento (ex.: "carne" e "carnê"), a
  mais comum no corpus, já que o teclado do jogo não tem acentos.

Para aceitar uma palavra que ainda é recusada, registre-a como resposta em
`SOLUTIONS_CHANGES` (se for uma boa resposta) ou adicione-a a `EXTRA_VALID`
(se for só para ser aceita como tentativa). Se for um padrão de flexão que
falta, ajuste as regras em `scripts/wordlist.ts` e rode `npm run build:words`.

### Mudando as respostas

As palavras do modo diário são as mesmas para todo mundo no dia, e o dia
segue o horário de Brasília. Para isso continuar valendo depois de um deploy,
o banco de respostas não é editado diretamente:

- `SOLUTIONS_BASE` é o banco usado desde o início e não deve ser alterado. Um
  teste falha se a lista mudar.
- Para adicionar ou remover respostas, registre a mudança em
  `SOLUTIONS_CHANGES`, em ordem cronológica, com o primeiro dia em que ela
  vale:

  ```ts
  { from: "2027-01-10", added: ["nuvem"], removed: ["vulgo"] }
  ```

  Use uma data posterior ao deploy. Até essa data, o modo diário continua
  sorteando com o banco anterior, então as palavras de um dia que já começou
  nunca mudam. O modo infinito usa o banco com todas as mudanças aplicadas.
- Respostas removidas continuam aceitas como tentativa.
