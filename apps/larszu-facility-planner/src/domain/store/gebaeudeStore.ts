// ───────────────────────────────────────────────────────────────────────────
// Das Gebäude im Speicher.
//
// Die Domäne selbst (`modell.ts`, `vertrag.ts`) ist rein: sie rechnet und legt
// nichts ab. Dieser Store ist die einzige Stelle, die schreibt — und er hält
// dieselbe Trennung ein, die der Vertrag von aussen verlangt: **Lesen geht
// über den Vertrag, Schreiben über die Pflege.**
//
// WARUM DER MANGEL NICHT WIE DIE ANDEREN ÄNDERUNGEN AUSSIEHT. Räume, Punkte
// und Kreise pflegt der Betreiber; das ist gewöhnliches Bearbeiten. Ein Mangel
// ist etwas anderes — eine Aussage von aussen über das Gebäude, und der Vertrag
// (`mangelMelden`) darf sie ABLEHNEN. Der Store ruft ihn deshalb auf, statt
// selbst anzuhängen, und reicht die Ablehnung durch. Wer hier `maengel.push`
// schreibt, hat die einzige Prüfung übersprungen, die es auf diesem Weg gibt.
// ───────────────────────────────────────────────────────────────────────────
import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_KEYS } from '../../lib/storageKeys'
import { leeresGebaeude, type Anschlusspunkt, type Gebaeude, type Mangel, type Raum, type Steuerklinke, type Stromkreis, type Verteilung } from '../modell'
import { mangelMelden } from '../vertrag'

const KEY = STORAGE_KEYS.gebaeude

const laden = (): Gebaeude => {
  try {
    const roh = localStorage.getItem(KEY)
    if (!roh) return leeresGebaeude('haus-1', 'Gebäude')
    const g = JSON.parse(roh) as Partial<Gebaeude>
    // Fehlende Listen werden ERGAENZT und nicht als leer geglaubt: eine aeltere
    // Datei kennt ein spaeter dazugekommenes Feld nicht, und `undefined.map`
    // waere ein Absturz beim Oeffnen.
    return { ...leeresGebaeude(g.id ?? 'haus-1', g.name ?? 'Gebäude'), ...g }
  } catch {
    return leeresGebaeude('haus-1', 'Gebäude')
  }
}

/**
 * Schreiben — und ein gescheiterter Schreibvorgang wird GEMELDET.
 *
 * Ein leeres `catch` waere die bequeme Zeile und der teure Fehler: der
 * Speicher ist voll, die App meldet Erfolg, und beim naechsten Start ist das
 * Gebaeude weg. Genau dieser Befund steht im `light-planner` (`storage:check`).
 */
const sichern = (g: Gebaeude): string | undefined => {
  try {
    localStorage.setItem(KEY, JSON.stringify(g))
    return undefined
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}

interface GebaeudeState {
  gebaeude: Gebaeude
  /** Letzter gescheiterter Schreibvorgang. Leer, solange alles gut ging. */
  schreibfehler?: string
  raumAnlegen: (r: Omit<Raum, 'id'>) => string
  punktAnlegen: (p: Omit<Anschlusspunkt, 'id'>) => string
  punktAendern: (id: string, patch: Partial<Omit<Anschlusspunkt, 'id'>>) => void
  kreisAnlegen: (k: Omit<Stromkreis, 'id'>) => string
  verteilungAnlegen: (v: Omit<Verteilung, 'id'>) => string
  klinkeAnlegen: (k: Omit<Steuerklinke, 'id'>) => string
  /** Der eine Rueckweg. Gibt den Grund zurueck, wenn die Meldung abgelehnt wird. */
  mangelEintragen: (m: Omit<Mangel, 'id'>) => string | undefined
  entfernen: (id: string) => void
}

const mit = (
  set: (fn: (s: GebaeudeState) => Partial<GebaeudeState>) => void,
  aendern: (g: Gebaeude) => Gebaeude,
) =>
  set((s) => {
    const neu = aendern(s.gebaeude)
    return { gebaeude: neu, schreibfehler: sichern(neu) }
  })

export const useGebaeudeStore = create<GebaeudeState>((set, get) => ({
  gebaeude: laden(),

  raumAnlegen: (r) => {
    const id = uuidv4()
    mit(set, (g) => ({ ...g, raeume: [...g.raeume, { ...r, id }] }))
    return id
  },
  punktAnlegen: (p) => {
    const id = uuidv4()
    mit(set, (g) => ({ ...g, punkte: [...g.punkte, { ...p, id }] }))
    return id
  },
  punktAendern: (id, patch) =>
    mit(set, (g) => ({
      ...g,
      punkte: g.punkte.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  kreisAnlegen: (k) => {
    const id = uuidv4()
    mit(set, (g) => ({ ...g, stromkreise: [...g.stromkreise, { ...k, id }] }))
    return id
  },
  verteilungAnlegen: (v) => {
    const id = uuidv4()
    mit(set, (g) => ({ ...g, verteilungen: [...g.verteilungen, { ...v, id }] }))
    return id
  },
  klinkeAnlegen: (k) => {
    const id = uuidv4()
    mit(set, (g) => ({ ...g, klinken: [...g.klinken, { ...k, id }] }))
    return id
  },

  mangelEintragen: (m) => {
    const ergebnis = mangelMelden(get().gebaeude, { ...m, id: uuidv4() })
    if (!ergebnis.ok) return ergebnis.grund
    mit(set, () => ergebnis.gebaeude)
    return undefined
  },

  entfernen: (id) =>
    mit(set, (g) => ({
      ...g,
      raeume: g.raeume.filter((x) => x.id !== id),
      punkte: g.punkte.filter((x) => x.id !== id),
      stromkreise: g.stromkreise.filter((x) => x.id !== id),
      verteilungen: g.verteilungen.filter((x) => x.id !== id),
      klinken: g.klinken.filter((x) => x.id !== id),
      strecken: g.strecken.filter((x) => x.id !== id),
      maengel: g.maengel.filter((x) => x.id !== id),
    })),
}))
