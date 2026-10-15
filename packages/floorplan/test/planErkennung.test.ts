import { describe, expect, it } from 'vitest'
import {
  bruestungAusText,
  masszahl,
  massstabErkennen,
  planErkennen,
  planUebernahme,
  stempelFlaeche,
  stempelHoehe,
  textMassstaebe,
  type VektorPfad,
  type VektorText,
  type VektorZeichnung,
} from '../src/index'

// Ein Testraum, gezeichnet wie ein ArchiCAD-Export im Massstab 1:100 auf
// Papier-Millimetern: 24-cm-Waende als schwarze Flaechen, innen 6,00 x 4,00 m,
// eine Tuer (88,5 cm, mit Schwenkbogen) unten, ein Fenster (1,51 m, zwei
// Glaslinien) oben, ein Raumstempel und eine Masskette ueber der Oberkante.
const M = 100 // 1:100 → 1 mm Papier = 0,1 m
const mm = (m: number) => (m * 1000) / M

const rechteck = (x: number, y: number, b: number, h: number): VektorPfad => ({
  teile: [[{ x: mm(x), y: mm(y) }, { x: mm(x + b), y: mm(y) }, { x: mm(x + b), y: mm(y + h) }, { x: mm(x), y: mm(y + h) }]],
  zu: [true],
  kurve: false,
  gefuellt: true,
  gezogen: false,
  breite: 0,
  fuellfarbe: '#000000',
})
const linie = (x1: number, y1: number, x2: number, y2: number, ebene?: string): VektorPfad => ({
  teile: [[{ x: mm(x1), y: mm(y1) }, { x: mm(x2), y: mm(y2) }]],
  zu: [false],
  kurve: false,
  gefuellt: false,
  gezogen: true,
  breite: 0.13,
  strichfarbe: '#000000',
  ebene,
})
const bogen = (cx: number, cy: number, r: number): VektorPfad => ({
  teile: [Array.from({ length: 9 }, (_, i) => ({ x: mm(cx + r * Math.cos((i / 8) * (Math.PI / 2))), y: mm(cy - r * Math.sin((i / 8) * (Math.PI / 2))) }))],
  zu: [false],
  kurve: true,
  gefuellt: false,
  gezogen: true,
  breite: 0.13,
})
const text = (s: string, x: number, y: number, hoehe = 2.5): VektorText => ({ text: s, x: mm(x), y: mm(y), hoehe, winkel: 0, laenge: s.length * hoehe * 0.6 })

function testraum(): VektorZeichnung {
  const t = 0.24
  // Innenkante bei x 1..7, y 1..5
  const pfade: VektorPfad[] = [
    // oben, mit Fensterluecke 3.0 .. 4.51
    rechteck(1 - t, 1 - t, 2 + t, t),
    rechteck(4.51, 1 - t, 7 + t - 4.51, t),
    // unten, mit Tuerluecke 2.0 .. 2.885
    rechteck(1 - t, 5, 1 + t, t),
    rechteck(2.885, 5, 7 + t - 2.885, t),
    // links, rechts
    rechteck(1 - t, 1, t, 4),
    rechteck(7, 1, t, 4),
    // Fenster: zwei Glaslinien in der Luecke
    linie(3.0, 1 - t + 0.08, 4.51, 1 - t + 0.08),
    linie(3.0, 1 - 0.08, 4.51, 1 - 0.08),
    // Tuerschwenk 0,885 m
    bogen(2.0, 5, 0.885),
    // Masskette ueber der Oberkante: 6,00 m zwischen Innenkanten, Hilfslinien
    linie(0.5, 0.2, 7.5, 0.2, 'Bemaßung'),
    linie(1, 0.05, 1, 0.35, 'Bemaßung'),
    linie(7, 0.05, 7, 0.35, 'Bemaßung'),
    // Stuetze 30 x 30 im Raum
    rechteck(5.5, 3.0, 0.3, 0.3),
  ]
  const texte = [
    text('6,00', 3.8, 0.12, 2),
    text('1.01', 2.2, 2.4),
    text('Saal', 2.2, 2.75),
    text('F: 22,63 m²', 2.2, 3.1),
    text('RH 3,50', 2.2, 3.45),
    text('Grundriss 1:100', 0.5, 6.5),
    text('Podium (2,00x1,50m)', 4.3, 3.3, 2),
  ]
  // Podest als geschlossene Linie unter dem Text
  pfade.push({ ...linie(0, 0, 0, 0), teile: [[{ x: mm(4.5), y: mm(3.4) }, { x: mm(6.5), y: mm(3.4) }, { x: mm(6.5), y: mm(4.9) }, { x: mm(4.5), y: mm(4.9) }]], zu: [true] })
  return { quelle: 'pdf', breite: mm(9), hoehe: mm(7), pfade, texte }
}

