// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): der Projekt-Seed der Shell im Light-Planer.
//
// Dieselben Regeln wie in den beiden anderen Planern:
//
//   * AUFLOESEN STATT RATEN. Ein Seed-Scheinwerfer wird nur platziert, wenn
//     sein Modell GENAU EINEN Bibliotheks-Eintrag trifft. Ein falsch geratener
//     Typ bringt falschen Abstrahlwinkel, falsche Leistung und falsche
//     Beleuchtungsstaerke in die Berechnung — und sieht dabei richtig aus.
//
//   * WAS DER SEED SAGT, GILT: Position, Name, Dimmer, DMX-Kanal, Zweck.
//
//   * WAS ER NICHT SAGT, WIRD NICHT ERFUNDEN. Die Haenge-Hoehe kennt der Seed
//     nicht; sie kommt aus der Voreinstellung des Planers — derselben, die
//     beim Platzieren von Hand gilt. Das ist eine UI-Voreinstellung, keine
//     Aussage ueber die Rigging-Hoehe dieser Show.
// ───────────────────────────────────────────────────────────────────────────
import type { SeedFixture, SuiteSeed } from '@avplan/ui/embed';
import { fixtureLibrary } from './fixtureLibrary';
import type { Fixture, PlacedFixture } from '../types';

const normalisiere = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[×✕]/g, 'x')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const passt = (katalog: string, kandidat: string): boolean => {
  const k = normalisiere(katalog);
  return k === kandidat || k.endsWith(` ${kandidat}`) || k.endsWith(`-${kandidat}`);
};

/** Genau ein Treffer oder null; mehrdeutig zaehlt als kein Treffer. */
export function katalogFixture(
  seed: Pick<SeedFixture, 'model' | 'name'>,
  eigene: Fixture[] = [],
): Fixture | null {
  const alle = [...fixtureLibrary, ...eigene];
  const kandidaten = [seed.model, seed.name]
    .filter((s): s is string => !!s && s.trim().length > 0)
    .map(normalisiere);
  for (const kandidat of [...new Set(kandidaten)]) {
    const treffer = alle.filter(
      (f) => passt(`${f.manufacturer} ${f.name}`, kandidat) || passt(f.name, kandidat),
    );
    if (treffer.length === 1) return treffer[0];
  }
  return null;
}

export interface FixtureUebernahme {
  fixtures: PlacedFixture[];
  /** Was nicht platziert werden konnte — gehoert sichtbar gemacht. */
  ausgelassen: { id: string; name: string; grund: string }[];
}

/** Seed -> platzierte Scheinwerfer. Rein, damit sie headless testbar ist. */
export function seedToFixtures(
  seed: SuiteSeed,
  haengehoehe: number,
  eigene: Fixture[] = [],
): FixtureUebernahme {
  const fixtures: PlacedFixture[] = [];
  const ausgelassen: FixtureUebernahme['ausgelassen'] = [];

  for (const f of seed.fixtures) {
    const def = katalogFixture(f, eigene);
    if (!def) {
      ausgelassen.push({
        id: f.id,
        name: f.name,
        grund: `Modell „${f.model ?? f.name}" ist in der Bibliothek nicht eindeutig`,
      });
      continue;
    }
    const x = f.x ?? 0;
    const y = f.y ?? 0;
    fixtures.push({
      id: f.id,
      fixture: def,
      x,
      y,
      mountingHeight: haengehoehe,
      // Kein Ziel im Seed: die Lampe zeigt zunaechst auf ihre eigene Stelle
      // — dieselbe Voreinstellung wie beim Platzieren von Hand. Ein erfundenes
      // Ziel waere eine Ausrichtungs-Aussage, die niemand getroffen hat.
      aimX: x,
      aimY: y,
      bodyRotation: 0,
      dimming: f.dimmerPct ?? 100,
      ...(f.dmxChannel !== undefined ? { channel: f.dmxChannel } : {}),
      ...(f.universe !== undefined ? { universe: f.universe } : {}),
      ...(f.purpose ? { purpose: f.purpose } : {}),
      unitNumber: f.name,
    });
  }

  return { fixtures, ausgelassen };
}

/** Rueckweg: die platzierten Scheinwerfer als Seed-Domaene „fixtures". */
export function fixturesToSeedPatch(fixtures: PlacedFixture[]): { fixtures: SeedFixture[] } {
  return {
    fixtures: fixtures.map((p) => ({
      id: p.id,
      name: p.unitNumber || p.fixture.name,
      model: `${p.fixture.manufacturer} ${p.fixture.name}`.trim(),
      ...(p.purpose ? { purpose: p.purpose } : {}),
      dimmerPct: p.dimming,
      ...(p.channel !== undefined ? { dmxChannel: p.channel } : {}),
      ...(p.universe !== undefined ? { universe: p.universe } : {}),
      x: p.x,
      y: p.y,
    })),
  };
}
