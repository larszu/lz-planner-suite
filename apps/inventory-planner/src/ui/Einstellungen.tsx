// ───────────────────────────────────────────────────────────────────────────
// Die Einstellungen — rechts aussen in der Kopfzeile, wie im Cable Planner.
//
// WAS DRIN STEHT, UND WAS BEWUSST NICHT:
//
//   Thema     hell / dunkel / dem System folgen. Drei Zustaende, weil
//             „System" keine Umschreibung fuer „dunkel" ist.
//   Ueber     Name und Version. Die Version kommt aus `__APP_VERSION__`
//             (Vite-Define) und steht nirgends im Quelltext ein zweites Mal.
//
//   SPRACHE FEHLT, und das ist kein Vergessen. Diese App ist deutsch-quellig
//   (`package.json` -> `avplan.sourceLanguage: de`, von `lang:check`
//   gemessen) und hat keine i18n-Schicht: die Texte stehen roh im JSX. Eine
//   Sprachumschaltung waere nicht ein Knopf, sondern eine Uebersetzung der
//   ganzen Oberflaeche plus die Schicht darunter — ein eigenes Stueck Arbeit
//   und keine Vereinheitlichung der Kopfzeile. Ein Umschalter, der nur eine
//   Sprache anbietet, waere ein PLACEHOLDER.
//
// Der Dialog ist eine FLAECHE und keine Karte: kein Radius, kein Schatten,
// Kopflinie oben, Aktionen unten rechts (ADR-007 Abschnitt 6).
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { liesThema, setzeThema, type Thema } from '../lib/thema'

const WAHL: { id: Thema; titel: string; hinweis: string }[] = [
  { id: 'system', titel: 'Dem System folgen', hinweis: 'Übernimmt, was das Betriebssystem sagt.' },
  { id: 'dunkel', titel: 'Dunkel', hinweis: 'Immer dunkel, unabhängig vom System.' },
  { id: 'hell', titel: 'Hell', hinweis: 'Immer hell, unabhängig vom System.' },
]

export function Einstellungen({ onClose }: { onClose: () => void }) {
  const [thema, setThema] = useState<Thema>(liesThema)

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
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Einstellungen">
        <header className="dialog-kopf">
          <h2>Einstellungen</h2>
          <button type="button" className="dialog-zu" onClick={onClose} aria-label="Schliessen">
            ×
          </button>
        </header>
        <div className="dialog-rumpf">
          <section>
            <h3>Thema</h3>
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
            <h3>Über</h3>
            <p className="leise">Inventory Planner {__APP_VERSION__}</p>
            <p className="leise">Das Lager der AV-Planner-Suite (ADR-006).</p>
          </section>
        </div>
        <footer className="dialog-fuss">
          <button type="button" className="knopf-haupt" onClick={onClose}>
            Schliessen
          </button>
        </footer>
      </div>
    </div>
  )
}
