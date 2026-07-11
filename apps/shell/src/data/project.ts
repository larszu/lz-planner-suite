/**
 * Seed-Projektmodell der Shell — ein in sich stimmiger Demo-Stand
 * („Sommershow 2026 · Halle A"), der Bibliotheks-Panels, Vorschauen,
 * Eigenschaften und Statusleiste mit echten, konsistenten Zahlen speist.
 * Das ist bewusst Anschauungs-Datenmodell der Shell selbst — die
 * eigentlichen Projektdaten leben in den eingebetteten Planern.
 */

import { CONTAINER_KINDS, type InventoryItem, type StorageNode } from '@avplan/inventory-core'

export interface ProjectMeta {
  name: string
  venue: string
  version: number
  saved: boolean
}

/** Produktionsphase — grob wie in Rentman/Production Planner (Status der Show). */
export type ShowPhase = 'planning' | 'setup' | 'show' | 'teardown'

export type Department = 'video' | 'light' | 'audio' | 'prod'

/** Ein Punkt im Tagesablauf (Run of Show / Day Sheet). */
export interface ScheduleItem {
  time: string
  title: string
  dept: Department | 'all'
}

/** Crew-Mitglied mit Gewerk, Call-Time und Status (Production Planner/Rentman). */
export interface CrewMember {
  name: string
  role: string
  dept: Department
  call: string
  status: 'confirmed' | 'pending'
}

/** Budgetzeile: geschätzt vs. tatsächlich pro Kategorie (Production Planner). */
export interface BudgetLine {
  category: string
  estimatedEur: number
  actualEur: number
}

export interface LogisticsInfo {
  vehicles: { label: string; detail: string }[]
  loadIn: string
  distanceKm: number
}

export interface Contact {
  name: string
  role: string
  org: string
  phone: string
}

export interface ProjectTask {
  title: string
  done: boolean
  due?: string
  owner?: string
}

/* ── Board (Milanote-artiges Kreativ-Canvas) ───────────────────────────────*/

export type BoardCardType = 'heading' | 'note' | 'link' | 'todo' | 'color' | 'look' | 'column' | 'board'

/** Eine Karte auf dem Board (frei positioniert oder in einer Spalte). */
export interface BoardCard {
  id: string
  type: BoardCardType
  x: number
  y: number
  w: number
  title?: string
  text?: string
  url?: string
  /** Farbe für color-/look-Karten (look rendert daraus einen Verlauf). */
  color?: string
  items?: { text: string; done: boolean }[]
  /** Wenn gesetzt: Karte liegt in dieser Spalte (Container), nicht frei. */
  columnId?: string
  /** Für type 'board': das verschachtelte Unterboard (Board in Board). */
  board?: Board
}

export interface BoardConnection {
  id: string
  from: string
  to: string
}

export interface Board {
  cards: BoardCard[]
  connections: BoardConnection[]
}

/** Angereicherte Show-Details fürs Übersichts-Dashboard. */
export interface ShowDetails {
  dateLabel: string
  phase: ShowPhase
  /** Planungsfortschritt 0..1. */
  progress: number
  schedule: ScheduleItem[]
  crew: CrewMember[]
  budget: BudgetLine[]
  logistics: LogisticsInfo
  contacts: Contact[]
  tasks: ProjectTask[]
  /** Kreativ-Board (Moodboard/Notizen) — die Vor-Produktionsebene der Show. */
  board: Board
}

export interface Camera {
  id: string
  name: string
  model: string
  lens: string
  focalMm: number
  hfovDeg: number
  /** Position im Plan (Meter). */
  x: number
  y: number
  linked: boolean
}

export interface Fixture {
  id: string
  name: string
  model: string
  purpose: string
  dimmerPct: number
  dmxChannel: number
  x: number
  y: number
}

export type CableLayer = 'video' | 'dmx' | 'net'

