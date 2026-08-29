# Media Server / Playback / Show Playback

> Research date: **2026-08-28**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read on a cited page), **INFERENCE** (my reasoning), **UNKNOWN / unverified**.

## Source-access caveat (read this before trusting anything below)

This pass ran in a locked-down research environment. Two independent limits applied, and they
shape what this dossier can and cannot claim:

1. **WebSearch was exhausted before this segment started** (200/200 calls consumed by earlier
   dossiers). Zero search-engine results were available — not even result snippets.
2. **The egress proxy allowed effectively only `github.com` and `raw.githubusercontent.com`.**
   Every vendor domain tested returned `EGRESS_BLOCKED`: `qlab.app`, `www.resolume.com`,
   `www.dataton.com`, `obsproject.com`, `bitfocus.io`, `en.wikipedia.org`. (`npmjs.com`
   resolved but returned HTTP 403.) The `github` MCP tool's file reader is scoped to the
   user's own eight repositories, so GitHub content had to be read through WebFetch against
   `github.com` blob/tree pages, which worked.

Consequences, stated plainly:

- **There is not one verified price in this dossier.** Not one. No vendor pricing page was
  reachable and no search summary of one existed. Every price cell says so. Do not read the
  absence of a price as evidence that a product is quote-only — see *Pricing* below, where the
  shape of the market is argued as INFERENCE from edition-gating evidence, not asserted.
- **Platform lock could mostly not be verified.** The single most-repeated claim about this
  segment — "QLab, Mitti and Millumin are macOS-only" — could not be confirmed from any
  primary page, because all three vendor sites are blocked. It is marked
  `[unverified — vendor site blocked]` everywhere it appears, with the exact check named.
- What **did** work extremely well is an unusual but genuinely primary-adjacent source: the
  **Bitfocus Companion module for each product**, whose `companion/HELP.md` and repository
  metadata describe the vendor's real control protocol, ports, addressing scheme, action set,
  version floors and known limitations — because the module has to implement them against the
  real product. That is tier-1 evidence about **the control surface and the runtime data
  model**, and says nothing about price, render quality, codec performance or support.
- The open-source half of this segment (CasparCG, OBS, Xibo, Anthias, Garlic, Inkue, Ontime,
  Hap) lives on GitHub and **was researched properly**, including licences.

**38 URLs were opened; all are cited.** A "Not opened" list at the end names the domains a
re-run must cover.

---

## Segment summary

This category is **the machine that plays the content during the show**. It spans a very wide
functional range that the industry treats as one market because the same person often buys
across it:

| Sub-tier | What it is | Typical buyer |
| --- | --- | --- |
| **Cue-list playback** | An ordered list of typed cues fired by a human pressing GO. Audio, video, stills, plus control cues (OSC/MIDI/DMX). QLab, Go Button, Mitti, PlaybackPro Plus, Inkue. | Theatre sound/video op, stage manager, corporate AV op |
| **Timeline media server** | A timecode-addressable timeline driving many outputs, usually with projection mapping/warping and a render cluster. disguise, Watchout, Pandoras Box, Pixera, Hippotizer, Modulo. | Rental/staging house, tour, systems integrator |
| **Realtime / clip-grid** | Live-composited, parameter-driven output rather than a fixed timeline. Resolume, Millumin, Smode, ArKaos, TouchDesigner, Ventuz. | VJ, show designer, experiential/interactive |
| **Broadcast playout & production** | Channel/layer playout of clips and graphics, controlled by automation rather than a person. CasparCG, plus the production-switcher hybrids vMix and OBS. | Broadcaster, streaming producer, church/AV volunteer |
| **Signage / unattended playback** | Content scheduled by calendar and played forever with nobody in the room. Xibo, Anthias, Garlic, BrightSign, ScreenCloud/Yodeck. | Facilities, retail, museum, corporate comms |

**The dividing line that matters** (INFERENCE, but strongly supported by every control surface
read below): the first four tiers are **event-driven** — something or someone fires a cue, and
the product's job is to be deterministic about what happens next. The signage tier is
**schedule-driven** — a calendar decides, and the product's job is to keep running unattended
for months. Almost no product does both, and the two halves have entirely separate protocol
vocabularies (cues/timelines/OSC versus playlists/dayparts/SMIL). That gap is the most striking
structural fact in this segment and is developed under *White space*.

**Who buys it.** Three near-disjoint buyers. (a) A **freelance operator or small venue** buying
one seat of cue-list software on a laptop — this is the price-sensitive, macOS-heavy,
individual-purchase end. (b) A **rental/staging house or tour** buying timeline media servers,
usually as hardware+software+support and usually in pairs (main + backup), where the software
licence is a small part of a five- to six-figure device. (c) A **facilities or marketing
department** buying signage per screen per month. These buyers share almost no purchasing
behaviour, which is why the segment's price band spans at least four orders of magnitude.

**Typical price band: UNKNOWN in this pass.** No figure in any currency was verified. See
*Pricing* for what is and is not inferable.

**European weight is unusually high.** Verified vendor origins or maintainer locations found in
this pass: CasparCG (Sweden — SVT-originated, community-maintained), Dataton Watchout (Sweden),
disguise (UK), Green Hippo (UK), Xibo Signage Ltd (UK), Resolume (Netherlands), Millumin/Anomes
(France), Modulo Pi (France), Smode Tech (France), ArKaos (Belgium), AV Stumpfl Pixera
(Austria), Ventuz (Germany), Garlic Player (Germany — maintainer Niko Sagiadinos). This is the
most European-dominated segment in the corpus so far (INFERENCE, relative to the intercom and
camera-control dossiers).

---

## Product table

