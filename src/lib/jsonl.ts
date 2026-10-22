// Validate JSONL files, with extra checks for OpenAI-style chat fine-tuning data.

export type JsonlFormat = 'chat' | 'prompt-completion' | 'generic';

export interface LineIssue {
  line: number;
  level: 'error' | 'warning';
  message: string;
}

export interface JsonlReport {
  lines: number;
  valid: number;
  format: JsonlFormat;
  issues: LineIssue[];
  rows: unknown[];
  /** Count of each role across all chat examples. */
  roles: Record<string, number>;
  keys: string[];
}

const ROLES = new Set(['system', 'developer', 'user', 'assistant', 'tool', 'function']);

function detectFormat(o: unknown): JsonlFormat {
  if (o && typeof o === 'object') {
    if (Array.isArray((o as Record<string, unknown>).messages)) return 'chat';
    if ('prompt' in o && 'completion' in o) return 'prompt-completion';
  }
  return 'generic';
}

function checkChat(o: Record<string, unknown>, line: number, issues: LineIssue[], roles: Record<string, number>) {
  const msgs = o.messages as unknown[];
  if (!msgs.length) {
    issues.push({ line, level: 'error', message: '"messages" is empty' });
    return;
  }
  let hasAssistant = false;
  msgs.forEach((m, i) => {
    if (!m || typeof m !== 'object') {
      issues.push({ line, level: 'error', message: `messages[${i}] is not an object` });
      return;
    }
    const msg = m as Record<string, unknown>;
    const role = msg.role;
    if (typeof role !== 'string' || !ROLES.has(role)) {
      issues.push({ line, level: 'error', message: `messages[${i}].role is ${JSON.stringify(role)}; expected system, user, assistant or tool` });
      return;
    }
    roles[role] = (roles[role] ?? 0) + 1;
    if (role === 'assistant') hasAssistant = true;
    const content = msg.content;
    const hasTools = Array.isArray(msg.tool_calls) || msg.function_call;
    if (content === undefined && !hasTools) {
      issues.push({ line, level: 'error', message: `messages[${i}] (${role}) has no "content"` });
    } else if (typeof content === 'string' && !content.trim() && !hasTools) {
      issues.push({ line, level: 'warning', message: `messages[${i}] (${role}) has empty content` });
    }
    if ('weight' in msg && msg.weight !== 0 && msg.weight !== 1) {
      issues.push({ line, level: 'error', message: `messages[${i}].weight must be 0 or 1` });
    }
  });
  if (!hasAssistant) issues.push({ line, level: 'error', message: 'No assistant message — nothing for the model to learn' });
  const last = msgs[msgs.length - 1] as Record<string, unknown> | undefined;
  if (last && last.role !== 'assistant') {
    issues.push({ line, level: 'warning', message: `Last message is "${String(last.role)}", usually it should be "assistant"` });
  }
}

export function validateJsonl(text: string, maxRows = 200): JsonlReport {
  const report: JsonlReport = { lines: 0, valid: 0, format: 'generic', issues: [], rows: [], roles: {}, keys: [] };
  const keys = new Set<string>();
  let formatSet = false;
  const lines = text.split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const line = idx + 1;
    if (!raw.trim()) {
      if (idx < lines.length - 1) report.issues.push({ line, level: 'warning', message: 'Blank line' });
      return;
    }
    report.lines++;
    let o: unknown;
    try {
      o = JSON.parse(raw);
    } catch (e) {
      report.issues.push({ line, level: 'error', message: (e as Error).message });
      return;
    }
    if (!o || typeof o !== 'object' || Array.isArray(o)) {
      report.issues.push({ line, level: 'error', message: 'Each line should be a JSON object' });
      return;
    }
    report.valid++;
    if (report.rows.length < maxRows) report.rows.push(o);
    Object.keys(o).forEach((k) => keys.add(k));
    if (!formatSet) {
      report.format = detectFormat(o);
      formatSet = true;
    }
    if (report.format === 'chat') {
      if (!Array.isArray((o as Record<string, unknown>).messages)) {
        report.issues.push({ line, level: 'error', message: 'Missing "messages" array' });
      } else checkChat(o as Record<string, unknown>, line, report.issues, report.roles);
    } else if (report.format === 'prompt-completion') {
      const r = o as Record<string, unknown>;
      if (typeof r.prompt !== 'string' || typeof r.completion !== 'string') {
        report.issues.push({ line, level: 'error', message: '"prompt" and "completion" must be strings' });
      }
    }
  });
  report.keys = [...keys];
  return report;
}

/** JSON array → JSONL. */
export function arrayToJsonl(text: string): string {
  const v = JSON.parse(text);
  if (!Array.isArray(v)) throw new Error('Input must be a JSON array');
  return v.map((x) => JSON.stringify(x)).join('\n') + '\n';
}

/** JSONL → pretty JSON array. */
export function jsonlToArray(text: string): string {
  const rows = text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        throw new Error(`Line ${i + 1}: ${(e as Error).message}`);
      }
    });
  return JSON.stringify(rows, null, 2);
}
