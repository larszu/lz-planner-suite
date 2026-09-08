// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): E-11 — die Shell zeigt auf ein Objekt, und
// dieser Planer waehlt es aus. Oder sagt, dass er es nicht kennt.
//
// Wie bei `useShellSeed` ein Hook und keine Init-Funktion: die Scheinwerfer
// liegen hier in `useState` und nicht in einem externen Store. Der aktuelle
// Stand steht in einem Ref, damit die Bruecke genau einmal aufgebaut wird und
// trotzdem nie auf einen veralteten Stand antwortet.
//
// DER ID-RAUM IST DER DES SEED-PROTOKOLLS: `seedToFixtures` uebernimmt die
// Seed-Id unveraendert als Id des platzierten Scheinwerfers. Kein zweiter
// Id-Raum, kein Namensabgleich als Rueckfallebene (ADR-001, ADR-002).
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { connectShellReveal } from '@avplan/ui/embed';
import type { PlacedFixture } from '../types';

export interface ShellRevealArgs {
  fixtures: PlacedFixture[];
  setSelectedIds: (ids: Set<string>) => void;
}

export function useShellReveal(args: ShellRevealArgs): void {
  const ref = useRef(args);
  ref.current = args;

  useEffect(() => {
    return connectShellReveal((id) => {
      const a = ref.current;
      if (a.fixtures.some((f) => f.id === id)) {
        a.setSelectedIds(new Set([id]));
        return { found: true };
      }
      return { found: false, grund: 'Dieser Scheinwerfer steht nicht im Lichtplan.' };
    });
  }, []);
}
