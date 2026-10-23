import { langs, type Lang } from '../../i18n/ui';
import { siteLlmsTxt } from '../../lib/llms-endpoint';

export function getStaticPaths() {
  return langs.filter((l) => l !== 'en').map((lang) => ({ params: { lang } }));
}

export async function GET({ params }: { params: { lang: Lang } }) {
  return siteLlmsTxt(params.lang);
}
