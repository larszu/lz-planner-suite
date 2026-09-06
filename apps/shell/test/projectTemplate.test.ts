// ───────────────────────────────────────────────────────────────────────────
// Der Vorlagen-Begriff (B-39.2).
//
// Geprueft wird das, woran eine Vorlage schaedlich statt nuetzlich wird:
//
//   1. dass sie den KUNDEN nicht mitschleppt. Das ist kein Schoenheitsfehler:
//      an `Contact` haengen USt-IdNr., Kundennummer und die Lexware-Kontakt-Id,
//      und eine Vorlage, die sie stillschweigend mitbringt, faellt erst in der
//      Rechnung der naechsten Show auf. `CREDENTIALS-IN-TEMPLATES.md` hat
//      denselben Fehler im cable-planner gemessen, nur mit Passwoertern.
//   2. dass das, was sie weglaesst, GENANNT wird — mit Anzahl, nicht als
//      „einiges wurde entfernt".
//   3. dass sie den Rahmen wirklich mitnimmt. Eine Vorlage, die zu viel
//      abzieht, ist ein leeres Projekt mit Extraschritten.
//   4. dass sie durch SUBTRAKTION entsteht. Der Test dafuer spritzt ein Feld
//      ein, das die Ableitung nicht kennen kann — kommt es drueben an, ist die
//      Bauform richtig; zaehlt jemand spaeter wieder Felder auf, faellt er um.
// ───────────────────────────────────────────────────────────────────────────
import { describe, expect, it } from 'vitest'
import {
  parseTemplate,
  projectFromTemplate,
  serializeTemplate,
  templateFromProject,
  TEMPLATE_OMISSIONS,
  type SuiteTemplate,
} from '../src/data/projectTemplate'
import { PROJECT } from '../src/data/project'
import type { SuiteProject } from '../src/data/project'

/** Ein Projekt mit allem, was eine Vorlage NICHT mitnehmen darf. */
const gelaufeneShow = (): SuiteProject => ({
  ...PROJECT,
  meta: { ...PROJECT.meta, name: 'Sommershow 2026', version: 12, saved: true },
  show: {
    ...PROJECT.show,
    dateLabel: 'Sa 18.07.2026',
    phase: 'show',
    progress: 0.86,
    contacts: [
      {
        name: 'Anna Meier',
        role: 'Einkauf',
        org: 'Beispiel GmbH',
        phone: '+49 30 1234',
        billTo: true,
        email: 'a.meier@example.org',
        street: 'Musterweg 3',
        zip: '10115',
        city: 'Berlin',
        vatId: 'DE123456789',
        customerNumber: 'K-4711',
        lexofficeContactId: '0f2c3b4a-1111-2222-3333-444455556666',
      },
    ],
    invoices: [
      { id: 'r1', kind: 'invoice', date: '2026-07-20', recipientName: 'Beispiel GmbH', net: 12000, gross: 14280 },
    ],
    billing: { taxType: 'net', vatRate: 19 },
    crew: [
      { name: 'Ben', role: 'Bildregie', dept: 'video', call: '07:30', status: 'confirmed' },
      { name: 'Cem', role: 'Licht', dept: 'light', call: '08:00', status: 'pending' },
    ],
    budget: [
      { category: 'Video', estimatedEur: 8000, actualEur: 8320 },
      { category: 'Licht', estimatedEur: 4000, actualEur: 3900 },
    ],
    tasks: [
      { title: 'Strom anmelden', done: true },
      { title: 'Rigging-Plan freigeben', done: false },
    ],
    logistics: { vehicles: [{ label: '7,5 t', detail: 'Video' }], loadIn: 'Fr 17.07. 08:00', distanceKm: 142 },
    board: {
      connections: [],
      cards: [
        {
          id: 'c1',
          type: 'todo',
          x: 0,
          y: 0,
          w: 200,
          items: [
            { text: 'Location bestaetigt', done: true },
            { text: 'Catering', done: false },
          ],
        },
        {
          id: 'c2',
          type: 'board',
          x: 0,
          y: 0,
          w: 200,
          board: {
            connections: [],
            cards: [{ id: 'c3', type: 'todo', x: 0, y: 0, w: 200, items: [{ text: 'Probe', done: true }] }],
          },
        },
      ],
    },
  },
})

