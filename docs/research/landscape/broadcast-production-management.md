# Broadcast / OB / Live Production Management

> Landscape dossier for AV Planner Suite. Research date: **2026-08-28**.
> Language: English (research corpus is EN by convention; product/vendor names kept as branded).

---

## Method, and an honest note on source quality

**Read this before trusting any line below.**

This session's network egress policy allowed **WebSearch** and allowed **WebFetch only against
`github.com`**. Every other domain attempted returned `EGRESS_BLOCKED` from the proxy
(farmerswife.com, cuez.app, rentman.io, xytechsystems.com, xytechsystems.github.io,
documentation.rossvideo.com, docs.dataminer.services, open.cinegy.com, rundownstudio.app,
dramatify.com, specs.amwa.tv, capterra.com, en.wikipedia.org — full list in *Sources*).

Consequences for the quality bar:

| Label used below | Means |
|---|---|
| **FACT (fetched)** | I opened the page myself. Only GitHub pages qualify. |
| **FACT (search-summary)** | Taken from a search-engine summary generated from the named vendor/press page. The URL is real and the claim is attributed to it, but I did **not** render the page. Treat as second-hand. |
| **INFERENCE** | My reasoning from the above. Not a vendor claim. |
| **UNVERIFIED** | I could not confirm it. Stated so explicitly, with what would need checking. |

**Pricing is the weakest area of this dossier.** Not one vendor pricing page could be opened
directly. Every price below is either (a) a search summary of the vendor's own pricing page, or
(b) a search summary of a third-party aggregator (Capterra / SoftwareAdvice / SaaSworthy /
G2 / review blogs). Aggregator prices in this industry are routinely stale or wrong. All prices
carry the date seen (2026-08-28) and a source, and are marked *as advertised* vs
*requires sales contact*. **Re-check every number against the vendor page before it is used for
anything.**

Nothing in this document is invented. Where I had a plausible guess but no source, it says
UNVERIFIED.

---

## Segment summary

**What this category is.** Software that runs the *business and operations* of live and
broadcast production, as distinct from software that runs the *signal*. It splits into four
sub-markets that buyers often confuse but that are architecturally very different:

1. **Facility / resource ERP ("Broadcast Management Systems", BMS).** Books rooms, edit suites,
   studios, OB vans, satellite/fibre circuits, equipment and people against jobs; carries the
   job through to costing, invoicing and cost recovery. Buyers: post houses, service providers,
   broadcasters, transmission/teleport operators. Examples: Xytech (Fabric), ScheduALL,
   farmerswife, Provys.
2. **Editorial / newsroom (NRCS) and rundown.** Story planning, scripting, rundown ordering,
   timing, prompter, and MOS-mediated control of graphics/video/automation. Buyers: news
   organisations, live entertainment, esports, worship, sports. Examples: Octopus, Annova/CGI
   OpenMedia, Ross Inception, Cuez, Sofie, Ontime, Rundown Studio, CuePilot.
3. **Production management for scripted / field ("call-sheet class").** Breakdowns, schedules,
   call sheets, crew onboarding, document distribution. Buyers: production companies, studios.
   Examples: Yamdu, StudioBinder, SetKeeper, Croogloo, SESAM Software.
4. **Rental/logistics ERP that broadcast leans on for kit and crew.** Buyers: rental houses, AV
   and broadcast service providers, OB operators. Examples: Rentman, easyjob (protonic),
   Current RMS, R2/Unique Business Systems, CrewBrain (crew only).

**Who buys.** In practice, three distinct wallets: (i) the *facility* buys the BMS, six figures,
multi-year, sales-led; (ii) the *newsroom/production* buys the NRCS/rundown, often per-seat SaaS;
(iii) the *engineering/ops* department buys nothing in this category at all and runs the
technical layer — signal plans, patch lists, tally, comms — on spreadsheets, Visio, WireCAD and
tribal knowledge. That third gap is the interesting one for AV Planner Suite.

**Typical price band.** INFERENCE from the evidence gathered:

- Tier 1 BMS (Xytech, ScheduALL, Provys, OpenMedia): **no public pricing anywhere**; enterprise
  sales-led, on-prem or hosted, deployment projects. As a scale marker, Xytech's *acquisition of
  the entire ScheduALL business* was reported at **$6m** (Forbes, Feb 2021) — a small market by
  software standards.
- Mid-market production management SaaS: roughly **$25–$100 / user / month**, or a flat team
  plan in the low hundreds. Evidence: Yamdu Flex $45/mo, Yamdu Core $265/mo for 20 users;
  StudioBinder from $42/mo, ~$29/seat/mo; Rentman Suite from €/$39/mo plus per-user modules.
  (All as-advertised figures via aggregators — see caveat above.)
- Per-project enterprise: SetKeeper **from $1,000 per project** (search summary of vendor
  pricing page).
- Open source: **€0** (Sofie MIT, Ontime GPL-3.0, Bitfocus Companion) — and this is where the
  most technically interesting live-production software of the last decade has appeared.

---

## Product table

