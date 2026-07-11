import type { ReactNode } from 'react'
import { Badge, Icon, type IconName } from '@avplan/ui'
import {
  DEPARTMENT_COLOR,
  DEPARTMENT_LABEL,
  budgetTotals,
  computeReadiness,
  type BudgetLine,
  type Contact,
  type CrewMember,
  type LogisticsInfo,
  type ProjectTask,
  type ScheduleItem,
  type SuiteProject,
} from '../data/project'
import { useT, format } from '../i18n'

const fmtEur = (n: number) => `${n.toLocaleString('de-DE')} €`

export function Card({
  title,
  icon,
  action,
  children,
  className,
}: {
  title: string
  icon: IconName
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`flex flex-col rounded-av-card border border-av-border bg-av-surface-1 ${className ?? ''}`}>
      <header className="flex items-center gap-2 border-b border-av-border-muted px-3.5 py-2.5">
        <Icon name={icon} size={14} style={{ color: 'var(--av-text-muted)' }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-av-text-muted">{title}</span>
        {action && <span className="ml-auto">{action}</span>}
      </header>
      <div className="flex-1 p-3.5">{children}</div>
    </section>
  )
}

/* ── Run of Show / Tagesablauf ─────────────────────────────────────────────*/
export function RunOfShowCard({ schedule }: { schedule: ScheduleItem[] }) {
  const t = useT()
  return (
    <Card title={t('overview.card.runofshow.title', 'Tagesablauf')} icon="grid" action={<Badge tone="accent">{format(t('overview.card.runofshow.points', '{n} Punkte'), { n: schedule.length })}</Badge>}>
      <ol className="flex flex-col gap-0">
        {schedule.map((item, i) => {
          const color = item.dept === 'all' ? 'var(--av-text-faint)' : DEPARTMENT_COLOR[item.dept]
          const last = i === schedule.length - 1
          return (
            <li key={`${item.time}-${item.title}`} className="grid grid-cols-[46px_16px_1fr] items-start gap-2">
              <span className="av-num pt-0.5 text-[12px] text-av-text-muted">{item.time}</span>
              <span className="relative flex justify-center">
                <span className="z-10 mt-1.5 h-2 w-2 rounded-full" style={{ background: color }} />
                {!last && <span className="absolute top-2 h-full w-px" style={{ background: 'var(--av-border)' }} />}
              </span>
              <span className="pb-3">
                <span className="block text-[13px] text-av-text">{item.title}</span>
                {item.dept !== 'all' && (
                  <span className="text-[10.5px]" style={{ color }}>{DEPARTMENT_LABEL[item.dept]}</span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

/* ── Crew / Team ───────────────────────────────────────────────────────────*/
export function CrewCard({ crew }: { crew: CrewMember[] }) {
  const t = useT()
  const pending = crew.filter((c) => c.status === 'pending').length
  return (
    <Card
      title={t('overview.card.crew.title', 'Crew')}
      icon="raum"
      action={pending > 0 ? <Badge tone="warn">{format(t('overview.badge.open', '{n} offen'), { n: pending })}</Badge> : <Badge tone="ok">{t('overview.card.crew.complete', 'komplett')}</Badge>}
    >
      <ul className="flex flex-col gap-1.5">
        {crew.map((c) => (
          <li key={c.name} className="flex items-center gap-2.5">
            <span className="h-2 w-2 flex-none rounded-full" style={{ background: DEPARTMENT_COLOR[c.dept] }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-av-text">{c.name}</span>
              <span className="block truncate text-[11px] text-av-text-muted">{c.role}</span>
            </span>
            <span className="av-num text-[12px] text-av-text-secondary">{c.call}</span>
            {c.status === 'pending' && <Icon name="warning" size={13} style={{ color: 'var(--av-warn)' }} />}
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ── Budget ────────────────────────────────────────────────────────────────*/
export function BudgetCard({ budget }: { budget: BudgetLine[] }) {
  const t = useT()
  const totals = budgetTotals(budget)
  const over = totals.actual > totals.estimated
  return (
    <Card title={t('overview.card.budget.title', 'Budget')} icon="modules" action={<Badge tone="warn">Rentman ✓</Badge>}>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="av-num text-xl font-bold text-av-text">{fmtEur(totals.actual)}</span>
        <span className="text-[12px] text-av-text-muted">
          {t('overview.card.budget.of', 'von')} <span className="av-num">{fmtEur(totals.estimated)}</span>
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {budget.map((line) => {
          const pct = Math.min(100, Math.round((line.actualEur / line.estimatedEur) * 100))
          const lineOver = line.actualEur > line.estimatedEur
          return (
            <li key={line.category}>
              <div className="mb-0.5 flex items-baseline justify-between text-[12px]">
                <span className="text-av-text-secondary">{line.category}</span>
                <span className="av-num" style={{ color: lineOver ? 'var(--av-danger)' : 'var(--av-text-muted)' }}>
                  {fmtEur(line.actualEur)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-av-surface-3">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: lineOver ? 'var(--av-danger)' : 'var(--av-accent)' }}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 text-[11px]" style={{ color: over ? 'var(--av-danger)' : 'var(--av-ok)' }}>
        {over
          ? format(t('overview.card.budget.over', '{amount} über Plan'), { amount: fmtEur(totals.actual - totals.estimated) })
          : format(t('overview.card.budget.under', '{amount} unter Plan'), { amount: fmtEur(totals.estimated - totals.actual) })}
      </div>
    </Card>
  )
}

/* ── Equipment-Bereitschaft (aus @avplan/inventory-core) ───────────────────*/
export function ReadinessCard({ project }: { project: SuiteProject }) {
  const t = useT()
  const r = computeReadiness(project.inventory)
  return (
    <Card
      title={t('overview.card.readiness.title', 'Equipment-Bereitschaft')}
      icon="library"
      action={<Badge tone={r.openQty === 0 ? 'ok' : 'warn'}>{format(t('overview.card.readiness.packed', '{n}% gepackt'), { n: r.packedPct })}</Badge>}
    >
      <div className="mb-2 flex items-baseline gap-2">
        <span className="av-num text-xl font-bold text-av-text">{r.packedQty}</span>
        <span className="text-[12px] text-av-text-muted">{t('overview.card.readiness.ofPre', 'von ')}<span className="av-num">{r.totalQty}</span>{t('overview.card.readiness.ofPost', ' Stück gepackt')}</span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-av-surface-3">
        <span className="block h-full rounded-full" style={{ width: `${r.packedPct}%`, background: 'var(--av-accent)' }} />
      </div>
      <div className="flex gap-2 text-[12px]">
        <span className="flex items-center gap-1.5 text-av-text-secondary"><Icon name="rack" size={13} /> {format(t('overview.card.readiness.cases', '{n} Cases'), { n: r.cases })}</span>
        <span className="flex items-center gap-1.5 text-av-text-muted">·</span>
        <span className="flex items-center gap-1.5" style={{ color: r.openQty ? 'var(--av-warn)' : 'var(--av-ok)' }}>
          {format(t('overview.badge.open', '{n} offen'), { n: r.openQty })}
        </span>
      </div>
      <p className="mt-2 text-[10.5px] text-av-text-faint">{t('overview.card.readiness.source', 'Lager-Daten aus @avplan/inventory-core')}</p>
    </Card>
  )
}

/* ── Logistik ──────────────────────────────────────────────────────────────*/
export function LogisticsCard({ logistics }: { logistics: LogisticsInfo }) {
  const t = useT()
  return (
    <Card title={t('overview.card.logistics.title', 'Logistik')} icon="external">
      <div className="mb-2 flex gap-4 text-[12px]">
        <span className="text-av-text-secondary">{t('overview.card.logistics.loadIn', 'Load-in')} <span className="av-num text-av-text">{logistics.loadIn}</span></span>
        <span className="text-av-text-secondary">{t('overview.card.logistics.distance', 'Anfahrt')} <span className="av-num text-av-text">{logistics.distanceKm} km</span></span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {logistics.vehicles.map((v) => (
          <li key={v.label} className="flex items-center gap-2 text-[12.5px]">
            <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-av-surface-3 text-av-text-muted">
              <Icon name="external" size={13} />
            </span>
            <span className="text-av-text">{v.label}</span>
            <span className="text-av-text-muted">· {v.detail}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ── Kontakte ──────────────────────────────────────────────────────────────*/
export function ContactsCard({ contacts }: { contacts: Contact[] }) {
  const t = useT()
  return (
    <Card title={t('overview.card.contacts.title', 'Kontakte')} icon="raum">
      <ul className="flex flex-col gap-2">
        {contacts.map((c) => (
          <li key={c.name} className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-av-surface-3 text-[11px] font-semibold text-av-text-secondary">
              {c.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-av-text">{c.name}</span>
              <span className="block truncate text-[11px] text-av-text-muted">{c.role} · {c.org}</span>
            </span>
            <span className="av-num text-[11.5px] text-av-text-secondary">{c.phone}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ── Aufgaben / Checkliste ─────────────────────────────────────────────────*/
export function TasksCard({ tasks }: { tasks: ProjectTask[] }) {
  const t = useT()
  const open = tasks.filter((tk) => !tk.done).length
  return (
    <Card title={t('overview.card.tasks.title', 'Aufgaben')} icon="check" action={<Badge tone={open ? 'warn' : 'ok'}>{format(t('overview.badge.open', '{n} offen'), { n: open })}</Badge>}>
      <ul className="flex flex-col gap-1.5">
        {tasks.map((task) => (
          <li key={task.title} className="flex items-center gap-2.5">
            <span
              className="grid h-4 w-4 flex-none place-items-center rounded"
              style={{
                border: task.done ? 'none' : '1.5px solid var(--av-border)',
                background: task.done ? 'var(--av-ok)' : 'transparent',
                color: '#fff',
              }}
            >
              {task.done && <Icon name="check" size={11} />}
            </span>
            <span className={`flex-1 text-[13px] ${task.done ? 'text-av-text-faint line-through' : 'text-av-text'}`}>{task.title}</span>
            {task.owner && <span className="text-[11px] text-av-text-muted">{task.owner}</span>}
            {task.due && !task.done && <span className="av-num text-[11px] text-av-text-faint">{task.due}</span>}
          </li>
        ))}
      </ul>
    </Card>
  )
}
