import { useState } from 'react'
import { Badge, Icon } from '@avplan/ui'
import type { SuiteProject } from '../data/project'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { useT, format, type TFunc } from '../i18n'

interface LibItem {
  group: string
  entries: { name: string; sub: string; star?: boolean }[]
}

const library = (t: TFunc): Record<ModuleId, LibItem[]> => ({
  overview: [
    { group: t('panels.lib.overview.project', 'Projekt'), entries: [
      { name: 'Sommershow 2026', sub: t('panels.lib.overview.hallA', 'Halle A · v12') },
      { name: t('panels.lib.overview.client', 'Auftraggeber'), sub: 'Nordlicht Events GmbH' },
    ] },
    { group: t('panels.lib.overview.venueDevices', 'Venue-Geräte'), entries: [
      { name: t('panels.lib.overview.cameras4', '4 Kameras'), sub: t('panels.lib.linkedAuto', 'automatisch verknüpft') },
      { name: '6 Fixtures', sub: t('panels.lib.overview.fromLight', 'aus Licht-Ebene') },
      { name: t('panels.lib.overview.dimmerRacks2', '2 Dimmer-Racks'), sub: 'Power / DMX' },
    ] },
  ],
  signal: [
    { group: t('panels.lib.signal.switcherRouter', 'Bildmischer / Router'), entries: [
      { name: 'ATEM Constellation 8K', sub: '40× 12G-SDI In', star: true },
      { name: 'Videohub 40×40', sub: '12G-SDI Router' },
    ] },
    { group: t('panels.lib.signal.camerasVenue', 'Kameras (aus Venue)'), entries: [
      { name: 'CAM 1 — Sony FX9', sub: t('panels.lib.signal.sdiOutLinked', '3× SDI Out · verknüpft') },
      { name: 'CAM 2 — Sony FX9', sub: t('panels.lib.signal.sdiOutLinked', '3× SDI Out · verknüpft') },
    ] },
    { group: t('panels.lib.signal.dimmerPower', 'Dimmer / Power'), entries: [
      { name: 'Dimmer Rack 2', sub: t('panels.lib.signal.channelsLinked', '12 Kanäle · 16 A · verknüpft') },
    ] },
  ],
  cameras: [
    { group: t('panels.lib.cameras.cinema', 'Cinema'), entries: [
      { name: 'Sony FX9', sub: 'FF 6K · E-Mount', star: true },
      { name: 'Sony VENICE 2', sub: 'FF 8.6K · PL/E', star: true },
      { name: 'Canon C500 II', sub: 'FF 5.9K · EF/PL' },
    ] },
    { group: t('panels.lib.cameras.broadcast', 'Broadcast'), entries: [
      { name: 'URSA Broadcast G2', sub: 'B4 · 2/3"-Relay' },
      { name: 'Sony HDC-3500', sub: '2/3" · B4' },
    ] },
    { group: t('panels.lib.cameras.ptz', 'PTZ'), entries: [{ name: 'Sony FR7', sub: 'FF PTZ · E-Mount' }] },
  ],
  licht: [
    { group: t('panels.lib.licht.profiler', 'Profiler'), entries: [
      { name: 'ETC Source Four 19°', sub: '750 W · 19° · 3200 K', star: true },
      { name: 'ETC Source Four 26°', sub: '750 W · 26° · 3200 K', star: true },
      { name: 'KL Profile FC', sub: '260 W LED · 5–50°' },
    ] },
    { group: t('panels.lib.licht.washFresnel', 'Wash / Fresnel'), entries: [
      { name: 'KL Fresnel 8 FC', sub: '300 W LED · 15–60°', star: true },
      { name: 'Arri 650 Plus', sub: '650 W · Fresnel' },
    ] },
    { group: t('panels.lib.licht.parPanel', 'PAR / Panel'), entries: [
      { name: 'KL Panel XL', sub: '400 W LED · Softlight' },
      { name: 'PAR 64 CP62', sub: '1000 W · MFL' },
    ] },
  ],
  board: [
    { group: t('panels.lib.board.cards', 'Karten'), entries: [
      { name: t('panels.lib.board.note', 'Notiz'), sub: t('panels.lib.board.freeText', 'Freier Text') },
      { name: 'Look', sub: t('panels.lib.board.lookSub', 'Referenz-/Moodboard-Kachel') },
      { name: t('panels.lib.board.color', 'Farbe'), sub: t('panels.lib.board.colorSub', 'Farb-/Gel-Swatch') },
      { name: 'To-do', sub: t('panels.lib.board.checklist', 'Checkliste') },
      { name: 'Link', sub: t('panels.lib.board.refUrl', 'Referenz-URL') },
      { name: t('panels.lib.board.heading', 'Überschrift'), sub: t('panels.lib.board.section', 'Abschnitt') },
    ] },
    { group: t('panels.lib.board.templates', 'Vorlagen'), entries: [
      { name: 'Moodboard', sub: t('panels.board.sub', 'Look & Feel der Show'), star: true },
      { name: t('panels.lib.board.creativeBrief', 'Kreativ-Brief'), sub: t('panels.lib.board.creativeBriefSub', 'Ziel · Stil · Referenzen') },
      { name: 'Storyboard', sub: t('panels.lib.board.storyboardSub', 'Szenen-Abfolge') },
    ] },
  ],
})

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
}: {
  module: ModuleDef
  project: SuiteProject | null
  /** Ausgeblendete Ebenen-IDs (suite-weit, treibt die Canvas-Vorschau). */
  hiddenLayers: Set<string>
  onToggleLayer: (id: string) => void
}) {
  const t = useT()
  const groups = library(t)[module.id]
  const tabNames = [t('panels.tab.all', 'Alle'), ...groups.map((g) => g.group)]
  const [tab, setTab] = useState(0)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
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
                {entries.map((e) => {
                  const isSel = selected === e.name
                  return (
                    <button
                      key={e.name}
                      type="button"
                      aria-pressed={isSel}
                      onClick={() => setSelected(isSel ? null : e.name)}
                      className="av-focus group flex items-start gap-2.5 rounded-av-control border bg-av-surface-2 px-2.5 py-2 text-left transition-colors hover:border-av-border"
                      style={{
                        borderColor: isSel ? 'var(--av-accent)' : 'transparent',
                        background: isSel ? 'color-mix(in srgb, var(--av-accent) 12%, var(--av-surface-2))' : undefined,
                      }}
                    >
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
                    </button>
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
