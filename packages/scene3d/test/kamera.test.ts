import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  entsorgeKameraCache,
  erzeugeHalterung,
  erzeugeKameraRig,
  erzeugeObjektiv,
  halterungsKnoten,
  kameraCacheGroesse,
  objektivMasse,
  type HalterungArt,
  type KoerperArt,
} from '../src/index'

const KOERPER: KoerperArt[] = ['cinema', 'studio', 'eng', 'spiegellos', 'ptz']
const HALTERUNGEN: HalterungArt[] = ['stativ', 'pedestal', 'kran', 'slider', 'dolly', 'schulter', 'wand', 'decke', 'keine']

function keineNaN(wurzel: THREE.Object3D): void {
  wurzel.updateMatrixWorld(true)
  wurzel.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const pos = m.geometry.getAttribute('position')
    expect(pos.count).toBeGreaterThan(0)
    for (const w of pos.array as Float32Array) expect(Number.isFinite(w)).toBe(true)
    for (const w of m.matrixWorld.elements) expect(Number.isFinite(w)).toBe(true)
  })
}

const nah = (a: THREE.Vector3, b: THREE.Vector3, eps = 1e-6): void => {
  expect(a.distanceTo(b)).toBeLessThan(eps)
}

describe('Kamera-Rig', () => {
  for (const koerper of KOERPER) {
    for (const halterung of HALTERUNGEN) {
      it(`${koerper} auf ${halterung}: Optik auf hoeheM, Blick nach +x, keine NaN`, () => {
        const rig = erzeugeKameraRig({ koerper, halterung, hoeheM: 1.7, detail: 'niedrig' })
        const { ursprung, richtung } = rig.optischeAchse()
        expect(ursprung.y).toBeCloseTo(1.7, 6)
        nah(richtung, new THREE.Vector3(1, 0, 0))
        expect(ursprung.x).toBeGreaterThan(0)
        expect(Math.abs(ursprung.z)).toBeLessThan(1e-9)
        keineNaN(rig.gruppe)
        rig.dispose()
      })
    }
  }

  it('benennt alle Knoten und findet sie per Name', () => {
    const rig = erzeugeKameraRig({ koerper: 'cinema', halterung: 'stativ', matteBox: true })
    for (const n of ['kameraRig', 'halterung', 'panGelenk', 'tiltGelenk', 'platte', 'montagepunkt', 'koerper', 'objektiv', 'optischeAchse', 'matteBox']) {
      expect(rig.gruppe.getObjectByName(n), n).toBeDefined()
    }
    expect(rig.knoten.optischeAchse.name).toBe('optischeAchse')
    expect(rig.knoten.objektiv).not.toBeNull()
  })

  for (const halterung of ['stativ', 'kran', 'wand', 'decke'] as HalterungArt[]) {
    for (const koerper of ['eng', 'ptz'] as KoerperArt[]) {
      it(`${koerper} auf ${halterung}: Pan dreht +x nach +z, Tilt positiv hebt den Blick`, () => {
        const rig = erzeugeKameraRig({ koerper, halterung, pan: 90, detail: 'niedrig' })
        nah(rig.optischeAchse().richtung, new THREE.Vector3(0, 0, 1))
        rig.stelle(0, 30)
        const r = rig.optischeAchse().richtung
        nah(r, new THREE.Vector3(Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), 0))
        rig.stelle(-45, -20)
        const s = rig.optischeAchse().richtung
        expect(s.y).toBeCloseTo(-Math.sin((20 * Math.PI) / 180), 6)
        expect(Math.atan2(s.z, s.x)).toBeCloseTo((-45 * Math.PI) / 180, 6)
      })
    }
  }

  it('PTZ haelt die Optik bei jedem Pan/Tilt auf der Achshoehe', () => {
    for (const halterung of ['wand', 'decke', 'stativ'] as HalterungArt[]) {
      const rig = erzeugeKameraRig({ koerper: 'ptz', halterung, hoeheM: 2.2, pan: 30, tilt: -25, detail: 'niedrig' })
      const { ursprung, richtung } = rig.optischeAchse()
      // Die Optik liegt auf der Neigeachse: Front = Achspunkt + Abstand × Blick.
      const neigeachse = new THREE.Vector3(0, 2.2, 0)
      const abstand = ursprung.distanceTo(neigeachse)
      nah(ursprung.clone().sub(richtung.clone().multiplyScalar(abstand)), neigeachse)
    }
  })

  it('die Halterung folgt rigDrehungDeg, der Kopf dem Pan', () => {
    const rig = erzeugeKameraRig({ koerper: 'cinema', halterung: 'kran', pan: 40, rigDrehungDeg: 0, armLaengeM: 3 })
    rig.gruppe.updateMatrixWorld(true)
    const m = new THREE.Vector3().setFromMatrixPosition(rig.knoten.montagepunkt.matrixWorld)
    expect(m.z).toBeCloseTo(0, 6)
    expect(m.x).toBeLessThan(-1)
    const r = rig.optischeAchse().richtung
    expect(Math.atan2(r.z, r.x)).toBeCloseTo((40 * Math.PI) / 180, 6)
  })

  it('Kran haelt die Kopfhoehe auch bei extremer Neigung', () => {
    for (const neigungDeg of [-60, 0, 45, 80]) {
      const rig = erzeugeKameraRig({ koerper: 'cinema', halterung: 'kran', hoeheM: 3, armLaengeM: 4, neigungDeg, detail: 'niedrig' })
      expect(rig.optischeAchse().ursprung.y).toBeCloseTo(3, 6)
      keineNaN(rig.gruppe)
    }
  })

  it('Stativ steht auf dem Boden und spreizt mit der Hoehe', () => {
    const breite = (h: number, spinne: 'boden' | 'mittel' | 'keine'): number => {
      const g = erzeugeHalterung({ art: 'stativ', plattenHoeheM: h, spinne, detail: 'niedrig' })
      const box = new THREE.Box3().setFromObject(g)
      expect(box.min.y).toBeGreaterThanOrEqual(-1e-6)
      expect(box.min.y).toBeLessThan(0.02)
      expect(box.max.y).toBeCloseTo(h, 2)
      return box.max.x - box.min.x
    }
    expect(breite(1.8, 'boden')).toBeGreaterThan(breite(0.8, 'boden'))
    const hk = halterungsKnoten(erzeugeHalterung({ art: 'stativ', plattenHoeheM: 1.3, spinne: 'mittel' }))
    hk.platte.updateWorldMatrix(true, false)
    expect(new THREE.Vector3().setFromMatrixPosition(hk.platte.matrixWorld).y).toBeCloseTo(1.3, 9)
  })

  it('Objektivlaenge waechst mit der Brennweite, Front-Knoten am Ende', () => {
    expect(objektivMasse({ art: 'cinePrime', brennweiteMm: 135 }).laengeM).toBeGreaterThan(objektivMasse({ art: 'cinePrime', brennweiteMm: 25 }).laengeM)
    expect(objektivMasse({ art: 'box' }).laengeM).toBeGreaterThan(objektivMasse({ art: 'eng' }).laengeM)
    const o = erzeugeObjektiv({ art: 'cineZoom', brennweiteMm: 70 })
    expect(o.getObjectByName('objektivFront')?.position.x).toBeCloseTo(objektivMasse({ art: 'cineZoom', brennweiteMm: 70 }).laengeM, 9)
    keineNaN(o)
  })

  it('hoch hat mehr Details als niedrig; Teile werfen Schatten', () => {
    const zaehle = (r: THREE.Object3D): number => { let n = 0; r.traverse((o) => { if ((o as THREE.Mesh).isMesh) n++ }); return n }
    const hoch = erzeugeKameraRig({ koerper: 'cinema', halterung: 'stativ', detail: 'hoch' })
    const niedrig = erzeugeKameraRig({ koerper: 'cinema', halterung: 'stativ', detail: 'niedrig' })
    expect(zaehle(hoch.gruppe)).toBeGreaterThan(zaehle(niedrig.gruppe))
    let wirft = 0
    hoch.gruppe.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.castShadow && o.receiveShadow) wirft++ })
    expect(wirft).toBeGreaterThan(20)
  })

  it('teilt Geometrien und Materialien; dispose laesst den Cache stehen', () => {
    entsorgeKameraCache()
    const a = erzeugeKameraRig({ koerper: 'studio', halterung: 'pedestal' })
    const nachEinem = kameraCacheGroesse()
    const b = erzeugeKameraRig({ koerper: 'studio', halterung: 'pedestal' })
    expect(kameraCacheGroesse()).toEqual(nachEinem)
    const glasA = a.gruppe.getObjectByName('frontglas') as THREE.Mesh
    const glasB = b.gruppe.getObjectByName('frontglas') as THREE.Mesh
    expect(glasA.geometry).toBe(glasB.geometry)
    expect(glasA.material).toBe(glasB.material)
    a.dispose()
    expect(a.gruppe.parent).toBeNull()
    expect(kameraCacheGroesse()).toEqual(nachEinem)
    entsorgeKameraCache()
    expect(kameraCacheGroesse()).toEqual({ geometrien: 0, materialien: 0 })
  })
})
