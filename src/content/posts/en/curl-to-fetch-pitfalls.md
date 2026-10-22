---
title: 6 Pitfalls When Converting curl Commands to JavaScript fetch
description: The curl example from the API docs works, but your fetch call fails? A walk through the differences in method, Content-Type, query strings, auth, redirects and CORS.
date: 2026-10-05
category: web
kind: tutorial
tags: [curl, fetch, http, javascript]
tools: [curl-converter, url-encoder, base64]
---

Almost every API doc ships curl examples. They work instantly in the terminal, but rewrite them with `fetch` and you start getting 400s, 401s or CORS errors. Usually the reason is that curl quietly did something for you that `fetch` doesn’t.

## 1. `-d` silently turns the request into a POST

```bash
curl https://api.example.com/items -d 'name=book'
```

There’s no `-X POST` here, but any `-d` makes curl send a **POST**. Don’t forget it when rewriting:

```js
await fetch('https://api.example.com/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'name=book',
});
```

## 2. `-d` defaults to form encoding, not JSON

A common way to “send JSON”:

```bash
curl https://api.example.com/items -d '{"name":"book"}'
```

curl sends this with `Content-Type: application/x-www-form-urlencoded`, and many servers fail to parse it. Add the header explicitly, or use `--json` in newer versions of curl:

```bash
curl https://api.example.com/items \
  -H 'Content-Type: application/json' \
  -d '{"name":"book"}'
```

The `fetch` version needs the header too, plus `JSON.stringify`:

```js
await fetch('https://api.example.com/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'book' }),
});
```

## 3. `-G` moves the data into the URL

```bash
curl -G https://api.example.com/search -d q=café -d page=2
```

With `-G`, the `-d` values are appended to the URL and the request becomes a GET. In `fetch`, build the query with `URLSearchParams`, which encodes non-ASCII and special characters for you:

```js
const url = new URL('https://api.example.com/search');
url.search = new URLSearchParams({ q: 'café', page: '2' }).toString();
await fetch(url);
```

To see what a value looks like once encoded, check it in the [URL Encoder](/en/url-encoder/).

## 4. `-u` is Basic authentication

```bash
curl -u admin:secret https://api.example.com/me
```

`fetch` has no equivalent option, so build the `Authorization` header yourself: `username:password`, Base64-encoded:

```js
await fetch('https://api.example.com/me', {
  headers: { Authorization: 'Basic ' + btoa('admin:secret') },
});
```

Note that `btoa` only accepts Latin-1 characters. If the username or password contains other characters, convert to UTF-8 bytes first. The [Base64 encoder](/en/base64/) handles UTF-8 correctly.

## 5. Redirects and compression work the other way round

- curl **does not follow** redirects unless you pass `-L`; `fetch` **follows them by default**.
- curl only requests and decompresses gzip/br with `--compressed`; `fetch` in browsers and Node.js **handles it automatically**.

So `-L` and `--compressed` can usually just be dropped.

## 6. CORS and forbidden headers in the browser

This is the most common — and most confusing — one: **the same request succeeds in curl but fails in the browser**.

- Browsers enforce the same-origin policy. If the target server doesn’t send response headers such as `Access-Control-Allow-Origin`, the browser blocks the request. curl and server-side code are not subject to this.
- Browsers don’t let scripts set certain headers, such as `Cookie` and `Host`. curl’s `-b` (cookies) can’t be copied to front-end code as-is.
- curl’s `-k` (skip certificate verification) has no browser equivalent.

The fix is usually to configure CORS on the server, or to proxy the request through your own back end or a serverless function.

## Don’t want to do it by hand?

The [curl to Code converter](/en/curl-converter/) applies all of the rules above: it understands `-d`, `--json`, `-G`, `-u`, `-F` and multi-line commands, and generates JavaScript fetch, Python requests or Go code in one click. Afterwards, just double-check CORS and authentication for your runtime (browser or server).
