// ───────────────────────────────────────────────────────────────────────────
// Der Vertrag: sechs Fragen, ein Rueckweg (ADR-006, Abschnitt „Der Vertrag
// ‚Festinstallation' — Schritt 1").
//
// Diese Datei ist die ausfuehrbare Fassung des ADR-Abschnitts. Der Waechter in
// `test/vertrag.test.ts` liest die sechs Zeilen der ADR-Tabelle und vergleicht
// sie mit `VERTRAG_FRAGEN` — wer hier eine siebte Funktion aufnimmt, ohne das
// ADR zu aendern, bekommt einen roten Test statt einer stillen Ausweitung.
//
// ─── DIE EINE REGEL, DIE ALLE SECHS TEILEN ─────────────────────────────────
//
// „Nicht angegeben" ist NICHT „nein". Ein Gebaeude, das eine Auskunft nicht
// gibt, hat nicht das Gegenteil gesagt. Jede Frage, deren Antwort fehlen kann,
// gibt deshalb einen unterschiedenen Typ zurueck und keine stille Vorgabe:
// `{ bekannt: false, grund }` statt einer leeren Liste, `undefined` statt
// `false`, `watt: null` statt einer gerechneten Zahl.
//
// Die Gegenprobe dazu steht im Test: wer `geschaltet: p.geschaltet ?? false`
// schreibt, macht aus „das Haus sagt nichts dazu" die Zusicherung „diese Dose
// haengt an keinem Schalter". Danach plant jemand ein Netzteil darauf.
// ───────────────────────────────────────────────────────────────────────────
import type {
  Anschlusspunkt,
  Gebaeude,
  HausStrecke,
  Mangel,
  Steuerklinke,
} from './modell'

/**
 * Die sechs Fragen, namentlich. Der Waechter vergleicht diese Liste mit der
 * Tabelle im ADR — beide Richtungen, damit weder Code noch Dokument allein
 * wachsen kann.
 */
export const VERTRAG_FRAGEN = [
  'einspeisung',
  'ort',
  'kreisGeschwister',
  'verfuegbarkeit',
  'steuerklinken',
  'hausStrecke',
] as const

/** Der eine Schreibweg vom Plan ins Gebaeude. */
export const VERTRAG_RUECKWEG = 'mangelMelden' as const

// ─── 1 · Was gibt dieser Anschlusspunkt her? ────────────────────────────────

/** Die elektrische Auskunft zu einem Punkt — genau die Felder aus dem ADR. */
export interface EinspeisungsAuskunft {
  id: string
  bezeichnung: string
  anschlussart: Anschlusspunkt['anschlussart']
  netzform: Anschlusspunkt['netzform']
  absicherungA: number
  charakteristik: Anschlusspunkt['charakteristik']
  rcdTyp: Anschlusspunkt['rcdTyp']
  /** Nur gesetzt, wenn das Gebaeude sie ANGIBT. Siehe `belastbarkeit()`. */
  dauerleistungW?: number
  raumId: string
}

/**
 * Was gibt dieser Anschlusspunkt her?
 *
 * `undefined` heisst genau eines: kein Anschlusspunkt mit dieser Id. Es heisst
 * nicht „kein Strom".
 */
export const einspeisung = (
  gebaeude: Gebaeude,
  punktId: string,
): EinspeisungsAuskunft | undefined => {
  const p = gebaeude.punkte.find((x) => x.id === punktId)
  if (!p) return undefined
  return {
    id: p.id,
    bezeichnung: p.bezeichnung,
    anschlussart: p.anschlussart,
    netzform: p.netzform,
    absicherungA: p.absicherungA,
    charakteristik: p.charakteristik,
    rcdTyp: p.rcdTyp,
    ...(p.dauerleistungW === undefined ? {} : { dauerleistungW: p.dauerleistungW }),
    raumId: p.raumId,
  }
}

