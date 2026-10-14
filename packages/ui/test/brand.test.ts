import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  BRAND_COLORS,
  BRAND_STATUS,
  FOCUS,
  MOTION,
  PALETTE_DARK,
  PALETTE_LIGHT,
  RADIUS,
  SHADOWS,
  TYPE_SCALE,
  paletteFor,
} from '../src/brand'

// ───────────────────────────────────────────────────────────────────────────
// WARUM ES DAS GIBT
//
// 2026-09-07: „die ui ist nicht konsistent." Regeln, die nur in einem
// Dokument stehen, driften. Dieser Test haelt die drei Fassungen derselben
// Entscheidung zusammen: `brand.ts` (die Werte), `styles.css` (was der
// Browser sieht) und ADR-007 (warum).
//
// 2026-10-13 umgebaut auf das geaenderte ADR-007 (lz-planner-suite): neutrale
// Flaechen, Blau nur als Akzent, Hell UND Dunkel mit Umschalter, Rundungen
// und Schatten nur ueber Tokens. Er prueft nicht, ob die Werte huebsch sind,
// sondern dass es nur EINE Antwort gibt — in beiden Modi.
// ───────────────────────────────────────────────────────────────────────────

const lies = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const css = lies('../src/styles.css')
const umschalter = lies('../src/ThemeSwitch.tsx')

const blockAb = (start: number): string => css.slice(start, css.indexOf('}', start))
const block = (selector: string): string => {
  const i = css.indexOf(selector)
  return i < 0 ? '' : blockAb(i)
}
const lightBlock = block(':root {')
const darkBlock = block(":root[data-theme='dark'] {")
const autoDarkBlock = block(":root:not([data-theme='light']) {")

const wert = (b: string, name: string): string => {
  const m = b.match(new RegExp(`${name}:\\s*([^;]+);`))
  return m ? m[1].trim() : ''
}
const norm = (v: string) => v.replace(/\s/g, '').toUpperCase()

const ROLLEN: [string, keyof typeof PALETTE_LIGHT][] = [
  ['--av-bg', 'bg'],
  ['--av-surface-1', 'surface'],
  ['--av-surface-2', 'surface2'],
  ['--av-surface-3', 'sunken'],
  ['--av-surface-4', 'raised'],
  ['--av-text', 'textStrong'],
  ['--av-text-secondary', 'text'],
  ['--av-text-muted', 'textMuted'],
  ['--av-border', 'line'],
  ['--av-border-strong', 'lineStrong'],
  ['--av-accent', 'accent'],
  ['--av-accent-text', 'onAccent'],
  ['--av-logo', 'logo'],
  ['--av-glow-1', 'glow1'],
  ['--av-glow-2', 'glow2'],
]

describe('beide Modi stehen in styles.css so, wie brand.ts sie fuehrt', () => {
  it.each(ROLLEN)('hell: %s', (token, rolle) => {
    expect(norm(wert(lightBlock, token))).toBe(norm(PALETTE_LIGHT[rolle]))
  })

  it.each(ROLLEN)('dunkel: %s', (token, rolle) => {
    expect(norm(wert(darkBlock, token))).toBe(norm(PALETTE_DARK[rolle]))
  })

  it('Auto (System dunkel) und die ausdrueckliche Wahl Dunkel sind derselbe Block', () => {
    expect(autoDarkBlock).not.toBe('')
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    const ohneKopf = (b: string) => b.slice(b.indexOf('{') + 1).replace(/\s/g, '')
    expect(ohneKopf(autoDarkBlock)).toBe(ohneKopf(darkBlock))
  })

  it('Dunkel ist Anthrazit, nicht Navy — und Hell ist neutral', () => {
    expect(PALETTE_DARK.bg).toBe('#1E1F23')
    expect(PALETTE_LIGHT.bg).toBe('#FAFAF8')
    for (const p of [PALETTE_LIGHT, PALETTE_DARK]) {
      for (const f of [p.bg, p.surface, p.surface2, p.raised, p.sunken]) {
        expect([BRAND_COLORS.deepNavy, BRAND_COLORS.zumpeNavy]).not.toContain(f)
      }
    }
  })

  it('Blau ist der Akzent: Navy auf Hell, helles Markenblau auf Dunkel', () => {
    expect(PALETTE_LIGHT.accent).toBe(BRAND_COLORS.zumpeNavy)
    expect(PALETTE_DARK.accent).toBe('#B9C7D8')
    expect(PALETTE_DARK.onAccent).toBe(BRAND_COLORS.deepNavy)
  })

  it('paletteFor waehlt nach dem aufgeloesten Theme', () => {
    expect(paletteFor('light')).toBe(PALETTE_LIGHT)
    expect(paletteFor('dark')).toBe(PALETTE_DARK)
  })
})

