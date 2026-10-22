// Turn AI-generated Markdown into clean plain text or paste-ready rich HTML.
import { marked, type Token, type Tokens } from 'marked';

export interface CleanOptions {
  /** Keep "•" / "1." list markers. */
  bullets?: boolean;
  /** Append link URLs in parentheses. */
  linkUrls?: boolean;
  /** Strip emoji. */
  removeEmoji?: boolean;
  /** Remove citation markers like [1] or 【1†source】. */
  removeCitations?: boolean;
}

const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u200D(?:\p{Extended_Pictographic})|\p{Emoji_Modifier})*[ \t]?/gu;
const CITATIONS = /\s?(?:\[\d+(?:,\s*\d+)*\]|【[^】]*†[^】]*】|\[\^\d+\])/g;

function decode(s: string) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function inline(tokens: Token[] | undefined, o: CleanOptions): string {
  if (!tokens) return '';
  return tokens
    .map((t) => {
      switch (t.type) {
        case 'link': {
          const l = t as Tokens.Link;
          const text = inline(l.tokens, o);
          return o.linkUrls && l.href && l.href !== text ? `${text} (${l.href})` : text;
        }
        case 'image':
          return (t as Tokens.Image).text;
        case 'codespan':
          return decode((t as Tokens.Codespan).text);
        case 'br':
          return '\n';
        case 'html':
          return '';
        case 'strong':
        case 'em':
        case 'del':
          return inline((t as Tokens.Strong).tokens, o);
        case 'escape':
          return (t as Tokens.Escape).text;
        default: {
          const tt = t as Tokens.Text;
          return tt.tokens ? inline(tt.tokens, o) : decode(tt.text ?? tt.raw ?? '');
        }
      }
    })
    .join('');
}

function block(tokens: Token[], o: CleanOptions, depth = 0): string[] {
  const out: string[] = [];
  for (const t of tokens) {
    switch (t.type) {
      case 'heading':
      case 'paragraph':
        out.push(inline((t as Tokens.Paragraph).tokens, o));
        break;
      case 'text': {
        const tt = t as Tokens.Text;
        out.push(tt.tokens ? inline(tt.tokens, o) : decode(tt.text));
        break;
      }
      case 'code':
        out.push((t as Tokens.Code).text);
        break;
      case 'blockquote':
        out.push(...block((t as Tokens.Blockquote).tokens, o, depth));
        break;
      case 'list': {
        const l = t as Tokens.List;
        const start = typeof l.start === 'number' ? l.start : 1;
        const lines = l.items.map((item, i) => {
          const marker = !o.bullets ? '' : l.ordered ? `${start + i}. ` : item.task ? (item.checked ? '☑ ' : '☐ ') : '• ';
          const body = block(item.tokens, o, depth + 1).join('\n');
          return marker + body.replace(/\n/g, '\n' + ' '.repeat(marker.length));
        });
        out.push(lines.join('\n'));
        break;
      }
      case 'table': {
        const tb = t as Tokens.Table;
        const rows = [tb.header.map((c) => inline(c.tokens, o)), ...tb.rows.map((r) => r.map((c) => inline(c.tokens, o)))];
        out.push(rows.map((r) => r.join('\t')).join('\n'));
        break;
      }
      case 'hr':
      case 'space':
      case 'html':
        break;
      default:
        if ('text' in t && typeof t.text === 'string') out.push(t.text);
    }
  }
  return out;
}

export function markdownToPlain(md: string, o: CleanOptions = {}): string {
  let text = block(marked.lexer(md), o).join('\n\n');
  if (o.removeCitations) text = text.replace(CITATIONS, '');
  if (o.removeEmoji) text = text.replace(EMOJI, '');
  return text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** Markdown → HTML with inline styles, so it survives pasting into Word, Docs, Notion, WeChat, Feishu… */
export function markdownToRichHtml(md: string, o: CleanOptions = {}): string {
  let src = md;
  if (o.removeCitations) src = src.replace(CITATIONS, '');
  if (o.removeEmoji) src = src.replace(EMOJI, '');
  const html = marked.parse(src, { async: false, gfm: true, breaks: false }) as string;
  const styles: Record<string, string> = {
    h1: 'font-size:1.6em;font-weight:700;margin:0.8em 0 0.4em',
    h2: 'font-size:1.35em;font-weight:700;margin:0.8em 0 0.4em',
    h3: 'font-size:1.15em;font-weight:700;margin:0.8em 0 0.4em',
    p: 'margin:0.5em 0;line-height:1.7',
    li: 'margin:0.2em 0;line-height:1.7',
    blockquote: 'margin:0.6em 0;padding:0.2em 1em;border-left:4px solid #d4d4d8;color:#52525b',
    pre: 'background:#f4f4f5;padding:12px;border-radius:6px;overflow:auto;font-size:13px',
    code: 'font-family:Menlo,Consolas,monospace;background:#f4f4f5;padding:0.1em 0.3em;border-radius:3px;font-size:0.9em',
    table: 'border-collapse:collapse;margin:0.6em 0',
    th: 'border:1px solid #d4d4d8;padding:6px 10px;background:#f4f4f5;text-align:left',
    td: 'border:1px solid #d4d4d8;padding:6px 10px',
    a: 'color:#2563eb',
  };
  return html.replace(/<(h1|h2|h3|p|li|blockquote|pre|code|table|th|td|a)(\s[^>]*)?>/g, (_m, tag: string, attrs = '') => {
    return `<${tag}${attrs} style="${styles[tag]}">`;
  });
}
