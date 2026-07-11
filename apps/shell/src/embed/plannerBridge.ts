/**
 * Kleiner Shell-interner Bus, um Aktionen (Undo/Redo) an den gerade gemounteten
 * Planer-Rahmen zu schicken. Es ist immer höchstens ein Planer-iframe aktiv
 * (nur das aktive Modul rendert PlannerFrame), daher genügt ein simpler
 * Listener-Satz — der aktive PlannerFrame abonniert und leitet an sein iframe
 * weiter.
 */

export type PlannerCommand = 'undo' | 'redo'

const listeners = new Set<(cmd: PlannerCommand) => void>()

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
