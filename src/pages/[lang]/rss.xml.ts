import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { langs, useTranslations, type Lang } from '../../i18n/ui';
import { getPosts, postUrl } from '../../lib/posts';

export function getStaticPaths() {
  return langs.map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const t = useTranslations(lang);
  const posts = (await getPosts(lang)).filter((p) => !p.data.draft);
  return rss({
    title: `codes.im · ${t('blog.title')}`,
    description: t('blog.description'),
    site: context.site ?? 'https://codes.im',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.tags,
    })),
    customData: `<language>${lang === 'zh' ? 'zh-cn' : 'en'}</language>`,
  });
}
