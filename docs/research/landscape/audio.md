# Audio System Design / Network Audio / RF

> Research pass: **2026-08-29** (corpus date 2026-08-28/29). Claims are labelled per
> [`docs/research/METHOD.md`](../METHOD.md): **FACT** (read on a cited page or in cited
> source code / vendor documentation shipped inside a cited repository), **INFERENCE**
> (my reasoning from that evidence), **UNKNOWN / unverified**.

## Evidence access caveat — read this before trusting anything below

This pass ran under a **much harder egress restriction than any previous dossier in this
corpus**, and the restriction shapes what can and cannot be claimed here. Stating it
precisely is not throat-clearing; it is the difference between a usable dossier and a
fabricated one.

**What was reachable.** Exactly four hosts: `github.com` (git clone + repository search),
`raw.githubusercontent.com`, `api.github.com` (search only — the REST repository endpoints
are scoped to this account's own repos) and `pypi.org`. `gitlab.com` and `bitbucket.org`
answered but were not needed for primary evidence.

**What was not reachable.** Every single vendor and standards host. Probed and refused at
the egress proxy (connection failure, not 404): `dbaudio.com`, `l-acoustics.com`,
`meyersound.com`, `afmg.eu`, `audinate.com`, `qsc.com`, `q-syshelp.qsc.com`, `shure.com`,
`docs.shure.com`, `sennheiser.com`, `rationalacoustics.com`, `yamaha.com`,
`download.yamaha.com`, `allen-heath.com`, `digico.biz`, `biamp.com`, `symetrix.co`,
`bose.com`, `waves.com`, `avid.com`, `aes.org`, `pubs.aes.org`, `avnu.org`,
`ravenna-network.com`, `aes67.app`, `rhconsulting.uk`, `bitfocus.io`, `gearspace.com`,
`prosoundweb.com`, `en.wikipedia.org`, `web.archive.org`.

**The web-search budget was exhausted before this dossier started** (200/200 calls consumed
by earlier segments), so unlike `show-control.md` there is not even a search-result-summary
tier available. There is no "Tier B" here. A claim is either read in source, or it is marked
unverified.

**Consequences, stated bluntly:**

1. **There is not one verified price in this dossier.** Not one. Every price field in the
   product table reads `unverified`. The "Pricing" discussion below is a list of what to
   check, not a set of findings. Do not put any number from this file into a business case.
2. **Vendor-side feature claims are absent unless a third party implemented them.** What is
   known about Shure Wireless Workbench here is known because an open-source tool parses its
   files and documents the parsing. What is known about Q-SYS is known because a Companion
   module lists the QRC methods it calls. This is *good* evidence — arguably better than a
   marketing page, because an implementer has to be right — but it is partial and skewed
   toward what integrators care about.
3. **EASE / EASE Focus (AFMG), Meyer MAPP, Bose ControlSpace, Waves SoundGrid, AVID VENUE and
   Lake Controller are effectively unresearched.** They appear in the table as known-to-exist
   placeholders with `unverified` in every column, because writing plausible-sounding feature
   lists for them from memory is precisely what the rules forbid. See the
   "Not verified / open questions" section for the exact re-run list.

**What this pass got instead, and why it is worth having.** The open-source and
reverse-engineering layer of this segment turned out to be unusually informative, because
this is a market where the *interesting* work is exactly the work of prying vendor formats
open. Nine repositories were cloned or read as primary source, including one GitHub wiki that
documents the Dante control protocol byte-by-byte, and one project family that has
reverse-engineered both Shure's and Sennheiser's RF coordination file formats and published
the schemas. That material answers the interoperability and file-format questions in the
brief far better than any vendor page would have.

---

## Segment summary

**What this software category is for.** Audio in professional AV/broadcast is unusual in that
a single signal chain is normally planned in four *separate* tool families that do not talk to
each other, each with its own file format, its own vocabulary and often its own vendor:

| Layer | Question it answers | Typical tool shape |
| --- | --- | --- |
| **1. Acoustic prediction / system design** | Where do the loudspeakers go, what does the audience hear, will the rig fly safely? | Offline 3D CAD-ish desktop app, vendor-locked to one loudspeaker brand |
| **2. Signal routing / DSP / patch** | What is connected to what, and what processing is in between? | Offline design file + online deploy to hardware; vendor platform |
| **3. Network audio transport** | How do channels get from stagebox to console to amp over Ethernet? | Online-only device controller; discovery-driven, not design-driven |
| **4. RF coordination** | Which frequency does each radio mic use, legally and without intermodulation? | Semi-offline planner + online receiver programming and monitoring |

The category boundary in the brief ("Audio System Design / Network Audio / RF") is really
these four layers, and **the single most important structural fact about the segment is that
nothing crosses between them.** A loudspeaker prediction file knows nothing about the amplifier's
network address; a Dante subscription knows nothing about the patch panel; a coordinated
frequency knows nothing about the antenna position on the venue plan. (INFERENCE, but every
piece of evidence below supports it, and no counter-example was found.)

**Who buys what.**

- **Layer 1** is bought by nobody: the prediction tools are given away by loudspeaker
  manufacturers to sell loudspeakers, and the independent one (EASE) is bought by acoustic
  consultants and large integrators. (INFERENCE from the giveaway model being universal among
  the seed products; the "free" part is **unverified** in this pass.)
- **Layer 2** is bought by systems integrators and installers — the licence is often bundled
  with, or gated by, the hardware.
- **Layer 3** is mostly *not* bought: Dante Controller is the de-facto free client, and the
  paid product (Dante Domain Manager) is an enterprise upsell. (Pricing **unverified**.)
- **Layer 4** is bought by RF technicians and rental houses; the vendor tools (Wireless
  Workbench, WSM) are free adjuncts to the radio hardware. (**Unverified**.)

**Typical price band: unverified in this pass.** The structural pattern that *can* be
asserted from evidence is that the control and design software in this segment is
overwhelmingly a **hardware-attach play** — the software's job is to make a specific vendor's
boxes usable, so it is either free, bundled, or licensed per-device rather than per-seat.
Evidence for that shape rather than for the prices: L-Acoustics publishes the AVDECC library
that its own Network Manager depends on as open source (FACT, see deep dive 2); Yamaha's
control protocol is implemented by a third-party Companion module with a disclaimer that
Yamaha neither develops nor supports it (FACT); Allen & Heath publishes a MIDI-over-TCP
protocol PDF (FACT, URL cited by the module that implements it). None of that is behaviour
you see from a company whose revenue is the software.

**The German/European angle.** This is one of the most European segments in the whole corpus:
d&b audiotechnik (Backnang), Sennheiser (Wedemark), AFMG (Berlin), Lawo (Rastatt), Stage Tec
(Berlin), L-Acoustics (Marcoussis), Merging Technologies (Puidoux), DiGiCo and Allen & Heath
(UK). The open-source layer follows: the most complete free RF spectrum tool found
(`wireless-microphone-analyzer`) ships **German, Austrian, Swiss and 29 other countries'**
forbidden-band tables as data (FACT, verified by reading the files — see deep dive 5), and its
vendor band plans are keyed to Sennheiser's German band letters (A, B, G, AW+, GW, GBW, BW).

---

## Product table

Every price cell reads `unverified` for the reason given in the access caveat. `Offline?`
means "can you do useful work with no device on the network". `API?` means "is there a
documented or reverse-engineered machine interface".

### Layer 1 — Acoustic prediction and system design

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| ArrayCalc | d&b audiotechnik (DE) | unverified (Win/macOS assumed) | unverified | unverified — offline design is the whole point of the category (INFERENCE) | unverified | d&b array design, aim, rigging load; hand-off to R1 (all unverified this pass) |
| R1 Remote control | d&b audiotechnik (DE) | unverified | unverified | No — it is the online half (INFERENCE from the product name) | unverified. Related: d&b **DS100** is addressable over **OSC** via the Soundscape plugins, per a third-party Chataigne module (FACT) | Online amplifier/DSP control for a d&b system |
| Soundvision | L-Acoustics (FR) | unverified | unverified | unverified | unverified | L-Acoustics array prediction |
| LA Network Manager | L-Acoustics (FR) | Win/Linux/macOS (INFERENCE from its dependency, below) | unverified | No (online control) | **Yes, indirectly and openly** — v2.5+ "relies on [the open-source LA_avdecc libraries] for all its AVDECC functionalities in compliance to the Avnu Milan Specifications" (FACT, L-Acoustics' own repo README) | Milan/AVB control of L-Acoustics amplified controllers |
| MAPP (3D / XT) | Meyer Sound (US) | unverified | unverified | unverified | unverified. Related: Meyer **Galileo GALAXY** and **CAL** are listed as tested AVB entities by the LA_avdecc library (FACT) | Meyer array prediction |
| EASE / EASE Focus | AFMG (DE) | unverified | unverified | unverified | unverified | Vendor-neutral room acoustic + electroacoustic simulation (**entirely unverified this pass**) |
| *(no open-source equivalent found)* | — | — | — | — | — | See "white space": repository search for loudspeaker coverage/SPL prediction returned **zero** relevant projects (FACT) |

### Layer 2 — DSP platforms, consoles, routing

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| Q-SYS Designer | QSC (US) | unverified | unverified | Design offline is the platform's model (INFERENCE) | **Yes — QRC**, a documented external control API. Verified method set includes `Component.Set`, `Control.Get/Set/Toggle`, `Mixer.SetCrossPointGain/Mute/Delay/Solo`, `Mixer.SetInput/OutputGain`, `Snapshot.Load/Save`, `ChangeGroup.Invalidate`, `LoopPlayer.*`, `PA.PageSubmit`, `StatusGet` (FACT, from the Companion module that calls them). Also Lua Control Scripts (FACT, from community plugins) | Whole-platform AV DSP: audio + video + control in one design file. Q-SYS Cores are also tested **AVB/Milan** entities (FACT) |
| Tesira | Biamp (US) | unverified | unverified | **Partly yes** — a third-party controller explicitly supports "build buttons offline before the Tesira is connected" (FACT) | **Yes — Tesira Text Protocol**, addressed by "Instance ID" (Tesira software) = "alias" (the protocol) (FACT) | Installed-AV DSP; matrix crosspoints, meters, subscriptions. Tesira Forte is a tested AVB entity (FACT) |
| Symetrix DSP (Composer-programmed) | Symetrix (US) | unverified | unverified | unverified | **Yes — TCP control**, default port **48631**, control numbers addressed 0–65535, preset recall, plus `get_latest_preset` to observe recalls made from SymView (FACT) | Simple, very stable integer-addressed control surface |
| dLive / Director | Allen & Heath (UK) | unverified | unverified | Director is the offline/online editor (unverified) | **Yes — "dLive MIDI Over TCP/IP Protocol V2.0"**, a published PDF. MixRack default `192.168.1.70:51325`, surface `192.168.1.71:51328`, MIDI channels 1–5 (FACT, from the module implementing it) | Full console control from outside; a third party implements "every control action ... apart from the get actions" (FACT) |
| CL / QL / Rio (RCP) | Yamaha (JP) | unverified | unverified | **No — and this is the notable one.** The third-party RCP module states: "this module only works to connected hardware. **It does not work with the Editor.**" (FACT) | **Yes — Yamaha RCP.** Notably also spoken by **Stage Tec** XDIP and NXC-T (FACT, from a Companion module for exactly that) | Deep parameter control of a connected console |
| DM3 / DM3S | Yamaha (JP) | unverified | unverified | unverified | **Yes — OSC** (FACT, Dante-BabelBox status table) | The Yamaha console with an open-ish control surface |
| X32 / M32 / Wing | Behringer / Midas (DE brand) | unverified | unverified | unverified | **Yes — OSC**, via "the long-established community reference" rather than a vendor spec (FACT) | The most third-party-integrated console family in the segment |
| SD-range | DiGiCo (UK) | unverified | unverified | unverified | **Yes — OSC** (FACT, a Companion module exists; its README is a single line, so the command set is unverified) | Large-format live console |
| ControlSpace | Bose (US) | unverified | unverified | unverified | unverified | **Entirely unverified this pass** |
| SoundGrid | Waves (IL) | unverified | unverified | unverified | unverified. Only evidence found is a 152-star community repo cataloguing DIY-compatible server hardware (FACT — which is itself a signal about the hardware-attach model) | Plugin processing over a dedicated Ethernet layer |
| VENUE | AVID (US) | unverified | unverified | unverified | unverified | **Entirely unverified this pass** |
| Lake Controller | Lab.gruppen / Lake | unverified | unverified | unverified | unverified — repository search found nothing (FACT) | **Entirely unverified this pass** |

### Layer 3 — Network audio transport and control

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| Dante Controller | Audinate (AU) | Win/macOS (INFERENCE) | unverified (widely understood free; **unverified**) | **No** — routing is discovery-driven against live devices | **No public one.** "The official Dante API for embedded devices isn't public information" (FACT, netaudio wiki). A separate app's integration is "blocked on Audinate's Dante Developer Program application (manual approval, NDA, license terms)" (FACT) | The de-facto Dante patch bay |
| Dante Domain Manager | Audinate (AU) | unverified | unverified — enterprise upsell (INFERENCE) | unverified | unverified | Multi-subnet domains, user roles, audit |
| netaudio (`network-audio-controller`) | chris-ritsen (OSS) | Python 3.9+ with a Rust core; Linux/cross-platform | Free/OSS; **PyPI `netaudio` 0.2.5, uploaded 2026-06-12** (FACT) | No (device discovery required) | **Yes — CLI with JSON output.** Does subscriptions, channel/device rename, latency, sample rate, encoding, AVIO gain, device lock/unlock, mDNS discovery (FACT) | Scripting Dante without Dante Controller; the only documented Dante protocol reference that exists |
| Hive | christophe-calmejane (OSS) | Win/macOS/Linux (AppImage), Qt 6.8.3 | Free/OSS, precompiled binaries | Partly — supports **virtual entities loaded from JSON files** (FACT) | Exports `.aem` entity models and **full network state as readable JSON / MessagePack** (FACT) | The best-documented ATDECC/Milan controller anywhere; see deep dive 2 |
| LA_avdecc libraries | L-Acoustics (FR) | Win/Linux/macOS, C++17 + C bindings | Open source | Library | **Yes** — controller API with observer + interaction interfaces (FACT) | Being the reference Milan implementation *and* a shipping vendor's product dependency |
| AES67 Linux Daemon | bondagit (OSS) | Linux (Ubuntu 18.04+, ARMv7/x86), GPL | Free/OSS | No | **Yes — REST**: `/api/config`, `/api/ptp/config`, `/api/ptp/status`, `/api/source/:id`, `/api/sink/:id`, `/api/source/sdp/:id`, `/api/sink/status/:id`, `/api/sources`, `/api/sinks`, `/api/streams`, `/api/browse/sources/[all\|mdns\|sap]`, `/api/streamer/*` (FACT) | A fully open AES67 endpoint with **NMOS IS-04/IS-05** (from v4.x) and **ST 2022-7** dual-path (from v3.0) (FACT) |
| AES67 Stream Monitor | philhartung (OSS, MIT) | macOS/Windows/Linux | Free/OSS | No | unverified | L16/L24, up to 64 ch, all AES67/RAVENNA/ST 2110-30 packet times; SAP auto-discovery **plus manual raw-SDP entry** (FACT) |
| RAVENNAKIT | soundondigital | C++ SDK — macOS/Win/Linux, containers | unverified | Library | Library API | RAVENNA + AES67 + ST 2110-30 in one embeddable SDK, with a JUCE demo app (FACT) |
| Inferno | lumifaza (GitLab, OSS) | Rust | Free/OSS | — | — | "Open source implementation of Dante AoIP in Rust" (FACT — *as listed by the awesome-aoip index*; the project itself was not opened) |
| ANEMAN | Merging Technologies (CH) | unverified | Closed source (FACT, per awesome-aoip) | unverified | unverified | "The RAVENNA equivalent for Dante Controller" (FACT, per awesome-aoip) |
| PTP Track Hound | Meinberg (DE) | unverified | "basic free version available" (FACT, per awesome-aoip) | No | unverified | PTP traffic analysis |
| PAM | martim01 (OSS) | Raspberry Pi + touchscreen, cross-platform | Free/OSS | No | unverified | Open AES67-capable monitoring: BBC PPM / EBU / Nordic / VU meters, R128 loudness, Lissajous, scope, spectrum, LTC detect, channel delay measurement (FACT) |
| Dante-BabelBox | stoatworks-labs (OSS) | Rust, cross-platform, plugin `.so`/`.dll` | Free/OSS | No | Plugin ABI (`abi_stable`) + web patch-bay + `bridge.toml` (FACT) | Translating **preamp gain/phantom across vendors** over Dante — the thing Dante itself does not carry; see deep dive 4 |

### Layer 4 — RF coordination and monitoring

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| Wireless Workbench (WWB) | Shure (US) | unverified | unverified | **Yes** — coordination is computed offline; deployment is the online half (INFERENCE, supported by the file formats below) | Device side: **ASCII "Command Strings" over TCP 2202**, documented in per-product PDFs (FACT). File side: **no published schema for `.shw`/`.cws`** (FACT) | Coordination across large multi-zone rigs. Version referenced by a verified parser: **WWB 7.8.2.63** |
| Wireless Systems Manager (WSM) | Sennheiser (DE) | unverified | unverified | Yes (INFERENCE, same shape) | Device side: **SSC — Sound Control Protocol, JSON over UDP**, discovered via mDNS `_ssc._tcp` (FACT). File side: no published schema for most exports (FACT) | Sennheiser coordination + monitoring. Version referenced by a verified parser: **WSM 4.9.0.13** |
| SystemOn | Shure (US) | unverified | unverified | unverified | unverified | **Unverified this pass** |
| RF Explorer / tinySA (hardware) | RF Explorer (ES) / tinySA | Handheld, USB serial | unverified | n/a | Serial protocol; open-source drivers exist in Go, Rust, Python and JS (FACT) | Cheap real spectrum data at the venue |
| Wireless Microphone Analyzer | berkon (OSS) | Electron — Windows `.exe`, macOS `.dmg`, Linux `.AppImage`/`.deb`; **v2.5.0** (FACT) | Free/OSS | Data is offline; scanning needs hardware | Reads RF Explorer / tinySA over serial | Overlaying **vendor channel presets**, **per-country forbidden bands** and TV channel grids on a live scan; see deep dive 5 |
| RFutils | stoatworks-labs (OSS) | Node + React, browser UI; desktop builds for macOS/Win/Linux; **v0.4.2** (FACT) | Free/OSS | **Yes** — convert, coordinate, allocate offline; deploy online | REST `/api` + WebSocket `/ws`; a Companion module exists (FACT) | An open, end-to-end RF chain: convert → coordinate (3rd/5th-order IM) → inventory → allocate → deploy; see deep dive 3 |
| wsm-wwb-bridge | stoatworks-labs (OSS, MIT) | Python 3 stdlib + Tkinter; **v1.1.0**, 123 tests (FACT) | Free/OSS | **Yes — fully offline, file-in/file-out** | Module API documented in-repo | Moving coordination data **between Shure and Sennheiser**, the single hardest interop problem in this layer |
| MicWizard | stoatworks-labs (OSS) | Electron; **v0.2.0** (FACT) | Free/OSS | No | IPC + optional Companion HTTP | Cross-vendor receiver monitoring: mDNS + Shure TCP 2202 + Sennheiser SSC + AES67 SAP/RTP metering (FACT) |
| intermod-checker | matej-hron (OSS) | TypeScript | Free/OSS | Yes | — | Standalone intermodulation check (FACT — repo exists; contents not read) |

### Layer 5 — Measurement

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| Smaart (v8 / Di) | Rational Acoustics (US) | unverified | unverified | Analysis of stored traces is offline (INFERENCE); live capture is not | **Yes — Smaart API V3.** Works with **Smaart V8.3 and Smaart Di 2.1 and newer**; **must be enabled in the API menu**; some actions require **V8.5 or newer** (FACT). ~30 remote actions verified, including trace capture, trace show/hide/rename, Y-offset, zoom presets, view presets, tab selection, delay tracking start/stop, signal generator start/stop and level, SPL meters/history toggles, peak hold (FACT) | Dual-channel transfer function measurement, and being the only measurement tool in the segment with a real remote-control API |
| PAM | martim01 (OSS) | Raspberry Pi | Free/OSS | No | unverified | Open-source metering/monitoring (see Layer 3 row) |

---

## Deep dives

### 1. Dante (Audinate) — the segment's centre of gravity, and a deliberately closed control plane

**What it does.** Dante is the dominant audio-over-IP transport in professional audio; the
awesome-aoip index calls it "the most popular AoIP solution by far" (FACT). Dante Controller
is the client every audio technician uses to make and break channel subscriptions.

**Data model — verified, and unusually well documented for a closed protocol.** The
`network-audio-controller` project's wiki is the best public reference that exists, and it is
explicit about its own status: *"This program was created by looking at network requests and
preset files made by Dante Controller ... The official Dante API for embedded devices isn't
public information, so most of this information is guesswork and will likely be wrong or
unreliable."* (FACT, direct quote.)

From that wiki, verified:

- **Discovery** is mDNS across four service types: `_netaudio-cmc._udp`, `_netaudio-dbc._udp`,
  `_netaudio-arc._udp`, `_netaudio-chan._udp`. Most describe the device; `_netaudio-chan._udp`
  describes individual channels and "isn't present on all hardware."
- **Ports** in common use: `4440`/`4455` (audio control), `24440`/`24455` (audio control, VIA),
  `8800` (control and monitoring), `8700` (device settings — sample rate, encoding, level
  control). **Port 8700 is not advertised as an mDNS service.**
- **Routing lives on `_netaudio-arc._udp`.**
- The **wire format** is a fixed-header binary protocol: byte 0 is always `0x27`, bytes 2–4 are
  the payload length ("It's important to get this correct"), bytes 4–6 a per-request sequence
  ID incremented by Dante Controller, bytes 6–8 a command ID, then arguments after a `0000`
  separator.
- Verified command IDs: `1001` device name (max 31 characters, silently truncated beyond),
  `1101` latency (in **nanoseconds**, sent twice in the same frame), `1000` channel counts
  (Rx count at byte 13:14, Tx at 15:16, both 16-bit big-endian).
- **Sample rate is set on port 8700 and produces no response at all.** Valid values 44100,
  48000, 88200, 96000, 176400, 192000.
- A sharp practical observation worth keeping: reported channel counts are the *chip's*
  capability, not the product's. A Shure AD4D uses a Dante Brooklyn II (64 channels) but
  "only using two Tx channels and one Rx channel."

**Integrations.** Everything downstream of Dante is either AES67 mode or reverse engineering.
The AES67 Linux Daemon's interoperability guide documents the real bridge procedure with
Audinate AVIOUSB and AVIOAI2 devices: enable "AES67 Mode" in the Dante device's AES67 Config
tab (may require a reboot), then create a multicast flow with "AES67" selected in Audio Flow
Config; the daemon then sees it as a remote SAP source (FACT).

**Notable strengths.** Ubiquity, and a discovery model that genuinely just works — mDNS plus
a free controller means an audio tech plugs in and sees the network. The channel-subscription
mental model ("this receiver channel gets that transmitter channel") is simple enough that
non-network people use it correctly, which is not true of anything in the video world.

**Notable limits — and these are the important ones for us:**

1. **There is no public API.** Beyond the quote above, a second independent project states its
   Dante integration is "blocked on Audinate's Dante Developer Program application (manual
   approval, NDA, license terms)" (FACT, MicWizard).
2. **Dante carries audio and discovery and nothing else.** Verified statement from
   Dante-BabelBox: *"Dante carries audio and basic mDNS-based device discovery, but nothing
   about preamp gain, phantom power, or wireless-mic status — each vendor layers its own
   proprietary control protocol on top of the same network."* (FACT.) The consequence is
   documented in deep dive 4.
3. **It is online-only by construction.** There is no offline Dante design artefact. You
   cannot plan a subscription matrix for a show that has not been racked yet, in Dante
   Controller, and hand it to someone. (INFERENCE — but nothing in any source contradicts it,
   and the whole tool is organised around a live device list.)

### 2. AVDECC / Milan (IEEE 1722.1) — the one genuinely open control plane, and a vendor who open-sourced their own dependency

**What it does.** AVDECC (now ATDECC) is the discovery, enumeration, connection-management and
control protocol of the AVB/TSN stack, standardised as IEEE 1722.1 and profiled for pro audio
by the Avnu Alliance's **Milan** specification.

**The remarkable fact.** L-Acoustics publishes `LA_avdecc` — "a set of open source libraries
for controlling and monitoring AVB entities using the AVDECC protocol (IEEE 1722.1) compliant
to Avnu Milan" — and states in the same README that **"L-Acoustics' Network Manager 2.5 (and
up) now relies on them for all its AVDECC functionalities in compliance to the Avnu Milan
Specifications"** (FACT, direct quote). A major loudspeaker manufacturer has open-sourced the
control layer of its own commercial product. Nothing comparable was found anywhere else in
this segment.