Offline column definitions used throughout: **"LAN"** = runs entirely on a local network with no
internet; **"Local"** = runs on a single machine with no server; **"Cloud"** = requires internet;
**"Cloud+onprem"** = vendor offers a self-hosted server option.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
|---|---|---|---|---|---|---|
| Xytech (formerly MediaPulse) | Xytech Systems / **Fabric** | Web + mobile UI ("Sky"); on-prem or cloud | Sales contact only, no public pricing | Cloud+onprem (server-based; UNVERIFIED whether any client works disconnected) | **Yes** — REST API + webhooks, Swagger UI shipped with each install (search-summary) | End-to-end facility ERP: jobs, resources, crews, vehicles, labour agreements, billing, cost recovery |
| ScheduALL | Net Insight → Xytech/Fabric (acquired 2021, ~$6m) | Windows client / server | Sales contact only | On-prem | UNVERIFIED | Transmission & circuit booking (the historic strength); now a **migration source** into Xytech, not a growth product |
| farmerswife | farmerswife (ES/DE) | Desktop client + server, iOS app, mobile web; cloud-hosted or onsite | Per-user subscription, monthly/annual + paid add-ons (budgeting, equipment, personnel). Exact figures **not public** | Cloud+onprem (client↔server; UNVERIFIED whether client caches when server unreachable) | **Yes** — REST API, requires ≥ v6.4 and is a **licensed paid feature**; also a MySQL data interface (search-summary) | Mid-market post/broadcast resource + project scheduling with cost tracking; the named "ScheduALL alternative" |
| PROVYS / PROVYS Sphere | PROVYS Technologies (CZ, est. 1995) | Web (Sphere Lite / Pro / Enterprise) | Sales contact only | On-prem/cloud, UNVERIFIED | **Yes** — "Server API", plus BXF data exchange and an Outgress Gateway (FTPS/SMB/S3/HTTPS, SOAP or REST) | Channel & programme management: schema planning, rights, transmission scheduling, production budgeting |
| Annova OpenMedia | ANNOVA Systems (DE, Munich) / CGI | Client + server, mobile editorial | Sales contact only | On-prem; ARD/SWR deployed a **mobile** OpenMedia editorial system (search-summary) | MOS; API UNVERIFIED | Large-scale German-market newsroom: wire search, scripting, rundown, playout control |
| Ross Inception (Inception News / Indigo) | Ross Video (CA) | **Browser-based** NRCS | Sales contact only | Cloud/on-prem server; browser client | MOS device control; REST UNVERIFIED | Browser NRCS with deep MOS: placeholder→object workflow, real-time rundown sync, multi-platform publishing |
| Octopus Newsroom | Octopus (CZ) | Client/server NRCS | Sales contact only | On-prem, UNVERIFIED | **MOS + APIs**, "more than 100 third-party integrations" (vendor claim via search-summary) | Story-centric news production with an unusually broad integration catalogue |
| Aveco ASTRA (Studio / MCR / V Core) | Aveco (CZ, est. 1992) | On-prem, remote and cloud playout | Sales contact only | On-prem | MOS + NRCS plug-ins | Studio *and* master-control automation in one system; move a rundown between studios at the push of a button |
| Cuez (formerly TinkerList) | Cuez by TinkerList (BE); **EVS has invested** | Web (AWS-hosted); Automator control layer; web prompter | Tiers named **Event / Production / Broadcast**; **prices not published — sales contact** | **Cloud** (AWS migration is a documented case study). On-prem/K8s: UNVERIFIED | **Yes** — open API is the core pitch of Cuez Automator (device control) | No-code rundown→device automation; turning a rundown into timed triggers for switcher/graphics/lighting/audio |
| **Sofie** | **NRK (Norwegian public broadcaster)** — open source | Web app; Node/Meteor + MongoDB; Docker/Podman/K8s; gateways on studio LAN | **Free, MIT** | **LAN** — Core self-hosted; playout control deliberately placed at the Playout Gateway *on the local network* to avoid cloud latency (FACT, fetched) | Blueprints plug-in system, DDP/WebSocket, MOS gateway, spreadsheet gateway | Production-grade open-source live TV automation; the best public reference for a rundown data model |
| **Ontime** | cpvalente / Ontime (NO) — open source | **Electron desktop (Win/macOS/Linux)**, Docker self-host, or Ontime Cloud | **Free, GPL-3.0**; optional paid cloud | **Local + LAN** — the strongest genuine offline story in the segment (FACT, fetched) | **Yes** — OSC, HTTP, WebSocket, Bitfocus Companion module | Run-of-show timing for live events: rundown, timers, delays, role-specific views (director/operator/backstage/signage) |
| Rundown Studio | Rundown Studio | Web | Public tiers claimed; **figures UNVERIFIED** (site blocked) | Cloud | UNVERIFIED | Show-caller rundowns with automatic downstream re-timing + built-in scrolling prompter |
| CuePilot | CuePilot (DK) | Cloud + on-site | UNVERIFIED | Cloud, UNVERIFIED | Integrates ~10 apps (Keynote, PowerPoint, QLab, Resolume, vMix, OBS, VLC…) + **OSC bridge to any LAN device** | Frame-accurate pre-planned camera cutting for music/entertainment; live timing workspace |
| Dramatify | Dramatify (SE) | Web | UNVERIFIED | Cloud | Integrations incl. **SPX Graphics** | Production management with a rundown suite aimed at multi-cam live/studio/remote |
| Cinegy Air / Cinegy Convert | Cinegy (DE, Munich) | Windows software playout on COTS servers; VMware/Hyper-V/Citrix; AWS Marketplace | Sales contact only | **On-prem by design** (1+1 redundancy across two playout servers) — note the vendor's word *"offline"* here means **"not on air"** (playlist prep), **not** "without internet" | UNVERIFIED (control/automation interfaces exist; not confirmed) | Software-defined playout on standard hardware, mixed-format/mixed-resolution to air |
| m.a.x. it PSPL | m.a.x. Informationstechnologie AG (DE) | Enterprise on-prem | Sales contact only | On-prem | Interfaces to Aveco, Pixel Power, MAM, Resy, Plan1, GfK (search-summary) | German public-broadcaster programme & transmission planning (MDR, KiKA, ARD-Sendezentrum) |
| Convit *Newsmind Stories* (WDR "Plan.R") | Convit GmbH (DE, Köln; Fraunhofer IAIS spin-off 2015) | Web | Sales contact only | Cloud/on-prem, UNVERIFIED | UNVERIFIED | Cross-media editorial/topic planning across TV, radio, web, social; resource planning at editorial level |
| Rentman | Rentman (NL) | Web + iOS/Android crew & warehouse app | **As advertised**: platform **from €39/month**; Crew Essential from **$14/user/mo**; Inventory from **$19/user/mo**; 30-day free trial (aggregator summaries; currency inconsistency unresolved) | Cloud. **Offline behaviour of the scanning app: UNVERIFIED** — vendor docs on this could not be opened | **Yes** — public API (already integrated by cable-planner via `rentman:*` IPC) | Equipment + crew + transport planning for AV/event/broadcast rental, with QR/barcode warehouse flow |
| easyjob | protonic software GmbH (DE, München) | Windows client/server ERP; editions S/M/L/XL | **No public pricing** (vendor does not publish; OMR Reviews). A *used-licence* marketplace listing showed "easyjob 6M Lizenz — 1700 EUR" — secondary market, not a vendor price | On-prem | UNVERIFIED | The de-facto German rental ERP for event/AV/broadcast: multi-location, multi-tenant, inquiry→invoice |
| CrewBrain | CrewBrain (DE) | Web + mobile app | 30-day free trial; **price UNVERIFIED** | Cloud | UNVERIFIED | Crew/personnel disposition for event & broadcast technique: multi-day projects, freelancers, vehicles, rooms, time tracking |
| Yamdu | Yamdu (DE, München) | Web | **As advertised** (aggregators): Flex **$45/mo** (1 user, 1 project, 25 GB; +$22/user, +$45/project), Core **$265/mo** (20 users, unlimited projects), 14-day trial | Cloud | UNVERIFIED | All-in-one scripted/commercial production office: cast & crew, schedule, docs, props, budget |
| StudioBinder | StudioBinder (US) | Web | **As advertised** (aggregators): from **$42/mo** Starter, **$85/mo** Indie, ~**$29/seat/mo** | Cloud | UNVERIFIED | Breakdown → shooting schedule → call sheet automation (weather, nearest hospital auto-filled) |
| SetKeeper | SetKeeper (FR, Paris) | Web | **From $1,000 per project** (search summary of vendor pricing page); free trial | Cloud | UNVERIFIED | Studio-vetted secure document distribution, watermarking, eSignature onboarding, audit logs |
| Wildmoka | Wildmoka (FR) | Cloud | Custom, **sales contact** | Cloud | UNVERIFIED | AI/assisted live clipping and hyper-distribution of live streams to social/OTT |
| Blackbird | Blackbird plc (UK) | Browser, cloud-native, Blackbird codec proxy | **Not published**. (A "$980/month" figure circulating in search results belongs to **blackbird.io**, an unrelated localisation-workflow company — do not cite it) | Cloud (low-bandwidth by design) | UNVERIFIED | Fast remote/cloud editing on thin bandwidth for live highlights |
| Skyline DataMiner (SRM) | Skyline Communications (BE) | On-prem/hybrid platform | Sales contact only | On-prem | Extensive connector ecosystem; Job Manager connector documented | **Resource booking as infrastructure**: book resources ahead to avoid conflicts, then auto-configure and route the signals |
| Ross DashBoard | Ross Video (CA) | Windows/macOS/Linux desktop | **Free** (vendor states free) | **Local/LAN** — control panels talk to devices on the production network | openGear / DashBoard Connect ecosystem | Free custom operator dashboards and device control panels for a facility or truck |
| Bitfocus Companion | Bitfocus (NO) — open source | Desktop, Win/macOS/Linux + Stream Deck & surfaces | **Free, open source** (licence UNVERIFIED) | **Local/LAN** | **700+ modules**; triggerable via OSC, TCP, UDP, HTTP, WebSocket, ArtNet | The de-facto control surface layer of live production; the integration bus everyone actually has on site |
| SESAM Software | SESAM Software GmbH (DE, Berlin, since 1986) | Windows | Sales contact only | On-prem | UNVERIFIED | German film/TV **Disposition** and dubbing scheduling, contract management, film accounting (long-tail incumbent) |
| WireCAD | WireCAD (US) | Windows desktop, standalone (not a CAD plug-in) | **As advertised**: subscription and perpetual SKUs listed in vendor shop; **exact figures UNVERIFIED** (page blocked) | **Local** | UNVERIFIED | The incumbent for cable/connection documentation, auto cable numbering, rack layouts, labels, BOM |

