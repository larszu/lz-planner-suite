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
//
// ═══════════════════════════════════════════════════════════════════════════
// UND DIE VENDORTEN KOPIEN, seit 2026-09-09
// ═══════════════════════════════════════════════════════════════════════════
//
// Bis hierher las dieser Lauf NUR die Wurzel-`package.json`. Das liess genau
// die Luecke offen, gegen die er erfunden wurde — eine Ebene tiefer:
//
//   * Die Apps unter `apps/` bringen ihre eigenen Guards mit. `light-planner`
//     allein haelt 32 davon.
//   * Der Workflow der Suite faehrt sie NICHT einzeln, sondern ueber
//     `npm run test --workspaces` und `npm run lint --workspaces` — ein Guard
//     laeuft dort also nur, wenn das `test`-Skript SEINER App ihn aufruft.
//   * Das vendorte `.github/workflows/ci.yml` jeder App ist eine KOPIE aus dem
//     Upstream-Repo. GitHub liest nur `.github/` der Wurzel; die Kopie feuert
//     nie. Der `ci:complete` INNERHALB der App vergleicht aber gegen genau
//     diese Kopie und ist deshalb gruen ueber einen Workflow, den es hier
//     nicht gibt.
//
// Gemessen am 2026-09-09, unmittelbar nach dem Vendoring von light#102:
// 17 Guards in drei Apps existierten, waren gruen und liefen bei keinem Merge
// der Suite — darunter `retime:check`, beim Vendoring davor genauso
// hereingetragen, und `access:check`, das gerade erst ankam. Das ist derselbe
// Befund wie B-56, nur eine Ebene hoeher: das Vendoring holt die Datei, nicht
// ihre Ausfuehrung.
//
// Deshalb prueft dieser Lauf jetzt zusaetzlich JEDE App: erreicht ihr eigenes
// `test`- oder `lint`-Skript ihre Pruef-Laeufe? Erreichbarkeit wird
// TRANSITIV gerechnet — ein `test`, das `npm run guards` ruft, und ein
// `guards`, das die Kette enthaelt, zaehlt. Was nicht laufen SOLL, steht in
// `APP_OHNE_CI`, mit Grund.
// ───────────────────────────────────────────────────────────────────────────
import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

// ── Die vendorten Apps ────────────────────────────────────────────────────

/**
 * Pruef-Laeufe einer App, die BEWUSST nicht ueber deren `test`/`lint` laufen.
 * Schluessel: `<app>/<lauf>`. Der Text ist Pflicht und der ganze Zweck.
 */
const APP_OHNE_CI = {
  'cable-planner/actions:check': [
    'Prueft die Action-Pins in `apps/cable-planner/.github/workflows` — einer',
    'vendorten Kopie, die GitHub nie liest und die deshalb keinen Lauf',
    'absichern kann. Die Workflows, die hier wirklich feuern, stehen in',
    '.github/ der Wurzel und werden vom `actions:check` der Suite geprueft.',
  ].join(' '),
  'multicam-planner/actions:check': [
    'Dieselbe vendorte Workflow-Kopie wie beim cable-planner, derselbe Grund:',
    'sie feuert nicht, also sichert ein Lauf gegen sie nichts ab. Der',
    '`actions:check` der Suite deckt die Workflows ab, die laufen.',
  ].join(' '),
  'light-planner/actions:check': [
    'Dieselbe vendorte Workflow-Kopie wie bei den beiden anderen Planern,',
    'derselbe Grund: GitHub liest nur `.github/` der Wurzel. Der',
    '`actions:check` der Suite deckt die Workflows ab, die laufen.',
  ].join(' '),
  'cable-planner/greifzonen:check': [
    'Startet wie `ui:smoke` die GEBAUTE Electron-App mit X-Server, um zu',
    'messen, ob auf der Linie eines Kabels der Griff eines anderen obenauf',
    'liegt. Der Haupt-Job der Suite hat weder Binary noch X-Server (er setzt',
    'ELECTRON_SKIP_BINARY_DOWNLOAD). Die Zusicherung selbst geht dabei nicht',
    'verloren: der Lauf faehrt in der CI des cable-planner-Repos, und die',
    'rechnende Haelfte davon — Griff-Zonen nur am ausgewaehlten Kabel —',
    'haelt hier `tests/autoRouteEinRouter.test.ts`, das am `test` haengt.',
  ].join(' '),
  'cable-planner/ui:smoke': [
    'Startet die GEBAUTE App mit X-Server und Electron-Binary. Der Haupt-Job',
    'der Suite hat beides nicht (er setzt ELECTRON_SKIP_BINARY_DOWNLOAD); der',
    'eigene Headless-Smoke-Job der Suite faehrt denselben Test gegen die',
    'gebaute Suite und deckt damit dieselbe Frage ab.',
  ].join(' '),
}

