// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): der Projekt-Seed der Shell im MultiCam-Planer.
//
// Die Shell fuehrt ihre Kameras flach (Name, Modell, Objektiv-Text,
// Brennweite, Position im Raum). MultiCam fuehrt sie tief: eine `VenueCamera`
// verweist auf ein Katalog-Modell (Sensor, Mount) und ein Objektiv. Diese
// Datei uebersetzt zwischen beidem — und zwar nach denselben Regeln wie im
// Cable-Planer:
//
//   * AUFLOESEN STATT RATEN. Trifft das Modell aus dem Seed genau EIN
//     Katalog-Modell, wird die Kamera platziert. Bei keinem oder mehreren
//     Treffern wird sie NICHT platziert, sondern gemeldet — eine Kamera mit
//     falschem Sensor rechnet falsche Bildwinkel, und das faellt niemandem auf.
//
//   * WAS DER SEED SAGT, GILT. Position, Label und Brennweite kommen aus dem
//     Seed; sie sind Aussagen der Shell und werden nicht durch Defaults ersetzt.
//
//   * DAS OBJEKTIV IST EINE VOREINSTELLUNG, KEINE AUSSAGE. `VenueCamera`
//     braucht zwingend ein `lensId`; der Seed traegt nur einen Freitext
//     („FE 24-105 f/4"). Loest er sich eindeutig auf, wird er genommen. Sonst
//     greift dieselbe Vorauswahl, die `addCamera` beim Anlegen von Hand trifft
//     (`pickInitialMountAndLens`) — eine UI-Voreinstellung, die der Nutzer mit
//     einem Klick aendert, keine Behauptung ueber sein Material.
// ───────────────────────────────────────────────────────────────────────────
import type { SeedCamera, SuiteSeed } from '@avplan/ui/embed';
import { CAMERAS } from '../data/cameras';
import { LENSES } from '../data/lenses';
import type { Camera, Lens, VenueCamera, Venue } from '../types';
import { horizontalFov } from './fov';

const CAMERA_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc', '#fb7185'];

const normalisiere = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[×✕]/g, 'x')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Passt eine Katalog-Bezeichnung zum Text aus dem Seed? Der Seed schreibt
 * „Sony FX9", der Katalog fuehrt „Sony PXW-FX9" — der Modellname darf also
 * vorne einen Zusatz tragen, getrennt durch Leerzeichen oder Bindestrich.
 */
const passt = (katalog: string, kandidat: string): boolean => {
  const k = normalisiere(katalog);
  return k === kandidat || k.endsWith(` ${kandidat}`) || k.endsWith(`-${kandidat}`);
};

/** Genau ein Treffer oder null. Mehrdeutig zaehlt ausdruecklich als kein Treffer. */
export function katalogKamera(seed: Pick<SeedCamera, 'model' | 'name'>): Camera | null {
  const kandidaten = [seed.model, seed.name]
    .filter((s): s is string => !!s && s.trim().length > 0)
    .flatMap((s) => {
      const n = normalisiere(s);
      // Zusaetzlich ohne fuehrenden Hersteller: „sony fx9" -> „fx9".
      const ohneHersteller = n.split(' ').slice(1).join(' ');
      return ohneHersteller ? [n, ohneHersteller] : [n];
    });
  for (const kandidat of [...new Set(kandidaten)]) {
    const treffer = CAMERAS.filter(
      (c) => passt(`${c.manufacturer} ${c.model}`, kandidat) || passt(c.model, kandidat),
    );
    if (treffer.length === 1) return treffer[0];
  }
  return null;
}

/** Objektiv aus dem Freitext des Seeds — eindeutig oder null. */
export function katalogObjektiv(text: string | undefined, lenses: Lens[]): Lens | null {
  if (!text) return null;
  const kandidat = normalisiere(text);
  const treffer = lenses.filter(
    (l) => passt(`${l.manufacturer} ${l.model}`, kandidat) || passt(l.model, kandidat),
  );
  return treffer.length === 1 ? treffer[0] : null;
}

export interface KameraUebernahme {
  cameras: VenueCamera[];
  /** Was nicht platziert werden konnte — gehoert sichtbar gemacht. */
  ausgelassen: { id: string; name: string; grund: string }[];
}

