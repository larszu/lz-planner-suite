#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Der Release-Lauf erzeugt fuer jede Plattform ein Artefakt -- und zwar jedes.
//
// WARUM ES DAS GIBT. Der Tag `v0.1.0` (Lauf 33970319571, 2026-09-05) hat
// nichts ans Release gehaengt. Zwei getrennte Fehler in einem Lauf:
//
//  1. Der macOS-Job brach beim Verschmelzen der beiden Teil-Builds ab:
//
//       Detected file ".../@julusian/freetype2/prebuilds/
//       freetype2-darwin-arm64/node-napi-v7.node" that's the same in both
//       x64 and arm64 builds and not covered by the x64ArchFiles rule
//
//     `@julusian/freetype2` baut nichts, es liefert fertige Binaries aus --
//     ein Verzeichnis je Plattform+Arch unter `prebuilds/`, zur Laufzeit
//     ausgewaehlt von `pkg-prebuilds/bindings.js` ueber `os.arch()`. Beide
//     Teil-Builds tragen deshalb denselben vollstaendigen Baum, Byte fuer
//     Byte gleich, und `@electron/universal` verlangt fuer eine in beiden
//     Builds identische Mach-O-Datei eine ausdrueckliche Ansage.
//     Weil `release` auf `needs: build` steht, riss dieser Abbruch die
//     laengst fertige Windows-.exe mit ins Nichts.
//
//  2. NSIS und Portable erbten denselben `artifactName` und schrieben beide
//     nach „AV Planner Suite-0.1.0-x64.exe". Im Log steht es woertlich, und
//     `ls release/` zeigt danach EINE .exe: der Portable-Build hat den
//     Installer ueberschrieben. Kein Fehler, keine Warnung.
//
// Beide Fehler haben dieselbe Form wie alles andere, was diese Sitzung
// gefunden hat: gebaut, aber nicht ausgeliefert. Und beide sind vor dem
// Bauen entscheidbar -- also entscheidet dieser Lauf sie, statt auf den
// naechsten Tag zu warten.
//
// WIE ER PRUEFT.
//
// Teil 1 laeuft in BEIDE Richtungen, und das ist der Punkt: jede per Pfad
// ausgewaehlte darwin-Prebuild-Datei im Produktions-Baum MUSS von
// `mac.x64ArchFiles` gedeckt sein, und jede pro Arch NEU GEBAUTE Datei
// (keytar & Co. unter `build/Release/`) darf es NICHT sein. Der bequemste Weg,
// Fehler 1 loszuwerden, ist `x64ArchFiles: '**/*.node'` -- der Build wird
// gruen, und die Universal-App traegt dann in beiden Architekturen die
// x64-Variante von keytar. Das faellt nicht beim Bauen auf, sondern auf einem
// Apple-Silicon-Rechner beim ersten Schluesselbund-Zugriff.
// Verglichen wird mit `minimatch` und denselben Optionen, die
// `@electron/universal` benutzt -- eine nachgebaute Pfadlogik wuerde raten.
//
// Teil 2 loest die Artefaktnamen so auf, wie electron-builder es tut
// (Ziel-Block schlaegt Plattform-Block, Makros eingesetzt, Endung vom Ziel)
// und verlangt, dass alle Namen einer Plattform verschieden sind. Gezaehlt
// wird ueber die Ziele in der Konfiguration, nicht ueber eine Liste hier.
//
// WAS ER NICHT PRUEFT: ob `lipo` die zusammengefuegten Binaries akzeptiert
// und ob die Datei am Ende wirklich am Release haengt. Das erste braucht
// einen macOS-Runner, das zweite entscheidet der Workflow.
// ───────────────────────────────────────────────────────────────────────────
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { minimatch } from 'minimatch'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SHELL = join(ROOT, 'apps', 'shell')

const maengel = []

const konfiguration = (await import(join(SHELL, 'electron-builder.js'))).default

// ── Teil 1: laesst sich der Universal-Build zusammenfuegen? ────────────────

