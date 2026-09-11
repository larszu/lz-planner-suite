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
import { useT, locale } from '../i18n'
import { useCheckoutStore } from '../domain/store/checkoutStore'
import { openCheckouts, overdueCheckouts } from '../domain/lib/containerCheckout'

/** Heute als ISO-Datum. Einmal je Zeichenlauf gelesen, nie pro Zeile. */
const heute = () => new Date().toISOString().slice(0, 10)

const datum = (iso: string | undefined, ort: string): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(ort)
}

export function Ausgabescheine() {
  const { t, format, sprache } = useT()
  const ort = locale(sprache)
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
        {t(
          'checkouts.empty',
          'No checkout note yet. A note comes into being when a case leaves the store — and it records what was really inside, not what should have been.',
        )}
      </p>
    )
  }

  return (
    <section>
      <p className="zaehler">
        {format(t('checkouts.count', '{open} open, {late} of them overdue · {all} in total'), {
          open: offen.length,
          late: ueberfaellig.size,
          all: records.length,
        })}
      </p>
      <div className="tabelle-rahmen">
        <table>
          <thead>
            <tr>
              <th>{t('checkouts.col.case', 'Case')}</th>
              <th>{t('checkouts.col.to', 'To')}</th>
              <th>{t('checkouts.col.project', 'Project')}</th>
              <th>{t('checkouts.col.out', 'Checked out')}</th>
              <th>{t('checkouts.col.due', 'Back by')}</th>
              <th className="rechts">{t('checkouts.col.lines', 'Lines')}</th>
            </tr>
          </thead>
          <tbody>
            {offen.map((r) => (
              <tr key={r.id} className={ueberfaellig.has(r.id) ? 'warnung' : undefined}>
                <td>{r.nodeLabel}</td>
                <td>{r.out.to}</td>
                <td>{r.out.projectName ?? ''}</td>
                <td>{datum(r.out.at, ort)}</td>
                <td>
                  {r.out.dueBack ? (
                    datum(r.out.dueBack, ort)
                  ) : (
                    <span className="leise">{t('checkouts.noDue', 'no date agreed')}</span>
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
