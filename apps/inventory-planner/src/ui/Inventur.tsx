// ───────────────────────────────────────────────────────────────────────────
// Inventur — „liegt das hier, was hier liegen soll?"
//
// ─── WARUM ES DIESE DATEI GIBT (B-65) ──────────────────────────────────────
//
// `inventoryAudit.ts` sind 390 Zeilen fertige, getestete Rechnung: sie ordnet
// einen gescannten Code am geprüften Ort ein, kennt den Unterschied zwischen
// „falscher Ort" und „gar kein Ort hinterlegt", zählt den Teilbaum mit,
// unterscheidet Ablesung von Behauptung (`scan` gegen `pick`) und weiß, was
// FEHLT. `inventoryScan.ts` löst dazu Codes gegen Einheiten, Lagerorte und
// Artikel auf.
//
// Von der Oberfläche aus war davon nichts erreichbar. Nachgerechnet am
// Import-Graph ab `ui/App.tsx`: von 18 Modulen unter `domain/lib/` waren
// zehn von keinem Weg aus erreichbar, diese beiden darunter. Für den
// Lageristen ist Code, den kein Knopf erreicht, kein Code — dieselbe
// Defektform wie ein Feld, das nur beschrieben und nie gelesen wird.
//
// ─── DIE FORM STAMMT AUS DER MELDUNG DES EIGENTÜMERS ────────────────────────
//
// Er schickte Bildschirmfotos einer fremden Bestands-App: „Schritt 1:
// Lagerplatz scannen · Erwarteter Prefix: L#", darunter Auswahllisten und
// „Ohne Scan einbuchen". Drei Dinge daran sind hier übernommen, und zwar
// weil sie im Lager stimmen und nicht weil sie dort standen:
//
//   1. ZWEI SCHRITTE, IN DIESER REIHENFOLGE. Erst der Ort, dann das Objekt.
//      Ein Objekt ohne Ort ist keine Inventur-Zeile — die ganze Auskunft von
//      `auditScan` hängt daran, WO der Mensch steht.
//   2. DER ERWARTETE PREFIX. Wer das Etikett am Case scannt statt das am
//      Regal, bekommt es gesagt, bevor er hundert Objekte am falschen Ort
//      verbucht. Der Prefix ist eine Hausregel, keine Norm — er ist deshalb
//      einstellbar und darf leer sein.
//   3. DER WEG OHNE SCAN. Ein Etikett wird unlesbar, ein Scanner leer. Die
//      Liste „was hier liegen soll" ist genau dieser Weg — und sie ist
//      zugleich das, was eine Inventur überhaupt erst vollständig macht.
//
// ─── WAS DIESE ANSICHT NICHT TUT ───────────────────────────────────────────
//
//   Sie SCHREIBT NICHTS in den Bestand. Eine Inventur stellt fest; was
//   daraus folgt (umlagern, nachtragen, abschreiben), ist eine Entscheidung
//   und gehört an die Stelle, die sie verantwortet. `auditRelocations`
//   liefert dafür die Liste — der Knopf dazu ist der nächste Schritt, nicht
//   dieser.
//
// ─── NACHTRAG: DIE KAMERA IST DAZUGEKOMMEN (B-65, sechste Zeile) ───────────
//
// Hier stand „Sie ÖFFNET KEINE KAMERA … ein halb gebauter Kamera-Knopf, der
// auf dem Rechner des Lageristen nichts tut, wäre schlechter als keiner."
// Der Satz war richtig, und er hat den Bau dieser Zeile geführt: der Knopf
// erscheint nur, wo er wirklich etwas tut, und sonst steht dort der GRUND.
//
// Nachgemessen 2026-09-10 in genau der Chromium-Fassung, die dieses Projekt
// baut und als Electron ausliefert: `navigator.mediaDevices` ist da (auch
// unter `file://`), `window.BarcodeDetector` NICHT. Die native Schnittstelle
// liegt auf Android und ChromeOS, auf Linux- und Windows-Desktops nicht. Ein
// Knopf ohne diese Prüfung öffnete im Lagerbüro eine Kamera, die nie einen
// Code erkennt — und der Lagerist hielte sein Case so lange davor, bis er
// glaubt, das Etikett sei kaputt.
//
// `scanFaehigkeit()` in `lib/codeLeser.ts` entscheidet das, mit vier
// unterscheidbaren Gründen. Der Handscanner (er tippt in das Feld) und
// „Ohne Scan wählen" bleiben unverändert die Wege, die überall gehen — die
// Kamera kommt DANEBEN und ersetzt nichts.
//
//   Der Weg zum Desktop führt über ein mitgeliefertes WASM (zxing-wasm,
//   MIT). Der Eigentümer hat es am 2026-09-10 gewählt, und seitdem ist der
//   Scan überall derselbe — auf dem Telefon in der Halle wie auf dem
//   Rechner im Lagerbüro. Das Megabyte liegt hinter einem `import()` und
//   wird erst geladen, wenn jemand die Kamera aufmacht; das Haupt-Bündel
//   bleibt, wie es war. Welcher Leser antwortet, entscheidet
//   `waehleLeser()`: der native, wenn es ihn gibt, sonst das WASM.
//
//   Sie SCHREIBT WEITERHIN NICHTS in den Bestand — auch nicht über die
//   Kamera. Ein Kamera-Treffer geht durch dieselbe `auditScan`-Zeile wie ein
//   getippter Code.
// ───────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInventoryStore } from '../domain/store/inventoryStore'
import { nodePathLabel } from '../domain/lib/storageTree'
import {
  scanFaehigkeit,
  waehleLeser,
  einLesen,
  hindernisText,
} from '../lib/codeLeser'
import {
  auditPick,
  auditScan,
  auditTable,
  expectedAt,
  missingAt,
  auditLabel,
  auditViaLabel,
  noCode,
  type AuditCandidate,
  type AuditHit,
} from '../domain/lib/inventoryAudit'
import { toCsv } from '../lib/csv'
import { useT } from '../i18n'

