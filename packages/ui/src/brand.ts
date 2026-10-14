/**
 * Die verbindlichen Oberflaechen-Werte der Suite — eine Quelle, alle Apps.
 *
 * ─── WOHER DIE ZAHLEN KOMMEN ───────────────────────────────────────────────
 *
 * ADR-007 (geaendert 2026-10-13). Palette, Logo und Claim aus dem Brand
 * Guide 2.0 der Lars Zumpe Medienproduktion; Flaechen, Form, Tiefe und
 * Bewegung nach dem Design-Vertrag Oktober 2026 (Skill lzm-web). Diese Datei
 * ist die maschinenlesbare Fassung; `styles.css` traegt dieselben Werte, und
 * `test/brand.test.ts` haelt beide zusammen.
 *
 * ─── WOFUER ───────────────────────────────────────────────────────────────
 *
 * Fuer Code, der keine CSS-Variablen lesen kann: Canvas, Konva, Print,
 * SVG-Export. Er waehlt die Palette nach dem aufgeloesten Theme
 * (`paletteFor(theme)`), statt einen zweiten Satz Hexwerte zu fuehren.
 *
 * ─── WAS NICHT VERHANDELBAR IST ────────────────────────────────────────────
 *
 * Flaechen sind neutral, Markenblau ist nur Akzent. Tally-Rot ist das Signal,
 * nicht eine Farbe: Fokusring, Live/REC/Tally, Claim-Punkt, Erfolgsmoment.
 * Nie Flaeche, nie Text, nie Rahmen. Das Logo traegt nur Kit-Farben und haengt
 * nie am Akzent.
 */

/** Die Palette des Handbuchs. */
export const BRAND_COLORS = {
  /** Akzent auf Hell, Logo auf Hell. */
  zumpeNavy: '#1D324F',
  /** Text auf dem hellen Akzent im Dunkelmodus. */
  deepNavy: '#132040',
  /** Logo auf Dunkel, Text auf dem Akzent im Hellmodus. */
  offWhite: '#F6F5F0',
  eisblau: '#E1ECEF',
  stahlblau: '#8C9CB3',
  schiefer: '#5C6B85',
  /** Das Signal. Siehe Kopfkommentar: nie Flaeche, nie Text. */
  tallyRot: '#D6402E',
} as const

/** Nur fuer Meldungen, Badges, Validierung — in beiden Modi gleich. */
export const BRAND_STATUS = {
  ok: '#2F7D5C',
  warn: '#C8892B',
  danger: '#B04A3F',
} as const

/** Rollen einer Palette. Hell und Dunkel fuehren dieselben Schluessel. */
export interface ThemePalette {
  /** Grund (Seite, Canvas-Umfeld). */
  bg: string
  /** Flaeche: Panels, Karten. */
  surface: string
  /** Flaeche 2: Felder, Toolbars, Hover. */
  surface2: string
  /** Erhoben: Menues, Popover, Dialog. */
  raised: string
  /** Versenkt: Leisten, Rail. */
  sunken: string
  textStrong: string
  text: string
  textMuted: string
  line: string
  lineStrong: string
  /** Hauptknopf, Auswahl, Fortschritt, Links. */
  accent: string
  /** Text auf dem Akzent. */
  onAccent: string
  /** Akzent weich (Auswahl-Hinterlegung). */
  accentSoft: string
  /** Logo und Signet — nur Kit-Farben. Der Punkt ist immer `logoDot`. */
  logo: string
  logoDot: string
  signal: string
  ok: string
  warn: string
  danger: string
  /** Hintergrundschein: Akzent und Gold. */
  glow1: string
  glow2: string
}

/** Hell: neutrales warmes Fast-Weiss, Akzent Zumpe Navy. */
export const PALETTE_LIGHT: ThemePalette = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  surface2: '#F1F1EE',
  raised: '#FFFFFF',
  sunken: '#F4F4F1',
  textStrong: '#16181D',
  text: '#2B2E35',
  textMuted: '#6A6E77',
  line: 'rgba(22, 24, 29, 0.08)',
  lineStrong: 'rgba(22, 24, 29, 0.18)',
  accent: BRAND_COLORS.zumpeNavy,
  onAccent: BRAND_COLORS.offWhite,
  accentSoft: 'rgba(29, 50, 79, 0.10)',
  logo: BRAND_COLORS.zumpeNavy,
  logoDot: BRAND_COLORS.tallyRot,
  signal: BRAND_COLORS.tallyRot,
  ok: BRAND_STATUS.ok,
  warn: BRAND_STATUS.warn,
  danger: BRAND_STATUS.danger,
  glow1: 'rgba(29, 50, 79, 0.10)',
  glow2: 'rgba(200, 137, 43, 0.10)',
}

