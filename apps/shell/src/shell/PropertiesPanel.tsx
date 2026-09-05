import type { ReactNode } from 'react'
import { Button, Icon } from '@avplan/ui'
import type { SuiteProject } from '../data/project'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { useT, type TFunc } from '../i18n'
import { RUNTIMES } from '../modules/runtimes'
import type { RuntimeHealth } from './runtimeHealth'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[12px] text-av-text-muted">{label}</span>
      <span className="av-num text-right text-[13px] text-av-text">{children}</span>
    </div>
  )
}

function Group({ title, icon, accent, children }: { title: string; icon?: Parameters<typeof Icon>[0]['name']; accent?: string; children: ReactNode }) {
  return (
    <div className="border-t border-av-border-muted px-3.5 py-3" style={accent ? { borderLeft: `2px solid ${accent}` } : undefined}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: accent ?? 'var(--av-text-muted)' }}>
        {icon && <Icon name={icon} size={12} />}
        {title}
      </div>
      {children}
    </div>
  )
}

function Header({ eyebrow, title, sub, accent }: { eyebrow: string; title: string; sub: string; accent: string }) {
  return (
    <div className="px-3.5 pb-3 pt-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        {eyebrow}
      </div>
      <div className="text-[17px] font-bold tracking-tight text-av-text">{title}</div>
      <div className="text-[12px] text-av-text-muted">{sub}</div>
    </div>
  )
}

/** Die Produktionsphase als Wort. Vorher stand dort der rohe Enum-Wert („setup"). */
const PHASE_DE: Record<string, string> = {
  planning: 'Planung',
  setup: 'Aufbau',
  show: 'Show',
  teardown: 'Abbau',
}

const typeLabel = (t: TFunc): Record<string, string> => ({
  heading: t('panels.board.type.heading', 'Überschriften'),
  note: t('panels.board.type.note', 'Notizen'),
  link: t('panels.board.type.link', 'Links'),
  todo: t('panels.board.type.todo', 'To-dos'),
  color: t('panels.board.type.color', 'Farben'),
  look: t('panels.board.type.look', 'Looks'),
  column: t('panels.board.type.column', 'Spalten'),
  board: t('panels.board.type.board', 'Unterboards'),
  image: t('panels.board.type.image', 'Bilder'),
})

