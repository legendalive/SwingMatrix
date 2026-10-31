// ------------------------------------------------------------------
// GDELT Project DOC 2.0 API client.
// Public endpoint, no API key required.
// Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
// ------------------------------------------------------------------

export interface GdeltArticle {
  title: string;
  url: string;
  domain: string;
  publishedAt: number; // Unix ms
  language: string;
  sourceCountry: string;
}

interface CacheEntry {
  data: GdeltArticle[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map<string, CacheEntry>();

/**
 * Parse GDELT's compact "20250115T120000Z" timestamp into Unix ms.
 * Returns NaN if the format is unrecognised.
 */
function parseSeenDate(seen: string): number {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(seen);
  if (!match) return NaN;
  const [, y, mo, d, h, mi, s] = match;
  return Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s)
  );
}

/**
 * Fetch the most recent English-language political news articles about Kenya.
 * Cached for 15 minutes to avoid repeated calls while the user adjusts sliders.
 */
export async function fetchKenyaPoliticalNews(): Promise<GdeltArticle[]> {
  const cacheKey = 'kenya-politics';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const query = encodeURIComponent('Kenya politics sourcelang:english');
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc` +
    `?query=${query}` +
    `&mode=ArtList` +
    `&format=json` +
    `&maxrecords=20` +
    `&timespan=7d` +
    `&sort=datedesc`;

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(
      `GDELT request failed: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();

  // GDELT returns an empty body (not JSON) when the query yields zero hits.
  if (!text || text.trim().length === 0) {
    cache.set(cacheKey, { data: [], fetchedAt: Date.now() });
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  const articlesRaw =
    typeof parsed === 'object' && parsed !== null && 'articles' in parsed
      ? (parsed as { articles?: unknown }).articles
      : undefined;

  if (!Array.isArray(articlesRaw)) return [];

  const articles: GdeltArticle[] = [];
  for (const row of articlesRaw as Array<Record<string, unknown>>) {
    const title = typeof row.title === 'string' ? row.title : '';
    const link = typeof row.url === 'string' ? row.url : '';
    if (!title || !link) continue;

    const seen =
      typeof row.seendate === 'string' ? parseSeenDate(row.seendate) : NaN;

    articles.push({
      title,
      url: link,
      domain: typeof row.domain === 'string' ? row.domain : '',
      publishedAt: Number.isFinite(seen) ? seen : Date.now(),
      language: typeof row.language === 'string' ? row.language : '',
      sourceCountry:
        typeof row.sourcecountry === 'string' ? row.sourcecountry : '',
    });
  }

  cache.set(cacheKey, { data: articles, fetchedAt: Date.now() });
  return articles;
}
