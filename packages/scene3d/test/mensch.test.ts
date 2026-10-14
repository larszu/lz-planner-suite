import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  erzeugeMensch,
  erzeugePublikum,
  istSitzend,
  koerperGeometrie,
  menschGeometrie,
  menschMaterial,
  POSEN,
  TEIL_DETAIL,
  type Oberteil,
  type Schuhe,
  type Unterteil,
} from '../src/index'

const dreiecke = (g: THREE.BufferGeometry) => (g.index ? g.index.count : g.getAttribute('position').count) / 3
const endlich = (g: THREE.BufferGeometry) =>
  ['position', 'normal', 'tangent'].every((n) => Array.from(g.getAttribute(n).array as Float32Array).every(Number.isFinite))

describe('Mensch: Posen', () => {
  it('jede Pose in beiden Details: Hoehe stimmt, Fuesse am Boden', () => {
    for (const pose of POSEN) {
      for (const detail of ['niedrig', 'hoch'] as const) {
        const b = menschGeometrie(pose, detail).boundingBox!
        const name = `${pose}/${detail}`
        expect(b.min.y, name).toBeGreaterThan(-0.01)
        expect(b.min.y, name).toBeLessThan(0.005)
        if (pose === 'jubeln') expect(b.max.y, name).toBeGreaterThan(1.9)
        else if (istSitzend(pose)) {
          expect(b.max.y, name).toBeGreaterThan(1.25)
          expect(b.max.y, name).toBeLessThan(1.42)
        } else {
          expect(b.max.y, name).toBeGreaterThan(1.7)
          expect(b.max.y, name).toBeLessThan(1.78)
        }
      }
    }
  })

  it('Publikums-Detail bleibt bei 380 Dreiecken, auch fuer neue Posen', () => {
    // Alter Stand vor dem detaillierten Koerper: 380 je Figur.
    for (const pose of POSEN) expect(dreiecke(menschGeometrie(pose, 'niedrig')), pose).toBeLessThanOrEqual(380)
  })

  it('Detail hoch: glatte Huelle mit Normalen, Atem und Tangenten', () => {
    const g = menschGeometrie('stehen', 'hoch')
    expect(dreiecke(g)).toBeGreaterThan(15000)
    expect(dreiecke(g)).toBeLessThan(45000)
    expect(endlich(g)).toBe(true)
    expect(g.getAttribute('atem')).toBeDefined()
    const teile = new Set(Array.from(g.getAttribute('teil').array as Float32Array))
    for (const t of ['haut', 'oben', 'unten', 'haar', 'schuh', 'auge', 'iris', 'lippe', 'sohle'] as const) expect(teile.has(TEIL_DETAIL[t]), t).toBe(true)
  })
})

describe('Mensch: Gestalt', () => {
  it('alle Posen mit allen Kleidungen erzeugbar, ohne NaN', () => {
    const oben: Oberteil[] = ['tshirt', 'hemd', 'sakko', 'kleid']
    const unten: Unterteil[] = ['hose', 'rock']
    const schuhe: Schuhe[] = ['sneaker', 'halbschuh', 'stiefel']
    let i = 0
    for (const pose of POSEN) {
      for (const o of oben) {
        for (const u of unten) {
          const g = koerperGeometrie(pose, { oberteil: o, unterteil: u, schuhe: schuhe[i % 3], geschlecht: (i % 5) / 4, haarLaenge: (i % 4) * 0.15, statur: (['schlank', 'mittel', 'kraeftig'] as const)[i % 3] })
          i++
          expect(endlich(g), `${pose}/${o}/${u}`).toBe(true)
          expect(g.boundingBox!.min.y, `${pose}/${o}/${u}`).toBeGreaterThan(-0.01)
          g.dispose()
        }
      }
    }
  })

  it('Sakko bringt eine eigene Huelle, Rock und Kleid auch', () => {
    const basis = dreiecke(koerperGeometrie('stehen', { oberteil: 'hemd' }))
    const sakko = koerperGeometrie('stehen', { oberteil: 'sakko' })
    expect(dreiecke(sakko)).toBeGreaterThan(basis)
    expect(Array.from(sakko.getAttribute('teil').array as Float32Array)).toContain(TEIL_DETAIL.jacke)
    expect(dreiecke(koerperGeometrie('stehen', { oberteil: 'hemd', unterteil: 'rock' }))).toBeGreaterThan(basis)
  })

  it('Statur und Geschlecht veraendern die Breite, nicht die Groesse', () => {
    const breite = (g: THREE.BufferGeometry) => g.boundingBox!.max.x - g.boundingBox!.min.x
    const schlank = koerperGeometrie('stehen', { statur: 'schlank' })
    const kraeftig = koerperGeometrie('stehen', { statur: 'kraeftig' })
    expect(breite(kraeftig)).toBeGreaterThan(breite(schlank))
    const frau = koerperGeometrie('stehen', { geschlecht: 1, haarLaenge: 0 })
    const mann = koerperGeometrie('stehen', { geschlecht: 0, haarLaenge: 0 })
    expect(Math.abs(frau.boundingBox!.max.y - mann.boundingBox!.max.y)).toBeLessThan(0.03)
  })

  it('langes Haar haengt unter das Kinn, Glatze traegt kein Haar', () => {
    const tiefstesHaar = (g: THREE.BufferGeometry) => {
      const t = g.getAttribute('teil')
      const p = g.getAttribute('position')
      let min = Infinity
      for (let i = 0; i < t.count; i++) if (t.getX(i) === TEIL_DETAIL.haar) min = Math.min(min, p.getY(i))
      return min
    }
    expect(tiefstesHaar(koerperGeometrie('stehen', { haarLaenge: 0.4 }))).toBeLessThan(1.35)
    expect(tiefstesHaar(koerperGeometrie('stehen', { haarLaenge: 0.05 }))).toBeGreaterThan(1.45)
    // Augenbrauen tragen Haarfarbe, sonst nichts.
    expect(tiefstesHaar(koerperGeometrie('stehen', { haarLaenge: 0 }))).toBeGreaterThan(1.6)
  })

  it('Requisit nur, wo die Pose eines hat und es gewuenscht ist', () => {
    const hat = (g: THREE.BufferGeometry) => Array.from(g.getAttribute('teil').array as Float32Array).includes(TEIL_DETAIL.requisit)
    expect(hat(koerperGeometrie('mikrofon'))).toBe(true)
    expect(hat(koerperGeometrie('telefonieren'))).toBe(true)
    expect(hat(koerperGeometrie('mikrofon', { requisit: false }))).toBe(false)
    expect(hat(koerperGeometrie('stehen'))).toBe(false)
  })
})

