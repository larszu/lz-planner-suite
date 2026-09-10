// ───────────────────────────────────────────────────────────────────────────
// DMX-Modell und Adressvergabe — IN DER SUITE aus dem gemeinsamen Paket.
//
// Upstream (`larszu/cable-planner`) liegen hier zwei Dateien mit dem
// vollstaendigen Modell: `types.ts` und `adressierung.ts`. Im Monorepo waeren
// sie eine dritte Kopie desselben Rechenwegs — neben dem Paket und neben dem
// light-planner. Genau das ist die Bauform, an der Rechnungen auseinander
// laufen, ohne dass es jemandem auffaellt: der Fehler zeigt sich erst, wenn
// zwei Apps fuer denselben Plan verschiedene Adressen ausgeben.
//
// Deshalb steht hier eine Weiterleitung und nicht die Rechnung. Alle
// Aufrufstellen importieren unveraendert `../../lib/dmx` — die Umleitung
// kostet keine einzige Zeile an ihnen, und der Drift-Waechter fuehrt die
// beiden ersetzten Dateien unter `REPLACED_BY_PACKAGE` (scripts/planner-drift.mjs).
//
// Wer am Modell etwas aendert, aendert es in `packages/dmx-core/src/` und
// traegt es upstream nach — nicht andersherum.
// ───────────────────────────────────────────────────────────────────────────
export * from '@avplan/dmx-core'
