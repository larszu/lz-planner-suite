# Pain points: Broadcast / OB / Live Production Management

Research date: 2026-08-29. Researcher: automated research pass (Claude).
Corpus language: English (repo docs mix DE/EN; research corpus stays EN).

> **Evidence labelling used throughout**
> - **FACT** — read on a page I actually opened; URL cited.
> - **FACT (via search extract)** — the page itself was blocked by this environment's
>   egress proxy, but a search engine returned quoted content from it. Weaker: I could
>   not verify surrounding context, date, or whether the quote was truncated.
> - **INFERENCE** — my reasoning from the above.
> - **UNKNOWN** — could not verify; states what would need checking.

---

## Method

### What I searched

| Angle | Status |
|---|---|
| GitHub issues + discussions (open-source products and API/control wrappers) | **Worked well** — primary source, 12 pages opened |
| Web search across review sites, forums, trade press, vendor docs | Worked (16 distinct queries, EN + DE) |
| Direct fetch of review sites (Capterra, G2, GetApp, Software Advice, TrustRadius) | **Blocked** by egress proxy |
| Direct fetch of Reddit | **Blocked** |
| Direct fetch of German forums (paforum.de), OMR Reviews | **Blocked** |
| Direct fetch of vendor support/docs portals (Rentman, farmerswife, Xytech/Fabric, Ontime docs, Sofie docs, DataMiner Dojo) | **Blocked** |

### Honest limitation on this pass

This environment's egress proxy blocked **17 of the domains I tried to open**, including
every software review site and every vendor support portal. Concretely blocked:
`capterra.com`, `softwareadvice.com`, `g2.com`, `omr.com`, `reddit.com`, `paforum.de`,
`support.rentman.io`, `rentman.io`, `support.farmerswife.com`, `fabricdata.com`,
`helpcenter.fabricdata.com`, `xytechsystems.github.io`, `docs.getontime.no`,
`sofie-automation.github.io`, `community.dataminer.services`, `tvnewscheck.com`,
`thestudiohero.com`.

**Consequence:** the open-source half of this segment (Sofie, Ontime, Companion modules)
is documented here from primary sources I read directly and is **strong**. The commercial
half (Xytech, ScheduALL, farmerswife, easyjob, PROVYS, Annova, Cuez, Ross, DataMiner) is
documented from **search-engine extracts only** and is **weaker** — treat it as leads to
re-verify, not as settled fact. Where I have nothing, I have written UNKNOWN rather than
filling the gap.

**Sources actually opened in full: 12** (all GitHub). Search-result extracts consulted
from roughly 13 further pages, each labelled as such below.

### A structural finding about this segment

There is **almost no public critical corpus** for the Tier-1 products. Xytech, PROVYS,
Annova OpenMedia and easyjob are sold through direct enterprise sales; their buyers are
facility CTOs under NDA, not people who post one-star reviews. Searches designed to
surface complaints (`"<product>" Kritik Probleme`, `"<product>" complaints slow`) returned
vendor marketing and trade-press product announcements almost exclusively.

**INFERENCE:** absence of public complaints here is *not* evidence of user satisfaction.
It is evidence of a closed procurement channel. The most reliable negative signal for
these products turned out to be **the vendors' own admissions** in migration and release
material (see Xytech/ScheduALL below), which is exactly where a vendor is forced to
name the problem it is fixing.

---

## Per-product findings

### Sofie (NRK, MIT, open source)

Best-documented product in this segment because its design debates happen in public RFCs.
All findings below were read directly.

- **STRENGTHS** — Even the RFCs criticising it treat it as production-grade: it has run
  NRK live news since 2018. Its rundown/playlist data model (Rundown → Segment → Part →
  Piece) is the best public reference in this segment. Contributions come from NRK, BBC
  and SuperFly.tv, so the criticism is from serious operators, not casual users.

- **WEAKNESSES**
  - **No high availability. A restart during a show is destructive.** FACT: RFC #1582
    (opened 2025-12-15, NRK) states a container restart "can often take 30s to come back
    up, which will cause shows to suffer." It further states that in Kubernetes "the
    system wants to be able to restart running containers freely. This is not good with
    sofie," and that preventing this "can have side effects such as blocking the cluster
    from being able to perform maintenance on the kubernetes nodes." No component
    (sofie-core, job-worker, playout gateway, input gateway, live status gateway)
    currently supports coordinated replicas.
    <https://github.com/Sofie-Automation/sofie-core/issues/1582>
  - **In-memory state blocks scale-out.** FACT: same RFC — "within sofie-core there are a
    few debounces/caches kept in memory that would cause inconsistencies if there were
    multiple instances running."
  - **Recovery from gateway downtime is actively harmful.** FACT: bug #1124 (opened
    2024-01-16, still open, labelled "help wanted"): when a Playout Gateway reconnects,
    Core runs *all* the auto-next Parts that would have played during the downtime "as
    fast as possible in a sequence of quick auto-nexts," loading Core and Gateway and
    potentially flooding controlled devices with commands. Open for over two and a half
    years. <https://github.com/Sofie-Automation/sofie-core/issues/1124>

