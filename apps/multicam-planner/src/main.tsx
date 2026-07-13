import React from 'react';
import ReactDOM from 'react-dom/client';
import { connectShellTheme, declareNoHistory } from '@avplan/ui/embed';
import { initShellSettings } from './shellSettings';
import App from './App';
import './index.css';

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
// Suite-Einstellungen (FOV, Edit-Modus, Wand-Snap, Zoom …) von der Shell übernehmen.
initShellSettings();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
