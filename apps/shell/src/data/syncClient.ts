/**
 * Sync-Client gegen ein generisches, selbst gehostetes Backend. Bewusst
 * vendor-neutral (nur REST + Bearer-Token) — so lässt sich jede einfache
 * Server-Implementierung anbinden, ohne die Suite an einen Anbieter zu binden.
 *
 * REST-Vertrag (Basis-URL aus den Einstellungen):
 *   GET    {base}/projects        → ProjectListEntry[]        (Index)
 *   GET    {base}/projects/:id     → SuiteProject
 *   PUT    {base}/projects/:id     (Body: SuiteProject) → 2xx
 *   DELETE {base}/projects/:id     → 2xx
 * Auth: Header `Authorization: Bearer <token>`.
 *
 * ALLES ist offline-sicher: jede Anfrage ist in try/catch + Timeout gekapselt
 * und liefert bei Fehler/Netzausfall null/false, statt zu werfen. Die App läuft
 * dadurch immer lokal weiter (offline-first).
 */
import type { SuiteProject } from './project'
import { loadBackendConfig, isBackendEnabled } from './backendConfig'
import type { ProjectListEntry } from './projectStore'

const TIMEOUT_MS = 8000

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

/** Eine Anfrage mit Timeout + Auth; bei jedem Fehler null (nie werfen). */
async function req(path: string, init: RequestInit = {}): Promise<Response | null> {
  const cfg = loadBackendConfig()
  if (!cfg.baseUrl) return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(joinUrl(cfg.baseUrl, path), {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
        ...(init.headers ?? {}),
      },
    })
    return res
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Verbindung testen (für die Einstellungen). */
export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  const res = await req('projects', { method: 'GET' })
  if (!res) return { ok: false, error: 'unreachable' }
  if (res.status === 401 || res.status === 403) return { ok: false, error: 'auth' }
  if (!res.ok) return { ok: false, error: `http ${res.status}` }
  return { ok: true }
}

/** Ein Projekt hochladen (fire-and-forget-tauglich). true bei Erfolg. */
export async function pushProject(id: string, project: SuiteProject): Promise<boolean> {
  if (!isBackendEnabled()) return false
  const res = await req(`projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  })
  return !!res && res.ok
}

/** Ein Projekt serverseitig löschen. */
export async function deleteProjectRemote(id: string): Promise<boolean> {
  if (!isBackendEnabled()) return false
  const res = await req(`projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return !!res && res.ok
}

/** Remote-Index holen (oder null, wenn offline/aus). */
export async function pullIndex(): Promise<ProjectListEntry[] | null> {
  if (!isBackendEnabled()) return null
  const res = await req('projects', { method: 'GET' })
  if (!res || !res.ok) return null
  try {
    const list = (await res.json()) as unknown
    if (!Array.isArray(list)) return null
    return list.filter((e): e is ProjectListEntry => !!e && typeof (e as ProjectListEntry).id === 'string')
  } catch {
    return null
  }
}

/** Ein einzelnes Remote-Projekt holen. */
export async function pullProject(id: string): Promise<SuiteProject | null> {
  if (!isBackendEnabled()) return null
  const res = await req(`projects/${encodeURIComponent(id)}`, { method: 'GET' })
  if (!res || !res.ok) return null
  try {
    return (await res.json()) as SuiteProject
  } catch {
    return null
  }
}
