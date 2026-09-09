import { describe, expect, it } from 'vitest'
import {
  fristenLage,
  anzugehen,
  plusMonate,
  terminVon,
  alterMonate,
} from '../lib/fristen'
import type { InventoryItem, InventoryUnit } from '../types/inventory'

// ───────────────────────────────────────────────────────────────────────────
// Die Fristen-Ampel (B-65).
//
// Der teuerste Fehler, den diese Ableitung machen könnte, ist nicht ein
// falsches Datum, sondern eine EINHEIT OHNE FRIST, die als „ok" gezählt
// wird. Dann sagt die Anwendung „alles geprüft" über ein Lager, in dem
// niemand je etwas eingetragen hat. Test 4 hält das fest.
// ───────────────────────────────────────────────────────────────────────────

const HEUTE = '2026-09-09'

const artikel: InventoryItem[] = [
  { id: 'i1', model: 'ULXD2', quantity: 3, createdAt: 't', updatedAt: 't' },
]

const einheit = (id: string, u: Partial<InventoryUnit>): InventoryUnit => ({
  id,
  itemId: 'i1',
  condition: 'ok',
  history: [],
  createdAt: 't',
  updatedAt: 't',
  ...u,
})

describe('fristen — Termine ableiten', () => {
  it('1. ein eingetragenes Datum gilt und heisst „eingetragen"', () => {
    expect(terminVon({ art: 'dguv-v3', faellig: '2026-12-01' })).toEqual({
      faellig: '2026-12-01',
      quelle: 'eingetragen',
    })
  })

  it('2. ohne Datum wird aus zuletzt + Intervall gerechnet, und es steht dran', () => {
    expect(terminVon({ art: 'dguv-v3', zuletzt: '2026-03-09', intervallMonate: 12 })).toEqual({
      faellig: '2027-03-09',
      quelle: 'hergeleitet',
    })
  })

  it('3. das eingetragene Datum gewinnt gegen das gerechnete', () => {
    // Es ist die juengere, menschliche Aussage: „der Pruefer kommt am 12."
    expect(
      terminVon({ art: 'dguv-v3', zuletzt: '2026-03-09', intervallMonate: 12, faellig: '2026-10-12' }),
    ).toEqual({ faellig: '2026-10-12', quelle: 'eingetragen' })
  })

  it('4. ohne jede Zeitangabe gibt es keinen Termin — und keiner wird geraten', () => {
    expect(terminVon({ art: 'wartung' })).toBeUndefined()
    expect(terminVon({ art: 'wartung', zuletzt: '2026-03-09' })).toBeUndefined()
    expect(terminVon({ art: 'wartung', intervallMonate: 6 })).toBeUndefined()
  })

  it('5. der 31. rutscht auf den letzten Tag des Zielmonats, nicht in den nächsten', () => {
    expect(plusMonate('2026-08-31', 6)).toBe('2027-02-28')
    expect(plusMonate('2024-08-31', 6)).toBe('2025-02-28')
    expect(plusMonate('2023-08-31', 6)).toBe('2024-02-29')
    expect(plusMonate('2026-01-15', 12)).toBe('2027-01-15')
  })
})

