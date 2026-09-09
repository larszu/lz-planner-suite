// ───────────────────────────────────────────────────────────────────────────
// Die Grenze zum Show-Plan — gemessen, nicht behauptet (ADR-006).
// Lauf: `npm run grenze:check`  (node --experimental-strip-types).
//
// WOGEGEN DAS GESCHRIEBEN IST. Dieses Werkzeug beschreibt ein GEBÄUDE, das
// Jahre steht. Der Cable-Planner plant eine SHOW, die am Abbautag wieder
// eingepackt wird. Beide reden über Strom, über Dosen und über Kreise — und
// genau deshalb ist die Verwechslung hier leichter als irgendwo sonst in der
// Suite.
//
// Die Regel lautet: **das Gebäude kennt kein Show-Modell.** Kein
// `EquipmentItem`, kein `CablePlannerProject`, und vor allem kein
// `circuitSolver`: der Schaltbild-Rechner der Show ist Kern des Planers
// (ADR-006, Zeile „Stromplanung der Show"), und ihn hier nachzubauen hiesse,
// dieselbe Rechnung zweimal zu führen.
//
// Der Plan fragt dieses Werkzeug über den Vertrag (`src/domain/vertrag.ts`):
// sechs Fragen, ein Rückweg. Mehr Berührung gibt es nicht.
//
// WARUM EIN WÄCHTER UND KEIN SATZ IN DER DOKU. Der Rückweg ist bequem: ein
// `import type { EquipmentItem }` ist eine Zeile, sieht harmlos aus und ist in
// dem Moment, in dem jemand sie schreibt, sogar praktisch. Bemerkt wird sie
// erst, wenn der Kabelplan sein Modell ändert und dieses Repo bricht — also
// dann, wenn es teuer ist.
// ───────────────────────────────────────────────────────────────────────────
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

/**
 * Bezeichner, die dem PLAN gehören und hier nichts zu suchen haben.
 *
 * Aufgezählt und nicht gemustert: ein Muster wie /Equipment/ träfe auch
 * harmlose eigene Namen, und ein Wächter, der bei richtigem Code anschlägt,
 * wird abgeschaltet statt gelesen.
 */
const PLAN_BEZEICHNER = [
  'EquipmentItem',
  'CablePlannerProject',
  'CableItem',
  'LocationFrame',
  // Der Schaltbild-Rechner der Show. Er gehoert dem Planer (ADR-006), und die
  // Versuchung, ihn hier „auch mal eben" zu haben, ist die groesste in diesem
  // Repo — ein Gebaeude hat schliesslich auch Schalter.
  'solveCircuit',
  'circuitFromProject',
  'CircuitNode',
];

/** Pfade, die auf ein anderes Repo zeigen. */
const FREMDE_PFADE = [/cable-planner/, /light-planner/, /multicam-planner/, /av-planner-suite/];

function alleDateien(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) alleDateien(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

/**
 * Quelltext ohne Kommentare.
 *
 * Ohne das schlägt der Wächter an seiner eigenen Begründung an: die Kopfzeile
 * von `types/bedarf.ts` erklärt, warum `EquipmentItem` hier nicht vorkommt —
 * und nennt das Wort dabei. Genau dieser Fehltreffer ist im `sony-camera-bridge`
 * schon einmal passiert.
 */
const ohneKommentare = (s: string): string =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

const funde: string[] = [];
const dateien = alleDateien(SRC);

for (const datei of dateien) {
  const code = ohneKommentare(readFileSync(datei, 'utf8'));
  const kurz = relative(SRC, datei);

  for (const bez of PLAN_BEZEICHNER) {
    if (new RegExp(`\\b${bez}\\b`).test(code)) {
      funde.push(`${kurz}: benutzt "${bez}" — das gehört dem Plan.`);
    }
  }
  for (const m of code.matchAll(/from\s+'([^']+)'/g)) {
    const pfad = m[1];
    if (FREMDE_PFADE.some((r) => r.test(pfad))) {
      funde.push(`${kurz}: importiert aus einem fremden Repo ("${pfad}").`);
    }
    // Aus `src/` heraus greifen heisst, eine Datei zu benutzen, die kein
    // Wächter dieses Repos sieht.
    if (/^\.\.\/\.\.\/\.\.\//.test(pfad)) {
      funde.push(`${kurz}: greift aus src/ heraus ("${pfad}").`);
    }
  }
}

if (funde.length) {
  console.error(`Grenze zum Show-Plan verletzt (${funde.length}):`);
  for (const f of funde) console.error(`  ${f}`);
  console.error(
    '\nDer Plan fragt dieses Werkzeug ueber den Vertrag (src/domain/vertrag.ts):\n' +
      'sechs Fragen, ein Rueckweg. Wer hier ein Show-Modell braucht, hat die\n' +
      'Grenze an der falschen Stelle gezogen — nicht den Waechter zu streng.',
  );
  process.exit(1);
}

// Die Gegenprobe zur Ruhe von eben: ein leeres Verzeichnis oder ein kaputter
// Dateisammler faende NICHTS und meldete Erfolg.
assert.ok(
  dateien.length >= 8,
  `Nur ${dateien.length} Quelldateien gefunden (erwartet: >= 8) — der Sammler ist kaputt.`,
);

// Und die Gegenprobe zum Kommentar-Streicher: er darf Code NICHT wegwerfen.
assert.ok(ohneKommentare("const a = 'x' // EquipmentItem\n").includes("const a = 'x'"));
assert.equal(ohneKommentare('/* EquipmentItem */').trim(), '');
assert.ok(!ohneKommentare('// EquipmentItem').includes('EquipmentItem'));
// Eine URL darf der Streicher nicht halbieren.
assert.ok(ohneKommentare("const u = 'https://x/y'").includes('https://x/y'));

console.log(`Grenze zum Show-Plan: ${dateien.length} Dateien geprueft, keine Verletzung.`);
