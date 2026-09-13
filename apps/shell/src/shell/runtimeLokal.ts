// ───────────────────────────────────────────────────────────────────────────
// Der Weg vom Knopf zum Prozess (suite#233).
//
// NUTZER-MELDUNG 2026-09-12: „man muss die tally anwendung lokal starten
// können von der tally seite aus" — und dazu: „ebenso kamerapult, intercom und
// medien muss man lokal starten können wenn noch kein server läuft."
//
// Diese Datei ist die Renderer-Seite: sie kennt die Bruecke des Electron-Hosts
// und die Verzeichnisse, in denen die vier Repos liegen. Gestartet wird im
// Hauptprozess (`electron/runtimeStart.cjs`) — ein Browser kann keinen Prozess
// starten, und das soll er auch nicht.
//
// IM BROWSER-BAU GIBT ES DIESEN WEG NICHT. `kannStarten()` sagt es, und die
// Oberflaeche zeigt den Knopf dann gar nicht erst. Ein Knopf, der auf der
// Pages-Fassung nichts tun kann, waere eine Attrappe — und die Zusage „hier
// kannst du es starten" ist genau die Art Zusage, die stimmen muss.
// ───────────────────────────────────────────────────────────────────────────
import { RUNTIMES, type RuntimeId } from '../modules/runtimes'

export interface LaufZustand {
  laeuft: boolean
  pid?: number
  zeilen: string[]
  code: number | string | null
}

export interface PfadPruefung {
  ok: boolean
  grund?: 'unbekannt' | 'kein-pfad' | 'nicht-gefunden' | 'kein-repo' | 'falsches-repo' | 'start-fehlgeschlagen'
  fehlt?: string
  gefunden?: string
  text?: string
}

interface Bruecke {
  start: (id: string, verzeichnis: string) => Promise<PfadPruefung & Partial<LaufZustand> & { schon?: boolean }>
  stop: (id: string) => Promise<{ ok: boolean }>
  state: (id: string) => Promise<LaufZustand>
  check: (id: string, verzeichnis: string) => Promise<PfadPruefung>
  onZustand: (fn: (id: string, zustand: LaufZustand) => void) => () => void
}

const bruecke = (): Bruecke | null =>
  (globalThis as unknown as { __suiteRuntime?: Bruecke }).__suiteRuntime ?? null

/** Kann diese Fassung ueberhaupt einen Prozess starten? Nur der Electron-Host. */
export const kannStarten = (): boolean => bruecke() !== null

export type StartErgebnis = PfadPruefung & Partial<LaufZustand> & { schon?: boolean }

export const starteLokal = async (id: RuntimeId, verzeichnis: string): Promise<StartErgebnis> =>
  (await bruecke()?.start(id, verzeichnis)) ?? { ok: false, grund: 'unbekannt' }
export const beendeLokal = async (id: RuntimeId) => bruecke()?.stop(id) ?? { ok: false }
export const holeZustand = async (id: RuntimeId): Promise<LaufZustand> =>
  (await bruecke()?.state(id)) ?? { laeuft: false, zeilen: [], code: null }
export const pruefeVerzeichnis = async (id: RuntimeId, verzeichnis: string): Promise<PfadPruefung> =>
  (await bruecke()?.check(id, verzeichnis)) ?? { ok: false, grund: 'unbekannt' }
export const beiZustand = (fn: (id: string, zustand: LaufZustand) => void): (() => void) =>
  bruecke()?.onZustand(fn) ?? (() => {})

/* ── Wo die Repos liegen ──────────────────────────────────────────────────*/

const KEY = 'avplan.runtimePfade'

export type RuntimePfade = Partial<Record<RuntimeId, string>>

export function ladePfade(): RuntimePfade {
  try {
    const roh = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Record<string, unknown> | null
    if (!roh) return {}
    return RUNTIMES.reduce<RuntimePfade>((acc, r) => {
      const v = roh[r.id]
      if (typeof v === 'string' && v.trim()) acc[r.id] = v.trim()
      return acc
    }, {})
  } catch {
    return {}
  }
}

export function speicherePfade(p: RuntimePfade): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* privater Modus / voller Speicher — gilt dann fuer diese Sitzung */
  }
}

/**
 * Ein VORSCHLAG, keine Annahme.
 *
 * Die uebliche Ablage ist ein Ordner mit allen acht Repos nebeneinander. Wer
 * die Suite aus `~/code/av-planner-suite` startet, hat `tally-pi` meist unter
 * `~/code/tally-pi`. Dieser Pfad wird NICHT stillschweigend benutzt: er steht
 * im Feld, und gestartet wird erst, wenn die Pruefung im Hauptprozess die
 * Marker-Dateien dort wirklich findet. Ein geratener Pfad, der durchginge,
 * waere ein `npm run dev` in irgendeinem Verzeichnis.
 */
export function vorschlagFuer(id: RuntimeId, suiteVerzeichnis?: string): string {
  const repo = RUNTIMES.find((r) => r.id === id)?.repo ?? ''
  if (!suiteVerzeichnis || !repo) return ''
  const trenner = suiteVerzeichnis.includes('\\') ? '\\' : '/'
  const teile = suiteVerzeichnis.replace(/[\\/]+$/, '').split(/[\\/]/)
  teile.pop()
  return [...teile, repo].join(trenner)
}
