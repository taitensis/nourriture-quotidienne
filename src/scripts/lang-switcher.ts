document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById(
    "lang-switcher"
  ) as HTMLSelectElement | null;
  if (!sel) return;

  const SUPPORTED = ["en", "fr"] as const;
  type Lang = (typeof SUPPORTED)[number];
  const BASE = import.meta.env.BASE_URL; // "/" in dev, "/repo-name/" on GitHub Pages

  // Helper: remove the site base from a pathname
  const stripBase = (p: string) =>
    p.startsWith(BASE)
      ? p.slice(BASE.length - 1).replace(/^\/+/, "")
      : p.replace(/^\/+/, "");

  // Detect current lang from <html lang> or URL
  const fromHtml = (document.documentElement.lang || "").toLowerCase();
  let current: Lang = (SUPPORTED as readonly string[]).includes(fromHtml)
    ? (fromHtml as Lang)
    : "en";
  if (!fromHtml) {
    const first = stripBase(location.pathname).split("/")[0];
    if ((SUPPORTED as readonly string[]).includes(first))
      current = first as Lang;
  }
  sel.value = current;

  sel.addEventListener("change", (e) => {
    const newLang = (e.target as HTMLSelectElement).value as Lang;
    if (!(SUPPORTED as readonly string[]).includes(newLang)) return;

    // Example: /base/en/recipes/foo -> parts = ["en","recipes","foo"]
    const parts = stripBase(location.pathname).split("/").filter(Boolean);
    const head = parts[0];
    const tail = (SUPPORTED as readonly string[]).includes(head)
      ? parts.slice(1).join("/")
      : parts.join("/");

    // Build new URL under the same BASE, preserving ?search and #hash
    const path = `${BASE}${newLang}/${tail}`.replace(/\/+/g, "/");
    const url = path.endsWith("/") || tail === "" ? path : path + "/";
    location.assign(url + location.search + location.hash);
  });
});
