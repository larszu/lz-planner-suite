import type { OnboardingLang } from './types'

/**
 * Chrome-Strings der Onboarding-Bausteine (Buttons, Header, Labels).
 * Deutsch ist Quellsprache (Konvention der Suite). Apps mit eigener
 * i18n-Schicht (Cable Planner) reichen Uebersetzungen per `strings`-Prop
 * als Overrides durch.
 */
export interface OnboardingStrings {
  /** Eyebrow der Tour; {step}/{total} werden ersetzt. */
  stepHeader: string
  back: string
  next: string
  /** Button auf dem letzten Slide. */
  finish: string
  endTour: string
  /** Label der Hinweis-Box in Tour-Steps. */
  tip: string
  /** Footer-Button des Welcome-Dialogs. */
  later: string
  /** title-Attribut des X-Buttons. */
  close: string
}

const DE: OnboardingStrings = {
  stepHeader: 'Erste-Schritte-Tour · Schritt {step} / {total}',
  back: 'Zurück',
  next: 'Weiter',
  finish: "Los geht's",
  endTour: 'Tour beenden',
  tip: 'Tipp:',
  later: 'Später entscheiden',
  close: 'Schließen',
}

const EN: OnboardingStrings = {
  stepHeader: 'Getting-started tour · Step {step} / {total}',
  back: 'Back',
  next: 'Next',
  finish: "Let's go",
  endTour: 'End tour',
  tip: 'Tip:',
  later: 'Decide later',
  close: 'Close',
}

const BUILT_IN: Record<OnboardingLang, OnboardingStrings> = { de: DE, en: EN }

export function getStrings(
  lang: OnboardingLang = 'de',
  overrides?: Partial<OnboardingStrings>,
): OnboardingStrings {
  return { ...BUILT_IN[lang], ...overrides }
}

export function formatStepHeader(template: string, step: number, total: number): string {
  return template.replace('{step}', String(step)).replace('{total}', String(total))
}
