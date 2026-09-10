// ───────────────────────────────────────────────────────────────────────────
// Auskünfte über das Gebäude, die NICHT zum Vertrag gehören.
//
// ─── WARUM DAS EIN ZWEITES MODUL IST ───────────────────────────────────────
//
// `vertrag.ts` trägt die SECHS Fragen, die der Show-Plan an das Gebäude
// stellt, und `test/vertrag.test.ts` besteht darauf, dass es genau sechs
// bleiben — eine unbenannte siebte fällt dort durch. Das ist kein Formalismus:
// die Liste steht auch in ADR-006, und der Abgleich läuft in der Suite. Wer
// hier eine Funktion dazuschreibt, ändert stillschweigend einen Vertrag, den
// zwei Repos lesen.
//
// Die Auskünfte hier sind etwas anderes: sie beantworten Fragen, die das
// GEBÄUDE-Werkzeug an seine eigenen Daten stellt, damit seine Sichten etwas
// zeigen können. Der Plan fragt sie nicht. Sie deshalb in denselben Topf zu
// werfen hätte den Vertrag um Fragen wachsen lassen, die niemand von außen
// stellt — genau die Richtung, gegen die ADR-006 geschrieben ist.
// ───────────────────────────────────────────────────────────────────────────
import type { Anschlusspunkt, Gebaeude, Lage, Schaltstelle, Steuerklinke, Trasse } from './modell'

/**
 * Woher wissen wir, dass dieser Punkt geschaltet ist?
 *
 * ─── DREI ANTWORTEN, NICHT ZWEI ────────────────────────────────────────────
 *
 * Es gibt zwei Quellen: das Feld `geschaltet` am Punkt (die Angabe des
 * Betreibers) und die Liste `schaltetPunkte` an einer Schaltstelle (die
 * benannte Stelle). Beide können fehlen, und das ist NICHT dasselbe wie „nicht
 * geschaltet":
 *
 *   'stelle'    eine benannte Schaltstelle nennt diesen Punkt
 *   'angabe'    der Betreiber hat `geschaltet: true` gesetzt, ohne Stelle
 *   'nein'      der Betreiber hat `geschaltet: false` gesetzt
 *   'unbekannt' niemand hat etwas gesagt
 *
 * Der Unterschied zwischen `nein` und `unbekannt` ist der, der im Aufbau zählt.
 * Wer ihn einebnet, schreibt „nicht geschaltet" auf ein Blatt, mit dem jemand
 * ein Netzteil an eine Dose hängt, die um 22:00 abfällt.
 */
export type Schaltherkunft =
  | { art: 'stelle'; stelle: Schaltstelle }
  | { art: 'angabe' }
  | { art: 'nein' }
  | { art: 'unbekannt' }

export const geschaltetVon = (gebaeude: Gebaeude, punktId: string): Schaltherkunft => {
  const stelle = (gebaeude.schaltstellen ?? []).find((s) => s.schaltetPunkte.includes(punktId))
  if (stelle) return { art: 'stelle', stelle }
  const punkt = gebaeude.punkte.find((p) => p.id === punktId)
  if (punkt?.geschaltet === true) return { art: 'angabe' }
  if (punkt?.geschaltet === false) return { art: 'nein' }
  return { art: 'unbekannt' }
}

/**
 * Die Trassen zwischen zwei Räumen — in BEIDEN Richtungen.
 *
 * Ein Leerrohr von A nach B ist dasselbe Leerrohr wie von B nach A. Wer nur
 * eine Richtung sucht, findet die Hälfte der Wege und plant eine zweite
 * Leitung, wo schon eine liegt.
 */
export const trassenZwischen = (
  gebaeude: Gebaeude,
  raumA: string,
  raumB: string,
): readonly Trasse[] =>
  (gebaeude.trassen ?? []).filter(
    (t) =>
      (t.vonRaumId === raumA && t.nachRaumId === raumB) ||
      (t.vonRaumId === raumB && t.nachRaumId === raumA),
  )

/**
 * Kann ich hier noch etwas durchziehen?
 *
 * Gibt die BESTE Belegung aller Trassen zwischen den beiden Räumen zurück —
 * `frei` schlägt `teilbelegt` schlägt `voll`. `unbekannt` gewinnt gegen
 * nichts: eine Trasse, bei der niemand nachgesehen hat, ist kein Weg, auf den
 * man sich verlässt, aber auch kein Ausschluss.
 */
export const wegFrei = (
  gebaeude: Gebaeude,
  raumA: string,
  raumB: string,
): 'frei' | 'teilbelegt' | 'voll' | 'unbekannt' | 'keine-trasse' => {
  const trassen = trassenZwischen(gebaeude, raumA, raumB)
  if (trassen.length === 0) return 'keine-trasse'
  const rang = { frei: 3, teilbelegt: 2, unbekannt: 1, voll: 0 } as const
  const beste = trassen.reduce((a, b) => (rang[a.belegung] >= rang[b.belegung] ? a : b))
  return beste.belegung
}

/**
 * Die Punkte eines Raums, die eine Lage im Grundriss haben.
 *
 * Punkte OHNE Lage fallen heraus statt bei (0,0) zu landen. Ein Stapel Marken
 * in der linken oberen Ecke sieht aus wie eine Aussage über das Gebäude und
 * ist keine.
 */
export const punkteMitLage = (
  gebaeude: Gebaeude,
  raumId: string,
): readonly (Anschlusspunkt & { lage: Lage })[] =>
  gebaeude.punkte.filter(
    (p): p is Anschlusspunkt & { lage: Lage } => p.raumId === raumId && !!p.lage,
  )

/**
 * Ist diese Steuer-Adresse mehrdeutig?
 *
 * ─── NUR BEI DALI, UND DORT IMMER ──────────────────────────────────────────
 *
 * Bei DALI heisst „3" je nach Adressart etwas voellig anderes: ein einzelnes
 * Vorschaltgeraet, eine Gruppe von dreissig Leuchten, oder — bei Broadcast —
 * alles am Bus, das Notlicht des Hauses eingeschlossen. Steht die Art nicht
 * dabei, ist die Adresse eine Zahl ohne Reichweite.
 *
 * DAS TRIFFT ÄLTERE DOKUMENTE. `adressart` kam am 2026-09-10 dazu; jede vorher
 * eingetragene DALI-Klinke hat sie nicht. Sie stillschweigend als Kurzadresse
 * zu lesen waere die bequeme Annahme und die gefaehrliche: sie macht aus einer
 * unbekannten Reichweite die kleinstmoegliche, und wer danach schaltet,
 * erfaehrt den Unterschied erst, wenn der Saal dunkel ist.
 *
 * Bei KNX, Crestron und Vissonic ist die Adresse aus sich heraus eindeutig —
 * dort fehlt nichts, wenn das Feld leer bleibt.
 */
export const adresseMehrdeutig = (klinke: Steuerklinke): boolean =>
  klinke.system === 'dali' && klinke.adressart === undefined
