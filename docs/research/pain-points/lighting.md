# Pain points: Lighting Design / Visualisation / Control

Research date: 2026-08-29 (brief dated 2026-08-28).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Language of corpus: English (repo docs mix DE/EN; research corpus stays EN).

---

## Method

### Read this first — what this pass could and could not reach

Two hard limits shaped this dossier. Stating them up front so it is not
over-read.

1. **The session's WebSearch budget was exhausted before this pass began**
   (200/200 calls consumed by earlier segment passes in the same session).
   **Zero search-engine queries completed.** The brief asked for 8–15 distinct
   searches across Reddit, review sites, forums and German-language sources;
   that part of the method is **unexecuted**.
2. **Network egress policy blocked every non-GitHub host tried.** Confirmed
   blocked at the proxy during *this* pass, each returning `EGRESS_BLOCKED`:
   - `community.etcconnect.com` (ETC's own user forum)
   - `www.etcconnect.com` (ETC product/pricing pages)
   - `forum.vectorworks.net` (Vectorworks Spotlight forum)
   - `www.controlbooth.com` (the main theatre-tech forum)
   - `gdtf-share.com` (the GDTF fixture library)
   - `www.malighting.com` (MA Lighting product/pricing pages)

   Carried over from the proxy's own recent-failure log for this session:
   `www.reddit.com`, `old.reddit.com`, `www.g2.com`,
   `forum.blackmagicdesign.com` — all `403 to CONNECT`.

   **Reachable and used: `github.com` and `raw.githubusercontent.com`.**
   GitHub's *global* search endpoint (`github.com/search`) returned HTTP 429
   with `Retry-After: 3600` and was abandoned; the GitHub MCP server's
   `search_repositories` worked and became the discovery instrument, while
   repo-scoped issue pages fetched over HTTP became the reading instrument.
   The MCP server's `list_issues` / `search_issues` are scoped to this
   account's own repos and returned access-denied or empty for third-party
   repos, so all third-party issue content here was read as rendered pages.

**Consequence, stated plainly: this dossier is strong on format/API
interoperability (GDTF, MVR, MVR-xchange, OSC), on the developer-facing
surface of grandMA3, ETC Eos and Vectorworks, and on open-source
stability/maintenance. It is near-silent on price, licence sentiment, dongle
policy, training burden, and the day-to-day UX opinion of programmers and
designers.**

Nothing here should be read as "nobody complains about grandMA3's price" or
"Eos users are happy with Augment3d." It should be read as "the places where
those opinions are written — Reddit, ControlBooth, the ETC forum, the
Vectorworks forum, G2/Capterra, and every German-language trade forum — were
unreachable from this container."

**No prices appear in this dossier.** Both vendor sites that would carry them
(`malighting.com`, `etcconnect.com`) are blocked, as is every review site.
The landscape pass already recorded grandMA3 price/dongle as UNKNOWN; that
stands, unchanged and un-re-verified. Rather than reconstruct prices from
memory, every PRICING section below is marked UNKNOWN with a note on what to
check. A fabricated price is worse than an absent one.

### What was actually read

**67 distinct pages opened and read first-hand**, all on `github.com` /
`raw.githubusercontent.com`, plus 12 MCP repository-search queries used for
discovery. Breakdown by target:

- **GDTF/MVR specification** (`mvrdevelopment/spec`, the official spec repo) —
  6 pages: the open-issue list, the list sorted by comments, the list sorted
  by reactions, the `mvr spec` label view, and issues #256, #288, #296, #298
  read in full. This turned out to be the single richest source in the segment.
- **QLC+** (`mcallegari/qlcplus`) — 6 pages: open issues by comments, open
  issues by reactions, a `crash` query, a qmlui/v4-v5 query, the releases
  list, and issues #1145, #2023, #2095 read in full.
- **Open Lighting Architecture** (`OpenLightingProject/ola`) — 4 pages: open
  issues by comments, the releases list, and issues #1396 and #2035 in full.
- **Perastage** (`PeramatoG/Perastage`, 112★) — 8 pages: full issue list,
  README, releases, latest release, and issues #1652, #1778, #2092, #2157,
  #2233 read in full. Plus `PeramatoG/Peraviz` issues.
- **BlenderDMX** (`open-stage/blender-dmx`, 281★) — 5 pages: issue list by
  comments (open and closed), an MVR query, a performance query, releases,
  README. Plus `open-stage/python-gdtf` and `open-stage/python-mvr` issues.
- **grandMA3 developer surface** — 7 pages: `hossimo/GMA3Plugins` README and
  its **unofficial Lua API wiki**; `xxpasixx/pam-osc` issue list and issues
  #37, #38; `LightYourWay/grandMA3-tstl-plugin`;
  `einlichtvogel/grandMA3-Feedback-Chataigne-Module` (archived).
- **ETC Eos developer surface** — 8 pages: `ETCLabs/EosSyncLib` README and
  issues; `ETCLabs/OSCRouter` open issues and issue #4;
  `ETCLabs/OSCWidgets` open issues; `bitfocus/companion-module-etc-eos`
  issues; `douglasfinlay/node-eos-console` README and CHANGELOG;
  `sstaub/eOS` issues.
- **Vectorworks / Lightwright exchange** — 5 pages:
  `Gribiche64/vectorworks-bridge` README **and its `PROTOCOL.md`**
  (a reverse-engineered spec of the Lightwright Data Exchange);
  `vicquick/vwx-mcp` README; `Vectorworks/developer-scripting` issues;
  `eosti/lighting-paperwork` README and open issues.
- **Companion modules** — 4 pages: `companion-module-malighting-grandma3`
  issues, its `HELP.md`, issue #5; `companion-module-requests` lighting query.
- **Smaller tools** — `kaelenfae/LXLog` README, `kellertobias/tosklight`
  README, `Verschwiegener/MVR4J` issues.

### Evidence-weighting notes

- **GitHub issues over-represent developers and integrators**, and
  under-represent designers and programmers who never file bugs. A complaint
  count here is not a market share of pain.
- **Small repos have small issue counts by construction.** LXLog (6★),
  ToskLight (0★) and MVR4J (0★) have essentially no complaint corpus. Their
  *READMEs* are still evidence — a stated motivation is an implicit criticism
  of the incumbent — and that is how they are used below.
- **A closed issue is still evidence** of what broke; several products here
  close aggressively, so closed-issue archaeology carried real weight
  (BlenderDMX shows 0 open issues but a deep closed history; Perastage closes
  within days).
- **One fetch returned unreliable years.** The Perastage releases page was
  rendered with bare "Aug 28"-style dates that the fetcher resolved to 2024,
  which is impossible — the repository was created 2025-12-07. Perastage
  release *versions* and *changelog themes* are used below; Perastage release
  *dates* are marked UNVERIFIED.

---

## Per-product findings

### grandMA3 (+ MA 3D) — MA Lighting

Evidence base: the community's unofficial Lua API wiki, three third-party
control bridges built against MA3, and the Companion module. **No MA Lighting
first-party source was reachable** (malighting.com blocked), and no end-user
forum was reachable. Treat this section as "what integrators find", not "what
programmers feel".

- **STRENGTHS (conceded by critics)**
  - The Lua plugin surface is real and productive: a substantial community
    plugin ecosystem exists (`hossimo/GMA3Plugins` at 111★ alone, plus a dozen
    independent plugin repos found in one search — colour-palette generators,
    group builders, tag helpers, network ping tools). People do not build this
    much on a console API they consider useless. (FACT, repo search.)
  - MA Lighting **did** start shipping official Lua documentation. The
    community wiki records that "as of version 1.5.2, MA Lighting has begun
    providing official Lua documentation", exposed via help pages and a
    `HelpLua` command that exports the function list. (FACT,
    github.com/hossimo/GMA3Plugins/wiki.)
  - MVR-xchange over TCP is implemented and is a target other tools work to
    match — Perastage's v1.6.0 changelog specifically claims improved
    "MVR-xchange TCP mode compatibility with applications like grandMA3".
    (FACT, Perastage releases; INFERENCE that this makes MA3 the de-facto
    reference peer.)

- **WEAKNESSES**
  - **The Lua API is documented late and incompletely.** The community wiki
    states plainly that its content "is not official and has been tested on a
    trial-and-error basis; thus may be missing or incorrect information", and
    names two functions new in v2.0 that are **absent from the official
    `HelpLua` output** — `GridsGetExpandedHeaderCellState()` and
    `ReleaseProfiling()`. Six further functions carry warning markers
    (`CheckDMXCollision`, `CloseAllOverlays`, `ExportCSV`, `ExportJson`,
    `GetPath`, `Timer`). (FACT, GMA3Plugins wiki.)
  - **API drift across console versions is real enough that the community
    versions its plugins against console builds.** `GMA3Plugins` organises
    plugins by "Tested on 2.0.2.0" versus "Tested on 1.0.0.3 – 1.1.4.2".
    (FACT, README; INFERENCE that this implies breaking changes.)
  - **OSC input can be made to crash or misbehave the console.** The Companion
    module carries a closed issue titled "MA3 Crashing when pressing oops and
    Please not working" (#6, Oct 2024). (FACT, issue list; the console-side
    root cause is UNVERIFIED.)

