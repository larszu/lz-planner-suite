import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  AutoStufe,
  bokehStaerke,
  erzeugeDunstStrahl,
  erzeugeLedWand,
  erzeugeMensch,
  erzeugePublikum,
  erzeugeSitze,
  erzeugeTribuene,
  erzeugeTraverse,
  erzeugeScheinwerfer,
  KEIN_AO,
  menschGeometrie,
  oberflaechenMaterial,
  poseFuer,
  publikumsVariante,
  stufenWerte,
  TEIL,
  type PublikumsPlatz,
} from '../src/index'

describe('Qualitaetsstufen', () => {
  it('hoch rechnet AO, Schatten und mehr Schritte; niedrig nicht', () => {
    const h = stufenWerte('high', 2)
    const n = stufenWerte('low', 2)
    expect(h.ao && h.schatten && h.dof).toBe(true)
    expect(n.ao || n.schatten || n.dof).toBe(false)
    expect(h.strahlSchritte).toBeGreaterThan(n.strahlSchritte)
    expect(h.pixelRatio).toBe(1.25)
    expect(n.pixelRatio).toBe(1)
  })

  it('Auto senkt bei dauerhaft langsamen Bildern und bleibt dann unten', () => {
    const a = new AutoStufe({ aufwaermen: 5, fenster: 10, grenzeFps: 48 })
    for (let i = 0; i < 20; i++) a.bild(16.7)
    expect(a.stufe).toBe('high')
    for (let i = 0; i < 20; i++) a.bild(30)
    expect(a.stufe).toBe('low')
    for (let i = 0; i < 50; i++) a.bild(8)
    expect(a.stufe).toBe('low')
  })

  it('Auto ignoriert Aufwaermen und gedrosselte Hintergrund-Bilder', () => {
    const a = new AutoStufe({ aufwaermen: 30, fenster: 10 })
    for (let i = 0; i < 30; i++) a.bild(40)
    expect(a.stufe).toBe('high')
    for (let i = 0; i < 40; i++) a.bild(1000)
    expect(a.stufe).toBe('high')
  })
})

describe('Tiefenschaerfe', () => {
  it('offene Blende und lange Brennweite machen mehr Unschaerfe', () => {
    const basis = { fokusM: 10, blende: 4, brennweiteMm: 50, sensorBreiteMm: 9.6 }
    expect(bokehStaerke({ ...basis, blende: 1.8 })).toBeGreaterThan(bokehStaerke(basis))
    expect(bokehStaerke({ ...basis, brennweiteMm: 200 })).toBeGreaterThan(bokehStaerke(basis))
    expect(bokehStaerke({ ...basis, fokusM: 40 })).toBeLessThan(bokehStaerke(basis))
  })
})

describe('Mensch', () => {
  it('Normgroesse und Teile je Pose', () => {
    for (const pose of ['stehen', 'sitzen', 'jubeln'] as const) {
      const g = menschGeometrie(pose, 'niedrig')
      const box = g.boundingBox!
      const hoehe = box.max.y - box.min.y
      if (pose === 'stehen') expect(hoehe).toBeGreaterThan(1.65)
      if (pose === 'sitzen') expect(box.max.y).toBeLessThan(1.4)
      if (pose === 'jubeln') expect(box.max.y).toBeGreaterThan(1.9)
      expect(box.min.y).toBeGreaterThanOrEqual(-0.01)
      const teile = new Set(Array.from(g.getAttribute('teil').array as Float32Array))
      for (const t of Object.values(TEIL)) expect(teile.has(t)).toBe(true)
    }
  })

  it('Publikums-Detail bleibt billig, Buehnen-Detail ist feiner', () => {
    const dreiecke = (g: THREE.BufferGeometry) => (g.index ? g.index.count : g.getAttribute('position').count) / 3
    expect(dreiecke(menschGeometrie('stehen', 'niedrig'))).toBeLessThan(420)
    expect(dreiecke(menschGeometrie('stehen', 'hoch'))).toBeGreaterThan(dreiecke(menschGeometrie('stehen', 'niedrig')) * 4)
  })

  it('einzelner Mensch skaliert auf die Groesse und wirft Schatten', () => {
    const m = erzeugeMensch('stehen', { oben: '#fff', unten: '#000', haut: '#c99', haar: '#222' }, 1.9)
    m.geometry.computeBoundingBox()
    expect(m.geometry.boundingBox!.max.y).toBeGreaterThan(1.85)
    expect(m.castShadow).toBe(true)
    expect(m.geometry.getAttribute('color')).toBeDefined()
  })
})

