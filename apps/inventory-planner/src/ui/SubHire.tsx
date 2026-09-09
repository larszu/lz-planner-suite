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
import { useInventoryStore } from '../domain/store/inventoryStore'
import { OWNERSHIP_LABEL, isForeign, overdueSubhire, ownershipNote } from '../domain/lib/ownership'

export function SubHire() {
  const items = useInventoryStore((s) => s.items)
  const tag = new Date().toISOString().slice(0, 10)

  const fremd = useMemo(() => items.filter(isForeign), [items])
  const faellig = useMemo(() => overdueSubhire(items, tag), [items, tag])

  if (fremd.length === 0) {
    return (
      <p className="leer">
        Kein fremdes Material im Bestand. Was hier fehlt, ist keine Zusicherung:
        eine Position ohne Angabe zum Eigentum gilt als eigene — sie steht
        deshalb nicht auf dieser Liste, auch wenn sie gemietet ist.
      </p>
    )
  }

  return (
    <section>
      <p className="zaehler">
        {fremd.length} fremde Positionen · {faellig.length} brauchen eine Entscheidung
      </p>

      {faellig.length > 0 && (
        <div className="tabelle-rahmen">
          <table>
            <caption>Zurück — überfällig oder ohne Termin</caption>
            <thead>
              <tr>
                <th>Modell</th>
                <th className="rechts">Menge</th>
                <th>Vertrag</th>
                <th>Lieferant</th>
                <th>Termin</th>
              </tr>
            </thead>
            <tbody>
              {faellig.map((z) => (
                <tr key={z.itemId} className={z.status === 'overdue' ? 'warnung' : undefined}>
                  <td>{z.model}</td>
                  <td className="rechts">{z.quantity}</td>
                  <td>{OWNERSHIP_LABEL[z.ownership]}</td>
                  <td>{z.supplier || <span className="leise">unbekannt</span>}</td>
                  <td>
                    {z.status === 'overdue' ? (
                      `seit ${z.returnDue}`
                    ) : (
                      <span className="leise">kein Rückgabedatum</span>
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
          <caption>Alles fremde Material</caption>
          <thead>
            <tr>
              <th>Modell</th>
              <th className="rechts">Menge</th>
              <th>Vermerk</th>
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
                <td>{ownershipNote(i, tag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