- **MISSING FEATURES (what users request)**
  - **Native OSC feedback.** This is the single loudest MA3 request found.
    The grandMA3 Companion module has exactly **one open issue in its entire
    history** and it is #5, "GrandMA3 Feedback", opened 2024-07-02, asking
    whether feedback from MA "is even possible with OSC". Still open
    2026-08-29 — **over two years**. (FACT.)
  - The workaround ecosystem confirms the gap: `pam-osc` exists specifically
    to "get Feedback for Motorfaders and Button lights" via a Lua plugin, and
    `grandMA3-Feedback-Chataigne-Module` shipped a
    `grandMA3_OSC_Feedback_3.0.0.4` Lua plugin whose only job is to push
    executor colour/button/fader/sequence-name state out on port 8093. Two
    independent projects re-implementing the same missing feature is the
    definition of a recurring pattern. (FACT, both READMEs.)
  - Variables/labels out of the console: Companion module issues #10
    ("Variables", closed Feb 2025), #4 ("Cue Number to Companion", closed Apr
    2024), #2 ("Add Text instead of Numbers", closed Oct 2024). (FACT.)

- **UX PROBLEMS**
  - **OSC control pollutes the command-line history.** `pam-osc` issue #37
    (opened 2026-03-19, still open): a user reports OSC commands "make it
    nearly impossible to pull up previous commands in command line", and
    suspects the plugin's commands are being recorded as indirect commands.
    Whether the fault is the plugin's or MA3's routing of OSC through the
    command line is UNVERIFIED — but the *symptom*, remote control destroying
    the operator's own command history, is a design-level complaint. (FACT of
    the report.)
  - **Fixed executors break page-relative remote control.** `pam-osc` #38
    (2026-03-21, open): with a fader fixed, changing page makes the motor
    fader "reset it to the position of the 201 to 208 fader on page x. The
    displays also do not update." (FACT of the report.)

- **PERFORMANCE PROBLEMS** — UNKNOWN. No reachable source. MA 3D rendering
  performance, show-file load times and large-rig behaviour are exactly what
  the blocked forums would have covered. **To check next pass:**
  ControlBooth, r/lightingdesign, MA's own forum.

- **PRICING PROBLEMS** — UNKNOWN. `malighting.com` blocked. Landscape pass
  recorded price and dongle policy as UNKNOWN; unchanged. **To check next
  pass:** malighting.com product pages, dealer listings, onPC/dongle terms.
  - The one adjacent datum: ToskLight's README frames the whole commercial
    desk market as tools that are "excellent tools and worth every penny" but
    which smaller productions cannot justify, forcing them to "learn throwaway
    workflows simply because their budget is smaller." That is a *competitor's*
    framing of the price problem, not a user complaint. (FACT of the quote,
    INFERENCE about MA3 specifically.)

- **LOCK-IN**
  - **The show file is not an interchange format.** No public MA3 show-file
    parser was found in repository search (`grandMA3 showfile parser xml patch
    export` → 0 results). What *does* exist is export-shaped: LXLog imports
    "MA2/MA3 XML" (i.e. whatever MA exports), not the show file itself.
    (FACT of the search result and LXLog README; INFERENCE about closure.)
  - The escape hatch is MVR — and MVR carries the rig, not the show (see
    Cross-product patterns).

- **OFFLINE** — Presumed fully offline (onPC is a desktop application) but
  **UNVERIFIED from a primary source** this pass. Dongle/licence behaviour
  without network is UNKNOWN.

- **INTEGRATION PROBLEMS**
  - Feedback requires a **console-side Lua plugin installed into the show**,
    not just a network setting. The Companion `HELP.md` requires OSC configured
    in Settings → In&Out with matching IP/port/prefix and both "Receive Command"
    and "Receive" enabled, "or the plugin will not work", plus an optional Lua
    plugin that provisions the OSC entries and Quick Keys. (FACT, HELP.md.)
  - **The bridges are fragile and abandonment-prone.** The Chataigne feedback
    module is **archived**; its author states: "Because I decided to move on,
    and build the second generation of my onPC system, I will not continue to
    update this repository", and the README warns "This module is in
    development and may not work as expected. Use at your own risk. Not show
    ready!" It also requires starting Chataigne *before* grandMA3 "to avoid
    known port conflicts". (FACT, README.)

---

### ETC Eos family (+ Augment3d) — ETC

Evidence base: ETC's own **ETCLabs** GitHub organisation (33 repos) plus three
independent Eos OSC client libraries and the Companion module.
`etcconnect.com` and `community.etcconnect.com` both blocked, so **no ETC
first-party documentation, pricing or user forum was read**.

- **STRENGTHS (conceded by critics)**
  - The OSC API is real, documented and broad enough to build against: four
    independent client libraries exist across four languages
    (`node-eos-console` TS, `pyEOS` Python, `sstaub/eOS` C++/Arduino,
    `EosKit` Swift), plus ETC's own `EosSyncLib` C++. (FACT, repo search.)
  - ETC staff participate: `EosSyncLib`'s README says the ETCLabs projects are
    built "by a combination of end users and ETC employees working in their
    spare time." (FACT.)
  - Real-time show-data sync is *possible* — `EosSyncLib` exists precisely to
    "access Eos show data in real time" with no third-party dependencies.
    (FACT, README.)

- **WEAKNESSES**
  - **Everything developer-facing is explicitly disowned.** Sixteen of the
    ETCLabs repos have descriptions that literally begin "UNOFFICIAL —",
    including OSCRouter, OSCWidgets, Sound2Light, lighthack, EosSyncLib,
    EosSyncDemo, ETCDmxTool and the Eos companion app. `EosSyncLib`'s README
    states: **"This is not official ETC software"** and **"ETC Support is not
    familiar with this software and will not be able to assist if issues
    arise."** (FACT, README.)
  - **That tooling carries a large, old, unanswered backlog.** OSCRouter has
    36 open issues; the oldest still-open ones date to 2016 (#4 "Not receiving
    all OSC Strings", opened 2016-08-16; #6 "Linux compile?", 2016-12-11), and
    #22 "Update need: AFTER add 41 route CRASH!" has been open since
    2022-01-11. OSCWidgets has 12 open including #14 "High CPU consumption"
    (2017-09-11) and #16 "Trouble getting feedback" (2018-04-07). On issue #4
    — a *dropped-cue* bug between an Eos Ti and QLab, where the OSC string
    firing the cue intermittently never reaches QLab — **no ETC response is
    visible on the page ten years later.** (FACT.)
  - The one Eos companion app in the org, `LuminosusEosEdition`, is described
    as "not maintained anymore". (FACT, repo description.)

- **MISSING FEATURES (what users request)**
  - **Timecode of the current cue** — Companion module #104 (enhancement,
    2026-05-28, open). (FACT.)
  - **Label polling** — #90 (2026-02-26, open): the module cannot passively
    learn object labels. (FACT.)
  - **Direct-select page display** — #7, open since 2020-09-10. (FACT.)
  - **Automatic state synchronisation in client libraries.** `node-eos-console`
    positions itself explicitly against `EosSyncLib`: it "doesn't automatically
    synchronize with show data — it requires manual requests to retrieve
    updated information." Two libraries, two different answers to the same
    question, is a sign the console's push model is not sufficient on its own.
    (FACT of the README; INFERENCE about the cause.)

