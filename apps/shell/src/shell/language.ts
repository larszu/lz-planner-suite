/**
 * Suite-weite Sprach-Einstellung (DE/EN). Wie das Theme gilt sie gemeinsam für
 * die ganze Suite und wird per Settings-Bridge an die eingebetteten Planer
 * weitergereicht (Cable schaltet vollständig um, Light teilweise).
 */

export type Language = 'de' | 'en'

const STORAGE_KEY = 'avplan.language'

export function loadLanguage(): Language {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'de'
  } catch {
    return 'de'
  }
}

export function saveLanguage(lang: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* Storage gesperrt */
  }
}