describe('was eine Vorlage NICHT mitnimmt', () => {
  it('laesst die Kundendaten vollstaendig zurueck', () => {
    const { project } = templateFromProject(gelaufeneShow())
    expect(project.show.contacts).toEqual([])
    // Gegenprobe auf dem SERIALISAT statt auf dem Feld: eine Kundennummer,
    // die sich in ein anderes Feld gerettet haette, faende der Feldvergleich
    // nicht.
    const json = JSON.stringify(project)
    for (const spur of ['DE123456789', 'K-4711', '0f2c3b4a-1111-2222-3333-444455556666', 'a.meier@example.org', 'Musterweg 3']) {
      expect(json, `Kundenspur „${spur}" in der Vorlage`).not.toContain(spur)
    }
  })

  it('laesst Belege und Besteuerung zurueck', () => {
    const { project } = templateFromProject(gelaufeneShow())
    expect(project.show.invoices).toBeUndefined()
    expect(project.show.billing).toBeUndefined()
  })

  it('laesst Termin, Phase, Fortschritt und Ladezeit zurueck', () => {
    const { project } = templateFromProject(gelaufeneShow())
    expect(project.show.dateLabel).toBe('')
    expect(project.show.phase).toBe('planning')
    expect(project.show.progress).toBe(0)
    expect(project.show.logistics.loadIn).toBe('')
  })

  it('setzt Call-Zeiten und Zusagen zurueck, behaelt aber die Besetzung', () => {
    const { project } = templateFromProject(gelaufeneShow())
    expect(project.show.crew.map((c) => c.name)).toEqual(['Ben', 'Cem'])
    expect(project.show.crew.map((c) => c.role)).toEqual(['Bildregie', 'Licht'])
    expect(project.show.crew.every((c) => c.call === '' && c.status === 'pending')).toBe(true)
  })

  it('nullt die Ist-Kosten und behaelt die Schaetzung', () => {
    const { project } = templateFromProject(gelaufeneShow())
    expect(project.show.budget).toEqual([
      { category: 'Video', estimatedEur: 8000, actualEur: 0 },
      { category: 'Licht', estimatedEur: 4000, actualEur: 0 },
    ])
  })

  it('haekelt Aufgaben ab — auch die in Board-Karten und Unterboards', () => {
    // Eine Checkliste faengt unabgehakt an. Die Regel gilt fuer `tasks` UND
    // fuer die Todo-Karten des Boards; nur eine der beiden zu behandeln hiesse,
    // dass ein Board „Location bestaetigt" fuer die naechste Show behauptet.
    const { project } = templateFromProject(gelaufeneShow())
    expect(project.show.tasks.map((t) => t.done)).toEqual([false, false])
    const karten = project.show.board.cards
    expect(karten[0].items?.map((i) => i.done)).toEqual([false, false])
    expect(karten[1].board?.cards[0].items?.map((i) => i.done)).toEqual([false])
    // Der Text bleibt — abgehakt wird zurueckgesetzt, nicht geloescht.
    expect(karten[0].items?.map((i) => i.text)).toEqual(['Location bestaetigt', 'Catering'])
  })
})

describe('was eine Vorlage mitnimmt', () => {
  it('traegt Raum, Rig, Signalweg und Lager weiter', () => {
    const quelle = gelaufeneShow()
    const { project } = templateFromProject(quelle)
    expect(project.hall).toEqual(quelle.hall)
    expect(project.stage).toEqual(quelle.stage)
    expect(project.cameras).toEqual(quelle.cameras)
    expect(project.fixtures).toEqual(quelle.fixtures)
    expect(project.nodes).toEqual(quelle.nodes)
    expect(project.cables).toEqual(quelle.cables)
    expect(project.inventory).toEqual(quelle.inventory)
    // Das Haus faehrt mit — Bedarf 91 meint ausdruecklich die Haus-Vorlage.
    expect(project.meta.venue).toBe(quelle.meta.venue)
    // Der Ablauf ist ein Muster, kein Termin.
    expect(project.show.schedule).toEqual(quelle.show.schedule)
    expect(project.show.logistics.vehicles).toEqual(quelle.show.logistics.vehicles)
    expect(project.show.logistics.distanceKm).toBe(142)
  })

  it('entsteht durch SUBTRAKTION, nicht durch Aufzaehlung', () => {
    // Der eigentliche Test der Bauform. TEMPLATE-FIELD-MEASUREMENT.md hat im
    // cable-planner drei aufzaehlende Vorlagen-Bauer mit 37/23/15 Feldern
    // gefunden, von denen einer seit #335 abgedriftet war. Die Lehre dort:
    // abziehen statt aufzaehlen, damit ein NEUES Feld per Vorgabe mitfaehrt.
    //
    // Genau das prueft dieser Test: ein Feld, das `templateFromProject` nicht
    // kennen kann, muss drueben ankommen. Wer die Funktion spaeter auf eine
    // Aufzaehlung umbaut, laesst ihn fallen.
    const mitZukunft = { ...gelaufeneShow(), zukuenftigesFeld: 'faehrt mit' } as unknown as SuiteProject
    const { project } = templateFromProject(mitZukunft)
    expect((project as unknown as { zukuenftigesFeld?: string }).zukuenftigesFeld).toBe('faehrt mit')
  })

  it('aendert das Quell-Projekt nicht', () => {
    const quelle = gelaufeneShow()
    templateFromProject(quelle)
    expect(quelle.show.contacts).toHaveLength(1)
    expect(quelle.show.tasks[0].done).toBe(true)
    expect(quelle.show.board.cards[0].items?.[0].done).toBe(true)
  })
})

