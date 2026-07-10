/**
 * Seed-Projektmodell der Shell — ein in sich stimmiger Demo-Stand
 * („Sommershow 2026 · Halle A"), der Bibliotheks-Panels, Vorschauen,
 * Eigenschaften und Statusleiste mit echten, konsistenten Zahlen speist.
 * Das ist bewusst Anschauungs-Datenmodell der Shell selbst — die
 * eigentlichen Projektdaten leben in den eingebetteten Planern.
 */

export interface ProjectMeta {
  name: string
  venue: string
  version: number
  saved: boolean
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
