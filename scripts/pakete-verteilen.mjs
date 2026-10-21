#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Pakete in die eigenstaendigen Planer bringen (ADR-015).
//
// WARUM ES DAS GIBT. Gemessen am 2026-09-28: kein eigenstaendiger Planer
// haengt an einem `@avplan/*`-Paket. Die Pakete wirkten nur in den
// vendorierten Kopien unter `apps/`; jeder Planer trug daneben seine eigene,
// langsam abweichende Fassung (drei Venue-Formate, vier Plan-Lader, fuenf
// verschiedene `types.ts` des Inventarformats, die sich alle „byte-gleich"
// nannten). Ein Paket, das die Planer nicht erreicht, teilt nichts.
//
// WIE. Die Quelldateien eines Pakets werden in einen festen Ordner je Planer
// kopiert (`<repo>/<ziel>/`), dazu ein MANIFEST.json mit dem SHA-256 jeder
// Datei. Der Planer prueft in seinem eigenen CI, dass die Kopie dem Manifest
// entspricht — eine Aenderung in der Kopie faellt dort sofort auf, und die
// Fehlermeldung sagt, wo sie hingehoert. In der Suite ersetzt das Paket die
// Kopie (planner-drift: Praefix `avplan/`).
//
//   node scripts/pakete-verteilen.mjs --ziel ..                  alle Pakete, alle Planer
//   node scripts/pakete-verteilen.mjs --ziel .. --paket floorplan
//   node scripts/pakete-verteilen.mjs --ziel .. --pruefen        nur vergleichen, Exit 1 bei Abweichung
// ───────────────────────────────────────────────────────────────────────────
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Paket → Planer-Repo → Zielordner. Eine Zeile je Kopie, sonst nirgends. */
export const ZIELE = {
  floorplan: {
    'cable-planner': 'src/renderer/avplan/floorplan',
    'larszu-facility-planner': 'src/avplan/floorplan',
    'light-planner': 'src/avplan/floorplan',
    'multicam-planner': 'src/avplan/floorplan',
  },
  scene3d: {
    'cable-planner': 'src/renderer/avplan/scene3d',
    'light-planner': 'src/avplan/scene3d',
    'multicam-planner': 'src/avplan/scene3d',
  },
}

const args = process.argv.slice(2)
const wert = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const zielWurzel = wert('--ziel')
const nurPaket = wert('--paket')
const pruefen = args.includes('--pruefen')

if (!zielWurzel) {
  console.error('Aufruf: node scripts/pakete-verteilen.mjs --ziel <Ordner mit den Planer-Repos> [--paket <name>] [--pruefen]')
  process.exit(2)
}

const quelldateien = (dir) => {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const voll = join(dir, name)
    if (statSync(voll).isDirectory()) out.push(...quelldateien(voll))
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(voll)
  }
  return out
}

const sha = (text) => createHash('sha256').update(text).digest('hex')

let fehler = 0
for (const [paket, ziele] of Object.entries(ZIELE)) {
  if (nurPaket && paket !== nurPaket) continue
  const paketDir = join(ROOT, 'packages', paket)
  const pkg = JSON.parse(readFileSync(join(paketDir, 'package.json'), 'utf8'))
  const srcDir = join(paketDir, 'src')
  const dateien = quelldateien(srcDir).map((voll) => ({ rel: relative(srcDir, voll).split('\\').join('/'), text: readFileSync(voll, 'utf8') }))
  const manifest = {
    paket: pkg.name,
    version: pkg.version,
    quelle: `av-planner-suite/packages/${paket}/src`,
    hinweis: 'Kopie eines Suite-Pakets (ADR-015). Nicht hier aendern: in av-planner-suite/packages aendern und mit `npm run pakete:verteilen` neu kopieren.',
    dateien: Object.fromEntries(dateien.map((d) => [d.rel, sha(d.text)])),
  }
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`
  // Die Wächter vergleichen Bytes. Ein Windows-Checkout mit `core.autocrlf`
  // machte aus jeder Kopie CRLF und damit jeden Wächter rot, ohne dass
  // jemand etwas geändert hat. Eine eigene `.gitattributes` im Kopie-Ordner
  // haelt die Zeilenenden fest, in jedem Repo gleich.
  const attributeText = '# Kopie eines Suite-Pakets (ADR-015): Zeilenenden fest, der Waechter vergleicht Bytes.\n* text eol=lf\n'

  for (const [repo, zielRel] of Object.entries(ziele)) {
    const repoDir = join(zielWurzel, repo)
    if (!existsSync(repoDir)) {
      console.log(`- ${paket} → ${repo}: Repo nicht unter ${zielWurzel}, uebersprungen`)
      continue
    }
    const zielDir = join(repoDir, zielRel)
    if (pruefen) {
      const abw = []
      const mPfad = join(zielDir, 'MANIFEST.json')
      if (!existsSync(mPfad) || readFileSync(mPfad, 'utf8') !== manifestText) abw.push('MANIFEST.json')
      const aPfad = join(zielDir, '.gitattributes')
      if (!existsSync(aPfad) || readFileSync(aPfad, 'utf8') !== attributeText) abw.push('.gitattributes')
      for (const d of dateien) {
        const p = join(zielDir, d.rel)
        if (!existsSync(p) || readFileSync(p, 'utf8') !== d.text) abw.push(d.rel)
      }
      if (existsSync(zielDir)) {
        for (const voll of quelldateien(zielDir)) {
          const rel = relative(zielDir, voll).split('\\').join('/')
          if (!manifest.dateien[rel]) abw.push(`${rel} (ueberzaehlig)`)
        }
      }
      if (abw.length) {
        fehler++
        console.log(`✗ ${paket} → ${repo}/${zielRel}: ${abw.join(', ')}`)
      } else console.log(`✓ ${paket} → ${repo}/${zielRel}`)
      continue
    }
    if (existsSync(zielDir)) rmSync(zielDir, { recursive: true })
    for (const d of dateien) {
      const p = join(zielDir, d.rel)
      mkdirSync(dirname(p), { recursive: true })
      writeFileSync(p, d.text)
    }
    writeFileSync(join(zielDir, 'MANIFEST.json'), manifestText)
    writeFileSync(join(zielDir, '.gitattributes'), attributeText)
    console.log(`→ ${paket} → ${repo}/${zielRel} (${dateien.length} Dateien)`)
  }
}
if (pruefen && fehler) {
  console.error(`\n${fehler} Kopie(n) weichen ab. Neu verteilen: node scripts/pakete-verteilen.mjs --ziel <Ordner>`)
  process.exit(1)
}
