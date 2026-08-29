# Pain points: Asset Tracking / Barcode / QR / Maintenance / Cases

Research date: **2026-08-29** (brief dated 2026-08-28). Researcher: automated user-research
pass, AV Planner Suite research corpus.

Segment scope: products whose job is to know *which physical box is where, who has it, whether
it is broken, and whether it came back* — barcode/QR/RFID identity, checkout/check-in loops,
inspection and maintenance state, and the container/case models that let a flight case be
scanned as one object.

---

## Method

### Environment limits — read this first, it decides how much to trust everything below

This pass ran under two hard constraints that materially shaped what could be evidenced.

**1. The WebSearch budget for the session was already exhausted** (200/200 calls used) before
this segment started. The brief asks for 8–15 distinct web searches across Reddit, review
sites, forums and German-language sources. **Zero keyword web searches were possible.**

**2. The network egress proxy allows only GitHub.** Reachability was probed directly with
`curl` through the proxy (`https://$HTTPS_PROXY/__agentproxy/status` confirms
`connect_rejected` / "gateway answered 403 to CONNECT" for third-party hosts). Confirmed
**reachable**: `github.com`, `raw.githubusercontent.com`, `gist.github.com`. Confirmed
**blocked** (HTTP 000/403 at the proxy, tested this session):

> `reddit.com`, `g2.com`, `capterra.com`, `trustradius.com`, `sourceforge.net`,
> `alternativeto.net`, `stackoverflow.com`, `news.ycombinator.com`, `snipe-it.com`,
> `snipe-it.readme.io`, `shelf.nu`, `inventree.org`, `docs.inventree.org`, `cheqroom.com`,
> `help.cheqroom.com`, `rentman.io`, `hirehop.com`, `current-rms.com`,
> `flexrentalsolutions.com`, `protonic.de`, `timly.com`, `geartracking.com`,
> `controlbooth.com`, `blue-room.org.uk`, `film-tv-video.de`, `production-partner.de`,
> `forums.prosoundweb.com`.

**Consequences, stated plainly:**

- **Angles 1, 2, 4, 5 and 6 of the brief are unexecuted.** No Reddit, no G2/Capterra/GetApp/
  TrustRadius/Trustpilot star reviews or "Cons" fields, no AV professional forums, no German
  forums (`film-tv-video.de`, `production-partner.de`), no vendor changelogs or status pages
  except those hosted on GitHub. **Treat the absence of that evidence as a hole in the method,
  not as evidence that AV pros are happy.**
- **No prices could be verified.** Every vendor pricing page in this segment is blocked. The
  only price in the brief (Timly from EUR 185/mo, higher tiers from EUR 495/mo, seen
  2026-08-29) comes from the landscape pass, not from this one. **This dossier asserts no
  prices of its own.** The `PRICING PROBLEMS` sections below say what is structurally known
  (licence model, hosting model) and mark the rest UNKNOWN.
- **Angle 3 (GitHub) was executed thoroughly**, and it turned out to be unusually productive
  for this segment — see below.

The GitHub REST API is *also* gated in this environment (`api.github.com` answers
"sessions are bound to their configured repositories"), and `add_repo` grants anonymous **git
read only**, not API access. GitHub HTML pages fetched through the fetch tool were therefore
the working channel. `github.com/search` (global search) rate-limited at HTTP 429 with
`Retry-After: 3600` after three calls; repository-scoped `/issues?q=` pages kept working and
carried the load.

### What was actually read

**62 distinct URLs opened.** Breakdown:

| Source class | Count | What it gave |
|---|---|---|
| Repo-scoped GitHub issue searches (`/issues?q=…`) | 27 | Issue inventories per product per theme (barcode, label, API, offline, RFID, performance, mobile, audit) |
| Individual GitHub issues read in full | 20 | Dates, status, reporter's own words, maintainer response |
| Repo landing pages + READMEs (incl. `raw.githubusercontent.com`) | 11 | Feature lists, disclaimers, archive notices, API base URLs |
| GitHub release feeds | 2 | Verified release dates (`releases.atom`) |
| GitHub repository search (API, via MCP) | 4 queries | Ecosystem size around each commercial product |

**Products with strong evidence:** Current RMS, Snipe-IT, shelf.nu, InvenTree.
**Products with thin but real evidence:** Cheqroom, HireHop, Rentman.
**Products with no evidence found:** Flex Rental Solutions, easyjob, Timly, Geartracking —
these are reported as UNKNOWN rather than guessed at.

### The methodological windfall

