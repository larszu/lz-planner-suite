import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  belichtungAusEv,
  farbtemperaturK,
  Himmel,
  himmelDiffusLux,
  mondstand,
  ORTE,
  sonneDirektLux,
  sonnenstand,
  sonnenzeiten,
  tagesphase,
  WETTER,
} from '../src/index'

const { lat, lon } = ORTE.berlin

describe('Sonnenstand', () => {
  it('Berlin 21.06. Mittag ~61° im Sueden, Mitternacht unter dem Horizont', () => {
    const z = sonnenzeiten(new Date(Date.UTC(2026, 5, 21, 12)), lat, lon)
    const s = sonnenstand(z.mittag, lat, lon)
    expect(s.elevationDeg).toBeGreaterThan(60.5)
    expect(s.elevationDeg).toBeLessThan(62)
    expect(Math.abs(s.azimutDeg - 180)).toBeLessThan(1)
    // Sueden liegt bei Norden-oben auf +z.
    expect(s.richtung.z).toBeGreaterThan(0.45)
    expect(Math.abs(s.richtung.x)).toBeLessThan(0.02)
    expect(sonnenstand(new Date(Date.UTC(2026, 5, 21, 22)), lat, lon).elevationDeg).toBeLessThan(0)
  })

  it('Berlin 21.12. Mittag ~14°', () => {
    const z = sonnenzeiten(new Date(Date.UTC(2026, 11, 21, 12)), lat, lon)
    const e = sonnenstand(z.mittag, lat, lon).elevationDeg
    expect(e).toBeGreaterThan(13.5)
    expect(e).toBeLessThan(15)
  })

  it('nordDeg dreht den Grundriss: Norden rechts legt Sueden nach −x', () => {
    const z = sonnenzeiten(new Date(Date.UTC(2026, 5, 21, 12)), lat, lon)
    const r = sonnenstand(z.mittag, lat, lon, 90).richtung
    expect(r.x).toBeLessThan(-0.45)
    expect(Math.abs(r.z)).toBeLessThan(0.02)
    expect(r.length()).toBeCloseTo(1, 6)
  })

  it('Auf-/Untergang, goldene und blaue Stunde in richtiger Reihenfolge', () => {
    const z = sonnenzeiten(new Date(Date.UTC(2026, 5, 21, 12)), lat, lon)
    // Berlin Sommersonnenwende: Aufgang ~02:43 UTC, Untergang ~19:33 UTC.
    expect(z.aufgang!.getUTCHours()).toBe(2)
    expect(z.untergang!.getUTCHours()).toBe(19)
    const [bm0, bm1] = z.blaueStunde.morgens!
    const [gm0, gm1] = z.goldeneStunde.morgens!
    const [ga0, ga1] = z.goldeneStunde.abends!
    const [ba0, ba1] = z.blaueStunde.abends!
    const folge = [bm0, bm1, gm0, z.aufgang!, gm1, z.mittag, ga0, z.untergang!, ga1, ba0, ba1].map((d) => d.getTime())
    expect([...folge].sort((a, b) => a - b)).toEqual(folge)
    expect(bm1.getTime()).toBe(gm0.getTime())
    expect(z.immerOben || z.immerUnten).toBe(false)
  })

  it('Polarnacht: kein Aufgang', () => {
    const z = sonnenzeiten(new Date(Date.UTC(2026, 11, 21, 12)), 78.2, 15.6)
    expect(z.aufgang).toBeNull()
    expect(z.immerUnten).toBe(true)
  })

  it('Mondphase: Vollmond 26.10.2026 nahe 0,5 und fast voll', () => {
    const m = mondstand(new Date(Date.UTC(2026, 9, 26, 4)), lat, lon)
    expect(Math.abs(m.phase - 0.5)).toBeLessThan(0.03)
    expect(m.beleuchtet).toBeGreaterThan(0.97)
  })

  it('Tagesphasen nach Sonnenhoehe', () => {
    expect([20, 3, -6, -12, -30].map(tagesphase)).toEqual(['tag', 'goldene-stunde', 'blaue-stunde', 'daemmerung', 'nacht'])
  })
})

