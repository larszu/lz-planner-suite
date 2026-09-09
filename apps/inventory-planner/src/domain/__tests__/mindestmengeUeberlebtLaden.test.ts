import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  INVENTORY_FORMAT,
  INVENTORY_FORMAT_VERSION,
  serializeInventory,
  parseInventory,
} from '../lib/inventoryPortable'

// ───────────────────────────────────────────────────────────────────────────
// Überlebt die Mindestmenge das Neuladen und den Austausch? (B-65)
//
// ─── WARUM DIESER TEST DEN GANZEN WEG GEHT ─────────────────────────────────
//
// `deckung()` hat eigene Tests, und die wären grün geblieben, während das
// Feld beim Laden verschwindet: `healItem` baut JEDEN Artikel Feld für Feld
// neu auf, und was dort nicht steht, ist nach dem nächsten Seiten-Aufruf weg.
// Genau so ist der `damaged`-Defekt entstanden (siehe
// `schadenUeberlebtLaden.test.ts`) — eine Ebene tiefer und mit demselben
// Muster: geschrieben wurde korrekt, gelesen wurde nie wieder.
//
// Das wiegt hier besonders schwer, weil der Verlust STILL ist. Ein Lager
// ohne Mindestmengen sieht nicht kaputt aus; es sieht aus wie ein Lager, in
// dem alles reicht. Die Kachel „Unter Ziel" stünde auf 0 und hätte recht —
// über nichts.
//
// ─── DIE ZWEITE HÄLFTE: DER AUSTAUSCH ──────────────────────────────────────
//
// Das portable Format trägt den Artikel als Ganzes. Ein Stand, der das Feld
// nicht kennt, liest eine Datei mit gepflegten Mindestmengen und schreibt
// sie ohne sie zurück. Dagegen steht die Versions-Nummer: sie ist auf 5
// gegangen, und ein älterer Stand weigert sich zu lesen, statt still zu
// kürzen. Beides wird hier geprüft — die Zahl selbst und die Weigerung.
// ───────────────────────────────────────────────────────────────────────────

const KEY = 'inventory-planner:inventory'

const bestand = (mindestmenge: unknown) => ({
  items: [
    {
      id: 'i1',
      model: 'XLR 3m',
      category: 'kabel',
      quantity: 12,
      ...(mindestmenge === undefined ? {} : { mindestmenge }),
      createdAt: 't',
      updatedAt: 't',
    },
  ],
  nodes: [],
  sets: [],
  units: [],
})

/**
 * Frisch laden — der Store liest `localStorage` beim ERSTEN Import.
 * `resetModules` sorgt dafür, dass genau das noch einmal passiert; ohne ihn
 * läse jeder weitere Test den Stand des ersten, und die Prüfung ginge am
 * Laden vorbei.
 */
const frischLaden = async () => {
  vi.resetModules()
  const mod = await import('../store/inventoryStore')
  return mod.useInventoryStore.getState().items
}

describe('Die Mindestmenge überlebt Laden und Austausch (B-65)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('1. die hinterlegte Mindestmenge steht nach dem Laden noch da', async () => {
    localStorage.setItem(KEY, JSON.stringify(bestand(20)))
    const items = await frischLaden()
    expect(
      items[0].mindestmenge,
      'die Heilung hat `mindestmenge` fallen lassen — dann steht die Kachel ' +
        '„Unter Ziel" nach jedem Neuladen auf 0 und hat über nichts recht',
    ).toBe(20)
  })

  it('2. kein Feld heisst UNBEWERTET und nicht 0', async () => {
    // Der Unterschied ist der ganze Punkt: 0 wäre die Aussage „darf leer
    // sein", und die trifft jemand ausdrücklich. Wer nichts hinterlegt hat,
    // hat nichts entschieden.
    localStorage.setItem(KEY, JSON.stringify(bestand(undefined)))
    const items = await frischLaden()
    expect(items[0].mindestmenge).toBeUndefined()
  })

  it('3. eine 0 bleibt eine 0', async () => {
    localStorage.setItem(KEY, JSON.stringify(bestand(0)))
    const items = await frischLaden()
    expect(items[0].mindestmenge).toBe(0)
  })

  it('4. Unsinn wird nicht zu einer Zahl gemacht', async () => {
    // Weder Text noch eine negative Menge ergeben eine Mindestmenge. Sie
    // fallen auf `undefined` zurück — unbewertet ist die ehrliche Antwort,
    // eine geratene Zahl wäre eine erfundene Entscheidung.
    for (const unsinn of ['zwanzig', -3, null, {}]) {
      localStorage.setItem(KEY, JSON.stringify(bestand(unsinn)))
      const items = await frischLaden()
      expect(items[0].mindestmenge, `${JSON.stringify(unsinn)} wurde zu einer Zahl`).toBeUndefined()
    }
  })

  it('5. der Austausch trägt sie mit — Round-Trip verlustfrei', () => {
    const snap = bestand(20) as Parameters<typeof serializeInventory>[0]
    const zurueck = parseInventory(serializeInventory(snap))
    expect(zurueck?.items[0].mindestmenge).toBe(20)
  })

  it('6. das Format ist auf 5 gegangen, und ein älterer Stand liest nicht mehr still mit', () => {
    // Die Versions-Nummer IST der Schutz: ohne sie läse ein Stand ohne dieses
    // Feld die Datei anstandslos und schriebe sie gekürzt zurück. Die zweite
    // Zeile prüft die Weigerung aus dieser Richtung — eine Datei, die neuer
    // ist als dieser Stand, wird abgelehnt statt halb verstanden.
    expect(INVENTORY_FORMAT_VERSION).toBe(5)
    expect(
      parseInventory(
        JSON.stringify({ format: INVENTORY_FORMAT, version: INVENTORY_FORMAT_VERSION + 1 }),
      ),
    ).toBeNull()
  })

  it('7. ältere Dateien (v4) bleiben lesbar', () => {
    // Abwärtskompatibilität ist ausdrücklich gewollt: ein Bestand von
    // gestern hat schlicht keine Mindestmengen, und das ist unbewertet,
    // nicht kaputt.
    const alt = JSON.stringify({ format: INVENTORY_FORMAT, version: 4, ...bestand(undefined) })
    const zurueck = parseInventory(alt)
    expect(zurueck?.items).toHaveLength(1)
    expect(zurueck?.items[0].mindestmenge).toBeUndefined()
  })
})
