import React from 'react';
import ReactDOM from 'react-dom/client';
import { connectShellTheme, declareNoHistory } from '@avplan/ui/embed';
import { initShellSeed } from './utils/shellSeedBridge';
import { themaAnwenden } from './lib/thema';
import { isEmbedded } from './hooks/useIsEmbedded';
import { initShellReveal } from './utils/shellRevealBridge';
import { initShellSettings } from './shellSettings';
import App from './App';
import './index.css';
import { loadZoom, applyZoom } from './utils/uiZoom';

// Gespeicherten UI-Zoom vor dem ersten Render anwenden (kein Flash).
applyZoom(loadZoom());

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

// In die Suite-Shell eingebettet? Dann folgt das Theme der Shell (No-op im
// Standalone-Betrieb — window.parent === window). Vollständigen Shell-Token-Satz
// auf die --color-bc-* Variablen abbilden, damit die Farben (inkl. Light-Mode,
// sunken/raised Flächen, gedämpfte Ränder, sekundärer Text) zur Shell passen.
connectShellTheme({
  '--av-bg': '--color-bc-dark',
  '--av-surface-1': '--color-bc-panel',
  '--av-surface-2': '--color-bc-panel-2',
  '--av-surface-3': '--color-bc-canvas',
  '--av-surface-4': '--color-bc-panel-2',
  '--av-border': '--color-bc-border',
  '--av-border-muted': '--color-bc-border',
  '--av-text': '--color-bc-text',
  '--av-text-secondary': '--color-bc-text',
  '--av-text-muted': '--color-bc-text-muted',
  '--av-text-faint': '--color-bc-text-muted',
  '--av-accent': '--color-bc-accent',
  '--av-accent-text': '--color-bc-text',
  '--av-ok': '--color-bc-green',
  '--av-warn': '--color-bc-yellow',
  '--av-danger': '--color-bc-red',
});
// MultiCam hat keine eigene Undo/Redo-Historie — der Shell melden, damit sie
// ihre Undo/Redo-Schalter ausblendet statt sie dauerhaft grau zu zeigen.
declareNoHistory();
// Projekt der Shell uebernehmen und eigene Aenderungen zurueckmelden.
initShellSeed();

// E-11 — der Cross-Link reicht bis hier herein: die Shell zeigt auf eine
// Seed-Id, dieser Planer waehlt die Kamera aus. Kennt er die Id nicht, sagt
// er es — die Shell zeigt es dem Nutzer.
initShellReveal();
// Suite-Einstellungen (FOV, Edit-Modus, Wand-Snap, Zoom …) von der Shell übernehmen.
initShellSettings();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
