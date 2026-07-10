import { Badge, Button, Icon, Tabs, type ResolvedTheme } from '@avplan/ui'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { PlannerFrame } from '../embed/PlannerFrame'
import { PlanPreview, SignalPreview } from './previews'
import { OverviewSurface } from './OverviewSurface'

interface ToolbarButton {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  active?: boolean
}

const TOOLBARS: Record<ModuleId, ToolbarButton[]> = {
  overview: [{ icon: 'cursor', label: 'Auswahl', active: true }, { icon: 'hand', label: 'Verschieben' }],
  signal: [
    { icon: 'cursor', label: 'Auswahl', active: true },
    { icon: 'hand', label: 'Verschieben' },
    { icon: 'plus', label: 'Gerät platzieren' },
    { icon: 'nodes', label: 'Auto-Route' },
  ],
  cameras: [
    { icon: 'cursor', label: 'Auswahl', active: true },
    { icon: 'hand', label: 'Verschieben' },
    { icon: 'camera', label: 'Kamera platzieren' },
    { icon: 'ruler', label: 'Messen' },
    { icon: 'eye', label: 'FOV anzeigen', active: true },
  ],
  licht: [
    { icon: 'cursor', label: 'Auswahl', active: true },
    { icon: 'hand', label: 'Verschieben' },
    { icon: 'light', label: 'Fixture platzieren' },
    { icon: 'ruler', label: 'Messen' },
    { icon: 'eye', label: 'Heatmap', active: true },
  ],
}

export function TabDeck({
  module,
  activeTab,
  onTab,
  mounted,
  onToggleMount,
  theme,
  selectedId,
  onSelect,
  onNavigate,
}: {
  module: ModuleDef
  activeTab: string
  onTab: (id: string) => void
  mounted: boolean
  onToggleMount: () => void
  theme: ResolvedTheme
  selectedId: string | null
  onSelect: (id: string) => void
  onNavigate: (id: ModuleId) => void
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Tab-Kopf */}
      <div className="flex items-center gap-2 border-b border-av-border-muted bg-av-surface-1 px-3 py-2">
        <Tabs items={module.tabs} active={activeTab} onSelect={onTab} />
        <button type="button" className="av-icon-btn av-focus" aria-label="Neuer Tab"><Icon name="plus" size={16} /></button>
        <div className="ml-auto flex items-center gap-2">
          {module.planner && (
            <Button variant={mounted ? 'subtle' : 'primary'} size="sm" onClick={onToggleMount}>
              <Icon name={mounted ? 'grid' : 'external'} size={14} />
              {mounted ? 'Zur Übersicht' : `Im Planer öffnen`}
            </Button>
          )}
          <Badge tone="accent"><Icon name="grid" size={12} /> Layout: Fokus</Badge>
        </div>
      </div>

      {/* Bühne */}
      <div className="relative min-h-0 flex-1 p-3">
        {mounted && module.planner && module.plannerUrl ? (
          <PlannerFrame url={module.plannerUrl} title={module.planner} theme={theme} />
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-av-card border border-av-border bg-av-bg">
            {/* schwebende Werkzeugleiste */}
            <div className="pointer-events-auto absolute left-1/2 top-4 z-10 -translate-x-1/2">
              <div className="av-toolbar">
                {TOOLBARS[module.id].map((b, i) => (
                  <span key={b.label} className="contents">
                    {(i === 2 || (module.id !== 'overview' && i === 3)) && <span className="av-toolbar-sep" />}
                    <button type="button" className="av-toolbar-btn av-focus" data-active={b.active ? 'true' : undefined} aria-label={b.label} title={b.label}>
                      <Icon name={b.icon} size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Modul-Fläche */}
            <div className="h-full w-full p-6 pt-16">
              {module.id === 'overview' && <OverviewSurface onNavigate={onNavigate} />}
              {module.id === 'signal' && <SignalPreview selectedId={selectedId} onSelect={onSelect} />}
              {(module.id === 'cameras' || module.id === 'licht') && (
                <PlanPreview mode={module.id === 'cameras' ? 'cameras' : 'licht'} selectedId={selectedId} onSelect={onSelect} />
              )}
            </div>

            {module.planner && (
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-av-control border border-av-border bg-av-surface-2/90 px-3 py-1.5 text-[11.5px] text-av-text-muted">
                Übersicht der Shell — <span className="text-av-text-secondary">„Im Planer öffnen"</span> lädt {module.title} zum Bearbeiten
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
