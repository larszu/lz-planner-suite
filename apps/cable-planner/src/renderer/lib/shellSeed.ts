// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): der Projekt-Seed der Shell wird hier auf das
// native Modell des Cable-Planers abgebildet — und zurueck.
//
// WOFUER. Die Suite-Shell fuehrt ein bewusst einfaches Projektmodell (Raum,
// Kameras, Leuchten, Signalknoten, Kabel) und schiebt davon die Teilmenge, die
// diesen Planer angeht, als `suite-seed` durch den postMessage-Bus. Ohne diese
// Datei zeigte das Signal-Modul der Suite links die Geraete des Shell-Projekts
// und in der Mitte einen leeren Cable-Planer mit seinem Erst-Start-Dialog.
//
// DER GRUNDSATZ, DER JEDE ENTSCHEIDUNG HIER BESTIMMT: nichts erfinden. Der
// Seed kennt keine Port-Belegung. Ein erfundener „SDI Out" waere eine
// plausible-aber-falsche Tatsache, die still in Stueckliste, Patchliste und
// Verkabelung eingeht — genau das, wogegen `portsUnknown` und Pruefung 18
// geschrieben sind. Daraus folgen drei Regeln, und die dritte ist die, die
// wehtut:
//
//   1. AUFLOESEN STATT RATEN. Ein Seed-Geraet bekommt nur dann echte Ports,
//      wenn sein Name GENAU EIN Katalog-Template trifft. Mehrdeutig oder kein
//      Treffer heisst „unbekannt", nicht „nimm das naechstbeste".
//
//   2. PORTS NUR AUF UNAUFGELOESTEN GERAETEN. Sagt der Seed „Kabel V-012 geht
//      von CAM 2 zum ATEM", dann ist EIN Anschlusspunkt je Seite von dieser
//      Aussage GEDECKT — sie waere sonst sinnlos. Erfunden waere die Gesamtzahl
//      der Ports, ihre Nummerierung oder ihr Steckertyp; die kommen deshalb aus
//      dem Kabel selbst, und das Geraet behaelt `portsUnknown` samt
//      `specSource`, damit Pruefung 18 die Datenblatt-Ergaenzung weiter
//      einfordert und dabei die richtige Quelle nennt (cable#700).
//
//   3. AUF AUFGELOESTEN GERAETEN NICHT. Ein ATEM Constellation 8K hat genau 40
//      Eingaenge. Ist keiner mehr frei, waere ein 41. keine Ergaenzung, sondern
//      eine Falschaussage ueber echte Hardware. Das Kabel wird dann NICHT
//      angelegt, sondern als ausgelassen gemeldet — sichtbar, nicht still.
// ───────────────────────────────────────────────────────────────────────────
import type { SeedCable, SeedDevice, SuiteSeed } from '@avplan/ui/embed'
import type { ConnectorType, EquipmentItem, EquipmentTemplate, Port } from '../types/equipment'
import type { Cable, CableType } from '../types/cable'
import type { SignalStandard } from '../types/cableSpec'
import { listDeviceTypes, resolveDeviceType } from './deviceTypeRegistry'

/** Belegtext fuer alles, was aus dem Seed statt aus einem Datenblatt stammt. */
export const SEED_BELEG = 'dem Suite-Projekt der Shell — nicht aus einem Datenblatt'

/** Der Seed fuehrt normalisierte Lagen (0..1); der Canvas rechnet in Pixeln. */
const CANVAS_W = 1800
const CANVAS_H = 1000

/**
 * Kabeltyp der Shell -> Stecker + Signal-Standard. Bewusst eine Tabelle und
 * keine Heuristik: was hier nicht steht, wird nicht geraten, sondern gemeldet.
 * Ein falsch geratener Stecker steht sonst in der Bestell-Liste.
 */
const KABEL_TABELLE: Record<string, { connector: ConnectorType; standard?: SignalStandard }> = {
  '12g-sdi': { connector: 'BNC', standard: 'SDI-12G' },
  '6g-sdi': { connector: 'BNC', standard: 'SDI-6G' },
  '3g-sdi': { connector: 'BNC', standard: 'SDI-3G' },
  'hd-sdi': { connector: 'BNC', standard: 'SDI-HD' },
  sdi: { connector: 'BNC', standard: 'SDI-HD' },
  hdmi: { connector: 'HDMI', standard: 'HDMI-2.0' },
  cat5e: { connector: 'Ethernet/RJ45', standard: 'Eth-1G' },
  cat6: { connector: 'Ethernet/RJ45', standard: 'Eth-1G' },
  cat6a: { connector: 'Ethernet/RJ45', standard: 'Eth-10G' },
  cat7: { connector: 'Ethernet/RJ45', standard: 'Eth-10G' },
  ethernet: { connector: 'Ethernet/RJ45', standard: 'Eth-1G' },
  dmx512: { connector: 'XLR' },
  dmx: { connector: 'XLR' },
  xlr: { connector: 'XLR', standard: 'Analog-Audio' },
  aes3: { connector: 'XLR', standard: 'AES3' },
  fiber: { connector: 'Fiber' },
  lwl: { connector: 'Fiber' },
}

