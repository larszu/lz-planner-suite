# Tally Systems

> Research date: **2026-08-28**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read on a cited page or in cited source code), **INFERENCE** (reasoning),
> **UNKNOWN / unverified**.

## Source-access caveat (read this before trusting anything below)

This pass ran in the same locked-down environment as `landscape/intercom.md`, with the same
two limits:

1. **WebSearch was exhausted before this dossier started** (200/200 calls used by earlier
   segments). Zero searches were available.
2. **The egress proxy allowed only `github.com` and `raw.githubusercontent.com`.** Every
   other host tested returned `EGRESS_BLOCKED` or a 403 at the CONNECT stage:
   `tallyarbiter.com`, `tslproducts.com`, `skaarhoj.com`, `cuebi.io`, `vmix.com`,
   `obsproject.com`, `blackmagicdesign.com`, `docs.ndi.video`, `bitfocus.io`,
   `api.github.com`.

What made this segment survive that far better than intercom did: **tally is overwhelmingly
an open-source segment**, and `git clone` worked through the proxy. So instead of reading
marketing pages, this dossier was built by cloning and reading the actual source and shipped
documentation of the products. Nineteen repositories were cloned or fetched; protocol
statements below are taken from parser code and vendor-shipped docs, not from memory.

Consequences, stated plainly:

- **There is not one verified vendor price in this dossier.** Not one. No vendor pricing page
  was reachable and no search summary of one existed. The single verified money figure in the
  whole document is an open-source project's own statement of its bill-of-materials cost
  (~10 EUR, cited). Do not read the absence of a price as evidence that a product is
  quote-only — the shape of pricing is argued as **INFERENCE** in *Pricing* below.
- **Commercial vendors could not be researched from their own documentation.** TSL Products,
  Skaarhoj, Glensound, Cuebi, MetusTally and Blackmagic have no verified entry here beyond
  what their **Bitfocus Companion modules** or third-party field notes reveal about their
  wire protocols. That is tier-1 evidence about *the control surface* and says nothing about
  build quality, RF range, battery life or price.
- Products named in the research brief that I could **not** verify at all are listed in
  *Not opened / unverified* at the end rather than being described from memory.

One unusually good source deserves flagging up front: **`benjyyy/ross-carbonite-to-flextally`**
is a German church-tech team's field-notes repository that reconstructs the Cerevo FlexTally
Station's undocumented UDP control protocol out of the vendor's own shipped Electron app
bundle, and records GPIO failure modes measured in service. It is the only primary-adjacent
window onto a commercial wireless tally product in this pass, and it is cited heavily.

---

## Segment summary

**Tally is the answer to one question, asked by one person, under time pressure: "am I live?"**
A tally system takes the on-air state of a video switcher and puts it in front of the people
who need it — a red lamp on the camera, a coloured border in a multiviewer, a label under a
monitor, a light the presenter can see.

Functionally the whole category is three stages (**INFERENCE**, but every product examined
here decomposes this way):

| Stage | What it does | Where it usually lives |
| --- | --- | --- |
| **Ingest** | Learn on-air state from one or more switchers | Native switcher protocol (ATEM, vMix TCP, obs-websocket, TSL UMD in, HTTP poll) |
| **Arbitrate** | Merge multiple sources onto one logical *device* (a camera), decide its bus state | A hub process — this is the part that barely existed before Tally Arbiter |
| **Indicate** | Drive something a human can see | LED/lamp, GPO relay, UMD text, multiviewer border, viewfinder, phone browser |

The middle stage is where the segment's value has migrated. Ingest is commoditised (every
switcher publishes state somehow) and indicate is commoditised (an ESP32 and an LED cost a
few euros). What is genuinely hard, and what people pay for, is arbitration: one camera
appearing on input 3 of an ATEM, scene "Cam 3" in OBS, and TSL address 12 on a Ross, and
being correctly red when *any* of those says so.

**Who buys it.** Three buyer types with almost nothing in common (**INFERENCE**, supported by
the documentation tone and hardware targets of each tier):

1. **Broadcast / OB engineers.** Buy a UMD and tally infrastructure as part of the facility:
   TSL UMD over the house network, GPIO to camera CCUs, multiviewer integration, Ember+
   virtual GPIO into a Lawo. Bought against a spec, tendered, and expected to run for a
   decade. Tally Arbiter's Ember+ action is documented as "tested on Lawo MCX 6.4 and 10.8"
   (**FACT** — Tally Arbiter `devices.md`), which tells you exactly which world that feature
   is for.
