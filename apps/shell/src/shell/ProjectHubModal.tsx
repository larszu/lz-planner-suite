import { useMemo, useState } from 'react'
import { Button, Icon, Modal } from '@avplan/ui'
import {
  deleteProjectById,
  duplicateProjectById,
  listProjects,
  renameProjectById,
  type ProjectListEntry,
} from '../data/projectStore'
import { useT, format } from '../i18n'

/**
 * Projekt-Hub: alle lokal gespeicherten Shows verwalten — anlegen, öffnen,
 * umbenennen, duplizieren, löschen. Ersetzt den bisherigen „Demo oder nichts"-
 * Picker. Öffnen/Anlegen laufen über die Shell (lädt ins Projekt-History-
 * Modell); Umbenennen/Duplizieren/Löschen erledigt der Hub direkt am Store und
 * meldet Änderungen via onChanged zurück.
 */
export function ProjectHubModal({
  open,
  onClose,
  currentId,
  onOpen,
  onNew,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  currentId: string | null
  onOpen: (id: string) => void
  onNew: () => void
  onChanged: () => void
}) {
  const t = useT()
  // Liste aus dem Store; ein Zähler erzwingt Neuladen nach Mutationen.
  const [rev, setRev] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rev triggert bewusst das Neuladen
  const projects = useMemo<ProjectListEntry[]>(() => (open ? listProjects() : []), [open, rev])
  const refresh = () => setRev((r) => r + 1)

  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const startRename = (p: ProjectListEntry) => { setRenameId(p.id); setRenameValue(p.name); setConfirmDelete(null) }
  const commitRename = () => {
    if (renameId && renameValue.trim()) {
      renameProjectById(renameId, renameValue.trim())
      onChanged()
      refresh()
    }
    setRenameId(null)
  }
  const doDuplicate = (id: string) => { duplicateProjectById(id); refresh() }
  const doDelete = (id: string) => { deleteProjectById(id); setConfirmDelete(null); onChanged(); refresh() }

  const fmtDate = (iso: string): string => {
    try { return new Date(iso).toLocaleString() } catch { return '' }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('hub.title', 'Projekte')}
      size="lg"
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>{t('hub.close', 'Schließen')}</Button>
          <Button variant="primary" onClick={onNew}><Icon name="plus" size={15} /> {t('hub.new', 'Neues Projekt')}</Button>
        </>
      }
    >
      {projects.length === 0 ? (
        <p className="py-6 text-center text-sm text-av-text-muted">{t('hub.empty', 'Noch keine Projekte. Lege eins an.')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((p) => {
            const isCurrent = p.id === currentId
            return (
              <li key={p.id} className={`rounded-av-control border p-2.5 ${isCurrent ? 'border-av-accent bg-av-accent/5' : 'border-av-border bg-av-surface-2'}`}>
                {renameId === p.id ? (
                  <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); commitRename() }}>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      aria-label={t('hub.rename', 'Umbenennen')}
                      className="av-focus flex-1 rounded-av-control border border-av-border bg-av-surface-3 px-2 py-1 text-[13px] text-av-text"
                    />
                    <Button variant="primary" size="sm" type="submit">{t('hub.save', 'Speichern')}</Button>
                    <Button variant="subtle" size="sm" onClick={() => setRenameId(null)}>{t('hub.cancel', 'Abbrechen')}</Button>
                  </form>
                ) : confirmDelete === p.id ? (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-[13px] text-av-text">{format(t('hub.confirmDelete', '„{name}" wirklich löschen?'), { name: p.name })}</span>
                    <button type="button" onClick={() => doDelete(p.id)} className="av-focus rounded-av-control bg-av-danger px-2.5 py-1 text-[12px] font-medium text-white hover:opacity-90">{t('hub.delete', 'Löschen')}</button>
                    <Button variant="subtle" size="sm" onClick={() => setConfirmDelete(null)}>{t('hub.cancel', 'Abbrechen')}</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen(p.id)}
                      className="av-focus flex min-w-0 flex-1 flex-col items-start rounded-av-control px-1 py-0.5 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-semibold text-av-text">{p.name}</span>
                        {isCurrent && <span className="rounded bg-av-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-av-accent">{t('hub.current', 'geöffnet')}</span>}
                      </span>
                      <span className="truncate text-[11.5px] text-av-text-muted">{[p.venue, fmtDate(p.savedAt)].filter(Boolean).join(' · ')}</span>
                    </button>
                    <div className="flex flex-none items-center gap-0.5">
                      <button type="button" className="av-icon-btn av-focus" style={{ width: 28, height: 28 }} title={t('hub.open', 'Öffnen')} aria-label={t('hub.open', 'Öffnen')} onClick={() => onOpen(p.id)}><Icon name="external" size={14} /></button>
                      <button type="button" className="av-icon-btn av-focus" style={{ width: 28, height: 28 }} title={t('hub.rename', 'Umbenennen')} aria-label={t('hub.rename', 'Umbenennen')} onClick={() => startRename(p)}><Icon name="settings" size={14} /></button>
                      <button type="button" className="av-icon-btn av-focus" style={{ width: 28, height: 28 }} title={t('hub.duplicate', 'Duplizieren')} aria-label={t('hub.duplicate', 'Duplizieren')} onClick={() => doDuplicate(p.id)}><Icon name="library" size={14} /></button>
                      <button type="button" className="av-icon-btn av-focus text-av-text-faint hover:text-av-danger" style={{ width: 28, height: 28 }} title={t('hub.delete', 'Löschen')} aria-label={t('hub.delete', 'Löschen')} onClick={() => setConfirmDelete(p.id)}><Icon name="close" size={14} /></button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
