import { useEffect, useState, type CSSProperties } from 'react'
import type { OnboardingLang, OnboardingTheme, TourStep } from './types'
import { formatStepHeader, getStrings, type OnboardingStrings } from './strings'
import { AvobStyles } from './styles'

export interface TourDialogProps {
  open: boolean
  steps: TourStep[]
  /** Wird bei "Tour beenden", X und "Los geht's" gerufen — App persistiert dort ihr Seen-Flag. */
  onClose: () => void
  /** Optional: reagiert auf Schrittwechsel (z. B. um App-Zustand mitzuführen). */
  onStepChange?: (index: number) => void
  lang?: OnboardingLang
  theme?: OnboardingTheme
  accent?: string
  strings?: Partial<OnboardingStrings>
}

/**
 * Erste-Schritte-Tour als zentriertes Modal mit sequentiellen Slides —
 * Mechanik und Look des Cable-Planner-Originals, jetzt fuer alle Apps:
 * Eyebrow mit Schrittzaehler, Fortschritts-Punkte, Zurueck/Weiter,
 * "Los geht's" auf dem letzten Slide. Bewusst ohne DOM-Spotlights (fragil
 * bei Panel-Resizes); Slides beschreiben die Orte als Text.
 */
export const TourDialog = ({
  open,
  steps,
  onClose,
  onStepChange,
  lang = 'de',
  theme = 'dark',
  accent = '#3b82f6',
  strings: overrides,
}: TourDialogProps) => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open || steps.length === 0) return null
  const strings = getStrings(lang, overrides)
  const current = steps[Math.min(step, steps.length - 1)]
  const isLast = step >= steps.length - 1

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, index))
    setStep(clamped)
    onStepChange?.(clamped)
  }

  return (
    <div className="avob-overlay" role="presentation">
      <AvobStyles />
      <div
        className="avob-card"
        data-avob-theme={theme}
        style={{ '--avob-accent': accent } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
      >
        <div className="avob-head">
          <span className="avob-eyebrow">
            {formatStepHeader(strings.stepHeader, step + 1, steps.length)}
          </span>
          <button type="button" className="avob-x" onClick={onClose} title={strings.close}>
            ✕
          </button>
        </div>
        <div className="avob-body">
          <h2 className="avob-tour-title">{current.title}</h2>
          <p className="avob-tour-body">{current.body}</p>
          {current.hint && (
            <div className="avob-hint">
              {strings.tip} {current.hint}
            </div>
          )}
        </div>
        <div className="avob-foot">
          <button type="button" className="avob-ghost" onClick={onClose}>
            {strings.endTour}
          </button>
          <div className="avob-nav">
            <div className="avob-dots" aria-hidden="true">
              {steps.map((_, index) => (
                <span
                  key={index}
                  className={`avob-dot${index === step ? ' is-active' : index < step ? ' is-done' : ''}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="avob-btn"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
            >
              {strings.back}
            </button>
            <button
              type="button"
              className="avob-btn avob-primary"
              onClick={() => (isLast ? onClose() : goTo(step + 1))}
            >
              {isLast ? strings.finish : strings.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
