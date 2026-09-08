// ───────────────────────────────────────────────────────────────────────────
// BEDARF 8 (P1) — die Verbindung zwischen Ablauf und technischem Plan.
//
//   > The running order says '14:20 panel, four handhelds, VT at 14:31'. The
//   > technical plan says which RF channels, which camera, which cable.
//   > Nothing connects them. A change to either is invisible to the other; no
//   > rental ERP or rundown tool owns this boundary.
//
// Die Bedarfs-Datenbank nennt das ausdruecklich „the largest gap for AV
// Planner Suite specifically": die Suite modelliert Kameras, Kabel, Leuchten
// und Signalwege — aber nicht, WANN etwas davon benutzt wird.
//
// ─── DIE ENTSCHEIDUNG, DIE DAS HIER ZUSCHNEIDET (E-18, 2026-09-07) ─────────
//
// **NUR LESEN.** Der Ablauf wird eingelesen und mit dem technischen Plan
// verknuepft, aber nicht hier gefuehrt. Die Autorenschaft bleibt in der
// Tabelle, in der der Ablauf ohnehin lebt — und das ist keine Bequemlichkeit,
// sondern die Beobachtung aus dem Beleg:
//
//   > we are mostly using Sheets because of the easy collaboration with
//   > others (ontime#194, 2022)
//
// Was daraus folgt, steht ueberall in dieser Datei: es gibt hier KEINEN
// Schreibweg in den Ablauf. Kein Anlegen, kein Umsortieren, kein Zeit-Editor.
// Wer den Ablauf aendert, tut das in der Tabelle und liest ihn neu ein.
// `RundownSource` haelt fest, woher der Stand kommt, damit niemand ihn fuer
// die Quelle haelt.
//
// ─── WAS „VERKNUEPFEN" HEISST ──────────────────────────────────────────────
//
// Ein Ablauf-Punkt zeigt auf Objekte des Seeds (`seed.ts`) — mit deren ID und
// nicht mit deren NAMEN. Ein Name veraltet beim Umbenennen; die Id nicht.
// Genau daran haengt der einzige Befund, der wirklich traegt:
//
//   `ref-missing` — der Punkt zeigt auf ein Objekt, das der Plan nicht mehr
//   hat. DAS ist „a schedule change lists what it invalidates", von der
//   anderen Seite gelesen: wer Kamera 3 aus dem Plan nimmt, entwertet jeden
//   Ablauf-Punkt, der sie benutzt — und bis heute sieht das niemand.
//
// ─── WAS BEWUSST NICHT GEMELDET WIRD ───────────────────────────────────────
//
// **„Zwei Punkte zur selben Zeit benutzen dasselbe Geraet."** Das klingt nach
// dem naheliegendsten Befund und waere eine VERMUTUNG ueber Ausschliesslichkeit,
// die fuer die vier Seed-Arten nicht gilt: eine Kamera darf sehr wohl in zwei
// gleichzeitigen Punkten stehen (sie haelt die Totale ueber die ganze Show),
// eine Leuchte bleibt gerigged, ein Mischer laeuft durch. Ausschliesslich sind
// Funkstrecken — die stehen im Spektrum-Plan (Bedarf 95) und nicht im Seed.
// Ein Befund, der bei jeder Totalen anschlaegt, wird nach dem zweiten Mal
// weggeklickt, und mit ihm `ref-missing` daneben.
//
// **„Dieses Geraet kommt in keinem Ablauf-Punkt vor."** Waere richtig, sobald
// der Ablauf die ganze Show abdeckt, und ein Fehlalarm auf jedem halb
// eingelesenen. Statt eines Befundes gibt es deshalb eine ZAHL
// (`coverage`) — sie sagt dasselbe, ohne etwas zu behaupten.
//
// **„Zwei Ablauf-Punkte ueberschneiden sich zeitlich."** Auf Parallelbuehnen
// ist das der Normalfall (Bedarf 55). Nicht gemeldet.
//
// REIN: keine Uhr, kein Netz, kein IO. Der Zeitstempel des Imports wird
// hereingereicht, nicht hier genommen.
// ───────────────────────────────────────────────────────────────────────────

