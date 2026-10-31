import type {
  Candidate,
  RunningMate,
  Seat,
  SimulationState,
} from '../types/simulation';
import { POLICY_DIMENSIONS } from '../types/simulation';
import { SEATS_WITH_RUNNING_MATE } from '../constants/kenya';
import { defaultSliderState, defaultToggleState } from '../constants/variables';

function centeredPositions(value: number) {
  return POLICY_DIMENSIONS.map(d => ({ dimensionId: d.id, value }));
}

function makeDefaultRunningMate(label: string): RunningMate {
  return {
    name: `Running Mate for ${label}`,
    policyPositions: centeredPositions(50),
    qualitativeBias: 0,
  };
}

function makeDefaultCandidate(index: number, seat: Seat): Candidate {
  // Three default candidates, mildly differentiated across the policy space.
  const baseValue = 40 + index * 10; // 40, 50, 60
  const label = `Candidate ${index + 1}`;
  return {
    id: `candidate-${index + 1}`,
    label,
    isIncumbent: false,
    policyPositions: centeredPositions(baseValue),
    qualitativeBias: 0,
    runningMate: SEATS_WITH_RUNNING_MATE.has(seat)
      ? makeDefaultRunningMate(label)
      : null,
  };
}

export function defaultCandidates(seat: Seat): Candidate[] {
  return [0, 1, 2].map(i => makeDefaultCandidate(i, seat));
}

export function defaultState(): SimulationState {
  const seat: Seat = 'president';
  return {
    selectedSeat: seat,
    geography: { level: 'national', countyCode: null },
    candidates: defaultCandidates(seat),
    sliders: defaultSliderState(),
    toggles: defaultToggleState(),
  };
}
