import { useTranslations, type Lang } from '../i18n/ui';
import { categories, tools } from '../tools/registry';
import { buildLlmsTxt } from './llms-site';
import { getPosts, postUrl } from './posts';

const ORIGIN = 'https://codes.im';

export async function siteLlmsTxt(lang: Lang): Promise<Response> {
  const t = useTranslations(lang);
  const zh = lang === 'zh';
  const posts = (await getPosts(lang)).filter((p) => !p.data.draft);

  const body = buildLlmsTxt({
    name: 'codes.im',
    summary: t('site.description'),
    details: zh
      ? '所有工具在浏览器本地运行，输入的数据不会上传到服务器。每个工具页都有使用步骤和常见问题。站点提供中英文两个版本。'
      : 'Every tool runs locally in the browser; input data is never uploaded. Each tool page has usage steps and an FAQ. The site is available in English and Chinese.',
    sections: [
      ...categories.map((c) => ({
        title: t(`cat.${c}` as Parameters<typeof t>[0]),
        links: tools
          .filter((tool) => tool.category === c)
          .map((tool) => ({ title: tool.text[lang].name, url: `${ORIGIN}/${lang}/${tool.slug}/`, note: tool.text[lang].description })),
      })),
      {
        title: zh ? '文章与教程' : 'Articles & tutorials',
        links: posts.map((p) => ({ title: p.data.title, url: ORIGIN + postUrl(p), note: p.data.description })),
      },
      {
        title: 'Optional',
        links: [
          { title: zh ? '博客' : 'Blog', url: `${ORIGIN}/${lang}/blog/` },
          { title: zh ? '关于' : 'About', url: `${ORIGIN}/${lang}/about/` },
          { title: 'RSS', url: `${ORIGIN}/${lang}/rss.xml` },
        ],
      },
    ],
  });

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
