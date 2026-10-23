// Builds the site's own /llms.txt (https://llmstxt.org): a Markdown index for AI assistants.

export interface LlmsSection {
  title: string;
  links: { title: string; url: string; note?: string }[];
}

export interface LlmsSite {
  name: string;
  summary: string;
  details?: string;
  sections: LlmsSection[];
}

const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

export function buildLlmsTxt(site: LlmsSite): string {
  const out = [`# ${site.name}`, '', `> ${oneLine(site.summary)}`];
  if (site.details) out.push('', oneLine(site.details));
  for (const s of site.sections) {
    if (!s.links.length) continue;
    out.push('', `## ${s.title}`, '');
    for (const l of s.links) out.push(`- [${oneLine(l.title)}](${l.url})${l.note ? `: ${oneLine(l.note)}` : ''}`);
  }
  return out.join('\n') + '\n';
}