import type { SuiteSeed } from './seed'

export const RUNDOWN_KIND = 'suite-rundown' as const
export const RUNDOWN_VERSION = 1 as const

/** Worauf ein Ablauf-Punkt zeigen kann — die vier Arten des Seeds. */
export type RundownRefKind = 'camera' | 'fixture' | 'device' | 'cable'

export const RUNDOWN_REF_KINDS: ReadonlyArray<RundownRefKind> = [
  'camera',
  'fixture',
  'device',
  'cable',
]

export interface RundownRef {
  kind: RundownRefKind
  /** Die Id im Seed. NICHT der Name — der veraltet beim Umbenennen. */
  id: string
  /**
   * Der Text, aus dem die Verknuepfung entstand („Kamera 1", „Handheld 3").
   *
   * Er bleibt stehen, auch wenn das Objekt spaeter verschwindet: dann ist er
   * das Einzige, was noch sagt, WAS an dieser Stelle gemeint war. Ein Befund
   * „zeigt ins Leere" ohne diesen Text waere nicht reparierbar.
   */
  mentionedAs?: string
}

export interface RundownItem {
  id: string
  /** Cue-/Positionsnummer aus der Tabelle, unveraendert uebernommen. */
  cue?: string
  title: string
  /**
   * Beginn in Minuten seit Mitternacht, sofern die Spalte lesbar war.
   *
   * Fehlt sie, fehlt sie — der Punkt bleibt trotzdem im Ablauf. Eine geratene
   * Zeit waere schlimmer als keine: sie erschiene auf jedem Blatt als Zusage.
   */
  startMin?: number
  /** Der Rohtext der Zeit-Spalte. Bleibt erhalten, auch wenn er unlesbar war. */
  startText?: string
  durationMin?: number
  note?: string
  refs: RundownRef[]
}

/**
 * Woher dieser Stand kommt.
 *
 * Er ist Pflicht und nicht optional: ein Ablauf ohne Herkunft sieht aus wie
 * einer, den die Suite fuehrt — und genau das tut sie nach E-18 nicht.
 */
export interface RundownSource {
  filename: string
  /** Blattname, falls die Quelle mehrere hatte. */
  sheet?: string
  /** ISO-Zeitstempel. Wird HEREINGEREICHT, damit diese Datei ohne Uhr auskommt. */
  importedAt: string
  /** Welche Spalte der Quelle auf welches Feld gelegt wurde. */
  mapping: ColumnMapping
}

export interface Rundown {
  kind: typeof RUNDOWN_KIND
  formatVersion: typeof RUNDOWN_VERSION
  source: RundownSource
  items: RundownItem[]
}

// ───────────────────────────────────────────────────────────────────────────
// BEDARF 6 (P1) — die unordentliche Kunden-Tabelle einlesen.
//
//   > Client sends the agenda as Word, Excel or Google Sheets in their own
//   > format, late. […] the rigid parser 'makes it inflexible for user who
//   > receive rundown or event [data in their own layout]'
//   (ontime#502, 2023-09-01, vom Maintainer selbst)
//
// Daraus folgen genau drei Dinge, und alle drei stehen unten im Code:
//
//   1. **Die Spalten-Zuordnung kommt von aussen.** Es gibt keine Liste
//      erwarteter Spaltennamen, gegen die geprueft wird. `suggestMapping`
//      SCHLAEGT VOR, mehr nicht — der Mensch bestaetigt.
//   2. **Vor dem Import steht eine Vorschau.** `previewRundown` liefert, was
//      entstehen WUERDE, samt jeder Zeile, die nicht durchkam, mit Grund.
//      Ein Import, der still die Haelfte schluckt, ist schlimmer als keiner.
//   3. **Unlesbares wird nicht geraten.** Eine Zeit, die der Parser nicht
//      versteht, bleibt als Rohtext stehen und der Punkt ohne `startMin`.
// ───────────────────────────────────────────────────────────────────────────

