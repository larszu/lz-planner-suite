# Pain points: Intercom / Crew Communication

Research date: 2026-08-29 (brief dated 2026-08-28).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Language of corpus: English (repo docs mix DE/EN; research corpus stays EN).

---

## Method

### Read this first — the method was severely constrained

This pass ran under two hard limits that shaped what could be evidenced:

1. **Network egress policy blocked almost every non-GitHub source.** Confirmed
   blocked at the proxy (HTTP 403 on CONNECT, or `EGRESS_BLOCKED` from the
   fetch tool) during this pass:
   `reddit.com` / `old.reddit.com`, `g2.com`, `capterra.com`, `trustpilot.com`,
   `clearcom.com`, `clear-com.atlassian.net` (the Clear-Com Solution Finder
   wiki), `riedel.net`, `green-go.eu`, `manual.greengoconnect.com` (the Green-GO
   Known Issues page), `eyevinn.se`, `unityintercom.com`, `bitfocus.io`,
   `forums.prosoundweb.com`, `blue-room.org.uk`, `controlbooth.com`,
   `avforums.com`, `forum.blackmagicdesign.com`, `film-tv-video.de`,
   `production-partner.de`.
   **Reachable and used: `github.com`, `raw.githubusercontent.com`, and the
   web-search tool's page extracts.**
2. **The session's web-search budget was already exhausted** (200/200 calls used
   by earlier passes in the same session). Only **6 search queries** completed in
   this pass before the budget ran out. The brief asked for 8–15; that part of
   the method is **partially unexecuted**, and the Reddit, review-site,
   professional-forum and German-language angles are **effectively unexecuted**.

**Consequence, stated plainly: this dossier is strong on control-API,
integration and open-source pain, and near-silent on hardware RF behaviour,
pricing, purchasing and end-user sentiment.** Do not read the absence of
complaints about, say, Bolero RF performance as evidence that none exist — it is
evidence that I could not reach the places where they are written.

### What was actually read

**~43 pages opened and read directly** (all first-hand), plus **6 search-engine
page extracts**. Total distinct sources: **49**.

- **GitHub issue trackers read in full** (13 repositories): the four Bitfocus
  Companion modules for Riedel, the two for Clear-Com, the two for Unity
  Intercom, Green-GO, Eyevinn, Spacecommz, talktome; plus `Eyevinn/intercom-manager`,
  `Eyevinn/intercom-frontend`, `talkkonnect/talkkonnect`, `4Players/odin-server`,
  `thepoison606/talktome`, `jlommori/riedel_rrcs`.
- **Vendor-adjacent primary docs read verbatim** via `raw.githubusercontent.com`:
  the `companion/HELP.md` for eight intercom modules (these are written by the
  integrators against the real APIs and contain explicit "Notes & Limitations"
  sections), the Green-GO device-side OSC script `osc-remote.gg5t`, the talktome
  README, the Eyevinn frontend README.
- **Search extracts** (weaker evidence — the search tool read the page and
  quoted it; I did not open it): Green-GO Known Issues page (x2 queries),
  Clear-Com Arcadia release notes, Riedel Bolero manuals, Clear-Com product
  pages.
- **Context**: `larszu/broadcast-intercom` README (the user's own in-progress
  product), read to ground the "angle" column.

### Why the GitHub angle is unusually good here

Brief angle 3 ("a pile of issues against an API wrapper reveals API weaknesses")
turned out to be the single most productive channel in this segment. Bitfocus
Companion modules are written by working broadcast engineers against the real
vendor APIs, and their `HELP.md` files carry **explicit, vendor-specific
limitation lists** that the vendors themselves do not publish. Several of the
strongest findings below are verbatim from those files.

### Evidence labelling

- **FACT** — read on a page, URL given. `(direct)` = I opened it.
  `(search extract)` = the search tool read and quoted it.
- **INFERENCE** — my reasoning from the facts. Always flagged.
- **UNKNOWN / unverified** — could not confirm; I say what would be needed.

Frequency: `isolated` = one source; `recurring` = several independent sources;
`widespread` = a theme across many independent sources.

**No quote below is verbatim unless it appears in quotation marks with a
`(direct)` citation.** Everything else is paraphrase. Nothing is invented.

---

## Per-product findings

### Riedel Artist / Bolero / SmartPanel (RRCS)

Evidence base: the `companion-module-riedel-rrcs` HELP.md "Notes & Limitations"
section (read verbatim), the `companion-module-riedel-smartpanel` issue tracker,
the `companion-module-riedel-mediornet` issue tracker (same vendor, adjacent
control surface), and `jlommori/riedel_rrcs` (an independent Node.js RRCS
client). No Riedel-hosted page was reachable.

**STRENGTHS (conceded by integrators)**
- RRCS is genuinely the richest control API in the segment. The module exposes
  crosspoint set *and per-crosspoint volume*, conferences, IFB mix-minus volume,
  key press/lock/label, logic sources, GP I/O, port clone, port alias/label and
  IO gain — FACT, `companion/HELP.md` action list (direct).
- It is event-driven, not poll-only: the independent `riedel_rrcs` client
  implements an XML-RPC *server* to receive `crosspointChange` and `sendString`
  notifications from RRCS — FACT, `jlommori/riedel_rrcs` README (direct).
- Tested and documented against a specific version (RRCS 8.6.1), which is more
  than most vendors in this segment offer — FACT, HELP.md (direct).

**WEAKNESSES**
- **Capabilities silently differ by matrix frame generation.** Two separate
  functions are documented as simply not working on one hardware model:
  "Crosspoint - Set Volume … Does not work when destination port is connected to
  an Artist-1024" and "GP Input Feedback … Does not work with panels connected
  to an Artist-1024" — FACT (direct, verbatim), HELP.md. Frequency: recurring
  (two independent functions, same root).
- **Network-scoped addressing traps.** "Functions that only accept
  `<node>.<port>` addresses only work in the same `<net>` as RRCS" — FACT
  (direct, verbatim). INFERENCE: multi-net Artist installations, i.e. exactly
  the large ones RRCS exists for, get a silently reduced function set.
- **Numbering is inconsistent between the API and the vendor's own config tool.**
  "RRCS uses 0-based numbering for Port and GPIO numbers; this module converts
  them to 1-based numbering for consistency with Director, however internal logs
  are 0-based" — FACT (direct, verbatim). INFERENCE: an off-by-one trap that every
  integrator must rediscover, and logs that don't match the UI during a fault.
- **SmartPanel telemetry is firmware-fragile.** On an RSP-1216HL running firmware
  2.0.0-82, device name, firmware version, NMOS status, NMOS enabled and Control
  Panel enabled all failed to populate — FACT, issue #12 (direct). The same issue
  records that the module did not document which firmware it had been tested
  against.

**MISSING FEATURES (what users request)**
- Bonjour/mDNS discovery that copes with panels announced on multiple network
  interfaces — open feature request #22, May 2026 (direct, `riedel-smartpanel`).
- On the adjacent Mediornet control surface, the standing requests are: snapshot
  support (#24, open Jan 2026), grouping of sources and targets (#17, open
  Apr 2024 — open ~2 years), destination locking (#5, open since Jun 2023 and
  explicitly marked "ON HALT"), and audio/video controls (#9, open Dec 2023) —
  FACT (direct). Frequency: recurring; the pattern is that Riedel control
  requests sit open for years.
- Riedel-specific: nothing in RRCS surfaces a *snapshot/recall of a whole comms
  state* to the module author's satisfaction — INFERENCE from the Mediornet
  snapshot request; **unverified for RRCS itself**. To check: RRCS 8.x API
  reference, obtainable only under Riedel NDA/partner access.

**UX PROBLEMS**
- Address entry is a two-mode compromise: a dropdown that "only populates when
  online", or hand-typed period-separated numeric addresses for offline work —
  FACT (direct, verbatim HELP.md). INFERENCE: offline pre-programming of a show
  means typing `net.node.port` triples by hand from a paper patch list, which is
  precisely the error-prone step a planning tool should remove.

**PERFORMANCE PROBLEMS**
- **No delta updates on configuration change.** "Update on Configuration Change:
  Performs all Get All actions when RRCS reports a configuration change. This
  keeps dropdowns and feedbacks accurate, however may prove excessively
  burdensome in large, busy networks" — FACT (direct, verbatim). This is a
  vendor-API shape problem, not a module bug: RRCS signals *that* something
  changed, not *what*, so the only correct response is a full refetch of ports,
  conferences, IFBs and logic sources.
- INFERENCE: this scales badly exactly where Artist is sold — large multi-node
  systems during rehearsal, when config churn is highest.

**PRICING PROBLEMS**
- **UNKNOWN.** No Riedel pricing page was reachable and no price was found in any
  source I opened. Riedel Artist/Bolero is sales-contact-quoted as far as I can
  tell, but **I did not verify this** and will not state a price. To check:
  a reachable dealer listing, or a public tender/framework-agreement document.

**LOCK-IN**
- RRCS is XML-RPC over a Riedel-proprietary schema against a Riedel-only
  controller; there is no vendor-neutral abstraction. FACT (direct, both the
  module and `riedel_rrcs` speak XML-RPC to RRCS specifically).
- The independent Node client `jlommori/riedel_rrcs` has **13 stars, 2 open
  issues, both unresolved since February 2020** — FACT (direct). INFERENCE: the
  third-party ecosystem around the richest API in the segment is one person and
  a five-year-stale library, so integrators are effectively on their own.

**OFFLINE**
- Partially offline-capable by design, but degraded: the address dropdowns need
  a live RRCS, and "Logic Source: Action & Feedback only available when RRCS has
  reported configured logic sources; can not be configured offline" — FACT
  (direct, verbatim). Frequency: this is the clearest documented
  offline-programming gap found in the whole segment.

**INTEGRATION PROBLEMS**
- The `Received String` / `Send String` mechanism is a stringly-typed side
  channel: the variable holds only "the most recently received Send String
  message", and the feedback is true while a matching string is asserted — FACT
  (direct). INFERENCE: no structured event history, so a fast burst of
  notifications is lossy for anything downstream.

---

### Clear-Com (Eclipse HX / Arcadia / Edge / LQ / Gen-IC / Station-IC)

Evidence base: `companion-module-clearcom-rest` HELP.md and changelog,
`companion-module-clearcom-station-ic` HELP.md and issue tracker, and a search
extract of Clear-Com's own Arcadia release notes. clearcom.com and the Clear-Com
Solution Finder wiki were both blocked.

**STRENGTHS**
- Two genuinely usable APIs exist and are documented enough for third parties to
  build against: a REST API on Arcadia/Edge master stations, and a Station-IC
  Remote API — FACT, both HELP.md files (direct).
- The Station-IC API is unusually complete on the *read* side: it "provides
  names and states of all options", exposing keyset labels, listen levels, reply
  key and the incoming caller's name as Companion variables — FACT (direct,
  verbatim HELP.md). This is better state introspection than Unity Intercom or
  Green-GO offer.
