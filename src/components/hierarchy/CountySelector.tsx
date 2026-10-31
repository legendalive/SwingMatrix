import { useEffect, useRef, useState } from 'react';
import { KENYA_COUNTIES, findCounty, NATIONAL_REGISTERED_VOTERS } from '../../constants/kenya';
import { useSimulationStore } from '../../store/simulationStore';

const styles = `
.county { position: relative; }
.county__trigger {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--sp-3);
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--fs-sm);
  text-align: left;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.county__trigger:hover { border-color: var(--border-strong); }
.county__trigger[aria-expanded="true"] { border-color: var(--accent-primary); }
.county__trigger-name { font-weight: 500; }
.county__trigger-meta {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}
.county__chevron {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform var(--dur-fast) var(--ease-out);
}
.county__trigger[aria-expanded="true"] .county__chevron {
  transform: rotate(180deg);
}
.county__panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 30;
  max-height: 340px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.county__search {
  padding: var(--sp-2);
  border-bottom: 1px solid var(--border-subtle);
}
.county__search input {
  width: 100%;
  padding: 8px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: var(--fs-sm);
  font-family: inherit;
}
.county__search input:focus {
  outline: none;
  border-color: var(--accent-primary);
}
.county__list {
  overflow-y: auto;
  padding: var(--sp-1);
  margin: 0;
  list-style: none;
}
.county__row {
  width: 100%;
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--sp-3);
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  font-size: var(--fs-sm);
  text-align: left;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
.county__row:hover { background: var(--bg-surface); }
.county__row[aria-selected="true"] {
  background: var(--accent-primary-soft);
  color: var(--accent-primary);
}
.county__row-name { font-weight: 500; }
.county__row-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}
.county__row[aria-selected="true"] .county__row-meta { color: var(--accent-primary); }
.county__empty {
  padding: var(--sp-3);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--fs-xs);
}
`;

function formatVoters(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function CountySelector() {
  const selectedCode = useSimulationStore(s => s.geography.countyCode);
  const setCounty = useSimulationStore(s => s.setCounty);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = selectedCode ? findCounty(selectedCode) : null;
  const triggerName = selected ? selected.name : 'National (all counties)';
  const triggerVoters = selected
    ? selected.registeredVoters
    : NATIONAL_REGISTERED_VOTERS;

  const filtered = query.trim()
    ? KENYA_COUNTIES.filter(c =>
        c.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : KENYA_COUNTIES;

  const choose = (code: string | null) => {
    setCounty(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="county" ref={containerRef}>
        <button
          type="button"
          className="county__trigger"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen(o => !o)}
        >
          <span className="county__trigger-name">{triggerName}</span>
          <span className="county__trigger-meta">
            {formatVoters(triggerVoters)}
            <span className="county__chevron" aria-hidden="true"> ▾</span>
          </span>
        </button>

        {open && (
          <div className="county__panel" role="dialog" aria-label="Select county">
            <div className="county__search">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search counties…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <ul className="county__list" role="listbox">
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedCode === null}
                  className="county__row"
                  onClick={() => choose(null)}
                >
                  <span className="county__row-name">National (all counties)</span>
                  <span className="county__row-meta">
                    {formatVoters(NATIONAL_REGISTERED_VOTERS)}
                  </span>
                </button>
              </li>
              {filtered.length === 0 ? (
                <li className="county__empty">No county matches “{query}”.</li>
              ) : (
                filtered.map(c => (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedCode === c.code}
                      className="county__row"
                      onClick={() => choose(c.code)}
                    >
                      <span className="county__row-name">{c.name}</span>
                      <span className="county__row-meta">
                        {formatVoters(c.registeredVoters)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
