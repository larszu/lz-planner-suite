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
import { fixturesToSeedPatch, seedToFixtures } from './shellSeed';
import type { Fixture, PlacedFixture } from '../types';

export interface ShellSeedArgs {
  fixtures: PlacedFixture[];
  setFixtures: (f: PlacedFixture[]) => void;
  /** Voreingestellte Haengehoehe des Planers (keine Seed-Angabe). */
  haengehoehe: number;
  eigene: Fixture[];
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
        // Ein leerer Seed darf einen gefuellten Plan nicht loeschen.
        if (seed.fixtures.length === 0 && a.fixtures.length > 0) return false;
        const { fixtures, ausgelassen } = seedToFixtures(seed, a.haengehoehe, a.eigene);
        for (const x of ausgelassen) {
          console.warn(`[shellSeed] Scheinwerfer „${x.name}" nicht platziert — ${x.grund}`);
        }
        a.setFixtures(fixtures);
        console.info(`[shellSeed] ${fixtures.length}/${seed.fixtures.length} Scheinwerfer uebernommen`);
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