describe('Mensch: erzeugeMensch und Material', () => {
  it('alter Aufruf bleibt gueltig: skaliert, Farben, Schatten, ein Material', () => {
    const m = erzeugeMensch('stehen', { oben: '#fff', unten: '#000', haut: '#c99', haar: '#222', langarm: true }, 1.9)
    m.geometry.computeBoundingBox()
    expect(m.geometry.boundingBox!.max.y).toBeGreaterThan(1.86)
    expect(m.geometry.boundingBox!.max.y).toBeLessThan(1.94)
    expect(Array.isArray(m.material)).toBe(false)
    expect(m.material).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(m.geometry.getAttribute('color')).toBeDefined()
    // Der Aufrufer gibt die Geometrie frei — der Cache darf nicht mitsterben.
    expect(m.geometry).not.toBe(menschGeometrie('stehen', 'hoch'))
  })

  it('neue Optionen wirken: Sakko-Farbe landet auf der Jacke', () => {
    const m = erzeugeMensch('sprechen', { oben: '#ffffff', unten: '#000000', haut: '#c99', haar: '#222', jacke: '#ff0000' }, 1.75, { oberteil: 'sakko', geschlecht: 1, haarLaenge: 0.3 })
    const t = m.geometry.getAttribute('teil')
    const c = m.geometry.getAttribute('color')
    const i = Array.from(t.array as Float32Array).indexOf(TEIL_DETAIL.jacke)
    expect(c.getX(i)).toBeCloseTo(1)
    expect(c.getY(i)).toBeCloseTo(0)
  })

  it('Shader-Anker existieren in dieser three-Version', () => {
    // Faellt ein Anker weg, fehlt still Wrap-Licht, Sheen-Maske oder Ruhebewegung.
    const mat = menschMaterial({ ruhe: 1, phase: 0.3 })
    const shader = {
      uniforms: {},
      vertexShader: THREE.ShaderLib.physical.vertexShader,
      fragmentShader: THREE.ShaderLib.physical.fragmentShader,
    } as unknown as THREE.WebGLProgramParametersWithUniforms
    mat.onBeforeCompile(shader, undefined as unknown as THREE.WebGLRenderer)
    expect(shader.vertexShader).toContain('uRuhe')
    expect(shader.fragmentShader).toContain('roughnessFactor = vRau')
    expect(shader.fragmentShader).toContain('material.sheenColor *= vStoff')
    expect(shader.fragmentShader).toContain('hautLicht')
    expect(mat.sheen).toBeGreaterThan(0)
    expect(mat.anisotropy).toBeGreaterThan(0)
    expect(mat.userData.ruhe.value).toBe(1)
  })

  it('Publikum im Detail hoch bekommt die erweiterten Teile, niedrig bleibt wie es war', () => {
    const plaetze = [{ x: 0, y: 0, z: 0, blickDeg: 0, r: 0.4, pose: 'stehen' as const }]
    const hoch = (erzeugePublikum(plaetze, { detail: 'hoch' }).children[0] as THREE.InstancedMesh).material as THREE.Material
    const niedrig = (erzeugePublikum(plaetze).children[0] as THREE.InstancedMesh).material as THREE.Material
    expect(hoch.defines?.MENSCH_DETAIL).toBeDefined()
    expect(niedrig.defines?.MENSCH_DETAIL).toBeUndefined()
  })
})
