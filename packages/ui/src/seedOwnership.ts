// ───────────────────────────────────────────────────────────────────────────
// Eigentum je Feld — die Konfliktregel des Seed-Protokolls (E-21).
//
// WARUM ES DAS GIBT. E-22 hat entschieden, dass die Zuordnung Kamera →
// Bedienfeld → Multiviewer → Tally ein GETEILTES Objekt ist: alle lesen und
// alle schreiben es. Damit wurde „wer gewinnt" von einer Randfrage zur ersten.
// Dieselbe Frage stand laenger schon an B-39, Punkt 1: der Raum geht nur hin
// und nie zurueck, weil MultiCam und Licht ihn beide bearbeiten und die
// Zusammenfuehrung eine Regel braucht. Statt einer Regel gab es einen
// weggelassenen Rueckweg — der Widerspruch war vermieden, indem eine Haelfte
// der Verbindung fehlte.
//
// DIE REGEL, in zwei Stufen (E-21, 2026-09-08, vom Eigentuemer bestaetigt):
//
//   1. EIGENTUM JE FELD. Jedes Feld hat genau eine schreibende Stelle. Die
//      Schreibung einer anderen ist ein VORSCHLAG, keine Aenderung. Damit
//      verschwindet der Konflikt fuer den groessten Teil der Felder, statt
//      geloest zu werden: die Kameras gehoeren dem Kamera-Planer, die Leuchten
//      dem Licht-Planer, der Signalfluss dem Kabel-Planer — getrennt schon
//      ueber `SeedPatch.domain`.
//
//   2. GETEILTE FELDER MELDEN DEN WIDERSPRUCH. Fuer die wenigen Felder, die
//      mehrere schreiben duerfen (heute die drei Raum-Masse), traegt jeder
//      Eintrag Herkunft und Zeitpunkt. Wer ein Feld zuerst setzt, HAELT es;
//      eine abweichende Setzung einer anderen Stelle wird zu einem BEFUND und
//      nicht zu einer Ueberschreibung.
//
// WARUM NICHT „LETZTER GEWINNT". Das waere die scheinbar einfachste Regel und
// die schlechteste: sie macht aus einem Widerspruch ein Rennen, dessen Ausgang
// von der Netzlaufzeit abhaengt. Beide Seiten saehen fuer sich vollstaendig
// aus, und der zuletzt zurueckmeldende Planer gewaenne still — genau die Form,
// gegen die ADR-003 geschrieben ist. Der Zeitstempel steht deshalb IM BEFUND
// und entscheidet ihn nicht.
//
// WARUM GLEICHER WERT KEIN BEFUND IST. Zwei Planer, die dieselbe Halle
// vermessen und auf dieselbe Zahl kommen, widersprechen sich nicht — sie
// bestaetigen sich. Ein Befund an dieser Stelle waere Laerm, und Laerm macht
// die echten Befunde unsichtbar.
// ───────────────────────────────────────────────────────────────────────────

import type {
  SeedHold,
  SeedPatch,
  SeedSharedField,
  SeedVenue,
  SeedWriter,
  SuiteSeed,
} from './seed'

/** Feldpfad im Seed, so wie er im Befund steht. */
export type SeedVenueField = `venue.${keyof SeedVenue}`

/**
 * Wer welches Raum-Feld schreiben darf. `'shared'` heisst: mehrere duerfen,
 * und dann gilt Stufe 2 der Regel.
 *
 * `satisfies Record<keyof SeedVenue, …>` ist hier die eigentliche Zusicherung:
 * ein neues Feld in `SeedVenue`, das niemand hier eintraegt, ist ein
 * TYP-FEHLER und keine stille Luecke. Ohne das waere die Tabelle der
 * Kenntnisstand ihres Autors am Tag des Hinschreibens — und ein Feld, das
 * durch keine Regel laeuft, wird stillschweigend ueberschrieben.
 */
