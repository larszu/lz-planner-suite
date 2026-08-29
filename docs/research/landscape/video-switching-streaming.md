# Live Video Production / Switching / Streaming / Signal Monitoring

> Research date: **2026-08-29** (brief dated 2026-08-28). Claims labelled per
> [`docs/research/METHOD.md`](../METHOD.md): **FACT** (read on a cited page or in cited
> source code), **INFERENCE** (my reasoning from evidence), **UNKNOWN / unverified**.

## Source-access caveat (read this before trusting anything below)

This pass ran under two hard limits, and they shape what this document can and cannot claim.

1. **WebSearch was unavailable.** The session's search budget (200/200 calls) was already
   exhausted by earlier segments before this dossier started. Zero searches were possible, in
   English or German.
2. **The egress proxy allows only code hosts and package registries.** Verified reachable this
   pass: `github.com`, `raw.githubusercontent.com`, `gitlab.com`, `pypi.org`,
   `hub.docker.com`. Verified **blocked** (`EGRESS_BLOCKED` at CONNECT): `vmix.com`,
   `obsproject.com`, `docs.ndi.video`, `haivision.com`, `en.wikipedia.org`, `bitfocus.github.io`,
   `apps.apple.com`, `flathub.org`, `web.archive.org`. `npmjs.com` returned HTTP 403.

