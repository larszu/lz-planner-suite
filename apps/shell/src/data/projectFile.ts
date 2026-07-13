/**
 * Datei-Operationen der Shell für das SuiteProject: Serialisieren, Parsen,
 * Download („Speichern unter"), localStorage-Persistenz („Speichern") und ein
 * leeres Projekt („Neu"). Bewusst schlank und offline-tauglich — die eigentliche
 * Bearbeitung der Fachdaten passiert in den Planern; die Shell verwaltet den
 * Projekt-Container.
 */

import { PROJECT, emptyBoard, type SuiteProject } from './project'

const PERSIST_KEY = 'avplan.project'
const FILE_VERSION = 1

interface ProjectFile {
  format: 'avplanner-suite'
  version: number
  project: SuiteProject
}

/** Leeres, gültiges Projekt (alle Pflichtfelder gesetzt). */
export function blankProject(name = 'Neues Projekt'): SuiteProject {
  return {
    meta: { name, venue: '—', version: 1, saved: false },
    hall: { w: 20, h: 12 },
    stage: { x: 6, y: 2, w: 8, h: 3 },
    cameras: [],
    fixtures: [],
    nodes: [],
    cables: [],
    show: {
      dateLabel: '',
      phase: 'planning',
      progress: 0,
      schedule: [],
      crew: [],
      budget: [],
      logistics: { vehicles: [], loadIn: '', distanceKm: 0 },
      contacts: [],
      tasks: [],
      board: emptyBoard(),
    },
    inventory: { items: [], nodes: [] },
  }
}

export function serializeProject(p: SuiteProject): string {
  const file: ProjectFile = { format: 'avplanner-suite', version: FILE_VERSION, project: p }
  return JSON.stringify(file, null, 2)
}

/**
 * Text (Dateiinhalt oder localStorage) zu einem Projekt parsen. Akzeptiert
 * sowohl das umhüllte Dateiformat als auch ein rohes Projekt-Objekt. Wirft bei
 * ungültigem Inhalt. Fehlende Felder werden aus blankProject aufgefüllt.
 */
export function parseProject(text: string): SuiteProject {
  const raw = JSON.parse(text) as unknown
  if (!raw || typeof raw !== 'object') throw new Error('Ungültige Projektdatei')
  const candidate =
    'project' in (raw as Record<string, unknown>) && (raw as { project?: unknown }).project
      ? (raw as { project: unknown }).project
      : raw
  const p = candidate as Partial<SuiteProject>
  if (!p.meta || typeof p.meta.name !== 'string') {
    throw new Error('Projektdatei ohne gültige Metadaten')
  }
  const base = blankProject()
  return {
    ...base,
    ...p,
    meta: { ...base.meta, ...p.meta, saved: true },
    hall: { ...base.hall, ...(p.hall ?? {}) },
    stage: { ...base.stage, ...(p.stage ?? {}) },
    show: { ...base.show, ...(p.show ?? {}) },
    inventory: { ...base.inventory, ...(p.inventory ?? {}) },
  } as SuiteProject
}

const sanitize = (s: string): string =>
  s.trim().replace(/[^\p{L}\p{N}\-_ ]/gu, '').replace(/\s+/g, '-').toLowerCase() || 'projekt'

/** „Speichern unter" — Projekt als .avsuite.json herunterladen. */
export function downloadProject(p: SuiteProject): void {
  const blob = new Blob([serializeProject(p)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitize(p.meta.name)}.avsuite.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** „Speichern" — Projekt in localStorage ablegen. */
export function saveProjectLocal(p: SuiteProject): void {
  try {
    window.localStorage.setItem(PERSIST_KEY, serializeProject(p))
  } catch {
    /* Storage gesperrt/voll */
  }
}

/** Beim Start: zuletzt gespeichertes Projekt lesen (oder null). */
export function loadProjectLocal(): SuiteProject | null {
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY)
    if (!raw) return null
    return parseProject(raw)
  } catch {
    return null
  }
}

/** Demo-Projekt (Seed) — Startwert, wenn nichts gespeichert ist. */
export { PROJECT as DEMO_PROJECT }