const APPS = join(ROOT, 'apps')

/**
 * Welche Laeufe einer App von ihrem `test`/`lint` aus erreichbar sind —
 * transitiv, weil eine App ihre Kette auch in einem Sammel-Skript buendeln
 * darf. Ueber `npm run <name>` im Befehlstext, nicht ueber eine Liste hier.
 */
const erreichbar = (skripteDerApp) => {
  const gefunden = new Set()
  const offen = ['test', 'lint'].filter((n) => n in skripteDerApp)
  while (offen.length > 0) {
    const name = offen.pop()
    if (gefunden.has(name)) continue
    gefunden.add(name)
    for (const treffer of (skripteDerApp[name] ?? '').matchAll(/npm run ([\w:.-]+)/g)) {
      if (!gefunden.has(treffer[1])) offen.push(treffer[1])
    }
  }
  return gefunden
}

const apps = readdirSync(APPS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((name) => existsSync(join(APPS, name, 'package.json')))
  .sort()

if (apps.length < 3) {
  maengel.push(`Nur ${apps.length} App(s) unter apps/ gefunden — der Scan greift nicht.`)
}

const genannt = new Set()
let appLaeufe = 0
for (const app of apps) {
  const appSkripte =
    JSON.parse(readFileSync(join(APPS, app, 'package.json'), 'utf8')).scripts ?? {}
  const kette = erreichbar(appSkripte)
  for (const name of Object.keys(appSkripte).filter(istPruefung).sort()) {
    if (name === 'test' || name === 'lint') continue
    appLaeufe += 1
    const schluessel = `${app}/${name}`
    if (schluessel in APP_OHNE_CI) {
      genannt.add(schluessel)
      if (kette.has(name)) {
        maengel.push(
          `APP_OHNE_CI["${schluessel}"] ist ueberfluessig: der Lauf haengt inzwischen an test/lint.`,
        )
      }
      const grund = APP_OHNE_CI[schluessel]
      if (!grund || grund.trim().length < 40) {
        maengel.push(`APP_OHNE_CI["${schluessel}"] ohne brauchbare Begruendung.`)
      }
      continue
    }
    // Der Workflow der Suite darf einen App-Lauf auch direkt eintragen —
    // dann laeuft er, und die Erreichbarkeit ueber `test` waere nicht noetig.
    const imWorkflow = yml.includes(`npm run ${name} --workspace`)
    if (!kette.has(name) && !imWorkflow) {
      maengel.push(
        `${schluessel}  (Guard der App, aber weder in ihrem test/lint noch im Suite-Workflow)`,
      )
    }
  }
}

for (const schluessel of Object.keys(APP_OHNE_CI)) {
  if (!genannt.has(schluessel)) {
    maengel.push(`APP_OHNE_CI nennt "${schluessel}" — diesen Lauf gibt es dort nicht mehr.`)
  }
}

if (appLaeufe < 20) {
  maengel.push(`Nur ${appLaeufe} App-Pruef-Laeufe gesehen — vermutlich stimmt der Scan nicht.`)
}

if (maengel.length === 0) {
  console.log(
    `OK: alle ${alle.length} Pruef-Laeufe der Suite stehen im CI-Workflow (${alle.join(', ')}).`,
  )
  console.log(
    `OK: alle ${appLaeufe} Pruef-Laeufe in ${apps.length} vendorten Apps haengen an deren test/lint ` +
      `(${Object.keys(APP_OHNE_CI).length} erklaerte Ausnahmen).`,
  )
  process.exit(0)
}

console.error(`FEHLER: ${maengel.length} Punkt(e):\n`)
for (const m of maengel) console.error(`  ! ${m}`)
console.error(
  '\nEin Guard, den niemand faehrt, ist keine Zusicherung, sondern eine Notiz.\n' +
    'Eintragen als eigener Schritt in .github/workflows/ci.yml:\n' +
    '      - name: <was er zusichert>\n' +
    '        run: npm run <lauf>\n' +
    'Oder — wenn er bewusst nicht laufen soll — mit Begruendung in OHNE_CI.\n\n' +
    'Fuer einen Guard einer vendorten App (`<app>/<lauf>`) ist der Ort ein\n' +
    'anderer: die Suite faehrt `npm run test --workspaces`, also gehoert er in\n' +
    'das `test`-Skript SEINER App — nicht in den Workflow der Wurzel und schon\n' +
    'gar nicht in die vendorte Workflow-Kopie, die nie feuert.\n' +
    'Oder — wenn er dort nicht laufen soll — mit Begruendung in APP_OHNE_CI.',
)
process.exit(1)
