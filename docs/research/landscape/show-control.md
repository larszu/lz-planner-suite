# Show Control / Automation / Surfaces

> Research date: **2026-08-28**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read on a cited page or in cited source code), **INFERENCE** (reasoning),
> **UNKNOWN / unverified**.

## Source-access caveat (read this before trusting anything below)

This pass ran in the same locked-down environment as `landscape/tally.md`, with the same two
limits:

1. **WebSearch was exhausted before this dossier started** (200/200 calls consumed by earlier
   segments). Zero searches were available.
2. **The egress proxy allowed only `github.com` and `raw.githubusercontent.com`.** Every other
   host probed returned `EGRESS_BLOCKED`: `bitfocus.io`, `bitfocus.github.io`, `qlab.app`,
   `hexler.net`, `docs.getontime.no`, `framagit.org`, `en.wikipedia.org`. `npmjs.com` returned
   HTTP 403 at the proxy.

What saved this segment: **show control is, unusually, a segment where the two most-installed
products and most of the interesting long tail are open source, and where the commercial
products' wire protocols are documented inside open-source driver code.** So this dossier was
built by cloning and reading actual source and vendor-shipped documentation:

- **27 repositories** were cloned and read, including Bitfocus Companion v5.1.0 *with its
  complete shipped user guide* (`docs/user-guide/`, a Docusaurus site checked into the repo),
  Chataigne, ossia score, Linux Show Player, Ontime, MIDIMonster, DigiShow and Cue-View.
- **13 Bitfocus Companion connection modules** for commercial show-control products were read as
  primary-adjacent evidence of those products' control protocols (QLab, Q-SYS, 7thSense Delta,
  ETC Eos, ETC Paradigm, MA Lighting MSC, Show Cue System, CueServer, Dataton Watchout 7,
  AV Stumpfl Pixera, Ventuz, disguise, Pandoras Box).
- The **complete Companion surface-module inventory** (22 repositories under `org:bitfocus`,
  named `companion-surface-*`) was enumerated via the GitHub API, giving a verified hardware
  control-surface list rather than a remembered one.

Consequences, stated plainly:

- **There is not one verified vendor price in this dossier.** No pricing page was reachable and
  no search summary of one existed. What *is* verified is **licence and distribution model**,
  read from `LICENSE` files and READMEs in the repositories themselves — which for this segment
  turns out to be the more decision-relevant half. Where a product's pricing *shape* is argued,
  it is marked **INFERENCE** and the evidence is named.
- **Closed commercial products could not be researched from their own documentation.** Medialon,
  Alcorn McBride, Crestron/AMX programming, Q-SYS Designer, 7thSense Delta, Stage Technologies,
  Creative Conners, Vezer, Isadora, Show Cue System and Multiplay have no verified entry here
  beyond what open-source driver code reveals about their wire protocols. That is tier-1 evidence
  about *the control surface* and says nothing about ergonomics, reliability, support or price.
- Products named in the research brief that could **not** be verified at all are listed under
  *Not opened / unverified* at the end, rather than described from memory.

Two sources deserve flagging up front:

- **Bitfocus Companion ships its full user guide in the repository** (`docs/user-guide/`,
  including a `5_remote-control/` directory with one page per inbound protocol). This is the
  single best primary source in the pass: it is vendor documentation, it is versioned with the
  code, and it was readable despite the vendor's website being blocked.
- **ossia score contains a `Protocols/Bitfocus/` plugin that loads and executes Bitfocus
  Companion connection modules** — it reads `companion/manifest.json` and runs the module under a
  bundled Node runtime (`.../packages/companion-modules/node-runtime`). One open-source product
  has adopted a competitor's driver ecosystem as its device-driver layer. That is the most
  strategically interesting fact in this dossier and it is cited in full below.

---

## Segment summary

**Show control is the layer that makes one operator action move many machines.** A lighting
console, a video switcher, a media server, an audio DSP, a projector and a motorised curtain each
speak their own protocol; show control is the software that sits above them and turns *"go"* into
the eleven messages that constitute *go*.

The segment splits into four tiers that share vocabulary but almost nothing else — different
buyers, different budgets, different failure tolerances (**INFERENCE**, but every product examined
here falls cleanly into one of them):

| Tier | What it is | Typical deployment | Evidence in this pass |
| --- | --- | --- | --- |
| **1. Surface / macro layer** | Turn a button on a physical panel into N protocol messages. Stateless-ish, driven by an operator. | Laptop or Pi next to the switcher, one show at a time | Bitfocus Companion, TouchOSC, Open Stage Control, Stream Deck |
| **2. Cue-list / playback layer** | An ordered list of cues a stage manager calls "GO" against. Audio/video playback plus network cues. | Theatre, houses of worship, corporate stage | QLab, Linux Show Player, Show Cue System, Multiplay |
| **3. Logic / mapping / timeline layer** | Arbitrary triggers, state machines, timelines, protocol translation, scripting. Runs unattended or semi-attended. | Installations, interactive art, complex live shows | Chataigne, ossia score, MIDIMonster, DigiShow, Medialon |
| **4. Fixed-installation controllers** | Rack hardware with a real-time OS, redundancy, watchdogs, warranty. Commissioned once, runs for a decade. | Museums, theme parks, corporate AV, architectural lighting | Alcorn McBride, Medialon Showmaster, 7thSense Delta, Q-SYS Core, ETC Paradigm, CueServer, Crestron/AMX |

**Who buys what.** (**INFERENCE**, supported by the documentation tone, deployment targets and
licence models of each product examined.)

1. **Freelance ops / small crews / houses of worship / streamers** buy tier 1. The decisive
   property is *breadth of device support at zero licence cost*, which is why Companion — MIT
   licensed, free, with a claimed 700+ device connections (**FACT**, `bitfocus/companion`
   README) — has effectively taken this tier.
2. **Theatre sound and video designers** buy tier 2, and overwhelmingly one product: QLab. The
   buying criterion is *the cue list as a document you can hand to the next operator*.
3. **Interactive-installation studios, media artists, systems integrators doing bespoke work**
   buy tier 3. Criterion: *can I express arbitrary logic without writing a program from scratch*.
4. **Integrators specifying a permanent installation** buy tier 4 and buy it on paper: redundancy,
   MTBF, a service contract and someone to blame. Nothing in tier 1–3 competes here, and the
   tier-4 vendors' software is generally sold bundled with hardware.

**Typical price band.** UNVERIFIED in this pass — no vendor pricing page was reachable. What can
be said with evidence:

- **Tier 1 and much of tier 3 is genuinely free and open source.** Companion is MIT (**FACT**,
  `LICENSE.md`, which is MIT plus a contributor licence agreement assigning rights to Bitfocus
  AS). Chataigne is GPLv3 (**FACT**, `LICENSE`). ossia score is open source (**FACT**, README:
  "Free, open source"). Linux Show Player is GPLv3 (**FACT**). MIDIMonster is a BSD-style licence
  © Fabian J. Stumpf (**FACT**, `LICENSE.txt`). Ontime is GPLv3 with an optional paid cloud
  service (**FACT**: GPLv3 badge and "run Ontime locally for free" in README; cloud pricing
  unverified).
- **QLab has a free tier** — "You can try QLab for 2 channel audio and 1 screen video without
  needing a license" (**FACT**, but from the Companion QLab module's `HELP.md`, i.e. third-party
  documentation of Figure 53's licensing, not Figure 53's own page). Licence prices unverified.
- **Tier 4 is quote-only.** (**INFERENCE**, from the fact that these products are commissioned
  systems sold with hardware and integration labour; no vendor page was reachable to confirm.)

**The economic shape of the segment, then:** the *control-surface and macro layer has been
commoditised to zero by open source*, while the *guaranteed-uptime installation layer remains
expensive and closed*. Everything interesting commercially is happening in the middle, and the
middle is contested by free tools.

---

## Product table