/** Dunkel: Anthrazit, nicht Schwarz und nicht Navy; Akzent helles Markenblau. */
export const PALETTE_DARK: ThemePalette = {
  bg: '#1E1F23',
  surface: '#28292E',
  surface2: '#33343A',
  raised: '#3B3C42',
  sunken: '#19191D',
  textStrong: '#F6F5F0',
  text: '#E6E6E3',
  textMuted: '#A9ACB4',
  line: 'rgba(246, 245, 240, 0.09)',
  lineStrong: 'rgba(246, 245, 240, 0.20)',
  accent: '#B9C7D8',
  onAccent: BRAND_COLORS.deepNavy,
  accentSoft: 'rgba(185, 199, 216, 0.12)',
  logo: BRAND_COLORS.offWhite,
  logoDot: BRAND_COLORS.tallyRot,
  signal: BRAND_COLORS.tallyRot,
  ok: BRAND_STATUS.ok,
  warn: BRAND_STATUS.warn,
  danger: BRAND_STATUS.danger,
  glow1: 'rgba(185, 199, 216, 0.16)',
  glow2: 'rgba(200, 137, 43, 0.10)',
}

/** Palette zum aufgeloesten Theme — fuer Canvas, Konva, Print, SVG. */
export function paletteFor(theme: 'light' | 'dark'): ThemePalette {
  return theme === 'dark' ? PALETTE_DARK : PALETTE_LIGHT
}

/** Linien je Modus (Kurzform von `PALETTE_*.line`). */
export const BRAND_LINES = {
  onLight: PALETTE_LIGHT.line,
  onLightStrong: PALETTE_LIGHT.lineStrong,
  onDark: PALETTE_DARK.line,
  onDarkStrong: PALETTE_DARK.lineStrong,
} as const

/**
 * Frueher die aus der Navy-Rampe abgeleiteten Dunkelflaechen. Der Name bleibt
 * fuer Aufrufer; die Werte sind die Anthrazit-Stufen von `PALETTE_DARK`.
 */
export const DERIVED_SURFACES = {
  darkSunken: PALETTE_DARK.sunken,
  darkPanel: PALETTE_DARK.surface,
  darkRaised: PALETTE_DARK.raised,
  darkFaint: PALETTE_DARK.textMuted,
  lightCard: PALETTE_LIGHT.surface,
} as const

/**
 * Zwei Leitern: Werkzeugflaechen (Tabellen, Panels, Formulare) 13 px,
 * Leseflaechen 16 px. Werte in Pixeln.
 */
export const TYPE_SCALE = {
  /** Overline/Badge: die einzige Stelle fuer Versalien (≤ 12 px). */
  kicker: 12,
  micro: 11,
  body: 13,
  read: 16,
  title: 20,
  display: 26,
} as const

/** Overlines sind leicht gesperrt. */
export const KICKER_TRACKING_EM = 0.08

/** 8-px-Raster. Werte in Pixeln. */
export const SPACE = [4, 8, 12, 16, 24, 32, 48] as const

/** Kurz und weich; Feder-Kurve nur fuer Erfolgsmomente, hoechstens 600 ms. */
export const MOTION = {
  easing: 'cubic-bezier(.2,.8,.2,1)',
  durationsMs: { fast: 120, medium: 220, slow: 360 },
  /** Standarddauer (Menues, Sheets). */
  durationMs: 220,
  maxDurationMs: 600,
} as const

/** Tastatur-Fokus: 2 px Signal, 2 px Abstand. */
export const FOCUS = { widthPx: 2, offsetPx: 2, color: BRAND_COLORS.tallyRot } as const

/** Rundungen in Pixeln. Logo, Tally-Punkt und Hardware-Symbole bleiben eckig. */
export const RADIUS = { s: 6, m: 10, l: 20, xl: 24, full: 999 } as const

/** Schatten je Modus — nur zum Trennen von Ebenen. */
export const SHADOWS = {
  light: {
    1: '0 1px 2px rgba(22, 24, 29, 0.06)',
    2: '0 4px 16px rgba(22, 24, 29, 0.08)',
    3: '0 16px 48px rgba(22, 24, 29, 0.14)',
  },
  dark: {
    1: '0 1px 2px rgba(0, 0, 0, 0.30)',
    2: '0 4px 16px rgba(0, 0, 0, 0.40)',
    3: '0 16px 48px rgba(0, 0, 0, 0.55)',
  },
} as const

/** Web-Raster: 12 Spalten, max. 1280 px, 24 px Steg. */
export const GRID = { columns: 12, maxWidthPx: 1280, gutterPx: 24 } as const

/** Public Sans, lokal ausgeliefert; die Ersatzkette nennt der Guide selbst. */
export const FONT_SANS =
  "'Public Sans Variable', 'Public Sans', system-ui, 'Segoe UI', Roboto, Arial, sans-serif"

/** Zahlen in Tabellen laufen tabellarisch — sonst springen die Spalten. */
export const FONT_MONO =
  "ui-monospace, 'SF Mono', 'JetBrains Mono', 'Cascadia Code', Menlo, Consolas, monospace"
