// ───────────────────────────────────────────────────────────────────────────
// Shell-Seite des Projekt-Flusses: `SuiteProject` <-> `suite-seed`.
//
// Die Shell fuehrt ihr Projekt weiter in ihrem eigenen, absichtlich einfachen
// Modell (`SuiteProject`) — daran haengen Dashboard, Eigenschaften-Panel,
// Vorschauen und Statusleiste. Der Seed ist die Teilmenge davon, die einen
// eingebetteten Planer ueberhaupt etwas angeht: Raum, Kameras, Leuchten,
// Signalknoten, Kabel.
//
// Zwei Richtungen, beide verlustarm statt verlustfrei — und das mit Absicht:
//
//   hin    `suiteToSeed`   nimmt nur Felder, fuer die die Shell eine Quelle
//                          hat. Was der Planer mehr weiss (Ports, Datenblatt,
//                          DMX-Universum, Rigging-Hoehe), erfindet die Shell
//                          nicht.
//
//   zurueck `applyPatchToSuite`  ersetzt die gemeldete Domaene, behaelt aber je
//                          Objekt-Id die Shell-eigenen Felder, die im Seed gar
//                          nicht vorkommen (`SignalNode.group`, `.venue`,
//                          `Camera.linked`). Ein Planer, der diese Felder nicht
//                          kennt, darf sie nicht loeschen — genau daran ist die
//                          Bruecke sonst ein Datenverlust statt einer
//                          Verbindung.
// ───────────────────────────────────────────────────────────────────────────

import {
  SUITE_SEED_KIND,
  SUITE_SEED_VERSION,
  type SeedPatch,
  type SuiteSeed,
} from '@avplan/ui/embed'
import type { Cable, CableLayer, Camera, Fixture, SignalNode, SuiteProject } from './project'

/**
 * Kabel-Ebene aus dem Kabeltyp ableiten. Nur fuer Kabel noetig, die ein Planer
 * NEU angelegt hat — bei bekannten Ids gewinnt die bereits gefuehrte Ebene.
 * Bewusst grob: die Shell nutzt `layer` allein zum Einfaerben und Filtern.
 */
export function layerForCableType(type: string): CableLayer {
  const t = type.toLowerCase()
  if (t.includes('dmx') || t.includes('artnet') || t.includes('art-net') || t.includes('sacn')) return 'dmx'
  if (t.includes('cat') || t.includes('ethernet') || t.includes('rj45') || t.includes('lan')) return 'net'
  return 'video'
}

/** Projekt → Seed. `revision` kommt von aussen (siehe `useSuiteSeed`). */
export function suiteToSeed(project: SuiteProject | null, revision: number): SuiteSeed {
  if (!project) {
    return {
      kind: SUITE_SEED_KIND,
      formatVersion: SUITE_SEED_VERSION,
      revision,
      venue: { name: '' },
      cameras: [],
      fixtures: [],
      devices: [],
      cables: [],
    }
  }
  return {
    kind: SUITE_SEED_KIND,
    formatVersion: SUITE_SEED_VERSION,
    revision,
    projectName: project.meta.name,
    venue: {
      name: project.meta.venue,
      widthM: project.hall.w,
      heightM: project.hall.h,
      stage: project.stage,
    },
    cameras: project.cameras.map((c) => ({
      id: c.id,
      name: c.name,
      model: c.model,
      lens: c.lens,
      focalMm: c.focalMm,
      hfovDeg: c.hfovDeg,
      x: c.x,
      y: c.y,
    })),
    fixtures: project.fixtures.map((f) => ({
      id: f.id,
      name: f.name,
      model: f.model,
      purpose: f.purpose,
      dimmerPct: f.dimmerPct,
      dmxChannel: f.dmxChannel,
      x: f.x,
      y: f.y,
    })),
    devices: project.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      subtitle: n.sub,
      nx: n.nx,
      ny: n.ny,
    })),
    cables: project.cables.map((c) => ({
      id: c.id,
      label: c.label,
      type: c.type,
      lengthM: c.lengthM,
      from: c.from,
      to: c.to,
    })),
  }
}

