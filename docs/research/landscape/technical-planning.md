# Technical Planning: Cable / Signal Flow / Patch / Rack

> Research date: **2026-08-28**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read on a cited page or in cited source code), **INFERENCE** (reasoning),
> **UNKNOWN / unverified**.

## Source-access caveat (read this before trusting anything below)

This pass ran in the same locked-down environment as `landscape/tally.md`, with the same two
limits:

1. **WebSearch was exhausted before this dossier started** (200/200 calls used by earlier
   segments). Zero searches were available.
2. **The egress proxy allowed only a handful of hosts.** Verified reachable: `github.com`,
   `raw.githubusercontent.com`, `pypi.org`, and `git clone` over HTTPS. Every commercial
   vendor host tested returned `EGRESS_BLOCKED`:
   `www.wirecad.com`, `www.d-tools.com`, `www.xtenav.com`, `www.stardraw.com`,
   `www.avixa.org`, `university.vectorworks.net`. Also blocked: `en.wikipedia.org`,
   `netbox.readthedocs.io`. `www.npmjs.com` returned HTTP 403.

What made this segment survive that: the **documentation-and-source-of-truth half** of it is
open source, and `git clone` worked. Nine repositories were cloned and read. Every statement
below about a data model, a schema, a file format or a wire protocol is taken from schema
DDL, type definitions, parser code or vendor-published specification text — not from memory.

Consequences, stated plainly:

- **There is not one verified vendor price in this dossier.** Not one. No pricing page was
  reachable. Every price band below is explicitly marked **INFERENCE** or **UNKNOWN**, and the
  price column of the product table says so per row. Do not quote any number from this
  document to anyone.
- **The commercial AV/CAD half of the segment could not be researched from its own
  documentation.** Vectorworks ConnectCAD, D-Tools System Integrator, XTEN-AV, Stardraw
  Design 7 and WireCAD have no verified entry here. What I can report about them is a
  *negative* finding that is itself informative, below.
- **A negative finding worth recording (FACT).** These products have essentially zero
  open-source footprint. GitHub code search for `ConnectCAD Vectorworks` returned
  **0 results**; `WireCAD signal flow` returned **1 result**, in an unrelated
  domain-abuse evidence dump. Vectorworks' own three public GitHub repositories
  (`developer-scripting`, `developer-worksheets`, `developer-sdk`) contain **no reference to
  ConnectCAD at all** (code search scoped `org:Vectorworks` → 0 hits). **INFERENCE:** this is
  a closed segment with no interchange culture and no third-party developer ecosystem — which
  is consistent with the brief's premise that practitioners fall back to Excel and Visio, and
  it is the single most strategically relevant thing I can say about the commercial tier.

One find deserves flagging up front: **Rackula** (`RackulaLives/Rackula`, MIT, first commit
2025-12-25, 1,674 stars) is an actively developed open-source rack designer that, in the last
few months, has started building **exactly** the port-direction-plus-signal-type model that
AV needs and that no established tool has. It is treated as the most important deep dive here.

---

## Segment summary

This category answers four questions that a broadcast or AV engineer asks in a specific order,
and the tools in it are usually good at only one or two of them:

| # | Question | Artefact produced |
| --- | --- | --- |
| 1 | **What connects to what?** | Signal-flow / block diagram |
| 2 | **Through which physical port, on which panel, in which rack?** | Patch schedule, rack elevation |
| 3 | **What do I have to buy, build and label?** | BOM, cable schedule, label set |
| 4 | **Is it wrong?** | Validation / design-rule check |

The segment splits into four tiers that barely talk to each other (**INFERENCE**, but the
data models below support it):

1. **AV/CAD design suites** — Vectorworks Spotlight + ConnectCAD, D-Tools System Integrator,
   Stardraw Design 7, WireCAD, XTEN-AV. Drawing-first. Sold to systems integrators who must
   produce a signed drawing set and a priced proposal. Nothing verified about them here.
2. **IT/DCIM sources of truth** — NetBox, Nautobot, RackTables, openDCIM, Device42. Database-
   first, drawing-second. They have, by a wide margin, the **best cable and patch data models
   in existence** — and no AV signal semantics whatsoever.
3. **Generic diagramming** — Visio, Lucidchart, draw.io/diagrams.net. What people actually
   use when tiers 1 and 2 are too expensive or too rigid. Pixels, not data.
4. **Harness/wiring documentation** — WireViz. Pin-level, BOM-generating, text-defined. Comes
   from the electronics/harness world, not AV, and is currently dormant.

Underneath all four sits **the spreadsheet**: the patch sheet, the cable schedule, the I/O
list. The brief asks whether AV people fall back to Excel. Nothing in this pass let me survey
practitioners, so I cannot answer that from evidence — but see *What NOBODY solves well*,
where the structural reason for the fallback is visible in the data models themselves.

**Who buys it.** (**INFERENCE**, from the shape and licensing of each product)

- **Systems integrators** buy tier 1, because the deliverable is contractual: a drawing set,
  a BOM and a price, all consistent with each other.
- **Facility and broadcast engineers** adopt tier 2, because the deliverable is a queryable
  source of truth that survives staff turnover.
- **Freelancers, rental houses and small OB** live in tiers 3 and 4 plus spreadsheets,
  because tiers 1 and 2 cost either money or a server.

**Typical price band. UNKNOWN — deliberately not estimated.** No pricing page was reachable
and I will not reconstruct prices from memory. What *is* **FACT** is the licensing of the open
tier: NetBox is Apache 2.0, Nautobot Apache 2.0, RackTables GPL, openDCIM GPLv3, Rackula MIT,
WireViz GPLv3-family (see `LICENSE` in repo), draw.io Apache 2.0 — i.e. **zero licence cost
for the entire tier-2 and tier-4 half of this segment**, with cost shifting to hosting and
staff time. To verify the commercial band you would need to open the pricing pages of
d-tools.com, xtenav.com, wirecad.com, stardraw.com and vectorworks.net, all of which were
blocked.

---

## Product table