/** Die Felder, auf die eine Quell-Spalte gelegt werden kann. */
export type RundownField = 'cue' | 'title' | 'start' | 'duration' | 'note' | 'refs'

export const RUNDOWN_FIELDS: ReadonlyArray<RundownField> = [
  'cue',
  'title',
  'start',
  'duration',
  'note',
  'refs',
]

/** Spaltenname der Quelle -> Feld. Spalten ohne Eintrag werden ignoriert. */
export type ColumnMapping = Readonly<Record<string, RundownField>>

/**
 * Ein Vorschlag fuer die Zuordnung — deutsch und englisch, weil die Tabelle
 * aus beiden Sprachraeumen kommt.
 *
 * BEWUSST KEINE ERKENNUNG PER INHALT. Zu raten, dass eine Spalte Zeiten
 * enthaelt, weil die ersten drei Zellen wie Zeiten aussehen, geht so lange
 * gut, bis eine Spalte „Dauer" ebenso aussieht. Der Vorschlag geht ueber den
 * NAMEN, und was er nicht trifft, legt der Mensch selbst.
 */
const FIELD_HINTS: Readonly<Record<RundownField, readonly string[]>> = {
  cue: ['cue', 'nr', 'no', 'nummer', 'pos', 'position', '#'],
  title: ['title', 'titel', 'programmpunkt', 'punkt', 'item', 'segment', 'was', 'inhalt'],
  start: ['start', 'beginn', 'zeit', 'time', 'uhrzeit', 'von'],
  duration: ['duration', 'dauer', 'laenge', 'länge', 'length', 'min'],
  note: ['note', 'notiz', 'bemerkung', 'hinweis', 'remark', 'comment', 'kommentar'],
  refs: ['technik', 'tech', 'equipment', 'geraete', 'geräte', 'material', 'gear', 'kamera'],
}

const normalise = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9äöüß#]+/g, '')

/**
 * Vorschlag: welche Spalte koennte welches Feld sein.
 *
 * Ein Feld wird hoechstens EINMAL vergeben — die erste passende Spalte
 * gewinnt. Zwei Spalten auf dasselbe Feld zu legen, waere eine Zuordnung, die
 * beim Import eine der beiden still verwirft.
 */
export function suggestMapping(headers: readonly string[]): ColumnMapping {
  const out: Record<string, RundownField> = {}
  for (const feld of RUNDOWN_FIELDS) {
    for (const h of headers) {
      if (h in out) continue
      const n = normalise(h)
      if (!n) continue
      // GLEICH ODER ANFANG, nicht „enthaelt". „Endzeit" enthaelt „zeit" und
      // waere damit der Beginn; „Restdauer" enthaelt „dauer" und waere die
      // Dauer. Beides ist falsch, und ein falscher Vorschlag ist teurer als
      // keiner: er wird bestaetigt.
      if (FIELD_HINTS[feld].some((hint) => n === hint || n.startsWith(hint))) {
        out[h] = feld
        // Das Feld ist vergeben — die erste passende Spalte gewinnt. Zwei
        // Spalten auf dasselbe Feld zu legen hiesse, dass der Import eine
        // der beiden still verwirft.
        break
      }
    }
  }
  return out
}

/**
 * „14:20", „14.20", „1420", „2:20 PM" -> Minuten seit Mitternacht. Sonst null.
 *
 * TOLERANT, ABER NICHT RATEND. Was hier nicht sicher zu lesen ist, wird null
 * — und der Punkt behaelt den Rohtext. Der Beleg nennt genau diese Sorte
 * Fehler als Grund fuer den Umbau des Importers: ein starrer Parser, der an
 * einer fremden Schreibweise scheitert, macht das Werkzeug unbenutzbar; ein
 * ratender macht es unglaubwuerdig.
 */
