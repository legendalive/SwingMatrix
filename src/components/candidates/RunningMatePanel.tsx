import { POLICY_DIMENSIONS } from '../../types/simulation';
import type { Candidate } from '../../types/simulation';
import { useSimulationStore } from '../../store/simulationStore';

interface RunningMatePanelProps {
  candidate: Candidate;
}

const styles = `
.rm {
  margin-top: var(--sp-2);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--sp-3);
  display: flex; flex-direction: column; gap: var(--sp-3);
}
.rm__head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--sp-2);
}
.rm__title {
  font-size: var(--fs-xs); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-secondary);
}
.rm__cap {
  font-size: 10px;
  background: var(--accent-primary-soft);
  color: var(--accent-primary);
  padding: 2px 6px; border-radius: 4px;
  font-weight: 500;
}
.rm__row {
  display: grid; grid-template-columns: 1fr 60px; gap: var(--sp-2);
  align-items: center;
}
.rm__label { font-size: var(--fs-xs); color: var(--text-muted); }
.rm__value {
  font-family: var(--font-mono); font-size: var(--fs-xs);
  text-align: right; color: var(--text-secondary);
}
.rm__row input[type="range"] {
  grid-column: 1 / -1;
  -webkit-appearance: none; appearance: none;
  height: 3px; background: var(--bg-elevated);
  border-radius: 999px; outline: none;
}
.rm__row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 12px; height: 12px; border-radius: 999px;
  background: var(--accent-warning); border: 2px solid var(--bg-inset);
  cursor: pointer;
}
.rm__row input[type="range"]::-moz-range-thumb {
  width: 12px; height: 12px; border-radius: 999px;
  background: var(--accent-warning); border: 2px solid var(--bg-inset);
  cursor: pointer;
}
.rm__bias input[type="range"]::-webkit-slider-thumb { background: var(--accent-warning); }
`;

export function RunningMatePanel({ candidate }: RunningMatePanelProps) {
  const updateRunningMate = useSimulationStore(s => s.updateRunningMate);
  const rm = candidate.runningMate;

  if (!rm) return null;

  const setBias = (value: number) =>
    updateRunningMate(candidate.id, { qualitativeBias: value });

  const setPosition = (dimensionId: string, value: number) => {
    const existing = rm.policyPositions.find(p => p.dimensionId === dimensionId);
    const policyPositions = existing
      ? rm.policyPositions.map(p =>
          p.dimensionId === dimensionId ? { ...p, value } : p
        )
      : [...rm.policyPositions, { dimensionId, value }];
    updateRunningMate(candidate.id, { policyPositions });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="rm">
        <div className="rm__head">
          <span className="rm__title">Running mate</span>
          <span className="rm__cap" title="Cap applied to the principal's final share">
            Effect capped ±5%
          </span>
        </div>

        <div className="rm__row rm__bias">
          <span className="rm__label">Qualitative bias</span>
          <span className="rm__value">
            {rm.qualitativeBias > 0 ? '+' : ''}
            {rm.qualitativeBias}
          </span>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={rm.qualitativeBias}
            onChange={e => setBias(Number(e.target.value))}
            aria-label={`${candidate.label} running mate qualitative bias`}
          />
        </div>

        {POLICY_DIMENSIONS.map(dim => {
          const value =
            rm.policyPositions.find(p => p.dimensionId === dim.id)?.value ?? 50;
          return (
            <div className="rm__row" key={dim.id}>
              <span className="rm__label">{dim.label}</span>
              <span className="rm__value">{value.toFixed(0)}</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={e => setPosition(dim.id, Number(e.target.value))}
                aria-label={`${candidate.label} running mate — ${dim.label}`}
              />
            </div>
          );
        })}

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Moderation toward the centre and positive likeability help the principal;
          extreme positions or negative perception hurt. The net effect on the
          principal’s final share is capped at ±5% and applied after Monte Carlo.
        </p>
      </div>
    </>
  );
}
