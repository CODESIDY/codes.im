// Social preview (Open Graph) image helpers shared by the layout and the generator.
import type { Lang } from '../i18n/ui';

/** "/zh/cron-parser/every-5-minutes/" → "cron-parser--every-5-minutes"; "/zh/" → "index". */
export function ogKey(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'en' || parts[0] === 'zh') parts.shift();
  return parts.length ? parts.join('--') : 'index';
}

export const ogPath = (lang: Lang, key: string) => `/og/${lang}/${key}.jpg`;
