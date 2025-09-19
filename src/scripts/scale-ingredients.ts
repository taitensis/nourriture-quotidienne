// src/scripts/scale-ingredients.ts
// Unit-smart ingredient scaler (DOM glue only).
// Uses shared logic from src/lib/recipe-units.ts

import { scaleIngredientString, parseYieldServings } from "../lib/recipe-units";

function clamp(n: number, min = 1, max = 999) {
  return Math.max(min, Math.min(max, n));
}

function init() {
  const yieldEls = Array.from(
    document.querySelectorAll<HTMLElement>("[data-yield]")
  );
  const scaleBtns = Array.from(
    document.querySelectorAll<HTMLElement>("[data-scale]")
  );
  const ingEls = Array.from(
    document.querySelectorAll<HTMLElement>(".ingredient-text")
  );

  if (!yieldEls.length || !ingEls.length) return;

  // Keep original lines so scaling stays idempotent.
  for (const el of ingEls) {
    if (!el.dataset.orig) el.dataset.orig = (el.textContent || "").trim();
  }

  // Determine servings "base":
  // 1) explicit data-yield-base
  // 2) parse number from any [data-yield] text (e.g., "4 servings")
  // 3) fallback 1
  const base = (() => {
    const attr = parseFloat(yieldEls[0].dataset.yieldBase || "");
    if (Number.isFinite(attr) && attr > 0) return attr;
    for (const el of yieldEls) {
      const num = parseYieldServings(el.textContent || "");
      if (num && num > 0) return num;
    }
    return 1;
  })();

  // Current servings shown in UI (start from first numeric we see, else base)
  let current = (() => {
    const text = (yieldEls[0].textContent || "").trim();
    const m = text.match(/(\d+([.,]\d+)?)/);
    const n = m ? Number(m[1].replace(",", ".")) : NaN;
    return Number.isFinite(n) ? n : base;
  })();

  const factor = () => current / base;

  function render() {
    // Update servings readouts (just the number; labels are in markup)
    for (const el of yieldEls) el.textContent = String(current);

    // Scale ingredients
    const f = factor();
    for (const el of ingEls) {
      const orig = el.dataset.orig || el.textContent || "";
      el.textContent = scaleIngredientString(orig, f);
    }
  }

  function step(delta: number) {
    current = clamp(current + delta, 1, 999);
    render();
  }

  // +/- buttons with data-scale="+" | "-"
  for (const btn of scaleBtns) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const dir = (btn.getAttribute("data-scale") || "").trim();
      if (dir === "+") step(1);
      else if (dir === "-") step(-1);
    });
  }

  // Initial paint
  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

// Make this file a module for TS
export {};
