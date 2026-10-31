import { useMemo } from 'react';
import type { CandidateShare, SimulationState } from '../types/simulation';
import { useSimulationStore } from './simulationStore';
import { runMonteCarlo } from '../engine/monteCarlo';
import { applyRunningMateCap } from '../engine/runningMateCap';

/**
 * Computes the current candidate share vector.
 *
 * The result is memoised on the five state slices that affect the
 * computation. Slider drags, candidate additions, toggle flips, seat
 * changes and county changes each trigger exactly one recompute.
 * Nothing else does.
 */
export function useSimulationResults(): CandidateShare[] {
  const candidates = useSimulationStore(s => s.candidates);
  const sliders = useSimulationStore(s => s.sliders);
  const toggles = useSimulationStore(s => s.toggles);
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const geography = useSimulationStore(s => s.geography);

  return useMemo(() => {
    const state: SimulationState = {
      selectedSeat,
      geography,
      candidates,
      sliders,
      toggles,
    };
    const raw = runMonteCarlo(state);
    return applyRunningMateCap(raw, state);
  }, [candidates, sliders, toggles, selectedSeat, geography]);
}
