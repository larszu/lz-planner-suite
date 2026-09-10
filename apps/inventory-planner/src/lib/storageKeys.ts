// ───────────────────────────────────────────────────────────────────────────
// Die localStorage-Schlüssel dieser App — an einer Stelle.
//
// Übernommen aus dem Cable-Planner (`lib/storageKeys.ts`), mit einem
// Unterschied, der ausdrücklich gewollt ist: das Präfix lautet
// `inventory-planner:` und nicht `cable-planner:`.
//
// WARUM DAS KEIN DATENVERLUST IST. Diese App läuft unter einer eigenen
// Herkunft; der localStorage des Cable-Planners ist für sie ohnehin
// unerreichbar, gleicher Schlüssel oder nicht. Das Präfix mitzuschleppen
// würde also nichts retten und dafür behaupten, hier läge dieselbe Ablage.
//
// Der Weg für vorhandene Bestände ist der, den ADR-006 vorsieht: die
// portable Datei (`avplan-inventory`, `domain/lib/inventoryPortable.ts`).
// Sie ist zwischen den Apps byte-gleich eingefroren und genau dafür da.
// ───────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  /** Der Bestand: Artikel, Lagerbaum, Sets, serialisierte Einheiten. */
  inventory: 'inventory-planner:inventory',
  /** Ausgabe-/Rückgabe-Belege. Eigener Schlüssel — Betriebszustand EINES
   *  Lagers, und nicht Teil des Katalogs, der zwischen den Apps wandert. */
  checkouts: 'inventory-planner:checkouts',
  /** Umlagerungen im Lagerbaum. */
  storageMoves: 'inventory-planner:storageMoves',
  /**
   * Die selbst angelegten Fristarten des Hauses (Format-Version 7).
   *
   * Eigener Schlüssel, weil sie Stammdaten sind und kein Bestand: wer alle
   * Artikel löscht, hat immer noch dieselben Prüfarten. Im Bestands-Blob
   * hätte jedes Schreiben sie mit angefasst — für ein Feld, das mit dem
   * Bestand nichts zu tun hat.
   */
  fristArten: 'inventory-planner:fristArten',
} as const
