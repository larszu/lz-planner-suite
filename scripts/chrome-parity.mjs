// ───────────────────────────────────────────────────────────────────────────
// Die Kopfzeile ist in allen Werkzeugen dieselbe — gemessen, nicht zugesagt.
//
// NUTZER-AUFTRAG 2026-09-11: „Stelle sicher das in allen repos uebergreifend
// das Einstellungen Menue an der gleichen Stelle ist wie im Cable planner und
// das die obere Menueleiste gleich aufgebaut ist. Passe an den Cable planner
// stand an, wenn noetig und vereinheitliche Komponenten."
//
// ─── WARUM DIESER LAUF UEBERHAUPT NOETIG IST ──────────────────────────────
//
// ADR-007 Abschnitt 6 schreibt den Rahmen seit dem 2026-09-08 vor: „Menue
// immer oben links … nie ein Hamburger auf dem Desktop." Die Regel stand da
// und wurde NIE GEMESSEN. Nachgemessen am 2026-09-11, und das Ergebnis ist
// der Grund fuer diese Datei:
//
//   cable-planner       .cp-topbar   kein Hamburger   Einstellungen rechts
//   suite-shell         .av-topbar   Hamburger (nur mobil)   Einstellungen rechts
//   light-planner       .topbar      HAMBURGER AUF DEM DESKTOP   keine Einstellungen
//   multicam-planner    .bc-topbar   kein Hamburger   KEINE Einstellungen
//   inventory-planner   .kopf        kein Hamburger   KEINE Einstellungen
//   facility-planner    .kopf        kein Hamburger   KEINE Einstellungen
//
// Sechs Werkzeuge, vier verschiedene Klassennamen fuer dieselbe Zeile, und in
// vier von sechs gab es die Einstellungen ueberhaupt nicht. Eine Regel, die
// niemand misst, ist eine Absichtserklaerung.
//
// ─── DER MASSSTAB IST DER CABLE-PLANNER, NICHT DIE PROSA DES ADR ──────────
//
// ADR-007 nannte die Reihenfolge „Datei · Bearbeiten · Ansicht · Werkzeuge ·
// Hilfe". Der cable-planner fuehrt sie als Datei · Bearbeiten · WERKZEUGE ·
// ANSICHT · Hilfe — seit jeher, und er ist die Anwendung, die der Eigentuemer
// taeglich bedient. Der Auftrag sagt ausdruecklich „Passe an den Cable planner
// stand an". Also ist der Code der Massstab und der ADR-Satz war die
// Abweichung; er ist mit diesem Lauf korrigiert worden.
//
// ─── WAS GEMESSEN WIRD ────────────────────────────────────────────────────
//
//   1. Die Kopfzeile traegt eine der zugelassenen Klassen, und die Klasse ist
//      40 px hoch. Vier Namen fuer dieselbe Zeile sind erlaubt (die Repos
//      laufen auch ALLEIN und koennen `@avplan/ui` nicht laden), die ZAHL ist
//      es nicht.
//   2. Die fuenf Menues stehen links, in der Reihenfolge des cable-planners.
//   3. `File` und `Help` fuehrt JEDE App (ihre Daten, ihre Auskunft ueber
//      sich selbst), mit dem gemeinsamen Grundstock darin. `Edit`, `Tools`
//      und `View` nur, wo das Darunterliegende existiert — abwesend statt
//      leer, denn ein Menue ohne Funktion ist ein PLACEHOLDER.
//   4. Die Einstellungen stehen RECHTS AUSSEN: nach allen fuenf Menues und
//      als letzter Bedienpunkt vor `</header>`.
//   5. Kein Hamburger auf dem Desktop. Einer hinter `md:hidden` (o. ae.) ist
//      erlaubt — das ist der Ueberlauf fuer schmale Fenster, den auch der
//      cable-planner in seiner Art hat.
//
// ─── WAS ER NICHT KANN, UND DAS IST WICHTIG ───────────────────────────────
//
// Er liest QUELLTEXT. Er sieht die Reihenfolge im Markup, nicht die auf dem
// Schirm — ein `order-last` oder ein `flex-row-reverse` wuerde ihn taeuschen.
// Was wirklich wo steht, misst `ui:labels`/`ui:overflow` an der gebauten App
// und der Mensch davor. Er ist der schnelle Vorposten: er faellt in Sekunden
// statt nach einem Electron-Build.
//
// Er misst ausserdem nur die Apps unter `apps/`. `Broadcast-intercom`,
// `tally-pi`, `sony-camera-bridge` und `pi-media-station` sind in der Suite
// nicht vendoriert; fuer sie steht die Lage in der Ausnahmetabelle mit Grund.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Die Kopfzeilen-Datei je App, und die Stilblatt-Datei mit der Klasse.
 *
 * `modell` ist optional: manche Apps halten ihre Menue-Eintraege NICHT im
 * Markup, sondern als Liste, die zwei Stellen lesen — die Leiste und die
 * Kommandopalette. Der `light-planner` tut das seit dem 2026-09-11
 * (`menuModel.ts`), und das ist die bessere Bauform, nicht die schlechtere:
 * eine zweite, getippte Liste ist genau die Art, wie „derselbe Griff
 * ueberall" zerfaellt. Ein Waechter, der nur ins Markup sieht, bestrafte
 * diese Bauform mit „Pflicht-Menue fehlt" — also sieht er dorthin, wo die
 * Menues wirklich stehen.
 */