export function PropertiesPanel({
  module,
  project,
  selectedId,
  onNavigate,
  runtimeHealth,
}: {
  module: ModuleDef
  project: SuiteProject | null
  selectedId: string | null
  onNavigate: (id: ModuleId) => void
  /** Erreichbarkeit der vier Anlagen — gemessen in `useRuntimeHealth`. */
  runtimeHealth?: RuntimeHealth
}) {
  const t = useT()
  const accent = module.accent
  const modEyebrow = t(`config.mod.${module.id}.eyebrow`, module.eyebrow)
  const modTitle = t(`config.mod.${module.id}.title`, module.title)

  if (!project) {
    return (
      <div className="flex h-full flex-col bg-av-surface-1">
        <Header eyebrow={modEyebrow} title={modTitle} sub={t('panels.standalone.sub', 'Eigenständiger Modus')} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title={t('panels.noProject.title', 'Kein Projekt')} icon="modules">
            <p className="text-[12px] leading-relaxed text-av-text-muted">
              {t('panels.noProject.body', 'Dieses Modul ist ohne zugewiesenes Projekt nutzbar. Öffne den Planer zum Bearbeiten oder weise oben ein Projekt zu, um Auswahl-Details, Plan-Checks und Venue-Verknüpfungen zu sehen.')}
            </p>
          </Group>
        </div>
      </div>
    )
  }

  if (module.id === 'overview') {
    // WAS HIER FRUEHER STAND: derselbe Umfang (Geraete/Kabel/Kameras/Fixtures),
    // den das Dashboard in der Mitte als Karten zeigt und die Bibliothek links
    // noch einmal auflistet. Dreimal dieselbe Zahl auf einem Bildschirm ist
    // keine Uebersicht, sondern Fuellung.
    //
    // Stattdessen steht hier, was NUR die Shell weiss und sonst niemand zeigt:
    // welche Anlage im Netz gerade antwortet, und in welchem Zustand das
    // Projekt selbst ist.
    return (
      <div className="flex h-full flex-col bg-av-surface-1">
        <Header eyebrow={t('panels.overview.eyebrow', 'Projekt · Übersicht')} title={project.meta.name} sub={`${project.meta.venue} · Version ${project.meta.version}`} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title={t('panels.group.anlagen', 'Anlagen im Netz')} icon="nodes">
            {RUNTIMES.map((r) => {
              const zustand = runtimeHealth?.[r.id] ?? 'unknown'
              return (
                <button
                  key={r.id}
                  type="button"
                  className="av-focus flex w-full items-center gap-2 rounded px-1 py-1.5 text-left hover:bg-av-surface-2"
                  onClick={() => onNavigate(r.id)}
                >
                  <span
                    className="h-2 w-2 flex-none rounded-full"
                    style={{
                      background: zustand === 'on' ? 'var(--av-ok)' : 'var(--av-text-faint)',
                      opacity: zustand === 'on' ? 1 : zustand === 'off' ? 0.5 : 0.3,
                    }}
                  />
                  <span className="flex-1 truncate text-[12.5px] text-av-text">{r.label}</span>
                  <span className="av-num text-[11px] text-av-text-faint">
                    {zustand === 'on'
                      ? t('panels.anlagen.on', 'antwortet')
                      : zustand === 'off'
                        ? t('panels.anlagen.off', 'still')
                        : t('panels.anlagen.unknown', '…')}
                  </span>
                </button>
              )
            })}
          </Group>
          <Group title={t('panels.group.projectState', 'Projekt')} icon="modules">
            <Field label={t('panels.field.version', 'Version')}>{project.meta.version}</Field>
            <Field label={t('panels.field.saved', 'Stand')}>
              {project.meta.saved ? t('panels.saved.yes', 'gespeichert') : t('panels.saved.no', 'ungespeichert')}
            </Field>
            <Field label={t('panels.field.phase', 'Phase')}>
              {t(`panels.phase.${project.show.phase}`, PHASE_DE[project.show.phase])}
            </Field>
          </Group>
        </div>
      </div>
    )
  }

  if (module.id === 'signal') {
    const cable = project.cables.find((c) => c.id === selectedId) ?? project.cables[0]
    const from = project.nodes.find((n) => n.id === cable.from)
    const to = project.nodes.find((n) => n.id === cable.to)
    return (
      <div className="flex h-full flex-col bg-av-surface-1">
        <Header eyebrow={modEyebrow} title={`${from?.name.split(' — ')[0]} → ${to?.name.split(' ')[0]} In`} sub={`${cable.type} · BNC ↔ BNC · Layer Video`} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title={t('panels.group.cable', 'Kabel')}>
            <Field label={t('panels.field.type', 'Typ')}>{cable.type}</Field>
            <Field label={t('panels.field.length', 'Länge')}>{cable.lengthM} m</Field>
            <Field label={t('panels.field.label', 'Label')}>{cable.label}</Field>
          </Group>
          <Group title={t('panels.group.route', 'Route')} accent={accent}>
            <Field label={t('panels.field.from', 'Von')}>{from?.name}</Field>
            <Field label={t('panels.field.to', 'Nach')}>{to?.name}</Field>
            <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('cameras')}>
              <Icon name="camera" size={14} /> {t('panels.action.showInCameraPlan', 'Im Kamera-Plan zeigen')}
            </Button>
          </Group>
        </div>
      </div>
    )
  }

  if (module.id === 'cameras') {
    const cam = project.cameras.find((c) => c.id === selectedId) ?? project.cameras[1]
    return (
      <div className="flex h-full flex-col bg-av-surface-1">
        <Header eyebrow={modEyebrow} title={`${cam.name} — ${cam.model}`} sub={`${cam.lens}`} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title={t('panels.group.positionView', 'Position & Blick')}>
            <Field label={t('panels.field.xy', 'X / Y')}>{cam.x.toFixed(1)} / {cam.y.toFixed(1)} m</Field>
            <Field label={t('panels.field.focalLength', 'Brennweite')}>{cam.focalMm} mm</Field>
            <Field label="H-FOV">{cam.hfovDeg.toFixed(1)}°</Field>
          </Group>
          <Group title={t('panels.group.cabling', 'Verkabelung')} icon="signal" accent="var(--mod-signal)">
            <Button variant="subtle" size="sm" onClick={() => onNavigate('signal')}>
              <Icon name="signal" size={14} /> {t('panels.action.showInSignalFlow', 'Im Signal-Flow zeigen')}
            </Button>
          </Group>
          <Group title={t('panels.group.lightAtSubject', 'Licht am Motiv')} icon="light" accent="var(--mod-licht)">
            <Button variant="subtle" size="sm" onClick={() => onNavigate('licht')}>
              <Icon name="light" size={14} /> {t('panels.action.toLightLayer', 'Zur Licht-Ebene')}
            </Button>
          </Group>
        </div>
      </div>
    )
  }

  if (module.id === 'board') {
    const board = project.show.board
    const byType = board.cards.reduce<Record<string, number>>((acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1
      return acc
    }, {})
    const TYPE_LABEL = typeLabel(t)
    return (
      <div className="flex h-full flex-col bg-av-surface-1">
        <Header eyebrow={modEyebrow} title="Moodboard" sub={t('panels.board.sub', 'Look & Feel der Show')} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title={t('panels.group.content', 'Inhalt')} icon="board">
            <Field label={t('panels.field.cards', 'Karten')}>{board.cards.length}</Field>
            <Field label={t('panels.field.connections', 'Verbindungen')}>{board.connections.length}</Field>
            {Object.entries(byType).map(([type, n]) => (
              <Field key={type} label={TYPE_LABEL[type] ?? type}>{n}</Field>
            ))}
          </Group>
          <Group title={t('panels.group.operation', 'Bedienung')} icon="wand" accent={accent}>
            <p className="text-[12px] leading-relaxed text-av-text-muted">
              {t('panels.board.opBody', 'Karten über die Werkzeugleiste hinzufügen, per Kopf ziehen, doppelklicken zum Bearbeiten. Bei Auswahl erscheint rechts ein Handle — zu einer anderen Karte ziehen, um sie zu verbinden.')}
            </p>
          </Group>
          <Group title={t('panels.group.creativeTech', 'Kreativ → Technik')} icon="light" accent="var(--mod-licht)">
            <p className="text-[12px] leading-relaxed text-av-text-muted">
              {t('panels.board.creativeBody', 'Die Look-Stimmung fließt in die Licht-Ebene, Referenzen in die Kamerapositionen. Das Board ist die Vor-Produktionsebene vor den technischen Modulen.')}
            </p>
          </Group>
        </div>
      </div>
    )
  }

  // licht
  const fx = project.fixtures.find((f) => f.id === selectedId) ?? project.fixtures[2]
  return (
    <div className="flex h-full flex-col bg-av-surface-1">
      <Header eyebrow={modEyebrow} title={`${fx.name} — ${fx.model}`} sub={`Truss 1 · Purpose: ${fx.purpose}`} accent={accent} />
      <div className="av-scroll flex-1 overflow-auto">
        <Group title={t('panels.group.positionAim', 'Position & Aim')}>
          <Field label={t('panels.field.xy', 'X / Y')}>{fx.x.toFixed(1)} / {fx.y.toFixed(1)} m</Field>
        </Group>
        <Group title={t('panels.group.dimmerBeam', 'Dimmer & Beam')} accent={accent}>
          <Field label="Dimmer">{fx.dimmerPct} %</Field>
        </Group>
        <Group title={t('panels.group.dmxPatch', 'DMX-Patch')} icon="modules">
          <Field label={t('panels.field.channelUniverse', 'Kanal / Universe')}>{fx.dmxChannel} / 1</Field>
        </Group>
        <Group title={t('panels.group.cablingPower', 'Verkabelung & Strom')} icon="signal" accent="var(--mod-signal)">
          <Button variant="subtle" size="sm" onClick={() => onNavigate('signal')}>
            <Icon name="signal" size={14} /> {t('panels.action.showInSignalFlow', 'Im Signal-Flow zeigen')}
          </Button>
        </Group>
      </div>
    </div>
  )
}
