// ───────────────────────────────────────────────────────────────────────────
// Beleg-Foto lesen — lokal, und der Mensch sieht das Ergebnis vor der Buchung
//
// ─── DIE ENTSCHEIDUNG DAHINTER (Eigentümer, 2026-09-10) ────────────────────
//
// Gefragt war, ob der Wareneingang auch ein FOTO eines Lieferscheins lesen
// soll. Gewählt wurde „lokales OCR": tesseract.js im Browser, offline. Kein
// Beleg verlässt den Rechner — auf einem Lieferschein stehen Kunden- und
// Lieferantennamen, und ein fremder Dienst hätte sie mitgelesen.
//
// Der Preis steht in derselben Entscheidung: die Erkennung ist bei schlechten
// Fotos schwach. Deshalb landet ihr Ergebnis IM TEXTFELD und nicht in der
// Buchung. Der bestehende Weg bleibt unverändert der einzige, der schreibt:
//
//   Foto → OCR → Text (bearbeitbar) → `wareneingang.lesen()` → Vorschau →
//   Mensch entscheidet → Bestand
//
// Damit ist das Foto eine ABKÜRZUNG BEIM TIPPEN und keine zweite Wahrheit.
// Eine Erkennung, die direkt bucht, wäre der Grund, warum jemand danach
// einen Bestand von Hand zurückbaut.
//
// ─── WAS HIER NICHT AUS DEM NETZ KOMMT, UND WAS DOCH FEHLT ─────────────────
//
// `tesseract.js` holt in der Voreinstellung DREI Dinge von einem CDN: den
// Worker, den WASM-Kern und die Sprachdaten. Die ersten beiden liegen im
// npm-Paket und werden hier über `?url` mitgebaut — sie kommen aus dem
// eigenen Bündel.
//
// Die SPRACHDATEN (`deu.traineddata.gz`, rund 1 MB) liegen in keinem Paket.
// Sie gehören unter `public/tessdata/`; wie sie dorthin kommen, steht in
// `public/tessdata/README.md`. Fehlen sie, sagt dieses Modul das mit Namen
// (`sprachdaten-fehlen`) — es lädt sie NICHT still von einem fremden Server
// nach. Ein Lager im Keller ohne Netz bekäme sonst genau den Knopf, der beim
// ersten Griff ins Leere läuft, und die Zusage „nichts verlässt den Rechner"
// wäre beim ersten Beleg gebrochen.
//
// REIN genug für einen Test: der Erkenner wird hineingereicht (`Erkenner`),
// die Prüfung der Sprachdaten ist eine eigene Funktion mit einem `fetch` als
// Parameter. Ein echter OCR-Lauf ist ausdrücklich nicht Gegenstand der Tests.
// ───────────────────────────────────────────────────────────────────────────

/** Wohin die Sprachdaten gehören. Ein Pfad, keine Adresse im Netz. */
export const TESSDATA_PFAD = '/tessdata'

/** Die Sprache, in der Lieferscheine dieses Hauses geschrieben sind. */
export const OCR_SPRACHE = 'deu'

export type OcrHindernis = 'sprachdaten-fehlen' | 'kein-worker' | 'abgebrochen'

export const OCR_HINDERNIS_TEXT: Record<OcrHindernis, string> = {
  'sprachdaten-fehlen':
    'Die Sprachdaten für die Texterkennung sind nicht hinterlegt. Sie gehören als `deu.traineddata.gz` nach `public/tessdata/` — die Anleitung dazu liegt daneben. Bis dahin bleibt der Weg über eingefügten Text.',
  'kein-worker':
    'Die Texterkennung liess sich nicht starten. Bis das geklärt ist, bleibt der Weg über eingefügten Text.',
  abgebrochen: 'Die Texterkennung wurde abgebrochen. Der Beleg ist unverändert.',
}

/** Was aus einem Beleg-Foto herauskommt. */
export interface OcrErgebnis {
  /** Der erkannte Text, Zeile für Zeile — so wie er ins Feld gehört. */
  text: string
  /**
   * Wie sicher sich die Erkennung war (0–100), so wie tesseract sie meldet.
   *
   * Sie steht in der Oberfläche NEBEN dem Text und nicht als Schwelle im
   * Code: eine Grenze, ab der ein Ergebnis „gut" ist, wäre eine Behauptung
   * über fremde Fotos. Der Mensch liest den Text ohnehin.
   */
  sicherheit: number
}

/** Ein Erkenner. Eine Methode, damit der Test keinen braucht. */
export interface Erkenner {
  lies(bild: Blob | File): Promise<OcrErgebnis>
}

/**
 * Liegen die Sprachdaten wirklich da?
 *
 * Gefragt wird mit einem `HEAD` — die Datei ist rund ein Megabyte, und für
 * die Frage „ist sie da" reicht der Kopf. `fetch` kommt als Parameter herein,
 * damit die Prüfung ohne Server testbar ist.
 */
export const sprachdatenDa = async (
  hole: typeof fetch = fetch,
  pfad = `${TESSDATA_PFAD}/${OCR_SPRACHE}.traineddata.gz`,
): Promise<boolean> => {
  try {
    const antwort = await hole(pfad, { method: 'HEAD' })
    return antwort.ok
  } catch {
    return false
  }
}

/**
 * Der Erkenner auf Basis von tesseract.js.
 *
 * Alles, was er braucht, kommt aus dem eigenen Bündel: Worker und Kern über
 * `?url`, die Sprachdaten aus `public/tessdata/`. `import()` hält die rund
 * vier Megabyte aus dem Haupt-Bündel heraus — wer nie ein Foto einliest,
 * lädt sie nie.
 *
 * `undefined`, wenn etwas fehlt. Der Grund steht dann beim Aufrufer.
 */
export const tesseractErkenner = async (): Promise<Erkenner | undefined> => {
  try {
    const [{ createWorker }, workerPfad, kernPfad] = await Promise.all([
      import('tesseract.js'),
      import('tesseract.js/dist/worker.min.js?url').then((m) => m.default as string),
      import('tesseract.js-core/tesseract-core-simd-lstm.wasm.js?url').then(
        (m) => m.default as string,
      ),
    ])
    const worker = await createWorker(OCR_SPRACHE, 1, {
      workerPath: workerPfad,
      corePath: kernPfad,
      langPath: TESSDATA_PFAD,
      gzip: true,
    })
    return {
      async lies(bild) {
        const { data } = await worker.recognize(bild)
        return { text: data.text ?? '', sicherheit: Math.round(data.confidence ?? 0) }
      },
    }
  } catch {
    return undefined
  }
}
