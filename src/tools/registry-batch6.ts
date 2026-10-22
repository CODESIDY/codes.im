import type { Tool } from './registry';

/** Sixth batch: high-volume utilities and an LLM API playground. */
export const batch6: Tool[] = [
  {
    slug: 'word-counter',
    category: 'text',
    glyph: '字',
    related: ['token-counter', 'case-converter', 'markdown-cleaner'],
    text: {
      en: {
        name: 'Word Counter',
        title: 'Word Counter – Count Words, Characters, Chinese Characters & Reading Time',
        description:
          'Count words, characters (with and without spaces), Chinese/Japanese/Korean characters, sentences, paragraphs, reading time and LLM tokens as you type. Handles mixed-language text correctly.',
        keywords: ['word counter', 'character counter', 'word count', 'letter count', 'chinese character count', 'reading time', 'count characters online'],
        howto: [
          'Paste or type your text. Every count updates instantly.',
          '“Word count” follows Microsoft Word’s convention for mixed text: each CJK character counts as one, and each run of other letters counts as one word.',
          'Check the length bars to see whether the text fits common limits such as a post on X or a meta description.',
          'Top words show which terms you repeat most — handy for spotting overused words or checking keyword focus.',
        ],
        faq: [
          {
            q: 'Why is the word count different from the character count?',
            a: 'Characters are every visible symbol (an emoji with a skin tone counts as one). Words are runs of letters and digits. For Chinese and Japanese, which have no spaces, each character is counted as one word — the same rule word processors use.',
          },
          {
            q: 'How is reading time calculated?',
            a: 'About 230 words per minute for English and 400 characters per minute for Chinese, which are typical silent-reading speeds. Speaking time uses 150 words or 240 characters per minute.',
          },
          {
            q: 'Is my text uploaded?',
            a: 'No. Counting happens in your browser, so it is safe for drafts, contracts and other private documents.',
          },
        ],
      },
      zh: {
        name: '字数统计',
        title: '在线字数统计：中英文字数、字符数、阅读时长一键统计',
        description: '实时统计字数、字符数（含 / 不含空格）、中文字符、英文单词、句子、段落、阅读时长和大模型 Token 数，中英文混排也能准确统计。',
        keywords: ['字数统计', '在线字数统计', '字符统计', '中文字数', '统计字数', '字数计算器', '阅读时长', '英文单词统计'],
        howto: [
          '粘贴或输入文字，所有统计实时更新。',
          '“字数”与 Word / WPS 的统计方式一致：每个中文字符算 1 个字，每个英文单词算 1 个字。',
          '查看“常见字数限制”的进度条，判断是否超出小红书、公众号摘要、SEO 标题等长度限制。',
          '“高频词”列出重复最多的词，方便检查用词是否单调或关键词是否突出。',
        ],
        faq: [
          {
            q: '“字数”和“字符数”有什么区别？',
            a: '字符数是所有可见字符（包括标点和空格，带肤色的 emoji 算 1 个）。字数按中文字符 + 英文单词计算，和 Word、WPS 的“字数”一致，也是大多数投稿和作业要求的口径。',
          },
          {
            q: '阅读时长是怎么算的？',
            a: '中文按每分钟约 400 字、英文按每分钟约 230 词估算，是常见的默读速度；朗读时长按每分钟 240 字或 150 词估算。',
          },
          {
            q: '文字会被上传吗？',
            a: '不会。统计在浏览器本地完成，论文、合同等私密内容也可以放心粘贴。',
          },
        ],
      },
    },
  },
  {
    slug: 'cidr-calculator',
    category: 'generate',
    glyph: '/24',
    related: ['number-base-converter', 'chmod-calculator', 'user-agent-parser'],
    text: {
      en: {
        name: 'IP Subnet (CIDR) Calculator',
        title: 'IP Subnet Calculator – CIDR, Netmask, Network & Broadcast Address',
        description:
          'Calculate network and broadcast addresses, usable host range, subnet mask and wildcard for any IPv4 CIDR block. Check whether an IP is in a subnet, split networks and convert IP ranges to CIDR.',
        keywords: ['subnet calculator', 'cidr calculator', 'ip calculator', 'netmask', 'subnet mask', 'wildcard mask', 'ip range to cidr', 'ipv4 subnet'],
        howto: [
          'Enter an address with a prefix (`192.168.1.10/24`) or a mask (`10.0.0.1 255.255.0.0`). You can also pick the prefix from the menu.',
          'Read the network, broadcast, first and last usable host, mask and wildcard — each can be copied.',
          'Type another IP in “Is this IP in the subnet?” to check membership, or split the block into smaller subnets.',
          'Use “IP range → CIDR” to get the minimal list of CIDR blocks covering a start–end range, e.g. for firewall rules.',
        ],
        faq: [
          {
            q: 'Why are there 2 fewer usable hosts than addresses?',
            a: 'In a normal subnet the first address identifies the network and the last is the broadcast address, so neither can be assigned to a host. /31 (point-to-point links, RFC 3021) and /32 (a single host) are exceptions.',
          },
          {
            q: 'What is a wildcard mask?',
            a: 'The inverse of the subnet mask (for /24, `0.0.0.255`). Cisco ACLs and OSPF configuration use it to describe which bits may vary.',
          },
          {
            q: 'Which ranges are private?',
            a: '`10.0.0.0/8`, `172.16.0.0/12` and `192.168.0.0/16` (RFC 1918). `100.64.0.0/10` is carrier-grade NAT, `127.0.0.0/8` is loopback and `169.254.0.0/16` is link-local — the calculator labels each of these.',
          },
        ],
      },
      zh: {
        name: 'IP 子网（CIDR）计算器',
        title: 'IP 子网计算器：CIDR、子网掩码、网络地址与广播地址',
        description: '计算任意 IPv4 CIDR 网段的网络地址、广播地址、可用主机范围、子网掩码和反掩码；判断 IP 是否在网段内，划分子网，以及把 IP 范围转换为 CIDR。',
        keywords: ['子网计算器', 'cidr计算', 'ip计算器', '子网掩码计算', '网段计算', '反掩码', 'ip范围转cidr', '子网划分'],
        howto: [
          '输入带前缀的地址（`192.168.1.10/24`）或带掩码的地址（`10.0.0.1 255.255.0.0`），也可以从下拉菜单选择前缀长度。',
          '查看网络地址、广播地址、第一个和最后一个可用地址、掩码和反掩码，都可以一键复制。',
          '在“某个 IP 是否在这个网段内”中输入地址检查归属，或把网段划分成更小的子网。',
          '用“IP 范围 → CIDR”把起止地址转换成最少的 CIDR 网段列表，适合配置防火墙规则。',
        ],
        faq: [
          {
            q: '为什么可用主机数比地址总数少 2？',
            a: '普通子网中第一个地址是网络地址，最后一个是广播地址，都不能分配给主机。/31（点对点链路，RFC 3021）和 /32（单个主机）是例外。',
          },
          {
            q: '什么是反掩码（通配符掩码）？',
            a: '子网掩码按位取反的结果（/24 对应 `0.0.0.255`），Cisco ACL 和 OSPF 配置里用它表示哪些位可以变化。',
          },
          {
            q: '哪些是私有地址？',
            a: '`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`（RFC 1918）。另外 `100.64.0.0/10` 是运营商级 NAT，`127.0.0.0/8` 是回环地址，`169.254.0.0/16` 是链路本地地址，计算器会标出地址类型。',
          },
        ],
      },
    },
  },
  {
    slug: 'user-agent-parser',
    category: 'generate',
    glyph: 'UA',
    related: ['cidr-calculator', 'curl-converter', 'llms-txt-generator'],
    text: {
      en: {
        name: 'User-Agent Parser',
        title: 'User-Agent Parser – Detect Browser, OS, Device & AI Crawlers',
        description:
          'Parse any User-Agent string into browser, rendering engine, operating system and device type. Identifies search engines and AI crawlers such as GPTBot, ClaudeBot and PerplexityBot, and generates a robots.txt to block them.',
        keywords: ['user agent parser', 'user agent', 'ua parser', 'what is my user agent', 'detect browser', 'gptbot', 'claudebot', 'ai crawler', 'robots.txt'],
        howto: [
          'Your own browser’s User-Agent is filled in automatically. Paste any other string, or click an example.',
          'Browser, engine, OS and device type are detected instantly. Bots are labelled with their owner and kind — AI crawler, search engine, link preview or HTTP client.',
          'Copy the ready-made robots.txt rules if you want to opt your site out of AI training crawlers.',
        ],
        faq: [
          {
            q: 'Can I trust the User-Agent?',
            a: 'Not for security. Any client can send any string. Use it for analytics and compatibility, and verify important bots (for example Googlebot) with a reverse DNS lookup.',
          },
          {
            q: 'What are User-Agent Client Hints?',
            a: 'Chromium browsers are reducing the detail in the User-Agent string and expose structured “Client Hints” instead (platform version, device model, full browser versions). The tool shows them for your browser when available.',
          },
          {
            q: 'Does blocking AI crawlers in robots.txt work?',
            a: 'The major AI companies publish crawler names and say they respect robots.txt. It is a request rather than enforcement, so misbehaving scrapers can ignore it.',
          },
        ],
      },
      zh: {
        name: 'User-Agent 解析',
        title: 'User-Agent 在线解析：识别浏览器、系统、设备和 AI 爬虫',
        description: '把任意 User-Agent 字符串解析成浏览器、渲染引擎、操作系统和设备类型，识别搜索引擎和 GPTBot、ClaudeBot、PerplexityBot 等 AI 爬虫，并生成屏蔽它们的 robots.txt。',
        keywords: ['user agent解析', 'ua解析', '查看user agent', '浏览器识别', 'gptbot', 'claudebot', 'ai爬虫', 'robots.txt', '微信ua'],
        howto: [
          '默认填入你当前浏览器的 User-Agent，也可以粘贴任意字符串或点击示例。',
          '实时识别浏览器、引擎、系统和设备类型；爬虫会标出所属公司和类型（AI 爬虫、搜索引擎、链接预览、HTTP 客户端）。',
          '如果不希望网站内容被 AI 训练爬虫抓取，可以复制现成的 robots.txt 规则。',
        ],
        faq: [
          {
            q: 'User-Agent 可信吗？',
            a: '不能用于安全判断，任何客户端都可以伪造。它适合做统计和兼容性处理；重要的爬虫（比如 Googlebot）应该用反向 DNS 验证。',
          },
          {
            q: '什么是 User-Agent Client Hints？',
            a: 'Chromium 系浏览器正在精简 User-Agent 字符串，改为通过结构化的 Client Hints 提供系统版本、设备型号、完整浏览器版本等信息。工具会在支持的浏览器中显示这些信息。',
          },
          {
            q: '用 robots.txt 屏蔽 AI 爬虫有用吗？',
            a: '主要 AI 公司都公开了爬虫名称，并声明会遵守 robots.txt。但这只是“请求”而不是强制，不守规矩的爬虫仍可能无视它。',
          },
        ],
      },
    },
  },
  {
    slug: 'fake-data-generator',
    category: 'generate',
    glyph: 'Abc',
    related: ['uuid-generator', 'csv-json', 'sql-formatter'],
    text: {
      en: {
        name: 'Fake Data & Lorem Ipsum Generator',
        title: 'Fake Data Generator – Mock JSON, CSV, SQL & Lorem Ipsum',
        description:
          'Generate realistic fake records — names, emails, phones, addresses, companies, dates, UUIDs — in English or Chinese, as JSON, JSONL, CSV or SQL INSERT. Also generates Lorem ipsum and Chinese placeholder text.',
        keywords: ['fake data generator', 'mock data', 'test data', 'lorem ipsum', 'dummy data', 'random name generator', 'sql insert generator', 'json mock'],
        howto: [
          'Choose “Fake records”, set the number of rows and an output format (JSON, JSONL, CSV or SQL).',
          'Edit the field list: rename keys and pick a type for each. Add or remove fields as needed.',
          'The same seed always produces the same data, so tests stay reproducible. Click “New seed” for a different batch.',
          'Switch to “Placeholder text” for Lorem ipsum or Chinese filler paragraphs.',
        ],
        faq: [
          {
            q: 'Is the data real?',
            a: 'No. Names and addresses are combined from fictional lists, emails use example domains reserved for documentation, and US phone numbers use the 555-01xx range reserved for fiction. Chinese mobile numbers are random and may coincide with real ones, so never use them to send messages.',
          },
          {
            q: 'Why use a seed?',
            a: 'A fixed seed makes the output deterministic: snapshot tests and demos get the same data every time, while changing the seed gives a fresh set.',
          },
        ],
      },
      zh: {
        name: '假数据生成器',
        title: '假数据生成器：一键生成测试用 JSON、CSV、SQL 和 Lorem ipsum',
        description: '生成中英文的姓名、邮箱、电话、地址、公司、日期、UUID 等测试数据，可输出 JSON、JSONL、CSV 或 SQL INSERT；也能生成 Lorem ipsum 和中文假文。',
        keywords: ['假数据生成', '测试数据生成', 'mock数据', '随机姓名生成', 'lorem ipsum', '中文假文', 'sql insert生成', '模拟数据'],
        howto: [
          '选择“假数据”，设置行数和输出格式（JSON、JSONL、CSV 或 SQL）。',
          '编辑字段列表：修改字段名并为每个字段选择类型，可以增删字段。',
          '相同的随机种子总是生成相同的数据，方便写可复现的测试；点击“换一批”可以生成新数据。',
          '切换到“占位文本”可以生成 Lorem ipsum 或中文假文段落。',
        ],
        faq: [
          {
            q: '生成的数据是真实的吗？',
            a: '不是。姓名和地址由虚构词表随机组合，邮箱使用专供示例的 example 域名，美国电话使用影视专用的 555-01xx 号段。中国手机号是随机生成的，可能与真实号码重合，切勿用来发短信或拨打。',
          },
          {
            q: '随机种子有什么用？',
            a: '固定种子时输出是确定的，快照测试和演示每次都能得到相同的数据；换一个种子就能得到一批新数据。',
          },
        ],
      },
    },
  },
  {
    slug: 'llm-api-playground',
    category: 'llm',
    glyph: 'API',
    related: ['llm-stream-parser', 'llm-cost-calculator', 'chat-format-converter'],
    text: {
      en: {
        name: 'LLM API Playground',
        title: 'LLM API Playground – Test OpenAI-Compatible & Claude APIs in Your Browser',
        description:
          'Send requests to OpenAI, Anthropic, DeepSeek, OpenRouter, Ollama or any OpenAI-compatible API with your own key. Watch streaming output, time to first token, usage, tool calls and structured output — and copy the request as curl.',
        keywords: ['llm playground', 'openai api tester', 'claude api test', 'api playground', 'openai compatible', 'deepseek api', 'ollama', 'function calling test', 'structured outputs'],
        howto: [
          'Pick a provider (or “Custom” for any OpenAI-compatible endpoint), check the base URL and model, and paste your API key.',
          'Write a system prompt and a user message, then press Send (⌘/Ctrl + Enter).',
          'Watch the reply stream in, with status, time to first token, total time, finish reason and token usage below.',
          'Open “Tools & structured output” to test function calling or a JSON Schema response. Switch to “Raw” to see the exact SSE events, or “curl” to copy the request (with the key masked).',
        ],
        faq: [
          {
            q: 'Where does my API key go?',
            a: 'Only to the provider you selected — the request is made directly by your browser. codes.im has no server that sees it. The key is kept in memory and, only if you tick “Remember in this tab”, in session storage, which is cleared when the tab closes.',
          },
          {
            q: 'Why does the request fail with a network error?',
            a: 'Usually CORS: the provider has to allow requests from a web page. Anthropic does when a special header is sent, which the tool adds automatically. If a provider or self-hosted gateway rejects browser requests, use the copied curl command instead. For a local Ollama, start it with `OLLAMA_ORIGINS` set to allow this site.',
          },
          {
            q: 'How do tools and structured output map between providers?',
            a: 'Paste tool definitions in either OpenAI or Anthropic format — they are converted automatically. A JSON Schema becomes `response_format` for OpenAI-compatible APIs and a forced `respond` tool for Claude.',
          },
        ],
      },
      zh: {
        name: 'LLM API 调试台',
        title: '大模型 API 在线调试：在浏览器里测试 OpenAI 兼容接口和 Claude API',
        description: '用你自己的 Key 向 OpenAI、Anthropic、DeepSeek、OpenRouter、Ollama 或任意 OpenAI 兼容接口发请求，查看流式输出、首 Token 耗时、用量、工具调用和结构化输出，并一键复制为 curl。',
        keywords: ['大模型api调试', 'openai接口测试', 'claude api测试', 'deepseek api', 'api调试', 'openai兼容', 'ollama', '函数调用测试', '结构化输出'],
        howto: [
          '选择服务商（任意 OpenAI 兼容接口选“Custom”），确认 Base URL 和模型，填入 API Key。',
          '写好系统提示词和用户消息，点击“发送”（⌘/Ctrl + 回车）。',
          '回复会以流式输出显示，下方展示状态码、首 Token 耗时、总耗时、结束原因和 Token 用量。',
          '展开“工具调用与结构化输出”可以测试函数调用或 JSON Schema 输出；切到“原始响应”查看完整的 SSE 事件，切到“curl”复制请求（Key 已隐藏）。',
        ],
        faq: [
          {
            q: '我的 API Key 会发到哪里？',
            a: '只会发给你选择的服务商，请求由你的浏览器直接发出，codes.im 没有任何能看到它的服务器。Key 只保存在页面内存里；只有勾选“在本标签页内记住”时才会存入 sessionStorage，关闭标签页即清除。',
          },
          {
            q: '为什么请求报网络错误？',
            a: '通常是跨域（CORS）限制：服务商需要允许网页直接调用。Anthropic 在带上特殊请求头时允许，工具会自动加上。如果某个服务商或自建网关拒绝浏览器请求，可以改用复制出的 curl 命令。本地 Ollama 需要设置 `OLLAMA_ORIGINS` 允许本站访问。',
          },
          {
            q: '工具调用和结构化输出在不同服务商之间怎么对应？',
            a: '工具定义可以粘贴 OpenAI 或 Anthropic 格式，会自动转换。填写 JSON Schema 后，OpenAI 兼容接口使用 `response_format`，Claude 则通过强制调用一个名为 `respond` 的工具实现。',
          },
        ],
      },
    },
  },
];
