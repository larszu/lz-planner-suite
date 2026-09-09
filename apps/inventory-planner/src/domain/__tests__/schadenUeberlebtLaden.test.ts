import { describe, expect, it, beforeEach, vi } from 'vitest'

// ───────────────────────────────────────────────────────────────────────────
// Überlebt ein aufgenommener Schaden das Neuladen?
//
// ─── DER DEFEKT, GEFUNDEN 2026-09-09 ───────────────────────────────────────
//
// Beim Bau der Ansicht „Werte & Schäden" (B-65) blieb das Schadensregister
// leer, obwohl der Prüf-Bestand einen Schaden enthielt. Die Ursache lag
// nicht in der Ansicht und nicht in `damageRegister`, sondern eine Ebene
// tiefer: `healRecord` baut `r.in` beim Laden neu auf und trug `missing`,
// `extra` und `note` mit — `damaged` NICHT.
//
// Geschrieben wurde der Schaden korrekt (`checkIn` nimmt ihn entgegen,
// `closeCheckout` setzt ihn, `persist` serialisiert ihn). Gelesen wurde er
// nie wieder. Ein Schaden überlebte damit genau bis zum nächsten Laden der
// Seite.
//
// Das ist die schlimmere Hälfte der Defektform „Feld wird geschrieben und
// nie gelesen": hier hat jemand bei der Rückgabe etwas AUFGESCHRIEBEN und
// verlässt sich darauf, dass es steht. Drei Wochen später steht Aussage
// gegen Aussage — genau der Fall, wegen dem ein Rückgabe-Beleg geführt wird.
//
// ─── WARUM DIESER TEST DEN GANZEN WEG GEHT ─────────────────────────────────
//
// Er prüft nicht `istSchaden` für sich, sondern SCHREIBEN → SERIALISIEREN →
// LADEN. Ein Test auf die Prüffunktion allein wäre grün geblieben, während
// die Heilung sie nicht aufruft — und genau das war der Defekt.
// ───────────────────────────────────────────────────────────────────────────

const KEY = 'inventory-planner:checkouts'

const schadensVorgang = (note: string) => [
  {
    id: 'c1',
    nodeId: 'n1',
    nodeLabel: 'Case 1',
    out: { at: '2026-08-01T08:00:00Z', to: 'Schulz', projectName: 'Gala' },
    contents: [{ kind: 'item', refId: 'i2', label: 'Sennheiser EW 100', quantity: 1 }],
    in: {
      at: '2026-08-05T17:00:00Z',
      missing: [],
      extra: [],
      damaged: [
        {
          line: { kind: 'item', refId: 'i2', label: 'Sennheiser EW 100', quantity: 1, code: 'ART-2' },
          note,
        },
      ],
    },
  },
]

/**
 * Frisch laden — der Store liest `localStorage` beim ERSTEN Import
 * (`const initial = load()`). `resetModules` sorgt dafür, dass genau das
 * noch einmal passiert; ohne ihn läse jeder weitere Test den Stand des
 * ersten, und die Prüfung ginge am Laden vorbei.
 */
const frischLaden = async () => {
  vi.resetModules()
  const mod = await import('../store/checkoutStore')
  return mod.useCheckoutStore.getState().records
}

describe('Ein aufgenommener Schaden überlebt das Neuladen', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('1. der Schaden steht nach dem Laden noch da', async () => {
    localStorage.setItem(KEY, JSON.stringify(schadensVorgang('Antenne verbogen')))
    const records = await frischLaden()
    expect(records).toHaveLength(1)
    expect(
      records[0].in?.damaged,
      'die Heilung hat `damaged` fallen lassen — dann ist das Schadensregister ' +
        'nach jedem Neuladen leer, egal wie gut es rechnet',
    ).toHaveLength(1)
    expect(records[0].in?.damaged?.[0].note).toBe('Antenne verbogen')
    expect(records[0].in?.damaged?.[0].line.code).toBe('ART-2')
  })

  it('2. „beschädigt" ohne Text zählt nicht', async () => {
    // Der Typ sagt es ausdrücklich: „Ohne Text kein Eintrag — ‚beschaedigt'
    // ohne Angabe hilft weder der Werkstatt noch der Rechnung."
    localStorage.setItem(KEY, JSON.stringify(schadensVorgang('   ')))
    const records = await frischLaden()
    expect(records[0].in?.damaged).toBeUndefined()
  })

  it('3. eine Rückgabe ohne Schaden bleibt ohne das Feld', async () => {
    // Weggelassen statt leer: ein Vorgang ohne Schäden soll zeichengleich
    // bleiben wie vor dieser Änderung, sonst wandert der Unterschied durch
    // jeden Export.
    const ohne = JSON.parse(JSON.stringify(schadensVorgang('x')))
    delete ohne[0].in.damaged
    localStorage.setItem(KEY, JSON.stringify(ohne))
    const records = await frischLaden()
    expect(records[0].in).toBeTruthy()
    expect('damaged' in (records[0].in as object)).toBe(false)
  })

  it('4. eine Schadenszeile ohne gültige Zeile fällt weg, der Rest bleibt', async () => {
    const gemischt = JSON.parse(JSON.stringify(schadensVorgang('Antenne verbogen')))
    gemischt[0].in.damaged.push({ line: { kind: 'item' }, note: 'unvollständig' })
    localStorage.setItem(KEY, JSON.stringify(gemischt))
    const records = await frischLaden()
    expect(records[0].in?.damaged).toHaveLength(1)
    expect(records[0].in?.damaged?.[0].note).toBe('Antenne verbogen')
  })
})
