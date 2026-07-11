import { describe, it, expect } from 'vitest'
import { buildQuotation, grossTotal } from '@avplan/lexware-core'
import { PROJECT } from '../src/data/project'
import { addDaysIso, buildBillingDoc, deriveLineItems } from '../src/data/billing'

describe('addDaysIso', () => {
  it('addiert Tage über Monatsgrenzen', () => {
    expect(addDaysIso('2026-07-11', 14)).toBe('2026-07-25')
    expect(addDaysIso('2026-01-30', 3)).toBe('2026-02-02')
  })
})

describe('deriveLineItems', () => {
  it('Inventar: nur Artikel mit Tagespreis (Demo hat keine → leer)', () => {
    // Der Seed setzt (noch) keine rentPricePerDay → Inventar-Ableitung ist leer.
    expect(deriveLineItems(PROJECT, 'inventory')).toEqual([])
  })
  it('Budget: eine Pauschale je Kategorie', () => {
    const li = deriveLineItems(PROJECT, 'budget')
    expect(li.length).toBe(PROJECT.show.budget.length)
    expect(li[0]).toMatchObject({ unitName: 'Pauschale', quantity: 1 })
  })
})

describe('buildBillingDoc', () => {
  it('baut ein Angebot mit billTo-Kontakt, Gültig-bis und Positionen', () => {
    const doc = buildBillingDoc(PROJECT, { kind: 'quotation', voucherDate: '2026-07-11', source: 'budget' })
    expect(doc.kind).toBe('quotation')
    expect(doc.contact.name).toContain('Nordlicht Events')
    expect(doc.contact.city).toBe('Hamburg')
    expect(doc.expirationDate).toBe('2026-07-25') // 14 Tage
    expect(doc.lineItems.length).toBeGreaterThan(0)
    // Mapping in eine gültige Lexware-Payload klappt:
    const payload = buildQuotation(doc)
    expect(payload.taxConditions.taxType).toBe('net')
    expect(grossTotal(doc)).toBeGreaterThan(0)
  })

  it('Rechnung setzt Zahlungsziel statt Gültig-bis', () => {
    const doc = buildBillingDoc(PROJECT, { kind: 'invoice', voucherDate: '2026-07-11', source: 'budget' })
    expect(doc.paymentTermDays).toBe(14)
    expect(doc.expirationDate).toBeUndefined()
  })

  it('wirft ohne Rechnungsempfänger', () => {
    const noBillTo = { ...PROJECT, show: { ...PROJECT.show, contacts: PROJECT.show.contacts.map((c) => ({ ...c, billTo: false })) } }
    expect(() => buildBillingDoc(noBillTo, { kind: 'invoice', voucherDate: '2026-07-11', source: 'budget' })).toThrow()
  })
})
