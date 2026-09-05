import { describe, expect, it } from 'vitest'
import { SUITE_SEED_KIND, SUITE_SEED_VERSION, type SuiteSeed } from '@avplan/ui/embed'
import { SEED_BELEG, cableToSeedPatch, katalogTemplate, seedToCable } from '../src/renderer/lib/shellSeed'

// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY-TEST: der Projekt-Seed der Shell im Cable-Planer.
//
// Der Test misst die drei Regeln aus `shellSeed.ts` — und zwar in BEIDE
// Richtungen. Ein Guard, der nur „es kommt etwas an" prueft, waere hier
// nutzlos: der Schaden dieser Bruecke ist nicht, dass sie nichts liefert,
// sondern dass sie Ports und Stecker erfinden koennte, die es nicht gibt.
// ───────────────────────────────────────────────────────────────────────────

const seed = (over: Partial<SuiteSeed> = {}): SuiteSeed => ({
  kind: SUITE_SEED_KIND,
  formatVersion: SUITE_SEED_VERSION,
  revision: 1,
  projectName: 'Sommershow 2026',
  venue: { name: 'Halle A', widthM: 24, heightM: 14 },
  cameras: [],
  fixtures: [],
  devices: [],
  cables: [],
  ...over,
})

describe('shellSeed — Katalog-Aufloesung', () => {
  it('loest einen Namen auf, den der Katalog mit Hersteller-Praefix fuehrt', () => {
    // Die Shell schreibt „ATEM Constellation 8K", der Katalog
    // „Blackmagic ATEM Constellation 8K". Ohne die Suffix-Regel bliebe jedes
    // Geraet unaufgeloest und der ganze Seed waere portlos.
    const tmpl = katalogTemplate({ name: 'ATEM Constellation 8K' })
    expect(tmpl).toBeTruthy()
    expect(tmpl!.inputs.length).toBeGreaterThan(0)
  })

  it('nimmt den Teil hinter dem Gedankenstrich als Kandidat', () => {
    // Shell-Labels tragen die Instanz vorn: „MIX — ATEM Constellation 8K".
    expect(katalogTemplate({ name: 'MIX — ATEM Constellation 8K' })).toBeTruthy()
  })

  it('loest NICHT auf, was der Katalog nicht kennt', () => {
    expect(katalogTemplate({ name: 'Dimmer Rack 2' })).toBeNull()
    expect(katalogTemplate({ name: 'FOH — GrandMA' })).toBeNull()
  })
})

describe('shellSeed — Regel 1+2: nichts erfinden', () => {
  it('legt ein unaufgeloestes Geraet ohne Ports an und markiert es', () => {
    const { equipment } = seedToCable(seed({ devices: [{ id: 'd1', name: 'Dimmer Rack 2' }] }))
    expect(equipment).toHaveLength(1)
    expect(equipment[0].inputs).toHaveLength(0)
    expect(equipment[0].outputs).toHaveLength(0)
    expect(equipment[0].portsUnknown).toBe(true)
    // Ohne Ports gibt es nichts zu belegen — der Beleg gehoert nur an Ports,
    // die wirklich aus dem Seed entstanden sind.
    expect(equipment[0].specSource).toBeUndefined()
  })

  it('legt fuer ein Kabel je einen Anschluss am unaufgeloesten Geraet an — mit Beleg', () => {
    const { equipment, cables, ausgelassen } = seedToCable(
      seed({
        devices: [
          { id: 'cam', name: 'Sony FX9' },
          { id: 'dim', name: 'Dimmer Rack 2' },
        ],
        cables: [{ id: 'c1', label: 'V-012', type: '12G-SDI', lengthM: 45, from: 'cam', to: 'dim' }],
      }),
    )
    expect(ausgelassen).toHaveLength(0)
    expect(cables).toHaveLength(1)
    expect(cables[0].type).toBe('BNC')
    expect(cables[0].standard).toBe('SDI-12G')
    expect(cables[0].length).toBe(45)

    const cam = equipment.find((e) => e.id === 'cam')!
    expect(cam.outputs).toHaveLength(1)
    expect(cam.outputs[0].connectorType).toBe('BNC')
    expect(cam.portsUnknown).toBe(true)
    // Der Beleg ist der Grund, warum Pruefung 18 weiter nach dem Datenblatt
    // fragt, statt zu verstummen, weil „ja Ports da sind".
    expect(cam.specSource?.outputs?.source).toBe(SEED_BELEG)
  })

  it('erfindet keinen Stecker fuer einen unbekannten Kabeltyp', () => {
    const { cables, ausgelassen } = seedToCable(
      seed({
        devices: [
          { id: 'a', name: 'A' },
          { id: 'b', name: 'B' },
        ],
        cables: [{ id: 'c1', label: 'X-1', type: 'Irgendwas-Neues', from: 'a', to: 'b' }],
      }),
    )
    expect(cables).toHaveLength(0)
    expect(ausgelassen).toHaveLength(1)
    expect(ausgelassen[0].grund).toContain('Irgendwas-Neues')
  })
})

