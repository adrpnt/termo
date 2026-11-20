import type { CSSProperties } from "react";
import type { LetterStatus } from "../types";

interface KeyboardProps {
  /** Status das letras, um mapa por tabuleiro. */
  statuses: Record<string, LetterStatus>[];
  onKey: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "back"],
];

const statusClasses: Record<LetterStatus, string> = {
  correct: "bg-[var(--color-correct)] text-white",
  present: "bg-[var(--color-present)] text-white",
  absent: "bg-[var(--color-absent)] text-white/50",
};

const statusColors: Record<LetterStatus, string> = {
  correct: "var(--color-correct)",
  present: "var(--color-present)",
  absent: "var(--color-absent)",
};

/** Divide o fundo da tecla em faixas verticais, uma por tabuleiro, na ordem
 * dos tabuleiros (da esquerda para a direita). */
function splitBackground(keyStatuses: (LetterStatus | undefined)[]): string {
  const step = 100 / keyStatuses.length;
  const stops = keyStatuses.map((status, i) => {
    const color = status ? statusColors[status] : "var(--color-key)";
    return `${color} ${i * step}% ${(i + 1) * step}%`;
  });
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

const keyBase =
  "flex items-center justify-center rounded-md font-bold uppercase shadow-[var(--shadow-sm)] transition-all duration-100 active:scale-95 active:brightness-90";

export function Keyboard({
  statuses,
  onKey,
  onEnter,
  onBackspace,
}: KeyboardProps) {
  function renderKey(key: string) {
    if (key === "enter") {
      return (
        <button
          key={key}
          type="button"
          onClick={onEnter}
          className={`${keyBase} h-[clamp(1.75rem,4.5dvh,3rem)] min-w-10 bg-(--color-key) px-1.5 text-[10px] text-white hover:brightness-110 sm:min-w-12 sm:text-xs lg:min-w-16 lg:px-2 lg:text-sm`}
        >
          Enviar
        </button>
      );
    }
    if (key === "back") {
      return (
        <button
          key={key}
          type="button"
          onClick={onBackspace}
          aria-label="Apagar"
          className={`${keyBase} h-[clamp(1.75rem,4.5dvh,3rem)] min-w-10 bg-(--color-key) px-1.5 text-base text-white hover:brightness-110 sm:min-w-12 lg:min-w-16 lg:text-xl`}
        >
          ⌫
        </button>
      );
    }

    const keyStatuses = statuses.map((map) => map[key]);
    const letterBase = `${keyBase} h-[clamp(1.75rem,4.5dvh,3rem)] flex-1 text-xs sm:text-sm lg:text-base`;
    let className: string;
    let style: CSSProperties | undefined;

    if (keyStatuses.length === 1) {
      const [status] = keyStatuses;
      className = `${letterBase} ${
        status ? statusClasses[status] : "bg-(--color-key) text-white hover:brightness-110"
      }`;
    } else {
      const allAbsent = keyStatuses.every((status) => status === "absent");
      className = `${letterBase} hover:brightness-110 ${allAbsent ? "text-white/50" : "text-white"}`;
      style = { background: splitBackground(keyStatuses) };
    }

    return (
      <button
        key={key}
        type="button"
        onClick={() => onKey(key)}
        className={className}
        style={style}
      >
        {key}
      </button>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md shrink-0 flex-col gap-[0.35dvh] px-1.5 pb-1.5 select-none sm:gap-1.5 lg:max-w-2xl lg:gap-2 lg:px-3 lg:pb-3">
      {ROWS.map((row, i) => (
        <div
          key={i}
          className="flex justify-center gap-1 sm:gap-1.5 lg:gap-2"
        >
          {row.map(renderKey)}
        </div>
      ))}
    </div>
  );
}
