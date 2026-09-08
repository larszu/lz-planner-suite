import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as XLSX from 'xlsx-js-style'
import { previewRundown, rundownViewRows, suggestMapping } from '@avplan/ui'
import type { SuiteSeed } from '@avplan/ui/embed'
import {
  arbeitsmappeAusZeilen,
  istArbeitsmappe,
  parseArbeitsmappe,
} from '../src/shell/rundownXlsx'

// ───────────────────────────────────────────────────────────────────────────
// BEDARF 4 — „Ablauf-Interoperabilitaet mit der Tabelle, in der er lebt".
//
// CSV/TSV stand seit `suite#142`; die Roadmap fuehrte den Bedarf deshalb als
// „halb" mit dem ausdruecklichen Rest „XLSX offen". Der Rest ist mehr als
// Bequemlichkeit: Die Regie schickt die MAPPE, nicht den Text-Export.
//
// DIE STELLE, AN DER ES SCHIEFGEHT, IST DIE UHRZEIT. Excel speichert „14:20"
// als 0.5972222222222222. Wer roh liest, bekommt die Zahl, `parseClock` gibt
// `null`, und der Ablauf steht als „ohne Zeit" da — jede Zeile eingelesen,
// nichts fehlt, und trotzdem falsch. Diese Datei haelt genau das fest.
// ───────────────────────────────────────────────────────────────────────────

const SRC = join(import.meta.dirname, '..', 'src')

