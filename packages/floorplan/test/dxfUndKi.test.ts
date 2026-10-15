import { describe, expect, it } from 'vitest'
import {
  DxfFehler,
  dxfLesen,
  grauAus,
  KI_GITTER,
  kiAntwortLesen,
  kiErgebnis,
  kiPlanPrompt,
  mtextBereinigen,
  operatorListeLesen,
  planErkennen,
  rechteckEinrasten,
  wandAufRaster,
  wandEinrasten,
} from '../src/index'

// ── DXF: ein kleiner Raum in Millimetern, wie AutoCAD ihn schreibt ─────────
const g = (...paare: (string | number)[]) => {
  const z: string[] = []
  for (let i = 0; i < paare.length; i += 2) z.push(String(paare[i]), String(paare[i + 1]))
  return z.join('\n')
}
const lw = (ebene: string, pts: [number, number][], zu = true) =>
  g(0, 'LWPOLYLINE', 8, ebene, 90, pts.length, 70, zu ? 1 : 0, ...pts.flatMap(([x, y]) => [10, x, 20, y]))

function testDxf(insunits = 4) {
  // Innen 6000 x 4000, Wandstaerke 240; DXF-y nach oben.
  const aussen = lw('A-WALL', [[-240, -240], [6240, -240], [6240, 4240], [-240, 4240]])
  const innen = lw('A-WALL', [[0, 0], [6000, 0], [6000, 4000], [0, 4000]])
  const stuetze = g(0, 'HATCH', 8, 'S-COLS', 70, 1, 91, 1, 92, 2, 72, 0, 73, 1, 93, 4, 10, 3000, 20, 2000, 10, 3300, 20, 2000, 10, 3300, 20, 2300, 10, 3000, 20, 2300)
  const tuer = g(0, 'ARC', 8, 'A-DOOR', 10, 1000, 20, 0, 40, 885, 50, 0, 51, 90)
  const stempel = g(0, 'TEXT', 8, 'A-ROOM', 10, 2000, 20, 2500, 40, 200, 1, 'Saal') + '\n' + g(0, 'MTEXT', 8, 'A-ROOM', 10, 2000, 20, 2300, 40, 200, 71, 7, 1, '{\\fArial|b0;F: 24,00 m²}')
  const masse = g(0, 'DIMENSION', 8, 'A-DIMS', 2, '*D1')
  const block = [
    g(0, 'BLOCK', 2, '*D1', 8, 'A-DIMS'),
    g(0, 'LINE', 8, '0', 10, -500, 20, 4800, 11, 6500, 21, 4800),
    g(0, 'LINE', 8, '0', 10, 0, 20, 4700, 11, 0, 21, 4900),
    g(0, 'LINE', 8, '0', 10, 6000, 20, 4700, 11, 6000, 21, 4900),
    g(0, 'TEXT', 8, '0', 10, 2800, 20, 4850, 40, 150, 1, '6000'),
    g(0, 'ENDBLK'),
  ].join('\n')
  return [
    g(0, 'SECTION', 2, 'HEADER', 9, '$INSUNITS', 70, insunits, 0, 'ENDSEC'),
    g(0, 'SECTION', 2, 'BLOCKS'),
    block,
    g(0, 'ENDSEC'),
    g(0, 'SECTION', 2, 'ENTITIES'),
    aussen,
    innen,
    stuetze,
    tuer,
    stempel,
    masse,
    g(0, 'ENDSEC', 0, 'EOF'),
  ].join('\n')
}

