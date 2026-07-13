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
import { useT, format } from '../i18n'

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
  onHistory?: (state: { canUndo: boolean; canRedo: boolean; hasHistory: boolean }) => void
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
  const t = useT()
  const ref = useRef<HTMLIFrameElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  // Erhöht sich bei „Erneut versuchen" — remountet das iframe (key), erzwingt
  // also ein echtes Neuladen statt nur den Zustand zurückzusetzen.
  const [reloadKey, setReloadKey] = useState(0)

  // Undo/Redo aus der Shell an dieses iframe weiterreichen.
  useEffect(() => onPlannerCommand((cmd) => postCommandToFrame(ref.current?.contentWindow, cmd)), [])

  // „Bereit" kommt aus dem avplan:ready-Handshake des Planers — nicht aus
  // onLoad, das auch für Fehler-/Fremdseiten feuert. Bei ready Theme+Settings
  // schieben (Zeitpunkt, zu dem der Message-Listener des Planers sicher steht).
  useEffect(() => {
    return onShellMessage((msg, source) => {
      if (msg.type === 'avplan:ready' && source === ref.current?.contentWindow) {
        setState('ready')
        postThemeToFrame(ref.current?.contentWindow, theme, readShellPalette(ref.current))
        if (settings) postSettingsToFrame(ref.current?.contentWindow, settings)
      }
    })
  }, [theme, settings])

  // Undo/Redo-Zustand des Planers empfangen und an die Shell melden.
  useEffect(() => {
    if (!onHistory) return
    return onShellMessage((msg, source) => {
      if (msg.type === 'avplan:history' && source === ref.current?.contentWindow) {
        onHistory({ canUndo: msg.canUndo, canRedo: msg.canRedo, hasHistory: msg.hasHistory !== false })
      }
    })
  }, [onHistory])

  // Beim Entladen (Modulwechsel / „Zur Übersicht") den Zustand zurücksetzen.
  useEffect(() => {
    return () => onHistory?.({ canUndo: false, canRedo: false, hasHistory: true })
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
        key={reloadKey}
        ref={ref}
        src={url}
        title={title}
        className="h-full w-full border-0 bg-av-surface-3"
        onLoad={() => {
          // Best-effort: Theme/Settings gleich schieben; als „bereit" gilt der
          // Rahmen erst mit dem avplan:ready-Handshake (siehe Effekt oben).
          postThemeToFrame(ref.current?.contentWindow, theme, readShellPalette(ref.current))
          if (settings) postSettingsToFrame(ref.current?.contentWindow, settings)
        }}
      />
      {state === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-av-surface-3/80 text-sm text-av-text-muted">
          {format(t('chrome.frame.loading', '{title} wird geladen…'), { title })}
        </div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-av-surface-3 px-8 text-center">
          <Icon name="external" size={28} />
          <div className="text-base font-semibold text-av-text">{format(t('chrome.frame.unreachable', '{title} ist gerade nicht erreichbar'), { title })}</div>
          <p className="max-w-md text-sm text-av-text-muted">
            {t('chrome.frame.hint', 'Der Planer läuft als eigenständige App. Starte seinen Dev-Server oder öffne ihn direkt in einem neuen Tab.')}
          </p>
          <div className="flex gap-2">
            <Button variant="subtle" onClick={() => { setReloadKey((k) => k + 1); setState('loading') }}>
              {t('chrome.frame.retry', 'Erneut versuchen')}
            </Button>
            <Button variant="primary" onClick={() => window.open(url, '_blank', 'noopener')}>
              <Icon name="external" size={15} /> {t('chrome.frame.openNewTab', 'In neuem Tab öffnen')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
