# Technical Planning: Cable / Signal Flow / Patch / Rack

> Research date: **2026-08-28/29**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read on a cited page or in cited source code), **SNIPPET** (read in a search-engine
> summary of the cited page, page not directly opened), **INFERENCE** (reasoning),
> **UNKNOWN / unverified**.
>
> This pass **replaces** an earlier one that ran with zero web search and a GitHub-only egress
> allowlist. That version contained no verified price at all. This one does — but read the
> evidence-tier caveat first, because the constraint has changed shape rather than disappeared.

## Source-access caveat (read this before trusting any number below)

The environment for this pass had an **asymmetric** network:

- **WebSearch worked**, and was used for 26 distinct queries in English and German.
- **Direct page fetches were blocked for every commercial vendor domain tested.** Confirmed
  `EGRESS_BLOCKED` or `CONNECT tunnel failed, response 403`: `www.wirecad.com`, `www.d-tools.com`,
  `xtenav.com`, `www.vectorworks.net`, `forum.vectorworks.net`, `www.stardraw.com`,
  `docs.netbox.dev`, `netboxlabs.com`, `www.racktables.org`, `opendcim.org`,
  `www.blackmagicdesign.com`, `en.wikipedia.org`, `www.capterra.com`, `www.g2.com`,
  `www.reddit.com`, `www.avnetwork.com`, `blog.cadsoftwaredirect.com`, `www.trustradius.com`,
  `www.getapp.com`, `www.softwareadvice.com`.
- **`github.com` and `raw.githubusercontent.com` were reachable.** Ten pages were opened there
  directly.

This produces **three evidence tiers**, and the dossier marks every claim with which one it is on:

| Tier | What it means | How far to trust it |
| --- | --- | --- |
| **FACT** | I opened the page/file and read it. Ten sources, all GitHub. | Quote it. |
| **SNIPPET** | A search engine read the vendor's own page and summarised it back to me, and I am citing that vendor page. | Directionally reliable for *what exists*. **Treat every price as "approximately right, re-verify before quoting."** |
| **INFERENCE / UNKNOWN** | My reasoning, or an honest gap. | Do not quote as fact. |

**Consequence for prices, stated plainly.** Every price in this document is **SNIPPET tier
except the open-source ones**. They are good enough to establish the *price band* of the segment
— which is the strategically useful thing — and not good enough to put in a competitive
comparison slide. The **WireCAD** prices in particular came back **mutually inconsistent** across
three queries and are marked UNKNOWN rather than guessed. To harden the pricing section you would
need to open, in order of value: `wirecad.com/index.php?route=product/category&path=71_17`,
`d-tools.com/system-integrator-pricing`, `d-tools.com/cloud-pricing`, `xtenav.com/pricing/`,
`vectorworks.net/en-US/spotlight/buy`, `stardraw.com/sd7/purchase`.

**What is genuinely new in this pass** and was entirely absent from the previous one: an
**AV-native micro-SaaS and open-source tier** that did not meaningfully exist a few years ago —
EasySchematic, WireFlow, Patchify, H2R Gear, PatchMyGear, kumihimo — building exactly the
port-typed, validation-first signal-flow model that the CAD tier never built. This is the most
strategically important finding in the document and it is the section to read if you read only
one.

---

## Segment summary

This category answers four questions that a broadcast or AV engineer asks in a fixed order, and
almost every tool in it is good at only one or two of them:

| # | Question | Artefact produced |
| --- | --- | --- |
| 1 | **What connects to what?** | Signal-flow / block / schematic diagram |
| 2 | **Through which physical port, on which panel, in which rack?** | Patch schedule, rack elevation |
| 3 | **What do I have to buy, build, label and pack?** | BOM, cable schedule, label set, pack list |
| 4 | **Is it wrong?** | Validation / design-rule check |

### The six tiers

The segment splits into six tiers that barely interoperate (**INFERENCE**, but supported by the
data models and price bands below):

1. **AV/CAD design suites** — Vectorworks Spotlight + ConnectCAD, WireCAD, Stardraw Design 7.
   Drawing-first, DWG-native, sold to integrators who must hand over a signed drawing set.
   Price band roughly **USD 1.5k–3.5k / user / year**.
2. **Estimator-first business suites** — D-Tools System Integrator, D-Tools Cloud, XTEN-AV.
   The drawing is a by-product of the *proposal*; the BOM is the centre of the data model.
   Price band roughly **USD 1.2k–1.8k / user / year**, plus implementation fees at the SI end.
3. **CAD parsers / report generators** — tvCAD, Cable Scheduler (cableschedules.com). You keep
   drawing in AutoCAD; the tool reads the DWG and emits the cable schedule. A distinctly
   **broadcast** tier, with named broadcaster users.
4. **IT/DCIM sources of truth** — NetBox, Nautobot, RackTables, openDCIM, Sunbird, Device42.
   Database-first, drawing-second. They have, by a wide margin, the **best cable and patch
   data model in existence** — and essentially no AV signal semantics.
5. **AV-native micro-SaaS and open source (new)** — EasySchematic, WireFlow, Patchify,
   H2R Gear, PatchMyGear, Rackula, kumihimo. Browser-first, port-typed, cheap or free.
   Price band **EUR/USD 0–15 / month**, i.e. **two orders of magnitude** below tier 1.
6. **Generic diagramming** — Visio, Lucidchart, draw.io/diagrams.net, yEd. Pixels, not data.

Underneath all six sits **the spreadsheet**: the patch sheet, the cable schedule, the I/O list.

### Does anyone actually fall back to Excel and Visio? Yes — and it is documented

The brief asks this directly. Three independent pieces of evidence, none of them mine:

- **SNIPPET** — A US production organisation's public FAQ describes its own tool evaluation: it
  "tried VidCAD and Visio, but Visio lacked the desired features while VidCAD was very
  complicated," and settled on WireCAD for its "fairly easy learning curve" and "ease in building
  equipment blocks" ([willowproduction.org FAQ](https://www.willowproduction.org/faq/what-cad-software-do-you-use-for-creating-and-maintaining-system-schematic-diagrams/)).
  This is the segment's actual decision process in one paragraph: the specialist tool is either
  too hard or too expensive, and the generic tool is not expressive enough.