export function parseClock(raw: string | undefined): number | null {
  if (!raw) return null
  const s = raw.trim().toLowerCase()
  if (!s) return null
  const pm = /\bpm\b/.test(s)
  const am = /\bam\b/.test(s)
  const kern = s.replace(/\b[ap]m\b/g, '').trim()
  const m = /^(\d{1,2})[:.\s]?(\d{2})(?:[:.](\d{2}))?$/.exec(kern)
  if (!m) return null
  let stunden = Number(m[1])
  const minuten = Number(m[2])
  if (!Number.isFinite(stunden) || !Number.isFinite(minuten)) return null
  if (minuten > 59) return null
  if (pm && stunden < 12) stunden += 12
  if (am && stunden === 12) stunden = 0
  if (stunden > 23) return null
  return stunden * 60 + minuten
}

/** „45", „45 min", „1:30", „1h 30" -> Minuten. Sonst null. */
export function parseDuration(raw: string | undefined): number | null {
  if (!raw) return null
  const s = raw.trim().toLowerCase()
  if (!s) return null
  const hm = /^(\d{1,2})\s*[:h]\s*(\d{1,2})$/.exec(s)
  if (hm) {
    const min = Number(hm[2])
    if (min > 59) return null
    return Number(hm[1]) * 60 + min
  }
  const nur = /^(\d{1,4})\s*(?:min|m|minuten)?$/.exec(s)
  if (nur) return Number(nur[1])
  return null
}

/**
 * Warum eine Zeile nicht durchkam.
 *
 * Benannt und nicht bloss gezaehlt: „3 Zeilen uebersprungen" ist keine
 * Auskunft, mit der jemand die Tabelle reparieren kann.
 */
export type RowSkipReason = 'no-title' | 'empty-row'

export interface SkippedRow {
  /** Zeilennummer in der Quelle, 1-basiert und mit Kopfzeile gezaehlt. */
  row: number
  reason: RowSkipReason
}

/** Ein Name in der Technik-Spalte, der auf nichts oder auf mehreres zeigt. */
export interface UnresolvedMention {
  row: number
  text: string
  /** Wie viele Objekte im Plan auf den Text passen: 0 oder mehr als 1. */
  matches: number
}

export interface RundownPreview {
  items: RundownItem[]
  skipped: SkippedRow[]
  unresolved: UnresolvedMention[]
  /** Spalten der Quelle, die keinem Feld zugeordnet sind. */
  ignoredColumns: string[]
}

/** Alle Objekte des Seeds als (Art, Id, Name) — die Nachschlage-Grundlage. */
const seedObjects = (
  seed: SuiteSeed,
): ReadonlyArray<{ kind: RundownRefKind; id: string; name: string }> => [
  ...seed.cameras.map((c) => ({ kind: 'camera' as const, id: c.id, name: c.name })),
  ...seed.fixtures.map((f) => ({ kind: 'fixture' as const, id: f.id, name: f.name })),
  ...seed.devices.map((d) => ({ kind: 'device' as const, id: d.id, name: d.name })),
  ...seed.cables.map((k) => ({ kind: 'cable' as const, id: k.id, name: k.label })),
]

/**
 * Eine CSV-/TSV-Tabelle in Kopfzeile und Zeilen zerlegen.
 *
 * WARUM HIER UND NICHT AUS EINER BIBLIOTHEK. Die Tabelle kommt vom Kunden,
 * und der Beleg nennt genau das als Bruchstelle. Drei Dinge muss dieser
 * Leser koennen, die ein knapper Splitter nicht kann, und alle drei kosten
 * je zwei Zeilen: Anfuehrungszeichen mit Trennzeichen darin, verdoppelte
 * Anfuehrungszeichen, und CRLF. Ein `split(',')` verliert bei
 * „14:20, Panel", Vier Handhelds" genau die Zeile, um die es geht.
 *
 * DAS TRENNZEICHEN WIRD NICHT GERATEN, SONDERN GEZAEHLT: Semikolon ist in
 * deutschen Excel-Exporten die Regel, Komma in englischen, Tab in dem, was
 * aus Google Sheets kopiert wird. Gewaehlt wird das Zeichen, das in der
 * KOPFZEILE am haeufigsten ausserhalb von Anfuehrungszeichen steht — die
 * Kopfzeile ist die einzige, von der man weiss, dass sie vollstaendig ist.
 */
