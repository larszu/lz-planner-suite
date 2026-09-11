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
      title={t('project.welcome.title', 'Welcome to Cable Planner')}
      intro={t(
        'project.welcome.intro',
        'Create a new project or open an existing one so your work is saved reliably.',
      )}
      strings={{ later: t('project.welcome.later', 'Decide later') }}
      dismissTitle={t(
        'project.welcome.laterTitle',
        'Continue without choosing — remember to save manually.',
      )}
      actions={[
        {
          id: 'new',
          title: t('project.welcome.newTitle', 'New project'),
          description: t('project.welcome.newSubtitle', 'Start with project name, client and planner.'),
          icon: <Icon icon={FileText} size="lg" />,
          accent: '#34d399',
          onSelect: () => {
            onNew()
            onClose()
          },
        },
        {
          id: 'open',
          title: t('project.welcome.openTitle', 'Open project…'),
          description: `${t('project.welcome.openSubtitle1', 'Load an existing')} .cableplan${t('project.welcome.openSubtitle2', ' file.')}`,
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
          <div className="mb-1 text-cp-xs font-semibold uppercase tracking-wider text-cp-text-muted">
            {t('project.welcome.recents', 'Recently used')}
          </div>
          <div className="max-h-32 space-y-1 overflow-auto">
            {recents.slice(0, 6).map((path) => (
              <div
                key={path}
                className="flex items-center gap-2 border border-cp-border-muted bg-cp-surface-3/40 px-2 py-1 text-cp-xs text-cp-text-muted"
                title={path}
              >
                <Icon icon={Clock} size="sm" />
                <span className="min-w-0 flex-1 truncate">{fileNameOf(path)}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-cp-xs text-cp-text-muted">
            {t(
              'project.welcome.recentsHint',
              'Click "Open project…" and choose one of the files in the file picker.',
            )}
          </p>
        </div>
      )}
    </SuiteWelcomeDialog>
  )
}
