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
//   * WAS ER NICHT SAGT, WIRD NICHT ERFUNDEN — UND NICHT UEBERSCHRIEBEN.
//     Das ist seit dem Bau dieser Bruecke die Regel; die zweite Haelfte fehlte
//     ihr aber, und sie kostete Arbeit:
//
//     Ein Seed kommt bei JEDER neuen Revision erneut an (Projektwechsel,
//     Undo/Redo, Kopf-Aenderung in der Shell — `connectShellSeed` wendet jede
//     hoehere Revision an). `seedToFixtures` baute dabei jeden Scheinwerfer
//     NEU, mit `mountingHeight` aus der Voreinstellung und `aimX/aimY` auf der
//     eigenen Stelle. Wer zwanzig Lampen auf die Buehne ausgerichtet und auf
//     8 m gehaengt hatte, verlor beides, sobald jemand in der Shell den
//     Projektnamen aenderte. Still, ohne Meldung, ohne Undo in dieser App.
//
//     Jetzt gilt: der Seed setzt, was er NENNT. Was er nicht nennt, behaelt
//     ein bereits platzierter Scheinwerfer (`vorhandene`). Nur ein WIRKLICH
//     neuer bekommt die Voreinstellung des Planers — und dort ist sie das,
//     was sie ist: der Anfangswert einer Platzierung, keine Aussage ueber die
//     Rigging-Hoehe dieser Show.
//
//     Die Hoehe selbst steht seither im Protokoll (`SeedFixture.rigHeightM`),
//     damit sie ueberhaupt gesagt werden KANN: sie entscheidet ueber die
//     Kabellaenge zum Scheinwerfer, und die Stueckliste zieht sie aus
//     demselben Projekt.
// ───────────────────────────────────────────────────────────────────────────
import type { SeedFixture, SuiteSeed } from '@avplan/ui/embed';
import { fixtureLibrary } from './fixtureLibrary';
import type { Fixture, PlacedFixture, Shape } from '../types';

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

/**
 * Seed -> platzierte Scheinwerfer. Rein, damit sie headless testbar ist.
 *
 * `vorhandene` sind die Scheinwerfer, die im Planer schon stehen. Sie sind
 * kein Zierrat: aus ihnen kommt alles, was der Seed nicht nennt (Hoehe,
 * Ausrichtung, Koerperdrehung). Ohne sie ist jeder erneute Seed ein
 * Zuruecksetzen — siehe Kopf.
 */
export function seedToFixtures(
  seed: SuiteSeed,
  haengehoehe: number,
  eigene: Fixture[] = [],
  vorhandene: PlacedFixture[] = [],
): FixtureUebernahme {
  const fixtures: PlacedFixture[] = [];
  const ausgelassen: FixtureUebernahme['ausgelassen'] = [];
  const schonDa = new Map(vorhandene.map((p) => [p.id, p]));

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
    const alt = schonDa.get(f.id);
    const x = f.x ?? alt?.x ?? 0;
    const y = f.y ?? alt?.y ?? 0;
    // Verschiebt der Seed die Lampe, wandert ein Ziel, das AUF IHR LAG, mit.
    // Sonst zeigte eine Lampe, die nie ausgerichtet wurde, nach dem
    // Verschieben auf ihre alte Stelle — und das saehe aus wie eine Absicht.
    const zieltAufSichSelbst = alt !== undefined && alt.aimX === alt.x && alt.aimY === alt.y;
    fixtures.push({
      id: f.id,
      fixture: def,
      x,
      y,
      // Der Seed nennt die Hoehe, sonst behaelt ein schon platzierter
      // Scheinwerfer seine. Die Voreinstellung gilt nur fuer einen wirklich
      // neuen — dort ist sie der Anfangswert einer Platzierung.
      mountingHeight: f.rigHeightM ?? alt?.mountingHeight ?? haengehoehe,
      // Kein Ziel im Seed: eine bereits ausgerichtete Lampe behaelt ihres,
      // eine neue zeigt auf ihre eigene Stelle — dieselbe Voreinstellung wie
      // beim Platzieren von Hand. Ein erfundenes Ziel waere eine
      // Ausrichtungs-Aussage, die niemand getroffen hat.
      aimX: alt && !zieltAufSichSelbst ? alt.aimX : x,
      aimY: alt && !zieltAufSichSelbst ? alt.aimY : y,
      bodyRotation: alt?.bodyRotation ?? 0,
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
      // Die Haenge-Hoehe geht mit zurueck: sie ist hier gesetzt worden, und
      // ohne sie faende die Stueckliste die Kabel zum Scheinwerfer zu kurz.
      rigHeightM: p.mountingHeight,
      ...(p.channel !== undefined ? { dmxChannel: p.channel } : {}),
      ...(p.universe !== undefined ? { universe: p.universe } : {}),
      x: p.x,
      y: p.y,
    })),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// DER RAUM AUS DEM SEED (B-39 Punkt 1, die Licht-Seite).
