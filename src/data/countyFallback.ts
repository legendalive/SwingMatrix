// ------------------------------------------------------------------
// County-only fallback registry.
//
// The app must always have a working geographic registry, even before
// public/wards-2022.json has been provided. This adapter produces a
// GeoRegistry containing the 47 counties only. When the fallback is
// active, constituency and ward selections have no options and the
// UI must degrade to county-level selection without error.
// ------------------------------------------------------------------

import type { GeoRegistry, County } from '../types/geography';
import { KENYA_COUNTIES, NATIONAL_REGISTERED_VOTERS } from '../constants/kenya';

export function buildCountyFallback(): GeoRegistry {
  const counties: County[] = KENYA_COUNTIES.map(c => ({
    code: c.code,
    name: c.name,
    registeredVoters: c.registeredVoters,
  }));

  return {
    counties,
    constituencies: [],
    wards: [],
    loadedAt: Date.now(),
    source: 'fallback',
    wardVoterTotal: NATIONAL_REGISTERED_VOTERS,
  };
}
