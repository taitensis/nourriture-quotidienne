// .tina/config.ts
import { defineConfig } from "tinacms";

const locales = ["en", "fr"] as const;

export default defineConfig({
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  // (Optional) repo-based media to /public/uploads
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
          // Put new files under <lang>/<slug>.md
          filename: {
            slugify: (values) => {
              const lang = (values?.lang ?? "en").toLowerCase();
              const t = (values?.title ?? "untitled")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              // allow subfolders in filename (doc-supported)
              // e.g. en/five-spice-tofu
              return `${lang}/${t}`;
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          // keep "date" as string to match your Astro schema
          { type: "datetime", name: "date", label: "Date (YYYY-MM-DD)" },

          {
            type: "string",
            name: "lang",
            label: "Language",
            options: [...locales],
            required: true,
          },

          {
            type: "string",
            name: "yield",
            label: "Yield / Servings",
            required: true,
          },
          {
            type: "string",
            name: "difficulty",
            label: "Difficulty",
            options: ["easy", "medium", "hard"],
            required: true,
          },

          { type: "string", name: "tags", label: "Tags", list: true },

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

          {
            type: "object",
            name: "images",
            label: "Images",
            list: true,
            fields: [
              { type: "string", name: "src", label: "Src" },
              { type: "string", name: "alt", label: "Alt", required: false },
            ],
          },

          {
            type: "string",
            name: "title_lines",
            label: "Title Lines",
            list: true,
            required: false,
          },

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
                label: "Ingredients",
                list: true,
              },
            ],
          },

          {
            type: "string",
            name: "steps",
            label: "Steps",
            list: true,
            required: true,
          },
          { type: "string", name: "notes", label: "Notes", list: true },

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
