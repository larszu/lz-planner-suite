// ───────────────────────────────────────────────────────────────────────────
// Die Grenze zum Plan (ADR-006, „Der Vertrag ‚Lager'").
//
// Das Lager kennt KEIN `EquipmentItem`. Im Cable-Planner las der Bestands-Store
// die Plan-Geräte direkt und rief `deriveDemand` selbst auf — solange beide im
// selben Repo lagen, war das nur unschön. Über eine Repo-Grenze hinweg wäre es
// der Kabelbaum, gegen den ADR-006 geschrieben ist: das Lager müsste dem
// Kabelplan folgen, jedes Mal wenn dieser sein Geräte-Modell ändert.
//
// Der Plan rechnet seinen Bedarf deshalb SELBST aus und reicht Zeilen herüber.
// Was in einer Zeile steht, ist genau das, was zum Anlegen einer Lagerposition
// nötig ist — und nicht mehr. `equipmentIds`, `typeTargetIds`, `fromRacks`:
// alles Buchführung des Plans über sich selbst, und sie bleibt dort.
// ───────────────────────────────────────────────────────────────────────────
import type { InventoryOwnership } from './inventory'

/**
 * Was der Plan über ein Muster-Gerät der Zeile weiß.
 *
 * Alles optional, und das ist der Punkt: fehlt eine Angabe, wird sie NICHT
 * geraten. Eine erfundene Miete pro Tag steht hinterher in einer Kalkulation.
 */
export interface BedarfsMuster {
  rentPricePerDay?: number
  stockLocation?: string
  supplier?: string
  ownership?: InventoryOwnership
}

/** Eine Bedarfszeile des Plans — ein Modell mit einer Menge. */
export interface BedarfsZeile {
  /** Stabiler Schlüssel der Zeile — Katalog-Id, sonst der normalisierte Name. */
  key: string
  /** Katalog-GUID, wenn der Plan sie kennt. */
  deviceTypeId?: string
  /** Modellname aus dem Katalog, sonst der Gerätename. */
  label: string
  category?: string
  quantity: number
  muster?: BedarfsMuster
}
