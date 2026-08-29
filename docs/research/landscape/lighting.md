# Lighting Design / Visualisation / Control

> Research date: **2026-08-29** (the brief specified 2026-08-28; all pages below were actually
> fetched on 2026-08-29). Claims are labelled per [`docs/research/METHOD.md`](../METHOD.md):
> **FACT** (read on a cited page or in cited source), **INFERENCE** (reasoning from facts),
> **UNKNOWN / unverified** (could not be established — left visible rather than guessed).

---

## Source-access caveat (read this before trusting anything below)

This pass ran in the same locked-down environment as `landscape/tally.md` and
`landscape/show-control.md`, with the same two hard limits:

1. **WebSearch was exhausted before this dossier started.** The session's 200/200 WebSearch
   budget had been consumed by earlier segments. Zero searches were available — including the
   German-language searches the brief asked for.
2. **The egress proxy allowed only `github.com` and `raw.githubusercontent.com`.** Every vendor
   site probed returned `EGRESS_BLOCKED`: `gdtf-share.com`, `www.etcconnect.com`. On the
   evidence of the two prior dossiers the same is true of every other vendor host.

What partially saved this segment: **lighting is the one planning/visualisation segment whose
central interchange standard is developed in the open, on GitHub.** GDTF and MVR — the formats
that every commercial product in this category now claims to support — have their specification
text, their issue tracker, their reference library and a dozen independent parser
implementations hosted on GitHub. So the standards half of this dossier is unusually well
evidenced, from primary sources, and the product half is evidenced wherever a product's data
model or control surface leaks into open code.

**Consequences, stated plainly:**

- **There is not one verified vendor price in this dossier.** Not one. No pricing page was
  reachable and no search summary of one existed. Every price band below is marked
  `UNKNOWN — requires vendor page`. What *is* verified for the open-source half is **licence**,
  read from the repositories themselves, which for a build-or-buy decision is the more
  decision-relevant half anyway.
- **Several products named in the brief could not be verified at all.** WYSIWYG (CAST), Capture,
  Depence (Syncronorm), Realizzer, LightConverse, L8/Vision, Lightwright itself, Sunlite/Daslight,
  Avolites Titan/Synergy, Onyx (Obsidian) and MA 3D have **no meaningful GitHub presence** and
  their vendor sites were blocked. They are named in the "Not opened / unverified" section at
  the end rather than described from memory. Anything this dossier says about them is either
  quoted from a *third party's* open-source code or documentation, and labelled as such, or it
  is not said.
- **Hardware dongle / licence-lock questions are almost entirely unresolved.** This is a segment
  where the dongle question is commercially decisive (MA onPC parameter limits, WYSIWYG dongles,
  Capture licence tiers) and it is exactly the question that only vendor pages answer. Marked
  UNKNOWN throughout, with the specific page to check named.

Two sources deserve flagging up front because they carry a disproportionate share of the load:

- **`mvrdevelopment/spec`** is the actual DIN SPEC text for GDTF and MVR, in markdown, in git,
  with a public issue tracker carrying 107 open issues. It is the single best primary source in
  this pass and the only place in the whole research corpus where a live standards body's
  unresolved arguments can be read directly.
- **`Gribiche64/vectorworks-bridge`** contains a reverse-engineered specification of the
  **Lightwright Data Exchange XML** — the file that carries fixture data between Vectorworks
  Spotlight and Lightwright, i.e. the most-used paperwork interchange in theatrical lighting.
  Nobody publishes this format. Someone reverse-engineered it and wrote it down.

---

## Segment summary

**What this software category is for.** Lighting for a live show, a theatre production or a
broadcast studio passes through four distinct software jobs, and the market has four distinct
(overlapping, mutually hostile) product families to match:

| Job | What it produces | Typical products |
| --- | --- | --- |
| **Drafting / plot** | A scaled lighting plot: fixtures on a 2D plan, hung on positions, with symbols, legends and a title block | Vectorworks Spotlight, AutoCAD + libraries, Perastage |
| **Paperwork** | Channel hookup, instrument schedule, hanging schedule, colour cut list, gobo pull list, equipment/count list, magic sheet | Lightwright, LXLog, ad-hoc Excel |
| **Visualisation / previz** | A 3D render of the rig with beams, so looks can be pre-programmed off-site | WYSIWYG, Capture, Depence, MA 3D, ETC Augment3d, BlenderDMX, simpleVIS |
| **Control / programming** | Live DMX output driving the rig from cues, playbacks and effects | grandMA3, ETC Eos, ChamSys MagicQ, Avolites Titan, Onyx, QLC+, DMXControl |

**Who buys it.** Lighting designers and programmers (drafting + paperwork + previz),
rental/production companies (previz + control, usually bundled with the desk hire), theatres and
venues (control + paperwork, on long amortisation), broadcast facilities (control, usually
architectural/studio-preset rather than show-programming), and — increasingly — the crossover
crowd doing corporate AV who need a plot and a count list but will never touch a full console.

**Typical price band.** **UNKNOWN — no vendor pricing page was reachable.** What can be said from
verified evidence:

- The **open-source tier is genuinely free and genuinely capable**: QLC+ (Apache-2.0), OLA
  (LGPL-2.1), BlenderDMX, Perastage (GPL-3.0), Sorcerer (GPL-3.0), LXLog (GPL-3.0), simpleVIS
  (MIT). FACT, read from the repositories.