describe('fristenLage — die Ampel', () => {
  const units: InventoryUnit[] = [
    // ueberfaellig: 40 Tage her
    einheit('u1', { houseRef: 'AV-0001', fristen: [{ art: 'dguv-v3', faellig: '2026-07-31' }] }),
    // faellig: in 10 Tagen
    einheit('u2', { houseRef: 'AV-0002', fristen: [{ art: 'kalibrierung', faellig: '2026-09-19' }] }),
    // ok: in 100 Tagen
    einheit('u3', { houseRef: 'AV-0003', fristen: [{ art: 'wartung', faellig: '2026-12-18' }] }),
    // ohne Frist
    einheit('u4', { houseRef: 'AV-0004' }),
  ]

  it('1. drei Lagen, und die Einheit ohne Frist zählt in keine davon', () => {
    const b = fristenLage(units, artikel, HEUTE)
    expect(b.ueberfaellig).toBe(1)
    expect(b.faellig).toBe(1)
    expect(b.ok).toBe(1)
    expect(b.ohneFrist).toBe(1)
    expect(b.zeilen).toHaveLength(3)
  })

  it('2. die Tageszahl stimmt und ist bei überfällig negativ', () => {
    const b = fristenLage(units, artikel, HEUTE)
    const nach = new Map(b.zeilen.map((z) => [z.einheit, z]))
    expect(nach.get('AV-0001')?.tage).toBe(-40)
    expect(nach.get('AV-0002')?.tage).toBe(10)
    expect(nach.get('AV-0003')?.tage).toBe(100)
  })

  it('3. das Dringendste steht oben', () => {
    const b = fristenLage(units, artikel, HEUTE)
    expect(b.zeilen.map((z) => z.einheit)).toEqual(['AV-0001', 'AV-0002', 'AV-0003'])
  })

  it('4. eine Einheit ohne Frist wird NICHT als „ok" gezählt', () => {
    // Die Gegenprobe zum gefaehrlichsten Fehler dieser Ableitung: ein Lager
    // ganz ohne gepflegte Fristen darf nicht aussehen wie eines, in dem
    // alles geprueft ist.
    const b = fristenLage([einheit('x', {}), einheit('y', {})], artikel, HEUTE)
    expect(b.ok, 'ungepflegte Einheiten als „ok" zu zaehlen ist die stille Entwarnung').toBe(0)
    expect(b.ueberfaellig).toBe(0)
    expect(b.faellig).toBe(0)
    expect(b.ohneFrist).toBe(2)
    expect(b.zeilen).toHaveLength(0)
  })

  it('5. die Vorwarnzeit ist ein Parameter, keine Konstante', () => {
    const eng = fristenLage(units, artikel, HEUTE, 5)
    expect(eng.faellig, 'bei 5 Tagen Vorwarn ist der Termin in 10 Tagen noch „ok"').toBe(0)
    expect(eng.ok).toBe(2)
    const weit = fristenLage(units, artikel, HEUTE, 120)
    expect(weit.faellig).toBe(3 - 1) // ueberfaellig bleibt ueberfaellig
    expect(weit.ok).toBe(0)
  })

  it('6. mehrere Fristen an einer Einheit ergeben mehrere Zeilen', () => {
    const b = fristenLage(
      [
        einheit('u9', {
          houseRef: 'AV-0009',
          fristen: [
            { art: 'dguv-v3', faellig: '2026-09-10' },
            { art: 'kalibrierung', faellig: '2026-09-11' },
          ],
        }),
      ],
      artikel,
      HEUTE,
    )
    expect(b.zeilen).toHaveLength(2)
    expect(b.ohneFrist, 'sie hat Fristen — sie ist nicht ungepflegt').toBe(0)
  })

  it('7. die Einheit wird unter ihrer Hausnummer angesprochen, sonst der Serie', () => {
    const b = fristenLage(
      [
        einheit('a', { houseRef: 'AV-1', serial: 'SN-1', fristen: [{ art: 'wartung', faellig: '2026-09-10' }] }),
        einheit('b', { serial: 'SN-2', fristen: [{ art: 'wartung', faellig: '2026-09-11' }] }),
        einheit('c', { fristen: [{ art: 'wartung', faellig: '2026-09-12' }] }),
      ],
      artikel,
      HEUTE,
    )
    expect(b.zeilen.map((z) => z.einheit)).toEqual(['AV-1', 'SN-2', 'c'])
  })

  it('8. `anzugehen` liefert überfällig und fällig, nicht ok', () => {
    expect(anzugehen(fristenLage(units, artikel, HEUTE)).map((z) => z.lage)).toEqual([
      'ueberfaellig',
      'faellig',
    ])
  })
})

describe('alterMonate — eine Tatsache, kein Urteil', () => {
  it('1. volle Monate seit dem Kaufdatum', () => {
    expect(alterMonate(einheit('a', { anschaffung: { betrag: { cent: 100, waehrung: 'EUR' }, am: '2024-09-09' } }), HEUTE)).toBe(24)
    expect(alterMonate(einheit('a', { anschaffung: { betrag: { cent: 100, waehrung: 'EUR' }, am: '2026-08-10' } }), HEUTE)).toBe(0)
    expect(alterMonate(einheit('a', { anschaffung: { betrag: { cent: 100, waehrung: 'EUR' }, am: '2026-08-09' } }), HEUTE)).toBe(1)
  })

  it('2. ohne Kaufdatum gibt es kein Alter', () => {
    expect(alterMonate(einheit('a', {}), HEUTE)).toBeUndefined()
    expect(
      alterMonate(einheit('a', { anschaffung: { betrag: { cent: 100, waehrung: 'EUR' } } }), HEUTE),
    ).toBeUndefined()
  })
})
