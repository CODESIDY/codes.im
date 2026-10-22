import type { Lang } from '../i18n/ui';
import type { CaseStyle } from '../lib/case';

// Long-tail landing pages: /[lang]/[tool]/[preset]/ — each prefills a tool and explains one common task.

type T = Record<Lang, string>;

export interface CronPreset {
  kind: 'cron';
  tool: 'cron-parser';
  slug: string;
  expr: string;
  label: T;
}

export interface BasePreset {
  kind: 'base';
  tool: 'number-base-converter';
  slug: string;
  from: 2 | 8 | 10 | 16;
  to: 2 | 8 | 10 | 16;
  sample: string;
}

export interface CasePreset {
  kind: 'case';
  tool: 'case-converter';
  slug: string;
  from: CaseStyle;
  to: CaseStyle;
  examples: string[];
  js: string;
  py: string;
}

export type Preset = CronPreset | BasePreset | CasePreset;

const cron = (slug: string, expr: string, en: string, zh: string): CronPreset => ({ kind: 'cron', tool: 'cron-parser', slug, expr, label: { en, zh } });

export const cronPresets: CronPreset[] = [
  cron('every-minute', '* * * * *', 'every minute', '每分钟'),
  cron('every-5-minutes', '*/5 * * * *', 'every 5 minutes', '每 5 分钟'),
  cron('every-10-minutes', '*/10 * * * *', 'every 10 minutes', '每 10 分钟'),
  cron('every-15-minutes', '*/15 * * * *', 'every 15 minutes', '每 15 分钟'),
  cron('every-30-minutes', '*/30 * * * *', 'every 30 minutes', '每 30 分钟'),
  cron('every-hour', '0 * * * *', 'every hour', '每小时'),
  cron('every-2-hours', '0 */2 * * *', 'every 2 hours', '每 2 小时'),
  cron('every-6-hours', '0 */6 * * *', 'every 6 hours', '每 6 小时'),
  cron('every-12-hours', '0 */12 * * *', 'every 12 hours', '每 12 小时'),
  cron('every-day-at-midnight', '0 0 * * *', 'every day at midnight', '每天零点'),
  cron('every-day-at-2am', '0 2 * * *', 'every day at 2 AM', '每天凌晨 2 点'),
  cron('every-day-at-9am', '0 9 * * *', 'every day at 9 AM', '每天早上 9 点'),
  cron('weekdays-at-9am', '0 9 * * 1-5', 'every weekday at 9 AM', '工作日早上 9 点'),
  cron('every-30-minutes-during-work-hours', '*/30 9-18 * * 1-5', 'every 30 minutes during work hours', '工作时间每 30 分钟'),
  cron('every-monday', '0 0 * * 1', 'every Monday', '每周一'),
  cron('every-sunday', '0 0 * * 0', 'every Sunday', '每周日'),
  cron('every-weekend', '0 10 * * 6,0', 'every weekend at 10 AM', '每个周末上午 10 点'),
  cron('first-day-of-month', '0 0 1 * *', 'on the first day of every month', '每月 1 号'),
  cron('15th-of-month', '0 0 15 * *', 'on the 15th of every month', '每月 15 号'),
  cron('every-quarter', '0 0 1 */3 *', 'every quarter', '每季度'),
  cron('every-year', '0 0 1 1 *', 'every year on 1 January', '每年 1 月 1 日'),
];

const base = (slug: string, from: BasePreset['from'], to: BasePreset['to'], sample: string): BasePreset => ({ kind: 'base', tool: 'number-base-converter', slug, from, to, sample });

export const basePresets: BasePreset[] = [
  base('hex-to-decimal', 16, 10, 'FF'),
  base('decimal-to-hex', 10, 16, '255'),
  base('binary-to-decimal', 2, 10, '1011'),
  base('decimal-to-binary', 10, 2, '42'),
  base('hex-to-binary', 16, 2, '3F'),
  base('binary-to-hex', 2, 16, '11010110'),
  base('octal-to-decimal', 8, 10, '755'),
  base('decimal-to-octal', 10, 8, '493'),
];