- A **new commercial tier of small cross-platform tools with proprietary licences and
  contact-for-price** exists — DMXRouter is the verified example (proprietary licence, "no
  pricing information ... interested users must contact the developer"). FACT.
- **Everything above that (consoles, WYSIWYG/Capture/Depence-class visualisers, Lightwright,
  Vectorworks) is UNKNOWN.** Inference from the segment's structure is that these span roughly
  low-hundreds (Lightwright-class paperwork tools) to five figures (console + visualiser
  packages), but **this is INFERENCE and must not be quoted as a price**.

**The structural fact that defines this segment in 2026:** since 2022–2023 the whole category has
been converging on **two open, DIN-standardised file formats — GDTF and MVR — that were created
by three of its own vendors** (MA Lighting, Robe, Vectorworks; FACT, quoted below). That is
unusual. In every other segment in this research corpus, interchange is fought over. Here the
vendors built the interchange format themselves and put the specification on GitHub. The
interesting question is therefore not "is there a standard" but **"what does the standard still
not cover"** — and the answer, read from the spec's own open issues, is: cables, fixture groups,
layer colour, and pixel topology.

---

## Product table

Legend: **Offline?** = does the core product work with no internet connection.
**API?** = is there a documented programmatic surface (file format, scripting, network control).
Prices are omitted from this table entirely because none could be verified; see the price note
in each deep dive and the *Pricing* section.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **grandMA3 (+ MA 3D)** | MA Lighting (DE) | Console hardware + onPC (Win; Linux via unofficial installer, FACT) | UNKNOWN — vendor page blocked | Yes (console) | Yes — Lua 5.4.4 plugin API (FACT, community-documented); OSC in/out (FACT, via Companion module) | Large-rig programming; the de-facto touring standard |
| **ETC Eos family (+ Augment3d)** | ETC (US) | Console hardware + Eos offline/nomad (Win/macOS) | UNKNOWN — vendor page blocked | Yes (console) | Yes — documented OSC API over TCP 3032 / 3037 SLIP (FACT); show file is **closed binary, no public parser** (FACT) | Theatrical cue-based programming; Augment3d bundles previz into the desk |
| **ChamSys MagicQ (+ MagicVis)** | ChamSys (UK) | Win/macOS/Linux + consoles | UNKNOWN | Yes | Partial — OSC and a UDP remote protocol (FACT: two separate Companion modules exist); serial "ChamSys RX" for wings (FACT, third-party) | Free-to-use software desk with a built-in visualiser |
| **Vectorworks Spotlight** | Vectorworks/Nemetschek (US/DE) | Win/macOS | UNKNOWN | Yes | Yes — Python/VectorScript/Marionette + C++ SDK (FACT, vendor GitHub org); Lightwright Data Exchange XML (FACT, reverse-engineered spec) | Scaled drafting, symbol libraries, venue geometry, MVR export |
| **Lightwright** | John McKernon Software (US) | Win/macOS | UNKNOWN | Presumed yes (INFERENCE) | Data Exchange XML with Vectorworks (FACT, third-party spec) | Paperwork of record: hookup, schedules, cut lists |
| **Capture** | Capture Sweden (SE) | Win/macOS | UNKNOWN | Presumed yes | UNKNOWN; MVR import/export attested by a third party (FACT) | Photoreal previz + plot output from one model |
| **WYSIWYG** | CAST Software (CA) | Windows | UNKNOWN | Presumed yes | UNKNOWN; MVR interchange attested by a third party (FACT) | Previz + paperwork + plot in one, deep console-link ecosystem |
| **Depence** | Syncronorm (DE) | Windows | UNKNOWN | Presumed yes | UNKNOWN | High-end render-quality visualisation (water/fountain/laser too) |
| **QLC+** | Massimo Callegari / community | Linux, Windows 10+, macOS 10.12+, Raspberry Pi (FACT) | Free, **Apache-2.0** (FACT) | Yes | Yes — DMX, Art-Net, sACN/E1.31, MIDI, OSC, HID, OS2L (FACT); web UI | Free capable control desk on any hardware incl. a Pi |
| **Open Lighting Architecture (OLA)** | Open Lighting Project | Linux, macOS, limited Windows (FACT) | Free, **LGPL-2.1** (FACT) | Yes — C++ client lib, Python module, experimental Java (FACT) | Yes | Protocol plumbing: the "travel adaptor for the lighting industry" |
| **BlenderDMX** | open-stage (community) | Anywhere Blender 4.2+ runs (FACT) | Free, open source (licence not stated in README — UNKNOWN) | Yes (GDTF Share fetch needs net) | Yes — Python; pygdtf/pymvr; MVR-xchange client+server (FACT) | Free GDTF/MVR visualisation and previz inside Blender |
| **Perastage** | PeramatoG (community) | Windows, macOS, Linux (AppImage) (FACT) | Free, **GPL-3.0** (FACT) | Yes (GDTF API fetch needs an account) | Yes — CLI workflow for MVR elements (FACT) | Opening, reviewing and editing an MVR without a visualiser licence |
| **DMXControl 3** | DMXControl Projects e.V. (DE) | Windows (INFERENCE from C#/.NET stack) | Freeware (INFERENCE — vendor page blocked) | Yes | Yes — network API via the "Umbra" component, TCP + auto-discovery (FACT, via its own Companion module) | German-language free control software with a real plugin ecosystem |
| **DMXRouter** | fiverecords | Windows, macOS (x86-64 + ARM64), Linux (FACT) | **Proprietary; contact developer, no published price** (FACT) | Yes (GDTF Share client needs net) | Yes — OSC out, MIDI I/O, web remote (FACT) | Art-Net/sACN/RDM routing, merging and MVR-driven commissioning |
| **ToskLight** | kellertobias | macOS, Windows, Linux, browser (FACT) | "ToskLight Community License" — free incl. commercial use, copyleft, no hardware bundling (FACT) | Yes | Yes — OSC, Art-Net, sACN, CITP/MSEX, ArtTimeCode (FACT) | An open command-line-style desk with tracking, cuelists and SQLite show files |
| **LXLog** | kaelenfae | Desktop (Electron) (FACT) | Free, **GPL-3.0** (FACT) | Yes | Import: EOS CSV, Lightwright Text, MA2/MA3 XML, MVR (FACT) | Free paperwork generator — the Lightwright job, open source |
| **simpleVIS** | stoatworks-labs | macOS/Windows/Linux (Tauri) + hosted browser build (FACT) | Free, **MIT** (FACT) | Desktop yes; browser build cannot receive UDP (FACT) | Art-Net 4, sACN, Enttec Pro USB, CITP (FACT) | Lightweight MVR-driven previz with volumetric beams |
| **Sorcerer** | Alva Theaters | Blender 4.0+ add-on (FACT) | Free, **GPL-3.0** (FACT) | Targets ETC Eos (full), grandMA3 (partial), QLab (audio) (FACT) | Yes | Animating lighting/video/audio cues in a 3D scene and driving a real desk |

Eighteen products. **Ten of the eighteen have licence, platform and capability verified from
primary sources. Eight are UNKNOWN on price and partially UNKNOWN on capability**, because their
vendor documentation was unreachable — those eight are exactly the eight commercial market
leaders, which is the honest shape of what this pass could and could not establish.

---

## Deep dives

### 1. GDTF + MVR — the interchange layer the whole segment now runs on

Not a product, but the most consequential thing in the segment, and the best-evidenced.

**What it is.** Two file formats, both published as German DIN specifications and both developed
in public on GitHub:

- **GDTF — General Device Type Format — DIN SPEC 15800, current version `2022-02`** (FACT).
  Describes *one device type*: its geometry, its DMX modes, its photometrics, its wheels.
- **MVR — My Virtual Rig — DIN SPEC 15801, current version `2023-12`** (FACT). Describes *one
  show*: which devices are where, addressed how, on which layers and positions.

Both are "available through Beuth Verlag, the official German standards publisher"; the working
repository holds the latest approved text on `main` and pending changes on `next`, and
commenting access is granted by emailing `info@gdtf-share.com` (FACT, all from
`mvrdevelopment/spec` README).

**Provenance matters here.** From the Open Fixture Library's own GDTF plugin manifest:

> "The file format was originally conceived and jointly developed by MA Lighting, Robe and
> Vectorworks to be an open standards technology."

FACT, read in `plugins/gdtf/plugin.json`. A console vendor, a fixture manufacturer and a CAD
vendor built the interchange format together. That is why it stuck.

**GDTF data model** (FACT, from `gdtf-spec.md`). A `.gdtf` file is a ZIP containing
`description.xml`, a `thumbnail.png`/`.svg`, a `./wheels/` folder of gobo and animation-wheel
images, and `./models/` subfolders holding 3D geometry as 3DS, glTF or SVG. The root
`FixtureType` node has these children, in this order:

1. `AttributeDefinitions` — every fixture-type attribute used (Dimmer, Pan, Tilt, Gobo1…)
2. `Wheels` — physical or virtual wheels that modify the beam
3. `PhysicalDescriptions` — emitters, filters, colour spaces and gamuts, non-linear DMX profiles,
   CRI data (TM-30-15), connectors (legacy) and wiring objects, and properties such as operating
   temperature, weight and leg height
4. `Models` — physically separated parts of the fixture
5. `Geometries` — how those parts are assembled and articulated
6. `DMXModes` — each selectable mode and its channel layout
7. `Revisions` — the fixture type's revision history
8. `FTPresets` — fixture-specific presets for show files
9. `Protocols` — which communication protocols the device supports

That `PhysicalDescriptions` node is the part worth staring at: **GDTF is not just a channel map,
it is a photometric and electrical datasheet in machine-readable form.** Emitter spectra, colour
gamut, CRI, weight, power. That is exactly the data a planning tool needs and normally has to
scrape out of a PDF.

**MVR data model** (FACT, from `mvr-spec.md`). A `.mvr` file is a ZIP (PKWARE 6.3.3) whose root
*must* contain `GeneralSceneDescription.xml`, with every referenced resource also at the archive
root — **no nested folders**. No encryption, STORE or DEFLATE only, UTF-8 throughout, and
filenames must differ by more than case alone. The root node carries `verMajor`/`verMinor`
(currently **1.6**), plus `provider` and `providerVersion` — i.e. *every MVR file records which
application wrote it*, which is a quietly excellent design decision for a format that has to
survive round-trips between hostile applications.

Inside `Scene → Layers → Layer` sit the parametric objects: `Fixture`, `Truss`, `Support`,
`VideoScreen`, `Projector`, `SceneObject`, `GroupObject`, `FocusPoint`. Cross-cutting structures
are `Position` (logical grouping of devices and trusses), `Class` (visibility filtering across
layers) and `AUXData` (holding `Symdef` reusable geometry, `Position`, `MappingDefinition`,
`Class`).

Geometry is **3DS** (explicitly deprecated; 1 unit = 1 mm) or **glTF 2.0** (`.gltf`/`.glb`,
ISO/IEC 12113, with GLB packaging recommended). All references are relative URIs; absolute paths
are prohibited.

A fixture links to its device definition with two elements: `GDTFSpec` (the filename, e.g.
`Custom@Fixture1.gdtf`) and `GDTFMode` (the mode name, **mandatory** whenever `GDTFSpec` is
given). Addressing is either an absolute integer or `Universe.Address` notation (1–512), and the
`Addresses` container also carries **network interface configuration** — IPv4/IPv6, DHCP flag,
hostname, subnet mask, and a geometry reference naming the physical port (`ethernet_1`,
`wireless_1`). A separate `Protocols` node assigns Art-Net, sACN, RDMnet, NDI and others to those
interfaces.

**This is the single most important design lesson in the segment for AV Planner Suite:** MVR does
not stop at "where is the light". It carries *the network plan* — which interface, which
universe, which address, which protocol. A rig file and a network plan in one document.

**MVR-xchange — the live sync protocol.** MVR also defines a network protocol for pushing scene
updates between applications while you work. pymvr explicitly does **not** implement it, noting
that "a full Python implementation exists in BlenderDMX" (FACT). Reading BlenderDMX's
implementation (FACT, `mvrxchange/mvrx_message.py` and siblings):

- Eight message types in four request/response pairs: `MVR_JOIN`/`MVR_JOIN_RET`,
  `MVR_LEAVE`/`MVR_LEAVE_RET`, `MVR_COMMIT`/`MVR_COMMIT_RET`, `MVR_REQUEST`/`MVR_REQUEST_RET`
- A 28-byte binary header (`!IIIIIQ`) with magic number `778682`, then version, packet number,
  packet count, message type and payload length — followed by a **JSON payload**
- `MVR_JOIN` carries provider name, station UUID, version (1.6) and commit history
- `MVR_COMMIT` carries `FileSize`, `FileUUID`, `FileName` (`.mvr`), `Comment` and target station
  UUIDs; `MVR_REQUEST` asks for a `FileUUID`
- Transports: a TCP client and a TCP server, **plus a WebSocket client**

So the model is git-like: stations join a session, announce commits by UUID, and pull the files
they don't have. **INFERENCE:** the WebSocket variant exists because consoles and cloud services
wanted a browser-reachable transport; that is not stated in the code read.

**What the standard still does not cover.** The spec repository has **107 open issues**
(FACT, repo metadata). Titles read on 2026-08-29 (FACT):

| # | Title | Why it matters |
| --- | --- | --- |
| #296 | **"Allow to define cables in MVR"** | MVR carries fixtures, trusses, universes and network interfaces — but **not cabling**. Open. |
| #295 | "Fixture groups" | No standard notion of a group survives the round-trip. |
| #321 | "MVR layers should carry a colour" | Layer semantics are thinner than every CAD tool's. |
| #304 | "Support multi-branch pixel controllers and abstract downstream pixel topology" | LED/pixel rigs do not model cleanly. |
| #298 | "MVR xchange Unified Global Import dialog library and Workflow consistency" | Implementations disagree about the *workflow*, not just the bytes. |
| #310 | "VideoScreen should have a screen type" | Video objects are underspecified. |
| #319 | "Attribute 'Prism(n)Pos' physical unit should be 'Angle' instead of 'AngularSpeed'" | Straightforward spec bug, still open. |
| #318 | "Should DMX Mode be renamed to better describe devices which are not lighting related" | The format is outgrowing lighting. |
| #315 | "Provide default DMX value for ModeMaster channel" | Ambiguity implementations must guess about. |
| #291 | "Clarify the use of LongName and further restrict characters in Name" | Naming rules still being tightened in 2026. |
| #79 | **"MVR XSD schema"** (open since 2021-04-22) | **There is still no published XSD to validate an MVR against.** |
| #81 | "MVR example file" (open since 2021-05-07) | No canonical reference file either. |
| #254 | "Clarify MVR_COMMIT - verMajor, verMinor" | The sync protocol has an unresolved versioning ambiguity. |

**#79 and #81 together are the sharpest finding in this dossier.** Five years into a DIN-published
format, there is no official schema to validate a file against and no official example file. That
is precisely why every implementation reads MVRs slightly differently — and it is the mechanism
behind the "my MVR opened wrong in their software" complaints the segment is full of.

**Independent corroboration of that fragility**, from Moment Factory's Omniverse converter (FACT):
"Not every aspect of the MVR specification is currently implemented for USD"; MVR files containing
trusses "could lead to strange behaviors and crashes"; and "GDTF files using 3ds model are
supported but will require python 3.10 cli installed on the host computer". A well-funded studio's
converter still stumbles on trusses and on the deprecated-but-ubiquitous 3DS geometry.

**The implementation ecosystem** (FACT, all repositories located and read/inspected on
2026-08-29) is genuinely broad, which is the standard's real strength:

| Language / host | Implementation |
| --- | --- |
| C++ (reference) | `mvrdevelopment/libMVRgdtf` — GDTF 1.2 + MVR 1.6; OSX, Windows, Linux, Android, iOS; CMake + Boost + Xerces-C |
| Python | `open-stage/python-gdtf` (pygdtf), `open-stage/python-mvr` (pymvr) |
| Rust | `BaukeWestendorp/rigger`, `mvr-gdtf` (archived), `Firionus/opengdtf` (abandoned) |
| Go | `Patch2PDF/GDTF-Parser`, `Patch2PDF/MVR-Parser` |
| Java | `Verschwiegener/GDTF4J`, `Verschwiegener/MVR4J` (MVR + XChange) |
| Swift | `bwees/SwiftGDTF` |
| Kotlin | `cueglow/glowdtf` (GDTF over Art-Net tech demo) |
| Unreal Engine | `ClayPakyOfficial/gdtf-importer` — **published by a fixture manufacturer** |
| Unity | `Wason-Fok/Unity-DMX-Fixture-Library` |
| TouchDesigner | `matthewwachter/td-gdtf` |
| Omniverse / USD | `MomentFactory/Omniverse-MVR-GDTF-converter` |
| Blender | `open-stage/blender-dmx` |

Two abandoned Rust attempts ("Abandoned! - A starting point for a useful GDTF Rust library") sit
alongside the working ones — **INFERENCE:** GDTF's geometry-tree and channel-function model is
substantially harder to implement fully than its ZIP-of-XML surface suggests.

---

### 2. BlenderDMX — the free visualiser that made GDTF/MVR practically accessible

**What it does.** A Blender add-on that turns Blender into a GDTF/MVR lighting visualiser and
DMX previz environment. 281 stars, actively maintained (last push 2026-08-28), requires **Blender
4.2 or higher, tested to 5.0** (FACT).

**Data model.** It does not invent one. It reads GDTF for device definitions and MVR for scenes,
via **pygdtf and pymvr**, which the same organisation maintains (FACT). That is the whole design:
the fixture library *is* GDTF Share, the scene format *is* MVR, and Blender supplies the renderer.

**Integrations, read from the repository's own module layout** (FACT, top-level tree on
2026-08-29): `acn.py` and `artnet.py` (sACN and Art-Net input), `gdtf.py`, `gdtf_file.py`,
`in_gdtf.py`, a `mvrxchange/` package implementing the full MVR-xchange protocol including a TCP
server and a WebSocket client, a `share_api_client/` package that talks to the GDTF Share API,
`i18n/` for multi-language UI, and `pypsn` v0.2.3 for **PosiStageNet** tracking data.

**Notable strengths.**

- **It is the reference implementation of MVR-xchange in the open.** pymvr's own README points at
  it. A free Blender add-on is the place other implementers go to learn a DIN-specified protocol.
- Full stack in one place: fixture library fetch → scene import → live DMX in → render out.
- The maintainer ships a family of small companion tools around the same libraries —
  `PollToMVR` (discover a real rig by Art-Net poll / RDM E1.20 / RDMnet LLRP and **write it out
  as an MVR**), `gDetour` (sACN channel remapper driven by GDTF mode definitions), `MVRtoKuma`
  (turn MVR fixtures into Uptime Kuma monitors). FACT, all read.

**Notable limits.**

- **Licence is not stated in the README** — UNKNOWN. (Blender add-ons are conventionally GPL, but
  that is INFERENCE, not verified.)
- It is a Blender add-on. That is a hard ceiling on who will use it: a lighting designer who does
  not already know Blender faces the Blender learning curve before the lighting one.
- GDTF Share fetch requires the network; local caching behaviour was not verified.
- Whether it produces *paperwork* — hookups, schedules, cut lists — was not established. **INFERENCE:
  no**, because nothing in the module layout suggests it and the ecosystem routes that job to
  other tools.

---

### 3. Perastage — the "just let me open this MVR" tool, and the most direct analogue to light-planner

**What it does.** A free desktop application for **viewing, editing and exporting MVR-based stage
files**, designed to make MVR files "easy to open, understand, review, and present" without a
full real-time DMX visualiser (FACT). Created 2025-12-07, already 112 stars by 2026-08-29 — the
fastest-growing repository found in this segment.

**Its own scope statement is the interesting part** (FACT): "Perastage is **not** a real-time DMX
visualizer." It deliberately refuses the hardest, most licence-encumbered job in the category and
takes the neglected one instead.

**Data model.** MVR in, MVR out. Fixtures are represented via **GDTF libraries**, with a "personal
dictionary" workflow so a user can maintain their own GDTF collection alongside the official one
(FACT). It can connect to **the official GDTF API to download fixture profiles if you have a GDTF
Share account** (FACT) — one of only two verified references to that API in this pass.

**Integrations & platform.** Windows, macOS and Linux (AppImage recommended, experimental Arch
packages), built with **C++20 and wxWidgets 3.3.1** (FACT). Both a 3D view and "plan-focused 2D
workflows" for reviewing "fixtures, trusses, hoists, objects, and scene structure" (FACT). It has
a **"Create from text"** feature and command-line tooling to "create, modify, adjust, and
distribute MVR elements from the command line" (FACT).

**Notable strengths.**

- **GPL-3.0 and completely free** (FACT) for a job the commercial tools charge for.
- The CLI angle is unusual and smart: MVR as something you script, not only something you click.
- 2D plan *and* 3D from one model — the same architecture light-planner already has.

**Notable limits.**

- No live DMX, by design.
- **Export formats beyond MVR are not documented** — whether it produces CSV, PDF or a printable
  plot is **UNKNOWN** from the README. This is the obvious gap and the obvious opportunity.
- Roadmap not published.

**Why this one matters most to AV Planner Suite:** Perastage is, functionally, what light-planner
would be if light-planner spoke MVR. Same shape (desktop, offline, 2D plan + 3D preview, free),
different centre of gravity (Perastage is MVR-native and paperwork-thin; light-planner is
paperwork-and-photometrics-rich and MVR-blind).

---

### 4. QLC+ and OLA — the free control tier, and what it proves about the fixture-library problem

**QLC+** (`mcallegari/qlcplus`, 1,513 stars, 486 forks, created 2012, last push 2026-08-29) is
"powerful and user-friendly software to control lighting" for live shows, theatre, architectural
installations and venues (FACT).

- **Licence: Apache-2.0.** **Platforms: Linux, Windows 10+, macOS 10.12+, and Raspberry Pi**
  (FACT). No dongle, no lock — verified by licence, not by marketing.
- **Protocols: DMX, Art-Net, E1.31/sACN, MIDI, OSC, HID, OS2L** (FACT). OS2L is the DJ-software
  cue protocol; its presence marks QLC+'s second audience.
- Latest release listed on the releases page at fetch time: **5.2.2** (FACT; the page rendered the
  date as "June 13" without a visible year — year UNKNOWN).
- Fixture library: community-contributed definitions organised by manufacturer. The repository's
  `resources/fixtures` tree shows **on the order of 100+ manufacturer directories**; GitHub's
  directory view does not print a total, so the exact fixture count is **UNKNOWN**.

**OLA — the Open Lighting Architecture** (`OpenLightingProject/ola`, 748 stars) is "a framework
for controlling entertainment lighting equipment" that abstracts protocols so developers write
control logic, not hardware drivers (FACT).

- **Licence: LGPL-2.1. Platforms: Linux, macOS, limited Windows** (FACT).
- **Bindings: C++ client library, a Python module, and an experimental Java library** (FACT).
- It converts between network protocols and works as a **DMX-over-IP → DMX512 gateway** with a USB
  device (FACT). Its own tagline — "The Travel Adaptor for the Lighting Industry" — is the honest
  description.
- The same organisation runs `libartnet` (Art-Net over IP), `ja-rule` (open DMX/RDM firmware for
  PIC32), `rp2040-dmxsun` (an open USB DMX dongle with a built-in web server), and the RDM
  parameter registry behind `rdm.openlighting.org`.

**The Open Fixture Library** (`OpenLightingProject/open-fixture-library`, MIT, 256 stars) is the
segment's most instructive piece of infrastructure. It exists because, in its own words, it
"tries to solve this problem by collecting fixture definitions and making them downloadable in
various formats", using "a JSON format that tries to bundle as much information as possible for
all the different output formats" (FACT).

Its export/import plugin list, read from the `plugins/` directory (FACT), is a map of the
fixture-definition format war:

`aglight` · `color-chief` · `colorsource` · `d-light` · `dmxcontrol3` · `dragonframe` · `ecue` ·
**`gdtf`** · `millumin` · `ofl` · `op-z` · `qlcplus_4.12.2`

Twelve target formats. And the GDTF plugin's own manifest states the reason OFL still exists at
all (FACT, quoted verbatim):

> "Since many manufacturers won't ever provide their fixture definitions in GDTF and many
> lighting programs (including legacy ones) won't ever understand them, the Open Fixture Library
> with this plugin is still needed ;)"

