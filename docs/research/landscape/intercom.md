# Intercom / Crew Communication

> Research date: **2026-08-28**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read on a cited page), **INFERENCE** (reasoning), **UNKNOWN / unverified**.

## Source-access caveat (read this before trusting anything below)

This pass was run in a locked-down research environment. Two independent limits applied:

1. **WebSearch was exhausted before this dossier started** (200/200 calls used by earlier
   segments). Zero searches were available. Unlike
   `landscape/event-rental-management.md`, this dossier therefore has **not even
   search-engine summaries** of vendor pages to fall back on.
2. **The egress proxy allowed only `github.com` and `raw.githubusercontent.com`.**
   Every intercom vendor domain tested returned `EGRESS_BLOCKED`: `riedel.net`,
   `clearcom.com`, `green-go.eu`, `unityintercom.com`. Wikipedia and `docs.github.com`
   were blocked too. Roughly 40 minutes in, GitHub's `/search` endpoint began returning
   `HTTP 429, Retry-After: 3600`, so repository discovery was completed via
   `/topics/<topic>` and `/orgs/bitfocus/repositories?q=` pages, which stayed reachable.

Consequences, stated plainly:

- **There is not one verified price in this dossier.** Not one. No vendor pricing page was
  reachable, and no search summary of one existed. Every price cell says so. Do not read the
  absence of a price as evidence that a product is quote-only — that inference is separately
  argued in *Pricing* below, and it is an inference, not a finding.
- **The commercial hardware majors (Riedel, Clear-Com, RTS, Pliant, Studio Technologies) could
  not be researched from their own documentation.** What is recorded about them here comes
  almost entirely from an unusual but genuinely primary-adjacent source: **the Bitfocus
  Companion module for each system**, whose `HELP.md` and source describe the vendor's real
  control protocol, ports, addressing scheme and action set, because the module has to
  implement it. That is tier-1 evidence about *the control surface* and says nothing about
  audio quality, RF behaviour, price or mobile app quality.
- Anything I know from training but could not open is marked
  **`[unverified — vendor site blocked]`** and states what would have to be checked. Where I
  was not confident enough to assert even that, the cell says **UNKNOWN**. No specification
  figure for Bolero, FreeSpeak, CrewCom or ADAM appears in this document, because none could
  be verified.
- A **"Not opened"** list at the end names the domains that would have to be re-run.

What *did* work well: the open-source and software-intercom half of this segment is on GitHub,
and it was researched properly. Sixteen URLs were opened; all are cited.

## Segment summary

Intercom is the **real-time coordination layer of a live production** — the director cueing a
camera, the stage manager holding a cast, the LD talking to the followspot, the engineer
talking to the truck. It is the one production system where a two-second failure is visible on
air, which is why the segment is unusually conservative, unusually expensive, and unusually
hardware-centric compared to every other segment in this corpus.

