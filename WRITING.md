# 写作与发布指南

codes.im 内置了博客（文章 + 教程）和开源项目页。所有内容都是仓库里的文件：写好后 `git push`，Cloudflare Pages 会自动重新构建并发布。

## 目录结构

```
src/content/posts/
  _template.md              # 模板（以 _ 开头的文件不会发布）
  zh/reliable-json-from-llms.mdx
  en/reliable-json-from-llms.mdx
src/data/projects.ts        # 开源项目列表（/projects/ 页面）
```

## 写一篇新文章

1. 复制 `src/content/posts/_template.md` 到 `src/content/posts/zh/你的文章名.md`。
2. 改 frontmatter（文件开头 `---` 之间的部分）：

   | 字段 | 说明 |
   | --- | --- |
   | `title` | 标题 |
   | `description` | 摘要，显示在列表、搜索结果和分享卡片里 |
   | `date` | 发布日期，例如 `2026-10-22` |
   | `category` | 分类（必填）：`ai`、`web`、`tools`、`build`，在 `src/data/categories.ts` 里增删改 |
   | `cover` | 可选，封面图路径，例如 `../images/my-cover.png`；不填会按分类自动生成封面 |
   | `coverAlt` | 可选，封面图的文字说明 |
   | `featured` | 可选，`true` 时置顶为博客首页的大卡片 |
   | `updated` | 可选，最后更新日期 |
   | `kind` | `article`（文章）或 `tutorial`（教程） |
   | `tags` | 标签，例如 `[llm, astro]`，会自动生成标签页 |
   | `tools` | 文末推荐的工具 slug，例如 `[json-repair]` |
   | `series` | 可选，同一系列的文章会在开头互相链接 |
   | `draft` | `true` 时只在本地 `pnpm dev` 可见，不会发布 |

3. 运行 `pnpm dev`，打开 http://localhost:4321/zh/blog/ 边写边预览。
4. 写完把 `draft` 改成 `false`，提交并推送：

   ```bash
   git add src/content/posts
   git commit -m "post: 你的文章标题"
   git push
   ```

文件名就是网址：`zh/my-post.md` → `https://codes.im/zh/blog/my-post/`。文件名建议用英文小写和连字符，发布后尽量不要改。

## 中英双语

在 `zh/` 和 `en/` 下用**同一个文件名**，两篇文章会自动互相关联：顶部出现“Also available in English”，语言切换也会跳到对应译文，并输出 hreflang 给搜索引擎。只写一种语言也完全没问题。

## 在文章里嵌入工具和提示框（.mdx）

把文件扩展名改成 `.mdx`，就可以在 Markdown 里使用组件：

```mdx
import Callout from '../../../components/content/Callout.astro';
import ToolEmbed from '../../../components/content/ToolEmbed.astro';

<Callout type="tip" title="小技巧">支持 **Markdown**。</Callout>

<ToolEmbed slug="json-repair" lang="zh" />
```

- `Callout` 的 `type` 可选 `note`、`tip`、`warning`。
- `ToolEmbed` 会把一个可交互的工具直接嵌进文章，同一篇文章里每个工具只能嵌入一次。

## 封面图

把封面图放在 `src/content/posts/images/`，建议尺寸 1200×630（同时用作分享到社交平台时的预览图），在文章开头写：

```yaml
cover: ../images/my-cover.png
coverAlt: 图片说明
```

构建时会自动压缩并转换成 WebP。不想做封面图也没关系，会按分类自动生成一张渐变封面。

## 作者卡片和分类

- 博客右侧的作者卡片读取 `src/config.ts`：`author`（名字）、`avatar`（头像，放在 `public/` 下，例如 `/avatar.png`）、`bio`（中英文简介）、`social`（X、掘金、知乎、B 站链接，留空就不显示）。
- 分类在 `src/data/categories.ts` 里配置（名称、emoji），每个分类自动生成 `/zh/blog/category/<分类>/` 页面。

## 正文图片

把图片放在 `public/images/` 下，在文章里这样引用：

```md
![说明文字](/images/my-screenshot.png)
```

## 发布开源项目

在 `src/data/projects.ts` 里加一项（名称、仓库地址、中英文介绍、标签、状态）。如果写了介绍文章，填上 `post: '文章文件名'`，项目卡片会链接到它。

## 内容分发建议

- **先发在自己网站上**，再同步到掘金、知乎、V2EX、dev.to、Medium 等平台，并在文末注明原文链接。dev.to 和 Medium 支持设置 canonical URL，填 codes.im 的原文地址，搜索引擎的权重就会归到你的网站。
- 每篇文章至少关联 1–2 个站内工具（`tools` 字段或正文链接）。文章带来流量，工具留住用户。
- RSS 地址：`/zh/rss.xml` 和 `/en/rss.xml`，可以放在个人简介里供读者订阅。

## 分享预览图

文章设置了 `cover` 时，分享到微信、X 等平台会用封面图作为预览图。没有封面的文章，可以运行下面的命令，自动生成一张带标题的预览图（新增工具或示例页后也建议运行一次）：

```bash
pnpm add -D playwright && pnpm exec playwright install chromium   # 只需要第一次
pnpm og                     # 生成全部预览图到 public/og/
pnpm og blog--my-post       # 只生成某一页
```

不生成也没关系，没有专属预览图的页面会使用首页的预览图。

