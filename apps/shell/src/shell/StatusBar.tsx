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
  onNavigate,
}: {
  module: ModuleId
  project: SuiteProject | null
  zoom: number
  onZoom: (zoom: number) => void
  onNavigate: (id: ModuleId) => void
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
      ) : (
        <span className="av-status-item text-av-text-faint">{t('chrome.status.overview', 'Übersicht')}</span>
      )}
      <span className="av-status-item">{t('chrome.status.grid', 'Raster 0,5 m')}</span>

      <span className="flex-1" />

      {!project ? (
        <span className="av-status-item text-av-text-faint">{t('chrome.status.noProject', 'Kein Projekt · Modul eigenständig')}</span>
      ) : module === 'signal' && counts ? (
        <>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.devices}</span> {t('chrome.status.devices', 'Geräte')}</span>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.cables}</span> {t('chrome.status.cables', 'Kabel')} · <span className="av-num">{counts.cableTotalM} m</span></span>
          <button type="button" className="av-status-item av-focus rounded hover:bg-av-surface-3" style={{ color: 'var(--av-warn)' }} onClick={() => onNavigate('overview')} title={t('chrome.status.toPlanCheck', 'Zum Plan-Check')}>
            <Icon name="warning" size={13} /> {counts.openEnds} {t('chrome.status.openEnd', 'offenes Ende')}
          </button>
        </>
      ) : module === 'cameras' && counts ? (
        <>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.cameras}</span> {t('chrome.status.camerasLenses', 'Kameras · 4 Objektive')}</span>
          <button type="button" className="av-status-item av-focus rounded hover:bg-av-surface-3" style={{ color: 'var(--av-ok)' }} onClick={() => onNavigate('overview')} title={t('chrome.status.toPlanCheck', 'Zum Plan-Check')}><Icon name="check" size={13} /> {t('chrome.status.coverageOk', 'Coverage ok')}</button>
        </>
      ) : module === 'licht' && counts ? (
        <>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.fixtures}</span> {t('chrome.status.fixturesPower', 'Fixtures · 3,4 kW')}</span>
          <button type="button" className="av-status-item av-focus rounded hover:bg-av-surface-3" style={{ color: 'var(--av-warn)' }} onClick={() => onNavigate('overview')} title={t('chrome.status.toPlanCheck', 'Zum Plan-Check')}><Icon name="warning" size={13} /> {t('chrome.status.rigHints', '2 Hinweise (Rig-Check)')}</button>
          <span className="av-status-item" style={{ color: 'var(--av-ok)' }}>DMX ✓</span>
        </>
      ) : module === 'board' ? (
        <span className="av-status-item"><span className="av-num av-status-strong">{project.show.board.cards.length}</span> {t('chrome.status.cards', 'Karten')} · {project.show.board.connections.length} {t('chrome.status.connections', 'Verbindungen')}</span>
      ) : (
        <button type="button" className="av-status-item av-focus rounded hover:bg-av-surface-3" style={{ color: 'var(--av-ok)' }} onClick={() => onNavigate('overview')} title={t('chrome.status.openPlanChecks', 'Plan-Checks öffnen')}><Icon name="check" size={13} /> {t('chrome.status.planCheckOk', 'Plan-Check ok')}</button>
      )}
    </footer>
  )
}
