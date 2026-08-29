# Pain points: Camera Control / RCP / CCU / Paint

Research date: 2026-08-29 (the task brief was dated 2026-08-28; every price below carries
the date it was seen).
Researcher: automated user-research pass, AV Planner Suite research corpus.
Companion dossier: `landscape/camera-control-rcp.md` (what the products are and do).

---

## Method

### What was searched

10 web searches plus 41 pages opened and read directly, across the angles the brief
requires. The mix is unusual for this corpus: **this segment's evidence is overwhelmingly
primary — vendor documentation source, changelogs and issue trackers — and almost entirely
missing the practitioner-forum layer.** Read the caveats below before weighting anything.

| Angle | What happened |
| --- | --- |
| GitHub issues / discussions | **Executed well.** 8 repositories mined via the GitHub API and 20+ issue pages opened: `glikely/obs-ptz`, `gphoto/libgphoto2`, `bitfocus/companion-module-bmd-atem`, `bitfocus/companion-module-bmd-cameras`, `bitfocus/companion-module-panasonic-cameras`, `bitfocus/companion-module-skaarhoj-rawpanel`, `bitfocus/companion-module-requests`, `SKAARHOJ/skaarhoj-updater-releases`, `DylanSpeiser/BM-Camera-Control-WebUI`, `DelphiForBroadcasting/sony-700ptp-protocol`, `GrantSparks/grafton-visca`. |
| Vendor changelogs / known issues | **Executed well, unexpectedly.** Cyanview's support site is blocked at `support.cyanview.com`, but its **Docusaurus source repository is public on GitHub** (`AlanOgic/cyanview-support`, deploys to `support.cyanview.cloud`). That gave direct read access to the FAQ, troubleshooting guide, licensing guide, release notes, product pages and the 240-row camera-compatibility CSV. This is the richest single source in the dossier. |
| Review sites (G2, Capterra, TrustRadius, Trustpilot) | **Not applicable and not executed.** This segment is hardware panels and free open-source glue. None of these products is a SaaS with a review-site presence. Absence of review-site evidence here is a property of the market, not a gap in the method. |
| Reddit | **Not executed. Blocked twice over.** `reddit.com` is unreachable from this container, and the search tool refuses the domain outright (`The following domains are not accessible to our user agent: reddit.com`). Neither `site:reddit.com` queries nor natural-language queries surfaced a single usable r/VIDEOENGINEERING thread. **Treat the absence of Reddit evidence as a hole in this dossier, not as evidence that shaders do not complain there.** |
| Professional forums | **Largely blocked.** `forum.blackmagicdesign.com`, `obsproject.com`, `wiki.skaarhoj.com`, `codeblog.jonskeet.uk` all returned `EGRESS_BLOCKED`. Two Blackmagic-forum threads and one OBS-forum thread were reachable **only as search-engine extracts** and are labelled as such. |
| German-language sources | **Attempted, produced nothing.** A `film-tv-video.de` query for Cyanview/Kamerakontrolle returned only vendor and dealer pages. No German practitioner discussion of this segment was found. This is a genuine gap. |

### Serious methodological caveats — read before trusting anything below

1. **The search budget ran out mid-pass** (200/200 calls, shared across the whole research
   session). Roughly six planned angles — ATEM-over-SDI limits in forum discussion,
   Companion feedback-drift discussion, Panasonic AW-RP panel complaints, NDI/ONVIF
   control gaps, German sources, and a second Skaarhoj pass — were **not run**. The
   remaining work was done with direct fetches only, which is why GitHub dominates.
2. **Practitioner voice is nearly absent.** Almost everything below is what an engineer
   wrote in a bug tracker or what a vendor wrote in its own documentation. There is very
   little of what a shader says at 2 a.m. in an OB truck. The frequency grades reflect this:
   several complaints that are almost certainly `widespread` in the field are graded
   `recurring` because I can only see the developer-facing half of the evidence.
3. **Attribution caveat on the Cyanview repository.** `AlanOgic/cyanview-support` is a
   **personal** GitHub account whose README describes deploying the built site to
   `support.cyanview.cloud` and mentions a "Cyanview RAG backend". Its content matches what
   the search engine returns for `support.cyanview.com`. **INFERENCE:** it is the working
   source repository for Cyanview's own support site. I have treated it as vendor
   documentation, but it is not served from a cyanview.com domain, so a reader who needs
   certainty should re-verify each claim against `support.cyanview.com` directly.
4. **Prices are dealer-advertised, read via search extract, not opened directly.** Both
   `videoplusfrance.com` and `shop.us.skaarhoj.com` are blocked. Every price below is
   marked `via search extract` and should be re-checked before it is quoted to anyone.
5. **No verbatim quotes from forums.** The "quotes of substance" section is paraphrase
   throughout except where the text came from a page I actually opened, which is marked.
   Nothing is invented.

### Frequency grading used

`isolated` = one report. `recurring` = several independent sources or several independent
reporters in one tracker. `widespread` = a theme visible across multiple vendors and
multiple source types.

---

## Per-product findings

### Cyanview RCP / RCP-J

The most-documented product in the segment, because Cyanview publishes an unusually candid
support corpus. Most of what follows is the vendor describing its own limits.

**STRENGTHS (what even the constraints concede)**

- FACT: one panel really does reach across brands. The compatibility CSV carries roughly
  **240 camera entries** across ARRI, Blackmagic, BirdDog, Canon, Dreamchip, IOI, JVC,
  Marshall, Panasonic, RED, Sony, Z CAM and others, each with a port type, a protocol and a
  Cyanview cable reference. Nothing else in this segment publishes a matrix of that size.
  (`docs/integrations/Cyanview_Compatible_Cameras.csv`)
- FACT: the paint surface is a real CCU surface, not a PTZ remote — iris, gain, shutter,
  colour matrix, black level, knee, gamma, detail, plus scene-file save/recall/copy across
  cameras. (`docs/products/rcp.md`)
- FACT: the release notes show active per-camera maintenance, including fixes landing for
  specific bodies (Canon CR-N700 iris close, Canon C300 OSD commands, Sony Z200).
  (`docs/reference/release-notes.md`)

**WEAKNESSES**

- FACT, and the single most important finding in this dossier: **a large share of supported
  cameras are controlled open-loop.** The CSV marks **8 camera families as "unidirectional
  control — no camera feedback"**: Canon C100, C200, C300 Mk I, C300 Mk II, C500 Mk I, C700,
  XF705; Blackmagic SDI control; and Sony LANC cameras. The Blackmagic SDI row states
  outright that **"values displayed on RCP may drift from actual camera state."** The panel
  is showing you a number it hopes is true. Frequency: `widespread` — the same architecture
  appears in every vendor's SDI/LANC/Remote-A path.
- FACT: **only one RCP can own a given CI0.** From the FAQ: in a multi-RCP, multi-CI0
  network, "Only **one** RCP can control a given CI0 and its connected cameras"; once a CI0
  is in one RCP's configuration it is unavailable to others until removed, and sharing
  across desks requires a REMI link instead. A second shader position is therefore not a
  configuration change, it is an architecture change.
- FACT: **9 camera families are marked as "limited" control** — BirdDog X1/X4/X5, Panasonic
  AU-EVA1 and AW-UB10, Sony A7 IV, A7R V, A9 II and FX6. Concrete examples: Panasonic AU-EVA1
  "Red and Blue gains not supported by protocol"; BirdDog X1 "Limited paint controls compared
  to P series"; Sony FX6 "Limited paint control available (white balance, iris, variable ND,
  gain, shutter, record only)". The panel's knob exists; the camera's protocol does not.
- FACT: **12 camera families require a specific minimum camera firmware** (Blackmagic IP,
  URSA Cine 17K 65, URSA G2 Broadcast; Canon C70, CR-N300; Dreamchip AtomOne, SSM500, SSM501;
  Panasonic AG-CX350, AU-EVA1, VariCam; Sony A1, A1 II, FX3, FX6). A camera that came back
  from a rental house on old firmware is a job-day failure.
- FACT: cameras that will not persist their own state. Dreamchip: "Cameras don't auto-save;
  use SAVE command for power-up defaults."
- FACT: cameras that must be manually disarmed of their own automation first. Canon CR-N300:
  "Set Shooting Mode to Manual and disable all Auto modes. All parameters you want to control
  must be set to Manual, not Auto." Z CAM P2-R1: "WB control requires camera in Manual WB
  mode. SDR gamma only accessible when OETF set to Gamma."
- FACT: partial tally. Panasonic AW-UB10: "Red tally only; green not visibly displayed."
- FACT (release notes): the OS itself had "an issue that could cause unexpected reboots"
  fixed in release 26.4.1, alongside "Sony Alpha (A7S, FX3) USB cameras: crash fixed" and
  "SBUS: fixed parity bug". A control panel that can reboot unexpectedly is a different class
  of risk from a control panel that shows a wrong number.

**MISSING FEATURES (what users are effectively asking for)**

