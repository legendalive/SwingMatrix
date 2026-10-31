// ------------------------------------------------------------------
// Running-mate cap.
//
// The running mate can move their principal's mean share by at most
// ±5% (multiplicative), applied AFTER Monte Carlo and renormalised.
// Two drivers, both anchored to observable political-science findings:
//
//   1. Moderation bonus: running mates closer to the political centre
//      (dimension values nearer 50) tend to help the ticket. This is a
//      standard finding in VP-selection literature.
//
//   2. Qualitative bias: the user-set −100…+100 value on the running
//      mate reflects likeability, recognition, sympathy, and similar
//      unverifiable factors. A positive bias helps the principal.
//
// The ±5% figure matches observed Kenyan dynamics: running-mate
// choice moves national vote shares by low single digits at most.
// ------------------------------------------------------------------

import type {
  SimulationState,
  CandidateShare,
  RunningMate,
} from '../types/simulation';

export const RUNNING_MATE_CAP = 0.05;

function factorFor(rm: RunningMate): number {
  const n = rm.policyPositions.length || 1;

  let distSum = 0;
  for (const p of rm.policyPositions) {
    distSum += Math.abs(p.value - 50) / 50; // 0 (centred) to 1 (extreme)
  }
  const moderation = 1 - distSum / n; // 0 (extreme) to 1 (centred)

  const qualPart = rm.qualitativeBias / 100; // −1 to +1

  const combined = 0.4 * (moderation - 0.5) + 0.6 * qualPart;
  const factor = 1 + combined * RUNNING_MATE_CAP;

  return Math.max(1 - RUNNING_MATE_CAP, Math.min(1 + RUNNING_MATE_CAP, factor));
}

export function applyRunningMateCap(
  shares: CandidateShare[],
  state: SimulationState
): CandidateShare[] {
  if (shares.length === 0) return shares;

  const factorById = new Map<string, number>();
  for (const c of state.candidates) {
    factorById.set(c.id, c.runningMate ? factorFor(c.runningMate) : 1.0);
  }

  const adjusted = shares.map(s => {
    const f = factorById.get(s.candidateId) ?? 1.0;
    return {
      ...s,
      meanShare: s.meanShare * f,
      p10: s.p10 * f,
      p90: s.p90 * f,
    };
  });

  const meanTotal = adjusted.reduce((sum, s) => sum + s.meanShare, 0);
  const p10Total = adjusted.reduce((sum, s) => sum + s.p10, 0);
  const p90Total = adjusted.reduce((sum, s) => sum + s.p90, 0);

  if (meanTotal > 0) adjusted.forEach(s => { s.meanShare /= meanTotal; });
  if (p10Total > 0) adjusted.forEach(s => { s.p10 /= p10Total; });
  if (p90Total > 0) adjusted.forEach(s => { s.p90 /= p90Total; });

  return adjusted;
}