/** So heisst die Datei spaeter IM Paket -- genau diesen Pfad sieht der Merge. */
const imPaket = (relativZuNodeModules) =>
  ['Contents', 'Resources', 'app.asar.unpacked', 'node_modules', relativZuNodeModules].join('/')

/** node-Aufloesung von Hand: von `start` aus die `node_modules` hochlaufen. */
const paketVerzeichnis = (name, start) => {
  let verzeichnis = start
  for (;;) {
    const kandidat = join(verzeichnis, 'node_modules', name)
    if (existsSync(join(kandidat, 'package.json'))) return kandidat
    const oben = dirname(verzeichnis)
    if (oben === verzeichnis) return null
    verzeichnis = oben
  }
}

/**
 * Der Baum, den electron-builder verpackt: `dependencies` transitiv,
 * `devDependencies` NICHT. Ein Prebuild-Paket, das nur ein Build-Werkzeug
 * mitbringt, landet nie im Installer und darf den Guard nicht beschaeftigen.
 */
const produktionsBaum = () => {
  const wurzel = JSON.parse(readFileSync(join(SHELL, 'package.json'), 'utf8'))
  const gesehen = new Set()
  const treffer = []
  const offen = Object.keys(wurzel.dependencies ?? {}).map((n) => ({ name: n, von: SHELL }))
  while (offen.length > 0) {
    const { name, von } = offen.pop()
    const verzeichnis = paketVerzeichnis(name, von)
    if (!verzeichnis || gesehen.has(verzeichnis)) continue
    gesehen.add(verzeichnis)
    treffer.push(verzeichnis)
    const pj = JSON.parse(readFileSync(join(verzeichnis, 'package.json'), 'utf8'))
    for (const kind of Object.keys(pj.dependencies ?? {})) offen.push({ name: kind, von: verzeichnis })
  }
  return treffer
}

const nodeDateien = (verzeichnis) => {
  const treffer = []
  const lauf = (d) => {
    for (const eintrag of readdirSync(d)) {
      if (eintrag === 'node_modules') continue
      const pfad = join(d, eintrag)
      if (statSync(pfad).isDirectory()) lauf(pfad)
      else if (eintrag.endsWith('.node')) treffer.push(pfad)
    }
  }
  lauf(verzeichnis)
  return treffer
}

/**
 * Per Pfad ausgewaehlt heisst: ein `prebuilds`-Segment, und irgendein Segment
 * darunter nennt die Plattform. Solche Dateien sind in beiden Teil-Builds
 * identisch, weil nichts sie neu baut.
 */
const istPfadPrebuild = (segmente) =>
  segmente.includes('prebuilds') &&
  segmente.some((s, i) => i > segmente.indexOf('prebuilds') && /darwin|win32|linux/.test(s))

/**
 * Der Pfad ab dem LETZTEN `node_modules`-Segment -- genau so adressiert
 * electron-builder die Datei im Paket.
 *
 * Nicht `relative(<wurzel>/node_modules, …)`: das setzt voraus, dass die
 * Abhaengigkeiten direkt neben der `package.json` liegen. Im Workspace sind
 * sie gehoistet, und bei einer nicht gehoisteten (verschachtelten)
 * Installation stimmt die Annahme ebenfalls nicht. Genau daran ist der
 * Zwilling dieses Laufs in `apps/cable-planner/tests/macUniversalBuild.test.ts`
 * beim ersten Lauf nach dem Vendoring gescheitert (2026-09-05).
 */
const imBaum = (pfad) => {
  const teile = pfad.split(sep)
  return teile.slice(teile.lastIndexOf('node_modules') + 1)
}

const alleNativen = produktionsBaum().flatMap((verzeichnis) =>
  nodeDateien(verzeichnis).map((pfad) => {
    const segmente = imBaum(pfad)
    return { pfad: segmente.join('/'), segmente }
  }),
)

const muster = konfiguration.mac?.x64ArchFiles
const gedeckt = (f) => Boolean(muster) && minimatch(imPaket(f.pfad), muster, { matchBase: true })