describe('shellSeed — Regel 3: an echter Hardware wird nichts angebaut', () => {
  it('laesst ein Kabel aus, sobald die echten Ports aufgebraucht sind', () => {
    // Datengetrieben statt mit einer geratenen Zahl: die Grenze ist die
    // BNC-Ausgangszahl des Datenblatts. Ein Kabel mehr als das Geraet Ausgaenge
    // hat, muss ausgelassen werden — ein zusaetzlicher Ausgang waere eine
    // Falschaussage ueber echte Hardware.
    //
    // (Die erste Fassung dieses Tests behauptete, ein ATEM habe keinen
    // XLR-Anschluss. Er hat welche — der Test fiel, der Code hatte recht.)
    const tmpl = katalogTemplate({ name: 'ATEM Constellation 8K' })!
    const bncAus = tmpl.outputs.filter((p) => p.connectorType === 'BNC').length
    expect(bncAus).toBeGreaterThan(0)

    const zuViele = bncAus + 1
    const { cables, ausgelassen } = seedToCable(
      seed({
        devices: [
          { id: 'atem', name: 'ATEM Constellation 8K' },
          { id: 'senke', name: 'Unbekanntes Geraet' },
        ],
        cables: Array.from({ length: zuViele }, (_, i) => ({
          id: `c${i}`,
          label: `V-${i}`,
          type: '12G-SDI',
          from: 'atem',
          to: 'senke',
        })),
      }),
    )
    expect(cables).toHaveLength(bncAus)
    expect(ausgelassen).toHaveLength(1)
    expect(ausgelassen[0].grund).toContain('BNC')
  })

  it('nutzt am aufgeloesten Geraet die echten Ports', () => {
    const { cables, equipment } = seedToCable(
      seed({
        devices: [
          { id: 'cam', name: 'Sony FX9' },
          { id: 'atem', name: 'ATEM Constellation 8K' },
        ],
        cables: [{ id: 'c1', label: 'V-008', type: '12G-SDI', from: 'cam', to: 'atem' }],
      }),
    )
    expect(cables).toHaveLength(1)
    const atem = equipment.find((e) => e.id === 'atem')!
    // Kein Port dazugekommen, kein Beleg — die Belegung kommt aus dem Datenblatt.
    expect(atem.portsUnknown).toBeUndefined()
    expect(atem.specSource).toBeUndefined()
    expect(atem.inputs.some((p) => p.id === cables[0].toPortId)).toBe(true)
  })

  it('belegt denselben Port nicht zweimal', () => {
    const { cables, ausgelassen } = seedToCable(
      seed({
        devices: [
          { id: 'a', name: 'Sony FX9' },
          { id: 'b', name: 'Sony FX9' },
        ],
        cables: [
          { id: 'c1', label: 'V-1', type: '12G-SDI', from: 'a', to: 'b' },
          { id: 'c2', label: 'V-2', type: '12G-SDI', from: 'a', to: 'b' },
        ],
      }),
    )
    expect(ausgelassen).toHaveLength(0)
    expect(cables).toHaveLength(2)
    expect(cables[0].fromPortId).not.toBe(cables[1].fromPortId)
    expect(cables[0].toPortId).not.toBe(cables[1].toPortId)
  })
})

describe('shellSeed — Rueckweg', () => {
  it('meldet Geraete und Kabel in Seed-Form zurueck', () => {
    const start = seed({
      devices: [
        { id: 'cam', name: 'Sony FX9', subtitle: '3x SDI Out', nx: 0.1, ny: 0.2 },
        { id: 'atem', name: 'ATEM Constellation 8K', nx: 0.6, ny: 0.2 },
      ],
      cables: [{ id: 'c1', label: 'V-008', type: '12G-SDI', lengthM: 45, from: 'cam', to: 'atem' }],
    })
    const { equipment, cables } = seedToCable(start)
    const zurueck = cableToSeedPatch({ equipment, cables })

    expect(zurueck.devices.map((d) => d.id)).toEqual(['cam', 'atem'])
    expect(zurueck.devices[0].subtitle).toBe('3x SDI Out')
    // Die normalisierte Lage ueberlebt den Umweg ueber Canvas-Pixel.
    expect(zurueck.devices[0].nx).toBeCloseTo(0.1, 2)
    expect(zurueck.devices[0].ny).toBeCloseTo(0.2, 2)
    expect(zurueck.cables).toHaveLength(1)
    expect(zurueck.cables[0].from).toBe('cam')
    expect(zurueck.cables[0].to).toBe('atem')
    expect(zurueck.cables[0].lengthM).toBe(45)
    // Zurueck geht die aussagekraeftigere Angabe: der Standard, nicht der Stecker.
    expect(zurueck.cables[0].type).toBe('SDI-12G')
  })
})