- Clear-Com does ship real functional upgrades to installed systems: Arcadia
  firmware 4.1 added IFB (dip programme audio to talent) and AES67 connection of
  up to 32 additional panels — FACT (search extract of clearcom.com release
  material and TPi coverage).

**WEAKNESSES**
- **Authentication on the REST API is the box's admin password.** The setup
  instruction is literally: note the master station's IP and admin password,
  enter both in the module config — FACT (direct, verbatim
  `clearcom-rest/companion/HELP.md`). There is no API key, no scoped token, no
  read-only role. INFERENCE: every control integration is handed full
  administrative credentials to the intercom matrix, and revoking one integration
  means changing the password for all of them. This is the weakest auth model of
  any API examined in this segment, and it stands in direct contrast to talktome
  (per-account scoped tokens) and ODIN (signed room tokens).
- **The REST API ships commands that do nothing useful.** Module release 0.4.5:
  "Removed commands that don't perform a useful function" — FACT (direct,
  verbatim changelog). INFERENCE: the API surface is not curated; the integrator
  had to discover empirically which endpoints are inert.
- **Long-running audio degradation on the flagship product.** Clear-Com's own
  Arcadia release notes record that "after extended runtime audio artifacts could
  be heard from HelixNet channels to FreeSpeak Beltpacks, Arcadia Front Panel and
  Interfaces" — FACT (search extract of the Arcadia R4 release-note PDF on
  clearcom.com). Frequency: isolated as a citation, but note the class:
  *runtime-duration-dependent* audio faults, i.e. the kind that appear on show
  day and not in a bench test.
- **Firmware corruption requiring physical USB recovery.** Same release notes:
  HelixNet HXII-BP beltpacks built with U-Boot 1.0.34–1.0.37 (HelixNet firmware
  4.1–4.5) whose internal configuration filesystem got corrupted "could not
  recover automatically without a USB upgrade" — FACT (search extract). INFERENCE:
  a beltpack that bricks itself and needs hands-on USB recovery is a
  show-stopping failure mode for a rental/touring operator.

**MISSING FEATURES**
- Station-IC's Companion module lists no talk-key *logic* primitives (interlock,
  exclusive talk, "silence all") — INFERENCE from the action list in HELP.md
  (direct), not a user request I found. **Unverified whether the underlying API
  has them.**
- The REST module's changelog shows GPI functions were only added at 0.4.1 —
  FACT (direct). INFERENCE: GPIO, a core broadcast integration primitive, was an
  afterthought in the REST surface.

**UX PROBLEMS**
- **The latch/momentary distinction is a hand-tuned timing hack.** Clear-Com's
  Station-IC preset design: "a Talk button where there is a latched action when
  pressed and a second non-latching action if held for longer than 200 ms" —
  FACT (direct, verbatim HELP.md). INFERENCE: talk-key behaviour that broadcast
  operators consider fundamental is being reconstructed client-side out of a
  200 ms timer, which is fragile under load and unintuitive to configure.
- Support for the Station-IC integration is directed to a **third-party
  Discourse forum** (`discourse.checkcheckonetwo.com`), not to Clear-Com — FACT
  (direct, HELP.md). INFERENCE: Clear-Com does not own support for its own
  documented remote API.

**PERFORMANCE PROBLEMS**
- The REST module changelog contains an entry "Less Errors" and "Better messaging
  in Logs for Errors" at 0.3.1 — FACT (direct). INFERENCE: the API was noisy or
  error-prone enough that error volume itself was a release-note-worthy fix.
- Beyond that, **UNKNOWN.** I could not reach any source describing Eclipse HX
  or Arcadia behaviour under load, panel-count limits in practice, or failover.

**PRICING PROBLEMS**
- **UNKNOWN — no price verified.** I found no reachable Clear-Com pricing page.
  The one price-adjacent fact I can state: **Station-IC is a free download from
  Clear-Com's website** — FACT (direct, verbatim `station-ic/HELP.md`, module
  dated May 2025). INFERENCE (explicitly flagged): a free software client that
  only connects to "capable Eclipse-HX, LQ, or Gen-IC intercom systems" (FACT,
  verbatim) is a hardware-pull model — the client is free because the matrix is
  not. To check: Gen-IC subscription terms and LQ list pricing, both of which
  require clearcom.com.

**LOCK-IN**
- Station-IC is a client to Clear-Com systems only, and requires "Station-IC
  version 1.6 and higher" for the remote API at all — FACT (direct). Version
  floors on the remote API mean control integrations force client upgrades.