**Data model.** Pure C++17, Windows/Linux/macOS, plus C bindings (`la_avdecc_c`) and other
language bindings. Three libraries: the protocol library (1722.1-2013 plus most of
Corrigendum1-2018, plus Milan, plus Avnu Network Redundancy), a controller library, and the C
binding. The controller API has exactly two interfaces — "an observer interface to monitor all
changes on discovered entities" and "an interaction interface to send enumeration and control
(AECP) or connection management (ACMP) requests" (FACT). It uses **nlohmann JSON to read and
write JSON files** (FACT) — which is where the export capability below comes from.

**Cross-vendor reality, verified.** The library's README lists the AVB entities it has been
tested against, and this list is the best evidence in the dossier that Milan is genuinely
cross-vendor: **L-Acoustics** LA4X, LA12X, LA2Xi, P1; **Biamp** Tesira Forte; **Avid** S6L;
**MOTU** 112D, 828, Traveller, StageBox16; **Meyer Sound** Galileo GALAXY and CAL; **QSC**
Q-SYS Cores; **Apple** macOS talker/listener/controller (El Capitan and later); **AudioScience**
Hono AVB Mini; **d&b audiotechnik** DS20 (FACT).

**Hive — the controller, and the most instructive product in this dossier.** Hive is a Qt 6
ATDECC controller built on LA_avdecc. Its changelog (verified, `1.4.0` dated 2025-12-19, with a
substantial unreleased section) documents capabilities that are directly relevant to what
cable-planner does:

