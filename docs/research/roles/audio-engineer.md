# Audio Engineers / Tonleute (live + broadcast)

Research dossier for AV Planner Suite. Compiled 2026-08-28.

> **Method and evidence caveat — read this first.**
>
> This session started with its `WebSearch` budget already exhausted (200/200 calls used before
> the first query), and the network egress proxy allowed only `github.com`,
> `raw.githubusercontent.com` and `gitlab.com`. Reddit (r/livesound, r/VIDEOENGINEERING,
> r/techtheatre), ProSoundWeb, Blue Room, Control Booth, Gearspace, film-tv-video.de,
> production-partner.de, VPLT, TVBEurope, Broadcast Bridge, YouTube, Wikipedia and
> `web.archive.org` all returned `EGRESS_BLOCKED` or an outright fetch refusal. So did every
> search-engine gateway.
>
> **What I did instead.** GitHub's *issue search* is reachable through `WebFetch`
> (`github.com/search?q=…&type=issues`), and it turns out to be a usable substitute for a
> practitioner forum in this specific domain: a striking number of working audio people build
> and file issues against small tools for their own paperwork. Roughly 50 pages were opened
> this session, and the strongest findings below come from issues written by identifiable
> practitioners about their own shows, most of them dated 2025–2026. That is a *different*
> sample than a forum — it over-represents the technically-minded and under-represents the
> engineer who just suffers in Excel — and the grades below are set conservatively to reflect
> that.
>
> Labels used throughout, per [`METHOD.md`](../METHOD.md):
>
> - **[FACT]** — I opened the page in this session and read it. Dated and attributable.
> - **[PATTERN]** — a structural fact about the ecosystem I verified by enumeration (e.g. "21
>   independent repositories named `stageplot`"). Strong for *demand exists*, silent on *who*.
> - **[SECOND-HAND]** — claimed by [`workflow-chain.md`](../workflow-chain.md) or
>   [`landscape/intercom.md`](../landscape/intercom.md), collected in an earlier session that had
>   search access. The URL is given so it can be re-verified; I could not re-open it here.
> - **[INFERENCE]** — my own reasoning, marked as such.
> - **unverified** — could not be established. Said out loud rather than quietly dropped.
>
> Because the venting layer is missing, almost nothing is graded `widespread` on the strength
> of this pass alone. Several findings that are very probably widespread are graded `recurring`
> because I could reach only three or four independent sources.

---

## Who they are / where they sit in the production

"Audio engineer" is four or five different jobs that share a vocabulary, and a product that
serves one may be irrelevant to the others. The split matters more here than in any other
department, because the *paperwork* differs even where the signal flow does not.

**1. FOH engineer (Front of House).** Mixes what the audience hears. Owns the input list in
practice, because everything downstream is numbered from it. On a touring show they arrive with
a show file and a rider; in a house they inherit a patch and re-map it.

**2. Monitor engineer.** Mixes what the performers hear — wedges and in-ears. Needs the *same*
input list plus a second, orthogonal document that FOH does not care about: who gets which mix,
and what is in it. [FACT] That this is a genuinely separate document is visible in the tooling:
`petesimple/stageplot` generates an **"Auto-generated Input List"** and an **"Auto-generated
Monitor Mix List"** as two distinct outputs from one stage layout
([README](https://raw.githubusercontent.com/petesimple/stageplot/main/README.md), repo created
2025-12, last touched 2026-06). And when a user of the documentation tool SoundDocs asks for
patch-list linking, his first refinement is the ability to link **"multiple patch lists
simultaneously (e.g. separate FOH and monitoring console configurations)"**
([sounddocs#111](https://github.com/SoundDocs/sounddocs/issues/111), 2025-10-10).

**3. Systems / PA tech.** Owns the loudspeaker system, amplifiers, drive processing and,
increasingly, the audio network. This is the person whose laptop has to run five vendor control
applications at once — see the network finding below, which is one of the sharpest 2026 sources
in this dossier.

**4. RF tech / frequency coordinator.** On anything above a certain size this is a dedicated
person: wireless microphones, IEMs, and often the wireless comms too. Their artefact is a
frequency plan.

**5. A1 / A2 (broadcast and theatre).** The A1 mixes; the **A2 is the one who puts the
microphone on the human being** and keeps track of which pack, which capsule, which battery,
which frequency is on which performer, session after session. [FACT] This role has a document,
and it is called a *card*: the tool `ShowStack` has a **"Mic Tracker"** module organised by
**Sessions and Days**, whose per-performer view is literally referred to as **"the A2 card"**,
carrying **a headshot and beltpack settings**
([ShowStack#68](https://github.com/chazw661/ShowStack/issues/68), 2026-08-23;
[#64](https://github.com/chazw661/ShowStack/issues/64), 2026-08-04). Independently, SoundDocs
ships a **"Mic Plot Designer"** for **"corporate and theater microphone plots with presenter
management, wireless assignments, and photography"**
([README](https://github.com/SoundDocs/sounddocs), read 2026-08-28). Two unrelated tools, both
current, both concluding that *the mic assignment record needs a photograph of the person*.

**6. Broadcast audio (OB / studio).** Adds a whole second document set that the live world does
not have: mix-minus and IFB feeds, commentary positions, talent mics, and comms. [SECOND-HAND +
LOCAL] The corpus already establishes that this half has no interchange format at all — see
*Missing interfaces* below.

Two structural facts frame everything that follows.

> **The audio department owns the highest-cardinality document in the building.** Lighting has
> one row per fixture; video has one row per camera or source. Audio has one row per *channel*,
> and a mid-size band is 24–44 rows before the show has a name. [FACT] `musicall`'s rider module
> is specified against a real reference rider with a **24-row patch list**
> ([#798](https://github.com/Cryde/musicall/issues/798)) and its PDF export issue is written
> around **"a 44 row list [that] spans pages"**
> ([#803](https://github.com/Cryde/musicall/issues/803)). Every one of those rows is retyped
> somewhere.

> **The audio paperwork is the only production document that is routinely read by a stranger in
> another country.** [FACT] This is stated almost verbatim by the developer specifying a rider
> module against a real 7-page band rider: the tech rider is *"the only Band Space document that
> leaves the band and is read by a stranger, frequently in another country"*
> ([musicall#776](https://github.com/Cryde/musicall/issues/776)). That is why version drift in
> the audio paperwork costs more than version drift anywhere else: the reader cannot ask.

---

## A day in the life

Chronological, assembled from the sources cited in each step. Where a step is inferred rather
than read, it is marked.

### Prep / advance (days to weeks before)

The show arrives as **a PDF rider and an e-mail thread**. [FACT] The canonical structure of that
PDF, taken from a real 7-page reference document, is: **cover (logo, title) → contacts (band
members, tech contact, booking) → patch list (channel / source / microphone / routing,
colour-coded by group) → wiring diagram (I/O rack) → stage plot with legend → mixing notes (FOH
and monitor) → logistics (catering, tickets)**
([musicall#776](https://github.com/Cryde/musicall/issues/776)). [FACT] The band maintains that
document **in Word or Pages**, and the named consequences are **single ownership, version drift,
and no real collaborative editing** (same issue). [FACT] Riders are versioned by *year or tour*,
not by show — the reference document is titled **"TECHNICAL RIDER 2026"**
([musicall#775](https://github.com/Cryde/musicall/issues/775)).

The receiving engineer now re-types it. [SECOND-HAND] The corpus records this as the dominant
break in the chain: *"Client's tech rider PDF → re-typed into the house input list → typed into
the console"*, with the classic failure being *"a promoter holding an old PDF, a newer e-mail
and three band members giving different answers"*
([`workflow-chain.md`](../workflow-chain.md), row 10; sources include
[stageplotpro.app rider guide](https://stageplotpro.app/guides/band-technical-rider-template),
not re-fetched here).

In parallel, three plans are drawn that nobody outside audio will ever see:

- **The RF plan.** [FACT] Coordination is a distinct piece of work with its own software
  (Shure Wireless Workbench, Sennheiser WSM, Audio-Technica Wireless Manager, Professional
  Wireless IAS) and its own inputs (a site scan). [SECOND-HAND] The output is often **a
  one-page paper RF sheet** with channel name, performer/position, pack type and a blank for
  the final frequency ([`workflow-chain.md`](../workflow-chain.md) row 10, citing
  [meyerproinc.com](https://meyerproinc.com/wireless-mic-frequency-planning/)).
- **The Dante / AoIP patch.** Built in Dante Controller, on the network, on site — or built
  offline if you have a tool for it, which mostly you do not (see below).
- **The comms plan.** [FACT] Who carries which beltpack, on which channel. SoundDocs ships a
  **"Comms Planner"** with **"visual canvas, transceiver management, beltpack assignments, and
  professional frequency coordination"** ([README](https://github.com/SoundDocs/sounddocs)),
  and ShowStack has a **COMM Beltpacks** module
  ([#66](https://github.com/chazw661/ShowStack/issues/66), 2026-08-08). [SECOND-HAND] Outside
  such tools it lives in a spreadsheet: *"The comms plan for a show lives in a spreadsheet. Who
  carries beltpack 7, which antenna covers the upstage-left dressing room corridor, which
  channel the followspot ops are on"* ([`landscape/intercom.md`](../landscape/intercom.md),
  gap 2).

### Load-in

Racks and stage boxes go in against a **rack plan**. [FACT] A live-audio professional describing
his own workflow on the Rackula rack-planning project: *"I work in the live audio industry; I
regularly need to make rack plans for our technicians"* — and the example plan he attached was
made **"using Draw or Excel"**
([Rackula discussion #1529](https://github.com/RackulaLives/Rackula/discussions/1529)). The
maintainer's follow-up work item is *"Export connections as a CSV patch list for live audio
technicians"*, described as *"the primary deliverable for the discussion #1529 user"*
([Rackula#1940](https://github.com/search?q=%22patch+list%22+spreadsheet+OR+Excel+audio&type=issues)).

Then the patch itself, and the first real divergence of the day: **the number on the band's
paperwork is not the number on the venue's console.** [FACT] Stated precisely, and treated as a
defect: the port is *"where the signal is plugged in"* and *"the only number that means anything
on their console"*, while the band's channel number *"is internal to the band's mixer setup and
meaningless to venue staff"* — and printing both side by side *"inadvertently suggests that
venue engineers should match them up"*
([bandregie#82](https://github.com/computi71/bandregie/issues/82), 2026).

### Rehearsal / soundcheck

Line check, then changes. This is where the plan and the reality separate, and where the
day's real cost is incurred. [SECOND-HAND] The corpus's summary of this step is blunt: *"The
change lands in the console and in someone's head. The plan, the paperwork and the ERP never
learn about it"* ([`workflow-chain.md`](../workflow-chain.md) row 15).

At a festival there is no rehearsal, only **changeover**. [FACT] The pressure is visible in what
engineers ask for from their control surfaces: a request against the X32 Companion module for
one-press switching of **Record/Play mode** and of **per-channel input source** (channel 1–32 or
Aux 1–6 → source AES50-A / AES50-B / Card → source channel), motivated by *"easy virtual
soundcheck or to switch to different input banks quickly"* and by **festival situations**
([companion-module-behringer-x32#88](https://github.com/bitfocus/companion-module-behringer-x32/issues/88)).

### Show

The paperwork that survives to showtime is short and mostly printed: the input list, the RF
sheet, the running order, and — in theatre and broadcast — the mic tracker. [FACT] Print is still
a first-class output and is still not good enough: SoundDocs' current stage-plot print offers
only *"two options (grayscale, text-only on white or full color with icons on dark)"*, which the
requesting engineer calls restrictive **"for users assembling documentation packets"**
([sounddocs#121](https://github.com/SoundDocs/sounddocs/issues/121), 2026-04-23).

Mid-show, the questions that get asked are lookups, not calculations: which pack is on that
performer, what frequency is it, which channel is that, where does this cable go. [INFERENCE,
supported] The tooling built for exactly these moments — the A2 card with the headshot, the
"Overview" tab in Mic Tracker, the RF sheet — is all *lookup* UI, which is a fair signal that
lookup under pressure is the actual show-time task.

### Load-out and post

[SECOND-HAND] Nothing written down survives: *"A show-time change (a camera dies, a channel is
repatched) is recovered by the operator and is invisible to every document"*
([`workflow-chain.md`](../workflow-chain.md) row 16). The show file is saved — [SECOND-HAND] the
corpus cites a ProSoundWeb piece on show-file discipline
([the-art-of-saving-showfiles](https://www.prosoundweb.com/the-art-of-saving-showfiles-total-recall-for-a-better-workflow-to-avoid-embarrassment/),
surfaced but not readable in either session) — and the paperwork is not updated to match it.

---

## Tools they actually use

| Tool | For what | How they feel about it |
| --- | --- | --- |
| **Excel / Google Sheets** | Input lists, patch lists, RF plans, comms plans, rack plans, IP sheets | The universal carrier. [FACT] A live-audio pro's own rack plans are made *"using Draw or Excel"* ([Rackula#1529](https://github.com/RackulaLives/Rackula/discussions/1529)); [FACT] a Dante XML converter's entire purpose is to produce **"a matrix view Excel file"** that *"looks like Dante Controller's grid"* ([Dante-XML-Converter](https://raw.githubusercontent.com/domtrotta/Dante-XML-Converter/main/README.md)). Nobody praises it; everybody uses it |
| **Word / Pages** | The band's tech rider | [FACT] Named as the status quo, with **"single ownership, version drift"** and no collaborative editing ([musicall#776](https://github.com/Cryde/musicall/issues/776)) |
| **StagePlotPro** | Stage plots | [FACT] *"highly regarded… celebrated for its simplicity"* — but the community port says the creator **"may have passed away"** and **"the official purchase channels have been discontinued, making this excellent software inaccessible"** ([StagePlotPirate](https://raw.githubusercontent.com/Chiunownow/StagePlotPirate/main/README.md), 12 stars, updated 2026-08-14). *This is a claim in that README; I could not verify it independently — treat the biography as unverified, the discontinuation as attested by the port's existence.* |
| **draw.io / Visio** | Stage plots, rack plans, signal flow | [FACT] The chosen refuge when the domain tool dies — StagePlotPirate exists to run StagePlotPro's icon set inside draw.io |
| **SoundDocs** (open source, AGPL) | Patch sheets, stage plots, mic plots, tech riders, run of show, production schedule, comms plan, pixel map, FFT analyser | [FACT] The most complete published enumeration of the audio department's document set I found ([README](https://github.com/SoundDocs/sounddocs)). Users file feature requests as working engineers, not as developers |
| **Dante Controller** | AoIP patching and device config | Tolerated, worked around. [FACT] Its own third-party ecosystem is a list of complaints: *"repetitive modifications that usually require opening many pages in Dante Controller"* ([Dante Config Editor](https://raw.githubusercontent.com/Mamat79/Dante-Config-Editor/main/README.md)); a CLI because it has none ([network-audio-controller](https://raw.githubusercontent.com/chris-ritsen/network-audio-controller/master/README.md), 349 stars); a Linux patchbay because it is Windows/macOS only ([netaudio-controller](https://github.com/stanelie/netaudio-controller)); a logger for **"audio loss events"** ([DanteLogger](https://raw.githubusercontent.com/Slendy/DanteLogger/main/README.md)); an AutoHotkey **auto-login** script sarcastically titled *"Feature where?"* ([dante-controller-autologin](https://github.com/featherbear/dante-controller-autologin)) |
| **Console offline editor / show file** (X32-Edit, Mixing Station, WING, dLive, DiGiCo, Yamaha) | Building the show before the console exists | Where the *real* input list ends up. [FACT] Parseable: the X32/M32 scene format stores channel names as `/ch/NN/config "Name"` lines that *"can be parsed reliably"*, and the WING generates the same ([bandregie#11](https://github.com/computi71/bandregie/issues/11)) |
| **Wireless Workbench / WSM / Wireless Manager / IAS** | Frequency coordination | Mandatory, siloed. [FACT] Engineers want to drive WWB7's **"scan, assign and deploy"** buttons from a control surface ([companion-module-requests#2063](https://github.com/search?q=%22Wireless+Workbench%22&type=issues)) and want other tools to **export into** WWB ([sounddocs#24](https://github.com/SoundDocs/sounddocs/issues/24)) |
| **tinySA / RF Explorer** (cheap spectrum analysers) | Site scans | [FACT] Widely used for **"wireless microphone frequency coordination and band planning"** ([QtTinySA#46](https://github.com/g4ixt/QtTinySA/issues/46)) — and the scan does not import: *"the supplied default .csv format is not recognized by any of these industry standard softwares"* ([tinySA#88](https://github.com/erikkaashoek/tinySA/issues/88)) |
| **Bitfocus Companion** | Show control surface for everything without a native remote | Actively used as the glue layer; the module request tracker is a live inventory of what engineers cannot otherwise reach |
| **Clear-Com EHX / Riedel Director** | Comms configuration | [SECOND-HAND] Config lives inside the vendor tool; [FACT-in-corpus] there is **no interchange format for an intercom plan from anyone** ([`landscape/intercom.md`](../landscape/intercom.md), gap 1) |
| **WhatsApp / e-mail** | Every change after the PDF was sent | [SECOND-HAND] *"the band's changes arrive by WhatsApp"*; *"stage crew may have printed the attachment before they see the follow-up e-mail"* ([`workflow-chain.md`](../workflow-chain.md) row 10) |
| **Paper** | Input list taped to the stage box, RF sheet, mic plot, running order | Still the show-time medium. See *Paper / Excel / WhatsApp inventory* |

---

## Time sinks

Ranked by my read of cost × frequency. Each carries its evidence and a frequency grade.

### 1. Re-typing the same channel list into three or four places — `widespread`

The single largest recurring cost, and the best-evidenced. The chain is: band's rider (Word) →
promoter/venue e-mail → house input list (Excel) → console scene → stage box labels → (in
broadcast) the router/MV/comms labels.

[FACT] A working engineer describes the smallest possible version of this *inside a single tool*
and files it as a bug in his workflow: he has to *"fill out a standalone patch list and one
inside the Tech Rider section"*, and asks for the rider to **reference** the patch list so that
*"modifications automatically propagate"*
([sounddocs#111](https://github.com/SoundDocs/sounddocs/issues/111), 2025-10-10). If the
duplication is intolerable within one application, the version that spans four applications is
worse by construction.

[FACT] The same conclusion reached independently from the other end, by a band-side tool:
parse the console scene backup, extract the channel list, and *"feed the parsed data into the
stage rider builder… to maintain synchronized input lists"*, so that *"the band avoids duplicate
data entry"* ([bandregie#11](https://github.com/computi71/bandregie/issues/11)).

[FACT] And the manual-entry cost is quantified in the tooling: presets exist specifically *"to
reduce tedious manual entry when filling a 24-row patch list"*
([musicall#798](https://github.com/Cryde/musicall/issues/798)).

**Time cost:** [INFERENCE from row counts] 24–44 rows × 3–4 destinations. Minutes per
destination if nothing changes; the cost is not the first typing but every re-typing after a
change.

### 2. Frequency coordination, and the fact that the scan does not travel — `recurring`

[FACT] The scan data problem is explicit and current: a request to the tinySA firmware for
native export in **Shure WWB CSV, Sennheiser Wireless Systems Manager, Audio-Technica Wireless
Manager JSON, and Professional Wireless IAS** formats, because *"the supplied default .csv
format is not recognized by any of these industry standard softwares"*, with users currently
relying on **conversion scripts**
([tinySA#88](https://github.com/erikkaashoek/tinySA/issues/88)).

[FACT] And the plan does not travel either: a touring engineer asks his documentation tool for
*"a dedicated view of used frequencies (with export to Wireless Workbench)"*, because today the
frequencies live only in free-text **patch notes**
([sounddocs#24](https://github.com/SoundDocs/sounddocs/issues/24), 2025-05-07). His stated
motivation is deployment speed: touring with a small band where the rig has to be show-ready in
minimal setup time.

[PATTERN] Coordination itself keeps getting rebuilt: `matej-hron/intermod-checker`, an
*"Intermodulation interference checker for wireless microphone frequency coordination"*, was
created 2026-08-09 — three weeks before this dossier.

**Time cost:** [INFERENCE] hours per production for a coordinated show; the conversion-script
step is minutes but sits on the critical path of load-in.

### 3. Dante patch documentation and safe renaming — `recurring`

[PATTERN] Between 2016 and 2026 at least **eight independent projects** exist to do what Dante
Controller does not: two "offline editors"
([TimoteusRuotsalainen/DanteOfflineEditor](https://github.com/TimoteusRuotsalainen/DanteOfflineEditor),
2016; [didierbergeron/dante-offline-editor](https://github.com/didierbergeron/dante-offline-editor),
2026-04), a full offline XML editor
([Mamat79/Dante-Config-Editor](https://github.com/Mamat79/Dante-Config-Editor), 2026-08), an
XML→Excel converter ([domtrotta/Dante-XML-Converter](https://github.com/domtrotta/Dante-XML-Converter)),
a CLI/library ([chris-ritsen/network-audio-controller](https://github.com/chris-ritsen/network-audio-controller),
349 stars), a Linux patchbay ([stanelie/netaudio-controller](https://github.com/stanelie/netaudio-controller),
2026-03), a web controller ([willell/dante-web-controller](https://github.com/willell/dante-web-controller),
2026-08) and a loss logger ([Slendy/DanteLogger](https://github.com/Slendy/DanteLogger), 2026-05).
Eight rebuilds of the same missing capability is a demand signal.

[FACT] The most recent of them names the time sink directly — *"repetitive modifications that
usually require opening many pages in Dante Controller"* — and its headline safety feature is
that when you rename machines or channels **"DCE updates the relevant subscriptions so as not to
lose the existing patch"**
([Dante Config Editor README](https://raw.githubusercontent.com/Mamat79/Dante-Config-Editor/main/README.md)).
It also ships **project merge** with detection of *"naming and identity conflicts"*, a
**pre-export validation assistant with blocking errors and confirmable warnings**, TXT/PDF
reports with **patch comparison**, and colour-coded **synoptic diagrams as PDF or SVG**. Read as
a list of pain: renaming breaks patches, merging two systems collides on names, exports go out
wrong, and nobody can produce a readable diagram of what the patch actually is.

**Time cost:** [INFERENCE] minutes to hours per show; the renaming failure mode can cost a
soundcheck.

### 4. Running five vendor control applications from one laptop — `recurring`

[FACT] The clearest 2026 statement of the systems tech's day: a portable gateway exists so that
*"one control client (laptop or tablet)"* can run **VuNET, mixer apps, Dante Controller, Lake
Controller and Shure WWB** *"without dual NICs"*, while keeping **amp control off Dante PTP** and
preventing **Waves SoundGrid** attaching to the wrong segment — with a documented
**"break-glass"** fallback for when the box itself fails
([vunet-dante-combiner-2000](https://raw.githubusercontent.com/misnow1/vunet-dante-combiner-2000/main/README.md),
created 2026-08-13, 7 open issues).

That single sentence contains the whole problem: five ecosystems, three network domains, one
laptop, one NIC, and a clock protocol that must not be contaminated.

**Time cost:** [INFERENCE] setup-time only, but it is setup time on the critical path, and the
failure mode (PTP disturbed by a control application) is a show-stopper.

### 5. Making the paperwork printable — `recurring`

[FACT] Print flexibility is an open request in the leading open-source tool, framed around
**"assembling documentation packets"**: only two print modes exist and both are wrong for a
packet ([sounddocs#121](https://github.com/SoundDocs/sounddocs/issues/121), 2026-04-23). [FACT]
On the rider side, PDF export is a dedicated issue because a **44-row list spans pages** and
needs a repeating table header and its colour chips preserved
([musicall#803](https://github.com/Cryde/musicall/issues/803)).

**Time cost:** minutes per document, but repeated per show and always at the worst moment.

### 6. Drawing the stage plot, again — `widespread`

[PATTERN] A GitHub name search for `stageplot in:name` returns **21 repositories**, spanning
2016 to 2026, almost all of them independent one-person builds, six of them created or updated
in 2026 alone. That is the signature of a need that has no accepted answer. [FACT] The
de-facto standard tool, StagePlotPro, is described by the community port as inaccessible with
purchase channels discontinued
([StagePlotPirate](https://raw.githubusercontent.com/Chiunownow/StagePlotPirate/main/README.md)).

[FACT] The plot cannot be replaced by text: *"promoters expect a visual drawing rather than
[a] free-text field"* ([bandregie#28](https://github.com/computi71/bandregie/issues/28)).

### 7. Mic assignment tracking across a run — `recurring`

[FACT] Two independent current tools build the same thing: ShowStack's **Mic Tracker**, organised
by **Sessions and Days**, with a per-performer **"A2 card"** carrying a **headshot** and
**beltpack settings** ([#68](https://github.com/chazw661/ShowStack/issues/68),
[#64](https://github.com/chazw661/ShowStack/issues/64), 2026); and SoundDocs' **Mic Plot
Designer** with *"presenter management, wireless assignments, and photography"*
([README](https://github.com/SoundDocs/sounddocs)).

**Time cost:** [INFERENCE] per-session, every session of a run — this is the one time sink that
recurs *daily* rather than per production.

### 8. Comms and IFB planning — `recurring`

[FACT] Both practitioner tools examined ship a comms module (SoundDocs "Comms Planner" with
beltpack assignments and frequency coordination; ShowStack "COMM Beltpacks"). [SECOND-HAND] The
corpus's intercom analysis states the underlying condition: none of sixteen intercom products is
a *planning* tool — *"They are runtime tools that assume the plan already exists somewhere
else"* — and none *"has any concept of a venue, a position, a person's role in a running order,
or a coverage area"* ([`landscape/intercom.md`](../landscape/intercom.md), gap 2).

---

## Double data entry

What gets typed into more than one system. Ordered by how well evidenced it is.

| # | The same fact | Typed into | Evidence | Frequency |
| --- | --- | --- | --- | --- |
| 1 | **Channel list** (number, source, mic/DI, phantom, stand) | Band's rider (Word) → venue e-mail → house input list (Excel) → console scene → stage box labels | [FACT] [sounddocs#111](https://github.com/SoundDocs/sounddocs/issues/111); [FACT] [bandregie#11](https://github.com/computi71/bandregie/issues/11); [FACT] [musicall#776](https://github.com/Cryde/musicall/issues/776); [SECOND-HAND] [`workflow-chain.md`](../workflow-chain.md) row 10 | `widespread` |
| 2 | **The same patch list, twice inside one application** — standalone document and rider section | One tool, two places | [FACT] [sounddocs#111](https://github.com/SoundDocs/sounddocs/issues/111) (2025-10-10) | `recurring` |
| 3 | **Channel names** | Console scene ↔ Dante device/channel names ↔ multitrack recorder track names ↔ scribble strips | [FACT] `DanteLabels2Reaper` exists purely to convert Dante Controller's exported XML into a REAPER channel map ([repo](https://github.com/dronenb/DanteLabels2Reaper)); [FACT] a spike to *"Verify multitrack track to console channel mapping"* ([sound-buddy#895](https://github.com/search?q=%22virtual+soundcheck%22&type=issues)); [FACT] Companion module request to **push variable text into a channel's scribble strip** ([companion-module-allenheath-sq#124](https://github.com/search?q=%22scribble+strip%22&type=issues)) | `recurring` |
| 4 | **Dante channel identity** — numeric id vs friendly name | Two names for one channel, and the control software shows the wrong one | [FACT] *"Dante naming weirdness means that channel 'names' are always `'01'`, `'02'` etc."*, while the friendly names are e.g. *"Broadcast L"* / *"Broadcast R"*; subscriptions made by numeric name leave Dante Controller unable to show which channel a subscription targets ([network-audio-controller#11](https://github.com/chris-ritsen/network-audio-controller/issues/11)) | `recurring` |
| 5 | **Frequencies** | Coordination software → paper RF sheet → each receiver's front panel → patch notes in the documentation tool | [FACT] [sounddocs#24](https://github.com/SoundDocs/sounddocs/issues/24) (frequencies currently live in free-text patch notes); [SECOND-HAND] paper RF sheet as coordination hub ([`workflow-chain.md`](../workflow-chain.md) row 10) | `recurring` |
| 6 | **Scan data** | Analyser CSV → hand-converted → coordination software | [FACT] [tinySA#88](https://github.com/erikkaashoek/tinySA/issues/88) | `recurring` |
| 7 | **Beltpack / comms labels** | Comms plan spreadsheet → matrix or beltpack config tool | [SECOND-HAND] *"every beltpack label is typed twice"* ([`landscape/intercom.md`](../landscape/intercom.md), gap 10) | `recurring` |
| 8 | **Stage layout** | Rider stage plot → house drawing → rigging/lighting plan | [FACT] Stage plots are drawn separately from every other departmental plan; 21 independent stage-plot tools, none of which reads a venue drawing | `recurring` (structural) |
| 9 | **Device names, in broadcast** | Drawing → router → multiviewer → tally/UMD → comms panel keys | [SECOND-HAND] *"A renamed source has to be corrected in the drawing, the router, the MV, the tally and the comms panel labels — five places, no link between them"* ([`workflow-chain.md`](../workflow-chain.md) row 7) | `widespread` in broadcast |

---

## Error sources

What goes wrong, and what it costs.

### A. Renaming breaks the patch — `recurring`, cost: a soundcheck

[FACT] The headline feature of the newest offline Dante editor is that renaming updates the
affected subscriptions **"so as not to lose the existing patch"**
([DCE README](https://raw.githubusercontent.com/Mamat79/Dante-Config-Editor/main/README.md)).
A feature framed that way exists because the unguarded operation loses the patch. On a Dante
network the consequence of a lost subscription is silence on a channel that looks correct
everywhere else.

### B. An import overwrites hand-entered facts — `recurring`, cost: a wrong stage setup

[FACT] The sharpest single error report I found. A rider tool had one column headed *"Quelle /
Mikrofon"* (source/microphone) which conflated two different facts. When a **WING snapshot** is
imported, the system *"writes stagebox inputs into the microphone column, overwriting whatever
microphone information someone manually entered"*. The issue is filed as a **bug**, and the
required fix is a separate column plus an import that *"populate[s] only the input field, never
touching microphone data"* ([bandregie#81](https://github.com/computi71/bandregie/issues/81)).

The general lesson, and it is a design lesson for us: **the stagebox input (A1, A2 …) and the
microphone (SM57, DI, condenser) are two independent facts, and a rider needs both.** One is
determined by the venue, the other is carried by the band, and no console file knows the second
one.

### C. Channel number mistaken for port number — `recurring`, cost: a wrong patch, discovered at line check

[FACT] *"The channel number is internal to the band's mixer setup and meaningless to venue
staff"*; the port is *"the only number that means anything on their console"*; and presenting
both *"implies both matter equally, when only one actually does"*
([bandregie#82](https://github.com/computi71/bandregie/issues/82)).

### D. A preset or template silently replaces work — `recurring`, cost: data loss

[FACT] Written as a hard requirement after a prior data-loss bug: *"Applying a preset must never
silently replace an existing grid"* — presets must append or prompt, and must show the resulting
row count ([musicall#798](https://github.com/Cryde/musicall/issues/798)).

### E. A wrong preset is worse than none — `recurring`, cost: misplaced trust

[FACT] On shipping console-routing presets for X32 / Yamaha QL-CL / A&H SQ: *"A wrong preset is
worse than no preset"*, because routing specs vary **by firmware and by venue context**, so every
preset entry needs a documented source
([musicall#798](https://github.com/Cryde/musicall/issues/798)). This is a direct warning to
anyone (us included) tempted to ship a device library with routing assumptions baked in.

### F. Version drift in the rider — `widespread`, cost: the wrong rig ordered

[FACT] Word/Pages riders produce *"single ownership, version drift"* and no collaborative
editing ([musicall#776](https://github.com/Cryde/musicall/issues/776)); riders are versioned per
year/tour, not per show ([musicall#775](https://github.com/Cryde/musicall/issues/775)).
[SECOND-HAND] The operational failure is the promoter *"holding an old PDF, a newer e-mail and
three band members giving different answers"*, and crew who *"printed the attachment before they
see the follow-up e-mail"* ([`workflow-chain.md`](../workflow-chain.md) row 10).

### G. One inserted channel renumbers everything downstream — `recurring`

[SECOND-HAND] Recorded as a named failure mode ([`workflow-chain.md`](../workflow-chain.md)
row 10). [INFERENCE] This is why engineers leave gaps and spares in the numbering, and why the
number on the paper and the number on the desk drift apart over a run.

### H. Control traffic on the wrong network segment — `recurring`, cost: audio dropouts

[FACT] The combiner project exists to keep **amp control off Dante PTP** and to stop **Waves
SoundGrid** attaching to the wrong segment
([vunet-dante-combiner-2000](https://raw.githubusercontent.com/misnow1/vunet-dante-combiner-2000/main/README.md)).
[FACT] Dropouts are real enough that a separate tool exists to *"log audio loss events in Dante
digital audio networks"*, because Dante Controller does not
([DanteLogger](https://raw.githubusercontent.com/Slendy/DanteLogger/main/README.md)).

### I. The bands do not know the venue — `recurring`, cost: a rider that cannot be executed

[FACT] Stage plots have to support several stage shapes because *"bands may not know venue stage
shape when writing riders"* ([musicall#838](https://github.com/Cryde/musicall/issues/838)).
[FACT] Riders also mis-model requirements as equipment — power in particular: *"Real riders treat
power as a requirement, listed rather than drawn to scale"*
([musicall#840](https://github.com/Cryde/musicall/issues/840)).

---

## Paper / Excel / WhatsApp inventory

Being specific, because this is where a planning product either fits or does not.

### Still on PAPER

| Document | Why paper | Evidence |
| --- | --- | --- |
| **Input list taped to the stage box / stage rack** | Read by whoever is on stage, in the dark, hands full | [SECOND-HAND] [`workflow-chain.md`](../workflow-chain.md) row 10 |
| **One-page RF sheet** — channel name, performer/position, pack type, blank for final frequency | Acts as the hub between coordination, rehearsal, and handoff to stage management | [SECOND-HAND] [`workflow-chain.md`](../workflow-chain.md) row 10, citing [meyerproinc.com](https://meyerproinc.com/wireless-mic-frequency-planning/) |
| **The A2 card / mic plot with a headshot** | You have to recognise the person you are miking | [FACT] [ShowStack#68](https://github.com/chazw661/ShowStack/issues/68); [FACT] SoundDocs Mic Plot with "photography" |
| **Stage plot, one page, printed** | Handed to load-in crew and the band | [FACT] `petesimple/stageplot` prints *"a clean one-page plot for load-in"* for *"FOH, Monitor engineers, Venue advance emails, Band reference on stage"* |
| **The documentation packet** (plot + patch + schedule, assembled and printed together) | The show binder | [FACT] [sounddocs#121](https://github.com/SoundDocs/sounddocs/issues/121) |
| **Printed cable schedule in the rack room; cable labels** | Fault-finding at 03:00 | [SECOND-HAND] [`workflow-chain.md`](../workflow-chain.md) row 7 |

### Lives in EXCEL

| Spreadsheet | Contents | Evidence |
| --- | --- | --- |
| **The input list / patch list** | Channel no., source/instrument, mic/DI, stand, phantom, stagebox/splitter port, desk channel, notes | [SECOND-HAND] [`workflow-chain.md`](../workflow-chain.md) row 10; [LOCAL] the same field list is what `cable-planner#353` specifies |
| **The rack plan** | Rack, RU, device | [FACT] *"using Draw or Excel"* ([Rackula#1529](https://github.com/RackulaLives/Rackula/discussions/1529)) |
| **The Dante patch, as a grid** | Tx device/channel × Rx device/channel | [FACT] The XML→Excel converter produces *"a matrix view Excel file"* that *"looks like Dante Controller's grid"* ([Dante-XML-Converter](https://raw.githubusercontent.com/domtrotta/Dante-XML-Converter/main/README.md)) |
| **The comms plan** | Beltpack no. → person → channel → antenna/zone | [SECOND-HAND] [`landscape/intercom.md`](../landscape/intercom.md), gap 2 |
| **The RF plan** | Channel, performer, pack, band, frequency | [FACT, by absence] Requested *as a missing feature* on top of free-text patch notes ([sounddocs#24](https://github.com/SoundDocs/sounddocs/issues/24)) |
| **The IP / network sheet** | Subnets, VLANs, device IPs, PTP domain, switch ports | [SECOND-HAND] [`workflow-chain.md`](../workflow-chain.md) row 11 |

### Travels by WHATSAPP or E-MAIL

- **Every change after the PDF went out.** [SECOND-HAND] *"the band's changes arrive by
  WhatsApp"* ([`workflow-chain.md`](../workflow-chain.md) row 10).
- **The rider itself, as an attachment**, in a thread where the newest version is not obviously
  the newest. [FACT] The document *"leaves the band and is read by a stranger, frequently in
  another country"* ([musicall#776](https://github.com/Cryde/musicall/issues/776)).
- **Advance confirmations.** [FACT] The advance is a *timeline* of e-mail obligations: an
  auto-generated advance checklist at 60/45/30/21/14/7 days out, with *"advance due, tech rider
  requirements confirmed"* at 30 days
  ([atms-platform-2026#17](https://github.com/search?q=%22tech+rider%22+venue+advance+PDF&type=issues)).
- **Rehearsal notes**, outside theatre. [SECOND-HAND] In theatre this is formalised as the
  stage manager's daily rehearsal report to a distribution list; *"Outside theatre it is verbal
  + WhatsApp"* ([`workflow-chain.md`](../workflow-chain.md) row 15).

### Lives in WORD

- **The band's tech rider.** [FACT] *"Word or Pages"*, with version drift as the named
  consequence ([musicall#776](https://github.com/Cryde/musicall/issues/776)).

---

## Missing interfaces

Department handovers that break, ranked by how badly.

### 1. Console ↔ paperwork. Nothing flows back. — `widespread`

The input list is *authored* in a document and *lived* in a console show file, and there is no
link in either direction. [FACT] The band-side attempt at the first direction is a feature
request, not a product: parse the X32/M32/WING scene, extract `/ch/NN/config "Name"`, store per
band and optionally per event, feed the rider, and offer **a diff between uploads**
([bandregie#11](https://github.com/computi71/bandregie/issues/11)). The reverse direction —
changes made at the desk during rehearsal flowing back into the paperwork — I found **no
implementation of at all**, in any tool, in this pass.

[INFERENCE, strongly supported] This mirrors exactly the lighting department's known gap, where
"edit at the console during tech, export CSV, merge into Lightwright" is still a *feature
request* ([`workflow-chain.md`](../workflow-chain.md) row 9). Audio is one step behind lighting:
lighting at least has a fragile file-based link (Vectorworks ↔ Lightwright ↔ Eos); audio has
none.

### 2. Rider ↔ house patch. The version boundary. — `widespread`

[FACT] The rider is authored per year/tour by the band, and consumed per show by a stranger. No
tool in the chain tells the consumer whether they hold the current version, and [SECOND-HAND]
*"static PDFs give no visibility into who has seen the latest version"*
([`workflow-chain.md`](../workflow-chain.md) row 11). The requested shape of the fix is
explicit: riders that are **"versioned, confirmed, shareable"**
([Jovie#14998](https://github.com/search?q=%22tech+rider%22+venue+advance+PDF&type=issues)).

### 3. Coordination software ↔ spectrum analyser ↔ receivers. — `recurring`

[FACT] Scan CSV is not readable by WWB/WSM/Wireless Manager/IAS
([tinySA#88](https://github.com/erikkaashoek/tinySA/issues/88)); the coordinated plan is not
exportable from the documentation tool into WWB
([sounddocs#24](https://github.com/SoundDocs/sounddocs/issues/24)); and deployment to the
receivers is a per-vendor operation that engineers would like to trigger remotely — hence the
request to drive WWB7's **scan / assign / deploy** buttons from a control surface
([companion-module-requests#2063](https://github.com/search?q=%22Wireless+Workbench%22&type=issues)).

### 4. Intercom plan ↔ anything. No interchange format exists. — `widespread`

[SECOND-HAND, and the strongest claim in the corpus] *"There is no interchange format for an
intercom plan — none, from anyone. Lighting has GDTF/MVR; video has NMOS; intercom has nothing…
This is the largest single gap found in this segment"*
([`landscape/intercom.md`](../landscape/intercom.md), gap 1). Cross-vendor bridging is *"manual
and lossy… The labels — the one thing humans need — never survive the boundary"* (gap 5).

### 5. Audio ↔ video / lighting / rigging. The stage exists four times. — `recurring`

[INFERENCE, structural] The stage plot, the lighting plot, the camera plan and the rigging plan
are four drawings of one room, authored in four tools, and none reads the others. [FACT] The
stage-plot tools I examined model the stage as an abstract box — *"Stage plot coordinates are
fractions of the stage box, never pixels"* ([musicall#776](https://github.com/Cryde/musicall/issues/776))
— which is right for a portable rider and wrong for a venue-accurate plan. Nobody bridges the
two.

### 6. Audio ↔ rental / logistics. — `recurring`

[SECOND-HAND] The rider's requirements (mics, stands, DIs, packs, wedges) and the rental system's
line items are the same objects typed twice; [FACT] riders themselves confuse the two, listing
power as equipment when *"real riders treat power as a requirement"*
([musicall#840](https://github.com/Cryde/musicall/issues/840)).

### 7. Audio ↔ stage management / running order. — `recurring`

[SECOND-HAND] Runtime comms products have *"no concept of a venue, a position, a person's role in
a running order"* ([`landscape/intercom.md`](../landscape/intercom.md), gap 2). [FACT] The mic
tracker is organised by **Sessions and Days**
([ShowStack#64](https://github.com/chazw661/ShowStack/issues/64)) — i.e. by the run schedule —
but that schedule is owned by stage management in a different document.

---

## Needlessly complicated workflows

- **Building a Dante patch by clicking through many pages.** [FACT] Named as the motivating
  inefficiency for an entire offline editor
  ([DCE README](https://raw.githubusercontent.com/Mamat79/Dante-Config-Editor/main/README.md)).
- **Documenting a Dante patch by exporting XML and converting it to Excel to make it readable.**
  [FACT] [Dante-XML-Converter](https://raw.githubusercontent.com/domtrotta/Dante-XML-Converter/main/README.md).
- **Logging into locked Dante devices repeatedly.** [FACT] An AutoHotkey auto-login script
  titled *"Feature where?"* ([dante-controller-autologin](https://github.com/featherbear/dante-controller-autologin),
  2022 — older evidence, and the device-lock UX may have changed since; treat as weak).
- **Carrying two network interfaces, or a second laptop, to reach two control VLANs.** [FACT]
  [vunet-dante-combiner-2000](https://raw.githubusercontent.com/misnow1/vunet-dante-combiner-2000/main/README.md).
- **Converting a spectrum scan with a script before coordination.** [FACT]
  [tinySA#88](https://github.com/erikkaashoek/tinySA/issues/88).
- **Maintaining the same patch list in two places inside one application.** [FACT]
  [sounddocs#111](https://github.com/SoundDocs/sounddocs/issues/111).
- **Re-drawing a stage plot because the tool you bought is no longer sold.** [FACT]
  [StagePlotPirate](https://raw.githubusercontent.com/Chiunownow/StagePlotPirate/main/README.md).

## Software they use grudgingly, and why

| Tool | The grudge | Evidence quality |
| --- | --- | --- |
| **Dante Controller** | No CLI/scripting; Windows/macOS only; many-page editing for repetitive changes; renaming endangers the patch; no logging of loss events; no offline editing; subscriptions displayed against numeric channel ids rather than friendly names | [FACT] — eight independent tools built to fill these gaps, six of them 2025–2026 |
| **Excel** | It is the only thing that reliably opens everywhere, and it knows nothing about channels, ports, frequencies or conflicts | [FACT] via the Rackula and Dante-XML-Converter evidence; [SECOND-HAND] elsewhere |
| **Word/Pages for riders** | Single-owner, version-drifting, uncollaborative — for a document read by strangers abroad | [FACT] [musicall#776](https://github.com/Cryde/musicall/issues/776) |
| **StagePlotPro** | Loved, and effectively orphaned | [FACT] for the workaround's existence; the biography claim is **unverified** |
| **Wireless Workbench and its siblings** | Mandatory and hermetic: nothing imports into it cleanly, nothing exports out of it, and its own operations cannot be driven remotely | [FACT] three independent requests pointing at the same wall |
| **Vendor control apps generally (VuNET, Lake, SoundGrid, mixer apps)** | Each assumes it owns the laptop's network | [FACT] the combiner project |
| **Companion** | Used *willingly* — but its request tracker is a map of everything that has no usable remote interface | [FACT] `companion-module-requests` #2063, #1614, #1113, #1535 |

---

## What they would want

Stated wishes, in their own framing, not mine. Every line is something a practitioner actually
asked for.

1. **"One source of truth" for the channel list.** [FACT] Link the rider's input list to the
   real patch list so that *"modifications automatically propagate"*; add a per-channel **"Show
   in Tech Rider"** toggle; support **multiple linked patch lists** for separate FOH and monitor
   consoles ([sounddocs#111](https://github.com/SoundDocs/sounddocs/issues/111)).
2. **Import the channel list from the console backup.** [FACT] Upload an X32/M32/WING scene,
   parse `/ch/NN/config "Name"`, show it as a table, store it per band and optionally per event,
   feed the rider — and offer **a diff between uploads**
   ([bandregie#11](https://github.com/computi71/bandregie/issues/11)).
3. **Keep the stagebox input and the microphone as separate fields**, print both, and never let
   an import overwrite the microphone ([bandregie#81](https://github.com/computi71/bandregie/issues/81)).
4. **Print the port, not the internal channel number**, for anything that leaves the band
   ([bandregie#82](https://github.com/computi71/bandregie/issues/82)).
5. **A dedicated frequency view, with export to Wireless Workbench** — rather than frequencies
   buried in patch notes ([sounddocs#24](https://github.com/SoundDocs/sounddocs/issues/24)).
6. **Scan files that import into the coordination software natively** — WWB CSV, Sennheiser WSM,
   Audio-Technica Wireless Manager JSON, Professional Wireless IAS
   ([tinySA#88](https://github.com/erikkaashoek/tinySA/issues/88)).
7. **Presets that never destroy work.** *"Applying a preset must never silently replace an
   existing grid"* — append or prompt, and show the resulting row count. And the band's **own
   saved template** may beat any shipped preset
   ([musicall#798](https://github.com/Cryde/musicall/issues/798)).
8. **Rename safely.** Renaming machines and channels must update the affected subscriptions
   rather than dropping the patch
   ([DCE](https://raw.githubusercontent.com/Mamat79/Dante-Config-Editor/main/README.md)).
9. **Validate before export.** A pre-export assistant with **blocking errors** and
   **confirmable warnings**, plus a **patch comparison** report and a **synoptic diagram**
   (PDF/SVG) of the patch (same source).
10. **Print properly.** Browser-native print with live preview, page size control, background
    and icon toggles, so plots can be assembled into a documentation packet
    ([sounddocs#121](https://github.com/SoundDocs/sounddocs/issues/121)).
11. **Read-only sharing for logged-in users**, and **sortable channels**
    ([sounddocs#113](https://github.com/SoundDocs/sounddocs/issues/113),
    [#112](https://github.com/SoundDocs/sounddocs/issues/112)).
12. **Riders that are versioned, confirmed and shareable** rather than mailed as PDFs
    ([Jovie#14998](https://github.com/search?q=%22tech+rider%22+venue+advance+PDF&type=issues)).
13. **One-press changeover.** Switch Record/Play mode and re-source channels (local ↔ card ↔
    AES50) from a button, for virtual soundcheck and festival changeovers
    ([companion-module-behringer-x32#88](https://github.com/bitfocus/companion-module-behringer-x32/issues/88)).
14. **Offline, account-free, one page.** *"No accounts, no logins, no nonsense… No network
    dependency after load"*, producing an auto-generated input list, an auto-generated monitor
    mix list, and a one-page printable plot
    ([petesimple/stageplot](https://raw.githubusercontent.com/petesimple/stageplot/main/README.md)).

---

## Implications for AV Planner Suite

Ranked by directness, and deliberately conservative where the evidence is thin.

### 1. The input list is not a table — it is a projection, and that is the product

[LOCAL] `cable-planner` already models the hard half: patchbays with normalling and tie-lines
(#368), multicore/snake/loom as one physical cable carrying many logical signals (#363),
Dante/AES67/MADI as signal standards (#347), audio device properties including microphone
characteristic and phantom power (#383), and it shipped an **Audio input list / stage plot
deliverable** with exactly the right field list — *channel no., instrument/source, mic/DI type,
stand, phantom, stagebox/splitter port, desk channel, note*, exported as CSV/PDF
([cable-planner#353](https://github.com/larszu/cable-planner/issues/353), closed 2026-06-01).

The research says the *next* step is not more fields, it is **projections of one dataset**:

- the **band-facing** view (channel, source, mic, monitor mix),
- the **venue-facing** view — [FACT] **port, not channel number**
  ([bandregie#82](https://github.com/computi71/bandregie/issues/82)),
- the **monitor** view (mix per performer) — [FACT] a genuinely separate document
  ([petesimple/stageplot](https://raw.githubusercontent.com/petesimple/stageplot/main/README.md)),
- the **stage** view (the plot),
- the **console** view (scene channel names).

[FACT] And **stagebox input ≠ microphone** must be two fields in the schema, or an import will
one day overwrite the other ([bandregie#81](https://github.com/computi71/bandregie/issues/81)).
That is a concrete, cheap schema decision to take now.

### 2. Console scene import is the highest-value integration nobody has shipped

[FACT] The format is parseable and documented by a practitioner: X32/M32 scene files carry
`/ch/NN/config "Name"`, and the WING emits the same
([bandregie#11](https://github.com/computi71/bandregie/issues/11)). [INFERENCE] This is a
one-afternoon parser that converts the suite from "another place to type the input list" into
"the place that reads the input list you already have". The requested extras — **store per
event** and **diff between uploads** — are the difference between an import and a workflow: the
diff is exactly the *rehearsal-to-show change log* that today exists only in someone's head.

Suggested scope, in evidence order: X32/M32/WING scene (attested), then Mixing Station's
canonical model as a cross-console abstraction (see `zarfld/MixingStation-API-Client`, whose
`CanonicalModel` requirement issue I found but whose README I could not read — **unverified**),
then vendor session files as they become documented.

### 3. RF coordination: be the plan, not the coordinator

[LOCAL] `cable-planner#344` already scopes RF coordination (intermod-free sets, minimum spacing
such as mics ↔ IEM ≥ 4 MHz, occupied TV channels, conflict warnings, CSV export, optional
Workbench/WSM/Wireless Manager interchange), closed 2026-06-01.

[FACT] The research sharpens the priority: the *coordination maths* is being commoditised
(`intermod-checker`, created 2026-08), while the *interchange* is broken in both directions —
scans do not import into the vendor tools
([tinySA#88](https://github.com/erikkaashoek/tinySA/issues/88)) and plans do not export into
them ([sounddocs#24](https://github.com/SoundDocs/sounddocs/issues/24)). **Owning the RF plan as
a document that speaks WWB/WSM/Wireless Manager/IAS is worth more than owning the solver**, and
is defensible even if a vendor improves their solver tomorrow.

The RF plan must also carry the columns that make it a *show* document, not a spectrum document:
[SECOND-HAND] channel name, **performer/position**, pack type, frequency
([`workflow-chain.md`](../workflow-chain.md) row 10). That is the join to the mic tracker.

### 4. Mic assignment tracking is an unserved, daily-recurring job

[FACT] Two independent 2025–2026 tools converge on the same object: a **per-performer card with
a photograph, a pack, a frequency and settings**, organised by **session and day**
([ShowStack#68](https://github.com/chazw661/ShowStack/issues/68),
[#64](https://github.com/chazw661/ShowStack/issues/64); SoundDocs Mic Plot Designer). Nothing in
the suite models a *person* today.

[INFERENCE] This is the one audio artefact that recurs **per performance** rather than per
production, which makes it the highest-frequency touchpoint available in this department — and
it joins naturally to three things the suite already has or plans: the RF plan (frequency), the
equipment library (pack, capsule) and the intercom plan (beltpack).

### 5. Comms/IFB: the suite is already better positioned here than the market

[SECOND-HAND, corpus] There is **no interchange format for an intercom plan from any vendor**,
and the products are runtime tools that assume the plan exists elsewhere
([`landscape/intercom.md`](../landscape/intercom.md), gaps 1–2). [LOCAL] `Broadcast-intercom`
exists, `cable-planner#56` already asks to show assigned Green-GO beltpack names, and
`cable-planner` holds the venue geometry that antenna planning needs (gap 4).

[FACT] Both practitioner documentation tools ship a comms module with **beltpack assignment +
frequency coordination in one place** (SoundDocs Comms Planner; ShowStack COMM Beltpacks) — which
suggests the right product boundary is not "comms" and "RF" as separate features but **one
wireless plan** covering mics, IEMs and beltpacks, since they share spectrum, share antennas and
share the person wearing them.

### 6. Dante patch documentation is a real, unmet, adjacent need — but check the boundary

[PATTERN] Eight independent tools, six of them current, all doing pieces of: offline editing,
safe renaming, project merge, validation before export, patch comparison, readable reports,
synoptic diagrams. [FACT] The most complete of them
([DCE](https://raw.githubusercontent.com/Mamat79/Dante-Config-Editor/main/README.md)) is one
month old and ships **57 hardware-validated device models**.

[INFERENCE] The suite should probably **not** try to be a Dante controller. But *"import a Dante
Controller XML preset and render it as a documented, diffable patch inside the plan"* is squarely
in the suite's existing competence (it already models AoIP signal types and patchbays), solves
the documentation half rather than the control half, and requires no network access at all —
which fits the offline-first posture.

### 7. Print is a feature, not an afterthought

[FACT] Two independent 2026 issues about print quality on documents that are otherwise
digital-first ([sounddocs#121](https://github.com/SoundDocs/sounddocs/issues/121);
[musicall#803](https://github.com/Cryde/musicall/issues/803) — 44 rows spanning pages, repeating
header, colour chips preserved). [LOCAL] `cable-planner` already has a `print:*` IPC domain; the
research says the requirement is **one-page-per-artefact, packet-assemblable, with paper size,
colour mode and icon toggles** — and that the colour coding by group must survive the print.

### 8. Two warnings from the evidence

- [FACT] **Do not ship confident console-routing presets.** *"A wrong preset is worse than no
  preset"*, because routing varies by firmware and venue; every preset needs a documented source
  ([musicall#798](https://github.com/Cryde/musicall/issues/798)).
- [FACT] **Never let an import or a preset silently overwrite hand-entered data.** Both attested
  failures in this dossier (the WING import overwriting the microphone column; the preset
  replacing the grid) are of this exact shape
  ([bandregie#81](https://github.com/computi71/bandregie/issues/81),
  [musicall#798](https://github.com/Cryde/musicall/issues/798)). The suite's `healProjectPositions`
  migration layer is the right place to enforce "new field, default value, never clobber".

---

## Confidence and what to re-run first

| Finding | Confidence | Why |
| --- | --- | --- |
| Input-list double entry across rider / house list / console | **High** | Four independent sources, two of them practitioner-filed |
| Stagebox input vs microphone, port vs channel number | **High** | Precisely stated, filed as bugs, 2026 |
| Console scene files are parseable and nobody bridges them to paperwork | **High** | Format named; the bridge exists only as a request |
| Dante documentation/renaming gap | **High** | Eight independent implementations |
| RF interchange broken in both directions | **High** | Three independent sources |
| Mic assignment tracking unserved | **Medium** | Two tools only; no forum layer to confirm breadth |
| Print/packet assembly matters | **Medium** | Two sources, both from tool users |
| Paper RF sheet, WhatsApp changes, Excel input lists | **Medium** | [SECOND-HAND] from the corpus; strongly plausible, not re-verified here |
| Anything about German-market specifics (VPLT, Veranstaltungstechnik practice) | **Low / absent** | Every German source was blocked. **Re-run this first when search is available.** |
| Broadcast A1 specifics (mix-minus, commentary, IFB workload) | **Low** | Reachable only through the corpus's intercom dossier; no primary broadcast-audio source was fetchable |
| Console-vendor session-file formats beyond X32/WING | **Unverified** | Named nowhere I could read |

When search access returns, the highest-value re-runs are, in order: (1) r/livesound and
ProSoundWeb on input lists, patch sheets and advancing; (2) German
Veranstaltungstechnik/production-partner.de on the same; (3) broadcast A1 workflow sources for
IFB/mix-minus/commentary; (4) Wireless Workbench and Sennheiser WSM user complaints, which are
entirely absent here except by inference from what people ask other tools to export.

---

## Sources

Every URL opened in this session, grouped. Pages marked *(second-hand)* were **not** reachable
here and are cited only as the provenance of a claim carried by the existing corpus.

### Practitioner documentation tools (primary — read this session)

- https://github.com/SoundDocs/sounddocs
- https://raw.githubusercontent.com/SoundDocs/sounddocs/main/README.md
- https://github.com/SoundDocs/sounddocs/issues?q=is%3Aissue
- https://github.com/SoundDocs/sounddocs/issues/24
- https://github.com/SoundDocs/sounddocs/issues/111
- https://github.com/SoundDocs/sounddocs/issues/121
- https://github.com/chazw661/ShowStack/issues?q=is%3Aissue
- https://github.com/chazw661/ShowStack/issues/64
- https://github.com/chazw661/ShowStack/issues/68
- https://github.com/chazw661/ShowStack

### Riders, input lists, stage plots

- https://github.com/Cryde/musicall/issues/776
- https://github.com/Cryde/musicall/issues/798
- https://github.com/search?q=repo%3ACryde%2Fmusicall+rider&type=issues (surfaced #775, #782, #787, #790, #803, #838, #839, #840)
- https://github.com/computi71/bandregie/issues/11
- https://github.com/computi71/bandregie/issues/12
- https://github.com/computi71/bandregie/issues/81
- https://github.com/computi71/bandregie/issues/82
- https://github.com/computi71/bandregie/issues?q=is%3Aissue
- https://github.com/search?q=repo%3Acomputi71%2Fbandregie+rider+OR+Stageplot+OR+Inputliste+OR+Funkstrecke&type=issues (surfaced #16, #28, #37, #84, #140, #163)
- https://raw.githubusercontent.com/petesimple/stageplot/main/README.md
- https://raw.githubusercontent.com/Chiunownow/StagePlotPirate/main/README.md
- GitHub repository search `stageplot in:name` — 21 repositories, 2016–2026 (enumerated via the GitHub search API)

### Dante / audio-over-IP

- https://raw.githubusercontent.com/Mamat79/Dante-Config-Editor/main/README.md
- https://raw.githubusercontent.com/chris-ritsen/network-audio-controller/master/README.md
- https://github.com/chris-ritsen/network-audio-controller/issues/11
- https://raw.githubusercontent.com/domtrotta/Dante-XML-Converter/main/README.md
- https://raw.githubusercontent.com/Slendy/DanteLogger/main/README.md
- https://github.com/stanelie/netaudio-controller
- https://github.com/didierbergeron/dante-offline-editor
- https://github.com/TimoteusRuotsalainen/DanteOfflineEditor
- https://github.com/willell/dante-web-controller
- https://github.com/featherbear/dante-controller-autologin
- https://github.com/dronenb/DanteLabels2Reaper
- https://raw.githubusercontent.com/misnow1/vunet-dante-combiner-2000/main/README.md
- https://github.com/misnow1/vunet-dante-combiner-2000/issues
- https://github.com/search?q=%22Dante+Controller%22+workflow&type=issues
- https://github.com/search?q=%22device+name%22+Dante+label+rename&type=issues
- https://github.com/search?q=dante+patch+documentation&type=repositories

### RF / wireless coordination

- https://github.com/erikkaashoek/tinySA/issues/88
- https://github.com/matej-hron/intermod-checker
- https://raw.githubusercontent.com/matej-hron/intermod-checker/main/README.md
- https://github.com/bitfocus/companion-module-shure-wireless/issues?q=is%3Aissue
- https://github.com/search?q=%22Wireless+Workbench%22&type=issues (surfaced companion-module-requests#2063, QtTinySA#46, sounddocs#24, cable-planner#344)
- https://github.com/search?q=%22frequency+coordination%22+wireless+microphone&type=issues

### Consoles, control surfaces, virtual soundcheck

- https://github.com/bitfocus/companion-module-behringer-x32/issues/88
- https://github.com/search?q=%22virtual+soundcheck%22&type=issues (surfaced sound-buddy#872/#895, x32-physical#18, companion-module-requests#1938)
- https://github.com/search?q=%22scribble+strip%22&type=issues (surfaced companion-module-allenheath-sq#124, OpenMixerControl#10/#28, xtouch-wing#16)
- https://github.com/OpenMixerProject/OpenMixerControl/issues?q=is%3Aissue
- https://github.com/search?q=repo%3Abitfocus%2Fcompanion-module-requests+dante+OR+audinate+OR+%22audio+console%22&type=issues (surfaced #708, #1113, #1556, #1614, #1723, #2007, #2020)

### Racks, patch lists, comms

- https://github.com/RackulaLives/Rackula/discussions/1529
- https://github.com/search?q=%22patch+list%22+spreadsheet+OR+Excel+audio&type=issues (surfaced Rackula#1928, #1940)
- https://github.com/search?q=%22beltpack%22+assignment+OR+%22comms+plan%22&type=issues (surfaced ShowStack#66/#68, companion-module-requests#364/#1535/#1614, burlexpo/gbe10#11, cable-planner#56)
- https://github.com/search?q=%22mix-minus%22+OR+%22mix+minus%22+IFB&type=issues (no usable results — term collides with Linux networking)

### Search passes that shaped the frequency grades

- https://github.com/search?q=%22input+list%22+%22stage+plot%22&type=issues
- https://github.com/search?q=%22input+list%22+phantom+mic&type=issues
- https://github.com/search?q=%22monitor+mix%22+%22input+list%22&type=issues
- https://github.com/search?q=%22patch+sheet%22+audio&type=issues (no usable results)
- https://github.com/search?q=%22channel+list%22+%22console%22+CSV+import&type=issues (no usable results)
- https://github.com/search?q=%22monitor+engineer%22+OR+%22FOH+engineer%22&type=issues
- https://github.com/search?q=%22Funkstrecke%22+OR+%22Kanalliste%22+OR+%22B%C3%BChnenplan%22&type=issues
- https://github.com/search?q=%22soundcheck%22+%22input+list%22+OR+%22patch%22+live+sound&type=issues
- https://github.com/search?q=%22tech+rider%22+venue+advance+PDF&type=issues
- https://github.com/search?q=%22mic+plot%22+OR+%22microphone+plot%22+theatre+OR+theater&type=issues (no usable results)
- https://github.com/search?q=festival+changeover+%22patch%22+audio+stage&type=issues (no usable results)

### Own repositories (context, not independent demand)

- https://github.com/larszu/cable-planner/issues/353 — Audio input list / stage plot deliverable
- https://github.com/larszu/cable-planner/issues/344 — RF/frequency coordination
- https://github.com/larszu/cable-planner/issues/56 — Green-GO beltpack names
- Local corpus: [`workflow-chain.md`](../workflow-chain.md) (row 10 "Audio", rows 7, 11, 15, 16;
  break #10), [`landscape/intercom.md`](../landscape/intercom.md) (gaps 1–10),
  [`METHOD.md`](../METHOD.md)

### Cited by the corpus, **not reachable this session** (second-hand)

- https://gearspace.com/board/live-sound/1151562-tech-spec-channel-list-stage-plot-tech-rider-differences.html
- https://stageplotpro.app/guides/band-technical-rider-template
- https://www.riderforge.app/how-to-create-tech-rider.html
- https://www.shure.com/en-US/insights/all-about-wireless-system-planning-coordination-and-monitoring
- https://www.rfvenue.com/blog/2017/03/31/why-you-should-use-frequency-coordination-software-every-time (2017 — dated)
- https://www.prosoundweb.com/avoiding-intermod-the-importance-of-wireless-frequency-coordination/
- https://meyerproinc.com/wireless-mic-frequency-planning/ (one-page paper RF sheet)
- https://www.freqcoord.com/
- https://www.prosoundweb.com/the-art-of-saving-showfiles-total-recall-for-a-better-workflow-to-avoid-embarrassment/
- https://livehelp.solidstatelogic.com/Help/DanteSetup.html
- https://ankitkujur.com/templates/patch-list-template-spreadsheet/ (patch-list spreadsheet template)
- https://tourmanager.info/advancing-shows/
