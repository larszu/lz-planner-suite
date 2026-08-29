# Live Video Production / Switching / Streaming / Signal Monitoring

> Research dates: **2026-08-29** (brief dated 2026-08-28). Claims labelled per
> [`docs/research/METHOD.md`](../METHOD.md).

## How to read the evidence labels in this dossier

This segment was researched in two passes on the same day, with different tool access. The
labels below are used literally and everywhere:

| Label | Means |
| --- | --- |
| **FACT (fetched)** | Read directly in a page or file this session fetched in full — almost always source code, a shipped `HELP.md`, a protocol document or a repository README on a code host. Strongest evidence here. |
| **FACT (search)** | Stated in a WebSearch result summary that names its source page. The page itself could **not** be fetched from this environment (see the access note). Good enough to record; **not** good enough to quote to a customer without re-checking. |
| **INFERENCE** | My reasoning from the evidence, marked as such. |
| **UNKNOWN / unverified** | Could not be established. Said plainly rather than guessed. |

### Source-access note (this constrains the price data specifically)

WebSearch worked this pass. **Direct fetching of vendor websites did not.** The egress proxy
allowed code hosts (`github.com`, `raw.githubusercontent.com`, `gitlab.com`, `pypi.org`,
`hub.docker.com`) and refused everything else with `EGRESS_BLOCKED`. Verified blocked this
pass: `vmix.com`, `telestream.net`, `vizrt.com`, `docs.ndi.video`, `bitfocus.io`,
`bhphotovideo.com`, `saasworthy.com`. So:

- **Protocol, data-model and API claims** are mostly **FACT (fetched)** — they come from the
  actual source of the products, or of the Bitfocus Companion modules that drive them.
- **Price and feature-marketing claims** are mostly **FACT (search)** — the number was
  reported by a search summary citing a named page, but I could not open that page. Every
  price below carries the date seen, the currency, the source URL, and whether it is
  *advertised* or *requires sales contact*. Treat every figure as needing one re-check before
  it goes in front of a customer or a board.
- Two prices are reported inconsistently across sources; both readings are shown rather than
  one being silently picked.

One source deserves flagging up front because it carries disproportionate weight:
**`bitfocus/companion` and its ~700 device modules** are collectively the most honest public
map of which live-production products have a usable control API and which do not. A product
with a rich module has a rich API. A product whose module needs a third-party bridge app
(Wirecast) or offers one single action (Restream) is telling you something. That signal is
used repeatedly below and is always labelled as inference where I lean on it.

---

## Segment summary

This segment is the **live gallery**: the software and appliances that take N camera and
playback sources and produce one or more program outputs, in real time, with an operator (or
a macro) deciding what is on air right now — plus the monitoring layer that tells you whether
what is on air is actually correct.

Functionally it decomposes into five jobs. Almost every product does some subset, and the
interesting differences are in which subset and how it is exposed:

| Job | What it means | Who does it well |
| --- | --- | --- |
| **Switching** | Select PGM/PVW, transition, keyers, DSK, M/E, AUX | ATEM, TriCaster, vMix, Kairos, Carbonite, OBS (studio mode) |
| **Compositing** | Layers, lower thirds, chroma key, virtual sets, graphics | vMix, mimoLive, CasparCG, Singular.live |
| **Monitoring** | Multiviewer, tally, scopes, audio meters, source health, compliance | Lawo vm_dmv, R&S PRISMON, TAG MCM-9000, Bridge VB440, Telestream PRISM |
| **Encoding / transport** | Stream out, contribute in, ISO record | OBS, vMix, Haivision, Teradek, LiveU, Kiloview, SRT/NDI/OMT |
| **Control** | Macros, panels, remote operation, automation API | Companion, Skaarhoj, Lawo VSM, Ross DashBoard, obs-websocket |

**Who buys it.** Five buyers with very little overlap in what they will tolerate:

- **The creator / single operator** — OBS (free), Streamlabs, StreamYard, Ecamm, mimoLive.
  Cares about: works on my laptop, streams to my platform, cheap or free. Will not read a manual.
- **The house / venue / church / corporate AV integrator** — ATEM + Videohub, vMix, TriCaster,
  Companion + Stream Deck. Cares about: a physical button surface, tally, reliability, and that
  a volunteer can run it. This is the segment's commercial centre of gravity (**INFERENCE**,
  from the density of Companion modules aimed at exactly this tier).
- **The sports / event production company** — vMix, Streamstar, Riedel SimplyLive, TriCaster,
  bonded-cellular contribution. Cares about replay, ISO, tally and packing into a flight case.
- **The broadcaster / OB / systems integrator** — Grass Valley, Ross, Sony, Panasonic Kairos,
  Lawo, EVS, increasingly ST 2110 + NMOS, controlled from a vendor-agnostic layer (VSM,
  DashBoard). Cares about redundancy, standards conformance, MCR integration.
- **The remote-production (REMI) operator** — SRT/NDI/WebRTC transport (Haivision, Teradek,
  LiveU, Kiloview, VDO.Ninja) plus one of the switchers above, run from somewhere else. This
  buyer grew fastest in the period covered — see the German evidence below.

**Typical price band** (all figures **FACT (search)**, dated and sourced in *Pricing notes*):

| Tier | Band seen | Examples |
| --- | --- | --- |
| Free / open source | 0 | OBS, Companion, CasparCG, Voctomix, VDO.Ninja, OvenMediaEngine, OMT |
| Free-with-hardware | 0 (bundled) | ATEM Software Control, Videohub Control |
| Creator SaaS | ~USD 16–90 / month | Restream, StreamYard, Streamlabs Ultra, Ecamm Live |
| Prosumer/pro desktop perpetual | ~USD 60–1,200 one-time | vMix Basic HD → Pro; Wirecast Studio/Pro |
| Pro desktop annual | ~GBP 159–1,639 / year | mimoLive Non-Profit → Broadcast |
| Software switcher subscription | ~USD 1,260 / month | TriCaster Vectar |
| Switcher hardware | ~USD 1,795–2,000+ | ATEM Constellation 4K, ATEM Mini Extreme ISO G2 |
| Broadcast systems | quote only | Kairos, M2L-X, Carbonite, AMPP, Lawo, Riedel, TAG, PRISMON, Bridge |

The structurally important point is not the numbers but that **the control software is very
often free and the money is in the hardware, the platform, or the cloud subscription.** That
pricing pattern has direct consequences for anyone selling planning software into this world.

---

## Product table

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **OBS Studio** | OBS Project (community) | Win / macOS / Linux | Free, GPL-2.0-or-later (**FACT (fetched)**, README) | **Yes** — fully local, no account | **Yes** — obs-websocket 5.x, ~140+ requests, WS 4455 (**FACT (fetched)**) | Free, scriptable, infinitely extensible software switching |
| **vMix** | StudioCoast Pty Ltd (AU) | Windows | Perpetual, edition-tiered USD 60 / 350 / 700 / 1200 + USD 60/yr updates; **or** Max at USD 50/mo (**FACT (search)**) | **Yes** — LAN TCP control, port 8099 (**FACT (fetched)**) | **Yes** — TCP `FUNCTION` / `XML` / `SUBSCRIBE ACTS`; module claims 100% shortcut coverage (**FACT (fetched)**) | Windows all-in-one: replay, ISO/MultiCorder, NDI + OMT, PTZ, calls |
| **ATEM Software Control** | Blackmagic Design | Win / macOS | Free with the switcher (**FACT (search)**) | **Yes** — proprietary UDP 9910 to the switcher (**FACT (fetched)**) | Not officially published; reverse-engineered libs with 169 command classes (**FACT (fetched)**) | The free panel shipped with the most-deployed switcher hardware |
| **Videohub Control** | Blackmagic Design | Win / macOS | Free with the router (**INFERENCE**) | **Yes** — plain-text TCP 9990, Bonjour (**FACT (fetched)**) | **Yes** — self-describing text block protocol with ACK/NAK (**FACT (fetched)**) | Router control and label management; trivially scriptable |
| **Wirecast Studio / Pro** | Telestream | Win / macOS | Perpetual **and** annual subscription both offered again (**FACT (search)**); support renewal ~USD 99/yr | **Yes** (**INFERENCE**) | **Weak** — Companion needs a third-party `EventsController` bridge (**FACT (fetched)**) | Established encoder/switcher; control is its weak point |
| **TriCaster Vectar / Viz Vectar Plus** | Vizrt (NewTek lineage) | Appliance + cloud/software | Subscription, **USD 1,260/month MSRP** (**FACT (search)**) | **Yes** on-prem — HTTP + WS on the LAN (**FACT (fetched)**) | **Yes** — `/v1/…`, `dictionary?key=…`, `ws://…/v1/change_notifications` (**FACT (fetched)**) | Integrated production system: macros, DataLink, M/E, tally, DSK |
| **mimoLive** | Boinx Software International GmbH (DE) | macOS (+ iOS companion) | Annual licence tiers; UK reseller GBP 159 / 569 / 1,639 per year (**FACT (search)**) | **Yes** — local REST + WebSocket (**FACT (fetched)**) | **Yes** — JSON:API-shaped REST + `ws://host:port/api/v1/socket` (**FACT (fetched)**) | Clean document/layer/variant model with a genuinely REST-shaped API |
| **Ecamm Live** | Ecamm Network | macOS | Subscription ~USD 16–32/mo (Standard USD 20/mo, USD 16/mo annual) (**FACT (search)**) | **Partial** — Bonjour + local HTTP control (**FACT (fetched)**); product is stream-destination centric | **Partial** — `http://host:port/<command>`; module says "not fully ready yet" (**FACT (fetched)**) | Mac-native simple live streaming |
| **Streamlabs Desktop** | Streamlabs (Logitech) | Win / macOS | Freemium; Ultra USD 27/mo or USD 189/yr (**FACT (search)**) | **Mostly** — local API on 59650 with token auth (**FACT (fetched)**); account-centric product | **Yes** (**FACT (fetched)**) | Creator streaming with a surprisingly complete local control API |
| **StreamYard** | StreamYard (Hopin lineage) | Browser / cloud | Free, USD 44.99/mo Core, USD 88.99/mo Advanced, USD 299/mo Business (**FACT (search)**) | **No** — browser studio | **UNKNOWN** — no Companion module found this pass | Zero-install browser studio, guests, multistream |
| **Restream** | Restream Inc. | Browser / cloud | Free, USD 16 / 39 / 199 per month (**FACT (search)**) | **No** — cloud REST + OAuth 2.0 only (**FACT (fetched)**) | **Minimal** — one action, one feedback in Companion (**FACT (fetched)**) | Multistreaming distribution to 30+ platforms; not a control surface |
| **Singular.live** | Singular.live | Browser / cloud | Trial USD 0 (watermarked); from ~USD 36/mo; 3/7/30-day event pricing (**FACT (search)**) | **No** — control API is `app.singular.live/apiv2/control/<token>` (**FACT (fetched)**) | **Yes**, but cloud-hosted, token-scoped (**FACT (fetched)**) | Cloud-rendered HTML5 live graphics overlays |
| **Grabyo** | Grabyo | Browser / cloud | Aggregator lists "from USD 150"; enterprise custom (**FACT (search)**, weak) | **No** | **UNKNOWN** — no Companion module exists (**FACT (fetched)**, org search) | Cloud-native live production, clipping and distribution |
| **Livestream Studio 6** | Vimeo (Livestream) | Windows | Paid; **platform behind it was shut down mid-2025** (**FACT (search)**) | **Yes** — TCP 9923 on the LAN (**FACT (fetched)**) | **Yes** but hard-locked port, per-show-file enable, per-IP approval (**FACT (fetched)**) | Legacy; module last touched 2022 — effectively in decline (**INFERENCE**) |
| **Bitfocus Companion** | Bitfocus AS (NO) | Win / macOS / Linux / Pi / Docker | Free, MIT (**FACT (fetched)**) | **Yes** — entirely LAN, mDNS discovery, no cloud (**FACT (fetched)**) | **Yes, in every direction** — HTTP, OSC, TCP/UDP, Ember+ 9092, RossTalk, Art-Net, Satellite 16622/16623 (**FACT (fetched)**) | Universal glue: 700+ device modules (**FACT (fetched)**, README) |
| **CasparCG Server** | SVT + community (SE) | Windows + Linux | Free, **GPLv3-or-later** (**FACT (search)**) | **Yes** — AMCP over TCP | **Yes** — AMCP text protocol + `OSC SUBSCRIBE` (**FACT (fetched)**) | Broadcast playout and graphics; in 24/7 production since 2006 (**FACT (search)**) |
| **Voctomix** | C3VOC / Chaos Computer Club (DE) | Linux | Free, open source | **Yes** — TCP 9999 + GStreamer net clock UDP 9998 (**FACT (fetched)**, pass 1) | **Yes** — plain-text command protocol (**FACT (fetched)**, pass 1) | Deterministic, unattended, scripted conference recording |
| **VDO.Ninja** | Steve Seguin (community) | Browser (+ mobile apps) | Free, self-hostable (**FACT (search)**) | **Yes** — dedicated offline deployment repo with Docker (**FACT (search)**) | **Yes** — IFRAME API, WHIP/WHEP, self-hosted TURN/SFU (**FACT (search)**) | Getting remote guests and phone cameras into a switcher over WebRTC |
| **OvenMediaEngine** | AirenSoft (KR) | Linux / Docker | Free / open source core (**FACT (search)**) | **Yes** — self-hosted | **Yes** — REST API (**FACT (search)**) | Sub-second WebRTC / LL-HLS delivery with SRT + WHIP ingest |
| **Panasonic KAIROS** | Panasonic Connect (JP) | Appliance (KC-series Core) + Creator app on PC/Mac | Quote only (**FACT (search)** — no price published) | **Yes** — on-prem IT/IP platform | **UNKNOWN this pass** | Software-defined switching mixing SDI, ST 2110 and NDI with PTP |
| **Sony M2L-X / M2 Live** | Sony (JP) | Software; public cloud now, COTS/private cloud promised | Quote only (**FACT (search)**) | **Partial** — cloud-first; on-prem deployment stated as a roadmap item (**FACT (search)**) | Control via ICP-X panel **or Elgato Stream Deck** (**FACT (search)**) | Cloud/hybrid switching for REMI, 24 inputs, hybrid with MLS-X1 |
| **Ross Carbonite Ultra / Code** | Ross Video (CA) | Appliance; Carbonite Code is a software NDI switcher | Quote only | **Yes** | **Yes** — DashBoard + RossTalk; Companion implements RossTalk inbound (**FACT (fetched)**) | Broadcast switching with a vendor-wide control ecosystem (DashBoard, OverDrive) |
| **Grass Valley AMPP** | Grass Valley (CA) | Cloud-native, GV Hosted on AWS | SaaS (**FACT (search)**); price quote only | **No** (cloud-native by design) | **UNKNOWN this pass** | Cloud/COTS software-defined production; used by German OB integrators (**FACT (search)**) |
| **Riedel SimplyLive Production Suite** | Riedel Communications (DE) | Appliance | Quote only | **Yes** | **UNKNOWN this pass** | Touchscreen all-in-one production + replay (RiMotion), tally integration |
| **Streamstar (SW / X / CASE / IPX)** | Streamstar (SK) | Windows software + turnkey kits | Purchase; perpetual SW licence sold at retail (**FACT (search)**) | **Yes** | **UNKNOWN this pass**; supports TSL tally (**FACT (search)**) | European flight-case live sports production with replay as standard |
| **Lawo vm_dmv + VSM** | Lawo (DE) | Appliance (C100 blades) + control system | Quote only | **Yes** | **Yes** — VSM is explicitly vendor-agnostic control (**FACT (search)**) | Scalable IP multiviewer (24→768 inputs) and the broadcast control layer above it |
| **Bridge Technologies VB440** | Bridge Technologies (NO) | Appliance + browser UI | Quote only | **Yes** | Browser-based, up to 8 simultaneous remote users (**FACT (search)**) | Deep ST 2110 / ST 2022-6 production monitoring and analysis |
| **R&S PRISMON** | Rohde & Schwarz (DE) | Software / appliance | Quote only | **Yes** | Multiviewer Control Centre for fleets (**FACT (search)**) | Software multiviewer mixing SDI, ST 2110, NDI and OTT in one mosaic |
| **TAG MCM-9000** | TAG Video Systems (IL) | Software-only, COTS/cloud | Quote only | **Yes** | **UNKNOWN this pass** | Software multiviewing/monitoring at ~2 frames latency, HDR + Dolby Vision detection |
| **Telestream PRISM** | Telestream (US) | Hardware + software waveform monitor | Quote only | **Yes** | **UNKNOWN this pass** | Hybrid SDI + ST 2110 waveform, vectorscope, loudness, up to 4 inputs |
| **Haivision Makito X4 / Pro4K** | Haivision (CA) | Hardware encoder/decoder | Quote (**INFERENCE**) | **Yes** — device-local REST (**FACT (fetched)**) | **Yes** — REST: encoder state, bitrate, codec, up to ten streams, presets (**FACT (fetched)**) | Hardened SRT contribution encoding; HEVC-native bonded 4K |
| **Teradek Prism / VidiU** | Teradek (Vitec) | Hardware encoder | Retail + quote | **Yes** (**INFERENCE**) | **Yes** — ~20 variables incl. bitrate, codec, drive usage (**FACT (fetched)**) | Field and bonded contribution encoding, up to 6 bonded links (**FACT (search)**) |
| **LiveU LU900Q** | LiveU (IL) | Hardware encoder + cloud | Quote only | Device works standalone; management is cloud (**INFERENCE**) | **UNKNOWN this pass** — no Companion module found | Bonded cellular contribution in hostile network conditions |
| **Kiloview N-series / P3 / CUBE** | Kiloview (CN) | Hardware NDI converters, recorders, bonding | Retail | **Yes** — device-local HTTP (**FACT (fetched)**) | **Yes** — HTTP; mode switch, NDI source select, presets (**FACT (fetched)**) | Cheap bidirectional SDI/HDMI ↔ NDI, plus KiloLink bonding |
| **Skaarhoj panels (Blue Pill / Reactor)** | Skaarhoj (DK) | Hardware control surfaces | Retail + Pro licence | **Yes** | Reactor config engine; drives ATEM, vMix, TriCaster with tally feedback (**FACT (search)**) | Physical panels that unify camera control, switching and tally |
| **Cyanview RCP** | Cyanview (BE) | Hardware RCP + gateways | Retail | **Yes** | Ingests tally via **TSL** or direct ATEM/TriCaster/vMix integration (**FACT (search)**) | Shading any camera brand, with tally distribution built in |
| **DistroAV (obs-ndi)** | DistroAV community | OBS plugin, cross-platform | Free | **Yes** on LAN, but requires the proprietary **NDI Runtime v6.3+** installed separately (**FACT (fetched)**) | n/a (transport plugin) | NDI send/receive inside OBS |
| **Source Record (OBS plugin)** | exeldro | OBS plugin, cross-platform | Free | **Yes** | Filter-based; hotkeys, replay buffer integration (**FACT (search)**) | **ISO recording for OBS** — per-source files alongside the program output |
| **Open Media Transport (OMT)** | openmediatransport (community) | Win / macOS / Linux; Pi 5 encoder + decoder | Free, MIT, royalty-free (**FACT (fetched)**) | **Yes** — DNS-SD or optional TCP discovery server | Libraries in .NET, C, C++, Rust; OBS plugin; FFmpeg fork | A royalty-free NDI alternative, already shipping in vMix 29 |

