// ───────────────────────────────────────────────────────────────────────────
// Native Browser-Dialoge — der Guard fuer die ganze Suite.
//
// WORUM ES GEHT. `@avplan/ui` bringt `confirmDialog`, `alertDialog` und
// `promptDialog` mit. Sie sind nicht bloss huebscher als `window.confirm`:
// sie tragen das Theme, eine Fokusfalle, Tastatur-Bedienung und -- der Punkt,
// an dem es wehtut -- `destructive`, den roten Knopf. Ein nativer Dialog kann
// nicht sagen, dass gleich etwas kaputtgeht.
//
// WARUM ALS GUARD UND NICHT ALS NOTIZ. Es ist zweimal genau derselbe Fehler
// passiert, und beide Male auf dieselbe Art:
//
//   1. `cable-planner` hatte den Umbau erledigt und in `docs/ux-audit.md`
//      abgehakt -- woertlich „No native confirm/alert/prompt left in
//      components". `CollabPanel.tsx` rief trotzdem weiter `window.confirm`,
//      und zwar vor der Aktion, die den lokalen Plan durch den des Hosts
//      ersetzt.
//   2. `light-planner/src/App.tsx` importierte `confirmDialog` bereits, die
//      Funktion war bereits `async` -- und eine Zeile tiefer stand
//      `window.confirm`, vor dem Import, der das offene Projekt ersetzt.
//
// Das Muster ist beide Male dasselbe: wer eine Datei umstellt, arbeitet die
// offensichtlichen Dialoge ab, und die Rueckfrage, die in einem Callback
// vergraben ist, ueberlebt. Ausgerechnet die gefaehrlichste, weil sie dort
// steht, wo etwas verworfen wird.
//
// Ein abgehakter Punkt in einem Dokument ist der Kenntnisstand seines Autors.
// Diese Datei ist der Zustand des Programms.
//
// WARUM HIER UND NICHT JE PLANER. `cable-planner` hat seinen eigenen Test
// (`tests/nativeDialogs.test.ts`, mitvendort) -- die anderen drei Apps haben
// keinen, und `packages/ui` ist der einzige Ort, an dem die nativen Namen
// stehen duerfen. Nur die Suite sieht alle vier zusammen.
// ───────────────────────────────────────────────────────────────────────────
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Wo gesucht wird. `packages/ui` ist dabei, aber siehe ERLAUBT. */
const SCOPES = [
  'apps/cable-planner/src',
  'apps/light-planner/src',
  'apps/multicam-planner/src',
  'apps/shell/src',
  'packages/ui/src',
];

/**
 * Die Ersatz-Dialoge selbst duerfen die nativen Namen nennen — sie sind der
 * Ersatz. Sonst niemand.
 */
const ERLAUBT = [/packages\/ui\/src\/dialog\.tsx$/];

const SRC_EXT = /\.(ts|tsx)$/;

const walk = (dir) => {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === 'node_modules' || name === 'dist') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (SRC_EXT.test(name)) out.push(full);
  }
  return out;
};

/**
 * Kommentare entfernen, Zeichenketten respektieren.
 *
 * Ohne das faellt der Guard ueber seine eigene Dokumentation: die Kommentare,
 * die erklaeren WARUM `window.confirm` weg ist, nennen `window.confirm`. Genau
 * daran ist die erste Fassung im cable-planner gescheitert.
 */
const stripComments = (src) => {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') { out += next ?? ''; i += 2; continue; }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i += 1; continue; }
    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out += '\n';
        i += 1;
      }
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
};

const treffer = [];
let dateien = 0;

for (const scope of SCOPES) {
  for (const file of walk(join(ROOT, scope))) {
    const rel = relative(ROOT, file);
    if (ERLAUBT.some((r) => r.test(rel))) continue;
    dateien += 1;
    const code = stripComments(readFileSync(file, 'utf8'));
    for (const m of code.matchAll(/window\.(confirm|alert|prompt)\s*\(/g)) {
      treffer.push({ file: rel, line: code.slice(0, m.index).split('\n').length, fn: m[1] });
    }
  }
}

if (dateien === 0) {
  console.error('\nKein Quelltext gefunden — der Guard prueft damit nichts.\n');
  process.exit(1);
}

if (treffer.length > 0) {
  console.error('\nNative Browser-Dialoge im Quelltext:\n');
  for (const t of treffer) console.error(`  ${t.file}:${t.line} — window.${t.fn}()`);
  console.error(
    '\nErsatz aus `@avplan/ui`: confirmDialog, alertDialog, promptDialog.\n' +
    'Steht dahinter etwas, das Arbeit verwirft, gehoert `destructive: true`\n' +
    'dazu — den roten Knopf kann der native Dialog nicht.\n',
  );
  process.exit(1);
}

console.log(`OK keine nativen Dialoge in ${dateien} Dateien`);
console.log(`   geprueft: ${SCOPES.join(', ')}`);
console.log('   ausgenommen: packages/ui/src/dialog.tsx (die Ersatz-Dialoge selbst)');
