import { describe, expect, it } from 'vitest'
import { deckung, nachzubestellen } from '../lib/mindestmenge'
import type { InventoryItem } from '../types/inventory'
import type { Commitment } from '../lib/inventoryCommitment'

// ───────────────────────────────────────────────────────────────────────────
// „Unter Ziel" (B-65) — reicht der Bestand?
//
// Die Prüfung, auf die es ankommt, ist Nummer 2: verglichen wird mit dem,
// was im REGAL liegt, nicht mit `quantity`. Eine Prüfung gegen `quantity`
// gäbe Entwarnung für Material, das gerade auf einem Truck steht — und
// genau dann (Show läuft, halbes Lager unterwegs) wird die Zahl gebraucht.
//
// Nummer 4 ist die zweite Hälfte davon: ein Artikel ohne hinterlegte
// Mindestmenge ist UNBEWERTET und zählt in keine der drei Lagen. Ihn als
// „ok" zu führen wäre eine Aussage über etwas, das niemand entschieden hat.
// ───────────────────────────────────────────────────────────────────────────

const artikel = (id: string, model: string, quantity: number, mindestmenge?: number): InventoryItem =>
  ({ id, model, quantity, ...(mindestmenge === undefined ? {} : { mindestmenge }) }) as InventoryItem

const gebunden = (paare: Array<[string, number]>): Map<string, Commitment> =>
  new Map(paare.map(([id, quantity]) => [id, { quantity, on: [] }]))

describe('B-65 — Deckung gegen die Mindestmenge', () => {
  it('1. drei Lagen, und die Grenze liegt auf „knapp"', () => {
    const b = deckung(
      [artikel('a', 'Unter', 2, 5), artikel('b', 'Knapp', 5, 5), artikel('c', 'Reicht', 9, 5)],
      new Map(),
    )
    expect(b.zeilen.map((z) => z.lage)).toEqual(['unter', 'knapp', 'ok'])
    expect(b.unter).toBe(1)
    expect(b.knapp).toBe(1)
    expect(b.ok).toBe(1)
    // Gleichstand ist NICHT unterschritten — aber die naechste Ausgabe reisst
    // die Luecke, und deshalb ist es auch nicht „ok".
    expect(b.zeilen[1].fehlt).toBe(0)
  })

  it('2. gebundenes Material zaehlt nicht als vorhanden', () => {
    // DIE PRUEFUNG, WEGEN DER ES DIESE DATEI GIBT. Zehn im Bestand, acht auf
    // offener Ausgabe, Mindestmenge fuenf: gegen `quantity` waere alles in
    // Ordnung, im Regal liegen zwei.
    const b = deckung([artikel('a', 'Funkstrecke', 10, 5)], gebunden([['a', 8]]))
    const z = b.zeilen[0]
    expect(z.bestand).toBe(10)
    expect(z.gebunden).toBe(8)
    expect(z.verfuegbar).toBe(2)
    expect(z.lage, 'gegen `quantity` geprueft statt gegen das Regal').toBe('unter')
    expect(z.fehlt).toBe(3)
  })

  it('3. mehr gebunden als vorhanden ergibt keine negative Menge', () => {
    // Ein Datenfehler, aber eine negative „Verfuegbarkeit" waere eine Zahl,
    // die niemand lesen kann. Der Fall faellt ueber bestand/gebunden auf.
    const b = deckung([artikel('a', 'X', 3, 2)], gebunden([['a', 5]]))
    expect(b.zeilen[0].verfuegbar).toBe(0)
    expect(b.zeilen[0].bestand).toBe(3)
    expect(b.zeilen[0].gebunden).toBe(5)
  })

  it('4. ohne Mindestmenge: unbewertet, nicht „ok"', () => {
    const b = deckung([artikel('a', 'Ohne', 0), artikel('b', 'Mit', 9, 5)], new Map())
    expect(b.unbewertet).toBe(1)
    expect(b.zeilen).toHaveLength(1)
    expect(
      b.ok,
      'ein Artikel ohne Mindestmenge darf nicht als in Ordnung gezaehlt werden — ' +
        'das waere eine Aussage ueber etwas, das niemand entschieden hat',
    ).toBe(1)
  })

  it('5. Mindestmenge 0 ist eine Entscheidung und wird bewertet', () => {
    // Der Unterschied zu 4: `0` heisst „darf leer sein", `undefined` heisst
    // „nicht entschieden". Waeren beide gleich, ginge die Entscheidung verloren.
    const b = deckung([artikel('a', 'Darf leer sein', 0, 0)], new Map())
    expect(b.unbewertet).toBe(0)
    expect(b.zeilen[0].lage).toBe('knapp')
  })

  it('6. das Dringendste steht oben, und die Reihenfolge ist reproduzierbar', () => {
    const items = [
      artikel('a', 'Fehlt 1', 4, 5),
      artikel('b', 'Fehlt 4', 1, 5),
      artikel('c', 'Reicht', 9, 5),
      artikel('d', 'Fehlt 4 auch', 1, 5),
    ]
    const einmal = deckung(items, new Map()).zeilen.map((z) => z.model)
    const nochmal = deckung([...items].reverse(), new Map()).zeilen.map((z) => z.model)
    expect(einmal).toEqual(['Fehlt 4', 'Fehlt 4 auch', 'Fehlt 1', 'Reicht'])
    expect(nochmal, 'derselbe Bestand ergibt zweimal dieselbe Liste (ADR-004)').toEqual(einmal)
  })

  it('7. auf die Nachbestell-Liste kommt nur, was unterschritten ist', () => {
    const b = deckung(
      [artikel('a', 'Unter', 2, 5), artikel('b', 'Knapp', 5, 5), artikel('c', 'Reicht', 9, 5)],
      new Map(),
    )
    expect(nachzubestellen(b).map((z) => z.model)).toEqual(['Unter'])
  })
})
