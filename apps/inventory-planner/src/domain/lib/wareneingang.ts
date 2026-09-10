// ───────────────────────────────────────────────────────────────────────────
// Wareneingang — aus einem Lieferschein wird Bestand (B-65)
//
// ─── WAS DIE VORLAGE ZEIGT UND WAS DAS HAUS BRAUCHT ────────────────────────
//
// Der Eigentümer sah in seiner Vorlage einen Kassenbon-Import: Foto machen,
// Positionen erscheinen. Für eine Haushalts-App ist das der einzige Weg —
// eine Privatperson bekommt keine Datei vom Supermarkt, nur Papier.
//
// Ein Rental-Haus bekommt beides: den Lieferschein auf Papier UND, fast
// immer, eine Zeile im Mail-Anhang oder im Portal des Lieferanten. Der
// Unterschied entscheidet die Form dieser Datei.
//
// DESHALB LIEST SIE TEXT UND KEIN BILD. Eine Erkennung aus dem Foto wäre
// eine grosse Abhängigkeit (OCR) für ein Ergebnis, das jemand danach ZEILE
// FÜR ZEILE nachprüfen müsste — und wer das ohnehin tut, tippt in derselben
// Zeit die vier Positionen ab, um die es meistens geht. Der Weg über den
// Text ist schneller, prüfbar und braucht nichts, was nicht schon da ist.
// Das Foto bleibt als eigener Schritt im Backlog stehen, mit der
// Abhängigkeit benannt.
//
// ─── DREI DINGE, DIE DIESE DATEI AUSDRÜCKLICH NICHT TUT ────────────────────
//
//  1. SIE BUCHT NICHTS. `lesen()` liefert einen Vorschlag; was daraus wird,
//     entscheidet der Mensch in der Ansicht. Ein Import, der beim Einlesen
//     schon schreibt, ist der Grund, warum jemand danach einen Bestand von
//     Hand zurückbaut.
//  2. SIE ERFINDET KEINE MENGE UND KEINEN PREIS. Fehlt eine Angabe, fehlt
//     sie — die Zeile sagt das und wird nicht mit 1 aufgefüllt. Dieselbe
//     Regel wie überall in diesem Repo.
//  3. SIE RÄT NICHT, WAS ZU WEM GEHÖRT. Ob eine Zeile einen vorhandenen
//     Artikel MEINT oder einen neuen anlegt, entscheidet ein exakter
//     Vergleich (Modell, gross/klein egal) — kein Ähnlichkeitsmass. Ein
//     „ULXD2-K51" ist nicht dasselbe wie ein „ULXD2", und eine Software, die
//     das zusammenzieht, macht aus zwei Artikeln stillschweigend einen.
//
// REIN: keine Uhr, kein Store, kein IO.
// ───────────────────────────────────────────────────────────────────────────
import type { InventoryItem, InventoryOwnership } from '../types/inventory'

/** Wie eine gelesene Zeile zum vorhandenen Bestand steht. */
export type EingangsLage =
  /** Ein Artikel dieses Modells ist da — die Menge wird erhöht. */
  | 'bekannt'
  /** Kein Artikel dieses Modells — er würde neu angelegt. */
  | 'neu'
  /** Die Zeile war nicht lesbar und wird nicht gebucht. */
  | 'unlesbar'

export interface EingangsZeile {
  /** Die Zeile, wie sie im Beleg stand. Bleibt IMMER erhalten. */
  roh: string
  lage: EingangsLage
  /** Was gelesen wurde. Bei `unlesbar` leer. */
  model?: string
  menge?: number
  /** Nur wenn im Beleg eine Zahl stand. Kein Preis ist kein 0-Preis. */
  preis?: number
  /** Bei `bekannt`: der Artikel, den die Zeile meint. */
  itemId?: string
  /** Bei `bekannt`: was danach im Bestand stünde. */
  neueMenge?: number
  /** Bei `unlesbar`: woran es lag, in einem Satz. */
  grund?: string
}

export interface EingangsBericht {
  zeilen: EingangsZeile[]
  bekannt: number
  neu: number
  unlesbar: number
}

/** Wie eine Zahl im Beleg aussehen darf: „12", „12,5", „12.5". */
const zahl = (s: string): number | undefined => {
  const t = s.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(t)) return undefined
  const n = Number(t)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Eine Zeile zerlegen.
 *
 * ZUGELASSEN SIND DREI SCHREIBWEISEN, und sie decken ab, was aus einem
 * Portal oder einem abgetippten Lieferschein wirklich kommt:
 *
 *   4 x Shure ULXD2          Menge vorn, „x" als Trenner
 *   Shure ULXD2; 4; 249.00   Semikolon/Tabulator (CSV aus dem Portal)
 *   Shure ULXD2              nur der Name — die Menge FEHLT dann und wird
 *                            NICHT als 1 erfunden
 *
 * Was in keine davon passt, ist `unlesbar` MIT der Rohzeile. Eine Zeile
 * stillschweigend zu überspringen wäre der teuerste Ausgang: der Beleg
 * hat zwölf Positionen, gebucht werden elf, und niemand sieht es.
 */
