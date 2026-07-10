# AV Planner Suite

Monorepo für die drei AV-Planungs-Apps von Lars Zumpe plus geteilte Pakete.
Tooling: **npm workspaces** (kein pnpm — verträgt sich besser mit
Electron/electron-builder). Die Apps wurden als frische Übernahme (ohne
Git-History) aus ihren Einzel-Repos zusammengeführt.

## Apps

| App | Pfad | Beschreibung |
|---|---|---|
| **Shell** | [`apps/shell`](apps/shell) | Gemeinsame App-Shell, die alle drei Planer unter einer Oberfläche vereint: Modul-Leiste (Übersicht/Signal/Kameras/Licht) mit Ziffern-Hotkeys, Topbar mit Command-Palette (⌘K), Tab-Deck mit schwebender Werkzeugleiste, kontextsensitive Bibliotheks- und Eigenschaften-Panels, Statusleiste, Dark/Light-Theme. Bindet die Planer als isolierte iframe-Module ein (Signal→cable, Kameras→multicam, Licht→light). React 19 + Vite + Tailwind. |
| **Cable Planner** | [`apps/cable-planner`](apps/cable-planner) | Electron-Desktop-App zum Planen und Visualisieren von Broadcast-Verkabelung (SDI-Signalfluss, ATEM-Multiviewer, Blackmagic-Videohub). React 19 + ReactFlow + Three.js, offline-first. |
| **MultiCam Planner** | [`apps/multicam-planner`](apps/multicam-planner) | Broadcast-Kamera- & Objektiv-Planer — FOV/DoF-Rechner, 2D/3D-Venue-Planung, dynamische Preview. React + Konva + Three.js, Electron-Desktop-Build. |
| **Light Planner** | [`apps/light-planner`](apps/light-planner) | Lichtplanung für Bühne/Event — 2D-Plan + 3D-Vorschau, Venue-Austauschformat mit dem MultiCam Planner. React + Three.js, Electron-Desktop-Build. |

## Pakete

| Paket | Pfad | Beschreibung |
|---|---|---|
| **@avplan/inventory-core** | [`packages/inventory-core`](packages/inventory-core) | Geteiltes Inventar-Domänenmodell (`InventoryItem`, `StorageNode`, `InventorySet`, `InventoryUnit`, …) + portables Wire-Format `avplan-inventory` (`serializeInventory`/`parseInventory`/`resolveInventoryCode`). Ersetzt die früher dreifach kopierten Dateien `types.ts`/`portable.ts` in den Apps. Der Wire-Contract ist per Test eingefroren (`test/contract.test.ts`) — bewusste Format-Änderungen erfordern einen Sprung von `INVENTORY_FORMAT_VERSION`. |
| **@avplan/onboarding-core** | [`packages/onboarding-core`](packages/onboarding-core) | Suite-einheitliches Onboarding: `WelcomeDialog` (Erststart-Aktionen) + `TourDialog` (Erste-Schritte-Tour mit Schrittzähler/Punkten) + `createOnboardingState` (Seen-Flags mit injizierbarem Storage und Migration alter Einzel-Keys) + de/en-Strings. Alle drei Apps rendern damit denselben Dialog-Look; Sprache, Icons und Akzentfarbe liefert die App. |
| **@avplan/ui** | [`packages/ui`](packages/ui) | Gemeinsames Design-System: Theme-Tokens (`styles.css`, Dark/Light + Per-Modul-Akzente Raum/Signal/Kameras/Licht), zugängliche Primitive (Button, Panel, Badge, Tabs, Kbd), `ModuleRail`, `CommandPalette` (ARIA-Combobox/Listbox, volle Tastatur-Bedienung), `useTheme` und die Shell-`embed`-Bridge (postMessage-Theme-Sync für eingebettete Planer). Basis der Shell und der geteilte visuelle Nenner der Suite. |

## Setup

```bash
npm install              # installiert alle Workspaces
npm run build:packages   # baut @avplan/inventory-core (dist/ + .d.ts) — vor App-Builds nötig
```

## Scripts (Root)

```bash
npm run build            # Pakete + alle Apps bauen
npm test                 # Tests aller Workspaces (--if-present)
npm run dev:cable        # Cable Planner Dev-Modus (Vite + Electron)
npm run dev:multicam     # MultiCam Planner Dev-Server
npm run dev:light        # Light Planner Dev-Server
```

Je-App-Befehle (Tests, Lint, Desktop-Builds) stehen in den README/CLAUDE.md der
jeweiligen App und laufen wie gewohnt im App-Verzeichnis oder via
`npm run <script> --workspace <app>`.

## Shell & Modul-Integration

Die Shell (`apps/shell`) ist die gemeinsame Oberfläche; die drei Planer bleiben
eigenständige Apps und werden als **iframe-Module** eingebettet. Diese Isolation
ist bewusst gewählt: jeder Planer behält seinen eigenen Store, sein CSS und (im
Desktop-Build) seine IPC-Bridge — nichts davon kann mit der Shell kollidieren,
die Einbettung bricht also keine bestehende Funktionalität. Kommunikation läuft
über einen schlanken postMessage-Bus (`@avplan/ui/embed`): die Shell schiebt ihr
Theme in den Rahmen, der Planer meldet „ready" und kann Cross-Links
zurückschicken. Der Bridge-Aufruf `connectShellTheme()` in jeder App ist ein
No-op, solange die App nicht eingebettet läuft.

```bash
npm run dev --workspace @avplan/shell   # Shell auf http://localhost:5180
# Die eingebetteten Planer erwartet die Shell unter (überschreibbar per env):
#   VITE_PLANNER_SIGNAL   (default http://localhost:4181)  → cable-planner
#   VITE_PLANNER_CAMERAS  (default http://localhost:4182)  → multicam-planner
#   VITE_PLANNER_LICHT    (default http://localhost:4183)  → light-planner
# Läuft ein Planer nicht, zeigt die Shell einen Fallback statt eines toten Rahmens.
```

## Hinweise

- Die verschachtelten `apps/*/.github/workflows/` sind im Monorepo **inert** —
  GitHub führt nur Workflows im Root-`.github/` aus.
- Alle drei Apps hängen über `"@avplan/inventory-core": "*"` am geteilten
  Paket; npm workspaces linkt es automatisch.
