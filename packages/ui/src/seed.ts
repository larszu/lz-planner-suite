// ───────────────────────────────────────────────────────────────────────────
// `suite-seed` v1 — das neutrale Projektmodell, das die Shell in die
// eingebetteten Planer schiebt und aus ihnen zurueckbekommt.
//
// WARUM ES DAS BRAUCHT. Bis hierher war die Einbettung eine reine
// Anzeige-Beziehung: `PlannerFrame` reichte eine URL und ein Theme hinein, die
// Brueckendatei der Shell (`embed/plannerBridge.ts`) trug genau zwei Befehle,
// `undo` und `redo`. Wer die gebaute Suite oeffnete und auf „Signal" klickte,
// sah links die Geraete des Shell-Projekts und in der Mitte einen leeren
// Cable-Planer mit seinem Erst-Start-Dialog. Beide Haelften waren fuer sich
// richtig und wussten nichts voneinander (Backlog B-20).
//
// WARUM NEUTRAL UND NICHT `.avplan`. Es gibt bereits ein gemeinsames
// Gesamtformat: `.avplan` (`venue` + die Domaenen-Slots `cameras`, `lighting`,
// `cabling`). Dessen Slots tragen aber jeweils das NATIVE Projekt der
// jeweiligen App — der `cabling`-Slot ist ein vollstaendiges
// `CablePlannerProject`. Damit die Shell eine `.avplan` erzeugen koennte,
// muesste sie die drei nativen Datenmodelle kennen und nachbauen; jede
// Modell-Aenderung in einem Planer wuerde die Shell brechen.
//
// Dieses Format geht den anderen Weg: es beschreibt nur das, was die Shell
// ohnehin fuehrt (Raum, Kameras, Leuchten, Signalknoten, Kabel), und die
// Abbildung auf das native Modell macht jeder Planer selbst — dort, wo sein
// Modell und sein Geraete-Katalog liegen. Das ist dieselbe Arbeitsteilung, die
// `multicamCameraImport.ts` im Cable-Planer schon fuer die `camera-list`
// benutzt: die importierende App besitzt die Abbildung.
//
// WAS ES BEWUSST NICHT KANN. Es ist kein Austauschformat fuer Dateien und
// tritt nicht neben `.avplan`. Es faehrt ueber den postMessage-Bus zwischen
// Shell und iframe und traegt nur Felder, fuer die die Shell eine Quelle hat.
// Alles, was ein Planer daraus baut, ist damit ausdruecklich ein SEED und
// keine Datenblatt-Wahrheit — die Planer markieren das entsprechend
// (`portsUnknown` im Cable-Planer), statt Ports zu erfinden.
// ───────────────────────────────────────────────────────────────────────────

export const SUITE_SEED_KIND = 'suite-seed' as const
export const SUITE_SEED_VERSION = 1 as const

/** Der geteilte Raum. Masse in Metern. */
export interface SeedVenue {
  name: string
  widthM?: number
  heightM?: number
  /** Buehnenflaeche in Metern, Ursprung links oben wie im Shell-Plan. */
  stage?: { x: number; y: number; w: number; h: number }
}

export interface SeedCamera {
  id: string
  name: string
  model?: string
  lens?: string
  focalMm?: number
  hfovDeg?: number
  /** Position im Raum (Meter). */
  x?: number
  y?: number
}

export interface SeedFixture {
  id: string
  name: string
  model?: string
  /** Freitext-Zweck („Key Host", „Fill", „Backlight"). */
  purpose?: string
  /** Dimmer-Stellung in Prozent (0..100). */
  dimmerPct?: number
  dmxChannel?: number
  universe?: number
  x?: number
  y?: number
}

/**
 * Ein Knoten im Signalfluss. Absichtlich ohne Ports: die Shell kennt keine
 * Port-Belegung, und eine erfundene waere eine plausible-aber-falsche Tatsache,
 * die still in Stueckliste und Patchliste eingeht. Der Cable-Planer loest den
 * Namen gegen seinen Katalog auf und markiert, was er nicht aufloesen konnte.
 */
export interface SeedDevice {
  id: string
  name: string
  /** Zweite Zeile am Knoten („3x SDI Out"). Beschreibung, keine Port-Angabe. */
  subtitle?: string
  model?: string
  /** Normalisierte Lage im Signalfluss-Diagramm (0..1), wie die Shell sie fuehrt. */
  nx?: number
  ny?: number
  /** Lage im Raum (Meter), falls das Geraet im Venue steht. */
  x?: number
  y?: number
}