/**
 * Die zulaessige Dauerleistung — oder der Grund, warum es sie hier nicht gibt.
 *
 * DIESE FUNKTION RECHNET NICHT. `absicherungA × 230` waere die naheliegendste
 * Zeile dieses Pakets und die gefaehrlichste: der Nennstrom ist die
 * Ausloeseschwelle des Schutzschalters, nicht die zulaessige Dauerlast.
 * Leitungsquerschnitt und -laenge, Haeufung im Kabelkanal,
 * Umgebungstemperatur und der Gleichzeitigkeitsfaktor gehen ein; nichts davon
 * steht in diesem Vertrag, und nichts davon darf geraten werden.
 *
 * ADR-006, Punkt 4: „Nichts wird zweimal gerechnet. Wo der Plan eine Zahl
 * braucht, holt er sie ueber den Vertrag." Eine hier erfundene Zahl waere
 * genau die zweite Ableitung, gegen die der Punkt geschrieben ist — nur dass
 * sie diesmal wie ein Messwert aussieht.
 */
export type Belastbarkeit =
  | { watt: number; herkunft: 'angegeben' }
  | { watt: null; grund: string }

export const belastbarkeit = (punkt: Anschlusspunkt): Belastbarkeit =>
  punkt.dauerleistungW === undefined
    ? {
        watt: null,
        grund:
          `Dauerleistung nicht angegeben. ${punkt.absicherungA} A ` +
          `(Charakteristik ${punkt.charakteristik}) ist die Ausloeseschwelle, ` +
          'nicht die zulaessige Dauerlast — sie ergibt sich erst mit ' +
          'Querschnitt, Laenge, Haeufung und Gleichzeitigkeit.',
      }
    : { watt: punkt.dauerleistungW, herkunft: 'angegeben' }

// ─── 2 · Wo ist dieser Punkt? ───────────────────────────────────────────────

export type Ortsauskunft =
  | {
      gefunden: true
      raumId: string
      raumName: string
      etage?: string
      /** Der Bezeichner DES HAUSES. */
      hausbezeichner: string
    }
  | { gefunden: false; grund: string }

/**
 * Wo ist dieses Gebaeude-Objekt?
 *
 * Aufloesbar sind Objekte, die in GENAU EINEM Raum liegen: Anschlusspunkte,
 * Verteilungen und Raeume selbst. Eine `HausStrecke` verbindet zwei Raeume und
 * hat deshalb keinen Ort — ihr `vonRaumId` zurueckzugeben waere die haeufigste
 * Sorte Halbwahrheit: formal ein Treffer, inhaltlich die Antwort auf eine
 * andere Frage. Sie kommt als `gefunden: false` mit genau diesem Grund zurueck,
 * damit der Aufrufer den Unterschied zu „Id unbekannt" sieht.
 */
export const ort = (gebaeude: Gebaeude, objektId: string): Ortsauskunft => {
  const punkt = gebaeude.punkte.find((p) => p.id === objektId)
  const verteilung = gebaeude.verteilungen.find((v) => v.id === objektId)
  const raumId =
    punkt?.raumId ??
    verteilung?.raumId ??
    gebaeude.raeume.find((r) => r.id === objektId)?.id

  if (raumId === undefined) {
    const strecke = gebaeude.strecken.find((s) => s.id === objektId)
    if (strecke) {
      return {
        gefunden: false,
        grund:
          `„${strecke.bezeichnung}" ist eine Strecke und verbindet zwei Raeume — ` +
          'sie hat keinen Ort. Frage ihre Enden.',
      }
    }
    return { gefunden: false, grund: `Kein Gebaeude-Objekt mit der Id „${objektId}".` }
  }

  const raum = gebaeude.raeume.find((r) => r.id === raumId)
  if (!raum) {
    return {
      gefunden: false,
      grund: `Objekt „${objektId}" verweist auf den Raum „${raumId}", den es nicht gibt.`,
    }
  }
  return {
    gefunden: true,
    raumId: raum.id,
    raumName: raum.name,
    ...(raum.etage === undefined ? {} : { etage: raum.etage }),
    hausbezeichner: raum.hausbezeichner,
  }
}

// ─── 3 · Welche Kreise haengen zusammen? ────────────────────────────────────

