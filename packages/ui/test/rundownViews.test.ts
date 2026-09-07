import { describe, expect, it } from 'vitest'
import {
  GEAR_GONE,
  NO_GEAR_ON_SHEET,
  NO_TIME_ON_SHEET,
  RUNDOWN_AUDIENCES,
  rundownView,
  rundownViewCsv,
} from '../src/rundownViews'
import { rundownFromPreview, type Rundown, type RundownItem } from '../src/rundown'
import { emptySeed, type SuiteSeed } from '../src/seed'
import quelle from '../src/rundownViews.ts?raw'

// ───────────────────────────────────────────────────────────────────────────
// BEDARF 7 — dieselbe Quelle, jedes Empfaenger-Format.
//
//   > Each rendering is made by hand from the same rows and forks the moment
//   > it is exported.
//
// Was diese Datei absichert, ist genau das Nicht-Gabeln: jede Zelle jeder
// Sicht muss aus dem Ablauf oder aus dem Plan stammen. Sobald eine Sicht
// etwas enthaelt, das nirgendwo sonst steht, ist sie ein zweites Dokument.
// ───────────────────────────────────────────────────────────────────────────

const seed = (): SuiteSeed => ({
  ...emptySeed(1),
  cameras: [{ id: 'c1', name: 'Kamera 1' }],
  fixtures: [{ id: 'f1', name: 'Key Host' }],
  devices: [{ id: 'd1', name: 'Mischer' }],
  cables: [],
})

const item = (over: Partial<RundownItem> & { id: string; title: string }): RundownItem => ({
  refs: [],
  ...over,
})

const rd = (items: RundownItem[]): Rundown =>
  rundownFromPreview(
    { items, skipped: [], unresolved: [], ignoredColumns: [] },
    { filename: 'ablauf.csv', importedAt: '2026-09-07T09:00:00.000Z', mapping: {} },
  )

const PUNKT = item({
  id: 'r2',
  cue: '1',
  title: 'Panel',
  startMin: 860,
  durationMin: 20,
  note: 'VT ab 14:31',
  refs: [
    { kind: 'camera', id: 'c1', mentionedAs: 'Kamera 1' },
    { kind: 'device', id: 'd1', mentionedAs: 'Mischer' },
  ],
})

describe('rundownView — Spalten je Empfaenger', () => {
  it('gibt dem Kunden keine Technik', () => {
    // Sie geht ihn nichts an, und ein Blatt, das sie traegt, wird
    // weitergereicht.
    const v = rundownView(rd([PUNKT]), seed(), 'client')
    expect(v.headers).toEqual(['Zeit', 'Punkt', 'Dauer'])
    expect(v.rows).toEqual([['14:20', 'Panel', 20]])
  })

  it('gibt der Crew dasselbe plus das Material', () => {
    const v = rundownView(rd([PUNKT]), seed(), 'crew')
    expect(v.headers).toEqual(['Zeit', 'Punkt', 'Dauer', 'Technik'])
    expect(v.rows[0][3]).toBe('Kamera 1, Mischer')
  })

  it('gibt dem Foyer nur Zeit und Titel', () => {
    expect(rundownView(rd([PUNKT]), seed(), 'signage').headers).toEqual(['Zeit', 'Punkt'])
  })

  it('gibt dem Show-Caller alles, was da ist', () => {
    const v = rundownView(rd([PUNKT]), seed(), 'showcaller')
    expect(v.headers).toEqual(['Cue', 'Zeit', 'Punkt', 'Dauer', 'Technik', 'Notiz'])
    expect(v.rows[0]).toEqual(['1', '14:20', 'Panel', 20, 'Kamera 1, Mischer', 'VT ab 14:31'])
  })

  it('zeigt dem Gewerk nur die Punkte, die dessen Material beruehren', () => {
    const nurLicht = item({
      id: 'r3',
      title: 'Umbau',
      startMin: 900,
      refs: [{ kind: 'fixture', id: 'f1', mentionedAs: 'Key Host' }],
    })
    // Ein Punkt ganz ohne Technik gehoert auf KEIN Gewerke-Blatt: er sagt
    // dem Gewerk nichts und macht die Liste laenger als das, was zu tun ist.
    const ohneTechnik = item({ id: 'r4', title: 'Pause', startMin: 960 })
    const alle = rd([PUNKT, nurLicht, ohneTechnik])
    expect(rundownView(alle, seed(), 'department', 'fixture').rows).toEqual([
      ['15:00', 'Umbau', 'Key Host'],
    ])
    // Ohne Gewerks-Angabe: alle Punkte MIT Technik, aber eben nur die. Ein
    // geratenes Gewerk waere eine Behauptung darueber, wer das Blatt bekommt.
    expect(rundownView(alle, seed(), 'department').rows.map((r) => r[1])).toEqual([
      'Panel',
      'Umbau',
    ])
  })

  it('kennt genau fuenf Empfaenger, und jeder hat Spalten', () => {
    expect(RUNDOWN_AUDIENCES).toEqual([
      'client',
      'crew',
      'department',
      'signage',
      'showcaller',
    ])
    for (const a of RUNDOWN_AUDIENCES) {
      const v = rundownView(rd([PUNKT]), seed(), a)
      expect(v.headers.length, a).toBeGreaterThan(0)
      expect(v.legend.map((l) => l.column), a).toEqual(v.headers)
      expect(v.rows[0]?.length, a).toBe(v.headers.length)
    }
  })
})

