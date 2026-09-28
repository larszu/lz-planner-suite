<p align="center"><img src="apps/shell/build/icon.png" alt="" width="96" /></p>

<h1 align="center">LZ Planner Suite</h1>

<p align="center">
  <b>One workspace for the whole show</b> — broadcast cable planning, multi-camera &amp; lens design,<br />
  and stage/event lighting, unified under a single shell.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue" />
  <img src="https://img.shields.io/badge/offline-first-success" />
  <img src="https://img.shields.io/badge/status-active%20development-orange" />
  <img src="https://img.shields.io/badge/license-proprietär-critical" />
</p>

<p align="center">
  Plan cabling, cameras and lighting for studios, OB vans and live events — three focused
  planners that share one design system, one inventory format and one desktop app.
</p>

<!-- DOWNLOAD CTA — always points at the newest GitHub release (installers auto-built in CI) -->
<p align="center">
  <a href="https://github.com/larszu/av-planner-suite/releases/latest">
    <img src="https://img.shields.io/badge/⬇%20Download%20for%20macOS%20%26%20Windows-863bff?style=for-the-badge&logo=github&logoColor=white" alt="Download LZ Planner Suite for macOS and Windows" height="42" />
  </a>
  <br />
  <sub>Kostenlos nutzbar, proprietär lizenziert · <code>.dmg</code> (Apple Silicon + Intel) and <code>.exe</code> installers attached to every release</sub>
</p>

<p align="center">
  <img src="docs/screenshot.png" alt="LZ Planner Suite – Projekt-Dashboard mit Signal-, Kamera- und Licht-Plan, Tagesablauf, Crew und Budget" />
</p>

---

## The web page

Every push to the default branch builds this repo's page from
`.github/workflows/pages.yml` and publishes it:

**https://larszu.github.io/av-planner-suite/**

The workflow **asks the Pages API before it configures anything.** With no
Pages site it still builds — that is a real check — and skips only the
publishing step, with a warning and the one missing step in the run summary.
A run that must stay red for a click nobody made teaches people to ignore red.

Measured 2026-09-09: **published** — the `deploy` job ran and succeeded.

---
## ✨ Overview

**LZ Planner Suite** brings three broadcast/event planning tools under one roof: a **cable
planner** for SDI signal flow, a **camera planner** for coverage and lenses, and a **lighting
planner** for stage and event rigs. A shared **shell** ties them together — one module rail, one
command palette, one theme — while each planner stays a self-contained app embedded as an
isolated iframe module.

The header starts with the Lars Zumpe Medienproduktion signet „lz" (without the tally point — red stays with the primary button); *Help → About* shows
the main logo, the app name, its version and the company.

It is a **monorepo** built with **npm workspaces**: four apps plus a set of shared packages
(design system, inventory model, onboarding, Lexware Office billing). Everything is
**offline-first** — projects are local files and integrations are opt-in.

✔ Unified shell for cabling, cameras &amp; lighting
✔ macOS &amp; Windows desktop builds
✔ Shared design system, inventory format &amp; onboarding
✔ Fully offline, local-file projects

---

## 🧩 The Apps

### 🖥️ Shell — the unified surface
The common workspace (`apps/shell`) that hosts all three planners: a module rail with number
hotkeys (Overview / Signal / Cameras / Light / Board), a topbar with a **⌘K command palette**,
a tab deck with a floating toolbar, context-aware **library** and **properties** panels, a
project overview dashboard, a Milanote-style creative **board**, and a shared Dark/Light theme
with per-module accents. Embeds the planners as isolated iframe modules and speaks to them over
a small postMessage bridge. **React 19 · Vite · Tailwind.**

The board plays as a film, exports one as a real video file, records a voice-over that travels
inside it, takes a photo with the machine's camera, and receives pages from the browser
extension in [`tools/web-clipper/`](tools/web-clipper/) — see [`docs/board.md`](docs/board.md).
The clipper's inbox listens on `127.0.0.1` only, is opened by hand in the settings, and carries
a secret that is new on every start.

A board card can also point at a **device or cable of the plan**. It stores only that
reference and reads name, model, lens, DMX channel or cable ends live from the project on every
render; a button on the card jumps to the module that owns the object. If the object leaves the
plan, the card says so instead of going blank.

The overview dashboard shows the inventory's answer as a **coverage light** per demand line
(own stock · partly, sub-hire the rest · not in stock · unknown). "Unknown" — no answer, or
nobody counted — is never shown as "missing". The **crew** card speaks `@avplan/crew-core`:
booking state (pencilled · on hold · confirmed · worked) and overlaps of the same person from
`bookingConflicts`, for every entry with a date, start and end; entries without a time window
are named, not silently passed.

