import { connectShellLexware } from '@avplan/ui/embed'

/**
 * Suite-Shell-Bridge: die Shell fordert das Anlegen eines Lexware-Belegs (bzw.
 * einen Key-Ping) an, hier reichen wir das an den Lexware-IPC im Main-Prozess
 * weiter. No-op im Standalone-/Desktop-Betrieb (die Bruecke prueft window.parent).
 */
export function initShellLexware(): () => void {
  return connectShellLexware(async (action, doc) => {
    if (action === 'ping') {
      const r = await window.cablePlanner!.lexware.ping()
      if (!r.ok) throw new Error(r.error || 'Ping fehlgeschlagen')
      return {}
    }
    return window.cablePlanner!.lexware.createDocument(doc)
  })
}
