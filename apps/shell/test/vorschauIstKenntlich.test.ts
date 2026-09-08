import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// ───────────────────────────────────────────────────────────────────────────
// E-13 — die Vorschau nennt sich Vorschau.
//
// DER BEFUND. Die Shell führt ein eigenes, absichtlich einfaches
// Übersichtsmodell; das ist entschieden und bleibt. Falsch daran war nicht die
// Eigenständigkeit, sondern das SCHWEIGEN: die Fläche zeigte echte Daten in
// einem anderen Modell, sah aus wie der Plan und stand unter demselben
// Modulnamen. Wer dort vier Kabel zählte, hatte vier Kabel des SHELL-Modells
// gezählt und keinen Hinweis darauf, dass der Kabelplan mehr kennt.
//
// WAS DIESER GUARD PRÜFT, und warum genau das. Nicht, wie der Streifen
// aussieht — Text, Farbe und Anordnung dürfen sich ändern, ohne dass eine
// Zusicherung fällt. Geprüft wird die eine Aussage, an der die Entscheidung
// hängt: **wer eine Vorschau-Fläche rendert, rendert auch ihre
// Kennzeichnung.** Der Fehler, gegen den das steht, ist nicht „jemand baut den
// Streifen um", sondern „jemand baut eine ZWEITE Stelle, an der eine Vorschau
// erscheint, und vergisst ihn dort" — dieselbe Form wie B-35 (etwas ist
// gebaut, begründet und an einer Stelle nicht erreichbar).
// ───────────────────────────────────────────────────────────────────────────

const SRC = join(import.meta.dirname, '..', 'src')

const dateien = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? dateien(join(dir, d.name)) : /\.tsx?$/.test(d.name) ? [join(dir, d.name)] : [],
  )

/** Die Vorschau-Flächen. Wer eine davon rendert, zeigt Shell-Modell als Bild. */
const FLAECHEN = ['SignalPreview', 'PlanPreview']

const verbraucher = dateien(SRC)
  .map((p) => ({ pfad: p.slice(SRC.length + 1), inhalt: readFileSync(p, 'utf8') }))
  // Die Definitionsdatei selbst ist kein Verbraucher.
  .filter((f) => f.pfad !== join('shell', 'previews.tsx'))
  .filter((f) => FLAECHEN.some((n) => new RegExp(`<${n}[\\s/>]`).test(f.inhalt)))

describe('E-13 — jede Vorschau-Fläche trägt ihre Kennzeichnung', () => {
  it('findet die Verbraucher überhaupt — sonst prüft der Guard nichts', () => {
    // Untergrenze: wird aus `<SignalPreview …>` einmal etwas anderes, soll der
    // Guard das sagen statt stumm grün zu bleiben.
    expect(verbraucher.map((v) => v.pfad)).not.toEqual([])
  })

  it.each(verbraucher.map((v) => v.pfad))('%s rendert PreviewNotice', (pfad) => {
    const f = verbraucher.find((v) => v.pfad === pfad)!
    expect(/<PreviewNotice[\s/>]/.test(f.inhalt), `${pfad} zeigt eine Vorschau-Fläche ohne Kennzeichnung`).toBe(true)
  })
})

describe('E-13 — die Kennzeichnung sagt, WORAN man ist', () => {
  const quelle = readFileSync(join(SRC, 'shell', 'previews.tsx'), 'utf8')
  const notice = quelle.slice(quelle.indexOf('export function PreviewNotice'))

  // Drei Aussagen verlangt ADR-003 an dieser Stelle, und alle drei sind ohne
  // einander wertlos: ein Etikett ohne Stand ist undatiert, ein Stand ohne
  // Etikett erklärt nichts, und beides ohne Weg ins Modul lässt den Nutzer mit
  // der Feststellung allein, dass ihm etwas fehlt.
  it('nennt sich Vorschau', () => {
    expect(notice).toContain("'chrome.preview.badge'")
  })

  it('nennt den Stand des Projekts', () => {
    expect(notice).toContain('project.meta.version')
    expect(notice).toContain("'chrome.preview.unsaved'")
  })

  it('bietet den Weg in den Planer', () => {
    expect(notice).toContain('onOpenInPlanner')
  })
})
