/** Save text as a file in the browser. `bom` prepends a UTF-8 BOM (for Excel CSV). */
export function downloadText(filename: string, text: string, mime = 'text/plain', bom = false) {
  const blob = new Blob([bom ? '\ufeff' + text : text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