The **Verified?** column is not decoration — it separates what I read from what I merely know
the name of. Rows marked *name only* are listed because the brief named them and omitting them
would misrepresent the segment's shape; every attribute in such a row is **UNKNOWN**.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at | Verified? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **NetBox** | NetBox Labs / community | Django + PostgreSQL, self-host or cloud | Apache 2.0 core, free; cloud tier price UNKNOWN | Yes — self-hosted; server + DB required | Yes: REST + GraphQL (`dcim/api/`, `dcim/graphql/` both present) | Cable path tracing *through* patch panels; breakout/trunk cable profiles | **Cloned & read** (v4.6.9) |
| **Nautobot** | Network to Code | Django + PostgreSQL, self-host | Apache 2.0, free | Yes — self-hosted | Yes (REST/GraphQL, inherited lineage from NetBox) | NetBox's model plus a plugin/job framework | Repo metadata only (1,588 stars) |
| **RackTables** | RackTables community | PHP + MySQL/MariaDB | GPL, free | Yes — self-hosted | UNKNOWN | **Patch-cable stock** and connector-compatibility rules — unique in this set | **Cloned & read** (schema) |
| **openDCIM** | Scott Milliken / community | PHP + MySQL | GPLv3, free | Yes — self-hosted | UNKNOWN | Data-hall infrastructure — **but see below: project is being retired** | **Cloned & read** |
| **Rackula** | Gareth Evans (@ggfevans) | SvelteKit/TypeScript; Docker, LXC, bare metal | MIT, free | Yes — self-host Docker; browser-local layouts | Partial: "API-backed layout sync" (README) | Rack-elevation UX **and an emerging AV port-direction + signal-type model** | **Cloned & read** (v26.8.0) |
| **WireViz** | WireViz project | Python CLI (+ `wireviz-web` wrapper) | Free, open source | Yes — fully local, no network | CLI + importable Python; REST via `wireviz-web` | Pin-level harness drawings **with automatic BOM** from one YAML file | **Cloned & read** (v0.4.1) |
| **draw.io / diagrams.net** | JGraph | Web + Electron desktop | Apache 2.0, free | Yes — `drawio-desktop` is a full offline Electron app | Limited (embed/integration APIs) | Getting a diagram out today with no data model at all | **Repo verified**; rack stencils enumerated |
| **NetBox devicetype-library** | community | YAML files (data, not an app) | Apache-licensed data, free | Yes — plain files | Consumed by NetBox import tooling | 6,021 device definitions with port lists — the segment's de-facto equipment library | **Cloned & counted** |
| **Vectorworks Spotlight + ConnectCAD** | Vectorworks (Nemetschek) | macOS/Windows desktop CAD | UNKNOWN — requires sales contact | UNKNOWN (desktop CAD, likely yes — INFERENCE) | Vectorworks SDK/Python exists; **ConnectCAD API UNKNOWN** | Entertainment-industry CAD with an AV signal-flow module | **Name only** — vendor host blocked |
| **D-Tools System Integrator / D-Tools Cloud** | D-Tools | Windows desktop (SI) + cloud | UNKNOWN — requires sales contact | UNKNOWN | UNKNOWN | Integrator workflow: proposal → drawings → BOM | **Name only** — host blocked |
| **XTEN-AV (X-DRAW)** | XTEN-AV | Cloud/browser | UNKNOWN — requires sales contact | **Cloud-first; offline UNKNOWN** | UNKNOWN | Browser-based AV drawing | **Name only** — host blocked |
| **WireCAD** | WireCAD | Windows desktop | UNKNOWN | UNKNOWN | UNKNOWN | Cable-schedule-centric AV/broadcast documentation | **Name only** — host blocked |
| **Stardraw Design 7** | Stardraw | Windows desktop | UNKNOWN | UNKNOWN | UNKNOWN | AV schematic drawing with symbol libraries | **Name only** — host blocked |
| **Visio / Lucidchart** | Microsoft / Lucid | Desktop / cloud | UNKNOWN | Visio desktop yes; Lucidchart cloud-first | Both have APIs (UNKNOWN detail) | The incumbent fallback | **Name only** |
| **Excel / Google Sheets patch sheet** | — | Anything | Effectively free | Yes | — | The actual, universal baseline this segment competes with | **Not a product** — baseline |

Two further open projects surfaced in discovery and are recorded for completeness but were
**not cloned**, so nothing about them is verified beyond repository metadata:
`Kobii-git/rackpad` (358 stars; self-described racks/ports/cables/IPAM/topology) and
`opsmill/infrahub` (508 stars; graph-based infrastructure data platform with version control).

---

## Deep dives

### NetBox — the best cable data model in the segment, and it cannot say "SDI"

**What it does.** NetBox (Apache 2.0, v4.6.9 per `netbox/netbox/release.yaml`; last commit on
`main` 2026-08-28; 21,407 stars) is the network-industry source of truth for racks, devices,
ports, cables and addressing. It is a database with a web UI, not a drawing tool — though it
renders both **rack elevations** and **cable traces** as SVG (`netbox/dcim/svg/racks.py`,
`netbox/dcim/svg/cables.py`). (**FACT**, all read in the cloned tree.)

**Data model.** This is the part worth stealing.

- `Cable` (`netbox/dcim/models/cables.py:76`) carries `type`, `status`, `profile`, `tenant`,
  `label`, `color`, `length` + `length_unit`, a denormalised `_abs_length` in metres "for
  database ordering", and a `bundle` FK. (**FACT**)
- `CableTermination` and `CablePath` separate *the cable* from *the path it participates in*.
  `CablePath` (line 709) stores an ordered `path` JSON list of `(type, ID)` node lists, plus
  `is_active`, `is_complete` and `is_split` flags and a flattened `_nodes` GIN-indexed field
  for filtering. Its docstring gives the canonical example verbatim: (**FACT**)

  ```
                   A                              B                              C
      Interface 1 --- Front Port 1 | Rear Port 1 --- Rear Port 2 | Front Port 3 --- Interface 2
                      Front Port 2                                 Front Port 4
  ```

  That is **patch-panel-transparent path tracing**: three physical cables, one logical path,
  and the panels in the middle are traversed rather than treated as endpoints. `is_split` is
  the honest admission that a path can diverge and stop being a single answer.
- `FrontPort` / `RearPort` (`device_components.py:1241`, `:1289`) model a patch panel properly:
  each has a `positions` count, a front port maps to a `rear_port` **plus a position**, both
  must belong to the same device, and validation refuses a `positions` value lower than the
  number of mapped ports. This is how one 24-port rear LC cassette fronts 48 duplex positions.
  (**FACT**)
