import { useEffect, useState } from 'react';

/**
 * Aktuelles Theme aus `data-theme` am <html> (die Shell setzt es beim Einbetten).
 * Eigene Datei, damit Komponenten-Dateien nur Komponenten exportieren
 * (react-refresh/only-export-components).
 */
export function useDomTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'),
  );
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setTheme(el.dataset.theme === 'light' ? 'light' : 'dark');
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}
