/**
 * Der Beleg-Weg der Shell (E-12).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER FRÜHER STAND — UND WARUM ES NIE LIEF
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Diese Datei suchte das iframe des Signal-Planers und schickte den Beleg per
 * `postMessage` dorthin, weil der Planer den API-Key server-seitig hielt. Der
 * Empfänger drüben hatte aber zwei Bedingungen, die sich gegenseitig
 * ausschliessen: die Brücke war nur im eingebetteten Fall aktiv, der Handler
 * dahinter brauchte die Electron-Preload-Brücke, die es nur im NICHT
 * eingebetteten Fall gibt. In keiner ausgelieferten Konfiguration entstand ein
 * Beleg (B-19).
 *
 * E-12 hat das entschieden: Buchhaltung ist eine Shell-Domäne. Sie hängt am
 * Projekt und nicht am Signalfluss, und sie ist für alle Module dieselbe. Der
 * Weg läuft jetzt über `window.__suiteLexware` in den Hauptprozess der Shell —
 * kein iframe, kein geöffneter Planer, keine Brücke dazwischen.
 *
 * WAS DAMIT ENTFÄLLT: die Fehlermeldung „Signal-Planer öffnen, um zu senden".
 * Sie war die Anleitung zu einem Weg, den es nicht gab.
 */
import type { BillingDoc } from '@avplan/lexware-core'

/** Was die Preload-Brücke der Shell für Lexware anbietet. */
export interface SuiteLexwareBridge {
  ping: () => Promise<{ ok: boolean; error?: string }>
  createDocument: (doc: BillingDoc) => Promise<{ ok: boolean; id?: string; webUrl?: string; error?: string }>
  setzeKey: (key: string) => Promise<{ ok: boolean; error?: string }>
  loescheKey: () => Promise<{ ok: boolean; error?: string }>
  hatKey: () => Promise<{ ok: boolean; vorhanden?: boolean; error?: string }>
}

declare global {
  interface Window {
    __suiteLexware?: SuiteLexwareBridge
  }
}

/** Die Brücke — oder nichts, wenn die Shell im Browser statt in Electron läuft. */
export function lexwareBridge(): SuiteLexwareBridge | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.__suiteLexware
  } catch {
    return undefined
  }
}

/**
 * Kann überhaupt gesendet werden?
 *
 * Das fragt nach der BRÜCKE und nicht nach dem Schlüssel: ob einer hinterlegt
 * ist, beantwortet `hatKey` — und die beiden Antworten dürfen nicht
 * zusammenfallen, weil sie verschiedene Abhilfen haben („in der Desktop-App
 * öffnen" gegen „Schlüssel eintragen").
 */
export function canSendLexware(): boolean {
  return lexwareBridge() !== undefined
}

export interface LexwareSendResult {
  ok: boolean
  id?: string
  webUrl?: string
  /** Klartext für die Anzeige. `noBridge`, wenn es die Desktop-Brücke nicht gibt. */
  error?: string
}

/** Einen Beleg anlegen. Antwortet immer, wirft nie. */
export async function sendLexware(doc: BillingDoc): Promise<LexwareSendResult> {
  const bridge = lexwareBridge()
  if (!bridge) return { ok: false, error: 'noBridge' }
  try {
    return await bridge.createDocument(doc)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unbekannter Fehler' }
  }
}