describe('DXF lesen', () => {
  it('liest Einheit, Layer, Bloecke und spiegelt y nach unten', () => {
    const z = dxfLesen(testDxf())
    expect(z.meterJeEinheit).toBe(0.001)
    expect(z.pfade.some((p) => p.ebene === 'A-WALL')).toBe(true)
    // Masslinie aus dem DIMENSION-Block, Layer geerbt
    expect(z.pfade.filter((p) => p.ebene === 'A-DIMS')).toHaveLength(3)
    expect(z.texte.map((t) => t.text)).toEqual(expect.arrayContaining(['Saal', 'F: 24,00 m²', '6000']))
    // y gespiegelt: der Stempel (y=2500) liegt unter der Masskette (y=4850)
    const saal = z.texte.find((t) => t.text === 'Saal')!
    const mass = z.texte.find((t) => t.text === '6000')!
    expect(saal.y).toBeGreaterThan(mass.y)
  })

  it('erkennt Waende, Stuetze, Raum und bestaetigt die Einheit an der Kette', () => {
    const p = planErkennen(dxfLesen(testDxf()))
    expect(p.massstab.quelle).toBe('dxf')
    expect(p.massstab.passend).toBe(1)
    const lang = p.waende.filter((w) => Math.hypot(w.x2 - w.x1, w.y2 - w.y1) > 3)
    expect(lang.length).toBe(4)
    for (const w of lang) expect(w.dickeM).toBeCloseTo(0.24, 3)
    expect(p.stuetzen).toHaveLength(1)
    expect(p.raeume[0].name).toBe('Saal')
    expect(p.raeume[0].flaecheM2).toBe(24)
  })

  it('raet die Einheit, wenn $INSUNITS fehlt', () => {
    const p = planErkennen(dxfLesen(testDxf(0)))
    expect(p.massstab.meterJeEinheit).toBe(0.001)
  })

  it('lehnt Binaerdateien ab, statt Unsinn zu lesen', () => {
    expect(() => dxfLesen('AC1032\u0000\u0001binaer')).toThrow(DxfFehler)
  })

  it('bereinigt MTEXT-Formatcodes', () => {
    expect(mtextBereinigen('{\\fArial|b1;Bühne}\\PH=1,20')).toBe('Bühne H=1,20')
  })
})

describe('pdf.js-Operatorliste', () => {
  // Nummern wie in pdf.js; der Leser bekommt sie hereingereicht.
  const OPS = { save: 10, restore: 11, transform: 12, setLineWidth: 2, setStrokeRGBColor: 58, setFillRGBColor: 59, constructPath: 91, fill: 22, stroke: 20, endPath: 28, beginMarkedContentProps: 70, endMarkedContent: 71, beginMarkedContent: 69, paintFormXObjectBegin: 74, paintFormXObjectEnd: 75, closeStroke: 21, eoFill: 23, fillStroke: 24, eoFillStroke: 25, closeFillStroke: 26, closeEOFillStroke: 27 }
  it('liest gefuellte Pfade mit Ebene und Transformation', () => {
    const ol = {
      fnArray: [OPS.beginMarkedContentProps, OPS.save, OPS.transform, OPS.setFillRGBColor, OPS.constructPath, OPS.restore, OPS.endMarkedContent, OPS.constructPath],
      argsArray: [
        ['OC', { type: 'OCG', id: '5R' }],
        null,
        [2, 0, 0, 2, 10, 0],
        ['#000000'],
        [OPS.fill, [new Float32Array([0, 0, 0, 1, 10, 0, 1, 10, 5, 1, 0, 5, 4])], null],
        null,
        null,
        [OPS.endPath, [new Float32Array([0, 0, 0, 1, 1, 1])], null], // Clip: zaehlt nicht
      ],
    }
    const pfade = operatorListeLesen(OPS, ol, [1, 0, 0, 1, 0, 0], new Map([['5R', 'Wände neu']]))
    expect(pfade).toHaveLength(1)
    expect(pfade[0].ebene).toBe('Wände neu')
    expect(pfade[0].gefuellt).toBe(true)
    expect(pfade[0].zu[0]).toBe(true)
    expect(pfade[0].teile[0][2]).toEqual({ x: 30, y: 10 })
  })
})

