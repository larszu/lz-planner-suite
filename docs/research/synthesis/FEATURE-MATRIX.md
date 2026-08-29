# Feature matrix

The comparison matrix required by section 18. Read `../METHOD.md` first: most competitor
domains were unreachable in this sandbox, so competitor cells rest on search summaries unless
marked otherwise, while the AV Planner cells were verified by reading the source
(`../repos/INVENTORY.md`).

## Legend

| Mark | Meaning |
| --- | --- |
| `YES` | Present and a genuine strength |
| `part` | Present but limited, or only under conditions |
| `no` | Absent |
| `?` | Could not be verified in this environment — **not** a claim of absence |
| `n/a` | Out of scope for that product's category |

For AV Planner two columns are given deliberately: **Today** (verified in the code, 2026-08-29)
and **Target** (what this research says we should aim at). Target uses one extra mark:

| Mark | Meaning |
| --- | --- |
| `WON'T` | Deliberately not building it, with the reason stated |

Section 18 is explicit that AV Planner should not simply score `YES` everywhere. Every `WON'T`
below is a decision, not a gap.

## A. The design-time layer — where the market is empty

This is the block that matters. Every competitor column is a runtime or a commercial system;
none of them holds a technical specification of the show.

| Capability | Rentman | Current RMS | Flex | Cuez / Sofie | CyanView | Companion | QLab | NetBox | Vectorworks | AVP Today | AVP Target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Signal-flow model with port direction | no | no | no | no | no | no | n/a | `part` (directionless by design) | `part` | **YES** | YES |
| AV signal semantics (SDI/MADI/Dante/NDI as types) | no | no | no | no | n/a | n/a | n/a | **no** (verified: cable-type enum has none) | `part` | **YES** | YES |
| Connector/compatibility validation | no | no | no | no | n/a | n/a | n/a | no | `part` | **YES** (`ok/warn/error`) | YES |
| Camera position as a planned object | no | no | no | no | no | no | n/a | no | `part` | **YES** | YES |
| Tally mapping planned before the show | no | no | no | no | `part` | no | n/a | no | no | no | **YES** |
| Intercom plan (who hears whom) as data | no | no | no | no | n/a | no | n/a | no | no | `part` (Green-GO export) | **YES** |
| Show-control surface planned as a document | no | no | no | no | n/a | **no** (runtime only) | no | no | no | no | YES |
| Delivery/streaming chain modelled | no | no | no | no | n/a | no | n/a | no | no | no | **YES** |
| Network/IP plan tied to the same devices | no | no | no | no | n/a | no | n/a | YES (IPAM) | no | `part` (VLAN types, NetBox import) | **YES** |

## B. Identity and projection — the dominant user need

| Capability | Rentman | Broadcast NRCS | CyanView | Companion | ATEM SW | AVP Today | AVP Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| One identity per real-world thing | `part` (asset id) | no | no | no | no | `part` | **YES** |
| Device labels rendered from that identity | no | no | no | no | no | `part` (ATEM/Videohub label export) | **YES** |
| Switcher mnemonics generated | no | no | no | `part` | `part` (typed by hand) | `part` | YES |
| Router source/destination labels generated | no | no | no | `part` | n/a | **YES** (Videohub labels) | YES |
| Multiviewer/UMD labels generated | no | no | no | no | `part` | `part` (ATEM MV layout) | YES |
| Tally/TSL address map generated | no | no | `part` | no | no | no | **YES** |
| ISO/record naming driven from the plan | no | `part` | n/a | no | no | no | YES |
| Console scene / input list generated | no | no | n/a | no | n/a | `part` (audio input list, CSV/PDF) | YES |
| Rename costs one edit | no | no | no | no | no | `part` | **YES** |

## C. Logistics and commerce — where the market is strong and we integrate

| Capability | Rentman | Current RMS | Flex | easyjob | Cheqroom | AVP Today | AVP Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Quote → order → invoice | YES | YES | YES | YES | `part` | `part` (Lexware Office) | `part` — **integrate, don't rebuild** |
| Availability / conflict checking | YES | YES | YES | YES | YES | no | WON'T — the ERP owns this; we consume it |
| Sub-hire management | YES | YES | YES | YES | ? | `part` (ownership field) | `part` |
| Crew scheduling & payroll | YES | `part` | YES | YES | no | no | WON'T — mature market, low AV differentiation, high compliance cost |
| Barcode / QR asset tracking | YES | YES | YES | YES | YES | **YES** | YES |
| Case / container as packable unit | `part` | `part` | YES | YES | `part` | **YES** (`StorageNode`, LPN principle) | YES |
| Unit-level condition & service history | YES | YES | YES | YES | YES | **YES** (`InventoryUnit`, `ServiceRecord`) | YES |
| Pack list generation | YES | YES | YES | YES | `part` | **YES** | YES |
| **BOM derived from the technical plan** | **no** | **no** | **no** | **no** | **no** | `part` | **YES — the unclaimed value** |
| Offline warehouse scanning | ? | ? | YES | ? | ? | `part` (mobile view is read/check-only) | YES |
| Offline planning & quoting | **no** | **no** | **no** | `part` (on-prem) | no | **YES** | YES |

