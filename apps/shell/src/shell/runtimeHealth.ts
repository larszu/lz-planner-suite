// ───────────────────────────────────────────────────────────────────────────
// Erreichbarkeit der vier Geräte — einmal gemessen, überall gezeigt.
//
// WARUM ZENTRAL. `RuntimeFrame` misst, ob „sein" Gerät antwortet, aber erst
// wenn man das Modul öffnet. Die Rail und die Status-Ansicht brauchen dieselbe
// Antwort, ohne dass jemand hinklickt: welche Anlage steht gerade bereit? Ohne
// eine gemeinsame Stelle würde jede Ansicht ihre eigene Messung fahren, und
// zwei Punkte im Fenster könnten Verschiedenes behaupten.
//
// WAS EIN PUNKT BEDEUTET, und was nicht: gemessen wird ein `fetch(…,
// no-cors)`. Die Antwort ist opak — sie sagt „dort antwortet ein Server", nicht
// „die Anwendung ist gesund". Deshalb heißt der Zustand `on`/`off` und nicht
// „bereit"; und `unknown` bleibt ein eigener Zustand, weil ein grauer Punkt
// sonst eine Aussage wäre, die noch niemand gemessen hat.
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { RUNTIMES, type RuntimeId } from '../modules/runtimes'
import { runtimeUrl, type RuntimeAddresses } from './runtimeHosts'

export type RuntimeStatus = 'on' | 'off' | 'unknown'
export type RuntimeHealth = Record<RuntimeId, RuntimeStatus>

const UNBEKANNT = (): RuntimeHealth =>
  RUNTIMES.reduce((acc, r) => {
    acc[r.id] = 'unknown'
    return acc
  }, {} as RuntimeHealth)

/** Eine Adresse anklopfen. Antwortet immer, wirft nie. */
export async function pruefeAdresse(url: string, fristMs = 3000): Promise<RuntimeStatus> {
  const ctrl = new AbortController()
  const frist = setTimeout(() => ctrl.abort(), fristMs)
  try {
    await fetch(url, { mode: 'no-cors', signal: ctrl.signal, cache: 'no-store' })
    return 'on'
  } catch {
    return 'off'
  } finally {
    clearTimeout(frist)
  }
}

/**
 * Erreichbarkeit aller vier Geräte, alle `intervallMs` neu gemessen.
 *
 * Das Intervall ist bewusst träge (Vorgabe 30 s): der Punkt beantwortet
 * „steht die Anlage?", keine Sekundenfrage. Häufiger zu klopfen hieße, vier
 * Geräte im Produktionsnetz dauernd zu belasten, ohne dass jemand mehr sieht.
 */
export function useRuntimeHealth(adressen: RuntimeAddresses, intervallMs = 30_000): RuntimeHealth {
  const [health, setHealth] = useState<RuntimeHealth>(UNBEKANNT)
  // Die Adressen als Zeichenkette: so laeuft der Effekt neu, wenn sich eine
  // Adresse aendert, aber nicht bei jedem Render mit gleichem Inhalt.
  const schluessel = RUNTIMES.map((r) => runtimeUrl(r.id, adressen)).join('|')

  useEffect(() => {
    let verworfen = false
    const runde = async () => {
      const paare = await Promise.all(
        RUNTIMES.map(async (r) => [r.id, await pruefeAdresse(runtimeUrl(r.id, adressen))] as const),
      )
      if (verworfen) return
      setHealth(Object.fromEntries(paare) as RuntimeHealth)
    }
    void runde()
    const timer = window.setInterval(() => void runde(), intervallMs)
    return () => {
      verworfen = true
      window.clearInterval(timer)
    }
    // `adressen` steckt in `schluessel` — als Objekt waere es bei jedem Render neu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel, intervallMs])

  return health
}
