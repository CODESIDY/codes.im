// Unix file permission conversion: octal ↔ symbolic ↔ chmod commands.

export interface Perms {
  /** Owner, group, others — each a 3-bit rwx value. */
  user: number;
  group: number;
  other: number;
  setuid: boolean;
  setgid: boolean;
  sticky: boolean;
}

export const emptyPerms = (): Perms => ({ user: 0, group: 0, other: 0, setuid: false, setgid: false, sticky: false });

/** Parse "755", "0644", "4755" or "1777". */
export function fromOctal(s: string): Perms {
  const t = s.trim().replace(/^0o/i, '');
  if (!/^[0-7]{1,4}$/.test(t)) throw new Error('Octal mode must be 1–4 digits from 0 to 7');
  const d = t.padStart(4, '0').split('').map(Number);
  return { setuid: !!(d[0] & 4), setgid: !!(d[0] & 2), sticky: !!(d[0] & 1), user: d[1], group: d[2], other: d[3] };
}

export function toOctal(p: Perms, always4 = false): string {
  const special = (p.setuid ? 4 : 0) | (p.setgid ? 2 : 0) | (p.sticky ? 1 : 0);
  const base = `${p.user}${p.group}${p.other}`;
  return special || always4 ? `${special}${base}` : base;
}

const triad = (v: number, special: boolean, ch: 's' | 't') => {
  const x = v & 1 ? (special ? ch : 'x') : special ? ch.toUpperCase() : '-';
  return (v & 4 ? 'r' : '-') + (v & 2 ? 'w' : '-') + x;
};

/** "rwxr-xr-x" (9 characters, as shown by `ls -l` without the file-type character). */
export function toSymbolic(p: Perms): string {
  return triad(p.user, p.setuid, 's') + triad(p.group, p.setgid, 's') + triad(p.other, p.sticky, 't');
}

/** Parse "rwxr-xr-x" or "-rwxr-xr-x" / "drwxr-xr-x" from `ls -l`. */
export function fromSymbolic(s: string): Perms {
  let t = s.trim();
  if (t.length === 10) t = t.slice(1);
  if (!/^([r-][w-][xsS-]){2}[r-][w-][xtT-]$/.test(t)) throw new Error('Symbolic mode must look like rwxr-xr-x');
  const part = (i: number) => {
    const c = t.slice(i, i + 3);
    return (c[0] === 'r' ? 4 : 0) | (c[1] === 'w' ? 2 : 0) | ('xst'.includes(c[2]) ? 1 : 0);
  };
  const sp = (i: number) => /[sStT]/.test(t[i + 2]);
  return { user: part(0), group: part(3), other: part(6), setuid: sp(0), setgid: sp(3), sticky: sp(6) };
}

/** Explicit chmod form: "u=rwx,g=rx,o=rx". */
export function toAssignment(p: Perms): string {
  const s = (v: number) => (v & 4 ? 'r' : '') + (v & 2 ? 'w' : '') + (v & 1 ? 'x' : '');
  const parts = [`u=${s(p.user)}${p.setuid ? 's' : ''}`, `g=${s(p.group)}${p.setgid ? 's' : ''}`, `o=${s(p.other)}${p.sticky ? 't' : ''}`];
  return parts.join(',');
}

/** Apply a symbolic chmod expression such as "u+x,go-w" or "a=r" to existing permissions. */
export function applySymbolic(base: Perms, expr: string): Perms {
  const p = { ...base };
  for (const clause of expr.split(',').map((c) => c.trim()).filter(Boolean)) {
    const m = /^([ugoa]*)([+\-=])([rwxXst]*)$/.exec(clause);
    if (!m) throw new Error(`Invalid clause "${clause}"`);
    const who = (m[1] || 'a').replace('a', 'ugo');
    const bits = (m[3].includes('r') ? 4 : 0) | (m[3].includes('w') ? 2 : 0) | (/[xX]/.test(m[3]) ? 1 : 0);
    const op = m[2];
    const set = (cur: number) => (op === '+' ? cur | bits : op === '-' ? cur & ~bits : bits);
    if (who.includes('u')) p.user = set(p.user);
    if (who.includes('g')) p.group = set(p.group);
    if (who.includes('o')) p.other = set(p.other);
    const flag = (cur: boolean, on: boolean) => (op === '+' ? cur || on : op === '-' ? cur && !on : on);
    if (m[3].includes('s')) {
      if (who.includes('u')) p.setuid = flag(p.setuid, true);
      if (who.includes('g')) p.setgid = flag(p.setgid, true);
    } else if (op === '=') {
      if (who.includes('u')) p.setuid = false;
      if (who.includes('g')) p.setgid = false;
    }
    if (m[3].includes('t')) p.sticky = flag(p.sticky, true);
    else if (op === '=' && who.includes('o')) p.sticky = false;
  }
  return p;
}
