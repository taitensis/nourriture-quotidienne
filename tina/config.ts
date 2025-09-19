// .tina/config.ts
import { defineConfig } from "tinacms";

// Keep your supported locales here (used by the slugify + field options)
const LOCALES = ["en", "fr"] as const;

// Prefer an explicit env var; fall back to the current CI branch; then "main"
const branch =
  process.env.TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_HEAD_REF ||
  "main";

const clientId =
  process.env.TINA_CLIENT_ID || process.env.PUBLIC_TINA_CLIENT_ID || "";

const token = process.env.TINA_TOKEN || "";

export default defineConfig({
  // Tina Cloud auth (add these in .env locally and Actions secrets in CI)
  clientId,
  token,
  branch,

  // Build the Tina admin app into /public/admin so Astro ships it
  build: {
    publicFolder: "public",
    outputFolder: "admin",
    basePath: "nourriture-quotidienne",
  },

  // Repo-backed media: files go to /public/uploads, referenced as /uploads/...
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads",
    },
  },

  schema: {
    collections: [
      {
        name: "recipe",
        label: "Recipes",
        path: "src/content/recipes",
        format: "md",
        ui: {
          // Create files under <lang>/<slug>.md (e.g. en/five-spice-veggie-tofu-stir-fry.md)
          filename: {
            slugify: (values) => {
              const lang = String(values?.lang || "en").toLowerCase();
              const t = String(values?.title || "untitled")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              return `${lang}/${t}`;
            },
          },
        },
        fields: [
          // Basics
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },

          // Your Astro schema uses z.date(); Tina "datetime" will serialize a valid date string
          { type: "datetime", name: "date", label: "Date" },

          // Language & tags
          {
            type: "string",
            name: "lang",
            label: "Language",
            options: [...LOCALES],
            required: true,
          },
          { type: "string", name: "tags", label: "Tags", list: true },

          // Times (strings like "15 min" are fine)
          {
            type: "object",
            name: "time",
            label: "Time",
            fields: [
              { type: "string", name: "prep", label: "Prep" },
              { type: "string", name: "cook", label: "Cook" },
              { type: "string", name: "total", label: "Total" },
            ],
          },

          // Yield controls (UI text + optional numeric helpers used by your scaler)
          {
            type: "string",
            name: "yield",
            label: "Yield / Servings",
            required: true,
          },
          {
            type: "number",
            name: "yield_base",
            label: "Yield Base (number)",
            required: false,
          },
          {
            type: "number",
            name: "yield_default",
            label: "Yield Default (number)",
            required: false,
          },

          // Difficulty
          {
            type: "string",
            name: "difficulty",
            label: "Difficulty",
            options: ["easy", "medium", "hard"],
            required: false,
          },

          // Images
          {
            type: "object",
            name: "images",
            label: "Images",
            list: true,
            fields: [
              { type: "image", name: "src", label: "Image" },
              { type: "string", name: "alt", label: "Alt", required: false },
            ],
          },

          // Optional extra title lines
          {
            type: "string",
            name: "title_lines",
            label: "Title Lines",
            list: true,
            required: false,
          },

          // Ingredients (grouped, required; matches your zod schema)
          {
            type: "object",
            name: "ingredient_groups",
            label: "Ingredient Groups",
            list: true,
            required: true,
            fields: [
              {
                type: "string",
                name: "title",
                label: "Group Title",
                required: false,
              },
              {
                type: "string",
                name: "ingredients",
                label: "Ingredients (one per line)",
                list: true,
              },
            ],
          },

          // Steps & notes
          {
            type: "string",
            name: "steps",
            label: "Steps",
            list: true,
            required: true,
          },
          {
            type: "string",
            name: "notes",
            label: "Notes",
            list: true,
            required: false,
          },

          // i18n key
          {
            type: "string",
            name: "translation_key",
            label: "Translation Key",
            required: true,
          },
        ],
      },
    ],
  },
});
