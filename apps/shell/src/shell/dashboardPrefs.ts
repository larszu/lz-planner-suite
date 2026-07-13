/**
 * Nutzer-Konfiguration des Übersichts-Dashboards: welche Elemente sichtbar sind
 * und in welcher Reihenfolge die Karten stehen. Rein UI-seitig, pro Gerät in
 * localStorage persistiert.
 */

export type WidgetId =
  | 'gewerke'
  | 'runofshow'
  | 'crew'
  | 'budget'
  | 'readiness'
  | 'tasks'
  | 'logistics'
  | 'contacts'

/** Ganze-Breite-Bereiche (oben), nur an-/abwählbar (keine Reihenfolge). */
export const FULL_WIDTH_WIDGETS: WidgetId[] = ['gewerke']

/** Karten in der responsiven Masonry — an-/abwählbar und umsortierbar. */
export const DEFAULT_CARD_ORDER: WidgetId[] = [
  'runofshow',
  'crew',
  'budget',
  'readiness',
  'tasks',
  'logistics',
  'contacts',
]

export const WIDGET_LABEL: Record<WidgetId, string> = {
  gewerke: 'Gewerke-Karten',
  runofshow: 'Tagesablauf',
  crew: 'Crew',
  budget: 'Budget',
  readiness: 'Equipment-Bereitschaft',
  tasks: 'Aufgaben',
  logistics: 'Logistik',
  contacts: 'Kontakte',
}

export const ALL_WIDGETS: WidgetId[] = [...FULL_WIDTH_WIDGETS, ...DEFAULT_CARD_ORDER]

/** Spaltenbreite einer Karte im Grid (1..3), per Resize-Griff skalierbar. */
export const MAX_SPAN = 3

export interface DashboardPrefs {
  enabled: Record<WidgetId, boolean>
  /** Reihenfolge der Grid-Karten. */
  order: WidgetId[]
  /** Spalten-Breite je Karte (1..MAX_SPAN). */
  span: Record<WidgetId, number>
}

export function defaultDashboardPrefs(): DashboardPrefs {
  const enabled = {} as Record<WidgetId, boolean>
  const span = {} as Record<WidgetId, number>
  for (const id of ALL_WIDGETS) {
    enabled[id] = true
    span[id] = 1
  }
  return { enabled, order: [...DEFAULT_CARD_ORDER], span }
}

export function clampSpan(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(MAX_SPAN, Math.round(n)))
}

const STORAGE_KEY = 'avplan.dashboard'

/** Sicherstellen, dass die Order genau die Karten-Widgets enthält (kein Drift). */
function normalizeOrder(order: WidgetId[]): WidgetId[] {
  const seen = new Set<WidgetId>()
  const clean = order.filter((id) => DEFAULT_CARD_ORDER.includes(id) && !seen.has(id) && seen.add(id))
  for (const id of DEFAULT_CARD_ORDER) if (!seen.has(id)) clean.push(id)
  return clean
}

export function loadDashboardPrefs(): DashboardPrefs {
  const base = defaultDashboardPrefs()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<DashboardPrefs>
    if (parsed.enabled) base.enabled = { ...base.enabled, ...parsed.enabled }
    if (Array.isArray(parsed.order)) base.order = normalizeOrder(parsed.order)
    if (parsed.span) {
      for (const id of ALL_WIDGETS) {
        if (typeof parsed.span[id] === 'number') base.span[id] = clampSpan(parsed.span[id])
      }
    }
  } catch {
    /* Defaults */
  }
  return base
}

export function saveDashboardPrefs(prefs: DashboardPrefs): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* Storage gesperrt */
  }
}
