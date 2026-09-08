import { describe, expect, it } from 'vitest'
import {
  RUNDOWN_FIELDS,
  isRundown,
  parseClock,
  parseDelimited,
  parseDuration,
  previewRundown,
  rundownCoverage,
  rundownFindings,
  rundownFromPreview,
  rundownSchedule,
  suggestMapping,
  type ColumnMapping,
  type RundownFindingKind,
  type RundownSource,
} from '../src/rundown'
import { emptySeed, type SuiteSeed } from '../src/seed'
import quelle from '../src/rundown.ts?raw'

// ───────────────────────────────────────────────────────────────────────────
// BEDARF 8 — die Verbindung zwischen Ablauf und technischem Plan, plus die
// Lese-Haelfte von BEDARF 6 (die unordentliche Kunden-Tabelle einlesen).
//
//   > The running order says '14:20 panel, four handhelds, VT at 14:31'. The
//   > technical plan says which RF channels, which camera, which cable.
//   > Nothing connects them.
//
// E-18 (2026-09-07) hat entschieden: NUR LESEN. Was diese Datei deshalb vor
// allem absichert, ist die Abwesenheit eines Schreibwegs — und die drei
// Fehlalarme, die im Kopf von `rundown.ts` begruendet sind und die es nicht
// gibt: kein „doppelt belegt", kein „kommt in keinem Punkt vor", kein
// „Punkte ueberschneiden sich".
// ───────────────────────────────────────────────────────────────────────────

const seed = (): SuiteSeed => ({
  ...emptySeed(1),
  venue: { name: 'Halle A' },
  cameras: [
    { id: 'c1', name: 'Kamera 1' },
    { id: 'c2', name: 'Kamera 2' },
  ],
  fixtures: [{ id: 'f1', name: 'Key Host' }],
  devices: [{ id: 'd1', name: 'Mischer' }],
  cables: [{ id: 'k1', label: 'SDI 1', type: '12G-SDI', from: 'c1', to: 'd1' }],
})

const quelleAngabe = (): RundownSource => ({
  filename: 'ablauf.csv',
  importedAt: '2026-09-07T09:00:00.000Z',
  mapping: {},
})

// ── 1. Der Leser fuer die fremde Tabelle ───────────────────────────────────

describe('parseDelimited', () => {
  it('zaehlt das Trennzeichen in der Kopfzeile, statt es zu raten', () => {
    // Semikolon ist in deutschen Excel-Exporten die Regel, Komma in
    // englischen, Tab in dem, was aus Sheets kopiert wird.
    expect(parseDelimited('a;b;c\n1;2;3').headers).toEqual(['a', 'b', 'c'])
    expect(parseDelimited('a,b,c\n1,2,3').headers).toEqual(['a', 'b', 'c'])
    expect(parseDelimited('a\tb\tc\n1\t2\t3').headers).toEqual(['a', 'b', 'c'])
  })

  it('trimmt die Spaltennamen — sonst trifft keine Zuordnung', () => {
    // Ein Spaltenname mit Leerzeichen sieht identisch aus und ist ein
    // anderer Schluessel. Die Zuordnung liefe ins Leere, ohne dass irgendwo
    // etwas steht.
    const { headers } = parseDelimited(' Nr ; Programmpunkt \n1;Panel')
    expect(headers).toEqual(['Nr', 'Programmpunkt'])
    expect(suggestMapping(headers)).toEqual({ Nr: 'cue', Programmpunkt: 'title' })
  })

  it('laesst ein Wagenruecklauf-Zeichen nicht im Feld stehen', () => {
    const { rows } = parseDelimited('a,b\r\n1,2\r\n')
    expect(rows[0]).toEqual(['1', '2'])
  })

  it('verliert kein Feld mit Trennzeichen in Anfuehrungszeichen', () => {
    // Genau die Zeile, um die es geht: „Panel, vier Handhelds".
    const { rows } = parseDelimited('Zeit,Punkt\n14:20,"Panel, vier Handhelds"')
    expect(rows[0]).toEqual(['14:20', 'Panel, vier Handhelds'])
  })

  it('laesst ein Anfuehrungszeichen MITTEN im Feld stehen', () => {
    // `Panel "Zukunft der Halle"` ist ein Programmpunkt und kein quotiertes
    // Feld. Wer hier den Quote-Modus anschaltet, frisst die
    // Anfuehrungszeichen und haengt sich am naechsten Trennzeichen auf.
    const { rows } = parseDelimited('Nr;Punkt\n3;Panel "Zukunft der Halle";x')
    expect(rows[0][1]).toBe('Panel "Zukunft der Halle"')
    expect(rows[0][2]).toBe('x')
  })

  it('versteht verdoppelte Anfuehrungszeichen und CRLF', () => {
    const { headers, rows } = parseDelimited('a,b\r\n1,"er sagte ""ja"""\r\n')
    expect(headers).toEqual(['a', 'b'])
    expect(rows[0]).toEqual(['1', 'er sagte "ja"'])
  })

  it('kommt mit leerem Text zurecht', () => {
    expect(parseDelimited('')).toEqual({ headers: [], rows: [] })
    expect(parseDelimited('   ')).toEqual({ headers: [], rows: [] })
  })
})

