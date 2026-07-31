import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const reflections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reflections' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { reflections };