describe('Masszahlen und Stempel lesen', () => {
  it('liest Meter, Zentimeter und Millimeter', () => {
    expect(masszahl('3,60')).toEqual([3.6])
    expect(masszahl('24')).toEqual([0.24])
    expect(masszahl('3600')).toEqual([3.6])
    expect(masszahl('+2,35')).toEqual([]) // Hoehenkote
  })
  it('findet den Schriftfeld-Massstab', () => {
    expect(textMassstaebe([text('Grundriss 1:200', 0, 0), text('M 1 : 50', 0, 0), text('11:30 Uhr', 0, 0)])).toEqual([200, 50])
  })
  it('liest Flaeche, Hoehe und Bruestung', () => {
    expect(stempelFlaeche('F: 32,55 m²')).toBe(32.55)
    expect(stempelFlaeche('U: 23,16 m')).toBeUndefined()
    expect(stempelHoehe('RH 3,50')).toBe(3.5)
    expect(stempelHoehe('LH: 2,75 m')).toBe(2.75)
    expect(bruestungAusText([text('BRH ca 0,73m', 0, 0)])).toBe(0.73)
  })
})

describe('Massstab aus Bemassungsketten', () => {
  it('erkennt 1:100 aus der Kette, nicht nur aus dem Text', () => {
    const z = testraum()
    z.texte = z.texte.filter((t) => !t.text.includes('1:100'))
    const m = massstabErkennen(z)
    expect(m.massstab).toBe(100)
    expect(m.quelle).toBe('dimensions')
    expect(m.passend).toBe(1)
    expect(m.fehlerMedianM!).toBeLessThan(0.005)
  })
})

