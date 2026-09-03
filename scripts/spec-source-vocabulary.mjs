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

const COPIES = [
  { app: 'light-planner', file: 'apps/light-planner/src/types.ts' },
  { app: 'multicam-planner', file: 'apps/multicam-planner/src/types/index.ts' },
];

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

const sources = COPIES.map((c) => ({
  ...c,
  src: readFileSync(join(ROOT, c.file), 'utf8'),
}));

// 1) Das Feld selbst muss es auf beiden Seiten geben.
for (const c of sources) {
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

console.log('OK specSource-Vokabular: beide Kopien tragen dieselben Funktionen');
console.log('OK isEstimate erkennt Schaetzungen in beiden Sprachen');
