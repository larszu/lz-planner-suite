# Show Control / Automation / Surfaces

> Research pass: **2026-08-29** (corpus date 2026-08-28/29). Claims are labelled per
> `docs/research/METHOD.md`: **FACT** (read on a cited page, in cited source code, or in
> vendor documentation shipped inside a cited repository), **INFERENCE** (my reasoning from
> the evidence), **UNKNOWN / unverified**.
>
> This file replaces the earlier source-code-only pass. It keeps the repository evidence,
> corrects two things that pass got wrong, and adds the commercial tier, prices and the
> Bitfocus/Corsair ownership change that had not been researched before.

## Evidence access caveat (read before trusting any number below)

This pass ran with two different tools and two very different evidence qualities. The
distinction is load-bearing, so it is marked on every claim in the dossier.

**Tier A — opened directly (strongest).** The egress proxy allowed `github.com` and
`raw.githubusercontent.com`. Everything reachable there was cloned or fetched and read as
primary source: **9 repositories cloned** (Bitfocus Companion, Companion Satellite, the
Companion QLab module, Chataigne, ossia score, Linux Show Player, MIDIMonster, Ontime,
Open Stage Control's GitHub mirror) plus **6 more Companion connection modules** read over raw
HTTP. Companion ships its complete user guide inside the repository (`docs/user-guide/`,
a Docusaurus site), which makes it the single best primary source in this segment: vendor
documentation, versioned with the code, readable even though `bitfocus.io` was blocked.

**Tier B — search-result summary only (weaker).** Every vendor website was blocked at the
proxy (`qlab.app`, `bitfocus.io`, `hexler.net`, `alcorn.com`, `7thsense.one`, `q-sys.com`,
`etcconnect.com`, `interactive-online.com`, `visualproductions.nl`, `elgato.com`,
`troikatronix.com`, `showcuesystems.com`, `creativeconners.com`, `crestron.com`,
`en.wikipedia.org` — all returned connection refusals through the proxy). For those, the only
evidence is the **summary a web search returned about the page**. The URL is real and cited,
but I did not read the page. **Every price in this dossier is Tier B.** Treat prices as
"probably right, must be re-checked before use in a business case", not as verified.

**Tier B is explicitly not good enough for pricing decisions.** What would settle it: opening
`qlab.app/shop`, `bitfocus.io/buttons`, `showcuesystems.com/cms/pricing`,
`support.troikatronix.com/.../pricing-for-isadora-4-and-izzycast`, `wingsx.at/en/licenses-and-prices/`
and the Full Compass / B&H product pages from an unrestricted network.

**Two corrections to the previous pass of this file:**

1. It reported Companion "v5.1.0" without a release context. Verified now: the repository's
   root `package.json` on `main` is `"version": "5.1.0"`, and the shipped release notes place
   **v5.0.0 in July 2026** (`sidebar_position: -20260714`) and **v4.3.0 in March 2026**
   (`-20260329`). (FACT, Tier A.)
2. It treated `companion.free` as a suspicious URL. It is real: Bitfocus's own in-repo docs
   link to `https://l.companion.free/q/...` and `https://companion.free/for-developers/...`.
   (FACT, Tier A — the links are in the vendor's shipped user guide.)

---

## Segment summary

**Show control is the layer that turns one operator action into many machine actions.** A
lighting console, a video switcher, a media server, an audio DSP, a projector, a PTZ camera and
a motorised curtain each speak a different protocol; show control is what sits above them and
turns "GO" into the eleven messages that constitute GO.

The segment is not one market. It is four, sharing vocabulary and almost nothing else — different
buyers, budgets, and failure tolerances. (INFERENCE, but every product examined here falls
cleanly into one tier.)

| Tier | What it is | Deployment | Who buys | Typical price band |
| --- | --- | --- | --- | --- |
| **1. Surface / macro layer** | A physical button becomes N protocol messages. Operator-driven, stateless-ish. | Laptop or Pi next to the switcher | Broadcast/streaming ops, houses of worship, corporate AV | Software free to low hundreds; hardware EUR 100–900 |
| **2. Cue-list / playback layer** | An ordered list a stage manager calls GO against; audio/video playback plus network cues. | Show laptop, theatre booth | Theatre, corporate stage, live events | ~EUR 100–1,200 per seat, perpetual |
| **3. Logic / mapping / timeline layer** | Arbitrary triggers, state machines, timelines, protocol translation, scripting. Semi-attended. | Installation PC, artist laptop | Interactive art, museums, complex live shows | Free (open source) to ~EUR 500 |
| **4. Fixed-installation controllers** | Rack hardware, real-time OS, watchdogs, warranty, commissioned once, runs a decade. | DIN rail or 1RU in a comms room | Museums, theme parks, corporate AV, architectural | Hardware EUR 1,500–20,000+; software often "call sales" |

**Who buys what.** Tier 1 is bought by an operator with a credit card and no purchase order.
Tier 4 is bought by a systems integrator on behalf of a client who will never see the software.
Tiers 2 and 3 are bought by the person who will actually program them. That difference explains
almost every UX and pricing decision in the segment (INFERENCE).

**The structural event of 2024–2026: the surface tier consolidated around Bitfocus.**
Elgato's professional 1RU control surface (Stream Deck Studio, launched September 2024 in
collaboration with Bitfocus) is sold as requiring Bitfocus software, and in **July 2026 Corsair
took a minority investment in Bitfocus AS** — "the Oslo-based software company behind Companion
and Buttons, the enterprise-grade control and automation platform" (Tier B: Corsair investor
relations press release). Bitfocus now runs a free MIT open-source product (**Companion**) and a
commercial product (**Buttons**) side by side. Companion's own `LICENSE.md` contains, after the
MIT text, a **contributor licence agreement** granting Bitfocus a "non-exclusive, perpetual,
irrevocable, worldwide, fully-paid, royalty-free, **transferable**" copyright and patent licence
with the right to sublicense "through multiple tiers", plus an assignment clause (FACT, Tier A).
That CLA is exactly what makes a commercial closed sibling legally straightforward (INFERENCE).

---

## Product table

