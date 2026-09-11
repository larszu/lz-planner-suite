// ───────────────────────────────────────────────────────────────────────────
// Die Quelle — der Übersetzer-Typ und die Fassung, die NICHT übersetzt.
//
// WARUM DIESE DATEI EXISTIERT. `Uebersetzen` und `quelle` standen bis
// 2026-09-11 viermal im Baum, wortgleich, in `ownership.ts`, `codeLeser.ts`,
// `belegOcr.ts` und `inventoryAudit.ts`. Vier Kopien derselben drei Zeilen
// sind harmlos, solange niemand eine davon anfasst — und genau dann sind sie
// es nicht mehr: wer der einen ein drittes Argument gibt, hat drei Module,
// die etwas anderes glauben.
//
// WARUM NICHT IN `index.ts`. Dort steht der Zustand-Store, und der bringt
// `zustand` mit. Die Module unter `domain/lib/` rechnen; sie sollen keinen
// Store importieren, um an einen Typ zu kommen — sonst hängt die reine
// Rechnung an einer Zustandsverwaltung, und ein Test dieser Rechnung zieht
// sie mit hoch. Diese Datei hat deshalb KEINE Abhängigkeit, nicht eine.
//
// WAS `quelle` IST. Die Vorgabe jeder Funktion, die Text ausgibt: sie liefert
// das zweite Argument unverändert zurück, also den englischen Quelltext
// (E-28). Ein Aufrufer ohne Wörterbuch bekommt damit die Quelle und nicht
// einen leeren String oder einen Schlüssel — und ein Test, der ohne `t`
// aufruft, misst genau die Rückfallebene, die im Betrieb erscheint, wenn
// eine Übersetzung fehlt.
// ───────────────────────────────────────────────────────────────────────────

/** Ein Übersetzer: Schlüssel plus englischer Quelltext, heraus kommt Text. */
export type Uebersetzen = (key: string, en: string) => string

/** Der Übersetzer, der nicht übersetzt: er gibt die Quelle zurück. */
export const quelle: Uebersetzen = (_key, en) => en

/**
 * Platzhalter einsetzen: `format(t('x', '{n} items'), { n: 5 })` → `5 items`.
 *
 * Ein unbekannter Platzhalter bleibt SICHTBAR stehen (`{n}`) statt zu
 * verschwinden: ein fehlender Wert ist ein Fehler im Aufruf, und ein Satz,
 * dem still ein Wort fehlt, sieht aus wie ein Satz.
 */
export function format(vorlage: string, werte: Record<string, string | number>): string {
  return vorlage.replace(/\{(\w+)\}/g, (_, k: string) => (werte[k] === undefined ? `{${k}}` : String(werte[k])))
}
