/** Escape HTML and turn `backticks` into <code> — enough markup for tool docs. */
export function inlineCode(s: string): string {
  const escaped = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** Strip the backticks for plain-text contexts such as JSON-LD. */
export function plain(s: string): string {
  return s.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');
}
