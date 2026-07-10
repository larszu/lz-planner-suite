import type { CSSProperties, ReactNode } from 'react'
import type { OnboardingLang, OnboardingTheme, WelcomeAction } from './types'
import { getStrings, type OnboardingStrings } from './strings'
import { AvobStyles } from './styles'

export interface WelcomeDialogProps {
  open: boolean
  /** App-spezifischer Titel, z. B. "Willkommen beim Cable Planner". */
  title: string
  /** Einleitungssatz unter dem Titel. */
  intro?: string
  actions: WelcomeAction[]
  /** "Später entscheiden" / X — schließt ohne Aktion. */
  onDismiss: () => void
  lang?: OnboardingLang
  theme?: OnboardingTheme
  /** App-Akzentfarbe (cable Orange, multicam Blau, light Blau). */
  accent?: string
  strings?: Partial<OnboardingStrings>
  /** Tooltip des Später-Buttons (z. B. Speicher-Hinweis im Cable Planner). */
  dismissTitle?: string
  /** Zusatzinhalt unter den Aktionen (z. B. Zuletzt-verwendet-Liste). */
  children?: ReactNode
}

/**
 * Einheitlicher Erststart-Dialog der Suite: Titel, Intro, Aktionskarten,
 * Später-Button. Layout und Verhalten sind in allen Apps identisch; Sprache,
 * Icons, Akzent und Aktionen kommen von der App.
 */
export const WelcomeDialog = ({
  open,
  title,
  intro,
  actions,
  onDismiss,
  lang = 'de',
  theme = 'dark',
  accent = '#3b82f6',
  strings: overrides,
  dismissTitle,
  children,
}: WelcomeDialogProps) => {
  if (!open) return null
  const strings = getStrings(lang, overrides)

  return (
    <div className="avob-overlay" role="presentation">
      <AvobStyles />
      <div
        className="avob-card"
        data-avob-theme={theme}
        style={{ '--avob-accent': accent } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="avob-head">
          <h2 className="avob-title">{title}</h2>
          <button type="button" className="avob-x" onClick={onDismiss} title={strings.close}>
            ✕
          </button>
        </div>
        <div className="avob-body">
          {intro && <p className="avob-intro">{intro}</p>}
          <div className="avob-actions">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="avob-action"
                style={
                  action.accent
                    ? ({ '--avob-action-accent': action.accent } as CSSProperties)
                    : undefined
                }
                onClick={action.onSelect}
              >
                {action.icon && <span className="avob-action-icon">{action.icon}</span>}
                <span>
                  <span className="avob-action-title">{action.title}</span>
                  <span className="avob-action-desc">{action.description}</span>
                </span>
              </button>
            ))}
          </div>
          {children}
        </div>
        <div className="avob-foot">
          <span />
          <button type="button" className="avob-ghost" onClick={onDismiss} title={dismissTitle}>
            {strings.later}
          </button>
        </div>
      </div>
    </div>
  )
}