describe('suggestMapping', () => {
  it('schlaegt deutsche und englische Spaltennamen zu', () => {
    const m = suggestMapping(['Nr', 'Programmpunkt', 'Beginn', 'Dauer', 'Technik', 'Bemerkung'])
    expect(m).toEqual({
      Nr: 'cue',
      Programmpunkt: 'title',
      Beginn: 'start',
      Dauer: 'duration',
      Technik: 'refs',
      Bemerkung: 'note',
    })
    expect(suggestMapping(['#', 'Item', 'Start', 'Length', 'Gear', 'Note'])).toEqual({
      '#': 'cue',
      Item: 'title',
      Start: 'start',
      Length: 'duration',
      Gear: 'refs',
      Note: 'note',
    })
  })

  it('vergibt ein Feld hoechstens einmal — die erste Spalte gewinnt', () => {
    // Zwei Spalten auf dasselbe Feld waere eine Zuordnung, die beim Import
    // eine der beiden still verwirft.
    const m = suggestMapping(['Start', 'Startzeit'])
    expect(Object.values(m).filter((f) => f === 'start')).toHaveLength(1)
    expect(m).toEqual({ Start: 'start' })
  })

  it('trifft ueber Gleichheit oder Anfang, nicht ueber „enthaelt"', () => {
    // „Endzeit" enthaelt „zeit" und waere damit der Beginn; „Restdauer"
    // enthaelt „dauer" und waere die Dauer. Beides ist falsch — und ein
    // falscher Vorschlag ist teurer als keiner, weil er bestaetigt wird.
    expect(suggestMapping(['Endzeit', 'Restdauer'])).toEqual({})
    // Und andersherum genauso: ein Spaltenname, der bloss IN einem Hinweis
    // vorkommt, ist keiner. „Da" ist nicht „Dauer".
    expect(suggestMapping(['Da'])).toEqual({})
  })

  it('laesst liegen, was es nicht sicher trifft', () => {
    // Ein falscher Vorschlag ist teurer als keiner: er wird bestaetigt.
    expect(suggestMapping(['Spalte A', 'Spalte B'])).toEqual({})
  })
})

describe('parseClock / parseDuration — tolerant, aber nicht ratend', () => {
  it('liest die ueblichen Schreibweisen', () => {
    expect(parseClock('14:20')).toBe(860)
    expect(parseClock('14.20')).toBe(860)
    expect(parseClock('1420')).toBe(860)
    expect(parseClock(' 9:05 ')).toBe(545)
    expect(parseClock('2:20 PM')).toBe(860)
    expect(parseClock('12:30 AM')).toBe(30)
  })

  it('gibt null zurueck, statt zu raten', () => {
    for (const roh of ['', 'nach der Pause', '25:00', '14:75', 'abc', '14:2:']) {
      expect(parseClock(roh)).toBeNull()
    }
  })

  it('liest Dauern in beiden Schreibweisen', () => {
    expect(parseDuration('45')).toBe(45)
    expect(parseDuration('45 min')).toBe(45)
    expect(parseDuration('1:30')).toBe(90)
    expect(parseDuration('1h30')).toBe(90)
    // „ca. 20" ist eine Schaetzung und keine Dauer. Die 20 herauszuziehen
    // machte aus einem Vorbehalt eine Zusage.
    expect(parseDuration('ca. 20')).toBeNull()
    expect(parseDuration('20-30')).toBeNull()
    expect(parseDuration('nach Bedarf')).toBeNull()
    expect(parseDuration('1:70')).toBeNull()
  })
})