- **Cable profiles** — new in 4.6 — enumerate multi-core geometry directly
  (`CableProfileChoices`, `choices.py:1793`): singles `1C1P`…`1C16P`; trunks `2C1P`…`8C4P`
  including `2C4P_SHUFFLE` and `4C4P_SHUFFLE`; breakouts `1C2P:2C1P`, `1C4P:4C1P`,
  `1C6P:6C1P`, `1C8P:8C1P` and `2C4P:8C1P_SHUFFLE`. (**FACT**) That vocabulary describes a
  Socapex tail, an eight-way BNC breakout and a fibre shuffle equally well — it is *already*
  the AV multicore problem, solved generically.
- **Cable bundles** — also new in 4.6 (release notes, issue #20151): "A new CableBundle model
  allows individual cables to be grouped together to represent physical cable runs that are
  managed as a unit; e.g. a bundle of 48 CAT6 cables between two patch panels." The notes add
  an explicit caveat: the feature is "*not* suitable for modeling individual fiber strands
  within a single cable." (**FACT**, quoted from `docs/release-notes/version-4.6.md:340`)

**Integrations.** REST and GraphQL are both first-class. `pynetbox` 7.8.0 on PyPI is the
official client and states support for NetBox 4.6 (**FACT**, read on pypi.org).

**Notable strengths.** Path tracing through panels; breakout/trunk vocabulary; SVG elevations
and traces generated from data rather than drawn; a genuine API; enormous community.

**Notable limits — and this is the crux of the whole dossier.** NetBox's `CableTypeChoices`
(`choices.py:1869`) enumerates CAT3–CAT8, MRJ21 trunk, DAC active/passive, coaxial including
RG-6/8/11/59/62/213 and LMR-100/200/400, multimode OM1–OM5, singlemode OS1/OS2, AOC, power and
USB. **There is no SDI, no HDMI, no XLR, no audio cable type of any kind.** (**FACT** — the
full choice list was read.) A grep of `dcim/choices.py` for `SDI|XLR|HDMI` returns only
`TYPE_BNC` inside `PortTypeChoices` — BNC exists as a *connector on a patch panel*, with no
notion of what travels through it.

The practical consequence is visible in the community library, below.

### The NetBox devicetype-library — where the AV gap is measurable

This is a data set, not an application, but it is the segment's de-facto equipment library and
Rackula consumes it for device images. Numbers, all counted in the cloned tree (**FACT**):

- **6,021** device-type YAML files across **314** manufacturer directories.
- Only **12 files in the entire library mention "sdi"** (case-insensitive grep).
- The `Blackmagicdesign` directory contains **7** files, all ATEM Constellation variants.
- The `YAMAHA` directory contains **27** files — all `SWX` **network switches**, not audio.
- Absent entirely (no directory): Ross, Grass Valley, Evertz, Lawo, Riedel, Sony, Panasonic,
  Extron, Crestron, Biamp, QSC, Shure, AJA, Barco, Christie, tvONE, Analog Way.

And here is how the one real broadcast device is forced to fit
(`device-types/Blackmagicdesign/atem-constellation-1-m-e-4k.yaml`, **FACT**, verbatim extract):

```yaml
rear-ports:
  - name: REF-IN
    type: bnc
  - name: SDI-INPUT-1
    type: bnc
  ...
  - name: SDI-OUTPUT-1
    type: bnc
  ...
  - name: ANALOG-AUDIO-IN-1
    type: other
```

Read that carefully. `SDI-INPUT-1` and `SDI-OUTPUT-1` are **the same type** — `rear-port` of
type `bnc`. The only thing distinguishing an input from an output is **the English word inside
the name string**. Analog audio degrades to `type: other`. A machine cannot validate that you
have not patched an output to an output; it cannot compute signal direction; it cannot tell
audio from video. This single file is the most economical proof available that the segment's
best data model does not fit AV.

### Rackula — the newcomer building the missing layer

**What it does.** A drag-and-drop rack layout designer (MIT, `LICENSE` © 2026 Gareth Evans;
version `26.8.0` CalVer; first commit 2025-12-25; 1,674 stars). SvelteKit/TypeScript,
self-hostable via Docker, Proxmox LXC or bare metal. README-stated features (**FACT**): device
images sourced from the NetBox devicetype-library "not grey boxes"; export to PNG, PDF or SVG;
share via URL or QR code; mobile-friendly for field use; **"Bayed rack grouping for AV installs
and multi-cabinet deployments"**; optional API-backed layout sync; optional local or OIDC auth.
Its stated audiences include "**AV Technicians** — Bayed rack support for audio installs, map
out amp racks, patch bays, and processor chains."

**Physical model.** The README is unusually rigorous about rack geometry (**FACT**): racks are
modelled in whole U per **EIA-310**; "If something sits at U5, it is really at U5, not floating
part of a unit above it." Sub-U gear does not bolt to rails on its own — it "rides inside a 1U
carrier (a bracket, tray, or shelf)… The carrier registers to the rails, and the small devices
register to the carrier." `RackWidth` is typed `10 | 19 | 21 | 23`.

**Data model — the important part.** In `src/lib/types/index.ts` (**FACT**, verbatim):

```ts
/**
 * Port signal direction (spike #1927; used for AV signal routing)
 */
export type PortDirection = "input" | "output" | "bidirectional";

/**
 * Signal type carried by a port, independent of the physical connector.
 * The connector (InterfaceType) describes the plug; the signal type describes
 * what flows through it (e.g. an XLR can carry mic, line, or AES3).
 */
export type SignalType =
  | "analog-audio-mic"    | "analog-audio-line"  | "analog-audio-speaker"
  | "digital-audio-aes3"  | "digital-audio-dante" | "digital-audio-avb"
  | "digital-video-hdmi"  | "digital-video-sdi"
  | "clock-word"          | "control-midi";
```

That comment is the correct modelling insight for this entire segment, stated in one sentence:
**the connector and the signal are orthogonal**. NetBox conflates them; GDTF partially separates
them; Rackula separates them cleanly. `InterfaceTemplate` then carries optional `direction` and
`signal_type` alongside the NetBox-compatible `type`, explicitly as "Rackula extensions".

**Connections and validation.** `src/lib/stores/connection.svelte.ts` implements port-to-port
connections referencing `PlacedPort.id`, undoable through a recorded-command pattern. Its
header comment records a migration worth learning from (**FACT**, verbatim):

> "This supersedes the deprecated Cable model, which used fragile device-id + interface-name
> references; Cable was retired in #3091, and a prior-release layout's `cables` migrates to
> Connection on read"

`validateConnection()` returns separate `errors` and `warnings` — errors block, warnings do
not. Errors: connecting a port to itself; a port that already has a connection; a duplicate
connection between the same two ports in either direction. Category/type mismatch is a
**warning only**, with the stated rationale that "a mismatched connection is still allowed,
e.g. bridging a network port to a console port for out-of-band access." (**FACT**) That
errors/warnings split is a mature DRC design: refuse the impossible, flag the improbable.

**Notable limits.** It is a **rack layout** tool that has begun growing signal awareness, not a
signal-flow tool. I found **no BOM generation, no patch-sheet export, no label printing and no
cable-schedule report** anywhere in `src/` (searched for `bom`, `bill of material`,
`label print`, `patch sheet`; the only hits were an archive-guardrails test and share/archive
utilities). Port-ID stability across save/load is explicitly noted as unfinished — the
connection store's own comment says "Serialization with stable port IDs across save/load is out
of scope here — see #3090." (**FACT**) It is young: nine months old, 160 open issues.

### WireViz — the right idea, pin-level and BOM-complete, but dormant

**What it does.** A Python CLI that turns one YAML file into a wiring-harness drawing (via
Graphviz) plus a bill of materials. 5,232 stars — by far the most-starred thing in this
segment's open tier.

**Data model** (`docs/syntax.md`, **FACT**). Five top-level sections: `connectors`, `cables`,
`connections`, `additional_bom_items`, `metadata`, `options`, `tweak`.

- **Connectors** carry `type`, `subtype`, `color`, `image`, `notes`; procurement fields `pn`,
  `manufacturer`, `mpn`, `supplier`, `spn` and `additional_components`; and pinout via
  `pincount` / `pins` / `pinlabels` / `pincolors`, plus `loops` (pairs of pins shorted
  together) and `hide_disconnected_pins`.
- **Cables** carry `category: bundle`, `gauge` (accepts `mm2` or `AWG`, with `show_equiv` to
  auto-convert and display the other), `length` with a unit, `shield` (addressable as wire ID
  `s`), `wirecount`, `colors`, `color_code` and `wirelabels`.
- **Connections** are *connection sets* — alternating lists of connectors and cables, allowing
  many parallel connections to be declared at once with pin ranges (`1-4`), pin labels, wire
  colours, and auto-generated connectors. Arrows (`--`, `<--`, `-->`, `<-->`) express pin-to-pin
  mating; double arrows (`==`, `<==>`) express whole-connector mating.

**BOM.** `src/wireviz/wv_bom.py` defines the columns exactly (**FACT**):
`BOM_COLUMNS_ALWAYS = ("id", "description", "qty", "unit", "designators")` and
`BOM_COLUMNS_OPTIONAL = ("pn", "manufacturer", "mpn", "supplier", "spn")`. Entries are grouped
by a key derived from description, unit and the procurement fields — so two otherwise identical
cables with different part numbers stay separate line items. One sharp, honest limit is
documented in the syntax reference: "Units are not converted during BOM generation; different
units result in separate BOM entries." (**FACT**) Mix metres and feet and your BOM silently
splits.

**Outputs.** `wv_cli.py` maps `h→html`, `p→png`, `s→svg`, `t→tsv`. Notably, **CSV and PDF are
present but commented out** in the source (`# "c": "csv"`, `# "P": "pdf"`). (**FACT**)

**Notable limits.** No racks, no rack units, no physical placement, no patch panels, no
direction, no signal type. It documents a harness, not a facility. And it appears **dormant**:
latest changelog entry is **0.4.1, dated 2024-07-13**; the last commit on `master` is
**2025-01-16**; there are **195 open issues** and no git tags in the default clone. (**FACT**)
Depending on WireViz today would be a bet on a project that has not shipped in over two years.

### RackTables — the only tool that knows what cable you actually have

811 stars, GPL, PHP + MySQL, last commit 2026-06-26. Its schema (read from the `CREATE TABLE`
statements in `wwwroot/inc/install.php`) contains something no other product here has
(**FACT**):

```sql
CREATE TABLE `PatchCableHeap` (
  `id` ..., `pctype_id` ..., `end1_conn_id` ..., `end2_conn_id` ...,
  `amount` smallint(5) unsigned NOT NULL DEFAULT '0',
  `length` decimal(5,2) unsigned NOT NULL DEFAULT '1.00',
  `description` char(255) DEFAULT NULL, ...
```

A **heap of patch cables**: cable type, the connector on each end, how many you have, and how
long they are — with foreign keys into `PatchCableConnectorCompat` so that a stocked cable's
end connectors must be valid for its type. Alongside it, `PatchCableOIFCompat` maps a cable
type to a `PortOuterInterface`, i.e. **which cable types can legally plug into which port
type**. Together these give two capabilities absent everywhere else: *inventory-aware planning*
("you planned 30 patch leads, you own 12") and *connector-level design-rule checking* derived
from a compatibility table rather than hard-coded.

**Notable limits.** PHP/MySQL of an older generation; no verified API; documentation and UI
conventions that assume a data-centre vocabulary. **UNKNOWN:** whether the compatibility tables
ship populated with anything beyond IT connectors — I read the schema, not the seed data.

### openDCIM — a cautionary tale, dated

Included because the brief named this tier and because its status is a hard, dated fact. The
repository README's **first line** is now (**FACT**, verbatim):

> "# Maintainer needed
>
> After working on openDCIM for nearly 20 years, I feel that I've contributed more than enough
> and am looking towards retirement and more relaxing hobbies. If any contributors would like
> to take over the project, reach out to me… I will be packaging up a final release - 26.01 -
> in the coming weeks and also retiring the opendcim.org domain name upon expiration of that
> registration."

364 stars, GPLv3, originally developed at Vanderbilt University by Scott Milliken. Commits
continue (last: 2026-08-14) but the project is explicitly winding down and its domain will
lapse. **INFERENCE:** the open DCIM tier is consolidating onto NetBox; a 20-year-old GPL
incumbent shutting down while NetBox ships quarterly feature releases is what consolidation
looks like.

### The commercial AV/CAD tier — what I could not verify, and what to check

Stated explicitly so this dossier is not mistaken for coverage. For **Vectorworks Spotlight +
ConnectCAD, D-Tools System Integrator / D-Tools Cloud, XTEN-AV, WireCAD and Stardraw Design 7**
I have **no verified information whatsoever**: no price, no feature list, no file format, no
API, no data model, no offline behaviour. All vendor hosts were blocked.

To close this gap in a session with working web access, fetch in this order:

1. Pricing pages (`d-tools.com`, `xtenav.com`, `wirecad.com`, `stardraw.com`,
   `vectorworks.net`) — record price **and** whether it is advertised or quote-only.
2. Vectorworks ConnectCAD documentation on `university.vectorworks.net` — specifically its
   **record/field schema** for devices, ports and circuits, since that determines whether a
   `.vwx` can round-trip port-level data at all.
3. Any published import/export format: does ConnectCAD or WireCAD read or write CSV, XML, DXF?
   This is the single most decision-relevant unknown for interoperability.
4. Practitioner discussion on r/VIDEOENGINEERING, ControlBooth and Blue Room for the
   Excel-fallback question, which no vendor page will answer.

---

## Standards & protocols

### GDTF and MVR — DIN SPEC 15800 / 15801 (the most relevant standard in this segment)

Read in full from `mvrdevelopment/spec` (**FACT** throughout). **GDTF** (General Device Type
Format) is standardised as **DIN SPEC 15800:2022-02**; **MVR** (My Virtual Rig) as **DIN SPEC
15801:2023-12**. These are *German* DIN specifications, which matters for a German-market
product.

This is the one open standard in the entertainment industry that models **ports and cabling at
pin level**, and almost nobody outside lighting seems to know it.

**GDTF `WiringObject` geometry** (`gdtf-spec.md`, Table 50) describes an electrically
connectable interface on a device, with these attributes:

| Attribute | Meaning |
| --- | --- |
| `Name` | "also the name of the interface to the outside" |
| `ConnectorType` | from Annex D, or custom (e.g. "Loose End") |
| `ComponentType` | `Input`, `Output`, `PowerSource`, `Consumer`, `Fuse`, `NetworkProvider`, `NetworkInput`, `NetworkOutput`, `NetworkInOut` |
| `SignalType` | predefined `Power`, `DMX512`, `Protocol`, `AES`, `AnalogVideo`, `AnalogAudio`; custom strings allowed |
| `PinCount` | pins available on the connector |
| `ElectricalPayLoad` / `VoltageRangeMin/Max` / `FrequencyRangeMin/Max` / `CosPhi` | consumer power data, in watts / volts / hertz |
| `MaxPayLoad` (VA) / `Voltage` | power-source capacity |
| `FuseCurrent` (A) / `FuseRating` (`B`,`C`,`D`,`K`,`Z`) | protection device |
| `SignalLayer` | "all wiring geometry that use the same Signal Layers are connected"; `0` = connected to all |
| `Orientation` | `Left`, `Right`, `Top`, `Bottom` — where the pins sit |
| `WireGroup` | grouping name |

Plus a child `<PinPatch>` node (Table 51) with `ToWiringObject`, `FromPin`, `ToPin` — i.e.
**internal pin-to-pin routing inside a device**. So GDTF can express "pin 2 of the input XLR
goes to pin 3 of the output XLR" *inside* the device, which is exactly what a patch panel, a
breakout or a phase-reversed cable needs.

**MVR `<Connection>`** (Table 61) then joins devices at that level: attributes `own` and
`other` are node links to `WiringObject` geometries, `toObject` is the UUID of the other scene
object. The spec states: "This nodes defines an connection of two scene object. The connection
can be an electrical or data connection." A real example from the spec:

```xml
<Connections>
  <Connection own="Input" toObject="8BF13DD7-CBF4-415B-99E4-625FE4D2DAF6" other="Output1"/>
  <Connection own="1"     toObject="8BF13DD7-CBF4-415B-99E4-625FE4D2DAF6" other="IN"/>
</Connections>
```

**Annex D — predefined connector types** is a ready-made, standardised connector vocabulary
covering AV and European power, including: `BNC`, `XLR3`, `XLR4`, `XLR5`, `RJ45`, `RJ11`,
`HDMI`, `DisplayPort`, `DVI`, `SVIDEO`, `RCA`, `SCART`, `STJ`/`MSTJ` (stereo and mini jack),
`TL-ST` (TosLink), `NL4` (Speakon), fibre `LCDUP`/`SCDUP`/`SC`/`ST`, `EDAC20`–`EDAC120`,
`DB9`–`DB50`, `HD15`, `Socapex-7/9/16`, `HAN-4`, `HAN-16`, and the European power set:
`CEE 7/7` ("Schutzkontakt"), `IEC 60320-C7/C8` ("Eurostecker"), `IEC 60320-C13/14`,
`16A-CEE`, `32A-CEE`, `63A-CEE`, `125A-CEE` plus 2-pole and 110 V variants, `Powerlock`
(120/400/660/800 A), `Camlock`, `NAC3FCA`/`NAC3FCB`/`PowerconTRUE1`/`powerCONTRUE1TOP`,
`Stagepin`, `L6-20`, `L15-30`, `Wieland`, `Edison`, `DIN 56905` ("Eberl").

**The gap, verified.** A grep of `gdtf-spec.md` for `SDI|MADI|Dante|AES67|NDI` returns
**zero matches**. (**FACT**) GDTF's `SignalType` can say `AnalogVideo` and `AES`; it cannot say
3G/12G-SDI, MADI, Dante, AES67 or NDI without a custom string. The connector list has `BNC` but
no SMPTE hybrid fibre camera connector. **The entertainment industry's DIN-standardised device
format cannot natively describe a broadcast video signal.**

**MVR-xchange** is the live-sync side of the standard: a discovery-and-transfer protocol with a
**TCP mode** and a **WebSocket mode**, mDNS service discovery, and messages including
`MVR_JOIN`. (**FACT**, `mvr-spec.md`)

### Blackmagic Videohub control protocol

Verified from source and captured protocol dumps in `gfto/videohubctrl` (MIT). (**FACT**)

- Transport: **plain TCP, default port 9990**, line-oriented text, blocks separated by blank
  lines, `ACK` / `NAK` responses.
- Block headers, from `cmd.c`: `PROTOCOL PREAMBLE`, `VIDEOHUB DEVICE`, `INPUT LABELS`,
  `OUTPUT LABELS`, `VIDEO OUTPUT ROUTING`, `MONITORING OUTPUT LABELS`, plus serial-port,
  processing-unit, frame and alarm blocks.
- A real capture (`test/input-00.txt`):

  ```
  PROTOCOL PREAMBLE:
  Version: 2.4

  VIDEOHUB DEVICE:
  Device present: true
  Model name: Blackmagic Micro Videohub
  Friendly name: My Videohub
  Unique ID: 7c2e0d021714
  Video inputs: 16
  Video processing units: 4
  Video outputs: 16
  Video monitoring outputs: 4
  Serial ports: 8

  INPUT LABELS:
  0 Windows 1
  ...
  VIDEO OUTPUT ROUTING:
  0 2
  1 1
  ```

  Ports are **zero-indexed**; labels are `index name`; routing lines are `destination source`.

**Why this belongs in a planning dossier.** The router holds **the operator's own names for
every port** and the current crosspoint state. That makes a Videohub a live, authoritative
source of patch documentation — and a target to *write* planned labels back into. The tool's
`--backup` flag, which "Show[s] the command line that will restore the device to the current
configuration," is effectively a round-trip documentation feature. (**FACT**)

### Ember+

`Lawo/ember-plus` (C++, 140 stars) is Lawo's openly published control protocol, described in
its own repository as "Ember+ control protocol - Slick and free for all!". Third-party
provider/consumer libraries exist in .NET (`Lawo/ember-plus-sharp`, Sveriges Radio's NuGet
provider/consumer libraries) and JavaScript (`DeutscheSoft/ember-plus`). (**FACT**, repository
metadata and descriptions.) **UNKNOWN:** I did not read the specification, so I make no claim
about its data model or its suitability as a documentation source. The brief's premise — that
VSM/Lawo systems are worth reading *as* documentation of what is patched — is plausible
(**INFERENCE**) but unverified here.

### Other formats

- **WireViz YAML → Graphviz DOT → SVG/PNG/HTML/TSV.** Text-defined, diffable, version-
  controllable. (**FACT**)
- **NetBox devicetype-library YAML** — the de-facto equipment-definition format, consumed by
  NetBox and by Rackula. Keys seen: `manufacturer`, `model`, `slug`, `part_number`, `u_height`,
  `is_full_depth`, `airflow`, `weight`/`weight_unit`, `console-ports`, `power-ports`,
  `interfaces`, `rear-ports`. (**FACT**)
- **GraphML** — a generic XML graph interchange format. Relevant because cable-planner already
  has a `graphml:*` IPC domain and a GraphML import path. (**FACT**, read in the local repo.)
- **DXF / DWG / `.vwx` / Visio `.vsdx`** — the drawing-exchange formats of tier 1 and tier 3.
  **UNKNOWN** in every respect here; no vendor documentation was reachable.
- **AVIXA standards** (drawing symbols, cable labelling) — `avixa.org` was blocked.
  **UNVERIFIED**; I decline to characterise standards I could not open.

---

## What this segment does WELL

Patterns worth stealing, each anchored to something verified above.

1. **Separate the cable from the path.** NetBox's `Cable` / `CableTermination` / `CablePath`
   split is the single best idea in the segment. Three cables and two patch panels compose into
   one traceable path, and the panels are traversed, not treated as endpoints. Any tool that
   stores "device A port 1 → device B port 2" as a flat edge cannot answer "what is actually
   reaching this input?" once a patch bay is in the middle.
2. **Model panels with positions, not just ports.** `FrontPort.rear_port` + `positions`, with
   validation that positions cannot be fewer than mappings, is how you represent a real
   cassette or a 48-way normalled bay.
3. **Give multicore an explicit vocabulary.** NetBox's cable *profiles* — `1C8P`, `2C4P shuffle`,
   `1C8P:8C1P breakout` — turn "it's a snake" into a checkable structure.
4. **Separate the connector from the signal.** Rackula's comment says it best: "an XLR can
   carry mic, line, or AES3." Connector type and signal type are orthogonal axes and conflating
   them is what makes NetBox unable to describe AV.
5. **Split validation into errors and warnings.** Rackula refuses self-connections, double-
   booked ports and duplicates, but only *warns* on a category mismatch because the operator
   sometimes means it. DRC that blocks legitimate work gets switched off.
6. **Derive the BOM from the design, never maintain it separately.** WireViz generates the BOM
   from the same YAML that draws the harness, grouping by part number so procurement-distinct
   items stay distinct.
7. **Make the source text diffable.** WireViz's YAML puts a harness under version control.
   A binary CAD file cannot be reviewed in a pull request.
8. **Render from data, don't draw by hand.** NetBox emits rack elevations *and* cable traces as
   SVG from the database. The drawing can never drift from the truth because it is a projection
   of it.
9. **Track the stock, not just the design.** RackTables' `PatchCableHeap` plus the
   type↔connector↔port compatibility tables let the plan be checked against what is physically
   owned, and let connector legality be data rather than code.
10. **Be honest about geometry.** Rackula's insistence on whole-U EIA-310 placement and 1U
    carriers for sub-U gear avoids a class of quietly wrong drawings.
11. **Read the live system.** A Videohub answers on TCP 9990 with every port label and every
    crosspoint. Documentation that can be diffed against reality beats documentation that
    cannot.

---

## What NOBODY in this segment solves well

The white space, in descending order of how confident I am.

1. **No tool has both a real cable data model and AV signal semantics.** This is the headline
   and it is *verified*, not asserted. NetBox has the best path model in existence and its
   cable-type enum contains no SDI, HDMI, XLR or audio type at all. GDTF has pin-level wiring
   objects and a `SignalType` that cannot say SDI, MADI, Dante, AES67 or NDI (zero grep hits).
   The community device library resorts to encoding signal direction in an English name string
   (`SDI-INPUT-1` vs `SDI-OUTPUT-1`, both `type: bnc`). **Rackula alone is building the missing
   layer, is nine months old, and does not yet have BOM, patch sheets or labels.**
2. **Port direction is unmodelled almost everywhere.** NetBox interfaces are directionless by
   design — reasonable for Ethernet, wrong for SDI, where an output-to-output patch is simply
   an error. Without direction there is no meaningful DRC for video and no automatic left/right
   layout of a signal-flow canvas.
3. **The BOM/drawing/patch-sheet triangle is never closed by one tool.** WireViz generates a
   BOM but has no racks, no panels and no placement. NetBox has racks, panels and paths but I
   found no BOM generation. Rackula has racks and connections but no BOM, no patch sheet and no
   labels. The commercial tier claims to close it — **UNVERIFIED**, and closing it is precisely
   what those licences are sold on.
4. **Label printing is nobody's job.** Cable labelling is the most repetitive, most error-prone
   task in the entire workflow, and not one product examined here prints a label. The open-source
   answer is a *generic* printer driver — `pklaus/brother_ql` (708 stars, Brother QL raster
   protocol) and its web wrapper (318 stars) — with no connection to any design tool. The
   integration between "the design knows this cable is CAM-3 SDI OUT → MV IN 4" and "the printer
   makes that label" does not exist in open form. (**FACT** that the printer libraries exist and
   are standalone; **INFERENCE** that no design tool drives them.)
