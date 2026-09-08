import { describe, expect, it } from 'vitest'
import { PROJECT, type SuiteProject } from '../src/data/project'
import { applyPatchToSuite, suiteToSeed } from '../src/data/seed'

// ───────────────────────────────────────────────────────────────────────────
// Der Raum geht zurueck — und zwar durch die Konfliktregel (B-39.1, E-21).
//
// WAS HIER HAENGT. Bis 2026-09-08 hatte `SeedPatch` kein `venue`: wer die
// Halle im MultiCam-Planer korrigierte, korrigierte sie nicht in der Shell.
// Der Rueckweg fehlte, weil die Regel fehlte — der Widerspruch war vermieden,
// indem eine Haelfte der Verbindung nicht gebaut wurde.
//
// Diese Datei prueft die SHELL-Seite davon, nicht die Regel selbst (die steht
// in `packages/ui/test/seedOwnership.test.ts`). Hier geht es um die drei
// Stellen, an denen die Shell die Regel wirkungslos machen koennte, ohne dass
// ein Test in `packages/ui` es merkt:
//
//   1. sie schickt die Halter nicht mit (`suiteToSeed`) — dann sieht die Regel
//      nie einen Halter und laesst alles durch;
//   2. sie nimmt vom Ergebnis nur den Seed und wirft die Befunde weg;
//   3. sie schreibt den Raum nicht ins Shell-Modell zurueck — dann ist der
//      Rueckweg zwar gebaut, aber ohne Wirkung.
// ───────────────────────────────────────────────────────────────────────────

const projekt = (over: Partial<SuiteProject> = {}): SuiteProject => ({
  ...PROJECT,
  hall: { w: 24, h: 14 },
  stage: { x: 8, y: 3, w: 8, h: 3.2 },
  ...over,
})

const uhr = () => 5000

describe('Der Raum kommt aus dem Planer zurueck', () => {
  it('uebernimmt die Halle und traegt den Halter ein', () => {
    const { project, conflicts } = applyPatchToSuite(
      projekt(),
      { domain: 'cameras', revision: 0, at: 1000, venue: { widthM: 30, heightM: 18 } },
      0,
      uhr,
    )
    expect(project.hall).toEqual({ w: 30, h: 18 })
    expect(project.seedHolds?.['venue.widthM']).toEqual({ by: 'cameras', at: 1000 })
    expect(conflicts).toEqual([])
    // Die Aenderung macht das Projekt ungespeichert — sonst ginge sie beim
    // naechsten Wechsel verloren, ohne dass jemand gefragt wird.
    expect(project.meta.saved).toBe(false)
  })

  it('schickt die Halter mit, sonst greift die Regel nie', () => {
    const p = projekt({ seedHolds: { 'venue.widthM': { by: 'cameras', at: 1000 } } })
    expect(suiteToSeed(p, 0).holds).toEqual({ 'venue.widthM': { by: 'cameras', at: 1000 } })
  })

  it('haelt den Wert und meldet den Befund, wenn ein zweiter Planer widerspricht', () => {
    const p = projekt({
      hall: { w: 30, h: 14 },
      seedHolds: { 'venue.widthM': { by: 'cameras', at: 1000 } },
    })
    const { project, conflicts } = applyPatchToSuite(
      p,
      { domain: 'fixtures', revision: 0, at: 2000, venue: { widthM: 26 } },
      0,
      uhr,
    )
    expect(project.hall.w).toBe(30)
    expect(conflicts).toHaveLength(1)
    // Der Befund steht AM PROJEKT und nicht nur im Rueckgabewert: er soll den
    // naechsten Rendervorgang ueberleben.
    expect(project.seedConflicts).toHaveLength(1)
    expect(project.seedConflicts?.[0].conflict.field).toBe('venue.widthM')
    expect(project.seedConflicts?.[0].seenAt).toBe(5000)
  })

  it('meldet auch dann, wenn sonst nichts einzieht', () => {
    // Der Fall, den E-21 sichtbar machen soll: der Planer hat gemeldet, und es
    // ist NICHTS passiert. Ohne Befund saehe das aus wie „nichts gesendet".
    const p = projekt({
      hall: { w: 30, h: 14 },
      seedHolds: { 'venue.widthM': { by: 'cameras', at: 1000 } },
    })
    const { project, conflicts } = applyPatchToSuite(
      p,
      { domain: 'fixtures', revision: 0, at: 2000, venue: { widthM: 26 }, fixtures: p.fixtures },
      0,
      uhr,
    )
    expect(conflicts).toHaveLength(1)
    expect(project.seedConflicts).toHaveLength(1)
  })

  it('sammelt Befunde, statt den vorigen zu ersetzen', () => {
    const p = projekt({
      hall: { w: 30, h: 14 },
      seedHolds: { 'venue.widthM': { by: 'cameras', at: 1000 } },
      seedConflicts: [
        {
          id: 'alt',
          seenAt: 1,
          conflict: {
            field: 'venue.widthM',
            held: { value: 30, by: 'cameras', at: 1000 },
            proposed: { value: 27, by: 'fixtures', at: 1500 },
          },
        },
      ],
    })
    const { project } = applyPatchToSuite(
      p,
      { domain: 'fixtures', revision: 0, at: 2000, venue: { widthM: 26 } },
      0,
      uhr,
    )
    expect(project.seedConflicts).toHaveLength(2)
  })

  it('verwirft eine Meldung auf ueberholtem Stand, Raum eingeschlossen', () => {
    const p = projekt()
    const { project, conflicts } = applyPatchToSuite(
      p,
      { domain: 'cameras', revision: 3, at: 1000, venue: { widthM: 30 } },
      7,
      uhr,
    )
    expect(project).toBe(p)
    expect(conflicts).toEqual([])
  })

  it('laesst die Shell-eigenen Felder stehen, die der Seed nicht kennt', () => {
    // Der Rueckweg baut die Listen aus dem gemergten Seed neu. Wuerde er dabei
    // `group`/`venue`/`linked` verlieren, waere die Bruecke ein Datenverlust.
    const p = projekt()
    const { project } = applyPatchToSuite(
      p,
      { domain: 'signal', revision: 0, at: 1000, devices: suiteToSeed(p, 0).devices },
      0,
      uhr,
    )
    expect(project.nodes.map((n) => n.group)).toEqual(p.nodes.map((n) => n.group))
    expect(project.cameras.map((c) => c.linked)).toEqual(p.cameras.map((c) => c.linked))
    expect(project.cables.map((c) => c.layer)).toEqual(p.cables.map((c) => c.layer))
  })
})