*(29 products. The seeds "Sesam TV / Sesam Vision" could not be confirmed as a real broadcast
product — see UNKNOWNS.)*

---

## Deep dives

### 1. Sofie (NRK) — the open-source reference implementation

**FACT (fetched, github.com).**

**What it does.** A web-based TV studio automation system, in daily live news production at NRK
since September 2018, and — per the project's own README — also used by the BBC and TV 2 Norway.
MIT licensed. `sofie-core` has ~345 stars, 15,474 commits on main, and is actively maintained.

**Architecture.** `Sofie Core` is a Meteor/Node.js web server on **MongoDB**. Gateways and web
clients connect over **DDP**, Meteor's WebSocket protocol, used for both RPC *and* state
synchronisation. The monorepo holds `/meteor`, `/packages`, `/scripts`, `/resources`. Deployment
is Docker-first (official images on Docker Hub); Podman, Kubernetes, Salt and Ansible are
supported as long as OCI containers are used. The docs are explicit that the quick
`docker compose` path is **not** a production deployment, and that production adds logging
(logstash/Kibana), NGINX, and resource monitoring.

**Data model** (this is the part worth stealing):

```
System → Studio → Show Style (+ Show Style Variants)
RundownPlaylist → Rundown → Segment → Part → Piece
                                          ↘ AdLib Piece (manually triggered, part-local or global)
```

- **Studio** = the physical rig. Only one rundown can be active per studio at a time.
- **Show Style** = how content is interpreted and presented; Variants reuse the interaction model
  with different assets.
- **Segment** = a chapter/subject. **Part** = the unit that plays on a TAKE. **Piece** = what
  actually happens (VT, camera cut, graphic, script), carrying **timeline-objects**.
- **Timeline** = a collection of timeline-objects forming a **target state** for playout —
  declarative, not imperative.

**Integrations.** Blueprints are plug-ins running *inside* Core in three tiers (System, Studio,
Showstyle) that ingest NRCS data and emit Segments/Parts/Timelines. Ingest gateways include
**MOS** and a **Google Spreadsheet** gateway. Device support lives in sibling repos:
`sofie-timeline-state-resolver`, `sofie-atem-connection` (154 stars),
`sofie-emberplus-connection`, `sisyfos-audio-controller`, `sofie-casparcg-launcher`,
`sofie-quantel-gateway` (C++, GPL-2.0), `sofie-input-gateway`, `sofie-package-manager`.

**Notable strength (directly relevant to OB).** The docs state that placing playout control at
the **Playout Gateway on the local network** reduces the latency problems inherent to cloud
deployments, while still allowing free navigation of the rundown without on-air risk. This is the
segment's clearest articulated *architecture* argument for local execution — not marketing, a
design rationale.

**Notable limits.** It is a client/server web app: "offline" means "your own server on your own
LAN", not "works on one laptop with the network down". Meteor + MongoDB is a heavy stack for a
truck. It is studio automation — it has **no** notion of crew rosters, equipment allocation,
cabling, budgets or rental integration.

---

### 2. Xytech / Fabric (MediaPulse + ScheduALL) — the incumbent facility ERP

**FACT (search-summary).**

**What it does.** MediaPulse is the long-standing facility-management platform for studios,
networks, post houses and transmission facilities: scheduling, asset management, resource
allotment, personnel, equipment, financials — described as **30+ integrated, highly configurable
modules**, including project management, rental management, asset management and personnel
scheduling. MediaPulse **Transmission** targets circuit management for the broadcast sector.
MediaPulse **Sky** is the mobile interface. MediaPulse 2022 added a **Resource Capacity
Management** module (scenario planning, automated resource selection) and a Budgeting module.

**Corporate history — important, because it changes the buying picture.**
- Feb 2021: Xytech announced acquisition of **ScheduALL** from Net Insight; **reported at $6m**
  (Forbes). Completed April 2021.
- **2024-08-30**: the Fabric/Xytech transaction completed; the combined company operates as
  **Fabric**, with **Xytech** as the media-operations product line (`fabricdata.com/xytech-media`,
  `fabricdata.com/xytech-operations`, `helpcenter.fabricdata.com`). Note a **source conflict**:
  TV Tech and Banneker Partners describe a *merger*; the Fabric help-centre article is summarised
  as an *acquisition of Fabric by Xytech*, then rebranded to Fabric. Direction of the transaction
  is UNVERIFIED; the *outcome* (one company, branded Fabric, Xytech as product) is consistent
  across sources.
- ScheduALL is now positioned as a **migration source**: Xytech 2025 releases **11.1** and
  **11.2** are explicitly described as supporting ScheduALL customers migrating, 11.2 including
  transmission/dynamic-bandwidth scheduling. A competitor blog (farmerswife) asserts ScheduALL is
  "discontinued… without updates or long-term support" — that is a **competitor claim**, treat as
  marketing, but it is directionally consistent with the vendor's own migration messaging.

**Data model.** Job-centric: documents named e.g. `JmJob` (Job Maintenance) and `LibMaster`
(Media Asset Maintenance), surfaced under System → Document Customizations → Search. INFERENCE:
this is a classic configurable-document ERP, closer to Dynamics/JD Edwards in shape than to a
modern REST-first product.

