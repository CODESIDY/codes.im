// Parse a curl command line and generate equivalent code.

export interface CurlRequest {
  method: string;
  url: string;
  headers: [string, string][];
  /** Raw request body, if any. */
  body?: string;
  /** Multipart form fields from -F. */
  form?: [string, string][];
  /** Basic auth "user:pass" from -u. */
  auth?: string;
  insecure?: boolean;
  followRedirects?: boolean;
}

/** POSIX-ish shell tokenizer: quotes, escapes and line continuations. */
export function shellSplit(input: string): string[] {
  const s = input.replace(/\\\r?\n/g, ' ').replace(/\^\r?\n/g, ' '); // bash \ and Windows ^ continuations
  const out: string[] = [];
  let cur = '';
  let has = false;
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "'") {
      const end = s.indexOf("'", i + 1);
      if (end === -1) throw new Error('Unterminated single quote');
      cur += s.slice(i + 1, end);
      has = true;
      i = end + 1;
    } else if (c === '$' && s[i + 1] === "'") {
      // ANSI-C quoting: $'...\n...'
      let j = i + 2;
      while (j < s.length && s[j] !== "'") {
        if (s[j] === '\\' && j + 1 < s.length) {
          const n = s[j + 1];
          cur += n === 'n' ? '\n' : n === 't' ? '\t' : n === 'r' ? '\r' : n;
          j += 2;
        } else cur += s[j++];
      }
      has = true;
      i = j + 1;
    } else if (c === '"') {
      let j = i + 1;
      while (j < s.length && s[j] !== '"') {
        if (s[j] === '\\' && j + 1 < s.length && '"\\$`'.includes(s[j + 1])) {
          cur += s[j + 1];
          j += 2;
        } else cur += s[j++];
      }
      if (j >= s.length) throw new Error('Unterminated double quote');
      has = true;
      i = j + 1;
    } else if (c === '\\' && i + 1 < s.length) {
      cur += s[i + 1];
      has = true;
      i += 2;
    } else if (/\s/.test(c)) {
      if (has) out.push(cur);
      cur = '';
      has = false;
      i++;
    } else {
      cur += c;
      has = true;
      i++;
    }
  }
  if (has) out.push(cur);
  return out;
}

