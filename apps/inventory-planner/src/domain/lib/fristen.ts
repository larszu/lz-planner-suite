// ───────────────────────────────────────────────────────────────────────────
// Die Fristen-Ampel — „was muss ich diese Woche anfassen?" (B-65)
//
// ─── DIE FRAGE, DIE EIN LAGER SONST ZU SPÄT STELLT ─────────────────────────
//
// Der Eigentümer sah in seiner Vorlage „Bald ablaufend / Abgelaufen / Diese
// Woche fällig". Dort geht es um Mindesthaltbarkeit; hier um die
// DGUV-V3-Prüfung, die Kalibrierung und das Alter eines Akkus. Die Form ist
// dieselbe, und der Unterschied ist der Preis des Übersehens: ein
// abgelaufener Joghurt ist ärgerlich, ein ungeprüftes Gerät auf einer
// Veranstaltung ist eine Ordnungswidrigkeit und im Schadensfall ein Problem
// mit der Versicherung.
//
// ─── VIER LAGEN, UND EINE DAVON IST KEINE AUSSAGE ──────────────────────────
//
//   ueberfaellig   Termin liegt vor heute            → sofort
//   faellig        Termin innerhalb der Vorwarnzeit  → einplanen
//   ok             später
//
// Und daneben, ausdrücklich KEINE vierte Lage, sondern gar keine: eine
// Einheit OHNE eingetragene Frist ist UNBEWERTET. Sie zählt in keine der
// drei Zahlen, und die Liste sagt, wie viele das sind. Sie als „ok" zu
// führen wäre die gefährlichste Zahl, die diese Datei erzeugen könnte —
// ein Lager, in dem niemand je eine Prüffrist gepflegt hat, sähe aus wie
// eines, in dem alles geprüft ist.
//
// ─── EINE WAHRHEIT, EINE ABLEITUNG, UND SIE SAGT ES ────────────────────────
//
// Steht an der Frist ein `faellig`-Datum, gilt es. Steht keines, und sind
// `zuletzt` und `intervallMonate` da, wird eines gerechnet — und die Zeile
// trägt `quelle: 'hergeleitet'`, damit im Blatt steht, welche Termine
// jemand eingetragen hat und welche die Anwendung ausgerechnet hat. Ein
// gerechneter Termin, der wie ein eingetragener aussieht, ist genau die
// Sorte Zahl, gegen die dieses Repo an mehreren Stellen anschreibt.
//
// Sind beide da, gewinnt das eingetragene Datum: es ist die jüngere,
// menschliche Aussage („der Prüfer kommt am 12., nicht am 4.").
//
// ─── DAS AKKU-ALTER WIRD GEZEIGT, NICHT BEURTEILT ──────────────────────────
//
// `alterMonate` kommt aus `anschaffung.am` und ist eine Tatsache. Ab wann
// ein Akku zu alt ist, ist es NICHT — das hängt an Zellchemie, Ladezyklen
// und daran, was das Haus sich leistet. Diese Datei setzt dafür keine
// Schwelle; wer eine will, trägt sie als Frist der Art `akku` ein. Eine
// erfundene Schwelle wäre eine Wartungsempfehlung ohne Fundstelle.
//
// REIN: keine Uhr, kein Store, kein IO. `heute` kommt von aussen herein —
// dieselbe Regel wie überall unter `domain/`.
// ───────────────────────────────────────────────────────────────────────────
import type {
  EingebauteFristArt,
  Frist,
  FristArt,
  FristArtDef,
  InventoryItem,
  InventoryUnit,
} from '../types/inventory'
import { EINGEBAUTE_FRIST_ARTEN } from '../types/inventory'
import { format, quelle, type Uebersetzen } from '../../i18n/quelle'

export type FristLage = 'ueberfaellig' | 'faellig' | 'ok'

/** Wie der Termin zustande kam. Steht in der Zeile, nicht in einer Fussnote. */
export type FristQuelle = 'eingetragen' | 'hergeleitet'

/**
 * Wie die eingebauten Arten heissen.
 *
 * Als FUNKTION und nicht als Konstante (seit 2026-09-11, E-28): eine
 * Modul-Konstante wird beim Laden EINMAL gebaut und bliebe in der Sprache
 * stehen, die damals galt — der Umschalter in den Einstellungen änderte dann
 * alles ausser ihr. Dieselbe Falle wie bei der Reiter-Liste in `App.tsx`.
 *
 * `DGUV V3` ist kein deutscher Text, sondern der Name einer Vorschrift, und
 * bleibt in jeder Sprache stehen. Ihn zu „Electrical safety test" zu machen
 * hiesse, den Prüfbericht nicht mehr wiederzufinden.
 */
