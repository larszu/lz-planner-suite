import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GEAR_GONE, NO_TIME_ON_SHEET, surfacePlan, type SurfaceGrid } from '@avplan/ui'
import type { Rundown } from '@avplan/ui'
import type { SuiteSeed } from '@avplan/ui'

/**
 * Bedarf 45 — vom INHALT des Ablaufs auf die Bedienoberflaeche, nicht nur von
 * seiner Uhr. Und damit das fuenfte Ziel aus Bedarf 44: der Tastentext als
 * Ableitung statt als Abschrift.
 *
 * Die drei Fragen, die dieser Waechter stellt:
 *
 *  1. Kommt der Name aus dem Plan von HEUTE? Sonst waere das Blatt eine
 *     Abschrift und der Bedarf nicht erfuellt.
 *  2. Sagt es, was es auslaesst? (Bedarf 65.)
 *  3. Behauptet es NICHT, eine Companion-Importdatei zu sein? Companions
 *     HTTP-Schnittstelle hat keine Aktions-Route — eine Datei mit erfundenen
 *     Aktionen saehe importierbar aus (Invariante 18).
 */

const wurzel = join(__dirname, '..', '..', '..')
const lies = (p: string): string => readFileSync(join(wurzel, p), 'utf8')

const RASTER: SurfaceGrid = { spalten: 2, zeilen: 2 }

const seed: SuiteSeed = {
  kind: 'suite-seed',
  version: 1,
  revision: 1,
  projectName: 'Testabend',
  venue: { name: 'Halle' },
  cameras: [{ id: 'cam1', name: 'Kamera 1' }],
  fixtures: [],
  devices: [
    { id: 'dev1', name: 'Mischer' },
    { id: 'dev2', name: 'Recorder' },
  ],
  cables: [],
}

const ablauf = (items: Rundown['items']): Rundown => ({
  kind: 'suite-rundown',
  version: 1,
  items,
  source: { filename: 'ablauf.csv', importedAt: '2026-09-08T10:00:00.000Z', mapping: {} },
})

describe('Der Tastentext kommt aus dem Plan, nicht aus der Tabelle', () => {
  it('nimmt den Namen von heute und nicht den aus dem Ablauf', () => {
    const { blatt } = surfacePlan(
      ablauf([
        { id: 'i1', cue: '1', title: 'Begruessung', startMin: 14 * 60 + 20, refs: [{ kind: 'camera', id: 'cam1' }] },
      ]),
      seed,
      RASTER,
    )
    const zeile = blatt.rows[0]
    // Der Ablauf sagt „Begruessung"; der Name der Technik kommt aus dem Seed.
    // Wird die Kamera im Plan umbenannt, folgt die Beschriftung — genau das
    // ist der Unterschied zwischen Ableitung und Abschrift.
    expect(zeile).toContain('Kamera 1')
    expect(zeile).toContain('Begruessung')
    expect(zeile).toContain('14:20')
  })

  it('sagt es, wenn das Objekt aus dem Plan verschwunden ist', () => {
    const { blatt } = surfacePlan(
      ablauf([{ id: 'i1', title: 'Panel', refs: [{ kind: 'device', id: 'weg' }] }]),
      seed,
      RASTER,
    )
    // Eine Taste, die auf nichts mehr zeigt, ist schlimmer als keine — solange
    // sie nicht sagt, dass sie es tut.
    expect(blatt.rows[0]).toContain(GEAR_GONE)
  })

  it('schreibt „ohne Zeit" statt eine zu raten', () => {
    const { blatt } = surfacePlan(
      ablauf([{ id: 'i1', title: 'Offen', refs: [{ kind: 'device', id: 'dev1' }] }]),
      seed,
      RASTER,
    )
    expect(blatt.rows[0]).toContain(NO_TIME_ON_SHEET)
  })
})

describe('Was keine Taste bekommt, steht da', () => {
  it('laesst Punkte ohne Verweis aus und zaehlt sie', () => {
    const { blatt, ausgelassen } = surfacePlan(
      ablauf([
        { id: 'i1', title: 'Einlass', refs: [] },
        { id: 'i2', title: 'Panel', refs: [{ kind: 'device', id: 'dev1' }] },
        { id: 'i3', title: 'Pause', refs: [] },
      ]),
      seed,
      RASTER,
    )
    expect(blatt.rows).toHaveLength(1)
    expect(ausgelassen.map((a) => a.titel)).toEqual(['Einlass', 'Pause'])
    // Bedarf 65: die Zahl steht IM BLATT, nicht nur im Rueckgabewert — wer das
    // Papier in der Hand haelt, sieht sonst eine vollstaendige Belegung.
    expect(blatt.stand).toContain('2 Punkt(e) ohne Taste')
    expect(blatt.stand).toContain('Einlass')
  })

  it('sagt auch, wenn nichts ausgelassen wurde', () => {
    const { blatt } = surfacePlan(
      ablauf([{ id: 'i1', title: 'Panel', refs: [{ kind: 'device', id: 'dev1' }] }]),
      seed,
      RASTER,
    )
    // „Kein Punkt ausgelassen" ist eine Aussage; ein fehlender Satz ist keine.
    expect(blatt.stand).toContain('Kein Punkt ausgelassen')
  })
})