describe('rundownView — was auf dem Blatt steht, wenn nichts da ist', () => {
  it('nennt eine fehlende Zeit beim Namen und zeigt unlesbare unveraendert', () => {
    const ohne = item({ id: 'a', title: 'Pause' })
    const roh = item({ id: 'b', title: 'Ende', startText: 'nach dem Panel' })
    const v = rundownView(rd([ohne, roh]), seed(), 'client')
    expect(v.rows[0][0]).toBe(NO_TIME_ON_SHEET)
    expect(v.rows[1][0]).toBe('nach dem Panel')
  })

  it('nennt fehlende Technik beim Namen statt eine leere Zelle zu drucken', () => {
    const ohne = item({ id: 'a', title: 'Pause', startMin: 900 })
    expect(rundownView(rd([ohne]), seed(), 'crew').rows[0][3]).toBe(NO_GEAR_ON_SHEET)
  })
})

describe('Bedarf 7 trifft Bedarf 8 — der Name kommt aus dem Plan von heute', () => {
  it('druckt den NEUEN Namen nach einer Umbenennung', () => {
    // Ein Blatt mit dem beim Import gelesenen Namen zeigt einen, den im Haus
    // niemand mehr benutzt.
    const umbenannt = { ...seed(), cameras: [{ id: 'c1', name: 'Kamera Bühne links' }] }
    const v = rundownView(rd([PUNKT]), umbenannt, 'crew')
    expect(v.rows[0][3]).toBe('Kamera Bühne links, Mischer')
  })

  it('benennt Verschwundenes, statt es wegzulassen', () => {
    // Eine kuerzere Zeile saehe aus wie ein Punkt, der weniger Material
    // braucht.
    const ohneKamera = { ...seed(), cameras: [] }
    expect(rundownView(rd([PUNKT]), ohneKamera, 'crew').rows[0][3]).toBe(
      `Kamera 1 ${GEAR_GONE}, Mischer`,
    )
  })
})

describe('Legende und Stand', () => {
  it('erklaert jede Spalte, die auf dem Blatt steht', () => {
    // „Exports need a field legend because the recipient is non-technical."
    const v = rundownView(rd([PUNKT]), seed(), 'showcaller')
    expect(v.legend).toHaveLength(v.headers.length)
    for (const l of v.legend) expect(l.text.length).toBeGreaterThan(20)
  })

  it('nennt die Herkunft als Stand — nicht einen vierten Fingerabdruck', () => {
    // ADR-004 gibt den drei Planern EINEN Stempel, dessen Sinn der Vergleich
    // ist. Eine vierte Implementierung waere die erste, die niemand bewacht.
    const v = rundownView(rd([PUNKT]), seed(), 'client')
    expect(v.stand).toContain('ablauf.csv')
    expect(v.stand).toContain('2026-09-07T09:00:00.000Z')
    expect(quelle).not.toMatch(/fingerprint|documentStamp|charCodeAt/)
  })

  it('traegt Legende und Stand IM Blatt und nicht daneben', () => {
    // Ein Beiblatt geht auf dem Weg zum Empfaenger verloren.
    const csv = rundownViewCsv(rundownView(rd([PUNKT]), seed(), 'crew'))
    expect(csv.split('\n')[0]).toContain('ablauf.csv')
    expect(csv).toContain('Legende')
    expect(csv).toContain('Zeit;Punkt;Dauer;Technik')
  })

  it('schuetzt Zellen mit Semikolon, Anfuehrungszeichen und Zeilenumbruch', () => {
    const heikel = item({
      id: 'a',
      title: 'Panel; mit "Gast"',
      startMin: 860,
      note: 'Zeile 1\nZeile 2',
    })
    const csv = rundownViewCsv(rundownView(rd([heikel]), seed(), 'showcaller'))
    expect(csv).toContain('"Panel; mit ""Gast"""')
    expect(csv).toContain('"Zeile 1\nZeile 2"')
  })
})

describe('Eine Quelle, N Sichten', () => {
  it('erfindet in keiner Sicht eine Zelle, die nicht im Ablauf oder Plan steht', () => {
    // DAS ist die Regel gegen das Gabeln. Sobald eine Sicht etwas enthaelt,
    // das nirgendwo sonst steht, ist sie ein zweites Dokument.
    const erlaubt = new Set<string>([
      '1', '14:20', 'Panel', '20', 'Kamera 1, Mischer', 'VT ab 14:31',
      NO_TIME_ON_SHEET, NO_GEAR_ON_SHEET, '',
    ])
    for (const a of RUNDOWN_AUDIENCES) {
      for (const zelle of rundownView(rd([PUNKT]), seed(), a).rows.flat()) {
        expect(erlaubt.has(String(zelle)), `${a}: ${String(zelle)}`).toBe(true)
      }
    }
  })

  it('rechnet ohne Uhr', () => {
    expect(quelle).not.toContain('new Date')
    expect(quelle).not.toContain('Date.now')
  })
})