/** Eine Mappe bauen, wie Excel sie schreibt: die Zeit als ZAHL mit Format. */
const mappeMitZeitzelle = (): ArrayBuffer => {
  const blatt = XLSX.utils.aoa_to_sheet([
    ['Nr', 'Titel', 'Start', 'Dauer'],
    ['1', 'Begruessung', 'PLATZHALTER', '00:05'],
    ['2', 'Panel', 'PLATZHALTER', '00:30'],
  ])
  // 14:20 und 14:25 als Tagesbruchteil — genau so liegt es in einer echten
  // Mappe, wenn jemand die Zelle als Uhrzeit formatiert hat.
  blatt.C2 = { t: 'n', v: 14.3333333333 / 24, z: 'hh:mm' }
  blatt.C3 = { t: 'n', v: 14.4166666666 / 24, z: 'hh:mm' }
  const mappe = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(mappe, blatt, 'Ablauf')
  return XLSX.write(mappe, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

const SEED: SuiteSeed = { cameras: [], fixtures: [], devices: [], cables: [] }

describe('die Mappe wird gelesen wie die Tabelle, aus der sie kommt', () => {
  it('erkennt eine Mappe an der Endung — und nur die', () => {
    expect(istArbeitsmappe('ablauf.xlsx')).toBe(true)
    expect(istArbeitsmappe('ABLAUF.XLSX')).toBe(true)
    expect(istArbeitsmappe('alt.xls')).toBe(true)
    expect(istArbeitsmappe('ablauf.csv')).toBe(false)
    expect(istArbeitsmappe('ablauf.tsv')).toBe(false)
    expect(istArbeitsmappe('ablauf.xlsx.txt')).toBe(false)
  })

  it('gibt die Uhrzeit als „14:20" zurueck, nicht als 0.597…', () => {
    // DIE Zeile dieser Datei. Ohne sie liest die Suite die Mappe vollstaendig
    // ein und zeigt trotzdem „ohne Zeit".
    const { headers, rows } = parseArbeitsmappe(mappeMitZeitzelle())
    expect(headers).toEqual(['Nr', 'Titel', 'Start', 'Dauer'])
    expect(rows[0][2]).toBe('14:20')
    expect(rows[1][2]).toBe('14:25')
    expect(rows[0][2]).not.toMatch(/^0\./)
  })

  it('reicht die Zeit bis in den Ablauf durch — derselbe Pfad wie bei CSV', () => {
    // Der Beweis, dass hier kein zweiter Zuordnungs-Weg entstanden ist:
    // dieselbe `suggestMapping`/`previewRundown`-Kette wie beim Text.
    const { headers, rows } = parseArbeitsmappe(mappeMitZeitzelle())
    const vorschau = previewRundown(headers, rows, suggestMapping(headers), SEED)
    expect(vorschau.items).toHaveLength(2)
    expect(vorschau.items[0].startMin).toBe(14 * 60 + 20)
    expect(vorschau.items[1].startMin).toBe(14 * 60 + 25)
    expect(vorschau.skipped).toEqual([])
  })

  it('nimmt das ERSTE Blatt, nicht das zuletzt aktive', () => {
    const mappe = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      mappe,
      XLSX.utils.aoa_to_sheet([['Nr', 'Titel'], ['1', 'Aus Blatt eins']]),
      'Ablauf',
    )
    XLSX.utils.book_append_sheet(
      mappe,
      XLSX.utils.aoa_to_sheet([['Nr', 'Titel'], ['9', 'Aus Blatt zwei']]),
      'Notizen',
    )
    const buf = XLSX.write(mappe, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
    expect(parseArbeitsmappe(buf).rows[0][1]).toBe('Aus Blatt eins')
  })

  it('haelt jede Zeile auf Kopfzeilen-Breite, auch wenn Zellen fehlen', () => {
    // Excel schreibt eine nie beruehrte Zelle GAR NICHT in die Datei. Fehlt
    // sie am Ende, ist die Zeile kuerzer als die Kopfzeile; `previewRundown`
    // liest die Dauer dann aus `undefined` statt aus einer leeren Zelle.
    const blatt = XLSX.utils.aoa_to_sheet([
      ['Nr', 'Titel', 'Start', 'Dauer'],
      ['1', 'Panel', 'x', 'y'],
    ])
    delete blatt.C2
    delete blatt.D2
    const mappe = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(mappe, blatt, 'Ablauf')
    const buf = XLSX.write(mappe, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
    const { rows } = parseArbeitsmappe(buf)
    expect(rows[0]).toEqual(['1', 'Panel', '', ''])
    expect(rows[0]).toHaveLength(4)
  })

  it('reicht eine Leerzeile durch, statt sie zu verschlucken', () => {
    // Der Text-Pfad reicht sie durch, und `previewRundown` meldet sie mit
    // Grund. Zwei Leser, die aus derselben Datei verschiedene
    // Ueberspringen-Berichte machen, sind ein Format zu viel.
    // Eine WIRKLICH leere Zeile: keine Zelle, nicht zwei leere Strings —
    // so steht sie in einer Mappe, in der jemand eine Zeile freigelassen hat.
    const blatt = XLSX.utils.aoa_to_sheet([
      ['Nr', 'Titel'],
      ['1', 'Panel'],
      ['x', 'y'],
      ['2', 'Pause'],
    ])
    delete blatt.A3
    delete blatt.B3
    const mappe = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(mappe, blatt, 'Ablauf')
    const buf = XLSX.write(mappe, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
    const { headers, rows } = parseArbeitsmappe(buf)
    expect(rows).toHaveLength(3)
    const vorschau = previewRundown(headers, rows, suggestMapping(headers), SEED)
    expect(vorschau.items).toHaveLength(2)
    expect(vorschau.skipped).toEqual([{ row: 3, reason: 'empty-row' }])
  })

  it('antwortet auf eine leere Mappe wie auf eine leere CSV', () => {
    const mappe = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(mappe, XLSX.utils.aoa_to_sheet([]), 'Leer')
    const buf = XLSX.write(mappe, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
    expect(parseArbeitsmappe(buf)).toEqual({ headers: [], rows: [] })
  })
})

describe('das Blatt geht als Mappe hinaus — aus derselben Tabelle wie die CSV', () => {
  const BLATT = {
    stand: 'Stand: 2026-09-08',
    headers: ['Zeit', 'Punkt'],
    rows: [['14:20', 'Panel']],
    legend: [{ column: 'Zeit', text: 'geplanter Start' }],
  }

  it('schreibt Stand, Kopfzeile, Zeilen und Legende', () => {
    const blob = arbeitsmappeAusZeilen(rundownViewRows(BLATT), 'ablauf-crew')
    expect(blob.type).toContain('spreadsheetml.sheet')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('ist wieder lesbar — und traegt dieselben Zeilen', async () => {
    // Der Rundlauf ist die einzige ehrliche Probe: eine Datei, die niemand
    // wieder oeffnet, kann alles behaupten.
    const blob = arbeitsmappeAusZeilen(rundownViewRows(BLATT), 'ablauf-crew')
    const zurueck = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' })
    const blatt = zurueck.Sheets[zurueck.SheetNames[0]]
    const zeilen = XLSX.utils.sheet_to_json<string[]>(blatt, {
      header: 1,
      raw: false,
      defval: '',
    })
    expect(zeilen[0][0]).toBe('Stand: 2026-09-08')
    expect(zeilen).toContainEqual(['Zeit', 'Punkt'])
    expect(zeilen).toContainEqual(['14:20', 'Panel'])
    expect(zeilen.some((z) => z[0] === 'Legende')).toBe(true)
    expect(zeilen).toContainEqual(['Zeit', 'geplanter Start'])
  })

  it('entschaerft einen Blattnamen, den Excel nicht annimmt', () => {
    // 31 Zeichen, und : \ / ? * [ ] sind verboten. Ein Verstoss macht die
    // Datei unlesbar — beim Empfaenger, nicht hier.
    const blob = arbeitsmappeAusZeilen([['x']], 'Ablauf: Halle 1/2 [Fassung *neu*] mit sehr langem Namen')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('nimmt dieselbe Zeilen-Tabelle wie die CSV — nicht eine eigene', () => {
    const quelle = readFileSync(join(SRC, 'shell', 'RundownCard.tsx'), 'utf8')
    const stelle = quelle.slice(quelle.indexOf('const speichere ='))
    expect(stelle.slice(0, 500)).toContain('rundownViewRows(view)')
    expect(stelle.slice(0, 500)).toContain('rundownViewCsv(view)')
  })
})

describe('die Oberflaeche laesst die Mappe wirklich herein', () => {
  const quelle = readFileSync(join(SRC, 'shell', 'RundownCard.tsx'), 'utf8')

  it('nimmt .xlsx im Datei-Dialog an', () => {
    const stelle = quelle.slice(quelle.indexOf('accept='), quelle.indexOf('accept=') + 300)
    expect(stelle).toContain('.xlsx')
  })

  it('waehlt den Leser nach der Endung — und nicht nach Gefuehl', () => {
    const stelle = quelle.slice(quelle.indexOf('const lies ='))
    expect(stelle.slice(0, 600)).toMatch(/istArbeitsmappe\(f\.name\)/)
    expect(stelle.slice(0, 600)).toContain('parseArbeitsmappe(await f.arrayBuffer())')
    expect(stelle.slice(0, 600)).toContain('parseDelimited(await f.text())')
  })
})
