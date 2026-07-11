/**
 * Brücke Shell-Projekt → Lexware-Beleg. Setzt aus dem Projekt (Rechnungskontakt,
 * Belegkopf, Inventar-/Budget-Positionen) einen neutralen `BillingDoc` zusammen,
 * den `@avplan/lexware-core` in eine Angebots-/Rechnungs-Payload mappt.
 */
import {
  deriveBudgetLineItems,
  deriveInventoryLineItems,
  type BillingContact,
  type BillingDoc,
  type BillingLineItem,
  type LexwareDocKind,
} from '@avplan/lexware-core'
import { billToContact, resolveBilling, type Contact, type SuiteProject } from './project'

/** Woraus die Positionen abgeleitet werden. */
export type LineSource = 'inventory' | 'budget'

export function toBillingContact(c: Contact): BillingContact {
  return {
    name: c.org && c.org !== 'Produktion' ? `${c.name} · ${c.org}` : c.name,
    email: c.email,
    phone: c.phone,
    street: c.street,
    zip: c.zip,
    city: c.city,
    countryCode: c.countryCode ?? 'DE',
    vatId: c.vatId,
    customerNumber: c.customerNumber,
    contactId: c.lexofficeContactId,
  }
}

/** Positionen aus dem Projekt ableiten (Inventar-Tagesmiete oder Budget-Pauschalen). */
export function deriveLineItems(project: SuiteProject, source: LineSource): BillingLineItem[] {
  const b = resolveBilling(project.show)
  if (source === 'budget') {
    return deriveBudgetLineItems(project.show.budget, b.taxRatePercent)
  }
  return deriveInventoryLineItems(project.inventory.items, b.rentalDays, b.taxRatePercent)
}

/** Add N Tage auf ein ISO-Datum (YYYY-MM-DD) — ohne Date.now, deterministisch. */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const base = Date.UTC(y, (m ?? 1) - 1, d ?? 1)
  const next = new Date(base + days * 86_400_000)
  return next.toISOString().slice(0, 10)
}

export interface BuildDocOptions {
  kind: LexwareDocKind
  /** Belegdatum ISO (YYYY-MM-DD) — von außen reingereicht (kein Date.now hier). */
  voucherDate: string
  source: LineSource
  /** Optional: bereits bearbeitete Positionen statt Ableitung. */
  lineItems?: BillingLineItem[]
  /** Optional: expliziter Empfänger statt billTo-Kontakt. */
  contact?: BillingContact
}

/**
 * Vollständigen Beleg zusammensetzen. Wirft, wenn kein Rechnungsempfänger
 * gesetzt ist (kein billTo-Kontakt und kein contact-Override).
 */
export function buildBillingDoc(project: SuiteProject, opts: BuildDocOptions): BillingDoc {
  const b = resolveBilling(project.show)
  const contact = opts.contact ?? (() => {
    const c = billToContact(project.show)
    if (!c) throw new Error('Kein Rechnungsempfänger gesetzt — Kontakt als „Rechnungsempfänger" markieren.')
    return toBillingContact(c)
  })()

  const lineItems = opts.lineItems ?? deriveLineItems(project, opts.source)

  const doc: BillingDoc = {
    kind: opts.kind,
    contact,
    taxType: b.taxType,
    currency: 'EUR',
    voucherDate: opts.voucherDate,
    title: project.meta.name,
    introduction: b.introduction,
    remark: b.remark,
    lineItems,
  }
  if (opts.kind === 'quotation') {
    doc.expirationDate = addDaysIso(opts.voucherDate, b.quoteValidDays)
  } else {
    doc.paymentTermDays = b.paymentTermDays
    doc.paymentTermLabel = `Zahlbar innerhalb von ${b.paymentTermDays} Tagen ohne Abzug`
  }
  return doc
}
