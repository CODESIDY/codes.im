import type { Category } from '../tools/registry';
import type { Lang } from '../i18n/ui';

/** SEO copy for the category landing pages (/[lang]/tools/[category]/). */
export const categoryPages: Record<Category, Record<Lang, { title: string; description: string; intro: string }>> = {
  ai: {
    en: {
      title: 'AI Developer Tools for Structured Output & Data',
      description: 'Free tools for building with LLMs: JSON Schema for structured outputs, JSON repair, Zod schemas, JSONL validation, OpenAPI to tool definitions and embedding similarity.',
      intro: 'Getting reliable, machine-readable data out of a language model is most of the work in an LLM feature. These tools help you design schemas for structured outputs and function calling, repair and validate what the model returns, prepare fine-tuning datasets, and compare embeddings — all locally in your browser.',
    },
    zh: {
      title: 'AI 开发工具：结构化输出与数据',
      description: '开发大模型应用的免费工具：结构化输出 JSON Schema、JSON 修复、Zod Schema、JSONL 校验、OpenAPI 转工具定义、Embedding 向量相似度。',
      intro: '让大模型稳定地输出机器可读的数据，是 LLM 功能里最花功夫的部分。这些工具帮你为结构化输出和函数调用设计 Schema，修复并校验模型返回的结果，准备微调数据集，比较 Embedding 向量 —— 全部在浏览器本地完成。',
    },
  },
  llm: {
    en: {
      title: 'LLM Tools for Prompts, Tokens & Integration',
      description: 'Count tokens, estimate API cost across GPT, Claude, Gemini and DeepSeek, chunk text for RAG, build prompt templates, parse streaming responses and generate MCP configs.',
      intro: 'Everyday utilities for wiring language models into real products: count tokens and compare what a workload will cost on each provider, split documents for retrieval, debug server-sent event streams, convert chat formats, and set up MCP servers and llms.txt files.',
    },
    zh: {
      title: '大模型工具：Prompt、Token 与接入',
      description: '计算 Token、对比 GPT / Claude / Gemini / DeepSeek 的 API 费用、为 RAG 切分文本、编写 Prompt 模板、解析流式响应、生成 MCP 配置。',
      intro: '把大模型接入真实产品时天天要用的小工具：统计 Token 并比较同一负载在各家的费用，为检索切分文档，调试 SSE 流式响应，转换对话格式，配置 MCP 服务和 llms.txt。',
    },
  },
  format: {
    en: {
      title: 'Format & Convert Tools for JSON, YAML, CSV & SQL',
      description: 'Format and validate JSON, query it with JSONPath, diff two documents, convert between JSON, YAML and CSV, generate TypeScript or Go types, and turn curl into code.',
      intro: 'Tools for the data you handle every day. Pretty-print and validate JSON, query it with JSONPath, compare two API responses structurally, convert between JSON, YAML and CSV, generate typed models in several languages, format SQL and translate curl commands into fetch, Python or Go.',
    },
    zh: {
      title: '格式化与转换工具：JSON、YAML、CSV、SQL',
      description: '格式化校验 JSON、用 JSONPath 查询、对比两个 JSON、JSON / YAML / CSV 互转、生成 TypeScript 或 Go 类型、把 curl 转成代码。',
      intro: '处理日常数据的工具：格式化和校验 JSON，用 JSONPath 查询，按结构对比两个接口返回，在 JSON、YAML、CSV 之间转换，生成多种语言的类型定义，格式化 SQL，把 curl 命令转成 fetch、Python 或 Go 代码。',
    },
  },
  encode: {
    en: {
      title: 'Encode & Decode Tools – Base64, URL, JWT, Unicode',
      description: 'Encode and decode Base64, URL components, HTML entities and Unicode escapes, inspect JWTs and convert numbers between bases.',
      intro: 'Quick encoders and decoders for the formats that show up in headers, URLs, tokens and logs. Everything is handled as UTF-8 and processed locally, so it is safe to paste tokens and credentials.',
    },
    zh: {
      title: '编码与解码工具：Base64、URL、JWT、Unicode',
      description: 'Base64、URL、HTML 实体、Unicode 转义的编码与解码，JWT 解析，以及任意进制转换。',
      intro: '处理请求头、URL、令牌和日志中常见格式的编解码工具。全部按 UTF-8 处理并在本地完成，粘贴令牌和凭证也很安全。',
    },
  },
  image: {
    en: {
      title: 'Image Tools – Compress, Resize & Convert to Base64',
      description: 'Compress and resize JPEG, PNG and WebP images and convert images to Base64 data URIs — in your browser, without uploading.',
      intro: 'Image utilities that never upload your files. Shrink screenshots and photos before sharing or shipping them, convert to WebP, strip location metadata, and turn small images into data URIs for HTML, CSS or multimodal LLM requests.',
    },
    zh: {
      title: '图片工具：压缩、缩放、转 Base64',
      description: '在浏览器里压缩和缩放 JPEG、PNG、WebP 图片，把图片转换成 Base64 Data URI —— 不上传。',
      intro: '不上传文件的图片工具。分享或上线前压缩截图和照片、转换为 WebP、去掉位置等元数据，或者把小图转成 Data URI，用在 HTML、CSS 或多模态大模型请求里。',
    },
  },
  text: {
    en: {
      title: 'Text Tools – Word Counter, Regex Tester, Diff, Markdown & Case Converter',
      description: 'Count words and characters, test regular expressions, compare text, write Markdown with live preview and convert identifiers between camelCase, snake_case and more.',
      intro: 'Tools for working with text and code: test regular expressions with live highlighting, diff two versions line by line, edit Markdown with a live preview, and rename identifiers between naming conventions.',
    },
    zh: {
      title: '文本工具：字数统计、正则测试、文本对比、Markdown、命名转换',
      description: '中英文字数统计、在线测试正则表达式、对比文本差异、实时预览 Markdown，以及 camelCase、snake_case 等命名风格互转。',
      intro: '处理文本和代码的工具：实时高亮测试正则表达式，逐行对比两个版本，边写 Markdown 边预览，在各种命名风格之间转换变量名。',
    },
  },
  generate: {
    en: {
      title: 'Generators & Utilities – UUID, Fake Data, Subnet Calculator, Chmod & More',
      description: 'Generate UUIDs, hashes, secure passwords, QR codes and fake test data; calculate IP subnets and chmod permissions; parse User-Agent strings.',
      intro: 'Generators built on the browser’s cryptographically secure random source, plus small utilities you reach for during setup and deployment.',
    },
    zh: {
      title: '生成器与实用工具：UUID、假数据、子网计算、Chmod 等',
      description: '生成 UUID、哈希、安全密码、二维码和测试假数据，计算 IP 子网与 chmod 权限，解析 User-Agent。',
      intro: '基于浏览器密码学安全随机数的生成器，以及部署和配置时常用的小工具。',
    },
  },
  time: {
    en: {
      title: 'Date & Time Tools – Unix Timestamp & Cron',
      description: 'Convert Unix timestamps in seconds, milliseconds or nanoseconds, and explain cron expressions with their next run times.',
      intro: 'Time is where bugs hide: units, time zones and schedules. Convert timestamps between formats and zones, and check what a cron expression really means before it runs in production.',
    },
    zh: {
      title: '日期与时间工具：Unix 时间戳与 Cron',
      description: '秒、毫秒、纳秒 Unix 时间戳转换，解释 Cron 表达式并列出接下来的执行时间。',
      intro: '时间最容易藏 bug：单位、时区、调度。在不同格式和时区之间转换时间戳，并在上线前确认 Cron 表达式的真实含义。',
    },
  },
};
