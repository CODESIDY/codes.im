// Detect and fill variables in prompt templates.
// Supports {{var}} (Mustache / Jinja / LangChain chat), {var} (Python f-string / LangChain),
// ${var} (JS template literals).

export type Syntax = 'double' | 'single' | 'dollar';

export const PATTERNS: Record<Syntax, RegExp> = {
  double: /\{\{\s*([A-Za-z_][\w.-]*)\s*(?:\|[^}]*)?\}\}/g,
  single: /(?<!\{)\{([A-Za-z_][\w.]*)\}(?!\})/g,
  dollar: /\$\{\s*([A-Za-z_][\w.]*)\s*\}/g,
};

/** Pick the syntax with the most matches (ties prefer {{ }}). */
export function detectSyntax(t: string): Syntax {
  let best: Syntax = 'double';
  let max = -1;
  for (const s of ['double', 'dollar', 'single'] as Syntax[]) {
    const n = [...t.matchAll(PATTERNS[s])].length;
    if (n > max) {
      max = n;
      best = s;
    }
  }
  return best;
}

export function findVariables(t: string, syntax: Syntax): string[] {
  const seen = new Set<string>();
  for (const m of t.matchAll(PATTERNS[syntax])) seen.add(m[1]);
  return [...seen];
}

export function fillTemplate(t: string, syntax: Syntax, values: Record<string, string>, keepMissing = true): string {
  return t.replace(PATTERNS[syntax], (whole, name: string) => {
    const v = values[name];
    return v === undefined || v === '' ? (keepMissing ? whole : '') : v;
  });
}

/** Split a template into literal text and variable names: [text, name, text, name, …, text]. */
function split(t: string, syntax: Syntax): string[] {
  const re = new RegExp(PATTERNS[syntax].source, 'g');
  const out: string[] = [];
  let last = 0;
  for (const m of t.matchAll(re)) {
    out.push(t.slice(last, m.index), m[1]);
    last = m.index! + m[0].length;
  }
  out.push(t.slice(last));
  return out;
}

const ident = (v: string) => v.replace(/\W/g, '_');

/** Code snippet that renders the template with the given values. */
export function toCode(t: string, syntax: Syntax, values: Record<string, string>, lang: 'python' | 'js'): string {
  const vars = findVariables(t, syntax);
  const parts = split(t, syntax);
  if (lang === 'python') {
    const body = parts
      .map((p, i) => (i % 2 ? `{${ident(p)}}` : p.replace(/\{/g, '{{').replace(/\}/g, '}}').replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')))
      .join('');
    const args = vars.map((v) => `    ${ident(v)}=${JSON.stringify(values[v] ?? '')},`).join('\n');
    return `PROMPT = """${body}"""\n\nprompt = PROMPT.format(\n${args}\n)\n`;
  }
  const body = parts
    .map((p, i) => (i % 2 ? '${' + ident(p) + '}' : p.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')))
    .join('');
  const params = vars.map(ident).join(', ');
  const call = vars.map((v) => `  ${ident(v)}: ${JSON.stringify(values[v] ?? '')},`).join('\n');
  return `const prompt = ({ ${params} }) => \`${body}\`;\n\nconst text = prompt({\n${call}\n});\n`;
}
