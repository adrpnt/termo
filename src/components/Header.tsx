import type { ReactNode } from "react";
import type { GameMode } from "../types";

interface HeaderProps {
  mode: GameMode;
  onSwitchMode: (mode: GameMode) => void;
  onOpenHelp: () => void;
  onOpenStats: () => void;
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-white/75 transition-colors hover:border-(--color-border) hover:bg-white/5 hover:text-white"
    >
      {children}
    </button>
  );
}

export function Header({
  mode,
  onSwitchMode,
  onOpenHelp,
  onOpenStats,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-(--color-border) bg-(--color-bg-translucent) backdrop-blur-md">
      <div className="mx-auto grid w-full grid-cols-3 items-center px-5 py-2 sm:px-4">
        <div className="justify-self-start">
          <IconButton onClick={onOpenHelp} label="Como jogar">
            <span className="text-lg font-bold leading-none">?</span>
          </IconButton>
        </div>

        <div className="flex items-center justify-center gap-2 justify-self-center">
          <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
            <rect
              x="8"
              y="8"
              width="20"
              height="20"
              rx="4"
              fill="var(--color-correct)"
            />
            <rect
              x="32"
              y="8"
              width="20"
              height="20"
              rx="4"
              fill="var(--color-absent)"
            />
            <rect
              x="8"
              y="32"
              width="20"
              height="20"
              rx="4"
              fill="var(--color-present)"
            />
            <rect
              x="32"
              y="32"
              width="20"
              height="20"
              rx="4"
              fill="var(--color-absent)"
            />
          </svg>
          <h1 className="text-2xl font-extrabold tracking-wide sm:text-3xl">
            Termo
          </h1>
        </div>

        <div className="flex items-center justify-end gap-1.5 justify-self-end sm:gap-2.5">
          <div className="relative flex w-33 rounded-full border border-(--color-border) bg-black/20 p-0.5 text-[11px] font-semibold uppercase tracking-wide sm:w-37 sm:text-xs">
            <span
              className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-(--shadow-sm) transition-transform duration-200 ease-out"
              style={{
                transform:
                  mode === "random" ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => onSwitchMode("daily")}
              className={`relative z-10 flex-1 rounded-full py-1.5 text-center transition-colors ${
                mode === "daily"
                  ? "text-black"
                  : "text-white/65 hover:text-white"
              }`}
            >
              Diário
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode("random")}
              className={`relative z-10 flex-1 rounded-full py-1.5 text-center transition-colors ${
                mode === "random"
                  ? "text-black"
                  : "text-white/65 hover:text-white"
              }`}
            >
              Infinito
            </button>
          </div>

          <IconButton onClick={onOpenStats} label="Estatísticas">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="11"
                width="4"
                height="7"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="8"
                y="6"
                width="4"
                height="12"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="14"
                y="2"
                width="4"
                height="16"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        </div>
      </div>
    </header>
  );
}
