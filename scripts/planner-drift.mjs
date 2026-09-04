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
//
// ZWEITE FRAGE, seit ADR-005 Inkrement 4: "Upstream changes not yet carried
// over". Die Drift-Zahlen zaehlen Dateien und Zeilen-Differenzen, nicht
// Aenderungen — eine Datei, die ohnehin `two-way` ist, bleibt `two-way`, ob
// der letzte Upstream-Fix in ihr angekommen ist oder nicht. Daran ist ein
// uebersprungener Vendoring-Commit vorbeigerutscht (cable#634): Drift zurueck
// auf Baseline, Guard gruen, Fix fehlte trotzdem.
//
// Deshalb fragt das Skript zusaetzlich ueber den INHALT: welche Zeilen hat
// upstream seit dem in der Baseline vermerkten `upstreamSha` hinzugefuegt, und
// fehlen sie in der Suite-Kopie vollstaendig? Kein Beweis fuer einen Verlust —
// eine Aenderung kann bewusst draussengeblieben sein —, aber die Liste, die
// man beim Nachziehen durchgeht.
//
// Ueber den Inhalt und nicht ueber die Suite-Historie, und das mit Absicht:
// eine erste Fassung merkte sich zusaetzlich einen `suiteSha`. Das faellt beim
// Squash-Merge um — der aufgezeichnete Commit landet nie auf main, und ein
// frischer Klon meldet fuer immer „nicht pruefbar". Gebraucht wird nur die
// Upstream-Historie, die beim Vendoring ohnehin dasteht; bei flachem Checkout
// sagt der Bericht, dass er nicht pruefen konnte, statt Vollstaendigkeit zu
// behaupten.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const APPS = ['cable-planner', 'multicam-planner', 'light-planner']

/**
 * Verglichene Wurzeln je App. Anfangs war das nur `src`, was einen blinden
 * Fleck hatte: cable-planner haelt seine Tests in `tests/`, also blieben fuenf
 * fehlende Testdateien unsichtbar — darunter die Tests fuer den NetBox-Code.
 * `scripts/` stand mit derselben Begruendung draussen -- "Build-Skripte duerfen
 * sich zwischen Monorepo und Standalone unterscheiden". Nachgemessen
 * (2026-09-04) stimmt das nicht: von **38** Dateien unter `apps/<app>/scripts`
 * wich **eine einzige** ab, und die war ein echter, nicht uebernommener Fix
 * (`light#56` erweitert `avplan-check.ts`). Die Ausnahme kostete also nichts
 * ausser Blindheit. `scripts/` ist deshalb jetzt im Feld.
 */
const ROOTS = ['src', 'tests', 'scripts']

