import type { IconName } from '@avplan/ui'
import { RUNTIMES, type RuntimeId } from './runtimes'

export type ModuleId =
  | 'overview'
  | 'signal'
  | 'cameras'
  | 'licht'
  // Die beiden ausgelagerten Werkzeuge (ADR-006 Schritt 3, E-26/E-27). Sie
  // standen in MODULES, aber nicht in dieser Union — `tsc -b` hat es lokal
  // aus einem alten .tsbuildinfo heraus nicht neu geprueft und erst in CI
  // gemeldet. Wer hier ein Modul ergaenzt, ergaenzt BEIDE Stellen.
  | 'lager'
  | 'gebaeude'
  | 'board'
  | RuntimeId

export interface ModuleDef {
  id: ModuleId
  /** Label in der Rail. */
  label: string
  /** Vollname für Topbar/Panels. */
  title: string
  icon: IconName
  hotkey: string
  /** CSS-Variable der Modul-Akzentfarbe. */
  accent: string
  /** data-module-Wert, der die Akzentfarbe im Baum umschaltet. */
  dataModule: string
  /** Welcher Planer steckt dahinter (leer für Übersicht). */
  planner?: 'cable' | 'multicam' | 'light' | 'inventory' | 'facility'
  /** iframe-URL des Planers (env-überschreibbar, sonst lokale Preview). */
  plannerUrl?: string
  /**
   * Welche Laufzeit-Anwendung im Netz dahintersteht (Tally, Kamera, Intercom,
   * Medien). Schliesst `planner` aus: ein Planer wird mitgeliefert, ein Geraet
   * steht woanders und hat eine Adresse (`shell/runtimeHosts.ts`).
   */
  runtime?: RuntimeId
  libraryTabs: string[]
  eyebrow: string
}

const env = import.meta.env as Record<string, string | undefined>

// Im gepackten Suite-Desktop injiziert das Electron-Preload echte
// planner-*://-URLs auf window.__suitePlanners — dann laufen die *echten*
// Planer-Renderer lokal aus dem Paket (kein Dev-Server, keine Mock-Vorschau).
// Im Browser/Dev fehlt das Objekt und es greifen die env-URLs (Dev-Server).
const bundled = (typeof window !== 'undefined'
  ? (window as unknown as { __suitePlanners?: Record<string, string> }).__suitePlanners
  : undefined)

/** True, wenn die Planer als Paket-Renderer mitgeliefert werden (Desktop-Suite). */
export const BUNDLED_PLANNERS = !!bundled

function plannerUrl(key: string, envUrl: string | undefined, devFallback: string): string {
  return bundled?.[key] ?? envUrl ?? devFallback
}

export const MODULES: ModuleDef[] = [
  {
    id: 'overview',
    label: 'Übersicht',
    title: 'Projekt-Übersicht',
    icon: 'modules',
    hotkey: '1',
    accent: 'var(--mod-overview)',
    dataModule: 'overview',
    libraryTabs: ['Projekt', 'Venue', 'Verlauf'],
    eyebrow: 'Projekt',
  },
  {
    id: 'signal',
    label: 'Signal',
    title: 'Signal-Flow',
    icon: 'signal',
    hotkey: '2',
    accent: 'var(--mod-signal)',
    dataModule: 'signal',
    planner: 'cable',
    plannerUrl: plannerUrl('signal', env.VITE_PLANNER_SIGNAL, 'http://localhost:4181/'),
    libraryTabs: ['Equipment', 'Kabel', 'Racks'],
    eyebrow: 'Kabel · Signal',
  },
  {
    id: 'cameras',
    label: 'Kameras',
    title: 'Kamera-Plan',
    icon: 'camera',
    hotkey: '3',
    accent: 'var(--mod-cameras)',
    dataModule: 'cameras',
    planner: 'multicam',
    plannerUrl: plannerUrl('cameras', env.VITE_PLANNER_CAMERAS, 'http://localhost:4182/'),
    libraryTabs: ['Kameras', 'Objektive', 'Templates'],
    eyebrow: 'Kamera · Venue',
  },
  {
    id: 'licht',
    label: 'Licht',
    title: 'Licht-Plan',
    icon: 'light',
    hotkey: '4',
    accent: 'var(--mod-licht)',
    dataModule: 'licht',
    planner: 'light',
    plannerUrl: plannerUrl('licht', env.VITE_PLANNER_LICHT, 'http://localhost:4183/'),
    libraryTabs: ['Fixtures', 'Gels', 'Presets'],
    eyebrow: 'Fixture · Licht',
  },
  {
    id: 'lager',
    label: 'Lager',
    title: 'Lager',
    icon: 'library',
    hotkey: '5',
    accent: 'var(--mod-lager)',
    dataModule: 'lager',
    planner: 'inventory',
    plannerUrl: plannerUrl('lager', env.VITE_PLANNER_LAGER, 'http://localhost:4184/'),
    // Die Bibliothek der Shell zeigt hier nichts: der Bestand IST die Ansicht,
    // und eine zweite Liste daneben waere dieselbe Sache zweimal.
    libraryTabs: [],
    eyebrow: 'Bestand · Ausgabe',
  },
  {
    id: 'gebaeude',
    label: 'Gebäude',
    title: 'Gebäude',
    icon: 'modules',
    hotkey: '6',
    accent: 'var(--mod-gebaeude)',
    dataModule: 'gebaeude',
    planner: 'facility',
    plannerUrl: plannerUrl('gebaeude', env.VITE_PLANNER_GEBAEUDE, 'http://localhost:4185/'),
    // Wie beim Lager: die Sichten SIND die Ansicht. Eine Bibliothek daneben
    // haette hier nichts zu zeigen, was nicht schon in der Tabelle steht.
    libraryTabs: [],
    eyebrow: 'Anschluss · Kreis',
  },
  {
    id: 'board',
    label: 'Board',
    title: 'Kreativ-Board',
    icon: 'board',
    hotkey: '7',
    accent: 'var(--mod-board)',
    dataModule: 'board',
    // Keine Bibliotheks-Reiter mehr (suite#232). Hier standen „Karten" und
    // „Vorlagen": die Karten-Liste war eine tote Zweitsicht, und einen
    // Vorlagen-Reiter gab es nie — die Vorlagen sitzen im Vorlagen-Menue der
    // Board-Werkzeugleiste. Ein Versprechen in der Registry, das die
    // Oberflaeche nicht einloest, ist genau die Form, die suite#100 schon
    // einmal fuer die Tab-Leiste ausgeraeumt hat.
    libraryTabs: [],
    eyebrow: 'Board · Kreativ',
  },
]