describe('das Logo traegt nur Kit-Farben', () => {
  it('Navy auf Hell, Off-White auf Dunkel, der Punkt immer Tally-Rot', () => {
    expect(PALETTE_LIGHT.logo).toBe(BRAND_COLORS.zumpeNavy)
    expect(PALETTE_DARK.logo).toBe(BRAND_COLORS.offWhite)
    expect(PALETTE_LIGHT.logoDot).toBe(BRAND_COLORS.tallyRot)
    expect(PALETTE_DARK.logoDot).toBe(BRAND_COLORS.tallyRot)
    expect(wert(css, '--av-logo-dot')).toBe('var(--av-signal)')
  })

  it('haengt nicht am Akzent', () => {
    expect(wert(lightBlock, '--av-logo')).not.toContain('var(')
    expect(wert(darkBlock, '--av-logo')).not.toContain('var(')
    expect(PALETTE_DARK.logo).not.toBe(PALETTE_DARK.accent)
  })
})

describe('Rot ist das Signal, keine Farbe', () => {
  it('steht genau einmal in der Datei: in der Definition von --av-signal', () => {
    const rot = BRAND_COLORS.tallyRot.toLowerCase()
    const treffer = css
      .split('\n')
      .filter((z) => z.toLowerCase().includes(rot))
      .map((z) => z.trim())
    expect(treffer).toHaveLength(1)
    expect(treffer[0]).toMatch(/^--av-signal:/)
  })

  it('trennt Status von Signal — Fehlerrot ist ein anderer Ton', () => {
    expect(css).toContain(`--av-danger: ${BRAND_STATUS.danger}`)
    expect(BRAND_STATUS.danger).not.toBe(BRAND_COLORS.tallyRot)
  })

  it('wird nie als Flaeche, Text oder Rahmen eines Bedienelements verwendet', () => {
    expect(css).not.toMatch(/(?<!outline: 2px solid )(?:color|border(?:-[a-z]+)?):\s*var\(--av-signal\)/)
  })

  it('traegt den Fokusring — 2 px, 2 px Abstand', () => {
    expect(css).toContain(`outline: ${FOCUS.widthPx}px solid var(--av-signal)`)
    expect(css).toContain(`outline-offset: ${FOCUS.offsetPx}px`)
  })
})

describe('Rundungen und Schatten nur ueber Tokens', () => {
  it('die Radius-Tokens tragen die Vertragswerte', () => {
    expect(wert(css, '--av-r-s')).toBe(`${RADIUS.s}px`)
    expect(wert(css, '--av-r-m')).toBe(`${RADIUS.m}px`)
    expect(wert(css, '--av-r-l')).toBe(`${RADIUS.l}px`)
    expect(wert(css, '--av-r-xl')).toBe(`${RADIUS.xl}px`)
    expect(wert(css, '--av-r-full')).toBe(`${RADIUS.full}px`)
  })

  it('die alten Namen bleiben und zeigen auf die Stufen', () => {
    expect(wert(css, '--av-r-control')).toBe('var(--av-r-m)')
    expect(wert(css, '--av-r-card')).toBe('var(--av-r-l)')
    expect(wert(css, '--av-r-modal')).toBe('var(--av-r-xl)')
    expect(wert(css, '--av-r-pill')).toBe('var(--av-r-full)')
  })

  it('jedes border-radius ausserhalb der Token-Definition ist ein Token', () => {
    const roh = [...css.matchAll(/border-radius:\s*([^;!]+)/g)].map((m) => m[1].trim())
    expect(roh.length).toBeGreaterThan(0)
    for (const r of roh) expect(r).toMatch(/^var\(--av-r-[a-z-]+\)$/)
  })

  it('die Schatten-Tokens tragen die Werte je Modus', () => {
    for (const s of [1, 2, 3] as const) {
      expect(norm(wert(lightBlock, `--av-shadow-${s}`))).toBe(norm(SHADOWS.light[s]))
      expect(norm(wert(darkBlock, `--av-shadow-${s}`))).toBe(norm(SHADOWS.dark[s]))
    }
  })

  it('jedes box-shadow ist ein Token — einzige Ausnahme der Akzentschein am Hauptknopf', () => {
    const roh = [...css.matchAll(/box-shadow:\s*([^;]+)/g)].map((m) => m[1].trim())
    const fremd = roh.filter((r) => !/^var\(--av-shadow-[a-z0-9-]+\)$/.test(r))
    expect(fremd).toHaveLength(1)
    expect(fremd[0]).toContain('var(--av-accent)')
  })
})

