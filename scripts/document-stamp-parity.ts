// ───────────────────────────────────────────────────────────────────────────
// Ein Stempel, drei Kopien — und der Guard dagegen, dass daraus drei Stempel
// werden (ADR-004).
// Lauf: `npm run stamp:parity`
//
// WORUM ES GEHT. Alle drei Planer drucken Blaetter, und alle drei tragen seit
// Inkrement 4 dieselbe Stand-Angabe: Projekt, Stand, Zeitpunkt, acht
// Hex-Zeichen. Der Sinn dieser acht Zeichen ist der Vergleich — jemand liest
// sie am Telefon vor, jemand anders haelt sie gegen den Bildschirm. Das
// funktioniert nur, wenn alle drei Apps DIESELBE Zahl aus demselben Inhalt
// rechnen. Zwei Apps, die verschiedene Staende desselben Projekts verschieden
// benennen, waeren schlimmer als gar kein Stempel: man vergliche zwei Zahlen,
// die nichts miteinander zu tun haben, und hielte das Ergebnis fuer eine
// Aussage.
//
// WARUM HIER UND NICHT IN DEN PLANERN. Kein Planer kann den anderen lesen —
// getrennte Repos. Jeder traegt darum drei feste Ankerwerte in seinem eigenen
// Testlauf; das faengt eine einseitige Aenderung. Was es dort NICHT gibt, ist
// die Probe ueber eine gemeinsame, breite Eingabemenge — dafuer muessen die
// drei Implementierungen im selben Prozess laufen. Die Suite ist der einzige
// Ort, an dem das geht. Genau dafuer ist sie da (dieselbe Begruendung wie bei
// `spec-source-vocabulary.mjs`).
//
// WARUM VERHALTEN UND NICHT TEXT. Der Zwilling nebenan vergleicht Quelltext
// Zeichen fuer Zeichen. Das ginge hier nicht: die drei Dateien unterscheiden
// sich in Typnamen (`CsvCell` vs. `StampCell`), in Semikolons und in ihren
// Kommentaren — alles davon egal. Was zaehlt, ist die Zahl, die herauskommt.
// Deshalb werden hier die echten Funktionen ausgefuehrt und ihre Ergebnisse
// verglichen, nicht ihre Buchstaben.
// ───────────────────────────────────────────────────────────────────────────
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import * as cable from '../apps/cable-planner/src/renderer/lib/documentStamp.ts';
import * as light from '../apps/light-planner/src/core/documentStamp.ts';
import * as multicam from '../apps/multicam-planner/src/utils/documentStamp.ts';

type Zelle = string | number | null | undefined;

interface Impl {
  app: string;
  fingerprint: (s: string) => string;
  documentFingerprint: (headers: string[], rows: Zelle[][]) => string;
  stampLine: (stamp: {
    project: string;
    revision?: string;
    drifted: boolean;
    printedAt: string;
    fingerprint: string;
  }) => string;
}

const IMPLS: Impl[] = [
  { app: 'cable-planner', ...cable } as unknown as Impl,
  { app: 'light-planner', ...light } as unknown as Impl,
  { app: 'multicam-planner', ...multicam } as unknown as Impl,
];

const fehler: string[] = [];
const gleich = (was: string, werte: { app: string; wert: string }[]) => {
  const verschieden = new Set(werte.map((w) => w.wert));
  if (verschieden.size !== 1) {
    fehler.push(`${was}\n` + werte.map((w) => `      ${w.app}: ${w.wert}`).join('\n'));
  }
};

