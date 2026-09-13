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
  nichtAngegeben,
} from '../domain/lib/insuranceSchedule'
import { damageEntries, damageTally, damageTable } from '../domain/lib/damageRegister'
import { committedByItem, commitmentNote } from '../domain/lib/inventoryCommitment'
import { unitLabel } from '../domain/lib/unitIdentity'
import {
  fristenLage,
  anzugehen,
  alterMonate,
  terminVon,
  fristArtLabels,
  fristArtLabel,
  istUnbekannteArt,
} from '../domain/lib/fristen'
import type { Frist, FristArt } from '../domain/types/inventory'
import { EINGEBAUTE_FRIST_ARTEN } from '../domain/types/inventory'
import { toCsv, type CsvTable } from '../lib/csv'
import { useT } from '../i18n'
import { TabelleRahmen } from './TabelleRahmen'

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
  const { t, format } = useT()
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
    return (u: { itemId: string }) => nachId.get(u.itemId) ?? nichtAngegeben(t)
    // `t` gehoert in die Abhaengigkeiten: sonst behaelt die Tabelle den
    // Platzhalter der Sprache, die beim ersten Rendern galt.
  }, [items, t])

  const artikelVon = useMemo(() => {
    const nachId = new Map(items.map((i) => [i.id, i]))
    return (u: { itemId: string }) => nachId.get(u.itemId)
  }, [items])

  const werte = useMemo(() => versicherungsListe(units, modellVon), [units, modellVon])
  const schaeden = useMemo(() => damageEntries(records, t), [records, t])
  const verteilung = useMemo(() => damageTally(records, nach, t), [records, nach, t])
  const gebunden = useMemo(() => committedByItem(records, units), [records, units])

  // Die Uhr steht in der ANSICHT und nicht in der Ableitung: `fristenLage`
  // nimmt `heute` entgegen, statt es zu lesen — dieselbe Regel wie ueberall
  // unter `domain/`. Nur so ist die Ampel testbar, ohne die Systemzeit zu
  // stellen.
  const heute = new Date().toISOString().slice(0, 10)
  // Die Beschriftungen der eingebauten Arten, einmal je Rendern. Als
  // Modul-Konstante stuenden sie fuer immer in der Sprache, die beim Laden
  // galt — dieselbe Falle wie bei der Reiter-Liste in `App.tsx`.
  const ARTEN = fristArtLabels(t)
  const fristen = useMemo(() => fristenLage(units, items, heute, vorwarn, t), [units, items, heute, vorwarn, t])

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
        <h3>{t('checks.title', 'Inspection dates')}</h3>
        {units.length === 0 ? (
          <p className="hinweis">
            {t(
              'checks.empty',
              'No serialised units. An inspection date belongs to the single device, not to the model — "the ULXD2 were checked in March" is a claim about twelve devices, two of which sat in the workshop.',
            )}
          </p>
        ) : (
          <>
            <div className="kennzahlen">
              <div className={fristen.ueberfaellig > 0 ? 'kachel achtung' : 'kachel'}>
                <strong>{fristen.ueberfaellig}</strong>
                <span>{t('checks.overdue', 'overdue')}</span>
              </div>
              <div className="kachel">
                <strong>{fristen.faellig}</strong>
                <span>{format(t('checks.dueIn', 'due within {n} days'), { n: vorwarn })}</span>
              </div>
              <div className="kachel">
                <strong>{fristen.ok}</strong>
                <span>{t('checks.later', 'later')}</span>
              </div>
              {/*
                Die vierte Kachel ist KEINE vierte Lage. Sie zaehlt die
                Einheiten, ueber die diese Ampel nichts sagt — und ohne sie
                saehe ein Lager, in dem niemand je eine Frist gepflegt hat,
                aus wie eines, in dem alles geprueft ist.
              */}
              <div className="kachel">
                <strong>{fristen.ohneFrist}</strong>
                <span>{t('checks.withoutDate', 'without a stated date')}</span>
              </div>
            </div>

            <p className={fristen.ueberfaellig > 0 ? 'warnung' : 'hinweis'}>
              {/* Singular und Plural als ZWEI ganze Saetze und nicht als ein
                  Satz mit eingesetztem Wort: welche Formen eine Sprache
                  ueberhaupt unterscheidet, gehoert zur Sprache. */}
              {fristen.ohneFrist === 1
                ? t(
                    'checks.coverage.one',
                    'One unit has no stated date — this light says nothing about it, neither "checked" nor "due".',
                  )
                : fristen.ohneFrist > 1
                  ? format(
                      t(
                        'checks.coverage.many',
                        '{n} units have no stated date — this light says nothing about them, neither "checked" nor "due".',
                      ),
                      { n: fristen.ohneFrist },
                    )
                  : t(
                      'checks.coverage.full',
                      'Every unit carries at least one date; the light covers the whole stock.',
                    )}
            </p>

            <div className="zeile">
              <label>
                {t('checks.leadTime', 'Lead time (days)')}
                <input
                  type="number"
                  min="0"
                  value={vorwarn}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (Number.isFinite(n) && n >= 0) setVorwarn(Math.round(n))
                  }}
                  aria-label={t('checks.leadTime.aria', 'Lead time in days')}
                  className="schmal"
                />
              </label>
            </div>

            {anzugehen(fristen).length === 0 ? (
              <p className="hinweis">
                {format(t('checks.allClear', 'Nothing overdue and nothing due within the next {n} days.'), {
                  n: vorwarn,
                })}
              </p>
            ) : (
              <TabelleRahmen>
                <table>
                  <thead>
                    <tr>
                      <th>{t('checks.col.unit', 'Unit')}</th>
                      <th>{t('checks.col.model', 'Model')}</th>
                      <th>{t('checks.col.kind', 'Kind')}</th>
                      <th>{t('checks.col.due', 'Due')}</th>
                      <th className="rechts">{t('checks.col.days', 'Days')}</th>
                      <th>{t('checks.col.source', 'Date')}</th>
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
                            {fristArtLabel(z.art, fristArten, t)}
                          </span>
                          {z.bezeichnung ? <span className="leise"> · {z.bezeichnung}</span> : null}
                        </td>
                        <td>{z.faellig}</td>
                        <td className="rechts">
                          {z.tage < 0 ? format(t('checks.daysOver', '{n} over'), { n: -z.tage }) : z.tage}
                        </td>
                        {/*
                          Ob der Termin eingetragen oder gerechnet ist, steht
                          IN der Zeile. Ein gerechneter Termin, der wie ein
                          eingetragener aussieht, ist genau die Sorte Zahl,
                          gegen die dieses Repo anschreibt.
                        */}
                        <td className="leise">
                          {z.quelle === 'eingetragen'
                            ? t('checks.source.entered', 'entered')
                            : t('checks.source.derived', 'from interval')}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="still"
                            onClick={() => fristEntfernen(z.unitId, z.faellig, z.art)}
                          >
                            {t('common.remove', 'Remove')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabelleRahmen>
            )}

            {/* ── Frist eintragen ─────────────────────────────────────── */}
            <div className="zeile">
              <label>
                {t('checks.col.unit', 'Unit')}
                <select
                  value={neueFrist.unitId}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, unitId: e.target.value }))}
                  aria-label={t('checks.new.unit.aria', 'Unit for the new date')}
                >
                  <option value="">{t('checks.new.unit.none', '— Unit —')}</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {unitLabel(u, 'house')} · {modellVon(u)}
                      {alterMonate(u, heute) !== undefined
                        ? ` · ${format(t('checks.ageMonths', '{n} mo. old'), { n: alterMonate(u, heute)! })}`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('checks.col.kind', 'Kind')}
                <select
                  value={neueFrist.art}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, art: e.target.value as FristArt }))}
                  aria-label={t('checks.new.kind.aria', 'Kind of date')}
                >
                  {EINGEBAUTE_FRIST_ARTEN.map((a) => (
                    <option key={a} value={a}>
                      {ARTEN[a]}
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
                {t('checks.new.last', 'last done')}
                <input
                  type="date"
                  value={neueFrist.zuletzt}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, zuletzt: e.target.value }))}
                  aria-label={t('checks.new.last.aria', 'Date it was last done')}
                />
              </label>
              <label>
                {t('checks.interval', 'Interval (months)')}
                <input
                  type="number"
                  min="1"
                  value={neueFrist.intervall}
                  onChange={(e) => setNeueFrist((n) => ({ ...n, intervall: e.target.value }))}
                  aria-label={t('checks.interval.aria', 'Interval in months')}
                  className="schmal"
                />
              </label>
              <button
                type="button"
                onClick={fristSetzen}
                disabled={!neueFrist.unitId || !neueFrist.zuletzt}
              >
                {t('checks.new.add', 'Add date')}
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
              {t(
                'checks.ageNote',
                'The age next to a unit comes from its purchase date and is a statement, not a verdict: when a battery is too old is for the house to decide — as a date of the "Battery" kind.',
              )}
            </p>

            {/* ── Eigene Fristarten ───────────────────────────────────────
                Was ein Haus turnusmäßig prüft, weiß nur das Haus:
                Anschlagmittel, Leitern, Feuerlöscher, Nebelfluid-Chargen,
                TÜV am Anhänger. Bis 2026-09-10 landete jede davon unter
                „Sonstige", und die Ampel war für alles außer den
                eingebauten Arten eine Sammelmeldung ohne Sortierung. */}
            <details className="unterblock">
              <summary>
                {format(t('checks.kinds.title', 'Own kinds of date ({n})'), { n: fristArten.length })}
              </summary>
              <p className="hinweis">
                {format(
                  t(
                    'checks.kinds.hint',
                    '{n} kinds are built in. Whatever this house additionally checks or lets expire goes here — and travels along in the stock file, so a date does not arrive over there without its reason.',
                  ),
                  { n: EINGEBAUTE_FRIST_ARTEN.length },
                )}
              </p>
              {fristArten.length > 0 && (
                <ul className="artenliste">
                  {fristArten.map((a) => (
                    <li key={a.id}>
                      <strong>{a.name}</strong>
                      <span className="leise"> · {a.id}</span>
                      {a.standardIntervallMonate ? (
                        <span className="leise">
                          {' '}
                          · {format(t('checks.kinds.every', 'every {n} mo.'), { n: a.standardIntervallMonate })}
                        </span>
                      ) : null}
                      {a.grundlage ? <span className="leise"> · {a.grundlage}</span> : null}
                      <button
                        type="button"
                        className="still"
                        onClick={() => fristArtEntfernen(a.id)}
                        title={t(
                          'checks.kinds.remove.title',
                          'Dates already entered under this kind stay as they are and are shown as an unknown kind afterwards.',
                        )}
                      >
                        {t('common.remove', 'Remove')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="zeile">
                <label>
                  {t('checks.kinds.name', 'Name')}
                  <input
                    type="text"
                    value={neueArt.name}
                    placeholder={t('checks.kinds.name.example', 'e.g. lifting gear')}
                    onChange={(e) => setNeueArt((n) => ({ ...n, name: e.target.value }))}
                    aria-label={t('checks.kinds.name.aria', 'Name of the new kind of date')}
                  />
                </label>
                <label>
                  {t('checks.interval', 'Interval (months)')}
                  <input
                    type="number"
                    min="1"
                    value={neueArt.intervall}
                    onChange={(e) => setNeueArt((n) => ({ ...n, intervall: e.target.value }))}
                    aria-label={t('checks.kinds.interval.aria', 'Suggested interval')}
                    className="schmal"
                  />
                </label>
                <label>
                  {t('checks.kinds.basis', 'Basis')}
                  <input
                    type="text"
                    value={neueArt.grundlage}
                    placeholder={t('checks.kinds.basis.example', 'e.g. DGUV Regel 100-500')}
                    onChange={(e) => setNeueArt((n) => ({ ...n, grundlage: e.target.value }))}
                    aria-label={t('checks.kinds.basis.aria', 'Basis of the date')}
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
                  {t('checks.kinds.add', 'Add kind')}
                </button>
              </div>
            </details>
          </>
        )}
      </div>

      {/* ── Werte ────────────────────────────────────────────────────── */}
      <div className="block">
        <h3>{t('values.title', 'Values')}</h3>
        {units.length === 0 ? (
          <p className="hinweis">
            {t(
              'values.empty',
              'No serialised units. An insured value belongs to the single unit, not to the model — without units there is nothing to value.',
            )}
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
                  {t('values.noneValued', 'Not a single unit carries a value — there is nothing to total.')}
                </p>
              ) : (
                werte.summen.map((s) => (
                  <div className="kachel" key={s.waehrung}>
                    <strong>{geldText({ cent: s.cent, waehrung: s.waehrung })}</strong>
                    <span>
                      {format(t('values.ofUnits', '{n} of {all} units'), {
                        n: s.einheiten,
                        all: werte.zeilen.length,
                      })}
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
                  ? t(
                      'values.withoutValue.one',
                      'One unit has no stated value — it goes into none of the totals above:',
                    )
                  : format(
                      t(
                        'values.withoutValue.many',
                        '{n} units have no stated value — they go into none of the totals above:',
                      ),
                      { n: werte.ohneWert.length },
                    )}{' '}
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
                onClick={() => csvLaden(versicherungsTabelle(werte, t), 'versicherungsliste.csv')}
              >
                {t('values.csvButton', 'Insurance schedule (CSV)')}
              </button>
              <button
                type="button"
                onClick={() => csvLaden(carnetDatenblatt(units, artikelVon, t), 'carnet.csv')}
              >
                {t('values.carnetButton', 'Carnet data sheet (CSV)')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Schäden ──────────────────────────────────────────────────── */}
      <div className="block">
        <h3>{format(t('damage.title', 'Damage ({n})'), { n: schaeden.length })}</h3>
        {schaeden.length === 0 ? (
          <p className="hinweis">
            {t(
              'damage.empty',
              'No return has recorded any damage. That is something other than "nothing is broken": it means nothing was noted.',
            )}
          </p>
        ) : (
          <>
            <div className="zeile">
              <label>
                {t('damage.countBy', 'Count by')}
                <select
                  value={nach}
                  onChange={(e) => setNach(e.target.value as 'person' | 'container' | 'job')}
                  aria-label={t('damage.countBy.aria', 'Count damage by')}
                >
                  <option value="person">{t('damage.by.person', 'Person')}</option>
                  <option value="container">{t('damage.by.container', 'Container')}</option>
                  <option value="job">{t('damage.by.show', 'Show')}</option>
                </select>
              </label>
              <button type="button" onClick={() => csvLaden(damageTable(records, t), 'schaeden.csv')}>
                {t('damage.csvButton', 'Damage register (CSV)')}
              </button>
            </div>
            <div className="spalten">
              <table>
                <thead>
                  <tr>
                    <th>{t('damage.col.object', 'Object')}</th>
                    <th>{t('damage.col.note', 'Note')}</th>
                    <th>{t('damage.by.show', 'Show')}</th>
                    <th>{t('damage.col.with', 'With')}</th>
                    <th>{t('damage.by.container', 'Container')}</th>
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
                      {nach === 'person'
                        ? t('damage.by.person', 'Person')
                        : nach === 'container'
                          ? t('damage.by.container', 'Container')
                          : t('damage.by.show', 'Show')}
                    </th>
                    <th className="rechts">{t('damage.col.count', 'Damage')}</th>
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
        <h3>{format(t('committed.title', 'On open checkouts ({n})'), { n: gebundeneZeilen.length })}</h3>
        <p className="hinweis">
          {t(
            'committed.hint',
            'The stock count includes these pieces; they are not on the shelf. Anyone who cannot see that looks for the fifth piece where it no longer is.',
          )}
        </p>
        {gebundeneZeilen.length === 0 ? (
          <p className="hinweis">
            {t('committed.none', 'Nothing committed — every checkout is back.')}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('committed.col.item', 'Item')}</th>
                <th className="rechts">{t('committed.col.inStock', 'In stock')}</th>
                <th className="rechts">{t('committed.col.committed', 'Committed')}</th>
                <th>{t('committed.col.where', 'Where')}</th>
              </tr>
            </thead>
            <tbody>
              {gebundeneZeilen.map(({ item, c }) => (
                <tr key={item.id}>
                  <td>{item.model}</td>
                  <td className="rechts">{item.quantity}</td>
                  <td className="rechts">{c!.quantity}</td>
                  <td>{commitmentNote(c, t)}</td>
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
          <h3>{t('values.units.title', 'Units with a value')}</h3>
          <table>
            <thead>
              <tr>
                <th>{t('checks.col.unit', 'Unit')}</th>
                <th>{t('checks.col.model', 'Model')}</th>
                <th>{t('values.col.value', 'Value')}</th>
                <th>{t('values.csv.asOf', 'As of')}</th>
              </tr>
            </thead>
            <tbody>
              {werte.zeilen.map((z) => {
                const u = units.find((x) => x.id === z.unitId)
                return (
                  <tr key={z.unitId} className={z.wert ? '' : 'ohne-wert'}>
                    <td>{u ? unitLabel(u, 'house') : z.unitId}</td>
                    <td>{z.modell}</td>
                    <td>{z.wert ? geldText(z.wert) : nichtAngegeben(t)}</td>
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