/**
 * Der Fingerabdruck des Teils, den die Planer sehen. Aendert er sich, ist ein
 * neuer Seed faellig; aendert sich nur Crew/Budget/Board, nicht.
 */
export function seedSignature(project: SuiteProject | null): string {
  return JSON.stringify(suiteToSeed(project, 0))
}

/** Rueckmeldung eines Planers in das Shell-Projekt einarbeiten. */
export function applyPatchToSuite(project: SuiteProject, patch: SeedPatch): SuiteProject {
  switch (patch.domain) {
    case 'cameras': {
      if (!patch.cameras) return project
      const vorher = new Map(project.cameras.map((c) => [c.id, c]))
      const cameras: Camera[] = patch.cameras.map((c) => {
        const alt = vorher.get(c.id)
        return {
          id: c.id,
          name: c.name,
          model: c.model ?? alt?.model ?? '',
          lens: c.lens ?? alt?.lens ?? '',
          focalMm: c.focalMm ?? alt?.focalMm ?? 0,
          hfovDeg: c.hfovDeg ?? alt?.hfovDeg ?? 0,
          x: c.x ?? alt?.x ?? 0,
          y: c.y ?? alt?.y ?? 0,
          // `linked` kennt der Seed nicht — bei bekannten Kameras erhalten,
          // bei neuen ist „noch nicht verkabelt" die wahre Aussage.
          linked: alt?.linked ?? false,
        }
      })
      return { ...project, cameras, meta: { ...project.meta, saved: false } }
    }
    case 'fixtures': {
      if (!patch.fixtures) return project
      const vorher = new Map(project.fixtures.map((f) => [f.id, f]))
      const fixtures: Fixture[] = patch.fixtures.map((f) => {
        const alt = vorher.get(f.id)
        return {
          id: f.id,
          name: f.name,
          model: f.model ?? alt?.model ?? '',
          purpose: f.purpose ?? alt?.purpose ?? '',
          dimmerPct: f.dimmerPct ?? alt?.dimmerPct ?? 0,
          dmxChannel: f.dmxChannel ?? alt?.dmxChannel ?? 0,
          x: f.x ?? alt?.x ?? 0,
          y: f.y ?? alt?.y ?? 0,
        }
      })
      return { ...project, fixtures, meta: { ...project.meta, saved: false } }
    }
    case 'signal': {
      if (!patch.devices && !patch.cables) return project
      const alteKnoten = new Map(project.nodes.map((n) => [n.id, n]))
      const nodes: SignalNode[] = (patch.devices ?? project.nodes.map(nodeToSeedShape)).map((d) => {
        const alt = alteKnoten.get(d.id)
        return {
          id: d.id,
          name: d.name,
          sub: d.subtitle ?? alt?.sub ?? '',
          // `group`/`venue` sind Shell-Begriffe (Bodennaehe vs. Regie,
          // steht im Raum). Der Cable-Planer kennt sie nicht und darf sie
          // deshalb weder setzen noch verlieren.
          group: alt?.group ?? 'floor',
          venue: alt?.venue ?? true,
          nx: d.nx ?? alt?.nx ?? 0.5,
          ny: d.ny ?? alt?.ny ?? 0.5,
        }
      })
      const alteKabel = new Map(project.cables.map((c) => [c.id, c]))
      const cables: Cable[] = (patch.cables ?? project.cables.map(cableToSeedShape)).map((c) => {
        const alt = alteKabel.get(c.id)
        return {
          id: c.id,
          label: c.label,
          type: c.type,
          layer: alt?.layer ?? layerForCableType(c.type),
          lengthM: c.lengthM ?? alt?.lengthM ?? 0,
          from: c.from,
          to: c.to,
        }
      })
      return { ...project, nodes, cables, meta: { ...project.meta, saved: false } }
    }
    default:
      return project
  }
}

const nodeToSeedShape = (n: SignalNode) => ({ id: n.id, name: n.name, subtitle: n.sub, nx: n.nx, ny: n.ny })
const cableToSeedShape = (c: Cable) => ({ id: c.id, label: c.label, type: c.type, lengthM: c.lengthM, from: c.from, to: c.to })