const darwinPrebuilds = alleNativen.filter(
  (f) => istPfadPrebuild(f.segmente) && f.segmente.some((s) => s.includes('darwin')),
)
const proArchGebaut = alleNativen.filter((f) => !istPfadPrebuild(f.segmente))

const macZiele = konfiguration.mac?.target ?? []
const universal = macZiele.some((z) => (typeof z === 'string' ? false : z.arch === 'universal'))

if (!universal) {
  // Die Voraussetzung dieses Teils, ausgesprochen statt stillschweigend
  // angenommen: nur beim Universal-Build laeuft der Merge, um den es geht.
  maengel.push(
    'apps/shell/electron-builder.js hat kein Universal-Ziel mehr unter `mac.target`. ' +
      'Wenn das Absicht ist, gehoert dieser Teil des Guards angepasst -- ein stilles ' +
      'Ueberspringen waere genau der Fehler, gegen den er gebaut ist.',
  )
}

// Ein leerer Suchlauf waere gruen und wertlos.
if (alleNativen.length === 0) {
  maengel.push('Keine .node-Dateien im Produktions-Baum von apps/shell gefunden -- lief `npm install`?')
} else if (darwinPrebuilds.length === 0) {
  maengel.push(
    'Keine per Pfad ausgewaehlten darwin-Prebuilds gefunden. Entweder liefert kein Paket ' +
      'mehr welche aus (dann darf dieser Teil weg) oder der Suchlauf greift daneben.',
  )
}

for (const f of darwinPrebuilds.filter((f) => !gedeckt(f))) {
  maengel.push(
    `${f.pfad} ist in beiden Teil-Builds identisch und von mac.x64ArchFiles nicht gedeckt ` +
      `(Muster: ${JSON.stringify(muster)}). @electron/universal bricht daran ab -- und weil ` +
      'der release-Job auf needs: build steht, faellt damit auch das Windows-Artefakt aus.',
  )
}

for (const f of proArchGebaut.filter((f) => gedeckt(f))) {
  maengel.push(
    `${f.pfad} baut @electron/rebuild pro Architektur neu und MUSS von lipo zusammengefuehrt ` +
      'werden. mac.x64ArchFiles deckt es ab -- dann behaelt der Merge die x64-Variante fuer ' +
      'beide Architekturen, und das faellt erst auf einem Apple-Silicon-Rechner auf.',
  )
}

// ── Teil 1b: laesst sich der ASAR-Merge ueberhaupt aufrufen? ───────────────

/**
 * minimatch lehnt Muster ueber 64 KiB ab (`MAX_PATTERN_LENGTH = 1024 * 64`).
 * Genau dagegen laeuft `mergeASARs`: es baut fuer ALLE entpackten Dateien EIN
 * Glob -- `{pfad1,pfad2,…}` mit absoluten Pfaden -- und gibt es an minimatch.
 * Daran ist `v0.1.1` gestorben.
 */
const MUSTER_GRENZE = 1024 * 64

/**
 * Das Praefix, das `mergeASARs` den Pfaden voranstellt:
 * `fs.mkdtemp(path.join(os.tmpdir(), 'x64-'))`. Auf einem macOS-Runner ist
 * `os.tmpdir()` ein `/var/folders/…`-Pfad; hier steht ein typischer, damit die
 * Rechnung nicht vom lokalen `/tmp` abhaengt.
 */
const TEMP_PRAEFIX = '/var/folders/6t/1lqm9rgn7wl4b6q0d5x3z9_c0000gn/T/x64-AbCdEf/'

/**
 * Was electron-builder entpackt, OHNE dass es jemand hinschreibt: sobald eine
 * Datei eines Moduls eine Bibliothek oder ausfuehrbar ist, wandert das GANZE
 * Modulverzeichnis aus dem Archiv --
 * `unpackDetector.detectUnpackedDirs` -> `autoUnpackDirs.add(moduleRootPath)`.
 *
 * Das Ergebnis ist eine UNTERGRENZE: die 157 Dateien aus `planners/**` kommen
 * noch obendrauf, existieren aber erst nach `build:planners` und damit nicht
 * beim CI-Lauf dieses Guards. Fuer eine Untergrenze reicht das -- wer sie
 * schon reisst, reisst auch die echte Zahl.
 */