- The REST API exists only on Arcadia and Edge master stations — FACT (direct,
  verbatim: "for use with Clear-Com master stations that have a REST API, like
  the Arcadia and Edge"). INFERENCE: the older Eclipse HX estate has no REST
  path, so an operator running mixed vintages cannot use one control model.

**OFFLINE**
- The Station-IC Remote API is **localhost-only**: "Normally station-IC is
  accessed on local IP 127.0.0.1 and port 16000" — FACT (direct, verbatim).
  INFERENCE: control must run on the same machine as the client; you cannot
  centrally drive a rack of Station-IC instances from one controller without one
  controller process per machine.
- Offline capability in the REST module was **not present at first release** —
  it appears as a changelog line at 0.3.2: "Ability to work offline" — FACT
  (direct, verbatim). INFERENCE: offline pre-programming was retrofitted.

**INTEGRATION PROBLEMS**
- Two separate, incompatible APIs (REST on the master station; a localhost
  JSON/socket API in the softclient) with different auth models (admin password
  vs. a per-install Remote API key copied from Settings) — FACT (direct, both
  HELP.md files). INFERENCE: an integrator targeting "Clear-Com" must write and
  maintain two clients.

---

### Green-GO 5th generation

Evidence base: the `companion-module-greengo-intercom` HELP.md and issue tracker
(read directly), the device-side OSC script `osc-remote.gg5t` (read directly),
and two search extracts of Green-GO's own Known Issues page. greengoconnect.com
was blocked.

**STRENGTHS**
- The per-channel model is the most expressive found: separate channel talk,
  call, cue, listen, channel level, PGM level, main level, input gain, input
  source and isolate, each with a matching feedback — FACT (direct, HELP.md
  action/feedback tables). Nothing else in the segment exposes input *gain* and
  *source* as first-class remote-controllable state.
- State is genuinely event-driven, not polled: the device script registers
  `event channel.talk[chId]` handlers that push OSC on change, plus a 3-second
  heartbeat — FACT (direct, `osc-remote.gg5t`).
- Green-GO publishes a **public Known Issues page with tracked defect IDs**
  (D#659, D#917, D#922, D#923 …) — FACT (search extract). INFERENCE: this is
  unusually honest for the segment; Riedel and Clear-Com equivalents were not
  findable.

**WEAKNESSES**
- **The "API" is a user-compiled script, not an API.** To get OSC control the
  operator must: download `osc-remote.gg5t` from GitHub, open the integrated
  script editor, hand-edit `remoteIP` and `controlPort` in the source, compile it
  to a binary, load it onto each device or into a user's device profile, and save
  the configuration to the devices — FACT (direct, HELP.md prerequisites +
  the script's own first lines, which are literally `var remoteIP = "10.10.10.10"`).
  Frequency: this is a single-source fact but it is structural, not anecdotal.
- **Hard six-channel ceiling, and the vendor's own stated reason is a platform
  limit.** "Because of limitations in the scripting VM present on current
  Green-GO devices, this Companion module enables you to remotely control a
  maximum of 6 channels (channels 1 - 6)" — FACT (direct, verbatim). The script
  confirms it: every loop is `for chId = 1 to 6` — FACT (direct).
- **Wireless devices cannot be controlled at all.** "we currently can't support
  Green-GO WAA antennas or WBPX(SP) belt packs as can't control those devices via
  OSC" — FACT (direct, verbatim). INFERENCE: the remote-control story covers only
  the wired estate, which is the half least in need of remote control.
- **DECT connections drop and need a power cycle.** Known issue D#659: wireless
  antenna or wireless beltpack randomly dropping DECT connections, requiring a
  power cycle to recover — FACT (search extract of the Known Issues page).
  Related: D#922, special channels do not always work on wireless devices; D#317,
  wireless beltpacks don't get correct names when connected to an antenna; D#923,
  local IFB dimming does not work on interfaces; D#917, MCX/MCXD devices hang when
  updated from Green-GO Control unless started in Boot Mode first — FACT (search
  extracts, two independent queries). Frequency: **recurring** — five distinct
  tracked wireless/update defects.
- Firmware notes record an antenna fix so that antennas "automatically disconnect
  beltpacks when removed from a pool or moved to a different pool, resolving the
  'phantom connection' issue" — FACT (search extract). INFERENCE: pool/roaming
  state management has been a real field problem.

**MISSING FEATURES (what users request)**
- **More channels.** A user running events who talks to "more than 20 people each
  at a time" asked whether the six-channel cap could be raised to 32 — FACT,
  issue #7, opened 6 Aug 2024, **still open** (direct). Frequency: isolated as a
  filed request, but it is the direct user-side expression of the platform limit
  above, so treat as structurally recurring.
- Headset bias and screen-flip actions — open since 17 Mar 2024, issue #3
  (direct).

**UX PROBLEMS**
- **Momentary talk latches.** A channel configured as momentary (PTT) behaves as
  latched when driven from Companion: the device reports state `3` for a real PTT
  press and state `2` for a latched channel, and remote control produces `2` —
  FACT, issue #10, opened 16 Sep 2024, **still open** (direct). INFERENCE
  (flagged): a talk key that sticks open is the single worst failure mode in a
  crew intercom — it dumps one person's mic onto the whole partyline.
- **Broadcast-address footgun.** The config guidance is to "avoid using broadcast
  addresses to prevent receiving conflicting states" — FACT (direct, verbatim).
  INFERENCE: the OSC state model has no addressing/identity discipline, so two
  devices answering on one address corrupts the controller's view.

**PERFORMANCE PROBLEMS**
- The channel-count setting is documented as a performance knob: "Using a lower
  number of channels can improve performance and reduce network load" — FACT
  (direct, verbatim). INFERENCE: even within the six-channel cap, the scripting
  VM and the OSC fan-out are the bottleneck.
- **Feedback silently dies.** Issue #16 (20 Jan 2026, open): the user has "full
  control of the device, but the feedback doesn't show up", and asks whether OSC
  send and receive share a port or whether feedback is faked locally — FACT
  (direct). Issue #14 (4 Sep 2025, open): channel variables work, but "level
  main, level pgm, audio gain, audio source etc. are showing 0 all the time",
  after the reporter tried different ports — FACT (direct). Frequency:
  **recurring** — two independent reporters, 16 months apart, both on
  non-channel state. Environments recorded: Companion 4.2.3, module 1.0.2,
  Green-GO software 5.2.1, BPX beltpack.

**PRICING PROBLEMS**
- **UNKNOWN — no price verified.** Green-GO's positioning as the
  decentralised/no-central-server option implies a lower entry cost than a
  matrix, but I found no reachable price. To check: green-go.eu or a dealer.

**LOCK-IN**
- Control depends on a proprietary on-device scripting VM and a `.gg5t` script
  format — FACT (direct). INFERENCE: no other vendor's controller can speak this
  without shipping and compiling Green-GO's own script.
- Firmware floor: the OSC remote needs firmware v5.0.3.0255 or above — FACT
  (direct).

**OFFLINE**
- **Good, and this is Green-GO's real advantage.** The system is decentralised
  with no central server, and the setup instruction is explicitly to "save your
  configuration to your devices to ensure proper operation without the software
  running in the background" — FACT (direct, verbatim). INFERENCE: the control
  script persists on the device; the OSC controller can go away and the intercom
  keeps working. That is stronger offline behaviour than any cloud/WebRTC entrant.

**INTEGRATION PROBLEMS**
- The OSC state model is unidirectional-by-convention: state is pushed on a
  `/ggo/state/...` path from the device, commands go to `/ggo/cmd/...`, and there
  is one `update` command that forces a full state dump of all six channels —
  FACT (direct, script). INFERENCE: no request/response, no acknowledgements, no
  sequence numbers, so a dropped UDP packet is an undetected stale state — which
  is a plausible root for the recurring feedback failures above (**inference,
  not established**).

---

### Eyevinn Open Intercom (intercom-manager + intercom-frontend)

Evidence base: both repositories' issue trackers, label taxonomy, READMEs, and
the `companion-module-eyevinn-intercom` HELP.md — all read directly. This is the
most thoroughly evidenced product in the dossier.

**STRENGTHS**
- Genuinely open, genuinely deployable: WebRTC via WHIP/WHEP over Symphony Media
  Bridge, OpenAPI/Swagger docs served at `/api/docs/`, Docker deployment,
  Terraform examples — FACT (direct, README).
- Active development. The backlog is being worked in Aug 2026 — FACT (issues
  #294, #288–#291 all Aug 2026, direct).
- Has a real Stream Deck control path with meaningful feedbacks (input mute,
  output mute, PTT, per-call name display, global mute) — FACT (direct, HELP.md).

**WEAKNESSES**
- **No built-in authentication.** The project "intentionally lacks built-in
  authentication, delegating that responsibility to the deployment environment";
  a bearer token (`WHIP_AUTH_KEY`) protects only the WHIP/WHEP ingest endpoints,
  **not general API access** — FACT (direct, README). INFERENCE (flagged, and I
  think this is the most important single finding about this product): a
  self-hosted Open Intercom on a production LAN is, by default, open to anyone
  who can route to the port — they can enumerate productions, join lines, and
  administer them. Every other product in this segment ships *some* auth.
- **No moderation beyond mute.** Backend issue #294 (26 Aug 2026, open) states
  that "the 'kick user' feature needs a backend capability that does not exist
  today (only remote-mute exists)" — FACT (direct, quoted from the issue body).
  The matching frontend work is also all open: kick button (#673), handling a
  `forceDisconnect` signal (#672), global mute/unmute (#676), and even the
  *definition* of admin-mute vs self-mute semantics (#677) — FACT (direct, all
  opened 26–27 Aug 2026). Frequency: recurring across two repos.
- **The security backlog dwarfs the feature backlog.** The `intercom-manager`
  issue list is dominated by open items titled `Security:` — no rate limiting on
  session/production/reauth/share endpoints (#256), the `/reauth` endpoint
  returning a raw OSC service access token in the JSON response body (#264),
  TURN credentials sent in a plaintext HTTP `Link` header (#251), `/share`
  accepting a scheme-relative path giving an open redirect with an
  attacker-controlled delegate `redirectUrl` (#270), unvalidated `ipAddress` with
  SSRF risk (#250), and a long tail of dependency CVEs — FACT (direct, issue
  list). The frontend mirrors it: the API key exposed in the browser bundle
  (#625), hardcoded Google STUN servers leaking user IPs (#626), a debug logger
  that can print SDP and internal IPs (#629) — FACT (direct).
  **Caveat I want to be explicit about:** these read like the output of a single
  systematic audit, mostly filed within a few weeks with zero comments, so they
  are better evidence of *audit coverage* than of *users being harmed*. But they
  are open, and a broadcaster's security review will read them.

**MISSING FEATURES (what users request)**
- **Bringing external audio in is a 14-month-old open epic.** The entire "I/O" /
  ingest workstream is open: create an ingest page (#486), add ingest input to a
  program line (#464), edit/change it (#466), remove it (#465), delete an ingest
  (#460), label and edit ingests (#463), show ingest connection status (#461),
  global state for ingested inputs (#468), use the real audio-device type (#487),
  and test IFB once ingest input exists (#480) — FACT (direct), **all opened
  3–23 June 2025 and all still open at 29 Aug 2026**. INFERENCE: Open Intercom
  cannot yet do the thing every broadcast intercom must do — carry programme
  audio and IFB from the gallery to the talent.
- **Role management is not implemented.** Issue #469 "Frontend: Roles", opened
  3 Jun 2025, still open, and there is a dedicated `role management` label —
  FACT (direct).
- The label taxonomy itself names two more requested areas that have no shipped
  feature: `saving call configuration` and `customer request` — FACT (direct,
  labels page). INFERENCE: users are asking to persist a call/line layout between
  shows.

**UX PROBLEMS**
- Control addressing is **positional, not semantic**: Companion buttons address
  "Call 1–8" by index, "the first call in your list of calls will be Call 1" —
  FACT (direct, verbatim HELP.md). INFERENCE: reorder or delete a line and every
  Stream Deck button silently points at a different channel.
- The bundled docs disagree with themselves: `companion/HELP.md` documents
  Call 1–8, the repo README documents Call 1–20 — FACT (direct, both read).
- A build-time env var crashes the app at module load when undefined
  (`VITE_BACKEND_URL`, #646, closed Aug 2026) — FACT (direct).

**PERFORMANCE PROBLEMS**
- Backend issue #291 (17 Aug 2026, open): the long-poll endpoint accumulates
  EventEmitter listeners without cleanup when a client disconnects — FACT
  (direct). INFERENCE: a slow leak proportional to client churn, i.e. it gets
  worse across a long show day with people joining and leaving.
- Otherwise **UNKNOWN**: I found no report of audio quality, latency figures, or
  participant-count limits under real load. To check: the Eyevinn Slack, or a
  load test against Symphony Media Bridge.

**PRICING PROBLEMS**
- Free and open-source (self-hosted). A managed version is offered on Eyevinn
  Open Source Cloud at `intercom.apps.osaas.io` — FACT (direct, README).
  **Price of the hosted tier: UNKNOWN, not verified** (osaas.io was not
  fetched). Label as "requires checking osaas.io", not "as advertised".

**LOCK-IN**
- Low on paper (MIT-licensed, self-hostable, OpenAPI-documented), but with a
  pull toward the vendor's cloud: the documented developer path against a hosted
  backend requires an `OSC_ACCESS_TOKEN` personal access token and a
  `*.auto.prod.osaas.io` backend URL, and the backend carries an OSC-specific
  `GET /api/v1/reauth` endpoint in its core API — FACT (direct, both READMEs).
  INFERENCE: cloud-tenancy concerns have leaked into the open-source product's
  API surface.
- Hard dependency on Symphony Media Bridge plus MongoDB or CouchDB — FACT
  (direct, README). INFERENCE: not a drop-in on a small on-prem box.

**OFFLINE**
- Self-hostable on a LAN, so nominally offline-capable — FACT (direct).
  But: the frontend ships **hardcoded Google STUN servers** (#626, open) — FACT
  (direct). INFERENCE: on an air-gapped production network, ICE gathering will
  attempt to reach `stun.l.google.com`, and connection setup will be slow or fail
  until STUN/TURN is reconfigured. **Unverified** whether it fails outright; to
  check, run the stack with egress blocked.

**INTEGRATION PROBLEMS**
- The Companion module's own open issue is `Uncaught DOMException: The operation
  is insecure.` (#4, 25 Sep 2025, open, filed by a Companion core maintainer) —
  FACT (direct). INFERENCE: a browser secure-context failure, i.e. the
  HTTP-vs-HTTPS problem that bites every browser-based intercom on a LAN.
- Frontend #627 (open): the `companion` URL query parameter is not validated
  before a WebSocket connection is opened — FACT (direct).

---

### Unity Intercom (Audivero)

Evidence base: `companion-module-audivero-unityintercom-client` HELP.md (read
verbatim) and its full issue history including closed issues. unityintercom.com
was blocked.

**STRENGTHS**
- Established, with a real server and real desktop clients; the module has been
  maintained across five years (issues from Apr 2021 to Aug 2026) — FACT
  (direct, issue dates).
- The module author added pragmatic escape hatches: a configurable press-hold
  time and a selectable surface model — FACT (direct).

**WEAKNESSES**
- **The control API is Stream Deck emulation, not a control API.** The module
  "functions by sending button presses to the Unity client API", and to know what
  a button does you must "check the assignment for that button number in the Unity
  User Interface" — FACT (direct, verbatim HELP.md). INFERENCE: there is no
  semantic addressing and no introspection — the controller cannot ask "what
  channels exist?", only "press button 7".
- **Button numbers are derived from a Stream Deck grid geometry.** The surface
  model "controls which Stream Deck model the module reports itself as. The Unity
  client builds its panel configuration screen from this, and calculates button
  numbers from the model's grid, so it must match the layout you want" — FACT
  (direct, verbatim). INFERENCE: the logical control map is coupled to a physical
  hardware layout the operator may not own; a Stream Deck + is only 2x4.
- **Every command must be a matched pair or the client latches.** "every API
  request requires both a 'keydown' and 'keyup' command to be sent, or the Unity
  client will stay in a latched state" — FACT (direct, verbatim). Confirmed in
  the wild by closed issue #8, "RELEASE of 'All Page' button doesn't always
  release" — FACT (direct). INFERENCE: a dropped UDP keyup leaves a mic open to
  everyone, and UDP gives no delivery guarantee.
- **The pairing is timing-tuned by hand.** "Press Hold Time controls how long the
  module waits between sending a press and its matching release. The default of
  50 ms suits most clients. If short presses (like selecting a listen channel)
  are not registering, raise this value" — FACT (direct, verbatim). INFERENCE:
  correctness depends on a hand-set millisecond delay per installation.

**MISSING FEATURES**
- State feedback. Issue #1 (Apr 2021): the reporter was "struggling with getting
  feedback from Unity on the pressed buttons" after trying multiple feedback
  configurations on Companion 2.2.0, Windows and Mac — FACT (direct). Issue #19
  (closed Aug 2026): feedback stopped working again after upgrading to Companion
  4.0.3 — FACT (direct). Frequency: **recurring** — the same class of complaint
  at both ends of a five-year window.

**UX PROBLEMS**
- **Buttons stop responding after a group switch and require a manual
  reconnect.** Issue #10, open since 8 Feb 2024: after a button switches
  talk/listen groups, the change takes effect inside Unity, but "no other buttons
  on the stream deck will operate unity any longer until I go into bitfocus and
  disconnect/reconnect". Environment recorded: Companion 3.3.0, macOS 14.1.2,
  Unity Client 3.0.26 — FACT (direct). **Open for 2.5 years.** INFERENCE: the
  Unity client re-derives its panel map on a group change and the emulated
  surface's registration is not re-established.
- Closed issue #18 (Jun 2025): "Remove HTML in config fields" — FACT (direct).

**PERFORMANCE PROBLEMS**
- Closed issue #2 (Apr 2021): "Unity Client Crashes on Button Release" — FACT
  (direct). Closed issue #4 (Apr 2021): "Fails to close udp socket" — FACT
  (direct). Frequency: isolated, and both are old and fixed; weight accordingly.

**PRICING PROBLEMS**
- **UNKNOWN — no price verified**, unityintercom.com was blocked.

**LOCK-IN**
- Control requires the Unity *client* to be running on the machine, and the
  client's own button assignments are the API's semantics — FACT (direct).
  INFERENCE: you cannot drive Unity headlessly from a server; the desktop client
  is a mandatory shim.

**OFFLINE**
- Closed issue #5 (Jun 2023): "Cannot connect if companion interface is set to
  anything other than local" — FACT (direct). Closed issue #7 (Jun 2023): "Can
  only connect single instance to single Unity client" — FACT (direct).
  INFERENCE: historically one controller per client, bound to the local
  interface; both are closed, so treat as fixed but indicative of the design.
- The API is UDP 20119 on the LAN, so no internet is needed for control — FACT
  (direct, HELP.md). The *intercom* itself is server-based; whether the server
  can be on-prem is **UNKNOWN**.

**INTEGRATION PROBLEMS**
- Configuration requires editing the Unity Client's own settings to add the
  controller's IP — FACT (direct). INFERENCE: two-sided config, so a controller
  IP change is a per-client manual edit.

---

### talktome

Evidence base: repository README (read verbatim in the relevant sections), the
issue tracker, and `companion-module-talktome-intercom/companion/HELP.md`.

**Landscape correction, stated up front (FACT, direct):** talktome is a
**public, Apache-2.0-licensed** repository at `github.com/thepoison606/talktome`
with 117 stars and 11 forks, built on Node.js, mediasoup and Socket.IO. The
landscape pass called Eyevinn "the only credible fully open-source broadcast
intercom" — that is **not correct**. talktome is a second one, and on several
axes (auth model, admin UI, tally, NDI) it is further along.

**STRENGTHS**
- **Best authorisation model in the segment, confirmed.** API-key auth
  (`x-api-key` or `Authorization: Bearer`) *and* user-login auth, with
  user-scoped tokens from `/api/v1/companion/auth/login`; "In `User login` mode,
  the visible users and generated presets depend on the scope returned by the
  talktome server for that account" — FACT (direct, verbatim module HELP.md).
- **Best feedback surface in the segment.** The module exposes: connected, no
  connection, user online, user talking, user talking to target, user talking via
  reply, reply available, user talk lock, target muted, target volume, target
  volume bar, target online, target offline, "target speaks to user (now)", last
  pressed target offline — FACT (direct, verbatim). Nothing else examined
  reports *who is currently addressing you*.
- Press/release/lock-toggle are **first-class distinct actions**, not a timing
  hack — FACT (direct: `Send talk command` takes `press`, `release`, or
  `lock-toggle`). INFERENCE: this is the correct fix for the latch problem that
  bites Green-GO, Unity and Clear-Com.
- Holding several PTT presets simultaneously addresses all their targets in
  parallel — FACT (direct).
- Ships camera tally and a `POST /cut-camera` HTTP endpoint — FACT (direct).

**WEAKNESSES**
- **Audio simply not working is a live, current complaint.** Open issue #86 "No
  receive audio" (28 Aug 2026) and open issue #82 "Bug: Failed to start the
  microphone" (27 Aug 2026) — FACT (direct). Frequency: recurring (two
  independent reports in two days), but note the project is young and moving
  fast; these may be regressions rather than chronic.
- **Behaviour on connection loss is undefined enough that a user had to ask.**
  Open issue #76, "What happens on: Connection lost?" (25 Aug 2026) — FACT
  (direct). INFERENCE: for a show-critical comms system, undocumented reconnect
  semantics is itself the defect.
- **Sessions die on server restart.** "Browser sessions are held in memory for 12
  hours and are invalidated by a server restart" — FACT (direct, verbatim
  README). And "Changing media-network, RTC-port, browser ICE or SSO environment
  settings requires a server restart" — FACT (direct, verbatim). INFERENCE: any
  network reconfiguration mid-setup logs the entire crew out.
- **SSO is partial.** "SSO applies to operator login at `/`. Feeds, Guests,
  Admin, Companion and Bridge retain their existing authentication paths" —
  FACT (direct, verbatim). And logging out of talktome does not end the upstream
  IdP session, "so a reload can sign the user in again" — FACT (direct,
  verbatim).
- **Default credentials.** First login is `admin` / `admin`, with a prompt to
  change — FACT (direct, verbatim README).
- Guest login is passwordless and held only in `sessionStorage`, so closing the
  browser clears it — FACT (direct).
- NDI HX and compressed Advanced SDK audio are not supported by the Bridge —
  FACT (direct).

**MISSING FEATURES (what users request)**
- Admin control over individual users' audio settings — open issue #80 (27 Aug
  2026) — FACT (direct).
- Recently *granted* requests, which show what the user base pushes for:
  talking to multiple conferences at once (#83, closed), remote mic kill (#81,
  closed), more channels on the NDI/OMT bridge (#28, closed), NDI audio (#26,
  closed), username/password in the URL (#29, closed) — FACT (direct).
  INFERENCE: "remote mic kill" being requested and shipped here while Eyevinn's
  equivalent (#294) is still an open backend gap is a clean side-by-side.
- Open discussion #25 (28 Jul 2026) covers a productions layer, **per-member
  mix-minus**, reverse-proxy SSO and a mobile app — FACT (direct). INFERENCE:
  per-member mix-minus is the IFB-shaped hole that Eyevinn also has.

**UX PROBLEMS**
- **Self-signed certificate warning is a documented step in the happy path.**
  Getting-started step 2 is "Accept the browser warning for the self-signed local
  certificate" — FACT (direct, verbatim README). INFERENCE: every crew member on
  every device must click through a scary security warning before they can talk;
  this is the browser-intercom tax.
- Module release notes record Companion-5 breakage: volume, mute and talk actions
  were "being skipped by Companion 5 when an unused dynamic target field
  contained an unavailable value" (fixed in v1.2.2), and target labels wrapping a
  single trailing character onto a second line (fixed in v1.2.1) — FACT (direct).

**PERFORMANCE PROBLEMS**
- **UNKNOWN.** No load, latency or participant-count data found.

**PRICING PROBLEMS**
- **Free, Apache-2.0** — FACT (direct). Self-hosting cost only. macOS/Windows
  installers and a Docker Hub image are published — FACT (direct).

**LOCK-IN**
- Very low: Apache-2.0, self-hosted, SQLite `app.db` in a documented per-OS data
  directory, documented HTTP API and a `/companion` Socket.IO namespace — FACT
  (direct).

**OFFLINE**
- LAN-first by design (mDNS hostname, configurable RTC port range, manual
  announced IP) — FACT (direct). INFERENCE: this is the most
  offline-realistic of the browser-based options, because the network parameters
  that WebRTC needs are all exposed as explicit settings rather than assumed.

**INTEGRATION PROBLEMS**
- The Bridge (NDI/OMT/audio-interface/console integration) is a **separate
  optional desktop application** — FACT (direct). INFERENCE: the server alone
  cannot reach hardware audio.

---

### Spacecommz.io

Evidence base: `companion-module-spacecommz-intercom` HELP.md and issue tracker.
spacecommz.io itself was not fetched.

- **STRENGTHS**: contributes the audio meter on listen presets showing when a
  channel has an active speaker (module v1.1) — FACT (direct, verbatim HELP.md).
- **WEAKNESSES / INTEGRATION**: **the API ships disabled by default** and must be
  turned on in the web UI under "more Settings" by clicking "API disabled" —
  FACT (direct, verbatim). INFERENCE: a hidden opt-in toggle in a settings
  sub-page is a support-ticket generator.
- **MISSING FEATURES**: a boolean "is muted" variable — open issue #15, 24 Apr
  2026 — FACT (direct). INFERENCE: mute state is currently only expressible as a
  style/feedback, not as a variable other buttons can reason about.
- **PRICING / OFFLINE / PERFORMANCE / LOCK-IN**: **UNKNOWN.** The module is at
  v1.1 with two release-note lines total — FACT (direct) — which is itself a
  maturity signal.

---

### Mumble + talkkonnect

Evidence base: `talkkonnect/talkkonnect` issue tracker (read directly).

- **STRENGTHS**: 355 stars, actively answered issues into 2026, and it does the
  thing it claims — a headless Mumble client on an SBC with GPIO PTT — FACT
  (direct).
- **WEAKNESSES — the recurring theme is that it is a hardware project, not an
  app.** Closed issues cluster on: GPIO problems on Pi (#168, May 2026),
  RESPEAKER HAT image not compatible with Respeaker V2.0 (#165, Apr 2026),
  inability to transmit audio with no debugging guidance (#166, Feb 2026), a
  panic (index out of range) on ClientStart with v2 XML on 32-bit Raspberry Pi 3
  (#159, Oct 2025), upgrade-script failures (#158, Sep 2025), Debian
  compatibility (#155/#157, Jul–Aug 2025), and plain "how to install?" (#160,
  Oct 2025) — FACT (direct). Frequency: **widespread** within this project;
  install/hardware friction is the dominant category.
- **UX PROBLEMS**: a user had to open an issue to ask whether the project is
  "meant to only run as part of a hardware stack" (#164, Feb 2026) — FACT
  (direct). INFERENCE: the positioning is unclear to newcomers.
- **MISSING FEATURES**: someone asked whether anyone runs it over 4G/5G (#163,
  May 2026) — FACT (direct). INFERENCE: mobile-network behaviour is unproven
  enough that users ask rather than read.
- **PRICING**: free / MPL-2.0 (per the landscape pass; licence **not
  re-verified** in this pass).
- **OFFLINE**: a self-hosted Mumble server on a LAN needs no internet —
  INFERENCE, well-founded but not evidenced by a page I opened here.
- **INTEGRATION**: no broadcast-intercom semantics at all — no IFB, no
  mix-minus, no partyline/conference model beyond Mumble channels — INFERENCE
  from the project's scope; **unverified against Mumble's feature list.**

---

### ODIN (4Players)

Evidence base: the 4Players GitHub organisation's repositories and the
`odin-server` issue tracker.

- **NEGATIVE FINDING, and it is the main one**: across 15 ODIN repositories, the
  open-issue counts are **0 or 1**, and `odin-server` — the on-premise server
  repo — has exactly **one** open issue, "Deploy images to a registry" (#1,
  16 Mar 2026) — FACT (direct). INFERENCE: there is essentially **no public
  community signal** for ODIN. That cuts both ways: it may mean the SDK is solid,
  or it may mean the user base is small and support happens in a closed channel.
  I cannot distinguish these from what I can reach.
- **PRICING / LICENCE / LIMITS**: **UNKNOWN.** The `odin-server` repo page I
  opened carries no licensing or limit information — FACT (direct, the fetch
  found none). To check: 4players.io pricing, which I could not reach.
- **INFERENCE (flagged)**: ODIN's `odin-tokens` repo generates Ed25519/JWT room
  tokens — FACT (direct, repo description) — so its auth model is closer to
  talktome's than to Clear-Com's admin-password model. Whether the 64-channel
  masking claim from the landscape pass holds is **unverified here.**

---

### RTS ADAM / OMNEO / Digital Partyline (Bosch/Telex)

- **The negative finding from the landscape pass is confirmed and now has a
  number.** A scoped search of the Bitfocus organisation for modules named
  `riedel`, `clearcom`, `clear-com`, `unity` or `rts` returned **8
  repositories — four Riedel, two Clear-Com, two Unity Intercom — and zero for
  RTS or Telex** — FACT (direct, GitHub repository search, 29 Aug 2026).
- **INFERENCE (flagged as inference, and I want to be careful here):** absence of
  a Companion module is evidence about *third-party controllability and community
  interest*, not about product quality. RTS ADAM is a large installed base. But
  in a segment where the working practice is "put it on a Stream Deck", having no
  module at all is a real integration gap for the people this dossier is about.
- Everything else about RTS: **UNKNOWN.** No RTS/Telex/Bosch page was reachable.

---

### ProdLink Comms and VORTEX Intercom

- **No new evidence.** Neither product has a Bitfocus Companion module in the
  organisation, neither appeared in any GitHub search, and their own sites were
  not reachable. VORTEX was described in the landscape pass as a **closed
  TestFlight beta**, which independently explains the silence.
- **UNKNOWN.** To check: the ProdLink TCP 3200 protocol documentation, and
  VORTEX's TestFlight release notes — both require access I do not have.

---

## Cross-product patterns

These are the complaints that repeat across **multiple independent vendors**.
They are the most valuable output of this pass.

### 1. Talk keys latch when driven remotely — WIDESPREAD, and it is the worst one

The same defect class appears in three independent products, from three
countries, on three different transports:

- **Green-GO**: momentary-configured channel behaves as latched via OSC; device
  reports state `2` (latched) where a physical PTT gives `3`. Open since Sep 2024
  (issue #10, direct).
- **Unity Intercom**: "every API request requires both a 'keydown' and 'keyup'
  command to be sent, or the Unity client will stay in a latched state" (HELP.md,
  direct, verbatim), with a real-world instance in closed issue #8, "RELEASE of
  'All Page' button doesn't always release".
- **Clear-Com Station-IC**: latch vs momentary is reconstructed client-side from
  a 200 ms hold timer (HELP.md, direct, verbatim).

**Why it matters more than it looks:** a latched talk key is a hot mic on the
whole partyline. It is the highest-consequence failure in crew comms, and three
vendors have shipped control APIs where the *default* failure mode is latched-on.

**The counter-example proves it is solvable:** talktome models `press`,
`release` and `lock-toggle` as three distinct first-class actions with an
explicit `user talk lock` feedback (direct, verbatim). No timer, no pairing
contract, no latch-on-packet-loss.

### 2. Control APIs are write-mostly; state feedback is the thing that breaks — WIDESPREAD

Independent reports across four vendors:

- **Green-GO** #16 (Jan 2026): full control works, feedback doesn't appear.
  #14 (Sep 2025): level main, level pgm, audio gain, audio source all read 0
  permanently while channel variables work.
- **Unity Intercom** #1 (Apr 2021): cannot get feedback on pressed buttons.
  #19 (Aug 2026): feedback broke again after a Companion upgrade.
- **Riedel Mediornet** #13 (closed Mar 2024): connection-status variable does not
  update when the network drops. #8: crosspoint-change feedback issue.
- **Riedel SmartPanel** #12 (Mar 2026): five device-telemetry variables fail to
  populate on a specific firmware.

**INFERENCE:** vendors build the command path first and treat state reporting as
an afterthought. Operators then build control surfaces that lie to them — the
button says "talking" when the device is not, or vice versa. In a live show that
is worse than no feedback at all.

### 3. Hard, arbitrary channel/scope ceilings that users hit immediately — RECURRING

- **Green-GO**: six channels, maximum, because of "limitations in the scripting
  VM present on current Green-GO devices" (direct, verbatim). A user who talks to
  "more than 20 people each at a time" filed to ask for 32 (issue #7, open since
  Aug 2024).
- **Eyevinn**: Companion addressing covers "Call 1–8" in HELP.md (Call 1–20 in
  the README — the docs disagree), and calls are addressed by **index**, so the
  mapping breaks when lines are reordered.
- **Unity Intercom**: the addressable button count is whatever a Stream Deck grid
  geometry yields — a Stream Deck + is 2x4.
- **talktome**: a closed request for "More channels on (NDI/OMT) Bridge" (#28).

**INFERENCE:** the ceilings come from implementation accidents (a scripting VM,
a physical panel geometry, an array index) rather than from a comms model. That
is precisely the kind of constraint a planning tool can surface *before* someone
buys.

### 4. Wireless is the part that breaks, and it is the part you cannot control — RECURRING

- **Green-GO**: DECT connections drop randomly on antennas and beltpacks and need
  a power cycle (D#659); special channels don't always work on wireless devices
  (D#922); wireless beltpacks get wrong names on an antenna (D#317); "phantom
  connections" needed an antenna firmware fix. **And separately**, the OSC remote
  explicitly "can't support Green-GO WAA antennas or WBPX(SP) belt packs".
- **Clear-Com**: HelixNet beltpacks with certain U-Boot versions could get their
  config filesystem corrupted and needed a USB recovery; audio artifacts to
  FreeSpeak beltpacks after extended runtime.

**INFERENCE:** the wireless estate is simultaneously the least reliable and the
least remotely observable part of every wireless intercom system. Nobody in this
segment gives you a remote view of beltpack health that you can put on a wall.

### 5. Authentication ranges from excellent to absent, with no middle — RECURRING

Ranked from what I read:

- **talktome**: API key *or* user login, with server-returned per-account scope
  determining what the controller can even see (direct, verbatim). Plus
  reverse-proxy SSO. Best in segment.
- **ODIN**: signed Ed25519/JWT room tokens (direct, repo description).
- **Clear-Com Station-IC**: a per-install Remote API key, copied from the client's
  settings (direct).
- **Clear-Com REST (Arcadia/Edge)**: **the box's admin password** (direct,
  verbatim). Full admin credentials handed to every integration.
- **Eyevinn intercom-manager**: **no built-in authentication at all**, delegated
  to the deployment environment; the bearer token covers only WHIP/WHEP ingest
  (direct, verbatim README).

**INFERENCE:** the two ends of this range are one segment apart in maturity. A
broadcaster's security review will fail both ends for opposite reasons.

### 6. Browser-based intercoms all pay the HTTPS/certificate tax — RECURRING

- **talktome**: "Accept the browser warning for the self-signed local
  certificate" is *step 2 of getting started* (direct, verbatim).
- **Eyevinn**: the Companion module's only open issue is `Uncaught DOMException:
  The operation is insecure.` (#4) — a secure-context failure.
- **The user's own `broadcast-intercom`**: its README documents installing
  `mkcert` and generating a local CA because HTTPS is "needed for microphone
  access from other devices on the LAN" (direct).

**INFERENCE:** `getUserMedia` requires a secure context, so every LAN-hosted
browser intercom must either ship a real certificate or teach every crew member
to click through a security warning on their own phone, in a hurry, before a
show. This is a solved problem (mkcert, an internal CA, or a real cert on an
mDNS name) that nobody in this segment has packaged well.

### 7. Programme audio and IFB/mix-minus are the missing half of every software intercom — RECURRING

- **Eyevinn**: the entire ingest/I-O workstream — add, edit, remove, label and
  monitor external inputs on a program line, and then "Test IFB after Ingest
  Input Implementation" — has been open since **June 2025** and is still open
  (10 issues, direct).
- **talktome**: per-member mix-minus is a July 2026 open discussion item (#25),
  not a shipped feature.
- **Green-GO**: known issue D#923, local IFB dimming does not work on interfaces.
- **Clear-Com**: shipped IFB into Arcadia only at firmware 4.1, presented as a
  headline feature — i.e. its own flagship compact matrix lacked it until
  recently.

**INFERENCE:** talk-to-each-other is the easy 80%; carrying programme audio and
interrupting it for talent is the part that separates a broadcast intercom from a
group call, and it is unfinished almost everywhere outside the big matrices.

### 8. Offline/pre-programming is retrofitted, never designed in — RECURRING

- **Riedel RRCS**: address dropdowns "only populate when online"; logic sources
  "can not be configured offline" (direct, verbatim).
- **Clear-Com REST**: "Ability to work offline" appears as a **changelog line**
  at version 0.3.2 (direct, verbatim) — it was not there at launch.
- **Eyevinn**: hardcoded Google STUN servers (#626, open) on an air-gapped
  network.
- **Green-GO** is the honourable exception: the control script is saved to the
  devices so they work "without the software running in the background" (direct,
  verbatim).

**INFERENCE — and this is the pattern most directly relevant to a planning
product:** the industry assumes you configure comms with the system in front of
you and powered on. Everyone who has ever prepped a show in an office the week
before knows that assumption is wrong.

### 9. Firmware-version fragility, undocumented — RECURRING

- **Riedel SmartPanel** #12 is literally titled "[BUG]
  Incompatibilities/which firmware version exactly was it tested on?" — variables
  failed on RSP-1216HL firmware 2.0.0-82 (direct).
- **Green-GO**: OSC needs firmware ≥ v5.0.3.0255 (direct).
- **Clear-Com**: the Station-IC remote API needs client ≥ 1.6 (direct); the
  HelixNet corruption bug is scoped to U-Boot 1.0.34–1.0.37 (search extract).
- **Riedel RRCS**: functions that fail specifically against Artist-1024 frames
  (direct, verbatim).

**INFERENCE:** "which firmware do I need for this to work?" has no answerable
form in this segment. A rental house with mixed-vintage stock cannot know from a
spec sheet whether a given control feature will work on a given box.

### 10. The third-party integration ecosystem is one person deep — RECURRING

- `jlommori/riedel_rrcs`, the only independent RRCS client: 13 stars, 2 issues
  open **since February 2020** (direct).
- Riedel Mediornet feature requests open for 1–3 years: destination lock "ON
  HALT" since Jun 2023, source/target grouping since Apr 2024 (direct).
- Unity Intercom issue #10, open since Feb 2024 (direct).
- ODIN: essentially zero public issue activity across 15 repos (direct).

**INFERENCE:** if your workflow depends on an intercom's control API, you are
depending on a hobby project or on nothing.

---

## Direct quotes-of-substance

All paraphrased or quoted from pages I opened directly, unless marked
`(search extract)`. Quotation marks indicate wording read verbatim on the page.

1. **Green-GO's channel ceiling is a platform limit, not a module choice.**
   "Because of limitations in the scripting VM present on current Green-GO
   devices, this Companion module enables you to remotely control a maximum of 6
   channels (channels 1 - 6)."
   — `https://raw.githubusercontent.com/bitfocus/companion-module-greengo-intercom/master/companion/HELP.md`, read 2026-08-29.

2. **Green-GO's wireless kit is outside the control API entirely.**
   "we currently can't support Green-GO WAA antennas or WBPX(SP) belt packs as
   can't control those devices via OSC."
   — same file, read 2026-08-29.

3. **A Green-GO user hit the six-channel wall in the field.** The reporter runs
   events talking to more than 20 people at a time, found that only the first six
   channels could get shortcuts, and asked whether it could be expanded to 32.
   Opened 6 Aug 2024, still open.
   — `https://github.com/bitfocus/companion-module-greengo-intercom/issues/7`, read 2026-08-29.

4. **Green-GO momentary talk latches when driven remotely.** A channel configured
   as momentary behaves as latched; the device reports state `3` for a physical
   PTT press but state `2` (latched) when driven from Companion. Opened 16 Sep
   2024, still open.
   — `https://github.com/bitfocus/companion-module-greengo-intercom/issues/10`, read 2026-08-29.

5. **Green-GO state feedback goes silent while control keeps working.** The
   reporter has "full control of the device, but the feedback doesn't show up in
   companion", and asks whether OSC send and receive share a port. Environment:
   Companion 4.2.3, module 1.0.2, Green-GO software 5.2.1, BPX. Opened 20 Jan
   2026, still open.
   — `https://github.com/bitfocus/companion-module-greengo-intercom/issues/16`, read 2026-08-29.

6. **Green-GO's non-channel variables read zero permanently.** "Variables related
   to channels are working fine, but variables such as level main, level pgm,
   audio gain, audio source etc. are showing 0 all the time." Opened 4 Sep 2025,
   still open.
   — `https://github.com/bitfocus/companion-module-greengo-intercom/issues/14`, read 2026-08-29.

7. **Unity Intercom's API will leave a mic open if one packet is lost.** "every
   API request requires both a 'keydown' and 'keyup' command to be sent, or the
   Unity client will stay in a latched state."
   — `https://raw.githubusercontent.com/bitfocus/companion-module-audivero-unityintercom-client/main/companion/HELP.md`, read 2026-08-29.

8. **Unity Intercom's control API cannot describe itself.** "In order to know
   what the button actually does, check the assignment for that button number in
   the Unity User Interface."
   — same file, read 2026-08-29.

9. **Unity Intercom's addressing is a physical panel geometry.** The surface
   model "controls which Stream Deck model the module reports itself as. The
   Unity client builds its panel configuration screen from this, and calculates
   button numbers from the model's grid, so it must match the layout you want."
   — same file, read 2026-08-29.

10. **A Unity Intercom control surface dies on a group switch and needs a manual
    reconnect.** After a button switches talk/listen groups, the change takes
    effect in Unity but "no other buttons on the stream deck will operate unity
    any longer until I go into bitfocus and disconnect/reconnect". Companion
    3.3.0, macOS 14.1.2, Unity Client 3.0.26. Opened 8 Feb 2024, **still open**.
    — `https://github.com/bitfocus/companion-module-audivero-unityintercom-client/issues/10`, read 2026-08-29.

11. **Riedel RRCS capability depends on which frame the port lands on.**
    "Crosspoint - Set Volume … Does not work when destination port is connected
    to an Artist-1024" and "GP Input Feedback … Does not work with panels
    connected to an Artist-1024".
    — `https://raw.githubusercontent.com/bitfocus/companion-module-riedel-rrcs/main/companion/HELP.md`, read 2026-08-29.

12. **Riedel RRCS forces a full refetch on any config change.** "Performs all Get
    All actions when RRCS reports a configuration change. This keeps dropdowns and
    feedbacks accurate, however may prove excessively burdensome in large, busy
    networks."
    — same file, read 2026-08-29.

13. **Riedel RRCS cannot be fully pre-programmed offline.** "Logic Source: Action
    & Feedback only available when RRCS has reported configured logic sources;
    can not be configured offline." The address dropdowns likewise "only populate
    when online".
    — same file, read 2026-08-29.

14. **Riedel and its own config tool disagree on numbering.** "RRCS uses 0-based
    numbering for Port and GPIO numbers, however this module converts them to
    1-based numbering for consistency with Director, however internal logs are
    0-based."
    — same file, read 2026-08-29.

15. **Clear-Com's REST integration authenticates with the matrix's admin
    password.** The documented setup is to note the master station's IP and Admin
    password and enter both into the module config. There is no API key or scoped
    token.
    — `https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-rest/main/companion/HELP.md`, read 2026-08-29.

16. **The Clear-Com REST API contained endpoints that do nothing.** Module
    release 0.4.5: "Removed commands that don't perform a useful function".
    Release 0.3.2 adds "Ability to work offline" — i.e. offline was retrofitted.
    — `https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-rest/main/README.md`, read 2026-08-29.

17. **Clear-Com's talk-key semantics are reconstructed from a 200 ms timer.**
    "Example is a Talk button where there is a latched action when pressed and a
    second non-latching action if held for longer than 200 ms."
    — `https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-station-ic/main/companion/HELP.md`, read 2026-08-29.

18. **Clear-Com's own release notes record runtime-dependent audio artifacts.**
    After extended runtime, audio artifacts could be heard from HelixNet channels
    to FreeSpeak beltpacks, the Arcadia front panel and interfaces; and HelixNet
    HXII-BP packs on U-Boot 1.0.34–1.0.37 whose config filesystem became corrupted
    "could not recover automatically without a USB upgrade".
    — *(search extract)* of `https://clearcom.com/downloadcenter/software-firmware/Arcadiav4.0.83.11/Arcadia_Central_Station_R4.0.0_ReleaseNote-PUB-00108N.pdf`, extracted 2026-08-29. clearcom.com was not directly reachable.

19. **Eyevinn Open Intercom ships with no authentication.** The service
    "intentionally lacks built-in authentication, delegating that responsibility
    to the deployment environment"; the `WHIP_AUTH_KEY` bearer token protects only
    the WHIP/WHEP ingest endpoints, not general API access.
    — `https://github.com/Eyevinn/intercom-manager`, read 2026-08-29.

20. **Eyevinn Open Intercom cannot remove a participant.** "the 'kick user'
    feature needs a backend capability that does not exist today (only remote-mute
    exists)". Opened 26 Aug 2026, open.
    — `https://github.com/Eyevinn/intercom-manager/issues/294`, read 2026-08-29.

21. **Eyevinn's entire programme-audio ingest workstream has been open for 14
    months.** Ten issues covering adding, editing, removing, labelling and
    monitoring ingest inputs on a program line — and testing IFB once ingest
    exists — were all opened 3–23 June 2025 and were all still open on
    2026-08-29 (#460, #461, #463, #464, #465, #466, #467, #468, #480, #487).
    Role management (#469) is open from the same date.
    — `https://github.com/Eyevinn/intercom-frontend/issues`, read 2026-08-29.

22. **Green-GO tracks real wireless defects publicly.** D#659: wireless antenna
    or wireless beltpack randomly dropping DECT connections, requiring a power
    cycle to recover. D#922: special channels do not always work on wireless
    devices. D#317: wireless beltpacks don't get correct names when connected to
    an antenna. D#923: local IFB dimming does not work on interfaces. D#917:
    MCX/MCXD devices hang when updated from Green-GO Control unless started in
    Boot Mode first.
    — *(search extract)* of `https://manual.greengoconnect.com/en/known-issues/`, extracted 2026-08-29. The page was not directly reachable.

23. **talktome's happy path includes clicking through a certificate warning.**
    Getting-started step 2: "Accept the browser warning for the self-signed local
    certificate." First login is `admin`/`admin`.
    — `https://raw.githubusercontent.com/thepoison606/talktome/main/README.md`, read 2026-08-29.

24. **talktome logs everyone out on a server restart.** "Browser sessions are held
    in memory for 12 hours and are invalidated by a server restart", and changing
    media-network, RTC-port, browser ICE or SSO settings "requires a server
    restart". SSO covers operator login only — "Feeds, Guests, Admin, Companion
    and Bridge retain their existing authentication paths".
    — same file, read 2026-08-29.

25. **talktome's scope-based auth is the segment's best, and it is documented.**
    "In `User login` mode, the visible users and generated presets depend on the
    scope returned by the talktome server for that account." Talk is modelled as
    three explicit actions — `press`, `release`, `lock-toggle` — not a timer.
    — `https://raw.githubusercontent.com/bitfocus/companion-module-talktome-intercom/main/companion/HELP.md`, read 2026-08-29.

26. **Spacecommz ships its API switched off.** To connect Companion you must open
    the web UI, go to "more Settings", and click "API disabled" to enable it.
    — `https://raw.githubusercontent.com/bitfocus/companion-module-spacecommz-intercom/main/companion/HELP.md`, read 2026-08-29.

27. **talkkonnect's dominant complaint category is getting it installed on the
    hardware at all.** GPIO problems on Pi (#168), RESPEAKER HAT image not
    compatible with Respeaker V2.0 (#165), unable to transmit audio with no
    debugging guidance (#166), index-out-of-range panic on 32-bit Raspberry Pi 3
    (#159), upgrade-script failures (#158), Debian compatibility (#155, #157), and
    "how to install?" (#160) — all 2025–2026.
    — `https://github.com/talkkonnect/talkkonnect/issues`, read 2026-08-29.

28. **No Bitfocus Companion module exists for RTS or Telex.** A scoped search of
    the Bitfocus organisation for module repositories named `riedel`, `clearcom`,
    `clear-com`, `unity` or `rts` returned 8 repositories: four Riedel
    (rrcs, mediornet, smartpanel, medianetworks), two Clear-Com (station-ic,
    rest) and two Unity Intercom (client, server). Zero RTS. Zero Telex.
    — GitHub repository search, `org:bitfocus`, run 2026-08-29.

---

## What users say they WANT (feature requests, collected)

Recorded separately because the brief asks for it and because requests are a
cleaner signal than complaints.

| Want | Product | Status as of 2026-08-29 | Source |
|---|---|---|---|
| More than 6 remote-controllable channels (asked for 32) | Green-GO | Open since Aug 2024 | greengo module #7 |
| Headset bias + screen flip as remote actions | Green-GO | Open since Mar 2024 | greengo module #3 |
| Kick / force-disconnect a participant | Eyevinn | Open, backend capability does not exist | intercom-manager #294 |
| Global mute across all participants | Eyevinn | Open Aug 2026 | intercom-frontend #676, #678 |
| A defined admin-mute vs self-mute state model | Eyevinn | Open Aug 2026 | intercom-frontend #677 |
| Roles / role management | Eyevinn | Open since Jun 2025 | intercom-frontend #469 |
| Ingest external audio onto a program line (+ IFB) | Eyevinn | 10 issues open since Jun 2025 | intercom-frontend #460–#487 |
| Saving a call configuration between shows | Eyevinn | Label exists; no shipped feature found | intercom-frontend labels |
| Admin control of individual users' audio settings | talktome | Open Aug 2026 | talktome #80 |
| Per-member mix-minus | talktome | Open discussion Jul 2026 | talktome #25 |
| Talk to multiple conferences simultaneously | talktome | Shipped (closed Aug 2026) | talktome #83 |
| Remote mic kill | talktome | Shipped (closed Aug 2026) | talktome #81 |
| A boolean "is muted" variable | Spacecommz | Open Apr 2026 | spacecommz module #15 |
| Snapshot save/recall of routing state | Riedel Mediornet | Open since Jan 2026 | mediornet #24 |
| Group sources and targets together | Riedel Mediornet | Open since Apr 2024 | mediornet #17 |
| Lock a destination against change | Riedel Mediornet | "ON HALT" since Jun 2023 | mediornet #5 |
| Bonjour discovery across multiple interfaces | Riedel SmartPanel | Open May 2026 | smartpanel #22 |
| Documented firmware compatibility | Riedel SmartPanel | Raised Mar 2026 | smartpanel #12 |

---

## Gaps in this dossier — what a second pass must do

Stated so nobody mistakes silence for absence:

1. **Reddit, G2, Capterra, Trustpilot, ProSoundWeb, Blue Room, ControlBooth, and
   all German-language sources were unreachable.** End-user sentiment, purchasing
   experience, dealer/support quality and rental-house field experience are
   **entirely unrepresented**.
2. **No price in this segment was verified.** Not one. Every pricing line above
   says UNKNOWN and means it.
3. **Hardware RF and audio-quality behaviour is only lightly evidenced** — one
   Clear-Com release-note extract and five Green-GO defect IDs, both via search
   extract rather than direct read. Bolero, FreeSpeak Edge and RTS have no
   field evidence here at all.
4. **The Clear-Com Solution Finder wiki (`clear-com.atlassian.net`) is the single
   highest-value blocked source** — it is Clear-Com's public technical knowledge
   base and would settle most of the UNKNOWNs in that section.
5. **Riedel RRCS's actual API reference was never read** — only a third-party
   integrator's notes about it. The limitations recorded here are the ones an
   integrator hit, not necessarily the full set.
6. To fix: rerun with egress permitted for reddit.com, the review sites, the
   vendor domains and `manual.greengoconnect.com`, and with web-search budget
   available at the start of the pass rather than exhausted.

---

## Sources

Every URL below was opened and read in this pass unless marked
*(search extract)*, which means the search tool read the page and quoted it back
and I could not open it directly. All accessed 2026-08-29.

**GitHub — issue trackers (direct)**
1. https://github.com/bitfocus/companion-module-greengo-intercom/issues
2. https://github.com/bitfocus/companion-module-greengo-intercom/issues/7
3. https://github.com/bitfocus/companion-module-greengo-intercom/issues/10
4. https://github.com/bitfocus/companion-module-greengo-intercom/issues/14
5. https://github.com/bitfocus/companion-module-greengo-intercom/issues/16
6. https://github.com/bitfocus/companion-module-riedel-rrcs/issues
7. https://github.com/bitfocus/companion-module-riedel-rrcs/releases
8. https://github.com/bitfocus/companion-module-riedel-smartpanel/issues
9. https://github.com/bitfocus/companion-module-riedel-smartpanel/issues/12
10. https://github.com/bitfocus/companion-module-riedel-mediornet/issues
11. https://github.com/bitfocus/companion-module-clearcom-rest/issues
12. https://github.com/bitfocus/companion-module-clearcom-station-ic/issues?q=is%3Aissue+is%3Aclosed
13. https://github.com/bitfocus/companion-module-audivero-unityintercom-client/issues
14. https://github.com/bitfocus/companion-module-audivero-unityintercom-client/issues/1
15. https://github.com/bitfocus/companion-module-audivero-unityintercom-client/issues/10
16. https://github.com/bitfocus/companion-module-eyevinn-intercom/issues
17. https://github.com/bitfocus/companion-module-spacecommz-intercom/issues
18. https://github.com/jlommori/riedel_rrcs/issues
19. https://github.com/Eyevinn/intercom-manager/issues
20. https://github.com/Eyevinn/intercom-manager/issues/294
21. https://github.com/Eyevinn/intercom-frontend/issues
22. https://github.com/Eyevinn/intercom-frontend/issues?q=is%3Aissue+label%3Abug
23. https://github.com/Eyevinn/intercom-frontend/issues (filtered by labels "role management", "saving call configuration", "customer request", "I/O")
24. https://github.com/Eyevinn/intercom-frontend/labels
25. https://github.com/talkkonnect/talkkonnect/issues
26. https://github.com/4Players/odin-server/issues
27. https://github.com/thepoison606/talktome/issues

**GitHub — repository pages and READMEs (direct)**
28. https://github.com/Eyevinn/intercom-manager
29. https://github.com/thepoison606/talktome
30. https://raw.githubusercontent.com/Eyevinn/intercom-frontend/main/README.md
31. https://raw.githubusercontent.com/thepoison606/talktome/main/README.md
32. https://raw.githubusercontent.com/jlommori/riedel_rrcs/master/README.md

**GitHub — integrator documentation read verbatim (direct)**
33. https://raw.githubusercontent.com/bitfocus/companion-module-riedel-rrcs/main/companion/HELP.md
34. https://raw.githubusercontent.com/bitfocus/companion-module-greengo-intercom/master/companion/HELP.md
35. https://raw.githubusercontent.com/bitfocus/companion-module-greengo-intercom/master/osc-remote.gg5t
36. https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-rest/main/companion/HELP.md
37. https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-rest/main/README.md
38. https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-station-ic/main/companion/HELP.md
39. https://raw.githubusercontent.com/bitfocus/companion-module-audivero-unityintercom-client/main/companion/HELP.md
40. https://raw.githubusercontent.com/bitfocus/companion-module-talktome-intercom/main/companion/HELP.md
41. https://raw.githubusercontent.com/bitfocus/companion-module-talktome-intercom/main/README.md
42. https://raw.githubusercontent.com/bitfocus/companion-module-eyevinn-intercom/main/companion/HELP.md
43. https://raw.githubusercontent.com/bitfocus/companion-module-eyevinn-intercom/main/README.md
44. https://raw.githubusercontent.com/bitfocus/companion-module-spacecommz-intercom/main/companion/HELP.md

**GitHub — searches run (direct)**
45. GitHub repository search, `org:bitfocus riedel OR clearcom OR "clear-com" OR unity OR rts in:name` — 8 results, zero RTS/Telex.
46. GitHub repository search, `org:bitfocus companion-module intercom in:name` — 4 results.
47. GitHub repository search, `odin 4players voice OR "symphony media bridge" OR "station-ic"` — 36 results, ODIN repos have 0–1 open issues each.

**Search-engine page extracts (page not directly reachable)**
48. https://manual.greengoconnect.com/en/known-issues/ *(search extract)* — Green-GO tracked defects D#317, D#659, D#917, D#922, D#923.
49. https://clearcom.com/downloadcenter/software-firmware/Arcadiav4.0.83.11/Arcadia_Central_Station_R4.0.0_ReleaseNote-PUB-00108N.pdf *(search extract)* — Arcadia R4 release notes: runtime audio artifacts, HelixNet U-Boot config-filesystem corruption requiring USB recovery.
50. https://manual.greengoconnect.com/en/release-notes/firmware/ *(search extract)* — antenna fix for "phantom connection" on pool change; software v5.2.1.
51. https://www.tpimagazine.com/clear-com-issues-updates-to-arcadia-and-eclipse-hx/ *(search extract)* — Arcadia firmware 4.1 adds IFB and AES67 for up to 32 additional panels.

**Context (direct, not evidence about third-party products)**
52. https://github.com/larszu/broadcast-intercom — the user's own in-progress product, read to ground the opportunity analysis.

**Confirmed blocked and therefore NOT consulted** (listed so the gap is
auditable): reddit.com, old.reddit.com, g2.com, capterra.com, trustpilot.com,
clearcom.com, clear-com.atlassian.net, riedel.net, green-go.eu,
manual.greengoconnect.com, eyevinn.se, unityintercom.com, bitfocus.io,
forums.prosoundweb.com, blue-room.org.uk, controlbooth.com, avforums.com,
forum.blackmagicdesign.com, film-tv-video.de, production-partner.de.
