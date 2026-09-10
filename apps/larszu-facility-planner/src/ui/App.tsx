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
// SIEBEN SICHTEN FÜR DIE SECHS FRAGEN DES VERTRAGS:
//   Anschlusspunkte  was ein Punkt hergibt, wo er ist, ob er frei ist
//   Grundriss        wo im Raum ein Punkt sitzt, in Metern (Issue #1)
//   Verteilung       welche Kreise zusammenhängen, und woran
//   Trassen          welcher Weg noch etwas aufnimmt (Issue #1)
//   Schaltstellen    wer eine Dose abschaltet, und wo er sitzt (Issue #1)
//   Steuerung        welche Klinken der Show offenstehen
//   Mängel           der eine Rückweg — was von aussen gemeldet wurde
//
// SIEBEN SICHTEN, WEITERHIN SECHS VERTRAGSFRAGEN. Grundriss, Trassen und
// Schaltstellen sind KEINE neuen Fragen des Plans — er stellt sie nicht. Sie
// sind Daten, die dieses Werkzeug über sein eigenes Gebäude führt, und ihre
// Auskünfte
// stehen deshalb in `domain/gebaeudeAuskunft.ts` und nicht im Vertrag. Eine
// siebte Frage in `VERTRAG_FRAGEN` änderte stillschweigend einen Vertrag,
// den zwei Repos lesen.
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Anschlusspunkte } from './Anschlusspunkte'
import { Verteilung } from './Verteilung'
import { Steuerung } from './Steuerung'
import { Trassen } from './Trassen'
import { Grundriss } from './Grundriss'
import { Schaltstellen } from './Schaltstellen'
import { Maengel } from './Maengel'
import { useGebaeudeStore } from '../domain/store/gebaeudeStore'

type Reiter =
  | 'punkte'
  | 'grundriss'
  | 'verteilung'
  | 'trassen'
  | 'schaltstellen'
  | 'steuerung'
  | 'maengel'

const REITER: { id: Reiter; titel: string; frage: string }[] = [
  { id: 'punkte', titel: 'Anschlusspunkte', frage: 'Was gibt dieser Punkt her, wo ist er, und ist er frei?' },
  { id: 'grundriss', titel: 'Grundriss', frage: 'Wo im Raum sitzt dieser Punkt — nicht nur in welchem?' },
  { id: 'verteilung', titel: 'Verteilung', frage: 'Welche Kreise hängen zusammen — und woran?' },
  { id: 'trassen', titel: 'Trassen', frage: 'Welcher Weg zwischen zwei Räumen nimmt noch etwas auf?' },
  { id: 'schaltstellen', titel: 'Schaltstellen', frage: 'Wer schaltet diese Dose ab — und wo sitzt er?' },
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
        {reiter === 'grundriss' && <Grundriss />}
        {reiter === 'verteilung' && <Verteilung />}
        {reiter === 'trassen' && <Trassen />}
        {reiter === 'schaltstellen' && <Schaltstellen />}
        {reiter === 'steuerung' && <Steuerung />}
        {reiter === 'maengel' && <Maengel />}
      </main>
    </div>
  )
}