export interface SignalNode {
  id: string
  name: string
  sub: string
  group: 'floor' | 'regie'
  venue: boolean
  /** Position im Signal-Flow (0..1 relativ zur Fläche). */
  nx: number
  ny: number
}

export interface Cable {
  id: string
  label: string
  type: string
  layer: CableLayer
  lengthM: number
  from: string
  to: string
}

export interface SuiteProject {
  meta: ProjectMeta
  cameras: Camera[]
  fixtures: Fixture[]
  nodes: SignalNode[]
  cables: Cable[]
  /** Bühnenmaße (Meter) für die Plan-Vorschau. */
  stage: { x: number; y: number; w: number; h: number }
  hall: { w: number; h: number }
  show: ShowDetails
  /** Kleiner Lager-Ausschnitt (via @avplan/inventory-core) für den Pack-Status. */
  inventory: { items: InventoryItem[]; nodes: StorageNode[] }
}

export const PROJECT: SuiteProject = {
  meta: { name: 'Sommershow 2026', venue: 'Halle A', version: 12, saved: true },
  hall: { w: 24, h: 14 },
  stage: { x: 8, y: 3, w: 8, h: 3.2 },
  cameras: [
    { id: 'cam1', name: 'CAM 1', model: 'Sony FX9', lens: 'FE 24–105 f/4', focalMm: 24, hfovDeg: 73.7, x: 4.2, y: 10.8, linked: true },
    { id: 'cam2', name: 'CAM 2', model: 'Sony FX9', lens: 'FE 24–105 f/4', focalMm: 85, hfovDeg: 12.4, x: 12.0, y: 11.6, linked: true },
    { id: 'cam3', name: 'CAM 3', model: 'Sony VENICE 2', lens: 'FE 70–200 f/2.8', focalMm: 135, hfovDeg: 7.9, x: 20.4, y: 10.6, linked: true },
    { id: 'cam4', name: 'CAM 4', model: 'Sony FR7 PTZ', lens: 'FE 24–105 f/4', focalMm: 35, hfovDeg: 54.4, x: 3.4, y: 4.6, linked: false },
  ],
  fixtures: [
    { id: 'lx1', name: 'LX 1', model: 'ETC Source Four 19°', purpose: 'Key Host', dimmerPct: 82, dmxChannel: 1, x: 8.6, y: 5.6 },
    { id: 'lx2', name: 'LX 2', model: 'ETC Source Four 36°', purpose: 'Fill', dimmerPct: 64, dmxChannel: 4, x: 10.0, y: 5.6 },
    { id: 'lx3', name: 'LX 3', model: 'ETC Source Four 26°', purpose: 'Key Host', dimmerPct: 78, dmxChannel: 7, x: 11.2, y: 5.6 },
    { id: 'lx4', name: 'LX 4', model: 'KL Fresnel 8 FC', purpose: 'Wash', dimmerPct: 55, dmxChannel: 10, x: 12.6, y: 5.6 },
    { id: 'lx5', name: 'LX 5', model: 'KL Panel XL', purpose: 'Backlight', dimmerPct: 70, dmxChannel: 13, x: 14.0, y: 5.6 },
    { id: 'lx6', name: 'LX 6', model: 'PAR 64 CP62', purpose: 'Effekt', dimmerPct: 40, dmxChannel: 16, x: 15.4, y: 5.6 },
  ],
  nodes: [
    { id: 'n_cam1', name: 'CAM 1 — Sony FX9', sub: '3× SDI Out', group: 'floor', venue: true, nx: 0.08, ny: 0.12 },
    { id: 'n_cam2', name: 'CAM 2 — Sony FX9', sub: '3× SDI Out', group: 'floor', venue: true, nx: 0.08, ny: 0.42 },
    { id: 'n_dimmer', name: 'Dimmer Rack 2', sub: '12 Kanäle · 16 A', group: 'floor', venue: true, nx: 0.08, ny: 0.72 },
    { id: 'n_atem', name: 'ATEM Constellation 8K', sub: '40× 12G-SDI In', group: 'regie', venue: false, nx: 0.62, ny: 0.14 },
    { id: 'n_hub', name: 'Videohub 40×40', sub: '12G-SDI Router', group: 'regie', venue: false, nx: 0.62, ny: 0.46 },
    { id: 'n_foh', name: 'FOH — GrandMA', sub: 'Licht-Pult', group: 'regie', venue: false, nx: 0.5, ny: 0.82 },
  ],
  cables: [
    { id: 'v012', label: 'V-012 · CAM2 PGM', type: '12G-SDI', layer: 'video', lengthM: 45, from: 'n_cam2', to: 'n_atem' },
    { id: 'v008', label: 'V-008 · CAM1 PGM', type: '12G-SDI', layer: 'video', lengthM: 45, from: 'n_cam1', to: 'n_atem' },
    { id: 'v021', label: 'V-021 · MV Out', type: '6G-SDI', layer: 'video', lengthM: 60, from: 'n_atem', to: 'n_hub' },
    { id: 'net04', label: 'N-004 · Cam-Ctrl', type: 'Cat6A', layer: 'net', lengthM: 45, from: 'n_cam1', to: 'n_hub' },
    { id: 'dmx03', label: 'D-003 · Dimmer A', type: 'DMX512', layer: 'dmx', lengthM: 25, from: 'n_dimmer', to: 'n_foh' },
  ],
  show: {
    dateLabel: 'Sa 18. Juli 2026',
    phase: 'setup',
    progress: 0.72,
    schedule: [
      { time: '08:00', title: 'Get-in / Anlieferung', dept: 'all' },
      { time: '09:00', title: 'Rigging & Truss', dept: 'light' },
      { time: '10:30', title: 'Strom & DMX-Patch', dept: 'light' },
      { time: '11:00', title: 'SDI-Verkabelung', dept: 'video' },
      { time: '13:00', title: 'Kamera-Check & Whitebalance', dept: 'video' },
      { time: '14:30', title: 'Soundcheck', dept: 'audio' },
      { time: '16:00', title: 'Doors', dept: 'prod' },
      { time: '17:00', title: 'Show', dept: 'prod' },
      { time: '19:30', title: 'Load-out', dept: 'all' },
    ],
    crew: [
      { name: 'Lars Zumpe', role: 'Projektleitung', dept: 'prod', call: '08:00', status: 'confirmed' },
      { name: 'M. Berg', role: 'Video-Engineer', dept: 'video', call: '08:00', status: 'confirmed' },
      { name: 'S. Klein', role: 'Kameramann', dept: 'video', call: '12:00', status: 'confirmed' },
      { name: 'T. Wolf', role: 'Lichttechnik', dept: 'light', call: '09:00', status: 'confirmed' },
      { name: 'A. Roth', role: 'FOH / Ton', dept: 'audio', call: '10:00', status: 'pending' },
      { name: 'J. Frei', role: 'Rigging', dept: 'light', call: '08:00', status: 'confirmed' },
    ],
    budget: [
      { category: 'Video', estimatedEur: 8400, actualEur: 8120 },
      { category: 'Licht', estimatedEur: 5200, actualEur: 5460 },
      { category: 'Ton', estimatedEur: 3100, actualEur: 2980 },
      { category: 'Rigging', estimatedEur: 1800, actualEur: 1800 },
      { category: 'Transport', estimatedEur: 1200, actualEur: 1340 },
      { category: 'Crew', estimatedEur: 6400, actualEur: 6100 },
    ],
    logistics: {
      vehicles: [
        { label: '7,5 t LKW', detail: 'Video + Rigging' },
        { label: 'Sprinter', detail: 'Licht + Kabel' },
      ],
      loadIn: '08:00',
      distanceKm: 42,
    },
    contacts: [
      { name: 'H. Vogt', role: 'Haustechnik', org: 'Halle A', phone: '+49 30 1234-56' },
      { name: 'Nordlicht Events', role: 'Auftraggeber', org: 'Produktion', phone: '+49 40 9876-10' },
    ],
    tasks: [
      { title: 'CAM 4 verkabeln', done: false, due: 'Do', owner: 'M. Berg' },
      { title: 'Patch-Sheet finalisieren', done: false, due: 'Fr', owner: 'T. Wolf' },
      { title: 'Rentman-Kabelmengen zurücksynchen', done: false, owner: 'Lars Z.' },
      { title: 'Rigging-Plan freigegeben', done: true },
    ],
    board: {
      cards: [
        { id: 'b_h', type: 'heading', x: 60, y: 40, w: 320, text: 'Look & Feel — Sommershow' },
        { id: 'b_l1', type: 'look', x: 60, y: 120, w: 190, title: 'Warmes Bühnenlicht', color: '#f5a623' },
        { id: 'b_l2', type: 'look', x: 270, y: 120, w: 190, title: 'Kühle Akzente', color: '#38bdf8' },
        { id: 'b_l3', type: 'look', x: 480, y: 120, w: 190, title: 'Publikum im Dunkel', color: '#1a2130' },
        { id: 'b_n1', type: 'note', x: 60, y: 300, w: 230, text: 'Host in Key/Fill 2,8 : 1 halten — warmer Vordergrund, kühles Backlight. Abgleich mit Licht-Modul.' },
        { id: 'b_c1', type: 'color', x: 320, y: 300, w: 110, title: 'L204 · CTB', color: '#f2c26b' },
        { id: 'b_c2', type: 'color', x: 440, y: 300, w: 110, title: 'R132 · Blau', color: '#5aa9e6' },
        { id: 'b_t1', type: 'todo', x: 60, y: 430, w: 260, title: 'Kreativ-Freigaben', items: [
          { text: 'Bühnenbild abgenommen', done: true },
          { text: 'Kamerapositionen final', done: false },
          { text: 'Licht-Stimmung Doors', done: false },
        ] },
        { id: 'b_lk1', type: 'link', x: 480, y: 300, w: 220, title: 'Referenz-Show 2025', url: 'vimeo.com/nordlicht/sommer25' },
        {
          id: 'b_sub', type: 'board', x: 480, y: 430, w: 210, title: 'Kamera-Refs',
          board: {
            cards: [
              { id: 's_h', type: 'heading', x: 60, y: 40, w: 320, text: 'Kamera-Referenzen' },
              { id: 's_l1', type: 'look', x: 60, y: 120, w: 190, title: 'Weitwinkel-Opener', color: '#38bdf8' },
              { id: 's_l2', type: 'look', x: 270, y: 120, w: 190, title: 'Tele auf Host', color: '#a78bfa' },
              { id: 's_n1', type: 'note', x: 60, y: 300, w: 240, text: 'CAM 3 als Beauty-Shot mit 135 mm, weiche Schärfe.' },
            ],
            connections: [],
          },
        },
      ],
      connections: [
        { id: 'bc1', from: 'b_h', to: 'b_l1' },
        { id: 'bc2', from: 'b_n1', to: 'b_c1' },
        { id: 'bc3', from: 'b_n1', to: 'b_c2' },
      ],
    },
  },
  inventory: {
    nodes: [
      { id: 'case1', name: 'Case 1 — Funkstrecken', kind: 'case', createdAt: 't', updatedAt: 't' },
      { id: 'case2', name: 'Case 2 — SDI-Kabel', kind: 'case', createdAt: 't', updatedAt: 't' },
      { id: 'shelfA', name: 'Regal A3', kind: 'shelf', createdAt: 't', updatedAt: 't' },
    ],
    items: [
      { id: 'i1', model: 'Shure ULXD2', quantity: 4, locationId: 'case1', createdAt: 't', updatedAt: 't' },
      { id: 'i2', model: '12G-SDI 50 m', quantity: 8, locationId: 'case2', createdAt: 't', updatedAt: 't' },
      { id: 'i3', model: 'ETC Source Four 26°', quantity: 6, locationId: 'case2', createdAt: 't', updatedAt: 't' },
      { id: 'i4', model: 'KL Panel XL', quantity: 2, locationId: 'shelfA', createdAt: 't', updatedAt: 't' },
      { id: 'i5', model: 'Stativ-Set', quantity: 3, createdAt: 't', updatedAt: 't' },
    ],
  },
}

