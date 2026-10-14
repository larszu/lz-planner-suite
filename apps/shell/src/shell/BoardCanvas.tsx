import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon, Menu, MenuItem, confirmDialog, dateiName, herunterladen } from '@avplan/ui'
import { useLanguage, useT, format, type Language, type TFunc } from '../i18n'
import { BOARD_FORMAT_RATIO, EINBETT_GRENZE, type Board, type BoardCard, type BoardCardType, type BoardFormat, type ObjektVerweis } from '../data/project'
import { objektAnzeige, objektTitel, type HeimatModul, type PlanAusschnitt } from '../data/boardObjekt'
import { BoardPlayer } from './BoardPlayer'
import { KommentarFaden } from './KommentarFaden'
import { holeVorschau } from './linkVorschauHost'
import { besterTyp, exportiereFilm } from './filmExport'
import { starteAufnahme, type LaufendeAufnahme } from './tonAufnahme'
import { KameraDialog } from './KameraDialog'
import { hoereAufSendungen, type Sendung } from './einwurfHost'
import { useMitmachen } from './useMitmachen'
import { MitmachZeiger } from './MitmachZeiger'
import { ObjektKarte, ObjektWaehler } from './ObjektKarte'
import { FLAECHE } from '@avplan/ui/embed'
import { offeneJeObjekt, type Identitaet, type Kommentar } from '@avplan/ui/embed'
import {
  applyTemplate,
  boardToMarkdown,
  formatLaufzeit,
  sceneGroups,
  sequenceSeconds,
  shotSequence,
  type Shot,
  crumbTitles,
  getBoardAtPath,
  imRahmen,
  layoutBoard,
  updateBoardAtPath,
  type Rect,
  type TemplateId,
} from '../data/board'

/* Milanote-artiges Kreativ-Board: frei platzierbare Karten, Spalten-Container
 * und verschachtelte Unterboards (Board in Board, per Doppelklick geöffnet).
 * Der gesamte Baum liegt in `root`; `path` zeigt auf das gerade sichtbare
 * (Unter-)Board. Reset per `key` im Parent. */

const BOARD_W = 2600
const BOARD_H = 1600
/** Rasterweite. Dieselbe Zahl, die das Punktraster zeichnet — sonst faengt es woanders. */
const GRID = 26
const ZOOM_MIN = 0.25
const ZOOM_MAX = 2
const SWATCHES = ['#f5a623', '#38bdf8', '#a78bfa', '#34d399', '#f87171', '#f2c26b', '#5aa9e6', '#1a2130']

let idSeq = 0
const nextId = () => `c${(idSeq += 1)}_${Math.round(performance.now())}`

const ADD_TYPES: BoardCardType[] = ['heading', 'note', 'look', 'color', 'todo', 'link', 'column', 'board']
const cardMeta = (t: TFunc): Record<BoardCardType, { label: string; icon: Parameters<typeof Icon>[0]['name'] }> => ({
  heading: { label: t('board.type.heading', 'Überschrift'), icon: 'command' },
  note: { label: t('board.type.note', 'Notiz'), icon: 'library' },
  link: { label: t('board.type.link', 'Link'), icon: 'external' },
  todo: { label: t('board.type.todo', 'To-do'), icon: 'check' },
  color: { label: t('board.type.color', 'Farbe'), icon: 'wand' },
  look: { label: t('board.type.look', 'Look'), icon: 'eye' },
  column: { label: t('board.type.column', 'Spalte'), icon: 'layers' },
  board: { label: t('board.type.board', 'Unterboard'), icon: 'board' },
  image: { label: t('board.type.image', 'Bild'), icon: 'eye' },
  video: { label: t('board.type.video', 'Film'), icon: 'monitor' },
  audio: { label: t('board.type.audio', 'Ton'), icon: 'signal' },
  file: { label: t('board.type.file', 'Datei'), icon: 'library' },
  object: { label: t('board.type.object', 'Plan-Objekt'), icon: 'nodes' },
})

const templates = (t: TFunc): { id: TemplateId; label: string }[] => [
  { id: 'moodboard', label: t('board.tpl.moodboard', 'Moodboard') },
  { id: 'brief', label: t('board.tpl.brief', 'Kreativ-Brief') },
  { id: 'storyboard', label: t('board.tpl.storyboard', 'Storyboard') },
]

interface Point { x: number; y: number }
const rectContains = (r: Rect | undefined, p: Point) =>
  !!r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h

