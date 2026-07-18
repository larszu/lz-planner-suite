/**
 * Optionale Backend-/Sync-Anbindung. Die Suite bleibt **offline-first**: ohne
 * konfiguriertes Backend läuft alles rein lokal (localStorage) wie bisher. Ein
 * Backend ist rein **opt-in** — der Nutzer trägt eine Server-URL + Token ein;
 * synchronisiert wird nur, wenn es aktiviert und erreichbar ist. Fällt das
 * Backend aus, arbeitet die App unverändert lokal weiter.
 *
 * Ablage: localStorage `avplan.backend`.
 */
export interface BackendConfig {
  /** Sync aktiv? (Nur wirksam mit gültiger baseUrl.) */
  enabled: boolean
  /** Basis-URL des Sync-Servers, z. B. https://sync.example.com/api */
  baseUrl: string
  /** Bearer-Token für die Authentifizierung. */
  token: string
}

const KEY = 'avplan.backend'

const EMPTY: BackendConfig = { enabled: false, baseUrl: '', token: '' }

export function loadBackendConfig(): BackendConfig {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const c = JSON.parse(raw) as Partial<BackendConfig>
    return {
      enabled: !!c.enabled,
      baseUrl: typeof c.baseUrl === 'string' ? c.baseUrl : '',
      token: typeof c.token === 'string' ? c.token : '',
    }
  } catch {
    return { ...EMPTY }
  }
}

export function saveBackendConfig(c: BackendConfig): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    /* Storage gesperrt/voll */
  }
}

/** Ist ein Backend aktiv **und** konfiguriert (URL gesetzt)? */
export function isBackendEnabled(): boolean {
  const c = loadBackendConfig()
  return c.enabled && c.baseUrl.trim().length > 0
}
