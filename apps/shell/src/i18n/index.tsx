/**
 * Shell-i18n.
 *
 * Deutsch ist die Quell-Sprache und steht als Fallback direkt im JSX:
 * `t('ns.key', 'Deutsche Form')`. Das englische Override-Dictionary (`en`)
 * liefert nur die Übersetzung; fehlt ein Key, bleibt die deutsche Form stehen —
 * partielle Abdeckung bricht die UI also nie.
 *
 * Die Sprache lebt im App-State (siehe App.tsx) und wird über den
 * `LanguageProvider` als React-Context in den ganzen Baum gereicht, damit nicht
 * ~15 Komponenten ein `language`/`t`-Prop durchreichen müssen. Module ohne
 * Hook-Zugriff (Konstanten-Tabellen wie registry.ts) nutzen `translate(lang, …)`
 * direkt.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Language } from '../shell/language'
import { en } from './en'

export type { Language }

/** Reine Lookup-Funktion (auch außerhalb von React nutzbar). */
export function translate(lang: Language, key: string, de: string): string {
  return lang === 'en' && en[key] !== undefined ? en[key] : de
}

/** Platzhalter in einen übersetzten String einsetzen:
 *  format(t('x', '{n} Kabel'), { n: 5 }) → '5 Kabel'. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (values[k] === undefined ? `{${k}}` : String(values[k])))
}

export type TFunc = (key: string, de: string) => string

type Ctx = { language: Language; t: TFunc }
const LanguageContext = createContext<Ctx>({ language: 'de', t: (_k, de) => de })

export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  const value = useMemo<Ctx>(
    () => ({ language, t: (key, de) => translate(language, key, de) }),
    [language],
  )
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/** Hook: liefert die an die aktuelle Sprache gebundene `t`-Funktion. */
export function useT(): TFunc {
  return useContext(LanguageContext).t
}

/** Hook: aktuelle Sprache (für Locale-abhängige Formatierung wie Intl). */
export function useLanguage(): Language {
  return useContext(LanguageContext).language
}