describe('Das Raster wird gesagt, nicht angenommen', () => {
  it('belegt zeilenweise und geht auf der naechsten Seite weiter', () => {
    const punkte = ['a', 'b', 'c', 'd', 'e'].map((t) => ({
      id: t,
      title: t,
      refs: [{ kind: 'device' as const, id: 'dev1' }],
    }))
    const { blatt } = surfacePlan(ablauf(punkte), seed, { spalten: 2, zeilen: 2 })
    const lage = blatt.rows.map((r) => `${r[0]}/${r[1]}/${r[2]}`)
    expect(lage).toEqual(['1/1/1', '1/1/2', '1/2/1', '1/2/2', '2/1/1'])
  })

  it('schreibt das benutzte Raster in die Stand-Zeile', () => {
    const { blatt } = surfacePlan(
      ablauf([{ id: 'i1', title: 'x', refs: [{ kind: 'device', id: 'dev1' }] }]),
      seed,
      { spalten: 3, zeilen: 5 },
    )
    // Ohne diese Angabe ist ein ausgedrucktes Blatt gegen eine andere
    // Oberflaeche nicht mehr lesbar — die Tastennummern stimmen dann nicht.
    expect(blatt.stand).toContain('3x5')
  })

  it('hat keine Raster-Zahl im Modul', () => {
    // ADR-002: erklaert, nicht geraten. Eine eingebaute 8x4 waere eine Annahme
    // ueber fremde Hardware, die auf dem Blatt wie eine Tatsache aussieht.
    const code = lies('packages/ui/src/surfacePlan.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((z) => !z.trim().startsWith('//'))
      .join('\n')
    expect(code).not.toMatch(/spalten\s*[:=]\s*\d/)
    expect(code).not.toMatch(/zeilen\s*[:=]\s*\d/)
  })
})

describe('Es gibt sich nicht als Importdatei aus', () => {
  it('nennt sich im Blatt einen Belegungsplan', () => {
    const { blatt } = surfacePlan(
      ablauf([{ id: 'i1', title: 'x', refs: [{ kind: 'device', id: 'dev1' }] }]),
      seed,
      RASTER,
    )
    // Wer sonst nach einer Importdatei sucht, sucht nach etwas, das es aus
    // gutem Grund nicht gibt: Companions HTTP-Schnittstelle kennt keine
    // Aktions-Route (nachgelesen in companionControl.ts, S-4).
    expect(blatt.stand).toContain('Belegungsplan, keine Importdatei')
    expect(blatt.stand).toContain('keine Aktions-Route')
  })

  it('erfindet keine Companion-Aktion', () => {
    const code = lies('packages/ui/src/surfacePlan.ts')
    for (const erfunden of ['"action"', "'action'", 'presets', 'feedbacks', 'instance_id', 'companion_config']) {
      expect(code).not.toContain(erfunden)
    }
  })
})

describe('Ein Blatt, ein CSV-Schreiber', () => {
  it('gibt die Blatt-Form der Ablauf-Sichten zurueck', () => {
    // Ein zweiter CSV-Schreiber waere `zwei-rechnungen`. Die Form ist
    // `GearSheet`, damit `rundownViewCsv` und `rundownViewRows` unveraendert
    // weiterlaufen.
    const { blatt } = surfacePlan(
      ablauf([{ id: 'i1', title: 'x', refs: [{ kind: 'device', id: 'dev1' }] }]),
      seed,
      RASTER,
    )
    expect(Object.keys(blatt).sort()).toEqual(['headers', 'legend', 'rows', 'stand'])
    expect(blatt.legend).toHaveLength(blatt.headers.length)
    expect(lies('packages/ui/src/surfacePlan.ts')).not.toMatch(/join\(';'\)|text\/csv/)
  })

  it('ist von der Oberflaeche aus erreichbar', () => {
    // Uebersetzter Code, den niemand rendert, ist kein Feature.
    expect(lies('apps/shell/src/shell/RundownCard.tsx')).toContain('surfacePlan(')
  })
})
