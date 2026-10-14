import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { Badge, Icon, type IconName } from '@avplan/ui'
import { AMPEL_STUFEN, deckungsAmpel, szeneAusSeed, zaehleAmpeln, type Ampel, type DeckungsZeile } from '@avplan/ui/embed'
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
import {
  BudgetEditor,
  ContactsEditor,
  CrewEditor,
  LogisticsEditor,
  ScheduleEditor,
  TasksEditor,
} from './dashboardEditors'
import { useLanguage, useT, format, type TFunc } from '../i18n'
import { crewBuchungen, nochOffen, type FensterLuecke } from '../data/crew'
import { buchungsLabel } from './crewLabels'
import { suiteToSeed } from '../data/seed'
import type { ModuleId } from '../modules/registry'

/** Dezente „Bearbeiten"-Schaltfläche im Karten-Kopf (nur wenn editierbar). */
function EditButton({ onClick }: { onClick: () => void }) {
  const t = useT()
  return (
    <button
      type="button"
      className="av-focus rounded-av-control px-1.5 py-0.5 text-[11px] font-medium text-av-text-secondary hover:bg-av-surface-2 hover:text-av-text"
      onClick={onClick}
    >
      {t('overview.card.edit', 'Bearbeiten')}
    </button>
  )
}

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
        {/* mr-14 lässt oben rechts Platz für die schwebenden Grid-Steuerungen
            (Ziehen/Schließen), die bei Hover/Fokus über die Kartenecke einblenden
            — sonst überdecken sie die „Bearbeiten"-Schaltfläche. */}
        {action && <span className="ml-auto mr-14">{action}</span>}
      </header>
      <div className="flex-1 p-3.5">{children}</div>
    </section>
  )
}

