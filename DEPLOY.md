# 上线指南

codes.im 是纯静态站点（`pnpm build` 输出到 `dist/`），推荐用 **Cloudflare Pages** 免费托管：全球 CDN、自带 HTTPS，`public/_headers` 里的安全头和缓存规则也会自动生效。

## 0. 上线前检查

- [ ] 填好 `src/config.ts`：`repo`、`github`、`email`、`author`、`bio`，可选 `avatar`、`social`、`sponsor`、`analytics`
- [ ] 删除 `package-lock.json`（项目用 pnpm，只保留 `pnpm-lock.yaml`）
- [ ] 本地跑一遍：`pnpm test && pnpm check && pnpm build`
- [ ] 读一遍《为什么 codes.im 的工具都在浏览器里运行》，改成你自己的说法

## 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:<你的用户名>/codes.im.git
git push -u origin main
```

### 添加 CI（可选，推荐）

新建 `.github/workflows/ci.yml`（文件夹已经建好，里面的 `.probe` 是测试留下的空文件，可以删掉），内容如下：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Unit tests
        run: pnpm test
      - name: Type check
        run: pnpm check
      - name: Build
        run: pnpm build
```

之后每次 push 和 PR 都会自动运行测试、类型检查和构建。

## 2. 部署到 Cloudflare Pages

1. 登录 Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**，选择仓库。
2. 构建设置：
   - Framework preset：**Astro**
   - Build command：`pnpm build`
   - Build output directory：`dist`
   - 环境变量：`NODE_VERSION` = `22`
3. 保存后会自动部署，之后每次 push 到 `main` 都会重新部署，PR 会得到预览地址。

## 3. 绑定域名 codes.im

- 如果域名的 DNS 已经托管在 Cloudflare：Pages 项目 → **Custom domains** → 添加 `codes.im` 和 `www.codes.im`，记录会自动创建。
- 如果在其他注册商：先在 Cloudflare 添加站点，把注册商的 NS 改成 Cloudflare 提供的两个地址，生效后再按上一步操作。
- 建议在 **Rules → Redirect Rules** 里把 `www.codes.im` 301 跳转到 `codes.im`。

### 域名邮箱 hello@codes.im（免费）

网站上公开的联系邮箱是 `hello@codes.im`。域名接入 Cloudflare 后，用 **Email Routing** 就能免费收信：

1. Cloudflare 里打开 codes.im → **Email** → **Email Routing** → 启用（会自动添加 MX 和 SPF 记录）。
2. **Destination addresses** 添加你的常用邮箱并完成验证。
3. **Routing rules** 新建规则：`hello@codes.im` → 转发到你的常用邮箱。

这样别人发到 hello@codes.im 的邮件会直接转到你的常用邮箱。如果还想用这个地址回信，可以在 Gmail 的“以其他地址发送邮件”里配置，或者改用 Zoho Mail 等支持自定义域名的邮箱服务。

## 4. 让搜索引擎收录

- **Google Search Console**：添加 `codes.im`（域名资源，DNS 验证），提交 `https://codes.im/sitemap-index.xml`。
- **Bing Webmaster Tools**：可以直接从 Google Search Console 导入。
- **百度搜索资源平台**：添加站点并验证，提交 sitemap。百度收录较慢，中文流量主要还是靠掘金、知乎等平台引流。

每个工具页都有 FAQ / WebApplication / Breadcrumb 结构化数据，分类页（`/zh/tools/ai/` 等）有 ItemList。可以用 Google 的 [Rich Results Test](https://search.google.com/test/rich-results) 检查。

## 5. 访问统计（可选）

在 `src/config.ts` 的 `analytics` 里选一种，都不使用 Cookie，与“无追踪 Cookie”的承诺一致，只在生产构建中加载：

| 方案 | 费用 | 配置 |
| --- | --- | --- |
| Cloudflare Web Analytics | 免费 | Cloudflare → Analytics & Logs → Web Analytics → 添加站点，拿到 token，填 `{ provider: 'cloudflare', id: '<token>' }` |
| Plausible | 付费（可自托管） | `{ provider: 'plausible', id: 'codes.im' }` |
| Umami | 免费自托管 / 云版 | `{ provider: 'umami', id: '<website id>', src: 'https://<你的 umami>/script.js' }` |

> 用的是 Cloudflare Pages 的话，也可以直接在 Pages 项目里一键开启 Web Analytics，不改代码。

## 6. 赞助入口（可选）

在 `src/config.ts` 的 `sponsor` 里填上 GitHub Sponsors、爱发电或 Buy Me a Coffee 的链接，页脚会出现“支持本站”，关于页会出现赞助按钮。全部留空则不显示。

## 7. 上线后的日常

- **LLM 价格**：`src/lib/llm-pricing.ts` 里的价格需要定期核对（文件顶部有更新日期）。Gemini 4 Argon 的优惠价 2026-11-30 到期。
- **新文章**：见 [WRITING.md](./WRITING.md)。
- **反馈**：`config.repo` 填好后，每个工具页底部和页脚都会出现指向 GitHub Issues 的反馈 / 需求链接。
