/**
 * Die verbindlichen Oberflaechen-Werte der Suite — eine Quelle, alle Apps.
 *
 * ─── WOHER DIE ZAHLEN KOMMEN ───────────────────────────────────────────────
 *
 * Aus dem Brand Guide 2.0 der Lars Zumpe Medienproduktion (September 2026),
 * Seiten 8 (Farbe), 9 (Typografie), 10 (Raster, Linie, Punkt), 17 (Web —
 * Farbrollen, Interaktion, Bewegung). Diese Datei ist die maschinenlesbare
 * Fassung davon; `styles.css` liest daraus, und `test/brand.test.ts` haelt
 * beide zusammen.
 *
 * ─── WARUM ES DIESE DATEI GIBT ─────────────────────────────────────────────
 *
 * Vier Werkzeuge, vier Farbwelten. Der Cable-Planner rechnete in Tailwind-
 * `slate`, die Shell in einem eigenen Near-Black, MultiCam in `#0f1117`,
 * Light in wieder etwas anderem — und die Modul-Akzente liefen quer durch das
 * Farbrad (violett, cyan, amber, pink). Jede App fuer sich stimmig, zusammen
 * nicht eine Anwendung. Genau das war die Meldung: „die UI ist nicht
 * konsistent."
 *
 * ─── DIE ABWEICHUNGEN, BENANNT ─────────────────────────────────────────────
 *
 * Ein Marken-Handbuch ist fuer Drucksachen und Marketing-Seiten geschrieben,
 * nicht fuer ein Werkzeug mit Tabellen und neunzehn Panels. Wo wir abweichen,
 * steht es hier und in ADR-007 — nicht stillschweigend:
 *
 *  1. FLIESSTEXT. Der Guide nennt 16–18 px fuers Web. Eine Patchliste mit
 *     achtzig Zeilen ist damit nicht bedienbar. Wir fuehren ZWEI Leitern:
 *     Werkzeugflaechen (Tabellen, Panels, Formulare) 13 px, LESEflaechen
 *     (Hinweise, leere Zustaende, Dialog-Einleitung) 16 px — der Guide-Wert.
 *     Die Grenze ist „liest man, oder arbeitet man darin".
 *  2. ABGELEITETE FLAECHEN. Der Guide gibt fuer Dunkel zwei Flaechen an
 *     (Grund, Flaeche 2). Ein Control-Surface braucht mehr Stufen: versenkt
 *     (Leisten, Eingaben) und erhoben (Chips, Knoepfe). Die beiden sind aus
 *     der Navy-Rampe abgeleitet und unten als solche gekennzeichnet.
 *  3. SCHIEFER ALS TEXT. Im Guide ist Schiefer der Sekundaertext auf WEISS
 *     (5,4:1). Auf Navy waere er unlesbar. Auf Dunkel ist die gedaempfte
 *     Stufe deshalb Stahlblau, und Schiefer kommt nur im hellen Theme vor.
 *
 * ─── WAS NICHT VERHANDELBAR IST ────────────────────────────────────────────
 *
 * Tally-Rot ist das Signal, nicht eine Farbe: Fokusring, EIN Punkt am
 * primaeren Knopf, Aufnahme-/Live-Zustand. Nie Flaeche, nie Text, nie Rahmen,
 * nie zweimal in einem Sichtfeld. Und: keine Rundungen, keine Schatten, keine
 * Verlaeufe (Guide S. 10, „Was es nicht gibt"). Struktur entsteht durch Linie
 * und Weissraum.
 */

/** Die Palette des Handbuchs, mit der Rolle, die ihr dort zugewiesen ist. */
export const BRAND_COLORS = {
  /** Primaerfarbe, Flaechen, Text auf Hell, Logo. */
  zumpeNavy: '#1D324F',
  /** Video, Bildflaechen, Tiefe — im Web der Seitengrund. */
  deepNavy: '#132040',
  /** Print-Hintergrund; im Dunkeln der Text und der primaere Knopf. */
  offWhite: '#F6F5F0',
  /** Ruhige Flaechen, Tabellenkoepfe, Karten; auf Dunkel der Fliesstext. */
  eisblau: '#E1ECEF',
  /** Linien, Kicker auf Navy — nie Fliesstext. */
  stahlblau: '#8C9CB3',
  /** Sekundaertext auf Weiss (5,4:1) — nur im hellen Theme. */
  schiefer: '#5C6B85',
  /** Das Signal. Siehe Kopfkommentar: nie Flaeche, nie Text. */
  tallyRot: '#D6402E',
} as const