Platform, licence/price model, offline behaviour and API columns are **FACT** where a repository
or shipped document was read, and marked **unverified** where not. "Offline?" means: does the
product's core function work with no internet connection (LAN-only)?

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Bitfocus Companion** v5.1.0 | Bitfocus AS (NO) | Win / macOS / Linux / Raspberry Pi (own OS image) | Free, MIT + CLA (**FACT**, `LICENSE.md`); optional Bitfocus cloud, price unverified | **Yes** — LAN only by design; cloud is opt-in (**FACT**, cloud lives in `lib/Cloud` and is a separate feature) | **Yes, six of them**: HTTP REST, OSC, TCP, UDP, Ember+, Art-Net in; Satellite surface protocol out (**FACT**, `lib/Service/`) | Turning any button on any surface into any device's protocol; the broadest verified device library in the segment |
| **QLab 5** | Figure 53 (US) | macOS only | Freemium; free tier = 2ch audio + 1 screen video (**FACT**, third-party module HELP); licence prices unverified | **Yes** (**INFERENCE** — it is a local macOS app; licensing may need activation, unverified) | **Yes** — OSC over UDP/TCP on port 53000, TCP required for feedback; OSC passcode from v5.2 (**FACT**, module `HELP.md`) | The cue list as a theatre document: 27 cue types incl. Network, MIDI, Timecode, Script (**FACT**, `QLKDefines.h`) |
| **Chataigne** | Ben Kuperberg (FR) | Win / macOS / Linux | Free, GPLv3 (**FACT**, `LICENSE`) | **Yes** | Modules are JS; OSC/OSCQuery/WebSocket/HTTP/MQTT in and out (**FACT**, README + `Source/Module/modules/`) | State machine + timeline + protocol routing in one app; 108 community modules (**FACT**, `modules.json`) |
| **ossia score** | ossia.io / LaBRI / SCRIME (FR) | Win / macOS / Linux / WASM / Raspberry Pi Zero 2 | Free, open source (**FACT**, README) | **Yes** | 20+ protocol plugins incl. OSC, OSCQuery, Minuit, Art-Net, MIDI, MQTT, CoAP, HTTP, WS, Serial, CAN, joystick, Wiimote — **and a plugin that runs Bitfocus Companion modules** (**FACT**, `Protocols/`) | Interactive *timeline*: intervals with conditions, not just a linear cue stack |
| **Open Stage Control** | Jean-Emmanuel Doucet (FR) | Server + browser client (Win / macOS / Linux / Docker) | Free/libre (**FACT**, description "Libre and modular OSC / MIDI controller"; exact licence **unverified** — repo moved off GitHub) | **Yes** | OSC in/out, MIDI (incl. `/sysex`, `/mtc`), JS scripting in widgets and server modules (**FACT**, community handbook) | Building a custom touch surface that runs in any browser on any tablet, free |
| **TouchOSC (MK2)** | Hexler (UK/DE) | iOS / Android / Win / macOS / Linux / Raspberry Pi (**unverified** — vendor page blocked) | Paid app; price **unverified** | **Yes** (**INFERENCE**) | OSC + MIDI, Lua scripting, `.tosc` layout files (**FACT**, community repo contents and topics) | Designed touch layouts that a performer can carry on their own tablet |
| **MIDIMonster** | Fabian J. Stumpf / cbdev (DE) | Linux / Win / macOS | Free, BSD-style (**FACT**, `LICENSE.txt`) | **Yes** | Config-file mapping; Lua and Python scripting backends (**FACT**, `backends/`) | Pure protocol translation: MIDI ↔ Art-Net ↔ sACN ↔ OSC ↔ MQTT ↔ RTP-MIDI ↔ OPC ↔ MA Web Remote |
| **Linux Show Player (LiSP)** | Francesco Ceruti (IT) | Linux only (**FACT**, README) | Free, GPLv3 (**FACT**) | **Yes** | MIDI, OSC, keyboard controllers; Art-Net + MTC timecode out; multi-machine synchroniser plugin (**FACT**, `lisp/plugins/`) | A free QLab-shaped cue player for people who are not on macOS |
| **Ontime** v4.13 | cpvalente / getontime.no (NO/PT) | Win / macOS / Linux / Docker / npm / browser | GPLv3 self-host free; paid cloud (**FACT** for licence and self-host; cloud price **unverified**) | **Yes** (self-hosted) | OSC in, OSC/HTTP/WebSocket out, filterable automations bound to timer lifecycle events (**FACT**, `Automation.type.ts`) | The **rundown** as the trigger source: automations fire off schedule events, not off buttons |
| **DigiShow LINK** | robinz-labs (CN) | Win / macOS (**unverified** beyond README) | Free / open source (**FACT** — public GitHub repo with releases) | **Yes** | MIDI, DMX, OSC, Modbus, Arduino, Hue; JS/QML scripting; timeline cue player (**FACT**, README) | Signal *mapping* between physical devices — sensors and actuators, not just software |
| **Q-SYS** (Core + Designer) | QSC (US) | Proprietary Core hardware + Windows design tool | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE** — it is a DSP appliance) | **QRC**, JSON-RPC-style over **TCP 1710**; **primary + secondary core redundancy is first-class** (**FACT**, Companion Q-SYS module supports two hosts and a `redundant` mode) | Audio DSP + control + redundancy in one appliance |
| **7thSense Delta** | 7thSense (UK) | Proprietary media server | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE**) | TCP text protocol: timeline transport, named markers, sequences, **external SMPTE timecode tracking on/off**, show load/save, per-group commands (**FACT**, module `HELP.md`) | Frame-accurate timeline playback synchronised across a server group |
| **Dataton Watchout 7** | Dataton (SE) | Proprietary/Windows | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE**) | **HTTP API on port 3019 + Server-Sent Events** for live state; stable numeric IDs across shows (**FACT**, module `HELP.md`) | Multi-display timeline shows; the ID-stable API is unusually good design |
| **AV Stumpfl Pixera** | AV Stumpfl (AT) | Proprietary/Windows | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE**) | JSON over TCP: timeline transport, goto cue by name/index/timecode, blend-to, SMPTE mode (**FACT**, module `HELP.md`, "Rev367") | European (Austrian) media server with a clean documented JSON API |
| **ETC Paradigm** | ETC (US) | Proprietary architectural controller | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE**) | Web interface driven by the Companion module; **UDP serial control could not be made to work by the module author** (**FACT**, module `HELP.md`) | Architectural/house lighting: presets, macros, wall panels, sequences, overrides |
| **CueServer (2/3)** | Interactive Technologies (US) | Proprietary DIN/rack controller | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE**) | **CueScript** command strings over HTTP or TCP; cues, macros, playbacks, audio files (**FACT**, module `HELP.md` + code) | A tiny, scriptable, always-on DMX/show controller for installations |
| **ETC Eos family** | ETC (US) | Console + Windows/macOS `onPC` | Console = hardware price; `onPC` model **unverified** | **Yes** | OSC over **TCP 3032** (packet-length framed) or **3037** (SLIP), plus OSC UDP; enabled at *Setup > System > Show Control > OSC* (**FACT**, module `HELP.md` + `constants.js`) | Being the *other* system everyone integrates with — the de-facto lighting cue source |
| **MA Lighting grandMA2 / dot2** | MA Lighting (DE) | Console + onPC | Hardware; **unverified** | **Yes** | **MIDI Show Control over Ethernet**, UDP ports 6000–6100, device ID 0–111, group ID 1–15 (**FACT**, `companion-module-malighting-msc` HELP) | The MSC implementation most people actually meet in the wild |
| **Cue View** | stagehacks (US) | Electron (Win/macOS/Linux) | Free, open source (**FACT**, public repo) | **Yes** | Read-only monitor: QLab 4/5, Eos, Watchout, PJLink, X32/XAir, Art-Net, sACN, ATEM, Shure ULXD, DiGiCo SD, PosiStageNet, Livestream Studio (**FACT**, README) | Seeing the state of every device in a show on one screen — nobody else does this |
| **Medialon Manager / Showmaster** | Medialon (FR) | Windows + proprietary Showmaster hardware | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE**) | Scripting is **JavaScript-based** (**FACT** — third-party: a practitioner publishes `medialon_script-*` JS repos for MQTT, scheduler, Telegram bot, logging); protocol coverage **unverified** | Long-running installation control with a real scripting language — reputation unverified |
| **Alcorn McBride** | Alcorn McBride (US) | Proprietary show controllers | **UNKNOWN** | **UNKNOWN** | **UNKNOWN** — no repository, no reachable documentation, and *no Companion module exists* (**FACT**, verified by exhaustive `org:bitfocus` search) | Theme-park-grade determinism (reputation; **unverified** in this pass) |
| **Crestron** | Crestron (US) | Proprietary controllers + touch panels | Quote-only (**INFERENCE**); **unverified** | **Yes** (**INFERENCE**) | Official GitHub org publishes **CH5**, an HTML5/TypeScript component library for building touch-panel UIs, with CLI tooling and a VS Code extension (**FACT**, `org:Crestron`) | Corporate AV integration; the UI layer is now web technology |

