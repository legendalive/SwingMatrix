// ------------------------------------------------------------------
// Monte Carlo wrapper around the spatial-voting model.
//
// computeSharesOnce() returns a single stochastic draw. This module
// repeats that draw N times and reports the mean share plus the
// 10th and 90th percentiles for each candidate. The percentile band
// is what the UI displays as the uncertainty whisker.
// ------------------------------------------------------------------

import type { SimulationState, CandidateShare } from '../types/simulation';
import { computeSharesOnce } from './spatialVoting';

export const DEFAULT_ITERATIONS = 500;

export function runMonteCarlo(
  state: SimulationState,
  iterations: number = DEFAULT_ITERATIONS
): CandidateShare[] {
  if (state.candidates.length === 0) return [];

  const accum = new Map<string, number[]>();
  for (const c of state.candidates) accum.set(c.id, []);

  for (let i = 0; i < iterations; i++) {
    const draw = computeSharesOnce(state);
    for (const { candidateId, share } of draw) {
      accum.get(candidateId)?.push(share);
    }
  }

  return state.candidates.map(c => {
    const arr = (accum.get(c.id) ?? []).slice().sort((a, b) => a - b);
    if (arr.length === 0) {
      return {
        candidateId: c.id,
        label: c.label,
        meanShare: 0,
        p10: 0,
        p90: 0,
      };
    }
    const n = arr.length;
    const mean = arr.reduce((s, v) => s + v, 0) / n;
    const p10 = arr[Math.floor(n * 0.1)] ?? mean;
    const p90 = arr[Math.floor(n * 0.9)] ?? mean;
    return {
      candidateId: c.id,
      label: c.label,
      meanShare: mean,
      p10,
      p90,
    };
  });
}
