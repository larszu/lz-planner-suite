# Pain points: Show Control / Automation / Surfaces

Research date: 2026-08-29 (brief dated 2026-08-28).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Language of corpus: English (repo docs mix DE/EN; research corpus stays EN).

---

## Method

### Read this first — what this pass could and could not reach

Two hard limits shaped this dossier. Stating them up front so it is not
over-read.

1. **The session's WebSearch budget was exhausted before this pass began**
   (200/200 calls consumed by earlier segment passes in the same session).
   **Zero search queries completed.** The brief asked for 8–15 distinct
   searches; that part of the method is **unexecuted**.
2. **Network egress policy blocked almost every non-GitHub host.** Confirmed
   blocked at the proxy during this pass, each returning `EGRESS_BLOCKED` or a
   hard fetch refusal:
   `www.reddit.com`, `old.reddit.com`, `qlab.app`, `www.controlbooth.com`,
   `www.capterra.com`, `forum.blackmagicdesign.com`, `bitfocus.io`.
   **Reachable and used: `github.com`.** GitHub's *global* search endpoint
   (`github.com/search`) returned HTTP 429 with `Retry-After: 3600` and was
   abandoned; repo-scoped issue lists (`/<owner>/<repo>/issues?q=…`) worked
   throughout and became the primary instrument.

**Consequence, stated plainly: this dossier is strong on control-surface
reliability, external-API gaps, module/integration architecture and
open-source maintenance load, and near-silent on pricing, licence sentiment,
purchasing decisions and end-user UX opinion.**

Nothing here should be read as "users do not complain about QLab's price" or
"Stream Deck Studio's cost is accepted" — it should be read as "the places
where those complaints are written were unreachable." The Reddit angle, the
review-site angle (G2/Capterra/GetApp/TrustRadius/Trustpilot), the
professional-forum angle (ProSoundWeb, Blue Room, ControlBooth, AVSForum,
Blackmagic forum, vMix forum) and the German-language angle
(film-tv-video.de, production-partner.de, veranstaltungstechnik forums) are
**all unexecuted**.

**No prices appear in this dossier.** Every vendor pricing page was
unreachable (`bitfocus.io` and `qlab.app` both blocked). Rather than
reconstruct prices from memory, all pricing sections are marked UNKNOWN with
a note on what to check. A fabricated price is worse than an absent one. The
two prices carried in from the landscape pass (CueServer Core seen at a
dealer; Medialon "requires sales contact") are **not re-verified here** and
are repeated only as landscape-pass claims, not as this pass's findings.

### What was actually read

**44 distinct GitHub pages opened and read first-hand.** Breakdown:

- **Bitfocus Companion core** (16 pages): open issues sorted by comments and
  by reactions; the `BUG` label view; the `area/protocol` label view; the
  `Needs beer!` label view; surface/Stream Deck query; module-store/offline
  query; performance query; the releases/changelog list; the Discussions
  board; and four individual issues read in full (#1695, #1187, #2405,
  #3324, #4073).
- **Companion satellite and module infrastructure** (3 pages):
  `companion-satellite` open issues, `companion-module-base` issues,
  `orgs/bitfocus/repositories?q=medialon` (negative result).
- **Companion vendor-integration modules** (4 pages): the QLab module's full
  issue list plus issues #184 and #185 read in full; the CueServer module's
  issue list.
- **Chataigne** (3 pages): open issues by comments, crash query, open issues
  by creation date (total count).
- **ossia score** (3 pages): open issues by comments, Companion-module query,
  main issue list (total count).
- **Ontime** (5 pages): open issues by comments, MIDI/timecode query,
  automation-output query (negative result), the releases list, issue #1546
  in full.
- **Linux Show Player** (2 pages): open issues by comments, releases list.
- **MIDIMonster** (3 pages): open issues, releases list, repo homepage.
- **Stream Deck hardware and SDK** (5 pages): `python-elgato-streamdeck`
  open issues, `streamdeck-linux-gui` open issues, `elgatosf/streamdeck`
  open issues, the archived `elgatosf/streamdeck-javascript-sdk`,
  `Figure53/QLabKit.objc` issues.

**Why this source class is unusually good for this segment.** Nine of the
twelve landscape products are open source with public trackers, and the
Companion module ecosystem is a purpose-built corpus of *integrators writing
down what vendor APIs will not do*. A Companion module issue that says "QLab
returns this as a string" is better evidence about QLab's API than a forum
opinion would be. The weakness is the mirror image: this corpus contains
almost no procurement, price or "we switched away" sentiment.

### Evidence conventions used below

- **FACT** — read on a page listed in Sources, with the URL.
- **INFERENCE** — my reasoning from those facts, labelled as such.
- **UNKNOWN** — could not verify in this pass; the intended check is named.
- Frequency: **isolated** (one report), **recurring** (several independent
  reports or a repeated changelog theme), **widespread** (a structural theme
  visible across multiple vendors or many issues).
- Dates are as displayed by GitHub. One caveat: the Ontime *releases* page
  rendered with years that contradict the issue timeline, so **no Ontime
  release dates are cited** anywhere below. Issue dates are used instead.

---

## Per-product findings

### Bitfocus Companion 5.x

By far the deepest evidence base in this pass — Companion's tracker is large,
labelled, actively triaged, and its issue titles are written by working
integrators.

**STRENGTHS (what even critics concede)**

- FACT: The project ships fast and fixes aggressively. The releases page
  shows v4.3.0 → v5.0.4 across a short window, with v5.0.0 → v5.0.1 → v5.0.2
  → v5.0.3 → v5.0.4 in roughly six weeks
  (https://github.com/bitfocus/companion/releases). Whatever else users
  complain about, abandonment is not one of the complaints.
- FACT: The tracker is genuinely triaged — issues carry area labels
  (`area/gui`, `area/graphics`, `area/protocol`, `area/module-api`,
  `area/import-export`, `area/internal`) and milestones (`v5.1`,
  `v5.develop`, `v5.z`). That is a maintained project, not a dumping ground.
- FACT: Maintainers file their own architectural issues against the product
  (#2546 "Support OAuth flow for modules" and #1825 "Actions exposing some
  boolean properties for feedbacks" are both opened by Julusian, a
  maintainer). Self-critical trackers are a strength signal.
- FACT: The module API is a real, versioned developer surface with its own
  repo and its own design discussions, including a forward-looking "#188
  Ideas for breaking changes in API v3.0" (2026-02-15)
  (https://github.com/bitfocus/companion-module-base/issues).

**WEAKNESSES**

- **No redundancy or failover — and this is raised by a user who calls it
  mission-critical.** FACT: #4073 "Dual Redundancy with Companion"
  (2026-04-04, open, labels `Enhancement` + `Needs beer!`) asks for satellite
  instances and Elgato network docks to fail over to a backup server when the
  primary drops, plus "active tracking backup" replication to a secondary
  server. The reporter states Companion is "very mission critical to our
  productions" and describes running 15 Stream Decks plus scheduling.
  No maintainer response was visible on the page
  (https://github.com/bitfocus/companion/issues/4073). Frequency: isolated as
  a filed issue, but see Cross-product patterns — the *category* is
  widespread.
- **A large tail of very old, still-open requests.** FACT, with dates read
  off the issue lists: #268 "Assignment of backup instances" (2018-10-03),
  #262 "Support gifs/animation in button images" (2018-09-28, milestone
  v5.1), #428 "Screensaver" (2019-01-07, milestone v5.develop), #908
  "Enable/Disable Buttons" (2019-11-22), #1061 "Linked Button Copy"
  (2020-04-02, milestone v5.z), #1465 "Portable Mode" (2021-03-03), #673
  "Dark mode for the GUI" (milestone v5.1, still open and still one of the
  most-reacted issues). Several are eight years old and still milestoned
  forward. INFERENCE: the backlog is not neglect, it is throughput — the
  team ships patch releases constantly while structural requests wait.
- **Maintainer bandwidth is visibly the constraint.** FACT: a dedicated
  `Needs beer!` label exists and carries a steady stream of 2026 issues —
  #4396 (2026-08-05), #4382 (2026-08-01), #4292 (2026-06-29), #4276
  (2026-06-22), #4261 (2026-06-19), #4250 (2026-06-16), #4149 (2026-05-01),
  #4119 (2026-04-23), #4089 (2026-04-12), #4087 (2026-04-12), #4073
  (2026-04-04), #4037 (2026-03-24)
  (https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+label%3A%22Needs+beer%21%22).
  INFERENCE: whatever the label's exact internal meaning, a queue of a dozen
  2026-dated items parked behind "needs a conversation first" is a
  design-capacity bottleneck, and it sits in front of exactly the
  architectural items (redundancy, graphics model, audit logging, rotary
  conditions) that large installs need.
- FACT: Unanswered questions accumulate on the Discussions board — the Q&A
  category is described on the page as dominated by unanswered posts, on
  topics like Allen & Heath dLive, MIDI faders, Resolume multi-PC control and
  vMix variables (https://github.com/bitfocus/companion/discussions).
  Frequency: recurring. INFERENCE: community support does not scale with
  module count.

**MISSING FEATURES (what users request)**

- **State readback over the API — the single most-reacted open issue.**
  FACT: #1695 "[Feature Request] Enhance Companion's REST APIs to provide
  button state information" is top of the reactions-sorted list. The API can
  trigger (`/press/bank/1/1`) but cannot report. The request asks for a
  `/get/bank/1/1` endpoint and for state to come back as JSON on the `/press`
  route, so a third-party surface (the reporter's MIDI Fighter 3D driving a
  Behringer mixer) can colour its own buttons from mute state, and so OBS/vMix
  and others can use Companion as middleware. No maintainer comment visible
  (https://github.com/bitfocus/companion/issues/1695).
- **A whole shelf of adjacent API requests confirms it is a theme.** FACT,
  from the `area/protocol` view: #4282 "Image Library API endpoint"
  (2026-06-25); #4179 "REST API endpoint to enumerate all variable
  definitions" (2026-05-19); #4120 "OSC Button Control via Arguments Instead
  of Address Path" (2026-04-23); #3861 "Deeper API information" (2025-12-23);
  #3753 "Surface name over Satellite API" (2025-11-04); #3430 "Load config
  file via API" (2025-05-23); #3325 "Force press/release in remote command"
  (2025-03-05); #3197 and #3195 on TCP text and press/release feedback
  (both 2025-01-03); #3055 "New OSC API not able to dial with some software"
  (2024-09-25); #2808 "Add GET portion to new HTTP api" (2024-03-19); #2592
  "delay parameter in remote control" (2023-10-01)
  (https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+label%3Aarea%2Fprotocol).
  Frequency: **widespread within the product** — twelve distinct open
  protocol requests spanning three years.
- **Bulk button editing.** FACT: #4028 "[Feat] Copy action/feedback from one
  button to another" is second on the reactions list; #2834 "Multi-button
  select for copy/paste/delete" (milestone v5.1) and #1061 "Linked Button
  Copy" (2020, milestone v5.z) are the same complaint in three forms.
  Frequency: recurring.
- FACT: #1924 "Custom Presets" (milestone v5.1, labels `area/import-export`)
  and #4396 "New internal Action - Import Configuration" (2026-08-05) —
  users want to template and re-import their own configuration, not just
  vendor-shipped presets.
- FACT: #2271 "Visual Companion" (labels `Enhancement`, `Idea`,
  `Needs beer!`, milestone `v5.develop`) — high reaction count, a request to
  rethink the editing model visually.
- FACT: #1728 "Add external font libraries to be used as icons for buttons
  (fontawesome)" and #2237 "Changing font size (and type) within button text"
  (2022-12-13) — button typography control.
- FACT: #4089 "Variable/state change audit log for connected devices"
  (2026-04-12) — a show-forensics feature request. INFERENCE: this is the
  "what actually fired during the show" question, and it currently has no
  answer in the product.
- FACT: #2546 "Support OAuth flow for modules" (2023-08-10) and
  `companion-module-base` #254 "OAuth field type" (2026-07-31) — modern
  cloud-service auth is not expressible in a module config today.

**UX PROBLEMS**

- **Button rendering and text layout is the single largest recurring bug
  class.** FACT, from the open `BUG` view: #4359 "Various Style topics in
  v5.0.2" (2026-07-23); #4372 "Button Text Shrink to fit not working"
  (2026-07-26); #4352 "New graphics don't work with CSS colors"
  (2026-07-22); #4380 "Button sometimes does not display evaluated text"
  (2026-07-31); #3671 "Variation Selector not honored in button text"
  (2025-10-03); #4292 "Multiple Blink Buttons not synchronous" (2026-06-29)
  (https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+label%3ABUG+sort%3Acomments-desc).
  Frequency: **recurring, and confirmed by the changelog** — the releases
  page lists repeated fixes to "gauge" elements, colour parsing,
  bounds/clipping, rotation handling and text positioning
  (https://github.com/bitfocus/companion/releases).
- FACT: #3082 "Reordering pages breaks 'Set to page' buttons" (2024-10-11) —
  a referential-integrity failure in the data model surfaced as a UX trap.
  INFERENCE: page references are stored positionally rather than by stable
  id; reorder invalidates them silently. This is exactly the class of bug a
  planning tool must avoid in its own link model.
- FACT: dark mode (#673) is still an open request with a `Help Wanted` label
  and a v5.1 milestone, despite being one of the highest-reaction issues.
- FACT: the changelog shows repeated UI-interaction fixes — sidebar
  behaviour, panel dismissal, drag-and-drop, button-selection memory, editor
  tab persistence. Frequency: recurring.

**PERFORMANCE PROBLEMS**

- FACT: #3324 "[BUG] v3.5.2 is horrendously laggy taking 5 seconds to
  complete tasks" — the reporter describes a vMix "Transition - Transition
  Mix" action taking 5–6 seconds and custom-variable operations badly
  delayed, calling it "practically unusable." Closed against milestone v4.0
  (closed 2025-09-16) (https://github.com/bitfocus/companion/issues/3324).
  INFERENCE: the fix landed in a major version, i.e. the regression was
  architectural rather than a quick patch.
- FACT: #2405 "Stuck on Unknown, waiting for webserver for very long"
  (2023-04-01, still open, labelled `BUG` + `Help Wanted` +
  `Not reproducible`) — roughly three minutes stuck on "waiting for
  webserver" and over a minute of GUI load on Windows 11 after upgrading
  2.4.2 → 3.0.0-beta, persisting through a full clean reinstall including
  registry cleanup and AppData deletion
  (https://github.com/bitfocus/companion/issues/2405). Frequency:
  **isolated** — one reporter, explicitly labelled not reproducible. Weighed
  down accordingly; cited because it has stayed open for over three years.
- FACT: the changelog carries performance-shaped fixes as a standing
  category — "excessive sorting", "rate limiting updates", and repeated
  Safari-specific browser fixes.
- FACT: #1583 "local Applescripts with tells run slow when called from
  Companion" (2021-04-28) — still open after five years.

**PRICING PROBLEMS**

- FACT: Companion itself is free and MIT (landscape pass).
- UNKNOWN: everything about **Bitfocus Buttons**, the commercial sibling.
  `bitfocus.io` is blocked by the egress proxy, so its price, licence model,
  seat/profile limits and the exact feature delta versus Companion could not
  be checked. The landscape pass already recorded this delta as "unverified"
  and this pass **does not improve on it**. To check: `bitfocus.io/buttons`
  and the Buttons documentation, plus Elgato's Stream Deck Studio product
  page for the claim that Studio requires Buttons.
- INFERENCE (flagged as inference, not fact): a free MIT core with a
  commercial sibling aimed at "large/enterprise installs (profiles, scaling)"
  is the classic open-core split, and the features most likely to sit behind
  it are exactly the ones the tracker shows large users asking for
  (redundancy, profiles, scale). **This is reasoning, not evidence** — I
  could not read a single Buttons page.

**LOCK-IN**

- FACT: low by design. MIT licence, self-hosted, no cloud dependency
  observed anywhere in the tracker.
- FACT: the real dependency is the **module ecosystem**, not the core. #1002
  "Modules as downloadable plugins" was completed for the v4.0 milestone
  (closed 2025-01-24), which moved modules from bundled to downloadable
  (https://github.com/bitfocus/companion/issues?q=is%3Aissue+module+store+offline+install).
  INFERENCE: this makes a Companion install's real capability set a function
  of what the module store served on the day, which is a supply-chain
  dependency even though the licence is permissive.
- FACT: #4359-era changelog entries include fixes to "symlink loading",
  "module manifest handling" and "version management", i.e. the module
  distribution layer is itself an active source of breakage.

**OFFLINE**

- FACT: Companion runs locally; the landscape pass records offline module
  bundles as a shipped feature. This pass found the tracker item that made
  downloadable modules possible (#1002, closed) but **found no open
  complaint that offline module installation is broken**.
- FACT: #3596 "[BUG] No modules installed and not being able to do su"
  (closed 2025-08-26) is the one install-failure issue surfaced by the
  module-store query.
- INFERENCE: offline is a genuine Companion strength relative to the
  cloud-tethered tools in adjacent segments. Frequency of complaints:
  effectively nil in the reachable corpus.
- UNKNOWN: whether a first-run install on an air-gapped show network can
  obtain modules without a prior online seeding step. To check: the offline
  bundle documentation on `bitfocus.io` (blocked).

**INTEGRATION PROBLEMS**

- FACT: the `area/protocol` backlog above **is** the integration complaint —
  Companion integrates outward superbly and inward poorly. It speaks to
  hundreds of devices; other systems struggle to speak to it beyond
  fire-and-forget triggering.
- FACT: `companion-module-base` shows the module-developer friction:
  #210 "Consider unifying all 'take a string but allow it to optionally be
  an expression' fields" (2026-03-15); #226 "Detect accidentally-reused ids
  in choices lists" (2026-04-26); #211 "Log a warning for reuse of a preset
  definition ID?" (2026-03-15); #198 "Beef up the manifest schema to flag
  unchanged defaults" (2026-03-02); #239 "Wrong api in latest version for
  panel count" (closed 2026-06-24); #245 "Opacity defaults to '1' instead of
  '100'" (closed 2026-07-19)
  (https://github.com/bitfocus/companion-module-base/issues). INFERENCE:
  these are all "the API lets module authors get it subtly wrong and nothing
  catches it" — a validation gap, and it is why module quality varies.
- FACT: #1187 "Expose properties instead of actions" (milestone v5.z)
  documents the underlying architectural cost: module authors must expose an
  action, a feedback **and** a variable for the same device value. The issue
  states the goal is "to avoid having to expose an action, feedback and
  variable for the same value," notes it "leads to the functionality and flow
  being inconsistent even within modules," and that the burden multiplies for
  devices with many instances such as per-channel audio properties. The
  proposal is a property object with get/set/subscribe that the core projects
  into whichever of the three shapes the context needs
  (https://github.com/bitfocus/companion/issues/1187). INFERENCE: this is the
  most important design lesson in this dossier for a planning tool — see
  Cross-product patterns.
- FACT: #4261 "Standardize UDP error tracking in modules" (2026-06-19) —
  error handling is per-module, not systemic.

---

### Bitfocus Companion Satellite (remote surfaces)

Treated separately because its failure modes are network failure modes, and
they are the ones that bite during a show.

**STRENGTHS**

- FACT: actively maintained with 2026-dated issues and a broad device remit
  (Stream Decks, Contour Shuttle, Elgato network docks, Raspberry Pi images).

**WEAKNESSES / PERFORMANCE**

- **Reconnection after a network event is the headline failure.** FACT:
  #343 "Satellite on Windows never reconnects to Companion after the network
  adapter drops" (2026-08-23) — permanent disconnection requiring an
  application restart
  (https://github.com/bitfocus/companion-satellite/issues?q=is%3Aissue+is%3Aopen).
  INFERENCE: a surface that needs a manual restart after a switch reboot or
  a Wi-Fi blip is, operationally, a surface that fails at the worst moment.
- **Partial device detection.** FACT: #253 "Satellite detects only some
  Stream Deck devices" (2026-02-27), alongside #241 "Request to select
  specific Stream Deck devices" (2026-01-15). Frequency: recurring.
- **Raspberry Pi deployment is fragile.** FACT: #212 "Satellite hangs
  intermittently on Raspbian" (2025-08-19); #143 "UI flickering on Raspberry
  Pi 5 boot" (2024-08-24). Frequency: recurring. INFERENCE: the cheap-panel
  deployment path (Pi + Stream Deck instead of a dedicated panel) is exactly
  the cost-saving pattern users want, and it is the least reliable path.

**MISSING FEATURES**

- FACT: #301 "Static IP configuration request" (2026-06-05); #297 "Network
  Dock Server mode feature for Elgato hardware" (2026-05-25); #316 "satellite
  version reporting" (2026-06-22); #292 "Custom logo customization when
  offline" (2026-05-22); #138 "Number entry support" (2024-07-10); #181 "Add
  quit confirmation disable option" (2025-03-02).
- FACT: #300 "Jog/Shuttle variable issues with Contour Shuttle devices"
  (2026-06-05) — specialty input hardware support is thin.

**OFFLINE**

- FACT: #292 asks for a custom logo *when offline*, which confirms the
  product has a defined offline display state. INFERENCE: satellite surfaces
  degrade visibly rather than silently, which is correct behaviour; the
  complaint is cosmetic, not functional.

---

### Elgato Stream Deck family (MK.2 / XL / + / XL / Studio)

No Elgato-owned complaint venue was reachable. What *was* reachable is better
in one specific way: the open-source libraries that drive the hardware
directly, whose issue trackers record the hardware's real behaviour.

**STRENGTHS**

- FACT: the hardware is the de-facto substrate — every control layer in this
  segment (Companion, Chataigne, streamdeck-linux-gui, ossia) targets it, and
  a mature independent driver library exists.
- FACT: Elgato's current SDK repo (`elgatosf/streamdeck`) is live with only
  5 open issues, several already scheduled (#133 slated for v3.0.0)
  (https://github.com/elgatosf/streamdeck/issues?q=is%3Aissue+is%3Aopen).
  INFERENCE: a small, triaged open-issue count on a first-party SDK is a
  quality signal, though it may also reflect issues being closed or routed
  elsewhere.

**WEAKNESSES / PERFORMANCE**

- **Sleep/wake breaks event delivery silently — on Elgato's own SDK.**
  FACT: `elgatosf/streamdeck` #157 "Action/PI events silently stop being
  delivered after system sleep/wake" (2026-07-14), with no mechanism for
  developers to detect or recover. Frequency: filed once on the first-party
  SDK, but it **corroborates** the independent library's #78 "Recover from
  suspend and resume" (2021-09-16, still open) in
  `python-elgato-streamdeck`. Two independent codebases reporting the same
  suspend/resume class over five years apart makes this **recurring** and,
  in my judgement, real.
- **Per-model firmware and display quirks.** FACT, from
  `python-elgato-streamdeck`: #38 "get_firmware_version() call leads to
  streamdeck XL ignoring top 3 row presses" (2020-02-28); #47 "Top half of
  image is shifted right on Original StreamDeck V1" (2020-06-23); #142
  "'Glitched' image display on MK2" (2024-05-06); #130 "set_key_image()
  erases touchscreen content if it was not called before
  set_touchscreen_image()" (2023-12-01)
  (https://github.com/abcminiuser/python-elgato-streamdeck/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc).
  INFERENCE: "a Stream Deck" is not one device — it is a family with
  divergent display pipelines, and integrators carry that divergence.
- **USB/HID transport errors.** FACT: #154
  "StreamDeck.Transport.Transport.TransportError: Failed to write feature
  report (-1)" (2025-02-09). Frequency: recurring in kind (see also
  streamdeck-linux-gui below).
- **Image push speed is a known constraint.** FACT: #162 "Faster
  set_key_image" (2025-08-24). INFERENCE: this is why blink/animation
  synchronisation bugs appear downstream — cf. Companion #4292 "Multiple
  Blink Buttons not synchronous" and #262's eight-year-old GIF request.
- **Linux is second-class.** FACT, from `streamdeck-linux-gui`: #54 "A
  suitable LibUSB installation could not be found" (2023-08-26); #137 "fails
  to build in Fedora 39" (2023-12-20); #171 "Streamdeck crashes immediately
  after launch" (2024-02-05); #211 "Streamdeck segfault on fedora"
  (2024-05-04); #226 "Failed to build installable wheels … (evdev)"
  (2024-07-22); #223 install failures via pip and the AUR (2024-07-03); #154
  "streamdeck_ui.lock is never released/deleted" (2024-01-15); #157 "The
  keyboard modules seems to always assume a QWERTY keyboard layout"
  (2024-01-20); #10 "DBUS Issue" (2023-07-28)
  (https://github.com/streamdeck-linux-gui/streamdeck-linux-gui/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc).
  Frequency: **widespread within Linux** — nine distinct install/runtime
  failures. INFERENCE: on Linux the hardware is usable only through
  community software whose dominant failure mode is "does not install."

**MISSING FEATURES**

- FACT: #159 "StreamDeck Neo Infobar APIs" (2026-07-29) — new hardware ships
  ahead of its SDK surface.
- FACT: #158 "Allow Stream Deck plugin windows to be resizable or dynamically
  sized at runtime" (2026-07-26) — plugin UI is boxed.
- FACT: #137 "Expose 'Running Application' Indicator (Green Dot) Rendering to
  Plugins" (2026-02-19) — first-party visual affordances are not available to
  third parties.
- FACT: #150 "Support of Ajazz AKP153 and AKP153e" (2024-09-29) in the Python
  library. INFERENCE: cheaper clone panels are arriving and the ecosystem is
  being asked to support them, which is a competitive signal about Elgato's
  price position — though I have no price data to confirm that.

**PRICING PROBLEMS**

- UNKNOWN. No Elgato pricing page was reachable and no review site was
  reachable. The landscape pass records Studio as a 1RU PoE+ 32-key broadcast
  panel; its price is **not verified here**. To check: Elgato's store pages
  and any broadcast dealer listing, with date-seen.

**LOCK-IN**

- FACT: the landscape pass records that Stream Deck Studio **requires**
  Bitfocus Buttons (the commercial product). This pass could not verify that
  claim — `bitfocus.io` is blocked. If true, INFERENCE: it is a notable
  reversal, a hardware vendor's flagship panel depending on a third party's
  paid software.
- FACT: the archived first-party JS SDK
  (`elgatosf/streamdeck-javascript-sdk`, "archived by the owner on Oct 28,
  2024, now read-only") shows Elgato migrating plugin developers to a new SDK
  generation (https://github.com/elgatosf/streamdeck-javascript-sdk/issues?q=is%3Aissue).
  INFERENCE: plugin authors have already absorbed one forced migration.

**OFFLINE**

- UNKNOWN whether the Stream Deck desktop software requires an account or
  internet for activation or plugin installation. Not verifiable from the
  reachable corpus. To check: Elgato's software docs and the Stream Deck
  Store terms.

**INTEGRATION PROBLEMS**

- FACT: #149 "Is there a way to trigger/click a stream deck button
  programattically?" (2024-09-20) — remote/synthetic actuation is not an
  obvious capability.
- FACT: #133 "getSettings/setSettings in Action<T> allow unrelated types"
  (2026-01-02) — the SDK's own settings typing is unsound, and the fix is a
  breaking change deferred to v3.0.0.

---

### QLab 5 (Figure 53)

**Evidence health warning.** `qlab.app` is blocked, no review site was
reachable, and no Mac/theatre forum was reachable. Everything below is read
**through integrators** — the Companion QLab module tracker and Figure 53's
own OSC client library. That is good evidence about the *API* and poor
evidence about the *application*.

**STRENGTHS**

- FACT: Figure 53 publishes first-party OSC tooling under MIT — `F53OSC`
  ("sending, receiving, and parsing OSC messages"), `QLabKit.objc` ("An
  Objective C library for controlling QLab using the OSC API introduced in
  QLab 3"), `qlab-ruby`, and `QView` (an OSC-controllable PDF viewer)
  (https://github.com/orgs/figure53/repositories). INFERENCE: a vendor that
  open-sources its own control libraries under MIT is unusually
  integration-friendly for this segment, and it is why the QLab OSC API is
  the most thoroughly exercised in the landscape.
- FACT: the API surface is deep enough that the Companion module's open
  issues are about *refinements* (prewait elapsed time, expression support,
  playlist-group navigation), not about basic control being impossible
  (https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues?q=is%3Aissue).
- FACT: QLab ships breaking-but-visible API changes that integrators notice
  and fix — module issue #198 "[BUG] Go Disabled feedback stopped working
  since QLab 5.5" (closed 2026-05-25). INFERENCE: the API is versioned and
  moving, not frozen.

**WEAKNESSES**

- **Values come back as strings; arithmetic on them fails.** FACT: module
  issue #185 "Full expressions not usable in goto cue by cue number"
  (2025-10-21, open) — `$(qlab-mycon:n_num) + 2` yields the literal string
  `"10 + 2"` rather than `12`, and several syntax variants were tried
  without success
  (https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues/185).
  INFERENCE (important caveat): the page attributes this to the *module*
  substituting variables without evaluating, so this is at least partly a
  Companion-side limitation, not purely a QLab API defect. Recorded here
  because the user-visible symptom is "I cannot do arithmetic on QLab cue
  numbers."
- **Multi-argument OSC is not cleanly expressible.** FACT: module issue #201
  "[BUG] Custom OSC command doesn't handle OSC strings with multiple
  arguments" (2026-06-11, open). Frequency: recurring in kind — the same
  complaint appears independently in ossia score (#1483, below) and in
  MIDIMonster (#149), which makes multi-argument OSC a **cross-product**
  problem rather than a QLab one.
- **Multi-cue-list state is unreliable.** FACT: module issue #184 "Current
  playhead variables go empty when a different cuelist goes a cue"
  (2025-10-21, open) — with several QLab cue-list connections configured,
  triggering a cue in one list blanks the `n_num` / `n_name` playhead
  variables of another
  (https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues/184).
  UNKNOWN whether the root cause is QLab's OSC reply scoping or module state
  handling — the issue page carried no comments, so I cannot attribute it.
  To check: the QLab OSC dictionary's cue-list scoping semantics on
  `qlab.app` (blocked).
- FACT, historical and weak: `QLabKit.objc` records older API-era friction —
  #16 "Will randomly connect to localhost, instead of resolved address"
  (2016-03-28), #6 "Add reconnection timeout" (2018-08-28), #18 "Cue List
  name not updated" (2017-02-28), #12 "Optional properties mandatory"
  (2014-10-09), #9 "QLKCue all times report 0.00000" (2014-10-09)
  (https://github.com/Figure53/QLabKit.objc/issues?q=is%3Aissue).
  **Weight this low**: all are closed, most predate QLab 4, and QLab 5's API
  is a later generation. Cited only as a pattern — network reconnection and
  property-optionality were historically weak spots.

**MISSING FEATURES (what users request)**

- FACT: #211 "[Feature]: Elapsed time variable for cue Prewait"
  (2026-08-13) — timing introspection during prewait.
- FACT: #190 "[Feature]: Feedbacks - useVariables: true" (2026-02-16).
- FACT: #183 "Action to Skip to Next/Previous Element in Playlist Group Cue"
  (2025-10-20).
- FACT: #187 "Next and Prev Cue vs Sequence" (2025-12-11) — navigation
  semantics are ambiguous to integrators.

**UX PROBLEMS**

- UNKNOWN. No source reachable in this pass carries end-user UX opinion on
  QLab. To check: r/techtheatre, ControlBooth, the Figure 53 support site.

**PERFORMANCE PROBLEMS**

- UNKNOWN. Nothing in the reachable corpus. To check: as above, plus any
  Figure 53 known-issues page.

**PRICING PROBLEMS**

- UNKNOWN — and this is a real gap, because QLab's licence model is one of
  the most-discussed topics in theatre AV. `qlab.app` is blocked and no
  review site was reachable. **No price, no tier, no rental/perpetual claim
  is asserted here.** To check: `qlab.app/pricing` (or equivalent), with
  date-seen, and the licence terms for whether features are gated per tier.

**LOCK-IN**

- FACT (from the landscape pass, not re-verified here): QLab 5 is macOS-only.
  INFERENCE: platform lock-in is the defining QLab constraint — the entire
  existence of Show Cue System ("the Windows answer to QLab", per the
  landscape pass) and Linux Show Player is market evidence that users want
  the QLab model on other platforms. That is inference from product
  existence, not from a user complaint I read.
- FACT: the cue-as-document model is proprietary. **No evidence either way**
  on whether workspaces export to an open format. UNKNOWN; to check the QLab
  documentation.
- Counter-evidence against strong lock-in: FACT, the MIT-licensed
  first-party OSC libraries above mean control integration is genuinely open
  even if the document format is not.

**OFFLINE**

- UNKNOWN. Not verifiable. INFERENCE only: a macOS theatre playback tool
  used in venues without reliable internet almost certainly runs offline, but
  licence *activation* behaviour is the thing that actually matters and I
  have no evidence on it. To check: the QLab licensing FAQ.

**INTEGRATION PROBLEMS**

- FACT: OSC on port 53000 is the integration path (landscape pass), and the
  module tracker shows it is exercised hard. The gaps are the specific ones
  listed above — multi-argument OSC, cross-cue-list state scoping, and
  expression evaluation on returned values.

---

### Chataigne (Benjamin Kuperberg)

**STRENGTHS**

- FACT: the broadest protocol list in the middle tier (landscape pass), and
  the tracker confirms breadth by showing users pushing at its edges rather
  than asking for basics.
- FACT: actively developed with 2026-dated beta releases (issues #333/#334
  are both filed against `1.10.4b1`, 2026-08-12)
  (https://github.com/benkuper/Chataigne/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-desc).

**WEAKNESSES**

- **Crashes are the defining complaint.** FACT: a crash query returns 12
  issues from 2020 to 2026, **7 still open**: #321 "Crash After OSC"
  (2026-04-07); #301 "Crash: Setting Enum Value" (2025-10-16); #292 "Audio
  playback regression in v1.9.17" (2025-06-04); #291 "crash at when dmx
  routing" (2025-05-18); #276 "HTTPS requests crash with recent OpenSSL
  versions" (2025-02-09); #154 "Custom HTTP Module causes crash during
  multiple sendPOST" (2023-01-22); plus closed ones including #237 "Deleting
  just about anything results in crash" (2024-06-12) and #286 "OPENDMX
  Crashing when selecting com" (2024-04-26)
  (https://github.com/benkuper/Chataigne/issues?q=is%3Aissue+crash).
  Frequency: **recurring, spanning six years and every major subsystem**
  (OSC, DMX, HTTP/HTTPS, audio, UI editing). INFERENCE: for a tool whose job
  is to sit in the middle of a live show and translate protocols, an open
  crash list touching OSC, DMX and HTTP simultaneously is the most serious
  single finding in this dossier.
- FACT: 77 open issues total (read off the issues page header).
- FACT: no maintainer responses were visible on the pages fetched. UNKNOWN
  whether the maintainer responds elsewhere (the project has a Discord/forum
  presence per its README); I could not verify responsiveness and do not
  claim it is poor.

**MISSING FEATURES**

- FACT: #153 "Linux MQTT support" (2023-01-13); #47 "JACK/LV2 CV support"
  (2019-12-12); #197 "OSCQuery optional attributes" (2023-10-10); #329
  "SerialModule: DataBits, StopBits, Parity cannot be configured"
  (2026-06-17); #323 "MPV Player Pre-configured module" (2026-05-15); #325
  "Float Interpolation" (2026-06-02); #150 "iOS/iPad support request"
  (2023-01-07); #221 "Mouse scroll wheel support" (2024-02-21); #87 "Color
  type improvements" (2021-06-21).
- FACT: **#328 "MCP and version control support" (2026-06-17)** — users want
  their show logic under version control. INFERENCE: this is a
  strong signal for any tool in this space; show configuration is code, and
  users have started treating it as code.

**UX PROBLEMS**

- FACT: #169 "OpenGL Renderer UI issue" (2023-04-06); #71 "White interface
  when starting" (closed 2021-04-07). INFERENCE: GPU/renderer-dependent UI
  failures, which on rented or unknown show laptops is a bad class of bug.
- FACT: #333 "1.10.4b1 - won't quit on macOS" (2026-08-12); #334 "macOS
  15.7.9 character encoding issue in 1.10.4b1" (2026-08-12).

**PERFORMANCE PROBLEMS**

- Not separately evidenced beyond the crash set. UNKNOWN for large-project
  behaviour.

**PRICING PROBLEMS**

- FACT: free and GPLv3 (landscape pass). No pricing complaints possible.

**LOCK-IN**

- FACT: GPLv3, self-hosted. Low. The #328 version-control request implies
  the save format is not diff-friendly today. INFERENCE — I did not inspect
  the file format.

**OFFLINE**

- INFERENCE: fully offline-capable; nothing in the tracker suggests
  otherwise. One relevant FACT: #276 "HTTPS requests crash with recent
  OpenSSL versions" (2025-02-09) means outbound HTTPS integrations are the
  fragile part, not local operation.

**INTEGRATION PROBLEMS**

- FACT: #331 "double ping received OSC" (2026-07-23) and #123 "Mapping Bezier
  Curve OSC value issue" (2022-05-09) — OSC handling has edge cases.
- FACT: #171 "Elgato Stream Deck XL bug" (2023-04-17) — surface support is
  thinner than Companion's.
- FACT: #330 "Please consider signing and notarizing the macOS application"
  (2026-07-08). INFERENCE: unsigned macOS builds are a genuine deployment
  blocker in managed/corporate environments and on locked-down show machines
  — this is an adoption barrier disguised as a build-config request.
- FACT: #248 "Unable to install on OpenSuSE" (2024-09-19).

---

### ossia score (ossia.io / LaBRI)

**STRENGTHS**

- FACT: actively maintained, with issues filed as recently as 2026-08-28
  (#2242), 2.1k stars and 55 open PRs
  (https://github.com/ossia/score/issues).
- FACT: the landscape pass's distinctive claim — that ossia score loads
  Bitfocus Companion modules as its own device drivers — is **not
  contradicted** by anything found, but also **not confirmed** in this pass:
  a repo-scoped search for "companion" returned only #1483 "Support for
  sending multiple parameters via OSC" (2023-07-21, open, milestone
  release/4.0), and the page additionally reported a partial load error
  (https://github.com/ossia/score/issues?q=is%3Aissue+companion). UNKNOWN;
  to check: the ossia score documentation on device types.

**WEAKNESSES**

- **A very large, very old backlog.** FACT: **434 open issues**, with open
  items dating to 2015–2016: #147 "update rate management potential
  improvements" (2016-02-09); #187 "make selection of tools temporary"
  (2016-06-02); #41 "Automation doesn't respect custom min/max values"
  (2015-09-16); #344 "sort parameter name in alphabetical order in device
  explorer" (2016-12-16); #346 "node aliases" and #347 "permanent &
  pattern-matching mappings" (both 2016-12-16); #650 "search in state/debug
  mode" (2017-10-10); #659 "Improve Automation creation" (2017-10-12); #682
  "notify of creation after name change" (2017-11-20); #733 "Launch next
  available trigger keyboard shortcut" (2018-04-27)
  (https://github.com/ossia/score/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc).
  INFERENCE: research-project dynamics — deep capability, slow closure of
  usability papercuts. Frequency: **widespread as a pattern**, ten-plus
  usability requests open for 8–10 years.
- **Community infrastructure is rotting.** FACT: #2226 "Gitter signup does
  not work" (2026-08-20) and #2225 "Forum leads to some vpn provider"
  (2026-08-20). INFERENCE: a project forum domain that now resolves to a VPN
  vendor means the domain lapsed — that is a real risk signal for anyone
  betting a show on the tool's community support, and it is the kind of thing
  a procurement review should catch.
- FACT: #1905 "Crash when manipulating Images list" (2025-11-25).
- FACT: #2242 "gfx: OpenGL Window device renders nothing in a NoMachine
  session" (2026-08-28) — remote-desktop/GPU fragility, same class as
  Chataigne #169.

**MISSING FEATURES**

- FACT: #347 "permanent & pattern-matching mappings" and #346 "node aliases"
  (2016) — users want to address device trees by pattern rather than
  enumerate them. INFERENCE: this is the same underlying need as Companion's
  #1187 property model — address a *class* of endpoints, not each one.
- FACT: #1483 "Support for sending multiple parameters via OSC" (2023-07-21)
  — the multi-argument OSC problem again, third independent product.
- FACT: #733 keyboard shortcut for launching the next available trigger — a
  live-operation ergonomics gap.

**UX PROBLEMS**

- FACT: #187 (tool selection is modal when it should be temporary), #344
  (device explorer does not sort), #650 (no search in state/debug mode).
  Frequency: recurring; all long-open.
- FACT: #2227 "Please clarify in docs: can this software mix video sources?"
  (2026-08-20). INFERENCE: users cannot determine the product's capabilities
  from its documentation — a discoverability failure, and notable because
  the landscape pass positions ossia as powerful but niche.

**PERFORMANCE PROBLEMS**

- FACT: #147 "update rate management potential improvements" (2016) is the
  only performance-shaped open item found, and it is a decade old. UNKNOWN
  for current large-score behaviour.

**PRICING / LOCK-IN / OFFLINE**

- FACT: free (landscape pass). No pricing complaints. Self-hosted; no cloud
  dependency evidenced. Lock-in low.
- UNKNOWN: score file format portability.

**INTEGRATION PROBLEMS**

- Covered above: multi-argument OSC (#1483), pattern mappings (#347), and
  the unverified Companion-module-loading capability.

---

### Ontime 4.x (Carlos Valente / light-dev)

**STRENGTHS**

- FACT: active and shipping features — the releases page shows a steady
  4.6 → 4.13-beta cadence including custom HTML views and CSS overrides,
  spreadsheet import improvements, multi-rundown work, background rundown
  editing, cue numbering, custom presets and an MCP server integration
  (https://github.com/cpvalente/ontime/releases). **Release dates are
  deliberately not cited** — the page rendered years inconsistent with the
  issue timeline and I will not reproduce numbers I cannot trust.
- FACT: the tracker is responsive enough that requests get explicit
  decisions, including rejections (see #535 below).

**WEAKNESSES**

- **Timecode is explicitly out of scope.** FACT: #535 "Roll mode: SMPTE/MTC
  Timecode" was closed **"not planned"** (closed 2024-06-16)
  (https://github.com/cpvalente/ontime/issues?q=is%3Aissue+MIDI+timecode+LTC).
  INFERENCE: this is the sharpest capability boundary in the segment. Ontime
  makes the schedule the trigger source but declines to be a timecode master,
  so any workflow needing frame-accurate sync must bring another tool. That
  is a deliberate, defensible product decision — and a permanent integration
  seam for anyone building around it.
- **Automation outputs are OSC and HTTP only, and the tracker offers no
  counter-evidence.** FACT: a repo-scoped query for automation/DMX/MIDI
  outputs returned **no results**
  (https://github.com/cpvalente/ontime/issues?q=is%3Aissue+automation+output+DMX+MIDI+trigger).
  INFERENCE, stated carefully: absence of requests is *not* proof of a gap
  being unfelt — it is equally consistent with users routing Ontime through
  Companion or MIDIMonster and never filing against Ontime at all. That
  routing is itself the finding.
- **Template interpolation fails open, printing raw syntax to air.** FACT:
  #1546 "Automation Variable Handling Issue" (2025-03-18, open, labelled
  "improvement") — an OSC automation sending to
  `/ontime/message/timer/text` with `{{eventNext.custom.Performers}}`
  outputs the literal template string "Next Up:
  {{eventNext.custom.Performers}}" when the custom field is null, instead of
  an empty string or a fallback. Reported on v3.14.1; no maintainer comment
  visible (https://github.com/cpvalente/ontime/issues/1546). INFERENCE: this
  is an on-air-text failure mode — the unresolved placeholder reaches a
  display surface. Severity is higher than its "improvement" label suggests.

**MISSING FEATURES**

- FACT: #1898 "Have a global time offset … for different time zone"
  (2025-11-30); #1614 "Milliseconds or Frames - More Precise for Video Work?"
  (2025-05-21); #191 "Reach Schedule: speed up / slow down timers"
  (2022-08-09); #1563 "Time adaptation based on real time" (2025-04-01);
  #2073 "Consider using ntpjs.org for more accurate time for global
  audience" (2026-05-04); #99 "Delay support in roll mode" (2022-01-29)
  (https://github.com/cpvalente/ontime/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc).
  Frequency: **recurring — time precision and time authority is the dominant
  request theme**, six independent issues across four years.
- FACT: #1221 "Edit multiple events" (2024-09-21) — bulk editing again, the
  same gap as Companion #2834.
- FACT: #1499 "Add real preview in editor view" (2025-02-15).
- FACT: #1034 "Play sound when timer is up" (2024-06-02).

**UX PROBLEMS**

- FACT: #2063 "BUG: Share Ontime Link section in settings has broken
  clipboard copy flow" (2026-04-16).
- FACT: the changelog shows recurring fixes for "escaping out of a time
  value", pending-state management, and data leaking between interface
  sections. INFERENCE: time-entry fields are hard to get right and remain a
  source of user error.

**PERFORMANCE PROBLEMS**

- FACT: the changelog repeatedly addresses legacy-browser support and
  platform-specific rendering on iOS and Safari. Frequency: recurring.
  INFERENCE: Ontime's views are consumed on whatever screen is available in
  the venue — old smart TVs, tablets, presenter monitors — so browser
  compatibility is a first-order production concern, not a nicety.

**PRICING PROBLEMS**

- FACT: free, GPLv3 (landscape pass). None applicable.

**LOCK-IN**

- Low (GPLv3, self-hosted). FACT: spreadsheet import/export is a first-class,
  actively-developed path per the changelog, which is the opposite of
  lock-in. INFERENCE: the changelog also shows import/export needing constant
  refinement (column handling, preview accuracy), so the *interop* works but
  is fiddly.

**OFFLINE**

- **Mostly offline, with one caveat users have identified themselves.**
  FACT: #2073 asks for an internet NTP source for accurate time with a global
  audience, and #2002 asks for PWA support so Ontime screens work on mobile
  devices (2026-03-12). INFERENCE: the core runs on the LAN, but *time
  authority* is the thing that wants the internet — and on an isolated show
  network that means clock drift between Ontime and everything else is the
  user's problem.

**INTEGRATION PROBLEMS**

- Summarised: OSC and HTTP out, no timecode in or out by design, and
  template interpolation that fails visibly. INFERENCE: Ontime is best
  understood as a schedule *source* that needs a translation layer
  (Companion, MIDIMonster, Chataigne) to reach anything that is not
  HTTP/OSC-speaking.

---

### Linux Show Player (LiSP)

**STRENGTHS**

- FACT: maintained, with 0.6.5 released 2024-04-09 including improved dB
  meters, crash fixes and Python 3.13 support, and with multiple
  contributors and CI builds for both `develop` and `master`
  (https://github.com/FrancescoCeruti/linux-show-player/releases).
- FACT: it is the only free Linux theatre cue player of consequence in the
  landscape, and it does the core job.

**WEAKNESSES**

- **The Linux audio stack is the recurring enemy.** FACT: #286 "Jack
  playback with pipewire is currently broken" (2023-11-03, open); #131
  "Delay when starting audio cues for the first time" (2018-08-17, open);
  #341 "Looping media tracks is broken/no longer works" (2025-02-18, open)
  (https://github.com/FrancescoCeruti/linux-show-player/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc).
  Frequency: recurring. INFERENCE: #131 in particular — first-cue latency —
  is a *theatre-fatal* bug class: the first cue of the show is the one that
  must not be late.
- **Release cadence has slowed.** FACT: 0.6.5 (2024-04-09) is the newest
  release listed; the prior four releases cluster in 2022–2023. INFERENCE:
  roughly two years without a release at the time of writing suggests reduced
  velocity, though the project is not dead — I found no abandonment notice
  and the release notes show recent dependency work.
- FACT: very old open requests — #38 "Translations" (2016-08-25) and #3
  "Video playback/Run Command cues" (2015-08-30), the latter being a
  fundamental capability gap open for eleven years.

**MISSING FEATURES**

- FACT: #3 video playback (2015); #101 "Near end fade-out" (2018-02-26);
  #96 "'next' cue setting" (2018-01-09); #197 "Trying to set the keys for
  every action" (2020-02-01, i.e. full key rebinding); #158 "New features for
  Preferences" (2019-02-26); #129 "Action cue or another way to close LiSP"
  (2018-08-13); #110 "Some features requests" (2018-04-11).

**UX PROBLEMS**

- FACT: #219 "Pressing Space at a running cue should not stop it"
  (2021-11-23). INFERENCE: a live-operation safety issue — the GO key
  doubling as a stop key is how shows get killed mid-cue.
- FACT: #125 "Rename Pages and moving cues - suggestions" (2018-07-03).

**PERFORMANCE PROBLEMS**

- FACT: #131 first-cue start delay, above.

**PRICING / LOCK-IN**

- FACT: free, GPLv3 (landscape pass). None applicable. Lock-in low.

**OFFLINE**

- INFERENCE: fully offline. Nothing in the tracker suggests any network
  dependency.

**INTEGRATION PROBLEMS**

- FACT (landscape pass): Art-Net and MIDI timecode output exist. This pass
  found no integration complaints — INFERENCE: because the user base is
  small and the integrations are narrow, not because they are flawless.

---

### MIDIMonster (cbdev / Fabian J. Stumpf)

**STRENGTHS**

- FACT: genuinely broad — the repo homepage documents 18+ backends: MIDI
  (ALSA/JACK), JACK CV, RTP-MIDI, ArtNet v4, sACN/E1.31, OpenPixelControl,
  OLA, MA Web Remote, OSC, MQTT (5 and 3.1.1), VISCA, evdev/wininput, Lua,
  Python and loopback, across Linux, Windows and macOS with per-platform
  availability (https://github.com/cbdevnet/midimonster).
- FACT: it does the one thing nothing else in the landscape does — arbitrary
  channel-level translation between any two of those.

**WEAKNESSES**

- **Maintenance velocity is the concern.** FACT: 49 open issues; 617 commits;
  the releases page lists v0.1 through v0.6 and the v0.6 notes themselves say
  the release came "after a pretty long time in development"
  (https://github.com/cbdevnet/midimonster/releases). **The release years did
  not render on the page and are therefore not cited.** The newest *open
  issue* is #150 (2026-04-25), so users are still filing.
  INFERENCE, stated as inference: a sub-1.0 version number, a self-described
  long development gap, and 49 open issues with requests dating to 2023 still
  open (#132, #133, #135, #136, #138, #139) point to a low-bandwidth
  single-maintainer project. UNKNOWN: actual last-commit date — the repo
  homepage did not render it. To check: the commits page.
- **Documentation/usability is a barrier.** FACT: multiple open issues are
  *questions*, not bugs — #150 "how to send OSC without value?"
  (2026-04-25), #133 "Help sending OSC commands" (2023-07-25), #132 "Midi to
  Mouse position" (2023-06-12)
  (https://github.com/cbdevnet/midimonster/issues?q=is%3Aissue+is%3Aopen).
  INFERENCE: when the tracker is being used as a support forum, the
  configuration syntax is not self-explanatory. For a config-file-driven tool
  with no GUI, that is the adoption ceiling.

**MISSING FEATURES**

- FACT: #144 "[Midi Backend] Implement hotswap support" (2024-08-05).
  INFERENCE: no MIDI hotplug means unplugging a controller mid-show does not
  recover — the same failure class as Companion Satellite #343 and Stream
  Deck sleep/wake.
- FACT: #149 "OSC - send strings" (2025-08-26) and #150 "send OSC without
  value" — OSC type coverage is incomplete. **Third independent product with
  OSC argument-handling gaps.**
- FACT: #147 "Convert event to value and vice-versa" (2024-12-19) — the
  event/state impedance mismatch, in a tool whose entire job is conversion.
- FACT: #140 "More VISCA backend commands for PTZOptics cameras"
  (2024-05-10) and #135 "VISCA backend for Sony Cameras" (2023-10-26).
  INFERENCE: VISCA support is partial and vendor-specific — directly relevant
  to the camera-control segment of this corpus.
- FACT: #136 "MIDI Data Output Monitoring + Launchpad Mini Mk2 Pad Backlight"
  (2023-11-30) — no monitoring/diagnostic view.

**UX PROBLEMS**

- INFERENCE: no GUI; configuration is a text file. The question-shaped issues
  above are the UX complaint in its available form.

**PERFORMANCE PROBLEMS**

- None found. UNKNOWN.

**PRICING**

- FACT: free (landscape pass). None applicable.

**LOCK-IN / OFFLINE**

- Lock-in minimal (plain-text config, free licence). Fully offline by nature.

**INTEGRATION PROBLEMS**

- FACT: #142 "sACN universe list in discovery messages uses incorrect byte
  ordering" (2024-06-17) — a **protocol-conformance defect**, open for over
  two years. INFERENCE: this is the most concerning single item, because
  incorrect byte ordering in discovery means the tool misbehaves on a shared
  lighting network in a way other vendors' devices will see.
- FACT: #138 "rtpMIDI Receiving but Not able to send" (2023-12-20) —
  half-duplex in practice.
- FACT: #139 "Midi Velocity with winmidi" (2024-01-08) — Windows backend
  parity gap.

---

### CueServer 3 (Interactive Technologies)

**Evidence: very thin.** Only one reachable page.

- FACT: a Companion module exists —
  `bitfocus/companion-module-interactivetechnologies-cueserver` — with **one
  open issue**, #11 "CueServer & Dials/Encoders" (2025-03-14), and issue
  creation restricted on the repo
  (https://github.com/bitfocus/companion-module-interactivetechnologies-cueserver/issues?q=is%3Aissue).
- INFERENCE (weak, and I flag it as such): one open issue can mean the
  integration is solid, or that the user base is small, or that support
  happens through the vendor rather than GitHub. With issue creation
  restricted, the tracker is not a reliable proxy for user sentiment.
  I decline to characterise CueServer's weaknesses from this.
- STRENGTHS / WEAKNESSES / UX / PERFORMANCE / OFFLINE: **UNKNOWN.** To check:
  the Interactive Technologies support forum, ControlBooth, LightNetwork, and
  the CueScript documentation.
- PRICING: the landscape pass recorded Core at USD 1,889.16 at a dealer
  against a USD 2,249.00 list. **Not re-verified in this pass** — treat as a
  landscape-pass claim needing a fresh date-stamped check.

---

### Medialon Manager V7.1 / Showmaster (7thSense)

**Evidence: essentially nil, and that is itself a finding.**

- FACT: **no Bitfocus Companion module exists for Medialon** — an org-scoped
  repository search returned "No repositories matched your search"
  (https://github.com/orgs/bitfocus/repositories?q=medialon).
- INFERENCE: in a segment where Companion has modules for hundreds of
  devices including the much smaller CueServer, the absence of a Medialon
  module suggests either a closed/undocumented control interface, a user base
  that does not overlap with Companion's, or both. Medialon sits in
  themed-entertainment and large installs where it *is* the top-level
  controller rather than a device to be controlled — INFERENCE, consistent
  with the landscape pass positioning.
- All other categories: **UNKNOWN.** No 7thSense page, forum or changelog was
  reachable. PRICING: landscape pass says "requires sales contact"; not
  re-verified.
- To check: 7thSense's Medialon documentation and release notes, AVSForum's
  themed-entertainment threads, and any Medialon Lua/API client on GitHub
  (the global GitHub search that would have found one was rate-limited at
  429).

---

### Show Cue System (SCS)

- **UNKNOWN across every category.** No GitHub presence, and
  `showcuesystems.com` was not attempted after the pattern of egress blocks
  was established. The landscape pass positions it as the Windows answer to
  QLab with DMX.
- To check: the SCS website's version-history page (vendor changelogs are the
  brief's angle 6 and would show what keeps breaking), plus ControlBooth and
  Blue Room threads.

---

## Cross-product patterns

These repeat across **multiple independent vendors** and are the most
valuable findings in the dossier.

### 1. Control layers are write-only: they can trigger, but not report

The single strongest pattern. Companion's most-reacted open issue is #1695,
asking the REST API to return button *state* rather than only accept presses,
with an explicit middleware use case (drive a third-party surface's colours
from mixer mute state). Behind it sit eleven more `area/protocol` requests
for readback — enumerate variables, get image library, deeper API
information, surface names over the Satellite API, GET support on the HTTP
API. Elgato's SDK has the mirror problem in #137 (the "running application"
indicator is rendered by the host and not exposed to plugins) and #149 (no
obvious way to actuate a button programmatically). Frequency: **widespread**.

**Why it matters to us:** every one of these products is a fire-and-forget
trigger surface, and users are repeatedly asking them to become
*bidirectional state mirrors*. A planning tool that models what a button
*means* — which device, which parameter, which expected state — sits exactly
on the seam these users are trying to close by hand.

### 2. OSC's argument model defeats three separate products independently

Companion's QLab module #201 cannot handle OSC strings with multiple
arguments. ossia score #1483 requests support for sending multiple parameters
via OSC. MIDIMonster #149 requests string sending and #150 asks how to send
OSC with no value at all. Three unrelated codebases, three teams, the same
gap. Frequency: **widespread**.

**INFERENCE:** OSC is universally adopted and inconsistently implemented. The
"broadest protocol list" marketing claim in this segment usually means "we
send OSC", and it hides the fact that argument typing, multi-argument
messages and valueless messages are where interop actually breaks.

### 3. Values arrive as strings, so nobody can do arithmetic on them

QLab module #185: `$(qlab-mycon:n_num) + 2` renders as `"10 + 2"`. Ontime
#1546: `{{eventNext.custom.Performers}}` reaches an on-air text surface
verbatim when the field is null. Companion `companion-module-base` #210 asks
to unify all the "takes a string but may optionally be an expression" fields
because the inconsistency is systemic. Frequency: **recurring across three
products**.

**INFERENCE:** these systems pass values as untyped strings between layers
and only sometimes evaluate them. The user-visible symptoms are two: you
cannot compute on a value, and unresolved templates fail *open* — printing
their own syntax to a screen an audience can see. A typed value model with
explicit null handling is the fix, and it is a design decision, not a
feature.

### 4. Hotplug, sleep/wake and network-drop recovery are broken everywhere

Companion Satellite #343 (Windows never reconnects after the network adapter
drops — restart required). Elgato's own SDK #157 (events silently stop after
sleep/wake, undetectable by plugins). `python-elgato-streamdeck` #78 (recover
from suspend and resume, open since 2021). MIDIMonster #144 (MIDI hotswap not
implemented). Companion Satellite #253 (only some Stream Decks detected).
Frequency: **widespread — four vendors, five years**.

**INFERENCE:** the entire segment assumes devices are enumerated once at
startup and never change. Real show environments violate that assumption
constantly — switches reboot, laptops sleep in the case, USB hubs
brown out, someone unplugs the wrong thing during a scene change. The
recurring user experience is "it worked at rehearsal and was dead at the
half."

### 5. No redundancy story, in a segment that calls itself mission-critical

Companion #4073 is a user running 15 Stream Decks asking for satellite
failover to a backup server, using the words "very mission critical to our
productions" — labelled `Needs beer!` with no maintainer answer visible.
Companion #268 asked for "assignment of backup instances" in **2018** and is
still open. Frequency: **isolated as filed issues, structural as a gap** —
and note that nothing else in the landscape advertises failover either.

**INFERENCE:** show control has adopted the reliability *expectations* of
broadcast infrastructure without the redundancy *architecture*. This is the
clearest unserved need in the segment.

### 6. Bulk editing is missing everywhere, and users ask for it repeatedly

Companion #4028 (copy action/feedback between buttons, second-most-reacted),
#2834 (multi-button select for copy/paste/delete, milestone v5.1), #1061
(linked button copy, open since 2020). Ontime #1221 (edit multiple events).
Frequency: **recurring across two products**.

**INFERENCE:** these tools are built around editing one object at a time. As
soon as a show has hundreds of buttons or events, the editing model is the
bottleneck — which is exactly the moment a planning tool should own the data.

### 7. Show configuration wants to be under version control, and is not

Chataigne #328 asks for version-control support outright. Companion #4396
asks for an "Import Configuration" internal action; #1924 asks for custom
presets; #3430 asks to load a config file via the API. Frequency:
**recurring**.

**INFERENCE:** users have started treating show configuration as source code
— they want diffs, history, and reproducible deployment. None of these tools
offer it. Their save formats are opaque blobs.

### 8. Referential integrity breaks silently when things are reordered

Companion #3082: reordering pages breaks "Set to page" buttons. Frequency:
**isolated as evidence**, but I include it because the failure class matters
enormously for a planning tool — references stored by position rather than by
stable id are a silent-corruption generator, and this is a live example from
a mature product.

### 9. GPU, renderer and remote-desktop fragility

Chataigne #169 (OpenGL renderer UI issue) and #71 (white interface at start).
ossia score #2242 (OpenGL window renders nothing over NoMachine). Frequency:
**recurring across two products**.

**INFERENCE:** show machines are rented, remote-administered and
GPU-heterogeneous. GPU-accelerated UIs fail on exactly those machines, and
"renders nothing over remote desktop" defeats the standard way of supporting
a rack-mounted show computer.

### 10. Deployment friction: unsigned builds and Linux packaging

Chataigne #330 asks for macOS signing and notarization; #248 cannot install
on OpenSUSE. `streamdeck-linux-gui` has nine open install/build/runtime
failures across Fedora, pip, AUR and libusb. LiSP fights PipeWire and JACK.
Frequency: **widespread on Linux and macOS-unsigned**.

**INFERENCE:** free tools in this segment are gated less by capability than
by whether they install on a managed machine. An unsigned macOS binary is
simply not deployable in many venues and corporate environments.

### 11. Maintainer bandwidth is the real roadmap

Companion's `Needs beer!` queue holds a dozen 2026 architectural items.
ossia score carries 434 open issues with usability requests open since 2015.
MIDIMonster is pre-1.0 with 49 open issues and a self-described long gap
between releases. LiSP's newest release is 2024-04-09 with a fundamental
video-playback request open since 2015. Chataigne has 7 open crash issues
across six years. Frequency: **widespread**.

**INFERENCE:** the free tier of this segment is load-bearing for the entire
industry and is maintained by a handful of people. That is simultaneously the
reason the tools are good and the reason large users are nervous — and
ossia's #2225 (the project forum domain now resolving to a VPN vendor) is
what the tail end of that risk looks like.

### 12. Rendering the button is harder than controlling the device

Companion's largest open bug class by count is button graphics and text
layout (#4359, #4372, #4352, #4380, #3671, #4292), and its changelog fixes
gauges, colour parsing, clipping, rotation and text positioning release after
release. `python-elgato-streamdeck` reports per-model image glitches (#142,
#47), touchscreen buffer interference (#130) and slow key-image upload
(#162). Companion #262 (animated buttons) has been open since 2018.
Frequency: **widespread across the software/hardware boundary**.

**INFERENCE:** the surface is a display device with a slow, quirky,
per-model image pipeline, and everything above it inherits those constraints.
Blink desynchronisation (Companion #4292) is what slow image push looks like
from the operator's chair.

---

## Direct quotes-of-substance

All paraphrased or short-quoted from pages I actually opened. Dates are the
issue dates shown by GitHub.

1. **Companion is mission-critical and has no failover.** A user running 15
   Stream Decks and building automation asks for satellite instances and
   Elgato network docks to fail over to a backup server, plus active
   replication to a secondary, describing Companion as "very mission critical
   to our productions." Labelled `Needs beer!`; no maintainer reply visible.
   — https://github.com/bitfocus/companion/issues/4073 (2026-04-04)

2. **The API can press but not read.** The top-reacted open request asks for
   a `/get/bank/1/1` endpoint and JSON state on the `/press` route so
   third-party surfaces can colour their buttons from device state, and so
   OBS/vMix can use Companion as middleware.
   — https://github.com/bitfocus/companion/issues/1695

3. **Module authors write the same value three times.** The property-model
   proposal states the goal is "to avoid having to expose an action, feedback
   and variable for the same value," and that the current approach "leads to
   the functionality and flow being inconsistent even within modules,"
   multiplying for devices with many instances such as per-channel audio.
   — https://github.com/bitfocus/companion/issues/1187

4. **Arithmetic on a QLab cue number produces a string.** Entering
   `$(qlab-mycon:n_num) + 2` in "goto cue by cue number" produces the literal
   `"10 + 2"` rather than `12`; several syntax variants were tried.
   — https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues/185
   (2025-10-21)

5. **An unresolved template goes to air.** An Ontime OSC automation to
   `/ontime/message/timer/text` emits "Next Up:
   {{eventNext.custom.Performers}}" verbatim when the custom field is null,
   instead of an empty value. Filed against v3.14.1, labelled "improvement."
   — https://github.com/cpvalente/ontime/issues/1546 (2025-03-18)

6. **Timecode is explicitly refused.** A request for SMPTE/MTC timecode in
   Ontime's roll mode was closed **"not planned."**
   — https://github.com/cpvalente/ontime/issues?q=is%3Aissue+MIDI+timecode+LTC
   (closed 2024-06-16)

7. **A surface that never comes back.** Companion Satellite on Windows never
   reconnects to Companion after the network adapter drops; the application
   must be restarted.
   — https://github.com/bitfocus/companion-satellite/issues?q=is%3Aissue+is%3Aopen
   (#343, 2026-08-23)

8. **Elgato's own SDK loses events after sleep, silently.** Action and
   property-inspector events stop being delivered after system sleep/wake,
   with no mechanism for plugin developers to detect or recover.
   — https://github.com/elgatosf/streamdeck/issues?q=is%3Aissue+is%3Aopen
   (#157, 2026-07-14)

9. **The same suspend/resume gap, five years earlier, in the independent
   driver.** "Recover from suspend and resume" has been open since
   2021-09-16.
   — https://github.com/abcminiuser/python-elgato-streamdeck/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
   (#78)

10. **Chataigne crashes across every subsystem it bridges.** Open crash
    reports cover OSC (#321, 2026-04-07), enum editing (#301, 2025-10-16),
    DMX routing (#291, 2025-05-18), HTTPS with recent OpenSSL (#276,
    2025-02-09) and repeated HTTP POSTs (#154, 2023-01-22); a closed one
    reported that "deleting just about anything results in crash" (#237,
    2024-06-12).
    — https://github.com/benkuper/Chataigne/issues?q=is%3Aissue+crash

11. **Users want show logic in git.** A Chataigne request asks outright for
    "MCP and version control support."
    — https://github.com/benkuper/Chataigne/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-desc
    (#328, 2026-06-17)

12. **An unsigned macOS binary is a deployment blocker.** "Please consider
    signing and notarizing the macOS application."
    — same page (#330, 2026-07-08)

13. **A project's own forum domain now points at a VPN vendor.** Two issues
    filed the same day report that the ossia forum link leads to a VPN
    provider and that Gitter signup does not work.
    — https://github.com/ossia/score/issues (#2225 and #2226, both
    2026-08-20)

14. **Users cannot tell what ossia score does from its docs.** "Please
    clarify in docs: can this software mix video sources?"
    — https://github.com/ossia/score/issues (#2227, 2026-08-20)

15. **The first cue is late.** "Delay when starting audio cues for the first
    time" has been open in Linux Show Player since 2018-08-17.
    — https://github.com/FrancescoCeruti/linux-show-player/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
    (#131)

16. **The GO key also kills the cue.** "Pressing Space at a running cue
    should not stop it."
    — same page (#219, 2021-11-23)

17. **A protocol-conformance bug, open for two years.** MIDIMonster's sACN
    universe list in discovery messages uses incorrect byte ordering.
    — https://github.com/cbdevnet/midimonster/issues?q=is%3Aissue+is%3Aopen
    (#142, 2024-06-17)

18. **The tracker is being used as a manual.** Open MIDIMonster issues
    include "how to send OSC without value?" (#150, 2026-04-25) and "Help
    sending OSC commands" (#133, 2023-07-25).
    — same page

19. **Companion became unusable for one user at v3.5.2.** A vMix transition
    action took 5–6 seconds and custom-variable operations were badly
    delayed; the reporter called it "practically unusable." Closed against
    the v4.0 milestone.
    — https://github.com/bitfocus/companion/issues/3324 (closed 2025-09-16)

20. **Reordering pages silently breaks button targets.** "Reordering pages
    breaks 'Set to page' buttons."
    — https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+label%3ABUG+sort%3Acomments-desc
    (#3082, 2024-10-11)

---

## What this pass could not answer (open questions for the next pass)

Listed explicitly so the gaps are not mistaken for findings.

1. **All pricing.** QLab tiers, Bitfocus Buttons, Stream Deck hardware,
   CueServer (re-verification), Medialon. Requires `qlab.app`, `bitfocus.io`,
   Elgato store, dealer listings — all blocked.
2. **All end-user UX and purchasing sentiment.** Requires Reddit, G2,
   Capterra, TrustRadius, ControlBooth, Blue Room, ProSoundWeb — all blocked.
3. **All German-language sources.** film-tv-video.de, production-partner.de,
   veranstaltungstechnik forums — unexecuted. For a German-market product
   this is a material gap.
4. **Show Cue System and Medialon** — effectively unresearched.
5. **QLab's application-level behaviour** — everything above is API-level,
   read through integrators.
6. **Whether ossia score really loads Companion modules** — the landscape
   pass's most distinctive claim about this product remains unverified.
7. **MIDIMonster's actual last-commit date** — needed to judge abandonment
   risk properly.
8. **Vendor changelogs and known-issues pages** (brief angle 6) — only
   GitHub-hosted ones (Companion, Ontime, LiSP, MIDIMonster) were reachable.

---

## Sources

Every URL below was opened and read in this pass. GitHub was the only
reachable host.

**Bitfocus Companion (core)**
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+label%3ABUG+sort%3Acomments-desc
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+label%3Aarea%2Fprotocol
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+label%3A%22Needs+beer%21%22
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+streamdeck+OR+surface
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+module+store+offline+install
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+performance+slow+lag
- https://github.com/bitfocus/companion/issues/1187
- https://github.com/bitfocus/companion/issues/1695
- https://github.com/bitfocus/companion/issues/2405
- https://github.com/bitfocus/companion/issues/3324
- https://github.com/bitfocus/companion/issues/4073
- https://github.com/bitfocus/companion/releases
- https://github.com/bitfocus/companion/discussions?discussions_q=sort%3Atop

**Companion satellite, module API and vendor modules**
- https://github.com/bitfocus/companion-satellite/issues?q=is%3Aissue+is%3Aopen
- https://github.com/bitfocus/companion-module-base/issues
- https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues?q=is%3Aissue
- https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues/184
- https://github.com/bitfocus/companion-module-figure53-qlab-advance/issues/185
- https://github.com/bitfocus/companion-module-interactivetechnologies-cueserver/issues?q=is%3Aissue
- https://github.com/orgs/bitfocus/repositories?q=medialon (negative result)

**Chataigne**
- https://github.com/benkuper/Chataigne/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/benkuper/Chataigne/issues?q=is%3Aissue+crash
- https://github.com/benkuper/Chataigne/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-desc

**ossia score**
- https://github.com/ossia/score/issues
- https://github.com/ossia/score/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/ossia/score/issues?q=is%3Aissue+companion

**Ontime**
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+MIDI+timecode+LTC
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+automation+output+DMX+MIDI+trigger (negative result)
- https://github.com/cpvalente/ontime/issues/1546
- https://github.com/cpvalente/ontime/releases

**Linux Show Player**
- https://github.com/FrancescoCeruti/linux-show-player/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/FrancescoCeruti/linux-show-player/releases

**MIDIMonster**
- https://github.com/cbdevnet/midimonster
- https://github.com/cbdevnet/midimonster/issues?q=is%3Aissue+is%3Aopen
- https://github.com/cbdevnet/midimonster/releases

**Stream Deck hardware, SDK and QLab client libraries**
- https://github.com/abcminiuser/python-elgato-streamdeck/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/streamdeck-linux-gui/streamdeck-linux-gui/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/elgatosf/streamdeck/issues?q=is%3Aissue+is%3Aopen
- https://github.com/elgatosf/streamdeck-javascript-sdk/issues?q=is%3Aissue (archived repo)
- https://github.com/Figure53/QLabKit.objc/issues?q=is%3Aissue
- https://github.com/orgs/figure53/repositories

**Attempted and blocked** (recorded for the next pass, no content read)
- https://www.reddit.com/r/techtheatre/… — fetch refused
- https://old.reddit.com/r/techtheatre/… — fetch refused
- https://qlab.app/docs/v5/ — EGRESS_BLOCKED
- https://www.controlbooth.com/search/ — EGRESS_BLOCKED
- https://www.capterra.com/p/216097/QLab/ — EGRESS_BLOCKED
- https://forum.blackmagicdesign.com/ — EGRESS_BLOCKED
- https://bitfocus.io/buttons — EGRESS_BLOCKED
- https://github.com/search?q=qlab+osc&type=repositories — HTTP 429, Retry-After 3600
