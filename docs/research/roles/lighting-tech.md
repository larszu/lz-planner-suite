# Lighting Technicians and Designers / Lichttechniker

Research dossier for AV Planner Suite. Compiled 2026-08-28.

> **Method and evidence caveat — read this before using any claim below.**
>
> This session's `WebSearch` budget was already exhausted (200/200 calls) before the first
> query for this role, and the egress proxy blocked every domain tested except
> `github.com` and `raw.githubusercontent.com`. Reddit, Control Booth, Blue Room, The Light
> Network, ProSoundWeb, Live Design, production-partner.de, film-tv-video.de,
> forum.vectorworks.net, lightwright.com, gdtf-share.com, en.wikipedia.org — all returned
> `EGRESS_BLOCKED`. Trade press, forums and job adverts were therefore unreachable, and the
> German-language layer could not be sampled at all.
>
> What that leaves is one unusually good substitute and several weaker ones:
>
> - **The GDTF/MVR specification issue tracker** (`mvrdevelopment/spec`) is where the vendors
>   of Vectorworks, MA, Robe, ETC, Capture and Depence argue in public with working
>   practitioners about what the exchange format cannot carry. This is a primary technical
>   source of the strongest kind under `METHOD.md` — a standards body documenting its own
>   gaps — and it is the backbone of the MVR/GDTF sections here.
> - **`deliseph/showstack`**, an open, citation-per-fact index of live-production technology.
>   Every entry carries a `gotchas` list and a `sources` list with publisher and access date,
>   most of them vendor primary documentation. I read the YAML; I could not open the vendor
>   pages behind it. Claims sourced this way are marked *(showstack, citing <publisher>)* and
>   should be treated as second-hand-but-cited rather than as pages I verified myself.
> - **Practitioner-built tools and their issue trackers** — `jkarp7/showstack` (a Lightwright
>   replacement written by a production electrician), `PeramatoG/Perastage` (an MVR/GDTF
>   plan tool, 112 stars, actively used), `douglasfinlay/cue-note`, `Charlie9830/Dimmer-Labels-Wizard`,
>   `Gribiche64/vectorworks-bridge`, `danielbchapman/OpenSpotlightDataExchange`. These describe
>   real workflows, but usually in one author's voice.
>
> **The consequence for frequency grading.** The "practitioner venting" layer that normally
> corroborates a pain point is missing. I have therefore graded conservatively: a finding is
> only `widespread` when it is documented by a vendor or a standards body *and* independently
> reflected in at least one practitioner-built tool. Several things I strongly suspect are
> widespread are graded `recurring` because I can only see them from one side.
>
> **Nothing below is invented.** Where I could not establish something — WhatsApp use, time
> costs in hours, German-market specifics, broadcast studio lighting as distinct from
> theatre/event — it is marked **UNKNOWN** rather than guessed.

---

## Who they are / where they sit in the production

The defining structural fact about lighting is that **the person who designs the rig, the
person who documents it, the person who hangs it, and the person who patches and programs it
are usually four different people, working in four different applications, on four different
copies of the same data.** Almost every pain point below is a consequence of that.

### The populations

**1. Lighting designer (LD) / Lichtdesigner.** Owns the look. Draws or commissions the light
plot. In the English-language theatre world the plot is drawn in Vectorworks Spotlight, which
is described as "where most lighting plots and hanging plots in theatre and events are
actually drawn" (showstack `vectorworks-spotlight.yaml`, citing Vectorworks' own product
pages, accessed 2026-08-16). The LD is often freelance, arrives late, and leaves after opening.

**2. Assistant LD / associate.** Maintains the paperwork database — in the US/UK theatre
tradition, Lightwright. Lightwright's own description of itself is "the lighting paperwork
database: channel hookups, instrument schedules, colour and equipment counts, focus charts and
work notes" (showstack `lightwright.yaml`, citing John McKernon Software and Lightwright LLC
documentation, accessed 2026-08-17). This person is the human synchronisation layer between
the drawing and everything downstream.

