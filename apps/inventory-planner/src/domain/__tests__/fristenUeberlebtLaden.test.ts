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

  it('4. eine unbekannte Art bleibt stehen — sie wird NICHT zu `sonstige`', async () => {
    // ─── DIESER TEST STAND FRÜHER ANDERSHERUM (bis 2026-09-10) ───────────
    //
    // Er verlangte, dass `tuev-anhaenger` zu `sonstige` wird, und die
    // Begründung war gut: dass ein neuerer Stand eine Sorte kennt, die
    // dieser nicht kennt, ist kein Grund, einen Prüftermin zu löschen.
    //
    // Nur löschte die Regel nichts und benannte um. Solange die Arten eine
    // feste Liste von fünf waren, fiel das kaum auf. Seit das Haus eigene
    // anlegen darf (Eigentümer-Entscheidung 2026-09-10), macht dieselbe
    // Zeile aus JEDER eigenen Art „Sonstige": der Termin steht noch auf der
    // Liste, aber ohne den Grund, aus dem ihn jemand eingetragen hat. Wer
    // die Liste abarbeitet, weiß nicht mehr, was zu tun ist — und die
    // `bezeichnung` rettet nur den Fall, in dem jemand sie gesetzt hat.
    //
    // Die Art bleibt deshalb stehen, wie sie ist. Kennt die Anzeige sie
    // nicht, sagt sie das (`istUnbekannteArt`) — eine Auskunft statt einer
    // Behauptung.
    localStorage.setItem(
      KEY,
      JSON.stringify(bestand([{ art: 'tuev-anhaenger', bezeichnung: 'TÜV Anhänger', faellig: '2027-04-01' }])),
    )
    const units = await frischLaden()
    expect(units[0].fristen).toEqual([
      { art: 'tuev-anhaenger', bezeichnung: 'TÜV Anhänger', faellig: '2027-04-01' },
    ])
  })

  it('4b. eine Art ohne jeden Inhalt wird `sonstige` — mehr ist nicht zu holen', async () => {
    // Die Gegenprobe zu 4: was NICHT dasteht, kann auch nicht stehenbleiben.
    localStorage.setItem(KEY, JSON.stringify(bestand([{ art: '   ', faellig: '2027-04-01' }])))
    const units = await frischLaden()
    expect(units[0].fristen).toEqual([{ art: 'sonstige', faellig: '2027-04-01' }])
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

  it('7. das Format ist auf 7 gegangen, und ein neuerer Stand wird abgelehnt', () => {
    expect(INVENTORY_FORMAT_VERSION).toBe(7)
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

  it('8. eine eigene Art überlebt das Laden — mit eigenem Schlüssel', async () => {
    // Eigener Schlüssel mit Absicht: die Arten sind Stammdaten und kein
    // Bestand. Wer alle Artikel löscht, hat immer noch dieselben Prüfarten.
    localStorage.setItem(KEY, JSON.stringify(bestand(undefined)))
    localStorage.setItem(
      'inventory-planner:fristArten',
      JSON.stringify([{ id: 'anschlagmittel', name: 'Anschlagmittel', standardIntervallMonate: 12 }]),
    )
    vi.resetModules()
    const mod = await import('../store/inventoryStore')
    expect(mod.useInventoryStore.getState().fristArten).toEqual([
      { id: 'anschlagmittel', name: 'Anschlagmittel', standardIntervallMonate: 12 },
    ])
  })

  it('9. eine Art ohne Namen ist keine und wird beim Laden verworfen', async () => {
    // Unter ihr stünde in der Liste nichts, und ein Termin, dessen Art
    // nichts sagt, ist ein Termin ohne Grund.
    localStorage.setItem(KEY, JSON.stringify(bestand(undefined)))
    localStorage.setItem(
      'inventory-planner:fristArten',
      JSON.stringify([{ id: 'x', name: '  ' }, { id: '', name: 'Ohne Id' }, { id: 'ok', name: 'Leiterprüfung' }]),
    )
    vi.resetModules()
    const mod = await import('../store/inventoryStore')
    expect(mod.useInventoryStore.getState().fristArten).toEqual([{ id: 'ok', name: 'Leiterprüfung' }])
  })

  it('10. eine neue Art kollidiert nicht mit einer eingebauten', async () => {
    // Zwei Arten mit derselben Id wären für jede Datei danach dieselbe Art.
    localStorage.setItem(KEY, JSON.stringify(bestand(undefined)))
    localStorage.removeItem('inventory-planner:fristArten')
    vi.resetModules()
    const mod = await import('../store/inventoryStore')
    mod.useInventoryStore.getState().fristArtAnlegen({ name: 'Wartung' })
    const arten = mod.useInventoryStore.getState().fristArten
    expect(arten).toHaveLength(1)
    expect(arten[0].id).not.toBe('wartung')
    expect(arten[0].name).toBe('Wartung')
  })

  it('11. eine gelöschte Art nimmt die eingetragenen Termine NICHT mit', async () => {
    // Termine zu vernichten, weil jemand eine Beschriftung aufgeräumt hat,
    // wäre der teuerste Aufräum-Nebeneffekt, den dieses Modul haben könnte.
    localStorage.setItem(
      KEY,
      JSON.stringify(bestand([{ art: 'leiterpruefung', faellig: '2027-04-01' }])),
    )
    localStorage.setItem(
      'inventory-planner:fristArten',
      JSON.stringify([{ id: 'leiterpruefung', name: 'Leiterprüfung' }]),
    )
    vi.resetModules()
    const mod = await import('../store/inventoryStore')
    mod.useInventoryStore.getState().fristArtEntfernen('leiterpruefung')
    const units = mod.useInventoryStore.getState().units
    expect(units[0].fristen).toEqual([{ art: 'leiterpruefung', faellig: '2027-04-01' }])
  })

  it('12. die Arten-Liste reist in der Datei mit', () => {
    const snap = {
      ...bestand([{ art: 'leiterpruefung', faellig: '2027-04-01' }]),
      fristArten: [{ id: 'leiterpruefung', name: 'Leiterprüfung', standardIntervallMonate: 12 }],
    } as Parameters<typeof serializeInventory>[0]
    const zurueck = parseInventory(serializeInventory(snap))
    expect(zurueck?.fristArten).toEqual([
      { id: 'leiterpruefung', name: 'Leiterprüfung', standardIntervallMonate: 12 },
    ])
  })
})
