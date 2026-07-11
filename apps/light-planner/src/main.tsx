import React from 'react';
import ReactDOM from 'react-dom/client';
import { connectShellTheme } from '@avplan/ui/embed';
import { ErrorBoundary } from '@avplan/ui';
import { initShellSettings } from './shellSettings';
import App from './App';

// In die Suite-Shell eingebettet? Dann folgt das Theme der Shell (No-op im
// Standalone-Betrieb — window.parent === window). Palette der Shell auf die
// eigenen Variablen abbilden, damit die Farben zur Shell passen (auch Light).
connectShellTheme({
  '--av-bg': '--bg',
  '--av-surface-3': '--bg-2',
  '--av-surface-1': '--panel',
  '--av-surface-2': '--panel-alt',
  '--av-border': '--border',
  '--av-border-muted': '--line-2',
  '--av-text': '--text',
  '--av-text-secondary': '--text2',
  '--av-text-faint': '--text3',
  '--av-accent': '--accent',
  '--av-accent-text': '--accent-text',
  '--av-ok': '--success',
  '--av-warn': '--warn',
  '--av-danger': '--danger',
});
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