- **MISSING FEATURES**
  - **No operator identity, no audit trail, coarse permissions.** FACT: RFC #1411 (BBC,
    opened 2025-03-24) asks for the ability to identify the operator of the current
    browser session, for permission levels fine enough for operator-level access control,
    and for logging of which operator performed which action. The RFC notes the blocker is
    architectural — SockJS (Meteor's WebSocket transport) passes only a limited set of
    predefined headers, so standard auth headers are hard to implement, possibly requiring
    a move off Meteor's DDP server.
    <https://github.com/Sofie-Automation/sofie-core/issues/1411>
  - Rehearsal mode rework (RFC #1470, 2025-06-12); unified logging (RFC #1575, NRK,
    2025-12-11); ESM migration (RFC #1603, 2026-01-19).

- **UX PROBLEMS** — **Configuration requires a JavaScript developer.** FACT (via search
  extract of Sofie's own docs): behaviour is defined by "Blueprints," which are
  "separate, webpacked JavaScript files which are uploaded into Sofie via the GUI," in
  three mandatory kinds (System, Studio, Showstyle). INFERENCE: this is not configuration,
  it is software delivery. A facility without an in-house JS developer cannot change how
  Sofie interprets its rundowns. This is the single largest adoption barrier and it is
  structural, not cosmetic.

- **PERFORMANCE PROBLEMS** — See the 30-second restart window and the auto-next storm
  above. Also open: #1065 (2023-11-08) UI does not correctly show onEnd-type infinite
  pieces; #1168 (2024-03-08) initial setup issue with persistent storage; #1337
  (2024-12-04) `ignore_piece_content_status` URL param does not work; #1749 (2026-05-15)
  "VMix not initialized yet."

- **PRICING PROBLEMS** — None. MIT-licensed. INFERENCE: the cost is displaced into
  integration labour rather than removed.

- **LOCK-IN** — Low by licence. INFERENCE: high in practice, because the blueprints that
  encode a facility's actual workflow are bespoke code that only its author understands.

- **OFFLINE** — Designed for it: playout control is deliberately kept on the studio LAN.
  This is the correct architecture for this segment and the clearest validation of an
  offline-first thesis.

- **INTEGRATION PROBLEMS** — Requires an external NRCS for rundowns; Sofie is automation,
  not a newsroom system. Integration is via gateways, and gateway downtime is exactly
  where bug #1124 bites.

---

### Ontime (cpvalente, GPL-3.0)

Read directly: issue lists, discussion list, and four individual issues.

- **STRENGTHS** — Genuinely offline-capable (Electron desktop for Win/macOS/Linux, plus
  Docker self-host), broad control surface (OSC/HTTP/WebSocket + a maintained Companion
  module), active maintenance, ~943 stars / 117 forks at time of reading.

- **WEAKNESSES / PERFORMANCE PROBLEMS**
  - **Crash with total project loss during a live show.** FACT: issue #1912 (2025-12-10),
    Ontime v4.0.2 in Docker on DigitalOcean, running a live show with multiple OSC
    connections. Uncaught `TypeError: Cannot read properties of undefined (reading
    'timeStart')`; the OSC server closed, the runtime service shut down, and the app came
    back up **with the demo project instead of the user's show**. No maintainer resolution
    was recorded on the thread; it is labelled "question" rather than a confirmed bug.
    <https://github.com/cpvalente/ontime/issues/1912>
  - Crash on OSC error: #1500 (2025-02-23), "All osc-strings must contain a null
    character."
  - Crash via WebSocket with an invalid eventID: #1874 (2025-11-22).
  - **Clock drift**: #1530 (2025-03-08) — clock time "wandering" versus time.is. For a
    timing product this is the most damaging class of bug there is. Related open request
    #2073 (2026-05-04) proposes using ntpjs.org for more accurate time.
  - **PDF printing only outputs the first page** when printing from the browser: #2014 /
    discussion (2026-03). Paper is the fallback when the network dies, so a broken print
    path removes the last safety net.

- **MISSING FEATURES** (from the discussions board — this is what users say they *want*)
  - **Date support** (Jan 2026) — INFERENCE: implies the rundown model is time-of-day
    only, so multi-day productions do not fit the data model.
  - Editing of unloaded rundowns (May 2026); NDI output (Oct 2024, 4+ upvotes); prompter
    style view (Jan 2026); drag-and-drop media files to auto-populate title and duration
    (Nov 2025); clip elapsed/remaining time read back from playout/media servers (Feb
    2026); external department "GO" signalling via web interface (Feb 2026); overtime
    carry-over to the next item's start (Nov 2024); timewarp/sneak (Sep 2025); edit
    multiple events (#1221); order of custom fields (#1068, oldest with traction).
  - **Sub-second precision refused.** FACT: issue #1614 (2025-05-21) asked for
    milliseconds or frames to sync with video files that end between full seconds. Marked
    **"Not planned"** ("Task is not part of the immediate roadmap"); no reasoning recorded
    on the thread. INFERENCE: Ontime is committed to second resolution, which rules it out
    for frame-accurate broadcast work.
  - #1499 "Add real preview in editor view" — also **Not planned** (2025-02-15).

- **UX PROBLEMS** — Minor but telling: #2011 (closed, Not planned) — on Windows, the X
  button, File > Exit and Alt+F4 all minimise to tray rather than quitting, against
  platform convention. #2063 (2026-04-16) broken clipboard copy in the share-link section.

- **PRICING PROBLEMS** — Core is free. Ontime Cloud is paid in two tiers (PRO, Studio).
  FACT (via search extract of docs.getontime.no): PRO is pitched at individuals and small
  teams with a fixed number of stages, no collaborator limit and no per-seat pricing;
  Studio adds stages and sharing flows. Exact figures: **UNKNOWN** — the pricing page was
  blocked; would need `docs.getontime.no/ontime-cloud/` or `getontime.no` opened directly.

- **LOCK-IN** — Low. FACT (via search extract): "Ontime remains fully open-source and
  self-hostable. Your data remains portable and you can move between Cloud and local
  versions." One of the few genuinely portable products in this segment.

- **OFFLINE** — Yes, and this is its differentiator. But note the asymmetry below.

- **INTEGRATION PROBLEMS**
  - **The cloud tier is functionally weaker than the local one.** FACT (via search extract
    of Ontime's docs): "OSC automation isn't currently available in Ontime Cloud."
    INFERENCE: this is the whole tension of the segment in one sentence — the hosted
    version cannot drive the devices, because the devices are on the studio LAN.
  - **Control-surface integrations break on major versions.** FACT: Companion module issue
    #127 (2025-10-12) — "Doesn't connect with v4.0 of OnTime"; #138 (2025-12-07) "No
    connection." Further module churn: #156 timer add/remove presets broken (2026-07-11),
    #144 custom-field property change broken (2025-12-25), #129 timer feedback does not
    handle negative values (2025-10-31), #121 add/remove time to aux timer broken
    (2025-09-26). Long-running gaps: #143 client control (open since 2025-12-14), #42
    "start event with cue" missing, #7 request for OnAir/off-air, running time, title and
    cue variables.
    <https://github.com/bitfocus/companion-module-getontime-ontime/issues>

---

### Rentman (NL)

All findings below are **via search extract** — `capterra.com`, `rentman.io` and
`support.rentman.io` were all blocked. Overall Capterra rating reported as 4.6/5 from 214
reviews, so these are minority complaints within a well-liked product. Relevant to this
repo because cable-planner already integrates it via `rentman:*` IPC.

- **STRENGTHS** — Conceded even by critics: strong rental/equipment management, praised
  customer support, QR/barcode warehouse flow, public API (unlike farmerswife, not paywalled).

- **WEAKNESSES / UX PROBLEMS** — FACT (via search extract, Capterra Cons fields):
  interface "looks a little dated, needs a modern refresh"; "combination management is a
  mess — the general idea works, but the UX needs a complete overhaul"; hard and slow
  learning curve; "still has many bugs, from language bugs to just things that don't work
  as smoothly as hoped"; CRM is lacking; templates are difficult to edit and the sales
  side is weaker than the rental side.

- **PERFORMANCE / MOBILE PROBLEMS**
  - FACT (via search extract, Capterra): "slow to find items in the database when scanning
    QR codes via the app"; slow on certain browsers; small usability bugs in the Android
    app and browser version — keys typed too fast are not recognised, app hangs or falsely
    displays "no internet connection."
  - **The vendor's own docs concede phone scanning is slow.** FACT (via search extract of
    support.rentman.io): scanning with a smartphone "is slower than proper scanners because
    Rentman Mobile uses the phone's camera to scan the code and the camera must be opened
    after every scan"; Zebra TC22/TC27 hardware scanners are recommended instead.

- **PRICING PROBLEMS** — FACT (via search extract, 2026 figures, **requires sales contact
  to confirm**, seen 2026-08-29): Crew Essential from **$14/user/month**; Inventory from
  **$19/user/month**; Rentman Suite **$39/month** with 1 free Power user. Add-ons priced
  separately: Quoting & Invoicing **€9/user/mo**, History Logs **€12/user/mo**, Equipment
  Tracking **€9/user/mo**, additional warehouse **€5/warehouse/mo**. Power users (who
  plan, schedule and create financial documents) are paid; execution staff (warehouse,
  technicians, freelancers) are free basic users. Reported sentiment: pricing is generally
  called flexible, but small teams say extra Power users and add-on subscriptions add up.
  **Caveat:** these figures come from third-party aggregators, not from a Rentman page I
  opened. Re-verify at `rentman.io/pricing` before quoting them anywhere.

- **LOCK-IN** — Cloud-only SaaS. Public API exists and is not paywalled, which is a
  genuine advantage over farmerswife. FACT (via search extract): some endpoints return 403
  due to rate limiting, and those responses "are not always explicitly listed in individual
  endpoint definitions" — i.e. undocumented throttling. Exact rate limits: **UNKNOWN**.

- **OFFLINE** — Weak and only partially documented. FACT (via search extract): invoices can
  be made available offline. Whether warehouse scanning works without connectivity:
  **UNKNOWN** — the "app hangs or displays no internet connection" complaint suggests it
  degrades badly rather than queueing. Would need to test the mobile app airplane-mode
  behaviour directly. **INFERENCE:** warehouse basements and OB truck compounds are exactly
  where connectivity fails, so this is the highest-value unverified claim in this dossier.

---

### farmerswife

All findings **via search extract** — `support.farmerswife.com` and all review sites blocked.

- **STRENGTHS** — Conceded by critics: the resource-scheduling timeline itself is well
  liked; conflict detection and cost tracking are the reasons people stay.

- **WEAKNESSES / UX PROBLEMS** — FACT (via search extract of Software Advice / G2 / GetApp
  review summaries): "outdated and unintuitive user interface causes a steep learning
  curve"; UI and layout are "unfamiliar to everyday users"; technical language is a barrier;
  "way too many unnecessary options that users never actually use, so it requires a lot of
  clicks to create simple tasks or projects." **Date caveat:** the Software Advice profile
  URL carries a 2023 marker, so some of this may predate current releases. Weak evidence
  on currency; strong on direction.

- **PERFORMANCE PROBLEMS** — FACT (via search extract): "the system slows down sometimes";
  updates take a long time and are needed constantly.

- **PRICING PROBLEMS** — Reported simply as "expensive." Figures: **UNKNOWN**, requires
  sales contact.

- **INTEGRATION PROBLEMS — the strongest finding for this product.**
  FACT (via search extract of farmerswife's own support pages):
  - The REST API requires **version 6.4 or later**.
  - The REST API is a **licensed paid feature**; pricing only via `sales@farmerswife.com`.
  - **"API support is not part of the normal farmerswife support agreement."**
  - Customers can additionally order "API 3rd party development consultancy" for onboarding
    *or to purchase enhancements to the REST API itself*.

  **INFERENCE:** this is a three-layer toll on integration — pay for the API, pay again for
  support of the API, pay a third time to have the API extended to cover what you needed.
  For a customer wanting to connect a planning tool, this is a harder barrier than a
  technically poor but free API would be. Worth re-verifying directly, as it is the single
  most actionable competitive fact in this dossier.

- **OFFLINE** — Cloud or onsite deployment both offered. Behaviour of the onsite version
  without internet: **UNKNOWN**.

---

### Xytech (formerly MediaPulse) and ScheduALL — Xytech Systems / Fabric

No page opened directly (`fabricdata.com`, `helpcenter.fabricdata.com`,
`xytechsystems.github.io`, `thestudiohero.com` all blocked). Everything below is **via
search extract**. Unusually, the most damaging statements are **the vendor's own**.

- **STRENGTHS** — Genuine Tier-1 breadth: jobs, resources, crews, vehicles, labour
  agreements, billing, cost recovery. Ships OpenAPI v3.0 specs viewable through Swagger UI,
  with an `/ApiDocs` index page from platform v10.2, plus webhooks (separate guide from
  10.4). An enterprise product shipping a discoverable API spec with each install is above
  average for this segment.

- **WEAKNESSES — vendor admissions about the ScheduALL acquisition (acquired 2021, reported
  ~$6m).** FACT (via search extract of fabricdata.com trends pages, corroborated across two
  independent queries):
  - "When Fabric merged with Xytech, we knew it was a mistake to discontinue support of
    ScheduALL because Xytech's platform wasn't feature ready."
  - X2, "the new cloud-native interface launching in Q2 2026," is said to address "the UX
    complexity that was the most consistent point of friction for users migrating from SCA."

  **INFERENCE:** read plainly, the vendor is conceding that (a) it removed support for a
  product whose replacement could not yet do the job, stranding customers, and (b) the
  replacement's UX was hard enough that it became the top migration complaint. For
  ScheduALL customers this is forced migration onto a less capable platform followed by a
  multi-year wait — the 2025 release (11.1) is described as only "the beginning" of
  delivering feature parity on transmission management and scheduling workflows.

- **PRICING PROBLEMS** — No public pricing; sales contact required. FACT (via search
  extract, third-party analysis, unsourced claims): a facility that mainly schedules rooms,
  tracks gear, assigns crew and bills clients "pays for all of that scope and uses a
  fraction of it," with the configuration, implementation engagement, upgrade path and
  internal expertise all being ongoing costs attached to modules never opened. **Weak
  evidence** — this is a competitor-adjacent listicle, not a customer. Treat as hypothesis.

- **LOCK-IN** — INFERENCE, high confidence: heavily configured-per-client enterprise ERP
  with a bespoke implementation engagement is the definition of switching cost, and the
  ScheduALL episode is the demonstration.

- **INTEGRATION PROBLEMS** — FACT (via search extract): "REST API v1 was Xytech's first
  REST API product and had limitations that required breaking changes, so v2 was made
  available from version 9.4." A breaking rewrite of the integration surface is a real cost
  to every customer who built against v1.

- **OFFLINE** — Browser-based, server-backed. **UNKNOWN** whether any offline mode exists;
  INFERENCE: almost certainly not.

- **ScheduALL specifically** — Now positioned as a migration source, not a growth product.
  A formal end-of-support date could **not** be found. **UNKNOWN** — would need Xytech
  support or the customer portal.

---

### Cuez (formerly TinkerList, EVS-invested)

- **STRENGTHS** — FACT (read directly, Bitfocus Companion bundled module HELP.md): Cuez
  Automator is controlled over **HTTP on port 7070 with WebSockets for updates**, exposing
  actions for triggering, timer management and project/episode selection, plus variables
  for automator metadata and project/episode information.
  <https://github.com/bitfocus/companion-bundled-modules/blob/main/tinkerlist-cuez-automator/companion/HELP.md>
  **INFERENCE:** a plain HTTP port on the local network means the Automator runs as a local
  service, so device control does not have to round-trip through the cloud. That is the
  right architecture and better than a pure-SaaS competitor.

- **WEAKNESSES** — The Companion help file documents no limitations, no constraints on
  concurrent connections and minimal setup detail. INFERENCE: thin integration
  documentation, which usually means integrators discover the edges by hitting them.

- **PRICING PROBLEMS** — FACT (via search extract, Capterra CA / GetApp / Software Advice):
  "Pricing is not provided by the vendor, and a price quote is required." Requires sales
  contact. Figures: **UNKNOWN**.

- **LOCK-IN / OFFLINE** — FACT (via search extract, vendor marketing): both cloud and
  on-premise are offered, with users able to "switch effortlessly between on-premises and
  cloud-based work." FACT: AWS publishes a TinkerList case study on improving speed and
  availability, confirming AWS hosting for the cloud side. **The on-prem claim remains
  unverified** — it comes from vendor marketing, not documentation. Would need the
  deployment docs or a sales conversation to confirm what actually runs on-prem versus what
  merely reconnects to the cloud afterwards.

---

### Ross Inception, Annova OpenMedia, PROVYS, Skyline DataMiner SRM, easyjob

Grouped because the finding is the same for all five: **no usable public complaint corpus
was reachable on this pass.**

- **Ross Inception** — Searches for user complaints returned only vendor brochures, a TV
  Tech shipping announcement and Ross's own tutorial material. FACT (vendor): entirely
  browser-based UI. UNKNOWN: everything about real-world performance and cost.

- **Annova OpenMedia** — FACT (via search extract, vendor/trade press): more than 20,000
  users worldwide; used by ARD/SWR. German-language searches for `Kritik`, `Probleme`,
  `veraltet`, `Bedienung` returned only marketing. A G2 review page exists but was blocked.
  UNKNOWN: all user sentiment.

- **PROVYS** — FACT (via search extract): built on open interfaces and BXF, with BXF
  playlist export, BXF as-run import and BXF content import. **This is a genuine strength
  worth crediting** — BXF 2.0 is a real interoperability standard, and supporting it in
  both directions is more open than most of this segment. UNKNOWN: user sentiment, pricing.

- **Skyline DataMiner SRM** — An active user forum exists (DataMiner Dojo, with an SRM
  Booking Manager tag) but was blocked. The only cost-adjacent statement found was
  Skyline's own FAQ hedging that cost "is a complex matter that involves a lot of
  considerations that go beyond the sticker price" — INFERENCE: no public pricing.
  UNKNOWN: user sentiment. **This is the highest-value blocked source on the list**; a
  Q&A forum tagged by feature is exactly where real pain surfaces.

- **easyjob (protonic, DE)** — Two leads, both blocked and both needing re-verification:
  1. A PA-Forum thread on easyjob experience. FACT (via search extract): users say
     "clarity is not exactly the program's strength"; that version 3.0 was *slower* than
     its predecessor, "making users feel transported back to old 386 times where windows
     gradually fill with content"; that larger multitasking is impossible despite modern
     hardware; and that easyjob is "not very clear and overstuffed with all sorts of
     functions that only a fraction of users need."
     **Strong date caveat:** the "386 times" remark is about version 3.0 and reads as old.
     I could not establish the post dates. Treat as historical unless re-verified.
  2. **A dated migration account, easyjob → Rentman.** FACT (via search extract of a
     Capterra comparison page, review dated **December 2025**): the reviewer gave as
     reasons for leaving easyjob 3.0 "Teurer oder zu geringerer Support" (more expensive or
     inadequate support) and "Zu wenig Möglichkeiten die Software selber anzupassen" (too
     few options to customise the software yourself), praising Rentman for adapting to the
     business "without immense programmer costs."
     **INFERENCE:** self-service customisation versus billable vendor customisation is the
     axis on which the German rental ERP market is currently being lost. This is the most
     recent and most specific German-market datapoint in this dossier.

---

## Cross-product patterns

These repeat across multiple independent vendors and are the most valuable output here.

### 1. The cloud tier cannot reach the devices — widespread, and structural

The single clearest pattern. Ontime's own documentation states **OSC automation is not
available in Ontime Cloud** while it works locally. Sofie deliberately keeps playout
control on the studio LAN. Cuez Automator is reached over **plain HTTP on port 7070**, a
local-network address. Vendors are converging on the same conclusion from opposite
directions: rundown editing benefits from the cloud, device control cannot live there.
**INFERENCE:** any product that markets itself as cloud-native in this segment either has a
local agent it does not talk about, or it cannot actually drive hardware.

### 2. Integration is priced, throttled, or broken by version churn — widespread

Three distinct failure modes, one per vendor tier:
- **Priced:** farmerswife gates the REST API behind a paid licence, excludes it from the
  normal support agreement, *and* sells consultancy to extend it.
- **Throttled and under-documented:** Rentman returns 403s from rate limiting on endpoints
  where that response "is not always explicitly listed" in the endpoint definition.
- **Broken by version churn:** Xytech's REST v1 "had limitations that required breaking
  changes," forcing a v2. The Companion module for Ontime failed outright against Ontime
  v4.0 (#127) and has a steady stream of feature-breakage issues.

An integrator therefore cannot assume a stable, free, documented API anywhere in this
segment. **This is the most exploitable weakness found.**

### 3. Enterprise scope is bought whole and used in fractions — recurring

farmerswife: "way too many unnecessary options that users never actually use... a lot of
clicks to create simple tasks." easyjob: "overstuffed with all sorts of functions that only
a fraction of users need." Xytech (weaker source): pays for all the scope, uses a fraction.
Three different vendors, three different countries, the same complaint. **INFERENCE:** the
opening is a tool that does one job completely rather than twenty jobs partially.

### 4. Customisation costs programmer time — recurring, and the German market is moving on it

Sofie requires webpacked JavaScript blueprints uploaded through the GUI. easyjob lost at
least one documented customer (Dec 2025) for offering "too few options to customise the
software yourself," to a competitor praised for adapting "without immense programmer
costs." **INFERENCE:** self-service configuration is a live purchasing criterion right now,
not a nice-to-have.

### 5. Restart and reconnect are treated as exceptional, but in live production they are normal — recurring

Sofie: a 30-second restart "will cause shows to suffer"; gateway reconnection triggers a
destructive auto-next storm (open 2.5 years). Ontime: a crash during a live show restored
the **demo project** over the user's rundown. Rentman: the app "hangs or displays no
internet connection." Every one of these is a recovery-path failure, not a happy-path
failure. **INFERENCE:** this segment's products are tested against shows that go well.

### 6. Timing correctness is not a solved problem — recurring

Ontime shows clock drift against a reference (#1530), OSC-triggered crashes (#1500), and
has declined sub-second precision as "Not planned" (#1614). For products whose entire
purpose is time, this is a striking gap — and it means frame-accurate work still has no
open-source answer.

### 7. Paper and spreadsheets remain the real incumbent — widespread

FACT (via search extract): major international broadcasts including Eurovision and sports
productions are reportedly orchestrated using Excel spreadsheets, with the acknowledged
risk that crew work from outdated printed or emailed copies. Meanwhile Ontime's
browser-based PDF export only prints the first page. **INFERENCE:** the competitor to beat
is not Xytech, it is a spreadsheet plus a printer — and losing the print path is losing to
it directly. A new entrant that treats export and print as first-class has an advantage
over incumbents that treat them as afterthoughts.

### 8. MOS is a legacy tax on every modern integration — widespread

FACT (via search extract, Vizrt/Viz Flowics material): newer graphics technologies such as
HTML5 "did not offer native MOS compatibility, creating an integration roadblock to
existing news broadcast workflows," which vendors work around by shipping dedicated MOS
Gateway products. INFERENCE: MOS is a required adapter, not a capability, and everyone pays
for it.

### 9. No public pricing anywhere above the SMB tier — widespread

Xytech, easyjob, Cuez, farmerswife, PROVYS, Annova, DataMiner: all require sales contact.
Only Rentman and Ontime publish figures. INFERENCE: published, honest pricing is itself a
differentiator in this market.

---

## Direct quotes-of-substance

All paraphrased. Nothing below is invented; where I could not open the page myself it is
marked, and those should be re-verified before being quoted externally.

1. **On Sofie having no HA path** — a restart of a container often takes about 30 seconds
   to come back, and shows will suffer for it; Kubernetes wanting to restart containers
   freely "is not good with sofie."
   RFC #1582, opened 2025-12-15 (NRK). *Read directly.*
   <https://github.com/Sofie-Automation/sofie-core/issues/1582>

2. **On why Sofie cannot simply scale out** — sofie-core keeps debounces and caches in
   memory that would cause inconsistencies if multiple instances ran.
   Same RFC. *Read directly.*

3. **On Sofie's destructive recovery** — when a Playout Gateway comes back after downtime,
   every Part that would have played meanwhile is run through as fast as possible in a
   sequence of quick auto-nexts, loading Core and Gateway and potentially flooding
   controlled devices with commands. Open since 2024-01-16, labelled "help wanted."
   *Read directly.* <https://github.com/Sofie-Automation/sofie-core/issues/1124>

4. **On Sofie having no operator audit trail** — the BBC asks to identify the operator of
   the current browser session, for finer permission levels, and for logging of which
   operator did what; the blocker is that SockJS passes only a limited set of predefined
   headers. Opened 2025-03-24. *Read directly.*
   <https://github.com/Sofie-Automation/sofie-core/issues/1411>

5. **On losing a live show to a crash** — Ontime v4.0.2 in Docker crashed during a live
   show with multiple OSC connections and came back up with the demo project in place of
   the user's rundown; no maintainer resolution recorded. Reported 2025-12-10. *Read
   directly.* <https://github.com/cpvalente/ontime/issues/1912>

6. **On sub-second precision being declined** — a request for milliseconds or frames, to
   sync with video files ending between full seconds, was marked "Not planned" with no
   recorded reasoning. 2025-05-21. *Read directly.*
   <https://github.com/cpvalente/ontime/issues/1614>

7. **On control surfaces breaking across versions** — the Bitfocus Companion module for
   Ontime did not connect with Ontime v4.0. 2025-10-12. *Read directly.*
   <https://github.com/bitfocus/companion-module-getontime-ontime/issues>

8. **On the cloud tier being the weaker one** — Ontime's documentation states OSC
   automation is not currently available in Ontime Cloud. *Via search extract of
   docs.getontime.no; page blocked. Re-verify.*

9. **On Xytech discontinuing ScheduALL too early** — the vendor writes that when Fabric
   merged with Xytech, they knew it was a mistake to discontinue support of ScheduALL
   because Xytech's platform was not feature ready. *Via search extract of fabricdata.com;
   page blocked. Corroborated across two independent searches. Re-verify.*

10. **On migration UX being the top complaint** — X2, the cloud-native interface due Q2
    2026, is described as addressing the UX complexity that was "the most consistent point
    of friction" for users migrating from ScheduALL. *Via search extract of fabricdata.com;
    page blocked. Re-verify.*

11. **On farmerswife charging three times for integration** — the REST API requires v6.4+,
    is a licensed paid feature, API support is explicitly not part of the normal support
    agreement, and consultancy can be purchased both for onboarding and to fund
    enhancements to the API itself. *Via search extract of support.farmerswife.com; pages
    blocked. Re-verify — this is the most actionable claim in the dossier.*

12. **On leaving easyjob for Rentman** — a December 2025 reviewer cited more expensive or
    inadequate support and too few options to customise the software oneself, praising the
    replacement for adapting to the business without immense programmer costs. *Via search
    extract of a Capterra comparison page; blocked. Re-verify.*

13. **On easyjob's density** — forum users say clarity is not the program's strength and
    that it is overstuffed with functions only a fraction of users need; one remark
    describes version 3.0 as slower than its predecessor, like "old 386 times" with windows
    filling gradually. *Via search extract of paforum.de; blocked. Post dates not
    established — likely dated. Treat as historical.*

14. **On phone scanning being slow, from the vendor** — Rentman's support material states
    smartphone scanning is slower than proper scanners because the app uses the phone
    camera and the camera must be reopened after every scan. *Via search extract of
    support.rentman.io; blocked. Re-verify.*

15. **On spreadsheets still running major broadcasts** — even Eurovision and large sports
    broadcasts are reportedly orchestrated with Excel, with the attendant risk of crew
    working from outdated printed or emailed copies. *Via search extract; vendor-adjacent
    blog (rundownstudio.app), so treat the framing as marketing even if the observation
    rings true.*

16. **On MOS blocking modern graphics** — HTML5 graphics systems lacked native MOS
    compatibility, creating an integration roadblock into existing news workflows, which
    vendors solved by shipping dedicated MOS Gateways. *Via search extract of Vizrt / Viz
    Flowics material.*

---

## What I would check next

Ordered by value, given that all of these were blocked on this pass:

1. `community.dataminer.services/questions/tags/srm-booking-manager/` — a feature-tagged
   user Q&A forum; the richest unmined vein found.
2. `support.farmerswife.com` articles 17000089578 and 17000057059 — to confirm the
   paid-API / excluded-support / paid-enhancement chain verbatim.
3. `capterra.com/p/144616/Rentman/reviews/` pages 8-10 — the low-star tail, plus
   `rentman.io/pricing` to confirm the figures quoted above.
4. `fabricdata.com/trends/...` — to confirm the ScheduALL admissions in context and with
   a publication date.
5. `docs.getontime.no/ontime-cloud/` — Cloud pricing and the full local-vs-cloud feature
   delta, of which OSC is only the one gap I happened to find.
6. Reddit r/VIDEOENGINEERING and r/broadcastengineering — entirely unmined; the only
   likely source of candid Ross Inception and Annova OpenMedia sentiment.
7. Cuez deployment documentation — to settle whether "on-premise" means a genuinely
   offline-capable install or a local Automator that still depends on the cloud for the
   rundown.

---

## Sources

### Opened and read in full (12)

1. <https://github.com/cpvalente/ontime/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
2. <https://github.com/cpvalente/ontime/issues?q=is%3Aissue+performance+OR+slow+OR+crash+OR+lag>
3. <https://github.com/cpvalente/ontime/issues/1614>
4. <https://github.com/cpvalente/ontime/issues/1912>
5. <https://github.com/cpvalente/ontime/discussions>
6. <https://github.com/cpvalente/ontime/discussions/2011>
7. <https://github.com/Sofie-Automation/sofie-core/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
8. <https://github.com/Sofie-Automation/sofie-core/issues/1582>
9. <https://github.com/Sofie-Automation/sofie-core/issues/1411>
10. <https://github.com/Sofie-Automation/sofie-core/issues/1124>
11. <https://github.com/bitfocus/companion-module-getontime-ontime/issues>
12. <https://github.com/bitfocus/companion-bundled-modules/blob/main/tinkerlist-cuez-automator/companion/HELP.md>

### Consulted via search-engine extract only — page blocked by egress proxy, content not independently verified

13. <https://www.capterra.com/p/144616/Rentman/reviews/> — Rentman cons fields
14. <https://www.capterra.com/rental-software/compare/35069-144616/easyjob-3-0-vs-Rentman> — easyjob to Rentman migration review, Dec 2025
15. <https://www.softwareadvice.com/project-management/farmerswife-profile/reviews/> — farmerswife cons (2023 marker)
16. <https://support.farmerswife.com/support/solutions/articles/17000089578-farmerswife-rest-api-for-your-own-3rd-party-integrations> — paid API terms
17. <https://support.farmerswife.com/support/solutions/articles/17000057059-does-farmerswife-offer-an-api-> — API availability
18. <https://www.fabricdata.com/trends/what-scheduall-got-right-about-transmission-and-where-xytech%E2%80%99s-x2-goes-further> — ScheduALL admissions, X2
19. <https://www.fabricdata.com/trends/the-new-xytech-is-here-18-months-in-the-making-built-for-what-s-next> — Xytech relaunch
20. <https://helpcenter.xytechsystems.com/hc/en-us/articles/21789230412571-Media-Operations-Platform-REST-API-Reference-10-6> — REST API v1 limitations, v2 from 9.4
21. <https://docs.getontime.no/ontime-cloud/> — Cloud plans; OSC unavailable in Cloud
22. <https://support.rentman.io/hc/en-us/articles/360015601560-Scan-Equipment-in-the-Mobile-App-Basic-Usage> — smartphone scanning slower than hardware scanners
23. <https://support.rentman.io/hc/en-us/articles/26707946497042-Rentman-API-Changelog> — undocumented 403 rate limiting
24. <https://rentman.io/pricing> — pricing tiers and add-ons (figures via aggregators; unconfirmed)
25. <https://paforum.de/forum/index.php?thread/28192-vermietsoftware-easyjob-erfahrungen/> — easyjob German forum criticism (dates not established)
26. <https://github.com/Sofie-Automation/Sofie-TV-automation/blob/main/documentation/getting-started.md> — blueprints as webpacked JS uploaded via GUI (direct fetch 404'd; content via search extract)
27. <https://www.flowics.com/nrcs-integration/> and <https://www.vizrt.com/vizrt/press-center/viz-flowics-nrcs-integration-mos-protocol/> — HTML5 lacking native MOS support
28. <https://rundownstudio.app/blog/pros-cons-of-using-excel-run-a-show/> — Excel as incumbent (vendor-adjacent, treat as marketing)
29. <https://skyline.be/faq> — cost "beyond the sticker price"
30. <https://provyssphere.tv/sphere-pro/> — PROVYS BXF import/export support

### Attempted and blocked, no usable content retrieved

`www.g2.com`, `www.softwareadvice.com` (direct), `omr.com`, `www.reddit.com`,
`community.dataminer.services`, `tvnewscheck.com`, `thestudiohero.com`,
`sofie-automation.github.io`, `xytechsystems.github.io`, `helpcenter.fabricdata.com`.
