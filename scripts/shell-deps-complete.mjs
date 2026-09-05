#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Der Suite-Installer enthaelt jedes Paket, das der mitverpackte Main-Prozess
// zur Laufzeit verlangt.
//
// WARUM ES DAS GIBT. `apps/shell` verpackt nicht nur die eigene Shell, sondern
// auch Cables kompletten Main-Prozess: `copy-planners.mjs` legt ihn als
// `planners/signal-main/` ab, und `electron/cableHost.cjs` laedt daraus die
// IPC-Module, damit Cable in der Suite mit echtem IPC laeuft (nicht als
// iframe). Damit gelten Cables Laufzeit-Abhaengigkeiten auch fuer das
// Suite-Paket — electron-builder kennt aber nur `apps/shell/package.json`.
//
// Gemessen 2026-09-05 fehlte dort `ws`. `signalingServer.js:133` macht
// `require('ws')`; in `cable-planner` ist das Paket wenigstens transitiv ueber
// `y-webrtc` im Produktions-Baum, in der Shell ist `y-webrtc` gar keine
// Abhaengigkeit. Im gepackten Suite-Build fehlte `ws` also wirklich, und der
// LAN-Signaling-Relay waere mit `Cannot find module 'ws'` gestorben — beim
// Klick auf „Zusammenarbeit starten", nicht beim Bauen.
//
// WIE ER PRUEFT. Er liest die QUELLEN (`apps/shell/electron/` und
// `apps/cable-planner/src/main/`), nicht das gebaute `planners/`-Verzeichnis:
// so laeuft er ohne vorherigen Build und in CI. Jeder nackte Import-Name muss
// in `apps/shell/package.json` unter `dependencies` stehen. Node-Builtins und
// relative Pfade fallen raus, `devDependencies` zaehlen NICHT — electron-
// builder verpackt nur den Produktions-Baum.
//
// WAS ER NICHT PRUEFT: die Renderer der Planer. Die buendelt Vite, dort faellt
// eine fehlende Deklaration schon beim Bauen auf. Hier geht es um die
// Prozesse, die zur Laufzeit `require` sagen.
// ───────────────────────────────────────────────────────────────────────────
import { builtinModules } from 'node:module'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SHELL_PAKET = join(ROOT, 'apps', 'shell', 'package.json')

/**
 * Was im Suite-Paket landet und zur Laufzeit `require` sagt. `planners/` steht
 * hier bewusst NICHT: das entsteht erst beim Build, und ein Guard, der ohne
 * Build durchrutscht, prueft in CI die halbe Wahrheit.
 */
const QUELLEN = [
  join(ROOT, 'apps', 'shell', 'electron'),
  join(ROOT, 'apps', 'cable-planner', 'src', 'main'),
]

const BUILTIN = new Set([...builtinModules, 'electron'])

const paketName = (spez) =>
  spez.startsWith('@') ? spez.split('/').slice(0, 2).join('/') : spez.split('/')[0]

const nackteImporte = (verzeichnis) => {
  const funde = []
  const lauf = (d) => {
    for (const eintrag of readdirSync(d)) {
      const pfad = join(d, eintrag)
      if (statSync(pfad).isDirectory()) {
        lauf(pfad)
        continue
      }
      if (!/\.(ts|cts|mts|js|cjs|mjs)$/.test(eintrag)) continue
      const inhalt = readFileSync(pfad, 'utf8')
      const treffer = [
        ...inhalt.matchAll(/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g),
        ...inhalt.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
        ...inhalt.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g),
      ]
      for (const t of treffer) {
        const spez = t[1]
        if (spez.startsWith('.') || spez.startsWith('node:')) continue
        const name = paketName(spez)
        if (BUILTIN.has(name)) continue
        funde.push({ paket: name, datei: relative(ROOT, pfad) })
      }
    }
  }
  lauf(verzeichnis)
  return funde
}

const maengel = []

if (!existsSync(SHELL_PAKET)) {
  maengel.push('apps/shell/package.json fehlt — ohne sie prueft dieses Skript ins Leere.')
}

const paket = existsSync(SHELL_PAKET) ? JSON.parse(readFileSync(SHELL_PAKET, 'utf8')) : {}
const deps = paket.dependencies ?? {}
const dev = paket.devDependencies ?? {}

const funde = []
for (const q of QUELLEN) {
  if (!existsSync(q)) {
    maengel.push(`Quellverzeichnis fehlt: ${relative(ROOT, q)} — umbenannt? Dann prueft der Guard weniger, als er soll.`)
    continue
  }
  funde.push(...nackteImporte(q))
}

// Ein leerer Suchlauf waere gruen und wertlos.
if (new Set(funde.map((f) => f.paket)).size < 3) {
  maengel.push(`Nur ${new Set(funde.map((f) => f.paket)).size} Fremdpakete gefunden — der Suchlauf greift vermutlich daneben.`)
}

const gesehen = new Set()
for (const f of funde) {
  if (deps[f.paket] || gesehen.has(f.paket)) continue
  gesehen.add(f.paket)
  const zusatz = dev[f.paket]
    ? ' — steht in devDependencies; electron-builder verpackt nur den Produktions-Baum.'
    : ''
  maengel.push(`${f.paket} fehlt in apps/shell/package.json > dependencies (verlangt in ${f.datei})${zusatz}`)
}

if (maengel.length === 0) {
  const anzahl = new Set(funde.map((f) => f.paket)).size
  console.log(`OK: alle ${anzahl} Laufzeit-Pakete des mitverpackten Main-Prozesses stehen in apps/shell/package.json.`)
  process.exit(0)
}

console.error('Suite-Paket unvollstaendig:\n')
for (const m of maengel) console.error(`  ! ${m}`)
console.error(
  '\nDie Shell verpackt Cables Main-Prozess mit (planners/signal-main). Was der\n' +
    'zur Laufzeit verlangt, muss in apps/shell/package.json stehen — sonst fehlt es\n' +
    'im Installer und bricht erst beim Nutzer.',
)
process.exit(1)