**Not in the table but verified to exist and relevant:** Elgato Stream Deck (hardware — see the
surface inventory below), Figure 53 QView / Go Button (Companion modules exist), disguise (three
Companion modules: OSC, MTC, SMC), Ventuz Director, Christie Spyder, twoloox Pandoras Box, Smode
Live, VIOSO exaplay, ETC Audiovisuel OnlyView, Cuepid (open-source disguise trigger app built in
TouchDesigner).

---

## Deep dives

### 1. Bitfocus Companion (v5.1.0) — the surface layer, and by now the segment's centre of gravity

**What it does.** Companion maps physical buttons on control surfaces to actions on networked
devices, with feedback drawn back onto the button. A Stream Deck key can cut an ATEM, fire a QLab
cue, recall a Q-SYS snapshot and turn red while the source is live — configured entirely in a web
UI with no code.

**Verified architecture** (read from `bitfocus/companion` at v5.1.0, cloned 2026-08-28):

- **Control model.** Controls live on a **page / row / column grid**. Every control is composed of
  *entities*: actions (what happens), feedbacks (how it looks / boolean conditions) and, since
  v4.1, **local variables** and **expression variables** (`lib/Controls/`, `ControlTypes/`).
  Buttons have **steps** (multi-state / latching), a layered graphics model with text, image and
  gauge elements (v5.0 added an image library and a layered button editor per
  `docs/user-guide/9_whatsnew/v5-0-0.md`).
- **Triggers.** A trigger is *events + condition + actions* (**FACT**,
  `docs/user-guide/3_config/triggers.md`). The complete event list, read from
  `Controls/ControlTypes/Triggers/Trigger.ts` and `Resources/EventDefinitions.ts`:
  `interval` (fixed), `intervalRandom` (min/max), `timeofday` (time + weekday multiselect),
  `specificDate` (one-shot date+time), `sun_event` (sunrise/sunset with lat/long and offset),
  `startup` (with delay), `client_connect` (with delay), `button_press`, `button_release`,
  `condition_true`, `condition_false`, `variable_changed`, `computer_locked`,
  `computer_unlocked`. The condition reuses the *same feedback engine as buttons* — one concept,
  two placements.
- **Expressions are a real scripting language now.** `docs/user-guide/4_expressions/scripting.md`
  documents `let`/`const`, block scoping with shadowing, `if`, `for ... of`, `while`, user-defined
  functions and collections, plus template strings. Since v4.3, modules can accept an expression
  in *any* action or feedback field. The documentation's own example is a countdown:
  `secondsToTimestamp(max(0, timeDiff($(internal:time_hms), '19:30:00')), 'HH:mm:ss')`.
- **Inbound control APIs — six, all documented, all in `lib/Service/`:**

| API | Transport | Notable detail (all **FACT**) |
| --- | --- | --- |
| **HTTP REST** | Same port as the web UI | `POST /api/location/<page>/<row>/<column>/press` (also `down`, `up`, `rotate-left`, `rotate-right`, `step`), `POST .../style` with query or JSON body, `POST /api/custom-variable/<name>/value` |
| **OSC** | UDP | `/location/:page/:row/:column/press|down|up|rotate-left|rotate-right|step`, `/location/.../style/text|color|bgcolor`, `/custom-variable/:name/value`, `/surfaces/rescan` |
| **TCP / UDP text** | Line protocol | `location 1/2/3 press`, `surface :id page-up`, `custom-variable :name set-value {*value}`, `custom-variable :name get-value` |
| **Ember+** | Ember+ | Tree at `/Companion Tree/`: `identity/` (read-only product, company, version, build), `pages/<page>/<button>/` and `location/<p>/<r>/<c>/` with read/write `State`, `Label`, `Text_Color`, `Background_Color`; `variables/internal/` read-only, `variables/custom/` read-write |
| **RossTalk** | TCP **7788**, fixed | `CC <page>/<row>/<column>` — Companion answers Ross Video's own protocol so a Ross switcher's custom controls can press Companion buttons |
| **Art-Net / DMX** | UDP **6454** | Listens on a configured universe; reads **three consecutive DMX channels** — page, bank, direction — from a configured start channel (**FACT**, `Service/Artnet.ts` reads `packetData[ch]`, `[ch+1]`, `[ch+2]`). Ships a GrandMA2 fixture file so the console labels the channels |

  The Art-Net one is the sharpest idea in the product: **a lighting console cue can press a
  Companion button**, which means a lighting programmer can drive video and audio from the cue
  stack they already own, with no new operator.

- **Surfaces.** Since v4.3, surface drivers are **modules** with their own update cycle, exactly
  like device connections (**FACT**, `docs/user-guide/7_surfaces/index.md`). The complete verified
  inventory of `companion-surface-*` repositories under `org:bitfocus` (22 repos, enumerated
  2026-08-28): Elgato Stream Deck, Mirabox Stream Dock, Ulanzi Stream Controller, Loupedeck,
  Logitech MX Creative Console, X-keys, Infinitton (iDisplay), Contour Shuttle, VEC foot pedal,
  Xencelabs Quick Keys, 203 Systems Mystrix, Framework macropad, PrehKeyTec keyboard, Yamaha CC1,
  Blackmagic controller, Blackmagic Videohub panel, Pixelhue U5 mini, Xbox controller, **generic
  MIDI**, **Mackie Control**, plus `companion-surface-api` (the SDK) and a test module. There is
  also a built-in **web emulator** and **web buttons** view (`docs/user-guide/6_interactive-buttons/`).
- **Remote surfaces.** The **Satellite protocol** lets a surface attached to a different machine
  appear as a local surface: TCP **16622**, WebSocket **16623**, with mDNS discovery so Companion
  offers to configure a discovered Satellite automatically (**FACT**, `docs/user-guide/5_remote-control/satellite.md`
  and `companion-satellite` README). A Raspberry Pi image is published for it.
- **Persistence and interchange.** Configuration exports to a **`.companionconfig`** file with a
  `FILE_VERSION` stamp (**FACT**, `lib/ImportExport/Controller.ts`). Import is granular: full
  import with per-category selection, "import preserving unselected components", or importing
  **a subset of pages or triggers with connection remapping** (**FACT**,
  `docs/user-guide/3_config/import-export.md`). Since v4.1 there are **scheduled backups** with a
  cron expression, four formats (raw DB, compressed, JSON, YAML) and multiple destination
  directories (**FACT**, `docs/user-guide/3_config/settings.md`).

**Notable strengths.**

- **The device library is the moat.** 700+ connections claimed (**FACT**, README) across an
  ecosystem of separately-versioned module repositories, each independently updatable since v4.0.
  A single-vendor product cannot catch this.
