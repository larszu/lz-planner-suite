// ───────────────────────────────────────────────────────────────────────────
// Die vier Laufzeit-Anwendungen der Suite — Tally, Kamerasteuerung, Intercom
// und Medien-Station.
//
// DER BEFUND, DER DAS NOETIG MACHT (B-35, gemessen 2026-09-04). Die
// Modul-Registry der Shell kannte fuenf Eintraege; `tally-pi`,
// `sony-camera-bridge`, `Broadcast-intercom` und `pi-media-station` standen
// nicht darunter. Alle vier existieren, laufen und haben CI — aus der Suite
// heraus gab es sie nicht. Die Feature-Matrix fuehrte drei davon als `YES`;
// das war der Unterschied zwischen „Code existiert" und „Code ist erreichbar".
//
// WARUM SIE NICHT MITGELIEFERT WERDEN, sondern ueber eine Adresse laufen.
// Diese vier sind keine Zeichenflaechen, sondern GERAETE:
//
//   * `tally-pi` und `pi-media-station` laufen auf einem Raspberry Pi im
//     Netz. Sie schalten echte Lampen und echte Sensoren; ein Abbild davon im
//     Planungsfenster waere eine Attrappe.
//   * `sony-camera-bridge` und `Broadcast-intercom` bringen einen eigenen
//     Server mit (Kamera-Protokolle, WebRTC-Audio). Ein statisches Bundle
//     ohne diesen Server zeigte eine Oberflaeche, die nichts bedient.
//
// Die Suite bringt deshalb nicht die Anwendung mit, sondern den WEG dorthin:
// Adresse eintragen, Oberflaeche im Modul. Was mehr ist als ein Lesezeichen,
// steht daneben — die Tally-Karte aus dem Plan geht ueber dieselbe Adresse an
// den Pi (`tallyPush.ts`).
//
// Die Vorgabe-Ports stammen aus den Repos selbst, nicht aus dem Gedaechtnis:
//   tally-pi        `guide_server.py:16`   PORT = 8080
//   camera-bridge   `web-rcp/vite.config`  server.port = 3700 (Bridge: 9700)
//   intercom        `server/src/index.ts`  PORT = 4001
//   media-station   `main.py:154`          config web_port, Vorgabe 5000
// ───────────────────────────────────────────────────────────────────────────
import type { IconName } from '@avplan/ui'

export type RuntimeId = 'tally' | 'kamera' | 'intercom' | 'medien'

export interface RuntimeDef {
  id: RuntimeId
  /** Repository, aus dem die Anwendung kommt. Steht im UI, damit klar ist, was da laeuft. */
  repo: string
  label: string
  title: string
  icon: IconName
  accent: string
  hotkey: string
  defaultHost: string
  defaultPort: number
  /** Pfad hinter Host:Port. Leer heisst Wurzel. */
  path: string
  /** Ein Satz, was das Geraet tut. */
  was: string
  /** Wie man es erreichbar macht — steht im Nicht-erreichbar-Zustand. */
  start: string
}

export const RUNTIMES: RuntimeDef[] = [
  {
    id: 'tally',
    repo: 'tally-pi',
    label: 'Tally',
    title: 'Tally-Anlage',
    icon: 'eye',
    accent: 'var(--mod-signal)',
    hotkey: '6',
    defaultHost: 'tally-pi.local',
    defaultPort: 8080,
    path: '/',
    was: 'ATEM-Tally-Lampen, Browser-Tally und GPIO-Taster auf einem Raspberry Pi.',
    start: 'Der Pi muss laufen und im selben Netz erreichbar sein (guide_server, Port 8080).',
  },
  {
    id: 'kamera',
    repo: 'sony-camera-bridge',
    // "Kamerapult" statt "Kamera": in derselben Rail steht bereits das Modul
    // "Kameras" (der Kamera-PLAN). Zwei Eintraege, deren Namen sich um ein
    // "s" unterscheiden, sind keine Benennung, sondern eine Falle.
    label: 'Kamerapult',
    title: 'Kamerapult (RCP/PTZ)',
    icon: 'camera',
    accent: 'var(--mod-cameras)',
    hotkey: '7',
    defaultHost: 'localhost',
    defaultPort: 3700,
    path: '/',
    was: 'RCP-Paintpult und PTZ-Panel; der Befehlsbus spricht die nativen Protokolle der Kameras.',
    start: 'Bridge (Port 9700) und Web-RCP starten — im Repo `npm run dev`.',
  },
  {
    id: 'intercom',
    repo: 'Broadcast-intercom',
    label: 'Intercom',
    title: 'Intercom',
    icon: 'nodes',
    accent: 'var(--mod-board)',
    hotkey: '8',
    defaultHost: 'localhost',
    defaultPort: 4001,
    path: '/',
    was: 'Browser-Intercom mit Partylines, Direktrufen und System-Kanaelen.',
    start: 'Intercom-Kern starten — im Repo `npm run dev` (Port 4001).',
  },
  {
    id: 'medien',
    repo: 'pi-media-station',
    label: 'Medien',
    title: 'Medien-Station',
    icon: 'monitor',
    accent: 'var(--mod-licht)',
    hotkey: '9',
    defaultHost: 'faces.local',
    defaultPort: 5000,
    path: '/',
    was: 'Sensor-gesteuerte Medien-Station mit Web-Admin und Display-Modus.',
    start: 'Der Pi muss laufen und im selben Netz erreichbar sein (Web-Admin, Port 5000).',
  },
]

export const RUNTIME_BY_ID: Record<RuntimeId, RuntimeDef> = RUNTIMES.reduce(
  (acc, r) => {
    acc[r.id] = r
    return acc
  },
  {} as Record<RuntimeId, RuntimeDef>,
)
