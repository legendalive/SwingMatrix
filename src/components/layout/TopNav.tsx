export type View = 'simulator' | 'docs' | 'disclaimer';

interface TopNavProps {
  current: View;
  onSelect: (view: View) => void;
}

const styles = `
.topnav {
  height: var(--header-h);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  padding: 0 var(--sp-5);
  gap: var(--sp-5);
  position: sticky;
  top: 0;
  z-index: 20;
}
.topnav__brand {
  display: flex; align-items: center; gap: var(--sp-3);
  user-select: none;
}
.topnav__mark {
  width: 26px; height: 26px; border-radius: 8px;
  border: 2px solid var(--accent-primary);
  display: grid; place-items: center;
}
.topnav__dot {
  width: 7px; height: 7px; border-radius: 999px;
  background: var(--accent-warning);
}
.topnav__name {
  font-size: var(--fs-md); font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}
.topnav__tag {
  font-size: var(--fs-xs); color: var(--text-muted);
  border-left: 1px solid var(--border-subtle);
  padding-left: var(--sp-3); margin-left: var(--sp-1);
}
.topnav__nav {
  margin-left: auto;
  display: flex; gap: 2px;
  padding: 4px;
  background: var(--bg-inset);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}
.topnav__btn {
  padding: 6px 12px;
  font-size: var(--fs-xs);
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out);
}
.topnav__btn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
.topnav__btn[aria-current="page"] {
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}
@media (max-width: 720px) {
  .topnav { padding: 0 var(--sp-4); gap: var(--sp-3); }
  .topnav__tag { display: none; }
  .topnav__name { font-size: var(--fs-sm); }
  .topnav__btn { padding: 6px 8px; }
}
`;

const LABELS: Record<View, string> = {
  simulator: 'Simulator',
  docs: 'Documentation',
  disclaimer: 'Disclaimer',
};

const ORDER: View[] = ['simulator', 'docs', 'disclaimer'];

export function TopNav({ current, onSelect }: TopNavProps) {
  return (
    <>
      <style>{styles}</style>
      <header className="topnav">
        <div className="topnav__brand">
          <div className="topnav__mark" aria-hidden="true">
            <span className="topnav__dot" />
          </div>
          <span className="topnav__name">SwingMatrix</span>
          <span className="topnav__tag">Simulation engine</span>
        </div>
        <nav className="topnav__nav" aria-label="Views">
          {ORDER.map(v => (
            <button
              key={v}
              type="button"
              className="topnav__btn"
              aria-current={current === v ? 'page' : undefined}
              onClick={() => onSelect(v)}
            >
              {LABELS[v]}
            </button>
          ))}
        </nav>
      </header>
    </>
  );
}
