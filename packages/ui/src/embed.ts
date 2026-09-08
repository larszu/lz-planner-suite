/**
 * Shell-Bridge: Protokoll zwischen der Shell und den eingebetteten Planer-
 * iframes. Bewusst schlank (postMessage-Eventbus), weil die Planer weiter
 * eigenständige Apps mit eigenem Store/CSS bleiben — die iframe-Isolation ist
 * genau der Grund, dass die Einbettung bestehende Funktionalität nicht bricht.
 */

import { isSuiteSeed, type SeedDomain, type SeedPatch, type SuiteSeed } from './seed'

export type {
  SeedCable,
  SeedCamera,
  SeedDevice,
  SeedDomain,
  SeedFixture,
  SeedHold,
  SeedPatch,
  SeedSharedField,
  SeedVenue,
  SeedWriter,
  SuiteSeed,
} from './seed'
export { SUITE_SEED_KIND, SUITE_SEED_VERSION, emptySeed, isSuiteSeed, seedContentCount } from './seed'
export type { SeedConflict, SeedMerge, SeedVenueField } from './seedOwnership'
export { SEED_VENUE_OWNER, acceptProposal, conflictFieldName, mergeSeedPatch } from './seedOwnership'

export type ResolvedTheme = 'dark' | 'light'

export interface ThemeMessage {
  type: 'avplan:theme'
  theme: ResolvedTheme
  /** Aufgelöste Shell-Palette (`--av-*` → Wert), damit die Planer dieselben
   *  Farben wie die Shell übernehmen (inkl. aktivem Modul-Akzent). */
  palette?: Record<string, string>
}

export interface ReadyMessage {
  type: 'avplan:ready'
  app: string
}

/** Cross-Link: „Im Signal-Flow zeigen“ etc. — Planer bittet die Shell zu wechseln. */
export interface NavigateMessage {
  type: 'avplan:navigate'
  module: string
  target?: string
}

/**
 * Shell → iframe: app-spezifische Einstellungen setzen. Die Shell ist die
 * Quelle der Wahrheit für die „Suite-Einstellungen"; sie schiebt beim Mounten
 * und bei jeder Änderung den kompletten Satz in den geöffneten Planer, der die
 * Schlüssel auf seine eigenen Store-Setter abbildet (connectShellSettings).
 */
export interface SettingsMessage {
  type: 'avplan:settings'
  values: Record<string, unknown>
}

/** Shell → iframe: eine Aktion im geöffneten Planer auslösen (Undo/Redo). */
export interface CommandMessage {
  type: 'avplan:command'
  command: 'undo' | 'redo'
}

/** iframe → Shell: aktueller Undo/Redo-Zustand des Planers. */
export interface HistoryMessage {
  type: 'avplan:history'
  app: string
  canUndo: boolean
  canRedo: boolean
  /** false = der Planer hat gar keine eigene Undo/Redo-Historie. Die Shell
   *  blendet ihre Undo/Redo-Schalter dann aus, statt sie dauerhaft grau zu
   *  zeigen. Fehlt das Feld, wird `true` angenommen (Rückwärtskompatibilität). */
  hasHistory?: boolean
}

/**
 * iframe → Shell: der Nutzer hat im Planer selbst einen gebrückten Wert geändert
 * (z. B. Lichts Heatmap-Schalter im Planer-Menü). Die Shell übernimmt ihn in
 * ihre Quelle der Wahrheit, damit ein Remount die Änderung nicht zurücksetzt.
 */
export interface SettingChangedMessage {
  type: 'avplan:settingChanged'
  key: string
  value: unknown
}

/**
 * Shell → iframe: einen Lexware-Office-Beleg über den Planer anlegen. Der Key
 * liegt server-seitig beim Planer (keytar/IPC), nie im Browser — die Shell reicht
 * nur den fertigen Beleg (`doc`, strukturell ein BillingDoc aus
 * `@avplan/lexware-core`) plus eine `requestId` zur Korrelation.
 */
export interface LexwareRequestMessage {
  type: 'avplan:lexware'
  requestId: string
  action: 'create' | 'ping'
  doc?: unknown
}

/** iframe → Shell: Ergebnis eines Lexware-Requests. */
export interface LexwareResultMessage {
  type: 'avplan:lexwareResult'
  requestId: string
  ok: boolean
  id?: string
  webUrl?: string
  error?: string
}

/**
 * Shell → iframe: das Projekt der Shell als neutraler Seed (`suite-seed`, siehe
 * `seed.ts`). Der Planer bildet daraus sein eigenes Modell — die Abbildung
 * gehoert ihm, nicht der Shell.
 */