- **UX PROBLEMS** — thin, because the forum was unreachable. What surfaced is
  developer-facing: OSCWidgets open issues cluster on basic desktop hygiene —
  window size and position not stored (#26), macOS Cmd-Q closing only the
  active window (#28), missing keyboard shortcuts for file operations (#25),
  "No visual feedback when Frames disabled" (#21). (FACT.)

- **PERFORMANCE PROBLEMS**
  - OSCWidgets #14 "High CPU consumption", open since 2017. (FACT.)
  - OSCRouter #22: crash after adding ~41 routes. (FACT of report.)
  - **Augment3d performance: UNKNOWN.** No repository, no reachable forum,
    zero results for `Augment3d` in repository search. This is a real gap —
    Augment3d is the visualiser most directly competitive with any 3D view
    AV Planner Suite might build. **To check next pass:** ETC forum,
    ControlBooth, r/lightingdesign.

- **PRICING PROBLEMS** — UNKNOWN. `etcconnect.com` blocked. Nomad/dongle
  tiering, channel-count gating and Augment3d licensing all unread.
  **To check next pass:** etcconnect.com product/licensing pages.

- **LOCK-IN**
  - **The show file is a closed binary with no public parser.** This was the
    landscape pass's finding and nothing this pass contradicts it: no Eos
    show-file parser appeared in repository search, and every library found
    talks to a *running console* over OSC rather than reading a file. The
    practical consequence: **you cannot get Eos data without a live console or
    a Nomad instance on the network.** (FACT of the absence + INFERENCE.)
  - LXLog's import list is the tell — it takes "EOS CSV", i.e. a manual export,
    not the show file. (FACT, LXLog README.)
  - **Version compatibility is disclaimed, not guaranteed.**
    `node-eos-console` warns it is "under active development and compatibility
    with any specific Eos console versions is not guaranteed." Companion
    module #65 is titled "Legacy ETC EOS V2.9.3" (bug, open since 2025-02-21).
    (FACT.)

- **OFFLINE** — The OSC API is a LAN protocol; nothing found suggests a cloud
  dependency for control. Nomad licensing offline behaviour is UNKNOWN.

- **INTEGRATION PROBLEMS**
  - **Case-sensitivity and type-precision bugs in the OSC surface.** Companion
    module #96 (2026-04-01, open): "CIE_X / CIE_Y variables not updating due to
    case mismatch in ParamMap lookup". `node-eos-console`'s changelog records
    fixing the "change user" command to encode user IDs as `int32` —
    "suggesting previous protocol misalignment". (FACT.)
  - **Silent message loss.** OSCRouter #4 (above) is the sharpest example: OSC
    that should fire a cue simply does not arrive, intermittently, with the
    pending-cue updates arriving fine alongside it. (FACT of report; root
    cause UNVERIFIED — could be OSCRouter, the network, or the console.)
  - Connection failures with no diagnosis: Companion #97 "[BUG] Eos module does
    not connect." (2026-04-14, open). (FACT.)

---

### Vectorworks Spotlight — Vectorworks / Nemetschek

Evidence base: Vectorworks' **own** developer repos, plus three independent
automation projects that document what they had to work around.
`forum.vectorworks.net` blocked.

This section is unusually well-evidenced because two projects published
detailed accounts of fighting the product's automation surface.

- **STRENGTHS (conceded by critics)**
  - It is the drafting system of record and the symbol libraries are the
    reason: `vectorworks-bridge`'s constraint list treats "symbol must exist in
    resource library" as a hard invariant, i.e. the library *is* the data
    model. (FACT, README.)
  - The scripting surface is enormous — `vwx-mcp` built a knowledge index of
    **3071 `vs.*` functions**. (FACT, README.)
  - Vectorworks now runs public developer repos (`developer-scripting`,
    `developer-sdk`, `developer-worksheets`, `SDKExamples`) and *does* close
    documentation issues — #4 "Docs Missing for Dialog creation for Plug-In
    Development" is closed. (FACT.)

- **WEAKNESSES**
  - **The API is bigger than its documentation.** `vwx-mcp` states its index
    exists "since the API lacks complete documentation." The official repo's
    own open issues are documentation gaps: #1 "Missing parameter type
    documentation for 'symbol definition' type" (open since 2025-04-18), #6
    "Getting a reference to the group created by SymbolToGroup" (2025-07-07).
    (FACT.)
  - **There is no headless path for the operations integrators most need.**
    `vwx-mcp`: export/import verbs "open VW's own modal settings dialogs" and
    "the `vs` API has no headless path for them." (FACT, README — direct quote.)
  - **Document mutation is only safe inside VW's script runner**, forcing a
    three-stage trigger → executor → work pipeline rather than direct
    scripting. (FACT, README.)
  - **Modal error dialogs block automation.** `vwx-mcp` had to build a native
    C++ palette that "auto-dismisses VW error dialogs (content-matched) →
    never blocks." A tool whose selling point is *automatically dismissing the
    host application's error dialogs* is describing a product that throws a lot
    of them. (FACT of the claim; INFERENCE about frequency.)

- **MISSING FEATURES (what users request)**
  - GIS georeference scripting — `developer-scripting` #10, open since
    2025-12-18. (FACT.)
  - **Paperwork that is actually presentable.** `eosti/lighting-paperwork`
    exists to generate channel hookups, instrument schedules, colour cut lists
    and gobo pull lists from Vectorworks data, because VW worksheets are not
    the answer. Its 15 open issues are a specification of what VW-derived
    paperwork lacks: page-size control (#20), page-number restart (#25),
    selective report generation (#24), channel breaks within rows (#21),
    column validation (#22), frame-size formatting variants (#10). (FACT.)
  - **Precircuiting** — `shamanskyh/Precircuiter` exists to "precircuit a
    Vectorworks plot using the most efficient pairing of lights and dimmers."
    (FACT, repo description; INFERENCE that VW does not do this.)

- **UX PROBLEMS**
  - **Focus theft.** `vwx-mcp` claims to eliminate "focus juggling" — i.e. the
    normal scripting path steals window focus. (FACT of claim.)
  - **Crashes during automation.** The same README describes its architecture
    as "structurally crash-proof", positioned against the ordinary path.
    (FACT of claim; the implied baseline instability is INFERENCE.)

- **PERFORMANCE PROBLEMS**
  - **A single documented pathological call: `vs.CombineIntoSurface`, measured
    at 215 seconds**, which `vwx-mcp` "quarantined behind safety flags."
    That is a named function, a measured number and a mitigation — the
    strongest single performance datum in this entire dossier. (FACT, README.)
  - `eosti/lighting-paperwork` #18 "Pandas Optimization" — even downstream
    processing of VW's exported data needs optimising. (FACT.)

- **PRICING PROBLEMS** — UNKNOWN. Vendor site not fetched, review sites
  blocked. Subscription-vs-perpetual sentiment, the usual Nemetschek
  complaint, is entirely unevidenced here. **To check next pass:**
  vectorworks.net pricing, forum.vectorworks.net, G2/Capterra.

- **LOCK-IN**
  - **The Lightwright exchange is undocumented and had to be reverse-
    engineered — twice, ten years apart.** `danielbchapman/OpenSpotlightData
    Exchange` (2016) and `Gribiche64/vectorworks-bridge` (2026) both exist to
    interface with Spotlight "via the Lightwright Data Exchange format", and
    the latter ships a `PROTOCOL.md` describing "the full reverse-engineered
    protocol, the LW-vs-VW writer asymmetry, and known constraints." (FACT.)
  - **The exchange has a permanent-corruption failure mode.** From
    `PROTOCOL.md`, quoted in substance: if a type-swap patch references a
    `Symbol_Name` that is not in the drawing's resource library, Vectorworks
    imports it anyway and the **entire drawing loses fixture selectability** —
    "Click and marquee both do nothing" — and the damage is described as
    permanent, recoverable only by restoring a pre-corruption backup. The
    documented defence is to verify the target symbol exists by confirming at
    least one fixture already uses it. (FACT, PROTOCOL.md.)
  - **Coupled fields do not travel together.** On a type swap, VW "preserves
    the old wattage unless explicitly provided in the patch", which the
    bridge's README names the **"frankenfixture risk where the symbol swaps
    but the wattage stays stale."** The tool warns but cannot prevent it.
    (FACT, README + PROTOCOL.md.)
  - **The round-trip is partial and mostly untested.** `PROTOCOL.md` classes
    fields into tested-and-working (channel, type swap with
    `Symbol_Name` + `Inst_Type` + `Use_Legend`, wattage), untested-but-expected
    (position, dimmer, circuit number, user fields 1–6, colour, gobo), and
    **not supported: creating fixtures from scratch (new UIDs) via patch**,
    with "Lightwright_ID assignment semantics unclear." (FACT.)
  - **The two ends behave differently.** VW's file watcher auto-imports
    changes; **Lightwright expects manual menu interaction.** The two apps even
    order the XML differently (LW puts fixture blocks before its header on
    single-fixture deltas; VW puts the header first). (FACT, PROTOCOL.md.)

- **OFFLINE**
  - **The exchange depends on OS filesystem events and breaks over network
    mounts.** `PROTOCOL.md`: writes through VM mounts "don't propagate macOS
    FSEvents, blocking VW's file watcher. Use native filesystem paths only."
    A shared-drive or VM-based studio workflow silently stops updating. (FACT.)

- **INTEGRATION PROBLEMS**
  - Everything above, plus: the handshake is a four-message dance ("Originator
    writes delta → receiver imports → receiver writes empty ack → originator
    writes empty ack"), and an empty `InstrumentData` block means "caught up",
    **not** "drawing emptied" — a semantic landmine for any third party
    implementing it. (FACT, PROTOCOL.md.)
  - Position data arrives irregular enough that downstream tools need regex
    tuning: `lighting-paperwork` #15 "Improve position regexes". (FACT.)

---

### Lightwright — John McKernon Software

No Lightwright repository, forum or vendor page was reachable. Everything
below is inferred from the *other* side of its exchange and from the tools
built to avoid it. Treat as thin.

- **STRENGTHS**
  - It is the acknowledged standard, conceded even by the author of a
    competing tool: `eosti/lighting-paperwork`'s README explicitly recommends
    Lightwright for anyone needing "something reliable, trusted, and
    industry-standard", and describes its own tool as "fairly opinionated",
    built for a "limited dataset", to be verified "against your plot" rather
    than trusted. That is a competitor conceding the field. (FACT, README.)

- **WEAKNESSES / LOCK-IN**
  - **The exchange format is undocumented** — see the Vectorworks section. The
    `AppStamp` element literally carries the value `Lightwright`, and the whole
    protocol had to be deduced by observation. (FACT, PROTOCOL.md.)
  - **Asymmetric automation posture: Lightwright requires a human.** VW watches
    the file and imports automatically; LW "expects manual menu interaction."
    Any automated pipeline therefore stalls on the Lightwright end. (FACT.)
  - **No documented creation path.** New fixtures cannot be created through the
    exchange; only existing UIDs can be patched. (FACT.)

- **MISSING FEATURES (what users request)** — inferred from what replacements
  build: LXLog generates channel hookups, hanging schedules, magic sheets,
  patch documentation, equipment lists, cut lists and **EOS targets**, and
  imports EOS CSV, Lightwright Text, MA2/MA3 XML and MVR — i.e. people want
  paperwork that ingests *MVR and console exports*, not just the VW side-car.
  (FACT of the feature list; INFERENCE about motive.)

- **UX / PERFORMANCE / PRICING / OFFLINE** — UNKNOWN. **To check next pass:**
  mckernon.com, ControlBooth, r/techtheatre, r/lightingdesign.

---

### QLC+ — Massimo Callegari / community

Best-evidenced product in the segment for stability and regression pain: an
open bug tracker with a decade of history and an in-progress UI migration.

- **STRENGTHS**
  - Genuinely broad protocol support and genuinely free (Apache-2.0), and it
    ships releases regularly: 5.0.0, 5.0.1, 5.1.0, 5.2.0, 5.2.1, 5.2.2 plus a
    maintained 4.14.x line. (FACT, releases page.)
  - The maintainer triages: issues carry an "issue confirmed" label and are
    self-assigned. (FACT.)
  - Localisation is actively worked (Catalan, Spanish translation updates in
    recent releases). (FACT.)

- **WEAKNESSES**
  - **Crashes are frequent and recent.** A single `crash` query returned
    **twelve crash issues dated 2026 alone**: #1930 (second scene after a
    show), #1964 (function preview with a script), #1967 (crash on launch),
    #1976 (setting submaster to 0), #1992 (3D render), #1997 (DMX dump with
    more than 4 universes), #2002 (Raspberry Pi universe IO reset), #2028
    (macOS M-series, opening 3D view), #2057 (very short scripts — **open**),
    #2023 (`VCPage::inputValueChanged` segfault — **open**), #2079 (Ctrl+Z
    after adding an RGB matrix), #2095 (fixture editor). (FACT.)
  - **A data-integrity bug in the fixture editor.** #2095 (2026-08-18): the
    Fixture Editor will save a `.qxf` definition with no `<Mode>` element, and
    that file then cannot be reopened in the editor and fails to load in a
    workspace **"without providing any helpful error message."** The reporter
    traces it to loader-side validation added in commit `8fa21c7` to stop a
    crash, which fixed one direction and left the writer unguarded. (FACT.)
  - **Bugs sit confirmed for years.** #1145 "Can't set channel to zero when it
    has a default value" — opened **2018-09-25**, labelled issue-confirmed,
    assigned to the maintainer, **still open 2026-08-29 (nearly 8 years)**. The
    symptom is a lie in the UI: "The DMX value shown reads 0, but the DMX
    monitor shows 255." (FACT.)
  - **Diagnosis depends on the reporter's C++ skill.** #2023's author states
    they have limited C++ proficiency and can only say the segfault "just
    happens sometimes" while editing the virtual console. No maintainer reply
    visible. (FACT.)

- **MISSING FEATURES (top by reactions)**
  1. **Timecode sync in Show Manager** (#1221, open since 2020-05-01) — the
     most-wanted request. (FACT.)
  2. **Copy/paste for chaser steps** (#215, open since 2013-12-11 — **almost
     13 years**). (FACT.)
  3. Virtual Console button colour sync with RGB custom feedback (#926, 2017).
  4. Audio jack input support (#1024, 2018).
  5. Channel-zero capability (#1145, above).
  - Also: `qmlui: enhance printing support` (#2086, 2026-07-30, open) —
    printing is weak in v5. (FACT.)

- **UX PROBLEMS**
  - Virtual Console items "get dropped based on top-left corner" (#2068).
  - Drag-and-drop reordering of functions "not working correctly" (#2059,
    open since 2026-07-05).
  - Background image applied to *all* components in the Virtual Console
    (#1312, confirmed, open since 2022-01-13).
  - Theme bleeds into Virtual Console widgets (#1603, 2024-08-04).
  - Simple-desk position not saved/restored (#2061). (All FACT.)

- **PERFORMANCE PROBLEMS**
  - The crash list above doubles as the performance story. Notable scale-linked
    ones: DMX dump crashing with **more than 4 universes** (#1997) and 3D view
    crashing on macOS Apple Silicon (#2028). (FACT.)

- **PRICING PROBLEMS** — none. Free, Apache-2.0. This is QLC+'s decisive
  advantage and the reason its bug list is long: the user base is far wider
  than a paid product's would be. (FACT + INFERENCE.)

- **LOCK-IN** — minimal. Open format (`.qxf` fixture definitions are XML), open
  licence. The one lock-in-shaped problem is *internal*: a v5-written fixture
  definition that v5 itself cannot reopen (#2095). (FACT.)

- **OFFLINE** — fully offline; desktop/RPi application, no cloud dependency
  found. Web API exists for remote control (#2064 concerns "absolute
  operate/design mode set + mode readback over WebSocket"). (FACT.)

- **INTEGRATION PROBLEMS**
  - **OSC feedback emits malformed packets in v5** — #2040 "OSC feedback sends
    invalid packets in QLC+ 5" (closed 2026-06-11). (FACT.)
  - **MIDI custom feedback settings disappeared** in the v5 migration (#2012,
    closed 2026-05-13). (FACT.)
  - OSC collection/chase feedback error (#1413, open since 2023-03-28).
  - Per-widget feedback cannot be disabled (#926, open since 2017-01-19).
  - **The v4 → v5 (qmlui) migration lost features.** Beyond MIDI feedback:
    the alias section is not visible in the v5 fixture editor (#2037),
    translations are "partially missing" (#2018, open), printing needs
    enhancement (#2086). Two parallel lines (4.14.4 and 5.2.2 released the
    same day, 15 March) is itself the evidence that v5 is not yet a full
    replacement. (FACT.)

---

### Open Lighting Architecture (OLA) — Open Lighting Project

The clearest maintenance-failure case in the segment, and it is documented by
the project's own contributors.

- **STRENGTHS**
  - Still the broadest protocol-plumbing layer and a de-facto gateway; issue
    traffic continues, including RDM responder test work (#848) and hardware
    support requests (#1737 usbdmx.com, #578 WS2811/12B). (FACT.)

- **WEAKNESSES — the headline**
  - **Last release: 0.10.9, 2023-02-26.** That is **3 years 6 months before
    today**. Before it, 0.10.8 was 2020-11-22. (FACT, releases page.)
  - **Issue #2035, "Ola seems unmaintained: Can we help with maintenance?"**,
    opened **2026-03-21** by contributor `aroffringa`. Its content, in
    substance: OLA "isn't getting maintained anymore"; **Debian has dropped
    OLA**; compilation fails on recent distributions; the author opened
    PRs #1989, #1890 and #1889 to fix this and **none were merged**, with no
    explanation from the named maintainer. He proposes granting merge rights
    to several people and volunteers himself, saying he would rather
    collaborate than fork. **No maintainer reply is visible on the page**, and
    the issue is filed to milestone `0.future`. (FACT.)
  - **A core-function bug has been open for over eight years.** #1396 "RDM
    full discovery sometimes misses connected fixtures or will sometimes hang",
    opened **2018-03-28**, with debug logs attached showing 2 of 4 fixtures
    missed on one run and all 4 found on another; the hang "freezes the quality
    assurance software." Milestone `0.future`, no maintainer response visible.
    For a product whose entire job is protocol plumbing, unreliable RDM
    discovery is a failure at the core. (FACT.)

- **MISSING FEATURES**
  - Java bindings — **#16**, one of the oldest open issues in the repo. (FACT.)
  - Platform/packaging: Yocto recipe (#1398), DragonFly BSD (#1473), official
    Raspberry Pi images (#1707, "[RFC]"). (FACT.)

- **UX PROBLEMS** — not applicable in the usual sense (it is a daemon +
  web UI). The UX complaint that *does* surface is operational: "Connecting
  multiple raspberry pi to same universe" (#1565) is filed as a *question*,
  i.e. the documentation does not answer a common topology. (FACT.)

- **PERFORMANCE PROBLEMS** — the RDM discovery hang (#1396) is the one
  documented case. (FACT.)

- **PRICING PROBLEMS** — none, LGPL-2.1. (FACT, landscape pass.)

- **LOCK-IN** — none by licence. The *practical* lock-in is the inverse: if
  you build on OLA you inherit its maintenance risk, and a distribution has
  already dropped it. (INFERENCE from #2035.)

- **OFFLINE** — fully local. (FACT by architecture.)

- **INTEGRATION PROBLEMS** — **build failure on modern distributions is the
  integration problem**, per #2035. Anything shipping OLA must now vendor or
  patch it. (FACT of the claim.)

---

### BlenderDMX — open-stage

- **STRENGTHS**
  - The reference open implementation of the GDTF/MVR stack, backed by two
    maintained libraries the whole ecosystem reuses (`pygdtf`, `pymvr`), and
    genuinely popular for a niche tool (281★). (FACT.)
  - **Actively released and moving fast.** Recent versions v2.1.9 → v2.3.0
    show continuous work on MVR layers/classes, universe numbering, GDTF
    parsing and mesh quality, and a physically-motivated colour rework in
    v2.1.7 ("additive-style mixing in linear RGB" for emitters,
    "multiplicative transmission in linear RGB" for filters). (FACT, releases.)
  - Zero open issues — the maintainer closes them. (FACT; also a caveat, see
    method note.)

- **WEAKNESSES**
  - **Its history is a catalogue of GDTF files that do not load.** #13 "GDTF
    not in BlenderDMX library not importing properly"; #17 "GDTF import fail —
    Base, Yoke, Head, Beam geometry naming is required" (i.e. the fixture file
    must follow a naming convention the tool depends on); #67 "Some glb files
    are made of multiple parts, merge them". (FACT.)
  - **Blender-version churn is a first-class problem.** #28 "Files created on
    alpha/beta won't work at vanilla"; the README pins "Blender 4.2 or higher
    installed, latest tested is 5.0." A visualiser whose host application
    breaks it every release cycle is a support burden. (FACT.)
  - Runtime failures on basic operations: #223 "Runtime error on create new
    show", #162 "MacOS: Crash on 'Create new show'", #38 "Crushing when
    pressing on setup 'create new show file'", #105 "fixture stops processing
    data", #61 "Error after some using", #47 "Error on addon install". (FACT.)
  - Renderer-specific defects: #7 "Cycles: The problem with Collimated Beams"
    (labelled bug/help-wanted/question), #41 "Volume Scatter error" — beams,
    the whole point of a previz tool, are hard in Blender's renderers. (FACT.)

- **MISSING FEATURES / requests** — the release notes read as the request
  queue being drained: MVR layers and classes management (v2.2.0), progressive
  MVR import with cancellation (v2.2.1), progressive MVR loading over
  MVR-xchange (v2.2.2), virtual-channel detection, DMX universe numbering.
  (FACT.)

- **PERFORMANCE PROBLEMS**
  - **Large MVR files used to block the UI.** The direct evidence is the fix:
    v2.2.1 added "progressive MVR import with cancellation capability" and
    v2.2.2 added "progressive MVR loading to MVR-xchange". You do not add
    cancellation to an import that was fast. (FACT of the changelog;
    INFERENCE about the prior behaviour. **The scale at which it degrades —
    fixture count, MVR size — is UNKNOWN**; the performance-query issue search
    returned only crash reports.)
  - v2.3.0 "Remove 3D animation data during GDTF files import" is a
    scene-weight reduction. (FACT.)

- **PRICING PROBLEMS** — none, free. (FACT, landscape pass.)

- **LOCK-IN** — none; open formats end to end. **This is the segment's main
  open escape hatch** and the reason MVR matters.

- **OFFLINE** — works offline, **except** that fixture profiles come from GDTF
  Share, an online library the README directs users to. Without network you
  are limited to whatever GDTF files are already on disk. (FACT, README +
  INFERENCE.)

- **INTEGRATION PROBLEMS** — MVR-xchange is implemented, which puts it into
  the interoperability minefield described in Cross-product patterns below.

---

### Perastage — PeramatoG

An MVR viewer/editor that exists precisely because opening an MVR otherwise
requires a visualiser licence. Its bug tracker is the best available proxy for
"what actually goes wrong when real MVR files from real software meet a real
tool", because it is young, popular (112★) and its users file detailed reports
with logs.

- **STRENGTHS**
  - Fills a real gap: view and edit MVR "without needing specialized
    visualization software", cross-platform (Windows/macOS/Linux, incl.
    AppImage), GPL-3.0. (FACT, README.)
  - **Honest about scope**: "Perastage is **not** a real-time DMX visualizer."
    (FACT, README — direct quote.) The author spun the real-time ambition into
    a separate project, `Peraviz` (Godot + Art-Net, "early-stage").
  - Fast-moving with a substantive changelog: v1.0.0 → v1.6.0, adding
    cut/copy/paste, fixture distribution along trusses, "create from text"
    rider parsing (EN + ES), MVR-xchange TCP mode, measurement tools,
    automatic GDTF downloads. Issues are closed within days. (FACT; release
    *dates* UNVERIFIED, see method.)

- **WEAKNESSES**
  - **Crashes on ordinary interaction.** #2198 "App crashes after clicking
    fixtures or moving camera frequently"; #2089 "App crashes when pressing
    fixture"; #1991 "Program crashes after 2-3 random clicks" (closed as
    duplicate — three independent reporters, same symptom). All closed, but
    the clustering is the finding. (FACT.)
  - **Data drift on reload.** #2233 (2026-07-28, **open**): "every time i close
    and come back to it next day to continue on any truss i placed has move
    back to where i add it in be for i moved it" — trusses revert to their
    insertion position on reopen, reproducibly across v1.3, v1.4 and v1.5 on
    Windows 11, while other placed elements keep their positions. No maintainer
    response visible. **A planning tool that silently loses placement work is
    worse than no tool.** (FACT.)
  - **Case-sensitivity in the MVR/GDTF cache plus UUID loss.** #2157: on
    Windows 11 Pro 25H2 with Perastage 1.4.0, the cache treats
    `fk40q h-300.gdtf` and `FK40Q H-300.gdtf` (and later
    `fantek@fk40q_h-300@perastage.gdtf` vs
    `Fantek@FK40Q_H-300@Perastage.gdtf`) as distinct entries on a
    case-insensitive filesystem, causing redundant parsing; and on reload the
    2D viewer cannot find previously selected objects
    (`query='pick-uuid' found=false`), traced to side-car GDTF generation with
    spaces in filenames. (FACT, with log excerpts in the issue.)

- **MISSING FEATURES**
  - Renaming generic 3D objects imported from MVR scenes (#2008) — i.e. MVR
    scene objects arrive un-editable. (FACT.)

- **UX PROBLEMS**
  - 3D viewer content confined to the bottom-left corner of the viewport
    (#1650). (FACT.)

- **PERFORMANCE PROBLEMS**
  - Recurring changelog themes name them: "project opening stalls and crashes
    resolved", "layout rendering freezes addressed", "unnecessary redraws
    reduced", "faster project reopening through optimized loading of cached
    data", "3D picking fallbacks for malformed meshes". (FACT, releases.)

- **PRICING PROBLEMS** — none, GPL-3.0, free. (FACT.)

- **LOCK-IN** — none by design; it is the anti-lock-in tool.

- **OFFLINE**
  - Mostly offline, **but** v1.1.0 added "automatic GDTF downloads" and the
    v1.6.0 "create from text" workflow "resolves unknown fixture types using
    GDTF Share catalog suggestions" — both need the network. Same dependency as
    BlenderDMX. (FACT.)

- **PLATFORM PROBLEMS** (worth separating from performance)
  - **Linux 3D rendering is broken in a specific, confirmed way**: #1778
    (2026-04-28, **open**) — opening layout view and adding a 2D view yields
    "a white box instead the image of the plot", on Fedora 44 and Tuxedo OS via
    AppImage; PDF export of the same plot works. Labelled graphics/OpenGL,
    bug, Linux, confirmed. (FACT.)
  - **macOS version incompatibility with no diagnosis path**: #2092
    (2026-06-23, **open**) — "Incompatible with macOS 15.7.7", DMG install,
    reporter supplied no logs, maintainer label `awaiting-feedback`. The user
    asks "Any chance to fix this issue, or I need to update operating system?"
    (FACT.)

- **INTEGRATION PROBLEMS**
  - **GDTF virtual parameters are counted as DMX channels.** #1652
    (opened 2026-04-18, closed): an RGB LED par with a virtual dimmer in its
    GDTF shows **4 DMX channels instead of 3**, and the patch is flagged as an
    error. The reporter's framing is the important part: *"When a fixture has a
    parameter count of 3 in vectorworks/gdtf builder I expect this count in
    perastage as well."* Same file, three tools, three channel counts. (FACT.)
  - Changelog themes name the rest: "resource synchronization and UUID
    handling", "GDTF path resolution", "fixture type conflict resolution during
    merge", "MVR-xchange TCP shutdown races", "Unicode archive entry name
    support". (FACT.)

---

### ToskLight — kellertobias

Two repos: `tosklight` (Rust, current) and `tosklight-legacy` (TypeScript). No
issues filed on either; the README is the evidence.

- **STRENGTHS / positioning**
  - The clearest statement of the segment's economic pain found anywhere this
    pass. The README concedes professional desks are "excellent tools and worth
    every penny", then names the gap: smaller productions cannot justify the
    cost and are forced to **"learn throwaway workflows simply because their
    budget is smaller."** (FACT — direct quote.)
  - Brings named professional concepts down-market: "a command line,
    Programmer, tracking, Groups, Presets, Cuelists, Playbacks, and portable
    show files" across macOS, Windows, Linux and browser-connected desks.
    (FACT.)
  - GDTF fixtures and MVR workflows, Art-Net and sACN with routing and
    diagnostics, 2D/3D visualisation. (FACT.)

- **WEAKNESSES**
  - **Not production-ready by its own admission: "ToskLight is not yet a
    release candidate."** (FACT.)
  - **Unusually honest published scaling limits** — and they are *low*:
    real-time 3D visualisation to roughly **300 fixtures**; a supported ceiling
    of **1,000 physical instances at 60 Hz**; a recommended maximum of
    **16 substantially occupied DMX universes**; "performance degrades beyond
    these profiles." (FACT — the most concrete performance envelope published
    by any product in this dossier, and a useful benchmark for AV Planner
    Suite's own 3D work.)

- **PRICING / LOCK-IN / OFFLINE** — community licence, SQLite show files,
  desktop and browser. Offline by construction. (FACT, landscape pass +
  README.)

---

### LXLog — kaelenfae

- **STRENGTHS**
  - **The import list is the product**: EOS CSV, Lightwright Text, MA2/MA3 XML,
    and MVR — four incompatible worlds into one paperwork generator, producing
    channel hookups, hanging schedules, magic sheets, patch documentation,
    equipment lists, cut lists and **EOS targets**. That someone built this
    is the strongest single indicator that **no incumbent ingests all four.**
    (FACT, README; INFERENCE about the motive.)
  - Web + Electron (React/Vite), so it runs in a browser or on the desktop.

- **WEAKNESSES**
  - Export is only **PDF and CSV** — no round-trip back into any of the
    formats it reads. Import-only paperwork is a dead end. (FACT.)
  - The README states no motivation, no limitations and no known issues, and
    notes it was created "with the help of Google Antigravity". Zero issues
    filed. **This is a very young single-author tool; do not read its
    existence as validated demand.** (FACT + explicit caution.)

- **Everything else** — UNKNOWN, no corpus.

---

### Other tools touched

- **`Peraviz`** (PeramatoG) — early-stage open-source MVR live visualiser on
  Godot with Art-Net. One open issue, #20 "Feedback and DMX Input issue"
  (2026-06-14); body not readable from the list page. Relevant mainly as
  evidence that the Perastage author judged real-time visualisation to need a
  *separate engine* rather than an extension of the MVR editor. (FACT.)
- **`MVR4J`** (Verschwiegener) — a Java MVR + xchange implementation, 0★,
  0 open issues, 3 open PRs, last touched 2025-10-23. Evidence that
  MVR-xchange is being implemented independently in more languages, not
  evidence of pain. (FACT.)
- **`companion-module-requests`** — 928 open requests overall. Lighting-related
  open requests found: SignalRGB (#2076), Rako (#2017), RAPIX via Modbus TCP
  (#2015), Lutron GRAFIK Eye QS (#1992, and #1339 wireless), **ETC Echo Touch
  (#1894, 2025-06-04)**, Blackout lighting console (#1821), CueLux Pro /
  Visual Productions (#1593), Musco (#1525), ADJ WMX1/WolfMix (#1467).
  Note what is *absent*: no open request for grandMA3, Eos, QLC+ or Chamsys —
  those already have modules. The demand is at the **architectural / installed
  / small-console edges**. (FACT.)

---

## Cross-product patterns

These repeat across multiple independent vendors and are the most valuable
findings in this dossier.

### 1. MVR is a format, not an interoperability guarantee — and practitioners say so explicitly

**Frequency: widespread.** This is the segment's defining complaint.

The sharpest statement is on the official spec tracker itself.
`mvrdevelopment/spec` issue **#298** (opened 2026-02-16 by `kinglevel`, open):
**"every manufacturer implements MVR differently"** — and specifically
"Import/export behavior, patch merging, fixture mapping — it all varies."
The reporter's ask is not a spec clause but **shared infrastructure**: standard
public MVR libraries and consistent import-dialog workflows so the experience
is "familiar" across implementations. (FACT.)

Everything else this pass corroborates it:
- **The same fixture yields different channel counts in different tools.**
  Perastage #1652: an RGB par with a GDTF virtual dimmer counts 3 channels in
  Vectorworks and the GDTF Builder, 4 in Perastage, and the patch is flagged
  as an error. (FACT.)
- **The reference open implementation had to add defensive naming
  requirements**: BlenderDMX #17 rejects GDTFs that do not name geometries
  Base/Yoke/Head/Beam. (FACT.)
- **Vendors ship compatibility work aimed at named peers**: Perastage v1.6.0
  improves "MVR-xchange TCP mode compatibility with applications like
  grandMA3", and separately hardens "fixture type conflict resolution during
  merge". (FACT.)
- **MVR-xchange itself has under-specified basics still open**: stations in
  websocket mode know each other's `StationUUID` but **never `StationName`**,
  so a commit list cannot show human-readable names (#256, 2025-01-17, open);
  `MVR_COMMIT`'s `verMajor`/`verMinor` semantics need clarification (#254);
  websocket password handling is unresolved (#258). (FACT.)

**AV Planner Suite angle.** Do not treat "we support MVR" as a feature — treat
*per-vendor MVR dialects* as the feature. Build an import layer that
normalises known divergences (virtual-parameter channel counting, geometry
naming, case-folded resource paths, UUID stability) and that **shows the user
a diff of what changed on import** rather than silently merging. A visible,
explainable import — "Vectorworks says 3 channels here, MA3 says 4, we kept
3 because X" — is a differentiator nobody in this segment currently offers.

### 2. MVR describes the rig but not the infrastructure — and the spec community is actively asking for cables

**Frequency: recurring, and rising.** Directly relevant to Cable Planner.

Two open spec issues ask for exactly the data model AV Planner Suite already
builds:
- **#296 "Allow to define cables in MVR"** (petrvanekrobe, 2026-01-27, open,
  label `mvr spec`): asks for cable inventory items carrying **CrossSection,
  Length and Cable Type**, plus connection points to the respective MVR
  Connections of linked devices. It openly debates whether cables should be
  GDTF-defined — which "would allow to build a library of inventory items" at
  the cost of defining every cable. **Unassigned, no PR.** (FACT.)
- **#288** (klinzey, 2025-10-20, open): the ChildList node should include
  **Wiring Object and Pin Patch**, arguing "Individual cables and the
  connections need to be specified in the MVR file." **No comments, no
  assignee, no development activity.** (FACT.)

Adjacent open gaps in the same label: fixture groups (#295), multi-branch pixel
controllers and downstream pixel topology (#304), mesh-quality variants for 3D
scene objects (#306), VideoScreen screen types (#310), layer colours (#321),
scene thumbnails (#285). (FACT.)

**AV Planner Suite angle.** The lighting industry's own standards body has
open, unassigned, unimplemented tickets for cable and wiring data — the exact
domain Cable Planner already models. Two moves follow: (a) implement an MVR
import/export that carries cable and connection data in a documented private
extension, and (b) post the schema on #296/#288 as a concrete proposal. Being
the reference implementation of cables-in-MVR is a defensible position, and
the tickets are sitting there unanswered.

### 3. The console's own data is reachable only through a live console, an unofficial library, or a manual export

**Frequency: widespread across the two market leaders.**

- **grandMA3**: no public show-file parser found; feedback needs a
  console-side Lua plugin; the community's API reference is an unofficial,
  trial-and-error wiki that admits it "may be missing or incorrect
  information." (FACT.)
- **ETC Eos**: show file is a closed binary with no public parser; every
  library talks OSC to a running console; ETC's own libraries are branded
  UNOFFICIAL with **"ETC Support ... will not be able to assist if issues
  arise."** (FACT.)
- **Vectorworks/Lightwright**: the interchange format is undocumented and has
  been reverse-engineered twice, ten years apart. (FACT.)

The consequence is uniform: **planning tools cannot read the plan; they can
only interrogate a running system or parse a human-triggered export.** LXLog's
import list (EOS CSV, Lightwright Text, MA2/MA3 XML, MVR) is a picture of
exactly this — four export formats, no native ones.

**AV Planner Suite angle.** Design for the export-file reality rather than
waiting for APIs: robust, well-tested importers for EOS CSV, Lightwright
Data Exchange XML, MA2/MA3 XML and MVR, with explicit provenance tracking
("this channel came from an EOS CSV exported 2026-08-14"). And where a live
connection *is* available, treat OSC as a supplement, never the source of
truth.

### 4. Integration bridges are single-maintainer and go dark

**Frequency: recurring.**

- `grandMA3-Feedback-Chataigne-Module`: **archived**; author moved on, asked
  for a maintainer, warned "Not show ready!" (FACT.)
- `ETCLabs/LuminosusEosEdition`: "not maintained anymore" in its own
  description. (FACT.)
- `ETCLabs/OSCRouter` / `OSCWidgets`: 36 and 12 open issues, oldest unanswered
  since 2016 and 2017. (FACT.)
- `OpenLightingProject/ola`: last release 2023-02-26; contributor PRs unmerged;
  Debian dropped it. (FACT.)
- `node-eos-console`: "compatibility with any specific Eos console versions is
  not guaranteed." (FACT.)

**AV Planner Suite angle.** Every integration you ship inherits somebody's
bus factor. Prefer **documented wire protocols you implement yourself**
(OSC, Art-Net, sACN, MVR-xchange, the Lightwright XML) over depending on a
third-party bridge; and where you must depend on one, vendor it and pin it.
A stated integration-support policy — "we test against Eos X and MA3 Y each
release, here is the matrix" — is itself a differentiator against a field of
disclaimers.

### 5. Long-lived, confirmed, unfixed core bugs

**Frequency: recurring across the open-source products.**

- QLC+ #215, chaser copy/paste — open since **2013**.
- QLC+ #1145, channel cannot be set to zero, **confirmed and assigned** —
  open since **2018**; the UI shows 0 while the DMX monitor shows 255.
- QLC+ #1312, VC background image applies to all components, confirmed —
  since 2022.
- OLA #1396, RDM discovery misses fixtures / hangs, with logs — since **2018**,
  milestone `0.future`.
- OLA #16, Java bindings — one of the oldest open issues in the repo.
- ETCLabs OSCRouter #4, dropped OSC cue strings — since **2016**, no ETC reply.
- Companion grandMA3 #5, feedback — since 2024, the module's only open issue.

**AV Planner Suite angle.** The bar for "responsive maintenance" in this
segment is astonishingly low. Publishing a triage SLA and actually closing
reported bugs within a release cycle would read as a category difference, not
a nicety.

### 6. Automation is blocked by GUI modality and focus

**Frequency: recurring; strongest on Vectorworks.**

`vwx-mcp` had to build a native C++ palette to escape three separate
GUI-imposed limits: focus stealing, modal error dialogs that block
indefinitely (its palette "auto-dismisses VW error dialogs (content-matched) →
never blocks"), and the absence of any headless path for export/import verbs,
which "open VW's own modal settings dialogs." Document mutation is only safe
inside VW's script runner, forcing a three-stage pipeline. (FACT.)

Related, on the file side: the Vectorworks↔Lightwright exchange relies on
**macOS FSEvents**, so writes through VM mounts silently never trigger the
watcher — automation that appears to work locally fails on a studio's network
storage. (FACT, PROTOCOL.md.)

**AV Planner Suite angle.** Ship a headless/CLI path for every import, export
and report from day one, and never put a modal dialog in a code path a script
can reach. For file watching, do not rely on OS event APIs alone — poll as a
fallback, and surface "watching is not working on this path" to the user
instead of failing silently.

### 7. Silent data loss and drift beat crashes as the real risk

**Frequency: recurring across three independent products.**

- **Perastage #2233**: trusses revert to their insertion position on reload,
  reproducibly, across three versions, while other objects keep theirs. Open,
  no maintainer response. (FACT.)
- **Perastage #2157**: UUIDs stop resolving after reload; the 2D viewer cannot
  find the object you selected before saving. (FACT.)
- **QLC+ #2095**: the fixture editor writes a definition it cannot reopen, and
  the workspace fails to load it "without providing any helpful error
  message." (FACT.)
- **QLC+ #1145**: the UI reads 0 while the wire carries 255. (FACT.)
- **Vectorworks/Lightwright**: a bad `Symbol_Name` in a type-swap patch
  permanently destroys drawing-wide fixture selectability — "Click and marquee
  both do nothing" — recoverable only from backup; and wattage silently stays
  stale after a type swap ("frankenfixture"). (FACT, PROTOCOL.md.)

**AV Planner Suite angle.** This is the clearest product opportunity in the
dossier and it maps onto Cable Planner's existing invariants: **atomic writes
with .bak rotation, a schema-migration layer that runs on every load, and
stable IDs that survive round-trips.** Make those explicit selling points —
"your positions do not move, your IDs do not change, and every write is
atomic" — and add a validate-on-import step that refuses a destructive patch
rather than applying it, exactly the check `vectorworks-bridge` had to bolt on
from outside.

### 8. Linux and Apple Silicon are second-class; fixture libraries need the internet

**Frequency: recurring.**

- Perastage #1778: Linux (Fedora 44, Tuxedo OS, AppImage) renders a white box
  instead of the plot in layout view, confirmed, open. (FACT.)
- Perastage #2092: incompatible with macOS 15.7.7, open, awaiting-feedback.
- QLC+ #2028: crash on macOS M-series opening the 3D view; #2002: Raspberry Pi
  universe-IO reset crash.
- OLA: compilation fails on recent distributions (#2035); Linux is its home
  platform.
- ETCLabs OSCRouter: #6 "Linux compile?" (2016) and #23 Xcode build failure.

And on the network side, the two free MVR tools both reach out to **GDTF
Share** for fixture profiles (BlenderDMX's README directs users there;
Perastage added automatic GDTF downloads in v1.1.0 and GDTF Share catalogue
suggestions in v1.6.0). Offline, you have only what is already cached.

**AV Planner Suite angle.** Cable Planner is already offline-first Electron;
that is worth stating loudly, alongside a **bundled, versioned local fixture
library with an explicit "last synced" indicator** rather than a live lookup.
And treat Linux and Apple Silicon as tier-one test targets — the incumbents
visibly do not.

---

## Direct quotes-of-substance

All paraphrased or quoted from pages opened during this pass. Every one has a
URL in Sources. Dates are as shown on the page.

1. **"Ola isn't getting maintained anymore."** A contributor opens a public
   maintenance-succession issue, noting Debian has dropped OLA, compilation
   fails on recent distributions, and three of his PRs (#1989, #1890, #1889)
   sit unmerged with no explanation from the named maintainer. He offers to
   take on maintenance and says he would rather collaborate than fork.
   — OLA issue #2035, opened 2026-03-21, still open, milestone `0.future`.

2. **"This is not official ETC software"** and **"ETC Support is not familiar
   with this software and will not be able to assist if issues arise."**
   — ETCLabs/EosSyncLib README, the library for reading Eos show data in real
   time. Sixteen ETCLabs repos carry an "UNOFFICIAL —" description prefix.

3. **"every manufacturer implements MVR differently"** — "Import/export
   behavior, patch merging, fixture mapping — it all varies." The reporter
   asks for standard public MVR libraries and consistent import-dialog
   workflows so implementations feel familiar.
   — mvrdevelopment/spec issue #298, `kinglevel`, 2026-02-16, open.

4. **"The below information is not official and has been tested on a
   trial-and-error basis; thus may be missing or incorrect information."**
   The community's grandMA3 Lua API wiki, which also records that MA Lighting
   only began shipping official Lua documentation "as of version 1.5.2", and
   names two v2.0 functions absent from the official `HelpLua` output.
   — hossimo/GMA3Plugins wiki.

5. **A bad symbol reference permanently breaks the drawing.** If a type-swap
   patch names a `Symbol_Name` absent from the drawing's resource library,
   Vectorworks imports it and drawing-wide fixture selectability is lost —
   "Click and marquee both do nothing" — with recovery only from a
   pre-corruption backup.
   — vectorworks-bridge `PROTOCOL.md`, reverse-engineered Lightwright Data
   Exchange spec.

6. **"frankenfixture risk where the symbol swaps but the wattage stays
   stale."** On a type swap the exchange preserves the old wattage unless the
   new one is explicitly supplied; the tool warns but cannot prevent it.
   — vectorworks-bridge README.

7. **A single Vectorworks call measured at 215 seconds.**
   `vs.CombineIntoSurface` is named "the one known pathological call",
   measured at 215 s and quarantined behind safety flags; separately, the `vs`
   API "has no headless path" for export/import, whose verbs "open VW's own
   modal settings dialogs."
   — vicquick/vwx-mcp README.

8. **Trusses move themselves overnight.** "every time i close and come back to
   it next day to continue on any truss i placed has move back to where i add
   it in be for i moved it to form where i need it" — reproducible across
   Perastage 1.3, 1.4 and 1.5 on Windows 11; other placed elements keep their
   positions. No maintainer response.
   — Perastage issue #2233, 2026-07-28, open.

9. **The same GDTF, three different channel counts.** "When a fixture has a
   parameter count of 3 in vectorworks/gdtf builder I expect this count in
   perastage as well." An RGB par with a virtual dimmer reports 4 DMX channels
   in Perastage against 3 elsewhere, and the patch is flagged as an error.
   — Perastage issue #1652, 2026-04-18.

10. **The UI reads 0, the wire carries 255.** A channel with a non-zero default
    cannot be driven to zero from a fader: "The DMX value shown reads 0, but
    the DMX monitor shows 255." Labelled issue-confirmed and assigned to the
    maintainer.
    — QLC+ issue #1145, opened 2018-09-25, **still open 2026-08-29**.

11. **Cues silently fail to fire.** OSC strings routed from an Eos Ti to QLab
    intermittently never arrive — pending-cue updates come through fine
    alongside them — so QLab misses the cue. No ETC response visible.
    — ETCLabs/OSCRouter issue #4, opened 2016-08-16, open.

12. **Remote control eats the operator's command history.** OSC commands "make
    it nearly impossible to pull up previous commands in command line" on
    grandMA3; the reporter suspects the commands are being recorded as indirect
    commands.
    — xxpasixx/pam-osc issue #37, 2026-03-19, open.

13. **The bridge is abandoned mid-flight.** "Because I decided to move on, and
    build the second generation of my onPC system, I will not continue to
    update this repository" — on a grandMA3 OSC-feedback module whose README
    already warned "Use at your own risk. Not show ready!"
    — einlichtvogel/grandMA3-Feedback-Chataigne-Module, archived.

14. **Budget forces throwaway skills.** Professional desks are "excellent tools
    and worth every penny", but smaller productions cannot justify them and end
    up having to "learn throwaway workflows simply because their budget is
    smaller."
    — kellertobias/tosklight README.

15. **A published performance envelope, and it is small.** Real-time 3D
    visualisation to roughly 300 fixtures; supported ceiling 1,000 physical
    instances at 60 Hz; recommended maximum 16 substantially occupied DMX
    universes; "performance degrades beyond these profiles."
    — kellertobias/tosklight README.

16. **A competitor concedes the incumbent.** The author of an independent
    Vectorworks paperwork generator recommends Lightwright to anyone needing
    "something reliable, trusted, and industry-standard", calls his own tool
    "fairly opinionated" and built for a "limited dataset", and tells users to
    verify its output "against your plot".
    — eosti/lighting-paperwork README.

17. **Cables are an open, unassigned ticket on the MVR spec.** A request to add
    cable inventory items to MVR carrying CrossSection, Length and Cable Type
    plus connection points to linked devices' MVR Connections — with an open
    question about whether to define them via GDTF, which "would allow to build
    a library of inventory items."
    — mvrdevelopment/spec issue #296, 2026-01-27, open, no assignee, no PR.

18. **Stations cannot name each other.** In MVR-xchange websocket mode
    "stations are only aware of other stations who made an MVR_COMMIT" and are
    "only able to know other station's StationUUID but never StationName", so
    a commit list cannot show human-readable names.
    — mvrdevelopment/spec issue #256, 2025-01-17, open.

19. **A save that cannot be loaded.** QLC+ 4.14.4's Fixture Editor will save a
    definition with no `<Mode>` element; the resulting `.qxf` then cannot be
    reopened in the editor and fails to load in a workspace "without providing
    any helpful error message." Traced to loader-side validation added in
    commit `8fa21c7` without a matching writer-side guard.
    — QLC+ issue #2095, 2026-08-18.

20. **Eight years on `0.future`.** RDM full discovery "sometimes misses
    connected fixtures or will sometimes hang", with debug logs attached
    showing 2 of 4 fixtures missed on one run and all 4 on another; the hang
    freezes the QA software. No maintainer response visible.
    — OLA issue #1396, opened 2018-03-28, open.

---

## What this pass did NOT establish (explicit gaps for the next pass)

Listing these so the dossier is not mistaken for complete.

| Gap | Why it matters | Where to look when unblocked |
|---|---|---|
| **All pricing** — grandMA3, Eos/Nomad, Vectorworks, Lightwright | The brief asked for dated prices; zero were obtainable | malighting.com, etcconnect.com, vectorworks.net, mckernon.com, dealer listings |
| **Dongle / licence-server behaviour offline** | Core to an offline-first pitch | Vendor licensing pages; ControlBooth threads |
| **Augment3d** specifically | ETC's visualiser is the closest competitor to any 3D view we build; zero evidence found | community.etcconnect.com, r/lightingdesign, ControlBooth |
| **MA 3D** performance and usability | Same reason | Blocked forums |
| **Designer/programmer UX opinion** (as opposed to integrator opinion) | GitHub over-samples developers | Reddit r/lightingdesign, r/techtheatre; ControlBooth; Blue Room |
| **German-language sentiment** | Market is DE-relevant | film-tv-video.de, production-partner.de, veranstaltungstechnik forums |
| **Review-site Cons fields** | Structured complaint data | G2, Capterra, GetApp, TrustRadius |
| **BlenderDMX's actual scale limit** | We need a benchmark for 3D previz | BlenderDMX Discord; issue bodies; direct testing |
| **Capture, Depence, WYSIWYG, Chamsys, Vision** | Named as MVR sources by DMXRouter but not researched | Everything above |

---

## Sources

Every URL below was opened and read during this pass unless marked otherwise.

**GDTF / MVR specification (mvrdevelopment/spec)**
- https://github.com/mvrdevelopment/spec/issues
- https://github.com/mvrdevelopment/spec/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/mvrdevelopment/spec/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/mvrdevelopment/spec/issues?q=is%3Aissue+is%3Aopen+label%3A%22mvr+spec%22
- https://github.com/mvrdevelopment/spec/issues/256
- https://github.com/mvrdevelopment/spec/issues/288
- https://github.com/mvrdevelopment/spec/issues/296
- https://github.com/mvrdevelopment/spec/issues/298

**QLC+**
- https://github.com/mcallegari/qlcplus/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/mcallegari/qlcplus/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/mcallegari/qlcplus/issues?q=is%3Aissue+crash
- https://github.com/mcallegari/qlcplus/issues?q=is%3Aissue+qmlui+OR+%22version+4%22+OR+%22QLC%2B+4%22
- https://github.com/mcallegari/qlcplus/releases
- https://github.com/mcallegari/qlcplus/issues/1145
- https://github.com/mcallegari/qlcplus/issues/2023
- https://github.com/mcallegari/qlcplus/issues/2095

**Open Lighting Architecture**
- https://github.com/OpenLightingProject/ola/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/OpenLightingProject/ola/releases
- https://github.com/OpenLightingProject/ola/issues/1396
- https://github.com/OpenLightingProject/ola/issues/2035

**Perastage / Peraviz**
- https://github.com/PeramatoG/Perastage
- https://github.com/PeramatoG/Perastage/issues?q=is%3Aissue
- https://github.com/PeramatoG/Perastage/releases
- https://github.com/PeramatoG/Perastage/releases/latest
- https://github.com/PeramatoG/Perastage/issues/1652
- https://github.com/PeramatoG/Perastage/issues/1778
- https://github.com/PeramatoG/Perastage/issues/2092
- https://github.com/PeramatoG/Perastage/issues/2157
- https://github.com/PeramatoG/Perastage/issues/2233
- https://github.com/PeramatoG/Peraviz/issues?q=is%3Aissue

**BlenderDMX and the open GDTF/MVR libraries**
- https://github.com/open-stage/blender-dmx
- https://github.com/open-stage/blender-dmx/releases
- https://github.com/open-stage/blender-dmx/issues?q=is%3Aissue+sort%3Acomments-desc
- https://github.com/open-stage/blender-dmx/issues?q=is%3Aissue+is%3Aclosed+sort%3Acomments-desc
- https://github.com/open-stage/blender-dmx/issues?q=is%3Aissue+MVR
- https://github.com/open-stage/blender-dmx/issues?q=is%3Aissue+slow+OR+performance+OR+lag
- https://github.com/open-stage/python-gdtf/issues?q=is%3Aissue
- https://github.com/open-stage/python-mvr/issues?q=is%3Aissue

**grandMA3 developer surface**
- https://github.com/hossimo/GMA3Plugins
- https://github.com/hossimo/GMA3Plugins/wiki
- https://github.com/xxpasixx/pam-osc/issues
- https://github.com/xxpasixx/pam-osc/issues/37
- https://github.com/xxpasixx/pam-osc/issues/38
- https://github.com/LightYourWay/grandMA3-tstl-plugin
- https://github.com/einlichtvogel/grandMA3-Feedback-Chataigne-Module (archived)
- https://github.com/bitfocus/companion-module-malighting-grandma3/issues?q=is%3Aissue
- https://github.com/bitfocus/companion-module-malighting-grandma3/issues/5
- https://raw.githubusercontent.com/bitfocus/companion-module-malighting-grandma3/main/companion/HELP.md

**ETC Eos developer surface**
- https://github.com/ETCLabs/EosSyncLib
- https://github.com/ETCLabs/EosSyncLib/issues?q=is%3Aissue
- https://github.com/ETCLabs/OSCRouter/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/ETCLabs/OSCRouter/issues/4
- https://github.com/ETCLabs/OSCWidgets/issues?q=is%3Aissue+is%3Aopen
- https://github.com/bitfocus/companion-module-etc-eos/issues
- https://github.com/douglasfinlay/node-eos-console
- https://github.com/douglasfinlay/node-eos-console/blob/main/CHANGELOG.md
- https://github.com/sstaub/eOS/issues?q=is%3Aissue

**Vectorworks and the Lightwright exchange**
- https://github.com/Gribiche64/vectorworks-bridge
- https://raw.githubusercontent.com/Gribiche64/vectorworks-bridge/main/PROTOCOL.md
- https://github.com/vicquick/vwx-mcp
- https://github.com/Vectorworks/developer-scripting/issues?q=is%3Aissue
- https://github.com/eosti/lighting-paperwork
- https://github.com/eosti/lighting-paperwork/issues?q=is%3Aissue+is%3Aopen

**Smaller tools**
- https://github.com/kaelenfae/LXLog
- https://github.com/kellertobias/tosklight
- https://github.com/Verschwiegener/MVR4J/issues

**Companion module demand**
- https://github.com/bitfocus/companion-module-requests/issues?q=is%3Aissue+is%3Aopen+lighting

**Repository discovery** (GitHub MCP `search_repositories`, results read but no
page opened): queries for `org:open-stage`, `org:ETCLabs`, `user:PeramatoG`,
`user:kaelenfae`, `user:kellertobias`, `grandMA3 lua plugin`,
`ETC Eos OSC library console`, `lightwright`, `vectorworks`,
`MVR xchange implementation`, `Augment3d ETC Eos` (0 results),
`grandMA3 showfile parser xml patch export` (0 results),
`GDTF fixture library tool builder` (0 results).

**Attempted and blocked** (recorded for the next pass, no content read)
- https://community.etcconnect.com/ — EGRESS_BLOCKED
- https://www.etcconnect.com/Products/Consoles/ — EGRESS_BLOCKED
- https://forum.vectorworks.net/ — EGRESS_BLOCKED
- https://www.controlbooth.com/ — EGRESS_BLOCKED
- https://gdtf-share.com/ — EGRESS_BLOCKED
- https://www.malighting.com/ — EGRESS_BLOCKED
- https://github.com/search?q=perastage&type=repositories — HTTP 429,
  Retry-After 3600
- https://www.reddit.com/, https://old.reddit.com/, https://www.g2.com/,
  https://forum.blackmagicdesign.com/ — 403 to CONNECT (from the proxy's
  recent-failure log for this session)
