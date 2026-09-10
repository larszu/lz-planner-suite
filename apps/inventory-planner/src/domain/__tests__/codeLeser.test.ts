import { describe, expect, it, vi } from 'vitest'
import {
  scanFaehigkeit,
  einLesen,
  HINDERNIS_TEXT,
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
    for (const [grund, text] of Object.entries(HINDERNIS_TEXT)) {
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
  it('1. sie liest wirklich das Fenster — und findet hier keinen Decoder', async () => {
    // Gegenprobe zur Messung selbst: eine Prüfung, die immer `true` sagt,
    // wäre genau der tote Knopf, gegen den diese Datei geschrieben ist.
    //
    // Der Prüfstand ist jsdom, und der bringt WEDER einen BarcodeDetector
    // MIT NOCH einen sicheren Kontext — deshalb steht hier nicht
    // `grund: 'kein-decoder'`. Das wäre die bequeme Erwartung und die
    // falsche: sie hiesse, jsdom sei https, und der Test bewiese am Ende
    // die Reihenfolge der Prüfungen statt die Messung.
    vi.resetModules()
    const mod = await import('../../lib/codeLeser')
    const echt = mod.umgebungLesen()
    expect(echt.hatDecoder, 'jsdom hat keinen BarcodeDetector').toBe(false)
    expect(mod.scanFaehigkeit(echt).moeglich).toBe(false)
    // Und dieselbe Messung mit sicherem Kontext benennt den Decoder:
    expect(mod.scanFaehigkeit({ ...echt, sichererKontext: true, hatKameraApi: true })).toEqual({
      moeglich: false,
      grund: 'kein-decoder',
    })
  })
})
