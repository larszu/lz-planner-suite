import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Icon, type IconName } from './icons'

export interface RailModule {
  id: string
  label: string
  icon: IconName
  /** Ziffern-Hotkey (1–9). Aktiviert das Modul global. */
  hotkey?: string
  /** Akzentfarbe (CSS-Wert/Variable) für aktiven Zustand + Indikator. */
  accent?: string
}

export interface ModuleRailProps {
  modules: RailModule[]
  active: string
  onSelect: (id: string) => void
  /** Sekundär-Einträge unter dem Trenner (Ebenen, Bibliothek …). */
  footer?: RailModule[]
  activeFooter?: string
  onSelectFooter?: (id: string) => void
  ariaLabel?: string
}

const RailButton = ({
  mod,
  active,
  onSelect,
}: {
  mod: RailModule
  active: boolean
  onSelect: (id: string) => void
}) => (
  <button
    type="button"
    className="av-rail-item av-focus"
    data-active={active ? 'true' : undefined}
    style={mod.accent ? ({ '--av-mod': mod.accent } as CSSProperties) : undefined}
    aria-pressed={active}
    aria-label={mod.hotkey ? `${mod.label} (Taste ${mod.hotkey})` : mod.label}
    onClick={() => onSelect(mod.id)}
  >
    {mod.hotkey && <span className="av-rail-hotkey">{mod.hotkey}</span>}
    <Icon name={mod.icon} size={20} />
    <span className="av-rail-label">{mod.label}</span>
  </button>
)

/**
 * Modul-Leiste (Rail + Panel-Muster nach VS Code / Carbon UI Shell): schmale
 * Icon-Spalte zum Modulwechsel mit Ziffern-Hotkeys. Die Hotkeys sind global
 * (außer beim Tippen in Feldern), damit 1–4 jederzeit das Modul wechseln.
 */
export function ModuleRail({
  modules,
  active,
  onSelect,
  footer,
  activeFooter,
  onSelectFooter,
  ariaLabel = 'Module',
}: ModuleRailProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return
      const mod = modules.find((m) => m.hotkey && m.hotkey === e.key)
      if (mod) {
        e.preventDefault()
        onSelect(mod.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modules, onSelect])

  return (
    <nav className="av-rail" aria-label={ariaLabel}>
      {modules.map((mod) => (
        <RailButton key={mod.id} mod={mod} active={mod.id === active} onSelect={onSelect} />
      ))}
      {footer && footer.length > 0 && (
        <>
          <div style={{ flex: 1 }} />
          {footer.map((mod) => (
            <RailButton
              key={mod.id}
              mod={mod}
              active={mod.id === activeFooter}
              onSelect={onSelectFooter ?? onSelect}
            />
          ))}
        </>
      )}
    </nav>
  )
}
