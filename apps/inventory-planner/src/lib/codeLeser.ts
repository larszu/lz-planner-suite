// ───────────────────────────────────────────────────────────────────────────
// Kamera-Scan: die Fähigkeit erst FESTSTELLEN, dann anbieten (B-65).
//
// ─── DER SATZ, GEGEN DEN DIESE DATEI GESCHRIEBEN IST ───────────────────────
//
// Im Kopf der Inventur-Ansicht steht seit ihrem Bau: „ein halb gebauter
// Kamera-Knopf, der auf dem Rechner des Lageristen nichts tut, wäre
// schlechter als keiner." Das ist keine Vorsicht, sondern ein Befund —
// nachgemessen 2026-09-10 in genau der Chromium-Fassung, die dieses Projekt
// baut und in der Electron-Fassung ausliefert:
//
//   navigator.mediaDevices    DA        (auch unter file://)
//   window.BarcodeDetector    NICHT DA
//
// Die native Schnittstelle liegt nicht auf jeder Plattform: Chrome liefert
// sie auf Android und ChromeOS aus, auf Linux- und Windows-Desktops nicht.
// Ein Knopf, der ohne diese Prüfung erscheint, öffnet also auf dem Rechner
// im Lagerbüro eine Kamera, die nie einen Code erkennt — und der Lagerist
// hält sein Case so lange davor, bis er glaubt, das Etikett sei kaputt.
//
// ─── DESHALB: EIN GRUND MIT NAMEN, NIE EIN TOTER KNOPF ─────────────────────
//
// `scanFaehigkeit()` liefert entweder `{ moeglich: true }` oder einen Grund,
// den man einem Menschen vorlesen kann. Vier Gründe, und sie sind
// verschieden — „keine Kamera" und „kein Decoder" führen zu ganz
// verschiedenen nächsten Schritten:
//
//   unsicherer-kontext   die Seite läuft nicht über https/localhost
//   keine-kamera-api     `navigator.mediaDevices` fehlt
//   kein-decoder         `BarcodeDetector` fehlt (der häufigste Fall)
//   keine-erlaubnis      der Mensch hat die Kamera abgelehnt
//
// ─── WARUM DER LESER AUSTAUSCHBAR IST ──────────────────────────────────────
//
// `CodeLeser` ist eine Schnittstelle mit einer Methode. Der native Leser ist
// heute die einzige Umsetzung; ein mitgeliefertes WASM (zxing-wasm, MIT,
// ~1 MB) wäre die zweite und würde den Desktop mitnehmen. Ob dieses Megabyte
// in eine App gehört, die heute 260 kB baut, ist eine Eigentümer-Frage und
// steht so im Backlog — NICHT hier still entschieden.
//
// Die Schnittstelle kostet nichts und macht den Unterschied zwischen einer
// Entscheidung, die man später trifft, und einer, die man später ausbaut.
// Sie ist ausserdem der Grund, warum die Schleife unten getestet ist: der
// Test schiebt einen eigenen Leser hinein und braucht keine Kamera.
// ───────────────────────────────────────────────────────────────────────────

export type ScanHindernis =
  | 'unsicherer-kontext'
  | 'keine-kamera-api'
  | 'kein-decoder'
  | 'keine-erlaubnis'

export const HINDERNIS_TEXT: Record<ScanHindernis, string> = {
  'unsicherer-kontext':
    'Die Seite läuft nicht über https oder localhost. Browser geben die Kamera nur in einem sicheren Kontext frei.',
  'keine-kamera-api':
    'Dieser Browser stellt keine Kamera bereit (`navigator.mediaDevices` fehlt).',
  'kein-decoder':
    'Dieser Browser bringt keinen Barcode-Leser mit. Chrome hat ihn auf Android und ChromeOS, auf Linux- und Windows-Rechnern nicht — dort bleibt der Handscanner (er tippt in das Feld) oder „Ohne Scan wählen".',
  'keine-erlaubnis':
    'Die Kamera wurde abgelehnt. Im Browser über das Schloss-Symbol in der Adresszeile wieder freigeben.',
}

export type ScanFaehigkeit = { moeglich: true } | { moeglich: false; grund: ScanHindernis }

/** Was die Prüfung an der Umgebung abfragt. Als Objekt, damit sie testbar ist. */
export interface ScanUmgebung {
  sichererKontext: boolean
  hatKameraApi: boolean
  hatDecoder: boolean
}