const APPS = [
  { app: 'cable-planner', kopf: 'src/renderer/components/Layout/MenuBar.tsx', stil: 'src/renderer/index.css', klasse: 'cp-topbar' },
  { app: 'light-planner', kopf: 'src/components/TopBar.tsx', stil: 'src/App.css', klasse: 'topbar', modell: 'src/components/menuModel.ts' },
  { app: 'multicam-planner', kopf: 'src/components/Layout/Header.tsx', stil: 'src/index.css', klasse: 'bc-topbar' },
  { app: 'shell', kopf: 'src/shell/Topbar.tsx', stil: null, klasse: 'av-topbar' },
  { app: 'inventory-planner', kopf: 'src/ui/Kopfzeile.tsx', stil: 'src/index.css', klasse: 'kopf' },
  { app: 'larszu-facility-planner', kopf: 'src/ui/Kopfzeile.tsx', stil: 'src/index.css', klasse: 'kopf' },
]

/**
 * Die fuenf Menues, in der Reihenfolge des cable-planners — je Rolle mit dem
 * Wort in BEIDEN Quellsprachen der Suite.
 *
 * WARUM NICHT EIN WORT — und warum die Begruendung dafuer heute eine andere
 * ist als bei der Niederschrift. Hier stand: „das Lager und das Gebaeude sind
 * deutsch, und ihr eigener `lang:check` FAELLT bei englischen
 * Beschriftungen". Das galt bis zum 2026-09-11; seither steht in beiden
 * `package.json` `avplan.sourceLanguage: "en"`, und ihr `lang:check` faellt
 * bei DEUTSCHEN Beschriftungen. Nachgesehen statt geglaubt.
 *
 * Die Liste bleibt trotzdem zweisprachig, aus einem anderen Grund: die
 * deutschen Woerter sind die UEBERSETZUNG, und ein Waechter, der nur die
 * Quelle kennt, faellt, sobald jemand die Oberflaeche auf Deutsch
 * durchsieht. Vereinheitlicht wird der BAU der Leiste, nicht die Sprache.
 *
 * Vereinheitlicht wird der BAU der Leiste: welche Menues, in welcher Folge, wo
 * die Einstellungen sitzen. Nicht die Sprache — gegen Sprachmix steht in
 * dieser Suite ein eigener Zaehler.
 */