export const fristArtLabels = (t: Uebersetzen = quelle): Record<EingebauteFristArt, string> => ({
  'dguv-v3': 'DGUV V3',
  kalibrierung: t('deadline.kind.calibration', 'Calibration'),
  wartung: t('deadline.kind.service', 'Service'),
  akku: t('deadline.kind.battery', 'Battery'),
  haltbarkeit: t('deadline.kind.shelfLife', 'Shelf life'),
  sonstige: t('deadline.kind.other', 'Other'),
})

/**
 * Wie eine Art auf dem Blatt heißt.
 *
 * Drei Fälle, und der dritte ist der Grund, warum diese Funktion existiert:
 *
 *   eingebaut   die Übersetzung von oben
 *   angelegt    der Name, den das Haus vergeben hat
 *   unbekannt   die Id, ausdrücklich als unbekannt gekennzeichnet
 *
 * Der dritte Fall tritt ein, wenn eine Datei aus einem anderen Haus kommt
 * und ihre Arten-Liste nicht mitgeschickt hat. Ihn auf „Sonstige" zu ziehen
 * wäre bequem und falsch: der Termin bekäme einen Namen, den niemand
 * vergeben hat, und niemand wüsste mehr, wonach er zu suchen hat. Die Id
 * dazuzuschreiben ist eine Auskunft — sie ist das Einzige, was der Datei
 * noch zu entnehmen ist.
 */
export const fristArtLabel = (
  art: FristArt,
  eigene: readonly FristArtDef[] = [],
  t: Uebersetzen = quelle,
): string => {
  const eingebaut = (fristArtLabels(t) as Record<string, string | undefined>)[art]
  if (eingebaut) return eingebaut
  // Der Name des Hauses wird NICHT übersetzt: er ist eine Eingabe und keine
  // Beschriftung. Wer „Anschlagmittel" eingetragen hat, sucht danach.
  const treffer = eigene.find((d) => d.id === art)
  if (treffer) return treffer.name
  return format(t('deadline.kind.unknown', '{id} (unknown kind)'), { id: art })
}

/** `true`, wenn weder eingebaut noch in der Liste des Hauses. */
export const istUnbekannteArt = (art: FristArt, eigene: readonly FristArtDef[] = []): boolean =>
  !(EINGEBAUTE_FRIST_ARTEN as readonly string[]).includes(art) && !eigene.some((d) => d.id === art)

export interface FristZeile {
  unitId: string
  /** Modellname des Artikels, zu dem die Einheit gehört. */
  model: string
  /** Die Einheit, wie ein Mensch sie anspricht (Hausnummer, sonst Serie). */
  einheit: string
  art: FristArt
  /** Bei `sonstige` das Einzige, was den Termin benennt. */
  bezeichnung?: string
  /** Der Termin (ISO-Datum). */
  faellig: string
  quelle: FristQuelle
  /** Tage bis zum Termin. Negativ heisst überfällig. */
  tage: number
  lage: FristLage
}

export interface FristenBericht {
  zeilen: FristZeile[]
  ueberfaellig: number
  faellig: number
  ok: number
  /**
   * Einheiten ohne eine einzige eingetragene Frist.
   *
   * Eine eigene Zahl, weil „nicht gepflegt" keine der drei Lagen ist. Ohne
   * sie sähe ein Lager, in dem niemand je eine Prüffrist eingetragen hat,
   * aus wie eines, in dem alles geprüft ist — und das ist bei Prüffristen
   * die teuerste Verwechslung, die diese Anwendung anbieten könnte.
   */
  ohneFrist: number
}

/** Ein ISO-Datum als Tageszahl seit Epoch. `NaN` bei Unsinn. */
const tagesZahl = (iso: string): number => {
  // Nur der Datumsteil: eine Uhrzeit im Feld würde die Differenz um
  // Stundenbruchteile verschieben, und „fällig in 0,7 Tagen" liest niemand.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!m) return Number.NaN
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(t) ? Number.NaN : Math.round(t / 86_400_000)
}

/** `iso` plus `monate`, als ISO-Datum. Der 31. in einem kurzen Monat rutscht
 *  auf dessen letzten Tag — nicht in den nächsten: „am 31.08. geprüft, alle
 *  6 Monate" ergibt den 28./29.02. und nicht den 03.03. */
export const plusMonate = (iso: string, monate: number): string | undefined => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!m) return undefined
  const jahr = Number(m[1])
  const monat = Number(m[2]) - 1 + monate
  const tag = Number(m[3])
  const letzterImZiel = new Date(Date.UTC(jahr, monat + 1, 0)).getUTCDate()
  const d = new Date(Date.UTC(jahr, monat, Math.min(tag, letzterImZiel)))
  return d.toISOString().slice(0, 10)
}

/** Der Termin einer Frist, und woher er kommt. `undefined`, wenn es keinen gibt. */
export const terminVon = (f: Frist): { faellig: string; quelle: FristQuelle } | undefined => {
  if (f.faellig && !Number.isNaN(tagesZahl(f.faellig))) {
    return { faellig: f.faellig.slice(0, 10), quelle: 'eingetragen' }
  }
  if (f.zuletzt && f.intervallMonate) {
    const abgeleitet = plusMonate(f.zuletzt, f.intervallMonate)
    if (abgeleitet) return { faellig: abgeleitet, quelle: 'hergeleitet' }
  }
  return undefined
}

