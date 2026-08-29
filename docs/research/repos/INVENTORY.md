# Existing repository inventory

What the eight repositories actually do today, read from the code rather than from the READMEs.
This is the baseline the feature strategy is measured against: research section 30 requires that
where market analysis and existing code disagree, the better solution wins on merit — which is
only possible if the existing code is described honestly.

Verified 2026-08-28 by direct source inspection.

## Summary

| Repo | Domain | Scale (LOC) | Stack | Maturity |
| --- | --- | --- | --- | --- |
| `cable-planner` | Broadcast cabling, signal flow, inventory, rack | ~113,650 TS/TSX | Electron 3-process, React 19, React Flow, three.js, Zustand | Deep. The centre of gravity of the whole suite. |
| `multicam-planner` | Camera and lens planning, 2D/3D venue, shotlist, rig | ~20,110 TS/TSX | React, Konva, three.js, Electron | Solid, focused |
| `light-planner` | Lighting sketch, 2D plan + 3D, MVR/GDTF | ~15,270 TS/TSX | React, three.js, Electron | Solid, focused |
| `av-planner-suite` | Shell + shared packages + vendored copies of the three planners | shell + 4 packages | React 19, Vite, npm workspaces | Integration layer, newest |
| `sony-camera-bridge` | Multi-vendor camera control (RCP/PTZ) | ~9,880 TS | Node bridge + web RCP + Companion module + Electron | Protocol work is real and tested |
| `Broadcast-intercom` | Self-hosted browser intercom | ~6,330 TS | Node server + web client + shared types + Companion module | Working core, in development |
| `tally-pi` | ATEM tally appliance | ~2,980 Python | Python stdlib only, systemd, Companion | Appliance, deliberately dependency-free |
| `pi-media-station` | Sensor-triggered media playback | ~640 Python | Flask-ish web UI, systemd | Adjacent; least connected to the suite |

## The most important architectural finding: the suite is a fork, not an integration

The suite monorepo does not consume the three planner repositories. It contains **vendored
copies** of them under `apps/`, and those copies have been refactored to use the shared packages
while the standalone repositories have not.

Evidence:

- `av-planner-suite/apps/{cable,multicam,light}-planner/package.json` each declare
  `@avplan/inventory-core`, `@avplan/ui`, `@avplan/onboarding-core` as dependencies, and ten
  source files across the three apps import from `@avplan/inventory-core`.
- The standalone repos declare **no `@avplan/*` dependency at all**
  (`grep avplan package.json` is empty for cable-planner and multicam-planner).
- Instead they carry a private copy of the inventory domain model. The file
  `packages/inventory-core/src/types.ts`, `cable-planner/src/renderer/types/inventory.ts` and
  `light-planner/src/inventory/types.ts` are **byte-identical** — all three md5
  `33e0a5aa32d0150b86c68184b2e880f5`, 207 lines, 15 exported symbols.
- The shared package's own contract test states the format "lives ONCE in this package since the
  monorepo consolidation and is consumed by all apps". That is true inside the monorepo and false
  outside it.

Meanwhile the standalone repos are where the active work happens: cable-planner's recent commits
add NetBox site/rack import and docs-stats automation. So features land upstream in the
standalone repo, and the vendored copy in the suite must be re-synced by hand.

This is the *same* defect the research mandate attacks in competitors — one fact stored in more
than one place, kept aligned by human discipline — reproduced inside our own codebase. Section 22
("information should only be entered once") and section 23 ("single source of truth") apply to
source code as much as to camera records.

**Caveat, stated precisely:** this is a *structural* risk, not yet realised drift. The inventory
copies are currently identical, and the `.avplan` and `venue-exchange` formats, while maintained
as separate files in three repos with differing md5s, are **semantically equivalent today**:
same `AVPLAN_VERSION = 1`, same `domains: { cameras, lighting, cabling }` slots, same
`VENUE_EXCHANGE_VERSION = 1`, same field lists on `VenueExchangeWall` and
`VenueExchangeStageObject`. The md5 differences are import paths and semicolon style. Two guards
exist and work: `packages/inventory-core/test/contract.test.ts` freezes the inventory wire format,
and `light-planner/scripts/avplan-check.ts` round-trip-tests the `.avplan` envelope. Neither
guard spans repository boundaries, which is where the exposure is.

## cable-planner

The largest and most capable module by a wide margin, and the one that already implements much
of what the rental/asset-tracking market segments sell.