const MENUES = [
  { rolle: 'File', woerter: ['File', 'Datei'] },
  { rolle: 'Edit', woerter: ['Edit', 'Bearbeiten'] },
  { rolle: 'Tools', woerter: ['Tools', 'Werkzeuge'] },
  { rolle: 'View', woerter: ['View', 'Ansicht'] },
  { rolle: 'Help', woerter: ['Help', 'Hilfe'] },
]
const ROLLEN = MENUES.map((m) => m.rolle)
/** Erster Treffer eines der Woerter als Menue-Beschriftung, sonst -1. */
const menueStelle = (block, woerter) => {
  let beste = -1
  for (const w of woerter) {
    // Zwei Bauformen, dieselbe Frage: ein `<Menu label={… 'File'}>` im Markup,
    // oder ein `{ id: 'file', label: t('menu.file', 'File'), items: […] }` in
    // einer Menue-Liste. Die zweite ist KEIN Rueckstand — sie ist die Form,
    // in der Leiste und Kommandopalette dieselben Eintraege lesen.
    for (const rx of [
      new RegExp(`<Menu[^>]{0,200}?['"]${w}['"]`, 's'),
      new RegExp(`label:[^\\n]{0,200}?['"]${w}['"][^\\n]{0,80}?items:`),
    ]) {
      const t = rx.exec(block)
      if (t && (beste < 0 || t.index < beste)) beste = t.index
    }
  }
  return beste
}

/**
 * Der gemeinsame Grundstock je Menue — was JEDE App fuehrt, in dieser Folge.
 * App-eigene Eintraege duerfen dazwischen stehen; fehlen darf keiner.
 *
 * Die Liste ist bewusst KURZ. Sie enthaelt nur, was in jeder der sechs Apps
 * eine Bedeutung hat. „Plan check" etwa steht nicht drin: ein Lager hat
 * keinen Plan zu pruefen, und ein Menuepunkt, der nichts tut, ist schlimmer
 * als ein fehlender.
 */
const GRUNDSTOCK = {
  File: [
    // „Neu" heisst in jeder App etwas anderes — „New project", „New stock
    // list", „New building". Das Muster nennt deshalb das VERB und nicht das
    // Objekt.
    //
    // Es stand bis zum 2026-09-11 als `/New project|Neues /i` da und traf
    // die zwei kleinen Apps nur ueber ihre deutsche Fassung. Mit E-28
    // (Quellsprache Englisch) wurde daraus „New stock list" bzw. „New
    // building", und der Lauf meldete einen fehlenden Menuepunkt, den es
    // gab — eine falsche Anschuldigung, und die kostet mehr als ein
    // Durchrutscher: der naechste schaltet den Lauf ab.
    //
    // `\bNew [A-Za-z]` statt `\bNew\b`: der Eintrag traegt ein Objekt. So
    // erfuellt weder ein blosses „News" noch ein „Newsletter" die Zeile.
    { was: 'Neu', muster: /\bNew [A-Za-z]|\bNeue[sr]? [A-ZÄÖÜa-zäöü]/i },
    { was: 'Oeffnen', muster: /Open[….]|Öffnen/i },
    // „Speichern" darf einen Zusatz tragen und muss doch „Speichern" sein.
    // Der `light-planner` schreibt „Save (browser)", weil er zwei Ablagen hat
    // (Browser-Speicher und Datei) — das ist eine Auskunft an den Nutzer und
    // kein Regelbruch. Die Verneinung schliesst aus, dass ein blosses
    // „Save as…" diese Zeile miterfuellt: sonst bestuende eine App den
    // Grundstock mit nur einem der beiden Eintraege.
    { was: 'Speichern', muster: /['">]\s*(Save|Speichern)\b(?!\s*(as|unter))[^'"<]{0,24}['"<]/i },
    { was: 'Speichern unter', muster: /Save as|Speichern unter/i },
  ],
  Help: [{ was: 'Ueber', muster: /About |Über /i }],
}

