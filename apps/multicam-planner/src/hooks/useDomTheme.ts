import { useEffect, useState } from 'react';
import { istHell } from '../lib/thema';

/**
 * Aktuelles Theme fuer die Stellen, die ihre Farben SELBST zeichnen (3D-Szene,
 * Startassistent) und deshalb kein CSS-Token lesen koennen.
 *
 * Eigene Datei, damit Komponenten-Dateien nur Komponenten exportieren
 * (react-refresh/only-export-components).
 *
 * ZWEI QUELLEN, NICHT EINE. Bis B-70 las dieser Hook nur `data-theme` am
 * <html> — das genuegte, solange das Attribut ausschliesslich von der Shell
 * beim Einbetten gesetzt wurde. Seit die App einen eigenen Schalter hat, gibt
 * es einen dritten Zustand: „System" ENTFERNT das Attribut, damit die
 * Medienabfrage in `index.css` greift. Ein Hook, der nur das Attribut liest,
 * meldete dann `dark`, waehrend das Stilblatt hell faerbt — die 3D-Szene
 * bliebe dunkel in einer hellen App, also genau die halb umgefaerbte
 * Oberflaeche, gegen die B-70 antrat.
 *
 * `istHell()` beantwortet beides; hier wird nur beobachtet, wann sich die
 * Antwort aendern kann. Die Medienabfrage wird auch dann beobachtet, wenn
 * gerade eine Wahl gesetzt ist: sie kann weggenommen werden, und dann gilt
 * wieder das Fenster.
 */
export function useDomTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (istHell() ? 'light' : 'dark'));
  useEffect(() => {
    const update = () => setTheme(istHell() ? 'light' : 'dark');
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const abfrage = window.matchMedia?.('(prefers-color-scheme: light)');
    abfrage?.addEventListener?.('change', update);
    return () => {
      obs.disconnect();
      abfrage?.removeEventListener?.('change', update);
    };
  }, []);
  return theme;
}
