import type { Tool } from './registry';

/** Third batch: more AI / LLM utilities + data converters. */
export const batch3: Tool[] = [
  {
    slug: 'json-repair',
    category: 'ai',
    glyph: 'FIX',
    related: ['json-formatter', 'json-schema-generator', 'llm-stream-parser'],
    text: {
      en: {
        name: 'JSON Repair',
        title: 'JSON Repair – Fix Broken JSON from ChatGPT, Claude & Other LLMs',
        description:
          'Fix invalid JSON instantly: strips markdown fences and chatty text, adds missing quotes and commas, removes trailing commas and comments, converts Python True/None, and closes JSON that was cut off mid-stream.',
        keywords: ['json repair', 'fix json', 'broken json', 'invalid json', 'llm json', 'chatgpt json', 'truncated json', 'json fixer', 'jsonrepair'],
        howto: [
          'Paste the broken JSON — or the whole model reply, including the ```json fence and any text around it.',
          'The repaired JSON appears instantly, with a list of what was fixed.',
          'Copy the result, or turn on **Minify** to get compact output for code or logs.',
        ],
        faq: [
          {
            q: 'What problems can it fix?',
            a: 'Markdown code fences, text before or after the JSON, `//` and `/* */` comments, single or curly quotes, unquoted keys, trailing commas, missing commas between items, Python and JavaScript literals (`True`, `None`, `undefined`, `NaN`), raw line breaks inside strings, and output that stops in the middle of a string, array or object.',
          },
          {
            q: 'How do I stop LLMs from returning broken JSON in the first place?',
            a: 'Use the provider’s structured output or JSON mode with a schema (see the JSON Schema Generator), keep `max_tokens` high enough that the answer isn’t cut off, and validate the result with Zod or a JSON Schema validator. Keep a repair step as a safety net.',
          },
          {
            q: 'Is the repaired data guaranteed to be correct?',
            a: 'The output is always valid JSON, but when the input was truncated the missing part cannot be recovered — open strings are closed as-is and missing values become `null`. Check the list of fixes to see what was changed.',
          },
        ],
      },
      zh: {
        name: 'JSON 修复',
        title: 'JSON 修复工具：一键修复 ChatGPT、Claude 等大模型输出的错误 JSON',
        description: '一键修复不合法的 JSON：去掉 Markdown 代码块和多余的说明文字，补全引号和逗号，删除末尾逗号和注释，转换 Python 的 True/None，并补全被截断的 JSON。',
        keywords: ['json修复', 'json错误', '修复json', 'json格式错误', '大模型json', 'chatgpt json', 'json截断', 'jsonrepair'],
        howto: [
          '粘贴有问题的 JSON，也可以直接粘贴模型的完整回复（包括 ```json 代码块和前后的文字）。',
          '修复后的 JSON 会立即显示，并列出具体修复了哪些问题。',
          '复制结果；打开“压缩”可以得到适合放进代码或日志的紧凑格式。',
        ],
        faq: [
          {
            q: '能修复哪些问题？',
            a: 'Markdown 代码块、JSON 前后的说明文字、`//` 和 `/* */` 注释、单引号或中文引号、键名缺少引号、末尾多余的逗号、元素之间缺少的逗号、Python 和 JavaScript 的字面量（`True`、`None`、`undefined`、`NaN`）、字符串里的原始换行，以及在字符串、数组或对象中间被截断的输出。',
          },
          {
            q: '怎样从源头避免大模型返回错误的 JSON？',
            a: '使用厂商提供的结构化输出或 JSON 模式并配上 schema（可以用 JSON Schema 生成器），把 `max_tokens` 设得足够大以免回答被截断，再用 Zod 或 JSON Schema 校验结果。修复步骤可以作为最后一道保险。',
          },
          {
            q: '修复后的数据一定正确吗？',
            a: '输出一定是合法的 JSON，但如果原文被截断，缺失的内容无法找回 —— 未闭合的字符串会按原样闭合，缺失的值会变成 `null`。请查看修复列表确认改动。',
          },
        ],
      },
    },
  },
  {
    slug: 'prompt-template',
    category: 'llm',
    glyph: '{{}}',
    related: ['token-counter', 'text-diff', 'markdown-cleaner'],
    text: {
      en: {
        name: 'Prompt Template Filler',
        title: 'Prompt Template Filler – Fill {{variables}} & Export to Python / JS',
        description:
          'Paste a prompt template with {{variables}}, {placeholders} or ${vars}. A form is generated for each variable, the filled prompt previews live with its token count, and you can export ready-to-use Python or JavaScript code.',
        keywords: ['prompt template', 'prompt variables', 'prompt engineering', 'mustache', 'jinja', 'langchain', 'placeholder', 'fill template', 'llm prompt'],
        howto: [
          'Paste your prompt template. Variables are detected automatically in `{{name}}` (Mustache, Jinja, LangChain), `{name}` (Python format strings) or `${name}` (JavaScript) syntax.',
          'Fill in each variable in the generated form — long values like documents get a resizable text box.',
          'Copy the filled prompt, check its token count, or export the template as Python or JavaScript code.',
        ],
        faq: [
          {
            q: 'Why use variables instead of editing the prompt each time?',
            a: 'Keeping the instructions fixed and swapping only the inputs makes prompts reproducible: you can compare outputs fairly, version the template, and reuse it in code.',
          },
          {
            q: 'My template contains JSON with braces. Will it break?',
            a: 'With `{{name}}` syntax JSON braces are ignored. In the Python export, literal braces are escaped as `{{` and `}}` so `str.format()` works.',
          },
        ],
      },
      zh: {
        name: 'Prompt 模板填充',
        title: 'Prompt 模板变量填充工具（{{变量}} 一键导出 Python / JS 代码）',
        description: '粘贴带有 {{变量}}、{占位符} 或 ${var} 的 prompt 模板，自动为每个变量生成输入框，实时预览填充结果和 token 数，并可导出可直接使用的 Python 或 JavaScript 代码。',
        keywords: ['prompt模板', '提示词模板', '变量', '提示词工程', 'mustache', 'jinja', 'langchain', '占位符'],
        howto: [
          '粘贴 prompt 模板，会自动识别 `{{name}}`（Mustache、Jinja、LangChain）、`{name}`（Python format）或 `${name}`（JavaScript）语法的变量。',
          '在自动生成的表单中填写每个变量，文档这类长内容可以用可拉伸的文本框。',
          '复制填充后的 prompt、查看 token 数，或者把模板导出成 Python / JavaScript 代码。',
        ],
        faq: [
          {
            q: '为什么要用变量，而不是每次直接改 prompt？',
            a: '固定指令、只替换输入，可以让 prompt 结果可复现：方便公平地比较输出、给模板做版本管理，也能直接在代码里复用。',
          },
          {
            q: '模板里有带花括号的 JSON，会出问题吗？',
            a: '使用 `{{name}}` 语法时，JSON 的花括号会被忽略。导出 Python 代码时，普通花括号会被转义成 `{{` 和 `}}`，保证 `str.format()` 正常工作。',
          },
        ],
      },
    },
  },
  {
    slug: 'chat-format-converter',
    category: 'ai',
    glyph: '⇄',
    related: ['llm-stream-parser', 'openapi-to-tools', 'jsonl-validator'],
    text: {
      en: {
        name: 'Chat Format Converter',
        title: 'Convert Chat Messages: OpenAI ⇄ Anthropic Claude ⇄ Google Gemini',
        description:
          'Convert conversation histories between the OpenAI Chat Completions, Anthropic Messages and Gemini request formats — including system prompts, images, tool calls and tool results.',
        keywords: ['openai to anthropic', 'anthropic to openai', 'gemini', 'chat messages', 'convert', 'migrate', 'tool calls', 'tool_use', 'function calling', 'messages format'],
        howto: [
          'Paste a `messages` array or a full request body. The source format is detected automatically.',
          'Choose the target: OpenAI, Anthropic or Gemini.',
          'The system prompt is moved to the right place, images and tool calls are rewritten, and tool results are matched to their calls. Notes explain anything that needed adjusting.',
        ],
        faq: [
          {
            q: 'What are the main differences between the formats?',
            a: 'OpenAI puts the system prompt in a `system` message and tool results in separate `tool` messages. Anthropic uses a top-level `system` field, requires user and assistant turns to alternate, and puts `tool_result` blocks inside user messages. Gemini uses `contents` with `user`/`model` roles, `parts`, and `functionCall` / `functionResponse`.',
          },
          {
            q: 'Are image URLs supported everywhere?',
            a: 'Base64 images convert cleanly between all three formats. Remote image URLs map to `image_url` (OpenAI) and URL sources (Anthropic), but Gemini expects uploaded files or Cloud Storage URIs in `fileData`, so you may need to upload the image first.',
          },
        ],
      },
      zh: {
        name: '对话格式转换',
        title: '大模型对话格式互转：OpenAI ⇄ Anthropic Claude ⇄ Google Gemini',
        description: '在 OpenAI Chat Completions、Anthropic Messages、Gemini 三种请求格式之间转换对话历史，支持 system prompt、图片、工具调用和工具结果。',
        keywords: ['openai转claude', 'claude转openai', 'gemini', '对话格式', '消息格式', '迁移', '工具调用', 'function calling', 'messages'],
        howto: [
          '粘贴 `messages` 数组或完整的请求体，会自动识别源格式。',
          '选择目标格式：OpenAI、Anthropic 或 Gemini。',
          'system prompt 会放到正确的位置，图片和工具调用会被改写，工具结果会和对应的调用匹配。需要调整的地方会给出说明。',
        ],
        faq: [
          {
            q: '三种格式主要有什么区别？',
            a: 'OpenAI 把 system prompt 放在 `system` 消息里，工具结果是单独的 `tool` 消息。Anthropic 使用顶层的 `system` 字段，要求 user 和 assistant 交替出现，`tool_result` 放在 user 消息里。Gemini 使用 `contents`、`user`/`model` 角色、`parts`，以及 `functionCall` / `functionResponse`。',
          },
          {
            q: '图片 URL 都能用吗？',
            a: 'Base64 图片可以在三种格式之间无损转换。远程图片 URL 对应 OpenAI 的 `image_url` 和 Anthropic 的 URL source，但 Gemini 的 `fileData` 需要已上传的文件或 Cloud Storage 地址，可能需要先上传图片。',
          },
        ],
      },
    },
  },
  {
    slug: 'openapi-to-tools',
    category: 'ai',
    glyph: 'API',
    related: ['json-schema-generator', 'mcp-config-generator', 'chat-format-converter'],
    text: {
      en: {
        name: 'OpenAPI to LLM Tools',
        title: 'OpenAPI to LLM Tools – Generate OpenAI Functions, Claude Tools & MCP Tools',
        description:
          'Convert an OpenAPI 3 or Swagger 2 spec (JSON or YAML) into tool definitions for OpenAI function calling, Anthropic Claude tool use or MCP servers. $refs are resolved and each endpoint becomes one tool.',
        keywords: ['openapi', 'swagger', 'function calling', 'tool use', 'llm tools', 'openai functions', 'claude tools', 'mcp tools', 'agent', 'api to tools'],
        howto: [
          'Paste an OpenAPI 3.x or Swagger 2.0 document in JSON or YAML.',
          'Each operation becomes a tool. Path, query and header parameters and the JSON request body are merged into one input schema, and `$ref`s are inlined.',
          'Untick endpoints you don’t want the model to call, choose the output format, and copy the tools array into your API request or MCP server.',
        ],
        faq: [
          {
            q: 'How are tool names chosen?',
            a: 'The `operationId` is used when present. Otherwise a name is built from the method and path, such as `get_users_by_id`. Names are limited to 64 characters of letters, digits, `_` and `-`, as LLM APIs require.',
          },
          {
            q: 'Should I expose every endpoint as a tool?',
            a: 'Usually not. Models choose tools more reliably from a short list with clear descriptions. Keep the endpoints the agent really needs and rewrite their descriptions to say when each one should be used.',
          },
        ],
      },
      zh: {
        name: 'OpenAPI 转大模型工具',
        title: 'OpenAPI 转大模型工具定义（OpenAI Function、Claude Tool、MCP Tool）',
        description: '把 OpenAPI 3 或 Swagger 2 文档（JSON 或 YAML）转换成 OpenAI function calling、Anthropic Claude tool use 或 MCP 服务器的工具定义，自动解析 $ref，每个接口生成一个工具。',
        keywords: ['openapi', 'swagger', 'function calling', '工具调用', '大模型工具', 'claude tools', 'mcp', 'agent', '接口转工具'],
        howto: [
          '粘贴 JSON 或 YAML 格式的 OpenAPI 3.x 或 Swagger 2.0 文档。',
          '每个接口会生成一个工具：path、query、header 参数和 JSON 请求体会合并成一个输入 schema，`$ref` 会被展开。',
          '取消勾选不希望模型调用的接口，选择输出格式，把 tools 数组复制到 API 请求或 MCP 服务器中。',
        ],
        faq: [
          {
            q: '工具名称是怎么生成的？',
            a: '优先使用 `operationId`；没有时用请求方法和路径拼出名称，例如 `get_users_by_id`。名称会限制在 64 个字符以内，只包含字母、数字、`_` 和 `-`，以符合各家 API 的要求。',
          },
          {
            q: '应该把所有接口都暴露成工具吗？',
            a: '通常不需要。工具列表短、描述清楚时，模型选择工具更准确。只保留 agent 真正需要的接口，并改写描述，说明每个工具应该在什么情况下使用。',
          },
        ],
      },
    },
  },
  {
    slug: 'text-chunker',
    category: 'llm',
    glyph: 'RAG',
    related: ['token-counter', 'jsonl-validator', 'markdown-cleaner'],
    text: {
      en: {
        name: 'RAG Text Chunker',
        title: 'Text Chunker for RAG – Split Documents by Tokens or Characters with Overlap',
        description:
          'Preview how a document is split into chunks for embeddings and RAG. Recursive splitting by paragraphs, lines and sentences (Chinese punctuation included), chunk size in tokens or characters, overlap, and JSON export.',
        keywords: ['rag', 'chunking', 'text splitter', 'chunk size', 'overlap', 'embeddings', 'langchain', 'recursive character text splitter', 'vector database'],
        howto: [
          'Paste a document or open a text / Markdown file.',
          'Set the chunk size and overlap, and choose whether size is measured in tokens (o200k_base) or characters.',
          'Inspect each chunk — overlapping text is highlighted — then export the chunks as JSON or JSONL for your embedding pipeline.',
        ],
        faq: [
          {
            q: 'What chunk size should I use?',
            a: 'A common starting point is 300–800 tokens with 10–20% overlap. Smaller chunks give more precise retrieval; larger ones keep more context. Test with your own questions and documents.',
          },
          {
            q: 'How does recursive splitting work?',
            a: 'Text is split at the strongest boundary first — blank lines (paragraphs) — and only pieces that are still too long are split further by lines, sentences, clauses and words. Small pieces are then merged back up to the size limit, so chunks rarely cut through a sentence.',
          },
        ],
      },
      zh: {
        name: 'RAG 文本分块',
        title: 'RAG 文本分块工具：按 token 或字符切分文档（支持重叠）',
        description: '预览文档在向量化和 RAG 中如何被切分成块：按段落、行、句子递归切分（支持中文标点），可按 token 或字符设置块大小和重叠，支持导出 JSON。',
        keywords: ['rag', '分块', 'chunk', '文本切分', '重叠', 'embedding', '向量数据库', 'langchain', '知识库'],
        howto: [
          '粘贴文档，或打开文本 / Markdown 文件。',
          '设置块大小和重叠长度，选择按 token（o200k_base）还是按字符计算。',
          '逐个查看分块结果（重叠部分会高亮），再导出为 JSON 或 JSONL，用于向量化流程。',
        ],
        faq: [
          {
            q: '块大小设多少合适？',
            a: '常见的起点是 300–800 个 token，重叠 10%–20%。块越小检索越精确，块越大保留的上下文越多，最好用你自己的问题和文档实际测试。',
          },
          {
            q: '递归切分是怎么工作的？',
            a: '先在最强的边界处切分 —— 空行（段落），只有仍然过长的片段才继续按行、句子、分句和词切分。然后把小片段重新合并到大小上限以内，所以分块很少会把一句话从中间切断。',
          },
        ],
      },
    },
  },
  {
    slug: 'yaml-json',
    category: 'format',
    glyph: 'YML',
    related: ['json-formatter', 'csv-json', 'openapi-to-tools'],
    text: {
      en: {
        name: 'YAML ⇄ JSON',
        title: 'YAML to JSON & JSON to YAML Converter',
        description:
          'Convert YAML to JSON and JSON to YAML instantly, with clear error messages. Handy for Kubernetes manifests, GitHub Actions, Docker Compose and OpenAPI specs.',
        keywords: ['yaml to json', 'json to yaml', 'yaml', 'converter', 'kubernetes', 'docker compose', 'github actions', 'yml'],
        howto: [
          'Paste YAML or JSON — the input format is detected automatically, or pick a direction yourself.',
          'Choose the indentation. Multi-document YAML (separated by `---`) becomes a JSON array.',
          'Copy the result or swap direction to convert back.',
        ],
        faq: [
          {
            q: 'Is all JSON valid YAML?',
            a: 'Practically yes — YAML 1.2 is a superset of JSON, so any JSON document can be read by a YAML parser. The reverse isn’t true: YAML has comments, anchors and multi-line strings that JSON lacks.',
          },
          {
            q: 'What happens to YAML comments and anchors?',
            a: 'JSON has no comments, so they are dropped. Anchors and aliases (`&` and `*`) are expanded into full copies of the referenced data.',
          },
        ],
      },
      zh: {
        name: 'YAML ⇄ JSON',
        title: 'YAML 转 JSON / JSON 转 YAML 在线转换',
        description: 'YAML 与 JSON 即时互转，错误提示清晰，适合处理 Kubernetes 配置、GitHub Actions、Docker Compose 和 OpenAPI 文档。',
        keywords: ['yaml转json', 'json转yaml', 'yaml', '转换', 'kubernetes', 'docker compose', 'yml'],
        howto: [
          '粘贴 YAML 或 JSON，会自动识别输入格式，也可以手动选择转换方向。',
          '选择缩进。多文档 YAML（用 `---` 分隔）会转换成 JSON 数组。',
          '复制结果，或者交换方向再转换回去。',
        ],
        faq: [
          {
            q: 'JSON 都是合法的 YAML 吗？',
            a: '基本上是。YAML 1.2 是 JSON 的超集，任何 JSON 文档都能被 YAML 解析器读取；反过来不成立，YAML 的注释、锚点和多行字符串在 JSON 中没有对应写法。',
          },
          {
            q: 'YAML 的注释和锚点会怎么处理？',
            a: 'JSON 不支持注释，所以注释会被去掉。锚点和别名（`&` 和 `*`）会被展开成被引用数据的完整副本。',
          },
        ],
      },
    },
  },
  {
    slug: 'csv-json',
    category: 'format',
    glyph: 'CSV',
    related: ['json-formatter', 'yaml-json', 'jsonl-validator'],
    text: {
      en: {
        name: 'CSV ⇄ JSON',
        title: 'CSV to JSON & JSON to CSV Converter',
        description:
          'Convert CSV to JSON and JSON to CSV in your browser. Detects commas, semicolons and tabs, handles quoted fields and line breaks, infers numbers and booleans, and flattens nested JSON into dot-notation columns.',
        keywords: ['csv to json', 'json to csv', 'csv', 'tsv', 'excel', 'converter', 'spreadsheet', 'flatten json'],
        howto: [
          'Paste CSV (or TSV copied from Excel or Google Sheets) or a JSON array, or open a file.',
          'For CSV → JSON, choose whether the first row is a header, whether to infer numbers and booleans, and whether `a.b` columns become nested objects.',
          'For JSON → CSV, nested objects are flattened into `a.b` columns and arrays are written as JSON text. Preview the table, then copy or download.',
        ],
        faq: [
          {
            q: 'Why does Excel show Chinese or accented characters incorrectly?',
            a: 'Excel may open CSV files with a legacy encoding. The downloaded CSV includes a UTF-8 byte order mark (BOM) so Excel detects UTF-8 correctly.',
          },
          {
            q: 'How are commas and line breaks inside a value handled?',
            a: 'Following RFC 4180, such values are wrapped in double quotes, and quotes inside them are doubled (`""`). The parser reads them back correctly.',
          },
        ],
      },
      zh: {
        name: 'CSV ⇄ JSON',
        title: 'CSV 转 JSON / JSON 转 CSV 在线转换',
        description: '在浏览器中完成 CSV 与 JSON 互转：自动识别逗号、分号和 Tab 分隔，正确处理带引号和换行的字段，自动推断数字和布尔值，嵌套 JSON 会展开成点号列名。',
        keywords: ['csv转json', 'json转csv', 'csv', 'tsv', 'excel', '表格', '转换'],
        howto: [
          '粘贴 CSV（或从 Excel、飞书表格复制的 TSV）或 JSON 数组，也可以打开文件。',
          'CSV 转 JSON 时，可以选择首行是否为表头、是否推断数字和布尔值，以及 `a.b` 形式的列是否转成嵌套对象。',
          'JSON 转 CSV 时，嵌套对象会展开为 `a.b` 列，数组会写成 JSON 文本。预览表格后复制或下载即可。',
        ],
        faq: [
          {
            q: '为什么 Excel 打开 CSV 中文乱码？',
            a: 'Excel 可能会用旧的编码打开 CSV 文件。这里下载的 CSV 带有 UTF-8 BOM，Excel 能正确识别为 UTF-8。',
          },
          {
            q: '值里有逗号或换行怎么处理？',
            a: '按照 RFC 4180 规范，这类值会用双引号包裹，值中的双引号会写成两个（`""`），解析时也能正确读回。',
          },
        ],
      },
    },
  },
];
