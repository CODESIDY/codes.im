// Tool page behaviour: favorite button, recent history, and shareable state links.
import { decodeState, encodeState, type FieldState } from '../lib/share-state';
import { copyText } from './copy';
import { isFavorite, recordVisit, toggleFavorite } from './prefs';
import { detectPayload, targetState, targetsFor } from '../data/chain';

const page = document.querySelector<HTMLElement>('[data-tool-slug]');

if (page) {
  const slug = page.dataset.toolSlug!;
  recordVisit(slug);

  // ---------- favorite ----------
  const fav = document.querySelector<HTMLButtonElement>('[data-fav]');
  const paintFav = (on: boolean) => {
    if (!fav) return;
    fav.setAttribute('aria-pressed', String(on));
    fav.querySelector('[data-fav-label]')!.textContent = on ? fav.dataset.on! : fav.dataset.off!;
  };
  paintFav(isFavorite(slug));
  fav?.addEventListener('click', () => paintFav(toggleFavorite(slug)));

  // ---------- share ----------
  const widget = document.getElementById('tool-widget')!;
  type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const SKIP = new Set(['file', 'button', 'submit', 'reset', 'hidden', 'password']);

  const fields = () =>
    [...widget.querySelectorAll<Field>('input, textarea, select')].filter(
      (el) => !(el instanceof HTMLInputElement && SKIP.has(el.type)) && !el.hasAttribute('readonly') && !el.disabled,
    );
  const keyOf = (el: Field) => (el.id ? `#${el.id}` : el.name ? (el instanceof HTMLInputElement && el.type === 'radio' ? `${el.name}=${el.value}` : el.name) : '');

  function collect(): FieldState {
    const state: FieldState = {};
    for (const el of fields()) {
      const k = keyOf(el);
      if (!k) continue;
      if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
        if (el.checked !== el.defaultChecked) state[k] = el.checked;
      } else if (el.value !== (el instanceof HTMLSelectElement ? '' : el.defaultValue) || el instanceof HTMLSelectElement) {
        state[k] = el.value;
      }
    }
    return state;
  }

  function restore(state: FieldState) {
    const els = fields();
    // Radios and checkboxes first (they often switch modes), then values.
    const order = [...els].sort((a, b) => Number(b instanceof HTMLInputElement && (b.type === 'radio' || b.type === 'checkbox')) - Number(a instanceof HTMLInputElement && (a.type === 'radio' || a.type === 'checkbox')));
    for (const el of order) {
      const k = keyOf(el);
      if (!k || !(k in state)) continue;
      const v = state[k];
      if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
        if (el.checked === v) continue;
        el.checked = !!v;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = String(v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  const shareBtn = document.querySelector<HTMLButtonElement>('[data-share]');
  shareBtn?.addEventListener('click', async () => {
    const encoded = await encodeState(collect());
    const url = `${location.origin}${location.pathname}#s=${encoded}`;
    history.replaceState(null, '', `#s=${encoded}`);
    copyText(url, shareBtn, shareBtn.dataset.done);
  });

  // ---------- send to another tool ----------
  const chainBtn = document.querySelector<HTMLButtonElement>('[data-chain]');
  const chainMenu = document.querySelector<HTMLElement>('[data-chain-menu]');
  const toolNames = new Map<string, { name: string; glyph: string; href: string }>(
    (JSON.parse(document.getElementById('tool-index')?.textContent || '[]') as { type: string; slug: string; name: string; glyph: string; href: string }[])
      .filter((e) => e.type === 'tool')
      .map((e) => [e.slug, e]),
  );
  const closeChain = () => {
    if (!chainMenu || !chainBtn) return;
    chainMenu.hidden = true;
    chainBtn.setAttribute('aria-expanded', 'false');
  };
  chainBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!chainMenu) return;
    if (!chainMenu.hidden) return closeChain();
    const el = document.querySelector<HTMLElement>(chainBtn.dataset.chain!);
    const value = el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement ? el.value : (el?.textContent ?? '');
    const targets = targetsFor(slug, detectPayload(value));
    chainMenu.replaceChildren();
    if (!targets.length) {
      const p = document.createElement('p');
      p.className = 'px-3 py-2 text-xs text-zinc-500';
      p.textContent = chainMenu.dataset.empty!;
      chainMenu.append(p);
    } else {
      const h = document.createElement('p');
      h.className = 'px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase';
      h.textContent = chainMenu.dataset.title!;
      chainMenu.append(h);
      for (const t of targets) {
        const info = toolNames.get(t.slug);
        if (!info) continue;
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'menuitem');
        b.className = 'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800';
        const g = document.createElement('span');
        g.className = 'grid h-6 w-8 shrink-0 place-items-center rounded bg-brand-50 font-mono text-[10px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400';
        g.textContent = info.glyph;
        const n = document.createElement('span');
        n.className = 'truncate text-zinc-800 dark:text-zinc-100';
        n.textContent = info.name;
        b.append(g, n);
        b.addEventListener('click', async () => {
          location.href = `${info.href}#s=${await encodeState(targetState(t, value))}&from=${encodeURIComponent(slug)}`;
        });
        chainMenu.append(b);
      }
    }
    chainMenu.hidden = false;
    chainBtn.setAttribute('aria-expanded', 'true');
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('[data-chain-wrap]')) closeChain();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChain();
  });

  const m = /^#s=([^&]+)(?:&from=([\w-]+))?$/.exec(location.hash);
  const preset = document.querySelector<HTMLElement>('[data-preset-state]');
  if (preset && !m) {
    // Example pages (e.g. /cron-parser/every-5-minutes/) prefill the tool.
    setTimeout(() => {
      try {
        restore(JSON.parse(preset.dataset.presetState!));
      } catch {
        /* ignore */
      }
    }, 0);
  }
  if (m) {
    // Let the widget scripts initialise first, then apply the shared state on top.
    setTimeout(async () => {
      try {
        restore(await decodeState(m[1]));
        const note = document.querySelector<HTMLElement>('[data-share-loaded]');
        if (note) {
          const from = m[2] && toolNames.get(m[2]);
          if (from) note.textContent = note.dataset.chainMsg!.replace('{tool}', from.name);
          note.hidden = false;
        }
      } catch {
        /* ignore malformed links */
      }
    }, 0);
  }
}
