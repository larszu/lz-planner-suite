# Pain points: Network Documentation & Broadcast IP Management

Research date: **2026-08-29** (brief dated 2026-08-28).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Language of corpus: English (repo docs mix DE/EN; research corpus stays EN).
Companion document: [`landscape/networking.md`](../landscape/networking.md).

---

## Method

### Read this first — what this pass could and could not reach

Two hard constraints shaped this dossier. Stating them plainly, because they
determine how much weight each section can carry.

**1. The session's web-search budget was exhausted before this pass began**
(200 of 200 `WebSearch` calls consumed by earlier segment passes in the same
session). **Zero search-engine queries ran.** The brief asked for 8–15 distinct
searches across Reddit, review sites and professional forums. That instruction
is **unexecuted as written**. It was partly compensated by using GitHub's own
in-repository issue search as a search surface — 38 distinct issue-search
queries across 19 repositories — but that only searches GitHub.

**2. Network egress is restricted to GitHub.** I probed 23 candidate domains
directly through the proxy on 2026-08-29. Result:

| Reachable | Blocked (connection refused at the egress proxy) |
| --- | --- |
| `github.com`, `raw.githubusercontent.com`, `gist.github.com` | `reddit.com`, `old.reddit.com`, `g2.com`, `capterra.com`, `trustradius.com`, `stackoverflow.com`, `serverfault.com`, `networkengineering.stackexchange.com`, `news.ycombinator.com`, `lobste.rs`, `netboxlabs.com`, `docs.netbox.dev`, `specs.amwa.tv`, `amwa.tv`, `librenms.org`, `netdisco.org`, `suzieq.readthedocs.io`, `nevion.com`, `audinate.com`, `film-tv-video.de`, `production-partner.de`, `blue-room.org.uk` |

**Consequences, stated plainly:**

- This dossier is **strong** on open-source data models, issue trackers,
  changelogs, release notes and source code — and it is unusually strong there,
  because this segment is almost entirely open source, so the primary sources
  *are* the issue trackers.
- It is **silent** on Reddit and forum sentiment, on G2/Capterra/TrustRadius
  review text, and on the German-language trade press. Do not read the absence
  of, say, r/VIDEOENGINEERING complaints about NMOS as evidence that none exist.
  It is evidence that I could not open the page.
- It contains **no verified prices**. Every pricing page in this segment is on a
  blocked domain. The only cost facts available are software licences, which I
  read in-repository. Any figure in a comparison deck must be re-sourced.
- Commercial products (Nevion VideoIPath, Dante Domain Manager) are evidenced
  **only indirectly**, through open-source clients written against them. That
  turns out to be more informative than it sounds — a broadcaster writing and
  open-sourcing an API wrapper is itself a finding — but it is second-hand about
  the product's own UX.

Because forum sentiment was unavailable, this pass leaned hard on a different
and arguably better signal: **reading the products' own source code and data
models**, and **counting how often the same feature request is declined**. A
feature request declined six times over three years is stronger evidence of a
structural boundary than any number of angry posts.

### What was actually read

**≈96 URLs opened**, of which roughly 88 returned usable content. All first-hand
— pages opened and read, plus five files fetched raw and inspected locally. No
search-engine snippets, because no search engine was available.

- **Issue trackers read directly** (19 repositories): `netbox-community/netbox`,
  `netbox-community/pynetbox`, `netbox-community/netbox-docker`,
  `netbox-community/netbox-topology-views`,
  `netbox-community/netbox-floorplan-plugin`,
  `netbox-community/devicetype-library`, `netboxlabs/diode`,
  `netboxlabs/orb-agent`, `nautobot/nautobot`,
  `nautobot/nautobot-app-device-onboarding`, `sony/nmos-cpp`, `sony/nmos-js`,
  `AMWA-TV/is-04`, `AMWA-TV/is-05`, `AMWA-TV/nmos-testing`, `netdisco/netdisco`,
  `librenms/librenms`, `netenglabs/suzieq`, `ebu/pi-list`,
  `SWR-MoIP/VideoIPath-Automation-Tool`,
  `bitfocus/companion-module-audinate-dante-ddm`,
  `bitfocus/companion-module-nevion-videoipath`, `bitfocus/nmos`,
  `chris-ritsen/network-audio-controller`.
- **Vendor's own community surveys**: the NetBox 2022 and 2023 Community Survey
  results discussions — the single most honest source in this pass, because it
  is the vendor publishing what its users asked for.
- **Release notes / changelogs**: NetBox releases index, NetBox v4.7.0-beta1
  release notes, netbox-topology-views releases.
- **Source code and documentation read directly** (the decisive evidence):
  `netbox/dcim/choices.py`, `netbox/dcim/constants.py`, `docs/introduction.md`,
  `docs/models/dcim/cable.md`, the SuzieQ README, the Dante DDM Companion
  module's `HELP.md`, and one community device-type YAML for a Blackmagic ATEM.

### Frequency grading used here

Per [`METHOD.md`](../METHOD.md): `isolated` (one source), `recurring` (several
independent sources of different types), `widespread` (a well-known theme,
visible across many sources and often acknowledged by the vendor itself — a
long-open issue, a documented limitation, a repeated decline).

One caveat specific to this pass: because forums were unreachable, a grade of
`widespread` here is earned by **repetition inside GitHub across independent
repositories and years**, not by cross-medium confirmation. Where a finding
would normally need a forum thread to confirm, it is graded down and flagged.

---

## Per-product findings

### NetBox (NetBox Labs + community, Apache 2.0)

The centre of gravity of this segment, and therefore the product with the most
evidence. Core is at v4.6.9 (2026-08-25) with v4.7.0-beta2 in test (2026-08-26).

#### STRENGTHS (what even critics concede)

- **The object graph is genuinely the best available.** Nothing else models
  sites → locations → racks → devices → modules → interfaces → cables →
  prefixes → VLANs → VRFs → circuits in one consistent, referentially-intact
  schema. Every complaint below is a complaint about a boundary of that model,
  not about its quality inside the boundary.
- **The API is a first-class citizen, not an afterthought.** REST with OpenAPI
  plus GraphQL, ETag/If-Match optimistic concurrency, and change logging on every
  object. Competitors in adjacent segments have nothing comparable.
- **Cabling is modelled at all.** NetBox tracks cables as first-class objects
  with label, colour, length + unit, type, status and a traversal that follows
  pass-through ports — including breakout cables since v4.5. Most asset systems
  treat a cable as a line item; NetBox treats it as a graph edge.
- **Rack elevations render as SVG** and are exportable. (FACT,
  `docs/introduction.md`, read 2026-08-29.)
- **Development is fast, public and disciplined.** Nine patch releases in
  roughly three months (v4.6.2 → v4.6.9, 2026-06-02 → 2026-08-25), each with
  published notes; issues carry explicit `complexity:`, `status:` and `type:`
  labels so users can see triage decisions.

#### WEAKNESSES

**1. The connector and interface vocabulary is a hardcoded Python enum, and it
is closed to broadcast.** *(FACT, verified in source; `widespread`)*

Read from `netbox/dcim/choices.py` on master, 2026-08-29:

- `InterfaceTypeChoices` spans roughly 650 lines of hardcoded constants. Its
  entire **"Coaxial" group contains exactly two entries: DOCSIS and MoCA.**
- **There is no SDI interface type of any kind.** No 3G-SDI, 6G-SDI, 12G-SDI,
  24G-SDI. Grepping the whole file for `sdi`, `hdmi`, `xlr`, `madi` and `aes`
  returns nothing.
- `PortTypeChoices` (front/rear pass-through ports) *does* contain `bnc`, `f`
  and `n`. So NetBox can describe a coax **patch-panel hole** but not a coax
  **device port**.

The request history explains why this is structural rather than accidental:

