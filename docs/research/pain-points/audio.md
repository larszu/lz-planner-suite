# Pain points: Audio System Design / Network Audio / RF

Research date: 2026-08-29 (brief dated 2026-08-28). Researcher: automated research pass.
Corpus language: English. All prices, where mentioned at all, are labelled with what
was actually verified.

---

## Method

### What was searched

This pass was run under a **hard network restriction** that materially shaped the
result, and the restriction is stated up front so the findings are weighted correctly.

**Reachable this session:**

- `github.com` — repository pages, README rendering, issue lists, issue detail pages,
  label-filtered issue queries, and the global GitHub issue/repository search
  (`github.com/search?type=issues`). This became the de-facto search engine for the pass.
- `raw.githubusercontent.com` — raw README/TODO/HELP files.

**Blocked by the egress proxy (verified by attempting each):**

- `reddit.com`, `old.reddit.com`, `www.reddit.com` (including the `.json` endpoints) —
  so **the entire Reddit angle of the brief could not be executed**. r/livesound,
  r/audioengineering, r/AVProfessionals, r/VIDEOENGINEERING were all unreachable.
- All general search engines tried: `html.duckduckgo.com`, `lite.duckduckgo.com`,
  `mojeek.com`, `hn.algolia.com`.
- Vendor sites: `audinate.com`, `getdante.com`, `service.shure.com`, `q-syshelp.qsc.com`.
- Pro-AV forums: `prosoundweb.com`, `gearspace.com`.
- `en.wikipedia.org`.
- Review sites (G2/Capterra/TrustRadius/Trustpilot) were not reachable and were not
  separately probed once the pattern was clear.
- German-language sources (`film-tv-video.de`, `production-partner.de`, event-technology
  forums) — unreachable, so **the German-language angle of the brief was not executed**.

Additionally, `api.github.com` returned HTTP 403 for this session and the GitHub MCP
tool is scoped to the operator's own repositories only, so **issue comment threads could
generally not be read in full** — GitHub's HTML issue pages lazy-load comments and the
fetched content usually contained the issue body but not the discussion. Where a claim
depends on a comment thread it is marked as such.

### How many sources were read

Roughly **50 distinct pages were successfully opened and read** (see Sources). Every one
is a primary source: a repository README, a maintainer's own TODO file, a project wiki
page documenting a reverse-engineered protocol, an issue body written by a practitioner,
or a maintainer-applied issue label.

### What this means for confidence

The corpus is **developer-weighted, not operator-weighted**. GitHub tells you what
*integrators and tool-builders* hit when they try to automate, script, or replace these
products. It tells you very little about what a *front-of-house engineer or RF coordinator*
mutters at 2am during a load-in. Findings about API surfaces, file formats, protocol
documentation and lock-in are therefore **well-evidenced**; findings about day-to-day GUI
ergonomics of the commercial products (Dante Controller, WWB, WSM, Q-SYS Designer) are
**thin and honestly marked UNKNOWN** rather than guessed at.

Where a finding rests on a single low-star solo project, that is stated. Where a search
result summary attributed a quote that did not appear when the page itself was opened,
the quote was **discarded** (this happened once, for an alleged Dante Virtual Soundcard
activation-limit complaint; see "Discarded claims" at the end).

### Frequency scale used

- **isolated** — one source, one voice.
- **recurring** — several independent sources, or a maintainer's own repeated
  acknowledgement over time.
- **widespread** — a theme that appears across multiple unrelated projects and vendors,
  where independent people arrived at the same problem without talking to each other.

---

## Per-product findings

### Dante Controller / Dante Domain Manager (Audinate)

The centre of gravity of the segment. Almost everything below is evidence *about* Dante
gathered from the projects that had to work around it, because Audinate's own site was
unreachable and Reddit was blocked.

**STRENGTHS (conceded by the people building alternatives)**

- FACT: Practitioners treat Dante Controller as the ground truth. In
  `bitfocus/companion-module-audinate-dantecontroller` #46 (opened 23 May 2026) the
  reporter's diagnostic is precisely that "all devices are detected normally in the
  official Dante Controller app" while the third-party module drops them — the official
  tool is the reference against which everything else is judged to be broken.
  <https://github.com/bitfocus/companion-module-audinate-dantecontroller/issues/46>
- FACT: `teodly/inferno`, an unofficial Dante implementation, lists Dante Controller as
  the *intended* control surface for its own devices — connections to Inferno endpoints
  are made "through Dante Controller or the network-audio-controller command-line tool."
  Even the reimplementation defers to the vendor GUI for routing.
  <https://github.com/teodly/inferno>
- FACT: Audinate does publish a **web-based preset creator** producing XML that contains
  expected devices, a routing matrix, sample rates and latency — described by a
  practitioner as "pretty simple" XML. So a declarative, file-based description of a
  Dante network does exist as a format.
  <https://github.com/chris-ritsen/network-audio-controller/issues/48> (2 Apr 2026)

**WEAKNESSES**

