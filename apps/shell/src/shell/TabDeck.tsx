import { useState } from 'react'
import { Button, Icon, type ResolvedTheme } from '@avplan/ui'
import type { SeedPatch, SuiteSeed } from '@avplan/ui/embed'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { emptyBoard, type ShowDetails, type SuiteProject } from '../data/project'
import type { HeaderDraft } from './dashboardEditors'
import { PlannerFrame } from '../embed/PlannerFrame'
import { RuntimeFrame } from '../embed/RuntimeFrame'
import { TallyPushPanel } from './TallyPushPanel'
import { RUNTIME_BY_ID } from '../modules/runtimes'
import { NativeSignalRegion, hasNativeCable } from '../embed/NativeSignalRegion'
import { PlanPreview, SignalPreview } from './previews'
import { OverviewSurface } from './OverviewSurface'
import { BoardCanvas } from './BoardCanvas'
import { useT, format, type TFunc } from '../i18n'

type OverlayId = 'fov' | 'heat'

interface ToolbarButton {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  /** Nur echte Overlay-Toggles (FOV/Heatmap), die die Vorschau wirklich
   *  umschalten. Frühere „Gerät platzieren / Messen / Auto-Route"-Buttons taten
   *  alle nur dasselbe (Planer öffnen) und wurden als irreführende Attrappen
   *  entfernt — „Im Planer öffnen" steht bereits im Tab-Kopf. */
  kind: 'overlay'
  overlay: OverlayId
}

type CanvasModuleId = 'signal' | 'cameras' | 'licht'

const toolbars = (t: TFunc): Record<CanvasModuleId, ToolbarButton[]> => ({
  signal: [],
  cameras: [
    { icon: 'eye', label: t('chrome.tabdeck.tool.showFov', 'FOV anzeigen'), kind: 'overlay', overlay: 'fov' },
  ],
  licht: [
    { icon: 'eye', label: t('chrome.tabdeck.tool.heatmap', 'Heatmap'), kind: 'overlay', overlay: 'heat' },
  ],
})