That single sentence is the segment's fixture-library reality: **GDTF won the standards argument
and has not won the coverage argument.** A parallel, differently-shaped, MIT-licensed library with
1,499 open issues still has to exist to bridge the gap.

The fixtures tree holds **roughly 120+ manufacturer directories** (FACT, approximate — GitHub
prints no total; exact fixture count **UNKNOWN**, would need the OFL website or a clone).

---

### 5. ETC Eos — a documented OSC API bolted to an undocumented binary show file

Eos could not be researched from ETC's own site (blocked). But two open-source projects document
its control surface in unusual depth, and what they document is a **textbook case of a good API on
a closed data model**.

**The data-model half** (FACT, `Codys-Wright/eos-toolkit`, created 2026-08-22):

> Eos show files use closed binary formats with no public parser. However, the running application
> exposes a complete OSC API that ETC officially documents and supports.

So the *file* is opaque and the *process* is scriptable. Everything a third party wants to do with
an Eos show must be done by talking to a running console.

**The control-surface half** (FACT, Bitfocus Companion's `companion-module-etc-eos` HELP):

- Works with **Eos v3.1.x and later**. Settings live in the Eos Shell on v3.1.x and earlier, and
  move to **Setup ▸ Device Settings ▸ Network** from v3.2.x.
- **Port 3032** by default; **port 3037 with "TCP 1.1 SLIP protocol"** as an alternative since
  Eos 3.1.
- Requires "OSC TCP Format is TCP format for OSC 1.0 (packet length headers)" and both OSC RX and
  OSC TX enabled under **Setup ▸ System ▸ Show Control ▸ OSC**.
- Eos running locally on the same Mac/PC can be reached on `127.0.0.1`.
- Known limits: the **User ID must be pre-configured on the console**; custom commands "may
  conflict if multiple users control the console simultaneously"; wheel-parameter updates require
  explicit fixture selection on the command line.

**The undocumented behaviour** — this is the most valuable single passage found in the whole pass,
because it is exactly the kind of thing vendors never write down (FACT, eos-toolkit README):

- **Effect creation requires the Effect editor to have UI focus.** Without it, writes fail
  *silently* with `Error: Effect Does Not Exist` — "a precondition ETC never documented". On macOS
  the toolkit automates focus via System Events (needing Accessibility permission), and has to use
  **Option+E rather than the published Ctrl+E** hotkey.
- **OSC cannot navigate the UI.** `/eos/key/effect` "reaches the command line but never moves
  the UI".
- Rule one: **read back after every write** — "Eos rarely errors on input it does not understand";
  commands vanish or get silently reinterpreted, and only read-back catches it.
- Rule two: **clear the stage before recording** — Record "stores every parameter that is not at
  its default", including running cues and live effects.

The toolkit's `eosdump.py` produces structured JSON snapshots of patch, cues, groups, effects and
macros; its writers are idempotent builders verified by read-back; and its MCP server has three
permission tiers (read-only / control / destructive).

**INFERENCE:** any integration that wants Eos data without a running console is blocked. The only
supported path in and out of an Eos show is OSC against a live desk — which means an offline
planning tool can *prepare* data for Eos (patch, groups, presets — exactly what LXLog's "EOS
Targets" export does) but cannot *read* an existing Eos show file.

ETC's own open-source arm, **ETCLabs** (33 repositories), is worth noting for what it publishes:
reference implementations of **sACN (ANSI E1.31)**, **RDM (ANSI E1.20)** and **RDMnet (ANSI E1.33)**
including an RDMnet Broker service, plus `EosSyncLib` ("C++ library for accessing Eos show data in
real time"), `lighthack` (build your own OSC hardware widgets), `OSCRouter`, `OSCWidgets` and
`ETCDmxTool` (a free open-source DMX/RDM sniffer). Every one of them is prefixed **"UNOFFICIAL"**
in its description except the protocol libraries — a deliberate line between "ETC supports this"
and "ETC engineers wrote this in their spare time" (FACT).

---

### 6. grandMA3 — a scriptable console whose ecosystem is community-documented

Again, unreachable at source; again, well evidenced by what surrounds it. A GitHub search for
`grandma3` returns **195 repositories** (FACT).

**Control surface** (FACT, `companion-module-malighting-grandma3` HELP): communication is over
**OSC**. The console must be configured in **Settings ▸ In&Out** with matching IP, port and
prefix, and **both "Receive Command" and "Receive" must be enabled** or nothing works. Available
actions cover Sequence selection, MAtricks, Macros, Plugins, Groups, Quick Keys, the At menu,
direct command-line execution, and executor button toggles across the 100/200/300/400 series.

**Scripting surface** (FACT). grandMA3 embeds **Lua 5.4.4** with an Object API and an
"Object Free" API. The documentation ecosystem around it is entirely community-built:

- `MacTirney/GrandMA3-API-Documentation` — community Lua API docs, "always changing based on new
  discoveries from readers"
- `hossimo/GMA3Plugins` — "Plugins and **unofficial lua docs**"
- `LightYourWay/grandMA3-types` and `ma3-pro-plugins/grandma3-ts-types` — **TypeScript type
  definitions** for the Lua API, plus a TS plugin template and build script
- `jefffarrow/grandMA3_lua_functions` — a VS Code library of built-in functions and enums
- `patopesto/GrandMA3-Plugins`, `imhofroger/GMA3_LUA`, `DeeeLight/FromDarkToLightTutorials`

**INFERENCE, but strongly supported:** the existence of *three independent* community efforts to
document and type an API — including two separate TypeScript typings projects — is the signature
of official documentation that practitioners find insufficient. The phrase "unofficial lua docs"
appears in a repository description with 111 stars.

**The paperwork gap, in the community's own words.** `leonreucher/grandma3-patch2pdf` is a Lua
plugin whose entire purpose is to "export the fixture patch as a PDF file to an USB thumb drive",
with sorting by patch order / fixture ID / DMX address and grouping by universe or stage (FACT).
It is in beta and its authors warn "errors can occur". **A community member wrote a PDF generator
in console-embedded Lua, writing to a USB stick, because getting a patch sheet off the desk any
other way was worse.**

**Other verified ecosystem facts:**

- `routmoute/grandMA3-linux-installer` installs **grandMA3 onPC v1.9.7.0 on Debian 12** (FACT).
  It notes "Only works in root for now, sorry" and "Only tested on Debian 12". Whether this is
  Wine or native, and what it does about licensing or parameter limits, is **UNKNOWN** — the
  README does not say, and this is precisely the dongle question I could not answer.
- `chienchuanw/gma2-mcp` drives **grandMA2 onPC over persistent Telnet** (FACT) — a different,
  older control surface than grandMA3's OSC.
- `Pahegi/ma3-mcp` and `stagehandshawn/EvoFaderWing`/`EvoCmdWing` (custom OSC fader and command
  wings, 99 and 59 stars) show a live DIY-hardware scene around the console.

---

### 7. Vectorworks Spotlight ↔ Lightwright — the paperwork axis, and the segment's ugliest interchange

This is the workflow that most theatrical lighting in the English-speaking world actually runs on,
and its interchange format is undocumented by both vendors. Someone reverse-engineered it, and
that reverse-engineering is the source for everything below (FACT,
`Gribiche64/vectorworks-bridge` README and `PROTOCOL.md`).

**How it works.** The **Lightwright Data Exchange XML** is a built-in Vectorworks Spotlight
feature, not a Lightwright one — "You don't need to own Lightwright — this is a built-in VW
feature that just writes XML." It is enabled at
**File ▸ Document Settings ▸ Spotlight Preferences ▸ Lightwright tab**, where the user curates
which fields export (Inst Type, Channel, Universe, Position, Color, Weight, Wattage, …).

**The sync mechanism is focus-driven, and that is not a joke:**

> "No manual export step — VW writes the XML automatically whenever focus switches away from VW."

Vectorworks writes the XML into the same folder as the `.vwx` file every time the application
loses focus, and applies inbound changes "when it next gains focus: the on-canvas symbol swaps,
the data fields update, the watcher refreshes the cache". A four-message handshake completes each
edit cycle.

**The format** (FACT, `PROTOCOL.md`):

- Root element `<SLData>` with three sections: `<Inventory>` (only written if "Include inventory"
  is on), `<ExportFieldList>` (the schema — an `<AppStamp>Vectorworks</AppStamp>`, a timestamp,
  and 20+ field name/display-name pairs) and `<InstrumentData>` (the per-fixture blocks, stamped
  `<AppStamp>Lightwright</AppStamp>` for inbound patches).
- Fixtures are keyed by UID, e.g. `<UID_1246_1_1_0_0>`. A patch carries `<Action>Update</Action>`,
  the `<UID>`, and a `<Lightwright_ID>` like `155226:2C4:1C:1:Vecto`, and must preserve
  `TimeStamp` (UTC, `YYYYMMDDhhmmss`), `AppStamp`, `Action`, `UID` and `Lightwright_ID` from the
  snapshot it was derived from.

**The gotchas, verbatim from the spec** — these are the real cost of this workflow:

- **Symbol validation:** "A type-swap patch whose target Symbol_Name doesn't exist in the
  drawing's resource library causes Vectorworks to lose drawing-wide fixture selectability."
  A bad type swap breaks selection *across the entire drawing*.
- **Wattage does not propagate:** "Vectorworks does NOT auto-update Wattage from the new symbol's
  default" on a type swap. The author names the failure mode: the **"frankenfixture"** — symbol
  swapped, wattage stale, load calculations silently wrong.
- **Filesystem:** writes must use native macOS paths, because "VM mounts don't propagate FSEvents
  to VW's file watcher".

**Corroborating evidence that this axis is painful.** Two independent developers have built
Vectorworks paperwork generators, ten years apart, and both hedge:

- `danielbchapman/OpenSpotlightDataExchange` (Java, 2016): "Currently the project is a sketch of
  how the import works and is not really usable." (FACT)
- `eosti/lighting-paperwork` (Python, created 2025-08, last push 2026-08-15): reads the Data
  Exchange XML (preferred) or a manual CSV from **File ▸ Export ▸ Lighting Device Data**, and
  produces a **channel hookup, instrument schedule, colour cut list and gobo pull list** as PDF,
  HTML or Excel. Its author writes: "I can only confirm that it has worked for this somewhat
  limited dataset", advises users "don't rely on this as your primary paperwork generation
  method", and **recommends buying Lightwright** if you need reliability and industry-standard
  results. (FACT)

That is the most honest competitive intelligence in this dossier: **a developer who built the free
alternative tells you to buy the paid tool.** Paperwork is not hard because the documents are
complicated; it is hard because being *trusted* with the document a crew hangs a show from is a
high bar.

**Vectorworks' own developer surface** (FACT, `Vectorworks/*` and `VectorworksDeveloper/*` GitHub
orgs): Python scripting (since VW 2014), VectorScript (Pascal-like), Marionette (node-based visual
programming), a documented function reference, a worksheet-function repository, and a C++ SDK with
examples. Notably, **the developer-scripting repository does not appear to document Spotlight
lighting-device, GDTF or MVR functions** — those directories are absent from the tree (FACT). So
the CAD API is public and the *lighting* API is not visibly documented there.

**Third-party plugins in the theatrical space** exist and are small: `john-salutz/Salutz-Tools-VW`
(free, unencrypted VectorScript objects for theatrical designers), `shamanskyh/Precircuiter`
(optimal pairing of lights to dimmers), `robertjaniak/change-lighting-type-class`,
`mrock87/Road-Case-Creator` (truck packs). All single-digit stars — **INFERENCE: the Vectorworks
plugin ecosystem for entertainment is thin and hobbyist, not a marketplace.**

---

## Standards & protocols

### File / data interchange

| Format | Status | What it carries | Notes |
| --- | --- | --- | --- |
| **GDTF** (`.gdtf`) | **DIN SPEC 15800**, current `2022-02`; format version 1.2 | One device type: geometry, models, DMX modes, wheels, photometrics, CRI, weight, power, supported protocols | ZIP of `description.xml` + `thumbnail` + `wheels/` + `models/` (3DS, glTF, SVG). Created by MA Lighting + Robe + Vectorworks. FACT |
| **MVR** (`.mvr`) | **DIN SPEC 15801**, current `2023-12`; format version 1.6 | One rig: fixtures, trusses, supports, video screens, projectors, focus points, layers, classes, positions, **DMX addressing and network-interface configuration** | ZIP with mandatory root `GeneralSceneDescription.xml`, flat structure, glTF 2.0 or (deprecated) 3DS geometry. **No published XSD** (spec issue #79, open since 2021). FACT |
| **MVR-xchange** | Part of the MVR spec | Live push/pull of MVR files between applications | 28-byte binary header (magic `778682`) + JSON payload; `MVR_JOIN` / `MVR_LEAVE` / `MVR_COMMIT` / `MVR_REQUEST` and their `_RET` replies; TCP **and** WebSocket transports. Read from BlenderDMX's implementation. FACT |
| **`Universal.gdtt`** | GDTF template file, referenced by MVR | Reusable Gobos, Emitters and Filters used to overwrite fixture properties | FACT, from `mvr-spec.md` |
| **Lightwright Data Exchange XML** | **Vendor-proprietary, undocumented** | Per-fixture data between Vectorworks Spotlight and Lightwright: Inst Type, Channel, Universe, Position, Color, Weight, Wattage, … | Root `<SLData>`; UID-keyed; focus-triggered auto-write; reverse-engineered spec at `Gribiche64/vectorworks-bridge`. FACT |
| **ETC Eos show file** | **Closed binary, no public parser** | Everything | Only accessible via OSC against a running console. FACT |
| **OFL JSON** | Open, MIT | Fixture definitions, exported to 12 target formats | `OpenLightingProject/open-fixture-library`. FACT |
| **glTF 2.0 / 3DS** | ISO/IEC 12113 / legacy Discreet | Geometry inside MVR and GDTF | 3DS deprecated but ubiquitous; 1 unit = 1 mm. FACT |
| **EOS CSV / Lightwright Text / MA2-MA3 XML** | Vendor exports | Patch and fixture data | Attested as importable by LXLog. FACT |

### Wire protocols

| Protocol | Standard | Role | Verified evidence |
| --- | --- | --- | --- |
| **DMX512** | ANSI E1.11 (not itself verified in this pass) | The wire | Universal |
| **Art-Net** (v4) | Artistic Licence, open publication | DMX over IP; `ArtPoll`/`ArtPollReply` node discovery | `OpenLightingProject/libartnet`; `DMXControl/ArtNetSharp` ("ArtNet protocol version 4 in C#"); DMXRouter states Art-Net 4. FACT |
| **sACN / Streaming ACN** | **ANSI E1.31-2018** (ESTA) | DMX over IP with per-source priority and multicast | `ETCLabs/sACN` (Apache-2.0, C/C++): "an ANSI standard for entertainment technology by ESTA for transmission of DMX512 data over IP networks". FACT |
| **RDM** | **ANSI E1.20** | Bidirectional device management over the DMX line | `ETCLabs/RDM`; `DMXControl/RDMSharp` (implements E1.20, E1.33, E1.37-1, -2, -5, -7 per its repo description; **CC BY-NC-4.0 licence**). FACT |
| **RDMnet** | **ANSI E1.33** | RDM over IP, with a Broker service and LLRP discovery | `ETCLabs/RDMnet`, `ETCLabs/RDMnetBroker`. FACT |
| **LLRP** | Part of E1.33 | Low-level network target discovery | Used by `vanous/PollToMVR`. FACT |
| **CITP / MSEX** | Open protocol (ESTA-adjacent) | "used between visualizers, lighting control consoles and media servers to transport non-show critical information during pre-production" | `jeremymadea/libcitp` description; implementations in Rust (`nannou-org/citp`), C# (`pixsper/citpsharp`), C++ (`jwarwick/citp-lib`), plus a Wireshark dissector (`hossimo/CITP-Dissector`). Supported by simpleVIS and ToskLight. FACT |
| **OSC** | Open Sound Control | The universal console remote-control layer | ETC Eos (TCP 3032 / 3037 SLIP, OSC 1.0 packet-length framing); grandMA3 (Settings ▸ In&Out); ChamSys MagicQ; QLC+. FACT |
| **PosiStageNet (PSN)** | Open | Real-time position tracking of performers/objects into the lighting system | `open-stage/python-psn`; used by BlenderDMX and `hrueger/onpoint` (follow-spot tracking to grandMA3). FACT |
| **OS2L** | Open | DJ-software → lighting cue triggering | Supported by QLC+. FACT |
| **ArtTimeCode** | Part of Art-Net | Timecode distribution | Supported by ToskLight. FACT |

**The protocol picture is genuinely healthy.** Unlike intercom or tally, this segment has open,
documented, multi-vendor-implemented wire protocols with reference libraries in C, C++, C#, Rust,
Python and Swift, several of them published by a console manufacturer (ETCLabs). Interoperability
at the *wire* level is a solved problem. Interoperability at the *document* level is not.

---

## What this segment does WELL

Patterns worth stealing, each anchored to verified evidence:

1. **The industry built its own interchange format, and put the spec in git.**
   GDTF/MVR is developed on GitHub with a public issue tracker, a `main`/`next` branch split
   mirroring approved-vs-pending DIN revisions, free default 3D meshes, and an open route to
   commenting access. Any format an AV Planner Suite app invents should be published the same way.

2. **The scene file carries the network plan, not just the geometry.**
   MVR's `Addresses` container holds universe/address *and* IPv4/IPv6 configuration, DHCP flags,
   hostnames, subnet masks and a geometry reference naming the physical port — with a `Protocols`
   node binding Art-Net/sACN/RDMnet/NDI to those interfaces. **This is the single best idea in
   the segment for cable-planner**: a rig document that is simultaneously a network document.

3. **Every file records who wrote it.** MVR's root node mandates `provider` and `providerVersion`.
   When a file crosses vendor boundaries, that one field is the difference between a diagnosable
   bug and a shrug. Cheap to copy; light-planner and cable-planner should both do it.

4. **The fixture definition is a datasheet, not a channel map.** GDTF's `PhysicalDescriptions`
   carries emitters, filters, colour spaces and gamuts, non-linear DMX profiles, TM-30-15 colour
   rendering data, weight, power and operating temperature. light-planner already computes lux
   heatmaps and per-phase electrical load from photometrics — GDTF is a standardised, vendor-
   maintained source for exactly those numbers.

5. **A DIN-standardised sync protocol exists and is git-shaped.** MVR-xchange's join / commit /
   request-by-UUID model is a sane distributed-editing design that avoids the "who has the latest
   file" problem without a server.

6. **Discovery-to-document tooling.** `PollToMVR` polls a *real* rig by Art-Net, RDM or RDMnet
   LLRP and writes an MVR with names, IPs, universes, addresses and linked GDTF profiles. The
   as-built rig becomes the document. That closes the plan-vs-reality loop that every planning
   tool leaves open.

7. **Consoles expose scriptable, documented control surfaces.** Eos's OSC API is officially
   documented; grandMA3 embeds Lua 5.4.4; MagicQ has OSC and a UDP remote protocol; DMXControl
   exposes a network API with auto-discovery. Planning tools can *push* into desks even when they
   cannot read desk files.

8. **Manufacturers ship their own integrations.** Clay Paky publishes an Unreal Engine GDTF
   importer; ETC publishes reference implementations of three ANSI standards. Fixture and console
   vendors treat interoperability code as marketing.

9. **The open-source tier is not a toy tier.** QLC+ (Apache-2.0) runs on a Raspberry Pi and
   speaks seven protocols. Perastage (GPL-3.0) opens MVRs on three platforms. simpleVIS (MIT)
   does volumetric-beam previz. ToskLight offers tracking, cuelists and a versioned SQLite show
   format. None of them require a dongle.

10. **Honest scope statements.** Perastage: "Perastage is **not** a real-time DMX visualizer."
    simpleVIS: "nothing has been driven by a real console or a real DMX interface yet."
    eosti/lighting-paperwork: "don't rely on this as your primary paperwork generation method."
    This is a community that says what its software does not do. light-planner's README already
    does this ("It is **not** a replacement for Vectorworks, or Capture") and should keep doing it.

---

## What NOBODY in this segment solves well

The white space, ordered by how confident the evidence makes me.

### 1. MVR does not carry cables — and nobody has a rig-to-cable document

**Evidence: spec issue #296, "Allow to define cables in MVR", open** (FACT). MVR models fixtures,
trusses, supports, video screens, positions, universes and *network interfaces* — and stops. There
is no standard representation of the DMX chain, the power chain, or the physical cable runs
between them.

So: the lighting rig is a standardised, machine-readable document, and the cabling that makes it
work is not. Every lighting department still derives cable counts and runs by hand from a plot.
**This is the clearest unclaimed ground found in this dossier, and it sits exactly where
cable-planner and light-planner meet.**

### 2. No MVR schema, no MVR reference file — so every implementation reads MVR differently

**Evidence: spec issues #79 ("MVR XSD schema", open since 2021-04-22) and #81 ("MVR example
file", open since 2021-05-07)** (FACT). Five years after publication there is nothing to validate
against and nothing to test against.

Corroboration: Moment Factory's Omniverse converter warns that MVR files containing **trusses**
"could lead to strange behaviors and crashes" and that "Not every aspect of the MVR specification
is currently implemented" (FACT). Spec issue #298 asks for "workflow consistency" in MVR-xchange
import dialogs — i.e. implementations disagree about *behaviour*, not only bytes (FACT).

**Nobody sells an MVR validator/linter.** A tool that opens an MVR and tells you, precisely, what
in it will break in MA3 / Capture / Vectorworks / BlenderDMX does not appear to exist.

### 3. Paperwork is stuck between one trusted paid tool and a graveyard of abandoned free ones

**Evidence** (FACT): `OpenSpotlightDataExchange` (2016) — "not really usable".
`eosti/lighting-paperwork` (2025–26) — "don't rely on this ... buy Lightwright".
`grandma3-patch2pdf` — a Lua plugin writing PDFs to a USB stick because the console cannot.
`LXLog` — a full GPL-3.0 attempt, 6 stars, created 2026-01.
`Charlie9830/darkwrong` — a Flutter data-table experiment, abandoned 2020.

Five independent attempts across ten years. The job — channel hookup, instrument schedule,
hanging schedule, colour cut list, gobo pull list, magic sheet, equipment count — is well defined
and everybody agrees on the outputs. What nobody has replicated is *trustworthiness at scale*.

### 4. The visualiser and the paperwork tool are different products, and the plot is a third

Perastage explicitly refuses live DMX. BlenderDMX visualises but shows no evidence of paperwork.
LXLog does paperwork but not 3D. simpleVIS does beams but not documents. On the commercial side
the split is the same shape (**INFERENCE** — vendor pages blocked, but the open-source ecosystem
has evidently organised itself around the same seams).

**A single document that yields a scaled plot, a hookup, a load calculation and a 3D check does
not exist in the free tier**, and appears not to exist in one product in the paid tier either.

### 5. Fixture-library coverage is still not solved, standard or no standard

The Open Fixture Library — MIT, 256 stars, **1,499 open issues** — exists in 2026 because, in its
own words, "many manufacturers won't ever provide their fixture definitions in GDTF and many
lighting programs (including legacy ones) won't ever understand them" (FACT). Twelve export
plugins for twelve incompatible target formats.

Meanwhile GDTF Share requires an account for API access (FACT, from both Perastage and
BlenderDMX). Its total fixture count is **UNKNOWN** to this pass; a third party (Moment Factory)
describes GDTF as covering "over 100 manufacturers" (FACT, as a third-party claim). Neither number
is verified against gdtf-share.com.

### 6. Getting data *out* of a console is a second-class path everywhere

Eos show files are closed binary with no public parser (FACT). grandMA3's patch leaves the desk as
a beta community Lua plugin writing PDFs to a thumb drive (FACT). grandMA2 is driven over Telnet
(FACT). The direction that works everywhere is *into* the desk; the direction planners need — the
as-programmed reality coming back out — is patchy.

`PollToMVR` is the only tool found that goes the other way (network → document), and it discovers
the *rig*, not the *show*.

### 7. Console APIs have undocumented preconditions that fail silently

**Evidence** (FACT, eos-toolkit): effect writes fail silently with a misleading error unless a UI
panel has focus; a documented hotkey is wrong on macOS; "Eos rarely errors on input it does not
understand". The mitigation the toolkit's author landed on — **read back after every write** —
is a general design rule for anything integrating with a lighting desk, and it is nowhere in the
vendor documentation.

### 8. Linux is a second-class citizen for the products that matter

QLC+, OLA, Perastage, DMXRouter, ToskLight and simpleVIS run on Linux (FACT). grandMA3 onPC runs
on Debian 12 only through an unofficial installer that "only works in root for now" (FACT). OLA's
own README concedes "limited Windows support" (FACT). **INFERENCE:** the commercial visualiser and
console tier is Windows-first with macOS second, and the Linux story is community-maintained.

### 9. Dongles and licence locks are undiscussable

I could not verify a single dongle, licence-key or parameter-limit fact for any commercial product
in this segment. This is a known, decisive, expensive dimension of the market and this pass has
**nothing** on it. Named as a gap in the research, not in the market.

---

## Relevance to AV Planner Suite

Ranked by leverage.

### light-planner — primary, and the strategic call is clear

light-planner today (FACT, from its README and `INTEGRATION.md`) has: a 2D plan canvas with metre
grid and calibrated floor-plan import (JPG/PNG/multi-page PDF with a drag-to-scale calibration), a
Three.js 3D preview with beam cones, a **lux heatmap from photometric data** with under/on/over
target colouring, a built-in fixture and gel library (Source Fours, PARs, Fresnels, LED panels,
moving heads, current Elation KL range, LEE/Rosco gels), AI-assisted fixture creation from a
datasheet with provenance shown per field, **auto-numbering and footprint-aware DMX auto-patch
with clash detection**, equipment list / instrument schedule / electrical-load summary (kW, A per
phase, 16 A circuits) exported to CSV, trusses and hanging positions, 3-point and area-fill
auto-place helpers, single-file local projects, and PNG/JPG/PDF export. Its core
(`src/core/`) is UI-free and platform-free behind a `HostAdapter`.

Measured against this dossier, that is **already stronger on paperwork and photometrics than every
free tool found**, and completely absent on the one thing the whole segment now agrees on.

1. **Import MVR. This is the highest-leverage single feature available to the suite.**
   An MVR gives light-planner, for free: fixture positions in real coordinates, trusses and
   supports, focus points, layers/classes/positions, universes and DMX addresses, *and* network
   interface configuration — from Vectorworks, Capture, WYSIWYG, MA3 and grandMA3 alike
   (interoperability with those four named products is attested by DMXRouter's documentation,
   FACT). It converts light-planner from "sketch tool" to "the thing that opens the file the
   designer was sent". Perastage proves the demand: 112 stars in nine months for a tool that only
   opens MVRs.
   - Implementation is not speculative: `pymvr`, `rigger` (Rust), `MVR4J` (Java),
     `Patch2PDF/MVR-Parser` (Go) and `libMVRgdtf` (C++, all platforms) all exist as references,
     and MVR is a ZIP of XML plus glTF — which a Three.js app can render natively.
   - Watch the traps this dossier documented: flat archive structure (no nested folders), 3DS
     geometry at 1 unit = 1 mm, `GDTFMode` mandatory whenever `GDTFSpec` is present, and **no XSD
     to validate against** (spec #79).

2. **Import GDTF for the fixture library.** light-planner's library is hand-curated and
   AI-assisted from datasheets. GDTF's `PhysicalDescriptions` is the same data, standardised and
   vendor-maintained: emitters, filters, colour gamut, TM-30-15 CRI, weight, power, plus the DMX
   mode and footprint the auto-patch already needs. **The AI datasheet-extraction feature should
   stay** — it is the answer for fixtures GDTF Share does not cover, which OFL's own manifest says
   will always exist. GDTF first, AI extraction as the fallback, with the existing
   "shows where each value came from" provenance UI covering both.

3. **Export MVR.** Lower priority than import but strategically bigger: it makes light-planner a
   *contributor* to the ecosystem rather than a consumer, and it is the route by which a
   light-planner rig reaches a real console or visualiser.

4. **Do not build a real-time visualiser.** Perastage's refusal is the right call and
   light-planner's README already makes the same one. The 3D view is a sanity check, not a previz
   product. Live DMX output is a different business with a much higher reliability bar (simpleVIS
   is honest that it has never been driven by a real console).

5. **Paperwork is where light-planner can beat the free field outright.** LXLog's target list is
   the benchmark to match: Channel Hookup, Hanging Schedule, Magic Sheet, Patch, Equipment List,
   Cutting List, and **EOS Targets (Groups, Presets, Subs)** — that last one being the pattern
   worth copying, since pushing prepared groups/presets into a desk is possible even though
   reading a desk's show file is not. light-planner already has the equipment list, instrument
   schedule and load summary; hookup, hanging schedule, colour cut list and gobo pull list are the
   named gaps.

6. **Adopt MVR's two cheap design ideas immediately**, regardless of whether MVR import ships:
   record `provider`/`providerVersion` in the project file, and let addressing carry the network
   interface alongside the universe.

### cable-planner — secondary, but this is where the white space is

`INTEGRATION.md` records (FACT) that cable-planner is already lighting-aware:
`ProjectMetadata.defaultLightingControl: 'dmx512' | 'artnet' | 'sacn'`, connector types including
`DMX 5-pol (XLR)` and `PowerCON`, and equipment carrying `categoryProps`,
`powerConsumptionWatts` and `weightKg`. light-planner's `src/integration/equipment.ts` already
maps a fixture to a cable-planner `EquipmentItem` with `inputs: [DMX In (U1.13), Power[PowerCON]]`
and `outputs: [DMX Thru]`.

- **MVR spec issue #296 — "Allow to define cables in MVR" — is open.** The standard that every
  lighting product now speaks explicitly does not model cabling. cable-planner does. An MVR
  imported into light-planner and pushed through the existing `fixtureToEquipment` mapping
  produces the DMX and power chain that MVR itself cannot express. **That is a differentiator the
  standards body has publicly conceded it does not cover.**
- MVR's `Addresses`/`Protocols` nodes (interfaces, IPs, DHCP, subnet, Art-Net/sACN/RDMnet
  assignment per port) map directly onto cable-planner's network-planning surface. Importing them
  gives cable-planner a lighting-network plan for free.
- **Art-Net and sACN node discovery is a realistic future feature** for verifying a plan against a
  real network: `ArtPoll`/`ArtPollReply` and RDMnet LLRP are open, documented and implemented in
  libraries across five languages, and `PollToMVR` demonstrates the whole pattern end to end.

### shell / suite — real, moderate

- **MVR-xchange is a template for the suite's own cross-app sync.** Join / commit-by-UUID /
  request-by-UUID over TCP or WebSocket, with a provider identifier in every payload, is a small,
  proven, serverless design — and cable-planner already ships CRDT collaboration and a signalling
  relay, so the machinery is adjacent.
- **GDTF/MVR should live in a shared package, not inside light-planner.** Fixtures are equipment;
  `@avplan/inventory-core` is where a GDTF-derived device belongs, so cable-planner and
  multicam-planner can see the same objects. The wire-format-frozen-by-test discipline already in
  that package is exactly right for a standards-derived model.
- The suite's offline-first stance matches the segment: every verified free tool here is a local
  desktop app, and the only online dependency anywhere is the GDTF Share fixture download.

### multicam-planner — indirect

Shares the venue exchange format with light-planner (FACT, suite README), so an MVR-derived venue
and truss geometry would land there too. MVR's `Projector` and `VideoScreen` objects are directly
relevant to a camera/venue planner. **PosiStageNet** is the segment's tracking protocol and is
already used for follow-spot work (`hrueger/onpoint`) — plausible future overlap with camera
tracking, but speculative.

### tally-pi, broadcast-intercom, sony-camera-bridge, pi-media-station — minimal

- **tally-pi:** no direct overlap. Weak indirect note — sACN/E1.31 and Art-Net are the same
  UDP-multicast-on-a-show-LAN neighbourhood tally traffic lives in, and `ETCLabs/sACN` (Apache-2.0,
  C/C++) is a well-tested reference if anything ever needs to receive sACN on a Pi.
- **broadcast-intercom:** no overlap beyond both being Companion-module targets.
- **sony-camera-bridge:** none.
- **pi-media-station:** none, beyond QLC+ demonstrating that a Raspberry Pi is a viable host for
  entertainment control software (FACT).

---

## Pricing (what this pass could and could not establish)

**No price for any product in this segment was verified.** Every vendor pricing page was blocked by
the egress proxy and the WebSearch budget was exhausted before this dossier began.

What is verified is **licensing and distribution model**, read from repositories on 2026-08-29:

| Product | Licence / model | Verified from |
| --- | --- | --- |
| QLC+ | **Apache-2.0**, free | Repository README |
| Open Lighting Architecture | **LGPL-2.1**, free | Repository README |
| Open Fixture Library | **MIT**, free | Repository page |
| Perastage | **GPL-3.0**, "completely free" | Repository README |
| Sorcerer | **GPL-3.0** | Repository README |
| LXLog | **GPL-3.0** | Repository README |
| simpleVIS | **MIT** | Repository README |
| ToskLight | **"ToskLight Community License"** — free use/modification/distribution incl. commercial productions; modified versions must publish source under the same licence; **cannot be bundled with hardware without separate licensing** | Repository README |
| ETCLabs sACN | **Apache-2.0** | Repository README |
| DMXControl RDMSharp | **CC BY-NC-4.0** (non-commercial) | Repository README |
| BlenderDMX | "free and open source", **specific licence not stated in README** | Repository README |
| libMVRgdtf | Licence file exists, terms not stated in README — **UNKNOWN** | Repository README |
| DMXRouter | **Proprietary**, "no pricing information — interested users must contact the developer" | Repository README |
| grandMA3, ETC Eos, MagicQ, Vectorworks Spotlight, Lightwright, Capture, WYSIWYG, Depence, Onyx, Avolites, Realizzer, LightConverse, Sunlite/Daslight | **UNKNOWN** | — |

**To fill the price gap, re-run with network access to:** `malighting.com`, `etcconnect.com`,
`chamsyslighting.com`, `vectorworks.net` (Spotlight, and its subscription vs perpetual split),
`mckernon.com` (Lightwright), `capture.se`, `cast-soft.com` (WYSIWYG), `syncronorm.com` (Depence),
`obsidiancontrol.com` (Onyx), `avolites.com`, `realizzer.com`, `lightconverse.net`,
`nicolaudie.com` (Sunlite/Daslight), `dmxcontrol-projects.org`, and `gdtf-share.com` for the
fixture count and API terms. German-language searches on `event-tech` and `production-partner.de`
would give the DACH rental-market price reality the brief specifically asked for and this pass
could not deliver.

---

## Offline behaviour (verified)

| Product | Offline | Notes |
| --- | --- | --- |
| QLC+ | Full | Local desktop app; runs on a Pi. FACT |
| OLA | Full | Daemon + client libraries. FACT |
| Perastage | Full for local MVR/GDTF | GDTF **API** download needs a GDTF Share account and network. FACT |
| BlenderDMX | Full for local files | GDTF Share fetch needs network; local caching behaviour UNKNOWN. FACT/UNKNOWN |
| DMXRouter | Full | Integrated GDTF Share client needs network. FACT |
| simpleVIS | Desktop build full | **Browser build cannot receive UDP** — "a browser cannot receive UDP, no workarounds exist"; that build hides the unavailable features rather than faking them. FACT |
| LXLog | Full | Electron desktop app. FACT |
| ToskLight | Full | Versioned SQLite `.show` files, local. FACT |
| Consoles (grandMA3, Eos, MagicQ, Onyx, Titan) | Full by design | A lighting console that needed the internet would be unusable. INFERENCE, but safe |
| GDTF Share | **Online only** | The single genuine cloud dependency in the segment. FACT |

**The segment's offline posture is excellent and should be matched, not compromised.** The only
online dependency is the fixture library, and the right pattern — visible in Perastage's "personal
dictionary" and BlenderDMX's local GDTF handling — is: fetch when you can, cache locally, work
from the cache.

---

## API surfaces (verified)

| Product | Surface | Detail |
| --- | --- | --- |
| ETC Eos | **OSC over TCP** | Port 3032 default; port 3037 with TCP 1.1 SLIP since Eos 3.1; OSC 1.0 packet-length framing; enable under Setup ▸ System ▸ Show Control ▸ OSC; per-user ID. Show file is closed binary with no public parser. FACT |
| grandMA3 | **Lua 5.4.4 plugin API + OSC** | Object API and Object Free API; OSC configured in Settings ▸ In&Out with "Receive Command" and "Receive" both enabled. Community-written docs and TypeScript typings. FACT |
| grandMA2 | **Telnet** | Persistent Telnet session for command pipelines. FACT |
| ChamSys MagicQ | **OSC + UDP remote + serial** | Two distinct Companion modules (OSC and UDP); "ChamSys RX protocol" over serial for DIY wings. FACT |
| DMXControl 3 | **Network API via "Umbra"** | Auto-discovery by Network ID, or manual IP + TCP port; executors/macros with state, name, value and image feedback. FACT |
| Vectorworks | **Python, VectorScript, Marionette, C++ SDK** | Documented in the vendor's GitHub org. Spotlight/GDTF/MVR functions **not** documented there. FACT |
| Vectorworks ↔ Lightwright | **Focus-triggered XML side-car** | `<SLData>` root; auto-written on focus loss, auto-applied on focus gain; UID-keyed updates; four-message handshake. Undocumented by both vendors; reverse-engineered spec available. FACT |
| GDTF Share | **HTTP API, account required** | Used by Perastage and BlenderDMX. Endpoints and auth mechanics **UNKNOWN** — the client source files could not be fetched. |
| MVR-xchange | **TCP + WebSocket, binary header + JSON** | See Standards section. FACT |
| QLC+ | OSC, MIDI, Art-Net, sACN, HID, OS2L, web UI | FACT |
| OLA | C++, Python, experimental Java client libraries | FACT |

---

## Not opened / unverified

Named in the brief or discovered during research, but **not verifiable** in this environment.
Listed so the pass can be re-run rather than quietly dropped:

- **grandMA2 and MA 3D** — the visualiser half of the MA ecosystem; nothing verified beyond a
  Telnet control library and Companion modules.
- **WYSIWYG (CAST Software)** — no GitHub presence found. Only third-party evidence that it
  participates in MVR interchange (DMXRouter's documentation).
- **Capture (Capture Sweden)** — same: MVR interchange attested third-hand only.
- **Depence (Syncronorm)** — nothing found.
- **Realizzer**, **LightConverse**, **L8 / Vision** — nothing found.
- **ETC Augment3d** — nothing found; a GitHub search for `augment3d` returns only unrelated
  machine-learning and AR projects.
- **Lightwright (John McKernon Software)** — no vendor source; everything here comes from
  Vectorworks' side of the exchange, reverse-engineered by a third party.
- **Onyx (Obsidian Control Systems)** — a search for "Onyx lighting console" returned zero
  repositories.
- **Avolites Titan / Synergy** — nothing found.
- **Sunlite / Daslight (Nicolaudie)** — nothing found.
- **Chroma-Q** — nothing found beyond its role in the wider GDTF ecosystem.
- **GDTF Share fixture and manufacturer counts** — UNKNOWN. A third party describes GDTF as
  covering "over 100 manufacturers"; unverified against the source.
- **QLC+ and OFL exact fixture counts** — UNKNOWN; directory listings show ~100–120 manufacturer
  folders each but GitHub prints no totals.
- **All dongle / licence-lock / parameter-limit questions** — UNKNOWN for every commercial product.
- **All prices** — UNKNOWN for every commercial product.
- **German-language market sources** — none reachable. The brief asked specifically for these and
  this pass could not deliver them; DMXControl Projects e.V. (Germany) and MA Lighting (Germany)
  are the two DACH players evidenced here, both only indirectly.

---

## Sources

Every URL below was actually opened during this pass on **2026-08-29**. Nothing is cited from
memory.

### Standards — GDTF / MVR
- https://github.com/mvrdevelopment/spec
- https://raw.githubusercontent.com/mvrdevelopment/spec/main/README.md
- https://raw.githubusercontent.com/mvrdevelopment/spec/main/mvr-spec.md
- https://raw.githubusercontent.com/mvrdevelopment/spec/main/gdtf-spec.md
- https://github.com/mvrdevelopment/spec/blob/main/gdtf-spec.md
- https://github.com/mvrdevelopment/spec/issues
- https://raw.githubusercontent.com/mvrdevelopment/libMVRgdtf/master/README.md

### GDTF / MVR implementations
- https://raw.githubusercontent.com/open-stage/python-gdtf/master/README.md
- https://raw.githubusercontent.com/open-stage/python-mvr/master/README.md
- https://github.com/open-stage/blender-dmx/tree/main
- https://github.com/open-stage/blender-dmx/tree/main/mvrxchange
- https://github.com/open-stage/blender-dmx/tree/main/share_api_client
- https://raw.githubusercontent.com/open-stage/blender-dmx/main/README.md
- https://github.com/open-stage/blender-dmx/blob/main/README.md
- https://raw.githubusercontent.com/open-stage/blender-dmx/main/mvrxchange/mvrx_message.py
- https://raw.githubusercontent.com/MomentFactory/Omniverse-MVR-GDTF-converter/main/README.md
- https://raw.githubusercontent.com/vanous/PollToMVR/master/README.md
- https://raw.githubusercontent.com/vanous/gDetour/master/README.md

### Open-source control, visualisation and planning products
- https://raw.githubusercontent.com/mcallegari/qlcplus/master/README.md
- https://github.com/mcallegari/qlcplus/releases
- https://github.com/mcallegari/qlcplus/tree/master/resources/fixtures
- https://github.com/OpenLightingProject/ola
- https://raw.githubusercontent.com/OpenLightingProject/ola/master/README.md
- https://github.com/OpenLightingProject/open-fixture-library
- https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/README.md
- https://github.com/OpenLightingProject/open-fixture-library/tree/master/plugins
- https://github.com/OpenLightingProject/open-fixture-library/tree/master/fixtures
- https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/plugins/gdtf/plugin.json
- https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/docs/plugins.md
- https://raw.githubusercontent.com/PeramatoG/Perastage/main/README.md
- https://github.com/PeramatoG/Perastage/blob/main/README.md
- https://raw.githubusercontent.com/fiverecords/DMXRouter/main/README.md
- https://raw.githubusercontent.com/stoatworks-labs/simpleVIS/main/README.md
- https://raw.githubusercontent.com/kellertobias/tosklight/main/README.md
- https://raw.githubusercontent.com/matteolutz/demex/main/README.md
- https://raw.githubusercontent.com/BaukeWestendorp/radiant/main/README.md
- https://raw.githubusercontent.com/Alva-Theaters/Sorcerer-Public/main/README.md

### Paperwork and CAD interchange
- https://raw.githubusercontent.com/Gribiche64/vectorworks-bridge/main/README.md
- https://raw.githubusercontent.com/Gribiche64/vectorworks-bridge/main/PROTOCOL.md
- https://raw.githubusercontent.com/danielbchapman/OpenSpotlightDataExchange/master/README.md
- https://raw.githubusercontent.com/eosti/lighting-paperwork/main/README.md
- https://raw.githubusercontent.com/kaelenfae/LXLog/main/README.md
- https://github.com/Vectorworks/developer-scripting

### Console control surfaces
- https://raw.githubusercontent.com/Codys-Wright/eos-toolkit/master/README.md
- https://raw.githubusercontent.com/bitfocus/companion-module-etc-eos/master/README.md
- https://raw.githubusercontent.com/bitfocus/companion-module-etc-eos/master/companion/HELP.md
- https://raw.githubusercontent.com/bitfocus/companion-module-malighting-grandma3/main/README.md
- https://raw.githubusercontent.com/bitfocus/companion-module-malighting-grandma3/main/companion/HELP.md
- https://raw.githubusercontent.com/MacTirney/GrandMA3-API-Documentation/main/README.md
- https://raw.githubusercontent.com/leonreucher/grandma3-patch2pdf/main/README.md
- https://raw.githubusercontent.com/routmoute/grandMA3-linux-installer/master/README.md
- https://raw.githubusercontent.com/art42/MagicQ-Remote/master/README.md

### Protocol libraries
- https://raw.githubusercontent.com/ETCLabs/sACN/main/README.md
- https://raw.githubusercontent.com/OpenLightingProject/libartnet/master/README
- https://raw.githubusercontent.com/DMXControl/RDMSharp/main/README.md
- https://raw.githubusercontent.com/DMXControl/companion-module-dmxcontrolprojects-dmxcontrol3/main/companion/HELP.md

### GitHub search queries run (repository and issue metadata read from results)
- `GDTF fixture in:name,description,readme stars:>5`
- `org:OpenLightingProject`
- `org:ETCLabs`
- `org:open-stage`
- `topic:gdtf`
- `grandma3 in:name,description,topics`
- `magicq in:name,description,topics`
- `dmxcontrol in:name,description,topics`
- `MVR-xchange OR "mvr xchange" OR mvrxchange`
- `Lightwright OR Vectorworks OR "lighting plot" OR "instrument schedule" in:name,description`
- `lightwright in:name,description,readme`
- `CITP protocol lighting in:name,description,readme`
- `augment3d in:name,description,readme`
- `Onyx Obsidian lighting console in:name,description`
- `org:bitfocus companion-module-etc`
- Issue searches in `mvrdevelopment/spec` and `mcallegari/qlcplus`

### Local repositories read for the relevance section
- `/home/user/av-planner-suite/README.md`
- `/home/user/av-planner-suite/docs/research/METHOD.md`
- `/home/user/light-planner/README.md`
- `/home/user/light-planner/INTEGRATION.md`
- `/home/user/cable-planner/CLAUDE.md`

### Blocked (returned `EGRESS_BLOCKED`; listed so the pass can be re-run)
`gdtf-share.com`, `www.etcconnect.com`. WebSearch was unavailable throughout (budget exhausted at
200/200 before this dossier began), so no vendor pricing page, no German-language trade source and
no practitioner forum could be consulted.
