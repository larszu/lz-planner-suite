import type { ReactNode } from 'react'

/** Sprache der mitgelieferten Chrome-Strings (Buttons, Header, Tipp-Label). */
export type OnboardingLang = 'de' | 'en'

/** Farbwelt — Apps mit Light-Theme (Cable Planner) reichen ihr Theme durch. */
export type OnboardingTheme = 'dark' | 'light'

/** Ein Slide der Erste-Schritte-Tour (zentriertes Modal, wie Cable Planner). */
export interface TourStep {
  title: string
  body: string
  /** Optionaler Hinweis, als "Tipp:"-Box unter dem Body gerendert. */
  hint?: string
}

/** Eine Aktion im Welcome-Dialog (z. B. "Neues Projekt" / "Plan laden"). */
export interface WelcomeAction {
  id: string
  title: string
  description: string
  /** Icon-Slot — die App liefert ihr eigenes Icon-Set (lucide, react-icons, …). */
  icon?: ReactNode
  /** Akzentfarbe fuer Icon + Hover-Rahmen dieser Aktion; Default: Dialog-Akzent. */
  accent?: string
  onSelect: () => void
}
