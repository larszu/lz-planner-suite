import type { ReactNode } from 'react'
import { Badge, Button, Icon } from '@avplan/ui'
import { computeCounts, type SuiteProject } from '../data/project'
import type { ModuleDef, ModuleId } from '../modules/registry'
import { useT, type TFunc } from '../i18n'

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
}: {
  module: ModuleDef
  project: SuiteProject | null
  selectedId: string | null
  onNavigate: (id: ModuleId) => void
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
    const c = computeCounts(project)
    return (
      <div className="flex h-full flex-col bg-av-surface-1">
        <Header eyebrow={t('panels.overview.eyebrow', 'Projekt · Übersicht')} title={project.meta.name} sub={`${project.meta.venue} · Version ${project.meta.version}`} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title={t('panels.group.scope', 'Umfang')} icon="modules">
            <Field label={t('panels.field.devices', 'Geräte')}>{c.devices}</Field>
            <Field label={t('panels.field.cables', 'Kabel')}>{c.cables}</Field>
            <Field label={t('panels.field.cableLength', 'Kabellänge')}>{c.cableTotalM} m</Field>
            <Field label={t('panels.field.cameras', 'Kameras')}>{c.cameras}</Field>
            <Field label={t('panels.field.fixtures', 'Fixtures')}>{c.fixtures}</Field>
          </Group>
          <Group title={t('panels.group.planCheck', 'Plan-Check')} icon="check" accent="var(--av-ok)">
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="ok">{t('panels.badge.signalOk', 'Signal ok')}</Badge>
              <Badge tone="warn">{t('panels.badge.openEnd', '1 offenes Ende')}</Badge>
              <Badge tone="ok">{t('panels.badge.dmxNoConflict', 'DMX kein Konflikt')}</Badge>
            </div>
          </Group>
          <Group title={t('panels.group.venue', 'Venue')} icon="raum">
            <p className="text-[12px] leading-relaxed text-av-text-muted">
              {t('panels.overview.venue.pre', 'Kameras und Dimmer sind ')}<span className="text-av-text-secondary">{t('panels.overview.venue.link', 'automatisch verknüpft')}</span>{t('panels.overview.venue.post', ' — Position und Details kommen aus Raum/Kameras/Licht und erscheinen in allen Modulen.')}
            </p>
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
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="ok">{t('panels.badge.planCheckOk', 'Plan-Check ok')}</Badge>
              <Badge tone="accent">{t('panels.badge.patchSheet', 'Patch-Sheet S. 2')}</Badge>
            </div>
          </Group>
          <Group title={t('panels.group.venueDevice', 'Venue-Gerät')} icon="camera" accent="var(--mod-cameras)">
            <Field label={t('panels.field.source', 'Quelle')}>CAM 2 @ 12,0 / 11,6 m</Field>
            <Field label={t('panels.field.cableRun', 'Kabelweg')}>{t('panels.value.cableRunReserve', '≈ 41 m + Reserve')}</Field>
            <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('cameras')}>
              <Icon name="camera" size={14} /> {t('panels.action.showInCameraPlan', 'Im Kamera-Plan zeigen')}
            </Button>
          </Group>
          <Group title={t('panels.group.procurement', 'Beschaffung')} icon="modules">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-av-text-secondary">{t('panels.value.bomClass', 'BOM: 12G-SDI 50 m-Klasse')}</span>
              <Badge tone="warn">Rentman ✓</Badge>
            </div>
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
          <Group title={t('panels.group.calculation', 'Berechnung')} accent={accent}>
            <Field label={t('panels.field.imageWidth', 'Bildbreite')}>1,89 m @ 8,7 m</Field>
            <Field label="DoF">7,9 – 9,7 m</Field>
            <Field label={t('panels.field.hostInFrame', 'Host im Bild')}>{t('panels.value.heightPct', '72 % Höhe')}</Field>
          </Group>
          <Group title={t('panels.group.cabling', 'Verkabelung')} icon="signal" accent="var(--mod-signal)">
            <Field label="SDI Out 1">ATEM In 2 · 45 m</Field>
            <Field label="Ethernet">Switch FOH · Cat6A</Field>
            <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('signal')}>
              <Icon name="signal" size={14} /> {t('panels.action.showInSignalFlow', 'Im Signal-Flow zeigen')}
            </Button>
          </Group>
          <Group title={t('panels.group.lightAtSubject', 'Licht am Motiv')} icon="light" accent="var(--mod-licht)">
            <Field label="Host">812 lx · Key/Fill 2,8 : 1</Field>
            <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('licht')}>
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
          <Field label={t('panels.field.height', 'Höhe')}>6,0 m</Field>
        </Group>
        <Group title={t('panels.group.dimmerBeam', 'Dimmer & Beam')} accent={accent}>
          <Field label="Dimmer">{fx.dimmerPct} %</Field>
          <Field label="Zoom">26°</Field>
          <Field label="CCT">3200 K</Field>
        </Group>
        <Group title={t('panels.group.dmxPatch', 'DMX-Patch')} icon="check" accent="var(--av-ok)">
          <Field label={t('panels.field.channelUniverse', 'Kanal / Universe')}>{fx.dmxChannel} / 1</Field>
          <div className="mt-2"><Badge tone="ok">{t('panels.badge.noConflictAutoPatch', 'kein Konflikt · Auto-Patch aktiv')}</Badge></div>
        </Group>
        <Group title={t('panels.group.cablingPower', 'Verkabelung & Strom')} icon="signal" accent="var(--mod-signal)">
          <Field label={t('panels.field.feed', 'Speisung')}>Dimmer Rack 2 · Circ 4</Field>
          <Field label={t('panels.field.load', 'Last')}>750 W · L2: 9,2 / 16 A</Field>
          <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('signal')}>
            <Icon name="signal" size={14} /> {t('panels.action.showInSignalFlow', 'Im Signal-Flow zeigen')}
          </Button>
        </Group>
        <Group title={t('panels.group.inFrameFrom', 'Im Bild von')} icon="camera" accent="var(--mod-cameras)">
          <p className="text-[12px] text-av-text-muted">{t('panels.fixture.inFrameBody', 'CAM 2 (85 mm) · CAM 3 (Tele) — Fixture liegt im FOV, Blendung prüfen.')}</p>
        </Group>
      </div>
    </div>
  )
}
