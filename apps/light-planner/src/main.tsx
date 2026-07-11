import React from 'react';
import ReactDOM from 'react-dom/client';
import { connectShellTheme } from '@avplan/ui/embed';
import { ErrorBoundary } from '@avplan/ui';
import { initShellSettings } from './shellSettings';
import App from './App';

// In die Suite-Shell eingebettet? Dann folgt das Theme der Shell (No-op im
// Standalone-Betrieb — window.parent === window).
connectShellTheme();
// Suite-Einstellungen (Ansicht, Belichtung, Lichtkegel, Heatmap …) übernehmen.
initShellSettings();

// Standalone build → LightPlanner with the default browser HostAdapter.
// A host app instead does: <LightPlanner adapter={hostAdapter} onEquipmentChange={…} />
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary appName="Light Planner">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