/**
 * Wie alt eine Einheit ist, in vollen Monaten — oder `undefined`, wenn kein
 * Kaufdatum hinterlegt ist. Eine TATSACHE, kein Urteil: siehe Kopf.
 */
export const alterMonate = (unit: InventoryUnit, heute: string): number | undefined => {
  const am = unit.anschaffung?.am
  if (!am) return undefined
  const a = /^(\d{4})-(\d{2})-(\d{2})/.exec(am.trim())
  const h = /^(\d{4})-(\d{2})-(\d{2})/.exec(heute.trim())
  if (!a || !h) return undefined
  const monate = (Number(h[1]) - Number(a[1])) * 12 + (Number(h[2]) - Number(a[2]))
  return Number(h[3]) < Number(a[3]) ? monate - 1 : monate
}

/**
 * Die Fristenlage über den Bestand.
 *
 * `vorwarnTage` ist die Zeit, in der ein Termin als „fällig" gilt statt als
 * „ok" — die Vorgabe von 30 Tagen ist die Frist, in der sich ein Prüftermin
 * noch vereinbaren lässt. Sie steht als Parameter da und nicht als Konstante
 * im Code, weil sie eine Entscheidung des Hauses ist.
 */
export function fristenLage(
  units: readonly InventoryUnit[],
  items: readonly InventoryItem[],
  heute: string,
  vorwarnTage = 30,
  t: Uebersetzen = quelle,
): FristenBericht {
  const modellVon = new Map(items.map((i) => [i.id, i.model]))
  const heuteZahl = tagesZahl(heute)
  const zeilen: FristZeile[] = []
  let ohneFrist = 0

  for (const u of units) {
    // Das Feld heisst `termin` und nicht `t`: seit `fristenLage` einen
    // Uebersetzer entgegennimmt, verdeckte die kurze Fassung ihn — und der
    // Compiler sagte es nur, weil hier danach ein Feld gelesen wird. Bei
    // einer Funktion, die beides verträgt, hätte er geschwiegen.
    const termine = (u.fristen ?? [])
      .map((f) => ({ f, termin: terminVon(f) }))
      .filter((x): x is { f: Frist; termin: { faellig: string; quelle: FristQuelle } } => !!x.termin)
    if (termine.length === 0) {
      ohneFrist += 1
      continue
    }
    for (const { f, termin } of termine) {
      const tage = tagesZahl(termin.faellig) - heuteZahl
      if (Number.isNaN(tage)) continue
      zeilen.push({
        unitId: u.id,
        model: modellVon.get(u.itemId) ?? t('common.notStated', 'not stated'),
        // Die Hausnummer zuerst: unter ihr spricht das Haus das Geraet an.
        // Die Seriennummer ist die Auskunft nach draussen.
        einheit: u.houseRef ?? u.serial ?? u.code ?? u.id,
        art: f.art,
        ...(f.bezeichnung ? { bezeichnung: f.bezeichnung } : {}),
        faellig: termin.faellig,
        quelle: termin.quelle,
        tage,
        lage: tage < 0 ? 'ueberfaellig' : tage <= vorwarnTage ? 'faellig' : 'ok',
      })
    }
  }

  // Feste Reihenfolge: das Dringendste zuerst, bei gleichem Tag nach Name.
  // Derselbe Bestand ergibt zweimal dieselbe Liste (ADR-004).
  //
  // DIE KENNUNG `'de'` BLEIBT STEHEN, auch seit die Oberflaeche uebersetzbar
  // ist. Sie mit der gewaehlten Sprache wandern zu lassen waere naheliegend
  // und falsch: `localeCompare` OHNE Kennung nimmt die des Rechners, und
  // damit ergaebe derselbe Bestand auf zwei Rechnern zwei verschiedene
  // Listen — genau das, was ADR-004 ausschliesst. Eine FESTE Kennung ist
  // hier die Anforderung; welche es ist, ist zweitrangig.
  zeilen.sort(
    (a, b) =>
      a.tage - b.tage ||
      a.model.localeCompare(b.model, 'de') ||
      a.einheit.localeCompare(b.einheit, 'de') ||
      a.art.localeCompare(b.art),
  )

  return {
    zeilen,
    ueberfaellig: zeilen.filter((z) => z.lage === 'ueberfaellig').length,
    faellig: zeilen.filter((z) => z.lage === 'faellig').length,
    ok: zeilen.filter((z) => z.lage === 'ok').length,
    ohneFrist,
  }
}

/** Was auf eine Arbeitsliste gehört: überfällig und fällig, in dieser Folge. */
export const anzugehen = (b: FristenBericht): FristZeile[] =>
  b.zeilen.filter((z) => z.lage !== 'ok')
