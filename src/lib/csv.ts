// RFC 4180 CSV parsing/serialisation with delimiter detection and JSON conversion.

export function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 10).join('\n');
  let best = ',';
  let bestScore = -1;
  for (const d of [',', '\t', ';', '|']) {
    const counts = sample
      .split('\n')
      .filter(Boolean)
      .map((l) => l.split(d).length - 1);
    if (!counts.length || counts[0] === 0) continue;
    const consistent = counts.filter((c) => c === counts[0]).length;
    const score = consistent * 100 + counts[0];
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

export function parseCsv(text: string, delimiter = detectDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let i = 0;
  const s = text.replace(/^\ufeff/, '');
  while (i < s.length) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"' && field === '') {
      quoted = true;
      i++;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
      i++;
    } else if (c === '\n' || c === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += c === '\r' && s[i + 1] === '\n' ? 2 : 1;
    } else {
      field += c;
      i++;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function infer(v: string): unknown {
  const t = v.trim();
  if (t === '') return null;
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/.test(t) && t.length < 16) return Number(t);
  if (/^(true|false)$/i.test(t)) return t.toLowerCase() === 'true';
  if (/^null$/i.test(t)) return null;
  return v;
}

export interface CsvToJsonOptions {
  header?: boolean;
  inferTypes?: boolean;
  /** Turn "a.b" headers into nested objects. */
  nest?: boolean;
  delimiter?: string;
}

function setPath(o: Record<string, unknown>, path: string, v: unknown) {
  const keys = path.split('.');
  let cur = o;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = v;
    else {
      if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
      cur = cur[k] as Record<string, unknown>;
    }
  });
}

export function csvToJson(text: string, o: CsvToJsonOptions = {}): unknown[] {
  const { header = true, inferTypes = true, nest = false } = o;
  const rows = parseCsv(text, o.delimiter ?? detectDelimiter(text));
  if (!rows.length) return [];
  const conv = (v: string) => (inferTypes ? infer(v) : v);
  if (!header) return rows.map((r) => r.map(conv));
  const keys = rows[0].map((k, i) => k.trim() || `column${i + 1}`);
  return rows.slice(1).map((r) => {
    const obj: Record<string, unknown> = {};
    keys.forEach((k, i) => {
      const v = conv(r[i] ?? '');
      if (nest && k.includes('.')) setPath(obj, k, v);
      else obj[k] = v;
    });
    return obj;
  });
}

function flatten(v: unknown, prefix: string, out: Record<string, unknown>) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const entries = Object.entries(v as object);
    if (!entries.length && prefix) out[prefix] = '{}';
    for (const [k, x] of entries) flatten(x, prefix ? `${prefix}.${k}` : k, out);
  } else out[prefix] = v;
}

function cell(v: unknown, d: string): string {
  let s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (s.includes('"') || s.includes(d) || /[\r\n]/.test(s) || /^\s|\s$/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function jsonToCsv(data: unknown, delimiter = ','): string {
  const arr = Array.isArray(data) ? data : [data];
  if (arr.every(Array.isArray)) return (arr as unknown[][]).map((r) => r.map((v) => cell(v, delimiter)).join(delimiter)).join('\n') + '\n';
  const flat = arr.map((r) => {
    const o: Record<string, unknown> = {};
    if (r && typeof r === 'object') flatten(r, '', o);
    else o.value = r;
    return o;
  });
  const keys: string[] = [];
  for (const r of flat) for (const k of Object.keys(r)) if (!keys.includes(k)) keys.push(k);
  const lines = [keys.map((k) => cell(k, delimiter)).join(delimiter)];
  for (const r of flat) lines.push(keys.map((k) => cell(r[k], delimiter)).join(delimiter));
  return lines.join('\n') + '\n';
}