describe('Einrasten', () => {
  it('legt eine schiefe KI-Wand auf die erkannte Wand', () => {
    const ref = [{ x1: 0, y1: 5, x2: 10, y2: 5 }, { x1: 0, y1: 0, x2: 0, y2: 10 }]
    const r = wandEinrasten({ x1: 1, y1: 5.4, x2: 9, y2: 4.9 }, ref, 0.8)
    expect(r.eingerastet).toBe(true)
    expect(r.ergebnis.y1).toBeCloseTo(5, 6)
    expect(r.ergebnis.y2).toBeCloseTo(5, 6)
    expect(r.ergebnis.x1).toBeCloseTo(1, 6)
  })
  it('behaelt die Laenge der KI-Wand, wenn nur ein Stueckchen darunter liegt', () => {
    // Ein 8-cm-Wandstueck am Ende einer 10-m-Wand darf aus ihr keinen Rest machen.
    const r = wandEinrasten({ x1: 0, y1: 5.1, x2: 10, y2: 5.1 }, [{ x1: 9.9, y1: 5, x2: 9.98, y2: 5 }], 0.5)
    expect(r.eingerastet).toBe(true)
    expect(r.ergebnis.x1).toBeCloseTo(0, 6)
    expect(r.ergebnis.x2).toBeCloseTo(10, 6)
    expect(r.ergebnis.y1).toBeCloseTo(5, 6)
  })
  it('laesst eine KI-Wand ohne Gegenstueck stehen', () => {
    expect(wandEinrasten({ x1: 1, y1: 20, x2: 9, y2: 20 }, [{ x1: 0, y1: 5, x2: 10, y2: 5 }], 0.8).eingerastet).toBe(false)
  })
  it('zieht eine Buehne auf die gezeichneten Kanten', () => {
    const kanten = [
      { x1: 2, y1: 1, x2: 8, y2: 1 },
      { x1: 2, y1: 4, x2: 8, y2: 4 },
      { x1: 2, y1: 1, x2: 2, y2: 4 },
      { x1: 8, y1: 1, x2: 8, y2: 4 },
    ]
    const r = rechteckEinrasten({ x: 2.3, y: 0.7, breite: 5.5, tiefe: 3.5 }, kanten, 0.6)
    expect(r.eingerastet).toBe(true)
    expect(r.ergebnis).toEqual({ x: 2, y: 1, breite: 6, tiefe: 3 })
  })
  it('findet auf einem Scan die Mitte des dunklen Wandbands', () => {
    const b = 200
    const rgba = new Uint8ClampedArray(b * b * 4).fill(255)
    for (let y = 98; y <= 105; y++) for (let x = 20; x < 180; x++) rgba.fill(0, (y * b + x) * 4, (y * b + x) * 4 + 3)
    const bild = grauAus(rgba, b, b)
    const r = wandAufRaster({ x1: 30, y1: 110, x2: 170, y2: 109 }, bild, 12)
    expect(r.eingerastet).toBe(true)
    expect(r.ergebnis.y1).toBeCloseTo(101.5, 0)
    expect(r.ergebnis.y2).toBeCloseTo(101.5, 0)
    expect(r.ergebnis.x1).toBeLessThan(22)
    expect(r.ergebnis.x2).toBeGreaterThan(178)
    expect(r.dickePx).toBeGreaterThanOrEqual(7)
  })
})

describe('KI-Prompt und Antwort', () => {
  it('nennt Gitter, Achsen und verbietet geschaetzte Meter je Pixel', () => {
    const p = kiPlanPrompt({ waende: true, buehnen: true, raeume: false, massstab: true }, { breitePx: 1568, hoehePx: 900 })
    expect(p).toContain('0..1000')
    expect(p).toContain('x runs from 0 at the left edge')
    expect(p).toContain('Do not estimate metres per pixel')
    expect(p).not.toContain('rooms')
  })
  it('rechnet Gittereinheiten in den Ausschnitt um', () => {
    const a = kiAntwortLesen('```json\n{"walls":[{"x1":0,"y1":500,"x2":1000,"y2":500,"thickness_cm":24}],"stages":[{"x":100,"y":100,"w":200,"h":100,"kind":"podium"}],"scale":{"x1":0,"y1":0,"x2":500,"y2":0,"meters":10},"scale_text":"M 1:200"}\n```')
    const e = kiErgebnis(a, { x0: 100, y0: 50, breite: 2000, hoehe: 1000 })
    expect(e.waende[0]).toEqual({ x1: 100, y1: 550, x2: 2100, y2: 550, dicke: 0.24 })
    expect(e.buehnen[0]).toMatchObject({ x: 300, y: 150, breite: 400, tiefe: 100, art: 'podium' })
    expect(e.masskette).toEqual({ laenge: 1000, meter: 10 })
    expect(e.massstabText).toBe(200)
    expect(KI_GITTER).toBe(1000)
  })
})
