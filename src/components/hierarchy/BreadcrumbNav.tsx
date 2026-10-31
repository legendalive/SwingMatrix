import { findCounty } from '../../constants/kenya';
import { useSimulationStore } from '../../store/simulationStore';

const styles = `
.crumb {
  display: flex; align-items: center; gap: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--text-muted);
  padding: var(--sp-1) 0;
}
.crumb__list {
  display: flex; align-items: center; gap: var(--sp-2);
  list-style: none; margin: 0; padding: 0;
}
.crumb__item { display: inline-flex; align-items: center; gap: var(--sp-2); }
.crumb__sep { color: var(--border-strong); user-select: none; }
.crumb__button {
  background: none; border: none; padding: 2px 4px;
  font-size: var(--fs-xs); color: var(--text-secondary);
  border-radius: 4px; cursor: pointer;
  transition: color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out);
}
.crumb__button:hover {
  color: var(--accent-primary);
  background: var(--accent-primary-soft);
}
.crumb__current {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  font-weight: 500;
  padding: 2px 4px;
}
.crumb__label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  margin-right: var(--sp-1);
}
`;

export function BreadcrumbNav() {
  const geography = useSimulationStore(s => s.geography);
  const setCounty = useSimulationStore(s => s.setCounty);

  const county = geography.countyCode ? findCounty(geography.countyCode) : null;

  return (
    <>
      <style>{styles}</style>
      <nav className="crumb" aria-label="Geographic scope">
        <span className="crumb__label">Scope</span>
        <ol className="crumb__list">
          <li className="crumb__item">
            {county ? (
              <button
                type="button"
                className="crumb__button"
                onClick={() => setCounty(null)}
              >
                Kenya
              </button>
            ) : (
              <span className="crumb__current">Kenya</span>
            )}
          </li>
          {county && (
            <>
              <li className="crumb__item">
                <span className="crumb__sep" aria-hidden="true">
                  ›
                </span>
              </li>
              <li className="crumb__item">
                <span className="crumb__current">{county.name}</span>
              </li>
            </>
          )}
        </ol>
      </nav>
    </>
  );
}
