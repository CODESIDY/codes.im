// Validate JSON data against a JSON Schema (draft-07, 2019-09 or 2020-12) with Ajv.
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export interface SchemaIssue {
  /** JSON Pointer to the failing value, "" for the root. */
  path: string;
  message: string;
  keyword: string;
}

export interface ValidationResult {
  valid: boolean;
  draft: string;
  issues: SchemaIssue[];
}

type AnyAjv = InstanceType<typeof Ajv>;

function makeAjv(schema: Record<string, unknown>): { ajv: AnyAjv; draft: string } {
  const id = String(schema.$schema ?? '');
  const opts = { allErrors: true, strict: false, verbose: false } as const;
  let ajv: AnyAjv;
  let draft: string;
  if (id.includes('2020-12')) {
    ajv = new Ajv2020(opts) as unknown as AnyAjv;
    draft = '2020-12';
  } else if (id.includes('2019-09')) {
    ajv = new Ajv2019(opts) as unknown as AnyAjv;
    draft = '2019-09';
  } else {
    ajv = new Ajv(opts);
    draft = id.includes('draft-06') ? 'draft-06' : 'draft-07';
  }
  (addFormats as unknown as (a: AnyAjv) => void)(ajv);
  return { ajv, draft };
}

/** Unwrap common LLM wrappers so you can paste a response_format / tool definition directly. */
export function extractSchema(input: Record<string, unknown>): Record<string, unknown> {
  const o = input as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  return o.json_schema?.schema ?? o.function?.parameters ?? o.input_schema ?? o.inputSchema ?? (o.type === 'function' ? o.parameters : undefined) ?? input;
}

export function validateWithSchema(schemaInput: Record<string, unknown>, data: unknown): ValidationResult {
  const schema = extractSchema(schemaInput);
  const { ajv, draft } = makeAjv(schema);
  const validate = ajv.compile(schema);
  const valid = validate(data) as boolean;
  const issues: SchemaIssue[] = (validate.errors ?? []).map((e) => {
    let message = e.message ?? 'invalid';
    const p = e.params as Record<string, unknown>;
    if (e.keyword === 'additionalProperties') message += `: "${p.additionalProperty}"`;
    if (e.keyword === 'enum') message += `: ${JSON.stringify(p.allowedValues)}`;
    if (e.keyword === 'required') message = `missing required property "${p.missingProperty}"`;
    return { path: e.instancePath || '', message, keyword: e.keyword };
  });
  return { valid, draft, issues };
}