The consequence is the same methodological trade the `landscape/tally.md` pass made, and it
works unusually well for *this* segment: **live production control is a segment whose
interfaces are all published as open source**, either as the product itself (OBS, CasparCG,
Voctomix, VDO.Ninja, OMT) or as the community control layer that wraps the closed products
(Bitfocus Companion's ~700 device modules). So instead of reading marketing pages, this
dossier was built by cloning and reading the actual source and shipped documentation of the
products, and of the modules that drive them. Twenty-three repositories were cloned or
fetched. Every protocol statement below — every port number, every command verb, every state
model — is taken from parser code, action definitions, or vendor-authored `HELP.md` shipped
inside those repositories, not from memory.

State this plainly:

- **There is not one verified price in this dossier.** Not one. No vendor pricing page was
  reachable, no App Store or Flathub listing was reachable, no archived copy was reachable,
  and no search summary of one existed. The *shape* of pricing is argued as **INFERENCE** in
  *Pricing notes*, and the *Price model* column of the product table is explicitly labelled
  as inference or unknown per row. Do not read the absence of a price as evidence that a
  product is quote-only.
- **Feature claims about closed products are control-surface claims.** When I say vMix has
  100% coverage of its shortcut functions, or that TriCaster exposes macros, that is evidence
  about *the API the product publishes*, read from the module that consumes it. It says
  nothing about video quality, stability under load, or how the UI feels at 02:00 in an OB van.
- Products named in the brief that I could **not** verify at all this pass are listed in
  *Not opened / unverified* at the end rather than described from memory. That list includes
  **Grabyo**, **LiveU**, **Blackmagic Cloud**, **NDI Tools** and **Sienna**.

One source deserves flagging up front because it carries disproportionate weight:
**`bitfocus/companion` and its ~700 device modules** are, collectively, the most honest
public map of which live-production products have a usable control API and which do not. A
product with a rich module has a rich API. A product whose module needs a third-party bridge
app (Wirecast) or offers one single action (Restream) is telling you something. That signal is
used repeatedly below and is always labelled as inference when I lean on it.

---

## Segment summary

This segment is the **live gallery**: the software and appliances that take N camera and
playback sources and produce one or more program outputs, in real time, with an operator (or
a macro) deciding what is on air right now.

Functionally it decomposes into five jobs. Almost every product in the segment does some
subset, and the interesting differences are in which subset and how they are exposed:

| Job | What it means | Who does it well |
| --- | --- | --- |
| **Switching** | Select PGM/PVW, transition, keyers, DSK, M/E, AUX | ATEM, TriCaster, vMix, OBS (studio mode) |
| **Compositing** | Layers, lower thirds, chroma key, virtual sets, graphics | vMix, mimoLive, CasparCG, Singular |
| **Monitoring** | Multiviewer, tally, scopes, audio meters, source health | ATEM MV, TriCaster, vMix, dedicated MV hardware |
| **Encoding / transport** | Stream out, contribute in, ISO record | OBS, vMix, Haivision, Teradek, SRT/NDI/OMT |
| **Control** | Macros, panels, remote operation, automation API | Companion, TriCaster macros, obs-websocket |

**Who buys it.** Four distinct buyers with very little overlap in what they will tolerate:

- **The creator / single operator** — buys OBS (free), Streamlabs, Ecamm, mimoLive. Cares
  about: works on my laptop, streams to my platform, cheap or free. Will not read a manual.
- **The house / venue / church / corporate AV** — buys ATEM + Videohub, vMix, TriCaster,
  Companion + Stream Deck. Cares about: a physical button surface, tally, reliability, and
  that a volunteer can run it. This is the segment's commercial centre of gravity
  (**INFERENCE** from the density of Companion modules aimed at exactly this tier).
- **The broadcaster / OB / systems integrator** — buys TriCaster/Viz Vectar, Grass Valley,
  Ross, Lawo, and increasingly IP-native ST 2110 + NMOS infrastructure. Cares about:
  redundancy, standards conformance, integration with automation and MCR.
- **The remote-production (REMI) operator** — buys SRT/NDI/WebRTC transport (Haivision,
  Teradek, LiveU, VDO.Ninja) plus one of the switchers above, run from somewhere else.

**Typical price band.** **INFERENCE**, since no price was verifiable this pass. The segment
has an unusually wide and *bimodal* distribution: a genuinely capable free tier (OBS,
Companion, CasparCG, Voctomix, VDO.Ninja, ATEM Software Control, Videohub Control — the
last two free *because the hardware was bought*), a mid tier of perpetual or subscription
desktop licences, and an upper tier of appliance and quote-only systems. The important
structural point is not the numbers but that **the control software is very often free and
the money is in the hardware, the platform, or the cloud subscription.** That is a pricing
pattern with direct consequences for anyone selling planning software into this world — see
*Pricing notes*.

---

## Product table

Columns are as specified in the brief. Read the **Price model** column with the source
caveat: every entry there is inference or unknown, never a verified figure.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **OBS Studio** | OBS Project (community) | Win / macOS / Linux (INFERENCE — README does not list platforms; build + plugin docs imply all three) | Free, GPL-2.0-or-later (**FACT**, README) | **Yes** — fully local, no account required (**FACT** — no network dependency in README; INFERENCE that no account is needed) | **Yes** — obs-websocket 5.x, 147 requests + 60 events, WS port 4455 (**FACT**) | Free, scriptable, infinitely extensible software switching |
| **vMix** | StudioCoast Pty Ltd (AU) | Windows (UNKNOWN this pass — not stated in any source read) | Paid, edition-tiered (**INFERENCE** from module's edition-dependent features) | **Yes** — pure LAN TCP control (**FACT**, port 8099) | **Yes** — TCP 8099 `FUNCTION`/`XML`/`SUBSCRIBE ACTS`; module claims 100% shortcut coverage (**FACT**) | Windows all-in-one: replay, ISO/Multicorder, NDI + OMT, PTZ, calls |
| **ATEM Software Control** | Blackmagic Design | Win / macOS (UNKNOWN — not read this pass) | Free with hardware (**INFERENCE**) | **Yes** — proprietary UDP to the switcher (**FACT**, port 9910) | Not officially published; reverse-engineered libraries exist with 169 command classes (**FACT**) | The free panel that ships with the most-deployed switcher hardware |
| **Videohub Control** | Blackmagic Design | Win / macOS (UNKNOWN) | Free with hardware (**INFERENCE**) | **Yes** — plain-text TCP, Bonjour discovery (**FACT**, port 9990) | **Yes** — documented-by-behaviour text block protocol with ACK/NAK (**FACT**) | Router control and label management, trivially scriptable |
| **TriCaster / Viz Vectar** | Vizrt (NewTek lineage) | Appliance + software (UNKNOWN) | Quote / appliance (**INFERENCE**) | **Yes** — HTTP + WebSocket on the LAN (**FACT**) | **Yes** — `http://<host>/v1/...`, `dictionary?key=...`, `ws://<host>/v1/change_notifications` (**FACT**) | Integrated production system: macros, DataLink, M/E, tally, DSK |
| **mimoLive** | Boinx Software (DE — Puchheim/Munich) | macOS (+ iPad/iPhone companion) (**FACT**, module HELP) | Paid (**INFERENCE**; subscription vs perpetual UNKNOWN) | **Yes** — local REST + WebSocket (**FACT**) | **Yes** — `/api/v1/documents/<id>/layers/<id>/...` REST + `ws://host:port/api/v1/socket` (**FACT**) | Clean document/layer/variant data model with a genuinely REST-shaped API |
| **Wirecast** | Telestream | Win / macOS (UNKNOWN) | Paid (**INFERENCE**) | **Yes** (**INFERENCE**) | **Weak** — Companion cannot talk to it directly; requires third-party `EventsController` bridge, then HTTP `/wirecast/layer/N/shot/N/autolive/0\|1` (**FACT**) | Established encoder/switcher; the control story is its weak point |
| **Livestream Studio 6** | Vimeo (Livestream) | Windows (**INFERENCE** from module text) | Paid (**INFERENCE**) | **Yes** — TCP on the LAN (**FACT**) | **Yes** — TCP port 9923, hard-locked, per-show-file enable + per-IP approval (**FACT**) | Legacy; module last touched 2022 (**FACT**), suggesting decline (**INFERENCE**) |
| **Ecamm Live** | Ecamm Network | macOS (**INFERENCE** — Bonjour-based Mac idiom, not stated) | Paid (**INFERENCE**) | **Yes** — Bonjour + local HTTP (**FACT**, service type `ecammliveremote`) | **Partial** — HTTP `http://host:port/<command>`; module states "not fully ready yet" (**FACT**) | Mac-native simple live streaming |
| **Streamlabs Desktop** | Streamlabs (Logitech) | Win / macOS (UNKNOWN) | Freemium (**INFERENCE**) | **Mostly** — local remote-control API, but product is account-centric (**INFERENCE**) | **Yes** — built-in remote control API, port 59650, token auth (**FACT**) | Creator streaming with a surprisingly complete local control API |
| **Restream** | Restream Inc. | Browser / cloud | Subscription (**INFERENCE**) | **No** — cloud REST + OAuth 2.0 only (**FACT**) | **Minimal** — one action ("Change Channel State"), one feedback (**FACT**) | Multistreaming distribution; not a control surface |
| **Singular.live** | Singular.live | Browser / cloud | Subscription (**INFERENCE**) | **No** — control API is `https://app.singular.live/apiv2/control/<token>` (**FACT**) | **Yes**, but cloud-hosted and token-scoped (**FACT**) | Cloud-rendered live graphics overlays |
| **Bitfocus Companion** | Bitfocus AS (NO) | Win / macOS / Linux / Raspberry Pi (**INFERENCE**; Docker + launcher present in repo) | Free, MIT (**FACT**, source headers) | **Yes** — entirely LAN, mDNS discovery, no cloud requirement (**FACT**) | **Yes, in every direction** — HTTP, OSC, TCP/UDP, Ember+ (9092), RossTalk, Art-Net, Satellite (16622/16623) (**FACT**) | Being the universal glue: ~700 device modules (**FACT**, README) |
| **CasparCG Server** | SVT / CasparCG community (SE) | Windows + Linux (**FACT**, README) | Free, open source (**FACT** — licence file not read) | **Yes** | **Yes** — AMCP text protocol (`PLAY`, `LOADBG`, `CG ADD`, ~30 `MIXER` verbs) + `OSC SUBSCRIBE` (**FACT**) | Broadcast playout and graphics; in 24/7 production since 2006 (**FACT**) |
| **Voctomix** | C3VOC / Chaos Computer Club (DE) | Linux (**INFERENCE** — GStreamer/GTK3/Python stack) | Free, open source (**FACT** — `LICENSE.txt` present, contents not read) | **Yes** — TCP control on the LAN (**FACT**, port 9999) | **Yes** — plain-text command protocol: `set_video_a/b`, `set_composite_mode`, `cut`, `transition`, `set_stream_blank` (**FACT**) | Deterministic, unattended, scripted conference recording |
| **VDO.Ninja** | Steve Seguin (community) | Browser (+ iOS/Android apps) (**FACT**) | Free, self-hostable (**FACT**) | **Yes** — dedicated `offline_deployment` repo with Docker option (**FACT**) | **Yes** — IFRAME API, WHIP/WHEP client, self-hosted TURN/SFU (**FACT**) | Getting remote guests and phone cameras into a switcher over WebRTC |
| **OvenMediaEngine** | AirenSoft (KR) | Linux / Docker (**FACT**) | Free tier (paid tier UNKNOWN) | **Yes** — self-hosted (**FACT**) | **Yes** — REST API (**FACT**) | Sub-second WebRTC / LL-HLS delivery with SRT + WHIP ingest |
| **Haivision Makito X4** | Haivision (CA) | Hardware encoder/decoder | Quote (**INFERENCE**) | **Yes** — device-local REST over HTTP/HTTPS (**FACT**) | **Yes** — REST API: encoder state, bitrate, codec, up to ten streams, presets (**FACT**) | Hardened SRT contribution encoding |
| **Teradek Prism / VidiU** | Teradek (Vitec) | Hardware encoder | Quote / retail (**INFERENCE**) | **Yes** (**INFERENCE**) | **Yes** — module exposes ~20 variables incl. bitrate, codec, drive usage (**FACT**; wire protocol UNKNOWN) | Field and bonded contribution encoding |
| **Kiloview N-series** | Kiloview (CN) | Hardware NDI converter | Retail (**INFERENCE**) | **Yes** — device-local HTTP (**FACT**) | **Yes** — HTTP; encoder/decoder mode switch, NDI source select, presets (**FACT**) | Cheap bidirectional SDI/HDMI ↔ NDI conversion |
| **DistroAV (obs-ndi)** | DistroAV community | OBS plugin, cross-platform | Free (**FACT**) | **Yes** on LAN, but **requires proprietary NDI Runtime v6.3+ installed separately** (**FACT**) | n/a (transport plugin) | NDI send/receive inside OBS |
| **Open Media Transport (OMT)** | openmediatransport (community; VMX codec originates in vMix's Instant Replay) | Win / macOS / Linux; Raspberry Pi 5 encoder + decoder (**FACT**) | Free, MIT, royalty-free (**FACT**) | **Yes** — DNS-SD or optional TCP discovery server (**FACT**) | Libraries in .NET, C, C++, Rust; OBS plugin; FFmpeg fork (**FACT**) | A royalty-free NDI alternative with a real Pi story |

**Twenty-two products.** The brief asked for at least eight; this segment is crowded enough
that a shorter table would misrepresent it.

---

## Deep dives

### 1. OBS Studio + obs-websocket

**What it does.** OBS Studio is "software designed for capturing, compositing, encoding,
recording, and streaming video content, efficiently" (**FACT**, `README.rst`). It is licensed
**GNU GPL v2 or later** (**FACT**, same file). It is the segment's free baseline and, by a
wide margin, its largest installed base (**INFERENCE** — no figure verifiable this pass).

**Data model.** Read off the obs-websocket protocol document, which is the most precise public
description of OBS's internal object graph (**FACT**, `docs/generated/protocol.md`, 5,798 lines):

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
single most important design decision in the model, and it is what makes OBS's scene
switching cheap: switching scenes re-composites existing inputs rather than re-opening
devices. **INFERENCE**, but it is directly readable from the request set — `SetInputSettings`
is global, `SetSceneItemTransform` is per-placement.

**API.** obs-websocket 5.x is a WebSocket server, **default port 4455** (**FACT**). All of the
following are **FACT** from the protocol document:

- Subprotocol negotiation via `Sec-WebSocket-Protocol`: `obswebsocket.json` (text) or
  `obswebsocket.msgpack` (binary). Mixing frame types closes the connection with
  `MessageDecodeError`.
- Handshake is a strict state machine: server sends `Hello` (OpCode 0) → client replies
  `Identify` (1) → server replies `Identified` (2). A client may send `Reidentify` (3) later
  to change session parameters. Sending anything before `Identified` closes the connection
  with `NotIdentified`.
- Authentication is SHA-256 challenge/salt: the server's `Hello` carries `{challenge, salt}`
  and the client returns an `authentication` string. Auth is on by default with a
  generated password (**FACT**, obs-websocket README).
- **`rpcVersion` negotiation**: the client states the RPC version it wants; if unsupported the
  server closes with `UnsupportedRpcVersion`. The protocol document calls this out explicitly
  as enabling "seamless backwards compatibility" for both sides.
- **`EventSubscription` is a bitmask** — `None = 0`, `General = 1<<0`, `Config = 1<<1`,
  `Scenes = 1<<2`, `Inputs = 1<<3`, and so on. Clients opt in to event categories rather than
  drinking from a firehose.
- **147 requests and 60 events**, in categories: General, Config, Sources, **Canvases**,
  Scenes, Inputs, Transitions, Filters, SceneItems, Outputs, MediaInputs, Ui.
- `RequestBatch` / `RequestBatchResponse` opcodes exist with a `RequestBatchExecutionType`
  enum, and there is a `Sleep` request — i.e. **the protocol has primitives for building
  macros client-side**, including timed sequences, without OBS itself having a macro engine.

**Integrations.** Notable requests that matter to this segment:
`OpenSourceProjector` and `OpenVideoMixProjector` (this is how OBS does **multiview** — a
projector window per source or per mix, not a composited MV grid), `SetTBarPosition`
(studio-mode T-bar, i.e. hardware panel support), `SaveReplayBuffer` /
`GetLastReplayBufferReplay`, `SplitRecordFile` and `CreateRecordChapter`, `SendStreamCaption`,
`TriggerHotkeyByName` / `TriggerHotkeyByKeySequence`, and `CallVendorRequest` — the escape
hatch that lets **plugins publish their own RPC surface through the same socket** (**FACT**;
the Companion module exposes this as "Custom Vendor Request" and warns support is limited
because of the number of plugins).

The Companion OBS module (**FACT**, its `HELP.md`) is a good census of what practitioners
actually reach for: recording with pause/resume/split/chapter, replay buffer, virtual cam,
studio mode + "Smart Scene Switcher" (preview-then-take on second press), per-source
transform and filter control, and a variable set that includes `kbits_per_sec`,
`render_missed_frames`, `output_skipped_frames`, `free_disk_space` and `cpu_usage`. That last
group is the tell: **operators use OBS's control API as a health-monitoring channel, not just
a command channel.**

**Notable strengths.** Free and GPL. Protocol is versioned, authenticated, batched, and
category-subscribable — it is better engineered than most commercial control APIs in this
segment (**INFERENCE**, but the comparison against Wirecast and Restream below is stark).
Plugins can extend the RPC surface. Cross-platform.

**Notable limits.** No native ISO recording of individual sources (the `Outputs` request family
exists but per-source recording is a plugin concern — **INFERENCE**; I could not verify a
specific plugin this pass, see *Not opened*). No native tally output — tally is derived
externally from `CurrentProgramSceneChanged` events (**INFERENCE**; see
[`landscape/tally.md`](tally.md)). No M/E, no AUX bus, no router concept: OBS's model is
scenes, not buses, which is why house installs pair it with an ATEM rather than replacing one
(**INFERENCE**). "Multiview" is a set of projector windows, not a configurable MV layout with
labels and tally borders.

---

### 2. vMix

**What it does.** vMix is the Windows all-in-one production switcher — switching,
compositing, replay, recording, streaming, PTZ and video calls in one application. Platform
is stated as **UNKNOWN this pass**: I read nothing that names the OS. (It is widely understood
to be Windows-only; that belief is *not* sourced here.)

**Data model and API.** This is where the module source is genuinely revealing (**FACT**, all
of the following from `bitfocus/companion-module-studiocoast-vmix`):

vMix's control API is **TCP on port 8099**, and the module's config screen carries an explicit
warning: *"Companion uses vMix's TCP port (8099). Do NOT enter your Web Controller port, and
ensure that the Web Controller is NOT set to 8099 as that will cause a conflict."* So there
are **two** APIs — a TCP command/state API and a separate HTTP Web Controller — and they can
collide on a port. That is a real deployment sharp edge.

The module opens **three separate TCP sockets** to the same port, each with a role:

1. **Functions socket** — sends commands as `FUNCTION <Name> Key=Value&Key=Value`, e.g.
   `FUNCTION NDISelectSourceByName Input=<key>&Value=<name>`. This socket is primary and
   drives module status.
2. **Activators socket** — sends `SUBSCRIBE ACTS`, then receives pushed state deltas
   (`ACTS OK`, then `ACTS <property> ...`). Initial state for some properties must be
   explicitly requested: the module sends `ACTS BusASolo` through `ACTS BusGSolo` and
   `ACTS ReplayQuadMode` on connect.
3. **XML socket** — **polls** by sending `XML\r\n` and receives the complete document state.

That third socket is the architectural fact worth stealing *and* worth criticising. vMix's
canonical state is **a full XML document of the entire production**, pulled on a timer. The
module contains this warning in its parser: *"If XML data is larger than 2 full TCP messages
(8KB per message) send a warning"* → `log.warn('Large vMix XML data size!')`. So: the state
model is a document, the document is polled, and on a big show the document gets big enough
that the integration code has to warn about it. **INFERENCE:** vMix is a document-shaped
system wearing a message-shaped API, and the ACTS subscription exists to paper over the
polling cost for the handful of properties that change fastest.

**Feature surface.** The module's documented shortcut coverage is organised into 16
categories (**FACT**, `docs/shortcut_list.md`): General, Audio, Transition, Output, Title,
Input, Overlay, Playlist, **Scripting**, **Replay**, **NDI**, **OMT**, **PTZ**, Preset,
DataSources, Browser. The module's own action files add `videoCallActions`,
`virtualSetActions`, `layerActions`, `zoomActions`, `multicorder`-adjacent recording actions.
Version 5.0.0 of the module claims *"80 new Actions, resulting in 100% coverage of vMix
Shortcut Functions"* (**FACT**, module README).

Concretely verified capabilities:

- **Replay**: events, cameras A/B/C/D, playback, marking, speed, `ReplayQuadMode`.
- **ISO / Multicorder**: recording and multicorder control shortcuts present.
- **Scripting**: `ScriptStart`, `ScriptStop`, `ScriptStopAll` — vMix has an in-app scripting
  engine addressable from outside.
- **Layers**: ten layers per input with crop, pan, zoom and animation.
- **NDI**: `NDISelectSourceByIndex/ByName`, `NDIStartRecording` / `NDIStopRecording`,
  `NDICommand` (send an arbitrary command *to* an NDI source — i.e. NDI's back-channel).
- **OMT**: `OMTPreviewOn` / `OMTPreviewOff` (switch an OMT input to a lower-resolution preview
  stream), `OMTSelectSourceByIndex/ByName`. **This is significant** — see *Standards* below.

**Tally.** The module's tally feedbacks (**FACT**, `feedbacks/tallyFeedbacks.ts`) read
`data.mix[n].program`, `.preview`, `.programTally[]` and `.previewTally[]`. The presence of
`programTally` *as an array distinct from* `program` means vMix reports **layer tally**: an
input is "on air" if it is the program input **or if it is a layer inside the program input**.
The feedback offers a `TallySelection` of `border | cornerTL | cornerTR | cornerBL | cornerBR |
full`, and distinguishes return value 1 (direct) from 2 (as a layer). Multiple mixes are
addressed by index (`mixSelect`), so vMix has **N independent program/preview buses each with
their own tally**.

**Notable strengths.** The most complete single-box feature set in the software tier
(**INFERENCE**). Layer tally is a genuinely thoughtful detail most switchers get wrong. OMT
adoption puts it ahead of the NDI-royalty problem. Inputs are addressed by a stable `key`
(GUID-like) rather than by index — the module resolves `input.key` throughout — which means
renaming or reordering inputs does not break a control surface (**FACT** from the code;
**INFERENCE** that this was deliberate, but it is exactly right).

**Notable limits.** Two APIs on one port with a documented collision hazard. Full-state XML
polling that the ecosystem has to defend against. Platform lock (unverified but widely
believed). Edition tiering means an action may exist in the API and be unavailable on the
installed licence — the module has `configActions` for switching host/port at runtime, which
suggests operators routinely juggle multiple vMix instances (**INFERENCE**).

---

### 3. The Blackmagic control stack (ATEM + Videohub)

These are two different protocols with two completely different philosophies, from one vendor,
and the contrast is instructive.

#### 3a. ATEM — a binary, undocumented, reverse-engineered protocol

**FACT** (from `nrkno/sofie-atem-connection`, the library behind Companion's ATEM module and
part of the NRK *Sofie* TV automation system):

- Transport is **UDP, default port 9910**.
- The library contains **169 command classes**, organised as: `MixEffects`, `DownstreamKey`,
  `SuperSource`, `Macro`, `Media`, `Recording`, `Streaming`, `Audio`, `Fairlight`,
  `CameraControl`, `Inputs`, `Settings`, `DataTransfer`, `DisplayClock`, `DeviceProfile`,
  plus standalone `AuxSourceCommand`, `TallyBySourceCommand`, `ColorGeneratorCommand`,
  `PowerStatusCommand`, `TimeCommand`.
- The `Model` enum enumerates the hardware line by protocol ID: `TVS`, `TVSHD`, `TVSProHD`,
  `TVSPro4K`, `Constellation`, `Constellation8K`, `Mini`, `MiniPro`, `MiniProISO`,
  `MiniExtreme`, `MiniExtremeISO`, `ConstellationHD1ME/2ME/4ME`, `Constellation4K1ME/2ME/4ME/
  4MEPlus`, `MiniExtremeISOG2`.
- The protocol is **not published**. The library's `DEVELOPER.md` says contributors should
  consult the C# `LibAtem` project *"before you break out wireshark"*, and warns: *"Due to the
  nature of the ATEM firmware and its tendency to break things, it is likely that new firmwares
  will require updates to the library to be fully supported."* Commands carry protocol-version
  checks inside their own `serialize()`/`deserialize()`.
- USB control is explicitly **not** supported by the library.

Three things follow, and they matter well beyond Blackmagic:

1. **`TallyBySourceCommand` means tally is in the switcher protocol itself.** You do not need a
   separate tally interface to know what is on air on an ATEM — see [`landscape/tally.md`](tally.md).
2. **`CameraControlCommand` means the switcher is also the camera-control transport.** ATEM
   carries CCU/paint commands to cameras over SDI return. This is directly relevant to
   `sony-camera-bridge` and `multicam-planner`: on an ATEM rig, "switcher" and "camera control
   network" are the same wire (**FACT** that the command exists; **INFERENCE** about the SDI
   return path, which I did not verify this pass).
3. **The whole ecosystem is built on reverse engineering that the vendor tolerates but does not
   support.** Every firmware update is a compatibility risk borne by the community. That is the
   single largest integration risk in this segment (**INFERENCE**).

#### 3b. Videohub — a plain-text, block-structured, self-describing protocol

**FACT** (from `bitfocus/companion-module-bmd-videohub`):

- TCP, **port 9990**, and the module's comment is emphatic: *"Videohub-Protokoll ist immer Port
  9990."* Bonjour/mDNS discovery is supported (`bonjourHost` config field).
- The wire format is **blocks of text terminated by a blank line**. A block starts with a line
  containing `:`, subsequent lines are the body, and an empty line commits the block. `ACK` and
  `NAK` arrive as bodyless blocks and settle the in-flight command at block termination.
- Block keys the parser recognises: `VIDEOHUB DEVICE`, `INPUT LABELS`, `OUTPUT LABELS`,
  `MONITORING OUTPUT LABELS`, `SERIAL PORT LABELS`, `VIDEO OUTPUT ROUTING`,
  `VIDEO MONITORING OUTPUT ROUTING`, `SERIAL PORT ROUTING`, `VIDEO OUTPUT LOCKS`,
  `VIDEO MONITORING OUTPUT LOCKS`, `SERIAL PORT LOCKS`, `VIDEO INPUT STATUS`,
  `VIDEO OUTPUT STATUS`, `SERIAL PORT STATUS`.
- Operations exposed (**FACT**, module `HELP.md`): rename destination / source / serial port,
  route, route-source-routed-to-other-destination, select destination, take, clear, lock and
  unlock outputs and serial ports, and — notably — **"Write routes to a disk file" and "Read
  routes from a disk file"**.

**This is the best-designed control protocol in the segment** (**INFERENCE**, but defensible):
it is human-readable, self-describing, order-independent, idempotent, versionless in practice,
and it carries **labels as first-class routable state**. A Videohub tells you what everything
is called, not just what is connected to what. The module's own TODO — *"find out more about
the video hub from stuff that comes in here"* — is a charming admission that the device
volunteers blocks the module does not yet parse, which is exactly the right failure mode for
an extensible text protocol.

The read/write-routes-to-file feature is the closest thing in this whole segment to a
**portable configuration artefact**, and it is limited to one vendor's router.

**Notable limits of the stack as a whole.** The two halves do not know about each other. The
ATEM knows its input names; the Videohub knows its labels; nothing reconciles them. There is no
Blackmagic-level concept of "this camera" that spans router port, switcher input, multiviewer
tile and tally lamp. That gap is, in one sentence, the reason `cable-planner` exists.

---

### 4. TriCaster / Viz Vectar (Vizrt, NewTek lineage)

**What it does.** The integrated production system tier: switching, M/E, DSKs, media, macros,
streaming, record, and a data-binding layer, sold as an appliance or as software.

**API.** **FACT**, from `bitfocus/companion-module-newtek-tricaster`:

- Control is **HTTP**: `http://<host>/v1/<request>`.
- State is retrieved through a **dictionary endpoint**: `dictionary?key=<name>`, with verified
  keys `shortcut_states`, `tally`, `macros_list`, `switcher`, `switcher_ui_effects`.
- Live updates come over **WebSocket**: `ws://<host>/v1/change_notifications`. The module's
  handler receives a key name over the socket and then re-fetches `dictionary?key=<that key>`
  — i.e. the socket is a **change-notification channel, not a data channel**. That is a clean
  and unusual design: push tells you *what* changed, pull tells you *what it now is*.
- The module falls back gracefully: it probes `dictionary?key=shortcut_states` rather than a
  version call, with the comment *"This allows older firmware that don't support the version
  call to still connect."*

**Setup requirement, and it is a real one:** *"On the Tricaster under Administration Tools,
turn off the LivePanel password"* (**FACT**, module `HELP.md`). The published control path
requires **disabling authentication**. Compare Livestream Studio's per-IP approval and OBS's
SHA-256 challenge. **INFERENCE:** the appliance tier assumes a trusted, physically separate
production VLAN, and its security model is the network, not the protocol.

**Capabilities verified from the module.** Take, Auto, set source to PVW/PGM/M-E/DSK per M/E
(A and B bus), DSK on-air, transition selection, media transport for DDRs/GFX/Stills/Titles/
Sound, **Run System Macros and Run Custom Macros**, record and stream toggles, set mix output,
**set a DataLink value**, and arbitrary custom shortcuts. Feedbacks: source tally (program and
preview), media playing, recording, streaming, DSK on-air. Variables include product name and
version, hostname, session name, PGM/PVW source, and **DataLink key/value pairs**.

**DataLink is the interesting one.** It is a key/value store inside the production system that
graphics bind to, and it is writable over the control API. That means the switcher carries a
**live data bus for lower-third content** — scores, names, timers — addressable from Companion,
a script, or anything else. Nothing in the software tier (OBS, vMix, mimoLive) has an exact
equivalent as a first-class named concept; vMix's `DataSources` is the nearest (**INFERENCE**).

**Notable strengths.** Macros are a first-class, enumerable, remotely-triggerable object
(`macros_list`). Change-notify-then-refetch is a robust pattern. Graceful degradation across
firmware generations. Tally, DSK and M/E are in the API, not bolted on.

**Notable limits.** Authentication must be disabled for the documented integration path.
Appliance pricing and quote-only sales (**INFERENCE**). The module is small (5 stars, 8 open
issues) relative to the ATEM and vMix modules, which suggests a much smaller integrator
community around the API (**INFERENCE** from repository metadata — weak evidence, flagged as
such).

---

### 5. mimoLive (Boinx Software, Germany)

Included because the brief asked specifically for European and German vendors, and because
**its API is the best-shaped data model in the segment** for a planning tool to interoperate
with.

**What it does.** Vendor description carried in the Companion module (**FACT**, module
`HELP.md`): *"an all-in-one live switcher, video encoder, editor, and streaming software for
Mac®... switch multiple cameras, insert presentations, add graphics, overlay lower-thirds,
social media comments, transparency with green screens"*, and *"records and streams
simultaneously to various services and locations."* Boinx Software is a German company
(Puchheim, near Munich) — **UNKNOWN this pass**, I could not reach a page confirming the
company's location; treat the nationality claim as unverified.

**Data model.** Clean, nested, and explicitly REST-addressable (**FACT**, from
`src/actions.js` and `src/api.js`):

```
Document          (a show; multiple documents can be open at once, indexed 1..n)
 └─ Layer         (the layer stack; layer 1 is at the top)
     └─ Variant   (a named configuration of a layer — the "active-variant")
 └─ Output        (a destination: stream, record, …)
 LayerSet         (a recallable named grouping of layer states)
```

Every one of those is a live-state object with `live-state` (`Set Live` / `Set Off` /
`Toggle Live`), which means the whole production is a tree of independently on-airable things
rather than a program bus. **INFERENCE:** this is a *compositing* model, not a *switching*
model — mimoLive has no PGM/PVW in the ATEM sense, it has a layer stack you turn on and off.
That is why Companion's mimoLive feedbacks are "Document Status / Layer Status / Output Status
/ Layer Set Status / Variant Status" and there is no tally feedback at all.

**API.** **FACT**:

- REST over HTTP: `GET documents/<id>/<action>`,
  `GET documents/<docId>/layers/<layerId>/<action>`, `PUT documents/<docId>/layers/<layerId>`
  with a JSON payload (used for volume).
- WebSocket for state: `ws://<host>:<port>/api/v1/socket`, delivering JSON:API-shaped messages
  with `data.attributes` and `data.relationships` — the module reads
  `message.data.relationships['active-variant'].data.id` and
  `message.data.attributes['live-state']`. This is **JSON:API convention**, which is unusually
  disciplined for this segment.
- Objects can be addressed **either by index** (`<documentIndex>,<layerIndex>`) **or by a
  stable API endpoint** that the application generates and the operator copies out of the UI.
- There is a generic "Trigger a Generic Endpoint" action — any API endpoint from the document
  can be fired.

**Notable strengths.** A real resource model with stable identifiers, relationships and a
change socket. Multiple documents open simultaneously, each independently addressable. Variants
give you named states per layer — the nearest thing in the software tier to a lighting
console's cue stack (**INFERENCE**).

**Notable limits.** The module states plainly: *"Currently, authenticated connections are not
supported, so you will need to have the Remote Control options set to no password"* (**FACT**).
Same pattern as TriCaster. macOS only. No tally concept. Index-based addressing is fragile —
"the first document opened in a session is index 1" means the addressing depends on operator
behaviour at run time, which is exactly the sort of thing that breaks at 19:55 on a show day
(**INFERENCE**).

---

### 6. Bitfocus Companion (the integration layer)

Companion is not a switcher, and that is why it belongs in this dossier: **it is the de-facto
integration standard for this entire segment**, and it is the single most relevant product
here to the AV Planner Suite.

**What it does.** Turns Stream Deck and similar surfaces into a control panel for
*"an increasing amount of different presentation switchers, video playback software and
broadcast equipment"* (**FACT**, repo description). The README claims **700+ supported
devices/software** (**FACT** that the claim is made; the number itself I could not
independently count). Licence is **MIT** (**FACT**, from source file headers, alongside a
Bitfocus Individual Contributor License Agreement).

**Architecture, as read from `companion/lib/Service/`** (**FACT** — these files exist with
these names):

| Service | What it is |
| --- | --- |
| `HttpApi.ts` | Inbound REST control of Companion itself |
| `OscApi.ts` / `OscSender.ts` / `OscListener.ts` | OSC in and out |
| `TcpApi.ts` / `UdpApi.ts` / `TcpUdpApi.ts` | Raw socket control |
| `EmberPlus.ts` | **Ember+ provider on port 9092** — broadcast-standard control |
| `Rosstalk.ts` | RossTalk (Ross Video's switcher control protocol) |
| `Artnet.ts` | Art-Net input (lighting console can drive video buttons) |
| `SatelliteTcp.ts` (16622) / `SatelliteWebsocket.ts` (16623) | **Remote surface protocol** — a physical panel elsewhere on the network |
| `BonjourDiscovery.ts` / `MdnsAdvertise.ts` | Discovers devices, and advertises itself |
| `Https.ts` | TLS for the web UI |

The inbound API surface is location-addressed rather than device-addressed (**FACT**, route
strings read from `HttpApi.ts` and `OscApi.ts`):

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
   switcher. But every switcher talks to Companion, and Companion speaks Ember+, OSC, RossTalk,
   Art-Net, HTTP and raw TCP/UDP outward. It is the segment's translation layer, and it is free
   and MIT-licensed.
2. **Its address space is spatial, not semantic.** A button is `page/row/column`. There is no
   notion of "camera 3" that survives across pages, devices and shows. Every Companion install
   is a hand-built mapping from a physical grid to a set of device commands, and that mapping
   exists nowhere except inside that Companion install.
3. **It already runs on the same hardware the suite targets.** `tally-pi` is built on top of
   Companion (**FACT**, its README), and Companion ships a Dockerfile and a launcher.

**Notable limits.** Configuration is a Companion-internal database; there is no documented
interchange format for "this is the button layout for this show" that another tool could
generate or consume (**INFERENCE** — I did not find an export/import schema this pass; see
*Not opened*). Modules are per-device and community-maintained, with quality varying from the
vMix module's 100%-coverage claim to Ecamm's "Module not fully ready yet."

---

## Standards & protocols

### Control protocols (verified this pass)

| Protocol | Transport | Verified details | Source |
| --- | --- | --- | --- |
| **obs-websocket 5.x** | WS/TCP **4455** | JSON or MsgPack subprotocol; `Hello`/`Identify`/`Identified` handshake; SHA-256 challenge+salt auth; `rpcVersion` negotiation; `EventSubscription` bitmask; 147 requests, 60 events; `RequestBatch` + `Sleep` | `obsproject/obs-websocket` `docs/generated/protocol.md` |
| **vMix TCP API** | TCP **8099** | `FUNCTION <name> Key=Value&…`; `XML` full-state poll; `SUBSCRIBE ACTS` + `ACTS <property>` push; separate HTTP Web Controller on another port | `companion-module-studiocoast-vmix` |
| **ATEM** | **UDP 9910** | Proprietary binary, unpublished; 169 command classes; per-firmware protocol-version branches; `TallyBySource`, `CameraControl`, `Macro`, `Recording`, `Streaming`, `Fairlight` families | `nrkno/sofie-atem-connection` |
| **Videohub** | TCP **9990** | Plain-text blocks terminated by blank line; `ACK`/`NAK`; keys for LABELS / ROUTING / LOCKS / STATUS per port class; Bonjour discovery; routes readable and writable as a disk file | `companion-module-bmd-videohub` |
| **TriCaster LivePanel** | HTTP + WS | `http://<host>/v1/<req>`; `dictionary?key=shortcut_states\|tally\|macros_list\|switcher\|switcher_ui_effects`; `ws://<host>/v1/change_notifications` as a change-notify channel; auth must be disabled | `companion-module-newtek-tricaster` |
| **mimoLive** | HTTP + WS | `/api/v1/documents/<id>/layers/<id>/…`, JSON:API-shaped payloads; `ws://host:port/api/v1/socket`; no auth support in the module | `companion-module-boinx-mimolive` |
| **Livestream Studio 6** | TCP **9923** (locked) | Port cannot be changed; requires "Allow Incoming Connections" in Hardware Control **per show file**; per-IP approval in "Pending Connections" | `companion-module-vimeo-livestreamstudio6` |
| **Streamlabs Desktop** | TCP **59650** | Built-in remote control API with token auth from Settings → Remote Control | `companion-module-streamlabs-desktop` |
| **Ecamm Live** | HTTP + Bonjour | mDNS service type `ecammliveremote`; `http://host:port/<command>` | `companion-module-ecamm-live` |
| **Wirecast** | HTTP via **third-party bridge** | No direct path; requires `CVMEventi/EventsController`, then `http://ip:port/wirecast/layer/<n>/shot/<n>/autolive/<0\|1>` | `companion-module-telestream-wirecast` |
| **Singular.live** | HTTPS, cloud | `https://app.singular.live/apiv2/control/<token>`; URL or bare token is the credential | `companion-module-singularlive-studio` |
| **Restream** | HTTPS, cloud | OAuth 2.0 (client id/secret, redirect to Companion on port 8081); one action, one feedback | `companion-module-restream-api` |
| **Haivision Makito X4** | REST over HTTP/HTTPS | Encoder start/stop/restart, bitrate/resolution/framerate/codec, streams (up to ten), presets, reboot, preview service | `companion-module-haivision-makito-x4-encoder` |
| **AMCP** (CasparCG) | TCP text | `LOAD`, `LOADBG`, `PLAY`, `CALL`, `CLEAR`, `MIXER <30+ verbs>`, `CG ADD/PLAY/STOP/UPDATE/INVOKE/NEXT/REMOVE`, `DATA STORE/RETRIEVE/LIST`, `THUMBNAIL *`, `INFO`, `OSC SUBSCRIBE/UNSUBSCRIBE`, `LOCK`, `ACQUIRE`, `DEFER` | `CasparCG/server` `src/protocol/amcp/` |
| **Voctomix control** | TCP **9999** | Plain text: `set_video_a`, `set_video_b`, `set_composite_mode`, `set_videos_and_composite`, `cut`, `transition`, `best`, `set_audio`, `set_audio_volume`, `set_stream_blank\|blind\|live`, `set_overlay`, `show_overlay`, `get_config`, `report_ports`, `report_queues`, `message`, `store_value`/`fetch_value` | `voc/voctomix` `voctocore/lib/commands.py` |
| **Ember+** | TCP **9092** (Companion's provider) | Broadcast device-control standard; Companion acts as a provider | `bitfocus/companion` `lib/Service/EmberPlus.ts` |
| **RossTalk** | TCP | Ross switcher control; Companion implements it as an inbound service | `bitfocus/companion` `lib/Service/Rosstalk.ts` |
| **OSC** | UDP | Companion inbound + outbound; CasparCG emits OSC via `OSC SUBSCRIBE` | both repos |
| **Companion Satellite** | TCP **16622** / WS **16623** | Remote surface attachment protocol | `bitfocus/companion` |

### Transport protocols

**SRT** (**FACT**, `Haivision/srt`): *"a transport protocol for ultra low (sub-second) latency
live video and audio streaming, as well as for generic bulk data transfer."* Licensed
**MPL-2.0**. Published as **IETF Internet-Draft `draft-sharabayko-srt-01`**. Mechanisms:
AES encryption of the payload, ARQ as the primary loss-recovery method, Forward Error
Correction via packet filtering, and **Connection Bonding** for "seamless stream protection and
hitless failover". Maintains constant end-to-end latency by adapting to measured network
conditions. Packaged in Ubuntu, Debian, Fedora, Homebrew, vcpkg and Conan.

**NDI** (partial — `docs.ndi.video` was blocked): the only hard fact obtainable this pass is
from `DistroAV/DistroAV`, the OBS NDI plugin, which requires **"NDI Runtime v6.3 or higher"**
installed separately (**FACT**). That separation — an MIT/GPL-ish plugin plus a proprietary
runtime the user must fetch from the vendor — **is** the NDI licensing story in miniature, and
it is why the next entry exists. NDI is owned by Vizrt (**UNKNOWN this pass** — not verified
from a reachable source).

**OMT — Open Media Transport** (**FACT**, `openmediatransport` org profile README, `libvmx`
README, `Metadata` README, and the org's repository list). This is the most important new thing
in this segment and it did not exist eighteen months ago (first repos created **2025-07**):

- *"An open-source network protocol for high performance, low latency video over a local area
  network (LAN)"*, **MIT licensed**, *"completely free and open source"*, explicitly
  **royalty-free**.
- Codec is **VMX**, separately MIT-licensed, and it *"originated from vMix's Instant Replay
  feature"*. Intra-frame only, **4:2:2:4 with alpha**, **10-bit**. Requires x86-64 with
  SSE4.2/SSSE3 (AVX2 recommended) or ARM64 with NEON. Claim: *"encoding 2160p60 on a single
  Intel i7 core"* with optimised AVX2.
- Latency: *"less than a frame of delay."* Bandwidth, as published: **1080p60 high quality =
  260 Mbps**; **720p30 low quality = 22.5 Mbps**.
- Discovery: **DNS-SD (Bonjour/Avahi)**, or an optional **TCP-based Discovery Server**
  (`OMTDiscoveryServer`).
- Metadata: *"timestamped bi-directional side data in XML format"* and per-frame metadata.
  The recommended formats are `<OMTWeb URL="…"/>` (device web UI), `<OMTPTZ Protocol="…"/>`
  (**Sony VISCA**), and `<AncillaryData><Packet>…` for **raw SDI ancillary data over OMT**.
- **Tally is not defined.** The `Metadata` repository lists the recommended formats and tally
  is not among them (**FACT**). This is a live gap in an otherwise well-designed protocol.
- Ecosystem already present: `libomtnet` (.NET Standard 2.0 reference), `libomt` (C wrapper),
  `libomtcpp` (C++), `Aqueduct` (Rust), `omtplugin` (OBS 31+, Windows/macOS/Linux, supports
  10-bit+ HDR), `FFmpeg-OMT`, `ffgl-omt` (Resolume), `unity-omt`, `omt-tools` ("inspired by NDI
  Tools"), `OMTMatrix` (WebRTC multiviewer), and — directly relevant to this suite —
  **`omtcapture` and `omtplayer`: a Raspberry Pi 5 video encoder and decoder**, plus `omtcase`,
  a Pi 5 case design with PoE HAT support.
- vMix already ships OMT actions (`OMTPreviewOn/Off`, `OMTSelectSourceByIndex/ByName`) —
  **FACT** from the vMix Companion module, which is independent confirmation that OMT has
  shipped in a commercial switcher.

**WebRTC / WHIP / WHEP** (**FACT**): VDO.Ninja provides a WHIP/WHEP client and supports
self-hosted SFUs and TURN servers; OvenMediaEngine ingests WebRTC and WHIP and delivers WebRTC
with an embedded TURN server.

**Streaming/delivery protocols supported by OvenMediaEngine** (**FACT**, Docker Hub listing) —
a useful census of what "streaming" means in 2026: ingest push via **WebRTC, WHIP, SRT, RTMP,
E-RTMP, MPEG-2 TS/UDP**; ingest pull via **RTSP, OVT**; delivery via **WebRTC, LL-HLS,
HLS v3, SRT**. Codecs: VP8, H.264, H.265, Opus, AAC.

**GStreamer network clock** (**FACT**, `voc/voctomix`): voctocore runs a
`GstNet.NetTimeProvider` on **UDP 9998**, and *"clients use this to synchronise their pipeline
clock with voctocore. Required for any client that sends or receives A/V streams."* Worth
noting because clock distribution is usually invisible in this segment and here it is an
explicit, documented, planable network port.

**AMWA NMOS IS-04** (**FACT**, `amwa-tv/nmos-discovery-registration`):

- Purpose: *"Allows control and monitoring applications to find the resources on a network"*,
  where resources are *"Nodes, Devices, Senders, Receivers, Sources, Flows"*.
- Mechanism: *"Media Nodes locate IS-04 registry using DNS-SD (unicast preferred). Media Nodes
  register their resource information with HTTP + JSON. Applications query with HTTP and/or
  subscribe with WebSocket."*
- The repo ships RAML API definitions for `NodeAPI`, `RegistrationAPI`, `QueryAPI` plus JSON
  schemas.
- **The critical limitation for a planning tool:** IS-04 describes **what is on the network
  right now**. It has no concept of an intended or designed configuration. It is discovery, not
  design. (**INFERENCE**, but it follows directly from the resource model.)

### Interchange formats

There is essentially **one** portable configuration artefact verified in this entire segment:
Videohub's **"Write routes to a disk file" / "Read routes from a disk file"** (**FACT**). Its
format is UNKNOWN this pass.

Everything else — OBS scene collections and profiles, vMix presets, ATEM macros and MV layouts,
TriCaster sessions, mimoLive documents, Companion button pages — is a vendor-private file or
database with no published schema that another vendor's tool could read or write.
**This is the single largest structural finding of this dossier.**

Cross-references to the rest of the corpus: TSL UMD tally protocols are covered in
[`landscape/tally.md`](tally.md); Ember+, ST 2110 and network design in
[`landscape/networking.md`](networking.md); CasparCG and playout in
[`landscape/media-playback.md`](media-playback.md); camera/CCU protocols in
[`landscape/camera-control-rcp.md`](camera-control-rcp.md).

---

## What this segment does WELL

Patterns worth stealing, each grounded in something verified above.

**1. Machine-readable live state is table stakes, and it comes in exactly two shapes.**
Every serious product here publishes its state, not just accepts commands. The two shapes are:

- **Full-state document, polled** — vMix `XML`, TriCaster `dictionary?key=…`. Simple, always
  consistent, scales badly (vMix's own ecosystem warns about document size).
- **Delta events, subscribed** — obs-websocket events, vMix `ACTS`, Videohub blocks, mimoLive
  JSON:API socket. Scales well, needs careful initial-state handling (vMix has to explicitly
  request `ACTS BusASolo…` on connect precisely because subscription alone gives you no
  baseline).

TriCaster's hybrid is the best of the three (**INFERENCE**): **the socket says which key
changed, the HTTP GET says what it now is.** You get push latency with pull consistency and no
delta-application bugs. That is a pattern worth copying anywhere a UI mirrors a remote model.

**2. Discovery is normal, and typing an IP address is considered a defect.**
Bonjour/mDNS appears in Videohub, Ecamm (`ecammliveremote`), Companion (`BonjourDiscovery` and
`MdnsAdvertise`), NDI, OMT (DNS-SD) and NMOS IS-04 (DNS-SD). `cable-planner` already has
`atem:discover` and `videohub:discover`. **The bar in this segment is that the tool finds the
device; the user confirms it.**

**3. Stable identity beats positional identity — where anyone bothered.**
vMix addresses inputs by `input.key`, so renaming and reordering do not break control surfaces.
mimoLive offers a stable per-object API endpoint *alongside* index addressing. Videohub carries
labels as routable state. Where products got this wrong the pain is visible: mimoLive's
"first document opened is index 1", Wirecast's "Shot 1 is black", Companion's `page/row/column`.

**4. Bidirectionality is assumed. A control surface that cannot show state is not a control
surface.** Every module examined ships *feedbacks* as well as *actions*, and tally is the
canonical feedback. vMix goes furthest: tally distinguishes direct program from
program-as-a-layer, with six visual treatments (`border`, four corners, `full`).

**5. Health telemetry rides the control channel.** OBS exposes `kbits_per_sec`,
`render_missed_frames`, `output_skipped_frames`, `average_frame_time`, `free_disk_space`,
`cpu_usage`; Streamlabs exposes dropped-frame percentages; Teradek exposes drive usage;
Haivision exposes per-encoder bitrate/codec/resolution. **The same socket that switches sources
also tells you the machine is about to die.** Practitioners clearly use it that way.

**6. Protocol versioning is designed in, at least by the good ones.** obs-websocket negotiates
`rpcVersion` and closes cleanly on mismatch. The ATEM libraries branch on protocol version
inside `serialize()`. TriCaster's module probes a data key rather than a version endpoint so
old firmware still connects. Contrast: Livestream Studio's port is hard-locked at 9923.

**7. Text protocols age extraordinarily well.** Videohub (1990s-era design idiom, still
perfect), AMCP (in 24/7 production since 2006), Voctomix's command set. All human-typeable over
`nc`, all debuggable without tooling, all still in service. The binary, undocumented one (ATEM)
is the one that breaks on firmware updates.

**8. A free, MIT-licensed, community-maintained integration layer exists and everyone uses
it.** Companion with ~700 modules is a genuine public good, and it means **you do not have to
integrate with N switchers — you have to be legible to Companion.**

**9. Offline-first is the default for the on-prem tier, without anyone making a fuss about
it.** OBS, vMix, ATEM, Videohub, TriCaster, mimoLive, Ecamm, Voctomix, CasparCG and Companion
all operate with zero internet. VDO.Ninja — a *WebRTC* product — ships a dedicated
`offline_deployment` repository with a Docker option for venues with no internet at all
(**FACT**). That is a striking commitment.

**10. The open-source tier is credible, not a toy.** Voctomix runs the Chaos Communication
Congress. CasparCG has been in broadcast since 2006. OBS is the segment's baseline. OMT shipped
a royalty-free NDI competitor with a working codec, a Pi encoder and commercial adoption inside
one year.

---

## What NOBODY in this segment solves well

The white space, in rough order of how directly it maps to an opportunity for this suite.

**1. Nothing here plans a system that does not exist yet.**
Every product in this dossier controls a *running* rig. Not one of them models an *intended*
rig — the input list, the multiviewer layout, the router plan, the tally map, the label scheme
— as a document you can author offline, review with a colleague, print, and hand to whoever
patches the truck. NMOS IS-04 comes closest and is explicitly discovery-of-what-exists. This is
not a gap in one product; **it is a gap in the entire category.**

**2. There is no interchange format for a production configuration.**
One portable artefact was verified in the whole segment: Videohub's routes-to-a-disk-file, in
an unknown format, for one vendor's router. OBS scene collections, vMix presets, ATEM macros,
TriCaster sessions, mimoLive documents and Companion pages are all vendor-private. You cannot
diff two shows. You cannot template a show. You cannot generate a configuration from a plan.
You cannot check a configuration against a plan.

**3. Names live in five places and nothing reconciles them.**
For one camera on a normal rig, the string "CAM 3" is independently stored in: the router's
input label, the switcher's input name, the multiviewer tile label, the tally system's mapping,
and the encoder's stream name — plus the rundown and the cable schedule. Every one is typed by
hand, and they drift. The ATEM module has a `bulk-set-input-names` capability and
`cable-planner` already implements `atem:bulk-set-input-names` (**FACT**, local source) — which
is exactly the right instinct and is, as far as this pass could determine, unusual.

**4. Multiviewer layout is essentially unaddressed outside each vendor's own app.**
There is no vendor-neutral MV layout format. There is no tool that designs an MV layout for a
show and then applies it to whatever MV hardware or software the show ends up using. OBS's
"multiview" is a set of projector windows. `cable-planner` reading and applying ATEM MV
configuration (`atem:read-mv-config` / `atem:apply-mv-config`, **FACT** from local source) is
a genuinely differentiated capability and I found no commercial equivalent this pass.

**5. Tally mapping is re-entered at every layer, and the newest protocol forgot it entirely.**
ATEM carries `TallyBySource` in-protocol; vMix computes layer-aware tally; TriCaster exposes
`dictionary?key=tally`. But the mapping *from* switcher source *to* physical camera *to* lamp
*to* intercom panel *to* MV tile is rebuilt by hand in every system. And **OMT — designed in
2025, with a metadata layer explicitly covering PTZ and SDI ancillary data — does not define
tally** (**FACT**). See [`landscape/tally.md`](tally.md).

**6. Cloud products have anaemic control APIs; on-prem products have no collaboration.**
Restream's entire Companion surface is one action and one feedback. Singular is a token in a
URL. Meanwhile OBS, vMix, ATEM and TriCaster have rich local APIs and no concept of two people
working on the same show configuration from different places. **Nobody offers a rich control
model *and* multi-user, multi-site configuration.** (`cable-planner` already has
`sync:*`, `signaling:*` and `collabDiscovery:*` IPC domains — **FACT**, local source — which
puts it on the right side of this gap.)

**7. Authentication is routinely the thing you turn off to make integration work.**
TriCaster: *"turn off the LivePanel password."* mimoLive: *"authenticated connections are not
supported, so you will need to have the Remote Control options set to no password."* Livestream
Studio: a per-show-file toggle plus per-IP approval that is cleared whenever you create or
import a show. Only obs-websocket (SHA-256 challenge, on by default), Streamlabs (token) and
Haivision (HTTPS REST) do this properly. **The segment's de-facto security model is "trust the
production VLAN"** — which is a networking assumption nobody documents and no tool validates.

**8. Nobody produces as-built documentation from the live system.**
Every one of these products knows its own input names, routing, MV layout and output settings.
None of them will give you a signal-flow diagram, a label sheet, a patch list or a tally chart.
The information exists; the export does not.

**9. REMI transport is solved; REMI *planning* is not.**
SRT, NDI, OMT and WebRTC all work. But nothing helps you decide how many 260 Mbps OMT feeds fit
on the venue's gigabit link (OMT's own published figure — **FACT**), what latency budget the
SRT hop adds, or which of the three transports survives the firewall. That arithmetic is done
in people's heads and in spreadsheets.

**10. Hardware and ecosystem lock-in is total at the control-app layer.**
ATEM Software Control talks to ATEMs. Videohub Control talks to Videohubs. TriCaster's panel
talks to TriCasters. The *only* vendor-neutral control surface in the segment is Companion, and
it is free, community-maintained, and spatially rather than semantically addressed. There is no
vendor-neutral *planner* at all.

**11. Pricing is structurally opaque.**
I could not reach a single price for a single product in this segment. That is partly this
environment's restriction, but the pattern underneath is real (**INFERENCE**): control software
is free-with-hardware (Blackmagic), free-and-open (OBS, Companion), quote-only (TriCaster,
Haivision, Teradek), or edition-tiered in ways that make an action present in the API and
absent from your licence (vMix). Comparing total cost across two candidate architectures is
genuinely hard work, and no tool helps.

---

## Relevance to AV Planner Suite

Ordered by directness. Repository capabilities cited as **FACT** were read from local source
this pass.

### cable-planner — highest relevance, and already partly executing on it

`cable-planner` is described as *"a node-based editor for AV, Network and Power Signal flow,
ATEM multiviewer layouts and Blackmagic Videohub routing"* (**FACT**, README), and the code
backs that: `src/main/ipc/atemIpc.ts` implements `atem:connect`, `atem:state`,
`atem:set-input-name`, `atem:bulk-set-input-names`, `atem:read-mv-config`,
`atem:apply-mv-config`, `atem:read-audio-config`, `atem:apply-audio-config`, `atem:discover`;
`src/main/ipc/videohubIpc.ts` implements `videohub:send`, `videohub:read-state`,
`videohub:discover` with the comment that the protocol is always port 9990 (**FACT**, local
source).

That is already sitting precisely on white-space items **1, 3 and 4**. What this research
suggests next:

- **Videohub label round-tripping.** The protocol carries `INPUT LABELS`, `OUTPUT LABELS`,
  `MONITORING OUTPUT LABELS` and `SERIAL PORT LABELS` as first-class writable state, and
  supports rename operations. A planner that owns the naming scheme and can push it to both the
  ATEM (already implemented) *and* the Videohub closes the "names live in five places" gap for
  the two most common Blackmagic devices. The Videohub read/write-routes-to-file feature is
  also worth investigating as an import path.
- **Model the MV layout as a portable document, not just an ATEM push.** The MV read/apply pair
  is the differentiator; an exportable, vendor-neutral MV layout would extend it beyond ATEM.
- **Add OMT, NDI and SRT as first-class link types in the signal-flow model.** OMT's published
  bandwidth figures (1080p60 high = 260 Mbps, 720p30 low = 22.5 Mbps — **FACT**) are exactly
  the kind of number a cable/network planner should carry, and they make white-space item **9**
  addressable: a planner that knows a link is OMT-1080p60 can warn that four of them do not fit
  on a gigabit trunk. This connects directly to
  [`landscape/networking.md`](networking.md).
- **Consider a Companion-facing export.** Companion is the segment's integration standard and
  its address space is `page/row/column` with no semantic layer. A planner that already knows
  "CAM 3 is ATEM input 4, Videohub output 7, MV tile 5" is holding exactly the mapping
  Companion lacks. Whether Companion has an importable page format is **UNKNOWN this pass** and
  is the first thing to check.
- **Protocol facts worth encoding in the device library:** ATEM UDP 9910, Videohub TCP 9990,
  vMix TCP 8099 (+ separate Web Controller port — flag the collision), OBS WS 4455, TriCaster
  HTTP/WS, HyperDeck, Streamlabs 59650, Livestream Studio 9923, Companion Ember+ 9092 and
  Satellite 16622/16623. These are port-level facts a cable/network planner can validate
  against a VLAN plan.

### tally-pi — high relevance

Built on Companion, drives ATEM tally to GPIO and browser pages (**FACT**, README). Three
findings land here:

- **`TallyBySourceCommand` is in the ATEM protocol** (**FACT**), confirming the architecture
  tally-pi already uses is the right one.
- **OMT does not define tally metadata** (**FACT**, `openmediatransport/Metadata`). If OMT
  adoption grows — and vMix already ships OMT support — there is an unclaimed convention here.
  OMT's metadata layer is *"timestamped bi-directional side data in XML format"* with existing
  recommended elements `<OMTWeb>`, `<OMTPTZ>` and `<AncillaryData>`; a proposed `<OMTTally>`
  would be a small, well-scoped, high-visibility open-source contribution.
- **`omtcapture` / `omtplayer` are Raspberry Pi 5 OMT encoder and decoder projects**, with
  `omtcase` providing a Pi 5 + PoE HAT case (**FACT**). That is the same hardware class
  tally-pi targets, and it suggests an adjacent appliance: a PoE Pi that is simultaneously a
  tally endpoint and an OMT source.

### sony-camera-bridge — high relevance

The bridge already normalises VISCA, Sony 700PTP, CCAPI, Lumix, Blackmagic REST, Z CAM,
Panasonic AW and JVC (**FACT**, README). Two connections:

- **The ATEM protocol carries `CameraControlCommand`** (**FACT**) — on an ATEM rig the switcher
  *is* a camera-control transport, so "switcher" and "camera control" are not separable
  planning concerns.
- **OMT recommends `<OMTPTZ Protocol="…"/>` carrying Sony VISCA over the video transport**
  (**FACT**). If a camera arrives as an OMT source, its PTZ control channel arrives with it.
  That is a transport the bridge does not yet speak and it is MIT-licensed with .NET, C, C++
  and Rust implementations available.

### multicam-planner — medium relevance

The missing link between camera planning and gallery planning is the **camera → switcher input
→ MV tile → tally destination** mapping. multicam-planner owns the camera identity;
cable-planner owns the switcher and router. Sharing one canonical camera identity across the
suite is what would close white-space item **3** properly, rather than device by device.

### broadcast-intercom — medium relevance

Already ships a Companion module and a REST control endpoint (**FACT**, README), so it is
already legible to the segment's integration standard. The unclaimed piece is the
**tally ↔ intercom link**: which panel hears which camera's tally. That mapping is white-space
item **5** and no product in this dossier owns it.

### shell / suite — medium relevance

Two suite-level implications:

- **Companion is the integration target that matters.** Being exportable-to or drivable-from
  Companion reaches ~700 devices without writing ~700 integrations.
- **The corpus's strongest single finding — no interchange format for production configuration
  — is a suite-level opportunity, not a per-planner one.** A shared, documented, versioned
  project format that carries the show's identities (cameras, inputs, routes, labels, MV
  layout, tally map) across cable-planner, multicam-planner and broadcast-intercom is the thing
  the entire commercial segment lacks.

### pi-media-station — low-to-medium relevance

Not a switching product, but `omtcapture`, `omtplayer` and `omtcase` (**FACT**) are the same
pattern — a purpose-built Pi 5 media appliance with a web admin — and are worth reading as
prior art for the appliance/admin split.

### light-planner — low relevance

The only real touchpoint is **Art-Net**, which Companion accepts as an inbound control service
(**FACT**, `lib/Service/Artnet.ts`) — meaning a lighting console can already trigger video
actions through Companion. Cross-domain cue triggering is covered in
[`landscape/show-control.md`](show-control.md).

---

## Pricing notes

**Not one price in this segment was verified this pass.** Every vendor pricing page, app-store
listing and archive mirror was blocked by the egress proxy, and WebSearch was exhausted before
this dossier began. The *Price model* column in the product table is inference or unknown,
row by row, and is labelled as such.

What can be said honestly:

**The structure of pricing is more informative than the numbers, and the structure is
verifiable indirectly** (**INFERENCE**, from licences and product architecture read this pass):

1. **Free and genuinely open** — OBS (GPL-2.0-or-later, **FACT**), Companion (MIT, **FACT**),
   OMT and VMX (MIT, **FACT**), SRT (MPL-2.0, **FACT**), CasparCG, Voctomix, VDO.Ninja,
   OvenMediaEngine. This is not a crippled tier; it is where a large share of production
   actually happens.
2. **Free because the hardware was bought** — ATEM Software Control, Videohub Control.
   Blackmagic's control software is a cost of selling the switcher. The consequence for anyone
   selling *software* into this market is severe: **the reference price for "an application
   that controls my switcher" is zero.**
3. **Paid desktop licence, edition-tiered** — vMix, Wirecast, mimoLive, Ecamm, Livestream
   Studio. Tiering is feature-based, and the vMix module's edition-dependent behaviour is
   indirect evidence that **the API surface and the licensed surface differ** — an action can
   exist in the protocol and fail on your licence.
4. **Quote-only appliance** — TriCaster/Viz Vectar, Haivision, Teradek, LiveU. No list price is
   expected to be public.
5. **Cloud subscription** — Restream, Singular.live, Grabyo, Blackmagic Cloud. Recurring, and
   the control API is thin (Restream: one action — **FACT**), so you are buying the service,
   not the interface.

**What I would need to check to make this section factual:** `vmix.com/purchase`,
`obsproject.com` (confirm no paid tier), `telestream.net/wirecast/store`, `boinx.com/mimolive`
pricing, `ecamm.com/mac/ecammlive` pricing, `singular.live/pricing`, `restream.io/pricing`,
`vizrt.com` for TriCaster/Vectar (expect quote-only), `haivision.com`, `teradek.com`,
`kiloview.com`, and `blackmagicdesign.com` (confirm software is bundled). Each with the date
seen and whether the figure is advertised or requires sales contact. **None of these were
reachable on 2026-08-29.**

---

## Offline notes

This is the segment's strongest characteristic and it deserves to be stated precisely.

**Fully offline / LAN-only capable** (**FACT** unless noted — each verified by the transport
the control path uses):

| Product | Evidence |
| --- | --- |
| OBS Studio | Local WebSocket server on 4455; no network dependency in README |
| vMix | TCP 8099 on the LAN |
| ATEM Software Control | UDP 9910 direct to the switcher |
| Videohub Control | TCP 9990 + Bonjour |
| TriCaster / Viz Vectar | HTTP + WS to the appliance on the LAN |
| mimoLive | Local REST + WS |
| Ecamm Live | Bonjour + local HTTP |
| Streamlabs Desktop | Local API on 59650 (product is account-centric — **INFERENCE**) |
| Livestream Studio 6 | TCP 9923 on the LAN |
| Bitfocus Companion | Entirely LAN; mDNS discovery; no cloud requirement |
| CasparCG | AMCP over TCP |
| Voctomix | TCP 9999 + GStreamer net clock on UDP 9998 |
| Haivision / Teradek / Kiloview | Device-local HTTP/REST |
| OvenMediaEngine | Self-hosted |
| OMT | DNS-SD, or a local TCP discovery server — deliberately LAN-scoped by design |

**Not offline:**

| Product | Evidence |
| --- | --- |
| Restream | Cloud REST + OAuth 2.0 only (**FACT**) |
| Singular.live | Control API is `app.singular.live/apiv2/control/<token>` (**FACT**) |
| Grabyo, Blackmagic Cloud | UNVERIFIED this pass; both are cloud-positioned (**INFERENCE**) |

**The notable middle case: VDO.Ninja.** A WebRTC product — a category that is normally
cloud-dependent by definition — that ships a dedicated `offline_deployment` repository with a
Docker option *"for users wishing to host VDO.Ninja offline (where no Internet is available)"*
(**FACT**). Self-hosted TURN is documented in `turnserver.md`, and the note that *"only about
5% of remote guests usually will need a TURN server"* is a useful planning figure (**FACT**,
though it is the author's estimate, not a measurement).

**Implication for the suite:** offline-first is not a differentiator in this segment — it is
the norm, and the AV Planner Suite's offline-first stance simply matches the buyer's
expectation. The differentiator is that **nothing offline here is collaborative**, and nothing
collaborative here is offline. `cable-planner`'s `sync:*` / `signaling:*` /
`collabDiscovery:*` domains (**FACT**, local source) sit in exactly that gap: LAN-local
multi-user, no cloud dependency.

---

## API notes

**Summary of the segment's API culture,** from what was actually read:

- **Everything real has a LAN API.** Twelve distinct control protocols were verified this pass
  with specific ports and message formats. A product without one (Wirecast, effectively) is
  visibly disadvantaged — its Companion module needs a third-party bridge application to exist
  at all (**FACT**).
- **Transport preference, ranked by what was actually found:** plain-text TCP (Videohub, AMCP,
  Voctomix, vMix, Livestream Studio) → HTTP/REST (TriCaster, mimoLive, Haivision, Kiloview,
  Ecamm) → WebSocket for state (obs-websocket, TriCaster, mimoLive) → proprietary binary UDP
  (ATEM, the outlier and the one that breaks).
- **Two state-distribution patterns, both worth implementing:** full-document poll (vMix XML,
  TriCaster dictionary) and subscribe-to-deltas (obs-websocket events, vMix ACTS, mimoLive
  socket). TriCaster's *change-notify-then-refetch* hybrid is the most robust of the three
  (**INFERENCE**).
- **Auth is the weak point.** obs-websocket does SHA-256 challenge/salt with auth on by
  default; Streamlabs uses a token; Haivision uses HTTPS REST. TriCaster and mimoLive require
  authentication to be **disabled** for documented integration. Livestream Studio's approval
  state is per-show-file and is cleared on import (**all FACT**).
- **Versioning is uneven.** obs-websocket negotiates `rpcVersion` and closes cleanly on
  mismatch; the ATEM libraries branch on protocol version per command and warn that firmware
  updates break things; Livestream Studio hard-locks its port.
- **Idempotence and acknowledgement:** Videohub is the only protocol read this pass with
  explicit `ACK`/`NAK` per command block (**FACT**). Most others are fire-and-forget with state
  reconciliation as the only confirmation.
- **The escape hatch is universal and telling:** obs-websocket has `CallVendorRequest`,
  TriCaster has "Custom Shortcuts", mimoLive has "Trigger a Generic Endpoint", vMix has
  arbitrary `FUNCTION` strings, Companion has generic HTTP/OSC/TCP/UDP modules. **Every
  well-designed control API in this segment ships a documented way to send something its
  designers did not anticipate.** That is a pattern worth copying in any IPC surface.

---

## Not opened / unverified

Named in the brief or encountered during research, but **not** verified this pass. Listed so
the pass can be re-run against them rather than described from memory:

- **Grabyo** — no Companion module exists (**FACT**, org search returned none); no reachable
  source. Nothing verified.
- **LiveU** — no Companion module found (**FACT**); vendor site unreachable. Nothing verified.
- **Blackmagic Cloud** — no Companion module found; no reachable source. Nothing verified.
- **NDI Tools** — `docs.ndi.video` blocked. Only NDI fact obtained is DistroAV's "NDI Runtime
  v6.3 or higher" requirement.
- **Sienna** — `companion-module-sienna-ndimonitor` exists (**FACT**), but its `HELP.md` was
  not retrievable on either `main` or `master`. No capability claim made.
- **Viz Vectar Plus specifically** — covered only through the shared NewTek/TriCaster LivePanel
  API. Vizrt-specific differences unverified. (`companion-module-vizrt-tcp-engine-trio` and
  `companion-module-vizrt-mosart` exist and were not opened.)
- **OBS ISO-recording plugins** — searched, not found by name; the claim that OBS lacks native
  per-source recording is inference from the request set, not from a plugin page.
- **Companion configuration export/import format** — not investigated; the first thing to check
  for the export idea in *Relevance*.
- **Videohub routes-file format** — the feature is confirmed; the format is unknown.
- **libRIST / RIST protocol** — not opened this pass. SRT was verified; RIST was not.
- **SMPTE ST 2110 / ST 2022-7** — not opened (specifications are paywalled); only NMOS IS-04
  was verified. NMOS IS-05 (connection management) was not opened.
- **Voctomix and CasparCG licence texts** — `LICENSE.txt` / `LICENSE` present in both repos,
  contents not read. Both described as "open source" without naming the licence.
- **`CVMEventi/EventsController`** — named in the Wirecast module's config text (**FACT** that
  it is named); the repository itself was not opened.
- **`LibAtem`** — named in `sofie-atem-connection`'s `DEVELOPER.md` as the reference C#
  implementation with "mostly 100% coverage of the atem commands" (**FACT** that this is
  stated); the repository was not opened.
- **Platform claims** for vMix (Windows), Ecamm (macOS), Wirecast, ATEM Software Control and
  Videohub Control (Win/macOS) — widely believed, **not sourced here**.
- **All prices.** See *Pricing notes*.

---

## Sources

Every URL below was actually opened during this pass.

**Fetched pages**

- https://raw.githubusercontent.com/obsproject/obs-studio/master/README.rst
- https://raw.githubusercontent.com/obsproject/obs-websocket/master/README.md
- https://raw.githubusercontent.com/bitfocus/companion-module-studiocoast-vmix/main/README.md
- https://raw.githubusercontent.com/bitfocus/companion-module-studiocoast-vmix/main/docs/shortcut_list.md
- https://raw.githubusercontent.com/bitfocus/companion-module-haivision-makito-x4-encoder/main/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-teradek-prism/main/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-restream-api/main/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-streamlabs-desktop/main/companion/HELP.md
- https://raw.githubusercontent.com/openmediatransport/.github/main/profile/README.md
- https://raw.githubusercontent.com/openmediatransport/libomtnet/master/README.md
- https://raw.githubusercontent.com/openmediatransport/omtplugin/master/README.md
- https://raw.githubusercontent.com/openmediatransport/libvmx/master/README.md
- https://raw.githubusercontent.com/openmediatransport/Metadata/main/README.md
- https://pypi.org/project/PyATEMMax/
- https://hub.docker.com/r/airensoft/ovenmediaengine
- https://gitlab.com/explore (reachability probe only)

**Repositories cloned and read as source**

- https://github.com/obsproject/obs-websocket — `docs/generated/protocol.md` (5,798 lines), `README.md`
- https://github.com/bitfocus/companion — `README.md`, `companion/lib/Service/*` (HttpApi, OscApi, EmberPlus, Rosstalk, Artnet, SatelliteTcp, SatelliteWebsocket, BonjourDiscovery, TcpUdpApi)
- https://github.com/bitfocus/companion-module-bmd-atem — `package.json`, repo layout
- https://github.com/bitfocus/companion-module-bmd-videohub — `src/config.ts`, `src/main.ts`, `companion/HELP.md`
- https://github.com/bitfocus/companion-module-studiocoast-vmix — `src/config.ts`, `src/tcp.ts`, `src/actions/*`, `src/feedbacks/tallyFeedbacks.ts`, `src/actions/ndiActions.ts`, `src/actions/omtActions.ts`
- https://github.com/bitfocus/companion-module-obs-studio — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-newtek-tricaster — `companion/HELP.md`, `index.js`
- https://github.com/bitfocus/companion-module-telestream-wirecast — `index.js`, `README.md`
- https://github.com/bitfocus/companion-module-boinx-mimolive — `companion/HELP.md`, `src/actions.js`, `src/api.js`
- https://github.com/bitfocus/companion-module-ecamm-live — `companion/HELP.md`, `src/http.ts`, `docs/`
- https://github.com/bitfocus/companion-module-singularlive-studio — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-kiloview-ndi — `companion/HELP.md`, `src/*.js`
- https://github.com/bitfocus/companion-module-kiloview-encoder
- https://github.com/bitfocus/companion-module-vimeo-livestreamstudio6 — `companion/HELP.md`, `src/config.js`, `src/actions.js`
- https://github.com/nrkno/sofie-atem-connection — `README.md`, `DEVELOPER.md`, `src/atem.ts`, `src/lib/atemSocket.ts`, `src/enums/index.ts`, `src/commands/`
- https://github.com/Haivision/srt — `README.md`, `docs/`
- https://github.com/voc/voctomix — `README.md`, `doc/index.rst`, `doc/voctocore/ports.rst`, `vocto/port.py`, `voctocore/lib/commands.py`, `voctocore/lib/pipeline.py`, `voctocore/lib/clock.py`
- https://github.com/CasparCG/server — `README.md`, `src/protocol/amcp/`
- https://github.com/DistroAV/DistroAV — `README.md`
- https://github.com/AirenSoft/OvenMediaEngine
- https://github.com/amwa-tv/nmos-discovery-registration — `README.md`, `APIs/`
- https://github.com/steveseguin/vdo.ninja — `README.md`

**Discovery** — GitHub repository search (via the GitHub API) for `obs-websocket`,
`org:bitfocus vmix OR tricaster OR wirecast OR mimolive OR ecamm`,
`org:bitfocus videohub OR atem OR hyperdeck`,
`org:bitfocus companion-module obs OR ndi OR singular OR streamlabs OR restream OR grabyo`,
`org:bitfocus companion-module kiloview OR haivision OR teradek OR liveu OR birddog OR magewell`,
`org:bitfocus haivision OR teradek OR liveu`, `org:bitfocus sienna OR grabyo OR restream`,
`org:bitfocus livestream OR streamlabs OR vizrt`, `org:openmediatransport`,
`libomt OR openmediatransport OR "open media transport"`, and
`ATEM switcher protocol library nodejs`. Repositories surfaced in those searches but **not**
opened include `openmediatransport/libomt`, `openmediatransport/libomtcpp`,
`openmediatransport/omtcapture`, `openmediatransport/omtplayer`, `openmediatransport/omtcase`,
`openmediatransport/OMTDiscoveryServer`, `openmediatransport/Examples`,
`compiling-org/Aqueduct`, `MikanseiLaboratory/omt-tools`, `silvansan/OMTMatrix`,
`GalleryUK/FFmpeg-OMT`, `tomspace/ffgl-omt`, `ysdede/opencamera-omt`,
`bitfocus/companion-module-vizrt-tcp-engine-trio`, `bitfocus/companion-module-vizrt-mosart`,
`bitfocus/companion-module-sienna-ndimonitor`, `bitfocus/companion-module-teradek-vidiu`,
`bitfocus/companion-module-teradek-vidiux`, `bitfocus/companion-module-haivision-connectdvr`,
`bitfocus/companion-module-haivision-kbencoder`, `bitfocus/node-tricaster`,
`obs-websocket-community-projects/obs-websocket-js`, `Elektordi/obs-websocket-py`,
`aatikturk/obsws-python`, `grigio/obs-cmd`. Where those are mentioned above, only their GitHub
search description metadata is relied on and that is stated in place.

**Local repositories read for the relevance section**

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

**Blocked (returned `EGRESS_BLOCKED` or a non-content status; listed so the pass can be
re-run):** `www.vmix.com`, `obsproject.com`, `docs.ndi.video`, `www.haivision.com`,
`en.wikipedia.org`, `bitfocus.github.io`, `apps.apple.com`, `flathub.org`, `web.archive.org`,
`www.npmjs.com` (HTTP 403), and all search engines (WebSearch budget exhausted at 200/200
before this dossier began).
