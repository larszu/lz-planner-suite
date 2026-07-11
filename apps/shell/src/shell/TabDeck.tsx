import { useState } from 'react'
import { Badge, Button, Icon, Tabs, type ResolvedTheme } from '@avplan/ui'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { emptyBoard, type SuiteProject } from '../data/project'
import { PlannerFrame } from '../embed/PlannerFrame'
import { PlanPreview, SignalPreview } from './previews'
import { OverviewSurface } from './OverviewSurface'
import { BoardCanvas } from './BoardCanvas'
import { useT, format, type TFunc } from '../i18n'

type OverlayId = 'fov' | 'heat'

interface ToolbarButton {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  /** overlay = Ein/Aus-Overlay, edit = im Planer bearbeiten. Reine „Werkzeug"-
   *  Buttons (Auswahl/Verschieben) gab es früher, sie hatten auf der statischen
   *  Vorschau aber keine Wirkung (Elemente sind ohnehin per Klick wählbar) und
   *  wurden als tote Affordanz entfernt. */
  kind: 'overlay' | 'edit'
  overlay?: OverlayId
  sep?: boolean
}

type CanvasModuleId = 'signal' | 'cameras' | 'licht'

const toolbars = (t: TFunc): Record<CanvasModuleId, ToolbarButton[]> => ({
  signal: [
    { icon: 'plus', label: t('chrome.tabdeck.tool.placeDevice', 'Gerät platzieren (im Planer)'), kind: 'edit' },
    { icon: 'nodes', label: t('chrome.tabdeck.tool.autoRoute', 'Auto-Route (im Planer)'), kind: 'edit' },
  ],
  cameras: [
    { icon: 'camera', label: t('chrome.tabdeck.tool.placeCamera', 'Kamera platzieren (im Planer)'), kind: 'edit' },
    { icon: 'ruler', label: t('chrome.tabdeck.tool.measure', 'Messen (im Planer)'), kind: 'edit' },
    { icon: 'eye', label: t('chrome.tabdeck.tool.showFov', 'FOV anzeigen'), kind: 'overlay', overlay: 'fov', sep: true },
  ],
  licht: [
    { icon: 'light', label: t('chrome.tabdeck.tool.placeFixture', 'Fixture platzieren (im Planer)'), kind: 'edit' },
    { icon: 'ruler', label: t('chrome.tabdeck.tool.measure', 'Messen (im Planer)'), kind: 'edit' },
    { icon: 'eye', label: t('chrome.tabdeck.tool.heatmap', 'Heatmap'), kind: 'overlay', overlay: 'heat', sep: true },
  ],
})

