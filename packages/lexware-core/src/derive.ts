/**
 * Ableitung von Beleg-Positionen aus Projektdaten. Neutral gehalten (kein Import
 * aus Shell/Planer), damit das Paket von beiden Seiten nutzbar bleibt. Alles rein.
 */
import type { BillingLineItem, TaxRatePercent } from './types.js'

const DEFAULT_TAX: TaxRatePercent = 19

/** Minimaler Inventar-Ausschnitt (kompatibel zu @avplan/inventory-core InventoryItem). */
export interface DerivableInventoryItem {
  model: string
  quantity: number
  rentPricePerDay?: number
  category?: string
}

/**
 * Vermiet-Positionen aus dem Inventar: nur Artikel mit `rentPricePerDay`.
 * Preis = Tagespreis × Miettage; Menge = Stückzahl; Einheit 'Tag'.
 */
export function deriveInventoryLineItems(
  items: DerivableInventoryItem[],
  rentalDays = 1,
  taxRatePercent: TaxRatePercent = DEFAULT_TAX,
): BillingLineItem[] {
  const days = Math.max(1, Math.round(rentalDays))
  return items
    .filter((it) => typeof it.rentPricePerDay === 'number' && it.rentPricePerDay > 0)
    .map((it) => ({
      name: it.model,
      description: days > 1 ? `${days} Tage Miete` : 'Tagesmiete',
      quantity: it.quantity,
      unitName: 'Tag',
      unitNetPrice: (it.rentPricePerDay as number) * days,
      taxRatePercent,
    }))
}

/** Budgetzeile (kompatibel zu Shell BudgetLine). */
export interface DerivableBudgetLine {
  category: string
  estimatedEur: number
  actualEur?: number
}

/**
 * Grobe Positionen aus dem Budget: eine Pauschale je Kategorie. `basis` wählt,
 * ob Schätz- oder Ist-Wert verwendet wird.
 */
export function deriveBudgetLineItems(
  lines: DerivableBudgetLine[],
  taxRatePercent: TaxRatePercent = DEFAULT_TAX,
  basis: 'estimated' | 'actual' = 'estimated',
): BillingLineItem[] {
  return lines
    .map((l) => ({
      category: l.category,
      amount: basis === 'actual' && typeof l.actualEur === 'number' ? l.actualEur : l.estimatedEur,
    }))
    .filter((l) => l.amount > 0)
    .map((l) => ({
      name: l.category,
      quantity: 1,
      unitName: 'Pauschale',
      unitNetPrice: l.amount,
      taxRatePercent,
    }))
}

/** Freitext-Position (z. B. Transportpauschale). */
export function flatLineItem(
  name: string,
  netPrice: number,
  taxRatePercent: TaxRatePercent = DEFAULT_TAX,
): BillingLineItem {
  return { name, quantity: 1, unitName: 'Pauschale', unitNetPrice: netPrice, taxRatePercent }
}
