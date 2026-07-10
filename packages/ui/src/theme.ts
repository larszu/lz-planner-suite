import { useCallback, useEffect, useState } from 'react'

export type ThemePreference = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

/** Reine Auflösung: aus Präferenz + System-Signal wird das effektive Theme. */
export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}

const STORAGE_KEY = 'avplan.theme'

const readStored = (): ThemePreference => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw === 'dark' || raw === 'light' || raw === 'system' ? raw : 'system'
  } catch {
    return 'system'
  }
}

const systemDark = (): boolean => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return true
  }
}

/**
 * Theme-Steuerung der Suite. Setzt `data-theme` auf <html> (überstimmt die
 * `prefers-color-scheme`-Defaults der Tokens in beide Richtungen), persistiert
 * die Präferenz und folgt dem System, solange 'system' gewählt ist.
 */
export function useTheme(): {
  theme: ResolvedTheme
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  toggle: () => void
} {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStored)
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(systemDark)

  useEffect(() => {
    let mql: MediaQueryList
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const theme = resolveTheme(preference, systemPrefersDark)

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
    } catch {
      /* SSR/kein DOM */
    }
  }, [theme])

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p)
    try {
      window.localStorage.setItem(STORAGE_KEY, p)
    } catch {
      /* Storage gesperrt */
    }
  }, [])

  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setPreference])

  return { theme, preference, setPreference, toggle }
}