- Shared/multi-operator control of the same camera group without a REMI hop. INFERENCE from
  the one-RCP-per-CI0 rule; no user request seen directly.
- Per-camera capability visibility **at planning time**, not at rig time. The knowledge
  currently lives in a 240-row spreadsheet plus per-brand pages, not in the panel.
- Feedback for the unidirectional paths. UNKNOWN whether this is even possible per protocol;
  for SDI control and LANC it is a protocol limit, not a Cyanview choice.

**UX PROBLEMS**

- FACT: the RCP displays `--` for functions a given camera model does not support (via search
  extract of `support.cyanview.com/docs/Manuals/RCP/RCPUI/RCPUILens`). Honest, but it means
  the surface silently changes shape per camera and the operator learns the limits by
  discovering dead knobs.
- FACT: control is exclusive between panel and camera operator — "if one device takes
  control, the cameraman loses control"; iris is typically enabled and zoom typically
  disabled to leave the camera operator their zoom (via search extract of the same page).
  This is a workflow negotiation the tooling does not model.
- FACT: the product line requires a decision tree before purchase — the docs ship a
  `which-product.md` page, and a community-built **58-node interactive troubleshooting
  decision tree** exists (`AlanOgic/cyanview-troubleshooter`). INFERENCE: a product whose
  fault-finding needs 58 decision nodes is not self-explanatory in the field.

**PERFORMANCE PROBLEMS**

- FACT: "cGate: fixed timeouts on slower connections" appears in release 25.9.5-era notes,
  i.e. the cloud/gateway path has had latency-sensitive failures.
- FACT: the CI0 is "not suited to high-latency networks (VPNs, WAN links)" (FAQ). The cheap
  gateway is explicitly a LAN-only device; the moment the link degrades you are buying a RIO.
- FACT: joystick bugs shipped and were fixed — "Joystick: fixed a bug that sometimes caused a
  display shift", "Joystick: fixed a bug with the camera lock function" (26.4.1).

**PRICING PROBLEMS**

- FACT: control capacity is a **hard licence tier on the panel**, not a function of the rig:
  DUO 2 cameras, QUATTRO 4, OCTO 8, MSU 128. (`docs/guides/licensing.md`) A six-camera show
  on a QUATTRO panel is not a workaround away from working.
- Prices, **all via search extract of `videoplusfrance.com`, seen 2026-08-29, dealer-advertised,
  not opened directly, not vendor-confirmed**: DUO → QUATTRO upgrade EUR 500 ex VAT
  (EUR 600 incl.); DUO → OCTO EUR 1,000 ex VAT (EUR 1,200 incl.); OCTO → unlimited
  EUR 500 + VAT; DUO → unlimited EUR 1,500 + VAT. Treat as indicative only.
- FACT: the RIO's licence gates **connectivity as well as count** — RIO +LAN is "limited to 2
  cameras and LAN-only control (no cloud)"; RIO +WAN reaches 128 cameras with cloud.
  (`docs/guides/networking/remi.md`) The remote-production feature and the camera-count
  feature are welded to the same SKU.
- FACT, and to Cyanview's credit: the cloud itself is "included, unlimited, and free of
  charge" on RCP and RIO +WAN, with "no subscription". This is the one place in this dossier
  where a vendor did not attach a recurring fee to a cloud service.
- FACT: the CI0 requires no licence at all. The cheap path is genuinely cheap.

**LOCK-IN**

- FACT: proprietary active cabling. "The GPIO-8 is an active cable with embedded electronic
  components and ID circuits for auto-detection. It cannot be replicated with a standard
  cable." (FAQ) Every camera row in the CSV also carries a `Câble Cyanview` reference —
  the interconnect is a Cyanview part number, not a connector spec.
- FACT: **the cloud is vendor-hosted with no self-hosting option documented.** REMI requires
  outbound port 7887 and DNS access to Cyanview's regional servers (Europe, US endpoints).
  The docs make no mention of running your own relay. For a broadcaster whose security policy
  forbids outbound production-network connections, remote production via this path is simply
  unavailable.
- FACT: the factory IP address cannot be removed — "You cannot remove the factory IP address
  — it is required to control local devices such as the CI0" — and "The CI0 IP address is not
  user-configurable." (FAQ) The gear does not fully submit to the venue's IP plan.

**OFFLINE**

- Good, with one boundary. FACT: LAN operation needs no internet at all; RIO +LAN is
  explicitly local-only; licences are applied as a file through the device web UI's Admin tab
  rather than by phoning home. FACT: what needs internet is **cross-site REMI** (port 7887
  outbound plus DNS to Cyanview's regional servers) — and there is no offline substitute for
  it, because there is no self-hosted relay.

**INTEGRATION PROBLEMS**

- FACT: the network is the fragile part, and the vendor documents it as such. The
  troubleshooting guide names two specific third-party network products as known causes:
  **Cisco Portfast** — "Enabling Portfast is strongly recommended", because without it
  spanning tree can block a port for 30 seconds after link-up and the device never talks; and
  **Netgear 4G modems** that "respond to ARP requests meant for other devices, causing
  intermittent connections and disconnections", where "the only solution is isolating the
  modem for internet access only."
- FACT: discovery is UDP broadcast on port 3838, with TCP 1883 (MQTT) and TCP 7887 also
  required. (`AlanOgic/cyanview-troubleshooter` README) Three ports and a broadcast domain is
  a conversation with venue IT, every time.
- FACT: the documented "CI0 Status 'X'" symptom — lost communication between CI0 and RCP —
  has a whole troubleshooting path including firmware recovery and ARP pings.
- FACT: **USB-Ethernet dongle chipset roulette.** Sony FX6: "USB-Ethernet dongle must use ASIX
  AX88179 chipset (not AX88179A/B) or older Realtek RTL8153. Incompatible dongle can crash
  camera." Panasonic AU-EVA1 "Requires specific USB 3.0 to Ethernet adapters"; JVC camcorders
  "Requires USB dongle (check manual for compatibility)"; Sony FX9 needs the XDCA-FX9
  extension unit for direct Ethernet. A silicon revision letter is a production risk.
- FACT: credential traps. Panasonic AW-UB10: "Use EasyIP SetupTool credentials, not camera
  menu credentials."
- FACT: a dead end that should be planned around, not discovered. Sony FX6: "No further
  firmware releases beyond 2026 update; no new paint controls expected." The camera's control
  surface is frozen.

---

### Cyanview CI0 / CI0-3P / CI0BM (serial-to-IP gateway)

- STRENGTHS — FACT: no licence required, and it powers one mini-camera per port over PoE.
  The cheapest way onto a serial camera.
- WEAKNESSES — FACT: "It is not designed to power larger camcorders that run on batteries or
  an external supply", and with some professional cameras (Sony ENG) the relationship inverts
  and the camera powers the CI0. The single-cable promise is size-dependent.
- WEAKNESSES — FACT: one RCP owns it exclusively (see above), its IP is not user-configurable,
  and it is "not suited to high-latency networks (VPNs, WAN links)."
- OFFLINE — fine; it is a LAN device with no cloud element.
- INTEGRATION — FACT: firmware recovery is a documented routine step for CI0 and RIO when the
  screen stays blank, which suggests bricked-on-update is common enough to warrant a procedure.

### Cyanview RIO (+LAN / +WAN)

- STRENGTHS — FACT: it is the answer to every CI0 limitation: all protocols (serial, USB, IP),
  direct lens-motor control, and it holds control when the panel link fails.
- PRICING — FACT: +LAN caps at **2 cameras** and forbids cloud; +WAN is the only route to
  remote production. The gating is coarse: a 3-camera LAN job forces the WAN SKU.
- LOCK-IN / OFFLINE — as Cyanview above: cloud REMI is free but vendor-hosted only.

### Cyanview VP4

- STRENGTHS — FACT: gives full CCU-style paint (12-vector multimatrix, detail, coring, black)
  to four cameras that have no paint of their own, and can run standalone from its own web UI.
- WEAKNESSES — FACT: four channels, hard. UNKNOWN: the documentation "does not specify latency
  specifications, exact input format details, or other technical constraints" — for a device
  inserted in a live program path, **published latency figures are missing and would need to
  be obtained from Cyanview directly.** That is a real gap for anyone planning lip-sync.
- INTEGRATION — FACT: the RCP must auto-detect the VP4 on the network, which puts it back on
  the same broadcast-discovery dependency as everything else.

---

### Blackmagic ATEM Camera Control (software panel + hardware ATEM Camera Control Panel)

**STRENGTHS**

- FACT: it is bundled. For an all-Blackmagic fleet the CCU cost is zero on the software side,
  and the control metadata rides the SDI return feed, so there is no separate control network
  to build. This is the cheapest working CCU in the segment by a wide margin.
- FACT (via search extract of `blackmagicdesign.com/products/atemcameracontrolpanel/techspecs`):
  the hardware panel does cover iris, shutter speed, white balance, master gain, pedestal and
  RGB lift/gain — more paint than its reputation suggests.

**WEAKNESSES**

- FACT (via search extract of the same tech-specs page): **the ATEM Camera Control Panel does
  not support focus control.** For a panel sold into a live multi-camera role that is a
  conspicuous hole.
- FACT (via search extract of a B&H product page for SWPANELCCU4): a purchaser's stated
  reservation is that "the coloring is more limited than the broadcast professional units."
  Frequency: `recurring` — the same theme appears in the Blackmagic forum extract below.
- FACT (via search extract of `forum.blackmagicdesign.com/viewtopic.php?f=4&t=165391`, thread
  titled "ATEM Camera Control Panel / Ursa Broadcast / Canon lens"): a participant argues that
  **black balance is the first step in painting a camera and that its absence "needs to be
  addressed."** I could not open this thread — the domain is blocked — so this is a
  single-extract claim and is graded `isolated` on the evidence I actually have, while being
  the kind of complaint that is `recurring` in practice.
- FACT: the control path is **open-loop when it runs over SDI.** Cyanview's compatibility CSV
  documents the Blackmagic SDI control row as "Unidirectional control - no camera feedback.
  Values displayed on RCP may drift from actual camera state." This is a property of
  Blackmagic's SDI camera-control protocol, not of Cyanview's implementation of it, and it
  applies equally to the ATEM's own panels.

**MISSING FEATURES (what users request)**

- FACT: **ATEM camera control from a Stream Deck is a repeatedly-requested, repeatedly-unmet
  ask.** Five separate requests across two Bitfocus repositories:
  `companion-module-requests#739` "atem camera control panel" (opened 2022-03-01, **still
  open** as of 2026-08-29), `#1742` "ATEM Camera Control Panel" (2025-01-20, closed),
  `#1792` "Atem camera control panel for stream deck" (2025-02-25, closed),
  `companion-module-bmd-atem#239` "Streamdeck + ATEM CCU" (2023-04-13, closed) and
  `#327` "[Feature Request] Access to Atem Camera Control Features" (2024-10-10, closed,
  body reads simply that "BMD CCU features" be exposed for the StreamDeck+).
  Frequency: `recurring` — five independent reporters over four years.
- FACT: `companion-module-bmd-atem#288` "Add Zoom function to ATEM Camera Control"
  (2024-03-25). Even within the reduced ATEM control set, users hit missing axes.
- FACT: users want the ATEM's camera control and Blackmagic's REST API to be **the same
  state**. `DylanSpeiser/BM-Camera-Control-WebUI#13` (opened 2026-02-02, open) asks for a
  bidirectional bridge that reads iris/gain/shutter/focus from the ATEM, forwards to the
  camera over the network, and propagates web-UI changes back "so both the ATEM and the camera
  always stay synchronized", because it "would be extremely useful in live production
  environments." The reporter adds, in their own words, "I'm not a strong programmer myself,
  so I'm not able to implement this on my own."

**UX PROBLEMS**

- INFERENCE, not directly evidenced: with an open-loop SDI path and a separate REST path that
  do not share state, an operator can have two surfaces showing different truths about the
  same camera. The #13 request above is a user articulating exactly this. I have no forum
  evidence of operators being burned by it, because the forums were unreachable.

**PERFORMANCE PROBLEMS**

- FACT: `bitfocus/companion-module-bmd-cameras#3` (opened 2026-06-12, **open**), "BMD
  Television Studio 6K Pro drops connection/slow pickup": with **three** cameras and preset
  feedback using AND logic, "After the action is executed, the feedback takes an excessively
  long time. Sometimes minutes", with response times of 15–20 seconds upward and module logs
  showing "frequent call timeouts". Three cameras. Frequency: `isolated` (one reporter) but
  technically severe and consistent with a polling-based REST design.

**PRICING PROBLEMS**

- Genuinely the segment's strong point, and no complaints found. The software panel ships with
  the switcher. UNKNOWN: current list price of the hardware ATEM Camera Control Panel —
  `blackmagicdesign.com` is blocked from this container and I will not quote a price I could
  not read.

**LOCK-IN**

- FACT: it is an ATEM feature. The control metadata is embedded in the ATEM's SDI program
  path, so the CCU function is tied to owning the switcher. Third parties reach it only by
  implementing Blackmagic's SDI control protocol themselves (which Cyanview does, via its
  RSBM/CI0BM hardware).
