// Standard 5-field cron (minute hour day-of-month month day-of-week) with
// names, ranges, steps, lists and @macros. Computes upcoming run times.

export interface CronFields {
  minute: Set<number>;
  hour: Set<number>;
  dom: Set<number>;
  month: Set<number>;
  dow: Set<number>;
  domStar: boolean;
  dowStar: boolean;
}

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function normalizeCron(expr: string): string {
  const e = expr.trim().replace(/\s+/g, ' ');
  return MACROS[e.toLowerCase()] ?? e;
}

function parseField(src: string, min: number, max: number, names: string[] | null, label: string): Set<number> {
  const out = new Set<number>();
  const val = (t: string) => {
    const up = t.toUpperCase();
    if (names) {
      const i = names.indexOf(up);
      if (i >= 0) return i + (label === 'month' ? 1 : 0);
    }
    if (!/^\d+$/.test(t)) throw new Error(`Invalid ${label} value "${t}"`);
    return Number(t);
  };
  for (const part of src.split(',')) {
    const [rangePart, stepPart] = part.split('/');
    const step = stepPart === undefined ? 1 : Number(stepPart);
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step in ${label}: "${part}"`);
    let lo: number, hi: number;
    if (rangePart === '*' || rangePart === '?') {
      lo = min;
      hi = max;
    } else if (rangePart.includes('-')) {
      const [a, b] = rangePart.split('-');
      lo = val(a);
      hi = val(b);
    } else {
      lo = val(rangePart);
      hi = stepPart === undefined ? lo : max;
    }
    if (lo < min || hi > max || lo > hi) throw new Error(`${label} out of range (${min}-${max}): "${part}"`);
    for (let v = lo; v <= hi; v += step) out.add(label === 'day-of-week' && v === 7 ? 0 : v);
  }
  return out;
}

export function parseCron(expr: string): CronFields {
  const parts = normalizeCron(expr).split(' ');
  if (parts.length !== 5) throw new Error(`Expected 5 fields (minute hour day month weekday), got ${parts.length}`);
  const [mi, h, dom, mo, dow] = parts;
  return {
    minute: parseField(mi, 0, 59, null, 'minute'),
    hour: parseField(h, 0, 23, null, 'hour'),
    dom: parseField(dom, 1, 31, null, 'day-of-month'),
    month: parseField(mo, 1, 12, MONTHS, 'month'),
    dow: parseField(dow, 0, 7, DAYS, 'day-of-week'),
    domStar: dom === '*' || dom === '?',
    dowStar: dow === '*' || dow === '?',
  };
}

function dayMatches(f: CronFields, d: Date): boolean {
  const domOk = f.dom.has(d.getDate());
  const dowOk = f.dow.has(d.getDay());
  if (f.domStar && f.dowStar) return true;
  if (f.domStar) return dowOk;
  if (f.dowStar) return domOk;
  return domOk || dowOk; // classic cron: either restriction matches
}

/** Next `count` run times strictly after `from`, in the runtime's local time zone. */
export function nextRuns(expr: string, count = 10, from = new Date()): Date[] {
  const f = parseCron(expr);
  const out: Date[] = [];
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  const limit = from.getTime() + 5 * 366 * 24 * 3600 * 1000;
  while (out.length < count && d.getTime() < limit) {
    if (!f.month.has(d.getMonth() + 1)) {
      d.setMonth(d.getMonth() + 1, 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!dayMatches(f, d)) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!f.hour.has(d.getHours())) {
      d.setHours(d.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!f.minute.has(d.getMinutes())) {
      d.setMinutes(d.getMinutes() + 1, 0, 0);
      continue;
    }
    out.push(new Date(d.getTime()));
    d.setMinutes(d.getMinutes() + 1, 0, 0);
  }
  return out;
}
