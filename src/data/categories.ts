// Blog categories, shown as tabs on the blog and as /blog/category/<slug>/ pages.
// Add, remove or rename freely; a post picks one with `category: <slug>` in its frontmatter.

export const categories = [
  { slug: 'ai', emoji: '🤖', en: 'AI Engineering', zh: 'AI 工程' },
  { slug: 'web', emoji: '🧩', en: 'Web & Full-stack', zh: '前端与全栈' },
  { slug: 'tools', emoji: '🛠', en: 'Tools & Productivity', zh: '工具与效率' },
  { slug: 'build', emoji: '🚀', en: 'Building in Public', zh: '公开构建' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];
export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
