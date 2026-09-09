import type { Icon } from '@avplan/ui'
import type { ModuleId } from '../modules/registry'
import type { TFunc } from '../i18n'

export type OverlayId = 'fov' | 'heat'

export interface ToolbarButton {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  /** Nur echte Overlay-Toggles (FOV/Heatmap), die die Vorschau wirklich
   *  umschalten. Frühere „Gerät platzieren / Messen / Auto-Route"-Buttons taten
   *  alle nur dasselbe (Planer öffnen) und wurden als irreführende Attrappen
   *  entfernt — „Im Planer öffnen" steht bereits im Tab-Kopf. */
  kind: 'overlay'
  overlay: OverlayId
}

// Nur diese drei Module haben eine Shell-Vorschau mit Overlay-Schaltern.
//
// DIE TABELLE IST BEWUSST `Partial`, und das ist die Lehre aus dem Absturz,
// den sie verursacht hat: sie war ein `Record<CanvasModuleId, …>` und wurde
// mit `toolbars(t)[module.id as CanvasModuleId]` gelesen. Der Cast BEHAUPTET,
// die Kennung sei eine der drei — der Compiler hoert auf zu pruefen, und zur
// Laufzeit kam bei `lager` und `gebaeude` `undefined` heraus. `.length`
// darauf hat die ganze Shell weiss geschaltet (Nutzer-Meldung 2026-09-09:
// „Auf GitHub Pages stuerzt bei Lager, Gebaeude ab").
//
// `Partial` sagt die Wahrheit: es gibt nicht fuer jedes Modul einen Eintrag.
// Damit verlangt der Compiler das `?? []` an der Lesestelle — und ein neues
// Modul ohne Werkzeugleiste kann diesen Absturz nicht wieder ausloesen.
export const toolbars = (t: TFunc): Partial<Record<ModuleId, ToolbarButton[]>> => ({
  signal: [],
  cameras: [
    { icon: 'eye', label: t('chrome.tabdeck.tool.showFov', 'FOV anzeigen'), kind: 'overlay', overlay: 'fov' },
  ],
  licht: [
    { icon: 'eye', label: t('chrome.tabdeck.tool.heatmap', 'Heatmap'), kind: 'overlay', overlay: 'heat' },
  ],
})

/**
 * Die Overlay-Schalter EINES Moduls — leer, wenn es keine hat.
 *
 * Diese Funktion ist der Grund, warum die Tabelle darueber `Partial` ist: hier
 * steht das `?? []` genau einmal, und jede Aufrufstelle bekommt eine Liste
 * statt vielleicht `undefined`. Vorher las die Ansicht die Tabelle direkt mit
 * einem `as`-Cast, und `lager`/`gebaeude` schalteten die ganze Shell weiss.
 */
export function werkzeugeFuer(id: ModuleId, t: TFunc): ToolbarButton[] {
  return toolbars(t)[id] ?? []
}
