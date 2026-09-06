// ───────────────────────────────────────────────────────────────────────────
// Der Vorlagen-Begriff der Suite (B-39.2).
//
// WOFUER. Bedarf 2 der Bedarfs-Datenbank ist P1 und heisst dort woertlich
// „opening last year's file as this year's starting point. This is the
// freelancer's only compounding asset." Bedarf 75 („reusable per-truck /
// per-show templates … rather than rebuilding each event") und Bedarf 91
// („reusable per-venue knowledge") sagen dasselbe fuer Truck und Haus. Bisher
// hatte die Suite zwei Anfaenge: das hartkodierte Demo-Projekt oder ein
// leeres. Ein leeres Projekt befuellt keinen Planer.
//
// ZWEI REGELN, BEIDE AUS DER RECHERCHE, NICHT ERFUNDEN:
//
// 1. ABGEZOGEN, NICHT AUFGEZAEHLT. `TEMPLATE-FIELD-MEASUREMENT.md` hat im
//    cable-planner gemessen, wohin die andere Bauform fuehrt: drei Funktionen
//    bauten dort eine Vorlage aus einem Geraet mit 37 / 23 / 15 aufgezaehlten
//    Feldern, und der `.cpgroup`-Export war seit #335 vom Speicherweg
//    abgedriftet, ohne dass es jemandem auffiel. Der Schluss dort:
//
//      > Die Form, die haelt, ist die … : die Vorlage durch SUBTRAKTION der
//      > Instanz-Felder ableiten, damit ein neues Feld per Vorgabe mitfaehrt
//      > und nur eine ausdrueckliche Ausnahme es zurueckhaelt.
//
//    Genau so ist `templateFromProject` gebaut: es kopiert das ganze Projekt
//    und nimmt danach `TEMPLATE_OMISSIONS` heraus. Wer `SuiteProject` um ein
//    Feld erweitert, bekommt es in der Vorlage geschenkt; wer es nicht drin
//    haben will, muss es hier benennen — und das ist die Stelle, an der ein
//    Leser nachsieht.
//
// 2. WAS NICHT MITFAEHRT, WIRD GENANNT — NICHT STILL ENTFERNT. Design-Frage 5
//    („Zugangsdaten in geteilten Vorlagen") ist mit *beim Export fragen*
//    entschieden und in `cable#642` so gebaut. `CREDENTIALS-IN-TEMPLATES.md`
//    beschreibt den Widerspruch, aus dem diese Entscheidung kam: derselbe Code
//    entfernte Geraete-Passwoerter auf dem Weg ins WLAN und schrieb sie
//    unveraendert in den geteilten Ordner. Die Lehre ist nicht „strippen",
//    sondern „an der Stelle sagen, was mitgeht".
//
//    Hier haengt dasselbe dran, nur mit Kundendaten statt Passwoertern: an
//    `Contact` haengen `vatId`, `customerNumber`, `lexofficeContactId`,
//    Anschrift und E-Mail, an `ShowDetails` die ausgestellten Belege und die
//    Steuer-Voreinstellung. Eine Vorlage, die den Kunden des letzten Jahres
//    stillschweigend mitbringt, faellt erst in dessen Rechnung auf.
//    `templateFromProject` liefert deshalb `omitted` mit zurueck, und der
//    Dialog zeigt es an, BEVOR die Vorlage entsteht.
//
// WAS BEWUSST MITFAEHRT. Raum, Buehne, Kameras, Leuchten, Signalknoten, Kabel,
// Tagesablauf, Crew-Besetzung (Name, Gewerk, Rolle), Budget-Kategorien mit
// Schaetzung, Aufgabenliste, Board, Fahrzeuge und Entfernung, Lager. Das ist
// der wiederverwendbare Rahmen; genau er ist der „compounding asset" aus
// Bedarf 2. Der Name des Hauses (`meta.venue`) faehrt mit, weil Bedarf 91
// ausdruecklich die Haus-Vorlage meint.
//
// EINE UHR IST KEINE VORLAGE. Was einen Zeitpunkt DIESER Show festhaelt,
// bleibt zurueck: das Datum, die Ladezeit, die Call-Zeiten, der Fortschritt,
// die Phase. Der Tagesablauf selbst faehrt mit — er traegt Uhrzeiten, aber als
// Ablauf-Muster („09:00 Load-in"), nicht als Termin.
// ───────────────────────────────────────────────────────────────────────────

import {
  emptyBoard,
  type Board,
  type BoardCard,
  type ShowDetails,
  type SuiteProject,
} from './project'

