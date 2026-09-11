import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ───────────────────────────────────────────────────────────────────────────
// Die Kopfzeile bleibt im Schnitt der Suite (ADR-007 Abschnitt 6).
//
// NUTZER-AUFTRAG 2026-09-11: „Stelle sicher das in allen repos übergreifend
// das Einstellungen Menü an der gleichen Stelle ist wie im Cable planner und
// das die obere Menüleiste gleich aufgebaut ist."
//
// ─── WOGEGEN DIESER LAUF STEHT ────────────────────────────────────────────
//
// Nicht gegen das Bauen — das ist einmal passiert und steht im Diff. Gegen
// das ZURÜCKRUTSCHEN: eine Kopfzeile, die beim nächsten Umbau wieder eine
// Polsterung in `rem` bekommt statt der 40 px, oder deren Einstellungen-Knopf
// nach links wandert, weil dort gerade Platz war. Das fällt niemandem auf,
// der nur diese App benutzt — es fällt dem auf, der zwischen zwei Werkzeugen
// der Suite wechselt und die Bedienung an derselben Stelle sucht.
//
// Der übergreifende Maßstab liegt in der Suite
// (`scripts/chrome-parity.mjs`) und misst alle sechs Apps im selben Baum.
// Dieser Lauf hier ist die Hälfte, die MITWANDERT: er liegt im Repo, das die
// Datei besitzt, und fällt schon vor dem Vendorieren.
//
// ─── SEIT DEM 2026-09-11 IST DIE QUELLE ENGLISCH ──────────────────────────
//
// Hier stand, warum die Beschriftungen deutsch sein MÜSSEN. Der Eigentümer
// hat entschieden: „Die Standard Sprache muss immer Englisch sein und über
// i18n muss man auf deutsch übersetzen können." Also misst dieser Lauf jetzt
// die SCHLÜSSEL und die englische Quelle — und zusätzlich, dass es zu jedem
// Schlüssel eine deutsche Fassung gibt. Ein Menü, dessen Übersetzung fehlt,
// steht auf Deutsch plötzlich englisch da, und das fällt sonst erst dem
// Nutzer auf.
//
// ─── WAS ER NICHT KANN ────────────────────────────────────────────────────
//
// Er liest Quelltext. Ob der Knopf im Fenster wirklich rechts aussen sitzt,
// sieht er nicht — ein `order-last` im Stilblatt würde ihn täuschen.
// ───────────────────────────────────────────────────────────────────────────

const lies = (...p: string[]): string => readFileSync(resolve(__dirname, '..', '..', ...p), 'utf8')

const kopf = lies('ui', 'Kopfzeile.tsx')
const woerterbuch = lies('i18n', 'de.ts')
const css = lies('index.css')
const app = lies('ui', 'App.tsx')

describe('die Kopfzeile hat das Mass der Suite', () => {
  it('.kopf ist 40 px hoch — als Klasse, nicht als Mass am Element', () => {
    const block = css.slice(css.indexOf('.kopf {'), css.indexOf('.kopf {') + 300)
    expect(block).toContain('height: 40px')
    // `flex: none` gehoert dazu: ohne das schrumpft die Zeile, sobald der
    // Inhalt darunter waechst, und die 40 waeren eine Wunschzahl.
    expect(block).toContain('flex: none')
  })

  it('die Einstellungen stehen rechts aussen', () => {
    // `margin-left: auto` an der rechten Gruppe ist die Zusage; ohne sie
    // steht der Knopf direkt hinter dem letzten Menue.
    const rechts = css.slice(css.indexOf('.kopf-rechts'), css.indexOf('.kopf-rechts') + 200)
    expect(rechts).toContain('margin-left: auto')
    // Und im Markup: der Knopf liegt IN der rechten Gruppe.
    const i = kopf.indexOf('kopf-rechts')
    const j = kopf.indexOf("title={t('settings.title'")
    expect(i, 'keine rechte Gruppe im Markup').toBeGreaterThan(0)
    expect(j, 'kein Einstellungen-Knopf').toBeGreaterThan(i)
  })
})

