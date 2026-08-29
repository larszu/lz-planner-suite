# Pain points: Live Video Production / Switching / Streaming / Signal Monitoring

Research date: 2026-08-29 (brief dated 2026-08-28).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Language of corpus: English (repo docs mix DE/EN; research corpus stays EN).

---

## Method

### Read this first — the method was severely constrained

Two hard limits shaped what could be evidenced in this pass. Stating them plainly,
because they determine how much weight each section below can carry.

1. **The session's web-search budget was exhausted before this pass started**
   (200 of 200 `WebSearch` calls consumed by earlier segment passes in the same
   session). **Zero search-engine queries completed.** The brief asked for 8–15
   distinct searches across Reddit, review sites, professional forums and German
   trade press. That instruction is **unexecuted as written**. It was partially
   compensated by using GitHub's own issue-search surfaces (16 distinct
   repository-scoped semantic issue searches plus 11 GitHub HTML search queries,
   all listed in Sources), which is a real search surface but only over GitHub.

2. **Network egress policy blocked every non-GitHub source that was tried.**
   Confirmed blocked at the proxy during this pass (HTTP 000 / `EGRESS_BLOCKED` /
   explicit fetch refusal), each probed directly:
   `obsproject.com`, `discourse.obsproject.com`, `ideas.vmix.com`,
   `forums.vmix.com`, `www.vmix.com`, `docs.vmix.com`, `kb.vmix.com`,
   `forum.blackmagicdesign.com`, `bitfocus.io`, `www.reddit.com`,
   `old.reddit.com`, `news.ycombinator.com`, `stackoverflow.com`,
   `superuser.com`, `www.g2.com`, `www.capterra.com`, `www.trustradius.com`,
   `openmediatransport.org`, `www.vizrt.com`, `www.lawo.com`,
   `www.rohde-schwarz.com`, `pro-av.panasonic.net`, `www.controlbooth.com`,
   `blue-room.org.uk`, `www.film-tv-video.de`, `www.production-partner.de`.
   **Reachable and used: `github.com` (HTML pages via WebFetch),
   `raw.githubusercontent.com` (raw files via curl), and an MCP GitHub
   issue-search endpoint that works against arbitrary public repositories.**
   The GitHub REST API via curl is refused (this session is scoped to eight
   `larszu/*` repositories); `github.com/search` HTML began returning HTTP 429
   with `Retry-After: 3600` partway through the pass, after which only
   repository landing pages, issue pages and the MCP search endpoint remained.

**Consequence, stated plainly.** This dossier is strong on open-source switching
software, control-protocol and integration pain, and on what breaks when third
parties try to drive commercial switchers. It is **near-silent on subjective UX
sentiment, on purchasing and pricing experience, and on the broadcast-tier
products that have no public issue tracker at all** (Sony M2L-X, Lawo vm_dmv /
VSM, R&S PRISMON, and mimoLive). Do not read the absence of complaints about,
say, PRISMON's fleet control centre as evidence that none exist — it is evidence
that I could not reach the places where such complaints are written. Every such
product below is marked accordingly.

The German-language angle (film-tv-video.de, production-partner.de,
Veranstaltungstechnik forums) is **entirely unexecuted** — those domains are
outside the reachable set and no search engine was available to surface them.

**Pricing: nothing was re-verified today.** Every vendor pricing page in this
segment is on a blocked domain. Prices quoted in the landscape pass (TriCaster
Vectar USD 1,260/month MSRP; mimoLive GBP 159/569/1,639 per year; ATEM Mini
Extreme ISO G2 US$1,995) are **carried over unverified** and are flagged as such
wherever they appear. Treat them as "as recorded in the landscape pass, not
re-checked 2026-08-29".

### What was actually read

**48 distinct sources opened and read first-hand**, none of them search-engine
snippets:

- **25 GitHub HTML pages** opened via WebFetch — 11 issue/repository search
  result pages, 6 individual issue pages, 4 repository or organisation landing
  pages, 2 repository issue-list pages, 2 that returned zero results or 429.
- **6 raw primary documents** fetched via `raw.githubusercontent.com` — the
  Companion HELP files for the Videohub, vMix and ATEM modules; the TriCaster
  module HELP; the DistroAV README; the Open Media Transport organisation README
  (read in full, ~11 KB, including the bandwidth table and the
  networking/firewall section).
- **16 repository-scoped semantic issue searches** via the MCP GitHub search
  endpoint, returning issue bodies verbatim — across `obsproject/obs-studio`,
  `obsproject/obs-websocket`, `bitfocus/companion`,
  `bitfocus/companion-module-bmd-atem`,
  `bitfocus/companion-module-studiocoast-vmix`,
  `bitfocus/companion-module-bmd-videohub`,
  `bitfocus/companion-module-panasonic-kairos`,
  `bitfocus/companion-module-newtek-tricaster`,
  `bitfocus/companion-module-requests`, `DistroAV/DistroAV`,
  `openmediatransport/omtplugin`.
- **1 large saved result set** (388 matching OBS issues on the
  "update broke it / crash" theme) read from disk and tabulated.

**A note on GitHub issue comments.** GitHub no longer server-renders issue
comment threads into the initial HTML, and the comment-reading MCP method is
repository-scoped to this session's own repos. **I could therefore read issue
titles, labels, reaction counts, comment counts and issue bodies, but not the
comment threads.** Where a thread's comment count is cited below as evidence of
intensity, that is what it is — a count, not content I read. Where I paraphrase
substance, it comes from an issue body or a primary doc I read in full.

### Confidence key used throughout

- **FACT** — read on a page I opened; URL cited.
- **INFERENCE** — my reasoning from those facts, labelled as such.
- **UNKNOWN** — could not verify; what would be needed is stated.

---

## Per-product findings

### OBS Studio (OBS Project, community, GPL-2.0)

Evidence base: strong. `obsproject/obs-studio` had **800 open issues** at the
time of reading (2026-08-29), and 388 issues matched a single "crashes / broke
after update" search.

**STRENGTHS (what even critics concede)**

- FACT: The complaint corpus is overwhelmingly about *edges* — a specific
  encoder, a specific OS version, a specific capture path — not about the core
  compositor or the scene model. Across the top-25 open issues by reaction count,
  none disputes that scene/source compositing, encoding and streaming work.
- FACT: The project accepts and keeps open long-lived bug reports rather than
  closing them as stale — #4531 has been open since 2021-04-14 and #3929 since
  2020-12-18. INFERENCE: that is a maintenance-honesty signal, not a defect.
- FACT: obs-websocket is a genuinely versioned, negotiated control API (see the
  next section). Nothing else free in this segment has one.

**WEAKNESSES**

- FACT — **the highest-signal open bug is an audio-sync bug that has been open
  for five years.** #4531 "Audio Monitoring Buffer Buildup / Offsync", opened
  2021-04-14, 60 reactions, still open. The monitoring path accumulates buffer
  over time so that what the operator hears drifts away from what is streamed;
  the stream itself stays in sync. Reported workarounds in the issue body are
  toggling source visibility to flush the buffer, or chaining two Move Source
  filters to disable/re-enable the mic on a 60-second cycle. The reporter's own
  suggested fix (watch buffer size against bitrate, or rebuild the buffer
  periodically) has not been implemented.
  <https://github.com/obsproject/obs-studio/issues/4531>
- FACT — **the virtual camera collides with other software that owns the same
  Linux device.** #3929 "v4l2 Virtual camera — Loopback device conflicts
  (including droidcam)", opened 2020-12-18, 50 reactions, open.
- FACT — **Wayland is a standing crash surface.** #11022 "OBS crashes with
  explicit sync on wayland", opened 2024-07-23, 29 reactions (20 thumbs-up),
  open. Related: #10011, OBS does not exit cleanly on SIGTERM, producing the Safe
  Mode prompt after a Linux reboot — open since 2023-12-17.
- FACT — **macOS screen capture degrades or freezes over long sessions.** #9056
  "MacOS version screen capture freezing after a few hours" (2023-06-10, open);
  #10636 "macOS Screen Capture performance degradation in macOS Sonoma"
  (2024-05-03, 19 reactions, open); #12935 "Metal — Preview window drops to
  single digit framerates + OBS eventually crashes" (2025-12-20, open).
- FACT — **"the new version broke it" is the single largest theme.** A search
  for crash/incompatibility-after-update returned **388 matching issues**. The
  most-discussed include #10381 "Virtual Camera does not start on macOS in OBS
  30.1.0 after updating OBS" (35 comments, open since 2024-03-15), #10988 "OBS
  is not working anymore with new version, Vcredist… bug" (34 comments), #11029
  "OBS is double loading every built-in plugin and then crashing with double free
  on exit" (23 comments), and #12829 "Startup crash in qwindows.dll on Windows 11
  24H2 with OBS 32.0.2 and 31.x portable; OBS 27 works" (25 comments, 2025-11-17).

**MISSING FEATURES (what users request)**

- FACT: **A vertical/second canvas that behaves consistently.** #10263 asked for
  the macOS virtual camera to follow a 9:16 canvas instead of a hardcoded
  1920×1080 device; a maintainer is quoted in the body explaining the resolution
  is hardcoded because exposing multiple resolutions to the macOS subsystem was
  not solved. The reporter says they reverted to OBS 29, "which breaks my
  projects due to plugin updates". <https://github.com/obsproject/obs-studio/issues/10263>
- FACT: Multi-canvas handling is still fragile in current builds — #13613
  (2026-06-30) reports the selected Additional Canvas silently disappearing from
  the Enhanced Broadcasting go-live payload after any output-resolution change,
  until restart.
