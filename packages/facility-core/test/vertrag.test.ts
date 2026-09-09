// ───────────────────────────────────────────────────────────────────────────
// Der Waechter zum Vertrag „Festinstallation" (ADR-006, Schritt 1/2).
//
// ADR-006 sagt zu diesem Paket: „Er entsteht mit Schritt 2 (Paket vor Repo) und
// misst dann dasselbe wie `lagerVertrag.test.ts`: … dass die Tuer nicht selbst
// rechnet (Punkt 4), und dass die sechs Fragen sechs bleiben, solange dieser
// Abschnitt sechs sagt."
//
// Der erste Block misst genau das, und zwar gegen das ADR selbst statt gegen
// eine zweite Liste im Test — eine abgeschriebene Liste waere die zweite
// Wahrheit, gegen die ADR-001 geschrieben ist, und sie driftet lautlos.
//
// Die uebrigen Bloecke messen die eine Regel, die alle sechs Fragen teilen:
// „nicht angegeben" ist nicht „nein".
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import {
  VERTRAG_FRAGEN,
  VERTRAG_RUECKWEG,
  belastbarkeit,
  einspeisung,
  hausStrecke,
  kreisGeschwister,
  leeresGebaeude,
  mangelMelden,
  ort,
  steuerklinken,
  verfuegbarkeit,
  type Anschlusspunkt,
  type Gebaeude,
} from '../src/index'
import * as vertragModul from '../src/vertrag'

const adrPfad = fileURLToPath(
  new URL('../../../docs/decisions/ADR-006-werkzeug-schnitt.md', import.meta.url),
)
const adr = readFileSync(adrPfad, 'utf8')

/** Schneidet einen `###`-Abschnitt des ADR heraus. */
const abschnitt = (ueberschrift: string): string => {
  const start = adr.indexOf(`### ${ueberschrift}`)
  expect(start, `ADR-Abschnitt „${ueberschrift}" fehlt`).toBeGreaterThanOrEqual(0)
  const rest = adr.slice(start + 4)
  const ende = rest.indexOf('\n### ')
  return ende === -1 ? rest : rest.slice(0, ende)
}

