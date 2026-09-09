// ---------------------------------------------------------------------------
// B-18 / B-39 Punkt 5 — DER SPRUNG NIMMT DIE AUSWAHL MIT.
//
// Was vorher passierte: „Im Signal-Flow zeigen" rief `goToModule('signal')`.
// Das Modul wechselte, die Auswahl blieb zurueck, und der Nutzer stand vor
// einem fremden Plan und suchte von Hand nach dem Geraet, das er eben noch
// angeklickt hatte. Der Sprung war da, das Ziel nicht.
//
// ===========================================================================
// DIE ENTSPRECHUNG WIRD DEKLARIERT, NICHT GERATEN
// ===========================================================================
//
// Der Grund, dass das so lange offen war, steht in E-11: „es braucht einen
// gemeinsamen Id-Raum, sonst zeigt der Sprung ins Leere." Innerhalb EINES
// Gewerks gibt es ihn laengst — die Seed-Id ist unveraendert die Geraete-Id im
// Cable-Planner, die Kamera-Id im MultiCam-Planner, die Fixture-Id im
// Light-Planner. Die Cross-Links der Shell kreuzen aber die Gewerks-Grenze:
// eine Kamera (`cam2`) und ihr Knoten im Signalweg (`n_cam2`) sind dasselbe
// Blech in zwei Datensaetzen.
//
// Diese Bruecke koennte man aus dem Namen raten. Genau das tut hier nichts.
// `SignalNode.represents` sagt es AUS — und wo niemand es ausgesagt hat, gibt
// dieses Modul `undefined` zurueck und der Sprung bleibt ein blosser
// Modulwechsel. Das ist kein Mangel, sondern die einzige ehrliche Antwort:
// ein geratener Treffer saehe aus wie ein gelungener Sprung und zeigte dem
// Nutzer ein anderes Objekt, ohne dass er erfaehrt, dass geraten wurde
// (ADR-002).
//
// ===========================================================================
// WARUM DIE BITTE NICHT SOFORT FEUERT
// ===========================================================================
//
// Der Ziel-Planer steht beim Klick noch gar nicht: sein iframe wird erst durch
// den Modulwechsel gemountet und meldet sich Sekunden spaeter mit
// `avplan:ready`. Wer die Zeig-Bitte im selben Zug abschickt, schickt sie in
// den Rahmen, den der Nutzer gerade VERLAESST — oder ins Leere. Deshalb wird
// sie als OFFENE BITTE gehalten und erst zugestellt, wenn der Rahmen des
// Ziel-Moduls zuhoert. `zustellung` ist diese Entscheidung, als reine
// Funktion, damit sie pruefbar ist, ohne die halbe Shell zu rendern.
// ---------------------------------------------------------------------------
import type { SuiteProject } from '../data/project'
import type { ModuleId } from '../modules/registry'

/** Welches Gewerk ein Modul fuehrt — nur die drei, die Objekte besitzen. */
type Gewerk = 'camera' | 'fixture' | 'device'

const GEWERK: Partial<Record<ModuleId, Gewerk>> = {
  cameras: 'camera',
  licht: 'fixture',
  signal: 'device',
}

/**
 * Der Knoten im Signalweg, der erklaertermassen fuer diese Kamera / dieses
 * Fixture steht. `undefined` heisst „niemand hat es erklaert".
 */
export const knotenFuer = (
  project: SuiteProject,
  kind: 'camera' | 'fixture',
  id: string,
): string | undefined =>
  project.nodes.find((n) => n.represents?.kind === kind && n.represents.id === id)?.id

/**
 * Das Objekt des Ziel-Gewerks an einem Kabel: das Kabel haengt an zwei Knoten,
 * und einer davon steht vielleicht fuer eine Kamera.
 *
 * `from` vor `to` — willkuerlich, aber nicht folgenlos, deshalb steht es hier:
 * haengt ein Kabel zwischen zwei Kameras, zeigt der Sprung auf die Quelle.
 * Das ist die Seite, die das Signal erzeugt, und in einem Signalweg die
 * naheliegende Antwort auf „welche Kamera ist das".
 */
export const objektAmKabel = (
  project: SuiteProject,
  cableId: string,
  kind: 'camera' | 'fixture',
): string | undefined => {
  const kabel = project.cables.find((c) => c.id === cableId)
  if (!kabel) return undefined
  for (const knotenId of [kabel.from, kabel.to]) {
    const knoten = project.nodes.find((n) => n.id === knotenId)
    if (knoten?.represents?.kind === kind) return knoten.represents.id
  }
  return undefined
}

/**
 * Was im Ziel-Modul ausgewaehlt werden soll, wenn von `quelle` dorthin
 * gesprungen wird — oder `undefined`, wenn es dafuer keine erklaerte
 * Entsprechung gibt.
 *
 * Der Fall „Kamera -> Licht" ist bewusst leer und bleibt es: „das Licht am
 * Motiv dieser Kamera" ist kein Objekt, sondern eine Auswahl von mehreren,
 * und keine davon steht im Modell als DIE zugehoerige. Ein Sprung, der sich
 * eine aussucht, waere geraten.
 */
