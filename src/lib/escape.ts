// Text escaping: HTML entities, Unicode escapes and JSON / JS string literals.

const HTML_NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®', trade: '™',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»',
  middot: '·', bull: '•', deg: '°', times: '×', divide: '÷', plusmn: '±', euro: '€', pound: '£', yen: '¥',
  cent: '¢', sect: '§', para: '¶', larr: '←', rarr: '→', uarr: '↑', darr: '↓', harr: '↔', hearts: '♥', check: '✓',
};

export function htmlEncode(s: string, mode: 'minimal' | 'non-ascii' = 'minimal'): string {
  let out = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  if (mode === 'non-ascii') out = out.replace(/[^\x00-\x7f]/gu, (c) => `&#${c.codePointAt(0)};`);
  return out;
}

export function htmlDecode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, body: string) => {
    if (body[0] === '#') {
      const cp = body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    }
    return HTML_NAMED[body.toLowerCase()] ?? HTML_NAMED[body] ?? m;
  });
}

export type UnicodeStyle = 'js' | 'es6' | 'python' | 'css' | 'html';

export function unicodeEscape(s: string, style: UnicodeStyle, onlyNonAscii = true): string {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (onlyNonAscii && cp < 0x80) {
      out += ch;
      continue;
    }
    const hex = cp.toString(16).toUpperCase();
    switch (style) {
      case 'js':
        // UTF-16 code units, as in JSON and older JavaScript (astral characters become surrogate pairs).
        out += ch
          .split('')
          .map((u) => `\\u${u.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
          .join('');
        break;
      case 'es6':
        out += `\\u{${hex}}`;
        break;
      case 'python':
        out += cp > 0xffff ? `\\U${hex.padStart(8, '0')}` : `\\u${hex.padStart(4, '0')}`;
        break;
      case 'css':
        out += `\\${hex} `;
        break;
      case 'html':
        out += `&#x${hex};`;
        break;
    }
  }
  return out;
}

export function unicodeUnescape(s: string): string {
  return s
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\U([0-9a-fA-F]{8})/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/(?:\\u[0-9a-fA-F]{4})+/g, (m) => String.fromCharCode(...m.split('\\u').filter(Boolean).map((h) => parseInt(h, 16))))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)));
}

/** Escape text as a JSON string body (without the surrounding quotes). */
export const jsonEscape = (s: string) => JSON.stringify(s).slice(1, -1);

export function jsonUnescape(s: string): string {
  const t = s.trim();
  const quoted = /^".*"$/s.test(t) ? t : `"${t.replace(/(?<!\\)"/g, '\\"').replace(/\n/g, '\\n')}"`;
  return JSON.parse(quoted);
}

/** Inspect code points: useful for spotting invisible or look-alike characters. */
export function codePoints(s: string, max = 500): { ch: string; cp: string; name: string }[] {
  const special: Record<number, string> = {
    0x20: 'SPACE', 0xa0: 'NO-BREAK SPACE', 0x200b: 'ZERO WIDTH SPACE', 0x200c: 'ZERO WIDTH NON-JOINER',
    0x200d: 'ZERO WIDTH JOINER', 0x2060: 'WORD JOINER', 0xfeff: 'BOM / ZERO WIDTH NO-BREAK SPACE', 0x09: 'TAB',
    0x0a: 'LINE FEED', 0x0d: 'CARRIAGE RETURN', 0x3000: 'IDEOGRAPHIC SPACE', 0x2028: 'LINE SEPARATOR',
    0x200e: 'LEFT-TO-RIGHT MARK', 0x200f: 'RIGHT-TO-LEFT MARK', 0xad: 'SOFT HYPHEN',
  };
  return [...s].slice(0, max).map((ch) => {
    const cp = ch.codePointAt(0)!;
    return { ch, cp: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'), name: special[cp] ?? '' };
  });
}
