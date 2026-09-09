import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  INVENTORY_FORMAT,
  INVENTORY_FORMAT_VERSION,
  serializeInventory,
  parseInventory,
} from '../lib/inventoryPortable'

// ───────────────────────────────────────────────────────────────────────────
// Überleben die Fristen das Neuladen und den Austausch? (B-65)
//
// ─── WARUM DIESER TEST HÄRTER WIEGT ALS SEINE VORGÄNGER ────────────────────
//
// Dieselbe Stelle, dritter Anlauf: `healUnit` baut JEDE Einheit Feld für
// Feld neu auf, und was dort nicht steht, ist nach dem nächsten Seiten-
// Aufruf weg (siehe `schadenUeberlebtLaden.test.ts` und
// `mindestmengeUeberlebtLaden.test.ts`).
//
// Der Unterschied ist der Preis. Eine verlorene Mindestmenge kostet eine
// Nachbestellung. Eine verlorene DGUV-V3-Frist stellt ein ungeprüftes Gerät
// auf eine Veranstaltung — und die Anwendung schwiege dabei nicht, sondern
// sagte das Gegenteil: die Ampel meldete „nichts fällig", weil sie nichts
// mehr weiss.
// ───────────────────────────────────────────────────────────────────────────

const KEY = 'inventory-planner:inventory'

const bestand = (fristen: unknown) => ({
  items: [{ id: 'i1', model: 'ULXD2', quantity: 1, createdAt: 't', updatedAt: 't' }],
  nodes: [],
  sets: [],
  units: [
    {
      id: 'u1',
      itemId: 'i1',
      houseRef: 'AV-0001',
      condition: 'ok',
      history: [],
      ...(fristen === undefined ? {} : { fristen }),
      createdAt: 't',
      updatedAt: 't',
    },
  ],
})

const frischLaden = async () => {
  vi.resetModules()
  const mod = await import('../store/inventoryStore')
  return mod.useInventoryStore.getState().units
}

describe('Die Fristen überleben Laden und Austausch (B-65)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('1. eine eingetragene Frist steht nach dem Laden noch da', async () => {
    localStorage.setItem(KEY, JSON.stringify(bestand([{ art: 'dguv-v3', faellig: '2026-12-01' }])))
    const units = await frischLaden()
    expect(
      units[0].fristen,
      'die Heilung hat `fristen` fallen lassen — dann meldet die Ampel nach ' +
        'jedem Neuladen „nichts fällig" über ein ungeprüftes Lager',
    ).toEqual([{ art: 'dguv-v3', faellig: '2026-12-01' }])
  })

  it('2. zuletzt + Intervall überleben genauso', async () => {
    localStorage.setItem(
      KEY,
      JSON.stringify(bestand([{ art: 'kalibrierung', zuletzt: '2026-03-09', intervallMonate: 12 }])),
    )
    const units = await frischLaden()
    expect(units[0].fristen).toEqual([
      { art: 'kalibrierung', zuletzt: '2026-03-09', intervallMonate: 12 },
    ])
  })

  it('3. ein Eintrag ohne jede Zeitangabe ist kein Termin und fällt weg', async () => {
    // Er stünde sonst in der Liste und sähe aus wie eine Zusage, dass jemand
    // den Termin im Blick hat.
    localStorage.setItem(KEY, JSON.stringify(bestand([{ art: 'wartung' }, { art: 'akku', zuletzt: '2026-01-01' }])))
    const units = await frischLaden()
    expect(units[0].fristen).toBeUndefined()
  })

  it('4. eine unbekannte Art wird `sonstige` — der Termin geht NICHT verloren', async () => {
    // Dass ein neuerer Stand eine Sorte kennt, die dieser nicht kennt, ist
    // kein Grund, einen eingetragenen Prüftermin zu löschen.
    localStorage.setItem(
      KEY,
      JSON.stringify(bestand([{ art: 'tuev-anhaenger', bezeichnung: 'TÜV Anhänger', faellig: '2027-04-01' }])),
    )
    const units = await frischLaden()
    expect(units[0].fristen).toEqual([
      { art: 'sonstige', bezeichnung: 'TÜV Anhänger', faellig: '2027-04-01' },
    ])
  })

  it('5. keine Fristen heisst UNBEWERTET, nicht „geprüft"', async () => {
    localStorage.setItem(KEY, JSON.stringify(bestand(undefined)))
    const units = await frischLaden()
    expect(units[0].fristen).toBeUndefined()
  })

  it('6. der Austausch trägt sie mit — Round-Trip verlustfrei', () => {
    const snap = bestand([{ art: 'dguv-v3', faellig: '2026-12-01' }]) as Parameters<
      typeof serializeInventory
    >[0]
    const zurueck = parseInventory(serializeInventory(snap))
    expect(zurueck?.units[0].fristen).toEqual([{ art: 'dguv-v3', faellig: '2026-12-01' }])
  })

  it('7. das Format ist auf 6 gegangen, und ein neuerer Stand wird abgelehnt', () => {
    expect(INVENTORY_FORMAT_VERSION).toBe(6)
    expect(
      parseInventory(
        JSON.stringify({ format: INVENTORY_FORMAT, version: INVENTORY_FORMAT_VERSION + 1 }),
      ),
    ).toBeNull()
  })

  it('8. ältere Dateien (v5) bleiben lesbar', () => {
    const alt = JSON.stringify({ format: INVENTORY_FORMAT, version: 5, ...bestand(undefined) })
    const zurueck = parseInventory(alt)
    expect(zurueck?.units).toHaveLength(1)
    expect(zurueck?.units[0].fristen).toBeUndefined()
  })
})