- **Network Graph inferred from gPTP.** A topology view built "from the gPTP information
  exposed by the entities (AsPath, grandmaster, propagation delay)", one tab per redundant
  network (Primary/Secondary, following Milan redundancy AVB interface indices), with stream
  connections drawn on the edges they transit through and **accumulated estimated reserved
  bandwidth (SR class aware)**, plus talker-to-listener path highlighting (FACT).
- **Cable length estimation from propagation delay** (FACT). The network tells you how long
  the cable is.
- **Event Journal** — "recording important network events to a crash-safe database file for
  after-show analysis (entities online/offline, stream connections, error counters, media clock
  lock, gPTP changes, link status, latency and redundancy issues)", with a timeline strip, regex
  search, severity filters, **CSV export**, and a `.hej` file association so a journal opens in
  a standalone viewer window (FACT).
- **Export formats**: `.aem` JSON entity model per device; "Entity and Full Network export as
  readable json"; all exported files use **MessagePack (JSON binary)** by default, with a SHIFT
  modifier to dump readable JSON instead (FACT).
- **Virtual entities**: JSON files can be drag-and-dropped to create entities that are not on
  the network (FACT) — the closest thing in the segment to offline design of a live network.
- Milan **1.2** support (System Unique ID, Media Clock Reference Info) in 1.3.1, Milan **1.3**
  support (System Unique ID extended, System Name, Bind/Unbind, signal-presence indicators) in
  1.4.0 (FACT).

