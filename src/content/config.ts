import { defineCollection, z } from 'astro:content';

const recipes = defineCollection({
  type: 'content', // 'data' or 'content'
  schema: z.object({
    // schema for frontmatter validation
    title: z.string(), // e.g. "Chocolate Chip Cookies"
    date: z.date(), // e.g. "2023-10-05"
    lang: z.enum(['en', 'fr', 'es', 'nl']),
    translationKey: z.string(), // same value across language variants
    slug: z.string().optional(), // allow localized slugs
    featured: z.boolean().optional(),
    month: z.number().int().min(1).max(12).optional(),
    season: z.enum(['winter', 'spring', 'summer', 'autumn', 'all']).optional(),
    description: z.string().optional(), // e.g. "Delicious homemade chocolate chip cookies."
    yield: z
      .union([z.number(), z.string()])
      .optional()
      .transform((v) =>
        typeof v === 'number' ? v : Number(String(v).match(/\d+/)?.[0]) || undefined
      ), // number of servings or string like "4-6"
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(), // difficulty level
    tags: z.array(z.string()).optional(), // e.g. ["dessert", "snack", "vegetarian", ...]
    time: z
      .object({
        prep: z.number().optional(), // in minutes
        cook: z.number().optional(), // in minutes
        total: z.number().optional(), // in minutes
      })
      .optional(), // time estimates
    images: z
      .array(
        z.object({
          src: z.string(), // image URL
          alt: z.string().optional(), // alt text
        })
      )
      .optional(), // array of images
    ingredient_groups: z
      .array(
        z.object({
          title: z.string().optional(), // e.g. "For the dough", "For the filling"
          ingredients: z.array(z.string()), // e.g. ["1 cup flour", "2 eggs", ...]
        })
      )
      .optional(), // groups of ingredients
    steps: z.array(z.string()).optional(), // e.g. ["Preheat the oven to 350°F.", "Mix the flour and eggs.", ...]
    notes: z.array(z.string()).optional(), // additional notes
    translation_key: z.string().optional(), // key to link translations
    nutrition: z
      .object({
        // per serving
        calories: z.number().optional(), // in kcal
        protein_g: z.number().optional(), // in grams
        carbs_g: z.number().optional(), // in grams
        fat_g: z.number().optional(), // in grams
        fiber_g: z.number().optional(), // in grams
        sugar_g: z.number().optional(), // in grams
        sodium_mg: z.number().optional(), // in milligrams
      })
      .optional(), // nutritional information
  }),
});

export const collections = { recipes };