- FACT: Encoder recovery — #13670 "AMD encoder overload cannot be recovered"
  (2026-07-19, open); #9946 "Deadlock if encounter encoder error" (open since
  2023-12-01).
- UNKNOWN: OBS's actual feature-request forum is `ideas.obsproject.com`, which
  is blocked. The `Enhancement` label search on the bug tracker returned **zero**
  results, confirming feature requests do not live there. **The single richest
  source of "what OBS users want" was unreachable in this pass.**

**UX PROBLEMS**

- FACT: Resolution handling produces silently wrong results. #13835 (2026-08-29,
  the day of this pass): setting an output of 854×480 silently produces 852×480.
  #9379: 1919×1024 silently becomes 1916×1024. #11683: the Rescale Output
  dropdown renders concatenated garbage when canvas exceeds monitor resolution.
- FACT: Changing base canvas does not preserve source layout — #13623
  (2026-07-05): "All my sources have zoomed in and have not retained their
  positioning… even after I reset the video settings back".
- FACT: Studio Mode + advanced output can display the *wrong resolution* in
  Program when a scene is transitioned by API rather than through Preview
  (#12171, 2025-05-18, open). INFERENCE: this specifically punishes the
  automation/control workflow this segment cares about.

**PERFORMANCE PROBLEMS**

- FACT: #8929 "OBS causes frametime stuttering" (2023-05-19, 15 comments, open,
  last activity 2025-01-01). #13292 "Severe frame pacing issues when recording
  screen" (2026-04-04, open).
- FACT — **directly relevant to this segment:** #9890 "Active output (e.g.
  virtual cam or NDI) combined with NVENC recording causes high frame render
  times", open since 2023-11-19 and still being updated 2026-05-17. INFERENCE:
  the combination that a live production actually uses — network output plus
  local ISO recording — is the combination with the standing performance bug.
- FACT: crash-on-stop-recording is a recurring family across encoders and years:
  #12970 (VAAPI/QuickSync, 2025-12-30), #11341 (hevc_nvenc 7680×2160, 2024-10),
  #11584 (2024-12), #11292 (2024-09).

**PRICING PROBLEMS**

- None. GPL-2.0, free. INFERENCE: the cost is displaced into integration and
  maintenance labour, which is what the rest of this section documents.

**LOCK-IN**

- FACT: **Plugin ABI churn is the lock-in.** #10263's reporter cannot roll back
  to a working OBS version without breaking their project "due to plugin
  updates". #11029 shows built-in plugin loading itself regressing between
  releases. INFERENCE: an OBS show file is portable only together with a pinned
  OBS version and a pinned plugin set — which is exactly the state a planning
  tool would want to record and nothing in OBS records.
- FACT: Portable mode leaks out of its own directory — #10486 (2024-04-06): OBS
  in portable mode still creates `C:\ProgramData\obs-studio` and
  `obs-studio-hook`.
- FACT: Profile export was broken on both macOS and Windows for at least a
  release (#5599 2021-12, #6298 2022-04): "Export" opened an *open* dialog and
  saved nothing.

**OFFLINE**

- FACT: OBS itself runs fully offline. INFERENCE from the evidence above: the
  offline hazard is not OBS but its dependencies — see NDI/DistroAV below, where
  the required runtime is downloaded from a third-party server that has
  repeatedly been unreachable.

**INTEGRATION PROBLEMS**

- Covered in the obs-websocket section below; the two are inseparable in
  practice.

---

### obs-websocket (OBS Project) — the segment's best control API, and its gaps

Evidence base: strong. **133 open issues** at time of reading.

**STRENGTHS**

- FACT: it is the only control surface in this segment with an explicit
  authentication story (issue #1, "Implement authentication", closed 2016) and a
  negotiated protocol version. The brief's characterisation (WS 4455, SHA-256
  auth, rpcVersion negotiation, ~140+ requests) is consistent with everything
  read, though the protocol document itself lives on a blocked domain and was
  **not re-verified today**.

**MISSING FEATURES (what users request) — all FACT, all open**

- **#830 "YouTube Integration Control"** (9 reactions) — the highest-reacted open
  request. OBS grew a "create broadcast and start streaming" function in the app;
  it is not reachable over the socket.
- **#983 "Hydrate Events with Additional Data"** — v5 events carry *less*
  information than their v4 counterparts; `SceneTransitionStarted` is named as
  emitting almost nothing. INFERENCE: this is the classic thin-event problem —
  a controller is forced to re-fetch full state on every notification, which is
  precisely the "change-notify-then-refetch" pattern the landscape pass credited
  to Vectar as a *design*. Here it is an unintended regression.
- **#1081** — sceneItem operations cannot address items inside *groups*, only
  inside scenes.
- **#1130** — screenshots can be taken of inputs but not of Program or Preview.
  INFERENCE: this blocks the obvious "show me what is on air" panel that every
  external dashboard wants.
- **#672** — no browser-source interaction API, though the interaction exists in
  the OBS UI.
- **#575** — no control over advanced output encoding parameters (e.g. bitrate
  for a custom ffmpeg recording output).
- **#723** — Quick Transitions are not exposed, only scene transitions.
- **#1246 "Interruptible Request Batches"** (7 reactions) — a batch cannot be
  aborted part-way, and there is no `interrupted` status.
- **#1340 "Feature Request: LNA support"** (2026-04-20, open).
- FACT: **#273 "Allow 3rd-party OBS plugins to expose RPC methods"** — 6
  reactions, opened 2019-02-03, **closed without implementation** in 2021.
  INFERENCE: this is the single most consequential gap. Because plugins cannot
  publish their own RPC surface, every plugin author who wants remote control
  must ship a *separate* socket or HTTP server, and every controller must learn
  a bespoke protocol per plugin. That is the structural reason the segment needs
  Bitfocus Companion at all.

**UX / SECURITY PROBLEMS**

- FACT: **#907 "Security: binding options"** (2022-02-08, 10 reactions, open).
  The reporter's argument, read in full: obs-websocket binds globally by default,
  so an attacker on the same network can create scenes, write files, access
  audio inputs, trigger hotkeys, read config files that may contain secrets, and
  reach private media. Requests: a localhost-only checkbox, port randomisation
  alongside password generation, `do_not_route` options, a browser-connection
  toggle ahead of CORS private-network restrictions, a startup warning for
  insecure configurations, scoped/permissioned API access, and per-client
  approval with token identity. **None of that is implemented as of this
  reading.** <https://github.com/obsproject/obs-websocket/issues/907>
- FACT: the counterpart complaint also exists — #608, a user who *wants* LAN
  access and cannot get it past Windows firewall prompts. INFERENCE: the current
  design satisfies neither the security-conscious nor the LAN operator; there is
  no explicit network-posture setting either way.
- FACT: **#682** — in a headless/Docker deployment there is no way to set the
  password over the wire; if the first-run prompt is missed, the documented
  default does not work and the instance is unreachable. INFERENCE: obs-websocket
  assumes a human at a GUI on first run, which is wrong for the rack-mounted
  encoder case.

**LOCK-IN**

- FACT: the v4→v5 break was real and total (evidenced indirectly by #983's
  framing of "v5 events compared to v4 counterparts"). INFERENCE: every
  controller in the ecosystem had to be rewritten. rpcVersion negotiation exists
  precisely because that happened once.

---

### vMix (StudioCoast Pty Ltd, AU)

Evidence base: moderate and **entirely indirect**. `forums.vmix.com`,
`www.vmix.com`, `docs.vmix.com`, `kb.vmix.com` and `ideas.vmix.com` are all
blocked; vMix has no public issue tracker. Everything below is either from the
Companion vMix module's own documentation and issue tracker (31 issues matched
across two searches) or from third-party API wrapper repositories.

**STRENGTHS (conceded by critics)**

- FACT: the module's HELP document confirms a wide, uniform shortcut surface —
  "All vMix shortcuts can be achieved through Actions", with a documented
  `shortcut_list.md` mapping. INFERENCE: the *breadth* of vMix's API is not in
  dispute anywhere in the corpus; the complaints are about its *shape*.
- FACT: nobody in the corpus complains that vMix cannot do something. They
  complain that driving it costs vMix performance.

**WEAKNESSES — the API is a polling API, and the vendor's own integrators say so**

- FACT — **primary document.** The Companion vMix module HELP states: "The
  majority of vMix data used by Companion for feedback and variables is retrieved
  through the vMix REST API, the frequency at which this data is polled can be
  changed in the instance config… Default: 250ms, Minimum: 100ms. Set to 0 to
  disable API Polling." And then, explicitly: **"If you experience high vMix CPU
  usage while this Companion instance is enabled, increase the interval delay
  value to slow down the API Polling."**
  <https://raw.githubusercontent.com/bitfocus/companion-module-studiocoast-vmix/master/companion/HELP.md>
  INFERENCE: this is an integrator-side admission that *observing* vMix costs
  vMix CPU proportional to how fresh you want the state. The default was
  loosened from 100 ms to 250 ms specifically because of this. There is a TCP
  activator channel for events, but full state still requires re-fetching an XML
  document on a timer.
- FACT — **the field consequence, reported in detail.** Issue #48 (2020-11-04,
  11 comments): a user reports vMix dropping frames and generating audio glitches
  after about an hour whenever Companion is connected; "if two independent
  Companion clients are used in the same network, the drops / glitches are much
  worse"; "Systems without Companion run for up to 14 hours without any drops."
  They had already eliminated Windows build, ASIO drivers, network, cabling,
  NIC, project complexity, vMix version and Blackmagic driver version.
  <https://github.com/bitfocus/companion-module-studiocoast-vmix/issues/48>
  FREQUENCY: this is one detailed report, so treat the *causal claim* as
  isolated — but it is corroborated in mechanism by the vendor-adjacent HELP
  text above, which is why I rate the underlying polling-cost issue as recurring.