// ── 2. Die Vorschau ────────────────────────────────────────────────────────

const KOPF = ['Nr', 'Programmpunkt', 'Beginn', 'Dauer', 'Technik']
const ZUORDNUNG: ColumnMapping = {
  Nr: 'cue',
  Programmpunkt: 'title',
  Beginn: 'start',
  Dauer: 'duration',
  Technik: 'refs',
}

describe('previewRundown', () => {
  it('verknuepft ueber den Namen und merkt sich den Text', () => {
    const p = previewRundown(
      KOPF,
      [['1', 'Panel', '14:20', '20', 'Kamera 1; Mischer']],
      ZUORDNUNG,
      seed(),
    )
    expect(p.items).toHaveLength(1)
    expect(p.items[0].startMin).toBe(860)
    expect(p.items[0].durationMin).toBe(20)
    expect(p.items[0].refs).toEqual([
      { kind: 'camera', id: 'c1', mentionedAs: 'Kamera 1' },
      { kind: 'device', id: 'd1', mentionedAs: 'Mischer' },
    ])
  })

  it('verknuepft nichts, was es nicht eindeutig findet', () => {
    // Eine geratene Verknuepfung waere eine erfundene Tatsache ueber die Show.
    const zwei = { ...seed(), cameras: [{ id: 'a', name: 'Kamera' }, { id: 'b', name: 'Kamera' }] }
    const p = previewRundown(
      KOPF,
      [['1', 'Panel', '14:20', '', 'Kamera, Handheld 5']],
      ZUORDNUNG,
      zwei,
    )
    expect(p.items[0].refs).toEqual([])
    expect(p.unresolved).toEqual([
      { row: 2, text: 'Kamera', matches: 2 },
      { row: 2, text: 'Handheld 5', matches: 0 },
    ])
  })

  it('behaelt eine unlesbare Zeit als Rohtext, ohne sie zu deuten', () => {
    const p = previewRundown(KOPF, [['1', 'Pause', 'nach dem Panel', '', '']], ZUORDNUNG, seed())
    expect(p.items[0].startMin).toBeUndefined()
    expect(p.items[0].startText).toBe('nach dem Panel')
  })

  it('nennt jede uebersprungene Zeile mit Grund und Zeilennummer', () => {
    // „3 Zeilen uebersprungen" ist keine Auskunft, mit der jemand die
    // Tabelle reparieren kann.
    const p = previewRundown(
      KOPF,
      [
        ['1', 'Panel', '14:20', '', ''],
        ['', '', '', '', ''],
        ['2', '', '15:00', '', ''],
      ],
      ZUORDNUNG,
      seed(),
    )
    expect(p.items).toHaveLength(1)
    expect(p.skipped).toEqual([
      { row: 3, reason: 'empty-row' },
      { row: 4, reason: 'no-title' },
    ])
  })

  it('nennt die Spalten, die niemand zugeordnet hat', () => {
    const p = previewRundown(
      [...KOPF, 'Interne Notiz'],
      [['1', 'Panel', '14:20', '', '', 'egal']],
      ZUORDNUNG,
      seed(),
    )
    expect(p.ignoredColumns).toEqual(['Interne Notiz'])
  })

  it('kommt ohne jede Zuordnung durch, ohne etwas zu erfinden', () => {
    const p = previewRundown(KOPF, [['1', 'Panel', '14:20', '', '']], {}, seed())
    expect(p.items).toHaveLength(0)
    expect(p.skipped).toEqual([{ row: 2, reason: 'no-title' }])
  })
})

