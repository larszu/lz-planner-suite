import { describe, it, expect } from 'vitest'
import {
  buildInvoice,
  buildQuotation,
  buildPayload,
  grossTotal,
  netTotal,
  taxTotal,
  type BillingDoc,
} from '../src/index'

const base: BillingDoc = {
  kind: 'quotation',
  taxType: 'net',
  voucherDate: '2026-07-11',
  contact: { name: 'Nordlicht Events', street: 'Hafenstr. 1', zip: '20359', city: 'Hamburg' },
  lineItems: [
    { name: '12G-SDI 50 m', quantity: 8, unitName: 'Tag', unitNetPrice: 12, taxRatePercent: 19 },
    { name: 'Transport', quantity: 1, unitName: 'Pauschale', unitNetPrice: 100, taxRatePercent: 19, discountPercent: 10 },
  ],
}

describe('Summen', () => {
  it('rechnet Netto/Steuer/Brutto inkl. Rabatt korrekt', () => {
    // 8×12 = 96 ; 100×0.9 = 90 → netto 186
    expect(netTotal(base)).toBe(186)
    // 19 % auf 186 = 35.34
    expect(taxTotal(base)).toBe(35.34)
    expect(grossTotal(base)).toBe(221.34)
  })

  it('vatfree (Kleinunternehmer) hat keine Steuer', () => {
    expect(taxTotal({ ...base, taxType: 'vatfree' })).toBe(0)
    expect(grossTotal({ ...base, taxType: 'vatfree' })).toBe(186)
  })
})

describe('buildQuotation', () => {
  it('erzeugt eine gültige Angebots-Payload (netto)', () => {
    const q = buildQuotation({ ...base, expirationDate: '2026-07-25', title: 'Angebot Sommershow' })
    expect(q.archived).toBe(false)
    expect(q.voucherDate).toBe('2026-07-11')
    expect(q.expirationDate).toBe('2026-07-25')
    expect(q.taxConditions.taxType).toBe('net')
    expect(q.totalPrice.currency).toBe('EUR')
    expect(q.address.name).toBe('Nordlicht Events')
    expect(q.address.countryCode).toBe('DE')
    expect(q.lineItems[0].unitPrice?.netAmount).toBe(12)
    expect(q.lineItems[0].unitPrice?.taxRatePercentage).toBe(19)
    expect(q.lineItems[1].discountPercentage).toBe(10)
  })

  it('nutzt contactId statt Inline-Adresse, wenn vorhanden', () => {
    const q = buildQuotation({ ...base, contact: { ...base.contact, contactId: 'abc-123' } })
    expect(q.address.contactId).toBe('abc-123')
  })
})

describe('buildInvoice', () => {
  it('setzt grossAmount (netto hochgerechnet) bei taxType gross und Zahlungsziel', () => {
    const inv = buildInvoice({
      ...base,
      kind: 'invoice',
      taxType: 'gross',
      paymentTermDays: 14,
      paymentTermLabel: 'Zahlbar in 14 Tagen',
    })
    // Netto 12 € + 19 % → brutto 14,28 € (Lexware erwartet den Brutto-Preis).
    expect(inv.lineItems[0].unitPrice?.grossAmount).toBe(14.28)
    expect(inv.lineItems[0].unitPrice?.netAmount).toBeUndefined()
    expect(inv.paymentConditions?.paymentTermDuration).toBe(14)
    expect(inv.paymentConditions?.paymentTermLabel).toBe('Zahlbar in 14 Tagen')
  })

  it('vatfree erzwingt taxRatePercentage 0', () => {
    const inv = buildInvoice({ ...base, kind: 'invoice', taxType: 'vatfree' })
    expect(inv.lineItems[0].unitPrice?.taxRatePercentage).toBe(0)
    expect(inv.lineItems[0].unitPrice?.netAmount).toBe(12)
  })
})

describe('buildPayload / Validierung', () => {
  it('dispatcht nach kind', () => {
    expect(buildPayload({ ...base, kind: 'invoice' })).toHaveProperty('archived', false)
  })
  it('wirft ohne Empfänger, Datum oder Position', () => {
    expect(() => buildQuotation({ ...base, contact: { name: '' } })).toThrow()
    expect(() => buildQuotation({ ...base, voucherDate: '' })).toThrow()
    expect(() => buildQuotation({ ...base, lineItems: [] })).toThrow()
  })
})