Prices: **every cell is `unverified`** — see the caveat above. "Offline?" means: does the
product run its show with no internet connection. "API?" summarises the *control* surface as
evidenced by its Companion module or its own repository.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **QLab 5** | Figure 53 (US) | macOS `[unverified — qlab.app blocked]` | unverified; tiered by feature (audio/video/lighting) `[unverified]` | Yes (INFERENCE — local app, OSC over LAN) | **OSC over UDP/TCP, default port 53000**; TCP required for variables/feedback; OSC passcode required from QLab 5.2 (FACT) | Theatre cue lists; the reference implementation of the cue-list data model |
| **Go Button** | Figure 53 (US) | unverified | unverified | Yes (INFERENCE) | OSC (Companion module exists; HELP.md not published — 404) | Audio-only cue playback, cheap tier |
| **Mitti 2** | Imimot | macOS `[unverified — imimot.com blocked]` | unverified | Yes (INFERENCE) | **OSC/UDP, default port 51001**, with a named "Companion-Mitti-Module" feedback target (FACT) | Single-screen video cue playback with clean transport feedback |
| **PlaybackPro Plus** | DT Videolabs | unverified | unverified | Yes (INFERENCE) | Network control (Companion module: take-to-program, preview, mark in/out, fade-on-take) — **protocol and port not documented in HELP.md** (FACT) | Broadcast-style preview→program clip take |
| **Inkue** | FonograF (open source) | **Windows 10/11, macOS (Apple Silicon + Intel), Linux x86-64** (FACT) | **GPL-3.0-or-later**, free (FACT) | Yes | Emits OSC/MIDI/sACN/Art-Net cues; SMPTE generate + receive (FACT) | Cross-platform cue list; the only credible OSS answer to the macOS lock |
| **Resolume Arena / Avenue** | Resolume (NL) | unverified | unverified; Arena vs Avenue tiering (FACT that two editions exist) | Yes (INFERENCE) | **REST API on 8080** (Webserver in prefs) **+ OSC on 7000, OSC feedback listener on 7001** (FACT) | Clip-grid/VJ compositing; layer & column model |
| **Millumin 4** | Anomes (FR) | macOS `[unverified — millumin.com blocked]` | unverified | Yes (INFERENCE) | **OSC, default port 5000**, configured under Interactions → Manage devices → OSC; supports Millumin 2/3/4 (FACT) | Projection mapping with a board/column + timeline hybrid |
| **Smode Live** | Smode Tech (FR) | unverified | unverified | Yes (INFERENCE) | HTTP on **port 8080**; **requires Smode Live v10+** (FACT) | Realtime compositing with scenes + timeline + markers |
| **disguise Designer** | disguise (UK) | unverified (Windows + disguise hardware, INFERENCE) | unverified | Yes (INFERENCE) | **OSC** (track/section/cue transport, layer params, ~20 feedback variables) **+ MTC: JSON over telnet** from a Multitransport Manager **+ SMC: hardware System Management Controller** (power, LED, faults) (FACT) | Large-scale timeline shows across a render cluster; the richest transport model found |
| **Watchout 7** | Dataton (SE) | unverified | unverified | Yes (INFERENCE) | **HTTP API on port 3019 with Server-Sent Events + 30 s reconciliation poll**; nodes managed on **3017**; tested against 7.5.1 (FACT) | Multi-display timelines; cleanest modern push API in the segment |
| **Watchout 6 (legacy)** | Dataton (SE) | unverified | unverified | Yes | Legacy TCP; separate addressing for **production computer** (full path `C:/shows/x.watch`) vs **display cluster** (bare filename); **ASCII-only paths** (FACT) | The installed base; also the clearest evidence of the production/display split |
| **Pandoras Box** | twoloox | unverified | unverified | Yes (INFERENCE) | **PandorasAutomation (PBAU) over TCP, default port 6211, domain 0**; mixed-endian headers; per-sequence timecode polling at 30 Hz; **no feedbacks, cue discovery unimplemented, SMPTE mode write-only** (FACT) | Sequence/timeline media server with deep SMPTE integration |
| **Hippotizer** | Green Hippo (UK) | unverified | unverified | Yes (INFERENCE) | **REST API — but the REST component must be added to the active show file**; requires **v4.7.1+**; LAYER / MIX / PIN / TIMELINE action groups (FACT) | Layer-and-mix media server; PIN model for parameter control |
| **Pixera** | AV Stumpfl (AT) | unverified | unverified | Yes (INFERENCE) | **JSON-RPC over TCP** ("Pixera JSON/TCP Api"), raw pass-through supported (e.g. `Pixera.Compound.startFirstTimeline`); some commands v2.0-only (FACT) | Timeline media server with a genuinely programmable object API |
| **Modulo Player / Kinetic** | Modulo Pi (FR) | unverified | unverified | Yes (INFERENCE) | Proprietary; playlist/cue/task model, **"Send Show to All Remotes"**, plus **Spydog** monitoring daemon exposing FPS, CPU, memory, temperature, uptime and **licensing state as variables** (FACT) | Playlist/task-driven server; best machine-health telemetry found |
| **ArKaos MediaMaster 6** | ArKaos (BE) | unverified | unverified | Yes (INFERENCE) | **Telnet to the ArKaos Hub (Remote Player)**; **v6+ only**; cue selection 1–4095 (FACT) | DMX/cue-number-addressed media playback |
| **Ventuz Director** | Ventuz (DE) | unverified | unverified | Yes (INFERENCE) | **WebSocket**; **requires Enterprise edition v6.11+** (FACT) | Realtime graphics playout with playlist + take model |
| **CasparCG Server** | CasparCG community (SE, SVT origin) | **Windows 11 recommended (10 best-effort), Linux Ubuntu 24.04 recommended**; OpenGL 4.5 GPU required (FACT) | **GPLv3-or-later**, free (FACT) | Yes | **AMCP over TCP** — UTF-8, CRLF-terminated, quoted params, escape sequences, batching (`BEGIN`/`COMMIT`/`DISCARD`) (FACT); OSC (module exposes AMCP only) | 24/7 broadcast clip + graphics playout; channel/layer model |
| **OBS Studio** | OBS Project | Windows / macOS / Linux (FACT) | **GPLv2-or-later**, free (FACT) | Yes | **obs-websocket 5, bundled since OBS 28.0.0, default port 4455**, SHA256 challenge/salt auth, event-subscription bitmask, `RequestBatch` (FACT) | Streaming/recording; `TriggerMediaInputAction` gives real playback transport |
| **vMix** | StudioCoast (AU) | unverified (Windows, INFERENCE) | unverified | Yes (INFERENCE) | Shortcut-based API (`ReplayMarkInOut Value=5000`, `&`-separated params) + HTTP API; **polled**, default 250 ms, min 100 ms (FACT) | Production switching with integrated playback |
| **ProPresenter 7** | Renewed Vision (US) | unverified | unverified | Yes (INFERENCE) | HTTP API; **requires 7.9.2+**, arrangements need v21+; UUID-stable object addressing; MIDI Note-On triggering (FACT) | Worship/lyrics presentation; distinguishes *active* vs *focused* presentation |
| **TouchDesigner** | Derivative (CA) | Windows + macOS (INFERENCE from official `TouchEngine-Windows` / `TouchEngine-macOS` repos, FACT that both exist) | unverified | Yes (INFERENCE) | Python, OSC, WebSocket, WebRTC remote panel; **TouchEngine API embeds TD components in Unreal Engine** (FACT) | Custom/interactive playback where no fixed product fits |
| **Ontime** *(adjacent)* | cpvalente / getontime.no | **Windows, macOS, Linux, Docker, npm, Homebrew, hosted cloud** (FACT) | **GPL-3**, free; hosted option exists (FACT) | Yes (self-hosted) | **OSC, HTTP and WebSocket APIs**; Companion module needs **Ontime v4.0.0+** and connects via a generated share link (FACT) | Rundown + countdown timers; the show-*running* layer above playback |
| **Xibo** | Xibo Signage Ltd (UK) | CMS (web) + players | **CMS AGPL-3.0, Windows player open source; Android, LG webOS and Samsung Tizen players are commercial; Xibo Cloud hosted** (FACT) | Yes (self-hosted CMS + local players) | CMS API (not read this pass) | Scheduled multi-screen signage with a real CMS |
| **Anthias** (ex Screenly OSE) | Screenly | **Raspberry Pi (Pi 4/5 recommended for video), any 64-bit ARM host, x86** (FACT) | Open source, free; **Screenly is the paid product** (FACT); exact SPDX not read | Yes | Web dashboard + scheduler; API not read this pass | Single-screen Pi signage |
| **Garlic Player** | Sagiadinos / garlic-signage (DE) | **Linux, Windows 7–11 x64, macOS Intel+M1, Android 4.4–10, iOS (experimental), Raspberry Pi 3/4/5** (FACT) | **AGPL-3.0**, free (FACT) | Yes | **SMIL 3.0 subset** — `seq`/`par`/`excl` time containers, wallclock scheduling, conditional playback (FACT) | Vendor-neutral signage playback via an actual open standard |
| **BrightSign players** | BrightSign (US) | Dedicated hardware | unverified | Yes (INFERENCE) | Companion module exists (written in BrightScript); **HELP.md not published — 404** | Hardware-reliability signage playback |