5. **Inventory-awareness is nearly extinct.** RackTables' patch-cable heap is the only stock
   model found in the whole segment, in the oldest and least fashionable product. Everywhere
   else, planning proceeds as though cable is infinite.
6. **Length is decorative.** NetBox stores `length` + `length_unit` and normalises to metres
   for sorting; WireViz stores a length but explicitly refuses to convert units in the BOM, so
   metres and feet split into separate line items. Nothing found computes a required length from
   geometry, adds service loops, or reconciles planned against stocked lengths.
7. **Unit and mixed-unit handling is a real, documented bug class.** See the WireViz caveat
   above — it is written in the vendor's own syntax reference.
8. **Offline-first is a self-hosting story, not a laptop story.** NetBox, Nautobot, RackTables
   and openDCIM are all "offline" only in the sense that you can run a PostgreSQL/MySQL server
   yourself. None of them is a thing an engineer opens on a laptop in a truck with no network.
   The genuinely offline tools in this segment are a CLI (WireViz) and a general-purpose diagram
   editor (drawio-desktop). **This is the largest unclaimed position in the segment.**
9. **The AV equipment library does not exist.** 6,021 device definitions, 12 mentioning SDI,
   zero directories for Ross, Grass Valley, Evertz, Lawo, Riedel, Sony, Panasonic, Extron,
   Crestron, Biamp, QSC, Shure, AJA or Barco. Whoever builds a good broadcast/AV device library
   with correct port lists, directions and signal types owns a moat, because that library is
   slow, boring work that no single vendor is incentivised to do.
