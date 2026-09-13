// ───────────────────────────────────────────────────────────────────────────
// Bericht — „was steckt im Lager, und wie kommt es hier raus?"
//
// ─── WARUM ES DIESE DATEI GIBT (B-65, zweite Zeile) ────────────────────────
//
// Vier weitere Rechenwerke lagen fertig und ohne Weg dorthin:
//
//   inventoryReport    Kennzahlen nach Kategorie, Eigentum, Material-Art,
//                      Lagerort und Zustand — samt der Angabe, wie viele
//                      Artikel KEINEN Mietpreis haben (der Wert ist sonst
//                      eine Zahl, die vollständig aussieht und es nicht ist)
//   inventoryPortable  `avplan-inventory` v4 — das Format, mit dem der
//                      Bestand zwischen den Apps wandert
//   packList           die Packliste eines Wurzel-Knotens, verschachtelt
//   inventoryPrint     dieselbe Liste als druckfertiges A4-Blatt
//
// Der Nutzer sah in der Vorlage einen Knopf „Bestand exportieren" und eine
// Kennzahlen-Seite. Beides gab es hier als Rechnung, nur ohne Knopf. Nach
// der Inventur-Ansicht ist das die zweite Zeile derselben Liste: erst die
// vorhandenen Rechenwerke an eine Bedienung hängen, dann Neues bauen.
//
// ─── DREI ENTSCHEIDUNGEN, DIE MAN SPÄTER SONST NACHFRAGT ───────────────────
//
//  1. DIE ZAHL SAGT, WORAUF SIE NICHT BERUHT. `dailyRentalValue` ist die
//     Summe über die Artikel MIT Preis; `itemsWithoutPrice` zählt die
//     anderen. Beide stehen nebeneinander, und wo welche fehlen, steht es
//     als Satz dabei. Eine Tagesmiete ohne diesen Zusatz wäre eine
//     Behauptung über den ganzen Bestand.
//
//  2. DER IMPORT FRAGT, WAS ER TUN SOLL. `replace` und `merge` sind zwei
//     verschiedene Sachen, und die falsche löscht einen Bestand. Vorgabe ist
//     `merge` — die Richtung, die nichts verliert.
//
//  3. DER BERICHT DES IMPORTS WIRD GEZEIGT, nicht nur seine Zahl.
//     `importSnapshot` liefert nach ADR-005 ausdrücklich einen Bericht: was
//     die Heilung nicht überstand, steht mit Namen darin. Nur die
//     Überlebenden zu zählen wäre ein grüner Erfolg über einer Datei, deren
//     Hälfte abgewiesen wurde.
//
// ─── WAS DIESE ANSICHT NICHT TUT ───────────────────────────────────────────
//
//   Sie DRUCKT NICHT SELBST. `buildPackListHtml` liefert ein A4-Blatt; die
//   Ansicht öffnet es in einem Fenster und überlässt das Drucken dem
//   Browser. Ein eigener Druckpfad wäre ein zweiter Ort für dieselbe
//   Ausgabe.
//
//   Sie RECHNET KEINE FRISTEN. DGUV-V3-Prüfung, Kalibrierung und Akku-Alter
//   sind eine andere Frage mit einer anderen Quelle — sie haben ihren eigenen
//   Weg noch vor sich (B-65).
//
// ─── NACHTRAG: DIE DECKUNG IST HIERHER GEKOMMEN (B-65, vierte Zeile) ───────
//
// Hier stand „Sie rechnet keine Deckung". Der Satz war richtig, solange er
// galt, und er ist jetzt falsch — deshalb steht er nicht mehr da, sondern
// hier, mit dem Grund für die Änderung.
//
// Er meinte den PLAN-Bedarf: „reicht der Bestand für diese Show?" ist eine
// Frage der Show, und sie hier zu beantworten hiesse, den Plan nachzubauen
// (ADR-006). Das gilt unverändert; nichts davon ist hinzugekommen.
//
// „Unter Ziel" ist die andere Deckung: gegen die Mindestmenge, die das HAUS
// für sein eigenes Regal festgelegt hat (`InventoryItem.mindestmenge`, in der
// Bestands-Ansicht gepflegt). Sie kennt keine Show, keinen Bedarf und kein
// Plan-Modell — sie vergleicht zwei Zahlen aus diesem Repo. Der Eigentümer
// sah genau diese Kachel in seiner Vorlage; sie ist die einzige Zahl auf so
// einer Seite, die zu einer Handlung führt.
//
// Verglichen wird gegen das, was WIRKLICH IM REGAL LIEGT — `quantity` minus
// dem, was auf offenen Ausgaben gebunden ist. Deshalb liest diese Ansicht
// jetzt auch die Ausgabescheine: eine Prüfung gegen `quantity` gäbe
// Entwarnung für Material, das gerade auf einem Truck steht, und genau dann
// wird die Zahl gebraucht.
// ───────────────────────────────────────────────────────────────────────────
import { useMemo, useRef, useState } from 'react'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { buildInventoryReport, type CountValue } from '../domain/lib/inventoryReport'
import { serializeInventory, parseInventory } from '../domain/lib/inventoryPortable'
import { derivePackList, packListTotalCount } from '../domain/lib/packList'
import { buildPackListHtml } from '../domain/lib/inventoryPrint'
import { nodePathLabel } from '../domain/lib/storageTree'
import { committedByItem } from '../domain/lib/inventoryCommitment'
import { deckung, nachzubestellen } from '../domain/lib/mindestmenge'
import { fristenLage } from '../domain/lib/fristen'
import { useCheckoutStore } from '../domain/store/checkoutStore'
import { toCsv } from '../lib/csv'
import { useT, locale } from '../i18n'
import { TabelleRahmen } from './TabelleRahmen'
import type { ImportReport } from '../domain/store/inventoryStore'

