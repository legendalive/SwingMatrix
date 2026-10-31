import type { ReactNode } from 'react';

interface AppShellProps {
  controlsSlot: ReactNode;
  resultsSlot: ReactNode;
  /**
   * @deprecated The app header now lives in <TopNav /> rendered at the
   * App level. This prop is accepted for backward compatibility only
   * and is not rendered.
   */
  navSlot?: ReactNode;
}

const styles = `
.shell {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-h));
  background: var(--bg-base);
  color: var(--text-primary);
}
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
}
`;

export function AppShell({ controlsSlot, resultsSlot }: AppShellProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="shell">
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
