// ───────────────────────────────────────────────────────────────────────────
// Bedarf 4 — der Ablauf in der Tabelle, in der er lebt: die XLSX-Haelfte.
//
// CSV/TSV stand seit `suite#142`. Der Bedarf heisst aber „interoperability
// with the spreadsheet the rundown lives in", und das ist bei Kunden eine
// .xlsx-Datei: Die Regie schickt keinen Text-Export, sie schickt die Mappe.
// Wer sie erst in Excel oeffnen und als CSV speichern muss, hat den Bedarf
// nicht erfuellt, sondern verschoben.
//
// ─── DIE EINE STELLE, AN DER DIESER LESER VERDIENT, ZU EXISTIEREN ──────────
//
// Excel speichert eine Uhrzeit NICHT als „14:20", sondern als Bruchteil eines
// Tages: 0.5972222222222222. Wer die Mappe roh liest, bekommt genau diese
// Zahl in die Spalte „Start", `parseClock` gibt `null` zurueck, und der Ablauf
// erscheint als „ohne Zeit" — vollstaendig eingelesen, jede Zeile da, und
// trotzdem falsch. Das ist die teuerste Sorte Fehler: nichts fehlt, also
// sucht niemand.
//
// Deshalb `raw: false`: die Zelle kommt so heraus, wie sie in Excel STEHT,
// mit dem Zahlenformat der Zelle angewandt. Aus 0.5972… wird „14:20", und der
// vorhandene tolerante Pfad (`suggestMapping` → `previewRundown`) bleibt
// unveraendert — er sieht dieselben Kopfzeilen und dieselben Zeilen wie bei
// CSV. Ein zweiter Zuordnungs-Pfad waere die Gelegenheit, dass die beiden
// auseinanderlaufen.
//
// ─── WARUM HIER UND NICHT IN `@avplan/ui` ──────────────────────────────────
//
// `packages/ui` traegt ausser React keine Abhaengigkeit, und das ist Absicht:
// es ist das gemeinsame Paket. Ein Tabellen-Format ist Sache der App, die es
// liest. Die reine Haelfte — welche Zeilen ein Blatt hat — steht deshalb
// dort (`rundownViewRows`), das Format hier.
// ───────────────────────────────────────────────────────────────────────────
import * as XLSX from 'xlsx-js-style'

/** Was der tolerante Pfad braucht — dieselbe Form wie `parseDelimited`. */
export interface Tabelle {
  headers: string[]
  rows: string[][]
}

/** Erkennt eine Mappe an der Endung. Der Inhalt entscheidet danach. */
export const istArbeitsmappe = (dateiname: string): boolean =>
  /\.xlsx?$/i.test(dateiname.trim())

/**
 * Das ERSTE Blatt der Mappe als Kopfzeile und Zeilen.
 *
 * Das erste und nicht das aktive: Welches Blatt beim Speichern aktiv war,
 * haengt daran, wo der Absender zuletzt geklickt hat. Das ist keine Aussage
 * ueber den Ablauf. Ist die Mappe leer, kommt eine leere Tabelle zurueck —
 * dieselbe Antwort wie bei einer leeren CSV, damit die Oberflaeche nur einen
 * Fall kennt.
 */
export function parseArbeitsmappe(buffer: ArrayBuffer): Tabelle {
  const mappe = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const ersteName = mappe.SheetNames[0]
  if (!ersteName) return { headers: [], rows: [] }
  const blatt = mappe.Sheets[ersteName]
  if (!blatt) return { headers: [], rows: [] }
  // `raw: false` ist die tragende Zeile dieses Moduls — siehe Kopf.
  //
  // Leerzeilen bleiben DRIN (kein `blankrows: false`), und das ist eine
  // Entscheidung ueber Gleichheit: Der Text-Pfad reicht sie durch, und
  // `previewRundown` meldet sie als uebersprungen mit Grund `empty-row`. Wer
  // sie hier wegwirft, bekommt aus derselben Datei je nach Format zwei
  // verschiedene Ueberspringen-Berichte — und der stillere davon sieht besser
  // aus, obwohl er weniger sagt.
  const zeilen = XLSX.utils.sheet_to_json<unknown[]>(blatt, {
    header: 1,
    raw: false,
  })
  const alsText = (v: unknown): string => (v === null || v === undefined ? '' : String(v).trim())
  const [kopf, ...rest] = zeilen
  if (!kopf) return { headers: [], rows: [] }
  const headers = kopf.map(alsText)
  return {
    headers,
    // AUF DIE KOPFZEILEN-BREITE BRINGEN. Gemessen, nicht vermutet: Eine
    // Zelle, die es in der Mappe gar nicht gibt (Excel schreibt eine nie
    // beruehrte Zelle nicht), kommt als `null` an ihrer Stelle — sie
    // verschiebt also nichts. Was sie tut, ist die ZEILE VERKUERZEN: fehlt
    // die letzte Zelle, ist die Zeile kuerzer als die Kopfzeile, und eine
    // ganz leere Zeile kommt als `[]`. `headers.map` gibt jeder Zeile
    // dieselbe Breite, und `alsText` macht aus `null` einen leeren String.
    rows: rest.map((z) => headers.map((_, i) => alsText((z ?? [])[i]))),
  }
}

/**
 * Zeilen als .xlsx-Datei.
 *
 * Bewusst OHNE Formatierung: kein Fettdruck, keine Breiten, keine Farben.
 * Das Blatt geht an Menschen, die es weiterbearbeiten — jede Formatierung,
 * die hier entsteht, ist eine, die dort im Weg steht. Die Legende steht als
 * Zeilen IM Blatt (so baut `rundownViewRows` sie), nicht als Kommentar an
 * einer Zelle: ein Kommentar ueberlebt das erste Kopieren nicht.
 */
export function arbeitsmappeAusZeilen(
  zeilen: ReadonlyArray<ReadonlyArray<string | number>>,
  blattname: string,
): Blob {
  const blatt = XLSX.utils.aoa_to_sheet(zeilen.map((z) => [...z]))
  const mappe = XLSX.utils.book_new()
  // Excel laesst 31 Zeichen zu und verbietet : \ / ? * [ ]. Ein Name, der
  // beides verletzt, macht die Datei unlesbar — und zwar erst beim
  // Empfaenger.
  const sicher = blattname.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31) || 'Blatt'
  XLSX.utils.book_append_sheet(mappe, blatt, sicher)
  const buf = XLSX.write(mappe, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
