/**
 * Seen-State des Onboardings — ein JSON-Objekt pro App unter
 * `avplan.onboarding.<appId>`. Storage ist injizierbar: localStorage
 * (Default, "einmal pro Installation"), sessionStorage ("einmal pro
 * Sitzung", MultiCam-Assistent) oder ein Fake im Test.
 *
 * `migrateFrom` uebernimmt die alten Einzel-Flags der Apps (z. B. Cable
 * Planners `cp.tourSeen.v1` = '1'), damit Bestandsnutzer nach dem Umstieg
 * nicht erneut durch Tour/Assistent laufen.
 */

export type OnboardingFlag = 'welcome' | 'tour' | 'wizard'

export interface OnboardingStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface LegacyFlag {
  /** Alter Storage-Key der App. */
  key: string
  /** Als gesehen zu markierendes Flag, wenn der alte Key '1' enthaelt. */
  flag: OnboardingFlag
}

export interface OnboardingStateOptions {
  /** Stabile App-Kennung, Teil des Storage-Keys (z. B. 'cable-planner'). */
  appId: string
  /** Default: window.localStorage. */
  storage?: OnboardingStorage
  migrateFrom?: LegacyFlag[]
}

export interface OnboardingState {
  hasSeen(flag: OnboardingFlag): boolean
  markSeen(flag: OnboardingFlag): void
}

const storageKeyFor = (appId: string) => `avplan.onboarding.${appId}`

const defaultStorage = (): OnboardingStorage | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

type SeenMap = Partial<Record<OnboardingFlag, 1>>

export function createOnboardingState(options: OnboardingStateOptions): OnboardingState {
  const storage = options.storage ?? defaultStorage()
  const key = storageKeyFor(options.appId)

  const read = (): SeenMap => {
    if (!storage) return {}
    try {
      const raw = storage.getItem(key)
      const parsed: unknown = raw ? JSON.parse(raw) : {}
      const seen: SeenMap =
        parsed && typeof parsed === 'object' ? { ...(parsed as SeenMap) } : {}
      for (const legacy of options.migrateFrom ?? []) {
        if (!seen[legacy.flag] && storage.getItem(legacy.key) === '1') {
          seen[legacy.flag] = 1
        }
      }
      return seen
    } catch {
      // Storage kaputt/gesperrt: alles als gesehen behandeln, damit
      // Nutzer nicht bei jedem Start erneut Dialoge wegklicken muessen.
      return { welcome: 1, tour: 1, wizard: 1 }
    }
  }

  return {
    hasSeen: (flag) => {
      if (!storage) return true
      return read()[flag] === 1
    },
    markSeen: (flag) => {
      if (!storage) return
      try {
        storage.setItem(key, JSON.stringify({ ...read(), [flag]: 1 }))
      } catch {
        /* Storage nicht verfuegbar — bewusst ignorieren */
      }
    },
  }
}
