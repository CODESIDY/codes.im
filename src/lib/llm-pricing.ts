// LLM API price list and cost estimation.
// Prices are USD per 1M tokens, standard (non-batch) tier, taken from each provider's official pricing page.
// Update PRICES_UPDATED whenever the table changes.

export const PRICES_UPDATED = '2026-10-22';

export interface PriceTier {
  input: number;
  /** Cached-input / cache-hit price. */
  cached?: number;
  output: number;
}

export interface ModelPrice extends PriceTier {
  id: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek';
  name: string;
  /** Context window in tokens, when the provider documents it. */
  context?: number;
  /** Higher prices that apply when a single prompt exceeds `above` input tokens. */
  long?: PriceTier & { above: number };
  note?: { en: string; zh: string };
}

export const MODELS: ModelPrice[] = [
  // OpenAI — developers.openai.com/api/docs/pricing
  { id: 'gpt-6-astra', provider: 'OpenAI', name: 'GPT-6 Astra', input: 10, cached: 1, output: 50, context: 1_050_000 },
  { id: 'gpt-6.1-sol', provider: 'OpenAI', name: 'GPT-6.1 Sol', input: 2, cached: 0.1, output: 10, context: 1_050_000 },
  { id: 'gpt-6-luna', provider: 'OpenAI', name: 'GPT-6 Luna', input: 0.1, cached: 0.01, output: 0.5, context: 1_050_000 },
  // Anthropic — platform.claude.com/docs/en/about-claude/pricing
  { id: 'claude-fable-5-1', provider: 'Anthropic', name: 'Claude Fable 5.1', input: 10, cached: 0.25, output: 50, context: 1_000_000 },
  { id: 'claude-opus-5-5', provider: 'Anthropic', name: 'Claude Opus 5.5', input: 4, cached: 0.2, output: 20, context: 1_000_000 },
  { id: 'claude-sonnet-5-5', provider: 'Anthropic', name: 'Claude Sonnet 5.5', input: 2, cached: 0.1, output: 10, context: 1_000_000 },
  {
    id: 'claude-haiku-5-5',
    provider: 'Anthropic',
    name: 'Claude Haiku 5.5',
    input: 0.1,
    cached: 0.01,
    output: 0.5,
    long: { above: 100_000, input: 0.5, cached: 0.05, output: 2.5 },
  },
  // Google — ai.google.dev/gemini-api/docs/pricing
  {
    id: 'gemini-4-argon',
    provider: 'Google',
    name: 'Gemini 4 Argon',
    input: 2,
    cached: 0.1,
    output: 10,
    context: 1_048_576,
    note: { en: 'Introductory price until 30 Nov 2026; doubles from 1 Dec 2026.', zh: '优惠价至 2026-11-30，12 月 1 日起翻倍。' },
  },
  {
    id: 'gemini-3.8-flash',
    provider: 'Google',
    name: 'Gemini 3.8 Flash',
    input: 0.75,
    cached: 0.075,
    output: 3.75,
    note: { en: 'Price doubles from 1 Jan 2027.', zh: '2027-01-01 起价格翻倍。' },
  },
  { id: 'gemini-3.5-flash-lite', provider: 'Google', name: 'Gemini 3.5 Flash-Lite', input: 0.3, cached: 0.03, output: 2.5 },
  {
    id: 'gemini-3.1-pro-preview',
    provider: 'Google',
    name: 'Gemini 3.1 Pro (preview)',
    input: 2,
    cached: 0.2,
    output: 12,
    long: { above: 200_000, input: 4, cached: 0.4, output: 18 },
  },
  // DeepSeek — api-docs.deepseek.com/quick_start/pricing (peak-hour prices; off-peak is 50% off)
  {
    id: 'deepseek-flash',
    provider: 'DeepSeek',
    name: 'DeepSeek V4.1 Flash',
    input: 0.3,
    cached: 0.006,
    output: 1.2,
    context: 1_000_000,
    note: { en: 'Peak-hour price; 50% off outside peak hours.', zh: '高峰时段价格，非高峰时段五折。' },
  },
  {
    id: 'deepseek-v4-pro',
    provider: 'DeepSeek',
    name: 'DeepSeek V4 Pro',
    input: 1.32,
    cached: 0.044,
    output: 3.96,
    context: 1_000_000,
    note: { en: 'Peak-hour price; 50% off outside peak hours.', zh: '高峰时段价格，非高峰时段五折。' },
  },
];

export interface Usage {
  /** Input (prompt) tokens per request. */
  inputTokens: number;
  /** Output tokens per request. */
  outputTokens: number;
  /** Share of input tokens served from cache, 0–1. */
  cachedShare?: number;
  /** Requests per day. */
  requestsPerDay?: number;
}

export interface Cost {
  perRequest: number;
  perDay: number;
  perMonth: number;
  /** Whether the long-context price tier was applied. */
  longTier: boolean;
  /** Whether input + output exceeds the documented context window. */
  overContext: boolean;
}

export function estimateCost(m: ModelPrice, u: Usage): Cost {
  const input = Math.max(0, u.inputTokens || 0);
  const output = Math.max(0, u.outputTokens || 0);
  const share = Math.min(1, Math.max(0, u.cachedShare ?? 0));
  const longTier = !!m.long && input > m.long.above;
  const p: PriceTier = longTier ? m.long! : m;
  const cachedPrice = p.cached ?? p.input;
  const perRequest = (input * (1 - share) * p.input + input * share * cachedPrice + output * p.output) / 1_000_000;
  const rpd = Math.max(0, u.requestsPerDay ?? 1);
  return {
    perRequest,
    perDay: perRequest * rpd,
    perMonth: perRequest * rpd * 30,
    longTier,
    overContext: m.context !== undefined && input + output > m.context,
  };
}

/** Format a USD amount with enough precision for tiny per-request costs. */
export function formatUsd(n: number): string {
  if (n === 0) return '$0';
  if (n < 0.000001) return '<$0.000001';
  if (n < 0.01) return '$' + Number(n.toPrecision(2)).toFixed(Math.min(8, 1 - Math.floor(Math.log10(n)))).replace(/0+$/, '');
  if (n < 100) return '$' + n.toFixed(2);
  return '$' + Math.round(n).toLocaleString('en-US');
}

/** "1.05M", "128K", "950". */
export function formatTokens(n: number): string {
  if (n >= 1_000_000) return +(n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return +(n / 1_000).toFixed(1) + 'K';
  return String(n);
}
