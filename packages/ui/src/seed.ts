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
  /**
   * Haenge-Hoehe ueber dem Boden in Metern, WENN sie jemand gesetzt hat.
   *
   * Optional und nie erfunden: eine fehlende Hoehe heisst „nicht angegeben"
   * und nicht „haengt am Boden". Wer hier eine Vorgabe eintraegt, macht aus
   * einer UI-Voreinstellung des Planers eine Aussage ueber diese Show — und
   * die naechste App liest sie als gesetzt.
   *
   * Sie gehoert in den Seed und nicht nur in den Licht-Planer: sie entscheidet
   * ueber die Kabellaenge zum Scheinwerfer, und die Stueckliste zieht sie aus
   * demselben Projekt.
   */
  rigHeightM?: number
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

/**
 * Wer ein Feld schreiben darf. Die Shell ist eine Quelle wie ein Planer —
 * sie fuehrt den Raum-Namen und den Projektnamen selbst.
 */
export type SeedWriter = 'shell' | SeedDomain

/**
 * Wer ein geteiltes Feld gerade HAELT. `at` ist der Zeitpunkt der Setzung in
 * Epoch-Millisekunden, vom Schreiber gestempelt und nicht hier erzeugt: diese
 * Datei rechnet, sie liest keine Uhr (dieselbe Trennung wie beim
 * Ablauf-Import, `now()` wird hereingereicht).
 *
 * `at` entscheidet NICHT, wer gewinnt — es steht im Befund, damit jemand die
 * beiden Setzungen einordnen kann. „Letzter gewinnt mit Zeitstempel" ist
 * ausdruecklich die Regel, gegen die E-21 entschieden hat: sie macht aus einem
 * Widerspruch ein Rennen, dessen Ausgang von der Netzlaufzeit abhaengt.
 */
export interface SeedHold {
  by: SeedWriter
  at: number
}

/**
 * Die Felder, die mehr als eine App schreibt — und damit die einzigen, bei
 * denen ueberhaupt ein Widerspruch entstehen kann. Alles andere haengt an
 * genau einer Domaene und ist ueber `SeedPatch.domain` schon getrennt.
 *
 * Heute ist das der Raum: MultiCam vermisst ihn fuer die Sichtlinien, Licht
 * fuer die Rigging-Punkte. Beide duerfen ihn setzen, keiner still
 * ueberschreiben.
 */
export type SeedSharedField = 'venue.widthM' | 'venue.heightM' | 'venue.stage'

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
  /**
   * Wer welches geteilte Feld haelt. Fehlt ein Eintrag, haelt es niemand — der
   * naechste Schreiber bekommt es. Optional, damit ein Seed aus der Zeit vor
   * E-21 weiter gilt: kein Halter heisst „noch nicht beansprucht" und nicht
   * „ungueltig".
   */
  holds?: Partial<Record<SeedSharedField, SeedHold>>
  /**
   * WOHER dieser Stand kommt: die Domaene des Planers, dessen Meldung ihn
   * ausgeloest hat. Fehlt das Feld, kommt er aus der Shell selbst
   * (Projektwechsel, Undo, Kopf-Aenderung).
   *
   * ─── WARUM ES DAS BRAUCHT ────────────────────────────────────────────
   *
   * Die Echo-Schleife (Shell schiebt → Planer meldet → Shell schiebt
   * erneut → Planer ueberschreibt seine eigene neuere Arbeit) war bis
   * 2026-09-12 ueber die REVISION abgeschnitten: die Shell zaehlte sie beim
   * Einarbeiten einer Meldung nicht hoch. Das schnitt das Echo ab — und mit
   * ihm die Weitergabe. NUTZER-MELDUNG vom selben Tag: „wenn man im av
   * planner den cable planner oeffnet stehen dort andere kameras als im
   * multicam planner."
   *
   * Genau so war es: eine in MultiCam angelegte Kamera kam bis ins
   * Shell-Projekt und blieb dort stehen. Der Cable-Planner bekam nie einen
   * Seed mit hoeherer Revision und zeigte weiter seinen eigenen Stand. Die
   * Schleife war zu, aber die Suite war keine Suite mehr — jede App haette
   * genauso gut allein laufen koennen.
   *
   * Mit der Herkunft geht beides: die Revision zaehlt hoch (alle ANDEREN
   * Planer bekommen den Stand), und der MELDER erkennt seinen eigenen Hall
   * und uebernimmt ihn nicht.
   */
  origin?: SeedDomain
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
  /**
   * Zeitpunkt der Aenderung im Planer (Epoch-Millisekunden). Steht im Befund,
   * wenn zwei Apps dasselbe geteilte Feld verschieden setzen. Fehlt er, gilt
   * 0 — der Befund ist dann aermer, aber nicht falsch.
   */
  at?: number
  /**
   * Der Raum. Anders als die drei Domaenen-Listen gehoert er KEINEM Planer
   * allein (E-21): MultiCam und Licht vermessen beide, und bis 2026-09-08 ging
   * er nur hin und nie zurueck — wer die Halle im Planer korrigierte,
   * korrigierte sie nicht in der Shell (B-39, Punkt 1).
   *
   * Ein Planer darf ihn deshalb mit jeder Domaene mitschicken. Was damit
   * geschieht, entscheidet `mergeSeedPatch` nach Eigentum je Feld — nicht der
   * Empfaenger und nicht die Reihenfolge des Eintreffens.
   */
  venue?: SeedVenue
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

// Das Einarbeiten einer Rueckmeldung steht NICHT hier, sondern in
// `seedOwnership.ts` als `mergeSeedPatch`. Bis 2026-09-08 gab es an dieser
// Stelle ein `applySeedPatch`, das die gemeldete Domaene stillschweigend
// ersetzte. Das war richtig, solange jede Domaene genau einen Schreiber hatte
// — und falsch, sobald der Raum zurueckkommt, den zwei Planer bearbeiten.
//
// Die Funktion ist ersetzt und nicht daneben stehen geblieben: ein zweiter,
// stiller Weg ins selbe Ziel ist genau die Form, an der E-21 haengt. Wer den
// Rueckgabewert von `mergeSeedPatch` auf `.seed` verkuerzt, hat ihn wieder —
// darum gibt der Merge Befunde und Seed als EIN Ergebnis zurueck.
