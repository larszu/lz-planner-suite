import { Badge, Icon } from '@avplan/ui'
import { computeCounts, PROJECT } from '../data/project'
import { MODULES, type ModuleId } from '../modules/registry'

const counts = computeCounts(PROJECT)

const CARDS = [
  { id: 'signal' as ModuleId, stat: `${counts.cables} Kabel`, sub: `${counts.cableTotalM} m gesamt · 1 offenes Ende`, check: 'warn' as const },
  { id: 'cameras' as ModuleId, stat: `${counts.cameras} Kameras`, sub: '4 Objektive · Coverage ok', check: 'ok' as const },
  { id: 'licht' as ModuleId, stat: `${counts.fixtures} Fixtures`, sub: '3,4 kW · DMX kein Konflikt', check: 'ok' as const },
]

export function OverviewSurface({ onNavigate }: { onNavigate: (id: ModuleId) => void }) {
  return (
    <div className="mx-auto h-full w-full max-w-4xl">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">Projekt-Übersicht</div>
      <h1 className="text-2xl font-bold tracking-tight text-av-text">{PROJECT.meta.name}</h1>
      <p className="mb-5 text-sm text-av-text-muted">
        {PROJECT.meta.venue} · Version {PROJECT.meta.version} · Kameras und Dimmer sind als Venue-Geräte modulübergreifend verknüpft.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CARDS.map((card) => {
          const mod = MODULES.find((m) => m.id === card.id)!
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.id)}
              className="av-focus group flex flex-col gap-2 rounded-av-card border border-av-border bg-av-surface-1 p-4 text-left transition-colors hover:border-[color:var(--mod)]"
              style={{ ['--mod' as string]: mod.accent }}
            >
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${mod.accent} 16%, transparent)`, color: mod.accent }}>
                  <Icon name={mod.icon} size={17} />
                </span>
                <span className="text-[13px] font-semibold text-av-text">{mod.title}</span>
                <Icon name="external" size={14} style={{ marginLeft: 'auto', color: 'var(--av-text-faint)' }} />
              </div>
              <div className="av-num text-xl font-bold text-av-text">{card.stat}</div>
              <div className="text-[12px] text-av-text-muted">{card.sub}</div>
              <div className="mt-1">
                <Badge tone={card.check}>{card.check === 'ok' ? 'Plan-Check ok' : 'Prüfen'}</Badge>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-av-card border border-av-border bg-av-surface-1 p-4">
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
    </div>
  )
}