// ── 3. Die Verknuepfung, gelesen ───────────────────────────────────────────

const rundown = (items: ReturnType<typeof previewRundown>['items']) =>
  rundownFromPreview({ items, skipped: [], unresolved: [], ignoredColumns: [] }, quelleAngabe())

describe('rundownFindings', () => {
  it('meldet einen Punkt, dessen Objekt aus dem Plan verschwunden ist', () => {
    // Das ist „a schedule change lists what it invalidates", von der anderen
    // Seite gelesen: wer Kamera 1 aus dem Plan nimmt, entwertet jeden Punkt,
    // der sie benutzt — und bis heute sieht das niemand.
    const p = previewRundown(KOPF, [['1', 'Panel', '14:20', '', 'Kamera 1']], ZUORDNUNG, seed())
    const ohneKamera = { ...seed(), cameras: [] }
    const f = rundownFindings(rundown(p.items), ohneKamera)
    expect(f.map((x) => x.kind)).toEqual<RundownFindingKind[]>(['ref-missing'])
    expect(f[0].message).toContain('Kamera 1')
    expect(f[0].message).toContain('Panel')
  })

  it('meldet nichts, solange das Objekt im Plan steht', () => {
    const p = previewRundown(KOPF, [['1', 'Panel', '14:20', '', 'Kamera 1']], ZUORDNUNG, seed())
    expect(rundownFindings(rundown(p.items), seed())).toHaveLength(0)
  })

  it('nennt einen Punkt ohne einordbare Zeit', () => {
    const p = previewRundown(KOPF, [['1', 'Pause', 'irgendwann', '', '']], ZUORDNUNG, seed())
    const f = rundownFindings(rundown(p.items), seed())
    expect(f.map((x) => x.kind)).toEqual<RundownFindingKind[]>(['no-time'])
    expect(f[0].message).toContain('irgendwann')
  })

  it('meldet NICHT, dass zwei gleichzeitige Punkte dasselbe Geraet benutzen', () => {
    // Eine Kamera darf in zwei gleichzeitigen Punkten stehen — sie haelt die
    // Totale ueber die ganze Show. Ein Befund, der bei jeder Totalen
    // anschlaegt, wird weggeklickt, und mit ihm `ref-missing` daneben.
    const p = previewRundown(
      KOPF,
      [
        ['1', 'Panel', '14:20', '60', 'Kamera 1'],
        ['2', 'Interview', '14:30', '10', 'Kamera 1'],
      ],
      ZUORDNUNG,
      seed(),
    )
    expect(rundownFindings(rundown(p.items), seed())).toHaveLength(0)
  })

  it('meldet NICHT, dass ein Geraet in keinem Punkt vorkommt', () => {
    const p = previewRundown(KOPF, [['1', 'Panel', '14:20', '', 'Kamera 1']], ZUORDNUNG, seed())
    const f = rundownFindings(rundown(p.items), seed())
    expect(f.some((x) => /Kamera 2|Key Host|SDI 1/.test(x.message))).toBe(false)
  })

  it('kennt genau zwei Befund-Arten', () => {
    // Ein Befund mehr ist billig anzulegen und teuer im Betrieb. Wer einen
    // hinzufuegt, muss hier vorbei und dabei an den Fehlalarm denken.
    const union = quelle
      .split('export type RundownFindingKind =')[1]
      .split('\n')[0]
    expect([...union.matchAll(/'([a-z-]+)'/g)].map((m) => m[1])).toEqual([
      'ref-missing',
      'no-time',
    ])
  })
})

describe('rundownCoverage — eine Zahl statt eines Befundes', () => {
  it('zaehlt, was der Ablauf abdeckt, und nennt den Rest beim Namen', () => {
    const p = previewRundown(KOPF, [['1', 'Panel', '14:20', '', 'Kamera 1']], ZUORDNUNG, seed())
    const c = rundownCoverage(rundown(p.items), seed())
    expect(c).toEqual({
      referenced: 1,
      total: 5,
      unreferenced: ['Kamera 2', 'Key Host', 'Mischer', 'SDI 1'],
    })
  })
})