- FACT: the ATEM control plane and the camera REST control plane are separate and unsynchronised
  (see #13 above) — a lock-in of a subtler kind, where the vendor's own two answers do not
  compose.

**OFFLINE**

- FACT: fully offline. SDI-embedded control needs no network at all, which is the best offline
  story of any product in this dossier.

**INTEGRATION PROBLEMS**

- FACT: no third-party control surface can drive ATEM camera control today via the most common
  glue layer (Companion) — see the five unmet requests above.

---

### Blackmagic camera REST / WebSocket API

**STRENGTHS**

- FACT: it is self-describing. The camera serves an OpenAPI document at
  `/control/documentation.html`, so a client can generate its UI from the camera. That is a
  better contract than anything else in this segment offers, and `DylanSpeiser/BM-Camera-Control-WebUI`
  exists because of it — a working browser-based CCU built by one person.
- FACT: it is closing gaps. Tally was absent from the REST API as of late 2025 and was added
  for URSA G2 Broadcast and Pyxis in release 25.12.1-rc2 (corroborated from two directions:
  a search extract of Blackmagic developer material, and the Cyanview CSV row for URSA G2
  Broadcast which states "IP tally support (requires RCP/RIO 25.12.1-rc2 or later)").

**WEAKNESSES**

- FACT: **the API is not uniform across the fleet, and clients discover this by failing.**
  Julusian, a Companion maintainer, writing in `companion-module-requests#1383` (opened
  2024-01-30): "various methods fail on my camera as they are not supported on this model",
  and a warning to implementers to "make sure to work from an updated copy as there could be
  changes" because the schema was attached from firmware 8.4. A self-describing API whose
  description shifts per model and per firmware still leaves the integrator doing capability
  archaeology.
- FACT: **older cameras have no REST API at all.** `BM-Camera-Control-WebUI#10` (2025-07-02,
  open): two BMPCC4K bodies on firmware 8.6 return "Error 19: NetworkError" over both router
  and direct Ethernet, and the camera's own Web Media Manager URL also fails. The README lists
  12 supported models, all of them relatively recent.
- FACT: quirky request handling. `#3` (2024-12-06, open), "Autofocus command only works when
  issued manually": `PUT /lens/focus/doAutoFocus` works by hand but not from the web UI, with
  the reporter's Wireshark observation that "the difference seems to be something to do with
  the manual commands being sent as plain text." An encoding/content-type mismatch that the
  API's own documentation did not prevent.

**MISSING FEATURES (what users request)**

- FACT, from the project's own README: no preset save/download feature, audio and codec/format
  settings not implemented, colour-correction UI limited, vertical layout incomplete, error
  handling needs work — and the author's own caveat that "This is a tech demo, and may not be
  suitable for production use."
- FACT: `#9` "clean feed or overlay enables" (2025-04-18, open) — overlay/clean-feed control
  wanted and absent.
- FACT: `#14` "Downsizing Layout Hides Controls" (2026-03-18, open) — responsive layout hides
  controls rather than reflowing them.

**PERFORMANCE PROBLEMS**

- FACT: see `companion-module-bmd-cameras#3` above — feedback latency measured in minutes at
  three cameras. Frequency: `isolated` on current evidence, but it is the only load report
  that exists and it is bad.

**PRICING PROBLEMS**

- None. The API is free and on the camera. This is the segment's cheapest control surface.

**LOCK-IN**

- FACT: Blackmagic-only, obviously, and **model-gated within Blackmagic** — a fleet mixing a
  BMPCC4K and a Studio Camera 4K Plus G2 cannot be controlled by one REST client.
- FACT: **the control plane needs Ethernet on a camera that may have none.** Micro Studio
  Camera 4K G2 and similar bodies reach the network through a USB-C dongle, and dongle
  compatibility is undocumented. `#7` "Known compatible USB-C<>RJ45 Dongles?" (2025-03-13,
  **still open with no answer**): a standard USB-C hub with RJ45 and SD reader powers up but
  produces "error 19"; the reporter asks simply "Which dongle did you use?" and nobody has
  answered. They note they are trying to avoid buying an ATEM just to get control. Frequency:
  `recurring` — the identical failure class appears in Cyanview's CSV for Sony FX6, Panasonic
  AU-EVA1 and JVC camcorders.

**OFFLINE**

- FACT: fully offline on a LAN — the HTTP server is on the camera. No cloud anywhere. Best-in-
  segment alongside ATEM SDI control.
- FACT, small but real: serving the WebUI from GitHub Pages requires generating a certificate
  and clicking through browser security warnings, because a secure page cannot call a
  plain-HTTP camera. Self-hosting locally avoids it.

**INTEGRATION PROBLEMS**

- FACT: **it took roughly two years for the ecosystem to catch up.** The Companion request
  (`companion-module-requests#1383`) was filed 2024-01-30; `bitfocus/companion-module-bmd-cameras`
  closed its tracking issue as completed on 2026-04-07. The module has 1 star, 2 forks and
  2 issues total. A self-describing API did not translate into fast third-party adoption.

---

### Skaarhoj Blue Pill panels / Raw Panel protocol

Evidence here is thinner than the product's importance warrants, because `wiki.skaarhoj.com`,
`shop.us.skaarhoj.com` and `devices.skaarhoj.com` are all blocked from this container. What
follows leans on two GitHub repositories and search extracts of the wiki.

**STRENGTHS**

- FACT: the protocol is genuinely published and third-party-drivable — Raw Panel on TCP 9923,
  ASCII plus protobuf. That is the most open hardware-surface contract in the segment, and it
  is why a Companion module for Skaarhoj panels exists at all.
- FACT: offline licence installation is supported — a licence file can be uploaded via the
  Packages tab, the same way an offline software update is (via search extract of
  `wiki.skaarhoj.com/books/blue-pill-reactor/page/installing-a-license-on-your-skaarhoj-controller`).
  The vendor did think about air-gapped installs.

**WEAKNESSES**

- FACT: the Raw Panel Companion module is in poor health. `bitfocus/companion-module-skaarhoj-rawpanel`
  has two open issues and both are severe: `#14` "No longer functions" (opened 2026-01-14,
  **open**, complete module failure) and `#26` "skaarhoj-rawpanel v2.2.1 — Feedbacks missing"
  (opened 2026-07-12, **open**, "0 exposed in Feedback browser"). A published protocol whose
  main free client is broken is a published protocol most people cannot use. Frequency:
  `recurring` (two independent reporters, six months apart, both unresolved).
- FACT: hardware that bricks. `SKAARHOJ/skaarhoj-updater-releases#40` "rcp pro bricked"
  (2026-07-14, closed) and `#33` "My SKAARHOJ PTZ Pro V2 has a pixelated screen and won't start
  / update anymore" (2024-04-28, closed), the latter accompanied by a TypeError in serial-port
  handling. Frequency: `recurring` — two independent devices, two years apart.
- FACT: connection freezes under load. Via search extract of
  `forum.blackmagicdesign.com/viewtopic.php?f=4&t=44222` ("Skaarhoj Arduino controller
  (problems)"): a user returned a Skaarhoj_E21_TVSS to the vendor for firmware update and
  testing and still had the panel drop/freeze its connection, specifically when more than two
  HD inputs were connected. The thread's own diagnosis blames cheap switches dropping UDP
  packets and notes that **official Blackmagic panels also suffer random network disconnects**.
  Two caveats: this concerns an older Arduino-generation controller, not Blue Pill, and I could
  not open the thread. Weak evidence, `isolated`, and dated.

**MISSING FEATURES**

- Feedback exposure in the Companion module (`#26`). Beyond that, UNKNOWN — the wiki's feature
  request channels were unreachable.

**UX PROBLEMS**

- FACT: the desktop updater is a recurring source of friction in its own right. Across
  `SKAARHOJ/skaarhoj-updater-releases`: DNS-service failures preventing launch (`#20`, opened
  2022-01-25 and **still open** after four and a half years; also `#26`, `#27`, `#32`), serial
  COM-port access denials (`#29` "COM4 error", `#37` "Opening COM3: Access denied"), an
  unhandled promise rejection (`#38`), AppImage failing to launch on Ubuntu 22.04 (`#30`, `#31`),
  and inability to reach the Blue Pill server from Chrome on macOS (`#39`). Frequency:
  `recurring`, across four years and three operating systems. The panels are good; the tool you
  must run to update them is not.

**PERFORMANCE PROBLEMS**

- Insufficient evidence. UNKNOWN.

**PRICING PROBLEMS**

- FACT (via search extract of `shop.us.skaarhoj.com/products/device-core-tcp-link-license-for-blue-pill`
  and a B&H listing for the same part, both seen 2026-08-29, **as advertised, not opened
  directly**): a **Device Core TCP Link licence for Blue Pill is USD 609.00**. Skaarhoj's model
  charges per integration ("Device Cores") on top of panel hardware — separate licences exist
  for Stream Deck and for the KM server. **INFERENCE:** a panel that must talk to several device
  families accumulates licence cost per family, which is the same feature-gating complaint as
  Cyanview's camera-count tiers wearing different clothes. I could not open the shop pages, so
  the full licence matrix and its prices are `unverified`; anyone quoting this must re-check.

**LOCK-IN**

- FACT: **licences are registered against Skaarhoj's server.** "Internet access is needed for
  the Blue Pill device to touch the Skaarhoj server to register an assigned license" (via search
  extract of the wiki). An online controller "will automatically detect and apply any assigned
  licenses", indicated by a green icon next to the logo.
- The offline path exists but is a support ticket: you must contact `support@skaarhoj.com` with
  the panel's serial number to obtain a licence file. **INFERENCE:** on a Sunday, in a stadium,
  with a swapped panel, that is a dead evening.

**OFFLINE**

- Mixed, and better than most: the panel runs offline once licensed, packages and OS images can
  be uploaded from offline, and licence files can be applied manually. The internet dependency
  is at licensing and update time, not at show time.

**INTEGRATION PROBLEMS**

- FACT: the free client (Companion module) is broken/unmaintained on two counts (above), so in
  practice "any third-party software can drive it" holds better in the protocol document than
  in the field. Note the ecosystem shape: two abandoned community forks exist
  (`McHauge/companion-module-skaarhoj-rawpanel`, archived; `MediaNerdStudio/...2.0.1-extended`,
  untouched since 2024-08) — people keep trying and stopping.

---

### Bitfocus Companion (and its camera modules)

**STRENGTHS**

- FACT: free, open source, and the de-facto glue. Around 30 camera-vendor modules exist, and
  the module-request tracker is the closest thing this segment has to a public feature-request
  queue.
- FACT: `companion-module-panasonic-cameras` is unusually deep for a free module — actions
  across pan/tilt with speed and range limits, zoom, focus, stabilisation, iris, ND, shutter,
  gain, white balance, colour correction, noise reduction, presets with velocity, auto-tracking,
  audio volume, power/restart/tally/colour-bars and SRT/RTMP/MPEG-TS streaming control across
  40+ models, built against Panasonic's "HD/4K Integrated Camera Interface Specifications"
  v1.12 (April 2020), the March 2025 compatible-model tables, and "POVCAM Interface
  Specifications" v1.0 (September 2017).

**WEAKNESSES**

- FACT: **the same per-model capability fragmentation, restated as a disclaimer.** The Panasonic
  module README: "Not all models support all actions, variables and feedbacks", and the module
  filters the UI by connected-camera capability. The good engineering response to fragmentation
  is still fragmentation from the operator's chair.
- FACT: feedback — the thing that makes a control surface trustworthy — is where the bugs land.
  `companion-module-panasonic-cameras#56` (2026-02-10, closed **as "not planned"**): "AW-UE160
  Red and Blue Gain not feeding back or working with rotary encoder". `#28` "Green Gain UE160"
  (2025-07-11, closed). `#83` "AW-UE150A — image-color temperature increase/decrease not
  working" (closed, completed). Frequency: `recurring` — paint feedback specifically, on
  Panasonic's own flagship PTZ.
- FACT: module/host version skew is a live failure mode. `#93` "[BUG] v2.1.0 has no actions or
  feedbacks available?" (closed as **not planned**) and `#92` "Module update not showing"
  (closed, completed). Compare `companion-module-skaarhoj-rawpanel#14` "No longer functions".
- FACT: Companion core itself is not free of stability reports — `bitfocus/companion#4286`
  "Companion 4.3.4 hangs on Windows 11" with a "Waiting for webserver" message (open).

**MISSING FEATURES (what users request)**

- FACT: **ATEM camera control.** Five requests, four years, still open at the head of the queue
  (`companion-module-requests#739`, open since 2022-03-01). This is the loudest unmet ask in the
  whole segment.
- FACT: manufacturer coverage gaps that people ask for by name and do not get:
  `#312` "Canon Camera Control API" (opened 2020-11-05, **still open** — nearly six years),
  `#1056` "ARRI Camera Control" (2023-02-15, open),
  `#1026` "Sony PXW-Z190V Camera control request" (2023-01-17, open),
  `#641` "Control ptz Minray cameras" (2021-11-20, open),
  `#1169` "AVKANS PTZ CTRL Request" (2023-05-28, open),
  `#2073` "RGBlink VUE PTZ" (2026-05-19, open),
  `#1758` "ChamEye E300 PTZ Controller" (2025-01-30, open).
  Frequency: `widespread` — the long tail of camera brands is permanently unserved, and the
  requests simply accumulate.

**UX PROBLEMS**

- FACT: `bitfocus/companion#4324` "Feature Request: Faster way to edit basic text of a button"
  and `#4380` "Button sometimes does not display evaluated text" (both open). Small, but a
  control surface whose labels are wrong is a control surface you cannot trust in the dark.
- INFERENCE, not evidenced: a Stream Deck button is a stateless trigger, so paint via Companion
  is inherently step-wise ("gain +1") rather than absolute, and depends entirely on feedback
  variables to show the current value. The Panasonic feedback bugs above are what that
  dependency looks like when it fails. I found no user writing this out; I could not reach the
  forums where they would.

**PERFORMANCE PROBLEMS**

- FACT: the REST-polling latency report at three cameras (`companion-module-bmd-cameras#3`).
  UNKNOWN at larger camera counts.

**PRICING PROBLEMS**

- None. It is free. The cost is maintenance risk, not money.

**LOCK-IN**

- Minimal — open source, MIT-adjacent ecosystem, self-hosted, no cloud. The real dependency is
  **volunteer attention**: a module is only as alive as the one person who maintains it, and
  `companion-module-skaarhoj-rawpanel` shows what the other state looks like.

**OFFLINE**

- FACT: fully offline. Runs on a local machine or a Raspberry Pi with no internet requirement.

**INTEGRATION PROBLEMS**

- FACT: the gap between "vendor published a protocol" and "Companion can drive it" is measured
  in years — two years for the Blackmagic REST API (2024-01 request → 2026-04 module), six years
  and counting for the Canon camera control API.

---

### obs-ptz (glikely), GPL-2.0

**STRENGTHS**

- FACT: it does the one thing nothing commercial does — binds PTZ recall to OBS scene switching,
  free, with joystick support, across VISCA (RS232/RS422/UDP/TCP), Pelco-P/D and experimental
  ONVIF. It is actively maintained: issues from August 2026 are being triaged.

**WEAKNESSES**

- FACT: **the dominant failure mode is the host, not the cameras.** Version-coupling breakage
  and crashes account for most of the traffic: `#281` "obs-ptz will not load with OBS 32"
  (2025-09-24, 17 comments, 5 thumbs-up, closed), `#349` "obs-ptz v0.19.0 cannot be installed on
  OBS 32.0.4" (2026-08-15, closed), `#321` "PTZ action not working on OBS 32.1.2" (2026-06-17,
  closed), `#165` "OBS PTZ controls crashed on OBS 29.1" (2023-07-04, **28 comments**, closed),
  `#168` "obs-ptz causes OBS 29.1.3 to sometimes crash when switching scenes" (2023-07-26,
  closed), `#274` "OBS Crashing with PTZ Plugin" (2025-08-09, closed), `#291` "OBS crash caused
  by obs-ptz" (2025-11-04, 12 comments, closed). Frequency: `widespread` within this product —
  seven independent reports across four years and four OBS major versions. Crashing the host
  application takes the whole show off air, not just the camera.
