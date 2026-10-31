import { POLICY_DIMENSIONS } from '../../types/simulation';
import { SEATS_WITH_RUNNING_MATE } from '../../constants/kenya';
import type { Candidate, Seat } from '../../types/simulation';
import { useSimulationStore } from '../../store/simulationStore';
import { RunningMatePanel } from './RunningMatePanel';

interface CandidateCardProps {
  candidate: Candidate;
  seat: Seat;
  canRemove: boolean;
}

const styles = `
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--dur-base) var(--ease-out);
}
.card--incumbent { border-color: var(--accent-primary); }
.card__head {
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: center; gap: var(--sp-3);
}
.card__label {
  font-size: var(--fs-sm); font-weight: 600; flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.incumbent-toggle {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: var(--fs-xs); color: var(--text-secondary);
  cursor: pointer; user-select: none;
  padding: 4px 8px; border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-inset);
  transition: border-color var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out);
}
.incumbent-toggle:hover { border-color: var(--border-strong); color: var(--text-primary); }
.incumbent-toggle input { position: absolute; opacity: 0; pointer-events: none; }
.incumbent-toggle__dot {
  width: 12px; height: 12px;
  border: 1.5px solid var(--border-strong);
  border-radius: 999px;
  display: grid; place-items: center;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.incumbent-toggle__dot::after {
  content: ''; width: 6px; height: 6px; border-radius: 999px;
  background: transparent;
  transition: background var(--dur-fast) var(--ease-out);
}
.incumbent-toggle input:checked ~ .incumbent-toggle__dot {
  border-color: var(--accent-primary);
}
.incumbent-toggle input:checked ~ .incumbent-toggle__dot::after {
  background: var(--accent-primary);
}
.incumbent-toggle input:checked { color: var(--accent-primary); }
.card__remove {
  background: transparent; border: none; color: var(--text-muted);
  padding: 4px 8px; border-radius: 6px; font-size: var(--fs-xs);
  transition: color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out);
}
.card__remove:hover:not(:disabled) {
  color: var(--accent-danger); background: rgba(239,68,68,0.08);
}
.card__remove:disabled { opacity: 0.3; cursor: not-allowed; }
.card__body { padding: var(--sp-3) var(--sp-4) var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3); }
.policy-row { display: grid; grid-template-columns: 1fr 60px; gap: var(--sp-3); align-items: center; }
.policy-row__label { font-size: var(--fs-xs); color: var(--text-secondary); }
.policy-row__value {
  font-family: var(--font-mono); font-size: var(--fs-xs);
  color: var(--text-muted); text-align: right;
}
.policy-row input[type="range"] {
  grid-column: 1 / -1;
  -webkit-appearance: none; appearance: none;
  height: 3px; background: var(--bg-elevated);
  border-radius: 999px; outline: none;
}
.policy-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 12px; height: 12px; border-radius: 999px;
  background: var(--accent-primary); border: 2px solid var(--bg-surface);
  cursor: pointer;
}
.policy-row input[type="range"]::-moz-range-thumb {
  width: 12px; height: 12px; border-radius: 999px;
  background: var(--accent-primary); border: 2px solid var(--bg-surface);
  cursor: pointer;
}
`;

export function CandidateCard({ candidate, seat, canRemove }: CandidateCardProps) {
  const setIncumbent = useSimulationStore(s => s.setIncumbent);
  const removeCandidate = useSimulationStore(s => s.removeCandidate);
  const updatePolicyPosition = useSimulationStore(s => s.updatePolicyPosition);

  const showRunningMate = SEATS_WITH_RUNNING_MATE.has(seat);

  return (
    <>
      <style>{styles}</style>
      <article className={`card${candidate.isIncumbent ? ' card--incumbent' : ''}`}>
        <header className="card__head">
          <span className="card__label">{candidate.label}</span>
          <label className="incumbent-toggle">
            <input
              type="radio"
              name="incumbent"
              checked={candidate.isIncumbent}
              onChange={() =>
                setIncumbent(candidate.isIncumbent ? null : candidate.id)
              }
            />
            <span className="incumbent-toggle__dot" aria-hidden="true" />
            <span>Incumbent</span>
          </label>
          <button
            type="button"
            className="card__remove"
            disabled={!canRemove}
            onClick={() => removeCandidate(candidate.id)}
            aria-label={`Remove ${candidate.label}`}
          >
            Remove
          </button>
        </header>
        <div className="card__body">
          {POLICY_DIMENSIONS.map(dim => {
            const current =
              candidate.policyPositions.find(p => p.dimensionId === dim.id)
                ?.value ?? 50;
            return (
              <div className="policy-row" key={dim.id}>
                <span className="policy-row__label">{dim.label}</span>
                <span className="policy-row__value">{current.toFixed(0)}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={current}
                  onChange={e =>
                    updatePolicyPosition(candidate.id, dim.id, Number(e.target.value))
                  }
                  aria-label={`${candidate.label} — ${dim.label}`}
                />
              </div>
            );
          })}
          {showRunningMate && <RunningMatePanel candidate={candidate} />}
        </div>
      </article>
    </>
  );
}
