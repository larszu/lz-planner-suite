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
import { dirname, join, relative, resolve, sep } from 'node:path'
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

const nodeModules = join(ROOT, 'node_modules')
const alleNativen = produktionsBaum().flatMap((verzeichnis) =>
  nodeDateien(verzeichnis).map((pfad) => {
    const rel = relative(nodeModules, pfad)
    return { pfad: rel.split(sep).join('/'), segmente: rel.split(sep) }
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
      'eigenem Dateinamen.',
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
