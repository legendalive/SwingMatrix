import { useEffect, useState } from 'react';
import { SLIDER_VARIABLES, TOGGLE_VARIABLES } from '../../constants/variables';
import { runMonteCarlo } from '../../engine/monteCarlo';
import { useSimulationResults } from '../../store/selectors';
import { useSimulationStore } from '../../store/simulationStore';
import type { SimulationState } from '../../types/simulation';
import {
  bootstrapGdelt,
  useGdeltStore,
  isAdverseHeadline,
  NEWS_SHOCK_MAX,
} from '../../api/bootstrapGdelt';

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
.news {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--sp-5);
}
.news__head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--sp-3);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--sp-3);
}
.news__title { font-size: var(--fs-md); font-weight: 600; }
.news__status {
  font-size: var(--fs-xs); color: var(--text-muted);
  font-family: var(--font-mono);
}
.news__badge {
  display: inline-block; padding: 2px 6px; border-radius: 4px;
  font-size: 10px; font-weight: 500; text-transform: uppercase;
  letter-spacing: 0.04em;
}
.news__badge--ok { background: var(--accent-success-soft); color: var(--accent-success); }
.news__badge--loading { background: var(--accent-warning-soft); color: var(--accent-warning); }
.news__badge--error { background: rgba(239,68,68,0.12); color: var(--accent-danger); }
.news__summary {
  display: flex; flex-wrap: wrap; gap: var(--sp-3) var(--sp-5);
  padding: var(--sp-3);
  background: var(--bg-inset);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-bottom: var(--sp-3);
}
.news__stat { display: inline-flex; gap: 6px; align-items: baseline; }
.news__stat-label { color: var(--text-muted); text-transform: uppercase; font-size: 10px; letter-spacing: 0.04em; }
.news__stat-value { color: var(--text-primary); font-family: var(--font-mono); }
.news__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--sp-2); }
.news__item {
  display: flex; gap: var(--sp-3); align-items: flex-start;
  padding: var(--sp-2) 0;
  border-bottom: 1px solid var(--border-subtle);
}
.news__item:last-child { border-bottom: none; padding-bottom: 0; }
.news__item:first-child { padding-top: 0; }
.news__dot {
  width: 6px; height: 6px; border-radius: 999px; margin-top: 6px; flex-shrink: 0;
  background: var(--text-muted);
}
.news__dot--adverse { background: var(--accent-danger); }
.news__link {
  flex: 1; font-size: var(--fs-sm); color: var(--text-primary);
  line-height: 1.5;
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.news__link:hover { color: var(--accent-primary); text-decoration: none; }
.news__meta {
  font-size: 11px; color: var(--text-muted);
  font-family: var(--font-mono);
  flex-shrink: 0;
  white-space: nowrap;
}
.news__empty {
  font-size: var(--fs-sm); color: var(--text-muted);
  padding: var(--sp-3) 0; text-align: center;
}
.news__foot {
  margin-top: var(--sp-3);
  padding-top: var(--sp-3);
  border-top: 1px solid var(--border-subtle);
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}
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
.sens__grid { display: flex; flex-direction: column; gap: var(--sp-3); }
.sens__row { display: grid; grid-template-columns: 1fr 100px 56px; gap: var(--sp-3); align-items: center; }
.sens__label { font-size: var(--fs-sm); color: var(--text-primary); }
.sens__kind {
  font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--text-muted); margin-left: 6px;
}
.sens__bar { height: 6px; background: var(--bg-inset); border-radius: 999px; overflow: hidden; position: relative; }
.sens__bar-fill {
  position: absolute; top: 0; left: 0; bottom: 0;
  background: var(--accent-primary); border-radius: 999px;
  transition: width var(--dur-base) var(--ease-out);
}
.sens__value {
  font-family: var(--font-mono); font-size: var(--fs-xs);
  color: var(--text-secondary); text-align: right;
}
.sens__empty { font-size: var(--fs-sm); color: var(--text-muted); padding: var(--sp-4) 0; text-align: center; }
.sens__busy { font-size: 11px; color: var(--text-muted); font-style: italic; }
`;

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function NewsPulse() {
  const report = useGdeltStore(s => s.report);
  const shock = NEWS_SHOCK_MAX * report.magnitude;

  return (
    <section className="news" aria-labelledby="news-title">
      <header className="news__head">
        <div>
          <h2 id="news-title" className="news__title">News pulse</h2>
          <span className="sens__sub" style={{ display: 'block', marginTop: 2 }}>
            Live coverage of Kenyan politics · GDELT DOC 2.0
          </span>
        </div>
        <span className={`news__badge news__badge--${report.status}`}>
          {report.status === 'loading' ? 'Loading'
            : report.status === 'ok' ? 'Live'
            : report.status === 'error' ? 'Unavailable'
            : 'Idle'}
        </span>
      </header>

      {report.status === 'loading' && (
        <p className="news__empty">Fetching headlines…</p>
      )}

      {report.status === 'error' && (
        <p className="news__empty">
          {report.error ?? 'Could not reach GDELT.'} News-sentiment shock
          will be zero until headlines load.
        </p>
      )}

      {report.status === 'ok' && report.totalCount === 0 && (
        <p className="news__empty">
          No recent Kenya politics coverage returned. News-sentiment shock
          is zero.
        </p>
      )}

      {report.status === 'ok' && report.totalCount > 0 && (
        <>
          <div className="news__summary">
            <span className="news__stat">
              <span className="news__stat-label">Adverse</span>
              <span className="news__stat-value">
                {report.adverseCount} / {report.totalCount}
              </span>
            </span>
            <span className="news__stat">
              <span className="news__stat-label">Magnitude</span>
              <span className="news__stat-value">{report.magnitude.toFixed(2)}</span>
            </span>
            <span className="news__stat">
              <span className="news__stat-label">Shock if toggled</span>
              <span className="news__stat-value">−{shock.toFixed(2)}</span>
            </span>
          </div>
          <ul className="news__list">
            {report.articles.slice(0, 5).map(a => {
              const adverse = isAdverseHeadline(a.title);
              return (
                <li className="news__item" key={a.url}>
                  <span
                    className={`news__dot${adverse ? ' news__dot--adverse' : ''}`}
                    aria-label={adverse ? 'adverse framing' : 'neutral framing'}
                  />
                  <a
                    className="news__link"
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.title}
                  </a>
                  <span className="news__meta">
                    {a.domain} · {timeAgo(a.publishedAt)}
                  </span>
                </li>
              );
            })}
          </ul>
          {report.articles.length > 5 && (
            <p className="news__foot">
              Showing 5 of {report.articles.length} recent articles.
            </p>
          )}
          <p className="news__foot">
            When toggled, the news-sentiment shock applies −{shock.toFixed(2)}
            utility to the incumbent. Red dots mark headlines matching an
            adverse-coverage pattern (corruption, crisis, protest, etc.).
          </p>
        </>
      )}
    </section>
  );
}

export function SensitivityTable() {
  useEffect(() => {
    void bootstrapGdelt();
  }, []);

  const results = useSimulationResults();
  const candidates = useSimulationStore(s => s.candidates);
  const sliders = useSimulationStore(s => s.sliders);
  const toggles = useSimulationStore(s => s.toggles);
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const geography = useSimulationStore(s => s.geography);
  const newsMagnitude = useGdeltStore(s => s.report.magnitude);

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
    newsMagnitude,
  ]);

  const maxDelta = Math.max(0.01, ...impact.map(r => r.delta));

  return (
    <>
      <style>{styles}</style>
      <NewsPulse />
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