**Notable limits.** AVB/Milan requires AVB-capable switching, which is why it lost the volume
war to Dante on ordinary networks (INFERENCE — no source in this pass states it, but the
market share language in awesome-aoip does). And the tooling is engineer-grade: Hive is
excellent at inspection and diagnosis and is not a design tool.

### 3. RF coordination — Shure WWB and Sennheiser WSM, and the file formats nobody publishes

This is the deepest verified material in the dossier, because an open-source project
(`wsm-wwb-bridge`, MIT, 123 tests) reverse-engineered both vendors' formats from real exports
and **published the schemas and the caveats**. Its own honesty statement is worth quoting:
*"Every format parser was reverse-engineered from real exports rather than from official
documentation, since neither vendor publishes full schemas for most of these files"* (FACT).

**Shure Wireless Workbench (verified against WWB 7.8.2.63):**

| Format | What it actually contains |
| --- | --- |
| `.shw` ("Show", XML) | Full **device inventory**: per-device, per-physical-channel `channel_name`, `frequency`, `group_channel` — "what's actually deployed on the gear". Also embeds the workspace data. |
| `.cws` ("Coordination Workspace", XML) | `mic_channels/freq_entry` — "the coordination engine's full **candidate** frequency pool across all RF zones". |
| Coordination report CSV | Repeating sections per RF zone ("Primary frequencies" / "Backup frequencies"), inclusion-group subheaders, columns `Type,Band,Channel name,Group & Channel,Frequency`. **This is the only place primary vs. backup is explicit.** It is a print report — WWB does not import it back. Verified against a real 291-channel export (44 primary + 247 backup across 3 zones). |
| "Import Frequencies from File" | A bare list of MHz values, comma/tab/CR-separated, **no names or groups**. "The one thing Shure documents", and "the only WWB-side format guaranteed importable". |

Two findings from that table matter more than the rest. First: **neither XML format exposes a
primary-vs-backup flag** — only the printed report does (FACT). Second: **the only documented
import path throws away everything except the number.** The project deliberately refuses to
write `.shw`/`.cws` back out, because "those files have many interdependent sections
(compatibility profiles, band planning, zone matrices) beyond channel data; generating one from
scratch risks producing a file WWB can't open cleanly" (FACT). Its sibling RFutils does offer an
experimental `.shw` writer and flags it as "reverse-engineered from a single real WWB7 file and
unvalidated by Shure" (FACT).

**Sennheiser WSM (verified against WSM 4.9.0.13):**

- **`.wsm` (native XML)** has **two frequency fields per port that are not interchangeable**:
  `CurrentFrequency` "sat at the receiver's default in a real coordinated project (didn't
  reflect the coordination result at all)", while
  `FrequencyManager/Devices/Device/AllocatedFrequency` — one entry per logical mic/IEM channel
  with Name, `StationaryDeviceType` (receiver model) and `PortableDeviceType` (transmitter
  model) — "matched the real result" (FACT). Reading the wrong field silently gives you the
  wrong answer.
- **HTML "Coordination Report"** — a `Devices:` section, one table per device category (FM Mics
  / IEM Systems / Digital devices), columns `#, Name, Stationary device, Frequency range,
  Frequency, Portable device, Squelch/Max.noise`. It is **not well-formed XML** and has to be
  parsed with an HTML parser; it contains a malformed `&microV` entity (FACT).
- **"Frequencies/Bands" CSV** — real schema `name;type;frequency;tolerance;minfrequency;maxfrequency;priority;squelchlevel`,
  lowercase, semicolon-delimited, **frequencies in kHz**. And a crucial correction: "this
  differs from Sennheiser's own docs, which imply mixed-case headers and different column names
  — the real file wins" (FACT). Also: **this is not a coordinated channel list** — it is a
  candidate pool / scan-range definition that you then run through WSM's own "Start
  Coordination" and manually drag-allocate (FACT).

**RFutils — what an open coordination engine looks like.** The successor project merges
wsm-wwb-bridge, MicWizard and an Ofcom PMSE licence-PDF converter into one browser-based suite
(v0.4.2). Its coordination engine is documented in enough detail to be assessed (all FACT, as
stated in its README):

- Spacing is a property of the **operating mode**, not the product: it cites **Shure Axient
  Digital at 350 kHz standard / 125 kHz High Density**, and **Sennheiser EW-DX at 600 kHz
  standard / 300 kHz Link Density**.
- Every such figure is labelled in-app with its provenance — *from the manufacturer's
  documentation*, *calculated from published figures*, or *no source — assumed, verify before a
  show* — with the source URL. Shure, Sennheiser, Lectrosonics and Wisycom are researched; the
  rest of the catalogue "still carries placeholders and says so".
- **Occupied bandwidth is not coordination spacing**: a PSM 1000 occupies ~175 kHz but Shure's
  own compatible-frequency count implies ~1.85 MHz of separation. Both are shown.
- **Discontiguous bands are respected** — Axient Digital G55/G57/K53/K54, Shure P55, SLX-D
  J52/M55, Sennheiser U1/5 and every Wisycom MCR54 version have gaps, and nothing is placed in a
  gap the radio cannot tune.
- **Sennheiser digital gear is placed on an equidistant grid, not by IM search**, "because that
  is how the vendor designed it to be deployed".
- Mixed rigs: the wider of two spacing requirements wins between any two radios, each radio
  keeps its own tuning raster (**Wisycom is 5 kHz, not 25**), and occupied bandwidths never
  overlap.
- The engine excludes third-order (`2·f1−f2`, `f1+f2−f3`) and optional fifth-order (`3·f1−2·f2`)
  products landing on any carrier, works on an integer-kHz raster, and is **deterministic
  (seeded)** so a request always reproduces.
- Deployment programs receivers live using Shure command strings (`SET … FREQUENCY`) and is
  **dry-run by default** — it shows the exact strings before sending anything.

That provenance-labelling discipline — every number carrying "vendor doc / derived / assumed"
plus a URL — is the single most transferable idea in this dossier.

### 4. The preamp-control gap — what Dante does not carry, and what vendors do about it

**The problem, verified.** Dante moves audio. It does not move gain. Every console vendor
therefore tunnels a private control protocol over the same wire, and Dante-BabelBox's status
table is the clearest inventory of that mess that exists (all FACT, from its README):

| Vendor | Path for preamp control | Notes |
| --- | --- | --- |
| Behringer / Midas X32, M32, Wing | **OSC** | Built from "the long-established community reference", not a vendor spec |
| Allen & Heath AHM, dLive | **NRPN over TCP** | Built from official spec |
| Yamaha DM3 / DM3S | **OSC** | Built from official spec |
| Yamaha CL, QL, Rio, Tio | **`MBC` block tunnelled inside Audinate ConMon** | Captured from a real QL1 + Rio3224-D2, decoded, rebuilt from the documentation and **transmitted back — the stagebox accepted it and changed its gain** |
| Allen & Heath DT168, DT164-W, and likely Qu/SQ | **`AllenHth` vendor messages over Audinate ConMon** | Codec built, **transport blocked**: ConMon access needs the Audinate developer API |
| Focusrite RedNet MP8R, and expected Bosch/Dynacord OMNEO and d&b | **AES70/OCA (OCP.1 over TCP)** | "Implemented from the **published standard** — no reverse engineering, and not vendor-specific. The device's objects, classes and names are discovered at runtime, so there is no vendor ONo map to be wrong." |
| Aphex 1788A | **Parametric MIDI SysEx** | Command table published; how SysEx reaches the Ethernet port is not documented |

Read that table twice. **Six of seven rows are private protocols; one is a standard.** And the
one standard row is the only one where the implementer did not have to guess anything, because
the device describes its own object model at runtime.

**The architectural response is worth stealing.** Dante-BabelBox normalises every device,
whatever the wire protocol, into **a flat list of OCA objects** — "a gain knob, a mute switch,
a battery-percent reading — each one an object with an `Ono` identity, a class, a role label,
and a value" — and a router fans events between mapped objects with echo suppression (FACT).
Vendors arrive as dynamically loaded `.so`/`.dylib`/`.dll` plugins over an `abi_stable` ABI, so
adding one needs no recompile of the host (FACT). In other words: **AES70's object model used
as the internal lingua franca even for devices that have never heard of AES70.**

