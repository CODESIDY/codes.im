import type { Lang } from '../i18n/ui';
import { batch2 } from './registry-batch2';
import { batch3 } from './registry-batch3';
import { batch4 } from './registry-batch4';
import { batch5 } from './registry-batch5';
import { batch6 } from './registry-batch6';

export type Category = 'ai' | 'llm' | 'format' | 'encode' | 'image' | 'generate' | 'text' | 'time';

export interface ToolText {
  /** Short name shown in cards and nav. */
  name: string;
  /** SEO <title> (without the site suffix). */
  title: string;
  /** One-sentence description, also used as meta description. */
  description: string;
  /** Extra search keywords. */
  keywords: string[];
  /** Ordered "how to use" steps. */
  howto: string[];
  faq: { q: string; a: string }[];
}

export interface Tool {
  slug: string;
  category: Category;
  /** Short glyph rendered in a monospace badge. */
  glyph: string;
  related: string[];
  text: Record<Lang, ToolText>;
}

export const categories: Category[] = ['ai', 'llm', 'format', 'encode', 'image', 'text', 'generate', 'time'];

const batch1: Tool[] = [
  {
    slug: 'json-formatter',
    category: 'format',
    glyph: '{ }',
    related: ['json-to-typescript', 'json-schema-generator', 'jwt-decoder'],
    text: {
      en: {
        name: 'JSON Formatter',
        title: 'JSON Formatter & Validator – Beautify, Minify, Sort Keys',
        description:
          'Format, validate and minify JSON instantly. Pinpoints syntax errors by line and column, sorts keys, and runs entirely in your browser.',
        keywords: ['json', 'beautify', 'prettify', 'minify', 'validate', 'lint', 'pretty print'],
        howto: [
          'Paste or type JSON into the input box. It is validated as you type.',
          'Choose an indent (2 spaces, 4 spaces or tab) and click Format — or click Minify to strip all whitespace.',
          'Enable "Sort keys" to order object keys alphabetically, which makes diffs easier to read.',
          'If the JSON is invalid, the error message shows the exact line and column so you can fix it quickly.',
        ],
        faq: [
          {
            q: 'Is my JSON sent to a server?',
            a: 'No. Parsing and formatting use the browser’s built-in JSON engine. Nothing is uploaded, so it is safe for API responses containing tokens or personal data.',
          },
          {
            q: 'Why does my JSON fail with “Unexpected token”?',
            a: 'Common causes are trailing commas, single-quoted strings, unquoted keys and comments. Strict JSON allows none of these — remove them and try again.',
          },
          {
            q: 'How large a file can it handle?',
            a: 'Several megabytes are fine on most machines. Because everything runs locally, the limit is your device’s memory rather than an upload cap.',
          },
        ],
      },
      zh: {
        name: 'JSON 格式化',
        title: 'JSON 格式化 / 校验 / 压缩 在线工具',
        description: '在线 JSON 格式化、校验与压缩，精确定位语法错误的行列号，支持按键排序，全部在浏览器本地完成。',
        keywords: ['json', '格式化', '美化', '压缩', '校验', '在线', 'json解析'],
        howto: [
          '把 JSON 粘贴到输入框，输入时会自动校验。',
          '选择缩进（2 空格、4 空格或 Tab）后点击“格式化”；点击“压缩”可去掉所有空白。',
          '勾选“键排序”可按字母顺序排列对象的键，方便对比差异。',
          '如果 JSON 不合法，错误提示会给出具体的行号和列号，方便快速修复。',
        ],
        faq: [
          {
            q: '我的 JSON 会被上传到服务器吗？',
            a: '不会。解析和格式化都使用浏览器内置的 JSON 引擎完成，不发送任何网络请求，可以放心处理包含 token 或个人信息的接口返回。',
          },
          {
            q: '为什么提示 “Unexpected token”？',
            a: '常见原因是末尾多余的逗号、单引号字符串、键名没加引号或包含注释。标准 JSON 不允许这些写法，去掉后再试。',
          },
          {
            q: '能处理多大的文件？',
            a: '几 MB 的数据在大多数电脑上都没问题。因为是本地处理，上限取决于设备内存，而不是上传限制。',
          },
        ],
      },
    },
  },
  {
    slug: 'json-to-typescript',
    category: 'format',
    glyph: 'TS',
    related: ['json-to-zod', 'json-schema-generator', 'json-formatter'],
    text: {
      en: {
        name: 'JSON to TypeScript',
        title: 'JSON to TypeScript Interface Generator',
        description:
          'Convert JSON into TypeScript interfaces or type aliases. Infers nested objects, arrays, optional fields and union types — locally in your browser.',
        keywords: ['json', 'typescript', 'ts', 'interface', 'type', 'generator', 'json2ts', 'quicktype'],
        howto: [
          'Paste a JSON sample (for example an API response) into the left panel.',
          'Set the root type name and choose between `interface` and `type` declarations.',
          'The TypeScript definitions update instantly. Nested objects become their own named types.',
          'When an array contains objects with different keys, missing keys are marked optional (`?`).',
        ],
        faq: [
          {
            q: 'How are arrays of mixed types handled?',
            a: 'Element types are merged: objects are combined into one type with optional fields for keys that are not always present, and different primitives become a union such as `(string | number)[]`.',
          },
          {
            q: 'What happens with null values?',
            a: 'A field that is always null is typed as `null`. If it is null in some samples and has a value in others, it becomes a union like `string | null`.',
          },
          {
            q: 'Are invalid identifiers supported as keys?',
            a: 'Yes. Keys such as `first-name` or `2fa` are quoted automatically so the output always compiles.',
          },
        ],
      },
      zh: {
        name: 'JSON 转 TypeScript',
        title: 'JSON 转 TypeScript 类型定义（Interface 生成器）',
        description: '把 JSON 转成 TypeScript interface 或 type，自动推断嵌套对象、数组、可选字段和联合类型，全部在本地完成。',
        keywords: ['json', 'typescript', 'ts', 'interface', '类型', '生成', 'json转ts'],
        howto: [
          '把一段 JSON 样例（比如接口返回值）粘贴到左侧。',
          '设置根类型名，并选择生成 `interface` 还是 `type`。',
          '右侧会实时生成 TypeScript 定义，嵌套对象会拆成独立的命名类型。',
          '数组里的对象如果键不一致，缺失的键会被标记为可选（`?`）。',
        ],
        faq: [
          {
            q: '数组里类型不一致怎么处理？',
            a: '会合并元素类型：多个对象会合成一个类型，不总是出现的键标为可选；不同的基础类型会变成联合类型，比如 `(string | number)[]`。',
          },
          {
            q: 'null 值怎么处理？',
            a: '始终为 null 的字段类型是 `null`；有时为 null、有时有值的字段会生成 `string | null` 这样的联合类型。',
          },
          {
            q: '键名不是合法标识符怎么办？',
            a: '像 `first-name`、`2fa` 这样的键会自动加引号，保证生成的代码可以直接编译。',
          },
        ],
      },
    },
  },
  {
    slug: 'base64',
    category: 'encode',
    glyph: 'B64',
    related: ['url-encoder', 'hash-generator', 'jwt-decoder'],
    text: {
      en: {
        name: 'Base64 Encode / Decode',
        title: 'Base64 Encode & Decode Online (UTF-8, URL-safe)',
        description:
          'Encode text to Base64 or decode Base64 back to text. Full UTF-8 support (emoji, Chinese), URL-safe variant, and file to Base64 conversion.',
        keywords: ['base64', 'encode', 'decode', 'base64url', 'atob', 'btoa', 'data uri'],
        howto: [
          'Choose Encode or Decode.',
          'Type or paste your text. The result updates as you type.',
          'Enable “URL-safe” to use `-` and `_` instead of `+` and `/` and drop the `=` padding (Base64URL, as used in JWTs).',
          'Use “File → Base64” to turn an image or any file into a Base64 data URI.',
        ],
        faq: [
          {
            q: 'Why does btoa() fail with non-English text?',
            a: 'The browser’s `btoa()` only accepts Latin-1 characters. This tool first encodes text as UTF-8 bytes, so emoji and CJK characters work correctly.',
          },
          {
            q: 'Is Base64 encryption?',
            a: 'No. Base64 is an encoding, not encryption — anyone can decode it. Never use it to protect secrets.',
          },
          {
            q: 'Why is Base64 output larger than the input?',
            a: 'Base64 represents every 3 bytes with 4 ASCII characters, so output is about 33% larger.',
          },
        ],
      },
      zh: {
        name: 'Base64 编解码',
        title: 'Base64 在线编码解码（支持中文、URL Safe）',
        description: '文本与 Base64 互转，完整支持 UTF-8（中文、emoji）、URL Safe 变体，以及文件转 Base64。',
        keywords: ['base64', '编码', '解码', 'base64url', '在线', '图片转base64'],
        howto: [
          '选择“编码”或“解码”。',
          '输入或粘贴文本，结果会实时更新。',
          '勾选“URL Safe”会用 `-` 和 `_` 代替 `+` 和 `/`，并去掉末尾的 `=`（即 Base64URL，JWT 使用的就是这种）。',
          '使用“文件 → Base64”可以把图片或任意文件转成 Base64 Data URI。',
        ],
        faq: [
          {
            q: '为什么浏览器的 btoa() 处理中文会报错？',
            a: '`btoa()` 只接受 Latin-1 字符。本工具会先把文本编码成 UTF-8 字节，所以中文和 emoji 都能正确处理。',
          },
          {
            q: 'Base64 是加密吗？',
            a: '不是。Base64 只是一种编码方式，任何人都能解码，不能用来保护敏感信息。',
          },
          {
            q: '为什么编码后变长了？',
            a: 'Base64 用 4 个字符表示 3 个字节，所以结果大约比原文大 33%。',
          },
        ],
      },
    },
  },
  {
    slug: 'url-encoder',
    category: 'encode',
    glyph: '%20',
    related: ['base64', 'json-formatter', 'regex-tester'],
    text: {
      en: {
        name: 'URL Encode / Decode',
        title: 'URL Encode & Decode Online + Query String Parser',
        description:
          'Percent-encode or decode URLs and query parameters, and break any URL into its parts and query string — in your browser.',
        keywords: ['url', 'encode', 'decode', 'percent encoding', 'urlencode', 'query string', 'encodeURIComponent'],
        howto: [
          'Paste text or a URL and choose Encode or Decode.',
          '“Component” mode (encodeURIComponent) escapes everything except letters, digits and `-_.!~*\'()` — use it for individual query values.',
          '“Full URL” mode (encodeURI) keeps URL structure characters like `/ ? & =` intact.',
          'The URL parser below shows the protocol, host, path, hash and every query parameter in a table.',
        ],
        faq: [
          {
            q: 'What is the difference between encodeURI and encodeURIComponent?',
            a: '`encodeURI` is meant for a whole URL and leaves reserved characters such as `/`, `?` and `&` alone. `encodeURIComponent` encodes those too, which is what you want for a single parameter value.',
          },
          {
            q: 'Why does a space become %20 here but + elsewhere?',
            a: '`%20` is the standard percent encoding. `+` for spaces comes from HTML form encoding (application/x-www-form-urlencoded). Enable “Space as +” if you need that format.',
          },
        ],
      },
      zh: {
        name: 'URL 编解码',
        title: 'URL 在线编码解码 + 查询参数解析',
        description: '对 URL 或参数进行百分号编码/解码，并把任意 URL 拆解成各个部分和查询参数表格。',
        keywords: ['url', '编码', '解码', 'urlencode', 'urldecode', '参数解析', 'encodeURIComponent'],
        howto: [
          '粘贴文本或 URL，选择“编码”或“解码”。',
          '“组件”模式（encodeURIComponent）会转义字母、数字和 `-_.!~*\'()` 以外的所有字符，适合编码单个参数值。',
          '“完整 URL”模式（encodeURI）会保留 `/ ? & =` 等 URL 结构字符。',
          '下方的 URL 解析器会列出协议、主机、路径、hash 以及每个查询参数。',
        ],
        faq: [
          {
            q: 'encodeURI 和 encodeURIComponent 有什么区别？',
            a: '`encodeURI` 用于完整的 URL，不会转义 `/`、`?`、`&` 等保留字符；`encodeURIComponent` 会把它们也转义，适合编码单个参数值。',
          },
          {
            q: '为什么空格在这里是 %20，别处是 +？',
            a: '`%20` 是标准的百分号编码；用 `+` 表示空格来自 HTML 表单编码（application/x-www-form-urlencoded）。需要这种格式时勾选“空格转 +”即可。',
          },
        ],
      },
    },
  },
  {
    slug: 'timestamp',
    category: 'time',
    glyph: 'UTC',
    related: ['cron-parser', 'jwt-decoder', 'uuid-generator'],
    text: {
      en: {
        name: 'Unix Timestamp Converter',
        title: 'Unix Timestamp Converter – Epoch to Date & Back',
        description:
          'Convert Unix timestamps (seconds or milliseconds) to human-readable dates in local time, UTC and ISO 8601, and convert dates back to timestamps.',
        keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'converter', 'iso 8601', 'utc'],
        howto: [
          'The current Unix time is shown live at the top — click it to copy.',
          'Paste a timestamp; seconds, milliseconds, microseconds and nanoseconds are detected automatically by length.',
          'Read the result in your local time zone, UTC, ISO 8601 and as a relative time (“3 days ago”).',
          'To go the other way, pick a date and time and get the timestamp in seconds and milliseconds.',
        ],
        faq: [
          {
            q: 'What is a Unix timestamp?',
            a: 'The number of seconds elapsed since 1970-01-01 00:00:00 UTC (the Unix epoch), not counting leap seconds. JavaScript’s `Date.now()` returns milliseconds instead.',
          },
          {
            q: 'How do I tell seconds from milliseconds?',
            a: 'Current timestamps in seconds have 10 digits; in milliseconds they have 13. The converter uses this rule to detect the unit automatically.',
          },
          {
            q: 'What is the Year 2038 problem?',
            a: 'Systems storing timestamps as signed 32-bit integers overflow on 2038-01-19 03:14:07 UTC. Modern 64-bit systems are not affected.',
          },
        ],
      },
      zh: {
        name: '时间戳转换',
        title: 'Unix 时间戳转换工具（秒 / 毫秒 ⇄ 日期）',
        description: 'Unix 时间戳（秒或毫秒）与日期互转，同时显示本地时间、UTC、ISO 8601 和相对时间。',
        keywords: ['时间戳', 'unix', '转换', '日期', '毫秒', 'epoch', '在线'],
        howto: [
          '顶部实时显示当前 Unix 时间，点击即可复制。',
          '粘贴时间戳，会根据位数自动识别秒、毫秒、微秒或纳秒。',
          '结果会显示为本地时区时间、UTC、ISO 8601，以及“3 天前”这样的相对时间。',
          '反向转换时，选择日期和时间即可得到秒级和毫秒级时间戳。',
        ],
        faq: [
          {
            q: '什么是 Unix 时间戳？',
            a: '从 1970-01-01 00:00:00 UTC（Unix 纪元）开始经过的秒数，不计闰秒。JavaScript 的 `Date.now()` 返回的是毫秒。',
          },
          {
            q: '怎么区分秒和毫秒？',
            a: '当前的秒级时间戳是 10 位数，毫秒级是 13 位数，本工具就是按位数自动识别单位的。',
          },
          {
            q: '什么是 2038 年问题？',
            a: '用 32 位有符号整数存储时间戳的系统会在 2038-01-19 03:14:07 UTC 溢出，现代 64 位系统不受影响。',
          },
        ],
      },
    },
  },
  {
    slug: 'jwt-decoder',
    category: 'encode',
    glyph: 'JWT',
    related: ['base64', 'timestamp', 'json-formatter'],
    text: {
      en: {
        name: 'JWT Decoder',
        title: 'JWT Decoder – Inspect JSON Web Token Header & Payload',
        description:
          'Decode a JSON Web Token to see its header, payload and claims. Shows expiry status and readable dates for exp, iat and nbf. Tokens never leave your browser.',
        keywords: ['jwt', 'json web token', 'decode', 'decoder', 'bearer', 'token', 'claims', 'jwt.io'],
        howto: [
          'Paste a JWT (the `xxxxx.yyyyy.zzzzz` string, with or without the “Bearer ” prefix).',
          'The header and payload are decoded from Base64URL and pretty-printed as JSON.',
          'Standard time claims (`exp`, `iat`, `nbf`) are converted to readable dates and the token is marked valid or expired.',
        ],
        faq: [
          {
            q: 'Is it safe to paste a production token here?',
            a: 'Decoding happens entirely in your browser with no network requests, so the token is not sent anywhere. Still, treat live tokens as secrets and rotate them if they leak.',
          },
          {
            q: 'Does this verify the signature?',
            a: 'No. Decoding only reads the header and payload. Verifying the signature requires the secret or public key, and should be done on your server.',
          },
        ],
      },
      zh: {
        name: 'JWT 解析',
        title: 'JWT 在线解析（JSON Web Token Header / Payload 解码）',
        description: '解析 JWT，查看 header、payload 和 claims，自动显示过期状态以及 exp、iat、nbf 的可读时间。Token 不会离开你的浏览器。',
        keywords: ['jwt', '解析', '解码', 'token', 'json web token', '在线'],
        howto: [
          '粘贴 JWT（形如 `xxxxx.yyyyy.zzzzz` 的字符串，带不带 “Bearer ” 前缀都可以）。',
          'header 和 payload 会从 Base64URL 解码并格式化成 JSON。',
          '标准时间字段（`exp`、`iat`、`nbf`）会转成可读日期，并标注 token 是否已过期。',
        ],
        faq: [
          {
            q: '把生产环境的 token 粘贴到这里安全吗？',
            a: '解码完全在浏览器本地进行，不发任何网络请求，token 不会被发送到任何地方。不过线上 token 仍属于敏感信息，一旦泄露应及时轮换。',
          },
          {
            q: '会校验签名吗？',
            a: '不会。解码只读取 header 和 payload，校验签名需要密钥或公钥，应该在服务端完成。',
          },
        ],
      },
    },
  },
  {
    slug: 'regex-tester',
    category: 'text',
    glyph: '.*',
    related: ['url-encoder', 'json-formatter', 'hash-generator'],
    text: {
      en: {
        name: 'Regex Tester',
        title: 'Regex Tester – Test JavaScript Regular Expressions Online',
        description:
          'Test JavaScript regular expressions with live match highlighting, capture groups, named groups and replace preview.',
        keywords: ['regex', 'regexp', 'regular expression', 'tester', 'match', 'replace', 'javascript'],
        howto: [
          'Type a pattern without the surrounding slashes, e.g. `\\d{3}-\\d{4}`.',
          'Toggle flags: `g` global, `i` ignore case, `m` multiline, `s` dotAll, `u` unicode.',
          'Matches are highlighted in the test text, and each match’s index and capture groups are listed below.',
          'Fill in the replacement field to preview `String.replace()` output; use `$1` or `$<name>` for groups.',
        ],
        faq: [
          {
            q: 'Which regex flavor is used?',
            a: 'Your browser’s JavaScript (ECMAScript) engine, so results match exactly what `new RegExp()` does in your code — including lookbehind and named groups.',
          },
          {
            q: 'Why does my pattern only find one match?',
            a: 'Without the `g` flag, JavaScript stops after the first match. Enable `g` to find all of them.',
          },
        ],
      },
      zh: {
        name: '正则表达式测试',
        title: '正则表达式在线测试（JavaScript RegExp）',
        description: '在线测试 JavaScript 正则表达式，实时高亮匹配结果，展示捕获组、命名分组和替换预览。',
        keywords: ['正则', '正则表达式', 'regex', '测试', '匹配', '替换', '在线'],
        howto: [
          '输入正则表达式（不需要两边的斜杠），例如 `\\d{3}-\\d{4}`。',
          '切换修饰符：`g` 全局、`i` 忽略大小写、`m` 多行、`s` 点号匹配换行、`u` Unicode。',
          '测试文本中的匹配会高亮显示，下方列出每个匹配的位置和捕获组。',
          '填写替换内容可预览 `String.replace()` 的结果，用 `$1` 或 `$<name>` 引用分组。',
        ],
        faq: [
          {
            q: '用的是哪种正则语法？',
            a: '浏览器的 JavaScript（ECMAScript）引擎，所以结果和你代码里 `new RegExp()` 的行为完全一致，包括后行断言和命名分组。',
          },
          {
            q: '为什么只匹配到一个结果？',
            a: '没有 `g` 修饰符时，JavaScript 在第一次匹配后就会停止，勾选 `g` 即可匹配全部。',
          },
        ],
      },
    },
  },
  {
    slug: 'uuid-generator',
    category: 'generate',
    glyph: 'ID',
    related: ['hash-generator', 'timestamp', 'base64'],
    text: {
      en: {
        name: 'UUID Generator',
        title: 'UUID Generator – Bulk v4 & v7 UUIDs Online',
        description:
          'Generate random UUID v4 or time-ordered UUID v7 in bulk using cryptographically secure randomness. Uppercase and no-hyphen options.',
        keywords: ['uuid', 'guid', 'generator', 'v4', 'v7', 'random', 'unique id', 'bulk'],
        howto: [
          'Pick a version: v4 (fully random) or v7 (timestamp-ordered, great for database primary keys).',
          'Choose how many to generate, and optionally uppercase or remove hyphens.',
          'Click Generate, then copy all results at once.',
        ],
        faq: [
          {
            q: 'Should I use UUID v4 or v7?',
            a: 'v7 starts with a millisecond timestamp, so IDs sort by creation time and keep database indexes compact. Use v4 when you do not want the creation time to be visible.',
          },
          {
            q: 'Are these UUIDs truly random?',
            a: 'Yes. They use `crypto.getRandomValues()`, the browser’s cryptographically secure random number generator.',
          },
          {
            q: 'What is the difference between a UUID and a GUID?',
            a: 'None in practice — GUID is Microsoft’s name for the same 128-bit identifier format.',
          },
        ],
      },
      zh: {
        name: 'UUID 生成器',
        title: 'UUID 在线生成器（批量生成 v4 / v7）',
        description: '使用加密安全随机数批量生成 UUID v4 或按时间排序的 UUID v7，支持大写和去掉连字符。',
        keywords: ['uuid', 'guid', '生成', 'v4', 'v7', '随机', '批量', '唯一id'],
        howto: [
          '选择版本：v4（完全随机）或 v7（按时间排序，适合做数据库主键）。',
          '选择生成数量，可选转大写或去掉连字符。',
          '点击“生成”，然后一键复制全部结果。',
        ],
        faq: [
          {
            q: '该用 UUID v4 还是 v7？',
            a: 'v7 以毫秒时间戳开头，ID 会按创建时间排序，数据库索引更紧凑；如果不希望暴露创建时间，就用 v4。',
          },
          {
            q: '生成的 UUID 真的随机吗？',
            a: '是的，使用的是浏览器的加密安全随机数生成器 `crypto.getRandomValues()`。',
          },
          {
            q: 'UUID 和 GUID 有什么区别？',
            a: '实际上没有区别，GUID 是微软对同一种 128 位标识符格式的叫法。',
          },
        ],
      },
    },
  },
  {
    slug: 'hash-generator',
    category: 'generate',
    glyph: '#',
    related: ['base64', 'uuid-generator', 'jwt-decoder'],
    text: {
      en: {
        name: 'Hash Generator',
        title: 'Hash Generator – MD5, SHA-1, SHA-256, SHA-512 Online',
        description:
          'Calculate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes of text or files. Uses the Web Crypto API and runs fully offline in your browser.',
        keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'checksum', 'digest', 'file hash'],
        howto: [
          'Type or paste text — all hashes update as you type.',
          'Or choose a file to compute its checksum, for example to verify a download.',
          'Switch between lowercase and uppercase hex output and copy any hash with one click.',
        ],
        faq: [
          {
            q: 'Can a hash be reversed?',
            a: 'No. Hash functions are one-way. However, short or common inputs can be found with lookup tables, so never store plain hashes of passwords — use bcrypt, scrypt or Argon2.',
          },
          {
            q: 'Is MD5 still safe?',
            a: 'MD5 and SHA-1 are broken for security purposes (collisions can be produced). They are fine for non-security checksums; use SHA-256 or better for anything security-related.',
          },
        ],
      },
      zh: {
        name: '哈希计算',
        title: '在线哈希计算（MD5、SHA-1、SHA-256、SHA-512）',
        description: '计算文本或文件的 MD5、SHA-1、SHA-256、SHA-384、SHA-512 哈希，基于 Web Crypto API，完全离线运行。',
        keywords: ['哈希', 'md5', 'sha1', 'sha256', 'sha512', '校验', '文件校验', '在线'],
        howto: [
          '输入或粘贴文本，所有哈希值会实时更新。',
          '也可以选择文件计算校验值，比如验证下载文件是否完整。',
          '可切换大小写十六进制输出，点击即可复制任意哈希值。',
        ],
        faq: [
          {
            q: '哈希可以还原吗？',
            a: '不能，哈希是单向函数。但简短或常见的输入可以通过查表找到原文，所以不要直接存储密码的哈希，应使用 bcrypt、scrypt 或 Argon2。',
          },
          {
            q: 'MD5 还安全吗？',
            a: 'MD5 和 SHA-1 在安全用途上已被攻破（可以构造碰撞），用于普通校验没问题；涉及安全的场景请使用 SHA-256 或更强的算法。',
          },
        ],
      },
    },
  },
  {
    slug: 'color-converter',
    category: 'format',
    glyph: 'RGB',
    related: ['base64', 'uuid-generator', 'json-formatter'],
    text: {
      en: {
        name: 'Color Converter',
        title: 'Color Converter – HEX, RGB, HSL, OKLCH',
        description:
          'Convert colors between HEX, RGB, HSL and OKLCH with a live preview and WCAG contrast check against black and white text.',
        keywords: ['color', 'converter', 'hex', 'rgb', 'hsl', 'oklch', 'css', 'contrast', 'picker'],
        howto: [
          'Type a color in any format — `#10b981`, `rgb(16 185 129)`, `hsl(160 84% 39%)` or `oklch(...)` — or use the picker.',
          'All other formats update instantly and can be copied as ready-to-use CSS.',
          'The contrast panel shows the WCAG contrast ratio against white and black text.',
        ],
        faq: [
          {
            q: 'What is OKLCH and why use it?',
            a: 'OKLCH is a perceptually uniform color space supported in modern CSS. Changing lightness keeps the hue looking the same, which makes it ideal for building color palettes and themes.',
          },
          {
            q: 'What contrast ratio do I need?',
            a: 'WCAG AA requires at least 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 for normal text.',
          },
        ],
      },
      zh: {
        name: '颜色转换',
        title: '颜色格式转换（HEX、RGB、HSL、OKLCH）',
        description: 'HEX、RGB、HSL、OKLCH 颜色格式互转，实时预览，并检查与黑白文字的 WCAG 对比度。',
        keywords: ['颜色', '转换', 'hex', 'rgb', 'hsl', 'oklch', 'css', '对比度', '取色'],
        howto: [
          '用任意格式输入颜色，如 `#10b981`、`rgb(16 185 129)`、`hsl(160 84% 39%)` 或 `oklch(...)`，也可以用取色器。',
          '其他格式会实时更新，可直接复制为 CSS。',
          '对比度面板显示该颜色与白色、黑色文字的 WCAG 对比度。',
        ],
        faq: [
          {
            q: '什么是 OKLCH，为什么要用它？',
            a: 'OKLCH 是现代 CSS 支持的感知均匀色彩空间，调整亮度时色相看起来保持一致，非常适合做调色板和主题。',
          },
          {
            q: '对比度需要多少才合格？',
            a: 'WCAG AA 要求普通文字至少 4.5:1、大号文字至少 3:1；AAA 要求普通文字达到 7:1。',
          },
        ],
      },
    },
  },
];

export const tools: Tool[] = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
