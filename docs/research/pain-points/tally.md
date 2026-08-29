# Pain points: Tally Systems

Research date: 2026-08-29 (brief dated 2026-08-28).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Language of corpus: English (repo docs mix DE/EN; research corpus stays EN).

---

## Method

### Read this first — the method was severely constrained

This pass ran under two hard limits that shaped what could be evidenced. Stating
them plainly, because they determine how much weight each section can carry.

1. **The session's web-search budget was already exhausted** before this pass
   started (200 of 200 `WebSearch` calls consumed by earlier segment passes in
   the same session). **Zero search queries completed in this pass.** The brief
   asked for 8–15 distinct searches; that instruction is **unexecuted as
   written**. It was partially compensated by using GitHub's own issue-search
   endpoint over `WebFetch` (23 distinct GitHub issue-search queries, listed in
   Sources), which is a real search surface but only over GitHub.

2. **Network egress policy blocked every non-GitHub source that was tried.**
   Confirmed blocked at the proxy during this pass (`EGRESS_BLOCKED`, or an
   explicit fetch refusal):
   `old.reddit.com` (fetch refused), `forum.blackmagicdesign.com`,
   `forums.vmix.com`, `obsproject.com`, `www.controlbooth.com`,
   `www.tallyarbiter.com` (the product's own documentation site),
   `tallyhubpro.github.io` (Tally Hub's documentation site),
   `wifi-tally.github.io` (vTally's documentation site),
   `www.tslproducts.com`, `tally-ma.com`.
   The GitHub REST API via `curl` was also refused (session is scoped to eight
   `larszu/*` repositories only). **Reachable and used: `github.com` HTML pages
   — repository landing pages, READMEs, issue lists, individual issues,
   discussions, commit lists, release pages, and `github.com/search`.**

**Consequence, stated plainly: this dossier is strong on open-source hub
software, firmware, protocol/integration and maintenance pain, and near-silent
on commercial hardware sentiment, RF/radio behaviour, purchasing and pricing.**
Do not read the absence of complaints about, say, Cerevo FlexTally radio range
as evidence that none exist — it is evidence that I could not reach the places
where such complaints are written. Every commercial product below is marked
accordingly.

The German-language angle (film-tv-video.de, production-partner.de,
Veranstaltungstechnik forums) is **entirely unexecuted** — those domains are
outside the reachable set and no search tool was available to surface them.

### What was actually read

**77 URLs opened**, of which roughly 65 returned usable content. All first-hand
(pages opened and read), no search-engine snippets — because no search engine
was available.

- **Product issue trackers read directly** (9 repositories):
  `josephdadams/TallyArbiter` (17 individual issues plus 8 filtered list views,
  the discussions board, the releases index and the v3.3.0 release notes),
  `wifi-tally/wifi-tally` (issue list, 3 individual issues, commit history,
  repo landing page), `AronHetLam/ATEM_tally_light_with_ESP8266` (open list,
  closed list sorted by discussion, issue #119, README),
  `Xylopyrographer/STAC` (issue list, README),
  `tallyhubpro/Tallyhub` (org page, README, issue list, commit history,
  releases), `guido-visser/vMix-M5Stick-Tally-Light` (issue list, issue #37),
  `aaronpk/atem-tally-controller` (issue list), `deckerego/tally_pi` (issue
  list), `larszu/tally-pi` (the user's own in-progress project, read to ground
  the "angle" column).
- **Integration-side trackers** (these are where commercial products leak their
  API weaknesses): `bitfocus/companion` (tally issue filter + issue #4376),
  `bitfocus/companion-module-requests` (tally filter + issues #419, #2092),
  `bitfocus/companion-module-ptzoptics-visca` #77,
  `bitfocus/companion-module-tslproducts-umd` (attempted; GitHub returned an
  error state and no issues rendered), `DistroAV/DistroAV` (tally filter +
  issues #687, #1086).
- **Standards-side trackers**: `AMWA-TV/is-07`, `AMWA-TV/nmos-testing` #235,
  `sony/nmos-cpp` #72.
- **Third-party comparison**: `thejoeejoee/co-ansible` #14, an independent
  TallyHub-vs-TallyArbiter evaluation written by someone choosing between them.
- **23 GitHub issue-search queries** across all of GitHub (see Sources). About
  half were high-yield; the rest returned keyword noise and are marked as such.

### Evidence grading used below

- **FACT** — read on a page I opened; URL cited.
- **INFERENCE** — my reasoning from those facts, labelled as such.
- **UNKNOWN / unverified** — I could not check it; I say what would need checking.
- Frequency: **isolated** (one report), **recurring** (several independent
  reports or repositories), **widespread** (a structural theme visible across
  many products at once).

---

## Per-product findings

### Tally Arbiter 3.3.0 (Joseph Adams / techministry) — MIT

By a distance the best-evidenced product in this segment: 353 stars, 125 forks,
2,245 commits, 27 open issues at time of reading
([repo landing page](https://github.com/josephdadams/TallyArbiter)).

**STRENGTHS (what even critics concede)**

- FACT: An independent evaluator comparing it against Tally Hub credits it with
  "unlimited sources and devices" many-to-many arbitration, a rich outbound
  integration ecosystem (MQTT, webhooks, OSC, Bitfocus Companion), cloud relay
  for remote/isolated productions, and vMix server emulation so native vMix
  tally clients can point at it
  ([co-ansible#14](https://github.com/thejoeejoee/co-ansible/issues/14), opened
  ~2026-08-24). The same evaluator concludes that for broadcast infrastructure
  automation "Tally Arbiter's MQTT/webhook/Companion hooks integrate more
  easily".
- FACT: v3.3.0 release notes show genuine engineering discipline on the boring
  things — partial TCP messages now buffered rather than silently dropped,
  receive buffers bounded, log-file growth bounded, socket cleanup, multi-bus
  arbitration by priority, unlinked buses corrected to OR logic
  ([v3.3.0](https://github.com/josephdadams/TallyArbiter/releases/tag/v3.3.0),
  2026-07-28).
- FACT: MIT licensed, runs as desktop app (macOS/Windows/Linux), npm CLI, or
  Docker.

**WEAKNESSES**

- FACT: **Arbitration logic — the product's entire reason to exist — is where
  the bugs concentrate.** Four independent reports of tally being applied to the
  wrong device or the wrong bus:
  - `#794` (2025-03-21): three cameras on one OBS source with Ember+ device
    actions — "As soon as I have cam 1 tally red, both cameras have tally red",
    and the log shows cam 1 and cam 2 going PGM on/off simultaneously. All
    configured device actions appear to fire when any single device's tally
    changes.
    ([#794](https://github.com/josephdadams/TallyArbiter/issues/794))
  - `#970` (2026-04-24, open): two cameras bound to different OBS scenes —
    "Only 1 device will react on the scene change and show tally information."
    ([#970](https://github.com/josephdadams/TallyArbiter/issues/970))
  - `#990` (closed 2026-06-19): on an ATEM 4 M/E, "when I select source number
    1, it always attaches to the Aux (so it is constantly blue)", with the user
    confirming no Aux output on the ATEM is set to Source 1 — a first-index
    mapping bug.
    ([#990](https://github.com/josephdadams/TallyArbiter/issues/990))
  - `#1121` (closed 2026-07-29): in `NewtekTricaster.ts` a nested loop applies
    bus state to `sourceArray[i]` where `i` indexes a *different* array; when
    `i >= sourceArray.length` — described in the issue as the common case — bus
    state accumulates against the literal phantom address `"undefined"`, and
    tally is routed to the wrong inputs whenever the two indices diverge. Four
    call sites affected.
    ([#1121](https://github.com/josephdadams/TallyArbiter/issues/1121))
- FACT: `#1123` (closed 2026-07-29) — `TallyInput.renameAddress()` updates the
  address registry but never re-keys `tallyData`, so "an OBS scene or input
  rename … drops that address's tally state until the next change on it", and
  for change-only sources "that gap can last indefinitely".
  ([#1123](https://github.com/josephdadams/TallyArbiter/issues/1123))
- FACT: `#620` (2024-01-08, **still open at time of reading, ~2.6 years**) —
  Ross Carbonite Black Solo stopped working after the 3.0.6 update with
  `Cannot read properties of undefined (reading 'find')` in `RossCarbonite.js`,
  and the log repeating `Source: Carbonite Address: c67cbcbe No busses`. No
  maintainer comment, no assignee, no linked PR.
  ([#620](https://github.com/josephdadams/TallyArbiter/issues/620))
- FACT: `#78` (2021-04-15, **open ~5.4 years**) — with an ATEM and a Videohub
  linked, "TA seems to stop listening to the videohub's input selection, and
  just listens to the atem program, so the device linking stop working
  properly." Labelled `ATEM, bug, keep`. Nobody assigned.
  ([#78](https://github.com/josephdadams/TallyArbiter/issues/78))
- FACT: `#475` (2022-07-27, open) — a Windows PC with 4 extra NICs and static
  IPs cannot connect to the ATEM from TallyArbiter, while ATEM Software Control
  and Companion connect fine from the same machine. No comments, no fix.
  ([#475](https://github.com/josephdadams/TallyArbiter/issues/475))
- FACT: Release cadence has a **2 year 5 month hole**: v3.1.1 on 2023-09-13,
  then nothing until v3.2.0 on 2026-02-03, then v3.3.0 on 2026-07-28. And
  v3.2.0 itself was partly broken — the v3.3.0 notes record "Docker builds
  restored (v3.2.0 never published)".
  ([releases](https://github.com/josephdadams/TallyArbiter/releases),
  [v3.3.0](https://github.com/josephdadams/TallyArbiter/releases/tag/v3.3.0))
- INFERENCE: single-maintainer bus factor. The README credits one author; the
  oldest open issues carry `help wanted` and `keep` labels, i.e. acknowledged
  but parked pending an outside contributor.

**MISSING FEATURES (what users request)**

- FACT, longest-standing, all still open with `feature, help wanted, keep`:
  Barco Event Master support (`#29`, 2020-12-18); Blackmagic camera tally via
  the BMD 3G-SDI Arduino Shield (`#233`, 2021-10-17); RGBlink mini / LivePro L1
  (`#274`, 2021-11-12).
  ([oldest open issues](https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc))
- FACT: Sony and Grass Valley — `#533` (2023-01-07) asks specifically for
  **parallel (contact-closure) tally in, converted to TSL-UMD out**, so Sony
  switchers can act as a tally source. No maintainer answer visible.
  ([#533](https://github.com/josephdadams/TallyArbiter/issues/533))
  Related: `#973` "GV Karrera (K-Frame) not connecting", `#967` "Sony visca
  tally", both closed 2026.
- FACT: Hollyland wireless tally integration requested twice by the same user —
  `#754` (2024-10-24) "i purchased the new Hollyland Wireless Tally System and
  would really love to use it with tallyArbiter", then `#801` (2025-04-04)
  where he tries to *contribute* the support himself and asks for compile help.
  A discussion thread "Send Tally to Hollyland Wireless Tally System?" has 16
  replies. Hollyland compatibility finally lands in v3.3.0 (2026-07-28) — an
  ~21-month lag from first request.
  ([search](https://github.com/search?q=tally+hollyland&type=issues),
  [discussions](https://github.com/josephdadams/TallyArbiter/discussions))
- FACT: `#1124` (2026-07-28, open) — "expose full current tally state from
  TallyInput", i.e. developers want a way to read the whole state rather than
  only subscribe to deltas.
- FACT: Discussions show unanswered requests for Ross Carbonite/Ultrix/EVS,
  Wirecast, and an Ethernet-based (non-WiFi) listener client.
  ([discussions](https://github.com/josephdadams/TallyArbiter/discussions))

**UX PROBLEMS**

- FACT, and it is a good one: `#1199` (2026-08-16, open) — the app shows a
  warning banner telling you to change the shipped default password and points
  at Settings > Users, **which has no password field**. "Add User offers a
  password field and Edit User does not." A working `ChangePasswordComponent`
  exists and is routed, but "there is no menu entry, button, or link anywhere in
  the UI" — it is reachable only by typing
  `http://<server>:4455/#/change-password` by hand.
  ([#1199](https://github.com/josephdadams/TallyArbiter/issues/1199))
- FACT: `#941` (closed 2026-03-28) — edits made in the raw config editor
  (device IDs, TSL addresses, manually added devices) do not appear on the
  Sources & Devices page: "it's as if it's not repolling the config after any
  updates". The reporter needs stable hardcoded device IDs because his ESP32
  listeners embed them.
  ([#941](https://github.com/josephdadams/TallyArbiter/issues/941))
- FACT: `#1177` (2026-08-01, open) — "ReadME for the M5 Atom Matrix setup is out
  dated", alongside three separate M5 Atom Matrix behavioural bugs filed the
  same day (`#1175`, `#1178`, `#1179`, `#1180`) — new listener hardware ships
  faster than its documentation.
- FACT (historic, weak evidence now): `#147` "Desktop documentation window -
  can't navigate home again", `#181` "auto updater for Mac OS not working",
  `#149` "Connected Listeners Do Not Appear in UI" — all closed, but they show
  the shape of the UI complaints.

**PERFORMANCE PROBLEMS**

- FACT: `#1205` (2026-08-20, open, v3.3.0, Docker on Linux, Chrome) — the
  producer web page "appear freeze, don't update with the change on mixer
  video"; refreshing sometimes yields "No devices are available for tally
  monitoring at this time"; the operator must refresh by hand to see current
  state. **This is the single worst possible failure mode for a tally product:
  a UI that looks alive and is stale.**
  ([#1205](https://github.com/josephdadams/TallyArbiter/issues/1205))
- FACT: `#354` (2022-01-19, v3.0.1) — "TSL3.1 Takes a Ton of Time to Process
  Data": tally data "get[s] backed up", the system pauses, then dumps "all the
  tally data within a second". Labelled in progress; the thread shows no
  resolution comments.
  ([#354](https://github.com/josephdadams/TallyArbiter/issues/354))
- FACT: a cluster of crash/leak reports — `#504` "Memory over flow when add Atem
  source", `#478` "TA 3.0.4 crashes with ATEM Extreme Iso", `#546` "3.0.4
  constantly crashing", `#745` "3.1.1 Crashes on Startup - Mac OS Sequoia 15.0",
  `#662` "Generic UDP action causing crash", `#953` "TypeError: Cannot read
  properties of undefined". All now closed, but they span three years.
  ([crash filter](https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+crash+OR+memory+OR+freeze))
- FACT: v3.3.0 explicitly fixes "crashes from unguarded `bus_options` lookups"
  and "invalid/expired JWT handling prevents process crashes" — i.e. malformed
  input could kill the process until mid-2026.

**PRICING PROBLEMS**

- FACT: none. MIT, free, self-hosted. The cost is entirely operator time and
  listener hardware.
- INFERENCE: the pricing pain in this segment is displaced onto the *hardware*
  and onto the *labour* of running an unsupported hub yourself (see Cross-product
  patterns).

**LOCK-IN**

- FACT: low by design — MIT, config is a plain `config.json` the UI will even
  let you edit raw (`#941`), outputs to TSL/OSC/Ember+/MQTT/webhook.
- FACT, the real lock-in risk: **stable device IDs**. `#941`'s reporter hardcodes
  device IDs into ESP32 firmware and needs "configuration persistence across
  different TallyArbiter instances" — so the identity model, not the file
  format, is what binds you.
- FACT: the cloud relay feature is optional, not required (`#discussions`
  reference "Tally Light not shown in the cloud"). UNKNOWN: what the cloud relay
  costs or who operates it — the documentation site `tallyarbiter.com` was
  blocked; would need to check the "Cloud" page there.

**OFFLINE**

- FACT: fully offline-capable. Runs on a local box (desktop app, Pi, Docker),
  speaks to switchers on the production LAN.
- FACT: **the offline story has a real hole** — `#1188` (2026-08-05, open): the
  `bin/tallyarbiter` CLI entry point does `require = require('esm')(module)`,
  which throws `TypeError: Function.prototype.apply was called on undefined` on
  Node 18–24+. The workaround is to comment the line out. So the headless
  install path — the one you use on the Pi in the rack that has no display —
  is broken on every currently supported Node version.
  ([#1188](https://github.com/josephdadams/TallyArbiter/issues/1188))
- FACT: `#603` "Docker Image v3.0.4 does not start: Cannot find module bcrypt"
  and `#1016` "Docker Update?" (closed 2026-07-28) — the containerised offline
  path has repeatedly broken too.

**INTEGRATION PROBLEMS**

- FACT: **vendors move and TallyArbiter is left behind.** Three clean examples:
  - Roland V-80HD now requires HTTP auth on Smart Tally; TallyArbiter had no
    field to enter credentials, so it got a bare 401 — `#876` (2025-12-04). The
    reporter proved the credentials work in a browser on the same LAN. HTTP
    Basic auth for Roland Smart Tally sources only ships in v3.3.0 (2026-07-28).
    ([#876](https://github.com/josephdadams/TallyArbiter/issues/876))
  - TriCaster moved its tally API "from TCP on port 5951 to Websocket on port
    80" — raised as a discussion thread, not yet a release note I could see.
    ([discussions](https://github.com/josephdadams/TallyArbiter/discussions))
  - Roland V-60HD returning 404 — `#673` (2024-03-22).
- FACT: `#91` (2021) — leaving TallyArbiter running against an ATEM eventually
  left the ATEM unreachable from *both* ATEM Software Control and Companion,
  fixed only by rebooting the Pi running TallyArbiter. The reporter cites "the
  note on the TA site about the ATEM only allowing 5 connections" and asks
  whether TA opens several and whether the count is visible anywhere. **Neither
  question is answered in the thread.**
  ([#91](https://github.com/josephdadams/TallyArbiter/issues/91))
- FACT: v3.3.0 lists reconnect logic "repaired for OBS, DataVideoIP, and Roland
  Smart Tally" — three separate source types whose reconnect was broken
  simultaneously.

**Security posture (not a brief heading, but material for a LAN appliance)**

- FACT, from the v3.3.0 notes: before 3.3.0, editing a user's password stored it
  **in plaintext in `config.json`** (the notes tell existing users to rotate);
  several socket control-plane events had no authorisation check; role checks
  used substring rather than exact matching; source ownership was not verified
  before applying cloud tally data; the rate limiter keyed wrongly, defeating
  brute-force protection; auth errors leaked username existence. All fixed
  2026-07-28. Existing installs are *warned* but not forced to rotate.
  ([v3.3.0](https://github.com/josephdadams/TallyArbiter/releases/tag/v3.3.0))

---

### Tally Hub 1.2.0 (tallyhubpro) — MIT

**Calibration warning: the landscape pass positioned this as a peer of Tally
Arbiter. It is not, yet.** FACT: the repository has **3 stars, 1 fork, 135
commits, 0 open issues and 0 pull requests**
([org page](https://github.com/tallyhubpro),
[issues](https://github.com/tallyhubpro/Tallyhub/issues)).

**STRENGTHS**

- FACT: the independent evaluator in co-ansible#14 credits it with a "polished,
  self-contained appliance experience", broader out-of-box professional switcher
  coverage (Ross, Panasonic, FOR-A, Grass Valley via TSL UMD), a web-based ESP32
  firmware flasher with OTA, and Docker-first deployment suited to a Pi.
- FACT: README claims device auto-discovery via UDP broadcast plus mDNS, a
  browser tally at `/tally.html` needing no hardware, and support for ATEM Mini
  through Constellation 8K, TriCaster, vMix, OBS via obs-websocket, Roland
  V-60HD/XS-62S/VR-50HD-MKII, and TSL UMD for Panasonic/FOR-A/Ross/Grass Valley.
  ([README](https://github.com/tallyhubpro/Tallyhub))

**WEAKNESSES**

- FACT: **"Test suite forthcoming"** — `npm test` is a placeholder. The
  co-ansible evaluator flags this explicitly as a weakness.
  ([README](https://github.com/tallyhubpro/Tallyhub),
  [co-ansible#14](https://github.com/thejoeejoee/co-ansible/issues/14))
- FACT: zero issues and zero PRs. INFERENCE: this is not evidence of quality —
  with 3 stars there is essentially no user base to file them. There is no
  community to absorb the maintainer's absence.
- FACT: commit history is a burst — 18–23 January 2026 — then the most recent
  commit read was "chore(ci): trigger Docker publish (edge)" on 2026-01-23.
  Seven months of silence before this pass.
  ([commits](https://github.com/tallyhubpro/Tallyhub/commits/main))
- UNKNOWN / date conflict: the releases page renders v1.2.0 as **2025-01-19**
  while the commit history puts the v1.2.0 work at **2026-01-21**. One of the
  two readings is wrong; I could not resolve it because the documentation site
  was blocked. Would need `tallyhubpro.github.io` or the release API.

**MISSING FEATURES**

- FACT (from co-ansible#14): no cloud/remote capability, and "limited outbound
  integration options (primarily device-focused)" — i.e. it drives *its own*
  lamps well but does not fan out to MQTT/OSC/Ember+/webhooks the way
  TallyArbiter does. That makes it a closed appliance rather than a bus.

**UX PROBLEMS**

- FACT: the zero-config claim is conditional. The README concedes "manual hub IP
  configuration needed in filtered/enterprise networks" — which is precisely the
  network you find in a broadcast facility, where UDP broadcast to :7411 and
  mDNS are the first two things a managed switch drops.
- INFERENCE: the in-browser flasher requires WebSerial, so it works in
  Chrome/Edge and not Safari/Firefox. **Unverified** — I could not open the
  flasher page. Would need `/flash.html` from a running instance.

**PERFORMANCE PROBLEMS**

- FACT: vendor claim of "sub-100ms latency with enterprise-level reliability"
  (README and v1.2.0 release notes). **Unverified and untestable from here**;
  with a placeholder test suite there is no published measurement behind it.
- FACT: v1.2.0 exists specifically to "Fix M5 device connection" and "Fix
  missing dependencies" — device connection was broken in 1.1.
  ([releases](https://github.com/tallyhubpro/Tallyhub/releases))

**PRICING**

- FACT: MIT, free. The release notes make an explicit cost argument: "$15-30 per
  device" versus commercial systems at "$200-500+ per device". **This is a
  vendor marketing claim in the project's own release notes, not independently
  verified**, and no commercial product is named. Seen 2026-08-29.

**LOCK-IN**

- FACT: MIT; firmware flashable from built-in, GitHub, or custom `.bin`.
- FACT: optional `GITHUB_TOKEN` "recommended for firmware downloads (higher rate
  limits)" — so the flasher path depends on GitHub availability and rate limits.
  INFERENCE: on show day, behind a venue firewall, that is an internet
  dependency in a product otherwise sold as local.

**OFFLINE**

- FACT: runs locally on macOS/Windows/Pi/server; Docker-first.
- INFERENCE (from the `GITHUB_TOKEN` note above): firmware *flashing* and
  firmware *updates* are online operations. Tally *operation* is not. Flash
  before you travel.

**INTEGRATION PROBLEMS**

- No user-reported integration problems exist to cite, because no users have
  filed any. That is the honest finding.

---

### vTally / wifi-tally (czenker) — ESP8266 + Node hub

**This product is dead, and the evidence is unambiguous.**

**STRENGTHS**

- FACT: README pitch is genuinely good — "~€10 hardware costs" per light, USB
  power flexibility, a central hub, support for RGB/WS2812/NeoPixel, a
  browser-based tally alternative, open source and open hardware; tagged ATEM,
  OBS Studio, Roland, vMix. 97 stars, 32 forks, 351 commits.
  ([repo](https://github.com/wifi-tally/wifi-tally))
- FACT (from the landscape pass, and consistent with the issues): its
  connection-health model (CONNECTED/MISSING/DISCONNECTED) is a genuinely better
  idea than most competitors have.

**WEAKNESSES**

- FACT: **last commit 2022-01-21** ("Document the fixed log paths #93"). Nothing
  since — 4 years 7 months as of this pass.
  ([commits](https://github.com/wifi-tally/wifi-tally/commits/main))
- FACT: **45 open issues, 16 open pull requests**, and the tracker shows no
  maintainer replies on the threads I opened.
- FACT: `#131` (2023-06-05) — "stopped working with OBS 29 and above due to a
  new WebSocket version… Are you going to make the necessary changes to get
  everything working again?" **No maintainer response.** OBS moved to
  obs-websocket 5 and the product simply stopped supporting one of its four
  headline platforms.
  ([#131](https://github.com/wifi-tally/wifi-tally/issues/131))
- FACT: `#141` "Protocol.md is empty" — the protocol documentation file that
  would let someone else reimplement or fork it is a stub.
- FACT: `#130` "Reporting a vulnerability" — an open, unanswered security
  contact request on an abandoned network appliance.
  ([issues](https://github.com/wifi-tally/wifi-tally/issues))

**MISSING FEATURES / requests left unanswered**

- FACT, from the open list: ESP01 support (`#139`), Seeedstudio ESP32-C3
  (`#135`), Roland V-1HD (`#129`), Resolume Arena (`#142`), OBS WebSocket 5
  (`#131`).

**UX PROBLEMS**

- FACT: `#138` "Javascript error opening hub" — the hub UI fails to open, open
  and unanswered.
- FACT: `#132` "lua: my-app.lc: bad header in precompiled chunk" — the NodeMCU
  Lua firmware flash path breaks with a version-mismatch error that is opaque to
  a non-embedded user.

**PERFORMANCE / behavioural problems**

- FACT, and this is the most instructive one in the whole dossier: `#133`
  (2023-11-03) — the light goes dark after a period without updates. The
  reporter's scenario is exactly a real one: "when there is longer time that the
  tally do not get any information, it is 'off'" — a vMix operator who does not
  cut to camera 4 for twenty minutes finds camera 4's lamp has decided it is
  disconnected. He asks whether the timeout is necessary and requests a longer
  window. **No maintainer response.**
  ([#133](https://github.com/wifi-tally/wifi-tally/issues/133))
  INFERENCE: this is the direct cost of vTally's otherwise-admirable
  connection-health model — a liveness timeout tuned for link failure cannot
  distinguish "hub is dead" from "this camera is genuinely boring today" unless
  the hub sends periodic keepalives regardless of state.

**PRICING**

- FACT: free software; ~€10 per light in parts (README claim, undated).
- INFERENCE: the true cost of an abandoned free product is the migration you pay
  for when OBS bumps a protocol version.

**LOCK-IN**

- FACT: none contractually (open source), but the empty `Protocol.md` (`#141`)
  means the practical cost of forking or reimplementing the hub↔light protocol
  is "read the source". That is soft lock-in by under-documentation.

**OFFLINE**

- FACT: local hub, local lights, no cloud. Offline operation is the design.
- FACT: `#134` — connecting a Roland V-8HD to the hub over USB appears to take
  the MIDI/sysex interface exclusively, so other MIDI software cannot talk to
  the mixer at the same time. A local-only product that monopolises a local
  resource.
  ([#134](https://github.com/wifi-tally/wifi-tally/issues/134))

**INTEGRATION PROBLEMS**

- FACT: OBS 29+ broken (`#131`); Roland V-8HD exclusive USB claim (`#134`);
  Roland V-1HD unsupported (`#129`).

---

### ATEM tally light with ESP8266 (AronHetLam) — DIY firmware

**STRENGTHS**

- FACT: it solves the segment's hardest structural problem honestly. The README
  states ATEM switchers permit only **"5-8 simultaneous clients (dependent on
  the model)"**, and the v2.0 Tally Server mode means "the system only require
  one connection from the switcher, as the tally lights can retransmit data to
  other tallys".
  ([README](https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/blob/master/README.md))
- FACT: sane first-run UX — if unprogrammed or unable to join a known network,
  the device serves its config page over a softAP called "Tally light setup" at
  192.168.4.1.
- FACT: a lively 3D-printed-case ecosystem in the issue tracker (`#132`, `#138`,
  `#139`, `#160`) — users are building housings and contributing them back,
  which is a real signal of adoption.

**WEAKNESSES**

- FACT, from the README itself: the relay fix has its own ceiling — "The ESP8266
  isn't that powerful, and is limited to 5 clients each. (In some cases 5 might
  even be too many)." So a 16-camera show needs a *tree* of relays, hand-planned.
- FACT: "On Air" mode "needs a direct connection to switcher, not another tally
  unit" — so the relay topology and the feature set interact, and the relayed
  lamps silently lose a feature.

**PERFORMANCE PROBLEMS — the single best-evidenced failure in this dossier**

- FACT: `#119` (2024-03-14) — outdoors, three tally lights, busy WiFi, ATEM SDI
  Pro ISO. After 2–3 hours the tallies stopped, the **ATEM's own control panel
  went unresponsive** (though it kept switching), and recording stopped. Power
  cycling the ATEM fixed it; it recurred. The problem vanished when the tallies
  were disconnected. Six hours at home on a stable network: no problem. The
  reporter's diagnosis: *"If a connection drops and reconnects it will be
  'counted' as a new connection. This can result in exceeding the connection
  limit although the simultaneous connections are still lower than the limit."*
  ([#119](https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues/119))
- FACT, corroborating independently: a commenter on
  `aaronpk/atem-tally-controller#10` (2023-11-21) reports the same class of
  failure and attributes it to a Blackmagic forum explanation that it happens
  "when too many devices try to communicate with the ATEM over the network".
  ([atem-tally-controller issues](https://github.com/aaronpk/atem-tally-controller/issues))
- FACT, corroborating again: TallyArbiter `#91` — same symptom (ATEM unreachable
  by all clients until a reboot), different software.
- **This makes it a widespread, cross-vendor pattern, not one person's bad
  router.** See Cross-product patterns.
- FACT: WiFi instability is the dominant theme across the tracker — `#77` (WiFi
  signal problems, prompting a W5500 PoE module), `#53` "Which WiFi router?",
  `#45` "WI-fi connection", `#110` "Feature Request: WiFi Reset via a button"
  (i.e. the device gets stuck on stale credentials often enough that people want
  a physical panic button).

**MISSING FEATURES**

- FACT: `#159` Feelworld Livepro L1 support; `#161` M5StickC port; `#163`
  Neopixel LAST_LED not working; `#145` repurposing D4/D5/D6 as ground.
- FACT: `#77` — users are asking for **wired PoE** (M5Stack Core + W5500)
  because WiFi is the failure mode.

**UX PROBLEMS**

- FACT: getting the firmware onto the device is a recurring wall — `#157`
  "Error web installer", `#135` "No COM option under Port", `#133` "erro ao
  compilar", `#90` "Compling issue", `#147` "Unable to build test server", `#8`
  "No Initial Setup", `#6` (on the sibling project) "So many errors trying to
  get this to work".
  ([open](https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues),
  [closed](https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues?q=is%3Aissue+is%3Aclosed+sort%3Acomments-desc))

**PRICING / LOCK-IN / OFFLINE**

- FACT: free firmware, commodity ESP8266 hardware, entirely local, ATEM-only.
- INFERENCE: lock-in is to Blackmagic — this is an ATEM-protocol client and does
  not generalise.

---

### STAC (Xylopyrographer) — ESP32 firmware

**STRENGTHS**

- FACT: one binary covers Roland V-60HD / V-80HD / V-160HD **and** all ATEM
  models across inputs 1–40, which is unusually broad for DIY firmware.
- FACT: **it takes the operator/talent distinction seriously, which most
  products do not.** Camera Operator mode: RED = PGM, GREEN = PVW, PURPLE DOTTED
  = unselected. Talent mode: RED = PGM, GREEN = everything else — i.e. the
  presenter is never shown a preview state that would make them look at the
  wrong lens.
  ([README](https://github.com/Xylopyrographer/STAC/blob/main/README.md))
- FACT: "Peripheral Mode" lets one STAC feed another over a cable, so the second
  unit needs no WiFi setup at all.
- FACT: **one open issue in the entire tracker** (`#21`, 2021-04-10, "Add Ability
  to Set Ops Parameters During Web Config"). INFERENCE: either a small user base
  or a genuinely stable product; with STAC's tight scope, the latter is
  plausible.
  ([issues](https://github.com/Xylopyrographer/STAC/issues))

**WEAKNESSES / UX PROBLEMS**

- FACT: `#21`, still open after 5+ years — the web config portal handles WiFi
  and switcher details but **not** the operating parameters, so those still need
  another route.
- FACT: upgrading from v2.x "requires a complete firmware reflash — OTA update
  is not possible" and full reconfiguration. INFERENCE: for a facility with a
  dozen lamps that is a bench day, and it is exactly the moment where a lamp
  gets reflashed with the wrong camera number.
- FACT: `#4` (2021-04-05) asks for a configurable port number specifically so
  STAC can *emulate* a Roland Smart Tally device — a tell that people want to
  fake the protocol because the real endpoints are scarce.
  ([search](https://github.com/search?q=%22smart+tally%22+roland&type=issues))
- FACT: `#45` "Compiling errors" (2022-06-10) — same build-toolchain wall as
  every other firmware project here.

**MISSING FEATURES / PRICING / LOCK-IN / OFFLINE**

- FACT: README documents no brightness control, no connection-limit warnings.
  Brightness is not discussed at all — see the cross-product legibility pattern.
- FACT: free, local, no cloud. Lock-in is to the ESP32 hardware choice.

---

### vMix M5Stick Tally Light (guido-visser) — *not in the landscape pass, but it belongs there*

Discovered during this pass via a brightness search. It is the de-facto DIY
tally for vMix and its 15-issue open tracker is the richest single list of
*operator-facing* complaints I found anywhere.
([issues](https://github.com/guido-visser/vMix-M5Stick-Tally-Light/issues))

**WEAKNESSES / PERFORMANCE**

- FACT: `#37` (2024-09-07, open, no maintainer reply) reports three things at
  once: "this tally has a very large delay in crowded scenes"; "when I adjusted
  the brightness of the tally light to 100%, the actual brightness was still
  0%"; and "in some cases, the panel will be automatically reset".
  ([#37](https://github.com/guido-visser/vMix-M5Stick-Tally-Light/issues/37))
- FACT: `#30` (2021-10-10) "Varying amounts of delay between input changes and
  Arduino updates" — latency is not constant, which is worse than latency being
  high.
- FACT: `#42` (2025-12-23) "Reconnect to vMix" and `#33` (2022-08-22) "Reconnect
  interval not working" — reconnect broken across four years.

**UX PROBLEMS — the configuration-state cluster**

- FACT, four independent issues about settings that do not stick or cannot be
  cleared: `#28` "Stick holds old WiFi info despite upgrade"; `#29` "Reset
  existing wifi configuration"; `#31` "Wifi scanning, no list appearing after
  entering incorrect passphrase"; `#27` "MODE setting not honored".
- FACT: `#22` "Changing tally number or powering on doesn't update display" —
  **you renumber the lamp and the display keeps showing the old camera.** In a
  live environment that is a wrong-light incident waiting to happen.
- INFERENCE: this cluster, plus AronHetLam `#110` (WiFi reset button), plus
  TallyArbiter `#941` (config edits not reflected), is one pattern: **tally
  devices have no trustworthy way to show you what they currently believe they
  are.**

**MISSING FEATURES**

- FACT: `#18` "Support for more sources?" (2020-12-28, open six years).

---

### Cerevo FlexTally / FlexTally Pro — commercial

**Evidence is thin and I will not pad it. `cerevo.com` was unreachable.**

- FACT: the only community trace I could find anywhere on GitHub is
  `bitfocus/companion-module-requests#419` (2021-03-04), asking for a Companion
  module to drive FlexTally lamps green/red, noting the manufacturer supports
  "ethernet or gpio" and that FlexTally does **not** cover Barco S3 or Analog Way
  Pulse. **The issue is labelled "Missing documentation" and "Stale" and has
  gone nowhere in five and a half years.**
  ([#419](https://github.com/bitfocus/companion-module-requests/issues/419))
- INFERENCE (labelled as such): "Missing documentation" is Bitfocus's label for
  a request nobody can implement because no protocol spec is available. Five
  years of no module, against a Companion ecosystem that has modules for
  hundreds of obscure devices, is a meaningful signal about how open the
  FlexTally control surface is. **It is not proof that Cerevo refuses to
  document it** — the label was applied because the *requester* supplied no
  spec. To settle this you would need to open cerevo.com's FlexTally developer
  or support pages.
- FACT (from the landscape pass, restated, not re-verified here): speaks
  ATEM/vMix/TriCaster/Wirecast but not Ross or TSL. Combined with the Barco/AW
  gap in `#419`, the picture is a consumer/prosumer switcher list.
- PRICING: **UNKNOWN.** A commenter on TallyArbiter `#213` (2021-09-09)
  complains "The price. It is $600 for the base station and 4 lamps" about a
  commercial wireless tally kit, but **the thread as I read it does not name the
  vendor**, so I will not attribute that figure to Cerevo. Would need
  cerevo.com or a dealer listing to price it.
- LOCK-IN: INFERENCE, high — proprietary radio, proprietary station, no
  third-party module after five years.
- OFFLINE: UNKNOWN. INFERENCE: a Station + lamps on a private radio should be
  fully offline, but the configuration tool's requirements are unverified.

### Tally-MA (tally-ma.com) — commercial

- **`tally-ma.com` was blocked. I found no GitHub traces at all.**
- FACT (landscape pass, not re-verified): separate operator-LED / talent-LED
  control plus an operator "call" feature; HTTP GET + UDP :21324.
- INFERENCE: UDP :21324 is the WLED realtime (DRGB/WARLS) port. If that is
  accurate, Tally-MA lamps are addressable by anything that can speak WLED
  realtime, which would make it unusually *open* for a commercial product.
  **Unverified — this needs the tally-ma.com protocol page to confirm.**
- PRICING, LOCK-IN, OFFLINE, UX, PERFORMANCE: **all UNKNOWN.** No reachable
  source. Do not let the landscape pass's positive framing of the operator/talent
  split imply that its reliability or pricing has been checked. It has not.

### Blackmagic GPI and Tally Interface — commercial 8-GPI box

**STRENGTHS**

- FACT: it exists, it is cheap by broadcast standards, and it is the standard
  way to get ATEM tally into contact closures for legacy CCUs and lamps.
  (Landscape pass; not re-verified — the Blackmagic forum and site were blocked.)

**WEAKNESSES / INTEGRATION PROBLEMS**

- FACT: `bitfocus/companion-module-bmd-gpi-and-tally-interface#1` (2021-05-26) —
  "Support for Blackmagic GPI and Tally Interface **Standalone**", i.e. users
  want it to work **without an ATEM switcher in the picture**. Five years open.
  ([search](https://github.com/search?q=%22GPI+and+Tally+Interface%22+OR+%22blackmagic+gpi%22+tally&type=issues))
- FACT: `#3` (2025-03-31) "Support for GPI companion" — a user struggling to get
  GPI status to drive AUX output control.
- INFERENCE: the box is an ATEM accessory, not a general GPI bridge. If your
  plant has a Ross or GV switcher, this device does not help you, and the
  five-year-old standalone request says the community noticed.

**PRICING / LOCK-IN / OFFLINE**

- PRICING: **UNKNOWN** — blackmagicdesign.com was not reachable this pass; the
  landscape pass did not carry a figure I can re-verify. Would need the BMD
  store page.
- LOCK-IN: FACT-adjacent — 8 GPIs is a hard ceiling; a 12-camera show needs two
  boxes. Protocol is a documented TCP text protocol on :9991 (landscape pass),
  which is the one genuinely open thing about it.
- OFFLINE: fully local by construction.

### TSL Products UMD ecosystem — commercial, and the segment's lingua franca

**STRENGTHS**

- FACT: it is what everybody else implements. Tally Hub lists TSL UMD as its
  route to Panasonic, FOR-A, Ross and Grass Valley; TallyArbiter implements
  TSL 3.1 and TSL 5; TallyArbiter `#533` asks for parallel tally to be
  *converted into* TSL-UMD, i.e. TSL is treated as the neutral interchange.

**WEAKNESSES**

- FACT: `bitfocus/companion-module-tslproducts-umd` — I opened its issue tracker
  and GitHub rendered an error state with no issues shown; the nav read "Issues
  0". So there is no community complaint corpus to mine. **UNKNOWN whether that
  means "solid" or "unused".**
- FACT: implementing TSL is not free. `Bilbycast/bilbycast-edge#108`
  (~2026-08-11) is a team discovering their own multiviewer stack has "no
  concept of tally or UMD… no TSL protocol code, no tally state", and stating
  flatly that "a monitoring wall without labels is unusable".
  ([search](https://github.com/search?q=%22tally%22+%22TSL+5.0%22+OR+%22TSL5%22+protocol&type=issues))
- FACT: TallyArbiter's TSL 3.1 *ingest* backed up under load (`#354`), and its
  v3.3.0 notes record that "all TSL5 fields now considered" — i.e. a partial TSL5
  implementation shipped for years. INFERENCE: the protocol's breadth (3.1 vs
  4.0 vs 5.0, display fields, tally bits, screen indices) means partial
  implementations are the norm and interop is empirically hit-and-miss.

**PRICING / LOCK-IN**

- PRICING: **UNKNOWN — `tslproducts.com` was blocked.** The landscape pass
  describes TallyMan as commercial. INFERENCE from category norms: requires
  sales contact. **Would need to check tslproducts.com/product/tallyman for
  whether any price is published.**
- LOCK-IN: FACT — the *protocol* is broadly implemented, which is the opposite of
  lock-in. The *TallyMan router/processor product* is where the commercial lock
  would sit, and I have no evidence about it.

### NDI tally (NDI SDK, `NDIlib_tally_t` / `recv_set_tally()`)

**STRENGTHS**

- FACT: zero address mapping — tally rides back up the video connection, so
  there is no camera-number-to-tally-address spreadsheet to get wrong. This is
  genuinely the best idea in the segment and every complaint below is a
  *implementation* complaint, not an architecture complaint.

**WEAKNESSES — and they are real**

- FACT: `DistroAV#1086` (2024-09-01, open) — OBS's NDI implementation sets
  **both flags at once**: the log line quoted in the issue is
  `tally changed; Sending tally on_preview=1, on_program=1` for a source that
  should be program-only. The requester's step 1 is simply "fix the logic so
  tally reflects only one state at a time".
  ([#1086](https://github.com/DistroAV/DistroAV/issues/1086))
- FACT: `DistroAV#687` (2021-09-27, open ~5 years) — a BirdDog PF120's tally
  light "rapidly blinks between red and green" when live in OBS. Preview
  (solid green) works; program does not. Studio Mode shows the same. **No
  workaround given in the thread.**
  ([#687](https://github.com/DistroAV/DistroAV/issues/687))
  INFERENCE: `#687` is very plausibly the visible symptom of `#1086`'s
  both-flags bug — the camera alternates because it is being told both things.
  The two issues sat open, unconnected, for three years.
- FACT: `DistroAV#1301` (2025-06-17, open) "Implement more NDI Metadata" and
  `#725` "Dedicated NDI tally" (closed 2024-12-01) — the tally surface is
  thinner than users want.

**MISSING FEATURES**

- FACT: **per-source tally policy** is the top request. `#1086` step 2 asks for
  per-source options — follow default / disabled / preview-only / program-only /
  full — because "an OBS recorder … should only report program status, not
  preview". Today all sources inherit one global setting.
- FACT: PTZ cameras want a *tally on/off* control at all —
  `companion-module-ptzoptics-visca#77` (2025-08-30): a PTZOptics Move 4K 20x
  owner asking for tally enable/disable, having failed with custom VISCA
  commands.
  ([#77](https://github.com/bitfocus/companion-module-ptzoptics-visca/issues/77))

**LOCK-IN / OFFLINE**

- INFERENCE: NDI tally only exists where the whole path is NDI. The moment one
  camera is SDI, you need a parallel tally system for that camera — and now you
  are running two tally systems with two mental models. This is the practical
  cost of NDI's "zero mapping" advantage and it is not discussed in any issue I
  found; flagging it as inference.
- FACT: NDI is a LAN protocol; offline operation is fine.

### AMWA IS-07 (NMOS Event & Tally) — free specification

**STRENGTHS**

- FACT: the reliability semantics are the best-specified in the segment on
  paper — timestamps, retained state, Last Will for dead emitters.

**WEAKNESSES — the spec is ahead of its implementations, and by years**

- FACT: `sony/nmos-cpp#72` — "IS-07: Add MQTT sender and receiver", opened
  **2019-05-15, still open, no assignee, no linked PR**. In the reference C++
  NMOS implementation, **the MQTT transport is not implemented**; only WebSocket
  is. Seven years and three months open as of this pass.
  ([#72](https://github.com/sony/nmos-cpp/issues/72))
  **This directly undercuts the landscape pass's framing of IS-07 as "MQTT
  retained state, retained Last Will, QoS 2".** That is what the *spec* offers;
  it is not what the leading open implementation ships.
- FACT: `AMWA-TV/nmos-testing#235` — the IS-07 test suite "is just a
  placeholder", auto-generated from the Events API RAML. The issue enumerates
  what is missing: JSON-schema validation, `/state` vs `/type` consistency,
  IS-04 alignment, IS-05 connection behaviour, WebSocket 12-second command
  timeout, heartbeat health, subscription behaviour, malformed-message
  rejection. It also notes MQTT testing "would require mock broker
  infrastructure" — i.e. the untested transport is also the unimplemented one.
  ([#235](https://github.com/AMWA-TV/nmos-testing/issues/235))
- FACT: `AMWA-TV/is-07#53` — "Associating Events/Tallys to Audio/Video Senders
  and Receivers", opened **2019-05-24**, the **only open issue in the
  specification repository**, and still unresolved. The unanswered question is
  the most basic one an integrator has: *how do I say that this tally belongs to
  that camera?*
  ([is-07 issues](https://github.com/AMWA-TV/is-07/issues))

**INTEGRATION / adoption**

- INFERENCE: a spec whose central association question has been open for seven
  years, whose reference implementation lacks a headline transport, and whose
  conformance suite is a placeholder, is not something a rental house or an OB
  truck can specify into a job today. It is a 2030 answer to a 2026 problem.

### tally_pi (deckerego) — Pi Zero W + Blinkt!/NeoPixel

- FACT: 47 stars, 4 forks. **The issue tracker is empty and "Issue creation is
  restricted in this repository"** — so there is no community feedback channel
  at all and no way for a user to report a bug.
  ([issues](https://github.com/deckerego/tally_pi/issues))
- FACT (landscape pass): the idea — a lamp as an HTTP resource at
  `:7413/set?color=&brightness=` — is the simplest correct design in the
  segment. INFERENCE: it also means anything on the LAN can set any lamp to any
  colour with a `curl`, which is a feature at rehearsal and a hazard on a shared
  venue network.
- UX / PERFORMANCE / PRICING / OFFLINE: **UNKNOWN.** No user reports exist to
  read. Free, local, Pi-based.

### AVMATRIX TS3019 — commercial USB tally, *not in the landscape pass*

Surfaced via the Companion request tracker and worth recording because it is a
clean example of the commercial-integration pattern.

- FACT: `companion-module-requests#2092` (2026-06-23, open) — a working beta
  Companion module exists, tested on a Raspberry Pi. Wants up to **12 tally
  lamps**, per-lamp Off/Preview/Program states, exclusive tally (one red, one
  green) and additive tally for fades.
- FACT: **"No Ethernet API exists."** The device is USB-C only, appears as
  `/dev/ttyUSB0`, and is driven by "Firmata-style digital pin commands" over USB
  serial.
  ([#2092](https://github.com/bitfocus/companion-module-requests/issues/2092))
- INFERENCE: a USB-only control surface means the tally controller must be
  physically at the box. You cannot put the hub in the rack room and the lamps
  at the stage without running USB or adding a Pi as a serial-to-network shim —
  which is exactly what the requester did.

### Hollyland wireless tally — demand signal only

- FACT: two TallyArbiter issues (`#754` 2024-10-24, `#801` 2025-04-04) and a
  16-reply discussion thread from users who **bought the hardware first and then
  discovered they could not integrate it**. Support landed in TallyArbiter
  v3.3.0 (2026-07-28), roughly 21 months after the first request.
- INFERENCE: this is the commonest purchasing failure in the segment — buy the
  lamps, then find out what they will and will not talk to.

---

## Cross-product patterns

These repeat across multiple independent vendors and are the most valuable
findings in this dossier.

### 1. The switcher's client-connection budget is the real system ceiling, and nothing in this segment models it

- FACT: ATEM permits **5–8 simultaneous clients depending on model**
  (AronHetLam README). Every tally hub, every Companion instance, every ATEM
  Software Control window and every DIY lamp that connects directly spends one.
- FACT: exceeding it does not fail gracefully — it takes the **switcher's own
  control surface** down. AronHetLam `#119`: the ATEM panel went unresponsive and
  recording stopped. TallyArbiter `#91`: neither ATEM Software Control nor
  Companion could connect until the tally host was rebooted.
- FACT: it is worse than a static budget, because **reconnections accumulate**.
  AronHetLam `#119`'s reporter: a dropped-and-reconnected client "will be
  'counted' as a new connection… this can result in exceeding the connection
  limit although the simultaneous connections are still lower than the limit".
  So a flaky WiFi network doesn't just make lamps flicker — it slowly poisons
  the switcher over 2–3 hours.
- FACT: the workarounds have their own ceilings. AronHetLam's Tally Server relay
  reduces it to one switcher connection but each ESP8266 relays to at most 5
  clients ("in some cases 5 might even be too many"), and relayed units lose On
  Air mode.
- FACT: TallyArbiter `#91`'s two questions — does TA open multiple connections,
  and can I see the count anywhere — **were never answered**.
- Frequency: **widespread** (3 independent repositories, 2 different codebases,
  plus a Blackmagic-forum attribution).

### 2. WiFi is the failure mode, and users are asking to leave it

- FACT: it dominates every firmware tracker. AronHetLam `#77` (signal problems →
  W5500 PoE), `#53` ("Which WiFi router?"), `#45`, `#110` (physical WiFi-reset
  button), `#119` (busy outdoor WiFi → 3-hour failure). vMix-M5Stick `#28`,
  `#29`, `#31`, `#33`, `#42`. wifi-tally `#133` (liveness timeout).
- FACT: the requests are explicitly for **wired**: PoE modules (AronHetLam `#77`),
  "Ethernet based Listener client" (TallyArbiter discussions), Blackmagic 3G-SDI
  Arduino Shield tally (TallyArbiter `#233`, open five years), the tally-pi
  design of GPIO lamps on physical cable.
- INFERENCE: consumer WiFi in a full venue is the wrong transport for a
  safety-adjacent signal, the community knows it, and no open-source product in
  this segment ships a wired listener as a first-class option.
- Frequency: **widespread**.

### 3. Address mapping is fragile, invisible, and the failure is silent

The most dangerous class of bug here is not "the light is off". It is "the
**wrong** light is on", and it recurs in five distinct forms:

- FACT: **rename breaks state** — TallyArbiter `#1123`: renaming an OBS scene
  drops that address's tally until the next change, potentially "indefinitely".
- FACT: **off-by-one / wrong-array indexing** — TallyArbiter `#1121`: TriCaster
  bus state accumulating against a phantom `"undefined"` address at four call
  sites, tally routed to the wrong inputs.
- FACT: **first-index mapping** — TallyArbiter `#990`: ATEM Source 1 always
  attaching to Aux.
- FACT: **config edits not reflected** — TallyArbiter `#941`: device-ID and
  TSL-address changes made in the raw editor never reach the UI.
- FACT: **the lamp shows the old identity** — vMix-M5Stick `#22`: changing the
  tally number doesn't update the display.
- FACT: the standards body has the same problem at spec level — AMWA `is-07#53`,
  "Associating Events/Tallys to Audio/Video Senders and Receivers", open since
  2019.
- INFERENCE: every one of these is an *authoring and verification* problem
  wearing a runtime-bug costume. Nobody in this segment has a
  camera↔input↔address↔lamp map that is written down once, validated, and
  exported to all the consumers.
- Frequency: **widespread**.

### 4. Arbitration across multiple sources and buses is where hubs actually break

- FACT: TallyArbiter, the product whose entire premise is arbitration, has four
  independent wrong-device reports (`#794`, `#970`, `#990`, `#1121`) and a
  v3.3.0 release that had to fix "unlinked buses corrected to use OR logic" and
  "multi-bus arbitration by priority" — meaning the core semantics were wrong
  until 2026-07.
- FACT: `#78` (open 5.4 years) is precisely the two-device case: ATEM + Videohub
  linked, and TA quietly stops honouring the Videohub and just follows the ATEM.
  It **silently degrades to a plausible-looking wrong answer**.
- Frequency: **recurring**, concentrated in the one product that attempts it —
  which is itself the finding: nobody else even tries, so nobody else has these
  bugs, they have the missing feature instead.

### 5. Reconnect and liveness are permanently unfinished

- FACT: TallyArbiter v3.3.0 repairs reconnect for **three** source types at once
  (OBS, DataVideoIP, Roland Smart Tally); adds partial-TCP buffering; bounds
  receive buffers.
- FACT: vMix-M5Stick has reconnect issues open across four years (`#33` 2022,
  `#42` 2025).
- FACT: TallyArbiter `#89` "Resend Tally Data on Listener Device
  Connection/Reconnection" is a closed request that had to be *asked for* — a
  reconnecting lamp did not get told the current state.
- FACT: wifi-tally `#133` shows the opposite failure: a lamp that decides it is
  disconnected because nothing has happened to it for a while.
- INFERENCE: the correct model — periodic full-state keepalive plus
  state-on-connect, so a lamp can always distinguish "I am current" from "I have
  lost contact" — is stated clearly by nobody and implemented consistently by
  nobody. vTally's CONNECTED/MISSING/DISCONNECTED model is the closest, and
  `#133` shows it mistunes.
- Frequency: **widespread**.

### 6. Vendor protocol churn silently decommissions your tally system

- FACT: OBS moved to obs-websocket 5 at OBS 29; wifi-tally broke and never
  recovered (`#131`, no maintainer reply).
- FACT: Roland added auth to Smart Tally on the V-80HD; TallyArbiter had no
  credential field and returned a bare 401 (`#876`), fixed ~19 months later.
- FACT: TriCaster moved tally from TCP :5951 to WebSocket on :80 (TallyArbiter
  discussions).
- FACT: TallyArbiter `#620` — a Ross Carbonite that "no longer works after
  update", open 2.6 years.
- INFERENCE: a tally system's supported-device list has a shelf life measured in
  switcher firmware releases, and **nothing warns you that the pairing you
  specified last year no longer works**.
- Frequency: **widespread**.

### 7. The lamp cannot tell you what it believes, and you cannot tell if it is charged

- FACT: TallyArbiter `#213` (2021-09-09), a user enumerating why he wants to
  build his own hardware: "No battery loading indicator. You don't have a way of
  knowing whether the Tally Lights are charged or not." Also: configuration by
  "tiny DIP switches at the bottom" that are "difficult to set" and need the
  manual every time; base-station config software "only available for Windows",
  a problem when he works from different locations; and existing M5/TTGO
  listeners are "all a little small to see from a distance".
  ([#213](https://github.com/josephdadams/TallyArbiter/issues/213))
- FACT: brightness control is not merely absent but *broken* where it exists —
  vMix-M5Stick `#37`: "when I adjusted the brightness of the tally light to
  100%, the actual brightness was still 0%".
- FACT: STAC's and AronHetLam's READMEs document no brightness control at all.
- Frequency: **recurring**, and unusually consistent in wording.

### 8. Talent and camera operator need different lights, and most products conflate them

- FACT: only **STAC** (Camera Operator vs Talent modes) and **Tally-MA**
  (separate operator-LED / talent-LED, landscape pass) treat this as first-class.
  vTally separates operator vs stage light (landscape pass).
- FACT: NDI's `DistroAV#1086` is the same need in a different vocabulary — "an
  OBS recorder … should only report program status, not preview" — a request for
  **per-consumer tally policy**.
- INFERENCE: this is one requirement (who is allowed to see preview?) appearing
  in four products under four names, with no shared model.
- Frequency: **recurring**.

### 9. Single-maintainer risk is the segment's defining commercial fact

- FACT: wifi-tally — last commit 2022-01-21, 45 open issues, 16 open PRs,
  breaking OBS incompatibility unanswered since 2023, an unanswered "Reporting a
  vulnerability" issue, and an empty `Protocol.md`.
- FACT: TallyArbiter — a 2 year 5 month release gap (2023-09 → 2026-02), a
  release (v3.2.0) that "never published" to Docker, oldest open feature requests
  from 2020 labelled `help wanted`.
- FACT: Tally Hub — 3 stars, placeholder test suite, seven months quiet.
- FACT: tally_pi — issue creation restricted; no feedback channel exists.
- FACT: STAC — one open issue, five years old.
- INFERENCE: a production house choosing open-source tally is choosing a
  dependency whose maintenance is one person's spare time, and the failure is not
  gradual — it is "OBS updated and my tally stopped".
- Frequency: **widespread**.

### 10. These boxes sit on the production LAN with weak security defaults

- FACT: TallyArbiter before v3.3.0 (2026-07-28) stored edited user passwords
  **in plaintext in `config.json`**; several socket control-plane events had no
  authorisation check; role checks used substring matching; source ownership was
  unverified before applying cloud tally data; the rate limiter keyed wrongly,
  defeating brute-force protection; auth errors leaked username existence.
  Existing installs are warned, not forced, to rotate.
- FACT: the remediation is itself broken — `#1199`: the warning tells you to
  change the password in a screen that has no password field, and the working
  change-password page has no link anywhere in the UI.
- FACT: wifi-tally has an unanswered vulnerability-reporting issue (`#130`) on
  an abandoned codebase.
- INFERENCE: tally hubs are trusted, unattended, always-on network appliances
  that nobody patches, on the same VLAN as the switcher.
- Frequency: **recurring** (two products; but severity is high).

### 11. Everything wants Ross and Grass Valley; almost nothing has them

- FACT: TallyArbiter `#533` (Sony/GV parallel tally → TSL-UMD, 2023, no
  maintainer reply), `#620` (Ross Carbonite broken 2.6 years), `#821` (Ross
  Carbonite Plus won't connect, 2025), `#973` (GV Karrera K-Frame not
  connecting), `companion-module-requests#1918` (GVG CCS-ONE integration, 2025),
  `#893` (Grass Valley Switcher Control, 2022).
- FACT: Cerevo FlexTally explicitly does not speak Ross or TSL (landscape pass);
  `#419` adds Barco S3 and Analog Way Pulse to its gaps.
- FACT: Tally Hub claims Ross/GV *only via TSL UMD* — i.e. via the switcher's
  UMD output, not native control.
- INFERENCE: the tier boundary in this segment is sharp. Below it: ATEM, vMix,
  OBS, Roland, TriCaster, well served by hobbyist software. Above it: Ross, GV,
  Sony, Barco, served by TSL and by nothing else.
- Frequency: **widespread**.

---

## Direct quotes-of-substance

All paraphrased or short-quoted from pages I opened. Dates are as displayed on
the page on 2026-08-29.

1. **On the connection-limit trap (the best single insight found):** a user
   running three tally lights outdoors on busy WiFi reports that after 2–3 hours
   the tallies died, the ATEM's own panel went unresponsive though it kept
   switching, and recording stopped; the same rig ran six hours faultlessly at
   home on a stable network. His diagnosis, quoted: "If a connection drops and
   reconnects it will be 'counted' as a new connection. This can result in
   exceeding the connection limit although the simultaneous connections are
   still lower than the limit."
   — AronHetLam/ATEM_tally_light_with_ESP8266 #119, 2024-03-14.
   https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues/119

2. **On the same failure from the other side of the fence:** a TallyArbiter user
   left it running against an ATEM and eventually neither ATEM Software Control
   nor Companion could connect, though the switcher was still discoverable;
   rebooting the Pi running TallyArbiter fixed it instantly. He cites "the note
   on the TA site about the ATEM only allowing 5 connections" and asks whether
   TA opens several and whether the count can be seen anywhere. Neither question
   is answered in the thread.
   — josephdadams/TallyArbiter #91.
   https://github.com/josephdadams/TallyArbiter/issues/91

3. **On the ceiling of the standard workaround:** the project's own README, on
   Tally Server relay mode — "the system only require one connection from the
   switcher, as the tally lights can retransmit data to other tallys", followed
   immediately by "The ESP8266 isn't that powerful, and is limited to 5 clients
   each. (In some cases 5 might even be too many)."
   — AronHetLam README.
   https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/blob/master/README.md

4. **On silent wrong-device tally:** with three cameras on one OBS source and
   Ember+ actions per camera, "As soon as I have cam 1 tally red, both cameras
   have tally red. Also the logfile shows cam 1 and cam 2 always PGM on and off
   at the same time."
   — TallyArbiter #794, 2025-03-21.
   https://github.com/josephdadams/TallyArbiter/issues/794

5. **On the same class of bug at code level:** in `NewtekTricaster.ts` a nested
   loop applies bus state to `sourceArray[i]` where `i` indexes a different
   array; "when `i >= sourceArray.length` — the common case — `sourceArray[i]`
   evaluates to `undefined`", so bus state is recorded against a phantom address
   literally named `"undefined"`. Four call sites.
   — TallyArbiter #1121, closed 2026-07-29.
   https://github.com/josephdadams/TallyArbiter/issues/1121

6. **On renames destroying state:** `renameAddress()` updates the address
   registry but never re-keys `tallyData`, so "an OBS scene or input rename (or
   any other source type that renames addresses) drops that address's tally
   state until the next change on it" — and for change-only sources "that gap
   can last indefinitely".
   — TallyArbiter #1123, closed 2026-07-29.
   https://github.com/josephdadams/TallyArbiter/issues/1123

7. **On a UI that looks alive and is stale — the worst tally failure mode:** on
   v3.3.0 in Docker, the producer page "appear freeze, don't update with the
   change on mixer video"; refreshing sometimes returns "No devices are
   available for tally monitoring at this time"; the operator must refresh
   manually to see current status.
   — TallyArbiter #1205, 2026-08-20, open.
   https://github.com/josephdadams/TallyArbiter/issues/1205

8. **On security remediation that cannot be performed:** the app warns you to
   change the shipped default password and points at Settings > Users. "Add User
   offers a password field and Edit User does not." A working change-password
   page exists and is routed, but "there is no menu entry, button, or link
   anywhere in the UI" — the only route is typing
   `http://<server>:4455/#/change-password` by hand.
   — TallyArbiter #1199, 2026-08-16, open.
   https://github.com/josephdadams/TallyArbiter/issues/1199

9. **On abandonment, in the user's own words:** "stopped working with OBS 29 and
   above due to a new WebSocket version… Are you going to make the necessary
   changes to get everything working again?" No maintainer response. The
   repository's last commit is 2022-01-21.
   — wifi-tally #131, 2023-06-05.
   https://github.com/wifi-tally/wifi-tally/issues/131

10. **On liveness tuned wrong:** a vMix user notes his tally goes dark when a
    camera simply isn't cut to for a while — "when there is longer time that the
    tally do not get any information, it is 'off'" — and asks whether the
    timeout is necessary and if the window can be lengthened. No response.
    — wifi-tally #133, 2023-11-03.
    https://github.com/wifi-tally/wifi-tally/issues/133

11. **On why people build their own hardware**, a list of commercial-kit
    grievances in one comment: the price ("$600 for the base station and 4
    lamps" — vendor **not named in the thread**); configuration via "tiny DIP
    switches at the bottom" that are "difficult to set" and require the manual
    each time; base-station software "only available for Windows"; and "No
    battery loading indicator. You don't have a way of knowing whether the Tally
    Lights are charged or not." He also notes M5/TTGO listeners are "all a
    little small to see from a distance."
    — TallyArbiter #213, 2021-09-09. (Dated evidence — five years old; treat the
    price as unattributed.)
    https://github.com/josephdadams/TallyArbiter/issues/213

12. **On three failures in one breath**, from a vMix M5Stick user: "this tally
    has a very large delay in crowded scenes"; "when I adjusted the brightness of
    the tally light to 100%, the actual brightness was still 0%"; "in some cases,
    the panel will be automatically reset." No maintainer reply.
    — guido-visser/vMix-M5Stick-Tally-Light #37, 2024-09-07.
    https://github.com/guido-visser/vMix-M5Stick-Tally-Light/issues/37

13. **On NDI tally sending contradictory truth:** the log line quoted in the
    request reads `tally changed; Sending tally on_preview=1, on_program=1` for a
    source that should be program-only; step 1 of the request is simply to make
    tally "reflect only one state at a time — OFF, Preview, or Program".
    — DistroAV #1086, 2024-09-01, open.
    https://github.com/DistroAV/DistroAV/issues/1086

14. **On what that looks like on the camera:** a BirdDog PF120's NDI tally light
    "rapidly blinks between red and green" when live in OBS; preview shows solid
    green correctly; Studio Mode behaves the same. No workaround offered.
    — DistroAV #687, 2021-09-27, open ~5 years.
    https://github.com/DistroAV/DistroAV/issues/687

15. **On the standard being ahead of its implementations:** "It would be nice to
    support the MQTT transport for IS-07 Event & Tally as well as the WebSocket
    transport." Opened 2019-05-15 against the reference NMOS C++ implementation.
    Still open, no assignee, no linked PR, seven years later.
    — sony/nmos-cpp #72.
    https://github.com/sony/nmos-cpp/issues/72

16. **On the standard's own unanswered question:** the sole open issue in the
    IS-07 specification repository is "Associating Events/Tallys to Audio/Video
    Senders and Receivers" — how to bind a tally to a camera — opened 2019-05-24
    and unresolved.
    — AMWA-TV/is-07 #53.
    https://github.com/AMWA-TV/is-07/issues

17. **On commercial protocol opacity:** a request for a Companion module to
    drive Cerevo FlexTally lamps, noting the manufacturer supports "ethernet or
    gpio", carries the labels **"Missing documentation"** and **"Stale"** and has
    not moved in five and a half years.
    — bitfocus/companion-module-requests #419, 2021-03-04.
    https://github.com/bitfocus/companion-module-requests/issues/419

18. **On commercial hardware with no network control surface at all:** the
    AVMATRIX TS3019 12-lamp wireless tally system has **"No Ethernet API"** — it
    is USB-C only, presents as `/dev/ttyUSB0`, and is driven with "Firmata-style
    digital pin commands" over serial. The requester's working beta module runs
    on a Raspberry Pi acting as a serial shim.
    — bitfocus/companion-module-requests #2092, 2026-06-23.
    https://github.com/bitfocus/companion-module-requests/issues/2092

19. **On the ATEM-only GPI box:** a five-year-old open request titled "Support
    for Blackmagic GPI and Tally Interface **Standalone**" — users want the box
    to work without an ATEM in the chain.
    — bitfocus/companion-module-bmd-gpi-and-tally-interface #1, 2021-05-26.
    https://github.com/search?q=%22GPI+and+Tally+Interface%22+OR+%22blackmagic+gpi%22+tally&type=issues

20. **An independent head-to-head**, from someone actually choosing: Tally Hub is
    a "polished, self-contained appliance experience" with broader out-of-box
    professional switcher coverage but a placeholder test suite and "limited
    outbound integration options"; Tally Arbiter has "unlimited sources and
    devices" with many-to-many arbitration and richer MQTT/webhook/Companion
    hooks but undocumented network discovery and manual firmware flashing.
    — thejoeejoee/co-ansible #14, ~2026-08-24.
    https://github.com/thejoeejoee/co-ansible/issues/14

21. **On why UMD matters and how often it is simply absent:** a team auditing
    their own multiviewer stack finds "Nothing in either repo has any concept of
    tally or UMD. Grepping the tree finds no TSL protocol code, no tally state",
    and states plainly that "a monitoring wall without labels is unusable".
    — Bilbycast/bilbycast-edge #108, ~2026-08-11.
    https://github.com/search?q=%22tally%22+%22TSL+5.0%22+OR+%22TSL5%22+protocol&type=issues

---

## What this means for AV Planner Suite (inference, clearly labelled)

None of the following is user-reported demand for a planning tool — no user in
this corpus asked for one. It is my reasoning from the pain above, and should be
validated before it drives roadmap.

The consistent shape of the evidence is that **tally failures are design-time
failures that surface at runtime**. The connection-budget overflow (pattern 1),
the wrong-camera mappings (pattern 3), the topology limits of relay mode
(AronHetLam README), the Ross/GV tier boundary (pattern 11), and the
buy-then-discover-incompatibility purchases (Hollyland) are all decisions made
on a plan, weeks before the show, with no tool that checks them.

A cable/AV planning application is the natural place to hold:

- a **control-client budget per switcher** (ATEM 5–8, model-dependent), counting
  every planned consumer — tally hub, Companion, ATEM Software Control, ISO
  recorder — and flagging the overflow at plan time rather than at hour three of
  the show;
- the **camera ↔ switcher-input ↔ tally-address ↔ physical-lamp map** as a first-
  class, validated, exportable artefact, so the rename that breaks TallyArbiter's
  `tallyData` and the DIP switches nobody can read are set from one authoritative
  source and can be diffed;
- the **tally topology** — direct vs relay tree, with the 5-clients-per-ESP8266
  fan-out limit and the "relayed units lose On Air mode" caveat modelled as
  constraints;
- **protocol/firmware compatibility as dated facts** rather than folklore, so a
  plan can warn that the pairing specified last season (OBS + wifi-tally, Roland
  V-80HD without credentials) no longer holds;
- the **operator-vs-talent distinction** as a property of each planned lamp, not
  a firmware mode discovered on site;
- **power and charge planning** for battery lamps, since no product reports state
  of charge.

---

## Sources

Every URL below was opened during this pass. GitHub HTML pages only — see Method
for the list of domains that were blocked.

**Tally Arbiter (josephdadams/TallyArbiter)**
- https://github.com/josephdadams/TallyArbiter
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+sort%3Acomments-desc
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+is%3Aopen
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+is%3Aopen&page=2
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+is%3Aclosed+sort%3Acreated-desc
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+crash+OR+memory+OR+freeze
- https://github.com/josephdadams/TallyArbiter/discussions
- https://github.com/josephdadams/TallyArbiter/releases
- https://github.com/josephdadams/TallyArbiter/releases/tag/v3.3.0
- https://github.com/josephdadams/TallyArbiter/issues/78
- https://github.com/josephdadams/TallyArbiter/issues/91
- https://github.com/josephdadams/TallyArbiter/issues/213
- https://github.com/josephdadams/TallyArbiter/issues/354
- https://github.com/josephdadams/TallyArbiter/issues/475
- https://github.com/josephdadams/TallyArbiter/issues/533
- https://github.com/josephdadams/TallyArbiter/issues/620
- https://github.com/josephdadams/TallyArbiter/issues/794
- https://github.com/josephdadams/TallyArbiter/issues/876
- https://github.com/josephdadams/TallyArbiter/issues/941
- https://github.com/josephdadams/TallyArbiter/issues/970
- https://github.com/josephdadams/TallyArbiter/issues/990
- https://github.com/josephdadams/TallyArbiter/issues/1121
- https://github.com/josephdadams/TallyArbiter/issues/1123
- https://github.com/josephdadams/TallyArbiter/issues/1188
- https://github.com/josephdadams/TallyArbiter/issues/1199
- https://github.com/josephdadams/TallyArbiter/issues/1205

**vTally / wifi-tally**
- https://github.com/wifi-tally/wifi-tally
- https://github.com/wifi-tally/wifi-tally/issues
- https://github.com/wifi-tally/wifi-tally/issues/131
- https://github.com/wifi-tally/wifi-tally/issues/133
- https://github.com/wifi-tally/wifi-tally/issues/134
- https://github.com/wifi-tally/wifi-tally/commits/main

**ATEM tally light with ESP8266 (AronHetLam)**
- https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues
- https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues?q=is%3Aissue+is%3Aclosed+sort%3Acomments-desc
- https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues/119
- https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/blob/master/README.md

**STAC (Xylopyrographer)**
- https://github.com/Xylopyrographer/STAC/issues
- https://github.com/Xylopyrographer/STAC/blob/main/README.md

**Tally Hub (tallyhubpro)**
- https://github.com/tallyhubpro
- https://github.com/tallyhubpro/Tallyhub
- https://github.com/tallyhubpro/Tallyhub/issues
- https://github.com/tallyhubpro/Tallyhub/commits/main
- https://github.com/tallyhubpro/Tallyhub/releases

**Other tally hardware/firmware projects**
- https://github.com/guido-visser/vMix-M5Stick-Tally-Light/issues
- https://github.com/guido-visser/vMix-M5Stick-Tally-Light/issues/37
- https://github.com/aaronpk/atem-tally-controller/issues
- https://github.com/deckerego/tally_pi/issues
- https://github.com/larszu/tally-pi

**Integration-side trackers (Companion, OBS/NDI)**
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+tally
- https://github.com/bitfocus/companion/issues/4376
- https://github.com/bitfocus/companion-module-requests/issues?q=is%3Aissue+tally
- https://github.com/bitfocus/companion-module-requests/issues/419
- https://github.com/bitfocus/companion-module-requests/issues/2092
- https://github.com/bitfocus/companion-module-ptzoptics-visca/issues/77
- https://github.com/bitfocus/companion-module-tslproducts-umd/issues  *(opened; GitHub returned an error state, no issues rendered)*
- https://github.com/DistroAV/DistroAV/issues?q=is%3Aissue+tally
- https://github.com/DistroAV/DistroAV/issues/687
- https://github.com/DistroAV/DistroAV/issues/1086

**Standards (AMWA NMOS IS-07)**
- https://github.com/AMWA-TV/is-07/issues
- https://github.com/AMWA-TV/nmos-testing/issues/235
- https://github.com/sony/nmos-cpp/issues/72

**Independent comparison**
- https://github.com/thejoeejoee/co-ansible/issues/14

**GitHub issue-search queries run (23; roughly half high-yield, the rest keyword noise and marked as such in the text)**
- https://github.com/search?q=tally+light+wifi+disconnect+OR+dropout&type=issues
- https://github.com/search?q=ATEM+tally+%22too+many%22+OR+%22connection+limit%22+OR+%228+clients%22&type=issues
- https://github.com/search?q=tally+delay+OR+latency+OR+lag+switcher&type=issues
- https://github.com/search?q=%22tally%22+%22TSL+5.0%22+OR+%22TSL5%22+protocol&type=issues
- https://github.com/search?q=tally+hollyland&type=issues
- https://github.com/search?q=tally+light+brightness+sunlight+OR+daylight+OR+dim&type=issues
- https://github.com/search?q=tally+%22PoE%22+OR+%22wired%22+ethernet+listener&type=issues
- https://github.com/search?q=%22smart+tally%22+roland&type=issues
- https://github.com/search?q=tally+%22aux%22+bus+OR+%22ISO+record%22+OR+%22multiviewer%22&type=issues
- https://github.com/search?q=tally+%22Ross%22+OR+%22Grass+Valley%22+switcher+support&type=issues
- https://github.com/search?q=tally+light+battery+life+OR+%22battery%22+esp32&type=issues
- https://github.com/search?q=%22GPI+and+Tally+Interface%22+OR+%22blackmagic+gpi%22+tally&type=issues
- https://github.com/search?q=FlexTally+OR+Cerevo+tally&type=issues
- https://github.com/search?q=%22IS-07%22+NMOS+tally&type=issues
- https://github.com/search?q=esp32+tally+reboot+OR+watchdog+OR+crash+wifi&type=issues
- https://github.com/search?q=NDI+tally+light+not+working+camera+PTZ&type=issues
- https://github.com/search?q=tally+mDNS+OR+discovery+not+found+hub&type=issues
- https://github.com/search?q=tally+docker+network+broadcast+OR+mdns+not+working&type=issues
- https://github.com/search?q=tally+%22cloud%22+remote+production+relay&type=issues
- https://github.com/search?q=tally+%22input+number%22+OR+%22mapping%22+camera+confusing&type=issues
- https://github.com/search?q=TSL+UMD+tally+address+off-by-one+OR+%22index+0%22+OR+%22starts+at+1%22&type=issues
- https://github.com/search?q=vmix+tally+limit+OR+%22only+8%22+OR+%22tally+not+updating%22&type=issues
- https://github.com/search?q=tally+%22how+many%22+lights+scale+OR+%22large+production%22+OR+%2216+cameras%22&type=issues
- https://github.com/search?q=tally+hub+tally+light+broadcast+in%3Aname%2Cdescription%2Creadme (repository search)

**Attempted and blocked by network egress policy (recorded so the gap is auditable)**
- old.reddit.com (r/VIDEOENGINEERING search) — fetch refused
- forum.blackmagicdesign.com
- forums.vmix.com
- obsproject.com (forum search)
- www.controlbooth.com
- www.tallyarbiter.com — the product's own documentation site
- tallyhubpro.github.io — Tally Hub documentation
- wifi-tally.github.io — vTally documentation
- www.tslproducts.com
- tally-ma.com
- api.github.com via curl — session scoped to `larszu/*` repositories only

**Not attempted (no reachable route, no search tool):** G2, Capterra, GetApp,
Software Advice, TrustRadius, Trustpilot, avsforum, ProSoundWeb, blue-room.org.uk,
LightNetwork, videohelp, film-tv-video.de, production-partner.de, IABM/DPA
articles, and all German-language forums. **The review-site, professional-forum
and German-language angles of the brief are unexecuted.**