**Integrations / API.** REST APIs and a mobile UI were introduced at IBC 2018 alongside a
"MediaPulse Development Platform". **Swagger UI ships with each MediaPulse installation** and the
spec can be pulled as plain YAML. Triggered messaging, parameter-based alerts and automated
report delivery are included. Webhooks are documented at `xytechsystems.github.io/documentation`.
Public PDFs exist (`mp.xytechsystems.com/support/MediaPulse_Rest_API_Introduction_V1.0.pdf`,
`MediaPulse 7 API Guide`) but could not be opened here.

**Strengths.** Nothing else in the segment carries a job from *booking a truck and a crew* through
*labour agreements* to *invoice and cost recovery*. Transmission/circuit scheduling is a genuine
moat.

**Limits.** No public pricing, no self-serve, deployment-project sales motion. INFERENCE: an OB
department wanting to document a signal plan will never be given a MediaPulse licence to do it.

---

### 3. farmerswife — the mid-market resource scheduler, and the API story

**FACT (search-summary).**

**What it does.** 25+ years old; positions across production, post, broadcasting, equipment
rental, agencies and education. Standard feature set: unlimited resource scheduling, project
management, cost tracking, invoicing, unlimited contact/freelance database. Broadcast-specific
pitch: studio and crew scheduling, real-time production status, **conflict detection to prevent
double-bookings**, mobile apps and calendar sync. Paid add-ons: budgeting, equipment management
and tracking, advanced personnel management.

**Deployment.** Cloud-hosted (managed instance with backup/monitoring/updates) **or onsite**.
Classic server + desktop client architecture, plus an **iOS app pointed at your own server
instance** and a mobile web app.

**API.** A **REST API** exists for third-party integration: GET / PUT / POST against
farmerswife data. Two conditions matter: it requires **server ≥ v6.4**, and it is a **licensed,
paid feature** — not included by default. There is additionally a **MySQL data interface** option
for extraction. (Source: `support.farmerswife.com` articles, via search summary.)

**Strengths.** It is the product most often named as the ScheduALL replacement; onsite deployment
plus a self-hosted iOS client is a rare combination in 2026. Conflict detection on shared
resources is the core value.

**Limits.** Pricing not public (per-user subscription; figures unobtainable here). The REST API
being a paid add-on is a real friction point for anyone planning an integration. Whether the
desktop client degrades gracefully when the server is unreachable: **UNVERIFIED** — this is the
single most important thing to test for an OB use case.

---

### 4. Cuez (TinkerList / EVS) — rundown as an automation source

**FACT (search-summary).**

**What it does.** A cloud, collaborative script + rundown tool for broadcasters, live events and
esports. Three components matter: the **collaborative script/rundown editor**, **Cuez Automator**
(a no-code control layer that turns the rundown into timed, actionable triggers for cameras,
playout, graphics, lighting and audio via an open API), and a **web-based prompter**.
Launched at IBC 2023 as, in the vendor's words, "the world's first cloud-based rundown management
system"; **STORIEZ** is a later newsroom-oriented product. **EVS has invested in Cuez.**

**Deployment.** TinkerList migrated to **AWS** with partner Cloudar specifically to auto-scale
rather than provision for peak (AWS case study). On-prem or Kubernetes deployment for a truck:
**UNVERIFIED — nothing found either way.** For an OB van with no internet this is the decisive
unknown.

**Pricing.** Tiers are named **Event**, **Production**, **Broadcast**; **no figures published** —
sales contact. (`cuez.app/pricing`, page blocked here, confirmed by search summary.)

**Strengths.** The rundown-as-trigger-source model is the right abstraction: one authored
document drives the show *and* the machines, no-code, over an open API. The prompter being part
of the same document removes a whole class of desync.

**Limits.** Cloud-native is a feature in a studio and a liability in a truck. INFERENCE: without
a documented local/on-prem mode, Cuez is unusable as the *primary* show-control layer at a venue
with unreliable uplink — which is exactly where OB lives.

---

### 5. Ontime — the offline-first outlier

**FACT (fetched, github.com).**

**What it does.** Free, **GPL-3.0**, open-source rundown and event-timer software for live
productions. ~943 stars / 117 forks. Rundown with cues, notes, grouping and planned timing;
import from Excel or Google Sheets; delay handling; and **role-specific views** for directors,
operators, backstage and signage. It can be driven by an operator or run standalone off the
system clock.

**Deployment — the important bit.** Ships as an **Electron desktop app for Windows, macOS and
Linux**, as a **Docker** image for self-hosting, and as an optional hosted **Ontime Cloud**.
Distribution via direct download, Docker Hub, NPM and Homebrew. This is the only product found in
the whole segment that a single person can run on a laptop in a truck, with the venue network
down, and still serve rundown views to everyone else over the local network.

**Integrations.** **OSC, HTTP, WebSocket**, plus a **Bitfocus Companion** module (which in turn
reaches vMix, disguise, QLab, OBS and ~700 other modules). MIDI: not mentioned.

**Strengths.** Offline-first by construction; role-based views instead of one god-view; an
integration surface that assumes it is one component among many rather than the system of record.
Cloud revenue funds the open-source core rather than gating it.

**Limits.** It is a *timing* tool. No crew, no equipment, no budget, no tech docs, no MOS. It
solves one slice extremely well and knows it.

---

### 6. Rentman — the rental-ERP bridge (and the one already wired into cable-planner)

**FACT (search-summary).**

**What it does.** Operations platform for event production, AV rental, broadcast and warehouse
teams: quotes, equipment planning, crew planning, transport, project data, invoicing.
Broadcast-specific page exists (`rentman.io/industries/media-broadcasting-management-software`).
Equipment tracking via **QR and barcode**, multiple equipment locations, repairs and losses.
Crew module: build schedules, **request crew availability**, track worked hours, share job
instructions. Mobile app on iOS/Android and **Android Zebra scanners**; scan to pack/return,
capture signatures, log damages.

**Pricing (as advertised, seen 2026-08-28 via aggregators — verify).** Platform **from €39/month**;
**Crew Essential from $14/user/month**; **Inventory from $19/user/month**; **Rentman Suite $39/month
with 1 free Power user**; 30-day free trial, no card. Note the unresolved **€/$ inconsistency**
between sources — the vendor page would settle it.

**API.** Public API exists and is already consumed by **cable-planner** (`rentman:*` IPC domain,
token in the OS credential store via keytar). That makes Rentman the suite's existing bridge from
*planned* gear to *actually-booked* gear.

**Strengths.** It is the only product in this table that natively holds *both* the equipment list
and the crew roster at a price an OB service provider will actually pay, with an API that does
not require a licence upgrade.

**Limits.** Cloud. **Offline behaviour of the mobile scanning app is UNVERIFIED** — I could not
open `support.rentman.io`. For a truck this matters enormously: a warehouse scan flow that needs
connectivity is useless in a stadium basement. *This is the single highest-value verification
item in this dossier for the suite.*

---

## Standards & protocols