export interface SeedMessage {
  type: 'avplan:seed'
  seed: SuiteSeed
}

/**
 * iframe → Shell: „schick mir das Projekt". Noetig, weil die Shell den Seed
 * beim `avplan:ready`-Handshake schiebt und ein Planer, der seinen Listener
 * spaeter aufsetzt (Store-Hydration, lazy geladene Ansicht), ihn sonst
 * verpasst. Der Planer darf das jederzeit erneut fragen.
 */
export interface SeedRequestMessage {
  type: 'avplan:seedRequest'
  app: string
}

/** iframe → Shell: der Planer meldet seine Domaene nach einer Aenderung zurueck. */
export interface SeedPatchMessage {
  type: 'avplan:seedPatch'
  app: string
  patch: SeedPatch
}

/**
 * Shell → iframe: die Tally-Karte aus dem Plan anfordern.
 *
 * Warum ueber den Planer und nicht in der Shell gerechnet: die Karte entsteht
 * aus Rollen, Mischer-Eingaengen und Routern des Kabelplans
 * (`lib/tallyMap.ts`), und dieses Modell hat nur der Cable-Planer. Die Shell
 * kennt weder Rollen noch Router — sie kennt die Adresse des Pi.
 */
export interface TallyRequestMessage {
  type: 'avplan:tally'
  requestId: string
}

/** iframe → Shell: die Tally-Karte, wie der Plan sie hergibt. */
export interface TallyResultMessage {
  type: 'avplan:tallyResult'
  requestId: string
  ok: boolean
  /** Genau die Felder, die `tally-pi` vom Plan erwartet (id/name/input). */
  devices?: { id: string; name: string; input: number }[]
  /** Was der Plan nicht aufloesen konnte — gehoert vor den Nutzer, nicht in ein Log. */
  issues?: { kind: string; message: string }[]
  error?: string
}

/**
 * Shell → iframe: das Objekt mit dieser Id im geoeffneten Planer zeigen (E-11).
 *
 * DER ID-RAUM IST DER DES SEED-PROTOKOLLS und kein zweiter. Die Shell schickt
 * genau die Id, die sie in `suite-seed` hineingegeben hat — `SeedDevice.id`,
 * `SeedCable.id`, `SeedCamera.id`, `SeedFixture.id`. Ein eigener Id-Raum fuer
 * den Sprung waere die zweite Wahrheit, gegen die ADR-001 geschrieben ist:
 * zwei Nummern fuer dasselbe Ding laufen beim ersten Import auseinander, und
 * dann zeigt der Sprung auf das falsche Geraet, ohne es zu merken.
 *
 * `kind` sagt, womit die Shell rechnet — der Planer darf widersprechen. Es ist
 * ein Hinweis zum Suchen, keine Zusicherung: findet er unter der Id etwas
 * anderes, ist das seine Antwort, nicht seine Pflicht.
 */
export interface RevealMessage {
  type: 'avplan:reveal'
  id: string
  kind?: 'device' | 'cable' | 'camera' | 'fixture'
}

/**
 * iframe → Shell: gefunden oder nicht. NIE STUMM.
 *
 * Das ist die eigentliche Auflage aus E-11: „wo eine App ein Objekt nicht
 * kennt, wechselt sie das Modul und sagt, dass sie es nicht gefunden hat —
 * sichtbar, statt stumm irgendwo zu landen." Ein Sprung, der nichts sagt,
 * sieht aus wie ein Sprung, der gelungen ist; der Nutzer sucht dann in einem
 * Planer nach einem Objekt, das dort nie ankam.
 *
 * Deshalb ist `found: false` eine Antwort und kein Fehler — und `grund` gehoert
 * dazu, damit die Shell mehr sagen kann als „ging nicht".
 */
export interface RevealResultMessage {
  type: 'avplan:revealResult'
  app: string
  id: string
  found: boolean
  grund?: string
}

export type ShellMessage =
  | ThemeMessage
  | ReadyMessage
  | NavigateMessage
  | SettingsMessage
  | CommandMessage
  | HistoryMessage
  | SettingChangedMessage
  | LexwareRequestMessage
  | LexwareResultMessage
  | SeedMessage
  | SeedRequestMessage
  | SeedPatchMessage
  | TallyRequestMessage
  | TallyResultMessage
  | RevealMessage
  | RevealResultMessage