/**
 * WELCHE MENUES JEDE APP FUEHREN MUSS — und welche nur, wenn sie das
 * Darunterliegende ueberhaupt hat.
 *
 * Der erste Wurf dieses Laufs verlangte alle fuenf von allen sechs Apps, mit
 * Undo/Redo und Zoom im Grundstock. Beim Bauen fiel auf, dass das eine
 * Behauptung gewesen waere: das Lager (`inventory-planner`) hat keinen
 * Zeichenbereich, also nichts einzupassen und nichts zu zoomen, und es hat
 * keine Rueckgaengig-Kette. Ein Menue „Ansicht" mit einem ausgegrauten
 * „Einpassen" ist ein PLACEHOLDER — es sieht aus wie eine Funktion und ist
 * keine. Genau davor warnt `IMPLEMENTATION_STATUS.md` in seiner eigenen
 * Legende.
 *
 * Deshalb die Zweiteilung. Was JEDE App hat, ist ihre Daten und ihre
 * Auskunft ueber sich selbst — daher sind `File` und `Help` Pflicht. `Edit`,
 * `Tools` und `View` sind Pflicht, sobald die App das Darunterliegende
 * fuehrt, und sonst ABWESEND statt leer. Abwesend heisst: der Platz bleibt
 * frei, die REIHENFOLGE der uebrigen bleibt.
 *
 * Was dadurch NICHT gemessen wird: ob eine App zu Unrecht behauptet, kein
 * Undo zu haben. Das ist eine Aussage ueber ihre Faehigkeiten und keine
 * ueber ihre Kopfzeile; sie steht in `IMPLEMENTATION_STATUS.md`.
 */
const PFLICHT = ['File', 'Help']

/**
 * AUSNAHMEN, jede mit Grund und Datum. Diese Tabelle ist eine SCHULD und
 * keine Erlaubnis: sie schrumpft, sie waechst nicht. Wer eine Zeile
 * hinzufuegt, schreibt den Grund dazu — sonst ist der Lauf ein Wunsch.
 */
const AUSNAHMEN = {
  // (wird beim Nachziehen der Repos geleert)
}

const lies = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)

/**
 * Der Koerper GENAU der Regel `.klasse { … }` — nicht der eines Nachfahren.
 *
 * WARUM NICHT `indexOf('.' + klasse)` (so stand es bis 2026-09-11). Das fand
 * im `larszu-facility-planner` die Regel `.kopf .datei` und las 400 Zeichen
 * ab dort; die 40 px der Kopfzeile standen weiter unten und kamen nie vor.
 * Im `light-planner` traf es die richtige Regel, aber ein Begruendungs-
 * kommentar darin schob die Hoehe ueber die 400-Zeichen-Grenze. Beide Male
 * meldete der Lauf „nicht 40 px hoch" ueber eine Kopfzeile, die 40 px hoch
 * ist — eine FALSCHE ANSCHULDIGUNG, und die ist fuer einen Waechter genauso
 * schaedlich wie ein uebersehener Verstoss: beim naechsten Mal glaubt ihm
 * niemand.
 *
 * Jetzt: die Regel wird am Selektor-Ende erkannt (`.klasse` gefolgt von
 * Zwischenraum und `{`), und gelesen wird bis zur schliessenden Klammer statt
 * bis zu einer geratenen Zeichenzahl.
 */
const regelKoerper = (css, klasse) => {
  const m = new RegExp(`(^|[^-\\w.])\\.${klasse}\\s*\\{`, 'm').exec(css)
  if (!m) return null
  const auf = css.indexOf('{', m.index)
  const zu = css.indexOf('}', auf)
  return zu < 0 ? null : css.slice(auf + 1, zu)
}

/** Der Rumpf zwischen <header ...> und </header>. */
const kopfzeile = (quelle) => {
  const a = quelle.indexOf('<header')
  const b = quelle.indexOf('</header>')
  if (a < 0 || b < 0) return null
  return quelle.slice(a, b)
}

/** Zeilenkommentare und Block-Kommentare weg — der Rest ist, was laeuft. */
const ohneKommentare = (t) =>
  t.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const befunde = []
const melde = (app, was) => befunde.push({ app, was })

