#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Drift-Guard fuer die vendorten Planer-Kopien unter apps/.
//
// Die Suite enthaelt Kopien von cable-planner, multicam-planner und
// light-planner statt sie zu konsumieren. Diese Kopien sind in BEIDE
// Richtungen auseinandergelaufen: upstream hat Features, die der Suite
// fehlen (NetBox-Import), die Suite hat Features, die upstream fehlen
// (Shell-Bridge, Lexware, i18n). Ein blosses Ueberkopieren wuerde Arbeit
// zerstoeren.
//
// Dieses Skript misst die Divergenz und triagiert sie:
//   only-upstream    Datei fehlt der Suite            -> uebernehmen
//   only-suite       Datei fehlt upstream             -> Overlay oder hoch
//   upstream-ahead   Suite-Inhalt ist Teilmenge       -> mechanisch loesbar
//   suite-ahead      Upstream-Inhalt ist Teilmenge    -> mechanisch loesbar
//   two-way          beide Seiten haben eigene Zeilen -> Handarbeit
//
// Lauf:
//   node scripts/planner-drift.mjs --upstream ..            Bericht
//   node scripts/planner-drift.mjs --upstream .. --check    CI: faellt bei Wachstum
//   node scripts/planner-drift.mjs --upstream .. --write-baseline
//
// Die Klassifikation vergleicht Zeilen-Multimengen, nicht echte Merges.
// Sie ist eine Triage-Hilfe, kein Ersatz fuer git diff.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const APPS = ['cable-planner', 'multicam-planner', 'light-planner']
const BASELINE = join(ROOT, 'scripts', 'planner-drift-baseline.json')

/**
 * Deklarativer Overlay: Upstream-Pfade, die die Suite BEWUSST nicht hat, weil
 * ein geteiltes Paket sie ersetzt. Das ist die geglueckte Konsolidierung, kein
 * Drift — diese Dateien zurueckzukopieren waere ein Rueckschritt.
 *
 * Alle drei Apps beziehen Typen und Serialisierung aus @avplan/inventory-core
 * (siehe inventory/store.ts bzw. renderer/store/inventoryStore.ts und die
 * serializeInventory/parseInventory-Aufrufe in den InventoryDialogs).
 */
const REPLACED_BY_PACKAGE = {
  'cable-planner': [
    'renderer/types/inventory.ts',      // -> @avplan/inventory-core (Typen)
    'renderer/lib/inventoryPortable.ts', // -> @avplan/inventory-core (Wire-Format)
  ],
  'multicam-planner': [
    'inventory/types.ts',
    'inventory/portable.ts',
  ],
  'light-planner': [
    'inventory/types.ts',
    'inventory/portable.ts',
  ],
}

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}
const has = (name) => args.includes(`--${name}`)

const upstreamRoot = opt('upstream', join(ROOT, '..'))
const IGNORE = new Set(['node_modules', '.git', 'dist', 'release', 'build', '.vite'])

/** Alle Dateien unter dir, relativ zu dir. */
function walk(dir, base = dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, base, out)
    else out.push(relative(base, p))
  }
  return out
}

/**
 * Normalisiert die i18n-Transformation der Suite weg.
 *
 * Die Suite ersetzt nackte deutsche Literale durch t('key', 'Text'). Ohne
 * Normalisierung zaehlt jede uebersetzte Zeile doppelt — einmal als
 * suite-only (die t()-Form), einmal als upstream-only (die nackte Form) —
 * und ein vollstaendig gemergtes File sieht aus wie schwere Divergenz.
 * Genau das hat die erste Fassung dieses Skripts getan und die two-way-Zahl
 * massiv aufgeblaeht.
 *
 * t('a.b', 'Text') -> 'Text'  ·  translate(lang, 'a.b', 'Text') -> 'Text'
 * Reine Overlay-Zeilen (useTranslation, @avplan/*-Importe) fallen ganz weg.
 */