Price column: every entry is Tier B (search-result summary, page not opened) unless it says
"repo" — those are licence facts read in the repository. "as advertised" = a public number was
quoted in the summary; "sales contact" = no public number found.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Bitfocus Companion 5.1** | Bitfocus AS (NO) | Win / macOS / Linux / Raspberry Pi / Docker | Free, MIT + CLA (repo, FACT) | Yes — runs fully local; offline module bundles for air-gapped installs (FACT) | Yes — HTTP REST, OSC :12321, TCP/UDP, Ember+, RossTalk :7788, Art-Net in, Satellite API :16622/:16623 (FACT) | Turning any surface into a shot-box for hundreds of devices |
| **Bitfocus Buttons** | Bitfocus AS (NO) | Unverified | Commercial; price UNKNOWN (sales contact) | UNKNOWN | UNKNOWN | Enterprise/large installs: profiles, scaling, scrollable sections (Tier B) |
| **Elgato Stream Deck (MK.2 / XL / +/ Studio)** | Elgato / Corsair (DE-US) | USB & PoE+ hardware | MK.2 USD 119.99; XL USD 263.03; Stream Deck + XL USD 350 pre-order; **Studio USD ~900** (Tier B, seen 2026-08-29) | Hardware; needs host software | Via Companion/Buttons or Elgato SDK | The de-facto physical button surface of the industry |
| **QLab 5** | Figure 53 (US) | macOS only | Free tier + perpetual licences; **site licence USD 299/activation, min. 10**; USD 499 quoted for a full v5 licence at 2022 release; day-rentals exist (Tier B) | Yes — local app, licences per machine | Yes — OSC in/out on port 53000 (FACT via Companion module) | The cue list as a document; theatre's standard |
| **Show Cue System (SCS)** | Show Cue Systems (AU) | Windows | Tiered perpetual licences incl. Professional Plus; price UNKNOWN (pricing page not opened) | Yes | Yes — TCP control: Play/Stop/Pause/Goto/Hotkeys/master fader (FACT via module) | Windows theatre cue playback with DMX |
| **Linux Show Player (LiSP)** | F. Ceruti (community) | Linux only | Free, GPLv3 (repo, FACT) | Yes | Yes — OSC + MIDI controller plugins, network API, Art-Net/MIDI **timecode output** (FACT) | Free theatre sound cue player on Linux |
| **Chataigne** | Benjamin Kuperberg (FR) | Win / macOS / Linux | Free, GPLv3 (repo, FACT) | Yes | Yes — OSC, OSCQuery, MIDI, DMX/Art-Net/sACN, serial, TCP/UDP, HTTP, MQTT, WebSocket, PJLink, Ableton Link, PSN, GPIO (FACT) | State machine + timeline for interactive installations |
| **ossia score** | ossia.io / LaBRI (FR) | Win / macOS / Linux / web / Raspberry Pi | Free, open source (repo, FACT) | Yes | Yes — OSC, OSCQuery, MIDI, Art-Net, MQTT, CoAP, HTTP, WS, joystick, **plus a Bitfocus protocol that loads Companion modules** (FACT) | Interactive, non-linear timelines |
| **Open Stage Control** | Jean-Emmanuel Doucet (FR) | Win / macOS / Linux (Electron) | Free, GPLv3 (Tier B; GitHub repo is now a redirect stub to framagit — FACT) | Yes | Yes — OSC / MIDI, custom JS modules | Building your own touch control surface |
| **TouchOSC (Mk2)** | Hexler (UK/CZ) | iOS / Android / Win / macOS / Linux | Paid app, "less than USD 30" (Tier B, imprecise) | Yes | OSC, MIDI, serial; Lua 5.1 scripting API | Cheap custom touch surfaces on a tablet |
| **MIDIMonster** | cbdev / Fabian J. Stumpf (DE) | Linux / Win / macOS | Free, BSD-style (repo, FACT) | Yes | Protocol translator: MIDI, RTP-MIDI, Art-Net 4, sACN, OSC, MQTT, OLA, MA Web Remote, VISCA, evdev, Lua/Python (FACT) | Translating any channel of one protocol into another |
| **Ontime 4.13** | Carlos Valente / light-dev (PT/NO) | Win / macOS / Linux / Docker / cloud | Free, GPLv3 (repo, FACT) | Yes — self-hostable | Yes — REST/WebSocket/OSC; automations fire **OSC and HTTP outputs only** (FACT) | The rundown as the trigger source |
| **Isadora 4** | TroikaTronix (DE/US) | Win / macOS | Buy-to-own (incl. 2 years of updates) + yearly subscription + USB-key licences; 50% education discount; numbers UNKNOWN (Tier B) | Yes | OSC/MIDI/DMX/serial; scene-based show control | Media performance with a scene-based show-control model |
| **Vezér** | Imimot (HU) | macOS | **USD 99** (Tier B, seen 2026-08-29) | Yes | MIDI / OSC / DMX / Art-Net out; MTC master or slave, MMC, MIDI clock | A timeline for control data |
| **Medialon Manager V7.1 / Showmaster** | 7thSense (UK; ex-Barco) | Windows software + Showmaster Pro/LE hardware | Sales contact, price UNKNOWN | Yes (fixed install) | Extensive device drivers; V7.1 runs natively on Showmaster hardware (Tier B) | Themed entertainment / large AV installations |
| **V16Pro + WinScript Live** | Alcorn McBride (US) | Windows/macOS editor, dedicated hardware | Sales contact, price UNKNOWN | Yes — hardware controller | Serial / Ethernet / GPIO, OPC UA documented; scripts of up to 256 sequences x 32,767 events (Tier B) | Frame-accurate, decade-long theme-park reliability |
| **Q-SYS (Core + Designer)** | QSC (US) | Q-SYS Core hardware + Windows designer | Hardware + feature licences, sales contact | Yes | Yes — **QRC** JSON control API, Lua scripting, ECP, serial; UCI touch panels (FACT via module + Tier B) | Audio DSP that grew into the AV control system |
| **ETC Mosaic / Paradigm** | ETC (US) | Dedicated controllers (DIN / rack) | Sales contact | Yes | Web interface + serial; DMX/sACN; astronomical time clock triggers (FACT via module + Tier B) | Architectural lighting control with real time-of-day logic |
| **CueServer 3 (Core / Pro)** | Interactive Technologies (US) | DIN rail / 1RU appliance | **Core USD 1,889.16, list USD 2,249.00** at a dealer (Tier B, seen 2026-08-29) | Yes | CueScript text scripting, cues, macros, playbacks, audio (FACT via module) | Small, cheap, scriptable fixed-install controller |
| **CueCore3 / TimeCore / IoCore2 / Kiosc** | Visual Productions (NL) | Solid-state DIN/desktop appliances | Dealer priced, numbers not surfaced (Tier B) | Yes — solid-state, no moving parts, standalone | DMX x4, Art-Net/sACN, GPIO in/out, timecode, OSC; Kiosc as touch UI | Cheap, reliable European fixed-install show control |
| **Wings X / Avio Master** | AV Stumpfl (AT) | Windows + Avio hardware | Tiered licences (Eco/Starter/Advanced); numbers not surfaced (Tier B) | Yes | Timeline + scripting + audio in one device (Avio Master) | German-speaking AV/multivision market |
| **Crestron / AMX** | Crestron (US) / AMX-Harman (US) | Proprietary processors | Dealer/integrator channel; certification programmes (Tier B) | Yes | SIMPL / SIMPL+ (Crestron), NetLinx (AMX) | Corporate AV integration where the client never touches code |
| **Spikemark 6 + Console** | Creative Conners (US) | Windows | **Software free download**; Console control desk **USD 18,130** (Tier B) | Yes | Motion control for stage automation | Scenery automation for theatre |
| **eChameleon** | Stage Technologies / TAIT (UK) | Proprietary consoles | Sales contact | Yes | Automation of flying/scenery, safety-rated | Large-venue, safety-critical stage automation |
| **FrenschPress** | Frensch (DE) | Standalone hardware | Price not surfaced (Tier B) | Yes | MIDI + network controller; can run as a **Companion satellite** (Tier B) | A German-made encoder/button box for theatre |