- **Modules as a de-facto standard.** ossia score executes Companion modules directly
  (`Protocols/Bitfocus/BitfocusEnumerator.cpp` reads `companion/manifest.json`;
  `BitfocusContext.cpp` resolves a bundled Node runtime at
  `<packages>/companion-modules/node-runtime` and spawns the module's entrypoint). **Companion's
  module format has escaped Companion.**
- **Six inbound protocols means Companion is also a translator**, not only a surface. Anything
  that can send a UDP line or an OSC message can drive it.

**Notable limits.**

- **No timecode.** An exhaustive search of `org:bitfocus` for `timecode`, `ltc`, `smpte`, `mtc`
  found exactly one repository — `companion-module-disguise-mtc`, which is disguise's "Multi
  Transport Control", not timecode chase (**FACT**). There is **no LTC or MTC chase in Companion
  and no module that provides one**. Companion can be triggered by a clock, a variable or a
  button, but it cannot follow a timecode track. For a segment whose tier-2/3/4 products are all
  built around timelines, this is the product's defining gap.
- **No redundancy.** A grep of the entire shipped user guide for `redundan|failover|hot spare`
  returns one hit, and it is about a redundant UI sidebar (**FACT**). The mitigation offered is
  *scheduled backups*, which is a restore story, not a failover story. Compare Q-SYS, where the
  Companion module itself has a `redundant` config flag and connects to primary and secondary
  cores (**FACT**).
- **Open-issue load.** 303 open issues on the main repository at the time of reading (**FACT**,
  GitHub API, 2026-08-28), plus 928 open module requests on `companion-module-requests`. This is a
  signal of demand as much as of defects, but it is also a signal that the maintainers are the
  bottleneck for a 700-module ecosystem.
- **Licence subtlety worth knowing.** `LICENSE.md` is MIT **plus a Contributor Licence Agreement**
  granting Bitfocus AS a transferable, sublicensable licence to all contributions, governed by
  Norwegian law (**FACT**). The core is open, but contributions are assigned in a way that keeps a
  future relicensing option open for the company. Modules are explicitly outside the CLA ("core,
  not modules").

### 2. QLab 5 (Figure 53) — the cue list as a document

**What it does.** QLab is a macOS cue player for theatre: an ordered list of cues that a stage
manager advances with a single GO. It plays audio, video and (since v4) controls lighting, and it
sends network cues to everything else.

**Data model, verified from `Figure53/QLabKit.objc` (`lib/QLKDefines.h`, last commit 2025-08-12).**
The cue type list is the product:

`Cue`, `CueList`, `Cart`, `Group`, `Audio`, `Mic`, `Video`, `Camera`, `Text`, `Titles`, `Light`,
`Fade`, `Network`, `MIDI`, `MIDIFile`, `Timecode`, `Start`, `Stop`, `Pause`, `Load`, `Reset`,
`Devamp`, `Goto`, `Target`, `Arm`, `Disarm`, `Wait`, `Memo`, `Script`, `Stagetracker`, `OSC`
(**FACT**).

Three things in that list matter for anyone designing a cue model:

1. **Cues that act on other cues are first-class** — `Start`, `Stop`, `Pause`, `Load`, `Reset`,
   `Devamp`, `Goto`, `Target`, `Arm`, `Disarm`. Control flow lives *in the cue list*, not in a
   scripting side-channel.
2. **Every cue has pre-wait and post-wait**, with elapsed and percent-elapsed exposed over OSC
   (`QLKOSCPreWaitKey`, `QLKOSCPostWaitElapsedKey`, `QLKOSCPercentPreWaitElapsedKey`) — timing is a
   property of every cue, not a special cue type.
3. **Cues can be armed/disarmed and flagged**, and Group cues expose `isChildAuditioning` and
   `isChildFlagged` (**FACT**, marked "v5.0+"). Rehearsal states are modelled explicitly.

**Integrations.** OSC on **port 53000**; **TCP mode is required for feedback and variables** and
the module warns this causes "a noticeable increase in network traffic"; QLab 5 supports a
**workspace OSC passcode**, and from **QLab 5.2** the Companion module requires version ≥ 2.1.0 to
work with it; QLab 5 commands go to *all* open workspaces unless the IP control port is changed
(**FACT**, all from `companion-module-figure53-qlab-advance/companion/HELP.md`). The library's
constants also reveal per-version API drift — `QLKOSCV4CueTargetIdKey` carries a comment that the
capitalisation of "Id" changed in v5, and there are `v5.5+` keys (**FACT**), which tells you QLab
5.5 exists and that Figure 53 breaks OSC key names across majors.

**Notable strengths.** The cue list is legible to a human who did not build it — this is why it
dominates theatre. The OSC dictionary is complete enough that third parties (Companion, Chataigne's
`QLab-OSC` module, Cue View) all implement full read-back, not just fire-and-forget.

**Notable limits.** **macOS only** (**FACT**, corroborated by the ToolBox list's "Mac Only" badge
and by the product being distributed as a `.app`). The free tier is real but heavily limited
(2 channels audio, 1 screen video). Feedback requires TCP with a traffic cost. Cue name variables
"could clutter the list with hundreds of variables" and are therefore hidden by default in the
Companion module (**FACT**) — a hint that QLab's OSC surface scales awkwardly to large shows.

### 3. Chataigne — the state machine that ate the middle tier

**What it does.** Chataigne (Ben Kuperberg, France, GPLv3) is a modular hub: connect *modules*
(devices/software), route values between them, drive them from a **State Machine** (real-time
conditional logic) or a **Time Machine** (timeline sequences).

**Data model, verified from the source tree:**

- `Source/Module/` — modules, with a `Routing/` subsystem (the Module Router: "route multiple
  values at once from one software to another, independent of the protocol", **FACT**, README).
- `Source/StateMachine/` — `State/`, `Transition/`, `StateManager` — an actual finite state machine
  with transitions as first-class objects.
- `Source/TimeMachine/Sequence/` — sequences composed of **layers**: `audio/`,
  `mapping/automation/1d`, `mapping/automation/2d`, `mapping/color`, and `trigger/`; plus
  `Cue/ChataigneCue`. So a Chataigne timeline is *automation curves + audio + trigger points*,
  and cues are markers on it.
- `Source/CustomVariables/` — stored values with presets and group interpolation.

**Protocol coverage (FACT, README + `Source/Module/modules/`):** OSC, **OSCQuery**, MIDI, DMX
(Enttec OpenDMX / DMXPro / DMX-MkII, **Art-Net**, **sACN/E1.31**), Serial, UDP, TCP, HTTP, MQTT,
WebSockets, PJLink, **Ableton Link**, **PosiStageNet**, plus hardware: Kinect V2, **Stream Deck**,
**Loupedeck**, joystick, gamepad, mouse, keyboard, Wiimote, Joycon, sound card, **GPIO (Raspberry
Pi)**.

**Timecode — the thing Companion lacks.** Chataigne embeds **libltc** (Robin Gareus' SMPTE LTC
encoder/decoder, `Source/Common/LTC/`, **FACT** from the file header). `ChataigneSequence.h`
exposes `ltcAudioModule`, `ltcModuleTarget`, `ltcSyncTolerance`, an `LTCOutOfRangeMode` enum
(`DO_NOTHING`, `JUMP_TO_CLOSEST`, `JUMP_TO_START`, `JUMP_TO_END`), an `LTCSyncMode` enum
(`RECEIVE`, `SEND`, `BOTH`), `ltcSendFPS` and `ltcTVStandard` (**FACT**). **A Chataigne timeline
can chase or generate LTC over an audio channel, with an explicit policy for what to do when
timecode goes out of range.** That out-of-range policy is a detail only someone who has been burned
on a show would write.

**Ecosystem.** 108 community modules in the official index (**FACT**, `Chataigne-community-modules/modules.json`),
including `MidiMSC`, `Ontime`, `QLab-OSC`, `grandMA2`, `grandMA3`, `EOS-OSC`, `dbaudio-DS100`,
`L-ISA-OSC`, `Holophonix`, `SpatGRIS`, `Spat-Revolution`, `Blackmagic-VideoHub`, `Hyperdeck`,
`Madrix5`, `MagicQ`, `LightSharkforChataigne`, `Timecode-Expert-2`, `FreeD`, `Live-Link-Face`,
`Augmenta`, `MODBUS-TCP`, `Shure-QLXD/SLXD/ULXD`, `Panasonic projector` (serial + TCP), and a
dozen MIDI control surfaces (APC, Launchpad, X-Touch, NanoKontrol).

**Notable strengths.** Three paradigms — routing, state machine, timeline — in one free tool, plus
the diagnostic layer: **Detective** (plot a parameter over time), **Parrot** (record and replay any
parameter animation to simulate input), **Dashboard** (build a web UI), **Outliner** (**FACT**,
README). Show-control products that ship a *debugger* are rare.

**Notable limits.** Building requires a **forked JUCE** (`benkuper/JUCE`, `develop-local` branch)
built via Projucer (**FACT**, README build instructions) — a meaningful barrier to contribution and
to auditability. The UI is dense; the README's own framing ("as simple as possible for basic
interactions, but can be easily extended to create complex interactions") is the classic promise of
a tool with a real learning curve. No verified redundancy story.

### 4. ossia score — the interactive timeline, and the Companion-module borrower

**What it does.** ossia score (ossia.io, LaBRI/SCRIME, Bordeaux) is "a *sequencer* for audio-visual
artists, designed to create *interactive* shows" (**FACT**, README). Its distinguishing idea is a
timeline where intervals have **conditions and flexible durations** rather than fixed positions —
a score that can wait for an event and then continue.

**Protocol coverage, from `src/plugins/score-plugin-protocols/Protocols/` (FACT):** OSC, OSCQuery,
**Minuit**, Art-Net, MIDI, **MCU** (Mackie Control), MQTT, CoAP, HTTP, WS, Serial, CAN, GPS,
Joystick, Wiimote, Evdev, Phidgets, Libmapper, Mapper, **SimpleIO** (Linux GPIO/sysfs class),
**DNSSDDeviceEnumerator** (mDNS discovery), and **Bitfocus**.

**The Bitfocus plugin (FACT, read in full).** `BitfocusEnumerator.cpp` scans a directory (and a
`_legacy` subdirectory) for `companion/manifest.json` files; `BitfocusContext.cpp` resolves a Node
binary from `<packagesPath>/companion-modules/node-runtime` (`/bin/node` or `node.exe`, per
declared Node major version) and launches the module's entrypoint with an API version. ossia score
therefore **runs unmodified Bitfocus Companion connection modules as its device drivers**.

The strategic reading (**INFERENCE**): Companion's module format has become the closest thing this
segment has to a *standard device-driver interface*, and it did so without anyone standardising it.
Any new product in this space now has a choice between writing 700 drivers and adopting someone
else's format — and one serious open-source product has already chosen the latter.

**Notable strengths.** Runs everywhere including **WebAssembly and a Raspberry Pi Zero 2**
(**FACT**, README). Scripting/live-coding in **JavaScript, ISF shaders, Faust, PureData or C++**.
Handles video (Spout/Syphon/NDI/Shmdata) and data (CSV, HDF5) in the same score. Genuinely
maintained: CI matrices for AppImage, Flatpak, Nix, Arch/SUSE/Fedora, Debian, Ubuntu, macOS,
Windows (MSYS2 and MSVC 2026), FreeBSD and WASM.

**Notable limits.** 489 open issues (**FACT**, GitHub API 2026-08-28) — the largest open-issue count
of any product in this pass. The vocabulary is academic ("intermedia", "interactive scores") and
the learning curve is, by every visible signal, the steepest in the segment (**INFERENCE**). No
redundancy story. No verified evidence of use in commercial broadcast.

### 5. Ontime — the rundown as the trigger source

**What it does.** Ontime (v4.13.0, GPLv3, `cpvalente/ontime`) manages **event rundowns, scheduling
and cueing** for conferences, touring shows, broadcasters, theatres and houses of worship
(**FACT**, README). It is browser-based, self-hostable via Docker/npm/Homebrew, and also sold as a
cloud service.

**Why it belongs in a show-control dossier: its automation model.** From
`packages/types/src/definitions/core/Automation.type.ts` (**FACT**, read in full):

```
Trigger  = { trigger: TimerLifeCycle, automationId }
Automation = { filterRule: 'all' | 'any', filters: AutomationFilter[], outputs: AutomationOutput[] }
AutomationFilter = { field, operator: equals | not_equals | greater_than | less_than
                                   | contains | not_contains, value }
AutomationOutput = OSCOutput { targetIP, targetPort, address, args }
                 | HTTPOutput { url }
                 | OntimeAction { playback-start|stop|pause|roll, aux1..3 start/stop/pause/set,
                                  message-set, message-secondary }
```

That is the whole automation engine, and it is *thirty lines of type*. The trigger source is the
**timer lifecycle of a scheduled rundown event**, and the filter operates on **fields of the event
itself, including custom fields**. So "when the event whose *Department* field is `Keynote` starts,
send OSC `/cue/keynote/start` and hit this webhook" is expressible without scripting.

**Notable strengths.** The rundown is the source of truth and everything else derives from it —
signage, operator views, cuesheets, automations. Dedicated views for directors, operators,
backstage and signage (**FACT**, README). Ships on nearly everything, including ARM Raspberry Pi
AppImages. Has both a Companion module (`companion-module-getontime-ontime`) and a Chataigne module
(**FACT**) — it is *upstream* of the show-control layer, not competing with it.

**Notable limits.** **No MIDI output** in the automation type (only OSC, HTTP and internal actions)
— **FACT**, from the type definition. No timecode chase visible in the automation model. The
cloud/self-host split means the free path requires you to run infrastructure.

### 6. The fixed-installation tier, seen through its control protocols

None of these vendors could be researched from their own documentation. What follows is what
their **wire protocols** reveal, read from open-source driver code — which is honest evidence
about integration cost and nothing else.

| Product | Protocol evidence (all **FACT** from the cited module) | What it implies |
| --- | --- | --- |
| **Q-SYS Core** | QRC over **TCP 1710**; module supports **primary + secondary host with a `redundant` config flag**, per-connection status tracking and debounced status during redundant-system init (`companion-module-qsys-remote-control/index.js`). Command set spans `Control.Get/Set/Toggle`, `Component.Set`, `ChangeGroup.Invalidate`, `Mixer.*`, `LoopPlayer.*`, `Snapshot.Load/Save`, `PA.PageSubmit`, `StatusGet` | **Redundancy is designed in at the protocol level.** The mixer crosspoint selector syntax (`1-6 9`, `1-8 !3`, `* !3-5`) is a small masterpiece of ergonomics worth stealing |
| **7thSense Delta** | TCP text protocol: show mode, play/cue/stop/rewind, step ±n frames, **goto named marker**, goto frame number, start named sequence, **start sequence on all servers in a group**, **enable/disable tracking an external SMPTE timecode**, set framerate, load/save show (incl. group-wide), toggle diagnostic graphs/stats/VU/channel ID | Everything is a **timeline** and everything has a **group-wide variant**. Diagnostics are part of the control surface — you can turn on a VU meter or channel ID remotely, which is what an installation engineer actually needs at 2am |
| **Dataton Watchout 7** | **HTTP API on port 3019 plus Server-Sent Events**; module uses dual updates — SSE for instant playback/input/preset state, 30s polling for structural changes. **IDs are stable and re-used across shows**, so the same button works in a different show file | The **stable-ID** decision is the single best data-model idea found in this pass. It makes buttons portable between show files — the show-control equivalent of a stable primary key |
| **AV Stumpfl Pixera** | JSON over TCP ("Rev367"): timeline transport, next/previous cue, goto timecode / cue by name / cue by index, **blend** to timecode/cue (a *transition* rather than a jump), timeline opacity and fade, **SMPTE mode**, screen visibility/projectability, trigger mapping, layer mute | "Blend to" as a peer of "goto" is notable: the API models *how* you get there, not only where |
| **CueServer 2/3** | **CueScript** command strings sent over HTTP or TCP; cues, macros, playbacks, audio file play/stop, reboot | The control interface *is* the scripting language — one text channel does everything. Cheap to integrate, hard to introspect |
| **ETC Paradigm** | Driven via the controller's **web interface**; the module author records that "Support using the UDP Serial connection could not be implemented in testing", and that the module supports up to version 3, with 4+ "in development" | An honest failure note in shipped documentation. Architectural controllers are the least API-friendly corner of the segment |
| **ETC Eos** | OSC over **TCP 3032** (packet-length framing, the default) or **3037** (SLIP), plus OSC UDP; enabled at *Setup > System > Show Control > OSC*; network settings moved in v3.2 | The most widely integrated lighting API in the segment. Two framings for the same protocol is a recurring integration trap |
| **MA Lighting grandMA2 / dot2** | **MSC over Ethernet**, UDP ports **6000–6100**, transmitter/receiver device ID `0–111`, group ID `1–15`, `All`/`Device`/`Group` addressing; console must be set to `Ethernet` mode, exec `Exec.Page`, command format `All`; executor fader/intensity values **wrap above 127** even though higher executor numbers otherwise work; the grand master cannot be controlled via MSC; dot2 supports page 1 only | A field-tested account of a protocol's real limits, published in a module's help file. Note the MSC device/group ID ranges: this is genuine MSC semantics carried over UDP |

---

## Standards & protocols

Everything in this table was verified in code or shipped documentation during this pass.

### Wire protocols

| Protocol | Transport / port | Where verified |
| --- | --- | --- |
| **OSC** (Open Sound Control) | UDP and TCP; TCP framing varies (**packet-length header** vs **SLIP**) | Companion `Service/OscApi.ts`; ETC Eos module (3032 length-framed / 3037 SLIP); QLab 53000; ossia, Chataigne, O-S-C, TouchOSC |
| **OSCQuery** | HTTP + WebSocket schema discovery over OSC | Chataigne built-in module; ossia score `Protocols/OSCQuery` |
| **Minuit** | OSC-based query protocol | ossia score `Protocols/Minuit` |
| **MIDI** | USB/DIN, plus **RTP-MIDI / AppleMIDI** over network | Companion `companion-surface-midi`; MIDIMonster `midi`/`winmidi`/`jack`/`rtpmidi`; LiSP `midi` plugin |
| **MSC (MIDI Show Control)** | SysEx; in the MA implementation carried over **UDP 6000–6100** with device ID 0–111 / group ID 1–15 | `companion-module-malighting-msc`; Chataigne community module `MidiMSC` |
| **MTC (MIDI Time Code)** | MIDI | O-S-C `/mtc` address; LiSP `timecode/protocols/midi.py`; disguise MTC module |
| **SMPTE LTC** | Audio (Manchester-biphase) | Chataigne embeds **libltc** (Robin Gareus) with encode *and* decode, `LTCSyncMode = RECEIVE|SEND|BOTH` |
| **Art-Net** | UDP **6454** | Companion `Service/Artnet.ts` (as a *receiver*: page/bank/direction on 3 DMX channels); Chataigne; MIDIMonster `artnet` (v4); LiSP **Art-Net timecode** output; ossia `Protocols/Artnet` |
| **sACN / ANSI E1.31** | UDP multicast | Chataigne; MIDIMonster `sacn`; `ETCLabs/sACN` (reference implementation of E1.31); `companion-module-generic-sacn` |
| **RDM / ANSI E1.20, RDMnet / E1.33** | DMX / IP | `ETCLabs/RDM`, `ETCLabs/RDMnet`, `ETCLabs/RDMnetBroker` |
| **Ember+** | TCP (Glow/BER) | Companion `Service/EmberPlus.ts` + `companion-module-generic-emberplus` |
| **RossTalk** | TCP **7788** (fixed) | Companion `Service/Rosstalk.ts` + user guide |
| **PosiStageNet (PSN)** | UDP multicast | Chataigne built-in `posistagenet`; Cue View |
| **PJLink** | TCP | Chataigne; `companion-module-generic-pjlink`; Cue View |
| **QRC (Q-SYS Remote Control)** | JSON-RPC-ish over TCP **1710** | `companion-module-qsys-remote-control` |
| **HTTP / REST + SSE** | TCP | Companion HTTP API; Watchout 7 (port 3019 + Server-Sent Events); Ontime |
| **WebSocket** | TCP | Companion Satellite (16623); Ontime; `companion-module-generic-websocket` |
| **MQTT / CoAP** | TCP / UDP | Chataigne `mqtt`; ossia `Protocols/MQTT`, `Protocols/CoAP`; MIDIMonster `mqtt` (v5 and 3.1.1) |
| **Ableton Link** | UDP, tempo/phase sync | Chataigne `abletonlink` |
| **Companion Satellite** | TCP **16622**, WebSocket **16623**, mDNS discovery | `companion-satellite`; Companion user guide |
| **Probel SW-P-08** | TCP/serial router control | `companion-module-generic-swp08` |
| **GPIO / contact closure** | Local pins or networked I/O boxes | `companion-module-raspberry-gpio`, `companion-module-kissbox-gpio`, `companion-module-sain-smart-relay`; Chataigne `gpio` (Raspberry); ossia `SimpleIO` |
| **Open Pixel Control, OLA, MA Web Remote, VISCA** | various | MIDIMonster backends `openpixelcontrol`, `ola`, `maweb` (grandMA2 + dot2, incl. onPC), `visca` |

### File and interchange formats

| Format | Product | Notes |
| --- | --- | --- |
| **`.companionconfig`** | Companion | JSON-ish export with a `FILE_VERSION` stamp; supports partial import (pages/triggers subsets) **with connection remapping** (**FACT**) |
| Backup formats: raw DB, compressed, **JSON**, **YAML** | Companion | Cron-scheduled to multiple directories; JSON/YAML/compressed are restorable from the UI, raw DB is not (**FACT**) |
| **`.tosc`** | TouchOSC MK2 | Layout files, exchanged as complete documents in the community repo (**FACT**) |
| **`.noisette`** | Chataigne | Session file — extension **unverified in this pass** (not found in the source tree read); the session concept itself is verified via the Outliner/session features |
| Companion **`companion/manifest.json`** | Companion modules | The module descriptor — now read by a *third-party product* (ossia score) as a driver interface (**FACT**) |
| **CueScript** | CueServer | Command language sent as strings over the control channel; also the programming language (**FACT**) |

**Notable absence:** there is **no interchange format for a show itself** in this segment. A QLab
cue list, a Companion page set, a Chataigne session and a Watchout timeline share zero
representation. Every migration is a rebuild. (**FACT** in the negative: no such format appeared
in any of the 27 repositories read; **INFERENCE** that none exists.)

---

## What this segment does WELL

Patterns worth stealing, each grounded in something verified above.

1. **The trigger / condition / action triad.** Companion's trigger model is *events + condition +
   actions*, where the condition reuses the same feedback engine that styles buttons, and the
   actions reuse the same action engine that buttons fire (**FACT**). Ontime's is the same shape:
   *lifecycle trigger + filters + outputs* (**FACT**). One vocabulary, reused in three placements,
   is why users can learn a large product quickly.
2. **Feedback closes the loop on the surface itself.** A button is not a fire-and-forget switch; it
   renders the state of the thing it controls. Companion's feedbacks, Q-SYS's ChangeGroup and
   Watchout's SSE stream all exist to make the panel tell the truth. Any control UI without
   read-back is a lie waiting for a show.
3. **Stable IDs across documents.** Watchout 7's API re-uses timeline IDs across show files so the
   same button works in a different show (**FACT**). This is the single most transferable data-model
   idea in the pass.
4. **Timing as a property of everything, not a special object.** QLab gives *every* cue a pre-wait
   and a post-wait with elapsed and percent-elapsed exposed over OSC (**FACT**). No "delay cue"
   needed.
5. **Explicit failure policies for time.** Chataigne's `LTCOutOfRangeMode` (`DO_NOTHING`,
   `JUMP_TO_CLOSEST`, `JUMP_TO_START`, `JUMP_TO_END`) is a designed answer to "what do we do when
   the timecode is wrong" (**FACT**). Most software's answer is undefined behaviour.
6. **Rehearsal states are modelled.** QLab's arm/disarm, flags and `isChildAuditioning` (**FACT**)
   acknowledge that a show file spends most of its life *not* being performed.
7. **Meet the operator on the protocol they already own.** Companion accepts Art-Net so a lighting
   console can press its buttons, and RossTalk so a Ross switcher can (**FACT**). Instead of asking
   for a new operator position, it borrows an existing cue stack.
8. **Ship the manual with the code.** Companion's complete user guide lives in
   `docs/user-guide/` in the repository, versioned with the software, with a page per protocol
   (**FACT**). It was readable in this pass *when the vendor's own website was not*. That is a
   resilience property, not just a tidiness one.
9. **Ship a debugger.** Chataigne's Detective (parameter-over-time plot), Parrot (record/replay any
   parameter animation to simulate input) and Dashboard (**FACT**) treat show control as something
   you debug, not just configure. Parrot in particular — replaying recorded input to test a show
   without the sensors present — is the kind of feature that only exists after a bad load-in.
10. **Modules with independent update cycles.** Companion made both device connections *and*
    surfaces into separately-versioned modules (**FACT**, v4.0 and v4.3), so a driver fix does not
    require a core release. This is why 700 drivers is survivable.
11. **Discovery that respects the network.** Cue View sweeps the local subnet plus Bonjour, and
    **truncates the sweep to a /21 when the subnet is larger than 2296 hosts** (**FACT**,
    `src/search.js`). A deliberate, documented limit rather than an accidental broadcast storm.
12. **Redundancy modelled in the client, not just the server.** The Q-SYS Companion module takes
    two hosts, tracks per-connection status and debounces status warnings during redundant-system
    startup (**FACT**). Failover only works if the *clients* understand it.

---

## What NOBODY in this segment solves well

The white space, stated as claims that can be falsified.

1. **Nothing plans the show control; everything only runs it.** Every product examined is a
   *runtime*. Not one of the 27 repositories contains a design-time artefact: no document that says
   "this show needs these 40 buttons across these 3 surfaces, driving these 12 devices over these
   protocols, on this network, with these ports open." The paperwork that precedes a Companion
   config — surface layout, port list, IP plan, protocol matrix — is universally made in Excel and
   Visio. (**FACT** in the negative across the corpus read; **INFERENCE** as to what people use
   instead.)
2. **There is no interchange format for a show.** See above. Migrating from Show Cue System to
   QLab, or from a Companion page set to a client's Crestron system, is a manual rebuild every
   time.
3. **Timecode is bifurcated and the free tier lost.** Chataigne, LiSP and the tier-4 servers chase
   or generate timecode; **Companion — the most-installed product in the segment — cannot chase
   timecode at all, and no module provides it** (**FACT**, exhaustive search). The most common
   free surface layer and the most common show clock cannot be joined without a third tool.
4. **Redundancy stops at tier 4.** Q-SYS has primary/secondary cores at the protocol level
   (**FACT**). Companion's answer is scheduled backups (**FACT**). There is no "two Companions, one
   virtual IP, automatic failover" in any open-source product examined. For a live show whose
   entire operator interface is one laptop, this is the largest unmanaged risk in the segment.
5. **No product tells you what a change will break.** Companion buttons reference connections,
   pages, variables and surfaces; nothing answers "if I remove this connection, which 34 buttons go
   dead?" The import flow offers connection *remapping* (**FACT**) — which is a hint that this is a
   real pain — but there is no impact analysis.
6. **State across machines is unsolved outside proprietary stacks.** LiSP has a `synchronizer`
   plugin and Figure 53 published an `ActionSync` experiment "for synchronizing multiple timelines
   on two or more machines over OSC" (**FACT**, both observed); neither is a general answer. 7thSense
   solves it inside its own server group (**FACT**, group-wide commands) and does not export it.
7. **Documentation of *your* system, as opposed to *the product*, does not exist.** No product
   generates an operator-facing sheet: what each button does, which device, which port, what to do
   when it fails. This is printed by hand for every show. (**FACT** in the negative; Companion has
   per-button "notes" as the closest thing.)
8. **Discovery is per-product and per-protocol.** Companion has Bonjour discovery for Satellite;
   Cue View sweeps subnets; ossia has a DNS-SD enumerator; Chataigne has Zeroconf. Nothing produces
   a single inventory of "everything controllable on this network" that another tool can consume.
9. **Nobody bridges the plan to the patch.** The cable planner knows a camera is on SDI input 3;
   the show control knows button 2/1/4 cuts input 3. These facts are typed twice, by two people,
   and drift silently. (**INFERENCE**, but it follows directly from #1 and #8.)
10. **The learning curve is not addressed, only apologised for.** Chataigne offers an interactive
    in-app guide, Companion writes presets, ossia writes tutorials — but the products remain
    programming environments with a GUI. There is no "describe your show, get a starting config"
    path anywhere in the segment (**FACT** in the negative).
11. **German-language provision is thin.** Of 27 repositories read, the documentation is English
    throughout; the strongest German-speaking presence in this segment is *as vendors of controlled
    devices* (MA Lighting, Ventuz, Madrix, AV Stumpfl in Austria, VIOSO, Pandoras Box) rather than
    as vendors of control software, and MIDIMonster (Fabian J. Stumpf, BSD-style) documents itself
    in English (**FACT**). A German-language show-control product was not found in this pass —
    though the search was constrained to GitHub, so this is **weak evidence**, not a conclusion.

---

## Relevance to AV Planner Suite

Ordered by strength of the connection. The suite already touches this segment in three places, so
these are not hypotheticals.

### Direct, already-existing integration points (verified in the local repos)

**`tally-pi`** — is *built on* Companion. Its README states it runs on the Companion Pi image or a
Pi with Companion at `/opt/companion/`, serves the Companion UI on port 8000, and its
`gpio_watcher.py` fires **Companion HTTP API** calls when a GPIO input shorts to ground, with a
per-device `in_companion_mode` setting (**FACT**, `/home/user/tally-pi/README.md`). This dossier's
Companion HTTP/OSC/TCP API tables are the reference material for that code path, and the finding
that **Companion has no timecode chase** matters directly: tally-pi cannot ever gain
timecode-triggered behaviour by leaning on Companion.

**`broadcast-intercom`** — ships its own Companion connection module (`companion-module/`) that
sends commands to `POST /api/control/action` and subscribes to the `/ws` WebSocket for live state,
with a REST poll of `GET /api/state` as fallback (**FACT**, module README). That is exactly the
pattern Watchout 7 uses (SSE for instant state, polling for structure) and the pattern the Q-SYS
module uses for redundancy — this dossier's deep dives are the peer review for that module's
design. Two concrete improvements are suggested by the evidence: (a) the module should expose
**feedback** for every state it can read, because in this segment a surface without read-back is
considered broken; (b) it should tolerate a second core address the way the Q-SYS module does, if
the intercom ever grows a standby server.

**`sony-camera-bridge`** — its README states the same commands reach every camera "from a Bitfocus
Companion surface or a USB control panel" (**FACT**). The verified 22-repository
`companion-surface-*` inventory above is the authoritative list of what "a Companion surface" now
means, including the newer **generic MIDI** and **Mackie Control** surface modules — which are
relevant because an MCU-style fader bank is a plausible camera-paint surface.

### Where this segment's patterns should change the planners

**`cable-planner`** — the strongest opportunity in this dossier. Show control is the layer that
consumes exactly the information cable-planner already holds, and nobody bridges the two (white
space #9). Concretely:

- **A control/protocol plane in the signal model.** cable-planner models SDI signal flow; show
  control needs the *control* graph: which device is at which IP, on which port, speaking which
  protocol (this dossier's port table is a starting corpus — 6454 Art-Net, 7788 RossTalk, 53000
  QLab, 1710 QRC, 3032/3037 Eos, 3019 Watchout, 16622/16623 Satellite, 6000–6100 MA MSC). A
  planner that produces the **port and protocol list** for a show would be first in the segment.
- **`.companionconfig` as an export target.** The format has a `FILE_VERSION`, supports importing
  a *subset of pages with connection remapping* (**FACT**), and is plain structured data. Generating
  a starter Companion page from a planned setup — one button per camera, labelled from the planner's
  own device names — is the "describe your show, get a starting config" path that white space #10
  says nobody offers. This should be prototyped against a real export before being promised.
- **Stable IDs.** Adopt Watchout's discipline (**FACT**, stable re-used IDs across show files) for
  the suite's shared inventory format, so that a device keeps its identity when a project is copied
  for the next show. This is the prerequisite for any of the above.
- **Impact analysis.** White space #5 — "which buttons break if this connection goes away" — is the
  same question as "which cables break if this device moves", which is a graph query cable-planner
  is already structurally able to answer. It is a differentiator in *both* segments.

**`light-planner`** — the lighting side of show control is where the protocol standards are
hardest and best documented: sACN/E1.31, RDM/E1.20, RDMnet/E1.33 (ETCLabs publishes reference
implementations, **FACT**), Art-Net v4, and MSC with its real limits (MA executor values wrapping
above 127, dot2 page-1-only, grand master not controllable — **FACT**). If light-planner ever
outputs a patch or a universe plan, these are the constraints it must encode. The ETC Eos OSC
detail (TCP 3032 length-framed *vs* 3037 SLIP) is the kind of trap worth surfacing in a planner's
export notes.

**`multicam-planner`** — weaker link. The relevant transfer is the **surface layout** idea: a
multicam plan implies a shot box (one button per camera, one per angle), and Companion's grid model
(page/row/column) plus the verified surface inventory tells you exactly how many keys each real
device has. A "print the operator's button layout" output would be cheap and has no competitor.

**`shell` / suite** — two patterns to adopt wholesale:
1. **Ship the manual in the repository**, Docusaurus-style, versioned with the code (**FACT**,
   Companion does exactly this). This pass proved the resilience value: the documentation was
   readable when the vendor's website was not.
2. **Discovery with a deliberate limit.** If the suite ever scans a network, copy Cue View's rule:
   Bonjour plus a subnet sweep, **truncated to /21 above 2296 hosts** (**FACT**). Publish the
   limit in the UI.

**`pi-media-station`** — the closest analogue in this dossier is DigiShow and the tier-4
installation controllers: an unattended device that reacts to a sensor. The transferable ideas are
Chataigne's **LTC out-of-range policy** (define what happens when the trigger source is wrong, do
not leave it undefined) and CueServer's model of *the control interface being the scripting
language* — cheap to integrate, but note the cost recorded above: hard to introspect.

**Explicitly not worth building** (the corpus requires this to be stated): a general-purpose
show-control runtime. Companion is MIT, free, has 700+ device modules and a module format that a
competitor has already adopted as a standard. Competing with it on breadth is unwinnable. The
defensible position for this suite is the *design-time* layer that Companion deliberately does not
occupy — planning, documenting and generating the control setup, then handing it to Companion.

---

## Not opened / unverified

Named in the brief or discovered during research, but **not verifiable** in this pass because the
only reachable hosts were `github.com` and `raw.githubusercontent.com`. Listed so a future pass can
target them:

- **Medialon Manager / Showmaster** — only third-party evidence (a practitioner's JavaScript
  `medialon_script-*` repositories) establishing that its scripting is JavaScript-based. Ownership,
  current product line, protocols, redundancy and price: unverified.
- **Alcorn McBride** — nothing verified. No repository, no Companion module (confirmed absent).
- **Crestron / AMX programming** — only Crestron's CH5 HTML5 component library verified. SIMPL#,
  NetLinx, control-system architecture and pricing: unverified.
- **Q-SYS Designer** (the design tool, as opposed to the QRC protocol), **Q-SYS Control** scripting
  (Lua): unverified.
- **7thSense** beyond the Delta TCP command set; **Stage Technologies**, **Creative Conners**
  (Spikemark) — theatre automation was not verifiable at all, which is a real gap given the brief.
  No open-source presence found.
- **TouchOSC** vendor facts: platforms, price, exact scripting API. Only community-repo evidence
  (`.tosc` files, Lua, OSC+MIDI) was available.
- **Open Stage Control**: the GitHub repository is **archived and contains only a notice that
  development moved to `framagit.org/jean-emmanuel/open-stage-control`** (**FACT**), which is
  blocked. Version `v1.29.8` is attested by a third-party Dockerfile pinning it (**FACT**). Licence
  and current feature set: unverified.
- **Isadora (TroikaTronix)**, **Vezer (Imimot)**, **Show Cue System**, **Multiplay**, **CuePilot**,
  **ShowCockpit**, **Stage Precision**, **Central Control**, **Vor**, **OSC/PILOT**, **Chameleon**,
  **CuePoints**, **HeadsUp**, **OSC See**, **Stagetimer.io**, **luminosus** — discovered via a
  curated third-party list (`MatterformInc/ToolBox`) but not verifiable individually. Their
  existence is **FACT** (they appear in a maintained list with URLs); everything about them is
  **UNKNOWN**.
- **All prices, for every product.** Not one vendor pricing page was reachable.
- **QLab's own OSC dictionary** (`qlab.app/docs`) — blocked; the cue model here comes from
  Figure 53's own open-source client library instead, which is good evidence but is a client, not
  the spec.

---

## Sources

Every URL below was actually opened, cloned or queried on **2026-08-28**.

**Fetched as web pages (only reachable hosts)**
- https://raw.githubusercontent.com/bitfocus/companion/main/README.md
- https://github.com/bitfocus/companion

**Repositories cloned and read as primary source**
- https://github.com/bitfocus/companion — v5.1.0; `LICENSE.md`, `CHANGELOG.md`, `package.json`,
  `companion/lib/Service/*`, `companion/lib/Controls/*`, `companion/lib/Surface/*`,
  `companion/lib/Internal/*`, `companion/lib/Cloud/Controller.ts`,
  `companion/lib/ImportExport/Controller.ts`, `companion/lib/Resources/EventDefinitions.ts`, and the
  complete shipped user guide under `docs/user-guide/` (notably `3_config/triggers.md`,
  `3_config/settings.md`, `3_config/import-export.md`, `4_expressions/index.md`,
  `4_expressions/scripting.md`, `5_remote-control/{osc,http-remote-control,tcp-udp,artnet-dmx-control,emberplus-control,rosstalk-control,satellite}.md`,
  `7_surfaces/index.md`)
- https://github.com/bitfocus/companion-satellite
- https://github.com/benkuper/Chataigne
- https://github.com/benkuper/Chataigne-community-modules
- https://github.com/jean-emmanuel/open-stage-control (archived; contains only the move notice)
- https://github.com/ameisso/OpenStageControlHandbook
- https://github.com/evtechteam/docker-open-stage-control
- https://github.com/robinz-labs/digishow
- https://github.com/Figure53/QLabKit.objc
- https://github.com/FrancescoCeruti/linux-show-player
- https://github.com/cpvalente/ontime
- https://github.com/cbdevnet/midimonster
- https://github.com/ossia/score
- https://github.com/stagehacks/Cue-View
- https://github.com/theexperiential/Cuepid
- https://github.com/F-l-i-x/TouchOSC
- https://github.com/stingalleman/awesome-audiovisual
- https://github.com/MatterformInc/ToolBox

**Bitfocus Companion modules cloned as evidence of commercial products' protocols**
- https://github.com/bitfocus/companion-module-figure53-qlab-advance
- https://github.com/bitfocus/companion-module-qsys-remote-control
- https://github.com/bitfocus/companion-module-7thsensedesign-delta
- https://github.com/bitfocus/companion-module-interactivetechnologies-cueserver
- https://github.com/bitfocus/companion-module-dataton-watchout-json
- https://github.com/bitfocus/companion-module-malighting-msc
- https://github.com/bitfocus/companion-module-etc-paradigm
- https://github.com/bitfocus/companion-module-etc-eos
- https://github.com/bitfocus/companion-module-showcuesystems-scs
- https://github.com/bitfocus/companion-module-avstumpfl-pixera

**Repository inventories enumerated via the GitHub API (metadata only, not cloned)**
- `org:bitfocus` — the complete `companion-surface-*` set (22 repositories): elgato-stream-deck,
  mirabox-stream-dock, ulanzi-stream-controller, loupedeck, logitech-mx-creative-console, xkeys,
  idisplay-infinitton, contour-shuttle, vec-footpedal, xencelabs-quick-keys, 203-systems-mystrix,
  framework-macropad, prehkeytec-keyboard, yamaha-cc1, blackmagic-controller,
  blackmagic-videohub-panel, pixelhue-u5-mini, xbox-controller, midi, mackie-control, surface-api,
  julusian-test
- `org:bitfocus` — generic protocol modules (osc, http, websocket, emberplus, pjlink, tcp-udp, midi,
  mqtt, sacn, artnet, snmp, ssh, swp08, tcp-serial, filereader, stopwatch, dataentry, ping, smtp,
  webtable, mysql, blink, onvif)
- `org:bitfocus` — vendor modules confirming presence/absence: getontime-ontime, figure53-qview,
  figure53-go-button, disguise-{osc,mtc,smc,liveupdate,track-notes}, dataton-watchout,
  twoloox-pandorasbox, ventuz-director, christie-{projector,spyder,wd}, avstumpfl-wingsviosorx,
  smodetech-smodelive, vioso-exaplay, etcaudiovisuel-onlyview, malighting-{grandma2,grandma3},
  etc-{echo,eos,paradigm}, crestron-{digitalmatrix,nvx,hd-mdnxm-4kz-e}, extron-*, raspberry-gpio,
  kissbox-gpio, sain-smart-relay, nrk-sofie-chef
- `org:ETCLabs` — 33 repositories, notably OSCRouter, OSCWidgets, OSCLayouts, Sound2Light,
  lighthack, EosSyncLib, sACN (ANSI E1.31), RDM (E1.20), RDMnet (E1.33), RDMnetBroker, ETCDmxTool,
  responseMIDIKit, LuminosusEosEdition
- `org:Figure53` — F53OSC, QLabKit.objc, TimecodeDisplay, QDisplay, QView, qlab-ruby, ActionSync
- `org:Crestron` — CH5ComponentLibrary, CH5ExampleProjects, CH5ThemeEditor, CH5UtilitiesCli,
  CH5VSCodeExtension, cosu
- `org:TroikaTronix` — Syphon-Virtual-Webcam, Firmata_Test_App and six macOS utility repositories
  (no Isadora product source)
- Keyword searches for `medialon`, `showmaster`, `alcorn mcbride`, `spikemark`, `creative conners`,
  `stage technologies`, `cuems`, `MIDI Show Control` — results reviewed; the only relevant hits were
  `joanantonllarch/medialon_script-*` (four JavaScript Medialon scripts) and the open-source
  products already listed

**Local repositories read for the relevance section**
- `/home/user/av-planner-suite/README.md`, `/home/user/av-planner-suite/docs/research/METHOD.md`
- `/home/user/tally-pi/README.md`
- `/home/user/Broadcast-intercom/README.md`, `/home/user/Broadcast-intercom/companion-module/README.md`
- `/home/user/sony-camera-bridge/README.md`, `/home/user/multicam-planner/README.md`,
  `/home/user/light-planner/README.md`, `/home/user/pi-media-station/README.md`,
  `/home/user/cable-planner/CLAUDE.md`

**Blocked (returned `EGRESS_BLOCKED` or HTTP 403 at the proxy; listed so the pass can be re-run):**
`bitfocus.io`, `bitfocus.github.io`, `qlab.app`, `hexler.net`, `docs.getontime.no`, `framagit.org`,
`en.wikipedia.org`, `npmjs.com`, and all search engines (WebSearch budget exhausted at 200/200
before this dossier began).
