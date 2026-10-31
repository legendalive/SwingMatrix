import { SLIDER_VARIABLES, TOGGLE_VARIABLES } from '../../constants/variables';
import { useSimulationStore } from '../../store/simulationStore';
import { findCounty, SEAT_LABELS } from '../../constants/kenya';
import { DEFAULT_ITERATIONS } from '../../engine/monteCarlo';

const styles = `
.prov {
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--sp-4);
  display: flex; flex-direction: column; gap: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}
.prov__line { display: flex; flex-wrap: wrap; gap: var(--sp-2); align-items: baseline; }
.prov__key {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  font-weight: 600;
  flex-shrink: 0;
  min-width: 92px;
}
.prov__val { color: var(--text-primary); }
.prov__code {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 1px 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-secondary);
}
.prov__code-list { display: flex; flex-wrap: wrap; gap: 6px; }
`;

export function DataProvenance() {
  const sliders = useSimulationStore(s => s.sliders);
  const toggles = useSimulationStore(s => s.toggles);
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const geography = useSimulationStore(s => s.geography);

  const activeIndicators = SLIDER_VARIABLES.filter(
    v => v.worldBankCode !== null
  ).map(v => v.worldBankCode as string);

  const activeToggles = TOGGLE_VARIABLES.filter(
    v => toggles[v.id] === true
  ).map(v => v.label);

  const scopeLabel = geography.countyCode
    ? findCounty(geography.countyCode)?.name ?? 'County'
    : 'National';

  return (
    <>
      <style>{styles}</style>
      <footer className="prov" aria-label="Data provenance">
        <div className="prov__line">
          <span className="prov__key">Scope</span>
          <span className="prov__val">
            {scopeLabel} · {SEAT_LABELS[selectedSeat]}
          </span>
        </div>

        <div className="prov__line">
          <span className="prov__key">Draws</span>
          <span className="prov__val">
            {DEFAULT_ITERATIONS.toLocaleString()} Monte Carlo iterations per
            computation
          </span>
        </div>

        <div className="prov__line">
          <span className="prov__key">Indicators</span>
          <div className="prov__code-list">
            {activeIndicators.map(code => (
              <span key={code} className="prov__code">
                {code}
              </span>
            ))}
          </div>
        </div>

        <div className="prov__line">
          <span className="prov__key">Active shocks</span>
          <span className="prov__val">
            {activeToggles.length === 0
              ? 'None'
              : activeToggles.join(' · ')}
          </span>
        </div>

        <div className="prov__line">
          <span className="prov__key">Model</span>
          <span className="prov__val">
            Logit spatial voting · Gumbel shocks · ±5% running-mate cap ·
            incumbent-targeted qualitative effects
          </span>
        </div>

        <p style={{ marginTop: 'var(--sp-2)', lineHeight: 1.5 }}>
          Indicator codes refer to the World Bank Indicators API (
          <span className="prov__code" style={{ display: 'inline' }}>
            api.worldbank.org/v2
          </span>
          ). News-derived shocks read from GDELT DOC 2.0 and Google News RSS
          when toggled. SwingMatrix is a simulation engine, not an election
          prediction tool.
        </p>
      </footer>
    </>
  );
}
