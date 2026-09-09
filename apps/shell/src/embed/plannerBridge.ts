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
const frameListeningListeners = new Set<() => void>()

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

/** PlannerFrame abonniert Zeig-Bitten, sobald sein Rahmen bereit ist. */
export function onPlannerReveal(l: (req: PlannerRevealRequest) => void): () => void {
  revealListeners.add(l)
  frameListeningListeners.forEach((n) => n())
  return () => {
    revealListeners.delete(l)
  }
}

/**
 * Hoert gerade ein Rahmen auf Zeig-Bitten?
 *
 * B-18 — die Shell muss das FRAGEN koennen, nicht nur beim Senden erfahren.
 * Eine offene Zeig-Bitte (der Sprung, dessen Ziel-Planer noch laedt) will
 * wissen, ob sie schon zustellbar ist, ohne sie dabei abzuschicken: ein
 * Versuch, der scheitert, waere sonst nicht von einem unterscheidbar, der
 * ankam.
 */
export function plannerRevealListening(): boolean {
  return revealListeners.size > 0
}

/**
 * App: erfahren, WANN ein Rahmen zu horchen beginnt.
 *
 * Ohne dieses Signal muesste die Shell pollen. Der Rahmen meldet sich erst
 * nach dem `avplan:ready`-Handshake an (siehe `PlannerFrame`), also Sekunden
 * nach dem Modulwechsel — genau in dieser Luecke wartet die offene Bitte.
 *
 * BEWUSST OHNE INHALT: die Meldung sagt nur „jetzt hoert jemand", nicht wer.
 * Es ist immer hoechstens ein Planer-Rahmen gemountet, und die Bitte selbst
 * traegt ihr Modul mit sich — sie prueft es beim Zustellen, statt sich hier
 * auf eine zweite Angabe zu verlassen, die auseinanderlaufen koennte.
 */
export function onPlannerFrameListening(l: () => void): () => void {
  frameListeningListeners.add(l)
  return () => {
    frameListeningListeners.delete(l)
  }
}
