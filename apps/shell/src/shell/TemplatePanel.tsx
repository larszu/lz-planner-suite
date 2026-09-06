import { useMemo, useState } from 'react'
import { Button, Icon } from '@avplan/ui'
import {
  deleteTemplateById,
  listTemplates,
  saveProjectAsTemplate,
  type TemplateListEntry,
} from '../data/templateStore'
import { templateFromProject, type Omission, type OmissionKey } from '../data/projectTemplate'
import type { SuiteProject } from '../data/project'
import { useT, format } from '../i18n'

/**
 * Der Vorlagen-Teil des Projekt-Hubs (B-39.2).
 *
 * Zwei Wege: aus einer Vorlage ein Projekt anlegen, und das aktuelle Projekt
 * als Vorlage ablegen.
 *
 * WARUM DIE „FAEHRT NICHT MIT"-LISTE VOR DEM SPEICHERN STEHT und nicht als
 * Hinweis danach: `CREDENTIALS-IN-TEMPLATES.md` hat den Fall im cable-planner
 * gemessen, in dem derselbe Code Passwoerter auf dem einen Weg entfernte und
 * auf dem anderen in den geteilten Ordner schrieb — unbemerkt, weil niemand es
 * an der Stelle sagte. Design-Frage 5 ist deshalb mit „beim Export fragen"
 * entschieden. Hier ist es dasselbe mit Kundendaten: die Liste steht da, BEVOR
 * der Knopf gedrueckt wird, mit Anzahl statt „einiges".
 */
