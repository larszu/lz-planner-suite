/**
 * Lexware-Office-Domäne.
 *
 * Zwei Ebenen:
 *  1. **Neutrales Beleg-Modell** (`BillingDoc` …) — app-freundlich, das die Shell
 *     füllt und der Nutzer bearbeitet.
 *  2. **Lexware-API-Payloads** (`LxQuotation`/`LxInvoice` …) — die JSON-Form, die
 *     `map.ts` daraus erzeugt und der Client an `api.lexoffice.io` schickt.
 *
 * Referenz: Lexware Office (ehem. lexoffice) Public API v1.
 */

// ── Neutrales Beleg-Modell ──────────────────────────────────────────────────

export type LexwareDocKind = 'quotation' | 'invoice'

/** Besteuerung des Belegs. `vatfree` = Kleinunternehmer (§19 UStG) o. Ä. */
export type TaxType = 'net' | 'gross' | 'vatfree'

/** In Deutschland zulässige Steuersätze. */
export type TaxRatePercent = 0 | 7 | 19

export interface BillingAddress {
  /** Firmen-/Personenname (Pflicht für den Beleg). */
  name: string
  supplement?: string
  street?: string
  zip?: string
  city?: string
  /** ISO-3166-alpha-2, Default 'DE'. */
  countryCode?: string
}

/** Rechnungs-Empfänger — Adresse plus fiskalische Zusatzfelder. */
export interface BillingContact extends BillingAddress {
  /** Lexware-Kontakt-UUID, falls der Kunde dort schon existiert. */
  contactId?: string
  email?: string
  phone?: string
  /** USt-IdNr. */
  vatId?: string
  customerNumber?: string
}

/** Einzelposition eines Belegs. */
export interface BillingLineItem {
  name: string
  description?: string
  quantity: number
  /** Einheit, z. B. 'Stück', 'Tag', 'Pauschale', 'm', 'Std'. */
  unitName: string
  /** Netto-Einzelpreis in EUR. */
  unitNetPrice: number
  taxRatePercent: TaxRatePercent
  /** Rabatt in Prozent (0..100). */
  discountPercent?: number
}

/** Vollständiger, versendbarer Beleg (Angebot oder Rechnung). */
export interface BillingDoc {
  kind: LexwareDocKind
  contact: BillingContact
  taxType: TaxType
  /** Default 'EUR'. */
  currency?: 'EUR'
  /** Belegdatum (ISO-8601). */
  voucherDate: string
  title?: string
  introduction?: string
  remark?: string
  lineItems: BillingLineItem[]
  /** Nur Angebot: gültig bis (ISO-8601). */
  expirationDate?: string
  /** Nur Rechnung: Zahlungsziel in Tagen. */
  paymentTermDays?: number
  /** Nur Rechnung: Label des Zahlungsziels. */
  paymentTermLabel?: string
}

// ── Lexware-API-Payloads ────────────────────────────────────────────────────

export interface LxUnitPrice {
  currency: 'EUR'
  /** Bei taxType 'net'/'vatfree' gesetzt. */
  netAmount?: number
  /** Bei taxType 'gross' gesetzt. */
  grossAmount?: number
  taxRatePercentage: number
}

export interface LxLineItem {
  type: 'custom' | 'text'
  name: string
  description?: string
  quantity?: number
  unitName?: string
  unitPrice?: LxUnitPrice
  discountPercentage?: number
}

export interface LxAddress {
  /** Referenz auf einen bestehenden Lexware-Kontakt (statt Inline-Adresse). */
  contactId?: string
  name: string
  supplement?: string
  street?: string
  zip?: string
  city?: string
  countryCode: string
}

export interface LxTaxConditions {
  taxType: TaxType
}

export interface LxTotalPrice {
  currency: 'EUR'
}

export interface LxPaymentConditions {
  paymentTermLabel?: string
  paymentTermDuration?: number
}

interface LxVoucherBase {
  archived: false
  voucherDate: string
  address: LxAddress
  lineItems: LxLineItem[]
  totalPrice: LxTotalPrice
  taxConditions: LxTaxConditions
  title?: string
  introduction?: string
  remark?: string
}

export interface LxQuotation extends LxVoucherBase {
  expirationDate?: string
}

export interface LxInvoice extends LxVoucherBase {
  paymentConditions?: LxPaymentConditions
}

/** Antwort beim Anlegen eines Belegs/Kontakts. */
export interface LxCreateResult {
  id: string
  resourceUri?: string
  createdDate?: string
  version?: number
}
