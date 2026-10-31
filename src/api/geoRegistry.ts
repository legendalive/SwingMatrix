// ------------------------------------------------------------------
// Hierarchical geo registry loader.
//
// Source of truth: /public/wards-2022.json, generated from the
// CitizenGuide ward export (free, IEBC-derived). The expected
// schema is documented in the repository README.
//
// If the file is absent, malformed, or unreachable, the loader
// returns a county-only fallback built from the existing
// KENYA_COUNTIES constant. The app never has a moment where no
// registry exists.
//
// Caching: localStorage with a 30-day freshness window. A stale
// cache is served immediately and a background refresh is kicked
// off so the UI never blocks on the network.
// ------------------------------------------------------------------

import { create } from 'zustand';
import type {
  GeoRegistry,
  County,
  Constituency,
  Ward,
} from '../types/geography';
import { buildCountyFallback } from '../data/countyFallback';

const DATA_URL = './wards-2022.json';
const CACHE_KEY = 'swingmatrix.geoRegistry.v1';
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface GeoRegistryStore {
  registry: GeoRegistry | null;
  status: 'idle' | 'loading' | 'ok' | 'fallback';
  error: string | null;
  load: () => Promise<void>;
}

export const useGeoRegistry = create<GeoRegistryStore>((set, get) => ({
  registry: null,
  status: 'idle',
  error: null,
  load: async () => {
    const current = get().status;
    if (current === 'loading' || current === 'ok' || current === 'fallback') {
      return;
    }
    set({ status: 'loading', error: null });

    const cached = readCache();
    if (cached && Date.now() - cached.loadedAt < CACHE_MAX_AGE_MS) {
      set({ registry: cached, status: 'ok' });
      void refreshInBackground();
      return;
    }

    try {
      const fresh = await fetchRegistry();
      writeCache(fresh);
      set({ registry: fresh, status: 'ok' });
    } catch (err) {
      const fallback = buildCountyFallback();
      set({
        registry: fallback,
        status: 'fallback',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
}));

async function fetchRegistry(): Promise<GeoRegistry> {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Ward file not available (HTTP ${res.status})`);
  }
  const raw = (await res.json()) as unknown;
  return validateRegistry(raw);
}

function validateRegistry(raw: unknown): GeoRegistry {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Ward file is not a JSON object');
  }
  const obj = raw as Record<string, unknown>;

  const counties = Array.isArray(obj.counties)
    ? (obj.counties as County[])
    : [];
  const constituencies = Array.isArray(obj.constituencies)
    ? (obj.constituencies as Constituency[])
    : [];
  const wards = Array.isArray(obj.wards) ? (obj.wards as Ward[]) : [];

  if (constituencies.length === 0 || wards.length === 0) {
    throw new Error('Ward file must include constituencies and wards');
  }

  const wardVoterTotal = wards.reduce(
    (sum, w) => sum + (Number(w.registeredVoters) || 0),
    0
  );

  return {
    counties,
    constituencies,
    wards,
    loadedAt: Date.now(),
    source: 'live',
    wardVoterTotal,
  };
}

function readCache(): GeoRegistry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: GeoRegistry; savedAt: number };
    if (!parsed.data || !Array.isArray(parsed.data.wards)) return null;
    return { ...parsed.data, source: 'cache' };
  } catch {
    return null;
  }
}

function writeCache(registry: GeoRegistry) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: registry, savedAt: Date.now() })
    );
  } catch {
    // Quota exceeded — silently skip. Registry is still in memory.
  }
}

async function refreshInBackground() {
  try {
    const fresh = await fetchRegistry();
    writeCache(fresh);
    useGeoRegistry.setState({ registry: fresh, status: 'ok' });
  } catch {
    // Silent — stale cache remains in place.
  }
}

// ---- Synchronous accessors ----
// Intended to be called from engine and selector code once the
// registry has been loaded. Return empty arrays before load.

export function getGeoRegistry(): GeoRegistry | null {
  return useGeoRegistry.getState().registry;
}

export function getCounties(): County[] {
  return getGeoRegistry()?.counties ?? [];
}

export function getConstituenciesInCounty(countyCode: string): Constituency[] {
  const reg = getGeoRegistry();
  if (!reg) return [];
  return reg.constituencies.filter(c => c.countyCode === countyCode);
}

export function getWardsInConstituency(constituencyCode: string): Ward[] {
  const reg = getGeoRegistry();
  if (!reg) return [];
  return reg.wards.filter(w => w.constituencyCode === constituencyCode);
}

export function findWard(wardCode: string): Ward | undefined {
  return getGeoRegistry()?.wards.find(w => w.code === wardCode);
}

export function findConstituency(code: string): Constituency | undefined {
  return getGeoRegistry()?.constituencies.find(c => c.code === code);
}