const istLibOderExe = (datei) => /\.(dll|exe|dylib|so|node)$/.test(datei)

const entpackteDateien = () => {
  const treffer = []
  for (const verzeichnis of produktionsBaum()) {
    const alle = []
    const lauf = (d) => {
      for (const eintrag of readdirSync(d)) {
        const pfad = join(d, eintrag)
        if (statSync(pfad).isDirectory()) {
          if (eintrag !== 'node_modules') lauf(pfad)
        } else alle.push(pfad)
      }
    }
    lauf(verzeichnis)
    if (alle.some(istLibOderExe)) treffer.push(...alle.map((p) => imBaum(p).join('/')))
  }
  return treffer
}

const entpackt = entpackteDateien()
const musterLaenge = `{${entpackt.map((d) => TEMP_PRAEFIX + d).join(',')}}`.length

if (entpackt.length === 0) {
  maengel.push('Keine entpackten Dateien gefunden -- lief `npm install`?')
} else if (musterLaenge >= MUSTER_GRENZE && konfiguration.mac?.mergeASARs !== false) {
  // Nicht "weniger entpacken" verlangen -- das ist nicht steuerbar, die
  // Dateien kommen aus der automatischen Native-Erkennung. Sondern: wenn das
  // Muster zu lang WIRD, muss mergeASARs aus sein. Wird freetype2 eines Tages
  // schlanker, faellt die Forderung von selbst weg.
  maengel.push(
    `Das Merge-Muster waere mindestens ${musterLaenge} Zeichen lang (${entpackt.length} entpackte ` +
      `Dateien), minimatch riegelt bei ${MUSTER_GRENZE} ab. mac.mergeASARs MUSS deshalb false ` +
      'bleiben, sonst bricht der Universal-Build mit "pattern is too long" ab -- und weil der ' +
      'release-Job auf needs: build steht, faellt dann auch das Windows-Artefakt aus.',
  )
}

// ── Teil 1c: bringt die verpackte package.json den Einsprung-Shim um? ──────

// Die DRITTE Stufe, an der der Universal-Build reisst -- und sie entsteht erst
// durch `mergeASARs: false`. Gemessen an der ausgelieferten App `v0.1.1`:
//
//   ReferenceError: exports is not defined in ES module scope
//   ... app.asar/package.json contains "type": "module"
//   at app.asar/index.js:5:23
//
// `index.js` ist nicht unser Code: `@electron/universal` legt bei
// `mergeASARs: false` einen CommonJS-Shim unter diesem Namen ab und daneben
// eine KOPIE unserer package.json. Sagt die `type: module`, parst Node den
// Shim als ESM und die App stirbt vor der ersten eigenen Zeile.
//
// Ab `@electron/universal@3` schreibt es in dem Fall `index.mjs`; die Forderung
// faellt dann von selbst weg, ohne dass jemand diese Datei anfassen muss.
const universalPaket = JSON.parse(
  readFileSync(join(ROOT, 'node_modules', '@electron', 'universal', 'package.json'), 'utf8'),
)
const universalMajor = Number(universalPaket.version.split('.')[0])

if (universal && konfiguration.mac?.mergeASARs === false && universalMajor < 3) {
  const shellPaket = JSON.parse(readFileSync(join(SHELL, 'package.json'), 'utf8'))
  // `extraMetadata` gewinnt ueber die package.json im Repo -- genau dafuer ist
  // es da, und genau das landet spaeter im Archiv.
  const effektiv = konfiguration.extraMetadata?.type ?? shellPaket.type
  if (effektiv === 'module') {
    maengel.push(
      `@electron/universal@${universalPaket.version} legt bei mergeASARs:false einen ` +
        'CommonJS-Shim als `index.js` neben eine Kopie der verpackten package.json. Mit ' +
        '`type: module` startet die App nicht -- "exports is not defined in ES module scope". ' +
        "Abhilfe: `extraMetadata: { type: 'commonjs' }` in apps/shell/electron-builder.js; der " +
        'ESM-Teil bekommt dann seine eigene package.json (copy-planners.mjs legt sie fuer ' +
        'planners/signal-main an).',
    )
  }
}

