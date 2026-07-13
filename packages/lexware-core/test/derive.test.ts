import { describe, it, expect } from 'vitest'
import { deriveInventoryLineItems, deriveBudgetLineItems, flatLineItem } from '../src/index'

describe('deriveInventoryLineItems', () => {
  const items = [
    { model: '12G-SDI 50 m', quantity: 8, rentPricePerDay: 12 },
    { model: 'Stativ-Set', quantity: 3 }, // kein Preis → ignoriert
    { model: 'KL Panel XL', quantity: 2, rentPricePerDay: 45 },
  ]
  it('nimmt nur Artikel mit Tagespreis und multipliziert mit Miettagen', () => {
    const li = deriveInventoryLineItems(items, 3)
    expect(li).toHaveLength(2)
    expect(li[0]).toMatchObject({ name: '12G-SDI 50 m', quantity: 8, unitName: 'Tag', unitNetPrice: 36 })
    expect(li[1].unitNetPrice).toBe(135)
    expect(li[0].description).toBe('3 Tage Miete')
  })
  it('Default 1 Tag', () => {
    expect(deriveInventoryLineItems(items)[0].unitNetPrice).toBe(12)
    expect(deriveInventoryLineItems(items)[0].description).toBe('Tagesmiete')
  })
})

describe('deriveBudgetLineItems', () => {
  const lines = [
    { category: 'Video', estimatedEur: 8400, actualEur: 8120 },
    { category: 'Leer', estimatedEur: 0 },
  ]
  it('eine Pauschale je Kategorie, 0-Beträge fallen weg', () => {
    const li = deriveBudgetLineItems(lines)
    expect(li).toHaveLength(1)
    expect(li[0]).toMatchObject({ name: 'Video', unitName: 'Pauschale', unitNetPrice: 8400, quantity: 1 })
  })
  it('basis actual nutzt Ist-Wert', () => {
    expect(deriveBudgetLineItems(lines, 19, 'actual')[0].unitNetPrice).toBe(8120)
  })
})

describe('flatLineItem', () => {
  it('baut eine Pauschal-Position', () => {
    expect(flatLineItem('Transport', 120)).toMatchObject({ name: 'Transport', unitNetPrice: 120, taxRatePercent: 19 })
  })
})