export interface SeedCable {
  id: string
  label: string
  /** Kabeltyp als Klartext, wie ihn die Shell fuehrt („12G-SDI", „DMX512"). */
  type: string
  lengthM?: number
  /** Verweise auf `SeedDevice.id`. */
  from: string
  to: string
}

export interface SuiteSeed {
  kind: typeof SUITE_SEED_KIND
  formatVersion: typeof SUITE_SEED_VERSION
  /**
   * Zaehlt hoch, sobald sich der Inhalt in der Shell aendert. Der Planer
   * uebernimmt einen Seed nur, wenn dessen Revision neuer ist als die zuletzt
   * uebernommene — sonst wuerde jede Rueckmeldung, die die Shell erneut senden
   * laesst, die Arbeit im Planer ueberschreiben (Echo-Schleife).
   */
  revision: number
  /** Name des Projekts in der Shell — nur zur Anzeige im Planer. */
  projectName?: string
  venue: SeedVenue
  cameras: SeedCamera[]
  fixtures: SeedFixture[]
  devices: SeedDevice[]
  cables: SeedCable[]
}

/**
 * Welcher Planer welchen Teil besitzt. Ein Planer meldet ausschliesslich
 * seine eigene Domaene zurueck; alles andere reicht er unveraendert durch.
 */
export type SeedDomain = 'cameras' | 'fixtures' | 'signal'

/**
 * Rueckweg: was ein Planer nach einer Aenderung ueber seinen Teil meldet.
 * `revision` ist die Revision des Seeds, auf dem die Aenderung aufsetzt — die
 * Shell verwirft eine Meldung, die auf einem ueberholten Seed beruht, statt
 * neueren Inhalt damit zu ueberschreiben.
 */
export interface SeedPatch {
  domain: SeedDomain
  revision: number
  cameras?: SeedCamera[]
  fixtures?: SeedFixture[]
  devices?: SeedDevice[]
  cables?: SeedCable[]
}

/** Leerer Seed — Ausgangspunkt fuer Tests und fuer „kein Projekt offen". */
export function emptySeed(revision = 0): SuiteSeed {
  return {
    kind: SUITE_SEED_KIND,
    formatVersion: SUITE_SEED_VERSION,
    revision,
    venue: { name: '' },
    cameras: [],
    fixtures: [],
    devices: [],
    cables: [],
  }
}

/** Formprüfung fuer alles, was ueber den Bus hereinkommt. */
export function isSuiteSeed(value: unknown): value is SuiteSeed {
  if (!value || typeof value !== 'object') return false
  const s = value as Partial<SuiteSeed>
  return (
    s.kind === SUITE_SEED_KIND &&
    s.formatVersion === SUITE_SEED_VERSION &&
    typeof s.revision === 'number' &&
    !!s.venue &&
    Array.isArray(s.cameras) &&
    Array.isArray(s.fixtures) &&
    Array.isArray(s.devices) &&
    Array.isArray(s.cables)
  )
}

/**
 * Wieviel Inhalt traegt dieser Seed? Die Zahl ist die Entscheidungsgrundlage
 * fuer „lohnt es, den Planer damit zu befuellen" — und die Groesse, die der
 * Smoke-Test misst, damit ein leer bleibender Planer wieder auffaellt.
 */
export function seedContentCount(seed: SuiteSeed): number {
  return seed.cameras.length + seed.fixtures.length + seed.devices.length + seed.cables.length
}

/**
 * Eine Rueckmeldung in den Seed einarbeiten. Nur die Domaene des Patches wird
 * ersetzt; die anderen bleiben, wie sie waren. Die Revision bleibt stehen — die
 * Aenderung kommt aus einem Planer, der bereits auf diesem Stand aufsetzte, und
 * darf deshalb kein erneutes Befuellen ausloesen.
 */
export function applySeedPatch(seed: SuiteSeed, patch: SeedPatch): SuiteSeed {
  if (patch.revision !== seed.revision) return seed
  switch (patch.domain) {
    case 'cameras':
      return patch.cameras ? { ...seed, cameras: patch.cameras } : seed
    case 'fixtures':
      return patch.fixtures ? { ...seed, fixtures: patch.fixtures } : seed
    case 'signal':
      return {
        ...seed,
        devices: patch.devices ?? seed.devices,
        cables: patch.cables ?? seed.cables,
      }
    default:
      return seed
  }
}
