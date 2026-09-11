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
import { useT } from '../i18n'
import { Kopfzeile } from './Kopfzeile'
import { Bestand } from './Bestand'
import { Ausgabescheine } from './Ausgabescheine'
import { SubHire } from './SubHire'
import { Inventur } from './Inventur'
import { Bericht } from './Bericht'
import { WerteUndSchaeden } from './WerteUndSchaeden'
import { Wareneingang } from './Wareneingang'

type Reiter = 'bestand' | 'eingang' | 'inventur' | 'ausgabe' | 'subhire' | 'bericht' | 'werte'

type UebersetzFn = (key: string, en: string) => string

/**
 * Die Reiter werden IN der Komponente gebaut und nicht als Modul-Konstante:
 * eine Liste, die beim Laden des Moduls einmal übersetzt wird, bleibt in der
 * Sprache stehen, die beim Laden galt — der Umschalter änderte dann alles
 * ausser ihr.
 */
const reiterListe = (t: UebersetzFn): { id: Reiter; titel: string; frage: string }[] => [
  { id: 'bestand', titel: t('tab.stock', 'Stock'), frage: t('tab.stock.q', 'What is here, how much of it, and where does it sit?') },
  { id: 'eingang', titel: t('tab.receiving', 'Receiving'), frage: t('tab.receiving.q', 'What arrived — and what does that do to the stock?') },
  { id: 'inventur', titel: t('tab.audit', 'Stocktake'), frage: t('tab.audit.q', 'Is what should be here actually here?') },
  { id: 'ausgabe', titel: t('tab.checkouts', 'Checkout notes'), frage: t('tab.checkouts.q', 'What is out, with whom, and since when?') },
  { id: 'bericht', titel: t('tab.report', 'Report'), frage: t('tab.report.q', 'What is inside — and how does it get out of here?') },
  { id: 'werte', titel: t('tab.values', 'Values & damage'), frage: t('tab.values.q', 'What is it worth, what is broken, and what is committed?') },
  { id: 'subhire', titel: t('tab.subhire', 'Sub-hire'), frage: t('tab.subhire.q', 'What is not ours — and when must it go back?') },
]

export function App() {
  const { t } = useT()
  const [reiter, setReiter] = useState<Reiter>('bestand')
  const REITER = reiterListe(t)
  const aktiv = REITER.find((r) => r.id === reiter)!

  return (
    <div className="app">
      {/* Kopfzeile und Reiter sind ZWEI Zeilen, seit 2026-09-11. Vorher stand
          der App-Name mit den sieben Reitern in einer — und damit sah die
          Modul-Navigation aus wie eine Menueleiste. Die Kopfzeile fuehrt
          jetzt die Menues und rechts aussen die Einstellungen (wie im Cable
          Planner), die Reiter stehen darunter und ordnen die Module. */}
      <Kopfzeile />
      <nav className="reiter-leiste">
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
      <p className="frage">{aktiv.frage}</p>
      <main>
        {reiter === 'bestand' && <Bestand />}
        {reiter === 'eingang' && <Wareneingang />}
        {reiter === 'inventur' && <Inventur />}
        {reiter === 'ausgabe' && <Ausgabescheine />}
        {reiter === 'bericht' && <Bericht />}
        {reiter === 'werte' && <WerteUndSchaeden />}
        {reiter === 'subhire' && <SubHire />}
      </main>
    </div>
  )
}
