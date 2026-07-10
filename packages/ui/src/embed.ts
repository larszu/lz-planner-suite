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

export type ShellMessage = ThemeMessage | ReadyMessage | NavigateMessage

const isShellMessage = (data: unknown): data is ShellMessage =>
  !!data && typeof data === 'object' && typeof (data as { type?: unknown }).type === 'string' &&
  (data as { type: string }).type.startsWith('avplan:')

/** Shell → iframe: aktuelles Theme senden. */
export function postThemeToFrame(frame: Window | null | undefined, theme: ResolvedTheme): void {
  try {
    frame?.postMessage({ type: 'avplan:theme', theme } satisfies ThemeMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

/**
 * Planer-Seite: auf Theme-Nachrichten der Shell hören und `data-theme` setzen.
 * No-op, wenn die App nicht eingebettet läuft (dann bestimmt sie ihr Theme
 * selbst). Gibt eine Cleanup-Funktion zurück.
 */
export function connectShellTheme(): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data)) return
    if (e.data.type === 'avplan:theme') {
      document.documentElement.setAttribute('data-theme', e.data.theme)
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

/** Shell-Seite: Nachrichten aus den iframes abonnieren. */
export function onShellMessage(handler: (msg: ShellMessage, source: MessageEventSource | null) => void): () => void {
  const onMessage = (e: MessageEvent) => {
    if (isShellMessage(e.data)) handler(e.data, e.source)
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}