/**
 * Einzelne Dateien in der App-Wurzel, die genauso vendoriert sind wie der
 * Quelltext -- aber in keiner der ROOTS liegen und deshalb bis 2026-09-04
 * UNBEOBACHTET drifteten.
 *
 * Gemessen an dem Tag: `apps/cable-planner/CLAUDE.md` lag 39 Zeilen hinter
 * upstream. Ihm fehlten unter anderem die Regel "keine Trailer in
 * Commit-Messages" und die Merge-Berechtigung -- also genau die Anweisungen,
 * nach denen jemand handelt, der unter `apps/cable-planner/` arbeitet und
 * diese Datei als naechstliegende CLAUDE.md liest. Ein Drift-Bericht, der
 * "OK" sagt, waehrend die Arbeitsanweisung veraltet ist, ist schlimmer als
 * keiner: er behauptet eine Deckung, die es nicht gibt.
 *
 * package.json bleibt draussen -- Monorepo und Standalone haben
 * zwangslaeufig verschiedene Abhaengigkeiten und Skripte. (Dieser Absatz
 * nannte bis 2026-09-04 auch `scripts/` als draussen, waehrend ROOTS es
 * seit demselben Tag enthaelt. Ein Kommentar, der den Erfassungsbereich
 * falsch beschreibt, ist genau die Sorte Beleg, mit der spaeter jemand
 * eine Luecke begruendet, die es nicht gibt.)
 *
 * LICENSE kam am 2026-09-04 dazu, und zwar aus einem Befund, der schwerer
 * wiegt als die CLAUDE.md-Luecke, aus der diese Liste entstand:
 * `apps/cable-planner/LICENSE` trug seit dem Erst-Import (5e9566a,
 * 2026-07-10) eine MIT-Lizenz. Upstream stellte cable-planner am
 * 2026-08-29 auf eine proprietaere Lizenz um (bc4e083); die vendorte
 * Kopie blieb MIT. `apps/multicam-planner/LICENSE` und
 * `apps/light-planner/LICENSE` fehlten ganz, obwohl upstream beide 104
 * Zeilen fuehren. Der Guard meldete waehrenddessen "Drift unveraendert".
 *
 * Das ist derselbe Fehlermodus wie bei CLAUDE.md, nur mit Rechtsfolge: Wer
 * `apps/cable-planner/` ansieht, findet die naechstliegende Lizenzdatei und
 * liest daraus eine Erlaubnis, die der Eigentuemer sechs Tage zuvor
 * zurueckgenommen hatte. Die Lehre aus der CLAUDE.md-Luecke war auf genau
 * eine Datei angewandt worden statt auf die Frage, welche Wurzeldateien
 * sonst noch etwas BEHAUPTEN.
 */
const ROOT_FILES = ['CLAUDE.md', 'LICENSE']

/** Was git bei `changedSince` als Pfadfilter sieht: Wurzeln plus Einzeldateien. */
const TRACKED = [...ROOTS, ...ROOT_FILES]
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
    'components/ErrorBoundary.tsx', // -> @avplan/ui (App.tsx importiert es von dort)
  ],
  'light-planner': [
    'inventory/types.ts',
    'inventory/portable.ts',
    'components/ErrorBoundary.tsx', // -> @avplan/ui (main.tsx importiert es von dort)
  ],
}

/**
 * Upstream-Dateien, die dort selbst toter Code sind: nichts importiert sie.
 * Sie in die Suite zu vendoren wuerde toten Code einschleppen — geprueft, indem
 * upstream nach Importen der Datei durchsucht wurde (keine Treffer ausser der
 * Definition selbst). Sauberer waere, sie upstream zu loeschen.
 */
const SUITE_OVERLAY = {
  'cable-planner': [
    'main/ipc/lexwareIpc.ts', 'main/services/lexwareService.ts', 'renderer/lib/shellLexware.ts',
    'renderer/lib/isEmbedded.ts', 'renderer/lib/shellHistory.ts', 'renderer/lib/shellSettings.ts',
  ],
  'multicam-planner': [
    'hooks/useDomTheme.ts', 'hooks/useIsEmbedded.ts', 'shellSettings.ts',
    'i18n/index.ts', 'i18n/de.ts', 'i18n/de/common.ts', 'i18n/de/header.ts',
    'i18n/de/inventory.ts', 'i18n/de/preview.ts', 'i18n/de/sidebar.ts', 'i18n/de/venue.ts',
  ],
  'light-planner': [
    'components/Onboarding.tsx', 'hooks/useIsEmbedded.ts', 'shellSettings.ts',
    'i18n/en/app.ts', 'i18n/en/base.ts', 'i18n/en/dialogs.ts', 'i18n/en/panels.ts',
    'i18n/en/topbar.ts',
    'tests/i18n.test.ts', 'tests/pdfExport.test.ts',
  ],
}

/**
 * Wie REPLACED_BY_PACKAGE, aber mit Wurzel-Praefix -- fuer Wurzeln ausserhalb
 * von `src`. `scripts/inventory-contract-check.ts` friert upstream den
 * Wire-Contract des portablen Lagers ein; in der Suite tut das
 * `packages/inventory-core/test/contract.test.ts` (gleiche Zusicherung,
 * gleicher INVENTORY_FORMAT_VERSION). Zurueckzukopieren waere ein Rueckschritt.
 */
