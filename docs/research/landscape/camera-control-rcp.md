# Camera Control / RCP / CCU / Paint

> Research corpus entry. Date of research: **2026-08-28**. Language: EN (repo docs mix DE/EN,
> research corpus stays EN).

## Research conditions for this dossier (read first)

This session had **no working web search** (search quota exhausted before the first query) and
the outbound proxy **blocked every vendor and reseller domain** that was tried:
`cyanview.com`, `skaarhoj.com`, `pro.sony`, `blackmagicdesign.com`, `rossvideo.com`,
`ptzoptics.com`, `bitfocus.io`, `bhphotovideo.com`, `en.wikipedia.org`, `web.archive.org`.
Reachable hosts were `github.com`, `raw.githubusercontent.com`, `gitlab.com`, `pypi.org`.

Consequences, stated up front so nothing here is mistaken for more than it is:

- **No price in this dossier is verified.** Every price cell reads "requires sales contact" or
  "unverified". Nothing is quoted as "as advertised", because no advertised price page could be
  opened. What *is* verified is the **licence model** where a document states it.
- Vendor claims about **Sony RCP-1500/1530, MSU-1000/1500, Panasonic AW-RP150/RP60, Grass Valley
  C2IP/OCP-400, Ross CCU, Lawo .edge, Riedel SimplyLive, Telemetrics, Mo-Sys, Areto, Bexel** could
  not be read from primary sources. They appear below only where a *third* source describes their
  protocol or their integration, and are labelled UNVERIFIED otherwise.
- The single richest source reached was the **Cyanview support documentation repository**
  (`AlanOgic/cyanview-support`, a Docusaurus site whose in-page chat streams from
  `https://cyanview.cloud/api/search/stream`) plus **CyFig**, a Cyanview product configurator
  (`AlanOgic/cyfig`). FACT: these repos contain Cyanview product, licence, protocol and
  compatibility documentation. INFERENCE: they are vendor-authored or vendor-commissioned rather
  than independent — treat their content as **vendor documentation at one degree of separation**,
  not as neutral testing.

Labels used throughout: **FACT** (read on a cited page), **INFERENCE** (my reasoning),
**UNKNOWN/UNVERIFIED** (could not check, with a note on what to check).

---

## Segment summary

This segment covers the equipment and software that a **shader / vision operator / camera control
operator** uses during a live production to keep multiple cameras matched and correctly exposed,
and that a **PTZ operator** uses to fly and frame remote heads. Four overlapping jobs sit under one
label:

1. **CCU / paint** — iris, master black, master gamma, knee, detail, R/G/B white and black balance,
   matrix, gain, shutter, ND. Classically a per-camera hardware panel (RCP) plus a master setup unit
   (MSU) that owns scene files and multi-camera matching.
2. **PTZ operation** — pan/tilt/zoom/focus, presets, speed ramps, on remote heads.
3. **Bridging** — one panel driving cameras that were never designed to share a protocol (broadcast
   system cameras, cinema cameras, mirrorless bodies, PTZ heads, box cameras).
4. **Signalling around it** — tally in and out, monitor/multiviewer routing, lens control.

Who buys it: OB truck and flypack builders, rental houses, stadium and house-of-worship installs,
REMI/remote-production operators, and increasingly single-operator productions that want broadcast
matching on cinema and mirrorless bodies.

Typical price band (INFERENCE, from structure not from price lists, since no price page was
reachable): free software-only control (Companion, OBS plugins, VISCA libraries) → low-four-figure
compact panels and gateways → five-figure-and-up native manufacturer CCU chains where the CCU,
camera head, fibre and panel are sold as one system. The commercial pattern that *is* documented is
**perpetual, camera-count-tiered licensing on a hardware panel** (Cyanview) versus **bundled-with-
the-switcher control** (Blackmagic ATEM) versus **free glue software** (Companion).

---

## Product table

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
|---|---|---|---|---|---|---|
| RCP / RCP-J (+ licence tiers DUO/QUATTRO/OCTO/MSU) | Cyanview (BE) | Dedicated hardware panel with web UI dashboards | Perpetual licence per camera-count tier; **no subscription** (FACT); price requires sales contact (UNVERIFIED) | Yes — LAN operation; RIO keeps control when the link drops (FACT) | Partial — TSL server, Pro-Bel SW-P-08, web dashboards on ports 4000/5000; no public REST found (UNKNOWN) | One panel painting ~180 camera models across 15 brands |
| CI0 / CI0-3P / CI0BM | Cyanview (BE) | 2–3 port serial↔IP gateway, PoE camera power | Hardware purchase, **no licence required** (FACT) | Yes | via RCP | Cheapest serial-to-IP path on a stable LAN |
| RIO (+LAN / +WAN) | Cyanview (BE) | Autonomous 2-serial + 2-USB gateway, direct lens motor control | Hardware + LAN or WAN licence, perpetual (FACT) | Yes — autonomous control without panel link (FACT) | via RCP / cloud | REMI and unreliable networks; USB mirrorless bodies |
| VP4 | Cyanview (BE) | 4-channel video processor, standalone web UI | Requires sales contact (UNVERIFIED) | Yes | Web UI (FACT) | Giving paint to cameras that have none: 12-vector multimatrix + CCU-style detail/coring/black |
| ATEM Camera Control (ATEM Software Control + ATEM hardware panels) | Blackmagic Design | Win/macOS software; hardware panels | Bundled with switcher (INFERENCE); price UNVERIFIED | Yes | SDI Camera Control Protocol (published PDF); ATEM LAN protocol (reverse-engineered libs) | Cheapest CCU for an all-Blackmagic camera fleet |
| Blackmagic camera REST/WebSocket control API | Blackmagic Design | On-camera HTTP server | Free with camera | Yes (LAN) | **Yes — OpenAPI-documented, discoverable at `/control/documentation.html`** (FACT) | Self-describing camera control; UI can be generated from the camera |
| Blue Pill panels / Raw Panel | Skaarhoj (DK) | Hardware surfaces + Go libraries | Requires sales contact (UNVERIFIED) | Yes | **Yes — Raw Panel over TCP 9923, ASCII and protobuf, publicly documented** (FACT) | Building a bespoke hardware surface that any third-party software can drive |
| Companion | Bitfocus (NO) | Win/macOS/Linux/Raspberry Pi | **Free, open source** (FACT) | Yes | Module SDK + HTTP/TCP/OSC control API | Free glue: ~30 camera vendor modules in one surface |
| companion-module-panasonic-cameras | Bitfocus community | Companion module | Free | Yes | Yes | Deepest free Panasonic paint control (pedestal R/G/B, chroma level/phase, DNR, DRS, ND) |
| companion-module-sony-visca | Bitfocus community | Companion module | Free | Yes | Yes | Sony BRC/SRG/ILME-FR7 with 97+ polled state variables |
| companion-module-bmd-cameras | Bitfocus community | Companion module | Free | Yes | Yes | Generates its whole action set from the camera's own OpenAPI spec |
| obs-ptz | Community (glikely) | OBS Studio plugin, GPL-2.0 | Free | Yes | Plugin/hotkeys/joystick | Free PTZ control bound to scene switching; VISCA + Pelco-P/D + experimental ONVIF |
| libgphoto2 / gPhoto2 | gPhoto project | C library, LGPL-2.1 | Free | Yes | Yes (C API + CLI) | Deep USB PTP setting control of Canon/Nikon/Sony/Fuji/Panasonic stills bodies |
| visca-over-ip (Python) / node-visca (TS) | Community | Libraries | Free | Yes | Yes | Embedding VISCA into your own product |
| sony-700ptp-protocol (RCP-1500 + CNA-1 emulators) | DelphiForBroadcasting | Delphi / Windows | Free, source | Yes | Source only | The only public reverse-engineering reference for Sony's 700 protocol found |
| vsm | Lawo (DE) | Broadcast control system | Requires sales contact (UNVERIFIED) | Yes | Pro-Bel SW-P-08 over TCP inbound (FACT, from the Cyanview integration doc) | Orchestrating panels, routing and tally around third-party RCPs |
| AMPP + Tally Service | Grass Valley | Cloud platform + local bridge app | Subscription (UNVERIFIED) | No — cloud | API key + **TSL** to local devices (FACT) | Cloud production where tally must reach on-prem panels |

