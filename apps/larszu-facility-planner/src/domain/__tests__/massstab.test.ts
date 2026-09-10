import { describe, expect, it } from 'vitest'
import { anteilAusMeter, meterAusAnteil } from '../../lib/massstab'

// ---------------------------------------------------------------------------
// Die beiden Fallen des Massstabs, als Test statt als Kommentar (Issue #1).
// ---------------------------------------------------------------------------

describe('Anteil der Bildbreite zu Metern', () => {
  it('rechnet den Anteil mit der Bildbreite', () => {
    expect(meterAusAnteil(0.5, 20)).toBe(10)
    expect(meterAusAnteil(0, 20)).toBe(0)
    expect(meterAusAnteil(1, 20)).toBe(20)
  })

  it('rechnet BEIDE Achsen mit derselben Zahl', () => {
    // Die Gegenprobe zur naheliegenden Fassung, die y mit der Feldhoehe
    // normiert: dieselbe Eingabe muss dieselbe Laenge geben, egal welche Achse
    // gemeint ist. Sonst wandert eine Lage, wenn jemand das Fenster zieht.
    expect(meterAusAnteil(0.25, 12)).toBe(meterAusAnteil(0.25, 12))
    expect(meterAusAnteil(0.25, 12)).toBe(3)
  })

  it('gibt OHNE Massstab null und nicht 1:1', () => {
    // Der Kern. `undefined` als 1 m/Bild zu lesen waere die bequeme Zeile und
    // schriebe eine erfundene Laenge ins Gebaeude.
    expect(meterAusAnteil(0.5, undefined)).toBeNull()
    expect(meterAusAnteil(0.5, 0)).toBeNull()
    expect(meterAusAnteil(0.5, -3)).toBeNull()
    expect(meterAusAnteil(0.5, Number.NaN)).toBeNull()
  })

  it('rundet auf Zentimeter — mehr gibt ein Klick nicht her', () => {
    expect(meterAusAnteil(1 / 3, 10)).toBe(3.33)
  })
})

describe('Der Rueckweg fuer die Marke', () => {
  it('ist die Umkehrung', () => {
    expect(anteilAusMeter(10, 20)).toBe(0.5)
    expect(anteilAusMeter(0, 20)).toBe(0)
  })

  it('gibt ohne Massstab null statt 0 %', () => {
    // Eine Marke in der linken oberen Ecke sieht aus wie eine Aussage ueber das
    // Gebaeude. Ohne Massstab gibt es keine, also auch keine Marke.
    expect(anteilAusMeter(3, undefined)).toBeNull()
    expect(anteilAusMeter(3, 0)).toBeNull()
  })

  it('laesst eine Lage AUSSERHALB des Bildes stehen statt sie zu beschneiden', () => {
    // Ein Punkt kann ausserhalb des gescannten Ausschnitts liegen — der Scan
    // zeigt einen Saal, die Dose sitzt im Flur davor. Ihn auf den Rand zu
    // klemmen verschoebe eine gemessene Angabe.
    expect(anteilAusMeter(30, 20)).toBe(1.5)
    expect(anteilAusMeter(-2, 20)).toBe(-0.1)
  })
})