describe('Plan-Erkennung an einem gezeichneten Raum', () => {
  const p = planErkennen(testraum(), { wandHoeheM: 3 })
  const echte = p.waende.filter((w) => !w.id.startsWith('f'))

  it('findet die vier Waende als Mittellinien mit 24 cm Staerke', () => {
    expect(echte.length).toBeGreaterThanOrEqual(6) // Stuecke beidseits der Oeffnungen
    for (const w of echte) expect(w.dickeM).toBeCloseTo(0.24, 2)
    // linke Wand: Mittellinie bei x = 0,88, von Ecke zu Ecke verlaengert
    const links = echte.find((w) => Math.abs(w.x1 - w.x2) < 1e-6 && w.x1 < 1)!
    expect(links.x1).toBeCloseTo(0.88, 3)
    expect(Math.min(links.y1, links.y2)).toBeCloseTo(0.88, 2)
    expect(Math.max(links.y1, links.y2)).toBeCloseTo(5.12, 2)
  })

  it('ordnet Tuer und Fenster ein und haengt sie an Fuellstuecke', () => {
    const tuer = p.oeffnungen.find((o) => o.art === 'door')!
    const fenster = p.oeffnungen.find((o) => o.art === 'window')!
    expect(tuer.breiteM).toBeCloseTo(0.885, 3)
    expect(fenster.breiteM).toBeCloseTo(1.51, 3)
    expect(tuer.oberkanteM).toBe(2.1)
    expect(fenster.unterkanteM).toBe(0.9)
    expect(p.waende.some((w) => w.id === tuer.wandId)).toBe(true)
  })

  it('erkennt die Stuetze, nicht als Wand', () => {
    expect(p.stuetzen).toHaveLength(1)
    expect(p.stuetzen[0].breiteM).toBeCloseTo(0.3, 3)
    expect(p.stuetzen[0].x).toBeCloseTo(5.65, 3)
  })

  it('schliesst den Raum und vergleicht mit dem Stempel', () => {
    const r = p.raeume[0]
    expect(r.name).toBe('Saal')
    expect(r.nummer).toBe('1.01')
    expect(r.hoeheM).toBe(3.5)
    expect(r.umrissFlaecheM2).toBeDefined()
    // 6 x 4 = 24 m² innen, abzueglich Stuetze 0,09 → Stempel absichtlich 22,63 (Netto)
    expect(Math.abs(r.umrissFlaecheM2! - 24) / 24).toBeLessThan(0.03)
  })

  it('meldet keine Raumprobe bei einem einzigen Raum', () => {
    expect(p.raumProbe).toBeUndefined()
  })

  it('gibt den Raumwaenden die Raumhoehe aus dem Stempel', () => {
    expect(echte.every((w) => w.hoeheM === 3.5)).toBe(true)
  })

  it('findet das Podest ueber seine Masse im Text', () => {
    expect(p.buehnen).toHaveLength(1)
    expect(p.buehnen[0].breiteM).toBeCloseTo(2, 2)
    expect(p.buehnen[0].tiefeM).toBeCloseTo(1.5, 2)
    expect(p.buehnen[0].sicher).toBe(true)
  })

  it('setzt den Plan in Venue-Waende mit Oeffnungen um', () => {
    const u = planUebernahme(p, { waende: true, stuetzen: true, buehnen: true, dx: 1, dy: 2 })
    const fenster = u.waende.find((w) => w.oeffnungen[0]?.kind === 'window')!
    expect(fenster.oeffnungen[0].bottom).toBe(0.9)
    expect(fenster.oeffnungen[0].width).toBeCloseTo(1.51, 3)
    expect(u.waende.filter((w) => w.art === 'column')).toHaveLength(1)
    expect(u.buehnen[0].label).toBe('Podium')
    expect(u.buehnen[0].x).toBeCloseTo(5.5, 2)
  })

  it('begrenzt auf einen Bereich', () => {
    const teil = planErkennen(testraum(), { bereich: { minX: 0, minY: 0, maxX: 9, maxY: 2 } })
    expect(teil.waende.every((w) => (w.y1 + w.y2) / 2 <= 2)).toBe(true)
    expect(teil.raeume).toHaveLength(0)
  })
})

describe('Waende ohne Poché (Linienpaare)', () => {
  it('findet eine Wand aus zwei parallelen Linien auf einer Wand-Ebene', () => {
    const z: VektorZeichnung = {
      quelle: 'dxf',
      breite: 10,
      hoehe: 10,
      meterJeEinheit: 1,
      texte: [],
      pfade: [
        { ...linie(0, 0, 0, 0), teile: [[{ x: 1, y: 1 }, { x: 8, y: 1 }]], ebene: 'A-WALL' },
        { ...linie(0, 0, 0, 0), teile: [[{ x: 1, y: 1.175 }, { x: 8, y: 1.175 }]], ebene: 'A-WALL' },
        { ...linie(0, 0, 0, 0), teile: [[{ x: 1, y: 5 }, { x: 8, y: 5 }]], ebene: 'MOEBEL' },
      ],
    }
    const p = planErkennen(z)
    expect(p.waende).toHaveLength(1)
    expect(p.waende[0].dickeM).toBeCloseTo(0.175, 3)
    expect(p.waende[0].y1).toBeCloseTo(1.0875, 4)
    expect(p.waende[0].quelle).toBe('lines')
  })
})