**Thirty-nine entries.** The brief asked for at least eight; a shorter table would
misrepresent how crowded this segment is, and would hide the fact that the "switcher" tier and
the "monitoring" tier barely talk to each other.

---

## Deep dives

### 1. OBS Studio + obs-websocket

**What it does.** OBS Studio is "software designed for capturing, compositing, encoding,
recording, and streaming video content, efficiently" (**FACT (fetched)**, `README.rst`,
pass 1). Licensed **GNU GPL v2 or later**. It is the segment's free baseline and, by a wide
margin, its largest installed base (**INFERENCE** — no figure verified).

**Release cadence 2025–2026** (**FACT (search)**, obsproject.com release-notes pages via
search summaries):

- **32.0** (2025-09-22): plugin manager, opt-in crash-log upload, Voice Activity Detection.
- **32.1.0** (2026-03-11): **WebRTC Simulcast** to WHIP endpoints (Cloudflare Stream,
  Millicast, LiveKit) sending high/medium/low layers; rebuilt audio mixer with per-track VU
  meters and visual bus routing; VAD noise suppression on NVIDIA RTX TensorRT.
- **32.2.0** (2026-07-21): SDR-into-HDR compositing filter, dynamic bitrate for multitrack
  video, VA-API AV1 over WHIP.

The direction of travel is unambiguous: **OBS is becoming a WebRTC-first contribution tool**,
not just an RTMP encoder. That matters for REMI planning.

**Data model.** Read off the obs-websocket protocol document, the most precise public
description of OBS's internal object graph (**FACT (fetched)**,
`obsproject/obs-websocket` `docs/generated/protocol.md`, re-fetched this pass):

```
SceneCollection
 └─ Scene            (program scene / preview scene when studio mode is on)
     └─ SceneItem    (an instance of an Input inside a Scene: transform, blend mode,
                      enabled, locked, index — the same Input can appear in many Scenes)
         └─ Input    (a source: capture device, media, browser, text, image…)
             └─ SourceFilter (ordered filter chain, each with its own settings)
 Transitions, Outputs, Profiles, Canvases  are siblings of the scene graph
```

The separation of **Input** (the thing) from **SceneItem** (its placement in a scene) is the
single most important design decision in the model: switching scenes re-composites existing
inputs rather than re-opening devices. It is directly readable from the request set —
`SetInputSettings` is global, `SetSceneItemTransform` is per-placement.

**API.** obs-websocket 5.x, **default port 4455** (**FACT (fetched)**, pass 1; the protocol
doc itself does not state a port). All of the following are **FACT (fetched)** from the
protocol document:

- Subprotocol negotiation: `obswebsocket.json` (text) or `obswebsocket.msgpack` (binary).
- Strict handshake state machine: `Hello` (OpCode 0) → `Identify` (1) → `Identified` (2), with
  `Reidentify` (3) to change session parameters later.
- Authentication is a **SHA-256 challenge/salt** scheme (password + salt, base64), on by
  default with a generated password.
- **`rpcVersion` negotiation** — unsupported version closes the connection cleanly. The
  document calls this out as enabling backwards compatibility for both sides.
- **`EventSubscription` is a bitmask** over General, Config, Scenes, Inputs, Transitions,
  Filters, Outputs, SceneItems, MediaInputs, Vendors, Ui, **Canvases**, plus explicitly
  opt-in high-volume categories (`InputVolumeMeters`, `SceneItemTransformChanged`).
- Roughly **140+ requests** across General (8), Config (16), Sources (3), Canvases (1),
  Scenes (11), Inputs (26), Transitions (9), Filters (10), Scene Items (17), Outputs (17),
  Stream (5), Record (8), Media Inputs (4), Ui (6).
- `RequestBatch` / `RequestBatchResponse` with a `RequestBatchExecutionType` enum, and a
  `Sleep` request — i.e. **the protocol has primitives for building macros client-side**,
  including timed sequences, without OBS having a macro engine.

**Integrations.** `OpenSourceProjector` / `OpenVideoMixProjector` (this is how OBS does
"multiview" — projector windows, not a composited MV grid), `SetTBarPosition` (studio-mode
T-bar for hardware panels), `SaveReplayBuffer`, `SplitRecordFile` / `CreateRecordChapter`,
`SendStreamCaption`, `TriggerHotkeyByName`, and `CallVendorRequest` — the escape hatch that
lets **plugins publish their own RPC surface through the same socket**.

The Companion OBS module (**FACT (fetched)**, `HELP.md`, pass 1) is a good census of what
practitioners reach for: recording with pause/resume/split/chapter, replay buffer, virtual
cam, studio mode with a "Smart Scene Switcher" (preview-then-take on second press), per-source
transform and filter control, and variables including `kbits_per_sec`,
`render_missed_frames`, `output_skipped_frames`, `free_disk_space` and `cpu_usage`. That last
group is the tell: **operators use the control API as a health-monitoring channel**, not just
a command channel.