**Room in 3D** (overview card) puts every planner into one picture: the venue and stage, placed
cameras, fixtures at their trim height, signal devices and the cables between them — straight
from the shared project. A mixer, router or switch gets its spot from the signal plan: if it sits
on the scaled floor plan there (two-point scale), it stands at the same place in the room; one
placed beside the plan stays off the picture, because it is in the control room, not at the edge
of the hall. Cameras and fixtures keep the position their own plan gives them. Devices without a
position are counted, not dropped at the origin. The per-floor building view lives in the cable
planner (*3D* in its toolbar).

Two people can work on the same board over their own network: one opens a window, the others
join from a browser on the same network with nothing to install. Nothing travels over machines
you do not own, and the window is gone the moment it is closed. Cards merge per card, the
younger edit wins, and deletions leave a tombstone so they do not come back.

### ⚡ LZ Cable Planner — *Signal*
Node-based editor for **broadcast cabling** — SDI signal flow, ATEM multiviewer layouts and
Blackmagic Videohub routing, with a bill of materials and per-device patch sheets.
**React 19 · React Flow · three.js · Electron.**

### 🎥 LZ Multicam Planner — *Cameras*
Broadcast **camera &amp; lens** planner — FOV/DoF calculators, 2D and 3D venue planning and a
dynamic camera preview. **React · Konva · three.js · Electron.**

### 💡 LZ Light Planner — *Light*
**Lighting design** for stage and event — a 2D plan plus a 3D/render preview, sharing a venue
exchange format with the LZ Multicam Planner. **React · three.js · Electron.**

---

## 📦 Shared Packages

| Package | What it provides |
| --- | --- |
| **@avplan/ui** | Design system: theme tokens (Dark/Light + per-module accents), accessible primitives (Button, Modal, Menu, Badge, Tabs, Kbd), `ModuleRail`, `CommandPalette`, theme-aware imperative dialogs, and the `embed` bridge (postMessage theme/settings/history sync for embedded planners). Also the `suite-seed` and `deckungsAmpel`, the one mapping from the inventory's answer to a coverage light that every planner can use. |
| **@avplan/inventory-core** | Shared inventory domain model + the portable `avplan-inventory` wire format (`serializeInventory`/`parseInventory`/`resolveInventoryCode`). The wire contract is frozen by a test — deliberate format changes require bumping `INVENTORY_FORMAT_VERSION`. |
| **@avplan/onboarding-core** | Suite-wide onboarding: `WelcomeDialog` + `TourDialog` + `createOnboardingState` (seen-flags with injectable storage and legacy-key migration) + de/en strings. All apps render the same dialog look. |
| **@avplan/crew-core** | **Crew & Geld** (ADR-006): rates, hours, bookings, expenses, receipts. It knows no plan model -- measured, not asserted: `plan-grenze-check` refuses any import out of the package and any identifier that belongs to the plan. That the cut was clean is itself a measurement: the domain had no imports at all, because it never hung on the cable graph. Step 2 of the three ADR-006 prescribes; the own repo (step 3) waits until a second operator *writes* the domain instead of only reading it. The shell's crew card is a second *reader* (booking states, `bookingConflicts`). |
| **@avplan/device-catalog** | **One** device-type catalogue for every planner (ADR-002, ADR-011, ADR-012): the identity of a model — id, manufacturer, model, category, data sheet. 1778 types, merged from the cabling planner's 19 catalogues (498), the camera list (377), the lens list (835) and the lighting fixture library (84). Each entry also carries `refs`: what each source calls that type in its own list, so a planner finds *its* entry from a shared id without comparing names. The trade-specific facts stay with the planner that understands them; a package that carried ports would drag half the cable graph with it. Merging **reports** disagreements instead of silently picking, and `katalog:parity` keeps the generated types tied to their source. |
| **@avplan/lexware-core** | Neutral billing model (`BillingDoc`) mapped to Lexware Office (lexoffice) **quotation/invoice** payloads — net/gross/§19 tax, discounts, totals — plus a REST client with injectable `fetch` and line-item derivation from inventory and budget. |
| **@avplan/floorplan** | Floor plans for every planner: load a plan file by picker **or drag & drop** (images, PDF via an injected pdf.js renderer), downscale to 3000 px, two-point and four-corner (homography) scale, and the shared `venue-exchange` schema. The first package that also reaches the **standalone** planners: `npm run pakete:verteilen` copies it into each repo under `…/avplan/floorplan/` with a SHA-256 manifest, and each planner's own CI refuses an edited copy ([ADR-015](docs/decisions/ADR-015-pakete-erreichen-die-planer.md), plan in [`docs/gemeinsame-pakete.md`](docs/gemeinsame-pakete.md)). |

