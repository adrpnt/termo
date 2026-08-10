import type { LetterStatus } from "../types";

interface KeyboardProps {
  statuses: Record<string, LetterStatus>;
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
          className={`${keyBase} h-14 min-w-13 bg-(--color-key) px-2 text-xs text-white hover:brightness-110 sm:min-w-16 sm:text-sm lg:h-16 lg:min-w-21 lg:px-3 lg:text-base`}
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
          className={`${keyBase} h-14 min-w-13 bg-(--color-key) px-2 text-lg text-white hover:brightness-110 sm:min-w-16 lg:h-16 lg:min-w-21 lg:text-2xl`}
        >
          ⌫
        </button>
      );
    }

    const status = statuses[key];
    const className = `${keyBase} h-14 flex-1 text-sm sm:text-base lg:h-16 lg:text-lg ${
      status
        ? statusClasses[status]
        : "bg-(--color-key) text-white hover:brightness-110"
    }`;

    return (
      <button
        key={key}
        type="button"
        onClick={() => onKey(key)}
        className={className}
      >
        {key}
      </button>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-1.5 px-1.5 pb-5 select-none sm:gap-2 lg:max-w-3xl lg:gap-3 lg:px-4 lg:pb-8">
      {ROWS.map((row, i) => (
        <div
          key={i}
          className="flex justify-center gap-1.5 sm:gap-2 lg:gap-2.5"
        >
          {row.map(renderKey)}
        </div>
      ))}
    </div>
  );
}