/** Die Umgebung, wie sie im Browser wirklich aussieht. */
export const umgebungLesen = (): ScanUmgebung => ({
  sichererKontext: typeof window !== 'undefined' && window.isSecureContext === true,
  hatKameraApi:
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function',
  hatDecoder: typeof window !== 'undefined' && 'BarcodeDetector' in window,
})

/**
 * Kann dieses Gerät scannen — und wenn nicht, woran liegt es?
 *
 * Die Reihenfolge der Prüfungen ist die Reihenfolge, in der ein Mensch sie
 * beheben würde: erst die Seite richtig ausliefern, dann einen Browser mit
 * Kamera, dann einen mit Leser. Der erste Grund, der zutrifft, ist der, den
 * man ihm sagt — drei Gründe auf einmal sind keine Auskunft.
 */
export const scanFaehigkeit = (u: ScanUmgebung = umgebungLesen()): ScanFaehigkeit => {
  if (!u.sichererKontext) return { moeglich: false, grund: 'unsicherer-kontext' }
  if (!u.hatKameraApi) return { moeglich: false, grund: 'keine-kamera-api' }
  if (!u.hatDecoder) return { moeglich: false, grund: 'kein-decoder' }
  return { moeglich: true }
}

/**
 * Ein Leser, der aus einem Bild Codes zieht.
 *
 * Eine Methode, absichtlich. Was der Leser darunter ist (native
 * `BarcodeDetector`, ein WASM, in Tests eine Attrappe), geht die Schleife
 * nichts an.
 */
export interface CodeLeser {
  lies(quelle: CanvasImageSource): Promise<string[]>
}

/** Der native Leser des Browsers. `undefined`, wenn es ihn nicht gibt. */
export const nativerLeser = (): CodeLeser | undefined => {
  if (typeof window === 'undefined' || !('BarcodeDetector' in window)) return undefined
  // Der Typ steht nicht in den DOM-Typen dieser TS-Fassung; das `unknown`
  // ist die ehrliche Form dafuer, statt ein `any` durchzureichen.
  const Detector = (window as unknown as { BarcodeDetector: new (o?: unknown) => unknown })
    .BarcodeDetector
  const d = new Detector() as { detect(q: CanvasImageSource): Promise<{ rawValue: string }[]> }
  return {
    async lies(quelle) {
      const treffer = await d.detect(quelle)
      return treffer.map((t) => t.rawValue).filter((v) => typeof v === 'string' && v.length > 0)
    },
  }
}

export interface SchleifenOptionen {
  /** Was bei einem neuen Code passieren soll. */
  aufCode: (code: string) => void
  /**
   * Wie lange derselbe Code nicht noch einmal gemeldet wird (ms).
   *
   * Ohne diese Sperre meldet die Schleife denselben Aufkleber dreissigmal
   * pro Sekunde, solange er im Bild ist — die Trefferliste der Inventur
   * waere danach unlesbar, und der Lagerist saehe nicht mehr, was er
   * WIRKLICH erfasst hat.
   */
  sperreMs?: number
  /** Fehler des Lesers, benannt statt verschluckt. */
  aufFehler?: (nachricht: string) => void
}

/**
 * Ein Durchlauf der Lese-Schleife.
 *
 * KEIN `requestAnimationFrame` und kein `setInterval` hier drin: die
 * Taktung gehoert der Ansicht, die weiss, wann ihr Video laeuft. Diese
 * Funktion macht genau einen Versuch und ist deshalb ohne Uhr testbar.
 *
 * `zuletzt` ist der Speicher der Sperre und wird VON AUSSEN gehalten —
 * dieselbe Regel wie ueberall: der Zustand liegt bei dem, der ihn
 * verantwortet, nicht in einem Modul-globalen Versteck.
 */
export async function einLesen(
  leser: CodeLeser,
  quelle: CanvasImageSource,
  zuletzt: Map<string, number>,
  jetzt: number,
  o: SchleifenOptionen,
): Promise<void> {
  const sperre = o.sperreMs ?? 1500
  let codes: string[]
  try {
    codes = await leser.lies(quelle)
  } catch (e) {
    o.aufFehler?.(e instanceof Error ? e.message : String(e))
    return
  }
  for (const c of codes) {
    const vorher = zuletzt.get(c)
    if (vorher !== undefined && jetzt - vorher < sperre) continue
    zuletzt.set(c, jetzt)
    o.aufCode(c)
  }
}
