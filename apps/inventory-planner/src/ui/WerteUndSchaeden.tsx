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
//   Sie ÄNDERT KEINEN ZUSTAND — ausser an einer Stelle: den FRISTEN, siehe
//   unten. Ein Schaden wird bei der Rückgabe aufgenommen; hier wird er
//   gelesen. Zwei Orte, an denen dasselbe entsteht, laufen auseinander.
//
// ─── NACHTRAG: DIE FRISTEN-AMPEL (B-65, fünfte Zeile) ──────────────────────
//
// Sie steht hier, weil sie dieselbe Frage beantwortet wie die drei anderen:
// „womit muss ich rechnen." Ein Gerät, dessen DGUV-V3-Prüfung abgelaufen
// ist, ist kein Ortsproblem, sondern ein Risiko — dieselbe Kategorie wie
// ein Schaden und eine Unterversicherung.
//
// UND SIE IST DIE EINE STELLE, AN DER DIESE ANSICHT SCHREIBT. Das ist ein
// Bruch mit dem Satz darüber, und er ist bewusst: eine Prüffrist wird
// nirgendwo sonst erfasst. Sie an einem zweiten Ort zu erfassen, damit
// diese Ansicht rein bleiben kann, hiesse, den Lageristen zwischen zwei
// Fenstern hin- und herschicken — und die Regel „ein Ort je Sache" gälte
// dann für die Fristen nicht mehr. Der Schaden bleibt lesend: der entsteht
// bei der Rückgabe und hat dort seinen Ort.
//
// DREI LAGEN UND EINE NICHT-AUSSAGE. Überfällig, fällig (Vorwarnzeit),
// ok — und daneben die Einheiten OHNE eingetragene Frist, als eigene Zahl.
// Sie als „ok" zu zählen wäre bei Prüffristen die teuerste Verwechslung,
// die diese Anwendung anbieten könnte: ein Lager, in dem niemand je etwas
// eingetragen hat, sähe aus wie eines, in dem alles geprüft ist.
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
import {
  fristenLage,
  anzugehen,
  alterMonate,
  terminVon,
  FRIST_ART_LABEL,
  fristArtLabel,
  istUnbekannteArt,
} from '../domain/lib/fristen'
import type { Frist, FristArt } from '../domain/types/inventory'
import { EINGEBAUTE_FRIST_ARTEN } from '../domain/types/inventory'
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
  const updateUnit = useInventoryStore((s) => s.updateUnit)
  const fristArten = useInventoryStore((s) => s.fristArten)
  const fristArtAnlegen = useInventoryStore((s) => s.fristArtAnlegen)
  const fristArtEntfernen = useInventoryStore((s) => s.fristArtEntfernen)
  const records = useCheckoutStore((s) => s.records)

  const [nach, setNach] = useState<'person' | 'container' | 'job'>('person')
  // 30 Tage: die Zeit, in der sich ein Prueftermin noch vereinbaren laesst.
  // Sie steht als Eingabe da und nicht als Konstante im Code, weil sie eine
  // Entscheidung des Hauses ist und nicht dieser Datei.
  const [vorwarn, setVorwarn] = useState(30)
  const [neueArt, setNeueArt] = useState({ name: '', intervall: '', grundlage: '' })
  const [neueFrist, setNeueFrist] = useState<{ unitId: string; art: FristArt; zuletzt: string; intervall: string }>({
    unitId: '',
    art: 'dguv-v3',
    zuletzt: '',
    intervall: '12',
  })

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

  // Die Uhr steht in der ANSICHT und nicht in der Ableitung: `fristenLage`
  // nimmt `heute` entgegen, statt es zu lesen — dieselbe Regel wie ueberall
  // unter `domain/`. Nur so ist die Ampel testbar, ohne die Systemzeit zu
  // stellen.
  const heute = new Date().toISOString().slice(0, 10)
  const fristen = useMemo(() => fristenLage(units, items, heute, vorwarn), [units, items, heute, vorwarn])

  const gebundeneZeilen = useMemo(
    () =>
      items
        .map((i) => ({ item: i, c: gebunden.get(i.id) }))
        .filter((z) => z.c && z.c.quantity > 0),
    [items, gebunden],
  )

  const fristSetzen = () => {
    const u = units.find((x) => x.id === neueFrist.unitId)
    if (!u || !neueFrist.zuletzt) return
    const intervall = Number(neueFrist.intervall)
    if (!Number.isFinite(intervall) || intervall <= 0) return
    // Angehaengt, nicht ersetzt: eine Einheit hat mehrere Termine, und ein
    // zweiter Eintrag derselben Art ist die Verlaengerung, nicht ein Fehler.
    // Was der Mensch nicht mehr braucht, entfernt er ueber die Zeile.
    const frist: Frist = {
      art: neueFrist.art,
      zuletzt: neueFrist.zuletzt,
      intervallMonate: Math.round(intervall),
    }
    updateUnit(u.id, { fristen: [...(u.fristen ?? []), frist] })
    setNeueFrist((n) => ({ ...n, zuletzt: '' }))
  }

  const fristEntfernen = (unitId: string, faellig: string, art: FristArt) => {
    const u = units.find((x) => x.id === unitId)
    if (!u?.fristen) return
    // Ueber Art UND Termin, nicht ueber einen Index: die Tabelle ist
    // sortiert, ein Index aus der Zeile zeigte auf den falschen Eintrag.
    //
    // Der Termin kommt aus `terminVon` und nicht aus `f.faellig`: bei einer
    // Frist aus zuletzt+Intervall steht in `f.faellig` nichts, die Zeile
    // zeigt aber das gerechnete Datum. Ein Vergleich gegen das Feld
    // entfernte solche Fristen NIE — der Knopf saehe aus, als taete er
    // nichts.
    const rest = u.fristen.filter((f) => !(f.art === art && terminVon(f)?.faellig === faellig))
    updateUnit(unitId, { fristen: rest.length > 0 ? rest : undefined })
  }

  return (
    <section className="werte">
      {/* ── Fristen ──────────────────────────────────────────────────── */}
      <div className="block">
        <h3>Fristen</h3>
        {units.length === 0 ? (
          <p className="hinweis">
            Keine serialisierten Einheiten. Eine Prüffrist hängt am einzelnen
            Gerät, nicht am Modell — „die ULXD2 sind im März geprüft" ist eine
            Aussage über zwölf Geräte, von denen zwei in der Werkstatt standen.
          </p>
        ) : (
          <>
            <div className="kennzahlen">
              <div className={fristen.ueberfaellig > 0 ? 'kachel achtung' : 'kachel'}>
                <strong>{fristen.ueberfaellig}</strong>
                <span>überfällig</span>
              </div>
              <div className="kachel">
                <strong>{fristen.faellig}</strong>
                <span>fällig in {vorwarn} Tagen</span>
              </div>
              <div className="kachel">
                <strong>{fristen.ok}</strong>
                <span>später</span>
              </div>
              {/*
                Die vierte Kachel ist KEINE vierte Lage. Sie zaehlt die
                Einheiten, ueber die diese Ampel nichts sagt — und ohne sie
                saehe ein Lager, in dem niemand je eine Frist gepflegt hat,
                aus wie eines, in dem alles geprueft ist.
              */}
              <div className="kachel">
                <strong>{fristen.ohneFrist}</strong>
                <span>ohne Frist hinterlegt</span>
              </div>
            </div>

            <p className={fristen.ueberfaellig > 0 ? 'warnung' : 'hinweis'}>
              {fristen.ohneFrist > 0
                ? `Für ${fristen.ohneFrist === 1 ? 'eine Einheit' : `${fristen.ohneFrist} Einheiten`} ist keine Frist hinterlegt — über sie sagt diese Ampel nichts, weder „geprüft" noch „fällig".`
                : 'Jede Einheit trägt mindestens eine Frist; die Ampel deckt den ganzen Bestand.'}
            </p>

            <div className="zeile">
              <label>
                Vorwarnzeit (Tage)
                <input
                  type="number"
                  min="0"
                  value={vorwarn}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (Number.isFinite(n) && n >= 0) setVorwarn(Math.round(n))
                  }}
                  aria-label="Vorwarnzeit in Tagen"
                  className="schmal"
                />
              </label>
            </div>

            {anzugehen(fristen).length === 0 ? (
              <p className="hinweis">
                Nichts überfällig und nichts in den nächsten {vorwarn} Tagen fällig.
              </p>
            ) : (
              <div className="tabelle-rahmen">
                <table>
                  <thead>
                    <tr>
                      <th>Einheit</th>
                      <th>Modell</th>
                      <th>Art</th>
                      <th>fällig</th>
                      <th className="rechts">Tage</th>
                      <th>Termin</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {anzugehen(fristen).map((z) => (
                      <tr key={`${z.unitId}-${z.art}-${z.faellig}`} className={`lage-${z.lage}`}>
                        <td>{z.einheit}</td>
                        <td>{z.model}</td>
                        <td>
                          {/*
                            Eine Art, die weder eingebaut ist noch in der
                            Liste des Hauses steht, wird BENANNT und nicht
                            umbenannt: die Datei kam aus einem anderen Haus
                            und hat ihre Arten-Liste nicht mitgeschickt. Sie
                            hier zu „Sonstige" zu machen gäbe dem Termin
                            einen Namen, den niemand vergeben hat.
                          */}
                          <span className={istUnbekannteArt(z.art, fristArten) ? 'warnung' : undefined}>
                            {fristArtLabel(z.art, fristArten)}
                          </span>
                          {z.bezeichnung ? <span className="leise"> · {z.bezeichnung}</span> : null}
                        </td>
                        <td>{z.faellig}</td>
                        <td className="rechts">{z.tage < 0 ? `${-z.tage} über` : z.tage}</td>
                        {/*
                          Ob der Termin eingetragen oder gerechnet ist, steht
                          IN der Zeile. Ein gerechneter Termin, der wie ein
                          eingetragener aussieht, ist genau die Sorte Zahl,
                          gegen die dieses Repo anschreibt.
                        */}
                        <td className="leise">
                          {z.quelle === 'eingetragen' ? 'eingetragen' : 'aus Intervall'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="still"
                            onClick={() => fristEntfernen(z.unitId, z.faellig, z.art)}
                          >
                            Entfernen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Frist eintragen ─────────────────────────────────────── */}
            <div className="zeile">
              <label>
                Einheit
                <select
                  value={neueFrist.unitId}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, unitId: e.target.value }))}
                  aria-label="Einheit für die neue Frist"
                >
                  <option value="">— Einheit —</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {unitLabel(u, 'house')} · {modellVon(u)}
                      {alterMonate(u, heute) !== undefined
                        ? ` · ${alterMonate(u, heute)} Mon. alt`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Art
                <select
                  value={neueFrist.art}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, art: e.target.value as FristArt }))}
                  aria-label="Art der Frist"
                >
                  {EINGEBAUTE_FRIST_ARTEN.map((a) => (
                    <option key={a} value={a}>
                      {FRIST_ART_LABEL[a]}
                    </option>
                  ))}
                  {fristArten.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                zuletzt erledigt
                <input
                  type="date"
                  value={neueFrist.zuletzt}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, zuletzt: e.target.value }))}
                  aria-label="Datum der letzten Erledigung"
                />
              </label>
              <label>
                Intervall (Monate)
                <input
                  type="number"
                  min="1"
                  value={neueFrist.intervall}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, intervall: e.target.value }))}
                  aria-label="Intervall in Monaten"
                  className="schmal"
                />
              </label>
              <button
                type="button"
                onClick={fristSetzen}
                disabled={!neueFrist.unitId || !neueFrist.zuletzt}
              >
                Frist eintragen
              </button>
            </div>
            {/*
              Das ALTER steht in der Auswahl oben und bekommt hier KEINE
              Ampel. Wie alt ein Akku sein darf, haengt an Zellchemie,
              Ladezyklen und daran, was das Haus sich leistet — eine
              Schwelle dafuer waere eine Wartungsempfehlung ohne Fundstelle.
              Wer eine will, traegt sie als Frist der Art „Akku" ein.
            */}
            <p className="hinweis">
              Das Alter neben der Einheit kommt aus ihrem Kaufdatum und ist eine
              Angabe, kein Urteil: ab wann ein Akku zu alt ist, entscheidet das
              Haus — als Frist der Art „Akku".
            </p>

            {/* ── Eigene Fristarten ───────────────────────────────────────
                Was ein Haus turnusmäßig prüft, weiß nur das Haus:
                Anschlagmittel, Leitern, Feuerlöscher, Nebelfluid-Chargen,
                TÜV am Anhänger. Bis 2026-09-10 landete jede davon unter
                „Sonstige", und die Ampel war für alles außer den
                eingebauten Arten eine Sammelmeldung ohne Sortierung. */}
            <details className="unterblock">
              <summary>Eigene Fristarten ({fristArten.length})</summary>
              <p className="hinweis">
                Eingebaut sind {EINGEBAUTE_FRIST_ARTEN.length} Arten. Alles, was
                dieses Haus zusätzlich prüft oder ablaufen lässt, steht hier —
                und reist in der Lager-Datei mit, damit ein Termin drüben nicht
                ohne seinen Grund ankommt.
              </p>
              {fristArten.length > 0 && (
                <ul className="artenliste">
                  {fristArten.map((a) => (
                    <li key={a.id}>
                      <strong>{a.name}</strong>
                      <span className="leise"> · {a.id}</span>
                      {a.standardIntervallMonate ? (
                        <span className="leise"> · alle {a.standardIntervallMonate} Mon.</span>
                      ) : null}
                      {a.grundlage ? <span className="leise"> · {a.grundlage}</span> : null}
                      <button
                        type="button"
                        className="still"
                        onClick={() => fristArtEntfernen(a.id)}
                        title="Eingetragene Termine dieser Art bleiben bestehen und werden danach als unbekannte Art angezeigt."
                      >
                        Entfernen
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="zeile">
                <label>
                  Name
                  <input
                    type="text"
                    value={neueArt.name}
                    placeholder="z. B. Anschlagmittel"
                    onChange={(e) => setNeueArt((n) => ({ ...n, name: e.target.value }))}
                    aria-label="Name der neuen Fristart"
                  />
                </label>
                <label>
                  Intervall (Monate)
                  <input
                    type="number"
                    min="1"
                    value={neueArt.intervall}
                    onChange={(e) => setNeueArt((n) => ({ ...n, intervall: e.target.value }))}
                    aria-label="Vorschlag für das Intervall"
                    className="schmal"
                  />
                </label>
                <label>
                  Grundlage
                  <input
                    type="text"
                    value={neueArt.grundlage}
                    placeholder="z. B. DGUV Regel 100-500"
                    onChange={(e) => setNeueArt((n) => ({ ...n, grundlage: e.target.value }))}
                    aria-label="Grundlage der Frist"
                  />
                </label>
                <button
                  type="button"
                  disabled={!neueArt.name.trim()}
                  onClick={() => {
                    fristArtAnlegen({
                      name: neueArt.name,
                      standardIntervallMonate: Number(neueArt.intervall) || undefined,
                      grundlage: neueArt.grundlage,
                    })
                    setNeueArt({ name: '', intervall: '', grundlage: '' })
                  }}
                >
                  Art anlegen
                </button>
              </div>
            </details>
          </>
        )}
      </div>

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
