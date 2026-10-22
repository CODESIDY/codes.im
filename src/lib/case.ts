// Identifier / text case conversion.

export type CaseStyle =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'constant'
  | 'kebab'
  | 'train'
  | 'dot'
  | 'path'
  | 'title'
  | 'sentence'
  | 'lower'
  | 'upper';

export const caseStyles: CaseStyle[] = ['camel', 'pascal', 'snake', 'constant', 'kebab', 'train', 'dot', 'path', 'title', 'sentence', 'lower', 'upper'];

/**
 * Split text into words, understanding camelCase, PascalCase, snake_case, kebab-case,
 * dots, slashes and acronyms ("XMLHttpRequest" → xml, http, request; "userID2" → user, id, 2).
 */
export function splitWords(s: string): string[] {
  return (
    s
      .replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
      .replace(/(\p{L})(\d)/gu, '$1 $2')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  ).map((w) => w.toLowerCase());
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function convertCase(s: string, style: CaseStyle): string {
  const w = splitWords(s);
  switch (style) {
    case 'camel':
      return w.map((x, i) => (i ? cap(x) : x)).join('');
    case 'pascal':
      return w.map(cap).join('');
    case 'snake':
      return w.join('_');
    case 'constant':
      return w.join('_').toUpperCase();
    case 'kebab':
      return w.join('-');
    case 'train':
      return w.map(cap).join('-');
    case 'dot':
      return w.join('.');
    case 'path':
      return w.join('/');
    case 'title':
      return w.map(cap).join(' ');
    case 'sentence':
      return cap(w.join(' '));
    case 'lower':
      return s.toLowerCase();
    case 'upper':
      return s.toUpperCase();
  }
}

/** Convert each non-empty line separately, keeping blank lines. */
export function convertLines(text: string, style: CaseStyle): string {
  return text
    .split('\n')
    .map((line) => (line.trim() ? convertCase(line, style) : line))
    .join('\n');
}
