// ───────────────────────────────────────────────────────────────────────────
// Das Gebaeude, so weit der Show-Plan es braucht (ADR-006, Schritt 2).
//
// Dieses Paket ist die Vorstufe von `larszu/facility-planner`. ADR-006 sagt
// die Reihenfolge: „Paket vor Repo. Erst die Domaene in ein `@avplan/*`-Paket
// schneiden, das der Planer benutzt — noch im selben Repo. Bricht dabei etwas,
// bricht es sichtbar und an einer Stelle."
//
// ─── WAS HIER NICHT STEHT, UND WARUM ───────────────────────────────────────
//
// Kein Bus-Modell (KNX-Gruppenadressbaum, DALI-Vorschaltgeraete), keine
// Pruefprotokolle nach Norm, keine Wartungshistorie, keine Grundriss-Geometrie.
// Das alles gehoert dem Gebaeude-Werkzeug und nicht diesem Vertrag. Hier steht
// nur, was der Show-Plan FRAGT — sechs Fragen, aufgezaehlt im ADR, und was
// zu ihrer Beantwortung noetig ist.
//
// Wer hier ein Feld ergaenzt, das keine der sechs Fragen beantwortet, hat das
// Werkzeug angefangen und nicht den Vertrag. Der Waechter in
// `test/vertrag.test.ts` misst die Fragen gegen das ADR; das Modell misst er
// nicht — dafuer steht dieser Absatz.
// ───────────────────────────────────────────────────────────────────────────

/**
 * Wie man an einem Punkt ansteckt. Geschlossene Liste, weil der Plan darauf
 * seine eigene Steckerseite abbildet — ein freier Text waere an dieser Stelle
 * ein Namensvergleich mit anderen Mitteln (ADR-002).
 */
export type Anschlussart = 'cee63' | 'cee32' | 'cee16' | 'powerlock' | 'klemme' | 'schuko'

/** Netzform der Anlage. Entscheidet, ob ein Trenntrafo noetig ist. */
export type Netzform = 'TN-S' | 'TN-C-S' | 'TT' | 'IT'

/** Ausloesecharakteristik des Leitungsschutzschalters. */
export type Charakteristik = 'B' | 'C' | 'D'

/**
 * Fehlerstromschutz-Typ. `keiner` ist eine ANGABE und nicht die Abwesenheit
 * einer Angabe — wer es nicht weiss, laesst den Punkt weg, statt `keiner` zu
 * schreiben.
 */
export type RcdTyp = 'A' | 'F' | 'B' | 'keiner'

/** Montageart einer Dose. Nur fuer `art: 'dose'` sinnvoll. */
export type Montage = 'up' | 'ap' | 'boden' | 'bruestung'

/**
 * Ein Punkt, an dem der Show-Aufbau Strom bekommt.
 *
 * Einspeisung (der CEE-63-Abgang am Schaltschrank) und Dose (die UP-Dose in
 * der Wand) sind hier EIN Typ mit einem Unterscheidungsfeld, weil der Plan
 * dieselben sechs Angaben von beiden braucht. Zwei Typen haetten dieselben
 * Felder zweimal gefuehrt — und die zweite Fassung waere die gewesen, die
 * beim naechsten Feld vergessen wird.
 */
export interface Anschlusspunkt {
  id: string
  bezeichnung: string
  art: 'einspeisung' | 'dose'
  /** Raum, in dem der Punkt sitzt — verweist auf `Raum.id`. */
  raumId: string
  anschlussart: Anschlussart
  netzform: Netzform
  /** Nennstrom der Absicherung in Ampere. */
  absicherungA: number
  charakteristik: Charakteristik
  rcdTyp: RcdTyp
  /**
   * Zulaessige DAUERLEISTUNG in Watt — falls das Gebaeude sie angibt.
   *
   * OPTIONAL, und das ist der Kern: sie ist NICHT `absicherungA × Spannung`.
   * Der Nennstrom ist die Ausloeseschwelle, nicht die Belastbarkeit;
   * Leitungslaenge, Haeufung, Umgebungstemperatur und Gleichzeitigkeit gehen
   * ein. Wer die Zahl rechnet, wo sie fehlt, liefert eine Vermutung, die als
   * Messung gelesen wird — siehe `belastbarkeit()`.
   */
  dauerleistungW?: number
  /** Stromkreis, an dem der Punkt haengt — verweist auf `Stromkreis.id`. */
  stromkreisId?: string
  montage?: Montage
  /** Der Punkt haengt an einer Schaltstelle (Lichtschalter, Zeitschaltuhr). */
  geschaltet?: boolean
  /** Der Punkt haengt an einem Dimmer. Fuer ein Netzteil unbrauchbar. */
  gedimmt?: boolean
  /** Was dort dauerhaft angeschlossen ist, wenn der Punkt belegt ist. */
  belegtDurch?: string
  /** Freitext des Betreibers („nur bis 10 A", „nur Reinigung"). */
  hinweis?: string
}

