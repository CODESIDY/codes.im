import type { Tool } from './registry';

/** Fourth batch: validation, code generation, llms.txt and everyday utilities. */
export const batch4: Tool[] = [
  {
    slug: 'json-schema-validator',
    category: 'ai',
    glyph: '✓{}',
    related: ['json-schema-generator', 'json-repair', 'json-to-zod'],
    text: {
      en: {
        name: 'JSON Schema Validator',
        title: 'JSON Schema Validator – Check LLM Structured Output Against a Schema',
        description:
          'Validate JSON data against a JSON Schema (draft-07, 2019-09, 2020-12) and see every error with its path. Paste an OpenAI response_format or a Claude tool definition directly — the schema is extracted automatically.',
        keywords: ['json schema validator', 'validate json', 'ajv', 'structured outputs', 'schema', 'draft 2020-12', 'draft-07', 'llm output validation'],
        howto: [
          'Paste the JSON Schema on the left. OpenAI `response_format`, OpenAI tools and Anthropic tools are unwrapped automatically.',
          'Paste the JSON data — for example a model’s response — on the right.',
          'Every validation error is listed with its JSON Pointer path, such as `/items/0/price`, so you can see exactly what failed.',
        ],
        faq: [
          {
            q: 'Which JSON Schema versions are supported?',
            a: 'Draft-07 (the default), 2019-09 and 2020-12, chosen from the `$schema` keyword. Common formats such as `email`, `date-time`, `uri` and `uuid` are checked too.',
          },
          {
            q: 'Why validate when I already use structured outputs?',
            a: 'Model output can be cut off or refused, providers support only a subset of JSON Schema, and older models or proxies may ignore the schema. Validating before you use the data turns silent bugs into clear errors you can retry on.',
          },
        ],
      },
      zh: {
        name: 'JSON Schema 校验',
        title: 'JSON Schema 在线校验：检查大模型结构化输出是否符合 Schema',
        description: '用 JSON Schema（draft-07、2019-09、2020-12）校验 JSON 数据，列出每个错误及其路径。可以直接粘贴 OpenAI response_format 或 Claude 工具定义，会自动提取其中的 schema。',
        keywords: ['json schema校验', 'json校验', 'ajv', '结构化输出', 'schema', '大模型输出校验'],
        howto: [
          '在左侧粘贴 JSON Schema。OpenAI `response_format`、OpenAI tools 和 Anthropic tools 会被自动解包。',
          '在右侧粘贴要校验的 JSON 数据，比如模型的返回结果。',
          '每个校验错误都会附带 JSON Pointer 路径（例如 `/items/0/price`），一眼看出哪里不符合。',
        ],
        faq: [
          {
            q: '支持哪些 JSON Schema 版本？',
            a: '根据 `$schema` 关键字自动选择 draft-07（默认）、2019-09 或 2020-12，也会校验 `email`、`date-time`、`uri`、`uuid` 等常见格式。',
          },
          {
            q: '已经用了结构化输出，为什么还要校验？',
            a: '模型输出可能被截断或拒答，各家只支持 JSON Schema 的一个子集，旧模型或代理服务也可能忽略 schema。在使用数据前先校验，可以把隐蔽的 bug 变成明确的、可以据此重试的错误。',
          },
        ],
      },
    },
  },
  {
    slug: 'llms-txt-generator',
    category: 'llm',
    glyph: 'llms',
    related: ['markdown-editor', 'mcp-config-generator', 'openapi-to-tools'],
    text: {
      en: {
        name: 'llms.txt Generator',
        title: 'llms.txt Generator – Help AI Assistants Understand Your Website',
        description:
          'Create an llms.txt file for your website or docs: a Markdown index that tells LLMs and AI agents which pages matter. Import links from your sitemap.xml and download the result.',
        keywords: ['llms.txt', 'llms txt generator', 'ai seo', 'geo', 'generative engine optimization', 'llm', 'sitemap', 'ai crawler', 'documentation'],
        howto: [
          'Enter your site name, a one-sentence summary and optional details.',
          'Add sections of links — one per line as `Title | URL | notes`, a Markdown link, or a bare URL — or import them from your sitemap.xml.',
          'Name a section **Optional** for secondary pages that can be skipped when context is short.',
          'Download `llms.txt` and serve it from the root of your site, e.g. `https://example.com/llms.txt`.',
        ],
        faq: [
          {
            q: 'What is llms.txt?',
            a: 'A proposed convention (llmstxt.org): a Markdown file at `/llms.txt` with an H1 title, a short summary in a blockquote, and H2 sections listing links to the most useful pages. It gives AI tools a concise map of your content instead of making them crawl HTML.',
          },
          {
            q: 'Do AI search engines actually use it?',
            a: 'Support varies and is still evolving. It is most useful today for documentation sites, where coding assistants and agents can fetch it directly. It costs little to add and does not affect normal SEO.',
          },
        ],
      },
      zh: {
        name: 'llms.txt 生成器',
        title: 'llms.txt 生成器：让 AI 助手更好地理解你的网站',
        description: '为网站或文档生成 llms.txt：一个告诉大模型和 AI agent 哪些页面最重要的 Markdown 索引文件。支持从 sitemap.xml 导入链接，一键下载。',
        keywords: ['llms.txt', 'llms txt生成', 'ai seo', 'geo', '生成式引擎优化', '大模型', 'sitemap', '文档'],
        howto: [
          '填写网站名称、一句话简介和可选的详细说明。',
          '按分组添加链接：每行一个，格式可以是 `标题 | 网址 | 说明`、Markdown 链接或纯网址；也可以从 sitemap.xml 导入。',
          '把分组命名为 **Optional**，用来放上下文不够时可以跳过的次要页面。',
          '下载 `llms.txt`，放在网站根目录，例如 `https://example.com/llms.txt`。',
        ],
        faq: [
          {
            q: '什么是 llms.txt？',
            a: '一个提议中的约定（llmstxt.org）：在 `/llms.txt` 放一个 Markdown 文件，包含 H1 标题、引用块形式的简介，以及按 H2 分组列出的重要页面链接。它给 AI 工具提供一份简洁的内容地图，而不必去爬取 HTML。',
          },
          {
            q: 'AI 搜索引擎真的会用它吗？',
            a: '各家的支持程度不同，仍在发展中。目前对文档类网站最有用，编程助手和 agent 可以直接读取它。添加成本很低，也不会影响常规 SEO。',
          },
        ],
      },
    },
  },
  {
    slug: 'json-to-code',
    category: 'format',
    glyph: 'Py',
    related: ['json-to-typescript', 'json-to-zod', 'json-schema-generator'],
    text: {
      en: {
        name: 'JSON to Pydantic / Go / Rust',
        title: 'JSON to Pydantic, Go Struct & Rust Serde Converter',
        description:
          'Generate Pydantic models, Go structs with json tags, or Rust serde structs from sample JSON. Detects integers vs floats, optional and nullable fields, and renames keys that aren’t valid identifiers.',
        keywords: ['json to pydantic', 'json to go', 'json to go struct', 'json to rust', 'serde', 'pydantic', 'basemodel', 'code generator', 'json to python'],
        howto: [
          'Paste a JSON sample, such as an API response or the structured output you expect from an LLM.',
          'Choose the target: Pydantic (Python), Go or Rust, and set the root type name.',
          'Nested objects become separate types. Missing or `null` fields become `Optional` / pointers / `Option<T>`, and keys like `class` or `user-id` are renamed with an alias.',
        ],
        faq: [
          {
            q: 'Does the Pydantic output work with LLM structured outputs?',
            a: 'Yes. The OpenAI Python SDK, Instructor and many agent frameworks accept a Pydantic `BaseModel` as the output schema. Add `Field(description=...)` to guide the model further.',
          },
          {
            q: 'How are numbers typed?',
            a: 'If every value seen at a position is a whole number, it becomes `int` / `int64` / `i64`; otherwise `float` / `float64` / `f64`. Use a sample with realistic values for best results.',
          },
        ],
      },
      zh: {
        name: 'JSON 转 Pydantic / Go / Rust',
        title: 'JSON 转 Pydantic 模型、Go 结构体、Rust Serde 结构体',
        description: '根据示例 JSON 生成 Pydantic 模型、带 json tag 的 Go 结构体或 Rust serde 结构体，自动区分整数和浮点数、可选和可为空的字段，并为不合法的键名生成别名。',
        keywords: ['json转pydantic', 'json转go', 'json转go结构体', 'json转rust', 'serde', 'pydantic', '代码生成', 'json转python'],
        howto: [
          '粘贴一段 JSON 示例，比如接口返回值，或你期望大模型返回的结构化输出。',
          '选择目标语言：Pydantic（Python）、Go 或 Rust，并设置根类型名称。',
          '嵌套对象会生成独立类型；缺失或为 `null` 的字段会变成 `Optional` / 指针 / `Option<T>`；`class`、`user-id` 这类键名会通过别名重命名。',
        ],
        faq: [
          {
            q: '生成的 Pydantic 模型能用于大模型结构化输出吗？',
            a: '可以。OpenAI Python SDK、Instructor 和很多 agent 框架都接受 Pydantic `BaseModel` 作为输出 schema。补充 `Field(description=...)` 可以更好地引导模型。',
          },
          {
            q: '数字类型是怎么判断的？',
            a: '如果某个位置出现的值全部是整数，就生成 `int` / `int64` / `i64`，否则生成 `float` / `float64` / `f64`。示例数据越接近真实情况，结果越准确。',
          },
        ],
      },
    },
  },
  {
    slug: 'markdown-editor',
    category: 'text',
    glyph: 'M↓',
    related: ['markdown-cleaner', 'text-diff', 'llms-txt-generator'],
    text: {
      en: {
        name: 'Markdown Editor',
        title: 'Online Markdown Editor with Live Preview – Export HTML',
        description:
          'Write Markdown with a live GitHub-flavoured preview: tables, task lists, code blocks. Copy the rendered HTML or rich text, download a .md file, and see word count and reading time.',
        keywords: ['markdown editor', 'markdown preview', 'markdown to html', 'gfm', 'readme editor', 'online markdown', 'md'],
        howto: [
          'Type or paste Markdown on the left; the preview updates as you type.',
          'GitHub-flavoured Markdown is supported: tables, task lists, strikethrough and fenced code blocks.',
          'Copy the HTML, copy rich text for pasting into documents or email, or download a `.md` file.',
        ],
        faq: [
          {
            q: 'Is my text saved?',
            a: 'Your draft is kept in your browser’s local storage so it survives a page reload. It is never uploaded. Clear it any time with the Clear button.',
          },
          {
            q: 'Is raw HTML in Markdown allowed?',
            a: 'Basic HTML renders in the preview, but scripts, iframes and event handlers are removed for safety.',
          },
        ],
      },
      zh: {
        name: 'Markdown 编辑器',
        title: 'Markdown 在线编辑器（实时预览，导出 HTML）',
        description: '实时预览 GitHub 风格的 Markdown：表格、任务列表、代码块。可以复制渲染后的 HTML 或富文本、下载 .md 文件，并显示字数和阅读时间。',
        keywords: ['markdown编辑器', 'markdown预览', 'markdown转html', 'gfm', 'readme', '在线markdown', 'md'],
        howto: [
          '在左侧输入或粘贴 Markdown，右侧实时显示预览。',
          '支持 GitHub 风格 Markdown：表格、任务列表、删除线和代码块。',
          '可以复制 HTML、复制富文本粘贴到文档或邮件中，或者下载 `.md` 文件。',
        ],
        faq: [
          {
            q: '我写的内容会被保存吗？',
            a: '草稿保存在浏览器本地存储中，刷新页面不会丢失，也不会上传到任何地方。随时可以点“清空”删除。',
          },
          {
            q: 'Markdown 里可以写 HTML 吗？',
            a: '基础 HTML 可以在预览中显示，但出于安全考虑，脚本、iframe 和事件属性会被移除。',
          },
        ],
      },
    },
  },
  {
    slug: 'password-generator',
    category: 'generate',
    glyph: '***',
    related: ['uuid-generator', 'hash-generator', 'base64'],
    text: {
      en: {
        name: 'Password & API Key Generator',
        title: 'Strong Password Generator & Random API Key / Secret Generator',
        description:
          'Generate strong random passwords and secret tokens (hex, base64url, base62) with the Web Crypto API. Shows entropy in bits, excludes look-alike characters on request, and never sends anything over the network.',
        keywords: ['password generator', 'random password', 'strong password', 'api key generator', 'secret generator', 'random token', 'jwt secret', 'entropy'],
        howto: [
          'Choose a length and which character sets to include. Turn on “Exclude look-alikes” to avoid characters such as `l`, `1`, `O` and `0`.',
          'The strength meter shows entropy in bits — aim for 80+ bits for accounts and 128+ bits for secrets.',
          'Switch to **Token** mode for API keys, session secrets or JWT signing keys in hex, base64url or base62.',
        ],
        faq: [
          {
            q: 'Are these passwords truly random?',
            a: 'Yes. Characters are picked with `crypto.getRandomValues()` using rejection sampling, so every character is equally likely. Nothing is generated or logged on a server.',
          },
          {
            q: 'How long should a secret key be?',
            a: '32 random bytes (256 bits) is a common choice for HMAC and JWT signing keys and session secrets. Store secrets in environment variables or a secret manager, never in source code.',
          },
        ],
      },
      zh: {
        name: '密码与密钥生成器',
        title: '强密码生成器 / 随机 API Key 与密钥生成',
        description: '用 Web Crypto API 生成强随机密码和密钥（hex、base64url、base62），显示熵值（位数），可排除易混淆字符，不经过任何网络传输。',
        keywords: ['密码生成器', '随机密码', '强密码', 'api key生成', '密钥生成', '随机token', 'jwt密钥', '熵'],
        howto: [
          '选择长度和要包含的字符类型。勾选“排除易混淆字符”可以避免 `l`、`1`、`O`、`0` 这类字符。',
          '强度条显示熵值（位）：账号密码建议 80 位以上，密钥建议 128 位以上。',
          '切换到“密钥”模式，可以生成 hex、base64url 或 base62 格式的 API Key、会话密钥或 JWT 签名密钥。',
        ],
        faq: [
          {
            q: '生成的密码真的随机吗？',
            a: '是的。字符通过 `crypto.getRandomValues()` 加拒绝采样选取，每个字符出现的概率相同，也不会在服务器上生成或记录。',
          },
          {
            q: '密钥应该多长？',
            a: 'HMAC、JWT 签名密钥和会话密钥通常使用 32 个随机字节（256 位）。密钥应存放在环境变量或密钥管理服务中，不要写进源代码。',
          },
        ],
      },
    },
  },
  {
    slug: 'qr-code-generator',
    category: 'generate',
    glyph: 'QR',
    related: ['url-encoder', 'password-generator', 'base64'],
    text: {
      en: {
        name: 'QR Code Generator',
        title: 'QR Code Generator – Free, No Sign-up, Download PNG or SVG',
        description:
          'Create QR codes for URLs, text, Wi-Fi networks and contact details. Choose size, colors and error correction, then download a PNG or a crisp SVG. Generated locally; codes never expire.',
        keywords: ['qr code generator', 'qr code', 'wifi qr code', 'svg qr code', 'free qr code', 'vcard qr', 'url to qr'],
        howto: [
          'Pick a type — URL / text, Wi-Fi or contact card — and fill in the fields.',
          'Adjust the size, colors and error-correction level. Higher levels survive damage or a logo overlay but make the code denser.',
          'Download a PNG for screens and documents, or an SVG for print.',
        ],
        faq: [
          {
            q: 'Do these QR codes expire?',
            a: 'No. They are static codes that contain your data directly, with no redirect service in between, so they work forever and nothing is tracked.',
          },
          {
            q: 'How does the Wi-Fi QR code work?',
            a: 'It encodes `WIFI:T:WPA;S:network;P:password;;`. Most phone cameras recognise it and offer to join the network.',
          },
        ],
      },
      zh: {
        name: '二维码生成器',
        title: '二维码生成器：免费、无需注册，可下载 PNG / SVG',
        description: '为网址、文本、Wi-Fi 和联系人名片生成二维码，可调整尺寸、颜色和容错级别，下载 PNG 或清晰的 SVG。本地生成，永久有效。',
        keywords: ['二维码生成', '二维码', 'wifi二维码', 'svg二维码', '免费二维码', '名片二维码', '网址转二维码'],
        howto: [
          '选择类型：网址 / 文本、Wi-Fi 或联系人名片，然后填写内容。',
          '调整尺寸、颜色和容错级别。级别越高，二维码被遮挡或加 logo 后越容易识别，但图案也越密。',
          '下载 PNG 用于屏幕和文档，或下载 SVG 用于印刷。',
        ],
        faq: [
          {
            q: '生成的二维码会过期吗？',
            a: '不会。这是静态二维码，内容直接编码在图案里，中间没有跳转服务，永久有效，也不会被追踪。',
          },
          {
            q: 'Wi-Fi 二维码是怎么工作的？',
            a: '它编码的内容是 `WIFI:T:WPA;S:网络名;P:密码;;`，大多数手机相机都能识别，并提示一键连接。',
          },
        ],
      },
    },
  },
  {
    slug: 'number-base-converter',
    category: 'encode',
    glyph: '0x',
    related: ['color-converter', 'hash-generator', 'text-escape'],
    text: {
      en: {
        name: 'Number Base Converter',
        title: 'Number Base Converter – Binary, Octal, Decimal, Hex (Big Integers)',
        description:
          'Convert numbers between binary, octal, decimal, hexadecimal and any base from 2 to 36 — with arbitrary precision, digit grouping and two’s-complement view.',
        keywords: ['base converter', 'binary to decimal', 'hex to decimal', 'decimal to binary', 'hex converter', 'octal', 'radix', 'two’s complement', 'bigint'],
        howto: [
          'Type into any field — binary, octal, decimal, hex or a custom base — and the others update.',
          'Prefixes like `0x`, `0b` and `0o` and separators like `_` and spaces are accepted.',
          'Numbers of any size are supported. The two’s-complement view shows how negative numbers are stored in 8, 16, 32 or 64 bits.',
        ],
        faq: [
          {
            q: 'Is there a size limit?',
            a: 'No practical limit — conversion uses JavaScript BigInt, so 64-bit IDs, hashes and very large numbers convert exactly, with no floating-point rounding.',
          },
          {
            q: 'What is two’s complement?',
            a: 'The standard way computers store signed integers: a negative number −n is stored as 2^bits − n. For example, −1 in 8 bits is `11111111`.',
          },
        ],
      },
      zh: {
        name: '进制转换',
        title: '进制转换器：二进制、八进制、十进制、十六进制（支持大整数）',
        description: '在二进制、八进制、十进制、十六进制以及 2–36 任意进制之间转换数字，支持任意精度、数字分组和补码显示。',
        keywords: ['进制转换', '二进制转十进制', '十六进制转十进制', '十进制转二进制', 'hex', '八进制', '补码', '大整数'],
        howto: [
          '在任意一个输入框中输入（二进制、八进制、十进制、十六进制或自定义进制），其他进制会同步更新。',
          '支持 `0x`、`0b`、`0o` 前缀，以及 `_`、空格等分隔符。',
          '数字大小不限。补码视图会显示负数在 8、16、32、64 位中的存储形式。',
        ],
        faq: [
          {
            q: '数字大小有限制吗？',
            a: '实际上没有限制。转换使用 JavaScript BigInt，64 位 ID、哈希值和超大数字都能精确转换，不会有浮点误差。',
          },
          {
            q: '什么是补码？',
            a: '计算机存储有符号整数的标准方式：负数 −n 存储为 2^位数 − n。例如 −1 在 8 位中是 `11111111`。',
          },
        ],
      },
    },
  },
  {
    slug: 'text-escape',
    category: 'encode',
    glyph: '\\u',
    related: ['url-encoder', 'base64', 'json-formatter'],
    text: {
      en: {
        name: 'HTML Entity & Unicode Escape',
        title: 'HTML Entity Encoder / Decoder & Unicode Escape Converter',
        description:
          'Encode and decode HTML entities, convert text to and from Unicode escapes (\\uXXXX, \\u{…}, Python, CSS), escape JSON strings, and inspect hidden characters such as zero-width spaces.',
        keywords: ['html entities', 'html encode', 'html decode', 'unicode escape', 'unicode unescape', '\\u', 'json escape', 'zero width space', 'invisible characters'],
        howto: [
          'Choose a mode: HTML entities, Unicode escapes or JSON string.',
          'Encode or decode — the result updates as you type. Use Swap to reverse the direction.',
          'The character inspector lists every code point and flags invisible characters like zero-width spaces and non-breaking spaces, which often break code copied from documents or AI chats.',
        ],
        faq: [
          {
            q: 'Why does my text contain invisible characters?',
            a: 'Copying from web pages, Word documents or chat apps can bring along zero-width spaces, non-breaking spaces or byte-order marks. They are invisible but break string comparisons, JSON parsing and code. The inspector shows them.',
          },
          {
            q: 'What is the difference between \\uXXXX and \\u{XXXXX}?',
            a: '`\\uXXXX` encodes one UTF-16 code unit, so emoji need two (a surrogate pair). `\\u{…}` (ES2015) takes a full code point, e.g. `\\u{1F600}`.',
          },
        ],
      },
      zh: {
        name: 'HTML 实体与 Unicode 转义',
        title: 'HTML 实体编码解码 / Unicode 转义互转工具',
        description: 'HTML 实体编码与解码，文本与 Unicode 转义（\\uXXXX、\\u{…}、Python、CSS）互转，JSON 字符串转义，并能检查零宽空格等隐藏字符。',
        keywords: ['html实体', 'html转义', 'unicode转义', 'unicode转中文', '中文转unicode', '\\u', 'json转义', '零宽字符', '隐藏字符'],
        howto: [
          '选择模式：HTML 实体、Unicode 转义或 JSON 字符串。',
          '选择编码或解码，结果会实时更新；点“交换”可以反向转换。',
          '字符检查器会列出每个码点，并标出零宽空格、不间断空格等不可见字符 —— 从文档或 AI 对话中复制的代码经常因为它们出错。',
        ],
        faq: [
          {
            q: '为什么我的文本里有看不见的字符？',
            a: '从网页、Word 文档或聊天软件复制内容时，可能会带上零宽空格、不间断空格或 BOM。它们看不见，却会导致字符串比较、JSON 解析和代码出错，字符检查器可以把它们找出来。',
          },
          {
            q: '\\uXXXX 和 \\u{XXXXX} 有什么区别？',
            a: '`\\uXXXX` 表示一个 UTF-16 码元，emoji 需要两个（代理对）；`\\u{…}`（ES2015）直接表示完整码点，例如 `\\u{1F600}`。',
          },
        ],
      },
    },
  },
];
