/**
 * Kleiner Shell-interner Bus, um Aktionen an den gerade gemounteten
 * Planer-Rahmen zu schicken. Es ist immer höchstens ein Planer-iframe aktiv
 * (nur das aktive Modul rendert PlannerFrame), daher genügt ein simpler
 * Listener-Satz — der aktive PlannerFrame abonniert und leitet an sein iframe
 * weiter.
 */

export type PlannerCommand = 'undo' | 'redo'

/** E-11 — „zeig mir dieses Objekt". Die Id ist die aus dem Seed-Protokoll. */
export interface PlannerRevealRequest {
  id: string
  kind?: 'device' | 'cable' | 'camera' | 'fixture'
}

const listeners = new Set<(cmd: PlannerCommand) => void>()
const revealListeners = new Set<(req: PlannerRevealRequest) => void>()

/** App → aktiver PlannerFrame: Aktion auslösen. */
export function sendPlannerCommand(cmd: PlannerCommand): void {
  listeners.forEach((l) => l(cmd))
}

/** PlannerFrame abonniert Kommandos, solange er gemountet ist. */
export function onPlannerCommand(l: (cmd: PlannerCommand) => void): () => void {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/**
 * App → aktiver PlannerFrame: ein Objekt zeigen.
 *
 * Gibt zurück, ob überhaupt ein Rahmen zugehört hat. Das ist nicht dasselbe wie
 * „gefunden": ein Planer, der gar nicht gemountet ist, kann nichts zeigen, und
 * die Shell soll den Unterschied kennen, statt auf eine Antwort zu warten, die
 * nie kommt.
 */
export function sendPlannerReveal(req: PlannerRevealRequest): boolean {
  if (revealListeners.size === 0) return false
  revealListeners.forEach((l) => l(req))
  return true
}

/** PlannerFrame abonniert Zeig-Bitten, solange er gemountet ist. */
export function onPlannerReveal(l: (req: PlannerRevealRequest) => void): () => void {
  revealListeners.add(l)
  return () => {
    revealListeners.delete(l)
  }
}