The single most valuable source found is not a review site. It is
[`CompositeLight/currentRMS-helper`](https://github.com/CompositeLight/currentRMS-helper) — a
free Chrome extension, written by one person, whose entire purpose is to patch missing
functionality into the Current RMS web UI. Its `Features.md` (21.6 KB, read in full) is a
line-by-line inventory of what Current RMS does not do, each entry written by a warehouse
practitioner explaining *why* it hurt. Its 59 open issues are a queue of further complaints.

This is the pattern the brief predicted ("a pile of issues against an API wrapper reveals API
weaknesses"), and it generalises: **in this segment, the existence and content of community
patch layers is the highest-signal evidence available.** The same pattern recurs around
HireHop (a scatter of `hirehop-plugins` repos) and Rentman (three independent unofficial API
clients, no official SDK).

### Frequency grading used below

- **isolated** — one report, one source. Recorded, not relied on.
- **recurring** — several independent reports, or one report corroborated by a structural fact
  (a missing endpoint, an archived repo, a long-open issue).
- **widespread** — a theme visible across multiple products or many issues.

Because review sites and Reddit were unreachable, **almost nothing here is graded
`widespread` on the strength of user volume**; the `widespread` labels that do appear are
earned by the same complaint appearing across *multiple independent vendors*, which is the one
kind of breadth GitHub could still show.

---

## Per-product findings

### Current RMS (Kerridge Commercial Systems, UK)

Evidence base: the `currentRMS-helper` extension README and `Features.md`, plus 24 of its 59
open issues. This is second-hand about Current RMS itself (the vendor's own site is blocked),
but it is *first-hand* from Current RMS users describing their daily warehouse workflow. The
extension's author is explicit about his position: *"This extension is a personal side
project, written by me. I am not a professional programmer. Use entirely at your own risk.
This code is in no way affiliated with InspHire Ltd, or any of my employers."*
([README](https://github.com/CompositeLight/currentRMS-helper), read 2026-08-29, extension
version 2.1.3).

**STRENGTHS (what even critics concede)**

- The data model underneath is sound enough that a browser extension can enrich it rather than
  replace it — availability, quarantine, inspections, containers, sub-hires, weights and
  costs all exist as first-class concepts. The extension surfaces and combines them; it does
  not invent them. FACT, inferred from `Features.md` describing existing fields it reads.
- The REST API is real and useful: the extension's best features ("Product Inspector",
  availability counts, quarantine blocking, global-search-by-asset-number) are explicitly
  marked *requires API*.
- Serialised containers exist as a concept, with a container field on allocations.
- Quarantine exists as a state with typed reasons (the extension can show "quarantine
  counts/types" on hover).

**WEAKNESSES**

- **Nested container book-out is broken and the extension author cannot work around it.**
  `Features.md`, describing the "Auto Book Out Nested Containers" setting, states that
  Current RMS *"will just book out the first level contents of a container regardless of its
  status, and I can't currently block this insane behaviour"* — meaning a forgotten "Reserved"
  item inside a nested case can be silently flipped to "Booked Out". **FACT** (read
  2026-08-29). Frequency: recurring — corroborated by open issue
  [#136](https://github.com/CompositeLight/currentRMS-helper/issues) "Auto Book Out Nested
  Containers not working" (2026-01-25).
- **Ad-hoc containers cannot carry a weight.** `Features.md`: *"there is no way to give an
  adhoc container a weight value, so the figure given is for the contents only."* For a case
  weight written on a road label, that is the number you actually need. FACT.
- **Quarantined gear is not blocked from going onto a job.** The extension adds
  "Block Quarantined Allocations" as a *setting it introduces* (on by default), and refreshes
  quarantine status only every 30 minutes because it is polling the API. FACT. This is the
  exact capability the landscape pass credits HireHop with having natively (blocking rules).
- **You cannot scan an item into quarantine.** Open issue #68, "Feature Request: Scan item to
  quarantine" (2024-09-16). Damage flagging requires leaving the scan loop.
- **Overdue inspections are invisible while scanning.** `Features.md`: *"Previously you
  wouldn't know about the missing inspection unless you were looking at the screen whilst
  scanning."* The extension adds a spoken warning naming the asset number. FACT.
- **Bulk item check-in is bad enough to want stopped.** Open issue #94, "Stop or Improve Global
  Check In of Bulk Items" (2024-12-03).
- **No serialised filter.** Open issue #88, "Feature Request: Serialised Filter" (2024-10-31).
- A vendor update on **2026-04-15** broke both the extension and, per the reporter, Current
  RMS's own allocation flow — *"Current pushed an update this morning that appears to have
  broken all currentRMS-helper functions"*, with users able to allocate only a single item
  before needing a page refresh
  ([#142](https://github.com/CompositeLight/currentRMS-helper/issues/142)). Frequency:
  isolated as an incident; the README's changelog also mentions fixing *"various additional
  glitches caused by the CurrentRMS lazy-lo[ading]"*, so vendor front-end churn breaking the
  warehouse layer is recurring.

**MISSING FEATURES (what users request)**

Taken from `Features.md` — every item there is, by definition, something Current RMS did not do
— and from the extension's open issues:

- **Command barcodes.** The extension invents a whole vocabulary so warehouse staff never
  touch a keyboard: `freescan` toggles free-scan mode, `*revert*` reverts an item by scanning
  it, a remove-by-scan barcode deletes an item regardless of status, `*container*` sets or
  clears the container field, and `allocate` / `bookout` switch scanning mode. Current RMS
  ships none of these. Open issue #78 asks for *"the 'magic barcodes' [on] the other tabs"*
  (2024-09-30).
- **Bulk-quantity barcodes.** The extension accepts a barcode encoding a quantity — a label
  reading `*%5%90210*` adds five of product 90210. Open issue #133 (2025-09-01) asks for more.
  Native Current RMS is one-scan-one-unit.
- **Scan-to-open / scan-to-close containers.** The extension implements it and notes it is
  *"similar behaviour to other hire management software; 'opening' and 'closing' containers"* —
  i.e. a segment norm Current RMS lacks.
- **One-step container check-in.** `Features.md`: *"we were frustrated by the fact that getting
  items back into temporary containers was a two step process: First scan the items in, then
  scan them into a temporary container."*
- Availability counts in Order View; warehouse location display (#129, 2025-08-04); stock
  addition from a PO page (#128, 2025-07-18); matched components on temporary containers (#89,
  2024-11-01); clone purchase order (#69); transfers on document layouts (#90).

**UX PROBLEMS**

This is where the evidence is richest, and where it is most transferable to any scanning tool.

- **The UI loses scanner focus.** The extension's "Helpful Cursor" exists because *"the cursor
  will now automatically jump back into the allocation/scan input box after certain actions"* —
  expanding a tree, toggling a slider. Without it, scans go nowhere.
- **Audio feedback is binary; warehouse hands cannot look at the screen.** Native Current RMS
  gives *"a generic error buzz"* for every failure. The extension adds distinct spoken
  messages — "Container already allocated", "Already scanned", an overdue-inspection prompt
  naming the asset — and a different scan sound when an item goes *into* a container. It also
  offers Full (voice) / Short (extra beep) / Off alert levels. **This is the single most
  reusable UX finding in the dossier: in a warehouse, feedback must be semantic and audible,
  not visual and binary.**
- **Page reloads destroy your place in the list.** "Scroll Memory" exists because *"page reload
  actions (such as reverting an item) mean you lose your place in the list, which can be very
  disorientating."* Open issue #127, "Remember position on page in products" (2025-07-10),
  asks for the same elsewhere.
- **Identifying unfamiliar gear costs you the scan context.** The Product Inspector shows a
  photo, weight and all store locations in a modal, because *"the information provided is
  already available within CurrentRMS, but requires clicking away from the scanning page."*
- **Error toasts pile up unreadably.** The extension adds timestamps *"so it's easier to
  identify when errors occurred if you return to a screen full of red messages"*, allows
  auto-dismiss after N seconds *"primarily aimed at those using scanners with integrated
  screens"*, and overrides CSS so the toast container can scroll when it overflows.
- **Modal dialogs interrupt scanning.** On Global Check-in of an item booked out to multiple
  opportunities, a confirmation box *"requires interaction which means going back to the
  computer and disrupts scanning."*
- **Search terms are lost when changing view settings**; modal headers scroll off so the close
  button vanishes; the Costs view needed a CSS override *"to prevent the quantity column from
  vanishing(!)"*; completing an activity took *"clicking through two further pages (!)"*.
- A vendor-added "Delete from Detail View" feature is described as *"controversial"* and the
  extension ships a switch to disable it — a vendor shipping a destructive action users want
  turned off.

**PERFORMANCE PROBLEMS**

UNKNOWN in any measured sense. The only signal is #142 (2026-04-15), where a vendor update left
users able to allocate one item per page refresh, and README references to glitches from
Current RMS lazy-loading. No evidence of large-inventory scaling problems was found; the
blocked sources are where that would live.

**PRICING PROBLEMS**

UNKNOWN — `current-rms.com` is blocked and no price was verifiable this session. Structural
facts only: it is cloud-only SaaS (the extension patches a *web interface*, and there is no
self-hosted artefact anywhere in the ecosystem). INFERENCE: seat/cloud pricing applies, but
this is not verified.

**LOCK-IN**

- **API keys are all-or-nothing.** The extension's install instructions quote Current RMS
  directly: *"API Keys give read and write access to your Current RMS System. You should keep
  your keys safe just as you do your username and password."* There is no read-only or scoped
  key. FACT (README, read 2026-08-29).
- **That coarse key model demonstrably blocks integration.** Open issue #138 (2026-01-25) asks
  for a *non-API* import of product and stock levels because the requester *lacks managerial
  approval to use API keys* and would rather do manual CSV exports; #139 asks the same for
  quarantine data. **This is the causal chain worth naming: because a key is equivalent to a
  password, management refuses to issue one, so users fall back to CSV — and the API's
  existence buys them nothing.** FACT (the two issues) + INFERENCE (the causal link).
- Cloud-only with no local artefact: your warehouse workflow lives in someone else's DOM, and
  a vendor deploy can change it overnight (#142).

**OFFLINE**

No offline story found, and none requested in the extension's issues. INFERENCE: a Chrome
extension patching a live web UI, with quarantine state refreshed by 30-minute API polling,
implies a permanently-online model. Marked INFERENCE, not FACT — `current-rms.com` is blocked.

**INTEGRATION PROBLEMS**

- Two open issues (#138, #139) exist specifically to route *around* the API.
- The community integration surface is a **DOM-patching browser extension**, which is the
  most fragile integration mechanism there is, and #142 shows it breaking on a vendor deploy.
- Separately, a third-party repo exists to stop AI assistants generating Liquid template syntax
  that Current RMS does not support (`skillsandthrills/current-rms-liquid-skill`, created
  2026-07-16) — INFERENCE: the document-template language is a restricted Liquid subset whose
  divergence from stock Liquid is itself a friction point. Not verified against vendor docs.

---

### Snipe-IT (Grokability, Inc.) — AGPLv3, self-hostable

Evidence base: 11 repo-scoped issue searches and 6 individual issues on
[`snipe/snipe-it`](https://github.com/snipe/snipe-it), plus the release feed. Release dates
verified from `releases.atom`: **v8.7.0 = 2026-08-11, v8.7.1 = 2026-08-17, v8.7.2 =
2026-08-19** (this corrects a mis-parse of the HTML releases page, which rendered the years as
2024).

**STRENGTHS**

- Actively and rapidly maintained: three releases in nine days in August 2026.
- The label engine really is the segment's best — but note that "best" here means "has enough
  surface area to generate nine open feature requests" (see below).
- The REST API is comprehensive enough that the open API issues are about *refinements*
  (Markdown field rendering, attachments on log entries, multi-valued custom fields) rather
  than about missing core operations. That is a meaningful compliment.
- Recent release work shows real engineering on N+1 query elimination, pagination and custom
  report speed.
- Free and self-hostable under AGPLv3 — no seat cost, no cloud requirement.

**WEAKNESSES**

- **There is no booking or reservation model, and there has not been one for eight and a half
  years.** [#5081](https://github.com/snipe/snipe-it/issues/5081), "Feature Request:
  Reservations / schedule requests", opened **2018-02-22**, is still open and labelled *"ready
  for dev"* as of 2026-08-29. For AV, where the entire question is "is this camera free the
  week of the 14th", this is disqualifying rather than merely missing. Frequency: recurring
  (it is among the repo's most-upvoted open issues).
- **Locations do not roll up.** [#4546](https://github.com/snipe/snipe-it/issues/4546), opened
  **2017-11-30**, still open and *"ready for dev"*: a parent location showing 2 assets while
  its child holds 25 displays 2, not 27. Warehouse/room/shelf hierarchies therefore do not
  aggregate.
- **Kits are not kits.** [#8762](https://github.com/snipe/snipe-it/issues/8762), opened
  **2020-11-17**, still open: predefined kits cannot contain accessories or consumables, and
  they pick an arbitrary available unit *by lowest ID* rather than letting you specify the
  actual components. The reporter's verdict, paraphrased: the current kit implementation is
  useless to them because they cannot specify what is actually in the kit.
- **Custom fields exist only on assets.** [#4261](https://github.com/snipe/snipe-it/issues/4261),
  opened **2017-10-19** *by the maintainer herself*, still open and *"ready for dev"* — no
  custom fields on licences, accessories, consumables, components, users or models.
- **Self-service checkout has been "in development" since 2018.**
  [#5994](https://github.com/snipe/snipe-it/issues/5994), opened **2018-07-27**, again by the
  maintainer, labelled *in development*.
- **RFID is repeatedly asked for and repeatedly closed without shipping.** A search for RFID
  returns a run of closed issues spanning eight years: #3834 (NFC reader/writer, closed
  2018-02-17), #10684 ("Please add RFID solutions", closed 2022-03-21), #13494 (how to use
  RFID devices, closed 2023-09-15), #15595 ("Bulk RFID Scanning Support in Android App",
  closed 2024-10-02), #9176 (NFC/RFID label request, closed 2025-04-08), #16885 ("How to make
  Bulk Audit support RFID scanner", closed 2025-05-09). **Frequency: recurring — six
  independent requests over eight years, all closed.** No maintainer rationale was visible in
  the fetched pages (the issue list rendered with a partial-load error), so *why* they were
  closed is UNKNOWN.

**MISSING FEATURES (what users request)**

From the most-upvoted open issues (fetched 2026-08-29): reservations/scheduling (#5081),
custom fields for non-assets (#4261), parent/child locations with quantities (#4546),
predefined-kit improvements (#8762), self-service checkout (#5994), asset sales (#12554),
licence subscription model (#5673), OIDC relying-party support (#12695), consumable-to-asset
checkout (#1538), an integrated helpdesk/ticket system (#663).

Label-specific requests, all open (2021→2026): select a label template before printing
(#19541, 2026-08-24), set the number of labels to print (#19478, 2026-08-13), start printing at
a given position on a label sheet (#18013, 2025-10-08), save label profiles (#9173, 2021-02-20),
logo support on more label types (#14214, 2024-02-05), server-side label printing (#12603,
2023-03-03).

**UX PROBLEMS**

- **The new label engine prints the wrong text under 2D barcodes.**
  [#18280](https://github.com/snipe/snipe-it/issues/18280) (opened 2025-12-03, open, no
  maintainer response as of the fetch): the caption under a 2D barcode always renders the asset
  tag regardless of which field the barcode was configured to encode — the reporter identifies
  the template as using `$asset->asset_tag` instead of the selected 2D field. The same issue
  asks for human-readable text under 1D barcodes, *"standard practice in inventory systems for
  visual confirmation and manual entry fallback"*. Frequency: recurring — it sits inside a
  cluster of nine open label issues.
- **QR codes only materialise after an asset has been viewed once.** #19156 (2026-06-08, bug):
  the QR image is not available until the asset page has been opened. INFERENCE: on-demand
  generation with no pre-warm — which breaks bulk label runs for freshly imported assets.
- Long-running requests for view/filter ergonomics (#17494, advanced filter presets for list
  views, 2025-07-29).

**PERFORMANCE PROBLEMS**

- [#19531](https://github.com/snipe/snipe-it/issues/19531), *"[Bug]: extreme Slow loading
  time"*, reported **2026-08-20** against a **fresh v8.7.0 install** (Windows Server 2022, IIS,
  PHP 8.4.11, MariaDB 11.8). Asset detail pages taking 10–35 seconds. The reporter's own
  diagnosis is precise and worth keeping: *the asset detail page is slow while the API calls it
  triggers afterwards return in under a second, so the bottleneck is server-side page
  rendering, not data access.* **Status: closed** as of the fetch, with no visible maintainer
  root-cause or fix in the page. Frequency: isolated (one reporter) — but it is recent, on the
  current release, and on a clean install, which raises its weight.
- Release notes repeatedly touch N+1 query elimination, pagination and report speed —
  INFERENCE: performance is an ongoing rather than settled area.
- **Large imports are a recurring fix target** (timestamp handling in large imports, column
  mapping, error surfacing, an import wizard redesign in v8.7.0).

**PRICING PROBLEMS**

Structurally the least problematic in the segment: **AGPLv3, free, self-hostable, no seat
limits**. The vendor sells hosting; `snipe-it.com` is blocked so **hosted pricing is UNKNOWN**
and no figure is asserted here. INFERENCE: the cost is not licence fees but the operational
burden — you now run PHP, MariaDB and a web server, and #19531 shows what a mis-tuned stack
costs you.

**LOCK-IN**

Lowest in the segment. AGPLv3, self-hosted, full JSON REST API with checkout/check-in,
database under your control. The residual lock-ins are soft:

- **Asset tag identity is Snipe-IT's, not yours** — see #18280, where the label caption is
  hard-wired to `asset_tag`.
- AGPLv3 is itself a constraint for anyone wanting to embed or offer it as a modified service.

**OFFLINE**

- **Not supported, and this is a real gap.** [#12044](https://github.com/snipe/snipe-it/issues),
  "Check In and Check Out Offline PDF Document", has been **open since 2022-10-28** — a request
  for a paper fallback, which tells you how users cope today.
- **It degrades even when the *server* has no internet.** #14185 (opened **2024-01-30**,
  v6.3.0, since closed): pages hang finalising because Gravatar images are fetched from the
  public internet and must time out first, after which the screen re-flows. **This is the
  classic offline failure mode: an application that is architecturally local but reaches out
  for a decorative third-party asset on every page.** FACT.
- INFERENCE: self-hosting gives you LAN-offline (the server is yours), but not
  device-offline — there is no store-and-forward scanning client.

**INTEGRATION PROBLEMS**

- Open API gaps, all recent: Markdown custom fields returned raw (#19479, 2026-08-13),
  no photo/file attachment on checkout/check-in log entries via API (#19174, 2026-06-11),
  no multi-valued custom fields (#18212, 2025-11-18, "Next On Deck After Current Sprint").
  The first two matter for AV specifically: **damage evidence is a photo, and you cannot attach
  one to a check-in through the API.**
- Audit-trail completeness bugs recur: #19052 (PUT of `next_audit_date` produced no audit-log
  entry, closed 2026-05-21), #19456 (user display-name changes not recorded in the action log
  in v8.6.3, closed 2026-08-11).
- Recurring release work on LDAP/STARTTLS and SCIM (Azure/Entra, Okta) — INFERENCE: directory
  integration is a persistent maintenance burden, i.e. it keeps breaking.
- **No official mobile app surfaced in this pass**, and a GitHub repository search for a
  Snipe-IT mobile scanner app returned nothing. Marked UNKNOWN rather than "none" — the
  blocked vendor site is where an app would be announced.

---

### shelf.nu (Shelf Asset Management, NL) — AGPL-3.0

Evidence base: 5 repo-scoped issue searches and 8 individual issues on
[`Shelf-nu/shelf.nu`](https://github.com/Shelf-nu/shelf.nu) (129 open issues at time of
reading). **Important caveat on this product:** a large share of recent issues are authored by
`carlosvirreira`, who appears to be on the team. Those are *internal engineering tickets*, not
user complaints. They are excellent evidence of **what is actually broken** — arguably better
than user reports, because they are specific and reproducible — but they must not be counted as
independent user voices. Issues from named outside users (#912, #1068, #1283, #1338, #1443,
#1769, #1956, #2493) are flagged where used.

**STRENGTHS**

- The only OSS product in the segment with bookings/reservations *and* QR tags *and* custody
  *and* kits — a combination Snipe-IT still lacks after eight years (#5081).
- Genuinely current: shelf@2.1.4 on 2026-08-20 (per the landscape pass), with issues filed and
  triaged through 2026-08-20 in this reading.
- Self-hostable under AGPL-3.0, with a PWA that works against self-hosted instances.
- The team files honest, detailed bug reports against their own product, including data-
  integrity and concurrency defects most vendors would never publish.

**WEAKNESSES**

- **QR scanning is slow and the camera will not focus.**
  [#1768](https://github.com/Shelf-nu/shelf.nu/issues/1768), the only long-standing open bug
  labelled `bug`, opened **2025-05-06** on the hosted app in Chrome and **still open
  2026-08-29**: one code *"took about 20 seconds to read"*, with the reporter noting
  *"there's just something weird with the focus"* and a workaround of moving the camera very
  close and then backing away. The requested fix — let the user pick which camera device to use
  — is still not shipped. **Frequency: recurring** — corroborated by InvenTree's independent
  "Default Scanner Camera Selection" request (inventree-app #615, 2025-02-18). **For a product
  whose primary interaction is scanning a QR code, a 20-second scan is the whole product
  failing.**
- **Model-based reservations can *only* be fulfilled by scanning.**
  [#2831](https://github.com/Shelf-nu/shelf.nu/issues/2831) (2026-08-10): checkout enforces a
  *"hard block — model requests must all be fulfilled before checkout"*, and while every other
  booking action offers both a scan path and a picker, model fulfilment offers scanning only. A
  desk-based coordinator without a scanner cannot complete the booking at all. **This is the
  mirror image of every other complaint in this dossier: here the tool is too committed to
  scanning.**
- **Imports abort mid-run and leave a half-built workspace.**
  [#2799](https://github.com/Shelf-nu/shelf.nu/issues/2799) (2026-08-04, open): a Prisma
  transaction with a 5-second default timeout, in a sequential one-row-at-a-time loop, blew up
  partway through a 336-asset CSV — **76 assets, all 7 kits, and all locations and custodians
  were committed** while the UI had promised *"if any data in the file is invalid, the whole
  import will fail"*. The user gets a generic *"We could not create or update this Asset"* with
  no failing row identified, and re-running duplicates everything already committed. **This is
  the single most damaging defect found in the segment**, because it hits at the exact moment a
  new customer is migrating their inventory and has the least ability to detect the damage.
- **Concurrency defects:** concurrent kit custody assignment returns 500 (#2821, 2026-08-06);
  location placements are not reconciled (#2806, 2026-08-04); changing an asset's model breaks
  booking accounting (#2786, 2026-07-31).
- **QR identity integrity is not centrally guarded:** #2761 (2026-07-28) reports that
  `createAsset`'s loose QR connect can leave *orgless-but-linked* codes, and #2760 notes the
  web link action is unguarded because the QR link/relink guards do not live in the shared
  service. INFERENCE: a QR code can end up attached to an asset outside its organisation —
  serious for a multi-tenant asset system.
- **Assets are strictly singular; there is no quantity model** for consumables — see below.

**MISSING FEATURES (what users request)**

All from outside users:

- **Quantity / consumable assets.** [#912](https://github.com/Shelf-nu/shelf.nu/issues/912)
  (2024-04-15, open): a school wants to hand out drill bits with *one QR code on the storage
  container*, but *"once I assign the asset to a person, it becomes unavailable to check out"*,
  so tracking a hundred-plus consumables means a hundred-plus assets and a hundred-plus QR
  codes. **This is the case/bulk problem in its purest form: one label, many identical
  contents.**
- **Flexible kits.** [#1283](https://github.com/Shelf-nu/shelf.nu/issues/1283) (2024-08-27,
  open): kits are a single bookable unit, so you cannot book one component without sterilising
  the whole kit's availability, and duplicate items risk double-booking. The requester proposes
  per-item *locked* / *unlocked* flags — locked by default, with high-demand items (their
  examples: microphones, lenses) unlockable for individual checkout. **A named AV use case.**
- **Bring your own asset ID.** [#1068](https://github.com/Shelf-nu/shelf.nu/issues/1068)
  (2024-06-14, open): *"inventory is already labeled with our own QR codes and unique 6 digit
  asset IDs"* — they want assets addressable by their identifier, not shelf.nu's UUID, so that
  the labels already stuck on the gear keep working. **Frequency: recurring** — the same
  "adopt my existing identity" demand appears as Snipe-IT #18280 and shelf.nu #1338 (pre-fill
  asset fields from a scanned barcode, 2024-10-04).
- **Book a type of asset rather than a specific one** (#1769, 2025-05-07) — model-level booking
  from the user side.
- **Late-return tracking, strikes and reminders** (#1956, 2025-07-29) — accountability for gear
  that does not come back.
- **Internationalisation.** Requested twice by different users: #1443 (2024-11-21) and #2493
  (2026-04-20). **Still open.** For a German-market AV product this is decisive: shelf.nu is
  English-only. FACT.
- Multiple images per asset (#561, 2023-11-20); tiered access by user field and asset tag
  (#1893, 2025-06-25).

**UX PROBLEMS**

- The 20-second scan and focus hunt (#1768) — the dominant one.
- Mobile kits list: an unguarded status filter 500s, and search misses barcodes that the web
  app finds (#2837, 2026-08-10) — **web/mobile parity is not maintained**.
- Bulk dialogs show stale validation errors (#2785, 2026-07-31); the assets index understates
  custody status relative to the detail view (#2875, 2026-08-17); the asset index shows no
  availability context for quantity-tracked items (#2767, 2026-07-29); an audit evidence panel
  renders a captioned upload's photos twice (#2904, 2026-08-20).

**PERFORMANCE PROBLEMS**

- The import timeout (#2799) is a performance bug with data-integrity consequences.
- **Fetch-all patterns across audit surfaces**: #2694 (2026-07-06) is explicitly about
  paginating audit session details to fix fetch-all performance; #2697 (2026-07-06) slims
  pickers and closes pagination gaps. INFERENCE: audit/history screens degrade as history
  accumulates — which is exactly when an asset system becomes valuable.
- Camera/QR scan performance (#1768).

**PRICING PROBLEMS**

AGPL-3.0 and self-hostable, so no licence cost. Hosted pricing UNKNOWN (`shelf.nu` blocked). But
there is a structural pricing/packaging problem that *was* verifiable — see LOCK-IN.

**LOCK-IN**

- **The native companion app does not work with self-hosted instances.**
  [#2713](https://github.com/Shelf-nu/shelf.nu/issues/2713) (2026-07-15, open, labelled *user
  requested feature*): the native app talks only to the cloud service; self-hosters are told to
  use the PWA and forgo native features. The requester asks for a Bitwarden-style
  "specify your server" login. **FACT.**
  **This is the most important lock-in finding in the dossier**: an AGPL product where the
  source is free but *the scanner in your hand is not*. The open licence is doing less work
  than it appears to, because the scanning client — the part that matters in a warehouse — is
  cloud-bound.
- Quantity assets cannot be checked in via the native app at all (#2701, 2026-07-07).

**OFFLINE**

- **No offline capability found, and none requested.** Zero issues matching offline behaviour
  surfaced across the searches run.
- The PWA is the self-hoster's path (#2713), but nothing indicates offline queueing of scans.
  INFERENCE (not FACT): scanning requires a live connection to the server.
- Scan records cannot even identify the scanning device — the companion app sends a generic
  user-agent, so scans log as *"Unknown device"*, with the team noting they would like the app
  version *"to tell whether a scan came from an outdated install"* (#2839, 2026-08-12).
  INFERENCE: device-level provenance for scans is weak, which matters for any store-and-forward
  design later.

**INTEGRATION PROBLEMS**

- Web/mobile parity gaps (#2837) mean an integration tested against the web app may behave
  differently through the app.
- `apps/companion` has no test runner (#2868, 2026-08-14) — INFERENCE: the mobile client is the
  least-defended part of the codebase, consistent with the parity bugs above.
- No third-party API-client ecosystem was found on GitHub. INFERENCE: little external
  integration pressure so far.

---

### InvenTree (community) — MIT

Evidence base: 4 repo-scoped issue searches on `inventree/InvenTree`, 4 individual issues, plus
the `inventree/inventree-app` (mobile) issue list. Note this is a *manufacturing/parts*
inventory system being evaluated for an AV-adjacent job; some gaps below are gaps only from
the AV point of view.

**STRENGTHS**

- The barcode abstraction is genuinely the best design found in the segment (per the landscape
  pass): `POST /api/barcode/` fans out to all plugins and the first successful interpretation
  wins, supporting both internal JSON and short formats. Nothing in the evidence contradicts
  this.
- MIT-licensed and self-hostable — the most permissive licence in the segment.
- RFID and NFC requests have actually been *shipped* rather than closed: #2643 (RFID,
  especially on Android, completed 2022-04-13) and #9169 (NFC, mainly for mobile, completed
  2025-02-24). **This is a real differentiator against Snipe-IT, where six equivalent requests
  were closed without delivery.**
- A first-party mobile app exists (`inventree-app`) and, per #11138, already supports the
  multi-scan workflow the web UI lacks.

**WEAKNESSES**

- **Container tracking does not exist, and has been on the "horizon" milestone for nearly five
  years.** [#2058](https://github.com/inventree/InvenTree/issues/2058), *"[FR] Implement
  tracking of storage containers (part bins/bags/boxes/storage cases/toolboxes)"*, opened
  **2021-09-15**, open with milestone `horizon` (i.e. no scheduled release), and it ranks among
  the repo's most-upvoted open issues. The reporter's framing — *"it's hard to know what's
  inside various storage boxes and keep track of where they are"* — is precisely the flight-case
  problem, and the issue explicitly cites Snipe-IT's asset-to-asset assignment as the model to
  copy. **For a case-centric AV workflow this is the disqualifying gap.**
- **The web scan modal closes after every single scan.**
  [#11138](https://github.com/inventree/InvenTree/issues/11138) (2026-01-14, open, `horizon`):
  scanning stock into a location means you *"put down the barcode scanner and click twice to
  reopen the modal"* for every item. The reporter notes the mobile app already does it right
  and offers to build it. **Frequency: recurring** — the identical complaint drives Current
  RMS's community bulk-quantity and command barcodes.
- **Label printing produces duplicate labels under load.**
  [#11650](https://github.com/inventree/InvenTree/issues/11650) (2026-03-31, open, milestone
  1.6.0, labelled `bug`/`help wanted`): a 90-second background-task timeout during machine-
  registry operations (plugin hash calculation, plugin config retrieval) causes the print task
  to fail midway and be retried, emitting duplicate print jobs. Reproduction: select 5+ stock
  items, print labels, get an incomplete run with duplicates. **Labels are consumables you
  physically waste, and duplicates in an asset system mean two objects claiming one identity.**

**MISSING FEATURES (what users request)**

- Storage container tracking (#2058, 2021).
- Multi-scan into a location (#11138, 2026).
- Create or update a part directly from a barcode scan (#10714).
- Show the linked barcode string in the UI (#11745) — you cannot see what a scan is bound to.
- Location QR codes in the menu (#7761).
- Repair orders (#12064, 2026-06-01) — among the most-upvoted; relevant to the maintenance half
  of this segment.
- Mobile app: barcode scanner support when creating a new stock item (#494, 2024-05-24);
  **default scanner camera selection (#615, 2025-02-18)** — the same request as shelf.nu #1768;
  OAuth login (#422); server autodiscovery (#352).

**UX PROBLEMS**

- The one-scan-per-modal loop (#11138).
- Barcode bindings are invisible in the UI (#11745).
- Mobile: no camera selection (#615); the Android app did not prompt for a 2FA code (#468,
  2023-12-25) — a security-shaped UX defect.

**PERFORMANCE PROBLEMS**

- The 90-second label task timeout and its retry storm (#11650) is the only measured
  performance defect found. Everything else is UNKNOWN.

**PRICING PROBLEMS**

None structurally: MIT, free, self-hosted. Cost is operational only.

**LOCK-IN**

Lowest possible — MIT licence, self-hosted, documented REST API, open barcode plugin
architecture. No lock-in complaints found.

**OFFLINE**

- **Air-gapped deployment is an open request, not a supported mode.**
  [#7688](https://github.com/inventree/InvenTree/issues/7688), *"[FR] Provide seamless
  experience for Air-gapped deployments"*, opened **2024-07-18**, open, and among the
  most-upvoted. The reporter's core statement: *"All provided deployment methods assume network
  access. The docker image should work in theory but in practice all deployment methods call
  'out' into the internet for various steps."* Asks for a switch to disable external calls
  across all deployment methods, exposed to plugins via environment variables, plus
  pre-configured or `.deb` artefacts. FACT.
- INFERENCE: as with Snipe-IT's Gravatar timeouts (#14185), the failure is not the core
  application but its incidental reaching-out. **Two independent products in this segment
  break offline for the same accidental reason.**

**INTEGRATION PROBLEMS**

- The plugin/machine registry is implicated in the label duplication bug (#11650) — INFERENCE:
  plugin config lookups are on a hot path without adequate caching.
- Supplier integration remains an open request (#3261).

---

### Cheqroom (BE/US)

**Evidence base is thin and entirely indirect.** `cheqroom.com` and `help.cheqroom.com` are
blocked; no review sites reachable. What follows is what GitHub could establish, and it is
mostly *structural* evidence about the developer surface, not user sentiment. **No user
complaint about Cheqroom was read this session.** Everything in WEAKNESSES below is INFERENCE
from repository metadata and should be re-verified when review sites are reachable.

**STRENGTHS**

- The landscape pass credits it with the best-in-segment checkout loop: a damage flag
  auto-removes the asset from rotation, forces photo evidence, and auto-creates a repair
  ticket. Nothing found this session contradicts that, and it is the behaviour Current RMS
  users are hand-rolling (scan-to-quarantine, #68) and Snipe-IT users cannot get through the
  API (photo on check-in, #19174). **On the damage loop specifically, Cheqroom appears to be
  the benchmark.**
- A REST API exists and is versioned: the archived official wrapper targets
  `https://api.cheqroom.com/api/v2_5` with username/password authentication exchanged for a
  token (`CHECKROOM/checkroom_core_js` README, read 2026-08-29).

**WEAKNESSES / LOCK-IN / INTEGRATION PROBLEMS** (these three collapse into one finding)

- **The vendor's own JavaScript API wrapper is archived and read-only.**
  [`CHECKROOM/checkroom_core_js`](https://github.com/CHECKROOM/checkroom_core_js), *"A
  JavaScript wrapper around the CHEQROOM REST API"*, published to npm as `cheqroom-core`, was
  **archived on 2023-01-25**. 10 stars, 0 forks, 0 issues. **FACT.**
- **The entire GitHub ecosystem around Cheqroom is five repositories.** A repository search
  returned exactly 5 hits, of which one is the archived official wrapper, one is a 2017 stub,
  and three are individuals building their own access: `Netsyde-Systems/cheqreport` (2022, a
  CLI to generate custom Cheqroom reports as Excel), `rhopper-bowdoin/CheqRoomRestAPI` (2024,
  no description), `Hamza4859/CheqroomAPI` (created **2026-06-03**, described as *"playing
  around with Cheqroom API"*). **FACT.**
- INFERENCE from those two facts: the documented, supported integration path has been
  unmaintained for over three years, while people continued writing their own clients as
  recently as mid-2026. That is the signature of an API that exists but is not cultivated.
  **Frequency: recurring** as a structural pattern; **isolated** as user testimony, because
  none was readable.
- INFERENCE, weaker: the existence of `cheqreport` — a third-party CLI whose sole purpose is
  *"creating custom Cheqroom reports"* exported to Excel — suggests built-in reporting did not
  cover a real customer's needs. The README gives no motivation, so this is a hint, not a
  finding. **Would need to check:** the Cheqroom help centre's reporting documentation and any
  G2/Capterra "Cons" mentioning reports or exports.

**MISSING FEATURES / UX PROBLEMS / PERFORMANCE PROBLEMS / PRICING PROBLEMS / OFFLINE**

**UNKNOWN.** No sources reachable. Specifically unverified and worth checking first when the
network allows: whether Locked Kits can be partially checked out (the shelf.nu #1283 and
Snipe-IT #8762 complaint applies to any all-or-nothing kit model, and the landscape pass
records Cheqroom kits as all-or-nothing — so this is a *predicted* pain point, not an observed
one); whether the mobile app queues scans offline; per-seat pricing and any asset-count caps.

---

### HireHop (UK)

**Evidence base: thin, indirect, but more revealing than Cheqroom's.**

**STRENGTHS**

- Per the landscape pass, the widest identifier support in one product (barcode, QR, RFID, NFC,
  serial, manual count), Spot Check warehouse audits, and blocking rules that stop failed or
  damaged gear leaving. The blocking rule is notable because it is exactly what Current RMS
  users had to build themselves.
- **An open, JavaScript-based customisation layer that people actually use.** A repository
  search surfaced 13 HireHop repos, most of them plugin collections by different companies —
  `rosscornwall/hirehop` ("Hirehop Plugins", 2025-12), `SRich001/Hirehop_Plugins` (2026-01),
  `GreenRoomPower/HireHop-Plugins` (2026-04), `MattCLangford/hhplugin` (*"Wise customisations
  via .js files to the HireHop Web UI"*, updated 2026-08-18), `thepatchgroup/hirehop`,
  `dkpat07/hirehop-plugins`. **FACT.** INFERENCE: HireHop ships a sanctioned plugin mechanism
  rather than forcing DOM hacks — a genuine architectural advantage over Current RMS, where the
  same need produced an unaffiliated browser extension.

**WEAKNESSES**

- INFERENCE from the same fact: a plugin ecosystem this active means a meaningful amount of
  what customers need is *not* in the box. Each of those repos is a rental company maintaining
  JavaScript against a SaaS UI. That is real integration cost and real fragility, even when
  sanctioned.
- **Mobile scanning was inadequate enough that a customer rebuilt it.**
  [`sj-tech-sweden/Hirehop-tools`](https://github.com/sj-tech-sweden/Hirehop-tools) — *"A suite
  of different tools that complement hirehop and helps to plan sound, light and video for
  events"* — describes providing *"a new interface that works great to scan for check out on
  phones"* plus check-in and other features. FACT.
- **That customer then left.** The repo was **archived 2025-02-04** with the owner's stated
  reason: they stopped using HireHop and moved to `eventory.se`, so they would not update the
  tools for HireHop's newer categories or continue development. **FACT, and it is the only
  documented churn event in this dossier.** Two things are worth extracting: (a) HireHop
  changed its category model in a way that broke a customer's tooling; (b) an AV company built
  *sound, light and video planning* on top of a rental system — the design-time gap this
  corpus keeps finding, seen from inside a competitor's ecosystem.
  Frequency: isolated (one company), but unusually informative.

**MISSING FEATURES / UX / PERFORMANCE / PRICING / OFFLINE / LOCK-IN**

Largely **UNKNOWN** — `hirehop.com` is blocked. One integration data point: the only Node SDK
found, [`teamantware/node-hirehop`](https://github.com/teamantware/node-hirehop), is titled
*"An unofficial Hirehop SDK for node"* (created 2024-07-13, no open issues). **FACT:** no
official SDK was found. INFERENCE: integration is do-it-yourself against a raw HTTP API.

---

### Rentman (NL)

**Evidence base: thin and structural only. No Rentman user complaint was read this session**
(`rentman.io` and `support.rentman.io` blocked, review sites blocked, the Productboard public
roadmap blocked).

**STRENGTHS**

- Per the landscape pass, the strongest case model in the commercial segment: cases as sealed
  self-tracking containers (scan the case, contents follow, serialised plus bulk), two-field
  serial identity, sub-hire on the same packing slip, per-serial periodic inspections. Nothing
  found contradicts this, and the case model is precisely what InvenTree lacks (#2058) and
  Current RMS handles badly (nested book-out).
- A public REST API at `https://api.rentman.net` with token authentication, and — unusually —
  an **OpenAPI-shaped surface**: `Nebensound/rentman-api-client` is a *generated* client
  ("Every path/method combo becomes a Python module with four functions"), which only works if
  the vendor publishes a machine-readable spec. **FACT** (README, read 2026-08-29). That is a
  real integration strength.

**WEAKNESSES / INTEGRATION PROBLEMS**

- **No official SDK in any language was found.** What exists is three independent unofficial
  clients, each maintained by a different individual:
  `Nebensound/rentman-api-client` (Python, generated, created 2024-02-07, 5 stars, 1 open
  issue), `patrick-dmxc/RentmanSharp` (C#, on NuGet, created 2022-12-22, 2 stars),
  `Nebensound/Rentman.rs` (Rust, created 2026-01-22, 2 stars). Plus `bockhauzen/rentalshop`
  (PHP, "Link your Rentman account with your webshop", 2017). **FACT.**
- INFERENCE: an OpenAPI spec with no first-party clients means the vendor treats the API as a
  published contract but not as a supported product. Three people independently generating or
  hand-writing clients across four years is duplicated effort the vendor could have absorbed.
- **Geartracking B.V.** (Rentman subsidiary; AV-specific on-metal tags for flight cases and
  heat-shrink hard-tags for cables, 865–868 MHz EU RAIN RFID) has **no GitHub presence at
  all** and its site is blocked. Everything about it is UNKNOWN this session, including the
  crucial question of whether the RFID hardware feeds Rentman's case model automatically or
  requires a separate reader workflow.

**MISSING FEATURES / UX / PERFORMANCE / PRICING / OFFLINE / LOCK-IN**

**UNKNOWN.** Rentman is the most important gap in this dossier: it is the closest competitor to
the case-tracking model an AV suite needs, it is a German-market presence, and this pass could
verify nothing about how it feels to use. **First thing to re-check when the network allows:**
Capterra/OMR German-language reviews, the public Productboard roadmap, and the mobile app's
offline behaviour in a warehouse with no signal.

---

### Flex Rental Solutions (US), easyjob / protonic software (DE), Timly (CH/DE)

**UNKNOWN — no evidence found or readable.**

Repository searches for Flex Rental Solutions and for easyjob/protonic returned **zero
results**; there is no third-party developer ecosystem for either on GitHub. All three vendor
sites are blocked, as are all review sites and the German trade forums where easyjob and Timly
would be discussed.

This is a **significant hole for the German market specifically**: easyjob is the DACH
incumbent with the broadest barcodable-object model in the landscape pass (articles, devices,
projects, jobs, addresses, users) and an HTML-based Scanner App for Windows/Android/iOS, and
Timly is the DACH QR inventory tool sold into Veranstaltungstechnik. **The brief's angle 5
(German-language sources) could not be executed at all.**

Do not infer from this silence that these products are unproblematic. Infer only that
closed-source German B2B software with no developer ecosystem leaves no GitHub footprint.
**To check when reachable:** OMR Reviews (DE), Capterra DE, `production-partner.de`,
`film-tv-video.de`, and the protonic and Timly release notes.

---

## Cross-product patterns

These are the complaints that repeat across **multiple independent vendors**. They are the most
valuable output of this pass, because vendor-crossing is the only form of breadth this
environment could establish.

### 1. The scan loop is designed for one item, but warehouses scan continuously
**Frequency: widespread** (3 independent products).

InvenTree closes its scan modal after every barcode, so you *"put down the barcode scanner and
click twice to reopen the modal"* (#11138). Current RMS users needed a community extension to
add bulk-quantity barcodes, command barcodes, and a cursor that returns to the scan box by
itself. Snipe-IT users asked six times over eight years for bulk RFID/audit scanning and were
closed out every time.

The underlying design error is the same everywhere: **the scan is modelled as a form
submission, when it is actually a stream.** A person holding a scanner in a warehouse cannot
click, cannot dismiss a dialog, and cannot type. Every modal, every confirmation, every focus
loss is a stop in a process that is supposed to be continuous.

### 2. Feedback is visual, but the operator is not looking at the screen
**Frequency: recurring** (strong single-product evidence, generalises immediately).

The Current RMS extension's most elaborate work is audio: distinct spoken messages for
"Container already allocated" vs "Already scanned" vs an overdue inspection *naming the asset
number*, a different scan sound when an item lands inside a container, and configurable
Full/Short/Off alert levels — all because native feedback is *"a generic error buzz"* and
*"you wouldn't know about the missing inspection unless you were looking at the screen whilst
scanning."*

This is the most transferable insight in the dossier. **Semantic audio is not a nicety in a
warehouse; it is the primary output channel.** No product in this segment appears to treat it
that way.

### 3. Cases and containers are second-class citizens everywhere
**Frequency: widespread** (4 independent products).

- InvenTree: container tracking open since **2021-09-15**, milestone `horizon` (#2058).
- Current RMS: nested book-out ignores item status and only descends one level (*"I can't
  currently block this insane behaviour"*); ad-hoc containers cannot hold a weight; getting
  items back into a temporary container was a two-step scan.
- Snipe-IT: parent locations do not sum their children, open since **2017-11-30** (#4546).
- shelf.nu: one QR on a box holding a hundred identical items is impossible (#912).

Rentman and Flex are the two products the landscape pass credits with real container models —
and they are precisely the two this pass could not evaluate. **Working hypothesis (INFERENCE,
untested): container/case modelling is the segment's genuine dividing line, and most products
are on the wrong side of it.**

### 4. Kits are all-or-nothing, and users want partial and substitutable kits
**Frequency: widespread** (3 products, plus the landscape's note on Cheqroom Locked Kits).

shelf.nu #1283 asks for per-item locked/unlocked flags so a lens or a microphone can leave the
kit without sterilising the kit's availability. Snipe-IT #8762 (open since 2020) reports kits
that cannot contain accessories or consumables and that grab an arbitrary unit *by lowest ID*.
Cheqroom's Locked Kits are all-or-nothing by design.

Nobody models what an AV prep actually is: **a kit is a template, the thing that ships is an
instance, and the instance routinely substitutes.**

### 5. Reservation is either absent or, worse, scan-only
**Frequency: recurring.**

Snipe-IT has had no reservations for **eight and a half years** (#5081, opened 2018-02-22,
still *"ready for dev"*). shelf.nu has them, but model-based requests can *only* be fulfilled by
scanning, a *"hard block"* that strands any coordinator without a scanner (#2831).

The lesson cuts both ways: **every operation needs both a scan path and a desk path**, because
the same booking is touched in the warehouse and at a desk.

### 6. Products impose their identity instead of adopting yours
**Frequency: recurring** (3 independent reports).

shelf.nu #1068: *"inventory is already labeled with our own QR codes and unique 6 digit asset
IDs"* — the user wants their ID to be the addressable one. shelf.nu #1338 wants asset fields
pre-filled from a scanned barcode. Snipe-IT #18280: the caption under a 2D barcode is
hard-wired to `asset_tag` no matter which field the barcode encodes.

**Every AV company already has labels on its gear.** A product that demands re-labelling is
asking for a week of warehouse work before it delivers anything.

### 7. Label printing is a permanent bug farm
**Frequency: widespread** (2 products, 10+ issues).

Snipe-IT has nine open label issues spanning 2021→2026 despite having the segment's best label
engine: template selection at print time, label counts, start position on a sheet, saved
profiles, logos, server-side printing, and the wrong caption under 2D barcodes. InvenTree
prints **duplicate labels** when a 90-second background task times out and retries (#11650).

INFERENCE: label printing sits across a browser, a print stack, a driver and physical media,
and no vendor has made it boring. **Duplicate labels are worse than no labels — two objects
then claim one identity.**

### 8. RFID is perpetually requested and perpetually deferred
**Frequency: widespread.**

Snipe-IT: six independent RFID/NFC requests 2018→2025, all closed, none shipped. Current RMS:
no RFID support at all (landscape pass). InvenTree: shipped RFID (2022) and NFC (2025) — the
sole counter-example. Geartracking exists as a *separate company* selling RAIN RFID hardware
into Rentman rather than being folded into the product.

Flex's stated doctrine — that RFID *complements* rather than replaces the barcode on each
serialised unit — reads as the mature position, and Kit Check/Bluesight's sealed-tray read of
~198 tagged items in seconds remains the unmatched benchmark. **INFERENCE: the segment has
decided RFID is too expensive per-tag for AV, but has not said so out loud, so users keep
asking and vendors keep closing.**

### 9. Offline is broken by accident, not by design
**Frequency: widespread** (3 products, and the failure mode is identical).

Snipe-IT hangs when the *server* has no internet because it fetches Gravatar images and must
wait for them to time out (#14185). InvenTree cannot be deployed air-gapped because *"all
deployment methods call 'out' into the internet for various steps"* (#7688). shelf.nu's native
scanning app cannot talk to a self-hosted instance at all (#2713).

**None of these is a considered decision to require connectivity. Each is an incidental
dependency that nobody audited.** The corpus-level finding — "offline exists, but always for
the wrong half" — holds here in a sharper form: *even the products that could be offline are
not, for reasons their own maintainers describe as accidental.*

### 10. Long-open "ready for dev" issues are a form of vendor communication
**Frequency: recurring.**

Snipe-IT carries #4546 (2017), #4261 (2017, filed by the maintainer), #5081 (2018), and #5994
(2018, *"in development"*) — all still open in 2026. InvenTree parks #2058 (2021) and #11138
(2026) on a `horizon` milestone with no release. shelf.nu leaves i18n open across two separate
requests (2024, 2026).

INFERENCE: "ready for dev" and "horizon" function as polite refusals. A prospective buyer
reading a roadmap cannot tell the difference between *planned* and *permanently deferred* — and
in this segment the honest answer is usually the latter.

### 11. The community patch layer is load-bearing, and it is one person
**Frequency: recurring** (2 products).

The Current RMS extension's author writes that it was *"created out of our frustration waiting
on 'quality of life' modifications"* and that he has been *"blown away by how many users and
businesses have started using it on a daily basis"* — while disclaiming *"I am not a
professional programmer. Use entirely at your own risk."* HireHop has at least six independent
company-maintained plugin repositories. And on 2026-04-15 a Current RMS deploy broke every
extension function at once (#142); the HireHop complement suite was archived outright when its
author changed vendors.

**Real rental businesses are running their warehouse on unpaid, unaffiliated JavaScript that a
vendor deploy can break without warning.**

### 12. Bulk and serialised items cannot coexist in one model
**Frequency: recurring** (3 products).

shelf.nu #912: one QR on a container of a hundred drill bits is impossible because assigning an
asset makes it unavailable. Current RMS #94 asks to stop or improve global check-in of bulk
items, and the extension's container check-in *"ignores bulk items"* entirely. Snipe-IT #1538
asks to check out consumables to an asset.

In AV this is cables, adapters, gel, batteries, gaffer — **the majority of items in the case by
count, and the ones that actually go missing.**

### 13. Import is where trust dies
**Frequency: recurring** (2 products).

shelf.nu #2799: an import that promised all-or-nothing committed 76 of 336 assets, all 7 kits,
and every location and custodian, then returned a generic error naming no row — and re-running
duplicates the committed rows. Snipe-IT's release notes repeatedly revisit large-import
timestamp handling, column mapping and error surfacing, culminating in an import wizard
redesign in v8.7.0 (2026-08-11).

**Migration is the first thing a customer does and the moment they have least ability to detect
silent damage.**

---

## Direct quotes-of-substance

All paraphrased or quoted from pages actually opened on 2026-08-29. No quote here is invented;
where I quote directly the phrase appeared in the fetched page.

1. **"I can't currently block this insane behaviour."** — `currentRMS-helper` `Features.md`,
   describing Current RMS booking out the first level of a container's contents regardless of
   item status, so a forgotten "Reserved" item inside a nested case silently becomes "Booked
   Out". <https://raw.githubusercontent.com/CompositeLight/currentRMS-helper/main/Features.md>
   (extension v2.0.12/2.1.3, read 2026-08-29)

2. **The extension exists because of "frustration waiting on 'quality of life' modifications"**,
   and its author has been "blown away by how many users and businesses have started using it
   on a daily basis" — while disclaiming "I am not a professional programmer. Use entirely at
   your own risk. This code is in no way affiliated with InspHire Ltd."
   <https://github.com/CompositeLight/currentRMS-helper> (read 2026-08-29)

3. **"Previously you wouldn't know about the missing inspection unless you were looking at the
   screen whilst scanning."** — why the extension speaks an audible warning naming the asset
   number that needs testing. Same `Features.md`.

4. **"There is no way to give an adhoc container a weight value, so the figure given is for the
   contents only."** — Current RMS cannot weigh an ad-hoc case; the extension computes contents
   weight so a tech can write the case weight on the road label. Same `Features.md`.

5. **"We were frustrated by the fact that getting items back into temporary containers was a
   two step process: first scan the items in, then scan them into a temporary container."**
   Same `Features.md`.

6. **"The information provided is already available within CurrentRMS, but requires clicking
   away from the scanning page."** — why the extension added a product photo/weight/locations
   modal for warehouse techs identifying unfamiliar equipment. Same `Features.md`.

7. **"API Keys give read and write access to your Current RMS System. You should keep your keys
   safe just as you do your username and password."** — Current RMS's own warning, quoted in
   the extension's install instructions. There is no scoped or read-only key.
   <https://github.com/CompositeLight/currentRMS-helper> (read 2026-08-29)

8. **A user asks for a non-API import path because they lack managerial approval to use an API
   key at all**, and would accept manual CSV exports instead; a companion issue asks the same
   for quarantine data. Current RMS's all-or-nothing key model is what makes management refuse.
   <https://github.com/CompositeLight/currentRMS-helper/issues/138> (2026-01-25) and #139

9. **"Current pushed an update this morning that appears to have broken all currentRMS-helper
   functions"** — with users able to allocate only one item before a page refresh.
   <https://github.com/CompositeLight/currentRMS-helper/issues/142> (2026-04-15)

10. **A QR code "took about 20 seconds to read... there's just something weird with the
    focus"**, with a workaround of holding the camera very close and backing away. Open since
    2025-05-06 and still open. <https://github.com/Shelf-nu/shelf.nu/issues/1768>

11. **Model reservations can only be fulfilled by scanning — a "hard block — model requests must
    all be fulfilled before checkout"** — while every other booking action offers both a scan
    path and a picker, stranding coordinators without a scanner.
    <https://github.com/Shelf-nu/shelf.nu/issues/2831> (2026-08-10)

12. **An import that promised "if any data in the file is invalid, the whole import will fail"
    committed 76 of 336 assets, all 7 kits, and every location and custodian** before a 5-second
    Prisma transaction timeout aborted it, returning only "We could not create or update this
    Asset" with no failing row named; re-running duplicates what already succeeded.
    <https://github.com/Shelf-nu/shelf.nu/issues/2799> (2026-08-04)

13. **"Once I assign the asset to a person, it becomes unavailable to check out"** — a school
    wanting to lend drill bits with a single QR code on the storage container, facing
    "over a hundred" individual assets and QR codes instead.
    <https://github.com/Shelf-nu/shelf.nu/issues/912> (2024-04-15)

14. **"Inventory is already labeled with our own QR codes and unique 6 digit asset IDs"** — a
    request to make the customer's own asset ID the addressable identifier instead of shelf.nu's
    UUID. <https://github.com/Shelf-nu/shelf.nu/issues/1068> (2024-06-14)

15. **Kits are a single bookable unit, so booking one component sterilises the whole kit's
    availability**; the requester proposes per-item locked/unlocked flags so high-demand items —
    their examples are microphones and lenses — can be checked out individually.
    <https://github.com/Shelf-nu/shelf.nu/issues/1283> (2024-08-27)

16. **The native companion app cannot connect to self-hosted instances**; self-hosters are told
    to use the PWA and forgo native features, and the requester asks for a Bitwarden-style
    "specify your server" login. <https://github.com/Shelf-nu/shelf.nu/issues/2713> (2026-07-15)

17. **"The current implementation of KITs seems useless because I can't specify actual parts of
    this KIT"** — Snipe-IT kits cannot contain accessories or consumables and pick an arbitrary
    available unit by lowest ID. Open since 2020-11-17.
    <https://github.com/snipe/snipe-it/issues/8762>

18. **A parent location showing 2 assets while its child location holds 25 displays 2, not 27.**
    Open, "ready for dev", since 2017-11-30. <https://github.com/snipe/snipe-it/issues/4546>

19. **Reservations/scheduling has been open and labelled "ready for dev" since 2018-02-22** —
    eight and a half years. <https://github.com/snipe/snipe-it/issues/5081>

20. **"The asset detail page itself is often slow, while many of the related API calls triggered
    afterwards complete in less than one second. This suggests that the bottleneck may occur
    during the initial server-side page rendering process."** — 10–35 second page loads on a
    fresh Snipe-IT v8.7.0 install (Windows Server 2022/IIS/PHP 8.4.11/MariaDB 11.8), reported
    2026-08-20, now closed with no visible root-cause.
    <https://github.com/snipe/snipe-it/issues/19531>

21. **"Snipe is slow finalizing loading when there is no internet connection. Visible pointers
    are gravatar image, and after timeout it refreshes the screen."** — an offline-hostile
    dependency on a decorative third-party asset. Opened 2024-01-30 against v6.3.0, since
    closed. <https://github.com/snipe/snipe-it/issues/14185>

22. **The 2D barcode caption always renders the asset tag** rather than the configured field
    (the reporter identifies the template using `$asset->asset_tag`), and 1D barcodes have no
    human-readable text underneath — "standard practice in inventory systems for visual
    confirmation and manual entry fallback." Open since 2025-12-03, no maintainer response.
    <https://github.com/snipe/snipe-it/issues/18280>

23. **"It's hard to know what's inside various storage boxes and keep track of where they
    are."** — InvenTree's container-tracking request, open since 2021-09-15 on the `horizon`
    milestone, explicitly citing Snipe-IT's asset-to-asset assignment as the model to copy.
    <https://github.com/inventree/InvenTree/issues/2058>

24. **Scanning stock into a location means you "put down the barcode scanner and click twice to
    reopen the modal"** after every single item; the reporter notes the InvenTree mobile app
    already supports multi-scan. <https://github.com/inventree/InvenTree/issues/11138>
    (2026-01-14)

25. **"All provided deployment methods assume network access. The docker image should work in
    theory but in practice all deployment methods call 'out' into the internet for various
    steps."** — InvenTree air-gapped deployment request, open since 2024-07-18.
    <https://github.com/inventree/InvenTree/issues/7688>

26. **A 90-second background-task timeout during plugin-hash and plugin-config lookups causes
    label print tasks to fail midway and retry, so "labels get printed multiple times"** when
    printing 5+ stock items. Open, milestone 1.6.0.
    <https://github.com/inventree/InvenTree/issues/11650> (2026-03-31)

27. **An AV company built its own phone scanning interface on top of HireHop** — "a new
    interface that works great to scan for check out on phones" — then archived the whole suite
    on 2025-02-04, stating they had stopped using HireHop for `eventory.se` and would not
    update it for HireHop's newer categories.
    <https://github.com/sj-tech-sweden/Hirehop-tools>

28. **Cheqroom's own JavaScript API wrapper, published to npm as `cheqroom-core`, was archived
    read-only on 2023-01-25**; the whole of GitHub holds five repositories mentioning Cheqroom,
    the most recent being an individual "playing around with Cheqroom API" in June 2026.
    <https://github.com/CHECKROOM/checkroom_core_js>

---

## What users say they WANT (feature-request digest)

Separated out because the brief asks for it explicitly, and because wants are more actionable
than complaints.

| Want | Who asked | Evidence |
|---|---|---|
| Command/"magic" barcodes so the keyboard is never touched | Current RMS users | extension implements `freescan`, `*revert*`, `*container*`, `allocate`, `bookout`; issue #78 asks for more |
| Barcodes that encode a quantity (`*%5%90210*` = 5 units) | Current RMS users | extension feature; issue #133 |
| Scan-to-open / scan-to-close a container | Current RMS users | extension; noted as a norm "in other hire management software" |
| Scan an item straight into quarantine/damaged | Current RMS users | issue #68 (2024-09-16) |
| Semantic spoken feedback while scanning | Current RMS users | extension: distinct voice messages, per-level alert config |
| Pick which camera the scanner uses | shelf.nu + InvenTree users | shelf.nu #1768; inventree-app #615 |
| Multi-scan without the modal closing | InvenTree users | #11138 |
| Partial/unlockable kit components | shelf.nu users | #1283 (names microphones and lenses) |
| Quantity/consumable assets under one container QR | shelf.nu users | #912 |
| Use our existing asset IDs and QR labels | shelf.nu users | #1068, #1338 |
| Book a *type* of asset, not a specific unit | shelf.nu users | #1769 |
| Late-return tracking, strikes, reminders | shelf.nu users | #1956 |
| German/multi-language UI | shelf.nu users | #1443 (2024), #2493 (2026) — twice, still open |
| Reservations with dates and approval | Snipe-IT users | #5081, open since 2018 |
| Kits with specified components incl. accessories | Snipe-IT users | #8762 |
| Location hierarchy that sums its children | Snipe-IT users | #4546, open since 2017 |
| Label template choice, count, sheet start position, saved profiles | Snipe-IT users | #19541, #19478, #18013, #9173 |
| Photo evidence attached to check-in via API | Snipe-IT users | #19174 |
| Bulk RFID audit scanning | Snipe-IT users | #16885, #15595 (both closed unshipped) |
| Storage container tracking | InvenTree users | #2058, open since 2021 |
| Air-gapped deployment | InvenTree users | #7688 |
| Repair orders | InvenTree users | #12064 |
| Native app against a self-hosted server | shelf.nu users | #2713 |

---

## Where this leaves AV Planner Suite

Stated carefully, because AV Planner Suite is a **design-time planning suite** (offline-first
Electron, local project files, MIT, shared `@avplan/inventory-core` wire format) and **not a
warehouse asset-tracking product**. Most findings above are therefore *integration
requirements* or *things not to repeat*, not features to build.

**Where the suite already answers a pain found here:**

- **Offline is designed, not accidental.** Pattern 9 shows three products breaking offline
  through unaudited incidental dependencies (Gravatar, deployment-time network calls,
  cloud-bound mobile clients). A local-file, offline-first desktop app has no equivalent
  failure mode — provided the suite audits its own incidental fetches with the same
  scepticism.
- **Identity is portable by construction.** Pattern 6 (products imposing their own IDs) is
  answered by `avplan-inventory` being a portable wire format with `resolveInventoryCode` and a
  version-frozen contract: the suite can *adopt* an asset identifier from Rentman, Snipe-IT or
  a pre-existing label rather than minting a competing one.
- **No lock-in to defend against.** Pattern 11 (businesses running on unpaid third-party
  JavaScript against a SaaS that can break it) is structurally impossible for an MIT desktop
  app with local files.

**Where the suite should deliberately NOT compete:**

- Checkout/check-in loops, damage tickets, inspections, RFID hardware, label printing. These
  are runtime warehouse concerns with entrenched incumbents; patterns 7 and 8 show they are
  expensive and thankless. **The integration target, not the build target.**

**Where the findings translate into concrete suite work (each an INFERENCE, to be weighed by
the strategy pass, not a committed feature):**

1. **Case/container modelling is the segment's real dividing line** (pattern 3) and it is a
   *design-time* concept as much as a runtime one — what goes in which case is decided while
   planning, not while scanning. A planning suite that emits a case/packing structure the
   warehouse system can consume is filling a gap InvenTree has left open for five years and
   Current RMS handles badly.
2. **Kits are templates; shipped kits are instances that substitute** (pattern 4). The
   inventory model should represent that distinction, because no product in this segment does.
3. **Export must survive the receiving system's import** (pattern 13). Given shelf.nu #2799,
   anything the suite exports should be idempotent and row-identifiable, so a partial import on
   the other side is recoverable.
4. **Bulk consumables need first-class quantity** (pattern 12) — cables, adapters, gel,
   batteries are most of an AV case by count and the segment models them badly.
5. **If the suite ever surfaces a scan interaction**, treat it as a stream with semantic audio
   (patterns 1 and 2), and always pair a scan path with a desk path (pattern 5).

---

## Sources

Every URL below was opened during this pass on **2026-08-29**. Nothing is cited that was not
read. Fetched via GitHub HTML/raw endpoints — the only network destination reachable from this
environment.

### Current RMS (via the community extension)
- <https://github.com/CompositeLight/currentRMS-helper>
- <https://raw.githubusercontent.com/CompositeLight/currentRMS-helper/main/README.md>
- <https://raw.githubusercontent.com/CompositeLight/currentRMS-helper/main/Features.md>
- <https://github.com/CompositeLight/currentRMS-helper/issues?q=is%3Aissue+is%3Aopen>
- <https://github.com/CompositeLight/currentRMS-helper/issues?q=is%3Aissue+is%3Aopen&page=2>
- <https://github.com/CompositeLight/currentRMS-helper/issues/142>
- <https://github.com/CompositeLight/currentRMS-helper/issues/138>

### Snipe-IT
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Acomments-desc>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+label+printing>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+barcode+OR+scan+OR+scanning>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+API>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+slow+OR+performance+OR+timeout+OR+memory>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+is%3Aopen+mobile+app>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+RFID>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+offline+OR+%22no+internet%22>
- <https://github.com/snipe/snipe-it/issues?q=is%3Aissue+audit>
- <https://github.com/snipe/snipe-it/issues/4546>
- <https://github.com/snipe/snipe-it/issues/5081>
- <https://github.com/snipe/snipe-it/issues/8762>
- <https://github.com/snipe/snipe-it/issues/14185>
- <https://github.com/snipe/snipe-it/issues/18280>
- <https://github.com/snipe/snipe-it/issues/19531>
- <https://github.com/snipe/snipe-it/releases>
- <https://github.com/snipe/snipe-it/releases.atom> (used to verify v8.7.0/8.7.1/8.7.2 dates)

### shelf.nu
- <https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
- <https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-desc>
- <https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+is%3Aopen+label%3Abug>
- <https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+scan+OR+barcode+OR+QR>
- <https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+offline+OR+companion+OR+PWA>
- <https://github.com/Shelf-nu/shelf.nu/issues/912>
- <https://github.com/Shelf-nu/shelf.nu/issues/1068>
- <https://github.com/Shelf-nu/shelf.nu/issues/1283>
- <https://github.com/Shelf-nu/shelf.nu/issues/1768>
- <https://github.com/Shelf-nu/shelf.nu/issues/2713>
- <https://github.com/Shelf-nu/shelf.nu/issues/2799>
- <https://github.com/Shelf-nu/shelf.nu/issues/2831>
- <https://github.com/Shelf-nu/shelf.nu/issues/2839>

### InvenTree
- <https://github.com/inventree/InvenTree/issues?q=is%3Aissue+is%3Aopen+barcode>
- <https://github.com/inventree/InvenTree/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
- <https://github.com/inventree/InvenTree/issues?q=is%3Aissue+is%3Aopen+offline+OR+RFID+OR+NFC>
- <https://github.com/inventree/InvenTree/issues?q=is%3Aissue+is%3Aopen+label+printing>
- <https://github.com/inventree/InvenTree/issues/2058>
- <https://github.com/inventree/InvenTree/issues/7688>
- <https://github.com/inventree/InvenTree/issues/11138>
- <https://github.com/inventree/InvenTree/issues/11650>
- <https://github.com/inventree/inventree-app/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>

### Cheqroom
- <https://github.com/CHECKROOM/checkroom_core_js>
- <https://github.com/CHECKROOM/checkroom_core_js/issues>
- <https://raw.githubusercontent.com/CHECKROOM/checkroom_core_js/master/README.md>
- <https://github.com/Netsyde-Systems/cheqreport>
- <https://github.com/rhopper-bowdoin/CheqRoomRestAPI>
- <https://github.com/Hamza4859/CheqroomAPI>

### HireHop
- <https://github.com/sj-tech-sweden/Hirehop-tools>
- <https://github.com/teamantware/node-hirehop>
- <https://github.com/teamantware/node-hirehop/issues>
- <https://raw.githubusercontent.com/teamantware/node-hirehop/main/README.md>

### Rentman
- <https://github.com/Nebensound/rentman-api-client>
- <https://github.com/Nebensound/rentman-api-client/issues>
- <https://raw.githubusercontent.com/Nebensound/rentman-api-client/main/README.md>
- <https://github.com/patrick-dmxc/RentmanSharp>
- <https://raw.githubusercontent.com/patrick-dmxc/RentmanSharp/main/README.md>
- <https://github.com/Nebensound/Rentman.rs/issues>

### Ecosystem-size queries (GitHub repository search API, via MCP)
- `cheqroom` — 5 results total
- `hirehop` — 13 results total
- `rentman` — 428 results, of which 6 are Rentman-the-rental-software related
- `current-rms` — 110 results, of which ~8 are Current RMS related
- `"flex rental solutions" flex5 equipment` — 0 results
- `easyjob protonic rental software` — 0 results
- `snipe-it mobile scanner app` — 0 results

### Confirmed unreachable this session (probed with curl through the egress proxy, 2026-08-29)
`reddit.com`, `g2.com`, `capterra.com`, `trustradius.com`, `sourceforge.net`,
`alternativeto.net`, `stackoverflow.com`, `news.ycombinator.com`, `snipe-it.com`,
`snipe-it.readme.io`, `shelf.nu`, `inventree.org`, `docs.inventree.org`, `demo.inventree.org`,
`cheqroom.com`, `help.cheqroom.com`, `rentman.io`, `hirehop.com`, `current-rms.com`,
`flexrentalsolutions.com`, `protonic.de`, `timly.com`, `geartracking.com`, `controlbooth.com`,
`blue-room.org.uk`, `film-tv-video.de`, `production-partner.de`, `forums.prosoundweb.com`.

**Re-run this dossier's angles 1, 2, 4, 5 and 6 when those hosts are reachable.** The products
most damaged by their absence, in priority order: **Rentman** (closest competitor on the case
model, German market), **easyjob** (DACH incumbent), **Cheqroom** (best damage loop),
**Timly** (DACH QR tool), **Flex** (deepest container model).