- FACT: packaging fragility on Linux — `#282` "obs-ptz .deb package requires unavailable
  dependencies" (2025-09-25, closed).

**MISSING FEATURES (what users request, ranked by thumbs-up)**

- FACT: `#16` "Feature request: ONVIF protocol support" — **the most-upvoted issue in the
  repository (7 thumbs-up), opened 2021-07-08**, eventually closed as completed; the follow-on
  `#197` "Add ONVIF control of Plugin for network PTZ Controllers" (2024-07-16) shows the demand
  did not stop. ONVIF is the standard people want because it removes per-vendor VISCA guesswork.
- FACT: `#56` "Add support for the NDI PTZ protocol" — **opened 2021-10-22 and still open after
  nearly five years.** The reporter's argument is that NDI "also wraps PTZ and also handles
  discovery", i.e. it would remove the IP-address-hunting step. UNKNOWN why it is unimplemented;
  no maintainer rationale was visible on the page I fetched, and NDI SDK licensing is a plausible
  but **unverified** explanation.
- FACT: `#24` "Feature request: Add controller-local presets" — open, high on the reactions
  ranking. Users want presets stored in the software, not in the camera, because camera preset
  slots are limited and not portable between bodies.
- FACT: `#142` "feature request: Feature bits to inhibit commands that aren't supported by all
  cameras" (2023-02-24, **open**). This is a user asking, in plain terms, for **a machine-readable
  capability model per camera** — the exact gap that Cyanview solves with a 240-row spreadsheet
  and Panasonic's module solves with a runtime filter. Frequency of the underlying need:
  `widespread`.
