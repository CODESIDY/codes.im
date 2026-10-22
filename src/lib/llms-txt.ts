// Build an llms.txt file (https://llmstxt.org): a Markdown index that helps
// LLMs and AI agents find the most useful pages of a website.

export interface LlmsLink {
  title: string;
  url: string;
  notes?: string;
}

export interface LlmsSection {
  name: string;
  links: LlmsLink[];
}

export interface LlmsTxt {
  name: string;
  summary?: string;
  details?: string;
  sections: LlmsSection[];
}

const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

export function buildLlmsTxt(d: LlmsTxt): string {
  const out: string[] = [`# ${oneLine(d.name) || 'Untitled'}`];
  if (d.summary?.trim()) out.push('', `> ${oneLine(d.summary)}`);
  if (d.details?.trim()) out.push('', d.details.trim());
  for (const s of d.sections) {
    const links = s.links.filter((l) => l.url.trim());
    if (!links.length) continue;
    out.push('', `## ${oneLine(s.name) || 'Docs'}`, '');
    for (const l of links) {
      const title = oneLine(l.title) || l.url.trim();
      out.push(`- [${title.replace(/[[\]]/g, '')}](${l.url.trim()})${l.notes?.trim() ? `: ${oneLine(l.notes)}` : ''}`);
    }
  }
  return out.join('\n') + '\n';
}

/** Parse lines like "Title | https://… | notes" or bare URLs. */
export function parseLinkLines(text: string): LlmsLink[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const md = /^-?\s*\[([^\]]*)\]\(([^)]+)\)(?::\s*(.*))?$/.exec(line);
      if (md) return { title: md[1], url: md[2], notes: md[3] ?? '' };
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 2) return { title: parts[0], url: parts[1], notes: parts.slice(2).join(' | ') };
      return { title: titleFromUrl(line), url: line, notes: '' };
    });
}

export function titleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop();
    if (!last) return u.hostname;
    return decodeURIComponent(last)
      .replace(/\.(html?|md|mdx|php)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return url;
  }
}

/** Extract <loc> URLs from a sitemap.xml and group them by first path segment. */
export function sitemapToSections(xml: string, max = 200): LlmsSection[] {
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&')).slice(0, max);
  const groups = new Map<string, LlmsLink[]>();
  for (const url of urls) {
    let key = 'Pages';
    try {
      const seg = new URL(url).pathname.split('/').filter(Boolean)[0];
      if (seg) key = seg.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } catch {
      /* keep default */
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({ title: titleFromUrl(url), url, notes: '' });
  }
  return [...groups].map(([name, links]) => ({ name, links }));
}
