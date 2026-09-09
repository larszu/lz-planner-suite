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
// LOKAL STARTEN IST SEIT 2026-09-09 DER NORMALFALL, und die Vorgaben sagen
// das jetzt auch. Der Nutzer: „in av suite muessen tally, kamerapult,
// intercom und medien auch lokal startbar sein."
//
// Vorher zeigten zwei der vier Vorgaben auf einen Pi im Netz
// (`tally-pi.local`, `faces.local`) und ihr Nicht-erreichbar-Text sagte „Der
// Pi muss laufen". Das stimmte, als es geschrieben wurde, und stimmt seit
// dem Bau von `run-local.py` bzw. `run-local.sh` nicht mehr: beide laufen
// auf einem gewoehnlichen Rechner. Eine Vorgabe, die auf einen Rechner
// zeigt, den es beim Nutzer nicht gibt, ist fuer ihn dasselbe wie kein
// Eintrag — er sieht „nicht erreichbar" und einen Rat, der ihm nicht hilft.
//
// Die Pi-Adresse ist deshalb nicht weg, sondern eine VORWAHL (`presets`):
// ein Klick, kein Abtippen. Wer im Produktionsnetz arbeitet, ist genauso
// schnell dort wie vorher; wer am Laptop entwickelt, muss nichts mehr
// aendern.
//
// Die Vorgabe-Ports stammen aus den Repos selbst, nicht aus dem Gedaechtnis
// — und `test/modulErreichbarkeit.test.ts` liest sie dort nach:
//   tally-pi        `guide_server.py`      PORT = 8080
//   camera-bridge   `web-rcp/vite.config`  server.port = 3700 (Bridge: 9700)
//   intercom        `apps/web/vite.config` server.port = 5200  ← die BEDIENUNG
//   media-station   `main.py`              config web_port, Vorgabe 5000
//
// DER INTERCOM-PORT WAR FALSCH, und der Guard hat es nicht gemerkt, weil er
// denselben Fehler machte: hier stand 4001, und der Guard las
// `apps/server/src/index.ts`, wo 4001 auch wirklich steht. Nur ist 4001 der
// KERN (WebSocket + API) und traegt keine Oberflaeche — der Server liefert
// keine statischen Dateien aus, nachgesehen 2026-09-09. Die Bedienoberflaeche
// liegt auf 5200, und das Repo sagt es in seinem README woertlich: „Open
// http://localhost:5200". Wer das Modul oeffnete, bekam den Kern zu sehen,
// nicht das Intercom. Ein Waechter, der denselben Denkfehler hat wie die
// Sache, die er prueft, ist auf genau diesem Fehler gruen.
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
  /**
   * Die zwei, drei Adressen, an denen dieses Geraet ueblicherweise steht.
   *
   * Der erste Eintrag IST die Vorgabe (`defaultHost`/`defaultPort`) — die
   * Liste wiederholt sie nicht aus Bequemlichkeit, sondern damit ein
   * Zurueckschalten auf „lokal" derselbe Klick ist wie das Hinschalten zum
   * Pi. `test/laufzeitVorwahl.test.ts` haelt fest, dass der erste Eintrag
   * und die Vorgabe nie auseinanderlaufen: zwei Orte fuer dieselbe Adresse
   * driften, und dann sagt die Vorwahl „lokal", waehrend das Feld daneben
   * etwas anderes zeigt.
   */
  presets: { label: string; host: string; port: number; was: string }[]
}

