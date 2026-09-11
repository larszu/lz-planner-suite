// ───────────────────────────────────────────────────────────────────────────
// Die Einstellungen — rechts aussen in der Kopfzeile, wie im Cable Planner.
//
// WAS DRIN STEHT:
//
//   Sprache   Englisch (Quelle) oder Deutsch (Übersetzung). Seit dem
//             2026-09-11, Nutzer-Entscheidung: „Die Standard Sprache muss
//             immer Englisch sein und über i18n muss man auf deutsch
//             übersetzen können."
//
//             Davor stand hier, warum es die Sprache NICHT gibt: dieses Repo
//             sei deutsch-quellig und habe keine i18n-Schicht, ein
//             Umschalter mit nur einer Sprache wäre ein PLACEHOLDER. Der
//             Einwand war richtig — er beschrieb die fehlende Schicht, nicht
//             eine Entscheidung gegen sie. Jetzt gibt es die Schicht, und
//             damit hat der Umschalter etwas zu schalten.
//   Thema     hell / dunkel / dem System folgen. Drei Zustände, weil
//             „System" keine Umschreibung für „dunkel" ist.
//   Über      Name und Version. Die Version kommt aus `__APP_VERSION__`
//             (Vite-Define) und steht nirgends im Quelltext ein zweites Mal.
//
// Der Dialog ist eine FLÄCHE und keine Karte: kein Radius, kein Schatten,
// Kopflinie oben, Aktionen unten rechts (ADR-007 Abschnitt 6).
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { liesThema, setzeThema, type Thema } from '../lib/thema'
import { useT, type Sprache } from '../i18n'

type UebersetzFn = (key: string, en: string) => string

const themaWahl = (t: UebersetzFn): { id: Thema; titel: string; hinweis: string }[] => [
  { id: 'system', titel: t('settings.theme.system', 'Follow the system'), hinweis: t('settings.theme.system.hint', 'Takes whatever the operating system says.') },
  { id: 'dunkel', titel: t('settings.theme.dark', 'Dark'), hinweis: t('settings.theme.dark.hint', 'Always dark, regardless of the system.') },
  { id: 'hell', titel: t('settings.theme.light', 'Light'), hinweis: t('settings.theme.light.hint', 'Always light, regardless of the system.') },
]

/** Die Sprachen stehen in IHRER EIGENEN Sprache — „Deutsch", nicht „German".
 *  Wer die Oberfläche gerade nicht versteht, sucht sein eigenes Wort. */
const SPRACHEN: { id: Sprache; titel: string }[] = [
  { id: 'en', titel: 'English' },
  { id: 'de', titel: 'Deutsch' },
]

export function Einstellungen({ onClose }: { onClose: () => void }) {
  const { t, sprache, setzeSprache } = useT()
  const [thema, setThema] = useState<Thema>(liesThema)
  const WAHL = themaWahl(t)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    // Klick auf den Hintergrund schliesst — hier ohne Rueckfrage, weil in
    // diesem Dialog nichts ungesichert steht: jede Wahl wirkt sofort.
    <div className="dialog-hinter" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={t('settings.title', 'Settings')}>
        <header className="dialog-kopf">
          <h2>{t('settings.title', 'Settings')}</h2>
          <button type="button" className="dialog-zu" onClick={onClose} aria-label={t('settings.close', 'Close')}>
            ×
          </button>
        </header>
        <div className="dialog-rumpf">
          <section>
            <h3>{t('settings.language', 'Language')}</h3>
            <p className="leise">
              {t(
                'settings.language.hint',
                'English is the source language; German is a translation. A missing entry falls back to English.',
              )}
            </p>
            {SPRACHEN.map((s) => (
              <label key={s.id} className="wahl">
                <input
                  type="radio"
                  name="sprache"
                  checked={sprache === s.id}
                  onChange={() => setzeSprache(s.id)}
                />
                <span>{s.titel}</span>
              </label>
            ))}
          </section>
          <section>
            <h3>{t('settings.theme', 'Theme')}</h3>
            {WAHL.map((w) => (
              <label key={w.id} className="wahl">
                <input
                  type="radio"
                  name="thema"
                  checked={thema === w.id}
                  onChange={() => {
                    setThema(w.id)
                    setzeThema(w.id)
                  }}
                />
                <span>
                  {w.titel}
                  <em>{w.hinweis}</em>
                </span>
              </label>
            ))}
          </section>
          <section>
            <h3>{t('settings.about', 'About')}</h3>
            <p className="leise">Facility Planner {__APP_VERSION__}</p>
            <p className="leise">{t('settings.about.body', 'The building tool of the AV Planner suite (ADR-006).')}</p>
          </section>
        </div>
        <footer className="dialog-fuss">
          <button type="button" className="knopf-haupt" onClick={onClose}>
            {t('settings.close', 'Close')}
          </button>
        </footer>
      </div>
    </div>
  )
}