//
// Der Backlog fuehrt diese Haelfte seit `suite#169` als benannten Rest: der
// Light-Planer las den Raum aus dem Seed GAR NICHT. Wer in der Suite auf
// „Licht" wechselte, sah seine Scheinwerfer an den richtigen Koordinaten in
// einer leeren Flaeche stehen — ohne Buehne, ohne Raumgrenze, ohne einen
// Anhaltspunkt, wo das alles eigentlich steht.
//
// ═══════════════════════════════════════════════════════════════════════════
// WARUM DARAUS KEINE WAENDE WERDEN
// ═══════════════════════════════════════════════════════════════════════════
//
// Es waere leicht: `widthM` × `heightM` sind ein Rechteck, vier Waende sind
// vier Linien. Und es waere falsch. Lights `Wall` traegt `height`,
// `reflectance` und `material` — und die drei gehen IN DIE LICHTRECHNUNG ein
// (`lightCalc`), sie bouncen Licht zurueck in den Raum. Vier erfundene Waende
// aenderten jede Beleuchtungsstaerke im Plan, und zwar nach oben: der Raum
// wuerde heller gerechnet, als er ist, weil jemand Reflexionsgrade
// hineingeschrieben hat, die niemand gemessen hat.
//
// Das ist genau die Defektform, gegen die dieses Repo an sechs Stellen steht:
// eine Vermutung, die als Messung gelesen wird — nur hier mit einer Zahl am
// Ende, die aussieht wie ein Ergebnis.
//
// ═══════════════════════════════════════════════════════════════════════════
// WAS STATTDESSEN PASSIERT
// ═══════════════════════════════════════════════════════════════════════════
//
//   * `widthM` / `heightM` / `name` gehen in `venueForeign`. Das Feld gibt es
//     schon (ADR-005): light MODELLIERT keine Raumgroesse, fuehrt sie aber
//     unveraendert mit, damit ein Round-Trip einen 30 × 18 m grossen Raum
//     nicht auf MultiCams Standard 20 × 12 schrumpft.
//
//   * Die Buehne wird eine ZEICHNUNG (`Shape`, `rect`) und kein `StageElement`.
//     Ein Podest hat eine Hoehe; der Seed nennt keine. `height: 0` waere die
//     Behauptung „nicht erhoeht", ein geratener Wert waere schlimmer. Eine
//     Zeichnung hat keine physikalischen Eigenschaften: sie zeigt, WO die
//     Buehne liegt, ohne zu behaupten, WIE sie gebaut ist — und sie geht in
//     keine Rechnung ein.
// ───────────────────────────────────────────────────────────────────────────

/**
 * Die Kennung der Buehnen-Zeichnung aus dem Seed.
 *
 * Fest und nicht erzeugt: der Seed kommt bei jeder Aenderung in der Shell
 * erneut, und eine neue Id je Mal legte bei der dritten Aenderung drei
 * Rechtecke uebereinander.
 */
export const SEED_BUEHNE_ID = 'seed-venue-stage';

/**
 * Die Farbe der Buehnen-Zeichnung.
 *
 * Ein Grauton und kein Akzent: die Zeichnung ist eine Ortsangabe und keine
 * Aussage. Wer sie bunt macht, laesst sie wie ein geplantes Objekt aussehen.
 */
const BUEHNEN_FARBE = '#94a3b8';

export interface VenueUebernahme {
  /** ADR-005 — Masse, die light nicht modelliert, unveraendert mitgefuehrt. */
  venueForeign: { widthM?: number; heightM?: number; name?: string };
  /** Die Buehne als reine Zeichnung, oder `null`, wenn der Seed keine nennt. */
  buehne: Shape | null;
}

/**
 * Seed -> Raum. Rein, damit sie headless pruefbar ist.
 *
 * Fehlende Angaben werden WEGGELASSEN und nicht auf 0 gesetzt: ein Raum ohne
 * genannte Breite ist etwas anderes als ein 0 m breiter Raum, und der
 * Unterschied entscheidet drueben, ob MultiCam seinen Standard einsetzt.
 */
export function seedToVenue(seed: SuiteSeed): VenueUebernahme {
  const v = seed.venue;
  const buehne: Shape | null =
    v.stage && v.stage.w > 0 && v.stage.h > 0
      ? {
          id: SEED_BUEHNE_ID,
          type: 'rect',
          points: [
            { x: v.stage.x, y: v.stage.y },
            { x: v.stage.x + v.stage.w, y: v.stage.y + v.stage.h },
          ],
          label: v.name ? `Bühne — ${v.name}` : 'Bühne',
          color: BUEHNEN_FARBE,
        }
      : null;
  return {
    venueForeign: {
      ...(typeof v.widthM === 'number' ? { widthM: v.widthM } : {}),
      ...(typeof v.heightM === 'number' ? { heightM: v.heightM } : {}),
      ...(v.name ? { name: v.name } : {}),
    },
    buehne,
  };
}

/**
 * Die Buehnen-Zeichnung in eine bestehende Zeichnungsliste einsetzen.
 *
 * ERSETZT statt anzuhaengen — und laesst alles andere in Ruhe. Beide Haelften
 * sind noetig: ohne die erste stapeln sich die Rechtecke bei jeder
 * Seed-Aenderung, ohne die zweite loescht ein Raum-Update die Massketten und
 * Markierungen, die jemand von Hand gezogen hat.
 *
 * Nennt der Seed keine Buehne mehr, verschwindet auch die Zeichnung: sie
 * gehoert dem Seed, und eine stehengebliebene zeigte eine Buehne, die es im
 * Plan nicht mehr gibt.
 */
export function mitSeedBuehne(shapes: Shape[], buehne: Shape | null): Shape[] {
  const eigene = shapes.filter((s) => s.id !== SEED_BUEHNE_ID);
  return buehne ? [...eigene, buehne] : eigene;
}
