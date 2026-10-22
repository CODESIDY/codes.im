// Word / character counting for mixed Chinese–English text.

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const CJK_G = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
/** Latin-style words: letters/digits joined by apostrophes or hyphens, excluding CJK characters. */
const WORD = /(?:(?![\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])[\p{L}\p{N}])+(?:['’-](?:(?![\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])[\p{L}\p{N}])+)*/gu;

export interface TextStats {
  /** User-perceived characters (grapheme clusters), so emoji count as 1. */
  chars: number;
  charsNoSpaces: number;
  /** Chinese / Japanese / Korean characters. */
  cjk: number;
  /** Non-CJK words. */
  words: number;
  /** "字数" as counted by Word / WPS: CJK characters + non-CJK words. */
  mixedCount: number;
  punctuation: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  /** Minutes, assuming 400 CJK chars/min and 230 words/min. */
  readingMinutes: number;
  /** Minutes, assuming 240 CJK chars/min and 150 words/min. */
  speakingMinutes: number;
}

function graphemes(s: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    let n = 0;
    for (const _ of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)) n++;
    return n;
  }
  return [...s].length;
}

export function textStats(s: string): TextStats {
  const chars = graphemes(s);
  const charsNoSpaces = graphemes(s.replace(/\s/g, ''));
  const cjk = (s.match(CJK_G) ?? []).length;
  const words = (s.match(WORD) ?? []).length;
  const punctuation = (s.match(/\p{P}/gu) ?? []).length;
  const trimmed = s.trim();
  const sentences = trimmed ? trimmed.split(/(?<=[.!?。！？…])\s*|\n+/u).filter((x) => /[\p{L}\p{N}]/u.test(x)).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const lines = s ? s.split('\n').length : 0;
  const bytes = new TextEncoder().encode(s).length;
  return {
    chars,
    charsNoSpaces,
    cjk,
    words,
    mixedCount: cjk + words,
    punctuation,
    sentences,
    paragraphs,
    lines,
    bytes,
    readingMinutes: cjk / 400 + words / 230,
    speakingMinutes: cjk / 240 + words / 150,
  };
}

const STOP = new Set(
  'a an the and or but if of to in on at by for with from as is are was were be been being it its this that these those i you he she we they me my your our their not no do does did have has had will would can could should may might so than then there here what which who whom how when where why all any each some such into over under about after before again also just only very more most other out up down off'.split(
    ' ',
  ),
);
const STOP_ZH = new Set('的 了 和 是 在 我 有 就 不 人 都 一 一个 上 也 很 到 说 要 去 你 会 着 没有 看 好 自己 这 那 他 她 它 们 我们 你们 他们 与 及 或 而 并 但 被 把 让 对 从 为 以 等 中 个 这个 那个 可以 进行 如果 因为 所以'.split(' '));

/** Most frequent words (uses Intl.Segmenter for CJK). */
export function topWords(s: string, n = 10): [string, number][] {
  const counts = new Map<string, number>();
  const add = (w: string) => counts.set(w, (counts.get(w) ?? 0) + 1);
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    for (const seg of new Intl.Segmenter('zh', { granularity: 'word' }).segment(s)) {
      if (!seg.isWordLike) continue;
      const w = seg.segment.toLowerCase();
      if (/^\d+$/.test(w) || STOP.has(w) || STOP_ZH.has(w)) continue;
      if (CJK.test(w) ? [...w].length < 2 : w.length < 2) continue;
      add(w);
    }
  } else {
    for (const w of s.toLowerCase().match(WORD) ?? []) if (!STOP.has(w) && w.length > 1) add(w);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n);
}

/** "3 min" / "45 sec" style duration. */
export function formatMinutes(min: number, lang: 'en' | 'zh'): string {
  if (min <= 0) return lang === 'zh' ? '0 秒' : '0 sec';
  if (min < 1) return lang === 'zh' ? `${Math.max(1, Math.round(min * 60))} 秒` : `${Math.max(1, Math.round(min * 60))} sec`;
  const m = Math.round(min);
  if (m < 60) return lang === 'zh' ? `${m} 分钟` : `${m} min`;
  return lang === 'zh' ? `${Math.floor(m / 60)} 小时 ${m % 60} 分钟` : `${Math.floor(m / 60)} h ${m % 60} min`;
}