- FACT: other standing asks — `#354` "Allow multiple joysticks to be mapped to different cameras"
  (2026-08-22, open), `#146` "Group Presets" (2023-03-02, open), `#123` "Camera Label above
  Presets" (2022-12-05, open), `#95` "PTZ-Action delay for transition" (2022-05-29, open),
  `#78` "Ability to import and export presets" (2022-01-03, **open for four and a half years**),
  `#169` "Custom visca commands" (2023-08-06, open), `#263` "Translation — Danish" (2025-07-11,
  open).
- FACT: `#144` "Request: Support Datavideo variant of VISCA over TCP protocol" (2023-02-27,
  **open**, 11 comments) — a vendor's "VISCA" that is not the others' VISCA.

**UX PROBLEMS**

- FACT: `#272` "v0.18.1 — drop down menu for setting joystick buttons" (open), `#270` "v0.18.1 —
  Missing 'Recall Preset, Next Preset, and Previous Preset'" (closed) — actions disappearing
  between releases.
- FACT: `#11` "Options to invert the PTZ directions" (3 thumbs-up, closed completed) — every
  operator has an opinion about which way is up, and it took a feature request.

**PERFORMANCE PROBLEMS**

- Covered above: the crashes are the performance problem.

**PRICING / LOCK-IN / OFFLINE**

- Free, GPL-2.0, fully offline, no cloud, no licence. The only lock-in is to OBS itself — and,
  as the crash history shows, that coupling is the product's main liability.

**INTEGRATION PROBLEMS**

- FACT: `#30` "VISCA over IP — UDP vs TCP/IP" (closed without a clear resolution on protocol
  selection): the reporter relays camera-engineer advice that "you need to use TCP/IP sockets
  and not UDP", and asks for it to be selectable "as some MFG might need UDP". A transport
  choice that should be a spec detail is a per-vendor coin-flip.

---

### VISCA as a de-facto standard (cross-vendor, affects obs-ptz, Companion, Skaarhoj, everything)

Not a product, but the shared substrate under most PTZ control, and it deserves its own entry
because its fragmentation is the root cause of complaints filed against many products.

- FACT, from `GrantSparks/grafton-visca`'s README (a Rust VISCA-over-IP library that encodes
  per-vendor differences as compile-time capability gates): there are **two incompatible
  framings in circulation** — "Raw VISCA" (GenericVisca, PtzOptics G2/G3/30X, Sony EVI-H100,
  Sony BRC-300, Nearus BRC300) and **"Sony Encapsulation"**, a vendor-specific wrapper used by
  Sony BRC-H900 and FR7. Same protocol name, different bytes on the wire.
- FACT, same source, on capability divergence within one protocol: Sony FR7 exclusively exposes
  ND filter controls and inquiries, variable-speed mode, auto-tracking white balance, auto-focus
  sensitivity and push auto-focus; BRC-300/EVI-H100 lack wide dynamic range (present on BRC-H900)
  and lack exposure compensation (present on FR7/BRC-H900); PTZOptics profiles have manual focus
  and focus lock but **no** one-push or snap focus.
- FACT, via search extract of `codeblog.jonskeet.uk/2023/11/25/variations-in-the-visca-protocol/`
  (dated 2023-11-25; domain blocked, could not open): **preset numbering starts at 0 for some
  vendors and 1 for others, a divergence present even between Sony cameras** — the author
  speculates it originated in an early specification error; and **PTZOptics does not want the
  message header that the VISCA specification defines.**
- FACT: `obs-ptz#144` shows Datavideo running yet another VISCA-over-TCP variant.
- Frequency: `widespread`. This is the single best-evidenced cross-vendor pain in the segment,
  and it is what every "universal" panel is actually selling a solution to.

---

### libgphoto2 (gPhoto project, LGPL-2.1)

The backend under every tethered-stills workflow, and by volume the most complained-about
component in this dossier.

**STRENGTHS**

- FACT: nothing else offers this breadth of deep USB PTP setting control across Canon, Nikon,
  Sony, Fuji and Panasonic stills bodies, and it is the foundation other tools build on.

**WEAKNESSES**

- FACT: **a 289-issue long tail of per-model brokenness.** A single semantic query for
  unsupported models / PTP timeouts / capture failures returned 289 matching issues. The shape
  repeats endlessly: `#730` "FujiFilm X-S10 fw: 2.0" (2021, open, 19 comments), `#762` "Support
  Sony A7 mark 2" (2022, open, 22 comments), `#509` "Add support for Fuji X-T30" (2020, open),
  `#239` "EOS M10 'PTP Device Busy'" (2018, open, 21 comments), `#196` "Olympus E400 — failed:
  'PTP Timeout'" (2017, **open for nine years**), `#809` "Olympus E-M5 MarkIII, PTP Device Prop
  Not Supported" (2022, open), `#816` "Nikon 1 J5: PTP I/O Error while capturing" (2022, open),
  `#925` "Nikon Z50 sometimes times out and failing capture" (2023, open), `#1062` "Canon EOS
  M200 capture-image fails over PTP/IP" (2024, open), `#1247` "Nikon 1 J2 fails to capture-image"
  (2026-05, open). Frequency: `widespread`, and structural — camera firmware is a moving target
  and the library is chasing it with volunteer time.
