// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://taitensis.github.io/nourriture-quotidienne",
  // Keep as static for GitHub Pages
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Make sure environment variables are available to client-side code
      "process.env.TINA_CLIENT_ID": JSON.stringify(
        process.env.PUBLIC_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID
      ),
      "process.env.TINA_PUBLIC_BRANCH": JSON.stringify(
        process.env.PUBLIC_TINA_BRANCH || process.env.TINA_PUBLIC_BRANCH
      ),
    },
  },
  // Ensure admin routes are handled properly
  trailingSlash: "ignore",
});