| Standard / format | What it is | Relevance here |
|---|---|---|
| **MOS (Media Object Server) Protocol** | The interchange between an NRCS and devices (graphics, video servers, automation, prompters). Tagged text / **XML** per the MOS DTD. **v2.8.x** is the long-lived deployed family (2.8.4, 2.8.5); **v4.0** is current. Classic transport: **TCP 10540** ("MOS Lower Port" / media-object metadata, NCS accepts from devices) and **TCP 10541** ("MOS Upper Port" / running order, MOS accepts from NCS). **MOS 4.0 replaces those with WebSocket connections on channels `mom` and `ro`**, driven by security concerns in modern newsrooms. Spec: mosprotocol.com. | The lingua franca of rundown-to-device. Sofie ships a MOS gateway; Inception, Octopus, OpenMedia, ASTRA all speak it. If AV Planner Suite ever wants a rundown to see the signal plan, MOS is the door — though MOS carries *media objects and running orders*, **not** infrastructure or cabling. |
| **BXF — SMPTE ST 2021 (Broadcast eXchange Format)** | XML messages for interchange of broadcast schedules (playout and record), **as-run** information, and content metadata (Content ID, title, duration). v1.0 published 2008; ST 2021-1 is the master document; EG 2021-3 use cases, EG 2021-4 schema documentation. Intended users: programme management, traffic, master-control automation, content distribution. | The scheduling-side interchange format. **PROVYS explicitly builds on BXF.** Relevant if the suite ever needs to emit or consume a facility schedule. |
| **AMWA NMOS (IS-04, IS-05, IS-06…)** | The control plane for IP media. **IS-04** = discovery and registration of Nodes; **IS-05** = connection management between Nodes; **IS-06** (pending) = network control, letting a broadcast controller see topology and create/retrieve/update/delete flows. Specs at specs.amwa.tv. | **SMPTE ST 2110** transports video/audio/ANC as RTP but says nothing about how devices find or connect to each other — NMOS fills that. For an IP-era cable/signal planner, NMOS is the machine-readable equivalent of a patch list. |
| **SMPTE ST 2110** | Uncompressed video, audio and ancillary data as separate RTP essence streams over IP. | The infrastructure the modern OB truck is built on; the reason "cable planning" is becoming "flow planning". |
| **Ember+** | Device control/monitoring protocol (Lawo-originated, broadly adopted). Sofie ships `sofie-emberplus-connection`. | A realistic control-plane target for reading real device state into a plan. |
| **OSC / HTTP / WebSocket / TCP / UDP / ArtNet** | The lowest-common-denominator control set. Ontime speaks OSC/HTTP/WebSocket; Bitfocus Companion is triggerable over OSC, TCP, UDP, HTTP, WebSocket and ArtNet. | The pragmatic integration surface. Anything that speaks OSC + HTTP is instantly usable on site. |
| **iCal / CSV / XLSX / Google Sheets** | The actual interchange formats of production planning. Ontime imports rundowns from **Excel or Google Sheets**; Sofie has a **spreadsheet gateway** as a first-class ingest path. | INFERENCE, but strongly evidenced: even the best open-source systems accept that the source of truth often starts life as a spreadsheet. Any planner that cannot import/export a sane sheet will lose. |
| **Swagger / OpenAPI (YAML)** | Xytech ships Swagger UI with each install and exposes the spec as plain YAML. | The realistic integration contract with a Tier-1 BMS. |
| **GraphML** | Graph interchange. Already an IPC domain in cable-planner (`graphml:*`). | Nothing in *this* segment uses it — noted because it is the suite's existing structural-export path and no competitor here has an equivalent. |

**Not a standard, but behaves like one: Bitfocus Companion.** Free, open source, **700+ modules**
(ATEM, vMix, OBS, QLab, …), a built-in Stream Deck emulator and a touch web page, triggerable
over OSC/TCP/UDP/HTTP/WebSocket/ArtNet. INFERENCE: on a live production floor, "has a Companion
module" is closer to a de-facto interoperability requirement than most SMPTE documents.

---

## What this segment does WELL — patterns worth stealing

1. **Resource conflict detection as the core primitive.** farmerswife sells "conflict detection to
   prevent double-bookings"; DataMiner's Resource Scheduling exists so "operators can book
   resources ahead of time to avoid resource conflicts"; Xytech added Resource Capacity Management
   with scenario planning. The unit of value is not the calendar — it is *the refusal to let two
   things claim the same resource*. A cable/camera/light planner has the same primitive available
   (one port, one cable, one fixture, one operator) and mostly does not enforce it.

2. **Booking → automatic configuration.** DataMiner reserves resources (including third-party and
   *offline* resources) and then **automatically deploys and configures** them and routes the
   signals. The plan is not a document about the world; it is the instruction that creates the
   world. This is the single most valuable idea in the segment.

3. **Declarative target state, not imperative commands.** Sofie's Timeline is "a collection of
   timeline-objects forming a target state for playout". Diffing a desired state against actual
   state is why Sofie can jump around a rundown without breaking air. A signal plan is also a
   target state — and a router that can be told to converge to it is a very short step.

4. **Local execution for latency- and reliability-critical control.** Sofie deliberately puts
   playout control at a gateway on the local network. Ontime ships a desktop app. Ross DashBoard
   is a free local desktop panel. The best-engineered products in the segment all decided the
   control layer belongs on site.

5. **Role-specific views over one shared document.** Ontime renders dedicated views for director,
   operator, backstage and signage. Cuez ships a prompter view of the same rundown. Inception
   shows MOS objects "brightly coloured and iconified" in a dedicated column beside the script.
   One model, many render targets, is how you get a crew to actually use a plan.

6. **Plug-in interpretation layers.** Sofie's Blueprints (System / Studio / Showstyle) separate
   *what the data means* from *what the system does*, so one Core serves many shows. Cuez's
   Automator is the no-code version of the same idea.

7. **Portable show definitions.** Aveco ASTRA can move a rundown from one studio to another "at
   the push of a button" (multi-studio production automation). Sofie's Show Style Variants reuse
   the interaction model with different assets. The equivalent for AV Planner Suite is obvious and
   unbuilt: *the same show, retargeted onto a different truck.*

8. **Meeting the spreadsheet where it is.** Sofie has a spreadsheet gateway; Ontime imports Excel
   and Google Sheets. Nobody wins by refusing the CSV.

9. **The generated artefact is the product.** StudioBinder's call sheets pull crew, locations,
   schedule, weather and nearest hospital automatically; WireCAD auto-assigns cable numbers and
   emits labels, BOMs and rack layouts. Users buy the printable thing, not the database.

---

## What NOBODY in this segment solves well — the white space

Each item is stated as INFERENCE from the absence of evidence, with the check that would falsify
it.

1. **True offline-first operation.** Only **Ontime** (Electron desktop, GPL-3.0) and the free
   control-plane tools (**Ross DashBoard**, **Bitfocus Companion**) genuinely run with the internet
   gone. Sofie needs your own server; Cuez is AWS; Rentman, Yamdu, StudioBinder, SetKeeper,
   Dramatify, Rundown Studio are cloud; farmerswife and Xytech are client/server and their
   disconnected behaviour is undocumented. *Falsify by:* opening `support.rentman.io` and the
   farmerswife client docs for cached/offline modes.
   Note the vocabulary trap: **Cinegy uses "offline" to mean "not on air"** (preparing playlists),
   not "without internet". Vendors in this segment reuse the word; do not read it as network
   independence.

