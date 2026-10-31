import { create } from 'zustand';
import type {
  Candidate,
  RunningMate,
  Seat,
  SimulationState,
} from '../types/simulation';
import { POLICY_DIMENSIONS } from '../types/simulation';
import { SEATS_WITH_RUNNING_MATE } from '../constants/kenya';
import { defaultToggleState } from '../constants/variables';
import { defaultCandidates, defaultState } from './defaults';

interface SimulationActions {
  addCandidate: () => void;
  removeCandidate: (id: string) => void;
  setIncumbent: (id: string | null) => void;
  setSlider: (id: string, value: number) => void;
  toggleFlag: (id: string) => void;
  setRunningMate: (candidateId: string, rm: RunningMate | null) => void;
  updateRunningMate: (
    candidateId: string,
    patch: Partial<RunningMate>
  ) => void;
  setSeat: (seat: Seat) => void;
  setCounty: (code: string | null) => void;
  updateCandidate: (id: string, patch: Partial<Candidate>) => void;
  updatePolicyPosition: (
    candidateId: string,
    dimensionId: string,
    value: number
  ) => void;
  reset: () => void;
}

export type SimulationStore = SimulationState & SimulationActions;

/** Parse the highest existing "Candidate N" label and return N + 1. */
function nextCandidateIndex(candidates: Candidate[]): number {
  let max = 0;
  for (const c of candidates) {
    const m = /^Candidate (\d+)$/.exec(c.label);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

function centeredPositions(value: number) {
  return POLICY_DIMENSIONS.map(d => ({ dimensionId: d.id, value }));
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  ...defaultState(),

  addCandidate: () =>
    set(s => {
      const index = nextCandidateIndex(s.candidates);
      const label = `Candidate ${index}`;
      const newCand: Candidate = {
        id: `candidate-${Date.now()}-${index}`,
        label,
        isIncumbent: false,
        policyPositions: centeredPositions(50),
        qualitativeBias: 0,
        runningMate: SEATS_WITH_RUNNING_MATE.has(s.selectedSeat)
          ? {
              name: `Running Mate for ${label}`,
              policyPositions: centeredPositions(50),
              qualitativeBias: 0,
            }
          : null,
      };
      return { candidates: [...s.candidates, newCand] };
    }),

  removeCandidate: id =>
    set(s => {
      if (s.candidates.length <= 2) return s;
      return { candidates: s.candidates.filter(c => c.id !== id) };
    }),

  setIncumbent: id =>
    set(s => ({
      candidates: s.candidates.map(c => ({
        ...c,
        isIncumbent: c.id === id,
      })),
    })),

  setSlider: (id, value) =>
    set(s => ({ sliders: { ...s.sliders, [id]: value } })),

  toggleFlag: id =>
    set(s => ({ toggles: { ...s.toggles, [id]: !s.toggles[id] } })),

  setRunningMate: (candidateId, rm) =>
    set(s => ({
      candidates: s.candidates.map(c =>
        c.id === candidateId ? { ...c, runningMate: rm } : c
      ),
    })),

  updateRunningMate: (candidateId, patch) =>
    set(s => ({
      candidates: s.candidates.map(c => {
        if (c.id !== candidateId || !c.runningMate) return c;
        return { ...c, runningMate: { ...c.runningMate, ...patch } };
      }),
    })),

  setSeat: seat =>
    set(() => ({
      selectedSeat: seat,
      candidates: defaultCandidates(seat),
      toggles: defaultToggleState(),
    })),

  setCounty: code =>
    set(s => ({
      geography: {
        level: code ? 'county' : 'national',
        countyCode: code,
      },
    })),

  updateCandidate: (id, patch) =>
    set(s => ({
      candidates: s.candidates.map(c =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),

  updatePolicyPosition: (candidateId, dimensionId, value) =>
    set(s => ({
      candidates: s.candidates.map(c => {
        if (c.id !== candidateId) return c;
        const existing = c.policyPositions.find(
          p => p.dimensionId === dimensionId
        );
        const policyPositions = existing
          ? c.policyPositions.map(p =>
              p.dimensionId === dimensionId ? { ...p, value } : p
            )
          : [...c.policyPositions, { dimensionId, value }];
        return { ...c, policyPositions };
      }),
    })),

  reset: () => set(defaultState()),
}));
