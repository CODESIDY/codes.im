---
# 复制这个文件到 src/content/posts/zh/ 或 src/content/posts/en/，改个文件名就是一篇新文章。
# 文件名就是网址：zh/my-first-post.md → https://codes.im/zh/blog/my-first-post/
# 以 _ 开头的文件（比如本文件）不会被发布。
title: 文章标题
description: 一两句话的摘要，会显示在列表页、搜索结果和分享卡片里（建议 60–150 字）。
date: 2026-10-22
# updated: 2026-11-01
category: build # 分类：ai / web / tools / build（在 src/data/categories.ts 里修改）
kind: article # article = 文章，tutorial = 教程
# cover: ../images/my-cover.png  # 封面图（可选，图片放在 src/content/posts/images/，建议 1200×630）；不填会自动生成
# coverAlt: 封面图的文字说明
# featured: true                 # 置顶为博客首页的大卡片
tags: [build-in-public]
tools: [] # 文末推荐的工具，例如 [json-repair, token-counter]
# series: 从零做一个工具站   # 同一系列的文章会互相链接
draft: true # 草稿只在 npm run dev 时可见；写完改成 false 再发布
---

开头一段：这篇文章要解决什么问题，读者读完能得到什么。

## 第一个小标题

正文。二级、三级标题会自动生成右侧目录。

```ts
// 代码块会自动高亮，并跟随暗色模式
const hello = 'codes.im';
```

## 小结

总结要点，并引导读者去试用相关工具或订阅 RSS。