Products named in the brief that could **not** be verified from any reachable source, and are
therefore deliberately absent from the table rather than guessed: Sony RCP-1500/1530 and
MSU-1000/1500 (see Deep dive 5 for the indirect evidence), Panasonic AW-RP150/AW-RP60 hardware,
Grass Valley C2IP/OCP-400, Ross Carbonite/Acuity CCU, Lawo .edge, Riedel SimplyLive, Bolin, BirdDog
and PTZOptics hardware controllers (only their Companion modules were verified), Telemetrics,
Mo-Sys, Areto, Bexel/CP.

---

## Deep dives

### 1. Cyanview RCP ecosystem — the universal-panel play

**What it does.** A compact hardware panel with knobs and buttons for tactile shading, described as
giving "full, tactile camera paint control" over iris, gain, shutter, colour matrix, black level,
knee, gamma and detail, with instant camera switching and visual feedback. Two panel variants: RCP
(compact/portable) and RCP-J (integrated iris joystick, OB-van rack dimensions). Any camera
parameter can be mapped onto physical knobs and buttons.
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/rcp.md)

**Data model.** The product line separates *panel*, *gateway*, *licence* and *cable* as distinct
SKUs (FACT, from the CyFig catalogue):

| SKU | What it is |
|---|---|
| `CY-RCP`, `CY-RCP-J` | Panels |
| `CY-LIC-DUO` / `-QUATTRO` / `-OCTO` / `-MSU` | 2 / 4 / 8 / 128 simultaneous cameras |
| `CY-CI0`, `CY-CI0-3P`, `CY-CI0BM` | 2–3 port serial↔IP camera interface; BM variant carries a Blackmagic SDI control board |
| `CY-RIO` + `CY-RIO-LAN` / `CY-RIO-WAN` | Autonomous gateway; LAN-only vs REMI/cloud |
| `CY-VP4` | 4-channel colour corrector / CCU |
| `CY-NIO` | 16 GPIO channels over Ethernet/Wi-Fi/4G |
| `CY-RSBM` | SDI control injection board for Blackmagic cameras |

[Source](https://raw.githubusercontent.com/AlanOgic/cyfig/main/src/data/products.json)

The camera model is equally explicit — each camera row carries `connectionTypes`
(`ip` / `serial` / `usb` / `sdi`), a `protocol` string (`sony-cgi`, `sony-8pin`, `sony-sdk`,
`sony-alpha-usb`, `visca`, `lanc`, …) and a `requiredDevice` (`rcp-direct`, `ci0`, `rio`).
[Source](https://raw.githubusercontent.com/AlanOgic/cyfig/main/src/data/cameras/sony.json)

The compatibility database itself is a CSV with French headers —
`Marque,Modèle,Surnom,Réf. Constructeur,Type de Port,Protocole,Câble Cyanview,Notes Importantes,Notes Utiles`
— roughly **180 camera models across AJA, BirdDog, Blackmagic, Bolin, Canon, Dreamchip, Generic,
Ikegami, JVC, Marshall, Panasonic, Proton, RED, Sony, Z CAM**, with port types VISCA Serial,
Ethernet, SDI, USB, LANC, RS-422/485 and Remote A.
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/Cyanview_Compatible_Cameras.csv)

The genuinely valuable column is `Notes Importantes` — a per-model quirk field. Verbatim examples
from that CSV:

- Sony FX6: "Requires firmware v4 or higher and RCP/RIO 24.1+. USB-Ethernet dongle must use ASIX
  AX88179 chipset (not AX88179A/B) or older Realtek RTL8153. Incompatible dongle can crash camera."
  Paint is limited to "white balance, iris, variable ND, gain, shutter, record only".
- Sony Venice 1: "Venice IP: RCP paint mode disabled, ND presets only. Venice Serial: requires 8-pin
  port, full broadcast paint control."
- Panasonic AU-EVA1: named USB 3.0 Ethernet adapters (UGREEN SKU 20256, Plugable, BUFFALO
  LUA4-U3-AGT), fixed camera IP, guest account; "Red and Blue gains not supported by protocol".
- Panasonic DC-BGH1: "Pairs with only one controller at a time (LUMIXTether or RCP)."
- Sony Alpha 1: "Multiple devices cannot control simultaneously."
- RED Komodo: "Tally (red only) supported."

**Integrations.** Tally is first-class and multi-standard: a **built-in TSL server acting as a
multiviewer**, TSL 3.1 and 5.0 over UDP and TCP, GPI via dongle or NIO, direct ATEM, vMix,
Tricaster, and Pro-Bel SW-P-08 for VSM; tally output goes back out over camera protocols
(Panasonic, Sony, Blackmagic, JVC), GPO, on-device LEDs, or 12 V LED cable. Crucially: "Tally data
follows the same routing as camera control signals."
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/tally/tally.md)

