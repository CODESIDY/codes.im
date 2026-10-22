#!/usr/bin/env node
// Generate social preview images (public/og/{lang}/{key}.jpg) for every page.
//
//   pnpm og
//
// How it works: builds the site with OG=1 into .og-build (which adds HTML templates under
// /og-template/), serves that folder locally, and screenshots each template with Playwright.
// Requires Playwright with Chromium:  pnpm add -D playwright && pnpm exec playwright install chromium
// Fonts: Chinese text needs a CJK font installed (macOS and Windows have one by default).

import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const root = process.cwd();
const build = join(root, '.og-build');
const outRoot = join(root, 'public', 'og');
const only = process.argv[2]; // optional filter, e.g. "http-status" or "zh/json-formatter"

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Run:\n  pnpm add -D playwright && pnpm exec playwright install chromium');
  process.exit(1);
}

console.log('Building templates…');
const r = spawnSync('npx', ['astro', 'build', '--outDir', build], { stdio: 'inherit', env: { ...process.env, OG: '1' }, shell: process.platform === 'win32' });
if (r.status !== 0) process.exit(r.status ?? 1);

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  let p = join(build, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' });
  createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const pages = [];
for (const lang of readdirSync(join(build, 'og-template'))) {
  for (const key of readdirSync(join(build, 'og-template', lang))) {
    if (!only || `${lang}/${key}`.includes(only)) pages.push({ lang, key });
  }
}
console.log(`Rendering ${pages.length} images…`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const { lang, key } of pages) {
  await page.goto(`http://localhost:${port}/og-template/${lang}/${key}/`);
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(join(outRoot, lang), { recursive: true });
  await page.screenshot({ path: join(outRoot, lang, `${key}.jpg`), type: 'jpeg', quality: 82 });
}
await browser.close();
server.close();
rmSync(build, { recursive: true, force: true });
console.log(`Done → public/og/ (${pages.length} images)`);