/**
 * Zahl mit passendem Wort.
 *
 * Klein, aber nicht kosmetisch: „1 Artikel liegen unter der Mindestmenge"
 * lässt genau den Satz zweifelhaft aussehen, der zu einer Bestellung führen
 * soll. Wer die Grammatik nicht hinbekommt, dem glaubt man die Zahl auch
 * nicht.
 */
// `zaehlwort` ist am 2026-09-11 weggefallen. Es baute Saetze aus Fragmenten
// („3" + „Artikel liegen" + „unter …") — im Deutschen ging das auf, im
// Englischen nicht, und genau davor warnt die i18n-Regel dieser Suite: ein
// Schluessel, ein ganzer Satz, Platzhalter ueber `format()`.

/** Ein Block der Aufschlüsselung. Fünf davon sehen gleich aus — also einmal. */
function Aufschluesselung({
  titel,
  zeilen,
  t,
}: {
  titel: string
  zeilen: CountValue[]
  t: (key: string, en: string) => string
}) {
  if (zeilen.length === 0) return null
  return (
    <div className="block">
      {/*
        Kein `<h3>` daneben: die Kopfzeile der Tabelle sagt bereits, wonach
        aufgeschluesselt wird. Zweimal dasselbe Wort untereinander ist keine
        Ueberschrift, sondern Rauschen.
      */}
      <table>
        <thead>
          <tr>
            <th>{titel}</th>
            <th className="rechts">{t('report.col.lines', 'Lines')}</th>
            <th className="rechts">{t('report.col.pieces', 'Pieces')}</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <tr key={z.key}>
              <td>{z.key}</td>
              <td className="rechts">{z.items}</td>
              <td className="rechts">{z.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Bericht() {
  const { t, format, sprache } = useT()
  const items = useInventoryStore((s) => s.items)
  const nodes = useInventoryStore((s) => s.nodes)
  const units = useInventoryStore((s) => s.units)
  const records = useCheckoutStore((s) => s.records)
  const exportSnapshot = useInventoryStore((s) => s.exportSnapshot)
  const importSnapshot = useInventoryStore((s) => s.importSnapshot)

  const [modus, setModus] = useState<'merge' | 'replace'>('merge')
  const [bericht, setBericht] = useState<ImportReport | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [packRoot, setPackRoot] = useState('')
  const datei = useRef<HTMLInputElement>(null)

  const zahlen = useMemo(() => buildInventoryReport(items, nodes, units), [items, nodes, units])

  // Die Bindung kommt aus den Ausgabescheinen und wird HEREINGEREICHT, statt
  // in `deckung` noch einmal gerechnet zu werden: zwei Rechnungen ueber
  // dieselben Ausgaben liefen frueher oder spaeter auseinander, und dann
  // stuende dieselbe Zahl an zwei Stellen der App verschieden da.
  const lage = useMemo(
    () => deckung(items, committedByItem(records, units)),
    [items, records, units],
  )

  // Die Uhr steht in der Ansicht, nicht in der Ableitung — `fristenLage`
  // nimmt `heute` entgegen. Gerechnet wird hier NUR fuer die Kachel; die
  // Liste und das Eintragen stehen in „Werte & Schaeden", wo die Fristen
  // hingehoeren. Zwei AUFRUFE derselben reinen Funktion sind kein zweites
  // Rechenwerk — zwei eigene Rechnungen waeren eines.
  const fristen = useMemo(
    () => fristenLage(units, items, new Date().toISOString().slice(0, 10)),
    [units, items],
  )

  /** Nur echte Wurzeln: eine Packliste eines Regals im Regal ergäbe zwei Blätter. */
  const wurzeln = useMemo(() => nodes.filter((n) => !n.parentId), [nodes])

  const packliste = useMemo(
    () => (packRoot ? derivePackList(packRoot, { items, nodes, units }) : []),
    [packRoot, items, nodes, units],
  )

  const speichern = () => {
    // Die Uhr steht hier und nicht in der Ableitung: `serializeInventory`
    // nimmt den Zeitstempel entgegen, statt ihn zu lesen — dieselbe Regel wie
    // ueberall in `domain/`.
    const json = serializeInventory(exportSnapshot(), {
      exportedAt: new Date().toISOString(),
      app: 'inventory-planner',
    })
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'bestand.avplan-inventory.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const einlesen = async (f: File) => {
    setBericht(null)
    setFehler(null)
    const snap = parseInventory(await f.text())
    if (!snap) {
      // Kein stiller Fehlschlag: eine Datei, die nicht passt, ist etwas
      // anderes als eine, die nichts enthaelt.
      setFehler(
        format(
          t(
            'report.import.badFile',
            '"{name}" is not a file in the avplan-inventory format — or its version is newer than the one this app reads.',
          ),
          { name: f.name },
        ),
      )
      return
    }
    setBericht(importSnapshot(snap, modus))
  }

  const nachbestellListe = () => {
    const zeilen = nachzubestellen(lage)
    const csv = toCsv(
      [
        t('report.csv.item', 'Item'),
        t('report.csv.category', 'Category'),
        t('report.csv.stock', 'Stock'),
        t('report.csv.committed', 'committed'),
        t('report.csv.available', 'available'),
        t('report.csv.target', 'Target'),
        t('report.csv.short', 'short'),
      ],
      zeilen.map((z) => [
        z.model,
        z.category ?? '',
        z.bestand,
        z.gebunden,
        z.verfuegbar,
        z.mindestmenge,
        z.fehlt,
      ]),
    )
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'nachbestellen.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const blattOeffnen = () => {
    const wurzel = nodes.find((n) => n.id === packRoot)
    if (!wurzel) return
    const html = buildPackListHtml(
      wurzel.name,
      wurzel.code,
      packliste,
      new Date().toLocaleDateString(locale(sprache)),
    )
    const w = window.open('', '_blank')
    if (!w) {
      setFehler(t('report.printBlocked', 'The sheet could not be opened — the browser blocked the window.'))
      return
    }
    w.document.write(html)
    w.document.close()
  }

  return (
    <section className="bericht">
      {/* ── Kennzahlen ───────────────────────────────────────────────── */}
      <div className="kennzahlen">
        <div className="kachel">
          <strong>{zahlen.itemCount}</strong>
          <span>{t('report.tile.lines', 'Lines')}</span>
        </div>
        <div className="kachel">
          <strong>{zahlen.totalUnits}</strong>
          <span>{t('report.tile.pieces', 'Pieces in total')}</span>
        </div>
        <div className="kachel">
          <strong>{zahlen.serializedCount}</strong>
          <span>{t('report.tile.units', 'serialised units')}</span>
        </div>
        <div className="kachel">
          <strong>
            {zahlen.dailyRentalValue.toLocaleString(locale(sprache), {
              style: 'currency',
              currency: 'EUR',
            })}
          </strong>
          <span>{t('report.tile.dailyRate', 'Daily rate')}</span>
        </div>
        {/*
          Die einzige Kachel hier, die zu einer HANDLUNG fuehrt: nachbestellen
          oder sub-hiren. Sie faerbt sich nur, wenn wirklich etwas unter dem
          Ziel liegt — eine dauerhaft rote Zahl liest nach einer Woche
          niemand mehr.
        */}
        <div className={lage.unter > 0 ? 'kachel achtung' : 'kachel'}>
          <strong>{lage.unter}</strong>
          <span>{t('report.tile.belowTarget', 'below target')}</span>
        </div>
        {/*
          Die zweite Kachel, die zu einer Handlung fuehrt. Sie zaehlt
          ueberfaellig UND faellig zusammen, weil beides auf denselben
          Wochenplan gehoert; welches davon brennt, sagt die Liste in
          „Werte & Schaeden". Gefaerbt wird nur, wenn etwas UEBERFAELLIG
          ist — eine Kachel, die schon bei einer Vorwarnung rot wird, ist
          nach einer Woche Hintergrundrauschen.
        */}
        <div className={fristen.ueberfaellig > 0 ? 'kachel achtung' : 'kachel'}>
          <strong>{fristen.ueberfaellig + fristen.faellig}</strong>
          <span>{t('report.tile.dueChecks', 'checks due')}</span>
        </div>
      </div>
      {/*
        Der Satz, ohne den die Zahl darüber lügt. Er steht direkt daneben und
        nicht in einer Fußnote: wer die Tagesmiete abliest, soll im selben
        Blick sehen, worauf sie NICHT beruht.
      */}
      <p className={zahlen.itemsWithoutPrice > 0 ? 'warnung' : 'hinweis'}>
        {zahlen.itemsWithoutPrice > 0
          ? format(
              t(
                'report.noPrice',
                '{without} of {all} lines carry no rental price — the daily rate above is the sum over the rest, not over the stock.',
              ),
              { without: zahlen.itemsWithoutPrice, all: zahlen.itemCount },
            )
          : t('report.allPriced', 'Every line carries a rental price; the daily rate covers the whole stock.')}
      </p>

      <div className="spalten">
        <Aufschluesselung titel={t('report.by.category', 'Category')} zeilen={zahlen.byCategory} t={t} />
        <Aufschluesselung titel={t('report.by.ownership', 'Ownership')} zeilen={zahlen.byOwnership} t={t} />
        <Aufschluesselung titel={t('report.by.material', 'Material kind')} zeilen={zahlen.byMaterial} t={t} />
        <Aufschluesselung titel={t('report.by.location', 'Location')} zeilen={zahlen.byLocation} t={t} />
        <Aufschluesselung titel={t('report.by.condition', 'Unit condition')} zeilen={zahlen.unitsByCondition} t={t} />
      </div>

      {/* ── Unter Ziel ───────────────────────────────────────────────── */}
      <div className="block">
        <h3>{t('report.belowTarget', 'Below target')}</h3>
        {lage.zeilen.length === 0 ? (
          // Ein Satz, kein Baukasten: die Wortstellung gehört zur Sprache,
          // und aus Fragmenten zusammengesetzt stünde hier ein Leerzeichen
          // vor dem Punkt.
          <p className="hinweis">
            {lage.unbewertet === 0
              ? t('report.stockEmpty', 'The stock is empty — there is nothing to compare.')
              : format(
                  t(
                    'report.noTargets',
                    'Not one of the {n} items in stock has a minimum quantity. Without such a number there is nothing to compare — the "Target" column in the stock view sets it.',
                  ),
                  { n: lage.unbewertet },
                )}
          </p>
        ) : (
          <>
            {/*
              Der Satz sagt zuerst, wieviele Artikel die Aussage ueberhaupt
              betrifft. Ohne ihn saehe ein Lager, in dem drei von vierhundert
              Artikeln eine Mindestmenge haben, aus wie ein Lager, in dem
              alles reicht.
            */}
            <p className={lage.unter > 0 ? 'warnung' : 'hinweis'}>
              {lage.unter > 0
                ? format(t('report.below.n', '{n} items are below their stored minimum quantity.'), { n: lage.unter })
                : t('report.below.none', 'No item is below its stored minimum quantity.')}
              {lage.knapp > 0
                ? ' ' +
                  format(
                    t('report.below.exact', '{n} items sit exactly on it — the next checkout tears the gap open.'),
                    { n: lage.knapp },
                  )
                : ''}
              {lage.unbewertet > 0
                ? ' ' +
                  format(
                    t(
                      'report.below.unrated',
                      'For {n} further items no minimum quantity is stored; this list says nothing about them.',
                    ),
                    { n: lage.unbewertet },
                  )
                : ''}
            </p>
            <TabelleRahmen>
              <table>
                <thead>
                  <tr>
                    <th>{t('report.csv.item', 'Item')}</th>
                    <th className="rechts">{t('report.csv.stock', 'Stock')}</th>
                    <th className="rechts">{t('report.csv.committed', 'committed')}</th>
                    <th className="rechts">{t('report.csv.available', 'available')}</th>
                    <th className="rechts">{t('report.csv.target', 'Target')}</th>
                    <th className="rechts">{t('report.csv.short', 'short')}</th>
                  </tr>
                </thead>
                <tbody>
                  {lage.zeilen.map((z) => (
                    <tr key={z.itemId} className={`lage-${z.lage}`}>
                      <td>
                        {z.model}
                        {z.category ? <span className="leise"> · {z.category}</span> : null}
                      </td>
                      <td className="rechts">{z.bestand}</td>
                      {/*
                        „gebunden" steht mit in der Zeile und nicht nur in der
                        Rechnung: sonst sieht der Lagerist eine Fehlmenge und
                        nicht, dass die Ware nicht fehlt, sondern unterwegs
                        ist. Das sind zwei verschiedene Handlungen.
                      */}
                      <td className="rechts">{z.gebunden > 0 ? z.gebunden : ''}</td>
                      <td className="rechts">{z.verfuegbar}</td>
                      <td className="rechts">{z.mindestmenge}</td>
                      <td className="rechts">{z.fehlt > 0 ? z.fehlt : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabelleRahmen>
            <div className="zeile">
              <button
                type="button"
                onClick={nachbestellListe}
                disabled={lage.unter === 0}
              >
                Nachbestell-Liste (CSV)
              </button>
              <span className="hinweis">
                {lage.unter === 0
                  ? t('report.reorder.none', 'Nothing to reorder.')
                  : t('report.reorder.hint', 'Only the items below target, with the shortfall.')}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Packliste ────────────────────────────────────────────────── */}
      <div className="block">
        <h3>{t('report.packList', 'Pack list')}</h3>
        {wurzeln.length === 0 ? (
          <p className="hinweis">
            {t(
              'report.packList.empty',
              'No root storage location set up. A pack list describes a container with everything inside it — without a tree there is nothing to describe.',
            )}
          </p>
        ) : (
          <>
            <div className="zeile">
              <label>
                {t('report.packList.root', 'Root')}
                <select
                  value={packRoot}
                  onChange={(e) => setPackRoot(e.target.value)}
                  aria-label={t('report.packRoot.aria', 'Root location for the pack list')}
                >
                  <option value="">— Lagerort —</option>
                  {wurzeln.map((n) => (
                    <option key={n.id} value={n.id}>
                      {nodePathLabel(nodes, n.id)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={blattOeffnen} disabled={packliste.length === 0}>
                {t('report.packList.open', 'Open sheet (A4)')}
              </button>
            </div>
            {packRoot && (
              <p className="hinweis">
                {format(t('report.packList.count', '{nodes} nodes, {pieces} pieces.'), {
                  nodes: packliste.length,
                  pieces: packListTotalCount(packliste),
                })}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Austausch ────────────────────────────────────────────────── */}
      <div className="block">
        <h3>{t('report.exchange', 'Exchange stock')}</h3>
        {/* Der Formatname steht IM Satz und nicht daneben: „Format" und
            „avplan-inventory" als zwei Stuecke zusammenzusetzen hiesse, die
            Wortstellung festzulegen — und die gehoert zur Sprache. Der
            Platzhalter traegt die Auszeichnung. */}
        <p className="hinweis">
          {format(
            t(
              'report.exchange.format',
              'Format {name} — the same file the planners of the suite write and read.',
            ),
            { name: 'avplan-inventory' },
          )}
        </p>
        <div className="zeile">
          <button type="button" onClick={speichern}>
            {t('report.exchange.export', 'Export stock')}
          </button>
          <label>
            {t('report.exchange.onImport', 'When reading in')}
            <select
              value={modus}
              onChange={(e) => setModus(e.target.value as 'merge' | 'replace')}
              aria-label={t('report.importMode.aria', 'How should it be read in')}
            >
              <option value="merge">{t('report.importMode.merge', 'merge (nothing is lost)')}</option>
              <option value="replace">{t('report.importMode.replace', 'replace (stock is overwritten)')}</option>
            </select>
          </label>
          <input
            ref={datei}
            type="file"
            accept="application/json,.json"
            aria-label={t('report.importFile.aria', 'File to read in')}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void einlesen(f)
              e.target.value = ''
            }}
          />
        </div>
        {fehler && (
          <p className="warnung" role="alert">
            {fehler}
          </p>
        )}
        {bericht && (
          <div className="import-bericht" role="status">
            <p>
              {bericht.imported} Datensätze übernommen
              {bericht.rejected.length > 0 ? `, ${bericht.rejected.length} abgewiesen:` : '.'}
            </p>
            {bericht.rejected.length > 0 && (
              <ul className="abgewiesen">
                {/*
                  `kind` und `label` sind alles, was die Abweisung mitgibt —
                  einen Grund fuehrt sie nicht. Hier einen zu formulieren
                  hiesse, ihn zu erfinden; die Art sagt wenigstens, WO die
                  Zeile stand.
                */}
                {bericht.rejected.map((r, i) => (
                  <li key={i}>
                    {r.label} <em>({r.kind})</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