export const querziel = (
  project: SuiteProject | null,
  quelle: { modul: ModuleId; id: string | null },
  ziel: ModuleId,
): string | undefined => {
  if (!project || !quelle.id) return undefined
  const vonGewerk = GEWERK[quelle.modul]
  const nachGewerk = GEWERK[ziel]
  if (!vonGewerk || !nachGewerk || vonGewerk === nachGewerk) return undefined

  // Kamera/Fixture -> Signalweg: der Knoten, der dafuer steht.
  if (nachGewerk === 'device' && vonGewerk !== 'device') return knotenFuer(project, vonGewerk, quelle.id)

  // Signalweg -> Kamera/Licht: das Kabel haengt an einem Knoten, der dafuer
  // steht. (Im Signal-Modul ist das Ausgewaehlte ein Kabel.)
  if (vonGewerk === 'device' && nachGewerk !== 'device') return objektAmKabel(project, quelle.id, nachGewerk)

  return undefined
}

/** Eine Zeig-Bitte, die auf ihr Modul wartet. */
export interface OffeneBitte {
  modul: ModuleId
  id: string
}

/** Die Lage, in der ueber eine offene Bitte zu entscheiden ist. */
export interface Lage {
  /** Welches Modul gerade vorne steht. */
  modul: ModuleId
  /** Steht im aktuellen Modul ueberhaupt ein Planer-Rahmen? */
  planerOffen: boolean
  /** Hat sich ein Rahmen fuer Zeig-Bitten gemeldet (`avplan:ready` war da)? */
  rahmenHoert: boolean
}

export type Zustellung =
  /** Keine Bitte offen. */
  | { tun: 'nichts' }
  /** Jetzt zustellen. */
  | { tun: 'senden' }
  /** Der Rahmen laedt noch — spaeter noch einmal. */
  | { tun: 'warten' }
  /** Der Sprung ist vorbei: stumm fallen lassen. */
  | { tun: 'verwerfen' }

/**
 * Was mit einer offenen Bitte zu tun ist.
 *
 * Die Ausgaenge sind verschiedene Auskuenfte, und sie zusammenzuziehen waere
 * jedes Mal eine Luege:
 *
 *  - `verwerfen` ist der Nutzer, der weitergeklickt oder den Planer
 *    zugeklappt hat. Ihn jetzt noch zu behelligen waere Laerm ueber einen
 *    Sprung, den er selbst abgebrochen hat — und ZUZUSTELLEN waere schlimmer:
 *    die Bitte landete im falschen Modul oder im Nichts.
 *  - `warten` ist der Rahmen, der noch laedt. Das ist der Normalfall direkt
 *    nach dem Modulwechsel; hier zu melden hiesse, jeden zweiten Sprung als
 *    Fehlschlag auszugeben.
 *  - `senden` ist der Regelfall.
 *
 * WAS HIER NICHT ENTSCHIEDEN WIRD: der zugeklappte Planer im Augenblick des
 * Sprungs. Das ist keine Zustellung, sondern eine Annahme — siehe `annahme`.
 * Die Trennung ist nicht kosmetisch: dort ist der Nutzer gerade gesprungen und
 * will hoeren, dass sein Sprung nur bis zur Vorschau reicht; hier hat er
 * selbst etwas weggeklickt, und eine Meldung darueber waere Vorhaltung.
 */
export const zustellung = (bitte: OffeneBitte | null, lage: Lage): Zustellung => {
  if (!bitte) return { tun: 'nichts' }
  if (bitte.modul !== lage.modul) return { tun: 'verwerfen' }
  if (!lage.planerOffen) return { tun: 'verwerfen' }
  if (!lage.rahmenHoert) return { tun: 'warten' }
  return { tun: 'senden' }
}

export type Annahme =
  /** Eine Bitte anlegen; sie wartet auf den Rahmen des Ziel-Moduls. */
  | { tun: 'bitte' }
  /** Der Planer ist zugeklappt: sagen, dass der Sprung nur auswaehlt. */
  | { tun: 'melden' }
  /** Nichts weiter zu tun: die Auswahl IST der ganze Sprung. */
  | { tun: 'nichts' }

/**
 * Ob ein Sprung mit Ziel ueberhaupt eine Zeig-Bitte auszuloesen hat —
 * entschieden im Augenblick des Sprungs, wo der Nutzer noch hinsieht.
 *
 *  - Kein Planer im Ziel-Modul (Uebersicht, Board): die Auswahl ist der ganze
 *    Sprung. Die Shell zeigt sie in ihren eigenen Panels, und es gibt
 *    niemanden, den man noch bitten muesste. `nichts` ist hier kein
 *    Fehlschlag.
 *  - Planer da, aber zugeklappt: da kommt nichts mehr nach — kein Rahmen, der
 *    sich spaeter meldet. Der Sprung reicht bis zur Vorschau und nicht
 *    weiter, und das SAGT die Shell. Schweigen waere der stumme Sprung aus
 *    E-11: der Nutzer suchte in einem Planer nach etwas, das dort nie ankam.
 *  - Sonst: Bitte anlegen und auf den Rahmen warten.
 */
export const annahme = (lage: { hatPlaner: boolean; gemountet: boolean }): Annahme => {
  if (!lage.hatPlaner) return { tun: 'nichts' }
  if (!lage.gemountet) return { tun: 'melden' }
  return { tun: 'bitte' }
}
