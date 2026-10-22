// User-Agent parsing: browser, engine, OS, device type and bots (including AI crawlers).

export interface BotInfo {
  name: string;
  owner: string;
  kind: 'ai' | 'search' | 'social' | 'tool' | 'other';
}

export interface UAResult {
  browser: { name: string; version: string };
  engine: { name: string; version: string };
  os: { name: string; version: string };
  device: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
  bot?: BotInfo;
}

const BOTS: [RegExp, BotInfo][] = [
  [/GPTBot/i, { name: 'GPTBot', owner: 'OpenAI', kind: 'ai' }],
  [/ChatGPT-User/i, { name: 'ChatGPT-User', owner: 'OpenAI', kind: 'ai' }],
  [/OAI-SearchBot/i, { name: 'OAI-SearchBot', owner: 'OpenAI', kind: 'ai' }],
  [/ClaudeBot/i, { name: 'ClaudeBot', owner: 'Anthropic', kind: 'ai' }],
  [/Claude-User/i, { name: 'Claude-User', owner: 'Anthropic', kind: 'ai' }],
  [/Claude-SearchBot/i, { name: 'Claude-SearchBot', owner: 'Anthropic', kind: 'ai' }],
  [/anthropic-ai/i, { name: 'anthropic-ai', owner: 'Anthropic', kind: 'ai' }],
  [/PerplexityBot/i, { name: 'PerplexityBot', owner: 'Perplexity', kind: 'ai' }],
  [/Perplexity-User/i, { name: 'Perplexity-User', owner: 'Perplexity', kind: 'ai' }],
  [/Google-CloudVertexBot/i, { name: 'Google-CloudVertexBot', owner: 'Google', kind: 'ai' }],
  [/Bytespider/i, { name: 'Bytespider', owner: 'ByteDance', kind: 'ai' }],
  [/CCBot/i, { name: 'CCBot', owner: 'Common Crawl', kind: 'ai' }],
  [/Amazonbot/i, { name: 'Amazonbot', owner: 'Amazon', kind: 'ai' }],
  [/meta-externalagent/i, { name: 'meta-externalagent', owner: 'Meta', kind: 'ai' }],
  [/cohere-ai/i, { name: 'cohere-ai', owner: 'Cohere', kind: 'ai' }],
  [/Diffbot/i, { name: 'Diffbot', owner: 'Diffbot', kind: 'ai' }],
  [/Googlebot/i, { name: 'Googlebot', owner: 'Google', kind: 'search' }],
  [/bingbot/i, { name: 'Bingbot', owner: 'Microsoft', kind: 'search' }],
  [/Baiduspider/i, { name: 'Baiduspider', owner: 'Baidu', kind: 'search' }],
  [/YandexBot/i, { name: 'YandexBot', owner: 'Yandex', kind: 'search' }],
  [/DuckDuckBot/i, { name: 'DuckDuckBot', owner: 'DuckDuckGo', kind: 'search' }],
  [/Applebot/i, { name: 'Applebot', owner: 'Apple', kind: 'search' }],
  [/Sogou/i, { name: 'Sogou Spider', owner: 'Sogou', kind: 'search' }],
  [/360Spider/i, { name: '360Spider', owner: 'Qihoo 360', kind: 'search' }],
  [/facebookexternalhit/i, { name: 'facebookexternalhit', owner: 'Meta', kind: 'social' }],
  [/Twitterbot/i, { name: 'Twitterbot', owner: 'X', kind: 'social' }],
  [/LinkedInBot/i, { name: 'LinkedInBot', owner: 'LinkedIn', kind: 'social' }],
  [/Slackbot/i, { name: 'Slackbot', owner: 'Slack', kind: 'social' }],
  [/Discordbot/i, { name: 'Discordbot', owner: 'Discord', kind: 'social' }],
  [/TelegramBot/i, { name: 'TelegramBot', owner: 'Telegram', kind: 'social' }],
  [/^curl\//i, { name: 'curl', owner: '', kind: 'tool' }],
  [/^Wget\//i, { name: 'Wget', owner: '', kind: 'tool' }],
  [/python-requests|python-httpx|aiohttp|Python-urllib/i, { name: 'Python HTTP client', owner: '', kind: 'tool' }],
  [/PostmanRuntime/i, { name: 'Postman', owner: 'Postman', kind: 'tool' }],
  [/Go-http-client/i, { name: 'Go net/http', owner: '', kind: 'tool' }],
  [/node-fetch|undici|axios|okhttp|Java\//i, { name: 'HTTP library', owner: '', kind: 'tool' }],
  [/HeadlessChrome/i, { name: 'Headless Chrome', owner: '', kind: 'tool' }],
  [/bot|crawler|spider|crawling/i, { name: 'Unknown bot', owner: '', kind: 'other' }],
];

const ver = (ua: string, re: RegExp) => (re.exec(ua)?.[1] ?? '').replace(/_/g, '.');

function browser(ua: string): UAResult['browser'] {
  const rules: [string, RegExp][] = [
    ['WeChat', /MicroMessenger\/([\d.]+)/],
    ['QQ Browser', /MQQBrowser\/([\d.]+)|QQBrowser\/([\d.]+)/],
    ['UC Browser', /UCBrowser\/([\d.]+)/],
    ['Samsung Internet', /SamsungBrowser\/([\d.]+)/],
    ['Microsoft Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ['Opera', /(?:OPR|Opera)\/([\d.]+)/],
    ['Vivaldi', /Vivaldi\/([\d.]+)/],
    ['Yandex Browser', /YaBrowser\/([\d.]+)/],
    ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
    ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
    ['Safari', /Version\/([\d.]+).*Safari\//],
  ];
  for (const [name, re] of rules) {
    const m = re.exec(ua);
    if (m) return { name, version: m[1] ?? m[2] ?? '' };
  }
  if (/Trident\/|MSIE /.test(ua)) return { name: 'Internet Explorer', version: ver(ua, /(?:MSIE |rv:)([\d.]+)/) };
  return { name: '', version: '' };
}

function engine(ua: string): UAResult['engine'] {
  if (/Gecko\/\d/.test(ua) && /Firefox|FxiOS/.test(ua)) return { name: 'Gecko', version: ver(ua, /rv:([\d.]+)/) };
  if (/(?:iPhone|iPad|iPod).*AppleWebKit/.test(ua)) return { name: 'WebKit', version: ver(ua, /AppleWebKit\/([\d.]+)/) };
  if (/Chrome\/|CriOS|Edg/.test(ua)) return { name: 'Blink', version: ver(ua, /Chrome\/([\d.]+)/) };
  if (/AppleWebKit/.test(ua)) return { name: 'WebKit', version: ver(ua, /AppleWebKit\/([\d.]+)/) };
  if (/Trident/.test(ua)) return { name: 'Trident', version: ver(ua, /Trident\/([\d.]+)/) };
  return { name: '', version: '' };
}

const WINDOWS: Record<string, string> = { '10.0': '10 / 11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' };

function os(ua: string): UAResult['os'] {
  let m: RegExpExecArray | null;
  if ((m = /OpenHarmony ([\d.]+)/.exec(ua))) return { name: 'OpenHarmony', version: m[1] };
  if ((m = /HarmonyOS[ /]?([\d.]*)/.exec(ua))) return { name: 'HarmonyOS', version: m[1] };
  if ((m = /Windows NT ([\d.]+)/.exec(ua))) return { name: 'Windows', version: WINDOWS[m[1]] ?? m[1] };
  if ((m = /(?:iPhone|iPod).*? OS ([\d_]+)/.exec(ua))) return { name: 'iOS', version: m[1].replace(/_/g, '.') };
  if ((m = /iPad.*? OS ([\d_]+)/.exec(ua))) return { name: 'iPadOS', version: m[1].replace(/_/g, '.') };
  if ((m = /Android ([\d.]+)/.exec(ua))) return { name: 'Android', version: m[1] };
  if (/CrOS/.test(ua)) return { name: 'ChromeOS', version: ver(ua, /CrOS \S+ ([\d.]+)/) };
  if ((m = /Mac OS X ([\d_.]+)/.exec(ua))) return { name: 'macOS', version: m[1].replace(/_/g, '.') };
  if (/Linux/.test(ua)) return { name: 'Linux', version: '' };
  return { name: '', version: '' };
}

export function parseUA(ua: string): UAResult {
  const s = ua.trim();
  const botEntry = BOTS.find(([re]) => re.test(s));
  const r: UAResult = { browser: browser(s), engine: engine(s), os: os(s), device: 'unknown' };
  if (botEntry) {
    r.bot = botEntry[1];
    r.device = 'bot';
    return r;
  }
  if (/iPad|Tablet|PlayBook|Silk/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s))) r.device = 'tablet';
  else if (/Mobi|iPhone|iPod|Android|Windows Phone|HarmonyOS.*Phone/i.test(s)) r.device = 'mobile';
  else if (/Windows|Macintosh|X11|Linux|CrOS/i.test(s)) r.device = 'desktop';
  return r;
}

/** robots.txt rules that block the AI crawlers we know about. */
export function aiRobotsTxt(): string {
  const names = [...new Set(BOTS.filter(([, b]) => b.kind === 'ai').map(([, b]) => b.name))];
  return names.map((n) => `User-agent: ${n}\nDisallow: /`).join('\n\n') + '\n';
}
