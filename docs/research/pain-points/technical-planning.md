# Pain points: Technical Planning — Cable / Signal Flow / Patch / Rack

> Research run: **2026-08-29** (commissioning brief dated 2026-08-28). Evidence tiers follow
> [`docs/research/METHOD.md`](../METHOD.md): **FACT** (I opened the page and read it),
> **SNIPPET** (recorded second-hand in an earlier pass of this corpus, page not opened here),
> **INFERENCE** (my reasoning), **UNKNOWN** (honest gap).
>
> Read the Method section before trusting the shape of this document. Its coverage is
> **deliberately lopsided** and the reason is environmental, not editorial.

---

## Method

### What was searched, and what was not

| Channel | Status this run |
| --- | --- |
| GitHub issues / discussions / repo search | **Available** (via GitHub API). Primary evidence base. |
| `raw.githubusercontent.com` docs | **Available.** 1 file read. |
| WebSearch (all queries, EN + DE) | **Unavailable** — the session's search budget (200/200) was consumed by earlier segment passes. Zero searches ran. |
| Reddit (`reddit.com`, `old.reddit.com`) | **Blocked** by the network egress proxy. |
| Review sites (Capterra, G2, GetApp, TrustRadius, Trustpilot, Software Advice) | **Blocked.** |
| Vendor domains (`wirecad.com`, `netboxlabs.com`, `forum.vectorworks.net`, …) | **Blocked.** |
| Professional forums (Control Booth, ProSoundWeb, Blue Room, AVS) | **Blocked.** |
| German-language sources (film-tv-video.de, production-partner.de, veranstaltungstechnik forums) | **Not reachable** — no search, and the domains were not on the allowlist. |
| Search-engine fallbacks (DuckDuckGo HTML, Bing) | **Blocked.** |
| `web.archive.org`, `hn.algolia.com` (fallback routes to blocked content) | **Blocked.** |

Domains confirmed `EGRESS_BLOCKED` or refused this run: `duckduckgo.com`, `www.bing.com`,
`forum.vectorworks.net`, `www.capterra.com`, `www.wirecad.com`, `www.controlbooth.com`,
`netboxlabs.com`, `hn.algolia.com`, `web.archive.org`, `old.reddit.com`.

### What that means for this dossier — stated plainly

**The commercial tier of this segment has no user-complaint evidence in this document, because
none was obtainable.** Vectorworks Spotlight + ConnectCAD, WireCAD, D-Tools System Integrator,
XTEN-AV, Stardraw, Cable Scheduler / tvCAD, WireFlow and Patchify each get a section below, and
each of those sections says what is genuinely known (little), what is inferred, and exactly which
page to open first when a session with working search picks this up. **Nothing was invented to
fill those sections.** A short honest dossier beats a long fabricated one.

What *is* here is unusually good of its kind. The open-source and AV-native tier of this segment
now runs its issue trackers as a public support desk, and one project in particular
(**EasySchematic**) transcribes Discord messages, support emails and Reddit reports into GitHub
issues **with the reporter attributed and the ask quoted**. That produces primary-quality
practitioner evidence — a live-production engineer describing what breaks, in their own framing —
that I could read directly. Roughly two thirds of the substantive findings below come from there,
from NetBox's cable/patch issue stream, and from Rackula's connectivity epic.

### Volume

- **12** GitHub issue/repository searches across **7** repositories.
- **~115** issue records scanned (title, state, dates, reaction and comment counts).
- **~45** issues read in full body text.
- **1** documentation file fetched (`netbox/docs/models/dcim/cable.md`).
- **10** non-GitHub domains attempted and blocked.

### Bias warning on the evidence that does exist

1. **Survivorship.** An issue tracker records the complaints of people who *stayed* long enough to
   file. The person who tried EasySchematic for ten minutes and went back to Visio is invisible.
2. **Maintainer voice.** Several EasySchematic and Rackula issues are written by the maintainer
   about their own code. Those are engineering notes, not user pain. Where I use one as evidence
   of user pain it is because it explicitly cites a user report, and I say so.
3. **Recency skew.** EasySchematic's repository was created 2026-03-13 and has ~342 issues in five
   months. Its problems are the problems of a young, fast-moving product, which is not the same
   population as complaints about a twenty-year-old CAD package.
4. **Population skew.** NetBox's cable model is stressed hardest by fibre/datacentre users, not
   broadcast users. Their complaints transfer to AV only where the underlying structure is shared
   (patch panels, breakouts, trace) — which, usefully, is exactly where they cluster.

---

## Per-product findings

### EasySchematic (duremovich, AGPL-3.0, free; browser PWA)

The single richest evidence source in the segment. 120 stars, 148 open issues at time of reading,
created 2026-03-13. Issues carry attributed user reports from Discord, support email and Reddit.

**STRENGTHS (conceded by the people complaining)**

- The typed-signal model plus live validation is what users came for. When a user asks for
  validation to be *switchable off* (#188) they are careful to say they want to keep signal-type
  validation, because it drives wire colour and style — i.e. the core idea is not in dispute.
- Patch-panel and procurement work is being driven directly by named practitioners, who keep
  coming back with follow-ups rather than leaving. That is a retention signal.
- The community device library is credited by a NetBox-adjacent user in a different repository as
  the thing that "saved an enormous amount of time" (that phrasing is from the NetBox
  devicetype-library thread, not this one — see below).

**WEAKNESSES**

- **Patch panels are a half-built idea with a legacy path still in the codebase.** #369 (open,
  2026-08-23) asks outright whether the legacy paired input/output patch-panel path should be
  deleted, quoting a tester who doubts it was ever useful to anyone. Meanwhile #293 (open,
  2026-08-15) records that eight distinct sub-asks from the original patch-panel request thread
  were never resolved and are invisible to any tag-based sweep, because the thread got tagged
  "Implemented".
- **Reports diverge across surfaces.** #362 (open, 2026-08-22): the Patch Panels report's PDF and
  CSV disagree with the on-screen table on columns, order, filters and empty cells. #311 (closed,
  2026-08-17): the same report shows legacy single-face columns that can never populate for a
  passthrough panel.
- **Quantity maths is wrong in a specific, plausible case.** #248 (open, 2026-08-15): the Devices
  report inflates "need" quantity for devices spread across rooms — the needed count is computed
  per model, but export rows group per model *and* room, so adapters used in several rooms get
  over-ordered. Pre-existing since 2026-04-12.

**MISSING FEATURES (what users actually asked for)**

- **A patch path that does not pollute the drawing.** #232 (open, 2026-07-09), from a support-email
  user named in the issue: in a real install a cable runs device → patch panel port → patch lead →
  destination device; he wants that path mapped *without* inserting the panel into the single-line
  diagram, plus a standalone patch-panel view showing every port with its in and out cables,
  carrying the schematic's own cable numbers. This is the most substantively argued request in the
  whole corpus for this segment.
