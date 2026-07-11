/**
 * Shell-Bridge: Protokoll zwischen der Shell und den eingebetteten Planer-
 * iframes. Bewusst schlank (postMessage-Eventbus), weil die Planer weiter
 * eigenständige Apps mit eigenem Store/CSS bleiben — die iframe-Isolation ist
 * genau der Grund, dass die Einbettung bestehende Funktionalität nicht bricht.
 */

export type ResolvedTheme = 'dark' | 'light'

export interface ThemeMessage {
  type: 'avplan:theme'
  theme: ResolvedTheme
  /** Aufgelöste Shell-Palette (`--av-*` → Wert), damit die Planer dieselben
   *  Farben wie die Shell übernehmen (inkl. aktivem Modul-Akzent). */
  palette?: Record<string, string>
}

export interface ReadyMessage {
  type: 'avplan:ready'
  app: string
}

/** Cross-Link: „Im Signal-Flow zeigen“ etc. — Planer bittet die Shell zu wechseln. */
export interface NavigateMessage {
  type: 'avplan:navigate'
  module: string
  target?: string
}

/**
 * Shell → iframe: app-spezifische Einstellungen setzen. Die Shell ist die
 * Quelle der Wahrheit für die „Suite-Einstellungen"; sie schiebt beim Mounten
 * und bei jeder Änderung den kompletten Satz in den geöffneten Planer, der die
 * Schlüssel auf seine eigenen Store-Setter abbildet (connectShellSettings).
 */
export interface SettingsMessage {
  type: 'avplan:settings'
  values: Record<string, unknown>
}

/** Shell → iframe: eine Aktion im geöffneten Planer auslösen (Undo/Redo). */
export interface CommandMessage {
  type: 'avplan:command'
  command: 'undo' | 'redo'
}

/** iframe → Shell: aktueller Undo/Redo-Zustand des Planers. */
export interface HistoryMessage {
  type: 'avplan:history'
  app: string
  canUndo: boolean
  canRedo: boolean
}

/**
 * iframe → Shell: der Nutzer hat im Planer selbst einen gebrückten Wert geändert
 * (z. B. Lichts Heatmap-Schalter im Planer-Menü). Die Shell übernimmt ihn in
 * ihre Quelle der Wahrheit, damit ein Remount die Änderung nicht zurücksetzt.
 */
export interface SettingChangedMessage {
  type: 'avplan:settingChanged'
  key: string
  value: unknown
}

/**
 * Shell → iframe: einen Lexware-Office-Beleg über den Planer anlegen. Der Key
 * liegt server-seitig beim Planer (keytar/IPC), nie im Browser — die Shell reicht
 * nur den fertigen Beleg (`doc`, strukturell ein BillingDoc aus
 * `@avplan/lexware-core`) plus eine `requestId` zur Korrelation.
 */
export interface LexwareRequestMessage {
  type: 'avplan:lexware'
  requestId: string
  action: 'create' | 'ping'
  doc?: unknown
}

/** iframe → Shell: Ergebnis eines Lexware-Requests. */
export interface LexwareResultMessage {
  type: 'avplan:lexwareResult'
  requestId: string
  ok: boolean
  id?: string
  webUrl?: string
  error?: string
}

export type ShellMessage =
  | ThemeMessage
  | ReadyMessage
  | NavigateMessage
  | SettingsMessage
  | CommandMessage
  | HistoryMessage
  | SettingChangedMessage
  | LexwareRequestMessage
  | LexwareResultMessage

const isShellMessage = (data: unknown): data is ShellMessage =>
  !!data && typeof data === 'object' && typeof (data as { type?: unknown }).type === 'string' &&
  (data as { type: string }).type.startsWith('avplan:')