- FACT, and the single most load-bearing finding in this dossier: **there is no public
  Dante control API.** Three independent projects state this in three different ways:
  - The `netaudio` wiki, which is the only public byte-level Dante protocol reference
    that exists, states outright: *"The official Dante API for embedded devices isn't
    public information, so most of this information is guesswork and will likely be wrong
    or unreliable."* It also concedes *"Not all of the commands or their arguments have
    been explored yet."*
    <https://github.com/chris-ritsen/network-audio-controller/wiki/Technical-details>
  - `teodly/inferno`'s README: *"Dante protocol is undocumented. Everything was
    reverse-engineered or based on other reverse-engineering projects."*
    <https://github.com/teodly/inferno> (README, master branch)
  - Bitfocus Companion's maintainers closed the community request for a Dante Controller
    module (#395, opened 9 Feb 2021) with the labels **"No external protocol"**,
    **"Software"** and **"Unlikely"**. The project's own definition of that label is that
    the "software/device doesn't have an external or network protocol that we can use."
    <https://github.com/bitfocus/companion-module-requests/issues/395>

  Frequency: **widespread**. These are three unrelated codebases in three languages
  (Python, Rust, JavaScript) reaching the same conclusion across five years.

- FACT: Dante's scope stops at transport and discovery. `Dante-BabelBox`'s README states
  it plainly: *"Dante carries audio and basic mDNS-based device discovery, but nothing
  about preamp gain, phantom power, or wireless-mic status — each vendor layers its own
  proprietary control protocol on top of the same network."*
  <https://github.com/stoatworks-labs/Dante-BabelBox> (README)
  Frequency: **recurring** — corroborated by the same project's need to implement six
  separate vendor protocols (OSC for Behringer/Midas and Yamaha DM3, NRPN-over-TCP for
  Allen & Heath, a proprietary `MBC` block over Audinate ConMon for Yamaha R-series,
  AES70/OCA for Focusrite RedNet, MIDI SysEx for Aphex) to do one conceptual job.

- FACT: Dante's Windows driver model fragments channel counts. In
  `museumsvictoria/spatial_audio_server` #52 (15 Feb 2018, closed): *"Dante produces a
  device for every two channels on Windows' WDM API,"* making it impossible to target a
  single multi-channel device — the stated motivation for adding ASIO support to CPAL.
  Note the date: 2018, and Windows audio has moved since. Weak evidence today.
  <https://github.com/museumsvictoria/spatial_audio_server/issues/52>

- FACT: multicast flows are a known blind spot. A practitioner reported multicast streams
  not showing up in Dante Controller and rebuilding configs as the workaround; separately,
  identifying an AES67 device's multicast address and RTP payload requires a manual
  packet trace rather than being readable from the tool
  (`chris-ritsen/network-audio-controller` #40, 16 Oct 2025).
  <https://github.com/chris-ritsen/network-audio-controller/issues/40>
  Frequency: **isolated-to-recurring** — two related reports, one project.

**MISSING FEATURES (what users actually ask for)**

- Preset import/export from outside the GUI — `netaudio` #48 (2 Apr 2026). The requester
  wants to go beyond Audinate's own preset tool with **AES67 settings and clock-leader
  preference** included, and to map presets onto real hardware **by MAC address**.
  <https://github.com/chris-ritsen/network-audio-controller/issues/48>
- Get/set device audio latency programmatically — `netaudio` #49 (2 Apr 2026).
- Retrieve multicast IP and RTP payload type — `netaudio` #40 (16 Oct 2025).
- Set device sample rate from a control surface — Companion module #19 (closed 7 Apr 2026).
- AVIO input/output gain control — Companion module #30, open since 22 Feb 2026.
  <https://github.com/bitfocus/companion-module-audinate-dantecontroller/issues>

**UX PROBLEMS**

- **UNKNOWN.** Reddit, ProSoundWeb, Gearspace and the review sites were all unreachable,
  and no GitHub issue in the corpus critiques the Dante Controller GUI itself. To fill
  this you would need r/livesound and r/AVProfessionals threads, ProSoundWeb's
  "Church Sound"/"LAB" boards, and the Capterra/G2 "Cons" fields. Do not assume.

**PERFORMANCE PROBLEMS**

- FACT (against Dante *devices*, not the Controller GUI): audio integrity across the
  AES67↔Dante boundary is fragile. `aes67-linux-daemon` #217 (12 May 2025, open):
  an AES67 source arrives at a Dante network as *"crunchy trash instead of a nice tone"*
  at 48 kHz / L24 / 2 ch / 48 samples per packet / 576-sample playout delay. The reporter
  isolated it by confirming "another dante source through the same input chain comes out
  clean." No resolution recorded.
  <https://github.com/bondagit/aes67-linux-daemon/issues/217>
- FACT: `aes67-linux-daemon` #223 (5 Aug 2025, 11 comments) — PTP stays "Unlocked" on a
  Raspberry Pi 5 under Ubuntu 25.04 / kernel 6.14, and audio to a Dante device is
  therefore impossible. This is the clock-lock gate biting in practice.
- Frequency of "the Dante boundary is where it breaks": **recurring**.

**PRICING PROBLEMS**

- **UNKNOWN / UNVERIFIED.** Dante Controller is widely understood to be free and Dante
  Virtual Soundcard and Dante Domain Manager to be paid, but `audinate.com` and
  `getdante.com` were both blocked this session and **no price was read on any page**.
  Nothing is asserted here.
- INFERENCE (weak, and flagged as such): `teodly/inferno` positions itself against Dante
  Virtual Soundcard, and its top-line pitch is being free, open and low-footprint
  (~12 MB RAM). A project only wins on those axes if the incumbent is paid and heavy.
  That is an inference from positioning, not a read price.
  **To verify:** open `audinate.com/products/software/dante-virtual-soundcard` and the
  Dante Domain Manager pricing/tier page and record the figure and date.
- DISCARDED: a search-result summary attributed to `spatial_audio_server` #52 a complaint
  that "Dante Virtual Soundcard is complaining about the license being activated too many
  times." **Opening the issue directly showed no licensing discussion at all.** The claim
  is not used. If a DVS activation-limit complaint exists, it is elsewhere.

**LOCK-IN**

- FACT: this is the segment's defining lock-in case, and it is *structural*, not merely
  commercial. Third-party control of Dante exists **only** as reverse engineering. The
  Bitfocus Companion Dante module states its own provenance in its help file: it is
  *"based on Chris Ritsen's Network audio controller"* — i.e. the only production route
  from a control surface to a Dante network runs through a community-reverse-engineered
  Python protocol implementation.
  <https://raw.githubusercontent.com/bitfocus/companion-module-audinate-dantecontroller/main/companion/HELP.md>
- FACT: that route is explicitly scoped down. The same help file limits the module to
  *"simple local networks"*, and the only gain control it offers is "currently only for
  AVIO 2out" devices.
- FACT: patents are an explicit deterrent to open implementation. `inferno`'s README:
  *"Dante uses technology patented by Audinate. This source code may use these patents
  too. Consult a lawyer if you want to: make money of it; distribute binaries in (or
  from) a region where software patents apply."* It adds that the project "makes no claim
  to be either authorized or approved by Audinate."
  <https://github.com/teodly/inferno>
- FACT (open question, unanswered): **Dante Domain Manager appears to close the door on
  open tooling entirely.** `netaudio` #28 "Domain Login" (opened 21 Dec 2024 by
  `dlemmink`) asks whether login to DDM resources can be enabled. **It is still open with
  no answer as of this pass** — twenty months later.
  <https://github.com/chris-ritsen/network-audio-controller/issues/28>
  INFERENCE: enrolling devices in a DDM domain moves them behind an authentication layer
  that community tooling cannot cross, so the more a facility invests in DDM the fewer
  third-party options it retains. Well-supported by the unanswered issue, but not stated
  as fact by any vendor page read this session.

**OFFLINE**

- FACT: Dante Controller is discovery-driven. Every tool in the corpus that talks to
  Dante does so by mDNS discovery on a live network (`netaudio`, `inferno`, the Companion
  module's "poll interval time to discover from network" and "response time before
  considering a device offline" settings). There is no evidence of an offline design mode.
  <https://raw.githubusercontent.com/bitfocus/companion-module-audinate-dantecontroller/main/companion/HELP.md>
- FACT with an offline sting: the one declarative, pre-network artefact Audinate offers —
  the preset — is produced by a **web-based** preset creator (`netaudio` #48). Planning a
  Dante network before the hardware is on a bench therefore means a browser and an
  internet connection.
- INFERENCE: there is no way to design a Dante patch on a train. This is the clearest
  product-shaped gap in the segment.

**INTEGRATION PROBLEMS**

- FACT: Dante control from third-party software is measurably unreliable *because* it is
  reverse-engineered. Companion module #46 (23 May 2026, open): devices will not stay
  connected on macOS 15.7.4 / Companion 4.3.3 / module 1.1.2, on a single-switch isolated
  Dante network, while the official app holds them fine. Related open issues: #32 cannot
  make crosspoints on video connections (6 Mar 2026), #44 module not recognised as a
  router in Companion's Buttons (15 Apr 2026). Recently closed but telling: #23 module
  disconnects and won't reconnect on reboot, #22 Make Crosspoint does not take variables,
  #20 module doesn't accept new IP settings when the network changes, #21 crosspoint
  dropdown does not update source channel names.
  <https://github.com/bitfocus/companion-module-audinate-dantecontroller/issues>
  Frequency: **recurring**, concentrated in one module but from multiple reporters.
- FACT: Studio Technologies' Dante comm systems were flagged in Companion's request
  tracker with a **"Missing documentation"** label — even Dante-connected *hardware*
  from third parties often ships without a published control protocol.
  <https://github.com/bitfocus/companion-module-requests> (#1614, 14 Sep 2024)

---

### Hive (christophe-calmejane, GPL-3.0 / LGPL)

The best-documented ATDECC/Milan controller in existence, and a well-maintained project —
which makes its open backlog unusually honest evidence.

FACT: 150 stars, 20 forks, 1,673 commits on `dev`, **37 open issues**.
<https://github.com/christophe-calmejane/Hive>

**STRENGTHS**

- Genuinely cross-platform: macOS 12+ (Intel and Apple Silicon), Windows, Linux.
- Actively maintained by a named maintainer who files his own bugs against his own
  product (#186, #177, #175, #173, #169, #162 are all authored by
  `christophe-calmejane`), and who publishes a public TODO — rare candour.
- Attracts real vendor engagement: issues are filed by `romain-henriet-la` (L-Acoustics),
  `Florob`, `AMextdbaudio`, `elykdurno` — i.e. by people using it on real gear.

**WEAKNESSES**

- FACT: **no redundancy support.** Top of the maintainer's own TODO: *"Support multiple
  eth interfaces at the same time to support redundancy."*
  <https://raw.githubusercontent.com/christophe-calmejane/Hive/main/TODO.md>
  This matters because AVB/Milan deployments are routinely dual-network, and the
  reference controller cannot see both at once.
- FACT: known correctness bugs listed by the maintainer himself in TODO.md —
  GroupName string corruption with certain Unicode characters; talker stream status
  changing incorrectly when listeners connect; the protocol interface loading multiple
  times at startup.
- FACT: entities appearing on more than one network are not merged — TODO asks to
  "aggregate entities sharing the same EID across networks."
- FACT: ghost connections. TODO: improve "StreamOutput connection list display and ghost
  connection clearing." An open issue, #171 "Output Dynamic Mappings Changing"
  (14 Jun 2024), reports mappings changing underneath the user.

**MISSING FEATURES (user requests)**

- **A REST API / headless controller — the longest-standing request in the segment.**
  Issue #84, opened **7 March 2020** by `elabbing`, still open six and a half years later,
  parked on a "Release 2.0" milestone, with 16 comments. The ask: an AVDECC controller
  running as a web server on a master node, exposing listener/talker counts and states
  and stream control over REST so a network can be managed from any browser and by
  non-specialists. <https://github.com/christophe-calmejane/Hive/issues/84>
  This is the single highest-signal feature request found in the whole pass: six years
  open, on the segment's flagship OSS tool, with a clear stated use case.
- Bulk operations: TODO asks for "Start/Stop all Streams."
- Query an entity's IP address — #64, open since 29 May 2019.
- Make use of the `AS_Capable` flag — #40, open since 22 Nov 2018.
- Auto-set listener stream format on connect — #169 (24 Apr 2024).
- Indicate existing mappings in the STREAM_PORT_OUTPUT mappings editor — #163
  (19 Oct 2023, `Florob`).

**UX PROBLEMS**

- FACT: **the connection matrix and the mapping editor are the recurring sore spot**, and
  the complaints span 2018 to 2024 without resolution:
  - #33 "Improve mappings editing window" (5 Oct 2018) — labels: enhancement, UI.
  - #52 "Possibility to resize the connection matrix headers" (5 Mar 2019) — UI.
  - #110 "Alternate view for dynamic mapping" (24 Nov 2021).
  - #111 "Improve navigation from matrix to inspectors" (13 Dec 2021) — enhancement, UI.
  - #163 mapping-editor visibility of existing mappings (2023).
  - #159 "Can't open dynamic mappings editor" (closed in 1.3.1, May 2024).
  - TODO: better Connection Matrix error visualisation via colour coding and tooltips;
    consider splitting the matrix for normal vs CRF streams.

  Frequency: **recurring**, and structurally interesting — the matrix works for small
  networks and degrades as the network grows. Seven separate items, six-year span, one
  product.
  <https://github.com/christophe-calmejane/Hive/issues?q=is%3Aissue+is%3Aopen>
- FACT: #67 (26 Jul 2019) asks merely for the interface combo box to turn red when the
  interface is not connected — basic state legibility, open seven years.
- FACT: #17 "Prevent multiple instances of Hive to run at the same time" (6 Aug 2018) —
  users are running two copies and confusing themselves.
- FACT: #162 "Stripes not correctly showing on macOS" (17 Oct 2023) — row striping, a
  readability aid in a dense matrix, is broken on macOS; milestoned for 1.4.1.

**PERFORMANCE PROBLEMS**

- FACT: crashes are frequent enough to warrant infrastructure. #170 "Hive crash at the end
  of the updates" (10 Jun 2024, labelled `bug`, milestone 1.4.1); #173 "Migrate crash
  reporter" (6 Aug 2024); and the TODO item "auto-save log files during crashes."
  A project that plans for crash-time log preservation is a project that crashes.
  Frequency: **recurring**.
- FACT: #167 "Issues with integral control value types exceeding `int`" (28 Feb 2024,
  `Florob`) — a numeric range bug in control values.

**PRICING PROBLEMS**

- None. GPL-3.0 with LGPL components, free. This is a strength, not a pain point.

**LOCK-IN**

- Minimal, and deliberately so: exports to `.aem`/JSON/MessagePack, a `.hej` event journal
  with CSV export, and JSON virtual entities. This is the *counter-example* in the segment.

**OFFLINE**

- FACT: partially solved, and this is Hive's most under-appreciated feature — JSON
  **virtual entities** let a controller be exercised against a described network with no
  hardware present. LA_avdecc has matching work: #159 "Support configuration change for
  virtual entities" (13 Nov 2024) and #136 "Add a new controller event for virtual entity
  replacement" (1 Sep 2023) — both **open**, so virtual-entity workflows are still
  incomplete on the library side. #175 (9 Sep 2024) asks that loading a dump zero the
  clearable error counters so errors are immediately visible — an offline-analysis
  ergonomics gap.

**INTEGRATION PROBLEMS**

- FACT: **no API at all** — see #84 above. Hive is a GUI, full stop. Nothing can drive it.
- FACT: **privileged raw network access is required on every platform** and this is real
  deployment friction: macOS needs a `ChmodBPF.pkg` install (unless Wireshark or
  LANetworkManager already put it there), Linux needs `setcap cap_net_raw+ep`, and all
  platforms need pcap/npcap. <https://github.com/christophe-calmejane/Hive>
  INFERENCE: on a managed corporate or venue laptop where the user is not an
  administrator, Hive cannot be run at all. Reasonable but unverified by a user report.

---

### LA_avdecc (L-Acoustics, LGPL-3.0 / GPL-3.0)

The library Hive and L-Acoustics Network Manager 2.5+ both sit on. C++17, Windows/Linux/
macOS, Milan-compliant, 112 stars, **39 open issues**.
<https://github.com/L-Acoustics/avdecc>

**STRENGTHS**

- Conceded by everyone: this is *the* cross-vendor IEEE 1722.1 stack, tested against
  L-Acoustics, Meyer, d&b, Biamp, Avid, MOTU, QSC and Apple entities. Nothing else exists
  at this level of openness.
- Dual LGPL/GPL licensing means it can be embedded commercially under LGPL terms.
- macOS gets a native Apple-API protocol path rather than only pcap.

**WEAKNESSES**

- FACT: **a very old, very stable backlog.** Of the open issues, #22 dates to 26 Jul 2018,
  #35 to 7 Sep 2018, #38 to 5 Oct 2018, #40 to 8 Oct 2018, #43 to 9 Nov 2018, #44 to
  21 Nov 2018, #45 to 6 Dec 2018, #47 to 25 Jan 2019, #48 to 1 Feb 2019, #49 to
  6 Feb 2019, #53 to 7 Mar 2019, #56 to 9 May 2019. **Twelve issues have been open for
  seven years or more**, including two labelled `bug`.
  <https://github.com/L-Acoustics/avdecc/issues?q=is%3Aissue+is%3Aopen&page=2>
  INFERENCE: the library is maintained for L-Acoustics' own needs first; anything outside
  that path ages indefinitely. Frequency: **recurring** and evidenced purely by dates.
- FACT: platform-specific correctness gaps persist. #177 "crash when unplugging network
  interface using MacOsNative" (18 Mar 2025) — pulling a cable crashes the process.
  #144 "GET_DYNAMIC_INFO deserialization fails with macOS Native protocol"
  (20 Nov 2023). #40 "[macOS] ControllerEntity is not receiving ControllerAvailable
  commands" (8 Oct 2018, `bug`, still open).
- FACT: **authentication is unimplemented territory.** #49 "Properly handle
  NOT_AUTHENTICATED status" has been open since 6 Feb 2019. Frequency: isolated, but
  significant — it means secured AVDECC entities are not properly handled by the
  reference stack.
- FACT: #56 "Completion handler should always be called from another thread" (9 May 2019,
  `bug`) — a threading contract issue open seven years, the kind that produces
  hard-to-reproduce deadlocks in dependent applications.

**MISSING FEATURES**

- Dump the AEM tree to a file — #173 (14 Mar 2025). Users want the model out of the tool.
- An API to check entities for spec violations — #123 (26 Dec 2022). Practitioners want
  the library to *tell them which vendor's box is non-compliant*.
- Multicast group joins instead of promiscuous mode — #201 (19 Jun 2026). Promiscuous
  mode is what forces the elevated-privileges requirement downstream in Hive.
- Support for `CONTROLS` in `AVB_INTERFACE` — #127 (7 Feb 2023).
- An `EndStation` with multiple protocol interfaces — #133 (13 Jul 2023): the
  library-level counterpart of Hive's missing redundancy.
- A dedicated Milan layer in the logger — #48 (1 Feb 2019).
- Selective enumeration ("only retrieve specific info") — #38 (5 Oct 2018).
  INFERENCE: that request exists because full enumeration of a large network is slow.

**UX PROBLEMS** — N/A, it is a library.

**PERFORMANCE PROBLEMS**

- INFERENCE only, from #38 (selective enumeration) and Hive's parallel wish to display
  dynamic information separately. Nothing measured. **UNKNOWN.**

**PRICING PROBLEMS** — none, open source.

**LOCK-IN** — none; this is the anti-lock-in asset of the segment.

**OFFLINE**

- FACT: virtual entities and AEMXML preloading exist, but the virtual-entity workflow is
  incomplete (#159 and #136 both open). Offline work is possible but second-class.

**INTEGRATION PROBLEMS**

- FACT: Windows requires the WinPcap Developer's Pack 4.1.2 or npcap; Linux requires
  libpcap. Promiscuous-mode capture (#201) is the root of the privilege problem.
- FACT: cross-vendor conformance is the real integration cost. Issue #145 "Move some IEEE
  compatibility errors" (23 Nov 2023) and #123's request for a spec-violation API both
  say the same thing: the library spends effort classifying *other vendors' deviations
  from the standard*. Corroborated independently at `scrambletools/ESP-AVB-Endpoint` #2
  (22 May 2026, 7 comments), where a developer's Milan-compliant CRF clock format still
  will not interoperate with MOTU UltraLite AVB hardware.
  Frequency: **recurring**. "Milan-compliant" does not mean "will work with the other
  vendor's Milan-compliant box."

---

### netaudio / network-audio-controller (chris-ritsen, OSS)

Dante control without Dante Controller. Python 3.9+, needs a Rust toolchain from source.
12 open issues.

**STRENGTHS**

- FACT: it is the **only** open Dante control path, and the ecosystem knows it — the
  Bitfocus Companion Dante module is built on it.
  <https://raw.githubusercontent.com/bitfocus/companion-module-audinate-dantecontroller/main/companion/HELP.md>
- FACT: its wiki is the only public byte-level Dante reference in existence: mDNS service
  types, ports 24440/4455/4440/8800/8700, request/response packet layout, and commands for
  device name, channel name, encoding, gain level, latency, sample rate, reboot and channel
  counts. <https://github.com/chris-ritsen/network-audio-controller/wiki/Technical-details>
- Stated goal is exactly the gap: everything Dante Controller does "that would be useful
  for control of the devices from a command-line interface or within scripts."

**WEAKNESSES**

- FACT, from the author himself: *"it's not ready for anything other than a test
  environment"* and *"this is early, so expect things to break or switches to change."*
  <https://raw.githubusercontent.com/chris-ritsen/network-audio-controller/master/README.md>
- FACT: the protocol knowledge is admittedly incomplete and possibly wrong — see the
  wiki's own "guesswork ... likely to be wrong or unreliable" caveat, and its several
  sections (Channel name, Encoding, Gain level, Reboot device, Device information) left
  unfinished.
- FACT: per-vendor field semantics do not hold. #53 (29 Aug 2026):
  `TRANSMITTER_FLOW_STATUS_RECORD_CHANNEL_COUNT` at offset 8 does not hold a channel count
  on Biamp Tesira hardware. #52 (29 Aug 2026): page parsers reject `0x8112` (MORE_PAGES),
  making pages `0x3400` and `0x2400` unreadable on Biamp Tesira. Two same-day issues
  against one vendor's hardware — reverse engineering generalises badly.
- FACT: plain data bugs — #47 "gateway and dns fields reversed" (1 Apr 2026);
  #30 KeyError when getting a subscription list (20 Mar 2025); #27 channel list not
  displaying all channels (18 Oct 2024).
- FACT: #26 "Lots of drops connection trouble" (11 Oct 2024) and #43 "zeroconf: Error with
  socket" (18 Feb 2026) — discovery/transport instability.

**MISSING FEATURES** — see the Dante section: presets (#48), latency get/set (#49),
multicast IP and RTP payload (#40), DDM login (#28).

**UX PROBLEMS** — CLI with JSON output; #37 (21 Jul 2025) reports that addressing devices
by "host" or "channel number" fails on add/remove, so the ergonomic addressing modes are
the broken ones.

**PERFORMANCE PROBLEMS** — UNKNOWN.

**PRICING PROBLEMS** — none.

**LOCK-IN** — none, but it inherits Dante's patent exposure question.

**OFFLINE** — FACT: discovery-driven, so no. Nothing suggests an offline model.

**INTEGRATION PROBLEMS**

- FACT: **DDM is the wall.** #28 "Domain Login" open and unanswered since 21 Dec 2024.

---

### Q-SYS Designer (QSC)

Evidence here is thin — `q-syshelp.qsc.com` was blocked and the GitHub searches for Q-SYS
returned mostly keyword noise. What follows is what the QRC client library actually shows.

**STRENGTHS**

- FACT, and notable in this segment: **Q-SYS has a real, documented external control API
  (QRC) that third parties can and do build on.** A working Bitfocus Companion module
  exists — `companion-module-qsys-remote-control` — and, tellingly, **it currently has
  zero open issues**, with twelve issues closed.
  <https://github.com/bitfocus/companion-module-qsys-remote-control/issues>
  Compare Dante, whose Companion request was closed as "No external protocol."
  This is the strongest single contrast in the dossier.

**WEAKNESSES / INTEGRATION PROBLEMS**

- FACT: the QRC wire format has a well-known trap — #2 "JSON RPC 2.0 commands not null
  terminated" (closed 17 Apr 2024). QRC frames JSON-RPC with a null terminator, and
  clients that assume plain JSON-RPC fail.
- FACT: authentication surprises integrators — #58 `{"code":10,"message":"Logon required"}`
  (closed 23 Jan 2026). A Core configured with credentials silently refuses control until
  the client logs on.
- FACT: specific control endpoints misbehave — #26 `Mixer.SetInputMute`/`SetOutputMute`
  commands failing (closed 23 Apr 2025); #14 error messages for `Control.set`
  (closed 9 Oct 2023); #5 text-box readback (closed 17 Apr 2025); #10 `Control.toggle`
  (closed 23 Apr 2025).
- FACT: feedback reliability — #75 "[BUG] feedback broken" (closed 7 May 2026); #29
  feedback not working for boolean "True" under Companion 3.4.3 (closed 23 Apr 2025).
- FACT: redundancy reporting is untrustworthy — #44 "False 'Redundancy Compromised'
  Warning" (closed 25 Nov 2025).
- FACT: stability — #52 "QSys Remote continually crashing" (closed 19 Dec 2025); #9
  "Crash" (closed 3 Jul 2023).
- Frequency: **recurring** but *all closed*. The honest read is that QRC is a working API
  with sharp edges that get filed and fixed — a materially healthier picture than Dante's.

**MISSING FEATURES / UX / PERFORMANCE / PRICING / LOCK-IN / OFFLINE**

- **UNKNOWN.** Q-SYS Designer is a large desktop design tool with a well-known
  feature-licensing model (per-Core feature licences, scripting licences) and a
  well-known offline "emulate" mode, but **none of that was verifiable this session** and
  none of it is asserted here.
  **To verify:** `q-syshelp.qsc.com` release notes and "What's New", the Q-SYS feature
  licence matrix page, and the Q-SYS Communities forum.

---

### Shure Wireless Workbench (WWB)

**STRENGTHS**

- FACT, conceded by a competing tool's users: **WWB's live metering is fast.** Bitfocus
  Companion issue #27, "Meters are very slow compared to WWB" (closed 10 Dec 2023) — WWB
  is the performance benchmark that third-party monitoring is measured against and found
  wanting. <https://github.com/bitfocus/companion-module-shure-wireless/issues>
- FACT: WWB is the destination format for the whole RF workflow — the spectrum-analyser
  project `wireless-microphone-analyzer` treats "import the scan to Wireless Workbench"
  as the normal end of a scanning session, and RF practitioners describe scanning with an
  RF Explorer for a long window and then importing into WWB.
  <https://github.com/berkon/wireless-microphone-analyzer/issues>
- FACT: it has a **coordination report CSV** that a reverse-engineering project calls
  "the best source for what am I actually using," because it shows primary vs backup
  frequency selections across RF zones explicitly.
  <https://github.com/stoatworks-labs/wsm-wwb-bridge> (README)

**WEAKNESSES**

- FACT: **the import path is brittle enough that third-party scan data simply bounces.**
  `berkon/wireless-microphone-analyzer` #40, "Can't export to wwb6 or 7" (16 Jan 2024,
  reporter `EMLGVS`): files generated by the analyser *"can't be read when trying to be
  imported to shure workbench"*, with a screenshot of the error.
  <https://github.com/berkon/wireless-microphone-analyzer/issues/40>
- FACT: `.shw`/`.cws` XML is complex and interdependent enough that an independent
  implementer **deliberately refused to write it**: "writing back out is intentionally not
  implemented" to avoid corrupting the file. A second project calls its experimental
  `.shw` writer "reverse-engineered from a single real WWB7 file and unvalidated by Shure."
  <https://github.com/stoatworks-labs/wsm-wwb-bridge>,
  <https://github.com/stoatworks-labs/RFutils>
- FACT: the only *safe* interchange path into WWB is a bare frequency list — a list of MHz
  values carrying no names, no groups, no zones. Both independent projects converge on this
  as "the safest export option."
  Frequency: **recurring** (two projects, plus an independent user's failed import).

**MISSING FEATURES (what users request)**

- A working, documented import of third-party spectrum scans (WMA #40).
- FACT: device support always lags the catalogue — Companion module #56 "Add support for
  the new ANX4" (open, 21 Jan 2026) and #54 "Can you add support for SLXD4Q+" (open,
  14 Jun 2025); `micboard` #47 "Add support for SLXD devices" (open, 26 Jan 2025).
  Frequency: **recurring**, three requests across two independent projects.

**UX PROBLEMS** — **UNKNOWN.** `service.shure.com` and every forum were blocked. No
first-hand WWB GUI critique was read. Do not guess.

**PERFORMANCE PROBLEMS** — no evidence of WWB being slow; the evidence points the other
way (see #27 above).

**PRICING PROBLEMS** — WWB is free of charge as far as the segment treats it, but **no
price page was read** and nothing is asserted.

**LOCK-IN**

- FACT: neither Shure nor Sennheiser publishes full format specs. RFutils' README states
  it directly: *"Several of the underlying formats and protocols are reverse-engineered
  from real exports and vendor gear rather than official schemas (neither Shure nor
  Sennheiser publish full specs for most of these)."*
  <https://github.com/stoatworks-labs/RFutils>
- FACT: the escape hatch is lossy by construction — a bare MHz list is the reliable export,
  which discards exactly the metadata (channel names, groups, zones, backup assignments)
  that makes a coordination reusable.

**OFFLINE**

- FACT: WWB's file formats are files; the coordination work is offline-capable. Live
  device deployment is the online part. FACT: the only live-programming path a third-party
  project found is **Shure command strings on TCP port 2202**, and even there RFutils ships
  it dry-run-by-default with the warning that "Live programming is experimental and
  untested against hardware; only Shure command-strings channels are live-programmable."

**INTEGRATION PROBLEMS**

- FACT: no published API; port 2202 command strings are the de-facto interface.
- FACT: even that interface has gaps — Companion module #30 "Variable Problems with Shure
  Axient" open since 29 Dec 2023, and closed issues #17 (couldn't trigger from RF levels,
  Dec 2023), #11 (QLX-D no feedback, Nov 2021), #14 (QLX-D TX-off status delay, Feb 2023).
  Telemetry that exists in WWB is hard to get out to anything else.

---

### Sennheiser Wireless Systems Manager (WSM)

**STRENGTHS**

- FACT: WSM's **HTML coordination report** carries real per-channel frequencies and was
  verified against `.wsm` project files by an independent implementer — so at least one
  export is trustworthy. <https://github.com/stoatworks-labs/wsm-wwb-bridge>

**WEAKNESSES**

- FACT: **the `.wsm` file contains a decoy field, and it is the obvious one.**
  `CurrentFrequency` "sat at the receiver's default ... didn't reflect the coordination
  result at all," while `AllocatedFrequency` "matched the real result." Any integrator
  reading the field with the intuitive name gets wrong frequencies, silently.
  <https://github.com/stoatworks-labs/wsm-wwb-bridge>
  This is the most concrete, most dangerous data-model trap found in the entire pass.
- FACT: the "Frequencies/Bands" CSV is a **candidate pool**, not per-channel coordinated
  output — "not something you'd drag-allocate." A second export that looks like an answer
  and isn't.
- FACT: the CSV is **German-locale formatted**, and this actively breaks interchange.
  `wireless-microphone-analyzer` #43 (18 Jun 2024, closed) is a user asking for an export
  option using comma as decimal separator and semicolon as field delimiter *specifically*
  so WSM will read it. A tool with a standards-compliant CSV writer cannot feed WSM.
  <https://github.com/berkon/wireless-microphone-analyzer/issues/43>
  Frequency: **isolated** as filed, but structurally certain to affect every
  non-German-locale integrator.
- FACT: no published schema (RFutils README, quoted above).

**MISSING FEATURES** — beyond a documented export: FACT, Sennheiser's SSC control protocol
support in the one open project attempting it is "a skeleton," and the project's monitor
discovery adapters "have not been validated against real receivers."
<https://github.com/stoatworks-labs/RFutils>

**UX PROBLEMS / PERFORMANCE PROBLEMS / PRICING PROBLEMS** — **UNKNOWN.** No reachable
source. GitHub searches for Sennheiser WSM returned only Sennheiser *hardware* mentions
(headsets in unrelated Proton/Godot/SteamOS issues), no software complaints at all.

**LOCK-IN**

- FACT: no published schema; the reliable interchange target is again a bare frequency /
  candidate-pool list. Live control is file-based: RFutils reports that "Sennheiser and
  AES67 channels export files for offline programming rather than supporting live control."

**OFFLINE** — FACT: file-based, so offline-capable; that is genuinely a strength here.

**INTEGRATION PROBLEMS** — FACT: WSM and WWB do not interoperate natively at all. An
entire MIT-licensed project (`wsm-wwb-bridge`) exists solely to move coordination data
between two vendors' wireless mic tools, and it had to reverse-engineer both ends.

---

### RFutils, wsm-wwb-bridge, Dante-BabelBox (stoatworks-labs)

**Weight these carefully.** FACT: these are very small projects — RFutils 2 stars,
Dante-BabelBox 3 stars, within an org of 132 repositories. They have **no user base and
therefore no user complaints**. Their value in this pass is as *documentation of the
segment's structural problems*, written by someone who did the reverse engineering, and
their READMEs are unusually candid about their own limits.

**STRENGTHS**

- FACT: RFutils is the only open end-to-end RF chain found: convert (Shure `.shw`/`.cws`
  XML, Sennheiser `.wsm`, WSM HTML reports, CSVs, Ofcom PMSE PDFs) → coordinate → inventory
  → allocate → deploy. Its coordination engine honours per-model, per-mode spacing (the
  README's worked example: "Shure Axient Digital wants 350 kHz in standard mode and 125 kHz
  in High Density"), excludes 3rd-order (`2·f1−f2`) and optionally 5th-order intermod,
  honours band gaps in discontiguous allocations, applies wider spacing between different
  radio models in mixed rigs, respects per-model tuning rasters, and is **seeded and
  deterministic** so a coordination is reproducible.
- FACT: `wsm-wwb-bridge` is fully offline, file-in/file-out, MIT.

**WEAKNESSES (self-declared, which is the honest kind)**

- "The `.shw` show file is reverse-engineered from a single real WWB7 file and unvalidated
  by Shure."
- Monitor discovery adapters "have not been validated against real receivers."
- Sennheiser SSC is "a skeleton."
- Dante-BabelBox: Yamaha CL/QL/DM7 and Allen & Heath Qu/SQ preamp control are
  undocumented; the Lectrosonics adapter uses "a placeholder wire format" explicitly
  flagged as unverified; the Yamaha R-series `MBC`-over-ConMon adapter has a proven wire
  format ("the stagebox accepted it and changed its gain") but the adapter code itself is
  untested against hardware.
- The blanket disclaimer: "Verify every export against your own WWB/WSM install, and check
  experimental outputs carefully, before relying on any of this for a live show."

**MISSING FEATURES / MISSING PROTOCOLS — the map of what nobody can control**

- FACT: **Wisycom, Sony DWX, Sound Devices, MiPro and Lectrosonics protocols remain
  proprietary and undocumented.** RFutils' framework is written but waits on Wireshark
  captures. This is the clearest inventory anywhere of which RF vendors are simply closed.
  <https://github.com/stoatworks-labs/RFutils>
- FACT: a browser-based architecture hits a hard wall: "A browser can't join a
  Dante/AES67 multicast group directly," forcing a server-side relay for audio cueing.
  Relevant to anyone considering a web-first design in this segment.

**LOCK-IN / OFFLINE / PRICING** — none; open source, offline by design.

---

### Wireless Microphone Analyzer (berkon, OSS)

RF Explorer / tinySA spectrum front end. Its real asset is versioned JSON data: vendor
band plans, forbidden bands by country, TV grids, channel presets.

**STRENGTHS**

- FACT: **the band-plan data is genuinely crowdsourced and alive.** Issue #2, "Contribute
  country/vendor specific frequency information here," has been open since 2 Feb 2019 with
  **25 comments** — the highest-engagement RF issue found in the pass. Practitioners are
  volunteering regional frequency and manufacturer data continuously.
  <https://github.com/berkon/wireless-microphone-analyzer/issues>
  INFERENCE: regulatory/band-plan data is a maintenance burden no single vendor solves
  well, and users will crowdsource it if given a place to put it. That is a design lesson.

**WEAKNESSES**

- FACT: hardware connection stability — #12 "Stops connecting to RF Explorer"
  (4 May 2023, closed).
- FACT: state-refresh bug — #42 "Restart needed to display new band" (6 Jun 2024, closed).
  A new band plan does not appear until the app is restarted.
- FACT: #29 "Java Script Error" (8 May 2023), #33 "Scan Resolution" (18 May 2023).

**MISSING FEATURES (requested)**

- FACT: **export into vendor coordination tools is the top request theme** — #40 export to
  WWB6/7 (failed import), #43 WSM-compatible CSV (locale-formatted). Both are integration
  requests, not analysis requests. Users do not want the analyser to coordinate; they want
  its scan to *land* in WWB or WSM.
- FACT: hardware breadth — #34 "Can you add support for tinySA?" (6 Jan 2024),
  #1 Sennheiser ew 100/300/500 G3 A-Band (1 Feb 2019), #20 IoT module compatibility
  (1 Oct 2021).
- FACT: #3 "saving tracings" (15 Mar 2019) — users want to persist and compare scans over
  time. INFERENCE: comparing a scan taken at load-in against one taken at doors is a real
  workflow with no obvious tool.

**PRICING / LOCK-IN / OFFLINE** — free, open, offline; the JSON data is versioned and
portable. No pain points.

---

### AES67 Linux Daemon (bondagit, GPL)

A fully open AES67 endpoint with a clean REST API, SAP + mDNS discovery, NMOS IS-04/IS-05
from v4.x, ST 2022-7 dual-path from v3.0. 14 open issues.
<https://github.com/bondagit/aes67-linux-daemon>

**STRENGTHS**

- FACT: **it has the REST API that Hive has been asked for since 2020.** Up to 64
  multicast/unicast sources and sinks, controllable programmatically, plus a React WebUI
  on port 8080.
- FACT: real standards breadth — SAP (AES67) *and* mDNS (Ravenna) discovery, RTSP
  DESCRIBE/ANNOUNCE for SDP handling, NMOS IS-04/IS-05 behind `-DWITH_NMOS=ON`,
  ST 2022-7 dual-interface redundancy with automatic master-clock election, HTTP AAC-LC
  streaming of sinks, systemd watchdog integration.
- FACT: wide sample-rate support: 44.1/48/88.2/96/176.4/192/352.8/384 kHz.

**WEAKNESSES**

- FACT: **PTP lock is an absolute gate.** From the README: "Receiving or sending audio via
  the ALSA RAVENNA device is only possible if the PTP slave status is locked." When PTP
  does not lock, nothing works — see #223 (5 Aug 2025, 11 comments), PTP stuck "Unlocked"
  on a Pi 5 under Ubuntu 25.04 / kernel 6.14, with no audio to a Dante device.
- FACT: the host OS fights it. Documented known issues: PulseAudio must be disabled or
  uninstalled; **CPU frequency scaling causes "unexpected distortions"** and needs kernel
  parameter changes; Linux 5.10+ needs `kernel.sched_rt_runtime_us=1000000` for the
  real-time scheduler. Frequency: **recurring** — these are the maintainer's own list.
- FACT: interop is the persistent theme in the issue tracker, and it is bidirectional:
  #217 AES67→Dante distortion (12 May 2025, open), #144 "Lawo ravenna streams not
  receiving" (29 Sep 2023, open), #137 no sound with Hasseb Audio over Ethernet Pro
  (19 Jul 2023, open), #38 "Compatibility with DAW tools" (25 Apr 2021, **34 comments** —
  the highest-comment issue in the repo, about a Yamaha Dante interface in AES67 mode
  showing a blank webUI and no SAP announcements, with the reporter explicitly asking for
  better documentation), #40 "Compatible devices" (14 May 2021, **30 comments**).
  Frequency: **widespread within the AES67 world**. Two of the repo's three
  highest-engagement issues are people asking "will this actually talk to my box?"
- FACT: latency/stability — #17 "Occasional drops detected in output RTP stream"
  (2 Aug 2020, 32 comments), #53 "end to end latency over 50ms" (Dec 2021), #79 latency
  test failures on kernel 5.10.0x (Nov 2022), #122 ALSA kernel panic at 96 kHz.
- FACT: platform floor is high — Ubuntu 18.04+, kernel 4.10+, GCC 7+, CMake 3.7+, and
  the practical minimum end-to-end latency is platform-dependent (5–8 ms on the
  maintainer's reference hardware).

**MISSING FEATURES (requested)**

- FACT: #170 "AES67 Player for Android" (25 Jul 2024, open) — no mobile client exists.
- FACT: #148 PipeWire compatibility (5 Dec 2023), #210 Ravenna with JACK (27 Apr 2025),
  #8 (in `inferno`) JACK integration — the modern Linux audio stack integration is
  incomplete across the board.
- FACT: #251 lower minimum driver latency, supporting 6/12/16-frame configurations
  (22 Mar 2026, open).
- FACT: #249 systemd service does not terminate cleanly on reboot/shutdown (17 Mar 2026).
- FACT: #83 "Documentation: simple driver2driver network test" — open since 13 May 2022.
  Frequency of "documentation is the ask": **recurring** (#83, #38, #40, #107, #198).

**PRICING / LOCK-IN** — free, GPL, SDP/SAP/NMOS standards throughout. No lock-in.

**OFFLINE** — FACT: entirely local; no cloud dependency anywhere. Genuine strength.

---

### Discovery not in the landscape pass: `teodly/inferno`

Worth flagging because **it has more stars than any other project in this segment**
(322, vs Hive 150, micboard 117, LA_avdecc 112). An unofficial Dante protocol
implementation in Rust for Linux x86_64 and aarch64, tested on Raspberry Pi 5, Pi 4 and
Pi Zero 2 W, described by its author as "highly experimental ... I don't recommend using
it for serious purposes," yet characterised elsewhere as alpha-but-used-in-production.

Its **known limitations** are a precise map of what is hard about Dante:

- FACT: "Dante protocol is undocumented. Everything was reverse-engineered."
- FACT: channel names cannot be changed without confusing Dante Controller.
- FACT: unicast only — no multicast flows.
- FACT: clocking depends on incoming media flows, so recording *pauses when nothing is
  connected*.
- FACT: a default OS routing-table entry is mandatory at startup.
- FACT: the patent disclaimer quoted in the Dante section above.
- Open issues: #13 "All audio packets are late on 32-bit CPUs" (3 Oct 2025), #23 "No clock
  available" (20 Jan 2026), #41 audio corruption on Dante route disconnect (17 Apr 2026),
  #3 Windows compatibility (9 Jan 2025), #1 "Documentation?" (open since 31 May 2024),
  #2 UI for the virtual soundcard (28 Sep 2024).
  <https://github.com/teodly/inferno/issues>

INFERENCE: 322 stars for an explicitly-not-recommended alpha is a demand signal, not a
quality signal. People want Dante on hardware and operating systems Audinate does not
serve, badly enough to run something its own author warns them off.

---

## Cross-product patterns

These are the complaints that repeat across **multiple unrelated vendors and projects**.
They are the most valuable output of this pass.

### 1. The control plane is missing, everywhere — and every vendor privatises it separately
**Frequency: widespread.** Dante moves audio and does mDNS discovery and stops there
(Dante-BabelBox README). AES67 moves audio and does SAP/mDNS discovery and stops there.
On top of that same wire, every vendor bolts on its own private protocol for the things
operators actually touch — preamp gain, phantom power, wireless-mic telemetry: OSC for
Behringer/Midas and Yamaha DM3, NRPN-over-TCP for Allen & Heath, `MBC`-over-ConMon for
Yamaha R-series, MIDI SysEx for Aphex, TCP command strings on port 2202 for Shure, SSC for
Sennheiser, and nothing at all for Wisycom, Sony DWX, Sound Devices, MiPro and
Lectrosonics. AES70/OCA is the one standard that solves this — and the reason it works is
architectural: as Dante-BabelBox notes, "the device's objects, classes and names are
discovered at runtime, so there is no vendor ONo map to be wrong." Everything else needs a
per-vendor mapping table that is wrong the moment firmware ships.
**Sources:** Dante-BabelBox README, RFutils README, companion-module-shure-wireless issues.

### 2. Reverse engineering is the *normal* integration method, and it degrades per-vendor
**Frequency: widespread.** netaudio, inferno, wsm-wwb-bridge, RFutils and the Bitfocus
Dante module are all reverse-engineered, and all five say so in writing. The predictable
consequence is that the knowledge does not generalise: netaudio's Dante field offsets that
work elsewhere fail on Biamp Tesira (#52, #53, both filed the same day); RFutils' `.shw`
writer is derived "from a single real WWB7 file"; Dante-BabelBox's Lectrosonics adapter is
a "placeholder wire format." Every one of these projects carries a "verify before you
trust it on a show" warning. **The integration tax in this segment is not paid in
engineering hours; it is paid in uncertainty at showtime.**

### 3. "Standards-compliant" does not mean "interoperable"
**Frequency: widespread.** A Milan-compliant CRF clock format still fails against MOTU
UltraLite AVB (`ESP-AVB-Endpoint` #2). AES67 audio arrives at a Dante network as
"crunchy trash" (`aes67-linux-daemon` #217). Lawo Ravenna streams are not received
(#144). LA_avdecc maintains an entire category of "IEEE compatibility errors" (#145) and
users ask it for an API just to *identify which vendor's box is violating the spec*
(#123). The two highest-comment issues in the AES67 daemon repo — #38 (34 comments) and
#40 (30 comments) — are both, at root, "which devices does this actually work with?"
**INFERENCE, strongly supported: the segment's real deliverable is not a design, it is a
compatibility verdict, and nobody sells one.**

### 4. Neither RF vendor publishes a schema, and the only safe interchange is lossy
**Frequency: recurring, with independent corroboration.** RFutils states neither Shure nor
Sennheiser publish full specs. wsm-wwb-bridge refuses to write WWB XML at all rather than
risk corrupting it. The guaranteed import path into WWB is a bare list of MHz values — no
names, no groups, no zones, no primary/backup distinction. And when a third party does
produce a file, it bounces: `wireless-microphone-analyzer` #40, real user, real error
dialog. The data-model traps are savage: WSM's `CurrentFrequency` is a decoy for
`AllocatedFrequency`; WSM's "Frequencies/Bands" CSV is a candidate pool masquerading as an
allocation; WSM's CSV is German-locale (`;` delimiter, `,` decimal) so a correct CSV writer
cannot feed it.

### 5. Discovery-driven tools have no offline mode, and offline is when the work happens
**Frequency: recurring, and this is the clearest product-shaped hole found.** Dante
Controller, netaudio, inferno and the Companion Dante module all begin with mDNS discovery
on a live network. Audinate's one declarative pre-network artefact — the preset — is
authored in a **web** tool, so it needs internet. Hive is the honourable exception with
JSON virtual entities, and even there the underlying library's virtual-entity support is
incomplete (LA_avdecc #159 and #136, both open). **A designer cannot lay out a network
audio system, or an RF coordination against a venue's known spectrum, on a train.** The RF
side is better served here precisely because it is file-based rather than
discovery-based — which is an argument for a file-first data model, not a live-first one.

### 6. Clock is the single point of failure, and the host OS is the enemy
**Frequency: recurring.** "Audio is only possible if the PTP slave status is locked."
PTP stuck Unlocked on a Pi 5 kills everything (#223). CPU frequency scaling produces
"unexpected distortions." PulseAudio must be removed. The RT scheduler needs a kernel
parameter. Inferno cannot clock at all without an incoming media flow, and reports all
packets late on 32-bit CPUs. **INFERENCE: any planning tool for this segment that models
signal flow but not clock topology — leader/follower, boundary clocks, PTP domains,
which switch is the grandmaster — is modelling the half that rarely breaks.**

### 7. Long-open feature requests cluster on exactly two things: an API, and bulk operations
**Frequency: recurring.** The oldest and most-discussed request in the segment is Hive #84
— a REST API — open six and a half years with 16 comments. LA_avdecc has twelve issues
open seven-plus years. Hive's TODO asks for "Start/Stop all Streams." netaudio's whole
reason to exist is "everything Dante Controller can do, from a script." The AES67 daemon,
which *does* have a REST API, is correspondingly the project where integrators build
instead of complain. **The demand is unambiguous: these tools are GUIs when the work is
repetitive.**

### 8. Device support always lags the product catalogue
**Frequency: recurring.** Shure ANX4 (open since Jan 2026), SLXD4Q+ (open since Jun 2025),
SLXD in micboard (open since Jan 2025), AVIO gain in the Dante module (open since
Feb 2026). Three independent projects, same shape. INFERENCE: any tool that hard-codes a
device list inherits a permanent backlog. Data-driven device definitions — the
`wireless-microphone-analyzer` model, where band plans and presets are versioned JSON that
users contribute to (#2, 25 comments, open seven years and still active) — is the only
approach in the corpus that scales.

### 9. Even successful integrations are unreliable at the connection layer
**Frequency: recurring.** The Companion Dante module cannot keep devices connected on a
single-switch isolated network while the official app can (#46); it loses reconnection
after reboot (#23), ignores IP changes (#20), and does not refresh channel names in
dropdowns (#21). The Q-SYS module — against a *documented* API — still produced twelve
issues covering crashes, broken feedback, "Logon required," and false redundancy warnings.
INFERENCE: state synchronisation against live AV devices is genuinely hard, and a planning
tool that also claims live control inherits all of it. Consider keeping the two separable.

### 10. Privilege requirements block the tool before it can even start
**Frequency: recurring, though inferred in effect.** Hive needs ChmodBPF on macOS,
`setcap cap_net_raw+ep` on Linux, npcap on Windows. LA_avdecc needs WinPcap Developer's
Pack 4.1.2 or npcap, and open issue #201 (19 Jun 2026) asks to join multicast groups
instead of using promiscuous mode — i.e. to *stop* needing those privileges. INFERENCE:
on a managed venue or corporate laptop this is often fatal. A tool that reads exported
files rather than sniffing raw frames sidesteps the entire class of problem.

---

## Direct quotes-of-substance

All paraphrased or quoted from pages actually opened. Dates are the page's own dates.

1. **The Dante protocol is guesswork, by the author of the only public reference.**
   "The official Dante API for embedded devices isn't public information, so most of this
   information is guesswork and will likely be wrong or unreliable" — and separately,
   "Not all of the commands or their arguments have been explored yet."
   `netaudio` wiki, Technical details (undated page, project active 2024–2026).
   <https://github.com/chris-ritsen/network-audio-controller/wiki/Technical-details>

2. **Bitfocus Companion's verdict on Dante Controller, in label form.** The community
   module request was tagged "No external protocol", "Software" and "Unlikely" — the
   project's own definition of that first label being that the software "doesn't have an
   external or network protocol that we can use." Opened 9 Feb 2021 by `Stempoid`; closed.
   <https://github.com/bitfocus/companion-module-requests/issues/395>

3. **Everything was reverse-engineered, and there may be patents on it.**
   "Dante protocol is undocumented. Everything was reverse-engineered or based on other
   reverse-engineering projects." Plus: "Dante uses technology patented by Audinate. This
   source code may use these patents too. Consult a lawyer if you want to: make money of
   it; distribute binaries in (or from) a region where software patents apply."
   `teodly/inferno` README, read 29 Aug 2026. <https://github.com/teodly/inferno>

4. **Dante does not carry control.** "Dante carries audio and basic mDNS-based device
   discovery, but nothing about preamp gain, phantom power, or wireless-mic status — each
   vendor layers its own proprietary control protocol on top of the same network."
   `Dante-BabelBox` README, read 29 Aug 2026.
   <https://github.com/stoatworks-labs/Dante-BabelBox>

5. **Neither RF vendor publishes specs.** "Several of the underlying formats and protocols
   are reverse-engineered from real exports and vendor gear rather than official schemas
   (neither Shure nor Sennheiser publish full specs for most of these)." And on the
   generated Shure file: "The `.shw` show file is reverse-engineered from a single real
   WWB7 file and unvalidated by Shure." `RFutils` README, read 29 Aug 2026.
   <https://github.com/stoatworks-labs/RFutils>

6. **The obvious field in a WSM file is the wrong one.** `CurrentFrequency` "sat at the
   receiver's default ... didn't reflect the coordination result at all," while
   `AllocatedFrequency` "matched the real result." `wsm-wwb-bridge` README, read
   29 Aug 2026. <https://github.com/stoatworks-labs/wsm-wwb-bridge>

7. **Writing Shure's XML back out is too dangerous to attempt.** On `.shw`/`.cws`:
   "writing back out is intentionally not implemented," to avoid corrupting the file's
   interdependent structure. Same source as above.

8. **A real user's scan will not import into Wireless Workbench.** "Seems file can't be
   read when trying to be imported to shure workbench" — reporter `EMLGVS`, 16 Jan 2024,
   with an error screenshot. <https://github.com/berkon/wireless-microphone-analyzer/issues/40>

9. **WSM needs German-locale CSV.** A user asks for an export option with values "divided
   by a comma (',') instead of a period ('.')" and "separated by a semicolon (';') instead
   of a comma (',')" specifically for Sennheiser WSM compatibility. 18 Jun 2024.
   <https://github.com/berkon/wireless-microphone-analyzer/issues/43>

10. **The six-year-old request for an API.** A REST server-client architecture for AVDECC,
    so a master node exposes listener/talker counts, states and stream control to any
    browser and simplifies deployment "for non-technical users." Opened by `elabbing` on
    **7 March 2020**, milestone "Release 2.0", 16 comments, **still open**.
    <https://github.com/christophe-calmejane/Hive/issues/84>

11. **DDM is a closed door, and the question went unanswered.** "Is it possible to enable
    login to DDM resources?" — `dlemmink`, 21 Dec 2024, `netaudio` #28, still open with no
    response. <https://github.com/chris-ritsen/network-audio-controller/issues/28>

12. **Third-party Dante control drops what the official app holds.** "Module can't keep
    devices connected" / "Devices seems can't keep connected", on macOS 15.7.4, Companion
    4.3.3, module 1.1.2, on a simple isolated Dante network with one switch — while "all
    devices are detected normally in the official Dante Controller app." 23 May 2026.
    <https://github.com/bitfocus/companion-module-audinate-dantecontroller/issues/46>

13. **And that module is built on reverse engineering.** Its own help file states it is
    "based on Chris Ritsen's Network audio controller," is for "simple local networks", and
    that "Set Output Level" is "currently only for AVIO 2out" devices.
    <https://raw.githubusercontent.com/bitfocus/companion-module-audinate-dantecontroller/main/companion/HELP.md>

14. **AES67 into Dante, in a practitioner's words.** "Extremely distorted audio from an
    aes67 source going to a dante network" — "crunchy trash instead of a nice tone" — at
    48 kHz, L24, 2 channels, 48 samples per packet, 576-sample playout delay; isolated by
    noting "another dante source through the same input chain comes out clean."
    12 May 2025, open, no resolution.
    <https://github.com/bondagit/aes67-linux-daemon/issues/217>

15. **No clock, no audio.** "Receiving or sending audio via the ALSA RAVENNA device is only
    possible if the PTP slave status is locked" — and the documented known issues add that
    CPU frequency scaling causes "unexpected distortions" and that PulseAudio must be
    disabled or uninstalled. `aes67-linux-daemon` README, read 29 Aug 2026.
    <https://github.com/bondagit/aes67-linux-daemon>

16. **Third-party RF metering is slower than the vendor's.** Companion module issue title,
    verbatim: "Meters are very slow compared to WWB." 10 Dec 2023, closed.
    <https://github.com/bitfocus/companion-module-shure-wireless/issues>

17. **The maintainer's own list of what Hive still lacks.** "Support multiple eth
    interfaces at the same time to support redundancy"; "aggregate entities sharing the
    same EID across networks"; auto-save log files during crashes; Connection Matrix error
    visualisation via colour coding and tooltips; "Start/Stop all Streams". Known issues
    include GroupName corruption with certain Unicode characters and talker stream status
    changing incorrectly when listeners connect.
    <https://raw.githubusercontent.com/christophe-calmejane/Hive/main/TODO.md>

18. **Milan compliance is not interoperability.** A developer reports their implementation
    "only provides Milan compliant CRF format" yet will not work with MOTU UltraLite AVB
    endpoint hardware. `scrambletools/ESP-AVB-Endpoint` #2, 22 May 2026, 7 comments.
    (Seen in GitHub issue search results; the issue page itself was not opened —
    treat as PLAUSIBLE rather than CONFIRMED.)

---

## Confidence summary and what to check next

**Well-evidenced (multiple independent primary sources):** Dante has no public control
API; reverse engineering is the normal integration route and degrades per vendor; neither
Shure nor Sennheiser publishes RF file schemas; discovery-driven tools have no offline
mode; PTP lock is a hard gate; Hive's connection-matrix UX and missing REST API; LA_avdecc's
seven-year backlog; standards compliance ≠ interoperability.

**Thin or inferred (use with care):** DDM specifically locking out third-party tools
(strongly implied by an unanswered issue, never stated by a vendor); Dante Virtual
Soundcard licensing friction (inferred from a competitor's positioning only — **no price
or licence term was read**); privilege requirements being fatal on managed laptops
(logical but unreported).

**UNKNOWN — genuinely not researched this session, do not fill from memory:**
- All GUI ergonomics of Dante Controller, WWB, WSM and Q-SYS Designer.
- All pricing for every commercial product in this segment.
- Q-SYS Designer feature licensing, seat limits and offline emulation.
- German-market sentiment and German-language sources of any kind.
- Review-site (G2/Capterra/TrustRadius) "Cons" fields.
- Everything Reddit and the pro-AV forums would have said.

**To close those gaps, re-run with network access to:** reddit.com (r/livesound,
r/audioengineering, r/AVProfessionals, r/VIDEOENGINEERING), prosoundweb.com forums,
blue-room.org.uk, gearspace.com, audinate.com and getdante.com (pricing + FAQ),
service.shure.com (WWB release notes and known issues), sennheiser.com (WSM downloads and
release notes), q-syshelp.qsc.com (release notes, feature licence matrix), and the German
sources film-tv-video.de and production-partner.de.

### Discarded claims

- A GitHub search summary attributed to `museumsvictoria/spatial_audio_server` #52 the
  statement that "Dante Virtual Soundcard is complaining about the license being activated
  too many times." **Opening issue #52 directly showed no licensing content whatsoever** —
  it is about Dante creating one WDM device per two channels on Windows, and about adding
  ASIO support to CPAL. The licensing quote is **not used anywhere in this dossier**.
- An early fetch of the `teodly/inferno` repository landing page reported a feature
  comparison table against Dante Virtual Soundcard citing free licensing, no DRM/activation
  and ~12 MB RAM. Fetching the raw `master` README did **not** reproduce that table. The
  table is treated as **unverified** and no claim in this dossier depends on it. To check:
  open the `dev` branch README directly.

---

## Sources

Every URL below was opened and returned content during this pass on 2026-08-29.

**Hive (christophe-calmejane)**
- <https://github.com/christophe-calmejane/Hive>
- <https://github.com/christophe-calmejane/Hive/issues>
- <https://github.com/christophe-calmejane/Hive/issues?q=is%3Aissue+is%3Aopen> (pages 1 and 2)
- <https://github.com/christophe-calmejane/Hive/issues?q=is%3Aissue+sort%3Acomments-desc>
- <https://github.com/christophe-calmejane/Hive/issues/84>
- <https://raw.githubusercontent.com/christophe-calmejane/Hive/main/TODO.md>

**LA_avdecc (L-Acoustics)**
- <https://github.com/L-Acoustics/avdecc>
- <https://github.com/L-Acoustics/avdecc/issues>
- <https://github.com/L-Acoustics/avdecc/issues?q=is%3Aissue+is%3Aopen&page=2>

**netaudio / network-audio-controller (chris-ritsen)**
- <https://github.com/chris-ritsen/network-audio-controller/issues>
- <https://github.com/chris-ritsen/network-audio-controller/issues/28>
- <https://github.com/chris-ritsen/network-audio-controller/issues/40>
- <https://github.com/chris-ritsen/network-audio-controller/issues/48>
- <https://github.com/chris-ritsen/network-audio-controller/wiki>
- <https://github.com/chris-ritsen/network-audio-controller/wiki/Technical-details>
- <https://raw.githubusercontent.com/chris-ritsen/network-audio-controller/master/README.md>

**inferno (teodly) — unofficial Dante implementation**
- <https://github.com/teodly/inferno>
- <https://github.com/teodly/inferno/issues>
- <https://raw.githubusercontent.com/teodly/inferno/master/README.md>

**AES67 Linux Daemon (bondagit)**
- <https://github.com/bondagit/aes67-linux-daemon>
- <https://github.com/bondagit/aes67-linux-daemon/issues>
- <https://github.com/bondagit/aes67-linux-daemon/issues?q=is%3Aissue+sort%3Acomments-desc>
- <https://github.com/bondagit/aes67-linux-daemon/issues/38>
- <https://github.com/bondagit/aes67-linux-daemon/issues/217>

**Bitfocus Companion (integration evidence against commercial products)**
- <https://github.com/bitfocus/companion-module-requests/issues/395> (Dante Controller)
- <https://github.com/bitfocus/companion-module-requests/issues?q=is%3Aissue+label%3A%22No+external+protocol%22>
- <https://github.com/bitfocus/companion-module-audinate-dantecontroller>
- <https://github.com/bitfocus/companion-module-audinate-dantecontroller/issues>
- <https://github.com/bitfocus/companion-module-audinate-dantecontroller/issues/46>
- <https://raw.githubusercontent.com/bitfocus/companion-module-audinate-dantecontroller/main/companion/HELP.md>
- <https://github.com/bitfocus/companion-module-qsys-remote-control/issues?q=is%3Aissue+sort%3Acomments-desc>
- <https://github.com/bitfocus/companion-module-qsys-remote-control/issues?q=is%3Aissue+is%3Aopen>
- <https://github.com/bitfocus/companion-module-shure-wireless/issues>

**RF tooling**
- <https://github.com/berkon/wireless-microphone-analyzer/issues>
- <https://github.com/berkon/wireless-microphone-analyzer/issues/40>
- <https://github.com/berkon/wireless-microphone-analyzer/issues/43>
- <https://github.com/karlcswanson/micboard>
- <https://github.com/karlcswanson/micboard/issues>
- <https://github.com/stoatworks-labs>
- <https://raw.githubusercontent.com/stoatworks-labs/RFutils/main/README.md>
- <https://raw.githubusercontent.com/stoatworks-labs/wsm-wwb-bridge/main/README.md>
- <https://raw.githubusercontent.com/stoatworks-labs/Dante-BabelBox/main/README.md>

**Cross-cutting**
- <https://github.com/museumsvictoria/spatial_audio_server/issues/52>

**GitHub issue/repository search queries used as the search engine**
- `"Dante Controller"` (issues, sorted by reactions)
- `repo:bitfocus/companion-module-requests Dante` (issues, sorted by reactions)
- `"Wireless Workbench" OR "Shure WWB"` (issues, sorted by comments)
- `Dante Audinate "reverse engineer" OR "no public API" OR "undocumented protocol"` (issues)
- `Milan AVDECC interop OR interoperability OR "not compliant"` (issues)
- `"Dante Virtual Soundcard" license OR activation OR subscription` (issues)
- `"Dante" audio "Domain Manager"` (issues)
- `"Sennheiser" "WSM" OR "Wireless Systems Manager"` (issues) — no relevant results
- `AES67 Dante interop sample rate OR "packet time" problem` (issues)
- `Audinate SDK OR NDA OR "developer program" Dante` (issues) — no relevant results
- `"Q-SYS" license OR licence OR "feature license" core` (issues) — no relevant results
- `"Dante Controller" "does not" OR cannot OR annoying OR workaround` (issues)

**Attempted and blocked (recorded for reproducibility)**
reddit.com / old.reddit.com / www.reddit.com; html.duckduckgo.com; lite.duckduckgo.com;
mojeek.com; hn.algolia.com; en.wikipedia.org; audinate.com; getdante.com;
service.shure.com; q-syshelp.qsc.com; prosoundweb.com; gearspace.com; api.github.com (403).