**The same pattern on the RF side.** Mic telemetry gets its own trait because it is read-heavy:
Shure ULX-D and Axient Digital over **ASCII command strings on TCP 2202**; Sennheiser EW-DX EM 2 /
EM 2 Dante / EM 4 Dante over **SSC, JSON over UDP**; and — the interesting one — Shure QLX-D
*mounted on a console* over **ANSI E1.17 ACN (SLPv2 + SDT/DMP over UDP)**, read-only, and
requiring a mirrored switch port because "the receiver unicasts its events to the console"
(FACT). That last constraint is a genuinely useful operational fact: a receiver on a console
is invisible to an ordinary switch port.

Note also that this whole domain is **"Dante-optional by construction"** — every adapter talks
to the device's IP control channel, so it works whether or not the unit has a Dante card at all
(FACT).

### 5. Wireless Microphone Analyzer — regulatory and vendor data modelled as data

An Electron app (v2.5.0, verified from `package.json`) that reads an **RF Explorer** or
**tinySA** over serial and overlays four data layers on the live spectrum: vendor recommended
channel presets, forbidden ranges, congested channels, and TV channels (FACT, README).

What makes it worth a deep dive is not the UI, it is the repository layout. The data is
separated from the code as plain JSON, and it was verified by reading the tree:

- **`frequency_data/vendor_bands/`** — **17 vendor band files** (`ADX`, `AKG`, `ATA`, `EVO`,
  `HME`, `INO`, `LTS`, `MCN`, `MPR`, `QTM`, `RDC`, `SEN`, `SNY`, `SUR`, `TBN`, `TLX`, `ZCM`).
  Structure verified from `SEN_BANDS.json`: a nested `label`/`submenu` tree down to entries of
  the form `{"label": "AW+-Band (470 - 558MHz)", "start_freq": 470000, "stop_freq": 558000,
  "details": "...", "band": "SEN_AW_2000"}` — frequencies in kHz, stable machine keys separate
  from human labels.
- **`frequency_data/forbidden/`** — **32 files: AT, AU, BE, BR, CA, CH, CZ, DE, DK, ES, FI, FR,
  GB, GR, HR, HU, IL, IT, JP, NL, NO, NZ, PL, PT, RO, RU, SE, SK, TR, US, VN** plus a shared
  `forbidden.json`. Structure verified from `FORBIDDEN_DE.json`:
  `{"start": 15010, "stop": 15100, "info": "Military"}` — a flat interval list with a
  human-readable reason per interval.
- **`frequency_data/grids/`** — 8 TV-channel grids (AT, AU, BE, BR, DE, GB, RU, US). Verified
  from `GRIDS_DE.json`: `{"label": "21", "start": 470000, "stop": 478000}`.
- **`frequency_data/country_bands/`** — licensed / unlicensed / other band definitions for AT,
  AU, DE, NZ.
- **`frequency_data/presets/`** — **91 vendor channel-preset files**, named
  `<Vendor>_<Band>_<Series>.json` (for example `Sennheiser_A1-A8 + B1-B4_Digital 6000.json`,
  `Sennheiser_AW+_G4.json`, `Audix_E_R61-R62.json`).

The changelog confirms this is maintained as a live dataset: v2.5.0 added Shure UHF J4 presets
and Sennheiser EW300/500 G4, Digital 6000, EW D and EW100 G4 presets; v2.4.0 added New Zealand
forbidden and unlicensed bands; v2.3.0 added Austria (FACT).

**Why this matters to us.** This is the shape of a maintainable regulatory dataset: intervals,
machine keys, human labels, one file per country, one file per vendor, versioned in git, with
a changelog entry every time a country or a product line is added. It is exactly the pattern
cable-planner's library and light-planner's fixture data should follow, and it exists already
in a form that could be referenced rather than reinvented.

### 6. Q-SYS Designer and the "platform" model

**What it does.** Q-SYS is the clearest example in the segment of the platform model: one
design file describes audio DSP, video and control for an entire installation, deployed to a
Core appliance.

**API — verified in detail, because a Companion module enumerates it.** The external control
protocol is **QRC**, documented at `q-syshelp.qsc.com` (URL cited by the module; the page
itself was not reachable this pass). Verified method set: `Component.Set`, `Control.Get`,
`Control.Set`, `Control.Toggle`, `Mixer.SetCrossPointGain`, `Mixer.SetCrossPointMute`,
`Mixer.SetCrossPointDelay`, `Mixer.SetCrossPointSolo`, `Mixer.SetInputGain`,
`Mixer.SetInputMute`, `Mixer.SetInputSolo`, `Mixer.SetInputCueEnable`, `Mixer.SetInputCueAfl`,
`Mixer.SetOutputGain`, `Mixer.SetOutputMute`, `Mixer.SetCueGain`, `Mixer.SetCueMute`,
`Snapshot.Load`, `Snapshot.Save`, `ChangeGroup.Invalidate`, `LoopPlayer.Start/Stop/Cancel`,
`PA.PageSubmit`, `StatusGet` (FACT).

**One data-model detail worth stealing outright.** The mixer API addresses inputs and outputs
with a compact **range/negation selector string**: `*` = everything, `1 2 3` = those channels,
`1-6` = a range, `1-6 9` = a range plus one, `1-3 5-9` = two ranges, `1-8 !3` = a range minus
one, `* !3-5` = everything except a range (FACT). That is a genuinely good notation for any
tool that has to express "these channels, but not those" — patch selections, tally groups,
cable bundles — and it is far more compact and more diff-able than an array of IDs.

**Scripting.** Q-SYS Designer runs **Lua** in Control Script components; community plugins
exist that drive REST APIs on third-party hardware from inside the design (FACT, from
`q-sys` plugin repositories for Yealink AVHub and Matrox Monarch HDX). So the platform is not
just controllable from outside, it is a control host in its own right.

**Cross-vendor position.** Q-SYS Cores appear in the LA_avdecc tested-entity list, so a Q-SYS
Core is a Milan-capable AVB entity as well as a Dante-capable one (FACT).

---

## Standards & protocols

### Transport and timing

| Standard | Status here | Notes |
| --- | --- | --- |
| **AES67** | The open AoIP interoperability standard (FACT, awesome-aoip). A public draft revision was in call-for-comment at aes2.org (FACT, as listed) | The lingua franca. Dante devices reach it via an explicit per-device "AES67 Mode" that may require a reboot (FACT) |
| **SMPTE ST 2110-30** | AES67-based audio inside an ST 2110 video plant; "adds some constraints to AES67" (FACT, awesome-aoip) | The broadcast-side profile |
| **SDP** (Session Description Protocol) | **The actual interchange format for a stream.** The AES67 daemon exposes `/api/source/sdp/:id`; AES67 Stream Monitor lets users add streams "by adding raw SDP data" (FACT) | If anything in this segment is a portable "wire document", it is an SDP blob |
| **SAP** (Session Announcement Protocol) | How AES67 streams announce themselves (FACT) | Discovery |
| **mDNS / DNS-SD** | Discovery for Dante (`_netaudio-*._udp`), RAVENNA, and Sennheiser SSC (`_ssc._tcp`) (FACT) | The universal discovery layer |
| **PTP / gPTP** (IEEE 1588, IEEE 802.1AS) | Clocking. `linuxptp` (`ptp4l`, `phc2sys`) is the open implementation; PTP Track Hound analyses the traffic (FACT) | Hive infers network topology from gPTP AsPath, grandmaster and propagation delay (FACT) |
| **ST 2022-7** | Seamless dual-path redundancy; supported in AES67 Linux Daemon from v3.0 when two interfaces are configured (FACT) | Both PTP and SAP/mDNS run on all interfaces |
| **AVB / TSN** (IEEE 802.1) | The Ethernet layer under Milan | Requires AVB-capable switching |
| **IEEE 1722 (AVTP)** | AVB stream transport | |
| **IEEE 1722.1 (AVDECC / ATDECC)** | Discovery, enumeration, connection management, control. 1722.1-2013 plus Corrigendum1-2018 implemented in LA_avdecc (FACT) | AECP = control, ACMP = connection management |
| **Avnu Milan** | Pro-audio profile on 1722.1. Versions verified via Hive's changelog: **Milan 1.2** and **Milan 1.3** feature support; a repository exists for the "**Milan Baseline Interoperability Specification 2.0a-2023**" (FACT) | Plus Avnu Network Redundancy (dual interface) |
| **AES70 / OCA**, wire protocol **OCP.1** | The vendor-neutral device control standard. Implemented from the published standard alone, with the device's objects, classes and names discovered at runtime (FACT) | Open-source tooling exists: an OCP.1 binary string generator, and an ESP-IDF device-side implementation with gain/dynamics/filters/EQ/crossover objects, notifications, mDNS and TLS (FACT) |
| **NMOS IS-04 / IS-05** | Registration/discovery and connection management; in AES67 Linux Daemon from v4.x, tested against Sony's `nmos-cpp` registry and a Riedel NMOS explorer (FACT) | The bridge between audio-over-IP and the broadcast IP control world |
| **IPMX** | "A proposed set of open standards and specifications for control, copy protection, connection management and security" (FACT, awesome-aoip) | Watch item |
| **RAVENNA** | "Second most popular AoIP solution, which is more open than Dante" (FACT, awesome-aoip) | Merging's ALSA driver is GPL but "doesn't accept contributions" (FACT) |
| **Dante** | Proprietary. mDNS service types, ports and a partial command set are documented only by reverse engineering (FACT) | See deep dive 1 |
| **Audinate ConMon** | Dante's control-and-monitoring channel (port 8800), used by **Yamaha** (`MBC`) and **Allen & Heath** (`AllenHth`) as a tunnel for their own preamp protocols (FACT) | Access to it as a developer requires the Audinate API |