// ── 1) Die Zeichenkette rein, die acht Zeichen raus ────────────────────────
// Breite Eingabemenge statt drei Ankerwerten: Leerstring, ASCII, Umlaute,
// Emoji, die Trennzeichen selbst, ein langer Text. Der interessante Teil sind
// die Zeichen jenseits von ASCII — `charCodeAt` liefert dort UTF-16-Einheiten,
// und eine Kopie, die irgendwann auf `codePointAt` umgestellt wuerde, faellt
// erst hier auf.
const PROBEN = [
  '',
  'a',
  'abc',
  'Kanal;Typ',
  'Höhe (m)',
  'Bühne · Rückwand',
  '\u001F\u001E',
  'x'.repeat(1000),
  '🎥 Kamera 1',
  'Zeile 1\nZeile 2',
];
for (const probe of PROBEN) {
  gleich(
    `fingerprint(${JSON.stringify(probe).slice(0, 40)}) laeuft auseinander:`,
    IMPLS.map((i) => ({ app: i.app, wert: i.fingerprint(probe) })),
  );
}

// Und die Form: acht Hex-Zeichen, immer. Ein Ausrutscher in der Laenge waere
// am Telefon sofort verwirrend — „sind das jetzt sieben oder acht?"
for (const i of IMPLS) {
  for (const probe of PROBEN) {
    const wert = i.fingerprint(probe);
    if (!/^[0-9a-f]{8}$/.test(wert)) {
      fehler.push(`${i.app}: fingerprint liefert "${wert}" statt acht Hex-Zeichen`);
    }
  }
}

// ── 2) Die Tabelle rein, die acht Zeichen raus ─────────────────────────────
const TABELLEN: { was: string; headers: string[]; rows: Zelle[][] }[] = [
  { was: 'leer', headers: ['x'], rows: [] },
  { was: 'eine Zelle', headers: ['x'], rows: [['1']] },
  { was: 'null und undefined', headers: ['x'], rows: [[null], [undefined], ['']] },
  { was: 'Zahlen und Text gemischt', headers: ['a', 'b'], rows: [[1, 'x'], [2.5, '']] },
  { was: 'Semikolon in der Zelle', headers: ['h'], rows: [['a;b']] },
  { was: 'Zelle mit Zeilenumbruch', headers: ['h'], rows: [['a\nb']] },
  { was: 'Umlaute', headers: ['Höhe (m)'], rows: [['Bühne']] },
];
for (const t of TABELLEN) {
  gleich(
    `documentFingerprint (${t.was}) laeuft auseinander:`,
    IMPLS.map((i) => ({ app: i.app, wert: i.documentFingerprint(t.headers, t.rows) })),
  );
}

// Der Unit-Separator ist der Grund, warum das ueberhaupt funktioniert: mit ';'
// als Trenner waeren ['a;b'] und ['a','b'] derselbe String — zwei
// verschiedene Dokumente mit demselben Fingerabdruck. Jede Kopie muss das
// unterscheiden, und sie muessen sich EINIG sein, wie.
for (const i of IMPLS) {
  if (i.documentFingerprint(['h'], [['a;b']]) === i.documentFingerprint(['h', 'h2'], [['a', 'b']])) {
    fehler.push(`${i.app}: Zellgrenze geht nicht in den Fingerabdruck ein`);
  }
}

// ── 3) Die Zeile, die auf dem Papier steht ─────────────────────────────────
const STEMPEL = [
  { project: 'Halle A', drifted: false, printedAt: '2026-09-01T12:34:00.000Z', fingerprint: 'deadbeef' },
  { project: 'Halle A', revision: 'Rev 2', drifted: false, printedAt: '2026-09-01T12:34:00.000Z', fingerprint: 'deadbeef' },
  { project: 'Halle A', revision: 'Rev 2', drifted: true, printedAt: '2026-09-01T12:34:00.000Z', fingerprint: 'deadbeef' },
  { project: '—', drifted: false, printedAt: '2026-12-31T23:59:00.000Z', fingerprint: '00000000' },
];
for (const s of STEMPEL) {
  gleich(
    `stampLine(${s.revision ?? 'ohne Revision'}${s.drifted ? ', abweichend' : ''}) laeuft auseinander:`,
    IMPLS.map((i) => ({ app: i.app, wert: i.stampLine(s) })),
  );
}

