import { describe, expect, it } from 'vitest'
import { berechneDiff, type TallyDevice } from '../src/shell/TallyPushPanel'

// ───────────────────────────────────────────────────────────────────────────
// Der Abgleich vor dem Senden.
//
// Warum er existiert: `merge_tally_config` auf dem Pi behaelt jedes Feld, das
// der POST nicht mitbringt (ATEM-Adresse, GPIO-Verdrahtung) -- aber GERAETE,
// die der POST nicht nennt, verschwinden. Das ist die richtige Semantik und
// trotzdem eine Wirkung, die niemand ungefragt ausloesen soll. Der Diff ist
// der Satz, den der Nutzer vor dem Klick liest; er muss stimmen.
// ───────────────────────────────────────────────────────────────────────────

const d = (id: string, name: string, input: number): TallyDevice => ({ id, name, input })

describe('Tally-Abgleich Plan gegen Pi', () => {
  it('nennt neue, geaenderte und wegfallende Eintraege getrennt', () => {
    const diff = berechneDiff(
      [d('a', 'CAM 1', 1), d('b', 'CAM 2 neu', 5), d('c', 'CAM 3', 3)],
      [d('a', 'CAM 1', 1), d('b', 'CAM 2', 2), d('x', 'Handverdrahtet', 9)],
    )
    expect(diff.neu.map((x) => x.id)).toEqual(['c'])
    expect(diff.geaendert.map((x) => x.neu.id)).toEqual(['b'])
    expect(diff.entfaellt.map((x) => x.id)).toEqual(['x'])
    expect(diff.unveraendert).toBe(1)
  })

  it('zaehlt eine geaenderte Eingangsnummer als Aenderung, nicht als unveraendert', () => {
    // Der Fall, der beim Umpatchen wirklich vorkommt: gleicher Name, anderer
    // Mischer-Eingang. Wer ihn als „unveraendert" fuehrt, sendet nichts und
    // laesst die Lampe am falschen Eingang haengen.
    const diff = berechneDiff([d('a', 'CAM 1', 4)], [d('a', 'CAM 1', 1)])
    expect(diff.geaendert).toHaveLength(1)
    expect(diff.unveraendert).toBe(0)
  })

  it('meldet bei leerem Plan JEDEN Pi-Eintrag als wegfallend', () => {
    // Genau der gefaehrliche Fall: ein Plan ohne Tally-Rollen wuerde die
    // Konfiguration des Pi leeren. Der Abgleich muss das vorher sagen.
    const diff = berechneDiff([], [d('a', 'CAM 1', 1), d('b', 'CAM 2', 2)])
    expect(diff.entfaellt).toHaveLength(2)
    expect(diff.neu).toHaveLength(0)
  })

  it('ist bei identischen Listen leer', () => {
    const gleich = [d('a', 'CAM 1', 1)]
    const diff = berechneDiff(gleich, [...gleich])
    expect(diff.neu.concat(diff.entfaellt)).toHaveLength(0)
    expect(diff.geaendert).toHaveLength(0)
    expect(diff.unveraendert).toBe(1)
  })
})

describe('Tally-Senden — der leere Plan', () => {
  it('ist als Zustand erkennbar: nichts neu, nichts geaendert, alles entfaellt', () => {
    // Der Guard fuer die Regel im Panel („leerer Plan = Knopf aus"). Gemessen
    // am Stub-Pi mit den echten merge/validate-Funktionen aus guide_server.py:
    // eine Sendung mit null Quellen leerte dessen Geraeteliste, waehrend die
    // ATEM-Adresse blieb. Die Warnung allein reichte nicht.
    const diff = berechneDiff([], [d('a', 'CAM 1', 1)])
    const nurLoeschen = diff.neu.length === 0 && diff.geaendert.length === 0 && diff.entfaellt.length > 0
    expect(nurLoeschen).toBe(true)
  })
})