2. **The technical layer is missing entirely.** Not one product in this table models a **signal
   path, a patch, a cable, a connector type, a rack unit, an intercom panel key, a tally
   assignment or a camera position**. The BMS books "an OB van" as an opaque resource with a price
   and a labour agreement; what is *inside* the van is out of scope. WireCAD models the inside and
   knows nothing about the booking. **This gap is the single clearest opportunity for the suite:
   nobody joins the commercial plan to the technical plan.**

3. **Tech riders and technical documentation are unautomated.** The tooling found for technical
   riders is either generic (RiderForge, aimed at sound engineers producing a PDF) or a blog post
   telling you what to put in the document. A rider is a *derived view* of an equipment list, a
   signal plan, a power plan and a crew list — every one of which exists in some system already —
   and yet everyone retypes it into a Word file. Compare StudioBinder's call sheet, which *is*
   generated from the schedule. **Nobody has done the StudioBinder-call-sheet trick for the
   technical rider.**

4. **No bridge between rental ERP and the technical plan.** Rentman/easyjob know serial numbers,
   availability and who is carrying the case. The signal plan knows which SDI output of *which*
   camera feeds which frame input. Nothing reconciles them, so the same gear list is maintained
   twice and diverges by load-in. *Falsify by:* finding any rental ERP with a signal/port model —
   I found none.

5. **Comms (intercom) planning is a vendor island.** Riedel Director configures ARTIST/PERFORMER
   matrices with drag-and-drop, programmable logic and markers — but it is a *device configuration
   tool*, not a production-planning tool, and it is Riedel-only. There is no vendor-neutral way to
   plan "who needs to hear whom on this show" and then emit both a Riedel config and a Clear-Com
   config and a crew-readable panel legend. **This is unclaimed ground.**

6. **Retargeting a show onto different infrastructure.** ASTRA moves a rundown between *studios*;
   Sofie separates Show Style from Studio. Nothing does the equivalent for an OB brief:
   "this football show, but in Truck B, which has 12 fewer inputs and a different router" — and
   tell me what breaks. INFERENCE: this is the highest-value unsolved planning problem in OB.

7. **The dashboard and the plan are different products.** DataMiner, Ross DashBoard and
   multiviewers show live status; the BMS shows the booking; nothing shows *the plan overlaid with
   reality* — "port 14 was planned for Cam 5 and is currently carrying nothing". *Falsify by:*
   finding a product that ingests a planned signal path and diffs it against NMOS/Ember+ live
   state. I found none.

8. **Pricing opacity and the SME gap.** Xytech, ScheduALL, Provys, OpenMedia, Octopus, Aveco,
   Cinegy, easyjob, CrewBrain and Cuez all publish **no prices**. A three-truck regional OB
   operator or a 15-person facility is effectively priced out of, or exhausted by, the entire
   Tier-1 tier — and lands on Excel. The successful mid-market entrants (Rentman, Yamdu,
   StudioBinder) all publish numbers.

9. **API access as a paid upsell.** farmerswife's REST API requires ≥ v6.4 **and a licence**.
   INFERENCE: this actively suppresses the integration ecosystem that would make the product
   stickier, and it is a reason integrators reach for the MySQL interface or a scraper instead.

10. **German-market specificity is served by monoliths, not tools.** m.a.x. it (PSPL at MDR/KiKA,
    ARD-Sendezentrum), Convit (Plan.R at WDR, NDR partnership), Annova/CGI OpenMedia (ARD/SWR),
    SESAM Software (Berlin, since 1986). These are deep, integration-heavy, broadcaster-scale
    systems. There is **no German-market small/mid tool** between "Excel" and "an ARD-grade
    planning system" for the technical side of a production. INFERENCE, but the search evidence is
    consistent: a German-language search for OB/broadcast production disposition software returns
    generic manufacturing PPS tools, which is what an underserved market looks like.

---

## Relevance to AV Planner Suite

Mapping to: `cable-planner`, `multicam-planner`, `light-planner`, `shell/suite`,
`broadcast-intercom`, `tally-pi`, `sony-camera-bridge`, `pi-media-station`.

**Strategic read (INFERENCE).** The suite is *not* competing with this segment — it is the missing
technical half of it. Every product above books resources and schedules people; none of them
describes the signal. The suite already has: offline-first local files, an inventory format
(`packages/inventory-core`), a Rentman integration (`rentman:*`), NetBox (`netbox:*`), GraphML
export, ATEM and Videohub live control, and a shell that unifies three planners. That is a
credible foundation for the one thing the segment cannot do: **hold the technical truth of a show
and hand every other system a derived view of it.**

### `cable-planner` — highest relevance
- **Steal:** Sofie's declarative **target state** model (a signal plan is a target state; the
  Videohub/ATEM control already in the app is the state-resolver). Steal DataMiner's
  **booking → auto-configure → route** loop as the long-term ambition.
- **Steal:** StudioBinder's generated call sheet, applied to **tech riders** — derive the rider,
  patch list, label sheet and BOM from the project rather than maintaining a parallel document.
  WireCAD already proves the artefact side (auto cable numbers, labels, BOM, rack layouts); nobody
  has combined it with a live-verifiable plan.
- **Close the ERP gap:** the existing `rentman:*` integration is the segment's missing bridge.
  Highest-value next step: reconcile planned equipment against Rentman availability/serials and
  surface conflicts the way farmerswife surfaces double-bookings.
- **Verify first:** Rentman mobile/API offline behaviour (`support.rentman.io`) — it decides
  whether the bridge is usable in a truck.
- **Standards to consider:** NMOS IS-04/IS-05 for reading real device topology; Ember+ for device
  state; BXF only if the suite ever talks to a facility scheduler.

### `broadcast-intercom` — highest strategic upside, lowest competition
- White space #5 is directly addressable. Riedel Director is powerful and Riedel-only. A
  **vendor-neutral comms plan** (who talks to whom, per role, per show) that emits a
  Riedel/Clear-Com-shaped config *and* a printable panel legend *and* feeds the tech rider has no
  incumbent. Sofie's `sofie-emberplus-connection` is a working reference for the control side.

### `tally-pi` + `sony-camera-bridge`
- These are the suite's "reality" sensors. White space #7 — *plan overlaid with live state* — is
  where they earn their place: a planned camera→tally→router mapping that the shell can diff
  against what the hardware reports. No product found does this.
- **Steal:** Bitfocus Companion's posture — be triggerable over OSC/HTTP/WebSocket and *ship a
  Companion module*. On a live floor that is closer to a requirement than a nice-to-have.

### `multicam-planner`
- Nearest competitive pressure comes from rundown/timing tools that already know the show order
  (Ontime, CuePilot, Cuez). CuePilot's pre-planned camera cutting is the closest adjacent product
  to a camera plan that anyone actually runs on air.
