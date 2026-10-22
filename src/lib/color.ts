// Color parsing and conversion between sRGB hex, rgb(), hsl() and oklch().

export interface RGBA {
  r: number; // 0–255
  g: number;
  b: number;
  a: number; // 0–1
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => {
  const f = 10 ** d;
  return Math.round(v * f) / f;
};

function num(token: string, scale: number): number {
  const t = token.trim();
  if (t.endsWith('%')) return (parseFloat(t) / 100) * scale;
  return parseFloat(t);
}

function alpha(token: string | undefined): number {
  if (token === undefined) return 1;
  return clamp(num(token, 1), 0, 1);
}

/** Split "a b c / d" or "a, b, c, d" into components. */
function parts(inner: string): [string[], string | undefined] {
  const [main, slashAlpha] = inner.split('/');
  const items = main.trim().split(/[\s,]+/).filter(Boolean);
  if (slashAlpha !== undefined) return [items, slashAlpha.trim()];
  return items.length === 4 ? [items.slice(0, 3), items[3]] : [items, undefined];
}

export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase();
  let m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? round(parseInt(h.slice(6, 8), 16) / 255, 3) : 1,
    };
  }
  m = /^(rgba?|hsla?|oklch)\((.*)\)$/.exec(s);
  if (!m) return null;
  const [p, a] = parts(m[2]);
  if (p.length !== 3 || p.some((x) => Number.isNaN(parseFloat(x)))) return null;

  if (m[1].startsWith('rgb')) {
    const [r, g, b] = p.map((x) => clamp(num(x, 255), 0, 255));
    return { r, g, b, a: alpha(a) };
  }
  if (m[1].startsWith('hsl')) {
    const h = parseFloat(p[0]);
    const sat = clamp(num(p[1].endsWith('%') ? p[1] : p[1] + '%', 1), 0, 1);
    const l = clamp(num(p[2].endsWith('%') ? p[2] : p[2] + '%', 1), 0, 1);
    return { ...hslToRgb(h, sat, l), a: alpha(a) };
  }
  // oklch(L C H): L as 0–1 or %, C as number or % of 0.4
  const L = clamp(p[0].endsWith('%') ? parseFloat(p[0]) / 100 : parseFloat(p[0]), 0, 1);
  const C = Math.max(0, p[1].endsWith('%') ? (parseFloat(p[1]) / 100) * 0.4 : parseFloat(p[1]));
  const H = parseFloat(p[2]);
  return { ...oklchToRgb(L, C, H), a: alpha(a) };
}

function hslToRgb(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12;
  const A = s * Math.min(l, 1 - l);
  const f = (n: number) => l - A * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

export function rgbToHsl({ r, g, b }: RGBA) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

const toLinear = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklch({ r, g, b }: RGBA) {
  const R = toLinear(r),
    G = toLinear(g),
    B = toLinear(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: C < 1e-4 ? 0 : H };
}

function oklchToRgb(L: number, C: number, H: number) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return { r: clamp(fromLinear(R), 0, 255), g: clamp(fromLinear(G), 0, 255), b: clamp(fromLinear(B), 0, 255) };
}

export function relativeLuminance({ r, g, b }: RGBA): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(a: RGBA, b: RGBA): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function formats(c: RGBA) {
  const r = Math.round(c.r),
    g = Math.round(c.g),
    b = Math.round(c.b);
  const hx = (n: number) => n.toString(16).padStart(2, '0');
  const hasAlpha = c.a < 1;
  const aStr = hasAlpha ? ` / ${round(c.a, 3)}` : '';
  const hsl = rgbToHsl(c);
  const ok = rgbToOklch(c);
  return {
    hex: `#${hx(r)}${hx(g)}${hx(b)}${hasAlpha ? hx(Math.round(c.a * 255)) : ''}`,
    rgb: `rgb(${r} ${g} ${b}${aStr})`,
    hsl: `hsl(${round(hsl.h, 1)} ${round(hsl.s, 1)}% ${round(hsl.l, 1)}%${aStr})`,
    oklch: `oklch(${round(ok.l * 100, 2)}% ${round(ok.c, 4)} ${round(ok.h, 2)}${aStr})`,
  };
}