export function parseDelimited(text: string): { headers: string[]; rows: string[][] } {
  const ohneBom = text.replace(/^﻿/, '')
  if (!ohneBom.trim()) return { headers: [], rows: [] }
  const kandidaten = [';', ',', '\t'] as const
  const kopfEnde = ((): number => {
    let inQ = false
    for (let i = 0; i < ohneBom.length; i++) {
      const c = ohneBom[i]
      if (c === '"') inQ = !inQ
      else if (!inQ && (c === '\n' || c === '\r')) return i
    }
    return ohneBom.length
  })()
  const kopf = ohneBom.slice(0, kopfEnde)
  const zaehle = (d: string): number => {
    let inQ = false
    let n = 0
    for (const c of kopf) {
      if (c === '"') inQ = !inQ
      else if (!inQ && c === d) n++
    }
    return n
  }
  const delim = kandidaten.reduce((best, d) => (zaehle(d) > zaehle(best) ? d : best), ';')

  const zeilen: string[][] = []
  let feld = ''
  let zeile: string[] = []
  let inQ = false
  for (let i = 0; i < ohneBom.length; i++) {
    const c = ohneBom[i]
    if (inQ) {
      if (c === '"') {
        if (ohneBom[i + 1] === '"') {
          feld += '"'
          i++
        } else inQ = false
      } else feld += c
      continue
    }
    // Ein Anfuehrungszeichen oeffnet nur am FELD-ANFANG. Steht es mitten in
    // einem unquotierten Feld, ist es ein Zeichen wie jedes andere — so
    // schreibt es RFC 4180, und so kommt es aus der Praxis: ein
    // Programmpunkt heisst `Panel "Zukunft der Halle"`, und ein Leser, der
    // hier den Quote-Modus anschaltet, frisst die Anfuehrungszeichen und
    // haengt sich am naechsten Trennzeichen auf.
    if (c === '"' && feld === '') inQ = true
    else if (c === delim) {
      zeile.push(feld)
      feld = ''
    } else if (c === '\n') {
      zeile.push(feld)
      zeilen.push(zeile)
      feld = ''
      zeile = []
    } else if (c !== '\r') feld += c
  }
  zeile.push(feld)
  zeilen.push(zeile)

  const [kopfzeile, ...rest] = zeilen
  return { headers: (kopfzeile ?? []).map((h) => h.trim()), rows: rest }
}

/**
 * Was aus dieser Tabelle mit dieser Zuordnung entstehen WUERDE.
 *
 * Nichts wird gespeichert — das ist die Vorschau, die der Beleg verlangt
 * („confirm-before-import"). `rows` sind die Datenzeilen OHNE Kopfzeile;
 * `headers` sind deren Spaltennamen in derselben Reihenfolge.
 */
