export type Unit = 's' | 'ms' | 'us' | 'ns';

/** Guess the unit of a numeric timestamp from its magnitude. */
export function detectUnit(n: number): Unit {
  const a = Math.abs(n);
  if (a < 1e11) return 's'; // up to year ~5138 in seconds
  if (a < 1e14) return 'ms';
  if (a < 1e17) return 'us';
  return 'ns';
}

export function toMillis(n: number, unit: Unit): number {
  return unit === 's' ? n * 1000 : unit === 'ms' ? n : unit === 'us' ? n / 1000 : n / 1e6;
}

/** "3 days ago" / "in 2 hours", localized with Intl.RelativeTimeFormat. */
export function relativeTime(ms: number, now: number, locale: string): string {
  const diff = (ms - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, sec] of steps) {
    if (Math.abs(diff) >= sec || unit === 'second') return rtf.format(Math.round(diff / sec), unit);
  }
  return '';
}

/** Format a Date as the value of an <input type="datetime-local" step="1">. */
export function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
