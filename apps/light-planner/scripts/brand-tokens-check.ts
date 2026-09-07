// Waechter fuer die Oberflaechen-Regeln (ADR-007 der av-planner-suite).
// Lauf: `npm run brand:check`  (node --experimental-strip-types).
//
// ─── WARUM DIESE DATEI DIE WERTE EIN ZWEITES MAL TRAEGT ─────────────────────
//
// Sie stehen maschinenlesbar in `@avplan/ui` (`src/brand.ts`) — aber der
// Light-Planer haengt nicht an diesem Paket: er wird in die Suite vendoriert,
// nicht umgekehrt. Ohne diesen Check waere der Rueckweg in die alte
// Blau-Grau-Welt eine Zeile, die niemandem auffaellt. Regeln, die nur in
// einem Dokument stehen, driften.
//
// Was er NICHT prueft: ob die Werte gut sind. Das entscheidet das
// Marken-Handbuch, nicht ein Skript.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const hier = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(hier, '..', 'src/App.css'), 'utf8');

const token = (name: string): string => {
  const m = css.match(new RegExp(`\\${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : '';
};

// ── 1. Die Palette ist die der Marke ──────────────────────────────────────
assert.equal(token('--bg'), '#132040', 'Grund ist Deep Navy');
assert.equal(token('--panel'), '#1D324F', 'Flaeche ist Zumpe Navy');
assert.equal(token('--text'), '#E1ECEF', 'Fliesstext ist Eisblau');
assert.equal(token('--text2'), '#8C9CB3', 'Gedaempft ist Stahlblau');
assert.equal(token('--accent'), '#F6F5F0', 'Aktionsflaeche ist Off-White');

// ── 2. Status ist nicht Signal ────────────────────────────────────────────
assert.equal(token('--danger'), '#B04A3F', 'Fehlerrot ist der Status-Ton');
assert.equal(token('--success'), '#2F7D5C');
assert.equal(token('--warn'), '#C8892B');
assert.equal(token('--signal'), '#D6402E', 'Tally-Rot ist das Signal');
assert.notEqual(token('--danger'), token('--signal'), 'zwei Toene, zwei Zwecke');

// ── 3. Rot kommt genau einmal vor: in der Definition des Signals ──────────
const rotZeilen = css
  .split('\n')
  .map((z) => z.trim())
  .filter((z) => z.toUpperCase().includes('#D6402E'));
assert.ok(
  rotZeilen.every((z) => z.startsWith('--signal:') || z.includes('var(--signal)')),
  `Tally-Rot steht ausserhalb von --signal: ${rotZeilen.join(' | ')}`,
);

// ── 4. Der Fokusring ist das Signal ───────────────────────────────────────
assert.ok(css.includes('outline: 2px solid var(--signal)'), 'Fokusring fehlt');
assert.ok(css.includes('outline-offset: 3px'), 'Fokus-Abstand fehlt');

// ── 5. Keine Rundungen, keine Verlaeufe, keine Schatten ───────────────────
assert.equal(token('--radius'), '0', 'Radius ist null');
assert.ok(!/border-radius:\s*(50%|[1-9])/.test(css), 'harter Radius gefunden');
assert.ok(!/linear-gradient|radial-gradient/.test(css), 'Verlauf gefunden');
// Der Lookahead sitzt DIREKT hinter dem Doppelpunkt: mit `\s*` davor
// koennte das Muster ein Leerzeichen weniger nehmen und `none` doch noch
// als Treffer lesen.
assert.ok(!/box-shadow:(?!\s*none\s*;)[^;]+;/.test(css), 'Schatten gefunden');

// ── 6. Der Rahmen: Kopfzeile 40 px, Statusleiste 24 px, Kopflinie ────────
//
// ADR-007 Abschnitt 6 nennt Zahlen, und Zahlen kann man messen. Vorher war
// die Menueleiste 30 px hoch (eine Zahl aus keiner Regel) und die
// Statusleiste hatte gar keine — sie ergab sich aus ihrem Inhalt. Ohne
// diesen Check waeren beide beim naechsten Umbau wieder ein Zufall.
const regel = (klasse: string): string => {
  const m = css.match(new RegExp(`\\.${klasse}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `Regel .${klasse} fehlt in src/App.css`);
  return m![1];
};
assert.match(regel('menubar'), /height:\s*40px/, 'Kopfzeile ist 40 px');
assert.match(regel('menubar'), /flex:\s*none/, 'Kopfzeile schrumpft nicht mit');
assert.match(regel('statusbar'), /height:\s*24px/, 'Statusleiste ist 24 px');
assert.match(regel('statusbar'), /flex:\s*none/, 'Statusleiste schrumpft nicht mit');
assert.match(
  regel('panel-head'),
  /border-bottom:\s*1px solid var\(--accent\)/,
  'Kopflinie ist der Akzent',
);
// Die Rail steht im Raster der App und nicht in einer eigenen Regel.
assert.match(css, /grid-template-columns:\s*56px/, 'Rail ist 56 px');

// ── 7. Strg/Cmd + K gehoert hier der Shell ───────────────────────────────
//
// OVERLAY (Suite): Upstream prueft an dieser Stelle, dass die App eine eigene
// Kommandopalette hat und sie aus dem Menue-Modell speist. In der Suite gilt
// das Gegenteil, und zwar aus derselben Regel: ADR-007 Abschnitt 6 verlangt
// „derselbe Griff ueberall" — genau deshalb darf es nicht ZWEI Paletten auf
// derselben Taste geben. Der eingebettete Planer laeuft im iframe der Shell,
// und die Shell hoert bereits auf Strg/Cmd+K.
//
// Upstream haengt die Palette in der `MenuBar`; hier bedient die `TopBar`,
// die MenuBar ist toter Upstream-Code (siehe DEAD_UPSTREAM in
// scripts/planner-drift.mjs). Mitvendoriert waeren es zwei Dateien, die
// nichts mountet. Der Waechter haelt beides fest, damit weder das eine noch
// das andere unbemerkt zurueckkommt.
const lies = (rel: string): string => readFileSync(resolve(hier, '..', rel), 'utf8');
const existiert = (rel: string): boolean => {
  try {
    readFileSync(resolve(hier, '..', rel), 'utf8');
    return true;
  } catch {
    return false;
  }
};
assert.ok(
  !existiert('src/components/CommandPalette.tsx'),
  'Die Suite-Kopie traegt keine eigene Kommandopalette — Strg/Cmd+K gehoert der Shell',
);
const app = lies('src/App.tsx');
assert.match(app, /import TopBar from '\.\/components\/TopBar'/,
  'die Suite-Kopie bedient ueber die TopBar');
assert.ok(!app.includes('<CommandPalette'),
  'keine zweite Palette im eingebetteten Planer');

console.log('brand:check ok — Oberflaechen-Regeln (ADR-007) eingehalten');
