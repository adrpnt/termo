import type { ToastMessage, ToastType } from "../types";

interface ToastProps {
  toasts: ToastMessage[];
}

const typeStyles: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: "bg-[var(--color-correct)] text-white", icon: "✓" },
  error: { bg: "bg-white text-black", icon: "!" },
  info: { bg: "bg-white text-black", icon: "" },
};

export function Toast({ toasts }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className={`animate-toast flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-[var(--shadow-md)] ${style.bg}`}
          >
            {style.icon && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/15 text-[10px] leading-none">
                {style.icon}
              </span>
            )}
            {toast.text}
          </div>
        );
      })}
    </div>
  );
}
