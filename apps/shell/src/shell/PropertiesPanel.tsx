import type { ReactNode } from 'react'
import { Badge, Button, Icon } from '@avplan/ui'
import { computeCounts, type SuiteProject } from '../data/project'
import type { ModuleDef, ModuleId } from '../modules/registry'

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
  const accent = module.accent

  if (!project) {
    return (
      <div className="flex h-full flex-col bg-av-surface-1">
        <Header eyebrow={module.eyebrow} title={module.title} sub="Eigenständiger Modus" accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title="Kein Projekt" icon="modules">
            <p className="text-[12px] leading-relaxed text-av-text-muted">
              Dieses Modul ist ohne zugewiesenes Projekt nutzbar. Öffne den Planer zum Bearbeiten oder
              weise oben ein Projekt zu, um Auswahl-Details, Plan-Checks und Venue-Verknüpfungen zu sehen.
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
        <Header eyebrow="Projekt · Übersicht" title={project.meta.name} sub={`${project.meta.venue} · Version ${project.meta.version}`} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title="Umfang" icon="modules">
            <Field label="Geräte">{c.devices}</Field>
            <Field label="Kabel">{c.cables}</Field>
            <Field label="Kabellänge">{c.cableTotalM} m</Field>
            <Field label="Kameras">{c.cameras}</Field>
            <Field label="Fixtures">{c.fixtures}</Field>
          </Group>
          <Group title="Plan-Check" icon="check" accent="var(--av-ok)">
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="ok">Signal ok</Badge>
              <Badge tone="warn">1 offenes Ende</Badge>
              <Badge tone="ok">DMX kein Konflikt</Badge>
            </div>
          </Group>
          <Group title="Venue" icon="raum">
            <p className="text-[12px] leading-relaxed text-av-text-muted">
              Kameras und Dimmer sind <span className="text-av-text-secondary">automatisch verknüpft</span> — Position und Details kommen aus Raum/Kameras/Licht und erscheinen in allen Modulen.
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
        <Header eyebrow={module.eyebrow} title={`${from?.name.split(' — ')[0]} → ${to?.name.split(' ')[0]} In`} sub={`${cable.type} · BNC ↔ BNC · Layer Video`} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title="Kabel">
            <Field label="Typ">{cable.type}</Field>
            <Field label="Länge">{cable.lengthM} m</Field>
            <Field label="Label">{cable.label}</Field>
          </Group>
          <Group title="Route" accent={accent}>
            <Field label="Von">{from?.name}</Field>
            <Field label="Nach">{to?.name}</Field>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="ok">Plan-Check ok</Badge>
              <Badge tone="accent">Patch-Sheet S. 2</Badge>
            </div>
          </Group>
          <Group title="Venue-Gerät" icon="camera" accent="var(--mod-cameras)">
            <Field label="Quelle">CAM 2 @ 12,0 / 11,6 m</Field>
            <Field label="Kabelweg">≈ 41 m + Reserve</Field>
            <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('cameras')}>
              <Icon name="camera" size={14} /> Im Kamera-Plan zeigen
            </Button>
          </Group>
          <Group title="Beschaffung" icon="modules">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-av-text-secondary">BOM: 12G-SDI 50 m-Klasse</span>
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
        <Header eyebrow={module.eyebrow} title={`${cam.name} — ${cam.model}`} sub={`${cam.lens}`} accent={accent} />
        <div className="av-scroll flex-1 overflow-auto">
          <Group title="Position & Blick">
            <Field label="X / Y">{cam.x.toFixed(1)} / {cam.y.toFixed(1)} m</Field>
            <Field label="Brennweite">{cam.focalMm} mm</Field>
            <Field label="H-FOV">{cam.hfovDeg.toFixed(1)}°</Field>
          </Group>
          <Group title="Berechnung" accent={accent}>
            <Field label="Bildbreite">1,89 m @ 8,7 m</Field>
            <Field label="DoF">7,9 – 9,7 m</Field>
            <Field label="Host im Bild">72 % Höhe</Field>
          </Group>
          <Group title="Verkabelung" icon="signal" accent="var(--mod-signal)">
            <Field label="SDI Out 1">ATEM In 2 · 45 m</Field>
            <Field label="Ethernet">Switch FOH · Cat6A</Field>
            <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('signal')}>
              <Icon name="signal" size={14} /> Im Signal-Flow zeigen
            </Button>
          </Group>
          <Group title="Licht am Motiv" icon="light" accent="var(--mod-licht)">
            <Field label="Host">812 lx · Key/Fill 2,8 : 1</Field>
            <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('licht')}>
              <Icon name="light" size={14} /> Zur Licht-Ebene
            </Button>
          </Group>
        </div>
      </div>
    )
  }

  // licht
  const fx = project.fixtures.find((f) => f.id === selectedId) ?? project.fixtures[2]
  return (
    <div className="flex h-full flex-col bg-av-surface-1">
      <Header eyebrow={module.eyebrow} title={`${fx.name} — ${fx.model}`} sub={`Truss 1 · Purpose: ${fx.purpose}`} accent={accent} />
      <div className="av-scroll flex-1 overflow-auto">
        <Group title="Position & Aim">
          <Field label="X / Y">{fx.x.toFixed(1)} / {fx.y.toFixed(1)} m</Field>
          <Field label="Höhe">6,0 m</Field>
        </Group>
        <Group title="Dimmer & Beam" accent={accent}>
          <Field label="Dimmer">{fx.dimmerPct} %</Field>
          <Field label="Zoom">26°</Field>
          <Field label="CCT">3200 K</Field>
        </Group>
        <Group title="DMX-Patch" icon="check" accent="var(--av-ok)">
          <Field label="Kanal / Universe">{fx.dmxChannel} / 1</Field>
          <div className="mt-2"><Badge tone="ok">kein Konflikt · Auto-Patch aktiv</Badge></div>
        </Group>
        <Group title="Verkabelung & Strom" icon="signal" accent="var(--mod-signal)">
          <Field label="Speisung">Dimmer Rack 2 · Circ 4</Field>
          <Field label="Last">750 W · L2: 9,2 / 16 A</Field>
          <Button variant="subtle" size="sm" className="mt-2" onClick={() => onNavigate('signal')}>
            <Icon name="signal" size={14} /> Im Signal-Flow zeigen
          </Button>
        </Group>
        <Group title="Im Bild von" icon="camera" accent="var(--mod-cameras)">
          <p className="text-[12px] text-av-text-muted">CAM 2 (85 mm) · CAM 3 (Tele) — Fixture liegt im FOV, Blendung prüfen.</p>
        </Group>
      </div>
    </div>
  )
}
