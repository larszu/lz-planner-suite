import { describe, expect, it, vi } from 'vitest'
import {
  scanFaehigkeit,
  einLesen,
  hindernisText,
  type CodeLeser,
  type ScanUmgebung,
} from '../../lib/codeLeser'

// ───────────────────────────────────────────────────────────────────────────
// Der Kamera-Scan (B-65).
//
// Getestet wird, was MEIN Code tut — die Fähigkeits-Prüfung und die
// Lese-Schleife. Der Leser wird hineingereicht; eine echte Kamera und ein
// echter Decoder sind ausdrücklich NICHT Gegenstand dieser Datei, und genau
// dafür ist `CodeLeser` eine Schnittstelle mit einer Methode.
// ───────────────────────────────────────────────────────────────────────────

const u = (o: Partial<ScanUmgebung> = {}): ScanUmgebung => ({
  sichererKontext: true,
  hatKameraApi: true,
  hatDecoder: true,
  ...o,
})

// Ein Bild braucht die Schleife nicht wirklich — sie reicht es nur durch.
const BILD = {} as CanvasImageSource

const leserDer = (...antworten: string[][]): CodeLeser => {
  let i = 0
  return { lies: async () => antworten[Math.min(i++, antworten.length - 1)] }
}

describe('scanFaehigkeit — ein Grund mit Namen statt eines toten Knopfs', () => {
  it('1. alles da: der Scan ist möglich', () => {
    expect(scanFaehigkeit(u())).toEqual({ moeglich: true })
  })

  it('2. jeder Mangel hat seinen eigenen Grund', () => {
    expect(scanFaehigkeit(u({ sichererKontext: false }))).toEqual({
      moeglich: false,
      grund: 'unsicherer-kontext',
    })
    expect(scanFaehigkeit(u({ hatKameraApi: false }))).toEqual({
      moeglich: false,
      grund: 'keine-kamera-api',
    })
    expect(scanFaehigkeit(u({ hatDecoder: false }))).toEqual({
      moeglich: false,
      grund: 'kein-decoder',
    })
  })

  it('3. bei mehreren Mängeln wird der genannt, den man zuerst behebt', () => {
    // Drei Gruende auf einmal sind keine Auskunft. Die Reihenfolge ist die,
    // in der ein Mensch sie abarbeiten wuerde.
    expect(
      scanFaehigkeit(u({ sichererKontext: false, hatKameraApi: false, hatDecoder: false })).moeglich,
    ).toBe(false)
    expect(
      (scanFaehigkeit(u({ sichererKontext: false, hatKameraApi: false, hatDecoder: false })) as {
        grund: string
      }).grund,
    ).toBe('unsicherer-kontext')
  })

  it('4. jeder Grund hat einen Satz, den man vorlesen kann', () => {
    // Ein Grund ohne Text waere ein Fehlercode im Gesicht des Lageristen.
    // Ohne `t` geliefert: das ist die QUELLE (Englisch, E-28). Der Lauf
    // misst damit den Text, der erscheint, wenn keine Übersetzung greift —
    // und genau der ist die Rückfallebene, die niemand pflegt.
    const gruende = ['unsicherer-kontext', 'keine-kamera-api', 'kein-decoder', 'keine-erlaubnis'] as const
    for (const grund of gruende) {
      const text = hindernisText(grund)
      expect(text.length, `${grund} ohne Text`).toBeGreaterThan(30)
      expect(text.trim().endsWith('.'), `${grund} ohne Satzende`).toBe(true)
    }
  })
})