- **SNIPPET** — A user on Vectorworks' own community board reported having bought ConnectCAD ten
  months earlier, being unable to use it effectively, and **drawing in Draw.io instead**
  ([forum.vectorworks.net ConnectCAD board](https://forum.vectorworks.net/forum/138-connectcad/)).
  The fallback is not hypothetical and it happens *after* purchase.
- **SNIPPET** — D-Tools' own marketing runs a resource titled *"When Should Integrators Ditch
  Excel Spreadsheets?"* and cites an integrator that misbid a project by USD 100,000 through a
  spreadsheet formula error ([d-tools.com resource centre](https://www.d-tools.com/resource-center/8-signs-integrators-need-to-ditch-spreadsheet)).
  A vendor spending marketing budget arguing against Excel is strong evidence that Excel is the
  incumbent it is losing to.

The German-language market shows the same pattern with a different generic tool: the trade
magazine *Production Partner* publishes a tutorial on building signal-flow plans in **yEd**, and
states plainly that yEd's icon library is well stocked for computing and networking but that
**specialised event-technology elements are not included and there is no custom symbol editor**
([production-partner.de, Signallaufplan mit yEd](https://www.production-partner.de/basics/signallaufplan-mit-yed/), SNIPPET).
That is a working professional publication teaching people to use a free graph editor because the
domain tool is out of reach — and naming precisely the gap that keeps it painful.

**INFERENCE:** the fallback is not caused by ignorance of the specialist tools. It is caused by
a price/learning-curve cliff between tier 6 (free, no domain knowledge) and tiers 1–2 (USD
1,500–3,500 a year, weeks of training) with **nothing in between** — which is exactly the gap
tier 5 has appeared to fill in the last two or three years.

### Who buys what (INFERENCE, from product shape and licensing)

- **Systems integrators** buy tiers 1–2, because the deliverable is contractual: a drawing set,
  a BOM and a price that must agree with each other.
- **Broadcasters and facility engineers** buy tier 3 or adopt tier 4, because the deliverable is
  a queryable source of truth that survives staff turnover and a truck refit.
- **Freelancers, rental houses, small OB, houses of worship, theatres** live in tiers 5–6 plus
  spreadsheets, because tiers 1–3 cost either real money or a server and a sysadmin.

---

## Product table

Price column: `[S]` = SNIPPET tier (search summary of the cited vendor page, seen 2026-08-28/29,
re-verify before quoting); `[F]` = FACT (page opened); *as advertised* vs *requires sales contact*
noted per row.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Vectorworks Spotlight + ConnectCAD** | Vectorworks Inc. (Nemetschek, DE parent) | Win / macOS desktop | Subscription. Spotlight ~USD 1,530/yr; ConnectCAD add-on ~USD 183/mo (~1,830/12 mo), **bundle-only with Spotlight/Designer**. DE reseller: Spotlight+ConnectCAD from €195/mo net (€2,340/yr net) `[S]`, as advertised | Yes — desktop, local files | Vectorworks SDK + Python/VectorScript; no published ConnectCAD-specific API found | Schematic + rack elevation + 2D/3D floor plan in one document, with circuit reports |
| **WireCAD 10** (XLT / PRO / CMS) | Holbrook Enterprises dba WireCAD (US) | Windows desktop | Perpetual + mandatory first-year "Assurance", **or** subscription. Renewal indexed at 60% of list `[S]`. **Actual figures inconsistent across sources — UNKNOWN**, as advertised on store | Yes — desktop; PRO/CMS can use SQL Server | Database is VistaDB or SQL Server / SQL Azure — direct DB access is the de-facto API `[S]` | Cable numbering, auto cable schedules, DWG-native, patchbay layouts, equipment blocks |
| **D-Tools System Integrator (SI)** | D-Tools Inc. (US) | Windows desktop + SQL Server; cloud-hosted option | From ~USD 150/user/mo + professional-services implementation (~USD 200/h) `[S]`, requires sales contact | Partially — on-prem SQL deployment | Integrates AutoCAD + Visio; manufacturer product library `[S]` | Keeping BOM, proposal, drawing and procurement in one dataset |
| **D-Tools Cloud** | D-Tools Inc. | Browser | Tiered: Solo ~USD 99/mo, Team ~249, Company ~499, Enterprise ~999; ~10% off annual `[S]`, as advertised | No | Unverified | Fast quote-to-proposal with a lightweight drawing attached |
| **XTEN-AV (X-DRAW / x.doc)** | XTEN-AV (US/IN) | Browser + mobile apps | Basic USD 104.25/user/mo billed annually (USD 139 monthly); Business 111.75 (149); Enterprise 126.75; X-PRO add-ons +11.25 `[S]`, as advertised | No — cloud-first | "On-demand API integrations" on Enterprise tier only `[S]` | AI-assisted auto rack elevations and drawing-to-proposal speed |
| **Stardraw Design 7.4** | Stardraw.com Ltd (**UK**) | Windows desktop | Perpetual + mandatory first-year subscription, split ~50/50; configurable bundles; additional licence figure ~USD 275 seen `[S]` — **package prices ambiguous, UNKNOWN**, as advertised | Yes | Unverified | Symbol breadth — 130,000+ symbols from 1,600+ manufacturers `[S]`; **first vendor to license J-STD-710 symbols** |
| **tvCAD** | tvCAD / CAD bloke (**AU**) | Windows, on top of AutoCAD | UNKNOWN, requires sales contact | Yes — local AutoCAD | Parses DWG; reports to Excel `[S]` | Letting broadcast engineers keep drawing in AutoCAD while the schedule generates itself |
| **Cable Scheduler** | cableschedules.com (**AU**) | Windows desktop, not cloud | UNKNOWN, requires sales contact | Yes — explicitly "not cloud-based or outside your firewall" `[S]` | DWG parser | Scale: claims schedules for ~60,000 cables in minutes; named users incl. Foxtel, Fox Sports, ABC TV Australia, NEP `[S]` |
| **NetBox** | NetBox Labs / community | Self-hosted (Django/Postgres) or NetBox Cloud | Apache 2.0 open source; cloud tiers priced separately `[F]` licence | Yes — self-hosted | Full REST + GraphQL, first-class `[F]` | The best cable/patch/port data model in the segment. Cable profiles, front/rear port mapping, end-to-end path tracing |
| **RackTables** | community | Self-hosted PHP | GPL, free | Yes | Limited | Knowing which *physical* cable you own and where it is `[S]` |
| **openDCIM** | community | Self-hosted PHP | GPLv3, free | Yes | Limited | "Antiquated but with a quite sane data model" `[S]` |
| **Sunbird DCIM** | Sunbird Software (US) | Self-hosted or SaaS | Perpetual or SaaS, **quote only** `[S]`, requires sales contact | Yes | Yes | Port-level connectivity, every hop in data and power circuits, pre-install cable length measurement `[S]` |
| **EasySchematic** | duremovich (community) | Browser + PWA desktop | **Free, AGPL-3.0** `[F]`, as advertised | Yes — PWA offline; cloud features need hosted API `[F]` | Public device-template API, no auth `[F]` | The most complete AV-native free tool: 73 signal types, patch bays, rack builder, vector PDF, DXF |
| **WireFlow** | wireflow.live | Browser | Free tier (3 diagrams); Pro USD 5/mo founder rate, list USD 14.99/mo `[S]`, as advertised | No | Unverified | Connection-aware validation as you draw, plus LED-wall cabinet/power planning |
| **Patchify** | patchify.app | Browser + Windows app | 30-day full trial; paid plans, **price not published in any source reached — UNKNOWN** | Windows app "works offline" `[S]` | Unverified | Broadcast-flavoured device library (Blackmagic, Sony, Ross, Grass Valley), auto patch lists, cable labels |
| **H2R Gear** | h2rgear.com | Browser | Free tools `[S]` | No | Unverified | Patch list ⇄ diagram round-trip, CSV export, crew-readable output |
| **PatchMyGear** | patchmygear.com | Browser | Free, no sign-up `[S]` | Local save/load of plans `[S]` | Public device library, community submissions `[S]` | Studio/patchbay-centric planning and a re-cable checklist |
| **Rackula** | RackulaLives (community) | Browser; Docker/LXC self-host | **Free, MIT** `[F]` | Yes — self-hostable `[F]` | Optional persistent-storage API `[F]` | Rack elevations with real hardware images, pulled from NetBox devicetype-library |
| **kumihimo** | Love-Rox / SASAGAWA Kiyoshi (**JP**) | CLI / library / VS Code ext. | **Free, MIT** `[F]` | Yes | It *is* an API — TS library `[F]` | Text-defined, port-aware, validating signal flow. Diff-able in git |
| **WireViz** | community | CLI (Python) | **GPL-3.0, free** `[F]` | Yes | YAML in, files out `[F]` | Pin-level harness documentation with automatic BOM |
| **Middle Atlantic RackTools / Configurator** | Legrand AV | Windows / browser | **Free** `[S]` | Desktop yes | No | Vendor-accurate rack elevations, quotes and POs — for Middle Atlantic parts |
| **Microsoft Visio (Plan 2)** | Microsoft | Browser + Windows | ~USD 15/user/mo `[S]`, as advertised | Desktop yes | Yes (Graph / VBA) | Being installed everywhere already |
| **Lucidchart** | Lucid Software | Browser | Individual ~USD 9/user/mo annual; Team ~10 `[S]`, as advertised | No | Yes | Collaboration and shareable links |
| **draw.io / diagrams.net** | JGraph | Browser + desktop | Apache 2.0, free | Yes — desktop app | Embeddable; XML file format | Free, offline, has a rack shape library (APC, Cisco, Dell, HP…) `[S]` |
| **yEd** | yWorks (**DE**) | Desktop + browser | Free (gratis, not open source) | Yes | — | Auto-layout of messy graphs; the documented German AV fallback `[S]` |

---

## Deep dives

### 1. Vectorworks Spotlight + ConnectCAD — the incumbent in the European event market

**What it does.** ConnectCAD is an add-on module to Vectorworks Spotlight or Designer for AV,
broadcast and network system design. Vectorworks' own capability page describes schematic
diagrams, 2D **and 3D** rack layouts with custom panel building, integrated 2D/3D placement of
racks, consoles and devices within floor plans, and **riser diagrams annotated with conduit sizes
and pathways** for handoff to electrical contractors (SNIPPET, `vectorworks.net/en-GB/connectcad/capabilities`).

**Data model.** Not verifiable at this evidence tier — no schema documentation was reachable.
What *is* visible from the reports it generates is the shape of the model: **circuit reports,
device inventories and cable schedules** (SNIPPET, `app-help.vectorworks.net/2026/.../Creating_ConnectCAD_reports.htm`),
which implies first-class circuit and device objects rather than annotated geometry. The template
ships three sheet layers — Schematics, Rack Elevations, Rack 3D Layouts — with viewports bound to
the matching design layer (SNIPPET, `app-help.vectorworks.net/2025/.../Presenting_to_clients.htm`).

**Validation.** "Built-in verification tools to automatically identify errors such as missing
connections or incompatible equipment" (SNIPPET, vendor capability page). This is a real DRC, and
it is the feature the whole tier-1 price is arguably justified by.

**Strengths.** It is the only tool in the segment where the *same objects* appear in a schematic,
a rack elevation, a 3D model and a venue floor plan. For anyone who must also do rigging, staging
and lighting in the same file — the European event-technology reality — that consolidation is
decisive, and it is why Vectorworks is the German-market default answer to "Signalflussplan
software" (SNIPPET, vectorworks.de/vectorworks/spotlight).

**Limits.**
- **Cannot be bought alone.** ConnectCAD and Braceworks are add-ons purchasable only bundled with
  a Spotlight or Design Suite subscription (SNIPPET, multiple sources incl. vectorworks.de).
- **Price.** ~USD 1,530/yr Spotlight, ConnectCAD ~USD 1,830/12 mo on top; German reseller list
  €2,340/yr net for Spotlight+ConnectCAD, €3,420/yr net with Braceworks too (SNIPPET,
  German reseller pages — a reseller, not the vendor, so treat as indicative).
- **Learning curve.** Named as steep in several sources, and the Vectorworks community board
  itself carries a user who bought it, could not get productive in ten months, and used Draw.io
  instead (SNIPPET). **This is the single most quotable weakness in tier 1.**

**Caution on one source class:** several of the pricing pages that surface for ConnectCAD are
published by **XTEN-AV, a direct competitor** (`xtenav.com/vectorworks-connectcad-pricing/`).
Numbers from that source are marked accordingly and should be re-verified from vectorworks.net.

### 2. WireCAD 10 — the segment's most-recommended specialist, and its data model is a database

**What it does.** DWG/DXF documentation with a real database behind it: draw and manage cable and
connection information, auto-generate functional block diagrams, auto-assign cable numbers,
auto-populate rack layouts, print cable labels, BOMs and other reports, against a community
database of **100,000+ equipment definitions** (SNIPPET, `wirecad.com`).

**Data model — the notable part (SNIPPET, `wirecad.com/help90/...` and wiki).**
WireCAD "produces DWG-compatible drawings accompanied by either **VistaDB or SQL Server**
databases containing all pertinent project data," works with SQL Azure, and **creates a new
database catalog per project**, requiring SQL Server 2012+ (Express acceptable). That is
architecturally the same insight as NetBox's: *the drawing is a view; the database is the
project*. It also means the integration surface is ODBC/SQL rather than a REST API — cruder, but
completely open to anyone who can write a query.

**Cable numbering.** The Cable Number Format dialog lets you concatenate any field associated
with the cable number into a custom scheme, and WireCAD error-checks the project database to
hand you the next number in sequence (SNIPPET, `wirecad.com/help90/cable_number_formatting.htm`).
This is a **schema-driven numbering system, not a text template** — worth stealing.

**Practitioner verdict.** The Willow Creek FAQ (SNIPPET) is the most useful independent review
found: chosen over VidCAD and Visio for "fairly easy learning curve, reasonable price, easy to use
interface, online tutorials, great support," with the standout feature being **the ease of
building equipment blocks**, and it "keeps things organized, creates cable labels, does rack
elevations and even patchbay layouts."

**Limits.** Windows-only. Editions XLT (single user) / PRO (multi-user, SQL Server) / CMS (fibre
/ cable-management scale). **Pricing could not be pinned down**: three queries returned mutually
inconsistent fragments (a "$7,500" associated with CMS, a "$440.00/month" associated with a CMS
subscription, and a "$2,400 / $440 / $220" triple attributed to the store category page). I am
recording that as **UNKNOWN** rather than picking one. Licensing structure *is* consistent across
sources: perpetual licences ship with the first year of Assurance, renewals indexed at 60% of
list, with an "Assurance Price Lock" against year-on-year increases (SNIPPET).

### 3. The estimator-first tier — D-Tools SI, D-Tools Cloud, XTEN-AV

These are not really drawing tools. They are **quote-to-cash systems with a drawing module**, and
that inverted priority explains both their strength and their irrelevance to a working engineer.

**D-Tools SI (SNIPPET, d-tools.com pages).** End-to-end for low-voltage integrators: estimating,
system design and documentation, procurement, project management, installation and service, all
driven by "an extensive, integrated product library" with real-time dealer-specific pricing.
Design happens through **AutoCAD and Visio integration** that keeps the engineering drawings
synchronised with the BOM. Deployment is desktop + SQL Server with a hosted option.
Price from ~USD 150/user/month **plus** professional-services implementation (~USD 200/h) — the
implementation fee is the tell that this is an ERP-class purchase, not a tool purchase.

**D-Tools Cloud (SNIPPET).** The lighter sibling: Solo ~99 / Team ~249 / Company ~499 /
Enterprise ~999 USD per month, ~10% off annual.

**XTEN-AV (SNIPPET, xtenav.com/pricing and knowledgebase.xtenav.com).** Cloud-native competitor.
Basic USD 104.25/user/mo billed annually (139 monthly), Business 111.75 (149), Enterprise 126.75
for 25+ users, X-PRO office/field add-ons +11.25 each. Products are X-DRAW (drawing), x.doc
(proposals), XAVIA (AI agent). Automated rack elevations, 2D/3D review, floor plans, signal-flow
and cable-wiring diagrams. **API access is gated to the Enterprise tier** ("on-demand API
integrations").

**The common limit.** Both are cloud-tethered and both centre the *commercial* object (line item,
price, margin) rather than the *physical* object (port, cable, panel position). **INFERENCE:**
this is why an engineer on a truck refit still ends up in Excel even at a company that owns
D-Tools — the system knows what was sold, not what is plugged in where.

**A source-hygiene warning.** XTEN-AV publishes a large volume of SEO content reviewing its own
competitors ("Top 5 free rack diagram software", "Vectorworks ConnectCAD Pricing", "AutoCAD
Pricing: Hidden Costs Draining AV Budgets"). Several of these rank above the vendors' own pages.
Any competitive claim sourced to an `xtenav.com/blog/` URL should be treated as marketing.

### 4. EasySchematic — the most complete free AV-native tool found, and the closest analogue to cable-planner

**FACT** — the following is read directly from `github.com/duremovich/EasySchematic`.

**What it does.** Browser-based AV signal-flow design: "draw your signal flow, and the paperwork
comes with it — devices, racks, patch bays, and print sheets all exist in one file, eliminating
drift between separate spreadsheets."

**Data model.** This is the part that matters:
- **73 colour-coded signal types**, each customisable, covering SDI, HDMI, NDI, Dante, AVB,
  AES/AES67/AES50, MADI, DMX, Art-Net, sACN, HDBaseT, SRT, **ST 2110**, Genlock, Word Clock,
  Timecode, **Tally**, GPIO, RS-422/485, Ultranet, StageConnect, SoundGrid, BLU link, Cresnet,
  fibre, and Power (L1/L2/L3/N/G).
- **Typed ports with directionality**, validated live: green for a valid connection, red for
  incompatible, with **adapters auto-inserted between incompatible ports**.
- **Expansion slots** for card-frame chassis, with **device swap that remaps connections and
  auto-installs required cards**.
- **Bundles** — grouping multiple connections down a shared trunk.
- **Virtual patch bays** routed through without drawing them on the schematic, with
  **multi-panel hops carrying per-segment cable IDs and letter suffixes**, and 100 %-scale
  designation strips for physical label holders.
- Real-world per-device data: dimensions, weight, power draw, hostname/IP, cost.

**Integrations and formats.** Vector **PDF** (Letter through **A0**, preserving mounting holes
and occupancy), **DXF** for CAD, PNG (4×), SVG, JSON; **CSV cable-schedule import**. Device
library of **3,800+ templates** from a community database, fetched live with offline fallback,
exposed through a **public API with no auth**.

**Reports.** Pack list cross-referenced against an owned-gear inventory, cable schedule with
estimated lengths, patch-panel and network schedules, power analysis — through a WYSIWYG report
editor with grouping, sorting and custom headers/footers.

**Stack.** React 19 + TypeScript, `@xyflow/react` v12, Zustand v5, Tailwind v4, Vite 8,
Cloudflare Workers + D1. **AGPL-3.0.** 120 stars, 762 commits, 146 open issues.

**Limits.** Self-hosting still calls out to `api.easyschematic.live` for cloud saves, device
submissions and sharing. It is explicitly "a tool for designing audiovisual systems — not a
general diagramming app."

**Why this is the headline finding.** Its stack is *nearly identical* to cable-planner's
(React + TypeScript + Zustand + ReactFlow/xyflow), its feature list overlaps cable-planner's
heavily, it is free and AGPL, and it independently arrived at several of the same design
decisions — typed ports, adapter insertion, pack lists, per-segment cable IDs through patch hops.
It is simultaneously the strongest validation that cable-planner's model is the right one and the
most direct competitive threat in the corpus.

### 5. NetBox — still the best cable data model anywhere, and 4.5 made it better

**FACT** — read directly from the NetBox docs in the GitHub repo.

**The Cable model** carries: Status (Active / Planned / Decommissioning), **Profile** (new in
v4.5), Type, Label, Color, and Length with a unit designation. Cables may connect **eight** kinds
of endpoint: interfaces, console ports, console server ports, pass-through ports, circuit
terminations, power ports, power outlets and power feeds. Termination rules are explicit:
single-position cables allow one termination per end, multi-position cables are unlimited, and
both ends must have matching termination counts except at pass-through ports or circuit
terminations.

**Cable Profiles (v4.5)** are the interesting addition. A profile "indicates the number of
discrete parallel channels or lanes carried by the cable among its endpoints" — a 1-to-4 breakout
has four lanes, common at one end and split at the other. Built-in profiles cover single, trunk,
breakout and shuffle; the docs name Straight (single position), Straight (multi-position),
Shuffle (2×2 MPO8) and Shuffle (4×4 MPO8). With a profile assigned, NetBox can **trace a specific
connection within a cable rather than the cable as a whole** (SNIPPET for the tracing sentence,
netboxlabs.com/blog; FACT for the profile list, repo docs). Assignment is optional and
unprofiled cables trace as before.

**Pass-through ports.** FrontPort carries Device, Module, Name, Label, Type, **Positions** ("the
number of rear port positions to which this front port maps"), **Rear Ports**, Color, and
Mark Connected. NetBox follows a path across a cable to the far end, and **if that lands on a
pass-through port whose peer has another cable, it keeps going** until it reaches a
non-pass-through or unconnected termination. In 4.5 the old `rear_port`/`rear_port_position`
fields were replaced by a dedicated **PortMapping** model supporting any number of
front-position → rear-position assignments (SNIPPET, netboxlabs docs).

**API.** REST and GraphQL, with profiles fully integrated. Note a breaking change worth knowing:
**`/api/dcim/cable-terminations/` is read-only as of 4.5**; terminations are managed through
`/api/dcim/cables/` so connector and position assignments stay consistent with the profile
(SNIPPET, v4.5 release notes).

**The devicetype-library** (FACT, opened): community YAML device definitions, one file per make
and model, organised by manufacturer, declaring console ports, console server ports, power ports,
power outlets, interfaces, **front and rear ports**, module bays and device bays. 1.6k stars,
1.4k forks, 5,868 commits, **CC0-1.0 — public domain**. Rackula consumes it for hardware images.

**The gap, unchanged.** None of this knows what SDI *is*. A BNC on a router and a BNC on a
tie-line panel are the same object to NetBox; there is no concept of a video standard, a genlock
reference, a mix-minus, or an embedded audio channel. The model is perfect and the vocabulary is
missing. **INFERENCE:** an AV tool that adopted NetBox's *structural* model (pass-through
mapping, path tracing, cable profiles) and layered AV *semantics* on top would have the best
data model in this segment by a distance. Nobody has done it.

### 6. The text-defined tier — kumihimo and WireViz

Two projects treat the diagram as a *build artefact of a text file*, which makes the whole
document diff-able, reviewable and CI-checkable.

**kumihimo** (FACT, `github.com/Love-Rox/kumihimo`; MIT © SASAGAWA Kiyoshi; TypeScript; created
2026-07-30, 95 commits, topics include `av`, `broadcast`, `signal-flow`, `dsl`). A DSL for AV
signal flow — Japanese *系統図*. The README's own example:

```
device cam "SONY FX3" as camera { out SDI : sdi }
device sw "ATEM Mini" as switcher { in 1..8 : sdi out PGM : sdi }
device rec "HyperDeck" as recorder { in SDI : sdi }

cam.SDI -> sw.1 : sdi 30m "V-01" [color=blue]
sw.PGM -> rec.SDI : sdi 2m "V-10"
```

Note what is encoded in two lines: port identity, signal type, **cable length**, **cable label**,
and a display colour. **38 built-in signal types.** Validation covers type mismatches ("SDI
output cannot feed an HDMI input"), direction, **over-booked inputs**, **impedance warnings**
("balanced to unbalanced: level drop") and adapter detection requiring an explicit `via`.
The README's stated design principle is the best sentence in this dossier:

> "The faults worth catching are the ones where **the cable plugs in perfectly and nothing
> works**."

Outputs: themed SVG, **editable draw.io files**, **cable schedules as TSV**, and wireless
path/channel documentation. Ships React/Vue/Astro integrations and a VS Code extension.

**WireViz** (FACT, `github.com/wireviz/WireViz`; GPL-3.0; 5.2k stars, 311 forks, 160 open
issues). YAML in; SVG/PNG wiring diagrams, GraphViz files, **BOM as tab-separated text**, and an
HTML page with diagram and BOM embedded. Supports IEC 60757 colour abbreviations, DIN 47100,
25-pair and TIA/EIA colour schemes, automatic wire-gauge conversion, and auto-routing for simple
connections. It is **pin-level** — a genuinely finer granularity than anything else here. Its own
README still warns: "This is very much a work in progress. Source code, API, syntax and
functionality may change wildly at any time."

**INFERENCE:** kumihimo is essentially "WireViz for AV" and is one contributor and about eighteen
months from being genuinely useful. Its low star count (1) means the idea is unproven in the
market, not that it is wrong. The **draw.io export** is the shrewdest decision in it: it meets
practitioners inside the tool they already fell back to.

### 7. Notable others, briefly

**Rackula** (FACT, `github.com/RackulaLives/Rackula`; MIT; 1.7k stars, 1,929 commits;
Svelte + TypeScript; Docker/LXC/bare-metal self-host, optional OIDC). Drag-and-drop rack layout
with **real hardware images sourced from NetBox's devicetype-library**, EIA-310 modelling
(1U = 1.75 in), sub-1U devices via carrier brackets, bayed multi-cabinet grouping, PNG/PDF/SVG
export, URL and QR sharing. The README describes rack elevations only — **but the issue tracker
shows connectivity being actively built**: issue #3117 concerns port indicators not rendering for
container-child devices, and #3122 concerns cleaning up **"strand connections"** referencing
removed devices, both referencing connectivity milestones M005/M006 (FACT, opened issues page).
So the previous pass's read stands and has advanced: **the most-starred open-source rack tool is
growing a port-and-connection model.**

**The CAD-parser tier — tvCAD and Cable Scheduler** (SNIPPET). Both are Australian, both keep the
engineer in AutoCAD and parse the DWG afterwards. Cable Scheduler names Foxtel, Fox Sports,
ABC TV Australia, Telstra Broadcast, Techtel, NEP, MediaHub and Magna as users, claims one-click
schedules, equipment lists and cable searches, and positions itself explicitly against
"ConnectCAD, VidCAD, D-Tools and Star Draw"; it is a Windows application and explicitly **not**
cloud-based or outside the firewall. tvCAD uses "ACNE-style CAD blocks with additional features
like connector types and cable types" and reports to Excel. **INFERENCE:** this tier exists
because large broadcasters will not abandon AutoCAD, and it is the clearest proof that
**the report generator, not the editor, is where the value is felt.**

**Middle Atlantic RackTools / Configurator** (SNIPPET). Free vendor tool producing rack elevation,
plan, side and rear drawings plus purchase orders and quotes, drag-and-drop, exporting complete
drawings to AutoCAD at 1:1 since v3.5. **INFERENCE:** free vendor configurators are how a large
share of rack elevations actually get drawn, and they lock the drawing to one manufacturer's
catalogue.

**The stage-plot / patch-sheet apps** (SNIPPET): StagePlot Guru (iPad, USD 4.99 pro upgrade),
StageRider, Stage Viewer, AudioPatch (festival master patch generating per-act input lists and
FOH/monitor splits, tie-line patching), Stageplot Pro (input list auto-generated as gear is
placed). These are the audio half of the same problem and they are **much** cheaper and much more
used than tier 1. AudioPatch's festival model — one master patch, N derived per-act views — is a
pattern nothing in the video/broadcast tools has.

---

## Standards & protocols

### AV documentation standards (the most under-exploited assets in this segment)

| Standard | What it is | Status |
| --- | --- | --- |
| **ANSI/CTA/CEDIA/InfoComm J-STD-710** (2015) | *Audio, Video and Control Architectural Drawing Symbols.* A standardised set of architectural floor-plan and reflected-ceiling-plan symbols for AV, control, environmental control and communication networks — **84 symbols** for equipment, devices, sensors, control interfaces and cabling, with usage guidance. | **The standard document itself is free from AVIXA**; the *digitised symbol files* are sold separately (member discount). Stardraw licensed and implemented them into Design 7.2 in March 2016 — the only vendor adoption found. (SNIPPET) |
| **ANSI/AVIXA F501.01:2015** | *Cable Labeling for Audiovisual Systems.* Requirements for AV cable labelling to aid operation, support, maintenance and troubleshooting. | Published. (SNIPPET) |
| **ANSI/AVIXA F502.01:2018** | *Rack Building for Audiovisual Systems.* Rack mounting, cable management for power and signal, thermal management, finishing. | Published. (SNIPPET) |
| **ANSI/AVIXA F502.02:2020 (R2023)** | *Rack Design for Audiovisual Systems.* Minimum rack planning and design requirements, required process inputs and outputs. | Published. (SNIPPET) |

**Correction to the brief:** the seed list attributes cable labelling to F502.01. It is
**F501.01**; F502.01 and F502.02 are rack building and rack design respectively.

**INFERENCE, and it is the strongest product opportunity in this section:** there is a free,
ANSI-accredited symbol standard for AV drawings, an ANSI/AVIXA standard for how cables must be
labelled, and two for how racks must be designed and built — and in ten years of the standard's
existence I found **exactly one** vendor adoption announcement (Stardraw, 2016). A planner that
emitted J-STD-710-conformant symbols and F501.01-conformant labels would be able to make a
compliance claim no competitor is making, at near-zero implementation cost.

### Interchange formats

| Format | Role in this segment | Notes |
| --- | --- | --- |
| **DWG / DXF** | The lingua franca of tier 1 and tier 3. | WireCAD is DWG-native with a SQL database beside it; tvCAD and Cable Scheduler parse DWG; Middle Atlantic RackTools exports to AutoCAD at 1:1; EasySchematic and `ng-diagram-av-schematic` both export DXF. **DXF is the minimum viable interchange for this segment.** |
| **GDTF — DIN SPEC 15800** | *General Device Type Format.* Unified data-exchange definition for controllable devices, standardised as DIN SPEC 15800 (DIN recognition 2020). | Lighting-first, but the *device-description* idea generalises. Spec at `github.com/mvrdevelopment/spec`. |
| **MVR — DIN SPEC 15801:2023-12** | *My Virtual Rig.* Open standard for exchanging scene geometry and complete show setups as planning status between consoles, CAD and pre-visualisation. Current version supports lighting devices, media servers and rigging items (trusses, hoists). | Built on GDTF. The one genuinely working, DIN-standardised, cross-vendor planning interchange in the entertainment industry — and it does **not** cover AV signal flow. |
| **CSV / TSV** | The real interchange layer. | EasySchematic imports CSV cable schedules; kumihimo emits TSV cable schedules; tvCAD reports to Excel; H2R Gear exports patch lists and cable schedules to CSV. **INFERENCE: CSV in/out is not a fallback in this segment, it is the actual integration standard.** |
| **draw.io XML** | Editable-diagram interchange. | kumihimo exports it deliberately; `product_library` on GitHub publishes draw.io libraries of broadcast equipment. |
| **YAML** | Text-defined harness/system source. | WireViz (harness), kumihimo (DSL, own syntax), NetBox devicetype-library (device definitions, CC0). |
| **GraphML** | Graph interchange. | yEd's native format; already exported by cable-planner. |

### Wire protocols relevant as documentation sources

| Protocol | Why it matters here |
| --- | --- |
| **Blackmagic Videohub Ethernet Protocol** | Text-based protocol on **TCP port 9990**. On connect the server sends a complete state dump, then pushes updates on every change. Blocks are all-caps headers followed by a colon, multi-line, terminated by a blank line; lines end with newline. Blocks cover device information, **labels**, routing, lock status and hardware status. Published by the vendor as *Videohub Developer Information*. (SNIPPET; primary PDF at documents.blackmagicdesign.com) — **the label block makes a router a readable source of truth for port naming.** |
| **Ember+** | Used by Lawo VSM to control Riedel MediorNet video routing over IP. (SNIPPET, docs.lawo.com) |
| **TSL (v5)** | Tally and label transfer, e.g. VSM to internal multiviewers. (SNIPPET, docs.lawo.com) |
| **AMWA NMOS IS-04 / IS-05** | IS-04 registration and discovery, IS-05 connection management, for SMPTE ST 2110 systems. **INFERENCE:** in a 2110 plant, IS-04 *is* the live device-and-port inventory and IS-05 *is* the live patch state — the closest thing to an automatic as-built that exists, and no planning tool in this segment consumes it. |
| **Broadcast controllers as documentation** | VSM and RRCS hold the authoritative crosspoint, label and panel configuration of a facility. The seed brief's framing is right: these are documentation sources being used as control systems. Extracting from them is unexplored territory. |

---

## What this segment does WELL

Patterns worth stealing, each attached to who does it:

1. **The drawing is a view; the database is the project.** WireCAD (VistaDB/SQL Server per
   project) and NetBox (Postgres + REST/GraphQL) both got here from opposite directions. Anything
   that stores the design *as geometry* eventually loses to something that stores it as records.
2. **Port-level typing with live validation.** EasySchematic (73 signal types, green/red feedback,
   auto-inserted adapters), kumihimo (38 types plus impedance and over-booked-input checks),
   WireFlow ("HDMI cannot land on SDI, Dante stays on network ports"). The whole new tier
   converged on this independently. It is the segment's settled answer to "what is a connection?"
3. **The pass-through port abstraction.** NetBox's FrontPort/RearPort + PortMapping, and its rule
   of continuing to trace *through* pass-throughs until reaching a real endpoint, is the correct
   model of a patch panel and nothing in the AV tier implements it properly.
4. **Cable profiles / lanes.** NetBox 4.5 modelling breakout and shuffle cables as lanes, so a
   trace can follow one channel rather than the whole cable. Directly applicable to MPO fibre,
   MADI, and every 4K quad-link SDI installation.
5. **Schema-driven cable numbering.** WireCAD concatenating any field associated with the cable
   into a numbering scheme, then error-checking the database for the next free number. Not a
   string template — a constraint.
6. **Report generation as the actual product.** tvCAD and Cable Scheduler exist *purely* as
   report generators over someone else's drawing, and have broadcaster customers. EasySchematic
   ships a WYSIWYG report editor with grouping, sorting and custom headers. The engineer's
   perceived value is the paperwork, not the canvas.
7. **Print fidelity as a first-class feature.** EasySchematic's vector PDF preserving mounting
   holes and rack occupancy, Letter through **A0**, and **100 %-scale designation strips sized to
   fit physical patch-panel label holders**. That last detail is the difference between a tool an
   engineer likes and one they depend on.
8. **Community device libraries with a public API.** NetBox devicetype-library (CC0, YAML,
   1.4k forks), EasySchematic (3,800+ templates over an unauthenticated public API, submissions
   from a right-click on the canvas), PatchMyGear (public library, user submissions). Library
   breadth is the moat in tier 1 — Stardraw advertises 130,000+ symbols from 1,600+ manufacturers
   — and the open tier is reaching it by crowdsourcing.
9. **Free-tier-to-paid at a sane price point.** WireFlow: free tier of three editable diagrams,
   five custom devices, full preset library, PNG export and one read-only share link; Pro at
   USD 5–14.99/month. Compare tier 1 at USD 1,500–3,500/year.
10. **Text-defined, diff-able designs.** kumihimo and WireViz. A signal flow that lives in git,
    reviews in a pull request, and validates in CI is a category nobody in AV has properly built.

---

## What NOBODY in this segment solves well

The white space, ordered by how confident I am that the gap is real:

1. **AV semantics on top of a proper physical model.** NetBox has flawless structure and no idea
   what SDI is. The AV tools know what SDI is and model patch panels as pictures. **No product
   found does both.** This is the largest single gap in the segment.
2. **The design ⇄ reality loop.** Every tool models the *plan*. Nothing found ingests the
   *installed state* — not from a Videohub label dump on TCP 9990, not from NMOS IS-04/IS-05,
   not from a switch's LLDP table — and diffs it against the design. As-built drift is the single
   most-cited failure of documentation in this trade and it is completely unaddressed.
3. **Signal flow that survives the patch panel.** Multi-hop patching with per-segment cable IDs
   is implemented by exactly one product found (EasySchematic), and by nobody in tier 1's
   verifiable feature lists. The moment a signal crosses two panels and a tie-line, every other
   tool degrades to a drawing.
4. **Label output that reaches a label printer.** Brady and DYMO ship their own label software
   (Markware, DYMO ID) with their own templates (SNIPPET). AV design tools generate "cable labels"
   as report rows. **No verified end-to-end path was found** from a design tool's cable schedule
   into a Brady/DYMO printer with correct wrap geometry and F501.01-conformant content. Given
   that F501.01 is an ANSI/AVIXA standard, this is a conspicuous hole.
5. **J-STD-710 symbol conformance.** Free ANSI-accredited standard, 84 symbols, one vendor
   adoption in a decade.
6. **A price point between free and USD 1,500/year.** Tier 5 has started filling this in the last
   two or three years, but with no offline-first desktop option except EasySchematic's PWA — and
   an OB truck in a stadium car park has no internet.
7. **Rental/inventory ⇄ design.** EasySchematic cross-references its pack list against an
   owned-gear inventory; that is the only instance found. Nothing connects a cable schedule to
   *the cables you actually own and their test status*.
8. **Multi-user, offline-tolerant collaboration.** The tools are either single-user desktop
   (tier 1, tier 3) or cloud-only multi-user (tier 2, most of tier 5). Two engineers on a truck
   with no uplink editing the same patch is unsolved.
9. **Standards-aware validation.** DRC in this segment means "missing connection" or "incompatible
   equipment" (ConnectCAD) or "wrong connector type" (the new tier). Nothing validates against
   F502.01/F502.02 rack rules — thermal, cable management, mounting — or against a signal
   standard's real constraints (cable length limits per SDI rate, genlock distribution,
   PoE budget, fibre loss budget).
10. **Interchange between planning tools.** MVR/GDTF solved this for lighting under DIN SPEC.
    There is **no equivalent for AV signal flow**. Every tool in this dossier is a data island
    whose only exits are DXF, PDF and CSV.

---

## Relevance to AV Planner Suite

**Primary: `cable-planner`.** This segment is that app's direct market. Cross-referencing the
findings against `docs/research/repos/INVENTORY.md`:

**Where cable-planner is already competitive or ahead**

| Capability | Segment state | cable-planner |
| --- | --- | --- |
| Typed ports + signal standards | Only tier 5 has it | Has it (`Port`, `SignalStandard`, `CableSpec`) |
| Connector/compatibility DRC | ConnectCAD (verified), tier 5 | Has it, with `ok/warn/error` severity levels — **finer than any competitor's binary valid/invalid** |
| Cable numbering schemes | WireCAD's is the best in the segment | Has schemes; worth comparing against WireCAD's field-concatenation + database next-number model |
| Offline-first desktop | Tier 1 and 3 only — tier 5 is cloud-bound except EasySchematic's PWA | **Genuine differentiator.** Local files, opt-in integrations |
| Live-device integration | Essentially nobody | ATEM, Videohub (routing + labels), NetBox import, Rentman, Green-GO — **no competitor found has anything comparable** |
| Inventory ⇄ design | Only EasySchematic's pack list | Full inventory model: units, cases, storage nodes, conditions, service records, cable test results |
| Export breadth | DXF is the segment minimum | PDF (raster + vector), DXF, GraphML, CSV, barcode/QR, pack list, asset register |
| Collaboration | Cloud-only or single-user | CRDT + signaling relay + mobile share — offline-tolerant multi-user, which **nobody in the segment has** |

**Concrete gaps this research exposes, in priority order**

1. **Pass-through port modelling (NetBox FrontPort/RearPort + PortMapping) and trace-through
   patch panels with per-segment cable IDs.** Gap #3 above. Highest value, well-specified by an
   open-source model you can read.
2. **Cable profiles / lanes** (NetBox 4.5) — breakout and shuffle cables, quad-link SDI, MPO
   fibre, MADI. Trace one lane, not the whole cable.
3. **J-STD-710 symbols and F501.01-conformant labels.** Free standard, near-zero cost, a
   compliance claim only one competitor in a decade has made.
4. **Label printing that actually reaches Brady/DYMO hardware**, with correct wrap geometry and
   100 %-scale designation strips (steal the EasySchematic detail).
5. **The as-built diff.** cable-planner *already talks to Videohub and ATEM.* Reading the
   Videohub port-9990 label and routing blocks and diffing them against the plan would close gap
   #2 — the largest unsolved problem in the segment — using an integration that already exists.
   **This is the highest-leverage item in this dossier.**
6. **CSV cable-schedule import**, not just export. EasySchematic has it; it is how a design gets
   rescued out of the spreadsheet it currently lives in, and it is the cheapest possible migration
   path off Excel.
7. **A text/DSL representation** for git-reviewable designs (kumihimo, WireViz). Speculative, but
   uniquely suited to a project already storing JSON project files.

**Competitive watch list, in order of threat:** EasySchematic (nearly the same stack, free, AGPL,
overlapping feature set, active), Rackula (1.7k stars, growing a connection model), WireFlow
(USD 5/mo, validation-first, LED-wall planning), Patchify (broadcast device library, offline
Windows app).

**Secondary: shell/suite.** MVR/GDTF (DIN SPEC 15800/15801) is the segment's only working
cross-vendor interchange and light-planner already exports MVR. The suite-level lesson is that
**`@avplan/inventory-core`'s frozen `avplan-inventory` wire format is the right instinct** — this
entire segment fails at interchange, and a stable documented format is a differentiator, not
plumbing.

**Secondary: `light-planner`.** Confirms MVR/GDTF as the correct target and that the current
version covers lighting devices, media servers and rigging items.

**Tertiary: `tally-pi`, `broadcast-intercom`, `sony-camera-bridge`.** Relevant only as *sources
of truth* for the as-built diff (item 5) — TSL tally/label data, intercom port configuration,
camera-channel assignments are all documentation the plan could be validated against.

**Not relevant:** `multicam-planner`, `pi-media-station`.

---

## Sources

### Pages opened directly (FACT tier)

1. https://github.com/wireviz/WireViz
2. https://raw.githubusercontent.com/netbox-community/netbox/main/docs/models/dcim/cable.md
3. https://raw.githubusercontent.com/netbox-community/netbox/main/docs/models/dcim/frontport.md
4. https://github.com/netbox-community/devicetype-library
5. https://github.com/duremovich/EasySchematic
6. https://github.com/RackulaLives/Rackula
7. https://github.com/RackulaLives/Rackula/issues
8. https://github.com/Love-Rox/kumihimo
9. https://github.com/topics/rack-diagram
10. https://github.com/topics/signal-flow

GitHub API (repository search, via MCP): `Love-Rox/kumihimo`, `Love-Rox/kumihimo-homepage`.

### Pages cited via search-engine summary (SNIPPET tier — not directly opened)

**Vectorworks / ConnectCAD**
- https://www.vectorworks.net/en-GB/connectcad/capabilities
- https://www.vectorworks.net/en-US/spotlight/buy
- https://app-help.vectorworks.net/2026/eng/VW2026_Guide/ConnectCAD/Creating_ConnectCAD_reports.htm
- https://app-help.vectorworks.net/2025/eng/VW2025_Guide/ConnectCAD/Presenting_to_clients.htm
- https://www.vectorworks.de/vectorworks/spotlight
- https://www.vectorworks.de/vectorworks/connectcad
- https://forum.vectorworks.net/forum/138-connectcad/
- https://www.moehlis.com/vectorworks-abonnement-kaufen/ (German reseller, EUR pricing)
- https://koelncad.de/vectorworks-mieten/ (German reseller)
- https://xtenav.com/vectorworks-connectcad-pricing/ (**competitor-published**, treat with caution)

**WireCAD**
- https://www.wirecad.com/
- https://www.wirecad.com/index.php?route=product/category&path=71_17
- https://www.wirecad.com/index.php?route=product/product&product_id=151 (10 PRO 1-yr subscription)
- https://www.wirecad.com/index.php?route=product/product&product_id=146 (10 PRO)
- https://www.wirecad.com/index.php?route=product/product&product_id=160 (10 XLT)
- https://www.wirecad.com/index.php?route=product/product&product_id=148 (10 CMS)
- https://www.wirecad.com/help90/cable_number_formatting.htm
- https://www.wirecad.com/help90/qs_sql_server_setup_basics.htm
- https://www.wirecad.com/wiki/index.php?title=Setup_SQL_Server
- https://www.wirecad.com/help100/qs_licensing_faq.htm
- https://www.wirecad.com/help100/hmcontent.htm (v10 user manual)
- https://www.av-iq.com/avcat/ctl1642/index.cfm?manufacturer=wirecad&product=wirecad-10-pro

**D-Tools**
- https://www.d-tools.com/system-integrator-pricing
- https://www.d-tools.com/cloud-pricing
- https://www.d-tools.com/system-integrator-features
- https://www.d-tools.com/resource-center/8-signs-integrators-need-to-ditch-spreadsheet
- https://softwarefinder.com/field-service/d-tools-system-integrator-si

**XTEN-AV**
- https://xtenav.com/pricing/
- https://knowledgebase.xtenav.com/en-us/article/what-is-the-pricing-for-a-single-user-software-subscription-5qyxuf/
- https://knowledgebase.xtenav.com/en-us/article/what-are-the-different-levels-of-pricing-1v6ryk5/
- https://xtenav.com/x-draw/

**Stardraw**
- https://stardraw.com/sd7/overview
- https://stardraw.com/sd7/purchase
- https://stardraw.com/sd7/features/libraries
- http://blob.stardraw.com/www/products/stardrawdesign7_2/help/J-STD-710_Symbols.htm

**Broadcast CAD-parser tier**
- https://www.cableschedules.com/
- https://www.cableschedules.com/about/
- https://www.tvcad.tv/
- https://www.willowproduction.org/faq/what-cad-software-do-you-use-for-creating-and-maintaining-system-schematic-diagrams/

**NetBox / DCIM**
- https://netboxlabs.com/blog/understanding-cable-profiles-in-netbox-4-5/
- https://netboxlabs.com/docs/netbox/release-notes/version-4.5
- https://netboxlabs.com/docs/netbox/models/dcim/frontport/
- https://github.com/netbox-community/netbox/discussions/21104
- https://netboxlabs.com/blog/open-source-dcim-tools/
- http://www.racktables.org/
- https://www.sunbirddcim.com/product/data-center-connectivity
- https://www.sunbirddcim.com/pricing

**AV-native micro-SaaS tier**
- https://wireflow.live/
- https://wireflow.live/av-diagram-software
- https://patchify.app/
- https://patchmygear.com/
- https://h2rgear.com/tools/patch-list/
- https://h2rgear.com/tools/av-diagram-maker/
- https://docs.h2rgear.com/updates/changelog
- https://audiopatch.net/
- https://stageplotpro.app/
- https://soundgirls.org/list-of-apps-and-software-for-designing-stage-plots/

**Standards**
- https://www.avixa.org/standards/audio-video-and-control-architectural-drawing-symbols (J-STD-710, free)
- https://www.avixa.org/standards/cable-labeling-for-audiovisual-systems (F501.01)
- https://www.avixa.org/standards/rack-building-for-audiovisual-systems (F502.01)
- https://www.avixa.org/standards/current-standards
- https://www.avixa.org/about-avixa/who-we-are/press-room/2016/03/14/stardraw.com-adopts-standard-av-symbols-for-design-and-documentation-software
- https://webstore.ansi.org/standards/ansi/ansistd7102015
- https://github.com/mvrdevelopment/spec (GDTF DIN SPEC 15800 / MVR DIN SPEC 15801)
- https://github.com/mvrdevelopment/spec/blob/main/mvr-spec.md
- https://gdtf-share.com/help/
- https://www.vectorworks.net/en-US/newsroom/din-spec-15801-mvr

**Protocols**
- https://documents.blackmagicdesign.com/DeveloperManuals/VideohubDeveloperInformation.pdf
- https://docs.lawo.com/vsm-ip-broadcast-control-system/vsm-interface-driver-and-application-details/driver-supported-protocol-driver/blackmagic-videohub-ethernet
- https://docs.lawo.com/vsm-ip-broadcast-control-system/vsmstudio-user-manual/vsmstudio-signal-paths
- https://docs.lawo.com/vsm-ip-broadcast-control-system/vsm-interface-driver-and-application-details/driver-supported-protocol-driver/driver-rrcs-riedel
- https://lawo.com/products/vsm/
- https://www.smpte.org/standards/st2110
- https://www.thebroadcastbridge.com/content/entry/21347/broadcast-standards-the-nmos-standards-deep-dive

**Generic diagramming and German-market practitioner sources**
- https://www.production-partner.de/basics/signallaufplan-mit-yed/
- https://www.drawio.com/blog/rack-diagrams
- https://drawio-app.com/blog/how-to-build-rack-diagrams-in-draw-io/
- https://www.drawio.com/docs/diagram-types/network-diagrams/
- https://www.prosoundweb.com/new-version-of-middle-atlantic-racktools-software-v3-5-offers-enhanced-capabilities/
- http://www.middleatlantic.com/config.aspx
- https://www.dymo.com/pro-av-vertical.html

### Not opened — re-run these to harden the dossier

Every domain in the SNIPPET list above was **blocked at the egress proxy**. The highest-value
re-runs, in order:

1. `wirecad.com/index.php?route=product/category&path=71_17` — the only way to resolve the
   WireCAD price contradiction.
2. `d-tools.com/system-integrator-pricing` and `/cloud-pricing` — confirm tiers and the
   implementation fee.
3. `xtenav.com/pricing/` — confirm the per-user figures from the vendor rather than a summary.
4. `vectorworks.net/en-US/spotlight/buy` and `vectorworks.de/vectorworks/kaufen` — vendor-direct
   USD and EUR, replacing reseller figures.
5. `stardraw.com/sd7/purchase` — the package prices are ambiguous in every summary obtained.
6. `patchify.app` pricing — no price was published in any reachable source.
7. `avixa.org/standards/audio-video-and-control-architectural-drawing-symbols` — download
   J-STD-710 itself and confirm the licensing terms for the 84 symbols.
8. `documents.blackmagicdesign.com/DeveloperManuals/VideohubDeveloperInformation.pdf` — the
   verbatim block grammar, needed to implement the as-built diff.
9. `forum.vectorworks.net/forum/138-connectcad/` and r/VIDEOENGINEERING — practitioner sentiment
   is the thinnest evidence in this dossier; the Excel-fallback thesis rests on three sources,
   one of which is vendor marketing.
