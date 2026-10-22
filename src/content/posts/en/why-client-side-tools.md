---
title: Why Every Tool on codes.im Runs in Your Browser
description: Developers paste tokens, logs and customer data into online tools every day. The reasoning behind “your data never leaves the browser”, how it’s built, and what it costs.
date: 2026-10-20
category: build
kind: article
tags: [build-in-public, privacy, astro]
tools: [jwt-decoder, json-formatter, token-counter]
---

When I started codes.im, I set myself one rule: **every tool runs entirely in the browser, and nothing you type is sent to a server.** This post explains why, and what that decision gives and takes away.

## What we paste into online tools

Think about how you use online tools day to day:

- You paste a production API response into a JSON formatter — and it may contain customers’ phone numbers and addresses;
- You decode a JWT to check when it expires — and that token *is* a login credential;
- You diff two config files — which may include database connection strings;
- You count the tokens in a prompt — which may contain internal company documents.

If a tool sends this to a server for processing, you have no way of knowing whether it’s logged, how long it’s kept, or whether it ends up in some log or analytics system.

## What “runs locally” means

On codes.im, all the work is done by JavaScript in the page:

- The **JSON Formatter** uses the browser’s built-in `JSON.parse`;
- The **Hash Generator** uses the browser’s Web Crypto API;
- The **Token Counter** uses an open-source tokenizer library that is downloaded once and then runs entirely offline;
- The site itself is static, with no back-end endpoint that receives user input.

You can check this yourself: open the Network tab in your browser’s developer tools and use any tool. Typing input doesn’t trigger a single request.

## Bonus benefits

**Speed.** No network round-trips — results appear as you type.

**Stability and cost.** Static pages can be served from a CDN with almost no server cost, and traffic spikes are no problem. That’s what lets the site stay free for the long run.

**Auditability.** The code is open source, so anyone can check what each tool actually does.

## The costs and trade-offs

The rule has limits:

- **How much data you can process depends on your device.** A few megabytes of JSON is fine, but very large files are bounded by browser memory;
- **Some pages are heavier.** The Token Counter’s tokenizer data is several megabytes, so it is loaded only when you open that page and doesn’t slow down the rest of the site;
- **Some things can’t be done.** Tools that need to fetch third-party websites (say, “scrape a web page”) run into the browser’s cross-origin restrictions and can’t be built purely in the front end;
- **No cloud sync.** A few tools, such as the Markdown Editor, keep drafts in your own browser’s local storage, but nothing syncs between devices.

For developer tools, I think these costs are well worth it.

## What’s next

codes.im will keep adding tools under the same rule — especially the ones you reach for when building LLM applications: JSON repair, structured outputs, streaming-response debugging and more. If there’s a tool you’d like to see, open an issue on GitHub.
