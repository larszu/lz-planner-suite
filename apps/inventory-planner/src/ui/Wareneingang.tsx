// ───────────────────────────────────────────────────────────────────────────
// Wareneingang — „was ist gekommen, und was macht das mit dem Bestand?"
//
// ─── DIE LETZTE ZEILE AUS B-65 ─────────────────────────────────────────────
//
// Der Eigentümer sah in seiner Vorlage einen Kassenbon-Import: Foto machen,
// Positionen erscheinen. Für eine Haushalts-App ist das der einzige Weg —
// eine Privatperson bekommt keine Datei vom Supermarkt, nur Papier. Ein
// Rental-Haus bekommt beides, und deshalb liest diese Ansicht TEXT und kein
// Bild. Die Begründung steht ausführlich im Kopf von
// `domain/lib/wareneingang.ts`; das Foto bleibt als eigener Schritt im
// Backlog stehen, mit der Abhängigkeit (OCR) benannt.
//
// ─── ZWEI SCHRITTE, UND DER ZWEITE IST EINE ENTSCHEIDUNG ───────────────────
//
// Erst LESEN, dann BUCHEN. Zwischen beiden steht eine Tabelle, in der jede
// Zeile sagt, was mit ihr passieren würde: Menge erhöhen, Artikel anlegen,
// oder gar nichts. Ein Import, der beim Einlesen schon schreibt, ist der
// Grund, warum jemand danach einen Bestand von Hand zurückbaut.
//
// ─── DAS EIGENTUM WIRD GEFRAGT, NICHT VORGEGEBEN ───────────────────────────
//
// Was das Haus kauft, ist `owned`; was es zumietet, ist `subhire` — und der
// Unterschied entscheidet, ob das Stück auf der Sub-Hire-Liste erscheint und
// wann es zurückmuss. Eine Vorgabe wäre für die Hälfte der Lieferungen
// falsch, und zwar die teurere Hälfte. Deshalb steht die Auswahl NEBEN dem
// Buchen-Knopf und nicht in den Einstellungen.
//
// ─── WAS DIESE ANSICHT NICHT TUT ───────────────────────────────────────────
//
//   Sie RÄT NICHT, was zu wem gehört. Der Vergleich gegen den Bestand ist
//   exakt (Gross-/Kleinschreibung egal, sonst nichts). Ein Ähnlichkeitsmass
//   zöge früher oder später zwei Artikel zusammen, die das Haus
//   auseinanderhält — und der Fehler fiele erst auf, wenn die
//   Kommissionierliste das Falsche nennt.
//
//   Sie ÜBERSPRINGT KEINE ZEILE STILL. Was nicht lesbar war, steht mit
//   Rohtext und Grund in der Tabelle. Zwölf Positionen im Beleg, elf
//   gebucht, und niemand sieht es — das ist der teuerste Ausgang dieser
//   Ansicht, und dagegen ist sie gebaut.
// ───────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { ocrHindernisText, sprachdatenDa, tesseractErkenner } from '../lib/belegOcr'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { lesen, buchbar, type EingangsEigentum } from '../domain/lib/wareneingang'
import { ownershipLabel } from '../domain/lib/ownership'

type UebersetzFn = (key: string, en: string) => string

const lageText = (lage: 'bekannt' | 'neu' | 'unlesbar', t: UebersetzFn): string =>
  ({
    bekannt: t('receiving.case.raise', 'raise quantity'),
    neu: t('receiving.case.create', 'create item'),
    unlesbar: t('receiving.case.skipped', 'not booked'),
  })[lage]

/** Der Satz zu einem unlesbaren Grund. Die Domäne nennt nur die ART. */
const grundText = (
  grund: { art: 'leer' | 'keineBezeichnung' | 'keineMenge' | 'nichtTrennbar'; wert?: string },
  t: UebersetzFn,
  format: (v: string, w: Record<string, string | number>) => string,
): string => {
  switch (grund.art) {
    case 'leer':
      return t('receiving.reason.empty', 'empty line')
    case 'keineBezeichnung':
      return t('receiving.reason.noName', 'no designation in the first column')
    case 'keineMenge':
      return format(t('receiving.reason.notAQty', '"{value}" is not a quantity'), { value: grund.wert ?? '' })
    case 'nichtTrennbar':
      return t('receiving.reason.notSeparable', 'quantity and designation cannot be told apart')
  }
}

