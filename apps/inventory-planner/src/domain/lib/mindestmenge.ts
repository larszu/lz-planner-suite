// ───────────────────────────────────────────────────────────────────────────
// Reicht der Bestand? — „Unter Ziel" (B-65)
//
// ─── DIE FRAGE, DIE EINE BESTANDSZAHL NICHT BEANTWORTET ────────────────────
//
// „12 Stück" sagt nicht, ob das genug ist. Der Eigentümer sah in seiner
// Vorlage eine Kachel „Unter Ziel"; das ist die einzige Zahl auf so einer
// Startseite, die zu einer HANDLUNG führt — nachbestellen oder sub-hiren.
//
// ─── DIE ENTSCHEIDUNG, AUF DIE ES ANKOMMT ──────────────────────────────────
//
// Verglichen wird NICHT mit `quantity`, sondern mit dem, was tatsächlich im
// Regal liegt: `quantity` minus dem, was auf offenen Ausgaben gebunden ist.
//
// Eine Prüfung gegen `quantity` gäbe Entwarnung für Material, das gerade auf
// einem Truck steht. Genau in dem Moment — Show läuft, halbes Lager
// unterwegs — wird die Zahl gebraucht, und genau dann wäre sie falsch. Der
// Kommissionierer merkt es beim Griff ins leere Fach; die Liste hätte es
// vorher wissen können, weil `inventoryCommitment` es längst weiß.
//
// ─── DREI ZUSTÄNDE, NICHT ZWEI ─────────────────────────────────────────────
//
//   unter      verfügbar < Mindestmenge          → Handlung nötig
//   knapp      verfügbar == Mindestmenge         → die nächste Ausgabe reisst
//                                                  die Lücke
//   ok         verfügbar > Mindestmenge
//
// Und daneben, ausdrücklich KEIN vierter Zustand, sondern gar keiner:
// ein Artikel OHNE hinterlegte Mindestmenge ist UNBEWERTET. Er zählt in
// keine der drei Zahlen, und die Liste sagt, wie viele das sind. Ihn als
// „ok" zu führen wäre die stille Form derselben Lüge, gegen die dieses Repo
// an mehreren Stellen anschreibt: eine Aussage über etwas, das niemand
// entschieden hat.
//
// REIN: keine Uhr, kein Store, kein IO.
// ───────────────────────────────────────────────────────────────────────────
import type { InventoryItem } from '../types/inventory'
import type { Commitment } from './inventoryCommitment'

export type DeckungsLage = 'unter' | 'knapp' | 'ok'

export interface DeckungsZeile {
  itemId: string
  model: string
  category?: string
  /** Was der Bestand insgesamt zählt. */
  bestand: number
  /** Was auf offenen Ausgaben gebunden ist. */
  gebunden: number
  /** Was wirklich im Regal liegt: `bestand - gebunden`, nie unter null. */
  verfuegbar: number
  mindestmenge: number
  lage: DeckungsLage
  /** Wieviel fehlt bis zur Mindestmenge. 0 bei `knapp` und `ok`. */
  fehlt: number
}

export interface DeckungsBericht {
  zeilen: DeckungsZeile[]
  unter: number
  knapp: number
  ok: number
  /**
   * Artikel ohne hinterlegte Mindestmenge.
   *
   * Eine eigene Zahl, weil „nicht bewertet" keine der drei Lagen ist. Ohne
   * sie sähe ein Lager, in dem niemand je eine Mindestmenge gepflegt hat,
   * aus wie ein Lager, in dem alles reicht.
   */
  unbewertet: number
}

/**
 * Die Deckungslage je Artikel.
 *
 * `gebunden` kommt aus `committedByItem` und wird HEREINGEREICHT statt hier
 * gerechnet: die Ausgaben sind eine andere Quelle als der Bestand, und zwei
 * Rechnungen über dieselben Ausgaben liefen auseinander.
 */
export function deckung(
  items: readonly InventoryItem[],
  gebundenJeItem: ReadonlyMap<string, Commitment>,
): DeckungsBericht {
  const zeilen: DeckungsZeile[] = []
  let unbewertet = 0

  for (const it of items) {
    if (typeof it.mindestmenge !== 'number') {
      unbewertet += 1
      continue
    }
    const gebunden = gebundenJeItem.get(it.id)?.quantity ?? 0
    // Nie unter null: mehr gebunden als im Bestand ist ein Datenfehler, aber
    // eine negative "Verfuegbarkeit" waere eine Aussage, die niemand lesen
    // kann. Der Fall faellt ueber `bestand`/`gebunden` in der Zeile auf.
    const verfuegbar = Math.max(0, it.quantity - gebunden)
    const lage: DeckungsLage =
      verfuegbar < it.mindestmenge ? 'unter' : verfuegbar === it.mindestmenge ? 'knapp' : 'ok'
    zeilen.push({
      itemId: it.id,
      model: it.model,
      ...(it.category ? { category: it.category } : {}),
      bestand: it.quantity,
      gebunden,
      verfuegbar,
      mindestmenge: it.mindestmenge,
      lage,
      fehlt: lage === 'unter' ? it.mindestmenge - verfuegbar : 0,
    })
  }

  // Feste Reihenfolge: das Dringendste zuerst, bei gleicher Luecke nach Name.
  // Derselbe Baum ergibt zweimal dieselbe Liste (ADR-004).
  const rang: Record<DeckungsLage, number> = { unter: 0, knapp: 1, ok: 2 }
  zeilen.sort(
    (a, b) =>
      rang[a.lage] - rang[b.lage] ||
      b.fehlt - a.fehlt ||
      a.model.localeCompare(b.model, 'de') ||
      a.itemId.localeCompare(b.itemId),
  )

  return {
    zeilen,
    unter: zeilen.filter((z) => z.lage === 'unter').length,
    knapp: zeilen.filter((z) => z.lage === 'knapp').length,
    ok: zeilen.filter((z) => z.lage === 'ok').length,
    unbewertet,
  }
}

/** Was auf eine Nachbestell-Liste gehört: nur `unter`, mit der Fehlmenge. */
export const nachzubestellen = (b: DeckungsBericht): DeckungsZeile[] =>
  b.zeilen.filter((z) => z.lage === 'unter')
