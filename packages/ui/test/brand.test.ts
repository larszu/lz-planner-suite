import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  BRAND_COLORS,
  BRAND_STATUS,
  DERIVED_SURFACES,
  FOCUS,
  MOTION,
  RADIUS_PX,
  TYPE_SCALE,
} from '../src/brand'

// ───────────────────────────────────────────────────────────────────────────
// Nutzer-Meldung: „die UI ist nicht konsistent. lege globale UI-Regeln fest,
// die für alle Repos gelten."
//
// Regeln, die nur in einem Dokument stehen, driften. Dieser Test hält die
// drei Fassungen derselben Entscheidung zusammen: `brand.ts` (die Werte),
// `styles.css` (was der Browser sieht) und ADR-007 (warum).
//
// Er prüft NICHT, ob die Werte hübsch sind — das entscheidet das
// Marken-Handbuch. Er prüft, dass es nur EINE Antwort gibt.
// ───────────────────────────────────────────────────────────────────────────

const css = readFileSync(
  fileURLToPath(new URL('../src/styles.css', import.meta.url)),
  'utf8',
)

/** Der Dark-Block — die Werte, die ein `data-theme="dark"` erzwingt. */
const darkBlock = css.slice(css.indexOf(":root[data-theme='dark']"))
  .slice(0, css.slice(css.indexOf(":root[data-theme='dark']")).indexOf('}'))

const wert = (block: string, name: string): string => {
  const m = block.match(new RegExp(`${name}:\\s*([^;]+);`))
  return m ? m[1].trim() : ''
}

describe('die Palette steht in styles.css so, wie brand.ts sie führt', () => {
  it('trägt Deep Navy als Grund und Zumpe Navy als Fläche', () => {
    expect(wert(darkBlock, '--av-bg').toUpperCase()).toBe(BRAND_COLORS.deepNavy)
    expect(wert(darkBlock, '--av-surface-2').toUpperCase()).toBe(BRAND_COLORS.zumpeNavy)
  })

  it('setzt Off-White als Text und Eisblau als Fließtext', () => {
    expect(wert(darkBlock, '--av-text').toUpperCase()).toBe(BRAND_COLORS.offWhite)
    expect(wert(darkBlock, '--av-text-secondary').toUpperCase()).toBe(BRAND_COLORS.eisblau)
  })

  it('nutzt Stahlblau für Gedämpftes — nie für Fließtext', () => {
    expect(wert(darkBlock, '--av-text-muted').toUpperCase()).toBe(BRAND_COLORS.stahlblau)
  })

  it('nennt die abgeleiteten Flächen mit denselben Werten', () => {
    expect(wert(darkBlock, '--av-surface-3').toUpperCase()).toBe(DERIVED_SURFACES.darkSunken)
    expect(wert(darkBlock, '--av-surface-1').toUpperCase()).toBe(DERIVED_SURFACES.darkPanel)
  })

  it('führt Tally-Rot genau einmal, als --av-signal', () => {
    expect(css).toContain(`--av-signal: ${BRAND_COLORS.tallyRot}`)
  })

  it('trennt Status von Signal — Fehlerrot ist ein anderer Ton', () => {
    expect(css).toContain(`--av-danger: ${BRAND_STATUS.danger}`)
    expect(BRAND_STATUS.danger).not.toBe(BRAND_COLORS.tallyRot)
  })
})

describe('Rot ist das Signal, keine Farbe', () => {
  it('steht nirgends als Fläche oder Text-Token', () => {
    const rot = BRAND_COLORS.tallyRot.toLowerCase()
    const treffer = css
      .split('\n')
      .filter((z) => z.toLowerCase().includes(rot))
      .map((z) => z.trim())
    // Genau eine Stelle: die Definition von --av-signal. Alles andere
    // referenziert sie über var().
    expect(treffer).toHaveLength(1)
    expect(treffer[0]).toContain('--av-signal')
  })

  it('trägt den Fokusring — 2 px, 3 px Abstand', () => {
    expect(css).toContain(`outline: ${FOCUS.widthPx}px solid var(--av-signal)`)
    expect(css).toContain(`outline-offset: ${FOCUS.offsetPx}px`)
  })

  it('setzt den Punkt an den primären Knopf, nicht dessen Fläche', () => {
    const knopf = css.slice(css.indexOf(".av-btn[data-variant='primary']::before"))
    expect(knopf.slice(0, 200)).toContain('background: var(--av-signal)')
  })
})

describe('keine Rundungen, keine Schatten, keine Verläufe', () => {
  it('setzt jede Radius-Stufe auf null', () => {
    for (const name of ['--av-r-control', '--av-r-card', '--av-r-modal', '--av-r-pill']) {
      expect(wert(css, name)).toBe(String(RADIUS_PX))
    }
  })

  it('lässt keinen harten Radius in den Primitiven stehen', () => {
    expect(css).not.toMatch(/border-radius:\s*(50%|[1-9])/)
  })

  it('setzt die Schatten-Tokens auf none — die Namen bleiben für Aufrufer', () => {
    for (const name of ['--av-shadow-panel', '--av-shadow-pop', '--av-shadow-float']) {
      expect(wert(css, name)).toBe('none')
    }
  })

  it('kennt keinen Verlauf', () => {
    expect(css).not.toMatch(/linear-gradient|radial-gradient/)
  })
})

describe('Bewegung: schnell, kurz, dann still', () => {
  it('führt Kurve und Dauer als Token', () => {
    expect(wert(css, '--av-ease').replace(/\s/g, '')).toBe(MOTION.easing.replace(/\s/g, ''))
    expect(wert(css, '--av-dur')).toBe(`${MOTION.durationMs}ms`)
  })

  it('bleibt unter der Obergrenze des Handbuchs', () => {
    expect(MOTION.durationMs).toBeLessThanOrEqual(MOTION.maxDurationMs)
    expect(MOTION.maxDurationMs).toBe(450)
  })
})

describe('die Typo-Leiter ist eine Leiter', () => {
  it('steigt lückenlos', () => {
    const stufen = [
      TYPE_SCALE.micro,
      TYPE_SCALE.kicker,
      TYPE_SCALE.body,
      TYPE_SCALE.read,
      TYPE_SCALE.title,
      TYPE_SCALE.display,
    ]
    expect([...stufen].sort((a, b) => a - b)).toEqual(stufen)
    expect(new Set(stufen).size).toBe(stufen.length)
  })

  it('steht in styles.css mit denselben Werten', () => {
    expect(wert(css, '--av-fs-body')).toBe(`${TYPE_SCALE.body}px`)
    expect(wert(css, '--av-fs-read')).toBe(`${TYPE_SCALE.read}px`)
    expect(wert(css, '--av-fs-kicker')).toBe(`${TYPE_SCALE.kicker}px`)
  })

  it('lässt den Leseschritt beim Guide-Wert — die Abweichung gilt nur fürs Werkzeug', () => {
    expect(TYPE_SCALE.read).toBe(16)
  })
})

describe('das Modul erkennt man am Kicker, nicht am Farbton', () => {
  it('zeigt alle Modul-Akzente auf denselben Wert', () => {
    for (const m of ['raum', 'signal', 'cameras', 'licht', 'overview', 'board']) {
      expect(css).toContain(`--mod-${m}: var(--av-accent);`)
    }
  })

  it('trägt die Kopflinie als eigenes Element', () => {
    expect(css).toContain('.av-kicker');
    expect(css).toContain('.av-headrule');
  })
})