export const casePresets: CasePreset[] = [
  {
    kind: 'case',
    tool: 'case-converter',
    slug: 'camel-case-to-snake-case',
    from: 'camel',
    to: 'snake',
    examples: ['userId', 'firstName', 'createdAt', 'XMLHttpRequest', 'orderItemId'],
    js: "const toSnake = (s) => s\n  .replace(/([a-z\\d])([A-Z])/g, '$1_$2')\n  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')\n  .toLowerCase();",
    py: "import re\n\ndef to_snake(s: str) -> str:\n    s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\\1_\\2', s)\n    return re.sub(r'([a-z\\d])([A-Z])', r'\\1_\\2', s).lower()",
  },
  {
    kind: 'case',
    tool: 'case-converter',
    slug: 'snake-case-to-camel-case',
    from: 'snake',
    to: 'camel',
    examples: ['user_id', 'first_name', 'created_at', 'order_item_id', 'is_active'],
    js: "const toCamel = (s) => s.replace(/_([a-z\\d])/g, (_, c) => c.toUpperCase());",
    py: "def to_camel(s: str) -> str:\n    first, *rest = s.split('_')\n    return first + ''.join(w.capitalize() for w in rest)",
  },
  {
    kind: 'case',
    tool: 'case-converter',
    slug: 'camel-case-to-kebab-case',
    from: 'camel',
    to: 'kebab',
    examples: ['backgroundColor', 'fontSize', 'userProfileCard', 'maxWidth', 'onClick'],
    js: "const toKebab = (s) => s.replace(/([a-z\\d])([A-Z])/g, '$1-$2').toLowerCase();",
    py: "import re\n\ndef to_kebab(s: str) -> str:\n    return re.sub(r'([a-z\\d])([A-Z])', r'\\1-\\2', s).lower()",
  },
  {
    kind: 'case',
    tool: 'case-converter',
    slug: 'kebab-case-to-camel-case',
    from: 'kebab',
    to: 'camel',
    examples: ['background-color', 'font-size', 'user-profile-card', 'max-width', 'data-test-id'],
    js: "const toCamel = (s) => s.replace(/-([a-z\\d])/g, (_, c) => c.toUpperCase());",
    py: "def to_camel(s: str) -> str:\n    first, *rest = s.split('-')\n    return first + ''.join(w.capitalize() for w in rest)",
  },
  {
    kind: 'case',
    tool: 'case-converter',
    slug: 'snake-case-to-pascal-case',
    from: 'snake',
    to: 'pascal',
    examples: ['user_profile', 'order_item', 'http_client', 'api_response', 'blog_post'],
    js: "const toPascal = (s) => s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('');",
    py: "def to_pascal(s: str) -> str:\n    return ''.join(w.capitalize() for w in s.split('_'))",
  },
  {
    kind: 'case',
    tool: 'case-converter',
    slug: 'camel-case-to-constant-case',
    from: 'camel',
    to: 'constant',
    examples: ['maxRetries', 'apiBaseUrl', 'defaultTimeout', 'enableCache', 'pageSize'],
    js: "const toConstant = (s) => s.replace(/([a-z\\d])([A-Z])/g, '$1_$2').toUpperCase();",
    py: "import re\n\ndef to_constant(s: str) -> str:\n    return re.sub(r'([a-z\\d])([A-Z])', r'\\1_\\2', s).upper()",
  },
];

export const presets: Preset[] = [...cronPresets, ...basePresets, ...casePresets];

export const presetsFor = (tool: string) => presets.filter((p) => p.tool === tool);

export const BASE_NAME: Record<number, T> = {
  2: { en: 'binary', zh: '二进制' },
  8: { en: 'octal', zh: '八进制' },
  10: { en: 'decimal', zh: '十进制' },
  16: { en: 'hexadecimal', zh: '十六进制' },
};
export const BASE_SHORT: Record<number, T> = {
  2: { en: 'Binary', zh: '二进制' },
  8: { en: 'Octal', zh: '八进制' },
  10: { en: 'Decimal', zh: '十进制' },
  16: { en: 'Hex', zh: '十六进制' },
};
export const BASE_FIELD: Record<number, string> = { 2: '#nb-bin', 8: '#nb-oct', 10: '#nb-dec', 16: '#nb-hex' };

export const CASE_NAME: Record<CaseStyle, string> = {
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  constant: 'CONSTANT_CASE',
  kebab: 'kebab-case',
  train: 'Train-Case',
  dot: 'dot.case',
  path: 'path/case',
  title: 'Title Case',
  sentence: 'Sentence case',
  lower: 'lowercase',
  upper: 'UPPERCASE',
};

export const CASE_USE: Partial<Record<CaseStyle, T>> = {
  camel: { en: 'JavaScript / TypeScript / Java variables and JSON keys in many web APIs', zh: 'JavaScript / TypeScript / Java 的变量名，以及许多 Web API 的 JSON 字段' },
  pascal: { en: 'class, type and React component names', zh: '类名、类型名和 React 组件名' },
  snake: { en: 'Python variables, Ruby, database columns and many REST APIs', zh: 'Python 变量、Ruby、数据库字段和许多 REST API' },
  constant: { en: 'constants and environment variables', zh: '常量和环境变量' },
  kebab: { en: 'URLs, CSS classes and properties, HTML attributes and CLI flags', zh: 'URL、CSS 类名与属性、HTML 属性和命令行参数' },
};
