// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): E-11 — die Shell zeigt auf ein Objekt, und
// dieser Planer zeigt es. Oder sagt, dass er es nicht kennt.
//
// DER ID-RAUM IST DER DES SEED-PROTOKOLLS. `seedToCable` (in `shellSeed.ts`)
// uebernimmt die Seed-Id UNVERAENDERT als Geraete- bzw. Kabel-Id — deshalb
// braucht der Sprung keine Uebersetzungstabelle und darf keine haben. Eine
// zweite Zuordnung waere die zweite Wahrheit, gegen die ADR-001 geschrieben
// ist: sie liefe beim ersten Import auseinander, und der Sprung landete auf
// dem falschen Geraet, ohne es zu merken.
//
// WAS HIER NICHT PASSIERT: raten. Findet der Planer die Id nicht, sucht er
// NICHT nach einem aehnlichen Namen — das waere ein Namensabgleich fuer eine
// folgenreiche Entscheidung (ADR-002), und der Nutzer saehe ein Geraet, das
// er nicht gemeint hat, ohne Hinweis darauf. Er sagt „kenne ich nicht", und
// die Shell zeigt das.
// ───────────────────────────────────────────────────────────────────────────
import { connectShellReveal } from '@avplan/ui/embed'
import { useProjectStore } from '../store/projectStore'
import { triggerCanvasCenterOn } from './canvasViewport'
import { computeEquipmentLayout } from './equipmentLayout'

/**
 * Der Mittelpunkt eines Geraets — dorthin faehrt der Ausschnitt.
 *
 * Nicht die Ecke: ein Geraet, das gerade eben am Rand auftaucht, sieht aus wie
 * ein verfehlter Sprung. Die Groesse kommt aus derselben Funktion wie beim
 * Zeichnen, sonst zentriert der Sprung auf eine Box, die es so nicht gibt.
 */
const mitte = (item: { x: number; y: number }, breite: number, hoehe: number) => ({
  x: item.x + breite / 2,
  y: item.y + hoehe / 2,
})

export function initShellReveal(): () => void {
  return connectShellReveal((id, kind) => {
    const store = useProjectStore.getState()
    const projekt = store.project

    // Erst das Geraet: seine Lage ist bekannt, also kann der Ausschnitt
    // hinfahren. `kind` ist ein Hinweis und keine Zusicherung — steht dort
    // 'cable', wird trotzdem beides geprueft, nur in anderer Reihenfolge.
    const geraet = projekt.equipment?.find((e) => e.id === id)
    const kabel = projekt.cables?.find((c) => c.id === id)

    if (kind !== 'cable' && geraet) {
      store.setSelection(geraet.id, undefined, undefined)
      const { width, height } = computeEquipmentLayout(geraet, projekt.intercom)
      const p = mitte(geraet, width, height)
      triggerCanvasCenterOn(p.x, p.y)
      return { found: true }
    }

    if (kabel) {
      store.setSelection(undefined, kabel.id, undefined)
      // Der Ausschnitt faehrt zum Quell-Geraet des Kabels: ein Kabel hat
      // keine eigene Lage, und der Mittelpunkt zwischen zwei weit
      // auseinanderliegenden Geraeten zeigt oft auf leere Flaeche.
      const quelle = projekt.equipment?.find((e) => e.id === kabel.fromEquipmentId)
      if (quelle) {
        const { width, height } = computeEquipmentLayout(quelle, projekt.intercom)
        const p = mitte(quelle, width, height)
        triggerCanvasCenterOn(p.x, p.y)
      }
      return { found: true }
    }

    if (geraet) {
      // `kind` sagte 'cable', gefunden wurde ein Geraet. Der Planer
      // widerspricht — und zeigt trotzdem, was unter der Id steht.
      store.setSelection(geraet.id, undefined, undefined)
      const { width, height } = computeEquipmentLayout(geraet, projekt.intercom)
      const p = mitte(geraet, width, height)
      triggerCanvasCenterOn(p.x, p.y)
      return { found: true }
    }

    return {
      found: false,
      grund:
        kind === 'cable'
          ? 'Dieses Kabel steht nicht im Verkabelungsplan.'
          : 'Dieses Objekt steht nicht im Verkabelungsplan.',
    }
  })
}