export const SEED_VENUE_OWNER = {
  // Der Name des Hauses steht im Shell-Projekt (`meta.venue`) und wird dort
  // gepflegt. Ein Planer, der ihn abweichend mitschickt, macht einen
  // Vorschlag — und der wird gemeldet, nicht ausgefuehrt.
  name: 'shell',
  // Die Masse vermessen beide Planer: MultiCam fuer die Sichtlinien, Licht
  // fuer die Rigging-Punkte.
  widthM: 'shared',
  heightM: 'shared',
  stage: 'shared',
} satisfies Record<keyof SeedVenue, SeedWriter | 'shared'>

/** Feldpfad → Schluessel in `SeedVenue`. Vollstaendig, damit kein Pfad ins Leere zeigt. */
const VENUE_PFAD = {
  'venue.name': 'name',
  'venue.widthM': 'widthM',
  'venue.heightM': 'heightM',
  'venue.stage': 'stage',
} satisfies Record<SeedVenueField, keyof SeedVenue>

/**
 * Ein Widerspruch, der NICHT ueberschrieben wurde. Das ist die Ausgabe der
 * Regel, nicht ihr Nebenprodukt: ein Aufrufer, der ihn wegwirft, hat „letzter
 * gewinnt" wieder eingebaut, nur umgekehrt herum.
 */
export interface SeedConflict {
  field: SeedVenueField
  /**
   * Der Wert, der stehen bleibt — und wer ihn haelt. `at` fehlt bei einem
   * statisch besessenen Feld: dort gibt es keine Setzung, die jemand
   * gestempelt haette, und eine erfundene 0 saehe aus wie „1970".
   */
  held: { value: unknown; by: SeedWriter; at?: number }
  /** Der Wert, der vorgeschlagen wurde — und von wem. */
  proposed: { value: unknown; by: SeedWriter; at: number }
}

export interface SeedMerge {
  seed: SuiteSeed
  /** Leer heisst: nichts zu melden. Nicht „nichts passiert". */
  conflicts: SeedConflict[]
}

/**
 * Wertgleichheit fuer Seed-Felder. Zahlen und Zeichenketten direkt, `stage`
 * ueber seine vier Zahlen — bewusst nicht ueber `JSON.stringify`, dessen
 * Ergebnis von der Schluessel-Reihenfolge abhaengt und damit zwei gleiche
 * Rechtecke als verschieden melden koennte, je nachdem, welcher Planer sie
 * gebaut hat.
 */
function gleich(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a === 'object' && typeof b === 'object') {
    const x = a as Record<string, unknown>
    const y = b as Record<string, unknown>
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (!gleich(x[k], y[k])) return false
    }
    return true
  }
  return false
}

const istGeteilt = (pfad: SeedVenueField): pfad is SeedSharedField =>
  SEED_VENUE_OWNER[VENUE_PFAD[pfad]] === 'shared'

/**
 * Eine Rueckmeldung in den Seed einarbeiten — nach Eigentum je Feld.
 *
 * Domaenen-Listen (`cameras`, `fixtures`, `devices`/`cables`) gehoeren je
 * genau einer App; sie werden ersetzt wie bisher, und ein Widerspruch kann
 * dort gar nicht entstehen. Der Raum laeuft durch die Regel.
 *
 * Die Revision bleibt stehen: die Aenderung kommt aus einem Planer, der
 * bereits auf diesem Stand aufsetzte, und darf kein erneutes Befuellen
 * ausloesen (Echo-Schleife).
 */
