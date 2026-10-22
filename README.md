# codes.im

> Developer tools that never leave your browser. · 数据不出浏览器的开发者工具箱。

**[codes.im](https://codes.im)** is a free, fast, open-source collection of developer tools. Every tool runs 100% client-side, so your input is never uploaded.

### AI & LLM

| Tool | Path |
| --- | --- |
| JSON Schema Generator (OpenAI structured outputs, OpenAI and Anthropic tools) | `/en/json-schema-generator/` |
| JSON → Zod | `/en/json-to-zod/` |
| LLM Token Counter (o200k_base, cl100k_base) | `/en/token-counter/` |
| AI Markdown Cleaner (to plain text or rich text) | `/en/markdown-cleaner/` |
| MCP Config Generator (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf) | `/en/mcp-config-generator/` |
| JSONL Validator (fine-tuning datasets) | `/en/jsonl-validator/` |
| LLM Stream (SSE) Parser (OpenAI, Anthropic, Gemini, Ollama) | `/en/llm-stream-parser/` |
| JSON Repair (fix broken LLM JSON) | `/en/json-repair/` |
| Prompt Template Filler (export to Python / JS) | `/en/prompt-template/` |
| Chat Format Converter (OpenAI ⇄ Anthropic ⇄ Gemini) | `/en/chat-format-converter/` |
| OpenAPI to LLM Tools (OpenAI, Anthropic, MCP) | `/en/openapi-to-tools/` |
| RAG Text Chunker | `/en/text-chunker/` |
| JSON Schema Validator (draft-07 / 2019-09 / 2020-12) | `/en/json-schema-validator/` |
| llms.txt Generator | `/en/llms-txt-generator/` |
| LLM API Cost Calculator (GPT, Claude, Gemini, DeepSeek) | `/en/llm-cost-calculator/` |
| Vector / Embedding Similarity | `/en/vector-similarity/` |
| LLM API Playground (OpenAI-compatible, Claude; BYOK) | `/en/llm-api-playground/` |

### Developer essentials

| Tool | Path |
| --- | --- |
| JSON Formatter / Validator | `/en/json-formatter/` |
| JSONPath Tester | `/en/json-path/` |
| JSON Diff (structural) | `/en/json-diff/` |
| JSON → TypeScript | `/en/json-to-typescript/` |
| JSON → Pydantic / Go / Rust | `/en/json-to-code/` |
| curl → fetch / Python / Go | `/en/curl-converter/` |
| SQL Formatter | `/en/sql-formatter/` |
| YAML ⇄ JSON | `/en/yaml-json/` |
| CSV ⇄ JSON | `/en/csv-json/` |
| Base64 Encode / Decode (UTF-8, URL-safe, file) | `/en/base64/` |
| URL Encode / Decode + URL parser | `/en/url-encoder/` |
| JWT Decoder | `/en/jwt-decoder/` |
| Regex Tester | `/en/regex-tester/` |
| Text Diff | `/en/text-diff/` |
| Markdown Editor | `/en/markdown-editor/` |
| HTML Entity & Unicode Escape | `/en/text-escape/` |
| Number Base Converter | `/en/number-base-converter/` |
| UUID Generator (v4 / v7) | `/en/uuid-generator/` |
| Password & API Key Generator | `/en/password-generator/` |
| QR Code Generator | `/en/qr-code-generator/` |
| Hash Generator (MD5, SHA-1/256/384/512) | `/en/hash-generator/` |
| Color Converter (HEX, RGB, HSL, OKLCH + contrast) | `/en/color-converter/` |
| Unix Timestamp Converter | `/en/timestamp/` |
| Cron Expression Parser | `/en/cron-parser/` |
| Image Compressor (WebP / JPEG / PNG, resize) | `/en/image-compressor/` |
| Image ⇄ Base64 (data URI, Claude API image block) | `/en/image-to-base64/` |
| Chmod Calculator | `/en/chmod-calculator/` |
| Case Converter (camelCase, snake_case, kebab-case…) | `/en/case-converter/` |
| Word Counter (CJK-aware, reading time, tokens) | `/en/word-counter/` |
| IP Subnet (CIDR) Calculator | `/en/cidr-calculator/` |
| User-Agent Parser (incl. AI crawlers) | `/en/user-agent-parser/` |
| Fake Data & Lorem Ipsum Generator | `/en/fake-data-generator/` |

Every page is available in English (`/en/`) and Chinese (`/zh/`).

### Site features

- **⌘K search** across tools and blog posts; favorites and recently used tools on the home page (stored only in your browser).
- **Share links**: one click encodes a tool’s current input into the URL fragment (`#s=…`), which browsers never send to a server.
- **Example pages** for common tasks (`/en/cron-parser/every-5-minutes/`, `/en/number-base-converter/hex-to-decimal/`, …) that prefill the tool — data in `src/data/presets.ts`.
- **HTTP status code reference** (`/en/http-status/`) with causes and fixes for each code — data in `src/data/http-status.ts`.
- **Send to…**: pipe a tool’s result straight into another tool (JSON → JSONPath → YAML…); wiring lives in `src/data/chain.ts`.
- **Social preview images** for every page in `public/og/`. Regenerate after adding tools, posts or example pages with `pnpm og` (needs Playwright: `pnpm add -D playwright && pnpm exec playwright install chromium`). Pages without an image fall back to the home page image.
- **Category landing pages** (`/en/tools/ai/`, …) and FAQ / WebApplication structured data on every tool page.
- **Installable PWA** — tools you have opened keep working offline.
- Optional cookieless analytics and sponsor links in `src/config.ts`.

See **[DEPLOY.md](./DEPLOY.md)** (Chinese) for deploying to Cloudflare Pages and getting indexed.

## Blog, tutorials & projects

- `/en/blog/`, `/zh/blog/` — articles and tutorials written in Markdown / MDX (`src/content/posts/`), with tags, series, table of contents, code highlighting and RSS (`/en/rss.xml`, `/zh/rss.xml`).
- `/en/projects/` — open-source projects from `src/data/projects.ts`.

See **[WRITING.md](./WRITING.md)** (Chinese) for how to write and publish posts.

## Features

- **Privacy first.** No servers process your data, and there are no tracking cookies.
- **Fast.** Static HTML with a small script per tool. Press `⌘K` or `/` to search.
- **SEO-ready.** Each tool page has a how-to section, an FAQ, JSON-LD (WebApplication, FAQPage, Breadcrumb), hreflang tags and a sitemap.
- **Dark mode**, a mobile layout and keyboard shortcuts.

## Tech stack

[Astro](https://astro.build) 6 · TypeScript · [Tailwind CSS](https://tailwindcss.com) 4 · Web Crypto API · deployed as static files (Cloudflare Pages).

## Development

Requires **Node.js ≥ 22.12**.

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm test         # unit tests for the core libraries
pnpm check        # type-check with astro check
pnpm build        # static output in ./dist
pnpm preview      # serve ./dist locally
```

A ready-to-use GitHub Actions workflow (tests, type check, build) is in [DEPLOY.md](./DEPLOY.md).

## Project structure

```
src/
  config.ts                 # your name, GitHub, email, sponsor & analytics (edit me)
  i18n/ui.ts                # UI strings (en / zh) + path helpers
  tools/registry*.ts        # tool metadata, SEO copy, how-to & FAQ for each language
  components/tools/*.astro  # one interactive widget per tool
  components/tools/index.ts # slug → widget map
  lib/*.ts                  # pure, framework-free logic (unit tested)
  pages/[lang]/[slug].astro # tool page template
  pages/[lang]/index.astro  # home
  pages/[lang]/tools/       # category landing pages
  pages/[lang]/about.astro  # about / portfolio page
  pages/[lang]/blog/        # blog list, post pages, tag pages
  content/posts/{en,zh}/    # blog posts (.md / .mdx)
  data/projects.ts          # open-source projects list
tests/*.test.ts
```

## Adding a tool

1. Put the logic in `src/lib/<name>.ts` and add tests to `tests/`.
2. Create `src/components/tools/<Name>.astro` (UI + a `<script>` that imports the lib).
3. Register it in `src/components/tools/index.ts`.
4. Add an entry to `src/tools/registry.ts` (or one of the `registry-batch*.ts` files) with the en/zh name, title, description, how-to and FAQ.

The home page, search, footer, sitemap and related links pick it up automatically.

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub.
2. In Cloudflare Pages, choose **Create project → Connect to Git** and select the repo.
3. Set the build command to `pnpm build`, the output directory to `dist`, and the environment variable `NODE_VERSION=22`.
4. Add the custom domain `codes.im`.

`public/_headers` sets security headers and long-term caching for hashed assets. The full checklist (domain, Search Console, analytics) is in [DEPLOY.md](./DEPLOY.md).

## License

[MIT](./LICENSE)