/** „vimeo.com" aus einer Adresse — der Teil, den ein Mensch wiedererkennt. */
function hostVon(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

const cloneBoard = (b: Board): Board => JSON.parse(JSON.stringify(b)) as Board

const menuButton = (label: string, icon: Parameters<typeof Icon>[0]['name']) => (
  <>
    <Icon name={icon} size={15} /> <span className="text-[12px]">{label}</span> <Icon name="chevron-down" size={12} />
  </>
)

export function BoardCanvas({
  seed,
  title: titleProp,
  crew = [],
  kommentare = [],
  identitaet,
  onKommentar,
  onKommentarErledigt,
  onEinstellungen,
  onChange,
  plan,
  onZeigen,
}: {
  seed: Board
  title?: string
  /**
   * Die Crew dieses Projekts.
   *
   * Sie wird HEREINGEREICHT und nicht im Board gespeichert: die Crew
   * gehoert dem Projekt, und eine Abschrift auf dem Board waere beim
   * naechsten Umbesetzen die zweite Wahrheit (ADR-001).
   */
  crew?: string[]
  /** Die Aeusserungen des ganzen Projekts — gefiltert wird je Karte. */
  kommentare?: readonly Kommentar[]
  identitaet?: Identitaet
  onKommentar?: (objektId: string, text: string, antwortAuf?: string) => void
  onKommentarErledigt?: (id: string, erledigt: boolean) => void
  onEinstellungen?: () => void
  /**
   * Das geaenderte Board zurueck an die Shell.
   *
   * ─── WARUM ES DAS GEBEN MUSS ────────────────────────────────────────────
   *
   * NUTZER-MELDUNG 2026-09-12: „Verbessere die UI von dem Board in AV Planner.
   * Da sind nicht annaehernd alle Funktionen, die in den Docs beschrieben
   * sind."
   *
   * GEMESSEN: die Funktionen SIND da — neun Kartenarten, Spalten,
   * Unterboards, Verbindungen, drei Vorlagen, Suche, Markdown- und
   * PDF-Ausgabe. Nur hielt diese Komponente ihren ganzen Baum in `useState`
   * und gab ihn nie heraus. Damit:
   *
   *   * war jede Karte beim naechsten Tab-Wechsel weg (die Komponente wird
   *     ausgehaengt, der Zustand mit ihr),
   *   * zeigte die Statusleiste unten weiter „0 Karten" — sie liest
   *     `project.show.board`, und dort stand der Ausgangswert,
   *   * zeigte die Eigenschaften-Leiste rechts dieselbe Null,
   *   * und das gespeicherte Projekt trug nichts davon.
   *
   * Eine Arbeitsflaeche, die ihre Arbeit vergisst, sieht aus wie eine
   * Arbeitsflaeche ohne Funktionen. Das war der Befund.
   */
  onChange?: (board: Board) => void
  /**
   * Geraete und Kabel des Plans, so wie die Shell sie an die Planer schickt.
   *
   * Objekt-Karten lesen daraus bei JEDEM Rendern (suite#259). Auf dem Board
   * steht nur der Verweis — was die Karte zeigt, gehoert dem Plan. Fehlt er,
   * ist kein Projekt offen; das ist nicht dasselbe wie ein leerer Plan.
   */
  plan?: PlanAusschnitt
  /** Sprung in das Modul, das dieses Objekt fuehrt — derselbe Weg wie jeder Querverweis. */
  onZeigen?: (modul: HeimatModul, id: string) => void
}) {
  const t = useT()
  const title = titleProp ?? t('board.title', 'Kreativ-Board')
  const CARD_META = cardMeta(t)
  const TEMPLATES = templates(t)
  const [root, setRoot] = useState<Board>(() => cloneBoard(seed))
  const [path, setPath] = useState<string[]>([])
  /**
   * DIE AUSWAHL IST EINE MENGE, nicht eine Karte.
   *
   * NUTZER-MELDUNG 2026-09-20: „die boards sind ueberhaupt nicht ausgereift.
   * Mache sie eher wie milanote."
   *
   * Eine Karte auf einmal ist der Kern davon. Wer zwoelf Bilder eines
   * Moodboards zur Seite schieben will, schob sie zwoelfmal; wer sich bei der
   * Vorlage vertan hat, loeschte einundzwanzigmal. `selectedId` ist deshalb
   * eine LISTE geworden, und alles, was eine Auswahl anfasst — Ziehen,
   * Loeschen, Verdoppeln, Pfeiltasten — arbeitet auf ihr.
   *
   * `selectOnly` bleibt daneben stehen, weil der haeufigste Fall genau eine
   * Karte ist und ein Aufrufer, der das meint, es auch sagen koennen soll.
   */
  const [selection, setSelection] = useState<string[]>([])
  const selectOnly = useCallback((id: string | null) => setSelection(id ? [id] : []), [])
  const toggleSelected = useCallback(
    (id: string) => setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    [],
  )
  const isSelected = useCallback((id: string) => selection.includes(id), [selection])
  /** Eine angeklickte Verbindung — sie war bis hierher nicht wieder loszuwerden. */
  const [selectedLink, setSelectedLink] = useState<string | null>(null)

  /**
   * Zoom und Verschieben.
   *
   * Die Flaeche war 2600x1600 und der einzige Weg darueber die Bildlaufleiste.
   * Ein Moodboard, das nicht auf einen Blick passt, ist keins — deshalb
   * Zoom (25 bis 200 %), „Alles zeigen", und Ziehen mit gedrueckter
   * Leertaste oder der mittleren Maustaste, wie in jedem Zeichenprogramm.
   *
   * Der Zoom lebt NICHT im Board: er ist Sicht und nicht Inhalt. Zwei Leute
   * am selben Projekt haben verschiedene Bildschirme, und ein gespeicherter
   * Zoom waere die Vergroesserung des anderen.
   */
  const [zoom, setZoom] = useState(1)
  const [spaceDown, setSpaceDown] = useState(false)
  const [snap, setSnap] = useState(true)
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const marqueeRef = useRef<{ x0: number; y0: number; additive: boolean } | null>(null)
  const panRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  /** Karten, die Strg+C in die Hand genommen hat. Nicht die Zwischenablage des Systems. */
  const clipRef = useRef<BoardCard[]>([])
  /** Läuft der Film gerade? Sicht und nicht Inhalt — steht deshalb nicht im Board. */
  const [spielt, setSpielt] = useState(false)
  /**
   * Was der naechste Druck zeigt.
   *
   * Der Browser druckt, was im Dokument steht — also muss VOR dem Druck
   * feststehen, welche der beiden Fassungen dort liegt. Deshalb ein
   * Zustand und kein Parameter an `window.print()`.
   */
  const [druckModus, setDruckModus] = useState<'doc' | 'sheet'>('doc')
  /** Rechtsklick auf die freie Flaeche: wo, und was dort hin soll. */
  const [einfuegenAn, setEinfuegenAn] = useState<{ x: number; y: number; sx: number; sy: number } | null>(null)
  /**
   * Der Auswahl-Dialog fuer eine Objekt-Karte — offen, und wenn ja, fuer
   * welche Stelle. Ohne Stelle landet die Karte dort, wo jede neue landet.
   */
  const [waehler, setWaehler] = useState<{ at?: Point } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [tempPoint, setTempPoint] = useState<Point | null>(null)

  const [query, setQuery] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{
    id: string
    dx: number
    dy: number
    moved: boolean
    /** Die ganze mitgezogene Auswahl mit ihren Ausgangslagen. */
    mit: { id: string; x: number; y: number }[]
    start: Point
  } | null>(null)
  const resizeRef = useRef<{ id: string; startX: number; startW: number } | null>(null)

  const current = useMemo(() => getBoardAtPath(root, path), [root, path])
  const cards = current.cards
  const connections = current.connections
  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])
  const layout = useMemo(() => layoutBoard(cards), [cards])
  const crumbs = useMemo(() => crumbTitles(root, path, title), [root, path, title])
  // Die Schnittfolge wird ABGELESEN und nicht gefuehrt: wer eine Karte
  // verschiebt, schneidet um, und es gibt keine zweite Liste, die danach
  // nicht mehr stimmt (ADR-001).
  const shots = useMemo(() => shotSequence(current, layout), [current, layout])
  const shotById = useMemo(() => new Map(shots.map((sh) => [sh.card.id, sh])), [shots])
  // Szenen entstehen aus der Lage und werden nicht gefuehrt — wer eine
  // Einstellung wegzieht, loest sie aus der Szene. Deshalb hier gerechnet
  // und nirgends gespeichert.
  const szenen = useMemo(() => sceneGroups(shots, layout), [shots, layout])
  // EINMAL je Durchlauf und nicht je Karte: bei 200 Karten und 500
  // Kommentaren waere die Frage je Karte eine Schleife ueber alles.
  const offeneKommentare = useMemo(() => offeneJeObjekt(kommentare), [kommentare])
  /** Die Karte, deren Faden gerade offen ist. */
  const [fadenAn, setFadenAn] = useState<string | null>(null)
  const [vorschauLaeuft, setVorschauLaeuft] = useState<string | null>(null)
  const [vorschauMeldung, setVorschauMeldung] = useState<string | null>(null)
  /** Laeuft gerade eine Tonaufnahme? Dann steht hier, womit man sie beendet. */
  const [aufnahme, setAufnahme] = useState<LaufendeAufnahme | null>(null)
  /** Steht der Sucher offen? Sicht und nicht Inhalt — steht deshalb nicht im Board. */
  const [sucher, setSucher] = useState(false)
  /** Anteil des laufenden Film-Exports, 0..1. `null` heisst: laeuft nicht. */
  const [exportAnteil, setExportAnteil] = useState<number | null>(null)

  const mutate = useCallback((fn: (b: Board) => Board) => setRoot((r) => updateBoardAtPath(r, path, fn)), [path])

  // ─── MITMACHEN ──────────────────────────────────────────────────────────
  //
  // Der Anschluss an die Sitzung. Er ist untätig, solange niemand verbunden
  // ist — `useMitmachen` schickt dann nichts und hört auf nichts.
  const uebernimmVonAussen = useCallback((b: Board) => {
    // Die Übernahme geht durch DENSELBEN Weg wie jede eigene Änderung.
    // Ein zweiter Schreibweg neben `setRoot` hätte die Undo-Historie der
    // Shell umgangen — und dann wäre „rückgängig" nach einer fremden
    // Änderung eine Überraschung.
    setRoot((r) => updateBoardAtPath(r, path, () => b))
  }, [path])
  const mitmachen = useMitmachen(current, onChange ? uebernimmVonAussen : undefined, identitaet?.name)

  /**
   * Was sich HIER geändert hat, den anderen melden.
   *
   * Gemessen wird das ERGEBNIS und nicht der Auslöser: ein Aufruf je
   * Bearbeitungsweg (ziehen, tippen, löschen, einfügen, Format) wäre ein
   * Dutzend Stellen, und die dreizehnte vergisst es. Ein Vergleich der
   * Fläche mit ihrem letzten Stand findet alle — auch die, die es noch
   * nicht gibt.
   */
  const gemeldet = useRef<Board | null>(null)
  useEffect(() => {
    if (!mitmachen.verbunden) { gemeldet.current = current; return }
    const alt = gemeldet.current
    gemeldet.current = current
    if (!alt || alt === current) return
    const vorher = new Map(alt.cards.map((c) => [c.id, c]))
    const nachher = new Map(current.cards.map((c) => [c.id, c]))
    const geaendert: string[] = []
    for (const [id, c] of nachher) if (vorher.get(id) !== c) geaendert.push(id)
    for (const v of current.connections) {
      if (!alt.connections.some((x) => x === v)) geaendert.push(v.id)
    }
    // Die Felder der Fläche selbst hängen an einem eigenen Stand, damit
    // „jemand hat das Bildformat geändert" nicht an einer Karte klebt.
    if (alt.format !== current.format || alt.shotSeconds !== current.shotSeconds || alt.tonSrc !== current.tonSrc) {
      geaendert.push(FLAECHE)
    }
    const geloescht = [
      ...[...vorher.keys()].filter((id) => !nachher.has(id)),
      ...alt.connections.filter((v) => !current.connections.some((x) => x.id === v.id)).map((v) => v.id),
    ]
    if (geaendert.length) mitmachen.melde(geaendert)
    if (geloescht.length) mitmachen.melde(geloescht, true)
  }, [current, mitmachen])

  /**
   * Das Bildformat dieses Boards.
   *
   * „Ohne" ist eine echte Wahl und nicht der Ausgangszustand vor der
   * richtigen: ein Moodboard hat kein Bildformat, und eine Grenze darueber zu
   * zeichnen behauptete eine Entscheidung, die niemand getroffen hat.
   */
  const setzeFormat = useCallback(
    (f: BoardFormat | undefined) => mutate((b) => (f ? { ...b, format: f } : { ...b, format: undefined })),
    [mutate],
  )

  // ─── DAS BOARD WANDERT INS PROJEKT ──────────────────────────────────────
  //
  // Gesammelt statt sofort: `updateShow` in der Shell legt jeden Aufruf in
  // die Projekt-Historie. Ohne die Sammelfrist haette das Ziehen EINER Karte
  // ueber die Flaeche ein paar Dutzend Undo-Schritte hinterlassen, und der
  // erste Strg+Z haette die Karte um drei Pixel zurueckgeschoben.
  //
  // Zurueckgeschrieben wird nur, was sich WIRKLICH geaendert hat — gemessen
  // am Inhalt, nicht an der Zahl der Durchlaeufe.
  //
  // Der erste Anlauf zaehlte Durchlaeufe („beim ersten nichts tun") und ging
  // schief, und zwar sichtbar: im Entwicklungsmodus haengt React jeden Effekt
  // einmal aus und wieder ein. Beim zweiten Einhaengen stand der Zaehler
  // schon auf „nicht mehr der erste", der Effekt schrieb den unveraenderten
  // Ausgangswert zurueck — und die Kopfzeile sprang auf „Ungespeichert",
  // sobald jemand den Board-Reiter auch nur ansah. Gemessen im Browser am
  // 2026-09-13.
  //
  // Ein Inhaltsvergleich kennt diesen Unterschied nicht: derselbe Inhalt
  // schreibt nicht, egal wie oft der Effekt laeuft. Er kostet ein
  // JSON.stringify je Aenderung auf einem Baum, der in eine Projektdatei
  // passt — das faellt gegen die 500-ms-Sammelfrist nicht ins Gewicht.
  const zuletztGeschrieben = useRef<string>(JSON.stringify(seed))

  // ─── UND DER WEG ZURUECK ────────────────────────────────────────────────
  //
  // Der Streifen oben gab das Board an die Shell; hier kommt es wieder an.
  // Ohne diesen Effekt war das Board die einzige Flaeche der Suite, auf der
  // STRG+Z NICHTS TAT: die Komponente liest `seed` nur beim ersten Rendern
  // (`useState(() => …)`), und ihr `key` haengt am Projektnamen. Ein Undo
  // drehte also das Projekt zurueck, waehrend die Flaeche ihren alten Stand
  // weiter anzeigte — und die naechste Kartenbewegung schrieb ihn zurueck.
  // Das Undo war damit nicht nur wirkungslos, es wurde rueckgaengig gemacht.
  //
  // Der Vergleich gegen das ZULETZT GESCHRIEBENE ist die ganze Kunst daran:
  //
  //   * Kommt herein, was wir selbst geschrieben haben, ist es der eigene
  //     Hall — nichts tun, sonst zuckt die Flaeche bei jedem Tastendruck.
  //   * Sind lokale Aenderungen noch in der Sammelfrist, steht drueben noch
  //     der alte Stand, und der ist gleich dem zuletzt Geschriebenen: auch
  //     dann nichts tun, sonst frisst ein fremdes Ereignis die halbe Zeile,
  //     die gerade getippt wird.
  //   * Erst was sich von beidem unterscheidet, ist eine Aenderung von
  //     aussen — Undo, Redo, geladenes Projekt — und die zieht ein.
  useEffect(() => {
    const kommt = JSON.stringify(seed)
    if (kommt === zuletztGeschrieben.current) return
    zuletztGeschrieben.current = kommt
    setRoot(cloneBoard(seed))
    setSelection([])
    setEditingId(null)
  }, [seed])

  useEffect(() => {
    if (!onChange) return
    const jetzt = JSON.stringify(root)
    if (jetzt === zuletztGeschrieben.current) return
    const uhr = setTimeout(() => {
      zuletztGeschrieben.current = jetzt
      onChange(root)
    }, 500)
    return () => clearTimeout(uhr)
  }, [root, onChange, seed])

  /**
   * Bildschirm → Board. Durch den Zoom geteilt, nicht bloss verschoben:
   * bei 50 % sind zwei Bildschirmpixel ein Board-Pixel, und ohne die Teilung
   * springt die gezogene Karte unter dem Zeiger weg.
   */
  const toBoard = useCallback((clientX: number, clientY: number): Point => {
    const rect = boardRef.current?.getBoundingClientRect()
    return { x: (clientX - (rect?.left ?? 0)) / zoom, y: (clientY - (rect?.top ?? 0)) / zoom }
  }, [zoom])

  /**
   * Fangen am Punktraster — dem, das ohnehin gezeichnet ist.
   *
   * Es war bis hierher Dekoration: die Punkte lagen 26 px auseinander, die
   * Karten irgendwo dazwischen, und zwei nebeneinander abgelegte Notizen
   * standen nie auf einer Linie. Wer frei ablegen will, haelt Alt.
   */
  const fang = useCallback(
    (v: number, frei: boolean) => (snap && !frei ? Math.round(v / GRID) * GRID : Math.round(v)),
    [snap],
  )

  const patchCard = useCallback((id: string, patch: Partial<BoardCard>) => {
    mutate((b) => ({ ...b, cards: b.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  }, [mutate])

  const removeCards = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    const weg = new Set(ids)
    mutate((b) => ({
      cards: b.cards.filter((c) => !weg.has(c.id) && !(c.columnId && weg.has(c.columnId))),
      connections: b.connections.filter((x) => !weg.has(x.from) && !weg.has(x.to)),
    }))
    setSelection((s) => s.filter((x) => !weg.has(x)))
  }, [mutate])
  const removeCard = useCallback((id: string) => removeCards([id]), [removeCards])

  const openBoard = useCallback((id: string) => { setPath((p) => [...p, id]); setSelection([]); setEditingId(null) }, [])
  const goToCrumb = useCallback((index: number) => { setPath((p) => p.slice(0, index)); setSelection([]); setEditingId(null) }, [])

  /**
   * Eine Karte anlegen — wahlweise GENAU DORT.
   *
   * Woertlich aus der Hilfe von recceboard: „Press and hold empty canvas to
   * add something exactly there." Auf einem Board, dessen Schnittfolge aus
   * der Lage kommt, ist das keine Bequemlichkeit: wer eine Einstellung
   * zwischen zwei andere setzen will, setzt sie DAZWISCHEN. Ohne die Stelle
   * landet sie oben links und muss erst an ihren Platz gezogen werden — und
   * bis dahin steht sie in der Schnittfolge an der falschen.
   */
  const addCard = useCallback((type: BoardCardType, at?: Point, ref?: ObjektVerweis) => {
    const n = cards.length
    const base: BoardCard = {
      id: nextId(), type,
      ...(ref ? { ref } : {}),
      x: at ? Math.max(0, Math.round(at.x)) : 120 + (n % 6) * 28 + (boardRef.current?.parentElement?.scrollLeft ?? 0),
      y: at ? Math.max(0, Math.round(at.y)) : 120 + (n % 6) * 28 + (boardRef.current?.parentElement?.scrollTop ?? 0),
      w: type === 'color' ? 110 : type === 'look' ? 190 : type === 'column' ? 280 : type === 'board' ? 210 : 230,
    }
    if (type === 'heading') base.text = t('board.type.heading', 'Überschrift')
    if (type === 'note') base.text = t('board.default.note', 'Neue Notiz…')
    if (type === 'link') { base.title = t('board.default.link', 'Neuer Link'); base.url = 'example.com' }
    if (type === 'todo') { base.title = t('board.type.todo', 'To-do'); base.items = [{ text: t('board.default.todoItem', 'Punkt 1'), done: false }] }
    if (type === 'color') { base.title = t('board.type.color', 'Farbe'); base.color = SWATCHES[n % SWATCHES.length] }
    if (type === 'look') { base.title = t('board.type.look', 'Look'); base.color = SWATCHES[n % SWATCHES.length] }
    if (type === 'column') base.title = t('board.type.column', 'Spalte')
    if (type === 'board') { base.title = t('board.type.board', 'Unterboard'); base.board = { cards: [], connections: [] } }
    mutate((b) => ({ ...b, cards: [...b.cards, base] }))
    selectOnly(base.id)
    if (type === 'note' || type === 'heading' || type === 'link' || type === 'column') setEditingId(base.id)
  }, [cards.length, mutate, selectOnly, t])

  const applyTpl = useCallback((id: TemplateId) => {
    const { cards: tc, connections: tcx } = applyTemplate(id, nextId)
    const maxY = layout.size ? Math.max(...[...layout.values()].map((r) => r.y + r.h)) : 0
    const dy = maxY ? maxY + 40 : 0
    const shifted = tc.map((c) => (c.type === 'column' || !c.columnId ? { ...c, y: c.y + dy } : c))
    mutate((b) => ({ cards: [...b.cards, ...shifted], connections: [...b.connections, ...tcx] }))
  }, [layout, mutate])

  /**
   * Die Vorschau einer Link-Karte holen und an die Karte schreiben.
   *
   * Jede Absage wird GESAGT. Eine Karte, die nach dem Klick unveraendert
   * dasteht, sieht aus wie ein kaputter Knopf — und der haeufigste Fall
   * („im Browser gibt es keinen Abruf") ist gar kein Fehler, sondern eine
   * Eigenschaft der Umgebung.
   */
  const holeVorschauFuer = useCallback(async (card: BoardCard) => {
    if (!card.url) return
    setVorschauLaeuft(card.id)
    const r = await holeVorschau(card.url)
    setVorschauLaeuft(null)
    if (r.ok) {
      patchCard(card.id, { vorschau: r.vorschau })
      return
    }
    const texte: Record<string, string> = {
      'nur-im-desktop': t('board.link.previewDesktopOnly', 'Vorschauen holt nur die Desktop-Fassung — im Browser lassen fremde Seiten den Abruf nicht zu.'),
      'keine-webadresse': t('board.link.previewNoUrl', 'Das ist keine Web-Adresse.'),
      'nicht-erreichbar': t('board.link.previewUnreachable', 'Die Seite antwortet nicht.'),
      'kein-html': t('board.link.previewNoHtml', 'Dahinter liegt keine Seite, sondern eine Datei.'),
      'zeitueberschreitung': t('board.link.previewTimeout', 'Die Seite hat zu lange gebraucht.'),
      'zu-viele-weiterleitungen': t('board.link.previewRedirects', 'Zu viele Weiterleitungen.'),
    }
    setVorschauMeldung(texte[r.grund] ?? texte['nicht-erreichbar']!)
  }, [patchCard, t, setVorschauLaeuft, setVorschauMeldung])

  /**
   * Vertonung aufnehmen — starten und beenden mit demselben Knopf.
   *
   * Die Aufnahme laeuft, bis jemand sie beendet, und nicht „bis der Film
   * durch ist": wer eine Erklaerung spricht, braucht am Ende oft noch einen
   * Satz, und ein Schnitt bei Sekunde neun naehme ihn weg.
   */
  const tonKnopf = useCallback(async () => {
    if (aufnahme) {
      const r = await aufnahme.stop()
      setAufnahme(null)
      if (!r.ok) return
      if (r.groesse > EINBETT_GRENZE) {
        // Dieselbe Grenze wie fuer jede Datei, und derselbe Grund: eine
        // Aufnahme, die das Projekt unspeicherbar macht, ist keine Hilfe.
        // Sie wird gar nicht erst uebernommen — ein halb eingebetteter Ton
        // waere schlimmer als keiner.
        setVorschauMeldung(t('board.ton.zuGross', 'Die Aufnahme ist zu lang für das Projekt. Nimm sie kürzer auf.'))
        return
      }
      mutate((b) => ({ ...b, tonSrc: r.dataUrl, tonSekunden: r.sekunden }))
      return
    }
    const a = await starteAufnahme()
    if ('ok' in a) {
      const texte: Record<string, string> = {
        'kein-mikrofon': t('board.ton.keinMikro', 'Dieser Rechner bietet kein Mikrofon an.'),
        abgelehnt: t('board.ton.abgelehnt', 'Ohne Mikrofon-Freigabe geht keine Aufnahme.'),
        'kein-recorder': t('board.ton.keinRecorder', 'Dieser Browser nimmt keinen Ton auf.'),
      }
      setVorschauMeldung(texte[a.grund] ?? texte['kein-recorder']!)
      return
    }
    setAufnahme(a)
  }, [aufnahme, mutate, t, setVorschauMeldung])

  /**
   * Den Film als Datei.
   *
   * Er wird in ECHTZEIT aufgenommen — `MediaRecorder` stempelt jedes Bild
   * mit seiner Ankunftszeit, und wer schneller einspeist, bekommt einen
   * Film, der zu schnell laeuft. Deshalb steht der Fortschritt am Knopf:
   * sonst wartet jemand auf einen Fehler.
   */
  const exportFilm = useCallback(async () => {
    setExportAnteil(0)
    const r = await exportiereFilm({
      shots,
      format: current.format,
      tonSrc: current.tonSrc,
      onFortschritt: setExportAnteil,
    })
    setExportAnteil(null)
    if (!r.ok) {
      const texte: Record<string, string> = {
        'kein-recorder': t('board.film.keinRecorder', 'Dieser Browser nimmt kein Video auf.'),
        'keine-einstellung': t('board.film.leer', 'Auf diesem Board ist keine Einstellung.'),
        abgebrochen: t('board.film.abgebrochen', 'Abgebrochen.'),
      }
      setVorschauMeldung(texte[r.grund] ?? texte['kein-recorder']!)
      return
    }
    // Die Endung sagt, was WIRKLICH in der Datei liegt. Ein `.mp4`, in dem
    // WebM steckt, ist eine Datei, die der Empfaenger nicht oeffnen kann —
    // deshalb steht sie erst hier, nach der Aufnahme.
    herunterladen(r.blob, `${dateiName(title)}.${r.typ.endung}`)
  }, [shots, current.format, current.tonSrc, title, t, setVorschauMeldung])

  const exportMarkdown = useCallback(() => {
    const md = boardToMarkdown(root, title, plan)
    herunterladen(new Blob([md], { type: 'text/markdown;charset=utf-8' }), `${dateiName(title)}.md`)
  }, [root, title, plan])

  const exportPrint = useCallback(() => { setDruckModus('doc'); setTimeout(() => window.print(), 0) }, [])
  /**
   * Kontaktabzug drucken.
   *
   * Das `setTimeout` ist kein Zittern, sondern die Abfolge: `window.print()`
   * haelt den Faden an und fotografiert das Dokument, wie es GERADE ist. Im
   * selben Durchlauf gerufen, druckte es noch die alte Fassung.
   */
  const exportSheet = useCallback(() => { setDruckModus('sheet'); setTimeout(() => window.print(), 0) }, [])

  // ── Foto-Import (Upload / Drag&Drop / Einfügen) ──
  /**
   * Eine abgelegte Datei wird eine Karte.
   *
   * ─── VIER ARTEN, EINE REGEL ────────────────────────────────────────────
   *
   * Bild, Film, Ton, alles andere. Welche es ist, sagt der MIME-Typ des
   * Browsers — nicht die Endung: eine `.mov`, die als `video/quicktime`
   * gemeldet wird, ist ein Film, und eine umbenannte Textdatei ist keiner,
   * egal was hinten steht.
   *
   * ─── UND DIE GRENZE ────────────────────────────────────────────────────
   *
   * Über `EINBETT_GRENZE` entsteht die Karte TROTZDEM — mit Name, Größe und
   * Typ, und mit `embedded: false`. Wer eine Datei ablegt, hat eine Absicht,
   * und die gehört aufs Board, auch wenn der Inhalt dort nicht hinpasst.
   * Eine verschluckte Datei wäre die schlechtere Antwort, und eine
   * eingebettete 400-MB-Datei machte das Projekt unspeicherbar — erst beim
   * Speichern, also lange nachdem jemand sie abgelegt hat.
   */
  const addDateiKarte = useCallback((file: File, at?: Point, index = 0) => {
    const scroll = boardRef.current?.parentElement
    const type: BoardCardType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
          ? 'audio'
          : 'file'
    const x = (at?.x ?? (scroll?.scrollLeft ?? 0) + 120) + index * 24
    const y = (at?.y ?? (scroll?.scrollTop ?? 0) + 120) + index * 24
    const gemeinsam = {
      id: nextId(),
      type,
      title: file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      x,
      y,
    }

    const lege = (karte: BoardCard) => {
      mutate((b) => ({ ...b, cards: [...b.cards, karte] }))
      selectOnly(karte.id)
    }

    if (file.size > EINBETT_GRENZE) {
      lege({ ...gemeinsam, w: type === 'image' || type === 'video' ? 240 : 260, embedded: false })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      if (type === 'image') {
        const img = new Image()
        img.onload = () => {
          const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5
          lege({ ...gemeinsam, w: 240, ratio, src, embedded: true })
        }
        // Ein Bild, das der Browser nicht dekodieren kann, wird keine
        // Bild-Karte mit kaputtem Inhalt, sondern eine Datei-Karte. Der
        // Unterschied ist sichtbar und erklaert sich selbst.
        img.onerror = () => lege({ ...gemeinsam, type: 'file', w: 260, src, embedded: true })
        img.src = src
        return
      }
      lege({ ...gemeinsam, w: type === 'video' ? 300 : 260, ...(type === 'video' ? { ratio: 16 / 9 } : {}), src, embedded: true })
    }
    reader.readAsDataURL(file)
  }, [mutate, selectOnly])

  const handleFiles = useCallback((files: FileList | null, at?: Point) => {
    if (!files) return
    // ALLE Dateien, nicht nur Bilder. Bis hierher fiel ein abgelegtes PDF
    // lautlos auf den Boden — und ein Werkzeug, das auf eine Handlung gar
    // nicht antwortet, sieht kaputt aus.
    Array.from(files).forEach((f, i) => addDateiKarte(f, at, i))
  }, [addDateiKarte, mutate, selectOnly])

  // Einfügen aus der Zwischenablage (Cmd/Ctrl+V) → Bild-Karte.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files: File[] = []
      for (const it of items) if (it.kind === 'file') { const f = it.getAsFile(); if (f) files.push(f) }
      if (files.length) {
        e.preventDefault()
        files.forEach((f, i) => addDateiKarte(f, undefined, i))
        return
      }
      // EINE EINGEFUEGTE ADRESSE WIRD EINE LINK-KARTE.
      //
      // Der Web-Clipper von Milanote ist eine Browser-Erweiterung und damit
      // hier nicht zu haben. Was von ihm bleibt und ohne Erweiterung geht,
      // ist der eigentliche Griff: etwas im Netz finden, kopieren, aufs
      // Board werfen. Ohne das musste man eine Link-Karte anlegen, sie
      // aufklappen und die Adresse hineintippen.
      //
      // KEINE VORSCHAU VON SELBST. Sie braucht einen Abruf, und der gehoert
      // dem Nutzer: ein Einfuegen, das im Hintergrund eine fremde Seite
      // anruft, ist eine Verbindung, die niemand angefragt hat. Die Karte
      // zeigt den Host — das ist, was dasteht — und traegt den Knopf, der
      // die Vorschau holt.
      const text = e.clipboardData?.getData('text/plain')?.trim()
      if (!text || !/^https?:\/\/\S+$/i.test(text)) return
      e.preventDefault()
      const base: BoardCard = {
        id: nextId(),
        type: 'link',
        w: 240,
        url: text.replace(/^https?:\/\//i, ''),
        title: hostVon(text),
        x: (boardRef.current?.parentElement?.scrollLeft ?? 0) + 140,
        y: (boardRef.current?.parentElement?.scrollTop ?? 0) + 140,
      }
      mutate((b) => ({ ...b, cards: [...b.cards, base] }))
      selectOnly(base.id)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [addDateiKarte, mutate, selectOnly])

  /**
   * DER EINWURF: eine Sendung von aussen wird eine Karte.
   *
   * Sie landet auf dem Board, das GERADE OFFEN ist, und nicht auf einem
   * festgelegten — wer etwas einwirft, hat vorher aufgemacht, wohin es soll.
   *
   * Sie wird AUSGEWAEHLT und die Flaeche springt nicht. Beides mit Grund:
   * eine Karte, die lautlos irgendwo erscheint, waehrend jemand anderswo
   * arbeitet, ist ein Geist; eine Flaeche, die von selbst wegspringt,
   * waehrend jemand zieht, ist schlimmer.
   *
   * Die markierte Textstelle wird zum Notiz-Text der Karte — sie ist die
   * staerkste Angabe darueber, worum es dem Absender ging. Fehlt sie, steht
   * die Beschreibung der Seite da; fehlt auch die, steht nichts. Erfunden
   * wird nichts.
   */
  useEffect(() => {
    return hoereAufSendungen((sendung: Sendung) => {
      const scroll = boardRef.current?.parentElement
      const karte: BoardCard = {
        id: nextId(),
        type: 'link',
        w: 240,
        url: sendung.url.replace(/^https?:\/\//i, ''),
        title: sendung.titel ?? hostVon(sendung.url),
        text: sendung.auswahl ?? sendung.beschreibung,
        x: (scroll?.scrollLeft ?? 0) + 160,
        y: (scroll?.scrollTop ?? 0) + 160,
        // Die Vorschau kommt aus dem, was die Seite SELBST ueber sich sagt —
        // der Clipper hat sie dort gelesen. Kein zweiter Abruf: die Seite
        // war schon offen.
        vorschau: {
          url: sendung.url,
          host: hostVon(sendung.url),
          titel: sendung.titel,
          beschreibung: sendung.beschreibung,
          bildUrl: sendung.bildUrl,
          geholtAm: sendung.geholtAm,
        },
      }
      mutate((b) => ({ ...b, cards: [...b.cards, karte] }))
      selectOnly(karte.id)
    })
  }, [mutate, selectOnly])

  // ── Größe ziehen (Milanote: untere rechte Ecke) ──
  const onResizePointerDown = (e: React.PointerEvent, card: BoardCard) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    resizeRef.current = { id: card.id, startX: toBoard(e.clientX, e.clientY).x, startW: card.w }
  }
  const onResizePointerMove = (e: React.PointerEvent) => {
    const r = resizeRef.current
    if (!r) return
    const dx = toBoard(e.clientX, e.clientY).x - r.startX
    patchCard(r.id, { w: Math.max(90, Math.min(900, r.startW + dx)) })
  }
  const onResizePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    resizeRef.current = null
  }

  const q = query.trim().toLowerCase()
  const matchesQuery = (c: BoardCard): boolean => {
    if (!q) return true
    return (
      (c.title ?? '').toLowerCase().includes(q) ||
      (c.text ?? '').toLowerCase().includes(q) ||
      (c.items ?? []).some((i) => i.text.toLowerCase().includes(q)) ||
      // Eine Objekt-Karte heisst, wie das Objekt JETZT im Plan heisst.
      (c.type === 'object' && (objektTitel(objektAnzeige(c, plan)) ?? '').toLowerCase().includes(q))
    )
  }

  // ── Verschieben (+ Spalten-Detach/Drop) ──
  const onHeaderPointerDown = (e: React.PointerEvent, card: BoardCard) => {
    if (editingId || spaceDown) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = layout.get(card.id)
    const p = toBoard(e.clientX, e.clientY)
    // Eine Karte, die schon in der Auswahl liegt, nimmt die ganze Auswahl mit.
    // Eine, die nicht drin liegt, wird zur Auswahl — sonst zoege ein Griff
    // daneben stillschweigend etwas anderes mit.
    const mit = selection.includes(card.id) ? selection : [card.id]
    if (!selection.includes(card.id) && !e.shiftKey) selectOnly(card.id)
    dragRef.current = {
      id: card.id,
      dx: p.x - (r?.x ?? card.x),
      dy: p.y - (r?.y ?? card.y),
      moved: false,
      mit: mit.map((id) => {
        const rr = layout.get(id)
        return { id, x: rr?.x ?? 0, y: rr?.y ?? 0 }
      }),
      start: p,
    }
  }
  const onHeaderPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const p = toBoard(e.clientX, e.clientY)
    if (!d.moved && Math.abs(p.x - d.start.x) < 3 && Math.abs(p.y - d.start.y) < 3) return
    d.moved = true
    const frei = e.altKey
    if (d.mit.length > 1) {
      // Die ganze Auswahl um DENSELBEN Versatz — nicht jede Karte einzeln
      // aufs Raster. Sonst zoege ein Griff die Abstaende zwischen den Karten
      // zurecht, und ein sorgfaeltig gelegtes Moodboard kaeme anders wieder.
      const dx = fang(p.x - d.start.x, frei)
      const dy = fang(p.y - d.start.y, frei)
      mutate((b) => ({
        ...b,
        cards: b.cards.map((c) => {
          const s0 = d.mit.find((m) => m.id === c.id)
          return s0 ? { ...c, columnId: undefined, x: Math.max(0, s0.x + dx), y: Math.max(0, s0.y + dy) } : c
        }),
      }))
      return
    }
    patchCard(d.id, {
      columnId: undefined,
      x: Math.max(0, fang(p.x - d.dx, frei)),
      y: Math.max(0, fang(p.y - d.dy, frei)),
    })
  }
  const onHeaderPointerUp = (e: React.PointerEvent, card: BoardCard) => {
    const d = dragRef.current
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (d && !d.moved) {
      if (e.shiftKey) toggleSelected(card.id)
      else selectOnly(card.id)
      dragRef.current = null
      return
    }
    if (d) {
      const p = toBoard(e.clientX, e.clientY)
      const cur = cardById.get(d.id)

      // ─── EINE KARTE AUF EINE ANDERE: PLAETZE TAUSCHEN ──────────────────
      //
      // Woertlich aus der Hilfe von recceboard: „Drag one card onto another
      // to swap their places."
      //
      // Auf einem Board, dessen Schnittfolge aus der Lage kommt, IST der
      // Tausch das Umsortieren — und zwar genau zweier Einstellungen, ohne
      // dass der Rest sich bewegt. Das ist der Satz „rearranging two shots
      // doesn't disturb the rest of the board", nur dass er hier aus der
      // Regel folgt statt zusaetzlich gebaut zu werden.
      //
      // Nur bei EINER gezogenen Karte: was beim Tausch aus einer Auswahl von
      // fuenf werden soll, hat niemand gesagt, und eine erfundene Antwort
      // waere hier besonders teuer — sie versetzt fuenf Einstellungen.
      const ziel = d.mit.length === 1
        ? cards.find((c) => c.id !== d.id && c.type !== 'column' && !c.columnId && rectContains(layout.get(c.id), p))
        : undefined
      if (ziel && cur && cur.type !== 'column' && d.moved) {
        const a = d.mit[0]!
        mutate((b) => ({
          ...b,
          cards: b.cards.map((c) =>
            c.id === d.id
              ? { ...c, x: ziel.x, y: ziel.y, columnId: undefined }
              : c.id === ziel.id
                ? { ...c, x: a.x, y: a.y, columnId: undefined }
                : c,
          ),
        }))
        dragRef.current = null
        return
      }

      const targetCol = cards.find((c) => c.type === 'column' && c.id !== d.id && rectContains(layout.get(c.id), p))
      if (targetCol && cur && cur.type !== 'column') patchCard(d.id, { columnId: targetCol.id })
    }
    dragRef.current = null
  }

  // ── Verbindungen ziehen ──
  useEffect(() => {
    if (!connectFrom) return
    const onMove = (e: PointerEvent) => setTempPoint(toBoard(e.clientX, e.clientY))
    const onUp = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const targetId = el?.closest<HTMLElement>('[data-card-id]')?.dataset.cardId
      if (targetId && targetId !== connectFrom) {
        mutate((b) => (b.connections.some((x) => x.from === connectFrom && x.to === targetId) ? b : { ...b, connections: [...b.connections, { id: nextId(), from: connectFrom, to: targetId }] }))
      }
      setConnectFrom(null)
      setTempPoint(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [connectFrom, toBoard, mutate])

  /** Karten an eine Stelle setzen, die frei ist — fuer Verdoppeln und Einfuegen. */
  const einsetzen = useCallback((vorlagen: BoardCard[], versatz: number) => {
    if (vorlagen.length === 0) return
    const neue = vorlagen.map((c) => ({
      ...JSON.parse(JSON.stringify(c)) as BoardCard,
      id: nextId(),
      columnId: undefined,
      x: c.x + versatz,
      y: c.y + versatz,
    }))
    mutate((b) => ({ ...b, cards: [...b.cards, ...neue] }))
    setSelection(neue.map((c) => c.id))
  }, [mutate])

  // ── Tastatur ──
  //
  // Bis hierher gab es genau zwei Tasten: Entfernen und Escape. Was fehlte,
  // ist das, was auf einer Arbeitsflaeche in den Fingern sitzt — Auswahl
  // verschieben, verdoppeln, kopieren, alles auswaehlen, zoomen. Ohne sie
  // ist jede Bewegung ein Ziehen mit der Maus, und zwei Karten um denselben
  // Betrag zu versetzen wird zur Zielübung.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && !editingId) setSpaceDown(true)
      if (editingId) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      const mod = e.metaKey || e.ctrlKey

      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedLink) { e.preventDefault(); mutate((b) => ({ ...b, connections: b.connections.filter((x) => x.id !== selectedLink) })); setSelectedLink(null); return }
        if (selection.length) { e.preventDefault(); removeCards(selection) }
        return
      }
      if (e.key === 'Escape') { setSelection([]); setSelectedLink(null); return }
      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setSelection(cards.map((c) => c.id))
        return
      }
      if (mod && e.key.toLowerCase() === 'd' && selection.length) {
        e.preventDefault()
        einsetzen(cards.filter((c) => selection.includes(c.id)), 24)
        return
      }
      if (mod && e.key.toLowerCase() === 'c' && selection.length) {
        clipRef.current = cards.filter((c) => selection.includes(c.id))
        return
      }
      if (mod && e.key.toLowerCase() === 'v' && clipRef.current.length) {
        // Bilder aus der System-Zwischenablage haben ihren eigenen Weg
        // (`paste`-Ereignis) und kommen hier nicht vorbei: dieser Zweig
        // greift nur, wenn vorher im Board kopiert wurde.
        e.preventDefault()
        einsetzen(clipRef.current, 28)
        return
      }
      if (mod && (e.key === '+' || e.key === '=')) { e.preventDefault(); setZoom((z) => Math.min(ZOOM_MAX, z + 0.1)); return }
      if (mod && e.key === '-') { e.preventDefault(); setZoom((z) => Math.max(ZOOM_MIN, z - 0.1)); return }
      if (mod && e.key === '0') { e.preventDefault(); setZoom(1); return }

      if (selection.length && e.key.startsWith('Arrow')) {
        e.preventDefault()
        const schritt = e.shiftKey ? GRID : 1
        const dx = e.key === 'ArrowLeft' ? -schritt : e.key === 'ArrowRight' ? schritt : 0
        const dy = e.key === 'ArrowUp' ? -schritt : e.key === 'ArrowDown' ? schritt : 0
        mutate((b) => ({
          ...b,
          cards: b.cards.map((c) =>
            selection.includes(c.id)
              ? { ...c, columnId: undefined, x: Math.max(0, c.x + dx), y: Math.max(0, c.y + dy) }
              : c,
          ),
        }))
      }
    }
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === ' ') setSpaceDown(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [selection, selectedLink, editingId, removeCards, cards, einsetzen, mutate])

  // ── Die Fläche selbst: Auswahlrahmen, Schieben, Zoom ────────────────────
  //
  // Eine Geste je Eingabe, und jede tut das, was sie anderswo auch tut:
  // ziehen auf dem Leeren waehlt aus, Leertaste oder mittlere Maustaste
  // schiebt, Strg/Cmd + Rad zoomt auf den Zeiger.

  /**
   * Die Flaeche waechst mit dem Inhalt.
   *
   * 2600x1600 war eine Wand: wer eine Karte an den Rand zog, konnte daneben
   * nichts mehr ablegen. Jetzt liegt hinter der aeussersten Karte immer noch
   * ein halber Bildschirm Platz.
   */
  const planeW = useMemo(
    () => Math.max(BOARD_W, ...[...layout.values()].map((r) => r.x + r.w + 400)),
    [layout],
  )
  const planeH = useMemo(
    () => Math.max(BOARD_H, ...[...layout.values()].map((r) => r.y + r.h + 400)),
    [layout],
  )

  const onSurfacePointerDown = (e: React.PointerEvent) => {
    const aufKarte = (e.target as HTMLElement).closest('[data-card-id],[data-column-id]')
    if (spaceDown || e.button === 1) {
      const sc = scrollRef.current
      if (!sc) return
      e.preventDefault()
      panRef.current = { x: e.clientX, y: e.clientY, left: sc.scrollLeft, top: sc.scrollTop }
      return
    }
    if (aufKarte || e.button !== 0) return
    const p = toBoard(e.clientX, e.clientY)
    marqueeRef.current = { x0: p.x, y0: p.y, additive: e.shiftKey }
    setMarquee({ x: p.x, y: p.y, w: 0, h: 0 })
    if (!e.shiftKey) { setSelection([]); setSelectedLink(null) }
  }

  const onSurfacePointerMove = (e: React.PointerEvent) => {
    // Den eigenen Zeiger melden, bevor irgendetwas anderes passiert: auch
    // beim Schieben und beim Aufziehen eines Rahmens sollen die anderen
    // sehen, wo jemand ist.
    if (mitmachen.verbunden) {
      const z = toBoard(e.clientX, e.clientY)
      mitmachen.zeiger(z.x, z.y, selection[0])
    }
    const pan = panRef.current
    if (pan) {
      const sc = scrollRef.current
      if (!sc) return
      sc.scrollLeft = pan.left - (e.clientX - pan.x)
      sc.scrollTop = pan.top - (e.clientY - pan.y)
      return
    }
    const m = marqueeRef.current
    if (!m) return
    const p = toBoard(e.clientX, e.clientY)
    setMarquee({
      x: Math.min(m.x0, p.x),
      y: Math.min(m.y0, p.y),
      w: Math.abs(p.x - m.x0),
      h: Math.abs(p.y - m.y0),
    })
  }

  const onSurfacePointerUp = () => {
    panRef.current = null
    const m = marqueeRef.current
    marqueeRef.current = null
    const r = marquee
    setMarquee(null)
    if (!m || !r) return
    // Ein Klick ohne Ziehen hat oben schon abgewaehlt; `imRahmen` gibt fuer
    // einen Rahmen ohne Flaeche nichts heraus (RAHMEN_MIN), also fuegt ein
    // Klick auch nichts hinzu.
    const getroffen = imRahmen(cards, layout, r)
    setSelection((s) => (m.additive ? [...new Set([...s, ...getroffen])] : getroffen))
  }

  /**
   * Strg/Cmd + Rad zoomt AUF DEN ZEIGER.
   *
   * Ohne die Korrektur der Bildlaufposition zoomt die Flaeche auf ihre linke
   * obere Ecke, und was man ansieht, wandert beim Zoomen aus dem Bild. Die
   * Rechnung ist die uebliche: der Board-Punkt unter dem Zeiger bleibt unter
   * dem Zeiger.
   */
  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    const sc = scrollRef.current
    if (!sc) return
    e.preventDefault()
    const vorher = zoom
    const nachher = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vorher * (e.deltaY < 0 ? 1.1 : 1 / 1.1)))
    if (nachher === vorher) return
    const box = sc.getBoundingClientRect()
    const zx = e.clientX - box.left + sc.scrollLeft
    const zy = e.clientY - box.top + sc.scrollTop
    setZoom(nachher)
    requestAnimationFrame(() => {
      sc.scrollLeft = (zx / vorher) * nachher - (e.clientX - box.left)
      sc.scrollTop = (zy / vorher) * nachher - (e.clientY - box.top)
    })
  }

  /** „Alles zeigen": der Zoom, bei dem der belegte Teil ins Fenster passt. */
  const zoomAufAlles = useCallback(() => {
    const sc = scrollRef.current
    if (!sc || layout.size === 0) { setZoom(1); return }
    const rects = [...layout.values()]
    const rechts = Math.max(...rects.map((r) => r.x + r.w))
    const unten = Math.max(...rects.map((r) => r.y + r.h))
    const links = Math.min(...rects.map((r) => r.x))
    const oben = Math.min(...rects.map((r) => r.y))
    const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.min(
      (sc.clientWidth - 48) / Math.max(1, rechts - links),
      (sc.clientHeight - 48) / Math.max(1, unten - oben),
    )))
    setZoom(z)
    requestAnimationFrame(() => {
      sc.scrollLeft = Math.max(0, links * z - 24)
      sc.scrollTop = Math.max(0, oben * z - 24)
    })
  }, [layout])

  const anchorOut = (id: string): Point | null => { const r = layout.get(id); return r ? { x: r.x + r.w, y: r.y + r.h / 2 } : null }
  const anchorIn = (id: string): Point | null => { const r = layout.get(id); return r ? { x: r.x, y: r.y + r.h / 2 } : null }
  const linkPath = (a: Point, b: Point) => { const dx = Math.max(50, Math.abs(b.x - a.x) * 0.5); return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}` }

  const columns = cards.filter((c) => c.type === 'column')
  const drawCards = cards.filter((c) => c.type !== 'column')

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-av-card border border-av-border bg-av-bg">
      {/* Werkzeugleiste */}
      <div className="flex flex-wrap items-center gap-1 border-b border-av-border-muted bg-av-surface-1 px-2 py-1.5">
        <span className="px-1.5 text-[11px] font-semibold uppercase tracking-wider text-av-text-faint">{t('board.toolbar.add', 'Hinzufügen')}</span>
        {ADD_TYPES.map((ty) => (
          <button key={ty} type="button" className="av-toolbar-btn av-focus" onClick={() => addCard(ty)} aria-label={format(t('board.add.item', '{label} hinzufügen'), { label: CARD_META[ty].label })} title={CARD_META[ty].label}>
            <Icon name={CARD_META[ty].icon} size={15} /> <span className="text-[12px]">{CARD_META[ty].label}</span>
          </button>
        ))}
        {/* Ein Objekt des Plans. Kein Direkt-Einfuegen wie bei den anderen
            Arten: eine Objekt-Karte ohne Objekt waere eine leere Huelle,
            also kommt erst die Wahl, dann die Karte. */}
        <button type="button" className="av-toolbar-btn av-focus" onClick={() => setWaehler({})} aria-label={format(t('board.add.item', '{label} hinzufügen'), { label: CARD_META.object.label })} title={CARD_META.object.label}>
          <Icon name={CARD_META.object.icon} size={15} /> <span className="text-[12px]">{CARD_META.object.label}</span>
        </button>
        {/* Knipsen statt importieren. Derselbe Ablage-Weg wie jede Datei —
            und damit dieselbe Prüfung gegen die Einbettungs-Grenze. */}
        <button type="button" className="av-toolbar-btn av-focus" onClick={() => setSucher(true)} aria-label={t('board.toolbar.kamera', 'Foto aufnehmen')} title={t('board.toolbar.kamera', 'Foto aufnehmen')}>
          <Icon name="camera" size={15} />
        </button>
        <button type="button" className="av-toolbar-btn av-focus" onClick={() => fileInputRef.current?.click()} aria-label={t('board.toolbar.photoImport', 'Foto importieren')} title={t('board.toolbar.photoImport', 'Foto importieren')}>
          <Icon name="eye" size={15} /> <span className="text-[12px]">{t('board.toolbar.photo', 'Foto')}</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = '' }} />

        {selection.length > 1 && (
          /* Was mit einer Mehrfach-Auswahl geht, steht hier und nicht nur auf
             der Tastatur: Strg+D findet niemand, der es nicht schon weiss. */
          <span className="ml-2 flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-3 px-2 py-0.5">
            <span className="text-[12px] text-av-text-muted">
              {format(t('board.selection.count', '{n} ausgewählt'), { n: selection.length })}
            </span>
            <button type="button" className="av-toolbar-btn av-focus" onClick={() => einsetzen(cards.filter((c) => selection.includes(c.id)), 24)} aria-label={t('board.selection.duplicate', 'Auswahl verdoppeln')} title={t('board.selection.duplicate', 'Auswahl verdoppeln')}>
              <Icon name="layers" size={14} /> <span className="text-[12px]">{t('board.selection.duplicateShort', 'Verdoppeln')}</span>
            </button>
            <button type="button" className="av-toolbar-btn av-focus" onClick={() => removeCards(selection)} aria-label={t('board.selection.delete', 'Auswahl löschen')} title={t('board.selection.delete', 'Auswahl löschen')}>
              <Icon name="close" size={14} /> <span className="text-[12px]">{t('board.selection.deleteShort', 'Löschen')}</span>
            </button>
          </span>
        )}

        <div className="ml-2 flex min-w-0 items-center gap-1.5 rounded-av-control border border-av-border bg-av-surface-3 px-2">
          <Icon name="search" size={13} style={{ color: 'var(--av-text-faint)' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('board.search.placeholder', 'Board durchsuchen…')} aria-label={t('board.search.aria', 'Board durchsuchen')} className="av-focus w-32 bg-transparent py-1 text-[12px] text-av-text outline-none placeholder:text-av-text-faint" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* Das Board als Film. Der Knopf nennt die Laufzeit, weil die die
              Frage ist, die man an ein Storyboard stellt. Ohne Einstellung
              auf dem Board ist er aus — ein Abspielknopf, der auf ein
              leeres Bild fuehrt, ist eine Sackgasse. */}
          <button
            type="button"
            className="av-toolbar-btn av-focus"
            onClick={() => setSpielt(true)}
            disabled={shots.length === 0}
            style={shots.length === 0 ? { opacity: 0.45 } : undefined}
            aria-label={t('board.play.start', 'Als Film abspielen')}
            title={t('board.play.start', 'Als Film abspielen')}
          >
            <Icon name="eye" size={15} />
            <span className="text-[12px]">
              {shots.length > 0
                ? format(t('board.play.button', 'Abspielen · {zeit}'), {
                    zeit: formatLaufzeit(sequenceSeconds(shots)),
                  })
                : t('board.play.buttonEmpty', 'Abspielen')}
            </span>
          </button>
          {/* VERTONUNG. Ein Knopf, zwei Zustaende — aufnehmen und beenden.
              Waehrend der Aufnahme traegt er die Farbe, die im Haus „Achtung"
              heisst, damit niemand vergisst, dass das Mikrofon offen ist. */}
          <button
            type="button"
            className="av-toolbar-btn av-focus"
            onClick={() => void tonKnopf()}
            style={aufnahme ? { color: 'var(--av-danger)' } : undefined}
            aria-pressed={!!aufnahme}
            aria-label={aufnahme ? t('board.ton.stop', 'Aufnahme beenden') : t('board.ton.start', 'Vertonung aufnehmen')}
            title={aufnahme ? t('board.ton.stop', 'Aufnahme beenden') : t('board.ton.start', 'Vertonung aufnehmen')}
          >
            <Icon name="signal" size={15} />
            <span className="text-[12px]">
              {aufnahme
                ? t('board.ton.stopKurz', 'Aufnahme beenden')
                : current.tonSrc
                  ? format(t('board.ton.vorhanden', 'Ton · {zeit}'), { zeit: formatLaufzeit(current.tonSekunden ?? 0) })
                  : t('board.ton.startKurz', 'Vertonen')}
            </span>
          </button>
          <Menu button={menuButton(current.format ?? t('board.format.none', 'Format'), 'ruler')} align="right">
            {(close) => (
              <>
                <MenuItem onClick={() => { setzeFormat(undefined); close() }}>
                  {t('board.format.off', 'Ohne Bildgrenzen')}
                </MenuItem>
                {(Object.keys(BOARD_FORMAT_RATIO) as BoardFormat[]).map((f) => (
                  <MenuItem key={f} onClick={() => { setzeFormat(f); close() }}>
                    {f}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
          {/* Zoom. Die Zahl ist ein Knopf: sie setzt auf 100 % zurueck —
              dieselbe Stelle, an der sie steht, macht sie rueckgaengig. */}
          <button type="button" className="av-toolbar-btn av-focus" onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - 0.1))} aria-label={t('board.zoom.out', 'Verkleinern')} title={t('board.zoom.out', 'Verkleinern')}>
            <Icon name="minus" size={15} />
          </button>
          <button type="button" className="av-toolbar-btn av-focus min-w-[3.2rem] justify-center" onClick={() => setZoom(1)} aria-label={t('board.zoom.reset', 'Zoom auf 100 %')} title={t('board.zoom.reset', 'Zoom auf 100 %')}>
            <span className="text-[12px] tabular-nums">{Math.round(zoom * 100)} %</span>
          </button>
          <button type="button" className="av-toolbar-btn av-focus" onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + 0.1))} aria-label={t('board.zoom.in', 'Vergrößern')} title={t('board.zoom.in', 'Vergrößern')}>
            <Icon name="plus" size={15} />
          </button>
          <button type="button" className="av-toolbar-btn av-focus" onClick={zoomAufAlles} aria-label={t('board.zoom.fit', 'Alles zeigen')} title={t('board.zoom.fit', 'Alles zeigen')}>
            <Icon name="fit" size={15} /> <span className="text-[12px]">{t('board.zoom.fitShort', 'Alles')}</span>
          </button>
          <button
            type="button"
            className="av-toolbar-btn av-focus"
            aria-pressed={snap}
            onClick={() => setSnap((v) => !v)}
            style={snap ? { color: 'var(--av-accent)' } : undefined}
            aria-label={t('board.snap', 'Am Raster fangen')}
            title={t('board.snapHint', 'Am Raster fangen (Alt beim Ziehen: frei)')}
          >
            <Icon name="grid" size={15} /> <span className="text-[12px]">{t('board.snapShort', 'Raster')}</span>
          </button>
          <Menu button={menuButton(t('board.menu.template', 'Vorlage'), 'wand')} align="right">
            {(close) => TEMPLATES.map((tpl) => (
              <MenuItem key={tpl.id} icon={<Icon name="board" size={14} style={{ color: 'var(--av-accent)' }} />} onClick={() => { applyTpl(tpl.id); close() }}>
                {tpl.label}
              </MenuItem>
            ))}
          </Menu>
          <Menu button={menuButton(t('board.menu.export', 'Export'), 'external')} align="right">
            {(close) => (
              <>
                <MenuItem icon={<Icon name="library" size={14} />} onClick={() => { exportMarkdown(); close() }}>{t('board.export.markdown', 'Als Markdown')}</MenuItem>
                <MenuItem icon={<Icon name="external" size={14} />} onClick={() => { close(); exportPrint() }}>{t('board.export.pdf', 'Als PDF (Druck)')}</MenuItem>
                <MenuItem icon={<Icon name="grid" size={14} />} onClick={() => { close(); exportSheet() }}>{t('board.export.sheet', 'Kontaktabzug (PDF)')}</MenuItem>
                {/* Der Film als Datei. Die Endung steht im Eintrag, weil sie
                    von diesem Browser abhaengt und nicht von uns. */}
                <MenuItem
                  icon={<Icon name="monitor" size={14} />}
                  onClick={() => { close(); void exportFilm() }}
                >
                  {shots.length === 0
                    ? t('board.export.filmLeer', 'Film — keine Einstellung')
                    : format(t('board.export.film', 'Film als {endung} ({zeit})'), {
                        endung: besterTyp()?.endung.toUpperCase() ?? '—',
                        zeit: formatLaufzeit(sequenceSeconds(shots)),
                      })}
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
      </div>

      {/* Breadcrumb (Board-in-Board-Navigation) */}
      <div className="flex items-center gap-1 border-b border-av-border-muted bg-av-surface-3 px-3 py-1.5 text-[12px]">
        {path.length > 0 && (
          <button type="button" className="av-icon-btn av-focus" style={{ width: 24, height: 24 }} onClick={() => goToCrumb(path.length - 1)} aria-label={t('board.crumb.back', 'Eine Ebene zurück')}><Icon name="undo" size={14} /></button>
        )}
        {crumbs.map((c, i) => (
          <span key={c.id || 'root'} className="flex items-center gap-1">
            {i > 0 && <Icon name="chevron-down" size={12} style={{ transform: 'rotate(-90deg)', color: 'var(--av-text-faint)' }} />}
            <button
              type="button"
              className="av-focus rounded-av-s px-1.5 py-0.5 hover:bg-av-surface-2"
              style={{ color: i === crumbs.length - 1 ? 'var(--av-text)' : 'var(--av-text-muted)', fontWeight: i === crumbs.length - 1 ? 600 : 400 }}
              onClick={() => goToCrumb(i)}
              aria-current={i === crumbs.length - 1 ? 'page' : undefined}
            >
              {i === 0 ? <span className="flex items-center gap-1"><Icon name="board" size={12} /> {c.title}</span> : c.title}
            </button>
          </span>
        ))}
      </div>

      {/* Scroll-Fläche */}
      <div
        ref={scrollRef}
        className="av-scroll relative min-h-0 flex-1 overflow-auto"
        style={{ cursor: spaceDown ? 'grab' : undefined }}
        onPointerDown={onSurfacePointerDown}
        onPointerMove={onSurfacePointerMove}
        onPointerUp={onSurfacePointerUp}
        onWheel={onWheel}
        onContextMenu={(e) => {
          if (panRef.current) { e.preventDefault(); return }
          // Nur auf der FREIEN Flaeche: ueber einer Karte gehoert das
          // Kontextmenue des Browsers hin (Bild kopieren, Link oeffnen).
          if ((e.target as HTMLElement).closest('[data-card-id],[data-column-id]')) return
          e.preventDefault()
          const p = toBoard(e.clientX, e.clientY)
          setEinfuegenAn({ x: p.x, y: p.y, sx: e.clientX, sy: e.clientY })
        }}
        onDragOver={(e) => { e.preventDefault() }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files, toBoard(e.clientX, e.clientY)) }}
      >
        <div
          ref={boardRef}
          className="relative origin-top-left"
          /* Das Punktraster ist eine ZEICHNUNG, kein Farbverlauf im Sinne von
             ADR-007: der Verlauf zeichnet den Punkt, er faerbt keine Flaeche.
             Dieselbe benannte Ausnahme wie der Chevron des Auswahlfelds. */
          style={{
            width: planeW,
            height: planeH,
            transform: `scale(${zoom})`,
            backgroundImage: 'radial-gradient(circle, var(--av-border-muted) 1px, transparent 1px)',
            backgroundSize: `${GRID}px ${GRID}px`,
          }}
        >
          {marquee && (
            <div
              className="pointer-events-none absolute z-30 border border-dashed border-av-accent"
              style={{ left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h, background: 'color-mix(in srgb, var(--av-accent) 12%, transparent)' }}
            />
          )}
          {/* Die Zeiger der anderen liegen HIER — in Flaechen-Koordinaten,
              also mit demselben Zoom wie die Karten. */}
          <MitmachZeiger andere={mitmachen.andere} />
          {/* Spalten-Panels */}
          {columns.map((col) => {
            const r = layout.get(col.id)!
            const selected = isSelected(col.id)
            const alleinGewaehlt = selected && selection.length === 1
            const hasChildren = cards.some((c) => c.columnId === col.id)
            return (
              <div key={col.id} data-column-id={col.id} className="absolute rounded-av-card border border-dashed border-av-border bg-av-surface-1/40" style={{ left: r.x, top: r.y, width: r.w, height: r.h, boxShadow: selected ? '0 0 0 2px var(--av-accent)' : undefined }}>
                <div
                  className="flex h-[34px] items-center gap-2 border-b border-av-border-muted px-2.5"
                  style={{ cursor: 'grab' }}
                  onPointerDown={(e) => onHeaderPointerDown(e, col)}
                  onPointerMove={onHeaderPointerMove}
                  onPointerUp={(e) => onHeaderPointerUp(e, col)}
                  onDoubleClick={() => setEditingId(col.id)}
                >
                  <Icon name="layers" size={13} style={{ color: 'var(--av-text-muted)' }} />
                  {editingId === col.id ? (
                    <input autoFocus className="flex-1 bg-transparent text-[12px] font-semibold text-av-text outline-none" value={col.title ?? ''} onChange={(e) => patchCard(col.id, { title: e.target.value })} onBlur={() => setEditingId(null)} onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)} />
                  ) : (
                    <span className="flex-1 truncate text-[12px] font-semibold text-av-text">{col.title}</span>
                  )}
                  {alleinGewaehlt && (
                    <button
                      type="button"
                      className="av-icon-btn"
                      style={{ width: 22, height: 22 }}
                      onClick={async () => {
                        // Spalte mit Inhalt: gestylte Rückfrage (kein window.confirm).
                        if (hasChildren && !(await confirmDialog(
                          t('board.column.deleteConfirm', 'Spalte mit Inhalt endgültig löschen?'),
                          { destructive: true, okLabel: t('board.column.delete', 'Spalte löschen'), cancelLabel: t('board.cancel', 'Abbrechen') },
                        ))) return
                        removeCard(col.id)
                      }}
                      aria-label={t('board.column.delete', 'Spalte löschen')}
                    >
                      <Icon name="close" size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Verbindungen */}
          <svg className="pointer-events-none absolute inset-0" width={planeW} height={planeH}>
            <defs>
              {/* Die Pfeilspitze sitzt AUF dem Linienende (`refX` am
                  Spitzenende) und nicht dahinter — sonst steht sie im Bild
                  der Zielkarte statt an ihrer Kante. */}
              <marker id="av-pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--av-accent)" />
              </marker>
            </defs>
            {/* SZENEN. Woertlich aus der Hilfe von recceboard: „Shots placed
                close together on the same line are joined by a dotted line:
                they read as one scene." Die Linie wird GERECHNET und nicht
                gespeichert — wer eine Einstellung wegzieht, loest sie aus
                der Szene, und niemand muss eine Gruppe aufloesen. */}
            {szenen.flatMap((gruppe) =>
              gruppe.slice(1).map((sh, i) => {
                const a = layout.get(gruppe[i]!.card.id)
                const b = layout.get(sh.card.id)
                if (!a || !b) return null
                const y = a.y + a.h / 2
                return (
                  <line
                    key={`szene-${sh.card.id}`}
                    x1={a.x + a.w}
                    y1={y}
                    x2={b.x}
                    y2={b.y + b.h / 2}
                    stroke="var(--av-text-muted)"
                    strokeWidth={1.5}
                    strokeDasharray="2 4"
                  />
                )
              }),
            )}
            {connections.map((x) => {
              const a = anchorOut(x.from); const b = anchorIn(x.to)
              if (!a || !b) return null
              const d = linkPath(a, b)
              const gewaehlt = selectedLink === x.id
              return (
                <g key={x.id}>
                  {/* Eine unsichtbare, breite Linie darunter: eine 1,6 px
                      duenne Kurve trifft niemand mit der Maus. Erst damit
                      laesst sich eine falsch gezogene Verbindung ueberhaupt
                      anfassen — bis hierher war sie nur durch Loeschen einer
                      der beiden Karten wieder wegzubekommen. */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={14}
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onPointerDown={(e) => { e.stopPropagation(); setSelectedLink(x.id); setSelection([]) }}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--av-accent)"
                    strokeWidth={gewaehlt ? 2.6 : 1.6}
                    opacity={gewaehlt ? 1 : 0.7}
                    markerEnd={x.plain ? undefined : 'url(#av-pfeil)'}
                  />
                </g>
              )
            })}
            {connectFrom && tempPoint && anchorOut(connectFrom) && (
              <path d={linkPath(anchorOut(connectFrom)!, tempPoint)} fill="none" stroke="var(--av-accent)" strokeWidth={1.6} strokeDasharray="5 4" />
            )}
          </svg>

          {/* Der Loeschknopf einer gewaehlten Verbindung.
              Er steht in der Mitte der Kurve und nicht in einem Menue: eine
              Verbindung hat keine Kopfzeile, an der ein Menue haengen
              koennte, und die Entfernen-Taste allein findet niemand. */}
          {(() => {
            const x = connections.find((c) => c.id === selectedLink)
            if (!x) return null
            const a = anchorOut(x.from); const b = anchorIn(x.to)
            if (!a || !b) return null
            return (
              <div
                className="absolute z-30 flex items-center gap-0.5 border border-av-border bg-av-surface-2 p-0.5"
                style={{ left: (a.x + b.x) / 2 - 28, top: (a.y + b.y) / 2 - 14 }}
              >
                {/* Linie oder Pfeil — eine Aussage und keine Verzierung: die
                    Linie sagt „gehoert zusammen", der Pfeil „daraus folgt". */}
                <button
                  type="button"
                  className="av-focus grid h-6 w-6 place-items-center text-av-text"
                  onClick={() => mutate((bd) => ({
                    ...bd,
                    connections: bd.connections.map((c) => (c.id === x.id ? { ...c, plain: !c.plain } : c)),
                  }))}
                  aria-label={x.plain ? t('board.link.toArrow', 'Als Pfeil zeichnen') : t('board.link.toLine', 'Als Linie zeichnen')}
                  title={x.plain ? t('board.link.toArrow', 'Als Pfeil zeichnen') : t('board.link.toLine', 'Als Linie zeichnen')}
                >
                  <Icon name={x.plain ? 'redo' : 'ruler'} size={13} />
                </button>
                <button
                  type="button"
                  className="av-focus grid h-6 w-6 place-items-center text-av-text"
                  onClick={() => { mutate((bd) => ({ ...bd, connections: bd.connections.filter((c) => c.id !== x.id) })); setSelectedLink(null) }}
                  aria-label={t('board.link.delete', 'Verbindung löschen')}
                >
                  <Icon name="close" size={13} />
                </button>
              </div>
            )
          })()}

          {/* Karten */}
          {drawCards.map((card) => {
            const r = layout.get(card.id)
            if (!r) return null
            return (
              <BoardCardView
                key={card.id} card={card} rect={r} dim={!matchesQuery(card)}
                selected={isSelected(card.id)} allein={selection.length === 1 && isSelected(card.id)}
                editing={editingId === card.id}
                shot={shotById.get(card.id)} boardFormat={current.format} crew={crew}
                plan={plan} onZeigen={onZeigen}
                offen={offeneKommentare.get(card.id) ?? 0} onFaden={() => { selectOnly(card.id); setFadenAn(card.id) }}
                onVorschau={() => holeVorschauFuer(card)} vorschauLaeuft={vorschauLaeuft === card.id}
                onHeaderPointerDown={(e) => onHeaderPointerDown(e, card)}
                onHeaderPointerMove={onHeaderPointerMove}
                onHeaderPointerUp={(e) => onHeaderPointerUp(e, card)}
                onStartEdit={() => setEditingId(card.id)} onEndEdit={() => setEditingId(null)}
                onOpen={() => openBoard(card.id)}
                onPatch={(patch) => patchCard(card.id, patch)} onDelete={() => removeCard(card.id)}
                onStartConnect={(e) => { e.stopPropagation(); setConnectFrom(card.id); setTempPoint(toBoard(e.clientX, e.clientY)) }}
                onResizePointerDown={(e) => onResizePointerDown(e, card)}
                onResizePointerMove={onResizePointerMove}
                onResizePointerUp={onResizePointerUp}
              />
            )
          })}

          {cards.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 text-center">
              <div className="text-[15px] font-semibold text-av-text-secondary">{path.length ? t('board.empty.subboard', 'Leeres Unterboard') : t('board.empty.board', 'Leeres Board')}</div>
              <div className="mt-1 text-[13px] text-av-text-muted">{t('board.empty.hint', 'Füge oben Karten hinzu oder wende eine Vorlage an.')}</div>
              <div className="mt-2 text-[12px] text-av-text-faint">{t('board.empty.gestures', 'Ziehen wählt mehrere aus · Leertaste oder mittlere Maustaste schiebt die Fläche · Strg/Cmd + Mausrad zoomt')}</div>
            </div>
          )}
        </div>
      </div>

      {einfuegenAn && (
        <>
          {/* Die Klickfalle liegt UNTER dem Menue und faengt alles ab: ohne
              sie bliebe das Menue beim naechsten Klick daneben stehen, und
              zwei geoeffnete Menues auf einer Flaeche sind eins zu viel. */}
          <div className="fixed inset-0 z-[190]" onPointerDown={() => setEinfuegenAn(null)} />
          <div
            className="fixed z-[200] min-w-[9rem] border border-av-border bg-av-surface-2 py-1 rounded-av-control shadow-av-2"
            style={{ left: Math.min(einfuegenAn.sx, window.innerWidth - 170), top: Math.min(einfuegenAn.sy, window.innerHeight - 352) }}
            role="menu"
            aria-label={t('board.insert.here', 'Hier einfügen')}
          >
            <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-av-text-faint">
              {t('board.insert.here', 'Hier einfügen')}
            </div>
            {ADD_TYPES.map((ty) => (
              <button
                key={ty}
                type="button"
                role="menuitem"
                className="av-focus flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-av-text hover:bg-av-surface-3"
                onClick={() => { addCard(ty, { x: einfuegenAn.x, y: einfuegenAn.y }); setEinfuegenAn(null) }}
              >
                <Icon name={CARD_META[ty].icon} size={14} /> {CARD_META[ty].label}
              </button>
            ))}
            <button
              type="button"
              role="menuitem"
              className="av-focus flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-av-text hover:bg-av-surface-3"
              onClick={() => { setWaehler({ at: { x: einfuegenAn.x, y: einfuegenAn.y } }); setEinfuegenAn(null) }}
            >
              <Icon name={CARD_META.object.icon} size={14} /> {t('board.insert.object', 'Plan-Objekt …')}
            </button>
          </div>
        </>
      )}

      {waehler && (
        <ObjektWaehler
          plan={plan}
          onWahl={(ref) => { addCard('object', waehler.at, ref); setWaehler(null) }}
          onClose={() => setWaehler(null)}
        />
      )}

      {/* DER FADEN. Er liegt neben der Flaeche und nicht auf ihr: eine
          Sprechblase an der Karte waere beim Zoomen entweder unlesbar oder
          so gross, dass sie das Board verdeckt, ueber das gesprochen wird. */}
      {fadenAn && (
        <aside
          className="absolute bottom-3 right-3 z-[120] flex max-h-[60%] w-80 flex-col gap-2 overflow-auto rounded-av-card border border-av-border bg-av-surface-2 p-3"
          aria-label={t('kommentar.zeigen', 'Kommentare')}
        >
          <div className="flex items-center gap-2">
            <Icon name="library" size={14} style={{ color: 'var(--av-accent)' }} />
            <span className="truncate text-[12.5px] font-semibold text-av-text">
              {cardById.get(fadenAn)?.title ?? cardById.get(fadenAn)?.text ?? t('kommentar.zeigen', 'Kommentare')}
            </span>
            <button
              type="button"
              className="av-icon-btn av-focus ml-auto"
              style={{ width: 24, height: 24 }}
              onClick={() => setFadenAn(null)}
              aria-label={t('board.play.close', 'Schließen')}
            >
              <Icon name="close" size={14} />
            </button>
          </div>
          <KommentarFaden
            objektId={fadenAn}
            kommentare={kommentare}
            identitaet={identitaet}
            onSchreiben={(text, antwortAuf) => onKommentar?.(fadenAn, text, antwortAuf)}
            onErledigt={(id, erledigt) => onKommentarErledigt?.(id, erledigt)}
            onEinstellungen={onEinstellungen}
          />
        </aside>
      )}

      {exportAnteil !== null && (
        <div className="absolute bottom-3 left-1/2 z-[130] -translate-x-1/2 border border-av-border bg-av-surface-2 px-3 py-1.5 text-[12px] text-av-text">
          {format(t('board.film.laeuft', 'Film wird aufgenommen … {prozent} %'), {
            prozent: Math.round(exportAnteil * 100),
          })}
          <span className="ml-2 text-av-text-muted">
            {t('board.film.echtzeit', 'läuft in Echtzeit — so lang wie der Film')}
          </span>
        </div>
      )}

      {vorschauMeldung && (
        <div className="absolute bottom-3 left-1/2 z-[130] -translate-x-1/2 border border-av-border bg-av-surface-2 px-3 py-1.5 text-[12px] text-av-text">
          {vorschauMeldung}
          <button
            type="button"
            className="av-focus ml-3 text-av-accent"
            onClick={() => setVorschauMeldung(null)}
          >
            {t('board.link.previewOk', 'Verstanden')}
          </button>
        </div>
      )}

      {sucher && <KameraDialog onFoto={(f) => addDateiKarte(f)} onClose={() => setSucher(false)} />}

      {spielt && (
        <BoardPlayer
          shots={shots}
          boardFormat={current.format}
          tonSrc={current.tonSrc}
          title={crumbs[crumbs.length - 1]?.title ?? title}
          onClose={() => setSpielt(false)}
        />
      )}

      <PrintDoc title={title} board={druckModus === 'sheet' ? current : root} mode={druckModus} format={current.format} plan={plan} />
    </div>
  )
}

/**
 * Wo die Bildgrenze auf einer Karte liegt.
 *
 * Die Karte ist so hoch, wie ihr eigenes Seitenverhaeltnis es vorgibt; das
 * Format des Boards ist ein anderes. Gerechnet wird deshalb der Ausschnitt,
 * der bei GLEICHER BREITE in der Karte liegt — das ist die Grenze, die man
 * beim Drehen einhalten muesste.
 */
function bildgrenze(rect: Rect, ratio: number): { top: number; bottom: number } {
  const hoehe = rect.w / ratio
  const rand = Math.max(0, (rect.h - hoehe) / 2)
  return { top: rand, bottom: rand }
}

/* ── Druck-Dokument (per @media print sichtbar, rekursiv über Unterboards) ──*/
function PrintBoard({ board, title, level, plan }: { board: Board; title: string; level: number; plan?: PlanAusschnitt }) {
  const t = useT()
  const H = `h${Math.min(6, level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const rendered = new Set<string>()
  const renderCard = (c: BoardCard) => {
    switch (c.type) {
      case 'heading': return <p key={c.id}><strong>{c.text}</strong></p>
      case 'note': return <p key={c.id}>{c.text}</p>
      case 'link': return <p key={c.id}><a href={`https://${c.url}`}>{c.title ?? c.url}</a></p>
      case 'todo': return <div key={c.id}><strong>{c.title}</strong><ul>{c.items?.map((it, i) => <li key={i}>{it.done ? '☑' : '☐'} {it.text}</li>)}</ul></div>
      case 'color': return <p key={c.id}>■ {c.title} ({c.color})</p>
      case 'look': return <p key={c.id}>{format(t('board.print.look', 'Look: {title}'), { title: c.title ?? '' })}</p>
      case 'image': return <div key={c.id}>{c.src ? <img src={c.src} alt={c.title ?? t('board.photoAlt', 'Foto')} style={{ maxWidth: 320, display: 'block', margin: '6px 0' }} /> : null}<em>{c.title}</em></div>
      case 'column': return null
      case 'board': return <PrintBoard key={c.id} board={c.board ?? { cards: [], connections: [] }} title={format(t('board.print.subboardTitle', '{title} (Unterboard)'), { title: c.title ?? t('board.type.board', 'Unterboard') })} level={level + 1} plan={plan} />
      case 'object': {
        const a = objektAnzeige(c, plan)
        const id = c.ref?.id ?? '—'
        return (
          <p key={c.id}>
            {objektTitel(a) ?? (a.status === 'weg'
              ? format(t('board.object.goneShort', 'Nicht mehr im Plan ({id})'), { id })
              : format(t('board.object.noPlanShort', 'Plan-Objekt {id} (kein Plan geöffnet)'), { id }))}
          </p>
        )
      }
    }
  }
  return (
    <section>
      <H>{title}</H>
      {board.cards.filter((c) => c.type === 'column').map((col) => (
        <section key={col.id}>
          <strong>{col.title}</strong>
          {board.cards.filter((c) => c.columnId === col.id).map((m) => { rendered.add(m.id); return renderCard(m) })}
          {(() => { rendered.add(col.id); return null })()}
        </section>
      ))}
      {board.cards.filter((c) => !rendered.has(c.id) && c.type !== 'column' && !c.columnId).map(renderCard)}
    </section>
  )
}

/**
 * Der Kontaktabzug: die Einstellungen als Raster, wie ein Storyboard
 * gedruckt wird.
 *
 * Er steht NEBEN dem Dokument-Ausdruck und ersetzt ihn nicht: das Dokument
 * ist das ganze Board mit Notizen, To-dos und Unterboards, der Kontaktabzug
 * sind die Einstellungen in Schnittfolge. Wer das Board bespricht, braucht
 * das eine; wer es dreht, das andere.
 */
function ContactSheet({ title, board, format: bildformat }: { title: string; board: Board; format?: BoardFormat }) {
  const t = useT()
  const shots = shotSequence(board)
  return (
    <section>
      <h1>{title}</h1>
      <p>
        {format(t('board.sheet.head', '{n} Einstellungen · Laufzeit {zeit}{format}'), {
          n: shots.length,
          zeit: formatLaufzeit(sequenceSeconds(shots)),
          format: bildformat ? ` · ${bildformat}` : '',
        })}
      </p>
      <div className="board-sheet">
        {shots.map((sh) => {
          const c = sh.card
          // Das Kaestchen bekommt das Seitenverhaeltnis der Karte; die
          // gestrichelte Grenze darin ist das Format des Boards.
          const kartenRatio = c.ratio ?? 16 / 9
          const rand = bildformat
            ? Math.max(0, (1 / kartenRatio - 1 / BOARD_FORMAT_RATIO[bildformat]) / 2 / (1 / kartenRatio)) * 100
            : 0
          return (
            <figure key={c.id}>
              <div className="shot-bild" style={{ aspectRatio: String(kartenRatio) }}>
                {c.src ? (
                  <img src={c.src} alt={c.title ?? ''} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: c.color ?? '#ccc' }} />
                )}
                {bildformat && rand > 0.5 && (
                  <div className="shot-grenze" style={{ top: `${rand}%`, bottom: `${rand}%` }} />
                )}
              </div>
              <figcaption>
                <span className="shot-nr">{sh.nr}</span> {c.title ?? ''}
                <br />
                <span className="shot-zeit">
                  {formatLaufzeit(sh.startS)} · {sh.durationS} s
                </span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}

function PrintDoc({ title, board, mode, format: bildformat, plan }: { title: string; board: Board; mode: 'doc' | 'sheet'; format?: BoardFormat; plan?: PlanAusschnitt }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="board-print">
      {mode === 'sheet'
        ? <ContactSheet title={title} board={board} format={bildformat} />
        : <PrintBoard board={board} title={title} level={1} plan={plan} />}
    </div>,
    document.body,
  )
}

/* ── Einzelne Karte ────────────────────────────────────────────────────────*/
function BoardCardView({
  card, rect, selected, allein, editing, dim, shot, boardFormat, crew, plan, onZeigen, offen, onFaden, onVorschau, vorschauLaeuft,
  onHeaderPointerDown, onHeaderPointerMove, onHeaderPointerUp,
  onStartEdit, onEndEdit, onOpen, onPatch, onDelete, onStartConnect,
  onResizePointerDown, onResizePointerMove, onResizePointerUp,
}: {
  card: BoardCard; rect: Rect; selected: boolean; editing: boolean; dim: boolean
  /**
   * EINZIGE gewaehlte Karte.
   *
   * Die kleine Leiste ueber der Karte (Farben, Loeschen) und der Griff zum
   * Verbinden gehoeren genau dann dorthin. Bei zehn gewaehlten Karten waeren
   * es zehn Leisten und zehn Griffe — ein Bildschirm voller Knoepfe, von
   * denen jeder etwas anderes tut als der, den man gerade meint. Was fuer
   * mehrere gilt, steht in der Werkzeugleiste oben („10 ausgewaehlt ·
   * Verdoppeln · Loeschen"), und das ist ein Ort statt zehn.
   */
  allein: boolean
  /** Gesetzt, wenn diese Karte eine Einstellung der Schnittfolge ist. */
  shot?: Shot
  boardFormat?: BoardFormat
  /** Die Crew dieses Projekts — die Namen, an die eine Aufgabe gehen kann. */
  crew: string[]
  plan?: PlanAusschnitt
  onZeigen?: (modul: HeimatModul, id: string) => void
  /** Offene Kommentare an DIESER Karte. 0 heisst: nichts anzeigen. */
  offen: number
  onFaden: () => void
  onVorschau: () => void
  /** Laeuft der Abruf gerade? Ein Knopf ohne Rueckmeldung wirkt kaputt. */
  vorschauLaeuft: boolean
  onHeaderPointerDown: (e: React.PointerEvent) => void
  onHeaderPointerMove: (e: React.PointerEvent) => void
  onHeaderPointerUp: (e: React.PointerEvent) => void
  onStartEdit: () => void; onEndEdit: () => void; onOpen: () => void
  onPatch: (patch: Partial<BoardCard>) => void; onDelete: () => void
  onStartConnect: (e: React.PointerEvent) => void
  onResizePointerDown: (e: React.PointerEvent) => void
  onResizePointerMove: (e: React.PointerEvent) => void
  onResizePointerUp: (e: React.PointerEvent) => void
}) {
  const t = useT()
  const isBoard = card.type === 'board'
  return (
    <div data-card-id={card.id} className="absolute select-none" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: dim ? 0.28 : 1 }}>
      {allein && (
        <div className="absolute -top-8 left-0 z-20 flex items-center gap-1 rounded-av-control border border-av-border bg-av-surface-2 p-0.5">
          {/* FARBE FUER JEDE KARTE, nicht nur fuer Farb- und Look-Karten.
              Auf einem Milanote-artigen Board ist die Farbe einer Notiz eine
              Ordnung: „alles Gelbe ist offen". Bis hierher konnten genau
              zwei Kartenarten eine tragen, und die Ordnung war damit nicht
              zu machen. Das letzte Feld nimmt sie wieder weg — ohne das
              waere eine einmal gesetzte Farbe endgueltig. */}
          {card.type !== 'board' && card.type !== 'column' && (
            <button
              type="button"
              className="av-focus grid h-4 w-4 place-items-center border border-av-border text-[9px] text-av-text-muted"
              onClick={() => onPatch({ color: undefined })}
              aria-label={t('board.color.none', 'Ohne Farbe')}
              title={t('board.color.none', 'Ohne Farbe')}
            >
              ×
            </button>
          )}
          {card.type !== 'board' && card.type !== 'column' && SWATCHES.slice(0, 6).map((s) => (
            <button key={s} type="button" className="h-4 w-4 rounded-av-s border border-av-border" style={{ background: s }} onClick={() => onPatch({ color: s })} aria-label={format(t('board.swatch', 'Farbe {color}'), { color: s })} />
          ))}
          {card.type === 'link' && (
            /* Die Vorschau HOLEN — ein Knopf und kein Automatismus. Ein
               Board, das beim Oeffnen zwanzig fremde Server anfragt, sagt
               diesen zwanzig Servern, wann jemand sein Projekt aufmacht.
               Wer eine Vorschau will, holt sie. */
            <button
              type="button"
              className="av-focus flex items-center gap-1 px-1 text-[11px] text-av-text-muted hover:text-av-text"
              onClick={onVorschau}
              disabled={vorschauLaeuft}
              style={vorschauLaeuft ? { opacity: 0.5 } : undefined}
              aria-label={t('board.link.preview', 'Vorschau holen')}
              title={t('board.link.preview', 'Vorschau holen')}
            >
              <Icon name={vorschauLaeuft ? 'redo' : 'eye'} size={13} />
            </button>
          )}
          {/* KOMMENTARE. Der Knopf steht an JEDER Karte und nicht nur an
              denen, die schon einen Faden haben — sonst liesse sich der
              erste nie schreiben. Die Zahl erscheint nur, wenn es etwas
              Offenes gibt: eine „0" waere eine Zeile Auskunft ueber nichts. */}
          <button
            type="button"
            className="av-focus flex items-center gap-1 px-1 text-[11px] text-av-text-muted hover:text-av-text"
            onClick={onFaden}
            aria-label={t('kommentar.zeigen', 'Kommentare')}
            title={t('kommentar.zeigen', 'Kommentare')}
          >
            <Icon name="library" size={13} />
            {offen > 0 && <span className="tabular-nums text-av-accent">{offen}</span>}
          </button>
          {shot && (
            /* Die Standzeit gehoert an die Einstellung und nicht in einen
               Dialog: sie wird beim Ansehen des Bildes geaendert, nicht
               danach. Leer heisst „Vorgabe des Boards" — deshalb steht hier
               kein Pflichtwert und keine Null. */
            <label className="flex items-center gap-1 px-1 text-[11px] text-av-text-muted">
              <input
                type="number"
                min={0.2}
                max={120}
                step={0.5}
                value={card.durationS ?? ''}
                placeholder={String(shot.durationS)}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  onPatch({ durationS: e.target.value === '' || !Number.isFinite(v) || v <= 0 ? undefined : v })
                }}
                className="av-focus w-12 border border-av-border bg-av-surface-3 px-1 py-0.5 text-[11px] tabular-nums text-av-text"
                aria-label={t('board.shot.duration', 'Standzeit in Sekunden')}
              />
              s
            </label>
          )}
          <button type="button" className="av-icon-btn" style={{ width: 24, height: 24 }} onClick={onDelete} aria-label={t('board.card.delete', 'Karte löschen')}><Icon name="close" size={14} /></button>
        </div>
      )}
      {allein && (
        <button type="button" className="absolute top-1/2 z-20 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-av-s border border-av-border bg-av-surface-2 text-av-accent" style={{ right: -10 }} onPointerDown={onStartConnect} aria-label={t('board.connect', 'Verbindung ziehen')}>
          <Icon name="nodes" size={11} />
        </button>
      )}
      {/* DIE NUMMER DER EINSTELLUNG steht auf der Karte und nicht nur im Film.
          Ein Storyboard wird im Ausdruck besprochen („die Drei nach der
          Totalen"), und eine Reihenfolge, die man nur im Abspielen sieht,
          laesst sich nicht besprechen. */}
      {offen > 0 && !allein && (
        <div
          className="pointer-events-none absolute -right-1 -top-1 z-10 grid h-4 min-w-4 place-items-center rounded-av-pill px-1 text-[10px] font-semibold tabular-nums"
          style={{ background: 'var(--av-accent)', color: 'var(--av-accent-text)' }}
          aria-hidden="true"
        >
          {offen}
        </div>
      )}
      {shot && (
        <div className="pointer-events-none absolute left-1 top-1 z-10 flex items-center gap-1 bg-av-surface-1/90 px-1.5 py-0.5 text-[11px] tabular-nums text-av-text">
          <span className="font-semibold">{shot.nr}</span>
          <span className="text-av-text-muted">{shot.durationS} s</span>
        </div>
      )}
      <div
        className="h-full w-full overflow-hidden rounded-av-card"
        style={{ boxShadow: selected ? '0 0 0 2px var(--av-accent)' : undefined, cursor: 'grab' }}
        onPointerDown={onHeaderPointerDown} onPointerMove={onHeaderPointerMove} onPointerUp={onHeaderPointerUp}
        onDoubleClick={() => { if (isBoard) onOpen(); else if (card.type !== 'color' && card.type !== 'todo' && card.type !== 'object') onStartEdit() }}
      >
        {isBoard
          ? <BoardTile card={card} selected={selected} onPatch={onPatch} onOpen={onOpen} />
          : card.type === 'object'
            ? <ObjektKarte anzeige={objektAnzeige(card, plan)} farbe={card.color} onZeigen={onZeigen} />
            : <CardBody card={card} editing={editing} onEndEdit={onEndEdit} onPatch={onPatch} crew={crew} />}
      </div>
      {/* Die Bildgrenze liegt UEBER dem Bild und schneidet es nicht weg: was
          ausserhalb liegt, ist die Information, die beim Schneiden gebraucht
          wird. */}
      {shot && boardFormat && (
        <div
          className="pointer-events-none absolute z-10 border border-dashed"
          style={{
            borderColor: 'var(--av-accent)',
            left: 0,
            right: 0,
            ...bildgrenze(rect, BOARD_FORMAT_RATIO[boardFormat]),
          }}
        />
      )}
      {allein && card.type !== 'column' && (
        <div
          className="absolute z-20 h-3.5 w-3.5 cursor-nwse-resize rounded-av-s border border-av-accent bg-av-surface-2"
          style={{ right: -6, bottom: -6 }}
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          aria-label={t('board.resize', 'Größe ziehen')}
        />
      )}
    </div>
  )
}

