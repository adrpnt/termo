import { Modal } from "./Modal";
import { Tile } from "./Tile";

interface HelpModalProps {
  boardCount: number;
  maxGuesses: number;
  onClose: () => void;
}

export function HelpModal({ boardCount, maxGuesses, onClose }: HelpModalProps) {
  const isMulti = boardCount > 1;

  return (
    <Modal title="Como jogar" onClose={onClose}>
      <div className="space-y-5 text-sm leading-relaxed text-white/90">
        {isMulti ? (
          <p>
            Descubra as {boardCount} palavras certas em {maxGuesses} tentativas. Cada
            tentativa vale para todas as palavras ao mesmo tempo, e as peças de cada
            quadro mostram o quão perto você está daquela palavra.
          </p>
        ) : (
          <p>
            Descubra a palavra certa em {maxGuesses} tentativas. Depois de cada
            tentativa, as peças mostram o quão perto você está da solução.
          </p>
        )}

        <div className="space-y-2">
          <div className="flex gap-1.5">
            <Tile letter="T" status="correct" />
            <Tile letter="U" />
            <Tile letter="R" />
            <Tile letter="M" />
            <Tile letter="A" />
          </div>
          <p>
            A letra{" "}
            <strong className="text-[var(--color-correct-strong)]">T</strong> faz parte
            da palavra e está na posição correta.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1.5">
            <Tile letter="V" />
            <Tile letter="I" />
            <Tile letter="O" status="present" />
            <Tile letter="L" />
            <Tile letter="A" />
          </div>
          <p>
            A letra{" "}
            <strong className="text-[var(--color-present-strong)]">O</strong> faz parte
            da palavra mas em outra posição.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1.5">
            <Tile letter="P" />
            <Tile letter="U" />
            <Tile letter="L" />
            <Tile letter="G" status="absent" />
            <Tile letter="A" />
          </div>
          <p>
            A letra <strong className="text-white">G</strong> não faz parte da
            palavra.
          </p>
        </div>

        <div className="space-y-1.5 border-t border-[var(--color-border)] pt-4 text-[var(--color-text-muted)]">
          {isMulti && (
            <p>
              No teclado, cada tecla é dividida em {boardCount} partes, uma por quadro, na
              mesma ordem dos quadros.
            </p>
          )}
          <p>Clique em qualquer quadrado da linha ativa para editar aquela letra.</p>
          <p>Os acentos são preenchidos automaticamente e não contam para as dicas.</p>
          <p>As palavras podem ter letras repetidas.</p>
        </div>
      </div>
    </Modal>
  );
}
