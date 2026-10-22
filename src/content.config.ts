import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorySlugs } from './data/categories';

/**
 * Articles and tutorials.
 *
 * Files live in src/content/posts/<lang>/<slug>.md(x). A post and its
 * translation share the same <slug> in both language folders.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      /** One of the slugs in src/data/categories.ts. */
      category: z.enum(categorySlugs),
      /** "tutorial" posts get a Tutorial badge and can be filtered on the blog. */
      kind: z.enum(['article', 'tutorial']).default('article'),
      tags: z.array(z.string()).default([]),
      /** Cover image, relative to the post file, e.g. ./images/my-cover.png. Optional: a generated cover is used otherwise. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Pinned as the large card at the top of the blog. */
      featured: z.boolean().default(false),
      /** Slugs of codes.im tools to show as "Tools used in this post". */
      tools: z.array(z.string()).default([]),
      /** Optional series name; posts with the same series are linked together. */
      series: z.string().optional(),
      /** Drafts are visible in `npm run dev` but not built for production. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
