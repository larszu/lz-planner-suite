import { useEffect, useState } from 'react'
import { FileText, FolderOpen, Clock } from 'lucide-react'
import { WelcomeDialog as SuiteWelcomeDialog } from '@avplan/onboarding-core'
import { cablePlannerApi } from '../../lib/bridge'
import { Icon } from '../shared/Icon'
import { useTranslation } from '../../lib/i18n'
import { useUiStore } from '../../store/uiStore'

interface WelcomeDialogProps {
  open: boolean
  onNew: () => void
  onOpen: () => void
  onClose: () => void
}

/**
 * First-launch project chooser. Shown when the app starts with no autosaved
 * project state — forces the user to either create a new project (so it has
 * a name + metadata that gets saved into the project file) or open an
 * existing one. Without this prompt, users would otherwise paint a full plan
 * onto the default empty project and forget to "Speichern unter…", losing
 * everything if they cleared their browser/localStorage.
 *
 * v7.9.44 — Migrated to <ModalShell>.
 * Monorepo — Rendert jetzt den suite-einheitlichen Welcome-Dialog aus
 * `@avplan/onboarding-core`; Aktionen, Texte und die Zuletzt-verwendet-Liste
 * bleiben Cable-Planner-spezifisch.
 */
export const WelcomeDialog = ({ open, onNew, onOpen, onClose }: WelcomeDialogProps) => {
  const t = useTranslation()
  const theme = useUiStore((state) => state.canvasTheme)
  const [recents, setRecents] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    cablePlannerApi.project
      .getRecentProjects()
      .then((list) => setRecents(list ?? []))
      .catch(() => setRecents([]))
  }, [open])

  const fileNameOf = (full: string): string => {
    const parts = full.split(/[\\/]/)
    return parts[parts.length - 1] || full
  }

  return (
    <SuiteWelcomeDialog
      open={open}
      onDismiss={onClose}
      theme={theme}
      accent="#ea580c"
      title={t('project.welcome.title', 'Willkommen beim Cable Planner')}
      intro={t(
        'project.welcome.intro',
        'Lege ein neues Projekt an oder öffne ein bestehendes, damit deine Arbeit zuverlässig gespeichert wird.',
      )}
      strings={{ later: t('project.welcome.later', 'Später entscheiden') }}
      dismissTitle={t(
        'project.welcome.laterTitle',
        'Ohne Auswahl fortfahren — bitte denke daran, manuell zu speichern.',
      )}
      actions={[
        {
          id: 'new',
          title: t('project.welcome.newTitle', 'Neues Projekt'),
          description: t('project.welcome.newSubtitle', 'Mit Projektname, Auftraggeber und Planer starten.'),
          icon: <Icon icon={FileText} size="lg" />,
          accent: '#34d399',
          onSelect: () => {
            onNew()
            onClose()
          },
        },
        {
          id: 'open',
          title: t('project.welcome.openTitle', 'Projekt öffnen…'),
          description: `${t('project.welcome.openSubtitle1', 'Eine vorhandene')} .cableplan${t('project.welcome.openSubtitle2', '-Datei laden.')}`,
          icon: <Icon icon={FolderOpen} size="lg" />,
          accent: '#38bdf8',
          onSelect: () => {
            onOpen()
            onClose()
          },
        },
      ]}
    >
      {recents.length > 0 && (
        <div className="pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cp-text-muted">
            {t('project.welcome.recents', 'Zuletzt verwendet')}
          </div>
          <div className="max-h-32 space-y-1 overflow-auto">
            {recents.slice(0, 6).map((path) => (
              <div
                key={path}
                className="flex items-center gap-2 rounded border border-cp-border-muted bg-cp-surface-3/40 px-2 py-1 text-[11px] text-cp-text-muted"
                title={path}
              >
                <Icon icon={Clock} size="sm" />
                <span className="min-w-0 flex-1 truncate">{fileNameOf(path)}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-cp-text-muted">
            {t(
              'project.welcome.recentsHint',
              'Klick „Projekt öffnen…“ und wähle eine der Dateien im Datei-Dialog.',
            )}
          </p>
        </div>
      )}
    </SuiteWelcomeDialog>
  )
}
