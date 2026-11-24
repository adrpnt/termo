import type { LetterStatus } from "../types";

interface TileProps {
  letter: string;
  status?: LetterStatus;
  isActive?: boolean;
  isFilled?: boolean;
  isCursor?: boolean;
  isClickable?: boolean;
  revealDelayMs?: number;
  size?: TileSize;
  onClick?: () => void;
}

export type TileSize = "lg" | "md" | "sm";

// "md" cabe dois tabuleiros lado a lado no celular: limita pela largura
// (vw) além da altura (dvh).
// "sm" cabe quatro tabuleiros: em grade 2x2 (dois de altura) até o breakpoint
// lg e em uma linha só (quatro de largura) a partir dele, acompanhando o
// layout do Game.
const sizeClasses: Record<TileSize, string> = {
  lg: "h-[clamp(2.25rem,7.5dvh,4rem)] w-[clamp(2.25rem,7.5dvh,4rem)] text-[clamp(1.25rem,3.6dvh,1.875rem)]",
  md: "h-[min(6.2dvh,8vw,3.5rem)] w-[min(6.2dvh,8vw,3.5rem)] text-[min(3dvh,4.2vw,1.625rem)]",
  sm: "h-[min(3.2dvh,8vw)] w-[min(3.2dvh,8vw)] text-[min(2dvh,4.2vw)] lg:h-[min(6dvh,3.4vw,3.25rem)] lg:w-[min(6dvh,3.4vw,3.25rem)] lg:text-[min(3dvh,1.8vw,1.5rem)]",
};

const statusClasses: Record<LetterStatus, string> = {
  correct: "bg-[var(--color-correct)] border-[var(--color-correct)] text-white shadow-[var(--shadow-sm)]",
  present: "bg-[var(--color-present)] border-[var(--color-present)] text-white shadow-[var(--shadow-sm)]",
  absent: "bg-[var(--color-absent)] border-[var(--color-absent)] text-white/90",
};

export function Tile({
  letter,
  status,
  isActive,
  isFilled,
  isCursor,
  isClickable,
  revealDelayMs,
  size = "lg",
  onClick,
}: TileProps) {
  const base = `flex ${sizeClasses[size]} select-none items-center justify-center rounded-md border-2 font-bold uppercase transition-all duration-150`;

  const emptyClasses =
    isFilled || isActive
      ? "border-[var(--color-border-strong)] text-(--color-text)"
      : "border-[var(--color-border)] text-(--color-text)";

  const cursorClasses = isCursor
    ? "border-(--color-cursor) bg-(--color-hover) shadow-[0_0_0_3px_var(--color-cursor-ring)]"
    : "";

  const className = status
    ? `${base} ${statusClasses[status]} animate-flip`
    : `${base} ${emptyClasses} ${cursorClasses} ${isFilled ? "animate-pop" : ""} ${
        isClickable ? "cursor-pointer hover:border-(--color-tile-hover)" : ""
      }`;

  return (
    <div
      className={className}
      onClick={isClickable ? onClick : undefined}
      style={status && revealDelayMs ? { animationDelay: `${revealDelayMs}ms` } : undefined}
    >
      {letter}
    </div>
  );
}
