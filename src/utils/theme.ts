export type Theme = "light" | "dark";

/** Mantenha em sincronia com o script inline do index.html, que aplica o tema
 * antes do React carregar para evitar o piscar do tema errado. */
export const THEME_STORAGE_KEY = "termo:theme";

/** Cor da barra do navegador no celular, igual ao `--color-bg` de cada tema. */
export const THEME_COLORS: Record<Theme, string> = {
  dark: "#121213",
  light: "#ffffff",
};

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Usa o tema escolhido pelo jogador ou, se ele nunca escolheu, o do sistema. */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? "dark" : "light";
}

export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function loadTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // ignora se localStorage não estiver disponível
  }
  // Sem preferência declarada pelo sistema, mantém o escuro (visual original).
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
  return resolveTheme(stored, !prefersLight);
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignora se localStorage não estiver disponível
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}
