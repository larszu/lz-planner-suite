// ───────────────────────────────────────────────────────────────────────────
// Ausgabescheine — was ist draußen, bei wem, und seit wann?
//
// Die zweite Frage des Lager-Vertrags. Sie liest nur: Ausgeben und Zurücknehmen
// hängen am Container und an einem Scan, und beides kommt im nächsten Schritt.
// Was hier schon zählt, ist die Auskunft, die es im Cable-Planner nur INNERHALB
// eines Dialogs gab: eine Liste offener Vorgänge, überfällige zuerst.
//
// „ÜBERFÄLLIG" IST EINE ANGABE, KEINE VERMUTUNG. Ein Vorgang ohne
// Rückgabetermin ist NICHT überfällig — er hat keinen Termin. Ihn mitzuzählen
// hiesse, dem Lageristen eine Frist zu melden, die niemand vereinbart hat;
// `overdueCheckouts` hält das, und diese Ansicht sagt es in der Spalte
// ausdrücklich.
// ───────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react'
import { useCheckoutStore } from '../domain/store/checkoutStore'
import { openCheckouts, overdueCheckouts } from '../domain/lib/containerCheckout'

/** Heute als ISO-Datum. Einmal je Zeichenlauf gelesen, nie pro Zeile. */
const heute = () => new Date().toISOString().slice(0, 10)

const datum = (iso?: string): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('de-DE')
}

export function Ausgabescheine() {
  const records = useCheckoutStore((s) => s.records)
  const tag = heute()

  const { offen, ueberfaellig } = useMemo(() => {
    const o = openCheckouts(records)
    const u = new Set(overdueCheckouts(records, tag).map((r) => r.id))
    // Überfällige nach oben — der Rest in der Reihenfolge, in der sie
    // ausgegeben wurden.
    return {
      offen: [...o].sort((a, b) => Number(u.has(b.id)) - Number(u.has(a.id))),
      ueberfaellig: u,
    }
  }, [records, tag])

  if (records.length === 0) {
    return (
      <p className="leer">
        Noch kein Ausgabeschein. Ein Schein entsteht, wenn ein Container das
        Lager verlässt — und er hält fest, was wirklich drin war, nicht was
        drin sein sollte.
      </p>
    )
  }

  return (
    <section>
      <p className="zaehler">
        {offen.length} offen, davon {ueberfaellig.size} überfällig · {records.length} insgesamt
      </p>
      <div className="tabelle-rahmen">
        <table>
          <thead>
            <tr>
              <th>Container</th>
              <th>An</th>
              <th>Projekt</th>
              <th>Ausgegeben</th>
              <th>Zurück bis</th>
              <th className="rechts">Positionen</th>
            </tr>
          </thead>
          <tbody>
            {offen.map((r) => (
              <tr key={r.id} className={ueberfaellig.has(r.id) ? 'warnung' : undefined}>
                <td>{r.nodeLabel}</td>
                <td>{r.out.to}</td>
                <td>{r.out.projectName ?? ''}</td>
                <td>{datum(r.out.at)}</td>
                <td>
                  {r.out.dueBack ? (
                    datum(r.out.dueBack)
                  ) : (
                    <span className="leise">kein Termin vereinbart</span>
                  )}
                </td>
                <td className="rechts">{r.contents.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
