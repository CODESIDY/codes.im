// Turn an OpenAPI 3.x / Swagger 2 spec into LLM tool (function) definitions.

type J = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface Operation {
  name: string;
  method: string;
  path: string;
  description: string;
  parameters: J; // JSON Schema object
}

export type ToolFormat = 'openai' | 'openai-responses' | 'anthropic' | 'mcp';

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const DROP = new Set(['example', 'examples', 'xml', 'externalDocs', 'readOnly', 'writeOnly', 'deprecated', 'discriminator', 'nullable', 'x-nullable']);

function resolveRef(spec: J, ref: string): J {
  if (!ref.startsWith('#/')) return {};
  return ref
    .slice(2)
    .split('/')
    .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce<J>((o, k) => (o && typeof o === 'object' ? o[k] : undefined) as J, spec) ?? {};
}

/** Inline $refs (with a depth limit for recursive schemas) and drop keys LLM APIs dislike. */
export function cleanSchema(spec: J, schema: unknown, depth = 0, seen: string[] = []): J {
  if (!schema || typeof schema !== 'object') return {};
  let s = schema as J;
  if (typeof s.$ref === 'string') {
    if (seen.includes(s.$ref) || depth > 8) return { type: 'object', description: `(recursive ${s.$ref.split('/').pop()})` };
    return cleanSchema(spec, resolveRef(spec, s.$ref), depth + 1, [...seen, s.$ref]);
  }
  const out: J = {};
  // OpenAPI 3.0 `nullable: true` → JSON Schema type union
  if (s.nullable === true && typeof s.type === 'string') s = { ...s, type: [s.type, 'null'] };
  for (const [k, v] of Object.entries(s)) {
    if (DROP.has(k) || k.startsWith('x-')) continue;
    if (k === 'properties' && v && typeof v === 'object') {
      out.properties = Object.fromEntries(Object.entries(v as J).map(([pk, pv]) => [pk, cleanSchema(spec, pv, depth + 1, seen)]));
    } else if ((k === 'items' || k === 'additionalProperties' || k === 'not') && v && typeof v === 'object') {
      out[k] = cleanSchema(spec, v, depth + 1, seen);
    } else if ((k === 'allOf' || k === 'anyOf' || k === 'oneOf') && Array.isArray(v)) {
      out[k] = v.map((x) => cleanSchema(spec, x, depth + 1, seen));
    } else out[k] = v;
  }
  // Flatten simple allOf of objects.
  if (Array.isArray(out.allOf) && out.allOf.every((x: J) => x.type === 'object' || x.properties)) {
    const merged: J = { type: 'object', properties: {}, required: [] as string[] };
    for (const part of out.allOf as J[]) {
      Object.assign(merged.properties, part.properties ?? {});
      merged.required.push(...(part.required ?? []));
    }
    delete out.allOf;
    Object.assign(out, merged, { properties: { ...merged.properties, ...(out.properties ?? {}) } });
    if (!out.required.length) delete out.required;
  }
  return out;
}

function toolName(op: J, method: string, path: string): string {
  const raw =
    op.operationId ??
    `${method}_${path
      .replace(/\{([^}]+)\}/g, 'by_$1')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')}`;
  return String(raw).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64);
}

export function parseOperations(spec: J): Operation[] {
  if (!spec || typeof spec !== 'object' || !spec.paths) throw new Error('Not an OpenAPI document: missing "paths"');
  const ops: Operation[] = [];
  const used = new Set<string>();
  for (const [path, item] of Object.entries(spec.paths as J)) {
    const shared: J[] = (item as J).parameters ?? [];
    for (const method of METHODS) {
      const op = (item as J)[method] as J | undefined;
      if (!op) continue;
      const properties: J = {};
      const required: string[] = [];
      const params = [...shared, ...(op.parameters ?? [])].map((p: J) => (p.$ref ? resolveRef(spec, p.$ref) : p));
      for (const p of params) {
        if (!p?.name || p.in === 'cookie') continue;
        // Swagger 2: schema fields live on the parameter itself.
        const body = p.in === 'body';
        const schema = cleanSchema(spec, p.schema ?? (body ? {} : { type: p.type ?? 'string', items: p.items, enum: p.enum, format: p.format }));
        for (const k of Object.keys(schema)) if (schema[k] === undefined) delete schema[k];
        if (p.description && !schema.description) schema.description = p.description;
        if (body) {
          mergeBody(schema, properties, required);
          continue;
        }
        properties[p.name] = schema;
        if (p.required || p.in === 'path') required.push(p.name);
      }
      // OpenAPI 3 request body
      const rb = op.requestBody?.$ref ? resolveRef(spec, op.requestBody.$ref) : op.requestBody;
      const content = rb?.content ?? {};
      const media = content['application/json'] ?? content['application/x-www-form-urlencoded'] ?? content['multipart/form-data'] ?? Object.values(content)[0];
      if (media?.schema) {
        const schema = cleanSchema(spec, media.schema);
        if (rb.description && !schema.description) schema.description = rb.description;
        mergeBody(schema, properties, required, rb.required);
      }
      let name = toolName(op, method, path);
      for (let n = 2; used.has(name); n++) name = `${toolName(op, method, path)}_${n}`;
      used.add(name);
      const description = [op.summary, op.description].filter(Boolean).join('\n\n').trim() || `${method.toUpperCase()} ${path}`;
      const parameters: J = { type: 'object', properties };
      if (required.length) parameters.required = [...new Set(required)];
      ops.push({ name, method: method.toUpperCase(), path, description: description.slice(0, 1024), parameters });
    }
  }
  return ops;
}

function mergeBody(schema: J, properties: J, required: string[], bodyRequired?: boolean) {
  const isObject = (schema.type === 'object' || schema.properties) && schema.properties;
  const conflicts = isObject && Object.keys(schema.properties).some((k) => k in properties);
  if (isObject && !conflicts) {
    Object.assign(properties, schema.properties);
    required.push(...(schema.required ?? []));
  } else {
    properties.body = schema;
    if (bodyRequired) required.push('body');
  }
}

export function toTools(ops: Operation[], format: ToolFormat): unknown[] {
  return ops.map((o) => {
    switch (format) {
      case 'openai':
        return { type: 'function', function: { name: o.name, description: o.description, parameters: o.parameters } };
      case 'openai-responses':
        return { type: 'function', name: o.name, description: o.description, parameters: o.parameters };
      case 'anthropic':
        return { name: o.name, description: o.description, input_schema: o.parameters };
      case 'mcp':
        return { name: o.name, description: o.description, inputSchema: o.parameters };
    }
  });
}
