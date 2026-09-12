import { describe, expect, it } from 'vitest'
import { connectShellSeed, emptySeed, type SuiteSeed } from '@avplan/ui/embed'
import { applyPatchToSuite, suiteToSeed } from '../src/data/seed'
import { PROJECT } from '../src/data/project'

/**
 * DIE WEITERGABE — der Fehler, den ein Nutzer gemeldet hat, und die Regel,
 * die ihn nicht wiederkommen lässt.
 *
 * Meldung vom 2026-09-12: „wenn man im av planner den cable planner öffnet
 * stehen dort andere kameras als im multicam planner. das soll ja verknüpft
 * werden … sonst könnte ich alle apps ja standalone nutzen."
 *
 * Genau so war es. Der Rückweg war vollständig gebaut — MultiCam meldete
 * seine Kameras, die Shell arbeitete sie ein —, aber die Shell zählte die
 * Seed-Revision beim Einarbeiten bewusst NICHT hoch. Das schnitt die
 * Echo-Schleife ab (Planer meldet → Shell schiebt zurück → Planer
 * überschreibt seine eigene neuere Arbeit) und mit ihr die Weitergabe:
 * `connectShellSeed` übernimmt nur einen Seed mit HÖHERER Revision.
 *
 * Beides zusammen geht erst, seit der Seed seine Herkunft trägt. Dieser Test
 * hält die zwei Hälften fest, die sich gegenseitig bedingen:
 *
 *   1. Ein Seed mit fremder Herkunft wird übernommen — sonst keine Suite.
 *   2. Ein Seed mit EIGENER Herkunft wird nicht übernommen — sonst frisst
 *      der Hall die eigene Arbeit.
 *
 * Was dieser Test NICHT misst: ob die Shell nach einer Übergabe wirklich
 * hochzählt. Das steckt in `App.tsx` an einem `useCallback` und ist ohne
 * gerendertes Fenster nicht erreichbar; gemessen ist die Mechanik, auf der
 * es aufsetzt.
 */

/** Ein Fenster-Doppel, das gerade genug kann für `connectShellSeed`. */
function fensterDoppel() {
  const hoerer: ((e: MessageEvent) => void)[] = []
  const gesendet: unknown[] = []
  const parent = { postMessage: (m: unknown) => gesendet.push(m) }
  const w = {
    parent,
    addEventListener: (typ: string, f: (e: MessageEvent) => void) => {
      if (typ === 'message') hoerer.push(f)
    },
    removeEventListener: () => {},
    postMessage: (m: unknown) => gesendet.push(m),
  }
  ;(globalThis as { window?: unknown }).window = w
  ;(globalThis as { document?: unknown }).document = { title: 'Test' }
  return {
    gesendet,
    empfange: (seed: SuiteSeed) => {
      for (const f of hoerer) f({ data: { type: 'avplan:seed', seed } } as MessageEvent)
    },
  }
}

describe('Seed-Weitergabe zwischen den Planern', () => {
  it('übernimmt einen Seed aus einer FREMDEN Domäne', () => {
    const f = fensterDoppel()
    const uebernommen: SuiteSeed[] = []
    const conn = connectShellSeed({
      domain: 'signal',
      apply: (seed) => {
        uebernommen.push(seed)
      },
      collect: () => ({}),
    })
    f.empfange({ ...emptySeed(1), origin: 'cameras' })
    expect(uebernommen).toHaveLength(1)
    conn.dispose()
  })

  it('übernimmt den EIGENEN Hall nicht — und bleibt danach empfangsbereit', () => {
    const f = fensterDoppel()
    const uebernommen: SuiteSeed[] = []
    const conn = connectShellSeed({
      domain: 'cameras',
      apply: (seed) => {
        uebernommen.push(seed)
      },
      collect: () => ({}),
    })
    f.empfange({ ...emptySeed(1), origin: 'cameras' })
    expect(uebernommen).toHaveLength(0)
    // GEGENPROBE gegen das naheliegende Fehlverhalten: wer den Hall nur
    // wegwirft, ohne die Revision zu vermerken, laesst den naechsten Seed
    // der Shell mit derselben Revision durchfallen — und der Planer bliebe
    // stehen. Revision 2 muss ankommen.
    f.empfange({ ...emptySeed(2), origin: 'fixtures' })
    expect(uebernommen).toHaveLength(1)
    expect(uebernommen[0]?.revision).toBe(2)
    conn.dispose()
  })

  it('bietet nach einer inhaltlichen Meldung eine Übergabe an', () => {
    const patch = {
      domain: 'cameras' as const,
      revision: 0,
      cameras: [
        ...suiteToSeed(PROJECT, 0).cameras,
        { id: 'camNeu', name: 'CAM 9', model: 'Sony FX6', x: 2, y: 2 },
      ],
    }
    const { handoff } = applyPatchToSuite(PROJECT, patch, 0, () => 1_000, (n) => `h${n}`)
    expect(handoff?.domain).toBe('cameras')
    expect(handoff?.zusammenfassung.neu).toBe(1)
  })

  it('bietet KEINE Übergabe an, wenn die Meldung nichts ändert', () => {
    const patch = { domain: 'cameras' as const, revision: 0, cameras: suiteToSeed(PROJECT, 0).cameras }
    const { handoff } = applyPatchToSuite(PROJECT, patch, 0, () => 1_000, (n) => `h${n}`)
    expect(handoff).toBeUndefined()
  })
})
