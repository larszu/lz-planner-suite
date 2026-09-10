import { describe, expect, it } from 'vitest'
import { lesen, zeileLesen, buchbar } from '../lib/wareneingang'
import type { InventoryItem } from '../types/inventory'

// ───────────────────────────────────────────────────────────────────────────
// Der Wareneingang (B-65).
//
// Der teuerste Ausgang dieser Ableitung ist nicht eine falsch gelesene
// Zeile, sondern eine STILL ÜBERSPRUNGENE: der Beleg hat zwölf Positionen,
// gebucht werden elf, und niemand sieht es. Test „keine Zeile verschwindet"
// hält das fest.
// ───────────────────────────────────────────────────────────────────────────

const bestand: InventoryItem[] = [
  { id: 'i1', model: 'Shure ULXD2', quantity: 4, createdAt: 't', updatedAt: 't' },
  { id: 'i2', model: 'XLR 3m', quantity: 20, createdAt: 't', updatedAt: 't' },
]

describe('zeileLesen — drei Schreibweisen', () => {
  it('1. Menge vorn mit x', () => {
    expect(zeileLesen('4 x Shure ULXD2')).toEqual({
      roh: '4 x Shure ULXD2',
      lage: 'neu',
      model: 'Shure ULXD2',
      menge: 4,
    })
    expect(zeileLesen('12x XLR 3m').menge).toBe(12)
    expect(zeileLesen('2 Sennheiser EW 100').menge).toBe(2)
  })

  it('2. CSV mit Semikolon oder Tabulator', () => {
    expect(zeileLesen('Shure ULXD2; 4; 249,00')).toEqual({
      roh: 'Shure ULXD2; 4; 249,00',
      lage: 'neu',
      model: 'Shure ULXD2',
      menge: 4,
      preis: 249,
    })
    expect(zeileLesen('XLR 3m\t10').menge).toBe(10)
  })

  it('3. nur ein Name ist lesbar — aber ohne Menge, und die wird NICHT erfunden', () => {
    // Eine 1 hier waere eine erfundene Lieferung.
    const z = zeileLesen('Manfrotto Stativ')
    expect(z.lage).toBe('neu')
    expect(z.model).toBe('Manfrotto Stativ')
    expect(z.menge).toBeUndefined()
  })

  it('4. kein Preis ist kein 0-Preis', () => {
    expect(zeileLesen('4 x Shure ULXD2').preis).toBeUndefined()
    expect(zeileLesen('Shure ULXD2; 4').preis).toBeUndefined()
    expect(zeileLesen('Shure ULXD2; 4; 0').preis).toBe(0)
  })

  it('5. was nicht passt, ist unlesbar — MIT Rohzeile und Grund', () => {
    const z = zeileLesen('Shure ULXD2; vier Stueck')
    expect(z.lage).toBe('unlesbar')
    expect(z.roh).toBe('Shure ULXD2; vier Stueck')
    expect(z.grund).toContain('vier Stueck')
  })
})

describe('lesen — gegen den Bestand', () => {
  const beleg = [
    '4 x Shure ULXD2',
    'XLR 3m; 10; 3,50',
    '2 Manfrotto Stativ',
    'Kabeltrommel; drei',
  ].join('\n')

  it('1. bekannt, neu und unlesbar werden auseinandergehalten', () => {
    const b = lesen(beleg, bestand)
    expect(b.bekannt).toBe(2)
    expect(b.neu).toBe(1)
    expect(b.unlesbar).toBe(1)
  })

  it('2. keine Zeile verschwindet', () => {
    // Der teuerste Ausgang: elf von zwoelf gebucht, und niemand sieht es.
    const b = lesen(beleg, bestand)
    expect(b.zeilen).toHaveLength(4)
    expect(b.zeilen.map((z) => z.roh)).toEqual(beleg.split('\n'))
  })

  it('3. eine bekannte Zeile sagt, was danach im Bestand stünde', () => {
    const b = lesen('4 x Shure ULXD2', bestand)
    expect(b.zeilen[0].itemId).toBe('i1')
    expect(b.zeilen[0].neueMenge, '4 vorhanden + 4 geliefert').toBe(8)
  })

  it('4. der Vergleich ist exakt — Gross/klein egal, Ähnlichkeit NICHT', () => {
    expect(lesen('4 x shure ulxd2', bestand).bekannt, 'Gross/klein egal').toBe(1)
    // „ULXD2-K51" ist ein anderer Artikel als „ULXD2". Eine Software, die
    // das zusammenzieht, macht aus zweien stillschweigend einen — und der
    // Fehler faellt erst auf, wenn die Kommissionierliste das Falsche nennt.
    const b = lesen('4 x Shure ULXD2-K51', bestand)
    expect(b.bekannt).toBe(0)
    expect(b.neu).toBe(1)
  })

  it('5. leere Zeilen im Beleg zählen nicht als unlesbar', () => {
    // Ein Absatz zwischen zwei Positionen ist kein Fehler des Lieferanten.
    const b = lesen('4 x Shure ULXD2\n\n\nXLR 3m; 10', bestand)
    expect(b.zeilen).toHaveLength(2)
    expect(b.unlesbar).toBe(0)
  })

  it('6. ein leerer Beleg ergibt einen leeren Bericht, keinen Fehler', () => {
    expect(lesen('', bestand)).toEqual({ zeilen: [], bekannt: 0, neu: 0, unlesbar: 0 })
  })
})

describe('buchbar — was wirklich gebucht werden kann', () => {
  it('1. nur Lesbares mit Menge', () => {
    const b = lesen(['4 x Shure ULXD2', 'Manfrotto Stativ', 'Kabeltrommel; drei'].join('\n'), bestand)
    expect(buchbar(b).map((z) => z.model)).toEqual(['Shure ULXD2'])
  })

  it('2. eine Zeile ohne Menge ist kein Fehler, sondern eine offene Frage', () => {
    // Sie bleibt im Bericht stehen (der Mensch beantwortet sie), wird aber
    // nicht mit 1 gebucht.
    const b = lesen('Manfrotto Stativ', bestand)
    expect(b.zeilen).toHaveLength(1)
    expect(b.unlesbar).toBe(0)
    expect(buchbar(b)).toHaveLength(0)
  })

  it('3. Menge 0 wird nicht gebucht', () => {
    expect(buchbar(lesen('Shure ULXD2; 0', bestand))).toHaveLength(0)
  })
})
