// ───────────────────────────────────────────────────────────────────────────
// BEDARF 7 (P1) — dieselbe Quelle, jedes Empfaenger-Format.
//
//   > Render the same schedule into every audience's format from one source:
//   > client PDF, crew call sheet, department cue sheet, foyer signage,
//   > printed show-caller copy - each self-explaining and version-stamped
//
// Und der Schaden steht daneben:
//
//   > Each rendering is made by hand from the same rows and forks the moment
//   > it is exported.
//
// Belegt an ontime#1327 (2024-11-09, „export it as PDF-Table or Excel in
// Order to share it... possibility to print"), /542 (Druckansicht) und /1293
// (2024-10-24, „an example export you can send out to clients that has what
// each field is so production [staff can read it]").
//
// ─── DIE EINE REGEL ────────────────────────────────────────────────────────
//
// EINE Quelle, N Sichten, und die Sichten sind SPALTEN-AUSWAHLEN und keine
// eigenen Datensaetze. Sobald eine Sicht etwas enthaelt, das nirgendwo sonst
// steht, ist sie ein zweites Dokument — und dann gabelt sie sich beim
// naechsten Export, genau wie es der Beleg beschreibt. Der Test dagegen ist
// mechanisch: jede Zelle jeder Sicht muss aus dem Ablauf oder dem Plan
// stammen.
//
// ─── ZWEI DINGE, DIE JEDE SICHT TRAEGT ─────────────────────────────────────
//
//   1. **Eine Feld-Legende.** „Exports need a field legend because the
//      recipient is non-technical" ist woertlich der Bedarf. Die Legende
//      erklaert je Spalte, was drinsteht — dieselbe Bauform wie das
//      Spaltenlexikon des Cable-Planers (Bedarf 81).
//   2. **Eine Stand-Zeile.** „so the person holding paper can tell in one
//      second whether it is current."
//
// ─── WARUM HIER KEIN FINGERABDRUCK STEHT ───────────────────────────────────
//
// ADR-004 gibt den drei Planern EINEN Stempel mit acht Hex-Zeichen, und sein
// ganzer Sinn ist der VERGLEICH: jemand liest sie am Telefon vor, jemand
// anders haelt sie gegen den Bildschirm. Das funktioniert nur, solange alle
// dieselbe Zahl aus demselben Inhalt rechnen — `npm run stamp:parity`
// bewacht genau das. Eine VIERTE Implementierung hier waere die erste, die
// niemand bewacht, und zwei Zahlen, die verschieden gerechnet werden, sind
// schlimmer als keine: man vergliche sie trotzdem.
//
// Die Stand-Zeile eines Ablauf-Blattes ist deshalb die HERKUNFT — Datei und
// Einlese-Zeitpunkt. Das ist keine Notloesung, sondern die richtige Angabe:
// der Ablauf ist nicht das Dokument der Suite, sondern das des Kunden (E-18).
// Seine Fassung ist der Import, aus dem dieses Blatt stammt.
//
// REIN: keine Uhr, kein IO.
// ───────────────────────────────────────────────────────────────────────────

import type { Rundown, RundownItem, RundownRefKind } from './rundown'
import type { SuiteSeed } from './seed'

/** Fuer wen das Blatt ist. */
export type RundownAudience =
  /** Der Kunde: was wann laeuft. Ohne Technik — die geht ihn nichts an. */
  | 'client'
  /** Die Crew: dasselbe plus das Material, das an jedem Punkt haengt. */
  | 'crew'
  /** Ein Gewerk: nur die Punkte, die dessen Material beruehren. */
  | 'department'
  /** Das Foyer: Zeit und Titel, sonst nichts. */
  | 'signage'
  /** Der Show-Caller: alles, was da ist. */
  | 'showcaller'

export const RUNDOWN_AUDIENCES: ReadonlyArray<RundownAudience> = [
  'client',
  'crew',
  'department',
  'signage',
  'showcaller',
]

/** Die Spalten, aus denen die Sichten zusammengesetzt sind. */
type ViewColumn = 'cue' | 'time' | 'title' | 'duration' | 'gear' | 'note'

const AUDIENCE_COLUMNS: Readonly<Record<RundownAudience, readonly ViewColumn[]>> = {
  client: ['time', 'title', 'duration'],
  crew: ['time', 'title', 'duration', 'gear'],
  department: ['time', 'title', 'gear'],
  signage: ['time', 'title'],
  showcaller: ['cue', 'time', 'title', 'duration', 'gear', 'note'],
}

/** Spaltenueberschrift, kanonisch deutsch. */
const COLUMN_HEADER: Readonly<Record<ViewColumn, string>> = {
  cue: 'Cue',
  time: 'Zeit',
  title: 'Punkt',
  duration: 'Dauer',
  gear: 'Technik',
  note: 'Notiz',
}

/**
 * Die Feld-Legende — je Spalte ein Satz, der sie erklaert.
 *
 * Kanonisch deutsch und nicht uebersetzt, aus demselben Grund wie ueberall:
 * ein Blatt, dessen Inhalt sich mit dem Sprachschalter aendert, meldet jedes
 * gedruckte Exemplar als veraltet.
 */