REPLACED_BY_PACKAGE['light-planner'].push('scripts/inventory-contract-check.ts')

const DEAD_UPSTREAM = {
  'light-planner': [
    'components/MenuBar.tsx', // App.tsx nutzt TopBar
    'components/Toolbar.tsx', // App.tsx nutzt ToolRail
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

// Auch die Schlusszeile eines MEHRZEILIGEN Imports zaehlt: `} from '…'`.
// Ohne sie rutscht jede Datei, deren @avplan-Import ueber mehrere Zeilen
// geht, aus `expected-overlay` in `two-way` und erscheint als Arbeit, die
// keine ist — genau das ist bei tests/inventoryPortable.test.ts passiert.
const isImport = (l) => /^import\s|^\s*\}\s*from\s|^export\s.*\sfrom\s/.test(l)

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

/** Zeilen-Multimenge aus einem Text (statt aus einer Datei). */
function lineBagOf(text) {
  const bag = new Map()
  for (const raw of text.split('\n')) {
    const line = normalise(raw)
    if (!line) continue
    bag.set(line, (bag.get(line) ?? 0) + 1)
  }
  return bag
}

/** Dateien, die `git` zwischen zwei Staenden unter den ROOTS geaendert hat. */
function changedSince(repoDir, sinceSha, pathPrefixes) {
  try {
    const out = execFileSync(
      'git', ['-C', repoDir, 'diff', '--name-only', `${sinceSha}..HEAD`, '--', ...pathPrefixes],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
    return out.split('\n').map((l) => l.trim()).filter(Boolean)
  } catch {
    return null // Stand nicht bekannt (flacher Checkout) — ehrlich melden, nicht raten
  }
}

/** Inhalt einer Datei zu einem bestimmten Commit, oder null. */
function blobAt(repoDir, sha, path) {
  try {
    return execFileSync('git', ['-C', repoDir, 'show', `${sha}:${path}`], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024,
    })
  } catch {
    return null
  }
}

/**
 * ADR-005, Regel 4, auf dieses Skript selbst angewandt.
 *
 * Der Drift-Vergleich zaehlt DATEIEN und ihre Zeilen-Differenz, nicht
 * Aenderungen. Eine Datei, die ohnehin `two-way` ist, bleibt `two-way`, ob
 * der letzte Upstream-Fix in ihr angekommen ist oder nicht — die Zahl bewegt
 * sich nicht. Genau daran ist ein uebersprungener Vendoring-Commit
 * vorbeigerutscht (cable#634): Drift zurueck auf Baseline, Guard gruen, Fix
 * fehlte trotzdem. Aufgefallen ist es an den Testzahlen beider Seiten.
 *
 * Die Frage direkt gestellt: welche Zeilen hat der Upstream-Commit-Bereich
 * seit dem Baseline-Stand HINZUGEFUEGT, und fehlen sie in der Suite-Kopie
 * vollstaendig? Dann ist die Aenderung nicht angekommen.
 *
 * Ueber den INHALT und nicht ueber die Suite-Historie, und das mit Absicht:
 * die erste Fassung merkte sich zusaetzlich einen `suiteSha` und fragte, ob
 * die Suite ihre Kopie seither angefasst hat. Das faellt beim Squash-Merge um
 * — der aufgezeichnete Commit landet nie auf main, und ein frischer Klon
 * meldet fuer immer „nicht pruefbar". Der Inhaltsvergleich braucht nur die
 * Upstream-Historie, die beim Vendoring ohnehin dasteht.
 *
 * Bewusst tolerant: gemeldet wird nur, wenn ALLE hinzugefuegten Zeilen
 * fehlen. Eine teilweise uebernommene Aenderung faengt er nicht — er soll den
 * uebersprungenen Commit finden, nicht den halben Merge bewerten. Und er ist
 * kein Beweis: eine Aenderung kann bewusst draussengeblieben sein.
 */
/**
 * Zeilen, die fuer sich nichts aussagen: Kommentar-Marker, schliessende
 * Klammern, Kommata. Sie stehen in fast jeder Datei irgendwo, also findet die
 * Suite-Kopie sie immer — und die Regel „ALLE neuen Zeilen fehlen" waere
 * damit nie erfuellt. Genau daran ist librarySync.ts beim Gegentest
 * durchgerutscht: 13 neue Zeilen, 11 fehlten, die zwei anderen waren `//`.
 */
const isTrivialLine = (l) => /^(\/\/|\/\*+|\*+\/?|[{}()[\];,]+)$/.test(l)

/**
 * Zeilenbeutel ueber die GANZE Suite-Kopie einer App (alle `TRACKED`-Wurzeln),
 * gecacht. Braucht die Verlagerungs-Erkennung unten.
 */
const appBagCache = new Map()
function appLineBag(app) {
  const hit = appBagCache.get(app)
  if (hit) return hit
  const bag = new Map()
  for (const root of ROOTS) {
    const dir = join(ROOT, 'apps', app, root)
    if (!existsSync(dir)) continue
    for (const f of walk(dir)) {
      for (const [line, n] of lineBag(join(dir, f))) bag.set(line, (bag.get(line) ?? 0) + n)
    }
  }
  for (const f of ROOT_FILES) {
    const p = join(ROOT, 'apps', app, f)
    if (existsSync(p)) for (const [line, n] of lineBag(p)) bag.set(line, (bag.get(line) ?? 0) + n)
  }
  appBagCache.set(app, bag)
  return bag
}

function uncarried(app, baseUpstreamSha) {
  if (!baseUpstreamSha) return { unknown: 'Baseline ohne upstreamSha' }
  const upDir = join(upstreamRoot, app)
  const upChanged = changedSince(upDir, baseUpstreamSha, TRACKED)
  if (upChanged === null) return { unknown: `Upstream-Stand ${baseUpstreamSha} lokal nicht bekannt` }
  const replaced = new Set(REPLACED_BY_PACKAGE[app] ?? [])
  const files = []
  const verlagert = []
  for (const f of upChanged) {
    // `src/x` -> `x`, damit REPLACED_BY_PACKAGE dieselbe Form sieht wie sonst.
    const bare = f.startsWith('src/') ? f.slice(4) : f
    if (replaced.has(bare)) continue
    const suiteFile = join(ROOT, 'apps', app, f)
    // Datei fehlt der Suite ganz — das steht schon als `only-upstream` oben.
    if (!existsSync(suiteFile)) continue
    const now = blobAt(upDir, 'HEAD', f)
    if (now === null) continue // upstream geloescht
    const before = blobAt(upDir, baseUpstreamSha, f)
    const added = excessLines(lineBagOf(now), lineBagOf(before ?? ''))
      .filter((l) => !isTrivialLine(l))
    if (!added.length) continue // reine Loeschung / Whitespace / nur Klammern
    const suiteBag = lineBag(suiteFile)
    const nowBag = lineBagOf(now)
    // ZAEHLEND vergleichen, nicht nur "kommt vor". Die erste Fassung fragte
    // `suiteBag.has(l)` -- und uebersah damit die haeufigste Form eines
    // nachgezogenen Fixes: das DUPLIZIEREN eines Blocks, den die Suite-Kopie
    // an anderer Stelle schon einmal hat.
    //
    // Gemessen an `light#56`: der ADR-005-Fix kopiert drei Zeilen vom Datei-
    // in den Geraete-Speicherpfad. Upstream stehen sie danach zweimal, in der
    // Suite weiterhin einmal. `has()` sagte "vorhanden", also galt die
    // Aenderung als teilweise getragen -- und `missing.length === added.length`
    // war nie erfuellt. Der Bericht schwieg, waehrend der Datenverlust in der
    // Suite-Kopie weiterbestand.
    //
    // Eine Zeile gilt als getragen, wenn die Suite MINDESTENS so viele Kopien
    // hat wie upstream jetzt. Fuer alles, was vorher schon gemeldet wurde,
    // aendert sich dadurch nichts (Suite 0 < upstream >=1 bleibt "fehlt").
    const missing = added.filter((l) => (suiteBag.get(l) ?? 0) < (nowBag.get(l) ?? 0))
    if (missing.length !== added.length) continue

    // VERLAGERT STATT FEHLEND. Der Vergleich oben sieht nur DIESELBE Datei.
    // Traegt die Suite-Kopie denselben Inhalt in einer anderen Datei, meldete
    // er ihn trotzdem als fehlend -- und diese Meldung liesse sich nie
    // ausraeumen, weil sie nichts beschreibt, was man nachziehen koennte.
    //
    // Gemessener Fall (suite#71): light#59 haengt 33 englische Schluessel an
    // das Inline-Woerterbuch in `src/i18n/index.ts`. Die Suite-Kopie hat das
    // Woerterbuch laengst in Teildicts unter `src/i18n/en/` zerlegt; die
    // Schluessel stehen dort, `index.ts` komponiert nur noch. Inhaltlich
    // getragen, textuell in einer anderen Datei.
    //
    // Bewusst streng: als verlagert gilt nur, was JEDE hinzugefuegte Zeile
    // woanders in der Kopie wiederfindet, mit derselben Zaehlung wie oben.
    // Fehlt auch nur eine, bleibt es eine offene, blockierende Meldung --
    // eine halb getragene Aenderung ist keine Ablage-Frage.
    const appBag = appLineBag(app)
    const fehltGanz = added.filter((l) => (appBag.get(l) ?? 0) < (nowBag.get(l) ?? 0))
    if (fehltGanz.length === 0) { verlagert.push({ file: f, addedLines: added.length }); continue }
    // Teilweise verlagert: die Meldung bleibt offen, nennt aber beide Zahlen.
    // „52 neue Zeilen fehlen", wenn 34 davon in der Kopie stehen, ist eine
    // Uebertreibung -- und eine Meldung, der man ihre Zahl nicht glaubt,
    // liest beim naechsten Mal niemand mehr nach.
    files.push({ file: f, addedLines: added.length, missingLines: fehltGanz.length, beispiele: fehltGanz })
  }
  return { files, verlagert }
}

function analyseApp(app) {
  // Upstream gilt als vorhanden, sobald mindestens `src` da ist.
  if (!existsSync(join(upstreamRoot, app, 'src'))) return { app, missingUpstream: true, findings: [] }

  const replaced = new Set(REPLACED_BY_PACKAGE[app] ?? [])
  const dead = new Set(DEAD_UPSTREAM[app] ?? [])
  const overlay = new Set(SUITE_OVERLAY[app] ?? [])
  const findings = []

  for (const root of ROOTS) {
    const suiteDir = join(ROOT, 'apps', app, root)
    const upDir = join(upstreamRoot, app, root)
    if (!existsSync(suiteDir) && !existsSync(upDir)) continue

    const suiteFiles = new Set(walk(suiteDir))
    const upFiles = new Set(walk(upDir))
    // Pfade tragen die Wurzel, damit src/x und tests/x unterscheidbar bleiben.
    const label = (f) => (root === 'src' ? f : `${root}/${f}`)

    // Die Ausnahmelisten wurden fuer die Wurzel `src` geschrieben und tragen
    // deshalb keinen Praefix. Mit mehreren Wurzeln waere ein nackter Name
    // mehrdeutig (zwei Wurzeln koennen denselben Basisnamen haben), also
    // akzeptieren wir beide Schreibweisen: alt ohne, neu mit Wurzel.
    const istAusnahme = (menge, f) => menge.has(f) || menge.has(label(f))

    for (const f of upFiles) {
      if (!suiteFiles.has(f)) {
        const kind = istAusnahme(replaced, f)
          ? 'expected-overlay'
          : istAusnahme(dead, f)
            ? 'dead-upstream'
            : 'only-upstream'
        findings.push({ file: label(f), kind })
        continue
      }
      const c = classify(join(suiteDir, f), join(upDir, f))
      if (c) findings.push({ file: label(f), ...c })
    }
    for (const f of suiteFiles) {
      if (upFiles.has(f)) continue
      // Bewusstes Overlay der Suite (Shell, Lexware, i18n) — kein Drift.
      findings.push({ file: label(f), kind: overlay.has(label(f)) ? 'expected-overlay' : 'only-suite' })
    }
  }

  // Einzeldateien in der App-Wurzel (siehe ROOT_FILES) — gleiche Einstufung,
  // nur ohne walk().
  for (const f of ROOT_FILES) {
    const suiteFile = join(ROOT, 'apps', app, f)
    const upFile = join(upstreamRoot, app, f)
    const hasSuite = existsSync(suiteFile)
    const hasUp = existsSync(upFile)
    if (!hasSuite && !hasUp) continue
    if (!hasSuite) {
      findings.push({ file: f, kind: dead.has(f) ? 'dead-upstream' : 'only-upstream' })
      continue
    }
    if (!hasUp) {
      findings.push({ file: f, kind: overlay.has(f) ? 'expected-overlay' : 'only-suite' })
      continue
    }
    const c = classify(suiteFile, upFile)
    if (c) findings.push({ file: f, ...c })
  }

  return { app, findings }
}

const KINDS = ['only-upstream', 'only-suite', 'two-way', 'upstream-ahead', 'suite-ahead', 'expected-overlay', 'dead-upstream']
const results = APPS.map(analyseApp)

const summary = {}
for (const r of results) {
  const counts = Object.fromEntries(KINDS.map((k) => [k, 0]))
  for (const f of r.findings) counts[f.kind]++
  // expected-overlay ist gewollt und zaehlt nicht als Drift.
  const drift = r.findings.length - counts['expected-overlay'] - counts['dead-upstream']
  summary[r.app] = {
    ...counts, drift, total: r.findings.length,
    missingUpstream: !!r.missingUpstream,
    upstreamSha: r.missingUpstream ? null : upstreamSha(r.app),
  }
}

// Welche Upstream-Aenderungen seit der Baseline hier noch nicht angekommen
// sind. Braucht die Baseline, deshalb erst hier und nur wenn es eine gibt.
const baselineForUncarried = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, 'utf8'))
  : null
