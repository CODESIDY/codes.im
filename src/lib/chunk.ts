// Split text into chunks for RAG / embeddings, like LangChain's
// RecursiveCharacterTextSplitter: try paragraph breaks first, then lines,
// sentences, words, and finally characters, keeping each chunk under the size limit.

export interface ChunkOptions {
  size: number;
  overlap: number;
  /** Measure length in characters (default) or with a custom function such as a tokenizer. */
  length?: (s: string) => number;
  separators?: string[];
}

export interface Chunk {
  text: string;
  start: number;
  end: number;
  length: number;
}

export const DEFAULT_SEPARATORS = ['\n\n', '\n', '。', '！', '？', '. ', '! ', '? ', '；', '; ', '，', ', ', ' ', ''];

function splitKeep(text: string, sep: string): string[] {
  if (sep === '') return [...text];
  const parts = text.split(sep);
  // Keep the separator at the end of each piece so no text is lost.
  return parts.map((p, i) => (i < parts.length - 1 ? p + sep : p)).filter((p) => p !== '');
}

function recursive(text: string, seps: string[], size: number, len: (s: string) => number): string[] {
  if (len(text) <= size) return [text];
  const idx = seps.findIndex((s) => s === '' || text.includes(s));
  const sep = seps[idx];
  const rest = seps.slice(idx + 1);
  const pieces = splitKeep(text, sep);
  const out: string[] = [];
  for (const p of pieces) {
    if (len(p) > size && rest.length) out.push(...recursive(p, rest, size, len));
    else out.push(p);
  }
  return out;
}

/** Merge small pieces into chunks of at most `size`, with `overlap` carried over from the previous chunk. */
export function chunkText(text: string, o: ChunkOptions): Chunk[] {
  const len = o.length ?? ((s: string) => [...s].length);
  const size = Math.max(1, o.size);
  const overlap = Math.max(0, Math.min(o.overlap, size - 1));
  const pieces = recursive(text, o.separators ?? DEFAULT_SEPARATORS, size, len);

  const chunks: Chunk[] = [];
  let cur: string[] = [];
  let curStart = 0;
  let pos = 0; // offset of the next piece in `text`
  let curLen = 0;

  const flush = () => {
    const t = cur.join('');
    if (t.trim()) chunks.push({ text: t, start: curStart, end: curStart + t.length, length: len(t) });
  };

  for (const p of pieces) {
    const pl = len(p);
    if (cur.length && curLen + pl > size) {
      flush();
      // Carry trailing pieces as overlap.
      const keep: string[] = [];
      let keepLen = 0;
      for (let i = cur.length - 1; i >= 0; i--) {
        const l = len(cur[i]);
        if (keepLen + l > overlap || keepLen + l + pl > size) break;
        keep.unshift(cur[i]);
        keepLen += l;
      }
      curStart = pos - keep.join('').length;
      cur = keep;
      curLen = keepLen;
    }
    if (!cur.length) curStart = pos;
    cur.push(p);
    curLen += pl;
    pos += p.length;
  }
  if (cur.length) flush();
  return chunks;
}