export function TemplatePanel({
  project,
  onCreate,
}: {
  project: SuiteProject | null
  /** Neues Projekt aus dieser Vorlage anlegen und oeffnen. */
  onCreate: (templateId: string, name: string) => void
}) {
  const t = useT()
  const [rev, setRev] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rev triggert bewusst das Neuladen
  const templates = useMemo<TemplateListEntry[]>(() => listTemplates(), [rev])
  const refresh = () => setRev((r) => r + 1)

  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveNote, setSaveNote] = useState('')
  const [useId, setUseId] = useState<string | null>(null)
  const [useName, setUseName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Vorschau der Subtraktion — dieselbe Funktion, die auch speichert. Zwei
  // Wege waeren zwei Wahrheiten ueber dieselbe Regel.
  const preview = useMemo<Omission[]>(
    () => (project ? templateFromProject(project).omitted : []),
    [project],
  )

  const omissionLabel = (o: Omission): string => {
    const texts: Record<OmissionKey, string> = {
      contacts: t('tpl.omit.contacts', 'Kontakte (Anschrift, USt-IdNr., Kundennummer, Lexware-Kontakt)'),
      invoices: t('tpl.omit.invoices', 'ausgestellte Belege'),
      billing: t('tpl.omit.billing', 'Besteuerung und Steuersatz'),
      date: t('tpl.omit.date', 'Show-Datum'),
      phase: t('tpl.omit.phase', 'Produktionsphase'),
      progress: t('tpl.omit.progress', 'Planungsfortschritt'),
      crewTimes: t('tpl.omit.crewTimes', 'Call-Zeiten und Zusagen (Besetzung bleibt)'),
      budgetActual: t('tpl.omit.budgetActual', 'Ist-Kosten (Schätzung bleibt)'),
      tasksDone: t('tpl.omit.tasksDone', 'abgehakte Aufgaben (Liste bleibt)'),
      loadIn: t('tpl.omit.loadIn', 'Ladezeit'),
    }
    const label = texts[o.key]
    if (o.detail) return `${label}: ${o.detail}`
    return o.count > 1 ? format('{n} × {label}', { n: o.count, label }) : label
  }

  const doSave = () => {
    if (!project) return
    saveProjectAsTemplate(project, saveName, saveNote)
    setSaving(false)
    setSaveName('')
    setSaveNote('')
    refresh()
  }

  const doDelete = (id: string) => {
    deleteTemplateById(id)
    setConfirmDelete(null)
    refresh()
  }

  const fmtDate = (iso: string): string => {
    try { return new Date(iso).toLocaleDateString() } catch { return '' }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] leading-snug text-av-text-muted">
        {t(
          'tpl.intro',
          'Eine Vorlage ist die Show ohne ihren Termin und ohne ihren Kunden: Raum, Rig, Signalweg, Ablauf, Besetzung und Budget-Rahmen bleiben, damit die nächste gleiche Produktion nicht wieder bei null anfängt.',
        )}
      </p>

      {templates.length === 0 ? (
        <p className="py-4 text-center text-sm text-av-text-muted">
          {t('tpl.empty', 'Noch keine Vorlagen. Lege eine aus dem aktuellen Projekt an.')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {templates.map((tpl) => (
            <li key={tpl.id} className="rounded-av-control border border-av-border bg-av-surface-2 p-2.5">
              {useId === tpl.id ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => { e.preventDefault(); onCreate(tpl.id, useName); setUseId(null) }}
                >
                  <input
                    autoFocus
                    value={useName}
                    onChange={(e) => setUseName(e.target.value)}
                    placeholder={t('tpl.newName', 'Name der neuen Show')}
                    aria-label={t('tpl.newName', 'Name der neuen Show')}
                    className="av-focus flex-1 rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[13px] text-av-text"
                  />
                  <Button variant="primary" size="sm" type="submit">{t('tpl.create', 'Anlegen')}</Button>
                  <Button variant="subtle" size="sm" onClick={() => setUseId(null)}>{t('hub.cancel', 'Abbrechen')}</Button>
                </form>
              ) : confirmDelete === tpl.id ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-[13px] text-av-text">
                    {format(t('tpl.confirmDelete', 'Vorlage „{name}" wirklich löschen?'), { name: tpl.name })}
                  </span>
                  <button
                    type="button"
                    onClick={() => doDelete(tpl.id)}
                    className="av-focus rounded-av-control bg-av-danger px-2.5 py-1 text-[12px] font-medium text-white hover:opacity-90"
                  >
                    {t('hub.delete', 'Löschen')}
                  </button>
                  <Button variant="subtle" size="sm" onClick={() => setConfirmDelete(null)}>{t('hub.cancel', 'Abbrechen')}</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setUseId(tpl.id); setUseName(tpl.name) }}
                    className="av-focus flex min-w-0 flex-1 flex-col items-start rounded-av-control px-1 py-0.5 text-left"
                  >
                    <span className="truncate text-[13.5px] font-semibold text-av-text">{tpl.name}</span>
                    <span className="truncate text-[11.5px] text-av-text-muted">
                      {[tpl.venue, tpl.note, fmtDate(tpl.createdAt)].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                  <div className="flex flex-none items-center gap-0.5">
                    <Button variant="subtle" size="sm" onClick={() => { setUseId(tpl.id); setUseName(tpl.name) }}>
                      {t('tpl.use', 'Projekt daraus')}
                    </Button>
                    <button
                      type="button"
                      className="av-icon-btn av-focus text-av-text-faint hover:text-av-danger"
                      style={{ width: 28, height: 28 }}
                      title={t('hub.delete', 'Löschen')}
                      aria-label={t('hub.delete', 'Löschen')}
                      onClick={() => setConfirmDelete(tpl.id)}
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-av-control border border-av-border-muted bg-av-surface-2 p-2.5">
        {!saving ? (
          <Button variant="subtle" size="sm" disabled={!project} onClick={() => { setSaving(true); setSaveName(project?.meta.name ?? '') }}>
            <Icon name="plus" size={14} /> {t('tpl.fromProject', 'Aktuelles Projekt als Vorlage')}
          </Button>
        ) : (
          <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); doSave() }}>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={t('tpl.name', 'Name der Vorlage')}
              aria-label={t('tpl.name', 'Name der Vorlage')}
              className="av-focus rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[13px] text-av-text"
            />
            <input
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder={t('tpl.note', 'Wofür ist sie gedacht? (optional)')}
              aria-label={t('tpl.note', 'Wofür ist sie gedacht? (optional)')}
              className="av-focus rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[13px] text-av-text"
            />
            {preview.length > 0 && (
              <div className="rounded-av-control border border-av-warn/40 bg-av-warn/5 p-2">
                <p className="text-[11.5px] font-medium text-av-text">{t('tpl.omitted', 'Fährt nicht mit:')}</p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {preview.map((o) => (
                    <li key={o.key} className="text-[11.5px] text-av-text-muted">· {omissionLabel(o)}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" type="submit">{t('hub.save', 'Speichern')}</Button>
              <Button variant="subtle" size="sm" onClick={() => setSaving(false)}>{t('hub.cancel', 'Abbrechen')}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
