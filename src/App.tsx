import { useEffect, useState } from 'react';
import { TopNav } from './components/layout/TopNav';
import type { View } from './components/layout/TopNav';
import { SimulatorPage } from './pages/SimulatorPage';
import { DocsPage } from './pages/DocsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { bootstrapWorldBank } from './api/bootstrapWorldBank';

export function App() {
  const [view, setView] = useState<View>('simulator');

  useEffect(() => {
    // Fire-and-forget bootstrap. On success, updates untouched sliders
    // to the latest World Bank observations. On failure, sliders keep
    // their documented defaults and provenance shows the error.
    void bootstrapWorldBank();
  }, []);

  return (
    <>
      <TopNav current={view} onSelect={setView} />
      {view === 'simulator' && <SimulatorPage />}
      {view === 'docs' && <DocsPage />}
      {view === 'disclaimer' && <DisclaimerPage />}
    </>
  );
}