Counting the distinct products above: **24**.

---

## Deep dives

### 1. Bitfocus Companion 5.1 — the surface layer, and the segment's centre of gravity

**What it does.** Companion maps physical buttons, encoders and virtual surfaces to actions on
several hundred devices and applications. One button can fire an ordered list of actions across
any number of connections; feedbacks push device state back onto the button's appearance.

**Data model** (FACT, Tier A, from the shipped user guide):

- **Connections** — instances of a *connection module*; since 4.0 modules are downloadable
  plugins with independent versions, not built into the app.
- **Surfaces** — since 4.3 also a module system (`companion-surface-*`); each physical device is
  mapped into the button grid with offset, rotation, brightness, startup page, page permissions,
  and can be individually enabled/disabled so Companion and Elgato's own app can share a desk.
- **Buttons** — a page/row/column grid. Since 5.0 a button is a **stack of drawing elements**
  (text, image, gauge, shape, and a *reference* element that reuses another button's drawing),
  not a single fixed style.
- **Variables / expressions** — custom variables and expression variables; 5.0 added real control
  flow (`if`/`else`, loops, functions) to expressions with an operation-count limit so a runaway
  loop aborts in milliseconds instead of hanging the app.
- **Triggers** — a three-part object: **Events** (time interval, random interval, on variable
  change, …), **Condition** (a subset of the feedback system used as a filter), **Actions** (any
  action a button can run). This is Companion's entire automation model.
- **Image library** (5.0) — images as first-class shared assets rather than per-button copies.

**Integrations, inbound** (FACT, Tier A, one doc page per protocol): TCP and UDP text commands
(`LOCATION 1/2/3 PRESS`, `SURFACE <id> PAGE-SET n`, `CUSTOM-VARIABLE x SET-VALUE y`), an HTTP
REST API (`POST /api/location/<page>/<row>/<column>/press`, style setters with query or JSON
body), OSC on port 12321 (`/location/<p>/<r>/<c>/press`, `/rotate-left`, `/style/bgcolor`,
`/custom-variable/<name>/value`), **RossTalk** on fixed port 7788 (`CC <page>/<row>/<column>`),
**Ember+** exposing a tree of pages/buttons/variables with read-write parameters, and **Art-Net**
where each button is mapped to a DMX channel from a configurable start address, with an example
GrandMA2 fixture file shipped in the app.

**Notable strengths.**

- *The module ecosystem is the moat.* Modules are community-written, versioned independently,
  installable from a store, importable as a single `.tgz`, or bulk-importable as a versioned
  **offline module bundle** for installations with no internet (FACT). Very few products in any
  segment of this corpus have thought that carefully about air-gapped installs.
- *Surfaces are remotable.* **Companion Satellite** (MIT, v3.4.0, separate repo) runs on a Pi or
  laptop elsewhere on the network and forwards its USB surfaces to a central Companion over TCP
  16622 / WS 16623, with mDNS discovery and a Pi image (FACT). Surfaces stop being tied to the
  machine running the show.
- *Security got taken seriously in 5.0* — shell-command actions and remote module installation
  are **off by default**, plus cross-site and oversized-payload hardening (FACT). Compare this to
  the rest of this corpus, where "it is on a closed network" is the security model.

**Notable limits.**

- **No native MIDI, no MIDI Show Control, no timecode.** The strings `midi`, `timecode`, `smpte`
  and `ltc` appear **zero times** in the entire shipped user guide (FACT, verified by grep). MSC
  is reachable only through a third-party helper: the `techministry-midirelay` module sends
  MIDI/MSC/SysEx over HTTP/socket.io port 4000 to a separate `midi-relay` program running on
  another machine (FACT, module HELP). For a product this central to live production, an
  entire standard control protocol lives behind someone else's daemon.
- **No timeline, no cue list.** Triggers are event/condition/action; there is no ordered cue
  stack with a playhead, and no "wait 4.2 s then continue". A show that needs a timeline needs a
  second product.
- **Single-instance reliability model.** The docs describe no clustering, no hot spare, no state
  replication. Redundancy is achieved socially (a second laptop with the same
  `.companionconfig`) rather than architecturally (INFERENCE from the absence of any HA topic in
  the user guide — if hot-standby exists it is undocumented in-repo).
- **Governance risk is now real, not theoretical.** MIT core + a transferable, sublicensable CLA
  + a minority investor + a closed sibling product ("Buttons", required by Elgato's flagship
  professional surface) is the classic open-core setup. Nothing observed suggests bad faith, and
  MIT code already shipped cannot be un-shipped; but a plan that treats Companion as permanent
  free infrastructure should carry that risk explicitly (INFERENCE).

### 2. QLab 5 (Figure 53) — the cue list as a document

**What it does.** QLab is the theatre standard for playing back sound, video and lighting from an
ordered cue list. The operator presses GO; the cue list advances.

**Data model** (INFERENCE from the control surface, since the docs site was blocked): a workspace
contains one or more **cue lists**; each cue has pre-wait, action duration, post-wait, a continue
mode (do-not-continue / auto-continue / auto-follow), arm state, colour and a target. Every one of
those properties is externally addressable — the Companion module can increase/decrease prewait,
postwait, duration, start time and end time on the selected cue, set/unset arm and autoload, set
continue mode and cue colour (FACT, module HELP). A cue list that exposes its own timing fields
over the wire is a genuinely unusual design and the reason QLab is so easy to integrate with.

**Integrations.** OSC in and out on port 53000, with "Use OSC controls" enabled in preferences
(FACT). Workspace-level verbs: `go`, `pause`, `resume`, `stop`, `panic` (gradual fade into a hard
stop; double panic = immediate), `reset`, `next`, `previous`, `start <cue>`, `preview` (FACT).
QLab also emits network cues, which is how it drives everything else in a theatre.

**Strengths.** The mental model — a document of cues, saved as a file, opened on any machine —
is the most successfully copied idea in the whole segment. The free tier lowers the entry cost to
zero for students and small venues. Licence types cover the industry's real shapes: perpetual,
**day rental** with a chosen date range that runs on up to two machines, and volume/site licences
(Tier B).

**Limits.** **macOS only** — the single largest structural fact about QLab, and the reason SCS,
LiSP and Multiplay exist at all. Pricing is per-feature (audio / video / lighting activations),
so a full-feature machine is expensive: USD 299 per activation on site licences with a minimum of
10, and a full v5 licence quoted at USD 499 at 2022 release, with a stated range up to USD 1,199
(Tier B, seen 2026-08-29 — the live shop page could not be opened and this range should be
re-checked before quoting it).

### 3. Chataigne — the state machine that ate the middle tier

**What it does.** Chataigne is a free GPLv3 "modular machine for art and technology": modules
speak protocols, a **state machine** holds behaviour, a **time machine** holds sequences, and a
router wires values between modules independently of protocol (FACT, repo README).

**Data model** (FACT, from `Source/Module/modules/`): modules exist for `osc`, `oscquery`, `midi`,
`dmx`, `serial`, `tcp`, `udp`, `http`, `mqtt`, `websocket`, `abletonlink`, `posistagenet`, `gpio`,
`audio`, `ble`, `controller`, `generators`, `sequence`, `state`, `system`, `customvariables`,
`multiplex`. Sessions are saved as **`.noisette`** files (FACT, string in `ChataigneEngine.cpp`).

**Integrations.** Pre-built modules for Resolume, MadMapper, Millumin, TouchDesigner, Unity,
QLab, HeavyM, D::Light, Reaper, Ableton Live, PowerPoint and Watchout, plus community modules for
OBS, ETC Eos OSC, X-Touch, d&b DS100, ATEM-OSC, M32 and more (FACT, README). Hardware inputs
include Stream Deck, Loupedeck, joystick/gamepad, Wiimote, Joy-Con, mouse, keyboard, Kinect V2
and Raspberry Pi GPIO.

**Strengths.** It occupies the gap Companion refuses to fill: real state, real sequences, real
conditional logic, with a protocol list that is longer than most commercial tier-4 products.
The *Parrot* (record and replay any parameter animation to simulate input) and *Detective*
(watch a parameter's evolution over time) features are debugging tools no commercial competitor
in this corpus ships (FACT, README).

**Limits.** One developer, GPLv3, no support contract, no certification — which excludes it from
exactly the tier-4 procurement where its feature set would otherwise win (INFERENCE). No LTC, no
MSC, no SMPTE in the protocol list.

### 4. ossia score — and the fact that it runs Companion's drivers

**What it does.** An interactive sequencer: OSC, MIDI, DMX, audio and video on a timeline whose
structure can branch and wait on conditions, with JavaScript, ISF shaders, Faust, PureData and
C++ scripting; runs down to a Raspberry Pi Zero 2 and to WebAssembly (FACT, README). Documents are
`.score` / `.scorejson` (FACT, `DocumentManager.cpp`).

**The strategically interesting part.** `src/plugins/score-plugin-protocols/Protocols/Bitfocus/`
is a protocol implementation that **loads and executes Bitfocus Companion connection modules**:
it reads `<module>/companion/manifest.json`, resolves a bundled runtime at
`<packages>/companion-modules/node-runtime`, and enumerates modules from
`<packages>/companion-modules/companion-bundled-modules` (FACT — file paths quoted verbatim from
`BitfocusContext.cpp`, `BitfocusContext.unix.cpp`, `BitfocusContext.win32.cpp`,
`BitfocusEnumerator.cpp`, `BitfocusProtocolFactory.cpp`).

**Why it matters for us.** One open-source show-control product adopted a competitor's driver
ecosystem as its own device layer rather than writing hundreds of drivers. That is the single
most reusable strategic idea in this dossier: **Companion's module format is becoming the
segment's de-facto device-driver interface**, and it is consumable by software that is not
Companion (INFERENCE, from a FACT).

### 5. The fixed-installation tier, seen through its control protocols

The tier-4 vendors' own documentation was unreachable, but their control surfaces are documented
inside open-source driver code, which is honest primary evidence about *what they expose* (and
says nothing about ergonomics, support or price).

- **Interactive Technologies CueServer** — driven by **CueScript**, a terse text command language
  documented by the vendor at `docs.interactive-online.com`; the module exposes custom CueScript
  strings, cues, macros, playbacks, audio file playback and reboot (FACT, module HELP). A dealer
  listed **CueServer 3 Core at USD 1,889.16 against a USD 2,249.00 list price** (Tier B, seen
  2026-08-29). The CS-3120 "Core D" variant carries two isolated RJ45 DMX ports configurable as
  input or output (Tier B).
- **ETC Paradigm** — the Companion module drives it **through the controller's web interface**
  because "support using the UDP Serial connection could not be implemented in testing", and it
  supports "up to version 3. Versions 4+ are in development" (FACT, module HELP, quoted). Exposed
  concepts: channel levels, macros, presets (activate/deactivate/record), **walls**
  (open/close/toggle — the movable partitions of a ballroom), sequences (start/stop/pause/resume)
  and overrides. **ETC Mosaic** controllers add astronomical (sunrise/sunset) and lunar time
  triggers and up to 2,048 channels (Tier B).
- **QSC Q-SYS** — controlled over **QRC**, a JSON control protocol; the module implements
  `Component.Set`, `Control.Get/Set/Toggle`, `Snapshot.Load/Save`, `LoopPlayer.*`, a full
  `Mixer.*` set with a range/wildcard/negation channel-selection syntax, `PA.PageSubmit` and
  `StatusGet` (FACT, module HELP). Q-SYS's own control layer is **Lua** plus a Blockly-derived
  block editor, with UCIs viewable on native touch panels, iOS, a browser or a free desktop
  viewer (Tier B).
- **Medialon** — now a **7thSense** product line (formerly Barco); **Manager V7.1 runs natively on
  Showmaster hardware**, and the marketing frames it as controlling audio, video, lighting,
  animatronics and special effects while interfacing to PLCs and ride controllers and syncing to
  multiple time sources (Tier B). No price is public.
- **Alcorn McBride** — **WinScript Live** on Windows/macOS programs V-series controllers; a script
  holds up to 256 sequences, each up to 32,767 chronologically executed events; variables are
  Integer, Decimal or **Timecode**; devices are driven by configured serial/Ethernet protocols
  and GPIO, and there is documented **OPC UA** support (Tier B). Timecode as a first-class
  variable type is the tell that this tier lives on SMPTE, not on OSC.

### 6. Ontime — the rundown as the trigger source

**What it does.** Ontime (GPLv3, v4.13.0 in-repo) is a rundown and event timer for live events and
broadcast: a list of timed events, countdown views for stage and control room, and a REST /
WebSocket / OSC API (FACT, repo + Tier B).

**Data model of its automation** (FACT, Tier A,
`packages/types/src/definitions/core/Automation.type.ts`): an `AutomationSettings` holds
`triggers` and `automations`. A `Trigger` binds a `TimerLifeCycle` moment to an automation. An
`Automation` has `filters` (field / operator / value, with `filterRule: 'all' | 'any'`, where the
field may be an `OntimeEvent` key **or a custom field**) and `outputs`. An `AutomationOutput` is
one of exactly three things: **`OSCOutput`** (target IP, port, address, args), **`HTTPOutput`**
(a URL), or an **`OntimeAction`** (playback start/stop/pause/roll, aux timer control, message
set).

**Why this is the interesting one for us.** It is the cleanest published example of the pattern
"the schedule is the trigger source": the rundown a producer already maintains fires the show
control, rather than the operator maintaining a second, parallel cue list. The filter model —
match on any field of the event including custom fields — is directly reusable.

**Limits.** OSC and HTTP only. No MIDI, no DMX, no serial, no MSC. Anything else needs Companion
in between (FACT).

---

## Standards & protocols

### Wire protocols that matter in this segment

| Protocol | Transport | Where it shows up (verified) | Notes |
| --- | --- | --- | --- |
| **OSC** (Open Sound Control) | UDP (sometimes TCP) | Companion in :12321, QLab :53000, Ontime, Chataigne, ossia, LiSP, OSC/TouchOSC, MIDIMonster, Vezér | The lingua franca of tiers 1–3. No discovery, no schema, no ack in the base spec. |
| **OSCQuery** | HTTP + WebSocket | Chataigne, ossia score | The fix for OSC's missing introspection; supported almost only by open-source products. |
| **MIDI** (channel voice, SysEx) | DIN / USB / RTP-MIDI | Chataigne, LiSP, MIDIMonster, TouchOSC, Vezér, midi-relay | Companion has none natively. |
| **MSC** (MIDI Show Control, MMA 1991) | MIDI SysEx `F0 7F <dev> 02 …` | grandMA2/dot2, ETC consoles, Pathway, Pandoras Box (Tier B); Companion only via `midi-relay` | Commands include `01 GO`, `02 STOP`, `03 RESUME`, with optional cue number/list/path. The one true cross-vendor cue standard, and the segment's most consistently under-implemented protocol. |
| **MTC / MIDI clock / MMC** | MIDI | Vezér (MTC master or slave, MMC, clock), LiSP (MIDI timecode out) | |
| **SMPTE LTC** | Audio | Visual Productions TimeCore (Tier B); Alcorn McBride timecode variables (Tier B) | Almost absent from tier 1–3 software; the boundary between "show control" and "installation control". |
| **Art-Net** | UDP 6454 | Companion (inbound, button-per-channel), Chataigne, MIDIMonster (Art-Net 4), ossia, LiSP (Art-Net **timecode**), Vezér | |
| **sACN / E1.31** | UDP multicast | Chataigne, MIDIMonster, ETC Paradigm/Mosaic | |
| **DMX512 / RDM** | XLR / RJ45 | CueServer 3 (RJ45 ports switchable in/out), CueCore3 (4 universes), SCS (2 universes at Professional Plus and higher, Tier B) | |
| **Ember+** | TCP | Companion (inbound tree of pages/buttons/variables) | Broadcast-infrastructure protocol; rare outside it. |
| **RossTalk** | TCP 7788 | Companion (`CC <page>/<row>/<column>`) | Ross Video's text protocol; the reason a Carbonite can press a Companion button. |
| **HTTP / REST** | TCP | Companion, Ontime, ETC Paradigm (via web UI), sony-camera-bridge (ours) | The universal fallback. |
| **QRC** | TCP, JSON | Q-SYS | JSON-formatted control API. |
| **CueScript** | TCP text | CueServer | Vendor-specific text scripting sent as strings. |
| **MQTT** | TCP | Chataigne, MIDIMonster (v5 and 3.1.1), ossia | The IoT bridge into show control. |
| **PJLink** | TCP | Chataigne | Projector control. |
| **PSN (PosiStageNet)** | UDP multicast | Chataigne, ossia | Stage-tracking positions. |
| **Ableton Link** | UDP | Chataigne | Tempo sync. |
| **GPIO / contact closure** | Wire | Chataigne (Pi), Visual Productions IoCore2 (8 GPI, contact or 0–10 V), Alcorn McBride, tally-pi (ours) | The most reliable trigger in the building. |
| **OPC UA** | TCP | Alcorn McBride (Tier B) | The industrial-automation bridge; almost unique in this segment. |
| **Satellite API** | TCP 16622 / WS 16623 | Companion Satellite, and since 5.0 the Elgato Stream Deck plugin itself | Bitfocus's surface-transport protocol, now the sanctioned way even for Elgato's own plugin (FACT). |

### File and interchange formats

| Format | Product | Verified how |
| --- | --- | --- |
| `.companionconfig` | Companion full config or single-page export/import | FACT — `docs/user-guide/3_config/import-export.md` |
| Offline module bundle (versioned to the Companion release) | Companion, for air-gapped installs | FACT — `3_config/modules.md` |
| Module package `.tgz` + `companion/manifest.json` | Companion connection & surface modules; also consumed by ossia score | FACT — repo + our own `Broadcast-intercom/companion-module/companion/manifest.json` |
| `.noisette` | Chataigne session | FACT — `ChataigneEngine.cpp` |
| `.score` / `.scorejson` | ossia score document | FACT — `DocumentManager.cpp` |
| `.lsp` | Linux Show Player session | FACT — `lisp/ui/mainwindow.py` |
| QLab workspace bundle | QLab | UNVERIFIED — docs site blocked |

**There is no interchange format for cues in this segment.** No product examined exports a cue
list that another product imports. MSC is a *runtime* protocol, not a document format; a QLab
workspace does not open in SCS; a `.companionconfig` means nothing to Chataigne. (FACT, by
absence, across every product examined — and the most exploitable gap in the segment.)

---

## What this segment does WELL (patterns worth stealing)

1. **A downloadable, independently versioned driver ecosystem.** Companion's split — small core,
   hundreds of community modules, each versioned, installable and rollback-able without touching
   the app, plus an offline bundle for air-gapped sites — is the best answer anyone in this
   corpus has to "the market has 400 device types and we have one team".
2. **The offline bundle as a first-class artifact.** Not "it works offline"; a *versioned
   download matched to the app release* so an installation with no internet gets a coherent set.
   Directly applicable to cable-planner's module/library story.
3. **Every internal object addressable from outside.** QLab exposing per-cue prewait, postwait,
   duration, arm and continue mode over OSC; Companion exposing button style, custom variables and
   surface page over four protocols; Ember+ presenting the whole thing as a browsable tree. The
   rule they follow: *if the UI can change it, the wire can change it.*
4. **Three-part triggers: event, condition, action.** Companion and Ontime independently
   converged on the same shape, and Ontime's version adds filters over arbitrary (including
   custom) fields. It is a small, teachable model that covers most real automation.
5. **Remote surfaces as a protocol, not a product.** Companion Satellite decouples "where the
   buttons are" from "where the logic runs" with mDNS discovery and a Pi image — and Elgato's own
   plugin now speaks that protocol instead of a private one.
6. **Rundown-as-trigger-source.** Ontime fires the show from the schedule the producer already
   maintains, instead of asking someone to maintain a parallel cue list.
7. **Debugging tools for live systems.** Chataigne's *Detective* (parameter history) and *Parrot*
   (record/replay any parameter animation to simulate input) are the kind of tooling that turns a
   3 a.m. site problem into a five-minute fix.
8. **Honest capability gating.** Companion 4.3's "expressions in any field, but modules must opt
   in via the new API" and the Paradigm module's blunt "supports up to version 3, versions 4+ in
   development" are healthier than silently failing. (Our own `CameraCapabilities` in
   sony-camera-bridge is the same pattern.)

