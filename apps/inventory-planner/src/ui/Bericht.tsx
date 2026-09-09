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
import { useCheckoutStore } from '../domain/store/checkoutStore'
import { toCsv } from '../lib/csv'
import type { ImportReport } from '../domain/store/inventoryStore'

/**
 * Zahl mit passendem Wort.
 *
 * Klein, aber nicht kosmetisch: „1 Artikel liegen unter der Mindestmenge"
 * lässt genau den Satz zweifelhaft aussehen, der zu einer Bestellung führen
 * soll. Wer die Grammatik nicht hinbekommt, dem glaubt man die Zahl auch
 * nicht.
 */
const zaehlwort = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`

/** Ein Block der Aufschlüsselung. Fünf davon sehen gleich aus — also einmal. */
function Aufschluesselung({ titel, zeilen }: { titel: string; zeilen: CountValue[] }) {
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
            <th className="rechts">Positionen</th>
            <th className="rechts">Stück</th>
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
        `„${f.name}" ist keine Datei im Format avplan-inventory — oder ihre ` +
          'Version ist neuer als die, die diese App liest.',
      )
      return
    }
    setBericht(importSnapshot(snap, modus))
  }

  const nachbestellListe = () => {
    const zeilen = nachzubestellen(lage)
    const csv = toCsv(
      ['Artikel', 'Kategorie', 'Bestand', 'gebunden', 'verfuegbar', 'Mindestmenge', 'fehlt'],
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
      new Date().toLocaleDateString('de-DE'),
    )
    const w = window.open('', '_blank')
    if (!w) {
      setFehler('Das Blatt konnte nicht geöffnet werden — der Browser hat das Fenster blockiert.')
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
          <span>Positionen</span>
        </div>
        <div className="kachel">
          <strong>{zahlen.totalUnits}</strong>
          <span>Stück gesamt</span>
        </div>
        <div className="kachel">
          <strong>{zahlen.serializedCount}</strong>
          <span>serialisierte Einheiten</span>
        </div>
        <div className="kachel">
          <strong>
            {zahlen.dailyRentalValue.toLocaleString('de-DE', {
              style: 'currency',
              currency: 'EUR',
            })}
          </strong>
          <span>Tagesmiete</span>
        </div>
        {/*
          Die einzige Kachel hier, die zu einer HANDLUNG fuehrt: nachbestellen
          oder sub-hiren. Sie faerbt sich nur, wenn wirklich etwas unter dem
          Ziel liegt — eine dauerhaft rote Zahl liest nach einer Woche
          niemand mehr.
        */}
        <div className={lage.unter > 0 ? 'kachel achtung' : 'kachel'}>
          <strong>{lage.unter}</strong>
          <span>unter Ziel</span>
        </div>
      </div>
      {/*
        Der Satz, ohne den die Zahl darüber lügt. Er steht direkt daneben und
        nicht in einer Fußnote: wer die Tagesmiete abliest, soll im selben
        Blick sehen, worauf sie NICHT beruht.
      */}
      <p className={zahlen.itemsWithoutPrice > 0 ? 'warnung' : 'hinweis'}>
        {zahlen.itemsWithoutPrice > 0
          ? `${zahlen.itemsWithoutPrice} von ${zahlen.itemCount} Positionen haben keinen Mietpreis — die Tagesmiete oben ist die Summe über die übrigen, nicht über den Bestand.`
          : 'Jede Position hat einen Mietpreis; die Tagesmiete deckt den ganzen Bestand.'}
      </p>

      <div className="spalten">
        <Aufschluesselung titel="Kategorie" zeilen={zahlen.byCategory} />
        <Aufschluesselung titel="Eigentum" zeilen={zahlen.byOwnership} />
        <Aufschluesselung titel="Material-Art" zeilen={zahlen.byMaterial} />
        <Aufschluesselung titel="Lagerort" zeilen={zahlen.byLocation} />
        <Aufschluesselung titel="Zustand der Einheiten" zeilen={zahlen.unitsByCondition} />
      </div>

      {/* ── Unter Ziel ───────────────────────────────────────────────── */}
      <div className="block">
        <h3>Unter Ziel</h3>
        {lage.zeilen.length === 0 ? (
          // Ein Satz, kein Baukasten: die Wortstellung gehört zur Sprache,
          // und aus Fragmenten zusammengesetzt stünde hier ein Leerzeichen
          // vor dem Punkt.
          <p className="hinweis">
            {lage.unbewertet === 0
              ? 'Der Bestand ist leer — es gibt nichts zu vergleichen.'
              : `Für keinen der ${zaehlwort(lage.unbewertet, 'Artikel', 'Artikel')} im Bestand ist eine Mindestmenge hinterlegt. Ohne eine solche Zahl gibt es nichts zu vergleichen — die Spalte „Ziel" in der Bestands-Ansicht legt sie fest.`}
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
                ? `${zaehlwort(lage.unter, 'Artikel liegt', 'Artikel liegen')} unter der hinterlegten Mindestmenge.`
                : 'Kein Artikel liegt unter seiner hinterlegten Mindestmenge.'}
              {lage.knapp > 0
                ? ` ${zaehlwort(lage.knapp, 'Artikel steht', 'Artikel stehen')} genau darauf — die nächste Ausgabe reisst die Lücke.`
                : ''}
              {lage.unbewertet > 0
                ? ` Für ${zaehlwort(lage.unbewertet, 'weiteren Artikel', 'weitere Artikel')} ist keine Mindestmenge hinterlegt; über sie sagt diese Liste nichts.`
                : ''}
            </p>
            <div className="tabelle-rahmen">
              <table>
                <thead>
                  <tr>
                    <th>Artikel</th>
                    <th className="rechts">Bestand</th>
                    <th className="rechts">gebunden</th>
                    <th className="rechts">verfügbar</th>
                    <th className="rechts">Ziel</th>
                    <th className="rechts">fehlt</th>
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
            </div>
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
                  ? 'Nichts nachzubestellen.'
                  : 'Nur die Artikel unter Ziel, mit der Fehlmenge.'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Packliste ────────────────────────────────────────────────── */}
      <div className="block">
        <h3>Packliste</h3>
        {wurzeln.length === 0 ? (
          <p className="hinweis">
            Kein Wurzel-Lagerort angelegt. Eine Packliste beschreibt einen
            Container mit allem, was darin liegt — ohne Baum gibt es nichts zu
            beschreiben.
          </p>
        ) : (
          <>
            <div className="zeile">
              <label>
                Wurzel
                <select
                  value={packRoot}
                  onChange={(e) => setPackRoot(e.target.value)}
                  aria-label="Wurzel-Lagerort für die Packliste"
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
                Blatt öffnen (A4)
              </button>
            </div>
            {packRoot && (
              <p className="hinweis">
                {packliste.length} Knoten, {packListTotalCount(packliste)} Stück.
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Austausch ────────────────────────────────────────────────── */}
      <div className="block">
        <h3>Bestand austauschen</h3>
        <p className="hinweis">
          Format <code>avplan-inventory</code> — dieselbe Datei, die die
          Planer der Suite schreiben und lesen.
        </p>
        <div className="zeile">
          <button type="button" onClick={speichern}>
            Bestand exportieren
          </button>
          <label>
            Beim Einlesen
            <select
              value={modus}
              onChange={(e) => setModus(e.target.value as 'merge' | 'replace')}
              aria-label="Wie soll eingelesen werden"
            >
              <option value="merge">zusammenführen (nichts geht verloren)</option>
              <option value="replace">ersetzen (Bestand wird überschrieben)</option>
            </select>
          </label>
          <input
            ref={datei}
            type="file"
            accept="application/json,.json"
            aria-label="Datei zum Einlesen"
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
