// src/scripts/theme-toggle.ts
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const apply = (t: "light" | "dark") => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
  };

  // Initial
  apply((localStorage.getItem("theme") as "light" | "dark") || "light");

  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
  });
});