10. **Generic diagram tools bring IT stencils only.** draw.io ships rack stencils for APC, HP,
    F5, IBM, Dell, Oracle and HPE Aruba (`src/main/webapp/stencils/rack/`) — **not one AV
    vendor**. (**FACT**) So the fallback tool actively pushes AV users toward drawing grey boxes.
11. **No interchange between tiers.** GDTF/MVR is a DIN standard with a real connection model,
    and the IT tier has never heard of it; the AV/CAD tier publishes no formats at all
    (0 GitHub hits for ConnectCAD, 1 irrelevant hit for WireCAD). There is no path by which a
    rack designed in one tool becomes a patch sheet in another.
12. **Two-way sync with the live system is absent.** A Videohub will tell you its labels and
    crosspoints over TCP 9990, and nothing in this segment reads them to diff plan against
    reality, or writes a planned label set back.

---

## Relevance to AV Planner Suite

**Primary: `cable-planner`.** This is that repo's home segment, and the research maps onto code
that already exists there.

- **The existing NetBox import is the right bet, and this dossier explains why.**
  `cable-planner` already ships `src/main/ipc/netboxIpc.ts`, `services/netboxApiClient.ts`,
  `lib/netboxMapping.ts` and a `NetboxImportDialog`. The findings above validate the direction:
  NetBox genuinely has the best cable/path model available.