/** Shell → iframe: aktuelles Theme (+ optional aufgelöste Palette) senden. */
export function postThemeToFrame(
  frame: Window | null | undefined,
  theme: ResolvedTheme,
  palette?: Record<string, string>,
): void {
  try {
    frame?.postMessage({ type: 'avplan:theme', theme, palette } satisfies ThemeMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

/** Shell → iframe: kompletten Einstellungs-Satz senden. */
export function postSettingsToFrame(frame: Window | null | undefined, values: Record<string, unknown>): void {
  try {
    frame?.postMessage({ type: 'avplan:settings', values } satisfies SettingsMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

/** Shell → iframe: eine Aktion (Undo/Redo) an den Planer schicken. */
export function postCommandToFrame(frame: Window | null | undefined, command: 'undo' | 'redo'): void {
  try {
    frame?.postMessage({ type: 'avplan:command', command } satisfies CommandMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

export interface HistoryHandlers {
  undo: () => void
  redo: () => void
  getState: () => { canUndo: boolean; canRedo: boolean }
}

/**
 * Planer-Seite: Undo/Redo der Shell überlassen. Hört auf `avplan:command`,
 * ruft die eigene Undo/Redo-Funktion und meldet den neuen Zustand hoch. `publish`
 * sollte der Planer zusätzlich bei jeder History-Änderung aufrufen, damit die
 * Shell-Buttons live richtig aktiviert/deaktiviert sind. No-op im Standalone.
 */
export function connectShellHistory(h: HistoryHandlers): { publish: () => void; dispose: () => void } {
  let embedded = false
  try {
    embedded = typeof window !== 'undefined' && window.parent !== window
  } catch {
    embedded = false
  }
  const publish = () => {
    if (!embedded) return
    try {
      const { canUndo, canRedo } = h.getState()
      window.parent.postMessage(
        { type: 'avplan:history', app: document.title || 'planner', canUndo, canRedo } satisfies HistoryMessage,
        '*',
      )
    } catch {
      /* egal */
    }
  }
  if (!embedded) return { publish, dispose: () => {} }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:command') return
    if (e.data.command === 'undo') h.undo()
    else if (e.data.command === 'redo') h.redo()
    publish()
  }
  window.addEventListener('message', onMessage)
  publish()
  return { publish, dispose: () => window.removeEventListener('message', onMessage) }
}

/**
 * Planer-Seite: eine lokal (im Planer-eigenen UI) geänderte, gebrückte
 * Einstellung an die Shell zurückmelden, damit deren Quelle der Wahrheit
 * synchron bleibt. No-op im Standalone-Betrieb.
 */
export function publishShellSetting(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return
    window.parent.postMessage({ type: 'avplan:settingChanged', key, value } satisfies SettingChangedMessage, '*')
  } catch {
    /* egal */
  }
}

/**
 * Planer-Seite: auf Einstellungs-Nachrichten der Shell hören und jeden Schlüssel
 * per `apply` auf den eigenen Store abbilden. No-op im Standalone-Betrieb.
 * Gibt eine Cleanup-Funktion zurück.
 */
export function connectShellSettings(apply: (key: string, value: unknown) => void): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:settings') return
    for (const [key, value] of Object.entries(e.data.values)) {
      try {
        apply(key, value)
      } catch {
        /* einzelner Setter darf den Rest nicht abbrechen */
      }
    }
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

/**
 * Planer-Seite: auf Theme-Nachrichten der Shell hören und `data-theme` setzen.
 * No-op, wenn die App nicht eingebettet läuft (dann bestimmt sie ihr Theme
 * selbst). Gibt eine Cleanup-Funktion zurück.
 */
export function connectShellTheme(paletteMap?: Record<string, string>): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data)) return
    if (e.data.type === 'avplan:theme') {
      document.documentElement.setAttribute('data-theme', e.data.theme)
      // Palette der Shell auf die eigenen Root-Variablen abbilden, damit alle
      // Planer exakt die Shell-Farben (inkl. Modul-Akzent, Light-Mode) zeigen.
      if (e.data.palette && paletteMap) {
        const root = document.documentElement
        for (const [shellToken, plannerVar] of Object.entries(paletteMap)) {
          const value = e.data.palette[shellToken]
          if (value) root.style.setProperty(plannerVar, value)
        }
      }
    }
  }
  window.addEventListener('message', onMessage)
  try {
    window.parent.postMessage({ type: 'avplan:ready', app: document.title || 'planner' } satisfies ReadyMessage, '*')
  } catch {
    /* egal */
  }
  return () => window.removeEventListener('message', onMessage)
}

export interface LexwareRequestResult {
  ok: boolean
  id?: string
  webUrl?: string
  error?: string
}

let lexwareReqCounter = 0

/**
 * Shell-Seite: einen Beleg an den geöffneten Planer schicken und auf das Ergebnis
 * warten. Promise-basiert (löst bei passender `requestId` auf), mit Timeout, damit
 * ein nicht-antwortender/standalone Planer nicht hängt.
 */
export function requestLexware(
  frame: Window | null | undefined,
  action: 'create' | 'ping',
  doc?: unknown,
  timeoutMs = 20_000,
): Promise<LexwareRequestResult> {
  return new Promise((resolve) => {
    if (!frame) {
      resolve({ ok: false, error: 'Kein Planer geöffnet.' })
      return
    }
    const requestId = `lx-${++lexwareReqCounter}-${action}`
    let done = false
    const finish = (r: LexwareRequestResult) => {
      if (done) return
      done = true
      window.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(r)
    }
    const onMessage = (e: MessageEvent) => {
      const d = e.data as Partial<LexwareResultMessage> | undefined
      if (!d || d.type !== 'avplan:lexwareResult' || d.requestId !== requestId) return
      finish({ ok: !!d.ok, id: d.id, webUrl: d.webUrl, error: d.error })
    }
    const timer = setTimeout(() => finish({ ok: false, error: 'Zeitüberschreitung — Planer hat nicht geantwortet.' }), timeoutMs)
    window.addEventListener('message', onMessage)
    try {
      frame.postMessage({ type: 'avplan:lexware', requestId, action, doc } satisfies LexwareRequestMessage, '*')
    } catch {
      finish({ ok: false, error: 'Konnte den Beleg nicht an den Planer senden.' })
    }
  })
}

/**
 * Planer-Seite: auf Lexware-Anfragen der Shell hören, `handler` ausführen (der
 * ruft den echten Lexware-IPC im Main-Prozess) und das Ergebnis zurückmelden.
 * No-op im Standalone-Betrieb. Gibt eine Cleanup-Funktion zurück.
 */
export function connectShellLexware(
  handler: (action: 'create' | 'ping', doc?: unknown) => Promise<{ id?: string; webUrl?: string }>,
): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = async (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:lexware') return
    const { requestId, action, doc } = e.data
    const reply = (msg: Omit<LexwareResultMessage, 'type' | 'requestId'>) => {
      try {
        window.parent.postMessage({ type: 'avplan:lexwareResult', requestId, ...msg } satisfies LexwareResultMessage, '*')
      } catch {
        /* egal */
      }
    }
    try {
      const res = await handler(action, doc)
      reply({ ok: true, id: res.id, webUrl: res.webUrl })
    } catch (err) {
      reply({ ok: false, error: err instanceof Error ? err.message : 'Unbekannter Fehler' })
    }
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

/** Shell-Seite: Nachrichten aus den iframes abonnieren. */
export function onShellMessage(handler: (msg: ShellMessage, source: MessageEventSource | null) => void): () => void {
  const onMessage = (e: MessageEvent) => {
    if (isShellMessage(e.data)) handler(e.data, e.source)
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}
