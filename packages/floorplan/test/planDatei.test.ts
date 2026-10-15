import { describe, expect, it } from 'vitest'
import {
  istBildDatei,
  istPdfDatei,
  istPlanDatei,
  ladePlanDatei,
  planAblage,
  planAccept,
  planDateienAus,
  PlanDateiFehler,
  zielGroesse,
  ziehtDateien,
} from '../src/index'

const datei = (name: string, type: string) => ({ name, type }) as File

describe('welche Dateien ein Plan sein koennen', () => {
  it('nimmt DXF nur an, wenn der Planer es liest', () => {
    expect(istPlanDatei(datei('eg.dxf', ''), { pdf: true })).toBe(false)
    expect(istPlanDatei(datei('eg.dxf', ''), { dxf: true })).toBe(true)
    expect(planAccept({ pdf: true, dxf: true })).toBe('image/*,application/pdf,.pdf,.dxf')
  })

  it('nimmt Rasterbilder, auch ohne MIME-Typ an der Endung', () => {
    expect(istBildDatei(datei('eg.png', 'image/png'))).toBe(true)
    expect(istBildDatei(datei('EG.JPG', ''))).toBe(true)
  })

  it('nimmt SVG nicht: es kann Skript tragen und hat keine Pixelgroesse', () => {
    expect(istBildDatei(datei('plan.svg', 'image/svg+xml'))).toBe(false)
  })

  it('nimmt PDFs nur, wenn ein Renderer da ist', () => {
    const pdf = datei('plan.pdf', 'application/pdf')
    expect(istPdfDatei(pdf)).toBe(true)
    expect(istPlanDatei(pdf)).toBe(false)
    expect(istPlanDatei(pdf, { pdf: true })).toBe(true)
    expect(planAccept()).toBe('image/*')
    expect(planAccept({ pdf: true })).toContain('application/pdf')
  })
})

describe('Drag & Drop', () => {
  it('erkennt Dateien waehrend dragover am Typ, nicht am Inhalt', () => {
    expect(ziehtDateien({ types: ['Files'] })).toBe(true)
    expect(ziehtDateien({ types: ['text/plain'] })).toBe(false)
    expect(ziehtDateien(null)).toBe(false)
  })

  it('filtert aus einem Drop die brauchbaren Dateien', () => {
    const dt = { types: ['Files'], files: [datei('notiz.txt', 'text/plain'), datei('og.webp', 'image/webp')] }
    expect(planDateienAus(dt).map((f) => f.name)).toEqual(['og.webp'])
  })

  it('verhindert das Oeffnen der Datei durch den Browser und reicht die erste passende weiter', () => {
    const erhalten: string[] = []
    const aktiv: boolean[] = []
    const h = planAblage({ onDatei: (f) => erhalten.push(f.name), onAktiv: (a) => aktiv.push(a) })
    let verhindert = 0
    const dt = { types: ['Files'], files: [datei('eg.png', 'image/png')], dropEffect: 'none' } as unknown as DataTransfer
    h.onDragOver({ preventDefault: () => verhindert++, dataTransfer: dt })
    h.onDrop({ preventDefault: () => verhindert++, dataTransfer: dt })
    expect(verhindert).toBe(2)
    expect(erhalten).toEqual(['eg.png'])
    expect(aktiv).toEqual([true, false])
  })

  it('meldet ungeeignete Dateien, statt still nichts zu tun', () => {
    let gemeldet: string[] = []
    const h = planAblage({ onDatei: () => {}, onUngeeignet: (f) => (gemeldet = f.map((x) => x.name)) })
    h.onDrop({ preventDefault: () => {}, dataTransfer: { types: ['Files'], files: [datei('a.docx', '')] } as unknown as DataTransfer })
    expect(gemeldet).toEqual(['a.docx'])
  })

  it('laesst fremde Drags (Geraete aus der Bibliothek) in Ruhe', () => {
    let verhindert = false
    const h = planAblage({ onDatei: () => {} })
    h.onDragOver({ preventDefault: () => (verhindert = true), dataTransfer: { types: ['application/fixture'] } as unknown as DataTransfer })
    expect(verhindert).toBe(false)
  })
})

describe('Verkleinern', () => {
  it('laesst kleine Plaene, wie sie sind', () => {
    expect(zielGroesse(1200, 800)).toEqual({ breite: 1200, hoehe: 800, faktor: 1 })
  })

  it('bringt die laengste Kante auf die Grenze', () => {
    const z = zielGroesse(6000, 4000, 3000)
    expect([z.breite, z.hoehe]).toEqual([3000, 2000])
  })
})

describe('ohne PDF-Renderer', () => {
  it('sagt, dass PDF hier nicht geht, statt ein leeres Bild zu liefern', async () => {
    const pdf = { name: 'plan.pdf', type: 'application/pdf', size: 10, arrayBuffer: async () => new ArrayBuffer(1) } as unknown as File
    await expect(ladePlanDatei(pdf)).rejects.toMatchObject({ code: 'pdf-nicht-verfuegbar' })
    expect(new PlanDateiFehler('typ')).toBeInstanceOf(Error)
  })

  it('reicht den Renderer durch und uebernimmt Seitenzahl und Groesse', async () => {
    const pdf = { name: 'plan.pdf', type: 'application/pdf', size: 10, arrayBuffer: async () => new ArrayBuffer(1) } as unknown as File
    const p = await ladePlanDatei(pdf, { seite: 2, pdf: async (_d, seite) => ({ dataUrl: `data:image/png;base64,${seite}`, breite: 20, hoehe: 10, seiten: 5 }) })
    expect(p).toMatchObject({ art: 'pdf', seite: 2, seiten: 5, naturalWidth: 20, naturalHeight: 10 })
  })
})