- FACT: **fixes for one vendor break another.** `#1087` "Newest Sony fixes break Nikon D800e
  (and probably others)" (2025-02-03, closed). This is the reverse-engineering tax made visible.
- FACT: partial control even where support nominally exists. `#1230` (2026-03-26, open): on a
  Sony ILCE-7M4, "only Single Shot applies remotely; other capturemode indices do not persist".
  `#1132` (2025-06-23, open): the same body "fails on wait-for-event with --capture-tethered".
  `#1126` (2025-05-30, open): "Could Not Trigger Capture / -1: Unspecified Error". Three separate
  open issues against one popular current body.
- FACT: `#879` "focus problem when calling gp_camera_capture" (2022, open) and `#1221` "Detect
  camera disconnect" (2026-03-15, open) — **the library cannot reliably tell you the camera went
  away.** For an unattended or remote rig that is the difference between a warning and a hole in
  the show.

**MISSING FEATURES**

- FACT: `#351` "Use PTP API of macOS (ImageCaptureCore) as backend" (2019, open, 2 thumbs-up) —
  a standing platform-integration ask, unmet for seven years.

**PRICING / LOCK-IN / OFFLINE**

- Free, LGPL, fully offline, no cloud. Lock-in is to USB PTP itself and to the maintainers'
  ability to keep up with vendors who do not document their protocols.

---

### Sony RCP/MSU ecosystem and the "700" protocol (sony-700ptp-protocol, DelphiForBroadcasting)

**STRENGTHS**

- FACT: it is the reference implementation of broadcast camera control, and the panels
  (RCP-1000/1001/1500/1501/1530, MSU-1000/1500, CNU-700) are what everything else is compared to.
  Sony documents that camera parameters in a multi-camera system are adjustable via the CNU-700
  Command Network Unit or over Ethernet.

**WEAKNESSES / LOCK-IN — the defining problem of this segment**

