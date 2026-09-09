// ───────────────────────────────────────────────────────────────────────────
// Werte & Schäden — „was ist es wert, was ist kaputt, und was ist gebunden?"
//
// ─── WARUM ES DIESE DATEI GIBT (B-65, dritte und letzte Zeile) ─────────────
//
// Die letzten drei Rechenwerke ohne Weg zur Oberfläche. Sie gehören
// zusammen, und deshalb ist es EINE Ansicht und nicht drei:
//
//   insuranceSchedule    Werte je Einheit, Summen JE WÄHRUNG, und die
//                        Einheiten ohne Wert. Dazu das Carnet-Datenblatt.
//   damageRegister       was bei Rückgaben als beschädigt aufgenommen wurde
//                        — mit Show, Person und Container, nicht nur mit
//                        einem Häkchen.
//   inventoryCommitment  was auf offenen Ausgaben liegt und deshalb im
//                        Regal fehlt, obwohl der Bestand es zählt.
//
// Alle drei beantworten dieselbe Sorte Frage: nicht „wo liegt es", sondern
// „womit muss ich rechnen". Damit ist B-65s Hauptbefund abgearbeitet — von
// zehn Modulen ohne Bedienung sind es null.
//
// ─── DREI DINGE, DIE HIER BEWUSST UNBEQUEM SIND ────────────────────────────
//
//  1. SUMMEN JE WÄHRUNG, NIE EINE GESAMTSUMME. `versicherungsListe` liefert
//     ein Array von Summen, und das ist kein Versehen: EUR und CHF zu
//     addieren verlangt einen Kurs, den niemand hinterlegt hat. Eine Zahl
//     daraus zu machen hiesse, ihn zu erfinden. Stehen zwei Währungen im
//     Bestand, stehen hier zwei Summen.
//
//  2. „OHNE WERT" IST EINE EIGENE LISTE, keine Null. Eine Einheit ohne
//     hinterlegten Wert geht in KEINE Summe ein — und die Versicherung, die
//     das Blatt bekommt, muss sehen, welche das sind. Eine Summe, die so
//     tut, als sei sie vollständig, ist im Schadensfall das teuerste
//     Missverständnis dieser App.
//
//  3. DER SCHADEN NENNT SHOW, PERSON UND CONTAINER. `damageEntries` führt
//     alle drei mit; wo eine Angabe fehlte, steht „nicht benannt" statt
//     eines leeren Felds. Ein Schadensregister, das nur das Objekt kennt,
//     beantwortet die Frage nicht, wegen der man es führt.
//
// ─── WAS DIESE ANSICHT NICHT TUT ───────────────────────────────────────────
//
//   Sie RECHNET KEINEN VERSICHERUNGSWERT AUS. Sie summiert, was hinterlegt
//   ist. Zeitwert, Abschreibung und Wiederbeschaffung sind drei
//   verschiedene Zahlen, und welche gemeint ist, entscheidet der Vertrag —
//   nicht diese App.
//
//   Sie ÄNDERT KEINEN ZUSTAND. Ein Schaden wird bei der Rückgabe
//   aufgenommen; hier wird er gelesen. Zwei Orte, an denen dasselbe
//   entsteht, laufen auseinander.
// ───────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { useCheckoutStore } from '../domain/store/checkoutStore'
import {
  versicherungsListe,
  versicherungsTabelle,
  carnetDatenblatt,
  geldText,
  NICHT_ANGEGEBEN,
} from '../domain/lib/insuranceSchedule'
import { damageEntries, damageTally, damageTable } from '../domain/lib/damageRegister'
import { committedByItem, commitmentNote } from '../domain/lib/inventoryCommitment'
import { unitLabel } from '../domain/lib/unitIdentity'
import { toCsv, type CsvTable } from '../lib/csv'

