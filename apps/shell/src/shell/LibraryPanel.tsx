import { useState } from 'react'
import { Badge, Icon } from '@avplan/ui'
import type { SuiteProject } from '../data/project'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { useT, format, type TFunc } from '../i18n'

interface LibEntry {
  /** ID des Projekt-Objekts — gesetzt → Eintrag ist wählbar (treibt die Auswahl). */
  id?: string
  name: string
  sub: string
  star?: boolean
}
interface LibGroup {
  group: string
  entries: LibEntry[]
}

const cardLabel = (type: string, t: TFunc): string => t(`panels.lib.board.type.${type}`, type)

/**
 * Bibliothek aus den *echten* Projektdaten des aktiven Moduls ableiten — keine
 * erfundenen Katalog-Einträge mehr. Einträge mit `id` sind wählbar und treiben
 * dieselbe Auswahl wie die Canvas-Vorschau.
 */
const deriveGroups = (module: ModuleId, project: SuiteProject | null, t: TFunc): LibGroup[] => {
  if (!project) return []
  const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ')
  switch (module) {
    case 'overview': {
      const client = project.show.contacts.find((c) => c.billTo)?.name ?? project.show.contacts[0]?.org
      return [
        { group: t('panels.lib.overview.project', 'Projekt'), entries: [
          { name: project.meta.name, sub: join(project.meta.venue, `v${project.meta.version}`) },
          ...(client ? [{ name: t('panels.lib.overview.client', 'Auftraggeber'), sub: client }] : []),
        ] },
        { group: t('panels.lib.overview.scope', 'Umfang'), entries: [
          { name: t('panels.layer.cameras', 'Kameras'), sub: String(project.cameras.length) },
          { name: t('panels.layer.light', 'Licht'), sub: String(project.fixtures.length) },
          { name: t('panels.layer.signalCables', 'Signal / Kabel'), sub: String(project.cables.length) },
          { name: t('panels.lib.overview.crew', 'Crew'), sub: String(project.show.crew.length) },
        ] },
      ]
    }
    case 'signal':
      return [
        { group: t('panels.lib.signal.devices', 'Geräte'), entries: project.nodes.map((n) => ({ id: n.id, name: n.name, sub: n.sub })) },
        { group: t('panels.lib.signal.cablesGroup', 'Kabel'), entries: project.cables.map((c) => ({ id: c.id, name: c.label, sub: join(c.type, `${c.lengthM} m`) })) },
      ].filter((g) => g.entries.length > 0)
    case 'cameras':
      return [
        { group: t('panels.lib.cameras.title', 'Kameras'), entries: project.cameras.map((c) => ({ id: c.id, name: c.name, sub: join(c.model, c.lens) })) },
      ].filter((g) => g.entries.length > 0)
    case 'licht':
      return [
        { group: t('panels.lib.licht.title', 'Fixtures'), entries: project.fixtures.map((f) => ({ id: f.id, name: f.name, sub: join(f.model, f.purpose) })) },
      ].filter((g) => g.entries.length > 0)
    case 'board':
      return [
        { group: t('panels.lib.board.cards', 'Karten'), entries: project.show.board.cards.map((c) => ({
          id: c.id,
          name: c.title || c.text?.slice(0, 40) || cardLabel(c.type, t),
          sub: cardLabel(c.type, t),
        })) },
      ].filter((g) => g.entries.length > 0)
    default:
      return []
  }
}

const layersFor = (project: SuiteProject | null, t: TFunc) => [
  { id: 'room', name: t('panels.layer.roomWallsStage', 'Raum · Wände & Bühne'), count: project ? String(project.nodes.length) : '—', tone: 'raum' },
  { id: 'people', name: t('panels.layer.people', 'Personen'), count: project ? String(project.show.crew.length) : '—', tone: 'warn' },
  { id: 'cameras', name: t('panels.layer.cameras', 'Kameras'), count: project ? String(project.cameras.length) : '—', tone: 'cameras' },
  { id: 'light', name: t('panels.layer.light', 'Licht'), count: project ? String(project.fixtures.length) : '—', tone: 'licht' },
  { id: 'signal', name: t('panels.layer.signalCables', 'Signal / Kabel'), count: project ? String(project.cables.length) : '—', tone: 'signal' },
]

const DOT: Record<string, string> = {
  raum: 'var(--mod-raum)',
  warn: 'var(--av-warn)',
  cameras: 'var(--mod-cameras)',
  licht: 'var(--mod-licht)',
  signal: 'var(--mod-signal)',
}

