// Per-browser favorites and recently used tools (localStorage, best effort).

const FAV = 'codes.favorites';
const RECENT = 'codes.recent';
const MAX_RECENT = 8;

function read(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function write(key: string, v: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

export const getFavorites = () => read(FAV);
export const getRecent = () => read(RECENT);
export const isFavorite = (slug: string) => getFavorites().includes(slug);

export function toggleFavorite(slug: string): boolean {
  const favs = getFavorites();
  const on = !favs.includes(slug);
  write(FAV, on ? [slug, ...favs] : favs.filter((s) => s !== slug));
  return on;
}

export function recordVisit(slug: string) {
  write(RECENT, [slug, ...getRecent().filter((s) => s !== slug)].slice(0, MAX_RECENT));
}

export const clearRecent = () => write(RECENT, []);