Functionally the category has been stable for decades and every product is some arrangement of
six primitives (**FACT** — all six appear in the control surfaces of Riedel RRCS, Green-GO OSC,
ProdLink, talktome and the user's own Broadcast-Intercom, cited below):

| Primitive | What it is |
| --- | --- |
| **Partyline / group** | A many-to-many talk group. Historically an analogue bus (Clear-Com/RTS two-wire), now a channel object. |
| **Point-to-point / direct call** | One-to-one, usually with a call/alert signal to get attention. |
| **Key / keyset** | The operator-facing abstraction: a labelled button bound to a destination, with talk, listen, latch and lock behaviour. |
| **Crosspoint** | The matrix cell: source port × destination port, with a level. The underlying data model of every matrix system. |
| **IFB / mix-minus** | Program audio to a person, minus their own voice, duckable by an interrupt. The thing that makes talent comms work. |
| **Program / listen feed** | Show audio distributed to everyone, at a per-user listen level. |

**Who buys it.** Broadcasters and OB/truck operators (matrix systems, six figures, tendered);
theatres, houses of worship, corporate AV and touring (Green-GO / FreeSpeak / CrewCom class,
capex, bought by a technical director); and — new, and the interesting part — **production
companies and freelancers buying software intercom per-show**, where the buyer is a producer or
a TD with a laptop, not a broadcast engineer. Those three buyers have almost nothing in common,
which is why the segment's price band spans four orders of magnitude.

**Typical price band: UNKNOWN in this pass.** See the caveat above. The *shape* of pricing is
partially inferable and discussed under *Pricing*, but no figure in any currency was verified,
so none is printed.

**Structural note (INFERENCE, well-supported):** the segment is splitting in two. The matrix
tier is consolidating around IP transport and REST/XML-RPC control of a fundamentally unchanged
crosspoint model, while a new **software-beltpack tier** — Unity Intercom, talktome, ProdLink
Comms, Spacecommz.io, VORTEX, Eyevinn Open Intercom — is being built directly on WebRTC with
phones as endpoints. The evidence for the second half is concrete: five of those six products
were discovered in this pass purely from their Bitfocus Companion modules, three of them
(talktome, Spacecommz.io, ProdLink) were not in the seed list at all, and the Companion module
registry is where they surface because Stream Deck control is the price of entry for a
production tool now.

## Product table

Legend for the evidence column of each row: **[opened]** = a URL for this product was fetched
and is cited; **[module]** = evidence comes from the vendor's Bitfocus Companion module, not
from the vendor; **[unverified]** = vendor site blocked, nothing citable obtained.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Artist** (+ Bolero wireless, SmartPanel) **[module]** | Riedel Communications (DE, Wuppertal) | Hardware matrix frames + panels + wireless beltpacks | **No price found — not verifiable in this pass** | Matrix is on-prem hardware; RRCS control is LAN. Module explicitly supports **offline address entry** via typed `<net>.<node>.<port>` + variables, while dropdowns are online-only | **Yes — RRCS (Riedel Router Control System), XML-RPC.** Conferences, crosspoints (+volume), IFB incl. mix-minus volume, keys (label/marker/lock/press), logic sources, ports (clone, gain, alias, label), GP I/O. Verified against **RRCS 8.6.1** | Large-scale matrix routing with a genuinely complete external control API — the richest control surface found in this pass |
| **Eclipse HX / Arcadia / Edge / LQ / Gen-IC** (+ Station-IC, Agent-IC) **[module]** | Clear-Com (US, HME) | Matrix frames, "Arcadia" central station, LQ IP interfaces, cloud (Gen-IC), desktop client (Station-IC), mobile (Agent-IC) | **No price found — not verifiable in this pass** | Eclipse-HX/LQ are on-prem; **Gen-IC is cloud by name and therefore WAN-dependent (INFERENCE)**. Station-IC's remote API is `127.0.0.1:16000` — local | **Yes, two distinct ones (FACT):** (a) **REST API on master stations "like the Arcadia and Edge"**, auth = device IP + admin password; (b) **Station-IC Remote API**, key-based, normally `127.0.0.1:16000`, exposes keysets, favourite keys, reply key, global mutes | Breadth of endpoint types — hardware panel, desktop client, mobile client and cloud all speak one system |
| **ADAM / OMNEO / Digital Partyline** | RTS (Bosch/Telex) | Hardware matrix + panels + partyline | **No price found** | **UNKNOWN** | **UNKNOWN.** Notable negative finding (FACT): searches of the Bitfocus org for `rts` and `telex` returned **zero** repositories, while Riedel has four modules and Clear-Com two | **UNKNOWN in this pass** — the one seed vendor about which nothing could be verified |
| **Green-GO** (5th gen) **[module]** | Green-GO / ELC (NL) | Wired PoE devices, wireless beltpacks (WBPX/WBPXSP), WAA antennas | **No price found** | **Yes — decentralised by design.** Control is direct device-IP over UDP on a LAN; no central server in the OSC path (FACT) | **Partial — OSC.** Namespace `/ggo/cmd/<cmd>` and `/ggo/state/…`. Requires firmware **≥ v5.0.3.0255** plus an `osc-remote.gg5t` script compiled and saved onto each device. **Hard cap of 6 channels; WAA antennas and WBPX(SP) beltpacks are explicitly unsupported over OSC** | Decentralised LAN-only partyline with no single point of failure and a very complete per-channel model (talk/listen/call/cue/level/isolate) |
| **Unity Intercom** **[module]** | Audivero | Server + Mac/Windows/iOS/Android clients | **No price found** | Server is self-hosted (INFERENCE from a separate server-side Companion module existing) | **Partial — UDP button API on port 20119.** Sends emulated Stream Deck key presses; **every request needs a matched `keydown` + `keyup` or the client latches** (FACT) | Software beltpacks on phones with a real server behind them; long-established in this tier |
| **Open Intercom** (`intercom-manager` + `intercom-frontend`) **[opened]** | Eyevinn Technology (SE) | Node.js/TypeScript server + web frontend; Docker | **Free — MIT licence** (FACT) | **Self-hostable via Docker (FACT).** Falls back to Google STUN if no ICE servers configured, so a truly air-gapped LAN needs explicit ICE config (FACT) | **Yes — REST, OpenAPI/Swagger at `/api/docs/`.** Source shows `api_productions`, `api_groups`, `api_whip`, `api_whep`, `api_ingests`, `api_share`, `api_re_auth` | The only credible fully-open-source broadcast-grade intercom; the reference architecture for this tier |
| **talktome** **[module]** | talktome (vendor UNKNOWN) | Server + clients; controlled over TCP with TLS option | **No price found** | Self-hosted server implied by host/port/TLS config (INFERENCE) | **Yes.** API-key **or** user-login auth; **scoped** — "the visible users and generated presets depend on the scope returned by the talktome server for that account" (FACT). Talk press/release/**lock-toggle**, per-target volume and mute, **tally send** | Per-user scoping and a reply model: presets are generated *per user*, with REPLY buttons and volume gauges |
| **ProdLink Comms** **[module]** | ProdLink | Server + Companion control; TCP, default port **3200** | **No price found** | Default host `localhost` — designed to run beside the operator (FACT) | **Yes — TCP.** Talk one channel or **all channels**, stop/leave, **listen-only toggle**, **mic latch**, **role presets that configure multiple channels at once**, **silence all** | Role presets and an explicit emergency "silence all"; the clearest talk-state colour model found (green talking / red others-or-emergency / teal listening / orange latched) |
| **Spacecommz.io** **[module]** | Spacecommz | Web-based | **No price found** | Web/cloud (INFERENCE from "web-based") | **Yes**, but **off by default** — Settings → toggle "API disabled" to enable (FACT) | Listen presets with an **audio meter showing when a channel has an active speaker** (added v1.1) |
| **VORTEX Intercom** **[opened]** | Daniele Cappello (IT — Solarys) | iPhone (beltpack), iPad (matrix panel), Mac (hub) | **No price found — closed TestFlight beta, not on sale** | **UNKNOWN.** LiveKit/WebRTC based | **UNKNOWN** (closed source) | **Up to 16 independent N-1 circuits** routed to separate channels of a multi-channel CoreAudio device such as Dante Virtual Soundcard; guest access by **signed, expiring QR/link invitation with no account** |
| **Mumble** (+ **talkkonnect**) **[opened]** | Mumble project / talkkonnect | Qt client + `mumble-server`; talkkonnect is headless Go for Raspberry Pi / Orange Pi | **Free — open source; talkkonnect MPL-2.0** (FACT) | **Yes — fully self-hosted LAN server** (FACT) | talkkonnect exposes **HTTP APIs, MQTT, GPS**, and **multicast RTP out to IP PA speakers and SIP phones** (FACT) | Cheapest credible PTT intercom; **GPIO hardware PTT buttons and LCD/OLED panels on an SBC**; whisper-to-person / shout-to-channel voice targets |
| **ODIN** **[opened]** | 4Players (DE) | SDK: Windows, Linux, macOS, Android, iOS; consoles on request | Managed cloud **or self-hosted open-source server**; "pricing referenced but not detailed" on the page opened | **Yes — self-hosted server option stated** (FACT) | **Yes — SDK.** Rooms/peers, `PeerJoined`/`PeerLeft`/`PeerChanged` | **Up to 64 audio channels per room with channel masks for selective routing** — the closest thing to a matrix in a game-voice SDK; Opus, 20 ms chunks, VAD/AEC/noise suppression/ML voice isolation |
| **CrewCom / SmartBoom** | Pliant Technologies (US) | Wireless beltpacks + radio packs | **No price found** | **UNKNOWN** | **UNKNOWN** — Bitfocus org search for `pliant` returned **zero** repositories (FACT) | **UNKNOWN in this pass** |
| **Model 5xx series / Dante intercom** | Studio Technologies (US) | Hardware beltpacks and interfaces, Dante-native | **No price found** | **UNKNOWN** | **UNKNOWN** — Bitfocus org search for `studio-technologies` returned **zero** repositories (FACT) | **UNKNOWN in this pass** |
| **Discord / Teams / Zoom** (ad-hoc intercom) | Various | Desktop + mobile | Free tiers to per-seat SaaS; **no figure verified** | **No — all WAN/cloud dependent** (INFERENCE, structural) | Discord has a public API/bot platform; none expose an intercom crosspoint model | Zero setup cost and everyone already has it; the actual competition for low-budget shows |
| **Broadcast Intercom** (own, for reference) **[opened]** | larszu | Node 20 + Express + `ws` server, React 19 web UI, browser beltpacks | Own project — MIT | **Yes — LAN-first, saved show configs on disk** | **Yes — REST + WebSocket + `POST /api/control/action`**, plus a first-party Companion module | Partyline + direct call + system channels + routing matrix + per-user 8-slot profiles, with browser beltpacks joined by QR invite |

**Product count: 16.**

## Deep dives

### Riedel Artist, via RRCS (the most complete control model in the segment)

*Evidence: `companion-module-riedel-rrcs` repo and its `HELP.md` — the vendor's own site was
blocked, so everything here describes the control surface a third-party module must implement.*

**What it does.** Artist is a hardware matrix intercom. RRCS — Riedel Router Control System —
is the external control layer, and it speaks **XML-RPC**. The module states compatibility with
**RRCS version 8.6.1** (FACT).

**Data model (FACT, read off the action list).** This is the single most useful artefact found
in this pass, because it is effectively a published schema of what a broadcast matrix considers
an object:

- **Port** — addressed as `<net>.<node>.<port>`. Operations: get all, clone, set I/O gain, set
  alias, set label. Ports are the atoms; everything else references them.
- **Crosspoint** — get all active, set, set volume. The matrix cell, with level. Note that
  *volume is a property of the crosspoint*, not of the source or destination — that is the
  detail most software imitations get wrong.
- **Conference** — get all, edit. Partylines are first-class objects, distinct from crosspoints.
- **IFB** — get all, **set mix-minus volume**. IFB is a distinct object type with its own level,
  not a crosspoint with a flag.
- **Key** — label & marker, lock, press. The panel button is itself addressable and
  externally settable, including its *label and marker* — meaning the UI text is server-side
  state, not client config.
- **Logic source / GP I/O** — get all sources, set source, set output. GPIO tied into the same
  address space, so intercom state can drive and be driven by external hardware.

**Notable strength — offline-capable addressing.** The `HELP.md` draws an explicit distinction
that no other product in this pass makes: **port dropdowns work online only, but typed
period-separated addresses work offline and accept Companion variables** (FACT). A show can
therefore be *programmed before the matrix exists*, and the addresses resolve at runtime. This
is exactly the "design now, bind later" property that a planning tool needs, and Riedel shipped
it in a control API.

**Notable limits (FACT, from the module's own caveats).** Volume control is incompatible with
Artist-1024 destinations. Port numbering is **0-based in RRCS and 1-based in the module**, a
classic off-by-one interop trap. Logic sources require RRCS to report them, so *that* part
cannot be configured offline. Functions that accept only `<node>.<port>` work solely within the
same net as RRCS, which means multi-net installations need address care.

**Separate module, separate scope:** `companion-module-riedel-smartpanel` targets the
**RSP-1232HL** panel over **WebSocket on port 80, firmware ≥ 2.0.0**, and exposes only
device/network administration — set IP/subnet/gateway/DHCP on the three interfaces (Config1,
Media1, Media2), reboot, read device name and firmware (FACT). The panel's *intercom* behaviour
is not controlled there; it comes from the matrix. Riedel also ships `mediornet` and
`medianetworks` modules (FACT, names only).

### Clear-Com: two APIs, two different philosophies

*Evidence: `companion-module-clearcom-rest` and `companion-module-clearcom-station-ic` HELP files.*

**Master-station REST (FACT).** The module says it works with "Clear-Com master stations that
have a REST API, **like the Arcadia and Edge**". Configuration is just **device IP + the
administrator password**, and the user picks which *endpoint types* to manage in order to trim
the action list. Two things follow. First, Clear-Com has moved control onto plain REST on the
box — a much lower integration barrier than XML-RPC. Second, **authentication is the admin
password**, i.e. control access and administrative access are the same credential; there is no
scoped API token in evidence. For a shared or rented system that is a real operational concern
(**INFERENCE**).

**Station-IC (FACT).** Station-IC is described as "a virtual intercom client for Windows and
MacOS that connects to Clear-Com's **Eclipse-HX, LQ, or Gen-IC** systems". It has its own
**Remote API**, key-authenticated, "normally accessed on local IP **127.0.0.1** and port
**16000**" — a *localhost* control channel, requiring module ≥ Station-IC 1.6. It exposes
**keysets, favourite keys, the reply key, and global mutes**, with variables for keyset labels,
volume levels and caller information.

**Why the pairing matters (INFERENCE).** These are two different integration philosophies in
one product family: the hardware station is controlled *over the network by address*, while the
softclient is controlled *on the same machine by API key*. Anyone integrating Clear-Com has to
implement both. The Station-IC model — a localhost API on a softclient that is itself a client
of the matrix — is the pattern most likely to be copied by software intercoms, because it needs
no server-side cooperation.

**Not verified:** Agent-IC (mobile) has no Companion module and its site was blocked; nothing
about the mobile app is recorded here. Gen-IC is named as a cloud system by the Station-IC
module, which makes it WAN-dependent by construction, but its offline behaviour is **UNKNOWN**.

### Green-GO: decentralised, and honest about its limits

*Evidence: `companion-module-greengo-intercom` `HELP.md` and `osc.js`.*

**What it does.** Green-GO is the reference for **decentralised** partyline: control is
addressed to a **device's own IP** over **UDP/OSC**, with no central server in the path (FACT —
the module config is literally "Device IP" + "Control Port"). That architecture is the reason
the user's own Broadcast-Intercom names Green-GO as its model.

**Per-channel model (FACT, the full action list).** Set Channel Talk, Send Channel Call, Send
Channel Cue, Set Channel Listen, Set Channel Level, Set PGM Level, Set Main Level, Set Input
Gain, Set Input Source, Set Isolate State, Identify Device. Feedbacks mirror each of those plus
**Check Channel State** and an **Online Heartbeat updated every 5 seconds**.

That list is worth reading closely, because it separates four levels that lesser systems merge
into one "volume": **per-channel level**, **PGM (program) level**, **main level**, and **input
gain**. Plus **Isolate** as an explicit state, and **Cue** as distinct from **Call**.

**OSC namespace (FACT, from `osc.js`).** Outgoing commands are `/ggo/cmd/<cmd>`; incoming state
is `/ggo/state/…`, with `/ggo/state/heartbeat` and `/ggo/state/updated` as named paths. The
module treats any path containing `level` or `gain` as a **"flooding" message requiring
throttled updates**, and if no heartbeat arrives within 5 seconds it re-requests full state via
`/ggo/cmd/update`. That is a clean, copyable resync pattern: continuous heartbeat, coarse
timeout, full-state re-fetch rather than incremental repair.

**Notable limits, and they are severe (FACT, stated in the vendor-facing help).**

- **Maximum of 6 channels** controllable over OSC (channels 1–6).
- **WAA antennas and WBPX(SP) beltpacks are not supported** over OSC at all — i.e. the entire
  *wireless* half of the product line is outside the control API.
- Requires firmware **≥ v5.0.3.0255** *and* an `osc-remote.gg5t` script that must be
  **compiled into binary format and saved onto each device** before any of this works.

**INFERENCE:** OSC control here is a bolt-on to a wired device, not a system-level API. There is
no evidence of a central Green-GO API that describes the whole network, which means an external
planning tool cannot ask a Green-GO system "what does this show look like" — it can only poke
individual boxes.

### Eyevinn Open Intercom: the open-source reference architecture

*Evidence: `Eyevinn/intercom-manager` (repo page and `/tree/main/src`), `Eyevinn/intercom-frontend`,
`finos/SymphonyMediaBridge`.*

**What it does.** A **MIT-licensed** (FACT), self-hostable, browser-based intercom for broadcast
and media production, split into `intercom-manager` (Node.js/TypeScript backend, default port
**8000**) and `intercom-frontend` (Vite + TypeScript web client, Node v20, Docker, tested with
Vitest and Playwright). The frontend describes the system as "a low latency, web based, open
source, high quality, voice-over-ip intercom solution" (FACT).

**Data model (FACT, from the source file listing).** The API surface is
`api_productions` + `api_productions_core_functions` + `production_manager`, `api_groups`,
`api_ingests` + `ingest_manager`, `api_share`, `api_re_auth`, `api_validation`, over
`connection` / `connection_queue`, with `db/` (MongoDB **or** CouchDB) and `sfu/`. The top-level
object is a **Production**; participants join **lines** within it. The user's own project maps
this correctly: Production → Config, Line → Channel/Group, Preset → UserProfile.

**Media path (FACT).** Audio is **not** peer-to-peer. It goes through **Symphony Media Bridge**
(FINOS, **Apache-2.0**), which is "an SFU at its core, but has some hybrid MCU like solutions" —
critically, **participants can request mixed, transcoded audio instead of forwarded streams**.
That hybrid is the right answer for intercom specifically: a beltpack wants *one* mixed
partyline stream, not N forwarded streams it must mix on a phone. Ingest and egress use
**WHIP and WHEP** (FACT — `api_whip.ts`, `api_whep.ts`), which is a notable standards choice:
plain HTTP signalling instead of a bespoke WebSocket handshake.

**Notable strengths.** Genuinely open, genuinely documented (**OpenAPI/Swagger at
`/api/docs/`**), token-authenticated WHIP/WHEP, deployable by Docker or Terraform, and actively
developed (58 open issues, 13 open PRs at the time of reading).

**Notable limits.** SMB's release platform is **Ubuntu Server 20.04 LTS** (FACT) — a constraint
for anyone hoping to run the whole stack on an ARM SBC. The manager **falls back to Google's
STUN server** when no ICE servers are configured (FACT), so an air-gapped venue deployment must
configure ICE explicitly or connection setup will reach for the internet. And the stack is
three moving parts (manager + SMB + database) before a single person can talk, which is heavy
next to Green-GO's "power up two boxes on a switch".

### The software-beltpack cohort: Unity, talktome, ProdLink, Spacecommz, VORTEX

*Evidence: each product's Companion module `HELP.md`; VORTEX's GitHub project page.*

These five are the live edge of the segment and are best read together, because each solves one
piece of the same problem well.

- **Unity Intercom (Audivero)** is the incumbent. Its client API is **UDP port 20119** and works
  by **emulating Stream Deck button presses** — the module even asks which surface to emulate
  (XL, +, Plus XL), with a default 50 ms press-hold. The documented gotcha is sharp: **"every
  API request requires both a `keydown` and a `keyup` command to be sent, or the Unity client
  will stay in a latched state"** (FACT). A separate server-side module exists but was last
  updated **14 September 2023** (FACT), against the client module's active maintenance —
  **INFERENCE:** integration effort has moved to the client.
- **talktome** has the best **authorisation** model seen: API key *or* user login, and in user-login
  mode **"the visible users and generated presets depend on the scope returned by the talktome
  server for that account"** (FACT). Presets are generated **per user**, including a **REPLY**
  button whose target is exposed as a per-user `reply source` variable. It also **sends tally**.
- **ProdLink Comms** has the best **operational** model: talk to one channel or **all** channels,
  **listen-only**, **mic latch**, **role presets that set several channels at once**, and
  **silence all** as an explicit emergency action — with a talk-state colour scheme (green
  talking, red others-talking-or-emergency, teal listening, orange latched) that is worth
  copying verbatim. TCP, default port **3200**.
- **Spacecommz.io** contributes one good idea: **an audio meter on listen presets showing when a
  channel has an active speaker** (v1.1). Its API ships **disabled by default** and must be
  toggled on in Settings (FACT).
- **VORTEX Intercom** is the most ambitious and the least available: **closed TestFlight beta,
  source not public** (FACT). It models itself explicitly on a **broadcast crosspoint matrix**
  over **LiveKit/WebRTC**, with iPhone as beltpack, iPad as matrix panel, Mac as hub. Two
  features stand out: **up to 16 independent N-1 circuits**, each routable to a separate channel
  of a multi-channel CoreAudio interface **such as Dante Virtual Soundcard** — i.e. the software
  intercom hands proper mix-minus feeds back to the audio plant — and **signed, expiring
  invitations by QR code or link, with guests needing no account**.

## Standards & protocols

**Audio transport (verified via `bondagit/aes67-linux-daemon`, `Mo-way/awesome-aoip`, `github.com/topics/aes67`).**

| Standard | Status in this segment |
| --- | --- |
| **AES67** | The interoperability floor for audio-over-IP. The Linux daemon implements up to **64 multicast/unicast sources and sinks**, **44.1–384 kHz** (48 kHz default), and **end-to-end latency from approximately 6 ms upward**, tunable via `tic_frame_size_at_1fs` and RTP frame size (FACT). That ~6 ms figure is the practical floor a WebRTC intercom is competing against. |
| **RAVENNA** | Merging Technologies' AES67-compatible ecosystem; the daemon is built on the **ALSA RAVENNA/AES67 driver** and uses **mDNS discovery for RAVENNA** vs **SAP for AES67** (FACT) — two discovery mechanisms for one audio format, a recurring interop tax. |
| **SMPTE ST 2110-30** | Described in `awesome-aoip` as "AES67 based audio transport in a video stream" with additional constraints (FACT). |
| **ST 2022-7** | Seamless redundancy over dual interfaces, with automatic master-clock election, implemented in the daemon (FACT). The standard answer to "what if the network drops" in broadcast intercom. |
| **PTP / IEEE 1588-2008** | Non-negotiable. The daemon runs as a **PTP clock slave and refuses to transmit audio until the clock locks** (FACT). `LinuxPTP` (`ptp4l`, `phc2sys`) is the open implementation; `holoplot/ptp-trace` and `philhartung/node-ptpv2` exist as tooling (FACT). |
| **SDP / SAP** | Session description and announcement — how an AES67 stream is discovered and parsed (FACT). |
| **NMOS IS-04 / IS-05** | Discovery/registration and connection management; available in the daemon behind a **CMake flag** (FACT) — i.e. present but not default, which is a fair summary of NMOS adoption generally. |
| **Dante / OMNEO** | Proprietary (Audinate; OMNEO is Bosch/RTS's Dante-based stack). Open tooling exists but is reverse-engineered: `chris-ritsen/network-audio-controller` is "reverse engineered Dante Controller on the command line" (349 stars) and `Inferno` is "a Dante implementation written in Rust" (FACT). **Dante Virtual Soundcard** is what VORTEX routes N-1 feeds into (FACT). |
| **IPMX** | Listed in `awesome-aoip` as proposed open standards for control, security and interoperability (FACT). Status in intercom: **UNKNOWN**. |

**Signalling and control.**

| Protocol | Where it appears (all FACT) |
| --- | --- |
| **XML-RPC** | Riedel RRCS. Addressing `<net>.<node>.<port>`, 0-based ports. |
| **REST/HTTP** | Clear-Com Arcadia/Edge master stations (IP + admin password); Eyevinn (OpenAPI at `/api/docs/`); Symphony Media Bridge conference control; the AES67 daemon's own config API; talkkonnect. |
| **WebSocket** | Riedel SmartPanel RSP-1232HL on port 80; the user's own Broadcast-Intercom core. |
| **WHIP / WHEP** | Eyevinn — WebRTC ingest and egress over plain HTTP, token-authenticated. The most standards-clean way to get audio in and out of a browser intercom. |
| **OSC (UDP)** | Green-GO — `/ggo/cmd/<cmd>`, `/ggo/state/…`, 5 s heartbeat. |
| **Bespoke UDP** | Unity Intercom, port 20119, keydown/keyup pairs. |
| **Bespoke TCP** | ProdLink Comms, port 3200; talktome (host/port/TLS). |
| **Localhost API** | Clear-Com Station-IC, `127.0.0.1:16000`, API-key auth. |
| **SIP / RTP multicast** | talkkonnect outputs multicast RTP to IP PA speakers and SIP phones; `fonoster/routr` is a programmable SIP server (1.7k stars). |
| **MQTT** | talkkonnect, for remote monitoring/control. |
| **Opus** | The universal codec of the software tier — Mumble, ODIN (**20 ms internal chunks**), SMB. |

**Interchange formats: there are none.** No file format was found in this pass for describing an
intercom plan — no partyline list, no key layout, no beltpack assignment schema. The closest
things are vendor-private: Green-GO's `.gg5t` script/config artefact (FACT, named in the module
help) and each vendor's own configuration tool. See *white space*.

## What this segment does WELL

Patterns worth stealing, each grounded in something verified above.

1. **The crosspoint is the right data model, and level belongs to the crosspoint.** Riedel
   exposes `Crosspoint: set` and `Crosspoint: set volume` as operations on the *cell*, not on
   the source or the destination. Any intercom data model that stores volume on the channel or
   on the user will eventually be unable to express "the director hears camera 3 quieter than
   camera 4", which is a thing directors actually want.
2. **IFB and conference are first-class object types, not flags.** Riedel has `IFB: get all` and
   `IFB: set mix-minus volume` separate from crosspoints, and `Conference` separate again. The
   temptation to model everything as "a channel with properties" is exactly what makes software
   intercoms fall over when someone asks for a real mix-minus.
3. **Separate the four levels.** Green-GO distinguishes channel level, PGM level, main level and
   input gain as four independently settable, independently readable values. This is the
   difference between a usable beltpack and a frustrating one.
4. **Call and Cue are different signals.** Green-GO ships both. So does classic partyline. One is
   "answer me", the other is "look at me" — collapsing them loses information.
5. **Design offline, bind at runtime.** Riedel's typed `<net>.<node>.<port>` addressing with
   variable substitution, explicitly documented as the offline-capable alternative to online-only
   dropdowns, is the single most transferable idea in this dossier for a *planning* product.
6. **Heartbeat + coarse timeout + full-state re-fetch.** Green-GO's 5-second heartbeat and
   `/ggo/cmd/update` on timeout is simple and correct. So is the flood-control instinct of
   throttling anything whose path contains `level` or `gain`.
7. **Role presets that set many channels at once.** ProdLink's role presets, talktome's per-user
   generated presets, and the user's own `UserProfile` + `ChannelSlot[]` all converge on the same
   answer: **the unit of configuration is a person's job, not a channel**. Convergent design
   across three unrelated products is strong evidence.
8. **An explicit emergency action.** ProdLink's "silence all" and the user's own
   `__sys_emergency__` channel. Live production needs a verb for "everyone stop".
9. **Hybrid SFU/MCU is the right media topology for intercom.** SMB's ability to hand a
   participant *mixed* audio instead of N forwarded streams is what makes a phone beltpack
   viable on a partyline of twenty.
10. **Guest onboarding by expiring signed link/QR with no account.** VORTEX's invitations and the
    user's own browser-beltpack invite link. Crew turnover per show makes account creation a
    non-starter.
11. **Stream Deck / Companion control is now table stakes.** Every single software intercom found
    in this pass was found *because* it had a Companion module. That is the distribution channel.

## What NOBODY in this segment solves well

The white space, in rough order of how badly it is unsolved.

1. **There is no interchange format for an intercom plan — none, from anyone.** Lighting has
   GDTF/MVR; video has NMOS; intercom has nothing. You cannot export "twelve partylines, forty
   keysets, six IFBs, this beltpack-to-person assignment" from a Riedel system and import it
   into a Clear-Com one, or into a spreadsheet, or into a planning tool, or into a rental quote.
   Every system's configuration is a private artefact of its own config tool. **This is the
   largest single gap found in this segment** and it is the one directly addressable by a
   planning suite.
2. **The comms plan for a show lives in a spreadsheet.** Who carries beltpack 7, which antenna
   covers the upstage-left dressing room corridor, which channel the followspot ops are on,
   what happens to the IFB when the presenter walks to the second position — none of the
   products examined here is a *planning* tool. They are runtime tools that assume the plan
   already exists somewhere else. **INFERENCE**, but strongly supported: none of the sixteen
   products has any concept of a venue, a position, a person's role in a running order, or a
   coverage area.
3. **The wireless half is invisible to control APIs.** Green-GO states outright that WAA antennas
   and WBPX(SP) beltpacks are **not supported** over OSC. Riedel's SmartPanel module manages IP
   addresses, not keys. **INFERENCE:** RF/antenna state — battery, link quality, roaming,
   coverage — is systematically the least API-exposed part of every wireless intercom, which is
   ironic because it is the part that actually fails during a show.
4. **No RF/coverage planning is integrated with anything.** Antenna placement for DECT/wireless
   beltpacks is done by experience and a walk test. Nothing found here ties beltpack count,
   antenna position and venue geometry together — the exact problem a cable/site planner already
   holds the geometry for.
5. **Cross-vendor bridging is manual and lossy.** Getting a Riedel show to talk to a Clear-Com
   truck to a Green-GO stage crew means 4-wire, SIP trunks or an AES67 patch, hand-configured
   each time, with no discovery and no label propagation. The labels — the one thing humans
   need — never survive the boundary.
6. **Pricing is completely opaque.** I could not verify a single price for a single product in
   this segment. Some of that is my access limitation and is honestly declared. But note the
   corroborating signal: several of these products publish a full Companion module with port
   numbers and action lists, and still no price was reachable. **INFERENCE:** per-port,
   per-user, per-licence pricing in this segment is predominantly quote-driven, which makes
   budget comparison at the *planning* stage impossible for the buyer.
7. **Mobile app quality: entirely UNKNOWN.** Agent-IC, Station-IC's mobile siblings, Unity's iOS
   client, VORTEX's iPhone beltpack — no app store listing, review, or vendor page was
   reachable. This was an explicit analysis target and it could not be met. **It should be the
   first thing re-run when search is available.** What *can* be said from the control APIs is
   structural: Unity's latch bug ("send keyup or it stays latched") and VORTEX's PTT-on-iPhone
   design both hint that touchscreen PTT is a known-hard problem, and the user's own backlog
   independently lists "push-to-talk lock mode optimized for touchscreen operation".
8. **Offline/LAN-only operation is asserted but rarely documented.** Green-GO is genuinely
   decentralised and Mumble/Eyevinn are genuinely self-hostable, but even Eyevinn silently falls
   back to **Google's STUN server** without explicit ICE configuration. Cloud offerings
   (Gen-IC, Spacecommz) are WAN-dependent by construction. Nobody publishes a straight answer to
   "what still works when the uplink dies", which is the first question any venue TD asks.
9. **Scoped, non-admin API credentials are rare.** Clear-Com's REST API authenticates with the
   **administrator password**. Only talktome showed a genuine per-account **scope** model. For
   rented or shared systems this is a real gap.
10. **No product connects comms to the rest of the production data.** Camera numbers, running
    order, crew list, call sheet, rental inventory — the intercom system knows none of it, so
    every beltpack label is typed twice.

## Relevance to AV Planner Suite

Ranked by directness.

**1. `broadcast-intercom` (primary — this is the segment's home repo).**
The existing project (`/home/user/Broadcast-intercom`) is already well-positioned: it has
partylines (`IntercomGroup` + `Channel type: "group"`), direct calls as auto-created
`TemporaryChannel`s, three always-present system channels, `UserProfile` + up to eight
`ChannelSlot`s, a routing matrix (`PATCH /api/matrix`), role-based permissions, a Companion
module, and browser beltpacks via QR invite. Against this research, the concrete gaps to close:

- **Adopt Riedel's level model.** Volume currently is not documented as a crosspoint property.
  Add per-crosspoint level, and split the four levels Green-GO separates (channel / PGM / main /
  input gain) rather than one volume.
- **Make IFB a first-class object.** The system has `__sys_program__` but no mix-minus. Riedel
  models `IFB: set mix-minus volume` separately from crosspoints; VORTEX ships 16 N-1 circuits.
  This is the biggest functional gap versus the commercial tier.
- **Add Cue as distinct from Call.** Green-GO has both; the current WebSocket protocol has
  `direct_call` only.
- **Steal ProdLink's talk-state colour model** (green talking / red others-or-emergency / teal
  listening / orange latched) and its **"silence all"** — the latter partly exists as
  `emergency_start`.
- **Steal Green-GO's resync pattern**: the existing `heartbeat` message should drive a coarse
  timeout and a full-state re-fetch, and `level`/`gain`-class messages should be throttled.
- **Adopt talktome's scoping**: the roles model gates talk/listen, but API credentials should be
  scoped per account, not global — this is where Clear-Com is weak and it is cheap to do right.
- **Interop, in priority order (INFERENCE from the gaps above):** WHIP/WHEP like Eyevinn (clean,
  standards-based, browser-native); then an AES67 boundary as the architecture doc's phase 3
  already plans; then a Green-GO-compatible `/ggo/cmd` OSC listener, which would make the
  project drop-in controllable by existing Companion pages.

**2. `cable-planner` (strong, and this is the under-exploited one).**
Intercom is a cabling problem that no intercom vendor treats as one: PoE drops for wired
beltpacks, coax/cat to wireless antennas, XLR-4 headset runs, 4-wire tie-lines to the truck,
AES67 on the same network the video is on. Cable Planner already owns the geometry and the
signal-flow model. Adding intercom devices as first-class equipment — beltpack, antenna, matrix
frame, splitter — with partyline membership as a property, would make it the **only** tool in
this landscape that can print a comms plan. Gap 1 (no interchange format) and gap 4 (no coverage
planning) are both addressable here.

**3. `shell` / suite (strong).**
Roles are the shared spine. `UserProfile` + `ChannelSlot[]` in broadcast-intercom, crew roles in
the rental/crew segments, and camera operator assignments in multicam-planner are the same
people. One suite-level person/role model, with intercom slots derived from role, removes the
double-typing named in gap 10.

**4. `multicam-planner` (moderate).**
Camera position ↔ beltpack assignment ↔ IFB to talent is exactly the mapping nobody stores.
A multicam plan that already knows "camera 3, upstage left, operator X" is one field away from
generating the intercom key layout and the N-1 routing.

**5. `tally-pi` (moderate, and concrete).**
Tally and intercom share a device and a person. Note that **talktome's Companion module sends
tally** (FACT) — a shipping product already merges these. A Pi that is both a tally light and a
beltpack endpoint is a plausible, differentiated product, and `talkkonnect` proves the pattern
works: headless Mumble PTT client on a Raspberry Pi with **GPIO buttons and an LCD/OLED panel**,
MPL-2.0, already exists to learn from.

**6. `pi-media-station` (light).**
Natural source of the program/PGM feed that IFB is built from.

**7. `light-planner`, `sony-camera-bridge` (light).**
Followspot and board-op comms are just crew roles; the camera bridge could in principle carry
IFB to a camera's return channel, but nothing in this research supports that as a priority.

## Sources

URLs **actually opened** in this pass, in the order used. All were fetched on **2026-08-28**.

1. https://github.com/Eyevinn/intercom-manager
2. https://github.com/Eyevinn/intercom-manager/tree/main/src
3. https://github.com/Eyevinn/intercom-frontend
4. https://github.com/finos/SymphonyMediaBridge
5. https://github.com/mumble-voip/mumble
6. https://github.com/talkkonnect/talkkonnect
7. https://github.com/jacktrip/jacktrip
8. https://github.com/bondagit/aes67-linux-daemon
9. https://github.com/4Players/odin-sdk
10. https://github.com/Mo-way/awesome-aoip
11. https://github.com/topics/aes67
12. https://github.com/topics/intercom
13. https://github.com/topics/push-to-talk
14. https://github.com/Solarys431/vortex-intercom
15. https://github.com/bitfocus/companion-module-riedel-rrcs
16. https://raw.githubusercontent.com/bitfocus/companion-module-riedel-rrcs/master/companion/HELP.md
17. https://raw.githubusercontent.com/bitfocus/companion-module-riedel-smartpanel/main/companion/HELP.md
18. https://github.com/bitfocus/companion-module-greengo-intercom
19. https://raw.githubusercontent.com/bitfocus/companion-module-greengo-intercom/master/companion/HELP.md
20. https://raw.githubusercontent.com/bitfocus/companion-module-greengo-intercom/master/osc.js
21. https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-rest/main/companion/HELP.md
22. https://raw.githubusercontent.com/bitfocus/companion-module-clearcom-station-ic/main/companion/HELP.md
23. https://raw.githubusercontent.com/bitfocus/companion-module-audivero-unityintercom-client/master/companion/HELP.md
24. https://raw.githubusercontent.com/bitfocus/companion-module-talktome-intercom/main/companion/HELP.md
25. https://raw.githubusercontent.com/bitfocus/companion-module-spacecommz-intercom/main/companion/HELP.md
26. https://raw.githubusercontent.com/bitfocus/companion-module-prodlink-comms/main/companion/HELP.md
27. https://raw.githubusercontent.com/bitfocus/companion-module-eyevinn-intercom/main/companion/HELP.md
28. https://github.com/orgs/bitfocus/repositories?q=intercom
29. https://github.com/orgs/bitfocus/repositories?q=clearcom
30. https://github.com/orgs/bitfocus/repositories?q=riedel
31. https://github.com/orgs/bitfocus/repositories?q=unity
32. https://github.com/orgs/bitfocus/repositories?q=green
33. https://github.com/orgs/bitfocus/repositories?q=comms
34. https://github.com/orgs/bitfocus/repositories?q=rts *(zero results — negative finding)*
35. https://github.com/orgs/bitfocus/repositories?q=telex *(zero results — negative finding)*
36. https://github.com/orgs/bitfocus/repositories?q=pliant *(zero results — negative finding)*
37. https://github.com/orgs/bitfocus/repositories?q=studio-technologies *(zero results — negative finding)*
38. https://github.com/orgs/bitfocus/repositories?q=talkback *(zero results — negative finding)*

Local repository read as the positioning baseline (not a web source):
`/home/user/Broadcast-intercom/README.md`, `/home/user/Broadcast-intercom/docs/architecture.md`,
`/home/user/Broadcast-intercom/docs/future-feature-requests.md`.

### Not opened — blocked by the egress proxy, must be re-run

These are the gaps a second pass must fill. All returned `EGRESS_BLOCKED`; none of their content
is represented in this dossier.

- `riedel.net` — Artist, Bolero, SmartPanel specifications, licensing, beltpack/antenna counts
- `clearcom.com` — Eclipse HX, Arcadia, HelixNet, FreeSpeak II/Edge, Agent-IC, Gen-IC, pricing
- `green-go.eu` — product line, PoE, AES67 support, decentralised architecture claims
- `unityintercom.com` — pricing, server requirements, mobile client capability
- `en.wikipedia.org` — background on partyline/matrix intercom history

Never reached at all (no URL attempted, since search was unavailable to find one): RTS/Telex,
Pliant Technologies, Studio Technologies, Trilogy Mentor, TeamConnect, Vokaturi, and any app
store listing for any mobile intercom client.

**Specific items to verify first on a second pass**, in priority order:
(1) mobile app quality and app-store ratings for Agent-IC, Station-IC, Unity, VORTEX — the one
explicit analysis target this pass could not address at all;
(2) any published price or licensing unit (per port, per user, per beltpack, per concurrent
client) for any product here;
(3) latency figures published by vendors, to compare against the ~6 ms AES67 floor verified
above and Opus's 20 ms framing;
(4) whether RTS/OMNEO exposes any external control API, given the zero-result finding above;
(5) Green-GO's system-level architecture, to confirm or refute the inference that no
whole-network API exists.
