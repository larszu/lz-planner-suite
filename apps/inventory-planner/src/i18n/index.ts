// ───────────────────────────────────────────────────────────────────────────
// i18n des Lagers — Englisch ist die Quellsprache, Deutsch die Übersetzung.
//
// NUTZER-ENTSCHEIDUNG 2026-09-11: „Die Standard Sprache muss immer Englisch
// sein und über i18n muss man auf deutsch übersetzen können."
//
// Damit gilt E-28 (Quellsprache `en`) auch für dieses Repo. Bis heute war es
// deutsch-quellig: die Texte standen roh im JSX, ohne Schicht darunter. Der
// Umbau ist deshalb keine Übersetzung, sondern zwei Dinge auf einmal — die
// Schicht einziehen UND die Quelle drehen.
//
// ─── DIE FORM IST DIE DER ÜBRIGEN PLANER ──────────────────────────────────
//
//   t('bereich.schluessel', 'English source text')
//
// Der zweite Parameter ist der Text, der erscheint, wenn kein Eintrag
// gefunden wird — also die QUELLE und kein Platzhalter. Er steht im JSX und
// nicht in einer en.ts: eine englische Wörterbuch-Datei wäre die zweite
// Wahrheit, und beim nächsten Umbau liefe sie gegen das JSX.
//
// ─── EIN SCHLÜSSEL, EIN GANZER SATZ ───────────────────────────────────────
//
// Sätze werden NIE aus mehreren `t()`-Aufrufen zusammengesetzt: die
// Wortstellung gehört zur Sprache. Platzhalter laufen über `format()`.
//
// ─── DIE VORGABE IST ENGLISCH, NICHT DIE SYSTEMSPRACHE ────────────────────
//
// Ein `navigator.language`-Standard brächte einen deutschen Rechner auf
// Deutsch, und der Nutzer-Satz oben sagt ausdrücklich etwas anderes. Wer
// Deutsch will, wählt es einmal im Einstellungen-Dialog; die Wahl überlebt
// den Neustart.
// ───────────────────────────────────────────────────────────────────────────
import { create } from 'zustand'
import { de } from './de'
import { format } from './quelle'

// Der Übersetzer-Typ und die nicht-übersetzende Fassung stehen in
// `quelle.ts` — ohne Abhängigkeit, damit `domain/lib/` sie nutzen kann, ohne
// den Store mitzuziehen. Hier weitergereicht, damit ein Aufrufer EINEN Ort
// kennen muss.
export { quelle, format, type Uebersetzen } from './quelle'

export type Sprache = 'en' | 'de'

/** Alle ausgelieferten Sprachen. Eine weitere ist eine Datei und ein Eintrag
 *  in dieser Tabelle — keine Zeile Logik. */
export const WOERTERBUECHER: Partial<Record<Sprache, Record<string, string>>> = { de }

const SCHLUESSEL = 'inventory-planner:sprache'

const gespeichert = (): Sprache => {
  try {
    const w = localStorage.getItem(SCHLUESSEL)
    return w === 'de' || w === 'en' ? w : 'en'
  } catch {
    // Privates Fenster, gesperrter Speicher: die Vorgabe steht, die Wahl
    // hält eben nur bis zum Neuladen. Kein Grund, den Start abzubrechen.
    return 'en'
  }
}

interface SprachStand {
  sprache: Sprache
  setzeSprache: (s: Sprache) => void
}

export const useSprache = create<SprachStand>((set) => ({
  sprache: gespeichert(),
  setzeSprache: (sprache) => {
    try {
      localStorage.setItem(SCHLUESSEL, sprache)
    } catch {
      /* siehe oben */
    }
    set({ sprache })
  },
}))

/** Reine Nachschlage-Funktion — auch ausserhalb von React brauchbar. */
export function translate(sprache: Sprache, key: string, en: string): string {
  const w = WOERTERBUECHER[sprache]
  return w?.[key] ?? en
}

/**
 * Die BCP-47-Kennung zur gewählten Sprache — für `toLocaleDateString` und
 * Freunde.
 *
 * `en-GB` und nicht `en-US`: dieses Lager steht in Europa, und `en-US` dreht
 * Tag und Monat um. Ein Rückgabedatum, das als 03/04 dasteht und 4. März
 * meint, ist schlimmer als eines in einer fremden Sprache — man liest es
 * falsch, ohne es zu merken.
 */
export const locale = (s: Sprache): string => (s === 'de' ? 'de-DE' : 'en-GB')

/** Hook: liefert `t`, die aktuelle Sprache und den Setter. */
export function useT() {
  const sprache = useSprache((s) => s.sprache)
  const setzeSprache = useSprache((s) => s.setzeSprache)
  const t = (key: string, en: string) => translate(sprache, key, en)
  return { t, format, sprache, setzeSprache }
}