export function Wareneingang() {
  const { t, format } = useT()
  const items = useInventoryStore((s) => s.items)
  const addItem = useInventoryStore((s) => s.addItem)
  const updateItem = useInventoryStore((s) => s.updateItem)

  const [text, setText] = useState('')
  const [eigentum, setEigentum] = useState<EingangsEigentum>('owned')
  const [lieferant, setLieferant] = useState('')
  const [gebucht, setGebucht] = useState<string | null>(null)
  // ── Beleg-Foto ──────────────────────────────────────────────────────────
  // Der erkannte Text landet IM FELD oben und nicht in der Buchung. Damit
  // ist das Foto eine Abkürzung beim Tippen und keine zweite Wahrheit: der
  // Weg über `lesen()` und die Vorschau bleibt der einzige, der schreibt.
  const [ocrLaeuft, setOcrLaeuft] = useState(false)
  const [ocrFehler, setOcrFehler] = useState<string | null>(null)
  const [ocrSicherheit, setOcrSicherheit] = useState<number | null>(null)

  const fotoLesen = async (datei: File) => {
    setOcrFehler(null)
    setOcrSicherheit(null)
    setOcrLaeuft(true)
    try {
      if (!(await sprachdatenDa())) {
        setOcrFehler(ocrHindernisText('sprachdaten-fehlen', t))
        return
      }
      const erkenner = await tesseractErkenner()
      if (!erkenner) {
        setOcrFehler(ocrHindernisText('kein-worker', t))
        return
      }
      const ergebnis = await erkenner.lies(datei)
      // ANGEHÄNGT, nicht ersetzt: wer schon die Hälfte getippt hat, verliert
      // sie nicht, weil er danach noch ein Foto hinzunimmt.
      setText((vorher) => (vorher.trim() ? `${vorher.trimEnd()}\n${ergebnis.text.trim()}` : ergebnis.text.trim()))
      setOcrSicherheit(ergebnis.sicherheit)
      setGebucht(null)
    } catch (e) {
      setOcrFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setOcrLaeuft(false)
    }
  }

  const bericht = useMemo(() => lesen(text, items), [text, items])
  const zuBuchen = useMemo(() => buchbar(bericht), [bericht])

  const buchen = () => {
    let erhoeht = 0
    let angelegt = 0
    for (const z of zuBuchen) {
      if (z.lage === 'bekannt' && z.itemId) {
        const vorher = items.find((i) => i.id === z.itemId)
        if (!vorher) continue
        updateItem(z.itemId, { quantity: vorher.quantity + (z.menge ?? 0) })
        erhoeht += 1
      } else if (z.model) {
        addItem({
          model: z.model,
          quantity: z.menge ?? 0,
          ownership: eigentum,
          ...(lieferant.trim() ? { supplier: lieferant.trim() } : {}),
          // DER PREIS AUS DEM BELEG WIRD NICHT UEBERNOMMEN, und das ist
          // Absicht: auf einem Lieferschein steht ein EINKAUFSPREIS, und das
          // einzige Preisfeld dieses Repos ist `rentPricePerDay` — die
          // Tagesmiete. Beides gleichzusetzen hiesse, die Tagesmiete im
          // Bericht mit Einkaufspreisen zu fuellen; die Summe dort saehe
          // danach vollstaendig aus und waere falsch. Der Einkaufspreis
          // gehoert an die EINHEIT (`anschaffung`), und die entsteht hier
          // nicht — ein Lieferschein nennt keine Seriennummern.
        })
        angelegt += 1
      }
    }
    // Der Beleg bleibt stehen. Wer ihn nach dem Buchen sofort verliert, kann
    // nicht mehr nachsehen, was er gerade getan hat — und die zwei Zeilen
    // ohne Menge stehen ja noch offen.
    // EIN Schlüssel, EIN Satz — nicht zwei Halbsätze aneinandergehängt. Im
    // Deutschen steht das Verb woanders als im Englischen; wer den Satz aus
    // zwei `t()`-Aufrufen baut, bekommt in der einen Sprache Kauderwelsch.
    setGebucht(
      format(t('receiving.booked', '{raised} items raised, {created} items newly created.'), {
        raised: erhoeht,
        created: angelegt,
      }),
    )
  }

  return (
    <section className="eingang">
      <div className="block">
        <h3>{t('receiving.receipt', 'Receipt')}</h3>
        <p className="hinweis">
          {t(
            'receiving.receipt.hint',
            'Type or paste the delivery note lines here — one per line. Readable are "4 x Shure ULXD2", "Shure ULXD2; 4; 249.00" (semicolon or tab, as from a portal) and the bare name. With the bare name the quantity is missing, and it is not invented as 1.',
          )}
        </p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setGebucht(null)
          }}
          rows={8}
          placeholder={'4 x Shure ULXD2\nXLR 3m; 10; 3,50\n2 Manfrotto Stativ'}
          aria-label={t('receiving.lines.aria', 'Delivery note lines')}
        />

        {/* ── Foto statt tippen ─────────────────────────────────────────
            Die Erkennung läuft LOKAL (tesseract.js). Kein Beleg verlässt
            den Rechner — auf einem Lieferschein stehen Kunden- und
            Lieferantennamen. Der Preis dafür ist eine schwächere Erkennung
            bei schlechten Fotos, und genau deshalb landet das Ergebnis im
            Feld darüber: der Mensch liest es, bevor irgendetwas gebucht
            wird. */}
        <div className="zeile">
          <label className="datei-knopf">
            {ocrLaeuft ? t('receiving.ocr.running', 'Reading the receipt…') : t('receiving.ocr.start', 'Read a photo of the receipt')}
            <input
              type="file"
              accept="image/*"
              disabled={ocrLaeuft}
              onChange={(e) => {
                const datei = e.target.files?.[0]
                e.target.value = ''
                if (datei) void fotoLesen(datei)
              }}
              aria-label={t('receiving.ocr.aria', 'Photo or scan of the delivery note')}
            />
          </label>
          {ocrSicherheit !== null && (
            <span className="leise">
              {/* Die Zahl steht da und ist KEINE Schwelle im Code: eine
                  Grenze, ab der ein Ergebnis „gut" ist, wäre eine
                  Behauptung über fremde Fotos. */}
              {format(t('receiving.ocr.confidence', 'Recognition {n} % confident — please read the lines through.'), { n: ocrSicherheit })}
            </span>
          )}
        </div>
        {ocrFehler && <p className="warnung">{ocrFehler}</p>}
      </div>

      {bericht.zeilen.length > 0 && (
        <div className="block">
          <h3>{t('receiving.preview', 'What this would become')}</h3>
          <p className={bericht.unlesbar > 0 ? 'warnung' : 'hinweis'}>
            {/*
              Ein Satz, kein Baukasten. Die unlesbaren zuerst: sie sind das
              Einzige, was der Mensch JETZT beheben muss.
            */}
            {bericht.unlesbar > 0
              ? bericht.unlesbar === 1
                ? t('receiving.unreadable.one', 'One line is not readable and will not be booked — it is listed below with the reason.')
                : format(
                    t(
                      'receiving.unreadable.many',
                      '{n} lines are not readable and will not be booked — they are listed below with the reason.',
                    ),
                    { n: bericht.unlesbar },
                  )
              : t('receiving.allReadable', 'Every line is readable.')}
          </p>
          <div className="tabelle-rahmen">
            <table>
              <thead>
                <tr>
                  <th>{t('receiving.col.line', 'Line')}</th>
                  <th>{t('receiving.col.item', 'Item')}</th>
                  <th className="rechts">{t('receiving.col.qty', 'Qty')}</th>
                  <th>{t('receiving.col.becomes', 'becomes')}</th>
                  <th className="rechts">{t('receiving.col.after', 'Stock after')}</th>
                </tr>
              </thead>
              <tbody>
                {bericht.zeilen.map((z, i) => (
                  <tr key={i} className={`lage-${z.lage}`}>
                    <td className="leise">{z.roh}</td>
                    <td>{z.model ?? ''}</td>
                    {/*
                      Fehlt die Menge, steht hier „—" und nicht 0: null ist
                      die Aussage „nichts geliefert", und das ist etwas
                      anderes als „im Beleg stand keine Zahl".
                    */}
                    <td className="rechts">{z.menge ?? '—'}</td>
                    <td>
                      {lageText(z.lage, t)}
                      {z.lage !== 'unlesbar' && z.menge === undefined
                        ? <span className="leise"> · {t('receiving.noQty', 'no quantity, open')}</span>
                        : null}
                      {z.grund ? <span className="leise"> · {grundText(z.grund, t, format)}</span> : null}
                    </td>
                    <td className="rechts">{z.neueMenge ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="zeile">
            <label>
              {t('receiving.ownership', 'Ownership')}
              <select
                value={eigentum}
                onChange={(e) => setEigentum(e.target.value as EingangsEigentum)}
                aria-label={t('receiving.ownership.aria', 'Ownership of the new items')}
              >
                {(['owned', 'rented', 'subhire'] as EingangsEigentum[]).map((o) => (
                  <option key={o} value={o}>
                    {ownershipLabel(o, t)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('receiving.supplier', 'Supplier')}
              <input
                value={lieferant}
                onChange={(e) => setLieferant(e.target.value)}
                placeholder={t('receiving.optional', 'optional')}
                aria-label={t('receiving.supplier', 'Supplier')}
              />
            </label>
            <button type="button" onClick={buchen} disabled={zuBuchen.length === 0}>
              {zuBuchen.length === 1
                ? t('receiving.book.one', 'Book 1 line')
                : format(t('receiving.book.many', 'Book {n} lines'), { n: zuBuchen.length })}
            </button>
          </div>
          <p className="hinweis">
            {t(
              'receiving.ownership.hint',
              'The ownership applies to the items that are newly CREATED. What the house hires in belongs on the sub-hire list — a default would be wrong for half of all deliveries, and for the more expensive half.',
            )}
          </p>
          {gebucht && (
            <p className="hinweis" role="status">
              {gebucht} {t('receiving.booked.hint', 'The receipt stays on screen so it can be checked what just happened.')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
