import { infer, type Shape } from './json-to-ts.ts';

// ---------------------------------------------------------------- JSON Schema

export interface SchemaOptions {
  /**
   * Strict mode for LLM structured outputs (OpenAI `strict: true`):
   * every property is required and optional fields become nullable instead,
   * and `additionalProperties: false` is set on every object.
   */
  strict?: boolean;
  title?: string;
}

type JsonSchema = Record<string, unknown>;

const isNullShape = (s: Shape) => s.kind === 'primitive' && s.name === 'null';

function toSchema(s: Shape, strict: boolean): JsonSchema {
  switch (s.kind) {
    case 'primitive':
      return s.name === 'unknown' ? {} : { type: s.name };
    case 'array':
      return { type: 'array', items: toSchema(s.of, strict) };
    case 'union': {
      const parts = s.of.map((m) => toSchema(m, strict));
      if (parts.every((p) => typeof p.type === 'string' && Object.keys(p).length === 1)) {
        return { type: parts.map((p) => p.type) };
      }
      return { anyOf: parts };
    }
    case 'object': {
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const [k, f] of s.fields) {
        let prop = toSchema(f.shape, strict);
        if (strict && f.optional && !isNullShape(f.shape)) prop = nullable(prop);
        properties[k] = prop;
        if (strict || !f.optional) required.push(k);
      }
      return { type: 'object', properties, required, additionalProperties: false };
    }
  }
}

function nullable(p: JsonSchema): JsonSchema {
  if (typeof p.type === 'string') return { ...p, type: [p.type, 'null'] };
  if (Array.isArray(p.type)) return p.type.includes('null') ? p : { ...p, type: [...p.type, 'null'] };
  if (Array.isArray(p.anyOf)) return { anyOf: [...p.anyOf, { type: 'null' }] };
  return { anyOf: [p, { type: 'null' }] };
}

export function jsonToSchema(value: unknown, opts: SchemaOptions = {}): JsonSchema {
  const body = toSchema(infer(value), !!opts.strict);
  const head: JsonSchema = { $schema: 'https://json-schema.org/draft/2020-12/schema' };
  if (opts.title) head.title = opts.title;
  return { ...head, ...body };
}

export type SchemaWrapper = 'schema' | 'openai-response' | 'openai-tool' | 'anthropic-tool';

/** Wrap a schema in the envelope each LLM API expects. */
export function wrapSchema(schema: JsonSchema, wrapper: SchemaWrapper, name: string, description = ''): unknown {
  const { $schema: _drop, title: _t, ...core } = schema;
  const safeName = name.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64) || 'output';
  switch (wrapper) {
    case 'schema':
      return schema;
    case 'openai-response':
      return { type: 'json_schema', json_schema: { name: safeName, strict: true, schema: core } };
    case 'openai-tool':
      return {
        type: 'function',
        function: { name: safeName, description, strict: true, parameters: core },
      };
    case 'anthropic-tool':
      return { name: safeName, description, input_schema: core };
  }
}

// ---------------------------------------------------------------------- Zod

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function zod(s: Shape, depth: number): string {
  const pad = '  '.repeat(depth);
  switch (s.kind) {
    case 'primitive':
      return s.name === 'unknown' ? 'z.unknown()' : `z.${s.name}()`;
    case 'array':
      return `z.array(${zod(s.of, depth)})`;
    case 'union': {
      const nonNull = s.of.filter((m) => !isNullShape(m));
      const hasNull = nonNull.length !== s.of.length;
      const base = nonNull.length === 1 ? zod(nonNull[0], depth) : `z.union([${nonNull.map((m) => zod(m, depth)).join(', ')}])`;
      return hasNull ? `${base}.nullable()` : base;
    }
    case 'object': {
      if (!s.fields.size) return 'z.object({})';
      const lines = [...s.fields].map(([k, f]) => {
        const key = IDENT.test(k) ? k : JSON.stringify(k);
        return `${pad}  ${key}: ${zod(f.shape, depth + 1)}${f.optional ? '.optional()' : ''},`;
      });
      return `z.object({\n${lines.join('\n')}\n${pad}})`;
    }
  }
}

export function jsonToZod(value: unknown, name = 'Root'): string {
  const typeName = name.replace(/[^A-Za-z0-9_$]/g, '') || 'Root';
  return [
    `import { z } from 'zod';`,
    ``,
    `export const ${typeName}Schema = ${zod(infer(value), 0)};`,
    ``,
    `export type ${typeName} = z.infer<typeof ${typeName}Schema>;`,
    ``,
  ].join('\n');
}