// ── Teil 2: schreiben zwei Ziele auf dieselbe Datei? ───────────────────────

/** Endung je Ziel -- so benennt electron-builder die Ausgabe. */
const ENDUNG = {
  nsis: 'exe',
  portable: 'exe',
  msi: 'msi',
  appx: 'appx',
  dmg: 'dmg',
  zip: 'zip',
  pkg: 'pkg',
  mas: 'pkg',
  AppImage: 'AppImage',
  deb: 'deb',
  rpm: 'rpm',
}

const einsetzen = (vorlage, ziel) =>
  vorlage
    .replaceAll('${productName}', konfiguration.productName ?? 'App')
    .replaceAll('${name}', konfiguration.productName ?? 'App')
    .replaceAll('${version}', '0.0.0')
    .replaceAll('${arch}', ziel.arch ?? 'x64')
    .replaceAll('${ext}', ENDUNG[ziel.target] ?? ziel.target)
    .replaceAll('${os}', 'os')

const zieleVon = (plattform) =>
  (konfiguration[plattform]?.target ?? []).map((z) => (typeof z === 'string' ? { target: z } : z))

const plattformen = ['win', 'mac', 'linux'].filter((p) => zieleVon(p).length > 0)

if (plattformen.length === 0) {
  maengel.push('Keine Build-Ziele in apps/shell/electron-builder.js gefunden -- greift der Suchlauf daneben?')
}

for (const plattform of plattformen) {
  const namen = zieleVon(plattform).map((ziel) => {
    // Genau die Reihenfolge, die electron-builder anwendet.
    const vorlage =
      konfiguration[ziel.target]?.artifactName ??
      konfiguration[plattform]?.artifactName ??
      konfiguration.artifactName ??
      '${productName}-${version}-${arch}.${ext}'
    return { ziel: `${plattform}/${ziel.target}/${ziel.arch ?? 'x64'}`, datei: einsetzen(vorlage, ziel) }
  })
  for (const n of namen) {
    if (namen.some((m) => m !== n && m.datei === n.datei)) {
      maengel.push(
        `${n.ziel} schreibt nach "${n.datei}" -- und ein anderes Ziel derselben Plattform ` +
          'auch. electron-builder baut beide ohne Warnung, das spaeter gebaute ueberschreibt ' +
          'das frueher gebaute. Abhilfe: eigener `artifactName` im Ziel-Block.',
      )
    }
  }
}

// ── Ergebnis ──────────────────────────────────────────────────────────────

if (maengel.length === 0) {
  console.log(
    `OK: ${darwinPrebuilds.length} darwin-Prebuild(s) gedeckt, ${proArchGebaut.length} pro Arch ` +
      `gebaute Module bleiben fuer lipo, ${plattformen.flatMap(zieleVon).length} Ziel(e) mit ` +
      `eigenem Dateinamen; Merge-Muster mind. ${musterLaenge} Zeichen bei ${entpackt.length} ` +
      `entpackten Dateien (Grenze ${MUSTER_GRENZE}, mergeASARs=${konfiguration.mac?.mergeASARs}).`,
  )
  process.exit(0)
}

console.error(`Release-Artefakte unvollstaendig: ${maengel.length} Punkt(e)\n`)
for (const m of maengel) console.error(`  ! ${m}`)
console.error(
  '\nBeides faellt beim Bauen nicht als Fehler auf, sondern erst am leeren Release --\n' +
    'oder gar nicht, weil ein halbes Release auf der Release-Seite vollstaendig aussieht.',
)
process.exit(1)
