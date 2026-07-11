import { useState } from 'react'
import { Badge, Icon, Modal, type ThemePreference } from '@avplan/ui'
import { MODULES, type ModuleId } from '../modules/registry'
import { useT, type TFunc } from '../i18n'
import type { Language } from './language'
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
        <p className="mb-3 text-[12px] text-av-text-muted">
          {t('chrome.settings.commonNote', 'Diese Einstellungen gelten für die gesamte Suite gleichzeitig — nicht pro App. Das Theme steuert die Shell und wird an den jeweils geöffneten Planer weitergegeben.')}
        </p>
        <div className="flex items-center justify-between rounded-av-card border border-av-border bg-av-surface-2 px-3.5 py-3">
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
        <p className="mt-1.5 text-[11px] text-av-text-faint">
          {t('chrome.settings.languageNote', 'Die Sprache wird an die geöffneten Planer weitergegeben. Cable Planner schaltet vollständig um; Light Planner teilweise. Die Shell-Oberfläche selbst ist derzeit deutsch.')}
        </p>
      </section>

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
        <p className="mt-2.5 text-[11px] text-av-text-faint">
          {t('chrome.settings.appNote', 'Aufgeklappt ist die App, in der du gerade bist. Änderungen gelten sofort im geöffneten Planer; ist er gerade nicht geöffnet, greifen sie beim nächsten Öffnen. Das gemeinsame Theme oben gilt überall.')}
        </p>
      </section>
    </>
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
        className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(17px)' : 'translateX(3px)' }}
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
              color: active ? '#fff' : 'var(--av-text-secondary)',
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
