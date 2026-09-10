import { describe, expect, it } from 'vitest'
import {
  FACILITY_FORMAT,
  FACILITY_FORMAT_VERSION,
  leseGebaeude,
  serialisiereGebaeude,
} from '../gebaeudeDatei'
import { leeresGebaeude, type Gebaeude } from '../modell'

// ───────────────────────────────────────────────────────────────────────────
// Die Gebäude-Datei (Issue #2, letzter offener Haken).
//
// Was hier zählt, ist nicht „JSON geht rein und raus", sondern die eine
// Zusage, an der der ganze Vertrag hängt: **„nicht angegeben" ist nicht
// „nein".** Beim Lesen ist sie leichter zu brechen als beim Rechnen — ein
// `?? false` in der Heilung sieht nach Sorgfalt aus und macht aus „das Haus
// sagt nichts dazu" die Zusicherung „diese Dose hängt an keinem Schalter".
// Danach plant jemand ein Netzteil darauf.
// ───────────────────────────────────────────────────────────────────────────

const haus = (): Gebaeude => {
  const g = leeresGebaeude('haus-1', 'Stadthalle')
  g.raeume.push({ id: 'r1', name: 'Saal', etage: 'EG', hausbezeichner: 'EG.01' })
  g.punkte.push({
    id: 'p1',
    bezeichnung: 'Bühne links',
    art: 'einspeisung',
    raumId: 'r1',
    anschlussart: 'cee32',
    netzform: 'TN-S',
    absicherungA: 32,
    charakteristik: 'C',
    rcdTyp: 'A',
    montage: 'boden',
    bauform: 'bodentank',
    // ABSICHTLICH nicht gesetzt: `geschaltet` und `dauerleistungW`.
    // Genau diese beiden dürfen den Weg durch die Datei nicht als `false`
    // bzw. `0` überleben.
  })
  g.klinken.push({
    id: 'k1',
    system: 'dali',
    adresse: '7',
    adressart: 'kurz',
    richtung: 'schalten',
    bedeutung: 'Saallicht Reihe 1',
  })
  return g
}

describe('avplan-facility: die Auskunft des Hauses als Datei', () => {
  it('1. der Round-Trip verliert nichts', () => {
    const g = haus()
    const zurueck = leseGebaeude(serialisiereGebaeude(g))
    expect(zurueck).toEqual(g)
  })

  it('2. „nicht angegeben" bleibt nicht angegeben — kein `?? false`', () => {
    const zurueck = leseGebaeude(serialisiereGebaeude(haus()))
    const p = zurueck!.punkte[0]!
    expect(p.geschaltet, 'aus „keine Angabe" darf kein „hängt an keinem Schalter" werden').toBeUndefined()
    expect(p.dauerleistungW, 'und keine gerechnete Dauerleistung').toBeUndefined()
  })

  it('3. die Klinke kommt mit Adressart heraus, wie sie hineinging', () => {
    // Der Unterschied zwischen DALI-Kurzadresse und Gruppenadresse ist der
    // Unterschied zwischen „eine Leuchte" und „die halbe Halle".
    const k = leseGebaeude(serialisiereGebaeude(haus()))!.klinken[0]!
    expect(k.adressart).toBe('kurz')
    expect(k.bedeutung).toBe('Saallicht Reihe 1')
  })

  it('4. eine fremde Datei wird abgewiesen und nicht halb gelesen', () => {
    expect(leseGebaeude('kein json')).toBeNull()
    expect(leseGebaeude(JSON.stringify({ format: 'etwas-anderes', version: 1 }))).toBeNull()
    expect(leseGebaeude(JSON.stringify({ format: FACILITY_FORMAT, version: 1 }))).toBeNull()
  })

  it('5. eine NEUERE Fassung wird abgewiesen', () => {
    // Halb zu lesen waere hier teurer als gar nicht: die fehlenden Felder
    // sind Auskuenfte ueber Strom, an denen jemand eine Last plant.
    const zuNeu = JSON.stringify({
      format: FACILITY_FORMAT,
      version: FACILITY_FORMAT_VERSION + 1,
      gebaeude: haus(),
    })
    expect(leseGebaeude(zuNeu)).toBeNull()
  })

  it('6. fehlende Listen werden ergänzt, damit niemand über `undefined` läuft', () => {
    // Der Unterschied zur Regel oben: eine LISTE, die es geben MUSS, ist
    // keine Auskunft — sie ist Gerüst. Eine fehlende `punkte`-Liste heisst
    // „keine eingetragen", und das ist eine leere Liste.
    const duenn = JSON.stringify({
      format: FACILITY_FORMAT,
      version: 1,
      gebaeude: { id: 'haus-2', name: 'Halle 2' },
    })
    const g = leseGebaeude(duenn)
    expect(g?.punkte).toEqual([])
    expect(g?.klinken).toEqual([])
    expect(g?.name).toBe('Halle 2')
  })

  it('7. ein Grundriss-BILD reist nicht mit', () => {
    // Sonst wird aus einer 30-kB-Auskunft eine 4-MB-Datei, die per Mail
    // nicht mehr durchgeht. Der Plan braucht die Lage in Metern.
    const json = serialisiereGebaeude(haus())
    expect(json).not.toContain('data:image')
    expect(json).not.toContain('base64')
  })
})