- FACT: long-run connection decay is recurring. #214 (2023-07-03) "Module
  crashing to 'Unknown Stopped' state after some period of time" (>4 h idle);
  #227 (2023-08-25) the module process crashes daily, "often preceded by a
  significant increase in Working Set, probably indicating a memory leak", and —
  worse — Companion's own connection state gets stuck showing "on" so the
  operator's recovery button does nothing; #176 (2022-09-20) `ECONNRESET` on the
  function socket requiring manual reconnect.
- FACT: three separate sockets are in play (the logs in #170 show "Function
  Socket", "Activator Socket" and "XML Socket" connecting independently).
  INFERENCE: three sockets means three independent failure modes, and the
  observed symptom — "connection shows green until I try an action, then
  disconnects momentarily; action never fires; feedbacks do not work either"
  (#209, 2023-06-02, 31 comments) — is consistent with partial socket loss being
  invisible to the operator.

**MISSING FEATURES (what users request)**

- FACT: **stable, name-independent addressing.** #49 and #110 ask for GUID-based
  input references instead of index numbers, and for multiple target IPs so a
  backup vMix can be addressed. INFERENCE: input *numbers* shift when the
  production changes; a control layer built on them is brittle by construction.
- FACT: **backup-machine parity.** #225 (2023-08-18): "I have 2 vMix installs…
  Companion is installed to sync the 2 productions in case one PC goes down."
  The user then finds the T-bar cannot be driven by a variable, only a literal,
  and has to build trigger workarounds.
- FACT: aggregate timing data — #193 asks for whole-list remaining time, not
  just current-clip remaining time, because the manual calculation "leaves room
  for error".
- FACT: real-time name propagation — #30 asks for input name changes made in
  vMix to appear on control surfaces without a reload.

**UX PROBLEMS**

- FACT: variables and custom variables silently fail to interpolate in some
  releases. #199 (2023-04-06): a custom variable placed in an input field was
  transmitted literally as `%24(internal%Acustom_variable)` instead of its value.
  #244 (2024-01-29): a Companion trigger on `$(vmix:mix_selected_program)` never
  fires even though the same variable renders correctly on a button.
- FACT: variables disappear across module versions — #339 (2025-06-15):
  `$(vmix:mix_1_program_name)` and the preview equivalent "are no longer
  available"; downgrading restored them.
- FACT: feedback colour semantics changed under users mid-life — #267
  (2024-05-23): a two-colour live/muted feedback silently became one-colour, with
  no patch note; the reporter asks for a warning and a migration hint.

**PERFORMANCE PROBLEMS**

- Covered above: polling cost, memory growth, hours-scale connection decay.

**PRICING PROBLEMS**

- UNKNOWN. vMix's pricing page is on a blocked domain and **no price was
  verified in this pass.** vMix is known to sell perpetual tiers (Basic HD
  through 4K/Pro) where feature availability — notably input count, ISO
  recording and Instant Replay — is gated by tier. **That is recollection, not
  a read source, and must be checked against `vmix.com/purchase` before it is
  used anywhere.** The one hard fact in the corpus is that a user in #227 is on
  "vMix Max", i.e. tiering is real and visible in the wild.

**LOCK-IN**

- FACT: Windows-only. Every issue in the corpus with an OS reports Windows for
  the vMix host, and the module's own users run Companion on macOS/Linux/Pi to
  reach it. INFERENCE: vMix is the one product in this segment that hard-binds
  the production host OS.
- FACT (from the brief's landscape pass, **not re-verified**): vMix 29
  (2026-02-02) records via OMT without re-encoding. INFERENCE: adopting OMT is
  a deliberate move *away* from lock-in, and is the strongest signal in this
  segment that the vendor recognises the NDI dependency as a liability.

**OFFLINE**

- FACT: nothing in the corpus suggests vMix requires internet for operation.
  UNKNOWN: whether licence activation requires periodic online validation —
  **this is the single most important unverified question about vMix for a
  planning tool**, because it determines whether a vMix machine can be racked in
  an air-gapped OB truck. Would need `vmix.com` licensing documentation.

**INTEGRATION PROBLEMS**

- FACT: the third-party client ecosystem is thin and small. The most-starred
  vMix API repository on GitHub is `curtgrimes/vmix-rest-api` at **45 stars**;
  the rest trail off at 24, 8, 6, 6, 5, 4 and 2 stars
  (`jensstigaard/vmix-function-list`, `FlowingSPDG/vmix-go`,
  `mattlamb99/vMix-EmberPlus`, `phpfunk/PHP-vmix`, `MikanseiLaboratory/vmix-rs`).
  INFERENCE: compare with the ATEM ecosystem below, where an *undocumented
  binary* protocol has produced a deeper library tree. A documented API with a
  shallow ecosystem suggests the API is documented but unpleasant.
- FACT: the existence of `mattlamb99/vMix-EmberPlus` — a gateway translating
  vMix API control and tally into Ember+ — is direct evidence that broadcast
  facilities need vMix to speak a protocol it does not speak.

---

### ATEM Software Control + ATEM hardware (Blackmagic Design)

Evidence base: strong but **entirely from third parties**. Blackmagic's forum is
blocked and there is no vendor tracker. This section is built from the ATEM
control-library ecosystem — which is itself the finding.

**STRENGTHS**

- FACT: the ecosystem's size is the concession. Reverse-engineered ATEM control
  libraries exist in Python (`clvLabs/PyATEMMax`, 104 stars), Node
  (`applest/node-applest-atem`, 94), C++/Qt (`petersimonsson/libqatemcontrol`,
  84), TypeScript (`bitfocus/companion-module-bmd-atem`, 76), .NET
  (`LibAtem/LibAtem`, 66), Swift (`Dev1an/Swift-Atem`, 64), C#
  (`mintopia/atemlib`, 43), plus a dedicated **Wireshark dissector**
  (`peschuster/wireshark-atem-dissector`, 57 stars) and tally projects on top.
  INFERENCE: people invest this much only in hardware they cannot avoid. The
  price/feature ratio the landscape pass credited is real enough to make the
  protocol pain worth paying.
- FACT: a Wireshark dissector existing at all is the clearest possible statement
  of what the protocol is: something you have to packet-capture to understand.

**WEAKNESSES — the undocumented binary protocol is a recurring, dated tax**

All FACT, from `bitfocus/companion-module-bmd-atem`:

- **Firmware upgrades break third-party control, and downgrade is not always
  possible.** #89 (2020-10-25): "support for atem switches… is until firmware
  version 8.1, however read this after installing 8.5. With this version,
  connection is not possible. Problem: downgrading the atem to firmware 8.1 is
  also not possible."
- **New models are invisible until someone reverse-engineers them.** #55 and #58
  (2020): "Unknown model: ATEM Mini Pro. Some bits may be missing." #77
  (2020-09-08): Mini Pro connects, Mini Pro ISO does not. #415: ATEM Mini
  Extreme ISO G2 lacks a connection definition. #300 (2024-05-13) asks whether
  the new 4K Constellations are "direct copies of the HD versions" — i.e. the
  integrator is guessing.
- **Model-name string mismatches break control outright.** #102 (2020-12-30):
  the switcher reports "ATEM Television Studio Pro 4K" while the module expects
  "TV Studio Pro 4K"; neither Auto Detect nor manual selection resolves it and
  buttons cannot be assigned. #113: selecting the correct model throws an error;
  selecting the *wrong* model works.
- **The high-end frames are the least reliable.** #64 (2020-06-12): Constellation
  8K only works when misidentified as "4 ME Broadcast 4K" on firmware 8.1, GUI
  status is permanently "Reconnecting" though macros function, and firmware 8.1
  itself is buggy (does not save chroma configuration). #204 (2022-08-10):
  entering the Constellation 8K's IP crashes Companion entirely. #479
  (2026-08-17, **open**): Constellation 2ME HD loses connection after a day or
  two and needs a manual reset.
- **Long-run connection decay across six years.** #168 (2022-01-08): ATEM TVS HD
  drops after roughly 1.5 h. #249 (2023-06-13, open): endless `reconnect` loop
  on Intel PCs while an M1 Mac works. #270 (2023-11-13, open): after an update,
  connection succeeds only "after several newstarts".
- **Host-OS updates break it.** #310 (2024-07-31): macOS Sequoia beta —
  Companion stuck "Connecting" to both an ATEM Mini Extreme ISO and a HyperDeck.
  #348 (2025-01-07): works for months, then stops after an iMac OS update; ATEM
  Software Control on the *same machine* connects fine.

INFERENCE from that last one, and it is the important one: **ATEM Software
Control keeps working when third-party control fails.** That asymmetry is the
lock-in — the vendor's own client tracks the protocol; nobody else can.

- FACT — **primary document, the module's own HELP file:** "Firmware versions
  7.5.2 and later are known to work, other versions may experience problems.
  Firmware versions after 20.2 are not verified to be working at the time of
  writing, but they likely will work fine." And: "**Devices must be controlled
  over a network, USB control is NOT supported.**"
  <https://raw.githubusercontent.com/bitfocus/companion-module-bmd-atem/main/companion/HELP.md>
  INFERENCE: "not verified… but they likely will work fine" is the exact
  epistemic position an undocumented protocol forces integrators into.

**MISSING FEATURES (what users request)**

- FACT: SuperSource parameter *transitions* — #144 notes the protocol only
  supports cutting between SuperSource parameter sets, not smoothly transitioning.
- FACT: audio fader ramps — #308 requests a fader slide analogous to fade-to-black.
- FACT: two-step routing for outputs — #157, so one page need not exist per output.
- FACT: AUX output state exposed as variables for feedback — #226.

**UX PROBLEMS**

- FACT — **an ATEM cannot reliably tell you what it just did.** From the module
  HELP: "Companion is not always able to detect that a macro has been run. This
  happens when the macro has zero length. You can resolve this by giving the
  macro a pause/sleep of 1 frame." INFERENCE: the documented workaround for a
  state-reporting gap is to *deliberately slow the show down by a frame*.
- FACT: basic state toggles have been wrong. #19 (2019-07-15) and #25: DSK
  Toggle engages but never disengages.
- FACT: discovery misleads. From the HELP: "Due to how the discovery protocol
  works, it will see ATEMs that you may not be able to connect to." INFERENCE:
  the discovery layer reports reachability it has not verified — a planning tool
  that trusted ATEM discovery output would inherit that lie.
- FACT: sending an action to a disconnected ATEM used to crash the whole control
  application (#50, 2020-02-29).

**PRICING PROBLEMS**

- UNKNOWN / carried over unverified: ATEM Mini Extreme ISO G2 at US$1,995 comes
  from the landscape pass and was **not re-checked** (blackmagicdesign.com is
  blocked). No pricing complaint appears anywhere in the corpus. INFERENCE: the
  hardware price is not the pain; the protocol is.

**LOCK-IN**

- FACT: the protocol is undocumented binary UDP; the community maintains a
  Wireshark dissector to read it. Every firmware release is an unannounced
  compatibility event. Blackmagic publishes no protocol version, no capability
  discovery and no deprecation notice that appears anywhere in this corpus.
- FACT: users migrate to *other third-party clients* rather than back to the
  vendor app — #310's reporter falls back to MixEffect (an independent iOS ATEM
  controller) while Companion is broken.

**OFFLINE**

- FACT: fully offline; control is LAN UDP. INFERENCE: this is genuinely a
  strength and the reason ATEM dominates trucks and houses of worship.

**INTEGRATION PROBLEMS**

- FACT: `LibAtem`'s own tracker shows the granular version of the same story —
  #16 `FairlightMixerSourceSetCommand not working` (2023-04-28), #12 "Can't
  control Mic for Atem Mini Pro (8.5)" (2021-02-22), #5 "Command length value"
  (2020-07-30), #9 error on `StreamingServiceSetCommand`. INFERENCE: individual
  command opcodes work or don't work per model per firmware, discovered
  empirically, one at a time.

---

### Videohub Control (Blackmagic Design)

Evidence base: thin but high-quality — the module has only **8 issues total**,
and one of them is the most-discussed single thread I found in the whole segment.

**STRENGTHS**

- FACT — confirmed in the module HELP: the protocol genuinely does expose labels
  as first-class writable state ("Rename destination", "Rename source", "Rename
  serial port") and routes as a file ("**Write routes to a disk file**", "**Read
  routes from a disk file**"), plus per-output locking and an explicit
  Take/Clear model.
  <https://raw.githubusercontent.com/bitfocus/companion-module-bmd-videohub/master/companion/HELP.md>
  INFERENCE: the landscape pass's "cleanest protocol in the segment" claim
  survives contact with the complaint corpus. There are 8 issues in six years.

**WEAKNESSES**

- FACT — **the flagship request is a show-oriented routing snapshot, open since
  2020.** #9 "BMD Videohub Routing Table Save and Restore", opened 2020-10-28 by
  a user running a 40×40 Videohub, **42 comments**, last activity 2024-03-21,
  **still open**. The body: they switch between a "baseball" and a "softball"
  configuration daily and want buttons that recall a whole predefined routing
  state instead of re-entering routes from paper. They note Companion already
  reads the routing table from the device.
  <https://github.com/bitfocus/companion-module-bmd-videohub/issues/9>
  INFERENCE, and this one matters commercially: the raw capability exists at
  protocol level (write/read routes to a disk file, per the HELP above). What is
  missing is the *layer above it* — named, versioned, per-event routing
  presets that a human can author away from the device and recall on the day.
  **That is a planning-tool shape, not a control-surface shape**, which is
  plausibly why 42 comments over four years have not produced a control-surface
  answer.
- FACT — **large frames are the weak point, and it is documented.** From the
  HELP: "Presets are not available for all input & output combinations for the
  larger models, **as it causes stability issues.**" INFERENCE: the control layer
  cannot enumerate a large router's full matrix without destabilising, so the
  operator is told to hand-edit presets. On a 40×40 that is 1,600 combinations.
- FACT: intermittent per-endpoint failures on specific frames — #3, #37 and #2
  are three separate "Blackmagic Videohub 16x32 Route problems" reports (2019,
  2024). #26 (2022-11-21): "Videohub route button works only on specific
  destinations/sources… sometimes".
- FACT: #35 (2023-09-06) — the interface does not send the protocol's PING
  command. INFERENCE: without keepalive, a silently dead TCP session looks
  identical to an idle healthy one.
- FACT: #32 (2023-06-21, **open**) — the "Load Routes File" function is broken
  for the ATEM-integrated Videohub. INFERENCE: the one feature that would have
  answered #9 is the one that does not work.

**MISSING FEATURES**

- FACT: route locking as a first-class control action — #27 (2023-01-24), closed
  2025-03-03.

**PRICING / LOCK-IN / OFFLINE**

- Control software is free; the protocol is plain-text TCP on 9990 with ACK/NAK.
  FACT: nothing in the corpus reports vendor lock-in or an internet requirement.
  INFERENCE: Videohub is the least-locked-in product in this entire segment, and
  the complaint volume reflects that.

---

### Bitfocus Companion (Bitfocus AS, NO) — the integration layer everyone depends on

Evidence base: strong. **287 open issues** at time of reading (2026-08-29).

**STRENGTHS**

- FACT: nobody in any other product's tracker suggests replacing Companion. It
  appears in ATEM, vMix, TriCaster, KAIROS and Videohub threads as the assumed
  control layer.
- FACT: the module request repository shows the breadth — a single search for
  multiviewer/switcher/router requests returned **53 open requests**.

**WEAKNESSES**

- FACT — **Stream Deck detection is the single most repeated complaint in this
  entire dossier, and it spans seven years and every OS.** One search returned
  61 matching issues; the top of that list is almost entirely device detection:
  #1100 (2020-05), #951 (2020-01), #1041, #1077, #1082, #1054 (all 2020), #1174
  "Wrong Stream Deck Layout Detected" (2020-07, 27 comments), #1279 "Linux
  version not detecting Streamdeck" (2020-11, 15 comments, **still being updated
  2025-10-25**), #1824 (2021-12, Linux, updated 2025-10-25), #1564 (2021-04, 32
  comments — a Stream Deck vanishes if VLC autostarts), #2230 (2022-12), #2457
  (2023-05), #2464 (2023-05), #2874 (2024-05, "Stream Deck Disconnecting On New
  Models"), #3175 (2024-12, Stream Deck Studio disconnects), #3261 (2025-02,
  "Ignoring Stream Decks devices as the stream deck app is running" when the
  app is not even installed), #3588 (2025-08, Raspberry Pi 5), #3592 (2025-08,
  M4 MacBook Pro), #3682 (2025-10, Mini stuck on standby via Network Dock,
  updated 2026-04), #3770 (2025-11, network dock not detected after restart, 23
  comments, updated **2026-08-23**).
  FREQUENCY: **widespread.** Seven years, every platform, still live six days
  before this pass.
  INFERENCE: this is a USB/HID enumeration problem with a proprietary vendor app
  competing for the same devices. It is not fixable inside Companion, which is
  why it never closes.
