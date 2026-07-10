import type { IconName } from '@avplan/ui'

export type ModuleId = 'overview' | 'signal' | 'cameras' | 'licht'

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
    plannerUrl: env.VITE_PLANNER_SIGNAL ?? 'http://localhost:4181/',
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
    plannerUrl: env.VITE_PLANNER_CAMERAS ?? 'http://localhost:4182/',
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
    plannerUrl: env.VITE_PLANNER_LICHT ?? 'http://localhost:4183/',
    tabs: [
      { id: 'plan2d', label: '2D-Plan' },
      { id: 'view3d', label: '3D-Vorschau' },
      { id: 'heatmap', label: 'Heatmap-Report' },
    ],
    libraryTabs: ['Fixtures', 'Gels', 'Presets'],
    eyebrow: 'Fixture · Licht',
  },
]

export const MODULE_BY_ID: Record<ModuleId, ModuleDef> = MODULES.reduce(
  (acc, m) => {
    acc[m.id] = m
    return acc
  },
  {} as Record<ModuleId, ModuleDef>,
)