export function parseCurl(cmd: string): CurlRequest {
  const args = shellSplit(cmd.trim().replace(/^\$\s*/, ''));
  if (args[0] !== 'curl') throw new Error('Command must start with "curl"');
  const req: CurlRequest = { method: '', url: '', headers: [] };
  const data: string[] = [];
  const form: [string, string][] = [];
  let getMode = false;
  let head = false;

  const takesValue = new Set([
    '-X', '--request', '-H', '--header', '-d', '--data', '--data-raw', '--data-binary', '--data-ascii',
    '--data-urlencode', '--json', '-F', '--form', '--form-string', '-u', '--user', '-A', '--user-agent',
    '-e', '--referer', '-b', '--cookie', '--url', '-o', '--output', '-m', '--max-time', '--connect-timeout',
    '-x', '--proxy', '--retry', '-w', '--write-out', '-c', '--cookie-jar', '--cacert', '--cert', '--key',
  ]);

  for (let i = 1; i < args.length; i++) {
    let a = args[i];
    let v: string | undefined;
    // --opt=value
    const eq = a.startsWith('--') ? a.indexOf('=') : -1;
    if (eq > 0) {
      v = a.slice(eq + 1);
      a = a.slice(0, eq);
    } else if (/^-[A-Za-z]./.test(a) && takesValue.has(a.slice(0, 2))) {
      // -XPOST, -H'...'
      v = a.slice(2);
      a = a.slice(0, 2);
    }
    const next = () => (v !== undefined ? v : args[++i] ?? '');

    switch (a) {
      case '-X':
      case '--request':
        req.method = next().toUpperCase();
        break;
      case '-H':
      case '--header': {
        const h = next();
        const c = h.indexOf(':');
        if (c > 0) req.headers.push([h.slice(0, c).trim(), h.slice(c + 1).trim()]);
        break;
      }
      case '-d':
      case '--data':
      case '--data-ascii':
      case '--data-binary':
      case '--data-raw':
        data.push(next());
        break;
      case '--data-urlencode': {
        const raw = next();
        const k = raw.indexOf('=');
        data.push(k >= 0 ? `${raw.slice(0, k)}=${encodeURIComponent(raw.slice(k + 1))}` : encodeURIComponent(raw));
        break;
      }
      case '--json':
        data.push(next());
        if (!req.headers.some(([k]) => k.toLowerCase() === 'content-type')) req.headers.push(['Content-Type', 'application/json']);
        if (!req.headers.some(([k]) => k.toLowerCase() === 'accept')) req.headers.push(['Accept', 'application/json']);
        break;
      case '-F':
      case '--form':
      case '--form-string': {
        const f = next();
        const k = f.indexOf('=');
        form.push([f.slice(0, k), f.slice(k + 1)]);
        break;
      }
      case '-u':
      case '--user':
        req.auth = next();
        break;
      case '-A':
      case '--user-agent':
        req.headers.push(['User-Agent', next()]);
        break;
      case '-e':
      case '--referer':
        req.headers.push(['Referer', next()]);
        break;
      case '-b':
      case '--cookie':
        req.headers.push(['Cookie', next()]);
        break;
      case '--url':
        req.url = next();
        break;
      case '-G':
      case '--get':
        getMode = true;
        break;
      case '-I':
      case '--head':
        head = true;
        break;
      case '-k':
      case '--insecure':
        req.insecure = true;
        break;
      case '-L':
      case '--location':
        req.followRedirects = true;
        break;
      default:
        if (takesValue.has(a)) next();
        else if (!a.startsWith('-') && !req.url) req.url = a;
    }
  }

  if (!req.url) throw new Error('No URL found');
  if (!/^[a-z]+:\/\//i.test(req.url)) req.url = 'http://' + req.url;

  if (getMode && data.length) {
    req.url += (req.url.includes('?') ? '&' : '?') + data.join('&');
  } else if (data.length) {
    req.body = data.join('&');
    if (!req.headers.some(([k]) => k.toLowerCase() === 'content-type')) {
      req.headers.push(['Content-Type', 'application/x-www-form-urlencoded']);
    }
  }
  if (form.length) req.form = form;
  req.method ||= head ? 'HEAD' : req.body !== undefined || form.length ? 'POST' : 'GET';
  return req;
}

// ------------------------------------------------------------ generators

const q = (s: string) => JSON.stringify(s);
const isJson = (r: CurlRequest) =>
  r.headers.some(([k, v]) => k.toLowerCase() === 'content-type' && v.includes('json')) && r.body !== undefined && tryJson(r.body) !== undefined;

function tryJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

function indentJson(v: unknown, pad: string) {
  return JSON.stringify(v, null, 2).replace(/\n/g, '\n' + pad);
}

export function toFetch(r: CurlRequest): string {
  const lines: string[] = [];
  const headers = [...r.headers];
  if (r.auth) headers.push(['Authorization', `Basic \${btoa(${q(r.auth)})}`]);
  const opts: string[] = [];
  if (r.method !== 'GET') opts.push(`  method: ${q(r.method)},`);
  if (r.form) {
    lines.push('const form = new FormData();');
    for (const [k, v] of r.form) {
      lines.push(v.startsWith('@') ? `form.append(${q(k)}, fileInput.files[0]); // ${v.slice(1)}` : `form.append(${q(k)}, ${q(v)});`);
    }
    lines.push('');
  }
  const hs = headers.filter(([k]) => !(r.form && k.toLowerCase() === 'content-type'));
  if (hs.length) {
    opts.push('  headers: {');
    for (const [k, v] of hs) opts.push(`    ${q(k)}: ${v.includes('${') ? '`' + v + '`' : q(v)},`);
    opts.push('  },');
  }
  if (r.form) opts.push('  body: form,');
  else if (r.body !== undefined) {
    opts.push(isJson(r) ? `  body: JSON.stringify(${indentJson(tryJson(r.body), '  ')}),` : `  body: ${q(r.body)},`);
  }
  if (r.followRedirects === false) opts.push(`  redirect: 'manual',`);
  lines.push(opts.length ? `const res = await fetch(${q(r.url)}, {\n${opts.join('\n')}\n});` : `const res = await fetch(${q(r.url)});`);
  lines.push('');
  lines.push(`if (!res.ok) throw new Error(\`HTTP \${res.status}\`);`);
  lines.push(isJsonAccept(r) ? 'const data = await res.json();' : 'const data = await res.text();');
  lines.push('console.log(data);');
  return lines.join('\n') + '\n';
}

function isJsonAccept(r: CurlRequest) {
  return r.headers.some(([k, v]) => /^(accept|content-type)$/i.test(k) && v.includes('json'));
}

function pyStr(s: string) {
  return JSON.stringify(s);
}

function pyValue(v: unknown, pad: string): string {
  if (v === null) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return `[\n${v.map((x) => `${pad}    ${pyValue(x, pad + '    ')},`).join('\n')}\n${pad}]`;
  }
  if (typeof v === 'object') {
    const e = Object.entries(v as object);
    if (!e.length) return '{}';
    return `{\n${e.map(([k, x]) => `${pad}    ${pyStr(k)}: ${pyValue(x, pad + '    ')},`).join('\n')}\n${pad}}`;
  }
  return typeof v === 'string' ? pyStr(v) : String(v);
}

