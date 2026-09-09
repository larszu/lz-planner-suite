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
//
// DIE SPALTE „ZIEL" IST KEIN RÜCKFALL IN DIE ERSTE DIESER ZWEI REGELN (B-65).
//
// Sie sieht aus wie Bedarf und ist keiner. Der Bedarf eines PLANS ist eine
// Frage des Plans — was diese Show braucht, weiss nur sie, und deshalb reicht
// der Planer `BedarfsZeile[]` herüber, statt dass das Lager rechnet (ADR-006).
// Die Mindestmenge ist die andere Sorte Zahl: eine Entscheidung des HAUSES
// über sein eigenes Regal, unabhängig von jeder Show. „Von den kurzen XLR
// wollen wir immer zwanzig dahaben" ist kein Plan, sondern eine Hauspolitik.
//
// Sie steht deshalb HIER — dort, wo geschrieben wird und wo ohnehin schon die
// Menge daneben liegt — und wird ANDERSWO gelesen: die Deckung rechnet
// `domain/lib/mindestmenge.ts`, gezeigt wird sie im Bericht. Diese Ansicht
// vergleicht nichts; sie nimmt die Zahl entgegen.
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
                {/*
                  „Ziel" und nicht „Mindestmenge": die Spalte ist schmal, und
                  der Kopf muss neben der Zahl lesbar bleiben. Was gemeint
                  ist, sagt das `title` der Zelle und der Satz unter der
                  Tabelle — eine abgeschnittene Ueberschrift sagt gar nichts.
                */}
                <th className="rechts">Ziel</th>
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
                  <td className="rechts">
                    {/*
                      LEER IST EIN WERT, und zwar ein anderer als 0. Leer
                      heisst „niemand hat fuer diesen Artikel entschieden,
                      wieviel dasein muss" — er zaehlt dann in keine der drei
                      Lagen des Berichts, sondern unter „unbewertet". Eine 0
                      waere die Aussage „darf leer sein", und die trifft
                      jemand ausdruecklich.

                      Deshalb schreibt das Feld bei leerer Eingabe
                      `undefined` zurueck und nicht 0. `updateItem` setzt
                      seinen Patch per Spread — `undefined` loescht dort
                      wirklich, anders als bei `mergeDefined`.
                    */}
                    <input
                      type="number"
                      min="0"
                      value={i.mindestmenge ?? ''}
                      placeholder="—"
                      onChange={(e) => {
                        const roh = e.target.value.trim()
                        if (roh === '') {
                          updateItem(i.id, { mindestmenge: undefined })
                          return
                        }
                        const n = Number(roh)
                        if (Number.isFinite(n) && n >= 0) {
                          updateItem(i.id, { mindestmenge: Math.round(n) })
                        }
                      }}
                      aria-label={`Mindestmenge von ${i.model}`}
                      title="Ab wann nachbestellt oder sub-hired wird. Leer heisst: nicht festgelegt."
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

      {items.length > 0 && (
        <p className="leer">
          <strong>Ziel</strong> ist die Mindestmenge, ab der nachbestellt oder
          sub-hired wird — eine Entscheidung des Hauses, keine Vorgabe aus einer
          Show. Leer heisst nicht null, sondern nicht festgelegt; solche Artikel
          führt der Bericht unter „unbewertet" statt unter „reicht". Wie es
          aktuell steht, sagt dort der Block „Unter Ziel".
        </p>
      )}
    </section>
  )
}
