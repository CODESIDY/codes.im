---
title: 把 curl 命令改写成 fetch 时，最容易踩的 6 个坑
description: 接口文档里的 curl 一跑就通，改成 JavaScript fetch 却报错？逐个讲清楚请求方法、Content-Type、查询参数、认证、重定向和 CORS 的差异。
date: 2026-10-05
category: web
kind: tutorial
tags: [curl, fetch, http, javascript]
tools: [curl-converter, url-encoder, base64]
---

几乎所有 API 文档都会给出 curl 示例。在终端里一跑就通，可一改写成 `fetch`，就开始出现 400、401 或者 CORS 报错。原因通常是 curl 默认帮你做了一些事情，而 `fetch` 没有。

## 1. `-d` 会自动把请求变成 POST

```bash
curl https://api.example.com/items -d 'name=book'
```

这条命令没有写 `-X POST`，但只要带了 `-d`，curl 就会发送 **POST** 请求。改写时别忘了：

```js
await fetch('https://api.example.com/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'name=book',
});
```

## 2. `-d` 默认的 Content-Type 是表单，不是 JSON

很多人会这样发 JSON：

```bash
curl https://api.example.com/items -d '{"name":"book"}'
```

此时 curl 发送的 `Content-Type` 是 `application/x-www-form-urlencoded`，不少服务端会因此解析失败。正确写法是显式加请求头，或者使用较新版本 curl 支持的 `--json` 参数：

```bash
curl https://api.example.com/items \
  -H 'Content-Type: application/json' \
  -d '{"name":"book"}'
```

对应的 `fetch` 也要设置请求头，并用 `JSON.stringify` 序列化：

```js
await fetch('https://api.example.com/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'book' }),
});
```

## 3. `-G` 会把数据放进 URL

```bash
curl -G https://api.example.com/search -d q=你好 -d page=2
```

加了 `-G` 后，`-d` 的内容会拼接到 URL 上，变成 GET 请求。在 `fetch` 里推荐用 `URLSearchParams` 拼参数，它会自动处理中文和特殊字符的编码：

```js
const url = new URL('https://api.example.com/search');
url.search = new URLSearchParams({ q: '你好', page: '2' }).toString();
await fetch(url);
```

想看某个参数编码后的样子，可以用 [URL 编解码](/zh/url-encoder/) 对照一下。

## 4. `-u` 是 Basic 认证

```bash
curl -u admin:secret https://api.example.com/me
```

`fetch` 没有对应的参数，需要自己生成 `Authorization` 请求头，内容是 `用户名:密码` 的 Base64 编码：

```js
await fetch('https://api.example.com/me', {
  headers: { Authorization: 'Basic ' + btoa('admin:secret') },
});
```

注意 `btoa` 只支持 Latin-1 字符，如果用户名或密码里有中文，需要先转成 UTF-8 字节再编码。[Base64 编解码](/zh/base64/) 就是按 UTF-8 处理的。

## 5. 重定向和压缩：方向正好相反

- curl **默认不跟随**重定向，要加 `-L`；`fetch` **默认跟随**。
- curl 加 `--compressed` 才会请求并解压 gzip/br；浏览器和 Node.js 的 `fetch` 会**自动处理**。

所以 `-L` 和 `--compressed` 改写时通常可以直接删掉。

## 6. 浏览器里的 CORS 和受限请求头

这是最常见、也最让人困惑的一点：**同样的请求，curl 能成功，在浏览器里却失败**。

- 浏览器会执行同源策略。目标服务器没有返回允许跨域的 `Access-Control-Allow-Origin` 等响应头时，请求会被浏览器拦下；curl 和服务端代码不受这个限制。
- 浏览器不允许脚本设置某些请求头，比如 `Cookie`、`Host`。curl 里的 `-b`（Cookie）在前端无法照搬。
- curl 的 `-k`（跳过证书校验）在浏览器里没有对应选项。

解决办法通常是：让服务端配置 CORS，或者把请求放到自己的后端或 serverless 函数里转发。

## 不想手改？

[curl 转代码](/zh/curl-converter/) 会自动处理上面这些规则：识别 `-d`、`--json`、`-G`、`-u`、`-F`、多行命令等，一键生成 JavaScript fetch、Python requests 或 Go 代码。转换完成后，再根据运行环境（浏览器还是服务端）检查一下 CORS 和认证方式即可。
