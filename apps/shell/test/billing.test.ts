import { describe, it, expect } from 'vitest'
import { buildQuotation, grossTotal } from '@avplan/lexware-core'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROJECT, resolveBilling } from '../src/data/project'
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

  it('akzeptiert ein lokalisiertes Zahlungsziel-Label', () => {
    const doc = buildBillingDoc(PROJECT, {
      kind: 'invoice',
      voucherDate: '2026-07-11',
      source: 'budget',
      paymentTermLabel: 'Payable within 14 days',
    })
    expect(doc.paymentTermLabel).toBe('Payable within 14 days')
  })

  it('wirft ohne Rechnungsempfänger', () => {
    const noBillTo = { ...PROJECT, show: { ...PROJECT.show, contacts: PROJECT.show.contacts.map((c) => ({ ...c, billTo: false })) } }
    expect(() => buildBillingDoc(noBillTo, { kind: 'invoice', voucherDate: '2026-07-11', source: 'budget' })).toThrow()
  })
})

// ───────────────────────────────────────────────────────────────────────────
// EIN BELEG-BAUER (Bedarf 99)
//
// Der Beleg-Dialog hat den `BillingDoc` frueher selbst zusammengesetzt —
// dieselbe Struktur ein zweites Mal, mit eigenen Feldern und einem eigenen
// Zahlungsziel-Satz. `buildBillingDoc` lief damit nur noch in den Tests
// darueber: die Waechter prueften einen Weg, den kein Nutzer nimmt, und der
// Weg, den er nimmt, war ungeprueft.
//
// Und der Rueckfall dieser Funktion war ein fest verdrahteter DEUTSCHER Satz.
// Bedarf 99 verlangt das Gegenteil: „BillingDoc must carry due date and
// payment terms as structured data, not prose." Die Zahl steht in
// `paymentTermDays`; der Satz ist ihre Darstellung und gehoert an die
// Oberflaeche, die uebersetzen kann.
// ───────────────────────────────────────────────────────────────────────────

const dialogQuelle = readFileSync(
  join(__dirname, '..', 'src', 'shell', 'BillingModal.tsx'),
  'utf8',
)

describe('ein Beleg-Bauer, nicht zwei', () => {
  it('setzt der Dialog keinen Beleg selbst zusammen', () => {
    // Gemessen wird die REGEL und kein Vorkommen: im Dialog darf kein Wert
    // vom Typ `BillingDoc` gebaut werden. Wer das wieder tut, baut die zweite
    // Rechnung zurueck — und sie waere wieder die ungepruefte.
    expect(dialogQuelle).not.toMatch(/:\s*BillingDoc\s*=\s*\{/)
    expect(dialogQuelle).toContain('buildBillingDoc(project, {')
  })

  it('kommt der Zahlungsziel-Satz aus der Uebersetzung', () => {
    // Der Satz darf im Dialog stehen — dort ist er uebersetzbar. Was nicht
    // sein darf: ein zweiter, fest verdrahteter daneben.
    expect(dialogQuelle).toMatch(/paymentTermLabel:\s*format\(\s*\n?\s*t\(/)
  })

  it('erfindet der Bauer keinen deutschen Satz', () => {
    // Ohne Label traegt der Beleg nur die Dauer. Frueher stand hier
    // „Zahlbar innerhalb von N Tagen ohne Abzug" — auf einem Beleg, den ein
    // englischsprachiger Nutzer verschickt.
    const doc = buildBillingDoc(PROJECT, {
      kind: 'invoice',
      voucherDate: '2026-07-11',
      source: 'budget',
    })
    expect(doc.paymentTermLabel).toBeUndefined()
    expect(doc.paymentTermDays).toBe(14)
    // Und nirgends sonst im Beleg steht der Satz.
    expect(JSON.stringify(doc)).not.toContain('Zahlbar innerhalb')
  })

  it('kennt die Bauer-Quelle den Satz gar nicht mehr', () => {
    const bauerQuelle = readFileSync(
      join(__dirname, '..', 'src', 'data', 'billing.ts'),
      'utf8',
    )
    // Kommentarzeilen weg — der Kopf ERKLAERT den entfernten Satz und darf
    // den Waechter nicht rot machen.
    const code = bauerQuelle
      .split('\n')
      .filter((z) => !/^\s*(\/\/|\*|\/\*)/.test(z))
      .join('\n')
    expect(code).not.toContain('Zahlbar innerhalb')
  })
})

describe('was der Aufrufer setzt, gewinnt', () => {
  const basis = { kind: 'invoice' as const, voucherDate: '2026-07-11', source: 'budget' as const }

  it('Besteuerung, Zahlungsziel und Gueltigkeit', () => {
    const rechnung = buildBillingDoc(PROJECT, { ...basis, taxType: 'vatfree', paymentTermDays: 30 })
    expect(rechnung.taxType).toBe('vatfree')
    expect(rechnung.paymentTermDays).toBe(30)
    const angebot = buildBillingDoc(PROJECT, { ...basis, kind: 'quotation', quoteValidDays: 7 })
    expect(angebot.expirationDate).toBe('2026-07-18')
  })

  it('bleibt ein GELEERTES Textfeld leer', () => {
    // `undefined` heisst „nimm die Projekt-Vorgabe", ein leerer String heisst
    // „der Nutzer hat das Feld geleert". Mit `||` fielen die beiden zusammen,
    // und der geloeschte Schlusstext staende beim Erzeugen wieder da.
    const geleert = buildBillingDoc(PROJECT, { ...basis, introduction: '', remark: '' })
    expect(geleert.introduction).toBe('')
    expect(geleert.remark).toBe('')
    const ohneAngabe = buildBillingDoc(PROJECT, basis)
    expect(ohneAngabe.remark).toBe(resolveBilling(PROJECT.show).remark)
  })
})