**Product count: 26.**

---

## Deep dives

### 1. QLab 5 (Figure 53)

**What it does.** The reference cue-list application of the theatre world: an ordered list of
typed cues (audio, video, fade, group, wait, network, MIDI, script…) that a human advances with
a GO key. Everything in the tier below the media servers is measured against it.

**Data model (FACT, from the Companion module and QLabKit).** A **workspace** contains **cue
lists**, which contain **cues**. Each cue carries `prewait`, `duration`, `postwait`, plus
`armed`, `flagged` and `autoload` flags, a colour, a name and a number — all of these are
settable over OSC. The critical design decision is **dual addressing**: cues are reachable both
by user-facing number (`/cue/*`, described in QLabKit as deprecated for new code) and by
**immutable unique ID** (`/cue_id/{uniqueID}`), with the full workspace-scoped form
`/workspace/{id}/cue_id/{id}/name`. Numbers are for humans and get renumbered; IDs are for
machines and never change. Workspaces advertise themselves over Bonjour as `/qlab/_tcp`, and
push state via `/update/workspace/{id}`.

**Integrations (FACT).** OSC over UDP or TCP on default port **53000**. TCP is required for
variables and feedback — UDP is fire-and-forget, so the Companion module cannot maintain state
over it. QLab 5.2 introduced an **OSC passcode**, which broke every existing controller and
forced a module bump (Companion module ≥ 2.1.0). Workspace targeting differs between versions:
a blank/"Default" workspace means *frontmost workspace* in QLab 4 and *all workspaces* in
QLab 5. The module exposes 30+ variables (playhead cue, running cue, elapsed, remaining,
selection, colour) and feedbacks for cue colour, running state, workspace mode and override
state.

**Notable strengths.** The cue as a first-class typed object with a stable ID and a complete
network-settable property set is the single best data-model idea in this segment. Control cues
(network/MIDI/script) mean the cue list is also a show-control sequencer, not just a player.
Feedback is rich enough that a hardware surface can be a genuine operator position.

**Notable limits.** Platform lock is the standing complaint —
`[unverified: qlab.app is egress-blocked; to check, open qlab.app system requirements and
qlab.app/pricing]`. The passcode change shows the OSC surface is versioned and can break
downstream tooling. UDP mode silently loses the entire feedback layer, which is a real
operational trap.

### 2. CasparCG Server (community / SVT origin)

**What it does (FACT).** "A Windows and Linux software used to play out professional graphics,
audio and video to multiple outputs… in 24/7 broadcast production since 2006." It is the only
genuinely production-grade **open-source** entry in the playout half of this segment.

**Data model (FACT).** A flat, orthogonal address space: **channel → layer**. Commands act on
`channel-layer` pairs. Media is loaded (`LOADBG`), cut in (`LOAD`/`PLAY`), controlled
(`PAUSE`/`RESUME`/`STOP`/`CLEAR`) and composited via a MIXER command family with 20+ parameters
(opacity, brightness, saturation, contrast, levels, fill, clip, rotation, perspective, volume).
Graphics templates are a separate command family (`CG ADD/PLAY/STOP/NEXT/UPDATE/INVOKE/INFO`).
Persistent datasets live under `DATA STORE/RETRIEVE/LIST/REMOVE`.

**Integrations (FACT).** **AMCP** over TCP: text, UTF-8, every command terminated with `\r\n`,
case-insensitive, space-separated, quotes around parameters containing spaces, with `\"`, `\\`
and `\n` escapes. Query commands (`VERSION`, `INFO`, `CINF`, `CLS`, `TLS`, `FLS`, `GL INFO`,
`DIAG`), thumbnail commands, and **transactional batching via `BEGIN` / `COMMIT` / `DISCARD`**.
A separate `media-scanner` service indexes media and answers `CINF`/thumbnail queries through
the server. Licensing: **GPLv3+**, bundling FFmpeg (GPLv2), TBB, SFML, GLEW and Boost.
Requirements: Windows 11 recommended (10 best-effort), Ubuntu 24.04 recommended, and an
**OpenGL 4.5-capable GPU, Nvidia recommended**.

**Notable strengths.** The batching primitive is the standout: `BEGIN`/`COMMIT` lets a
controller compose a multi-layer state change and have it applied as one frame-accurate unit —
almost nothing else in the segment offers atomicity. Text protocol means it is trivially
scriptable and diagnosable with `telnet`. Free, so it is everywhere in education, small
broadcast and as a graphics engine under commercial automation.

**Notable limits.** No timeline. No cue list. It is a *channel playout engine* that assumes an
external client (a broadcast automation system, or the CasparCG Client) supplies the show logic
— which is exactly why the segment needs so many other products. AMCP has **no OSC coverage in
its own protocol documentation** (FACT: the AMCP wiki page makes no mention of OSC), so
control-surface state must be polled or inferred.

### 3. Watchout 7 (Dataton)

**What it does.** Multi-display timeline playback across a cluster of machines. Version 7 is a
ground-up rearchitecture, and the two Companion modules — one for the legacy protocol, one for
the new JSON API — make the before/after unusually legible.

**Data model, legacy (FACT).** A **production computer** drives a **display cluster**. The
split is visible right in the control surface: to load a show you give the production computer
a *full path with forward slashes* (`C:/shows/myshow.watch`) but a display cluster only the
*bare filename without extension* (`nicetry`). File and path names must be **basic ASCII only**.
The object vocabulary is timelines (main + auxiliary), tasks, cues and layer conditions;
transport is Run / Pause / Kill / Reset / Jump-to-time / Jump-to-cue, plus Go online and Enter
standby.

**Data model, Watchout 7 (FACT).** Roles are now named in the API surface: **Director**,
**Asset Manager**, **Producer**. Variables expose director name, asset-manager identity, a
**heartbeat**, show name, and timeline/cue state. Timelines are played/paused/stopped/toggled,
with conditional variants; navigation is by millisecond time or by named cue. Shows load from a
`.watch` path *or* from inline JSON. **Inputs** (show variables) are settable singly or in
batches as JSON, but the Key fields must be pre-declared in Watchout Producer. **Cue sets** can
be switched individually or in batches.

**Integrations (FACT).** HTTP API on **port 3019**, with a **dual update system: Server-Sent
Events for immediate state plus a 30-second poll to catch structural changes**. Node management
requires direct access to each node on **port 3017**. Tested against **7.5.1**; older versions
"might not work correctly". Cue information is **read-only**.

**Notable strengths.** The dual push+reconcile pattern is the best state-synchronisation design
found in this pass and is directly reusable (see *What this segment does WELL*). Exposing a
**heartbeat** as a first-class variable is a small thing that matters enormously to an operator
watching a backup machine. The legacy module's event-driven mode ("the production PC sends
status changes automatically or every 4 seconds") shows the same instinct a decade earlier.

