// ───────────────────────────────────────────────────────────────────────────
// Die localStorage-Schlüssel dieser App — an einer Stelle.
//
// Eigenes Präfix, wie im `inventory-planner` und aus demselben Grund: diese App
// läuft unter eigener Herkunft, der Speicher der anderen Werkzeuge ist für sie
// ohnehin unerreichbar. Ein geerbtes `cable-planner:` behauptete dieselbe
// Ablage und rettete nichts.
// ───────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  /** Das Gebäude: Räume, Anschlusspunkte, Kreise, Verteilungen, Klinken, Mängel. */
  gebaeude: 'facility-planner:gebaeude',
} as const
