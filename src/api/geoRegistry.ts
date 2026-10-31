// ------------------------------------------------------------------
// Hierarchical geo registry loader — single-file mode.
//
// Reads /public/wards-2022.json, which contains the full registry
// (47 counties, 290 constituencies, 1,450 wards) in one JSON file
// of approximately 156 KB. Fetch once, cache in localStorage for
// 30 days, validate, and expose synchronous accessors.
//
// If the file is absent or malformed, the loader returns a
// county-only fallback built from the existing KENYA_COUNTIES
// constant. The app never has a moment without a registry.
//
// Validation is permissive: records missing required fields are
// dropped, cross-reference failures are logged but do not abort.
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

// ---- Fetch ----

interface RawRegistry {
  counties?: County[];
  constituencies?: Constituency[];
  wards?: Ward[];
}

async function fetchRegistry(): Promise<GeoRegistry> {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Ward file not available (HTTP ${res.status})`);
  }
  const raw = (await res.json()) as unknown;
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Ward file is not a JSON object');
  }
  const obj = raw as RawRegistry;
  return buildRegistry(obj);
}

function buildRegistry(raw: RawRegistry): GeoRegistry {
  const counties = dedupeByCode(
    (raw.counties ?? []).map(normaliseCounty).filter(isDefined)
  );
  const constituencies = dedupeByCode(
    (raw.constituencies ?? []).map(normaliseConstituency).filter(isDefined)
  );
  const wards = dedupeByCode(
    (raw.wards ?? []).map(normaliseWard).filter(isDefined)
  );

  if (constituencies.length === 0 && wards.length === 0) {
    throw new Error('Registry contained no constituencies or wards');
  }

  warnOnOrphans(wards, constituencies, counties);

  const wardVoterTotal = wards.reduce(
    (sum, w) => sum + w.registeredVoters,
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

// ---- Normalisation ----

function isDefined<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}

function normaliseCounty(raw: unknown): County | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const code = stringOf(r.code);
  const name = stringOf(r.name);
  if (!code || !name) return null;
  return {
    code,
    name,
    registeredVoters: numberOf(r.registeredVoters),
  };
}

function normaliseConstituency(raw: unknown): Constituency | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const code = stringOf(r.code);
  const name = stringOf(r.name);
  const countyCode = stringOf(r.countyCode);
  if (!code || !name || !countyCode) return null;
  return {
    code,
    name,
    countyCode,
    registeredVoters: numberOf(r.registeredVoters),
  };
}

function normaliseWard(raw: unknown): Ward | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const code = stringOf(r.code);
  const name = stringOf(r.name);
  const constituencyCode = stringOf(r.constituencyCode);
  const countyCode = stringOf(r.countyCode);
  if (!code || !name || !constituencyCode || !countyCode) return null;
  return {
    code,
    name,
    constituencyCode,
    countyCode,
    registeredVoters: numberOf(r.registeredVoters),
  };
}

function stringOf(v: unknown): string | null {
  if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  if (typeof v === 'number') return String(v);
  return null;
}

function numberOf(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const parsed = Number(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function dedupeByCode<T extends { code: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    if (!seen.has(item.code)) seen.set(item.code, item);
  }
  return Array.from(seen.values());
}

function warnOnOrphans(
  wards: Ward[],
  constituencies: Constituency[],
  counties: County[]
) {
  const cCodes = new Set(constituencies.map(c => c.code));
  const kCodes = new Set(counties.map(c => c.code));
  const orphanWards = wards.filter(w => !cCodes.has(w.constituencyCode));
  const orphanConstituencies = constituencies.filter(
    c => !kCodes.has(c.countyCode)
  );
  if (orphanWards.length > 0) {
    console.warn(
      `[geoRegistry] ${orphanWards.length} ward(s) reference a missing constituency.`,
      orphanWards.slice(0, 5).map(w => w.code)
    );
  }
  if (orphanConstituencies.length > 0) {
    console.warn(
      `[geoRegistry] ${orphanConstituencies.length} constituency/ies reference a missing county.`,
      orphanConstituencies.slice(0, 5).map(c => c.code)
    );
  }
}

// ---- Cache ----

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
    // Quota exceeded — skip. Registry remains in memory.
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
