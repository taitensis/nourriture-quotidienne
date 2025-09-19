// src/scripts/lang-switcher.ts
document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("lang-switcher") as HTMLSelectElement | null;
  if (!sel) return;

  // Reflect current <html lang="...">
  const current = document.documentElement.lang || "en";
  sel.value = current;

  sel.addEventListener("change", (e) => {
    const newLang = (e.target as HTMLSelectElement).value;

    // Keep the path after the locale segment, if any
    // e.g. /en/about -> ["en","about"] -> rest = "about"
    const parts = location.pathname.split("/").filter(Boolean);
    const rest = parts.length > 1 ? parts.slice(1).join("/") : "";

    // Build new localized URL. If you don't have localized routes for a page,
    // feel free to just go to the home of the selected locale: `/${newLang}/`
    const next = `/${newLang}/${rest}`;
    // normalize trailing slash
    location.href = next.endsWith("/") || rest === "" ? next : next + "/";
  });
});
