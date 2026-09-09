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
import type { SeedCamera, SeedVenue, SuiteSeed } from '@avplan/ui/embed';
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
/**
 * ───────────────────────────────────────────────────────────────────────────
 * DER SEED SETZT NICHT ZURUECK, WAS ER NICHT SAGT.
 *
 * Gemessen 2026-09-09 am gebauten Stand: `connectShellSeed` wendet JEDE
 * hoehere Revision an, und die Shell zaehlt sie bei Projektwechsel, Undo/Redo
 * und Kopf-Aenderung hoch. Diese Funktion baute daraufhin jede Kamera NEU —
 * mit `pan: -90`, `tilt: 0`, `z: 1.5`, Blende, Fokusdistanz, Stativ,
 * Extender, Sensor-Modus und Farbe aus der Vorgabe.
 *
 * Der Seed sagt von alldem NICHTS. Er nennt Id, Name, Modell, Objektiv,
 * Brennweite und Position. Wer seine Kameras ausgerichtet, auf ein Podest
 * gestellt und scharfgestellt hatte, verlor das, sobald jemand in der Shell
 * den Projektnamen aenderte — still, und in einem Planer, dessen ganzer Zweck
 * die Bildwirkung dieser Einstellungen ist.
 *
 * Die Regel lautet deshalb: der Seed setzt, was er NENNT; alles Uebrige
 * behaelt eine bereits platzierte Kamera (`vorhandene`). Nur eine wirklich
 * neue bekommt die Vorgaben — dort sind sie der Anfangswert einer
 * Platzierung und keine Aussage ueber diese Show.
 * ───────────────────────────────────────────────────────────────────────────
 */
export function seedToCameras(
  seed: SuiteSeed,
  venue: Venue,
  vorauswahl: (cam: Camera) => { mount: string; lens: Lens | null },
  lenses: Lens[] = LENSES,
  vorhandene: VenueCamera[] = [],
): KameraUebernahme {
  const cameras: VenueCamera[] = [];
  const ausgelassen: KameraUebernahme['ausgelassen'] = [];
  const schonDa = new Map(vorhandene.map((v) => [v.id, v]));

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
    const alt = schonDa.get(c.id);
    // Die Brennweite aus dem Seed gilt — aber nur, soweit das Objektiv sie
    // hergibt. Eine Zahl ausserhalb des Zoombereichs waere eine Einstellung,
    // die es an diesem Glas nicht gibt. Nennt der Seed keine, behaelt eine
    // bekannte Kamera ihre eigene.
    const brennweite = Math.min(
      Math.max(c.focalMm ?? alt?.focalLength ?? lensDef.focalLengthMin, lensDef.focalLengthMin),
      lensDef.focalLengthMax,
    );
    cameras.push({
      id: c.id,
      label: c.name,
      cameraId: camDef.id,
      lensId: lensDef.id,
      x: c.x ?? alt?.x ?? venue.widthM / 2,
      y: c.y ?? alt?.y ?? venue.heightM * 0.75,
      // Ab hier: alles, wovon der Seed NICHTS sagt. Eine bekannte Kamera
      // behaelt es; nur eine neue bekommt die Vorgabe.
      z: alt?.z ?? 1.5,
      pan: alt?.pan ?? -90,
      tilt: alt?.tilt ?? 0,
      focalLength: brennweite,
      aperture: alt?.aperture ?? lensDef.maxApertureWide,
      focusDistance: alt?.focusDistance ?? venue.heightM * 0.5,
      color: alt?.color ?? CAMERA_COLORS[i % CAMERA_COLORS.length],
      extenderActive: alt?.extenderActive ?? 1,
      useSpeedbooster: alt?.useSpeedbooster ?? false,
      sensorModeIndex:
        alt?.sensorModeIndex ??
        (camDef.sensorModes && camDef.sensorModes.length > 0 ? 0 : undefined),
      activeMount: alt?.activeMount ?? wahl.mount,
      mountType: alt?.mountType ?? 'tripod',
    });
  });

  return { cameras, ausgelassen };
}

/**
 * Der Raum aus dem Seed — Masse und Buehne sind Aussagen der Shell.
 *
 * DER SEED NENNT GENAU EINE BUEHNE (`SeedVenue.stage`), dieser Planer kennt
 * eine LISTE. Der Rueckweg meldet deshalb `stages[0]` und sonst nichts
 * (`venueToSeedPatch`) — und der Hinweg darf entsprechend nur die erste
 * setzen.
 *
 * Vorher ersetzte er die ganze Liste durch die eine aus dem Seed. Wer in
 * diesem Planer eine zweite Buehne, einen Steg oder eine Seitenbuehne angelegt
 * hatte (`addStage` gibt es), verlor sie beim naechsten Seed — ausgeloest von
 * einem Projektwechsel in der Shell, die von diesen Buehnen nie erfahren hat.
 * Etwas nicht zu KENNEN ist kein Grund, es zu loeschen.
 *
 * Die uebrigen Felder der ersten Buehne (Beschriftung, Sperre) bleiben
 * ebenfalls stehen: der Seed sagt nur, WO sie liegt und WIE GROSS sie ist.
 */
export function seedToVenue(seed: SuiteSeed, vorher: Venue): Venue {
  const stage = seed.venue.stage;
  const erste = vorher.stages[0];
  return {
    ...vorher,
    name: seed.venue.name || vorher.name,
    widthM: seed.venue.widthM ?? vorher.widthM,
    heightM: seed.venue.heightM ?? vorher.heightM,
    stages: stage
      ? [
          {
            ...(erste ?? { id: 'stage-0', label: 'Stage' }),
            x: stage.x,
            y: stage.y,
            width: stage.w,
            height: stage.h,
          },
          ...vorher.stages.slice(1),
        ]
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

/**
 * Rueckweg fuer den RAUM. Er ist das einzige Stueck, das nicht dieser App
 * allein gehoert (E-21): die Shell fuehrt ihn, MultiCam vermisst ihn fuer die
 * Sichtlinien, und Licht tut dasselbe fuer die Rigging-Punkte.
 *
 * Bis 2026-09-08 ging er nur HIN: `seedToVenue` setzte Masse und Buehne hier,
 * und wer sie hier korrigierte, korrigierte sie nicht in der Shell (B-39,
 * Punkt 1). Die Meldung ist deshalb kein Nachtrag, sondern die fehlende
 * Haelfte der Verbindung.
 *
 * `venue.name` steht bewusst NICHT drin. Er gehoert laut `SEED_VENUE_OWNER`
 * der Shell; ihn mitzuschicken erzeugte bei jedem Umbenennen in diesem Planer
 * einen Befund, den niemand haben wollte — die Regel meldet ja gerade den
 * Vorschlag zu einem fremden Feld. Was hier gemeldet wird, ist das, was dieser
 * Planer wirklich vermisst.
 *
 * Nur die ERSTE Buehne wird gemeldet: der Seed kennt genau ein Rechteck, und
 * eine zweite Buehne stillschweigend zur ersten zu machen waere eine
 * Falschaussage ueber den Raum.
 */
export function venueToSeedPatch(venue: Venue): { venue: SeedVenue } {
  const stage = venue.stages[0];
  return {
    venue: {
      // `name` ist im Typ Pflicht; der bisherige Wert ist die einzige
      // wahrheitsgemaesse Belegung — und weil er unveraendert ist, meldet die
      // Regel dazu nichts.
      name: venue.name,
      widthM: venue.widthM,
      heightM: venue.heightM,
      ...(stage ? { stage: { x: stage.x, y: stage.y, w: stage.width, h: stage.height } } : {}),
    },
  };
}
