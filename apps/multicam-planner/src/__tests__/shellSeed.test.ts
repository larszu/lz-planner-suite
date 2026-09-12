import { describe, expect, it } from 'vitest';
import { emptySeed, type SuiteSeed } from '@avplan/ui/embed';
import { camerasToSeedPatch, katalogKamera, seedToCameras, seedToVenue, venueToSeedPatch } from '../utils/shellSeed';
import { CAMERAS } from '../data/cameras';
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

  // ─────────────────────────────────────────────────────────────────────────
  // Der Waechter gegen die Scherbe. Die Aufloesung probiert ein Modell
  // zusaetzlich ohne sein erstes Wort („sony fx9" -> „fx9"), weil der Katalog
  // Praefixe fuehrt. Auf den NAMEN angewandt erzeugte dieselbe Regel aus
  // „CAM 4" den Kandidaten „4" — und der traf am 2026-09-12 genau ein Modell,
  // seit der Katalog die „DJI Osmo Action 4" fuehrt. Ergebnis: eine Action-Cam
  // mit 1"-Sensor an der Position der Sony FR7 PTZ, mit falschen Bildwinkeln,
  // die voellig richtig aussehen.
  //
  // Die beiden Faelle unten pruefen die Regel, nicht den Tagesstand des
  // Katalogs: sie leiten ihre Eingaben aus CAMERAS ab und sagen vorher, ob
  // dort ueberhaupt etwas zu treffen waere.
  // NICHT gemessen: Kandidaten, die keine reine Zahl sind, aber trotzdem zu
  // allgemein („pro", „mini"). Die treffen heute mehrfach und fallen damit
  // schon durch die Eindeutigkeitsregel — geprueft ist das hier nicht.
  // ─────────────────────────────────────────────────────────────────────────
  const endziffern = [
    ...new Set(
      CAMERAS.map((c) => `${c.manufacturer} ${c.model}`.match(/ (\d+)$/)?.[1]).filter(
        (z): z is string => !!z,
      ),
    ),
  ];

  it('hat ueberhaupt Modelle, deren Bezeichnung auf eine blosse Zahl endet', () => {
    // Ohne die waeren die beiden folgenden Faelle gruen, ohne etwas zu messen.
    expect(endziffern.length).toBeGreaterThan(0);
  });

  it('macht aus dem Namen keine Modellbezeichnung — „CAM 4" ist nicht „4"', () => {
    for (const ziffer of endziffern) {
      expect(katalogKamera({ model: 'Hersteller Ohne Katalogeintrag', name: `CAM ${ziffer}` })).toBeNull();
    }
  });

  it('loest eine blosse Zahl nie auf, auch wenn sie genau ein Modell traefe', () => {
    for (const ziffer of endziffern) {
      expect(katalogKamera({ model: ziffer, name: ziffer })).toBeNull();
    }
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

describe('Der Raum geht auch zurueck (E-21, B-39.1)', () => {
  const raum = (over: Partial<Venue> = {}): Venue => {
    const basis: Venue = {
      name: 'Halle A',
      widthM: 24,
      heightM: 14,
      stages: [{ id: 'stage-0', x: 8, y: 3, width: 8, height: 3.2, label: 'Stage' }],
    };
    return { ...basis, ...over };
  };

  it('meldet Masse und Buehne', () => {
    const { venue } = venueToSeedPatch(raum());
    expect(venue.widthM).toBe(24);
    expect(venue.heightM).toBe(14);
    expect(venue.stage).toEqual({ x: 8, y: 3, w: 8, h: 3.2 });
  });

  it('meldet den Namen unveraendert', () => {
    // `venue.name` gehoert der Shell. Ihn unveraendert mitzuschicken ist
    // wahrheitsgemaess und erzeugt keinen Befund; ihn zu AENDERN waere ein
    // Vorschlag zu einem fremden Feld — und genau das soll dieser Planer nicht
    // bei jedem Umbenennen ungefragt tun.
    expect(venueToSeedPatch(raum({ name: 'Halle B' })).venue.name).toBe('Halle B');
  });

  it('meldet nur die erste Buehne', () => {
    // Der Seed kennt genau ein Rechteck. Eine zweite Buehne stillschweigend
    // zur ersten zu machen waere eine Falschaussage ueber den Raum.
    const zwei = raum({
      stages: [
        { id: 's0', x: 1, y: 1, width: 2, height: 2, label: 'A' },
        { id: 's1', x: 9, y: 9, width: 4, height: 4, label: 'B' },
      ],
    });
    expect(venueToSeedPatch(zwei).venue.stage).toEqual({ x: 1, y: 1, w: 2, h: 2 });
  });

  it('laesst die Buehne weg, wenn es keine gibt', () => {
    expect(venueToSeedPatch(raum({ stages: [] })).venue.stage).toBeUndefined();
  });

  it('ist die Umkehrung von seedToVenue', () => {
    // Hin und zurueck darf den Raum nicht veraendern — sonst meldete jeder
    // uebernommene Seed sofort einen Widerspruch gegen sich selbst.
    const vorher = raum();
    const s = seed({ venue: { name: 'Halle A', widthM: 30, heightM: 18, stage: { x: 2, y: 2, w: 6, h: 4 } } });
    const nachher = seedToVenue(s, vorher);
    expect(venueToSeedPatch(nachher).venue).toEqual(s.venue);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// DER SEED SETZT NICHT ZURUECK, WAS ER NICHT SAGT.
//
// Gemessen 2026-09-09 am gebauten Stand: `connectShellSeed` wendet jede
// hoehere Revision an, und die Shell zaehlt sie bei Projektwechsel, Undo/Redo
// und Kopf-Aenderung hoch. `seedToCameras` baute daraufhin jede Kamera NEU —
// `pan: -90`, `tilt: 0`, `z: 1.5`, Blende, Fokusdistanz, Stativ, Extender,
// Sensor-Modus und Farbe aus der Vorgabe.
//
// Der Seed sagt von alldem nichts. Wer seine Kameras ausgerichtet, auf ein
// Podest gestellt und scharfgestellt hatte, verlor das, sobald jemand in der
// Shell den Projektnamen aenderte — in einem Planer, dessen ganzer Zweck die
// Bildwirkung genau dieser Einstellungen ist.
// ───────────────────────────────────────────────────────────────────────────

describe('shellSeed — ein erneuter Seed nimmt nichts weg', () => {
  const eine = (over: Partial<Parameters<typeof seedToCameras>[0]['cameras'][number]> = {}) =>
    seed({ cameras: [{ id: 'k1', name: 'CAM 1', model: 'Sony FX9', ...over }] });

  const platziert = () =>
    seedToCameras(eine({ x: 4, y: 10, focalMm: 50 }), venue, vorauswahl).cameras[0];

  it('behaelt Schwenk, Neigung und Hoehe', () => {
    const vorher = [{ ...platziert(), pan: 15, tilt: -8, z: 2.4 }];
    const { cameras } = seedToCameras(eine({ x: 4, y: 10 }), venue, vorauswahl, undefined, vorher);
    expect(cameras[0].pan).toBe(15);
    expect(cameras[0].tilt).toBe(-8);
    expect(cameras[0].z).toBe(2.4);
  });

  it('behaelt Blende, Fokus und Stativart', () => {
    const vorher = [{ ...platziert(), aperture: 5.6, focusDistance: 12, mountType: 'dolly' as const }];
    const { cameras } = seedToCameras(eine({ x: 4, y: 10 }), venue, vorauswahl, undefined, vorher);
    expect(cameras[0].aperture).toBe(5.6);
    expect(cameras[0].focusDistance).toBe(12);
    expect(cameras[0].mountType).toBe('dolly');
  });

  it('behaelt die Farbe — sie ist die Zuordnung auf dem Plan', () => {
    const vorher = [{ ...platziert(), color: '#ff00ff' }];
    const { cameras } = seedToCameras(eine({ x: 4, y: 10 }), venue, vorauswahl, undefined, vorher);
    expect(cameras[0].color).toBe('#ff00ff');
  });

  it('behaelt die Brennweite, wenn der Seed keine nennt', () => {
    const vorher = [{ ...platziert(), focalLength: 85 }];
    const { cameras } = seedToCameras(eine({ x: 4, y: 10 }), venue, vorauswahl, undefined, vorher);
    expect(cameras[0].focalLength).toBe(85);
  });
});

describe('shellSeed — was der Seed SAGT, gilt trotzdem', () => {
  const platziert = () =>
    seedToCameras(
      seed({ cameras: [{ id: 'k1', name: 'CAM 1', model: 'Sony FX9', x: 4, y: 10, focalMm: 50 }] }),
      venue,
      vorauswahl,
    ).cameras[0];

  it('eine genannte Position schlaegt die vorhandene', () => {
    const vorher = [{ ...platziert(), x: 1, y: 1 }];
    const { cameras } = seedToCameras(
      seed({ cameras: [{ id: 'k1', name: 'CAM 1', model: 'Sony FX9', x: 9, y: 4 }] }),
      venue,
      vorauswahl,
      undefined,
      vorher,
    );
    expect(cameras[0].x).toBe(9);
    expect(cameras[0].y).toBe(4);
  });

  it('eine genannte Brennweite schlaegt die vorhandene', () => {
    const vorher = [{ ...platziert(), focalLength: 85 }];
    const { cameras } = seedToCameras(
      seed({ cameras: [{ id: 'k1', name: 'CAM 1', model: 'Sony FX9', focalMm: 35 }] }),
      venue,
      vorauswahl,
      undefined,
      vorher,
    );
    expect(cameras[0].focalLength).toBe(35);
  });

  it('eine wirklich neue Kamera bekommt die Vorgaben', () => {
    const { cameras } = seedToCameras(
      seed({ cameras: [{ id: 'neu', name: 'CAM 9', model: 'Sony FX9', x: 2, y: 2 }] }),
      venue,
      vorauswahl,
      undefined,
      [{ ...platziert(), id: 'andere' }],
    );
    expect(cameras[0].pan).toBe(-90);
    expect(cameras[0].tilt).toBe(0);
    expect(cameras[0].z).toBe(1.5);
  });
});

describe('shellSeed — der Raum: eine Buehne im Seed, eine Liste im Planer', () => {
  const mehrere: Venue = {
    ...venue,
    stages: [
      { id: 's0', x: 8, y: 3, width: 6, height: 3, label: 'Hauptbühne' },
      { id: 's1', x: 1, y: 10, width: 3, height: 2, label: 'Seitenbühne' },
      { id: 's2', x: 12, y: 10, width: 8, height: 1, label: 'Steg' },
    ],
  }

  it('setzt die ERSTE Buehne und laesst die uebrigen stehen', () => {
    // Der Seed nennt genau eine Buehne, dieser Planer kennt eine Liste, und
    // der Rueckweg meldet nur `stages[0]`. Die ganze Liste zu ersetzen loescht
    // Buehnen, von denen die Shell nie erfahren hat — etwas nicht zu KENNEN
    // ist kein Grund, es zu loeschen.
    const s = seed({ venue: { name: 'Halle A', stage: { x: 2, y: 2, w: 10, h: 5 } } })
    const nachher = seedToVenue(s, mehrere)
    expect(nachher.stages).toHaveLength(3)
    expect(nachher.stages[0]).toMatchObject({ x: 2, y: 2, width: 10, height: 5 })
    expect(nachher.stages[1].label).toBe('Seitenbühne')
    expect(nachher.stages[2].label).toBe('Steg')
  })

  it('behaelt Beschriftung und Kennung der ersten Buehne', () => {
    // Der Seed sagt, WO sie liegt und WIE GROSS sie ist — nicht, wie sie
    // heisst. Eine neue Id braeche ausserdem jede Referenz auf sie.
    const s = seed({ venue: { name: 'Halle A', stage: { x: 2, y: 2, w: 10, h: 5 } } })
    const nachher = seedToVenue(s, mehrere)
    expect(nachher.stages[0].id).toBe('s0')
    expect(nachher.stages[0].label).toBe('Hauptbühne')
  })

  it('nennt der Seed keine Buehne, bleibt die Liste unangetastet', () => {
    const nachher = seedToVenue(seed({ venue: { name: 'Halle A' } }), mehrere)
    expect(nachher.stages).toEqual(mehrere.stages)
  })

  it('behaelt Masse, die der Seed nicht nennt', () => {
    const nachher = seedToVenue(seed({ venue: { name: 'Halle A' } }), mehrere)
    expect(nachher.widthM).toBe(mehrere.widthM)
    expect(nachher.heightM).toBe(mehrere.heightM)
  })
})