### Device control protocols

| Protocol | Vendor / scope | Verified detail |
| --- | --- | --- |
| **QRC** | QSC Q-SYS | JSON-RPC-style named methods; see deep dive 6 |
| **Tesira Text Protocol** | Biamp | Objects addressed by alias ("Instance ID" in the GUI) |
| **Symetrix TCP** | Symetrix | Default port 48631; control numbers with values 0–65535 |
| **Yamaha RCP** | Yamaha; **also Stage Tec** XDIP and NXC-T | Hardware only — does not work against Yamaha's offline Editor |
| **dLive MIDI over TCP/IP V2.0** | Allen & Heath | Published PDF; MixRack `:51325`, surface `:51328`, MIDI channels 1–5 |
| **NRPN over TCP** | Allen & Heath AHM, dLive | |
| **OSC** | DiGiCo, Behringer/Midas X32 & Wing, Yamaha DM3, d&b Soundscape/DS100 | The nearest thing to a common console dialect |
| **Shure Command Strings** | Shure wireless receivers, DSPs | ASCII over **TCP 2202**; documented in per-product PDFs — "the one thing Shure documents" alongside frequency-list import |
| **SSC (Sound Control Protocol)** | Sennheiser; **also Neumann** KH 120 II / KH 750 DSP | JSON over UDP, mDNS `_ssc._tcp` |
| **ANSI E1.17 ACN** (SLPv2 + SDT/DMP) | Shure QLX-D mounted on a console | Read-only; unicast to the console, so a mirrored port is required |
| **Smaart API V3** | Rational Acoustics | Must be enabled in the API menu; V8.3 / Di 2.1 minimum, some actions V8.5+ |
| **MIDI SysEx** | Aphex 1788A | Published command table; transport to the Ethernet port undocumented |

### File and interchange formats

| Format | Owner | Status |
| --- | --- | --- |
| `.shw` / `.cws` | Shure WWB | XML. **No published schema.** Reverse-engineered read support exists; writing is considered unsafe (FACT) |
| WWB coordination report CSV | Shure WWB | Print-only; the sole carrier of primary-vs-backup (FACT) |
| WWB frequency list (`.txt`) | Shure WWB | The **only** documented, guaranteed-importable format — and it carries **nothing but MHz values** (FACT) |
| `.wsm` | Sennheiser WSM | XML. No published schema. `AllocatedFrequency` is the real answer; `CurrentFrequency` is a decoy (FACT) |
| WSM HTML coordination report | Sennheiser WSM | Not well-formed XML; contains a malformed `&microV` entity (FACT) |
| WSM Frequencies/Bands CSV | Sennheiser WSM | `name;type;frequency;tolerance;minfrequency;maxfrequency;priority;squelchlevel`, kHz, semicolon. **Real schema differs from Sennheiser's own documentation** (FACT). Candidate pool, not coordinated channels |
| `.aem` | Hive / AVDECC | JSON entity model export per device (FACT) |
| Hive full-network export | Hive | MessagePack by default, readable JSON with a SHIFT modifier (FACT) |
| `.hej` | Hive | Event journal database, file-associated to a standalone viewer (FACT) |
| SDP | IETF / AES67 | The one genuinely portable stream description (FACT) |
| **GLL / CLF** loudspeaker data | AFMG / CLF Group | **Unverified this pass** — named here only as a re-run item, not asserted |
| Q-SYS design file | QSC | **Unverified this pass** |
| Dante Controller presets | Audinate | Exist and were used as reverse-engineering input (FACT), but the format is undocumented |

---

## What this segment does WELL

**1. It ships an end-to-end chain inside one vendor's walls, and the chain actually works.**
Design in ArrayCalc, deploy with R1; predict in Soundvision, control with LA Network Manager.
The design tool and the control tool share a device model, so a loudspeaker you placed is a
loudspeaker you can mute. (INFERENCE from product pairing; the internals are unverified.) No
tool in cable-planner's own segment does this — technical-planning documented the same tools
stopping at the drawing.

**2. Standards-based control, where it exists, is real and not marketing.** The Milan tested-
entity list spans nine manufacturers including three direct competitors (L-Acoustics, Meyer,
d&b) in the same list (FACT). AES70 was implemented against the published standard alone with
no reverse engineering and no vendor-specific object map, because devices describe themselves
(FACT). When this segment standardises, it standardises properly.

**3. Self-describing device models beat static device libraries.** The AES70 plugin discovers
"the device's objects, classes and names at runtime, so there is no vendor ONo map to be wrong"
(FACT). Compare a hand-maintained equipment library that goes stale the moment a firmware
update adds a port. This is the single most important design lesson in the dossier for
cable-planner's library.

**4. Diagnostic depth that treats the show as a timeline, not a state.** Hive's Event Journal
records entities going offline, stream connections, error counters, media clock lock, gPTP
changes, link status, latency and redundancy issues to a **crash-safe** file, plots them on a
timeline with "time since previous occurrence" on hover, and exports CSV — explicitly for
"after-show analysis" (FACT). Most planning tools record what you intended; this records what
happened.

**5. Regulatory and vendor data kept as versioned data, not code.** 32 countries of forbidden
bands, 17 vendor band plans, 91 channel presets, each a small JSON file with intervals, machine
keys and human labels, with a changelog entry per country added (FACT). This is how domain data
should be shipped.

**6. Provenance labelling on every derived number.** RFutils marks each spacing figure as *from
the manufacturer's documentation*, *calculated from published figures*, or *no source — assumed,
verify before a show*, with the source URL, and says openly which vendors in its catalogue are
still placeholders (FACT). A planning tool that told the user which of its numbers were
authoritative would be more trustworthy than one that presents everything with equal confidence.

**7. Dry-run before write.** RFutils' deployment shows the exact Shure command strings before
sending, and is dry-run by default; the Companion module keeps frequency programming a dry run
unless explicitly ticked (FACT). Any feature of ours that writes to real hardware should copy
this exactly.

**8. Failure is visually distinct from stale.** The RFutils Companion module uses blue for "this
channel stopped reporting", because "without it a dead receiver would look exactly like a
healthy one" (FACT). That is a real, cheap, transferable UI rule for tally, intercom and any
device-status view.

**9. Compact selector notation.** Q-SYS's `1-8 !3` / `* !3-5` mixer strings (FACT) are a better
way to express channel sets than arrays of IDs.

**10. Free entry-level tooling as an ecosystem strategy.** Dante Controller, the vendor
prediction tools and the RF planners are all understood to be free adjuncts to hardware
(pricing **unverified**, but the pattern is visible in how third parties treat them). The
software's job is to make the hardware usable.

---

## What NOBODY in this segment solves well

**1. There is no vendor-neutral system-design interchange format. None.** Lighting has GDTF and
MVR — light-planner already imports them. Video has NMOS. Audio has **nothing** at the design
layer. You cannot export "this is my PA system" from ArrayCalc and open it in Soundvision, or
hand a Q-SYS design to a Biamp integrator. The closest thing to a portable audio document in
this whole dossier is an **SDP blob describing one stream**. This is the segment's defining
white space, and it is the one that maps most directly onto a planning product.

**2. Cross-vendor RF coordination is a third-party rescue operation.** Verified: "neither vendor
publishes full schemas for most of these files" (FACT). The only guaranteed import path into
Shure WWB is a bare list of MHz numbers with **no names, no groups, no zones** (FACT). So the
standard workflow for a mixed Shure/Sennheiser rig — which is most large rigs — is: coordinate
in one tool, export numbers, retype names in the other. An MIT-licensed Python app with 123
tests exists solely to make that less painful.

**3. The design layer and the network layer never meet.** A Dante subscription is "device A
channel 3 → device B channel 7". A cable plan is "XLR 12 from stagebox 2 to patch panel B".
Nothing maps between them. There is no tool that can answer "which physical cable carries the
channel that is subscribed here", and no tool that can plan a subscription matrix offline
against a rig that has not been built. (INFERENCE — but Dante Controller is discovery-driven by
construction, and no offline Dante design artefact appeared in any source.)

**4. Preamp control over Dante is seven private protocols wearing one trench coat.** Six of the
seven paths in deep dive 4's table are proprietary; two of them are *tunnelled inside Audinate's
own ConMon channel*, which itself requires a licensed developer API to speak (FACT). The one
open path (AES70) is implemented by exactly one open-source project and has "never been run
against any AES70 device" (FACT).