/** Nur fuer Formularmeldungen (Guide S. 17, „Status"). */
export const BRAND_STATUS = {
  ok: '#2F7D5C',
  warn: '#C8892B',
  danger: '#B04A3F',
} as const

/**
 * Aus der Navy-Rampe ABGELEITET — im Handbuch gibt es dafuer keinen Wert.
 * Versenkt liegt unter dem Grund (Leisten, Eingabefelder), erhoben darueber
 * (Chips, Knoepfe, Hover).
 */
export const DERIVED_SURFACES = {
  /** Unter dem Grund: Leisten, Rail, Eingaben. */
  darkSunken: '#0E1930',
  /** Zwischen Grund und Flaeche: Panels. */
  darkPanel: '#182948',
  /** Ueber der Flaeche: Chip, Knopf, Hover. */
  darkRaised: '#24405F',
  /** Gedaempfter Text auf Dunkel, unter Stahlblau. */
  darkFaint: '#6E7F99',
  /** Helles Theme: reine Kartenflaeche ueber Off-White. */
  lightCard: '#FFFFFF',
} as const

/** Linien. Der Guide gibt beide Deckungen ausdruecklich an (S. 17). */
export const BRAND_LINES = {
  onDark: 'rgba(246, 245, 240, 0.14)',
  onDarkStrong: 'rgba(246, 245, 240, 0.35)',
  onLight: 'rgba(29, 50, 79, 0.16)',
  onLightStrong: 'rgba(29, 50, 79, 0.32)',
} as const

/**
 * Zwei Leitern, ein Grund: siehe Abweichung 1 im Kopfkommentar.
 * Werte in Pixeln.
 */
export const TYPE_SCALE = {
  /** Kicker/Label: Bold, Versalien, weit gesperrt. Guide: 12–14 px. */
  kicker: 12,
  /** Meta, Zahlen in Chips — unter dem Fliesstext, nie fuer Saetze. */
  micro: 11,
  /** Werkzeugflaechen: Tabellen, Panels, Formulare. Abweichung 1. */
  body: 13,
  /** Leseflaechen: Hinweise, leere Zustaende, Dialog-Einleitung. Guide-Wert. */
  read: 16,
  /** Zwischentitel. Guide: 18–26 px. */
  title: 20,
  /** Dialog-/Ansichtstitel. */
  display: 26,
} as const

/** Kicker sind gesperrt (Guide: +160 bis +220 /1000 em). */
export const KICKER_TRACKING_EM = 0.16

/** 8-px-Raster (Guide S. 10, Web). Werte in Pixeln. */
export const SPACE = [4, 8, 12, 16, 24, 32, 48] as const

/**
 * „Die Marke bewegt sich wie ein Schnitt: schnell, kurz, dann still."
 * (Guide S. 11 und S. 17.)
 */
export const MOTION = {
  easing: 'cubic-bezier(.2,.8,.2,1)',
  durationMs: 350,
  maxDurationMs: 450,
} as const

/** Tastatur-Fokus: 2 px Rot, 3 px Abstand (Guide S. 17). */
export const FOCUS = { widthPx: 2, offsetPx: 3, color: BRAND_COLORS.tallyRot } as const

/**
 * Keine Rundungen (Guide S. 10). Die Namen bleiben, damit kein Aufrufer
 * umgebaut werden muss — der Wert ist ueberall null.
 */
export const RADIUS_PX = 0

/** Web-Raster: 12 Spalten, max. 1280 px, 24 px Steg (Guide S. 10). */
export const GRID = { columns: 12, maxWidthPx: 1280, gutterPx: 24 } as const

/**
 * Schriftfamilie. Public Sans ist SIL OFL und damit frei — bis sie als
 * WOFF2 mitgeliefert wird, gilt die Ersatzkette, die der Guide selbst als
 * „Web-Fallback" nennt (S. 9). Open Sans kommt NIRGENDS im Layout vor: sie
 * ist im Logo eine Kontur, keine Schrift.
 */
export const FONT_SANS =
  "'Public Sans', system-ui, 'Segoe UI', Roboto, Arial, sans-serif"

/** Zahlen in Tabellen laufen tabellarisch — sonst springen die Spalten. */
export const FONT_MONO =
  "ui-monospace, 'SF Mono', 'JetBrains Mono', 'Cascadia Code', Menlo, Consolas, monospace"