export function mergeSeedPatch(seed: SuiteSeed, patch: SeedPatch): SeedMerge {
  if (patch.revision !== seed.revision) return { seed, conflicts: [] }

  const conflicts: SeedConflict[] = []
  let naechster = seed

  // ── Der Raum: das einzige Geteilte, also durch die Regel ─────────────────
  if (patch.venue) {
    const schreiber: SeedWriter = patch.domain
    const at = patch.at ?? 0
    let venue = seed.venue
    let holds = seed.holds
    let geaendert = false

    for (const [pfad, feld] of Object.entries(VENUE_PFAD) as [SeedVenueField, keyof SeedVenue][]) {
      const vorschlag = patch.venue[feld]
      // `undefined` heisst „keine Aussage", nicht „leeren". Ein Planer, der
      // ein Feld nicht kennt, darf es nicht loeschen.
      if (vorschlag === undefined) continue
      const bisher = venue[feld]

      if (!istGeteilt(pfad)) {
        // Stufe 1: das Feld hat genau einen Eigentuemer.
        const eigner = SEED_VENUE_OWNER[feld] as SeedWriter
        if (eigner === schreiber) {
          if (!gleich(bisher, vorschlag)) {
            venue = { ...venue, [feld]: vorschlag }
            geaendert = true
          }
        } else if (!gleich(bisher, vorschlag)) {
          // Ein Vorschlag von aussen, und er widerspricht. Ohne diese Meldung
          // waere „gehoert der Shell" eine Behauptung, die niemand pruefen
          // kann — und der Planer saehe seine Korrektur verschwinden.
          conflicts.push({
            field: pfad,
            held: { value: bisher, by: eigner },
            proposed: { value: vorschlag, by: schreiber, at },
          })
        }
        continue
      }

      // Stufe 2: geteilt — wer zuerst setzt, haelt.
      const halter = seed.holds?.[pfad]
      if (halter && halter.by !== schreiber && !gleich(bisher, vorschlag)) {
        conflicts.push({
          field: pfad,
          held: { value: bisher, by: halter.by, at: halter.at },
          proposed: { value: vorschlag, by: schreiber, at },
        })
        continue
      }
      if (!gleich(bisher, vorschlag)) {
        venue = { ...venue, [feld]: vorschlag }
        geaendert = true
      }
      if (!halter) {
        // Erste Setzung: der Schreiber bekommt das Feld. Bestaetigt jemand
        // spaeter denselben Wert, wechselt der Halter NICHT — Zustimmung ist
        // keine Uebernahme.
        const neu: SeedHold = { by: schreiber, at }
        holds = { ...holds, [pfad]: neu }
        geaendert = true
      } else if (halter.by === schreiber && halter.at !== at) {
        holds = { ...holds, [pfad]: { by: schreiber, at } }
        geaendert = true
      }
    }

    if (geaendert) naechster = { ...naechster, venue, holds }
  }

  // ── Die Domaenen-Listen: je genau ein Eigentuemer ────────────────────────
  switch (patch.domain) {
    case 'cameras':
      if (patch.cameras) naechster = { ...naechster, cameras: patch.cameras }
      break
    case 'fixtures':
      if (patch.fixtures) naechster = { ...naechster, fixtures: patch.fixtures }
      break
    case 'signal':
      if (patch.devices || patch.cables) {
        naechster = {
          ...naechster,
          devices: patch.devices ?? naechster.devices,
          cables: patch.cables ?? naechster.cables,
        }
      }
      break
  }

  return { seed: naechster, conflicts }
}

/**
 * Einen Befund aufloesen, indem der Vorschlag angenommen wird: der Wert zieht
 * ein, und bei einem geteilten Feld wechselt der Halter zum Vorschlagenden.
 * Das ist die einzige Art, wie ein gehaltenes Feld die Stelle wechselt —
 * ausdruecklich und von Hand.
 *
 * Bei einem statisch besessenen Feld bleibt der Eigentuemer, wer er ist: der
 * Wert aendert sich, die Zustaendigkeit nicht. Sonst haette ein Planer sich
 * ueber einen angenommenen Vorschlag den Raum-Namen aneignen koennen.
 */
export function acceptProposal(seed: SuiteSeed, conflict: SeedConflict): SuiteSeed {
  const feld = VENUE_PFAD[conflict.field]
  const venue = { ...seed.venue, [feld]: conflict.proposed.value }
  if (!istGeteilt(conflict.field)) return { ...seed, venue }
  return {
    ...seed,
    venue,
    holds: { ...seed.holds, [conflict.field]: { by: conflict.proposed.by, at: conflict.proposed.at } },
  }
}

/** Kurzform fuer die Anzeige: `venue.widthM` → `widthM`. */
export const conflictFieldName = (field: SeedVenueField): keyof SeedVenue => VENUE_PFAD[field]