**5. There is no open-source acoustic prediction tool at all.** Repository searches for
loudspeaker array coverage, SPL prediction and PA system design returned **zero** relevant
projects (FACT). What exists is academic room-acoustics simulation — image-source models, FDTD,
ray tracing, `gpuRIR`, `pyroomacoustics` derivatives — which answers a different question
(reverberation, impulse responses) and produces nothing an integrator can put in a document.
The gap between "research acoustics" and "where do I hang the speakers" is total.

**6. Measurement results never flow back into the design.** Smaart has a genuine remote-control
API (FACT) with ~30 actions — and every one of them is a *UI* action: capture trace, show trace,
zoom, set generator level. There is no "export the measured response and reconcile it with the
predicted response" path in anything found. Prediction and verification are separate universes.

**7. RF coordination is disconnected from physical planning.** A coordination result is a list
of frequencies. It knows nothing about where the antennas are, what the cable runs are, which
rack the receivers live in, or which talent wears which pack — except in RFutils, which added
inventory and allocation and is at v0.4.2 with an explicitly experimental deployment path
(FACT). Nobody has joined RF planning to the venue drawing.

**8. Regulatory data is per-tool, per-country and unshared.** The 32-country forbidden-band
dataset is excellent and it lives inside one Electron app's repository. There is no shared,
citable, versioned dataset of PMSE/SRD allocations that multiple tools consume. Every tool that
needs it rebuilds it.

**9. "Offline design" is not a category anyone serves at the network layer.** Yamaha's own
control protocol explicitly does not work against Yamaha's own offline Editor (FACT). Biamp's
Tesira is the honourable exception — a third-party controller advertises "build buttons offline
before the Tesira is connected" as a feature, and Hive's virtual entities loaded from JSON are
the same idea (FACT). But the default assumption everywhere is: the gear is on the network, or
you cannot work.

**10. Nothing produces the document a broadcast audio engineer actually needs.** The artefact
that matters for an OB truck or a festival is one sheet that runs mics → stagebox → console →
Dante/MADI → intercom → transmission, with channel names consistent end to end. Every tool here
owns one column of that sheet and exports it in a format the next tool cannot read. The
technical-planning dossier found the same shape on the cable side, and noted AudioPatch's
festival model (one master patch, N derived per-act views) as the closest thing to a solution.

**11. The Dante developer wall is a structural moat.** Two independent open-source projects
were stopped at exactly the same place: an NDA-gated developer programme with manual approval
(FACT, MicWizard and Dante-BabelBox). Anything that wants to integrate deeply with the dominant
transport must either sign, or reverse engineer.

---

## Relevance to AV Planner Suite

Ordered by strength of fit.

### cable-planner — strong, and in two distinct ways

**(a) Audio is the missing signal domain in the cable plan.** cable-planner already models SDI
signal flow, racks and inventory, and technical-planning noted its colour-coded signal types
cover Dante and AVB as *labels*. The gap identified above — that no tool maps a Dante
subscription to a physical cable — is a gap cable-planner is structurally closer to filling
than any audio vendor is, because it already owns the physical half. A `Cable` whose payload is
"Dante channels 1–16 of device X" is a small extension of an existing type; the audio industry's
inability to produce it is not a technical limit, it is a consequence of every audio tool being
device-centric rather than plan-centric.

**(b) Concrete patterns to steal, in priority order:**

1. **Provenance labels on derived numbers.** cable-planner computes lengths, power and loads.
   Marking each derived figure as measured / calculated / assumed — RFutils-style, with the
   source — would be a differentiator and costs almost nothing. `healProjectPositions` is the
   natural place to default the field on existing projects.
2. **Self-describing device models over static libraries.** The AES70 lesson (runtime object
   discovery, no vendor map to be wrong) argues for the equipment library treating a device's
   own reported port list as authoritative where one is available, and the static entry as a
   fallback. Relevant to the NetBox import work already in flight.
3. **Interval-list data files with machine keys and human labels**, one file per country/vendor,
   changelog per addition — the `frequency_data/` layout. Directly applicable to the equipment
   library and to any future regulatory or standards data.
4. **Dry-run before any write to hardware**, showing the exact command strings.
5. **An event journal.** Hive's `.hej` + CSV export + timeline with "time since previous
   occurrence" is a better model for a show-day log than a state view. Relevant if
   cable-planner ever grows live device status.
6. **Compact selector notation** (`1-8 !3`) for channel/port sets in the UI and in the project
   file — more readable, far better diffs.
7. **Cable length estimation from network telemetry.** Hive derives cable length from gPTP
   propagation delay (FACT). If an installed network can tell you how long a run is,
   cable-planner could reconcile planned length against measured length. This is a genuinely
   novel feature and nobody in the planning segment has it.

### broadcast-intercom — strong

Intercom sits on the same networks and increasingly on the same transports. Directly relevant:
**AES67/SDP** as the interchange for a stream, **`_ssc._tcp` / SSC** as an example of a clean
JSON-over-UDP device protocol, **NMOS IS-04/IS-05** as the registration/connection model
(already relevant to the intercom dossier), the **ST 2022-7** dual-path pattern, and the
**blue-means-stale** status rule. The AES67 Linux Daemon's REST surface
(`/api/source/:id`, `/api/sink/:id`, `/api/sink/status/:id`, `/api/browse/sources/[all|mdns|sap]`)
is a well-shaped, small API for a networked audio endpoint and is worth reading as a design
reference before extending intercom's own.

### shell / suite — moderate, but strategically the most important row

The white space in point 1 — no vendor-neutral audio design interchange — is a *suite-level*
opportunity, not a per-app one. The suite already carries `.avplan` (`AVPLAN_VERSION = 1`, with
`domains: { cameras, lighting, cabling }`) and `venue-exchange`. **Adding an `audio` domain to
`.avplan` would put the suite in a position no commercial audio tool occupies**: one file that
holds the venue, the cameras, the lighting rig, the cable plan *and* the audio system. Given
that light-planner already consumes GDTF/MVR and there is no audio equivalent to consume, the
suite would be defining the format rather than importing one — which is a much larger
commitment and should be scoped deliberately. The repos INVENTORY warns that the format
currently lives in three places kept aligned by hand; adding a domain makes consolidating that
a prerequisite, not a nice-to-have.

### light-planner — moderate, as precedent rather than as integration

light-planner's GDTF/MVR support is the proof that a neutral interchange format changes what a
planning tool can do. It is the argument to point at when scoping the audio domain above. No
direct technical overlap.

### multicam-planner — weak but real

Two touch points: shared venue geometry (a loudspeaker coverage overlay and a camera coverage
overlay are the same geometric problem on the same floor plan, and multicam-planner already has
the 2D/3D venue), and RF — camera links, IEM and radio mics compete for spectrum at the same
venue, so an antenna/frequency layer belongs on the venue plan that multicam-planner owns.

### sony-camera-bridge — weak, as an architectural precedent

The Dante-BabelBox architecture is the same problem sony-camera-bridge solves in a different
domain: many vendors, incompatible control protocols, one normalised internal model. Two
specifics worth reading across: **normalising every device into a flat object list with an
identity, a class, a role label and a value** (rather than a per-vendor schema), and **echo
suppression** so a device's own confirmation of a command does not bounce between
bidirectionally mapped peers. The dynamically-loaded plugin ABI (`abi_stable`, drop a file in
a directory, no host recompile) is a more ambitious version of the same idea.

### tally-pi — weak

Only the status-display rules transfer: blue for "stopped reporting" versus a remembered value,
and the metering-interval warning from the Shure Companion module — "if the metering interval is
too low (fast), you can lock yourself out of the GUI" (FACT) — which is a real lesson about
polling rates on constrained appliances.

### pi-media-station — none found

---

## Not verified / open questions (re-run list when egress allows)

Ordered by how much the dossier would improve. Every item is a page that could not be opened
this pass.

**Pricing — the whole category is a blank.** Nothing below is even estimated:

1. `dbaudio.com` — ArrayCalc and R1: licence model, whether registration-gated, platform support.
2. `l-acoustics.com` — Soundvision and LA Network Manager: same questions; confirm LA Network
   Manager's current version (the repo evidence says "2.5 and up" as of the README).
3. `afmg.eu` — EASE, EASE Focus, EASE Evac, SysTune: edition tiers and prices. **EASE is the
   single largest hole in this dossier** — it is the only vendor-neutral prediction tool in the
   seed list and nothing about it is verified.
4. `audinate.com` — Dante Controller licensing, **Dante Domain Manager pricing tiers**, and the
   Dante Developer Program terms (both open-source projects were blocked on it, so the terms are
   commercially significant).
5. `qsc.com` / `q-syshelp.qsc.com` — Q-SYS Designer licence model, Core licensing, and the full
   QRC reference (the method list here is only what one module calls).
6. `shure.com` — Wireless Workbench and SystemOn licensing; the per-product **Command Strings**
   PDFs (cited as the authority by two projects but never read here).
7. `sennheiser.com` — WSM licensing and the **SSC protocol specification**.
8. `rationalacoustics.com` — Smaart v9 (this dossier only has evidence up to V8.5-era API
   behaviour); edition tiers and prices; whether the API is in all editions.
