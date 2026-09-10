// ───────────────────────────────────────────────────────────────────────────
// Der Massstab zwischen Bild und Gebäude (Issue #1).
//
// Zwei Zeilen Rechnung, die aus einem guten Grund NICHT in der Sicht stehen:
// dort wären sie an einen Maus-Klick gebunden und damit nur von Hand prüfbar.
// Hier sind sie eine reine Funktion — und die beiden Fallen unten stehen als
// Test fest statt als Kommentar.
//
// ─── FALLE 1: DIE HÖHE RECHNET AUCH MIT DER BREITE ─────────────────────────
//
// `meterProBild` beschreibt eine BILDBREITE. Ein Grundriss ist in beiden
// Richtungen gleich skaliert; die y-Achse mit der Feldhöhe zu normieren, gäbe
// je nach Seitenverhältnis des Fensters andere Meter für denselben Punkt —
// und die Lage änderte sich, wenn jemand das Fenster zieht.
//
// ─── FALLE 2: OHNE MASSSTAB WIRD NICHT GERECHNET ───────────────────────────
//
// Kein Massstab heisst `null` und nicht `1`. Eine erfundene Zahl sähe im Plan
// aus wie eine Auskunft des Hauses — dieselbe Regel, an der `belastbarkeit()`
// `watt: null` mit Grund zurückgibt statt `absicherungA × 230`.
// ───────────────────────────────────────────────────────────────────────────

/**
 * Ein Anteil der Bildbreite wird zu Metern.
 *
 * `anteil` ist der Abstand vom linken bzw. oberen Rand, geteilt durch die
 * BREITE des Feldes — für beide Achsen.
 */
export const meterAusAnteil = (anteil: number, meterProBild: number | undefined): number | null => {
  if (!meterProBild || meterProBild <= 0 || !Number.isFinite(meterProBild)) return null
  if (!Number.isFinite(anteil)) return null
  return Number((anteil * meterProBild).toFixed(2))
}

/**
 * Der Rückweg: Meter werden zum Anteil der Bildbreite, für die Marke im Bild.
 *
 * Gibt `null` ohne Massstab. Eine Marke auf 0 % zu legen, weil der Massstab
 * fehlt, hiesse dieselbe Lüge wie ein Punkt auf (0,0): sie sähe aus wie eine
 * Aussage über das Gebäude.
 */
export const anteilAusMeter = (meter: number, meterProBild: number | undefined): number | null => {
  if (!meterProBild || meterProBild <= 0 || !Number.isFinite(meterProBild)) return null
  if (!Number.isFinite(meter)) return null
  return meter / meterProBild
}