const normalisiere = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[×✕]/g, 'x')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Kandidaten-Bezeichnungen eines Seed-Geraets, gegen die der Katalog geprueft
 * wird. Das Shell-Label traegt oft eine Instanz davor („CAM 1 — Sony FX9"),
 * deshalb zaehlt auch der Teil hinter dem Gedankenstrich als Kandidat.
 */
export function kandidaten(device: Pick<SeedDevice, 'name' | 'model'>): string[] {
  const roh = [device.model, device.name].filter((s): s is string => !!s && s.trim().length > 0)
  const aus: string[] = []
  for (const r of roh) {
    const n = normalisiere(r)
    if (n) aus.push(n)
    const teile = n.split(' - ')
    if (teile.length > 1) {
      const hinten = teile[teile.length - 1].trim()
      if (hinten) aus.push(hinten)
    }
  }
  return [...new Set(aus)]
}

/**
 * Genau-ein-Treffer oder null. Getroffen wird, wenn ein Template-Name dem
 * Kandidaten entspricht oder auf `" " + Kandidat` endet — Katalognamen tragen
 * den Hersteller vorn („Blackmagic ATEM Constellation 8K"), das Shell-Label
 * meist nicht. Treffen mehrere, ist das Ergebnis ausdruecklich null: bei
 * Mehrdeutigkeit raten waere schlimmer als nicht aufloesen.
 */
export function katalogTemplate(device: Pick<SeedDevice, 'name' | 'model'>): EquipmentTemplate | null {
  const typen = listDeviceTypes()
  for (const kandidat of kandidaten(device)) {
    const treffer = typen.filter((typ) => {
      const name = normalisiere(typ.name)
      return name === kandidat || name.endsWith(` ${kandidat}`)
    })
    if (treffer.length === 1) {
      const info = resolveDeviceType(treffer[0].id)
      if (info) return info.template
    }
  }
  return null
}

const klonPort = (p: Port, praefix: string, i: number): Port => ({
  ...p,
  id: `${praefix}-${i}-${p.id}`,
})

interface SeedGeraet {
  item: EquipmentItem
  /** true = kein eindeutiger Katalog-Treffer, Ports duerfen ergaenzt werden. */
  offen: boolean
}

export interface SeedUebernahme {
  equipment: EquipmentItem[]
  cables: Cable[]
  /** Was nicht angelegt werden konnte — gehoert sichtbar gemacht, nicht verschluckt. */
  ausgelassen: { id: string; label: string; grund: string }[]
}

/**
 * Seed -> Equipment + Kabel. Reine Funktion ohne Store-Zugriff, damit sie
 * headless getestet werden kann.
 */
export function seedToCable(seed: SuiteSeed): SeedUebernahme {
  const ausgelassen: SeedUebernahme['ausgelassen'] = []
  const geraete = new Map<string, SeedGeraet>()

  seed.devices.forEach((d, i) => {
    const tmpl = katalogTemplate(d)
    const basis = {
      id: d.id,
      name: d.name,
      ...(d.subtitle ? { subtitle: d.subtitle } : {}),
      x: Math.round((d.nx ?? (i % 4) * 0.25) * CANVAS_W),
      y: Math.round((d.ny ?? Math.floor(i / 4) * 0.25) * CANVAS_H),
    }
    if (tmpl) {
      geraete.set(d.id, {
        offen: false,
        item: {
          ...tmpl,
          ...basis,
          // Der Katalogname ist die belegte Angabe; das Shell-Label bleibt als
          // Untertitel stehen, damit der Nutzer sein Geraet wiedererkennt.
          name: d.name,
          inputs: tmpl.inputs.map((p, k) => klonPort(p, d.id, k)),
          outputs: tmpl.outputs.map((p, k) => klonPort(p, d.id, k)),
          width: tmpl.width ?? 240,
          height: tmpl.height ?? 200,
        },
      })
    } else {
      geraete.set(d.id, {
        offen: true,
        item: {
          ...basis,
          category: 'Sonstiges',
          inputs: [],
          outputs: [],
          width: 240,
          height: 200,
          portsUnknown: true,
        },
      })
    }
  })

  const belegt = new Set<string>()
  const cables: Cable[] = []

  /**
   * Anschlusspunkt fuer ein Kabelende suchen. Auf aufgeloesten Geraeten nur
   * unter den echten Ports (Regel 3); auf unaufgeloesten wird einer aus der
   * Kabel-Aussage selbst angelegt (Regel 2).
   */
  const anschluss = (
    deviceId: string,
    richtung: 'inputs' | 'outputs',
    kabel: SeedCable,
    connector: ConnectorType,
    standard?: SignalStandard,
  ): string | null => {
    const g = geraete.get(deviceId)
    if (!g) return null
    const frei = g.item[richtung].find((p) => p.connectorType === connector && !belegt.has(`${deviceId}:${p.id}`))
    if (frei) {
      belegt.add(`${deviceId}:${frei.id}`)
      return frei.id
    }
    if (!g.offen) return null
    const port: Port = {
      id: `seed-${richtung === 'inputs' ? 'in' : 'out'}-${kabel.id}`,
      name: kabel.label,
      type: connector,
      connectorType: connector,
      ...(standard ? { standard } : {}),
    }
    g.item = { ...g.item, [richtung]: [...g.item[richtung], port] }
    belegt.add(`${deviceId}:${port.id}`)
    return port.id
  }

  for (const c of seed.cables) {
    const eintrag = KABEL_TABELLE[normalisiere(c.type)]
    if (!eintrag) {
      ausgelassen.push({ id: c.id, label: c.label, grund: `Kabeltyp „${c.type}" ist hier nicht bekannt` })
      continue
    }
    if (!geraete.has(c.from) || !geraete.has(c.to)) {
      ausgelassen.push({ id: c.id, label: c.label, grund: 'Endgerät fehlt im Projekt' })
      continue
    }
    const von = anschluss(c.from, 'outputs', c, eintrag.connector, eintrag.standard)
    const nach = von ? anschluss(c.to, 'inputs', c, eintrag.connector, eintrag.standard) : null
    if (!von || !nach) {
      ausgelassen.push({
        id: c.id,
        label: c.label,
        grund: `kein freier ${eintrag.connector}-Anschluss laut Datenblatt`,
      })
      continue
    }
    cables.push({
      id: c.id,
      name: c.label,
      type: eintrag.connector as CableType,
      length: c.lengthM ?? 0,
      color: '#94a3b8',
      fromEquipmentId: c.from,
      fromPortId: von,
      toEquipmentId: c.to,
      toPortId: nach,
      notes: '',
      ...(eintrag.standard ? { standard: eintrag.standard } : {}),
    })
  }

  // Der Beleg wird erst jetzt gesetzt: vorher steht nicht fest, wie viele
  // Ports aus dem Seed entstanden sind, und `value` soll die Zahl nennen, die
  // wirklich im Plan steht.
  const equipment = [...geraete.values()].map(({ item, offen }) => {
    if (!offen || (item.inputs.length === 0 && item.outputs.length === 0)) return item
    const beleg = { value: `${item.inputs.length} In / ${item.outputs.length} Out`, source: SEED_BELEG }
    return { ...item, specSource: { ...(item.specSource ?? {}), inputs: beleg, outputs: beleg } }
  })

  return { equipment, cables, ausgelassen }
}

/** Rueckweg: das native Modell als Seed-Domaene „signal". */
export function cableToSeedPatch(project: {
  equipment?: EquipmentItem[]
  cables?: Cable[]
}): { devices: SeedDevice[]; cables: SeedCable[] } {
  const equipment = project.equipment ?? []
  return {
    devices: equipment.map((e) => ({
      id: e.id,
      name: e.name,
      ...(e.subtitle ? { subtitle: e.subtitle } : {}),
      nx: Math.min(1, Math.max(0, e.x / CANVAS_W)),
      ny: Math.min(1, Math.max(0, e.y / CANVAS_H)),
    })),
    cables: (project.cables ?? []).map((c) => ({
      id: c.id,
      label: c.name,
      // Zurueck geht der Standard, wenn er bekannt ist — er ist die
      // aussagekraeftigere Angabe („SDI-12G" statt „BNC"). Sonst der Stecker.
      type: c.standard ?? c.type,
      lengthM: c.length,
      from: c.fromEquipmentId,
      to: c.toEquipmentId,
    })),
  }
}