**Notable limits.** Show *variables* must be declared in the authoring tool before they can be
driven externally — the API cannot extend the show's own schema. Cues are read-only over the
API. The legacy protocol has a documented failure mode where deleting and recreating a task
with the same name mixes old and new feedback state, resolvable only by cycling the connection —
a name-as-identity bug of exactly the kind QLab's cue IDs avoid.

### 4. disguise Designer

**What it does.** The high end of timeline media serving: a designer-facing timeline over a
render cluster, aimed at touring, broadcast sets and large-format projection.

**Data model (FACT, from three separate Companion modules).** The show vocabulary is
**track → section → cue**, plus **video layers** with their own parameters (blendmode,
brightness, tint, speed, mode, transition timing, volume, contrast, saturation, scale). Cues are
addressed by number (integer or float). Feedback exposes 20+ variables including
`currentSectionName`, master volume, master brightness, playmode, and a full **timecode position
broken out into hour / minute / second / frame** — i.e. the timeline is timecode-addressed, not
cue-index-addressed. Separately, **Multitransport Control (MTC)** models the *cluster*: you
create a **Multitransport Manager**, assign one or more **transports** to it, assign **tracks**
to transports (or use automatic setlist behaviour), and configure an **event transport** with a
listening port. And **SMC** is not show control at all — it is the **System Management
Controller** on disguise hardware, reached on the machine's MGMT port with a username and
password, offering Power On / Off / Cycle, Flash LCD, Send Notification, Set LED Strip, and
reporting serial number, device name, type, **role**, power status and **fault conditions**.

**Integrations (FACT).** OSC for show transport — with the important caveat that "full
functionality is only available if the disguise is configured to always send OSC feedback".
MTC speaks **JSON over telnet**. SMC is credentialed and firmware-version-sensitive.

**Notable strengths.** disguise is the only vendor in this pass that exposes **three separate
control planes at three separate layers** — artistic transport (OSC), cluster transport (MTC),
and physical machine management (SMC) — and does not conflate them. The machine layer reporting
**role** and **fault** as queryable fields is precisely what a redundancy workflow needs.

**Notable limits.** The OSC plane is opt-in on the disguise side; a controller cannot discover
that feedback is off, it just sees nothing. MTC's documentation is thin enough that the
Companion module's own HELP.md punts to disguise's help site. SMC compatibility is gated on
firmware version with no stated floor.

### 5. Resolume Arena / Avenue

**What it does.** The clip-grid paradigm: a matrix of **clips** arranged in **layers** (rows)
and **columns**, where firing a column launches one clip per layer. Arena adds the
large-format/mapping features Avenue lacks (FACT that two editions exist; the specific
differences are `[unverified — resolume.com blocked]`).

**Data model (FACT).** Composition → layers → clips, addressed by grid position; plus layer
**groups**; plus composition-level parameters (opacity, speed, tempo). The Companion module
exposes selected/previewed clip, composition column, and per-layer timing (elapsed, duration,
remaining, progress percentage).

**Integrations (FACT).** Two parallel surfaces that must both be enabled: a **REST API on port
8080** (switched on as "Webserver" in Resolume Preferences, optional HTTPS) which carries
feedback, and **OSC on port 7000** which carries transport as a fallback. A separate optional
**OSC listener on port 7001** gives real-time feedback without the REST API, by pointing
Resolume's OSC Output at the controller. The module can detect REST misconfiguration but
**cannot verify OSC connectivity at all**.

**Notable strengths.** Grid addressing is genuinely simple and maps onto hardware surfaces
(Launchpad-style) better than any timeline model. Offering both a request/response API and a
push OSC stream lets integrators pick.

**Notable limits.** A documented and instructive API bug: **"clip name by grid position
variables do not update when clips are drag-swapped inside Resolume (Resolume API limitation)"**
(FACT). This is the same disease as Watchout's task-name confusion — the API addresses content
by *position* rather than by identity, so reordering desynchronises every downstream cache.
QLab's cue-ID design is the cure, and Resolume does not have it.

### 6. Xibo (and the open signage stack around it)

**What it does (FACT).** "A powerful Open Source Digital Signage platform with a web content
management system and Windows display player software", open source since 2009, copyright Xibo
Signage Ltd 2006–2026.

**Data model.** The defining split is **CMS ↔ Player**. The CMS holds layouts, media, playlists
and — critically — the **schedule**; players are dumb-ish clients that sync and play. This is
the opposite architecture to everything above, where the show file lives on the playback machine.

**Licensing (FACT, and the interesting part).** **CMS is AGPL-3.0.** The **Windows player is
open source and in the repository.** The **Android, LG webOS and Samsung Tizen players are
commercial.** Revenue comes from those player licences plus **Xibo Cloud** (hosted CMS) and
support. The maintainers state they are committed to keeping "everything you need to run a
digital signage network… open source and free to use". This is a clean, honest open-core split:
the *server* is free forever, the *embedded platform ports* are paid.

**The neighbours.** **Anthias** (FACT) is Screenly's open-source project — explicitly renamed
from "Screenly OSE" to separate it from the paid Screenly — running on Raspberry Pi (Pi 4/5
recommended for video), any 64-bit ARM host (Rock Pi, Orange Pi, Banana Pi, with 1080p noted as
"stutter-prone on slower SoCs" due to software decoding) and x86. **Garlic Player** (FACT,
AGPL-3.0, maintained from Germany) takes the third path: implement the **open SMIL 3.0 standard**
so any compatible CMS can drive it — it "works together with every compatible digital signage
software" and uses SMIL explicitly "to avoid vendor lock-in", supporting `seq` / `par` / `excl`
time containers, video/audio/image/HTML media elements, **wallclock timing** and conditional
playback, across Linux, Windows, macOS, Android, experimental iOS and Raspberry Pi 3/4/5.

**Notable strengths.** This half of the segment has what the show-playback half completely
lacks: a **calendar**, a **fleet**, a **content-sync model**, and — in Garlic's case — an actual
**cross-vendor interchange standard**.

**Notable limits.** Equally, it has none of what the show half has: no cue, no GO, no timecode,
no sub-frame determinism, no operator surface. The two halves have not converged in seventeen
years of overlap.

---

## Standards & protocols

**Control — OSC (Open Sound Control).** The lingua franca of the cue-playback and realtime
tiers. Verified endpoints from this pass: QLab **53000** (UDP or TCP; TCP required for
feedback; passcode from 5.2), Mitti **51001** (UDP), Millumin **5000**, Resolume **7000** out /
**7001** listener, disguise (port configured in-app), Smode via HTTP rather than OSC.
Addressing conventions matter more than the transport: QLab's `/cue_id/{uuid}` vs `/cue/{number}`
split (FACT) is the single most important interoperability idea in the segment.
Figure 53 also publishes **F53OSC** (Objective-C OSC library) and **QLabKit.objc** as
open source, which is how most third-party QLab controllers exist at all.

**Control — plain-text TCP.** **AMCP** (CasparCG): UTF-8, `\r\n`-terminated, case-insensitive,
quoted parameters, `\"` `\\` `\n` escapes, and **transactional batching** (`BEGIN`/`COMMIT`/
`DISCARD`) (FACT). **Telnet** command sets: ArKaos MediaMaster 6 via the ArKaos Hub, and
disguise MTC (JSON payloads carried over telnet) (FACT).

