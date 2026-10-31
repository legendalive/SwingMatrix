// ------------------------------------------------------------------
// Hierarchical geo registry loader.
//
// Accepts two data formats:
//
//   1. Native — an object of { counties, constituencies, wards }
//      where every entity has a code. This is the format this
//      loader produces when writing back to localStorage.
//
//   2. CitizenGuide — a flat array of ward records from the
//      CitizenGuide.KE open dataset, with fields ward_code, name,
//      constituency_name, county_name, registered_voters_2022.
//      Constituency codes are not provided; the loader generates
//      them deterministically as KC{countyCode}-{seq}, where seq
//      is assigned alphabetically within each county.
//
// County names in CitizenGuide data use variants that do not match
// the KENYA_COUNTIES constants exactly (hyphen vs en-dash vs space,
// "Nairobi" vs "Nairobi City", "Trans-Nzoia" vs "Trans Nzoia", etc.).
// A normalisation pass resolves these against a lookup built from
// the constants.
//
// Records that cannot be resolved to a county are dropped with a
// console warning. Ward codes longer than four characters are
// truncated to their first four characters (fixes a known data
// quality issue in the CitizenGuide export). Null or missing voter
// counts are set to zero.
// ------------------------------------------------------------------

import { create } from 'zustand';
import type {
  GeoRegistry,
  County,
  Constituency,
  Ward,
} from '../types/geography';
import { buildCountyFallback } from '../data/countyFallback';
import { KENYA_COUNTIES } from '../constants/kenya';

const DATA_URL = './wards-2022.json';
const CACHE_KEY = 'swingmatrix.geoRegistry.v2';
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
      // eslint-disable-next-line no-console
      console.info(
        `[geoRegistry] loaded ${fresh.wards.length} wards, ` +
          `${fresh.constituencies.length} constituencies, ` +
          `${fresh.counties.length} counties (${fresh.source}). ` +
          `Ward voter total: ${fresh.wardVoterTotal.toLocaleString()}`
      );
    } catch (err) {
      const fallback = buildCountyFallback();
      set({
        registry: fallback,
        status: 'fallback',
        error: err instanceof Error ? err.message : String(err),
      });
      // eslint-disable-next-line no-console
      console.warn('[geoRegistry] fallback to county-only:', err);
    }
  },
}));

// ---- Fetch and format detection ----