| Issue | Request | Outcome |
| --- | --- | --- |
| [#2865](https://github.com/netbox-community/netbox/issues/2865) (2019-02-07) | Coax form factors — "Belling-Lee, BNC, F, N, UHF" | Closed |
| [#6555](https://github.com/netbox-community/netbox/issues/6555) (2021) | "Broadcast connectors and cables" | Closed, completed |
| [#11915](https://github.com/netbox-community/netbox/issues/11915) (2023-03) | BNC and SMA on device interfaces | Closed, completed |
| [#14597](https://github.com/netbox-community/netbox/issues/14597) (2023-12-24) | **SDI interface types** (3G/6G/12G/24G, BNC and SFP) | Closed, labelled **`plugin candidate`** |
| [#16778](https://github.com/netbox-community/netbox/issues/16778) (2024-07) | Interface types for radio systems | **Not planned** |
| [#17128](https://github.com/netbox-community/netbox/issues/17128) (2024-08) | Interface types for IP radio / wireless | **Not planned** |
| [#17208](https://github.com/netbox-community/netbox/issues/17208) (2024-08-19) | 10base-T/-F for OT environments | **Not planned** (labelled `complexity: low`) |

Issue #14597 deserves its own line, because its author is exactly the AV Planner
Suite user: they were documenting **a 2U Blackmagic Videohub with 82 BNC
connectors** and had to classify hundreds of SDI connections as "Other". The
answer was the `plugin candidate` label. Verified against source: no SDI types
exist in core as of 2026-08-29.

**2. What that boundary does in practice — the ATEM evidence.** *(FACT, read
from source; the single most decisive artefact in this pass)*

The community `devicetype-library` does contain a `Blackmagicdesign` folder.
I read `device-types/Blackmagicdesign/atem-constellation-8k.yaml` (210 lines,
2026-08-29). Its composition:

| Component class | Count | Types used |
| --- | --- | --- |
| `interfaces` | 1 | `1000base-t` (the CONTROL port) |
| `rear-ports` | 92 | **88 × `bnc`**, 4 × `other` |
| `front-ports` | **0** | — |
| `power-ports` | 2 | `iec-60320-c14`, 300 W allocated each |
| `console-ports` | 2 | `usb-b`, `rj-12` |

Every SDI input, every SDI output, every multiview output, MADI in/out and the
reference input is modelled as a **rear-port of type `bnc`**. The four balanced
analogue audio connectors are `type: other`, because `PortTypeChoices` has no
XLR. There are **zero front-ports**, so those 92 rear-ports are unmapped
pass-throughs.

The consequences follow mechanically (INFERENCE, but tightly grounded):

- **Signal direction is not modelled.** `SDI-INPUT-1` and `SDI-OUTPUT-1` are the
  same kind of object; only the free-text *name* distinguishes them. Nothing
  stops you cabling two outputs together.
- **Signal format is not modelled.** `bnc` is a connector shape. Whether a port
  carries 12G-SDI, 3G-SDI, MADI or analogue black-and-burst is invisible to the
  schema. The question "will this cable carry this signal?" cannot be asked.
- **A production switcher is indistinguishable from a patch panel.** Rear-ports
  exist to transit signal from a front-port; a rear-port with no front-port is a
  path terminus. NetBox's cable tracer therefore sees the flagship broadcast
  switcher as "a 2U box with 88 identical coax holes and one Ethernet port".

This is the segment's central limitation for AV, stated as a fact rather than an
opinion.

**3. Rack modelling is full-width only, and the request has been declined at
least six times.** *(FACT; `widespread`)*

| Issue | Date | Outcome |
| --- | --- | --- |
| [#10192](https://github.com/netbox-community/netbox/issues/10192) "Enable support for half-rack width devices" | closed 2022-08-29 | duplicate |
| [#15940](https://github.com/netbox-community/netbox/issues/15940) "Support for half-width device type" | opened 2024-05-03 | **not planned** |
| [#15945](https://github.com/netbox-community/netbox/issues/15945) "Support for half-width device type v2" | closed 2024-06-01 | **not planned** |
| [#17021](https://github.com/netbox-community/netbox/issues/17021) "Rack Width property for devices" | opened 2024-07-30 | **not planned** |
| [#18134](https://github.com/netbox-community/netbox/issues/18134) "change 0.5U to be 'half-width'" | closed 2024-12-02 | **not planned** |
| [#18925](https://github.com/netbox-community/netbox/issues/18925) "Allow half/Quarter sized modules in a chassis" | closed 2025-03-20 | **not planned** |

#17021 (by `llamafilm`) asked for a `rack_width` field supporting 1/4, 1/3, 1/2
and full, and named the current workaround explicitly: administrators must
create **unnecessary "parent" devices** to place multiple narrow units in one
RU. The same request is the **second-most-upvoted open issue in Nautobot**
([#4584](https://github.com/nautobot/nautobot/issues/4584), open since
2023-10-02), so it survived the fork.

For a broadcast or AV rack — mini converters, DAs, frames, half-rack recorders,
1/3-width interfaces — this is not an edge case. It is most of the rack.

**4. Cable-path tracing is the fragile core, and the maintainer says so.**
*(FACT; `widespread`)*

Cable profiles arrived only in **v4.5** (`docs/models/dcim/cable.md`), so this is
young code carrying old expectations. The 2026 issue crop, filtered on
"topology":

| Issue | Date | State |
| --- | --- | --- |
| #22947 `CablePath.from_origin()` silently aborts when a duplex/BiDi strand pair crosses onto separate Cable objects | 2026-08-17 | open |
| #22825 CablePath crashes / `NoReverseMatch` from a CircuitTermination in a pure passive network | 2026-08-05 | fixed v4.6.8 |
| #22737 Deleting a profiled cable leaves stale connector metadata on cable endpoints | 2026-07-23 | fixed v4.6.6 |
| #22233 `site_id` filter on `/api/dcim/cables/` returns nothing when both ends are circuit terminations | 2026-05-22 | fixed v4.6.2 |
| #21960 Cable trace fails to resolve `connected_endpoints` when a front port with multiple positions maps to multiple rear ports converging on one endpoint | 2026-04-19 | open |
| #21688 Reduce per-position ORM lookups when tracing profiled cable paths | 2026-04-17 | fixed v4.6.0 |

Six cable-path defects in five months, in the exact code path a signal-flow
planner depends on. The docs also confirm two tracing behaviours coexist: "If no
profile is assigned, legacy tracing behavior will be preserved."

Note the word "silently" in #22947. A tracer that aborts without telling you is
worse than one that errors, because the drawing still renders — just wrong.

#### MISSING FEATURES (what users request)

The **2022 Community Survey** (487 respondents, 58 countries, published
2022-04-04 by the lead maintainer) ranked the open-ended feature requests. The
top seven:

| Rank | Request | Mentions |
| --- | --- | --- |
| 1 | VXLAN/EVPN overlay modelling | 17 |
| **2** | **Cable modelling / tracing improvements** | **15** |
| 3 | UI / workflow improvements | 10 |
| 4 | Virtual circuit modelling | 10 |
| **5** | **Topology diagram generation** | **9** |
| **6** | **Datacenter floor plan diagrams** | **7** |
| 7 | VPN modelling | 6 |

Three of the top six are *drawing the network*, and cable modelling is second
overall. The survey notes these are "recurring themes … from prior years".
Also relevant to a European product: **Germany was the second-largest respondent
country at 18%**, and **60% of respondents were based in Europe**.

Other standing requests read directly:

- **[#19003](https://github.com/netbox-community/netbox/issues/19003) "Support
  for offline storage of modules"** — one of the most-upvoted open issues, and
  *opened by the lead maintainer himself* (2025-03-25). Modules today cannot
  exist outside a parent device, so **spares in a store room are unmodellable**.
  Still `status: backlog`, `complexity: high`. For rental/AV inventory this is a
  direct hit.
- **[#8323](https://github.com/netbox-community/netbox/issues/8323) "Show images
  of selected connector types in forms"** (2022-01-11, still backlog) — users
  want to *see* the connector when picking it, "to help users find the correct
  type and avoid errant selections". Four and a half years open.
- **[#14205](https://github.com/netbox-community/netbox/issues/14205) "Customize
  RackView labels"** (2023-11-07, **deferred**) — engineers want asset tags or
  power draw on the rack elevation instead of hostnames, because during
  inventory work they otherwise have to hover or click every device.
- **[#9583](https://github.com/netbox-community/netbox/issues/9583) "Add
  column-specific search fields to tables"** — open since 2022-06-22.
- **[#16392](https://github.com/netbox-community/netbox/issues/16392) "Collapse
  side navigation"** — the single most-upvoted open issue, opened 2024-06-03,
  `status: blocked`. Users want screen space back for large tables.
- **[#21663](https://github.com/netbox-community/netbox/issues/21663) "Allow
  arbitrary connector/position counts for cable profiles"** (2026-03-12, under
  review) — see below.

#### UX PROBLEMS

- **Screen real estate.** The top-voted open issue is "give me back the space the
  sidebar is eating" (#16392), blocked for over two years.
- **The rack elevation cannot be re-labelled** (#14205, deferred). You get
  hostname and/or image, and nothing else, which is the wrong label for both
  inventory work and power audits.
- **Choosing a connector type is a text-only guessing game** (#8323).
- **UI/workflow improvements were the #3 survey request** in 2022 (10 mentions).
- **Recurring UI regressions.** The v4.6.x release notes repeatedly patch dark
  mode styling, sidebar navigation initialisation, and form field error display.

#### PERFORMANCE PROBLEMS

- **Cable path tracing is synchronous, and the lead maintainer opened the issue
  to fix it.** [#22596](https://github.com/netbox-community/netbox/issues/22596)
  "Defer cable path tracing to background jobs" (2026-07-02, `jeremystretch`,
  `complexity: high`, backlog) states that in dense topologies — "patch-panel
  farms, high-fan-out cassettes, long trunk chains" — a single cable edit forces
  many paths to be recomputed in-request, "making saves slow and bulk cable
  imports painful". No timings are published. *This is a vendor admission, which
  makes it the strongest performance evidence in this dossier.*
- **GraphQL N+1 queries are a running sore.** Four consecutive releases fixed
  them: v4.6.6, v4.6.7 (GraphQL query reduction), v4.6.8 (explicit "GraphQL N+1
  query fixes"), v4.6.9 (GraphQL performance). What a vendor keeps fixing is what
  keeps breaking.
- **Recursive counting is unsolved.**
  [#19976](https://github.com/netbox-community/netbox/issues/19976) "Cache counts
  of related objects for recursively-nested models" — open since 2025-07-29,
  `complexity: high`.
- **Scale context:** the 2023 survey reports an average of **2,832 devices** per
  instance with a maximum of **100,000**, and an average of 2,573 prefixes
  (max 170,000). Instances get large.
- Note: there is currently **no `topic: performance` label with open issues** —
  performance work is tracked as `type: performance` and mostly closed quickly.
  That is a point in NetBox's favour.

#### PRICING PROBLEMS

**No verified prices.** `netboxlabs.com` is blocked at the egress proxy
(confirmed 2026-08-29), so the NetBox Cloud and NetBox Enterprise price pages
could not be opened. What is verifiable:

- **NetBox core is Apache 2.0** — free, self-hosted. No seat limits, no feature
  gating in core. This is a genuine strength and the reason the segment is
  centred here.
- **The commercial edge is at the discovery layer, not the core** — see Diode
  below. That is the licence boundary to watch, not a seat count.
- One survey commenter asked whether the survey covered NetBox Cloud paid users,
  "noting curiosity about its adoption relative to other deployment options" —
  suggesting the paid tier's uptake is not publicly visible. Weak evidence,
  `isolated`.

**To verify:** NetBox Cloud / Enterprise tier pricing and whether it is
advertised or requires sales contact. Needs `netboxlabs.com/pricing`.

#### LOCK-IN

Low by the standards of this corpus, but not zero:

- **No proprietary format.** Data is in PostgreSQL, reachable by REST, GraphQL
  and CSV export. This is the least locked-in product in the segment.
- **The real lock-in is the type enum.** Because `InterfaceTypeChoices` is code,
  not data, a broadcast shop that needs SDI types must fork NetBox, ship a
  plugin, or misuse `other`. Issue #21663 names the cost precisely: making
  profiles parametric "lets operators model their actual plant **without forking
  NetBox or maintaining patches**" — which is a description of what people are
  doing today.
- **The plugin escape hatch is itself a lock-in**, because plugins are pinned to
  NetBox minor versions (see below).

#### OFFLINE

- **Self-hosted and fully offline-capable in principle** — Django + PostgreSQL +
  Redis, no phone-home required. Good.
- **But "offline" here means "on a server in your building", not "on a laptop in
  a truck".** v4.7 raises the floor to **PostgreSQL 15** and **Redis 6.0**, and
  adds a hard requirement for the PostgreSQL `ltree` extension. There is no
  single-file, no embedded, no laptop mode.
- **Search for `offline`/`airgap` in the issue tracker returns nothing** — no
  documented air-gap installation pain, but also no evidence anyone is doing it
  as a supported path. UNKNOWN rather than fine.
- **Container deployment is the norm and it is where the data-loss reports are.**
  `netbox-docker` #1357 "Media files disappeared from volume after upgrade to
  4.1.7" (2024-12-03); #516 "Volume Permissions" open since 2021-05-19; #1488
  "Folder Permissions don't match default user" (2025-07-28).

#### INTEGRATION PROBLEMS

- **GraphQL is not at parity with REST.**
  [#20946](https://github.com/netbox-community/netbox/issues/20946) (2025-12-08,
  **deferred**): GraphQL returns only the *ID* for object-type custom fields
  where REST returns the full object, forcing round-trips.
- **Webhooks carry too little context.**
  [#18848](https://github.com/netbox-community/netbox/issues/18848) "Extend
  webhook payload body to include related objects" (2025-03-10, backlog,
  `complexity: high`), and
  [#14896](https://github.com/netbox-community/netbox/issues/14896) "Include more
  context in Event Rules" (2024-01-23, **blocked**). v4.7 also *removes*
  `request_id` and `username` from webhook context — a breaking change for
  anything downstream that correlated on those.
- **API-created cables can leave an empty trace.**
  [#14200](https://github.com/netbox-community/netbox/issues/14200) "Cable
  termination update via API results in empty trace and 'connection' column on
  device interfaces page" — closed 2023-12-05 as **not planned**
  (`status: revisions needed`, i.e. it lapsed for want of a reproducer, not
  because it was disproven). If real, this is an API/UI divergence in exactly the
  place an external planner writes.
- **The Python client lags the model.** `pynetbox`
  [#436](https://github.com/netbox-community/pynetbox/issues/436) "Add support for
  NetBox objects in the custom fields" — **deferred**, open since 2022-01-06;
  [#170](https://github.com/netbox-community/pynetbox/issues/170) "Record
  attributes can conflict with NetBox model fields" — `status: accepted`, open
  since **2019-06-10**, seven years.
- **v4.7 is a large breaking-change release for integrators.** Read from the
  beta1 notes: `protocol`/`ports` replaced by `port_mappings` on Service;
  character-based REST filter lookups (`protocol__ic` etc.) removed;
  `DeviceWithConfigContextSerializer` removed; `?exclude=config_context`
  now ignored; API token plaintexts no longer client-specifiable; selection
  custom fields now return `{value, label}` objects instead of scalars.

---

### NetBox Discovery — Orb agent (Apache 2.0) + Diode (NetBox Limited Use License 1.0)

NetBox Labs' answer to "how does the source of truth learn what is actually
there". Evidence here is fresh — most issues are from July and August 2026.

#### STRENGTHS

- Real, working multi-protocol discovery (nmap, SNMP, SSH/netmiko, gNMI) feeding
  a source of truth, with a change-set / branch model so ingested data can be
  reviewed rather than blindly applied.
- Actively developed: dozens of issues opened *and closed* within August 2026.

#### WEAKNESSES — reconciliation is the hard part, and it is not solved

*(FACT, from the issue tracker; `recurring`, trending `widespread`)*

| Issue | Date | Problem |
| --- | --- | --- |
| [orb #559](https://github.com/netboxlabs/orb-agent/issues/559) | 2026-08-27 | Discovery runs successfully but **discovered IP addresses are not updated in NetBox** |
| [orb #503](https://github.com/netboxlabs/orb-agent/issues/503) | 2026-08-01 | Agent doesn't match the right module types |
| [orb #556](https://github.com/netboxlabs/orb-agent/issues/556) | 2026-08-26 | `discover_modules` not working on either IOS or IOS-XE |
| [orb #512](https://github.com/netboxlabs/orb-agent/issues/512) | closed 2026-08-26 | **Prefixes are created twice** |
| [diode #561](https://github.com/netboxlabs/diode/issues/561) | 2026-07-16 | **Duplicate chassis when ingesting switch stacks** |
| [diode #555](https://github.com/netboxlabs/diode/issues/555) | 2026-07-09 | Virtual chassis matched only on master — name-only refs duplicate |
| [diode #562](https://github.com/netboxlabs/diode/issues/562) | closed 2026-08-20 | "ingested duplicate ingestion log" |
| [diode #564](https://github.com/netboxlabs/diode/issues/564) | 2026-07-23 | Reconciler v2.1.0 **processes ingestion logs but never creates change_sets or changes** |
| [diode #553](https://github.com/netboxlabs/diode/issues/553) | 2026-07-09 | Boot-time default-branch refresh **races OAuth and silently applies to main** |

Diode #561 is worth reading in full: re-ingesting a Cisco stack recreates every
member after the first as a duplicate, the retry storms
`/diode/bulk-plan-apply` into timeouts, "causes NetBox to slow significantly",
and pre-upgrade duplicates produce **permanent unique-constraint errors requiring
manual database cleanup**. That is the reconciliation failure mode in one issue.

Two words recur and both are bad: **"duplicate"** and **"silently"**.

#### MISSING FEATURES

- **The discovery agent does not create cables.**
  [orb #558](https://github.com/netboxlabs/orb-agent/issues/558) (2026-08-27),
  "Feature Request: CDP/LLDP neighbor discovery and automatic NetBox cable
  creation", states it plainly: Orb populates devices and interfaces but "cannot
  correlate neighbor information to build physical cabling topology
  automatically". The requester even pre-writes the safety rules — only create a
  cable when "both endpoints can be identified uniquely", dry-run mode, no
  duplicates, warn before overwriting. **So the flagship source of truth's own
  discovery agent cannot yet fill in the cables.** Nautobot's onboarding app can
  (from LLDP); NetBox's cannot.
- [diode #572](https://github.com/netboxlabs/diode/issues/572) "Too many
  characters from SNMP — override possible?" (2026-08-05) — no normalisation
  hooks for vendor strings.

#### PRICING / LOCK-IN — the licence boundary

*(FACT, read on the repo, 2026-08-29)*

- **Orb agent: Apache 2.0.**
- **Diode: "Distributed under the NetBox Limited Use License 1.0"**, with only
  the protocol buffers under Apache 2.0.

This is the commercial seam in an otherwise open stack: the *collector* is open
source, the *reconciler that writes into your source of truth* is
source-available under a bespoke licence. Anyone building a competing ingest
path must not depend on Diode. Price: **UNKNOWN** (blocked domain).

#### OFFLINE

Self-hosted containers; no cloud dependency observed. But
[diode #549](https://github.com/netboxlabs/diode/issues/549) "Can't connect
reconciler to external postgres" and #565 (env var not passed to the container)
indicate the deployment surface is fiddly.

#### INTEGRATION PROBLEMS

Requires NetBox ≥ 4.2.3 *plus* the Diode NetBox plugin *plus* a matching
reconciler — a four-component version matrix (NetBox 4.6.5 / Diode 2.1.0 /
plugin 1.14.1 in #561). Version skew is the reported failure mode.

---

### Nautobot (Network to Code, Apache 2.0)

A NetBox fork from v2.10.4 plus a Jobs/app framework.

#### STRENGTHS

- Everything NetBox's model does well, plus a first-class **Jobs** framework and
  an app ecosystem, and — unlike NetBox's Orb — an onboarding app that **does**
  derive cable terminations from LLDP.

#### WEAKNESSES / MISSING FEATURES

The top-reacted open issues are a near-perfect mirror of NetBox's boundaries,
which tells you these are *segment* limits, not vendor choices:

- **[#838](https://github.com/nautobot/nautobot/issues/838) "Support dynamic
  definition of powerport and interface types"** — the **most-upvoted open
  issue**, opened **2021-08-20**, five years unresolved. The user story is the
  whole cross-product pattern in one sentence: users want to "add new hardware to
  Nautobot without needing to wait for a new release". The proposal is to replace
  the hardcoded `InterfaceType`/`PowerPortType` enums with database models like
  the existing customisable `Status` model. Blocked partly on staying compatible
  with the shared `devicetype-library`.
- **[#4584](https://github.com/nautobot/nautobot/issues/4584) "Half width
  devices"** — open since 2023-10-02. Widths are integers; the fix requires
  floats. Same gap as NetBox, still open rather than declined.
- [#1178](https://github.com/nautobot/nautobot/issues/1178) unify Device and
  VirtualMachine (2021-12-17, breaking) and
  [#3001](https://github.com/nautobot/nautobot/issues/3001) grouping physical and
  virtual devices (2022-12-14) — a long-running modelling complaint.
- [#3750](https://github.com/nautobot/nautobot/issues/3750) **GraphQL mutations**
  — open since 2023-05-15. GraphQL is read-only.

#### INTEGRATION PROBLEMS — device onboarding is per-vendor whack-a-mole

`nautobot-app-device-onboarding` open issues, sorted by discussion:

| Issue | Date | Failure |
| --- | --- | --- |
| #611 | 2026-08-20 | Sync fails on `cisco_xr` with `KeyError: 'serial'` |
| #521 | 2026-02-24 | Not updating Junos VLANs |
| #461 | 2025-12-02 | `no shut` interfaces on Cisco appear as not enabled |
| #399 | 2025-07-25 | Multiple locations with the same name break VLAN creation |
| #379 | 2025-06-06 | Onboarding fails for Arista EOS |
| #292 | 2024-12-27 | HP Comware IRF stacks need custom command mappers |
| #382 | 2025-06-16 | Cisco stacked switches not recognised |

Arista, Cisco IOS, Cisco XR, Juniper, HP Comware — every vendor, its own
breakage. See the cross-product pattern on discovery fragility.

#### PRICING / OFFLINE / LOCK-IN

Apache 2.0, self-hosted, same architecture as NetBox and therefore the same
"server, not laptop" profile. No verified commercial pricing (Network to Code
sells services; page not reachable).

---

### NMOS (AMWA specifications: IS-04/05/08/09/12/14, BCP-002-01/008)

#### STRENGTHS

- **It is the only open, vendor-neutral live device inventory and patch state for
  ST 2110**, and every specification is readable as Markdown in a public repo.
  Nothing else in broadcast is this transparent.
- IS-04 + IS-05 together give you, for free, what proprietary orchestrators
  charge for: what devices exist, what senders/receivers they have, and what is
  connected to what, right now.

#### WEAKNESSES — the specification has unresolved ambiguities, and implementers know it

*(FACT, from the AMWA issue trackers; `recurring`, and authoritative because the
reporters are the reference-implementation authors)*

[**IS-05 #163** "Potential implementation guidance / spec
clarifications"](https://github.com/AMWA-TV/is-05/issues/163) — opened
2023-04-06 by `garethsb` (the primary `nmos-cpp` maintainer), relaying a question
raised by `maweit` on the AMWA Slack. **Still open** after three and a half
years. It enumerates four things the spec does not settle:

1. **When do you validate?** Implementers cannot fully validate an activation
   request against all constraints at `/staged` — e.g. a sender that supports
   IS-05 but is restricted to an AES67 subset. Should extra restrictions be
   enforced at staging or deferred to activation? Unspecified.
2. **Contradictory activations.** Controllers submit `master_enable=true` with
   all `rtp_enabled=false`. The spec does not say what the device should do.
3. **Out-of-band activations.** When a patch is made from the device's own front
   panel or web UI rather than via IS-05, there is no guidance on how `staged`
   and `active` should be populated.
4. **Unconfigured senders.** Which addresses go in the second `transport_params`
   entry for a 2022-7-capable sender configured not to use it, or for a sender
   never configured at all? Ambiguous.

Every one of those is a place two vendors can be individually compliant and
mutually incompatible. Other open IS-05 issues: #166 (`/active` should always
contain all supported transport parameters, 2023-06-23), #170, #171 (a published
example does not match its own schema, 2023-11-01), #173 (dynamic video format
changes, 2023-12-12), #174 (2024-03-05). **Six open issues, none newer than
March 2024, none resolved.**

Open IS-04 issues in the same vein: **#219** "Not all ts-refclk forms of ST 2110
can be described" (2025-07-12); **#213** "NMOS needs to allow selection of the
PTP and media interface" (2024-03-05); **#211** "Mixed 2022-6/2110 inputs are not
supported" (2023-12-15); **#215** re-registration behaviour with a smaller I/O
count before garbage collection (2024-11-19); **#209** what a registered node
should do when a higher-priority registry appears (2023-10-24); **#207** the
IS-04 `manifest` endpoint versus the IS-05 `transportfile` (2023-09-27); **#192**
"CORS requirements can be misread" (2022-11-15).

Those are not nitpicks. #213 (which NIC carries PTP vs media) and #209 (registry
failover) are exactly the things that bite on a live show.

#### MISSING FEATURES / WHITE SPACE

- **NMOS documents no physical layer.** Nothing in IS-04/05 describes a cable, a
  rack unit, a connector, a label or a person. It is a control-plane inventory,
  not a documentation model. (INFERENCE from reading the spec repos; consistent
  with the landscape pass.)
- **IS-06** — the part that would have described switches, ports and bandwidth —
  **is deprecated**, so "will this 25G uplink carry these twelve 2110-20 flows?"
  has no standard answer.
- **No multicast address planning.** Multicast pools are a first-class object in
  Nevion VideoIPath (see below) but have no equivalent in NMOS or in NetBox.

#### OFFLINE

Genuinely good, and the best story in this segment: NMOS is designed for isolated
media LANs, and IS-04 defines a peer-to-peer mode for "small ad-hoc
installations". No internet required. **But** in practice every registry
implementation is a server process and discovery depends on mDNS, which is where
it breaks — see below.

---

### nmos-cpp / nmos-js (Sony, Apache 2.0) — the reference implementations

#### STRENGTHS

- `nmos-cpp` is the de-facto reference registry and node; `nmos-js` is
  JT-NM Tested. Both are Apache 2.0 and genuinely usable.
- **`nmos-js` is actively maintained** — last commit **2026-08-20**, with
  recent work on IS-08 channel mapping editing and proxying Query and Device NCP
  WebSockets through an NMOS bridge. (I checked this specifically because the low
  open-issue count looked like abandonment; it is not.)

#### WEAKNESSES — mDNS/DNS-SD discovery is the recurring failure mode

*(FACT, `recurring` across four years of issues; this is the finding to carry
forward)*

| Issue | Date | State | Problem |
| --- | --- | --- | --- |
| [#273](https://github.com/sony/nmos-cpp/issues/273) | 2022-09-01 | **open, no maintainer reply** | **"Mdns service can't be found if network link drops then recovers"** — unplug for >30 s and reconnect, and the node is no longer discoverable by Riedel NMOS Explorer or `avahi-browse`, though mDNSResponder's own `dns-sd` tool recovers fine |
| #435 | 2025-02-13 | open | Registry emits `error: -65540 while registering advertisement` when a `domain` is set |
| #362 | 2024-01-09 | open | Unicast DNS-SD support for the registry |
| #348 | 2023-10-06 | open | Quick restart → `asio listen error: system:98 (Address already in use)` |
| #427 | 2025-02-14 | closed | Service discovery issue on Linux |
| #441 | 2025-03-27 | closed | virtnode not showing up in registry |
| #323 / #265 | 2023 / 2022 | closed | Avahi issue; Debian 11 mDNS broken |

**#273 is the one that matters operationally.** A link flap — someone knocks a
patch cord, a switch reboots, an SFP resets — and the device vanishes from the
registry and does not come back. Open for four years without a maintainer
response. In a live truck that is a show-stopper, and it is the strongest single
argument for a planning tool that keeps its own persistent model rather than
trusting live discovery.

#### UX PROBLEMS

[`nmos-js` #96](https://github.com/sony/nmos-js/issues/96) (2025-04-01, open,
**no maintainer response in 17 months**): a user reports that in a clean checkout
most tabs including **Connect** are visible but greyed out and unclickable, while
the same devices work fine in Riedel's NMOS Explorer. Connection management is
the reference controller's core function. `isolated` as evidence, but it is
unanswered, which is itself a signal about controller polish.

`nmos-cpp` also carries long-lived build and platform issues: #150 (2020, glibc
header), #94 (2019, Raspberry Pi errors), #83 in `nmos-js` (2022, Node 18 build
failure). Getting the reference stack running is not trivial.

#### INTEGRATION PROBLEMS

The AMWA test suite [`nmos-testing`](https://github.com/AMWA-TV/nmos-testing)
has open issues dating to **2019** (#214 "IS-04-01 test_12 not discovering all IP
addresses?"), plus #504 (2020), #667 (2022), #752 (2023), #750 ("test_18 violates
SDP RFC 8866 port parity rule", 2023-01-16), #867 (2025). The certification
harness itself has known false results and environment sensitivity — #691 covers
Python packaging breakage when running unicast DNS-SD on Ubuntu. So "JT-NM
Tested" is a real signal, but the tooling behind it is fiddly.

---

### Nevion VideoIPath (Nevion / Sony) — evidenced only indirectly

`nevion.com` is blocked. Everything below comes from two independent
open-source clients written *against* the product, which is second-hand about UX
but first-hand about the API.

#### STRENGTHS

- It owns the things nothing else owns: **Inventory and Topology as distinct
  apps**, and **multicast pools as a first-class configurable object**. Multicast
  address planning is a real need and only closed orchestrators meet it.
- Drivers are versioned reverse-DNS identifiers (e.g.
  `com.nevion.NMOS_multidevice-0.1.0`), so NMOS is a *device type inside* the
  orchestrator — a coherent architecture.
- Routing is a graph with contention, not a crosspoint matrix: the Companion
  module exposes "configurable conflict handling" and endpoint types including
  **Group** and **Junction**.

#### PERFORMANCE PROBLEMS — the API times out on large topologies

*(FACT, from the SWR client's issue history; `recurring`)*

`SWR-MoIP/VideoIPath-Automation-Tool` needed three issues to fight this:

- **#39 "Resolve timeout issues in large systems when querying
  unidirectionalEdges"** (2025-05-30)
- **#43 "Follow Up: Resolve timeout issues in large systems when querying
  unidirectionalEdges"** (2025-06-02)
- **#44 "Revert default unidirectional fetch mode to BULK and revise
  documentation"** (2025-06-02)
- **#45 "Make request timeouts configurable via environment variables"**
  (2025-06-02)

Four issues in four days, all about one query being too slow at production scale.
Also **#61** "Devices with internal edges which are not `unidirectionalEdge`
cause an error" (2025-08-06) and **#36** "Validation Error in Legacy Systems Due
to `cType = 'Geo'`" (2025-05-26) — the API's own responses vary by server
version in ways clients must special-case.

#### PRICING / LOCK-IN

- **Price UNKNOWN** — sales contact, page unreachable. Not quotable.
- The API needs **VideoIPath Server 2023.4.2 or higher** (LTS recommended), and
  the Companion module "supports VideoIPath systems exposing the 2023 LTS API" —
  so API access is gated on being on a recent, presumably maintained, release.
- Authentication is a **normal VideoIPath UI user account over HTTPS:443** — no
  separate machine identity, no scoped tokens observed.
- **The strongest lock-in evidence is the existence of the client itself.** A
  German public broadcaster had to build, maintain and open-source an AGPL-3.0
  Python package to do bulk configuration, and it carries the disclaimer that it
  "is not a product or service offered by Nevion, and Nevion is not responsible
  for its functionality". If the vendor's own tooling covered bulk inventory and
  topology work, SWR would not have written this. (INFERENCE, but strong.)
- The README is candid: **beta**, "Features and interfaces may change", breaking
  changes expected, and "special care is advised concerning the use of external
  tools such as this" when managing critical media infrastructure.

#### OFFLINE

On-prem server; no cloud dependency evident. Fine.

---

### Dante Domain Manager (Audinate) — evidenced only indirectly

`audinate.com` is blocked. Evidence is the Bitfocus Companion module and its
`HELP.md`, read 2026-08-29.

#### PRICING / LOCK-IN — the API is behind a paid licence

**FACT, verbatim from
[`companion/HELP.md`](https://github.com/bitfocus/companion-module-audinate-dante-ddm/blob/master/companion/HELP.md):**
"This module requires access to the Dante Managed API, which is currently
available through a **Dante Cloud Beta account or Dante Domain Manager (from
version 1.5 onwards)**."

So: you cannot read or patch a plain Dante network programmatically. You need a
DDM licence (price UNKNOWN, blocked) or a cloud beta account. A module instance
is **scoped to one Dante domain** — multiple domains mean multiple connections.
The config also offers "Disable certificate validation (e.g. if your server is
using a self-signed certificate)", which tells you what deployments look like in
the field.

#### WEAKNESSES

- [#17](https://github.com/bitfocus/companion-module-audinate-dante-ddm/issues/17)
  "Route requests are dropped when trying to route multiple channels at once"
  (2025-04-28, since closed) — bulk subscription changes through the GraphQL API
  were lossy. Thin evidence (the issue body is empty), but the title is
  unambiguous and it drove a multi-channel subscription action with a "learn"
  button to reload fresh state.
- [#33](https://github.com/bitfocus/companion-module-audinate-dante-ddm/issues/33)
  "Feedback not detected" — open since 2026-02-10.
- [#20](https://github.com/bitfocus/companion-module-audinate-dante-ddm/issues/20)
  "Companion Hangs/freezes" (closed 2025-09-30).

#### MISSING FEATURES

[#18](https://github.com/bitfocus/companion-module-audinate-dante-ddm/issues/18)
"Import Dante connections" (closed 2025-09-30) — users want to **load a saved
patch** rather than build it button by button. That is a planning-tool-shaped
request arriving at a control surface.

#### The open alternative is explicitly not production-ready

`chris-ritsen/network-audio-controller` (netaudio, Unlicense) does subscriptions,
device discovery and AVIO gain over mDNS without Dante Controller — and its
README says it is "early" and **"not ready for anything other than a test
environment"**, warning it "could make the devices behave unexpectedly". Its open
issues are the expected shape of reverse-engineering: #52/#53 (2026-08-29) are
both about Biamp Tesira returning page structures the parser rejects; #47
"gateway and dns fields reversed"; #27 "Channel List Not Displaying All
Channels"; #26 "Lots of drops connection trouble"; #43 zeroconf socket errors.

**Conclusion for this product:** Dante's control plane is the most closed thing
in this segment. Either you pay for DDM, or you reverse-engineer.

---

### Netdisco (BSD-3-Clause)

#### STRENGTHS

Does one thing extremely well and says so: locate a machine by MAC or IP, show
the switch port it lives at, and change that port's VLAN or PoE. That is a real
operational job nothing else in the segment does as directly.

#### WEAKNESSES — the issue tracker is a vendor-compatibility ledger

*(FACT; `widespread` within the product)*

The dominant label on open issues is literally **`Vendor Support`**. A sample of
the most-discussed open issues:

| Issue | Date | Problem |
| --- | --- | --- |
| #1436 | 2025-10-29 | **Dell EMC switches with LLDP not establishing topology** — reporter suspects "LLDP not included in `SNMP::Info::Layer3::Dell`"; no maintainer reply |
| #1278 | 2025-01-14 | MAC address duplicated on random VLANs |
| #1279 | 2025-01-13 | Meraki MR33 not recognised |
| #1346 | 2025-06-08 | Cannot discover AP ports |
| #1028 | 2023-04-14 | No devices show on connected ports — macsuck/walk issue |
| #1027 / #1004 | 2023 | TP-Link / Netgear compatibility |
| #856 | 2022-02-08 | Brocade ICX address and VLAN detection |
| #230 | **2015-05-08** | UniFi controller collection script — open eleven years |

The reporter of #1436 says they are "using Netdisco in a small environment" and
just want automatic topology discovery — the small-shop case, unanswered.

#### UX / MISSING FEATURES

#1491 "'Search failed!' shown when 'Connected Nodes' is checked in Ports lists"
(2026-03-15, `Bug`); #1265 "FR: RADIUS auth against group supplied in VSA"
(2024-12-05, labelled `big`).

#### OFFLINE / PRICING

Self-hosted, BSD-3-Clause, free. Needs SNMP reach to managed switches — so it
tells you nothing about an unmanaged truck switch or a direct point-to-point run.

---

### LibreNMS (GPL v3)

#### STRENGTHS

Auto-discovery via CDP/LLDP/OSPF/BGP/ARP with VLAN, ARP and FDB collection, free
and self-hosted, with a very wide device-support library.

#### WEAKNESSES — same pattern as Netdisco: per-vendor discovery breakage

Open issues from the last three months (read 2026-08-29):

| Issue | Date | Problem |
| --- | --- | --- |
| #20361 | 2026-08-24 | Huawei SmartAX OLT discovery **crashes** with `SQLSTATE[22007]` on invalid UTF-8 bytes |
| #20264 | 2026-08-10 | Cisco transceiver discovery assumes a single ENTITY-MIB hierarchy |
| #20097 | 2026-07-14 | Nokia SR OS BGP discovery creates duplicate peers with NULL VRF |
| #19976 | 2026-06-29 | **TP-Link LLDP discovery hardcoded to `gigabitEthernet`** |
| #19881 | 2026-06-11 | **LLDP: link not updated when `remote_hostname` changes** |
| #19242 | 2026-03-18 | BGP VRF peers always idle on NX-OS/IOS-XR with SNMPv3 contexts |
| #20360 | 2026-08-24 | `/vminfo` throws 500 when an orphaned row references a deleted device |
| #20251 | 2026-08-07 | "Outages are not ending" |

Two LLDP topology bugs in three weeks, plus stale-link and duplicate-peer data
integrity problems. #19881 in particular means **the topology quietly goes stale
when a device is renamed** — a documentation tool that is confidently wrong.

Longer-lived open issues show slow triage: #13416 (2021-10-23, timezone mismatch
breaks poller cluster health), #13457 (2021-11-01), #14598 "Problems with current
LibreNMS use of PeeringDB" (2022-11-08).

#### PRICING / OFFLINE

GPL v3, free, self-hosted. Runs offline; requires SNMP to managed devices.
Per the landscape pass, `discovery-arp`, `discovery-route` and `discovery-vrf`
ship **off by default** — so out of the box it discovers less than users expect.

---

### SuzieQ (netenglabs / Stardust Systems, Apache 2.0 + commercial)

#### STRENGTHS

Conceptually the most interesting product in the segment: normalised,
vendor-independent network state **over time**, with LLDP topology, path
visualisation between two endpoints, and declarative `asserts`. "What changed
between 10 pm and midnight" is a question nothing else here answers.

#### WEAKNESSES — maintenance risk is the headline

*(FACT; this is the finding)*

- **Last commit on `master`: 2025-05-09.** Fifteen and a half months of silence
  as of 2026-08-29.
- The README still says "SuzieQ requires python version 3.7.1 at least, and has
  been tested with python versions 3.7 and 3.8" — both long out of support.
- "It has not been tested to work on Windows."
- Open issues have aged in place: #143 IPv6 path bug (2020-06-13), #291 bogus
  interface speed `4294967295` on Cumulus (2020-12-03), #340 path shows identical
  spine paths that should differ (2021-03-16), **#435 "Poller Requires Restart
  After LLDP Change" (2021-10-07)**, #633 "Performance Tuning" (2022-03-17),
  #649 read-only account returns missing/unwanted NXOS data (2022-03-21), #957
  poller fails on macOS in Docker (2024-06-01).

#435 is notable: the poller does not pick up topology changes without a restart.
For a tool whose whole premise is observing change over time, that is a pointed
limitation, open for nearly five years.

#### PRICING

Apache 2.0 core plus "an enterprise version … deployed in production by multiple
customers" (README). **Enterprise price UNKNOWN** — requires sales contact,
site unreachable.

#### LOCK-IN / INTEGRATION

Data lands in Parquet on disk — genuinely portable. REST API, CLI, GUI and Python
objects. Low lock-in. The risk is not the licence, it is the bus factor.

---

### EBU LIST / pi-list (EBU, GPL-3.0)

#### STRENGTHS

The only open-source pcap-based ST 2110 compliance, timing and TTML analyser.
For a small team that cannot afford a hardware analyser it was the only option.

#### WEAKNESSES — the project is formally retired

**FACT, verbatim from the README (read 2026-08-29):**

> "This project is no longer actively maintained. While the code remains
> available for reference and use, please be aware of the following: **Ageing
> Codebase** … **Potential Security Risks**: Due to the lack of ongoing updates,
> security vulnerabilities could exist or arise over time. **Use at Your Own
> Risk**: We recommend reviewing the code and dependencies carefully before using
> it in production environments."

Its closed-issue history is dominated by getting it to run at all — #1 "Cannot
run (failed to build)" (2018), #7 and #10 Docker trouble (2018), #47 "Unable to
run Docker Desktop" (2021), #103 upgrading the Docker image (2021), #113 login
and registration not working as expected (2021) — plus the one operational
limit that matters: **#84 "Couldn't upload large sized captures"** (2020-06-17).
2110 captures are large by nature.

**Consequence for the segment:** open-source ST 2110 stream validation is now
unmaintained. That leaves a gap, and it means anything in this space must not
depend on pi-list.

---

### Bitfocus Companion and the small-crew NMOS surface

#### STRENGTHS

The signal here is the important part: **NMOS has reached small-crew tooling.**
Bitfocus published an in-house TypeScript IS-04 library, `bitfocus/nmos`
("NMOS + TypeScript"), last updated **2026-05-08**, generating Zod validation
schemas from the official JSON schemas. That is a company whose users are
one-operator shows deciding NMOS is worth typing properly.

#### WEAKNESSES / MISSING FEATURES

**FACT, from the `bitfocus/nmos` README:** "This module currently only support
GET requests for IS-04."

So Companion's own NMOS library is **read-only, IS-04 only**. No IS-05, no
connection management, no PATCH. Small crews can *see* the NMOS registry; they
cannot *route* through it with this library. That is precisely the gap a planning
tool could fill, and precisely the boundary to check before assuming NMOS
patching is a solved problem at the small end.

The `companion-module-nevion-videoipath` repo has **zero issues**, which is not
evidence of quality — it is a low-traffic module.

---

### The visualisation plugin layer (netbox-topology-views, netbox-floorplan-plugin)

Grouped, because their shared weakness is the point.

#### STRENGTHS

`netbox-topology-views` (1.1k stars) draws topology maps from NetBox cables,
filterable by name/site/tag/role, exportable to XML for draw.io and to PNG.
`netbox-floorplan-plugin` (124 stars, now under `netbox-community`) draws racks
and unracked devices on a floorplan with labels, areas, walls, colours, keyboard
controls, click-through to the device, and SVG export.

Between them they cover the **#5 and #6 most-requested features from the 2022
survey** — which is the tell: the two most-wanted drawing features live outside
the core product.

#### WEAKNESSES — the plugin layer trails the core release train

*(FACT, verified against both repos, 2026-08-29; `recurring`)*

- `netbox-topology-views` README states compatibility "from 3.5.0 through
  **4.5.X**", with a **matching plugin version required for each NetBox
  release**.
- Its latest release is **v4.5.1**, and the last commit on its default branch
  (`develop`) is **2026-03-29**.
- NetBox core meanwhile shipped **v4.6.9 on 2026-08-25** and has **v4.7.0-beta2**
  in test.

So the most popular NetBox visualisation plugin is roughly **two minor versions
and five months behind core**. Concretely: upgrade NetBox and you may lose your
topology view until the plugin catches up. And v4.7 tightens the screw further —
its notes deprecate `NestedGroupModel`, upgrade django-tables2 to v3.0 (renaming
the `querystring` tag and removing `RelatedLinkColumn`), and sanitise the request
object in custom link templates. Every one of those is a plugin-breaking change.

Long-open plugin issues also show thin maintenance capacity:
`netbox-topology-views` #33 "Virtual Chassis device/interfaces are not grouped"
(**2020-06-18**), #122 "Combine redundant connections" (2022-06-13), #196
"Topology not saved when using Nginx" (2022-12-07, `status: accepted`), #405
"Display Critical Cable Path for Logical Connection" (2023-10-13), #575 "Fails to
work with `LOGIN_REQUIRED=False`" (2024-10-05).

`netbox-floorplan-plugin` carries a modelling prerequisite worth noting: it
requires racks to have **defined types with width and height dimensions** before
it will place them.

---

## Cross-product patterns

These repeat across multiple independent vendors and are the most valuable
findings in this dossier.

### 1. Type vocabularies are hardcoded, so the data model cannot describe your industry
**Frequency: `widespread`.** Evidence in NetBox (`InterfaceTypeChoices` and
`PortTypeChoices` as Python enums; SDI types requested and pushed to a plugin in
#14597; three separate interface-type requests declined in 2024 alone) and in
Nautobot (#838, the **most-upvoted open issue**, open five years, asking to
replace the enums with database models so users can "add new hardware … without
needing to wait for a new release"). NetBox #21663 names the workaround people
actually use: forking, or maintaining patches.

**Why it matters here:** SDI, MADI, AES3, genlock, XLR, Fischer, Lemo, SMPTE
hybrid fibre and BNC-by-bitrate are simply not expressible. In the community
device-type for a flagship broadcast switcher, 88 connectors collapse to `bnc`
and 4 to `other`.

### 2. Racks are full-width only — and this has been refused, repeatedly
**Frequency: `widespread`.** Six declines in NetBox between 2022 and 2025;
still-open top-reacted request in Nautobot since 2023. The documented workaround
is to invent parent devices you do not have. AV and broadcast racks are full of
half-, third- and quarter-width gear, so this is not a corner case for our users
— it is the default case.

### 3. Discovery is only as good as each vendor's SNMP/LLDP/CDP implementation
**Frequency: `widespread`.** Every discovery product's tracker is dominated by
per-vendor breakage: Netdisco's most common label is literally `Vendor Support`
(Dell LLDP, Meraki, TP-Link, Netgear, Brocade, UniFi); LibreNMS has two LLDP
topology bugs inside three weeks (TP-Link hardcoded port naming, links not
updated on rename) plus Huawei, Cisco and Nokia discovery defects; Nautobot's
onboarding app fails distinctly on Arista, Cisco IOS, Cisco XR, Junos and HP
Comware; NetBox's Orb agent fails `discover_modules` on IOS and IOS-XE and
mis-parses FortiOS 7.4.12.

**Inference:** any product that promises "we will discover your network and draw
it" inherits an unbounded per-vendor maintenance burden. A planning tool that
treats discovery as *optional enrichment of a human-authored plan* — rather than
as the source of the plan — dodges the entire category.

### 4. Reconciling discovered state into a source of truth produces duplicates
**Frequency: `recurring`, and fresh (all evidence from July–August 2026).**
Diode duplicates chassis on stack re-ingest (#561), duplicates virtual chassis on
name-only refs (#555), ingests duplicate logs (#562); Orb creates prefixes twice
(#512) and silently fails to update discovered IPs (#559); LibreNMS creates
duplicate BGP peers with NULL VRF (#20097). Diode #561 escalates all the way to
"requires manual NetBox database cleanup".

The unsolved sub-problem in every case is **identity**: deciding whether the
thing you just discovered is the thing you already have.

### 5. "Desired state" versus "operational state" is an unresolved schism — inside a single vendor
**Frequency: `widespread`, and documented by the vendor itself.**

NetBox's own `docs/introduction.md` states, under Design Philosophy: NetBox
"intends to represent the *desired* state of a network versus its *operational*
state. As such, **automated import of live network state is strongly
discouraged**. All data created in NetBox should first be vetted by a human."

NetBox Labs simultaneously ships NetBox Discovery — an agent whose entire job is
automated import of live network state — and licenses its reconciler under a
bespoke non-OSI licence. The change-set/branch model is the attempted
reconciliation of these two positions, and the August 2026 issue crop shows the
seam.

**This is directly usable.** A production planner *is* desired state: the rig
you intend to build. The interesting product is neither pure desired state nor
pure discovery, but the **diff** — and per the landscape pass, nobody in this
segment ships planned-vs-live diffing.

### 6. Cable-path tracing is the fragile core everywhere, and it is synchronous
**Frequency: `recurring`, vendor-acknowledged.** Six NetBox cable-path defects in
five months of 2026, including one that "silently aborts". The lead maintainer's
own issue (#22596) says tracing runs in-request and makes "saves slow and bulk
cable imports painful" in patch-panel farms and long trunk chains. Cable profiles
only arrived in v4.5, so two tracing behaviours now coexist.

**Inference:** graph traversal over cable segments is genuinely hard, and any
tool that does it well — incrementally, with clear failure reporting rather than
silent aborts — has a defensible advantage.

### 7. Visualisation is always a bolt-on, and the bolt-on lags
**Frequency: `recurring`.** Topology diagrams (#5) and floor-plan diagrams (#6)
were among the most-requested features in NetBox's 2022 survey and are still
plugins in 2026. The main plugin is pinned per NetBox minor version and currently
sits ~2 minor versions behind core. NetBox core has never accepted a topology
view; the search for topology/diagram issues in core returns nothing.

### 8. Signal direction and signal format are absent from every IT-derived model
**Frequency: `widespread` by construction (INFERENCE from data models, not from
complaints).** NetBox ports have a connector *shape*, no direction and no
carried-format. LibreNMS and Netdisco model Ethernet adjacency. NMOS models
senders and receivers — it *does* have direction — but no physical layer. So
"this is a 12G output that must reach a 12G input over ≤ 80 m of coax" is not
expressible anywhere in the segment. Nobody complains about this in these
trackers because nobody expects it there; the complaint surfaces instead as
"please add SDI types" and gets labelled `plugin candidate`.

### 9. mDNS/DNS-SD discovery fails exactly when a live show fails
**Frequency: `recurring`.** `nmos-cpp` #273: link drops for 30 s, comes back,
node never reappears — open four years, no maintainer reply. Plus registry
advertisement errors when a domain is set (#435), no unicast DNS-SD in the
registry (#362), restart port-binding races (#348), and repeated Avahi/Debian
mDNS breakage. netaudio hits the same class of problem on the Dante side
(zeroconf socket errors, "lots of drops connection trouble").

**Inference:** a tool whose model survives the network going away — because the
plan is a file, not a query — is materially more useful in a truck than one that
re-derives everything from discovery.

### 10. Specification ambiguity means "standards-compliant" does not mean "interoperable"
**Frequency: `recurring`, authoritative.** IS-05 #163, raised by the reference
implementation's own maintainer, lists four behaviours the spec leaves open — and
has been open since April 2023. IS-04 has seven open issues covering PTP/media
interface selection, registry failover priority, mixed 2022-6/2110 inputs and
`ts-refclk` forms. Meanwhile the certification harness has open defects dating to
2019.

### 11. Everything is a server; nothing is a laptop
**Frequency: `widespread` (INFERENCE from deployment requirements, consistent
across products).** NetBox and Nautobot need PostgreSQL (15+ from v4.7) plus
Redis plus a WSGI stack; SuzieQ needs a poller plus a Parquet store; Netdisco and
LibreNMS need SNMP reach to managed switches; nmos-cpp is a registry daemon;
pi-list is a Docker compose stack that struggles with large captures. NMOS
acknowledges "small ad-hoc installations" and offers peer-to-peer mode, then every
implementation is a server anyway.

There is no offline-first, single-file, one-laptop tool anywhere in this segment.
That is the shape of the gap.

### 12. Broadcast control APIs are gated behind a paid licence
**Frequency: `recurring`.** Dante's Managed API needs DDM ≥ 1.5 or a Cloud Beta
account. VideoIPath's API needs server 2023.4.2+/2023 LTS and a UI user account,
with prices behind sales contact. In both cases the open-source community
response was to write a wrapper: SWR's AGPL Python package for VideoIPath, and
netaudio's reverse-engineered mDNS client for Dante, the latter self-described as
"not ready for anything other than a test environment".

### 13. The upgrade treadmill breaks the ecosystem around the core
**Frequency: `recurring`.** NetBox v4.7.0-beta1 removes the `housekeeping`
command, the `querystring` template tag, legacy Sentry config, several
compatibility shims, `DeviceWithConfigContextSerializer`, character-based REST
filter lookups, and webhook `request_id`/`username`; deprecates
`NestedGroupModel`; and upgrades django-tables2 to v3.0. Plugins pinned per minor
version already trail. `netbox-docker` reports media files vanishing across an
upgrade (#1357).

---

## Direct quotes-of-substance

All paraphrased or quoted from pages I opened on 2026-08-29. No quote here is
reconstructed from memory.

1. **NetBox's own design philosophy, verbatim** — "NetBox intends to represent
   the *desired* state of a network versus its *operational* state. As such,
   automated import of live network state is strongly discouraged. All data
   created in NetBox should first be vetted by a human to ensure its integrity."
   Also verbatim, on scope: "When given a choice between a relatively simple 80%
   solution and a much more complex complete solution, the former will typically
   be favored." And the "What NetBox Is Not" list explicitly includes **facilities
   management**.
   <https://raw.githubusercontent.com/netbox-community/netbox/master/docs/introduction.md>

2. **The lead maintainer on cable-path performance** — in dense topologies
   ("patch-panel farms, high-fan-out cassettes, long trunk chains") a single cable
   edit forces many paths to be recomputed inside the request, "making saves slow
   and bulk cable imports painful". Opened by `jeremystretch`, 2026-07-02, still
   backlog. <https://github.com/netbox-community/netbox/issues/22596>

3. **A Blackmagic Videohub owner meets the model boundary** — requesting 3G/6G/12G/24G
   SDI interface types in BNC and SFP variants because they were documenting a 2U
   Videohub with **82 BNC connectors** and had to file hundreds of SDI connections
   under "Other". Labelled `plugin candidate`. 2023-12-24.
   <https://github.com/netbox-community/netbox/issues/14597>

4. **The rack-width workaround, named by the requester** — asking for fractional
   `rack_width` (1/4, 1/3, 1/2, full) on device types, because administrators
   currently have to create **unnecessary "parent" devices** to put multiple
   narrow units in one RU. Closed as **not planned**, 2024-07-30.
   <https://github.com/netbox-community/netbox/issues/17021>

5. **Nautobot's most-upvoted open issue, in one sentence** — the goal is achieved
   when users can "add new hardware to Nautobot without needing to wait for a new
   release". Opened 2021-08-20, still open.
   <https://github.com/nautobot/nautobot/issues/838>

6. **Forking as the status quo** — a request to make cable profiles parametric so
   that "making profiles parametric lets operators model their actual plant
   without forking NetBox or maintaining patches". Notes 26 hardcoded profile
   classes requiring edits in three files, and a 1,024-position ceiling against
   real cables exceeding 6,900 fibres. 2026-03-12, under review.
   <https://github.com/netbox-community/netbox/issues/21663>

7. **The NMOS live-failure mode** — unplug the network for more than 30 seconds
   and reconnect, and the node can no longer be discovered by an NMOS explorer or
   by `avahi-browse`, although mDNSResponder's own `dns-sd` tool recovers.
   Opened 2022-09-01; **no maintainer response in four years.**
   <https://github.com/sony/nmos-cpp/issues/273>

8. **The reference implementer on spec ambiguity** — `garethsb`, relaying a
   question from AMWA Slack, lists four things IS-05 does not settle: what may be
   validated at `/staged` versus at activation; what a device should do with
   `master_enable=true` while all `rtp_enabled=false`; how `staged`/`active`
   should be populated for activations made outside IS-05; and which addresses
   belong in `transport_params` for an unconfigured or 2022-7-capable-but-disabled
   sender. Opened 2023-04-06, still open.
   <https://github.com/AMWA-TV/is-05/issues/163>

9. **The source of truth cannot fill in its own cables** — a feature request
   noting that the Orb agent populates devices and interfaces but "cannot
   correlate neighbor information to build physical cabling topology
   automatically", and proposing CDP/LLDP-derived cable creation with a dry-run
   mode and a rule to create a cable only when "both endpoints can be identified
   uniquely". 2026-08-27, open.
   <https://github.com/netboxlabs/orb-agent/issues/558>

10. **Reconciliation failure, in full** — re-ingesting a Cisco stack recreates
    every member after the first as a duplicate; the retries time out
    `/diode/bulk-plan-apply` and cause NetBox to "slow significantly"; duplicates
    predating the v2.1.0 upgrade produce permanent unique-constraint errors
    requiring **manual NetBox database cleanup**. 2026-07-16.
    <https://github.com/netboxlabs/diode/issues/561>

11. **Dante's API is licence-gated, verbatim** — "This module requires access to
    the Dante Managed API, which is currently available through a Dante Cloud
    Beta account or Dante Domain Manager (from version 1.5 onwards)."
    <https://github.com/bitfocus/companion-module-audinate-dante-ddm/blob/master/companion/HELP.md>

12. **Open Dante tooling disclaims production use** — netaudio's README describes
    the project as "early" and "not ready for anything other than a test
    environment", warning it "could make the devices behave unexpectedly".
    <https://github.com/chris-ritsen/network-audio-controller>

13. **Open ST 2110 analysis is retired, verbatim** — "This project is no longer
    actively maintained… **Potential Security Risks**: Due to the lack of ongoing
    updates, security vulnerabilities could exist or arise over time. **Use at Your
    Own Risk**." <https://github.com/ebu/pi-list>

14. **A broadcaster's own disclaimer about the orchestrator's API** — SWR's
    VideoIPath package is "still under development and currently in the beta
    phase. Features and interfaces may change", requires VideoIPath Server
    2023.4.2 or higher, and states it "is not a product or service offered by
    Nevion, and Nevion is not responsible for its functionality", adding that
    "special care is advised concerning the use of external tools such as this".
    <https://raw.githubusercontent.com/SWR-MoIP/VideoIPath-Automation-Tool/main/README.md>

15. **Companion's NMOS library is read-only, verbatim** — "This module currently
    only support GET requests for IS-04." <https://github.com/bitfocus/nmos>

16. **What NetBox users actually asked for, from the vendor's own survey** — of
    270 open-ended responses in 2022, cable modelling/tracing improvements ranked
    **second** (15 mentions), topology diagram generation **fifth** (9) and
    datacenter floor plan diagrams **sixth** (7); 487 respondents from 58
    countries, **Germany second at 18%** and **60% of respondents in Europe**.
    <https://github.com/netbox-community/netbox/discussions/9026>

17. **Small-shop LLDP discovery, unanswered** — a Netdisco user in "a small
    environment" reports Dell EMC switches not establishing topology over LLDP,
    suspecting LLDP is missing from `SNMP::Info::Layer3::Dell`, and asks for
    guidance on making the change. Opened 2025-10-29; no maintainer reply.
    <https://github.com/netdisco/netdisco/issues/1436>

---

## What this means for AV Planner Suite (short, and clearly marked INFERENCE)

Not part of the brief's required structure, but the reason the dossier exists.

1. **The connector/signal vocabulary is the moat.** Nothing in this segment can
   express "12G-SDI out → 12G-SDI in over 80 m of Belden 1694A". NetBox declined
   it into plugin territory; Nautobot has been asked for five years. A tool that
   ships SDI/MADI/AES/genlock/fibre types with **direction** and **bitrate** as
   first-class attributes is not competing with NetBox — it is filling a hole
   NetBox has explicitly declined to fill.
2. **Half-width racks are a six-times-declined requirement.** Shipping
   fractional-width rack placement is cheap for us and structurally refused by
   both incumbents.
3. **Be the desired state, and diff against the live one.** NetBox's own docs
   discourage live import; NMOS IS-04/05 gives live state for free and read-only;
   nobody ships the diff. The existing Videohub label-diff in `cable-planner` is
   the same idea, one layer down.
4. **Do not build discovery as a dependency.** Pattern 3 is an unbounded
   per-vendor maintenance burden. Import from NetBox and read IS-04; do not
   promise to walk anyone's switches.
5. **Offline-first is genuinely differentiating here, not just a nice-to-have.**
   Every product in this segment needs a server, and NMOS discovery demonstrably
   does not survive a link flap. An Electron app whose model is a file is a
   different category of tool in a truck.
6. **Multicast pools and a per-link bandwidth budget are proven needs** — first
   class in VideoIPath, absent from NMOS (IS-06 deprecated) and from NetBox IPAM.
7. **Interop with NetBox should be import/export, not dependency.** Its REST API
   is excellent and its data is unlocked; but its type enum will never describe
   our domain, so a mapping layer (ours ↔ theirs, with `other` + a custom field
   for what theirs cannot hold) is the realistic integration.

---

## Confidence and gaps

| Claim class | Confidence | Why |
| --- | --- | --- |
| Data-model limits (SDI types, half-width, cable profiles, position ceilings) | **High** | Read directly from source on master, 2026-08-29, and corroborated by decline histories |
| Cable-path fragility and synchronous tracing | **High** | Six dated issues plus a vendor-opened performance issue |
| Discovery per-vendor fragility, reconciliation duplicates | **High** | Four independent products, dozens of dated issues |
| NMOS spec ambiguity and mDNS failure mode | **High** | Reference-implementation maintainers are the reporters |
| Plugin-lag / upgrade treadmill | **Medium-high** | Verified against both repos' commits and releases; extrapolating user impact is inference |
| VideoIPath and Dante product UX | **Low-medium** | Indirect only, via third-party clients; vendor sites unreachable |
| **Practitioner sentiment (Reddit, forums, review sites)** | **NONE** | All domains blocked; search budget exhausted |
| **German-language market signal** | **NONE** | film-tv-video.de, production-partner.de, Veranstaltungstechnik forums all blocked. Partial proxy: 18% of NetBox survey respondents were German, and SWR wrote the VideoIPath client |
| **Prices of any kind** | **NONE VERIFIED** | Every pricing page blocked. Do not put a figure from this dossier in a comparison |

**To close the gaps, re-run with search access and fetch:** r/networking and
r/VIDEOENGINEERING threads on NetBox and NMOS; G2/Capterra/TrustRadius 1–3 star
reviews for NetBox Cloud, LibreNMS and Auvik; `netboxlabs.com/pricing` (NetBox
Cloud/Enterprise tiers, advertised vs sales-contact); `audinate.com` for DDM
licence pricing; `nevion.com` for VideoIPath; the AMWA and JT-NM Tested pages;
and German trade coverage of 2110 rollouts on film-tv-video.de.

---

## Sources

Every URL below was opened during this pass on 2026-08-29 unless a different
date is stated. Pages that returned no usable content are marked.

**NetBox — issues, discussions, releases**
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+topology
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+is%3Aopen+performance
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+BNC
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+broadcast+SDI+video
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+half-width+OR+half+width+rack
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+is%3Aopen+rack+elevation
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+plugin+upgrade+broken
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+cable+label+print
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+is%3Aopen+bulk+import+CSV
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+offline+airgap (no results)
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+is%3Aopen+floorplan (no results)
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+topology+diagram+visualiz (no results)
- https://github.com/netbox-community/netbox/issues?q=is%3Aissue+is%3Aopen+label%3A%22topic%3A+performance%22 (no results)
- https://github.com/netbox-community/netbox/issues/2865
- https://github.com/netbox-community/netbox/issues/8323
- https://github.com/netbox-community/netbox/issues/14205
- https://github.com/netbox-community/netbox/issues/14597
- https://github.com/netbox-community/netbox/issues/15940
- https://github.com/netbox-community/netbox/issues/16392
- https://github.com/netbox-community/netbox/issues/17021
- https://github.com/netbox-community/netbox/issues/17208
- https://github.com/netbox-community/netbox/issues/19003
- https://github.com/netbox-community/netbox/issues/20946
- https://github.com/netbox-community/netbox/issues/21663
- https://github.com/netbox-community/netbox/issues/22092
- https://github.com/netbox-community/netbox/issues/22596
- https://github.com/netbox-community/netbox/discussions?discussions_q=is%3Aopen+sort%3Atop
- https://github.com/netbox-community/netbox/discussions?discussions_q=survey+results
- https://github.com/netbox-community/netbox/discussions/9026 (2022 Community Survey Results)
- https://github.com/netbox-community/netbox/discussions/12876 (2023 Community Survey Results)
- https://github.com/netbox-community/netbox/releases
- https://github.com/netbox-community/netbox/releases/tag/v4.7.0-beta1

**NetBox — source code and documentation read directly**
- https://raw.githubusercontent.com/netbox-community/netbox/master/netbox/dcim/choices.py
- https://raw.githubusercontent.com/netbox-community/netbox/master/netbox/dcim/constants.py
- https://raw.githubusercontent.com/netbox-community/netbox/master/docs/introduction.md
- https://raw.githubusercontent.com/netbox-community/netbox/master/docs/models/dcim/cable.md

**NetBox ecosystem — clients, containers, plugins, device library**
- https://github.com/netbox-community/pynetbox/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/netbox-community/netbox-docker/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/netbox-community/netbox-topology-views
- https://github.com/netbox-community/netbox-topology-views/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/netbox-community/netbox-topology-views/releases
- https://github.com/netbox-community/netbox-topology-views/releases/latest
- https://github.com/netbox-community/netbox-topology-views/commits/
- https://github.com/netbox-community/netbox-floorplan-plugin
- https://github.com/netbox-community/devicetype-library/tree/master/device-types
- https://github.com/netbox-community/devicetype-library/tree/master/device-types/Blackmagicdesign
- https://raw.githubusercontent.com/netbox-community/devicetype-library/master/device-types/Blackmagicdesign/atem-constellation-8k.yaml

**NetBox Discovery (Orb + Diode)**
- https://github.com/netboxlabs/diode
- https://github.com/netboxlabs/diode/issues?q=is%3Aissue+sort%3Acreated-desc
- https://github.com/netboxlabs/diode/issues/561
- https://github.com/netboxlabs/orb-agent/issues?q=is%3Aissue
- https://github.com/netboxlabs/orb-agent/issues/558

**Nautobot**
- https://github.com/nautobot/nautobot/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/nautobot/nautobot/issues/838
- https://github.com/nautobot/nautobot/issues/4584
- https://github.com/nautobot/nautobot-app-device-onboarding/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc

**NMOS — specifications, reference implementations, test suite**
- https://github.com/AMWA-TV/is-04/issues?q=is%3Aissue+is%3Aopen
- https://github.com/AMWA-TV/is-05/issues?q=is%3Aissue+is%3Aopen
- https://github.com/AMWA-TV/is-05/issues/163
- https://github.com/AMWA-TV/nmos-testing/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/sony/nmos-cpp/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/sony/nmos-cpp/issues?q=is%3Aissue+mdns
- https://github.com/sony/nmos-cpp/issues/273
- https://github.com/sony/nmos-js/issues?q=is%3Aissue+sort%3Acomments-desc
- https://github.com/sony/nmos-js/issues/96
- https://github.com/sony/nmos-js/commits/master

**Broadcast IP orchestration and audio networking (indirect evidence)**
- https://github.com/SWR-MoIP/VideoIPath-Automation-Tool/issues?q=is%3Aissue
- https://raw.githubusercontent.com/SWR-MoIP/VideoIPath-Automation-Tool/main/README.md
- https://github.com/bitfocus/companion-module-nevion-videoipath/issues?q=is%3Aissue (zero issues)
- https://github.com/orgs/bitfocus/repositories?q=dante&type=all
- https://github.com/orgs/bitfocus/repositories?q=nmos&type=all
- https://github.com/bitfocus/nmos
- https://github.com/bitfocus/companion-module-audinate-dante-ddm
- https://github.com/bitfocus/companion-module-audinate-dante-ddm/issues?q=is%3Aissue
- https://github.com/bitfocus/companion-module-audinate-dante-ddm/issues/17
- https://raw.githubusercontent.com/bitfocus/companion-module-audinate-dante-ddm/master/README.md
- https://raw.githubusercontent.com/bitfocus/companion-module-audinate-dante-ddm/master/companion/HELP.md
- https://github.com/chris-ritsen/network-audio-controller
- https://github.com/chris-ritsen/network-audio-controller/issues

**Discovery / NMS / observability**
- https://github.com/netdisco/netdisco/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/netdisco/netdisco/issues/1436
- https://github.com/librenms/librenms/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/librenms/librenms/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-desc
- https://github.com/netenglabs/suzieq/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/netenglabs/suzieq/commits/master
- https://raw.githubusercontent.com/netenglabs/suzieq/master/README.md

**Stream analysis**
- https://github.com/ebu/pi-list
- https://github.com/ebu/pi-list/issues?q=is%3Aissue+sort%3Acomments-desc

**Reachability probe (2026-08-29)** — the following were attempted and are
**blocked at the egress proxy**, and therefore contributed nothing:
reddit.com, old.reddit.com, g2.com, capterra.com, trustradius.com,
stackoverflow.com, serverfault.com, networkengineering.stackexchange.com,
news.ycombinator.com, lobste.rs, netboxlabs.com, docs.netbox.dev, specs.amwa.tv,
amwa.tv, librenms.org, netdisco.org, suzieq.readthedocs.io, nevion.com,
audinate.com, film-tv-video.de, production-partner.de, blue-room.org.uk,
community.librenms.org.