**3. Production electrician / Chefbeleuchter / head electrician.** Turns the paper into a rig:
shop order, hang, circuit, address, power distribution, labels. The `jkarp7/showstack` project
is explicitly aimed at "lighting designers, production electricians, and entertainment
professionals" and its issues are written from this seat — one of them is titled around
"production electrician pain points" and describes point-circuit notation ("Circuit '1.1' =
First fixture on circuit 1; Circuit '1.2' = Second fixture (power thru from 1.1)")
([jkarp7/showstack#39](https://github.com/jkarp7/showstack/issues/39), 2025-12-28).

**4. Programmer / board op / Lichtstellwerker.** Lives in the console — Eos, grandMA3, MagicQ,
Onyx, Titan. Receives the rig as a patch, rebuilds groups and palettes, and from load-in
onward holds the most up-to-date version of reality, in a format nobody upstream can read.

**5. Visualiser / previz operator.** Capture, WYSIWYG, Vision, Depence, MA 3D, BlenderDMX,
Perastage. A fifth copy of the rig.

### Where the handoffs sit

The MVR-xchange user story written by the GDTF/MVR standards group describes the intended
topology in its own words: a "large setup" has "multiple specialized workstations — each with
visualizers, tracking systems, and planners — operating simultaneously across a network",
with "different operators needing independent read/write access to MVR files on varied
schedules"
([`user_story_MVR-xchange.md`](https://raw.githubusercontent.com/mvrdevelopment/spec/main/user_story_MVR-xchange.md)).
Its stated baseline for what happens today, absent the protocol, is **physical USB transfer**.

The same document is unusually candid about what MVR-xchange deliberately does *not* solve:

- no real-time, live change synchronisation
- **no single source of truth** — "no mandatory import rules"
- no offline updates for a station that was absent or joined late
- no connectivity between stations over the internet

That is the entire "changes on site do not get back into the plan" problem, written down as a
non-goal by the people who own the format. **FACT, primary source.**

### Where AV Planner Suite already sits

`larszu/light-planner` positions itself deliberately below this stack: "It is **not** a
replacement for Vectorworks, or Capture. It's the tool you reach for when you just want to
think through where the lights go before you start rigging", explicitly compared to "the kind
of plan you'd otherwise scribble on the back of a call sheet"
([light-planner README](https://github.com/larszu/light-planner)). It already carries
auto-patch with clash detection, an instrument schedule, an electrical-load summary (kW, A per
phase, 16 A circuits) and CSV export. That is directly relevant to the *Implications* section.

---

## A day in the life

> Chronological reconstruction. Each step is anchored to a source where one exists; the
> connective narrative between anchored steps is **INFERENCE** from the documented artefacts,
> not observed fact. I could not reach any first-person practitioner account.

### Pre-production: design and paperwork (weeks out)

The plot is drawn in CAD. Paperwork is generated *from* the drawing: Vectorworks "generates
channel hookups, instrument schedules and equipment lists from the drawing" (showstack
`vectorworks-spotlight.yaml`). In parallel, Lightwright holds the same rig as a database, kept
"in sync with a Vectorworks plot over an .xml link" (showstack `lightwright.yaml`, citing
McKernon's *Vectorworks / Lightwright Data Exchange* documentation).

That link is a file sitting on disk beside the drawing, and its fragility is documented by the
vendor itself:

> The Vectorworks link is an .xml file named after the .vwx and living beside it. Rename or
> move the .vwx and Lightwright keeps reading the old .xml, so the two files silently drift
> apart.
>
> — showstack `lightwright.yaml`, citing John McKernon Software, accessed 2026-08-17

Fixture profiles come from the GDTF library. Previsualisation happens in Capture, WYSIWYG,
Vision, Depence or MA 3D — each of which needs the rig again, in its own import path.

### Handover to the shop (days out)

The shop order is produced. In `jkarp7/showstack` this is described as, today, "entirely
manual": "Users must manually type equipment items", with the issue noting "significant data
duplication since fixture and infrastructure information already exists elsewhere in the
Equipment Manager system" ([#29](https://github.com/jkarp7/showstack/issues/29), 2025-12-27).
The shop order has to aggregate fixtures with accessories (colours, gobos, templates),
infrastructure (network, audio, video, data distribution with port specs), and quantities split
**venue-owned vs rental vs shop inventory** — three different commercial buckets from one rig.

Labels for the dimmer and distro racks get produced. There is a purpose-built tool for exactly
this — `Charlie9830/Dimmer-Labels-Wizard`, "A Wizard to Automate the process of Creating Dimmer
and Distro Labels", which pulled data from Lightwright (its issues include "Scott: Lightwright
Wattage Dimmer Type Extrapolation",
[#24](https://github.com/Charlie9830/Dimmer-Labels-Wizard/issues/24), 2015-06-26, and "Custom
Label fields — Similar to Lightwrights User1, User2 etc Fields",
[#14](https://github.com/Charlie9830/Dimmer-Labels-Wizard/issues/14), 2015-06-25). The project
stopped in 2017. That a dedicated desktop application existed for *printing rack labels* is
itself the evidence of how much paperwork this role generates.

### Load-in: hang, circuit, address

Fixtures go up. Each needs a DMX address. RDM is the modern answer — "how you read and change a
fixture's address, personality and sensors without going up in the truss" (showstack
`rdm.yaml`, citing ANSI E1.20 and the ESTA TSP registries, accessed 2026-08-16) — but it is a
minefield in practice, and the gotcha list reads like a load-in postmortem:

- "Every splitter, buffer and opto in the path has to be RDM aware. A one-way splitter passes
  DMX perfectly and silently swallows every response, so discovery finds nothing and the rig
  looks dead to the controller."
- "Discovery is a binary search over the UID space with collision retries. On a large or
  marginal line a full discovery takes minutes and can still miss devices; run it twice before
  believing the count."
- "The controller owns the line. Two RDM controllers on the same universe talk over each other
  and responses get attributed to the wrong device, which produces genuinely confusing patch
  data."

On Eos, RDM discovery is additionally "disabled by default, and switches itself off again as
soon as you leave the Patch display" (showstack `eos-family.yaml`, citing ETC's Eos Family
Online Help, accessed 2026-08-17). So the tool that is supposed to remove manual address
documentation is off unless you know to turn it on, every time.

Power distribution is planned across phases. The field vocabulary here is concrete: "service
assignment to designate which power feeds specific racks", "phase distribution templates for
AB/AC/ABC phasing patterns common in different venues", and custom phase labelling because
different markets call them A/B/C or 1/2/3
([jkarp7/showstack#41](https://github.com/jkarp7/showstack/issues/41), 2025-12-28).

### Patch: the rig enters the console

The console gets the patch. There are three routes, and all three are awkward.

*Route 1 — file import.* Lightwright into Eos: "Importing into Eos from a file is a different
path from the live link: tab-separated .txt with Windows line endings, and **only rows whose
Device Type is Light will import**" (showstack `lightwright.yaml`, citing ETC's *Importing
Lightwright Data Into Eos Family Consoles*). Every non-light device in the paperwork — hazers,
motors, practicals, anything the electrician tracked — is silently dropped.

*Route 2 — MVR.* Carries a lot: per the MVR specification text itself, a Fixture node carries
`FixtureID`, `UnitNumber`, `Matrix`, `Color`, `GDTFSpec`, `GDTFMode`, `Addresses`, `Protocols`,
`Focus` (a reference to a FocusPoint), `Position`, `Function`, `Gobo`, `Alignments`,
`CustomCommands`, `Mappings`, `Connections`, `ChildList`
([`mvr-spec.md`](https://raw.githubusercontent.com/mvrdevelopment/spec/main/mvr-spec.md)). What
it does not carry is covered below under *Missing interfaces*.

*Route 3 — retype it.* Still common enough that a 2025 issue lists CSV, Eos ASCII, grandMA2 XML
and grandMA3 XML export as a "critical feature for professional electricians", on the grounds
that today "professional lighting electricians must manually transfer fixture and patch data
between [the paperwork tool] and their consoles — a time-consuming, error-prone process"
([jkarp7/showstack#51](https://github.com/jkarp7/showstack/issues/51), 2025-12-29).

### Focus call

Focus is a scheduled, exclusive call, not something squeezed in around other work — showstack's
own definition: "A focus session is a scheduled call with the designer on the deck and
electrics up ladders, not something squeezed in while other departments work underneath"
(`data/terms/focus.yaml`, citing the Theatrecrafts glossary). Every minute lost to finding a
channel, chasing a wrong address, or arguing about which document is current is stage time that
cannot be recovered.

Lightwright's Eos Console Link exists precisely for this window: it is documented as used "to
trigger cues, turn lights on and off during focus and work calls, and import, label and
document cues and groups" over OSC (showstack `lightwright.yaml`, citing the Lightwright user
guide). Setting it up requires OSC RX and TX enabled in Eos Setup, TCP mode set to Slip (v1.1),
OSC enabled on the active network port, and Lightwright on a complementary IP and subnet — five
independent things to get right before the link works at all.

### Tech rehearsal: notes

Notes accumulate faster than anyone can type them. `douglasfinlay/cue-note` exists to "remotely
add and edit notes in an Eos show file" from a laptop, because entering notes on the console
itself "can be cumbersome during live rehearsal situations"
([cue-note README](https://github.com/douglasfinlay/cue-note)). Its feature list is a direct
readout of the pressure: customisable **quick-note buttons** you right-click to edit, keyboard
shortcuts, scene breaks. One of its open issues asks for the opposite of what it does — "Option
to store notes locally as opposed to as notes attached to cues on the console"
([#11](https://github.com/douglasfinlay/cue-note/issues/11), 2024-03-07) — i.e. some people
want their notes *out* of the show file, because the show file belongs to the programmer.

Ahead of tech there is often a **paper tech**: "A meeting before technical rehearsals where
stage management and department heads walk the whole cue list on paper: numbers, placement, who
takes what on which line, with no stage time burned" (showstack `data/terms/paper-tech.yaml`,
citing Theatrecrafts). The name is not a metaphor.

### Show: something is wrong and nobody can see it

Mid-show diagnosis has its own toolkit, and it is all read-only inspection of the wire:
sACNView for "detect duplicate or conflicting sACN sources on the same universe and compare
their priorities" (showstack `sacnview.yaml`), DMXcat over Bluetooth for RDM discovery and
"walk a DMX/RDM line to physically locate a bad connector, cable, or termination via the
'Flicker-Finder' feature" (showstack `dmxcat.yaml`, citing City Theatrical, accessed
2026-08-17).

None of these tools know anything about the plan. They tell you what universe 4 slot 137 is
doing. Whether slot 137 is *supposed* to be the upstage-left wash is in a different document,
on a different machine, owned by a different person.

### Load-out and after

The rig comes down. The console show file — which by now contains the only accurate record of
what was actually patched, addressed, re-addressed at 02:00, and re-focused after the
director's note — goes back in the flight case. The plot on the designer's laptop still shows
the design intent from three weeks ago.

There is no standard route back. `ETCLabs/EosSyncLib` exists to read "Eos show data in real
time" over OSC, but carries an explicit warning that it "is not official ETC software" and was
"developed by a combination of end users and ETC employees in their free time"
([EosSyncLib README](https://github.com/ETCLabs/EosSyncLib)). The most-used console platform in
English-language theatre has no vendor-supported way to hand its live state back to the
paperwork, and the community filled the gap in its spare time. **FACT.**

---

## Tools they actually use

| Tool | For what | How they feel about it (evidence-anchored) |
| --- | --- | --- |
| **Vectorworks Spotlight** | Drawing the plot, hanging plot, section; generating hookups and instrument schedules from the drawing | Load-bearing and unavoidable. Quiet failure mode: "A fixture with an incomplete record produces a report that looks correct and quietly omits it, so check counts against the plot before sending paperwork out" (showstack, citing Vectorworks). Rigging analysis and previz are **separate paid products**, not features. |
| **Lightwright** | Hookup, instrument schedule, colour/gobo/equipment counts, focus charts, work notes; live link to the plot and to Eos | The paperwork standard, and grudging: the VW link drifts silently on rename, "one undefined or corrupted character in a data field can invalidate the whole exchange .xml", backslashes in folder names on Mac "stop Vectorworks and Lightwright communicating at all". It moved from perpetual licence to **subscription with the January 2026 platform release**, with legacy Lightwright 6 bug-fix support stated to end **1 July 2026** (showstack, citing McKernon/Lightwright and Live Design). |
| **ETC Eos / ETCnomad** | The console; offline programming and paperwork on a laptop | Dominant, and licence-hostile at the edges: "The free Eos download outputs nothing. Without an ETCnomad USB key it runs only as an offline editor or in mirror mode." Art-Net "is disabled by default in Patch, so a visualiser or node expecting Art-Net sees nothing until the protocol is enabled." v3.2.0+ dropped Net2/EDMX and AVAB UDP, stranding legacy houses (showstack, citing ETC). |
| **grandMA3 onPC** | Offline programming, pre-plotting, backup station | Free, which is why it is everywhere. But "DMX output from onPC needs grandMA3 onPC solutions hardware", and joining a session with consoles "raises the memory requirement to at least 16 GB, or 24 GB unified memory on Apple silicon" — a laptop that runs standalone "will fall over in session" (showstack, citing MA Lighting). Only sACN and Art-Net; no Pathport/ShowNet path. |
| **ChamSys MagicQ** | Free real-world control for schools, churches, small venues; touring on MagicQ consoles | Genuinely generous — "64 universes of Art-Net/sACN with no dongle at all" — and genuinely annoying: "Free MagicQ will run 64 universes of Art-Net all day but will not chase LTC." Timecode, MIDI and OSC are Unlocked-mode only, and "the tier follows the connected device, so losing the wing or dongle mid-run silently drops the rig to demo-mode features" (showstack, citing ChamSys). |
| **Capture** | Previz and documentation from one model | Liked, but the edition cap bites the paperwork: "the cap applies to documentation as well as visualisation, so a small licence limits the paperwork too". CITP patch exchange only works "with consoles that implement it. On everything else you are back to plain Art-Net or sACN and manual patch matching" (showstack, citing Capture). |
| **WYSIWYG** | Previz plus CAD plots and paperwork | Windows-only; "Dongles and perpetual licences have been discontinued... the software will not run once the subscription lapses" (showstack, citing CAST Software FAQ, accessed 2026-08-22). |
| **Vectorworks Vision** | Previz driven by live console DMX | "not standalone software — it requires an active Vectorworks Spotlight or Design Suite licence". MA-Net2 and MA-Net3 "need different hardware keys... and are not interchangeable" (showstack, citing Vectorworks). |
| **Depence** | Combined lighting/laser/video/fountain previz, and show output via the Control module | Windows-only, "integrated Intel graphics explicitly called out as not fully supported", modular **dongle-locked** licensing where Stage/Fountain/Special-FX/Laser/Animate/Control are separate paid modules, and "perpetual module licences are valid for the current major release only" (showstack, citing Syncronorm). |
| **Braceworks** | Load calculation on the drawn rig | Trusted only as far as the model: "A rig drawn with default weights produces confident, wrong numbers", and "It is an aid to a qualified rigger and an engineer, not a substitute for either" (showstack). |
| **Perastage** | Fast MVR/GDTF viewing, checking and editing without a full DMX visualiser | New (created 2025-12), 112 stars, actively used and actively crashing — open and recently-closed issues include app crashes on clicking fixtures, truss positions moving after reload, Linux render failure ([issue list](https://github.com/PeramatoG/Perastage/issues)). Its existence says people want a *fast MVR checker* that is not a visualiser. |
| **BlenderDMX** | Free GDTF/MVR visualisation and programming in Blender | 281 stars; built on pygdtf/pymvr; pulls fixtures from "Fixture library on GDTF Share" ([README](https://github.com/open-stage/blender-dmx)). The free-tier previz option. |
| **sACNView / DMXcat / Art-Net analysers** | Mid-show diagnosis | Indispensable, and entirely disconnected from the plan. DMXcat's apps "alone cannot monitor or control anything" without the separately-sold BLE dongle, and some analyser features are Android-only (showstack, citing City Theatrical). |
| **Bitfocus Companion** | Button-surface glue between departments | Used to reach into lighting from the show-control side; module requests for Eos ask for things like "Label Polling" ([companion-module-etc-eos#90](https://github.com/bitfocus/companion-module-etc-eos/issues/90), 2026-02-26) and group labels referencing Magic Sheets ([#47](https://github.com/bitfocus/companion-module-etc-eos/issues/47), 2024-05-02). |
| **CueNote** | Note-taking into an Eos show file during tech | Exists because the console is a bad place to type during a rehearsal. |
| **Excel / CSV** | The universal joint | See *Paper / Excel / WhatsApp inventory*. Every tool in this table exports CSV; CSV is listed as "the quickest entry point" and "the most straightforward data interchange format" in the console-export issue ([jkarp7/showstack#51](https://github.com/jkarp7/showstack/issues/51)). |

---

## Time sinks

Ranked by strength of evidence multiplied by plausible frequency. **Time figures are given only
where a source gives one.** Nobody in the reachable sources quantified their own hours, so most
`timeCost` values in the structured output are `unknown` by design rather than by omission.

### 1. Entering the same rig into every system that needs it

**Frequency: widespread.** Evidence from three independent directions:

- The standards body: MVR has no fixture groups, so complex grouping "forces users to manually
  recreate complex grouping structures in each system they use". The requester's stated benefit
  of fixing it is that it "would significantly speed up the process of getting a console or a
  media server up and running quicker if you have a lot of complex groups on a rig"
  ([mvrdevelopment/spec#295](https://github.com/mvrdevelopment/spec/issues/295), 2026-01-13).
- The paperwork tool: shop orders today are produced by users who "must manually type equipment
  items", despite the same data existing in the equipment manager
  ([jkarp7/showstack#29](https://github.com/jkarp7/showstack/issues/29)).
- The console side: "professional lighting electricians must manually transfer fixture and
  patch data between [tool] and their consoles"
  ([jkarp7/showstack#51](https://github.com/jkarp7/showstack/issues/51)).

### 2. Reconciling two divergent copies of the same plot

**Frequency: recurring, and structurally guaranteed.** The clearest statement of the problem is
from the tool side:

> A designer creates an initial plot and exports a file → the file is sent to an assistant or
> programmer for independent modifications → both parties make changes separately → **"NO WAY
> to reconcile differences → data loss or manual re-entry"**
>
> — [jkarp7/showstack#38](https://github.com/jkarp7/showstack/issues/38), 2025-12-28

The enumerated conflict classes are: fixtures added on one side, fixtures deleted on one side,
fixtures modified on both, infrastructure changes, power rack changes with capacity conflicts,
and shop-order divergence.

The standards side confirms this is not going to be solved by the exchange format:
MVR-xchange explicitly offers "no real-time, live change synchronisation", "no mandatory import
rules (no single source of truth)", and "no offline updates for tardy or departing stations"
([user story](https://raw.githubusercontent.com/mvrdevelopment/spec/main/user_story_MVR-xchange.md)).

### 3. Repairing the drawing-to-paperwork link

**Frequency: recurring.** Four distinct documented failure modes in one vendor's gotcha list
alone (showstack `lightwright.yaml`, citing McKernon):

1. rename or move the `.vwx` and the paperwork keeps reading the stale `.xml`, silently;
2. "Vectorworks UIDs are not guaranteed to be unique. A new light whose UID matches an old
   deleted one makes Lightwright restore the deleted light, which can cause all kinds of chaos";
3. one bad character invalidates the whole exchange file, and the documented remedy is a
   full re-export ("do a Complete Export on Exit from Vectorworks");
4. backslashes in folder names, particularly on Mac, "stop Vectorworks and Lightwright
   communicating at all".

That people build software specifically to babysit this link is corroboration: both
`danielbchapman/OpenSpotlightDataExchange` (2016, Java, aiming to enable "reading data-exchange
files into ANY application") and `Gribiche64/vectorworks-bridge` (2026, which describes
"traditional Vectorworks-to-Lightwright workflows [that] involve tedious manual exports" and
ships a **reverse-engineered protocol spec**) exist for no other reason.

### 4. Getting an import to actually land in the console

**Frequency: recurring.** The Eos file-import path requires tab-separated `.txt` with **Windows
line endings**, and drops every row whose Device Type is not "Light" (showstack
`lightwright.yaml`, citing ETC). A Mac-based designer exporting for a Windows-convention
importer is a format mismatch waiting to happen, and the failure is partial and silent — you
get *some* of your rig.

### 5. Rebuilding groups, palettes and per-console structure

**Frequency: recurring.** Covered above (#295). Note that the console is not the only consumer:
the same issue names media servers.

### 6. Producing and re-producing paperwork variants

**Frequency: widespread (structural).** One tool enumerates **12 report types** that have to
stay consistent with each other: Channel Hookup, Dimmer Schedule, Circuit List, DMX Addresses,
Power Summary, Color Schedule, Gobo Schedule, and an Infrastructure List in five variants
([jkarp7/showstack#48](https://github.com/jkarp7/showstack/issues/48), 2025-12-29). Each is a
different sort/group/filter of the same underlying rows: "Channel, Dimmer, Type, Color, Circuit,
Location, Wattage". Every rig change potentially reprints all twelve.

### 7. Chasing fixture profiles and modes

**Frequency: recurring.** GDTF's own maintainers acknowledge the mode concept is confusing
enough to warrant renaming — "DMX Mode" is "the entry point into the GDTF fixture type" and is
being used to select non-lighting devices such as speakers, prompting a proposal to rename it
"GDTF Mode" as a breaking change
([mvrdevelopment/spec#318](https://github.com/mvrdevelopment/spec/issues/318), 2026-07-21).
Downstream, profile semantics break footprints: Perastage counted GDTF **virtual parameters**
(e.g. a virtual dimmer) as real DMX channels, so "A RGB LED par fixture should require 3 DMX
channels according to its GDTF specification, but [it] counts it as 4 channels", flagging valid
patches red ([Perastage#1652](https://github.com/PeramatoG/Perastage/issues/1652), closed
2026-06-14).

### 8. Label and physical-documentation production

**Frequency: recurring (evidence is older).** `Dimmer-Labels-Wizard` (active 2015-2017) and the
label-designer work in `jkarp7/showstack#41` (2025) bracket a decade in which producing rack
labels was still worth writing dedicated software for. The 2025 issue's asks are mundane and
telling: custom background colours "with presets for common label stocks", background images,
and — separately — **colour printing instead of the current greyscale**, with "gel colour
swatches showing actual colours for theatrical gels (Lee, Rosco brands)".

### 9. Field addressing and RDM discovery that does not converge

**Frequency: recurring.** See the RDM gotcha list above. The specific killers: non-RDM
splitters swallow responses silently, discovery "can still miss devices; run it twice before
believing the count", and two controllers on a line produce "genuinely confusing patch data".

### 10. Note capture during tech

**Frequency: recurring.** CueNote's existence, its quick-note buttons, and its open requests for
undo ([#7](https://github.com/douglasfinlay/cue-note/issues/7)) and better cue-list scrolling
([#6](https://github.com/douglasfinlay/cue-note/issues/6)) all point at the same thing: notes are
taken under time pressure and are hard to correct afterwards.

---

## Double data entry

| Datum | Entered in | And again in | And often again in | Evidence |
| --- | --- | --- | --- | --- |
| Fixture type, position, unit number | CAD plot (Vectorworks) | Paperwork DB (Lightwright) | Console patch; visualiser | `lightwright.yaml` VW link exists precisely to avoid this and drifts; [jkarp7#32](https://github.com/jkarp7/showstack/issues/32) lists "Manual entry required in both systems causes inconsistencies" |
| DMX address / universe | Paperwork | Console patch | Physically on the fixture (or via RDM) | [jkarp7#51](https://github.com/jkarp7/showstack/issues/51); showstack `rdm.yaml` |
| Fixture groups | Console | Media server | Visualiser | [spec#295](https://github.com/mvrdevelopment/spec/issues/295) — "manually recreate complex grouping structures in each system" |
| Circuit and dimmer assignment | Paperwork (Circuit List, Dimmer Schedule) | Rack labels | Power/phase plan | [jkarp7#48](https://github.com/jkarp7/showstack/issues/48), [#41](https://github.com/jkarp7/showstack/issues/41), Dimmer-Labels-Wizard |
| Equipment quantities | Equipment manager / plot | Shop order | Rental company's own system | [jkarp7#29](https://github.com/jkarp7/showstack/issues/29) — "Users must manually type equipment items" |
| Protocol and network config (Art-Net vs sACN, unicast IPs) | Node/gateway config | Console patch | Network documentation | [spec#94](https://github.com/mvrdevelopment/spec/issues/94) requested carrying protocol, routing mode, IPv4/IPv6, netmask, VLAN ID **in MVR** so "consoles/media-servers can automatically select/enable the right protocol (for each fixture) on import" (opened 2021-07-29, accepted into the MVR 1.6 DIN SPEC milestone) |
| Cable runs and connections | Cable plan / by hand | Nowhere machine-readable | — | [spec#296](https://github.com/mvrdevelopment/spec/issues/296) (2026-01-27) and [#288](https://github.com/mvrdevelopment/spec/issues/288) (2025-10-20): "Individual cables and the connections need to be specified in the MVR file" |
| Focus positions | Designer's focus notes | Console focus palettes | Visualiser | MVR carries `Focus` → FocusPoint ([mvr-spec.md](https://raw.githubusercontent.com/mvrdevelopment/spec/main/mvr-spec.md)); whether any two apps agree on it is **UNKNOWN** |
| Cue notes | Paper / notes app | Console note field | Work-notes list for the electrician | cue-note README and [#11](https://github.com/douglasfinlay/cue-note/issues/11) |

**The clearest single statement of the double-entry cost in the corpus** is the MVR fixture-group
request: without groups in the exchange format, "users working on large-scale productions lose
efficiency gains and face redundant configuration work across multiple control platforms and
media servers" ([spec#295](https://github.com/mvrdevelopment/spec/issues/295)).

---

## Error sources

### Addressing and patch

| Error | Mechanism | Consequence |
| --- | --- | --- |
| Overlapping DMX addresses | Two fixtures share slots in one universe | Fixtures mirror or fight; found at focus, not at desk. Explicitly listed as a check worth building: "Detect overlapping DMX addresses (same universe)" ([jkarp7#31](https://github.com/jkarp7/showstack/issues/31)) |
| Duplicate channel numbers | Two rig entries claim one control channel | Paperwork and console disagree; same issue |
| Art-Net universe numbering | "Net/Sub-Net/Universe versus a flat universe number is the classic patch error. A device showing 'universe 0' may mean Port-Address 0, which many consoles display as universe 1" (showstack `art-net.yaml`, citing the Art-Net 4 spec) | An entire universe appears dead or lands one off |
| sACN vs Art-Net universe identity | "An sACN universe number and an Art-Net universe are not the same field" (showstack `data/terms/dmx-universe.yaml`) | "universe 5 can mean two different wires" |
| Wrong DMX footprint from the profile | Virtual parameters counted as real channels | Patch flagged as broken when it is fine, or addresses spaced wrongly ([Perastage#1652](https://github.com/PeramatoG/Perastage/issues/1652)) |

### The exchange files themselves

| Error | Mechanism | Consequence |
| --- | --- | --- |
| Stale VW↔LW link | `.vwx` renamed or moved; paperwork keeps reading old `.xml` | Two documents drift apart **silently** — no error is shown |
| UID collision | "Vectorworks UIDs are not guaranteed to be unique. A new light whose UID matches an old deleted one makes Lightwright restore the deleted light" | A deleted fixture reappears in the paperwork and gets ordered, hung and hung again |
| One bad character | "One undefined or corrupted character in a data field can invalidate the whole exchange .xml" | Whole exchange fails; documented remedy is a full re-export |
| Backslash in a folder name (Mac) | Path handling | The two applications "stop communicating at all" |
| Case-insensitive filesystem vs case-sensitive cache | Same GDTF cached under `fk40q h-300.gdtf` and `FK40Q H-300.gdtf`; sidecar GDTF generation adds a third casing | Redundant parsing plus **UUID loss on reload**: after save/reopen, the 2D viewer "cannot locate previously selected objects" ([Perastage#2157](https://github.com/PeramatoG/Perastage/issues/2157), 2026-07-27) |
| Position drift on reload | Reported by a user: "Truss i place moves when i load file back up after 24h" ([Perastage#2233](https://github.com/PeramatoG/Perastage/issues/2233), open, 2026-07-28) | Geometry you signed off on is not the geometry you reopen |
| Filtered import | Eos file import takes only Device Type = Light rows | Non-light devices vanish from the console without warning |

### Paperwork that lies

- **Silent omission from generated worksheets.** "A fixture with an incomplete record produces a
  report that looks correct and quietly omits it, so check counts against the plot before sending
  paperwork out" (showstack `vectorworks-spotlight.yaml`). The consequence is a short shop order
  and a missing fixture on load-in day.
- **Load calculations from default weights.** "A rig drawn with default weights produces
  confident, wrong numbers" (showstack `vectorworks-braceworks.yaml`). This is the one error
  class in this dossier with a safety consequence rather than a schedule consequence.

### The physical layer

From showstack `dmx512.yaml` (citing ANSI E1.11) — the classic four, all of which present as
"the fixture is broken":

- microphone cable instead of 120 Ω: "works until the run is long or the rig is noisy, and then
  it fails in a way that looks like a fixture fault";
- **no error detection at all**: "A corrupted slot is simply acted on. Flicker that follows no
  logic is usually a data integrity problem, not a fixture";
- star topology and passive Y-splits: "the source of an enormous amount of unexplained behaviour";
- start-code-ignoring fixtures acting on RDM traffic as levels — so *enabling RDM* can itself
  produce flicker (also in `rdm.yaml`).

### Cross-department

- **CITP discovery across subnets.** Peer discovery multicasts to 224.0.0.180, "which sits in the
  link-local 224.0.0.0/24 block that routers do not forward. Put the console and the media server
  on different subnets and they will never see each other" (showstack `citp.yaml`).
- **MSEX version mismatch.** "a console asking for later features gets nothing back and shows an
  empty library"; and the 255-storage cap means "A media server with a bigger library simply
  presents a truncated view, and the missing clips look like a failed transfer" (same).
- **Vocabulary.** "plot" means the hanging drawing in the US and the cue list in the UK: "One
  word, two documents, produced weeks apart by different people... Asking for 'the plot' gets you
  whichever document the person grew up with" (showstack `data/terms/plot.yaml`). Similarly, a
  *focus* is both an activity and a stored pan/tilt value (`focus.yaml`).

---

## Paper / Excel / WhatsApp inventory

> **Honesty note.** Reddit, forums and trade press were unreachable, and those are exactly where
> "we still do this on paper" is normally said out loud. What follows is what the reachable
> sources *document*, plus explicit UNKNOWNs. Do not read the absence of a WhatsApp section as
> evidence that WhatsApp is not used.

### Still on paper (documented)

| Document | Evidence |
| --- | --- |
| **Paper tech** — the entire cue list walked through on paper before tech, "with no stage time burned" | showstack `data/terms/paper-tech.yaml`, citing Theatrecrafts |
| **Dimmer and distro rack labels** — physically printed, stuck on racks, with label-stock presets, background colours and gel swatches | `Charlie9830/Dimmer-Labels-Wizard`; [jkarp7#41](https://github.com/jkarp7/showstack/issues/41) |
| **Printed paperwork packs** — 12 report types, laid out for multi-page PDF/print, currently greyscale | [jkarp7#48](https://github.com/jkarp7/showstack/issues/48), [#41](https://github.com/jkarp7/showstack/issues/41) |
| **Focus charts** — listed as a first-class Lightwright output alongside hookup and schedule | showstack `lightwright.yaml` |
| **The technical rider** — "Contractually attached to the deal, so its contents are negotiable before signature and expensive afterwards" | showstack `data/terms/technical-rider.yaml` |
| **The back of a call sheet** — the LightPlanner README names this as the artefact it replaces | [light-planner README](https://github.com/larszu/light-planner) |

### In Excel / CSV

CSV is the acknowledged lowest common denominator: it is listed first among required console
exports as "the most straightforward data interchange format", with "column selection, header
configuration, and file encoding choices" — encoding being a stated concern, which only matters
if files are moving between machines with different conventions
([jkarp7#51](https://github.com/jkarp7/showstack/issues/51)). AV Planner Suite's own
light-planner already exports "Equipment list, instrument schedule and an electrical-load summary
(kW, A per phase, 16 A circuits) — export to CSV".

Specific spreadsheets named by no reachable source. What is *documented* as spreadsheet-shaped
work: reconciliation "by comparing spreadsheets or documents side-by-side"
([jkarp7#32](https://github.com/jkarp7/showstack/issues/32)) and a fixture grid described as a
"virtual spreadsheet interface handling 10,000+ fixtures" ([jkarp7/showstack README](https://github.com/jkarp7/showstack)).

### Over USB stick

Documented by the standards body as the state of practice MVR-xchange was created to replace:
the protocol's stated purpose is "to replace manual file transfers (via USB) with automated
network-based sharing of MVR files", and in the small-setup scenario a programmer with one or
two visualisers is described as "currently requiring physical USB transfers"
([user story](https://raw.githubusercontent.com/mvrdevelopment/spec/main/user_story_MVR-xchange.md)).
**This is the single strongest sneakernet citation in the corpus** and it is from the format's
own authors.

### Over WhatsApp / e-mail

**UNKNOWN.** No reachable source documents messenger use in lighting. The adjacent, verifiable
fact is that the exchange formats provide no live sync and no single source of truth, which
leaves out-of-band human messaging as the only remaining channel — but that is **INFERENCE**,
not evidence, and it should be validated with practitioners before being used in product
positioning.

---

## Missing interfaces

Ordered by how expensive the break is.

### 1. Console → plan (the return path). Missing entirely.

Everything flows design → rig. Nothing flows back. MVR-xchange declares no live sync and no
single source of truth as non-goals. The only route out of an Eos show file is a community
library maintained "in their free time" and explicitly "not official ETC software"
([EosSyncLib](https://github.com/ETCLabs/EosSyncLib)). **Frequency: widespread. This is the
structural hole in the whole role.**

### 2. Design → paperwork. Exists, proprietary, and reverse-engineered by third parties.

The Vectorworks↔Lightwright link is a vendor-pair XML with the documented failure modes listed
above. Two separate open-source projects a decade apart exist to read it from outside
(`OpenSpotlightDataExchange` 2016; `vectorworks-bridge` 2026, which ships "the reverse-engineered
protocol spec"). **When people reverse-engineer an interface, the interface is not a product
feature, it is a moat.**

### 3. Lighting → power / electrical distribution. Not in the exchange format.

MVR's own specification text lists no circuits as distinct entities. Circuit name and number was
raised as [spec#158](https://github.com/mvrdevelopment/spec/issues/158) (closed 2024-08-08 under
a Documentation milestone) — I could not read the resolution, and the current spec text I fetched
still shows no circuit entity, so **treat "circuits in MVR" as unresolved / unverified**.
Meanwhile the practical need is fully specified elsewhere: services feeding racks, AB/AC/ABC
phase templates, per-phase load, point-circuit plug order
([jkarp7#41](https://github.com/jkarp7/showstack/issues/41), [#39](https://github.com/jkarp7/showstack/issues/39)).

### 4. Lighting → cable and connector infrastructure. Not in the exchange format.

Two open requests: "Allow to define cables in MVR" with cross-sectional area, length, cable type
and connection mapping ([#296](https://github.com/mvrdevelopment/spec/issues/296), 2026-01-27),
and Wiring Object / Pin Patch in the ChildList because "Individual cables and the connections
need to be specified in the MVR file" ([#288](https://github.com/mvrdevelopment/spec/issues/288),
2025-10-20). Both open as of 2026-08. **This is directly adjacent to what cable-planner already
models.**

### 5. Designer ↔ assistant ↔ programmer. No merge.

"NO WAY to reconcile differences → data loss or manual re-entry"
([jkarp7#38](https://github.com/jkarp7/showstack/issues/38)).

### 6. Cross-vendor MVR behaviour. Inconsistent by admission.

> "Every manufacturer implements MVR differently" — inconsistent import/export behaviour,
> varying patch-merging approaches, non-standard fixture mapping.
>
> — [mvrdevelopment/spec#298](https://github.com/mvrdevelopment/spec/issues/298), 2026-02-16

The requester's proposed fix is telling: a shared, publicly available implementation library
(C++, Python, CLI) plus a **reference import dialog**, on the argument that "MVR shouldn't just
be a file format. It should be a shared ecosystem." Open, unassigned, no development activity.

### 7. Lighting → media server. Declining, with nothing replacing it.

CITP/MSEX is the historic thumbnail and media-library bridge. A 2025 request notes "many users
report wanting CITP thumbnail exchange back but lack a unified method" as "manufacturer support
is diminishing", and proposes moving thumbnail exchange into MVR
([spec#255](https://github.com/mvrdevelopment/spec/issues/255), 2025-01-16). CITP itself is
documented as "meant for pre-production and non-show-critical information" (showstack `citp.yaml`).

### 8. Lighting → rigging/load. A separate purchase.

"Braceworks rigging analysis and Vision previsualisation are separate products, not Spotlight
features. Budget for them separately if the job needs load calculations or previs" (showstack
`vectorworks-spotlight.yaml`).

### 9. Pixel and LED topology. Requested, unresolved.

"Support multi-branch pixel controllers and abstract downstream pixel topology in GDTF / MVR"
([spec#304](https://github.com/mvrdevelopment/spec/issues/304), 2026-03-29), open.

---

## What they would want

Stated by the people asking, not by me. Grouped, with sources.

### From the exchange format

- **Fixture groups in MVR**, so groups defined in planning translate into consoles and media
  servers rather than being rebuilt in each — "would significantly speed up the process of
  getting a console or a media server up and running quicker if you have a lot of complex groups
  on a rig" ([#295](https://github.com/mvrdevelopment/spec/issues/295)).
- **Cables as first-class objects**, with cross-sectional area, length, type and connection
  mapping to device connections — explicitly modelled on how FocusPoints already work
  ([#296](https://github.com/mvrdevelopment/spec/issues/296)); plus Wiring Object and Pin Patch
  in the node ChildList ([#288](https://github.com/mvrdevelopment/spec/issues/288)).
- **Circuit name and circuit number** ([#158](https://github.com/mvrdevelopment/spec/issues/158)).
- **Protocol and network configuration per fixture** — protocol type, unicast/broadcast/multicast
  routing, IPv4/IPv6, netmask, optional VLAN ID — so that "consoles/media-servers can
  automatically select/enable the right protocol (for each fixture) on import", called out as
  "especially useful in the case of using Art-Net with unicast"
  ([#94](https://github.com/mvrdevelopment/spec/issues/94)).
- **A shared implementation library and a reference import dialog**, so the import experience is
  the same in every application; NDI is named as the model
  ([#298](https://github.com/mvrdevelopment/spec/issues/298)).
- **Media thumbnail exchange** to replace declining CITP support
  ([#255](https://github.com/mvrdevelopment/spec/issues/255)).
- **Pixel topology abstraction for multi-branch controllers**
  ([#304](https://github.com/mvrdevelopment/spec/issues/304)).
- **Layer colours in MVR** ([#321](https://github.com/mvrdevelopment/spec/issues/321), 2026-08-25)
  — the small usability requests never stop.

### From the paperwork tool

- **File merge and reconciliation**: side-by-side comparison, selective merge (keep local / use
  remote / combine), conflict resolution with validation before applying
  ([jkarp7#38](https://github.com/jkarp7/showstack/issues/38)).
- **Error checking before installation** — overlapping DMX addresses, duplicate channels, power
  overload on circuits/dimmers/phases, missing required data, inconsistencies such as "LED
  fixtures on dimmer circuits" — because the gap "creates costly mistakes on-site"
  ([jkarp7#31](https://github.com/jkarp7/showstack/issues/31)).
- **Direct console exports**: CSV, Eos ASCII, grandMA2 XML, grandMA3 XML
  ([jkarp7#51](https://github.com/jkarp7/showstack/issues/51)).
- **Auto-populated shop orders** from the equipment data, grouped by discipline and type,
  deduplicated, with a preview before import ([jkarp7#29](https://github.com/jkarp7/showstack/issues/29)).
- **Colour printing and real gel swatches** (Lee, Rosco) instead of greyscale
  ([jkarp7#41](https://github.com/jkarp7/showstack/issues/41)).
- **Point circuits and colour flags** in the equipment grid — red for hot power, yellow for
  critical/focus-first, blue for rental, green for venue-provided
  ([jkarp7#39](https://github.com/jkarp7/showstack/issues/39)).
- **A drag-and-drop layout editor for paperwork**, on the stated grounds that "drag-and-drop
  WYSIWYG beats form-based configuration"
  ([jkarp7#45](https://github.com/jkarp7/showstack/issues/45)).
- **Real-time collaboration**, positioned as the thing the legacy tool lacks
  ([jkarp7/showstack README](https://github.com/jkarp7/showstack)).

### From the console and its surroundings

- **Notes stored locally rather than written into the console show file**
  ([cue-note#11](https://github.com/douglasfinlay/cue-note/issues/11)) — because the show file
  belongs to somebody else.
- **Undo for note-taking** ([cue-note#7](https://github.com/douglasfinlay/cue-note/issues/7)).
- **Label polling from Eos into Companion**
  ([companion-module-etc-eos#90](https://github.com/bitfocus/companion-module-etc-eos/issues/90),
  2026-02-26) and group labels for Magic Sheets
  ([#47](https://github.com/bitfocus/companion-module-etc-eos/issues/47)).
- **Button-surface control of the paperwork tool itself**: a 2023 Companion module request for
  Lightwright 6 asks for shortcuts for "adding/deleting items, Selecting a Sort, snapshots,
  bookmarks, Renumbering, Find & Replace" plus variables exposing active channel, console
  status, **VW Link connection status**, file names and cell contents
  ([companion-module-requests#1179](https://github.com/bitfocus/companion-module-requests/issues/1179),
  2023-06-12). That someone wants "VW Link connection status" on a physical button is the whole
  fragility story in one variable name.
- **A fast MVR checker that is not a visualiser** — Perastage's explicit self-description: "not
  a real-time DMX visualizer", but "a fast and practical way to view, check, and work with MVR
  files".
- **Automatic, no-export sync**: `vectorworks-bridge` watches the XML Vectorworks writes
  "automatically whenever focus switches away from VW", so the user never runs an export at all.

---

## Implications for AV Planner Suite

Anchored against what already exists: `light-planner` (2D/3D sketch, auto-patch with clash
detection, instrument schedule, kW and A-per-phase load summary, CSV export, offline, MIT) and
`cable-planner` (signal-flow and rack planning, patch-sheet issues [#109](https://github.com/larszu/cable-planner/issues/109)
and [#322](https://github.com/larszu/cable-planner/issues/322), CRDT convergence testing and
collaboration discovery in the codebase).

**1. The return path is the differentiator, not the plot.** Five mature products draw plots and
four render them. Nobody solves *console state → plan*. The MVR authors declared it out of scope.
ETC's own return path is a spare-time community library. Any credible offer here — even a
one-way "import the console's patch and diff it against my plan" — addresses a documented,
vendor-acknowledged, unfilled gap. **Highest-leverage finding in this dossier.**

**2. Merge is a feature, and cable-planner already has the machinery.** The single most
concrete pain statement in the corpus is "NO WAY to reconcile differences → data loss or manual
re-entry", and the standards body has explicitly refused to solve it ("no single source of
truth"). cable-planner's CRDT layer and collaboration discovery are exactly the right primitives.
A three-way diff of a rig — fixtures added, deleted, modified; addresses moved; circuits
reassigned — presented as a reviewable change list rather than a file overwrite, is a feature
Lightwright users are asking a hobby project for.

**3. Carry what MVR drops, and be explicit about it.** MVR has no groups, no cables, no circuits
in the spec text. AV Planner Suite already models cables and circuits. The design rule follows:
model them fully internally, export a clean, conformant MVR for interchange, and **name the
lossy fields in the export dialog** so the user knows what will not survive the trip. Nobody else
does this; the complaint that "every manufacturer implements MVR differently" means an honest,
explicit importer/exporter is a positioning asset.

**4. Validation before load-in is a product, not a nicety.** The requested check list is already
written for us: overlapping DMX addresses, duplicate channels, power overload per circuit/dimmer/
phase, missing required fields, semantic inconsistencies (LED on a dimmer circuit). light-planner
has clash detection and per-phase load already. Add the semantic checks and surface them as a
pre-flight report. The stated justification is "costly mistakes on-site".

**5. Treat the twelve reports as one data model with twelve views.** Channel Hookup, Dimmer
Schedule, Circuit List, DMX Addresses, Power Summary, Color Schedule, Gobo Schedule, Infrastructure
List ×5 — all sorts and groupings of `Channel, Dimmer, Type, Color, Circuit, Location, Wattage`.
Build the column/group/sort engine once. Include colour output and gel swatches; the greyscale
complaint is recent and specific.

**6. Do not build a visualiser.** Capture, WYSIWYG, Vision, Depence, MA 3D and BlenderDMX all
occupy that ground, several of them free. Perastage's success (112 stars in eight months) came
from explicitly *not* being one. light-planner's README already takes this position — keep it.

**7. Licensing is a live grievance and an open flank.** In the last twelve months: Lightwright
moved to subscription with legacy support stated to end 2026-07-01; WYSIWYG discontinued dongles
and perpetual licences and stops running when a subscription lapses; Depence perpetual module
licences cover the current major release only; Capture caps *documentation* by universe count;
ETCnomad outputs nothing without a key. An offline-first, file-owned, MIT-licensed planning tool
is not a minor differentiator in this market — it is the opposite of every trend line above.

**8. Robustness is a feature in this domain.** Every documented catastrophic exchange failure is
mundane: a rename, a backslash, a stray character, a case-mismatched filename, a non-unique UID.
Path-independent references, stable internal UUIDs that survive reload, case-normalised asset
caching, and tolerant parsing with visible warnings would each directly counter a *named,
sourced* failure in this dossier. cable-planner's `healProjectPositions` migration layer and
`atomicWrite` are the right instincts; extend the same paranoia to imported GDTF/MVR assets.

**9. Where the suite is already positioned well.** cable-planner models exactly the cable and
connector data that MVR issues #296 and #288 are asking the standard to add, and light-planner
already computes the per-phase electrical load that #158 wanted circuits for. The suite is
sitting on the two data classes the lighting exchange format is missing. That is a genuine
strategic position, provided the import/export story is honest about the boundary.

**10. What this dossier could not tell us — validate before building.**
- No German-language evidence at all. Whether Lightwright-style paperwork is even the norm in
  the German/European event market, versus Excel plus the console, is **UNKNOWN** and matters a
  great deal for this suite's home market.
- No broadcast-studio lighting evidence (as distinct from theatre/event). Given AV Planner Suite's
  broadcast orientation, this is a real gap.
- No time quantification from any practitioner.
- No evidence on messenger/e-mail workflows.
- Nothing on house-of-worship or volunteer-run lighting, which the tooling evidence (free MagicQ,
  BlenderDMX, QLC+) suggests is a large population.

---

## Sources

Every URL below was opened during this research. Search-result pages are listed separately
because they were used for discovery, not as evidence for any claim.

### GDTF / MVR specification (primary — standards body)

- https://github.com/mvrdevelopment/spec
- https://raw.githubusercontent.com/mvrdevelopment/spec/main/mvr-spec.md
- https://raw.githubusercontent.com/mvrdevelopment/spec/main/user_story_MVR-xchange.md
- https://github.com/mvrdevelopment/spec/issues
- https://github.com/mvrdevelopment/spec/issues/94 — Add Protocol and Network information to Fixtures in MVR (2021-07-29)
- https://github.com/mvrdevelopment/spec/issues/158 — Circuit name and circuit number (closed 2024-08-08)
- https://github.com/mvrdevelopment/spec/issues/255 — Media thumbnail exchange with media servers (2025-01-16)
- https://github.com/mvrdevelopment/spec/issues/288 — Wiring Object and Pin Patch in ChildList (2025-10-20)
- https://github.com/mvrdevelopment/spec/issues/295 — Fixture groups (2026-01-13)
- https://github.com/mvrdevelopment/spec/issues/296 — Allow to define cables in MVR (2026-01-27)
- https://github.com/mvrdevelopment/spec/issues/298 — MVR xchange unified import dialog and workflow consistency (2026-02-16)
- https://github.com/mvrdevelopment/spec/issues/318 — Renaming DMX Mode (2026-07-21)
- https://github.com/mvrdevelopment/spec/issues?q=is%3Aissue+MVR+workflow
- https://github.com/mvrdevelopment/spec/issues?q=is%3Aissue+patch
- https://github.com/mvrdevelopment/spec/issues?q=is%3Aissue+sort%3Acomments-desc
- https://github.com/mvrdevelopment/spec/issues?q=is%3Aissue+library+OR+share+OR+quality

### showstack open index (secondary, citation-per-fact)

Repository and structure:

- https://github.com/deliseph/showstack
- https://github.com/deliseph/showstack/issues/199
- https://github.com/deliseph/showstack/issues?q=is%3Aissue+lighting
- https://github.com/deliseph/showstack/tree/main/data
- https://github.com/deliseph/showstack/tree/main/data/software
- https://github.com/deliseph/showstack/tree/main/data/protocols
- https://github.com/deliseph/showstack/tree/main/data/standards
- https://github.com/deliseph/showstack/tree/main/data/terms

Software entries (each carries its own vendor source list and access date):

- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/lightwright.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/vectorworks-spotlight.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/vectorworks-braceworks.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/vectorworks-vision.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/eos-family.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/grandma3-onpc.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/chamsys-magicq.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/capture.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/wysiwyg.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/depence.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/dmxcat.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/software/sacnview.yaml

Protocol entries:

- https://raw.githubusercontent.com/deliseph/showstack/main/data/protocols/dmx512.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/protocols/rdm.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/protocols/art-net.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/protocols/citp.yaml

Vocabulary entries:

- https://raw.githubusercontent.com/deliseph/showstack/main/data/terms/focus.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/terms/patch.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/terms/plot.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/terms/dmx-universe.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/terms/dimmer.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/terms/paper-tech.yaml
- https://raw.githubusercontent.com/deliseph/showstack/main/data/terms/technical-rider.yaml

### Practitioner-built lighting paperwork tools

- https://github.com/jkarp7/showstack
- https://github.com/jkarp7/showstack/issues
- https://github.com/jkarp7/showstack/issues/29 — Shop order creation from system documentation
- https://github.com/jkarp7/showstack/issues/30 — MVR export
- https://github.com/jkarp7/showstack/issues/31 — Enhanced error checking: overlapping patches and power overloads
- https://github.com/jkarp7/showstack/issues/32 — Vectorworks XML integration / CAD sync
- https://github.com/jkarp7/showstack/issues/38 — File merge/reconciliation for multi-user workflow
- https://github.com/jkarp7/showstack/issues/39 — Equipment manager: filters, colour flags, point circuits
- https://github.com/jkarp7/showstack/issues/41 — Label designer, power and paperwork enhancements
- https://github.com/jkarp7/showstack/issues/45 — Unified visual editor: paperwork, labels, shop orders
- https://github.com/jkarp7/showstack/issues/48 — Paperwork tab integration (the twelve reports)
- https://github.com/jkarp7/showstack/issues/51 — Equipment manager export: CSV, Eos, grandMA2/3
- https://github.com/Charlie9830/Dimmer-Labels-Wizard
- https://github.com/Charlie9830/Dimmer-Labels-Wizard/issues?q=is%3Aissue
- https://github.com/Charlie9830?tab=repositories
- https://github.com/Charlie9830?tab=repositories&page=2
- https://github.com/Charlie9830/mvr
- https://github.com/Charlie9830/sidekick

### Vectorworks / Lightwright interchange tooling

- https://github.com/Gribiche64/vectorworks-bridge — MCP bridge with reverse-engineered Lightwright Data Exchange spec (2026)
- https://raw.githubusercontent.com/danielbchapman/OpenSpotlightDataExchange/master/README.md — open-source Lightwright Data Exchange library (2016)

### MVR/GDTF implementations and viewers

- https://github.com/PeramatoG/Perastage
- https://github.com/PeramatoG/Perastage/issues?q=is%3Aissue
- https://github.com/PeramatoG/Perastage/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc
- https://github.com/PeramatoG/Perastage/issues/1652 — GDTF virtual parameters counted as real DMX channels
- https://github.com/PeramatoG/Perastage/issues/2157 — MVR/GDTF cache case sensitivity and UUID loss
- https://github.com/open-stage/blender-dmx
- https://github.com/open-stage/blender-dmx/issues
- https://github.com/orgs/open-stage/repositories
- https://github.com/open-stage/python-gdtf/issues?q=is%3Aissue
- https://github.com/open-stage/python-mvr/issues?q=is%3Aissue

### Console-side tooling

- https://github.com/douglasfinlay/cue-note
- https://github.com/douglasfinlay/cue-note/issues?q=is%3Aissue
- https://github.com/ETCLabs
- https://github.com/ETCLabs/EosSyncLib
- https://github.com/claudeheintz/lxascii — USITT ASCII show-file parser
- https://github.com/bitfocus/companion-module-etc-eos/issues
- https://github.com/bitfocus/companion-module-requests/issues/1179 — Lightwright 6 Companion module request

### AV Planner Suite repositories (internal context)

- https://github.com/larszu/light-planner (README)
- https://github.com/larszu/cable-planner/issues/109 — Patch sheet export
- https://github.com/larszu/cable-planner/issues/322 — Patch sheets

### Discovery-only search pages (not cited as evidence)

- https://github.com/search?q=lightwright&type=issues&s=created&o=desc (pages 1-3)
- https://github.com/search?q=%22magic+sheet%22+lighting&type=issues&s=created&o=desc
- https://github.com/search?q=%22USITT+ASCII%22&type=repositories
- https://github.com/search?q=%22patch+sheet%22+OR+%22instrument+schedule%22+lighting&type=repositories
- https://github.com/search?q=Veranstaltungstechnik+OR+Lichtplanung+DMX&type=repositories
- https://github.com/search?q=GDTF+import+broken+fixture&type=issues&s=created&o=desc
- https://github.com/search?q=%22MVR+xchange%22&type=repositories
- https://github.com/search?q=theatre+lighting+paperwork+hookup&type=repositories
- GitHub MCP repository searches: `lightwright`, `magic sheet lighting console paperwork`,
  `GDTF MVR lighting stars:>3`, `lighting plot patch paperwork theatre electrician`

### Attempted and blocked (recorded for transparency)

`reddit.com`, `controlbooth.com`, `blue-room.org.uk`, `prosoundweb.com`, `thelightnetwork.com`,
`lightwright.com`, `gdtf-share.com`, `forum.vectorworks.net`, `production-partner.de`,
`film-tv-video.de`, `livedesignonline.com`, `en.wikipedia.org`, `duckduckgo.com` — all returned
`EGRESS_BLOCKED` from the agent proxy. `WebSearch` was unavailable (session budget exhausted at
200/200 before this task began). GitHub's HTML search endpoint began returning HTTP 429 late in
the session; the authenticated MCP search was used thereafter.
