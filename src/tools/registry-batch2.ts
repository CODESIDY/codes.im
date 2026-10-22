import type { Tool } from './registry';

/** Second batch: AI / LLM developer tools + classic utilities. */
export const batch2: Tool[] = [
  // ------------------------------------------------------------------ AI
  {
    slug: 'json-schema-generator',
    category: 'ai',
    glyph: '{S}',
    related: ['json-to-zod', 'json-to-typescript', 'llm-stream-parser'],
    text: {
      en: {
        name: 'JSON Schema Generator',
        title: 'JSON to JSON Schema – for OpenAI Structured Outputs & Claude Tools',
        description:
          'Generate a JSON Schema from sample JSON. Strict mode makes it valid for OpenAI structured outputs, and one click wraps it as an OpenAI response_format, OpenAI function or Anthropic tool definition.',
        keywords: ['json schema', 'structured outputs', 'function calling', 'tool use', 'openai', 'claude', 'anthropic', 'response_format', 'llm'],
        howto: [
          'Paste an example of the JSON you want the model to return, for example the object your app expects.',
          'Turn on **Strict** for LLM structured outputs: every field becomes required, fields missing from some samples become nullable, and `additionalProperties` is set to `false`.',
          'Pick an output format: a plain JSON Schema, an OpenAI `response_format`, an OpenAI function/tool, or an Anthropic tool with `input_schema`.',
          'Copy the result straight into your API call.',
        ],
        faq: [
          {
            q: 'Why does OpenAI reject my schema with “all fields must be required”?',
            a: 'With `strict: true`, OpenAI requires every property to appear in `required` and `additionalProperties: false` on every object. Optional values must be expressed as a union with `null` — exactly what Strict mode generates.',
          },
          {
            q: 'Does this work for Claude tool use?',
            a: 'Yes. Choose “Anthropic tool” to get `{ name, description, input_schema }`, the shape the Messages API expects in its `tools` array.',
          },
          {
            q: 'How are numbers and arrays inferred?',
            a: 'Values become `string`, `number`, `boolean` or `null`. Arrays merge all their elements, so a key present in only some objects becomes optional (or nullable in Strict mode). Edit the result to add `enum`, `description` or `integer` where you need tighter constraints.',
          },
        ],
      },
      zh: {
        name: 'JSON Schema 生成器',
        title: 'JSON 转 JSON Schema（适配 OpenAI 结构化输出与 Claude 工具调用）',
        description: '根据示例 JSON 生成 JSON Schema。严格模式可直接用于 OpenAI 结构化输出，一键包装成 OpenAI response_format、Function 或 Anthropic Tool 定义。',
        keywords: ['json schema', '结构化输出', 'function calling', '工具调用', 'openai', 'claude', '大模型', 'llm'],
        howto: [
          '粘贴一段你希望模型返回的 JSON 示例，比如你的程序需要的对象结构。',
          '用于大模型结构化输出时打开“严格模式”：所有字段都会变成必填，示例中有时缺失的字段改为可为 null，并给每个对象加上 `additionalProperties: false`。',
          '选择输出格式：纯 JSON Schema、OpenAI `response_format`、OpenAI function/tool，或带 `input_schema` 的 Anthropic tool。',
          '复制结果，直接放进 API 请求里。',
        ],
        faq: [
          {
            q: '为什么 OpenAI 报错 “all fields must be required”？',
            a: '开启 `strict: true` 后，OpenAI 要求每个属性都出现在 `required` 中，且每个对象都设置 `additionalProperties: false`。可选值必须写成和 `null` 的联合类型 —— 严格模式生成的正是这种格式。',
          },
          {
            q: '能用于 Claude 的工具调用吗？',
            a: '可以。选择 “Anthropic tool” 会生成 `{ name, description, input_schema }`，也就是 Messages API 的 `tools` 数组需要的格式。',
          },
          {
            q: '数字和数组是怎么推断的？',
            a: '值会推断为 `string`、`number`、`boolean` 或 `null`。数组会合并所有元素，只在部分对象中出现的键会变成可选（严格模式下变为可为 null）。需要更严格的约束时，可以手动补充 `enum`、`description` 或 `integer`。',
          },
        ],
      },
    },
  },
  {
    slug: 'json-to-zod',
    category: 'ai',
    glyph: 'Zod',
    related: ['json-schema-generator', 'json-to-typescript', 'json-formatter'],
    text: {
      en: {
        name: 'JSON to Zod',
        title: 'JSON to Zod Schema Converter',
        description:
          'Convert sample JSON into a Zod schema plus its inferred TypeScript type. Ready for validating API responses and LLM structured outputs with the Vercel AI SDK or OpenAI SDK.',
        keywords: ['zod', 'json to zod', 'schema', 'typescript', 'validation', 'ai sdk', 'structured output'],
        howto: [
          'Paste a JSON sample.',
          'Set the schema name — you get `NameSchema` and `type Name = z.infer<typeof NameSchema>`.',
          'Keys missing from some array items become `.optional()`, and mixed nulls become `.nullable()`.',
          'Use the schema with `generateObject()` in the AI SDK, `zodResponseFormat()` in the OpenAI SDK, or `.parse()` anywhere.',
        ],
        faq: [
          {
            q: 'Does it support Zod 4?',
            a: 'Yes. The output only uses core APIs (`z.object`, `z.array`, `z.union`, `.optional()`, `.nullable()`) that are the same in Zod 3 and Zod 4.',
          },
          {
            q: 'Why use Zod for LLM output?',
            a: 'Models occasionally return malformed or unexpected JSON. Validating with Zod gives you a typed object or a clear error you can retry on, instead of a crash somewhere deeper in your app.',
          },
        ],
      },
      zh: {
        name: 'JSON 转 Zod',
        title: 'JSON 转 Zod Schema 在线工具',
        description: '把示例 JSON 转成 Zod schema 和对应的 TypeScript 类型，可直接用于校验接口返回值，以及配合 Vercel AI SDK、OpenAI SDK 做大模型结构化输出。',
        keywords: ['zod', 'json转zod', 'schema', 'typescript', '校验', 'ai sdk', '结构化输出'],
        howto: [
          '粘贴一段 JSON 示例。',
          '设置 schema 名称，会生成 `NameSchema` 和 `type Name = z.infer<typeof NameSchema>`。',
          '数组中部分元素缺失的键会生成 `.optional()`，有时为 null 的字段会生成 `.nullable()`。',
          '可以用在 AI SDK 的 `generateObject()`、OpenAI SDK 的 `zodResponseFormat()` 中，或者任何需要 `.parse()` 校验的地方。',
        ],
        faq: [
          {
            q: '支持 Zod 4 吗？',
            a: '支持。生成的代码只用到 `z.object`、`z.array`、`z.union`、`.optional()`、`.nullable()` 这些核心 API，在 Zod 3 和 Zod 4 中写法相同。',
          },
          {
            q: '为什么要用 Zod 校验大模型输出？',
            a: '模型偶尔会返回格式错误或不符合预期的 JSON。用 Zod 校验后，你得到的要么是带类型的对象，要么是可以据此重试的明确错误，而不是在程序深处崩溃。',
          },
        ],
      },
    },
  },
  {
    slug: 'token-counter',
    category: 'llm',
    glyph: 'TOK',
    related: ['markdown-cleaner', 'jsonl-validator', 'llm-stream-parser'],
    text: {
      en: {
        name: 'LLM Token Counter',
        title: 'Token Counter for GPT & LLM Prompts – Visualize Tokens',
        description:
          'Count tokens exactly with OpenAI’s o200k_base (GPT-4o, GPT-4.1, GPT-5, o-series) and cl100k_base (GPT-4, GPT-3.5) tokenizers, and see how your text is split. Runs offline in your browser.',
        keywords: ['token counter', 'tokenizer', 'tiktoken', 'gpt', 'openai', 'llm', 'context window', 'prompt', 'o200k', 'cl100k'],
        howto: [
          'Paste your prompt, document or chat transcript.',
          'Choose the tokenizer: `o200k_base` for current OpenAI models, or `cl100k_base` for GPT-4 and GPT-3.5.',
          'See the token, character and word counts update live, and turn on the visualizer to see exactly where tokens are split.',
        ],
        faq: [
          {
            q: 'Is the count accurate for Claude, Gemini, DeepSeek or Qwen?',
            a: 'No tool outside the vendor can be exact for those models: each uses its own tokenizer, and Anthropic and Google do not publish theirs for offline use. The OpenAI count is a reasonable ballpark (often within 10–30%), but use the vendor’s token-counting API when you need exact numbers.',
          },
          {
            q: 'Why does Chinese text use more tokens?',
            a: 'Tokenizers are trained mostly on English, so common English words are often a single token while CJK characters may take one or more tokens each. Newer tokenizers like o200k_base are noticeably more efficient for Chinese than cl100k_base.',
          },
          {
            q: 'Is my text uploaded?',
            a: 'No. The tokenizer (the open-source gpt-tokenizer library) is downloaded once and runs entirely in your browser.',
          },
        ],
      },
      zh: {
        name: 'Token 计数器',
        title: '大模型 Token 计数器（GPT Tokenizer 在线可视化）',
        description: '用 OpenAI 的 o200k_base（GPT-4o、GPT-4.1、GPT-5、o 系列）和 cl100k_base（GPT-4、GPT-3.5）分词器精确计算 token 数，并可视化分词结果，完全离线运行。',
        keywords: ['token', '计数', 'tokenizer', '分词', 'gpt', 'openai', '大模型', '上下文', 'prompt', 'tiktoken'],
        howto: [
          '粘贴你的 prompt、文档或对话记录。',
          '选择分词器：当前的 OpenAI 模型用 `o200k_base`，GPT-4 和 GPT-3.5 用 `cl100k_base`。',
          'token 数、字符数、词数会实时更新；打开可视化可以看到文本具体在哪里被切分。',
        ],
        faq: [
          {
            q: '对 Claude、Gemini、DeepSeek、通义千问准确吗？',
            a: '厂商之外的工具都无法做到精确：这些模型各有自己的分词器，Anthropic 和 Google 也没有公开可离线使用的版本。OpenAI 的计数可以作为参考（通常相差 10%–30%），需要精确数字时请使用厂商提供的 token 计数接口。',
          },
          {
            q: '为什么中文更费 token？',
            a: '分词器主要用英文语料训练，常见英文单词往往只占 1 个 token，而中文字符可能每个占 1 个或更多 token。o200k_base 这类新分词器处理中文比 cl100k_base 高效不少。',
          },
          {
            q: '我的文本会被上传吗？',
            a: '不会。分词器（开源库 gpt-tokenizer）只需下载一次，之后完全在浏览器中运行。',
          },
        ],
      },
    },
  },
  {
    slug: 'markdown-cleaner',
    category: 'llm',
    glyph: 'MD',
    related: ['token-counter', 'text-diff', 'llm-stream-parser'],
    text: {
      en: {
        name: 'AI Markdown Cleaner',
        title: 'Clean ChatGPT / Claude Markdown – Convert to Plain Text or Rich Text',
        description:
          'Paste an answer from ChatGPT, Claude, Gemini or DeepSeek and remove the **, ##, backticks and citation markers. Get clean plain text, or copy as formatted rich text for Word, Google Docs, email and Feishu.',
        keywords: ['markdown to text', 'remove markdown', 'chatgpt', 'claude', 'ai text', 'plain text', 'rich text', 'clean', 'formatting'],
        howto: [
          'Paste the AI response, including its Markdown symbols.',
          'Choose **Plain text** to strip all formatting, or **Rich text** to keep headings, bold, lists and tables.',
          'Optionally remove emoji, citation markers like `[1]`, or keep link URLs and list bullets.',
          'Click Copy. In Rich text mode the formatting pastes correctly into Word, Google Docs, Notion, Outlook, Feishu and WeChat editors.',
        ],
        faq: [
          {
            q: 'Why do I see ** and ## when I paste AI answers?',
            a: 'Chat assistants write Markdown, which their own interface renders. When you copy the raw text into apps that don’t understand Markdown, the symbols show up literally.',
          },
          {
            q: 'What happens to tables?',
            a: 'In Plain text mode table cells are separated by tabs, so they paste neatly into Excel or Google Sheets. In Rich text mode they become real tables.',
          },
        ],
      },
      zh: {
        name: 'AI 文本 Markdown 清洗',
        title: '清除 ChatGPT / Claude 回答中的 Markdown 符号（转纯文本或富文本）',
        description: '粘贴 ChatGPT、Claude、Gemini、DeepSeek、豆包的回答，去掉 **、##、反引号和引用标记，得到干净的纯文本，或复制为可直接粘贴到 Word、飞书、公众号编辑器的富文本。',
        keywords: ['markdown转文本', '去除markdown', 'chatgpt', 'claude', 'deepseek', 'ai文本', '纯文本', '富文本', '公众号', '飞书'],
        howto: [
          '粘贴 AI 的回答（包括其中的 Markdown 符号）。',
          '选择“纯文本”去掉所有格式，或选择“富文本”保留标题、加粗、列表和表格。',
          '可选：去掉 emoji、去掉 `[1]` 这类引用标记、保留链接地址和列表符号。',
          '点击复制。富文本模式下，格式可以正确粘贴到 Word、飞书文档、Notion、公众号编辑器和邮件中。',
        ],
        faq: [
          {
            q: '为什么粘贴 AI 回答会出现 ** 和 ##？',
            a: 'AI 助手输出的是 Markdown，它们自己的界面会渲染这些符号。复制原始文本到不支持 Markdown 的软件里，符号就会原样显示出来。',
          },
          {
            q: '表格会怎么处理？',
            a: '纯文本模式下单元格用 Tab 分隔，可以直接粘贴进 Excel 或飞书表格；富文本模式下会变成真正的表格。',
          },
        ],
      },
    },
  },
  {
    slug: 'mcp-config-generator',
    category: 'llm',
    glyph: 'MCP',
    related: ['json-formatter', 'json-schema-generator', 'llm-stream-parser'],
    text: {
      en: {
        name: 'MCP Config Generator',
        title: 'MCP Server Config Generator – Claude Desktop, Claude Code, Cursor, VS Code, Windsurf',
        description:
          'Fill in an MCP server once and get the correct config for Claude Desktop, Claude Code, Cursor, VS Code and Windsurf — local (stdio) or remote (HTTP) servers, with env vars and headers.',
        keywords: ['mcp', 'model context protocol', 'mcp server', 'claude desktop', 'claude code', 'cursor', 'vscode', 'windsurf', 'config', 'mcp.json'],
        howto: [
          'Start from a preset or enter your own server. For a local server, type the full command (for example `npx -y @modelcontextprotocol/server-filesystem ~/Documents`). For a remote server, enter its URL.',
          'Add environment variables (API keys) or HTTP headers if the server needs them.',
          'Switch between clients to get each one’s exact format, and the file path to put it in.',
          'Merge the server entry into your existing config file, then restart the client.',
        ],
        faq: [
          {
            q: 'What is MCP?',
            a: 'The Model Context Protocol is an open standard that lets AI apps such as Claude, Cursor and VS Code Copilot connect to external tools and data sources through “MCP servers”.',
          },
          {
            q: 'How do I use a remote server in Claude Desktop?',
            a: 'Claude Desktop’s config file only starts local processes, so the generator wraps remote URLs with the `mcp-remote` bridge (`npx -y mcp-remote <url>`). You can also add remote servers as connectors in Claude’s settings.',
          },
          {
            q: 'My existing config already has servers. Will this overwrite them?',
            a: 'Copy only the inner server entry into your existing `mcpServers` (or `servers` for VS Code) object. Client formats evolve, so check the client’s docs if something doesn’t load.',
          },
        ],
      },
      zh: {
        name: 'MCP 配置生成器',
        title: 'MCP Server 配置生成器（Claude Desktop、Claude Code、Cursor、VS Code、Windsurf）',
        description: '填写一次 MCP 服务器信息，自动生成 Claude Desktop、Claude Code、Cursor、VS Code、Windsurf 的正确配置，支持本地（stdio）和远程（HTTP）服务器、环境变量和请求头。',
        keywords: ['mcp', 'model context protocol', 'mcp配置', 'claude desktop', 'claude code', 'cursor', 'vscode', 'windsurf', 'mcp.json'],
        howto: [
          '从预设开始，或填写你自己的服务器。本地服务器直接输入完整命令（例如 `npx -y @modelcontextprotocol/server-filesystem ~/Documents`）；远程服务器填写 URL。',
          '如果服务器需要，添加环境变量（API Key）或 HTTP 请求头。',
          '切换客户端，查看每个客户端对应的格式和配置文件路径。',
          '把服务器条目合并到你现有的配置文件中，然后重启客户端。',
        ],
        faq: [
          {
            q: '什么是 MCP？',
            a: 'Model Context Protocol（模型上下文协议）是一个开放标准，让 Claude、Cursor、VS Code Copilot 等 AI 应用通过 “MCP 服务器” 连接外部工具和数据源。',
          },
          {
            q: 'Claude Desktop 怎么使用远程服务器？',
            a: 'Claude Desktop 的配置文件只能启动本地进程，所以生成器会用 `mcp-remote` 桥接远程地址（`npx -y mcp-remote <url>`）。你也可以在 Claude 的设置中把远程服务器添加为连接器。',
          },
          {
            q: '我的配置里已经有其他服务器了，会被覆盖吗？',
            a: '只需把生成的服务器条目复制到现有的 `mcpServers`（VS Code 是 `servers`）对象里即可。各客户端的格式可能更新，如果加载失败请参考对应客户端的官方文档。',
          },
        ],
      },
    },
  },
  {
    slug: 'jsonl-validator',
    category: 'ai',
    glyph: 'JL',
    related: ['token-counter', 'json-formatter', 'json-schema-generator'],
    text: {
      en: {
        name: 'JSONL Validator',
        title: 'JSONL Validator & Viewer – Check Fine-Tuning Datasets',
        description:
          'Validate JSON Lines files line by line, preview records in a table, and check OpenAI-style chat fine-tuning data (roles, missing assistant replies, empty content). Convert JSONL ⇄ JSON arrays.',
        keywords: ['jsonl', 'json lines', 'ndjson', 'validator', 'fine-tuning', 'dataset', 'openai', 'training data', 'viewer'],
        howto: [
          'Paste JSONL or open a `.jsonl` file — it never leaves your browser.',
          'Every line is parsed. Errors and warnings are listed with their line numbers.',
          'If the data uses the `{"messages": [...]}` chat format, it is also checked for valid roles, missing assistant replies and empty messages.',
          'Use the converter to turn a JSON array into JSONL or back.',
        ],
        faq: [
          {
            q: 'What is JSONL?',
            a: 'JSON Lines puts one JSON object on each line. It is the standard format for LLM fine-tuning datasets, batch API requests and log files because it can be streamed and appended line by line.',
          },
          {
            q: 'Does it check token limits?',
            a: 'Use the Token Counter tool for that. This validator focuses on structure: each line must parse, and chat examples must contain a valid sequence of roles ending in an assistant reply.',
          },
        ],
      },
      zh: {
        name: 'JSONL 校验器',
        title: 'JSONL 在线校验与预览（检查大模型微调数据集）',
        description: '逐行校验 JSON Lines 文件，用表格预览数据，并检查 OpenAI 格式的对话微调数据（角色、缺少 assistant 回复、空内容等），支持 JSONL 与 JSON 数组互转。',
        keywords: ['jsonl', 'json lines', 'ndjson', '校验', '微调', '数据集', 'fine-tuning', '训练数据', '预览'],
        howto: [
          '粘贴 JSONL 或打开 `.jsonl` 文件，文件不会离开你的浏览器。',
          '每一行都会被解析，错误和警告会附带行号列出。',
          '如果数据是 `{"messages": [...]}` 对话格式，还会检查角色是否合法、是否缺少 assistant 回复、是否有空消息。',
          '用转换器可以把 JSON 数组转成 JSONL，也可以反向转换。',
        ],
        faq: [
          {
            q: '什么是 JSONL？',
            a: 'JSON Lines 每行一个 JSON 对象。因为可以逐行流式读取和追加，它是大模型微调数据集、批量 API 请求和日志文件的标准格式。',
          },
          {
            q: '会检查 token 上限吗？',
            a: '这个需求请用 Token 计数器。本工具专注于结构校验：每行都必须能被解析，对话样本的角色顺序必须合法，并以 assistant 回复结尾。',
          },
        ],
      },
    },
  },
  {
    slug: 'llm-stream-parser',
    category: 'llm',
    glyph: 'SSE',
    related: ['json-formatter', 'token-counter', 'curl-converter'],
    text: {
      en: {
        name: 'LLM Stream (SSE) Parser',
        title: 'LLM Streaming Response Parser – Reassemble OpenAI, Claude & Gemini SSE',
        description:
          'Paste a raw streaming response (Server-Sent Events or NDJSON) from OpenAI, Anthropic Claude, Google Gemini, Ollama or any OpenAI-compatible API, and get the final text, reasoning, tool calls and token usage.',
        keywords: ['sse', 'server-sent events', 'stream', 'streaming', 'openai', 'claude', 'anthropic', 'gemini', 'ollama', 'deepseek', 'debug', 'tool calls', 'delta'],
        howto: [
          'Copy the raw stream: from browser DevTools (Network → EventStream / Response), from `curl -N`, or from your server logs.',
          'Paste it in. The format is detected automatically: OpenAI Chat Completions, the OpenAI Responses API, Anthropic Messages, Gemini or Ollama. OpenAI-compatible APIs (DeepSeek, Qwen, Groq, vLLM…) work too.',
          'Read the reassembled answer, the reasoning or thinking text, each tool call with its complete JSON arguments, the stop reason and token usage.',
        ],
        faq: [
          {
            q: 'Why debug streams by hand?',
            a: 'When a streamed answer is cut off, a tool call’s arguments fail to parse, or token usage looks wrong, the raw chunks are the source of truth. Reassembling them shows exactly what the API sent.',
          },
          {
            q: 'My tool-call arguments are invalid JSON. Why?',
            a: 'Arguments arrive as string fragments spread across many chunks. If any chunk is missing — for example, because a proxy buffered or dropped data — the concatenated JSON breaks. The parser highlights arguments that don’t parse.',
          },
        ],
      },
      zh: {
        name: '大模型流式响应解析',
        title: '大模型流式响应（SSE）解析器：还原 OpenAI、Claude、Gemini 输出',
        description: '粘贴 OpenAI、Anthropic Claude、Google Gemini、Ollama 或任意 OpenAI 兼容接口的原始流式响应（SSE 或 NDJSON），还原出最终文本、思考过程、工具调用和 token 用量。',
        keywords: ['sse', '流式', 'stream', 'openai', 'claude', 'gemini', 'deepseek', 'ollama', '调试', '工具调用', 'delta', '大模型'],
        howto: [
          '复制原始流：可以来自浏览器开发者工具（Network → EventStream / Response）、`curl -N` 的输出或服务端日志。',
          '粘贴进来，会自动识别格式：OpenAI Chat Completions、OpenAI Responses API、Anthropic Messages、Gemini 或 Ollama。DeepSeek、通义千问、Groq、vLLM 等 OpenAI 兼容接口同样适用。',
          '查看还原后的回答、思考（reasoning / thinking）内容、每个工具调用的完整 JSON 参数、结束原因和 token 用量。',
        ],
        faq: [
          {
            q: '为什么要手动调试流式响应？',
            a: '当流式回答被截断、工具调用参数解析失败或 token 用量看起来不对时，原始数据块才是事实依据。把它们拼起来，就能准确看到 API 到底发送了什么。',
          },
          {
            q: '工具调用的参数不是合法 JSON，为什么？',
            a: '参数是以字符串片段的形式分散在多个数据块里发送的。只要中间丢了一块（比如被代理缓冲或丢弃），拼接后的 JSON 就会损坏。解析器会标出无法解析的参数。',
          },
        ],
      },
    },
  },
  // ------------------------------------------------------------- classic
  {
    slug: 'curl-converter',
    category: 'format',
    glyph: 'curl',
    related: ['llm-stream-parser', 'url-encoder', 'json-formatter'],
    text: {
      en: {
        name: 'curl to Code',
        title: 'curl to JavaScript fetch, Python requests & Go Converter',
        description:
          'Convert curl commands into JavaScript fetch, Python requests or Go net/http code. Handles headers, JSON bodies, form data, basic auth and multi-line commands copied from API docs or DevTools.',
        keywords: ['curl', 'curl to fetch', 'curl to python', 'curl to go', 'requests', 'converter', 'http', 'api'],
        howto: [
          'Paste a curl command, for example from API documentation or from DevTools (right-click a request → Copy as cURL).',
          'Choose the target: JavaScript `fetch`, Python `requests` or Go `net/http`.',
          'JSON bodies are pretty-printed in the target language. `-F` form uploads, `-u` basic auth, `-G` query data and line continuations are all supported.',
        ],
        faq: [
          {
            q: 'Are environment variables like $API_KEY expanded?',
            a: 'No. They are kept as literal text so you can see where to insert your secret. Replace them with your language’s way of reading environment variables (`process.env`, `os.environ`, `os.Getenv`).',
          },
          {
            q: 'Which curl options are ignored?',
            a: 'Transport options with no direct equivalent, such as `--compressed`, `-s`, `-v`, `-o` and timeouts, are skipped. `-k` becomes `verify=False` in Python.',
          },
        ],
      },
      zh: {
        name: 'curl 转代码',
        title: 'curl 转 JavaScript fetch / Python requests / Go 代码',
        description: '把 curl 命令转换成 JavaScript fetch、Python requests 或 Go net/http 代码，支持请求头、JSON 请求体、表单上传、Basic 认证，以及从 API 文档或开发者工具复制的多行命令。',
        keywords: ['curl', 'curl转代码', 'curl转python', 'curl转fetch', 'curl转go', 'requests', 'http', '接口'],
        howto: [
          '粘贴 curl 命令，比如来自 API 文档，或者从开发者工具中复制（右键请求 → Copy as cURL）。',
          '选择目标语言：JavaScript `fetch`、Python `requests` 或 Go `net/http`。',
          'JSON 请求体会在目标语言中格式化输出。支持 `-F` 表单上传、`-u` Basic 认证、`-G` 查询参数和多行命令（行尾 `\\`）。',
        ],
        faq: [
          {
            q: '$API_KEY 这类环境变量会被展开吗？',
            a: '不会，会原样保留，方便你看清楚在哪里填入密钥。请换成对应语言读取环境变量的写法（`process.env`、`os.environ`、`os.Getenv`）。',
          },
          {
            q: '哪些 curl 参数会被忽略？',
            a: '没有直接对应写法的传输类参数会被跳过，例如 `--compressed`、`-s`、`-v`、`-o` 和超时设置。`-k` 在 Python 中会转成 `verify=False`。',
          },
        ],
      },
    },
  },
  {
    slug: 'sql-formatter',
    category: 'format',
    glyph: 'SQL',
    related: ['json-formatter', 'text-diff', 'curl-converter'],
    text: {
      en: {
        name: 'SQL Formatter',
        title: 'SQL Formatter & Beautifier – MySQL, PostgreSQL, SQLite and more',
        description:
          'Format and beautify SQL queries for MySQL, PostgreSQL, SQLite, SQL Server, BigQuery, Snowflake and more. Choose keyword case and indentation — locally in your browser.',
        keywords: ['sql', 'formatter', 'beautifier', 'pretty print', 'mysql', 'postgresql', 'sqlite', 'query', 'format sql'],
        howto: [
          'Paste a SQL query — even a long one-liner copied from logs or an ORM.',
          'Pick your dialect so that dialect-specific syntax is understood.',
          'Choose keyword case (UPPER, lower or preserve) and indentation width. The output updates instantly.',
        ],
        faq: [
          {
            q: 'Does formatting change what my query does?',
            a: 'No. Only whitespace and, optionally, keyword case change. Identifiers, strings and comments are preserved.',
          },
          {
            q: 'Why does formatting fail on my query?',
            a: 'Usually the wrong dialect is selected (for example backtick identifiers need MySQL) or the query contains template placeholders. Try another dialect, or replace placeholders with literal values.',
          },
        ],
      },
      zh: {
        name: 'SQL 格式化',
        title: 'SQL 在线格式化 / 美化（MySQL、PostgreSQL、SQLite 等）',
        description: '格式化和美化 MySQL、PostgreSQL、SQLite、SQL Server、BigQuery、Snowflake 等方言的 SQL 语句，可选关键字大小写和缩进，全部在本地完成。',
        keywords: ['sql', '格式化', '美化', 'mysql', 'postgresql', 'sqlite', '查询', 'sql美化'],
        howto: [
          '粘贴 SQL 语句，从日志或 ORM 中复制出来的超长单行语句也可以。',
          '选择数据库方言，以便正确识别方言特有的语法。',
          '选择关键字大小写（大写、小写或保持原样）和缩进宽度，结果会实时更新。',
        ],
        faq: [
          {
            q: '格式化会改变查询的逻辑吗？',
            a: '不会。只会调整空白字符和（可选的）关键字大小写，标识符、字符串和注释都会原样保留。',
          },
          {
            q: '为什么我的 SQL 格式化失败？',
            a: '通常是方言选错了（比如反引号标识符需要选 MySQL），或者语句中含有模板占位符。换一个方言试试，或者把占位符替换成实际的值。',
          },
        ],
      },
    },
  },
  {
    slug: 'cron-parser',
    category: 'time',
    glyph: '*/5',
    related: ['timestamp', 'regex-tester', 'uuid-generator'],
    text: {
      en: {
        name: 'Cron Expression Parser',
        title: 'Cron Expression Parser – Human-Readable Description & Next Run Times',
        description:
          'Explain a cron expression in plain English or Chinese and list its next run times in your time zone. Supports ranges, steps, lists, month and weekday names, and @daily-style macros.',
        keywords: ['cron', 'crontab', 'cron expression', 'schedule', 'parser', 'next run', 'crontab guru', 'cron generator'],
        howto: [
          'Type a 5-field cron expression: `minute hour day-of-month month day-of-week`.',
          'Read the plain-language description and check the next 10 run times in your local time zone.',
          'Click a preset to start from common schedules like “every 5 minutes” or “weekdays at 9:00”.',
        ],
        faq: [
          {
            q: 'What does */15 mean?',
            a: 'A step: “every 15 units starting from the minimum”. `*/15` in the minute field runs at minutes 0, 15, 30 and 45. `10-30/5` runs at 10, 15, 20, 25 and 30.',
          },
          {
            q: 'What if both day-of-month and day-of-week are set?',
            a: 'In standard cron the job runs when either field matches. `0 0 1 * MON` runs on the 1st of every month and also on every Monday.',
          },
          {
            q: 'Which time zone is used?',
            a: 'Cron runs in the server’s time zone (often UTC on cloud platforms). The next run times here are shown in your browser’s time zone, so adjust if your server differs.',
          },
        ],
      },
      zh: {
        name: 'Cron 表达式解析',
        title: 'Cron 表达式在线解析（中文说明 + 下次执行时间）',
        description: '用中文或英文解释 cron 表达式，并按你的时区列出接下来的执行时间。支持范围、步长、列表、月份和星期名称，以及 @daily 这类宏。',
        keywords: ['cron', 'crontab', 'cron表达式', '定时任务', '解析', '执行时间', 'cron生成'],
        howto: [
          '输入 5 段式 cron 表达式：`分 时 日 月 周`。',
          '查看自然语言说明，并确认按本地时区计算的接下来 10 次执行时间。',
          '点击预设，可以从“每 5 分钟”“工作日 9:00”等常用规则开始修改。',
        ],
        faq: [
          {
            q: '*/15 是什么意思？',
            a: '表示步长，“从最小值开始每隔 15 个单位”。分钟字段写 `*/15` 会在第 0、15、30、45 分钟执行；`10-30/5` 会在 10、15、20、25、30 分执行。',
          },
          {
            q: '同时设置了“日”和“周”会怎样？',
            a: '在标准 cron 中，只要其中一个字段匹配就会执行。`0 0 1 * MON` 会在每月 1 号执行，同时每个星期一也会执行。',
          },
          {
            q: '用的是哪个时区？',
            a: 'cron 按服务器的时区运行（云平台上通常是 UTC）。这里显示的执行时间使用你浏览器的时区，如果和服务器不同，请自行换算。',
          },
        ],
      },
    },
  },
  {
    slug: 'text-diff',
    category: 'text',
    glyph: 'DIFF',
    related: ['markdown-cleaner', 'json-formatter', 'regex-tester'],
    text: {
      en: {
        name: 'Text Diff',
        title: 'Text Diff Checker – Compare Two Texts Online',
        description:
          'Compare two texts or code snippets and highlight the differences by line, word or character. Ideal for comparing prompt versions, AI rewrites, config files and JSON.',
        keywords: ['diff', 'compare', 'text compare', 'difference', 'diff checker', 'code compare', 'prompt', 'merge'],
        howto: [
          'Paste the original text on the left and the changed text on the right.',
          'Choose the granularity: lines (for code), words (for prose) or characters (for small edits).',
          'Added text is green and removed text is red. Optionally ignore whitespace or letter case.',
        ],
        faq: [
          {
            q: 'Can I compare two prompts or AI outputs?',
            a: 'Yes — word mode works well for seeing exactly what an AI rewrite changed, or how two versions of a prompt differ.',
          },
          {
            q: 'How do I compare JSON with different key order?',
            a: 'Run both through the JSON Formatter with “Sort keys” enabled first, then compare the results here.',
          },
        ],
      },
      zh: {
        name: '文本对比',
        title: '文本对比工具（在线 Diff，比较两段文本差异）',
        description: '对比两段文本或代码，按行、按词或按字符高亮差异，适合比较不同版本的 prompt、AI 改写前后的内容、配置文件和 JSON。',
        keywords: ['diff', '对比', '文本对比', '差异', '比较', '代码对比', 'prompt'],
        howto: [
          '左边粘贴原始文本，右边粘贴修改后的文本。',
          '选择对比粒度：按行（适合代码）、按词（适合文章）或按字符（适合细小改动）。',
          '新增的内容显示为绿色，删除的内容显示为红色，可选择忽略空白或大小写。',
        ],
        faq: [
          {
            q: '能对比两个 prompt 或 AI 输出吗？',
            a: '可以。用“按词”模式，可以清楚看到 AI 改写具体改了哪些地方，或者两个版本的 prompt 有什么不同。',
          },
          {
            q: '键顺序不同的 JSON 怎么对比？',
            a: '先用 JSON 格式化工具分别处理两段 JSON 并勾选“键排序”，再把结果粘贴到这里对比。',
          },
        ],
      },
    },
  },
];