/** Eine Tabelle als CSV herunterladen. Vier Knöpfe brauchen dasselbe. */
const csvLaden = (tabelle: CsvTable, name: string) => {
  const url = URL.createObjectURL(
    new Blob([toCsv(tabelle.headers, tabelle.rows)], { type: 'text/csv;charset=utf-8' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function WerteUndSchaeden() {
  const items = useInventoryStore((s) => s.items)
  const units = useInventoryStore((s) => s.units)
  const records = useCheckoutStore((s) => s.records)

  const [nach, setNach] = useState<'person' | 'container' | 'job'>('person')

  const modellVon = useMemo(() => {
    const nachId = new Map(items.map((i) => [i.id, i.model]))
    // Kein Raten: eine Einheit ohne auffindbaren Artikel bekommt den
    // ausdruecklichen Platzhalter des Moduls, nicht einen leeren String.
    return (u: { itemId: string }) => nachId.get(u.itemId) ?? NICHT_ANGEGEBEN
  }, [items])

  const artikelVon = useMemo(() => {
    const nachId = new Map(items.map((i) => [i.id, i]))
    return (u: { itemId: string }) => nachId.get(u.itemId)
  }, [items])

  const werte = useMemo(() => versicherungsListe(units, modellVon), [units, modellVon])
  const schaeden = useMemo(() => damageEntries(records), [records])
  const verteilung = useMemo(() => damageTally(records, nach), [records, nach])
  const gebunden = useMemo(() => committedByItem(records, units), [records, units])

  const gebundeneZeilen = useMemo(
    () =>
      items
        .map((i) => ({ item: i, c: gebunden.get(i.id) }))
        .filter((z) => z.c && z.c.quantity > 0),
    [items, gebunden],
  )

  return (
    <section className="werte">
      {/* ── Werte ────────────────────────────────────────────────────── */}
      <div className="block">
        <h3>Werte</h3>
        {units.length === 0 ? (
          <p className="hinweis">
            Keine serialisierten Einheiten. Ein Versicherungswert hängt an der
            einzelnen Einheit, nicht am Modell — ohne Einheiten gibt es nichts
            zu bewerten.
          </p>
        ) : (
          <>
            {/*
              Je Währung eine Summe. Zwei davon nebeneinander sind kein
              Darstellungsfehler, sondern die einzige ehrliche Antwort ohne
              hinterlegten Kurs.
            */}
            <div className="summen">
              {werte.summen.length === 0 ? (
                <p className="warnung">
                  Keine einzige Einheit trägt einen Wert — es gibt nichts zu
                  summieren.
                </p>
              ) : (
                werte.summen.map((s) => (
                  <div className="kachel" key={s.waehrung}>
                    <strong>{geldText({ cent: s.cent, waehrung: s.waehrung })}</strong>
                    <span>
                      {s.einheiten} von {werte.zeilen.length} Einheiten
                    </span>
                  </div>
                ))
              )}
            </div>
            {werte.ohneWert.length > 0 && (
              <p className="warnung">
                {/*
                  Singular und Plural getrennt: „1 Einheiten" liest sich wie
                  ein Fehler in der Zahl und laesst genau den Satz zweifelhaft
                  wirken, auf den es hier ankommt.
                */}
                {werte.ohneWert.length === 1
                  ? 'Eine Einheit ohne hinterlegten Wert — sie geht'
                  : `${werte.ohneWert.length} Einheiten ohne hinterlegten Wert — sie gehen`}{' '}
                in keine Summe oben ein:{' '}
                {werte.ohneWert
                  .slice(0, 8)
                  .map((z) => z.modell)
                  .join(', ')}
                {werte.ohneWert.length > 8 ? ' …' : ''}
              </p>
            )}
            <div className="zeile">
              <button
                type="button"
                onClick={() => csvLaden(versicherungsTabelle(werte), 'versicherungsliste.csv')}
              >
                Versicherungsliste (CSV)
              </button>
              <button
                type="button"
                onClick={() => csvLaden(carnetDatenblatt(units, artikelVon), 'carnet.csv')}
              >
                Carnet-Datenblatt (CSV)
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Schäden ──────────────────────────────────────────────────── */}
      <div className="block">
        <h3>Schäden ({schaeden.length})</h3>
        {schaeden.length === 0 ? (
          <p className="hinweis">
            Bei keiner Rückgabe wurde ein Schaden aufgenommen. Das ist etwas
            anderes als „nichts ist kaputt": es heißt, dass nichts vermerkt
            wurde.
          </p>
        ) : (
          <>
            <div className="zeile">
              <label>
                Zählen nach
                <select
                  value={nach}
                  onChange={(e) => setNach(e.target.value as 'person' | 'container' | 'job')}
                  aria-label="Schäden zählen nach"
                >
                  <option value="person">Person</option>
                  <option value="container">Container</option>
                  <option value="job">Show</option>
                </select>
              </label>
              <button type="button" onClick={() => csvLaden(damageTable(records), 'schaeden.csv')}>
                Schadensregister (CSV)
              </button>
            </div>
            <div className="spalten">
              <table>
                <thead>
                  <tr>
                    <th>Objekt</th>
                    <th>Vermerk</th>
                    <th>Show</th>
                    <th>bei</th>
                    <th>Container</th>
                  </tr>
                </thead>
                <tbody>
                  {schaeden.map((d, i) => (
                    <tr key={`${d.recordId}-${i}`}>
                      <td>
                        {d.label}
                        {d.code ? <em> {d.code}</em> : null}
                      </td>
                      <td>{d.note}</td>
                      <td>{d.job}</td>
                      <td>{d.person}</td>
                      <td>{d.container}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table>
                <thead>
                  <tr>
                    <th>
                      {nach === 'person' ? 'Person' : nach === 'container' ? 'Container' : 'Show'}
                    </th>
                    <th className="rechts">Schäden</th>
                  </tr>
                </thead>
                <tbody>
                  {verteilung.map((v) => (
                    <tr key={v.key}>
                      <td>{v.key}</td>
                      <td className="rechts">{v.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Gebunden ─────────────────────────────────────────────────── */}
      <div className="block">
        <h3>Auf offenen Ausgaben ({gebundeneZeilen.length})</h3>
        <p className="hinweis">
          Diese Stücke zählt der Bestand mit, im Regal liegen sie nicht. Wer
          das nicht sieht, sucht das fünfte Stück dort, wo es nicht mehr ist.
        </p>
        {gebundeneZeilen.length === 0 ? (
          <p className="hinweis">Nichts gebunden — alle Ausgaben sind zurück.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Artikel</th>
                <th className="rechts">im Bestand</th>
                <th className="rechts">gebunden</th>
                <th>wo</th>
              </tr>
            </thead>
            <tbody>
              {gebundeneZeilen.map(({ item, c }) => (
                <tr key={item.id}>
                  <td>{item.model}</td>
                  <td className="rechts">{item.quantity}</td>
                  <td className="rechts">{c!.quantity}</td>
                  <td>{commitmentNote(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Damit `unitLabel` nicht als toter Import dasteht: die Werte-Tabelle
          zeigt die Einheit unter der Kennung, die auf ihr klebt. */}
      {units.length > 0 && (
        <div className="block">
          <h3>Einheiten mit Wert</h3>
          <table>
            <thead>
              <tr>
                <th>Einheit</th>
                <th>Modell</th>
                <th>Wert</th>
                <th>Stand</th>
              </tr>
            </thead>
            <tbody>
              {werte.zeilen.map((z) => {
                const u = units.find((x) => x.id === z.unitId)
                return (
                  <tr key={z.unitId} className={z.wert ? '' : 'ohne-wert'}>
                    <td>{u ? unitLabel(u, 'house') : z.unitId}</td>
                    <td>{z.modell}</td>
                    <td>{z.wert ? geldText(z.wert) : NICHT_ANGEGEBEN}</td>
                    <td>{z.stand ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
