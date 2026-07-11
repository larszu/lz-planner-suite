import { Badge, Button, Icon } from '@avplan/ui'
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
  if (!project) return <EmptyState onAssign={onAssign} onNavigate={onNavigate} />

  const { show } = project
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Kopf */}
      <div className="mb-4">
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

      {/* Gewerke */}
      <ModuleCards project={project} onNavigate={onNavigate} />

      {/* Suite-Plan-Check */}
      <div className="mt-3 rounded-av-card border border-av-border bg-av-surface-1 p-3.5">
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

      {/* Dashboard-Karten (Masonry) */}
      <div className="mt-3 gap-3 [column-fill:_balance] sm:columns-2 xl:columns-3">
        <div className="mb-3 break-inside-avoid"><RunOfShowCard schedule={show.schedule} /></div>
        <div className="mb-3 break-inside-avoid"><CrewCard crew={show.crew} /></div>
        <div className="mb-3 break-inside-avoid"><BudgetCard budget={show.budget} /></div>
        <div className="mb-3 break-inside-avoid"><ReadinessCard project={project} /></div>
        <div className="mb-3 break-inside-avoid"><TasksCard tasks={show.tasks} /></div>
        <div className="mb-3 break-inside-avoid"><LogisticsCard logistics={show.logistics} /></div>
        <div className="mb-3 break-inside-avoid"><ContactsCard contacts={show.contacts} /></div>
      </div>
    </div>
  )
}