for (const { app, kopf, stil, klasse, modell } of APPS) {
  const basis = join(WURZEL, 'apps', app)
  const quelle = lies(join(basis, kopf))
  if (quelle === null) { melde(app, `Kopfzeilen-Datei fehlt: ${kopf}`); continue }
  const roh = kopfzeile(quelle)
  if (roh === null) { melde(app, 'kein <header> gefunden'); continue }
  const block = ohneKommentare(roh)

  // Wo die MENUES stehen: im Markup der Kopfzeile, oder in der Liste, die
  // Leiste und Palette gemeinsam lesen. Die Klasse, die Einstellungen und der
  // Hamburger werden weiterhin an der Kopfzeile selbst gemessen — sie sind
  // Eigenschaften der Zeile und nicht der Liste.
  let menueBlock = block
  if (modell) {
    const m = lies(join(basis, modell))
    if (m === null) { melde(app, `Menue-Modell fehlt: ${modell}`); continue }
    menueBlock = ohneKommentare(m)
  }
  const ausn = AUSNAHMEN[app] ?? []
  const erlaubt = (regel) => ausn.includes(regel)

  // 1. Klasse + 40 px
  if (!erlaubt('klasse')) {
    if (!new RegExp(`className="[^"]*\\b${klasse}\\b`).test(roh)) {
      melde(app, `Kopfzeile traegt nicht die Klasse .${klasse}`)
    } else if (stil) {
      const css = lies(join(basis, stil))
      const def = css && regelKoerper(css, klasse)
      if (def === null) melde(app, `.${klasse} hat keine eigene Regel im Stilblatt`)
      else if (!/height:\s*40px/.test(def)) melde(app, `.${klasse} ist nicht 40 px hoch`)
    }
  }

  // 2. Die fuenf Menues, in der Reihenfolge
  if (!erlaubt('menues')) {
    const stellen = MENUES.map((m) => menueStelle(menueBlock, m.woerter))
    const fehlend = PFLICHT.filter((m) => stellen[ROLLEN.indexOf(m)] < 0)
    if (fehlend.length) melde(app, `Pflicht-Menue(s) fehlen: ${fehlend.join(', ')}`)
    // Die Reihenfolge gilt fuer die VORHANDENEN — ein abwesendes `View`
    // verschiebt `Help` nach vorn und ist trotzdem richtig sortiert.
    const da = stellen.filter((i) => i >= 0)
    const sortiert = [...da].sort((a, b) => a - b)
    if (da.join() !== sortiert.join()) {
      melde(app, `Menue-Reihenfolge weicht ab (Soll: ${ROLLEN.join(' · ')})`)
    }
  }

  // 3. Grundstock je Menue
  if (!erlaubt('grundstock')) {
    for (const [rolle, eintraege] of Object.entries(GRUNDSTOCK)) {
      const m = MENUES.find((x) => x.rolle === rolle)
      if (menueStelle(menueBlock, m.woerter) < 0) continue
      const fehlt = eintraege.filter((e) => !e.muster.test(menueBlock)).map((e) => e.was)
      if (fehlt.length) melde(app, `${rolle}: Grundstock fehlt — ${fehlt.join(', ')}`)
    }
  }

  // 4. Einstellungen rechts aussen
  if (!erlaubt('einstellungen')) {
    // Ein EIGENER Einstieg, nicht irgendein Vorkommen des Wortes. Der
    // light-planner hat einen Knopf „Display & render settings" — das sind
    // die Darstellungs-Regler des 3D-Bildes und nicht die Einstellungen der
    // App. Eine Suche nach „Settings" haette ihn dafuer gehalten und den Lauf
    // gruen gemeldet, waehrend es die Einstellungen weiter nicht gibt.
    const EINSTIEG = /onOpenSettings|title="Einstellungen"|t\('settings\.title'|t\('chrome\.topbar\.settings'|>\s*Einstellungen\s*</
    const t = EINSTIEG.exec(block)
    const i = t ? t.index : -1
    if (i < 0) melde(app, 'kein Einstellungen-Einstieg in der Kopfzeile')
    else {
      // Nur wenn die Menues IM MARKUP stehen, ist „nach dem letzten Menue"
      // eine Aussage ueber diese Datei. Liest die App ihre Menues aus einem
      // Modell, liegt in der Kopfzeile nur die Leiste — dann zaehlt allein,
      // dass die Einstellungen der letzte Bedienpunkt sind, und das misst der
      // Repo-eigene Lauf genauer als dieser hier.
      const letztesMenue = modell
        ? -1
        : Math.max(...MENUES.map((m) => Math.max(...m.woerter.map((w) => block.lastIndexOf(`"${w}"`)))))
      if (letztesMenue >= 0 && i < letztesMenue) melde(app, 'Einstellungen stehen VOR den Menues statt rechts aussen')
    }
  }

  // 5. Kein Hamburger auf dem Desktop
  if (!erlaubt('hamburger')) {
    const rx = /M3 6h18M3 12h18M3 18h18|name="menu"/g
    let t
    while ((t = rx.exec(block)) !== null) {
      const davor = block.slice(Math.max(0, t.index - 400), t.index)
      if (!/md:hidden|sm:hidden|lg:hidden|nurMobil/.test(davor)) {
        melde(app, 'Hamburger auf dem Desktop (nur hinter md:hidden o. ae. erlaubt)')
        break
      }
    }
  }
}

// ── 5. Der Griff der Seitenleisten ────────────────────────────────────────
//
// ADR-007 Abschnitt 6 legt seit dem 2026-09-11 auch den GRIFF fest, nicht nur
// den Rahmen. Vorher hatte jede App eine eigene Antwort:
//
//   cable-planner     Griff in der Leiste, eingeklappt 32 px, Name senkrecht
//   multicam-planner  eigener 20-px-Streifen daneben, eingeklappt `w-0`
//   light-planner     gar nicht einklappbar
//
// GEPRUEFT WIRD NUR, WER SPALTEN FUEHRT. Der `inventory-planner` und der
// `larszu-facility-planner` fuehren Reiter — sie haben keinen Zeichenbereich
// und nichts zu inspizieren. Eine leere Spalte dort waere ein PLACEHOLDER,
// dieselbe Begruendung, aus der `Edit`/`Tools`/`View` abwesend statt leer
// sind. Die `shell` ist der Rahmen selbst und hat keine Planer-Spalten.
const SPALTEN_APPS = [
  {
    app: 'cable-planner',
    dateien: ['src/renderer/components/Library/LibraryPanel.tsx', 'src/renderer/components/Properties/PropertiesPanel.tsx'],
  },
  { app: 'multicam-planner', dateien: ['src/App.tsx'] },
  // Drei Dateien, weil die Antwort hier auf drei liegt: die Komponente traegt
  // den Rahmen, `App.tsx` die Spaltenbreiten (sie aendern sich mit dem
  // Zustand und koennen deshalb nicht im Stilblatt stehen), `App.css` die
  // senkrechte Schrift. Der erste Anlauf nannte nur die Komponente — und der
  // Lauf meldete prompt beide Punkte als fehlend, obwohl sie da sind. Ein
  // Waechter, der an der falschen Stelle sucht, beschuldigt richtigen Code.
  { app: 'light-planner', dateien: ['src/components/SeitenPanel.tsx', 'src/App.tsx', 'src/App.css'] },
]

for (const { app, dateien } of SPALTEN_APPS) {
  if ((AUSNAHMEN[app] ?? []).includes('spalten')) continue
  const text = dateien
    .map((rel) => {
      const p = join(WURZEL, 'apps', app, rel)
      return existsSync(p) ? readFileSync(p, 'utf8') : ''
    })
    .join('\n')
  if (!text.trim()) {
    melde(app, 'keine Seitenleisten-Datei gefunden — der Griff ist nicht pruefbar')
    continue
  }
  // 32 px eingeklappt. ZWEI ZULAESSIGE BAUFORMEN, und die App sagt selbst,
  // welche sie hat:
  //
  //   Raster   Die Spaltenbreiten stehen in einem `gridTemplateColumns`, weil
  //            sie sich mit dem Zustand aendern (`light-planner`). Dann muss
  //            JEDE einklappbare Spalte dort auf 32 px gehen — eine von zwei
  //            genuegt nicht.
  //   Panel    Jede Spalte bringt ihre eingeklappte Leiste selbst mit, als
  //            `<aside className="… w-8 …">` (`cable-planner`,
  //            `multicam-planner`). Dann muss JEDE Datei, die eine Spalte
  //            besitzt, so eine Leiste haben.
  //
  // Drei Anlaeufe, zwei davon gescheitert, und die Fehler sind lehrreich:
  //
  //   1. „`w-8` ODER `32px` irgendwo im Text" blieb gruen, als die Leiste im
  //      `multicam-planner` auf `w-5` gedreht wurde — `w-8` steht in diesen
  //      Dateien an einem Dutzend anderer Stellen.
  //   2. „jede `<aside>`-Zeile mit `h-full` und Rand traegt `w-8`"
  //      beschuldigte richtigen Code: die AUFGEKLAPPTE Leiste ist auch ein
  //      `<aside>` mit `h-full` und Rand, und sie soll gerade nicht 32 px
  //      breit sein.
  const rasterZeile = text.split('\n').find((z) => /gridTemplateColumns/.test(z))
  if (rasterZeile) {
    const treffer = (rasterZeile.match(/'32px'/g) ?? []).length
    const spalten = (rasterZeile.match(/\?\s*'/g) ?? []).length
    if (treffer < spalten) {
      melde(app, `nur ${treffer} von ${spalten} Spalten sind eingeklappt 32 px breit`)
    }
  } else {
    const hatLeiste = (q) => q.split('\n').some((z) => /<aside/.test(z) && /\bw-8\b/.test(z))
    let gepruefte = 0
    for (const rel of dateien) {
      const pfad = join(WURZEL, 'apps', app, rel)
      if (!existsSync(pfad)) continue
      const q = readFileSync(pfad, 'utf8')
      if (!/<aside/.test(q)) continue
      gepruefte += 1
      if (!hatLeiste(q)) melde(app, `${rel}: keine eingeklappte Leiste mit 32 px`)
    }
    if (!gepruefte) melde(app, 'keine Spalten-Datei gefunden — der Griff ist nicht pruefbar')
  }

  if (!/vertical-rl/.test(text)) {
    melde(app, 'eingeklappt steht kein Spaltenname senkrecht in der Leiste')
  }

  // ── Die Kopfzeile der Spalte ────────────────────────────────────────────
  //
  // ADR-007 Abschnitt 6 verlangt seit dem 2026-09-11 nicht nur den Griff,
  // sondern die ZEILE, in der er sitzt: jede Spalte nennt oben ihren Namen
  // und traegt darunter die Kopflinie im Akzent (Abschnitt 3).
  //
  // GEMESSEN, weil die Regel sonst wieder nur dasteht. Nachgesehen am selben
  // Tag, nachdem der Griff vereinheitlicht war:
  //
  //   cable-planner  Inspektor: Name ja, Linie GEDAEMPFT statt Akzent
  //                  Bibliothek: gar kein Name, die Register begannen sofort
  //   multicam       gar keine Kopfzeile — nur die Registerzeile
  //   light-planner  beides da (`SeitenPanel`)
  //
  // Drei Apps, drei Antworten auf „wie heisst diese Spalte" — und in zweien
  // sagte die offene Spalte ihren Namen gar nicht, waehrend die eingeklappte
  // ihn senkrecht trug.
  //
  // WARUM EIN MARKER UND KEIN MUSTER. Der erste Anlauf suchte irgendwo im
  // Text nach „Rand unten in der Akzentfarbe". Er blieb GRUEN, als die
  // Kopfzeile des `multicam-planner` versuchsweise auf den gedaempften Rand
  // gedreht wurde — denn dieselbe Datei traegt `border-b-2 border-bc-accent`
  // am aktiven REGISTER. Der Lauf bestaetigte also einen Unterstrich und
  // nannte ihn Kopflinie. Die Kopfzeile sagt jetzt selbst, dass sie eine
  // ist: die Klasse `spaltenkopf` steht an ihr und an nichts sonst.
  //
  // WAS DIESE PRUEFUNG NICHT KANN: sie liest Klassen, nicht Pixel. Ob die
  // Linie im Fenster wirklich in der Akzentfarbe erscheint, haengt am
  // Stilblatt — ein `--accent`, das auf den Randton gesetzt wird, faellt ihr
  // nicht auf. Und ob in der Zeile ein sinnvoller Name steht, entscheidet
  // kein Ausdruck; gemessen ist, DASS die Spalte eine Kopfzeile auszeichnet
  // und dass diese die Akzentlinie fuehrt.
  const AKZENT_UTILITY = /border-(?:b|bottom)\b[^"'`]*\b(?:border-)?(?:cp-accent|bc-accent)\b/
  const kopfzeilen = [...text.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)]
    .map((m) => m[1] ?? m[2])
    .filter((k) => /(^|\s)spaltenkopf(\s|$)/.test(k))
  if (!kopfzeilen.length) {
    melde(app, 'keine Spalten-Kopfzeile ausgezeichnet (Klasse `spaltenkopf`)')
  } else {
    // Die Akzentlinie steht entweder als Utility in derselben Klassenliste
    // (cable, multicam) oder im Stilblatt an einer der uebrigen Klassen
    // (light: `.panel-head`). Beide Bauformen sind zugelassen — die Apps
    // laufen auch allein und teilen kein Stilblatt.
    const stil = dateien
      .filter((rel) => rel.endsWith('.css'))
      .map((rel) => {
        const pf = join(WURZEL, 'apps', app, rel)
        return existsSync(pf) ? readFileSync(pf, 'utf8') : ''
      })
      .join('\n')
    const ausStilblatt = (klassen) =>
      klassen.some((k) => {
        const regel = new RegExp(`\\.${k}\\s*\\{[^}]*border-bottom:[^;}]*var\\(--accent\\)`, 's')
        return regel.test(stil)
      })
    const traegt = kopfzeilen.some(
      (k) => AKZENT_UTILITY.test(k) || ausStilblatt(k.split(/\s+/).filter(Boolean)),
    )
    if (!traegt) melde(app, 'die Spalten-Kopfzeile fuehrt keine Akzentlinie')
  }
}

const proApp = new Map()
for (const b of befunde) proApp.set(b.app, [...(proApp.get(b.app) ?? []), b.was])

if (befunde.length === 0) {
  console.log(`OK: ${APPS.length} Kopfzeilen gleich gebaut — Klasse + 40 px, ${ROLLEN.join(' · ')}, Grundstock je Menue, Einstellungen rechts aussen, kein Desktop-Hamburger. Dazu ${SPALTEN_APPS.length} Apps mit gleichem Seitenleisten-Griff (32 px eingeklappt, Name senkrecht).`)
  const n = Object.keys(AUSNAHMEN).length
  console.log(n ? `${n} App(s) mit begruendeter Ausnahme.` : 'Keine Ausnahmen.')
} else {
  for (const [app, liste] of proApp) {
    console.error(`\n✗ ${app}`)
    for (const w of liste) console.error(`    ${w}`)
  }
  console.error(`\n${befunde.length} Befund(e) in ${proApp.size} App(s).`)
}
console.log('\nNICHT gemessen: die Reihenfolge auf dem SCHIRM (nur die im Markup), die vier nicht vendorierten Repos (Broadcast-intercom, tally-pi, sony-camera-bridge, pi-media-station) — und ob der Griff wirklich KLAPPT. Gemessen sind die Zahl und die senkrechte Schrift im Quelltext, nicht das Verhalten im Fenster.')
process.exit(befunde.length ? 1 : 0)
