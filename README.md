<h1 align="center">🎬 AV Planner Suite</h1>

<p align="center">
  <b>One workspace for the whole show</b> — broadcast cable planning, multi-camera &amp; lens design,<br />
  and stage/event lighting, unified under a single shell.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue" />
  <img src="https://img.shields.io/badge/offline-first-success" />
  <img src="https://img.shields.io/badge/status-active%20development-orange" />
  <img src="https://img.shields.io/badge/license-MIT-lightgrey" />
</p>

<p align="center">
  Plan cabling, cameras and lighting for studios, OB vans and live events — three focused
  planners that share one design system, one inventory format and one desktop app.
</p>

<!-- DOWNLOAD CTA — always points at the newest GitHub release (installers auto-built in CI) -->
<p align="center">
  <a href="https://github.com/larszu/av-planner-suite/releases/latest">
    <img src="https://img.shields.io/badge/⬇%20Download%20for%20macOS%20%26%20Windows-863bff?style=for-the-badge&logo=github&logoColor=white" alt="Download AV Planner Suite for macOS and Windows" height="42" />
  </a>
  <br />
  <sub>Free &amp; MIT-licensed · <code>.dmg</code> (Apple Silicon + Intel) and <code>.exe</code> installers attached to every release</sub>
</p>

---

## ✨ Overview

**AV Planner Suite** brings three broadcast/event planning tools under one roof: a **cable
planner** for SDI signal flow, a **camera planner** for coverage and lenses, and a **lighting
planner** for stage and event rigs. A shared **shell** ties them together — one module rail, one
command palette, one theme — while each planner stays a self-contained app embedded as an
isolated iframe module.

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

### ⚡ Cable Planner — *Signal*
Node-based editor for **broadcast cabling** — SDI signal flow, ATEM multiviewer layouts and
Blackmagic Videohub routing, with a bill of materials and per-device patch sheets.
**React 19 · React Flow · three.js · Electron.**

### 🎥 MultiCam Planner — *Cameras*
Broadcast **camera &amp; lens** planner — FOV/DoF calculators, 2D and 3D venue planning and a
dynamic camera preview. **React · Konva · three.js · Electron.**

### 💡 Light Planner — *Light*
**Lighting design** for stage and event — a 2D plan plus a 3D/render preview, sharing a venue
exchange format with the MultiCam Planner. **React · three.js · Electron.**

---

## 📦 Shared Packages

| Package | What it provides |
| --- | --- |
| **@avplan/ui** | Design system: theme tokens (Dark/Light + per-module accents), accessible primitives (Button, Modal, Menu, Badge, Tabs, Kbd), `ModuleRail`, `CommandPalette`, theme-aware imperative dialogs, and the `embed` bridge (postMessage theme/settings/history sync for embedded planners). |
| **@avplan/inventory-core** | Shared inventory domain model + the portable `avplan-inventory` wire format (`serializeInventory`/`parseInventory`/`resolveInventoryCode`). The wire contract is frozen by a test — deliberate format changes require bumping `INVENTORY_FORMAT_VERSION`. |
| **@avplan/onboarding-core** | Suite-wide onboarding: `WelcomeDialog` + `TourDialog` + `createOnboardingState` (seen-flags with injectable storage and legacy-key migration) + de/en strings. All apps render the same dialog look. |
| **@avplan/lexware-core** | Neutral billing model (`BillingDoc`) mapped to Lexware Office (lexoffice) **quotation/invoice** payloads — net/gross/§19 tax, discounts, totals — plus a REST client with injectable `fetch` and line-item derivation from inventory and budget. |

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
integrations (Rentman, ATEM, Videohub, Lexware Office) are opt-in.

---

## 🚀 Getting Started

**Prerequisites:** [Node.js](https://nodejs.org/) 20+ and npm.

```bash
# 1. Install every workspace
npm install

# 2. Build the shared packages (needed before app builds)
npm run build:packages

# 3. Run a planner in development
npm run dev:cable        # Cable Planner  (Vite + Electron)
npm run dev:multicam     # MultiCam Planner
npm run dev:light        # Light Planner

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

The individual planners keep their own desktop builds (`npm run dist` in each app).

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

If the AV Planner Suite saves you time on your next show, consider buying me a coffee:

<p>
  <a href="https://paypal.me/larszumpe">
    <img src="https://img.shields.io/badge/PayPal-larszumpe-00457C?logo=paypal&logoColor=white" alt="Donate via PayPal" />
  </a>
</p>

Donations are completely optional — the suite stays MIT-licensed and free either way. 🙌

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).