const uncarriedByApp = {}
for (const app of APPS) {
  if (summary[app].missingUpstream || !baselineForUncarried?.[app]) continue
  uncarriedByApp[app] = uncarried(app, baselineForUncarried[app].upstreamSha)
}

// ---------- Bericht ----------
const lines = ['# Planner drift report', '']
lines.push('Divergence between the suite\'s vendored `apps/*` copies and the standalone upstream repos.')
lines.push('Classification compares line multisets and is triage, not a merge. See the header of')
lines.push('`scripts/planner-drift.mjs`.', '')
lines.push('`expected-overlay` is the deliberate `@avplan/*` replacement and `dead-upstream` is', '')
lines.push('code nothing imports upstream. Neither counts as drift.', '')
// Ohne Stand ist eine Zahlentabelle nicht von einer drei Monate alten zu
// unterscheiden. Genau so sind vier Dokumente mit vier Drift-Staenden entstanden.
lines.push('Generated by `npm run drift:report`. Upstream state at generation time:', '')
for (const app of APPS) {
  const sha = summary[app].missingUpstream ? 'upstream checkout not found' : upstreamSha(app)
  lines.push(`- \`${app}\` @ ${sha}`)
}
lines.push('')
lines.push('The authoritative current numbers live in `scripts/planner-drift-baseline.json`,')
lines.push('which CI maintains. Do not copy them into prose — that is how they go stale.', '')
lines.push('| App | drift | only-upstream | only-suite | two-way | upstream-ahead | suite-ahead | expected-overlay | dead-upstream |')
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |')
for (const app of APPS) {
  const s = summary[app]
  if (s.missingUpstream) { lines.push(`| ${app} | upstream checkout not found | | | | | | | |`); continue }
  lines.push(`| ${app} | ${s.drift} | ${s['only-upstream']} | ${s['only-suite']} | ${s['two-way']} | ${s['upstream-ahead']} | ${s['suite-ahead']} | ${s['expected-overlay']} | ${s['dead-upstream']} |`)
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

lines.push('', '## Suite-only — nicht nach upstream uebernommen (suite-ahead)', '')
lines.push('Dateien, in denen die Suite Zeilen hat und upstream KEINE fehlen -- die')
lines.push('Kopie ist also strikt weiter. Die Kennzahl `suite-ahead` in der Tabelle')
lines.push('oben zaehlt sie seit jeher, benannt hat sie niemand. Genau deshalb ist')
lines.push('diese Liste nie jemand durchgegangen.')
lines.push('')
lines.push('**Das ist eine Vorlage, kein Urteil.** Der grosse Teil davon ist bewusste')
lines.push('Ueberlagerung: `@avplan/*`-Importe, Shell-Einbettung, Theme, Web statt')
lines.push('Electron. Gemessen waren das 41 von 50 untersuchten Dateien. Die Frage,')
lines.push('die hier gestellt wird, ist nur: *hat jemand draufgeschaut?*')
lines.push('')
lines.push('Warum es zaehlt: in Suite-PR #1 wurde ein nativer Dialog in `CollabPanel`')
lines.push('ersetzt, upstream bekam den Fix nie -- und der abgehakte Punkt 41 in')
lines.push('`docs/ux-audit.md` war damit fuer den Suite-Code richtig und fuer den')
lines.push('cable-Code falsch. Dieselbe Datei, in beide Repos vendort.')
lines.push('')
let anySuiteAhead = false
for (const r of results) {
  const sa = r.findings
    .filter((f) => f.kind === 'suite-ahead')
    .sort((a, b) => b.suiteOnly - a.suiteOnly)
  if (!sa.length) continue
  anySuiteAhead = true
  lines.push(`### ${r.app}`, '', '| File | lines only in suite |', '| --- | --- |')
  for (const f of sa) lines.push(`| \`${f.file}\` | ${f.suiteOnly} |`)
  lines.push('')
}
if (!anySuiteAhead) lines.push('None.', '')

lines.push('## Upstream changes not yet carried over', '')
lines.push('Lines upstream ADDED since the baseline `upstreamSha` that are missing from the')
lines.push('suite copy entirely. Not proof of a loss — a change may have been left out on')
lines.push('purpose — but this is the list to walk when vendoring. The drift counts above')
lines.push('cannot show it: a file that is already `two-way` stays `two-way` either way,')
lines.push('which is how a skipped vendoring commit slipped through once.', '')
let anyUncarried = false
for (const app of APPS) {
  const u = uncarriedByApp[app]
  if (!u) continue
  if (u.unknown) { lines.push(`- **${app}**: not checked — ${u.unknown}`); anyUncarried = true; continue }
  if (!u.files.length && !u.verlagert.length) continue
  if (u.files.length) anyUncarried = true
  lines.push(`### ${app}`, '')
  for (const f of u.files) {
    const rest = f.addedLines - f.missingLines
    lines.push(
      `- \`${f.file}\` — ${f.missingLines} von ${f.addedLines} neuen Zeile(n) fehlen` +
      (rest ? ` (${rest} in einer anderen Datei der Kopie)` : ''),
    )
    // Die Zeilen SELBST, nicht nur ihre Zahl. Ob eine Meldung eine bewusste
    // Abweichung oder ein uebersprungener Commit ist, entscheidet ihr
    // Inhalt -- und wer das ohne sie beurteilen will, schreibt sich dasselbe
    // Skript noch einmal.
    for (const l of f.beispiele.slice(0, 8)) lines.push(`  - \`${l.replace(/`/g, "'")}\``)
    if (f.beispiele.length > 8) lines.push(`  - … ${f.beispiele.length - 8} weitere`)
  }
  // Getragen, nur woanders abgelegt. Steht hier, damit die Zeile nicht
  // spurlos verschwindet — offen ist sie nicht.
  for (const f of u.verlagert) {
    lines.push(`- \`${f.file}\` — ${f.addedLines} neue Zeile(n) **verlagert** (in der Kopie in einer anderen Datei)`)
  }
  lines.push('')
}
if (!anyUncarried) lines.push('None.', '')

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
  // Die Baseline haelt zwei Dinge fest: die Drift-Zahlen UND den
  // `upstreamSha`, gegen den die „uncarried"-Liste gerechnet wird. Das
  // Schreiben zieht beide nach — und genau das ist die Falle: es setzt den
  // Sha vor, wodurch die Liste dessen, was upstream geaendert und in der
  // Kopie nicht angekommen ist, auf leer zurueckfaellt. Die Zeilen fehlen
  // danach immer noch, nur meldet sie niemand mehr.
  //
  // Das ist keine Theorie. Die Regel „erst `--check`, dann
  // `--write-baseline`" ist heute genau deshalb entstanden: in der falschen
  // Reihenfolge vergleicht der Check die Baseline mit sich selbst und meldet
  // beruhigend „unveraendert", waehrend die Drift sich bewegt hat.
  //
  // Eine Regel im Kopf des Bedieners ist der schwaechste Schutz, den es
  // gibt. Ab hier weigert sich das Werkzeug selbst.
  const offen = APPS.map((app) => [app, uncarriedByApp[app]])
    .filter(([, u]) => u && !u.unknown && u.files.length > 0)
  if (offen.length > 0 && !has('force')) {
    console.error(
      '\nBaseline NICHT geschrieben — es liegen nicht uebernommene ' +
      'Upstream-Aenderungen vor:\n',
    )
    for (const [app, u] of offen) {
      console.error(`  ${app}:`)
      for (const f of u.files) console.error(`    ${f.file} (${f.missingLines} von ${f.addedLines} Zeilen)`)
    }
    console.error(
      '\nWuerde die Baseline jetzt geschrieben, ruecke der `upstreamSha` vor und\n' +
      'diese Liste faellt auf leer — die Zeilen fehlten weiter, nur meldet sie\n' +
      'niemand mehr. Entweder die Aenderungen vendorn, oder bewusst begraben\n' +
      'mit --force.\n',
    )
    process.exit(1)
  }
  if (offen.length > 0) {
    console.log('--force: die folgenden Upstream-Aenderungen werden begraben:');
    for (const [app, u] of offen) {
      for (const f of u.files) console.log(`  ${app}: ${f.file} (${f.missingLines} von ${f.addedLines} Zeilen)`)
    }
  }
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
  // Im check-Modus wird der Bericht nicht gedruckt — diese Liste aber schon.
  // Sie ist der Grund, warum es sie gibt: sie soll beim Nachziehen gelesen
  // werden, und nachgezogen wird nach einem `--check`.
  for (const app of APPS) {
    const u = uncarriedByApp[app]
    if (!u) continue
    if (u.unknown) { console.log(`? ${app}: Upstream-Aenderungen nicht pruefbar — ${u.unknown}`); continue }
    if (u.verlagert.length) {
      console.log(
        `= ${app}: ${u.verlagert.length} Datei(en) verlagert — die neuen Zeilen stehen in ` +
        `der Kopie in einer anderen Datei:\n    ` +
        u.verlagert.map((f) => `${f.file} (${f.addedLines})`).join('\n    '),
      )
    }
    if (!u.files.length) continue
    console.log(
      `! ${app}: ${u.files.length} Datei(en) hat upstream seit der Baseline geaendert, ` +
      `deren neue Zeilen in der Suite-Kopie fehlen:\n    ` +
      u.files.map((f) => `${f.file} (${f.missingLines} von ${f.addedLines})`).join('\n    '),
    )
  }
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
