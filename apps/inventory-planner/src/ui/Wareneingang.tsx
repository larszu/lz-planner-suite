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
import { OCR_HINDERNIS_TEXT, sprachdatenDa, tesseractErkenner } from '../lib/belegOcr'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { lesen, buchbar, type EingangsEigentum } from '../domain/lib/wareneingang'
import { OWNERSHIP_LABEL } from '../domain/lib/ownership'

const LAGE_TEXT = {
  bekannt: 'Menge erhöhen',
  neu: 'Artikel anlegen',
  unlesbar: 'nicht gebucht',
} as const

export function Wareneingang() {
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
        setOcrFehler(OCR_HINDERNIS_TEXT['sprachdaten-fehlen'])
        return
      }
      const erkenner = await tesseractErkenner()
      if (!erkenner) {
        setOcrFehler(OCR_HINDERNIS_TEXT['kein-worker'])
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
    setGebucht(
      `${erhoeht === 1 ? '1 Artikel' : `${erhoeht} Artikel`} erhöht, ` +
        `${angelegt === 1 ? '1 Artikel' : `${angelegt} Artikel`} neu angelegt.`,
    )
  }

  return (
    <section className="eingang">
      <div className="block">
        <h3>Beleg</h3>
        <p className="hinweis">
          Positionen aus dem Lieferschein hier hineinschreiben oder einfügen —
          eine je Zeile. Lesbar sind <code>4 x Shure ULXD2</code>,{' '}
          <code>Shure ULXD2; 4; 249,00</code> (Semikolon oder Tabulator, wie aus
          einem Portal) und der blosse Name. Beim blossen Namen fehlt die Menge,
          und sie wird nicht als 1 erfunden.
        </p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setGebucht(null)
          }}
          rows={8}
          placeholder={'4 x Shure ULXD2\nXLR 3m; 10; 3,50\n2 Manfrotto Stativ'}
          aria-label="Positionen des Lieferscheins"
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
            {ocrLaeuft ? 'Beleg wird gelesen…' : 'Beleg-Foto einlesen'}
            <input
              type="file"
              accept="image/*"
              disabled={ocrLaeuft}
              onChange={(e) => {
                const datei = e.target.files?.[0]
                e.target.value = ''
                if (datei) void fotoLesen(datei)
              }}
              aria-label="Foto oder Scan des Lieferscheins"
            />
          </label>
          {ocrSicherheit !== null && (
            <span className="leise">
              {/* Die Zahl steht da und ist KEINE Schwelle im Code: eine
                  Grenze, ab der ein Ergebnis „gut" ist, wäre eine
                  Behauptung über fremde Fotos. */}
              Erkennung {ocrSicherheit} % sicher — Zeilen bitte durchsehen.
            </span>
          )}
        </div>
        {ocrFehler && <p className="warnung">{ocrFehler}</p>}
      </div>

      {bericht.zeilen.length > 0 && (
        <div className="block">
          <h3>Was daraus würde</h3>
          <p className={bericht.unlesbar > 0 ? 'warnung' : 'hinweis'}>
            {/*
              Ein Satz, kein Baukasten. Die unlesbaren zuerst: sie sind das
              Einzige, was der Mensch JETZT beheben muss.
            */}
            {bericht.unlesbar > 0
              ? `${bericht.unlesbar === 1 ? 'Eine Zeile ist' : `${bericht.unlesbar} Zeilen sind`} nicht lesbar und wird nicht gebucht — sie steht unten mit dem Grund.`
              : 'Jede Zeile ist lesbar.'}
          </p>
          <div className="tabelle-rahmen">
            <table>
              <thead>
                <tr>
                  <th>Zeile</th>
                  <th>Artikel</th>
                  <th className="rechts">Menge</th>
                  <th>daraus</th>
                  <th className="rechts">Bestand danach</th>
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
                      {LAGE_TEXT[z.lage]}
                      {z.lage !== 'unlesbar' && z.menge === undefined
                        ? <span className="leise"> · ohne Menge, offen</span>
                        : null}
                      {z.grund ? <span className="leise"> · {z.grund}</span> : null}
                    </td>
                    <td className="rechts">{z.neueMenge ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="zeile">
            <label>
              Eigentum
              <select
                value={eigentum}
                onChange={(e) => setEigentum(e.target.value as EingangsEigentum)}
                aria-label="Eigentum der neuen Artikel"
              >
                {(['owned', 'rented', 'subhire'] as EingangsEigentum[]).map((o) => (
                  <option key={o} value={o}>
                    {OWNERSHIP_LABEL[o]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Lieferant
              <input
                value={lieferant}
                onChange={(e) => setLieferant(e.target.value)}
                placeholder="optional"
                aria-label="Lieferant"
              />
            </label>
            <button type="button" onClick={buchen} disabled={zuBuchen.length === 0}>
              {zuBuchen.length === 1 ? '1 Zeile buchen' : `${zuBuchen.length} Zeilen buchen`}
            </button>
          </div>
          <p className="hinweis">
            Das Eigentum gilt für die Artikel, die NEU angelegt werden. Was das
            Haus zumietet, gehört auf die Sub-Hire-Liste — eine Vorgabe wäre für
            die Hälfte der Lieferungen falsch, und zwar die teurere Hälfte.
          </p>
          {gebucht && (
            <p className="hinweis" role="status">
              {gebucht} Der Beleg bleibt stehen, damit nachsehbar ist, was
              gerade passiert ist.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