describe('Licht', () => {
  it('Farbtemperatur steigt monoton von ~2000 K auf 5600–6500 K', () => {
    let vor = 0
    for (let e = -10; e <= 90; e += 0.5) {
      const k = farbtemperaturK(e)
      expect(k).toBeGreaterThanOrEqual(vor)
      vor = k
    }
    expect(farbtemperaturK(0)).toBeLessThan(2600)
    expect(farbtemperaturK(60)).toBeGreaterThan(5600)
    expect(farbtemperaturK(90)).toBeLessThanOrEqual(6500)
  })

  it('klarer Mittag ~100 klx, Horizont dunkel, Daemmerung wenige Lux', () => {
    const mittag = sonneDirektLux(61) * Math.sin((61 * Math.PI) / 180) + himmelDiffusLux(61)
    expect(mittag).toBeGreaterThan(85000)
    expect(mittag).toBeLessThan(120000)
    expect(sonneDirektLux(-2)).toBe(0)
    expect(himmelDiffusLux(-6)).toBeGreaterThan(1)
    expect(himmelDiffusLux(-6)).toBeLessThan(10)
  })

  it('Belichtung: Nacht bleibt dunkler als Tag, aber nicht schwarz', () => {
    const tag = belichtungAusEv(15)
    const nacht = belichtungAusEv(-4)
    const grau = (lux: number, b: number) => (0.18 * lux * b) / Math.PI
    expect(grau(100000, tag)).toBeGreaterThan(grau(0.1, nacht) * 10)
    expect(grau(0.1, nacht)).toBeGreaterThan(0.002)
  })
})

describe('Himmel', () => {
  it('Wetter-Vorgaben sind vollstaendig und im Wertebereich', () => {
    const felder = Object.keys(WETTER.klar).sort()
    for (const w of Object.values(WETTER)) {
      expect(Object.keys(w).sort()).toEqual(felder)
      for (const v of Object.values(w)) expect(Number.isFinite(v)).toBe(true)
      expect(w.wolken).toBeGreaterThanOrEqual(0)
      expect(w.wolken).toBeLessThanOrEqual(1)
    }
    expect(Object.keys(WETTER).sort()).toEqual(['bedeckt', 'dunst', 'klar', 'leicht-bewoelkt'])
    expect(WETTER.bedeckt.direkt).toBeLessThan(WETTER.klar.direkt)
    expect(WETTER.bedeckt.schattenRadius).toBeGreaterThan(WETTER.klar.schattenRadius)
  })

  it('Mittag hell mit Sonnenschatten, Nacht mit Sternen und ohne Sonne', () => {
    const h = new Himmel({ sterne: 200 })
    const mittag = h.aktualisiere({ datum: new Date(Date.UTC(2026, 5, 21, 11, 13)), lat, lon })
    expect(mittag.phase).toBe('tag')
    expect(mittag.horizontalLux).toBeGreaterThan(80000)
    expect(mittag.ev100).toBeGreaterThan(14)
    expect(h.sonne.visible && h.sonne.castShadow).toBe(true)
    expect(h.sonne.shadow.intensity).toBeGreaterThan(0.7)
    expect(h.sterne.visible).toBe(false)
    expect(h.sonne.color.b).toBeGreaterThan(0.7)

    const kurz = h.aktualisiere({ datum: new Date(Date.UTC(2026, 5, 21, 23)), lat, lon })
    expect(kurz.phase).toBe('daemmerung')
    const tief = h.aktualisiere({ datum: new Date(Date.UTC(2026, 11, 21, 23)), lat, lon })
    expect(tief.phase).toBe('nacht')
    expect(h.sonne.visible).toBe(false)
    expect(h.sterne.visible).toBe(true)
    expect(tief.belichtung).toBeGreaterThan(mittag.belichtung * 1000)
    h.dispose()
  })

  it('bedeckt: weiche, schwache Schatten und weniger Licht', () => {
    const h = new Himmel({ sterne: 10 })
    const e = { datum: new Date(Date.UTC(2026, 5, 21, 11, 13)), lat, lon }
    const klar = h.aktualisiere({ ...e, wetter: 'klar' })
    const radiusKlar = h.sonne.shadow.radius
    const bedeckt = h.aktualisiere({ ...e, wetter: 'bedeckt' })
    expect(bedeckt.horizontalLux).toBeLessThan(klar.horizontalLux / 3)
    expect(h.sonne.shadow.intensity).toBeLessThan(0.3)
    expect(h.sonne.shadow.radius).toBeGreaterThan(radiusKlar)
    h.dispose()
  })

  it('Schattenkamera folgt der Szenengroesse; Sky-Shader traegt den Helligkeitsfaktor', () => {
    const h = new Himmel({ sterne: 10 })
    h.passeSchattenAn(200, new THREE.Vector3(10, 0, 5))
    expect(h.sonne.shadow.camera.right).toBeCloseTo(110)
    expect(h.sonne.target.position.x).toBe(10)
    const m = h.himmel.material as THREE.ShaderMaterial
    expect(m.fragmentShader).toContain('texColor * uHelligkeit')
    const z = h.aktualisiere({ datum: new Date(Date.UTC(2026, 5, 21, 11, 13)), lat, lon, wetter: 'dunst' })
    const szene = new THREE.Scene()
    h.wendeNebelAn(szene, z)
    expect(szene.fog).toBeInstanceOf(THREE.FogExp2)
    expect((szene.fog as THREE.FogExp2).density).toBeCloseTo(WETTER.dunst.nebelDichte * 0.2)
    h.dispose()
  })
})