export interface ProjectCounts {
  cameras: number
  fixtures: number
  cables: number
  cableTotalM: number
  devices: number
  openEnds: number
}

export function computeCounts(p: SuiteProject): ProjectCounts {
  return {
    cameras: p.cameras.length,
    fixtures: p.fixtures.length,
    cables: p.cables.length + 18, // + gebündelte Stich-/Patch-Kabel
    cableTotalM: 612,
    devices: p.nodes.length,
    openEnds: 1,
  }
}

export const LAYER_COLOR: Record<CableLayer, string> = {
  video: 'var(--av-ok)',
  dmx: 'var(--av-danger)',
  net: 'var(--mod-cameras)',
}

export const LAYER_LABEL: Record<CableLayer, string> = {
  video: 'Video',
  dmx: 'DMX',
  net: 'Netz',
}

export const DEPARTMENT_COLOR: Record<Department, string> = {
  video: 'var(--mod-cameras)',
  light: 'var(--mod-licht)',
  audio: 'var(--mod-signal)',
  prod: 'var(--mod-raum)',
}

export const DEPARTMENT_LABEL: Record<Department, string> = {
  video: 'Video',
  light: 'Licht',
  audio: 'Ton',
  prod: 'Produktion',
}

export const PHASE_LABEL: Record<ShowPhase, string> = {
  planning: 'Planung',
  setup: 'Aufbau',
  show: 'Show',
  teardown: 'Abbau',
}

