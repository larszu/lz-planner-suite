// ───────────────────────────────────────────────────────────────────────────
// SUITE-OVERLAY (nicht upstream): E-11 — die Shell zeigt auf ein Objekt, und
// dieser Planer waehlt es aus. Oder sagt, dass er es nicht kennt.
//
// DER ID-RAUM IST DER DES SEED-PROTOKOLLS. `seedToCameras` (in `shellSeed.ts`)
// uebernimmt die Seed-Id unveraendert als Kamera-Id; eine zweite Zuordnung
// waere die zweite Wahrheit, gegen die ADR-001 geschrieben ist.
//
// KEIN NAMENSABGLEICH als Rueckfallebene. Wer die Id nicht findet, sagt es —
// eine Kamera mit aehnlichem Namen auszuwaehlen waere ein geratener Treffer
// (ADR-002), und der Nutzer saehe nicht, dass geraten wurde.
// ───────────────────────────────────────────────────────────────────────────
import { connectShellReveal } from '@avplan/ui/embed';
import { useStore } from '../store/useStore';

export function initShellReveal(): () => void {
  return connectShellReveal((id) => {
    const s = useStore.getState();
    if (s.cameras.some((c) => c.id === id)) {
      s.selectCamera(id);
      return { found: true };
    }
    return { found: false, grund: 'Diese Kamera steht nicht im Kameraplan.' };
  });
}