export function TabDeck({
  module,
  activeTab,
  onTab,
  mounted,
  onToggleMount,
  theme,
  project,
  selectedId,
  onSelect,
  onNavigate,
  onAssign,
  zoom,
  plannerSettings,
  onPlannerHistory,
  hiddenLayers,
}: {
  module: ModuleDef
  activeTab: string
  onTab: (id: string) => void
  mounted: boolean
  onToggleMount: () => void
  theme: ResolvedTheme
  project: SuiteProject | null
  selectedId: string | null
  onSelect: (id: string) => void
  onNavigate: (id: ModuleId) => void
  onAssign: () => void
  /** Zoom der Vorschau in Prozent. */
  zoom: number
  /** Suite-Einstellungen für den eingebetteten Planer (nur App-Module). */
  plannerSettings?: Record<string, unknown>
  /** Undo/Redo-Zustand des eingebetteten Planers zurück an die Shell. */
  onPlannerHistory?: (state: { canUndo: boolean; canRedo: boolean }) => void
  /** Ausgeblendete Vorschau-Ebenen (aus der Bibliothek). */
  hiddenLayers?: Set<string>
}) {
  const t = useT()
  const isOverview = module.id === 'overview'
  const isBoard = module.id === 'board'

  // Overlay-Zustand der Canvas-Vorschau (FOV / Heatmap).
  const [showFov, setShowFov] = useState(true)
  const [showHeat, setShowHeat] = useState(true)

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Tab-Kopf */}
      <div className="flex items-center gap-2 border-b border-av-border-muted bg-av-surface-1 px-3 py-2">
        <Tabs items={module.tabs} active={activeTab} onSelect={onTab} />
        <div className="ml-auto flex items-center gap-2">
          {module.planner && (
            <Button variant={mounted ? 'subtle' : 'primary'} size="sm" onClick={onToggleMount}>
              <Icon name={mounted ? 'grid' : 'external'} size={14} />
              {mounted ? t('chrome.tabdeck.toOverview', 'Zur Übersicht') : t('chrome.tabdeck.openInPlanner', 'Im Planer öffnen')}
            </Button>
          )}
          <Badge tone="accent"><Icon name="grid" size={12} /> {t('chrome.tabdeck.layoutFocus', 'Layout: Fokus')}</Badge>
        </div>
      </div>

      {/* Übersicht = scrollbares Dashboard (keine Canvas-Leiste) */}
      {isOverview ? (
        <div className="av-scroll min-h-0 flex-1 overflow-auto p-5">
          <OverviewSurface project={project} onNavigate={onNavigate} onAssign={onAssign} />
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
          {mounted && module.planner && module.plannerUrl ? (
            <PlannerFrame url={module.plannerUrl} title={module.planner} theme={theme} settings={plannerSettings} onHistory={onPlannerHistory} />
          ) : (
            <div className="relative h-full w-full overflow-hidden rounded-av-card border border-av-border bg-av-bg">
              {/* schwebende Werkzeugleiste */}
              <div className="pointer-events-auto absolute left-1/2 top-4 z-10 -translate-x-1/2">
                <div className="av-toolbar">
                  {toolbars(t)[module.id as CanvasModuleId].map((b) => {
                    const active =
                      b.kind === 'overlay' ? (b.overlay === 'fov' ? showFov : showHeat) : false
                    const onClick = () => {
                      if (b.kind === 'overlay') {
                        if (b.overlay === 'fov') setShowFov((v) => !v)
                        else setShowHeat((v) => !v)
                      } else if (b.kind === 'edit') onToggleMount()
                    }
                    return (
                      <span key={b.label} className="contents">
                        {b.sep && <span className="av-toolbar-sep" />}
                        <button
                          type="button"
                          className="av-toolbar-btn av-focus"
                          data-active={active ? 'true' : undefined}
                          aria-label={b.label}
                          aria-pressed={b.kind !== 'edit' ? active : undefined}
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

              {/* Modul-Fläche (zoombar) */}
              <div
                className="h-full w-full p-6 pt-16"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center top',
                }}
              >
                {module.id === 'signal' && <SignalPreview project={project} selectedId={selectedId} onSelect={onSelect} hidden={hiddenLayers} />}
                {(module.id === 'cameras' || module.id === 'licht') && (
                  <PlanPreview
                    project={project}
                    mode={module.id === 'cameras' ? 'cameras' : 'licht'}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    showFov={showFov}
                    showHeat={showHeat}
                    hidden={hiddenLayers}
                  />
                )}
              </div>

              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-av-control border border-av-border bg-av-surface-2/90 px-3 py-1.5 text-[11.5px] text-av-text-muted">
                {project
                  ? <>{t('chrome.tabdeck.previewPre', 'Vorschau der Shell — ')}<span className="text-av-text-secondary">{t('chrome.tabdeck.openQuoted', '„Im Planer öffnen"')}</span> {format(t('chrome.tabdeck.loadsForEditing', 'lädt {title} zum Bearbeiten'), { title: t(`config.mod.${module.id}.title`, module.title) })}</>
                  : <>{t('chrome.tabdeck.noProjectPre', 'Kein Projekt — ')}<span className="text-av-text-secondary">{t('chrome.tabdeck.standalone', 'Modul eigenständig nutzbar')}</span></>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