/** Dateiformat einer Vorlage — eigener `format`-Wert, damit eine Vorlage nicht
 *  aus Versehen als Projekt geoeffnet wird und umgekehrt. */
export const TEMPLATE_FORMAT = 'avplanner-suite-template'
export const TEMPLATE_FILE_VERSION = 1

/** Eine gespeicherte Vorlage. `project` ist ein vollstaendiges `SuiteProject`
 *  — die Vorlage ist kein eigenes Datenmodell, sondern ein Projekt ohne die
 *  Instanz-Anteile. Das haelt sie automatisch aktuell. */
export interface SuiteTemplate {
  id: string
  name: string
  /** Notiz des Erstellers: wofuer diese Vorlage gedacht ist. */
  note?: string
  /** ISO-Zeitpunkt der Erstellung. */
  createdAt: string
  project: SuiteProject
}

/**
 * Ein Feld, das die Vorlage NICHT mitnimmt — mit Grund und Menge, damit der
 * Dialog nicht „einiges wurde entfernt" sagen muss.
 */
export interface Omission {
  /** Stabiler Schluessel; die Oberflaeche uebersetzt ihn. */
  key: OmissionKey
  /** Wie viele Eintraege betroffen sind. 0 heisst „ein einzelner Wert". */
  count: number
  /** Der weggelassene Wert im Klartext, wenn es genau einer ist. */
  detail?: string
}

export type OmissionKey =
  | 'contacts'
  | 'invoices'
  | 'billing'
  | 'date'
  | 'phase'
  | 'progress'
  | 'crewTimes'
  | 'budgetActual'
  | 'tasksDone'
  | 'loadIn'

/**
 * DIE SUBTRAKTIONSLISTE. Jeder Eintrag ist eine Entscheidung mit Begruendung;
 * wer einen entfernt, aendert, was ein Team im naechsten Jahr geerbt bekommt.
 *
 * Sie steht als Daten und nicht als Kommentarblock im Code, weil der Dialog
 * dieselbe Liste anzeigt: eine Quelle, kein zweiter Text, der abdriftet.
 */
export const TEMPLATE_OMISSIONS: ReadonlyArray<{ key: OmissionKey; reason: string }> = [
  { key: 'contacts', reason: 'Kundenidentitaet: Anschrift, E-Mail, USt-IdNr., Kundennummer, Lexware-Kontakt-Id' },
  { key: 'invoices', reason: 'ausgestellte Belege gehoeren zu genau dieser Show' },
  { key: 'billing', reason: 'Besteuerung und Steuersatz sind mit dem Kunden vereinbart, nicht mit dem Showformat' },
  { key: 'date', reason: 'das Datum dieser Show' },
  { key: 'phase', reason: 'wie weit diese Show war' },
  { key: 'progress', reason: 'wie weit diese Show war' },
  { key: 'crewTimes', reason: 'Call-Zeit und Zusage gelten fuer diesen Termin; Besetzung und Gewerk fahren mit' },
  { key: 'budgetActual', reason: 'was es tatsaechlich gekostet hat; die Schaetzung ist der Startwert' },
  { key: 'tasksDone', reason: 'eine Checkliste faengt unabgehakt an' },
  { key: 'loadIn', reason: 'die Ladezeit dieses Tages' },
]

/** Checkbox-Karten (auch in verschachtelten Unterboards) zuruecksetzen.
 *
 *  Dieselbe Regel wie fuer `tasks`: eine Checkliste faengt unabgehakt an. Sie
 *  hier zu ueberspringen hiesse, dass ein Board mit „Location bestaetigt" das
 *  naechste Jahr als erledigt behauptet. */
const resetBoard = (board: Board): Board => ({
  connections: board.connections,
  cards: board.cards.map((c): BoardCard => ({
    ...c,
    ...(c.items ? { items: c.items.map((i) => ({ ...i, done: false })) } : {}),
    ...(c.board ? { board: resetBoard(c.board) } : {}),
  })),
})

export interface TemplateDerivation {
  /** Das Projekt, wie die Vorlage es traegt. */
  project: SuiteProject
  /** Was zurueckblieb — die Liste fuer den Dialog. */
  omitted: Omission[]
}

/**
 * Vorlage aus einem Projekt ableiten.
 *
 * Rein: keine Uhr, kein Speicher, kein DOM. `createdAt` setzt der Aufrufer.
 */
