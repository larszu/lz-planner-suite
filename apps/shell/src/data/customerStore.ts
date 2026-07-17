/**
 * Stammdaten-Adressbuch: wiederverwendbare Kunden über Projekte hinweg. Ein
 * Kunde wird einmal angelegt und kann in jedem Projekt als Rechnungsempfänger
 * geladen werden — statt Adresse/USt-IdNr pro Show neu einzutippen.
 *
 * Ablage: localStorage `avplan.customers` = Customer[].
 */
import type { Contact } from './project'

const KEY = 'avplan.customers'

export interface Customer {
  id: string
  name: string
  email?: string
  street?: string
  zip?: string
  city?: string
  countryCode?: string
  vatId?: string
  customerNumber?: string
  /** Lexware-Kontakt-UUID, falls dort schon vorhanden. */
  lexofficeContactId?: string
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {
    /* fällt durch */
  }
  return `c_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`
}

function read(): Customer[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as unknown
    if (!Array.isArray(list)) return []
    return list.filter((c): c is Customer => !!c && typeof (c as Customer).id === 'string' && typeof (c as Customer).name === 'string')
  } catch {
    return []
  }
}

function write(list: Customer[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* Storage voll/gesperrt */
  }
}

export function listCustomers(): Customer[] {
  return [...read()].sort((a, b) => a.name.localeCompare(b.name))
}

/** Kunde anlegen/aktualisieren (Match über id, sonst über gleichen Namen). */
export function upsertCustomer(input: Omit<Customer, 'id'> & { id?: string }): Customer {
  const list = read()
  const id = input.id ?? list.find((c) => c.name.trim().toLowerCase() === input.name.trim().toLowerCase())?.id ?? newId()
  const next: Customer = { ...input, id }
  const i = list.findIndex((c) => c.id === id)
  if (i >= 0) list[i] = next
  else list.push(next)
  write(list)
  return next
}

export function deleteCustomer(id: string): void {
  write(read().filter((c) => c.id !== id))
}

/** Rechnungsdaten aus einem Kontakt für die Adressbuch-Ablage. */
export function customerFromContact(c: Contact): Omit<Customer, 'id'> {
  return {
    name: c.name,
    email: c.email,
    street: c.street,
    zip: c.zip,
    city: c.city,
    countryCode: c.countryCode,
    vatId: c.vatId,
    customerNumber: c.customerNumber,
    lexofficeContactId: c.lexofficeContactId,
  }
}

/** Adressbuch-Kunde → Kontakt-Rechnungsfelder (für „laden"). */
export function contactPatchFromCustomer(c: Customer): Partial<Contact> {
  return {
    name: c.name,
    email: c.email,
    street: c.street,
    zip: c.zip,
    city: c.city,
    countryCode: c.countryCode,
    vatId: c.vatId,
    customerNumber: c.customerNumber,
    lexofficeContactId: c.lexofficeContactId,
  }
}
