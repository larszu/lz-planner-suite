import type { ModuleId } from '../modules/registry'

/** App-Module mit eigenen Einstellungen (Übersicht/Board haben keine). */
export type AppModuleId = Extract<ModuleId, 'signal' | 'cameras' | 'licht'>

export const APP_MODULE_IDS: AppModuleId[] = ['signal', 'cameras', 'licht']

export type ControlKind = 'toggle' | 'segmented' | 'select' | 'slider'

export interface SettingControl {
  key: string
  label: string
  kind: ControlKind
  /** Für segmented/select. */
  options?: { value: string; label: string }[]
  /** Für slider. */
  min?: number
  max?: number
  step?: number
  /** Für slider: Anzeigeformat des Werts. */
  format?: (v: number) => string
  hint?: string
}

export type SettingValue = boolean | number | string
export type AppSettings = Record<string, SettingValue>
export type SuiteAppSettings = Record<AppModuleId, AppSettings>

/**
 * Kuratierte, echte Anzeige-/Optionen je Planer — genau die Bedienelemente aus
 * deren eigenen Einstellungs-Menüs, die einen globalen Options-Charakter haben
 * (kein Dokument-Editing wie Kameras/Wände anlegen). Die Schlüssel entsprechen
 * 1:1 den Store-Feldern der jeweiligen App, auf die der Planer-Empfänger
 * (connectShellSettings) sie abbildet.
 */
export const APP_SETTINGS_SCHEMA: Record<AppModuleId, { note: string; controls: SettingControl[] }> = {
  signal: {
    note: 'Cable Planner',
    controls: [
      {
        key: 'cableColorMode',
        label: 'Kabelfarbe',
        kind: 'segmented',
        options: [
          { value: 'manual', label: 'Manuell' },
          { value: 'byLength', label: 'Nach Länge' },
        ],
      },
      {
        key: 'defaultRouting',
        label: 'Kabelführung',
        kind: 'segmented',
        options: [
          { value: 'orthogonal', label: 'Ortho' },
          { value: 'straight', label: 'Linie' },
          { value: 'curved', label: 'Kurve' },
        ],
      },
      {
        key: 'bgVariant',
        label: 'Canvas-Raster',
        kind: 'select',
        options: [
          { value: 'dots', label: 'Punkte' },
          { value: 'lines', label: 'Linien' },
          { value: 'cross', label: 'Kreuze' },
          { value: 'none', label: 'Kein Raster' },
        ],
      },
      { key: 'hideAllCableLabels', label: 'Alle Kabel-Labels ausblenden', kind: 'toggle' },
      { key: 'cableLabelShortForm', label: 'Kabel-Labels: Kurzform', kind: 'toggle' },
      { key: 'defaultArrow', label: 'Pfeil am Kabel-Ende', kind: 'toggle' },
      { key: 'colorPortsByType', label: 'Ports nach Steckertyp einfärben', kind: 'toggle' },
      { key: 'cableBumps', label: 'Kreuzungs-Brücken auf Kabeln', kind: 'toggle' },
    ],
  },
  cameras: {
    note: 'MultiCam Planner',
    controls: [
      { key: 'showAllFov', label: 'FOV aller Kameras', kind: 'toggle' },
      {
        key: 'editMode',
        label: 'Bearbeiten beschränkt auf',
        kind: 'select',
        options: [
          { value: 'all', label: 'Alle' },
          { value: 'floorplan', label: 'Grundriss' },
          { value: 'stage', label: 'Bühne' },
          { value: 'objects', label: 'Objekte' },
          { value: 'cameras', label: 'Kameras' },
        ],
      },
      { key: 'wallSnap', label: 'Wand-Endpunkte einrasten', kind: 'toggle' },
      { key: 'showForeign', label: 'Fremd-Licht (Lampen) anzeigen', kind: 'toggle' },
      {
        key: 'pixelsPerMeter',
        label: 'Zoom',
        kind: 'slider',
        min: 10,
        max: 80,
        step: 1,
        format: (v) => `${Math.round(v)} px/m`,
      },
    ],
  },
  licht: {
    note: 'Light Planner',
    controls: [
      {
        key: 'mode',
        label: 'Ansicht',
        kind: 'segmented',
        options: [
          { value: '2d', label: '2D-Plan' },
          { value: '3d', label: '3D' },
          { value: 'photo', label: 'Render' },
        ],
      },
      { key: 'showHeatMap', label: 'Heatmap', kind: 'toggle' },
      { key: 'showBeams', label: 'Lichtkegel', kind: 'toggle' },
      {
        key: 'exposure',
        label: 'Belichtung',
        kind: 'slider',
        min: 0.2,
        max: 3,
        step: 0.05,
        format: (v) => v.toFixed(2),
        hint: 'nur im Render-Modus',
      },
      {
        key: 'ambience',
        label: 'Ambiente',
        kind: 'slider',
        min: 0,
        max: 1.5,
        step: 0.05,
        format: (v) => `${Math.round(v * 100)} %`,
        hint: 'nur im Render-Modus',
      },
      {
        key: 'haze',
        label: 'Dunst / Haze',
        kind: 'slider',
        min: 0,
        max: 1,
        step: 0.02,
        format: (v) => `${Math.round(v * 100)} %`,
        hint: 'nur im Render-Modus',
      },
      { key: 'snap', label: 'Einrasten (0,5 m)', kind: 'toggle' },
      { key: 'showFocusNotes', label: 'Fokus-Notizen im Plan', kind: 'toggle' },
    ],
  },
}

/** Werkseinstellungen — entsprechen den Store-Defaults der jeweiligen Planer. */
export const APP_SETTINGS_DEFAULTS: SuiteAppSettings = {
  signal: {
    cableColorMode: 'manual',
    defaultRouting: 'orthogonal',
    bgVariant: 'dots',
    hideAllCableLabels: false,
    cableLabelShortForm: true,
    defaultArrow: true,
    colorPortsByType: false,
    cableBumps: false,
  },
  cameras: {
    showAllFov: true,
    editMode: 'all',
    wallSnap: true,
    showForeign: true,
    pixelsPerMeter: 30,
  },
  licht: {
    mode: '2d',
    showHeatMap: false,
    showBeams: true,
    exposure: 1.2,
    ambience: 0.55,
    haze: 0.15,
    snap: false,
    showFocusNotes: false,
  },
}

const STORAGE_KEY = 'avplan.appSettings'

const clone = (s: SuiteAppSettings): SuiteAppSettings => ({
  signal: { ...s.signal },
  cameras: { ...s.cameras },
  licht: { ...s.licht },
})

/** Persistierte Suite-Einstellungen lesen; fehlende Felder mit Defaults füllen. */
export function loadAppSettings(): SuiteAppSettings {
  const base = clone(APP_SETTINGS_DEFAULTS)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<SuiteAppSettings>
    for (const id of APP_MODULE_IDS) {
      if (parsed[id]) base[id] = { ...base[id], ...parsed[id] }
    }
  } catch {
    /* kaputter/gesperrter Storage → Defaults */
  }
  return base
}

export function saveAppSettings(settings: SuiteAppSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* Storage gesperrt */
  }
}