- **Steal:** role-specific views (director / operator / backstage / signage) from Ontime — a camera
  plan for the DoP, for the vision engineer and for the runner are three different documents from
  one model.
- **Steal:** Sofie's Studio/Show-Style split as the model for white space #6 — retarget the same
  show onto a different truck and report what breaks.

### `light-planner`
- Weakest overlap with this segment (lighting planning is a different landscape: MA3, Capture,
  WYSIWYG, Vectorworks). Relevant borrowings are the generic ones: conflict detection, derived
  paperwork, ArtNet/OSC triggerability.

### `shell` / suite
- **Positioning:** own the phrase this segment has vacated — *technical documentation and signal
  truth for live production*, offline-first, local files, MIT. The commercial layer is taken and
  well defended; the technical layer is empty.
- **Pricing posture (INFERENCE):** the segment's mid-market winners publish prices and the Tier-1
  vendors do not. Free/MIT with optional paid integrations is a defensible position precisely
  because the incumbents cannot follow.
- **Interop posture:** be the *source* others read. Publish a documented local HTTP/WebSocket
  surface and a Companion module rather than waiting to be integrated. Note farmerswife charging
  for API access as the anti-pattern to avoid.
- **Import posture:** accept the spreadsheet. Sofie and Ontime both do, and they are the two
  best-engineered products in the field.

### `pi-media-station`
- Lowest relevance to this segment. The only transferable pattern is Ontime's **signage view** —
  a role-specific read-only render of the shared plan, pushed to a screen on site.

---

## Sources

### Pages I actually opened (WebFetch succeeded)
- https://github.com/Sofie-Automation/Sofie-TV-automation
- https://github.com/Sofie-Automation/sofie-core
- https://github.com/Sofie-Automation/sofie-core/blob/main/CHANGELOG.md
- https://github.com/Sofie-Automation
- https://github.com/orgs/Sofie-Automation/repositories?q=gateway&type=all
- https://github.com/Sofie-Automation/sofie-core/blob/main/packages/documentation/docs/user-guide/installation/installing-sofie-server-core.md
- https://github.com/Sofie-Automation/sofie-core/blob/main/packages/documentation/docs/user-guide/concepts-and-architecture.md
- https://github.com/cpvalente/ontime

### Pages I attempted to open and could NOT (blocked by network egress policy)
Each of these was a deliberate attempt; the claim attributed to it below therefore rests on a
search-engine summary, not a direct read.
- https://farmerswife.com/pricing/
- https://cuez.app/pricing/
- https://rentman.io/pricing
- https://www.capterra.com/p/144616/Rentman/pricing/
- https://www.xytechsystems.com/mediapulse/
- https://xytechsystems.github.io/documentation/
- https://documentation.rossvideo.com/files/Brochures/Newsroom%20Control%20Systems/Inception%20News/Inception%20News%20Brochure.pdf
- https://docs.dataminer.services/user-guide/Standard_Apps/SRM/Introduction_to_SRM.html
- https://open.cinegy.com/products/air/26.2/air/user-manual/playout-system/
- https://rundownstudio.app/
- https://dramatify.com/features/rundowns
- https://sofie-automation.github.io/sofie-core/docs/about-sofie/
- https://specs.amwa.tv/nmos/branches/main/docs/FAQ.html
- https://en.wikipedia.org/wiki/Media_Object_Server

### URLs surfaced and summarised by search (attributed, not directly read)

**Xytech / ScheduALL / Fabric**
- https://www.xytechsystems.com/xytech-systems-announces-acquisition-of-scheduall-is-complete-strengthening-facilities-management-transmission-offerings/
- https://www.forbes.com/sites/marksparrow/2021/02/24/broadcast-facilities-specialist-xytech-acquires-scheduall-for-6m/
- https://hpaonline.com/xytech-systems-acquires-scheduall-enhances-facility-management-scalability-transmission-offerings/
- https://hpaonline.com/xytech-launches-mediapulse-2022/
- https://postperspective.com/xytechs-mediapulse-2022-adds-scheduall-features/
- https://marketplace.microsoft.com/en-us/product/saas/xytech.xytech_mediapulse?tab=overview
- https://www.tvtechnology.com/the-wire-blog/xytech-mobile
- https://www.xytechsystems.com/xytech-introduces-new-mobile-ui-rest-apis-for-mediapulse-at-ibc-2018/
- https://mp.xytechsystems.com/support/MediaPulse_Rest_API_Introduction_V1.0.pdf
- https://mp.xytechsystems.com/support/MediaPulse%207%20API%20Guide.pdf
- https://www.tvtechnology.com/news/fabric-xytech-systems-to-merge
- https://www.bannekerpartners.com/announcement/fabric-and-xytech-systems-announce-strategic-merger/
- https://helpcenter.fabricdata.com/hc/en-us/articles/32643722710171-Xytech-2025-Release-Introduction-11-1
- https://helpcenter.fabricdata.com/hc/en-us/articles/34720532531227-Xytech-2025-Release-Introduction-11-2
- https://www.fabricdata.com/xytech-operations
- https://www.fabricdata.com/xytech-media

**farmerswife**
- https://farmerswife.com/broadcasting/
- https://farmerswife.com/scheduling/
- https://support.farmerswife.com/support/solutions/articles/17000089578-the-farmerswife-server-s-rest-api-for-your-own-3rd-party-integrations
- https://support.farmerswife.com/support/solutions/articles/17000057059-does-farmerswife-offer-an-api-
- https://support.farmerswife.com/support/solutions/articles/17000054114-farmerswife-architecture-and-data-flow
- https://support.farmerswife.com/support/solutions/articles/17000114946-farmerswife-cloud-hosting
- https://blog.farmerswife.com/find-out-more-about-the-best-scheduall-alternative

**Newsroom / rundown / automation**
- https://www.rossvideo.com/products/media-workflow/inception-news/
- https://www.rossvideo.com/use-cases/mos-newsroom-workflows/
- https://www.rossvideo.com/products/automation-and-control/dashboard/
- https://www.octopus-news.com/
- https://www.octopus-news.com/octopus-12/
- https://www.aveco.com/en/products/detail/18/astra-studio
- https://www.aveco.com/en/products/detail/12/astra-mcr
- https://www.aveco.com/en/solutions/detail/8/studio-automation
- https://www.cgi.com/en/solutions/openmedia
- https://www.vizrt.com/technical-partner/scisys/
- https://www.tvtechnology.com/equipment/annovas-openmedia-delivers-world-cup-news
- https://cuez.app/
- https://cuez.app/automator/
- https://cuez.app/cuez-by-tinkerlist-at-ibc2023-the-worlds-first-cloud-based-rundown-management-system/
- https://cuez.app/evs-invests-in-tinkerlist-a-game-changer-for-media-production/
- https://aws.amazon.com/partners/success/tinkerlist-cloudar/
- https://www.softwareadvice.com/product/502517-TinkerList/
- https://rundownstudio.app/blog/five-remote-production-challenges-and-how-to-overcome-them/
- https://cue-pilot.com/
- https://dramatify.com/broadcasting-software
- https://dramatify.com/features/rundowns
- https://www.advanced-television.com/2025/05/28/dramatify-launches-ai%E2%80%91powered-rundown-suite/
- https://sofie-automation.github.io/sofie-core/docs/user-guide/concepts-and-architecture/
- https://www.getontime.no/
- https://docs.getontime.no/