2. **Houses of worship, schools, corporate AV, small OB.** The volume centre of the segment.
   Buy an ATEM Mini or vMix, four cameras, and need lamps. This buyer is the entire reason
   the DIY tier exists, and the documentation proves it: the biggest ESP8266 project credits a
   tutorial video by "Budget Church Livestreaming" (**FACT** — `AronHetLam` README), and the
   FlexTally bridge says outright it "was written for a German church tech team"
   (**FACT** — that repo's README).
3. **Rental / freelance crew.** Need tally that survives being thrown in a case, works on a
   different switcher every week, and does not require a network engineer. Least well served
   of the three (**INFERENCE** — argued in *White space*).

**Typical price band: UNKNOWN in this pass** — see the caveat. The *structure* of pricing is
discussed under *Pricing* and is inference, not finding.

**Structural note (INFERENCE, well-supported):** this segment has an unusual shape — it is
*hollow in the middle*. There is a rich free/open-source tier (Tally Arbiter, Tally Hub,
vTally, a dozen ESP32 firmwares) and a professional hardware tier (TSL, Ross, Lawo, Riedel
UMD ecosystems), and remarkably little commercial software in between. The commercial
products that do exist in the middle — Cerevo FlexTally, Tally-MA — are sold as *hardware
with firmware*, not as software. **INFERENCE:** software-only tally is hard to charge for
because the hub is a few thousand lines of protocol adapters and a very good free one already
exists under MIT.

---

## Product table

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Tally Arbiter 3.3.0** | Joseph Adams (techministry) | Electron desktop (mac/Win/Linux), Node CLI, Docker | Free, MIT | **Yes** — fully local; optional cloud relay is opt-in | socket.io event API (REST removed in 3.0.0); MQTT publish; Companion module | Arbitrating many switchers onto one camera; breadth of protocols in and out |
| **Tally Hub 1.2.0** | tallyhubpro | Electron/Node, Docker, Pi one-liner install | Free, open source (license file present; not read) | **Yes** — local hub | HTTP admin on :3000, UDP :7411 device protocol, mDNS `_tallyhub._udp` | Zero-config device onboarding + in-browser firmware flashing |
| **vTally / wifi-tally** | wifi-tally project | ESP8266 NodeMCU firmware + Node/Next.js hub | Free, open source; **~10 EUR hardware** (project's own figure) | **Yes** | UDP :7411 tally protocol; hub web UI | Explicit connection-health model (CONNECTED / MISSING / DISCONNECTED) |
| **ATEM tally light with ESP8266** | AronHetLam | ESP8266/ESP32 firmware | Free, open source | **Yes** — talks straight to the ATEM | Web config page on device; no external API | Beating the ATEM 5–8 client limit via tally-to-tally relay |
| **STAC (Smart Tally Atom Client)** | Xylopyrographer | ESP32 firmware (M5 Atom, LilyGo, StickC Plus) | Free, open source | **Yes** | Web config UI; no external API | Roland V-60/80/160HD *and* ATEM in one firmware; operator-vs-talent modes |
| **Cerevo FlexTally / FlexTally Pro** | Cerevo (JP) | Station box + wireless lamps | Commercial hardware — **price UNKNOWN** | **Yes** — LAN/radio, no cloud | Undocumented UDP control protocol on :8889 (reconstructed by third party) | Turnkey wireless lamps with a real radio link, not WiFi |
| **Tally-MA** | tally-ma.com | Wireless tally hardware + server app | Commercial hardware — **price UNKNOWN** | Mostly — has an opt-in cloud mode | HTTP GET command URLs; UDP :21324; Companion module | Separate operator LED / talent LED control, plus a "call" feature |
| **Blackmagic GPI and Tally Interface** | Blackmagic Design | 1RU box, 8 GPIs | Commercial hardware — **price UNKNOWN** | **Yes** | TCP :9991 line protocol (ACK/NACK, `BUTTON SDI_A:`) | Turning ATEM tally into contact closures for legacy gear |
| **TSL UMD ecosystem (TallyMan et al.)** | TSL Products (UK) | Hardware + software | Commercial — **price UNKNOWN** | Presumed yes | TSL UMD 3.1 / 4.0 / 5.0; Companion modules exist for send and listen | Being the protocol everyone else implements |
| **NDI tally (NDI SDK)** | Vizrt/NDI | Library/platform feature | Bundled with NDI | **Yes** — LAN | `NDIlib_tally_t {on_program, on_preview}` via `recv_set_tally()` | Tally with **zero address mapping** — it rides the video connection |
| **AMWA IS-07** | AMWA (standards body) | Specification | Free spec, CC BY-ND 4.0 | N/A | WebSocket or MQTT event transport, IS-05 connection management | The only tally transport with timestamps, health and last-will semantics |
| **tally_pi** | deckerego | Raspberry Pi Zero W + Blinkt!/NeoPixel | Free, open source | **Yes** | HTTP `:7413/set?color=&brightness=` and `/status` | Dead-simple HTTP-addressable lamp; 3D-printed case with flash-bracket mount |
| **TSL-NDI-tally** | iliessens | Windows executable | Free, MIT (alpha) | **Yes** | Listens TSL 3.1 on UDP :8888; maps via `tallymap.txt` | Bridging hardware-switcher tally into NDI devices |
| **vMix M5Stick Tally Light** | Guido Visser | M5StickC firmware | Free, open source | **Yes** | Web UI on device; browser-based flasher | Best endpoint UX in the DIY tier (battery, brightness, orientation, reconnect) |
| **tallytime** | micro-henry | RP2040 + LoRa hardware (KiCad) | Free, open source | **Yes** | UNKNOWN — README is a stub | Tally **and** LTC timecode over LoRa, not WiFi |
| **tally-pi** (own) | larszu | Raspberry Pi + Companion | Free, own repo | **Yes** | HTTP guide server; GPIO in/out | Browser tally + GPIO lamps + trigger buttons from one Pi |

**Table honesty note:** the four commercial rows (FlexTally, Tally-MA, BMD GPI & Tally, TSL)
have *protocol* evidence from Companion modules and third-party reverse engineering, and
**no verified pricing, RF range, battery figure or build-quality claim whatsoever**.

---

## Deep dives

### 1. Tally Arbiter (Joseph Adams) — the reference implementation of the segment

**What it does.** Aggregates tally from many switchers simultaneously, arbitrates a single
Preview/Program state per logical *Device*, and fans that out to a large set of output
mechanisms. Version **3.3.0**, MIT licensed, Node ≥18.13, Angular UI, Electron desktop plus
Docker plus `npm install -g tallyarbiter` (**FACT** — `package.json`, `readme.md`). Default
listen port **4455** (**FACT** — `src/index.ts:138`).

**Data model.** Three entities, and the shape of them is the intellectual core of the
segment:

- **Source** — one switcher connection. 16 documented source types plus three undocumented
  ones present in code (`DataVideoIP`, `IncomingWebhook`, `InternalTestMode`) (**FACT** —
  `src/sources/` listing vs `docs/usage/sections/sources.md`).
- **Device** — a camera. Carries a *list* of `DeviceSource` mappings, each pinning that
  camera to an address on one Source. "A Camera can be connected to a Blackmagic ATEM on
  Input 1, but connected to an OBS Studio on Scene 2" (**FACT** — `devices.md`).
- **BusOption** — `{ label, type, id, color, priority, visible }` (**FACT** —
  `src/_models/BusOption.ts`).

The arbitration rule is the interesting bit. Device Sources can be **linked** on the preview
bus, the program bus, or both; when linked, the device is only considered active on that bus
if it is active there **across all** assigned sources (**FACT** — `devices.md`). So the
default is OR (any source lights it) and linking gives you AND. That two-line design decision
is the whole product.

**Integrations.** Inbound: Analog Way Livecore and LivePremier/Aquilon, Blackmagic ATEM,
Blackmagic VideoHub, Grass Valley Contribution Tally, NewTek TriCaster, OBS Studio,
OSC, Panasonic AV-HS410, Riedel SimplyLive, Roland Smart Tally, Roland VR-50HD-MKII, Ross
Carbonite family, Ross Vision, vMix, TSL 3.1/5.0 UDP+TCP (**FACT** — `sources.md`).
Outbound *actions*: TSL 3.1 and 5.0 (UDP/TCP), outgoing webhook, generic TCP/UDP, OSC,
**Ember+ virtual GPI**, RossTalk, console (**FACT** — `devices.md`). Outbound *listeners*:
web page, M5StickC/Plus/Plus2, M5StickS3, M5 Atom Matrix, ESP32 NeoPixel, ESP32-C3, TTGO_T,
blink(1) USB, Pimoroni Blinkt!, USB relay, Raspberry Pi GPO, plus **vMix server emulation**
so third-party vMix tally clients work against it (**FACT** — `listener-clients.md`).

Concrete protocol details worth stealing, all read from source:

- **vMix**: TCP **8099**, opens with `SUBSCRIBE TALLY` and `SUBSCRIBE ACTS` (**FACT** —
  `src/sources/VMix.ts`).
- **Roland Smart Tally**: HTTP polling of `http://<ip>/tally/<address>/status` (**FACT** —
  `src/sources/RolandSmartTally.ts`); HTTP Basic auth added in 3.3.0 (**FACT** — releases).
- **OBS**: supports obs-websocket **v4 and v5 simultaneously** via two client libraries
  (**FACT** — `src/sources/OBS.ts` imports both). The docs warn that OBS 28+ ships
  obs-websocket on port 4455 — which collides with Tally Arbiter's own default (**FACT** —
  `sources.md`). A genuinely nasty first-run trap.
- **ATEM**: selectable MEs 1–6, AUX bus enumeration, a "Cut Bus Mode", and pseudo-addresses
  `{{RECORDING}}` and `{{STREAMING}}` so a device can tally on record/stream state
  (**FACT** — `src/sources/BlackmagicATEM.ts`). It uses `listVisibleInputs()`, so keyers and
  SuperSource are accounted for rather than just reading the program input register.
- **Auto-discovery**: mDNS via `bonjour-service`; ATEMs are found by browsing for service
  type `blackmagic` with TXT `class=AtemSwitcher` (**FACT** — `BlackmagicATEM.ts`,
  `src/_helpers/mdns.ts`). Listener clients discover the *hub* by zeroconf, so a Pi lamp
  needs no IP configured (**FACT** — `gpo-listener/README.md`, `blink1-listener/README.md`).

**Camera tally without a lamp.** 3.3.0 added direct camera integration: a Device can carry a
Camera IP + Camera Model and Tally Arbiter talks to the camera's own tally lamp. Implemented
models: **Canon PTZ (XC protocol)**, and **Sony VISCA over IP** on fixed UDP port **52381**
in two variants — single lamp (BRC/SRG) and red/green lamps (ILME-FR7) (**FACT** —
`devices.md`). Two details here are unusually honest for a product doc and unusually useful:
the Sony support is marked **experimental and never tested against real hardware**, and Sony
bodies **extinguish the lamp if they do not get another "on" within 15 seconds, so Tally
Arbiter re-sends the current state every few seconds while a lamp is lit** (**FACT** —
`devices.md`). Most cameras also need tally handed to an external controller first
(`[Technical] > [Tally] > [Tally Control] > [External]` on the FR7).

**Notable strengths.**
- Breadth is unmatched in the segment, and it is *protocol* breadth, not device breadth.
- **TSL protocol conversion as a first-class feature**: ingest anything, emit TSL 3.1/5.0 to
  UMDs and multiviewers. That makes it an interop box, not just a lamp driver.
- **MQTT publish** with a clean topic tree (`{prefix}/device/{id}/bus/{busId}/state` carrying
  a bare `ON`/`OFF` specifically so Home Assistant binary sensors work), retain and QoS
  configurable (**FACT** — `mqtt.md`).
- Operational maturity: per-listener "flash" to identify which lamp is which, producer page
  with chat to the camera ops, error reports, log levels, documented log file paths per OS.
- Release cadence is real: 3.0.8 Ember+ (2024-02), 3.1.0 Contribution tally + ATEM aux +
  nested OBS scenes (2024-09), 3.2.0 TSL 5.0 + MQTT + webhook source (2025-02), 3.3.0
  security hardening + camera tally + M5StickS3 (2026-07) (**FACT** — releases page).

**Notable limits.**
- **No REST API.** "As of version 3.0.0 there's no REST API anymore… all communication of the
  UI and the backend is handled with socket.io" (**FACT** — `developers/03-rest-api.md`).
  Integrating anything non-JS means speaking socket.io, and the documented listener contract
  is four events (`bus_options`, `devices`, `device_listen`, `device_states`).
  Open issue #1124 asks to "expose full current tally state from TallyInput" — so this is felt
  internally too (**FACT** — issue list).
- **The bus model is still fundamentally two-valued.** `BusOption.type` resolves to program or
  preview; AUX buses are mapped onto type `program` (**FACT** — `src/sources/RossCarbonite.ts`
  bus table, where Aux 1–8 all carry `type: 'program'`). There is no first-class ISO / record /
  "on a multiviewer somewhere" bus state.
- **Fragility lives in the endpoint firmware, not the hub.** Of the seven open bug reports on
  2026-08-28, four are M5 Atom Matrix listener firmware issues (#1175, #1178, #1179, #1180)
  (**FACT** — open issues list). The server is mature; the ESP32 clients are where users get
  hurt.
- Default producer credentials were `producer` / `12345` until 3.3.0 forced a change on first
  sign-in (**FACT** — `listener-clients.md`, releases). Historic installs are a security
  liability.

---

### 2. Cerevo FlexTally + the Ross bridge — what a commercial wireless product actually looks like

This is the segment's most instructive case study, and it is only visible because a German
church tech team wrote down what they learned (**FACT** — `benjyyy/ross-carbonite-to-flextally`,
last commit 2026-08-09).

**What it is.** A **Station** box plus battery wireless **lamps** on a proprietary radio link.
The Station takes tally either over Ethernet or over GPIO, and rebroadcasts to lamps.

**The GPIO trade-off, measured in the field.** Station DIP switch 3 selects either **4 channels
with program+preview**, or **8 channels program-only** (**FACT** — repo's DIP switch table,
read out of the vendor Utility). You cannot have eight cameras and preview. Over Ethernet you
get both. This is the single clearest illustration in the whole corpus of why network tally
displaced contact closure.

**The GPIO failure mode, stated better than any vendor states it:**

> "GPIO has no failure detection. A voltage level carries no timestamp. If the switcher is
> powered down, reboots, or the cable comes loose, the last level simply stays there and
> **lamps hang on** — a camera shows red while it is not live, which is worse than no tally
> at all." (**FACT** — repo README)

Their symptom in service was "sometimes one lamp works and the other doesn't, sometimes they
all light up", and they call a flaky GPIO run "nearly undebuggable" because you are looking at
voltage levels with no way to attribute the fault.

**The Station's control protocol** (**FACT** — reconstructed from
`FlexTally-Utility.app/Contents/Resources/app.asar` v2.0.0; command numbers and offsets read
from shipping code, `prev_lamp` semantics additionally confirmed on hardware):

- Plain UDP. Every packet is a 4-byte little-endian command number plus optional payload.
- **Discovery on port 8889**: broadcast cmd `1` + ASCII `"CerevoFlexTally\0"` to
  `255.255.255.255:8889`; reply cmd `2` carries the Station's working `udp_port`, `tcp_port`
  and display name. The Utility sends the broadcast three times, 850 ms apart.
- Commands: lamp test `4`; set/get switcher settings `6`/`7`→`8`; set/get network `9`/`10`→`11`;
  read DIP switches `15`→`16`; firmware version `100`→`101`.
- Ethernet switcher modes are an enum following the Utility's radio-button order: **LiveWedge,
  ATEM, TriCaster, vMix, Wirecast**.
- **Any switcher-settings change requires a Station power-cycle.**

**Why it needed a bridge at all.** The Station speaks ATEM, TriCaster, vMix, Wirecast and
LiveWedge — **but not Ross, and not TSL** (**FACT**). The bridge therefore listens to the
Carbonite's TSL UMD 3.1 stream and **pretends to be a vMix server on TCP 8099** so the Station
connects to it. Tally Arbiter's vMix emulation exists for exactly the same reason — vMix's TCP
protocol has become the de-facto lingua franca that cheap tally endpoints implement.

**The failsafe problem, and a subtle bug most implementations would ship.** The bridge turns
all lamps off when the switcher goes silent — the correct behaviour. But: "The Carbonite sends
over TCP only when something changes. There is no `1SecUpdate` option in this firmware, so a
plain '5 seconds of silence → lights out' rule blanks the lamps mid-show, while the camera is
still live." Their fix is to treat the switcher as present as long as the **TCP connection is
open**, and apply the silence timeout only for UDP or after the socket drops (**FACT**). This
is a genuinely non-obvious correctness insight and it is worth stealing verbatim.

**Successor.** Cerevo recommends **FlexTally Pro** for new installs: PoE-powered, up to 128
tally inputs and 128 lamps, over 100 tested switchers, Ethernet protocols **ATEM, vMix,
Wirecast, TriCaster** — "Ross does not appear once, and neither does TSL. Even Sony switchers
are listed as GPIO-only" (**FACT** — repo, quoting the vendor spec page it links). The original
is still sold as "limited stock" and is not on Cerevo's discontinued list. **Price UNKNOWN**
for both.

---

### 3. vTally / wifi-tally — the best *reliability model*, in an abandoned project

**What it does.** ESP8266 (NodeMCU, Lua) tally lights talking UDP to a central TypeScript hub
that connects to the mixer. Supported mixers: Blackmagic ATEM, OBS Studio, Roland V-8HD and
V-60HD, vMix (**FACT** — `documentation/docs/index.md`). Stated hardware cost **about 10 EUR**
(**FACT** — same file; this is the project's BOM claim, not a product price).

**The two-lamp model.** Every tally has **Operator Lights** and **Stage Lights**, configured
independently, with per-group LED count (0–10) and per-group drive polarity (`grb+` for
common-anode, `grb-` for common-cathode), mixing discrete RGB LEDs and WS2812 strips freely
(**FACT** — `documentation/docs/tally.md`). Operator lights always precede stage lights in the
strip. This operator/talent split recurs across the whole segment — STAC has "Camera Operator"
and "Talent" modes, Tally-MA has separate operator-LED and talent-LED commands — and it is a
real domain concept, not a feature: the operator needs to see preview, the person on camera
must **not**.

**The connection-health model — the best in the segment.** Three states, not two:

```
CONNECTED  →  MISSING (no report for 3 000 ms)  →  DISCONNECTED (no report for 30 000 ms)
```

(**FACT** — `hub/src/tally/UdpTallyDriver.ts`, defaults in `hub/src/lib/AppConfiguration.ts:54-55`;
tally UDP port **7411**, `AppConfiguration.ts:51`.) The hub sweeps every 500 ms, logs the
transition with the actual elapsed milliseconds, and **re-sends each tally's current state on a
configurable keep-alive interval specifically "to compensate for lost packages"** (**FACT** —
comment in `UdpTallyDriver.ts`). A "missing" lamp is visibly distinct from an unpatched one in
the hub UI. This is precisely the failure detection GPIO cannot do, implemented in ~120 lines.

The device end matches: distinct blink patterns for *waiting for WiFi*, *waiting for IP*,
*cannot reach hub*, and *invalid settings file*, each with its own troubleshooting section and
animated GIF (**FACT** — `documentation/docs/troubleshooting.md`). A field tech can diagnose a
tally without a laptop.

**Notable limits — and they are fatal ones.**
- **Effectively unmaintained.** Last commit **2022-01-21** (**FACT** — `git log`).
- **It cannot talk to modern OBS.** `hub/package.json` pins `obs-websocket-js: ^4.0.3`
  (**FACT**), i.e. obs-websocket protocol v4 only. OBS Studio 28+ ships v5. Issue **#131
  "OBS Websocket 5 support"** has been open since **2023-06-05** (**FACT** — issue list).
- Twelve open issues, most from 2023–2024, unanswered; `documentation/docs/protocol.md` is an
  empty file, and issue #141 "Protocol.md is empty" (2025-10) records that (**FACT**).

**INFERENCE:** this is the segment's cautionary tale. The engineering that mattered most — the
health model — was done well and is now stranded, because the *integration* surface (one
websocket library version) rotted faster than the *design*. Anything built here should treat
switcher adapters as the part that will need maintenance forever, and isolate them accordingly.

---

### 4. Tally Hub — the modern onboarding story

**What it does.** A newer TypeScript hub (v1.2.0) shipping as macOS/Windows desktop apps, a
Docker image, and a one-line Pi installer, with an admin panel on `:3000` (**FACT** —
README fetched 2026-08-28).

**Connectors.** Blackmagic ATEM (Mini through Constellation 8K), NewTek TriCaster, vMix via
its HTTP API, OBS via obs-websocket, Panasonic (AV-HS410/HS6000), FOR-A (HVS series), Grass
Valley — the last three via **TSL UMD 3.1 and 5.0 over UDP/TCP** (**FACT** — README).

**Why it matters: discovery and provisioning.** This is the one area where it clearly beats
Tally Arbiter (**FACT** for the mechanism, **INFERENCE** for "beats"):

1. **UDP broadcast probe.** Firmware broadcasts `{ "type": "discover" }` on UDP **7411**; the
   hub replies directly with `{ "type":"discover_reply", "hubIp":"<address>", "udpPort":7411,
   "apiPort":3000 }` and the device persists it.
2. **mDNS fallback.** After several failed attempts the device queries `_tallyhub._udp.local`
   and adopts the first result. The advertised TXT record carries `api=<http-port>`,
   `udp=<udp-port>`, `ver=<package version>`. Suppressible with `DISABLE_MDNS=1`.

(**FACT** — README "Device Discovery (UDP + mDNS)" section.)

3. **Browser-based firmware flashing** at `/flash.html`, from three firmware sources
   including arbitrary ESP32 `.bin` files (**FACT**). Supported endpoints: ESP32-1732S019,
   M5StickC Plus 1.1, M5StickC Plus2, or any web browser.

A volunteer plugs in a stick, flashes it from a web page, powers it on, and it finds the hub.
No IP typed anywhere. **INFERENCE:** this — not protocol count — is what decides whether a
church tech team succeeds on a Sunday morning.

**Notable limits.** Far narrower switcher support than Tally Arbiter (no Ross-specific bus
mapping, no Analog Way, no Ember+ out, no OSC). Small project — 3 stars, one contributor
visible. License file exists but was not read (**UNKNOWN** — which license). No evidence of
an outbound API beyond the admin HTTP surface.

---

### 5. NDI tally and AMWA IS-07 — the two architectural alternatives

These are not products competing with the above; they are two different answers to "how should
tally move on a network", and both are more interesting than the lamp firmwares.

**NDI tally — receiver-driven, zero address mapping.** The NDI SDK's tally is a two-field
struct set by the *receiver* on its connection to a source:

```c
NDIlib_tally_t tally_state;
tally_state.on_program = program;
tally_state.on_preview = preview;
p_NDILib->recv_set_tally(pNDI_recv, &tally_state);
```

(**FACT** — `iliessens/TSL-NDI-tally`, `NDITally.cpp:32-36`.) The profound part: **the
switcher already knows which source it is receiving**, so tally flows back up the video
connection with no address table, no patch list, no "camera 1 is on input 12 because input 1
died" problem. Every other system in this dossier spends most of its configuration effort on
exactly that mapping.

The bridge that converts hardware tally into NDI tally exposes the limits: it maps TSL IDs to
NDI source names through a hand-written `tallymap.txt`, and the author explains why the TSL
label cannot be used automatically — "the TSL protocol is limited to 16 characters, this might
often be not enough to fully specify the NDI name" (**FACT** — README). It listens on UDP
**8888**, is Windows-only, TCP is not implemented, and it is self-described as alpha
(**FACT**).

**AMWA IS-07 (NMOS Event & Tally) — the standards answer.** Its own rationale states the
problem precisely: "**ST 2110 does not provide an equivalent to GPI functionality** — this
leads to the danger of multiple proprietary approaches" (**FACT** — `is-07/README.md`).

The model: emitters publish state and state-change events over **WebSocket or MQTT**, with
connections managed by IS-05. Event types are generic — `boolean`, `string`, `number`, `enum`
(**FACT** — `docs/Event types.md`). Message types are `state`, `health`, `connection_status`,
`reboot`, `shutdown` (**FACT** — `docs/Message types.md`).

Its reliability engineering is the best in the segment and is worth reading even if you never
implement NMOS:

- **Three timestamps per event**: `creation_timestamp` (mandatory), `origin_timestamp` (the
  external trigger that caused it), `action_timestamp` (when it should take effect, "for
  synchronising and dealing with delays"), explicitly not for scheduling more than a few
  seconds out (**FACT**).
- **Retained MQTT messages solve late joiners** — a receiver that connects mid-show
  immediately gets current state instead of waiting for the next change (**FACT** —
  `Transport - MQTT.md`). This is the exact bug the Analog Way LivePremier source in Tally
  Arbiter documents as an unavoidable limitation: "The device only pushes tally changes, not a
  snapshot on connect, so an input that is already on program when Tally Arbiter connects will
  tally on its next change" (**FACT** — `sources.md`).
- **A retained Last Will message** publishing `connection_status active:false` means the
  broker announces a dead emitter on its behalf (**FACT**). That is the structural fix for
  "lamps hang on when the switcher dies" — the failure mode the FlexTally team spent years
  fighting with GPIO.
- QoS **exactly once (2)** recommended for publishers (**FACT**).

**Notable limit:** IS-07 defines transport and event *types*, not tally *semantics*. There is
no standard "this boolean means program". Interop still requires out-of-band agreement, and
**UNKNOWN:** how much real tally equipment implements IS-07 at all — I could not verify a
single shipping implementation from a reachable source.

---

## Standards & protocols

### TSL UMD — the lingua franca

Three versions are live in the field, all three implemented by the official-vendor Companion
module (**FACT** — `bitfocus/companion-module-tslproducts-umd`, `companion/HELP.md`: "This
module supports protocol versions 3.1, 4.0 & 5.0").

**TSL UMD 3.1** — UDP only, fixed **18-byte** packets:

| Byte | Content |
| --- | --- |
| 0 | `0x80 + address` (so address = `byte0 - 0x80`, 0–126) |
| 1 | Control byte: bit 0 = tally 1, bit 1 = tally 2, bit 2 = tally 3, bit 3 = tally 4, bits 4–5 = brightness |
| 2–17 | 16-character ASCII label |

(**FACT** — parser in Tally Arbiter `src/sources/TSL.ts` — `address = buf.readUInt8(0) - 0x80`,
bit extraction, `label = buf.toString('utf8', 2)`; and the builder in the TSL Products
Companion module: `bufUMD[0] = 0x80 + address`, tally values `0x30` none, `0x31` tally1,
`0x32` tally2, `0x34` tally3, `0x38` tally4.)

Two independent sources confirm the same observed values in the field — the FlexTally bridge
recorded "`0x30` off, `0x31` preview, `0x32` program (bits 4/5 are brightness)" and warns "do
not guess this — measure it" (**FACT**).

**The critical semantic gap:** the spec does not say what the four tallies *mean*. Tally
Arbiter's own documentation states it plainly: "TSL 3.1 UDP/TCP supports Tally 1, 2, 3 and 4.
The protocol specification does not specify what the tallies are used for, it is
device/implementation specific. Some use Tally 1 for program some use it for preview"
(**FACT** — `devices.md`). Every TSL integration therefore ships a mapping dropdown.

**TSL UMD 4.0** — UDP only; adds left/right tally with colours red / green / amber
(encoded 1 / 2 / 3, 0 = off) (**FACT** — `src/utils.js` `colorToBits()` in the TSL Companion
module).

**TSL UMD 5.0** — UDP **and** TCP framing, packets up to **2048 bytes**, and a two-level
address space:

- **Screen** — index 0–65534, conceptually one multiviewer; **65535 (`0xffff`) is a broadcast
  screen** applying to all screens.
- **Display** — index 0–65534 within a screen, one monitor window; **65535 is a broadcast
  display**.
- Three indicators per display: `lh_tally`, `rh_tally`, `txt_tally`, each Off / Red / Green /
  Amber.

(**FACT** — `nocarryr/tslumd`, `doc/source/protocol.rst`, which cites the canonical spec at
`https://tslproducts.com/wp-content/uploads/Manuals/Control/tsl-umd-protocol.pdf` —
**not opened, host blocked**.)

Packet layout as parsed in the field:

```
PBC(2, LE) VAR(1) FLAGS(1) SCREEN(2) INDEX(2) CONTROL(2) LENGTH(2) TEXT(LENGTH)
CONTROL bits: 0-1 rh_tally, 2-3 text_tally, 4-5 lh_tally, 6-7 brightness,
              8-14 reserved, 15 control_data
tally value:  0 = off, 1 = program (red), 2 = preview (green), 3 = both
```

(**FACT** — `TSL5DataParser.parseTSL5Data()` and `decodeTallyBusState()` in Tally Arbiter
`src/sources/TSL.ts`.)

**A documented real-world interop quirk, straight from the code comment:** "Some TSL 5.0
senders (e.g. Panasonic Kairos) only pulse `text_tally` briefly around a cut and drive their
steady-state on-air indication through `rh_tally`/`lh_tally` instead, so all three fields are
combined with OR logic" (**FACT** — `TSL.ts`). And from the TSL Companion module, a comment on
the v3.1 builder: "ignore spec and pad with 0 for better aligning on Decimator etc"
(**FACT**). The spec is not the protocol; the installed base is.

### Other wire protocols in this segment

| Protocol | Transport | Notes |
| --- | --- | --- |
| **ATEM** | UDP **9910** | 5–8 simultaneous client limit depending on model (**FACT** — `AronHetLam` README, Tally Arbiter `sources.md`). mDNS-discoverable: service `blackmagic`, TXT `class=AtemSwitcher`. |
| **vMix TCP API** | TCP **8099** | `SUBSCRIBE TALLY` / `SUBSCRIBE ACTS`. De-facto standard — emulated by both Tally Arbiter and the FlexTally bridge. |
| **obs-websocket** | TCP **4455** (v5) / 4444 (v4) | v5 ships inside OBS 28+. Collides with Tally Arbiter's default port. |
| **Roland Smart Tally** | HTTP poll | `GET http://<ip>/tally/<n>/status`. |
| **RossTalk** | TCP | Supported as a Tally Arbiter outbound action. |
| **GV Contribution Tally** | TCP or UDP | "It's an older protocol sir, but it checks out" — used by older Ross Vision. |
| **Ember+** | TCP | Used to set **virtual GPIO** on routers/consoles; boolean or int64-as-boolean; tested on Lawo MCX 6.4 / 10.8. |
| **NDI tally** | over the NDI connection | `NDIlib_tally_t {on_program, on_preview}` via `recv_set_tally()`. |
| **AMWA IS-07** | WebSocket or MQTT | Timestamped events, retained state, last-will. |
| **OSC** | UDP | Tally Arbiter accepts `/tally/{preview,program,previewprogram}_{on,off}` with the address as one int/float/string argument. |
| **MQTT** | TCP 1883 | Tally Arbiter publishes `{prefix}/device/{id}/bus/{busId}/state` as bare `ON`/`OFF`. |
| **GPIO / contact closure** | wire | No addressing, no timestamp, no failure detection. Still ubiquitous into camera CCUs. |
| **Blackmagic GPI & Tally Interface** | TCP **9991** | Newline-delimited text blocks (`ACK`, `NACK`, `BUTTON SDI_A:`, `SETTINGS:` with `Latch mode`), 8 GPIs (**FACT** — `companion-module-bmd-gpi-and-tally-interface/src/comm.js`). |

### Bus addressing conventions

There is no standard for expressing *which bus* a tally refers to, so vendors encode it in the
address space. Ross Carbonite's map, as implemented:

| TSL address | Bus |
| --- | --- |
| 25 / 26 | ME 1 BKGD / PST |
| 35 / 36, 45 / 46 | ME 2, ME 3 |
| 65–72 | Aux 1–8 |
| 81 / 82, 86 / 87, 91 / 92, 96 / 97 | MiniME 1–4 BKGD / PST |
| `onair_program` / `onair_preview` | The switcher's OnAir logic |

(**FACT** — `src/sources/RossCarbonite.ts` bus table.) Note every Aux entry is typed
`program` — the aux/ISO distinction is flattened at ingest.

---

## What this segment does WELL

Patterns worth stealing, each tied to where it was observed.

1. **Separate the logical device from its per-source addresses.** Tally Arbiter's
   Device → DeviceSource[] model is the correct shape: a camera is one object; where it lands
   on each switcher is a mapping. Everything else (arbitration, actions, listeners) hangs off
   the camera, not off the switcher input. *(Tally Arbiter)*

2. **Make the merge rule explicit and per-bus.** OR by default, AND when "linked", chosen
   independently for preview and program. Two settings, and they cover the real cases.
   *(Tally Arbiter `devices.md`)*

3. **Operator light ≠ talent light.** Three independent products model this separately —
   vTally's Operator Lights and Stage Lights with independent LED counts and polarity, STAC's
   "Camera Operator" vs "Talent" modes, Tally-MA's separate operator-LED and talent-LED
   commands. The operator sees preview; the talent must only ever see program.
   *(vTally, STAC, Tally-MA)*

4. **Model connection health as three states, not two.** `CONNECTED` → `MISSING` (3 s) →
   `DISCONNECTED` (30 s), swept every 500 ms, logged with the actual elapsed time. An
   unreachable lamp is visibly different from an unassigned one. *(vTally)*

5. **Re-send state periodically to paper over lossy transports.** vTally keep-alives "to
   compensate for lost packages"; the TSL Companion module has a configurable
   `repeatInterval` that re-transmits the last command; Tally Arbiter re-sends Sony VISCA every
   few seconds because the camera times its own lamp out after 15 s. Idempotent state
   transmission beats reliable delivery. *(vTally, TSL module, Tally Arbiter)*

6. **Fail dark, but know why you are failing.** The FlexTally bridge turns every lamp off when
   the switcher goes away — and distinguishes "TCP socket still open, just quiet" from "socket
   dropped", because the Carbonite only sends on change. Naive silence timeouts blank lamps
   mid-show. *(ross-carbonite-to-flextally)*

7. **Zero-configuration discovery in both directions.** Hubs find switchers by mDNS
   (Tally Arbiter's bonjour browse for `class=AtemSwitcher`); endpoints find the hub by UDP
   broadcast with mDNS fallback (Tally Hub's `_tallyhub._udp.local`), or by zeroconf
   (Tally Arbiter's Python listeners). Nobody should type an IP into a tally light.
   *(Tally Arbiter, Tally Hub)*

8. **Provision from the browser.** Tally Hub flashes ESP32 firmware from `/flash.html`; the
   vMix M5Stick project ships a WebSerial installer. Volunteers cannot install a toolchain.
   *(Tally Hub, vMix M5Stick Tally)*

9. **Give every device an identify function.** "Flash" a listener from the hub to find out
   which physical lamp it is. Trivial to build, indispensable on a truck. *(Tally Arbiter)*

10. **Diagnose without a laptop.** Distinct blink codes for no-WiFi / no-IP / no-hub /
    bad-config, each documented with an animated GIF in the troubleshooting page.
    *(vTally)*

11. **Emulate the popular protocol rather than asking vendors to adopt yours.** Both Tally
    Arbiter and the FlexTally bridge pretend to be a vMix server, because every cheap tally
    endpoint already speaks it. Compatibility is a feature you can implement unilaterally.
    *(Tally Arbiter, ross-carbonite-to-flextally)*

12. **Ship the label with the state.** TSL carries a 16-character source name alongside the
    tally bits, which is how the bridge team discovered "our camera 1 was patched to input 12"
    — the diagnostic reads `CAM2 (FS2)`, not `address 2`. *(TSL UMD, ross-carbonite-to-flextally)*

13. **Publish to the automation layer, not just to lamps.** Tally Arbiter's MQTT tree includes
    a topic carrying a bare `ON`/`OFF` string *specifically* so it binds to a Home Assistant
    binary sensor with no template. Designing one topic for the consumer's convenience costs
    nothing. *(Tally Arbiter)*

14. **Document the untested parts as untested.** Tally Arbiter's Sony VISCA support is labelled
    experimental and never tested against hardware, logs its outgoing packets as hex at
    `info-quiet`, and asks users to report what they see. That is how you ship protocol support
    you cannot verify. *(Tally Arbiter)*

---

## What NOBODY in this segment solves well

The white space, with the evidence for each claim.

1. **There is no tally state beyond program and preview.** Every product examined reduces to
   two buses. AUX outputs are flattened into `type: 'program'` (Ross Carbonite bus table);
   record and stream exist only as Tally Arbiter's string hacks `{{RECORDING}}` and
   `{{STREAMING}}`; ISO-record tally, "you are being recorded but not on air", "you are on the
   multiviewer", "you are next after this VT" have no representation anywhere. TSL 5.0 gives
   you three indicators × four colours and *no semantics at all* for what they mean.
   **This is the largest structural gap in the segment.**

2. **Nobody plans tally — they only run it.** Every product here is a runtime. Not one has a
   design-time artefact: no document that says "camera 3 is ATEM input 3, TSL address 27, lamp
   MAC `AA:BB:…`, GPO pin 17 on the CCU", that can be reviewed before the truck rolls, diffed
   against last show, or handed to a freelancer. The FlexTally team's own war story is exactly
   this failure — camera 1 lived on TSL address 12 because input 1 had died, and they only
   found out by sniffing packets in service. **INFERENCE:** the patch mapping is the single
   highest-value piece of tally data and it exists only inside a running hub's config file.

3. **Address mapping is manual everywhere except NDI.** Tally Arbiter: "These addresses can
   vary from source to source, so they must be manually assigned." The TSL-NDI bridge needs a
   hand-written `tallymap.txt`. NDI is the sole architecture that avoids the problem — and it
   only works for NDI sources.

4. **Failure detection is optional and inconsistent.** vTally has an excellent three-state
   health model; Tally Arbiter tracks listener connections but its *sources* have no uniform
   staleness contract; TSL UMD over UDP has none at all; GPIO structurally cannot have one.
   IS-07 solves it properly with retained last-will messages — and I could not verify a single
   shipping tally product that implements IS-07. The "lamp hangs on after the switcher dies"
   failure is thirty years old and still unsolved in the mass market.

5. **The late-joiner problem is unsolved outside MQTT.** Tally Arbiter documents it as an
   accepted limitation for Analog Way LivePremier: connect mid-show and an already-live input
   stays dark until its next state change. Any push-only protocol has this bug. Only IS-07's
   retained messages and Tally Arbiter's own MQTT retain flag address it.

6. **Viewfinder tally is nearly absent.** The camera operator's actual eyeline is the
   viewfinder, and driving tally into it requires either the camera's own lamp (Tally Arbiter's
   Canon XC and Sony VISCA support — the Sony half **experimental and never hardware-tested**)
   or SDI VANC injection. Exactly one project in the entire search does the latter
   (`FiLORUX/thast-viewfinder`, 1 star, DeckLink SDI passthrough injecting tally and frame
   lines into an URSA viewfinder feed) (**FACT** — repo description; source not read).
   **INFERENCE:** this is a real gap, not an unimportant one.

7. **Wireless means WiFi, and WiFi is the wrong radio.** Almost every endpoint here is an
   ESP8266/ESP32 on the venue WLAN, competing with the audience for airtime. The one project
   using a purpose-appropriate radio — `micro-henry/tallytime`, RP2040 + **LoRa**, carrying
   tally *and* LTC timecode — has a stub README and 6 stars. Commercial products (FlexTally)
   use proprietary radio and publish nothing about it. **UNKNOWN:** actual range and battery
   figures for any product in this segment. Not one verified number exists in this dossier.

8. **Battery is undocumented.** Endpoint firmwares expose a battery indicator (vMix M5Stick,
   Tally Hub's "unified battery smoothing & percent logic"), but no product states runtime
   hours, and no hub warns "camera 3's tally has 20 minutes left". For a device strapped to a
   camera for a six-hour show this is a striking omission.

9. **The hub is a single point of failure with no failover story.** Tally Arbiter has a
   `redundancy.json` file in the repo root but no documentation section on redundancy that I
   could find. **UNKNOWN** what it does. No product examined documents hub failover.

10. **Integration APIs are afterthoughts.** Tally Arbiter removed its REST API in 3.0.0 for
    implementation convenience and now exposes socket.io only; its own issue #1124 asks for
    full tally state to be exposed. Tally Hub, vTally and every firmware expose UI, not API.
    **INFERENCE:** consuming live tally state from another application is harder than it
    should be, which is precisely what a planning suite would want to do.

11. **Nobody bridges tally to the rest of the production.** Tally is the ground truth of "which
    camera was live when", and it is discarded. `nbd712/tally-timer` (3 stars) records how long
    each index was live — that is the *entire* market for tally as data. No product connects
    tally to shot lists, to ISO-record logs, to intercom (who to talk to), or to lighting.

12. **Cheap tier and pro tier do not meet.** The ESP32 tier cannot speak Ember+ or drive a CCU
    GPI; the broadcast tier cannot flash firmware from a browser or self-discover. Tally Arbiter
    is the only product bridging both, and it does it by being a protocol converter, not by
    unifying the model.

---

## Relevance to AV Planner Suite

Ranked by directness.

**1. `tally-pi` — direct competitor and direct beneficiary.**
The existing repo already implements the runtime half well: browser tally on any phone via QR,
GPIO lamps with per-device polarity (active-LOW for opto-coupled relay modules, active-HIGH for
direct LEDs), GPIO trigger buttons with a burst tracker for noisy fibre-optic converters, and a
live diagnostics table showing "what the software wants each pin to do next to what the kernel
actually reports" (**FACT** — `/home/user/tally-pi/README.md`). Against this landscape:

- The **polarity-per-device** setting and the **software-vs-hardware diagnostics table** are
  genuinely ahead of the field — nothing else examined shows intended vs actual pin state.
- Gaps this research says to close, in order:
  1. **A three-state health model** (`CONNECTED` / `MISSING` / `DISCONNECTED` with timeouts
     around 3 s / 30 s), copied from vTally's `UdpTallyDriver`. Fail dark on loss, and
     distinguish "quiet TCP socket" from "dropped socket" the way the FlexTally bridge does.
  2. **TSL UMD in and out.** It is the segment's lingua franca and the packet layouts are
     fully documented above. TSL-in makes tally-pi work behind Ross, FOR-A, Kairos and Panasonic
     without touching the ATEM code; TSL-out makes it drive UMDs and multiviewers.
  3. **mDNS/UDP discovery for browser tally clients**, and an identify/"flash" function.
  4. **Operator vs talent** as an explicit per-output mode, not a colour choice.

**2. `multicam-planner` — the biggest strategic opening in this dossier.**
White-space item 2 says nobody *plans* tally. multicam-planner already models cameras as
first-class objects with positions and lenses. Extending a camera with its **tally identity**
— ATEM input, TSL address, OBS scene name, lamp MAC, CCU GPI pin — turns the plan into the
artefact this entire segment lacks: a reviewable, diffable, printable tally patch that exists
*before* the show. The FlexTally team's "camera 1 lives on address 12" story is the sales pitch.
**INFERENCE, but strongly supported:** exporting that mapping as a Tally Arbiter config, a TSL
address table, or a Tally Hub device list would make the suite the design tool for a runtime
market that has none.

**3. `cable-planner` — tally is a cable, and it is currently invisible.**
GPIO tally runs, UMD feeds and tally-to-CCU wiring are real physical cables that belong in a
signal-flow plan. The FlexTally DIP-switch trade-off (4 channels with preview vs 8 channels
program-only over GPIO) is exactly the kind of constraint a cable planner should surface at
design time rather than at load-in. cable-planner already models Videohub and ATEM; tally
destinations are a natural extension of the same graph.

**4. `sony-camera-bridge` — an unexpectedly strong fit.**
Tally Arbiter drives Sony camera tally lamps over **VISCA on UDP 52381**, in two variants, and
marks the whole thing **experimental and never tested against real hardware**. sony-camera-bridge
already lists VISCA over IP on `:52381` as **verified** (**FACT** —
`/home/user/sony-camera-bridge/README.md`), plus Canon CCAPI, Panasonic AW, JVC and BirdDog.
It therefore already owns the transport layer that the segment's leading product is guessing at.
Adding a tally-lamp command to the normalizing command bus would make the bridge the best-tested
camera-tally output in existence — including the non-obvious part Tally Arbiter documents:
Sony bodies extinguish the lamp after 15 s without a refresh, and most require
`[Tally] > [Tally Control] > [External]` first.

**5. `broadcast-intercom` — same ground truth, different consumer.**
Tally state answers "who is live"; intercom needs "who do I talk to, and who must not hear
program". White-space item 11 notes nobody connects the two. Auto-dimming a live camera
operator's talkback, or highlighting the live camera's key on the director's panel, is a
differentiating feature that needs only a tally feed the suite would already have.

**6. `shell` / suite level — the interchange format.**
Nothing in this segment has one. A small, honest tally-patch schema — device, per-source
addresses, bus semantics including AUX/ISO/record, endpoint identity — that exports to Tally
Arbiter config, TSL address tables and Tally Hub device lists would be a genuine contribution
and a lock-in-free integration story.

**7. `light-planner` — weak but real.** Tally-driven automation (Tally Arbiter's MQTT →
Home Assistant → "turn on studio lights when camera 1 is on program") is a documented use case,
so a tally trigger has a place in a lighting cue model. Low priority.

**8. `pi-media-station` — no meaningful relevance found.**

---

## Pricing

**Verified prices: one, and it is not a product price.** The vTally project states "Hardware
costs of about **10 EUR**" for a NodeMCU-based tally (**FACT** — `documentation/docs/index.md`,
read 2026-08-28). That is a bill-of-materials claim by an open-source project, not a price
anyone charges.

Everything else is **UNKNOWN**. No vendor pricing page for Cerevo, Tally-MA, TSL Products,
Blackmagic, Skaarhoj, Glensound or Cuebi was reachable. **Do not treat their absence here as
evidence of quote-only pricing.**

What can be said with reasonable confidence (**INFERENCE**, from product form factor and
distribution model, not from prices):

- The **open-source hub tier is free** — Tally Arbiter is MIT and distributes via npm, Docker
  and signed desktop installers with no paid edition visible in the repository; Tally Hub
  distributes via GitHub releases and a Docker image.
- The **DIY endpoint tier is dominated by hardware cost, not software cost**, and the hardware
  named repeatedly across projects is commodity: D1 mini / NodeMCU, ESP32, M5StickC Plus,
  M5 Atom Matrix, Raspberry Pi Zero 2 W, WS2812 strips, USB relay boards, blink(1).
- The **commercial wireless tier sells boxes**: FlexTally is a Station plus lamps, Tally-MA is
  lamps plus a server app. Per-camera cost therefore scales with lamp count, and the Station /
  hub is a one-off. FlexTally Pro's headline capacity is "up to 128 tally inputs and 128 lamps"
  (**FACT** — via the bridge repo quoting the vendor spec page), which implies a licence-free
  capacity model rather than per-camera licensing.
- **Price per camera — the brief's specific question — cannot be answered in this pass.**
  To answer it I would need: `cerevo.com/en/products/flextally/`, `cerevo.com/en/products/flextallypro/`,
  `tally-ma.com`, `tslproducts.com`, `skaarhoj.com`, `blackmagicdesign.com` (GPI and Tally
  Interface), and a German reseller such as `teltec.de` or `videodata.de` for street prices.

---

## Offline behaviour

Unusually strong across the whole segment, and it is not an accident (**INFERENCE**: tally
runs on production networks that are deliberately isolated).

- **Tally Arbiter** is fully local by default; the cloud feature is explicitly framed as
  optional relay *out of* a closed network — "send source, device, and tally data from a local
  instance within a closed network to an instance of Tally Arbiter on another network… if your
  users need to access Tally Arbiter and you don't want to have them tunnel or connect into
  your private network" (**FACT** — `cloud.md`). Config lives in a local `config.json`; logs
  in documented per-OS paths.
- **Tally Hub, vTally, STAC, the ESP firmwares, tally_pi** are all LAN-only by design.
- **Tally-MA** is the one product with a real cloud dependency, and it is opt-in: "Cloud mode
  for out-of-LAN worldwide tallying with no router configuration", available from firmware
  2.2.7, and while in cloud mode only PGM/PRV/DARK/STR/REC colours are available (**FACT** —
  Companion module HELP.md).
- **FlexTally** is Station + radio with no cloud component evident.

**No product examined requires an internet connection to function.** For a suite that sells
offline-first, this segment is an ally rather than an obstacle.

---

## API surfaces

| Product | API | Assessment |
| --- | --- | --- |
| Tally Arbiter | **socket.io only** — REST removed in 3.0.0. Documented listener contract: `bus_options`, `devices`, `device_listen`, `device_states`. ~45 further socket events exist in `src/index.ts` (config, listeners, cloud, messaging, error reports) but are undocumented UI plumbing. | Adequate for JS clients, awkward for anything else. Its own issue #1124 requests fuller state exposure. |
| Tally Arbiter (MQTT) | Publishes `{prefix}/status`, `{prefix}/device/{id}/state`, `{prefix}/device/{id}/bus/{busId}` (JSON) and `…/bus/{busId}/state` (bare `ON`/`OFF`), with retain and QoS 0/1/2. | **The best integration surface in the segment.** Read-only, but clean, retained and trivially consumable. |
| Tally Arbiter (outbound) | Webhook, generic TCP/UDP (text or **hex bytes**, for binary protocols like VISCA), OSC, Ember+, RossTalk, TSL 3.1/5.0. | Effectively a general-purpose event router. The hex-bytes payload mode is a smart escape hatch. |
| Tally Hub | HTTP admin on `:3000`, UDP device protocol on `:7411`, mDNS service advertisement. | Device-facing, not integrator-facing. No documented outbound API. |
| vTally | Hub web UI; UDP tally protocol on `:7411`. `protocol.md` is **empty** (issue #141). | Undocumented. |
| tally_pi (deckerego) | `GET :7413/set?color=AA22FF&brightness=0.3`, `GET :7413/status`. | Tiny, complete, and the right idea — a lamp as an HTTP resource. |
| Tally-MA | HTTP GET command URLs `http://<host>/<mode>`; UDP `:21324`; device page at `tally01.local`. | Device-level control, no state-query API evident. |
| BMD GPI & Tally Interface | TCP `:9991` newline-delimited text (`ACK`/`NACK`, `BUTTON SDI_A:`, `SETTINGS:`). | Videohub-family protocol style. Configuration, not tally streaming. |
| NDI | `recv_set_tally()` / `NDIlib_tally_t`. | Elegant, but only for NDI. |
| AMWA IS-07 | WebSocket or MQTT event streams + a REST "late joiners" API (`ext_is_07_rest_api_url`). | The best-specified API in the segment; adoption **UNKNOWN**. |

---

## Not opened / unverified

Named in the brief or encountered in research, but **not verifiable in this pass**. Each line
says what would need to be checked.

- **TSL Products** (`tslproducts.com`) — TallyMan, UMD hardware, and the canonical UMD spec PDF
  (`/wp-content/uploads/Manuals/Control/tsl-umd-protocol.pdf`). Protocol behaviour here is
  reconstructed from three independent implementations; the spec itself was never read.
- **Skaarhoj** (`skaarhoj.com`) — the ATEM Arduino libraries are credited by AronHetLam's
  firmware and the GitHub org page confirms dual GPL / CC BY-SA licensing and an
  "ArduinoLibs" + "BlackMagic Design Arduino Shield" structure (**FACT** — org page), but no
  product, panel or price was verifiable.
- **Cuebi** — no GitHub presence found (repository search returned zero results); vendor site
  blocked. Nothing verified. Would need `cuebi.io`.
- **MetusTally** — nothing verified. Would need the vendor site.
- **Glensound** — nothing verified beyond the name.
- **Blackmagic "Blackmagic Tally"** — only the *GPI and Tally Interface* is evidenced, via its
  Companion module. Camera-side tally over SDI on URSA/Studio cameras is **unverified**.
- **PTZOptics tally** — a PTZOptics VISCA Companion module exists, but I did not confirm tally
  commands in it. Would need `ptzoptics.com` documentation.
- **Companion "satellite" tally** — Companion satellite is a surface protocol; I found tally
  *modules* (Tally Arbiter, TSL UMD send/listen, BMD GPI, ARRI, Tally-MA, TallyCCU Pro,
  TallyComm) but did not verify any satellite-based tally product.
- **Hollyland** — named in Tally Arbiter's 3.3.0 release notes as newly compatible; the nature
  of that compatibility is **UNKNOWN**.
- **FlexTally / FlexTally Pro vendor claims** — PoE, 128 inputs/128 lamps, 100+ tested
  switchers, and the protocol list all come from a third party quoting Cerevo's spec page.
  Would need `cerevo.com/en/products/flextallypro/spec/index.html` directly.
- **All range, battery-life, latency and price figures** for every commercial product.
- **Any shipping AMWA IS-07 tally implementation.**

---

## Sources

Every URL below was actually opened, cloned, or fetched on **2026-08-28**.

**Tally Arbiter (cloned; `readme.md`, `package.json`, `docs/docs/**`, `src/**`, `listener_clients/**`)**
- https://github.com/josephdadams/TallyArbiter
- https://github.com/josephdadams/TallyArbiter/releases
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+label%3Abug
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+is%3Aopen
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+disconnect+OR+reconnect+OR+%22stuck%22+OR+latency

**Open-source hubs and firmwares (cloned or raw-fetched)**
- https://github.com/wifi-tally/wifi-tally
- https://github.com/wifi-tally/wifi-tally/issues
- https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266
- https://github.com/AronHetLam/ATEM_tally_light_with_ESP8266/issues
- https://raw.githubusercontent.com/tallyhubpro/Tallyhub/main/README.md
- https://raw.githubusercontent.com/Xylopyrographer/STAC/main/README.md
- https://raw.githubusercontent.com/deckerego/tally_pi/master/README.md
- https://raw.githubusercontent.com/micro-henry/tallytime/main/README.md
- https://github.com/guido-visser/vMix-M5Stick-Tally-Light

**Protocol libraries, bridges and standards (cloned)**
- https://github.com/nocarryr/tslumd
- https://github.com/iliessens/TSL-NDI-tally
- https://github.com/AMWA-TV/is-07
- https://github.com/benjyyy/ross-carbonite-to-flextally

**Bitfocus Companion modules (cloned — primary evidence for commercial hardware protocols)**
- https://github.com/bitfocus/companion-module-tslproducts-umd
- https://github.com/bitfocus/companion-module-tslproducts-umdlistener
- https://github.com/bitfocus/companion-module-bmd-gpi-and-tally-interface
- https://github.com/bitfocus/companion-module-tallyma-wirelesstally
- https://github.com/bitfocus/companion-module-arri-tally
- https://github.com/bitfocus/companion-module-techministry-tallyarbiter

**Other**
- https://github.com/kasperskaarhoj/SKAARHOJ-Open-Engineering

**Discovery** — GitHub repository search (via the GitHub API) for `topic:tally`,
`topic:tally-light`, `TSL UMD protocol tally`, `NDI tally light`, `vmix/obs tally esp32`,
`org:bitfocus companion-module tally`, and `user:bitfocus ptzoptics OR datavideo OR tsl`.
Repositories surfaced but not individually opened include `roddypratt/tallyview`,
`FiLORUX/thast-viewfinder`, `michalramus/TallyLights`, `RedyAu/multitally`,
`nbd712/tally-timer`, `fiverecords/TallyCCUPro`, `qmsk/e2`, `clvLabs/PyATEMMax`,
`FanatiQS/wireless_atem_camera_control_and_tally`, `lebaston100/OBSliveTally`,
`jkowalk/esp-now-atem-tally`, `nocarryr/tallypi`, `Skeler14/tally-esp32-tallyarbiter`;
where they are mentioned above, only their GitHub-search description metadata is relied on and
that is stated in place.

**Local repositories read for the relevance section**
- `/home/user/tally-pi/README.md`
- `/home/user/multicam-planner/README.md`
- `/home/user/sony-camera-bridge/README.md`

**Blocked (returned `EGRESS_BLOCKED` or 403 at CONNECT; listed so the pass can be re-run):**
`tallyarbiter.com`, `tslproducts.com`, `skaarhoj.com`, `cuebi.io`, `vmix.com`, `obsproject.com`,
`blackmagicdesign.com`, `forum.blackmagicdesign.com`, `docs.ndi.video`, `bitfocus.io`,
`cerevo.com`, `tally-ma.com`, `api.github.com`, and all search engines.