function BoardTile({ card, selected, onPatch, onOpen }: { card: BoardCard; selected: boolean; onPatch: (p: Partial<BoardCard>) => void; onOpen: () => void }) {
  const t = useT()
  const count = card.board?.cards.length ?? 0
  return (
    <div className="flex h-full w-full flex-col gap-1.5 border border-av-border bg-av-surface-1 p-2.5" style={{ borderColor: 'var(--av-accent)' }}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-av-s" style={{ background: 'var(--av-accent-dim)', color: 'var(--av-accent)' }}><Icon name="board" size={15} /></span>
        {selected ? (
          <input className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-av-text outline-none" value={card.title ?? ''} onChange={(e) => onPatch({ title: e.target.value })} onPointerDown={(e) => e.stopPropagation()} aria-label={t('board.subboard.title', 'Unterboard-Titel')} />
        ) : (
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-av-text">{card.title}</span>
        )}
      </div>
      <div className="text-[11px] text-av-text-muted">{count} {count === 1 ? t('board.card.one', 'Karte') : t('board.card.many', 'Karten')} · {t('board.type.board', 'Unterboard')}</div>
      <button type="button" className="av-btn av-focus mt-auto" data-size="sm" data-variant="subtle" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onOpen() }}>
        {t('board.open', 'Öffnen')} <Icon name="external" size={13} />
      </button>
    </div>
  )
}