const isShellMessage = (data: unknown): data is ShellMessage =>
  !!data && typeof data === 'object' && typeof (data as { type?: unknown }).type === 'string' &&
  (data as { type: string }).type.startsWith('avplan:')

/** Shell → iframe: aktuelles Theme (+ optional aufgelöste Palette) senden. */
export function postThemeToFrame(
  frame: Window | null | undefined,
  theme: ResolvedTheme,
  palette?: Record<string, string>,
): void {
  try {
    frame?.postMessage({ type: 'avplan:theme', theme, palette } satisfies ThemeMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

/** Shell → iframe: kompletten Einstellungs-Satz senden. */
export function postSettingsToFrame(frame: Window | null | undefined, values: Record<string, unknown>): void {
  try {
    frame?.postMessage({ type: 'avplan:settings', values } satisfies SettingsMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

/** Shell → iframe: eine Aktion (Undo/Redo) an den Planer schicken. */
export function postCommandToFrame(frame: Window | null | undefined, command: 'undo' | 'redo'): void {
  try {
    frame?.postMessage({ type: 'avplan:command', command } satisfies CommandMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

/** Shell → iframe: ein Objekt im Planer zeigen (E-11). */
export function postRevealToFrame(
  frame: Window | null | undefined,
  id: string,
  kind?: RevealMessage['kind'],
): void {
  try {
    frame?.postMessage({ type: 'avplan:reveal', id, kind } satisfies RevealMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

/**
 * Planer-Seite: auf `avplan:reveal` hoeren und antworten.
 *
 * `zeige` gibt zurueck, ob das Objekt gefunden wurde — und bei `false` optional
 * einen Grund. Wer hier `void` zurueckgibt, kann nicht antworten, und genau das
 * soll nicht gehen: der Rueckgabetyp ist die Stelle, an der die Auflage aus
 * E-11 im Typsystem steht.
 *
 * ANTWORTEN WIRD NICHT DEM PLANER UEBERLASSEN. Diese Funktion schickt die
 * Antwort selbst, auch wenn `zeige` wirft — ein Planer, der beim Suchen
 * abstuerzt, laesst die Shell sonst im Glauben, es habe geklappt.
 *
 * No-op im Standalone-Betrieb. Gibt eine Cleanup-Funktion zurueck.
 */
export function connectShellReveal(
  zeige: (id: string, kind?: RevealMessage['kind']) => { found: boolean; grund?: string },
): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:reveal') return
    const { id, kind } = e.data
    let antwort: { found: boolean; grund?: string }
    try {
      antwort = zeige(id, kind)
    } catch (err) {
      antwort = { found: false, grund: err instanceof Error ? err.message : String(err) }
    }
    try {
      window.parent.postMessage(
        {
          type: 'avplan:revealResult',
          app: document.title || 'planner',
          id,
          found: antwort.found,
          grund: antwort.grund,
        } satisfies RevealResultMessage,
        '*',
      )
    } catch {
      /* egal */
    }
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

/**
 * Planer-Seite: der Shell melden, dass dieser Planer keine eigene Undo/Redo-
 * Historie hat, damit sie ihre Undo/Redo-Schalter ausblendet. Einmal beim Start
 * aufrufen. No-op im Standalone-Betrieb.
 */
export function declareNoHistory(): void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return
    window.parent.postMessage(
      { type: 'avplan:history', app: document.title || 'planner', canUndo: false, canRedo: false, hasHistory: false } satisfies HistoryMessage,
      '*',
    )
  } catch {
    /* egal */
  }
}

export interface HistoryHandlers {
  undo: () => void
  redo: () => void
  getState: () => { canUndo: boolean; canRedo: boolean }
}

/**
 * Planer-Seite: Undo/Redo der Shell überlassen. Hört auf `avplan:command`,
 * ruft die eigene Undo/Redo-Funktion und meldet den neuen Zustand hoch. `publish`
 * sollte der Planer zusätzlich bei jeder History-Änderung aufrufen, damit die
 * Shell-Buttons live richtig aktiviert/deaktiviert sind. No-op im Standalone.
 */
export function connectShellHistory(h: HistoryHandlers): { publish: () => void; dispose: () => void } {
  let embedded = false
  try {
    embedded = typeof window !== 'undefined' && window.parent !== window
  } catch {
    embedded = false
  }
  const publish = () => {
    if (!embedded) return
    try {
      const { canUndo, canRedo } = h.getState()
      window.parent.postMessage(
        { type: 'avplan:history', app: document.title || 'planner', canUndo, canRedo } satisfies HistoryMessage,
        '*',
      )
    } catch {
      /* egal */
    }
  }
  if (!embedded) return { publish, dispose: () => {} }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:command') return
    if (e.data.command === 'undo') h.undo()
    else if (e.data.command === 'redo') h.redo()
    publish()
  }
  window.addEventListener('message', onMessage)
  publish()
  return { publish, dispose: () => window.removeEventListener('message', onMessage) }
}

/**
 * Planer-Seite: eine lokal (im Planer-eigenen UI) geänderte, gebrückte
 * Einstellung an die Shell zurückmelden, damit deren Quelle der Wahrheit
 * synchron bleibt. No-op im Standalone-Betrieb.
 */
export function publishShellSetting(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return
    window.parent.postMessage({ type: 'avplan:settingChanged', key, value } satisfies SettingChangedMessage, '*')
  } catch {
    /* egal */
  }
}

/**
 * Planer-Seite: auf Einstellungs-Nachrichten der Shell hören und jeden Schlüssel
 * per `apply` auf den eigenen Store abbilden. No-op im Standalone-Betrieb.
 * Gibt eine Cleanup-Funktion zurück.
 */
export function connectShellSettings(apply: (key: string, value: unknown) => void): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:settings') return
    for (const [key, value] of Object.entries(e.data.values)) {
      try {
        apply(key, value)
      } catch {
        /* einzelner Setter darf den Rest nicht abbrechen */
      }
    }
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

/**
 * Planer-Seite: auf Theme-Nachrichten der Shell hören und `data-theme` setzen.
 * No-op, wenn die App nicht eingebettet läuft (dann bestimmt sie ihr Theme
 * selbst). Gibt eine Cleanup-Funktion zurück.
 */
export function connectShellTheme(paletteMap?: Record<string, string>): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data)) return
    if (e.data.type === 'avplan:theme') {
      document.documentElement.setAttribute('data-theme', e.data.theme)
      // Palette der Shell auf die eigenen Root-Variablen abbilden, damit alle
      // Planer exakt die Shell-Farben (inkl. Modul-Akzent, Light-Mode) zeigen.
      if (e.data.palette && paletteMap) {
        const root = document.documentElement
        for (const [shellToken, plannerVar] of Object.entries(paletteMap)) {
          const value = e.data.palette[shellToken]
          if (value) root.style.setProperty(plannerVar, value)
        }
      }
    }
  }
  window.addEventListener('message', onMessage)
  try {
    window.parent.postMessage({ type: 'avplan:ready', app: document.title || 'planner' } satisfies ReadyMessage, '*')
  } catch {
    /* egal */
  }
  return () => window.removeEventListener('message', onMessage)
}

export interface LexwareRequestResult {
  ok: boolean
  id?: string
  webUrl?: string
  error?: string
}

let lexwareReqCounter = 0

/**
 * Shell-Seite: einen Beleg an den geöffneten Planer schicken und auf das Ergebnis
 * warten. Promise-basiert (löst bei passender `requestId` auf), mit Timeout, damit
 * ein nicht-antwortender/standalone Planer nicht hängt.
 */
export function requestLexware(
  frame: Window | null | undefined,
  action: 'create' | 'ping',
  doc?: unknown,
  timeoutMs = 20_000,
): Promise<LexwareRequestResult> {
  return new Promise((resolve) => {
    if (!frame) {
      resolve({ ok: false, error: 'Kein Planer geöffnet.' })
      return
    }
    const requestId = `lx-${++lexwareReqCounter}-${action}`
    let done = false
    const finish = (r: LexwareRequestResult) => {
      if (done) return
      done = true
      window.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(r)
    }
    const onMessage = (e: MessageEvent) => {
      const d = e.data as Partial<LexwareResultMessage> | undefined
      if (!d || d.type !== 'avplan:lexwareResult' || d.requestId !== requestId) return
      finish({ ok: !!d.ok, id: d.id, webUrl: d.webUrl, error: d.error })
    }
    const timer = setTimeout(() => finish({ ok: false, error: 'Zeitüberschreitung — Planer hat nicht geantwortet.' }), timeoutMs)
    window.addEventListener('message', onMessage)
    try {
      frame.postMessage({ type: 'avplan:lexware', requestId, action, doc } satisfies LexwareRequestMessage, '*')
    } catch {
      finish({ ok: false, error: 'Konnte den Beleg nicht an den Planer senden.' })
    }
  })
}

/**
 * Planer-Seite: auf Lexware-Anfragen der Shell hören, `handler` ausführen (der
 * ruft den echten Lexware-IPC im Main-Prozess) und das Ergebnis zurückmelden.
 * No-op im Standalone-Betrieb. Gibt eine Cleanup-Funktion zurück.
 */
export function connectShellLexware(
  handler: (action: 'create' | 'ping', doc?: unknown) => Promise<{ id?: string; webUrl?: string }>,
): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = async (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:lexware') return
    const { requestId, action, doc } = e.data
    const reply = (msg: Omit<LexwareResultMessage, 'type' | 'requestId'>) => {
      try {
        window.parent.postMessage({ type: 'avplan:lexwareResult', requestId, ...msg } satisfies LexwareResultMessage, '*')
      } catch {
        /* egal */
      }
    }
    try {
      const res = await handler(action, doc)
      reply({ ok: true, id: res.id, webUrl: res.webUrl })
    } catch (err) {
      reply({ ok: false, error: err instanceof Error ? err.message : 'Unbekannter Fehler' })
    }
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

/** Shell → iframe: das Projekt als neutralen Seed schieben. */
export function postSeedToFrame(frame: Window | null | undefined, seed: SuiteSeed): void {
  try {
    frame?.postMessage({ type: 'avplan:seed', seed } satisfies SeedMessage, '*')
  } catch {
    /* iframe noch nicht bereit */
  }
}

export interface ShellSeedHandlers {
  /** Welche Domaene dieser Planer besitzt und zurueckmeldet. */
  domain: SeedDomain
  /**
   * Den Seed in das eigene Modell uebernehmen. Wird nur mit einem Seed
   * aufgerufen, dessen Revision neuer ist als die zuletzt uebernommene.
   * Rueckgabe `false` heisst „nicht uebernommen" (z. B. weil der Nutzer eine
   * eigene Datei offen hat) — dann bleibt die zuletzt uebernommene Revision
   * stehen und ein spaeterer Seed wird erneut angeboten.
   */
  apply: (seed: SuiteSeed) => boolean | void
  /** Den eigenen Teil aus dem eigenen Modell einsammeln (fuer `publish`). */
  collect: () => Omit<SeedPatch, 'domain' | 'revision'>
}

/**
 * Planer-Seite: am Projekt-Fluss der Shell teilnehmen. No-op im Standalone-
 * Betrieb — dort bleibt der Planer genau die App, die er ohne Suite ist.
 *
 * Ablauf: beim Aufruf einmal `avplan:seedRequest` hoch (die Shell schiebt den
 * Seed sonst beim `ready`-Handshake, den ein spaet aufgesetzter Listener
 * verpasst), danach auf `avplan:seed` hoeren und `apply` rufen. `publish` meldet
 * die eigene Domaene zurueck und sollte bei jeder Aenderung im Planer laufen —
 * dass es nicht zu oft feuert, ist Sache des Aufrufers (Debounce).
 *
 * Die Echo-Schleife (Shell schiebt → Planer meldet → Shell schiebt erneut) ist
 * ueber die Revision abgeschnitten und nicht ueber Zeitfenster: `apply` laeuft
 * nur bei einer NEUEREN Revision, und `mergeSeedPatch` in der Shell laesst die
 * Revision beim Einarbeiten stehen.
 */
export function connectShellSeed(h: ShellSeedHandlers): { publish: () => void; dispose: () => void } {
  let embedded = false
  try {
    embedded = typeof window !== 'undefined' && window.parent !== window
  } catch {
    embedded = false
  }
  // -1, damit auch ein Seed mit Revision 0 (frisches Projekt) uebernommen wird.
  let appliedRevision = -1
  const app = () => document.title || 'planner'

  const publish = () => {
    if (!embedded || appliedRevision < 0) return
    try {
      // Zeitstempel hier und nicht in jedem Planer: er gehoert zur Meldung,
      // nicht zum Modell, und ein Planer, der ihn vergisst, macht seinen
      // Befund in der Shell aermer, ohne es zu merken. Liefert `collect`
      // selbst ein `at`, gewinnt das — ein Planer, der den Zeitpunkt der
      // AENDERUNG kennt statt den des Sendens, weiss es besser.
      const patch: SeedPatch = {
        domain: h.domain,
        revision: appliedRevision,
        at: Date.now(),
        ...h.collect(),
      }
      window.parent.postMessage({ type: 'avplan:seedPatch', app: app(), patch } satisfies SeedPatchMessage, '*')
    } catch {
      /* egal */
    }
  }
  if (!embedded) return { publish, dispose: () => {} }

  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:seed') return
    const { seed } = e.data
    if (!isSuiteSeed(seed) || seed.revision <= appliedRevision) return
    try {
      const taken = h.apply(seed)
      if (taken !== false) {
        appliedRevision = seed.revision
        // Sofort zurueckmelden, WAS der Planer uebernommen hat. Das ist nicht
        // nur Bestaetigung: die Uebernahme ist verlustbehaftet (ein Modell, das
        // der Katalog nicht kennt, wird nicht platziert), und ohne diese
        // Meldung zeigte die Shell weiter ihre Ausgangszahl — im gebauten Stand
        // „4 Kameras" neben drei platzierten.
        //
        // Der Aufruf gehoert hierher und nicht in die Store-Anbindung der
        // Planer: deren `subscribe` feuert WAEHREND `apply`, also bevor
        // `appliedRevision` steht, und `publish` verwirft dann still.
        publish()
      }
    } catch {
      /* ein fehlgeschlagenes Uebernehmen darf den Planer nicht abschiessen */
    }
  }
  window.addEventListener('message', onMessage)
  try {
    window.parent.postMessage({ type: 'avplan:seedRequest', app: app() } satisfies SeedRequestMessage, '*')
  } catch {
    /* egal */
  }
  return { publish, dispose: () => window.removeEventListener('message', onMessage) }
}

let tallyReqCounter = 0

/**
 * Shell-Seite: die Tally-Karte beim geoeffneten Cable-Planer anfordern.
 * Promise-basiert wie `requestLexware`, mit Frist — ein Planer, der nicht
 * antwortet, darf den Knopf nicht haengen lassen.
 */
export function requestTallyMap(
  frame: Window | null | undefined,
  timeoutMs = 8000,
): Promise<{ ok: boolean; devices?: { id: string; name: string; input: number }[]; issues?: { kind: string; message: string }[]; error?: string }> {
  return new Promise((resolve) => {
    if (!frame) {
      resolve({ ok: false, error: 'Der Signal-Planer ist nicht geöffnet.' })
      return
    }
    const requestId = `tally-${++tallyReqCounter}`
    let fertig = false
    const schliesse = (r: Parameters<typeof resolve>[0]) => {
      if (fertig) return
      fertig = true
      window.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(r)
    }
    const onMessage = (e: MessageEvent) => {
      const d = e.data as Partial<TallyResultMessage> | undefined
      if (!d || d.type !== 'avplan:tallyResult' || d.requestId !== requestId) return
      schliesse({ ok: !!d.ok, devices: d.devices, issues: d.issues, error: d.error })
    }
    const timer = setTimeout(
      () => schliesse({ ok: false, error: 'Zeitüberschreitung — der Planer hat nicht geantwortet.' }),
      timeoutMs,
    )
    window.addEventListener('message', onMessage)
    try {
      frame.postMessage({ type: 'avplan:tally', requestId } satisfies TallyRequestMessage, '*')
    } catch {
      schliesse({ ok: false, error: 'Die Anfrage erreichte den Planer nicht.' })
    }
  })
}

/**
 * Planer-Seite: auf Tally-Anfragen der Shell hoeren. No-op im Standalone.
 */
export function connectShellTally(
  handler: () => { devices: { id: string; name: string; input: number }[]; issues: { kind: string; message: string }[] },
): () => void {
  try {
    if (typeof window === 'undefined' || window.parent === window) return () => {}
  } catch {
    return () => {}
  }
  const onMessage = (e: MessageEvent) => {
    if (!isShellMessage(e.data) || e.data.type !== 'avplan:tally') return
    const { requestId } = e.data
    const antwort = (msg: Omit<TallyResultMessage, 'type' | 'requestId'>) => {
      try {
        window.parent.postMessage({ type: 'avplan:tallyResult', requestId, ...msg } satisfies TallyResultMessage, '*')
      } catch {
        /* egal */
      }
    }
    try {
      const { devices, issues } = handler()
      antwort({ ok: true, devices, issues })
    } catch (err) {
      antwort({ ok: false, error: err instanceof Error ? err.message : 'Unbekannter Fehler' })
    }
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

/** Shell-Seite: Nachrichten aus den iframes abonnieren. */
export function onShellMessage(handler: (msg: ShellMessage, source: MessageEventSource | null) => void): () => void {
  const onMessage = (e: MessageEvent) => {
    if (isShellMessage(e.data)) handler(e.data, e.source)
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}