---

## What NOBODY in this segment solves well (the white space)

1. **There is no cue interchange format.** Not one product examined can export a cue list another
   product can import. Every migration, every "we changed venues and they use SCS", every
   archival of a show is a manual re-entry. MSC standardised the *runtime message* in 1991 and
   nobody standardised the *document*.
2. **The plan and the show are unrelated documents.** Nothing in this segment knows what is
   *installed* in the venue. Companion has a connection to a device at an IP address; it does not
   know that device is the camera in the cable plan, in the rack drawing, on the rental contract,
   with that serial number. Every one of those facts is typed again into Companion by hand. (FACT
   by absence — no product examined ingests an equipment list or a patch.)
3. **Surface layouts are built by hand, per show, from nothing.** A production has a documented
   device inventory; the operator still places every button manually. Nothing generates a starting
   layout from the equipment list.
4. **MSC and timecode are second-class in the software tier.** The most widely deployed surface
   product in the industry (Companion) cannot send a MIDI Show Control GO without a third-party
   daemon on another machine; LTC is essentially absent below tier 4. The cheap tier and the
   theatre tier therefore cannot meet on the one cue protocol that is actually standardised.
5. **Redundancy is a hardware-tier privilege.** Tier 4 sells watchdogs and warranties; tiers 1–3
   offer "have a second laptop". No open-source or mid-market product examined documents a hot
   spare, state replication or automatic failover of a show-control host (FACT by absence across
   the user guides read).