describe('Publikum', () => {
  const plaetze = (n: number, pose: PublikumsPlatz['pose']): PublikumsPlatz[] =>
    Array.from({ length: n }, (_, i) => ({ x: i, y: 0, z: 0, blickDeg: -90, r: (i * 0.618) % 1, pose }))

  it('ein InstancedMesh je Pose, mit Farben je Person', () => {
    const g = erzeugePublikum([...plaetze(30, 'sitzen'), ...plaetze(20, 'stehen'), ...plaetze(5, 'jubeln')])
    expect(g.children).toHaveLength(3)
    const sitzend = g.children.find((c) => c.name === 'publikum-sitzen') as THREE.InstancedMesh
    expect(sitzend.count).toBe(30)
    expect(sitzend.geometry.getAttribute('aOben').count).toBe(30)
    expect(sitzend.castShadow).toBe(false)
  })

  it('duennt ueber der Obergrenze gleichmaessig aus', () => {
    const g = erzeugePublikum(plaetze(1000, 'stehen'), { max: 100 })
    expect((g.children[0] as THREE.InstancedMesh).count).toBe(100)
  })

  it('Varianten streuen in Groesse und Kleidung, deterministisch', () => {
    const v = Array.from({ length: 200 }, (_, i) => publikumsVariante(i / 200))
    expect(new Set(v.map((x) => x.oben)).size).toBeGreaterThan(8)
    expect(Math.min(...v.map((x) => x.groesse))).toBeGreaterThanOrEqual(1.58)
    expect(Math.max(...v.map((x) => x.groesse))).toBeLessThanOrEqual(1.94)
    expect(publikumsVariante(0.3)).toEqual(publikumsVariante(0.3))
  })

  it('Pose: Sitzbloecke sitzen, Stehflaechen stehen mit einem Teil jubelnd', () => {
    const r = Array.from({ length: 400 }, (_, i) => i / 400)
    expect(r.every((x) => poseFuer(false, x) === 'sitzen')).toBe(true)
    const jubel = r.filter((x) => poseFuer(true, x, 0.2) === 'jubeln').length / r.length
    expect(jubel).toBeGreaterThan(0.12)
    expect(jubel).toBeLessThan(0.28)
  })

  it('Sitze stehen auf jedem Platz', () => {
    expect(erzeugeSitze(plaetze(12, 'sitzen')).count).toBe(12)
  })
})

describe('Tribuene', () => {
  it('ebene Bestuhlung braucht keinen Koerper', () => {
    expect(erzeugeTribuene({ x: 0, y: 0, width: 10, rows: 5, rowSpacingM: 0.9, riseM: 0, baseHeightM: 0, rotationDeg: 0 })).toBeNull()
  })

  it('Stufen steigen bis zur letzten Reihe', () => {
    const t = erzeugeTribuene({ x: 5, y: 5, width: 10, rows: 10, rowSpacingM: 0.8, riseM: 0.4, baseHeightM: 0, rotationDeg: 0 })!
    t.geometry.computeBoundingBox()
    expect(t.geometry.boundingBox!.max.y).toBeCloseTo(3.6)
    expect(t.geometry.boundingBox!.max.z - t.geometry.boundingBox!.min.z).toBeCloseTo(7.2)
  })

  it('Plan-Drehung wird zur Welt-Drehung um −θ', () => {
    const t = erzeugeTribuene({ x: 0, y: 0, width: 10, rows: 2, rowSpacingM: 1, riseM: 0.5, baseHeightM: 0, rotationDeg: 90 })!
    const vorne = new THREE.Vector3(0, 0, -1).applyQuaternion(t.quaternion)
    // Plan 90°: der Block blickt nach +x, seine Vorderseite liegt bei +x.
    expect(vorne.x).toBeCloseTo(1)
  })
})

