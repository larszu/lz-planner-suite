#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Die Shell zeigt im Entwicklungsbetrieb auf Ports, auf denen wirklich jemand
// hoert (Backlog B-17).
//
// WARUM ES DAS GIBT. Gemessen 2026-09-04: Die Dev-Fallback-URLs der Shell
// standen auf 4181/4182/4183 — so auch in der README. KEIN Planer hoerte je
// auf diesen Ports: multicam setzte ausdruecklich 5173, cable und light
// setzten gar nichts und landeten damit auf demselben Vite-Standard; der
// zweite gestartete rueckte still auf 5174 weiter.
//
// Das war nicht der Ausnahme-, sondern der Normalfall: wer der README Schritt
// fuer Schritt folgte, sah sechs Sekunden „wird geladen…" und danach
// „Signal-Flow ist gerade nicht erreichbar". Der Fehler sah aus wie einer der
// Shell, und die Suche begann an der falschen Stelle.
//
// WAS ER PRUEFT, und warum genau das. Nicht „stehen die Zahlen in der README"
// — dann waere die README die Wahrheit, und die kann veralten, ohne dass es
// auffaellt. Er vergleicht ZWEI QUELLEN, die beide der Code sind: den
// Fallback in `apps/shell/src/modules/registry.ts` und den `server.port` in
// der `vite.config.ts` des jeweiligen Planers. Weichen sie ab, zeigt die
// Shell ins Leere — egal, was irgendwo dokumentiert ist.
//
// Dazu `strictPort`: ohne die Angabe rueckt Vite bei besetztem Port still
// weiter, und dann stimmt die Zahl in der Konfiguration zwar, der laufende
// Server hoert aber woanders. Genau dieses stille Weiterruecken war die
// zweite Haelfte des Defekts.
//
// Lauf: `npm run devports:check`
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const lies = (rel) => readFileSync(join(ROOT, rel), 'utf8')

/** Modul-Schluessel in der Registry -> vendorte App. */
const PAARE = [
  { modul: 'signal', app: 'cable-planner' },
  { modul: 'cameras', app: 'multicam-planner' },
  { modul: 'licht', app: 'light-planner' },
]

const registry = lies('apps/shell/src/modules/registry.ts')
const fehler = []

for (const { modul, app } of PAARE) {
  // Der Fallback steht als dritter Parameter von `plannerUrl(...)`.
  const m = new RegExp(
    `plannerUrl\\('${modul}'[^)]*'http://localhost:(\\d+)/?'\\)`,
  ).exec(registry)
  if (!m) {
    fehler.push(`registry.ts: kein Dev-Fallback fuer Modul "${modul}" gefunden`)
    continue
  }
  const shellPort = Number(m[1])

  const vite = lies(`apps/${app}/vite.config.ts`)
  const vm = /server:\s*\{[^}]*port:\s*(\d+)/s.exec(vite)
  if (!vm) {
    fehler.push(`${app}/vite.config.ts: kein fester server.port — Vite nimmt 5173, die Shell sucht auf ${shellPort}`)
    continue
  }
  const plannerPort = Number(vm[1])
  if (plannerPort !== shellPort) {
    fehler.push(`${app}: hoert auf ${plannerPort}, die Shell sucht auf ${shellPort}`)
  }
  if (!/strictPort:\s*true/.test(vite)) {
    fehler.push(`${app}/vite.config.ts: ohne strictPort rueckt Vite bei besetztem Port still weiter`)
  }
}

if (fehler.length) {
  console.error('devports:check FEHLGESCHLAGEN:')
  for (const f of fehler) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(`devports:check ok — ${PAARE.length} Planer, Shell und vite.config nennen denselben Port (B-17)`)