- **The hardest modelling problem in the segment is already solved in this repo — keep it.**
  `netboxMapping.ts` documents the exact gap this dossier verifies independently, and its fix:
  NetBox models interfaces as directionless, so directionless components are imported as a
  mirrored in/out pair sharing one `netboxId`, while genuinely directional things (power,
  console, front/rear port) get a single port. `frontport → in`, `rearport → out`. That is the
  correct compensation for finding #2 above, and it is a real differentiator.
- **The additive-import philosophy is worth defending in writing.** The same file states it:
  NetBox is the truth about *cabling*, cable-planner is the truth about *presentation*
  (positions, colours, waypoints, labels, multicore bundles), so re-import must never overwrite
  layout work. That is exactly the right split — and it is the reason a rendering-from-data tool
  like NetBox cannot replace cable-planner.
- **Steal NetBox's cable profiles.** The `1C8P`, `2C4P shuffle`, `1C8P:8C1P breakout`
  vocabulary is a ready-made, battle-tested schema for multicore/breakout that maps directly
  onto Socapex tails, BNC fan-outs and fibre shuffles. New optional fields belong in
  `healProjectPositions` per the repo's migration convention.
- **Adopt Rackula's connector/signal separation before the data model hardens.** Its
  `SignalType` list (`digital-video-sdi`, `digital-audio-aes3`, `digital-audio-dante`,
  `digital-audio-avb`, `clock-word`, …) orthogonal to connector type is the correct axis split,
  and it is MIT so the *design* can be studied freely. Equally: heed its migration lesson —
  connections must reference **stable port IDs**, never `device-id + interface-name`, which they
  retired as "fragile" in their issue #3091.