export type Geschwister =
  | {
      bekannt: true
      /**
       * `rcd` ist die vollstaendige Antwort. `stromkreis` ist eine
       * UNTERGRENZE: das Gebaeude nennt fuer diesen Kreis keinen RCD, also
       * sind weitere Punkte moeglich, die mit abschalten.
       */
      grundlage: 'rcd' | 'stromkreis'
      punkte: string[]
    }
  | { bekannt: false; grund: string }

/**
 * Was haengt am selben Fehlerstromschutz?
 *
 * Ohne diese Auskunft plant jemand das Rig auf zwei Dosen, die gemeinsam
 * abschalten, und merkt es in der Show.
 *
 * EINE LEERE LISTE WAERE HIER DIE FALSCHE ANTWORT auf eine fehlende Angabe:
 * sie liest sich als „teilt sich mit niemandem" und ist damit eine Zusicherung,
 * die das Gebaeude nie gegeben hat. Deshalb `bekannt: false` mit Grund.
 */
export const kreisGeschwister = (gebaeude: Gebaeude, punktId: string): Geschwister => {
  const p = gebaeude.punkte.find((x) => x.id === punktId)
  if (!p) return { bekannt: false, grund: `Kein Anschlusspunkt mit der Id „${punktId}".` }
  if (!p.stromkreisId) {
    return {
      bekannt: false,
      grund: `Fuer „${p.bezeichnung}" ist kein Stromkreis angegeben.`,
    }
  }
  const kreis = gebaeude.stromkreise.find((k) => k.id === p.stromkreisId)
  if (!kreis) {
    return {
      bekannt: false,
      grund: `„${p.bezeichnung}" verweist auf den Stromkreis „${p.stromkreisId}", den es nicht gibt.`,
    }
  }

  if (kreis.rcdId) {
    const kreiseAmRcd = new Set(
      gebaeude.stromkreise.filter((k) => k.rcdId === kreis.rcdId).map((k) => k.id),
    )
    return {
      bekannt: true,
      grundlage: 'rcd',
      punkte: gebaeude.punkte
        .filter((x) => x.id !== p.id && x.stromkreisId !== undefined && kreiseAmRcd.has(x.stromkreisId))
        .map((x) => x.id),
    }
  }

  return {
    bekannt: true,
    grundlage: 'stromkreis',
    punkte: gebaeude.punkte
      .filter((x) => x.id !== p.id && x.stromkreisId === kreis.id)
      .map((x) => x.id),
  }
}

// ─── 4 · Was ist hier belegt oder tabu? ─────────────────────────────────────

export interface Verfuegbarkeit {
  frei: boolean
  belegtDurch?: string
  /** `undefined` heisst „das Haus sagt nichts dazu", nicht „nein". */
  geschaltet?: boolean
  /** `undefined` heisst „das Haus sagt nichts dazu", nicht „nein". */
  gedimmt?: boolean
  hinweis?: string
}

/**
 * Ist dieser Punkt benutzbar — und wenn ja, wofuer?
 *
 * „Geschaltet" und „gedimmt" sind hier keine Feinheit: eine Dose an einem
 * Dimmer oder an der Hausbeleuchtungs-Schaltung ist fuer ein Netzteil kein
 * Stromanschluss. Der Vertrag gibt beide Angaben unveraendert weiter und faellt
 * NICHT auf `false` zurueck, wenn sie fehlen — die Entscheidung trifft der
 * Plan, aber er soll sie auf einer Angabe treffen und nicht auf einer Vorgabe.
 */
export const verfuegbarkeit = (
  gebaeude: Gebaeude,
  punktId: string,
): Verfuegbarkeit | undefined => {
  const p = gebaeude.punkte.find((x) => x.id === punktId)
  if (!p) return undefined
  const belegt = p.belegtDurch !== undefined && p.belegtDurch.trim() !== ''
  return {
    frei: !belegt,
    ...(belegt ? { belegtDurch: p.belegtDurch } : {}),
    ...(p.geschaltet === undefined ? {} : { geschaltet: p.geschaltet }),
    ...(p.gedimmt === undefined ? {} : { gedimmt: p.gedimmt }),
    ...(p.hinweis === undefined ? {} : { hinweis: p.hinweis }),
  }
}