- FACT: the Satellite protocol has handled socket breakage poorly (#2054,
  2022-06). FACT: a memory leak (#795, 2019-08, 11 comments) and
  "Companion app closes over time" (#1012, 2020-02).
- FACT: current-week breakage is still basic — #4432 (2026-08-24) "Copy, move
  and other buttons not working!"; #4438 (2026-08-27) PNG upload to the Image
  Library fails; #4437 (2026-08-27) floating-point arithmetic in expressions
  ("2.7 + 0.1 should be 2.8").

**MISSING FEATURES — and these are the most commercially interesting in the pass**

- FACT — **#1738 "Syncing of Companion Config between multiple computers"**
  (2021-09-28, **open**). Read in full: three macOS machines each run a
  Companion instance; two Stream Decks move between them depending on the day
  and event. A config change made on one machine must be exported and imported
  to the others; "This causes issues if two computers were updated before an
  export and import operation has been performed." The requester proposes either
  cloud storage of the config or a host/slave topology.
  <https://github.com/bitfocus/companion/issues/1738>
  INFERENCE: this is a **source-of-truth problem, not a control problem**. The
  show configuration is the artefact; Companion treats it as machine-local
  state. Five years open.
- FACT — **#642 "copy commands from 1 instance to another or master-slave
  setting"** (2019-05-13): "2 resolume, 1 is backup — i need to copy all the
  commands from the main to the backup." Same shape, two years earlier.
- FACT — **#2271 "Visual Companion"** (2023-01-08, 11 reactions, **open**). Read
  in full: the requester asks Companion to use the data it already holds to
  generate "a useable set of outputs to have on displays during productions" —
  on external monitors, Raspberry Pis or secondary computers — and argues it
  should be native rather than a third-party app. A proof-of-concept video is
  referenced.
  <https://github.com/bitfocus/companion/issues/2271>
  INFERENCE: users want the control layer's model of the show *rendered as a
  visual artefact for the room*. Companion has the data and not the surface.
- FACT — **#1187 "Expose properties instead of actions"** (2020-07-31, 9
  reactions, open, milestoned v5.z). Read in full: maintainer Julusian's own
  architectural critique — module authors must expose the same underlying device
  property (an audio fader, say) three separate times as an action, a feedback
  and a variable, producing inconsistency across modules and duplicated effort.
  The proposal is a single `properties` declaration (identifier, type, min/max,
  instances, `getValue`/`setValue`/`subscribe`/`unsubscribe`,
  `notifyPropertyChange`) from which core derives all three surfaces.
  <https://github.com/bitfocus/companion/issues/1187>
  INFERENCE: **the maintainer of the segment's de-facto integration standard
  has publicly diagnosed its data model as action-shaped where it should be
  property-shaped, and it has been open six years.** For anyone building a device
  model in this space, that is the design lesson of the segment, stated by the
  person best placed to state it.
- FACT: the long tail of unserved devices is real and old — module requests still
  open include Analog Way Eventix (#47, 2019-01), Sierra Video Routers (#76,
  2019-02), Roland VR-4HD (#357, 2021-01, 12 comments), Harris Panacea (#784,
  2022-04), Apantac AXP multiviewer (#1380, 2024-01), Kiloview Cube X1 NDI router
  (#1475, 2024-05), Ross Crossover 12 Solo (#2057, 2026-04).

**UX PROBLEMS**

- FACT: **#673 "Dark mode for the GUI"** — 7 thumbs-up, 13 comments, opened
  **2019-06-01**, still open. The requester's reason is operational, not
  cosmetic: they "constantly change out buttons" during shows and want something
  "less harsh on the eyes". INFERENCE: in a darkened control room a light admin
  UI is a genuine defect, and this is the most-upvoted open request in the repo.
- FACT: **#428 "Screensaver"** (2019-01-07, 5 thumbs-up, 13 comments, open) —
  blank connected Stream Decks after n minutes. INFERENCE: OLED-style burn-in and
  light pollution in a dark room; also seven years old.
- FACT: **#262** — animated GIF / layered button images; **#1728** — icon fonts
  such as FontAwesome so users need not author PNGs per button. Both open.
- FACT: config import loses data — #3063 (2024-10-02): importing an exported
  config sets up only page 1 and deletes all other pages.

**PRICING**

- Free, MIT. No pricing complaints exist. INFERENCE: the cost is that a free
  volunteer project is load-bearing for paid productions, which is exactly what
  the seven-year-old open requests above express.

**LOCK-IN / OFFLINE**

- FACT: runs locally, no cloud requirement observed anywhere in the corpus.
  INFERENCE: this is why it is trusted. The lock-in is social — 700+ modules
  exist nowhere else.

---

### TriCaster / Viz Vectar Plus (Vizrt)

Evidence base: thin — 8 issues in the Companion module, plus the module HELP.
Vizrt's own channels are blocked.

**STRENGTHS**

- FACT: the module HELP confirms first-class enumerable macros ("Run System
  Macros", "Run Custom Macros") and a DataLink key/value bus surfaced as
  variables, matching the landscape pass's characterisation.
  <https://raw.githubusercontent.com/bitfocus/companion-module-newtek-tricaster/master/companion/HELP.md>
- FACT: tally feedback for both Program and Preview, and media-playing state for
  DDRs, GFX, Stills, Titles and Sound, are all exposed. INFERENCE: the state
  model exposed to third parties is richer than ATEM's.

**WEAKNESSES**

- FACT — **firmware updates break control, same as ATEM.** #41 (2023-08-31):
  "this was working until I updated the Tricaster. Now it just timesout and
  doesn't stay connected." The module's own release notes record a v2.0.4 fix
  for "Crash after updating to latest Tricaster firmware, due to change in
  transition XML data", and a v2.0.2 fix because "Tricasters with older firmware
  would not connect".
- FACT: #47 (2024-01-19) TriCaster TC2 times out on connect; #40 (2023-08-17)
  TC2 Elite "Unable to connect… Check your device address" with correct IP.
- FACT — **the control module could destabilise the switcher itself.** #12
  (2021-06-08): "it seems to randomly crash my Tricaster functions… the GUI
  freezing on the Tricaster and all the monitor windows going black with no
  response to my mouse clicks." INFERENCE: this is the most serious class of
  integration failure in the dossier — the controller taking down the switcher's
  own operator UI mid-show.

**PRICING PROBLEMS**

- UNKNOWN / carried over unverified: USD 1,260/month MSRP subscription, from the
  landscape pass, **not re-checked** (vizrt.com blocked). INFERENCE, clearly
  labelled: at that rate the integration friction documented above is
  disproportionately expensive relative to a free OBS or a one-off ATEM. No user
  in the corpus complains about the price, but no user in the corpus is a
  purchaser either.

**SECURITY / LOCK-IN**

- FACT — **primary document.** The module's configuration instructions begin:
  "**On the Tricaster under Administration Tools, turn off the LivePanel
  password.**" FACT: #57 (2025-01-30, **open**) asks "Has there been any update
  on adding a password option when connecting to tricasters?" — unanswered.
  INFERENCE: to integrate a TriCaster with the segment's standard control layer,
  you must first disable its authentication. That is a real, documented,
  currently-unresolved security-versus-integration trade-off, and it is the
  cleanest example in this pass of a vendor API that authenticates in a way no
  third party can satisfy.
- FACT: #26 (2023-02-14) asks to connect by NetBIOS name rather than IP, "for
  mobile setups that connect to different networks… so non-technical users can
  connect". INFERENCE: IP-only addressing is a real field problem for touring
  and flypack work where the subnet changes per venue.

---

### Panasonic KAIROS (Panasonic Connect)

Evidence base: very thin — 3 issues total — but one is exceptionally
informative and is written by a practitioner.

**WEAKNESSES / MISSING FEATURES**

- FACT — **read in full, and the most valuable single issue body in this pass.**
  #19 "New Kairos API integration" (2024-08-16, 4 thumbs-up, **open**, last
  activity 2025-12-12). The reporter states that Companion's KAIROS control uses
  a combination of the older API and Panasonic's proprietary control protocol,
  "which seems to depend on lots of unique IDs". Consequence: "When we frequently
  have multiple Kairos systems (main + backup for example), **we have to
  reprogram all the buttons in Companion for every unit we want to control**,
  which quickly becomes very time consuming for complex shows. Simply changing
  the IP address of the connected frame you want to control from Companion
  doesn't work as the IDs for each unit are unique." They report that Panasonic's
  newer API introduced in KAIROS 1.7.0 does not rely on unique IDs, so endpoints
  would remain the same between systems, and they attached the generic API
  documentation to the issue.
  <https://github.com/bitfocus/companion-module-panasonic-kairos/issues/19>
  INFERENCE, and this generalises well beyond KAIROS: **when a device model
  addresses its objects by instance-unique identifiers rather than by stable
  names or paths, redundancy becomes unaffordable.** A main/backup pair should be
  one configuration pointed at two addresses. Per-unit IDs make it two
  configurations that must be maintained in lockstep by hand. Anything that
  models a facility should treat identity portability as a first-class
  requirement.
- FACT: #13 (2023-11-30, **open**) — the source dropdown is blank for FXINPUTS,
  STILLS and MACROS created in KAIROS Creator, so they cannot be assigned to an
  AUX. INFERENCE: objects authored in the vendor's own design tool are not
  enumerable over the control API.
- FACT: #10 (2023-08-18, **open**) — "Connection to Kairos barely works/does not
  work. The module is able to pull macros and all other information from Kairos,
  however calling the macros does not work. It is possible to make them rarely
  work if you spam click it."

**PRICING**

- UNKNOWN — quote-only per the landscape pass; not verifiable and not verified.

**Everything else about KAIROS is UNKNOWN.** Three issues is not a corpus.
Panasonic's own channels are blocked.

---

### Open Media Transport (OMT) — the NDI alternative, assessed on its own docs

Evidence base: moderate. The full organisation README was read; both active
repositories' issue lists were read. **Zero open issues on the OBS plugin at time
of reading.**

**STRENGTHS**

- FACT: MIT, royalty-free, patent-free; C#/.NET and C libraries with prebuilt
  binaries; SIMD/NEON optimised; "multiple 1080p60 encode and decodes on a
  single CPU core"; VMX already has FFmpeg support. DNS-SD discovery via the OS's
  own Bonjour/Avahi, with an optional TCP Discovery Server "where multicast is
  not available".
  <https://raw.githubusercontent.com/openmediatransport/.github/main/profile/README.md>
- FACT: the routing model is genuinely well-designed for facilities — a sender
  can redirect receivers to a different sender on the fly, so a "virtual sender"
  acts as a named, stable endpoint while the actual source behind it changes.
  "This means a router app need only basic network connectivity to facilitate
  connections, as no high bandwidth data will be transferred to it."
  INFERENCE: this is precisely the *stable-identity* property that KAIROS lacks
  (above) and that vMix users ask for (GUID references). It is the strongest
  design idea I found in the whole segment.

**WEAKNESSES — bandwidth is the honest problem, and the project documents it**

- FACT — from the published table: 1080p60 requires **260 Mbps at High, 200 Mbps
  at Medium, 86 Mbps at Low**; 2160p60 requires **600 / 300 / 200 Mbps**.
  INFERENCE, and this is a planning constraint of the first order: **a single
  gigabit link carries roughly three 1080p60 High feeds, or eleven at Low.**
  A 2160p60 High feed consumes 60% of a gigabit link on its own. Anyone
  designing an OMT plant is doing capacity arithmetic, not plugging things in —
  and the quality setting is negotiated at runtime ("the maximum quality selected
  amongst all receivers will then be selected by the Sender"), so **one receiver
  requesting High silently raises the bandwidth for that sender**. That is a
  non-obvious failure mode a planning tool could catch.
- FACT: TCP-only, "each sender listens on a single port and each receiver may
  open up to two connections to that sender for separate audio and video
  streams", default sender port range 6400–6600, DNS-SD on UDP 5353, Discovery
  Server on TCP 6399. INFERENCE: this is a clean, firewallable design — and
  unlike multicast NDI it does not require IGMP snooping to be correct, which is
  the single most common cause of NDI network failure in the field.
- FACT: platform maturity is young and it shows. `omtplugin` issues (all now
  closed): #4 "OMT Source black screen on macOS — plugin loads and discovers
  sources but never receives frames" (closed 2026-08-24, **five days before this
  pass**); #3 "Instant crash using vertical resolutions" (closed 2026-05-04); #5
  Linux support requested (closed 2026-06-03). `libomtnet`: #46 "macOS:
  omt_send_destroy can hang forever — OMTDiscoveryDnsSd.OnBrowse pumps
  DNSServiceProcessResult inside a DNS-SD callback" (closed 2026-08-13); #24
  "Missing libvmx.so for Linux" (closed 2025-10-10).
  INFERENCE: macOS and Linux were both materially incomplete within the last
  twelve months. Windows appears to be the reference platform.

**GOVERNANCE — worth flagging**

- FACT: the `libomtnet` issues page carries the notice "**Issue creation is
  restricted in this repository.**"
  <https://github.com/openmediatransport/libomtnet/issues?q=is%3Aissue>
  INFERENCE: an MIT-licensed project positioned as the community alternative to
  a proprietary standard does not accept public bug reports on its core library.
  That is a real adoption risk for anyone betting a facility on it, and it is
  worth watching. It is not evidence of bad faith — a small maintainer team
  triaging through a controlled channel is a legitimate choice — but it does mean
  the public complaint corpus for OMT is structurally suppressed and this
  section's near-clean bill of health should be discounted accordingly.

**PRICING / OFFLINE / LOCK-IN**

- FACT: free, MIT, no runtime download, no licence server, no EULA gate. The
  libraries ship as prebuilt binaries on a GitHub releases page. INFERENCE: this
  is the entire point — see the next section for what it is reacting against.

---

### NDI and DistroAV (formerly obs-ndi) — the dependency that keeps failing

Not on the brief's product list, but it is the transport underneath most of it,
and it produced the clearest lock-in evidence in the pass. Included for that
reason.

**WEAKNESSES**

- FACT — **audio drifts out of sync over hours, and it is the most-reacted open
  issue in the repo.** #742 "Audio delay over time progression", opened
  2022-06-20, **20 reactions**, labelled `audio` and `av-desync`, milestoned
  6.2.1, **still open**. From the body: desync appears after 2–3 hours of
  streaming; the reporter had been living with it for about a year; workarounds
  are disabling preview on the streaming PC, the sync-audio option, or restarting
  OBS every 2–3 hours through a 6-hour stream. Logs show no audio buffering
  errors. The reporter suspects NDI itself rather than the plugin.
  <https://github.com/DistroAV/DistroAV/issues/742>
  Corroborated by #959 "Is Audio Timestamp Calculation Correct?" (2024-01-09, 10
  reactions).
  FREQUENCY: **recurring**, and note the resonance with OBS #4531 — long-session
  audio buffer drift is a segment-wide pattern, not a single product's bug.
- FACT — **the runtime is not redistributable, and the download has broken
  repeatedly across eight years.** A search for runtime/licensing issues returned
  **49 matches**, of which the download-failure family alone spans: #148 (2018-04),
  #140 "download server for NDI runtime is unavailable" (2018-03, 16 comments),
  #160 (2018-05), #220 (2018-09), #401 (2020-03), #573 "NDI 4.5.1 macOS runtime
  link not working" (2020-10), #577 "NDI windows installer server name cannot be
  resolved" (2020-10), #809 (2022-12), #1011 "NDI Runtime Don't Install"
  (2024-05, 11 comments), #1101 "NDI™ Runtime not found" (2024-10), #1102 "NDI
  Runtime link does not work" (2024-10).
  FACT: the current README still lists "NDI Runtime v6.3 or higher" as a separate
  external requirement rather than bundling it.
  <https://raw.githubusercontent.com/DistroAV/DistroAV/master/README.md>
  INFERENCE — **and this is the offline finding of the pass:** an
  MIT/GPL-licensed OBS plugin cannot ship the runtime it depends on, so first
  install of an NDI-capable OBS **requires working internet to a vendor server
  you do not control**. Eight years of "runtime not found" issues is what that
  costs. For an air-gapped truck or a venue with a hostile network, the plugin
  is not installable on the day.
- FACT — **licence friction is old and structural.** #4 "Incompatible licenses"
  (2016-10-23) and #230 "license?" (2018-09-27) are both about exactly this.
- FACT — **the project was made to change its name.** From the README: "`OBS-NDI`
  was renamed to `DistroAV` ~2024/06 per obsproject.com's request to drop `OBS`
  from our name." INFERENCE: combined with the trademarked "NDI™" appearing in
  issue titles, the ecosystem around this transport carries naming and trademark
  overhead that OMT explicitly does not.
- FACT: multicast NDI output is a request, not a feature — #942 (2023-11-30, 7
  reactions, open). #1301 "[RFE]: Implement more NDI Metadata" (2025-06-17, open).
- FACT: version-tracking lag is chronic — #668/#782 (NDI 5), #994 (NDI 6
  runtime), #999 "NDI Tools v6 Compatible?" (2024-04, 15 comments). Each major
  NDI release is a separate compatibility scramble.