async function fetchRegistry(): Promise<GeoRegistry> {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Ward file not available (HTTP ${res.status})`);
  }
  const raw = (await res.json()) as unknown;

  if (Array.isArray(raw)) {
    return buildFromCitizenGuide(raw);
  }
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as { counties?: unknown; constituencies?: unknown; wards?: unknown };
    if (Array.isArray(obj.wards) && Array.isArray(obj.constituencies)) {
      return buildFromNative(obj as RawNative);
    }
  }
  throw new Error('Ward file format not recognised');
}

// ---- Native format ----

interface RawNative {
  counties?: County[];
  constituencies?: Constituency[];
  wards?: Ward[];
}

function buildFromNative(raw: RawNative): GeoRegistry {
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
    throw new Error('Native registry contained no constituencies or wards');
  }

  const wardVoterTotal = wards.reduce((sum, w) => sum + w.registeredVoters, 0);

  return {
    counties,
    constituencies,
    wards,
    loadedAt: Date.now(),
    source: 'live',
    wardVoterTotal,
  };
}

function normaliseCounty(raw: unknown): County | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const code = stringOf(r.code);
  const name = stringOf(r.name);
  if (!code || !name) return null;
  return { code, name, registeredVoters: numberOf(r.registeredVoters) };
}

function normaliseConstituency(raw: unknown): Constituency | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const code = stringOf(r.code);
  const name = stringOf(r.name);
  const countyCode = stringOf(r.countyCode);
  if (!code || !name || !countyCode) return null;
  return { code, name, countyCode, registeredVoters: numberOf(r.registeredVoters) };
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

// ---- CitizenGuide format ----

interface CGRecord {
  ward_code?: unknown;
  name?: unknown;
  constituency_name?: unknown;
  county_name?: unknown;
  registered_voters_2022?: unknown;
}

function buildFromCitizenGuide(records: unknown[]): GeoRegistry {
  const lookup = buildCountyAliasLookup();

  // First pass: resolve each record's county code, collecting any that
  // cannot be resolved so we can warn about them once.
  interface ParsedRecord {
    wardCode: string;
    wardName: string;
    constituencyName: string;
    countyCode: string;
    countyName: string;
    voters: number;
  }
  const parsed: ParsedRecord[] = [];
  const unresolvedCounties = new Set<string>();
  let brokenCodeCount = 0;

  for (const raw of records) {
    const r = raw as CGRecord;
    const rawWardCode = stringOf(r.ward_code);
    const wardName = stringOf(r.name);
    const constituencyName = stringOf(r.constituency_name);
    const countyName = stringOf(r.county_name);
    if (!rawWardCode || !wardName || !constituencyName || !countyName) continue;

    let wardCode = rawWardCode;
    if (wardCode.length > 4) {
      brokenCodeCount++;
      wardCode = wardCode.slice(0, 4);
    }

    const county = lookup.get(normaliseCountyName(countyName));
    if (!county) {
      unresolvedCounties.add(countyName);
      continue;
    }

    parsed.push({
      wardCode,
      wardName,
      constituencyName,
      countyCode: county.code,
      countyName: county.name,
      voters: numberOf(r.registered_voters_2022),
    });
  }

  if (parsed.length === 0) {
    throw new Error(
      `No records could be parsed. Unresolved counties: ${Array.from(unresolvedCounties).join(', ')}`
    );
  }
  if (unresolvedCounties.size > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[geoRegistry] dropped records for unrecognised counties: ${Array.from(unresolvedCounties).join(', ')}`
    );
  }
  if (brokenCodeCount > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[geoRegistry] truncated ${brokenCodeCount} malformed ward code(s) to four characters.`
    );
  }

  // Second pass: build the constituency registry by grouping
  // (countyCode, constituencyName) pairs. Assign a deterministic
  // code KC{countyCode}-{seq} where seq is alphabetical within the county.
  const constituencyKeyToRecord = new Map<string, ParsedRecord[]>();
  for (const p of parsed) {
    const key = `${p.countyCode}|${p.constituencyName}`;
    if (!constituencyKeyToRecord.has(key)) constituencyKeyToRecord.set(key, []);
    constituencyKeyToRecord.get(key)!.push(p);
  }

  interface ConstituencyBuild {
    countyCode: string;
    name: string;
    code: string;
    wards: ParsedRecord[];
    voters: number;
  }
  const constituencyBuilds: ConstituencyBuild[] = [];
  const constituencyNameToCode = new Map<string, string>();

  // Group by county first, then alphabetical within county.
  const byCounty = new Map<string, ConstituencyBuild[]>();
  for (const [key, recs] of constituencyKeyToRecord) {
    const countyCode = key.split('|')[0];
    const name = key.split('|')[1];
    const build: ConstituencyBuild = {
      countyCode,
      name,
      code: '',
      wards: recs,
      voters: recs.reduce((sum, r) => sum + r.voters, 0),
    };
    if (!byCounty.has(countyCode)) byCounty.set(countyCode, []);
    byCounty.get(countyCode)!.push(build);
  }
  for (const [, builds] of byCounty) {
    builds.sort((a, b) => a.name.localeCompare(b.name));
    builds.forEach((b, i) => {
      b.code = `KC${b.countyCode}-${String(i + 1).padStart(2, '0')}`;
      constituencyNameToCode.set(`${b.countyCode}|${b.name}`, b.code);
      constituencyBuilds.push(b);
    });
  }

  // Assemble final entities.
  const countiesUsed = new Set(parsed.map(p => p.countyCode));
  const counties: County[] = KENYA_COUNTIES.filter(c =>
    countiesUsed.has(c.code)
  ).map(c => ({
    code: c.code,
    name: c.name,
    registeredVoters: parsed
      .filter(p => p.countyCode === c.code)
      .reduce((sum, p) => sum + p.voters, 0),
  }));

  const constituencies: Constituency[] = constituencyBuilds.map(b => ({
    code: b.code,
    name: b.name,
    countyCode: b.countyCode,
    registeredVoters: b.voters,
  }));

  const wards: Ward[] = parsed.map(p => ({
    code: p.wardCode,
    name: p.wardName,
    constituencyCode:
      constituencyNameToCode.get(`${p.countyCode}|${p.constituencyName}`) ?? '',
    countyCode: p.countyCode,
    registeredVoters: p.voters,
  }));

  const wardVoterTotal = wards.reduce((sum, w) => sum + w.registeredVoters, 0);

  return {
    counties,
    constituencies,
    wards,
    loadedAt: Date.now(),
    source: 'live',
    wardVoterTotal,
  };
}

// ---- County name normalisation ----

function normaliseCountyName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s*county$/i, '')
    .replace(/[–—]/g, '-')
    .replace(/[’']/g, "'")
    .trim();
}

function buildCountyAliasLookup(): Map<string, County> {
  const map = new Map<string, County>();
  const add = (alias: string, county: County) =>
    map.set(normaliseCountyName(alias), county);

  for (const c of KENYA_COUNTIES) {
    add(c.name, c);
    add(c.name.replace(/\s*county$/i, ''), c);
  }

  // Explicit aliases for known variants that normalise differently.
  const specials: Record<string, string> = {
    'taita-taveta': '006',
    'tharaka-nithi': '013',
    'trans-nzoia': '026',
    'trans nzoia': '026',
    'elgeyo-marakwet': '028',
    'elgeyo/marakwet': '028',
    nairobi: '047',
    'nairobi city': '047',
    "murang'a": '021',
    'homa bay': '043',
    'tana river': '004',
    'west pokot': '024',
    'uasin gishu': '027',
  };
  for (const [alias, code] of Object.entries(specials)) {
    const county = KENYA_COUNTIES.find(c => c.code === code);
    if (county) map.set(normaliseCountyName(alias), county);
  }

  return map;
}

// ---- Shared helpers ----

function isDefined<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
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
  for (const item of items) if (!seen.has(item.code)) seen.set(item.code, item);
  return Array.from(seen.values());
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