describe('die Weglass-Liste ist anzeigbar', () => {
  it('nennt jede Sorte mit Anzahl', () => {
    const { omitted } = templateFromProject(gelaufeneShow())
    const nach = new Map(omitted.map((o) => [o.key, o]))
    expect(nach.get('contacts')?.count).toBe(1)
    expect(nach.get('invoices')?.count).toBe(1)
    expect(nach.get('billing')?.count).toBe(1)
    expect(nach.get('date')?.detail).toBe('Sa 18.07.2026')
    expect(nach.get('crewTimes')?.count).toBe(2)
    expect(nach.get('budgetActual')?.count).toBe(2)
    expect(nach.get('tasksDone')?.count).toBe(1)
    expect(nach.get('loadIn')?.detail).toBe('Fr 17.07. 08:00')
  })

  it('meldet nichts, wo nichts weggelassen wurde', () => {
    // Sonst stuende bei einem frischen Projekt eine Warnliste voller Nullen —
    // und die liest ab dem zweiten Mal niemand mehr.
    const frisch = gelaufeneShow()
    const leer: SuiteProject = {
      ...frisch,
      show: {
        ...frisch.show,
        dateLabel: '',
        phase: 'planning',
        progress: 0,
        contacts: [],
        invoices: [],
        billing: undefined,
        crew: [{ name: 'Ben', role: 'Bildregie', dept: 'video', call: '', status: 'pending' }],
        budget: [{ category: 'Video', estimatedEur: 8000, actualEur: 0 }],
        tasks: [{ title: 'Strom anmelden', done: false }],
        logistics: { vehicles: [], loadIn: '', distanceKm: 0 },
      },
    }
    expect(templateFromProject(leer).omitted).toEqual([])
  })

  it('hat fuer jede gemeldete Sorte eine begruendete Zeile in der Liste', () => {
    // Die Liste im Modul ist die Begruendung; ein Befund ohne Zeile dort waere
    // eine Regel ohne Grund.
    const { omitted } = templateFromProject(gelaufeneShow())
    const bekannt = new Set(TEMPLATE_OMISSIONS.map((o) => o.key))
    for (const o of omitted) expect(bekannt.has(o.key), `ohne Begruendung: ${o.key}`).toBe(true)
    for (const eintrag of TEMPLATE_OMISSIONS) expect(eintrag.reason.length).toBeGreaterThan(20)
  })
})

describe('aus der Vorlage wird ein Projekt', () => {
  const vorlage = (): SuiteTemplate => ({
    id: 't1',
    name: 'Jahresgala',
    createdAt: '2026-09-06T00:00:00.000Z',
    project: templateFromProject(gelaufeneShow()).project,
  })

  it('nimmt den neuen Namen und faengt bei Version 1 ungespeichert an', () => {
    const p = projectFromTemplate(vorlage(), 'Jahresgala 2027')
    expect(p.meta.name).toBe('Jahresgala 2027')
    expect(p.meta.version).toBe(1)
    expect(p.meta.saved).toBe(false)
  })

  it('faellt ohne Namen auf den Vorlagennamen zurueck', () => {
    expect(projectFromTemplate(vorlage(), '   ').meta.name).toBe('Jahresgala')
  })

  it('bringt den Rahmen mit', () => {
    const p = projectFromTemplate(vorlage(), 'Jahresgala 2027')
    expect(p.cameras.length).toBeGreaterThan(0)
    expect(p.show.contacts).toEqual([])
  })
})

describe('Vorlagendatei', () => {
  const t = (): SuiteTemplate => ({
    id: 't1',
    name: 'Jahresgala',
    note: 'Halle A, 4 Kameras',
    createdAt: '2026-09-06T00:00:00.000Z',
    project: templateFromProject(gelaufeneShow()).project,
  })

  it('geht durch Serialisieren und Lesen unveraendert hindurch', () => {
    expect(parseTemplate(serializeTemplate(t()))).toEqual(t())
  })

  it('weist eine PROJEKT-Datei zurueck', () => {
    // Der wichtige negative Fall: eine Projektdatei traegt Kontakte und
    // Belege. Sie stillschweigend als Vorlage anzunehmen brächte genau das
    // zurueck, was die Ableitung entfernt.
    //
    // Auf die GENAUE Meldung geprueft, nicht auf „wirft irgendwas": die
    // Gegenprobe hat gezeigt, dass ein aufgeweichter Format-Vergleich hier
    // gruen blieb — die Projektdatei fiel dann nur zufaellig ueber einen
    // TypeError beim Lesen von `template.name`. Ein Test, der jeden Fehler
    // annimmt, prueft die Absicht nicht.
    const projektDatei = JSON.stringify({ format: 'avplanner-suite', version: 1, project: gelaufeneShow() })
    expect(() => parseTemplate(projektDatei)).toThrow('Keine Vorlagendatei der AV Planner Suite')
  })

  it('weist Unsinn zurueck', () => {
    expect(() => parseTemplate('nicht json')).toThrow()
    expect(() => parseTemplate('null')).toThrow()
    expect(() => parseTemplate(JSON.stringify({ format: 'avplanner-suite-template', version: 1 }))).toThrow(
      'Keine Vorlagendatei der AV Planner Suite',
    )
    expect(() =>
      parseTemplate(JSON.stringify({ format: 'avplanner-suite-template', version: 1, template: { name: 'X' } })),
    ).toThrow('Vorlagendatei ohne gültige Metadaten')
  })
})
