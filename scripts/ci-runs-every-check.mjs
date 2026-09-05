#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Jeder Pruef-Lauf aus `package.json` faehrt auch in CI — oder nennt hier
// seinen Grund.
//
// WARUM ES DAS GIBT. `light-planner` hatte am 2026-09-04 einen Guard
// (`mvr:check`), der existierte, gruen war und bei keinem Merge lief. Sein
// `ci:complete` findet das dort seither; `cable-planner` hat inzwischen
// dasselbe als Test. Die Suite hatte es nicht — und sie ist der Ort, an dem es
// am meisten zaehlt: sie haelt fuenf Guards, und ein sechster kommt hier alle
// paar Tage dazu.
//
// Ein Guard, den niemand faehrt, ist keine Zusicherung, sondern eine Notiz —
// und schlimmer als gar keiner: er steht im Statusdokument, jemand liest ihn
// als „das ist abgesichert", und niemand merkt, dass die Absicherung nie
// ausgeloest wurde.
//
// WIE ER PRUEFT. Die Liste kommt aus `package.json` und wird an der FORM des
// Namens erkannt, nicht an einer Aufzaehlung hier — sonst waere genau diese
// Datei die Liste, die veraltet.
//
// Ein Lauf gilt als abgedeckt, wenn der Workflow entweder `npm run <name>`
// enthaelt ODER das Skript aufruft, das hinter dem Namen steht. Das ist kein
// Entgegenkommen, sondern noetig: der Drift-Job ruft
// `node scripts/planner-drift.mjs --upstream ../upstream --check` direkt auf,
// weil der Upstream in CI woanders liegt als lokal. Wer nur auf `npm run`
// prueft, meldet dort einen Fehler, den es nicht gibt — und wer daraufhin die
// Ausnahme eintraegt, schaltet einen Guard aus, der laeuft.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skripte = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts ?? {}

/** Was als Pruef-Lauf zaehlt — ueber die Form des Namens, nicht ueber eine Liste. */
const istPruefung = (name) =>
  name === 'lint' || name === 'test' || /(^|:)(check|vocab|native|reachable|smoke|parity)$/.test(name)

/**
 * Laeufe, die absichtlich NICHT in CI stehen. Der Text ist Pflicht — er ist der
 * ganze Zweck dieser Tabelle.
 */
const OHNE_CI = {
  'drift:report': [
    'Erzeugt nur den Bericht `docs/research/repos/DRIFT-REPORT.md` und prueft nichts.',
    'Der Drift-Job faehrt ihn ohnehin informativ mit `|| true`; die eigentliche',
    'Zusicherung ist `drift:check`, und die steht im Workflow.',
  ].join(' '),
}

/**
 * Der Workflow-Text OHNE reine Kommentarzeilen.
 *
 * Gemessen 2026-09-05 in `cable-planner`: ein Kommentar, der `npm run
 * actions:check` bloss ERWAEHNT, hat den dortigen Zwilling dieses Guards
 * zufriedengestellt -- der Lauf stand nirgends als Schritt und waere bei
 * keinem Merge gefahren. Die Zusicherung, die dieser Lauf geben soll, war
 * damit von einem Satz Prosa zu haben. Ein Guard, den ein Kommentar
 * besaenftigt, ist keiner.
 *
 * Nur ganze Kommentarzeilen fallen weg; ein `#` mitten in einer Zeile bleibt
 * stehen (es steckt in URLs und Shell-Zeilen, und ein zu eifriges
 * Wegschneiden waere die naechste stille Fehlerquelle).
 */
const workflows = () => {
  const verzeichnis = join(ROOT, '.github', 'workflows')
  return readdirSync(verzeichnis)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) =>
      readFileSync(join(verzeichnis, f), 'utf8')
        .split('\n')
        .filter((zeile) => !/^\s*#/.test(zeile))
        .join('\n'),
    )
    .join('\n')
}

/** Die Skriptdatei hinter einem npm-Lauf, wenn er eine aufruft. */
const skriptdatei = (befehl) => {
  const treffer = befehl.match(/(scripts\/[\w.-]+\.(?:mjs|cjs|js|ts))/)
  return treffer ? treffer[1] : null
}

const yml = workflows()
const alle = Object.keys(skripte).filter(istPruefung).sort()
const maengel = []

if (alle.length < 4) maengel.push(`Nur ${alle.length} Pruef-Laeufe gefunden — vermutlich stimmt der Filter nicht.`)
if (yml.length < 200) maengel.push('Keine Workflows gelesen — ein leerer Lauf waere gruen und wertlos.')

for (const name of alle) {
  if (name in OHNE_CI) continue
  const datei = skriptdatei(skripte[name])
  const laeuft = yml.includes(`npm run ${name}`) || (datei && yml.includes(datei))
  if (!laeuft) maengel.push(`${name}  (in package.json, nicht im Workflow)`)
}

for (const [name, grund] of Object.entries(OHNE_CI)) {
  if (!(name in skripte)) maengel.push(`OHNE_CI nennt "${name}" — das Skript gibt es nicht mehr.`)
  if (!grund || grund.trim().length < 40) maengel.push(`OHNE_CI["${name}"] ohne brauchbare Begruendung.`)
  const datei = skriptdatei(skripte[name] ?? '')
  if (yml.includes(`npm run ${name}`)) {
    // Sonst bliebe die Ausnahme stehen, nachdem jemand den Lauf eingetragen
    // hat — und der naechste Leser haelt ihn weiter fuer ungeprueft.
    maengel.push(`OHNE_CI["${name}"] ist ueberfluessig: der Lauf steht inzwischen im Workflow.`)
  }
  void datei
}

if (maengel.length === 0) {
  console.log(`OK: alle ${alle.length} Pruef-Laeufe stehen im CI-Workflow (${alle.join(', ')}).`)
  process.exit(0)
}

console.error(`FEHLER: ${maengel.length} Punkt(e):\n`)
for (const m of maengel) console.error(`  ! ${m}`)
console.error(
  '\nEin Guard, den niemand faehrt, ist keine Zusicherung, sondern eine Notiz.\n' +
    'Eintragen als eigener Schritt in .github/workflows/ci.yml:\n' +
    '      - name: <was er zusichert>\n' +
    '        run: npm run <lauf>\n' +
    'Oder — wenn er bewusst nicht laufen soll — mit Begruendung in OHNE_CI.',
)
process.exit(1)