/** Budget-Summen über alle Kategorien. */
export function budgetTotals(lines: BudgetLine[]): { estimated: number; actual: number } {
  return lines.reduce(
    (acc, l) => ({ estimated: acc.estimated + l.estimatedEur, actual: acc.actual + l.actualEur }),
    { estimated: 0, actual: 0 },
  )
}

export interface Readiness {
  totalQty: number
  packedQty: number
  openQty: number
  packedPct: number
  cases: number
}

/**
 * Pack-Bereitschaft aus dem Lager-Ausschnitt — nutzt das geteilte
 * @avplan/inventory-core-Modell (LPN-Prinzip: ein Artikel gilt als gepackt,
 * wenn sein Lagerort ein Container/Case ist). Zeigt, wie das Datenpaket über
 * die Planer hinaus auch die Shell speist.
 */
export function computeReadiness(inv: { items: InventoryItem[]; nodes: StorageNode[] }): Readiness {
  const containerIds = new Set(
    inv.nodes.filter((n) => CONTAINER_KINDS.includes(n.kind)).map((n) => n.id),
  )
  let totalQty = 0
  let packedQty = 0
  for (const it of inv.items) {
    totalQty += it.quantity
    if (it.locationId && containerIds.has(it.locationId)) packedQty += it.quantity
  }
  const openQty = totalQty - packedQty
  return {
    totalQty,
    packedQty,
    openQty,
    packedPct: totalQty === 0 ? 0 : Math.round((packedQty / totalQty) * 100),
    cases: containerIds.size,
  }
}

/** Verfügbare Projekte für den Projekt-Wechsler (Erweiterungspunkt). */
export const PROJECTS: SuiteProject[] = [PROJECT]

/** Leeres Board für den Standalone-Betrieb (ohne zugewiesenes Projekt). */
export const emptyBoard = (): Board => ({ cards: [], connections: [] })
