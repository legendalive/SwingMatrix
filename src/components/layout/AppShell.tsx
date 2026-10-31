import type { ReactNode } from 'react';

interface AppShellProps {
  controlsSlot: ReactNode;
  resultsSlot: ReactNode;
  navSlot?: ReactNode;
}

const styles = `
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
}
.shell__header {
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
.shell__brand { display: flex; align-items: center; gap: var(--sp-3); }
.shell__brand-mark {
  width: 26px; height: 26px; border-radius: 8px;
  border: 2px solid var(--accent-primary);
  display: grid; place-items: center;
}
.shell__brand-dot {
  width: 7px; height: 7px; border-radius: 999px;
  background: var(--accent-warning);
}
.shell__brand-name { font-size: var(--fs-md); font-weight: 600; letter-spacing: -0.01em; }
.shell__brand-tag {
  font-size: var(--fs-xs); color: var(--text-muted);
  border-left: 1px solid var(--border-subtle);
  padding-left: var(--sp-3); margin-left: var(--sp-1);
}
.shell__nav { margin-left: auto; display: flex; align-items: center; gap: var(--sp-3); }
.shell__main {
  flex: 1;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: var(--sp-5);
  padding: var(--sp-5);
  max-width: var(--max-content);
  width: 100%;
  margin: 0 auto;
}
.shell__controls {
  display: flex; flex-direction: column; gap: var(--sp-4);
  position: sticky;
  top: calc(var(--header-h) + var(--sp-5));
  align-self: start;
  max-height: calc(100vh - var(--header-h) - var(--sp-5) * 2);
  overflow-y: auto;
  padding-right: var(--sp-1);
}
.shell__results {
  display: flex; flex-direction: column; gap: var(--sp-5);
  min-width: 0;
}
.shell__footer {
  border-top: 1px solid var(--border-subtle);
  padding: var(--sp-4) var(--sp-5);
  color: var(--text-muted);
  font-size: var(--fs-xs);
  text-align: center;
}
@media (max-width: 980px) {
  .shell__main { grid-template-columns: 1fr; padding: var(--sp-4); }
  .shell__controls { position: static; max-height: none; overflow: visible; }
  .shell__brand-tag { display: none; }
}
`;

export function AppShell({ controlsSlot, resultsSlot, navSlot }: AppShellProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="shell">
        <header className="shell__header">
          <div className="shell__brand">
            <div className="shell__brand-mark" aria-hidden="true">
              <span className="shell__brand-dot" />
            </div>
            <span className="shell__brand-name">SwingMatrix</span>
            <span className="shell__brand-tag">Simulation engine</span>
          </div>
          <nav className="shell__nav">{navSlot}</nav>
        </header>

        <main className="shell__main">
          <aside className="shell__controls">{controlsSlot}</aside>
          <section className="shell__results">{resultsSlot}</section>
        </main>

        <footer className="shell__footer">
          SwingMatrix estimates outcomes under user-defined assumptions. It is not a prediction tool.
        </footer>
      </div>
    </>
  );
}