const COLUMN_LEGEND: Readonly<Record<ViewColumn, string>> = {
  cue: 'Die Cue-Nummer aus der Tabelle des Kunden, unverändert übernommen.',
  time: 'Der geplante Beginn. Steht dort ein Text statt einer Uhrzeit, war die Angabe nicht als Zeit lesbar und wird unverändert gezeigt statt gedeutet.',
  title: 'Der Programmpunkt, wie er im Ablauf des Kunden heisst.',
  duration: 'Die geplante Dauer in Minuten.',
  gear: 'Das Material aus dem technischen Plan, das an diesem Punkt haengt. Der Name kommt aus dem Plan von heute — wurde etwas umbenannt, steht hier der neue Name. Steht „(nicht mehr im Plan)" dabei, ist das Objekt entfernt worden und der Punkt ist offen.',
  note: 'Die Bemerkung aus der Tabelle des Kunden.',
}

/** Was auf dem Blatt steht, wo der Ablauf nichts sagt. */
export const NO_TIME_ON_SHEET = 'ohne Zeit'
export const NO_GEAR_ON_SHEET = 'keine Technik vermerkt'
export const GEAR_GONE = '(nicht mehr im Plan)'

export interface RundownView {
  audience: RundownAudience
  headers: string[]
  rows: (string | number)[][]
  /** Je Spalte ein erklaerender Satz, in der Reihenfolge der Spalten. */
  legend: { column: string; text: string }[]
  /** Die Stand-Zeile: woher dieses Blatt kommt. */
  stand: string
}

const uhrzeit = (item: RundownItem): string => {
  if (item.startMin == null) return item.startText?.trim() || NO_TIME_ON_SHEET
  const h = Math.floor(item.startMin / 60)
  const m = item.startMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Namen aus dem Plan VON HEUTE, nicht aus dem Import.
 *
 * Genau hier treffen sich Bedarf 7 und Bedarf 8: ein Blatt, das den beim
 * Import gelesenen Namen druckt, zeigt nach einer Umbenennung einen Namen,
 * den im Haus niemand mehr benutzt — und nach einer Loeschung einen, den es
 * nicht mehr gibt, ohne dass man es sieht. Beides wird hier aufgeloest, und
 * das Verschwundene wird BENANNT statt weggelassen: eine kuerzere Zeile saehe
 * aus wie ein Punkt, der weniger Material braucht.
 */
const technik = (item: RundownItem, seed: SuiteSeed): string => {
  if (item.refs.length === 0) return NO_GEAR_ON_SHEET
  const namen = new Map<string, string>([
    ...seed.cameras.map((c) => [`camera:${c.id}`, c.name] as const),
    ...seed.fixtures.map((f) => [`fixture:${f.id}`, f.name] as const),
    ...seed.devices.map((d) => [`device:${d.id}`, d.name] as const),
    ...seed.cables.map((k) => [`cable:${k.id}`, k.label] as const),
  ])
  return item.refs
    .map((r) => {
      const jetzt = namen.get(`${r.kind}:${r.id}`)
      if (jetzt) return jetzt
      return `${r.mentionedAs ?? r.id} ${GEAR_GONE}`
    })
    .join(', ')
}

const zelle = (
  spalte: ViewColumn,
  item: RundownItem,
  seed: SuiteSeed,
): string | number => {
  switch (spalte) {
    case 'cue':
      return item.cue ?? ''
    case 'time':
      return uhrzeit(item)
    case 'title':
      return item.title
    case 'duration':
      return item.durationMin ?? ''
    case 'gear':
      return technik(item, seed)
    case 'note':
      return item.note ?? ''
  }
}

/**
 * Ein Blatt fuer einen Empfaenger.
 *
 * `onlyKind` gilt nur fuer `department` und waehlt das Gewerk ueber die ART
 * des Materials: Kameras, Leuchten, Geraete oder Kabel. Ohne Angabe zeigt die
 * Gewerke-Sicht alle Punkte MIT Technik — das ist die ehrliche Vorgabe, denn
 * ein geratenes Gewerk waere eine Behauptung darueber, wer dieses Blatt
 * bekommt.
 */
export function rundownView(
  rundown: Rundown,
  seed: SuiteSeed,
  audience: RundownAudience,
  onlyKind?: RundownRefKind,
): RundownView {
  const spalten = AUDIENCE_COLUMNS[audience]
  const punkte =
    audience !== 'department'
      ? rundown.items
      : rundown.items.filter((i) =>
          onlyKind ? i.refs.some((r) => r.kind === onlyKind) : i.refs.length > 0,
        )
  return {
    audience,
    headers: spalten.map((s) => COLUMN_HEADER[s]),
    rows: punkte.map((item) => spalten.map((s) => zelle(s, item, seed))),
    legend: spalten.map((s) => ({ column: COLUMN_HEADER[s], text: COLUMN_LEGEND[s] })),
    stand: `Ablauf aus ${rundown.source.filename}, eingelesen ${rundown.source.importedAt}`,
  }
}

/**
 * Das Blatt als CSV-Text, mit Legende und Stand-Zeile im Blatt selbst.
 *
 * DIE LEGENDE STEHT IM BLATT UND NICHT DANEBEN. Ein Beiblatt geht auf dem
 * Weg zum Empfaenger verloren; der Bedarf verlangt „self-explaining", und
 * das ist eine Eigenschaft der Datei, nicht des Anhangs.
 */
export function rundownViewCsv(view: RundownView): string {
  const feld = (v: string | number): string => {
    const s = String(v ?? '')
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const zeile = (cells: (string | number)[]): string => cells.map(feld).join(';')
  return [
    zeile([view.stand]),
    '',
    zeile(view.headers),
    ...view.rows.map(zeile),
    '',
    zeile(['Legende']),
    ...view.legend.map((l) => zeile([l.column, l.text])),
  ].join('\n')
}
