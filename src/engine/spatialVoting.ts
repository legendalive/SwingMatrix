// ------------------------------------------------------------------
// Spatial-voting model (logit).
//
// Each voter bloc (one per county in the MVP) is assigned a utility
// for every candidate. The utility is a weighted negative squared
// distance in a 5-dimensional policy space, plus qualitative terms,
// plus a Gumbel random shock. Shares are produced by softmax over
// utilities, then aggregated across blocs by registered-voter weight.
//
// The news sentiment shock is scaled by the live GDELT magnitude
// rather than a fixed constant. See bootstrapGdelt for the formula.
// ------------------------------------------------------------------

import type { SimulationState, Candidate } from '../types/simulation';
import { POLICY_DIMENSIONS } from '../types/simulation';
import { KENYA_COUNTIES, findCounty } from '../constants/kenya';
import {
  getNewsSentimentMagnitude,
  NEWS_SHOCK_MAX,
} from '../api/bootstrapGdelt';

export interface RawShare {
  candidateId: string;
  share: number; // 0–1
}

/** Sample a Gumbel-distributed random variable (location 0, scale 1). */
function gumbel(): number {
  const u = Math.random();
  return -Math.log(-Math.log(Math.max(u, 1e-12)));
}

/**
 * Convert slider state into per-dimension salience multipliers.
 * A value of 1.0 means the dimension carries its baseline weight.
 * Values above 1 increase that dimension's influence on voter utility.
 */
export function deriveSalience(
  sliders: Record<string, number>
): Record<string, number> {
  const ue = sliders['youth_unemployment'] ?? 15.2;
  const pov = sliders['poverty_headcount'] ?? 45.3;
  const flfp = sliders['female_labour_participation'] ?? 63;
  const lit = sliders['adult_literacy'] ?? 82.9;

  return {
    economy: 1.0 + (ue - 15.2) / 50 + (pov - 45.3) / 100,
    devolution: 1.0 + (pov - 45.3) / 100,
    security: 1.0,
    corruption: 1.0,
    health: 1.0 + (flfp - 63) / 100 + (lit - 82.9) / 100,
  };
}

/** Return the bloc weights for the current geography scope. */
function blocWeights(
  countyCode: string | null
): { code: string; weight: number }[] {
  if (countyCode) {
    const c = findCounty(countyCode);
    return c ? [{ code: c.code, weight: c.registeredVoters }] : [];
  }
  return KENYA_COUNTIES.map(c => ({ code: c.code, weight: c.registeredVoters }));
}

/**
 * Build a candidate's effective policy position vector after applying
 * toggle-driven shocks. The corruption scandal toggle lowers the
 * incumbent's corruption position, reducing their credibility.
 */
function effectivePositions(
  candidate: Candidate,
  toggles: Record<string, boolean>,
  incumbentId: string | null
): Record<string, number> {
  const pos: Record<string, number> = {};
  for (const p of candidate.policyPositions) pos[p.dimensionId] = p.value;
  for (const d of POLICY_DIMENSIONS) if (!(d.id in pos)) pos[d.id] = 50;

  if (candidate.id === incumbentId && toggles['corruption_scandal']) {
    pos.corruption = Math.max(0, (pos.corruption ?? 50) - 20);
  }

  return pos;
}

/**
 * Run one stochastic draw of the spatial-voting model.
 * Returns a candidate share vector that sums to 1.
 */
export function computeSharesOnce(state: SimulationState): RawShare[] {
  if (state.candidates.length === 0) return [];

  const salience = deriveSalience(state.sliders);
  const blocs = blocWeights(state.geography.countyCode);
  const totalWeight = blocs.reduce((s, b) => s + b.weight, 0);
  if (totalWeight === 0) return [];

  const incumbentId = state.candidates.find(c => c.isIncumbent)?.id ?? null;
  const positions = state.candidates.map(c => ({
    id: c.id,
    pos: effectivePositions(c, state.toggles, incumbentId),
    qualBias: c.qualitativeBias,
  }));

  const turnout = state.sliders['turnout_propensity'] ?? 63.67;
  const noiseScale = 1.0 + (turnout - 63.67) / 200;
  const qb = state.sliders['qualitative_bias'] ?? 0;

  // Registration drive: low-information marginal voters weigh stated
  // policy positions less heavily than qualitative factors and noise.
  const positionWeight = state.toggles['registration_drive'] ? 0.85 : 1.0;

  // News shock: scaled by the live GDELT magnitude rather than a
  // fixed constant. Magnitude of 0 means no adverse news effect.
  const newsShock = state.toggles['news_sentiment_shock']
    ? NEWS_SHOCK_MAX * getNewsSentimentMagnitude()
    : 0;

  const shareByCandidate = new Map<string, number>();
  for (const c of state.candidates) shareByCandidate.set(c.id, 0);

  for (const bloc of blocs) {
    const utilities: number[] = [];

    for (const ep of positions) {
      let positionSignal = 0;
      for (const d of POLICY_DIMENSIONS) {
        const w = salience[d.id] ?? 1;
        const distance = (50 - ep.pos[d.id]) / 100; // 0–1
        positionSignal -= w * distance * distance * 6;
      }

      let signal = positionSignal * positionWeight;

      signal += ep.qualBias / 50;

      if (ep.id === incumbentId) {
        signal += qb / 50;
        signal -= newsShock;
      }

      if (state.toggles['misinformation_campaign']) {
        signal += gumbel() * 0.4;
      }

      signal += gumbel() * noiseScale;

      utilities.push(signal);
    }

    const maxU = Math.max(...utilities);
    const exps = utilities.map(u => Math.exp(u - maxU));
    const sumExp = exps.reduce((a, b) => a + b, 0);

    for (let i = 0; i < state.candidates.length; i++) {
      const prob = exps[i] / sumExp;
      const current = shareByCandidate.get(state.candidates[i].id) ?? 0;
      shareByCandidate.set(
        state.candidates[i].id,
        current + prob * (bloc.weight / totalWeight)
      );
    }
  }

  return state.candidates.map(c => ({
    candidateId: c.id,
    share: shareByCandidate.get(c.id) ?? 0,
  }));
}
