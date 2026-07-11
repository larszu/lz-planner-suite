import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Name der App für die Fallback-Überschrift. */
  appName?: string
  /** Eigener Fallback statt der Standardanzeige. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  error: Error | null
}

/**
 * Geteilte Fehlergrenze der Suite — Vollbild-Fallback bei unerwartetem
 * React-Fehler, mit „Neu laden". Ersetzt die zuvor in mehreren Apps nahezu
 * identisch kopierten ErrorBoundary-Fallbacks. Apps mit reicherem Recovery
 * (z. B. Cable Planner) behalten ihre eigene Variante.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info)
  }

  private reset = () => this.setState({ error: null })

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(error, this.reset)
    // Bewusst Inline-Styles: die ErrorBoundary wird auch von Apps genutzt, die
    // das @avplan/ui-Stylesheet nicht einbinden — der Fallback muss ohne
    // externe CSS-Klassen funktionieren.
    return (
      <div
        role="alert"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, minHeight: '100vh', padding: 32, textAlign: 'center',
          background: '#0b0e14', color: '#e7eaf2',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {this.props.appName ? `${this.props.appName}: etwas ist schiefgelaufen` : 'Etwas ist schiefgelaufen'}
        </div>
        <pre
          style={{
            maxWidth: '42rem', margin: 0, padding: 12, borderRadius: 8,
            fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 12.5,
            color: '#8590a3', background: '#10141d', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}
        >
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 4, padding: '9px 20px', border: 0, borderRadius: 7,
            background: '#5b8cf5', color: '#fff', fontSize: 14, cursor: 'pointer',
          }}
        >
          Neu laden
        </button>
      </div>
    )
  }
}