export function toPython(r: CurlRequest): string {
  const out = ['import requests', ''];
  const args = [`    ${pyStr(r.url)},`];
  const json = isJson(r);
  const headers = r.headers.filter(([k]) => !(json && k.toLowerCase() === 'content-type') && !(r.form && k.toLowerCase() === 'content-type'));
  if (headers.length) {
    out.push('headers = {');
    for (const [k, v] of headers) out.push(`    ${pyStr(k)}: ${pyStr(v)},`);
    out.push('}', '');
    args.push('    headers=headers,');
  }
  if (r.form) {
    const files = r.form.filter(([, v]) => v.startsWith('@'));
    const fields = r.form.filter(([, v]) => !v.startsWith('@'));
    if (fields.length) {
      out.push('data = {');
      for (const [k, v] of fields) out.push(`    ${pyStr(k)}: ${pyStr(v)},`);
      out.push('}', '');
      args.push('    data=data,');
    }
    if (files.length) {
      out.push('files = {');
      for (const [k, v] of files) out.push(`    ${pyStr(k)}: open(${pyStr(v.slice(1).split(';')[0])}, "rb"),`);
      out.push('}', '');
      args.push('    files=files,');
    }
  } else if (r.body !== undefined) {
    if (json) {
      out.push(`payload = ${pyValue(tryJson(r.body), '')}`, '');
      args.push('    json=payload,');
    } else {
      out.push(`data = ${pyStr(r.body)}`, '');
      args.push('    data=data,');
    }
  }
  if (r.auth) {
    const i = r.auth.indexOf(':');
    args.push(`    auth=(${pyStr(i >= 0 ? r.auth.slice(0, i) : r.auth)}, ${pyStr(i >= 0 ? r.auth.slice(i + 1) : '')}),`);
  }
  if (r.insecure) args.push('    verify=False,');
  args.push('    timeout=30,');
  out.push(`response = requests.${['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(r.method) ? r.method.toLowerCase() + '(' : `request(${pyStr(r.method)}, `}`);
  out.push(...args, ')', 'response.raise_for_status()');
  out.push(isJsonAccept(r) ? 'print(response.json())' : 'print(response.text)');
  return out.join('\n') + '\n';
}

function goStr(s: string) {
  return s.includes('`') || s.includes('\n') === false ? JSON.stringify(s) : '`' + s + '`';
}

export function toGo(r: CurlRequest): string {
  const imports = new Set(['fmt', 'io', 'net/http']);
  const pre: string[] = [];
  let bodyExpr = 'nil';
  if (r.form) {
    imports.add('bytes');
    imports.add('mime/multipart');
    pre.push('\tvar buf bytes.Buffer', '\tw := multipart.NewWriter(&buf)');
    for (const [k, v] of r.form) {
      if (v.startsWith('@')) pre.push(`\t// TODO: attach file ${v.slice(1)} with w.CreateFormFile(${JSON.stringify(k)}, ...)`);
      else pre.push(`\tw.WriteField(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
    }
    pre.push('\tw.Close()', '');
    bodyExpr = '&buf';
  } else if (r.body !== undefined) {
    imports.add('strings');
    const body = isJson(r) ? JSON.stringify(tryJson(r.body), null, 2) : r.body;
    pre.push(`\tbody := strings.NewReader(${goStr(body)})`, '');
    bodyExpr = 'body';
  }
  const lines = [
    'package main',
    '',
    'import (',
    ...[...imports].sort().map((i) => `\t"${i}"`),
    ')',
    '',
    'func main() {',
    ...pre,
    `\treq, err := http.NewRequest(${JSON.stringify(r.method)}, ${JSON.stringify(r.url)}, ${bodyExpr})`,
    '\tif err != nil {',
    '\t\tpanic(err)',
    '\t}',
  ];
  for (const [k, v] of r.headers) {
    if (r.form && k.toLowerCase() === 'content-type') continue;
    lines.push(`\treq.Header.Set(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
  }
  if (r.form) lines.push('\treq.Header.Set("Content-Type", w.FormDataContentType())');
  if (r.auth) {
    const i = r.auth.indexOf(':');
    lines.push(`\treq.SetBasicAuth(${JSON.stringify(i >= 0 ? r.auth.slice(0, i) : r.auth)}, ${JSON.stringify(i >= 0 ? r.auth.slice(i + 1) : '')})`);
  }
  lines.push(
    '',
    '\tresp, err := http.DefaultClient.Do(req)',
    '\tif err != nil {',
    '\t\tpanic(err)',
    '\t}',
    '\tdefer resp.Body.Close()',
    '',
    '\tdata, err := io.ReadAll(resp.Body)',
    '\tif err != nil {',
    '\t\tpanic(err)',
    '\t}',
    '\tfmt.Println(resp.Status)',
    '\tfmt.Println(string(data))',
    '}',
  );
  return lines.join('\n') + '\n';
}