export function previewRundown(
  headers: readonly string[],
  rows: ReadonlyArray<readonly string[]>,
  mapping: ColumnMapping,
  seed: SuiteSeed,
): RundownPreview {
  const spalte = (feld: RundownField): number =>
    headers.findIndex((h) => mapping[h] === feld)
  const iCue = spalte('cue')
  const iTitle = spalte('title')
  const iStart = spalte('start')
  const iDuration = spalte('duration')
  const iNote = spalte('note')
  const iRefs = spalte('refs')

  const objekte = seedObjects(seed)
  const items: RundownItem[] = []
  const skipped: SkippedRow[] = []
  const unresolved: UnresolvedMention[] = []

  rows.forEach((row, idx) => {
    // 1-basiert und mit Kopfzeile: dieselbe Zahl, die die Tabelle links zeigt.
    const zeile = idx + 2
    const zelle = (i: number): string => (i >= 0 ? (row[i] ?? '').trim() : '')
    if (row.every((c) => !c || !c.trim())) {
      skipped.push({ row: zeile, reason: 'empty-row' })
      return
    }
    const title = zelle(iTitle)
    if (!title) {
      // Ein Punkt ohne Titel ist keine Zeile des Ablaufs, sondern ein
      // Zwischenstrich oder ein Rest. Ihn zu uebernehmen hiesse, eine leere
      // Zeile auf jedes Blatt zu drucken.
      skipped.push({ row: zeile, reason: 'no-title' })
      return
    }

    const startText = zelle(iStart)
    const startMin = parseClock(startText)
    const durationMin = parseDuration(zelle(iDuration))

    const refs: RundownRef[] = []
    const rohRefs = zelle(iRefs)
    if (rohRefs) {
      for (const teil of rohRefs.split(/[,;/]+/)) {
        const text = teil.trim()
        if (!text) continue
        const treffer = objekte.filter(
          (o) => o.name.trim().toLowerCase() === text.toLowerCase(),
        )
        if (treffer.length === 1) {
          refs.push({ kind: treffer[0].kind, id: treffer[0].id, mentionedAs: text })
        } else {
          // 0 Treffer: der Ablauf nennt etwas, das der Plan nicht hat.
          // Mehr als 1: der Name ist im Plan nicht eindeutig. Beides ist eine
          // Auskunft und keines ein Grund, irgendetwas zu verknuepfen —
          // eine geratene Verknuepfung waere eine erfundene Tatsache ueber
          // die Show.
          unresolved.push({ row: zeile, text, matches: treffer.length })
        }
      }
    }

    items.push({
      id: `row-${zeile}`,
      ...(zelle(iCue) ? { cue: zelle(iCue) } : {}),
      title,
      ...(startMin != null ? { startMin } : {}),
      ...(startText ? { startText } : {}),
      ...(durationMin != null ? { durationMin } : {}),
      ...(zelle(iNote) ? { note: zelle(iNote) } : {}),
      refs,
    })
  })

  return {
    items,
    skipped,
    unresolved,
    ignoredColumns: headers.filter((h) => !(h in mapping)),
  }
}

/** Aus einer bestaetigten Vorschau den Ablauf machen. */
export function rundownFromPreview(
  preview: RundownPreview,
  source: RundownSource,
): Rundown {
  return {
    kind: RUNDOWN_KIND,
    formatVersion: RUNDOWN_VERSION,
    source,
    items: preview.items,
  }
}