/* ── Run of Show / Tagesablauf ─────────────────────────────────────────────*/
export function RunOfShowCard({ schedule, onChange }: { schedule: ScheduleItem[]; onChange?: (next: ScheduleItem[]) => void }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  return (
    <Card
      title={t('overview.card.runofshow.title', 'Tagesablauf')}
      icon="grid"
      action={
        <span className="flex items-center gap-1.5">
          <Badge tone="accent">{format(t('overview.card.runofshow.points', '{n} Punkte'), { n: schedule.length })}</Badge>
          {onChange && <EditButton onClick={() => setEditing(true)} />}
        </span>
      }
    >
      {onChange && (
        <ScheduleEditor open={editing} value={schedule} onClose={() => setEditing(false)} onSave={(next) => { onChange(next); setEditing(false) }} />
      )}
      {schedule.length === 0 && <p className="text-[12.5px] text-av-text-muted">{t('overview.card.empty', 'Noch nichts eingetragen.')}</p>}
      <ol className="flex flex-col gap-0">
        {schedule.map((item, i) => {
          const color = item.dept === 'all' ? 'var(--av-text-faint)' : DEPARTMENT_COLOR[item.dept]
          const last = i === schedule.length - 1
          return (
            <li key={`${item.time}-${item.title}`} className="grid grid-cols-[46px_16px_1fr] items-start gap-2">
              <span className="av-num pt-0.5 text-[12px] text-av-text-muted">{item.time}</span>
              <span className="relative flex justify-center">
                <span className="z-10 mt-1.5 h-2 w-2 rounded-av-pill" style={{ background: color }} />
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

const lueckenLabel = (t: TFunc): Record<FensterLuecke, string> => ({
  name: t('overview.crew.gap.name', 'Name'),
  datum: t('overview.crew.gap.date', 'Datum'),
  beginn: t('overview.crew.gap.start', 'Beginn'),
  ende: t('overview.crew.gap.end', 'Ende'),
})

export function CrewCard({ crew, onChange }: { crew: CrewMember[]; onChange?: (next: CrewMember[]) => void }) {
  const t = useT()
  const lang = useLanguage()
  const [editing, setEditing] = useState(false)
  // Buchungsstand und Ueberschneidung kommen aus `@avplan/crew-core` — die
  // Karte zeigt sie nur (suite#260).
  const buchungen = useMemo(() => crewBuchungen(crew), [crew])
  const pending = crew.filter((c) => nochOffen(c.booking)).length
  const inKonflikt = buchungen.filter((b) => b.ueberschneidet.length > 0).length
  const ohneFenster = buchungen.filter((b) => !b.fenster).length
  const stand = buchungsLabel(t)
  const luecke = lueckenLabel(t)
  const tag = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1)).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
      day: 'numeric', month: 'short', timeZone: 'UTC',
    })
  }
  return (
    <Card
      title={t('overview.card.crew.title', 'Crew')}
      icon="raum"
      action={
        <span className="flex items-center gap-1.5">
          {inKonflikt > 0 && <Badge tone="danger">{format(t('overview.card.crew.conflicts', '{n} überschneiden sich'), { n: inKonflikt })}</Badge>}
          {crew.length === 0 ? null : pending > 0 ? <Badge tone="warn">{format(t('overview.badge.open', '{n} offen'), { n: pending })}</Badge> : <Badge tone="ok">{t('overview.card.crew.complete', 'komplett')}</Badge>}
          {onChange && <EditButton onClick={() => setEditing(true)} />}
        </span>
      }
    >
      {onChange && (
        <CrewEditor open={editing} value={crew} onClose={() => setEditing(false)} onSave={(next) => { onChange(next); setEditing(false) }} />
      )}
      {crew.length === 0 && <p className="text-[12.5px] text-av-text-muted">{t('overview.card.empty', 'Noch nichts eingetragen.')}</p>}
      <ul className="flex flex-col gap-1.5">
        {crew.map((c, i) => {
          const b = buchungen[i]!
          const andere = b.ueberschneidet.map((j) => crew[j]?.role || crew[j]?.name).filter(Boolean).join(', ')
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-2.5">
              <span className="h-2 w-2 flex-none rounded-av-pill" style={{ background: DEPARTMENT_COLOR[c.dept] }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-av-text">{c.name}</span>
                <span className="block truncate text-[11px] text-av-text-muted">{c.role}</span>
              </span>
              <span className="flex flex-none flex-col items-end">
                <span className="av-num text-[12px] text-av-text-secondary">
                  {b.fenster ? `${c.call}–${c.end}` : c.call}
                </span>
                {b.fenster && <span className="av-num text-[10.5px] text-av-text-faint">{tag(b.fenster.date)}</span>}
              </span>
              <span
                className="w-[4.8rem] flex-none text-right text-[11px]"
                style={{ color: nochOffen(c.booking) ? 'var(--av-warn)' : 'var(--av-text-muted)' }}
              >
                {stand[c.booking]}
              </span>
              {b.ueberschneidet.length > 0 && (
                <span
                  className="flex-none"
                  role="img"
                  aria-label={format(t('overview.card.crew.overlapWith', 'Überschneidet sich mit: {andere}'), { andere })}
                  title={format(t('overview.card.crew.overlapWith', 'Überschneidet sich mit: {andere}'), { andere })}
                >
                  <Icon name="warning" size={13} style={{ color: 'var(--av-danger)' }} />
                </span>
              )}
              {!b.fenster && (
                <span
                  className="flex-none text-[10.5px] text-av-text-faint"
                  title={format(t('overview.card.crew.gapTitle', 'Ohne Zeitfenster — es fehlt: {felder}'), {
                    felder: b.fehlt.map((f) => luecke[f]).join(', '),
                  })}
                >
                  —
                </span>
              )}
            </li>
          )
        })}
      </ul>
      {ohneFenster > 0 && (
        // Keine Meldung „keine Konflikte" fuer Eintraege, die gar nicht
        // geprueft werden koennen: das waere falsche Ruhe.
        <p className="mt-2.5 text-[11px] text-av-text-muted">
          {format(t('overview.card.crew.unchecked', '{n} ohne Zeitfenster (Datum, Beginn, Ende) — für sie prüft niemand Überschneidungen.'), { n: ohneFenster })}
        </p>
      )}
      <p className="mt-2 text-[10.5px] text-av-text-faint">{t('overview.card.crew.source', 'Buchungsstand und Überschneidungen aus @avplan/crew-core')}</p>
    </Card>
  )
}

/* ── Budget ────────────────────────────────────────────────────────────────*/
export function BudgetCard({ budget, onChange }: { budget: BudgetLine[]; onChange?: (next: BudgetLine[]) => void }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const totals = budgetTotals(budget)
  const over = totals.actual > totals.estimated
  return (
    <Card
      title={t('overview.card.budget.title', 'Budget')}
      icon="modules"
      action={onChange && <EditButton onClick={() => setEditing(true)} />}
    >
      {onChange && (
        <BudgetEditor open={editing} value={budget} onClose={() => setEditing(false)} onSave={(next) => { onChange(next); setEditing(false) }} />
      )}
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
              <div className="h-1.5 overflow-hidden rounded-av-pill bg-av-surface-3">
                <span
                  className="block h-full rounded-av-pill"
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
      <div className="mb-3 h-2 overflow-hidden rounded-av-pill bg-av-surface-3">
        <span className="block h-full rounded-av-pill" style={{ width: `${r.packedPct}%`, background: 'var(--av-accent)' }} />
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

/* ── Bedarf & Deckung (Antwort des Lagers, B-78) ───────────────────────────*/

/**
 * Die Farbe je Ampel. Statusfarben sind nach ADR-007 NUR fuer Meldungen da —
 * genau das ist die Ampel. „Unbekannt" bekommt KEINE Statusfarbe: grau und
 * hohl, weil es keine Meldung ueber den Bestand ist, sondern das Fehlen einer.
 */
const AMPEL_FARBE: Record<Ampel, string> = {
  verfuegbar: 'var(--av-ok)',
  subhire: 'var(--av-warn)',
  fehlt: 'var(--av-danger)',
  unbekannt: 'var(--av-text-faint)',
}

const ampelLabel = (t: TFunc): Record<Ampel, string> => ({
  verfuegbar: t('overview.deckung.ampel.verfuegbar', 'aus eigenem Bestand'),
  subhire: t('overview.deckung.ampel.subhire', 'teilweise — Rest zumieten'),
  fehlt: t('overview.deckung.ampel.fehlt', 'nicht vorhanden'),
  unbekannt: t('overview.deckung.ampel.unbekannt', 'unbekannt'),
})

function AmpelPunkt({ ampel }: { ampel: Ampel }) {
  const farbe = AMPEL_FARBE[ampel]
  return (
    <span
      className="h-2.5 w-2.5 flex-none rounded-av-pill"
      style={ampel === 'unbekannt' ? { border: `1.5px solid ${farbe}` } : { background: farbe }}
      aria-hidden="true"
    />
  )
}

function DeckungsWert({ z }: { z: DeckungsZeile }) {
  const t = useT()
  if (z.ampel === 'unbekannt') {
    return (
      <span className="text-[11px] text-av-text-faint">
        {z.unbekanntWeil === 'nicht-gezaehlt'
          ? t('overview.deckung.uncounted', 'nicht gezählt')
          : t('overview.deckung.noAnswer', 'keine Antwort')}
      </span>
    )
  }
  // Der gezaehlte Bestand steht, wie das Lager ihn meldet — auch wenn er
  // groesser ist als der Bedarf. Auf die Menge gekappt saehe „1" aus wie
  // „genau eines im Regal".
  return (
    <>
      <span className="av-num text-[12px] text-av-text-secondary">
        {format(t('overview.deckung.stock', 'Bestand {n}'), { n: z.gedeckt ?? 0 })}
      </span>
      {(z.fehlmenge ?? 0) > 0 && (
        <span className="av-num text-[10.5px]" style={{ color: AMPEL_FARBE[z.ampel] }}>
          {format(t('overview.deckung.short', 'Rest {n}'), { n: z.fehlmenge ?? 0 })}
        </span>
      )}
    </>
  )
}

export function DeckungCard({ project, onNavigate }: { project: SuiteProject; onNavigate?: (id: ModuleId) => void }) {
  const t = useT()
  // Der Bedarf wird HIER abgeleitet (ueber `suiteToSeed`, dieselbe Rechnung,
  // die das Lager bekommt) und nirgends gefuehrt — ADR-001.
  const zeilen = useMemo(() => {
    const seed = suiteToSeed(project, 0)
    return deckungsAmpel(seed.bedarf, seed.deckung)
  }, [project])
  const n = zaehleAmpeln(zeilen)
  const label = ampelLabel(t)
  const ohneAntwort = zeilen.filter((z) => z.unbekanntWeil === 'keine-antwort').length
  return (
    <Card
      title={t('overview.card.deckung.title', 'Bedarf & Deckung')}
      icon="rack"
      action={
        <span className="flex items-center gap-1.5">
          {n.fehlt > 0 && <Badge tone="danger">{format(t('overview.deckung.badge.fehlt', 'fehlt {n}'), { n: n.fehlt })}</Badge>}
          {n.subhire > 0 && <Badge tone="warn">{format(t('overview.deckung.badge.subhire', 'zumieten {n}'), { n: n.subhire })}</Badge>}
          {zeilen.length > 0 && n.fehlt === 0 && n.subhire === 0 && n.unbekannt === 0 && (
            <Badge tone="ok">{t('overview.deckung.badge.ok', 'gedeckt')}</Badge>
          )}
        </span>
      }
    >
      {zeilen.length === 0 && (
        <p className="text-[12.5px] text-av-text-muted">{t('overview.deckung.empty', 'Der Plan braucht noch kein Gerät.')}</p>
      )}
      <ul className="flex flex-col gap-1.5">
        {zeilen.map((z) => (
          <li key={z.bedarf.key} className="flex items-center gap-2.5" title={label[z.ampel]}>
            <AmpelPunkt ampel={z.ampel} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-av-text">
                {z.bedarf.label}
                {z.bedarf.modellUnbekannt && (
                  <span className="ml-1.5 text-[11px] text-av-text-faint">{t('overview.deckung.noModel', '(ohne Modell)')}</span>
                )}
              </span>
              {z.antwortFuer !== undefined && (
                <span className="block text-[10.5px] text-av-text-faint">
                  {format(t('overview.deckung.stale', 'Antwort galt {n} Stück'), { n: z.antwortFuer })}
                </span>
              )}
            </span>
            <span className="av-num flex-none text-[11px] text-av-text-muted">×{z.bedarf.quantity}</span>
            <span className="flex w-[5.5rem] flex-none flex-col items-end text-right"><DeckungsWert z={z} /></span>
          </li>
        ))}
      </ul>
      {zeilen.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-av-border-muted pt-2" aria-label={t('overview.deckung.legend', 'Legende')}>
          {AMPEL_STUFEN.map((a) => (
            <li key={a} className="flex items-center gap-1.5 text-[11px] text-av-text-muted">
              <AmpelPunkt ampel={a} /> {label[a]}
            </li>
          ))}
        </ul>
      )}
      {ohneAntwort > 0 && (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-av-text-muted">
          {format(t('overview.deckung.askLager', 'Ohne Antwort des Lagers: {n}. Es antwortet, solange es geöffnet ist.'), { n: ohneAntwort })}
          {onNavigate && (
            <button type="button" className="av-focus text-av-accent hover:underline" onClick={() => onNavigate('lager')}>
              {t('overview.deckung.openLager', 'Lager öffnen')}
            </button>
          )}
        </p>
      )}
      <p className="mt-2 text-[10.5px] text-av-text-faint">{t('overview.deckung.source', 'Bedarf aus dem Plan, Deckung vom Lager-Modul')}</p>
    </Card>
  )
}

/* ── Show in 3D (suite#258) ────────────────────────────────────────────────*/
// Lazy: three.js steht nur im Chunk des Dialogs, und der wird erst geladen,
// wenn jemand ihn oeffnet — nicht bei jedem Start der Shell.
const Szene3DDialog = lazy(() => import('./Szene3DDialog'))

export function Raum3DCard({ project }: { project: SuiteProject }) {
  const t = useT()
  const [offen, setOffen] = useState(false)
  // Aus dem Seed, derselben Rechnung, die alle Planer bekommen (ADR-001).
  const szene = useMemo(() => szeneAusSeed(suiteToSeed(project, 0)), [project])
  const zahl = (g: 'kamera' | 'licht' | 'signal') => szene.geraete.filter((x) => x.gewerk === g).length
  return (
    <Card title={t('overview.card.raum3d.title', 'Raum in 3D')} icon="modules">
      <ul className="mb-3 flex flex-col gap-1 text-[12.5px] text-av-text-secondary">
        <li>{format(t('overview.raum3d.cameras', '{n} Kameras platziert'), { n: zahl('kamera') })}</li>
        <li>{format(t('overview.raum3d.lights', '{n} Leuchten platziert'), { n: zahl('licht') })}</li>
        <li>{format(t('overview.raum3d.signal', '{n} Signalgeräte platziert, {k} Kabel'), { n: zahl('signal'), k: szene.kabel.length })}</li>
      </ul>
      <button
        type="button"
        onClick={() => setOffen(true)}
        disabled={szene.geraete.length === 0 && !szene.raum}
        className="av-focus rounded-av-control border border-av-border px-2.5 py-1 text-[12px] text-av-text hover:bg-av-surface-2 disabled:opacity-40"
      >
        {t('overview.raum3d.open', 'In 3D ansehen')}
      </button>
      {offen && (
        <Suspense fallback={null}>
          <Szene3DDialog szene={szene} onClose={() => setOffen(false)} />
        </Suspense>
      )}
    </Card>
  )
}

/* ── Logistik ──────────────────────────────────────────────────────────────*/
export function LogisticsCard({ logistics, onChange }: { logistics: LogisticsInfo; onChange?: (next: LogisticsInfo) => void }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  return (
    <Card
      title={t('overview.card.logistics.title', 'Logistik')}
      icon="external"
      action={onChange && <EditButton onClick={() => setEditing(true)} />}
    >
      {onChange && (
        <LogisticsEditor open={editing} value={logistics} onClose={() => setEditing(false)} onSave={(next) => { onChange(next); setEditing(false) }} />
      )}
      <div className="mb-2 flex gap-4 text-[12px]">
        <span className="text-av-text-secondary">{t('overview.card.logistics.loadIn', 'Load-in')} <span className="av-num text-av-text">{logistics.loadIn}</span></span>
        <span className="text-av-text-secondary">{t('overview.card.logistics.distance', 'Anfahrt')} <span className="av-num text-av-text">{logistics.distanceKm} km</span></span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {logistics.vehicles.map((v) => (
          <li key={v.label} className="flex items-center gap-2 text-[12.5px]">
            <span className="grid h-6 w-6 flex-none place-items-center rounded-av-s bg-av-surface-3 text-av-text-muted">
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
export function ContactsCard({ contacts, onChange }: { contacts: Contact[]; onChange?: (next: Contact[]) => void }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  return (
    <Card
      title={t('overview.card.contacts.title', 'Kontakte')}
      icon="raum"
      action={onChange && <EditButton onClick={() => setEditing(true)} />}
    >
      {onChange && (
        <ContactsEditor open={editing} value={contacts} onClose={() => setEditing(false)} onSave={(next) => { onChange(next); setEditing(false) }} />
      )}
      {contacts.length === 0 && <p className="text-[12.5px] text-av-text-muted">{t('overview.card.empty', 'Noch nichts eingetragen.')}</p>}
      <ul className="flex flex-col gap-2">
        {contacts.map((c) => (
          <li key={c.name} className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 flex-none place-items-center rounded-av-pill bg-av-surface-3 text-[11px] font-semibold text-av-text-secondary">
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
export function TasksCard({ tasks, onChange }: { tasks: ProjectTask[]; onChange?: (next: ProjectTask[]) => void }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const open = tasks.filter((tk) => !tk.done).length
  const toggle = (index: number) =>
    onChange?.(tasks.map((tk, i) => (i === index ? { ...tk, done: !tk.done } : tk)))
  return (
    <Card
      title={t('overview.card.tasks.title', 'Aufgaben')}
      icon="check"
      action={
        <span className="flex items-center gap-1.5">
          {tasks.length > 0 && <Badge tone={open ? 'warn' : 'ok'}>{format(t('overview.badge.open', '{n} offen'), { n: open })}</Badge>}
          {onChange && <EditButton onClick={() => setEditing(true)} />}
        </span>
      }
    >
      {onChange && (
        <TasksEditor open={editing} value={tasks} onClose={() => setEditing(false)} onSave={(next) => { onChange(next); setEditing(false) }} />
      )}
      {tasks.length === 0 && <p className="text-[12.5px] text-av-text-muted">{t('overview.card.empty', 'Noch nichts eingetragen.')}</p>}
      <ul className="flex flex-col gap-1.5">
        {tasks.map((task, index) => {
          const box = (
            <span
              className="grid h-4 w-4 flex-none place-items-center rounded-av-s"
              style={{
                border: task.done ? 'none' : '1.5px solid var(--av-border)',
                background: task.done ? 'var(--av-ok)' : 'transparent',
                color: 'var(--av-accent-text)',
              }}
            >
              {task.done && <Icon name="check" size={11} />}
            </span>
          )
          return (
            <li key={`${task.title}-${index}`} className="flex items-center gap-2.5">
              {onChange ? (
                <button
                  type="button"
                  className="av-focus flex flex-none rounded-av-s"
                  aria-pressed={task.done}
                  aria-label={format(t('overview.card.tasks.toggle', 'Aufgabe „{title}" abhaken'), { title: task.title })}
                  onClick={() => toggle(index)}
                >
                  {box}
                </button>
              ) : (
                box
              )}
              <span className={`flex-1 text-[13px] ${task.done ? 'text-av-text-faint line-through' : 'text-av-text'}`}>{task.title}</span>
              {task.owner && <span className="text-[11px] text-av-text-muted">{task.owner}</span>}
              {task.due && !task.done && <span className="av-num text-[11px] text-av-text-faint">{task.due}</span>}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
