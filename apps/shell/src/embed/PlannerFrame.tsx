import { useEffect, useRef, useState } from 'react'
import { Button, Icon, postThemeToFrame, type ResolvedTheme } from '@avplan/ui'

export interface PlannerFrameProps {
  url: string
  title: string
  theme: ResolvedTheme
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
export function PlannerFrame({ url, title, theme }: PlannerFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  // Theme in den Rahmen schieben, sobald geladen und bei jedem Theme-Wechsel.
  useEffect(() => {
    if (state !== 'ready') return
    postThemeToFrame(ref.current?.contentWindow, theme)
  }, [theme, state])

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
          postThemeToFrame(ref.current?.contentWindow, theme)
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