- **Consider GDTF/MVR as the interoperability play.** MVR is **DIN SPEC 15801** — a German
  standard — with a `<Connection>` node linking `WiringObject` geometries between scene objects,
  and GDTF Annex D already enumerates BNC, XLR3/4/5, HDMI, Speakon, Socapex, CEE 16/32/63/125 A,
  Schuko and powerCON. For a German-market product, exporting MVR is a credible bridge to
  Vectorworks and every lighting console. Two caveats: GDTF cannot say "SDI" natively (custom
  `SignalType` string required), and I have **not** verified which applications import MVR
  `<Connection>` nodes in practice — check that before committing.
- **Two clear white-space features to own:** (a) **label printing** driven by the design — the
  segment has zero, and `pklaus/brother_ql` is a proven, standalone driver to build on;
  (b) **true offline-first on a laptop** — every DCIM competitor needs a server, and an Electron
  app that works in a truck with no network is a category-level differentiator, not a detail.
- **The `videohub:*` IPC domain can become a plan-vs-reality diff.** The protocol is verified
  above (TCP 9990, `INPUT LABELS`, `OUTPUT LABELS`, `VIDEO OUTPUT ROUTING`). Reading labels and
  crosspoints from the live router and diffing them against the plan is a feature nothing in
  this segment offers.