describe('Licht und Wand', () => {
  it('Dunstkegel sind von Verdeckung und Klick ausgenommen', () => {
    const k = erzeugeDunstStrahl({ von: new THREE.Vector3(0, 10, 0), nach: new THREE.Vector3(0, 0, 0), feldwinkelDeg: 20, farbe: '#fff', dunst: 0.5 })
    expect(k.userData[KEIN_AO]).toBe(true)
    const hits: THREE.Intersection[] = []
    k.raycast(new THREE.Raycaster(new THREE.Vector3(0, 5, 5), new THREE.Vector3(0, 0, -1)), hits)
    expect(hits).toHaveLength(0)
    expect((k.material as THREE.ShaderMaterial).defines.SCHRITTE).toBe(24)
  })

  it('Dichte und Ende lassen sich fuer photometrisch rechnende Planer festlegen', () => {
    const basis = { von: new THREE.Vector3(0, 10, 0), nach: new THREE.Vector3(0, 0, 0), feldwinkelDeg: 7, farbe: '#fff', dunst: 0.5 }
    const u = (k: THREE.Mesh) => (k.material as THREE.ShaderMaterial).uniforms
    expect(u(erzeugeDunstStrahl(basis)).uIntensitaet.value).toBeGreaterThan(1)
    const fest = u(erzeugeDunstStrahl({ ...basis, lichtstaerke: 0.4, endeWeich: false, vorwaerts: 0.6 }))
    expect(fest.uIntensitaet.value).toBe(0.4)
    expect(fest.uEndeWeich.value).toBe(0)
    expect(fest.uHG.value).toBe(0.6)
  })

  it('Scheinwerfer: echtes Licht nur auf Wunsch, sonst Lichtfleck', () => {
    const basis = { von: new THREE.Vector3(0, 8, 0), nach: new THREE.Vector3(0, 0, 2), farbe: '#fff', feldwinkelDeg: 25, dunst: 0.4 }
    const mit = erzeugeScheinwerfer({ ...basis, licht: true, schatten: true })
    const ohne = erzeugeScheinwerfer(basis)
    const spots = (g: THREE.Object3D) => { let n = 0; g.traverse((o) => { if ((o as THREE.SpotLight).isSpotLight) n++ }); return n }
    expect(spots(mit)).toBe(1)
    expect(spots(ohne)).toBe(0)
    expect(ohne.children.length).toBeGreaterThan(2)
  })

  it('LED-Wand: Raster aus dem Pixelabstand, Leuchtdichte ueber 1', () => {
    const w = erzeugeLedWand({ breiteM: 8, hoeheM: 4.5, pitchMm: 4 })
    const f = w.getObjectByName('ledwand-flaeche') as THREE.Mesh
    const u = (f.material as THREE.ShaderMaterial).uniforms
    expect(u.uPixel.value.x).toBeCloseTo(2000)
    expect(u.uHelligkeit.value).toBeGreaterThan(1)
  })

  it('Traverse liegt zwischen ihren Enden', () => {
    const t = erzeugeTraverse(new THREE.Vector3(0, 6, 0), new THREE.Vector3(10, 6, 0))
    expect(t.position.x).toBeCloseTo(5)
  })

  it('Oberflaechen ohne DOM fallen auf eine Farbe zurueck', () => {
    const m = oberflaechenMaterial('turf')
    expect(m.map).toBeNull()
    expect(m.roughness).toBeGreaterThan(0.5)
  })
})