6. **No dry run, no offline simulation.** Nothing examined lets you validate a whole show against
   a model of the devices before the devices exist. Chataigne's Parrot replays recorded parameter
   data — the closest thing found, and it is a debugging aid, not a rehearsal mode.
7. **No shared surface library across shows or crews.** Layouts live in one operator's
   `.companionconfig`. There is no organisational library of "our house layout for a two-camera
   council chamber", versioned and re-issued.
8. **The learning curve is bimodal and nothing sits in the middle.** Tier 1 is learnable in an
   afternoon and cannot do timelines. Tier 4 needs a certified programmer (Crestron CAIP, AMX
   NetLinx, Q-SYS training courses — Tier B) and can do anything. Chataigne and ossia are the only
   attempts at the middle, and both are one-developer projects with no support contract.
9. **Nobody documents what the show did.** After a run, there is no exportable record of which
   cues fired when — nothing to hand a client, an insurer or the next crew (FACT by absence;
   Companion has a log page, but a log is not a show report).

---

## Relevance to AV Planner Suite

**Directly relevant modules:** `tally-pi`, `sony-camera-bridge`, `broadcast-intercom`,
`pi-media-station`, `cable-planner`, `shell/suite`. Less directly: `multicam-planner`,
`light-planner`.

### What already exists in our repos (verified locally, FACT)