**Architecture.** Electron three-process model. `src/main/` (ESM, node16 resolution) owns
lifecycle, IPC and all file and network I/O; `src/main/preload.cts` stays CommonJS and exposes
`window.cablePlanner`; `src/renderer/` is the React app with no Node access; `src/mobile/` is a
LAN-served read/check-only view for phones; `src/viewer/` is a separate Vite entry for a
read-only web viewer.

**Domain model** (`src/renderer/types/`, 14 files): `CablePlannerProject`, `EquipmentItem` with
`Port`/`DeviceMode`, `Cable` with `CableWaypoint`/`CableSpec`/`SignalStandard`, `LocationFrame`,
plus complete inventory and logistics entities — `InventoryItem`, `InventoryCase`,
`CasePackedItem`, `StorageNode` (`depot|room|shelf|bin|case|transportCase`), `InventoryUnit` with
`UnitEvent` history, `InventorySet`/`SetComponent`, `UnitCondition`
(`ok|defect|inRepair|retired`), `ServiceRecord`, `CableTestResult`, `ChangeLogEntry`,
`PendingChange`, `ProjectRevision`. Also `GreenGoUser`/`GreenGoGroup`/`GreenGoConfig`,
`VlanDef`/`PortVlanAssignment`, ATEM multiviewer and audio config types, `PowerStandard` across
five regions, `NetboxSnapshot` and friends, `DrumKitPlan` with mic-placement techniques.

**State.** `projectStore.ts` composed from 15 slices, single source of truth for project data;
`uiStore`, `settingsStore`, and `projectHistory` (undo/redo, 100 deep, 200 ms coalesce).

**IPC surface** (14 domain-prefixed channel groups in `src/main/ipc/`): `project`, `library`,
`atem`, `videohub`, `sync`, `mobileShare`, `credentials`, `rentman`, `netbox`, `graphml`,
`print`, `logs`, `signaling`, `collabDiscovery`.

**Integrations.** Rentman (REST, token in OS credential store via keytar), NetBox (site/rack
import), Blackmagic ATEM (multiviewer layout, audio mapping), Blackmagic Videohub (routing and
label export), Green-GO (config export), GraphML, DXF, Lexware Office billing via the suite
package, plus a CRDT layer and a signaling relay for collaboration and a mobile share server.

**Exports** (~20 modules in `lib/`): PDF (raster and vector), per-device PDF, group PDF, rack,
stage plot, DXF, image, CSV, Videohub routing and labels, Green-GO config, ATEM multiviewer
layout and audio mapping XML, barcode/QR labels, asset register, pack list.

**Notable domain logic.** Cable numbering schemes, length estimation schemes, cable inheritance,
routing (orthogonal/straight/curved), connector and compatibility checking with
`ok|warn|error` levels, drawing checks, Dante naming, device type registry, catalogues for
Blackmagic, AJA, Broadcast Tools, cameras, audio and AV network gear.

**Persistence.** Atomic writes only (`src/main/util/atomicWrite.ts`: tmp, .bak rotation, rename).
`healProjectPositions` in `projectStore.ts` is the schema migration layer and runs on every load.

**Offline.** Genuinely offline-first: projects are local files, all integrations opt-in.

## multicam-planner

Camera and lens planning. Domain model: `Camera` with `SensorSize`, `Lens` with
`LensImageCircle`, `AdapterInfo` (adapter detection with T-stop light loss and Speed Booster),
`CameraMountType`, `Venue`/`Stage`/`Wall`/`BackgroundPlan`/`ReferencePerson`, `VenueCamera`,
`FovResult`, `DofResult`, and — beyond what the README advertises — `Shot`/`Shotlist`/`ShotState`
with transitions, and `RigTake`/`TakeSample` with `rigDrive`, `rigGeometry`, `rigLimits`,
`motionProfile` for motion-controlled rigs. Catalogue: 54+ cameras, 163+ lenses, 11 mounts.
Exports via `cameraExport`, `storyboard`, `captureShot`, `shotThumbnail`; AI plan analysis via
pluggable providers.

## light-planner

Lighting sketch tool. `Fixture`/`PlacedFixture` with `PhotometricData`, `BeamShape`, `LensType`,
`MountType`, `Attachment`; `Scene`/`SceneFixtureState`; `Truss`, `Wall` with `WallWindow`,
`Ceiling`, `FloorMaterial` and preset ids, `GelFilter` (CTO/CTB/frost/diffusion/colour),
`SunSettings` for daylight, `FixtureGroup`, `Layers`. MVR export with stable per-type
`FixtureTypeId`. Shares `venue-exchange` with multicam-planner.

