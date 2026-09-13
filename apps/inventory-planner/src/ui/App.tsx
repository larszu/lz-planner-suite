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
import { useInventoryStore } from '../domain/store/inventoryStore'
import { useCheckoutStore } from '../domain/store/checkoutStore'
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

/**
 * Der Zaehler der Statusleiste — was in DIESER Ansicht gezaehlt wird.
 *
 * ADR-007 Abschnitt 6 sagt „Meldungen links · Zaehler rechts" und dazu, was
 * dort NICHT hingehoert: „Werte, die eine Produktentscheidung waeren — eine
 * Komplexitaet, eine Ampel, eine Bewertung". Alles hier ist eine Anzahl, die
 * die Ansicht ohnehin berechnet; keine der sieben Zeilen wertet.
 *
 * Je Reiter eine eigene Zahl und nicht eine feste fuer die ganze App: wer im
 * Sub-Hire steht, will wissen, wieviel fremdes Material im Haus ist, nicht
 * wieviele Artikel es insgesamt gibt.
 */
const zaehler = (
  reiter: Reiter,
  t: UebersetzFn,
  format: (s: string, v: Record<string, string | number>) => string,
  zahlen: { artikel: number; plaetze: number; einheiten: number; scheine: number; draussen: number; fremd: number },
): string => {
  switch (reiter) {
    case 'ausgabe':
      return format(t('status.checkouts', '{n} checkout notes · {out} still out'), {
        n: zahlen.scheine,
        out: zahlen.draussen,
      })
    case 'subhire':
      return format(t('status.subhire', '{n} items not ours'), { n: zahlen.fremd })
    case 'werte':
      return format(t('status.units', '{n} serialised units'), { n: zahlen.einheiten })
    default:
      return format(t('status.stock', '{n} models · {p} storage places'), {
        n: zahlen.artikel,
        p: zahlen.plaetze,
      })
  }
}

export function App() {
  const { t, format } = useT()
  const [reiter, setReiter] = useState<Reiter>('bestand')
  const REITER = reiterListe(t)
  const aktiv = REITER.find((r) => r.id === reiter)!

  // Aus dem Store gelesen und nicht durchgereicht: die Statusleiste zeigt den
  // Stand, nicht den Stand von vorhin. Eine Ansicht, die eine Zahl als Prop
  // bekaeme, muesste sie weiterreichen — und die naechste, die es vergisst,
  // zeigt schweigend eine alte.
  const items = useInventoryStore((s) => s.items)
  const nodes = useInventoryStore((s) => s.nodes)
  const units = useInventoryStore((s) => s.units)
  const records = useCheckoutStore((s) => s.records)
  const stand = zaehler(reiter, t, format, {
    artikel: items.length,
    plaetze: nodes.length,
    einheiten: units.length,
    scheine: records.length,
    draussen: records.filter((r) => !r.in).length,
    fremd: items.filter((i) => i.ownership === 'subhire').length,
  })

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
      {/* Der Inhalt bekommt seine Satzbreite, der Rahmen nicht (suite#231).
          Vorher trug `.app` beides — und damit endete auch die Kopfzeile bei
          1100 px, mitten auf dem Bildschirm. */}
      <main className="inhalt">
        <p className="frage">{aktiv.frage}</p>
        {reiter === 'bestand' && <Bestand />}
        {reiter === 'eingang' && <Wareneingang />}
        {reiter === 'inventur' && <Inventur />}
        {reiter === 'ausgabe' && <Ausgabescheine />}
        {reiter === 'bericht' && <Bericht />}
        {reiter === 'werte' && <WerteUndSchaeden />}
        {reiter === 'subhire' && <SubHire />}
      </main>
      {/* Die Statusleiste des Rahmens (ADR-007 Abschnitt 6). Links steht,
          welche Frage gerade offen ist, rechts ihre Zahl. */}
      <footer className="statusleiste">
        <span>{aktiv.titel}</span>
        <span className="rechts">{stand}</span>
      </footer>
    </div>
  )
}
