import { useState } from 'react'
import { Badge, Icon, Modal, type ThemePreference } from '@avplan/ui'
import { MODULES, type ModuleId } from '../modules/registry'
import { useT, type TFunc } from '../i18n'
import type { Language } from './language'
import { loadBackendConfig, saveBackendConfig, type BackendConfig } from '../data/backendConfig'
import { testConnection } from '../data/syncClient'
import { syncNow } from '../data/projectStore'
import {
  APP_MODULE_IDS,
  APP_SETTINGS_SCHEMA,
  type AppModuleId,
  type SettingControl,
  type SettingValue,
  type SuiteAppSettings,
} from './appSettings'

const themeOptions = (t: TFunc): { id: ThemePreference; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] => [
  { id: 'system', label: t('chrome.settings.theme.system', 'System'), icon: 'monitor' },
  { id: 'light', label: t('chrome.settings.theme.light', 'Hell'), icon: 'sun' },
  { id: 'dark', label: t('chrome.settings.theme.dark', 'Dunkel'), icon: 'moon' },
]

const isAppModule = (id: ModuleId): id is AppModuleId =>
  (APP_MODULE_IDS as ModuleId[]).includes(id)

export function SettingsModal({
  open,
  onClose,
  preference,
  onSetPreference,
  activeModule,
  appSettings,
  onChangeAppSetting,
  language,
  onSetLanguage,
}: {
  open: boolean
  onClose: () => void
  preference: ThemePreference
  onSetPreference: (p: ThemePreference) => void
  /** Aktives Modul — dessen Einstellungen-Accordion ist standardmäßig offen. */
  activeModule: ModuleId
  appSettings: SuiteAppSettings
  onChangeAppSetting: (app: AppModuleId, key: string, value: SettingValue) => void
  language: Language
  onSetLanguage: (lang: Language) => void
}) {
  const t = useT()
  return (
    <Modal open={open} onClose={onClose} title={t('chrome.settings.title', 'Einstellungen')} size="lg">
      {/* Inhalt als eigene Komponente: Modal gibt bei !open null zurück und
          unmountet die Kinder, daher mountet SettingsBody bei jedem Öffnen neu —
          der useState-Initializer greift so aufs jeweils aktive Modul zu. */}
      <SettingsBody
        preference={preference}
        onSetPreference={onSetPreference}
        activeModule={activeModule}
        appSettings={appSettings}
        onChangeAppSetting={onChangeAppSetting}
        language={language}
        onSetLanguage={onSetLanguage}
      />
    </Modal>
  )
}