export function templateFromProject(project: SuiteProject): TemplateDerivation {
  const show = project.show
  const omitted: Omission[] = []
  const note = (key: OmissionKey, count: number, detail?: string) => {
    if (count > 0) omitted.push({ key, count, ...(detail ? { detail } : {}) })
  }

  note('contacts', show.contacts.length)
  note('invoices', show.invoices?.length ?? 0)
  note('billing', show.billing ? 1 : 0)
  note('date', show.dateLabel.trim() ? 1 : 0, show.dateLabel.trim() || undefined)
  note('phase', show.phase !== 'planning' ? 1 : 0, show.phase)
  note('progress', show.progress > 0 ? 1 : 0)
  note('crewTimes', show.crew.filter((c) => c.call.trim() || c.status === 'confirmed').length)
  note('budgetActual', show.budget.filter((b) => b.actualEur !== 0).length)
  note('tasksDone', show.tasks.filter((t) => t.done).length)
  note('loadIn', show.logistics.loadIn.trim() ? 1 : 0, show.logistics.loadIn.trim() || undefined)

  // Kopie zuerst, Abzug danach — die Reihenfolge IST die Regel aus
  // TEMPLATE-FIELD-MEASUREMENT: ein neues Feld an `SuiteProject` faehrt mit,
  // bis es hier ausdruecklich zurueckgehalten wird.
  const restShow: ShowDetails = { ...show }
  // `delete` und nicht Destrukturierung mit `_`-Praefix: die beiden Felder sind
  // optional, also ist das Loeschen die genaue Aussage — und es steht sichtbar
  // neben der Subtraktionsliste statt als unbenutzte Variable.
  delete restShow.billing
  delete restShow.invoices
  const derived: SuiteProject = {
    ...project,
    meta: { ...project.meta, version: 1, saved: false },
    show: {
      ...restShow,
      dateLabel: '',
      phase: 'planning',
      progress: 0,
      contacts: [],
      crew: show.crew.map((c) => ({ ...c, call: '', status: 'pending' })),
      budget: show.budget.map((b) => ({ ...b, actualEur: 0 })),
      tasks: show.tasks.map((t) => ({ ...t, done: false })),
      logistics: { ...show.logistics, loadIn: '' },
      board: resetBoard(show.board ?? emptyBoard()),
    },
  }

  return { project: derived, omitted }
}

/**
 * Projekt aus einer Vorlage.
 *
 * Der Name kommt von aussen: eine Vorlage heisst „Jahresgala", das daraus
 * entstehende Projekt „Jahresgala 2027". Wuerde der Vorlagenname durchgereicht,
 * hiessen alle Shows gleich, und der Projekt-Hub sortiert nach Namen.
 *
 * Erneut abgezogen wird NICHT: eine Vorlage traegt die Instanz-Anteile schon
 * nicht mehr. Ein zweiter Abzug hier waere eine zweite Wahrheit ueber dieselbe
 * Regel — genau der Fehler, den TEMPLATE-FIELD-MEASUREMENT beschreibt.
 */
export function projectFromTemplate(template: SuiteTemplate, name: string): SuiteProject {
  const p = template.project
  return {
    ...p,
    meta: { ...p.meta, name: name.trim() || template.name, version: 1, saved: false },
  }
}

interface TemplateFile {
  format: typeof TEMPLATE_FORMAT
  version: number
  template: SuiteTemplate
}

export function serializeTemplate(t: SuiteTemplate): string {
  const file: TemplateFile = { format: TEMPLATE_FORMAT, version: TEMPLATE_FILE_VERSION, template: t }
  return JSON.stringify(file, null, 2)
}

/**
 * Vorlagendatei lesen. Wirft bei fremdem Format — insbesondere bei einer
 * PROJEKT-Datei: die traegt Kontakte und Belege, und sie stillschweigend als
 * Vorlage anzunehmen braechte genau das zurueck, was Regel 2 verhindert.
 */
export function parseTemplate(text: string): SuiteTemplate {
  const raw = JSON.parse(text) as unknown
  if (!raw || typeof raw !== 'object') throw new Error('Ungültige Vorlagendatei')
  const file = raw as Partial<TemplateFile>
  if (file.format !== TEMPLATE_FORMAT || !file.template) {
    throw new Error('Keine Vorlagendatei der AV Planner Suite')
  }
  const t = file.template
  if (typeof t.name !== 'string' || !t.project || typeof t.project.meta?.name !== 'string') {
    throw new Error('Vorlagendatei ohne gültige Metadaten')
  }
  return t
}