/** Alle `name(...)`-Aufrufe in Backticks, in Reihenfolge und ohne Duplikate. */
const aufrufe = (text: string): string[] => [
  ...new Set([...text.matchAll(/`([a-zA-Z][a-zA-Z0-9]*)\(/g)].map((m) => m[1])),
]

// ─── Der Vertrag bleibt so gross, wie das ADR ihn erklaert ──────────────────

describe('Vertragsumfang', () => {
  it('die sechs Fragen im Code sind die sechs Zeilen im ADR', () => {
    const imAdr = aufrufe(abschnitt('Was der Plan das Gebäude fragt'))
    expect(imAdr).toHaveLength(6)
    expect([...VERTRAG_FRAGEN].sort()).toEqual([...imAdr].sort())
  })

  it('der Rueckweg im Code ist der eine Rueckweg im ADR', () => {
    const imAdr = aufrufe(abschnitt('Der eine Rückweg'))
    expect(imAdr).toEqual([VERTRAG_RUECKWEG])
  })

  it('jede genannte Frage ist auch wirklich eine Funktion', () => {
    for (const name of [...VERTRAG_FRAGEN, VERTRAG_RUECKWEG]) {
      expect(typeof (vertragModul as Record<string, unknown>)[name], name).toBe('function')
    }
  })

  it('das Modul exportiert keine unbenannte siebte Frage', () => {
    // `belastbarkeit` ist ausdruecklich KEINE Frage an das Gebaeude, sondern die
    // Stelle, an der dieses Paket eine Zahl VERWEIGERT. Sie steht deshalb hier
    // namentlich; wer einen weiteren Export anlegt, muss diese Zeile anfassen.
    const erlaubteHelfer = ['belastbarkeit']
    const funktionen = Object.entries(vertragModul)
      .filter(([, wert]) => typeof wert === 'function')
      .map(([name]) => name)
    expect(funktionen.sort()).toEqual(
      [...VERTRAG_FRAGEN, VERTRAG_RUECKWEG, ...erlaubteHelfer].sort(),
    )
  })
})

// ─── Musterhaus ─────────────────────────────────────────────────────────────

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

const haus = (): Gebaeude => ({
  ...leeresGebaeude('h1', 'Stadthalle'),
  raeume: [
    { id: 'r-saal', name: 'Grosser Saal', etage: 'EG', hausbezeichner: 'EG-01' },
    { id: 'r-technik', name: 'Technikraum', hausbezeichner: 'UG-04' },
  ],
  verteilungen: [
    { id: 'v-uv1', bezeichnung: 'UV Saal', raumId: 'r-technik', art: 'unterverteilung' },
  ],
  stromkreise: [
    { id: 'k-1', bezeichnung: 'Saal Nord', verteilungId: 'v-uv1', rcdId: 'rcd-a' },
    { id: 'k-2', bezeichnung: 'Saal Sued', verteilungId: 'v-uv1', rcdId: 'rcd-a' },
    { id: 'k-3', bezeichnung: 'Buehne', verteilungId: 'v-uv1' },
  ],
  punkte: [
    punkt({
      id: 'p-cee',
      art: 'einspeisung',
      anschlussart: 'cee63',
      absicherungA: 63,
      charakteristik: 'C',
      dauerleistungW: 40_000,
      raumId: 'r-technik',
      stromkreisId: 'k-1',
    }),
    punkt({ id: 'p-nord', stromkreisId: 'k-1' }),
    punkt({ id: 'p-sued', stromkreisId: 'k-2' }),
    punkt({ id: 'p-buehne', stromkreisId: 'k-3' }),
    punkt({ id: 'p-buehne2', stromkreisId: 'k-3' }),
    punkt({ id: 'p-frei' }),
    punkt({ id: 'p-dimmer', gedimmt: true, geschaltet: true, stromkreisId: 'k-2' }),
    punkt({ id: 'p-belegt', belegtDurch: 'Kuehltheke Foyer' }),
  ],
  klinken: [
    {
      id: 'kl-saal',
      system: 'dali',
      adresse: 'G3',
      richtung: 'schalten',
      bedeutung: 'Saalbeleuchtung Reihe 1-4',
    },
  ],
  strecken: [
    { id: 's-steig', bezeichnung: 'Steigleitung EG-UG', vonRaumId: 'r-saal', nachRaumId: 'r-technik' },
  ],
  zuordnungen: [{ planKabelId: 'kabel-12', hausStreckeId: 's-steig' }],
})

// ─── 1 · Einspeisung, und die Zahl, die nicht gerechnet wird ────────────────

describe('einspeisung + belastbarkeit', () => {
  it('gibt die angegebenen Felder zurueck', () => {
    const a = einspeisung(haus(), 'p-cee')
    expect(a).toMatchObject({
      anschlussart: 'cee63',
      netzform: 'TN-S',
      absicherungA: 63,
      charakteristik: 'C',
      rcdTyp: 'A',
      dauerleistungW: 40_000,
      raumId: 'r-technik',
    })
  })

  it('laesst dauerleistungW weg, wenn das Haus sie nicht nennt', () => {
    const a = einspeisung(haus(), 'p-nord')
    expect(a).toBeDefined()
    expect('dauerleistungW' in (a as object)).toBe(false)
  })

  it('unbekannte Id ist undefined und nicht „kein Strom"', () => {
    expect(einspeisung(haus(), 'gibt-es-nicht')).toBeUndefined()
  })

  it('RECHNET die Dauerleistung NICHT aus der Absicherung', () => {
    const b = belastbarkeit(punkt({ id: 'p-x', absicherungA: 32 }))
    expect(b.watt).toBeNull()
    // 32 A × 230 V = 7360 W — genau die Zahl, die hier nicht auftauchen darf.
    expect(JSON.stringify(b)).not.toContain('7360')
    expect('grund' in b && b.grund).toContain('nicht die zulaessige Dauerlast')
  })

  it('gibt die angegebene Dauerleistung unveraendert weiter', () => {
    expect(belastbarkeit(punkt({ id: 'p-y', dauerleistungW: 3_500 }))).toEqual({
      watt: 3_500,
      herkunft: 'angegeben',
    })
  })
})

// ─── 2 · Ort ────────────────────────────────────────────────────────────────

describe('ort', () => {
  it('loest Punkt und Verteilung ueber den Raum auf, mit dem Haus-Bezeichner', () => {
    expect(ort(haus(), 'p-nord')).toEqual({
      gefunden: true,
      raumId: 'r-saal',
      raumName: 'Grosser Saal',
      etage: 'EG',
      hausbezeichner: 'EG-01',
    })
    expect(ort(haus(), 'v-uv1')).toMatchObject({ gefunden: true, hausbezeichner: 'UG-04' })
  })

  it('laesst etage weg, wenn sie nicht angegeben ist', () => {
    const o = ort(haus(), 'v-uv1')
    expect('etage' in o).toBe(false)
  })

  it('eine Strecke bekommt KEINEN Ort — und einen anderen Grund als eine unbekannte Id', () => {
    const strecke = ort(haus(), 's-steig')
    const unbekannt = ort(haus(), 'gibt-es-nicht')
    expect(strecke.gefunden).toBe(false)
    expect(unbekannt.gefunden).toBe(false)
    expect('grund' in strecke && strecke.grund).toContain('verbindet zwei Raeume')
    expect('grund' in unbekannt && unbekannt.grund).toContain('Kein Gebaeude-Objekt')
    expect(JSON.stringify(strecke)).not.toContain('r-saal')
  })

  it('meldet einen Verweis auf einen Raum, den es nicht gibt', () => {
    const g = haus()
    g.punkte.push(punkt({ id: 'p-nirgends', raumId: 'r-weg' }))
    const o = ort(g, 'p-nirgends')
    expect(o.gefunden).toBe(false)
    expect('grund' in o && o.grund).toContain('den es nicht gibt')
  })
})

// ─── 3 · Kreis-Geschwister ──────────────────────────────────────────────────

describe('kreisGeschwister', () => {
  it('nennt alle Punkte am selben RCD, ueber Kreisgrenzen hinweg', () => {
    const g = kreisGeschwister(haus(), 'p-nord')
    expect(g).toMatchObject({ bekannt: true, grundlage: 'rcd' })
    expect('punkte' in g && g.punkte.sort()).toEqual(['p-cee', 'p-dimmer', 'p-sued'])
  })

  it('faellt auf den Stromkreis zurueck, wenn kein RCD genannt ist — und SAGT es', () => {
    const g = kreisGeschwister(haus(), 'p-buehne')
    expect(g).toEqual({ bekannt: true, grundlage: 'stromkreis', punkte: ['p-buehne2'] })
  })

  it('ohne Stromkreis ist die Antwort NICHT die leere Liste', () => {
    const g = kreisGeschwister(haus(), 'p-frei')
    expect(g.bekannt).toBe(false)
    expect('punkte' in g).toBe(false)
    expect('grund' in g && g.grund).toContain('kein Stromkreis')
  })

  it('unbekannte Id und toter Kreis-Verweis sind ebenfalls „nicht bekannt"', () => {
    expect(kreisGeschwister(haus(), 'gibt-es-nicht').bekannt).toBe(false)
    const g = haus()
    g.punkte.push(punkt({ id: 'p-tot', stromkreisId: 'k-weg' }))
    expect(kreisGeschwister(g, 'p-tot').bekannt).toBe(false)
  })
})

// ─── 4 · Verfuegbarkeit ─────────────────────────────────────────────────────

describe('verfuegbarkeit', () => {
  it('belegt heisst nicht frei, und nennt wodurch', () => {
    expect(verfuegbarkeit(haus(), 'p-belegt')).toEqual({
      frei: false,
      belegtDurch: 'Kuehltheke Foyer',
    })
  })

  it('geschaltet und gedimmt kommen unveraendert durch', () => {
    expect(verfuegbarkeit(haus(), 'p-dimmer')).toMatchObject({
      frei: true,
      geschaltet: true,
      gedimmt: true,
    })
  })

  it('fehlende Angabe wird NICHT zu false', () => {
    const v = verfuegbarkeit(haus(), 'p-nord')
    expect(v).toEqual({ frei: true })
    expect('geschaltet' in (v as object)).toBe(false)
    expect('gedimmt' in (v as object)).toBe(false)
  })

  it('leerer belegtDurch-String macht den Punkt nicht belegt', () => {
    const g = haus()
    g.punkte.push(punkt({ id: 'p-leer', belegtDurch: '   ' }))
    expect(verfuegbarkeit(g, 'p-leer')).toEqual({ frei: true })
  })
})

// ─── 5 · Steuerklinken ──────────────────────────────────────────────────────

describe('steuerklinken', () => {
  it('gibt die benannten Klinken mit ihrer Bedeutung', () => {
    expect(steuerklinken(haus())).toEqual([
      {
        id: 'kl-saal',
        system: 'dali',
        adresse: 'G3',
        richtung: 'schalten',
        bedeutung: 'Saalbeleuchtung Reihe 1-4',
      },
    ])
  })

  it('ein Haus ohne Steuerung gibt eine leere Liste — das ist hier die Wahrheit', () => {
    expect(steuerklinken(leeresGebaeude('h2', 'Turnhalle'))).toEqual([])
  })
})

// ─── 6 · Hausstrecke ────────────────────────────────────────────────────────

describe('hausStrecke', () => {
  it('loest die erklaerte Zuordnung auf', () => {
    expect(hausStrecke(haus(), 'kabel-12')?.id).toBe('s-steig')
  })

  it('gleicht NICHT ueber den Namen ab', () => {
    const g = haus()
    g.zuordnungen = []
    // Gleiche Bezeichnung wie die Strecke — und trotzdem keine Zuordnung.
    expect(hausStrecke(g, 'Steigleitung EG-UG')).toBeUndefined()
    expect(hausStrecke(g, 's-steig')).toBeUndefined()
  })

  it('eine Zuordnung auf eine Strecke, die es nicht gibt, erfindet keine', () => {
    const g = haus()
    g.zuordnungen = [{ planKabelId: 'kabel-99', hausStreckeId: 's-weg' }]
    expect(hausStrecke(g, 'kabel-99')).toBeUndefined()
  })
})

// ─── Der Rueckweg ───────────────────────────────────────────────────────────

describe('mangelMelden', () => {
  const meldung = {
    id: 'm1',
    hausObjektId: 'p-nord',
    befund: 'Dose ohne Spannung',
    gemeldetAm: '2026-09-09T10:00:00Z',
  }

  it('haengt den Mangel an und laesst das uebergebene Gebaeude unveraendert', () => {
    const g = haus()
    const e = mangelMelden(g, meldung)
    expect(e.ok).toBe(true)
    expect('gebaeude' in e && e.gebaeude.maengel).toEqual([meldung])
    expect(g.maengel).toEqual([])
  })

  it('nimmt Meldungen auf jede Art von Gebaeude-Objekt an', () => {
    for (const ziel of ['k-1', 'v-uv1', 'kl-saal', 's-steig', 'r-saal']) {
      expect(mangelMelden(haus(), { ...meldung, hausObjektId: ziel }).ok).toBe(true)
    }
  })

  it('lehnt eine Meldung ohne Empfaenger ab, statt sie abzulegen', () => {
    const e = mangelMelden(haus(), { ...meldung, hausObjektId: 'gibt-es-nicht' })
    expect(e.ok).toBe(false)
    expect('grund' in e && e.grund).toContain('keinen Empfaenger')
  })

  it('lehnt einen leeren Befund und eine doppelte Id ab', () => {
    expect(mangelMelden(haus(), { ...meldung, befund: '  ' }).ok).toBe(false)
    const einmal = mangelMelden(haus(), meldung)
    expect(einmal.ok).toBe(true)
    if (einmal.ok) expect(mangelMelden(einmal.gebaeude, meldung).ok).toBe(false)
  })
})

// ─── ADR-005: was der Vertrag nicht kennt, bleibt erhalten ──────────────────

describe('hausForeign', () => {
  it('ueberlebt den Rueckweg unveraendert', () => {
    const g: Gebaeude = { ...haus(), hausForeign: { pruefprotokoll: { norm: 'DIN VDE 0100-600' } } }
    const e = mangelMelden(g, {
      id: 'm2',
      hausObjektId: 'p-nord',
      befund: 'RCD loest aus',
      gemeldetAm: '2026-09-09T11:00:00Z',
    })
    expect(e.ok).toBe(true)
    expect('gebaeude' in e && e.gebaeude.hausForeign).toEqual({
      pruefprotokoll: { norm: 'DIN VDE 0100-600' },
    })
  })
})
