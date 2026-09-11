// ───────────────────────────────────────────────────────────────────────────
// Sub-Hire — was gehört uns nicht, und wann muss es zurück?
//
// Die dritte Frage des Lager-Vertrags, und die einzige, die Geld kostet, wenn
// niemand sie stellt: fremdes Material, das drei Wochen zu lange steht, wird
// drei Wochen zu lange berechnet.
//
// ZWEI FÄLLE, NICHT EINER. `overdueSubhire` führt das überfällige UND das
// undatierte Stück. Nur das überfällige zu zeigen wäre die bequemere Liste und
// die falsche: fremdes Material ohne Rückgabetermin ist genau das, was
// liegenbleibt — es fällt nie in eine Frist, weil es keine hat.
//
// Die Reihenfolge kommt aus der Domäne und nicht aus dieser Ansicht:
// überfällig zuerst, darin das älteste Datum zuerst, dann die undatierten.
// Wer von oben abarbeitet, spart das meiste Geld.
// ───────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react'
import { useT } from '../i18n'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { ownershipLabel, isForeign, overdueSubhire, ownershipNote } from '../domain/lib/ownership'

export function SubHire() {
  const { t, format } = useT()
  const items = useInventoryStore((s) => s.items)
  const tag = new Date().toISOString().slice(0, 10)

  const fremd = useMemo(() => items.filter(isForeign), [items])
  const faellig = useMemo(() => overdueSubhire(items, tag), [items, tag])

  if (fremd.length === 0) {
    return (
      <p className="leer">
        {t(
          'subhire.empty',
          'No foreign material in stock. What is missing here is not an assurance: a line without an ownership entry counts as our own — so it does not appear on this list, even when it is rented.',
        )}
      </p>
    )
  }

  return (
    <section>
      <p className="zaehler">
        {format(t('subhire.count', '{foreign} foreign lines · {due} need a decision'), {
          foreign: fremd.length,
          due: faellig.length,
        })}
      </p>

      {faellig.length > 0 && (
        <div className="tabelle-rahmen">
          <table>
            <caption>{t('subhire.dueTable', 'Back — overdue or without a date')}</caption>
            <thead>
              <tr>
                <th>{t('subhire.col.model', 'Model')}</th>
                <th className="rechts">{t('subhire.col.qty', 'Qty')}</th>
                <th>{t('subhire.col.contract', 'Contract')}</th>
                <th>{t('subhire.col.supplier', 'Supplier')}</th>
                <th>{t('subhire.col.date', 'Date')}</th>
              </tr>
            </thead>
            <tbody>
              {faellig.map((z) => (
                <tr key={z.itemId} className={z.status === 'overdue' ? 'warnung' : undefined}>
                  <td>{z.model}</td>
                  <td className="rechts">{z.quantity}</td>
                  <td>{ownershipLabel(z.ownership, t)}</td>
                  <td>{z.supplier || <span className="leise">{t('subhire.unknown', 'unknown')}</span>}</td>
                  <td>
                    {z.status === 'overdue' ? (
                      `${t('subhire.since', 'since')} ${z.returnDue}`
                    ) : (
                      <span className="leise">{t('subhire.noDate', 'no return date')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="tabelle-rahmen">
        <table>
          <caption>{t('subhire.allTable', 'All foreign material')}</caption>
          <thead>
            <tr>
              <th>{t('subhire.col.model', 'Model')}</th>
              <th className="rechts">{t('subhire.col.qty', 'Qty')}</th>
              <th>{t('subhire.col.note', 'Note')}</th>
            </tr>
          </thead>
          <tbody>
            {fremd.map((i) => (
              <tr key={i.id}>
                <td>{i.model}</td>
                <td className="rechts">{i.quantity}</td>
                {/* Derselbe Vermerk, der auf jedem Blatt neben der Position
                    steht — hier aus derselben Funktion, damit die Ansicht und
                    das gedruckte Blatt nicht auseinanderlaufen. */}
                <td>{ownershipNote(i, tag, t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
