// Site-wide behaviour: theme toggle, copy buttons, tool search.

// ---------- theme ----------
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  });
});

// ---------- copy ----------
import { copyText } from './copy';

// <button data-copy="#selector"> copies the value/text of the target;
// <button data-copy-text="literal"> copies the literal.
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-copy],[data-copy-text]');
  if (!btn) return;
  let text = btn.dataset.copyText;
  if (text === undefined) {
    const el = document.querySelector<HTMLElement>(btn.dataset.copy!);
    if (!el) return;
    text = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : (el.textContent ?? '');
  }
  if (text) copyText(text, btn);
});

// ---------- search ----------
import { getFavorites, getRecent } from './prefs';

interface Entry {
  name: string;
  description: string;
  keywords: string;
  href: string;
  glyph: string;
  slug: string;
  type: 'tool' | 'post' | 'ref';
}

const input = document.querySelector<HTMLInputElement>('#tool-search');
const list = document.querySelector<HTMLUListElement>('#tool-search-results');
const indexEl = document.querySelector('#tool-index');

if (input && list && indexEl) {
  const entries: Entry[] = JSON.parse(indexEl.textContent || '[]');
  const label = list.dataset;
  let active = 0;
  let current: Entry[] = [];

  const score = (e: Entry, q: string) => {
    const name = e.name.toLowerCase();
    if (name.startsWith(q)) return 3;
    if (name.includes(q)) return 2;
    if (e.keywords.includes(q)) return 1;
    const d = e.description.toLowerCase();
    // ASCII queries must match at a word start ("cron" should not match "acronyms"); CJK can match anywhere.
    const i = d.indexOf(q);
    if (i >= 0 && (/[^\x00-\x7f]/.test(q) || i === 0 || !/[a-z0-9]/.test(d[i - 1]))) return 1;
    return 0;
  };

  /** Groups of [heading, entries] for the current query. */
  const groups = (q: string): [string, Entry[]][] => {
    const tools = entries.filter((e) => e.type === 'tool');
    if (!q) {
      const mine = [...new Set([...getFavorites(), ...getRecent()])]
        .map((s) => tools.find((e) => e.slug === s))
        .filter((e): e is Entry => !!e);
      return [
        [label.recent ?? '', mine],
        [label.tools ?? '', tools.filter((e) => !mine.includes(e))],
      ];
    }
    const rank = (list: Entry[]) =>
      list
        .map((e) => [e, score(e, q)] as const)
        .filter(([, s]) => s > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([e]) => e);
    return [
      [label.tools ?? '', rank(tools)],
      [label.refs ?? '', rank(entries.filter((e) => e.type === 'ref')).slice(0, 5)],
      [label.posts ?? '', rank(entries.filter((e) => e.type === 'post')).slice(0, 5)],
    ];
  };

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const gs = groups(q).filter(([, l]) => l.length);
    current = gs.flatMap(([, l]) => l);
    active = Math.min(active, Math.max(current.length - 1, 0));
    list.replaceChildren();
    if (!current.length) {
      const li = document.createElement('li');
      li.className = 'px-3 py-2 text-sm text-zinc-500';
      li.textContent = label.empty ?? 'No results';
      list.append(li);
    }
    let i = 0;
    for (const [heading, items] of gs) {
      const h = document.createElement('li');
      h.className = 'px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase';
      h.textContent = heading;
      list.append(h);
      for (const e of items) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = e.href;
        a.className =
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm ' +
          (i === active ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60');
        const g = document.createElement('span');
        g.className =
          'grid h-7 w-9 shrink-0 place-items-center rounded font-mono text-[11px] font-semibold ' +
          (e.type !== 'tool' ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400');
        g.textContent = e.glyph;
        const n = document.createElement('span');
        n.className = 'min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-100';
        n.textContent = e.name;
        a.append(g, n);
        li.append(a);
        list.append(li);
        if (i === active) queueMicrotask(() => a.scrollIntoView({ block: 'nearest' }));
        i++;
      }
    }
    list.hidden = false;
  };

  const close = () => {
    list.hidden = true;
  };

  input.addEventListener('focus', render);
  input.addEventListener('input', () => {
    active = 0;
    render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = Math.min(active + 1, current.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      render();
    } else if (e.key === 'Enter' && current[active]) {
      location.href = current[active].href;
    } else if (e.key === 'Escape') {
      input.blur();
      close();
    }
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('#tool-search-wrap')) close();
  });
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}
