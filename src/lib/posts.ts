import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
export { readingMinutes } from './reading';

export type Post = CollectionEntry<'posts'>;

/** "en/my-post" → { lang: "en", slug: "my-post" } */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

export const postUrl = (p: Post) => {
  const { lang, slug } = splitId(p.id);
  return `/${lang}/blog/${slug}/`;
};

/** Published posts for one language, newest first. Drafts are included only in dev. */
export async function getPosts(lang: Lang): Promise<Post[]> {
  const all = await getCollection('posts', (p) => splitId(p.id).lang === lang && (import.meta.env.DEV || !p.data.draft));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getAllPosts(): Promise<Post[]> {
  return getCollection('posts', (p) => import.meta.env.DEV || !p.data.draft);
}

export function formatDate(d: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(d);
}

export const tagSlug = (tag: string) => tag.trim().toLowerCase().replace(/\s+/g, '-');