export function TabDeck({
  module,
  mounted,
  onToggleMount,
  theme,
  project,
  selectedId,
  onSelect,
  onNavigate,
  onAssign,
  onUpdateShow,
  onUpdateHeader,
  zoom,
  plannerSettings,
  onPlannerHistory,
  seed,
  onSeedPatch,
  runtimeUrl,
  onOpenSettings,
  tallyUrl,
}: {
  module: ModuleDef
  mounted: boolean
  onToggleMount: () => void
  theme: ResolvedTheme
  project: SuiteProject | null
  selectedId: string | null
  onSelect: (id: string) => void
  onNavigate: (id: ModuleId) => void
  onAssign: () => void
  /** Show-Details des Dashboards ändern (persistiert via Shell). */
  onUpdateShow?: (updater: (show: ShowDetails) => ShowDetails) => void
  /** Projekt-Kopf (Name/Venue/Datum/Phase/Fortschritt) ändern. */
  onUpdateHeader?: (draft: HeaderDraft) => void
  /** Zoom der Vorschau in Prozent. */
  zoom: number
  /** Suite-Einstellungen für den eingebetteten Planer (nur App-Module). */
  plannerSettings?: Record<string, unknown>
  /** Undo/Redo-Zustand des eingebetteten Planers zurück an die Shell. */
  onPlannerHistory?: (state: { canUndo: boolean; canRedo: boolean; hasHistory: boolean }) => void
  /** Projekt der Shell als neutraler Seed fuer den eingebetteten Planer. */
  seed?: SuiteSeed
  /** Rueckweg: der Planer hat seine Domaene geaendert. */
  onSeedPatch?: (patch: SeedPatch) => void
  /** Adresse der Laufzeit-Anwendung dieses Moduls (nur fuer Geraete-Module). */
  runtimeUrl?: string
  /** Oeffnet die Einstellungen (Tab „Geraete im Netz"). */
  onOpenSettings?: () => void
  /** Adresse des tally-pi — fuer den Weg „Plan -> Pi" im Signal-Modul. */
  tallyUrl?: string
}) {
  const t = useT()
  const isOverview = module.id === 'overview'
  const isBoard = module.id === 'board'
  const runtime = module.runtime ? RUNTIME_BY_ID[module.runtime] : undefined
  // Fenster des geoeffneten Planers — der Tally-Weg fragt es direkt.
  const [plannerWindow, setPlannerWindow] = useState<Window | null>(null)

  // Tab-Beschriftungen übersetzen: die Registry liefert deutsche Roh-Labels,
  // die Sprachumschaltung greift nur über die config.mod.*.tab.*-Keys (die die
  // Palette bereits nutzt). Ohne diese Zuordnung blieb die Tab-Leiste deutsch.

  // Overlay-Zustand der Canvas-Vorschau (FOV / Heatmap).
  const [showFov, setShowFov] = useState(true)
  const [showHeat, setShowHeat] = useState(true)

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Tab-Kopf */}
      <div className="flex items-center gap-2 border-b border-av-border-muted bg-av-surface-1 px-3 py-2">
        <div className="ml-auto flex items-center gap-2">
          {module.planner && (
            <Button variant={mounted ? 'subtle' : 'primary'} size="sm" onClick={onToggleMount}>
              <Icon name={mounted ? 'grid' : 'external'} size={14} />
              {mounted ? t('chrome.tabdeck.toOverview', 'Zur Übersicht') : t('chrome.tabdeck.openInPlanner', 'Im Planer öffnen')}
            </Button>
          )}
        </div>
      </div>

      {/* Übersicht = scrollbares Dashboard (keine Canvas-Leiste) */}
      {runtime ? (
        // Geraete-Modul: die Oberflaeche der Anwendung im Netz. Kein Fallback
        // auf eine Shell-Vorschau -- es gibt nichts, was die Shell ueber ein
        // laufendes Geraet wuesste, und eine Attrappe waere schlimmer als der
        // ehrliche Nicht-erreichbar-Zustand.
        <div className="min-h-0 flex-1 p-3">
          <RuntimeFrame runtime={runtime} url={runtimeUrl ?? ''} onOpenSettings={onOpenSettings} />
        </div>
      ) : isOverview ? (
        <div className="av-scroll min-h-0 flex-1 overflow-auto p-5">
          <OverviewSurface project={project} onNavigate={onNavigate} onAssign={onAssign} onUpdateShow={onUpdateShow} onUpdateHeader={onUpdateHeader} />
        </div>
      ) : isBoard ? (
        <div className="min-h-0 flex-1 p-3">
          <BoardCanvas
            key={project ? project.meta.name : 'scratch'}
            seed={project ? project.show.board : emptyBoard()}
            title={project ? format(t('chrome.tabdeck.boardTitle', '{name} — Board'), { name: project.meta.name }) : t('chrome.tabdeck.creativeBoard', 'Kreativ-Board')}
          />
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 p-3">
          {mounted && module.id === 'signal' && hasNativeCable() ? (
            // Nativer Cable-Planer (WebContentsView) statt iframe — echte
            // IPC-Funktionalität. Nur aktiv, wenn der Suite-Host ihn bereitstellt.
            <NativeSignalRegion />
          ) : mounted && module.planner && module.plannerUrl ? (
            <div className="flex h-full min-h-0 flex-col gap-2">
              {/* Der Weg vom Plan auf den Pi steht im SIGNAL-Modul, nicht im
                  Tally-Modul: die Karte entsteht aus dem Kabelplan, und nur
                  hier ist der Planer, der sie liefern kann, wirklich geoeffnet.
                  Im Tally-Modul steht dafuer die Oberflaeche des Pi. */}
              {module.id === 'signal' && tallyUrl && (
                <TallyPushPanel url={tallyUrl} plannerFrame={plannerWindow} />
              )}
              <div className="min-h-0 flex-1">
                <PlannerFrame url={module.plannerUrl} title={t(`config.mod.${module.id}.title`, module.title)} theme={theme} settings={plannerSettings} onHistory={onPlannerHistory} seed={seed} onSeedPatch={onSeedPatch} onFrameReady={setPlannerWindow} />
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full overflow-hidden rounded-av-card border border-av-border bg-av-bg">
              {/* schwebende Werkzeugleiste — nur echte Overlay-Toggles (FOV/Heatmap) */}
              {toolbars(t)[module.id as CanvasModuleId].length > 0 && (
              <div className="pointer-events-auto absolute left-1/2 top-4 z-10 -translate-x-1/2">
                <div className="av-toolbar">
                  {toolbars(t)[module.id as CanvasModuleId].map((b) => {
                    const active = b.overlay === 'fov' ? showFov : showHeat
                    const onClick = () => {
                      if (b.overlay === 'fov') setShowFov((v) => !v)
                      else setShowHeat((v) => !v)
                    }
                    return (
                      <span key={b.label} className="contents">
                        <button
                          type="button"
                          className="av-toolbar-btn av-focus"
                          data-active={active ? 'true' : undefined}
                          aria-label={b.label}
                          aria-pressed={active}
                          title={b.label}
                          onClick={onClick}
                        >
                          <Icon name={b.icon} size={16} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
              )}

              {/* Modul-Fläche (zoombar) */}
              <div
                className="h-full w-full p-6 pt-16"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center top',
                }}
              >
                {module.id === 'signal' && <SignalPreview project={project} selectedId={selectedId} onSelect={onSelect} />}
                {(module.id === 'cameras' || module.id === 'licht') && (
                  <PlanPreview
                    project={project}
                    mode={module.id === 'cameras' ? 'cameras' : 'licht'}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    showFov={showFov}
                    showHeat={showHeat}
                  />
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}
