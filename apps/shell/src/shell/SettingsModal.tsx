import { useState } from 'react'
import { Badge, Icon, Modal, type ThemePreference } from '@avplan/ui'
import { MODULES, type ModuleId } from '../modules/registry'

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'system', label: 'System', icon: 'monitor' },
  { id: 'light', label: 'Hell', icon: 'sun' },
  { id: 'dark', label: 'Dunkel', icon: 'moon' },
]

/** App-Module mit eigenen Einstellungen (Übersicht/Board haben keine). */
type AppModuleId = Exclude<ModuleId, 'overview' | 'board'>

/** Kuratierte, app-spezifische Einstellungen je Planer (aus deren eigenen Menüs). */
const APP_SETTINGS: Record<AppModuleId, { note: string; items: string[] }> = {
  signal: {
    note: 'Cable Planner',
    items: ['Kabel-Labels ein/aus', 'Kabelfarbe nach Länge', 'Am Raster einrasten', 'Rentman-API & Kategorien', 'Analysen & Plan-Check'],
  },
  cameras: {
    note: 'MultiCam Planner',
    items: ['FOV-Anzeige aller Kameras', 'Layout Fokus / Grid', 'Venue & Bühnen', 'Kamera-Templates & Presets'],
  },
  licht: {
    note: 'Light Planner',
    items: ['Belichtung / Ambiente / Haze', 'Lichtkegel anzeigen', 'Sonne & Tageslicht', 'Einrasten', 'Render-Presets'],
  },
}

const APP_MODULE_IDS: AppModuleId[] = ['signal', 'cameras', 'licht']

const isAppModule = (id: ModuleId): id is AppModuleId =>
  (APP_MODULE_IDS as ModuleId[]).includes(id)

export function SettingsModal({
  open,
  onClose,
  preference,
  onSetPreference,
  activeModule,
}: {
  open: boolean
  onClose: () => void
  preference: ThemePreference
  onSetPreference: (p: ThemePreference) => void
  /** Aktives Modul — dessen Einstellungen-Accordion ist standardmäßig offen. */
  activeModule: ModuleId
}) {
  return (
    <Modal open={open} onClose={onClose} title="Einstellungen" size="lg">
      {/* Inhalt als eigene Komponente: Modal gibt bei !open null zurück und
          unmountet die Kinder, daher mountet SettingsBody bei jedem Öffnen neu —
          der useState-Initializer greift so aufs jeweils aktive Modul zu. */}
      <SettingsBody preference={preference} onSetPreference={onSetPreference} activeModule={activeModule} />
    </Modal>
  )
}

function SettingsBody({
  preference,
  onSetPreference,
  activeModule,
}: {
  preference: ThemePreference
  onSetPreference: (p: ThemePreference) => void
  activeModule: ModuleId
}) {
  // Standardmäßig das Accordion des aktuellen Planers öffnen.
  const [openId, setOpenId] = useState<AppModuleId | null>(() =>
    isAppModule(activeModule) ? activeModule : null,
  )

  return (
    <>
      {/* Gemeinsame Einstellungen — gelten für Shell + alle Planer */}
      <section className="mb-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">Gemeinsam</span>
          <Badge tone="accent">Shell + alle Planer</Badge>
        </div>
        <p className="mb-3 text-[12px] text-av-text-muted">
          Diese Einstellungen gelten für die gesamte Suite gleichzeitig — nicht pro App. Das Theme steuert die Shell
          und wird an den jeweils geöffneten Planer weitergegeben.
        </p>
        <div className="flex items-center justify-between rounded-av-card border border-av-border bg-av-surface-2 px-3.5 py-3">
          <span className="text-[13px] font-medium text-av-text">Erscheinungsbild (Theme)</span>
          <div className="flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-3 p-0.5">
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="av-focus flex items-center gap-1.5 rounded-av-control px-2.5 py-1 text-[12.5px]"
                  style={{
                    background: active ? 'var(--av-accent)' : 'transparent',
                    color: active ? 'var(--av-accent-text)' : 'var(--av-text-secondary)',
                    fontWeight: active ? 600 : 400,
                  }}
                  aria-pressed={active}
                  onClick={() => onSetPreference(opt.id)}
                >
                  <Icon name={opt.icon} size={14} /> {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* App-spezifische Einstellungen — als Accordion, aktives Modul offen */}
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">
          App-spezifische Einstellungen
        </div>
        <div className="flex flex-col gap-2">
          {APP_MODULE_IDS.map((id) => {
            const mod = MODULES.find((m) => m.id === id)!
            const info = APP_SETTINGS[id]
            const isOpen = openId === id
            const panelId = `av-settings-panel-${id}`
            return (
              <div
                key={id}
                className="overflow-hidden rounded-av-card border border-av-border bg-av-surface-1"
                style={{ borderLeft: `3px solid ${mod.accent}` }}
              >
                <button
                  type="button"
                  className="av-focus flex w-full items-center gap-2 px-3.5 py-3 text-left hover:bg-av-surface-2"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId((cur) => (cur === id ? null : id))}
                >
                  <span
                    className="grid h-7 w-7 place-items-center rounded-md"
                    style={{ background: `color-mix(in srgb, ${mod.accent} 16%, transparent)`, color: mod.accent }}
                  >
                    <Icon name={mod.icon} size={15} />
                  </span>
                  <span className="text-[13px] font-semibold text-av-text">{mod.title}</span>
                  <span className="text-[11px] text-av-text-faint">· {info.note}</span>
                  {activeModule === id && <Badge tone="accent">Aktiv</Badge>}
                  <Icon
                    name="chevron-down"
                    size={16}
                    className="ml-auto text-av-text-muted transition-transform"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  />
                </button>
                {isOpen && (
                  <ul id={panelId} className="flex flex-col gap-1 px-3.5 pb-3 pl-12 pt-0 text-[12.5px] text-av-text-secondary">
                    {info.items.map((it) => (
                      <li key={it} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full" style={{ background: mod.accent }} /> {it}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-2.5 text-[11px] text-av-text-faint">
          Aufgeklappt ist die App, in der du gerade bist. Diese Einstellungen leben im jeweiligen Planer; das gemeinsame
          Theme oben gilt überall.
        </p>
      </section>
    </>
  )
}
