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

export type TileSize = "lg" | "md";

// "md" cabe dois tabuleiros lado a lado no celular: limita pela largura
// (vw) além da altura (dvh).
const sizeClasses: Record<TileSize, string> = {
  lg: "h-[clamp(2.25rem,7.5dvh,4rem)] w-[clamp(2.25rem,7.5dvh,4rem)] text-[clamp(1.25rem,3.6dvh,1.875rem)]",
  md: "h-[min(6.2dvh,8vw,3.5rem)] w-[min(6.2dvh,8vw,3.5rem)] text-[min(3dvh,4.2vw,1.625rem)]",
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
      ? "border-[var(--color-border-strong)] text-white"
      : "border-[var(--color-border)] text-white";

  const cursorClasses = isCursor
    ? "border-white bg-white/5 shadow-[0_0_0_3px_rgba(255,255,255,0.12)]"
    : "";

  const className = status
    ? `${base} ${statusClasses[status]} animate-flip`
    : `${base} ${emptyClasses} ${cursorClasses} ${isFilled ? "animate-pop" : ""} ${
        isClickable ? "cursor-pointer hover:border-white/40" : ""
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
