// Site-wide settings. Replace the placeholders with your own details.
export const config = {
  /** GitHub repository of this site. */
  repo: 'https://github.com/CODESIDY/codes.im',
  /** Your personal GitHub profile. */
  github: 'https://github.com/CODESIDY',
  /** Contact email shown on the About page and author card. */
  email: 'hello@codes.im',
  /** Your name as shown on the About page, author card and article metadata. */
  author: 'Sidy',
  /**
   * Avatar shown on the author card. Put an image in /public (e.g. public/avatar.png)
   * and set '/avatar.png'. Leave empty to show your initials instead.
   */
  avatar: '',
  /** One or two sentences about you for the blog's author card. */
  bio: {
    en: 'Full-stack engineer (web, back end, mobile). Building codes.im in public and writing about LLM engineering. Open to full-time roles.',
    zh: '全栈开发工程师，Web 前端、后端服务和移动端都做过。正在公开构建 codes.im，记录大模型应用开发的实践。正在寻找全职机会。',
  },
  /** Optional social links shown on the author card. Leave a value empty to hide it. */
  social: {
    x: '',
    juejin: '',
    zhihu: '',
    bilibili: '',
  },
  /**
   * Optional sponsor / tip links shown in the footer and on the About page.
   * Leave all empty to hide the "Support" link.
   */
  sponsor: {
    github: '', // e.g. 'https://github.com/sponsors/CODESIDY'
    afdian: '', // e.g. 'https://afdian.com/a/YOUR_ID'
    buymeacoffee: '', // e.g. 'https://buymeacoffee.com/YOUR_ID'
  },
  /**
   * Optional privacy-friendly, cookieless analytics. Only loaded in production builds.
   * - Cloudflare Web Analytics: { provider: 'cloudflare', id: '<beacon token>' }
   * - Plausible:               { provider: 'plausible', id: 'codes.im' }
   * - Umami:                   { provider: 'umami', id: '<website id>', src: 'https://your-umami/script.js' }
   */
  analytics: {
    provider: '' as '' | 'cloudflare' | 'plausible' | 'umami',
    id: '',
    src: '',
  },
};

/** Whether a config URL has been filled in (placeholders contain YOUR_). */
export const isSet = (url: string) => !!url && !url.includes('YOUR_');

/** "New issue" link on GitHub with a prefilled title, or '' if the repo is not configured yet. */
export function issueUrl(title: string, body = ''): string {
  if (!isSet(config.repo)) return '';
  const q = new URLSearchParams({ title, body });
  return `${config.repo.replace(/\/$/, '')}/issues/new?${q}`;
}
