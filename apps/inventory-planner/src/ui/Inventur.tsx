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
//   Der Weg zum Desktop führte über ein mitgeliefertes WASM (zxing-wasm,
//   MIT, ~1 MB gegen 260 kB heutigen Bundle). Ob dieses Megabyte hier
//   hineingehört, ist eine Eigentümer-Frage und steht im Backlog — sie ist
//   hier NICHT still entschieden, sondern offen gelassen: `CodeLeser` ist
//   eine Schnittstelle mit einer Methode, ein zweiter Leser ist ein Modul
//   und keine Umbaustelle.
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
  nativerLeser,
  einLesen,
  HINDERNIS_TEXT,
} from '../lib/codeLeser'
import {
  auditPick,
  auditScan,
  auditTable,
  expectedAt,
  missingAt,
  AUDIT_LABEL,
  AUDIT_VIA_LABEL,
  NO_CODE,
  type AuditCandidate,
  type AuditHit,
} from '../domain/lib/inventoryAudit'
import { toCsv } from '../lib/csv'

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
        `„${c}" fängt nicht mit „${prefix}" an. Das ist die Kennung eines ` +
          'Lagerplatzes im Haus — steht sie am Case statt am Regal, wird ' +
          'gleich am falschen Ort inventiert.',
      )
      return
    }
    const knoten = nodes.find(
      (n) => (n.code ?? '').trim().toLowerCase() === c.toLowerCase(),
    )
    if (!knoten) {
      setOrtId(null)
      setMeldung(`Kein Lagerplatz mit der Kennung „${c}".`)
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
        abgelehnt ? HINDERNIS_TEXT['keine-erlaubnis'] : e instanceof Error ? e.message : String(e),
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
  useEffect(() => {
    if (!kameraAn || !ortId) return
    const leser = nativerLeser()
    if (!leser) return
    let laeuft = true
    const takt = window.setInterval(() => {
      const v = video.current
      if (!laeuft || !v || v.readyState < 2) return
      void einLesen(leser, v, zuletztGesehen.current, Date.now(), {
        aufCode: (c) => setTreffer((t) => [auditScan(c, ortId, quellen), ...t]),
        aufFehler: (m) => setKameraFehler(m),
      })
    }, 250)
    return () => {
      laeuft = false
      window.clearInterval(takt)
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
    const tabelle = auditTable(treffer, nodes, ortId, fehlend)
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
        <h2>Schritt 1: Lagerplatz</h2>
        <div className="zeile">
          <label>
            Kennung
            <input
              value={ortCode}
              onChange={(e) => ortSetzen(e.target.value)}
              placeholder={prefix ? `${prefix}…` : 'Kennung des Regals / Raums'}
              aria-label="Kennung des Lagerplatzes"
              autoFocus
            />
          </label>
          <label>
            Erwarteter Prefix
            <input
              value={prefix}
              onChange={(e) => prefixSichern(e.target.value)}
              placeholder="z. B. L#"
              aria-label="Erwarteter Prefix für Lagerplätze"
              size={8}
            />
          </label>
        </div>
        {/*
          Der Weg ohne Scan. Er steht NEBEN dem Feld und nicht hinter einem
          zweiten Knopf: ein unlesbares Etikett ist kein Sonderfall.
        */}
        <label className="ohne-scan">
          Ohne Scan wählen
          <select
            value={ortId ?? ''}
            onChange={(e) => {
              const n = nodes.find((x) => x.id === e.target.value)
              setOrtId(n?.id ?? null)
              setOrtCode(n?.code ?? '')
              setMeldung(null)
              setTreffer([])
            }}
            aria-label="Lagerplatz aus der Liste wählen"
          >
            <option value="">— Lagerplatz —</option>
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
            Kein Prefix hinterlegt — dann prüft an dieser Stelle nichts. Trage
            die Hausregel ein, wenn es eine gibt.
          </p>
        )}
      </div>

      {/* ── Schritt 2 ────────────────────────────────────────────────── */}
      {ortId === null ? (
        <p className="leer">
          Erst der Ort, dann die Objekte. Ohne ihn kann keine Zeile sagen, ob
          etwas am richtigen Platz liegt — das ist die ganze Frage einer
          Inventur.
        </p>
      ) : (
        <>
          <div className="schritt">
            <h2>Schritt 2: Objekte an {nodePathLabel(nodes, ortId)}</h2>
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
                placeholder="Code scannen oder eintippen, Enter"
                aria-label="Code des Objekts"
              />
              <button type="button" onClick={scannen} disabled={!code.trim()}>
                Erfassen
              </button>
              <button type="button" onClick={blattLaden} disabled={treffer.length === 0 && fehlend.length === 0}>
                Blatt laden (CSV)
              </button>
            </div>

            {/* ── Kamera ─────────────────────────────────────────────── */}
            {faehigkeit.moeglich ? (
              <div className="kamera">
                <div className="zeile">
                  <button type="button" onClick={kameraAn ? kameraAus : () => void kameraStarten()}>
                    {kameraAn ? 'Kamera aus' : 'Mit Kamera scannen'}
                  </button>
                  {kameraAn && (
                    <>
                      <button type="button" onClick={() => void kameraWechseln()}>
                        {hinten ? 'Auf Frontkamera' : 'Auf Rückkamera'}
                      </button>
                      {/*
                        Der Lampen-Knopf erscheint nur, wenn die Spur die
                        Taschenlampe WIRKLICH kann. Ein Knopf, der auf dem
                        Laptop nichts tut, ist derselbe Fehler wie ein
                        Scan-Knopf ohne Leser — nur eine Ebene tiefer.
                      */}
                      {hatLampe && (
                        <button type="button" onClick={() => void lampeSchalten()}>
                          {lampeAn ? 'Licht aus' : 'Licht an'}
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
                  aria-label="Sucher der Kamera"
                />
                {kameraAn && (
                  <p className="hinweis">
                    Erkannte Codes landen in derselben Liste wie getippte. Wer
                    zweimal dasselbe Etikett vor die Kamera hält, bekommt zwei
                    Zeilen — dazwischen liegt eine Sperre von anderthalb
                    Sekunden, damit ein Aufkleber im Bild nicht dreissig Zeilen
                    pro Sekunde erzeugt.
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
                <strong>Kein Kamera-Scan auf diesem Gerät.</strong>{' '}
                {HINDERNIS_TEXT[faehigkeit.grund]}
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
              <h3>Soll hier liegen ({erwartet.length})</h3>
              {erwartet.length === 0 ? (
                <p className="hinweis">
                  Der Datensatz verortet hier nichts. Das ist etwas anderes als
                  „hier ist nichts" — es kann auch heißen, dass für die Objekte
                  hier nie ein Lagerort hinterlegt wurde.
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
                        {erfasst.has(k.key) ? '✓' : 'liegt hier'}
                      </button>
                      <span>{k.label}</span>
                      {k.model && k.model !== k.label && <em>{k.model}</em>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3>Erfasst ({treffer.length})</h3>
              {treffer.length === 0 ? (
                <p className="hinweis">Noch nichts erfasst.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Ergebnis</th>
                      <th>Wie</th>
                      <th>Code</th>
                      <th>Objekt</th>
                      <th>Erwartet in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treffer.map((h, i) => (
                      <tr key={`${h.code}-${i}`} className={`ergebnis-${h.outcome}`}>
                        <td>{AUDIT_LABEL[h.outcome]}</td>
                        <td>{AUDIT_VIA_LABEL[h.via]}</td>
                        <td>{h.code || NO_CODE}</td>
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
            <h3>Fehlt ({fehlend.length})</h3>
            {fehlend.length === 0 ? (
              <p className="hinweis">
                {erwartet.length === 0
                  ? 'Hier wurde nichts erwartet — es kann also auch nichts fehlen.'
                  : 'Alles, was hier liegen soll, wurde erfasst.'}
              </p>
            ) : (
              <ul className="fehlt">
                {fehlend.map((k) => (
                  <li key={k.key}>
                    {k.label}
                    {k.model && k.model !== k.label ? ` · ${k.model}` : ''} — erwartet in {k.expected}
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
