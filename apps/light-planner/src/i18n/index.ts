// ───────────────────────────────────────────────────────────────────────────
// i18n — same model as Cable-Planner: German is the SOURCE language, written
// inline as the fallback in `t('some.key', 'Deutsche Form')`. The `en` dict
// only overrides for English. Missing keys fall back to the German fallback,
// so wrapping a string never breaks it.
//
// Usage:  const { t } = useTranslation();  t('menu.file', 'Datei')
// Language lives in the uiStore (matches a host that owns the language).
// ───────────────────────────────────────────────────────────────────────────
import { useUiStore } from '../store/uiStore';
import { base } from './en/base';
import { topbar } from './en/topbar';
import { panels } from './en/panels';
import { app } from './en/app';
import { dialogs } from './en/dialogs';

// English overrides, aus Domänen-Teildicts komponiert. Deutsch bleibt
// Quell-Sprache (Fallback im JSX via t(key, 'Deutsch')); fehlt ein Key, greift
// die deutsche Form.
const en: Record<string, string> = {
  ...base,
  ...topbar,
  ...panels,
  ...app,
  ...dialogs,
};

export function translate(language: 'de' | 'en', key: string, de: string): string {
  return language === 'en' && en[key] !== undefined ? en[key] : de;
}

/** Hook: returns a `t(key, de)` bound to the current language + the language. */
export function useTranslation() {
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);
  return {
    t: (key: string, de: string) => translate(language, key, de),
    language,
    setLanguage,
  };
}
