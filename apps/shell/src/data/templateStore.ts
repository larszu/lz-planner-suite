// ───────────────────────────────────────────────────────────────────────────
// Ablage der Vorlagen (B-39.2).
//
// Bewusst NEBEN `projectStore` und nicht darin: eine Vorlage taucht nicht im
// Projekt-Hub auf, hat keinen `savedAt`-Verlauf und wird nie synchronisiert.
// Sie in denselben Index zu legen hiesse, dass jede Liste kuenftig filtern
// muss — und eine vergessene Filterung stellt die Vorlage als Show in den Hub.
//
// Kein Backend-Push. Der Sync-Client kennt Projekte; eine Vorlage dort
// mitzuschicken waere ein zweites Format auf demselben Endpunkt. Vorlagen
// wandern ueber die Datei (`serializeTemplate`), und das ist zugleich der Weg,
// auf dem eine Vorlage ueberhaupt zwischen zwei Leuten wandert.
// ───────────────────────────────────────────────────────────────────────────

import type { SuiteProject } from './project'
import {
  projectFromTemplate,
  templateFromProject,
  type Omission,
  type SuiteTemplate,
} from './projectTemplate'

const INDEX_KEY = 'avplan.templateIndex'

export interface TemplateListEntry {
  id: string
  name: string
  note?: string
  createdAt: string
  /** Haus, aus dem die Vorlage stammt — die Haus-Vorlage aus Bedarf 91. */
  venue: string
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return `t_${crypto.randomUUID()}`
  } catch {
    /* faellt unten durch */
  }
  return `t_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`
}

const DATA_PREFIX = 'avplan.template.'

function readIndex(): TemplateListEntry[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as unknown
    if (!Array.isArray(list)) return []
    return list.filter((e): e is TemplateListEntry => !!e && typeof (e as TemplateListEntry).id === 'string')
  } catch {
    return []
  }
}

function writeIndex(list: TemplateListEntry[]): void {
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(list))
  } catch {
    /* Storage voll/gesperrt */
  }
}

export function listTemplates(): TemplateListEntry[] {
  return readIndex().sort((a, b) => a.name.localeCompare(b.name, 'de'))
}

export function loadTemplateById(id: string): SuiteTemplate | null {
  try {
    const raw = window.localStorage.getItem(DATA_PREFIX + id)
    if (!raw) return null
    return JSON.parse(raw) as SuiteTemplate
  } catch {
    return null
  }
}

/** Vorlage ablegen (neu oder ersetzend) und ihre Id liefern. */
export function saveTemplate(t: SuiteTemplate): string {
  try {
    window.localStorage.setItem(DATA_PREFIX + t.id, JSON.stringify(t))
  } catch {
    return t.id
  }
  const idx = readIndex()
  const entry: TemplateListEntry = {
    id: t.id,
    name: t.name,
    ...(t.note ? { note: t.note } : {}),
    createdAt: t.createdAt,
    venue: t.project.meta.venue,
  }
  const i = idx.findIndex((e) => e.id === t.id)
  if (i >= 0) idx[i] = entry
  else idx.push(entry)
  writeIndex(idx)
  return t.id
}

export function deleteTemplateById(id: string): void {
  try {
    window.localStorage.removeItem(DATA_PREFIX + id)
  } catch {
    /* ignore */
  }
  writeIndex(readIndex().filter((e) => e.id !== id))
}

/**
 * Aus einem Projekt eine Vorlage machen und ablegen.
 *
 * Gibt `omitted` mit zurueck, damit der Aufrufer ANZEIGEN kann, was
 * zurueckblieb. Der Dialog zeigt dieselbe Liste schon vorher aus
 * `templateFromProject` — hier kommt sie noch einmal, weil sonst der
 * Speicherweg und der Vorschauweg zwei Wahrheiten haetten.
 */
export function saveProjectAsTemplate(
  project: SuiteProject,
  name: string,
  note?: string,
): { id: string; omitted: Omission[] } {
  const { project: derived, omitted } = templateFromProject(project)
  const t: SuiteTemplate = {
    id: newId(),
    name: name.trim() || project.meta.name,
    ...(note?.trim() ? { note: note.trim() } : {}),
    createdAt: new Date().toISOString(),
    project: derived,
  }
  return { id: saveTemplate(t), omitted }
}

/** Eine importierte Vorlagendatei aufnehmen — immer als neue Vorlage, nie
 *  ersetzend: die Id in der Datei stammt aus einer fremden Ablage. */
export function importTemplate(t: SuiteTemplate): string {
  return saveTemplate({ ...t, id: newId() })
}

/** Projekt aus einer abgelegten Vorlage. `null`, wenn es sie nicht (mehr) gibt. */
export function projectFromTemplateId(id: string, name: string): SuiteProject | null {
  const t = loadTemplateById(id)
  return t ? projectFromTemplate(t, name) : null
}