describe('rundownSchedule — die Umkehrung: wann wird DIESES Objekt gebraucht (B-34)', () => {
  const dreiPunkte = () =>
    previewRundown(
      KOPF,
      [
        ['1', 'Soundcheck', '10:00', '90', 'Kamera 1'],
        ['2', 'Panel', '14:20', '60', 'Kamera 1; Mischer'],
        ['3', 'Abbau', 'nach Ende', '', 'Kamera 1'],
      ],
      ZUORDNUNG,
      seed(),
    )

  it('nennt die Punkte eines Objekts in Ablauf-Reihenfolge', () => {
    const plan = rundownSchedule(rundown(dreiPunkte().items), seed())
    const k1 = plan.find((o) => o.id === 'c1')!
    expect(k1.points.map((p) => p.title)).toEqual(['Soundcheck', 'Panel', 'Abbau'])
    expect(k1.points.map((p) => p.cue)).toEqual(['1', '2', '3'])
  })

  it('spannt vom fruehesten bis zum spaetesten Punkt MIT Zeit', () => {
    const k1 = rundownSchedule(rundown(dreiPunkte().items), seed()).find((o) => o.id === 'c1')!
    expect(k1.firstMin).toBe(10 * 60)
    expect(k1.lastMin).toBe(14 * 60 + 20)
    // Die Dauer des LETZTEN Punktes mit Zeit steht daneben, wird aber nicht
    // aufaddiert: was ein Geraet nach seinem Auftritt noch braucht — Abbau,
    // Reserve, Umbau —, weiss dieser Ablauf nicht.
    expect(k1.lastDurationMin).toBe(60)
  })

  it('zaehlt Punkte ohne lesbare Zeit, statt sie in die Spanne zu ziehen', () => {
    // „nach Ende" ist keine Zeit. Sie stillschweigend zu ueberspringen waere
    // die kleinere Luege; sie als Ende zu nehmen die groessere.
    const k1 = rundownSchedule(rundown(dreiPunkte().items), seed()).find((o) => o.id === 'c1')!
    expect(k1.pointsWithoutTime).toBe(1)
    expect(k1.points).toHaveLength(3)
  })

  it('sagt „kommt vor, aber niemand weiss wann", wenn ALLE Punkte zeitlos sind', () => {
    const p = previewRundown(KOPF, [['1', 'Ruestzeit', 'offen', '', 'Kamera 2']], ZUORDNUNG, seed())
    const k2 = rundownSchedule(rundown(p.items), seed()).find((o) => o.id === 'c2')!
    expect(k2.points).toHaveLength(1)
    expect(k2.firstMin).toBeNull()
    expect(k2.lastMin).toBeNull()
    expect(k2.lastDurationMin).toBeNull()
  })

  it('fuehrt auch die Objekte, die in KEINEM Punkt vorkommen', () => {
    // Eine Liste nur der verplanten Objekte laesst den Leser glauben, es
    // gaebe keine anderen. `points: []` ist eine Aussage, ein fehlender
    // Eintrag ist keine.
    const plan = rundownSchedule(rundown(dreiPunkte().items), seed())
    expect(plan).toHaveLength(5)
    const ohne = plan.filter((o) => o.points.length === 0).map((o) => o.name)
    expect(ohne).toEqual(['Kamera 2', 'Key Host', 'SDI 1'])
  })

  it('zaehlt ein Objekt einmal, auch wenn ein Punkt es zweimal nennt', () => {
    const p = previewRundown(
      KOPF,
      [['1', 'Panel', '14:20', '20', 'Kamera 1; Kamera 1']],
      ZUORDNUNG,
      seed(),
    )
    const k1 = rundownSchedule(rundown(p.items), seed()).find((o) => o.id === 'c1')!
    expect(k1.points).toHaveLength(1)
  })

  it('meldet keine Luecke — auch hier ist es eine Liste und kein Befund', () => {
    // Derselbe Grund wie bei `coverage`: auf einem halb eingelesenen Ablauf
    // waere jede Meldung ein Fehlalarm.
    const plan = rundownSchedule(rundown(dreiPunkte().items), seed())
    expect(Object.keys(plan[0])).not.toContain('severity')
    expect(quelle).not.toMatch(/kind: 'never-needed'/)
  })

  it('kommt mit einem leeren Ablauf zurecht', () => {
    const plan = rundownSchedule(rundown([]), seed())
    expect(plan).toHaveLength(5)
    expect(plan.every((o) => o.points.length === 0 && o.firstMin === null)).toBe(true)
  })
})