---

### Products with no reachable evidence — stated honestly

For each of the following, **I found no user-complaint evidence at all**, because
their vendors publish no public issue tracker and every other channel was
blocked. Absence of findings here is absence of access, not absence of problems.

- **mimoLive (Boinx Software International GmbH, DE)** — UNKNOWN. No Companion
  module tracker was locatable; no GitHub presence found. The landscape pass's
  claims (Document/Layer/Variant/LayerSet model, JSON:API-shaped REST plus
  WebSocket, GBP 159/569/1,639 per year) are **entirely unverified in this pass**.
  To check: `mimolive.com` documentation and pricing, plus the Boinx support
  forum.
- **Sony M2L-X / M2 Live** — UNKNOWN. No public tracker, no third-party control
  library found. The Stream Deck-as-official-surface claim is unverified.
- **Lawo vm_dmv + VSM** — UNKNOWN for the products themselves. The only reachable
  artefact is `Lawo/ember-plus` (Boost Software License 1.0, 140 stars, 270
  commits, **36 open issues**) — the protocol, not the multiviewer or the control
  system. I did not read those 36 issues; the repository landing page is the only
  page I opened. To check: `lawo.com` documentation, plus broadcast-engineering
  mailing lists.
- **R&S PRISMON (Rohde & Schwarz)** — UNKNOWN. `rohde-schwarz.com` is blocked and
  no third-party artefacts exist. The SRF and Red Bee deployment claims are
  unverified.