## D. Interchange and fidelity

| Capability | Lighting (GDTF/MVR) | Broadcast (NMOS) | Intercom | Show control | Rental ERP | AVP Today | AVP Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| An open interchange format exists at all | YES | YES | **no — none, from anyone** | **no** | no | `part` (`.avplan`, `venue-exchange`, `avplan-inventory`) | YES |
| Round-trip without silent field loss | `part` | n/a | n/a | no | no | `part` (contract test) | **YES — refuse rather than drop** |
| Survives rename / odd characters | **no** (documented breakage) | ? | n/a | n/a | n/a | ? | YES |
| Return path: reality back into the plan | **no** (declared out of scope) | `part` | no | no | `part` | no | **YES — the differentiator** |
| Plan vs found reconciliation | no | `part` | no | no | no | no | YES |
| Import maps arbitrary client spreadsheets | n/a | n/a | n/a | n/a | `part` (xlsx) | no | YES |

## E. Operations — mature runtimes we should not compete with

| Capability | Incumbent | AVP Today | AVP Target |
| --- | --- | --- | --- |
| Live video switching | ATEM / vMix / OBS | no | WON'T — mature, trusted, hardware-bound |
| Media playback / show playback | QLab, Resolume, disguise | `part` (pi-media-station) | WON'T as a competitor; YES as a planned endpoint |
| Lighting console programming | grandMA, ETC Eos | no | WON'T — decades of muscle memory, safety-critical |
| Photoreal previz | Capture, WYSIWYG, Depence | `part` (3D preview) | WON'T — sketch quality is the deliberate position |
| Audio system prediction (SPL/coverage) | ArrayCalc, Soundvision, EASE | no | WON'T — vendor-specific acoustic models we cannot replicate |
| RF coordination | Wireless Workbench, WSM | no | WON'T compute; YES to exporting into them |
| Show-control runtime | Companion | no | WON'T — integrate via its module SDK instead |
| Intercom runtime | Riedel, Clear-Com, Green-GO | **YES** (Broadcast-intercom) | YES — but self-hosted/small-show niche, not matrix replacement |
| Camera paint runtime | Sony MSU, CyanView | **YES** (sony-camera-bridge) | YES |
| Tally runtime | Tally Arbiter, hardware | **YES** (tally-pi) | YES |

## F. Platform qualities

| Quality | Typical cloud ERP | Typical broadcast tool | Open-source tier | AVP Today | AVP Target |
| --- | --- | --- | --- | --- | --- |
| Works with no internet | no | `part` | `part` (self-host ≠ laptop) | **YES** | YES |
| Local-file project ownership | no | `part` | `part` | **YES** | YES |
| No per-seat licence | no | no | YES | **YES** (MIT) | YES |
| No dongle / subscription gate on show night | no | `part` | YES | **YES** | YES |
| Published price | `part` | **no** (segment-wide) | YES | YES (free) | YES |
| Print as a first-class output | `part` | `part` | `part` | **YES** (PDF, vector, per-device, rack, stage plot) | YES |
| Version-stamped printouts with staleness signal | no | no | no | no | **YES** |
| Multi-user collaboration | YES | `part` | `part` | `part` (CRDT + signaling) | YES |

## What the matrix says

**Where we already lead** (verified in code, not aspiration): offline-first planning, local file
ownership, AV signal semantics with port direction and compatibility validation, a rental-grade
inventory with cases and unit history, and a broad export surface. The rental ERPs beat us on
commerce; nobody beats us on the technical plan.

**The single largest unclaimed square** is column C's bottom block: *BOM derived from the
technical plan*. Every rental ERP scores `no`, and the rental dossier calls it "the single largest
unclaimed piece of value adjacent to the segment". We are the only entrant that already owns both
sides — a signal plan with real port modelling, and an inventory with real stock.

**Nine `WON'T` decisions** are recorded above. They matter as much as the `YES` ones: they are
where a feature-count mentality would have burned years competing with grandMA, QLab and
Wireless Workbench. Section 31 is explicit that the goal is not the product with the most
features.

**Honest weaknesses today**: no tally planning despite owning a tally runtime; no intercom plan
despite owning an intercom runtime; no return path anywhere; offline mobile is read-only where
the warehouse needs it writable.

## Caveats

- Competitor cells marked `?` are unverified, not absent. In a matrix this is a dangerous
  distinction to lose, because `?` read as `no` manufactures an advantage that may not exist.
- Five of seventeen segments are still in research; visual workspace, crew scheduling, asset
  tracking and video switching are not yet represented here except through adjacent segments.
- The `WON'T` decisions are judgements made from this research, not immovable. Section 25 keeps
  them open to revision if the market moves.