// Und der Punkt der Zeile: eine Revision allein liest sich als „dieser
// Ausdruck IST Rev 2". Weicht der Plan ab, muss das dranstehen.
for (const i of IMPLS) {
  const ab = i.stampLine(STEMPEL[2]);
  if (!ab.includes('Rev 2 + Änderungen')) {
    fehler.push(`${i.app}: stampLine verschweigt die Abweichung ("${ab}")`);
  }
  if (i.stampLine(STEMPEL[1]).includes('Änderungen')) {
    fehler.push(`${i.app}: stampLine behauptet eine Abweichung, die es nicht gibt`);
  }
}

// ── 4) Die Sprache darf den Stempel nicht bewegen ──────────────────────────
// Nur die Suite hat dieses Problem: sie uebersetzt die Kopfzeilen der
// CSV-Listen (`Kanal`/`Channel`) und einzelne Zellen (`ja`/`yes`). Liefe der
// Fingerabdruck ueber die ANGEZEIGTE Tabelle, haetten dieselben Leuchten auf
// Deutsch und auf Englisch verschiedene acht Zeichen — und genau der
// Vergleich, fuer den der Stempel da ist, waere kaputt.
//
// Geprueft wird deshalb am Quelltext, dass gerechnet wird, was `documentTables`
// liefert (deutsch, unuebersetzt), und gedruckt, was der Dialog baut.
const dialog = readFileSync(
  new URL('../apps/light-planner/src/components/ScheduleDialog.tsx', import.meta.url),
  'utf8',
);
if (!/const stempel = \(kanonisch: \(f: PlacedFixture\[\]\) => DocumentTable\)/.test(dialog)) {
  fehler.push(
    'light-planner (Suite-Kopie): der Stempel nimmt keine kanonische Tabelle mehr entgegen — ' +
      'laeuft er ueber die uebersetzte, haengt der Fingerabdruck an der Anzeigesprache',
  );
}
for (const [name, kanon] of [
  ['instrument-schedule.csv', 'scheduleTable'],
  ['geraeteliste.csv', 'inventoryTable'],
  ['farbliste.csv', 'colorTable'],
] as const) {
  const stelle = dialog.indexOf(`exportTable('${name}'`);
  if (stelle === -1) {
    fehler.push(`light-planner (Suite-Kopie): ${name} laeuft nicht ueber den gestempelten Weg`);
    continue;
  }
  // Der kanonische Tabellenbauer steht als letztes Argument desselben Aufrufs.
  const abschnitt = dialog.slice(stelle, dialog.indexOf('exportTable(', stelle + 1) + 1 || undefined);
  if (!new RegExp(`\\}, ${kanon}\\);`).test(abschnitt)) {
    fehler.push(
      `light-planner (Suite-Kopie): ${name} wird nicht gegen \`${kanon}\` gestempelt — ` +
        'der Fingerabdruck haengt dann an der Anzeigesprache',
    );
  }
}

// ── Ergebnis ───────────────────────────────────────────────────────────────
if (fehler.length > 0) {
  console.error('\nDer Stand-Stempel laeuft zwischen den Planern auseinander:\n');
  for (const f of fehler) console.error(`  - ${f}`);
  console.error(
    '\nDie acht Zeichen auf dem Papier sind nur zum Vergleichen da. Rechnen zwei\n' +
      'Apps sie verschieden, vergleicht jemand zwei Zahlen, die nichts miteinander\n' +
      'zu tun haben — und haelt das Ergebnis fuer eine Aussage.\n',
  );
  process.exit(1);
}

assert.equal(IMPLS.length, 3);
console.log(`OK: ${IMPLS.length} Planer rechnen denselben Fingerabdruck (${PROBEN.length} Zeichenketten, ${TABELLEN.length} Tabellen)`);
console.log(`OK: ${IMPLS.length} Planer schreiben dieselbe Stempelzeile (${STEMPEL.length} Faelle, mit und ohne Abweichung)`);
console.log('OK: der Fingerabdruck der Suite-Listen haengt nicht an der Anzeigesprache');
