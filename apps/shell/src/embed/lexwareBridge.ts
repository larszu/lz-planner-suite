/**
 * Shell → Planer: einen Lexware-Beleg an den geöffneten Signal-Planer (cable)
 * schicken, der den API-Key server-seitig hält. Der Beleg läuft bewusst NICHT
 * aus dem Browser direkt an Lexware (CORS + Key-Schutz), sondern über den Planer.
 */
import { requestLexware, type LexwareRequestResult } from '@avplan/ui'
import type { BillingDoc } from '@avplan/lexware-core'
import { MODULE_BY_ID } from '../modules/registry'

/** iframe-Fenster des Signal-Planers finden (der die Lexware-Anbindung trägt). */
function signalPlannerWindow(): Window | null {
  const url = MODULE_BY_ID.signal.plannerUrl
  if (!url) return null
  const host = (() => {
    try {
      return new URL(url).host
    } catch {
      return url
    }
  })()
  const frames = Array.from(document.querySelectorAll('iframe'))
  const match = frames.find((f) => {
    const src = f.getAttribute('src') ?? ''
    return src.includes(host) || src.includes(url)
  })
  return match?.contentWindow ?? null
}

/** true, wenn ein Signal-Planer-iframe gemountet ist (Senden möglich). */
export function canSendLexware(): boolean {
  return signalPlannerWindow() !== null
}

/** Beleg an den Signal-Planer schicken und auf das Ergebnis warten. */
export function sendLexware(doc: BillingDoc): Promise<LexwareRequestResult> {
  const win = signalPlannerWindow()
  if (!win) {
    return Promise.resolve({ ok: false, error: 'needSignal' })
  }
  return requestLexware(win, 'create', doc)
}
