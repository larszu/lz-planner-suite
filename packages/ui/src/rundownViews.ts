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

import { rundownSchedule, type Rundown, type RundownItem, type RundownRefKind } from './rundown'
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

// ───────────────────────────────────────────────────────────────────────────
// B-34 — DAS SECHSTE BLATT, UND WARUM ES KEIN SECHSTER EMPFAENGER IST
//
// Die fuenf Sichten oben sind Spalten-Auswahlen aus DERSELBEN Zeilenmenge:
// eine Zeile je Ablauf-Punkt. Dieses Blatt ist um neunzig Grad gedreht — eine
// Zeile je GEGENSTAND. Es als `RundownAudience` einzureihen hiesse, die Regel
// „N Sichten, EINE Zeilenmenge" zu brechen, und der Waechter, der genau das
// prueft, wuerde stillschweigend weicher.
//
// Es ist trotzdem KEIN zweites Dokument im Sinne des Bedarfs: jede Zelle
// stammt aus dem Ablauf oder aus dem Plan, nichts wird hier erfunden und
// nichts hier gefuehrt. Es ist dieselbe Quelle, anders herum gelesen.
//
// WOFUER. Die fuenf Sichten beantworten die Frage der Regie („was passiert um
// 14:20"). Die Technik fragt anders herum — „ab wann brauche ich Kamera 3" —,
// und das war der Kern von B-34: kein Datensatz im ganzen Baum konnte sagen,
// WANN ein Geraet gebraucht wird.
//
// WAS DIE SPALTEN NICHT BEHAUPTEN. Es gibt keine Spalte „bis". `lastMin` ist
// der BEGINN des letzten Punktes, nicht sein Ende, und was ein Geraet danach
// noch braucht — Abbau, Reserve, Umbau — weiss dieser Ablauf nicht. Die
// Spalte heisst deshalb „Letzter Punkt", und die Dauer eben dieses Punktes
// steht daneben, damit wer will selbst addiert. Eine Spalte „verfuegbar ab"
// waere eine Dispositionsentscheidung, und die faellt woanders.
// ───────────────────────────────────────────────────────────────────────────

/** Was auf dem Geraete-Blatt steht, wo der Ablauf nichts sagt. */
export const NOT_IN_RUNDOWN = 'in keinem Punkt'

/** Ein Blatt ohne Empfaenger — dieselben Bestandteile, andere Zeilenachse. */
export type GearSheet = Omit<RundownView, 'audience'>

const KIND_LABEL: Readonly<Record<RundownRefKind, string>> = {
  camera: 'Kamera',
  fixture: 'Leuchte',
  device: 'Gerät',
  cable: 'Kabel',
}

const GEAR_HEADERS = [
  'Gegenstand',
  'Art',
  'Erster Punkt',
  'Letzter Punkt',
  'Dauer des letzten Punktes',
  'Punkte',
  'ohne Zeit',
] as const

const GEAR_LEGEND: Readonly<Record<(typeof GEAR_HEADERS)[number], string>> = {
  Gegenstand: 'Der Name aus dem technischen Plan von heute — nicht der, unter dem er im Ablauf steht.',
  Art: 'Kamera, Leuchte, Gerät oder Kabel.',
  'Erster Punkt':
    'Der Beginn des frühesten Ablauf-Punktes, in dem der Gegenstand vorkommt und der eine lesbare Zeit trägt.',
  'Letzter Punkt':
    'Der BEGINN des spätesten solchen Punktes — nicht sein Ende. Wann der Gegenstand frei wird, sagt dieser Ablauf nicht.',
  'Dauer des letzten Punktes':
    'Die geplante Dauer eben dieses Punktes, falls die Tabelle sie trug. Bewusst nicht aufaddiert.',
  Punkte: 'Alle Ablauf-Punkte, in denen der Gegenstand vorkommt, in der Reihenfolge des Ablaufs.',
  'ohne Zeit':
    'Wie viele dieser Punkte keine lesbare Zeit trugen. Sie zählen mit, gehen aber in die beiden Zeit-Spalten nicht ein.',
}

const minutenAlsUhr = (min: number | null): string =>
  min == null
    ? NO_TIME_ON_SHEET
    : `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/**
 * Wann welcher Gegenstand gebraucht wird — eine Zeile je Objekt des Plans.
 *
 * AUCH DIE, DIE IN KEINEM PUNKT VORKOMMEN. Ein Blatt nur der verplanten
 * Gegenstaende laesst den Leser glauben, es gaebe keine anderen; „in keinem
 * Punkt" ist eine Aussage, eine fehlende Zeile ist keine.
 *
 * Sortiert nach dem ersten Punkt, die zeitlosen ans Ende — das ist die
 * Reihenfolge, in der jemand das Blatt abarbeitet. Innerhalb gleicher Zeit
 * nach Namen, damit zwei Laeufe dasselbe Blatt ergeben.
 */
export function gearSheet(rundown: Rundown, seed: SuiteSeed): GearSheet {
  const zeilen = [...rundownSchedule(rundown, seed)].sort((a, b) => {
    const az = a.firstMin ?? Number.POSITIVE_INFINITY
    const bz = b.firstMin ?? Number.POSITIVE_INFINITY
    if (az !== bz) return az - bz
    return a.name.localeCompare(b.name, 'de')
  })
  return {
    headers: [...GEAR_HEADERS],
    rows: zeilen.map((o) => [
      o.name,
      KIND_LABEL[o.kind],
      o.points.length === 0 ? NOT_IN_RUNDOWN : minutenAlsUhr(o.firstMin),
      o.points.length === 0 ? NOT_IN_RUNDOWN : minutenAlsUhr(o.lastMin),
      o.lastDurationMin ?? '',
      o.points.map((p) => p.title).join(', ') || NOT_IN_RUNDOWN,
      o.pointsWithoutTime,
    ]),
    legend: GEAR_HEADERS.map((h) => ({ column: h, text: GEAR_LEGEND[h] })),
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
export function rundownViewCsv(view: GearSheet): string {
  const feld = (v: string | number): string => {
    const s = String(v ?? '')
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return rundownViewRows(view)
    .map((cells) => cells.map(feld).join(';'))
    .join('\n')
}

/**
 * Dasselbe Blatt als Zeilen — die gemeinsame Form fuer JEDE Ausgabe.
 *
 * Bedarf 4 verlangt das Blatt in der Tabelle, in der der Ablauf lebt, und das
 * heisst mehr als CSV. Sobald es eine zweite Ausgabe gibt (XLSX), gibt es auch
 * die Gelegenheit, dass die beiden auseinanderlaufen: eine Zeile mehr im
 * einen, die Legende im anderen weggelassen, und zwei Empfaenger halten
 * verschiedene Blaetter fuer dasselbe. Deshalb entsteht die Tabelle EINMAL;
 * die Ausgaben unterscheiden sich nur noch darin, wie sie eine Zelle
 * schreiben.
 *
 * Rein: keine Datei, kein Netz, keine Bibliothek. Wer XLSX braucht, nimmt
 * diese Zeilen und gibt sie seinem Schreiber — die Kenntnis des Formats
 * gehoert in die App, nicht in dieses Paket.
 */
export function rundownViewRows(view: GearSheet): (string | number)[][] {
  return [
    [view.stand],
    [''],
    [...view.headers],
    ...view.rows.map((r) => [...r]),
    [''],
    ['Legende'],
    ...view.legend.map((l) => [l.column, l.text]),
  ]
}
