# Pain points: Media Server / Playback / Show Playback

Research date: 2026-08-29 (brief dated 2026-08-28).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Language of corpus: English (repo docs mix DE/EN; research corpus stays EN).

---

## Method

### Read this first — what this pass could and could not reach

This pass ran under two hard limits that shaped the evidence base. Stating them
up front so the dossier is not over-read.

1. **The session's web-search budget was already exhausted** (200/200 WebSearch
   calls consumed by earlier passes in the same session). **Zero search queries
   completed in this pass.** The brief asked for 8–15 distinct searches; that
   part of the method is **unexecuted**.
2. **Network egress policy blocked almost every non-GitHub host.** Confirmed
   blocked at the proxy during this pass (each returned `EGRESS_BLOCKED` or a
   hard fetch refusal):
   `reddit.com`, `qlab.app`, `obsproject.com` (incl. the OBS forums),
   `community.xibo.org.uk`, `controlbooth.com`, `film-tv-video.de`,
   `html.duckduckgo.com`, `lite.duckduckgo.com`.
   **Reachable and used: `github.com`, `raw.githubusercontent.com`, and (thinly)
   `gitlab.com`.**

**Consequence, stated plainly: this dossier is strong on control-API,
integration, protocol and open-source-maintenance pain, and near-silent on
pricing, licence models, purchasing sentiment, and end-user UX opinion.**
Nothing here should be read as "users do not complain about QLab's price" or
"Watchout 7's UI is fine" — it should be read as "I could not reach the places
where those complaints are written." The Reddit angle, the review-site angle
(G2/Capterra/TrustRadius/Trustpilot), the professional-forum angle
(ProSoundWeb, Blue Room, ControlBooth, AVSForum, Blackmagic forum, vMix forum)
and the German-language angle (film-tv-video.de, production-partner.de,
veranstaltungstechnik forums) are **all unexecuted**.

**No prices appear in this dossier.** The brief asked for prices labelled with
date-seen and source URL. Every vendor pricing page was unreachable, so rather
than reconstruct prices from memory, the pricing sections below are marked
UNKNOWN with a note on what would need to be checked. This is deliberate: a
fabricated price is worse than an absent one.

### What was actually read

**54 distinct pages opened and read first-hand**, plus 4 GitHub repository-search
result sets. Breakdown:

- **Integrator issue trackers (Bitfocus Companion modules), 13 repositories** —
  read in full or filtered: `figure53-qlab-advance`, `dataton-watchout`,
  `dataton-watchout-json`, `wtav-watchout-director-control`, `resolume-arena`,
  `twoloox-pandorasbox`, `avstumpfl-pixera`, `disguise-osc`, `disguise-mtc`,
  `disguise-smc`, `studiocoast-vmix`, `obs-studio`, `casparcg-server`, plus the
  main `bitfocus/companion` tracker.
  These are the single most valuable source in this segment: they are written by
  integrators working against the real vendor APIs under show conditions, and
  several carry explicit "this cannot be done because the vendor API does not
  expose it" labels.
- **Vendor-adjacent `companion/HELP.md` documents read verbatim** via
  `raw.githubusercontent.com` for eight modules. These contain "Notes &
  Limitations" sections written by people who reverse-engineered the protocol.
- **Product issue trackers**: `CasparCG/server`, `CasparCG/client`,
  `obsproject/obs-studio`, `obsproject/obs-websocket`, `xibosignage/xibo`,
  `xibosignage/xibo-dotnetclient`, `sagiadinos/garlic-player`, `FonograF/Inkue`.
- **Primary changelog**: `CasparCG/server/CHANGELOG.md` (the brief's "what they
  keep fixing IS what keeps breaking" angle — the only vendor changelog I could
  reach).
- **"Why I built this" READMEs of QLab-alternative / QLab-workaround projects**:
  `tdoukinitsas/liveplay`, `FonograF/Inkue`, `tbsounddesigns/cuebilt`,
  `okofish/qlab-html`, plus the issue trackers of `bsmith96/Qlab-Scripts`,
  `marsvaardig/osc-node`, `jshea2/OSC-for-OBS`. The **existence** of these
  projects is evidence of a gap; their issue trackers show whether the gap is
  still open.
- **Org repository listings**: `xibosignage` and `Figure53` (used to establish
  what is and is not open source — a lock-in question answerable from primary
  evidence).

### Evidence-strength convention used below

- **FACT** — read on a page I opened; URL given in Sources.
- **INFERENCE** — my reasoning from one or more facts; flagged as such.
- **UNKNOWN** — I could not verify it; I say what would need checking.
- Frequency: **isolated** (one report) / **recurring** (several independent
  sources) / **widespread** (a theme visible across many vendors or a
  long-standing, heavily-referenced pattern).

A note on frequency honesty: because the consumer-sentiment sources were
blocked, "widespread" in this dossier means *observed across multiple
independent vendor ecosystems*, not *many angry users counted*. Where I would
normally have counted upvotes on Reddit, I counted independent integrator
repositories instead.

---

## Per-product findings

### QLab 5 (Figure 53)

- **STRENGTHS (conceded even by the people building alternatives)**
  - FACT: The OSC API is complete enough that a whole ecosystem is built on it —
    Figure 53 themselves publish `QLabKit.objc`, `F53OSC` and `qlab-ruby` as
    public client libraries, and third parties ship AppleScript libraries,
    HTML exporters and CSV importers against it. That breadth of third-party
    tooling does not exist for most competitors in this segment.
  - FACT: The Companion module documents that QLab exposes enough state for
    real feedback and variables — playhead cue number/name, elapsed time,
    prewait — provided you connect over TCP.
  - INFERENCE: The alternatives (Inkue, LivePlay) both describe themselves as
    following "established show-control conventions" so that "experienced
    operators feel at home immediately" — i.e. they are copying QLab's cue-list
    model rather than replacing it. That is a concession that the data model is
    right.

- **WEAKNESSES**
  - FACT: **Cue numbers containing `$`, `(` or `)` break variables and
    feedbacks** in the reference integration. The module HELP explicitly warns
    about this. (Frequency: recurring — it is documented as a standing caveat,
    not a one-off bug.)
  - FACT: **The unique cue ID — the identifier the API is supposed to be
    addressed by — is not visible to controllers without a dedicated "Copy
    Unique Cue ID" action.** So the immutable identifier that QLab 5 promotes
    for programmatic use is awkward to obtain, which pushes integrators back to
    the deprecated cue numbers.
  - FACT: **Variables and feedback are only available in TCP mode**, and the
    module warns TCP "may cause a noticeable increase in network traffic."
    UDP — the simpler, more robust transport for a show network — gives you
    fire-and-forget control with no state back.
  - FACT: **Playhead variables for one cue list go empty when a cue fires in a
    different cue list** (open bug, Oct 2025, still open). Root cause is not
    established in the thread — it may be the module or may be QLab's OSC
    notification scoping. Marked as partially UNKNOWN.
  - FACT: **Custom OSC commands cannot carry multiple string arguments**
    (open bug, Jun 2026).

- **MISSING FEATURES (what users ask for)**
  - FACT: Elapsed-time variable for cue prewait (open, Aug 2026).
  - FACT: Ability to skip to next/previous element inside a playlist group cue
    (open, Oct 2025).
  - FACT: Full expressions in "goto cue by cue number" (open, Oct 2025).
  - FACT: **Bulk cue-list creation from a spreadsheet.** `CueBilt` exists solely
    to take a TSV cue sheet and build a skeleton cue list in QLab — described as
    taking "the hassle and time out of the first steps to building a QLab
    workspace." An older tool, `csv_to_qlab`, does the same thing.
    INFERENCE: two independent tools solving the same import problem means QLab
    has no first-class bulk-import path. (Frequency: recurring.)
  - FACT: **Paperwork export.** `qlab-html` exists to render "QLab workspaces as
    self-contained HTML documents, which can then be printed or saved to PDF
    from your browser." INFERENCE: this is a workaround for weak native
    print/export. Note the tool was last touched Aug 2026, so the need appears
    current.
  - FACT: **Batch editing.** Two separate AppleScript collections
    (`bsmith96/Qlab-Scripts`, `samschloegel/qlab-scripts`) exist to "automate
    repetitive tasks" — creating fade cues in bulk, line checks, ganging, save-
    new-version. INFERENCE: repetitive multi-cue edits are not first-class in
    the UI.

- **UX PROBLEMS**
  - INFERENCE (from tooling, not from user reports — the forums were blocked):
    the three workaround categories above (bulk import, paperwork export, batch
    edit) all point at the same UX shape — QLab is excellent at *running* a cue
    list and weak at *authoring one at scale*. I could not verify this against
    user statements. **This is the single biggest gap in this dossier and should
    be confirmed against r/techtheatre and the QLab community forum before it is
    used to justify product decisions.**

