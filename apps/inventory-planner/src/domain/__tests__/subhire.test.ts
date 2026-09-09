// ───────────────────────────────────────────────────────────────────────────
// Sub-Hire: die Liste, die Geld spart — und die beiden Fälle, die sie trennt.
//
// Der Befund, gegen den das geschrieben ist: eine Liste, die nur ÜBERFÄLLIGES
// zeigt, verschweigt genau das Stück, das liegenbleibt. Fremdes Material ohne
// Rückgabetermin fällt in keine Frist, weil es keine hat.
// ───────────────────────────────────────────────────────────────────────────
import { describe, expect, it } from 'vitest'
import { isForeign, overdueSubhire, ownershipNote, subhireStatus } from '../lib/ownership'
import type { InventoryItem } from '../types/inventory'

const HEUTE = '2026-09-09'

const artikel = (t: Partial<InventoryItem> & { model: string }): InventoryItem => ({
  id: t.model,
  quantity: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...t,
})

describe('subhireStatus', () => {
  it('eigenes Material hat nichts zurückzugeben', () => {
    expect(subhireStatus(artikel({ model: 'a', ownership: 'owned' }), HEUTE)).toBe('owned')
  })

  it('ohne Angabe zum Eigentum gilt ein Stück als eigenes', () => {
    // Das ist eine ANNAHME, und sie steht in `isForeign` mit ihrem Grund: der
    // Bestand ist alt und die meisten Positionen sind es auch. Sie steht auch
    // hier, damit die naechste Fassung sie nicht versehentlich umdreht.
    expect(isForeign(artikel({ model: 'a' }))).toBe(false)
    expect(subhireStatus(artikel({ model: 'a' }), HEUTE)).toBe('owned')
  })

  it('fremd ohne Termin ist ein eigener Zustand, nicht „fällig"', () => {
    expect(subhireStatus(artikel({ model: 'a', ownership: 'subhire' }), HEUTE)).toBe('no-date')
    // Leerzeichen sind kein Termin.
    expect(subhireStatus(artikel({ model: 'a', ownership: 'rented', returnDue: '  ' }), HEUTE)).toBe(
      'no-date',
    )
  })

  it('der Stichtag selbst zählt schon als überfällig', () => {
    expect(
      subhireStatus(artikel({ model: 'a', ownership: 'rented', returnDue: HEUTE }), HEUTE),
    ).toBe('overdue')
    expect(
      subhireStatus(artikel({ model: 'a', ownership: 'rented', returnDue: '2026-09-10' }), HEUTE),
    ).toBe('due')
  })
})

describe('overdueSubhire', () => {
  const bestand = [
    artikel({ model: 'Eigen', ownership: 'owned', returnDue: '2020-01-01' }),
    artikel({ model: 'Spaet', ownership: 'rented', returnDue: '2026-09-01' }),
    artikel({ model: 'Sehr spaet', ownership: 'subhire', returnDue: '2026-08-01' }),
    artikel({ model: 'Ohne Termin', ownership: 'subhire' }),
    artikel({ model: 'Laeuft noch', ownership: 'rented', returnDue: '2026-12-01' }),
  ]

  it('führt überfälliges UND undatiertes, aber nichts Eigenes', () => {
    const zeilen = overdueSubhire(bestand, HEUTE)
    expect(zeilen.map((z) => z.model)).toEqual(['Sehr spaet', 'Spaet', 'Ohne Termin'])
  })

  it('sortiert überfällig zuerst, darin das älteste Datum zuerst', () => {
    const zeilen = overdueSubhire(bestand, HEUTE)
    expect(zeilen[0].status).toBe('overdue')
    expect(zeilen[1].status).toBe('overdue')
    expect(zeilen[2].status).toBe('no-date')
    expect(zeilen[0].returnDue < zeilen[1].returnDue).toBe(true)
  })

  it('behält den Unterschied gemietet/Sub-Hire', () => {
    const zeilen = overdueSubhire(bestand, HEUTE)
    expect(zeilen.find((z) => z.model === 'Spaet')?.ownership).toBe('rented')
    expect(zeilen.find((z) => z.model === 'Sehr spaet')?.ownership).toBe('subhire')
  })
})

describe('ownershipNote', () => {
  it('bleibt für eigenes Material leer', () => {
    expect(ownershipNote(artikel({ model: 'a', ownership: 'owned' }), HEUTE)).toBe('')
  })

  it('nennt einen fehlenden Lieferanten, statt ihn wegzulassen', () => {
    const text = ownershipNote(artikel({ model: 'a', ownership: 'subhire' }), HEUTE)
    expect(text).toContain('Lieferant unbekannt')
    expect(text).toContain('kein Rückgabedatum')
  })

  it('unterscheidet „zurück seit" von „zurück"', () => {
    expect(
      ownershipNote(artikel({ model: 'a', ownership: 'rented', returnDue: '2026-08-01' }), HEUTE),
    ).toContain('zurück seit 2026-08-01')
    expect(
      ownershipNote(artikel({ model: 'a', ownership: 'rented', returnDue: '2026-12-01' }), HEUTE),
    ).toContain('zurück 2026-12-01')
  })
})