- **ATEM Software Control as an application** — PARTIAL. Everything above is
  inferred from third-party control behaviour. I have **no direct evidence about
  the ATEM Software Control UI itself** — its multiview layout, macro editor,
  media pool, or palette ergonomics. Blackmagic's forum is the place that
  discussion lives and it is blocked.

---

## Cross-product patterns

These repeat across **multiple independent vendors** and are the most valuable
output of the pass.

### 1. The vendor's own client keeps working; everyone else's breaks (widespread)

ATEM #348 is the purest instance: after an OS update, Companion cannot connect
while ATEM Software Control on the same machine connects fine. The same shape
appears at TriCaster (#41: worked until the firmware update), at KAIROS (#10:
the module reads macros but cannot call them), and structurally at OBS
(obs-websocket #830: the app can create a YouTube broadcast; the socket cannot).

INFERENCE: in this segment the control API is systematically a **subset** of the
vendor client's capability, and it is a subset that shifts without notice. Any
product that models these devices must assume its picture is incomplete and
version-dependent, and must make that uncertainty visible rather than pretending
to authority it does not have.

### 2. Firmware and version upgrades are unannounced compatibility events (widespread)

- ATEM: "support… is until firmware version 8.1… With 8.5, connection is not
  possible. Downgrading is also not possible" (#89). "Firmware versions after
  20.2 are not verified to be working" (module HELP, present tense, today).
- TriCaster: v2.0.4 released to fix "Crash after updating to latest Tricaster
  firmware, due to change in transition XML data".
- OBS: 388 issues matched "crash/broke after update".
- vMix: variables present in one module version, gone in the next (#339).
- NDI: every major runtime release is a separate scramble (#668, #782, #994, #999).

INFERENCE: **there is no version-compatibility contract anywhere in this
segment.** Nobody publishes a capability matrix, a deprecation window, or a
protocol version that a third party can negotiate against — with the single
exception of obs-websocket's `rpcVersion`, which exists only because a total
break already happened once. A planning tool that recorded *device model +
firmware version + control-software version* as first-class, and warned when a
combination was untested, would be encoding knowledge that currently lives only
in individual engineers' heads and in scattered issue threads.

### 3. State is polled, and polling costs the production (recurring)

vMix's integration documentation says it outright: default 250 ms polling,
raised from 100 ms, with the instruction to slow it further if vMix CPU is high.
The field report in #48 is that vMix drops frames and glitches audio after an
hour with Companion attached, and worse with two Companion clients.
obs-websocket's #983 documents the other half of the same problem: events are so
thin that a controller must re-fetch anyway. ATEM has no query model at all —
zero-length macros are simply undetectable, and the documented fix is to make the
macro a frame longer.

INFERENCE: **the segment has no good answer to "what is the current state?"** The
choices are poll and pay in CPU, subscribe and get told too little, or guess.
Vectar's change-notify-then-refetch and OMT's timestamped bidirectional metadata
are the two designs in the segment that took the question seriously.

### 4. Identity is unstable, so redundancy is unaffordable (recurring, high value)

- KAIROS #19: per-unit unique IDs mean a main + backup pair requires
  reprogramming every button, twice.
- vMix #49/#110: input references are index numbers; users ask for GUIDs and for
  multiple target IPs.
- ATEM #102: the switcher's own model string does not match the model name the
  control layer expects, and control fails.
- TriCaster #26: IP-only addressing breaks touring setups that change subnet per
  venue; NetBIOS name requested.
- Companion #1738 and #642: no way to keep a main and a backup configuration in
  sync; export/import races when two machines are edited.

INFERENCE: **this is the single most consistent structural complaint in the
segment and the one least served by existing products.** Every one of these
people is asking for the same thing: a stable logical name for a role ("the
main switcher", "camera 3") that resolves to different physical addresses in
different contexts. OMT's virtual-sender redirect is the only shipping design in
the corpus that does it properly. Nothing in the *planning* layer does it at all.

### 5. Configuration is machine-local state, not a document (recurring)

Companion #1738 (open five years), #642, and #3063 (import loses all pages but
the first); OBS profile export broken on two platforms for a release (#5599,
#6298); OBS portable mode writing outside its own directory (#10486); Videohub
#9 — 42 comments over four years asking for a named, recallable routing state.

INFERENCE: **nobody in this segment treats the show configuration as a portable,
versionable, reviewable document.** It is a blob you export at your peril and
import at your peril, living on one machine. That is a document-shaped problem
being solved with app-shaped tools, and it is the gap with the clearest
commercial daylight.

### 6. Long sessions degrade — audio drift and connection decay (widespread)

OBS #4531: monitoring buffer drift, open five years, 60 reactions. DistroAV
#742: NDI audio desync after 2–3 hours, open, 20 reactions, workaround is to
restart OBS mid-show. vMix #214/#227: module dies after hours, memory grows
first. ATEM #168: connection lost after ~1.5 h; #479 (open, 2026-08): connection
lost after a day or two. OBS #9056 and #10636: macOS capture degrades after
hours.

INFERENCE: this segment is tested in short sessions and deployed in long ones.
The 8-hour conference day, the 3-day festival and the permanently-installed
worship system are all outside the tested envelope. Anything that helps an
engineer *plan for scheduled restarts* is encoding a real operational practice.

### 7. Integration and authentication are mutually exclusive (recurring)

TriCaster's documented setup step is to **turn the LivePanel password off**, and
the request to support a password (#57) is open and unanswered. obs-websocket
binds globally by default with no localhost-only option, no scoping and no
per-client approval (#907, open since 2022) — while a different user cannot get
LAN access at all through the firewall (#608). ATEM has no authentication in
evidence anywhere.

INFERENCE: **the segment's security posture is "trust the VLAN".** That is
survivable in a truck and indefensible in a corporate or campus network, which
is where a growing share of this equipment now lives. Any product that documents
which control ports must be open, on which VLAN, with what exposure, is
addressing a real and worsening gap.

### 8. The free integration layer is load-bearing and under-resourced (recurring)

Companion's most-upvoted open requests are dark mode (2019), a screensaver
(2019), animated buttons, and icon fonts — all cosmetic-sounding, all actually
operational (dark control room, OLED burn-in, at-a-glance legibility), all open
five to seven years. Its own maintainer's architectural fix (#1187) is six years
open. Stream Deck detection has failed on every platform for seven years. 53
switcher/router/multiviewer module requests sit unfulfilled.

INFERENCE: paid productions depend on volunteer capacity, and the queue is the
constraint. That is a durable market condition, not a temporary one.

---

## Direct quotes-of-substance

All paraphrased from issue bodies or primary documents I opened and read. No
verbatim quotation marks are used except where the phrase is short and I read it
exactly as written. Dates are the issue's creation date.

1. **A KAIROS operator on why redundancy costs double** — because control is
   bound to per-unit IDs, running a main and a backup frame means reprogramming
   every Companion button for each unit, which becomes very time-consuming for
   complex shows; simply pointing the connection at the other frame's IP does not
   work because the IDs differ per unit.
   <https://github.com/bitfocus/companion-module-panasonic-kairos/issues/19>
   (2024-08-16, open)

2. **The vMix module's own documentation, on the cost of watching vMix** — if you
   see high vMix CPU usage while the Companion instance is enabled, increase the
   polling interval to slow down API polling. Default 250 ms, minimum 100 ms, 0
   to disable.
   <https://raw.githubusercontent.com/bitfocus/companion-module-studiocoast-vmix/master/companion/HELP.md>
   (read 2026-08-29)

3. **A vMix user who eliminated everything else** — vMix runs 14 hours without
   drops when Companion is not connected, and starts dropping frames and
   glitching audio within an hour when it is; two Companion clients on the same
   network make it markedly worse. Windows build, ASIO drivers, network, cabling,
   NIC, project complexity, vMix version and Blackmagic drivers were all tested
   and ruled out.
   <https://github.com/bitfocus/companion-module-studiocoast-vmix/issues/48>
   (2020-11-04)

4. **An ATEM owner trapped between firmware versions** — third-party support
   stopped at firmware 8.1; they installed 8.5, connection became impossible, and
   downgrading the ATEM back to 8.1 was also not possible.
   <https://github.com/bitfocus/companion-module-bmd-atem/issues/89>
   (2020-10-25)

5. **The ATEM module's HELP file, on the limits of knowledge** — firmware 7.5.2
   and later are known to work, others may have problems, and versions after 20.2
   are not verified to be working at the time of writing but "likely will work
   fine".
   <https://raw.githubusercontent.com/bitfocus/companion-module-bmd-atem/main/companion/HELP.md>
   (read 2026-08-29)

6. **The documented workaround for an ATEM that cannot report its own state** —
   Companion cannot always detect that a macro ran, because zero-length macros
   report nothing; the fix is to give the macro a one-frame pause.
   Same source as (5).

7. **The TriCaster module's first configuration instruction** — on the TriCaster,
   under Administration Tools, turn off the LivePanel password. A user asked
   nineteen months later whether password support was coming; the issue is open
   and unanswered.
   <https://raw.githubusercontent.com/bitfocus/companion-module-newtek-tricaster/master/companion/HELP.md>
   and <https://github.com/bitfocus/companion-module-newtek-tricaster/issues/57>
   (2025-01-30, open)

8. **A TriCaster user whose controller took down the switcher** — using the
   Companion module randomly crashed TriCaster functions: the TriCaster GUI froze
   and all monitor windows went black and stopped responding to mouse clicks,
   though the Stream Deck kept working.
   <https://github.com/bitfocus/companion-module-newtek-tricaster/issues/12>
   (2021-06-08)

9. **The Videohub request that has waited four years** — a user running a 40×40
   Videohub switches between a baseball and a softball routing configuration
   daily and wants buttons that recall a whole saved routing state rather than
   re-entering routes from paper; they note Companion already reads the routing
   table from the device. 42 comments, still open.
   <https://github.com/bitfocus/companion-module-bmd-videohub/issues/9>
   (2020-10-28)

10. **The Videohub module's own note on why large routers are different** —
    presets are not available for all input and output combinations on the larger
    models because generating them causes stability issues; users are told to
    take an existing preset and edit it to the right input and output.
    <https://raw.githubusercontent.com/bitfocus/companion-module-bmd-videohub/master/companion/HELP.md>
    (read 2026-08-29)

11. **A Companion user with three machines and no source of truth** — three macOS
    machines each run Companion and two Stream Decks move between them depending
    on the day and event; a config change on one must be exported and imported to
    the others, and things go wrong if two machines are updated before the
    export/import happens. They ask for either shared cloud config or a
    host/slave arrangement. Open since 2021.
    <https://github.com/bitfocus/companion/issues/1738> (2021-09-28)

12. **A Companion user asking for the show model to become a visual output** —
    Companion already holds the data, so it should be able to generate a usable
    set of outputs for displays during productions, on external monitors,
    Raspberry Pis or secondary machines, natively rather than via a third-party
    app.
    <https://github.com/bitfocus/companion/issues/2271> (2023-01-08, 11 reactions)

13. **Companion's maintainer diagnosing his own data model** — module authors
    must expose the same device property separately as an action, a feedback and
    a variable, which duplicates work and produces inconsistency between modules;
    the proposal is a single property declaration with type, range, instances,
    get/set/subscribe and a change notification, from which core derives all
    three surfaces. Open since 2020, milestoned v5.z.
    <https://github.com/bitfocus/companion/issues/1187> (2020-07-31)

14. **The obs-websocket security argument** — binding globally by default lets
    anyone who reaches the port create scenes, write files, access audio inputs,
    trigger hotkeys, read config files that may contain secrets and reach private
    media; the requests are a localhost-only checkbox, port randomisation,
    no-route options, a browser toggle, insecure-config warnings, scoped
    permissions and per-client approval, on the argument that security is about
    layers. Open since 2022.
    <https://github.com/obsproject/obs-websocket/issues/907> (2022-02-08)

15. **An OBS user restarting mid-show to fix NDI audio** — audio desyncs from
    video after two to three hours of streaming, so a six-hour stream requires
    restarting OBS on the source machine every two to three hours; disabling
    preview on the streaming PC helps, and logs show no audio buffering errors.
    Open, 20 reactions.
    <https://github.com/DistroAV/DistroAV/issues/742> (2022-06-20)

16. **An OBS vertical-video user pinned to an old version** — the macOS virtual
    camera device is hardcoded to 1920×1080 so a 9:16 canvas comes out cropped;
    the reporter reverted to OBS 29 to keep working, which breaks their projects
    because of plugin updates. A maintainer explains in-thread that the
    resolution is hardcoded because exposing multiple resolutions to the macOS
    subsystem was not solved.
    <https://github.com/obsproject/obs-studio/issues/10263> (2024-02-19)

17. **The Open Media Transport bandwidth table, read as a planning constraint** —
    1080p60 needs 260 Mbps at High quality, 200 at Medium, 86 at Low; 2160p60
    needs 600 / 300 / 200 Mbps. Quality is negotiated at runtime and the sender
    adopts the highest quality any receiver requests.
    <https://raw.githubusercontent.com/openmediatransport/.github/main/profile/README.md>
    (read 2026-08-29)

18. **The notice on OMT's core library tracker** — issue creation is restricted in
    this repository.
    <https://github.com/openmediatransport/libomtnet/issues?q=is%3Aissue>
    (read 2026-08-29)

---

## What this suggests for AV Planner Suite

Kept short and clearly marked as INFERENCE. This is analysis, not evidence.

1. **Model firmware and software versions as first-class, and surface
   untested combinations.** Pattern 2 is unambiguous: there is no compatibility
   contract in this segment. Recording "ATEM Constellation 2ME HD, firmware
   9.6.3, driven by Companion module 3.21.2" and flagging it as an untested
   combination is knowledge nobody currently writes down.

2. **Make logical identity portable.** Pattern 4 is the highest-value unserved
   need found. A role ("main switcher", "backup switcher", "camera 3") that
   resolves to different addresses per context, per venue, per redundancy leg, is
   what KAIROS, vMix, TriCaster and Companion users are all separately asking for.

3. **Treat the show configuration as a document, not machine state.** Pattern 5.
   Versionable, diffable, reviewable, portable between machines — the thing
   Companion #1738 has been asking for since 2021 and OBS profile export never
   reliably delivered.

4. **Routing snapshots as named, planned states.** Videohub #9 is a four-year-old
   request for exactly this, and the protocol already supports reading and writing
   routes as a file. The missing layer is above the device: named per-event
   routing configurations authored off-line and recalled on the day. That is a
   planning artefact.

5. **Compute network capacity, don't just draw it.** The OMT bandwidth table and
   its runtime quality negotiation make gigabit capacity a real design
   constraint with a non-obvious failure mode. Cable Planner already models the
   physical plant; bandwidth-per-link arithmetic for OMT and NDI feeds is a
   natural and defensible extension.

6. **Document the control-plane security posture.** Pattern 7. Which ports, on
   which VLAN, with what authentication (including "none, because the vendor
   requires it disabled"). Nobody in this segment produces that document and
   every corporate and campus deployment is asked for it.

7. **Plan for scheduled restarts.** Pattern 6. Long-session degradation is real
   across four vendors. A schedule that says "restart the NDI source machine at
   the 3-hour break" is an operational practice engineers already follow
   informally.

---

## Sources

Every URL below was opened and read in this pass on 2026-08-29. Nothing here is
a search-engine snippet.

**GitHub search result pages (WebFetch)**

1. <https://github.com/search?q=repo%3Aobsproject%2Fobs-studio+is%3Aissue+is%3Aopen&type=issues&s=reactions-%2B1&o=desc>
2. <https://github.com/search?q=repo%3Aobsproject%2Fobs-studio+is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc&type=issues>
3. <https://github.com/search?q=repo%3Aobsproject%2Fobs-studio+is%3Aissue+is%3Aopen+label%3A%22Enhancement%22&type=issues&s=reactions-%2B1&o=desc> (0 results — confirms feature requests are not tracked here)
4. <https://github.com/search?q=repo%3Aobsproject%2Fobs-websocket+is%3Aissue+is%3Aopen&type=issues&s=reactions-%2B1&o=desc>
5. <https://github.com/search?q=repo%3ADistroAV%2FDistroAV+is%3Aissue+is%3Aopen&type=issues&s=reactions-%2B1&o=desc>
6. <https://github.com/search?q=repo%3Abitfocus%2Fcompanion+is%3Aissue+is%3Aopen&type=issues&s=reactions-%2B1&o=desc>
7. <https://github.com/search?q=repo%3Abitfocus%2Fcompanion-module-studiocoast-vmix+is%3Aissue&type=issues&s=comments&o=desc>
8. <https://github.com/search?q=repo%3Abitfocus%2Fcompanion-module-bmd-atem+is%3Aissue&type=issues&s=comments&o=desc>
9. <https://github.com/search?q=repo%3ALibAtem%2FLibAtem+is%3Aissue&type=issues&s=comments&o=desc>
10. <https://github.com/search?q=repo%3Anrkno%2Fsofie-atem-connection+is%3Aissue&type=issues&s=comments&o=desc> (0 results)
11. <https://github.com/search?q=vmix+api&type=repositories&s=stars&o=desc>
12. <https://github.com/search?q=atem+blackmagic&type=repositories&s=stars&o=desc>

**Individual GitHub issue and repository pages (WebFetch)**

13. <https://github.com/obsproject/obs-studio/issues/4531>
14. <https://github.com/obsproject/obs-websocket/issues/907>
15. <https://github.com/DistroAV/DistroAV/issues/742>
16. <https://github.com/bitfocus/companion/issues/1187>
17. <https://github.com/bitfocus/companion/issues/2271>
18. <https://github.com/bitfocus/companion-module-bmd-videohub/issues/9>
19. <https://github.com/bitfocus/companion/issues>
20. <https://github.com/bitfocus/companion-module-newtek-tricaster>
21. <https://github.com/openmediatransport>
22. <https://github.com/openmediatransport/omtplugin/issues?q=is%3Aissue>
23. <https://github.com/openmediatransport/libomtnet/issues?q=is%3Aissue>
24. <https://github.com/Lawo/ember-plus>

**Primary documents (raw.githubusercontent.com, read in full or in large part)**

25. <https://raw.githubusercontent.com/bitfocus/companion-module-bmd-videohub/master/companion/HELP.md>
26. <https://raw.githubusercontent.com/bitfocus/companion-module-studiocoast-vmix/master/companion/HELP.md>
27. <https://raw.githubusercontent.com/bitfocus/companion-module-newtek-tricaster/master/companion/HELP.md>
28. <https://raw.githubusercontent.com/bitfocus/companion-module-bmd-atem/main/companion/HELP.md>
29. <https://raw.githubusercontent.com/DistroAV/DistroAV/master/README.md>
30. <https://raw.githubusercontent.com/openmediatransport/.github/main/profile/README.md>

**Repository-scoped semantic issue searches (MCP GitHub search endpoint,
returning issue bodies verbatim)**

31. `obsproject/obs-websocket` — API limitations / missing requests (28 results)
32. `obsproject/obs-websocket` — security, authentication, network binding (3 results)
33. `obsproject/obs-studio` — crash / freeze / dropped frames / encoder overload (153 results)
34. `obsproject/obs-studio` — plugin incompatible after update / ABI (388 results; full result set saved and tabulated)
35. `obsproject/obs-studio` — scene collection portability / absolute paths (0 results)
36. `obsproject/obs-studio` — portable project file paths between computers (4 results)
37. `obsproject/obs-studio` — multiple canvases / vertical output (11 results)
38. `bitfocus/companion` — crash / memory leak / Stream Deck disconnect (61 results)
39. `bitfocus/companion` — export/import config, duplicate setup, replicate between machines (3 results)
40. `bitfocus/companion` — visual layout view, dark mode, animation, screensaver (2 results)
41. `bitfocus/companion-module-bmd-atem` — firmware broke protocol / unsupported model (31 results)
42. `bitfocus/companion-module-studiocoast-vmix` — disconnect / actions not firing (31 results)
43. `bitfocus/companion-module-bmd-videohub` — labels, routing, timeouts (8 results — the complete tracker)
44. `bitfocus/companion-module-panasonic-kairos` — connection, API, documentation (3 results — the complete tracker)
45. `bitfocus/companion-module-newtek-tricaster` — crash / firmware / macros / connect (8 results — the complete tracker)
46. `bitfocus/companion-module-requests` — multiviewer / switcher / router integration requests (53 results)
47. `DistroAV/DistroAV` — NDI runtime, licence, redistribution, rename (49 results)
48. `openmediatransport/omtplugin` — discovery, latency, dropped frames, network (0 results)

**Domains probed and confirmed blocked** (documented in Method; no content
retrieved, listed here so the gap is auditable): obsproject.com,
discourse.obsproject.com, ideas.vmix.com, forums.vmix.com, www.vmix.com,
docs.vmix.com, kb.vmix.com, forum.blackmagicdesign.com, bitfocus.io,
www.reddit.com, old.reddit.com, news.ycombinator.com, stackoverflow.com,
superuser.com, www.g2.com, www.capterra.com, www.trustradius.com,
openmediatransport.org, www.vizrt.com, www.lawo.com, www.rohde-schwarz.com,
pro-av.panasonic.net, www.controlbooth.com, blue-room.org.uk,
www.film-tv-video.de, www.production-partner.de.