- **`tally-pi` already drives Companion.** `gpio_watcher.py` posts to
  `http://localhost:8000/api/location/{page}/{row}/{column}/press` — which is exactly the HTTP
  endpoint documented in Companion's own user guide, and it supports a `companion` action type
  with tap/down-up modes.
- **`Broadcast-intercom` ships a Companion module** (`companion-module/companion/manifest.json`,
  id `broadcast-intercom`, `runtime.type: node18`, `api: nodejs-ipc`) with PTT, mute, volume,
  direct call and emergency actions plus talk/battery/emergency feedbacks.
- **`sony-camera-bridge` ships both a Companion module and a `CompanionServer`** exposing
  `POST /api/action`, `GET /api/state`, `GET|POST /api/tally` plus a WebSocket on port 9701 for
  live state and tally — explicitly documented in-file as "compatible with Companion's generic
  HTTP module".
- **`pi-media-station`** is a sensor-triggered playback endpoint (HC-SR04 zones NEAR/FAR mapped to
  video/image/audio sets) — i.e. it is already a tier-3/4 show-control *device*, not a planner.

So the suite is already inside this segment on the operating side, in three places, with no shared
model between them — which mirrors the INVENTORY finding that Companion is our de-facto
integration bus.

### The five moves this dossier argues for

1. **Own the missing link: equipment plan to control surface.** Nobody in this segment ingests an
   equipment list. cable-planner has one — with device types, IPs, ports, signal flow and rack
   positions. A `.companionconfig` **generator** (page per location or per rack, one button per
   controllable device, correct connection stubs, labels from the plan) is a small feature with a
   unique claim: *the only planner that hands you a working control surface*. The format is
   documented and verified; the only unknown is its internal schema, which is readable from the
   Companion repository.
2. **Publish suite modules the way the segment expects.** Our three existing Companion
   integrations should be real store modules with `companion/manifest.json`, independent versions
   and HELP pages — because ossia score proves the manifest format is now consumed by software
   that is not Companion. Being in the module ecosystem is the cheapest possible presence in shows
   that will never buy a planning suite.
3. **Adopt the event / condition / action trigger shape verbatim.** Companion and Ontime
   converged on it independently; our own tally, intercom and media-station trigger logic is
   currently three bespoke shapes. One shared `Trigger { event, condition, actions }` type in a
   suite package would let a tally change, an intercom call and a media zone all be expressed the
   same way — and would make the suite scriptable without inventing a language.
4. **Be the rundown that fires the show, or integrate with the one that is.** Ontime is GPLv3,
   self-hostable, and its automation model is three output types (OSC, HTTP, internal action). The
   suite already holds the production's schedule-adjacent data. Either speak Ontime's API or copy
   its model — do not build a fourth parallel cue list.