function SettingsBody({
  preference,
  onSetPreference,
  activeModule,
  appSettings,
  onChangeAppSetting,
  language,
  onSetLanguage,
}: {
  preference: ThemePreference
  onSetPreference: (p: ThemePreference) => void
  activeModule: ModuleId
  appSettings: SuiteAppSettings
  onChangeAppSetting: (app: AppModuleId, key: string, value: SettingValue) => void
  language: Language
  onSetLanguage: (lang: Language) => void
}) {
  const t = useT()
  // Standardmäßig das Accordion des aktuellen Planers öffnen.
  const [openId, setOpenId] = useState<AppModuleId | null>(() =>
    isAppModule(activeModule) ? activeModule : null,
  )

  return (
    <>
      {/* Gemeinsame Einstellungen — gelten für Shell + alle Planer */}
      <section className="mb-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">{t('chrome.settings.common', 'Gemeinsam')}</span>
          <Badge tone="accent">{t('chrome.settings.commonBadge', 'Shell + alle Planer')}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-av-card border border-av-border bg-av-surface-2 px-3.5 py-3">
          <span className="text-[13px] font-medium text-av-text">{t('chrome.settings.appearance', 'Erscheinungsbild (Theme)')}</span>
          <div className="flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-3 p-0.5">
            {themeOptions(t).map((opt) => {
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
        <div className="mt-2 flex items-center justify-between rounded-av-card border border-av-border bg-av-surface-2 px-3.5 py-3">
          <span className="text-[13px] font-medium text-av-text">{t('chrome.settings.language', 'Sprache')}</span>
          <div className="flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-3 p-0.5">
            {(['de', 'en'] as Language[]).map((lang) => {
              const active = language === lang
              return (
                <button
                  key={lang}
                  type="button"
                  className="av-focus rounded-av-control px-2.5 py-1 text-[12.5px]"
                  style={{
                    background: active ? 'var(--av-accent)' : 'transparent',
                    color: active ? 'var(--av-accent-text)' : 'var(--av-text-secondary)',
                    fontWeight: active ? 600 : 400,
                  }}
                  aria-pressed={active}
                  onClick={() => onSetLanguage(lang)}
                >
                  {lang === 'de' ? t('chrome.settings.langDe', 'Deutsch') : t('chrome.settings.langEn', 'English')}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Backend / Sync — optional, opt-in. Offline-first bleibt Default. */}
      <BackendSyncSection t={t} />

      {/* App-spezifische Einstellungen — als Accordion, aktives Modul offen */}
      <section>
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">
          {t('chrome.settings.appSpecific', 'App-spezifische Einstellungen')}
        </div>
        <div className="flex flex-col gap-2">
          {APP_MODULE_IDS.map((id) => {
            const mod = MODULES.find((m) => m.id === id)!
            const info = APP_SETTINGS_SCHEMA[id]
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
                  <span className="text-[13px] font-semibold text-av-text">{t(`config.mod.${id}.title`, mod.title)}</span>
                  <span className="text-[11px] text-av-text-faint">· {info.note}</span>
                  {activeModule === id && <Badge tone="accent">{t('chrome.settings.active', 'Aktiv')}</Badge>}
                  <Icon
                    name="chevron-down"
                    size={16}
                    className="ml-auto text-av-text-muted transition-transform"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  />
                </button>
                {isOpen && (
                  <div id={panelId} className="flex flex-col gap-2.5 px-3.5 pb-3.5 pt-0.5">
                    {info.controls.map((ctrl) => (
                      <SettingRow
                        key={ctrl.key}
                        appId={id}
                        control={ctrl}
                        value={appSettings[id][ctrl.key]}
                        accent={mod.accent}
                        t={t}
                        onChange={(v) => onChangeAppSetting(id, ctrl.key, v)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

type SyncStatus =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'syncing' }
  | { kind: 'ok'; msg: string }
  | { kind: 'error'; msg: string }

function BackendSyncSection({ t }: { t: TFunc }) {
  // Lazy-Init aus localStorage (kein setState-in-Effect → lint-clean).
  const [cfg, setCfg] = useState<BackendConfig>(() => loadBackendConfig())
  const [status, setStatus] = useState<SyncStatus>({ kind: 'idle' })

  const update = (patch: Partial<BackendConfig>) => {
    const next = { ...cfg, ...patch }
    setCfg(next)
    saveBackendConfig(next)
    setStatus({ kind: 'idle' })
  }

  const canUse = cfg.baseUrl.trim().length > 0

  const doTest = async () => {
    setStatus({ kind: 'testing' })
    const r = await testConnection()
    if (r.ok) {
      setStatus({ kind: 'ok', msg: t('chrome.settings.sync.testOk', 'Verbindung erfolgreich') })
    } else {
      const map: Record<string, string> = {
        unreachable: t('chrome.settings.sync.errUnreachable', 'Server nicht erreichbar'),
        auth: t('chrome.settings.sync.errAuth', 'Token ungültig'),
      }
      setStatus({ kind: 'error', msg: map[r.error ?? ''] ?? t('chrome.settings.sync.errGeneric', 'Fehler: {e}').replace('{e}', r.error ?? '?') })
    }
  }

  const doSync = async () => {
    setStatus({ kind: 'syncing' })
    const r = await syncNow()
    if (r.ok) {
      setStatus({
        kind: 'ok',
        msg: t('chrome.settings.sync.syncOk', '{p} geladen, {u} hochgeladen')
          .replace('{p}', String(r.pulled))
          .replace('{u}', String(r.pushed)),
      })
    } else {
      const map: Record<string, string> = {
        disabled: t('chrome.settings.sync.errDisabled', 'Sync ist nicht aktiviert'),
        unreachable: t('chrome.settings.sync.errUnreachable', 'Server nicht erreichbar'),
      }
      setStatus({ kind: 'error', msg: map[r.error ?? ''] ?? t('chrome.settings.sync.errGeneric', 'Fehler: {e}').replace('{e}', r.error ?? '?') })
    }
  }

  const busy = status.kind === 'testing' || status.kind === 'syncing'

  return (
    <section className="mb-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-av-text-muted">
          {t('chrome.settings.sync.title', 'Backend / Sync')}
        </span>
        <Badge tone="accent">{t('chrome.settings.sync.optional', 'Optional')}</Badge>
      </div>
      <div className="rounded-av-card border border-av-border bg-av-surface-2 px-3.5 py-3">
        <p className="mb-3 text-[12px] leading-relaxed text-av-text-muted">
          {t(
            'chrome.settings.sync.intro',
            'Die Suite arbeitet immer offline. Optional kannst du einen eigenen Sync-Server anbinden, um Projekte zwischen Geräten abzugleichen. Ohne Server bleibt alles rein lokal.',
          )}
        </p>

        {/* Aktiv-Schalter */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-av-text">
            {t('chrome.settings.sync.enable', 'Sync aktivieren')}
          </span>
          <Switch
            checked={cfg.enabled}
            accent="var(--av-accent)"
            onChange={(c) => update({ enabled: c })}
            label={t('chrome.settings.sync.enable', 'Sync aktivieren')}
          />
        </div>

        {/* URL */}
        <label className="mb-2 block">
          <span className="mb-1 block text-[12px] text-av-text-secondary">
            {t('chrome.settings.sync.url', 'Server-URL')}
          </span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://sync.example.com/api"
            className="av-focus w-full rounded-av-control border border-av-border bg-av-surface-3 px-2.5 py-1.5 text-[12.5px] text-av-text"
            value={cfg.baseUrl}
            onChange={(e) => update({ baseUrl: e.target.value })}
          />
        </label>

        {/* Token */}
        <label className="mb-3 block">
          <span className="mb-1 block text-[12px] text-av-text-secondary">
            {t('chrome.settings.sync.token', 'Token (Bearer)')}
          </span>
          <input
            type="password"
            autoComplete="off"
            placeholder="••••••••"
            className="av-focus w-full rounded-av-control border border-av-border bg-av-surface-3 px-2.5 py-1.5 text-[12.5px] text-av-text"
            value={cfg.token}
            onChange={(e) => update({ token: e.target.value })}
          />
        </label>

        {/* Aktionen */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canUse || busy}
            onClick={doTest}
            className="av-focus rounded-av-control border border-av-border bg-av-surface-3 px-3 py-1.5 text-[12.5px] font-medium text-av-text hover:bg-av-surface-1 disabled:opacity-50"
          >
            {status.kind === 'testing'
              ? t('chrome.settings.sync.testing', 'Teste…')
              : t('chrome.settings.sync.test', 'Verbindung testen')}
          </button>
          <button
            type="button"
            disabled={!canUse || !cfg.enabled || busy}
            onClick={doSync}
            className="av-focus rounded-av-control border border-transparent px-3 py-1.5 text-[12.5px] font-medium disabled:opacity-50"
            style={{ background: 'var(--av-accent)', color: 'var(--av-accent-text)' }}
          >
            {status.kind === 'syncing'
              ? t('chrome.settings.sync.syncing', 'Synchronisiere…')
              : t('chrome.settings.sync.syncNow', 'Jetzt synchronisieren')}
          </button>
          {status.kind === 'ok' && (
            <span className="flex items-center gap-1 text-[12px] text-av-success">
              <Icon name="check" size={14} /> {status.msg}
            </span>
          )}
          {status.kind === 'error' && (
            <span className="flex items-center gap-1 text-[12px] text-av-danger">
              <Icon name="warning" size={14} /> {status.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

function SettingRow({
  appId,
  control,
  value,
  accent,
  t,
  onChange,
}: {
  appId: AppModuleId
  control: SettingControl
  value: SettingValue | undefined
  accent: string
  t: TFunc
  onChange: (v: SettingValue) => void
}) {
  // Die Schema-Labels sind deutsche Quell-Strings; hier über abgeleitete Keys
  // (config.set.<app>.<key>.*) übersetzt, Deutsch bleibt Fallback.
  const label = t(`config.set.${appId}.${control.key}.label`, control.label)
  const hint = control.hint ? t(`config.set.${appId}.${control.key}.hint`, control.hint) : undefined
  const options = (control.options ?? []).map((o) => ({
    value: o.value,
    label: t(`config.set.${appId}.${control.key}.opt.${o.value}`, o.label),
  }))
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12.5px] text-av-text-secondary">
        {label}
        {hint && <span className="ml-1.5 text-[11px] text-av-text-faint">({hint})</span>}
      </span>
      <div className="flex-none">
        {control.kind === 'toggle' && (
          <Switch checked={!!value} accent={accent} onChange={(c) => onChange(c)} label={label} />
        )}
        {control.kind === 'segmented' && (
          <Segmented
            options={options}
            value={String(value ?? '')}
            accent={accent}
            onChange={(v) => onChange(v)}
          />
        )}
        {control.kind === 'select' && (
          <select
            className="av-focus rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[12.5px] text-av-text"
            value={String(value ?? '')}
            aria-label={label}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        {control.kind === 'slider' && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              className="av-focus w-36"
              min={control.min}
              max={control.max}
              step={control.step}
              value={Number(value ?? control.min ?? 0)}
              aria-label={label}
              style={{ accentColor: accent }}
              onChange={(e) => onChange(Number(e.target.value))}
            />
            <span className="av-num w-16 text-right text-[12px] tabular-nums text-av-text-muted">
              {control.format ? control.format(Number(value ?? control.min ?? 0)) : String(value)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function Switch({
  checked,
  accent,
  onChange,
  label,
}: {
  checked: boolean
  accent: string
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="av-focus relative inline-flex h-5 w-9 flex-none items-center rounded-full border border-av-border transition-colors"
      style={{ background: checked ? accent : 'var(--av-surface-3)' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full transition-transform"
        style={{ background: 'var(--av-accent-text)', transform: checked ? 'translateX(17px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

function Segmented({
  options,
  value,
  accent,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  accent: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-av-control border border-av-border bg-av-surface-3 p-0.5">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            className="av-focus rounded-av-control px-2 py-0.5 text-[12px]"
            style={{
              background: active ? accent : 'transparent',
              color: active ? 'var(--av-accent-text)' : 'var(--av-text-secondary)',
              fontWeight: active ? 600 : 400,
            }}
            aria-pressed={active}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