- **The equipment library is the moat.** Rackula gets device images free from the NetBox
  devicetype-library; that library has 7 Blackmagic entries and no Ross, GV, Evertz, Lawo,
  Riedel, Sony or Panasonic. A curated broadcast/AV library with correct port lists, directions
  and signal types is slow work with a long payoff.

**Secondary:**

- **`multicam-planner`** — camera-to-CCU-to-router chains are exactly the "path through
  intermediate panels" problem `CablePath` solves; the same port/direction model should be
  shared rather than reinvented.
- **`light-planner`** — the direct beneficiary of GDTF/MVR. GDTF's `WiringObject` already carries
  `ElectricalPayLoad`, `Voltage`, `CosPhi`, `FuseCurrent` and `FuseRating` (B/C/D/K/Z), which is
  a complete power-calculation model, and Annex D's CEE/Schuko/powerCON/Socapex entries are the
  European power vocabulary. This is the strongest standards fit anywhere in the suite.
- **`shell` / suite** — the connector-and-signal type vocabulary, the equipment library and the
  label-printing service are cross-cutting and belong at suite level, not inside one planner.
- **`broadcast-intercom`** — intercom panels, matrix ports and four-wire tie-lines are the same
  port-level graph; Ember+ is the likely control-plane touchpoint (**unverified**).

**Not relevant:** `tally-pi`, `sony-camera-bridge`, `pi-media-station` — runtime devices, not
planning tools. They matter only as *equipment entries* in the library.

---

## Sources

Every URL opened or repository cloned in this pass. Repositories were cloned with
`git clone --depth 1` on 2026-08-28 and read locally; line references point into those trees.

**Cloned and read (primary source code / schemas / specifications):**

- https://github.com/netbox-community/netbox — NetBox v4.6.9; `netbox/dcim/models/cables.py`,
  `netbox/dcim/models/device_components.py`, `netbox/dcim/choices.py`, `netbox/dcim/svg/`,
  `docs/release-notes/version-4.6.md`
- https://github.com/netbox-community/devicetype-library — 6,021 device-type YAML files;
  `device-types/Blackmagicdesign/atem-constellation-1-m-e-4k.yaml`
- https://github.com/RackulaLives/Rackula — Rackula v26.8.0; `README.md`,
  `src/lib/types/index.ts`, `src/lib/stores/connection.svelte.ts`, `LICENSE`, `package.json`
- https://github.com/wireviz/WireViz — WireViz; `docs/syntax.md`, `docs/CHANGELOG.md`,
  `src/wireviz/wv_bom.py`, `src/wireviz/wv_cli.py`
- https://github.com/RackTables/racktables — RackTables; schema DDL in `wwwroot/inc/install.php`
- https://github.com/opendcim/openDCIM — openDCIM; `README.md` (retirement notice)
- https://github.com/mvrdevelopment/spec — GDTF (DIN SPEC 15800) and MVR (DIN SPEC 15801)
  specifications; `gdtf-spec.md` (Tables 50, 51, Annex D), `mvr-spec.md` (Table 61,
  MVR-xchange), `README.md`
- https://github.com/gfto/videohubctrl — Blackmagic Videohub protocol; `README`, `cmd.c`,
  `test/input-00.txt`

**Opened via WebFetch (successful):**

- https://github.com/netbox-community/netbox — NetBox overview and licence
- https://pypi.org/project/pynetbox/ — pynetbox 7.8.0, NetBox 4.6 support

**Consulted via GitHub API search (repository metadata and code search only, not cloned):**

- https://github.com/nautobot/nautobot
- https://github.com/jgraph/drawio — rack stencil inventory
  (`src/main/webapp/stencils/rack/{apc,hp,f5,ibm,dell,oracle,general}.xml`,
  `stencils/rack/hpe_aruba/`, `shapes/rack/mxRack.js`, `plugins/rackF5.js`)
- https://github.com/jgraph/drawio-desktop
- https://github.com/Lawo/ember-plus, https://github.com/Lawo/ember-plus-sharp
- https://github.com/pklaus/brother_ql, https://github.com/pklaus/brother_ql_web
- https://github.com/Kobii-git/rackpad, https://github.com/opsmill/infrahub
- https://github.com/Vectorworks/developer-scripting,
  https://github.com/Vectorworks/developer-worksheets,
  https://github.com/Vectorworks/developer-sdk — searched for ConnectCAD, 0 results
- https://github.com/netbox-community/Device-Type-Library-Import
- https://github.com/wireviz/wireviz-web

**Local repository read (for the relevance section):**

- `/home/user/cable-planner/src/renderer/lib/netboxMapping.ts`,
  `/home/user/cable-planner/src/main/ipc/`, `/home/user/cable-planner/CLAUDE.md`

**Attempted and BLOCKED by the egress proxy (no content retrieved):**

- https://www.wirecad.com/pricing
- https://www.d-tools.com/pricing/
- https://www.xtenav.com/pricing
- https://www.stardraw.com/products/design/
- https://www.avixa.org/standards
- https://university.vectorworks.net/
- https://netbox.readthedocs.io/en/stable/
- https://en.wikipedia.org/wiki/Patch_panel
- https://www.npmjs.com/package/reactflow (HTTP 403)
