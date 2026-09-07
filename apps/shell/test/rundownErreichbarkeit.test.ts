import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { RUNDOWN_AUDIENCES, RUNDOWN_FIELDS } from '@avplan/ui'
import { ALL_WIDGETS, DEFAULT_CARD_ORDER, WIDGET_LABEL } from '../src/shell/dashboardPrefs'
import { translate } from '../src/i18n'

// ───────────────────────────────────────────────────────────────────────────
// BEDARF 8 — der eingelesene Ablauf muss von der Uebersicht aus erreichbar
// sein.
//
// Eine Karte, die zwar existiert, aber in keiner Widget-Liste steht, ist
// gebaut und nicht geliefert — genau der Befund, der in B-35 vier ganze Repos
// betraf. Nichts konnte es melden, weil nichts danach fragte.
//
// Dieser Guard fragt danach, und zwar auf der ganzen Strecke: die Widget-Id
// existiert, sie steht in der Vorgabe-Reihenfolge (sonst sieht sie niemand,
// der die Einstellungen nie oeffnet), sie hat eine Beschriftung, und die
// Uebersichts-Oberflaeche rendert sie wirklich.
// ───────────────────────────────────────────────────────────────────────────

const SRC = join(import.meta.dirname, '..', 'src')
const lies = (p: string): string => readFileSync(join(SRC, p), 'utf8')

describe('Ablauf-Karte — erreichbar von der Uebersicht', () => {
  it('ist als Widget registriert, beschriftet und ab Werk sichtbar', () => {
    expect(ALL_WIDGETS).toContain('rundown')
    expect(DEFAULT_CARD_ORDER).toContain('rundown')
    expect(WIDGET_LABEL.rundown).toBeTruthy()
    // Direkt neben dem Tagesablauf: es sind zwei Dokumente mit zwei
    // Eigentuemern, und nebeneinander ist der Unterschied sichtbar.
    expect(DEFAULT_CARD_ORDER.indexOf('rundown')).toBe(
      DEFAULT_CARD_ORDER.indexOf('runofshow') + 1,
    )
  })

  it('wird von der Uebersicht wirklich gerendert', () => {
    // Der Import allein genuegt nicht.
    expect(lies('shell/OverviewSurface.tsx')).toContain('<RundownCard')
  })

  it('hat eine englische Beschriftung fuer jeden sichtbaren Text', () => {
    for (const key of [
      'overview.widget.rundown',
      'overview.card.rundown.title',
      'overview.card.rundown.import',
      'overview.card.rundown.empty',
      'overview.card.rundown.source',
      'rundown.import.title',
      'rundown.import.confirm',
      'rundown.field.title',
      'rundown.skip.no-title',
    ]) {
      expect(translate('en', key, 'DEUTSCHER FALLBACK'), key).not.toBe('DEUTSCHER FALLBACK')
    }
  })

  it('bietet keinen Weg, den Ablauf in der Shell zu bearbeiten (E-18)', () => {
    // Die Entscheidung vom 2026-09-07 lautet: nur lesen. Die Karte hat
    // deshalb „Einlesen" und keinen „Bearbeiten"-Knopf — und der Unterschied
    // zum Tagesablauf daneben ist genau der.
    const karte = lies('shell/RundownCard.tsx')
    expect(karte).not.toContain('EditButton')
    expect(karte).not.toContain('ScheduleEditor')
    // Genau EIN Weg, einen Ablauf entstehen zu lassen: aus der bestaetigten
    // Vorschau.
    expect(karte.match(/rundownFromPreview\(/g) ?? []).toHaveLength(1)
    // Und die Herkunft steht auf der Karte, damit niemand sie fuer die
    // Quelle haelt.
    expect(karte).toContain('rundown.source.filename')
  })

  it('bietet jedes Empfaenger-Format an, das es gibt (Bedarf 7)', () => {
    // Fuenf Sichten im Modell und vier Knoepfe waeren dieselbe Luecke wie
    // eine Karte ohne Widget-Id: gebaut und nicht geliefert. Die Liste kommt
    // deshalb AUS dem Modell und wird nicht in der Oberflaeche wiederholt.
    const karte = lies('shell/RundownCard.tsx')
    // Die Knopf-Leiste haengt wirklich an der Karte — eine Komponente, die
    // niemand mountet, ist gebaut und nicht geliefert.
    expect(karte).toContain('<RundownExports rundown={rundown} seed={seed} />')
    expect(karte).toContain('RUNDOWN_AUDIENCES.map')
    for (const a of RUNDOWN_AUDIENCES) {
      expect(translate('en', `rundown.audience.${a}`, 'DEUTSCHER FALLBACK'), a).not.toBe(
        'DEUTSCHER FALLBACK',
      )
      expect(karte, `deutsche Beschriftung fuer ${a}`).toMatch(new RegExp(`${a}: '`))
    }
    // Die Blaetter werden nicht hier gerechnet, sondern geholt.
    expect(karte).toContain('rundownView(')
    expect(karte).toContain('rundownViewCsv(')
  })

  it('hat fuer jedes Feld und jeden Ueberspring-Grund ein deutsches Wort', () => {
    // AUFGEFALLEN AM SCREENSHOT (2026-09-07): im Import-Dialog stand „cue",
    // „refs" und „empty-row". `t(key, fallback)` nimmt den Fallback als
    // DEUTSCHE Quell-Sprache — dort die Id zu setzen heisst, dem deutschen
    // Nutzer die Id zu zeigen. Der Erreichbarkeits-Guard darueber prueft nur
    // die ENGLISCHEN Eintraege und war deshalb gruen.
    const karte = lies('shell/RundownCard.tsx')
    for (const f of RUNDOWN_FIELDS) {
      expect(karte, `deutsches Wort fuer Feld ${f}`).toMatch(
        new RegExp(`^\\s*${f}: '[^']+'`, 'm'),
      )
    }
    for (const r of ['no-title', 'empty-row']) {
      expect(karte, `deutsches Wort fuer Ueberspring-Grund ${r}`).toMatch(
        new RegExp(`'${r}': '[^']+'`),
      )
    }
    // Und keine Id steht mehr als Fallback am t()-Aufruf.
    expect(karte).not.toContain('rundown.field.${f}`, f)')
    expect(karte).not.toContain('rundown.skip.${s.reason}`, s.reason)')
  })

  it('nimmt die Uhrzeit in der Oberflaeche und nicht im Modell', () => {
    // Das Modell bleibt rein; der Zeitstempel kommt von hier.
    expect(lies('shell/OverviewSurface.tsx')).toContain('now={() => new Date().toISOString()}')
  })
})