export function LibraryPanel({
  module,
  project,
  hiddenLayers,
  onToggleLayer,
  selectedId,
  onSelect,
}: {
  module: ModuleDef
  project: SuiteProject | null
  /** Ausgeblendete Ebenen-IDs (suite-weit, treibt die Canvas-Vorschau). */
  hiddenLayers: Set<string>
  onToggleLayer: (id: string) => void
  /** Aktuell gewähltes Objekt (treibt die Hervorhebung, geteilt mit der Vorschau). */
  selectedId?: string | null
  onSelect?: (id: string) => void
}) {
  const t = useT()
  const groups = deriveGroups(module.id, project, t)
  const tabNames = [t('panels.tab.all', 'Alle'), ...groups.map((g) => g.group)]
  const [tab, setTab] = useState(0)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const layers = layersFor(project, t)

  const shownGroups = tab === 0 ? groups : [groups[tab - 1]].filter(Boolean)

  return (
    <div className="flex h-full flex-col bg-av-surface-1">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-av-border-muted px-2" role="tablist" aria-label={t('panels.aria.library', 'Bibliothek')}>
        {tabNames.map((name, i) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={i === tab}
            onClick={() => setTab(i)}
            className="av-focus whitespace-nowrap border-b-2 px-2.5 py-2.5 text-[13px] font-medium transition-colors"
            style={{
              borderColor: i === tab ? 'var(--av-accent)' : 'transparent',
              color: i === tab ? 'var(--av-text)' : 'var(--av-text-muted)',
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="p-2">
        <div className="flex items-center gap-2 rounded-av-control border border-av-border bg-av-surface-3 px-2.5">
          <Icon name="search" size={15} style={{ color: 'var(--av-text-faint)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('panels.search.placeholder', 'Suchen …')}
            aria-label={t('panels.aria.searchLibrary', 'Bibliothek durchsuchen')}
            className="av-focus w-full bg-transparent py-2 text-[13px] text-av-text outline-none placeholder:text-av-text-faint"
          />
        </div>
      </div>

      <div className="av-scroll flex-1 overflow-auto px-2 pb-2">
        {q && !shownGroups.some((g) => g.entries.some((e) => e.name.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q))) && (
          <div className="px-2 py-6 text-center text-[12px] text-av-text-faint">
            {format(t('panels.search.noResults', 'Keine Treffer für „{q}"'), { q: query.trim() })}
          </div>
        )}
        {shownGroups.map((g) => {
          const entries = g.entries.filter((e) => !q || e.name.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q))
          if (entries.length === 0) return null
          return (
            <div key={g.group} className="mb-3">
              <div className="px-1 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-av-text-faint">{g.group}</div>
              <div className="flex flex-col gap-1">
                {entries.map((e, ei) => {
                  const selectable = !!e.id
                  const isSel = selectable && selectedId === e.id
                  const inner = (
                    <>
                      <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-md bg-av-surface-3 text-av-text-muted">
                        <Icon name={module.icon} size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-medium text-av-text">{e.name}</span>
                          {e.star && <Icon name="wand" size={12} style={{ color: 'var(--av-warn)' }} />}
                        </span>
                        <span className="block truncate text-[11px] text-av-text-muted">{e.sub}</span>
                      </span>
                      {isSel && <Icon name="check" size={14} style={{ color: 'var(--av-accent)', marginTop: 4 }} />}
                    </>
                  )
                  const cls = 'flex items-start gap-2.5 rounded-av-control border bg-av-surface-2 px-2.5 py-2 text-left'
                  const selStyle = {
                    borderColor: isSel ? 'var(--av-accent)' : 'transparent',
                    background: isSel ? 'color-mix(in srgb, var(--av-accent) 12%, var(--av-surface-2))' : undefined,
                  }
                  return selectable ? (
                    <button
                      key={e.id}
                      type="button"
                      aria-pressed={isSel}
                      onClick={() => e.id && onSelect?.(e.id)}
                      className={`av-focus group transition-colors hover:border-av-border ${cls}`}
                      style={selStyle}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div key={`${e.name}-${ei}`} className={cls} style={{ borderColor: 'transparent' }}>
                      {inner}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-av-border-muted p-2">
        <div className="mb-1.5 flex items-center gap-2 px-1">
          <Icon name="layers" size={13} style={{ color: 'var(--av-text-muted)' }} />
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-av-text-muted">{t('panels.layers.title', 'Ebenen')}</span>
          <Badge tone="accent" className="ml-auto">{t('panels.layers.focusOn', 'Fokus an')}</Badge>
        </div>
        <div className="flex flex-col">
          {layers.map((l) => {
            const hidden = hiddenLayers.has(l.id)
            return (
              <div key={l.name} className="flex items-center gap-2 rounded px-1 py-1 text-[12px] text-av-text-secondary" style={{ opacity: hidden ? 0.45 : 1 }}>
                <span className="h-2 w-2 flex-none rounded-full" style={{ background: DOT[l.tone] }} />
                <span className="flex-1 truncate" style={{ textDecoration: hidden ? 'line-through' : undefined }}>{l.name}</span>
                <span className="av-num text-av-text-faint">{l.count}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!hidden}
                  aria-label={format(t('panels.aria.layerToggle', 'Ebene {name} {action}'), { name: l.name, action: hidden ? t('panels.action.show', 'einblenden') : t('panels.action.hide', 'ausblenden') })}
                  className="av-focus grid h-5 w-5 place-items-center rounded hover:bg-av-surface-3"
                  onClick={() => onToggleLayer(l.id)}
                >
                  <Icon name="eye" size={13} style={{ color: hidden ? 'var(--av-text-faint)' : 'var(--av-text-muted)' }} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
