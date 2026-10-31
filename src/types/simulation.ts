// ------------------------------------------------------------------
// Core type definitions for the Kenya Vote Simulator.
// These types are the contract between the engine, the store,
// and every UI component.
// ------------------------------------------------------------------

// ---- Geography ---------------------------------------------------

export type Seat =
  | 'president'
  | 'governor'
  | 'senator'
  | 'women_rep'
  | 'mp'
  | 'mca';

export type GeographyLevel = 'national' | 'county'; // constituency/ward appended later

export interface County {
  code: string; // IEBC three-digit code, e.g. "001"
  name: string;
  registeredVoters: number;
}

export interface GeographySelection {
  level: GeographyLevel;
  countyCode: string | null; // null = national scope
}

// ---- Variables ---------------------------------------------------

export type VariableKind = 'slider' | 'toggle';

export interface SliderVariable {
  id: string;
  kind: 'slider';
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  /** World Bank indicator code, or null when qualitative. */
  worldBankCode: string | null;
  /** True for variables that cannot be statistically verified. */
  qualitative: boolean;
}

export interface ToggleVariable {
  id: string;
  kind: 'toggle';
  label: string;
  description: string;
  defaultValue: boolean;
}

export type SimulationVariable = SliderVariable | ToggleVariable;

// ---- Candidates --------------------------------------------------

export interface PolicyPosition {
  /** Dimension id from POLICY_DIMENSIONS, value 0–100. */
  dimensionId: string;
  value: number;
}

export interface RunningMate {
  name: string; // "Running Mate A", "Running Mate B"
  policyPositions: PolicyPosition[];
  /** Qualitative modifier for the running mate, −100…+100. */
  qualitativeBias: number;
}

export interface Candidate {
  id: string;
  label: string; // "Candidate 1", "Candidate 2"
  isIncumbent: boolean;
  policyPositions: PolicyPosition[];
  /** Qualitative modifier for the principal, −100…+100. */
  qualitativeBias: number;
  /** Only populated for president and governor seats. */
  runningMate: RunningMate | null;
}

// ---- Simulation state & results ----------------------------------

export interface SimulationState {
  selectedSeat: Seat;
  geography: GeographySelection;
  candidates: Candidate[];
  sliders: Record<string, number>;
  toggles: Record<string, boolean>;
}

export interface CandidateShare {
  candidateId: string;
  label: string;
  meanShare: number; // 0–1
  p10: number; // 10th percentile
  p90: number; // 90th percentile
}

export interface SimulationResult {
  seat: Seat;
  geography: GeographySelection;
  shares: CandidateShare[];
  /** Unix ms timestamp of the computation. */
  computedAt: number;
  /** Indicator codes used in this run, for the provenance panel. */
  indicatorCodesUsed: string[];
}

// ---- Policy dimensions -------------------------------------------

export interface PolicyDimension {
  id: string;
  label: string;
  description: string;
}

export const POLICY_DIMENSIONS: PolicyDimension[] = [
  { id: 'economy', label: 'Economy & Jobs', description: 'Cost of living, employment, growth' },
  { id: 'devolution', label: 'Devolution', description: 'County funding and service delivery' },
  { id: 'security', label: 'Security', description: 'Public safety and policing' },
  { id: 'corruption', label: 'Corruption', description: 'Integrity and public procurement' },
  { id: 'health', label: 'Health & Education', description: 'Social service delivery' },
];
