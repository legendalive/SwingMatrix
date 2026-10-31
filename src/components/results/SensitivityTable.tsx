import { useEffect, useState } from 'react';
import { SLIDER_VARIABLES, TOGGLE_VARIABLES } from '../../constants/variables';
import { runMonteCarlo } from '../../engine/monteCarlo';
import { useSimulationResults } from '../../store/selectors';
import { useSimulationStore } from '../../store/simulationStore';
import type { SimulationState } from '../../types/simulation';

interface SensitivityRow {
  id: string;
  label: string;
  kind: 'slider' | 'toggle';
  delta: number;
}

const ITERATIONS = 80;
const DEBOUNCE_MS = 500;
const TOP_N = 6;

function computeImpact(
  state: SimulationState,
  leaderId: string
): SensitivityRow[] {
  const base = runMonteCarlo(state, ITERATIONS);
  const baseLeader =
    base.find(s => s.candidateId === leaderId)?.meanShare ?? 0;
  const rows: SensitivityRow[] = [];

  for (const slider of SLIDER_VARIABLES) {
    const current = state.sliders[slider.id] ?? slider.defaultValue;
    let maxDelta = 0;
    const tests = [
      slider.min + (slider.max - slider.min) * 0.2,
      slider.min + (slider.max - slider.min) * 0.5,
      slider.min + (slider.max - slider.min) * 0.8,
    ];
    for (const value of tests) {
      if (Math.abs(value - current) < slider.step) continue;
      const perturbed: SimulationState = {
        ...state,
        sliders: { ...state.sliders, [slider.id]: value },
      };
      const shares = runMonteCarlo(perturbed, ITERATIONS);
      const leaderShare =
        shares.find(s => s.candidateId === leaderId)?.meanShare ?? 0;
      maxDelta = Math.max(maxDelta, Math.abs(leaderShare - baseLeader));
    }
    rows.push({
      id: slider.id,
      label: slider.label,
      kind: 'slider',
      delta: maxDelta,
    });
  }

  for (const toggle of TOGGLE_VARIABLES) {
    const current = state.toggles[toggle.id] ?? false;
    const perturbed: SimulationState = {
      ...state,
      toggles: { ...state.toggles, [toggle.id]: !current },
    };
    const shares = runMonteCarlo(perturbed, ITERATIONS);
    const leaderShare =
      shares.find(s => s.candidateId === leaderId)?.meanShare ?? 0;
    rows.push({
      id: toggle.id,
      label: toggle.label,
      kind: 'toggle',
      delta: Math.abs(leaderShare - baseLeader),
    });
  }

  return rows.sort((a, b) => b.delta - a.delta).slice(0, TOP_N);
}

const styles = `
.sens {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--sp-5);
}
.sens__head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--sp-3);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--sp-3);
}
.sens__title { font-size: var(--fs-md); font-weight: 600; }
.sens__sub { font-size: var(--fs-xs); color: var(--text-muted); }
.sens__grid {
  display: flex; flex-direction: column; gap: var(--sp-3);
}
.sens__row { display: grid; grid-template-columns: 1fr 100px 56px; gap: var(--sp-3); align-items: center; }
.sens__label { font-size: var(--fs-sm); color: var(--text-primary); }
.sens__kind {
  font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--text-muted); margin-left: 6px;
}
.sens__bar {
  height: 6px;
  background: var(--bg-inset);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}
.sens__bar-fill {
  position: absolute; top: 0; left: 0; bottom: 0;
  background: var(--accent-primary);
  border-radius: 999px;
  transition: width var(--dur-base) var(--ease-out);
}
.sens__value {
  font-family: var(--font-mono); font-size: var(--fs-xs);
  color: var(--text-secondary); text-align: right;
}
.sens__empty {
  font-size: var(--fs-sm); color: var(--text-muted);
  padding: var(--sp-4) 0; text-align: center;
}
.sens__busy {
  font-size: 11px; color: var(--text-muted); font-style: italic;
}
`;

export function SensitivityTable() {
  const results = useSimulationResults();
  const candidates = useSimulationStore(s => s.candidates);
  const sliders = useSimulationStore(s => s.sliders);
  const toggles = useSimulationStore(s => s.toggles);
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const geography = useSimulationStore(s => s.geography);

  const leader = results.reduce<null | (typeof results)[number]>(
    (best, r) => (best === null || r.meanShare > best.meanShare ? r : best),
    null
  );

  const [impact, setImpact] = useState<SensitivityRow[]>([]);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    if (!leader) {
      setImpact([]);
      return;
    }
    setComputing(true);
    const timer = setTimeout(() => {
      const state: SimulationState = {
        selectedSeat,
        geography,
        candidates,
        sliders,
        toggles,
      };
      setImpact(computeImpact(state, leader.candidateId));
      setComputing(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    candidates,
    sliders,
    toggles,
    selectedSeat,
    geography,
    leader?.candidateId,
  ]);

  const maxDelta = Math.max(0.01, ...impact.map(r => r.delta));

  return (
    <>
      <style>{styles}</style>
      <section className="sens" aria-labelledby="sens-title">
        <header className="sens__head">
          <div>
            <h2 id="sens-title" className="sens__title">
              What moves the leading candidate’s share
            </h2>
            <span className="sens__sub">
              Estimated effect, three sampled values per slider and one flip per toggle
            </span>
          </div>
          {computing && <span className="sens__busy">Analysing…</span>}
        </header>
        {impact.length === 0 ? (
          <p className="sens__empty">
            {computing ? 'Computing sensitivity…' : 'No candidates to analyse.'}
          </p>
        ) : (
          <div className="sens__grid">
            {impact.map(row => (
              <div className="sens__row" key={row.id}>
                <span className="sens__label">
                  {row.label}
                  <span className="sens__kind">{row.kind}</span>
                </span>
                <div className="sens__bar">
                  <div
                    className="sens__bar-fill"
                    style={{ width: `${(row.delta / maxDelta) * 100}%` }}
                  />
                </div>
                <span className="sens__value">
                  ±{(row.delta * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
