import { useState } from 'react'
import { Badge, Button, Icon, Tabs, type ResolvedTheme } from '@avplan/ui'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { emptyBoard, type SuiteProject } from '../data/project'
import { PlannerFrame } from '../embed/PlannerFrame'
import { PlanPreview, SignalPreview } from './previews'
import { OverviewSurface } from './OverviewSurface'
import { BoardCanvas } from './BoardCanvas'

type ToolId = 'select' | 'pan'
type OverlayId = 'fov' | 'heat'

interface ToolbarButton {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  /** tool = Werkzeugmodus, overlay = Ein/Aus-Overlay, edit = im Planer bearbeiten. */
  kind: 'tool' | 'overlay' | 'edit'
  tool?: ToolId
  overlay?: OverlayId
  sep?: boolean
}

type CanvasModuleId = 'signal' | 'cameras' | 'licht'

const TOOLBARS: Record<CanvasModuleId, ToolbarButton[]> = {
  signal: [
    { icon: 'cursor', label: 'Auswahl', kind: 'tool', tool: 'select' },
    { icon: 'hand', label: 'Verschieben', kind: 'tool', tool: 'pan' },
    { icon: 'plus', label: 'Gerät platzieren (im Planer)', kind: 'edit', sep: true },
    { icon: 'nodes', label: 'Auto-Route (im Planer)', kind: 'edit' },
  ],
  cameras: [
    { icon: 'cursor', label: 'Auswahl', kind: 'tool', tool: 'select' },
    { icon: 'hand', label: 'Verschieben', kind: 'tool', tool: 'pan' },
    { icon: 'camera', label: 'Kamera platzieren (im Planer)', kind: 'edit', sep: true },
    { icon: 'ruler', label: 'Messen (im Planer)', kind: 'edit' },
    { icon: 'eye', label: 'FOV anzeigen', kind: 'overlay', overlay: 'fov' },
  ],
  licht: [
    { icon: 'cursor', label: 'Auswahl', kind: 'tool', tool: 'select' },
    { icon: 'hand', label: 'Verschieben', kind: 'tool', tool: 'pan' },
    { icon: 'light', label: 'Fixture platzieren (im Planer)', kind: 'edit', sep: true },
    { icon: 'ruler', label: 'Messen (im Planer)', kind: 'edit' },
    { icon: 'eye', label: 'Heatmap', kind: 'overlay', overlay: 'heat' },
  ],
}

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
}) {
  const isOverview = module.id === 'overview'
  const isBoard = module.id === 'board'

  // Werkzeug-/Overlay-Zustand der Canvas-Vorschau.
  const [tool, setTool] = useState<ToolId>('select')
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
              {mounted ? 'Zur Übersicht' : 'Im Planer öffnen'}
            </Button>
          )}
          <Badge tone="accent"><Icon name="grid" size={12} /> Layout: Fokus</Badge>
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
            title={project ? `${project.meta.name} — Board` : 'Kreativ-Board'}
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
                  {TOOLBARS[module.id as CanvasModuleId].map((b) => {
                    const active =
                      b.kind === 'tool'
                        ? tool === b.tool
                        : b.kind === 'overlay'
                          ? b.overlay === 'fov'
                            ? showFov
                            : showHeat
                          : false
                    const onClick = () => {
                      if (b.kind === 'tool' && b.tool) setTool(b.tool)
                      else if (b.kind === 'overlay') {
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
                  cursor: tool === 'pan' ? 'grab' : 'default',
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

              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-av-control border border-av-border bg-av-surface-2/90 px-3 py-1.5 text-[11.5px] text-av-text-muted">
                {project
                  ? <>Vorschau der Shell — <span className="text-av-text-secondary">„Im Planer öffnen"</span> lädt {module.title} zum Bearbeiten</>
                  : <>Kein Projekt — <span className="text-av-text-secondary">Modul eigenständig nutzbar</span></>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
