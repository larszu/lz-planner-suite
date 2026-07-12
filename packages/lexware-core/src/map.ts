/**
 * Reines Mapping vom neutralen Beleg-Modell auf die Lexware-API-Payloads.
 * Keine Seiteneffekte, keine Netz-Zugriffe — voll unit-testbar.
 */
import type {
  BillingContact,
  BillingDoc,
  BillingLineItem,
  LxAddress,
  LxInvoice,
  LxLineItem,
  LxQuotation,
  TaxType,
} from './types.js'

const DEFAULT_COUNTRY = 'DE'

/** Kaufmännisch auf 2 Nachkommastellen runden. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function toAddress(c: BillingContact): LxAddress {
  const addr: LxAddress = {
    name: c.name,
    countryCode: c.countryCode ?? DEFAULT_COUNTRY,
  }
  if (c.contactId) addr.contactId = c.contactId
  if (c.supplement) addr.supplement = c.supplement
  if (c.street) addr.street = c.street
  if (c.zip) addr.zip = c.zip
  if (c.city) addr.city = c.city
  return addr
}

function toLxLineItem(item: BillingLineItem, taxType: TaxType): LxLineItem {
  // Das neutrale Modell trägt ausschließlich Netto-Einzelpreise. Für einen
  // Brutto-Beleg erwartet Lexware in grossAmount aber den steuer-INKLUSIVEN
  // Preis — daher hochrechnen, sonst rechnet Lexware aus dem Netto-Preis
  // rückwärts und der Beleg unterfakturiert die USt.
  const price =
    taxType === 'gross'
      ? { currency: 'EUR' as const, grossAmount: round2(item.unitNetPrice * (1 + item.taxRatePercent / 100)), taxRatePercentage: item.taxRatePercent }
      : { currency: 'EUR' as const, netAmount: round2(item.unitNetPrice), taxRatePercentage: taxType === 'vatfree' ? 0 : item.taxRatePercent }
  const lx: LxLineItem = {
    type: 'custom',
    name: item.name,
    quantity: item.quantity,
    unitName: item.unitName,
    unitPrice: price,
  }
  if (item.description) lx.description = item.description
  if (item.discountPercent && item.discountPercent > 0) lx.discountPercentage = item.discountPercent
  return lx
}

/** Nettosumme eines Belegs (nach Rabatt, ohne Steuer) — für Vorschau/Anzeige. */
export function netTotal(doc: BillingDoc): number {
  return round2(
    doc.lineItems.reduce((sum, i) => {
      const line = i.unitNetPrice * i.quantity
      const afterDiscount = line * (1 - (i.discountPercent ?? 0) / 100)
      return sum + afterDiscount
    }, 0),
  )
}

/** Steuerbetrag eines Belegs — 0 bei taxType 'vatfree'. */
export function taxTotal(doc: BillingDoc): number {
  if (doc.taxType === 'vatfree') return 0
  return round2(
    doc.lineItems.reduce((sum, i) => {
      const line = i.unitNetPrice * i.quantity * (1 - (i.discountPercent ?? 0) / 100)
      return sum + line * (i.taxRatePercent / 100)
    }, 0),
  )
}

/** Bruttosumme (Netto + Steuer). */
export function grossTotal(doc: BillingDoc): number {
  return round2(netTotal(doc) + taxTotal(doc))
}

function assertValid(doc: BillingDoc): void {
  if (!doc.contact?.name) throw new Error('Beleg braucht einen Empfänger-Namen (contact.name).')
  if (!doc.voucherDate) throw new Error('Beleg braucht ein Belegdatum (voucherDate).')
  if (!doc.lineItems?.length) throw new Error('Beleg braucht mindestens eine Position.')
}

/** BillingDoc → Lexware-Angebot-Payload. */
export function buildQuotation(doc: BillingDoc): LxQuotation {
  assertValid(doc)
  const q: LxQuotation = {
    archived: false,
    voucherDate: doc.voucherDate,
    address: toAddress(doc.contact),
    lineItems: doc.lineItems.map((i) => toLxLineItem(i, doc.taxType)),
    totalPrice: { currency: doc.currency ?? 'EUR' },
    taxConditions: { taxType: doc.taxType },
  }
  if (doc.expirationDate) q.expirationDate = doc.expirationDate
  if (doc.title) q.title = doc.title
  if (doc.introduction) q.introduction = doc.introduction
  if (doc.remark) q.remark = doc.remark
  return q
}

/** BillingDoc → Lexware-Rechnung-Payload. */
export function buildInvoice(doc: BillingDoc): LxInvoice {
  assertValid(doc)
  const inv: LxInvoice = {
    archived: false,
    voucherDate: doc.voucherDate,
    address: toAddress(doc.contact),
    lineItems: doc.lineItems.map((i) => toLxLineItem(i, doc.taxType)),
    totalPrice: { currency: doc.currency ?? 'EUR' },
    taxConditions: { taxType: doc.taxType },
  }
  if (doc.paymentTermDays != null || doc.paymentTermLabel) {
    inv.paymentConditions = {}
    if (doc.paymentTermLabel) inv.paymentConditions.paymentTermLabel = doc.paymentTermLabel
    if (doc.paymentTermDays != null) inv.paymentConditions.paymentTermDuration = doc.paymentTermDays
  }
  if (doc.title) inv.title = doc.title
  if (doc.introduction) inv.introduction = doc.introduction
  if (doc.remark) inv.remark = doc.remark
  return inv
}

/** Bequemer Dispatch nach doc.kind. */
export function buildPayload(doc: BillingDoc): LxQuotation | LxInvoice {
  return doc.kind === 'invoice' ? buildInvoice(doc) : buildQuotation(doc)
}
