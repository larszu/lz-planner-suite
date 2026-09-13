import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MODULES } from '../src/modules/registry'

// ───────────────────────────────────────────────────────────────────────────
// DAS BOARD VERGISST SEINE ARBEIT NICHT MEHR
//
// NUTZER-MELDUNG 2026-09-12: „Verbessere die UI von dem Board in AV Planner.
// Da sind nicht annaehernd alle Funktionen, die in den Docs beschrieben sind."
//
// ─── WAS GEMESSEN WURDE ───────────────────────────────────────────────────
//
// Die Funktionen SIND da: neun Kartenarten, Spalten-Container, Unterboards,
// Verbindungslinien, drei Vorlagen, Suche, Markdown- und Druckausgabe.
// `BoardCanvas` hielt seinen ganzen Baum aber in `useState` und gab ihn nie
// heraus — es gab keinen Rueckweg zur Shell. Folge:
//
//   * jede Karte war beim naechsten Tab-Wechsel weg (die Komponente wird
//     ausgehaengt, ihr Zustand mit ihr),
//   * die Statusleiste zeigte weiter „0 Karten" — sie liest
//     `project.show.board`, wo der Ausgangswert stand,
//   * die Eigenschaften-Leiste rechts dieselbe Null,
//   * und das gespeicherte Projekt trug nichts davon.
//
// Eine Arbeitsflaeche, die ihre Arbeit vergisst, sieht aus wie eine ohne
// Funktionen. Das war der Befund, nicht die fehlende Funktion.
//
// ─── WOGEGEN DIESER LAUF STEHT ────────────────────────────────────────────
//
// Dagegen, dass der Rueckweg wieder verschwindet — als Prop, als Verdrahtung
// in `TabDeck`, und als Schreibvorgang ins Projekt. Und dagegen, dass die
// Karten-Liste links zurueckkommt (suite#232).
//
// WAS ER NICHT KANN: er liest Quelltext. Ob eine gezogene Karte am Ende
// wirklich in der Datei steht, sagt er nicht — dafuer muesste er die
// Oberflaeche fahren.
// ───────────────────────────────────────────────────────────────────────────

const lies = (p: string): string => readFileSync(resolve(__dirname, '..', p), 'utf8')
const canvas = lies('src/shell/BoardCanvas.tsx')
const tabdeck = lies('src/shell/TabDeck.tsx')
const bibliothek = lies('src/shell/LibraryPanel.tsx')
const app = lies('src/App.tsx')

describe('Das Board gehoert dem Projekt', () => {
  it('BoardCanvas bietet einen Rueckweg an', () => {
    expect(canvas).toMatch(/onChange\?:\s*\(board: Board\) => void/)
  })

  it('und ruft ihn, wenn sich der Baum aendert', () => {
    // Der Effekt haengt an `root` — dem ganzen Baum, nicht an einer einzelnen
    // Karte. Haenge ihn jemand an etwas Engeres, gingen Unterboards verloren.
    const effekt = canvas.slice(canvas.indexOf('const zuletztGeschrieben'))
    expect(effekt).toContain('onChange(root)')
    expect(effekt).toMatch(/\}, \[root, onChange, seed\]\)/)
  })

  it('sammelt die Aenderungen, statt jede einzeln in die Historie zu legen', () => {
    // Ohne Sammelfrist haette das Ziehen EINER Karte ueber die Flaeche ein
    // paar Dutzend Undo-Schritte hinterlassen, und der erste Strg+Z haette
    // sie um drei Pixel zurueckgeschoben.
    const effekt = canvas.slice(canvas.indexOf('const zuletztGeschrieben'))
    expect(effekt).toMatch(/setTimeout\(\(\) => \{/)
    expect(effekt).toContain('clearTimeout')
  })

  it('schreibt den Ausgangswert nicht zurueck', () => {
    // Sonst gaelte ein Projekt als ungespeichert, sobald jemand den
    // Board-Reiter auch nur ansieht — im Browser gemessen, als hier noch ein
    // Durchlauf-Zaehler stand: React haengt im Entwicklungsmodus jeden Effekt
    // einmal aus und wieder ein, und beim zweiten Mal schrieb er.
    //
    // Deshalb wird der INHALT verglichen und nicht gezaehlt. Wer das wieder
    // auf einen Zaehler umstellt, faellt hier.
    const effekt = canvas.slice(canvas.indexOf('const zuletztGeschrieben'))
    expect(effekt).toContain('JSON.stringify(root)')
    expect(effekt).toMatch(/if \(jetzt === zuletztGeschrieben\.current\) return/)
    expect(effekt).toContain('zuletztGeschrieben.current = jetzt')
  })

  it('TabDeck verdrahtet den Rueckweg ins Projekt', () => {
    const stelle = tabdeck.slice(tabdeck.indexOf('<BoardCanvas'), tabdeck.indexOf('<BoardCanvas') + 900)
    expect(stelle).toContain('onChange=')
    expect(stelle).toContain('onUpdateShow')
    expect(stelle).toMatch(/board \}\)\)/)
  })

  it('ohne Projekt bleibt es ein Notizzettel', () => {
    // Es gibt dann nichts, worin das Board leben koennte. Ein `onChange`, das
    // ins Leere schreibt, waere schlimmer als keines: die Flaeche saehe aus,
    // als wuerde sie sich merken.
    const stelle = tabdeck.slice(tabdeck.indexOf('<BoardCanvas'), tabdeck.indexOf('<BoardCanvas') + 900)
    expect(stelle).toMatch(/project && onUpdateShow \?/)
    expect(stelle).toContain(': undefined')
  })
})

describe('Die Karten-Liste links ist weg (suite#232)', () => {
  it('die Bibliothek leitet fuer das Board nichts mehr ab', () => {
    const ableitung = bibliothek.slice(
      bibliothek.indexOf('const deriveGroups'),
      bibliothek.indexOf('export function LibraryPanel'),
    )
    expect(ableitung).not.toMatch(/case 'board':\s*\n\s*return \[/)
    expect(ableitung).not.toContain('project.show.board.cards')
  })

  it('und die Spalte erscheint auf dem Board gar nicht erst', () => {
    // Ohne diese Zeile bliebe die Spalte samt Reiterzeile und Suchfeld stehen
    // und waere leer — eine leere Spalte sagt „hier wurde nichts gefunden",
    // und das waere gelogen.
    expect(app).toMatch(/bibliothekMoeglich =[^\n]*moduleId !== 'board'/)
  })

  it('die Registry verspricht keine Bibliotheks-Reiter mehr', () => {
    const board = MODULES.find((m) => m.id === 'board')!
    expect(board.libraryTabs).toEqual([])
  })
})

describe('Was das Board kann, steht weiterhin auf der Flaeche', () => {
  // Die Gegenprobe zur Meldung: nicht die Funktionen fehlten, sondern ihr
  // Ergebnis blieb liegen. Faellt eine davon aus der Werkzeugleiste, faellt
  // hier zuerst etwas auf — und nicht beim Nutzer.
  it('neun Kartenarten, Vorlagen, Suche, zwei Ausgaben, Unterboards', () => {
    for (const art of ['heading', 'note', 'link', 'todo', 'color', 'look', 'column', 'board', 'image']) {
      expect(canvas).toContain(`${art}:`)
    }
    expect(canvas).toContain('applyTemplate')
    expect(canvas).toContain('boardToMarkdown')
    expect(canvas).toContain('exportPrint')
    expect(canvas).toContain('setQuery')
    expect(canvas).toContain('handleFiles')
    expect(canvas).toContain('crumbTitles')
  })
})
