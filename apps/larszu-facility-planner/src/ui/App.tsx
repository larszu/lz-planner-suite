// ───────────────────────────────────────────────────────────────────────────
// Die Oberfläche des Gebäude-Werkzeugs (E-26, ADR-006 Schritt 3).
//
// Der Eigentümer hat am 2026-09-09 für die Issues `cable#665` und `cable#667`
// „Repo anlegen, Gerüst bauen" gewählt, mit den drei Modellen Schaltschrank,
// UP-/AP-Dose und Stromkreis.
//
// WAS DIESES WERKZEUG IST — UND WAS ES NICHT IST. Es beschreibt ein Gebäude,
// das Jahre steht: seine Anschlusspunkte, seine Kreise, seine Verteilungen,
// die benannten Klinken seiner Steuerung. Es plant KEINE Show. Der Prüfstein
// aus ADR-006 trennt beides: *Wird das am Abbautag wieder eingepackt?* Ja →
// Show-Plan. Nein → hierher.
//
// VIER SICHTEN FÜR DIE SECHS FRAGEN DES VERTRAGS:
//   Anschlusspunkte  was ein Punkt hergibt, wo er ist, ob er frei ist
//   Verteilung       welche Kreise zusammenhängen, und woran
//   Steuerung        welche Klinken der Show offenstehen
//   Mängel           der eine Rückweg — was von aussen gemeldet wurde
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Anschlusspunkte } from './Anschlusspunkte'
import { Verteilung } from './Verteilung'
import { Steuerung } from './Steuerung'
import { Maengel } from './Maengel'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'

type Reiter = 'punkte' | 'verteilung' | 'steuerung' | 'maengel'

const REITER: { id: Reiter; titel: string; frage: string }[] = [
  { id: 'punkte', titel: 'Anschlusspunkte', frage: 'Was gibt dieser Punkt her, wo ist er, und ist er frei?' },
  { id: 'verteilung', titel: 'Verteilung', frage: 'Welche Kreise hängen zusammen — und woran?' },
  { id: 'steuerung', titel: 'Steuerung', frage: 'Welche Klinken der Haussteuerung stehen der Show offen?' },
  { id: 'maengel', titel: 'Mängel', frage: 'Was hat jemand von aussen über dieses Gebäude gemeldet?' },
]

export function App() {
  const [reiter, setReiter] = useState<Reiter>('punkte')
  const name = useGebaeudeStore((s) => s.gebaeude.name)
  const schreibfehler = useGebaeudeStore((s) => s.schreibfehler)
  const aktiv = REITER.find((r) => r.id === reiter)!

  return (
    <div className="app">
      <header className="kopf">
        <h1>{name}</h1>
        <nav>
          {REITER.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReiter(r.id)}
              aria-pressed={r.id === reiter}
              className={r.id === reiter ? 'reiter aktiv' : 'reiter'}
            >
              {r.titel}
            </button>
          ))}
        </nav>
      </header>

      {/* Ein gescheiterter Schreibvorgang steht OBEN und nicht im Protokoll:
          wer ihn nicht sieht, arbeitet weiter und verliert alles beim
          nächsten Start. */}
      {schreibfehler && (
        <p className="fehler">
          Der letzte Stand konnte nicht gespeichert werden: {schreibfehler}. Was seither
          eingetragen wurde, steht nur im Fenster.
        </p>
      )}

      <p className="frage">{aktiv.frage}</p>
      <main>
        {reiter === 'punkte' && <Anschlusspunkte />}
        {reiter === 'verteilung' && <Verteilung />}
        {reiter === 'steuerung' && <Steuerung />}
        {reiter === 'maengel' && <Maengel />}
      </main>
    </div>
  )
}
