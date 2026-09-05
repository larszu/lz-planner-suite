// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): Anschluss des Projekt-Seeds an den Store.
// Die Abbildung selbst steht in `shellSeed.ts` (rein, headless testbar).
// ───────────────────────────────────────────────────────────────────────────
import { connectShellSeed } from '@avplan/ui/embed';
import { useStore } from '../store/useStore';
import { LENSES, pickInitialMountAndLens } from '../data/lenses';
import { camerasToSeedPatch, seedToCameras, seedToVenue } from './shellSeed';

/** Projekt-Fluss Shell -> MultiCam und zurueck. No-op im Standalone-Betrieb. */
export function initShellSeed(): () => void {
  let letzteMeldung = '';
  const conn = connectShellSeed({
    domain: 'cameras',
    apply: (seed) => {
      const s = useStore.getState();
      // Ein leerer Seed darf einen gefuellten Plan nicht loeschen.
      if (seed.cameras.length === 0 && s.cameras.length > 0) return false;

      const venue = seedToVenue(seed, s.venue);
      const { cameras, ausgelassen } = seedToCameras(seed, venue, (cam) => {
        const pick = pickInitialMountAndLens(cam.mount, cam.adaptedMounts, s.customLenses);
        return { mount: pick.mount, lens: pick.lens ?? LENSES[0] ?? null };
      });
      for (const a of ausgelassen) {
        console.warn(`[shellSeed] Kamera „${a.name}" nicht platziert — ${a.grund}`);
      }
      s.setVenue(venue);
      useStore.setState({ cameras });
      console.info(`[shellSeed] ${cameras.length}/${seed.cameras.length} Kameras uebernommen`);
      return true;
    },
    collect: () => camerasToSeedPatch(useStore.getState().cameras),
  });

  // Nur melden, wenn sich am gemeldeten Teil wirklich etwas geaendert hat —
  // der Store feuert auch fuer Auswahl, Zoom und Panel-Zustand.
  const unsubscribe = useStore.subscribe((state) => {
    const patch = JSON.stringify(camerasToSeedPatch(state.cameras));
    if (patch === letzteMeldung) return;
    letzteMeldung = patch;
    conn.publish();
  });

  return () => {
    unsubscribe();
    conn.dispose();
  };
}
