// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): Anschluss des Projekt-Seeds an den Store.
//
// Die Abbildung selbst steht in `shellSeed.ts` und ist eine reine Funktion,
// damit sie headless testbar ist. Hier haengt nur die Mechanik: uebernehmen,
// wenn die Shell einen neueren Stand schickt, und den eigenen Stand nach
// Aenderungen zurueckmelden.
// ───────────────────────────────────────────────────────────────────────────
import { connectShellSeed, type SuiteSeed } from '@avplan/ui/embed'
import { useProjectStore } from '../store/projectStore'
import { triggerCanvasFitView } from './canvasViewport'
import { cableToSeedPatch, seedToCable } from './shellSeed'

/** Sammelmeldungen fuer die Konsole, damit ausgelassene Kabel nicht still sind. */
const melde = (seed: SuiteSeed, ausgelassen: { label: string; grund: string }[]): void => {
  const name = seed.projectName ? `„${seed.projectName}"` : 'Shell-Projekt'
  console.info(
    `[shellSeed] ${name} uebernommen: ${seed.devices.length} Geraete, ${seed.cables.length - ausgelassen.length}/${seed.cables.length} Kabel`,
  )
  for (const a of ausgelassen) console.warn(`[shellSeed] Kabel „${a.label}" nicht angelegt — ${a.grund}`)
}

/**
 * Projekt-Fluss Shell -> Cable-Planer und zurueck. No-op im Standalone-/
 * Desktop-Betrieb (dort ist `window.parent === window`).
 */
export function initShellSeed(): () => void {
  let letzteMeldung = ''
  const conn = connectShellSeed({
    domain: 'signal',
    apply: (seed) => {
      const store = useProjectStore.getState()
      const aktuell = store.project
      const hatInhalt = (aktuell.equipment?.length ?? 0) > 0 || (aktuell.cables?.length ?? 0) > 0
      // Ein leerer Seed darf einen gefuellten Plan nicht loeschen. Der Fall
      // tritt real auf: die Shell steht auf „kein Projekt" und schiebt
      // trotzdem — dann ist Nichtstun die richtige Antwort, nicht ein leerer
      // Canvas ohne Erklaerung.
      if (seed.devices.length === 0 && seed.cables.length === 0 && hatInhalt) return false

      const { equipment, cables, ausgelassen } = seedToCable(seed)
      melde(seed, ausgelassen)
      store.loadProject({
        ...aktuell,
        metadata: {
          ...aktuell.metadata,
          ...(seed.projectName ? { name: seed.projectName } : {}),
        },
        equipment,
        cables,
      })
      // Ohne das steht der Plan zwar im Store, der Nutzer sieht aber den
      // Ausschnitt von vorher — beim Erststart also fast leeren Canvas mit
      // einem angeschnittenen Geraet am Rand. Gemessen am gebauten Stand.
      // Der Aufruf laeuft nach dem Render, sonst kennt ReactFlow die neuen
      // Knoten noch nicht.
      setTimeout(triggerCanvasFitView, 120)
      return true
    },
    collect: () => cableToSeedPatch(useProjectStore.getState().project),
  })

  // Nur melden, wenn sich am gemeldeten Teil wirklich etwas geaendert hat:
  // der Store feuert auch fuer Auswahl, Zoom und Panel-Zustand, und jede
  // dieser Meldungen liefe sonst als postMessage durch die Shell.
  const unsubscribe = useProjectStore.subscribe((state) => {
    const patch = JSON.stringify(cableToSeedPatch(state.project))
    if (patch === letzteMeldung) return
    letzteMeldung = patch
    conn.publish()
  })

  return () => {
    unsubscribe()
    conn.dispose()
  }
}
