import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Platform tag, e.g. "Meta Ads" — drives the coloured chip. */
    category: z.enum(['Meta Ads', 'Google Ads', 'LinkedIn Ads', 'Általános']),
    readingMinutes: z.number().int().positive().default(4),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