function normalise(line) {
  let l = line
  // t('key', 'Fallback') / t("key", "Fallback") -> 'Fallback'
  l = l.replace(/\bt\(\s*(['"])(?:[^'"\\]|\\.)*?\1\s*,\s*(['"])((?:[^'"\\]|\\.)*?)\2\s*\)/g, '$2$3$2')
  // translate(lang, 'key', 'Fallback') -> 'Fallback'
  l = l.replace(/\btranslate\(\s*[A-Za-z0-9_.]+\s*,\s*(['"])(?:[^'"\\]|\\.)*?\1\s*,\s*(['"])((?:[^'"\\]|\\.)*?)\2\s*\)/g, '$2$3$2')
  // JSX-Wrapper um einen reinen Ausdruck: {'Text'} -> Text
  l = l.replace(/\{\s*(['"])((?:[^'"\\]|\\.)*?)\1\s*\}/g, '$2')
  return l.trim()
}

/** Zeilen-Multimenge: getrimmt, i18n-normalisiert, Leerzeilen raus. */
function lineBag(file) {
  const bag = new Map()
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = normalise(raw)
    if (!line) continue
    bag.set(line, (bag.get(line) ?? 0) + 1)
  }
  return bag
}

/** Zeilen aus a, die nicht (oft genug) in b vorkommen — als Texte. */
function excessLines(a, b) {
  const out = []
  for (const [line, count] of a) {
    const extra = count - (b.get(line) ?? 0)
    for (let i = 0; i < extra; i++) out.push(line)
  }
  return out
}

const isImport = (l) => /^import\s|^export\s.*\sfrom\s/.test(l)

/**
 * Beabsichtigter Overlay statt echter Drift: Die Suite schreibt Importe auf die
 * geteilten @avplan/*-Pakete um, upstream nutzt relative Pfade. Beides sind
 * Import-Zeilen, die Suite-Seite zeigt auf @avplan/. Das ist gewollt und darf
 * nicht als Reconciliation-Arbeit gezaehlt werden.
 */
function isExpectedOverlay(suiteEx, upstreamEx) {
  if (!suiteEx.length || !upstreamEx.length) return false
  return suiteEx.every((l) => isImport(l) && l.includes('@avplan/')) &&
         upstreamEx.every((l) => isImport(l))
}

function classify(suiteFile, upstreamFile) {
  const s = lineBag(suiteFile)
  const u = lineBag(upstreamFile)
  const suiteEx = excessLines(s, u)
  const upstreamEx = excessLines(u, s)
  const suiteOnly = suiteEx.length
  const upstreamOnly = upstreamEx.length
  if (suiteOnly === 0 && upstreamOnly === 0) return null // nur Whitespace
  if (isExpectedOverlay(suiteEx, upstreamEx)) return { kind: 'expected-overlay', suiteOnly, upstreamOnly }
  if (suiteOnly === 0) return { kind: 'upstream-ahead', suiteOnly, upstreamOnly }
  if (upstreamOnly === 0) return { kind: 'suite-ahead', suiteOnly, upstreamOnly }
  return { kind: 'two-way', suiteOnly, upstreamOnly }
}

/**
 * Commit des Upstream-Checkouts. Die Baseline ist nur gegen genau diesen
 * Stand aussagekraeftig: bewegt sich upstream, aendert sich der Drift ohne
 * Zutun der Suite. Ohne diese Unterscheidung wuerde ein fremder Suite-PR rot,
 * weil jemand in cable-planner gepusht hat.
 */
function upstreamSha(app) {
  try {
    return execFileSync('git', ['-C', join(upstreamRoot, app), 'rev-parse', 'HEAD'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().slice(0, 12)
  } catch {
    return null
  }
}

function analyseApp(app) {
  const suiteSrc = join(ROOT, 'apps', app, 'src')
  const upSrc = join(upstreamRoot, app, 'src')
  if (!existsSync(upSrc)) return { app, missingUpstream: true, findings: [] }

  const suiteFiles = new Set(walk(suiteSrc))
  const upFiles = new Set(walk(upSrc))
  const findings = []

  const replaced = new Set(REPLACED_BY_PACKAGE[app] ?? [])

  for (const f of upFiles) {
    if (!suiteFiles.has(f)) {
      // Bewusst entfernt, weil ein geteiltes Paket die Datei ersetzt.
      findings.push({ file: f, kind: replaced.has(f) ? 'expected-overlay' : 'only-upstream' })
      continue
    }
    const c = classify(join(suiteSrc, f), join(upSrc, f))
    if (c) findings.push({ file: f, ...c })
  }
  for (const f of suiteFiles) if (!upFiles.has(f)) findings.push({ file: f, kind: 'only-suite' })

  return { app, findings }
}

const KINDS = ['only-upstream', 'only-suite', 'two-way', 'upstream-ahead', 'suite-ahead', 'expected-overlay']
const results = APPS.map(analyseApp)

const summary = {}
for (const r of results) {
  const counts = Object.fromEntries(KINDS.map((k) => [k, 0]))
  for (const f of r.findings) counts[f.kind]++
  // expected-overlay ist gewollt und zaehlt nicht als Drift.
  const drift = r.findings.length - counts['expected-overlay']
  summary[r.app] = {
    ...counts, drift, total: r.findings.length,
    missingUpstream: !!r.missingUpstream,
    upstreamSha: r.missingUpstream ? null : upstreamSha(r.app),
  }
}

// ---------- Bericht ----------
const lines = ['# Planner drift report', '']
lines.push('Divergence between the suite\'s vendored `apps/*` copies and the standalone upstream repos.')
lines.push('Classification compares line multisets and is triage, not a merge. See the header of')
lines.push('`scripts/planner-drift.mjs`.', '')
lines.push('`expected-overlay` is the deliberate `@avplan/*` import rewrite and is not drift.', '')
lines.push('| App | drift | only-upstream | only-suite | two-way | upstream-ahead | suite-ahead | expected-overlay |')
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |')
for (const app of APPS) {
  const s = summary[app]
  if (s.missingUpstream) { lines.push(`| ${app} | upstream checkout not found | | | | | | |`); continue }
  lines.push(`| ${app} | ${s.drift} | ${s['only-upstream']} | ${s['only-suite']} | ${s['two-way']} | ${s['upstream-ahead']} | ${s['suite-ahead']} | ${s['expected-overlay']} |`)
}
lines.push('', '## Files needing manual reconciliation (two-way)', '')
let anyTwoWay = false
for (const r of results) {
  const tw = r.findings.filter((f) => f.kind === 'two-way').sort((a, b) => (b.suiteOnly + b.upstreamOnly) - (a.suiteOnly + a.upstreamOnly))
  if (!tw.length) continue
  anyTwoWay = true
  lines.push(`### ${r.app}`, '', '| File | lines only in suite | lines only upstream |', '| --- | --- | --- |')
  for (const f of tw) lines.push(`| \`${f.file}\` | ${f.suiteOnly} | ${f.upstreamOnly} |`)
  lines.push('')
}
if (!anyTwoWay) lines.push('None.', '')

// Maschinenlesbar fuer Skripte (Stufe 2 der Konsolidierung).
if (has('json')) {
  const byApp = {}
  for (const r of results) byApp[r.app] = r.findings
  console.log(JSON.stringify({ summary, findings: byApp }, null, 2))
  process.exit(0)
}

const report = lines.join('\n')
const reportPath = opt('report', null)
if (reportPath) { writeFileSync(reportPath, report); console.log(`Report geschrieben: ${reportPath}`) }
else if (!has('check')) console.log(report)

// ---------- Baseline / CI ----------
if (has('write-baseline')) {
  writeFileSync(BASELINE, JSON.stringify(summary, null, 2) + '\n')
  console.log(`Baseline geschrieben: ${relative(ROOT, BASELINE)}`)
  process.exit(0)
}

if (has('check')) {
  if (!existsSync(BASELINE)) {
    console.error('Keine Baseline vorhanden. Erst: node scripts/planner-drift.mjs --write-baseline')
    process.exit(1)
  }
  const base = JSON.parse(readFileSync(BASELINE, 'utf8'))
  let failed = false
  for (const app of APPS) {
    const now = summary[app]
    const was = base[app]
    if (!was) continue
    if (now.missingUpstream) {
      console.log(`~ ${app}: upstream checkout fehlt, uebersprungen`)
      continue
    }
    // Upstream hat sich bewegt: der Drift-Vergleich ist dann nicht mehr
    // aussagekraeftig, denn die Ursache liegt ausserhalb dieses Repos.
    // Melden, aber nicht fehlschlagen — sonst faellt ein fremder Suite-PR
    // ueber einen Push in einem Nachbar-Repo.
    if (was.upstreamSha && now.upstreamSha && was.upstreamSha !== now.upstreamSha) {
      console.log(
        `~ ${app}: upstream bewegt (${was.upstreamSha} -> ${now.upstreamSha}), ` +
        `Drift ${was.drift} -> ${now.drift}. Baseline mit --write-baseline nachziehen.`,
      )
      continue
    }
    if (now.drift > was.drift) {
      console.error(`FEHLER ${app}: Drift gewachsen ${was.drift} -> ${now.drift} (upstream unveraendert)`)
      failed = true
    } else if (now.drift < was.drift) {
      console.log(`OK ${app}: Drift gesunken ${was.drift} -> ${now.drift} (Baseline mit --write-baseline nachziehen)`)
    } else {
      console.log(`OK ${app}: Drift unveraendert (${now.drift})`)
    }
  }
  process.exit(failed ? 1 : 0)
}
