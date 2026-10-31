// ------------------------------------------------------------------
// Hierarchical geographic types.
//
// Kept in a separate module from simulation.ts so the existing
// GeographySelection and County types remain untouched until they
// are migrated in Phase A Step 2. Structural typing means both
// County definitions are interchangeable wherever a county is
// consumed.
// ------------------------------------------------------------------

export type GeoLevel = 'national' | 'county' | 'constituency' | 'ward';

export interface County {
  /** IEBC three-digit county code, e.g. "001". */
  code: string;
  name: string;
  registeredVoters: number;
}

export interface Constituency {
  /** IEBC constituency code. Length varies in the CitizenGuide export. */
  code: string;
  name: string;
  /** Parent county code. */
  countyCode: string;
  registeredVoters: number;
}

export interface Ward {
  /** IEBC ward code. */
  code: string;
  name: string;
  /** Parent constituency code. */
  constituencyCode: string;
  /** Parent county code (denormalised for fast filtering). */
  countyCode: string;
  registeredVoters: number;
}

export interface GeoRegistry {
  counties: County[];
  constituencies: Constituency[];
  wards: Ward[];
  /** Unix ms at which the registry was last successfully loaded. */
  loadedAt: number;
  /** Where the current registry came from. */
  source: 'live' | 'cache' | 'fallback';
  /** Sum of registeredVoters across all loaded wards, for reconciliation. */
  wardVoterTotal: number;
}

/**
 * Expanded geographic selection covering four levels.
 * A null at a lower level means the selection stops at the level above.
 * e.g. { level: 'county', countyCode: '047', constituencyCode: null, wardCode: null }
 */
export interface GeoSelection {
  level: GeoLevel;
  countyCode: string | null;
  constituencyCode: string | null;
  wardCode: string | null;
}

export const EMPTY_SELECTION: GeoSelection = {
  level: 'national',
  countyCode: null,
  constituencyCode: null,
  wardCode: null,
};
