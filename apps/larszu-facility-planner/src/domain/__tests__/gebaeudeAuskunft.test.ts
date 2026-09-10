import { describe, expect, it } from 'vitest'
import {
  adresseMehrdeutig,
  geschaltetVon,
  punkteMitLage,
  trassenZwischen,
  wegFrei,
} from '../gebaeudeAuskunft'
import { heileGebaeude, leeresGebaeude } from '../modell'
import type { Anschlusspunkt, Gebaeude, Schaltstelle, Steuerklinke, Trasse } from '../modell'

// ---------------------------------------------------------------------------
// Die Auskünfte des Gebäude-Werkzeugs über seine eigenen Daten (Issue #1).
//
// SIE SIND NICHT TEIL DES VERTRAGS, und das prüft `vertrag.test.ts` von der
// anderen Seite: dort darf keine unbenannte siebte Frage entstehen. Hier steht
// deshalb, was diese Auskünfte leisten — und vor allem, wo sie sich WEIGERN,
// eine Antwort zu erfinden.
// ---------------------------------------------------------------------------

const punkt = (teil: Partial<Anschlusspunkt> & { id: string }): Anschlusspunkt => ({
  bezeichnung: teil.id,
  art: 'dose',
  raumId: 'r-saal',
  anschlussart: 'schuko',
  netzform: 'TN-S',
  absicherungA: 16,
  charakteristik: 'B',
  rcdTyp: 'A',
  ...teil,
})

const trasse = (teil: Partial<Trasse> & { id: string }): Trasse => ({
  bezeichnung: teil.id,
  vonRaumId: 'r-saal',
  nachRaumId: 'r-regie',
  belegung: 'unbekannt',
  ...teil,
})

const stelle = (teil: Partial<Schaltstelle> & { id: string }): Schaltstelle => ({
  bezeichnung: teil.id,
  raumId: 'r-saal',
  bauart: 'ausschalter',
  schaltetPunkte: [],
  ...teil,
})

const haus = (teil: Partial<Gebaeude> = {}): Gebaeude =>
  heileGebaeude({
    ...leeresGebaeude('h', 'Haus'),
    raeume: [
      { id: 'r-saal', name: 'Saal', hausbezeichner: 'S-01' },
      { id: 'r-regie', name: 'Regie', hausbezeichner: 'R-01' },
    ],
    ...teil,
  })

describe('Wer schaltet diesen Punkt?', () => {
  it('nennt die benannte Stelle, wenn es eine gibt', () => {
    const g = haus({
      punkte: [punkt({ id: 'p1' })],
      schaltstellen: [stelle({ id: 's1', bezeichnung: 'Schalter links', schaltetPunkte: ['p1'] })],
    })
    const h = geschaltetVon(g, 'p1')
    expect(h.art).toBe('stelle')
    expect(h.art === 'stelle' && h.stelle.bezeichnung).toBe('Schalter links')
  })

  it('nimmt die Angabe des Betreibers, wenn keine Stelle benannt ist', () => {
    const g = haus({ punkte: [punkt({ id: 'p1', geschaltet: true })] })
    expect(geschaltetVon(g, 'p1').art).toBe('angabe')
  })

  it('unterscheidet „nein" von „niemand hat es gesagt"', () => {
    // DER KERN DIESER FUNKTION. Beides als `false` zu behandeln waere die
    // bequeme Antwort und die falsche: „nicht geschaltet" auf einem Blatt
    // heisst, dass jemand ein Netzteil an diese Dose haengt.
    const gNein = haus({ punkte: [punkt({ id: 'p1', geschaltet: false })] })
    const gStill = haus({ punkte: [punkt({ id: 'p1' })] })
    expect(geschaltetVon(gNein, 'p1').art).toBe('nein')
    expect(geschaltetVon(gStill, 'p1').art).toBe('unbekannt')
  })

  it('die Stelle schlaegt die Angabe — sie ist die genauere Auskunft', () => {
    // Wer eine Stelle benannt hat, hat mehr gesagt als „ja". Faellt diese
    // Reihenfolge weg, verliert die Antwort den Raum und die Bezeichnung,
    // also genau das, wonach jemand im Aufbau sucht.
    const g = haus({
      punkte: [punkt({ id: 'p1', geschaltet: true })],
      schaltstellen: [stelle({ id: 's1', schaltetPunkte: ['p1'] })],
    })
    expect(geschaltetVon(g, 'p1').art).toBe('stelle')
  })
})