5. **Take the white space the segment cannot reach: the show report and the offline dry run.**
   Because we hold the plan *and* touch the operating layer, we can produce what nobody else can:
   a record of what was patched, what was triggered and when, tied back to the planned equipment
   — and a rehearsal mode that validates a control layout against the planned inventory before
   any device exists.

### Constraints this segment imposes on us

- **Offline-first is table stakes here, and Companion sets the bar higher than we do**: a
  versioned offline module bundle, not just "the app works without internet". If the suite ships
  device libraries, they need the same treatment (INFERENCE).
- **Do not build a show controller.** The segment is crowded, free at the bottom and
  certification-gated at the top. The suite's defensible position is the data that show control
  currently gets typed into by hand.
- **Assume MSC and LTC will be asked for and be honest that they are hard.** If the suite ever
  emits cues, MSC over `midi-relay`-style helpers and LTC via dedicated hardware (Visual
  Productions TimeCore class) are the realistic routes, not native implementations.

---

## Not verified / open questions (re-run list when egress allows)

- **Every price in this dossier** (all Tier B). Re-check: `qlab.app/shop`,
  `qlab.app/site-license-pricing/`, `showcuesystems.com/cms/pricing`,
  `support.troikatronix.com/support/solutions/articles/13000106528-pricing-for-isadora-4-and-izzycast`,
  `wingsx.at/en/licenses-and-prices/`, `imimot.com/vezer`, `elgato.com/us/en/p/stream-deck-studio`,
  the Full Compass CueServer 3 pages, `store.creativeconners.com`.
- **Bitfocus Buttons**: price, licence model, platform, feature delta versus Companion, and
  whether Companion's roadmap is affected. `bitfocus.io/buttons` was blocked. This is the most
  decision-relevant unknown in the segment.
- **Companion module count.** A search summary claimed "700+ modules"; not verified. The
  authoritative list is the Bitfocus support list and `developer.bitfocus.io/modules/...`, both
  blocked. Verified instead: 15 specific module repositories exist under `bitfocus/` (checked by
  HTTP 200 on `package.json`), and surface modules exist as `companion-surface-xkeys`,
  `companion-surface-loupedeck`, `companion-surface-vec-footpedal`.
- **Companion redundancy/HA.** Nothing in the user guide; whether any hot-spare pattern is
  supported in practice is UNKNOWN.
- **Medialon Manager V7.1** scripting language, driver count, licensing; **Alcorn McBride** pricing
  and the current V-series line-up; **7thSense Delta** show-control feature set (its Companion
  module does not exist under the name probed).
- **Visual Productions** prices and the exact CueCore3/TimeCore protocol matrix (LTC in/out,
  Art-Net timecode) — vendor site blocked, dealer pages not opened.
- **Open Stage Control** current feature set and release cadence — the project left GitHub for
  framagit.org, which is blocked; only the redirect stub README was readable.
- **Show Cue System, Multiplay, Isadora, Q-SYS, Crestron/AMX, Stage Technologies** — no vendor
  documentation could be opened; their entries rest on module HELP files and search summaries.
- **QLab workspace file format** and whether any documented export exists.

---

## Sources

### Opened directly (Tier A — cloned or fetched and read)

Repositories cloned and read (2026-08-29):

- https://github.com/bitfocus/companion — root `package.json` (`5.1.0`), `LICENSE.md` (MIT + CLA),
  `CHANGELOG.md`, and the shipped user guide: `docs/user-guide/3_config/{triggers,surfaces,modules,import-export,settings}.md`,
  `docs/user-guide/5_remote-control/{tcp-udp,http-remote-control,osc-control,artnet-dmx-control,emberplus-control,rosstalk-control,satellite}.md`,
  `docs/user-guide/7_surfaces/{index,satellite}.md`,
  `docs/user-guide/9_whatsnew/{v5-0-0,v4-3-0}.md`
- https://github.com/bitfocus/companion-satellite — `README.md`, `package.json` (`3.4.0`), `LICENSE`
- https://github.com/bitfocus/companion-module-figure53-qlab — `HELP.md`
- https://github.com/benkuper/Chataigne — `README.md`, `LICENSE` (GPLv3), `Source/Module/modules/`, `Source/ChataigneEngine.cpp`
- https://github.com/ossia/score — `README.md`, `LICENSE.txt`, `src/plugins/score-plugin-protocols/Protocols/` (incl. `Bitfocus/`), `src/lib/core/presenter/DocumentManager.cpp`
- https://github.com/FrancescoCeruti/linux-show-player — `README.md`, `LICENSE` (GPLv3), `lisp/plugins/` (incl. `timecode/protocols/{artnet,midi}.py`, `controller/protocols/`), `lisp/ui/mainwindow.py`
- https://github.com/cbdevnet/midimonster — `README.md`, `LICENSE.txt`, `backends/`
- https://github.com/cpvalente/ontime — `LICENSE.md` (GPLv3), `package.json` (`4.13.0`), `packages/types/src/definitions/core/Automation.type.ts`
- https://github.com/jean-emmanuel/open-stage-control — `README.md` (redirect stub to framagit)

Companion module documentation fetched over `raw.githubusercontent.com` (2026-08-29):

- https://raw.githubusercontent.com/bitfocus/companion-module-interactivetechnologies-cueserver/master/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-showcuesystems-scs/master/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-etc-paradigm/master/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-qsys-remote-control/master/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-techministry-midirelay/master/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-generic-artnet/master/companion/HELP.md
- Existence verified by HTTP 200 on `package.json` (master): `companion-module-{figure53-qlab, generic-osc, generic-tcp-udp, generic-http, qsys-remote-control, etc-eos, etc-paradigm, showcuesystems-scs, interactivetechnologies-cueserver, techministry-midirelay, generic-artnet, generic-emberplus, figure53-go-button, avstumpfl-pixera, christie-pandorasbox}`; surfaces (main): `companion-surface-{xkeys, loupedeck, vec-footpedal}`

Local repositories in this workspace (read as evidence for the relevance section):

- `/home/user/tally-pi/gpio_watcher.py`
- `/home/user/Broadcast-intercom/companion-module/companion/manifest.json`
- `/home/user/sony-camera-bridge/packages/bridge/src/companion/CompanionServer.ts`
- `/home/user/pi-media-station/README.md`
- `/home/user/av-planner-suite/docs/research/repos/INVENTORY.md`

### Search-result summaries only (Tier B — URL returned by search, page NOT opened; proxy blocked the host)

Bitfocus / Elgato / Corsair:

- https://bitfocus.io/companion
- https://bitfocus.io/buttons
- https://companion.free/
- https://ir.corsair.com/news-releases/news-release-details/corsair-deepens-strategic-relationship-bitfocus-extending/
- https://www.businesswire.com/news/home/20240912420465/en/Elgato-Launches-Stream-Deck-Studio-Collaboration-with-Bitfocus-Brings-Highly-Popular-Stream-Deck-to-Professional-Broadcasters
- https://www.elgato.com/us/en/p/stream-deck-studio
- https://help.elgato.com/hc/en-us/articles/30132501031821-Elgato-Stream-Deck-Studio-Frequently-Asked-Questions
- https://www.engadget.com/computing/accessories/elgatos-latest-stream-deck-is-a-900-rackmount-unit-for-pros-215003305.html
- https://www.engadget.com/computing/elgatos-stream-deck--xl-adds-a-touch-strip-and-dials-to-an-already-massive-array-of-buttons-195200129.html
- https://www.technobezz.com/best/elgato-stream-deck-mk2-studio-controller-drops-to-11999
- https://www.amazon.com/Elgato-Stream-Deck-XL-customizable/dp/B07RL8H55Z
- https://www.radioworld.com/tech-and-gear/products/elgatos-stream-deck-studio-adds-rackmount-panel
- https://marketplace.elgato.com/product/companion-button-a7db5477-c76c-49b1-bce1-b6039f2d41d2

QLab / cue players:

- https://qlab.app/docs/v5/general/licenses/
- https://qlab.app/site-license-pricing/
- https://qlab.app/shop/
- https://qlab.app/docs/v5/general/features/
- https://qlab.app/faq/
- https://en.wikipedia.org/wiki/QLab
- https://www.showcuesystems.com/cms/features
- https://www.showcuesystems.com/cms/pricing
- http://www.lambertstudios.net/scs/compare.html

Middle tier / open source:

- https://benjamin.kuperberg.fr/chataigne/modules_browser/
- https://hackaday.com/2023/01/06/chataigne-an-open-source-swiss-army-knife/
- https://openstagecontrol.ammd.net/
- https://framagit.org/jean-emmanuel/open-stage-control
- https://hexler.net/touchosc
- https://hexler.net/touchosc/manual/script
- https://en.wikipedia.org/wiki/TouchOSC
- https://imimot.com/vezer
- https://imimot.com/help/vezer/tracks/
- https://troikatronix.com/isadora/
- https://support.troikatronix.com/support/solutions/articles/13000106528-pricing-for-isadora-4-and-izzycast
- https://support.troikatronix.com/support/solutions/articles/13000072198-isadora-4-license-types-overview
- https://www.getontime.no/
- https://docs.getontime.no/ontime/
- https://ontime.gitbook.io/v2/control-and-feedback/ontime-apis

Fixed installation / hardware tier:

- https://7thsense.one/product/medialon-manager
- https://7thsense.one/product/medialon-showmaster-pro
- https://7thsense.one/medialon-7thsense-show-control
- https://medialon.com/news-2/
- https://www.barco.com/en/support/software/R330834
- https://portal.7thsense.one/user-guides/medialon-pdf-library/User%20Guides/M515-6%20Medialon%20Manager%20V7_1%20User%20Guide.pdf
- https://alcorn.com/products/winscript-live/
- https://alcorn.com/products/v16pro-s/
- https://alcorn.com/products/rideplayer/
- https://docs.alcorn.com/latest/guides/winscript-live/getting-started/getting-started
- https://docs.alcorn.com/latest/guides/winscript-live/advanced-programming/opcua
- https://alcorn.com/library/manuals/man_v16pro.pdf
- https://www.qsys.com/products-solutions/q-sys/intro-to-q-sys-control/
- https://help.qsys.com/Content/Control_Scripting/Using_Lua_in_Q-Sys/01_Using_Lua_in_Q-Sys_Overview.htm
- https://q-syshelp.qsc.com/Content/Control_Scripting/Using_Lua_in_Q-Sys/01_Using_Lua_in_Q-Sys_Overview.htm
- https://www.etcconnect.com/Products/Architectural-Systems/Mosaic/Controllers/Show-Controller/Features.aspx
- https://support.etcconnect.com/ETC/Architectural/Mosaic/Mosaic_Controllers/DMX_Port_Designation_on_Mosaic_Show_Controllers_MSC
- https://www.usitt.org/news/etc-releases-new-paradigm-processors
- https://interactive-online.com/products/cueserver/processors/cs-3110
- https://www.fullcompass.com/prod/618187-interactive-technologies-cueserver-3-core-d-dmx-lighting-control-unit
- https://www.fullcompass.com/prod/616939-interactive-technologies-cueserver-3-pro-cue-recall-unit-with-8-programable-buttons-and-unlimited-cue-stacks
- https://www.visualproductions.nl/products/cuecore3
- https://www.visualproductions.nl/products/
- https://www.bhphotovideo.com/c/product/1764708-REG/visual_productions_cuecore3_4_universe_architectural_rdm_lighting.html
- https://manuals.plus/visual-productions/timecore-time-code-display-manual
- https://www.wingsx.at/en/licenses-and-prices/
- https://www.wingsx.at/en/licenses-in-comparison/
- https://help.avstumpfl.com/WingsAVSuiteRX_EN/Allgemeines/Module_in_Event_Studio.htm
- https://avstumpfl.com/fileadmin/user_upload/downloads/en/pixera_brochures/mediacontrol/Avio_Master_Manual.pdf
- https://av-command.com/blog/crestron-vs-amx-vs-extron
- https://pcs.md/

Theatre automation:

- https://creativeconners.com/products/software/
- https://store.creativeconners.com/products/spikemark-3
- https://plsn.com/newsroom/product-news/creative-conners-announces-spikemark-6-and-console/
- https://www.themanufacturer.com/articles/curtain-called-on-british-ownership-of-stage-technologies/

Standards:

- https://help.malighting.com/grandMA2/en/help/key_remote_control_msc.html
- https://help.malighting.com/dot2/en/help/key_ht_usemidiandmsc.html
- http://www.richmondsounddesign.com/docs/midi-show-control-specification.pdf
- https://en.wikipedia.org/wiki/MIDI_Show_Control
- https://pathway-support.acuitybrands.com/pathway-site-storage/cognito/Show_Control/MSC_-_Midi_Show_Control.htm
- https://pandorasboxhelpfile.com/home/msc-midi-show-control_pb.htm

German-language sources:

- https://www.production-partner.de/blog/bitfocus-companion-clevere-software-fuer-das-elgato-stream-deck/
- https://www.production-partner.de/news/companion-masterclass-showcontrol-mit-dorian-meid/
- https://www.production-partner.de/test/elgato-stream-deck-kleiner-alltagshelfer/
- https://www.production-partner.de/news/show-controller-frenschpress/
- https://frenschpress.de/produkt/frenschpress/
- https://frenschpress.de/en/
- https://forum.dmxcontrol-projects.org/index.php?thread/17885-erfahrungen-im-theater/