export const zeileLesen = (roh: string): EingangsZeile => {
  const t = roh.trim()
  if (!t) return { roh, lage: 'unlesbar', grund: 'leere Zeile' }

  // CSV-artig: Semikolon oder Tabulator.
  if (/[;\t]/.test(t)) {
    const teile = t.split(/[;\t]/).map((x) => x.trim())
    const model = teile[0]
    if (!model) return { roh, lage: 'unlesbar', grund: 'keine Bezeichnung in der ersten Spalte' }
    const menge = teile[1] !== undefined ? zahl(teile[1]) : undefined
    const preis = teile[2] !== undefined ? zahl(teile[2]) : undefined
    if (teile[1] !== undefined && teile[1] !== '' && menge === undefined) {
      return { roh, lage: 'unlesbar', grund: `„${teile[1]}" ist keine Menge` }
    }
    return { roh, lage: 'neu', model, ...(menge !== undefined ? { menge } : {}), ...(preis !== undefined ? { preis } : {}) }
  }

  // „4 x Shure ULXD2" / „4x Shure ULXD2" / „4 Shure ULXD2"
  const m = /^(\d+(?:[.,]\d+)?)\s*(?:x|×|\*)?\s+(.+)$/i.exec(t)
  if (m) {
    const menge = zahl(m[1])
    const model = m[2].trim()
    if (menge === undefined || !model) {
      return { roh, lage: 'unlesbar', grund: 'Menge und Bezeichnung nicht zu trennen' }
    }
    return { roh, lage: 'neu', model, menge }
  }

  // Nur ein Name. Das ist lesbar — die MENGE fehlt, und das ist etwas
  // anderes als „eins".
  return { roh, lage: 'neu', model: t }
}

/**
 * Einen Beleg gegen den Bestand lesen.
 *
 * Der Vergleich ist EXAKT (nur Gross-/Kleinschreibung und Randleerzeichen
 * egal). Ein Ähnlichkeitsmass stünde hier schnell und zöge früher oder
 * später zwei Artikel zusammen, die das Haus auseinanderhält — und der
 * Fehler fiele erst auf, wenn die Kommissionierliste das Falsche nennt.
 */
export function lesen(text: string, items: readonly InventoryItem[]): EingangsBericht {
  const nachModell = new Map(items.map((i) => [i.model.trim().toLowerCase(), i]))
  const zeilen = text
    .split(/\r?\n/)
    .filter((z) => z.trim().length > 0)
    .map((roh) => {
      const z = zeileLesen(roh)
      if (z.lage === 'unlesbar' || !z.model) return z
      const treffer = nachModell.get(z.model.trim().toLowerCase())
      if (!treffer) return z
      return {
        ...z,
        lage: 'bekannt' as const,
        itemId: treffer.id,
        ...(z.menge !== undefined ? { neueMenge: treffer.quantity + z.menge } : {}),
      }
    })

  return {
    zeilen,
    bekannt: zeilen.filter((z) => z.lage === 'bekannt').length,
    neu: zeilen.filter((z) => z.lage === 'neu').length,
    unlesbar: zeilen.filter((z) => z.lage === 'unlesbar').length,
  }
}

/**
 * Was gebucht werden kann: alles Lesbare MIT Menge.
 *
 * Eine Zeile ohne Menge bleibt stehen und wird nicht gebucht — sie ist
 * kein Fehler, sondern eine offene Frage, und der Mensch beantwortet sie
 * in der Ansicht. Sie mit 1 zu buchen wäre eine erfundene Lieferung.
 */
export const buchbar = (b: EingangsBericht): EingangsZeile[] =>
  b.zeilen.filter((z) => z.lage !== 'unlesbar' && typeof z.menge === 'number' && z.menge > 0)

/**
 * Das Eigentum, das eine Lieferung mitbringt.
 *
 * Steht hier als eigener Typ und nicht als Vorgabe im Code: was das Haus
 * kauft, ist `owned`; was es zumietet, ist `subhire` — und der Unterschied
 * entscheidet, ob das Stück auf der Sub-Hire-Liste erscheint und wann es
 * zurückmuss. Eine Vorgabe wäre für die Hälfte der Lieferungen falsch, und
 * zwar die teurere Hälfte (`isForeign` in `ownership.ts`).
 */
export type EingangsEigentum = Extract<InventoryOwnership, 'owned' | 'subhire' | 'rented'>
