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
// ─── ZWEI LESER, UND DIE ENTSCHEIDUNG DAHINTER ─────────────────────────────
//
// `CodeLeser` ist eine Schnittstelle mit einer Methode. Sie hat zwei
// Umsetzungen:
//
//   nativerLeser   `window.BarcodeDetector` — da, wo es ihn gibt (Android,
//                  ChromeOS). Nichts nachzuladen, nichts zu bezahlen.
//   wasmLeser      `zxing-wasm` (MIT), mitgeliefert und NACHGELADEN, erst
//                  wenn jemand den Scan öffnet. Damit dekodiert der
//                  Desktop-Rechner im Lagerbüro genauso wie das Telefon.
//
// Der Eigentümer hat das WASM am 2026-09-10 ausdrücklich gewählt: „Ohne es
// dekodiert der Scan nur dort, wo der Browser die native API hat — auf dem
// Desktop meist nicht." Der Preis steht in derselben Entscheidung: rund ein
// Megabyte, und deshalb liegt es hinter einem `import()` und nicht im
// Haupt-Bündel. Wer den Scan nie öffnet, lädt es nie.
//
// ─── DIE WASM-DATEI KOMMT AUS DEM BÜNDEL, NICHT AUS DEM NETZ ───────────────
//
// `zxing-wasm` holt seine `.wasm` in der Voreinstellung von einem CDN. Das
// wäre hier ein Rückschritt in genau der Eigenschaft, die diese App
// ausmacht: ein Lager im Keller ohne Netz hätte einen Scan-Knopf, der beim
// ersten Griff ins Leere läuft. Die Datei wird deshalb über Vite (`?url`)
// mitgebaut und dem Modul als `overrides.locateFile` untergeschoben.
//
// Der Test schiebt weiterhin einen eigenen Leser hinein und braucht weder
// Kamera noch WASM.
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
    'Der mitgelieferte Barcode-Leser liess sich nicht laden. Solange das so ist, bleibt der Handscanner (er tippt in das Feld) oder „Ohne Scan wählen".',
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
  // Seit dem mitgelieferten WASM ist ein Decoder IMMER da — er muss nur
  // geladen werden. Die Angabe bleibt trotzdem im Modell: laedt das Modul
  // nicht (kaputtes Buendel, blockiertes WASM), ist der Grund benannt und
  // nicht geraten. Sie ist deshalb keine Eigenschaft des Browsers mehr,
  // sondern eine der Lieferung.
  hatDecoder: true,
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

/**
 * Der mitgelieferte Leser (`zxing-wasm`).
 *
 * Das Modul wird ERST HIER geladen. Die Schleife unten fragt einmal danach,
 * wenn der Scan aufgeht; wer ihn nie öffnet, lädt kein Megabyte.
 *
 * Die `.wasm` kommt aus dem eigenen Bündel: `?url` lässt Vite sie mitbauen
 * und liefert ihren Pfad, `locateFile` schiebt ihn dem Modul unter. Ohne
 * diese zwei Zeilen holte `zxing-wasm` sie von einem CDN — und der Scan
 * fiele im Lager ohne Netz aus, also genau dort, wo er gebraucht wird.
 *
 * `undefined`, wenn das Laden scheitert: dann steht in der Oberfläche der
 * Grund `kein-decoder` und kein toter Knopf.
 */
export const wasmLeser = async (): Promise<CodeLeser | undefined> => {
  try {
    const [{ prepareZXingModule, readBarcodes }, wasmPfad] = await Promise.all([
      import('zxing-wasm/reader'),
      import('zxing-wasm/reader/zxing_reader.wasm?url').then((m) => m.default as string),
    ])
    prepareZXingModule({ overrides: { locateFile: () => wasmPfad }, fireImmediately: false })
    return {
      async lies(quelle) {
        // Der Leser will Bilddaten, die Schleife hat ein Canvas-fähiges
        // Bild. Die Umwandlung steht hier und nicht in der Schleife: sie
        // gehört zu DIESEM Leser, der native braucht sie nicht.
        const bild = await bildDatenVon(quelle)
        if (!bild) return []
        const treffer = await readBarcodes(bild)
        return treffer
          .map((t) => t.text)
          .filter((v): v is string => typeof v === 'string' && v.length > 0)
      },
    }
  } catch {
    return undefined
  }
}

/** Aus einer Bildquelle die Pixel holen — über ein Offscreen-Canvas. */
const bildDatenVon = async (quelle: CanvasImageSource): Promise<ImageData | undefined> => {
  const breite =
    'videoWidth' in quelle
      ? (quelle as HTMLVideoElement).videoWidth
      : 'width' in quelle
        ? Number((quelle as { width: number }).width)
        : 0
  const hoehe =
    'videoHeight' in quelle
      ? (quelle as HTMLVideoElement).videoHeight
      : 'height' in quelle
        ? Number((quelle as { height: number }).height)
        : 0
  if (!breite || !hoehe) return undefined
  const flaeche = document.createElement('canvas')
  flaeche.width = breite
  flaeche.height = hoehe
  const stift = flaeche.getContext('2d', { willReadFrequently: true })
  if (!stift) return undefined
  stift.drawImage(quelle, 0, 0, breite, hoehe)
  return stift.getImageData(0, 0, breite, hoehe)
}

/**
 * Der Leser, der auf diesem Gerät zu haben ist.
 *
 * Der native zuerst: er ist schon da und kostet keinen Ladevorgang. Erst
 * wenn es ihn nicht gibt, kommt das WASM — und wenn auch das nicht lädt,
 * `undefined`, damit die Oberfläche einen Grund nennen kann statt einer
 * Kamera, die nie etwas erkennt.
 */
export const waehleLeser = async (): Promise<CodeLeser | undefined> =>
  nativerLeser() ?? (await wasmLeser())

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