export const RUNTIMES: RuntimeDef[] = [
  {
    id: 'tally',
    repo: 'tally-pi',
    label: 'Tally',
    title: 'Tally-Anlage',
    icon: 'eye',
    accent: 'var(--mod-signal)',
    hotkey: '8',
    defaultHost: 'localhost',
    defaultPort: 8080,
    path: '/',
    was: 'ATEM-Tally-Lampen, Browser-Tally und GPIO-Taster — auf einem Raspberry Pi oder lokal.',
    start: 'Im Repo `tally-pi`: `python3 run-local.py` (Port 8080, `--port` aendert ihn). Ohne Pi laeuft alles ausser den GPIO-Lampen; `--demo` schaltet Beispieldaten dazu.',
    presets: [
      { label: 'Lokal', host: 'localhost', port: 8080, was: 'run-local.py auf diesem Rechner' },
      { label: 'Pi im Netz', host: 'tally-pi.local', port: 8080, was: 'guide_server auf dem Raspberry Pi' },
    ],
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
    hotkey: '9',
    defaultHost: 'localhost',
    defaultPort: 3700,
    path: '/',
    was: 'RCP-Paintpult und PTZ-Panel; der Befehlsbus spricht die nativen Protokolle der Kameras.',
    start: 'Im Repo `sony-camera-bridge`: `npm run dev` startet Bridge (9700) und Web-RCP (3700) zusammen. Ohne Kameras im Netz steht das Pult da und meldet keine Verbindung — das ist der richtige Zustand, keine Attrappe.',
    presets: [
      { label: 'Lokal', host: 'localhost', port: 3700, was: 'npm run dev auf diesem Rechner' },
    ],
  },
  {
    id: 'intercom',
    repo: 'Broadcast-intercom',
    label: 'Intercom',
    title: 'Intercom',
    icon: 'nodes',
    accent: 'var(--mod-board)',
    hotkey: '0',
    defaultHost: 'localhost',
    // 5200 und nicht 4001: siehe Kopf dieser Datei. 4001 ist der Kern
    // (WebSocket + API) und liefert keine Oberflaeche aus; die Bedienung
    // liegt auf 5200. Vorher zeigte das Modul auf den Kern.
    defaultPort: 5200,
    path: '/',
    was: 'Browser-Intercom mit Partylines, Direktrufen und System-Kanaelen.',
    start: 'Im Repo `Broadcast-intercom`: `npm run dev` startet Kern (4001) und Bedienung (5200). `npm run dev:mock` erzeugt dazu simulierte Beltpacks — dann laesst sich das ganze Intercom ohne ein einziges Geraet durchspielen.',
    presets: [
      { label: 'Lokal', host: 'localhost', port: 5200, was: 'npm run dev auf diesem Rechner' },
    ],
  },
  {
    id: 'medien',
    repo: 'pi-media-station',
    label: 'Medien',
    title: 'Medien-Station',
    icon: 'monitor',
    accent: 'var(--mod-licht)',
    // Die Ziffern sind mit elf Modulen aufgebraucht (1-7 Planung, 8-0 Betrieb).
    // „m" wie Medien ist die naechstbeste Taste: merkbar, und `ModuleRail`
    // vergleicht ohnehin gegen `e.key` und nicht gegen eine Ziffernreihe.
    hotkey: 'm',
    defaultHost: 'localhost',
    defaultPort: 5000,
    path: '/',
    was: 'Sensor-gesteuerte Medien-Station mit Web-Admin und Display-Modus — auf einem Pi oder lokal.',
    start: 'Im Repo `pi-media-station`: `./run-local.sh` (Linux/macOS). Ohne Sensor-Hardware laeuft der Web-Admin vollstaendig; andere Geraete im selben Netz erreichen ihn unter der IP dieses Rechners.',
    presets: [
      { label: 'Lokal', host: 'localhost', port: 5000, was: 'run-local.sh auf diesem Rechner' },
      { label: 'Pi im Netz', host: 'faces.local', port: 5000, was: 'Web-Admin auf dem Raspberry Pi' },
    ],
  },
]

export const RUNTIME_BY_ID: Record<RuntimeId, RuntimeDef> = RUNTIMES.reduce(
  (acc, r) => {
    acc[r.id] = r
    return acc
  },
  {} as Record<RuntimeId, RuntimeDef>,
)
