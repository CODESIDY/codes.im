/** Rough reading time: ~250 English words or ~400 CJK characters per minute. */
export function readingMinutes(body: string | undefined): number {
  const text = (body ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = text.replace(/[\u3400-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 250 + cjk / 400));
}