**Channel / playout / scheduling**
- https://www.provys.com/
- https://provyssphere.tv/
- https://provyssphere.tv/sphere-pro/
- https://provyssphere.tv/integration-with-provys/
- https://www.cinegy.com/products/cinegy_air/
- https://open.cinegy.com/products/air/26.2/playout/
- https://www.max-it.de/broadcast/programm-und-sendeplanung/
- https://www.max-it.de/die-programm-und-sendeplanung-beim-mitteldeutschen-rundfunk/
- https://www.max-it.de/news/sendebetrieb-fuer-das-erste/
- https://convit.de/rundfunk-planung-software-fuer-radio-und-fernsehsender
- https://convit.de/success-stories/plan-r-wdr
- https://convit.de/ueber-uns
- https://convit.de/langfristige-partnerschaft-zwischen-dem-ndr-und-convit

**Rental / crew / production management**
- https://rentman.io/pricing
- https://rentman.io/industries/media-broadcasting-management-software
- https://rentman.io/solutions/event-production-planning-software
- https://rentman.io/rentman-mobile-app
- https://support.rentman.io/hc/en-us/articles/360014365179-Rentman-Mobile-App
- https://support.rentman.io/hc/en-us/articles/27954393425042-Scan-Return-with-Rentman-Mobile-App
- https://frontdeskreview.com/software/equipment-rental-software/rentman/
- https://www.protonic-software.com/de/easyjob/
- https://www.protonic-software.com/de/easyjob/corporate/modules/
- https://omr.com/en/reviews/product/protonic-software-easyjob
- https://gebrauchte-veranstaltungstechnik.de/ad-794325-protonic+software+GmbH+easyjob+6M+Lizenz
- https://www.crewbrain.com/de/themen/crewplanung/crewplanung-fuer-die-veranstaltungstechnik/
- https://www.crewbrain.com/de/themen/personaldisposition/personaldisposition-fuer-die-veranstaltungstechnik/
- https://yamdu.com/
- https://shade.inc/blog/yamdu-for-post-production
- https://www.capterra.com/p/186025/Yamdu/
- https://www.cbinsights.com/company/yamdu
- https://www.studiobinder.com/callsheet/
- https://www.softwareadvice.com/screenwriting/studiobinder-profile/
- https://www.saasworthy.com/product/studiobinder/pricing
- https://www.setkeeper.com/pricing
- https://setkeeper.com/
- https://croogloo.com/
- https://www.current-rms.com/broadcast-and-production
- https://unibiz.com/
- http://www.sesamsoft.de/
- http://www.sesamsoft.de/ueber_uns.htm
- https://www.sesamsoft.de/English/referenzen_e.htm

**Cloud production / clipping**
- https://www.wildmoka.com/
- https://www.blackbird.video/
- https://www.blackbirdplc.com/
- https://www.svgeurope.org/blog/headlines/whitepaper-blackbird-on-the-true-cost-of-ownership-for-video-editing-in-the-cloud/

**Infrastructure, control, standards**
- https://community.dataminer.services/use-case/lawo-home-resource-scheduling-orchestration-for-dynamic-media-facilities/
- https://docs.dataminer.services/connector/doc/Skyline_Job_Manager.html
- https://community.dataminer.services/wp-content/grand-media/application/SLC_SolutionSheet_MCRandNOC.pdf
- https://www.grassvalley.com/grass-valley-alliance/skyline/
- https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-Version-4.0.pdf
- https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS_Protocol_Version_2.8.5_Final.htm
- https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm
- https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOSProtocolVersion40/index.html
- https://github.com/AirshiftMedia/OpenMOS
- https://www.smpte-ra.org/schemas/2021
- https://ieeexplore.ieee.org/document/7290030
- https://ieeexplore.ieee.org/document/7842827
- https://en.wikipedia.org/wiki/Broadcast_Exchange_Format
- https://www.amwa.tv/nmos-overview
- https://www.thebroadcastbridge.com/content/entry/21347/broadcast-standards-the-nmos-standards-deep-dive
- https://github.com/bitfocus/companion
- https://bitfocus.io/companion
- https://www.riedel.net/en/products-solutions/intercom/artist-matrix-intercom/software
- https://www.riedel.net/fileadmin/user_upload/800-downloads/06.0-Manuals-Intercom/Director_User_Guide_6.40_Vers.3.61__EN_.pdf

**OB context / technical documentation**
- https://www.wirecad.com/60/
- https://wireflow.live/av-diagram-software
- https://www.ibc.org/production/news/software-defined-trucks-rethink-remote-production/22794
- https://www.rossvideo.com/blog/the-importance-of-flexibility-and-scalability-in-outside-broadcasting/
- https://www.thebroadcastbridge.com/content/entry/20194/audio-for-broadcast-outside-broadcast-workflows
- https://www.systemonesoftware.com/blog/technical-rider
- https://www.riderforge.app/create-tech-rider.html
- https://resources.avid.com/SupportFiles/attach/iNEWS-Community.pdf

---

## Open UNKNOWNS — what to check next

Ranked by value to the suite.

1. **Rentman offline/mobile behaviour.** Does the scanning/crew app work with no connectivity and
   sync later? Check `support.rentman.io`. Decides whether the existing `rentman:*` bridge is
   usable in a truck.
2. **farmerswife client behaviour when the server is unreachable**, and the actual price of the
   REST API licence. Check `support.farmerswife.com` + a sales quote.
3. **Cuez on-prem / air-gapped deployment.** Nothing found either way. If Cuez has no local mode,
   the rundown-as-trigger niche is open on-site.
4. **Xytech REST API surface.** `xytechsystems.github.io/documentation` and the two public PDFs
   would show whether a resource booking can carry a technical payload.
5. **"Sesam TV / Sesam Vision" (from the seed list) could not be confirmed as a real broadcast
   product.** Searches returned a Norwegian children's TV series, an unrelated structural-analysis
   package, and **SESAM Software GmbH (Berlin, since 1986)** — a genuine German film/TV
   *Disposition* and dubbing-scheduling vendor, which is probably what was meant but is **not**
   confirmed as the intended seed. Needs a name or a URL from whoever supplied the seed list.
6. **WireCAD current pricing and licence model** (`wirecad.com` shop pages) — the direct
   competitive benchmark for cable-planner.
7. **Rundown Studio, CuePilot, Dramatify, CrewBrain pricing** — all sites blocked here.
8. **Whether any NMOS-aware product diffs a *planned* topology against live IS-04/IS-05 state.**
   I found none. If that is genuinely empty, it is the strongest technical differentiator
   available to the suite.