/**
 * Die vier Laufzeit-Anwendungen als Module. Sie stehen bewusst NACH den
 * Planern: das Fenster plant links und bedient rechts.
 *
 * Kein `plannerUrl` — die Adresse kommt aus den Einstellungen und kann sich
 * zwischen zwei Produktionen aendern; sie hier einzutragen hiesse, sie
 * festzunageln. `libraryTabs` ist leer, weil die Bibliothek der Shell fuer ein
 * Geraet nichts zu zeigen hat.
 */
for (const r of RUNTIMES) {
  MODULES.push({
    id: r.id,
    label: r.label,
    title: r.title,
    icon: r.icon,
    hotkey: r.hotkey,
    accent: r.accent,
    dataModule: r.id,
    runtime: r.id,
    libraryTabs: [],
    eyebrow: r.repo,
  })
}

export const MODULE_BY_ID: Record<ModuleId, ModuleDef> = MODULES.reduce(
  (acc, m) => {
    acc[m.id] = m
    return acc
  },
  {} as Record<ModuleId, ModuleDef>,
)

/**
 * Liegt der Planer dieses Moduls NEBEN der Shell — statt auf einem
 * Dev-Server, der laufen muss?
 *
 * An dieser Frage haengt, ob die Shell den ECHTEN Planer einblendet oder ihre
 * eigene, absichtlich einfache Vorschau. Bis 2026-09-09 hing sie an
 * `BUNDLED_PLANNERS`, also allein an der gepackten Desktop-Suite — und damit
 * zeigte die veroeffentlichte Seite ueberall die Vorschau, obwohl der
 * Pages-Lauf alle fuenf Planer mitbaut und als `./planners/<modul>/`
 * danebenlegt. Nutzer-Meldung 2026-09-09: „in ab planner suite sind mockups
 * zu sehen. Da sollen nur die echten Apps drin laufen."
 *
 * Das Merkmal ist die ART DER ADRESSE und nicht der Verpackungsweg, denn
 * genau darum geht es: eine `http(s)://`-Adresse zeigt auf einen Dienst, der
 * laufen muss (im Entwicklungsbetrieb `localhost:418x`) — steht er nicht, ist
 * ein toter Rahmen die schlechtere Antwort als die Vorschau. Alles andere
 * — der relative Pfad der Seite, das `planner-*://` der Desktop-Suite — wird
 * MIT der Shell ausgeliefert und ist genau dann da, wenn die Shell da ist.
 *
 * Es bleibt eine Voreinstellung, keine Sperre: der Schalter in der Tab-Leiste
 * schaltet weiterhin in beide Richtungen.
 */
export function adresseMitgeliefert(url: string | undefined): boolean {
  return !!url && !/^https?:\/\//i.test(url)
}

/** Dasselbe fuer das Modul mit dieser Kennung. */
export function plannerMitgeliefert(id: ModuleId): boolean {
  // EINE Rechnung, an einer Stelle. Die Regel hier ein zweites Mal
  // hinzuschreiben — im Test etwa — waere genau die Doppelung, die
  // irgendwann zwei verschiedene Antworten gibt.
  return adresseMitgeliefert(MODULE_BY_ID[id]?.plannerUrl)
}
