import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';

// Bootstrap placeholder.
// Step 12 will replace this inline tree with the full <App /> component
// once all pages are assembled, so every intermediate build stays green.
function Boot() {
  return (
    <div className="app-boot">
      <div className="app-boot__mark" aria-hidden="true">
        <span className="app-boot__dot" />
      </div>
      <div className="app-boot__title">SwingMatrix</div>
      <div className="app-boot__hint">Simulation engine loading…</div>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Boot />
  </React.StrictMode>
);