- **PERFORMANCE PROBLEMS** — UNKNOWN. No performance complaints surfaced in the
  reachable sources. Would need the Figure 53 forum and macOS-specific threads.

- **PRICING PROBLEMS** — UNKNOWN. `qlab.app` is blocked; I have no verified
  price, licence tier or rental-model detail and will not guess.
  What to check: the QLab pricing page (licence tiers vs rental/"per-day"
  model), and whether feature gating by tier (video, timecode, network cues) is
  what drives users to alternatives.

- **LOCK-IN**
  - FACT: **macOS only.** Both credible open alternatives lead with cross-
    platform support as their headline differentiator — Inkue: "Windows, macOS
    and Linux"; LivePlay: "Cross-platform (Windows, macOS, Linux) with no vendor
    lock-in". INFERENCE: platform lock-in is the primary stated reason to leave.
    (Frequency: recurring — two independent projects, both started within the
    last 10 months, both leading with the same claim.)
  - FACT: **Workspace format is not exportable to a human-readable document
    natively** — `qlab-html` has to pull the workspace out **over OSC**, cue by
    cue, to produce printable paperwork. INFERENCE: there is no documented file-
    level export path a third party could use instead.
  - FACT: **Figure 53 publishes client libraries but no public issue tracker or
    OSC specification repository.** Their 18 public repos are client libraries
    and utilities (F53OSC, QLabKit.objc, qlab-ruby, QDisplay, QView, ActionSync)
    — there is no `Figure53/QLab` issues repo. INFERENCE: bug reports and
    feature requests go into a private channel, so there is no public record of
    what is long-requested and unfixed. That is itself a research obstacle and,
    for buyers, a roadmap-transparency problem.

- **OFFLINE**
  - FACT: Control is local OSC over TCP/UDP on port 53000 — no cloud in the
    control path.
  - FACT: **From QLab 5.2 a passcode is required**, and "QLab will ignore any
    commands if an incorrect passcode is sent too many times in a row." The
    module's automatic reconnect **stops** on a passcode error and requires a
    human to retype and save the passcode.
    INFERENCE: this is an offline/unattended-operation hazard — a controller
    that reboots with a stale passcode locks itself out of the show machine and
    cannot self-heal. (Frequency: recurring — documented as standing behaviour.)
  - UNKNOWN: whether licence activation itself requires periodic internet
    contact. Needs the Figure 53 licensing page.

- **INTEGRATION PROBLEMS**
  - FACT: QLab 3 is "detected" but "some features may not work"; QLab 4.7 support
    is best-effort — "will be continued when possible." Version churn is pushed
    onto integrators.
  - FACT: QLab 5.2+ requires module ≥ 2.1.0 — a QLab point release broke
    existing controller installs. (Frequency: recurring; a QLab 5.5 feedback-
    compatibility issue was separately opened and closed in 2026.)
  - INFERENCE: the combination of "identity is a UUID you can't easily read" +
    "numbers are deprecated but are what you actually type" is the segment's
    cleanest example of an identity model that is right in theory and awkward in
    practice.

---

### CasparCG Server (community / SVT origin)

- **STRENGTHS**
  - FACT: It is the only production-grade open-source playout engine in the
    segment and is still actively developed — the changelog shows 2.5.0 shipping
    an FFmpeg 7 update and a CEF update to version 142.
  - FACT: AMCP is a plain-text TCP protocol with transactional batching, which
    means anyone can drive it from anything without an SDK.
  - FACT: Hardware-integration bugs do get fixed: the Decklink driver 14.3
    breaking change was addressed in 2.4.2 and 2.5.0.

