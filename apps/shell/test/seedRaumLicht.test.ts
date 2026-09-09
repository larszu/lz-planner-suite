import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  SEED_BUEHNE_ID,
  mitSeedBuehne,
  seedToVenue,
} from '../../light-planner/src/core/shellSeed'
import { emptySeed, type SuiteSeed } from '@avplan/ui/embed'

/**
 * B-39 PUNKT 1, DIE LICHT-SEITE — der benannte Rest aus `suite#169`.
 *
 * Der Backlog fuehrt ihn seit dem Bau des Raum-Rueckwegs ausdruecklich als
 * offen, damit er nicht als erledigt durchgeht: „Der Licht-Planer liest den
 * Raum aus dem Seed heute gar nicht." Wer in der Suite auf „Licht" wechselte,
 * sah seine Scheinwerfer an den richtigen Koordinaten in einer leeren Flaeche.
 *
 * Geprueft ist hier die eine Frage, an der die Sache haengt: WAS aus einem
 * Raum, den light nicht modelliert, in light ankommen darf — und was nicht.
 */

const wurzel = join(__dirname, '..', '..', '..')
const lies = (p: string): string => readFileSync(join(wurzel, p), 'utf8')

const seed = (venue: Partial<SuiteSeed['venue']>): SuiteSeed => ({
  ...emptySeed(0),
  venue: { name: 'Halle 3', ...venue },
})

describe('Die Masse werden mitgefuehrt, nicht modelliert', () => {
  it('legt Breite, Hoehe und Namen in `venueForeign`', () => {
    // ADR-005: light HAT keine Raumgroesse. Es fuehrt sie mit, damit ein
    // Round-Trip einen 30 x 18 m grossen Raum nicht auf MultiCams Standard
    // 20 x 12 schrumpft.
    const { venueForeign } = seedToVenue(seed({ widthM: 30, heightM: 18 }))
    expect(venueForeign).toEqual({ widthM: 30, heightM: 18, name: 'Halle 3' })
  })

  it('laesst weg, was der Seed nicht nennt — statt es auf 0 zu setzen', () => {
    // „Keine Breite genannt" und „0 m breit" sind zwei Auskuenfte, und der
    // Unterschied entscheidet drueben, ob MultiCam seinen Standard einsetzt.
    //
    // BEIDE RICHTUNGEN, und das ist gegengeprobt: die erste Fassung pruefte
    // nur einen Seed MIT Breite und ohne Hoehe. Wer daraufhin die Breite fest
    // auf 0 setzte, kam durch — im gemessenen Fall war sie ja genannt. Deshalb
    // steht jedes Feld hier einmal als fehlend drin.
    const nurBreite = seedToVenue(seed({ widthM: 30 })).venueForeign
    expect(nurBreite).toEqual({ widthM: 30, name: 'Halle 3' })
    expect('heightM' in nurBreite).toBe(false)

    const nurHoehe = seedToVenue(seed({ heightM: 18 })).venueForeign
    expect(nurHoehe).toEqual({ heightM: 18, name: 'Halle 3' })
    expect('widthM' in nurHoehe).toBe(false)

    const keins = seedToVenue(seed({})).venueForeign
    expect(keins).toEqual({ name: 'Halle 3' })
  })
})

describe('Die Buehne ist eine Zeichnung und kein Bauteil', () => {
  it('macht aus der Buehnenflaeche ein Rechteck mit zwei Punkten', () => {
    const { buehne } = seedToVenue(seed({ stage: { x: 2, y: 3, w: 10, h: 6 } }))
    expect(buehne).toMatchObject({
      id: SEED_BUEHNE_ID,
      type: 'rect',
      points: [
        { x: 2, y: 3 },
        { x: 12, y: 9 },
      ],
    })
  })

  it('nennt den Raum in der Beschriftung', () => {
    const { buehne } = seedToVenue(seed({ stage: { x: 0, y: 0, w: 4, h: 4 } }))
    expect(buehne?.label).toContain('Halle 3')
  })

  it('erfindet keine Buehne, wo der Seed keine nennt', () => {
    expect(seedToVenue(seed({})).buehne).toBeNull()
    // Eine Flaeche ohne Ausdehnung ist keine Buehne, sondern ein Punkt. Sie
    // als Rechteck zu zeichnen zeigte einen Strich, den niemand geplant hat.
    expect(seedToVenue(seed({ stage: { x: 1, y: 1, w: 0, h: 5 } })).buehne).toBeNull()
    expect(seedToVenue(seed({ stage: { x: 1, y: 1, w: 5, h: 0 } })).buehne).toBeNull()
  })
})