describe('die Menues sind die der Suite, in ihrer Reihenfolge', () => {
  it('Datei und Hilfe sind da — und Datei zuerst', () => {
    const datei = kopf.indexOf("t('menu.file'")
    const hilfe = kopf.indexOf("t('menu.help'")
    expect(datei, 'kein Datei-Menue').toBeGreaterThan(0)
    expect(hilfe, 'kein Hilfe-Menue').toBeGreaterThan(0)
    expect(datei).toBeLessThan(hilfe)
  })

  it('Datei fuehrt den gemeinsamen Grundstock', () => {
    // An den SCHLUESSELN gemessen und nicht an den Woertern: die Beschriftung
    // ist uebersetzbar, der Schluessel nicht.
    for (const key of ['menu.new', 'menu.open', 'menu.save', 'menu.saveAs']) {
      expect(kopf, `Datei-Menue ohne '${key}'`).toContain(`t('${key}'`)
    }
  })

  it('zu jedem Schluessel der Leiste gibt es eine deutsche Fassung', () => {
    // DIE ANDERE HAELFTE DER UMSTELLUNG. Englisch erscheint von selbst — es
    // ist der Fallback. Deutsch erscheint nur, wenn jemand den Eintrag
    // geschrieben hat, und ein vergessener faellt niemandem auf, der die App
    // auf Englisch benutzt.
    // Das zweite Argument gehoert ins Muster. Ohne es traf die Suche auch
    // `…nicht('a'…` in einem Kommentar und meldete einen Schluessel `a`, den
    // es nie gab — eine falsche Anschuldigung, und die ist fuer einen
    // Waechter so schaedlich wie ein uebersehener Verstoss.
    const schluessel = [...kopf.matchAll(/\bt\('([\w.]+)',\s*'/g)].map((m) => m[1])
    expect(schluessel.length, 'die Kopfzeile wickelt gar nichts').toBeGreaterThan(8)
    const fehlend = schluessel.filter((k) => !woerterbuch.includes(`'${k}':`))
    expect(fehlend, `ohne deutsche Fassung: ${fehlend.join(', ')}`).toEqual([])
  })

  it('es gibt KEIN Ansicht- und kein Bearbeiten-Menue, und das ist Absicht', () => {
    // Ein Lager hat keinen Zeichenbereich (nichts einzupassen, nichts zu
    // zoomen) und keine Rueckgaengig-Kette. Ein Menue mit ausgegrauten
    // Punkten waere ein PLACEHOLDER — es saehe aus wie eine Funktion und
    // waere keine. Faellt dieser Test, weil jemand Undo gebaut hat: dann
    // gehoert das Menue dazu, und diese Zeile wird geaendert statt geloescht.
    expect(kopf).not.toContain("t('menu.view'")
    expect(kopf).not.toContain("t('menu.edit'")
  })
})

describe('Reiter und Menueleiste sind zwei Zeilen', () => {
  it('die Reiter stehen nicht mehr in der Kopfzeile', () => {
    // Bis 2026-09-11 standen App-Name und sieben Reiter in EINER Zeile —
    // damit sah die Modul-Navigation aus wie eine Menueleiste.
    expect(app).toContain('reiter-leiste')
    const i = app.indexOf('<Kopfzeile />')
    const j = app.indexOf('reiter-leiste')
    expect(i, 'keine Kopfzeile im App-Rumpf').toBeGreaterThan(0)
    expect(i, 'die Reiter stehen vor der Kopfzeile').toBeLessThan(j)
  })
})

describe('die Datei-Eintraege tun, was auf ihnen steht', () => {
  it('„Neues Lager" fuehrt die Rueckfrage VERNEINT', () => {
    // Der eigentliche Fehler, gegen den dieser Lauf steht: bis zum
    // 2026-09-11 stand hier `if (window.confirm(…)) return` — OK tat nichts,
    // und „Abbrechen" LOESCHTE den Bestand. Ein Bestaetigungsdialog, dessen
    // Abbruch die Tat ausfuehrt, ist schlimmer als gar keiner.
    //
    // Gemessen wird die Verneinung und nicht das Wort „confirm": ein Lauf,
    // der nur nach `window.confirm` sucht, waere in beiden Fassungen gruen.
    //
    // OHNE KOMMENTARZEILEN gemessen. Die Begruendung in der Kopfzeile nennt
    // die alte Zeile woertlich — suchte der Lauf im rohen Text, besaenftigte
    // ihn genau der Kommentar, der ihn ausloesen soll. Dieselbe Falle wie
    // beim Fokus-Waechter im Cable Planner (B-69).
    const ohneKommentare = kopf
      .split('\n')
      .filter((z) => !z.trimStart().startsWith('//'))
      .join('\n')
    expect(ohneKommentare).toContain('if (!window.confirm(')
    expect(ohneKommentare, 'die Rueckfrage steht wieder unverneint').not.toMatch(
      /if \(window\.confirm\(/,
    )
  })

  it('„Speichern" und „Speichern unter…" legen nicht dieselbe Datei ab', () => {
    // Vorher unterschieden sich die beiden nur im fest eingetragenen
    // Vorgabenamen — der eine hiess immer `bestand.…`, der andere immer
    // `bestand-<heute>.…`. Das war kein „unter", sondern ein zweiter fester
    // Name. Im Browser gibt es genau einen Unterschied zu holen: den NAMEN
    // (den Ort fragt der Download-Dialog ohnehin).
    expect(kopf).toContain('window.prompt(')
    expect(kopf).toContain('speichern(name)')
    expect(kopf).toContain('speichern(standardName())')
  })
})

describe('Gegenprobe zum Lauf selbst', () => {
  it('die gelesenen Dateien sind wirklich da', () => {
    for (const [name, inhalt] of Object.entries({ kopf, css, app, woerterbuch })) {
      expect(inhalt.length, `${name} ist leer`).toBeGreaterThan(400)
    }
  })

  it('ein Menue, das es nicht gibt, wird auch nicht gefunden', () => {
    expect(kopf).not.toContain("t('menu.gibtEsNicht'")
  })
})
