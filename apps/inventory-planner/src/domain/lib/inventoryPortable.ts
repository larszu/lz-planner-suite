// ───────────────────────────────────────────────────────────────────────────
// Portables Lager-Format — App-übergreifender Austausch (cable/light/multicam).
//
// Ein Lager, das in einem Planer angelegt wurde, soll in den anderen
// importierbar sein. Das Format ist bewusst schlank + versioniert und enthält
// nur die reinen Daten (items/nodes/sets/units) — keine App-Interna. Artikel
// werden per Freitext (manufacturer/model) + Label-`code` identifiziert; ein
// Katalog-GUID-Bezug ist bewusst nicht Teil des Formats.
// ───────────────────────────────────────────────────────────────────────────
import type { InventoryItem, StorageNode, InventorySet, InventoryUnit } from '../types/inventory'

export const INVENTORY_FORMAT = 'avplan-inventory'
// Version 2 (ADR-002): `InventoryItem.deviceTypeId`. Die Erhoehung ist kein
// Formalismus — `inventoryStore.healItem` baut jeden Artikel Feld fuer Feld
// neu auf, ein Stand ohne dieses Feld wuerde es beim Re-Export also STILL
// verlieren. Mit der Version weigert er sich stattdessen (siehe unten:
// `f.version > INVENTORY_FORMAT_VERSION`). Aeltere Dateien lesen wir weiter.
//
// ADR-005, Inkrement 4 — der Satz oben deckt nur EINE Richtung ab: eine zu
// NEUE Datei, die dieser Stand nicht vollstaendig versteht. Die andere fehlte:
// eine zu ALTE Datei, die beim Zusammenfuehren etwas WEGNIMMT. Genau das tat
// der Import — er ersetzte den lokalen Artikel als Ganzes, eine v1-Datei
// loeschte also die bestaetigte deviceTypeId. Dafuer ist jetzt
// `lib/inventoryMerge.ts` da; die Version kann das nicht leisten, weil eine
// alte Datei zu lesen ausdruecklich erlaubt bleibt.
//
// Version 3 (Bedarf 107): `InventoryUnit.houseRef` — die haus-eigene Referenz
// neben der Hersteller-Seriennummer. Dieselbe Begruendung wie bei Version 2,
// eine Ebene tiefer: `inventoryStore.healUnit` baut jede Einheit Feld fuer
// Feld neu auf. Ein Planer, der `houseRef` nicht kennt, wuerde eine Datei mit
// Hausreferenzen still ohne sie zurueckschreiben — und die Nummer, die auf dem
// Case klebt, waere weg. Mit der erhoehten Version weigert er sich stattdessen
// zu lesen, und das ist die ehrlichere Antwort. Aeltere Dateien (v1/v2) lesen
// wir unveraendert weiter; ihre Einheiten haben schlicht keine Hausreferenz.
//
// Version 4 (Bedarf 118): `InventoryUnit.anschaffung`,
// `InventoryUnit.versicherungswert` und `InventoryItem.ursprungsland` — die
// Angaben, aus denen Versicherungsliste und Carnet-Datenblatt entstehen.
// Dieselbe Begruendung wie bei 2 und 3, und hier die teuerste: `healUnit` baut
// jede Einheit Feld fuer Feld neu auf. Ein Planer, der die Werte nicht kennt,
// schriebe eine Datei mit Versicherungswerten still ohne sie zurueck — und der
// Freiberufler haette eine Versicherungsliste, die seinen halben Bestand nicht
// mehr kennt, ohne dass ihm jemand etwas gesagt haette. Mit der erhoehten
// Version weigert sich ein aelterer Stand stattdessen zu lesen. Aeltere
// Dateien (v1-v3) lesen wir unveraendert weiter; ihre Einheiten haben schlicht
// keine Werte.
// Version 5 (B-65): `InventoryItem.mindestmenge` — ab wann das Haus
// nachbestellt oder sub-hired. Dieselbe Begruendung wie bei 2, 3 und 4, und
// sie ist hier keine Formalie: `inventoryStore.healItem` baut JEDEN Artikel
// Feld fuer Feld neu auf. Ein Stand, der das Feld nicht kennt, laese eine
// Datei mit gepflegten Mindestmengen ein und schriebe sie still ohne sie
// zurueck — und die Kachel „Unter Ziel" meldete danach Entwarnung fuer ein
// Lager, in dem niemand mehr eine Mindestmenge hinterlegt hat. Das ist die
// teuerste Form des Verlusts: keine Fehlermeldung, sondern eine gruene Zahl.
//
// Mit der erhoehten Version weigert sich ein aelterer Stand stattdessen zu
// lesen (siehe `f.version > INVENTORY_FORMAT_VERSION` unten). Aeltere
// Dateien (v1-v4) lesen wir unveraendert weiter; ihre Artikel haben schlicht
// keine Mindestmenge, und das ist nicht 0, sondern UNBEWERTET.
//
// DIE ZWEITE STELLE, an der dieselbe Zahl steht, ist
// `cable-planner/src/renderer/lager/lib/inventoryPortable.ts` — dort liegt
// dasselbe Format byte-gleich, und dort haelt `tests/inventoryContract.test.ts`
// die Feldliste fest. Beide zusammen oder keines: eine Datei aus dem Lager,
// die der Planer nicht mehr liest, ist schlimmer als ein fehlendes Feld.
// Version 6 (B-65): `InventoryUnit.fristen` — was an einer Einheit
// turnusmaessig faellig ist (DGUV-V3-Pruefung, Kalibrierung, Wartung,
// Akku). Dieselbe Begruendung wie bei 2 bis 5, eine Ebene tiefer:
// `inventoryStore.healUnit` baut JEDE Einheit Feld fuer Feld neu auf. Ein
// Stand, der das Feld nicht kennt, laese eine Datei mit gepflegten
// Pruefterminen ein und schriebe sie still ohne sie zurueck — und die
// Fristen-Ampel meldete danach fuer jedes Geraet „keine Frist hinterlegt".
//
// Das wiegt hier schwerer als bei jedem Feld davor. Eine verlorene
// Mindestmenge kostet eine Nachbestellung; eine verlorene DGUV-V3-Frist
// stellt ein ungepruefetes Geraet auf eine Veranstaltung. Die Anwendung
// wuerde in dem Moment nicht schweigen, sondern das Gegenteil sagen: „nichts
// faellig".
//
// Mit der erhoehten Version weigert sich ein aelterer Stand stattdessen zu
// lesen. Aeltere Dateien (v1-v5) lesen wir unveraendert weiter; ihre
// Einheiten haben schlicht keine Fristen, und das ist nicht „geprueft",
// sondern UNBEWERTET — `fristenLage` zaehlt sie getrennt.
export const INVENTORY_FORMAT_VERSION = 6

