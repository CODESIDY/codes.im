import type { Tool } from './registry';

/** Fifth batch: LLM cost, embeddings, JSON querying/diffing, images and everyday utilities. */
export const batch5: Tool[] = [
  {
    slug: 'llm-cost-calculator',
    category: 'llm',
    glyph: '$/M',
    related: ['token-counter', 'text-chunker', 'prompt-template'],
    text: {
      en: {
        name: 'LLM API Cost Calculator',
        title: 'LLM API Cost Calculator – Compare GPT, Claude, Gemini & DeepSeek Pricing',
        description:
          'Estimate per-request, daily and monthly API cost across OpenAI, Anthropic, Google and DeepSeek models. Accounts for prompt caching, long-context price tiers and context-window limits.',
        keywords: ['llm cost calculator', 'api pricing', 'token cost', 'gpt price', 'claude price', 'gemini price', 'deepseek price', 'per million tokens', 'ai cost'],
        howto: [
          'Enter the typical input and output tokens of one request — or open “estimate from text” and paste a real prompt to count it.',
          'Set how much of the input is served from the prompt cache and how many requests you expect per day.',
          'The table sorts every model from cheapest to most expensive and shows the cost per request, per day and per 30-day month.',
          'Filter by provider to compare models from one vendor. Red context numbers mean the request would not fit.',
        ],
        faq: [
          {
            q: 'Where do the prices come from?',
            a: 'From each provider’s official pricing page, standard (non-batch) tier, in USD per million tokens. The date they were checked is shown under the table. Prices change often, so confirm before committing to a budget.',
          },
          {
            q: 'What is the cached-input share?',
            a: 'Most providers charge much less for input tokens that hit the prompt cache — typically a long, unchanging system prompt or document. If 80% of each prompt is a reused prefix, set the slider to 80%. Cache-write surcharges are not included.',
          },
          {
            q: 'Why does the price jump for some models on long prompts?',
            a: 'Some models (for example Claude Haiku 5.5 above 100K input tokens and Gemini 3.1 Pro above 200K) bill the whole request at a higher rate once the prompt passes a threshold. The calculator applies that tier automatically and labels it.',
          },
          {
            q: 'Are batch or off-peak discounts included?',
            a: 'No. Batch APIs are usually about 50% cheaper, and DeepSeek is 50% off outside peak hours. Halve the figures for a rough estimate.',
          },
        ],
      },
      zh: {
        name: 'LLM API 费用计算器',
        title: '大模型 API 费用计算器：对比 GPT、Claude、Gemini、DeepSeek 价格',
        description: '估算 OpenAI、Anthropic、Google、DeepSeek 各模型的单次请求、每天和每月 API 费用，考虑提示缓存、长上下文阶梯价和上下文窗口限制。',
        keywords: ['大模型价格', 'api费用计算', 'token价格', 'gpt价格', 'claude价格', 'gemini价格', 'deepseek价格', '每百万token', 'ai成本'],
        howto: [
          '填写一次请求典型的输入和输出 token 数 —— 也可以展开“从文本估算”，粘贴真实的提示词来计数。',
          '设置输入中命中提示缓存的比例，以及预计每天的请求数。',
          '表格会把所有模型从便宜到贵排序，显示每次请求、每天和每月（按 30 天）的费用。',
          '可以按厂商筛选。上下文一栏显示为红色，表示这次请求超出了模型的上下文窗口。',
        ],
        faq: [
          {
            q: '价格数据从哪里来？',
            a: '来自各家官方价格页的标准档（非 Batch）价格，单位是美元 / 每百万 token。表格下方注明了核对日期。价格变动频繁，做正式预算前请再确认一次。',
          },
          {
            q: '“缓存命中比例”是什么意思？',
            a: '大多数厂商对命中提示缓存的输入 token 收费低得多，通常是长且不变的系统提示或文档。如果每次请求 80% 的内容是重复前缀，就把滑块拉到 80%。写入缓存的额外费用没有计算在内。',
          },
          {
            q: '为什么有些模型在长提示下价格会跳涨？',
            a: '部分模型（例如 Claude Haiku 5.5 超过 10 万输入 token、Gemini 3.1 Pro 超过 20 万）在提示超过阈值后，整次请求都按更高的单价计费。计算器会自动套用这个阶梯并标注出来。',
          },
          {
            q: '包含 Batch 或闲时折扣吗？',
            a: '不包含。Batch 接口通常便宜约 50%，DeepSeek 在非高峰时段也是五折。粗略估算时可以把结果减半。',
          },
        ],
      },
    },
  },
  {
    slug: 'vector-similarity',
    category: 'ai',
    glyph: 'cos',
    related: ['text-chunker', 'jsonl-validator', 'token-counter'],
    text: {
      en: {
        name: 'Vector Similarity Calculator',
        title: 'Cosine Similarity Calculator – Compare Embedding Vectors Online',
        description:
          'Paste two embedding vectors and get cosine similarity, cosine distance, angle, dot product, Euclidean and Manhattan distance. Accepts raw arrays or full embedding API responses.',
        keywords: ['cosine similarity', 'embedding', 'vector similarity', 'dot product', 'euclidean distance', 'rag', 'semantic search', 'vector database'],
        howto: [
          'Paste vector A and vector B — as a JSON array, comma or space separated numbers, or a whole embedding API response (the first numeric array is extracted).',
          'Cosine similarity is shown large at the top, with distance metrics below.',
          'Use “Normalize A” to convert a vector to unit length, as many vector databases expect.',
        ],
        faq: [
          {
            q: 'Which metric should my vector database use?',
            a: 'Use what the embedding model was trained for — almost always cosine. If the vectors are already normalized (length 1), dot product gives the same ranking and is faster, which is why many databases default to it.',
          },
          {
            q: 'What is a “good” cosine similarity?',
            a: 'It depends heavily on the model. Some models put unrelated text around 0.1, others around 0.7. Compare scores from the same model against known similar and dissimilar pairs rather than using a fixed threshold.',
          },
          {
            q: 'Can I compare vectors from different models?',
            a: 'No. Vectors from different models (or different dimensions) live in different spaces, so their similarity is meaningless — the tool will refuse vectors of different lengths.',
          },
        ],
      },
      zh: {
        name: '向量相似度计算',
        title: '余弦相似度在线计算：比较两个 Embedding 向量',
        description: '粘贴两个 Embedding 向量，计算余弦相似度、余弦距离、夹角、点积、欧氏距离和曼哈顿距离。支持纯数组，也支持完整的 Embedding 接口返回值。',
        keywords: ['余弦相似度', 'embedding', '向量相似度', '点积', '欧氏距离', 'rag', '语义检索', '向量数据库'],
        howto: [
          '粘贴向量 A 和向量 B —— 可以是 JSON 数组、逗号或空格分隔的数字，也可以是整个 Embedding 接口返回的 JSON（会自动提取第一个数字数组）。',
          '顶部大字显示余弦相似度，下方列出各种距离指标。',
          '点击“归一化 A”可以把向量缩放到长度为 1，很多向量数据库要求这样。',
        ],
        faq: [
          {
            q: '向量数据库应该选哪种度量？',
            a: '跟随 Embedding 模型训练时用的度量，绝大多数是余弦。如果向量已经归一化（长度为 1），点积的排序结果与余弦完全一样且更快，所以很多数据库默认用点积。',
          },
          {
            q: '余弦相似度多少算“相似”？',
            a: '和模型关系很大。有的模型里无关文本也有 0.7 左右，有的只有 0.1。建议用同一个模型，拿已知相似和不相似的样本对比，而不是套用固定阈值。',
          },
          {
            q: '能比较不同模型生成的向量吗？',
            a: '不能。不同模型（或不同维度）的向量处于不同的空间，相似度没有意义 —— 维度不一致时工具会直接报错。',
          },
        ],
      },
    },
  },
  {
    slug: 'json-path',
    category: 'format',
    glyph: '$..',
    related: ['json-formatter', 'json-diff', 'json-schema-validator'],
    text: {
      en: {
        name: 'JSONPath Tester',
        title: 'JSONPath Tester – Query & Filter JSON Online',
        description:
          'Run JSONPath expressions against your JSON and see matching values or their exact paths. Supports wildcards, recursive descent, slices, unions and filter expressions like [?(@.price < 10)].',
        keywords: ['jsonpath', 'json path', 'jsonpath tester', 'jsonpath online', 'json query', 'jsonpath filter', 'jq'],
        howto: [
          'Paste JSON on the left (or click Sample).',
          'Type a JSONPath expression starting with `$`. Results update as you type.',
          'Switch between Values and Paths to see either the matched data or the normalized location of each match.',
          'Click an example to learn the syntax: `..` searches at any depth, `[*]` selects all items, `[?()]` filters.',
        ],
        faq: [
          {
            q: 'Which JSONPath features are supported?',
            a: '`$`, `.name`, `[\'name\']`, indexes including negative ones, slices `[start:end:step]`, wildcards, recursive descent `..`, unions `[a,b]`, and filters with `== != < <= > >= && || !`, `@` / `$` references and `=~ /regex/`.',
          },
          {
            q: 'Is it safe to run untrusted expressions?',
            a: 'Yes. Unlike some JSONPath libraries, filters are parsed and evaluated by a small interpreter — nothing is passed to `eval`, so an expression can’t run arbitrary JavaScript.',
          },
          {
            q: 'How is JSONPath different from jq?',
            a: 'JSONPath only selects data; jq is a full transformation language. JSONPath is what you’ll find in Kubernetes (`kubectl -o jsonpath`), Postman tests, AWS Step Functions and many SDKs.',
          },
        ],
      },
      zh: {
        name: 'JSONPath 测试',
        title: 'JSONPath 在线测试：查询与筛选 JSON',
        description: '用 JSONPath 表达式查询 JSON，查看匹配的值或精确路径。支持通配符、递归下降、切片、并集，以及 [?(@.price < 10)] 这样的过滤表达式。',
        keywords: ['jsonpath', 'json path', 'jsonpath在线', 'jsonpath测试', 'json查询', 'jsonpath过滤', 'jq'],
        howto: [
          '在左侧粘贴 JSON（或点击“示例”）。',
          '输入以 `$` 开头的 JSONPath 表达式，结果实时更新。',
          '可以在“值”和“路径”之间切换，查看匹配到的数据或每个匹配项的标准化路径。',
          '点击示例学习语法：`..` 表示任意层级查找，`[*]` 选中所有元素，`[?()]` 用于过滤。',
        ],
        faq: [
          {
            q: '支持哪些 JSONPath 语法？',
            a: '`$`、`.name`、`[\'name\']`、索引（包括负数）、切片 `[start:end:step]`、通配符、递归下降 `..`、并集 `[a,b]`，以及包含 `== != < <= > >= && || !`、`@` / `$` 引用和 `=~ /正则/` 的过滤表达式。',
          },
          {
            q: '执行不可信的表达式安全吗？',
            a: '安全。与某些 JSONPath 库不同，这里的过滤表达式由一个小型解释器解析执行，不会交给 `eval`，所以表达式无法运行任意 JavaScript。',
          },
          {
            q: 'JSONPath 和 jq 有什么区别？',
            a: 'JSONPath 只负责选取数据，jq 是完整的转换语言。Kubernetes（`kubectl -o jsonpath`）、Postman 测试、AWS Step Functions 和很多 SDK 用的都是 JSONPath。',
          },
        ],
      },
    },
  },
  {
    slug: 'json-diff',
    category: 'format',
    glyph: '{±}',
    related: ['text-diff', 'json-formatter', 'json-path'],
    text: {
      en: {
        name: 'JSON Diff',
        title: 'JSON Diff – Compare Two JSON Objects Structurally',
        description:
          'Compare two JSON documents by structure, not by text. Lists every added, removed and changed field with its path, ignores key order, and can optionally ignore array order.',
        keywords: ['json diff', 'json compare', 'compare json', 'json difference', 'json comparison online', 'diff api response'],
        howto: [
          'Paste the original JSON on the left and the changed JSON on the right.',
          'Every difference is listed with its path, such as `$.settings.theme`, and the old → new value.',
          'Turn on “Ignore array order” when lists are sets (tags, IDs) rather than sequences.',
          'Use “Sort keys & format both” to normalize both sides if you also want a line-by-line text diff.',
        ],
        faq: [
          {
            q: 'Why not just use a text diff?',
            a: 'Reordered keys, different indentation or minified JSON make text diffs noisy. A structural diff compares the parsed data, so only real changes show up.',
          },
          {
            q: 'How are arrays compared?',
            a: 'By default, item by item at the same index — so inserting an element at the start shows several changes. With “Ignore array order”, arrays are compared as multisets and only items missing on either side are reported.',
          },
        ],
      },
      zh: {
        name: 'JSON 对比',
        title: 'JSON 对比工具：按结构比较两个 JSON 的差异',
        description: '按结构而不是按文本比较两个 JSON，列出每个新增、删除和修改的字段及其路径。自动忽略键的顺序，也可以选择忽略数组顺序。',
        keywords: ['json对比', 'json比较', 'json差异', 'json diff', '在线json对比', '接口返回对比'],
        howto: [
          '左侧粘贴原始 JSON，右侧粘贴修改后的 JSON。',
          '每处差异都会列出路径（如 `$.settings.theme`）以及旧值 → 新值。',
          '如果数组表示的是集合（标签、ID 列表）而不是序列，可以打开“忽略数组顺序”。',
          '点击“排序键并格式化两侧”可以把两边规范化，方便再做逐行文本对比。',
        ],
        faq: [
          {
            q: '为什么不直接用文本对比？',
            a: '键的顺序不同、缩进不同或者压缩过的 JSON，都会让文本对比出现大量噪音。结构化对比比较的是解析后的数据，只显示真正的变化。',
          },
          {
            q: '数组是怎么比较的？',
            a: '默认按相同下标逐项比较，所以在开头插入一个元素会显示多处变化。打开“忽略数组顺序”后，数组按多重集合比较，只报告两侧缺少的元素。',
          },
        ],
      },
    },
  },
  {
    slug: 'image-compressor',
    category: 'image',
    glyph: 'IMG',
    related: ['image-to-base64', 'qr-code-generator', 'color-converter'],
    text: {
      en: {
        name: 'Image Compressor',
        title: 'Image Compressor – Compress & Resize JPEG, PNG, WebP Without Uploading',
        description:
          'Compress and resize images in your browser. Convert to WebP or JPEG, adjust quality, set a maximum width or height, and batch-process many files — nothing is uploaded.',
        keywords: ['image compressor', 'compress image', 'resize image', 'png to webp', 'jpg compress', 'reduce image size', 'webp converter', 'tinypng alternative'],
        howto: [
          'Drop images onto the box, paste from the clipboard, or click to choose files.',
          'Pick an output format (WebP usually gives the smallest files) and a quality — 75–85 is a good balance.',
          'Optionally set a maximum width or height; images are scaled down proportionally and never enlarged.',
          'Download each file, or click “Download all”. Changing a setting re-processes every image.',
        ],
        faq: [
          {
            q: 'Are my images uploaded?',
            a: 'No. Compression uses the browser’s own canvas encoder, so files never leave your device — useful for screenshots containing private data.',
          },
          {
            q: 'Why did my PNG get bigger?',
            a: 'Re-encoding an already optimized PNG rarely helps, and PNG ignores the quality setting. Convert to WebP (lossy or near-lossless) instead, or scale it down.',
          },
          {
            q: 'Is metadata such as GPS location kept?',
            a: 'No. Re-encoding through canvas drops EXIF data, including camera details and location, which is usually what you want before sharing a photo.',
          },
        ],
      },
      zh: {
        name: '图片压缩',
        title: '在线图片压缩：本地压缩、缩放 JPEG / PNG / WebP，不上传',
        description: '在浏览器里压缩和缩放图片，可转换为 WebP 或 JPEG、调节质量、限制最大宽高，支持批量处理 —— 图片不会上传。',
        keywords: ['图片压缩', '压缩图片', '图片缩放', 'png转webp', 'jpg压缩', '减小图片大小', 'webp转换', 'tinypng'],
        howto: [
          '把图片拖到框里、从剪贴板粘贴，或点击选择文件。',
          '选择输出格式（WebP 通常最小）和质量，75–85 是不错的平衡点。',
          '可以设置最大宽度或高度，图片会按比例缩小，不会放大。',
          '逐个下载，或点击“全部下载”。修改设置后会自动重新处理所有图片。',
        ],
        faq: [
          {
            q: '图片会被上传吗？',
            a: '不会。压缩使用浏览器自带的 canvas 编码器，文件不会离开你的设备，适合处理含有隐私信息的截图。',
          },
          {
            q: '为什么 PNG 压缩后反而变大了？',
            a: '已经优化过的 PNG 再次编码很难更小，而且 PNG 会忽略质量参数。可以转换成 WebP，或者缩小尺寸。',
          },
          {
            q: '会保留 GPS 位置等元数据吗？',
            a: '不会。经过 canvas 重新编码会丢弃 EXIF 信息（包括相机参数和位置），分享照片前这通常正是你想要的。',
          },
        ],
      },
    },
  },
  {
    slug: 'image-to-base64',
    category: 'image',
    glyph: 'b64',
    related: ['base64', 'image-compressor', 'url-encoder'],
    text: {
      en: {
        name: 'Image to Base64',
        title: 'Image to Base64 Converter – Data URI for HTML, CSS & LLM APIs',
        description:
          'Convert an image to a Base64 data URI and copy it as HTML, CSS, Markdown or a ready-made Claude API image block — or decode Base64 back into a downloadable image.',
        keywords: ['image to base64', 'base64 image', 'data uri', 'base64 to image', 'png to base64', 'svg to base64', 'inline image', 'vision api base64'],
        howto: [
          'Drop, paste or choose an image. It is read locally and converted immediately.',
          'Choose the output format: data URI, raw Base64, an `<img>` tag, a CSS background, Markdown, or a JSON image block for multimodal LLM APIs.',
          'To go the other way, switch to “Base64 → Image”, paste a data URI or raw Base64, and download the decoded file.',
        ],
        faq: [
          {
            q: 'When should I inline images as Base64?',
            a: 'For tiny icons, email templates and single-file HTML. Base64 is about 33% larger than the binary and can’t be cached separately, so keep regular images as files.',
          },
          {
            q: 'How do I send an image to a vision model?',
            a: 'Most LLM APIs accept Base64 images in the request. The “Claude API image block” output gives the exact `{type, source: {type: "base64", media_type, data}}` object; OpenAI accepts the data URI as an `image_url`.',
          },
          {
            q: 'The decoder says it can’t read my string.',
            a: 'Make sure the whole string was copied — Base64 images are long and often truncated. Raw Base64 without a `data:` prefix is detected from its first bytes (PNG, JPEG, GIF, WebP, SVG).',
          },
        ],
      },
      zh: {
        name: '图片转 Base64',
        title: '图片转 Base64：生成 Data URI，用于 HTML、CSS 和大模型接口',
        description: '把图片转换成 Base64 Data URI，一键复制为 HTML、CSS、Markdown 或可直接使用的 Claude API 图片块；也可以把 Base64 解码回图片并下载。',
        keywords: ['图片转base64', 'base64图片', 'data uri', 'base64转图片', 'png转base64', 'svg转base64', '内联图片', '多模态base64'],
        howto: [
          '拖入、粘贴或选择一张图片，本地读取后立即转换。',
          '选择输出格式：Data URI、纯 Base64、`<img>` 标签、CSS 背景、Markdown，或多模态大模型接口用的 JSON 图片块。',
          '反向转换时切换到“Base64 → 图片”，粘贴 Data URI 或纯 Base64，即可预览并下载。',
        ],
        faq: [
          {
            q: '什么时候适合把图片内联成 Base64？',
            a: '小图标、邮件模板和单文件 HTML。Base64 比原始二进制大约多 33%，也不能单独缓存，普通图片还是用文件更好。',
          },
          {
            q: '怎么把图片发给视觉模型？',
            a: '大多数大模型接口都接受 Base64 图片。“Claude API 图片块”会直接给出 `{type, source: {type: "base64", media_type, data}}` 结构；OpenAI 可以把 Data URI 作为 `image_url` 传入。',
          },
          {
            q: '解码时提示无法识别？',
            a: '确认字符串复制完整 —— Base64 图片很长，经常被截断。没有 `data:` 前缀的纯 Base64 会根据开头字节自动识别（PNG、JPEG、GIF、WebP、SVG）。',
          },
        ],
      },
    },
  },
  {
    slug: 'chmod-calculator',
    category: 'generate',
    glyph: '755',
    related: ['cron-parser', 'number-base-converter', 'curl-converter'],
    text: {
      en: {
        name: 'Chmod Calculator',
        title: 'Chmod Calculator – Convert Linux Permissions Between Octal & rwx',
        description:
          'Tick read/write/execute boxes or type 755, rwxr-xr-x or u+x,go-w, and get the matching octal, symbolic notation and ready-to-copy chmod commands. Supports setuid, setgid and sticky bits.',
        keywords: ['chmod calculator', 'chmod', 'linux permissions', 'file permissions', '755', '644', 'rwxr-xr-x', 'unix permissions', 'octal permissions'],
        howto: [
          'Tick the permissions for owner, group and others — or type an octal mode like `644`, or paste `-rw-r--r--` from `ls -l`.',
          'Add special bits (setuid, setgid, sticky) if needed.',
          'Type a symbolic change such as `u+x,go-w` and press Enter to apply it to the current mode.',
          'Copy the generated `chmod` command.',
        ],
        faq: [
          {
            q: 'What do 755 and 644 mean?',
            a: 'Each digit is a sum of read (4), write (2) and execute (1) for owner, group and others. `755` = rwx for the owner, r-x for everyone else (typical for directories and scripts). `644` = rw- for the owner, read-only for others (typical for files).',
          },
          {
            q: 'What are setuid, setgid and sticky?',
            a: 'A fourth leading digit. setuid (4) runs a program as its owner; setgid (2) does the same for the group, and on directories makes new files inherit the group; sticky (1) on a directory such as `/tmp` stops users deleting each other’s files.',
          },
          {
            q: 'Should I ever use 777?',
            a: 'Almost never. It lets every user on the system modify the file. Fix ownership with `chown` instead, and grant group write (775/664) when several users need access.',
          },
        ],
      },
      zh: {
        name: 'Chmod 权限计算器',
        title: 'Chmod 计算器：Linux 文件权限八进制与 rwx 互转',
        description: '勾选读 / 写 / 执行，或直接输入 755、rwxr-xr-x、u+x,go-w，得到对应的八进制、符号表示和可直接复制的 chmod 命令。支持 setuid、setgid 和 sticky 位。',
        keywords: ['chmod计算器', 'chmod', 'linux权限', '文件权限', '755', '644', 'rwxr-xr-x', 'unix权限', '权限计算'],
        howto: [
          '为所有者、所属组和其他人勾选权限 —— 或输入 `644` 这样的八进制，或粘贴 `ls -l` 里的 `-rw-r--r--`。',
          '需要时勾选特殊权限位（setuid、setgid、sticky）。',
          '输入 `u+x,go-w` 这样的符号修改并按回车，会应用到当前权限上。',
          '复制生成的 `chmod` 命令。',
        ],
        faq: [
          {
            q: '755 和 644 是什么意思？',
            a: '每一位是所有者、所属组、其他人的读（4）+ 写（2）+ 执行（1）之和。`755` 表示所有者 rwx、其他人 r-x，常用于目录和脚本；`644` 表示所有者可读写、其他人只读，常用于普通文件。',
          },
          {
            q: 'setuid、setgid、sticky 是什么？',
            a: '最前面的第四位数字。setuid（4）让程序以文件所有者身份运行；setgid（2）对组生效，用在目录上时新文件会继承目录的组；sticky（1）用在 `/tmp` 这类目录上，防止用户删除别人的文件。',
          },
          {
            q: '可以用 777 吗？',
            a: '几乎不应该。它允许系统上任何用户修改文件。应该用 `chown` 修正所有者，多人协作时给组写权限（775/664）即可。',
          },
        ],
      },
    },
  },
  {
    slug: 'case-converter',
    category: 'text',
    glyph: 'aA',
    related: ['json-to-typescript', 'text-escape', 'regex-tester'],
    text: {
      en: {
        name: 'Case Converter',
        title: 'Case Converter – camelCase, snake_case, kebab-case, PascalCase & more',
        description:
          'Convert identifiers between camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case and more. Handles acronyms like XMLHttpRequest and converts many lines at once.',
        keywords: ['case converter', 'camelcase', 'snake case', 'kebab case', 'pascal case', 'camel to snake', 'naming convention', 'variable name converter'],
        howto: [
          'Type or paste identifiers or phrases — one per line to convert many at once.',
          'Every naming style is shown side by side; click Copy on the one you need.',
          'Acronyms and numbers are split sensibly: `XMLHttpRequest` → `xml_http_request`, `userID2` → `user_id_2`.',
        ],
        faq: [
          {
            q: 'Which style should I use?',
            a: 'Follow the language: camelCase for JavaScript/Java variables, PascalCase for classes and types, snake_case for Python and SQL columns, CONSTANT_CASE for constants and environment variables, kebab-case for URLs, CSS classes and CLI flags.',
          },
          {
            q: 'Does it work with non-English words?',
            a: 'Yes. Words are split on Unicode letter and number boundaries, so accented letters are kept. Scripts without letter case, such as Chinese, are left as they are.',
          },
        ],
      },
      zh: {
        name: '命名风格转换',
        title: '变量命名风格转换：camelCase、snake_case、kebab-case、PascalCase 互转',
        description: '在 camelCase、PascalCase、snake_case、CONSTANT_CASE、kebab-case、Title Case 等命名风格之间转换，能正确处理 XMLHttpRequest 这类缩写，支持多行批量转换。',
        keywords: ['命名转换', '驼峰转下划线', 'camelcase', 'snake_case', 'kebab-case', '大驼峰', '变量命名', '下划线转驼峰'],
        howto: [
          '输入或粘贴变量名、字段名或短语，一行一个可以批量转换。',
          '所有命名风格并排显示，点击对应的“复制”即可。',
          '缩写和数字会被合理拆分：`XMLHttpRequest` → `xml_http_request`，`userID2` → `user_id_2`。',
        ],
        faq: [
          {
            q: '该用哪种命名风格？',
            a: '跟随语言习惯：JavaScript / Java 变量用 camelCase，类和类型用 PascalCase，Python 和 SQL 字段用 snake_case，常量和环境变量用 CONSTANT_CASE，URL、CSS 类名和命令行参数用 kebab-case。',
          },
          {
            q: '支持非英文吗？',
            a: '支持。按 Unicode 字母和数字的边界拆分单词，带重音的字母会保留；中文这类没有大小写的文字会原样保留。',
          },
        ],
      },
    },
  },
];