9. `meyersound.com` — MAPP 3D / MAPP XT.
10. `biamp.com`, `symetrix.co`, `bose.com`, `waves.com`, `avid.com` — everything.

**Technical questions that would materially change conclusions:**

11. **Does a neutral loudspeaker data format have real adoption?** GLL (AFMG) and CLF are named
    in this dossier only as re-run items. Confirm they exist as claimed, who publishes them, who
    consumes them, and whether either is readable outside its originating tool. If one of them is
    genuinely neutral and adopted, white-space point 1 weakens considerably.
12. `aes.org` / `pubs.aes.org` — the AES67 and AES70 documents themselves; the AES67 revision
    draft status.
13. `avnu.org` — the Milan specification versions (this dossier has 1.2, 1.3 and "2.0a-2023" from
    three different third-party sources and cannot reconcile them).
14. `ravenna-network.com` — RAVENNA's relationship to AES67 and its control layer.
15. `rhconsulting.uk/blog/networked-audio-products-2025/` — the annual AoIP product census.
    Would give real market-share shape instead of the qualitative "most popular by far".
16. Whether **Dante Domain Manager** exposes any API. If it does, several conclusions about the
    closed control plane need softening.
17. Whether **Q-SYS Designer's design file** is documented or parseable.
18. `gearspace.com/board/music-computers/1221989-...` — the discussion thread where the Dante
    reverse engineering was worked out; practitioner context for how much of it is trusted.
19. German regulatory primary sources (BNetzA) for PMSE allocations, to check the
    `FORBIDDEN_DE.json` dataset against the actual allocation table.

**Evidence-quality caveats to carry forward:**

20. Three of the most detailed sources here — MicWizard, Dante-BabelBox, wsm-wwb-bridge/RFutils —
    are by one author (`stoatworks-labs`) and are **AI-assisted projects that say so in their own
    READMEs**, with most adapters explicitly *not validated against real hardware*. Their **format
    and protocol documentation** is well-evidenced (cross-checked against real exports, and in the
    Yamaha case proven on hardware) and is what this dossier relies on. Their **claims about how
    well the code works** are not relied on anywhere above, and should not be.
21. The `.shw` writer in RFutils is "reverse-engineered from a single real WWB7 file and
    unvalidated by Shure" (their words). Do not treat `.shw` as a writable format.

---

## Sources

Every URL below was opened directly this pass (git clone, `raw.githubusercontent.com`, or
`pypi.org`) unless marked otherwise. Repository *search* results were returned by the GitHub
search API; where a repository is cited only for its existence and description, that is stated.

### Read as primary source (cloned or fetched in full)

- https://github.com/Mo-way/awesome-aoip — `README.md` (curated AoIP index; the source for
  ANEMAN, PTP Track Hound, Inferno, RAVENNA/Dante market-position statements)
- https://github.com/chris-ritsen/network-audio-controller — `README.md`
- https://github.com/chris-ritsen/network-audio-controller/wiki — wiki repository cloned;
  `Technical-details.md` read in full (the Dante protocol reference)
- https://pypi.org/pypi/netaudio/json — package metadata (version 0.2.5, uploaded 2026-06-12)
- https://github.com/L-Acoustics/avdecc — `README.md`
- https://github.com/christophe-calmejane/Hive — `README.md`, `CHANGELOG.md`
- https://github.com/bondagit/aes67-linux-daemon — `README.md`, `daemon/README.md` (REST API),
  `DEVICES.md` (Dante interoperability procedure)
- https://github.com/philhartung/aes67-monitor — `README.md`, `package.json`
- https://github.com/soundondigital/ravennakit — `README.md`
- https://github.com/martim01/pam — `README.md`
- https://github.com/stoatworks-labs/MicWizard — `README.md`
- https://github.com/stoatworks-labs/wsm-wwb-bridge — `README.md` (the WWB/WSM format reference)
- https://github.com/stoatworks-labs/Dante-BabelBox — `README.md` (the preamp/telemetry protocol
  inventory)
- https://github.com/stoatworks-labs/RFutils — `README.md` (the coordination engine reference)
- https://github.com/berkon/wireless-microphone-analyzer — repository cloned; `README.md`,
  `package.json`, `CHANGELOG.txt`, and the `frequency_data/` tree read directly
  (`grids/GRIDS_DE.json`, `vendor_bands/SEN_BANDS.json`, `forbidden/FORBIDDEN_DE.json`, plus
  directory listings for the 17 vendor / 32 country / 91 preset counts)
- https://github.com/bitfocus/companion-module-shure-wireless — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-sennheiser-digital6000 — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-qsys-remote-control — `companion/HELP.md` (the QRC
  method list)
- https://github.com/bitfocus/companion-module-rationalacoustics-smaart3 — `companion/HELP.md`
  (the Smaart API V3 action list)
- https://github.com/bitfocus/companion-module-yamaha-rcp — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-biamp-tesira — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-symetrix-dsp — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-allenheath-dlive — `companion/HELP.md`
- https://github.com/bitfocus/companion-module-digico-osc — `README.md` (single line; module
  existence only)
- https://github.com/bitfocus/companion-module-shure-wireless — `README.md`

### Cited for existence and description only (returned by repository search; not opened)

- https://github.com/audioscience/avdecc-lib
- https://github.com/PADL/AVDECCSwift
- https://github.com/zarfld/Milan-Baseline-Interoperability-Specification-2.0a
- https://github.com/escalonely/AES70_OCP1_StringGenerator
- https://github.com/DatanoiseTV/aes70-esp-idf (AES70/OCA device-side for ESP-IDF)
- https://github.com/madees/dbaudio-SSC-Plugin-Chataigne-Module (d&b Soundscape / DS100 OSC)
- https://github.com/Varitras/neumann-connect (Neumann KH DSP over SSC)
- https://github.com/perlindgren/ssc, https://github.com/Kilobyte22/rust-ssc,
  https://github.com/mrderkis/sennheiser-ew-dx-2
- https://github.com/matej-hron/intermod-checker
- https://github.com/samuel/rfexplorer, https://github.com/zleytus/rfe (RF Explorer drivers)
- https://github.com/bitfocus/companion-module-stagetec-rcp (Stage Tec over Yamaha RCP)
- https://github.com/bitfocus/companion-module-allenheath-{sq,qu,avantis,ahm,cq,dlive-ilive}
- https://github.com/bitfocus/companion-module-shure-{mxw,scm820,mxcw,dsp,psm1000,chargers,dis-ccu,dca901,mxn5,mxa910,p300,ani4in}
- https://github.com/bitfocus/companion-module-biamp-{audia,qtx}
- https://github.com/bitfocus/companion-module-yamaha-{adecia,ad8hr}, companion-surface-yamaha-cc1
- https://github.com/bitfocus/companion-module-lawo-vpro8
- https://github.com/TheLazyGeekGuy/DIY-Waves-Soundgrid-Server
- https://github.com/i3T4AN/qsys-av-scheduler, https://github.com/takouzlo/QSYS_YLINK_HTTP_CLIENT_1.1,
  https://github.com/daniel-lorenzo-silveira/qsys-plugin-matrox-monarch-hdx (Q-SYS Lua plugins)
- https://github.com/alekseich91-cell/portal (line-array rigging load calculator)
- https://github.com/DavidDiazGuerra/gpuRIR, https://github.com/gregzanch/cram,
  https://github.com/Yhonatangayer/shroom (academic room acoustics — cited as evidence of the
  *absence* of a design-layer open-source tool)
- https://github.com/stoatworks-labs/companion-module-rfutils, https://github.com/stoatworks-labs/pmse-to-wwb

### URLs referenced by the sources above but NOT opened (blocked at the egress proxy)

Listed because the dossier cites the *claim* that points at them, not the pages themselves:
`q-syshelp.qsc.com/#External_Control_APIs/QRC/QRC_Overview.htm`,
`allen-heath.com/content/uploads/2024/06/dLive-MIDI-Over-TCP-Protocol-V2.0.pdf`,
`audinate.com/learning/faqs/which-network-ports-does-dante-use`,
`audinate.com/products/software/dante-controller`, `merging.com/aneman/`, `ptptrackhound.com`,
`aes.org/publications/standards/search.cfm?docID=96`, `smpte.org/standards/st2110`,
`ravenna-network.com/resources/`, `rhconsulting.uk/blog/networked-audio-products-2025/`,
`getdante.com/resources/training/dante-certification-program/`,
`download.yamaha.com/files/tcm:39-868466/` (Yamaha's Dante-to-AES67 guide),
`gearspace.com/board/music-computers/1221989-dante-routing-without-dante-controller-possible.html`,
`bitbucket.org/MergingTechnologies/ravenna-alsa-lkm`, `gitlab.com/lumifaza/inferno`,
`linuxptp.sourceforge.net`, `ipmx.io/about/`, `roc-streaming.org`, `jacktrip.github.io/jacktrip/`,
`shure.com/en-US/products/wireless-systems/axient_digital/ad4d`,
`audinate.com/products/manufacturer-products/dante-brooklyn-ii`.
