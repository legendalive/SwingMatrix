import { useEffect, useState } from 'react';
import { SLIDER_VARIABLES } from '../../constants/variables';
import { useSimulationStore } from '../../store/simulationStore';
import { useFetchStore } from '../../api/bootstrapWorldBank';
import type { SliderVariable } from '../../types/simulation';

const styles = `
.panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.panel__head {
  padding: var(--sp-4);
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--sp-3);
}
.panel__title { font-size: var(--fs-md); font-weight: 600; }
.panel__hint { font-size: var(--fs-xs); color: var(--text-muted); }
.panel__body {
  padding: var(--sp-4);
  display: flex; flex-direction: column; gap: var(--sp-5);
}
.slider-row { display: flex; flex-direction: column; gap: var(--sp-2); }
.slider-row__head {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: var(--sp-3);
}
.slider-row__label {
  font-size: var(--fs-sm); font-weight: 500; color: var(--text-primary);
}
.slider-row__value {
  font-family: var(--font-mono); font-size: var(--fs-sm);
  color: var(--text-primary);
  background: var(--bg-inset);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
}
.slider-row__desc {
  font-size: var(--fs-xs); color: var(--text-muted); line-height: 1.5;
}
.slider-row__tags { display: flex; flex-wrap: wrap; gap: var(--sp-2); align-items: center; }
.tag {
  font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 2px 6px; border-radius: 4px;
  background: var(--bg-elevated); color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  font-weight: 500;
}
.tag--qual {
  background: var(--accent-warning-soft);
  color: var(--accent-warning);
  border-color: transparent;
}
.tag--live {
  background: var(--accent-success-soft);
  color: var(--accent-success);
  border-color: transparent;
  display: inline-flex; align-items: center; gap: 4px;
}
.tag--live::before {
  content: '';
  width: 5px; height: 5px; border-radius: 999px;
  background: var(--accent-success);
  display: inline-block;
}
.tag--wb {
  font-family: var(--font-mono);
  letter-spacing: 0;
  text-transform: none;
  color: var(--text-muted);
  font-weight: 400;
}
.slider-row input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: var(--bg-elevated);
  border-radius: 999px;
  outline: none;
  margin: 6px 0;
}
.slider-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px; height: 16px;
  border-radius: 999px;
  background: var(--accent-primary);
  border: 2px solid var(--bg-surface);
  box-shadow: 0 0 0 1px var(--accent-primary);
  cursor: pointer;
  transition: transform var(--dur-fast) var(--ease-out);
}
.slider-row input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
.slider-row input[type="range"]::-moz-range-thumb {
  width: 16px; height: 16px;
  border-radius: 999px;
  background: var(--accent-primary);
  border: 2px solid var(--bg-surface);
  cursor: pointer;
}
.slider-row input[type="range"]:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--accent-primary-soft);
}
`;

function SliderRow({ variable }: { variable: SliderVariable }) {
  const storeValue = useSimulationStore(
    s => s.sliders[variable.id] ?? variable.defaultValue
  );
  const setSlider = useSimulationStore(s => s.setSlider);
  const fetchReport = useFetchStore(s =>
    variable.worldBankCode ? s.reports[variable.worldBankCode] : undefined
  );
  const [local, setLocal] = useState(storeValue);

  useEffect(() => {
    setLocal(storeValue);
  }, [storeValue]);

  useEffect(() => {
    if (local === storeValue) return;
    const t = setTimeout(() => setSlider(variable.id, local), 30);
    return () => clearTimeout(t);
  }, [local, storeValue, variable.id, setSlider]);

  const display = variable.qualitative
    ? local > 0
      ? `+${local.toFixed(0)}`
      : local.toFixed(0)
    : `${local.toFixed(1)}${variable.unit}`;

  const liveYear =
    fetchReport && fetchReport.status === 'ok' ? fetchReport.year : undefined;

  return (
    <div className="slider-row">
      <div className="slider-row__head">
        <span className="slider-row__label">{variable.label}</span>
        <span className="slider-row__value">{display}</span>
      </div>
      <input
        type="range"
        min={variable.min}
        max={variable.max}
        step={variable.step}
        value={local}
        onChange={e => setLocal(Number(e.target.value))}
        aria-label={variable.label}
      />
      <p className="slider-row__desc">{variable.description}</p>
      <div className="slider-row__tags">
        {liveYear !== undefined && (
          <span
            className="tag tag--live"
            title={`Latest World Bank observation: ${liveYear}`}
          >
            Live · {liveYear}
          </span>
        )}
        {variable.qualitative && <span className="tag tag--qual">Qualitative</span>}
        {variable.worldBankCode && (
          <span className="tag tag--wb">{variable.worldBankCode}</span>
        )}
        {!variable.worldBankCode && !variable.qualitative && (
          <span className="tag">Derived</span>
        )}
      </div>
    </div>
  );
}

export function SliderPanel() {
  return (
    <>
      <style>{styles}</style>
      <section className="panel" aria-labelledby="sliders-title">
        <div className="panel__head">
          <span id="sliders-title" className="panel__title">Variables</span>
          <span className="panel__hint">Drag to update</span>
        </div>
        <div className="panel__body">
          {SLIDER_VARIABLES.map(v => (
            <SliderRow key={v.id} variable={v} />
          ))}
        </div>
      </section>
    </>
  );
}
