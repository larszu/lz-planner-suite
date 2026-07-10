# AV Planner Suite

Monorepo für die drei AV-Planungs-Apps von Lars Zumpe plus geteilte Pakete.
Tooling: **npm workspaces** (kein pnpm — verträgt sich besser mit
Electron/electron-builder). Die Apps wurden als frische Übernahme (ohne
Git-History) aus ihren Einzel-Repos zusammengeführt.

## Apps

| App | Pfad | Beschreibung |
|---|---|---|
| **Cable Planner** | [`apps/cable-planner`](apps/cable-planner) | Electron-Desktop-App zum Planen und Visualisieren von Broadcast-Verkabelung (SDI-Signalfluss, ATEM-Multiviewer, Blackmagic-Videohub). React 19 + ReactFlow + Three.js, offline-first. |
| **MultiCam Planner** | [`apps/multicam-planner`](apps/multicam-planner) | Broadcast-Kamera- & Objektiv-Planer — FOV/DoF-Rechner, 2D/3D-Venue-Planung, dynamische Preview. React + Konva + Three.js, Electron-Desktop-Build. |
| **Light Planner** | [`apps/light-planner`](apps/light-planner) | Lichtplanung für Bühne/Event — 2D-Plan + 3D-Vorschau, Venue-Austauschformat mit dem MultiCam Planner. React + Three.js, Electron-Desktop-Build. |

## Pakete

| Paket | Pfad | Beschreibung |
|---|---|---|
| **@avplan/inventory-core** | [`packages/inventory-core`](packages/inventory-core) | Geteiltes Inventar-Domänenmodell (`InventoryItem`, `StorageNode`, `InventorySet`, `InventoryUnit`, …) + portables Wire-Format `avplan-inventory` (`serializeInventory`/`parseInventory`/`resolveInventoryCode`). Ersetzt die früher dreifach kopierten Dateien `types.ts`/`portable.ts` in den Apps. Der Wire-Contract ist per Test eingefroren (`test/contract.test.ts`) — bewusste Format-Änderungen erfordern einen Sprung von `INVENTORY_FORMAT_VERSION`. |

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

## Hinweise

- Die verschachtelten `apps/*/.github/workflows/` sind im Monorepo **inert** —
  GitHub führt nur Workflows im Root-`.github/` aus.
- Alle drei Apps hängen über `"@avplan/inventory-core": "*"` am geteilten
  Paket; npm workspaces linkt es automatisch.