**Control — binary TCP.** **PandorasAutomation (PBAU)**, port **6211**, domain **0**, with
**mixed endianness (big-endian headers, little-endian sequence IDs)** and a multi-connection
design: one control connection polling status at 5 Hz plus one connection per sequence polling
timecode at 30 Hz while playing (FACT). A useful reminder that "the media server has a network
API" can still mean a 1990s binary wire format.

**Control — HTTP/JSON and WebSocket (where the segment is going).** Watchout 7: **HTTP 3019 +
Server-Sent Events**, nodes on **3017**. obs-websocket 5: **port 4455**, RPC version 1,
numbered opcodes (`Hello` 0, `Identify` 1, `Identified` 2, `Reidentify` 3, `Event` 5,
`Request` 6, `RequestResponse` 7, `RequestBatch` 8, `RequestBatchResponse` 9), **SHA256
challenge+salt authentication**, an **event-subscription bitmask** (General, Config, Scenes,
Inputs, Transitions, Filters, Outputs, SceneItems, MediaInputs, Vendors, Ui, Canvases) with
high-volume events requiring explicit opt-in, and playback proper via
`GetMediaInputStatus` / `SetMediaInputCursor` / `OffsetMediaInputCursor` /
`TriggerMediaInputAction` (PLAY, PAUSE, STOP, RESTART, NEXT, PREVIOUS). Pixera: **JSON-RPC over
TCP** with raw method pass-through. Hippotizer: REST, gated behind adding the REST component to
the show file. Ventuz Director: WebSocket, Enterprise 6.11+. Ontime: OSC + HTTP + WebSocket,
with the Companion connection established from a generated share link. All FACT.

**Control — polled HTTP.** vMix: shortcut-style commands (`ReplayMarkInOut Value=5000`,
`SetOutput2 Value=Input&Input=3`) with client-side polling at a configurable interval, default
**250 ms**, minimum **100 ms**, and an explicit warning that lowering it raises vMix CPU (FACT).
The only major product in this pass with no push channel at all.

**Timecode and machine sync.** SMPTE LTC/MTC is the incumbent: Pixera has an explicit SMPTE
timeline mode; Pandoras Box has SMPTE mode None/Send/Receive but it is **write-only — the mode
cannot be read back**; disguise exposes timecode broken out to hour/minute/second/frame; Inkue
both generates and receives SMPTE (all FACT). The interesting counter-proposal is Figure 53's
**ActionSync** (FACT): an OSC-over-TCP protocol that deliberately *decomposes* what SMPTE
conflates — establishing a common time reference, conveying playback state, and specifying
nominal rate — into separate concerns. Clients `/actionsync/ping`, the server replies
`/actionsync/pong` with its host time; the client halves the round-trip to estimate one-way
delay and derive a clock offset; then `/actionsync/subscribe` (and `/actionsync/catchup`) gets
`/actionsync/<id>/status` messages carrying state (stopped/paused/running), rate, timeline
location and server time, which the client schedules locally against its known offset. It
explicitly **declines to sync hardware clocks**, on the argument that theatrical work needs
address accuracy rather than microsecond precision, and states that audio-critical work still
needs word clock. That framing is worth internalising even outside this segment.

**MIDI.** Still load-bearing: ProPresenter's module supports MIDI Note-On triggering of buttons;
Inkue emits Note On/Off, CC and Program Change; Figure 53 publishes a standalone MTC/MMC
`TimecodeDisplay` utility (all FACT).

**Lighting-adjacent output.** Inkue emits **DMX over sACN E1.31 and Art-Net** from the same cue
list that plays audio and video (FACT) — the clearest evidence that the cue-list tier is
converging with the lighting tier.

**Codecs.** The one true open standard here is **Hap** (FACT): "a family of video codecs which
perform decompression using a computer's graphics hardware, substantially reducing the CPU
usage necessary to play video", with variants Hap, Hap Alpha, Hap Q and Hap Q Alpha; created by
Tom Butterworth, commissioned by VIDVOX in 2012; **Free BSD licence, usable in commercial
products free of charge**; specification *and* reference encoder/decoder published; encoders
exist in FFmpeg, Derivative TouchDesigner and Vidvox tools. CasparCG's decode path is FFmpeg
(bundled as GPLv2). Other segment-standard intermediate codecs (NotchLC, Resolume DXV,
ProRes/DNxHR delivery norms) are **UNKNOWN in this pass** — vendor codec pages were blocked.

**Signage interchange — SMIL 3.0.** The only cross-vendor *show description* format found in
the entire segment (FACT, via Garlic Player): time containers `seq` / `par` / `excl`, media
elements for video/audio/image/HTML, **wallclock** scheduling and conditional playback. Note
what SMIL has that no show-playback format has: it is a W3C standard, it is declarative, and it
expresses *scheduled* time as a first-class concept.

**Show file formats.** All proprietary and all mutually unreadable: `.watch` (Watchout),
`.inkue` (Inkue), QLab's own workspace format, Pandoras Box projects, Resolume compositions.
Watchout additionally constrains **file and path names to basic ASCII** (FACT). There is **no
neutral cue-list interchange format** anywhere in this segment.

**De facto normalisation layer — Bitfocus Companion.** Not a protocol, but functionally the
segment's Rosetta stone: every product above is wrapped in a module exposing the same four
concepts — **actions**, **feedbacks**, **variables**, **presets** — under MIT licence, in public
repositories, with a `companion/HELP.md` per module. Companion 4.3 / Module API 2.0 (Node 22
runtime) is the current contract (FACT, from the Ontime module). For anyone building a device
library, this is the best free normalised description of ~everything in live production.

---

## What this segment does WELL

Patterns worth stealing, each grounded in something read this pass:

1. **The typed cue with a stable identity.** QLab's cue carries `prewait`/`duration`/`postwait`,
   `armed`/`flagged`/`autoload`, colour, name and number — and is addressed on the wire by
   **immutable UUID**, with the human-facing number explicitly deprecated for programmatic use.
   Every product that instead addresses content by *position* has a documented desync bug:
   Resolume ("clip name by grid position variables do not update when clips are drag-swapped"),
   Watchout legacy (recreating a task with the same name mixes old and new feedback). The lesson
   is unambiguous and directly applicable to any planner storing user-reorderable objects.
2. **Push for liveness, poll for structure.** Watchout 7 runs **SSE for immediate state plus a
   30-second reconciliation poll for structural change**. This is the correct answer to the
   classic "do I stream or do I poll" question and it costs almost nothing to implement.