/**
 * Seed -> platzierte Kameras. `vorauswahl` kapselt die Mount-/Objektiv-
 * Vorauswahl des Stores, damit diese Funktion rein und headless testbar bleibt.
 */
export function seedToCameras(
  seed: SuiteSeed,
  venue: Venue,
  vorauswahl: (cam: Camera) => { mount: string; lens: Lens | null },
  lenses: Lens[] = LENSES,
): KameraUebernahme {
  const cameras: VenueCamera[] = [];
  const ausgelassen: KameraUebernahme['ausgelassen'] = [];

  seed.cameras.forEach((c, i) => {
    const camDef = katalogKamera(c);
    if (!camDef) {
      ausgelassen.push({ id: c.id, name: c.name, grund: `Modell „${c.model ?? c.name}" ist im Katalog nicht eindeutig` });
      return;
    }
    const wahl = vorauswahl(camDef);
    const lensDef = katalogObjektiv(c.lens, lenses) ?? wahl.lens ?? lenses[0];
    if (!lensDef) {
      ausgelassen.push({ id: c.id, name: c.name, grund: 'kein passendes Objektiv im Katalog' });
      return;
    }
    cameras.push({
      id: c.id,
      label: c.name,
      cameraId: camDef.id,
      lensId: lensDef.id,
      x: c.x ?? venue.widthM / 2,
      y: c.y ?? venue.heightM * 0.75,
      z: 1.5,
      pan: -90,
      tilt: 0,
      // Die Brennweite aus dem Seed gilt — aber nur, soweit das Objektiv sie
      // hergibt. Eine Zahl ausserhalb des Zoombereichs waere eine Einstellung,
      // die es an diesem Glas nicht gibt.
      focalLength: Math.min(
        Math.max(c.focalMm ?? lensDef.focalLengthMin, lensDef.focalLengthMin),
        lensDef.focalLengthMax,
      ),
      aperture: lensDef.maxApertureWide,
      focusDistance: venue.heightM * 0.5,
      color: CAMERA_COLORS[i % CAMERA_COLORS.length],
      extenderActive: 1,
      useSpeedbooster: false,
      sensorModeIndex: camDef.sensorModes && camDef.sensorModes.length > 0 ? 0 : undefined,
      activeMount: wahl.mount,
      mountType: 'tripod',
    });
  });

  return { cameras, ausgelassen };
}

/** Der Raum aus dem Seed — Masse und Buehne sind Aussagen der Shell. */
export function seedToVenue(seed: SuiteSeed, vorher: Venue): Venue {
  const stage = seed.venue.stage;
  return {
    ...vorher,
    name: seed.venue.name || vorher.name,
    widthM: seed.venue.widthM ?? vorher.widthM,
    heightM: seed.venue.heightM ?? vorher.heightM,
    stages: stage
      ? [{ id: vorher.stages[0]?.id ?? 'stage-0', x: stage.x, y: stage.y, width: stage.w, height: stage.h, label: vorher.stages[0]?.label ?? 'Stage' }]
      : vorher.stages,
  };
}

/** Rueckweg: die platzierten Kameras als Seed-Domaene „cameras". */
export function camerasToSeedPatch(cameras: VenueCamera[], lenses: Lens[] = LENSES): { cameras: SeedCamera[] } {
  return {
    cameras: cameras.map((v) => {
      const camDef = CAMERAS.find((c) => c.id === v.cameraId);
      const lensDef = lenses.find((l) => l.id === v.lensId);
      const sensor =
        camDef?.sensorModes && v.sensorModeIndex !== undefined
          ? (camDef.sensorModes[v.sensorModeIndex] ?? camDef.sensor)
          : camDef?.sensor;
      return {
        id: v.id,
        name: v.label,
        ...(camDef ? { model: `${camDef.manufacturer} ${camDef.model}` } : {}),
        ...(lensDef ? { lens: `${lensDef.manufacturer} ${lensDef.model}` } : {}),
        focalMm: v.focalLength,
        // Der Bildwinkel wird hier gerechnet, nicht drueben: die Shell kennt
        // die Sensorbreite nicht und wuerde sonst den alten Wert weiterzeigen,
        // waehrend die Brennweite laengst eine andere ist.
        ...(sensor ? { hfovDeg: Number(horizontalFov(sensor.widthMm, v.focalLength).toFixed(1)) } : {}),
        x: v.x,
        y: v.y,
      };
    }),
  };
}