describe('Hell und Dunkel sind umschaltbar: Auto · Hell · Dunkel', () => {
  it('der Umschalter fuehrt die drei Wahlen in dieser Folge', () => {
    const ids = [...umschalter.matchAll(/id: '(system|light|dark)'/g)].map((m) => m[1])
    expect(ids).toEqual(['system', 'light', 'dark'])
  })

  it('hat ein Stilblatt und ueberstimmt das System in beide Richtungen', () => {
    expect(css).toContain('.av-theme-switch')
    expect(css).toContain(":root[data-theme='light']")
    expect(css).toContain(":root[data-theme='dark']")
  })
})

describe('Bewegung: kurz und weich', () => {
  it('fuehrt Kurve und die drei Dauern als Token', () => {
    expect(wert(css, '--av-ease').replace(/\s/g, '')).toBe(MOTION.easing.replace(/\s/g, ''))
    expect(wert(css, '--av-dur-1')).toBe(`${MOTION.durationsMs.fast}ms`)
    expect(wert(css, '--av-dur-2')).toBe(`${MOTION.durationsMs.medium}ms`)
    expect(wert(css, '--av-dur-3')).toBe(`${MOTION.durationsMs.slow}ms`)
  })

  it('bleibt unter 600 ms und respektiert reduzierte Bewegung', () => {
    expect(MOTION.maxDurationMs).toBe(600)
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })
})

describe('die Typo-Leiter ist eine Leiter', () => {
  it('steigt lueckenlos', () => {
    const stufen = [TYPE_SCALE.micro, TYPE_SCALE.kicker, TYPE_SCALE.body, TYPE_SCALE.read, TYPE_SCALE.title, TYPE_SCALE.display]
    expect([...stufen].sort((a, b) => a - b)).toEqual(stufen)
    expect(new Set(stufen).size).toBe(stufen.length)
  })

  it('steht in styles.css mit denselben Werten', () => {
    expect(wert(css, '--av-fs-body')).toBe(`${TYPE_SCALE.body}px`)
    expect(wert(css, '--av-fs-read')).toBe(`${TYPE_SCALE.read}px`)
    expect(wert(css, '--av-fs-kicker')).toBe(`${TYPE_SCALE.kicker}px`)
  })

  it('Panel-Koepfe stehen in Satzschreibung — Versalien nur bis 12 px', () => {
    expect(block('.av-panel-title {')).not.toContain('text-transform: uppercase')
    expect(TYPE_SCALE.kicker).toBeLessThanOrEqual(12)
  })
})

describe('das Modul erkennt man am Titel, nicht am Farbton', () => {
  it('zeigt alle Modul-Akzente auf denselben Wert', () => {
    for (const m of ['raum', 'signal', 'cameras', 'licht', 'overview', 'board']) {
      expect(css).toContain(`--mod-${m}: var(--av-accent);`)
    }
  })
})

// ADR-007 Abschnitt 6 — der Rahmen. Die Optik hat sich am 2026-10-13
// geaendert, die Masse nicht.
describe('der Rahmen hat feste Masse', () => {
  it('Kopfzeile 40 px', () => {
    expect(block('.av-topbar {')).toContain('height: 40px')
  })

  it('Modul-Rail 56 px', () => {
    expect(block('.av-rail {')).toContain('width: 56px')
  })

  it('Statusleiste 24 px', () => {
    expect(block('.av-statusbar {')).toContain('height: 24px')
  })
})