Broadcast-system integrations documented: Lawo vsm (Pro-Bel, TCP inbound, bi-directional, RCP as a
control device on a virtual layer), Lawo V\_\_pro8, Grass Valley AMPP (Tally Service app, API key to
the cloud, TSL to RCP/NIO/RIO; tally forwarded on to Sony FX9 and Panasonic UE150), EVS,
Haivision MoJoPro and Data Bridge, vMix, Lansee.
[vsm](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/broadcast-systems/lawo-vsm.md) ·
[AMPP](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/broadcast-systems/grass-valley-ampp.md)

Lens control runs **in parallel with** camera control — "iris, zoom, and focus commands route to
the lens while shading commands go to the camera" — over B4 2/3", Canon Cine Servo 12P, Fujinon 20P
and 12P, cmotion, Tilta and ARRI motors, each with a named cable SKU. RIO rather than CI0 is
recommended because it holds lens control without an active panel connection.
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/generic/lens.md)

ARRI is handled over **CAP (Camera Access Protocol)** over Ethernet for Alexa 35 Live, Alexa 35,
Alexa Mini, Alexa Mini LF and Amira (Amira gaining more via SSCP). For LPS-1 the panel talks to the
CCU; otherwise directly to the camera head. Multicam mode adds "white gain", "black gamma", knee and
colour correction on top of exposure/WB/audio/record/playback/test-pattern/tally; look files,
textures and lens tables are dashboard-only.
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/arri/arri-cap.md)

**Notable strengths.**
- Breadth with honesty: every model carries its own caveats instead of a marketing tick.
- Clean separation of panel / gateway / licence / cable, which makes the system *plannable*.
- Perpetual licensing: "All licenses are one-time purchases with no subscriptions", and cloud access
  bundled with RCP and RIO +WAN is "Free of ongoing charges (no subscription)"; licences are applied
  as a **licence file** in the device web UI Admin tab.
  [Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/licensing.md)
- Autonomy: the RIO's defining property is keeping camera and lens control alive when the network to
  the panel fails; the docs make that the explicit CI0-vs-RIO decision criterion.
  [Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/which-product.md)
- Grouping: up to eight groups per camera via a `group:` keyword in a Tags field, plus a default
  "All" group, "useful for recalling a PTZ position or performing a white balance across a set of
  cameras at the same time".
  [Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/advanced/camera-groups.md)

**Notable limits.**
- **Multi-operator is weak.** "Only one RCP can control a given CI0 at a time"; multi-operator needs
  the CY-GWY workflow or a distributed architecture. The CI0's IP address is "not user-configurable"
  and CI0 is explicitly unsuitable for high-latency networks (VPN/WAN) — use RIO.
  [Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/faq.md)
- **No scopes.** The preview guide covers only monitor-routing follow ("a joystick push or button
  press on the RCP call the correct CCU output on the preview video monitor") — no waveform,
  vectorscope, or any picture analysis.
  [Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/preview/preview.md)
- **No documented scene-copy between different camera families.** Scene files exist per camera
  (Cyanview RCP docs mention preserving/retrieving/transferring settings; Ikegami and Sony Venice
  rows mention scene file save/recall), but nothing read describes matching a Sony to an ARRI by
  exchanging a file. UNKNOWN rather than proven absent — would need the RCP manual under
  `docs/reference/manuals`.
- Camera-groups documentation says nothing about gang shading or offset-preserving trims.
- No public pricing anywhere; "Contact Cyanview support" for licence purchases.

### 2. Blackmagic — three control paths and a self-describing camera

Blackmagic is the segment's most *documented* camera family, and the only one where the camera tells
you its own API.

**The three paths** (FACT, all from one Cyanview integration page):

| Path | Direction | Notes |
|---|---|---|
| IP (REST API) over Ethernet | Bi-directional feedback | PYXIS 6K, URSA Cine, Cinema Camera 6K, URSA G2 Broadcast, Micro Studio 4K G2, Studio Camera 4K variants |
| SDI, control injected via RSBM or CI0BM | **Unidirectional — "the camera does not send feedback"**, so values drift | Micro Studio 4K, URSA Mini; Pocket bodies need an HDMI→SDI Microconverter |
| Via an ATEM switcher | ATEM sync bi-directional, camera control unidirectional | "warrant caution in large-scale setups due to potential sensitivity to device count and command volume" |

Controllable: "iris, gain, shutter, white balance, black balance, gamma, saturation" plus lens
zoom/focus, record status and timecode. Tally over IP works only on URSA G2 Broadcast and PYXIS
(RCP/RIO 25.12.1-rc2 or later); tally over SDI/ATEM works on all models except URSA Cine.
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/blackmagic/blackmagic-camera-control.md)

