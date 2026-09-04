#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Jede vendorte App traegt dieselbe Lizenz wie die Suite, in der sie liegt.
//
// WARUM ES DAS GIBT. Am 2026-09-04 nachgemessen: `apps/cable-planner/LICENSE`
// trug seit dem Erst-Import (5e9566a, 2026-07-10) eine MIT-Lizenz. Upstream
// hatte cable-planner am 2026-08-29 auf eine proprietaere Lizenz umgestellt
// (bc4e083, 104 Zeilen); die vendorte Kopie blieb MIT. `apps/multicam-planner`
// und `apps/light-planner` hatten ueberhaupt keine LICENSE. Der Drift-Guard
// meldete waehrenddessen "Drift unveraendert" — LICENSE stand weder in seinen
// ROOTS noch in ROOT_FILES.
//
// Der Schaden ist nicht kosmetisch. Wer `apps/cable-planner/` ansieht, findet
// die naechstliegende Lizenzdatei und liest daraus eine Erlaubnis, die der
// Eigentuemer sechs Tage zuvor zurueckgenommen hatte.
//
// WARUM ZUSAETZLICH ZUM DRIFT-GUARD. Der vergleicht gegen einen
// Upstream-Checkout. Fehlt der (fremder Fork, fehlendes Lesetoken, ci.yml
// setzt `continue-on-error` an allen drei Checkouts), ueberspringt er die
// Pruefung und bleibt gruen. Dieser Check braucht nichts ausser dem Repo
// selbst und laeuft deshalb im normalen build-test-Job mit.
//
// WAS ER NICHT PRUEFT: ob die Lizenz die richtige IST. Er prueft, dass alle
// Kopien dieselbe Aussage machen wie die Wurzel. Welche Aussage das sein
// soll, entscheidet der Eigentuemer, nicht dieses Skript.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const APPS = ['cable-planner', 'multicam-planner', 'light-planner']

/** Zeilenenden und Rand-Leerraum weg — ein CRLF ist kein Lizenzwechsel. */
const normalise = (text) =>
  text.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trim()

const wurzelPfad = join(ROOT, 'LICENSE')
if (!existsSync(wurzelPfad)) {
  console.error('FEHLER: Die Suite hat selbst keine LICENSE — es gibt nichts zu vergleichen.')
  process.exit(1)
}
const wurzel = normalise(readFileSync(wurzelPfad, 'utf8'))
if (!wurzel) {
  console.error('FEHLER: LICENSE in der Suite-Wurzel ist leer.')
  process.exit(1)
}

const maengel = []
for (const app of APPS) {
  const p = join(ROOT, 'apps', app, 'LICENSE')
  if (!existsSync(p)) {
    maengel.push(`apps/${app}/LICENSE fehlt — die App liegt ohne Lizenzangabe im Baum.`)
    continue
  }
  const text = normalise(readFileSync(p, 'utf8'))
  if (text === wurzel) continue
  // Die erste nichtleere Zeile ist die Aussage, um die es geht.
  const kopf = (s) => s.split('\n').find((l) => l.trim()) ?? '(leer)'
  maengel.push(
    `apps/${app}/LICENSE weicht von der Suite-Wurzel ab.\n` +
      `      Wurzel:  ${kopf(wurzel)}\n` +
      `      Kopie:   ${kopf(text)}\n` +
      `      Zeilen:  Wurzel ${wurzel.split('\n').length}, Kopie ${text.split('\n').length}`,
  )
}

if (maengel.length === 0) {
  console.log(`OK: ${APPS.length} vendorte Apps tragen die Lizenz der Suite-Wurzel.`)
  process.exit(0)
}
console.error('Lizenz-Abweichung in vendorten Apps:\n')
for (const m of maengel) console.error(`  ! ${m}`)
console.error(
  '\nAngleichen: cp LICENSE apps/<app>/LICENSE (oder die Wurzel korrigieren,\n' +
    'falls SIE die veraltete ist).',
)
process.exit(1)
