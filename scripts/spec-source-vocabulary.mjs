// ───────────────────────────────────────────────────────────────────────────
// Ein Vokabular fuer die Herkunft von Kenndaten — und der Guard dagegen, dass
// es zwei werden.
//
// WORUM ES GEHT. `light-planner` und `multicam-planner` fuehren beide ein
// Feld `specSource` (Feld -> { value, source }) und beide dieselben zwei
// Funktionen dazu: `isEstimate` unterscheidet Schaetzung von Ablesung,
// `isStaleSource` erkennt einen Beleg, dessen Wert der Nutzer inzwischen
// geaendert hat. Die Planer teilen keinen Quellbaum; jede Seite haelt eine
// eigene Kopie.
//
// WARUM ES DEN GUARD BRAUCHT — GEMESSEN, NICHT BEFUERCHTET. Die beiden
// Kopien sind bereits einmal auseinandergelaufen, keine Stunde nach ihrer
// Entstehung: `isEstimate` erkannte im multicam-planner „geschaetzt" UND
// „estimate", im light-planner nur „geschaetzt". Dort wird aber ein oft
// englisches Datenblatt hineingereicht, und ein Modell antwortet gern in der
// Sprache der Vorlage — eine englisch formulierte Schaetzung ging damit als
// BELEG durch. Genau der Fehler, gegen den das Feld gebaut ist.
//
// Aufgefallen ist das beim Neu-Ableiten des Stands, nicht beim Bauen. Ein
// Guard faellt frueher.
//
// WARUM HIER UND NICHT IN DEN PLANERN. Kein Planer kann den anderen lesen —
// getrennte Repos. Die Suite ist der einzige Ort, an dem beide Kopien im
// selben Baum liegen. Genau dafuer ist sie da.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Wer das FELD fuehrt. Alle drei — seit `cable#650` auch der cable-planner,
 * dessen AI-Port-Vorschlag geratene Ports als Tatsache schrieb.
 */
const FIELD_COPIES = [
  { app: 'light-planner', file: 'apps/light-planner/src/types.ts' },
  { app: 'multicam-planner', file: 'apps/multicam-planner/src/types/index.ts' },
  { app: 'cable-planner', file: 'apps/cable-planner/src/renderer/types/equipment.ts' },
];

/**
 * Wer zusaetzlich die HELFER fuehrt — nur die beiden, die Marker anzeigen
 * (`≈` Schaetzung, `!` ueberholt). Der cable-planner zeigt seinen Beleg
 * ueber eine Zeichnungspruefung statt ueber ein Badge und braucht sie nicht;
 * ihn hier mitzuverlangen hiesse, toten Code zu erzwingen.
 */
const COPIES = FIELD_COPIES.filter((c) => c.app !== 'cable-planner');

/**
 * Den Rumpf einer `export const <name> = ... ;`-Deklaration herausschneiden,
 * ohne Kommentare — die duerfen sich unterscheiden, der Code nicht.
 */
const declaration = (src, name) => {
  const withoutComments = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  const start = withoutComments.indexOf(`export const ${name} =`);
  if (start === -1) throw new Error(`${name} nicht gefunden`);
  const end = withoutComments.indexOf(';', start);
  if (end === -1) throw new Error(`${name} nicht abgeschlossen`);
  return withoutComments
    .slice(start, end + 1)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
};

const FUNCTIONS = ['isEstimate', 'isStaleSource'];
const problems = [];

const read = (c) => ({ ...c, src: readFileSync(join(ROOT, c.file), 'utf8') });
const fieldSources = FIELD_COPIES.map(read);
const sources = COPIES.map(read);

// 1) Das Feld selbst muss es in ALLEN dreien in derselben Form geben.
//    Das abschliessende Semikolon ist Stilfrage — der cable-planner setzt
//    keine —, die Form davor nicht.
for (const c of fieldSources) {
  if (!/specSource\?: Record<string, \{ value: string; source: string \}>/.test(c.src)) {
    problems.push(`${c.app}: kein oder abweichend geformtes \`specSource\` in ${c.file}`);
  }
}

// 2) Die Funktionen muessen Zeichen fuer Zeichen gleich sein.
for (const fn of FUNCTIONS) {
  const forms = sources.map((c) => {
    try {
      return { app: c.app, text: declaration(c.src, fn) };
    } catch (e) {
      return { app: c.app, text: `FEHLT (${e.message})` };
    }
  });
  const distinct = new Set(forms.map((f) => f.text));
  if (distinct.size !== 1) {
    problems.push(
      `${fn} laeuft auseinander:\n` +
        forms.map((f) => `    ${f.app}: ${f.text}`).join('\n'),
    );
  }
}

// 3) Beide Schreibweisen der Schaetzung — die konkrete Luecke, die es gab.
for (const c of sources) {
  const fn = declaration(c.src, 'isEstimate');
  if (!/gesch/.test(fn) || !/estimat/.test(fn)) {
    problems.push(
      `${c.app}: \`isEstimate\` erkennt nicht beide Schreibweisen. ` +
        'Das Datenblatt ist oft englisch und das Modell antwortet in dessen ' +
        'Sprache — eine so formulierte Schaetzung ginge als Beleg durch.',
    );
  }
}

if (problems.length > 0) {
  console.error('\nHerkunfts-Vokabular auseinandergelaufen:\n');
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    '\nBeide Planer fuehren dieselbe Wahrheit in eigenen Kopien. Wer eine ' +
      'aendert, aendert die andere mit.\n',
  );
  process.exit(1);
}

console.log(`OK specSource: alle ${FIELD_COPIES.length} Planer fuehren das Feld in derselben Form`);
console.log('OK die beiden anzeigenden Planer tragen dieselben Funktionen');
console.log('OK isEstimate erkennt Schaetzungen in beiden Sprachen');
