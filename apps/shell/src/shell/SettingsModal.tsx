import { Badge, Button, Icon, Modal, type ThemePreference } from '@avplan/ui'
import { MODULES, type ModuleId } from '../modules/registry'

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'system', label: 'System', icon: 'monitor' },
  { id: 'light', label: 'Hell', icon: 'sun' },
  { id: 'dark', label: 'Dunkel', icon: 'moon' },
]

/** Kuratierte, app-spezifische Einstellungen je Planer (aus deren eigenen Menüs). */
const APP_SETTINGS: Record<Exclude<ModuleId, 'overview' | 'board'>, { note: string; items: string[] }> = {
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

const APP_MODULE_IDS: Exclude<ModuleId, 'overview' | 'board'>[] = ['signal', 'cameras', 'licht']

export function SettingsModal({
  open,
  onClose,
  preference,
  onSetPreference,
  onOpenModule,
}: {
  open: boolean
  onClose: () => void
  preference: ThemePreference
  onSetPreference: (p: ThemePreference) => void
  onOpenModule: (id: ModuleId) => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Einstellungen" size="lg">
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

      {/* App-spezifische Einstellungen — zentral erreichbar */}
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">
          App-spezifische Einstellungen
        </div>
        <div className="flex flex-col gap-2.5">
          {APP_MODULE_IDS.map((id) => {
            const mod = MODULES.find((m) => m.id === id)!
            const info = APP_SETTINGS[id]
            return (
              <div
                key={id}
                className="rounded-av-card border border-av-border bg-av-surface-1 p-3.5"
                style={{ borderLeft: `3px solid ${mod.accent}` }}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${mod.accent} 16%, transparent)`, color: mod.accent }}>
                    <Icon name={mod.icon} size={15} />
                  </span>
                  <span className="text-[13px] font-semibold text-av-text">{mod.title}</span>
                  <span className="text-[11px] text-av-text-faint">· {info.note}</span>
                  <Button variant="subtle" size="sm" className="ml-auto" onClick={() => { onOpenModule(id); onClose() }}>
                    <Icon name="external" size={13} /> Im Planer öffnen
                  </Button>
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 pl-9 text-[12px] text-av-text-muted">
                  {info.items.map((it) => (
                    <li key={it} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full" style={{ background: mod.accent }} /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <p className="mt-2.5 text-[11px] text-av-text-faint">
          Diese Einstellungen leben im jeweiligen Planer und öffnen sich dort. Das gemeinsame Theme oben gilt überall.
        </p>
      </section>
    </Modal>
  )
}
