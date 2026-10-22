/** Copy text to the clipboard and briefly show "Copied!" on the button. */
export async function copyText(text: string, btn?: HTMLElement, label?: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  if (btn) flash(btn, label);
}

/** Swap a button's label to "Copied!" for a moment. */
export function flash(btn: HTMLElement, text?: string) {
  const label = text ?? document.body.dataset.copiedLabel ?? 'Copied!';
  if (btn.dataset.original === undefined) btn.dataset.original = btn.innerHTML;
  btn.textContent = label;
  btn.classList.add('!text-brand-600', 'dark:!text-brand-400');
  clearTimeout(Number(btn.dataset.timer));
  btn.dataset.timer = String(
    window.setTimeout(() => {
      btn.innerHTML = btn.dataset.original!;
      delete btn.dataset.original;
      btn.classList.remove('!text-brand-600', 'dark:!text-brand-400');
    }, 1200),
  );
}