---

## 🛠️ Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Desktop shell | **Electron** (each planner + the suite) |
| UI | **React 19** + **TypeScript** |
| Shell canvas | **React Flow** / **Konva** / **three.js** per planner |
| Styling | **Tailwind CSS** (token-based theming, Dark/Light) |
| State | **Zustand** stores with localStorage autosave |
| Build | **Vite** + **npm workspaces** |
| Packaging | **electron-builder** (NSIS `.exe`, `.dmg` x64 + arm64) |

The suite is **offline-first**: projects are local files, state lives on-device, and
integrations (Rentman, ATEM, Videohub, Lexware Office, the device library at
[devices.zumpelars.de](https://devices.zumpelars.de)) are opt-in. The device library is set up in
each planner's settings under **Device library**: sign in with a token, sync, and optionally
upload your own devices automatically.

---

## 🚀 Getting Started

**Prerequisites:** [Node.js](https://nodejs.org/) 20+ and npm.

```bash
# 1. Install every workspace
npm install

# 2. Build the shared packages (needed before app builds)
npm run build:packages

# 3. Run a planner in development
npm run dev:cable        # LZ Cable Planner  (Vite + Electron)
npm run dev:multicam     # LZ Multicam Planner
npm run dev:light        # LZ Light Planner

# 4. Run the shell (embeds the planners as iframes)
npm run dev --workspace @avplan/shell    # → http://localhost:5180

# 5. Build & test everything
npm run build            # shared packages + all apps
npm test                 # tests across all workspaces
```

Per-app commands (lint, tests, desktop builds) live in each app's own README / CLAUDE.md and
run in the app directory or via `npm run <script> --workspace <app>`.

---

## 🔗 Shell &amp; Module Integration

The shell is the shared surface; the three planners stay independent apps embedded as
**iframe modules**. The isolation is deliberate: each planner keeps its own store, CSS and (in
the desktop build) IPC bridge — nothing can collide with the shell, so embedding never breaks
existing functionality. Communication runs over a small postMessage bus (`@avplan/ui/embed`):
the shell pushes its theme, language and settings into the frame, the planner reports “ready”
and can send cross-links back. Each app's `connectShellTheme()` call is a no-op when it is not
embedded.

```bash
# The shell expects the embedded planners at (override via env):
#   VITE_PLANNER_SIGNAL   (default http://localhost:4181)  → cable-planner
#   VITE_PLANNER_CAMERAS  (default http://localhost:4182)  → multicam-planner
#   VITE_PLANNER_LICHT    (default http://localhost:4183)  → light-planner
# If a planner isn't running, the shell shows a fallback instead of a dead frame.
```

### One device, many plans

There is **one** device per piece of kit — not one per planner (ADR-011). Both the shell's project
and the `suite-seed` hold a single `geraete` list with every device exactly once, its category and
the fields of *all* planners. A plan is a **filter** on that list — `imKameraplan`, `imLichtplan`,
`imSignalplan` — and no longer a list of its own: the seed carries `geraete` and `cables`, nothing
else.

The **category** does the assigning, and it assigns to several plans at once: a camera belongs to
the camera plan *and* to the signal plan, because it has a standpoint *and* connectors. A mixer
belongs to the signal plan only. The category is declared from the owning planner's **catalogue**
(via the data-sheet template) — never guessed from the name, and never taken from the free-text
category field a user types. Without one, a device still belongs to the signal plan: “not stated”
is not “nowhere”.

Seeing a device is not the same as writing to it. Ownership moves from *per list* to *per field
group*: focal length belongs to the camera plan, the DMX address to the lighting plan, the ports
to the signal plan. Nothing a planner does not own can be overwritten by it.

What one plan owns, the others **show**: a camera placed in the camera plan appears in the signal
plan with its lens, set focal length and horizontal field of view on the node and under *Optics* in
its properties — read from the camera group on every seed, so a lens change arrives there, and
never sent back from the signal plan as its own.

### One type, one identity

The device knows its **type**: `typId` carries the catalogue identity (ADR-012) through the seed,
and every planner resolves *its own* entry from it — the camera plan its sensor and mount, the
lighting plan its photometrics, the signal plan its ports, the warehouse its stock position. The
name comparison stays underneath, for kit that came from no catalogue; it is the weaker answer, so
it comes second rather than instead.

Before that, four lists answered the same question in four ways, and “Sony FX9” against
“Sony PXW-FX9” decided whether a camera arrived in the camera plan — and whether the house ordered
one body or two.

What is *not* **interpreted** elsewhere: the trade facts. Sensor and mount belong to the camera
plan, photometrics to the lighting plan, ports to the signal plan. Pick a type another planner
owns and you get it along with the statement that those facts are missing, instead of the model
being hidden from you.

You can also invent a device. A model you create yourself travels with the device (ADR-014) — the
catalogue does not know it, so the device itself carries it, and it comes back intact on another
machine. And a device you create by hand in one planner, with a category but no model, is no
longer dropped in silence by the others: they list it and say what it is missing. What they will
not do is guess it. Without a sensor there is no field of view, without photometrics there is no
light calculation, and a computed number would look perfectly right.

Owning them is not the same as being the only one who keeps them. Every device carries one
**compartment per trade** (`fachdaten`, ADR-013): each planner writes its own in full, nobody
reads another's, and nobody may lose one. That is what makes a→b→c→a work — take a project from
the cabling planner into the camera planner, on into the lighting planner and back, and the pan,
tilt, aperture and renamed ports are all still there. Before that they were not: each planner kept
its own state alongside, so within one session it looked right, and across a *file* the work was
gone.

A camera created in the cabling planner therefore *is* a camera in the camera plan — nothing to
confirm, nothing to link, and the bill of materials counts one device because there is one. Project
files written before this are migrated on load over the **declared** correspondence they carried,
and over nothing else: two records nobody connected are two things, however similar their names.

No position is invented anywhere. A device's `nx`/`ny` are diagram coordinates, not metres in the
hall; a device without a place in the hall is shown as "not placed yet" rather than drawn at the
origin.

---

## 📦 Desktop Installers &amp; Releases

The suite shell ships as its own Electron desktop app. A tagged release builds and attaches the
installers automatically — Windows `.exe` (NSIS + portable) and macOS `.dmg` for **Intel (x64)**
and **Apple Silicon (arm64)**:

```bash
git tag v1.0.0
git push origin v1.0.0        # → .github/workflows/release-suite.yml builds + publishes the release
```

To build the suite installer locally (current platform):

```bash
npm run build:packages
npm run build --workspace @avplan/shell
npm run dist:app --workspace @avplan/shell   # → apps/shell/release/
```

Installer names follow the product name: `LZ Planner Suite-<version>-universal.dmg`,
`LZ Planner Suite-<version>-x64.exe` (NSIS) and `LZ Planner Suite-<version>-portable.exe`
(GitHub shows the spaces as dots). The app icon is `apps/shell/build/icon.svg`
(`icon.png` for macOS, `icon.ico` for Windows); favicon, touch icon and web manifest
sit in `apps/shell/public/`.

Settings, library and recent projects stay in the user-data folder `AV Planner Suite`
from before the rename — `electron/main.cjs` pins it in the packaged app, so updating keeps them.

The individual planners keep their own desktop builds (`npm run dist` in each app).

---

## 📚 Documentation

- [**`docs/README.md`**](docs/README.md) — index of everything under `docs/`:
  implementation status and backlog, the five ADRs, and the market/user research
  corpus.
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) — what
  actually runs across the eight repos, evidenced by execution rather than plans.
- [`docs/research/README.md`](docs/research/README.md) — ~21,000 lines of market
  and user research across 16 segments, 11 professions and 8 repositories.
  Start at [`METHOD.md`](docs/research/METHOD.md).

`npm run docs:reachable` fails the build if a document under `docs/` is not
reachable by links from an entry page — every one of them was orphaned until
2026-09-04.

---

## 📝 Notes

- Nested `apps/*/.github/workflows/` are **inert** in the monorepo — GitHub only runs workflows
  in the root `.github/`.
- All apps link the shared packages via `"*"` versions; npm workspaces wire them automatically.
- In the packaged suite app, the embedded planner iframes show the “unreachable” fallback until
  their `VITE_PLANNER_*` URLs point at hosted builds — the shell itself (overview, board,
  settings, billing) works standalone, and “open in new tab” launches the default browser.

---

## 👤 Author

Built and maintained by **Lars Zumpe**.

---

## ❤️ Support / Donate

If the LZ Planner Suite saves you time on your next show, consider buying me a coffee:

<p>
  <a href="https://paypal.me/larszumpe">
    <img src="https://img.shields.io/badge/PayPal-larszumpe-00457C?logo=paypal&logoColor=white" alt="Donate via PayPal" />
  </a>
</p>

Donations are completely optional — the suite stays free to use. It is proprietary software, not open source. 🙌

---

## 📄 License

Proprietär — © 2026 Lars Zumpe, alle Rechte vorbehalten. Nutzung der veröffentlichten Builds ist kostenlos; Weiterverbreitung und abgeleitete Werke sind es nicht. Siehe [`LICENSE`](LICENSE).