// ─── 5 · Welche Klinke hat die Haussteuerung? ───────────────────────────────

/**
 * Die benannten Klinken der Haussteuerung — und nur die.
 *
 * Was hier NICHT herauskommt, ist das Bus-Modell: kein Gruppenadressbaum, keine
 * DALI-Vorschaltgeraete, keine Crestron-Programmzeilen. Der Plan will wissen,
 * was er ansprechen darf und was das bewirkt. Alles andere ist die Anlage des
 * Hauses und geht ihn nichts an.
 */
export const steuerklinken = (gebaeude: Gebaeude): readonly Steuerklinke[] => gebaeude.klinken

// ─── 6 · Gehoert diese Strecke dem Haus? ────────────────────────────────────

/**
 * Benutzt dieses Plan-Kabel eine feste Strecke des Hauses?
 *
 * NUR ueber die ERKLAERTE Zuordnung (ADR-002). Es gibt hier bewusst keinen
 * Rueckfall auf Namensaehnlichkeit: ein Plan-Kabel „Steigleitung EG-OG" und
 * eine Hausstrecke „Steigleitung EG-OG" sind dasselbe, weil jemand es gesagt
 * hat, oder sie sind es nicht. Ein Namensvergleich saehe hier genauso aus wie
 * eine Angabe — und die Antwort auf „wird das am Abbautag eingepackt?" waere
 * dann geraten.
 */
export const hausStrecke = (
  gebaeude: Gebaeude,
  planKabelId: string,
): HausStrecke | undefined => {
  const z = gebaeude.zuordnungen.find((x) => x.planKabelId === planKabelId)
  if (!z) return undefined
  return gebaeude.strecken.find((s) => s.id === z.hausStreckeId)
}

// ─── Der eine Rueckweg ──────────────────────────────────────────────────────

export type MangelErgebnis =
  | { ok: true; gebaeude: Gebaeude }
  | { ok: false; grund: string }

/**
 * Einen Mangel am Gebaeude melden — der EINZIGE Schreibweg des Plans.
 *
 * Eine Show aendert das Haus nicht, sie benutzt es. Die eine Ausnahme ist die
 * Aussage eines Menschen ueber einen Defekt: tote Dose, ausloesender RCD, eine
 * Klinke, die nicht das tut, was sie laut Vertrag tut. Die gehoert ans
 * Gebaeude, sonst ist sie nach dem Abbau verloren und die naechste Show findet
 * denselben Fehler noch einmal.
 *
 * Die Funktion ist rein: sie gibt ein NEUES Gebaeude zurueck und liest keine
 * Uhr — `gemeldetAm` kommt von aussen. Eine Meldung auf ein Objekt, das es
 * nicht gibt, wird abgelehnt statt abgelegt: sie waere ein Zettel ohne
 * Empfaenger, und der faellt niemandem auf.
 */
export const mangelMelden = (gebaeude: Gebaeude, mangel: Mangel): MangelErgebnis => {
  if (mangel.befund.trim() === '') {
    return { ok: false, grund: 'Ein Mangel ohne Befund ist keine Meldung.' }
  }
  if (gebaeude.maengel.some((m) => m.id === mangel.id)) {
    return { ok: false, grund: `Ein Mangel mit der Id „${mangel.id}" ist schon gemeldet.` }
  }
  const kennt =
    gebaeude.punkte.some((x) => x.id === mangel.hausObjektId) ||
    gebaeude.stromkreise.some((x) => x.id === mangel.hausObjektId) ||
    gebaeude.verteilungen.some((x) => x.id === mangel.hausObjektId) ||
    gebaeude.klinken.some((x) => x.id === mangel.hausObjektId) ||
    gebaeude.strecken.some((x) => x.id === mangel.hausObjektId) ||
    gebaeude.raeume.some((x) => x.id === mangel.hausObjektId)
  if (!kennt) {
    return {
      ok: false,
      grund: `Das Gebaeude kennt kein Objekt „${mangel.hausObjektId}" — die Meldung haette keinen Empfaenger.`,
    }
  }
  return { ok: true, gebaeude: { ...gebaeude, maengel: [...gebaeude.maengel, mangel] } }
}
