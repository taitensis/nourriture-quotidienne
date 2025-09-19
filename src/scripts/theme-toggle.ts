// src/scripts/theme-toggle.ts

type ThemePref = "light" | "dark";
const KEY = "theme";

// Apply the theme (Tailwind expects the `dark` class on <html>)
function applyTheme(theme: ThemePref) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
}

// Compute the theme to use (saved -> system)
function computeTheme(): ThemePref {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Initialize immediately (minimize flash)
applyTheme(computeTheme());

// Toggle handler (light <-> dark)
function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}

// Follow system only when there is NO explicit saved choice
const media = window.matchMedia("(prefers-color-scheme: dark)");
function handleSystemChange(e: MediaQueryListEvent) {
  try {
    if (!localStorage.getItem(KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  } catch {}
}
media.addEventListener?.("change", handleSystemChange);

// Wire up buttons
function ready(fn: () => void) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

ready(() => {
  const buttons = [
    ...document.querySelectorAll<HTMLElement>(".js-theme-toggle"),
    ...document.querySelectorAll<HTMLElement>("#theme-toggle"),
  ];
  buttons.forEach((btn) => btn.addEventListener("click", toggleTheme));
});

// Optional: expose a tiny API for other scripts
// window.__setTheme = (t: ThemePref) => applyTheme(t);
// window.__toggleTheme = toggleTheme;
