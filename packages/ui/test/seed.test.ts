import { describe, expect, it } from 'vitest'
import {
  SUITE_SEED_KIND,
  SUITE_SEED_VERSION,
  applySeedPatch,
  emptySeed,
  isSuiteSeed,
  seedContentCount,
  type SuiteSeed,
} from '../src/seed'

// ───────────────────────────────────────────────────────────────────────────
// Das Protokoll selbst — vor allem die Revisions-Regel.
//
// Sie ist der Grund, warum diese Bruecke keine Schleife dreht: die Shell
// schiebt einen Seed, der Planer meldet seine Domaene zurueck, die Shell
// arbeitet sie ein — und wuerde ohne die Regel sofort einen neuen Seed mit
// hoeherer Revision schicken, den der Planer erneut uebernimmt. Das kostet
// nicht nur Runden, es ueberschreibt die naechste Aenderung im Planer.
// ───────────────────────────────────────────────────────────────────────────

const seed = (over: Partial<SuiteSeed> = {}): SuiteSeed => ({
  ...emptySeed(3),
  devices: [{ id: 'd1', name: 'A' }],
  cables: [{ id: 'c1', label: 'V-1', type: '12G-SDI', from: 'd1', to: 'd1' }],
  cameras: [{ id: 'k1', name: 'CAM 1' }],
  fixtures: [{ id: 'f1', name: 'LX 1' }],
  ...over,
})

describe('suite-seed — Formpruefung', () => {
  it('erkennt einen gueltigen Seed', () => {
    expect(isSuiteSeed(seed())).toBe(true)
  })

  it('weist alles zurueck, was nur so aussieht', () => {
    expect(isSuiteSeed(null)).toBe(false)
    expect(isSuiteSeed({ kind: SUITE_SEED_KIND })).toBe(false)
    expect(isSuiteSeed({ ...seed(), formatVersion: SUITE_SEED_VERSION + 1 })).toBe(false)
    expect(isSuiteSeed({ ...seed(), devices: 'viele' })).toBe(false)
  })

  it('zaehlt den Inhalt ueber alle Domaenen', () => {
    expect(seedContentCount(seed())).toBe(4)
    expect(seedContentCount(emptySeed())).toBe(0)
  })
})

describe('suite-seed — Rueckmeldung einarbeiten', () => {
  it('ersetzt nur die gemeldete Domaene', () => {
    const vorher = seed()
    const nachher = applySeedPatch(vorher, { domain: 'cameras', revision: 3, cameras: [] })
    expect(nachher.cameras).toEqual([])
    // Alles andere unangetastet — ein Kamera-Planer sagt nichts ueber Kabel.
    expect(nachher.devices).toEqual(vorher.devices)
    expect(nachher.cables).toEqual(vorher.cables)
    expect(nachher.fixtures).toEqual(vorher.fixtures)
  })

  it('nimmt bei „signal" Geraete und Kabel zusammen', () => {
    const nachher = applySeedPatch(seed(), {
      domain: 'signal',
      revision: 3,
      devices: [{ id: 'd2', name: 'B' }],
      cables: [],
    })
    expect(nachher.devices.map((d) => d.id)).toEqual(['d2'])
    expect(nachher.cables).toEqual([])
  })

  it('verwirft eine Meldung, die auf einer alten Revision beruht', () => {
    // Der Planer hatte einen ueberholten Stand — seine Meldung wuerde neueren
    // Inhalt mit aelterem ueberschreiben.
    const vorher = seed()
    expect(applySeedPatch(vorher, { domain: 'cameras', revision: 2, cameras: [] })).toBe(vorher)
  })

  it('laesst die Revision stehen', () => {
    // Genau das schneidet die Echo-Schleife ab: der eingearbeitete Stand ist
    // KEIN neuer Seed fuer den Planer, der ihn gerade gemeldet hat.
    const nachher = applySeedPatch(seed(), { domain: 'fixtures', revision: 3, fixtures: [] })
    expect(nachher.revision).toBe(3)
  })

  it('aendert nichts, wenn die Domaene ohne Daten gemeldet wird', () => {
    const vorher = seed()
    expect(applySeedPatch(vorher, { domain: 'cameras', revision: 3 })).toBe(vorher)
  })
})