/**
 * „Der Inhalt ist nicht dabei" — als Aussage, nicht als Fehler.
 *
 * Die Karte kennt die Datei (Name, Groesse, Typ); sie traegt sie nur nicht,
 * weil sie ueber der Einbettungsgrenze lag. Wer das nicht liest, sucht beim
 * naechsten Oeffnen nach einem Bild, das nie da war.
 */
function NichtDabei({ card }: { card: BoardCard }) {
  const t = useT()
  const lang = useLanguage()
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-0.5 bg-av-surface-3 px-2 py-1.5">
      <span className="text-[11px] font-semibold text-av-warn">
        {t('board.file.notEmbedded', 'Inhalt nicht im Projekt')}
      </span>
      <span className="text-[10.5px] leading-snug text-av-text-muted">
        {format(t('board.file.tooLarge', '{groesse} — über der Grenze von {grenze}. Die Datei liegt nur auf diesem Rechner.'), {
          groesse: dateiGroesse(card.fileSize, lang),
          grenze: dateiGroesse(EINBETT_GRENZE, lang),
        })}
      </span>
    </div>
  )
}

/**
 * „3,4 MB" — eine Groesse, wie sie ein Mensch liest.
 *
 * Mit dem Dezimalzeichen der eingestellten Sprache und nicht mit dem Punkt
 * aus `toFixed`: „9.0 MB" liest sich auf Deutsch wie neun Bytes, und die
 * Zahl steht hier neben einer Grenze, an der jemand etwas ablesen soll.
 */
