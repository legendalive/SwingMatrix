import { useState } from 'react';
import { TopNav } from './components/layout/TopNav';
import type { View } from './components/layout/TopNav';
import { SimulatorPage } from './pages/SimulatorPage';
import { DocsPage } from './pages/DocsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';

export function App() {
  const [view, setView] = useState<View>('simulator');

  return (
    <>
      <TopNav current={view} onSelect={setView} />
      {view === 'simulator' && <SimulatorPage />}
      {view === 'docs' && <DocsPage />}
      {view === 'disclaimer' && <DisclaimerPage />}
    </>
  );
}
