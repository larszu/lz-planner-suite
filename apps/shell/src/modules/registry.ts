import type { IconName } from '@avplan/ui'

export type ModuleId = 'overview' | 'signal' | 'cameras' | 'licht' | 'board'

export interface ModuleTab {
  id: string
  label: string
}

export interface ModuleDef {
  id: ModuleId
  /** Label in der Rail. */
  label: string
  /** Vollname für Topbar/Panels. */
  title: string
  icon: IconName
  hotkey: string
  /** CSS-Variable der Modul-Akzentfarbe. */
  accent: string
  /** data-module-Wert, der die Akzentfarbe im Baum umschaltet. */
  dataModule: string
  /** Welcher Planer steckt dahinter (leer für Übersicht). */
  planner?: 'cable' | 'multicam' | 'light'
  /** iframe-URL des Planers (env-überschreibbar, sonst lokale Preview). */
  plannerUrl?: string
  tabs: ModuleTab[]
  libraryTabs: string[]
  eyebrow: string
}

const env = import.meta.env as Record<string, string | undefined>

// Im gepackten Suite-Desktop injiziert das Electron-Preload echte
// planner-*://-URLs auf window.__suitePlanners — dann laufen die *echten*
// Planer-Renderer lokal aus dem Paket (kein Dev-Server, keine Mock-Vorschau).
// Im Browser/Dev fehlt das Objekt und es greifen die env-URLs (Dev-Server).
const bundled = (typeof window !== 'undefined'
  ? (window as unknown as { __suitePlanners?: Record<string, string> }).__suitePlanners
  : undefined)

/** True, wenn die Planer als Paket-Renderer mitgeliefert werden (Desktop-Suite). */
export const BUNDLED_PLANNERS = !!bundled

function plannerUrl(key: string, envUrl: string | undefined, devFallback: string): string {
  return bundled?.[key] ?? envUrl ?? devFallback
}

export const MODULES: ModuleDef[] = [
  {
    id: 'overview',
    label: 'Übersicht',
    title: 'Projekt-Übersicht',
    icon: 'modules',
    hotkey: '1',
    accent: 'var(--mod-overview)',
    dataModule: 'overview',
    tabs: [
      { id: 'summary', label: 'Zusammenfassung' },
      { id: 'checks', label: 'Plan-Checks' },
    ],
    libraryTabs: ['Projekt', 'Venue', 'Verlauf'],
    eyebrow: 'Projekt',
  },
  {
    id: 'signal',
    label: 'Signal',
    title: 'Signal-Flow',
    icon: 'signal',
    hotkey: '2',
    accent: 'var(--mod-signal)',
    dataModule: 'signal',
    planner: 'cable',
    plannerUrl: plannerUrl('signal', env.VITE_PLANNER_SIGNAL, 'http://localhost:4181/'),
    tabs: [
      { id: 'flow', label: 'Signal-Flow' },
      { id: 'plan2d', label: '2D-Plan' },
      { id: 'rack', label: 'Rack-Ansicht' },
    ],
    libraryTabs: ['Equipment', 'Kabel', 'Racks'],
    eyebrow: 'Kabel · Signal',
  },
  {
    id: 'cameras',
    label: 'Kameras',
    title: 'Kamera-Plan',
    icon: 'camera',
    hotkey: '3',
    accent: 'var(--mod-cameras)',
    dataModule: 'cameras',
    planner: 'multicam',
    plannerUrl: plannerUrl('cameras', env.VITE_PLANNER_CAMERAS, 'http://localhost:4182/'),
    tabs: [
      { id: 'plan2d', label: '2D-Plan' },
      { id: 'view3d', label: '3D-Vorschau' },
      { id: 'preview', label: 'Kamera-Vorschau' },
    ],
    libraryTabs: ['Kameras', 'Objektive', 'Templates'],
    eyebrow: 'Kamera · Venue',
  },
  {
    id: 'licht',
    label: 'Licht',
    title: 'Licht-Plan',
    icon: 'light',
    hotkey: '4',
    accent: 'var(--mod-licht)',
    dataModule: 'licht',
    planner: 'light',
    plannerUrl: plannerUrl('licht', env.VITE_PLANNER_LICHT, 'http://localhost:4183/'),
    tabs: [
      { id: 'plan2d', label: '2D-Plan' },
      { id: 'view3d', label: '3D-Vorschau' },
      { id: 'heatmap', label: 'Heatmap-Report' },
    ],
    libraryTabs: ['Fixtures', 'Gels', 'Presets'],
    eyebrow: 'Fixture · Licht',
  },
  {
    id: 'board',
    label: 'Board',
    title: 'Kreativ-Board',
    icon: 'board',
    hotkey: '5',
    accent: 'var(--mod-board)',
    dataModule: 'board',
    tabs: [
      { id: 'board', label: 'Board' },
      { id: 'moodboard', label: 'Moodboard' },
    ],
    libraryTabs: ['Karten', 'Vorlagen'],
    eyebrow: 'Board · Kreativ',
  },
]

export const MODULE_BY_ID: Record<ModuleId, ModuleDef> = MODULES.reduce(
  (acc, m) => {
    acc[m.id] = m
    return acc
  },
  {} as Record<ModuleId, ModuleDef>,
)
