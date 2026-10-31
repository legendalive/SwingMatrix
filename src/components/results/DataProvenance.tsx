import { SLIDER_VARIABLES, TOGGLE_VARIABLES } from '../../constants/variables';
import { useSimulationStore } from '../../store/simulationStore';
import { findCounty, SEAT_LABELS } from '../../constants/kenya';
import { DEFAULT_ITERATIONS } from '../../engine/monteCarlo';
import { useFetchStore } from '../../api/bootstrapWorldBank';
import type { IndicatorFetchState } from '../../api/bootstrapWorldBank';

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
.ind {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 11px;
  padding: 2px 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-secondary);
}
.ind__dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: var(--text-muted);
}
.ind--ok .ind__dot { background: var(--accent-success); }
.ind--error .ind__dot { background: var(--accent-danger); }
.ind--loading .ind__dot {
  background: var(--accent-warning);
  animation: pulse 1.2s ease-in-out infinite;
}
.ind__year {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
`;

function IndicatorChip({ report }: { report: IndicatorFetchState | undefined }) {
  if (!report) {
    return (
      <span className="ind ind--idle">
        <span className="ind__dot" />
        idle
      </span>
    );
  }

  if (report.status === 'loading') {
    return (
      <span className="ind ind--loading" title={`Fetching ${report.code}`}>
        <span className="ind__dot" />
        {report.code}
      </span>
    );
  }

  if (report.status === 'error') {
    return (
      <span
        className="ind ind--error"
        title={report.error ?? 'Fetch failed; slider uses documented default'}
      >
        <span className="ind__dot" />
        {report.code}
      </span>
    );
  }

  return (
    <span className="ind ind--ok" title={`Latest observation: ${report.year}`}>
      <span className="ind__dot" />
      {report.code}
      {report.year !== undefined && <span className="ind__year">{report.year}</span>}
    </span>
  );
}

export function DataProvenance() {
  const toggles = useSimulationStore(s => s.toggles);
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const geography = useSimulationStore(s => s.geography);
  const reports = useFetchStore(s => s.reports);

  const codedSliders = SLIDER_VARIABLES.filter(v => v.worldBankCode !== null);

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
          <span className="prov__key">Live indicators</span>
          <div className="prov__code-list">
            {codedSliders.map(slider => (
              <IndicatorChip
                key={slider.id}
                report={reports[slider.worldBankCode as string]}
              />
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
          ). Values refresh on app load and are cached for 24 hours. Sliders
          you have already adjusted keep your value; untouched sliders update
          to the latest observation. SwingMatrix is a simulation engine, not
          an election prediction tool.
        </p>
      </footer>
    </>
  );
}
