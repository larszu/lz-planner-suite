// ───────────────────────────────────────────────────────────────────────────
// BEDARF 45 — vom INHALT des Ablaufs auf die Bedienoberflaeche, nicht nur von
// seiner Uhr. Und damit zugleich das fuenfte Ziel aus BEDARF 44: der Text auf
// der Bedienoberflaeche als ABLEITUNG statt als Abschrift.
//
// ─── DER BEFUND, DER DAHINTER STEHT ────────────────────────────────────────
//
// Die Bedarfs-Datenbank belegt ihn an zwei Trackern zugleich: die
// Companion-Anbindungen von Ontime sind „exclusively timer-related" (#1841,
// #1835, #1484, #2079), und eine Suche nach „rundown" in Companions eigenem
// Tracker ergibt „effectively nothing". Die Uhr des Ablaufs kommt auf der
// Oberflaeche an; sein INHALT nicht. Wer die Taste beschriftet, tippt ab —
// und tippt beim naechsten Umbenennen erneut ab.
//
// ─── WAS DIESES MODUL AUSDRUECKLICH NICHT AUSGIBT ──────────────────────────
//
// Keine Companion-Importdatei. Die Grenze steht seit S-4 in
// `cable-planner/src/renderer/lib/companionControl.ts` und ist dort am
// Quelltext nachgelesen (`companion/lib/Service/HttpApi.ts`, main,
// 2026-09-08): Companions HTTP-Schnittstelle kann Schaltflaechen DRUECKEN und
// Custom-Variablen SETZEN. Sie kann nicht „fuehre Aktion X des Moduls Y mit
// diesen Argumenten aus" — es gibt keine Aktions-Route. Eine Datei mit
// erfundenen Aktionen saehe importierbar aus und waere eine ungepruefte
// Zusicherung (Invariante 18).
//
// Ausgegeben wird deshalb ein BELEGUNGSPLAN: welche Taste zu welchem
// Ablauf-Punkt gehoert und wie sie heisst. Die Aktion dahinter legt der
// Bediener einmal von Hand; die BESCHRIFTUNG kommt ab dann aus dem Plan und
// folgt jeder Umbenennung. Genau das ist der Teil, den heute niemand liefert.
//
// ─── WAS AUSGELASSEN WIRD, STEHT DA ────────────────────────────────────────
//
// Bedarf 65: eine Mengen-Operation sagt, was sie auslaesst. Ein Ablauf-Punkt
// ohne einen einzigen Verweis in den Plan bekommt KEINE Taste — eine Taste
// ohne Technik dahinter ist eine Taste, die nichts tut, und dreissig davon
// machen den Belegungsplan unlesbar. Er wird gezaehlt und benannt.
//
// REIN: keine Uhr, kein Store, kein IO.
// ───────────────────────────────────────────────────────────────────────────

import type { Rundown } from './rundown'
import type { SuiteSeed } from './seed'
import { GEAR_GONE, NO_TIME_ON_SHEET, type GearSheet } from './rundownViews'

/**
 * Die Form der Oberflaeche. KEINE Vorgabe in diesem Modul.
 *
 * Ein Stream Deck hat 15 Tasten, ein XL 32, eine Web-Seite in Companion so
 * viele, wie eingestellt sind. Eine hier eingebaute Zahl waere eine Annahme
 * ueber fremde Hardware, die auf dem Blatt wie eine Tatsache aussieht — der
 * Aufrufer sagt sie, weil nur er sie kennt (ADR-002: erklaert, nicht geraten).
 */
export interface SurfaceGrid {
  spalten: number
  zeilen: number
}

export interface AusgelassenerPunkt {
  titel: string
  grund: string
}

export interface SurfacePlanErgebnis {
  /**
   * Dieselbe Blatt-Form wie die Ablauf-Sichten — damit CSV, Arbeitsmappe und
   * Legende aus `rundownViews.ts` unveraendert weiterbenutzt werden. Ein
   * zweiter CSV-Schreiber waere `zwei-rechnungen`.
   */
  blatt: GearSheet
  ausgelassen: AusgelassenerPunkt[]
}

const HEADERS = ['Seite', 'Zeile', 'Spalte', 'Cue', 'Beschriftung', 'Technik', 'Zeit'] as const

