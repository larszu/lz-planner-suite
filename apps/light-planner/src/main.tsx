import React from 'react';
import ReactDOM from 'react-dom/client';
import { connectShellTheme } from '@avplan/ui/embed';
import { ErrorBoundary } from '@avplan/ui';
import { initShellSettings } from './shellSettings';
import { themaAnwenden } from './lib/thema';
import { isEmbedded } from './hooks/useIsEmbedded';
import App from './App';

// In die Suite-Shell eingebettet? Dann folgt das Theme der Shell (No-op im
// Standalone-Betrieb — window.parent === window). Palette der Shell auf die
// eigenen Variablen abbilden, damit die Farben zur Shell passen (auch Light).
connectShellTheme({
  '--av-bg': '--bg',
  '--av-surface-3': '--bg-2',
  '--av-surface-4': '--bg-2',
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
// Das Thema VOR dem ersten Rendern setzen: sonst zeigt die App fuer einen
// Wimpernschlag das Vorgabe-Thema und springt dann um.
//
// NUR STANDALONE, und das ist keine Vorsicht, sondern eine Reihenfolge: in
// der Shell kommt das Thema per `avplan:theme` herein, `connectShellTheme`
// setzt `data-theme` und schreibt die Palette als Inline-Variablen ans
// Wurzelelement. Wuerde hier die lokal gespeicherte Wahl angewendet, saehe
// der eingebettete Planer bis zur ersten Shell-Nachricht anders aus als der
// Rest der Suite — genau das Umspringen, das diese Zeile verhindern soll,
// nur eine Ebene hoeher. Die Shell ist die Quelle; `src/lib/thema.ts` gilt
// fuer die Web-Seite und die Electron-Fassung.
if (!isEmbedded) themaAnwenden();

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