describe('einLesen — die Schleife', () => {
  it('1. ein erkannter Code kommt einmal an', async () => {
    const gesehen: string[] = []
    await einLesen(leserDer(['ART-1']), BILD, new Map(), 1000, { aufCode: (c) => gesehen.push(c) })
    expect(gesehen).toEqual(['ART-1'])
  })

  it('2. derselbe Aufkleber im Bild meldet sich NICHT dreissigmal pro Sekunde', async () => {
    // Der eigentliche Zweck der Sperre: ohne sie waere die Trefferliste der
    // Inventur nach zwei Sekunden unlesbar, und der Lagerist saehe nicht
    // mehr, was er wirklich erfasst hat.
    const gesehen: string[] = []
    const zuletzt = new Map<string, number>()
    const leser = leserDer(['ART-1'])
    for (const t of [1000, 1033, 1066, 1100]) {
      await einLesen(leser, BILD, zuletzt, t, { aufCode: (c) => gesehen.push(c) })
    }
    expect(gesehen).toEqual(['ART-1'])
  })

  it('3. nach Ablauf der Sperre zählt derselbe Code wieder', async () => {
    // Zweimal dasselbe Modell nacheinander vor die Kamera zu halten ist im
    // Lager der Normalfall, kein Doppelklick.
    const gesehen: string[] = []
    const zuletzt = new Map<string, number>()
    const leser = leserDer(['ART-1'])
    await einLesen(leser, BILD, zuletzt, 1000, { aufCode: (c) => gesehen.push(c) })
    await einLesen(leser, BILD, zuletzt, 2600, { aufCode: (c) => gesehen.push(c) })
    expect(gesehen).toEqual(['ART-1', 'ART-1'])
  })

  it('4. die Sperre gilt je Code, nicht global', async () => {
    const gesehen: string[] = []
    await einLesen(leserDer(['ART-1', 'ART-2']), BILD, new Map(), 1000, {
      aufCode: (c) => gesehen.push(c),
    })
    expect(gesehen).toEqual(['ART-1', 'ART-2'])
  })

  it('5. ein Fehler des Lesers wird benannt, nicht verschluckt', async () => {
    const fehler: string[] = []
    const gesehen: string[] = []
    const kaputt: CodeLeser = { lies: async () => { throw new Error('Kamera weg') } }
    await einLesen(kaputt, BILD, new Map(), 1000, {
      aufCode: (c) => gesehen.push(c),
      aufFehler: (m) => fehler.push(m),
    })
    expect(gesehen).toEqual([])
    expect(fehler).toEqual(['Kamera weg'])
  })

  it('6. ein leeres Bild ist kein Fehler', async () => {
    const fehler: string[] = []
    const gesehen: string[] = []
    await einLesen(leserDer([]), BILD, new Map(), 1000, {
      aufCode: (c) => gesehen.push(c),
      aufFehler: (m) => fehler.push(m),
    })
    expect(gesehen).toEqual([])
    expect(fehler).toEqual([])
  })

  it('7. die Sperrzeit ist einstellbar', async () => {
    const gesehen: string[] = []
    const zuletzt = new Map<string, number>()
    const leser = leserDer(['ART-1'])
    await einLesen(leser, BILD, zuletzt, 1000, { aufCode: (c) => gesehen.push(c), sperreMs: 100 })
    await einLesen(leser, BILD, zuletzt, 1150, { aufCode: (c) => gesehen.push(c), sperreMs: 100 })
    expect(gesehen).toEqual(['ART-1', 'ART-1'])
  })
})

describe('umgebungLesen — die Messung liest wirklich das Fenster', () => {
  it('1. sie liest wirklich das Fenster — und jsdom ist kein sicherer Kontext', async () => {
    // ─── DIESER TEST HAT SICH AM 2026-09-10 VERSCHOBEN ──────────────────
    //
    // Er verlangte, dass `hatDecoder` hier `false` ist, denn jsdom bringt
    // keinen `BarcodeDetector` mit — und das war richtig, solange der
    // native Leser der einzige war. Seit das WASM mitgeliefert wird, ist
    // ein Decoder IMMER da; er muss nur geladen werden. `hatDecoder` ist
    // damit keine Eigenschaft des Browsers mehr, sondern eine der
    // Lieferung, und sie steht auf `true`.
    //
    // Die Gegenprobe, um die es dem Test ging, bleibt: die Messung darf
    // nicht einfach `moeglich: true` sagen. jsdom ist kein sicherer
    // Kontext, und genau daran fällt sie hier — nicht am Decoder.
    vi.resetModules()
    const mod = await import('../../lib/codeLeser')
    const echt = mod.umgebungLesen()
    expect(echt.hatDecoder, 'das WASM wird mitgeliefert — ein Decoder ist da').toBe(true)
    expect(echt.sichererKontext, 'jsdom ist kein sicherer Kontext').toBe(false)
    expect(mod.scanFaehigkeit(echt)).toEqual({
      moeglich: false,
      grund: 'unsicherer-kontext',
    })
  })

  it('2. faellt der Decoder aus, ist der Grund weiterhin benannt', async () => {
    // Der Fall gibt es noch: das WASM laedt nicht (kaputtes Buendel,
    // blockiertes WASM). Dann sagt die Oberflaeche, woran es liegt, statt
    // eine Kamera zu oeffnen, die nie etwas erkennt.
    vi.resetModules()
    const mod = await import('../../lib/codeLeser')
    expect(
      mod.scanFaehigkeit({ sichererKontext: true, hatKameraApi: true, hatDecoder: false }),
    ).toEqual({ moeglich: false, grund: 'kein-decoder' })
  })

  it('3. `waehleLeser` nimmt den nativen, wenn es ihn gibt', async () => {
    // Er ist schon da und kostet keinen Ladevorgang — das WASM erst dann.
    //
    // Der Pruefstand hat KEIN `window` (dieser Lauf ist node, nicht jsdom),
    // also wird eines untergeschoben. Genau deshalb steht der Zugriff im
    // Modul hinter `typeof window`: ohne Fenster gibt es keinen nativen
    // Leser, und das ist eine Auskunft und kein Absturz.
    vi.resetModules()
    const mod = await import('../../lib/codeLeser')
    const g = globalThis as unknown as { window?: unknown }
    expect(mod.nativerLeser(), 'ohne Fenster kein nativer Leser').toBeUndefined()
    g.window = {
      BarcodeDetector: class {
        async detect() {
          return [{ rawValue: 'NATIV-1' }]
        }
      },
    }
    try {
      const leser = await mod.waehleLeser()
      expect(leser).toBeDefined()
      expect(await leser!.lies(BILD)).toEqual(['NATIV-1'])
    } finally {
      delete g.window
    }
  })
})