// ── 4. Nur lesen ───────────────────────────────────────────────────────────

describe('E-18 — nur lesen', () => {
  it('bietet keinen Weg, einen Ablauf-Punkt anzulegen oder zu aendern', () => {
    // Die Entscheidung vom 2026-09-07 lautet: die Autorenschaft bleibt in der
    // Tabelle. Eine Funktion, die hier einen Punkt anlegt, umsortiert oder
    // seine Zeit setzt, waere die Entscheidung stillschweigend gekippt.
    expect(quelle).not.toMatch(/export function (add|update|remove|move|insert)Rundown/)
    expect(quelle).not.toMatch(/export function set(Start|Item|Rundown)/)
    // Es gibt genau EINEN Weg, an einen Ablauf zu kommen: aus einer
    // bestaetigten Vorschau.
    expect(quelle.match(/\): Rundown \{/g) ?? []).toHaveLength(1)
    expect(quelle).toContain('export function rundownFromPreview')
  })

  it('haelt fest, woher der Stand kommt — die Herkunft ist Pflicht', () => {
    // Ein Ablauf ohne Herkunft sieht aus wie einer, den die Suite fuehrt.
    expect(quelle).toMatch(/source: RundownSource\b/)
    expect(isRundown({ ...rundown([]), source: undefined })).toBe(false)
    expect(isRundown(rundown([]))).toBe(true)
    // Eine fremde Formatversion wird abgelehnt, auch wenn sonst alles passt:
    // sonst liest eine aeltere Fassung einen neueren Ablauf halb ein.
    expect(isRundown({ ...rundown([]), formatVersion: 2 })).toBe(false)
    expect(isRundown({ ...rundown([]), kind: 'suite-seed' })).toBe(false)
    expect(isRundown({ ...rundown([]), items: 'keine Liste' })).toBe(false)
    expect(isRundown(null)).toBe(false)
  })

  it('nimmt die Uhrzeit nicht selbst', () => {
    // Der Zeitstempel des Imports wird hereingereicht. Sonst waere diese
    // Datei nicht mehr rein und der Import nicht mehr wiederholbar.
    expect(quelle).not.toContain('new Date')
    expect(quelle).not.toContain('Date.now')
  })

  it('kennt genau die Felder, die die Zuordnung anbieten darf', () => {
    expect(RUNDOWN_FIELDS).toEqual(['cue', 'title', 'start', 'duration', 'note', 'refs'])
  })
})

describe('Meldungstexte in richtigem Deutsch', () => {
  it('benutzt keinen ASCII-Ersatz in String-Literalen', () => {
    // AUFGEFALLEN AM SCREENSHOT (2026-09-07), nicht am Test: auf der Karte
    // stand „traegt die Zeit". Die KOMMENTARE dieser Codebasis sind bewusst
    // ASCII; die STRINGS stehen im Dialog, auf der Karte und im CSV-Blatt
    // und werden dort neben richtig gesetzten Umlauten gelesen.
    const ohneKommentare = quelle
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
    const literale = [...ohneKommentare.matchAll(/'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)]
      .map((m) => m[1] ?? m[2])
      .filter(Boolean)
    const ersatz =
      /(Geraet|gehoert|ueber|waere|wuerde|fuer |Schluessel|laesst|traegt|aeuss|fuehrt|koenn|muess|naechst|loesch|groess|zurueck|Laenge|Groesse|Aenderung|unveraendert)/
    const schlecht = literale.filter((l) => ersatz.test(l))
    expect(schlecht, `ASCII-Ersatz in Texten: ${schlecht.join(' | ')}`).toEqual([])
  })
})
