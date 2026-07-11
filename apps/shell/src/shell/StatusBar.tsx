import { Icon } from '@avplan/ui'
import { computeCounts, type SuiteProject } from '../data/project'
import type { ModuleId } from '../modules/registry'

export function StatusBar({
  module,
  project,
  zoom,
}: {
  module: ModuleId
  project: SuiteProject | null
  zoom: number
}) {
  const counts = project ? computeCounts(project) : null

  return (
    <footer className="av-statusbar" role="contentinfo">
      <span className="av-status-item">
        <span className="av-num">Zoom {zoom} %</span>
      </span>
      <span className="av-status-item">Raster 0,5 m</span>

      <span className="flex-1" />

      {!project ? (
        <span className="av-status-item text-av-text-faint">Kein Projekt · Modul eigenständig</span>
      ) : module === 'signal' && counts ? (
        <>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.devices}</span> Geräte</span>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.cables}</span> Kabel · <span className="av-num">{counts.cableTotalM} m</span></span>
          <span className="av-status-item" style={{ color: 'var(--av-warn)' }}>
            <Icon name="warning" size={13} /> {counts.openEnds} offenes Ende
          </span>
        </>
      ) : module === 'cameras' && counts ? (
        <>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.cameras}</span> Kameras · 4 Objektive</span>
          <span className="av-status-item" style={{ color: 'var(--av-ok)' }}><Icon name="check" size={13} /> Coverage ok</span>
        </>
      ) : module === 'licht' && counts ? (
        <>
          <span className="av-status-item"><span className="av-num av-status-strong">{counts.fixtures}</span> Fixtures · 3,4 kW</span>
          <span className="av-status-item" style={{ color: 'var(--av-warn)' }}><Icon name="warning" size={13} /> 2 Hinweise (Rig-Check)</span>
          <span className="av-status-item" style={{ color: 'var(--av-ok)' }}>DMX ✓</span>
        </>
      ) : (
        <span className="av-status-item" style={{ color: 'var(--av-ok)' }}><Icon name="check" size={13} /> Plan-Check ok</span>
      )}
    </footer>
  )
}