/**
 * Die Hausregel für Lagerplatz-Codes.
 *
 * Nicht fest verdrahtet: welches Präfix ein Haus vergibt, ist seine Sache.
 * Leer heißt „keine Regel" — dann prüft nichts, und die Ansicht sagt das
 * auch, statt eine Prüfung vorzutäuschen.
 */
const PREFIX_KEY = 'avplan.lager.platzPrefix'

const ladePrefix = (): string => {
  try {
    return localStorage.getItem(PREFIX_KEY) ?? ''
  } catch {
    return ''
  }
}

export function Inventur() {
  const { t, format } = useT()
  const items = useInventoryStore((s) => s.items)
  const nodes = useInventoryStore((s) => s.nodes)
  const units = useInventoryStore((s) => s.units)

  const [prefix, setPrefix] = useState(ladePrefix)
  const [ortCode, setOrtCode] = useState('')
  const [ortId, setOrtId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [treffer, setTreffer] = useState<AuditHit[]>([])
  const [meldung, setMeldung] = useState<string | null>(null)
  const codeFeld = useRef<HTMLInputElement>(null)

  const quellen = useMemo(() => ({ items, nodes, units }), [items, nodes, units])

  const erwartet = useMemo(
    () => (ortId ? expectedAt(ortId, quellen) : []),
    [ortId, quellen],
  )
  const fehlend = useMemo(
    () => (ortId ? missingAt(ortId, quellen, treffer) : []),
    [ortId, quellen, treffer],
  )

  const prefixSichern = (wert: string) => {
    setPrefix(wert)
    try {
      localStorage.setItem(PREFIX_KEY, wert)
    } catch {
      /* privater Modus — der Prefix gilt dann für diese Sitzung */
    }
  }

  // ── Schritt 1: der Ort ──────────────────────────────────────────────────
  const ortSetzen = (roh: string) => {
    const c = roh.trim()
    setOrtCode(c)
    if (!c) {
      setOrtId(null)
      setMeldung(null)
      return
    }
    // Der Prefix wird geprüft, BEVOR gesucht wird. Ein Case-Etikett trifft
    // sonst einen echten Knoten, und der Fehlgriff fällt nie auf.
    if (prefix && !c.toLowerCase().startsWith(prefix.toLowerCase())) {
      setOrtId(null)
      setMeldung(
        format(
          t(
            'audit.prefixMismatch',
            '"{code}" does not start with "{prefix}". That is the code of a storage place in the house — if it sits on a case instead of a shelf, the stocktake starts at the wrong place.',
          ),
          { code: c, prefix },
        ),
      )
      return
    }
    const knoten = nodes.find(
      (n) => (n.code ?? '').trim().toLowerCase() === c.toLowerCase(),
    )
    if (!knoten) {
      setOrtId(null)
      setMeldung(format(t('audit.noSuchPlace', 'No storage place with the code "{code}".'), { code: c }))
      return
    }
    setOrtId(knoten.id)
    setMeldung(null)
    setTreffer([])
    window.setTimeout(() => codeFeld.current?.focus(), 0)
  }

  // ── Die Kamera ──────────────────────────────────────────────────────────
  //
  // Die Faehigkeit wird EINMAL beim Mounten gemessen, nicht bei jedem
  // Rendern: sie aendert sich nicht, und eine Messung im Render-Pfad waere
  // eine Zusicherung, die je nach Zeitpunkt anders ausfaellt.
  const [faehigkeit] = useState(() => scanFaehigkeit())
  const [kameraAn, setKameraAn] = useState(false)
  const [kameraFehler, setKameraFehler] = useState<string | null>(null)
  const [lampeAn, setLampeAn] = useState(false)
  const [hatLampe, setHatLampe] = useState(false)
  const [hinten, setHinten] = useState(true)
  const video = useRef<HTMLVideoElement | null>(null)
  const strom = useRef<MediaStream | null>(null)
  const zuletztGesehen = useRef(new Map<string, number>())

  const kameraAus = useCallback(() => {
    // Der Strom wird AUSDRUECKLICH gestoppt und nicht dem Garbage Collector
    // ueberlassen: eine laufende Kameraleuchte neben einer geschlossenen
    // Ansicht ist fuer den Menschen davor ein Geraet, das ihn filmt.
    strom.current?.getTracks().forEach((t) => t.stop())
    strom.current = null
    if (video.current) video.current.srcObject = null
    setKameraAn(false)
    setLampeAn(false)
    setHatLampe(false)
  }, [])

  // Beim Verlassen der Ansicht geht die Kamera aus — siehe oben.
  useEffect(() => kameraAus, [kameraAus])

  const kameraStarten = async () => {
    if (!faehigkeit.moeglich) return
    setKameraFehler(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        // `facingMode` statt einer Geraete-Id: welche Kamera „hinten" ist,
        // weiss das Geraet besser als eine Liste, die wir sortieren.
        video: { facingMode: hinten ? 'environment' : 'user' },
      })
      strom.current = s
      if (video.current) {
        video.current.srcObject = s
        await video.current.play()
      }
      const spur = s.getVideoTracks()[0]
      // Die Taschenlampe gibt es nur an manchen Geraeten. Der Knopf
      // erscheint deshalb nur, wenn die Spur sie WIRKLICH kann — dieselbe
      // Regel wie beim Scan-Knopf selbst.
      const faehig = spur?.getCapabilities?.() as { torch?: boolean } | undefined
      setHatLampe(faehig?.torch === true)
      setKameraAn(true)
    } catch (e) {
      // `NotAllowedError` heisst: der Mensch hat abgelehnt. Das ist keine
      // Stoerung, sondern eine Antwort — und sie bekommt ihren eigenen Satz.
      const abgelehnt = e instanceof DOMException && e.name === 'NotAllowedError'
      setKameraFehler(
        abgelehnt ? hindernisText('keine-erlaubnis', t) : e instanceof Error ? e.message : String(e),
      )
      kameraAus()
    }
  }

  const lampeSchalten = async () => {
    const spur = strom.current?.getVideoTracks()[0]
    if (!spur) return
    const neu = !lampeAn
    try {
      await spur.applyConstraints({ advanced: [{ torch: neu } as MediaTrackConstraintSet] })
      setLampeAn(neu)
    } catch (e) {
      setKameraFehler(e instanceof Error ? e.message : String(e))
    }
  }

  const kameraWechseln = async () => {
    const nachHinten = !hinten
    setHinten(nachHinten)
    if (!kameraAn) return
    kameraAus()
    // Der Wechsel geht ueber Stoppen und neu Anfordern: zwei Stroeme
    // gleichzeitig halten manche Geraete gar nicht erst.
    setTimeout(() => void kameraStarten(), 0)
  }

  // ── Die Lese-Schleife ───────────────────────────────────────────────────
  //
  // Der Takt gehoert der Ansicht, das Lesen dem Modul: `einLesen` macht
  // genau einen Versuch und ist deshalb ohne Kamera getestet.
  //
  // DER UEBERSETZER LIEGT IN EINEM REF und steht nicht in den
  // Abhaengigkeiten. Er gehoert dort hin — der Effekt benutzt ihn —, aber
  // eine neue `t`-Fassung entsteht bei JEDEM Rendern, und der Effekt wuerde
  // dann die Kamera-Schleife abbauen und neu aufsetzen (samt Nachladen des
  // WASM-Lesers), mitten in einer laufenden Inventur. Der Ref haelt die
  // aktuelle Fassung bereit, ohne den Effekt anzufassen; die Meldung ist
  // damit in der Sprache, die beim Scheitern gilt, und nicht in der von vor
  // dem Umschalten.
  //
  // Nachgefuehrt wird er in einem EIGENEN Effekt und nicht beim Rendern: ein
  // Ref waehrend des Renderns zu beschreiben ist ein Seiteneffekt in einer
  // Funktion, die keinen haben darf — React darf sie verwerfen und noch
  // einmal aufrufen.
  const uebersetzer = useRef(t)
  useEffect(() => {
    uebersetzer.current = t
  }, [t])

  useEffect(() => {
    if (!kameraAn || !ortId) return
    let laeuft = true
    let takt = 0
    // Der Leser kommt jetzt ASYNCHRON: der native ist sofort da, das WASM
    // wird geladen. Bis es da ist, laeuft kein Takt — ein Takt ohne Leser
    // waere eine Kamera, die zusieht und nichts tut.
    void waehleLeser().then((leser) => {
      if (!laeuft) return
      if (!leser) {
        setKameraFehler(hindernisText('kein-decoder', uebersetzer.current))
        return
      }
      takt = window.setInterval(() => {
        const v = video.current
        if (!laeuft || !v || v.readyState < 2) return
        void einLesen(leser, v, zuletztGesehen.current, Date.now(), {
          aufCode: (c) => setTreffer((bisher) => [auditScan(c, ortId, quellen), ...bisher]),
          aufFehler: (m) => setKameraFehler(m),
        })
      }, 250)
    })
    return () => {
      laeuft = false
      if (takt) window.clearInterval(takt)
    }
  }, [kameraAn, ortId, quellen])

  // ── Schritt 2: die Objekte ──────────────────────────────────────────────
  const scannen = () => {
    if (!ortId) return
    const c = code.trim()
    if (!c) return
    setTreffer((t) => [auditScan(c, ortId, quellen), ...t])
    setCode('')
  }

  const abhaken = (k: AuditCandidate) => {
    if (!ortId) return
    setTreffer((t) => [auditPick(k, ortId, quellen), ...t])
  }

  const blattLaden = () => {
    if (!ortId) return
    const tabelle = auditTable(treffer, nodes, ortId, fehlend, t)
    // `toCsv` nimmt Kopfzeile und Zeilen getrennt — `auditTable` liefert
    // beides als `CsvTable`. Die BOM bleibt eingeschaltet (Vorgabe): das
    // Blatt landet in Excel, und ohne sie stehen dort „Geprüft an" und
    // „Erwartet in" als Buchstabensalat.
    const url = URL.createObjectURL(
      new Blob([toCsv(tabelle.headers, tabelle.rows)], { type: 'text/csv;charset=utf-8' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `inventur-${(ortCode || 'lager').replace(/[^\w.-]+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const erfasst = new Set(
    treffer.map((h) => (h.unitId ? `u:${h.unitId}` : h.itemId ? `i:${h.itemId}` : '')),
  )

  return (
    <section className="inventur">
      {/* ── Schritt 1 ────────────────────────────────────────────────── */}
      <div className="schritt">
        <h2>{t('audit.step1', 'Step 1: storage place')}</h2>
        <div className="zeile">
          <label>
            {t('audit.code', 'Code')}
            <input
              value={ortCode}
              onChange={(e) => ortSetzen(e.target.value)}
              placeholder={prefix ? `${prefix}…` : t('audit.code.placeholder', 'Code of the shelf / room')}
              aria-label={t('audit.code.aria', 'Code of the storage place')}
              autoFocus
            />
          </label>
          <label>
            {t('audit.prefix', 'Expected prefix')}
            <input
              value={prefix}
              onChange={(e) => prefixSichern(e.target.value)}
              placeholder={t('audit.prefix.placeholder', 'e.g. L#')}
              aria-label={t('audit.prefix.aria', 'Expected prefix for storage places')}
              size={8}
            />
          </label>
        </div>
        {/*
          Der Weg ohne Scan. Er steht NEBEN dem Feld und nicht hinter einem
          zweiten Knopf: ein unlesbares Etikett ist kein Sonderfall.
        */}
        <label className="ohne-scan">
          {t('audit.pickWithoutScan', 'Choose without scanning')}
          <select
            value={ortId ?? ''}
            onChange={(e) => {
              const n = nodes.find((x) => x.id === e.target.value)
              setOrtId(n?.id ?? null)
              setOrtCode(n?.code ?? '')
              setMeldung(null)
              setTreffer([])
            }}
            aria-label={t('audit.pick.aria', 'Choose a storage place from the list')}
          >
            <option value="">— {t('audit.place', 'Storage place')} —</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {nodePathLabel(nodes, n.id)}
              </option>
            ))}
          </select>
        </label>
        {meldung && (
          <p className="warnung" role="alert">
            {meldung}
          </p>
        )}
        {!prefix && (
          <p className="hinweis">
            {t(
              'audit.noPrefix',
              'No prefix stored — then nothing is checked at this point. Enter the house rule if there is one.',
            )}
          </p>
        )}
      </div>

      {/* ── Schritt 2 ────────────────────────────────────────────────── */}
      {ortId === null ? (
        <p className="leer">
          {t(
            'audit.placeFirst',
            'The place first, then the objects. Without it no line can say whether something sits in the right spot — and that is the whole question of a stocktake.',
          )}
        </p>
      ) : (
        <>
          <div className="schritt">
            <h2>{format(t('audit.step2', 'Step 2: objects at {place}'), { place: nodePathLabel(nodes, ortId) })}</h2>
            <div className="zeile">
              <input
                ref={codeFeld}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  // Ein Handscanner tippt und schickt Enter. Genau das ist
                  // hier der Auslöser — kein Knopf dazwischen.
                  if (e.key === 'Enter') scannen()
                }}
                placeholder={t('audit.scan.placeholder', 'Scan or type the code, Enter')}
                aria-label={t('audit.scan.aria', 'Code of the object')}
              />
              <button type="button" onClick={scannen} disabled={!code.trim()}>
                {t('audit.record', 'Record')}
              </button>
              <button type="button" onClick={blattLaden} disabled={treffer.length === 0 && fehlend.length === 0}>
                {t('audit.sheet', 'Download sheet (CSV)')}
              </button>
            </div>

            {/* ── Kamera ─────────────────────────────────────────────── */}
            {faehigkeit.moeglich ? (
              <div className="kamera">
                <div className="zeile">
                  <button type="button" onClick={kameraAn ? kameraAus : () => void kameraStarten()}>
                    {kameraAn ? t('audit.cam.off', 'Camera off') : t('audit.cam.on', 'Scan with the camera')}
                  </button>
                  {kameraAn && (
                    <>
                      <button type="button" onClick={() => void kameraWechseln()}>
                        {hinten ? t('audit.cam.front', 'To front camera') : t('audit.cam.back', 'To rear camera')}
                      </button>
                      {/*
                        Der Lampen-Knopf erscheint nur, wenn die Spur die
                        Taschenlampe WIRKLICH kann. Ein Knopf, der auf dem
                        Laptop nichts tut, ist derselbe Fehler wie ein
                        Scan-Knopf ohne Leser — nur eine Ebene tiefer.
                      */}
                      {hatLampe && (
                        <button type="button" onClick={() => void lampeSchalten()}>
                          {lampeAn ? t('audit.torch.off', 'Light off') : t('audit.torch.on', 'Light on')}
                        </button>
                      )}
                    </>
                  )}
                </div>
                {/*
                  Das Video steht auch ohne Strom im Baum: `srcObject` wird
                  auf ein bereits gemountetes Element gesetzt, und ein
                  Element, das erst mit dem Strom entsteht, ist beim Setzen
                  noch nicht da.
                */}
                <video
                  ref={video}
                  className={kameraAn ? 'sucher' : 'sucher aus'}
                  muted
                  playsInline
                  aria-label={t('audit.viewfinder', 'Camera viewfinder')}
                />
                {kameraAn && (
                  <p className="hinweis">
                    {t(
                      'audit.cam.hint',
                      'Recognised codes land in the same list as typed ones. Holding the same label in front of the camera twice gives two lines — with a lock of one and a half seconds in between, so a sticker in frame does not produce thirty lines a second.',
                    )}
                  </p>
                )}
              </div>
            ) : (
              /*
                KEIN toter Knopf, sondern der Grund. Welcher es ist,
                entscheidet `scanFaehigkeit()` — und die vier Gründe führen zu
                verschiedenen nächsten Schritten, deshalb steht hier der eine,
                der zutrifft, und nicht „Kamera nicht verfügbar".
              */
              <p className="hinweis">
                <strong>{t('audit.noCam', 'No camera scanning on this device.')}</strong>{' '}
                {hindernisText(faehigkeit.grund, t)}
              </p>
            )}
            {kameraFehler && (
              <p className="warnung" role="alert">
                {kameraFehler}
              </p>
            )}
          </div>

          <div className="spalten">
            <div>
              <h3>{format(t('audit.expectedHere', 'Should be here ({n})'), { n: erwartet.length })}</h3>
              {erwartet.length === 0 ? (
                <p className="hinweis">
                  {t(
                    'audit.nothingExpected',
                    'The record places nothing here. That is something other than "there is nothing here" — it can also mean that a location was never stored for the objects here.',
                  )}
                </p>
              ) : (
                <ul className="abhaken">
                  {erwartet.map((k) => (
                    <li key={k.key} className={erfasst.has(k.key) ? 'erledigt' : ''}>
                      <button
                        type="button"
                        onClick={() => abhaken(k)}
                        disabled={erfasst.has(k.key)}
                      >
                        {erfasst.has(k.key) ? '✓' : t('audit.isHere', 'is here')}
                      </button>
                      <span>{k.label}</span>
                      {k.model && k.model !== k.label && <em>{k.model}</em>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3>{format(t('audit.recorded', 'Recorded ({n})'), { n: treffer.length })}</h3>
              {treffer.length === 0 ? (
                <p className="hinweis">{t('audit.nothingRecorded', 'Nothing recorded yet.')}</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>{t('audit.col.outcome', 'Result')}</th>
                      <th>{t('audit.col.viaShort', 'How')}</th>
                      <th>{t('audit.col.code', 'Code')}</th>
                      <th>{t('audit.col.object', 'Object')}</th>
                      <th>{t('audit.col.expected', 'Expected in')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treffer.map((h, i) => (
                      <tr key={`${h.code}-${i}`} className={`ergebnis-${h.outcome}`}>
                        <td>{auditLabel(h.outcome, t)}</td>
                        <td>{auditViaLabel(h.via, t)}</td>
                        <td>{h.code || noCode(t)}</td>
                        <td>{h.label || '—'}</td>
                        <td>{h.expected ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/*
            Das eigentliche Ergebnis einer Inventur. Es steht bewusst UNTEN
            und nicht in der Erfasst-Liste: was fehlt, ist keine Erfassung.
          */}
          <div className="schritt">
            <h3>{format(t('audit.missing', 'Missing ({n})'), { n: fehlend.length })}</h3>
            {fehlend.length === 0 ? (
              <p className="hinweis">
                {erwartet.length === 0
                  ? t('audit.missing.none', 'Nothing was expected here — so nothing can be missing either.')
                  : t('audit.missing.allFound', 'Everything that should be here has been recorded.')}
              </p>
            ) : (
              <ul className="fehlt">
                {fehlend.map((k) => (
                  <li key={k.key}>
                    {k.label}
                    {k.model && k.model !== k.label ? ` · ${k.model}` : ''} — {t('audit.expectedIn', 'expected in')} {k.expected}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  )
}
