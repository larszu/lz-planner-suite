import { describe, expect, it } from 'vitest'
import {
  parseVenueExchange,
  raumAus,
  sitzblockEcken,
  sitzblockNormal,
  sitzblockPlaetze,
  sitzblockPlaetzeListe,
  sitzblockTiefe,
  videowandEnden,
  videowandNormal,
  type VenueSeatingBlock,
} from '../src/index'

const block = (patch: Partial<VenueSeatingBlock> = {}): VenueSeatingBlock => ({ id: 'b1', x: 10, y: 20, width: 11, rows: 5, ...patch })

describe('Sitzblock', () => {
  it('ergaenzt Vorgaben und klemmt Unsinn', () => {
    const n = sitzblockNormal(block({ rows: 0, occupancy: 7, rotationDeg: -90, riseM: -1 }))
    expect(n.rows).toBe(1)
    expect(n.occupancy).toBe(1)
    expect(n.rotationDeg).toBe(270)
    expect(n.riseM).toBe(0)
    expect(n.rowSpacingM).toBe(0.9)
  })

  it('Tiefe folgt aus Reihen und Reihenabstand', () => {
    expect(sitzblockTiefe(block({ rows: 10, rowSpacingM: 0.8 }))).toBeCloseTo(8)
  })

  it('Ecken liegen ungedreht achsparallel um die Mitte', () => {
    const [a, b, c, d] = sitzblockEcken(block({ width: 10, rows: 4, rowSpacingM: 1 }))
    expect(a).toEqual({ x: 5, y: 18 })
    expect(b).toEqual({ x: 15, y: 18 })
    expect(c).toEqual({ x: 15, y: 22 })
    expect(d).toEqual({ x: 5, y: 22 })
  })

  it('um 90° gedreht blickt der Block nach +x', () => {
    const plaetze = sitzblockPlaetzeListe(block({ rotationDeg: 90 }))
    expect(plaetze[0].blickDeg).toBe(0)
    const vorn = plaetze.filter((p) => p.reihe === 0)
    const hinten = plaetze.filter((p) => p.reihe === 4)
    expect(vorn[0].x).toBeGreaterThan(hinten[0].x)
  })

  it('Reihen steigen um die Steigung, ab der Grundhoehe', () => {
    const plaetze = sitzblockPlaetzeListe(block({ riseM: 0.4, baseHeightM: 2 }))
    expect(plaetze.find((p) => p.reihe === 0)!.z).toBe(2)
    expect(plaetze.find((p) => p.reihe === 3)!.z).toBeCloseTo(3.2)
  })

  it('jeder Platz liegt in der Grundflaeche, mit Gaengen in langen Reihen', () => {
    const b = block({ width: 30, rows: 3, rotationDeg: 35 })
    const plaetze = sitzblockPlaetzeListe(b)
    const n = sitzblockNormal(b)
    const r = (-n.rotationDeg * Math.PI) / 180
    for (const p of plaetze) {
      const dx = p.x - n.x
      const dy = p.y - n.y
      const u = dx * Math.cos(r) - dy * Math.sin(r)
      expect(Math.abs(u)).toBeLessThanOrEqual(n.width / 2 + 1e-9)
    }
    expect(plaetze.length).toBeLessThan(sitzblockPlaetze(b))
  })

  it('Belegung ist deterministisch und folgt dem Anteil', () => {
    const b = block({ width: 40, rows: 30, occupancy: 0.5 })
    const a1 = sitzblockPlaetzeListe(b).filter((p) => p.belegt).length
    const a2 = sitzblockPlaetzeListe(b).filter((p) => p.belegt).length
    const alle = sitzblockPlaetzeListe(b).length
    expect(a1).toBe(a2)
    expect(a1 / alle).toBeGreaterThan(0.42)
    expect(a1 / alle).toBeLessThan(0.58)
  })

  it('Stehflaeche: ebene, ungeordnete Menge in derselben Dichte', () => {
    const b = block({ standing: true, riseM: 0.5, width: 20, rows: 10 })
    const plaetze = sitzblockPlaetzeListe(b)
    expect(new Set(plaetze.map((p) => p.z)).size).toBe(1)
    expect(plaetze.length).toBeGreaterThan(sitzblockPlaetze(b) * 0.8)
    expect(new Set(plaetze.map((p) => Math.round(p.blickDeg))).size).toBeGreaterThan(5)
  })
})

describe('Videowand', () => {
  it('Vorgaben und Enden', () => {
    const w = { id: 'w', x: 10, y: 5, widthM: 8, heightM: 4.5, rotationDeg: 0 }
    expect(videowandNormal(w).bottomM).toBe(1)
    expect(videowandEnden(w)).toEqual([{ x: 6, y: 5 }, { x: 14, y: 5 }])
  })
})

describe('Raum im Austauschformat', () => {
  const alt = JSON.stringify({ kind: 'venue-exchange', formatVersion: 1, app: 'x', appVersion: '1', exportedAt: '', venue: { name: 'Halle', persons: [], walls: [], stageObjects: [] } })

  it('eine alte Datei ohne Raum-Felder bleibt gueltig', () => {
    const v = parseVenueExchange(alt)
    expect(v.venue.seatingBlocks).toBeUndefined()
    expect(raumAus(v.venue)).toEqual({})
  })

  it('Raum-Felder kommen durch, Kaputtes faellt weg', () => {
    const roh = {
      ceilingHeightM: 12,
      floorMaterial: 'wood',
      wallMaterial: 'brick',
      seatingBlocks: [block(), { id: 3 }, null],
      videoWalls: [{ id: 'w', x: 1, y: 2, widthM: 6, heightM: 3 }, 'x'],
    }
    const r = raumAus(roh)
    expect(r.ceilingHeightM).toBe(12)
    expect(r.floorMaterial).toBe('wood')
    expect(r.wallMaterial).toBe('brick')
    expect(r.seatingBlocks).toHaveLength(1)
    expect(r.videoWalls).toHaveLength(1)
    expect(raumAus({ floorMaterial: 'lava', wallMaterial: 'glass', ceilingHeightM: -3 })).toEqual({})
  })
})