- FACT, via search extract of `forum.blackmagicdesign.com/viewtopic.php?f=4&t=89518` ("SDI RCU —
  Sony and other brands controlled by BMD SDI CCU"), corroborated by the existence of the
  reverse-engineering project itself: **Sony shields the 700 protocol from the public and
  licenses it only under strict NDA with high penalties for breach.** The forum discussion is
  people concluding that without the official protocol document the integration cannot be built.
- FACT: **the only public reference is a stub.** `DelphiForBroadcasting/sony-700ptp-protocol`
  describes itself as "Trying analyzing Sony 700 PTP Protocol", ships an RCP-1500 emulator and a
  CNA-1 emulator, is written in Delphi XE 10.1, and has essentially no documentation of what is
  implemented, what is missing, or what is guessed. A GitHub repository search for other Sony 700
  / RCP-emulator projects returned **zero results**. One abandoned-looking Delphi project is the
  entire public state of the art.
- INFERENCE: this is why the segment looks the way it does. The dominant camera brand's control
  protocol is legally fenced, so every "universal" panel is either an NDA licensee or is doing
  per-camera integration work by hand — which is exactly what Cyanview's 240-row CSV and
  per-release camera fixes represent.

**PRICING**

- UNKNOWN. Sony RCP/MSU pricing requires a sales contact and no advertised figure was readable
  from this container. The widely-repeated claim that the Sony path costs an order of magnitude
  more than the alternatives is **unverified here** and would need dealer quotes to confirm.

**OFFLINE**

- FACT: CNU-700 / Ethernet based, no cloud element documented. Offline by construction.

---

## Cross-product patterns

These are the complaints that repeat across independent vendors. They are the most valuable
part of this dossier, because a pattern that appears in Cyanview's own documentation, in a
Blackmagic API client's issue tracker, in a free OBS plugin and in a 20-year-old C library is
a property of the domain, not of one product.

### 1. Open-loop control — the panel shows a number the camera never confirmed
`widespread`

Cyanview's compatibility CSV marks 8 camera families as "unidirectional control — no camera
feedback", and says of the Blackmagic SDI path in plain words that **"values displayed on RCP
may drift from actual camera state"**. Canon's Remote-A path, Sony's LANC path and Blackmagic's
SDI path are all write-only. Meanwhile the products that *do* have feedback have feedback bugs:
Panasonic AW-UE160 red/blue gain "not feeding back" (`companion-module-panasonic-cameras#56`,
closed as not planned), the Skaarhoj Raw Panel module exposing zero feedbacks (`#26`, open),
BMD REST feedback arriving minutes late at three cameras (`companion-module-bmd-cameras#3`).

Why it matters: camera matching is a *convergence* task. If the surface lies about where you
are, matching becomes guesswork and the only recovery is a full re-shade. Everyone in this
segment is fighting the same battle and nobody has won it.

### 2. "Supported" is a per-model, per-firmware lie
`widespread`

The same words hide wildly different capability. Cyanview: 9 camera families flagged "limited",
12 requiring specific camera firmware, and an RCP that displays `--` on knobs the camera cannot
do. Panasonic's Companion module: "Not all models support all actions, variables and feedbacks."
Blackmagic's REST API: a Companion maintainer noting "various methods fail on my camera as they
are not supported on this model", against a schema that changes per firmware. VISCA: two
incompatible framings, preset numbering that starts at 0 for some vendors and 1 for others, and
PTZOptics refusing the specification's own message header. libgphoto2: 289 issues that are, at
bottom, all the same issue.

And the users have named the fix themselves: `obs-ptz#142`, open since 2023, asks for
"feature bits to inhibit commands that aren't supported by all cameras" — a machine-readable
per-model capability model. Nobody in this segment publishes one in a form a planning tool can
consume. Cyanview comes closest and ships it as a CSV and an XLSX.

### 3. Capacity is a licence tier, and the tier is bought before the show is known
`widespread`

Cyanview RCP: DUO 2 / QUATTRO 4 / OCTO 8 / MSU 128, with dealer-advertised upgrades of
EUR 500–1,500 ex VAT (via search extract, 2026-08-29). Cyanview RIO: +LAN caps at **2** cameras
*and* forbids cloud; +WAN is the only route to remote production — two unrelated axes welded to
one SKU. Skaarhoj: per-integration Device Cores, USD 609 for the TCP Link core alone (via search
extract, 2026-08-29). The free tools (Companion, obs-ptz, the BMD REST API) have no camera
limit at all, which is precisely why they get used past the point where they are appropriate.

The planning consequence: the question "will my licence cover this job" is answerable weeks in
advance and is answered instead on the truck.

### 4. Discovery and the venue network are where control actually dies
`widespread`

Cyanview needs UDP 3838 broadcast discovery plus TCP 1883 and TCP 7887, and its own
troubleshooting guide names **Cisco Portfast** (without it, spanning tree blocks the port for 30
seconds after link-up and nothing talks) and **Netgear 4G modems answering other devices' ARP
requests**, for which "the only solution is isolating the modem". The Skaarhoj forum extract
blames cheap switches dropping UDP and notes official Blackmagic panels disconnect randomly too.
The Blackmagic REST client's most common failure is `Error 19: NetworkError`. `obs-ptz#30` is an
argument about whether VISCA should be UDP or TCP at all. `obs-ptz#56` wants NDI specifically
because it "handles discovery".

Nobody's control system fails because the paint algorithm is wrong. They fail because a switch
port took 30 seconds to come up.

### 5. Physical-layer roulette: dongles, chipsets and proprietary cables
`widespread`

Sony FX6 requires a USB-Ethernet dongle with the **ASIX AX88179 chipset — explicitly not the
AX88179A or B revisions** — or an older Realtek RTL8153, and "incompatible dongle can crash
camera". Panasonic AU-EVA1 "requires specific USB 3.0 to Ethernet adapters". JVC camcorders
"require USB dongle (check manual for compatibility)". Sony FX9 needs the XDCA-FX9 extension
unit. On the Blackmagic side, `BM-Camera-Control-WebUI#7` "Known compatible USB-C<>RJ45
Dongles?" has been **open and unanswered since March 2025**. And Cyanview's GPIO-8 "is an active
cable with embedded electronic components and ID circuits… It cannot be replicated with a
standard cable."

A silicon revision letter on a EUR 15 adapter is a single point of failure for a camera-control
system costing four figures, and it is knowable at planning time from a table nobody maintains
outside one vendor's spreadsheet.

### 6. Software control surfaces are hostages to their host application
`recurring`, severe

obs-ptz: seven independent crash/load-failure reports across OBS 29, 29.1, 32.0.4 and 32.1.2 —
including crashes triggered by scene switching, i.e. during the show. Companion: a Panasonic
module version with "no actions or feedbacks available", a Skaarhoj module that "no longer
functions", and a core that hangs on Windows 11. libgphoto2: a Sony fix that broke Nikon.

Hardware panels have their own version of this — Skaarhoj's updater has had a DNS-service launch
failure open since January 2022 — but a hardware panel that fails at update time is a scheduling
problem, while a plugin that crashes the host at scene-switch time is an on-air problem.

### 7. One vendor, two control planes, no shared state
`recurring`

Blackmagic is the clearest case: ATEM camera control over SDI and the camera REST API are
separate systems that do not synchronise, which is why `BM-Camera-Control-WebUI#13` exists at
all — a user asking for a bridge so "both the ATEM and the camera always stay synchronized".
Cyanview has a milder version: the RCP can drive the same camera by IP, USB, serial-via-CI0/RIO
or SDI-via-RSBM/CI0BM, and the capability set differs by path (the SDI path loses feedback
entirely). The choice of transport silently changes what the operator can do.

### 8. The dominant vendor's protocol is legally closed, and the whole market is shaped by it
`widespread` as an industry condition, thinly evidenced as a complaint

Sony's 700 protocol is NDA-only with penalty clauses; the entire public reverse-engineering
corpus is one Delphi stub repository with a one-line README, and a GitHub search for
alternatives returns zero. Every "universal" panel therefore either pays for NDA access or
integrates camera-by-camera by hand — which is exactly what Cyanview's per-release changelog of
individual camera fixes ("Canon CR-N700: added iris close command", "Canon C300: fixed the OSD
commands", "Sony Z200: fixed a critical bug — now works with limited control") documents. The
per-camera integration treadmill is the cost of the closed protocol, paid by everyone downstream.

### 9. Cameras must be manually disarmed of their own automation before a panel can drive them
`recurring`

Canon CR-N300: "Set Shooting Mode to Manual and disable all Auto modes. All parameters you want
to control must be set to Manual, not Auto." Z CAM P2-R1: "WB control requires camera in Manual
WB mode. SDR gamma only accessible when OETF set to Gamma." Canon C100: "Set iris increment to
1/3 stop with fine increment on. Set remote terminal to RC-V100." Panasonic AW-UB10: use the
EasyIP SetupTool credentials, not the camera-menu ones. Dreamchip: the camera does not persist
settings unless you send SAVE.

This is a **pre-flight checklist that exists per camera model and lives nowhere operational**.
It is the most directly actionable finding for a planning tool in the whole dossier.

### 10. Tally is half-implemented almost everywhere
`recurring`

Panasonic AW-UB10 via Cyanview: "Red tally only; green not visibly displayed." Cyanview 25.9.5
fixed "TSL 5.0: RED and GREEN showing at the same time". Blackmagic's REST API had no tally at
all until release 25.12.1-rc2, and then only for URSA G2 Broadcast and Pyxis; the URSA G2 row
notes "SDI tally always available" as the fallback. `obs-ptz#208` asks for "Tally light control
via VISCA protocol" (open since 2025-02-12).

### 11. The long tail of camera brands is permanently unserved
`widespread`

Seven open, unanswered Companion module requests for camera brands (Canon's control API open
since 2020, ARRI since 2023, plus Minray, AVKANS, RGBlink, ChamEye, Sony PXW-Z190V). The
economics are obvious — a volunteer will not learn an undocumented protocol for one requester —
but the effect is that the brand you rented is the brand you cannot control.

---

## Direct quotes-of-substance

All paraphrased or quoted from pages listed in Sources. Where I could not open the page myself,
the entry is marked `via search extract` and the wording is the search tool's rendering of the
page, not mine and not verbatim-guaranteed.

1. **"Values displayed on RCP may drift from actual camera state."** — Cyanview compatibility
   CSV, Blackmagic SDI control row, on unidirectional control.
   `https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/Cyanview_Compatible_Cameras.csv` (read 2026-08-29)
2. **"Only one RCP can control a given CI0 and its connected cameras."** — Cyanview FAQ, on
   multi-operator setups; sharing across desks requires a REMI link instead.
   `https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/faq.md` (read 2026-08-29)
3. **"USB-Ethernet dongle must use ASIX AX88179 chipset (not AX88179A/B) or older Realtek
   RTL8153. Incompatible dongle can crash camera."** — Cyanview CSV, Sony FX6 row. The same row
   adds: "No further firmware releases beyond 2026 update; no new paint controls expected."
   Same URL as (1), read 2026-08-29.
4. **"The GPIO-8 is an active cable with embedded electronic components and ID circuits for
   auto-detection. It cannot be replicated with a standard cable."** — Cyanview FAQ.
   Same URL as (2), read 2026-08-29.
5. **"Enabling Portfast is strongly recommended"** — without it spanning tree can block the port
   for 30 seconds after link-up and the device never communicates; and certain Netgear 4G modems
   "respond to ARP requests meant for other devices, causing intermittent connections and
   disconnections", where "the only solution is isolating the modem for internet access only."
   — Cyanview troubleshooting guide.
   `https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/troubleshooting/troubleshooting.md` (read 2026-08-29)
6. **"Operating system: fixed an issue that could cause unexpected reboots"**, alongside
   **"Sony Alpha (A7S, FX3) USB cameras: crash fixed"** and **"Joystick: fixed a bug with the
   camera lock function"** — Cyanview release notes, release 26.4.1. Earlier release 25.9.5 lists
   **"TSL 5.0: fixed RED and GREEN showing at the same time"** and **"Sony Z200: fixed a critical
   bug — now works with limited control"**.
   `https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/release-notes.md` (read 2026-08-29)
7. **"Various methods fail on my camera as they are not supported on this model"** — Julusian
   (Companion maintainer), filing the Blackmagic REST API module request and cautioning
   implementers to work from an updated OpenAPI copy "as there could be changes".
   `https://github.com/bitfocus/companion-module-requests/issues/1383` (opened 2024-01-30, read 2026-08-29)
8. **"After the action is executed, the feedback takes an excessively long time. Sometimes
   minutes."** — reporter VoxelOne on three BMD Television Studio 6K Pro cameras with preset
   feedback, with module logs showing "frequent call timeouts".
   `https://github.com/bitfocus/companion-module-bmd-cameras/issues/3` (opened 2026-06-12, open, read 2026-08-29)
9. **"The AF command does not seem to work when pushed. However if you PUT
   /lens/focus/doAutoFocus then it works fine"** — with the Wireshark observation that "the
   difference seems to be something to do with the manual commands being sent as plain text."
   `https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues/3` (opened 2024-12-06, open, read 2026-08-29)
10. **"Which dongle did you use?"** — the entire substance of an issue asking which USB-C to
    RJ45 adapters actually work with a Micro Studio Camera 4K G2; open and unanswered since
    March 2025. The reporter's motivation: avoiding buying an ATEM just to get camera control.
    `https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues/7` (read 2026-08-29)
11. **"Both the ATEM and the camera always stay synchronized"** — user joniose describing the
    bridge they want between ATEM camera control and the camera REST API, adding "I'm not a
    strong programmer myself, so I'm not able to implement this on my own."
    `https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues/13` (opened 2026-02-02, open, read 2026-08-29)
12. **"This is a tech demo, and may not be suitable for production use"** — the author's own
    caveat on the most complete free Blackmagic REST camera-control UI in existence, which also
    lists limited colour correction, no preset save/download, and incomplete vertical layout.
    `https://raw.githubusercontent.com/DylanSpeiser/BM-Camera-Control-WebUI/main/README.md` (read 2026-08-29)
13. **"Feature bits to inhibit commands that aren't supported by all cameras"** — an obs-ptz
    feature request, open since February 2023, asking for a per-model capability model so the UI
    stops offering commands the camera cannot execute.
    `https://github.com/glikely/obs-ptz/issues/142` (read 2026-08-29)
14. **"You need to use TCP/IP sockets and not UDP"** — camera-engineer advice relayed into
    obs-ptz, with the follow-up "More reliable handling of queries might be achieved by using
    TCP/IP (or make this selectable as some MFG might need UDP)."
    `https://github.com/glikely/obs-ptz/issues/30` (read 2026-08-29)
15. **"Not all models support all actions, variables and feedbacks."** — the Panasonic Companion
    module's own README, on a module built against Panasonic's HD/4K Integrated Camera Interface
    Specifications v1.12.
    `https://raw.githubusercontent.com/bitfocus/companion-module-panasonic-cameras/main/README.md` (read 2026-08-29)
16. **Preset numbering starts at 0 for some vendors and 1 for others — a divergence present even
    between Sony cameras — and PTZOptics does not want the message header the VISCA specification
    defines.** `via search extract`, Jon Skeet, "Variations in the VISCA protocol", dated
    2023-11-25. `https://codeblog.jonskeet.uk/2023/11/25/variations-in-the-visca-protocol/`
    (domain blocked; could not open).
17. **Sony shields the 700 protocol from the public and licenses it only under strict NDA with
    high penalties for breach.** `via search extract`, Blackmagic forum thread "SDI RCU — Sony
    and other brands controlled by BMD SDI CCU".
    `https://forum.blackmagicdesign.com/viewtopic.php?f=4&t=89518` (domain blocked; could not open).
18. **The ATEM Camera Control Panel does not support focus control**, and a purchaser's stated
    reservation that "the coloring is more limited than the broadcast professional units".
    `via search extract` of `blackmagicdesign.com/products/atemcameracontrolpanel/techspecs` and a
    B&H listing for SWPANELCCU4 (both domains blocked; could not open). Date of the B&H comment
    is **unknown** — weight accordingly.
19. **Black balance is the first step in painting a camera and its absence "needs to be
    addressed."** `via search extract` of a Blackmagic forum thread on the ATEM Camera Control
    Panel with URSA Broadcast and Canon lenses.
    `https://forum.blackmagicdesign.com/viewtopic.php?f=4&t=165391` (domain blocked; could not
    open). Single source, date unknown — graded `isolated`.
20. **"Internet access is needed for the Blue Pill device to touch the Skaarhoj server to
    register an assigned license"**, with an offline alternative that requires emailing support
    with the panel's serial number to obtain a licence file. `via search extract` of
    `wiki.skaarhoj.com/books/blue-pill-reactor/page/installing-a-license-on-your-skaarhoj-controller`
    (domain blocked; could not open).

---

## What this means for AV Planner Suite

Kept short and separate from the evidence above; this section is INFERENCE throughout.

The recurring theme is that **every one of these failures is knowable before the truck leaves**
and none of them is captured anywhere a planner can act on. The suite's opportunity is not to
build another control panel — that market has a good product in it — but to own the
**planning-time model of controllability**:

- A per-camera-model **control capability matrix** as first-class project data: which protocol,
  which transport, bidirectional or open-loop, which paint parameters are reachable, minimum
  camera firmware, and the required cable or adapter part. Cyanview proves this data exists and
  ships it as a spreadsheet; `obs-ptz#142` proves engineers want it machine-readable.
- **Adapter and cable BOM with chipset-level specificity** — "FX6 needs an AX88179 dongle, not
  the A/B revision" belongs in a packing list, not in a support FAQ discovered at 18:00.
- A **network requirements sheet** generated from the chosen control system: UDP 3838 broadcast,
  TCP 1883, TCP 7887, Portfast on access ports, no shared 4G modem in the ARP domain.
- A **licence-tier check** against the planned camera count, per panel, before the job is
  confirmed: an OCTO panel and nine cameras is a purchase order, not a workaround.
- A **per-model pre-flight checklist** carried into the rig: set CR-N300 to Manual, set C100
  remote terminal to RC-V100, send SAVE on Dreamchip, use EasyIP credentials on AW-UB10.
- Explicit modelling of **open-loop control paths**, so a plan can warn that the shading position
  will have no feedback on those three Canon bodies and budget re-shade time accordingly.
- Offline-first, because every serious product in this segment already is, and the one cloud
  dependency that exists (cross-site REMI) has no self-hosted alternative.

---

## Sources

Pages opened and read directly during this pass (41). All read 2026-08-29.

**Cyanview documentation source repository** (`AlanOgic/cyanview-support`, deploys to
support.cyanview.cloud — see attribution caveat in Method):
1. https://github.com/AlanOgic/cyanview-support
2. https://github.com/AlanOgic/cyanview-support/tree/main/docs
3. https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides
4. https://github.com/AlanOgic/cyanview-support/tree/main/docs/guides/networking
5. https://github.com/AlanOgic/cyanview-support/tree/main/docs/reference
6. https://github.com/AlanOgic/cyanview-support/tree/main/docs/reference/troubleshooting
7. https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations
8. https://github.com/AlanOgic/cyanview-support/tree/main/docs/integrations/cameras
9. https://github.com/AlanOgic/cyanview-support/tree/main/docs/products
10. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/faq.md
11. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/troubleshooting/troubleshooting.md
12. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/reference/release-notes.md
13. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/licensing.md
14. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/guides/networking/remi.md
15. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/rcp.md
16. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/products/vp4.md
17. https://raw.githubusercontent.com/AlanOgic/cyanview-support/main/docs/integrations/Cyanview_Compatible_Cameras.csv
18. https://github.com/AlanOgic/cyanview-troubleshooter

**Blackmagic camera control:**
19. https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues?q=is%3Aissue
20. https://raw.githubusercontent.com/DylanSpeiser/BM-Camera-Control-WebUI/main/README.md
21. https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues/3
22. https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues/7
23. https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues/10
24. https://github.com/DylanSpeiser/BM-Camera-Control-WebUI/issues/13
25. https://github.com/bitfocus/companion-module-requests/issues/1383
26. https://github.com/bitfocus/companion-module-bmd-cameras/issues?q=is%3Aissue
27. https://github.com/bitfocus/companion-module-bmd-cameras/issues/3
28. https://github.com/bitfocus/companion-module-bmd-atem/issues/327

**Companion / panels / PTZ:**
29. https://github.com/bitfocus/companion/issues?q=is%3Aissue+is%3Aopen+camera
30. https://github.com/bitfocus/companion-module-panasonic-cameras/issues?q=is%3Aissue
31. https://raw.githubusercontent.com/bitfocus/companion-module-panasonic-cameras/main/README.md
32. https://github.com/bitfocus/companion-module-skaarhoj-rawpanel/issues
33. https://github.com/SKAARHOJ/skaarhoj-updater-releases/issues?q=is%3Aissue
34. https://github.com/search?q=skaarhoj+in%3Atitle&type=issues&s=reactions&o=desc
35. https://github.com/glikely/obs-ptz/issues
36. https://github.com/glikely/obs-ptz/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc
37. https://github.com/glikely/obs-ptz/issues/30
38. https://github.com/glikely/obs-ptz/issues/56
39. https://github.com/glikely/obs-ptz/issues/281
40. https://raw.githubusercontent.com/GrantSparks/grafton-visca/main/README.md
41. https://github.com/DelphiForBroadcasting/sony-700ptp-protocol

**GitHub API queries** (issue and repository search, results quoted inline above):
`glikely/obs-ptz` issues by reactions; `gphoto/libgphoto2` issues by reactions (289 matches);
`bitfocus/companion-module-bmd-atem` camera-control issues (16 matches);
`bitfocus/companion-module-panasonic-cameras` paint issues; `bitfocus/companion-module-requests`
camera-control requests (17 matches); repository searches for `cyanview`, `rawpanel skaarhoj`,
`companion-module panasonic cameras`, and Sony 700 protocol emulators (0 results).

**Read only as search extracts — domain blocked by the egress proxy, could not be opened:**
- https://support.cyanview.com/docs/troubleshooting/faq
- https://support.cyanview.com/docs/Manuals/RCP/RCPUI/RCPUILens
- https://support.cyanview.com/docs/Manuals/RCP/RCPControls
- https://support.cyanview.com/docs/Integrations/Canon/
- https://support.cyanview.com/docs/Integrations/Marshall/MarshallMinicam
- https://wiki.skaarhoj.com/books/blue-pill-reactor/chapter/troubleshooting
- https://wiki.skaarhoj.com/books/blue-pill-reactor/page/installing-a-license-on-your-skaarhoj-controller
- https://wiki.skaarhoj.com/books/blue-pill-reactor/page/rolling-back-updates
- https://wiki.skaarhoj.com/books/blue-pill-reactor/page/uploading-device-corespackagesos-from-offline
- https://shop.us.skaarhoj.com/products/device-core-tcp-link-license-for-blue-pill
- https://devices.skaarhoj.com/
- https://forum.blackmagicdesign.com/viewtopic.php?f=4&t=89518
- https://forum.blackmagicdesign.com/viewtopic.php?f=4&t=165391
- https://forum.blackmagicdesign.com/viewtopic.php?f=4&t=44222
- https://www.blackmagicdesign.com/products/atemcameracontrolpanel/techspecs
- https://www.bhphotovideo.com/c/product/1389185-REG/blackmagic_design_swpanelccu4_atem_camera_control_panel.html
- https://codeblog.jonskeet.uk/2023/11/25/variations-in-the-visca-protocol/
- https://obsproject.com/forum/threads/control-visca-over-ip-based-cameras.136462/page-2
- https://www.videoplusfrance.com/en/5056889-cyanview-rcp-upgrade-of-cy-rcp-duo-to-cy-rcp-octo.html
- https://www.videoplusfrance.com/en/5056887-cyanview-rcp-upgrade-of-cy-rcp-duo-to-cy-rcp-quattro.html
- https://documents.blackmagicdesign.com/DeveloperManuals/RESTAPIforBlackmagicCameras.pdf

**Attempted and unavailable:** reddit.com (unreachable from the container and refused by the
search tool's user agent), all German-language practitioner sources.

**Not applicable to this segment:** G2, Capterra, GetApp, Software Advice, TrustRadius,
Trustpilot — none of these products is a reviewed SaaS.
