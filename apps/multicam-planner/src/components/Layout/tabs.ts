// ───────────────────────────────────────────────────────────────────────────
// Die Ansichten dieses Werkzeugs — EINE Liste.
//
// Sie steht in einer eigenen Datei und nicht in `Header.tsx`, weil zwei
// Stellen sie brauchen: die Reiter in der Kopfzeile und die Kommandopalette
// (ADR-007 Abschnitt 6, „derselbe Griff ueberall"). Zwei Listen waeren zwei
// Wahrheiten — wer eine Ansicht hinzufuegt, fuegt sie in der Kopfzeile hinzu
// und vergisst die Palette, und der Griff, der ueberall gleich sein soll,
// kennt in einem Werkzeug einen Eintrag weniger.
//
// Das Zeichen steht als KOMPONENTE hier, nicht als fertiges Element: so
// bleibt die Datei frei von JSX, und Fast-Refresh beschwert sich nicht ueber
// eine Komponenten-Datei, die auch Konstanten exportiert.
// ───────────────────────────────────────────────────────────────────────────
import { FiLayout, FiBox, FiMonitor, FiSliders, FiFilm, FiMove } from 'react-icons/fi';
import type { IconType } from 'react-icons';

export interface TabDef {
  id: string;
  /** i18n-Schluessel; fehlt er, steht `label` fuer sich. */
  key?: string;
  label: string;
  Icon: IconType;
}

// OVERLAY (Suite): die Reiter tragen hier zusaetzlich ihren i18n-Schluessel.
// Upstream ist die App einsprachig; in der Suite laeuft sie neben zwei
// uebersetzten Planern, und ein englischer Reiter neben deutschen Panels ist
// genau die Uneinheitlichkeit, gegen die ADR-007 geschrieben ist. Shotlist
// und Rig bleiben ohne Schluessel — sie heissen in beiden Sprachen so.
export const TABS: TabDef[] = [
  { id: 'tab-2d', key: 'header.tab.2dPlan', label: '2D Plan', Icon: FiLayout },
  { id: 'tab-3d', key: 'header.tab.3dView', label: '3D View', Icon: FiBox },
  { id: 'tab-preview', key: 'header.tab.preview', label: 'Preview', Icon: FiMonitor },
  { id: 'tab-calc', key: 'header.tab.calculator', label: 'Calculator', Icon: FiSliders },
  { id: 'tab-shotlist', label: 'Shotlist', Icon: FiFilm },
  { id: 'tab-rig', label: 'Rig', Icon: FiMove },
];