/** Formpruefung fuer alles, was von aussen hereinkommt. */
export function isRundown(value: unknown): value is Rundown {
  if (!value || typeof value !== 'object') return false
  const r = value as Partial<Rundown>
  return (
    r.kind === RUNDOWN_KIND &&
    r.formatVersion === RUNDOWN_VERSION &&
    !!r.source &&
    typeof r.source.filename === 'string' &&
    typeof r.source.importedAt === 'string' &&
    Array.isArray(r.items)
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Die Verknuepfung, gelesen.
// ───────────────────────────────────────────────────────────────────────────

export type RundownFindingKind = 'ref-missing' | 'no-time'

export interface RundownFinding {
  kind: RundownFindingKind
  severity: 'error' | 'warning'
  /** Id des Ablauf-Punktes — Klick- und Sortierschluessel. */
  itemId: string
  message: string
}

/**
 * Was der Plan an diesem Ablauf entwertet hat.
 *
 * Das ist die Antwort auf „a schedule change lists what it invalidates", und
 * sie kommt aus genau einer Richtung: der Ablauf zeigt auf Objekte, der Plan
 * hat sie oder hat sie nicht mehr. Alles andere waere eine Vermutung ueber
 * Ausschliesslichkeit — siehe der Kopf dieser Datei.
 */
export function rundownFindings(rundown: Rundown, seed: SuiteSeed): RundownFinding[] {
  const vorhanden = new Set(seedObjects(seed).map((o) => `${o.kind}:${o.id}`))
  const out: RundownFinding[] = []
  for (const item of rundown.items) {
    for (const ref of item.refs) {
      if (vorhanden.has(`${ref.kind}:${ref.id}`)) continue
      out.push({
        kind: 'ref-missing',
        severity: 'error',
        itemId: item.id,
        message:
          `„${item.title}" benutzt ${ref.mentionedAs ? `„${ref.mentionedAs}"` : `${ref.kind} ${ref.id}`}` +
          ' — im Plan gibt es das nicht mehr. Der Punkt ist damit entwertet,' +
          ' solange niemand sagt, was an seine Stelle tritt.',
      })
    }
    if (item.startMin == null) {
      out.push({
        kind: 'no-time',
        severity: 'warning',
        itemId: item.id,
        message: item.startText
          ? `„${item.title}" trägt die Zeit „${item.startText}", die nicht zu lesen war.`
          : `„${item.title}" hat keine Zeit — der Punkt lässt sich nicht einordnen.`,
      })
    }
  }
  return out
}

/**
 * B-34 — DIE UMKEHRUNG: wann wird DIESES Objekt gebraucht?
 *
 *   > Kein Datensatz in keinem der acht Repos kann sagen, WANN ein Gerät,
 *   > eine Kamera oder ein Fixture gebraucht wird.
 *
 * Der Ablauf oben beantwortet die Frage der Regie: „was passiert um 14:20".
 * Die Frage der Technik ist die andere Richtung — „ab wann brauche ich
 * Kamera 3, und wann bin ich mit ihr fertig". Beides steht in denselben
 * Daten; was fehlte, war der Index.
 *
 * `rundownCoverage` zaehlt nur, ob ein Objekt ueberhaupt vorkommt. Diese
 * Funktion sagt, WO — und macht damit aus der Verknuepfung eine Auskunft.
 *
 * ─── DREI DINGE, DIE SIE BEWUSST NICHT TUT ────────────────────────────────
 *
 * SIE ERFINDET KEINE ZEIT. Ein Punkt ohne lesbare Zeit (`startMin == null`)
 * geht in `points` ein, aber nicht in `firstMin`/`lastMin`. Ein Geraet, das
 * NUR in zeitlosen Punkten vorkommt, bekommt deshalb `firstMin: null` — und
 * das ist die richtige Auskunft: es kommt vor, aber niemand weiss wann. Eine
 * Spanne, die zeitlose Punkte stillschweigend ueberspringt, sieht aus wie
 * eine Zusage.
 *
 * SIE RECHNET KEINE „BRAUCHT-VON-BIS"-SPANNE MIT PUFFER. `lastMin` ist der
 * BEGINN des letzten Punktes, nicht sein Ende, und die Dauer wird nicht
 * addiert. Was ein Geraet nach seinem letzten Auftritt noch braucht — Abbau,
 * Reserve, Umbau —, weiss dieser Ablauf nicht, und es zu schaetzen hiesse,
 * eine Dispositionsentscheidung zu treffen, die woanders hingehoert.
 * `lastDurationMin` steht daneben, damit wer will selbst addieren kann.
 *
 * SIE MELDET KEINE LUECKE. Ein Objekt ohne einen einzigen Punkt bekommt eine
 * leere Liste, keinen Befund — aus genau dem Grund, aus dem `coverage` eine
 * Zahl ist und kein Befund: auf einem halb eingelesenen Ablauf waere jede
 * Meldung ein Fehlalarm.
 */
export interface ObjectSchedule {
  kind: RundownRefKind
  id: string
  name: string
  /** Die Ablauf-Punkte, in denen das Objekt vorkommt — in Ablauf-Reihenfolge. */
  points: ReadonlyArray<{ itemId: string; cue?: string; title: string; startMin?: number }>
  /** Beginn des fruehesten Punktes MIT lesbarer Zeit; sonst null. */
  firstMin: number | null
  /** Beginn des spaetesten Punktes MIT lesbarer Zeit; sonst null. */
  lastMin: number | null
  /** Dauer eben dieses spaetesten Punktes, falls die Quelle sie trug. */
  lastDurationMin: number | null
  /** Punkte, in denen das Objekt vorkommt, deren Zeit aber unlesbar war. */
  pointsWithoutTime: number
}

/**
 * Der Index Objekt -> Ablauf-Punkte, fuer ALLE Objekte des Seeds.
 *
 * Auch fuer die, die nirgends vorkommen: eine Liste, die nur die
 * verplanten Objekte enthaelt, laesst den Leser glauben, es gaebe keine
 * anderen. `points: []` ist eine Aussage, ein fehlender Eintrag ist keine.
 *
 * Die Reihenfolge der Punkte ist die des Ablaufs, nicht die der Zeit — ein
 * Ablauf kann Punkte ohne Zeit zwischen zwei zeitlichen tragen, und sie
 * ans Ende zu sortieren waere eine Behauptung darueber, wann sie liegen.
 */
export function rundownSchedule(rundown: Rundown, seed: SuiteSeed): ObjectSchedule[] {
  const punkteJeObjekt = new Map<string, ObjectSchedule['points'][number][]>()
  for (const item of rundown.items) {
    // Ein Punkt, der dasselbe Objekt zweimal nennt, zaehlt einmal — sonst
    // stuende „Kamera 1" doppelt auf dem Blatt, ohne dass etwas doppelt ist.
    const gesehen = new Set<string>()
    for (const ref of item.refs) {
      const key = `${ref.kind}:${ref.id}`
      if (gesehen.has(key)) continue
      gesehen.add(key)
      const eintrag: ObjectSchedule['points'][number] = {
        itemId: item.id,
        title: item.title,
        ...(item.cue !== undefined ? { cue: item.cue } : {}),
        ...(item.startMin !== undefined ? { startMin: item.startMin } : {}),
      }
      const liste = punkteJeObjekt.get(key)
      if (liste) liste.push(eintrag)
      else punkteJeObjekt.set(key, [eintrag])
    }
  }

  const dauerJeItem = new Map(rundown.items.map((i) => [i.id, i.durationMin]))

  return seedObjects(seed).map((o) => {
    const points = punkteJeObjekt.get(`${o.kind}:${o.id}`) ?? []
    const mitZeit = points.filter((p) => p.startMin != null)
    const spaetester = mitZeit.reduce<(typeof mitZeit)[number] | null>(
      (max, p) => (max == null || (p.startMin as number) > (max.startMin as number) ? p : max),
      null,
    )
    return {
      kind: o.kind,
      id: o.id,
      name: o.name,
      points,
      firstMin: mitZeit.length ? Math.min(...mitZeit.map((p) => p.startMin as number)) : null,
      lastMin: spaetester ? (spaetester.startMin as number) : null,
      lastDurationMin: spaetester ? (dauerJeItem.get(spaetester.itemId) ?? null) : null,
      pointsWithoutTime: points.length - mitZeit.length,
    }
  })
}

export interface RundownCoverage {
  /** Wie viele Seed-Objekte in mindestens einem Ablauf-Punkt vorkommen. */
  referenced: number
  /** Wie viele es insgesamt gibt. Nenner fuer „x von y". */
  total: number
  /** Die Namen derer, die in keinem Punkt vorkommen. */
  unreferenced: string[]
}

/**
 * Wie weit der Ablauf den Plan abdeckt — eine ZAHL und kein Befund.
 *
 * „Dieses Geraet kommt in keinem Ablauf-Punkt vor" ist richtig, sobald der
 * Ablauf die ganze Show abdeckt, und ein Fehlalarm auf jedem halb
 * eingelesenen. Als Zahl sagt es dasselbe, ohne etwas zu behaupten: wer sie
 * liest, weiss selbst, wie vollstaendig sein Ablauf ist.
 */
export function rundownCoverage(rundown: Rundown, seed: SuiteSeed): RundownCoverage {
  const objekte = seedObjects(seed)
  const benutzt = new Set(rundown.items.flatMap((i) => i.refs.map((r) => `${r.kind}:${r.id}`)))
  const offen = objekte.filter((o) => !benutzt.has(`${o.kind}:${o.id}`))
  return {
    referenced: objekte.length - offen.length,
    total: objekte.length,
    unreferenced: offen.map((o) => o.name),
  }
}