describe('Trassen zwischen zwei Raeumen', () => {
  it('findet sie in BEIDEN Richtungen', () => {
    // Ein Leerrohr von A nach B ist dasselbe wie von B nach A. Wer nur eine
    // Richtung sucht, findet die Haelfte der Wege und plant eine zweite
    // Leitung, wo schon eine liegt.
    const g = haus({ trassen: [trasse({ id: 't1' })] })
    expect(trassenZwischen(g, 'r-saal', 'r-regie')).toHaveLength(1)
    expect(trassenZwischen(g, 'r-regie', 'r-saal')).toHaveLength(1)
  })

  it('meldet „keine-trasse" statt „voll", wenn es gar keinen Weg gibt', () => {
    // Zwei verschiedene Aussagen: „da ist ein Rohr und es ist voll" und „da
    // ist kein Rohr". Die erste laesst sich mit Aufwand aendern, die zweite
    // nicht.
    expect(wegFrei(haus(), 'r-saal', 'r-regie')).toBe('keine-trasse')
  })

  it('nimmt die beste Belegung, wenn mehrere Wege da sind', () => {
    const g = haus({
      trassen: [
        trasse({ id: 't-voll', belegung: 'voll' }),
        trasse({ id: 't-frei', belegung: 'frei' }),
      ],
    })
    expect(wegFrei(g, 'r-saal', 'r-regie')).toBe('frei')
  })

  it('laesst „unbekannt" NICHT als „frei" durchgehen', () => {
    // GEGENPROBE gegen die naheliegende Vereinfachung. Eine Trasse, bei der
    // niemand nachgesehen hat, ist kein Weg, auf den man sich verlaesst —
    // aber auch kein Ausschluss. Sie steht deshalb zwischen `teilbelegt` und
    // `voll` und nie an der Spitze.
    const g = haus({
      trassen: [
        trasse({ id: 't-unbekannt', belegung: 'unbekannt' }),
        trasse({ id: 't-teil', belegung: 'teilbelegt' }),
      ],
    })
    expect(wegFrei(g, 'r-saal', 'r-regie')).toBe('teilbelegt')
  })
})

describe('Punkte im Grundriss', () => {
  it('laesst Punkte ohne Lage WEG statt sie auf (0,0) zu legen', () => {
    // Ein Stapel Marken in der linken oberen Ecke sieht aus wie eine Aussage
    // ueber das Gebaeude und ist keine.
    const g = haus({
      punkte: [punkt({ id: 'p-mit', lage: { xM: 2, yM: 3 } }), punkt({ id: 'p-ohne' })],
    })
    const mit = punkteMitLage(g, 'r-saal')
    expect(mit.map((p) => p.id)).toEqual(['p-mit'])
    expect(mit[0].lage).toEqual({ xM: 2, yM: 3 })
  })

  it('nimmt nur die Punkte des gefragten Raums', () => {
    const g = haus({
      punkte: [
        punkt({ id: 'p-saal', lage: { xM: 1, yM: 1 } }),
        punkt({ id: 'p-regie', raumId: 'r-regie', lage: { xM: 1, yM: 1 } }),
      ],
    })
    expect(punkteMitLage(g, 'r-saal').map((p) => p.id)).toEqual(['p-saal'])
  })
})

describe('Ein altes Dokument ueberlebt die neuen Felder', () => {
  it('heilt fehlende Listen statt an ihnen zu sterben', () => {
    // `trassen` und `schaltstellen` kamen am 2026-09-10 dazu. Jede Datei, die
    // vorher geschrieben wurde, hat die Felder nicht — und ohne diese Stelle
    // wirft die erste Schleife darueber, und zwar nicht beim Laden, sondern
    // irgendwo in einer Sicht.
    const alt = { id: 'h', name: 'Haus', raeume: [], punkte: [] } as unknown as Gebaeude
    const geheilt = heileGebaeude(alt)
    expect(geheilt.trassen).toEqual([])
    expect(geheilt.schaltstellen).toEqual([])
    expect(geschaltetVon(geheilt, 'gibt-es-nicht').art).toBe('unbekannt')
  })
})

describe('Mehrdeutige Steuer-Adressen', () => {
  const klinke = (teil: Partial<Steuerklinke> & { id: string }): Steuerklinke => ({
    system: 'dali',
    adresse: '3',
    richtung: 'schalten',
    bedeutung: 'Saallicht',
    ...teil,
  })

  it('meldet eine DALI-Adresse OHNE Adressart', () => {
    // Der Fall aus alten Dokumenten: `adressart` kam spaeter dazu. „3" ist dann
    // eine Zahl ohne Reichweite — Vorschaltgeraet, Gruppe oder alles am Bus.
    expect(adresseMehrdeutig(klinke({ id: 'k1' }))).toBe(true)
  })

  it('schweigt, sobald die Art dabeisteht', () => {
    expect(adresseMehrdeutig(klinke({ id: 'k1', adressart: 'kurz' }))).toBe(false)
    expect(adresseMehrdeutig(klinke({ id: 'k2', adressart: 'gruppe' }))).toBe(false)
    expect(adresseMehrdeutig(klinke({ id: 'k3', adressart: 'broadcast' }))).toBe(false)
  })

  it('meldet KNX, Crestron und Vissonic NICHT', () => {
    // GEGENPROBE. Dort ist die Adresse aus sich heraus eindeutig; eine Warnung
    // an jeder Zeile waere Laerm, und Laerm liest nach der dritten Zeile
    // niemand mehr.
    for (const system of ['knx', 'crestron', 'vissonic', 'sonstige'] as const) {
      expect(adresseMehrdeutig(klinke({ id: `k-${system}`, system }))).toBe(false)
    }
  })
})
