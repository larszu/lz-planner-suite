// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): Anschluss des Projekt-Seeds an den Zustand
// von `App.tsx`.
//
// Anders als in den beiden anderen Planern gibt es hier keinen externen Store —
// die Scheinwerfer liegen in `useState`. Der Anschluss ist deshalb ein Hook.
// Er haelt die aktuellen Werte in einem Ref, damit die Bruecke genau einmal
// aufgebaut wird und trotzdem nie auf einen veralteten Stand antwortet.
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { connectShellSeed } from '@avplan/ui/embed';
import { fixturesToSeedPatch, mitSeedBuehne, seedToFixtures, seedToVenue } from './shellSeed';
import type { Fixture, PlacedFixture, Shape } from '../types';

export interface ShellSeedArgs {
  fixtures: PlacedFixture[];
  setFixtures: (f: PlacedFixture[]) => void;
  /** Voreingestellte Haengehoehe des Planers (keine Seed-Angabe). */
  haengehoehe: number;
  eigene: Fixture[];
  /** Zeichnungen — hier landet die Buehne aus dem Seed (B-39 Punkt 1). */
  shapes: Shape[];
  setShapes: (s: Shape[]) => void;
  /**
   * ADR-005 — die Raum-Masse, die light nicht modelliert, aber mitfuehrt.
   * Derselbe Speicher, den auch der Datei-Import fuellt: ein zweiter waere die
   * zweite Wahrheit, und beim Speichern gaebe es zwei Kandidaten fuer ein Feld.
   */
  setVenueForeign: (v: { widthM?: number; heightM?: number; name?: string }) => void;
}

export function useShellSeed(args: ShellSeedArgs): void {
  const ref = useRef(args);
  ref.current = args;
  const conn = useRef<{ publish: () => void; dispose: () => void } | null>(null);

  useEffect(() => {
    conn.current = connectShellSeed({
      domain: 'fixtures',
      apply: (seed) => {
        const a = ref.current;

        // DER RAUM ZUERST, UND ZWAR VOR DER SPERRE DARUNTER.
        //
        // Die Sperre lehnt einen Seed OHNE Scheinwerfer ab, damit er einen
        // gefuellten Plan nicht leert. Das ist richtig — aber es ist eine
        // Aussage ueber Scheinwerfer, und den Raum mitzunehmen hiesse, ihn aus
        // einem Grund wegzuwerfen, der nichts mit ihm zu tun hat. Einen Raum
        // zu uebernehmen kann ausserdem nie etwas loeschen: `venueForeign`
        // wird ersetzt, und `mitSeedBuehne` fasst nur die eine Zeichnung an,
        // die dem Seed gehoert.
        const { venueForeign, buehne } = seedToVenue(seed);
        a.setVenueForeign(venueForeign);
        a.setShapes(mitSeedBuehne(a.shapes, buehne));

        // Ein leerer Seed darf einen gefuellten Plan nicht loeschen.
        if (seed.fixtures.length === 0 && a.fixtures.length > 0) return false;
        const { fixtures, ausgelassen } = seedToFixtures(seed, a.haengehoehe, a.eigene, a.fixtures);
        for (const x of ausgelassen) {
          console.warn(`[shellSeed] Scheinwerfer „${x.name}" nicht platziert — ${x.grund}`);
        }
        a.setFixtures(fixtures);
        console.info(`[shellSeed] ${fixtures.length}/${seed.fixtures.length} Scheinwerfer übernommen`);
        return true;
      },
      collect: () => fixturesToSeedPatch(ref.current.fixtures),
    });
    return () => {
      conn.current?.dispose();
      conn.current = null;
    };
  }, []);

  // Jede Aenderung an den Scheinwerfern zurueckmelden. `publish` ist ein No-op,
  // solange die Shell noch keinen Seed geschickt hat.
  useEffect(() => {
    conn.current?.publish();
  }, [args.fixtures]);
}