## av-planner-suite

Shell plus four shared packages. `@avplan/ui` (theme tokens, primitives, `ModuleRail`,
`CommandPalette`, and the `embed` postMessage bridge), `@avplan/inventory-core` (the portable
`avplan-inventory` wire format, frozen by contract test), `@avplan/onboarding-core`,
`@avplan/lexware-core` (neutral `BillingDoc` mapped to Lexware Office quotation/invoice payloads
with §19 handling). Planners are embedded as isolated iframes; the shell adds an overview
dashboard, a Milanote-style board, settings and billing.

## sony-camera-bridge

A normalising command bus over many vendor protocols, with a web RCP, a touch PTZ panel modelled
on the AW-RP150, a Companion module, an Electron app and firmware. Protocol implementations in
`packages/bridge/src/protocol/`: `Ptp700Protocol` (Sony 700PTP over TCP 7700 / RS-422),
`SonyPtp`/`SonyProtocol` (PTP vendor extension over USB), `LumixClient`, `CcuClient`, plus
backends for Canon CCAPI, Blackmagic REST, Z CAM, Panasonic AW PTZ, VISCA (raw and Sony-header),
JVC and BirdDog. `CameraCapabilities` gates the UI per backend so unsupported functions are
disabled rather than silently failing — a pattern the rest of the suite should adopt. Carries
`BridgeTallyState`/`TallyState`, so it already overlaps tally-pi's domain.

## Broadcast-intercom

Server plus web client plus shared types. Model: `IntercomUser`, `BeltpackDevice` with
`TransportType` (`ethernet|dect|wifi`) and `BatteryState`/`NetworkState`, `Channel` with
`ChannelType` (`group|direct|announcement|emergency|program`), `IntercomGroup`,
`TemporaryChannel`, `MatrixRoute` for point-to-point routing, `UserProfile` with `ChannelSlot`
(eight slots per user), `UserPermissions` gated by `UserRole` (`admin|director|operator|talent`),
`CallBehaviorSettings` with `ReplyMode` (`ptt|latch|handsfree`) and `PopupMode`, `DectAntenna`,
`PluginBridgeConfig`. Wire protocol is a typed `ClientMessage`/`ServerMessage` union over
websocket with a `ControlAction` set. Companion module included; optional Vosk transcription.

## tally-pi

Python stdlib only, no build step, deliberately. Four systemd services: `atem_watcher` (ATEM
state to GPIO and browser tally), `gpio_watcher` and `numato_watcher` (trigger buttons, with a
burst tracker that collapses noisy edges from fibre GPIO converters into one logical press),
`guide_server` (setup web UI). Per source: browser tally page, GPIO tally lamp with per-device
polarity, and trigger buttons that can set an ATEM Aux, switch PGM/PVW or press a Companion
button over HTTP.

## pi-media-station

HC-SR04 ultrasonic sensor drives near/far zones, each mapped to videos, images and audio, with a
web admin, multi-station manager and a Windows dummy sensor for testing. The least connected to
the production-planning story; its natural place in the suite is as a show-control/playback
endpoint rather than a planning module.

## Cross-cutting observations

**Three modules already model tally.** `tally-pi` (ATEM to GPIO and browser), `sony-camera-bridge`
(`BridgeTallyState`), and cable-planner (ATEM multiviewer). Nothing shares a tally source of truth.

**Two modules already model camera identity.** multicam-planner's `VenueCamera` (position, lens,
FOV) and sony-camera-bridge's `CameraState` (IP, protocol, paint), plus cable-planner's
`EquipmentItem` (ports, signals) and the inventory layer's `InventoryUnit` (asset id, serial,
condition). The research mandate's own worked example — camera CAM-023 referenced by every
module — is currently four unrelated records.

**The suite already owns commercial primitives** most competitors charge for: a rental-grade
inventory with cases, storage tree, units and service history; barcode and QR; pack lists; asset
register; billing to Lexware Office. What is missing is not the entities but the connections
between them.

**Green-GO config export already exists in cable-planner** while `Broadcast-intercom` implements
a Green-GO-inspired intercom. The planning side and the operating side of intercom are in
different repositories with no shared model.

**Companion is the de-facto integration bus** across three modules (tally-pi,
sony-camera-bridge, Broadcast-intercom each ship a module or HTTP control surface). That is a
strategic asset: Companion is already on the market's surfaces, and it is the cheapest path to
being present in shows that will never adopt a whole suite.
