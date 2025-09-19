import { defineCollection, z } from "astro:content";

const recipes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    time: z.object({
      prep: z.string(),
      cook: z.string(),
      total: z.string(),
    }),
    yield: z.string(),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string().optional()
    })).optional(),
    title_lines: z.array(z.string()).optional(),

    ingredient_groups: z.array(z.object({
      title: z.string().optional(),
      ingredients: z.array(z.string()).min(1),
    })).min(1),

    steps: z.array(z.string()),
    notes: z.array(z.string()).default([]),
  }),
});

export const collections = { recipes };
