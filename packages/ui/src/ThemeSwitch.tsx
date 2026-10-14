import { Icon, type IconName } from './icons'
import type { ThemePreference } from './theme'

/** Reihenfolge und Zeichen des Umschalters: Auto · Hell · Dunkel. */
export const THEME_OPTIONS: readonly { id: ThemePreference; icon: IconName; label: string }[] = [
  { id: 'system', icon: 'monitor', label: 'Auto' },
  { id: 'light', icon: 'sun', label: 'Light' },
  { id: 'dark', icon: 'moon', label: 'Dark' },
]

export interface ThemeSwitchProps {
  preference: ThemePreference
  onChange: (p: ThemePreference) => void
  /** Beschriftung je Wahl (Quellsprache en, Uebersetzung kommt vom Aufrufer). */
  labels?: Partial<Record<ThemePreference, string>>
  ariaLabel?: string
  className?: string
}

/**
 * Sichtbarer Theme-Umschalter (ADR-007 Abschnitt 6): drei Zeichen in einem
 * Segment, Auto folgt dem System. Speichern und `data-theme` setzen macht
 * `useTheme` — dieser Baustein zeigt nur die Wahl und meldet sie.
 */
export function ThemeSwitch({ preference, onChange, labels, ariaLabel = 'Appearance', className }: ThemeSwitchProps) {
  return (
    <div role="group" aria-label={ariaLabel} className={className ? `av-theme-switch ${className}` : 'av-theme-switch'}>
      {THEME_OPTIONS.map((o) => {
        const label = labels?.[o.id] ?? o.label
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={preference === o.id}
            aria-label={label}
            title={label}
            onClick={() => onChange(o.id)}
          >
            <Icon name={o.icon} size={16} />
          </button>
        )
      })}
    </div>
  )
}