- **WEAKNESSES**
  - FACT: **Feature requests sit open for eight to nine years.** The most-
    reacted open issues include a system-audio producer (#653, Nov 2017),
    process isolation for producers/consumers (#635, Oct 2017), volume per audio
    channel at layer level (#652, Nov 2017), server-side AMCP scripting (#804,
    Feb 2018), OSC layer status (#857, Feb 2018), an Unreal/Unity producer
    (#962, Apr 2018), replacing the DIAG window (#899, Mar 2018), and SRT
    in/out (#1251, Feb 2020). All still open as of Aug 2026.
    (Frequency: widespread within the project — this is the shape of the whole
    top-of-tracker.)
  - FACT: **Fixes are not backported.** For the Decklink 14.3 break, "no patches
    are planned for older versions" — 2.4.1 and earlier simply stop working with
    current Blackmagic drivers. INFERENCE: a facility that standardised on an
    older CasparCG is forced into a version upgrade by a *driver* update it did
    not choose.
  - FACT: **The official client is in worse shape than the server.** Open issues
    in `CasparCG/client` include a rundown loaded via startup parameter
    producing no output (open since Mar 2021), TRT in rundown not updating when
    the target changes (open since Mar 2020), live streaming to client broken in
    2.3.0 (Nov 2024), and a suspected Windows memory leak in client 2.3.1
    (Dec 2025).

- **MISSING FEATURES (requested)**
  - FACT: SRT input and output (#1251, open since 2020) — significant given SRT
    is now standard contribution transport.
  - FACT: Layer-specific filtering on the INFO command (#1289, Apr 2020) — i.e.
    you cannot cheaply ask about one layer, you get the whole tree.
  - FACT: Custom filter presets for AFILTER/VFILTER (#680, Jan 2018).
  - FACT: `RFC: auto play for infinite length producers` (#1644, Jun 2025) —
    the only recent one in the top-reacted list.
  - FACT: From the Companion module tracker: `PLAY` cannot load HTML content
    (#41, Aug 2025); `CG INVOKE` unimplemented (#38, Nov 2024); **CG commands
    are undocumented** (#18, open since Dec 2022); no variables for clip file
    name and time remaining (#19, Feb 2023).

- **UX PROBLEMS**
  - FACT: "Replace DIAG window with external app" has been an open request since
    March 2018 — the built-in diagnostics window is acknowledged as inadequate
    by the project itself.
  - INFERENCE: the real UX problem is that CasparCG is an engine with no
    first-party show-authoring surface. The client is the de-facto UI and it has
    2020- and 2021-vintage open bugs.

- **PERFORMANCE / STABILITY PROBLEMS**
  - FACT (from the changelog — "what they keep fixing is what keeps breaking"):
    the recurring fix areas across releases are **FFmpeg/decoding** ("fix crash
    on invalid frame header" in 2.4.3, build failures with FFmpeg 7.0 in 2.4.1),
    **Decklink** ("Crash with ffmpeg 7" #1582 in 2.4.3, subregion copy not
    respecting frame height in 2.4.1), **audio cadence for fractional/NTSC
    framerates** (2.5.0 and back to 2.3.0 Beta 1), **HTML/CEF** ("gracefully
    handle page load errors" in 2.5.0, "fix crash during uninit on exit" in
    2.4.3), and **memory/threading** (deadlock leaving a producer uncleaned, CPU
    and memory growth when deleting threads, both 2.3.2).
    INFERENCE: decoder-layer and Decklink-layer instability is chronic, not
    incidental. A planning tool should assume CasparCG channels are pinned to a
    specific driver/server-version combination.
  - FACT: Current open reports include "Mass spam of 'stack smashing detected'"
    (#1781, Aug 2026), a crash decoding multiple SRT inputs in a GRID mixer on
    headless Linux (#1698, Jan 2026), stutter with Intel UHD630 at 1080p50
    (#1717, Mar 2026), and Bluefish444 failing to initialise (#1767, Jul 2026).

- **PRICING PROBLEMS**
  - FACT: GPLv3, no licence cost. INFERENCE: the cost is support — there is no
    vendor to call, and the eight-year-old open issues are what "community
    support" looks like in practice. That is the real "pricing problem" for a
    broadcaster.

- **LOCK-IN** — FACT: minimal. GPLv3, plain-text protocol, no proprietary
  project format in the control path. This is the segment's low-lock-in option.

- **OFFLINE** — FACT: fully local; AMCP over TCP, no cloud dependency observed.

- **INTEGRATION PROBLEMS**
  - FACT: `AMCP end of message` (#1391) has been open as an enhancement since
    Sep 2021 — i.e. **framing the end of a response is still not cleanly
    specified**, which is a genuine parser hazard for anyone writing a client.
  - FACT: The undocumented CG command family (open since 2022) means template
    graphics control is learned by reading source or asking.

---

### Watchout 7 (Dataton)

- **STRENGTHS**
  - FACT: The v7 HTTP/JSON API on port 3019 with **Server-Sent Events** gives
    "instant feedback for playback states, input changes, and media presets" —
    genuinely event-driven, which most of this segment is not.
  - FACT: There is a documented, versioned semantic surface (`/api/v1`) that
    addresses timelines, cue sets and variables **by name or id**.

- **WEAKNESSES**
  - FACT, and this is the most important single finding about Watchout:
    **"WATCHOUT does not report variable values back to controllers (its input
    API is write-only)."** A controller can only display "the last value set."
    Getting a real value back requires configuring OSC or HTTP *output cues*
    inside the Watchout show to push data out — i.e. the show file must be
    authored to make its own state observable.
    INFERENCE: this materially undercuts the "cleanest modern API in the
    segment" framing from the landscape pass. The *transport* is modern; the
    *state model* is still one-way for variables. (Frequency: recurring —
    documented as a standing caveat by the integrator.)
  - FACT: **Cue information is read-only** — names, times and states cannot be
    modified through the API.
  - FACT: Missing cues appear "only if they have valid names and start times in
    Watchout" — i.e. the API silently omits unnamed cues rather than exposing
    them by index.
  - FACT: Inputs are matched on a **Key** property that must be manually
    configured in variable properties inside Watchout Producer, **not** on the
    Name field. INFERENCE: a show authored without that discipline is simply not
    controllable, and the failure mode is silence rather than an error.
  - FACT: SSE alone is not trusted — the module runs a **30-second polling
    reconciliation** on top of it to catch structural changes. INFERENCE: the
    event stream does not emit structural change events, only state changes.
    Confirmed in practice by issue #23: newly created timelines appear
    immediately in actions but **require a module restart to appear in
    feedbacks** (open since May 2026).

- **MISSING FEATURES (requested)**
  - FACT: Instant timeline-list refresh for feedbacks (#23, open May 2026).
  - FACT: Cue-set command coverage was requested and added (#7, closed Jun 2025)
    — i.e. the API surface was incomplete at v7 launch and filled in later.

- **UX PROBLEMS** — FACT: from the older Watchout 6 module, "Problem with Set
  Layer Conditions" is open since Oct 2025 and "Operation" since Aug 2021.
  UNKNOWN: the Producer/Director UI itself — dataton.com was not reachable.

- **PERFORMANCE PROBLEMS** — UNKNOWN. Nothing in the reachable sources.

- **PRICING PROBLEMS** — UNKNOWN. Dataton's site was unreachable. What to check:
  whether Watchout 7 moved to subscription, and whether node/display count is
  the licensing axis.

- **LOCK-IN**
  - FACT: Node management requires **direct IP access to each node on port
    3017**, separate from the Director API on 3019. INFERENCE: the control
    network must be planned as two flat, routable planes; this is a real
    network-design constraint, not just an API detail.
  - FACT: "Show loading failures occur when file paths aren't accessible from
    the Director system" — the show is path-coupled to the Director machine.

- **OFFLINE** — FACT: local HTTP/SSE, no cloud in the control path observed.

- **INTEGRATION PROBLEMS**
  - FACT: The module is tested against 7.5.1 and "older versions might not work
    correctly because of newer API" features. Version-pinning is required.
  - FACT: There are now **three** separate Companion modules for Watchout
    (`dataton-watchout` for the legacy TCP protocol, `dataton-watchout-json` for
    v7, and a third-party `wtav-watchout-director-control` created Aug 2026).
    INFERENCE: the v6→v7 protocol break was total, and integrations do not carry
    over.
  - FACT: The newest module requires **Companion 5.0+** and explicitly drops
    support for Companion 3.x and older, with legacy builds available only by
    emailing the vendor. INFERENCE: controller-side version churn compounds
    media-server-side version churn.

---

### disguise Designer

- **STRENGTHS**
  - FACT: disguise is the only vendor in this segment separating control planes
    cleanly — OSC for show transport, MTC (JSON over telnet) for multi-transport
    cluster control, SMC for hardware management. The SMC plane reports real
    operational data: serial number, device role, system power state, **power
    overload, main power fault, power control fault**, LED strip state — and
    offers remote power on/off, power cycle, LCD flash and notifications.
    INFERENCE: no other product here exposes hardware fault state as a first-
    class control plane. For a planning/monitoring tool this is the richest
    machine-facing surface in the segment.

- **WEAKNESSES**
  - FACT: **OSC control is degraded unless the disguise session is configured to
    "always send" OSC feedback.** Full functionality is conditional on a
    show-side setting.
  - FACT: **Fade down and hold have no status feedback.** The integrator
    documentation carries an open to-do reading, in effect, "ask disguise if an
    output message can be added for status of fade down and hold" — i.e. the
    request is parked on the vendor. (This is the same "blocked on vendor"
    pattern seen at vMix and Resolume.)
  - FACT: OSC variable substitution works **only for numeric input (integer or
    float)**. Non-numeric parameters cannot be driven from variables.
  - FACT: If a variable fails to resolve, "the action will log a debug message
    and abort" — no fallback, no retry, and the failure is only visible in a
    debug log. INFERENCE: a silent no-fire during a show. This is the worst
    error-handling behaviour documented in this pass.
  - FACT: Open bugs: master brightness causes a NaN error on disguise (#32,
    Mar 2026); "play to end of section doesn't work" over OSC (#5, **open since
    Jun 2021**); "Module Upgrade: Disguise d3 OSC Feedback" (#3, **open since
    Feb 2020**).
  - FACT: SMC "might not (fully) work with older firmware versions."

- **MISSING FEATURES (requested)**
  - FACT: Presets for received data — section names and timecode — are listed as
    not yet done.
  - FACT: A combined fade preset.
  - FACT: Expanded d3 OSC feedback (open six years).

- **UX PROBLEMS**
  - FACT: MTC setup is a four-step chain — create a Multitransport Manager,
    assign transports, assign tracks to transports (or use setlist automation),
    add an event transport and configure its listening port — before any control
    is possible. INFERENCE: high setup friction, and the integrator
    documentation defers to the vendor help site rather than explaining it.

- **PERFORMANCE PROBLEMS** — UNKNOWN.

- **PRICING PROBLEMS** — UNKNOWN. Requires sales contact in this segment
  generally; I could not reach disguise.one to verify anything, including
  whether Designer is free for offline design work.

- **LOCK-IN**
  - FACT: **Five separate Companion modules exist for one product** — OSC, MTC,
    SMC, liveupdate (Oct 2025) and track-notes (Jun 2026).
    INFERENCE: the "three control planes" separation that reads as clean
    architecture from the vendor side reads as **five integrations to build,
    version and debug** from the integrator side. Each has its own port, its own
    auth story (SMC needs credentials), its own firmware/version floor.
  - FACT: MTC runs **JSON over telnet**. INFERENCE: unencrypted, unauthenticated
    cluster transport — a security and network-segmentation planning constraint.

- **OFFLINE** — FACT: all three planes are local network protocols. SMC requires
  network connectivity to the management port and valid SMC credentials.

- **INTEGRATION PROBLEMS**
  - The 2020/2021-vintage open OSC issues are the clearest signal: the OSC
    surface has not moved much in five to six years while the product has.

---

### Resolume Arena / Avenue

- **STRENGTHS**
  - FACT: Has both a REST/web API and OSC in/out (7000 out, 7001 feedback), and
    the integrator has been able to build clip-name variables, transport
    position, effect control and thumbnail feedback against it — a lot of the
    2026 issue traffic is *features being added*, not features being blocked.

- **WEAKNESSES**
  - FACT, and this is the headline: **"every time a button is pressed or an
    action is triggered, the module fetches the entire data state from the
    webserver."** The API "appears to lack granular data retrieval
    capabilities," so the integration must do "a full dump of the server's
    state." On large compositions during live performance this causes **network
    saturation, lag and freezing**. (Issue #146, closed Apr 2026 — closed does
    not necessarily mean the API gained granularity; INFERENCE: the fix was
    likely client-side mitigation. UNKNOWN which.)
  - FACT: **Two open feature requests are explicitly labelled as needing changes
    on the Resolume side**: layer-level transport position (#55, open since
    Feb 2024) and "closed" decks (#51, same date). For #55 the reporter notes
    that "in the app there is the option to get the time for a layer," but that
    capability **is not exposed through the API** — the endpoint
    `/composition/layers/{n}/transport/position` simply does not exist even
    though the per-clip equivalent does.
    INFERENCE: the API is a partial mirror of the UI, and the gaps are arbitrary
    rather than principled.
  - FACT: Addressing by grid position rather than identity produced concrete
    integration bugs — "Layer group column preset not working" and "Connect
    column by name" were both needed and both fixed only in Apr 2026. INFERENCE:
    until 2026 you could not reliably address a column by name.
  - FACT: A WebSocket `readyState` undefined bug (#149) indicates the feedback
    channel's connection lifecycle is not cleanly observable.

- **MISSING FEATURES (requested)** — FACT: layer transport position; closed
  decks; fullscreen / advanced fullscreen toggling (#100, open Sep 2024);
  expressions for columns and layers (#98, open Sep 2024).

- **UX PROBLEMS** — UNKNOWN (resolume.com forums unreachable).

- **PERFORMANCE PROBLEMS** — FACT: as above, full-state-dump-per-action is a
  documented live-show performance failure on big compositions. (Frequency:
  recurring — it is the single most substantive issue in that tracker.)

- **PRICING PROBLEMS** — UNKNOWN. Arena vs Avenue tiering is the known axis but
  I could not verify prices or what is gated.

- **LOCK-IN** — UNKNOWN beyond the API-mirror gap above.

- **OFFLINE** — FACT: REST on 8080 and OSC are local; no cloud observed.

- **INTEGRATION PROBLEMS** — The "API mirrors the UI, but incompletely, and the
  gaps are only discoverable by trying" pattern is the takeaway.

---

### Pandoras Box (twoloox / Christie)

- **STRENGTHS**
  - FACT: Deep SMPTE integration and per-sequence timecode are real and
    addressable; the integration polls timecode at 30 Hz while playing.

- **WEAKNESSES** — this is the weakest control surface documented in this pass.
  All three of these are stated as explicit known limitations by the integrator:
  - FACT: **"No feedback implementation yet (status display only via
    variables)."**
  - FACT: **"Cue discovery not implemented (manual cue ID entry required)."**
    You must type cue IDs by hand because the protocol will not enumerate them.
  - FACT: **"SMPTE mode cannot be read back (write-only command)."** You can put
    the server into a SMPTE mode but you cannot ask which mode it is in.
  - FACT: The PBAU binary protocol uses **mixed endianness — big-endian headers,
    little-endian sequence IDs.** INFERENCE: this is a protocol-design defect
    that guarantees implementation bugs in every new client.
  - FACT: Status polling runs at 5 Hz continuously and timecode polling at 30 Hz
    during playback. INFERENCE: there is no event/push channel at all — every
    piece of state costs a poll.

- **MISSING FEATURES (requested)**
  - FACT: "get current / next Cue ID" from Pandoras Box V8 — **open since
    Feb 2022**, unanswered. The requester writes only that it "would be amazing"
    to get current and next cue ID. (Whether PB can do this at all is UNKNOWN —
    the thread has no vendor answer, which is itself the finding.)
  - FACT: "Only next cue" — open since Nov 2019.

- **UX PROBLEMS** — INFERENCE: manual cue-ID entry is a UX problem for the
  *integrator*, and a documentation problem for the show — the mapping from cue
  name to cue ID lives in someone's notes, not in the system.

- **PERFORMANCE PROBLEMS** — INFERENCE: 30 Hz polling of a binary TCP socket per
  sequence, on the show machine, during playback. No measurements available.

- **PRICING PROBLEMS** — UNKNOWN.

- **LOCK-IN** — FACT: proprietary binary protocol (PBAU on 6211) with mixed
  endianness and no published feedback channel. INFERENCE: highest effective
  lock-in in this segment, because writing a second client is genuinely hard.

- **OFFLINE** — FACT: local TCP; no cloud observed.

- **INTEGRATION PROBLEMS** — The write-only SMPTE mode is the sharpest example
  in the whole segment of a control API you cannot build a reliable state
  machine against.

---

### Pixera (AV Stumpfl)

- **STRENGTHS**
  - FACT: JSON-RPC over TCP with raw method pass-through — an integrator can
    call arbitrary methods (e.g. the compound/timeline API) without waiting for
    the module to add an action. INFERENCE: this is the most programmable API in
    the segment and the right design; it converts "vendor must add a feature"
    into "integrator can do it today."

- **WEAKNESSES**
  - FACT: **Feedback is thin.** The documented feedback surface is button colour
    by timeline state, button text showing current timecode, and button text
    showing remaining time. That is essentially it.
  - FACT: "API Commands returns Handles if available" — return values are
    **inconsistent depending on the command**. INFERENCE: no uniform response
    contract, so error handling must be per-command.
  - FACT: Some commands are **version 2.0 only** and the documentation does not
    say which. INFERENCE: capability discovery is trial-and-error.
  - FACT: **"Blend to cue" has been broken or awkward repeatedly** — #18 "Next
    Cue with Blend To does not work" (2024), #6 "Latest Companion & Pixera Still
    Having Blend to Cue Issues" (2023), and #35 "Blend to Cue use default
    timing" still open (Mar 2026). (Frequency: recurring — three separate
    reports across three years on the same feature.)
  - FACT: Custom variables are not accepted in Set Audio Master Volume (#26,
    open since Sep 2025). Variable support has been requested repeatedly (#16,
    #4) and remains patchy.

- **MISSING FEATURES (requested)** — FACT: "Polling Feedback as variables"
  (#38, open Apr 2026) — i.e. users want the polled state surfaced as variables
  rather than only as button colours.

- **UX / PERFORMANCE / PRICING** — UNKNOWN. Nothing reachable.

- **LOCK-IN** — INFERENCE: low protocol lock-in (JSON-RPC, pass-through), high
  *knowledge* lock-in — because the method surface is undocumented in the
  integration layer, the value sits in whoever knows the method names.

- **OFFLINE** — FACT: local TCP.

---

### OBS Studio + obs-websocket

- **STRENGTHS**
  - FACT: obs-websocket 5 is bundled since OBS 28 — no plugin install, no
    version-matching dance for the base case. SHA256 challenge auth, event
    subscription bitmask, request batching. INFERENCE: technically the
    best-designed control API in this segment.
  - FACT: Free, GPLv2, cross-platform.

- **WEAKNESSES — OBS is not a playback engine, and it shows**
  - FACT: **"Looped .mp3 audio in media source plays a half-second dead spot"**
    (#12028, open since Apr 2025). Gapless looping does not work.
  - FACT: **"Cannot seek through playback with MediaSource in scene"** (#11857,
    open since Jan 2025). No frame-accurate scrub.
  - FACT: "OBS crash when using a media source to play back a file OBS recorded"
    (#13317, Apr 2026).
  - FACT: "Media Source not showing in Audio Mixer on macOS" in 32.1.0 (#13253,
    Mar 2026) — a regression.
  - FACT: "Sidechain on VLC is Delayed" (#11711, Jan 2025); "Re-Connection of
    RTSP stream not happening" (#12958, Dec 2025).
  - FACT: Top open issues by reaction are stability, not features: crash with
    explicit sync on Wayland (#11022, Jul 2024), audio monitoring buffer
    buildup / offsync on Windows (#4531, **open since Apr 2021**), unclean
    SIGTERM exit triggering the Safe Mode prompt on Linux (#10011, Dec 2023).
    INFERENCE: the audio-monitoring desync issue being open five years is the
    kind of thing that disqualifies OBS from show-critical audio.

- **WEAKNESSES — API**
  - FACT: **obs-websocket v5 events carry less data than v4 did.** The example
    in the long-running request (#983, open since Aug 2022) is
    `SceneTransitionStarted`, which now sends only the transition type, whereas
    v4's `TransitionBegin` included **duration, source scene and destination
    scene**. The reporter needs that at transition-start to run timed logic
    mid-transition; without it, integrators must make extra round-trips or
    maintain their own state mirror. The reporter states this is a pattern
    across multiple events, not one event.
    (Frequency: recurring — this is the second-most-reacted open issue.)
  - FACT: Long-open API gaps: audio mixer data requests/events (#1078, Dec 2022),
    create/remove inputs and scene items from groups (#1081, Dec 2022),
    program and preview screenshots (#1130, Apr 2023), quick transitions (#723,
    Apr 2021), browser-source interaction (#672, Feb 2021), advanced output
    settings (#575, Aug 2020), interruptible request batches (#1246, Aug 2024).
  - FACT: The downstream Companion module tracker shows the same shape from the
    other side — **multiple open items are explicitly waiting on obs-websocket
    changes**: stream delay status as variables (#353), set virtual camera
    output (#345), restart-OBS action (#320, open since Apr 2025), streaming
    time not the real one (#373). Plus "Current Media doesn't follow actual
    current media" (#363, Mar 2026) and "OBS Variable Stall" (#366, Mar 2026).
  - FACT: **No native OSC.** `jshea2/OSC-for-OBS` exists to bridge OSC to OBS and
    has 137 stars and 12 open issues; its tracker is full of theatre-workflow
    traffic — "Qlab to obs" (#23), "Problems to activate QLab cues from OBS after
    updating software" (#21), "OSC messages delay" (#28), "Media togglePlay"
    (#27), "Cursor media control doesn't work" (#31), plus Linux GPU/sandbox
    breakage (#33, #32).
    INFERENCE: the show-control world reaches OBS through a fragile community
    bridge, and that bridge's own tracker is the record of how fragile.

- **MISSING FEATURES** — as listed above; the audio-mixer API and richer events
  are the two most-wanted.

- **PRICING PROBLEMS** — FACT: none, it is free. INFERENCE: the cost shows up as
  the reliability gaps above.

- **LOCK-IN** — FACT: essentially none. GPLv2, open protocol, open scene format.

- **OFFLINE** — FACT: fully local; obs-websocket on 4455 with local auth.
  FACT: a security request to make binding options configurable (#907, Feb 2022)
  is still open — INFERENCE: the socket's binding surface is less controllable
  than a locked-down show network would want.

---

### vMix (StudioCoast)

- **STRENGTHS**
  - FACT: Broad and stable enough that the integration is mature and the issue
    tracker is mostly feature requests rather than breakage.
  - FACT: It exposes an HTTP API that can also consume Companion's own HTTP API
    and act as a data source inside vMix — bidirectional in a workflow sense.

- **WEAKNESSES**
  - FACT: **The API is polling-only, and polling costs the show machine CPU.**
    The integrator documentation carries an explicit warning: *"If you experience
    high vMix CPU usage while this Companion instance is enabled, increase the
    interval delay value to slow down the API Polling."* The default was raised
    from 100 ms to 250 ms in module 1.2.6 precisely because of this; 100 ms is
    the hard floor; 0 disables polling entirely.
    INFERENCE: the operator is asked to trade feedback latency against
    production-machine CPU headroom, on the machine that is doing the show.
    That is a design smell, not a tuning knob. (Frequency: recurring — it is the
    module's primary documented warning.)
  - FACT: **Six open feature requests are labelled "blocked externally"**, a
    label the project defines as *"This feature can't be developed any further
    due to something outside of our control."* They are: vMix Call guest
    username as a variable (#298, Nov 2024); show stream errors (#296,
    Nov 2024); vMix 27 External Output 3 & 4 (#248, Feb 2024); access to the
    Statistics window data (#247, Feb 2024); replay remaining time showing total
    duration instead of remaining (#219, **open since Jul 2023**); list-input
    AutoNext action and feedback (#217, Jul 2023); title layer preset tally
    (#204, May 2023).
    INFERENCE: the vMix API does not expose stream health, statistics, replay
    timing or call-participant identity. For anyone building monitoring, that is
    exactly the data you need and cannot have.
  - FACT: Non-ASCII characters in input names cause problems (#312, open since
    Feb 2025). INFERENCE: relevant for German-language productions —
    umlauts in input names are a live risk. (Frequency: isolated as reported,
    but the report is 18 months old and unfixed.)
  - FACT: Total video-list duration / remaining time tracking has been requested
    since Oct 2022 (#181) and is blocked externally.

- **MISSING FEATURES (requested)** — value-typed feedbacks with HTTP API endpoint
  objects (#398, Apr 2026); the seven blocked items above.

- **UX PROBLEMS** — UNKNOWN (vMix forum unreachable).

- **PERFORMANCE PROBLEMS** — FACT: the CPU-vs-polling tradeoff above is the
  documented one, and it is specifically worse with "many inputs or older
  hardware."

- **PRICING PROBLEMS** — UNKNOWN. vMix's perpetual-licence tier ladder (feature
  gating by edition) is the known axis but unverified here.

- **LOCK-IN** — UNKNOWN beyond the API gaps.

- **OFFLINE** — FACT: local HTTP; no cloud in the control path observed.

- **INTEGRATION PROBLEMS** — The "blocked externally" label is the cleanest
  artefact in this entire pass: a maintainer maintaining a public list of things
  the vendor's API will not let them build.

---

### Xibo (Xibo Signage Ltd)

- **STRENGTHS**
  - FACT: The open-core split is real and verifiable. The `xibosignage` org
    publicly ships the CMS plus **two AGPL-3.0 players** — `electron-player`
    ("Player application for Linux and Windows") and `xibo-dotnetclient`
    ("Xibo for Windows .NET Player"). Three older players (`xibo-linux`,
    `xibo-windows` WPF, `xibo-pyclient`) are public but archived.
  - FACT: Public issue tracker with 129 open issues and visible milestones
    (e.g. 4.5.2) — roadmap transparency that QLab, Watchout, disguise, Pixera
    and Pandoras Box do not offer.

- **WEAKNESSES**
  - FACT: **Feature requests open since January 2015 — eleven years.** The
    long-tail includes video capture device support (#49), embedded layouts for
    intranets (#47), required-files download management (#32), webpage caching
    (#60), client dimming API control (#52), people counter (#50), YouTube
    integration (#63), layout thumbnail rendering (#55) — all Jan 2015, all
    still open.
  - FACT: A real playback bug in the shipping Windows player: **"Windows player
    skips even-indexed playlist items and halves layout duration"** (#3864,
    open since May 2026). INFERENCE: that is a content-integrity failure — the
    client silently plays half the playlist.
  - FACT: Multi-display coordination problems: the CAP connector "only sends
    criteria updates to one display and does not support display groups"
    (#3790, Dec 2025); "Sync event does not assign any displayGroup to the
    event" (#3927, Aug 2026, labelled a **regression** against milestone 4.5.2).
    INFERENCE: synchronised multi-screen playback — the product's headline use
    case — has recurring group-assignment defects.
  - FACT: Global element layer numbering conflicts make text elements disappear
    after refresh (#3741, Oct 2025).
  - FACT: Operational opacity: "The difference between XMDS and PLAYER logs
    channels is not clear" (#3827, Mar 2026).

- **MISSING FEATURES (requested)** — FACT, from the Windows player tracker:
  content synchronisation (#313, **open since Sep 2023**), data connector
  implementation (#336, Jul 2024), display alerts including command alert
  (#337, Jul 2024), SRT subtitle support (#163, **open since Aug 2020**),
  HDMI-CEC via Pulse-Eight adaptor (#110, **open since Feb 2020**), TLS 1.3
  support (#365, Nov 2025), installer command-line preconfiguration flags
  (#298, Jun 2023).
  INFERENCE: HDMI-CEC and installer flags open for years signals that
  large-fleet deployment ergonomics are under-served.

- **UX PROBLEMS** — FACT: layout-editor visibility improvements (#3527, Oct 2024)
  and a UI framework update (#3675, May 2025) are both open. UNKNOWN in detail.

- **PERFORMANCE PROBLEMS** — UNKNOWN. No memory/decoding issues surfaced in the
  open .NET client tracker, which is itself mildly reassuring but not evidence
  of absence.

- **PRICING PROBLEMS** — UNKNOWN in numbers, but the **structure** is a fact:
  the Android, webOS and Tizen players are **not** in the public org listing
  while the Windows/Linux ones are. INFERENCE (consistent with the landscape
  pass): the commercially-gated players are exactly the ones you need for cheap
  commodity signage hardware, so the "open source" story stops precisely where
  the hardware gets affordable. That is the lock-in wedge.

- **LOCK-IN**
  - FACT: CMS is AGPL-3.0; Windows/Linux players are AGPL-3.0; commercial
    Android/webOS/Tizen players and hosted Xibo Cloud are not public.
  - INFERENCE: a fleet standardised on Android/Tizen displays is
    commercially locked in even though the CMS is free software.

- **OFFLINE**
  - FACT: The player architecture is download-then-play (required-files
    management has been an open concern since 2015), so playback continues
    without the CMS. FACT: player-to-CMS logging channels (XMDS) are the
    coupling point.
  - UNKNOWN: exactly what degrades during a long CMS outage. Needs the
    (blocked) Xibo community forum.

- **INTEGRATION PROBLEMS** — FACT: scheduled-command XML output is missing geo,
  priority and display-order data (#3816, Jan 2026) — i.e. the scheduling API
  under-reports.

---

### Garlic Player (Sagiadinos)

- **STRENGTHS**
  - FACT: Genuinely vendor-neutral — SMIL 3.0 playback, AGPL-3.0, and it runs on
    Linux, Windows, macOS, Android and Raspberry Pi 3–5. This is the only
    product in the segment whose *content format* is an open standard rather
    than a vendor schema. INFERENCE: strongest anti-lock-in position in the
    whole segment.
  - FACT: Actively maintained — issues from 2025–2026 are being closed within
    weeks (Qt platform plugin failure #62 closed Aug 2026; ARM64 AppImage
    segfault #59 closed Jun 2026; screenshot API typo #56 closed May 2026).
    INFERENCE: a one-maintainer project with a *better* response time than
    several commercial vendors here.

- **WEAKNESSES**
  - FACT: The whole open tracker is four issues — #63 "Debian 12 or above
    recommended?" (Aug 2026), #58 "Download Feature" (Jun 2026), #52 "Implement
    Open API / Swagger" (Jul 2025), #51 "Video starting position support"
    (May 2025).
    INFERENCE: a tracker this small usually means a small user base, not an
    absence of problems. Treat the low complaint count as **weak evidence**.
  - FACT: ARM64 AppImage segfaulted and a Qt platform plugin failed to load in
    2026 — INFERENCE: Linux/ARM packaging is the fragile edge, which matters
    because Raspberry Pi is the headline platform.
  - FACT: Certificate expiry on the project website (#54, Dec 2025).
    INFERENCE: single-maintainer operational risk.

- **MISSING FEATURES (requested)** — FACT: **video start-position support**
  (#51, open since May 2025) — you cannot start a clip at an offset. FACT: an
  OpenAPI/Swagger-described control API (#52, open since Jul 2025) — i.e. the
  control surface is currently not formally described.

- **UX / PERFORMANCE / PRICING** — UNKNOWN. FACT: AGPL-3.0, no licence cost.

- **LOCK-IN** — FACT: none meaningful. SMIL 3.0 content, AGPL player, runs
  everywhere.

- **OFFLINE** — INFERENCE: SMIL with `wallclock` scheduling and conditional play
  is designed for disconnected operation; the open "Download Feature" request
  suggests media pre-fetch is currently the weak part. UNVERIFIED in detail.

---

### Inkue (FonograF)

- **STRENGTHS**
  - FACT: GPL-3.0, Windows/macOS/Linux, and the cue vocabulary really is broad —
    audio, video, lighting via DMX, MIDI, OSC, timecode and live mic input.
  - FACT: The architecture claim is specific and testable: **"the audio callback
    has zero allocations, zero locks, zero I/O"** — the correct discipline for
    a real-time audio path, and Rust/Tauri is a defensible choice for it.
  - FACT: It explicitly targets "established show-control conventions" so
    "experienced operators feel at home immediately" — INFERENCE: deliberately
    QLab-shaped, i.e. a migration target rather than a re-education project.

- **WEAKNESSES**
  - FACT: **It is four months old** (repo created 2026-04-10) with 29 stars and
    2 open issues as of 2026-08-25. INFERENCE: not yet evidence of anything at
    show scale, and the near-empty tracker reflects low usage rather than
    quality.
  - FACT: Real defects already: **"Green Tint and Rendering Artifacts on Video
    Output (D3D11 HWAccel Failure)"** (#5, open Aug 2026) — hardware-accelerated
    video output is broken for at least one reporter on Windows.
  - FACT: Audio fade-out did not complete correctly when a cue stopped
    automatically (#4, fixed Aug 2026) — INFERENCE: fade/stop interaction, one
    of the fiddliest parts of a cue engine, was wrong on first contact.
  - FACT: Users immediately asked for things it does not have: a dedicated media
    preview panel (#3), and visual transitions + projector output + clip editing
    + live camera input (#2) — all closed as completed within a day of filing,
    which INFERENCE suggests either very fast development or optimistic
    closure. Unverified which.

- **MISSING FEATURES** — see #2/#3 above; the requests map exactly onto what a
  video-capable cue system needs.

- **PRICING / LOCK-IN / OFFLINE** — FACT: free, GPL-3.0, local. No lock-in.

- **Assessment** — INFERENCE: Inkue is the most credible answer to QLab's
  platform lock-in that exists today, and it is not yet ready. The same is true
  of `tdoukinitsas/liveplay` (39 stars, created Oct 2025, C++ audio core with
  Electron/Vue UI, LUFS/dBFS/true-peak metering, SMPTE LTC output, multi-output
  routing, network operation, 20+ languages including RTL). Note that a third
  attempt, `eeeeeta/sqa` — self-described as "the Stuttery QLab Alternative" —
  is **archived**. Three independent attempts in ten years, one already dead:
  the demand is real and durable, and so is the difficulty.

---

## Cross-product patterns

These are the complaints that repeat across **multiple independent vendors**.
They are the most valuable output of this pass because they describe the segment,
not a product.

### 1. Write-only control APIs — you can command, but you cannot ask
**Frequency: widespread (4+ vendors).**
- Watchout 7: **"WATCHOUT does not report variable values back to controllers
  (its input API is write-only)"**; cue info is read-only and unmodifiable.
- Pandoras Box: **"SMPTE mode cannot be read back (write-only command)"**; "no
  feedback implementation yet."
- disguise: fade down / hold have no status output; the request is parked on the
  vendor.
- Resolume: layer transport position is visible **in the UI** but has no API
  endpoint.
- vMix: statistics, stream errors and replay remaining time are simply not
  exposed.

INFERENCE: the segment's APIs were designed as **remote-control surfaces**, not
as **state interfaces**. Every integrator therefore maintains a shadow copy of
the show's state that is guaranteed to drift. This is the deepest structural
problem in the segment.

### 2. The "blocked on vendor" label — integrators publicly tracking vendor debt
**Frequency: widespread (3 vendors, explicit labels; 2 more implicit).**
- vMix module: a label literally defined as *"This feature can't be developed any
  further due to something outside of our control"*, carrying 6 open issues, the
  oldest from Jul 2023.
- Resolume module: a "Resolume Feature Request" label on issues that need
  Resolume-side API changes, oldest Feb 2024.
- OBS module: multiple open items annotated as awaiting obs-websocket changes.
- disguise module: an open to-do to ask the vendor for a fade-status message.
- CasparCG module: `CG INVOKE` unimplemented, CG commands undocumented since 2022.

INFERENCE: this is a public, machine-readable ledger of what each vendor's API
cannot do. **It is the single best-quality evidence source in this segment and
nobody in the AV world seems to mine it.**

### 3. Polling as the default state channel, and the show machine pays for it
**Frequency: widespread.**
- vMix: 250 ms default, 100 ms floor, with an explicit CPU warning and a
  recommendation to *slow polling down* if the production machine struggles.
- Pandoras Box: 5 Hz status polling always, 30 Hz timecode polling during
  playback, no push channel at all.
- Watchout 7: has SSE, and **still** runs a 30 s reconciliation poll on top,
  because SSE does not emit structural changes.
- Resolume: full-state dump on every action, causing "freezing" on large
  compositions during live performance.
- Pixera: an open request to expose polled feedback as variables.

INFERENCE: only OBS (event subscription with a bitmask) and partially Watchout
(SSE) have real push. Everywhere else, knowing what the show is doing costs CPU
on the machine running the show — which is exactly the machine you least want to
load. **Any monitoring product in this segment inherits this problem and must
budget for it explicitly.**

### 4. Identity vs. position — addressing cues by where they sit, not what they are
**Frequency: widespread.**
- QLab did the right thing (immutable UUID) but **hid the UUID behind a "Copy
  Unique Cue ID" action**, so integrators fall back to cue numbers — which then
  break on `$`, `(` and `)`.
- Resolume addresses clips by grid position; "connect column by name" and "layer
  group column preset" both had to be fixed in 2026.
- Pandoras Box requires **manual cue ID entry** because there is no discovery.
- Watchout omits cues that lack a valid name and start time, and matches inputs
  on a manually-configured `Key` rather than the visible Name.

INFERENCE: the segment has not settled on stable identity. A show file edited
between rehearsal and performance can silently re-point every controller cue.
This is the failure mode that ruins shows and it is common to five products.

### 5. Feedback caches go stale and need a restart
**Frequency: recurring (2 vendors, same shape).**
- Watchout JSON module #23: a newly created timeline appears in actions
  immediately but **requires a module restart to appear in feedbacks**.
- QLab module #184: playhead variables for one cue list **go empty** when a cue
  fires in another cue list.

INFERENCE: state that is populated at connect time and not re-synced on change.
The operator's symptom is "my Stream Deck went blank mid-show" and the fix is
"restart the connection", which is unacceptable during a performance.

### 6. Protocol fragmentation — one product, many integrations
**Frequency: widespread.**
- disguise: **five** Companion modules (OSC, MTC, SMC, liveupdate, track-notes),
  three different transports (OSC, JSON-over-telnet, SMC), separate ports, one
  needing credentials and a firmware floor.
- Watchout: **three** modules (v6 TCP, v7 JSON, third-party director control),
  two ports (3019 Director, 3017 per-node), no carry-over across the v6→v7 break.
- OBS: a bundled WebSocket API **plus** a separate community OSC bridge because
  there is no native OSC.

INFERENCE: "which port, which plane, which version" is unmanaged information in
this segment. It lives in tribal knowledge and in a Companion config. **This is
a documentation-shaped gap, which is directly relevant to a planning tool.**

### 7. Version churn breaks the controller, not the server
**Frequency: widespread.**
- QLab 5.2 broke controllers below module 2.1.0; a separate QLab 5.5 feedback
  break followed.
- Watchout v7 required an entirely new module; the newest one requires
  Companion 5.0+ and drops 3.x, with legacy builds only by emailing a vendor.
- CasparCG: Decklink driver 14.3 broke server 2.4.1 and earlier, **with no
  backport** — a *driver* update forced a server upgrade.
- disguise SMC: "might not (fully) work with older firmware versions."
- Pixera: some commands are v2.0-only and the docs do not say which.

INFERENCE: the show system's version matrix — app version × driver version ×
controller version × firmware — is a real, fragile, undocumented artefact.
Nobody is tracking it, and every one of these breaks was discovered in the field.

### 8. Long-lived open requests as the norm, in open source *and* commercial
**Frequency: widespread.**
- CasparCG: top-reacted open issues from Oct/Nov 2017 and 2018 — nine years.
- Xibo: eight feature requests from January 2015 — eleven years.
- OBS: audio monitoring buffer buildup open since Apr 2021; obs-websocket event
  hydration since Aug 2022; advanced output settings since Aug 2020.
- vMix: replay remaining time wrong since Jul 2023, blocked externally.
- disguise: d3 OSC feedback upgrade since Feb 2020; "play to end of section"
  broken since Jun 2021.
- Pandoras Box: "only next cue" since Nov 2019; cue ID readback since Feb 2022.

INFERENCE: the open-source projects at least show you the queue. The commercial
vendors mostly do not have a public queue at all — Figure 53, Dataton, disguise,
AV Stumpfl and twoloox have **no public issue tracker**, so the only visible
record of their unfixed problems is the integrator repos in pattern 2.

### 9. Cue authoring at scale is unserved everywhere
**Frequency: recurring, and strongly evidenced for QLab specifically.**
Independent third-party tools exist to do things the products do not:
bulk import from spreadsheet (`cuebilt`, `csv_to_qlab`), paperwork export to
printable HTML/PDF (`qlab-html`), and batch cue editing (two separate AppleScript
libraries). All are QLab-adjacent; the pattern is that the run-the-show side is
polished and the build-and-document-the-show side is left to scripts.

### 10. macOS lock-in on the reference product drives repeated, difficult escapes
**Frequency: recurring.**
Three independent open-source cross-platform cue systems in ten years — `sqa`
(archived), `LivePlay` (Oct 2025), `Inkue` (Apr 2026) — all leading with
cross-platform as the differentiator. One is dead, two are months old and have
video-output and fade bugs. INFERENCE: the demand is durable and unmet, and the
reason is that a reliable cue engine is genuinely hard, not that nobody tried.

### 11. Distributed playback nodes are a DIY problem
**Frequency: recurring, weakly evidenced.**
`marsvaardig/osc-node` (Raspberry Pi video player driven from QLab over OSC,
45 stars) and `rasmuskreiner/OSCVideo` exist because there is no cheap
per-screen playback node in this segment. `osc-node`'s open issues are the
predictable consequence: **"OMXPlayer is deprecated"** (open since May 2024),
service startup failures, multi-play failures over WLAN/LAN, no Pi 4 dual-screen
support, install script crashing the Pi. INFERENCE: people want distributed
playback badly enough to run unmaintained software on it.

---

## Direct quotes-of-substance

All paraphrased or short-quoted from pages I opened. Dates are the page/issue
dates, not the date I read them.

1. **Watchout 7's variable API is write-only.** The Companion module help for
   WTAV Watchout Director Control states plainly that WATCHOUT does not report
   variable values back to controllers — its input API is write-only — so any
   value a controller shows is merely the last value it itself set, and getting
   real values requires configuring OSC or HTTP output cues inside the show.
   — https://raw.githubusercontent.com/bitfocus/companion-module-wtav-watchout-director-control/main/companion/HELP.md (module current as of Aug 2026)

2. **Pandoras Box: three limitations stated as known and unfixed.** The module
   help lists, in its own words, no feedback implementation yet (status only via
   variables), cue discovery not implemented so cue IDs must be entered by hand,
   and SMPTE mode that cannot be read back because the command is write-only.
   — https://raw.githubusercontent.com/bitfocus/companion-module-twoloox-pandorasbox/master/companion/HELP.md

3. **Resolume forces a full state dump per action.** Issue #146 reports that
   every time a button is pressed or an action triggered, the module fetches the
   entire data state from the webserver, because the API offers no granular
   retrieval; on large compositions this saturates the network and freezes
   things during live performance.
   — https://github.com/bitfocus/companion-module-resolume-arena/issues/146 (closed Apr 2026)

4. **Resolume exposes in the UI what it withholds from the API.** Issue #55
   notes that layer time is available in the app, but the API has no
   `/composition/layers/{n}/transport/position` endpoint to match the per-clip
   one — so the request is labelled as needing a Resolume-side change.
   — https://github.com/bitfocus/companion-module-resolume-arena/issues/55 (opened 19 Feb 2024, still open)

5. **vMix asks you to trade feedback speed for the show machine's CPU.** The
   module help warns that if vMix CPU usage is high while the Companion instance
   is enabled, the user should increase the interval delay to slow down API
   polling; the default was raised from 100 ms to 250 ms for this reason, and
   100 ms is the floor.
   — https://raw.githubusercontent.com/bitfocus/companion-module-studiocoast-vmix/master/companion/HELP.md

6. **vMix's integrators keep a public list of what the API will not allow.** The
   "blocked externally" label is defined as meaning a feature cannot be
   developed any further due to something outside the maintainers' control; six
   open issues carry it, including replay remaining time being wrong since
   July 2023 and access to the Statistics window data since February 2024.
   — https://github.com/bitfocus/companion-module-studiocoast-vmix/issues?q=is%3Aissue+label%3A%22blocked+externally%22

7. **QLab's passcode can lock a controller out with no self-recovery.** The
   module help states that QLab will ignore commands if an incorrect passcode is
   sent too many times in a row, and that the module's automatic restart/retry
   stops when it detects an incorrect passcode — a human must retype and save
   it.
   — https://raw.githubusercontent.com/bitfocus/companion-module-figure53-qlab-advance/master/companion/HELP.md

8. **QLab feedback requires TCP, and TCP costs traffic.** The same document
   states that variables and feedback are available only in TCP mode and warns
   this may cause a noticeable increase in network traffic; it also warns that
   cue numbers containing `$`, `(` or `)` will not work with certain variables
   and feedbacks.
   — same URL as above

9. **disguise aborts silently when a variable will not resolve.** The OSC module
   help notes that variable substitution applies only to numeric inputs, and
   that if a variable fails to resolve the action logs a debug message and
   aborts — with no fallback and no retry.
   — https://raw.githubusercontent.com/bitfocus/companion-module-disguise-osc/master/companion/HELP.md

10. **obs-websocket v5 events carry less than v4's did.** Issue #983 documents
    that `SceneTransitionStarted` sends only the transition type, whereas v4's
    `TransitionBegin` included duration, source scene and destination scene; the
    reporter needs those at transition start to run timed logic mid-transition,
    and states the shortfall spans multiple events.
    — https://github.com/obsproject/obs-websocket/issues/983 (opened 15 Aug 2022, still open)

11. **OBS cannot loop audio gaplessly or seek a media source.** Two separate open
    reports: a looped MP3 in a media source plays a roughly half-second dead
    spot, and playback cannot be seeked through with a MediaSource in a scene.
    — https://github.com/obsproject/obs-studio/issues (issues #12028 opened Apr 2025, #11857 opened Jan 2025)

12. **CasparCG does not backport.** On the Decklink 14.3 breaking-change issue,
    the resolution is that 2.4.2 and 2.5.0 work with the new drivers and no
    patches are planned for older versions — so an older installation is broken
    by a driver update it did not initiate.
    — https://github.com/CasparCG/server/issues/1593 (opened 5 Jan 2025)

13. **Xibo's Windows player can silently play half a playlist.** An open bug
    reports the Windows player skipping even-indexed playlist items and halving
    layout duration.
    — https://github.com/xibosignage/xibo/issues (issue #3864, opened May 2026)

14. **Watchout feedback state is populated once and not refreshed.** Issue #23
    reports that newly created timelines show up immediately under actions but
    require a plugin restart before they appear under feedbacks.
    — https://github.com/bitfocus/companion-module-dataton-watchout-json/issues/23 (opened 14 May 2026)

15. **Inkue states the right real-time discipline.** Its README claims the audio
    callback has zero allocations, zero locks and zero I/O, and positions the
    project as cross-platform (Windows, macOS, Linux) GPL-3.0 software following
    established show-control conventions so experienced operators feel at home
    immediately.
    — https://raw.githubusercontent.com/FonograF/Inkue/master/README.md

16. **LivePlay names the same gap independently.** Its README positions it as a
    free, open-source, cross-platform (Windows, macOS, Linux) cue system "with
    no vendor lock-in", including SMPTE LTC output, multi-output routing,
    LUFS/dBFS/true-peak metering and networked operation with a stage-side audio
    engine controlled from a separate laptop.
    — https://raw.githubusercontent.com/tdoukinitsas/liveplay/main/README.md

17. **QLab paperwork is a third-party job.** `qlab-html` describes itself as
    rendering QLab workspaces as self-contained HTML documents that can then be
    printed or saved to PDF from a browser, extracting the workspace data over
    OSC to do it.
    — https://raw.githubusercontent.com/okofish/qlab-html/master/README.md

18. **CasparCG's oldest wanted features are nearly a decade old.** Sorted by
    reactions, the open tracker's top entries include a system audio producer
    and per-channel layer volume from November 2017, process separation from
    October 2017, server-side AMCP scripting and OSC layer status from
    February 2018, and SRT support from February 2020.
    — https://github.com/CasparCG/server/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc

---

## What this pass could not establish (open questions for the next pass)

Listed explicitly so nobody mistakes silence for a finding.

1. **All pricing.** No price, tier, seat limit, subscription/perpetual model or
   cloud requirement was verified for any product. Needs: qlab.app/pricing,
   dataton.com, disguise.one, avstumpfl.com, resolume.com/buy, vmix.com/purchase,
   xibosignage.com/pricing. Label everything "as advertised" vs "requires sales
   contact" when captured.
2. **End-user sentiment.** Zero Reddit, forum or review-site evidence. The UX
   findings above are inferred from tooling, not from users. Highest-value
   next step: r/techtheatre, r/VIDEOENGINEERING, ControlBooth, Blue Room,
   the vMix forum, the Blackmagic forum.
3. **German-market evidence.** Entirely absent. Needs film-tv-video.de,
   production-partner.de and veranstaltungstechnik forums — especially relevant
   for Pandoras Box (Christie/twoloox) and Pixera (AV Stumpfl, Austria), both
   DACH products.
4. **Vendor changelogs and known-issues pages.** Only CasparCG's was reachable.
   The brief's "what they keep fixing IS what keeps breaking" angle is
   90 % unexecuted.
5. **QLab's actual roadmap and bug queue.** Figure 53 runs no public tracker,
   so this may be unobtainable; the community forum is the fallback.
6. **Whether Resolume #146 was fixed API-side or client-side.** Determines
   whether the full-state-dump problem still exists for other clients.
7. **Xibo offline degradation specifics** — what exactly stops working during a
   long CMS outage.

---

## Sources

Every URL below was opened and read during this pass on 2026-08-29.

**Integrator issue trackers and help documents (Bitfocus Companion)**
1. https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues?q=is%3Aissue
2. https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues/184
3. https://raw.githubusercontent.com/bitfocus/companion-module-figure53-qlab-advance/master/companion/HELP.md
4. https://github.com/bitfocus/companion-module-dataton-watchout/issues?q=is%3Aissue
5. https://github.com/bitfocus/companion-module-dataton-watchout-json/issues?q=is%3Aissue
6. https://github.com/bitfocus/companion-module-dataton-watchout-json/issues/23
7. https://raw.githubusercontent.com/bitfocus/companion-module-dataton-watchout-json/main/companion/HELP.md
8. https://raw.githubusercontent.com/bitfocus/companion-module-wtav-watchout-director-control/main/companion/HELP.md
9. https://github.com/bitfocus/companion-module-resolume-arena/issues?q=is%3Aissue
10. https://github.com/bitfocus/companion-module-resolume-arena/issues?q=is%3Aissue+is%3Aopen
11. https://github.com/bitfocus/companion-module-resolume-arena/issues/146
12. https://github.com/bitfocus/companion-module-resolume-arena/issues/55
13. https://github.com/bitfocus/companion-module-twoloox-pandorasbox/issues?q=is%3Aissue
14. https://github.com/bitfocus/companion-module-twoloox-pandorasbox/issues/8
15. https://raw.githubusercontent.com/bitfocus/companion-module-twoloox-pandorasbox/master/companion/HELP.md
16. https://github.com/bitfocus/companion-module-avstumpfl-pixera/issues?q=is%3Aissue
17. https://raw.githubusercontent.com/bitfocus/companion-module-avstumpfl-pixera/master/companion/HELP.md
18. https://github.com/bitfocus/companion-module-disguise-osc/issues?q=is%3Aissue
19. https://raw.githubusercontent.com/bitfocus/companion-module-disguise-osc/master/companion/HELP.md
20. https://raw.githubusercontent.com/bitfocus/companion-module-disguise-mtc/master/companion/HELP.md
21. https://raw.githubusercontent.com/bitfocus/companion-module-disguise-smc/main/companion/HELP.md
22. https://github.com/bitfocus/companion-module-studiocoast-vmix/issues?q=is%3Aissue+is%3Aopen
23. https://github.com/bitfocus/companion-module-studiocoast-vmix/issues?q=is%3Aissue+label%3A%22blocked+externally%22
24. https://raw.githubusercontent.com/bitfocus/companion-module-studiocoast-vmix/master/companion/HELP.md
25. https://github.com/bitfocus/companion-module-obs-studio/issues?q=is%3Aissue+is%3Aopen
26. https://github.com/bitfocus/companion-module-casparcg-server/issues?q=is%3Aissue
27. https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+qlab

**Product issue trackers and changelogs**
28. https://github.com/CasparCG/server/issues
29. https://github.com/CasparCG/server/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
30. https://github.com/CasparCG/server/issues?q=is%3Aissue+is%3Aopen+label%3Abug
31. https://github.com/CasparCG/server/issues?q=is%3Aissue+is%3Aopen+AMCP
32. https://github.com/CasparCG/server/issues/1593
33. https://raw.githubusercontent.com/CasparCG/server/master/CHANGELOG.md
34. https://github.com/CasparCG/client/issues?q=is%3Aissue+is%3Aopen
35. https://github.com/obsproject/obs-studio/issues?q=is%3Aissue+is%3Aopen+media+source+playback
36. https://github.com/obsproject/obs-studio/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
37. https://github.com/obsproject/obs-websocket/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
38. https://github.com/obsproject/obs-websocket/issues/983
39. https://github.com/obsproject/obs-websocket/issues?q=is%3Aissue+is%3Aopen+label%3A%22Blocked%22
40. https://github.com/xibosignage/xibo/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
41. https://github.com/xibosignage/xibo/issues?q=is%3Aissue+is%3Aopen+player
42. https://github.com/xibosignage/xibo/issues?q=is%3Aissue+is%3Aopen+sync
43. https://github.com/xibosignage/xibo-dotnetclient/issues?q=is%3Aissue+is%3Aopen
44. https://github.com/orgs/xibosignage/repositories?type=source
45. https://github.com/sagiadinos/garlic-player/issues?q=is%3Aissue
46. https://github.com/FonograF/Inkue/issues?q=is%3Aissue

**Alternative, workaround and bridge projects**
47. https://raw.githubusercontent.com/FonograF/Inkue/master/README.md
48. https://raw.githubusercontent.com/tdoukinitsas/liveplay/main/README.md
49. https://raw.githubusercontent.com/tbsounddesigns/cuebilt/main/README.md
50. https://raw.githubusercontent.com/okofish/qlab-html/master/README.md
51. https://github.com/jshea2/OSC-for-OBS/issues?q=is%3Aissue
52. https://github.com/marsvaardig/osc-node/issues?q=is%3Aissue
53. https://github.com/bsmith96/Qlab-Scripts/issues?q=is%3Aissue
54. https://github.com/orgs/Figure53/repositories

**GitHub repository searches run (result sets read, individual repos listed above)**
- `org:bitfocus qlab` · `org:bitfocus watchout` · `org:bitfocus pandorasbox` ·
  `org:bitfocus disguise` · `qlab` (sorted by stars, 25 results) ·
  `resolume arena osc rest api`

**Confirmed blocked by the network egress proxy on 2026-08-29** (listed so the
next pass does not waste calls, and so the gaps above are auditable)
- reddit.com · qlab.app · obsproject.com · community.xibo.org.uk ·
  controlbooth.com · film-tv-video.de · html.duckduckgo.com · lite.duckduckgo.com

**Search-engine status**: WebSearch budget exhausted (200/200) before this pass
began; zero queries executed.
