import React from 'react';
import ReactDOM from 'react-dom/client';
import { connectShellTheme } from '@avplan/ui/embed';
import { initShellSettings } from './shellSettings';
import App from './App';
import './index.css';

// In die Suite-Shell eingebettet? Dann folgt das Theme der Shell (No-op im
// Standalone-Betrieb — window.parent === window).
connectShellTheme();
// Suite-Einstellungen (FOV, Edit-Modus, Wand-Snap, Zoom …) von der Shell übernehmen.
initShellSettings();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