describe('Ein zweiter Seed stapelt nichts und loescht nichts Fremdes', () => {
  const eigene = [
    { id: 'mass-1', type: 'measure' as const, points: [{ x: 0, y: 0 }], label: 'Abstand', color: '#fff' },
  ]

  it('ersetzt die eigene Buehne, statt eine zweite daneben zu legen', () => {
    const a = seedToVenue(seed({ stage: { x: 0, y: 0, w: 4, h: 4 } })).buehne
    const b = seedToVenue(seed({ stage: { x: 5, y: 5, w: 4, h: 4 } })).buehne
    const einmal = mitSeedBuehne(eigene, a)
    const zweimal = mitSeedBuehne(einmal, b)
    expect(zweimal.filter((s) => s.id === SEED_BUEHNE_ID)).toHaveLength(1)
    expect(zweimal.find((s) => s.id === SEED_BUEHNE_ID)?.points[0]).toEqual({ x: 5, y: 5 })
  })

  it('laesst die Zeichnungen des Nutzers stehen', () => {
    // Sonst kostete jede Raum-Aenderung in der Shell die Massketten und
    // Markierungen, die jemand hier von Hand gezogen hat.
    const nachher = mitSeedBuehne(eigene, seedToVenue(seed({ stage: { x: 0, y: 0, w: 4, h: 4 } })).buehne)
    expect(nachher.find((s) => s.id === 'mass-1')).toBeTruthy()
  })

  it('nimmt die Buehne weg, wenn der Seed keine mehr nennt', () => {
    // Sie gehoert dem Seed. Eine stehengebliebene zeigte eine Buehne, die es
    // im Plan nicht mehr gibt.
    const mit = mitSeedBuehne(eigene, seedToVenue(seed({ stage: { x: 0, y: 0, w: 4, h: 4 } })).buehne)
    const ohne = mitSeedBuehne(mit, seedToVenue(seed({})).buehne)
    expect(ohne.some((s) => s.id === SEED_BUEHNE_ID)).toBe(false)
    expect(ohne.find((s) => s.id === 'mass-1')).toBeTruthy()
  })
})

describe('Aus dem Raum werden keine Waende', () => {
  it('erzeugt kein Bauteil, das in die Lichtrechnung eingeht', () => {
    const code = lies('apps/light-planner/src/core/shellSeed.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((z) => !z.trim().startsWith('//'))
      .join('\n')
    // `Wall` traegt `reflectance`, `height` und `material` — vier erfundene
    // Waende aenderten JEDE Beleuchtungsstaerke im Plan, und zwar nach oben.
    // Eine Vermutung, die als Messung gelesen wird, mit einer Zahl am Ende,
    // die aussieht wie ein Ergebnis.
    expect(code).not.toMatch(/reflectance|walls|StageElement|mountingHeight:\s*0/)
  })

  it('die Buehne traegt keine Hoehe', () => {
    // Ein Podest hat eine; der Seed nennt keine. `height: 0` waere die
    // Behauptung „nicht erhoeht", ein geratener Wert waere schlimmer.
    const { buehne } = seedToVenue(seed({ stage: { x: 0, y: 0, w: 4, h: 4 } }))
    expect(buehne && 'height' in buehne).toBe(false)
    expect(buehne && 'depth' in buehne).toBe(false)
  })
})

describe('Die Verdrahtung', () => {
  it('der Raum wird VOR der Leer-Sperre uebernommen', () => {
    const hook = lies('apps/light-planner/src/core/useShellSeed.ts')
    const raum = hook.indexOf('seedToVenue(seed)')
    const sperre = hook.indexOf('seed.fixtures.length === 0')
    // Die Sperre ist eine Aussage ueber SCHEINWERFER. Den Raum mit ihr
    // wegzuwerfen hiesse, ihn aus einem Grund zu verlieren, der nichts mit ihm
    // zu tun hat.
    expect(raum).toBeGreaterThan(-1)
    expect(raum).toBeLessThan(sperre)
  })

  it('light schreibt den Raum NICHT zurueck', () => {
    // Light ist als Schreiber `fixtures` vorgesehen (E-21). Es modelliert
    // keine Raumgroesse — ein Rueckweg schriebe der Shell ihren eigenen Wert
    // zurueck und erzeugte bei jedem Durchlauf einen Widerspruch gegen sich
    // selbst.
    const bruecke = lies('apps/light-planner/src/core/shellSeed.ts')
    const rueckweg = bruecke.slice(bruecke.indexOf('export function fixturesToSeedPatch'))
    expect(rueckweg.slice(0, 700)).not.toMatch(/venue/)
    expect(lies('apps/light-planner/src/core/useShellSeed.ts')).toContain("domain: 'fixtures'")
  })

  it('es gibt EINEN Speicher fuer die fremden Raum-Masse', () => {
    // Der Datei-Import fuellt denselben Ref. Zwei waeren beim Speichern zwei
    // Kandidaten fuer dasselbe Feld.
    const app = lies('apps/light-planner/src/App.tsx')
    expect(app.match(/const preservedVenueRef = useRef/g) ?? []).toHaveLength(1)
    expect(app).toContain('setVenueForeign: (v) => {')
  })
})
