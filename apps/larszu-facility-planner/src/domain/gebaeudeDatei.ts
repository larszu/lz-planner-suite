// ───────────────────────────────────────────────────────────────────────────
// `avplan-facility` — die Gebäude-Auskunft als Datei (Issue #2)
//
// ─── DER OFFENE PUNKT, DEN DIESE DATEI SCHLIESST ───────────────────────────
//
// In Issue #2 stand als letzter Haken: „der Weg vom Plan zur Klinke — heute
// liest der `cable-planner` den Vertrag noch gar nicht ab." Nachgemessen am
// 2026-09-10 stimmte das wörtlich: im `cable-planner` kommt weder das Wort
// `facility` noch `Steuerklinke` vor. Der Vertrag (`vertrag.ts`) war sechs
// Funktionen über einem `Gebaeude`-Objekt — und dieses Objekt lebte nur im
// localStorage DIESER App. Ein anderes Programm konnte es nicht ansehen.
//
// Der Weg ist deshalb derselbe wie beim Lager (`avplan-inventory`) und beim
// Plan (`.avplan`): eine Datei. Sie ist die einzige Berührung, und sie geht
// nur in EINE Richtung — heraus. Der Plan liest, was das Haus erklärt; er
// schreibt nicht hinein. Der einzige Rückweg bleibt `mangelMelden` aus dem
// Vertrag, und der ist ausdrücklich kein Datei-Weg.
//
// ─── WAS DRINSTEHT UND WAS NICHT ───────────────────────────────────────────
//
// Drin steht das ganze `Gebaeude` — Punkte, Kreise, Verteilungen, Räume,
// Schaltstellen, Klinken, Trassen, Strecken, Mängel. Es ist die Auskunft des
// Hauses über sich selbst, und wer sie abschneidet, entscheidet an dieser
// Stelle, welche Frage der Plan später nicht mehr stellen darf.
//
// NICHT drin steht ein Grundriss-BILD. `Raum.grundriss` trägt einen
// Dateinamen und einen Maßstab, nicht die Pixel: ein eingebettetes Bild
// machte aus einer 30-kB-Auskunft eine 4-MB-Datei, die per Mail nicht mehr
// durchgeht. Der Plan braucht die Lage in Metern, und die steht am Objekt.
//
// ─── „NICHT ANGEGEBEN" IST NICHT „NEIN" — AUCH HIER ────────────────────────
//
// Dieselbe Regel wie im Vertrag, und beim Lesen ist sie leichter zu brechen
// als beim Rechnen: ein `?? false` in der Heilung macht aus „das Haus sagt
// nichts dazu" die Zusicherung „diese Dose hängt an keinem Schalter". Der
// Leser unten füllt deshalb NICHTS auf, was fehlen darf; `heileGebaeude`
// ergänzt nur LISTEN, die es geben muss, damit niemand über `undefined`
// iteriert.
// ───────────────────────────────────────────────────────────────────────────
import { heileGebaeude, leeresGebaeude, type Gebaeude } from './modell'

/** Der Marker. Wie `avplan-inventory`, mit derselben Aufgabe: fremde Dateien fallen auf. */
export const FACILITY_FORMAT = 'avplan-facility'

/**
 * Version 1 — der erste Stand.
 *
 * Was eine Version hier wirklich leistet, ist dasselbe wie beim Lager: sie
 * weist eine ZU NEUE Datei ab, statt sie halb zu lesen. Die andere Richtung
 * (eine ältere Datei, der ein Feld fehlt) deckt sie nicht ab — dafür ist die
 * Heilung da, und die füllt nichts auf, was fehlen darf.
 */
export const FACILITY_FORMAT_VERSION = 1

interface FacilityDatei {
  format: typeof FACILITY_FORMAT
  version: number
  /** ISO-Zeitstempel — vom Aufrufer gesetzt, hier keine Uhr. */
  exportiertAm?: string
  /** Ursprungs-App, rein informativ. */
  app?: string
  gebaeude: Gebaeude
}

/** Das Gebäude als portables JSON. */
export const serialisiereGebaeude = (
  gebaeude: Gebaeude,
  meta?: { exportiertAm?: string; app?: string },
): string =>
  JSON.stringify(
    {
      format: FACILITY_FORMAT,
      version: FACILITY_FORMAT_VERSION,
      exportiertAm: meta?.exportiertAm,
      app: meta?.app,
      gebaeude,
    } satisfies FacilityDatei,
    null,
    2,
  )

/**
 * Eine Gebäude-Datei lesen.
 *
 * `null` heisst: das ist keine solche Datei oder sie ist neuer als dieser
 * Stand. Beides ist eine Auskunft und kein halbes Ergebnis — ein Leser, der
 * eine fremde Datei „so gut es geht" liest, liefert ein Gebäude, das niemand
 * eingetragen hat.
 */
export const leseGebaeude = (json: string): Gebaeude | null => {
  let daten: unknown
  try {
    daten = JSON.parse(json)
  } catch {
    return null
  }
  if (!daten || typeof daten !== 'object') return null
  const f = daten as Partial<FacilityDatei>
  if (f.format !== FACILITY_FORMAT) return null
  if (typeof f.version !== 'number' || f.version > FACILITY_FORMAT_VERSION) return null
  if (!f.gebaeude || typeof f.gebaeude !== 'object') return null
  const g = f.gebaeude as Partial<Gebaeude>
  if (typeof g.id !== 'string' || !g.id) return null
  return heileGebaeude({
    ...leeresGebaeude(g.id, typeof g.name === 'string' && g.name ? g.name : 'Gebäude'),
    ...g,
  })
}
