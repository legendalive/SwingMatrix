import { TOGGLE_VARIABLES } from '../../constants/variables';
import { useSimulationStore } from '../../store/simulationStore';
import type { ToggleVariable } from '../../types/simulation';

const styles = `
.toggle-panel { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
.toggle-panel .panel__head {
  padding: var(--sp-4);
  border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--sp-3);
}
.toggle-panel .panel__title { font-size: var(--fs-md); font-weight: 600; }
.toggle-panel .panel__hint { font-size: var(--fs-xs); color: var(--text-muted); }
.toggle-panel__body {
  padding: var(--sp-3) var(--sp-4);
  display: flex; flex-direction: column;
}
.toggle-row {
  display: flex; gap: var(--sp-3);
  padding: var(--sp-3) 0;
  border-bottom: 1px solid var(--border-subtle);
  align-items: flex-start;
}
.toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
.toggle-row:first-child { padding-top: var(--sp-1); }
.toggle-switch {
  position: relative;
  flex-shrink: 0;
  width: 38px; height: 22px;
  background: var(--bg-elevated);
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  cursor: pointer;
  padding: 0;
  transition: background var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
}
.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: var(--text-secondary);
  border-radius: 999px;
  transition: transform var(--dur-base) var(--ease-out),
              background var(--dur-base) var(--ease-out);
}
.toggle-switch[aria-checked="true"] {
  background: var(--accent-primary-soft);
  border-color: var(--accent-primary);
}
.toggle-switch[aria-checked="true"]::after {
  transform: translateX(16px);
  background: var(--accent-primary);
}
.toggle-row__content { flex: 1; min-width: 0; }
.toggle-row__label {
  font-size: var(--fs-sm); font-weight: 500; color: var(--text-primary);
  display: block;
}
.toggle-row__desc {
  font-size: var(--fs-xs); color: var(--text-muted);
  margin-top: 2px; line-height: 1.5;
}
`;

function ToggleRow({ variable }: { variable: ToggleVariable }) {
  const value = useSimulationStore(s => s.toggles[variable.id] ?? variable.defaultValue);
  const toggleFlag = useSimulationStore(s => s.toggleFlag);

  return (
    <div className="toggle-row">
      <button
        type="button"
        className="toggle-switch"
        role="switch"
        aria-checked={value}
        aria-label={variable.label}
        onClick={() => toggleFlag(variable.id)}
      />
      <div className="toggle-row__content">
        <span className="toggle-row__label">{variable.label}</span>
        <p className="toggle-row__desc">{variable.description}</p>
      </div>
    </div>
  );
}

export function TogglePanel() {
  return (
    <>
      <style>{styles}</style>
      <section className="toggle-panel" aria-labelledby="toggles-title">
        <div className="panel__head">
          <span id="toggles-title" className="panel__title">Shocks</span>
          <span className="panel__hint">Toggle on/off</span>
        </div>
        <div className="toggle-panel__body">
          {TOGGLE_VARIABLES.map(v => (
            <ToggleRow key={v.id} variable={v} />
          ))}
        </div>
      </section>
    </>
  );
}
