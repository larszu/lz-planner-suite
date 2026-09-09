// ───────────────────────────────────────────────────────────────────────────
// Der Vertrag „Festinstallation": ADR gegen Code (ADR-006).
// Lauf: `npm run vertrag:parity` — der Name endet auf `parity`, damit
// `ci:complete` ihn ueberhaupt als Pruef-Lauf erkennt (sein Muster ist
// `check|vocab|native|reachable|smoke|parity`). Ein Guard mit einem Namen
// ausserhalb des Musters entginge der Vollstaendigkeits-Pruefung — und genau
// die soll verhindern, dass ein Waechter existiert und nie laeuft.
//
// WARUM DIESE PRUEFUNG IN DER SUITE LEBT UND NICHT IM WERKZEUG. Sie vergleicht
// zwei Dinge, die nur HIER im selben Baum liegen: die Tabelle im ADR
// (`docs/decisions/ADR-006-werkzeug-schnitt.md`) und den Code
// (`apps/larszu-facility-planner/src/domain/vertrag.ts`).
//
// Im Werkzeug selbst gibt es das ADR nicht. Die sechs Namen dort abzuschreiben
// waere die zweite Wahrheit, gegen die ADR-001 geschrieben ist: die Abschrift
// driftete vom ADR weg, und der Test bliebe gruen.
//
// SIE WAR SCHON EINMAL WOANDERS. Bis zum 2026-09-09 stand sie in
// `packages/facility-core/test/vertrag.test.ts` — das Paket war die Vorstufe
// des Repos (ADR-006, „Paket vor Repo"). Mit dem Umzug ins eigene Repo ist das
// Paket weg; die Pruefung bleibt, weil ihre Aufgabe dieselbe ist.
//
// WAS SIE MISST: dass die sechs Fragen sechs bleiben, in BEIDE Richtungen.
// Eine siebte Funktion ohne siebte Zeile im ADR ist rot; eine gestrichene
// Zeile ohne gestrichene Funktion ebenso. Dasselbe fuer den einen Rueckweg.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ADR = join(ROOT, 'docs/decisions/ADR-006-werkzeug-schnitt.md')
const VERTRAG = join(ROOT, 'apps/larszu-facility-planner/src/domain/vertrag.ts')

const adr = readFileSync(ADR, 'utf8')
const code = readFileSync(VERTRAG, 'utf8')

/** Schneidet einen `###`-Abschnitt des ADR heraus. */
const abschnitt = (ueberschrift) => {
  const start = adr.indexOf(`### ${ueberschrift}`)
  assert.ok(start >= 0, `ADR-Abschnitt „${ueberschrift}" fehlt`)
  const rest = adr.slice(start + 4)
  const ende = rest.indexOf('\n### ')
  return ende === -1 ? rest : rest.slice(0, ende)
}

/** Alle `name(...)`-Aufrufe in Backticks, ohne Duplikate. */
const aufrufe = (text) => [
  ...new Set([...text.matchAll(/`([a-zA-Z][a-zA-Z0-9]*)\(/g)].map((m) => m[1])),
]

/**
 * Die Liste aus dem Code — aus `VERTRAG_FRAGEN`, nicht aus allen Exporten.
 *
 * Die Klammern werden gezaehlt statt bis zum ersten `]` gesucht: ein Kommentar
 * mit einer Klammer darin haette den Ausschnitt sonst zu frueh beendet.
 */
const listeAusCode = (name) => {
  const start = code.indexOf(`export const ${name} = [`)
  assert.ok(start >= 0, `${name} fehlt in vertrag.ts`)
  const ab = code.indexOf('[', start)
  let tiefe = 0
  let ende = ab
  for (let i = ab; i < code.length; i += 1) {
    if (code[i] === '[') tiefe += 1
    else if (code[i] === ']') {
      tiefe -= 1
      if (tiefe === 0) {
        ende = i
        break
      }
    }
  }
  return [...code.slice(ab, ende).matchAll(/'([a-zA-Z][a-zA-Z0-9]*)'/g)].map((m) => m[1])
}

const fehler = []

const imAdr = aufrufe(abschnitt('Was der Plan das Gebäude fragt'))
const imCode = listeAusCode('VERTRAG_FRAGEN')

if (imAdr.length !== 6) {
  fehler.push(`Das ADR nennt ${imAdr.length} Fragen, nicht 6: ${imAdr.join(', ')}`)
}
const nurAdr = imAdr.filter((x) => !imCode.includes(x))
const nurCode = imCode.filter((x) => !imAdr.includes(x))
if (nurAdr.length) fehler.push(`Im ADR, nicht im Code: ${nurAdr.join(', ')}`)
if (nurCode.length) fehler.push(`Im Code, nicht im ADR: ${nurCode.join(', ')}`)

const rueckwegAdr = aufrufe(abschnitt('Der eine Rückweg'))
const rueckwegCode = /export const VERTRAG_RUECKWEG = '([a-zA-Z]+)'/.exec(code)
assert.ok(rueckwegCode, 'VERTRAG_RUECKWEG fehlt in vertrag.ts')
if (rueckwegAdr.length !== 1 || rueckwegAdr[0] !== rueckwegCode[1]) {
  fehler.push(
    `Rueckweg: ADR nennt [${rueckwegAdr.join(', ')}], Code nennt "${rueckwegCode[1]}"`,
  )
}

// Jede genannte Frage muss auch wirklich eine Funktion sein — eine Zeile in
// einer Liste ist noch keine Auskunft.
for (const name of imCode) {
  if (!new RegExp(`export const ${name} =`).test(code)) {
    fehler.push(`"${name}" steht in VERTRAG_FRAGEN, ist aber keine Funktion in vertrag.ts`)
  }
}

if (fehler.length) {
  console.error(`Vertrag „Festinstallation" — ADR und Code stimmen nicht ueberein:`)
  for (const f of fehler) console.error(`  ${f}`)
  console.error(
    '\nEntweder die Frage gehoert in den Vertrag — dann steht sie in BEIDEN.\n' +
      'Oder sie gehoert nicht hinein — dann in keinem von beiden.',
  )
  process.exit(1)
}

// Gegenprobe zur Ruhe von eben: ein kaputtes Muster faende nichts und meldete
// Erfolg.
assert.equal(imCode.length, 6, `VERTRAG_FRAGEN nennt ${imCode.length} statt 6 Fragen`)
assert.ok(aufrufe('`foo(bar)` und `baz(qux)`').length === 2, 'Aufruf-Muster kaputt')

console.log(`Vertrag „Festinstallation": ${imCode.length} Fragen + 1 Rueckweg, ADR = Code.`)