const LEGEND: Readonly<Record<(typeof HEADERS)[number], string>> = {
  Seite: 'Die Companion-Seite. Gezaehlt ab 1, wie in der Oberflaeche.',
  Zeile: 'Die Zeile auf dieser Seite, ab 1.',
  Spalte: 'Die Spalte auf dieser Seite, ab 1. Belegt wird zeilenweise von links oben.',
  Cue: 'Die Cue-Nummer aus der Tabelle des Kunden, unveraendert uebernommen. Leer, wenn keine da war.',
  Beschriftung: 'Der Text, der auf die Taste gehoert. Er kommt aus dem Ablauf und wird nicht abgetippt.',
  Technik:
    'Das Material aus dem technischen Plan, das an diesem Punkt haengt — mit dem Namen von HEUTE. Wurde etwas umbenannt, steht hier der neue Name; genau das ist der Zweck dieses Blattes. Steht „' +
    GEAR_GONE +
    '" dabei, ist das Objekt aus dem Plan entfernt worden und die Taste zeigt auf nichts mehr.',
  Zeit: 'Der geplante Beginn des Punktes. „' + NO_TIME_ON_SHEET + '", wenn die Tabelle keine lesbare Zeit trug.',
}

const minutenAlsUhr = (min: number | null | undefined): string =>
  min == null
    ? NO_TIME_ON_SHEET
    : `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** Der Name, unter dem ein Objekt HEUTE im Plan steht — oder der Hinweis, dass es weg ist. */
const nameHeute = (seed: SuiteSeed, kind: string, id: string): string => {
  const suche = <T extends { id: string; name: string }>(xs: readonly T[]): string | undefined =>
    xs.find((x) => x.id === id)?.name
  const name =
    kind === 'camera'
      ? suche(seed.cameras)
      : kind === 'fixture'
        ? suche(seed.fixtures)
        : kind === 'device'
          ? suche(seed.devices)
          : seed.cables.find((c) => c.id === id)?.label
  return name ?? GEAR_GONE
}

/**
 * Der Belegungsplan der Bedienoberflaeche aus dem Ablauf.
 *
 * Belegt wird zeilenweise von links oben; ist eine Seite voll, geht es auf der
 * naechsten weiter. Die Reihenfolge ist die des Ablaufs und nicht die der Zeit:
 * ein Punkt ohne lesbare Zeit steht dort, wo er in der Tabelle des Kunden
 * stand, und rutscht nicht ans Ende — auf einer Bedienoberflaeche ist die
 * Reihenfolge der Tasten die Reihenfolge des Abends.
 */
export function surfacePlan(
  rundown: Rundown,
  seed: SuiteSeed,
  grid: SurfaceGrid,
): SurfacePlanErgebnis {
  const proSeite = Math.max(1, Math.floor(grid.spalten) * Math.floor(grid.zeilen))
  const spalten = Math.max(1, Math.floor(grid.spalten))
  const ausgelassen: AusgelassenerPunkt[] = []
  const rows: (string | number)[][] = []

  let n = 0
  for (const item of rundown.items) {
    const refs = item.refs ?? []
    if (refs.length === 0) {
      // Bedarf 65 — nicht still weglassen. Ein Punkt ohne Verweis ist kein
      // Fehler (nicht jeder Programmpunkt braucht Technik), aber er bekommt
      // keine Taste, und wer das Blatt liest, soll wissen warum.
      ausgelassen.push({ titel: item.title, grund: 'kein Objekt aus dem Plan an diesem Punkt' })
      continue
    }
    const seite = Math.floor(n / proSeite) + 1
    const aufSeite = n % proSeite
    const zeile = Math.floor(aufSeite / spalten) + 1
    const spalte = (aufSeite % spalten) + 1
    n += 1
    rows.push([
      seite,
      zeile,
      spalte,
      item.cue ?? '',
      item.title,
      refs.map((r) => nameHeute(seed, r.kind, r.id)).join(', '),
      minutenAlsUhr(item.startMin),
    ])
  }

  const uebersprungen =
    ausgelassen.length === 0
      ? 'Kein Punkt ausgelassen.'
      : `${ausgelassen.length} Punkt(e) ohne Taste, weil an ihnen kein Objekt aus dem Plan haengt: ${ausgelassen
          .map((a) => a.titel)
          .join(', ')}.`

  return {
    blatt: {
      headers: [...HEADERS],
      rows,
      legend: HEADERS.map((h) => ({ column: h, text: LEGEND[h] })),
      // Der Hinweis steht IM BLATT und nicht daneben: wer das Papier in der
      // Hand hat, muss wissen, dass die Aktion hinter der Taste einmal von
      // Hand gelegt wird — sonst sucht er nach einer Importdatei, die es aus
      // gutem Grund nicht gibt.
      stand:
        `Ablauf aus ${rundown.source.filename}, eingelesen ${rundown.source.importedAt}. ` +
        `Raster ${spalten}x${Math.max(1, Math.floor(grid.zeilen))} je Seite. ` +
        'Belegungsplan, keine Importdatei: die Aktion hinter der Taste wird in Companion einmal von Hand gelegt — ' +
        'dessen HTTP-Schnittstelle kennt keine Aktions-Route. Die Beschriftung kommt aus dem Plan und folgt jeder Umbenennung. ' +
        uebersprungen,
    },
    ausgelassen,
  }
}