export interface InventorySnapshot {
  items: InventoryItem[]
  nodes: StorageNode[]
  sets: InventorySet[]
  units: InventoryUnit[]
}

interface PortableFile extends InventorySnapshot {
  format: typeof INVENTORY_FORMAT
  version: number
  /** ISO-Zeitstempel (vom Aufrufer gesetzt — hier keine Uhr). */
  exportedAt?: string
  /** Ursprungs-App (cable/light/multicam), rein informativ. */
  app?: string
}

/** Serialisiert einen Snapshot als portables JSON. */
export const serializeInventory = (snap: InventorySnapshot, meta?: { exportedAt?: string; app?: string }): string => {
  const file: PortableFile = {
    format: INVENTORY_FORMAT,
    version: INVENTORY_FORMAT_VERSION,
    exportedAt: meta?.exportedAt,
    app: meta?.app,
    items: snap.items,
    nodes: snap.nodes,
    sets: snap.sets,
    units: snap.units,
  }
  return JSON.stringify(file, null, 2)
}

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

/**
 * Parst portables JSON zu einem Snapshot. Tolerant gegenüber fehlenden
 * Teil-Arrays, aber strikt beim Format-Marker — fremde/kaputte Dateien → null.
 * Heilung/Validierung der Einzel-Felder übernimmt der Store beim Import
 * (dieselbe Logik wie beim Laden aus localStorage).
 */
export const parseInventory = (json: string): InventorySnapshot | null => {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null
  const f = data as Partial<PortableFile>
  if (f.format !== INVENTORY_FORMAT) return null
  if (typeof f.version !== 'number' || f.version > INVENTORY_FORMAT_VERSION) return null
  return {
    items: arr<InventoryItem>(f.items),
    nodes: arr<StorageNode>(f.nodes),
    sets: arr<InventorySet>(f.sets),
    units: arr<InventoryUnit>(f.units),
  }
}