**The machine-readable protocol.** `coral/blackmagic-camera-protocol` publishes a `PROTOCOL.json`
for the *Blackmagic Camera Control Protocol*, covering the command groups Lens, Video, Audio,
Output, Display, Tally, Reference, Configuration and Colour Correction, with typed parameters (e.g.
Lens Focus as a fixed-point 16-bit value, "0.0 = near, 1.0 = far", range 0–1), for both the **SDI**
and the **Bluetooth LE** transports (including GATT services/characteristics). The author's stated
motivation is that shipping a protocol only as a PDF "feels like missing 20 years of progress in
software engineering".
[Source](https://github.com/coral/blackmagic-camera-protocol)

**The self-describing camera.** The Companion module `bmd-cameras` does not hardcode endpoints: it
fetches the camera's **OpenAPI specs from `/control/documentation.html`**, connects over WebSocket
for real-time state with polling fallback, and generates actions from the spec —
"endpoints with PUT/POST/DELETE methods become actions", with "request body fields built from
OpenAPI schemas — enums become dropdowns, booleans become checkboxes". Tested on URSA Cine 12K LF
firmware 9.5.3; listed as compatible with PYXIS 6K, Cinema Camera 6K, Studio Cameras, URSA Broadcast
G2, Micro Studio Camera 4K G2.
[Source](https://github.com/bitfocus/companion-module-bmd-cameras)

**Limits.** The ATEM path is *not* a full CCU. The ATEM Companion module's changelog shows camera
control arriving piecemeal — "Add camera continuous zoom action", "Improve increment camera iris and
exposure", "Add incrementing camera control" (v3.10.x), "Add camera control recording actions"
(v3.15.0) — with no documented white balance or lift/gamma/gain.
[Source](https://github.com/bitfocus/companion-module-bmd-atem)

### 3. Bitfocus Companion — the free control layer that ate the low end

Companion is free and open source, runs on Windows/macOS/Linux/Raspberry Pi, and reaches cameras
through community modules. The breadth verified by repository listing in the `bitfocus` GitHub org
(FACT, 2026-08-28):

- PTZ modules: Panasonic, PTZOptics (VISCA and SuperJoy), Canon, BirdDog, Sony, JVC, Axis, Vaddio,
  Bolin, Dahua, AVer, Foscam, Rocosoft PTZJoy, Tenveo, Kxwell, TelyCam, Liveskills PTZ Director.
- Camera modules: Panasonic cameras, Panasonic camera controller, BMD cameras, JVC, Fomako, Atlona,
  Bosch HD, Zoneminder.
- Panel-side: `companion-module-skaarhoj-rawpanel`.

Depth is real, not token. `companion-module-panasonic-cameras` is written against Panasonic's
published **"HD/4K Integrated Camera Interface Specifications" version 1.12, April 2020** plus
model supplements, and exposes iris mode/position, shutter mode/step, ND filter, night mode,
**gain red/blue/green, pedestal master and per-channel**, white balance mode, chroma level and
phase, digital noise reduction, dynamic range stretch, pan/tilt/presets/home, power, restart, tally
and colour bar — with feedbacks and variables, auto-filtered by detected model. Camera coverage
spans AW-HE2/40/50/120/130, UE4/5/20/50/70/80/100/150/160, HR140, UR100, UB50/UB300/UBX100, CX350
and POVCAM.
[Source](https://github.com/bitfocus/companion-module-panasonic-cameras)

`companion-module-sony-visca` covers BRC (AM7, X400, X401, X1000, H780, H800), ILME-FR7/FR7K and
SRG (A40, A12, X40UH, H40UH, 120DH, 201SE, 300SE, 301SE, 300H, X120, X400, X402, 201M2, HD1M2) plus
SRG-360SHE/280SHE over **VISCA UDP**, with pan/tilt in raw units and in degrees, zoom/focus,
exposure modes, white balance, iris/gain/shutter, presets, tally commands, and **97+ polled state
variables**. Requires Companion v3.5+.
[Source](https://github.com/bitfocus/companion-module-sony-visca)

`companion-module-ptzoptics-visca` is candid about the segment's core problem: cameras "often
implement [VISCA] in subtly different form", so the module targets PTZOptics (G3 best-supported, G2
"expected to work reasonably well") and offers a **custom command** action as the escape hatch.
[Source](https://github.com/bitfocus/companion-module-ptzoptics-visca)

**Limits.** Companion is a *button surface*, not a shading desk: it has no continuous-parameter
ergonomics (no knob-per-parameter, no shading joystick), no multi-camera matching view, no scopes,
and per-module state coverage that varies wildly. INFERENCE: this is exactly why Cyanview, Skaarhoj
and the manufacturers can still sell hardware above it.

### 4. Skaarhoj Raw Panel — the open panel protocol

Skaarhoj's hardware is proprietary, but the way you *talk to it* is published, which is unusual in
this segment. `rawpanel-lib` is a Go library for "direct TCP communication with SKAARHOJ panels
using the Rawpanel Protocol on **port 9923**", implementing two variants: an **ASCII, newline-
delimited** format supported by all Skaarhoj controllers, and a **protobuf, length-prefixed
container** format supported by Blue Pill and Blue Pill Inside controllers. The repo points at
`https://wiki.skaarhoj.com` and a "SKAARHOJ RawPanel V2" PDF manual; sibling repos
`rawpanel-processors` ("in-flight processors and converters for raw panel messages") and
`ibeam-rawpanel-proto` ("IBeam Hardware Protocol") complete the stack.
[Source](https://github.com/SKAARHOJ/rawpanel-lib) ·
[utils](https://github.com/SKAARHOJ/raw-panel-utils)

**Why it matters here.** A published panel protocol decouples the *surface* from the *control
logic*. Anyone — Companion, a Cyanview-style bridge, or a home-grown app — can light the buttons,
render tile graphics and read encoder deltas without a partnership. INFERENCE: this is the single
most reusable architectural idea in the segment, and the only place where hardware panel cost stops
being a lock-in.

**Limits.** UNVERIFIED: panel prices, which Skaarhoj models ship the Blue Pill engine, and whether
the protobuf variant is stable/versioned. Would need `wiki.skaarhoj.com` and the RawPanel V2 PDF,
both unreachable in this session.

### 5. The closed camp: Sony 700 / MSU, Ikegami ICPP, and what "unverified" costs

Sony's system-camera control (RCP-1500/1530 panels, MSU-1000/1500 master setup units, CNA-1
adapters, the 700-series serial protocol) is the reference point the whole segment is measured
against — and it is the part this dossier can least verify. Two indirect data points:

- **FACT:** a public GitHub project, `DelphiForBroadcasting/sony-700ptp-protocol`, describes itself
  as "Trying analyzing Sony 700 PTP Protocol" and contains a **Sony RCP-1500 Emulator** and a
  **Sony CNA-1 Emulator** written in Delphi XE 10.1 (16 stars). Its existence is evidence that the
  protocol is not publicly specified and has to be reverse-engineered.
  [Source](https://github.com/DelphiForBroadcasting/sony-700ptp-protocol)
- **FACT (local repo, `/home/user/sony-camera-bridge`):** that project's own capability table states
  Sony CCU control via "700PTP over TCP :7700 / RS-422", marks paint as verified, and **deliberately
  disables AWB/ABB/auto-iris** because "Sony's 700 protocol is NDA-only and no public source
  documents those auto-setup command codes (verified against the DelphiForBroadcasting/
  sony-700ptp-protocol reference, which only covers framing + paint)". Enabling them is noted as
  needing "a CNA-1 log or RCP traffic capture".

By contrast, **Ikegami's ICPP** is documented in third-party integration notes down to the wire:
RS-422 on an 8-pin PRC05-PB8M connector at **38400 baud**, via a CI0, for HDK-79EX, HDK-79GX, HDK-73,
HDK-97 and HDK-99 (HDK-55 explicitly unsupported — "incomplete serial port control implementation in
that entry-level system"), controlling white balance R/B and colour temperature, black balance R/B,
iris, gain, shutter, ND, **master gamma, knee, detail**, plus scene file save/recall and auto
iris/AWB/ABB.
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/other/ikegami-icpp.md)

And **Marshall** minicams sit at the other end: RS-485 VISCA at **9600 baud**, camera address 01,
across ~21 CV-series models, exposing iris/shutter/gain/AE, ATW/one-push/manual WB, master black,
master gamma, colour gains, saturation, detail enhancement, digital zoom and white clip — with the
older CV500 on Pelco RS-485 supporting "only OSD menu navigation without paint controls".
[Source](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/other/marshall-minicam.md)

**INFERENCE:** the segment splits into a *published-protocol* camp (Panasonic AW, VISCA, Blackmagic,
ARRI CAP, Ikegami ICPP) where third-party panels and free software thrive, and an *NDA* camp (Sony
700, and presumably Grass Valley C2IP and Ross's CCU bus — UNVERIFIED) where only the manufacturer's
own panel is a first-class citizen. Every universal-panel vendor's real product is the *bridge* over
that split.

### 6. The software-only / open-source stack

Three separate free stacks exist, and none of them talks to the others:

- **obs-ptz** (GPL-2.0): "a plugin for controlling PTZ Cameras from OBS studio", with automatic
  camera selection based on the active scene. Protocols: "VISCA (RS232, RS422, UDP and TCP)",
  Pelco-P, Pelco-D, "ONVIF (experimental)", and USB cameras on Windows/Linux. Features: pan/tilt/
  zoom/focus, preset save and recall, multiple cameras, hotkeys, joystick control, autofocus toggle,
  power, white balance. Binaries for Windows x64/arm64, macOS universal, Ubuntu 24.04 and 26.04
  (x86_64, aarch64). [Source](https://github.com/glikely/obs-ptz)
- **libgphoto2** (LGPL-2.1): "a library that can be used by applications to access various digital
  cameras", explicitly "not a standalone graphical user interface (GUI) application" but a backend,
  covering USB Mass Storage, **PTP** ("Almost all modern cameras that are not USB Mass Storage
  devices use this protocol, including models from Nikon, Canon, Fuji, Sony, and Panasonic") and
  MTP; Entangle cited as the tethered-shooting GUI.
  [Source](https://github.com/gphoto/libgphoto2)
- **VISCA libraries**: `visca-over-ip` on PyPI (v0.5.1, released 2 December 2024) implements "the
  VISCA over IP protocol used by some Sony PTZ cameras" and ships companion GUI and joystick tools
  [Source](https://pypi.org/project/visca-over-ip/); `utopiantools/node-visca` is a TypeScript
  library for "VISCA-based PTZ cameras over IP and over serial connections"
  [Source](https://github.com/utopiantools/node-visca).

**INFERENCE:** the open-source layer solves *motion and simple exposure* well and *paint/matching*
not at all. There is no open-source equivalent of an MSU: no shared scene-file model, no matching
workflow, no multi-camera state view.

---

## Standards & protocols

Wire protocols verified in this session:

| Protocol | Transport | Verified detail | Source |
|---|---|---|---|
| **VISCA** | RS-232 / RS-422 / RS-485 / UDP / TCP | Sony-originated PTZ command set; Companion Sony module uses **VISCA over UDP**; Marshall runs it on RS-485 at 9600 baud, address 01; PTZOptics module notes vendors "implement [VISCA] in subtly different form" | [sony-visca](https://github.com/bitfocus/companion-module-sony-visca), [marshall](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/other/marshall-minicam.md), [ptzoptics](https://github.com/bitfocus/companion-module-ptzoptics-visca) |
| **Panasonic AW CGI** (`aw_ptz` / `aw_cam`) | HTTP | Governed by Panasonic's **"HD/4K Integrated Camera Interface Specifications" v1.12, April 2020** plus model supplements | [panasonic-cameras](https://github.com/bitfocus/companion-module-panasonic-cameras) |
| **Blackmagic Camera Control Protocol** | SDI (embedded) and Bluetooth LE | Groups: Lens, Video, Audio, Output, Display, Tally, Reference, Configuration, Colour Correction; typed params (Lens Focus fixed16, 0.0 near → 1.0 far); machine-readable `PROTOCOL.json` exists alongside the official PDF | [PROTOCOL.json repo](https://github.com/coral/blackmagic-camera-protocol) |
| **Blackmagic camera REST + WebSocket** | HTTP/WS on the camera | **OpenAPI-described**, discoverable at `/control/documentation.html`; WS for state, polling fallback | [bmd-cameras](https://github.com/bitfocus/companion-module-bmd-cameras) |
| **ARRI CAP** (Camera Access Protocol) | IP/Ethernet | Alexa 35 Live / 35 / Mini / Mini LF / Amira; LPS-1 connects panel→CCU, otherwise panel→camera head; Multicam mode adds white gain, black gamma, knee, colour correction | [arri-cap](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/arri/arri-cap.md) |
| **ARRI SSCP** | serial | Named as the route to "expanded controls" on Amira; details UNKNOWN | same |
| **Ikegami ICPP** | RS-422, 8-pin PRC05-PB8M, 38400 baud | Full paint incl. master gamma, knee, detail; scene file save/recall | [ikegami-icpp](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/other/ikegami-icpp.md) |
| **Sony 700 series ("700PTP")** | RS-422 / TCP | **NDA / not publicly specified.** Public reverse-engineering exists as RCP-1500 and CNA-1 emulators | [sony-700ptp-protocol](https://github.com/DelphiForBroadcasting/sony-700ptp-protocol) |
| **Sony 8-pin Remote / LANC** | serial | Cyanview classes Venice/PMW/PXW legacy as `sony-8pin`, FS5/FS7/Z90 as `lanc`; on FX6 "LANC adds tally and menu navigation to IP control" | [cameras/sony.json](https://raw.githubusercontent.com/AlanOgic/cyfig/main/src/data/cameras/sony.json), [CSV](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/Cyanview_Compatible_Cameras.csv) |
| **Sony CGI / Sony SDK / Sony Alpha USB (PTP)** | HTTP / USB | Cyanview protocol strings `sony-cgi` (FX6, FX9, FR7, BRC-X400/X1000/H900), `sony-sdk` (Burano), `sony-alpha-usb` (FX3/FX30/FX2, Alpha 1/1 II/9 III/7S III/7 IV/7C II/7R V/6700, ZV-E1 — all requiring a RIO) | same |
| **Canon XC** | Ethernet | Cyanview lists Canon C300 Mk III and CR-N300 under protocol "XC"; CCAPI is the REST alternative (verified only in the local sony-camera-bridge repo, not from Canon's docs this session) | [CSV](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/Cyanview_Compatible_Cameras.csv) |
| **Pelco-P / Pelco-D** | serial | Supported by obs-ptz; Marshall CV500 is Pelco RS-485, OSD navigation only | [obs-ptz](https://github.com/glikely/obs-ptz) |
| **ONVIF** | IP | "experimental" in obs-ptz; no production-grade paint use found | same |
| **PTP / MTP** | USB | The universal stills-camera control path; libgphoto2 is the reference implementation | [libgphoto2](https://github.com/gphoto/libgphoto2) |
| **TSL 3.1 / TSL 5.0** | UDP and TCP | The de-facto tally interchange: Cyanview devices run a built-in TSL server "that acts as a multiviewer"; GV AMPP's Tally Service speaks TSL to on-prem devices | [tally](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/tally/tally.md), [ampp](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/broadcast-systems/grass-valley-ampp.md) |
| **Pro-Bel SW-P-08** | TCP | Router/tally control; how a Cyanview RCP appears inside Lawo vsm | [lawo-vsm](https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/broadcast-systems/lawo-vsm.md) |
| **Skaarhoj Raw Panel** | TCP **9923** | ASCII newline-delimited (all panels) + protobuf length-prefixed containers (Blue Pill / Blue Pill Inside) | [rawpanel-lib](https://github.com/SKAARHOJ/rawpanel-lib) |
| **Free-d** | UDP | Camera tracking (position/orientation) rather than paint; only small community projects found this session — a FreeD repeater that forwards to Unreal/disguise, and a DualShock-based simulator. Spec itself UNVERIFIED | [repeater](https://github.com/machens/U-MOCO-FreeD-Repeater) |
| **S-Bus** | serial | A Cyanview advanced guide `sbus.md` exists; contents not read — UNKNOWN | [folder listing](https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides/advanced) |

**Interchange formats.** There is effectively none. Scene files exist per camera family (Ikegami,
Sony Venice, Cyanview RCP) but nothing read describes a cross-vendor file. The two machine-readable
artefacts found are `PROTOCOL.json` for Blackmagic and the camera-served **OpenAPI** spec on
Blackmagic bodies. Cyanview's own compatibility knowledge ships as a **CSV/XLSX with French column
headers** — human-readable, not an API.

---

## What this segment does WELL

Patterns worth stealing:

1. **Per-model quirk databases, not tick-boxes.** The `Notes Importantes` column is the most
   valuable artefact found in this entire research pass: named USB-Ethernet chipsets, minimum
   firmware versions, "this parameter is not supported by the protocol", "pairs with only one
   controller at a time". A compatibility claim without a caveat field is nearly worthless in this
   domain.
2. **Capability gating instead of silent failure.** Cyanview documents which paint controls a given
   protocol path exposes (Venice IP: paint disabled, ND presets only; FX6: WB/iris/ND/gain/shutter/
   record only). The local `sony-camera-bridge` does the same in code with a capability truth table
   so unsupported buttons are disabled rather than throwing. This is the right ergonomic contract.
3. **Separating panel, gateway, licence and cable as first-class objects.** It makes the system
   configurable, quotable and *plannable*, and it is why a configurator like CyFig can exist at all.
4. **Designing for network failure.** "The RIO maintains control while CI0 loses it" is the decision
   criterion the docs lead with. Control autonomy at the edge, not just reconnection logic.
5. **Tally as routed data on the same path as control.** One built-in TSL server, multiple tally
   sources (TSL/GPI/ATEM/vMix/Tricaster/Pro-Bel) and multiple sinks (camera protocol, GPO, LED,
   12 V), rather than a separate tally silo.
6. **Machine-readable protocol definitions.** `PROTOCOL.json` and the camera-served OpenAPI spec let
   a client generate its own UI. `bmd-cameras` proves it works end to end: enums become dropdowns,
   booleans become checkboxes, no hardcoded endpoint list to rot.
7. **Open panel protocols.** Raw Panel on TCP 9923 in both ASCII and protobuf means the hardware
   surface is not a walled garden.
8. **Perpetual, capacity-tiered licensing with file activation.** DUO/QUATTRO/OCTO/MSU maps price to
   value (cameras controlled) without a subscription, and a licence file works offline.
9. **A free control layer underneath everything.** Companion's ~30 camera modules are the reason a
   small production never has to buy a controller at all — and the reason paid products must justify
   themselves on ergonomics, matching and reliability rather than on connectivity.

---

## What NOBODY in this segment solves well

The white space, stated as claims I can defend from what I read (each marked with its evidence
strength):

1. **Nobody plans the control topology before the truck loads.** The only planning tool found is
   CyFig — a *sales* configurator that outputs a Bill of Materials from camera count, connection
   type, operator count and local-vs-REMI topology. It is vendor-locked and BOM-shaped, not a
   production document a crew can work from. There is no vendor-neutral artefact that says "camera 4
   is an FX6 on LANC + IP through RIO 2 port A, cable CY-CBL-…, tally via TSL ID 4, panel operator
   B". *(INFERENCE, from the absence of any such tool across every source read.)*
2. **No cross-vendor scene/paint interchange format.** Scene files are per-family blobs. Matching an
   ARRI Alexa 35 to a Sony HDC to a Blackmagic URSA still happens by eye, camera by camera. Nothing
   read defines a neutral paint document, and the parameter *semantics* differ anyway (Cyanview
   notes Panasonic EVA1's "Red and Blue gains not supported by protocol"). *(Strong inference.)*
3. **No scopes where the shading happens.** The Cyanview preview guide covers monitor routing only.
   Shading still requires a separate multiviewer and external waveform/vectorscope. A panel that
   knows which camera is selected is the natural place to put a scope, and nobody does. *(FACT for
   Cyanview; UNVERIFIED for Sony MSU and GV/Ross panels, which may well have scopes — this is the
   first thing to check if the vendor sites become reachable.)*
4. **Multi-operator concurrency is broken at the protocol level.** "Only one RCP can control a given
   CI0 at a time"; the Panasonic BGH1 "pairs with only one controller at a time"; the Sony Alpha 1
   note says "Multiple devices cannot control simultaneously". There is no arbitration, no
   take/release, no read-only observer role in evidence anywhere. *(FACT, three independent rows.)*
5. **Feedback asymmetry is unmanaged.** SDI control is "unidirectional — the camera does not send
   feedback to the RCP", which the docs concede causes value drift. Nobody publishes a reconciliation
   model (last-known-state, periodic re-push, drift warning). *(FACT.)*
6. **Camera-control compatibility knowledge is not machine-readable.** The best dataset in the
   segment is a CSV with French headers inside a documentation repo. There is no open registry
   mapping `camera model → protocol → transport → available paint parameters → required gateway →
   required cable → known quirks`. Every vendor and every open-source project rebuilds it privately.
   *(FACT for what exists; strong inference that no open registry exists.)*
7. **Tally standards are fragmented and nobody bridges them well for free.** TSL 3.1, TSL 5.0, GPI,
   ATEM, vMix, Tricaster, Pro-Bel SW-P-08 — the bridging is a paid feature of a control panel.
   *(FACT.)*
8. **Pricing is opaque across the whole segment.** Not one product in this dossier has a verifiable
   public price. Even allowing for this session's blocked egress, the licensing doc's own answer is
   "Contact Cyanview support". *(FACT for Cyanview; UNVERIFIED but likely general.)*
9. **Nothing offline-first.** Configuration, licensing and compatibility knowledge all live behind
   web UIs, cloud dashboards and vendor support desks. There is no offline planning artefact.
   *(Inference; directly relevant to this suite's offline-first stance.)*

---

## Relevance to AV Planner Suite

Ranked by how much of this dossier actually lands.

**1. `sony-camera-bridge` — direct.** This is a product *in* this segment, and the research reads as
a feature gap list against Cyanview:

- Already strong and matching best practice: the capability truth table in
  `packages/web-rcp/src/capabilities.ts` is exactly the "gate what the protocol cannot do" pattern
  Cyanview documents per model; the multi-family backend set (Sony CCU 700PTP, Sony USB PTP, Sony
  MnC, Canon CCAPI, Lumix, Blackmagic REST, Z CAM, Panasonic AW, VISCA, JVC, BirdDog) covers most of
  the same ground; the deliberate refusal to guess Sony's NDA auto-setup codes is the right call and
  is corroborated by the 700PTP emulator repo being the only public reference.
- Concrete gaps worth closing, each with a proven precedent: **camera groups** (tag-based, 8 per
  camera, "All" default, group white-balance and group preset recall); **a TSL 3.1/5.0 server and
  client** so the bridge is a tally citizen instead of a tally island; **lens control in parallel
  with paint** (B4/Cine Servo/Fujinon/Tilta), which Cyanview treats as a separate command path;
  **an autonomy story** (what happens to camera control when the browser or the LAN drops — the
  RIO's whole pitch); **per-model quirk metadata** in the connection wizard (firmware minimums,
  dongle chipsets, "manual mode required", "single controller only") rather than only per-mode
  capabilities; **Blackmagic OpenAPI discovery** instead of a hardcoded endpoint list, following
  `bmd-cameras`.
- Positioning insight: the whole paid segment sells hardware ergonomics plus a bridge. A software-
  only bridge with an honest capability model, no licence tiers and no per-camera cost is a real
  wedge — but only if it fixes the things hardware also fails at (scopes, matching, multi-operator).

**2. `multicam-planner` — high.** Its camera database (54 cameras, 10 brands) is the natural home
for a **control facet** per camera: `protocol`, `port type`, `paint parameters actually available`,
`gateway required`, `cable required`, `known quirks`. Cyanview's CSV is a working schema to copy
(`Marque, Modèle, Type de Port, Protocole, Câble, Notes Importantes, Notes Utiles`). A planner that
answers "if you put an FX6 at position 3, you need an ASIX AX88179 dongle and you only get WB, iris,
ND, gain, shutter" is doing something nobody in this segment does.

**3. `cable-planner` — high, and the most under-served angle.** Camera control is a *cabling*
problem before it is a software problem, and this dossier turned up a concrete vocabulary for it:
RS-422 8-pin (Sony Remote, Ikegami PRC05-PB8M at 38400 baud), RS-485 VISCA at 9600, LANC, SDI with
control injected via an RSBM/CI0BM board, USB-C-to-Ethernet with a named chipset, PoE camera power
from a CI0, 12 V tally LED tails, and lens control cables (B4 2/3", Canon 12P, Fujinon 20P/12P,
Tilta serial). Cyanview even sells these as SKUs (`CY-CBL-6P-B4-01`, `CY-CBL-6P-SONY-8P-03`,
`CY-CBL-6P-FUJI-02`, `CY-CBL-DREAMCHIP-01`, `CY-CBL-TILTA-SERIAL`, `CY-CBL-6P-FAN`). Adding a
**control-cable class** to the cable library — alongside SDI — with the constraint that a control
run implies a gateway port and a protocol, would make cable-planner the first tool to plan the
control layer and the signal layer in one document. That is white space item 1 directly.

**4. `tally-pi` — high and cheap.** It is ATEM-only today. **TSL 3.1/5.0 over UDP and TCP** is the
interchange every serious player speaks (Cyanview runs a TSL server; GV AMPP's cloud Tally Service
speaks TSL to on-prem devices; vsm distributes via Pro-Bel). A TSL client (and optionally a TSL
server) turns tally-pi from an ATEM accessory into a device that drops into a Cyanview, vsm or AMPP
environment. Pro-Bel SW-P-08 is the second-priority addition.

**5. Shell / suite — medium.** The suite needs one shared taxonomy for "how is this device
controlled": protocol, transport, port, gateway, direction (bidirectional vs unidirectional with
drift), and capability set. cable-planner, multicam-planner and sony-camera-bridge all need the same
table; defining it once at suite level is the leverage.

**6. `broadcast-intercom` — low-medium.** One transferable idea: **Raw Panel on TCP 9923** as the
model for supporting third-party hardware surfaces. Also the multi-operator arbitration problem
(take/release/observer) is one intercom already thinks about and camera control demonstrably does
not — there may be a shared concept to lift in the other direction.

**7. `light-planner` — low.** Only the generic pattern (capability-gated parameters per fixture
protocol) transfers.

**8. `pi-media-station` — none.**

---

## Sources

Every URL below was actually opened in this session on 2026-08-28.

Cyanview documentation and configurator repositories (vendor-adjacent; see the caveat at the top):

- https://github.com/AlanOgic/cyanview-support
- https://github.com/AlanOgic/cyanview-support/tree/main/docs
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/products
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/reference
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides/tally
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides/advanced
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides/preview
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides/workflows
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations/broadcast-systems
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations/generic
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations/cameras
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations/cameras/arri
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations/cameras/blackmagic
- https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations/cameras/other
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/rcp.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/rio.mdx
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/vp4.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/which-product.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/licensing.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/tally/tally.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/advanced/camera-groups.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/preview/preview.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/faq.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/Cyanview_Compatible_Cameras.csv
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/generic/lens.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/generic/ptz.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/arri/arri-cap.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/blackmagic/blackmagic-camera-control.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/other/ikegami-icpp.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/cameras/other/marshall-minicam.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/broadcast-systems/lawo-vsm.md
- https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/broadcast-systems/grass-valley-ampp.md
- https://github.com/AlanOgic/cyfig
- https://github.com/AlanOgic/cyfig/tree/main/src
- https://github.com/AlanOgic/cyfig/tree/main/src/data
- https://raw.githubusercontent.com/AlanOgic/cyfig/main/src/data/products.json
- https://raw.githubusercontent.com/AlanOgic/cyfig/main/src/data/cameras.ts
- https://raw.githubusercontent.com/AlanOgic/cyfig/main/src/data/cameras/sony.json

Bitfocus Companion modules:

- https://github.com/bitfocus/companion-module-sony-visca
- https://github.com/bitfocus/companion-module-sony-ptz (README content not returned by the fetch)
- https://github.com/bitfocus/companion-module-panasonic-ptz
- https://github.com/bitfocus/companion-module-panasonic-cameras
- https://github.com/bitfocus/companion-module-ptzoptics-visca
- https://github.com/bitfocus/companion-module-bmd-cameras
- https://github.com/bitfocus/companion-module-bmd-atem

Protocols, panels and open-source stacks:

- https://github.com/coral/blackmagic-camera-protocol
- https://github.com/SKAARHOJ/rawpanel-lib
- https://github.com/SKAARHOJ/raw-panel-utils (README content not returned by the fetch)
- https://github.com/DelphiForBroadcasting/sony-700ptp-protocol
- https://github.com/glikely/obs-ptz
- https://github.com/gphoto/libgphoto2
- https://github.com/utopiantools/node-visca
- https://github.com/machens/U-MOCO-FreeD-Repeater
- https://pypi.org/project/visca-over-ip/
- https://gitlab.com/explore/projects?name=visca (returned no usable results)

Local repositories consulted (not URLs):

- `/home/user/sony-camera-bridge/README.md`
- `/home/user/sony-camera-bridge/packages/web-rcp/src/capabilities.ts`
- `/home/user/multicam-planner/README.md`
- `/home/user/tally-pi/README.md`

Attempted and **blocked by the egress proxy** (listed so the gaps are auditable and so a future
session knows exactly what to re-try): `www.cyanview.com`, `www.skaarhoj.com`, `pro.sony`,
`www.blackmagicdesign.com`, `ptzoptics.com`, `www.rossvideo.com`, `bitfocus.io`, `docs.bitfocus.io`,
`www.bhphotovideo.com`, `en.wikipedia.org`, `web.archive.org`, `www.npmjs.com` (HTTP 403).

## Follow-up checklist for the next session

If web search and vendor egress are available, these are the highest-value unknowns, in order:

1. Prices for: Cyanview RCP / RCP-J and each licence tier, CI0, RIO, VP4, NIO; Skaarhoj panels;
   Sony RCP-1500/1530 and MSU-1000/1500; Panasonic AW-RP150 and AW-RP60. Record date seen and
   whether advertised or quote-only.
2. Whether Sony MSU, Grass Valley OCP-400 or Ross's CCU panels include **waveform/vectorscope** — the
   single claim in "white space" most likely to be wrong.
3. Whether any vendor supports **cross-camera scene copy or gang shading with offsets** (Sony MSU
   "scene file" semantics; ARRI look files) — the second most likely to be wrong.
4. Panasonic "HD/4K Integrated Camera Interface Specifications" PDF itself, to confirm the aw_ptz
   command surface first-hand rather than through a Companion module.
5. Canon CCAPI official developer documentation, and Canon "XC" protocol scope.
6. The Free-d protocol specification (Vinten/Mo-Sys lineage) and which of Telemetrics, Mo-Sys and
   Shotoku actually emit it.
7. `wiki.skaarhoj.com` and the "SKAARHOJ RawPanel V2" PDF for the full panel protocol.
8. Riedel SimplyLive, Areto and Bexel/CP — no evidence of them surfaced from any reachable source;
   confirm they are still active products in this segment before including them anywhere.