/**
 * Ein Stromkreis des Gebaeudes — die Abgangsklemme im Schaltschrank.
 *
 * NICHT zu verwechseln mit dem Stromkreis der Show (`cable-planner`
 * `types/circuit.ts`): der wird am Abbautag wieder eingepackt, dieser bleibt.
 * Die Grenze steht in ADR-006 unter „Wo die Grenze zwischen den beiden
 * Strom-Zeilen liegt".
 */
export interface Stromkreis {
  id: string
  bezeichnung: string
  /** Verteilung/Schaltschrank, aus dem der Kreis kommt. */
  verteilungId: string
  /**
   * Der Fehlerstromschutzschalter, hinter dem der Kreis haengt. Mehrere Kreise
   * teilen sich ueblicherweise einen — genau das beantwortet
   * `kreisGeschwister()`.
   */
  rcdId?: string
  absicherungA?: number
  charakteristik?: Charakteristik
}

/** Schaltschrank oder Unterverteilung — das erste Modell aus Issue #665. */
export interface Verteilung {
  id: string
  bezeichnung: string
  raumId: string
  art: 'schaltschrank' | 'unterverteilung'
}

/** Ein Raum des Gebaeudes, mit dem Bezeichner DES HAUSES. */
export interface Raum {
  id: string
  name: string
  etage?: string
  /**
   * Der Bezeichner, unter dem das Haus diesen Raum fuehrt (TIA-606, hauseigenes
   * Schema, Tuerschild). Der Plan zeigt ihn an und druckt ihn; er erfindet
   * keinen eigenen.
   */
  hausbezeichner: string
}

/** Bussystem einer Haussteuerung. Erweiterbar, aber aufgezaehlt. */
export type Steuersystem = 'knx' | 'dali' | 'crestron' | 'vissonic' | 'sonstige'

/**
 * Eine benannte Klinke der Haussteuerung (Issue #667).
 *
 * DAS BUS-MODELL BLEIBT DRAUSSEN. Der Plan will wissen, was er ansprechen darf
 * und was das bewirkt — nicht, wie die Gruppenadressen des Hauses strukturiert
 * sind. Eine Klinke ist deshalb ein Vertragsgegenstand: jemand hat sie
 * freigegeben und beschrieben.
 */
export interface Steuerklinke {
  id: string
  system: Steuersystem
  /** Adresse im jeweiligen System (KNX-Gruppenadresse, DALI-Kurzadresse, …). */
  adresse: string
  richtung: 'lesen' | 'schalten'
  /** Was passiert, wenn man sie benutzt. Klartext, vom Betreiber. */
  bedeutung: string
}

/** Eine fest verlegte Strecke des Hauses (Tie-Line, Leerrohr, Steigleitung). */
export interface HausStrecke {
  id: string
  bezeichnung: string
  vonRaumId: string
  nachRaumId: string
}

/**
 * Die ERKLAERTE Entsprechung zwischen einem Kabel des Plans und einer Strecke
 * des Hauses (ADR-002).
 *
 * Sie steht als Datensatz da, weil sie nur so entstehen kann: ein Mensch hat
 * gesagt, dass dieses Plan-Kabel diese Hausstrecke benutzt. Ein Namensvergleich
 * waere geraten, und geraten sieht hier genauso aus wie gewusst.
 */
export interface Zuordnung {
  planKabelId: string
  hausStreckeId: string
  /** Wer die Zuordnung erklaert hat — der Beleg, nicht die Zierde. */
  erklaertVon?: string
}

/** Ein gemeldeter Mangel am Gebaeude — der einzige Rueckweg des Plans. */
export interface Mangel {
  id: string
  /** Id des Gebaeude-Objekts (Punkt, Kreis, Klinke, Strecke, Verteilung). */
  hausObjektId: string
  befund: string
  /** ISO-Zeitpunkt. Wird ANGEGEBEN — dieses Paket liest keine Uhr. */
  gemeldetAm: string
  gemeldetVon?: string
}

/**
 * Das Gebaeude, wie der Vertrag es sieht.
 *
 * `hausForeign` ist die ADR-005-Stelle: was das Gebaeude-Werkzeug schickt und
 * dieser Vertrag nicht kennt, wird unveraendert mitgefuehrt statt verworfen.
 * Ohne das Feld verliert jede Runde durch den Planer die Haelfte der Datei —
 * und zwar still.
 */
export interface Gebaeude {
  id: string
  name: string
  raeume: Raum[]
  punkte: Anschlusspunkt[]
  stromkreise: Stromkreis[]
  verteilungen: Verteilung[]
  klinken: Steuerklinke[]
  strecken: HausStrecke[]
  zuordnungen: Zuordnung[]
  maengel: Mangel[]
  hausForeign?: Record<string, unknown>
}

/** Ein leeres Gebaeude — Ausgangspunkt und Vorgabe fuer Tests. */
export const leeresGebaeude = (id: string, name: string): Gebaeude => ({
  id,
  name,
  raeume: [],
  punkte: [],
  stromkreise: [],
  verteilungen: [],
  klinken: [],
  strecken: [],
  zuordnungen: [],
  maengel: [],
})
