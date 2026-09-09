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
  type TaxType,
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

/**
 * Was der Aufrufer setzt — und was aus den Beleg-Einstellungen des Projekts
 * kommt, wenn er nichts sagt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * `undefined` UND LEER SIND NICHT DASSELBE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Bei `introduction` und `remark` entscheidet der Unterschied darüber, was auf
 * dem Beleg steht. `undefined` heisst „der Aufrufer sagt nichts, nimm die
 * Vorgabe des Projekts"; ein LEERER String heisst „der Nutzer hat das Feld
 * geleert". Die beiden zusammenzuwerfen (etwa mit `||`) hiesse: der Nutzer
 * löscht den Schlusstext, und beim Erzeugen steht er wieder da.
 */
export interface BuildDocOptions {
  kind: LexwareDocKind
  /** Belegdatum ISO (YYYY-MM-DD) — von außen reingereicht (kein Date.now hier). */
  voucherDate: string
  source: LineSource
  /** Optional: bereits bearbeitete Positionen statt Ableitung. */
  lineItems?: BillingLineItem[]
  /** Optional: expliziter Empfänger statt billTo-Kontakt. */
  contact?: BillingContact
  /** Optional: Besteuerung statt der Projekt-Vorgabe. */
  taxType?: TaxType
  /** Optional: Einleitungstext. Leerer String = bewusst leer, siehe oben. */
  introduction?: string
  /** Optional: Schlusstext. Leerer String = bewusst leer, siehe oben. */
  remark?: string
  /** Nur Angebot: Gültigkeit in Tagen statt der Projekt-Vorgabe. */
  quoteValidDays?: number
  /** Nur Rechnung: Zahlungsziel in Tagen statt der Projekt-Vorgabe. */
  paymentTermDays?: number
  /**
   * Nur Rechnung: das Zahlungsziel als SATZ, für den Beleg.
   *
   * KEINE VORGABE, UND DAS IST DER PUNKT (Bedarf 99). Hier stand ein
   * fest verdrahteter deutscher Satz als Rückfall — auf einem Beleg, den ein
   * englischsprachiger Nutzer verschickt, eine deutsche Zeile, an der keine
   * Übersetzung vorbeikommt. Der Satz ist ausserdem eine ZWEITE Rechnung
   * derselben Angabe: die Zahl steht schon in `paymentTermDays`, und der Satz
   * ist bloss ihre Darstellung. Prosa gehört an die Oberfläche, die
   * übersetzen kann; das Dokument trägt die Zahl.
   *
   * Fehlt das Label, trägt der Beleg nur die Dauer — strukturiert, wie es
   * Bedarf 99 verlangt.
   */
  paymentTermLabel?: string
}

/**
 * Vollständigen Beleg zusammensetzen. Wirft, wenn kein Rechnungsempfänger
 * gesetzt ist (kein billTo-Kontakt und kein contact-Override).
 *
 * DAS IST DER EINE BAUER. Der Beleg-Dialog hat den Beleg früher selbst
 * zusammengesetzt — dieselbe Struktur, mit eigenen Feldern und einem eigenen
 * Zahlungsziel-Satz. Diese Funktion lief damit nur noch in den Tests: die
 * Wächter prüften einen Weg, den kein Nutzer nimmt, und der Weg, den er
 * nimmt, war ungeprüft. Wer hier etwas ergänzt, ergänzt es für beide.
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
    taxType: opts.taxType ?? b.taxType,
    currency: 'EUR',
    voucherDate: opts.voucherDate,
    title: project.meta.name,
    // `??` und nicht `||`: ein geleertes Feld bleibt geleert.
    introduction: opts.introduction ?? b.introduction,
    remark: opts.remark ?? b.remark,
    lineItems,
  }
  if (opts.kind === 'quotation') {
    doc.expirationDate = addDaysIso(opts.voucherDate, opts.quoteValidDays ?? b.quoteValidDays)
  } else {
    doc.paymentTermDays = opts.paymentTermDays ?? b.paymentTermDays
    if (opts.paymentTermLabel) doc.paymentTermLabel = opts.paymentTermLabel
  }
  return doc
}
