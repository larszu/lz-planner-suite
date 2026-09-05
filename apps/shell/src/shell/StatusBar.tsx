import { Icon } from '@avplan/ui'
import { computeCounts, type SuiteProject } from '../data/project'
import type { ModuleId } from '../modules/registry'
import { useT, format } from '../i18n'

const CANVAS_MODULES: ModuleId[] = ['signal', 'cameras', 'licht']

export function StatusBar({
  module,
  project,
  zoom,
  onZoom,
  moduleLabel,
  plannerOffen,
  runtime,
}: {
  module: ModuleId
  project: SuiteProject | null
  zoom: number
  onZoom: (zoom: number) => void
  /** Anzeigename des aktiven Moduls (uebersetzt). */
  moduleLabel: string
  /** Steht gerade ein echter Planer im Rahmen? Dann zaehlt der seine Objekte selbst. */
  plannerOffen?: boolean
  /**
   * Gesetzt, wenn das aktive Modul eine Anwendung im Netz zeigt. Die Adresse
   * gehoert dann in die Statusleiste: sie ist bei einem Geraet die
   * wichtigste Angabe („welchen Pi bediene ich hier gerade?"), und ohne sie
   * saehen zwei Anlagen im selben Fenster identisch aus.
   */
  runtime?: { repo: string; url: string }
}) {
  const t = useT()
  const counts = project ? computeCounts(project) : null
  const isCanvas = CANVAS_MODULES.includes(module)

  return (
    <footer className="av-statusbar" role="contentinfo">
      {isCanvas ? (
        <span className="av-status-item flex items-center gap-1">
          <button
            type="button"
            aria-label={t('chrome.status.zoomOut', 'Verkleinern')}
            className="av-focus grid h-4 w-4 place-items-center rounded hover:bg-av-surface-3"
            onClick={() => onZoom(zoom - 10)}
          >
            <Icon name="close" size={9} style={{ transform: 'rotate(45deg)' }} />
          </button>
          <button
            type="button"
            title={t('chrome.status.zoomReset', 'Auf 100 % zurücksetzen')}
            className="av-focus av-num rounded px-1 hover:bg-av-surface-3"
            onClick={() => onZoom(100)}
          >
            {format(t('chrome.status.zoom', 'Zoom {zoom} %'), { zoom })}
          </button>
          <button
            type="button"
            aria-label={t('chrome.status.zoomIn', 'Vergrößern')}
            className="av-focus grid h-4 w-4 place-items-center rounded hover:bg-av-surface-3"
            onClick={() => onZoom(zoom + 10)}
          >
            <Icon name="plus" size={10} />
          </button>
        </span>
      ) : runtime ? (
        <span className="av-status-item text-av-text-faint">{runtime.repo}</span>
      ) : (
        // Vorher stand hier auf JEDEM Nicht-Canvas-Modul fest „Uebersicht" --
        // auch auf dem Board. Eine Statusleiste, die das falsche Modul nennt,
        // ist schlimmer als eine leere.
        <span className="av-status-item text-av-text-faint">{moduleLabel}</span>
      )}

      <span className="flex-1" />

      {runtime ? (
        <span className="av-status-item av-num text-av-text-secondary">{runtime.url}</span>
      ) : plannerOffen ? (
        // Steht der echte Planer im Rahmen, bringt er seine eigene
        // Statusleiste mit -- und die zaehlt dasselbe. „6 Geraete 5 Kabel"
        // stand dadurch zweimal untereinander im selben Fenster. Die Zahlen
        // gehoeren dem Planer; die Shell nennt hier das Projekt.
        <span className="av-status-item text-av-text-faint">{project?.meta.name ?? ''}</span>
      ) : !project ? (
        <span className="av-status-item text-av-text-faint">{t('chrome.status.noProject', 'Kein Projekt · Modul eigenständig')}</span>
      ) : module === 'signal' && counts ? (
        <>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.devices}</span> {t('chrome.status.devices', 'Geräte')}</span>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.cables}</span> {t('chrome.status.cables', 'Kabel')}</span>
        </>
      ) : module === 'cameras' && counts ? (
        <span className="av-status-item"><span className="av-num av-status-strong">{counts.cameras}</span> {t('chrome.status.cameras', 'Kameras')}</span>
      ) : module === 'licht' && counts ? (
        <span className="av-status-item"><span className="av-num av-status-strong">{counts.fixtures}</span> {t('chrome.status.fixtures', 'Fixtures')}</span>
      ) : module === 'board' ? (
        <span className="av-status-item"><span className="av-num av-status-strong">{project.show.board.cards.length}</span> {t('chrome.status.cards', 'Karten')} · {project.show.board.connections.length} {t('chrome.status.connections', 'Verbindungen')}</span>
      ) : null}
    </footer>
  )
}