function dateiGroesse(bytes: number | undefined, lang: Language): string {
  if (bytes === undefined) return '—'
  const zahl = (n: number, stellen: number) =>
    new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
      minimumFractionDigits: stellen,
      maximumFractionDigits: stellen,
    }).format(n)
  if (bytes < 1024) return `${zahl(bytes, 0)} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${zahl(kb, kb < 10 ? 1 : 0)} kB`
  const mb = kb / 1024
  return `${zahl(mb, mb < 10 ? 1 : 0)} MB`
}

function CardBody({ card, editing, onEndEdit, onPatch, crew }: { card: BoardCard; editing: boolean; onEndEdit: () => void; onPatch: (p: Partial<BoardCard>) => void; crew: string[] }) {
  const t = useT()
  const lang = useLanguage()
  if (card.type === 'heading') {
    return editing
      ? <input autoFocus className="w-full bg-transparent text-[18px] font-bold text-av-text outline-none" value={card.text ?? ''} onChange={(e) => onPatch({ text: e.target.value })} onBlur={onEndEdit} onKeyDown={(e) => e.key === 'Enter' && onEndEdit()} />
      : <div className="text-[18px] font-bold tracking-tight text-av-text">{card.text}</div>
  }
  if (card.type === 'note') {
    return (
      <div
        className="h-full w-full border border-av-border p-2.5"
        style={{
          // Die gewaehlte Farbe als LASUR und nicht als Flaeche: eine Notiz
          // in vollem Orange traegt keinen lesbaren Text mehr, und auf einem
          // Board sind Farben Ordnung, keine Fuellung.
          background: card.color
            ? `color-mix(in srgb, ${card.color} 18%, var(--av-surface-1))`
            : 'color-mix(in srgb, var(--av-warn) 12%, var(--av-surface-1))',
          borderColor: card.color ? `color-mix(in srgb, ${card.color} 55%, var(--av-border))` : undefined,
        }}
      >
        {editing
          ? <textarea autoFocus className="h-full w-full resize-none bg-transparent text-[12.5px] leading-snug text-av-text outline-none" value={card.text ?? ''} onChange={(e) => onPatch({ text: e.target.value })} onBlur={onEndEdit} />
          : <p className="text-[12.5px] leading-snug text-av-text">{card.text}</p>}
      </div>
    )
  }
  if (card.type === 'link') {
    const v = card.vorschau
    return (
      <div className="flex h-full w-full flex-col overflow-hidden border border-av-border bg-av-surface-1">
        {/* DAS VORSCHAUBILD, falls die Seite eines nennt. Es wird hier
            GELADEN und nicht ins Projekt kopiert: ein heruntergeladenes Bild
            waere eine fremde Datei im Projekt, ohne dass jemand sie abgelegt
            hat. Laedt es nicht, verschwindet es — die Karte bleibt lesbar. */}
        {v?.bildUrl && (
          <img
            src={v.bildUrl}
            alt=""
            className="h-20 w-full flex-none object-cover"
            draggable={false}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}
        <div className="flex min-h-0 flex-1 items-center gap-2.5 p-2.5">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-av-s bg-av-surface-3 text-av-accent"><Icon name="external" size={15} /></span>
        {editing ? (
          <span className="min-w-0 flex-1">
            <input autoFocus className="w-full bg-transparent text-[12.5px] font-semibold text-av-text outline-none" value={card.title ?? ''} onChange={(e) => onPatch({ title: e.target.value })} onBlur={onEndEdit} />
            <input className="w-full bg-transparent text-[11px] text-av-text-muted outline-none" value={card.url ?? ''} onChange={(e) => onPatch({ url: e.target.value })} onBlur={onEndEdit} />
          </span>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold text-av-text">
              {v?.titel ?? card.title}
            </span>
            {v?.beschreibung && (
              <span className="mt-0.5 block overflow-hidden text-[11px] leading-snug text-av-text-secondary" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {v.beschreibung}
              </span>
            )}
            <span className="block truncate text-[11px] text-av-accent">{v?.host ?? card.url}</span>
          </span>
        )}
        </div>
      </div>
    )
  }
  if (card.type === 'todo') {
    return (
      <div className="h-full w-full border border-av-border bg-av-surface-1 p-2.5">
        <div className="mb-1.5 text-[12px] font-semibold text-av-text">{card.title}</div>
        <ul className="flex flex-col gap-1">
          {card.items?.map((it, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px]">
              <button type="button" className="grid h-3.5 w-3.5 flex-none place-items-center rounded-av-s" style={{ border: it.done ? 'none' : '1.5px solid var(--av-border)', background: it.done ? 'var(--av-ok)' : 'transparent', color: 'var(--av-accent-text)' }} onClick={() => onPatch({ items: card.items?.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} aria-label={it.done ? t('board.todo.done', 'Erledigt') : t('board.todo.open', 'Offen')}>
                {it.done && <Icon name="check" size={10} />}
              </button>
              <span className={`min-w-0 flex-1 truncate ${it.done ? 'text-av-text-faint line-through' : 'text-av-text-secondary'}`}>{it.text}</span>
              {/* AUFGABEN VERTEILEN — an jemanden, den es gibt.
                  Die Liste kommt aus der Crew DIESES Projekts, nicht aus
                  einem freien Feld: eine Aufgabe an „Max" ist keine
                  Zuteilung, solange niemand weiss, welcher Max. */}
              {crew.length > 0 && (
                <select
                  value={it.owner ?? ''}
                  onChange={(e) =>
                    onPatch({
                      items: card.items?.map((x, j) =>
                        j === i ? { ...x, owner: e.target.value || undefined } : x,
                      ),
                    })
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                  className="av-focus max-w-[7.5rem] flex-none border border-av-border bg-av-surface-3 px-1 py-0.5 text-[10.5px] text-av-text-muted"
                  aria-label={t('board.todo.owner', 'Zuständig')}
                >
                  <option value="">{t('board.todo.unassigned', '— niemand —')}</option>
                  {/* Ein Name, der an der Aufgabe steht, aber nicht mehr in
                      der Crew, bleibt waehlbar: sonst fiele er beim naechsten
                      Oeffnen still heraus. */}
                  {[...new Set([...crew, ...(it.owner ? [it.owner] : [])])].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (card.type === 'color') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden border border-av-border">
        <div className="flex-1" style={{ background: card.color }} />
        <div className="flex items-center justify-between bg-av-surface-1 px-2 py-1">
          <span className="truncate text-[11px] text-av-text-secondary">{card.title}</span>
          <span className="av-num text-[10px] text-av-text-faint">{card.color}</span>
        </div>
      </div>
    )
  }
  if (card.type === 'video') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden border border-av-border bg-av-surface-1">
        {card.src ? (
          // `controls` und sonst nichts: kein Autoplay, keine Schleife. Ein
          // Board mit vier Filmen, die von allein loslaufen, ist ein Laerm
          // und kein Moodboard.
          <video src={card.src} controls preload="metadata" className="min-h-0 flex-1 bg-black" />
        ) : (
          <NichtDabei card={card} />
        )}
        <div className="truncate bg-av-surface-1 px-2 py-1 text-[11px] text-av-text-secondary">{card.title}</div>
      </div>
    )
  }
  if (card.type === 'audio') {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-1.5 overflow-hidden border border-av-border bg-av-surface-1 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <Icon name="signal" size={14} style={{ color: 'var(--av-accent)' }} />
          <span className="truncate text-[12px] font-semibold text-av-text">{card.title}</span>
        </div>
        {card.src
          ? <audio src={card.src} controls preload="metadata" className="w-full" style={{ height: 32 }} />
          : <NichtDabei card={card} />}
      </div>
    )
  }
  if (card.type === 'file') {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-1 overflow-hidden border border-av-border bg-av-surface-1 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <Icon name="library" size={14} style={{ color: 'var(--av-text-muted)' }} />
          <span className="truncate text-[12px] font-semibold text-av-text">{card.title}</span>
        </div>
        <div className="truncate text-[11px] text-av-text-muted">{card.fileName}</div>
        {card.embedded === false ? (
          <NichtDabei card={card} />
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-av-text-faint">
            <span>{dateiGroesse(card.fileSize, lang)}</span>
            {card.src && (
              <a
                href={card.src}
                download={card.fileName}
                className="av-focus text-av-accent underline"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {t('board.file.save', 'Speichern')}
              </a>
            )}
          </div>
        )}
      </div>
    )
  }
  if (card.type === 'image') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden border border-av-border bg-av-surface-1">
        {card.src
          ? <img src={card.src} alt={card.title ?? t('board.photoAlt', 'Foto')} className="min-h-0 flex-1 object-cover" draggable={false} />
          : card.embedded === false
            ? <NichtDabei card={card} />
            : <div className="flex-1" style={{ background: 'var(--av-surface-3)' }} />}
        {editing
          ? <input autoFocus className="bg-av-surface-1 px-2 py-1 text-[11px] text-av-text outline-none" value={card.title ?? ''} onChange={(e) => onPatch({ title: e.target.value })} onBlur={onEndEdit} onKeyDown={(e) => e.key === 'Enter' && onEndEdit()} />
          : <div className="truncate bg-av-surface-1 px-2 py-1 text-[11px] text-av-text-secondary">{card.title}</div>}
      </div>
    )
  }
  // look
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border border-av-border">
      <div className="flex-1" style={{ background: card.color }} />
      <div className="bg-av-surface-1 px-2.5 py-1.5 text-[11.5px] font-medium text-av-text">{card.title}</div>
    </div>
  )
}
