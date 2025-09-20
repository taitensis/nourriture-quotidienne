import { defineConfig } from "tinacms";

const LOCALES = ["en", "fr"] as const;

const branch = process.env.TINA_PUBLIC_BRANCH || process.env.HEAD || "main";

export default defineConfig({
  clientId: process.env.TINA_CLIENT_ID as string, // <— matches your secret
  token: process.env.TINA_TOKEN as string, // <— matches your secret
  branch,

  // Build the Tina admin app into /public/admin so Astro ships it
  build: {
    publicFolder: "public",
    outputFolder: "admin",
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
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          { type: "datetime", name: "date", label: "Date" },
          {
            type: "string",
            name: "lang",
            label: "Language",
            options: [...LOCALES],
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
            type: "string",
            name: "yield",
            label: "Yield / Servings",
            required: true,
          },
          { type: "number", name: "yield_base", label: "Yield Base (number)" },
          {
            type: "number",
            name: "yield_default",
            label: "Yield Default (number)",
          },
          {
            type: "string",
            name: "difficulty",
            label: "Difficulty",
            options: ["easy", "medium", "hard"],
          },
          {
            type: "object",
            name: "images",
            label: "Images",
            list: true,
            fields: [
              { type: "image", name: "src", label: "Image" },
              { type: "string", name: "alt", label: "Alt" },
            ],
          },
          {
            type: "string",
            name: "title_lines",
            label: "Title Lines",
            list: true,
          },
          {
            type: "object",
            name: "ingredient_groups",
            label: "Ingredient Groups",
            list: true,
            required: true,
            fields: [
              { type: "string", name: "title", label: "Group Title" },
              {
                type: "string",
                name: "ingredients",
                label: "Ingredients (one per line)",
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
