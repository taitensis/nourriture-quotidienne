// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://taitensis.github.io/nourriture-quotidienne",
  base: "/nourriture-quotidienne/",
  vite: { plugins: [tailwindcss()] },
});
