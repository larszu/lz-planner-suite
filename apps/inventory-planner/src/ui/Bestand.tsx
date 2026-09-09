// ───────────────────────────────────────────────────────────────────────────
// Bestand — was ist da, wieviel, und wo liegt es?
//
// Die erste der drei Fragen aus dem Lager-Vertrag (ADR-006). Sie ist auch die
// einzige, in der hier GESCHRIEBEN wird: anlegen, Menge ändern, umlagern,
// löschen. Alles andere in dieser App liest.
//
// ZWEI DINGE, DIE DIESE ANSICHT NICHT TUT, und beide mit Grund:
//
//   Sie RECHNET KEINE DECKUNG. „Reicht der Bestand für den Plan?" ist eine
//   Frage des Plans an das Lager; die Antwort entsteht dort, wo der Bedarf
//   herkommt. Sie hier zu rechnen hiesse, den Plan nachzubauen, um ihn
//   beantworten zu können — genau die zweite Ableitung, gegen die ADR-006
//   Punkt 4 geschrieben ist.
//
//   Sie ERFINDET KEINE MENGE. Ein Artikel ohne Angabe hat keine Menge, und die
//   Tabelle schreibt dann nichts statt einer Null. Eine Null ist die Aussage
//   „nichts da"; das ist etwas anderes als „nicht gezählt".
// ───────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { nodePathLabel } from '../domain/lib/storageTree'
import { OWNERSHIP_LABEL } from '../domain/lib/ownership'
import type { InventoryOwnership } from '../domain/types/inventory'

const EIGENTUM: InventoryOwnership[] = ['owned', 'rented', 'subhire']

export function Bestand() {
  const items = useInventoryStore((s) => s.items)
  const nodes = useInventoryStore((s) => s.nodes)
  const addItem = useInventoryStore((s) => s.addItem)
  const updateItem = useInventoryStore((s) => s.updateItem)
  const removeItem = useInventoryStore((s) => s.removeItem)

  const [suche, setSuche] = useState('')
  const [modell, setModell] = useState('')
  const [menge, setMenge] = useState('1')

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) =>
      [i.model, i.manufacturer, i.category, i.supplier, i.stockLocation]
        .filter((x): x is string => typeof x === 'string')
        .some((x) => x.toLowerCase().includes(q)),
    )
  }, [items, suche])

  const anlegen = () => {
    const name = modell.trim()
    if (!name) return
    const zahl = Number(menge)
    addItem({ model: name, quantity: Number.isFinite(zahl) && zahl > 0 ? zahl : 1 })
    setModell('')
    setMenge('1')
  }

  return (
    <section>
      <div className="leiste">
        <input
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Suchen — Modell, Hersteller, Lieferant, Ort"
          aria-label="Bestand durchsuchen"
        />
        <span className="zaehler">
          {gefiltert.length} von {items.length}
        </span>
      </div>

      <div className="leiste">
        <input
          value={modell}
          onChange={(e) => setModell(e.target.value)}
          placeholder="Neues Modell"
          aria-label="Modellbezeichnung"
        />
        <input
          value={menge}
          onChange={(e) => setMenge(e.target.value)}
          type="number"
          min="1"
          aria-label="Menge"
          className="schmal"
        />
        <button type="button" onClick={anlegen}>
          Anlegen
        </button>
      </div>

      {items.length === 0 ? (
        <p className="leer">
          Noch nichts im Bestand. Anlegen — oder eine vorhandene Lagerdatei
          einlesen; das Format ist zwischen den Werkzeugen dasselbe.
        </p>
      ) : (
        <div className="tabelle-rahmen">
          <table>
            <thead>
              <tr>
                <th>Modell</th>
                <th>Kategorie</th>
                <th className="rechts">Menge</th>
                <th>Eigentum</th>
                <th>Lagerort</th>
                <th>Lieferant</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {gefiltert.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.model}
                    {i.manufacturer ? <span className="leise"> · {i.manufacturer}</span> : null}
                  </td>
                  <td>{i.category ?? ''}</td>
                  <td className="rechts">
                    <input
                      type="number"
                      min="0"
                      value={i.quantity}
                      onChange={(e) => {
                        const n = Number(e.target.value)
                        if (Number.isFinite(n) && n >= 0) updateItem(i.id, { quantity: n })
                      }}
                      aria-label={`Menge von ${i.model}`}
                      className="schmal"
                    />
                  </td>
                  <td>
                    <select
                      value={i.ownership ?? ''}
                      onChange={(e) =>
                        updateItem(i.id, {
                          ownership: (e.target.value || undefined) as InventoryOwnership | undefined,
                        })
                      }
                      aria-label={`Eigentum von ${i.model}`}
                    >
                      {/* Leer heisst „nicht angegeben" und nicht „uns gehörend".
                          Der Unterschied entscheidet, ob das Stück im Sub-Hire
                          auftaucht. */}
                      <option value="">nicht angegeben</option>
                      {EIGENTUM.map((o) => (
                        <option key={o} value={o}>
                          {OWNERSHIP_LABEL[o]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{nodePathLabel(nodes, i.locationId) || (i.stockLocation ?? '')}</td>
                  <td>{i.supplier ?? ''}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(i.id)} className="still">
                      Entfernen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
