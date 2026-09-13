// ───────────────────────────────────────────────────────────────────────────
// Der Rahmen um eine Tabelle — und die Beschriftung der Zellen, wenn aus der
// Tabelle Karten werden (suite#231).
//
// DAS PROBLEM. Unter 700 px passt keine dieser Tabellen mehr nebeneinander;
// die Anschlusspunkte fuehren zwoelf Spalten. Bisher scrollte der Rahmen
// waagerecht — richtig als Notbremse (B-44 Teil 3: lieber ein Bereich, der
// scrollt, als eine Seite, die sich schieben laesst), aber auf einem Telefon
// heisst es, dass man Name und Kreis nie zugleich sieht.
//
// Das Stilblatt macht unter 700 px aus jeder Zeile eine Karte. Dafuer braucht
// jede Zelle ihren SPALTENNAMEN vor sich — sonst steht dort eine Spalte
// Werte ohne Fragen, und das ist schlechter als die scrollende Tabelle.
//
// WARUM DAS HIER UND NICHT AN JEDER ZELLE STEHT. Der Name steht schon im
// Kopf der Tabelle. Ihn an jeder der zwoelf Zellen ein zweites Mal
// hinzuschreiben hiesse, ihn zwoelfmal zu fuehren — und beim naechsten
// umbenannten Kopf stimmen elf davon noch, eine nicht mehr. Diese Komponente
// liest den Kopf und schreibt ihn nach dem Rendern als `data-spalte` an die
// Zellen derselben Position.
//
// SIE UEBERSCHREIBT NICHTS, was die Ansicht selbst gesetzt hat: wo eine Zelle
// schon ein `data-spalte` traegt, bleibt es stehen. Eine Ansicht, die es
// besser weiss als ihr Tabellenkopf (zusammengefasste Spalten etwa), behaelt
// recht.
//
// NICHT GEMESSEN: Tabellen mit `colSpan` oder zwei Kopfzeilen. Die Zuordnung
// ist Position gegen Position; wo eine Zelle zwei Spalten ueberdeckt,
// verschiebt sich alles dahinter. Keine der sieben Ansichten hat so eine
// Tabelle (nachgesehen 2026-09-13) — wer die erste baut, sieht es hier.
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, type ReactNode } from 'react'

export function TabelleRahmen({ children }: { children: ReactNode }) {
  const rahmen = useRef<HTMLDivElement>(null)

  // Ohne Abhaengigkeitsliste: der Effekt laeuft nach JEDEM Rendern. Das ist
  // hier das Richtige und nicht die faule Loesung — die Zellen aendern sich
  // mit jedem Datensatz, und eine Liste, die eine Aenderung nicht kennt,
  // liesse die Karte mit dem Namen der vorigen Spalte stehen.
  useEffect(() => {
    const el = rahmen.current
    if (!el) return
    const kopf = [...el.querySelectorAll('thead th')].map((th) => th.textContent?.trim() ?? '')
    if (!kopf.length) return
    for (const zeile of el.querySelectorAll('tbody tr')) {
      ;[...zeile.children].forEach((zelle, i) => {
        if (zelle.hasAttribute('data-spalte')) return
        const name = kopf[i]
        if (name) zelle.setAttribute('data-spalte', name)
      })
    }
  })

  return (
    <div className="tabelle-rahmen" ref={rahmen}>
      {children}
    </div>
  )
}
