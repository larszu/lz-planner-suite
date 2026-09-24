import { describe, expect, it } from 'vitest';
import { fixtureLibrary } from '../src/core/fixtureLibrary';
import { GERAETETYP_IDS, geraetetypIdVon } from '../src/core/geraetetypIds';
import { fixtureToEquipment } from '../src/integration/equipment';
import type { PlacedFixture } from '../src/core';

// ---------------------------------------------------------------------------
// Die stabile Geraetetyp-Id je Katalog-Leuchte (2026-09-24).
//
// ─── DER BEFUND, AUS DEM SIE KOMMT ─────────────────────────────────────────
//
// `core/shopOrder.ts`, woertlich:
//
//   > Ob der Source Four im Plan DERSELBE Artikel ist wie der im Lager, ist
//   > eine Behauptung — und zwar eine, die dieses Modell nicht beweisen kann:
//   > eine `Fixture` traegt keine geraetetyp-weite Kennung. Es bleibt der
//   > Vergleich von Hersteller und Modellname, und der ist ein VERGLEICH VON
//   > ZEICHENKETTEN.
//
// Genau die Kennung fehlte. Die Tabelle wird im cable-planner gerechnet
// (`npm run katalog:uebernahme`) — dieselbe Rechnung, die dort die
// Katalog-GUIDs schreibt. Damit koennen die beiden nicht auseinanderlaufen,
// solange niemand von Hand in die erzeugte Datei schreibt.
// ---------------------------------------------------------------------------

describe('die Tabelle deckt die Bibliothek ab', () => {
  it('kennt jede Leuchte', () => {
    const fehlend = fixtureLibrary.filter((f) => !geraetetypIdVon('fixture', f.id)).map((f) => f.id);
    expect(fehlend).toEqual([]);
  });

  it('hat keine Id doppelt — sonst zeigten zwei Leuchten auf dasselbe Datenblatt', () => {
    const alle = Object.values(GERAETETYP_IDS.fixture);
    expect(alle.length).toBe(new Set(alle).size);
  });

  it('erfindet fuer eine unbekannte Quell-Id nichts', () => {
    expect(geraetetypIdVon('fixture', 'gibt-es-nicht')).toBeUndefined();
    expect(geraetetypIdVon('fixture', undefined)).toBeUndefined();
  });

  it('haelt einen Goldwert fest — ein neuer Namensraum faellt hier auf', () => {
    // UUIDv5, Namensraum a7f3c1e2-5b84-5d16-9c3a-7e2f4b8d0a61, Name
    // `avplan:fixture:<id>`. Jede gespeicherte Verknuepfung haengt daran.
    expect(geraetetypIdVon('fixture', 'etc-s4-19')).toBe('117a0db0-bf94-5669-a8db-f98eec23542b');
  });
});

describe('der Beleg reist mit', () => {
  it('die Haelfte der Bibliothek traegt eine Hersteller-Adresse — und es ist gezaehlt', () => {
    // Vor dem 2026-09-24 war es KEINE. Die Zahl steht hier, damit sie nicht
    // lautlos wieder sinkt; steigt sie, faellt diese Zeile und wird nachgezogen.
    const mit = fixtureLibrary.filter((f) => f.manufacturerUrl).length;
    expect(mit).toBe(50);
    expect(fixtureLibrary.length).toBe(84);
  });

  it('die sieben generischen Bauformen tragen bewusst keine', () => {
    // Ein 1-kW-Stufenlinsenscheinwerfer ohne Hersteller hat kein Datenblatt.
    // Ihm eines anzudichten waere schlimmer als die Luecke.
    const generisch = fixtureLibrary.filter((f) => f.manufacturer === 'Generic');
    expect(generisch.length).toBe(7);
    expect(generisch.filter((f) => f.manufacturerUrl)).toEqual([]);
  });
});

describe('der Export an den Kabel-Planer gibt die Identitaet mit', () => {
  const platziert = (fixtureId: string): PlacedFixture => {
    const fixture = fixtureLibrary.find((f) => f.id === fixtureId)!;
    return { id: `p-${fixtureId}`, fixture, x: 1, y: 2, dimming: 100 } as unknown as PlacedFixture;
  };

  it('traegt die deviceTypeId am uebergebenen Geraet', () => {
    const e = fixtureToEquipment(platziert('etc-s4-19'));
    expect(e.deviceTypeId).toBe(geraetetypIdVon('fixture', 'etc-s4-19'));
  });

  it('laesst sie weg, wenn die Leuchte in keinem Katalog steht', () => {
    const eigenbau = {
      id: 'p-eigen',
      fixture: { ...fixtureLibrary[0], id: 'eigenbau-1', isCustom: true },
      x: 0, y: 0, dimming: 100,
    } as unknown as PlacedFixture;
    expect(fixtureToEquipment(eigenbau).deviceTypeId).toBeUndefined();
  });
});
