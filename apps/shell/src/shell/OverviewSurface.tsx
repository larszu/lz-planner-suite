import { useState, type ReactNode } from 'react'
import { Badge, Button, Icon, Menu, MenuLabel, MenuSeparator } from '@avplan/ui'
import {
  PHASE_LABEL,
  computeCounts,
  type SuiteProject,
} from '../data/project'
import { MODULES, type ModuleId } from '../modules/registry'
import {
  BudgetCard,
  ContactsCard,
  CrewCard,
  LogisticsCard,
  ReadinessCard,
  RunOfShowCard,
  TasksCard,
} from './dashboard'
import {
  FULL_WIDTH_WIDGETS,
  WIDGET_LABEL,
  clampSpan,
  defaultDashboardPrefs,
  loadDashboardPrefs,
  saveDashboardPrefs,
  type DashboardPrefs,
  type WidgetId,
} from './dashboardPrefs'
import { DashboardGrid, type DashboardItem } from './DashboardGrid'

function ModuleCards({ project, onNavigate }: { project: SuiteProject; onNavigate: (id: ModuleId) => void }) {
  const c = computeCounts(project)
  const cards = [
    { id: 'signal' as ModuleId, stat: `${c.cables} Kabel`, sub: `${c.cableTotalM} m · 1 offenes Ende`, tone: 'warn' as const },
    { id: 'cameras' as ModuleId, stat: `${c.cameras} Kameras`, sub: '4 Objektive · Coverage ok', tone: 'ok' as const },
    { id: 'licht' as ModuleId, stat: `${c.fixtures} Fixtures`, sub: '3,4 kW · DMX ok', tone: 'ok' as const },
  ]
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const mod = MODULES.find((m) => m.id === card.id)!
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onNavigate(card.id)}
            className="av-focus group flex flex-col gap-1.5 rounded-av-card border border-av-border bg-av-surface-1 p-3.5 text-left transition-colors hover:border-[color:var(--mod)]"
            style={{ ['--mod' as string]: mod.accent }}
          >
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${mod.accent} 16%, transparent)`, color: mod.accent }}>
                <Icon name={mod.icon} size={15} />
              </span>
              <span className="text-[12.5px] font-semibold text-av-text">{mod.title}</span>
              <Icon name="external" size={13} style={{ marginLeft: 'auto', color: 'var(--av-text-faint)' }} />
            </div>
            <div className="av-num text-lg font-bold text-av-text">{card.stat}</div>
            <div className="text-[11.5px] text-av-text-muted">{card.sub}</div>
          </button>
        )
      })}
    </div>
  )
}

function PlanCheckCard() {
  return (
    <div className="rounded-av-card border border-av-border bg-av-surface-1 p-3.5">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-av-text-muted">
        <Icon name="check" size={13} /> Suite-Plan-Check
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone="ok">Signal ↔ Kameras konsistent</Badge>
        <Badge tone="ok">DMX-Patch kollisionsfrei</Badge>
        <Badge tone="ok">Strom-Last im Limit</Badge>
        <Badge tone="warn">CAM 4 nicht verkabelt</Badge>
      </div>
    </div>
  )
}

/** Anpass-Menü: Elemente an-/abwählen und Karten umsortieren. */
function CustomizeMenu({
  prefs,
  onToggle,
  onMove,
  onReset,
}: {
  prefs: DashboardPrefs
  onToggle: (id: WidgetId) => void
  onMove: (id: WidgetId, dir: -1 | 1) => void
  onReset: () => void
}) {
  const Row = ({ id, canMove, index, total }: { id: WidgetId; canMove?: boolean; index?: number; total?: number }) => {
    const on = prefs.enabled[id]
    return (
      <div className="flex items-center gap-1 rounded-av-control px-1.5 py-0.5 hover:bg-av-surface-2">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onToggle(id)}
          className="av-focus flex flex-1 items-center gap-2 rounded-av-control py-1 text-left text-[12.5px] text-av-text"
        >
          <span
            className="grid h-4 w-4 flex-none place-items-center rounded border"
            style={{
              background: on ? 'var(--av-accent)' : 'transparent',
              borderColor: on ? 'var(--av-accent)' : 'var(--av-border)',
              color: 'var(--av-accent-text)',
            }}
          >
            {on && <Icon name="check" size={12} />}
          </span>
          {WIDGET_LABEL[id]}
        </button>
        {canMove && (
          <span className="flex flex-none items-center gap-0.5">
            <button
              type="button"
              className="av-icon-btn av-focus"
              aria-label={`${WIDGET_LABEL[id]} nach oben`}
              disabled={index === 0}
              style={{ opacity: index === 0 ? 0.3 : 1, width: 22, height: 22 }}
              onClick={() => onMove(id, -1)}
            >
              <Icon name="chevron-down" size={13} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              type="button"
              className="av-icon-btn av-focus"
              aria-label={`${WIDGET_LABEL[id]} nach unten`}
              disabled={index === (total ?? 0) - 1}
              style={{ opacity: index === (total ?? 0) - 1 ? 0.3 : 1, width: 22, height: 22 }}
              onClick={() => onMove(id, 1)}
            >
              <Icon name="chevron-down" size={13} />
            </button>
          </span>
        )}
      </div>
    )
  }

  return (
    <Menu
      align="right"
      triggerClassName="av-btn"
      ariaLabel="Dashboard anpassen"
      button={<><Icon name="grid" size={15} /> Dashboard anpassen</>}
    >
      {() => (
        <div className="w-72 p-1" role="group" aria-label="Dashboard-Elemente">
          <MenuLabel>Bereiche</MenuLabel>
          {FULL_WIDTH_WIDGETS.map((id) => <Row key={id} id={id} />)}
          <MenuSeparator />
          <MenuLabel>Karten (Reihenfolge anpassbar)</MenuLabel>
          {prefs.order.map((id, i) => (
            <Row key={id} id={id} canMove index={i} total={prefs.order.length} />
          ))}
          <MenuSeparator />
          <button
            type="button"
            className="av-menu-item av-focus w-full"
            onClick={onReset}
          >
            <Icon name="undo" size={14} /> <span>Standard wiederherstellen</span>
          </button>
        </div>
      )}
    </Menu>
  )
}

function EmptyState({ onAssign, onNavigate }: { onAssign: () => void; onNavigate: (id: ModuleId) => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 pt-10 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-av-surface-2 text-av-text-muted">
        <Icon name="modules" size={30} />
      </span>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-av-text">Kein Projekt zugewiesen</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-av-text-muted">
          Leg ein Projekt an, um Zeitplan, Crew, Budget und Bereitschaft an einem Ort zu sehen —
          oder nutze jedes Modul direkt und eigenständig, ganz ohne Projekt.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={onAssign}><Icon name="plus" size={15} /> Neues Projekt anlegen</Button>
      </div>
      <div className="w-full pt-2">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">Modul direkt öffnen</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MODULES.filter((m) => m.id !== 'overview').map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => onNavigate(mod.id)}
              className="av-focus flex items-center gap-2.5 rounded-av-card border border-av-border bg-av-surface-1 p-3.5 text-left transition-colors hover:border-[color:var(--mod)]"
              style={{ ['--mod' as string]: mod.accent }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${mod.accent} 16%, transparent)`, color: mod.accent }}>
                <Icon name={mod.icon} size={16} />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-av-text">{mod.title}</span>
                <span className="block text-[11px] text-av-text-muted">eigenständig nutzbar</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function OverviewSurface({
  project,
  onNavigate,
  onAssign,
}: {
  project: SuiteProject | null
  onNavigate: (id: ModuleId) => void
  onAssign: () => void
}) {
  const [prefs, setPrefs] = useState<DashboardPrefs>(loadDashboardPrefs)

  const persist = (next: DashboardPrefs) => {
    saveDashboardPrefs(next)
    setPrefs(next)
  }
  const toggleWidget = (id: WidgetId) =>
    persist({ ...prefs, enabled: { ...prefs.enabled, [id]: !prefs.enabled[id] } })
  const moveWidget = (id: WidgetId, dir: -1 | 1) => {
    const order = [...prefs.order]
    const i = order.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= order.length) return
    ;[order[i], order[j]] = [order[j], order[i]]
    persist({ ...prefs, order })
  }
  const reorderCards = (order: WidgetId[]) => persist({ ...prefs, order })
  const resizeCard = (id: WidgetId, span: number) =>
    persist({ ...prefs, span: { ...prefs.span, [id]: clampSpan(span) } })
  const closeCard = (id: WidgetId) =>
    persist({ ...prefs, enabled: { ...prefs.enabled, [id]: false } })
  const resetPrefs = () => persist(defaultDashboardPrefs())

  if (!project) return <EmptyState onAssign={onAssign} onNavigate={onNavigate} />

  const { show } = project

  // Renderer je Karten-Widget (nur die Masonry-Karten).
  const cardRender: Record<Exclude<WidgetId, 'gewerke' | 'plancheck'>, ReactNode> = {
    runofshow: <RunOfShowCard schedule={show.schedule} />,
    crew: <CrewCard crew={show.crew} />,
    budget: <BudgetCard budget={show.budget} />,
    readiness: <ReadinessCard project={project} />,
    tasks: <TasksCard tasks={show.tasks} />,
    logistics: <LogisticsCard logistics={show.logistics} />,
    contacts: <ContactsCard contacts={show.contacts} />,
  }
  const visibleCards = prefs.order.filter(
    (id): id is Exclude<WidgetId, 'gewerke' | 'plancheck'> =>
      id !== 'gewerke' && id !== 'plancheck' && prefs.enabled[id],
  )
  const gridItems: DashboardItem[] = visibleCards.map((id) => ({ id, node: cardRender[id] }))
  const nothingVisible =
    !prefs.enabled.gewerke && !prefs.enabled.plancheck && visibleCards.length === 0

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Kopf */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">Projekt-Übersicht</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-av-text">{project.meta.name}</h1>
            <Badge tone="accent" dot>{PHASE_LABEL[show.phase]}</Badge>
          </div>
          <p className="mt-1 text-sm text-av-text-muted">
            {project.meta.venue} · {show.dateLabel} · Version {project.meta.version}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-av-surface-3">
              <span className="block h-full rounded-full" style={{ width: `${Math.round(show.progress * 100)}%`, background: 'var(--av-accent)' }} />
            </div>
            <span className="av-num text-[12px] text-av-text-muted">{Math.round(show.progress * 100)}% Planung</span>
          </div>
        </div>
        <CustomizeMenu prefs={prefs} onToggle={toggleWidget} onMove={moveWidget} onReset={resetPrefs} />
      </div>

      {/* Gewerke */}
      {prefs.enabled.gewerke && <ModuleCards project={project} onNavigate={onNavigate} />}

      {/* Suite-Plan-Check */}
      {prefs.enabled.plancheck && (
        <div className="mt-3">
          <PlanCheckCard />
        </div>
      )}

      {/* Dashboard-Karten: Drag&Drop anordnen, skalieren, per X ausblenden */}
      {gridItems.length > 0 && (
        <div className="mt-3">
          <DashboardGrid
            items={gridItems}
            span={prefs.span}
            onReorder={reorderCards}
            onResize={resizeCard}
            onClose={closeCard}
          />
        </div>
      )}

      {nothingVisible && (
        <div className="mt-6 rounded-av-card border border-dashed border-av-border bg-av-surface-1 p-8 text-center">
          <p className="text-sm text-av-text-muted">
            Alle Elemente ausgeblendet. Über <span className="font-medium text-av-text-secondary">„Dashboard anpassen"</span> wieder einblenden.
          </p>
        </div>
      )}
    </div>
  )
}