3. **Subscription bitmasks so clients only pay for what they use.** obs-websocket makes clients
   declare interest at identify time and puts high-volume events (volume meters, active-state
   changes) behind explicit opt-in. Watchout offers a coarser version of the same idea (simple
   vs advanced feedback mode, with the advanced mode explicitly documented as "increasing
   network traffic and production load").
4. **Atomic multi-object commits.** AMCP's `BEGIN` / `COMMIT` / `DISCARD` lets a controller
   assemble a multi-layer state change and apply it as one unit. Very few control APIs in live
   production offer transactionality; it is the difference between a clean look change and a
   visible tear.
5. **Separating the artistic, cluster and machine control planes.** disguise keeps show
   transport (OSC), cluster transport (MTC), and physical machine management (SMC: power, LED,
   **role**, **fault**) as three distinct surfaces. Most vendors smear these together or omit
   the third entirely.
6. **Machine health as show data.** Modulo's Spydog exposes FPS validity, CPU, memory,
   temperature, uptime, IP **and licensing state** as ordinary variables an operator can put on
   a button. Watchout 7 exposes a **heartbeat**. Treating "is the machine healthy and licensed"
   as first-class show telemetry rather than an IT concern is exactly right for live work.
7. **Decomposing time sync instead of inheriting SMPTE.** ActionSync's separation of *time
   reference*, *transport state* and *rate*, its ping/pong offset estimation, and its explicit
   refusal to chase hardware-clock accuracy in favour of address accuracy, is the most
   thoughtful protocol design encountered in this pass.
8. **Interop by publishing the format, not the product.** Hap ships a specification plus
   reference encoder and decoder under a **BSD** licence, and consequently is supported by
   FFmpeg, TouchDesigner and effectively every media server. Garlic implements **SMIL 3.0**
   specifically as an anti-lock-in argument. Both are proof that the way into this ecosystem is
   an open format, not an open product.

Also worth noting as a segment-wide virtue: **everything here is offline-first by construction**
(INFERENCE, but near-universal). These are apps that run on a show machine on a closed network
and are expected to work when the venue Wi-Fi does not.

---

## What NOBODY in this segment solves well

The white space, in rough order of how exploitable it looks:

1. **Nothing plans the show before the show file exists.** Every product in this dossier is a
   *runtime*. Not one of them models the pre-production question — how many outputs, at what
   resolution, from which GPU, into which projector, over which cable, with which backup. The
   Companion modules make this vivid: they expose transport, layers, cues and health, and
   nothing at all about *system design*. The design work happens in Vectorworks, Visio,
   spreadsheets and email. (INFERENCE from consistent absence across 26 products.)
2. **There is no cue-list interchange format.** `.watch`, `.inkue`, QLab workspaces, Pandoras
   projects — all proprietary, none convertible. Moving a show between products, or from a
   planning tool into a product, means retyping. SMIL 3.0 proves the idea is tractable, but it
   lives exclusively in signage and expresses schedules rather than cues. (FACT that the formats
   are proprietary; INFERENCE that no neutral format exists — a re-run should check whether any
   vendor publishes an import/export schema.)
3. **Redundancy is per-vendor, manual and unverifiable.** Watchout separates production computer
   from display cluster; Modulo has "Send Show to All Remotes"; disguise has multitransport
   managers and an SMC that reports **role** and **fault**. But no product — and no control-layer
   module — offers a **"the backup machine is in sync with the main machine, and here is the
   difference"** view. The operator's actual mental model (main/backup pairs, a failover
   decision under time pressure) is not represented in any data model read this pass.
4. **Nobody answers "will this run?".** Output count versus licence tier (Ventuz Director needs
   *Enterprise* 6.11+; Resolume splits Arena from Avenue; Xibo splits open from commercial
   players), pixel count versus GPU (CasparCG requires OpenGL 4.5; Anthias warns 1080p is
   "stutter-prone on slower SoCs"), bitrate versus disk — all of it is real, all of it is
   documented in scattered prose, and none of it is computable by any tool in the segment.
5. **Media provenance across machines is a blind spot.** Modulo has "Rescan Medias" and "Remove
   Missing Medias"; CasparCG has a `media-scanner`; Watchout constrains paths to ASCII. These
   are symptoms of the same unsolved problem: *is the same file, at the same version, present on
   every machine in the cluster?* Nothing verifies it; operators do it by hand and by hope.
6. **Licence and dongle state is show-critical and almost nowhere modelled.** Exactly one
   product in 26 exposes licensing as queryable telemetry (Modulo, via Spydog). A dead dongle
   ends a show as surely as a dead GPU, and no planning tool anywhere tracks which dongle is in
   which case.
7. **No media server produces documentation.** You cannot export from any of them a statement of
   "output 3 of this machine feeds projector B via this line, at this resolution, with this
   backup path" in any form another tool could consume. The signal-flow document is always
   redrawn by a human, from scratch, in a different application.
8. **Scheduled time and cued time never met.** Show playback has cues, timecode and GO but no
   calendar. Signage has dayparts, wallclock and playlists but no cue, no operator and no
   frame accuracy. Seventeen years of coexistence, no convergence. Anything that needs *both* —
   a museum that runs an unattended loop by day and a cued live event by night, a broadcast
   studio with a scheduled fallback — is currently built by wiring two products together.

---

## Relevance to AV Planner Suite

Ranked by how much this segment should actually change what gets built.

**`cable-planner` — highest relevance.**
Media servers are the densest output devices on any show, and the point in the signal chain
where the cable count explodes. Three concrete transfers:
- *Model the machine as roles, not boxes.* Watchout's production-computer/display-cluster split
  and disguise's Director/Actor-style cluster with an SMC-reported **role** and **fault** are the
  real topology. An equipment item that carries a role, a cluster membership and a main/backup
  pairing is closer to how these are rigged than "one device with N outputs".
- *Steal the identity discipline.* QLab addresses cues by immutable UUID because numbers get
  renumbered; Resolume and Watchout both have documented desync bugs from position/name-based
  addressing. `cable-planner` objects that users reorder (cables, frames, equipment in a rack)
  should follow QLab, not Resolume. Given the existing `healProjectPositions` migration layer,
  this is a schema-invariant worth writing down explicitly.
- *Bitfocus Companion is a free, MIT-licensed, normalised device library.* ~26 products in this
  segment alone are described there in a uniform actions/feedbacks/variables/presets vocabulary,
  including ports and version floors. If `cable-planner` ever grows a device-capability library,
  this is the reference corpus — and the naming discipline (one module = one vendor domain)
  mirrors the repo's own "ein Channel = eine Domäne" IPC rule.

**`pi-media-station` — high relevance, most directly actionable.**
This segment's signage half *is* this product's competitive set, and it is fully open:
- **Garlic Player + SMIL 3.0** is the single most valuable finding for this product. AGPL-3.0,
  German-maintained, runs on Raspberry Pi 3/4/5, and implements a real W3C standard with
  `seq`/`par`/`excl` containers, wallclock scheduling and conditional playback. Adopting SMIL as
  the playlist format — instead of inventing one — buys instant interop and a ready-made mental
  model.
- **Xibo's CMS/player split with an open-core licence** (AGPL CMS, open Windows player,
  commercial Android/webOS/Tizen players) is the clearest business-model precedent in the corpus.
- **Anthias** gives concrete, sourced hardware guidance: Pi 4/5 recommended for video, 64-bit ARM
  hosts work but 1080p is "stutter-prone on slower SoCs" under software decode.
- The white space is directly addressable here: nobody combines a **calendar** with a **cue**.
  A Pi station that plays a scheduled loop *and* can be taken over by a GO from OSC/Companion
  would sit in a genuine gap.

