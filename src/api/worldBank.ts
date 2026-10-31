// ------------------------------------------------------------------
// World Bank Indicators API client (Kenya).
// Public endpoint, no API key required.
// Docs: https://datahelpdesk.worldbank.org/knowledgebase/topics/125589
// ------------------------------------------------------------------

export interface WorldBankPoint {
  year: number;
  value: number;
}

interface CacheEntry {
  data: WorldBankPoint[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, CacheEntry>();

/**
 * Fetch a yearly series for Kenya for the given indicator code.
 * Null observations are dropped. Results are sorted ascending by year.
 * A 24-hour in-memory cache prevents hammering the API on slider drags.
 */
export async function fetchWorldBankIndicator(
  indicatorCode: string
): Promise<WorldBankPoint[]> {
  const cached = cache.get(indicatorCode);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const url =
    `https://api.worldbank.org/v2/country/KE/indicator/${encodeURIComponent(
      indicatorCode
    )}?format=json&per_page=60`;

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(
      `World Bank request failed: ${response.status} ${response.statusText}`
    );
  }

  const payload: unknown = await response.json();

  // The API returns [meta, data[]] when successful, or [ { message: [...] } ]
  // when the indicator is unknown. Guard against both shapes.
  if (!Array.isArray(payload) || payload.length < 2 || !Array.isArray(payload[1])) {
    return [];
  }

  const raw = payload[1] as Array<{ date?: string; value?: number | null }>;
  const points: WorldBankPoint[] = [];

  for (const row of raw) {
    if (row.value === null || row.value === undefined) continue;
    const year = Number(row.date);
    if (!Number.isFinite(year)) continue;
    points.push({ year, value: row.value });
  }

  points.sort((a, b) => a.year - b.year);

  cache.set(indicatorCode, { data: points, fetchedAt: Date.now() });
  return points;
}

/** Return the most recent non-null observation, or null if none exists. */
export function latestValue(points: WorldBankPoint[]): WorldBankPoint | null {
  if (points.length === 0) return null;
  return points[points.length - 1];
}

/** Human-readable timestamp of the last successful fetch for an indicator. */
export function getCachedAt(indicatorCode: string): number | null {
  return cache.get(indicatorCode)?.fetchedAt ?? null;
}
