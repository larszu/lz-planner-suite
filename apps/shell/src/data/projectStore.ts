/**
 * Mehr-Projekt-Verwaltung (Projekt-Hub). Ersetzt den bisherigen Einzel-Slot:
 * die Suite hält jetzt beliebig viele Shows lokal, jede mit eigener ID und
 * eigenem localStorage-Eintrag, plus einen Index für die Hub-Liste.
 *
 * Layout:
 *   avplan.projectIndex        → ProjectListEntry[]  (Metadaten für die Liste)
 *   avplan.project.<id>        → serialisiertes SuiteProject
 *   avplan.currentProjectId    → zuletzt geöffnete ID
 *
 * Migration: ein evtl. vorhandener alter Einzel-Slot (avplan.project) wird beim
 * ersten Zugriff einmalig als erstes Projekt übernommen.
 */
import { PROJECT, type SuiteProject } from './project'
import { blankProject, parseProject, serializeProject } from './projectFile'

const INDEX_KEY = 'avplan.projectIndex'
const CURRENT_KEY = 'avplan.currentProjectId'
const DATA_PREFIX = 'avplan.project.'
const LEGACY_KEY = 'avplan.project'

export interface ProjectListEntry {
  id: string
  name: string
  venue: string
  /** ISO-Zeitpunkt der letzten Speicherung (für Sortierung „zuletzt zuerst"). */
  savedAt: string
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {
    /* fällt unten durch */
  }
  return `p_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`
}

function readIndex(): ProjectListEntry[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as unknown
    if (!Array.isArray(list)) return []
    return list.filter((e): e is ProjectListEntry => !!e && typeof (e as ProjectListEntry).id === 'string')
  } catch {
    return []
  }
}

function writeIndex(list: ProjectListEntry[]): void {
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(list))
  } catch {
    /* Storage voll/gesperrt */
  }
}

/** Einmalige Migration + Seed. Idempotent. */
function ensureInitialized(): void {
  if (readIndex().length > 0) return
  const seeded: ProjectListEntry[] = []
  // 1. Alten Einzel-Slot übernehmen, falls vorhanden.
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const p = parseProject(legacy)
      const id = newId()
      window.localStorage.setItem(DATA_PREFIX + id, serializeProject(p))
      seeded.push({ id, name: p.meta.name, venue: p.meta.venue, savedAt: new Date().toISOString() })
      window.localStorage.setItem(CURRENT_KEY, id)
      window.localStorage.removeItem(LEGACY_KEY)
    }
  } catch {
    /* defekter Alt-Slot → ignorieren */
  }
  // 2. Wenn noch leer, das Demo-Projekt als Startpunkt anlegen.
  if (seeded.length === 0) {
    const id = newId()
    try {
      window.localStorage.setItem(DATA_PREFIX + id, serializeProject(PROJECT))
      seeded.push({ id, name: PROJECT.meta.name, venue: PROJECT.meta.venue, savedAt: new Date().toISOString() })
    } catch {
      /* ignore */
    }
  }
  writeIndex(seeded)
}

export function listProjects(): ProjectListEntry[] {
  ensureInitialized()
  // Zuletzt gespeichert zuerst.
  return [...readIndex()].sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''))
}

export function getCurrentProjectId(): string | null {
  ensureInitialized()
  const id = window.localStorage.getItem(CURRENT_KEY)
  if (id && readIndex().some((e) => e.id === id)) return id
  return readIndex()[0]?.id ?? null
}

export function setCurrentProjectId(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(CURRENT_KEY, id)
    else window.localStorage.removeItem(CURRENT_KEY)
  } catch {
    /* ignore */
  }
}

export function loadProjectById(id: string): SuiteProject | null {
  try {
    const raw = window.localStorage.getItem(DATA_PREFIX + id)
    if (!raw) return null
    return parseProject(raw)
  } catch {
    return null
  }
}

/** Projekt speichern + Index-Eintrag (Name/Venue/Zeit) aktualisieren. */
export function saveProjectById(id: string, project: SuiteProject): void {
  try {
    window.localStorage.setItem(DATA_PREFIX + id, serializeProject(project))
  } catch {
    return
  }
  const idx = readIndex()
  const at = new Date().toISOString()
  const i = idx.findIndex((e) => e.id === id)
  const entry: ProjectListEntry = { id, name: project.meta.name, venue: project.meta.venue, savedAt: at }
  if (i >= 0) idx[i] = entry
  else idx.push(entry)
  writeIndex(idx)
}

/** Neues, leeres Projekt anlegen (persistiert) und ID zurückgeben. */
export function createProjectRecord(name = 'Neues Projekt'): { id: string; project: SuiteProject } {
  ensureInitialized()
  const id = newId()
  const project = blankProject(name)
  saveProjectById(id, project)
  return { id, project }
}

export function renameProjectById(id: string, name: string): void {
  const p = loadProjectById(id)
  if (!p) return
  saveProjectById(id, { ...p, meta: { ...p.meta, name } })
}

export function duplicateProjectById(id: string): string | null {
  const p = loadProjectById(id)
  if (!p) return null
  const copy: SuiteProject = { ...p, meta: { ...p.meta, name: `${p.meta.name} (Kopie)`, saved: false } }
  const newid = newId()
  saveProjectById(newid, copy)
  return newid
}

export function deleteProjectById(id: string): void {
  try {
    window.localStorage.removeItem(DATA_PREFIX + id)
  } catch {
    /* ignore */
  }
  writeIndex(readIndex().filter((e) => e.id !== id))
  if (window.localStorage.getItem(CURRENT_KEY) === id) setCurrentProjectId(null)
}

/** Ein importiertes Projekt (aus Datei) als neues Hub-Projekt aufnehmen. */
export function importProjectRecord(project: SuiteProject): string {
  ensureInitialized()
  const id = newId()
  saveProjectById(id, project)
  return id
}