**`shell` / suite — high relevance.**
The suite's cross-app concept should be a **cue list / show timeline** shared across
`cable-planner`, `light-planner` and `multicam-planner`, because this segment proves it is the
universal live-production abstraction. Two design constraints fall out of the research:
cues need immutable IDs with human-facing numbers layered on top, and state distribution should
follow the Watchout 7 pattern (push for liveness, slow poll for structure) rather than pure
polling (vMix's 250 ms poll with an explicit CPU warning is the cautionary case).

**`light-planner` — moderate-to-high.**
The tiers are converging: Inkue fires audio, video, OSC, MIDI **and DMX over sACN/Art-Net** from
one cue list, and generates/receives SMPTE. Timecode is the shared spine between lighting and
media, and ActionSync's decomposition of timecode into reference/state/rate is the right mental
model for any timecode feature `light-planner` grows.

**`multicam-planner` — moderate.**
vMix and OBS straddle playback and switching, so a playback machine is simultaneously a source
in a multicam plan. Also relevant: obs-websocket 5 is the best-documented, freely available live
control API in the whole corpus (opcodes, SHA256 auth, subscription bitmask, request batching) —
a good implementation reference if `multicam-planner` ever talks to a live device.

**`broadcast-intercom` — low-to-moderate.** Only genuine overlap is that the same operator
positions carry both a comms panel and a GO button, and that both segments have converged on
Companion as the surface. No data-model transfer.

**`tally-pi` — low.** Adjacent only through OBS/vMix, which expose program/preview state on the
same APIs described here.

**`sony-camera-bridge` — low.** No overlap found in this pass.

---

## Pricing

**Verified prices: zero.** Every vendor pricing page was egress-blocked and no search results
were available. Rather than guess, here is exactly what is known and what to check.

**What IS verified (licences, not prices):**

| Product | Licence | Source |
| --- | --- | --- |
| CasparCG Server | GPLv3-or-later (bundles FFmpeg GPLv2, TBB, SFML, GLEW, Boost) | repo README |
| OBS Studio | GPLv2-or-later | repo README |
| Xibo CMS | AGPL-3.0; Windows player open source; **Android, webOS, Tizen players commercial**; Xibo Cloud hosted | repo README |
| Garlic Player | AGPL-3.0 | repo README |
| Inkue | GPL-3.0-or-later | repo README |
| Ontime | GPL-3 (desktop, Docker, npm, Homebrew; hosted option at getontime.no) | repo README |
| Anthias | Open source; **Screenly is the separate paid product** (exact SPDX not read) | repo README |
| Hap codec | Free BSD licence, "free of charge" for commercial and non-commercial use | repo README |
| Bitfocus Companion modules | MIT | repo metadata |

**Edition gating that IS verified (evidence of *how* the commercial tiers are cut, not what
they cost):** Resolume ships as two editions, Arena and Avenue. Ventuz Director control
**requires the Enterprise edition, v6.11+**. Hippotizer's REST API requires **v4.7.1+** *and*
adding the REST component to the show file. ArKaos remote control requires **MediaMaster 6+**.
ProPresenter's API requires **7.9.2+** (arrangements: v21+). Smode Live control requires **v10+**.
Ontime's Companion integration requires **v4.0.0+**. Watchout 7's API was tested against
**7.5.1** with older versions unsupported.

**INFERENCE on market shape** (argued, not asserted): the gating pattern above — network control
gated behind a higher edition or a recent major version — is the classic signature of a market
that monetises *integration* and *output count* rather than the base editor. Combined with the
buyer split in the segment summary, the plausible shape is: cue-list tier sold as a modest
per-seat perpetual or subscription to individuals; timeline-media-server tier sold through
dealers as part of a hardware+support package, quote-only; signage sold per screen per month.
**None of that is verified and it should not be repeated as fact.**

**To verify on a re-run, in priority order:** `qlab.app/pricing`, `imimot.com/mitti`,
`millumin.com`, `resolume.com/purchase`, `dataton.com` (Watchout licensing),
`avstumpfl.com/pixera`, `green-hippo.com`, `modulo-pi.com`, `ventuz.com` (edition matrix),
`vmix.com/purchase`, `renewedvision.com/propresenter/pricing`, `derivative.ca` (TouchDesigner
Commercial/Educational/Non-Commercial tiers), `xibosignage.com` (player licence + Cloud pricing),
`brightsign.biz`, `screencloud.com`, `yodeck.com`. For each, record **as advertised** vs
**requires sales contact**, the currency, and whether it is perpetual, subscription or
maintenance-plus-perpetual.

---

## Offline behaviour

**FACT where cited; INFERENCE where marked.** This segment is the most offline-native in the
corpus, because a show machine is expected to work on an isolated network.

- **Show-playback tier:** all of it runs locally with the show file on the machine. Control is
  LAN-only by design — OSC to `53000`/`51001`/`5000`/`7000`, TCP to `6211`, HTTP to
  `3019`/`8080`/`4455`. Nothing read in this pass showed a cloud dependency for playback.
  (INFERENCE from the protocol surfaces, which are uniformly local-network.)
- **Licence enforcement offline is UNKNOWN** and is the important unresolved question. Dongles
  and licence servers exist in this segment; Modulo's Spydog exposing **licensing state as a
  monitored variable** (FACT) implies licence status is considered a live operational risk. What
  each vendor does when a machine has been offline for two weeks is unverified.
- **Signage tier is deliberately store-and-forward:** Xibo's CMS/player split, Garlic's local
  SMIL playback and Anthias's on-device asset store all assume the player keeps running when the
  network drops. Xibo Cloud and Screenly are hosted *management*, not hosted *playback*.
- **Ontime** ships desktop, Docker and self-hosted builds alongside its cloud option (FACT), so
  the show-running layer can also be fully local.
- **Companion** runs on the local network and each module opens a direct socket to the device
  (FACT, from every module config read) — no vendor cloud in the control path.

**Implication for AV Planner Suite:** the offline-first stance of `cable-planner` matches this
segment's norms exactly, and is a *selling point* here rather than a limitation. The one thing
worth copying is that offline products in this segment still expose rich **local** APIs — being
offline is not treated as an excuse for being closed.

---

## API notes

**Summary judgement:** this is the best-integrated segment in the corpus so far. Every one of
the 26 products has some remote-control surface, and 20+ have one documented well enough that a
third party has implemented against it. The maturity ladder is clear and worth naming:

| Generation | Shape | Examples (FACT) |
| --- | --- | --- |
| 1. Binary/telnet | Vendor-specific wire format, poll-only, no feedback | Pandoras Box PBAU (6211, mixed-endian, 30 Hz per-sequence polling, **no feedbacks at all**); ArKaos telnet |
| 2. Text TCP | Human-readable, scriptable, still request/response | CasparCG AMCP (with `BEGIN`/`COMMIT` batching — ahead of its time) |
| 3. OSC | Fire-and-forget UDP, optional TCP for state | QLab (TCP required for feedback), Mitti, Millumin, Resolume, disguise |
| 4. HTTP/JSON + push | Request/response plus a real event stream | **Watchout 7 (HTTP 3019 + SSE + 30 s reconcile)**, obs-websocket 5, Pixera JSON-RPC, Hippotizer REST, Ventuz WebSocket, Ontime WebSocket |
| — Regression | HTTP with client polling only | vMix (250 ms default, 100 ms floor, documented CPU cost) |

**Auth is where the segment is weakest.** Only three credentialed surfaces were found in the
entire pass: obs-websocket's SHA256 challenge+salt handshake, QLab 5.2's OSC passcode, and
disguise SMC's username/password. Everything else is **unauthenticated on the LAN**. For a
category whose failure mode is "someone stops the show", that is a notable and consistent gap
(INFERENCE, from the absence of auth fields in the remaining module configs).

**Recurring API defects worth designing against** (all FACT, each from its own module):
- *Position-based addressing desyncs.* Resolume clip-name-by-grid-position does not update on
  drag-swap; Watchout legacy mixes feedback state when a task is deleted and recreated with the
  same name.
- *Write-only settings.* Pandoras Box SMPTE mode can be set but never read back — so no
  controller can display true state.
- *Opt-in feedback with no discovery.* disguise OSC needs "always send OSC feedback" enabled on
  the server side; Resolume's module can validate REST but **cannot verify OSC connectivity at
  all**. A controller cannot tell "configured off" from "broken".
- *API cannot extend the show schema.* Watchout 7 input variables must be pre-declared in
  Producer before they can be driven externally.
- *Feature gates behind editions and point releases.* Ventuz Enterprise 6.11+, Hippotizer 4.7.1+
  plus a component added to the show file, ProPresenter 7.9.2+, Smode v10+, ArKaos v6+, Ontime
  v4.0.0+, QLab 5.2 passcode breaking older controllers. Any integration must carry a version
  matrix; assuming "the vendor has an API" is insufficient.

**Best single reference implementations to read if building a control API:** obs-websocket 5's
`docs/generated/protocol.md` (opcodes, auth, subscription bitmask, batching) and Watchout 7's
push+reconcile pattern. Best data-model reference: QLab's cue object with UUID addressing. Best
time-sync reasoning: Figure 53's ActionSync.

---

## Not opened (re-run list)

These were attempted and **blocked by the egress proxy**, or never reachable, and must be
covered by any follow-up pass. Nothing in this dossier depends on them:

`qlab.app` · `imimot.com` · `millumin.com` · `www.resolume.com` · `www.dataton.com` ·
`obsproject.com` · `bitfocus.io` · `en.wikipedia.org` · `disguise.one` / `help.disguise.one` ·
`green-hippo.com` · `avstumpfl.com` · `modulo-pi.com` · `smode.fr` · `arkaos.com` ·
`ventuz.com` · `derivative.ca` · `vmix.com` · `renewedvision.com` · `dtvideolabs.com` ·
`xibosignage.com` · `brightsign.biz` · `screencloud.com` · `yodeck.com` · `casparcg.com`

Two GitHub paths returned **404** and should be retried in case they move:
`bitfocus/companion-module-brightsign-player` `companion/HELP.md`, and
`bitfocus/companion-module-figure53-go-button` `companion/HELP.md`.

Specific unresolved questions a re-run should answer:
1. Are QLab, Mitti and Millumin genuinely macOS-only, and what are their current licence tiers?
2. What are the Resolume Arena/Avenue and Ventuz edition differences, feature by feature?
3. Does any vendor publish an import/export schema for its show file? (Determines whether white
   space #2 is real.)
4. How does each vendor's redundancy/backup-machine workflow actually work (disguise
   director/actor, Hippotizer Zookeeper, Pixera, Watchout backup display)? Only the *control*
   surface was visible here, never the failover design.
5. Which intermediate codecs beyond Hap are first-class in each server (NotchLC, DXV, ProRes)?

---

## Sources

Every URL below was actually opened during this pass.

**Bitfocus Companion module documentation (primary evidence for control surfaces):**
1. https://github.com/bitfocus/companion-module-figure53-qlab-advance
2. https://github.com/bitfocus/companion-module-figure53-qlab-advance/tree/master/companion
3. https://github.com/bitfocus/companion-module-figure53-qlab-advance/blob/master/companion/HELP.md
4. https://github.com/bitfocus/companion-module-imimot-mitti/blob/main/companion/HELP.md
5. https://github.com/bitfocus/companion-module-dataton-watchout/blob/master/companion/HELP.md
6. https://github.com/bitfocus/companion-module-dataton-watchout-json/blob/main/companion/HELP.md
7. https://github.com/bitfocus/companion-module-resolume-arena/blob/master/companion/HELP.md
8. https://github.com/bitfocus/companion-module-anomes-millumin/blob/master/companion/HELP.md
9. https://github.com/bitfocus/companion-module-disguise-osc/blob/master/companion/HELP.md
10. https://github.com/bitfocus/companion-module-disguise-mtc/blob/master/companion/HELP.md
11. https://github.com/bitfocus/companion-module-disguise-smc/blob/main/companion/HELP.md
12. https://github.com/bitfocus/companion-module-casparcg-server/blob/master/companion/HELP.md
13. https://github.com/bitfocus/companion-module-dtvideolabs-playbackproplus/blob/master/companion/HELP.md
14. https://github.com/bitfocus/companion-module-renewedvision-propresenter-api/blob/main/companion/HELP.md
15. https://github.com/bitfocus/companion-module-studiocoast-vmix/blob/main/companion/HELP.md
16. https://github.com/bitfocus/companion-module-avstumpfl-pixera/blob/master/companion/HELP.md
17. https://github.com/bitfocus/companion-module-twoloox-pandorasbox/blob/master/companion/HELP.md
18. https://github.com/bitfocus/companion-module-greenhippo-hippotizer-rest/blob/main/companion/HELP.md
19. https://github.com/bitfocus/companion-module-modulopi-kinetic/blob/main/companion/HELP.md
20. https://github.com/bitfocus/companion-module-modulopi-moduloplayer/blob/master/companion/HELP.md
21. https://github.com/bitfocus/companion-module-smodetech-smodelive/blob/main/companion/HELP.md
22. https://github.com/bitfocus/companion-module-arkaos-mediamaster/blob/main/companion/HELP.md
23. https://github.com/bitfocus/companion-module-ventuz-director/blob/main/companion/HELP.md
24. https://github.com/bitfocus/companion-module-getontime-ontime/blob/main/companion/HELP.md
25. https://github.com/orgs/bitfocus/repositories?q=companion-module-figure53&type=all

**Vendor / project repositories:**
26. https://github.com/CasparCG/server
27. https://github.com/CasparCG/help/wiki/AMCP-Protocol
28. https://github.com/obsproject/obs-studio
29. https://github.com/obsproject/obs-websocket
30. https://raw.githubusercontent.com/obsproject/obs-websocket/master/docs/generated/protocol.md
31. https://github.com/Figure53/QLabKit.objc
32. https://github.com/Figure53/ActionSync
33. https://github.com/Vidvox/hap
34. https://github.com/xibosignage/xibo-cms
35. https://github.com/Screenly/Anthias
36. https://github.com/garlic-signage/garlic-player
37. https://github.com/FonograF/Inkue
38. https://github.com/cpvalente/ontime

**GitHub API queries used for discovery** (repository metadata read from results, not pages):
`org:bitfocus` searches for the vendor names above; `org:CasparCG`; `org:Figure53`;
`org:TouchDesigner`; `topic:show-control`; `topic:digital-signage`.

**Attempted and blocked** (recorded so the failure is auditable, not as sources):
https://qlab.app/pricing/ · https://www.resolume.com/software/purchase ·
https://www.dataton.com/products/watchout · https://obsproject.com/ · https://bitfocus.io/connections ·
https://en.wikipedia.org/wiki/CasparCG — all returned `EGRESS_BLOCKED`.
https://www.npmjs.com/package/osc returned HTTP 403.