- **Terminated-on-the-back-side visibility.** #293, from a Discord user: patch panels are currently
  just devices you connect to; what is missing is showing how the panel is terminated on the rear.
- **Wall panels and remote racks that stay legible.** #283 (open, 2026-08-15), Discord: SDI from a
  PTZ into an AVB/AVR wall panel, reappearing in a rack elsewhere in the building. The reporter's
  point is operational, not cosmetic — for resets and large re-patching exercises this is one of
  the hardest things to demonstrate clearly.
- **A generic two-block departures/arrivals patch element**, Videohub-shaped, rather than fixed
  input/output patch-panel device types (#281, open, 2026-08-15, Discord).
- **Cable length from room-to-room distance** (#146) and **a library of owned gear** so a design can
  be marked owned vs. cross-hired for an event (#144).
- **Rack management** — add racks, place equipment, roll up weight and used/free U (#83, Discord,
  explicitly "inspired by Patchify features").
- **Modular I/O cards** — declare card slots on a device and pick the fitted card (#31).
- **Electrical properties**: speaker impedance and wattage including 70 V / 100 V lines (#351);
  a structured home for switched-load ratings on relays, dimmers and contactors (#340).
- **Vendor-specific rack models so procurement can quote a real part number** (#313).
- **Localization** (#99, open since 2026-03-30). The entire ask is that people speak languages
  other than English. Still open five months later.

**UX PROBLEMS**

- **Auto-routing is the recurring complaint.** #288: the auto-router backtracks and shoves
  neighbouring cables instead of taking the direct path. #330: manual cable-path editing needs a
  rethink to be quick and intuitive. #286: users want a "lock path" per cable. #134: moving a room
  distorts the internal cable paths and forces manual rework.
- **Connection drag is imprecise** — #366: the ghost preview appears at distances where releasing
  does not actually connect.
- **Hiding a signal type also hides the pins** (#108), which changes the device's shape and breaks
  the layout, forcing repositioning per printed page.
- **Connector picker has no search and no signal-aware filtering** (#302).
- **Adapters auto-insert on top of existing devices** (#363) and **cable-schedule import drops new
  devices on top of the existing schematic** (#338).
- Dark-mode contrast bug in the note input (#141, closed) — light grey text on light yellow.

**PERFORMANCE PROBLEMS**

- **10-second routing times on large schematics**, user-reported (#56, 2026-03-25). Mitigated by an
  auto-route toggle and a warning banner (#57) rather than by fixing the algorithm.
- **Slow project-file loading** with no loading indicator, so it reads as broken (#217, playtest
  follow-up, 2026-06-21).
- **App chunk at 2.1 MB uncompressed** because the ~1.3 MB device-library fallback is statically
  imported; the PWA precache limit had to be raised to 4 MiB to unblock the build (#111, open).
  This grows with every approved device.

**PRICING PROBLEMS**

- None found. It is free and AGPL-3.0. **INFERENCE:** the absence of pricing complaints in a tool
  whose feature requests otherwise mirror the commercial tier is itself a data point about what
  the commercial tier's price is buying.

**LOCK-IN**

- **DXF export is lossy.** #319 (open, 2026-08-17): DXF export replaces stub labels with the cable
  ID, and the PDF is rasterised. #335 asks for vectorised PDF export outright.
- Community device submissions are moderated through a queue the submitter cannot edit while it is
  pending (#79), and there is no workflow to report or correct erroneous community entries (#287).

**OFFLINE**

- It is a PWA, so it nominally works offline — but the parts that matter reach out. **#3 (closed,
  2026-03-18): corporate antivirus and firewall setups block the device-library API host, reported
  from r/VIDEOENGINEERING** (the Reddit thread URL is quoted inside the GitHub issue; I read the
  issue, not the thread).
- Login is a magic link, and magic links are fragile in exactly the environments this trade works
  in: **#68** — Microsoft Online's link protection rewrites the URL and consumes the token, so the
  user could not log in at all; **#59** — a link advertised as valid for 15 minutes expired in
  about 6.
- **#93** asks for Docker support so the thing can be self-hosted. Closed, but the ask is the
  signal.

**INTEGRATION PROBLEMS**

- No inventory or rental integration; the owned-gear ask (#144) and the procurement Owned/Need
  rethink (#305) are both still open concepts rather than an integration.
- No label-printer path. #129 (closed) asked for an integrated patch-panel label designer,
  explicitly referencing a dedicated label tool; #232's design covers printing designation strips
  at 100 % physical scale, which is the nearest thing to a label output in the segment.
- Cable-schedule CSV shipped with mojibake until a UTF-8 BOM was added (#217) — a small thing that
  tells you the CSV path was not being consumed by a European Excel until a user hit it.

---

### NetBox (NetBox Labs / community, Apache 2.0)

Best physical cable and patch data model in existence, per the landscape pass — and its issue
stream is where you see the seams. **All findings here are FACT** (issues read in full).

**STRENGTHS**

- Nobody in the tracker disputes the model's structure. The complaints are all "the model is nearly
  right, this one case does not fit", which is the complaint profile of a good model.
- The Python client, **pynetbox, had six open issues total** when read — two of them housekeeping
  (CI modernisation, docs tooling). For a client library against a large API that is remarkably
  clean, and it argues that NetBox's REST API is not where the pain is.

**WEAKNESSES**

- **Cable profiles are a short static list, and real installations exceed it.** #23031 (open,
  2026-08-26) asks for 8C1P / 12C1P / 24C1P trunk profiles, noting that 12- and 24-fibre trunks to
  12/24-port fibre panels are ordinary and currently cannot be modelled properly; the reporter
  explicitly frames it as a stopgap until the general solution in **#21663 — "Allow arbitrary
  connector/position counts for cable profiles" (open, 2026-03-12, 15 reactions)** lands.
- **Per-strand (simplex) mapping is refused.** #22774 (open, 2026-07-24): where an optical panel is
  modelled with one front port per fibre strand (separate TX and RX), assigning a breakout profile
  is rejected because NetBox insists the panel side use a single front port. The user's real-world
  driver is that field teams are instructed "connect to positions 11 and 12".
- **Multi-position front ports break `connected_endpoints`.** #21960 (open, 2026-04-19): a front
  port with two positions mapping to two rear ports that converge on the *same* remote interface
  traces correctly in one direction and returns `connected_endpoints: null` in the other. The UI
  can walk the path manually; the resolver refuses because it sees a split.
- **Editing a multi-termination cable destroys it.** #22883 (open, 2026-08-06): adding a
  termination to an existing multi-termination cable silently removes the existing terminations, so
  the cable must be deleted and recreated. And in the edit form, several interfaces with the same
  name from different devices are indistinguishable, so the user cannot tell which termination they
  are removing. Same behaviour through the API.
- **Bulk edit wipes the trace.** #23072 (open, 2026-08-29, filed the day this dossier was written):
  bulk-editing cables to apply a profile makes the connection trace disappear from the device's
  interface list; re-running `upgrade.sh` forces a retrace and brings it back. Single-cable edits
  are fine.
- **Power does not trace end to end.** #22004 (open 2026-04-27, now labelled deferred / pending
  closure): a trace does not follow a device power inlet through a PDU outlet to the PDU input and
  on to the power feed. The reporter supplied the patch inline. It was deferred anyway.

**MISSING FEATURES (with vote counts, which matter here)**

- **#8323 — show images of the selected connector type in forms.** Open since 2022-01-11, **24
  reactions.** Four years. This is the "I cannot tell which connector I am picking" problem, and it
  is the second-most-requested open feature in the whole DCIM tracker.
- **#14205 — customise RackView labels.** Open since 2023-11-07, 16 reactions. The rack elevation
  renders, but you cannot control what it says.
- **#16904 — let modules and device bays occupy more than one position.** Open since 2024-07-12,
  10 reactions. Half-width and multi-slot cards are ordinary in AV frames.
- **#18243 — make cable-trace views configurable** (choose which fields the trace image shows;
  hide the label when showing a customer a trace). Open since 2024-12-16, backlog,
  complexity: high.
- **#21830 — devices with front ports only, without explicit rear-port mapping.** Open 2026-04-02.

**UX PROBLEMS**

- Terminations identified by interface name alone in edit forms (#22883) is a data-integrity UX bug,
  not a cosmetic one.
- **#16392 — "Collapse side navigation", 40 reactions, open since 2024-06-03** — the second-highest
  voted feature request in the tracker is a request for screen space. **INFERENCE:** for a tool used
  on a laptop in a rack room, chrome-versus-content matters more than the vote count suggests.

**PERFORMANCE PROBLEMS**

- **UNKNOWN.** No open performance issue about large cable or interface counts surfaced in the
  searches run. Absence of evidence, not evidence of absence: NetBox performance discussion happens
  largely on its own community forum, which was unreachable.

**PRICING / LOCK-IN / OFFLINE**

- Apache-2.0 and self-hostable; none of the three is a complaint vector for the community edition.
  Cloud pricing for NetBox Labs' hosted product is **UNKNOWN** here (`netboxlabs.com` blocked).

**INTEGRATION PROBLEMS**

- **The AV gap is structural and total.** The cable model knows conductors, positions and profiles;
  it has no concept of signal type, direction, or a connector's gender. This is not in the issue
  tracker as a complaint because nobody expects it of NetBox — which is exactly why the gap
  persists. (SNIPPET/INFERENCE, consistent with the landscape pass.)
- **#18848** asks webhook payloads to include related objects — relevant to anyone syncing NetBox
  into a design tool, because today a cable webhook does not carry the things the cable connects.

---

### netbox-community/devicetype-library (the shared hardware library)

Treated separately because it is the data layer several products in this segment now depend on —
Rackula uses its hardware images, and its schema is becoming a de-facto interchange format.

**WEAKNESSES**

- **#4350 (open, 2026-07-12) is the most consequential finding in this repository.** After importing
  the library into a current NetBox, *every* device is missing the mapping between front and rear
  ports — every patch panel, every UTP wall plate. Import reports no errors. The result is that all
  patch panels show as unconnected until the 1:1 front-to-rear mapping is rebuilt by hand, per
  device. The same reporter thanks the maintainers warmly for the library in the same message, which
  is the tell that this is a real user, not a drive-by.
- **#4497 (open, 2026-08-26):** NetBox 4.7 added module-bay type constraints; the library schema has
  no field for them and `additionalProperties: false`, so an imported device type arrives with the
  constraint unset and it has to be applied by hand per bay on every device — "the part that does
  not scale".
- **#4190 (open, 2026-05-22):** no way to distinguish a rendered elevation drawing from a
  photograph, so an importer cannot prefer clean renders for rack elevations and fall back to photos.
- Per-device data errors are ordinary maintenance traffic (#4335 Huawei port complement wrong,
  #4512 HPE management port not flagged `mgmt_only`, which quietly corrupts interface-utilisation
  figures rather than failing visibly).

**INFERENCE:** a community hardware library is a genuine moat *and* a permanent data-quality
liability. Any product that adopts one inherits both.

---

### Rackula (RackulaLives, MIT)

1,534 issues in eight months. Its planning documents are unusually explicit about *why* an
IT-derived rack tool does not fit AV — which makes it the best available written statement of the
segment's central gap.

**STRENGTHS**

- The maintainers name the problem correctly. Epic **#1928, "Connectivity & Pro Audio"** (open,
  2026-06-06) states that pro-audio and AV connectivity has fundamentally different requirements
  from networking, and lists them: directionality (HDMI OUT to HDMI IN, XLR mic input vs line
  output); the same connector (XLR, BNC, RJ45) carrying different signals; patch-bay normalling with
  configurable behaviour; and endpoints outside the rack such as wall plates, stage boxes and
  ceiling speakers. It then says, in as many words, that the previous epics assumed symmetric,
  bidirectional, point-to-point connections — Ethernet — and that this epic exists to undo that
  assumption.

**WEAKNESSES / MISSING FEATURES**

- Everything in that epic is *future work*. As of reading, connection rendering, signal types,
  gender display, patch bays, external endpoints, patch-list CSV export and matrix-switcher routing
  are all queued across milestones M005, M006 and M009, with matrix routing explicitly lowest
  priority and power/console/multi-rack visualisation pushed to M009.
- **#159 (open, 4 reactions):** flexible device layouts for half-width devices, shelves, internal
  bays and blade chassis — the same shape as NetBox #16904.
- **#1732 (open, 2026-05-25): DXF export for native AutoCAD interchange.**
- **#1517 (open, 11 comments):** pictures of assets — the most-discussed open issue in the tracker.
- **#267 (open):** external connection handling — cables that leave the rack to a core switch, wall
  jack or demarcation point, currently unmodellable.

**PRICING / LOCK-IN / OFFLINE**

- MIT-licensed and self-hostable, but the project is **migrating its production to Cloudflare
  Workers and R2** (#1983, #1986, #3095) and building **hosted multi-tenant cloud sync and auth**
  (#2365), with privacy policy, ToS and data-location/retention still an open issue (#2378). A
  client sync engine with an offline write-back cache and conflict guard is planned (#2781) but not
  shipped; account export to a `.Rackula.zip` is also still open (#2784).
- **INFERENCE:** an MIT licence does not by itself guarantee the offline story. This one is being
  built cloud-first with offline as a later milestone, which is the same order of operations most of
  the SaaS tier chose.

---

### WireViz (cable-harness documentation, adjacent but instructive)

Not an AV tool, but the closest thing to a text-defined cable-documentation standard, and its
long-open requests show what people want from cable documentation generally.

- **#3 — "Ability to specify twisted wires". Open since 2020-06-24. 32 reactions, 23 comments.**
  Six years. It is the highest-voted open issue in the repository and it is a request for a physical
  cable property that any real cable schedule needs.
- **#222 — labels on cable ends.** Open since 2021-03-10. The single most basic requirement of a
  field-usable cable document, unimplemented for five years.
- **#270 — the ability to go from connector to wire to wire to connector.** Open since 2022-02-02.
  That is *pass-through*, i.e. the patch panel problem again, in a different tool.
- **#350 — jumpers and interconnects**, 34 comments, open since 2024-05-18.
- **#220 — import external YAML to share connector and cable definitions**, 29 comments, open since
  2021-03-04. Library sharing, unsolved.
- **#211 — "Bringing WireViz to the Web".** Open since 2021.

**INFERENCE:** the four things this community has asked for longest — twisted pairs, end labels,
pass-through, shared libraries — are four of the things an AV cable planner must have on day one.

---

### kumihimo (Love-Rox, MIT — text-defined AV signal flow)

One open issue in the entire repository, and it is worth the whole repository:

- **#87 (open, 2026-08-13):** an AV professional says they currently draw AV system diagrams in
  AutoCAD, that kumihimo lacks the agent capabilities they want, and asks whether **DXF import and
  export** is planned — arguing it would make the tool valuable to AV-industry professionals.

**FACT:** that is one user. **But** combined with Rackula #1732 and EasySchematic #319, DXF is the
interchange format asked for by name in three independent projects in this segment. See
Cross-product patterns.

---

### Commercial tier — evidence gap, declared

For the eight commercial products below, **this run produced no user-complaint evidence at all.**
Reddit, the review sites, the professional forums and the vendor domains were all unreachable, and
GitHub searches for `WireCAD`, `ConnectCAD` and `Vectorworks` in an AV context returned nothing
usable (`ConnectCAD`: zero issues on GitHub; `WireCAD`: zero; `Vectorworks`: 265 hits, all
lighting-, BIM- or unrelated-CAD-adjacent noise).

I am recording what is *known* and what to check, and nothing else.

#### Vectorworks Spotlight + ConnectCAD (Nemetschek)

- **Known (SNIPPET, from the landscape pass):** schematic, rack elevation, 3D rack and venue plan in
  one document; circuit reports; a design-rule check; the European event-market default. Its DRC
  reportedly means "missing connection" or "incompatible equipment", not standards conformance.
- **Weaknesses / UX / performance / pricing / lock-in / offline / integration: UNKNOWN.**
- **First pages to open with working search:** `forum.vectorworks.net/forum/138-connectcad/` (the
  vendor-hosted user forum, sorted by replies); the Vectorworks service-pack release notes and their
  "known issues" lists — what a vendor keeps fixing is what keeps breaking; then Capterra and
  TrustRadius 1–3 star reviews for Spotlight. Query patterns worth running: "ConnectCAD slow large
  file", "Vectorworks subscription price increase", "ConnectCAD vs WireCAD".

#### WireCAD 10 XLT / PRO / CMS (Holbrook Enterprises)

- **Known (SNIPPET):** DWG-native, a real SQL database per project, schema-driven cable numbering,
  patchbay layouts; the most-recommended specialist in practitioner sources. The landscape pass
  recorded its prices as **mutually inconsistent across three searches and marked them UNKNOWN.**
- **Weaknesses etc.: UNKNOWN.** **INFERENCE only, flagged as such:** a per-project SQL Server
  dependency (documented in the vendor's own setup guides, SNIPPET) is a plausible source of
  install-and-licensing friction and of "can two of us open the same project" complaints. Do not
  cite this as a user complaint — no user was heard saying it.
- **First pages to open:** the WireCAD v10 licensing FAQ and SQL Server setup pages on
  `wirecad.com/help100/`; r/VIDEOENGINEERING searches for "WireCAD".

#### D-Tools System Integrator

- **Known (SNIPPET):** BOM, proposal, drawing and procurement in one dataset via AutoCAD/Visio
  integration; ERP-class purchase with implementation fees.
- **UNKNOWN otherwise.** **First pages:** Capterra and GetApp "Cons" fields — this is the one product
  in the segment with enough seats to have a meaningful review corpus; and the D-Tools Cloud vs.
  System Integrator pricing pages, since the cloud/desktop split is the usual source of feature-gating
  complaints.

#### XTEN-AV X-DRAW / x.doc

- **Known (SNIPPET):** AI-assisted automatic rack elevations; cloud-only; **API gated to the
  Enterprise tier.**
- **INFERENCE (not a heard complaint):** cloud-only plus a tier-gated API is the textbook lock-in
  shape — your drawings live on their servers and the programmatic exit costs an upgrade. Worth
  verifying against actual user reports rather than asserting.
- **First pages:** `xtenav.com/pricing/` and the knowledge-base articles on subscription levels;
  then any review-site presence.

#### Stardraw Design 7.4

- **Known (SNIPPET):** 130,000+ symbols, 1,600+ manufacturers, the only vendor found to have
  licensed the J-STD-710 AV symbol standard.
- **UNKNOWN otherwise.** **INFERENCE:** symbol breadth is the classic defence of a tool whose
  underlying data model is thin — a symbol is a picture, not a port. Unverified.

#### Cable Scheduler / tvCAD

- **Known (SNIPPET):** parses existing AutoCAD wiring drawings into cable schedules at broadcaster
  scale (named users include Foxtel, Fox Sports, ABC TV Australia, NEP); on-premises, not cloud.
- **UNKNOWN otherwise.** These are small vendors with no public issue tracker and probably no review
  presence; the realistic route is broadcast mailing lists and direct practitioner contact.

#### WireFlow / Patchify (AV micro-SaaS)

- **Known (SNIPPET):** WireFlow does connection-aware validation while drawing plus LED-wall
  cabinet/power planning at USD 5–14.99/month; Patchify has a broadcast-flavoured device library
  (Blackmagic, Sony, Ross, Grass Valley), auto patch lists and cable labels, and an offline Windows
  app.
- **UNKNOWN otherwise.** One indirect data point that *is* FACT: an EasySchematic user asked for rack
  management **explicitly citing Patchify as the reference implementation** (#83), which is weak
  evidence that Patchify's rack handling is regarded as good.

---

## Cross-product patterns

These are the complaints that repeat across independent products and independent reporters. They
are the most valuable part of this document.

### 1. The patch panel is the fault line of the entire segment — **widespread**

Every tool models a cable between two devices. Every tool struggles the moment the cable goes
*through* something.

- EasySchematic #232: a user wants device → panel port → patch lead → device modelled as one logical
  connection with per-segment cable IDs, without the panel cluttering the single-line drawing.
- EasySchematic #293: panels are connect-to devices; rear termination is invisible.
- NetBox #21960: multi-position front port mapped to two rear ports fails to resolve endpoints.
- NetBox #22774: per-strand front ports are rejected by the profile validator.
- NetBox #21830: front ports without rear mapping are not expressible.
- devicetype-library #4350: imported panels arrive with *no* front-to-rear mapping, so everything
  reads as unconnected.
- WireViz #270: connector → wire → wire → connector, open four years.
- Rackula: patch-bay normalling is named in the epic and scheduled for a later milestone.

Four independent codebases, at least eight independent reporters, one shape of problem.

### 2. The physical world has more than one conductor per cable, and the models cannot count —
**recurring**

Breakouts, trunks, fan-outs, TX/RX pairs. NetBox #21663 (arbitrary connector/position counts, 15
reactions), #23031 (8/12/24-fibre trunk profiles missing), #22774 (per-strand), #22883
(multi-termination editing destroys terminations). In AV this is the same shape as a multicore, a
DB25 audio snake, an MPO fibre run and an SDI quad-link.

### 3. Direction, gender and signal type are missing wherever the model came from IT — **widespread**

Rackula's epic #1928 states it outright and lists directionality, one-connector-many-signals,
normalling and off-rack endpoints as the things a networking-derived model gets wrong. NetBox has
none of these concepts. EasySchematic, which *does* have them, immediately generates the opposite
complaint (#219: USB-A to USB-B treated as incompatible; #154: USB-C to Thunderbolt not connectable;
#27: no XLR/TRS combi port), which is the price of having the semantics at all.

### 4. Validation is wanted — and wanted switchable — **recurring**

EasySchematic #188, from a named Discord user: turn off verification for direction, connector type
and gender (which would also remove the need for auto-inserted adapters), **but keep signal-type
validation**, because it drives wire colour and style. This is the sharpest single statement of what
a designer wants from a rule engine: strict where it prevents a wrong cable, silent where the
drawing is provisional.

### 5. What is on screen is not what is in the PDF is not what is in the CSV — **recurring**

EasySchematic #362 (report PDF/CSV diverge from screen on columns, order, filters), #311 (dead
columns printed), #319 (DXF loses stub labels; PDF rasterised), #335 (vectorised PDF requested),
#217 (new cable columns missing from print preview; CSV mojibake until a BOM was added). Rackula
#1094 is an entire epic called "Export/Share Stabilization". The deliverable of this whole segment
*is* the document, and the document is where the bugs are.

### 6. DXF is the interchange format users ask for by name — **recurring**

kumihimo #87, Rackula #1732, EasySchematic #319 — three independent projects, three separate users,
same request. Nobody asked for a bespoke exchange format. **INFERENCE:** the segment has no
MVR/GDTF equivalent, so DXF is what people fall back on, and a lossy DXF is treated as a broken
promise rather than a nice-to-have.

### 7. Auto-routing is the loudest UX complaint in every graphical tool — **recurring**

EasySchematic #54, #56 (10-second routing on large schematics), #57, #288 (router shoves neighbours
instead of going direct), #330 (manual path editing needs a rethink), #286 (lock a path), #134
(moving a room destroys internal routing). The pattern: automatic routing is a wonderful demo and a
liability on a real drawing, and the fix users ask for is always *control*, not *cleverness* — lock
this path, keep that layout, let me draw it myself.

### 8. The shared device library is the moat and the millstone — **recurring**

devicetype-library #4350, #4190, #4497, #4335, #4512; EasySchematic #287 (no way to report a wrong
community entry), #79 (cannot edit a submission in the queue), #77 (clone an existing device), #314
(preview a submitted device), #78 (search and filter devices by brand and feature). Everyone wants
the library; everyone then wants a correction workflow, and nobody has built one.

### 9. The cloud is where the field-work friction is — **recurring**

EasySchematic #3 (corporate firewall blocks the device-library API — reported from
r/VIDEOENGINEERING), #68 (Microsoft link protection eats the magic-link token), #59 (login link
expires early), #93 (give us Docker). Rackula #2781 (offline write-back cache — planned, not
shipped), #2378 (data location and retention still an open question). **INFERENCE:** this segment's
users work inside corporate networks, in venues, and in vehicles. Any auth or asset fetch that
assumes a friendly network will fail in front of a client.

### 10. Power and electrical semantics stop at the rack door — **recurring**

NetBox #22004 (power trace will not follow PDU outlet → PDU inlet → feed; patch supplied by the
reporter; deferred anyway). EasySchematic #351 (speaker impedance/wattage, 70 V/100 V), #340
(switched-load ratings for relays, dimmers, contactors), #347 (stop gating power-capacity fields on
specific device types). Rackula: power visualisation deferred to M009.

### 11. Design and inventory are two databases and everyone is retyping — **recurring**

EasySchematic #144 (mark owned vs. external gear), #305 (rethink procurement Owned/Need), #248
(need-quantity inflated per room), #313 (vendor rack models so procurement can quote a part number),
#285 (quote-to-schematic wizard). This is the same pattern the corpus records in the rental and
asset-tracking segments; here it appears as a design-tool complaint.

### 12. Long-open, high-vote requests are the reliable signal — **method note**

The four oldest heavily-voted open requests found — WireViz #3 (twisted wires, 2020, 32 reactions),
NetBox #8323 (connector images, 2022, 24 reactions), NetBox #14205 (rack-view labels, 2023, 16),
WireViz #222 (cable-end labels, 2021) — are all small, concrete, physical-world details. None is
architectural. **INFERENCE:** the segment's incumbents are not failing at grand vision; they are
failing at the last 5 % of physical fidelity, and that last 5 % is what the person holding the cable
needs.

### 13. Localization is unaddressed — **isolated but strategically loaded**

EasySchematic #99, open since 2026-03-30, is the only localization request found anywhere in this
segment's trackers. **INFERENCE:** for a German-market product this is either an open goal or a
warning that the addressable non-English market is small. This run could not reach a single
German-language source, so treat it as untested.

---

## Direct quotes-of-substance

All paraphrased from issue text I read on the cited page. Reporter attributions are as recorded in
the issue itself. No quote here is verbatim invention.

1. **Rackula maintainers, on why an IT rack model does not fit AV** — pro audio and AV connectivity
   differs fundamentally from networking: signal direction matters (HDMI out to HDMI in, mic input
   vs line output), the same physical connector carries different signals, patch bays have
   normalling with configurable behaviour, and endpoints exist outside the rack. The earlier epics
   had assumed symmetric bidirectional point-to-point connections — Ethernet — and this epic exists
   to replace that assumption.
   <https://github.com/RackulaLives/Rackula/issues/1928> — 2026-06-06.

2. **A support-email user (named "Paolo" in the issue), on patch routing** — in a real installation
   a cable runs from the device to a patch panel port, through a patch lead, to the destination
   device. He wants that path recorded without having to insert the panel into the single-line
   diagram, and a separate patch-panel view listing every port with its incoming and outgoing
   cables, using the same cable numbers as the schematic.
   <https://github.com/duremovich/EasySchematic/issues/232> — 2026-07-09.

3. **A Discord user, on what patch panels currently are** — the panels are the problem; right now
   they are just devices you connect to, and what is missing is a way to show how the panel is
   terminated on the back side.
   <https://github.com/duremovich/EasySchematic/issues/293> — 2026-08-15.

4. **A Discord user, on wall panels and remote racks** — wants AVB/AVR panels and remote racks drawn
   legibly: an SDI feed from a PTZ goes into a wall panel and comes back out in a rack somewhere
   else in the building, and for resets and large re-patching exercises this is one of the hardest
   things to demonstrate clearly.
   <https://github.com/duremovich/EasySchematic/issues/283> — 2026-08-15.

5. **A Discord user, on validation** — asks for the ability to switch off verification of signal
   direction, connector type and connector gender, which would also remove the need for
   auto-inserted adapters, while keeping signal-type verification because it drives the wire colour
   and style.
   <https://github.com/duremovich/EasySchematic/issues/188> — 2026-06-18.

6. **A NetBox user importing the community device library** — after import, every device is missing
   the front-port-to-rear-port mapping: every patch panel, every UTP plug. Import raised no errors,
   yet all devices show as unconnected until the 1:1 front-to-rear mapping is fixed by hand. The
   same message thanks the maintainers, saying the library saved an enormous amount of time.
   <https://github.com/netbox-community/devicetype-library/issues/4350> — 2026-07-12.

7. **A NetBox user documenting optical panels per strand** — the panel is modelled with one front
   port per fibre strand because the field team is instructed to connect to specific positions
   (e.g. 11 and 12, one for transceiver TX and one for RX); NetBox rejects the breakout profile,
   insisting the panel side use a single front port.
   <https://github.com/netbox-community/netbox/issues/22774> — 2026-07-24.

8. **A NetBox user editing a multi-termination cable** — removing a termination works, but with
   several interfaces sharing a name the edit form does not say which device each belongs to; and
   adding a termination to an existing multi-termination cable removes the existing ones, so the
   cable has to be deleted and recreated with the full set. Same through the API.
   <https://github.com/netbox-community/netbox/issues/22883> — 2026-08-06.

9. **A NetBox user on fibre trunks** — asks for 8-, 12- and 24-connector trunk profiles, because
   12- and 24-fibre trunk cables to 12/24-port fibre panels are commonplace and only the small
   profiles exist, explicitly as a stopgap until the general arbitrary-count proposal lands.
   <https://github.com/netbox-community/netbox/issues/23031> — 2026-08-26.

10. **An AV professional to the kumihimo maintainer** — says they currently create AV system
    diagrams in AutoCAD, and asks whether DXF import and export is planned, arguing it would make
    the tool genuinely valuable to AV-industry professionals.
    <https://github.com/Love-Rox/kumihimo/issues/87> — 2026-08-13.

11. **An EasySchematic user via r/VIDEOENGINEERING** — corporate antivirus and firewall setups block
    the hosted device-library API, so the library does not load at work. (Reported on Reddit; the
    thread URL is quoted inside the GitHub issue, which is what I read.)
    <https://github.com/duremovich/EasySchematic/issues/3> — 2026-03-18.

12. **An EasySchematic user on magic-link login** — the login links arrive in a Microsoft Online
    inbox, Microsoft's link protection rewrites them, and the rewrite consumes the token; tried in
    two browsers, same result, could not log in.
    <https://github.com/duremovich/EasySchematic/issues/68> — 2026-03-26.

13. **An EasySchematic user on PDF export** (via Discord) — the export comes out with a lot of empty
    space, and fitting it to A4 or smaller means physically moving the whole project; also the
    drawing sits hard against the PDF margin with no way to inset it.
    <https://github.com/duremovich/EasySchematic/issues/90> — 2026-03-28.

14. **An EasySchematic user on hidden signals** — hiding a signal type in the view options hides the
    pins as well as the wires, so the device changes shape and the layout has to be rearranged for
    each page you want to print; the pins should stay.
    <https://github.com/duremovich/EasySchematic/issues/108> — 2026-04-02.

15. **An EasySchematic user on localization** — the entire issue body is that other people speak
    languages besides English. Still open.
    <https://github.com/duremovich/EasySchematic/issues/99> — 2026-03-30.

---

## What to do next (for whoever picks this up)

Ranked by evidence value per hour, assuming a session with working WebSearch:

1. `forum.vectorworks.net/forum/138-connectcad/` sorted by replies — the only vendor-hosted user
   forum in the commercial tier of this segment.
2. Capterra / GetApp "Cons" fields for **D-Tools System Integrator** — the only product here with
   enough seats for a statistically meaningful review corpus.
3. r/VIDEOENGINEERING searches for `WireCAD`, `ConnectCAD`, `cable schedule`, `patch list` — the
   EasySchematic tracker proves this subreddit is where this trade's practitioners actually are.
4. Vectorworks service-pack release notes and known-issues lists.
5. German-language: film-tv-video.de, production-partner.de, and Veranstaltungstechnik forums for
   `Signallaufplan`, `Verkabelungsplan`, `Patchliste` — untested territory in this corpus.
6. The EasySchematic Discord (`#feature-requests`, `#bug-reports`) — the GitHub issues transcribe it,
   but only selectively, and the raw channel is the densest practitioner source found anywhere in
   this segment.

---

## Sources

Every URL below was opened and read during this run, except where marked. GitHub issue content was
read via the GitHub API, which returns the full issue body; the `html_url` for each is given.

### NetBox (netbox-community/netbox)

1. <https://github.com/netbox-community/netbox/issues/23072> — bulk cable profile edit wipes connection trace (2026-08-29)
2. <https://github.com/netbox-community/netbox/issues/23031> — missing 8/12/24-connector trunk profiles (2026-08-26)
3. <https://github.com/netbox-community/netbox/issues/22883> — one-to-many cable terminations destroyed on edit (2026-08-06)
4. <https://github.com/netbox-community/netbox/issues/22774> — per-fibre-strand cable profiles rejected (2026-07-24)
5. <https://github.com/netbox-community/netbox/issues/22004> — power trace does not traverse PDU outlets (2026-04-27)
6. <https://github.com/netbox-community/netbox/issues/21960> — multi-position front port breaks connected_endpoints (2026-04-19)
7. <https://github.com/netbox-community/netbox/issues/21830> — front ports without explicit rear mapping (2026-04-02)
8. <https://github.com/netbox-community/netbox/issues/21663> — arbitrary connector/position counts for cable profiles (2026-03-12)
9. <https://github.com/netbox-community/netbox/issues/21098> — LAG type options (2026-01-08)
10. <https://github.com/netbox-community/netbox/issues/18243> — configurable cable trace views (2024-12-16)
11. <https://github.com/netbox-community/netbox/issues/18848> — webhook payload should include related objects (2025-03-10)
12. <https://github.com/netbox-community/netbox/issues/19003> — offline storage of modules (2025-03-25)
13. <https://github.com/netbox-community/netbox/issues/16904> — modules/device bays over multiple positions (2024-07-12)
14. <https://github.com/netbox-community/netbox/issues/16392> — collapse side navigation (2024-06-03)
15. <https://github.com/netbox-community/netbox/issues/15045> — device-to-rack assignment workflow (2024-02-05)
16. <https://github.com/netbox-community/netbox/issues/14205> — customise RackView labels (2023-11-07)
17. <https://github.com/netbox-community/netbox/issues/8323> — connector-type images in forms (2022-01-11)
18. <https://raw.githubusercontent.com/netbox-community/netbox/main/docs/models/dcim/cable.md> — cable model documentation (termination and profile limits)

### pynetbox (netbox-community/pynetbox)

19. <https://github.com/netbox-community/pynetbox/issues/436> — objects in custom fields (2022-01-06)
20. <https://github.com/netbox-community/pynetbox/issues/442> — null filter values (2022-01-31)
21. <https://github.com/netbox-community/pynetbox/issues/170> — record attribute collisions (2019-06-10)
22. <https://github.com/netbox-community/pynetbox/issues/793> — changelog message on DELETE (2026-08-12)

### netbox-community/devicetype-library

23. <https://github.com/netbox-community/devicetype-library/issues/4350> — all device types missing front/rear port mapping (2026-07-12)
24. <https://github.com/netbox-community/devicetype-library/issues/4497> — no schema field for module bay types (2026-08-26)
25. <https://github.com/netbox-community/devicetype-library/issues/4190> — distinguish rendered elevations from photos (2026-05-22)
26. <https://github.com/netbox-community/devicetype-library/issues/4094> — default_platform in schema (2026-03-31)
27. <https://github.com/netbox-community/devicetype-library/issues/4210> — policy for rack-scale integrated systems (2026-05-28)
28. <https://github.com/netbox-community/devicetype-library/issues/4335> — Huawei port complement wrong (2026-07-07)
29. <https://github.com/netbox-community/devicetype-library/issues/4512> — HPE MGMT port not flagged mgmt_only (2026-08-29)
30. <https://github.com/netbox-community/devicetype-library/issues/4279> — pre-commit check for subdevice_role (2026-06-16)

### EasySchematic (duremovich/EasySchematic)

31. <https://github.com/duremovich/EasySchematic/issues/232> — patch panel routing without placing panels (2026-07-09)
32. <https://github.com/duremovich/EasySchematic/issues/293> — unresolved patch-panel sub-asks (2026-08-15)
33. <https://github.com/duremovich/EasySchematic/issues/283> — AVB/AVR wall panels and remote racks (2026-08-15)
34. <https://github.com/duremovich/EasySchematic/issues/281> — generic two-block patch/router element (2026-08-15)
35. <https://github.com/duremovich/EasySchematic/issues/188> — toggles to disable cable verification (2026-06-18)
36. <https://github.com/duremovich/EasySchematic/issues/369> — retire legacy paired patch-panel path? (2026-08-23)
37. <https://github.com/duremovich/EasySchematic/issues/362> — patch panels report: PDF/CSV diverge from screen (2026-08-22)
38. <https://github.com/duremovich/EasySchematic/issues/311> — dead legacy columns in patch panels report (2026-08-17)
39. <https://github.com/duremovich/EasySchematic/issues/319> — DXF export loses stub labels; PDF rasterised (2026-08-17)
40. <https://github.com/duremovich/EasySchematic/issues/335> — vectorised PDF exports (2026-08-18)
41. <https://github.com/duremovich/EasySchematic/issues/338> — cable-schedule import drops devices on the schematic (2026-08-18)
42. <https://github.com/duremovich/EasySchematic/issues/330> — rethink manual cable path editing (2026-08-18)
43. <https://github.com/duremovich/EasySchematic/issues/288> — auto-router shoves neighbouring cables (2026-08-15)
44. <https://github.com/duremovich/EasySchematic/issues/286> — lock path on a cable (2026-08-15)
45. <https://github.com/duremovich/EasySchematic/issues/287> — workflow to correct erroneous community device entries (2026-08-15)
46. <https://github.com/duremovich/EasySchematic/issues/302> — connector picker needs search and signal-aware filtering (2026-08-17)
47. <https://github.com/duremovich/EasySchematic/issues/313> — vendor-specific rack models for procurement (2026-08-17)
48. <https://github.com/duremovich/EasySchematic/issues/305> — procurement Owned/Need rethink (2026-08-17)
49. <https://github.com/duremovich/EasySchematic/issues/248> — need quantity inflated across rooms (2026-08-15)
50. <https://github.com/duremovich/EasySchematic/issues/351> — speaker impedance/wattage incl. 70 V/100 V (2026-08-22)
51. <https://github.com/duremovich/EasySchematic/issues/340> — switched-load ratings for relays/dimmers/contactors (2026-08-18)
52. <https://github.com/duremovich/EasySchematic/issues/347> — capability flags instead of device-type gating (2026-08-22)
53. <https://github.com/duremovich/EasySchematic/issues/366> — connection drag ghost preview misleads (2026-08-23)
54. <https://github.com/duremovich/EasySchematic/issues/363> — auto-inserted adapter lands on an existing device (2026-08-22)
55. <https://github.com/duremovich/EasySchematic/issues/285> — quote-to-schematic wizard (2026-08-15)
56. <https://github.com/duremovich/EasySchematic/issues/237> — drag a patched cable between ports (2026-07-26)
57. <https://github.com/duremovich/EasySchematic/issues/238> — choose which side of a patch port is in vs out (2026-07-26)
58. <https://github.com/duremovich/EasySchematic/issues/236> — make virtual / show on canvas should convert the connection (2026-07-26)
59. <https://github.com/duremovich/EasySchematic/issues/217> — v0.42 playtest follow-ups (slow file load, CSV mojibake, print columns) (2026-06-21)
60. <https://github.com/duremovich/EasySchematic/issues/219> — USB-A to USB-B treated as incompatible (2026-06-23)
61. <https://github.com/duremovich/EasySchematic/issues/154> — USB-C to Thunderbolt connections unavailable (2026-04-20)
62. <https://github.com/duremovich/EasySchematic/issues/146> — distance between rooms for cable length (2026-04-10)
63. <https://github.com/duremovich/EasySchematic/issues/144> — library of owned gear (2026-04-10)
64. <https://github.com/duremovich/EasySchematic/issues/134> — preserve cable routing when moving rooms (2026-04-10)
65. <https://github.com/duremovich/EasySchematic/issues/129> — patch panel label designer (2026-04-07)
66. <https://github.com/duremovich/EasySchematic/issues/120> — virtual channels for Dante/MADI/AES67 (2026-04-05)
67. <https://github.com/duremovich/EasySchematic/issues/111> — 2.1 MB app chunk / PWA precache limit (2026-04-02)
68. <https://github.com/duremovich/EasySchematic/issues/108> — hiding a signal type hides the pins (2026-04-02)
69. <https://github.com/duremovich/EasySchematic/issues/99> — language localization (2026-03-30)
70. <https://github.com/duremovich/EasySchematic/issues/93> — Docker support request (2026-03-30)
71. <https://github.com/duremovich/EasySchematic/issues/90> — PDF export scaling and margins (2026-03-28)
72. <https://github.com/duremovich/EasySchematic/issues/83> — rack management, citing Patchify (2026-03-28)
73. <https://github.com/duremovich/EasySchematic/issues/79> — edit device submissions while queued (2026-03-27)
74. <https://github.com/duremovich/EasySchematic/issues/78> — improve device search and filtering (2026-03-27)
75. <https://github.com/duremovich/EasySchematic/issues/77> — clone an existing device (2026-03-27)
76. <https://github.com/duremovich/EasySchematic/issues/68> — Microsoft link protection breaks magic-link login (2026-03-26)
77. <https://github.com/duremovich/EasySchematic/issues/59> — login link expires early (2026-03-25)
78. <https://github.com/duremovich/EasySchematic/issues/57> — auto-route performance warning (2026-03-25)
79. <https://github.com/duremovich/EasySchematic/issues/56> — 10-second routing on large schematics (2026-03-25)
80. <https://github.com/duremovich/EasySchematic/issues/31> — modular I/O cards in devices (2026-03-20)
81. <https://github.com/duremovich/EasySchematic/issues/27> — XLR/TRS combi port (2026-03-19)
82. <https://github.com/duremovich/EasySchematic/issues/3> — corporate firewall blocks the device-library API (2026-03-18)
83. <https://github.com/duremovich/EasySchematic/issues/1> — type-based cable naming (2026-03-18)

### Rackula (RackulaLives/Rackula)

84. <https://github.com/RackulaLives/Rackula/issues/1928> — Epic: Connectivity & Pro Audio (2026-06-06)
85. <https://github.com/RackulaLives/Rackula/issues/3086> — pro-audio interface types (2026-07-19)
86. <https://github.com/RackulaLives/Rackula/issues/267> — external connection handling (2025-12-30)
87. <https://github.com/RackulaLives/Rackula/issues/159> — flexible device layouts, half-width, blade chassis (2025-12-28)
88. <https://github.com/RackulaLives/Rackula/issues/1517> — pictures of assets (2026-03-24)
89. <https://github.com/RackulaLives/Rackula/issues/1732> — DXF export for AutoCAD interchange (2026-05-25)
90. <https://github.com/RackulaLives/Rackula/issues/1940> — patch list export CSV (2026-06-06)
91. <https://github.com/RackulaLives/Rackula/issues/2781> — client sync engine with offline write-back cache (2026-06-30)
92. <https://github.com/RackulaLives/Rackula/issues/2784> — account export to .Rackula.zip (2026-06-30)
93. <https://github.com/RackulaLives/Rackula/issues/2378> — privacy policy, ToS, data location/retention (2026-06-17)
94. <https://github.com/RackulaLives/Rackula/issues/2365> — Epic: hosted cloud sync & auth (2026-06-17)
95. <https://github.com/RackulaLives/Rackula/issues/1208> — Initiative: ecosystem interoperability (2026-02-13)
96. <https://github.com/RackulaLives/Rackula/issues/1094> — Epic: export/share stabilization (2026-02-09)
97. <https://github.com/RackulaLives/Rackula/issues/795> — spike: NetBox device-type repository fork strategy (2026-01-19)
98. <https://github.com/RackulaLives/Rackula/issues/1296> — cabling between devices (2026-02-20)

### WireViz (wireviz/WireViz)

99. <https://github.com/wireviz/WireViz/issues/3> — twisted wires (2020-06-24, 32 reactions)
100. <https://github.com/wireviz/WireViz/issues/222> — labels on cable ends (2021-03-10)
101. <https://github.com/wireviz/WireViz/issues/270> — connector to wire to wire to connector (2022-02-02)
102. <https://github.com/wireviz/WireViz/issues/350> — jumpers and interconnects (2024-05-18)
103. <https://github.com/wireviz/WireViz/issues/220> — import external YAML for shared definitions (2021-03-04)
104. <https://github.com/wireviz/WireViz/issues/211> — bringing WireViz to the web (2021-01-10)

### kumihimo (Love-Rox/kumihimo)

105. <https://github.com/Love-Rox/kumihimo/issues/87> — DXF import/export request from an AutoCAD-using AV professional (2026-08-13)

### Internal corpus (SNIPPET tier — prior pass, not re-verified here)

106. `docs/research/landscape/technical-planning.md` — product capabilities, price bands and the
     "What NOBODY in this segment solves well" gap list. Its own source-access caveat applies:
     every commercial price in it is search-snippet tier.

### Attempted and blocked (recorded so the gap is auditable)

`duckduckgo.com`, `www.bing.com`, `forum.vectorworks.net`, `www.capterra.com`, `www.wirecad.com`,
`www.controlbooth.com`, `netboxlabs.com`, `hn.algolia.com`, `web.archive.org`, `old.reddit.com`.
