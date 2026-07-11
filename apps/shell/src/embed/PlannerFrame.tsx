import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Icon,
  onShellMessage,
  postCommandToFrame,
  postSettingsToFrame,
  postThemeToFrame,
  type ResolvedTheme,
} from '@avplan/ui'
import { onPlannerCommand } from './plannerBridge'

/** Shell-Tokens, die als Palette an die Planer gehen (Farb-Konsistenz). */
const AV_TOKENS = [
  '--av-bg', '--av-surface-1', '--av-surface-2', '--av-surface-3', '--av-surface-4',
  '--av-border', '--av-border-muted', '--av-text', '--av-text-secondary', '--av-text-muted',
  '--av-text-faint', '--av-accent', '--av-accent-text', '--av-ok', '--av-warn', '--av-danger',
]

/** Aufgelöste Palette am iframe-Element lesen (fängt den aktiven Modul-Akzent). */
function readShellPalette(el: Element | null): Record<string, string> | undefined {
  if (!el) return undefined
  const cs = getComputedStyle(el)
  const palette: Record<string, string> = {}
  for (const token of AV_TOKENS) {
    const value = cs.getPropertyValue(token).trim()
    if (value) palette[token] = value
  }
  return palette
}

export interface PlannerFrameProps {
  url: string
  title: string
  theme: ResolvedTheme
  /** Suite-Einstellungen, die in den Planer geschoben werden (App-Module). */
  settings?: Record<string, unknown>
  /** Meldet den Undo/Redo-Zustand des eingebetteten Planers an die Shell. */
  onHistory?: (state: { canUndo: boolean; canRedo: boolean }) => void
}

/**
 * iframe-Host für einen eingebetteten Planer. Die iframe-Isolation ist bewusst
 * gewählt: jeder Planer bleibt eine eigenständige App mit eigenem Store, CSS
 * und (im Desktop-Build) IPC — nichts davon kann mit der Shell kollidieren, so
 * bricht die Einbettung keine bestehende Funktionalität. Kommunikation läuft
 * über den postMessage-Bus (@avplan/ui/embed): die Shell schiebt ihr Theme
 * rein, der Planer meldet „ready" und kann Cross-Links zurückschicken.
 *
 * Läuft der Planer gerade nicht (Preview-Server aus), zeigt der Host statt
 * eines toten Rahmens einen erklärenden Fallback mit „in neuem Tab öffnen".
 */
export function PlannerFrame({ url, title, theme, settings, onHistory }: PlannerFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  // Undo/Redo aus der Shell an dieses iframe weiterreichen.
  useEffect(() => onPlannerCommand((cmd) => postCommandToFrame(ref.current?.contentWindow, cmd)), [])

  // Undo/Redo-Zustand des Planers empfangen und an die Shell melden.
  useEffect(() => {
    if (!onHistory) return
    return onShellMessage((msg, source) => {
      if (msg.type === 'avplan:history' && source === ref.current?.contentWindow) {
        onHistory({ canUndo: msg.canUndo, canRedo: msg.canRedo })
      }
    })
  }, [onHistory])

  // Beim Entladen (Modulwechsel / „Zur Übersicht") den Zustand zurücksetzen.
  useEffect(() => {
    return () => onHistory?.({ canUndo: false, canRedo: false })
  }, [onHistory])

  // Theme + Palette in den Rahmen schieben, sobald geladen und bei jedem Wechsel.
  useEffect(() => {
    if (state !== 'ready') return
    postThemeToFrame(ref.current?.contentWindow, theme, readShellPalette(ref.current))
  }, [theme, state])

  // Suite-Einstellungen in den Rahmen schieben — beim Laden und bei jeder
  // Änderung. Die Shell ist die Quelle der Wahrheit; der Planer wendet sie an.
  useEffect(() => {
    if (state !== 'ready' || !settings) return
    postSettingsToFrame(ref.current?.contentWindow, settings)
  }, [settings, state])

  // Erreichbarkeit prüfen: bleibt der Rahmen 6 s im Ladezustand (auch nach
  // „Erneut versuchen"), Fallback zeigen. Der Timeout wird am loading-Zustand
  // scharfgeschaltet, nicht synchron im Effekt gesetzt.
  useEffect(() => {
    if (state !== 'loading') return
    const timer = window.setTimeout(() => {
      setState((s) => (s === 'loading' ? 'error' : s))
    }, 6000)
    return () => window.clearTimeout(timer)
  }, [state])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-av-card border border-av-border bg-av-surface-3">
      <iframe
        ref={ref}
        src={url}
        title={title}
        className="h-full w-full border-0 bg-av-surface-3"
        onLoad={() => {
          setState('ready')
          postThemeToFrame(ref.current?.contentWindow, theme, readShellPalette(ref.current))
          if (settings) postSettingsToFrame(ref.current?.contentWindow, settings)
        }}
      />
      {state === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-av-surface-3/80 text-sm text-av-text-muted">
          {title} wird geladen…
        </div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-av-surface-3 px-8 text-center">
          <Icon name="external" size={28} />
          <div className="text-base font-semibold text-av-text">{title} ist gerade nicht erreichbar</div>
          <p className="max-w-md text-sm text-av-text-muted">
            Der Planer läuft als eigenständige App. Starte ihn per{' '}
            <code className="font-mono text-av-text-secondary">npm run dev:{title.toLowerCase()}</code> oder öffne ihn
            direkt.
          </p>
          <div className="flex gap-2">
            <Button variant="subtle" onClick={() => setState('loading')}>
              Erneut versuchen
            </Button>
            <Button variant="primary" onClick={() => window.open(url, '_blank', 'noopener')}>
              <Icon name="external" size={15} /> In neuem Tab öffnen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
