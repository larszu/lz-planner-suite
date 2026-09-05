import { describe, expect, it } from 'vitest';
import { emptySeed, type SuiteSeed } from '@avplan/ui/embed';
import { camerasToSeedPatch, katalogKamera, seedToCameras, seedToVenue } from '../utils/shellSeed';
import { LENSES } from '../data/lenses';
import type { Venue } from '../types';

// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY-TEST: der Projekt-Seed der Shell im MultiCam-Planer.
//
// Der Schaden, gegen den hier geprueft wird, ist nicht „es kommt nichts an",
// sondern „es kommt das Falsche an": eine Kamera mit dem Sensor eines anderen
// Modells rechnet falsche Bildwinkel und sieht dabei voellig richtig aus.
// ───────────────────────────────────────────────────────────────────────────

const venue: Venue = { name: 'Halle', widthM: 24, heightM: 14, stages: [{ id: 's0', x: 8, y: 3, width: 6, height: 3, label: 'Stage' }] };
const vorauswahl = () => ({ mount: 'E', lens: LENSES[0] });

const seed = (over: Partial<SuiteSeed> = {}): SuiteSeed => ({ ...emptySeed(1), venue: { name: 'Halle A', widthM: 24, heightM: 14 }, ...over });

describe('shellSeed — Katalog-Aufloesung', () => {
  it('findet ein Modell, das der Katalog mit Praefix fuehrt', () => {
    // Shell: „Sony FX9". Katalog: „Sony PXW-FX9".
    expect(katalogKamera({ model: 'Sony FX9', name: 'CAM 1' })?.id).toBe('sony-fx9');
  });

  it('loest nicht auf, was mehrdeutig oder unbekannt ist', () => {
    expect(katalogKamera({ model: 'Sony FR7 PTZ', name: 'CAM 4' })).toBeNull();
    expect(katalogKamera({ model: 'Irgendeine Kamera', name: 'CAM 9' })).toBeNull();
  });
});

describe('shellSeed — Uebernahme', () => {
  it('platziert nur, was sich eindeutig aufloest, und meldet den Rest', () => {
    const { cameras, ausgelassen } = seedToCameras(
      seed({
        cameras: [
          { id: 'k1', name: 'CAM 1', model: 'Sony FX9', x: 4.2, y: 10.8, focalMm: 50 },
          { id: 'k4', name: 'CAM 4', model: 'Sony FR7 PTZ', x: 3.4, y: 4.6 },
        ],
      }),
      venue,
      vorauswahl,
    );
    expect(cameras.map((c) => c.id)).toEqual(['k1']);
    expect(cameras[0].label).toBe('CAM 1');
    expect(cameras[0].x).toBe(4.2);
    expect(ausgelassen).toHaveLength(1);
    expect(ausgelassen[0].id).toBe('k4');
  });

  it('haelt die Brennweite im Zoombereich des Objektivs', () => {
    // Eine Zahl ausserhalb des Bereichs waere eine Einstellung, die es an
    // diesem Glas nicht gibt.
    const { cameras } = seedToCameras(
      seed({ cameras: [{ id: 'k1', name: 'CAM 1', model: 'Sony FX9', focalMm: 5 }] }),
      venue,
      vorauswahl,
    );
    const lens = LENSES.find((l) => l.id === cameras[0].lensId)!;
    expect(cameras[0].focalLength).toBeGreaterThanOrEqual(lens.focalLengthMin);
    expect(cameras[0].focalLength).toBeLessThanOrEqual(lens.focalLengthMax);
  });

  it('uebernimmt Raummasse und Buehne aus dem Seed', () => {
    const v = seedToVenue(seed({ venue: { name: 'Halle B', widthM: 30, heightM: 18, stage: { x: 1, y: 2, w: 8, h: 4 } } }), venue);
    expect(v.name).toBe('Halle B');
    expect(v.widthM).toBe(30);
    expect(v.stages[0]).toMatchObject({ x: 1, y: 2, width: 8, height: 4 });
  });
});

describe('shellSeed — Rueckweg', () => {
  it('meldet Modell, Brennweite und gerechneten Bildwinkel zurueck', () => {
    const { cameras } = seedToCameras(
      seed({ cameras: [{ id: 'k1', name: 'CAM 1', model: 'Sony FX9', x: 4.2, y: 10.8, focalMm: 50 }] }),
      venue,
      vorauswahl,
    );
    const zurueck = camerasToSeedPatch(cameras).cameras[0];
    expect(zurueck.id).toBe('k1');
    expect(zurueck.name).toBe('CAM 1');
    expect(zurueck.model).toBe('Sony PXW-FX9');
    expect(zurueck.x).toBe(4.2);
    // Der Bildwinkel wird hier gerechnet — die Shell kennt die Sensorbreite
    // nicht und wuerde sonst den alten Wert weiterzeigen.
    expect(zurueck.hfovDeg).toBeGreaterThan(0);
    expect(zurueck.hfovDeg).toBeLessThan(180);
  });
});