**ISO recording — the gap is filled by a plugin, and this is now verified.** OBS has no native
per-source ISO recording, but **Source Record** by exeldro is a free filter-based plugin that
records any source to its own file while the program output streams or records; the plugin's
own description says this "in other software and hardware platforms is referred to as an
Isolated Output (ISO)". Version 0.4.8, updated 2026-03-26, with ~850,000 downloads
(**FACT (search)**, obsproject.com forum resource page + `exeldro/obs-source-record`). Known
limit: per-source recording can only select a single audio track, with an open issue (#169)
requesting multitrack parity with the global recorder (**FACT (search)**).

**Notable strengths.** Free and GPL. The protocol is versioned, authenticated, batched and
category-subscribable — better engineered than most commercial control APIs in this segment.
Plugins extend the RPC surface. Cross-platform. Now a credible WHIP/WebRTC contribution tool.

**Notable limits.** No M/E, no AUX bus, no router concept: OBS's model is scenes, not buses,
which is why house installs pair it with an ATEM rather than replacing one. No native tally
output — tally is derived externally from `CurrentProgramSceneChanged` events (see
[`landscape/tally.md`](tally.md)). "Multiview" is a set of projector windows, not a
configurable MV layout with labels and tally borders. ISO recording is a third-party plugin
with a known audio-track limitation.

---

### 2. vMix

**What it does.** The Windows all-in-one production switcher — switching, compositing, replay,
recording, streaming, PTZ and video calls in one application.

**Version and commercial state (this is fresher than most of this dossier).** **vMix 29 was
released 2026-02-02** and its headline additions are **OMT support**, overlay channels
increased to **8**, Instant Replay and audio-bus improvements, and — the significant one —
**MultiCorder can record directly via OMT without re-encoding** (**FACT (search)**,
`blog.vmix.com/vmix-29-is-available-now/`). That is a commercial switcher shipping a
royalty-free NDI competitor in its recording path, which is the strongest single signal about
OMT's trajectory found this pass.

**Pricing** (**FACT (search)**, seen 2026-08-29; `vmix.com/purchase` was not fetchable, figures
come from search summaries citing that page and resellers). Editions are **perpetual**:
Basic HD **USD 60**, HD **USD 350**, 4K **USD 700**, Pro **USD 1,200**. Updates are free for
12 months; further update years cost **USD 60**. A subscription tier, **vMix Max at USD 50 per
month**, is "equivalent to Pro with continuous updates". One aggregator reported a different
band (USD 600 Basic HD → USD 1,200 4K); the USD 60/350/700/1200 reading is corroborated by
more sources and matches the USD 60 update-renewal figure, so it is the one carried forward —
but **this is exactly the kind of number to re-check on the vendor page.**

**Data model and API.** **FACT (fetched)** (pass 1, `bitfocus/companion-module-studiocoast-vmix`),
with the vendor documentation corroborating the port split (**FACT (search)**,
`vmix.com/help28/TCPAPI.html`, `vmix.com/help25/WebController.html`):

vMix's control API is **TCP on port 8099**, and the module's config screen warns: *"Companion
uses vMix's TCP port (8099). Do NOT enter your Web Controller port, and ensure that the Web
Controller is NOT set to 8099 as that will cause a conflict."* There are **two** APIs — a TCP
command/state API and a separate HTTP Web Controller, whose default port is **8088** — and
they can collide. Vendor documentation states the TCP API "provides the same functionality as
the HTTP WEB API but with lower processing overhead making it suitable for use in embedded
devices, and also provides the ability to subscribe to a TALLY event" (**FACT (search)**).

The module opens **three separate TCP sockets** to port 8099, each with a role:

1. **Functions socket** — `FUNCTION <Name> Key=Value&Key=Value`, e.g.
   `FUNCTION NDISelectSourceByName Input=<key>&Value=<name>`.
2. **Activators socket** — sends `SUBSCRIBE ACTS`, then receives pushed state deltas. Initial
   state for some properties must be explicitly requested (`ACTS BusASolo` … `ACTS BusGSolo`,
   `ACTS ReplayQuadMode`) on connect.
3. **XML socket** — **polls** by sending `XML\r\n` and receives the complete document state.

That third socket is the architectural fact worth stealing *and* criticising. vMix's canonical
state is **a full XML document of the entire production**, pulled on a timer. The module's
parser carries the warning *"If XML data is larger than 2 full TCP messages (8KB per message)
send a warning"* → `log.warn('Large vMix XML data size!')`. **INFERENCE:** vMix is a
document-shaped system wearing a message-shaped API, and `ACTS` exists to paper over polling
cost for the properties that change fastest.

**Feature surface.** The module's shortcut coverage is organised into 16 categories
(**FACT (fetched)**, `docs/shortcut_list.md`): General, Audio, Transition, Output, Title,
Input, Overlay, Playlist, **Scripting**, **Replay**, **NDI**, **OMT**, **PTZ**, Preset,
DataSources, Browser. Module v5.0.0 claims *"80 new Actions, resulting in 100% coverage of
vMix Shortcut Functions"* (**FACT (fetched)**, re-verified on the repository this pass).

Concretely verified: **Replay** (events, cameras A–D, marking, speed, `ReplayQuadMode`);
**ISO / MultiCorder** recording control; **Scripting** (`ScriptStart` / `ScriptStop` /
`ScriptStopAll` — an in-app scripting engine addressable from outside); **ten layers per
input** with crop, pan, zoom, animation; **NDI** (`NDISelectSourceByIndex/ByName`,
`NDIStartRecording`, and `NDICommand` — sending an arbitrary command *to* an NDI source, i.e.
NDI's back-channel); **OMT** (`OMTPreviewOn/Off` to switch an OMT input to a lower-resolution
preview stream, `OMTSelectSourceByIndex/ByName`).

**Tally.** Module feedbacks read `data.mix[n].program`, `.preview`, `.programTally[]` and
`.previewTally[]` (**FACT (fetched)**). `programTally` being an array *distinct from* `program`
means vMix reports **layer tally**: an input is on air if it is the program input **or if it
is a layer inside the program input**, with return value 1 (direct) distinguished from 2 (as a
layer). Tally rendering offers `border | cornerTL | cornerTR | cornerBL | cornerBR | full`, and
mixes are addressed by index, so **vMix has N independent program/preview buses each with
their own tally.** This is the most sophisticated tally model verified in the software tier.

**Notable strengths.** The most complete single-box feature set in the software tier. Layer
tally. Early OMT adoption, sidestepping the NDI royalty question. Inputs addressed by a stable
`key` (GUID-like) rather than index, so renaming or reordering does not break a control
surface — exactly right, and rare.

**Notable limits.** Two APIs on one port with a documented collision hazard. Full-state XML
polling the ecosystem has to defend against. Windows-only. Edition tiering means an action can
exist in the protocol and fail on your licence — a real integration trap, and one no planning
tool currently models.

---

### 3. The Blackmagic control stack (ATEM + Videohub)

Two protocols with opposite philosophies, from one vendor. The contrast is instructive.

#### 3a. ATEM — a binary, undocumented, reverse-engineered protocol

**FACT (fetched)** (from `nrkno/sofie-atem-connection`, the library behind Companion's ATEM
module and part of the NRK *Sofie* TV automation system; re-verified this pass):

- Transport is **UDP, default port 9910** (**FACT (fetched)**, pass 1 — the README itself
  describes only "raw packets", the port comes from the module code).
- **169 command classes**, organised as `MixEffects`, `DownstreamKey`, `SuperSource`, `Macro`,
  `Media`, `Recording`, `Streaming`, `Audio`, `Fairlight`, `CameraControl`, `Inputs`,
  `Settings`, `DataTransfer`, `DisplayClock`, `DeviceProfile`, plus standalone
  `AuxSourceCommand`, `TallyBySourceCommand`, `ColorGeneratorCommand`, `PowerStatusCommand`,
  `TimeCommand`.
- **The protocol is not published.** Blackmagic ships an **ATEM Switchers SDK** (manual dated
  December 2025, **FACT (search)**) but the wire protocol itself is not documented; the Sofie
  library verifies its serialisation against that SDK, and the README states the library aims
  to support every model of every generation while warning that *"new firmwares will require
  updates to the library to be fully supported"* (**FACT (fetched)**).
- USB control is explicitly **not** supported by the library.
- Firmware support tiering is stated in the README: versions 8.0 and latest get primary focus,
  7.2 "should work well", 7.3–7.5.2 are community-tested (**FACT (fetched)**).

Three consequences that matter beyond Blackmagic:

1. **`TallyBySourceCommand` means tally is in the switcher protocol itself.** You do not need a
   separate tally interface to know what is on air on an ATEM — see
   [`landscape/tally.md`](tally.md).
2. **`CameraControlCommand` means the switcher is also the camera-control transport.** On an
   ATEM rig, "switcher" and "camera control network" are the same wire. Directly relevant to
   `sony-camera-bridge` and `multicam-planner`.
3. **The whole ecosystem is built on reverse engineering the vendor tolerates but does not
   support.** Every firmware update is a compatibility risk borne by the community. This is the
   single largest integration risk in the segment (**INFERENCE**).

**The hardware around it, with prices** (**FACT (search)**, seen 2026-08-29): ATEM Software
Control is **free with the switcher** for Mac and Windows, with separate pages for control,
audio, **macros**, media and deck control, and macro recall by keyboard shortcut. ATEM
Constellation 4K models start at **US$1,795**; the **ATEM Mini Extreme ISO G2** is **US$1,995**
(one retailer listed US$2,195) with 8 standards-converted HDMI inputs, built-in streaming,
multiview, CFexpress and Thunderbolt record/playback, 10G Ethernet, and **ISO recording of all
8 inputs**. All multiviews are customisable to 4/7/10/13/16 views; advanced 2 M/E and 4 M/E
models add SuperSource with up to 8 additional DVE channels. Blackmagic also now ships an
**ATEM 4 M/E Constellation IP** with 32 native **SMPTE ST 2110** inputs over 100G fibre — the
low-cost tier crossing into IP infrastructure.

#### 3b. Videohub — a plain-text, block-structured, self-describing protocol

**FACT (fetched)** (`bitfocus/companion-module-bmd-videohub`; the action set and Bonjour
support were re-verified this pass from the changelog, the port from the module code in pass 1):

- TCP, **port 9990**, with the module comment *"Videohub-Protokoll ist immer Port 9990."*
  Bonjour/mDNS discovery was added in module v2.2.0.
- The wire format is **blocks of text terminated by a blank line**. A block starts with a line
  containing `:`, subsequent lines are the body, an empty line commits the block. `ACK` and
  `NAK` arrive as bodyless blocks and settle the in-flight command.
- Block keys parsed: `VIDEOHUB DEVICE`, `INPUT LABELS`, `OUTPUT LABELS`,
  `MONITORING OUTPUT LABELS`, `SERIAL PORT LABELS`, `VIDEO OUTPUT ROUTING`,
  `VIDEO MONITORING OUTPUT ROUTING`, `SERIAL PORT ROUTING`, `VIDEO OUTPUT LOCKS`,
  `VIDEO MONITORING OUTPUT LOCKS`, `SERIAL PORT LOCKS`, `VIDEO INPUT STATUS`,
  `VIDEO OUTPUT STATUS`, `SERIAL PORT STATUS`.
- Operations: rename destination / source / serial port, route, route-source-routed-to-other-
  destination, select destination, take, clear, **lock and unlock outputs and serial ports**,
  routing from variables, step destination/source for rotary encoders, and — notably —
  **"read and write routing table to a disk file"**.
- Blackmagic publishes a **Videohub Ethernet Protocol** document describing this text protocol
  (**FACT (search)**, blackmagicdesign.com developer section).

**This is the best-designed control protocol in the segment** (**INFERENCE**, but defensible):
human-readable, self-describing, order-independent, idempotent, and it carries **labels as
first-class routable state**. A Videohub tells you what everything is *called*, not just what
is connected to what. The read/write-routes-to-file feature is the closest thing in this whole
segment to a **portable configuration artefact**, and it is limited to one vendor's router.

**Notable limits of the stack as a whole.** The two halves do not know about each other. The
ATEM knows its input names; the Videohub knows its labels; nothing reconciles them. There is
no Blackmagic-level concept of "this camera" spanning router port, switcher input, multiviewer
tile and tally lamp. That gap is, in one sentence, why `cable-planner` exists.

---

### 4. TriCaster Vectar / Viz Vectar Plus (Vizrt, NewTek lineage)

**What it does.** The integrated production system tier: switching, M/E, DSKs, media, macros,
streaming, record, and a data-binding layer — historically an appliance, now also sold as
cloud software.

**Commercial shape, and it changed.** Viz Vectar Plus is being **renamed TriCaster Vectar** in
version 1.5, and TriCaster Vectar is sold on a "Flexible Access" subscription at
**US$1,260 per month MSRP** (**FACT (search)**, seen 2026-08-29, vizrt.com product pages via
search summary — *advertised*, not quote-only, which is unusual for this tier). It supports
**44 video and 44 audio channel inputs**, is NDI-native, and outputs via NDI, RTMP, RTSP and
SRT (**FACT (search)**). A one-year cloud subscription SKU exists at retail (**FACT (search)**,
B&H listing surfaced in search).

**API.** **FACT (fetched)**, from `bitfocus/companion-module-newtek-tricaster` (pass 1):

- Control is **HTTP**: `http://<host>/v1/<request>`.
- State is retrieved through a **dictionary endpoint**: `dictionary?key=<name>`, with verified
  keys `shortcut_states`, `tally`, `macros_list`, `switcher`, `switcher_ui_effects`.
- Live updates arrive over **WebSocket**: `ws://<host>/v1/change_notifications`. The handler
  receives a key name and then re-fetches `dictionary?key=<that key>` — the socket is a
  **change-notification channel, not a data channel**. Push tells you *what* changed; pull
  tells you *what it now is*. This is the most robust of the three state patterns in the
  segment.
- The module probes `dictionary?key=shortcut_states` rather than a version call, *"so older
  firmware that don't support the version call can still connect"* — graceful degradation
  designed in.

**Setup requirement, and it is a real one:** *"On the Tricaster under Administration Tools,
turn off the LivePanel password"* (**FACT (fetched)**, module `HELP.md`). The published control
path requires **disabling authentication**. **INFERENCE:** the appliance tier assumes a
trusted, physically separate production VLAN; its security model is the network, not the
protocol.

**Capabilities verified from the module.** Take, Auto, set source to PVW/PGM/M-E/DSK per M/E
(A and B bus), DSK on-air, transition selection, media transport for DDRs/GFX/Stills/Titles/
Sound, **Run System Macros and Run Custom Macros**, record and stream toggles, set mix output,
**set a DataLink value**, and arbitrary custom shortcuts. Feedbacks: source tally (program and
preview), media playing, recording, streaming, DSK on-air.

**DataLink is the interesting one.** A key/value store inside the production system that
graphics bind to, writable over the control API. The switcher carries a **live data bus for
lower-third content** — scores, names, timers — addressable from Companion or a script.
Nothing in the software tier has an exact first-class equivalent; vMix's `DataSources` is the
nearest (**INFERENCE**).

**Notable strengths.** Macros are a first-class, enumerable, remotely-triggerable object
(`macros_list`). Change-notify-then-refetch. Graceful firmware degradation. Tally, DSK and M/E
in the API, not bolted on. A published monthly price in a tier that usually hides one.

**Notable limits.** Authentication must be disabled for the documented integration path.
US$1,260/month is roughly a vMix Pro perpetual licence **per month**. The Companion module is
small relative to the ATEM and vMix modules, suggesting a much smaller integrator community
around the API (**INFERENCE** from repository metadata — weak evidence, flagged as such).

---

### 5. mimoLive (Boinx Software International GmbH, Germany)

Included because the brief asked specifically for European and German vendors, and because
**its API is the best-shaped data model in the segment** for a planning tool to interoperate
with. The German vendor identity is now confirmed: mimoLive is developed by **Boinx Software
International GmbH** (**FACT (search)**; the company is based near Munich — the town of
Puchheim is *not* verified from a reachable source this pass).

**What it does.** *"An all-in-one live switcher, video encoder, editor, and streaming software
for Mac"* with multi-layer mixing, built-in graphics, replay/instant replay, green screen and
video effects; latest version **6.17, March 2026** (**FACT (search)**). Licence tiers are
**Non-Profit** (explicitly non-monetised, individual use), **Studio** (professionals and
organisations, including monetised YouTube, in-house TV, church and event production), and
**Broadcast** (**FACT (search)**, mimolive.com store pages).

**Pricing** (**FACT (search)**, seen 2026-08-29, via a UK reseller —
`application-systems.co.uk`; the vendor store was not fetchable): **Non-Profit GBP 159**,
**Studio GBP 569**, **Broadcast GBP 1,639**, each stated as a **licence for 1 year**. Euro
pricing was not obtainable. Flag: the licensing model changed at some point (a
`mimolive.com/new-mimolive-licenses/` page exists), so tier names and durations should be
re-checked before quoting.

**Data model.** Clean, nested, explicitly REST-addressable (**FACT (fetched)**, from the
Companion module's `src/actions.js` and `src/api.js`, pass 1):

```
Document          (a show; multiple documents can be open at once, indexed 1..n)
 └─ Layer         (the layer stack; layer 1 is at the top)
     └─ Variant   (a named configuration of a layer — the "active-variant")
 └─ Output        (a destination: stream, record, …)
 LayerSet         (a recallable named grouping of layer states)
```

Every one of those is a live-state object with `live-state` (`Set Live` / `Set Off` /
`Toggle Live`), so the whole production is a tree of independently on-airable things rather
than a program bus. **INFERENCE:** this is a *compositing* model, not a *switching* model —
mimoLive has no PGM/PVW in the ATEM sense, which is why Companion's mimoLive feedbacks are
Document / Layer / Output / Layer Set / Variant status and there is **no tally feedback at
all**.

**API.** **FACT (fetched)**: REST over HTTP —
`GET documents/<id>/<action>`, `GET documents/<docId>/layers/<layerId>/<action>`,
`PUT documents/<docId>/layers/<layerId>` with JSON. WebSocket for state at
`ws://<host>:<port>/api/v1/socket`, delivering **JSON:API-shaped** messages with
`data.attributes` and `data.relationships` (the module reads
`message.data.relationships['active-variant'].data.id`). Objects are addressable **either by
index** (`<documentIndex>,<layerIndex>`) **or by a stable API endpoint** the app generates and
the operator copies out of the UI. There is a generic "Trigger a Generic Endpoint" action.

**Notable strengths.** A real resource model with stable identifiers, relationships and a
change socket — JSON:API discipline is unusual in this segment. Multiple documents open
simultaneously, each independently addressable. Variants give named states per layer — the
nearest thing in the software tier to a lighting console's cue stack (**INFERENCE**).

**Notable limits.** *"Currently, authenticated connections are not supported, so you will need
to have the Remote Control options set to no password"* (**FACT (fetched)**) — same pattern as
TriCaster. macOS only. No tally concept. Index-based addressing is fragile: "the first document
opened in a session is index 1" makes addressing depend on operator behaviour at run time,
which is exactly what breaks at 19:55 on a show day.

---

### 6. Bitfocus Companion (the integration layer)

Companion is not a switcher, and that is why it belongs here: **it is the de-facto integration
standard for this entire segment**, and the single most relevant product in this dossier to the
AV Planner Suite.

**What it does.** Turns Stream Deck and similar surfaces into a control panel for *"an
increasing amount of different presentation switchers, video playback software and broadcast
equipment"*, with **700+ supported connections** (**FACT (fetched)**, README, re-verified this
pass). Licence **MIT**. Free.

**Architecture 4.x — the surface layer became modular, which matters.** In Companion 4,
support for physical surfaces moved out of the core into independently updatable **surface
modules**, using the same module-management UI as device connections; a new Stream Deck model
or a surface bug fix no longer requires a full Companion release. The Elgato Stream Deck
plugin now connects over the **Satellite API** (TCP **16622**) — the same path used by the
Satellite app and third-party hardware — for consistent behaviour across surface types
(**FACT (search)**, `companion.free` release notes and `bitfocus/companion-satellite`).

**Services, as read from `companion/lib/Service/`** (**FACT (fetched)**, pass 1):

| Service | What it is |
| --- | --- |
| `HttpApi.ts` | Inbound REST control of Companion itself |
| `OscApi.ts` / `OscSender.ts` / `OscListener.ts` | OSC in and out |
| `TcpApi.ts` / `UdpApi.ts` / `TcpUdpApi.ts` | Raw socket control |
| `EmberPlus.ts` | **Ember+ provider on port 9092** — broadcast-standard control |
| `Rosstalk.ts` | RossTalk (Ross Video's switcher control protocol) |
| `Artnet.ts` | Art-Net input (a lighting console can drive video buttons) |
| `SatelliteTcp.ts` (16622) / `SatelliteWebsocket.ts` (16623) | Remote surface attachment |
| `BonjourDiscovery.ts` / `MdnsAdvertise.ts` | Discovers devices, and advertises itself |
| `Https.ts` | TLS for the web UI |

The inbound API surface is **location-addressed rather than device-addressed**
(**FACT (fetched)**):

```
/location/:page/:row/:column/press | down | up | step | rotate-left | rotate-right
/location/:page/:row/:column/style          (and /style/text, /style/color, /style/bgcolor over OSC)
/custom-variable/:name/value
/variable/:label/:name/value
/connections , /connections/:id/enable|disable|restart|status
/surfaces/rescan
```

**Why this matters more than any single switcher.** Three reasons, all **INFERENCE** but each
grounded in the file list above:

1. **Companion is where the segment's products actually meet.** No switcher talks to another
   switcher. Every switcher talks to Companion, and Companion speaks Ember+, OSC, RossTalk,
   Art-Net, HTTP and raw TCP/UDP outward. It is the translation layer, and it is free and MIT.
2. **Its address space is spatial, not semantic.** A button is `page/row/column`. There is no
   notion of "camera 3" that survives across pages, devices and shows. Every Companion install
   is a hand-built mapping from a physical grid to device commands, and that mapping exists
   nowhere except inside that install.
3. **It already runs on the hardware this suite targets.** `tally-pi` is built on top of
   Companion (**FACT (fetched)**, its README), and Companion ships a Dockerfile and a launcher.

**Notable limits.** Configuration lives in a Companion-internal database; no documented
interchange format for "the button layout for this show" that another tool could generate or
consume was found (**UNKNOWN** — still the first thing to check for any export idea). Modules
are per-device and community-maintained, with quality ranging from the vMix module's
100%-coverage claim to Ecamm's "Module not fully ready yet."

---

### 7. The monitoring tier (the half of this segment that software people forget)

The brief asks about signal monitoring, and it is worth stating that this is a *separate
industry* from the switcher tier, with separate vendors, separate buyers and almost no
integration between them.

**What is in it** (all **FACT (search)**, seen 2026-08-29):

- **Lawo vm_dmv** (DE) — IP 4K UHD multiviewer scaling from **24 inputs / 4 heads to 768
  inputs / 128 heads**, using "LiveView" MIP-mapping and clustered C100 blades to keep
  bandwidth down. Sits under **Lawo VSM**, a *vendor-agnostic* broadcast control system that
  drives routers, switchers, audio consoles, multiviewers, intercoms and third-party devices
  from one UI. VSM is the closest thing the broadcast tier has to Companion, at 100x the price
  (**INFERENCE** on the price ratio — VSM pricing is quote-only).
- **R&S PRISMON** (DE, Rohde & Schwarz) — fully software-based multiviewer/monitoring, ST 2110
  ready, mixing **SDI, ST 2110, NDI and OTT/transport-stream** feeds in one mosaic, with
  Scalable Distributed Multiviewing to share decode resources across instances and a
  Multiviewer Control Centre for fleets. Deployed at SRF and Red Bee.
- **TAG Video Systems MCM-9000** (IL) — software-only, mixes compressed and uncompressed
  streams in one mosaic, ST 2110 latency stated as under 2 frames at 50/59.94 fps, with
  **Dolby Vision Profile 8.1 detection** alongside HDR10, HDR10+, HLG and SDR in the same grid.
- **Bridge Technologies VB440** (NO) — ST 2110 / ST 2022-6 monitoring and analysis with a
  **browser UI for up to 8 simultaneous remote users**, 10/25/40/50/200 Gbit interfaces,
  goniometer, loudness radar, 64-channel audio measurement, full ST 2022-7 redundancy
  monitoring.
- **Telestream PRISM** (US) — hybrid SDI + ST 2110 waveform monitor, up to 4 inputs in any
  combination of SDI/IP, HD/UHD, SDR/HDR, with ST 2110-30/31 audio, loudness and surround
  displays; SD to 8K.
- **PHABRIX Qx** (UK, now Leader-Phabrix), **DekTec SdEye** (up to nine SDI or ST 2110 streams
  with picture, YCbCr/RGB waveforms, vectorscope and peak meters), **Drastic sdiScope**, and
  **QSdiP** (SDI + ST 2110 with ANC data and SCTE-104 triggers) occupy the software-scope tier.

**The finding that matters.** A 2026 practitioner-facing comparison states plainly that for
primary signal QC — lipsync, loudness compliance to ITU-R BS.1770 / ATSC A/85, PSI/SI checks,
freeze and black detection — **hardware multiviewers and dedicated probes are still preferred
over software** (**FACT (search)**, craftwall.pro). Meanwhile the switcher tier's idea of
"monitoring" is a multiview grid and a CPU-usage variable. **These two worlds do not share a
data model, a layout format, a naming scheme or a tally map.** Nobody plans them together.

---

## Standards & protocols

### Control protocols

| Protocol | Transport | Verified details | Evidence |
| --- | --- | --- | --- |
| **obs-websocket 5.x** | WS/TCP **4455** | JSON or MsgPack subprotocol; `Hello`/`Identify`/`Identified`; SHA-256 challenge+salt; `rpcVersion` negotiation; `EventSubscription` bitmask; ~140+ requests; `RequestBatch` + `Sleep` | FACT (fetched) — `obsproject/obs-websocket` `docs/generated/protocol.md` |
| **vMix TCP API** | TCP **8099** | `FUNCTION <name> Key=Value&…`; `XML` full-state poll; `SUBSCRIBE ACTS` push; TALLY event subscription; separate HTTP Web Controller on **8088** | FACT (fetched) module + FACT (search) vendor help |
| **ATEM** | **UDP 9910** | Proprietary binary, unpublished; 169 command classes; per-firmware version branches; `TallyBySource`, `CameraControl`, `Macro`, `Recording`, `Streaming`, `Fairlight` | FACT (fetched) — `nrkno/sofie-atem-connection` |
| **Videohub Ethernet Protocol** | TCP **9990** | Plain-text blocks terminated by a blank line; `ACK`/`NAK`; LABELS / ROUTING / LOCKS / STATUS per port class; Bonjour; routes readable and writable as a disk file | FACT (fetched) module + FACT (search) BMD developer doc |
| **TriCaster LivePanel** | HTTP + WS | `http://<host>/v1/<req>`; `dictionary?key=…`; `ws://<host>/v1/change_notifications` as change-notify; auth must be disabled | FACT (fetched) |
| **mimoLive** | HTTP + WS | `/api/v1/documents/<id>/layers/<id>/…`, JSON:API payloads; `ws://host:port/api/v1/socket`; no auth support | FACT (fetched) |
| **AMCP** (CasparCG) | TCP text, UTF-8, `\r\n`-terminated | `LOAD`, `LOADBG`, `PLAY`, `PAUSE`, `RESUME`, `STOP`, `CALL`, `CLEAR`, `MIXER <30+ verbs>`, `CG ADD/PLAY/STOP/UPDATE/INVOKE/NEXT/REMOVE`, `DATA STORE/RETRIEVE/LIST/REMOVE`, `INFO`, `VERSION`, `CLS`, `TLS`; **2xx/4xx/5xx status codes**; backslash escaping; quoted params | FACT (fetched) — `CasparCG/help` wiki |
| **Voctomix control** | TCP **9999** | `set_video_a/b`, `set_composite_mode`, `cut`, `transition`, `set_audio`, `set_stream_blank\|blind\|live`, `set_overlay`, `get_config`, `report_ports` | FACT (fetched), pass 1 |
| **Ember+** | TCP **9092** (Companion's provider) | Broadcast device-control standard; Companion acts as a provider | FACT (fetched) |
| **RossTalk** | TCP | Ross switcher control; Companion implements it inbound; Ross's own ecosystem is DashBoard + RossTalk | FACT (fetched) + FACT (search) |
| **OSC** | UDP | Companion inbound + outbound; CasparCG emits OSC via `OSC SUBSCRIBE` | FACT (fetched) |
| **Companion Satellite** | TCP **16622** / WS **16623** | Remote surface attachment; as of Companion 4 also the path used by the Elgato Stream Deck plugin | FACT (fetched) + FACT (search) |
| **Livestream Studio 6** | TCP **9923** (locked) | Port cannot be changed; per-show-file "Allow Incoming Connections"; per-IP approval | FACT (fetched) |
| **Streamlabs Desktop** | TCP **59650** | Token auth from Settings → Remote Control | FACT (fetched) |
| **Ecamm Live** | HTTP + Bonjour | mDNS service type `ecammliveremote`; `http://host:port/<command>` | FACT (fetched) |
| **Wirecast** | HTTP via **third-party bridge** | No direct path; needs `CVMEventi/EventsController`, then `http://ip:port/wirecast/layer/<n>/shot/<n>/autolive/<0\|1>` | FACT (fetched) |
| **Singular.live** | HTTPS, cloud | `https://app.singular.live/apiv2/control/<token>`; the token *is* the credential | FACT (fetched) |
| **Restream** | HTTPS, cloud | OAuth 2.0; one action, one feedback | FACT (fetched) |
| **Haivision Makito X4** | REST over HTTP/HTTPS | Encoder start/stop/restart, bitrate/resolution/framerate/codec, up to ten streams, presets, reboot | FACT (fetched) |
| **TSL UMD 3.1 / 5.0** | UDP/TCP | The interoperable tally/UMD standard; 3.1 has a single index, 5.0 adds primary-screen index plus display index; supported by Ross, Streamstar, FOR-A, Cyanview, tvONE, Cuebi | FACT (search) — see [`landscape/tally.md`](tally.md) |

### Transport protocols

**SRT** (**FACT (fetched)**, pass 1, `Haivision/srt`): *"a transport protocol for ultra low
(sub-second) latency live video and audio streaming, as well as for generic bulk data
transfer."* **MPL-2.0**. Published as IETF Internet-Draft `draft-sharabayko-srt-01`. AES
payload encryption, ARQ as primary loss recovery, FEC via packet filtering, and **Connection
Bonding** for hitless failover. Practitioner-reported latency band **200–500 ms** depending on
tuning (**FACT (search)**). Packaged in Ubuntu, Debian, Fedora, Homebrew, vcpkg, Conan.

**RIST** — a competing ARQ-based contribution protocol from the RIST Forum. The forum itself
publishes a 2026 RIST-vs-SRT comparison (**FACT (search)**). The practitioner consensus in the
sources read is blunt: *"SRT has significantly broader hardware and software support… most
equipment that supports RIST also supports SRT, but the reverse is not always true"*
(**FACT (search)**). **libRIST was not opened this pass.**

**NDI** — owned by **Vizrt NDI AB** (**FACT (search)**). Licensing has two tracks, and this is
the commercially important bit: **the standard NDI SDK is royalty-free** subject to its terms,
while the **NDI Advanced SDK is a royalty-based offering** for developers needing advanced
features, product certification and support (**FACT (search)**, docs.ndi.video licensing page
via search summary). Latency within a LAN is **1–3 frames (under 100 ms)** for full NDI and
~100+ ms for NDI|HX (**FACT (search)**). **NDI HX3** is the current high-quality/low-bitrate
variant; **NDI 6.3 introduced native cloud transport** that replaces the NDI Bridge workaround
for cross-site routing (**FACT (search)**). NDI is explicitly *not* designed for the public
internet. The `DistroAV` OBS plugin requires **NDI Runtime v6.3 or higher installed
separately** (**FACT (fetched)**) — an open-source plugin plus a proprietary runtime the user
must fetch from the vendor, which is the NDI licensing story in miniature.

**OMT — Open Media Transport** (**FACT (fetched)**, `openmediatransport/libvmx` and
`libomtnet`, re-verified this pass). The most important new thing in this segment:

- *"An open-source network protocol for high performance, low latency video over a local area
  network"*, **MIT licensed**, explicitly royalty-free.
- Codec is **VMX**, separately MIT-licensed, which *"originated as the 'vMix Video Codec' for
  vMix's Instant Replay feature"*. **Intra-frame only**, **4:2:2:4 with alpha**, **10-bit**.
  Requires x86-64 with SSE4.2/SSSE3 (AVX2 recommended, Haswell 2013+) or ARM64 NEON. Claim:
  *"capable of encoding 2160p60 on a single Intel i7 core"* with AVX2.
- Discovery via **DNS-SD (Bonjour/Avahi)** with an optional TCP discovery server
  (`OMTDiscoveryServer`).
- Metadata is timestamped bidirectional XML side data; recommended elements include
  `<OMTWeb URL="…"/>`, `<OMTPTZ Protocol="…"/>` (**Sony VISCA**) and `<AncillaryData>` for raw
  SDI ANC over OMT (**FACT (fetched)**, pass 1, `openmediatransport/Metadata`).
- **Tally is not defined** (**FACT (fetched)**, pass 1). A live gap in an otherwise
  well-designed protocol.
- Published bandwidth figures (1080p60 high = 260 Mbps; 720p30 low = 22.5 Mbps) were read in
  pass 1 from the organisation profile README; the `PROTOCOL.md` referenced by `libomtnet` was
  **404 at the path tried this pass**, so treat those two numbers as **FACT (fetched, pass 1)
  pending one re-check**.
- Ecosystem: `libomtnet` (.NET reference), `libomt` (C), `libomtcpp` (C++), `Aqueduct` (Rust),
  `omtplugin` (OBS 31+), `FFmpeg-OMT`, `ffgl-omt` (Resolume), `omt-tools`, `OMTMatrix`, and —
  directly relevant to this suite — **`omtcapture` and `omtplayer`: a Raspberry Pi 5 encoder
  and decoder**, plus `omtcase`, a Pi 5 case with PoE HAT support.
- **vMix 29 (2026-02-02) ships OMT, including MultiCorder recording directly via OMT without
  re-encoding** (**FACT (search)**). Independent confirmation that OMT has landed in a
  commercial switcher's critical path, not just as a preview feature.

**WebRTC / WHIP / WHEP.** OBS 32.1 added WebRTC **Simulcast** to WHIP endpoints
(**FACT (search)**). OvenMediaEngine ingests WebRTC/WHIP/SRT/RTMP/E-RTMP/MPEG-2 TS and RTSP/OVT
pull, delivering WebRTC, LL-HLS, HLS v3 and SRT (**FACT (fetched)**, pass 1, Docker Hub
listing). VDO.Ninja provides WHIP/WHEP clients and self-hosted TURN/SFU (**FACT (search)**).

**GStreamer network clock** (**FACT (fetched)**, pass 1, `voc/voctomix`): voctocore runs a
`GstNet.NetTimeProvider` on **UDP 9998** which clients must use to synchronise their pipeline
clock. Worth noting because clock distribution is usually invisible here and this is an
explicit, planable network port.

**SMPTE ST 2110 / AMWA NMOS IS-04** (**FACT (fetched)**, pass 1,
`amwa-tv/nmos-discovery-registration`): IS-04 *"allows control and monitoring applications to
find the resources on a network"* — Nodes, Devices, Senders, Receivers, Sources, Flows —
using DNS-SD for registry discovery, HTTP+JSON for registration, and HTTP query plus WebSocket
subscription for clients. **The critical limitation for a planning tool:** IS-04 describes
**what is on the network right now**. It has no concept of an intended or designed
configuration. It is discovery, not design. ST 2110 itself is now reaching the low-cost tier —
the ATEM 4 M/E Constellation IP takes 32 native ST 2110 inputs over 100G (**FACT (search)**).

### Interchange formats

There is essentially **one** portable per-device configuration artefact verified in this whole
segment: Videohub's **"read and write routing table to a disk file"** (**FACT (fetched)**).
Its format is **UNKNOWN**.

Adjacent standards exist but none covers a live production configuration:

- **SMPTE BXF (Broadcast Exchange Format)** is an XML-based SMPTE standard for exchanging
  **playlists, as-run logs and schedules** between broadcast systems (**FACT (search)**). It is
  the right *shape* of idea and the wrong *domain* — it is traffic and playout, not gallery
  configuration.
- **Multiviewer layouts are per-vendor, full stop.** Ross documents MV-Layout inside Acuity;
  Lawo documents a Distributed Multi Viewer module inside VSM; TAG, PRISMON, Bridge and ATEM
  each have their own (**FACT (search)**). A dedicated search for a vendor-neutral multiviewer
  layout interchange format returned **nothing in this domain** — the hits were PLCopen TC6
  (industrial control) and IP-XACT (chip design), both of which are, ironically, exactly the
  kind of vendor-neutral XML schema this segment lacks.

Everything else — OBS scene collections and profiles, vMix presets, ATEM macros and MV
layouts, TriCaster sessions, mimoLive documents, Companion button pages — is a vendor-private
file or database with no published schema another vendor's tool could read or write.
**This remains the single largest structural finding of this dossier.**

Cross-references: TSL UMD tally in [`landscape/tally.md`](tally.md); Ember+, ST 2110 and
network design in [`landscape/networking.md`](networking.md); CasparCG and playout in
[`landscape/media-playback.md`](media-playback.md); camera/CCU protocols in
[`landscape/camera-control-rcp.md`](camera-control-rcp.md).

---

## What this segment does WELL

Patterns worth stealing, each grounded in something verified above.

**1. Machine-readable live state is table stakes, and it comes in exactly two shapes.**
Every serious product publishes its state, not just accepts commands:

- **Full-state document, polled** — vMix `XML`, TriCaster `dictionary?key=…`. Simple, always
  consistent, scales badly (vMix's own ecosystem warns about document size).
- **Delta events, subscribed** — obs-websocket events, vMix `ACTS`, Videohub blocks, mimoLive
  JSON:API socket. Scales well, needs careful initial-state handling (vMix must explicitly
  request `ACTS BusASolo…` on connect precisely because subscription gives no baseline).

TriCaster's hybrid is the best of the three: **the socket says which key changed, the HTTP GET
says what it now is.** Push latency, pull consistency, no delta-application bugs.

**2. Discovery is normal, and typing an IP address is considered a defect.** Bonjour/mDNS
appears in Videohub, Ecamm (`ecammliveremote`), Companion (`BonjourDiscovery`,
`MdnsAdvertise`), NDI, OMT (DNS-SD) and NMOS IS-04. `cable-planner` already has
`atem:discover` and `videohub:discover`. **The bar is that the tool finds the device; the user
confirms it.**

**3. Stable identity beats positional identity — where anyone bothered.** vMix addresses inputs
by `input.key`, so renaming and reordering do not break control surfaces. mimoLive offers a
stable per-object endpoint alongside index addressing. Videohub carries labels as routable
state. Where products got this wrong the pain is visible: mimoLive's "first document opened is
index 1", Wirecast's "Shot 1 is black", Companion's `page/row/column`.

**4. Bidirectionality is assumed. A control surface that cannot show state is not a control
surface.** Every Companion module ships *feedbacks* as well as *actions*, and tally is the
canonical feedback. vMix goes furthest: tally distinguishes direct program from
program-as-a-layer, with six visual treatments. Skaarhoj puts red/green tally directly on the
camera-select buttons of a physical panel (**FACT (search)**).

**5. Health telemetry rides the control channel.** OBS exposes `kbits_per_sec`,
`render_missed_frames`, `output_skipped_frames`, `free_disk_space`, `cpu_usage`; Streamlabs
exposes dropped-frame percentages; Teradek exposes drive usage; Haivision exposes per-encoder
bitrate/codec/resolution. **The same socket that switches sources also tells you the machine is
about to die.** Practitioners clearly use it that way.

**6. Protocol versioning is designed in, at least by the good ones.** obs-websocket negotiates
`rpcVersion` and closes cleanly on mismatch. The ATEM libraries branch on protocol version
inside `serialize()` and publish a firmware-support tier list. TriCaster's module probes a data
key rather than a version endpoint so old firmware still connects. Contrast: Livestream
Studio's hard-locked port 9923.

**7. Text protocols age extraordinarily well.** Videohub (a 1990s design idiom, still perfect),
AMCP (in 24/7 production since 2006, with proper 2xx/4xx/5xx status codes), Voctomix's command
set. All human-typeable over `nc`, all debuggable without tooling, all still in service. The
binary undocumented one (ATEM) is the one that breaks on firmware updates.

**8. A free, MIT-licensed, community-maintained integration layer exists and everyone uses
it.** Companion with 700+ modules is a genuine public good: **you do not have to integrate with
N switchers — you have to be legible to Companion.** Companion 4's move to modular *surface*
support is the same lesson applied internally: make the plug-in boundary the release boundary.

**9. Offline-first is the default for the on-prem tier, without anyone making a fuss about
it.** OBS, vMix, ATEM, Videohub, TriCaster, mimoLive, Ecamm, Voctomix, CasparCG and Companion
all operate with zero internet. VDO.Ninja — a *WebRTC* product — ships a dedicated offline
deployment repository with a Docker option for venues with no internet (**FACT (search)**).

**10. The open-source tier is credible, not a toy.** Voctomix runs the Chaos Communication
Congress. CasparCG has been in broadcast since 2006 and is GPLv3. OBS is the baseline and is
now shipping WebRTC simulcast before most commercial products. OMT shipped a royalty-free NDI
competitor with a working codec, a Pi encoder and adoption inside a commercial switcher's
recording path within about a year.

**11. The cheap tier keeps eating the expensive tier's features.** ISO recording of 8 inputs at
US$1,995 (ATEM Mini Extreme ISO G2); 32 native ST 2110 inputs from Blackmagic; replay as a
standard feature in Streamstar SW; software-defined switching (Kairos, M2L-X, Carbonite Code,
AMPP) replacing dedicated silicon. German trade press reports "already more software-based
production tools and growing interest in COTS, particularly in graphics and replay"
(**FACT (search)**, film-tv-video.de, 2026-03).

---

## What NOBODY in this segment solves well

The white space, in rough order of how directly it maps to an opportunity for this suite.

**1. Nothing here plans a system that does not exist yet.** Every product in this dossier
controls a *running* rig. Not one models an *intended* rig — the input list, the multiviewer
layout, the router plan, the tally map, the label scheme — as a document you can author
offline, review with a colleague, print, and hand to whoever patches the truck. NMOS IS-04
comes closest and is explicitly discovery-of-what-exists. **This is a gap in the entire
category, not in one product.**

**2. There is no interchange format for a production configuration.** One portable artefact was
verified in the whole segment: Videohub's routes-to-a-disk-file, format unknown, one vendor's
router. SMPTE BXF exists for playlists and as-run logs, not for gallery configuration. You
cannot diff two shows. You cannot template a show. You cannot generate a configuration from a
plan. You cannot check a configuration against a plan.

**3. Names live in five places and nothing reconciles them.** For one camera on a normal rig
the string "CAM 3" is independently stored in: the router's input label, the switcher's input
name, the multiviewer tile label, the tally system's mapping, and the encoder's stream name —
plus the rundown and the cable schedule. Every one is typed by hand, and they drift.
`cable-planner` already implements `atem:bulk-set-input-names` (**FACT (fetched)**, local
source), which is the right instinct and is, as far as this pass could determine, unusual.

**4. Multiviewer layout is unaddressed outside each vendor's own app — now explicitly
verified.** A dedicated search for a vendor-neutral multiviewer layout interchange format
returned nothing in this domain. Ross documents MV-Layout inside Acuity, Lawo inside VSM, and
ATEM, PRISMON, TAG and Bridge each have their own. OBS's "multiview" is a set of projector
windows. `cable-planner` reading and applying ATEM MV configuration (`atem:read-mv-config` /
`atem:apply-mv-config`, **FACT (fetched)**, local source) is a genuinely differentiated
capability with no commercial equivalent found this pass.

**5. Tally mapping is re-entered at every layer, and the newest protocol forgot it entirely.**
ATEM carries `TallyBySource` in-protocol; vMix computes layer-aware tally; TriCaster exposes
`dictionary?key=tally`; TSL UMD 3.1/5.0 exists as the interoperable standard and is what
Cyanview, Streamstar, Ross and third-party tally systems speak. But the mapping *from* switcher
source *to* physical camera *to* lamp *to* intercom panel *to* MV tile is rebuilt by hand in
every system. And **OMT — designed in 2025, with a metadata layer explicitly covering PTZ and
SDI ancillary data — does not define tally** (**FACT (fetched)**).

**6. Cloud products have anaemic control APIs; on-prem products have no collaboration.**
Restream's entire Companion surface is one action and one feedback. Singular is a token in a
URL. Grabyo has no module at all. Meanwhile OBS, vMix, ATEM and TriCaster have rich local APIs
and no concept of two people working on the same show configuration from different places.
**Nobody offers a rich control model *and* multi-user, multi-site configuration.**

**7. Authentication is routinely the thing you turn off to make integration work.** TriCaster:
*"turn off the LivePanel password."* mimoLive: *"authenticated connections are not supported,
so you will need to have the Remote Control options set to no password."* Livestream Studio: a
per-show-file toggle plus per-IP approval cleared on import. Only obs-websocket (SHA-256
challenge, on by default), Streamlabs (token) and Haivision (HTTPS REST) do this properly.
**The de-facto security model is "trust the production VLAN"** — an assumption nobody documents
and no tool validates.

**8. Nobody produces as-built documentation from the live system.** Every product knows its own
input names, routing, MV layout and output settings. None will give you a signal-flow diagram,
a label sheet, a patch list or a tally chart. The information exists; the export does not.

**9. REMI transport is solved; REMI *planning* is not.** SRT, RIST, NDI, OMT and WebRTC all
work, and the German public broadcasters ran the 2026 World Cup this way (below). But nothing
helps you decide how many OMT 1080p60 feeds fit on the venue's gigabit link, what latency
budget the SRT hop adds on top of the 200–500 ms band, or which of the three transports
survives the firewall. That arithmetic is done in heads and spreadsheets.

**10. The switching tier and the monitoring tier do not share anything.** Lawo vm_dmv, PRISMON,
TAG and Bridge each build a mosaic with labels and layouts; the switcher builds its own
multiview with its own labels; the tally system holds a third mapping. A UMD label on a
broadcast multiviewer and an input name on the switcher feeding it are the same string typed
twice. No product spans the two, and the buyers are different departments.

**11. Hardware and ecosystem lock-in is total at the control-app layer.** ATEM Software Control
talks to ATEMs. Videohub Control talks to Videohubs. TriCaster's panel talks to TriCasters.
Vendor-neutral control exists in exactly two places — **Companion** (free, MIT, community,
spatially addressed) and **Lawo VSM** (quote-only, broadcast-tier, project-engineered). There
is no vendor-neutral *planner* at either end.

**12. Pricing legibility is poor, and edition tiering makes it worse.** Prices in this segment
range from free to US$1,260/month for functionally overlapping products, and the vendor tier
above that publishes nothing. Worse, in the tiered products an action can exist in the protocol
and fail on your licence (vMix editions). Comparing total cost across two candidate
architectures — say "ATEM Mini Extreme ISO G2 + free software" versus "vMix Pro on a PC" versus
"TriCaster Vectar subscription" — is real work, and no tool helps.

---

## Relevance to AV Planner Suite

Ordered by directness. Repository capabilities cited as **FACT (fetched)** were read from local
source.

### cable-planner — highest relevance, and already partly executing on it

`cable-planner` is *"a node-based editor for AV, Network and Power Signal flow, ATEM
multiviewer layouts and Blackmagic Videohub routing"* (**FACT (fetched)**, README), and the
code backs it: `src/main/ipc/atemIpc.ts` implements `atem:connect`, `atem:state`,
`atem:set-input-name`, `atem:bulk-set-input-names`, `atem:read-mv-config`,
`atem:apply-mv-config`, `atem:read-audio-config`, `atem:apply-audio-config`, `atem:discover`;
`src/main/ipc/videohubIpc.ts` implements `videohub:send`, `videohub:read-state`,
`videohub:discover` with the comment that the protocol is always port 9990.

That sits precisely on white-space items **1, 3, 4 and 10**. What this research suggests next:

- **Videohub label round-tripping.** The protocol carries `INPUT LABELS`, `OUTPUT LABELS`,
  `MONITORING OUTPUT LABELS` and `SERIAL PORT LABELS` as first-class writable state, plus
  rename operations and a read/write-routes-to-disk-file feature. A planner that owns the
  naming scheme and pushes it to both the ATEM (already implemented) *and* the Videohub closes
  the "names live in five places" gap for the two most common Blackmagic devices.
- **Model the MV layout as a portable document, not just an ATEM push.** The MV read/apply pair
  is the differentiator, and the vendor-neutral-MV-format search coming up empty confirms there
  is no incumbent to displace. An exportable MV layout that can target ATEM today and PRISMON
  or vm_dmv later is a defensible position.
- **Add OMT, NDI and SRT as first-class link types in the signal-flow model,** each carrying a
  bandwidth and latency budget: OMT 1080p60 high ≈ 260 Mbps, NDI full ≈ 1–3 frames LAN latency,
  NDI|HX ≈ 100+ ms, SRT ≈ 200–500 ms tunable. That makes white-space item **9** addressable:
  a planner that knows a link is OMT-1080p60 can warn that four of them do not fit on a gigabit
  trunk. Connects to [`landscape/networking.md`](networking.md).
- **Model licence tiers as a planning constraint.** vMix editions gate features that exist in
  the protocol; a planner that knows "this action needs vMix Pro" would be the only tool in the
  market that catches that before show day. (**INFERENCE** on value; the tiering itself is
  **FACT (search)**.)
- **Consider a Companion-facing export.** Companion is the segment's integration standard and
  its address space is `page/row/column` with no semantic layer. A planner that already knows
  "CAM 3 is ATEM input 4, Videohub output 7, MV tile 5" holds exactly the mapping Companion
  lacks. Whether Companion has an importable page format is still **UNKNOWN** and is the first
  thing to check.
- **Protocol facts worth encoding in the device library:** ATEM UDP 9910, Videohub TCP 9990,
  vMix TCP 8099 **and** Web Controller HTTP 8088 (flag the collision), OBS WS 4455, TriCaster
  HTTP/WS, Streamlabs 59650, Livestream Studio 9923 (locked), Companion Ember+ 9092 and
  Satellite 16622/16623, Voctomix 9999 + net clock UDP 9998. These are port-level facts a
  cable/network planner can validate against a VLAN plan.

### tally-pi — high relevance

Built on Companion, drives ATEM tally to GPIO and browser pages (**FACT (fetched)**, README).

- **`TallyBySourceCommand` is in the ATEM protocol**, confirming the architecture tally-pi uses
  is the right one.
- **TSL UMD 3.1 / 5.0 is the interoperable standard** and is what the rest of the tally world
  speaks — Cyanview ingests it, Streamstar and Ross emit it, Cuebi and tvONE consume it
  (**FACT (search)**). If tally-pi does not speak TSL in, it is isolated from every non-ATEM
  switcher; if it does, it inherits the whole market.
- **OMT does not define tally metadata** (**FACT (fetched)**). OMT's metadata layer is
  timestamped bidirectional XML with existing `<OMTWeb>`, `<OMTPTZ>` and `<AncillaryData>`
  elements; a proposed `<OMTTally>` would be a small, well-scoped, high-visibility open-source
  contribution — and vMix 29 shipping OMT means there would be a real consumer for it.
- **`omtcapture` / `omtplayer` are Raspberry Pi 5 OMT encoder and decoder projects**, with
  `omtcase` providing a Pi 5 + PoE HAT case. Same hardware class tally-pi targets; suggests an
  adjacent appliance that is simultaneously a tally endpoint and an OMT source.

### sony-camera-bridge — high relevance

The bridge already normalises VISCA, Sony 700PTP, CCAPI, Lumix, Blackmagic REST, Z CAM,
Panasonic AW and JVC (**FACT (fetched)**, README).

- **The ATEM protocol carries `CameraControlCommand`** — on an ATEM rig the switcher *is* a
  camera-control transport, so "switcher" and "camera control" are not separable planning
  concerns.
- **OMT recommends `<OMTPTZ Protocol="…"/>` carrying Sony VISCA over the video transport.** If
  a camera arrives as an OMT source, its PTZ control channel arrives with it. MIT-licensed,
  with .NET, C, C++ and Rust implementations available.
- **Cyanview (BE) and Skaarhoj (DK) are the incumbents to study** for how camera control, tally
  and switcher integration are packaged together in one panel (**FACT (search)**). Both are
  small European vendors solving exactly the adjacency this bridge sits in.

### multicam-planner — medium relevance

The missing link between camera planning and gallery planning is the **camera → switcher input
→ MV tile → tally destination** mapping. multicam-planner owns the camera identity;
cable-planner owns the switcher and router. One canonical camera identity shared across the
suite is what closes white-space item **3** properly, rather than device by device.

### broadcast-intercom — medium relevance

Already ships a Companion module and a REST control endpoint (**FACT (fetched)**, README), so
it is already legible to the segment's integration standard. The unclaimed piece is the
**tally ↔ intercom link**: which panel hears which camera's tally. That is white-space item
**5** and no product in this dossier owns it. Riedel is the vendor that owns both sides
commercially (Bolero intercom and SimplyLive production) and is worth watching for exactly
this integration.

### shell / suite — medium relevance

- **Companion is the integration target that matters.** Being exportable-to or drivable-from
  Companion reaches 700+ devices without writing 700 integrations.
- **The corpus's strongest single finding — no interchange format for production configuration
  — is a suite-level opportunity, not a per-planner one.** A shared, documented, versioned
  project format carrying the show's identities (cameras, inputs, routes, labels, MV layout,
  tally map) across cable-planner, multicam-planner and broadcast-intercom is the thing the
  entire commercial segment lacks. SMPTE BXF is the precedent for "an XML interchange standard
  the broadcast industry actually adopted", and it exists for playlists precisely because
  somebody wrote it.
- **Price positioning constraint:** the reference price for "an application that controls my
  switcher" is **zero** (ATEM Software Control, Videohub Control, OBS, Companion). Any paid
  suite has to be priced against *planning* value, not *control* value.

### pi-media-station — low-to-medium relevance

Not a switching product, but `omtcapture`, `omtplayer` and `omtcase` are the same pattern — a
purpose-built Pi 5 media appliance with a web admin — and are worth reading as prior art for
the appliance/admin split.

### light-planner — low relevance

The only real touchpoint is **Art-Net**, which Companion accepts as an inbound control service
(**FACT (fetched)**, `lib/Service/Artnet.ts`) — a lighting console can already trigger video
actions through Companion. Cross-domain cue triggering is covered in
[`landscape/show-control.md`](show-control.md).

---

## The German / European view

The brief asked for German-language and European sources specifically. What they show:

**Remote production went mainstream at the top of the German market in 2026.** For the FIFA
World Cup 2026, **ARD and ZDF forwent their own OB trucks on site for German team matches for
the first time**, deploying instead an **MPE Venue Kit** developed by a joint ARD/ZDF planning
group and booking host-broadcaster (HBS) infrastructure as modular elements to minimise their
on-site footprint. ZDF's production is anchored at its **National Broadcast Centre in Mainz**,
receiving signals via **MTI Teleport München** (**FACT (search)**, film-tv-video.de 2026-06-25
and SVG Europe). A widely-cited REMI staffing figure in the same period: where 15–20
technicians were previously required on site, 2–3 now suffice (**FACT (search)**, secondary
trade source — treat as indicative, not measured).

**The German trade press reads the direction as software-defined and COTS.** film-tv-video.de
(2026-03) reports more software-based production tools and growing COTS interest, particularly
in graphics and replay; Blackmagic's roadmap coverage (2026-04) foregrounds immersive live
production and high-frame-rate replay. **Broadcast Solutions** (DE) showed a mobile edge
production vehicle at IBC 2026 built on **Grass Valley AMPP** — a German OB integrator shipping
a truck whose production core is cloud-native software (**FACT (search)**).

**European vendors are disproportionately strong in this segment**, and mostly not in the
software-switcher tier:

| Vendor | Country | What they own |
| --- | --- | --- |
| Lawo | DE | VSM (vendor-agnostic control), vm_dmv (IP multiviewer), HOME, .edge |
| Rohde & Schwarz | DE | PRISMON software multiviewer/monitoring |
| Riedel | DE | SimplyLive production suite, RiMotion replay, Bolero intercom |
| Boinx Software | DE | mimoLive |
| C3VOC / CCC | DE | Voctomix (runs the Chaos Communication Congress) |
| Broadcast Solutions | DE | OB vehicles built on software-defined cores |
| Bitfocus | NO | Companion — the segment's integration standard |
| Bridge Technologies | NO | VB440 ST 2110 monitoring |
| SVT | SE | CasparCG |
| Skaarhoj | DK | Blue Pill / Reactor control panels |
| Cyanview | BE | Universal RCP with TSL tally ingest |
| Streamstar | SK | Flight-case live sports production systems |

The German-language buyer-facing comparisons that surfaced (Capterra DE, OMT.de, streamyard.com
German blog) are consistently **OBS vs vMix vs a browser studio** — i.e. at the SME/event end
the German market frames the choice exactly as the English-language market does, with
StreamYard positioned as the no-install default and vMix as the answer when you need real
replay and multi-camera switching (**FACT (search)**). No German-language equivalent of vMix
exists; the German contribution to this segment is control, monitoring and infrastructure, not
the switcher application.

---

## Pricing notes

All prices seen **2026-08-29**. **No vendor pricing page was directly fetchable** (see access
note), so each figure is **FACT (search)** — reported by a search summary citing the URL given.
"Advertised" means the source presents it as a published list price; "sales contact" means no
public price exists.

| Product | Price seen | Model | Advertised / sales contact | Source cited by the summary |
| --- | --- | --- | --- | --- |
| OBS Studio | 0 | GPL-2.0-or-later, free | Advertised (licence file) | `github.com/obsproject/obs-studio` |
| Bitfocus Companion | 0 | MIT, free | Advertised (repo) | `github.com/bitfocus/companion` |
| CasparCG Server | 0 | GPLv3-or-later | Advertised | `github.com/svt/casparcg-server` |
| OMT / VMX | 0 | MIT, royalty-free | Advertised (repo) | `github.com/openmediatransport/libvmx` |
| SRT | 0 | MPL-2.0 | Advertised (repo) | `github.com/Haivision/srt` |
| vMix Basic HD | USD 60 | Perpetual + 12 months updates | Advertised | `vmix.com/purchase` (via summary) |
| vMix HD | USD 350 | Perpetual | Advertised | as above |
| vMix 4K | USD 700 | Perpetual | Advertised | as above |
| vMix Pro | USD 1,200 | Perpetual | Advertised | as above |
| vMix update renewal | USD 60 / 12 months | Add-on | Advertised | `blog.vmix.com/vmix-29-is-available-now/` |
| vMix Max | USD 50 / month | Subscription, Pro-equivalent with continuous updates | Advertised | as above |
| Wirecast Studio | ~USD 216 (upgrade context) | Perpetual (perpetual licences reinstated) | Advertised, **weak** | `news.broadfield.com`, reseller listings |
| Wirecast Pro | ~USD 416 (upgrade context); Studio→Pro upgrade USD 189.90 | Perpetual | Advertised, **weak** | `avalive.com`, `fullcompass.com` |
| Wirecast support renewal | USD 99 / year | Maintenance | Advertised, **weak** | as above |
| mimoLive Non-Profit | GBP 159 / year | Annual licence | Advertised (UK reseller) | `application-systems.co.uk` |
| mimoLive Studio | GBP 569 / year | Annual licence | Advertised (UK reseller) | as above |
| mimoLive Broadcast | GBP 1,639 / year | Annual licence | Advertised (UK reseller) | as above |
| Ecamm Live Standard | USD 20 / month, USD 16 / month annual (USD 192 / yr) | Subscription, 14-day trial | Advertised | `ecamm.com` pricing (verified by source 2026-06-11) |
| Streamlabs Ultra | USD 27 / month or USD 189 / year | Subscription | Advertised | aggregator summaries |
| Restream | Free / USD 16 / USD 39 / USD 199 per month | Subscription | Advertised | `restream.io` pricing (via summary) |
| StreamYard | Free / USD 44.99 / USD 88.99 / USD 299 per month (annual USD 35.99 / 68.99) | Subscription | Advertised | `streamyard.com` + Tekpon |
| Singular.live | USD 0 trial (watermarked); from ~USD 36 / month; 3/7/30-day event pricing | SaaS | Advertised | `singular.live/pricing` |
| Grabyo | "starting price USD 150"; custom enterprise plan | SaaS | **Weak** — aggregator only | GetApp / Capterra |
| TriCaster Vectar | **USD 1,260 / month MSRP** | "Flexible Access" subscription | Advertised | `vizrt.com` product pages |
| ATEM Constellation 4K | from **US$1,795** | Hardware purchase, software bundled free | Advertised | `blackmagicdesign.com` (via summary) |
| ATEM Mini Extreme ISO G2 | **US$1,995** (one retailer US$2,195) | Hardware purchase | Advertised | Sweetwater / Creative COW / B&H |
| DaVinci Resolve Studio | US$295 one-time | Perpetual (relevant to Blackmagic Cloud collaboration) | Advertised | via summary |
| Blackmagic Cloud free tier | 0 for up to 20 Presentations, 30 collaborators | Freemium | Advertised | via summary |
| Kairos, M2L-X, Carbonite, AMPP, Lawo VSM/vm_dmv, Riedel SimplyLive, TAG, PRISMON, VB440, PRISM, Haivision, Teradek, LiveU | no public price | Quote | **Sales contact** | vendor product pages, none list a price |

**Structural reading of the above** (**INFERENCE**):

1. **Free and genuinely open** — OBS, Companion, OMT/VMX, SRT, CasparCG, Voctomix, VDO.Ninja,
   OvenMediaEngine. Not a crippled tier; a large share of production happens here.
2. **Free because the hardware was bought** — ATEM Software Control, Videohub Control.
   Blackmagic's control software is a cost of selling the switcher. **The reference price for
   "an application that controls my switcher" is zero.**
3. **Paid desktop licence, edition-tiered** — vMix, Wirecast, mimoLive, Ecamm. Tiering is
   feature-based, and in vMix's case **the API surface and the licensed surface differ**: an
   action can exist in the protocol and fail on your licence.
4. **Subscription is winning in the middle and the top.** vMix added Max at USD 50/month
   alongside perpetual; Wirecast reinstated perpetual after going subscription-only; TriCaster
   Vectar is subscription-only at USD 1,260/month; Grass Valley sells AMPP as SaaS. The market
   has not settled, and vendors are hedging in both directions.
5. **Quote-only appliance and broadcast tier** — Kairos, M2L-X, Ross, AMPP, Lawo, Riedel, and
   the entire monitoring tier. No list price is expected to become public.
6. **Hardware lock-in is mostly *soft*, and cheapening.** The ATEM ecosystem's lock-in is the
   protocol, not the price: US$1,995 buys 8-input ISO recording. What locks you in is that the
   control app, the macros, the MV layout and the tally map only exist inside that vendor's
   world.

**Re-check list before any of these numbers is used commercially:** `vmix.com/purchase`,
`telestream.net/wirecast/store.htm`, `mimolive.com/store/`, `ecamm.com` pricing,
`restream.io/pricing`, `streamyard.com/pricing`, `singular.live/pricing`,
`vizrt.com/products/tricaster/tricaster-vectar/`, `blackmagicdesign.com` product pages. All
were `EGRESS_BLOCKED` on 2026-08-29.

---

## Offline notes

This is the segment's strongest characteristic and it deserves to be stated precisely.

**Fully offline / LAN-only capable** (each verified by the transport its control path uses):

| Product | Evidence |
| --- | --- |
| OBS Studio | Local WebSocket server on 4455; no network dependency |
| vMix | TCP 8099 on the LAN; Web Controller on 8088 |
| ATEM Software Control | UDP 9910 direct to the switcher |
| Videohub Control | TCP 9990 + Bonjour |
| TriCaster (on-prem) | HTTP + WS to the appliance on the LAN |
| mimoLive | Local REST + WS |
| Ecamm Live | Bonjour + local HTTP (streaming destinations are cloud) |
| Streamlabs Desktop | Local API on 59650; product itself is account-centric |
| Livestream Studio 6 | TCP 9923 on the LAN |
| Bitfocus Companion | Entirely LAN; mDNS discovery; no cloud requirement |
| CasparCG | AMCP over TCP |
| Voctomix | TCP 9999 + GStreamer net clock UDP 9998 |
| Haivision / Teradek / Kiloview | Device-local HTTP/REST |
| OvenMediaEngine | Self-hosted |
| Panasonic KAIROS, Ross Carbonite, Lawo, Riedel, R&S PRISMON, TAG, Bridge VB440 | On-prem appliances by design |
| OMT | DNS-SD or a local TCP discovery server — deliberately LAN-scoped |

**Not offline:**

| Product | Evidence |
| --- | --- |
| Restream | Cloud REST + OAuth 2.0 only (**FACT (fetched)**) |
| Singular.live | Control API is `app.singular.live/apiv2/control/<token>` (**FACT (fetched)**) |
| StreamYard | Browser studio (**FACT (search)**) |
| Grabyo | Cloud-native platform (**FACT (search)**) |
| Grass Valley AMPP / GV Hosted | Cloud-native, AWS-hosted (**FACT (search)**) |
| Sony M2 Live / M2L-X | Public-cloud deployment today; COTS/private cloud stated as a future update (**FACT (search)**) |
| Blackmagic Cloud | Cloud sync service (**FACT (search)**) |

**The notable middle case: VDO.Ninja.** A WebRTC product — normally cloud-dependent by
definition — that ships a dedicated offline deployment repository with a Docker option *"for
users wishing to host VDO.Ninja offline (where no Internet is available)"* (**FACT (search)**),
with self-hosted TURN documented and the author's estimate that only ~5% of remote guests need
a TURN server (**FACT (fetched)**, pass 1 — the author's estimate, not a measurement).

**Implication for the suite:** offline-first is not a differentiator in this segment — it is
the norm, and the AV Planner Suite's offline-first stance simply matches the buyer's
expectation. The differentiator is that **nothing offline here is collaborative, and nothing
collaborative here is offline.** `cable-planner`'s `sync:*` / `signaling:*` /
`collabDiscovery:*` IPC domains (**FACT (fetched)**, local source) sit exactly in that gap:
LAN-local multi-user, no cloud dependency.

---

## API notes

- **Everything real has a LAN API.** Twenty control protocols are tabulated above with specific
  ports and message formats. A product without one (Wirecast, effectively) is visibly
  disadvantaged — its Companion module needs a third-party bridge application to exist at all.
- **Transport preference, ranked by what was found:** plain-text TCP (Videohub, AMCP, Voctomix,
  vMix, Livestream Studio) → HTTP/REST (TriCaster, mimoLive, Haivision, Kiloview, Ecamm) →
  WebSocket for state (obs-websocket, TriCaster, mimoLive) → proprietary binary UDP (ATEM, the
  outlier and the one that breaks on firmware updates).
- **Two state-distribution patterns, both worth implementing:** full-document poll (vMix XML,
  TriCaster dictionary) and subscribe-to-deltas (obs-websocket events, vMix ACTS, mimoLive
  socket). TriCaster's *change-notify-then-refetch* hybrid is the most robust of the three.
- **Auth is the weak point.** obs-websocket does SHA-256 challenge/salt with auth on by
  default; Streamlabs uses a token; Haivision uses HTTPS REST. TriCaster and mimoLive require
  authentication to be **disabled** for the documented integration path. Livestream Studio's
  approval state is per-show-file and is cleared on import.
- **Versioning is uneven.** obs-websocket negotiates `rpcVersion` and closes cleanly on
  mismatch; the ATEM libraries branch on protocol version per command and publish a
  firmware-support tier list; TriCaster probes a data key so old firmware still connects;
  Livestream Studio hard-locks its port.
- **Idempotence and acknowledgement:** Videohub is the only protocol read with explicit
  `ACK`/`NAK` per command block; AMCP is the only one with a proper 2xx/4xx/5xx status-code
  space. Most others are fire-and-forget with state reconciliation as the only confirmation.
- **Control surfaces are converging on one attachment protocol.** Companion 4 routes even the
  first-party Elgato Stream Deck plugin through the **Satellite API** (TCP 16622) so all
  surfaces behave identically, and Sony's M2L-X lists Stream Deck as a supported control
  surface alongside its own ICP-X panel (**FACT (search)**). A broadcast switcher naming a
  USD 150 consumer keypad as an official control surface is a genuinely new development.
- **The escape hatch is universal and telling:** obs-websocket has `CallVendorRequest`,
  TriCaster has "Custom Shortcuts", mimoLive has "Trigger a Generic Endpoint", vMix accepts
  arbitrary `FUNCTION` strings, Companion has generic HTTP/OSC/TCP/UDP modules. **Every
  well-designed control API in this segment ships a documented way to send something its
  designers did not anticipate.** Worth copying in any IPC surface.

---

## Not opened / unverified

Named in the brief or encountered during research but **not** verified to a standard worth
quoting. Listed so the pass can be re-run.

- **All vendor pricing pages.** Every one was `EGRESS_BLOCKED`. Prices above are search-summary
  restatements. The vMix band has two conflicting readings in the wild; the Wirecast figures
  are the weakest in the table.
- **Panasonic KAIROS control API.** No Companion module opened, no API doc reachable. Feature
  claims are search-summary level only.
- **Grass Valley AMPP, Sony M2L-X, Ross Carbonite, Riedel SimplyLive, Streamstar, Lawo VSM,
  TAG, PRISMON, VB440, PRISM** — described from vendor-marketing summaries only. No API,
  data-model or file-format claim is made for any of them.
- **LiveU** — no Companion module found; vendor site unreachable. Only the LU900Q product name
  and bonded-cellular positioning are recorded.
- **NDI Tools** — `docs.ndi.video` blocked. The licensing split (royalty-free SDK vs
  royalty-based Advanced SDK) and the 6.3 cloud-transport claim are search-summary level.
- **Sienna** — `companion-module-sienna-ndimonitor` exists; its `HELP.md` was not retrievable.
  No capability claim made.
- **Companion configuration export/import format** — still not investigated. First thing to
  check for any export idea.
- **Videohub routes-file format** — the feature is confirmed; the format is unknown.
- **OMT bandwidth figures** — 260 Mbps / 22.5 Mbps were read in pass 1 from the organisation
  profile README. `libomtnet/PROTOCOL.md` returned 404 at the path tried this pass, so these two
  numbers carry one open re-check.
- **libRIST** — not opened. SRT was verified; RIST is search-summary level.
- **SMPTE ST 2110 / ST 2022-7 specifications** — paywalled, not opened. Only NMOS IS-04 was
  verified from source; IS-05 was not.
- **Grabyo pricing** — aggregator-only "from USD 150". Weak; do not use.
- **Boinx Software's exact location** — company name and GmbH form are confirmed; the Puchheim
  address is not verified from a reachable source.

---

## Sources

### Pages fetched directly this pass (full content read)

- https://raw.githubusercontent.com/obsproject/obs-websocket/master/docs/generated/protocol.md
- https://github.com/bitfocus/companion
- https://github.com/bitfocus/companion-module-studiocoast-vmix
- https://github.com/bitfocus/companion-module-bmd-videohub
- https://github.com/nrkno/sofie-atem-connection
- https://github.com/CasparCG/help/wiki/AMCP-Protocol
- https://github.com/openmediatransport/libvmx
- https://github.com/openmediatransport/libomtnet
- https://github.com/josephdadams/TallyArbiter
- https://raw.githubusercontent.com/openmediatransport/libomtnet/main/PROTOCOL.md (HTTP 404)

### Pages fetched directly in pass 1 (repository-reading pass, same date)

`obsproject/obs-studio`, `obsproject/obs-websocket`, `bitfocus/companion` (`lib/Service/*`),
`bitfocus/companion-module-obs-studio`, `-studiocoast-vmix`, `-bmd-atem`, `-bmd-videohub`,
`-newtek-tricaster`, `-boinx-mimolive`, `-telestream-wirecast`, `-vimeo-livestreamstudio6`,
`-streamlabs-desktop`, `-ecamm-live`, `-singularlive-studio`, `-restream-api`,
`-haivision-makito-x4-encoder`, `-teradek-*`, `-kiloview-*`; `nrkno/sofie-atem-connection`;
`CasparCG/server`; `voc/voctomix`; `Haivision/srt`; `amwa-tv/nmos-discovery-registration`;
`DistroAV/DistroAV`; `openmediatransport/*` (`libvmx`, `libomtnet`, `Metadata`,
`OMTDiscoveryServer`, `omtcapture`, `omtplayer`, `omtcase`); `steveseguin/vdo.ninja`;
`OvenMediaLabs/OvenMediaEngine` (Docker Hub listing).

### Pages cited via WebSearch result summaries (page itself NOT fetchable from this environment)

Every URL below was named by a search result that this pass relied on. **None of them was
opened directly** — the egress proxy blocked them.

**vMix**
- https://www.vmix.com/purchase/
- https://www.vmix.com/knowledgebase/article.aspx/72/do-i-need-to-pay-a-subscription-to-use-vmix
- https://blog.vmix.com/vmix-29-is-available-now/
- https://wp.vmix.com/help28/TCPAPI.html
- https://www.vmix.com/help25/WebController.html
- https://vmixapi.com/
- https://usbroadcast.co/product/vmix-hd/
- https://www.coremicro.com/blogs/news/vmix-software-comparison-table

**OBS / open source**
- https://obsproject.com/blog/obs-studio-32-0-release-notes
- https://obsproject.com/blog/obs-studio-32-2-release-notes
- https://obs-versions.com/version/32.2.0
- https://obsproject.com/forum/resources/source-record.1285/
- https://github.com/exeldro/obs-source-record
- https://github.com/exeldro/obs-source-record/issues/169
- https://github.com/svt/casparcg-server
- https://docs.vdo.ninja/
- https://github.com/steveseguin/vdo.ninja
- https://docs.ovenmediaengine.com/
- https://github.com/OvenMediaLabs/OvenMediaEngine
- https://www.pistack.xyz/posts/2026-06-04-srs-ovenmediaengine-node-media-server-self-hosted-streaming-guide/

**Companion / control surfaces**
- https://companion.free/whats-new/v4-3-0/
- https://companion.free/for-developers/Satellite-API/
- https://github.com/bitfocus/companion-satellite
- https://www.skaarhoj.com/rc-sk5
- https://wiki.skaarhoj.com/books/blue-pill-reactor
- https://support.cyanview.com/docs/Configuration/Tally
- https://support.cyanview.com/docs/Integrations/Blackmagic/ATEM
- https://support.cyanview.com/docs/Integrations/VMix/

**Blackmagic**
- https://www.blackmagicdesign.com/products/atemconstellation/features
- https://www.blackmagicdesign.com/products/atemconstellation/techspecs
- https://www.blackmagicdesign.com/products/atemmini/techspecs
- https://www.blackmagicdesign.com/products/atemmini/software
- https://www.blackmagicdesign.com/developer/products/atem/sdk-and-software
- https://documents.blackmagicdesign.com/DeveloperManuals/ATEMSDKManual.pdf
- https://www.sweetwater.com/store/detail/ATEMMiniXG2--blackmagic-design-atem-mini-extreme-iso-g2-live-switcher
- https://nofilmschool.com/blackmagic-design-atem-4-m-e-constellation-ip-switcher-2676799770

**Vizrt / NDI**
- https://www.vizrt.com/products/tricaster/tricaster-vectar/
- https://www.vizrt.com/products/viz-vectar-plus
- https://www.vizrt.com/support/product-updates/viz-vectar-plus/viz-vectar-plus-1-4/
- https://docs.ndi.video/all/developing-with-ndi/sdk/licensing
- https://docs.ndi.video/all/using-ndi/ndi-tools/release-notes
- https://www.mylumens.com/en/Blog_detail/98/Lumens-Guide-to-NDIHX3

**Other vendors**
- https://www.telestream.net/wirecast/store.htm
- https://news.broadfield.com/telestream-wirecast-perpetual-licenses/
- https://www.fullcompass.com/prod/556044-telestream-wc-pro-upg-stu-wirecast-pro-for-upgrade-current-studio-to-pro
- https://mimolive.com/store/
- https://mimolive.com/store/studio-professional/
- https://mimolive.com/store/broadcasting/
- https://www.application-systems.co.uk/mimolive/variante1.html
- https://boinx.com/blog/post/mimolive-licensing-model/
- https://www.getapp.com/website-ecommerce-software/a/ecamm-live/
- https://streamyard.com/blog/streaming-software-price-comparison-streamyard-obs-streamlabs-riverside-restream
- https://tekpon.com/software/streamyard/pricing/
- https://hackceleration.com/labs/restream-pricing
- https://www.singular.live/pricing
- https://support.singular.live/hc/en-us/articles/360034139732-Pricing
- https://www.getapp.com/website-ecommerce-software/a/grabyo/
- https://vimeo.com/blog/post/livestream-com-discontinued
- https://pro-av.panasonic.net/en/products/it_ip_platform/at-kc1000.html
- https://eu.connect.panasonic.com/gb/en/broadcast-proav/itip-centric-video-platform-kairos
- https://pro.sony/ue_US/products/video-switchers/m2l-x
- https://www.tvtechnology.com/news/sony-ships-m2l-x-live-production-switcher
- https://www.rossvideo.com/products/production-switchers/carbonite-ultra/
- https://www.rossvideo.com/products/production-switchers/carbonite-code/
- https://help.rossvideo.com/carbonite-03/Topics/Operation/DashBoard/DashBoard.html
- https://help.rossvideo.com/acuity/Topics/Setup/Video/Output/MV-Layout.html
- https://www.grassvalley.com/ampp/
- https://www.grassvalley.com/gv-hosted/
- https://www.riedel.net/en/products-solutions/live-video-production/simplylive-production-suite/simplylive-production-suite
- https://www.riedel.net/en/products-solutions/live-video-production/rimotion
- https://www.streamstar.com/streamstar-x/
- https://eu.jvc.com/pro/production/live-production/streamstar%20SW/
- https://lawo.com/products/vsm/
- https://lawo.com/products/vm_dmv/
- https://docs.lawo.com/vsm-ip-broadcast-control-system/vsmstudio-user-manual/vsmstudio-modules/distributed-multi-viewer-module
- https://www.kiloview.com/en/product-center/
- https://www.kiloview.com/en/kiloview-new-release/
- https://www.liveu.tv/resources/blog/liveu-lineup-explained-selecting-the-best-unit-for-your-live-broadcast

**Monitoring**
- https://bridgetech.tv/products/vb440/
- https://tagvs.com/multiviewing/
- https://www.tvtechnology.com/infrastructure/tag-video-systems-to-show-low-latency-software-only-monitoring-at-ibc2026
- https://www.rohde-schwarz.com/us/products/broadcast-and-media/multiviewer/rs-prismon-multiviewer-solutions_63493-621122.html
- https://www.telestream.com/prism/
- https://www.dektec.com/products/applications/SdEye/
- https://www.drastic.tv/productsmenu-56/test-and-measurement/sdi-hdmi-scope
- https://www.sdi-analyzer.com/
- https://leaderphabrix.com/products/qx/
- https://craftwall.pro/en/articles/video-wall-for-broadcast-monitoring/

**Protocols and standards**
- https://www.rist.tv/articles-and-deep-dives/2026/6/1/2026-rist-vs-srt-comparison
- https://www.thebroadcastbridge.com/content/entry/21937/network-traffic-engineering-rist-srt-the-success-of-arq-based-protocols
- https://en.wikipedia.org/wiki/Broadcast_Exchange_Format
- https://github.com/josephdadams/ProTally
- https://josephdadams.github.io/TallyArbiter/docs/usage/sections/sources/
- https://www.cuebi.com/

**German-language and European sources**
- https://www.film-tv-video.de/productions/2026/06/25/wm-2026-ard-und-zdf-im-remote-modus/
- https://www.film-tv-video.de/business/2026/03/13/live-produktion-was-kommt-als-naechstes/
- https://www.film-tv-video.de/productions/2026/04/10/live-produktion-technik-zwischen-hochglanz-und-handyscreen/
- https://www.film-tv-video.de/equipment/2026/04/19/blackmagic-roadmap-immersive-live-produktion-und-high-frame-rate/
- https://www.svgeurope.org/blog/headlines/fifa-world-cup-2026-ard-and-zdf-on-using-teamwork-to-make-the-dream-work-with-their-smallest-ever-production-footprint-on-a-world-cup/
- https://www.mothergrid.de/broadcast/broadcast-solutions-auf-der-ibc-2026/
- https://www.capterra.com.de/compare/164144/210599/obs/vs/vmix
- https://www.omt.de/online-marketing-tools/vmix/alternativen/
- https://www.livestream-studio.com/die-beste-livestream-software-2026-vergleich-der-top-tools-fuer-jeden-anspruch/
- https://streamyard.com/de-de/blog/best-vmix-alternative
- https://www.capterra.com.de/software/177577/mimolive
- https://www.presseportal.de/pm/145466/6339396 (Hollyland IBC 2026)
- https://teltec.de/specials-ibc-neuheiten-2026/

### Local repositories read for the relevance section

- `/home/user/av-planner-suite/docs/research/METHOD.md`
- `/home/user/av-planner-suite/README.md`
- `/home/user/cable-planner/README.md`, `/home/user/cable-planner/CLAUDE.md`
- `/home/user/cable-planner/src/main/ipc/atemIpc.ts`
- `/home/user/cable-planner/src/main/ipc/videohubIpc.ts`
- `/home/user/multicam-planner/README.md`
- `/home/user/light-planner/README.md`
- `/home/user/Broadcast-intercom/README.md`
- `/home/user/tally-pi/README.md`
- `/home/user/sony-camera-bridge/README.md`
- `/home/user/pi-media-station/README.md`

### Verified blocked this pass (listed so the pass can be re-run)

`www.vmix.com`, `www.telestream.net`, `www.vizrt.com`, `docs.ndi.video`, `bitfocus.io`,
`www.bhphotovideo.com`, `www.saasworthy.com`. Pass 1 additionally recorded `obsproject.com`,
`www.haivision.com`, `en.wikipedia.org`, `bitfocus.github.io`, `apps.apple.com`, `flathub.org`,
`web.archive.org` as blocked and `www.npmjs.com` as HTTP 403.
