// ───────────────────────────────────────────────────────────────────────────
// Die Oberfläche des Lagers (E-27, ADR-006 Schritt 3).
//
// Der Eigentümer hat am 2026-09-09 nicht „ein Paket" gewählt, sondern ein
// eigenes Werkzeug MIT eigener Bedienung: „Bestand, Ausgabeschein, Sub-Hire
// bekommen ihre eigene Bedienung für den Lageristen."
//
// Das ist der Unterschied, um den es beim ganzen Schnitt geht. Im
// Cable-Planner war das Lager ein Dialog IM Plan — bedienbar nur von jemandem,
// der einen Plan offen hat. Der Lagerist hat keinen Plan offen. Er hat ein
// Regal.
//
// DREI SICHTEN, WEIL ES DREI FRAGEN SIND (der Vertrag aus ADR-006):
//   Bestand        Was ist da, wieviel, und wo liegt es?
//   Ausgabeschein  Was ist draußen, bei wem, und seit wann?
//   Sub-Hire       Was gehört uns nicht — und wann muss es zurück?
//
// DIE VIERTE KAM 2026-09-09 DAZU (B-65), und sie ist keine vierte Frage,
// sondern die Gegenprobe zur ersten: „liegt das hier, was hier liegen soll?"
// `inventoryAudit.ts` und `inventoryScan.ts` beantworten sie seit langem,
// getestet — nur führte kein Weg der Oberfläche dorthin. Von 18 Modulen
// unter `domain/lib/` waren zehn von hier aus unerreichbar; für den
// Lageristen ist so ein Modul kein Code.
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Bestand } from './Bestand'
import { Ausgabescheine } from './Ausgabescheine'
import { SubHire } from './SubHire'
import { Inventur } from './Inventur'
import { Bericht } from './Bericht'
import { WerteUndSchaeden } from './WerteUndSchaeden'

type Reiter = 'bestand' | 'inventur' | 'ausgabe' | 'subhire' | 'bericht' | 'werte'

const REITER: { id: Reiter; titel: string; frage: string }[] = [
  { id: 'bestand', titel: 'Bestand', frage: 'Was ist da, wieviel, und wo liegt es?' },
  { id: 'inventur', titel: 'Inventur', frage: 'Liegt hier, was hier liegen soll?' },
  { id: 'ausgabe', titel: 'Ausgabescheine', frage: 'Was ist draußen, bei wem, und seit wann?' },
  { id: 'bericht', titel: 'Bericht', frage: 'Was steckt drin — und wie kommt es hier raus?' },
  { id: 'werte', titel: 'Werte & Schäden', frage: 'Was ist es wert, was ist kaputt, und was ist gebunden?' },
  { id: 'subhire', titel: 'Sub-Hire', frage: 'Was gehört uns nicht — und wann muss es zurück?' },
]

export function App() {
  const [reiter, setReiter] = useState<Reiter>('bestand')
  const aktiv = REITER.find((r) => r.id === reiter)!

  return (
    <div className="app">
      <header className="kopf">
        <h1>Lager</h1>
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
      <p className="frage">{aktiv.frage}</p>
      <main>
        {reiter === 'bestand' && <Bestand />}
        {reiter === 'inventur' && <Inventur />}
        {reiter === 'ausgabe' && <Ausgabescheine />}
        {reiter === 'bericht' && <Bericht />}
        {reiter === 'werte' && <WerteUndSchaeden />}
        {reiter === 'subhire' && <SubHire />}
      </main>
    </div>
  )
}
