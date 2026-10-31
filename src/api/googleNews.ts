// ------------------------------------------------------------------
// Google News RSS client for Kenya politics.
// The RSS feed is public and keyless, but does not send CORS headers,
// so a public read-only relay (allorigins.win) is used as a fallback.
// ------------------------------------------------------------------

export interface GoogleNewsItem {
  title: string;
  link: string;
  pubDate: number; // Unix ms
  source: string;
}

interface CacheEntry {
  data: GoogleNewsItem[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CacheEntry>();

const DIRECT_FEED =
  'https://news.google.com/rss/search?q=Kenya+politics&hl=en-KE&gl=KE&ceid=KE:en';

const RELAY_PREFIX = 'https://api.allorigins.win/raw?url=';

function parseRssItems(xml: string): GoogleNewsItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  if (doc.querySelector('parsererror')) return [];

  const items = Array.from(doc.getElementsByTagName('item'));
  const output: GoogleNewsItem[] = [];

  for (const item of items) {
    const title = item.getElementsByTagName('title')[0]?.textContent ?? '';
    const link = item.getElementsByTagName('link')[0]?.textContent ?? '';
    const pubRaw = item.getElementsByTagName('pubDate')[0]?.textContent ?? '';
    const sourceEl = item.getElementsByTagName('source')[0];
    const source = sourceEl?.textContent ?? '';

    if (!title || !link) continue;

    const parsedDate = pubRaw ? Date.parse(pubRaw) : NaN;

    output.push({
      title: title.trim(),
      link: link.trim(),
      pubDate: Number.isFinite(parsedDate) ? parsedDate : Date.now(),
      source: source.trim(),
    });
  }

  return output;
}

async function tryFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const text = await res.text();
    return text.includes('<rss') || text.includes('<item') ? text : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the latest Kenya politics headlines from Google News RSS.
 * Tries the direct feed first; if the browser blocks it (CORS),
 * retries once through the public relay. Returns [] on total failure.
 */
export async function fetchKenyaNewsHeadlines(): Promise<GoogleNewsItem[]> {
  const cacheKey = 'kenya-news';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const direct = await tryFetch(DIRECT_FEED);
  const xml = direct ?? (await tryFetch(RELAY_PREFIX + encodeURIComponent(DIRECT_FEED)));

  if (!xml) {
    cache.set(cacheKey, { data: [], fetchedAt: Date.now() });
    return [];
  }

  const items = parseRssItems(xml).slice(0, 20);
  cache.set(cacheKey, { data: items, fetchedAt: Date.now() });
  return items;
}
