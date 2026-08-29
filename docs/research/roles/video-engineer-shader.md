# Video Engineers / Bildtechniker (shading, CCU, paint)

Research dossier for AV Planner Suite. Compiled 2026-08-28.

> **Method and evidence caveat — read this first.**
>
> This session started with its `WebSearch` budget already exhausted (200/200 calls used
> before the first query), and the network egress proxy refused every destination except
> `github.com`, `raw.githubusercontent.com` and `gitlab.com`. Reddit, ProSoundWeb, Blue Room,
> Control Booth, film-tv-video.de, production-partner.de, TVBEurope, Broadcast Bridge,
> NewscastStudio, the Blackmagic forum, YouTube, `web.archive.org` and every German-language
> source returned `EGRESS_BLOCKED` or an outright fetch refusal. Search-engine gateways
> (DuckDuckGo, Mojeek, `r.jina.ai`, HN Algolia) are blocked as well.
>
> The consequence: **the practitioner-venting layer that would normally carry this role is
> absent.** What follows is built on three legs, and every claim is labelled with which leg
> it stands on:
>
> 1. **[FACT — read in full this session]** — GitHub issues, READMEs and module documentation
>    that I opened and read in this session. These are dated, attributable, and often written
>    by working practitioners describing their own shows. This is the strongest layer and it is
>    where the fresh findings come from.
> 2. **[LOCAL]** — repositories present in this workspace (`sony-camera-bridge`,
>    `multicam-planner`, `cable-planner`), including a verified per-protocol capability table.
>    Primary and checkable, but authored by the product owner, so it is context, not
>    independent user demand.
> 3. **[SECOND-HAND]** — claims quoted by the sibling dossier
>    [`roles/camera-operator.md`](./camera-operator.md) and
>    [`workflow-chain.md`](../workflow-chain.md), collected in an earlier session that had
>    search access. I could **not** re-open those pages here. The URL is given so the claim can
>    be re-verified, but in this session it is second-hand and marked as such.
>
> Anything that is my own reasoning is marked **[INFERENCE]**. Anything I could not establish
> is marked **unverified** rather than quietly dropped. Frequency grades are deliberately
> conservative: with the forum layer missing, almost nothing can honestly be graded
> `widespread` on this pass, and several findings that are probably widespread are graded
> `recurring` because I could only reach two or three independent sources.

---

## Who they are / where they sit in the production

The role has three names and one job: **Bildtechniker** (DE), **video engineer** / **vision
engineer** (UK/US broadcast), **shader** (US live/sports slang, also "racks" or "camera
control"). The job is to make several cameras look like one camera, to keep exposure and
black level correct while the light changes underneath them, and — in most small and mid-size
houses — to own the camera signal path as well.

[SECOND-HAND] The canonical description is that "the vision engineer works with the camera
operator to adjust settings on both the camera and the CCU in tandem", with the goal of making
all cameras match in colour, brightness, contrast and overall look
([TV Tech, camera shading basics](https://www.tvtechnology.com/opinions/camera-shading-basics),
quoted in `camera-operator.md`; not re-fetched here). The result of that work is a **scene
file** — "a method of recording the operational settings on a digital camera… removed from the
camera with the stored values and then loaded back"
([Basic Betacam Camerawork ch. 47](https://www.oreilly.com/library/view/basic-betacam-camerawork/9780240516042/xhtml/chapter47.html),
same caveat).

The important structural fact about the role, and the one everything below follows from:

> [LOCAL + FACT] **The shader's working output — the paint — is the only major production
> artefact that lives nowhere but inside a device.** The suite's own workflow analysis lists
> "Camera control: CCU number, RCP assignment, shading order" as artefact #23 of the ~30 that
> one camera touches, and records its format as **"Set at the device"** — the only row in that
> table with no file, no export and no document
> ([`workflow-chain.md`](../workflow-chain.md), item 23).

Three populations, with materially different pain. They are not interchangeable and a product
that serves one may be irrelevant to the others.

**1. OB / big broadcast (Sony HDC/HXC, Grass Valley LDX, Ikegami).** One RCP or OCP per camera
in front of the shader, an MSU/master panel for fleet-wide operations, base stations in the
truck, SMPTE fibre to the head. The control protocols here are closed. [LOCAL] Sony's 700
protocol — the protocol between RCP/CNA-1 and a Sony CCU — is **NDA-only**: the
`sony-camera-bridge` capability table disables auto-white and auto-black balance on the Sony
CCU backend outright because "no public source documents those auto-setup command codes"
(`packages/web-rcp/src/capabilities.ts`, comment on the `tcp` row). [FACT] The only public
reverse-engineering I could find is
[`DelphiForBroadcasting/sony-700ptp-protocol`](https://github.com/DelphiForBroadcasting/sony-700ptp-protocol),
a Delphi project offering a "Sony RCP-1500 Emulator" and a "Sony CNA-1 Emulator" — i.e. framing
and paint, not the full command set. [FACT] Searching GitHub for an open implementation of
Grass Valley **C2IP** or of any Ikegami CCU protocol returns nothing relevant (searches for
`c2ip` and `ikegami` return a DMX mapper, an FFXIV overlay and unrelated personal repos).
[INFERENCE] Paint data at this tier is therefore *structurally* trapped: even a shop that wants
to export its own camera settings has no documented way to do it.

**2. Mid-market live / streaming / house of worship / corporate.** ATEM or vMix, Blackmagic
cameras or a PTZ fleet, a laptop, Bitfocus Companion, sometimes an ATEM Camera Control Panel or
a Micro Panel. This tier is loud on GitHub and is where all the fresh evidence below comes from.
The defining constraint here is the opposite of tier 1: the protocols are open enough to
control, but **not to read back**.

**3. The hybrid that is growing fastest: cinema cameras in live shows.** [FACT] A Companion
module request from 6 Sep 2025 asks for Sony Camera Remote SDK support so that FX6/FX30/Z200
bodies can be given "ISO/Gain, Iris, Shutter, Zoom, White Balance and other standard CCU
controls", because these are "popular cameras… on live streams"
([`companion-module-requests#1936`](https://github.com/bitfocus/companion-module-requests/issues/1936),
open as of this session). These bodies have no CCU, no RCP, no return video and no tally by
default — the shader inherits them anyway.

---

## A day in the life

Chronological. Evidence labels per step; several steps are [INFERENCE] built on the
artefact-level facts in `workflow-chain.md` rather than on an observed shift, and are marked.

### Prep (days before, or the morning of)

- **Find last time's settings.** [SECOND-HAND] "Which scene file belongs to which position on
  which show is, in most shops, institutional memory" (`camera-operator.md`, rehearsal section).
  There is no evidence of any standard naming, versioning or index for scene/paint files.
- **Discover the fleet.** [FACT] Mixed fleets are the norm, not the exception: one practitioner
  asking for a single shading surface lists what he needs it to drive as "Sony Visca, Blackmagic
  cameras, Panasonic PTZ, Sony FX6, etc..."
  ([`companion-module-requests#1947`](https://github.com/bitfocus/companion-module-requests/issues/1947),
  30 Sep 2025). Four vendors, four protocols, four control apps, in one show.
- **Capability roulette even inside one vendor line.** [FACT] The Panasonic Companion module's
  own documentation warns: *"Not all models support all actions, variables and feedbacks. The
  lists below cover the full feature set; the module auto-sorts them so that only the entries
  that work with your connected model are offered."*
  ([`companion-module-panasonic-cameras` HELP.md](https://raw.githubusercontent.com/bitfocus/companion-module-panasonic-cameras/main/companion/HELP.md)).
  [FACT] The failure is concrete: on an AW-UE150A "image-color temperature increase/decrease
  not working" ([issue #83](https://github.com/bitfocus/companion-module-panasonic-cameras/issues/83),
  closed 10 Aug 2026); on an AW-UE160, red and blue gain neither feed back nor respond to a
  rotary encoder ([issue #56](https://github.com/bitfocus/companion-module-panasonic-cameras/issues/56),
  opened 10 Feb 2026, **closed as "not planned"** 14 Jul 2026). Two adjacent models of one
  vendor's own PTZ line, two different paint gaps.

### Load-in

- **Numbering, six times.** [SECOND-HAND/FACT] Camera identity has to agree across the camera
  plan, the cable schedule, the router source list, the multiviewer window labels, the tally/UMD
  map, the switcher input names, the CCU/RCP assignment and the ISO record map — the
  workflow-chain table records that "a renamed source has to be corrected in the drawing, the
  router, the MV, the tally and the comms panel labels — five places, no link between them"
  (`workflow-chain.md`, station 7), and that camera numbering is "re-typed into CCU, MV and
  record map" (station 8).
- **Fibre and base stations.** [SECOND-HAND] One SMPTE cable carries "program video and audio,
  return video, intercom audio, tally signals, remote control commands and power"
  ([Church Production / Hitachi, sponsored](https://www.churchproduction.com/sponsored/hitachi/smpte-fiber-cabling-simplifies-camera-infrastructures-and-op/),
  via `camera-operator.md`) — so a single connector fault presents simultaneously as a picture
  problem, a comms problem and a tally problem, and the shader is usually the person who has to
  decide which it is.

### Line-up (the hour that decides the show)

- Bars out, black balance, white balance on a card or chart, match every camera to a chosen
  reference, then walk the fleet through the lighting states.
- **On a large part of the mid-market fleet the panel cannot see the camera.** [FACT] The
  clearest documented statement of this comes from an open-source CCU built in 2026:
  *"The Blackmagic SDI protocol is write-only — parameters can be sent to cameras but not read
  back"*, therefore *"The system cannot query current camera settings; it only knows values that
  were set through TallyCCU Pro"*
  ([`fiverecords/TallyCCUPro` README](https://raw.githubusercontent.com/fiverecords/TallyCCUPro/main/README.md);
  repo created 12 Jan 2026, last updated 5 May 2026). [INFERENCE] Every shading decision on
  such a rig is therefore made against a *model* of the camera, not the camera; power-cycle a
  camera, swap a body, or let someone touch the camera's own menu, and the model is silently
  wrong.

### Rehearsal

- **Match under changing light, then try to keep it.** [FACT] Storage is minimal and local:
  TallyCCU Pro's entire preset system is *"5 presets per camera stored on SD card"* (same
  README). [INFERENCE] Five unlabelled slots on an SD card in a box on a rack is the whole
  "paint file management" story for that class of system — no show name, no date, no lighting
  state, no export.
- **Values that lie.** [FACT] On the ATEM path, a practitioner reports that four camera-control
  variables — `gain_luma`, `lift_luma`, `gamma_luma`, `offset_luma` — return null, and that
  *"If i set lift_luma: 1, the Atem will show luma at 0.5"*
  ([`companion-module-bmd-atem#350`](https://github.com/bitfocus/companion-module-bmd-atem/issues/350),
  opened 19 Jan 2025 by rohanwright). The same report asks for incremental (nudge) actions for
  Gain/Lift/Offset/Luma, singling out Lift Luma — "Black Level" — as the parameter adjusted most
  often. [INFERENCE] A shader nudging black level by re-sending absolute values through a
  scale-mismatched path is the software equivalent of a panel with no detents.
- **Anyone touching the camera desynchronises the surface.** [FACT] *"I set a button that cycles
  through the ND filters. It will actually change the ND filter on the camera, but the variable I
  use in the button's text will never update until I do something else"*; the reporter also notes
  that parameters changed via the camera's own web controls do not trigger updates, and that
  tightening the poll interval from 3000 ms to 200 ms changed nothing
  ([`companion-module-canon-ptz#53`](https://github.com/bitfocus/companion-module-canon-ptz/issues/53),
  22 Nov 2024; later closed by PR #102).

### Show

- Ride iris; correct for lighting-state changes, LED-wall content and daylight drift; catch a
  camera that has drifted; handle a body swap live.
- **Identity confusion is a live risk in IP plants.** [FACT] A live-production team's own issue
  tracker records an outage where a network interface failure and an OBS restart *"reshuffled NDI
  ports"* so that receivers displayed incorrect scene labels
  ([`zbynekdrlik/camera-box#1180`](https://github.com/zbynekdrlik/camera-box/issues/1180),
  ~23 Aug 2026, filed P0). [INFERENCE] For the shader that is the worst class of error: the
  label says CAM 3, the picture is CAM 5, and the correction is applied to the wrong camera.
- **Nothing gets written down.** [SECOND-HAND] `workflow-chain.md` station 16: at show time
  "verbal on comms; nothing is written… a show-time change (a camera dies, a channel is
  repatched) is recovered by the operator and is invisible to every document."

### Load-out

- [SECOND-HAND] Station 14/17: changes are made in pen on printed plans and "nothing crosses
  back". [INFERENCE] For the shader specifically, three things die here: the final paint, the
  list of which body/lens/base-station/fibre actually ended up on which position, and the fault
  log ("cam 4 sparkles above +9 dB", "drum 12 fibre is intermittent when flexed").

### Post

- [SECOND-HAND] Next year's plan is rebuilt from the quote, not from what was built
  (`workflow-chain.md`, station 20) — so the line-up starts from zero again.
- **Handover to post is a known weak seam.** [SECOND-HAND] Good practice for multi-camera ingest
  is described as a bundle of "verified media report, camera and sound logs, folder manifest and
  production notes"
  ([Imagine Products](https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/),
  via `camera-operator.md`). [INFERENCE] "Camera logs" in that bundle means cards and
  timecode; the paint/gamma/matrix state that would let a colourist know why CAM 2 sits
  differently is not part of any handover artefact I found evidence for. **unverified**.

---

## Tools they actually use

The "how they feel" column is restricted to what is evidenced. Where I have no evidence of
sentiment I say so rather than inventing a mood.

| Tool | For what | How they feel about it |
| --- | --- | --- |
| Vendor RCP / OCP (Sony RCP-1000/1500, GV OCP, Ikegami OCP) | One panel per camera: iris, master black, gain, gamma, white/black balance, detail, matrix | No direct sentiment evidence found (**unverified**). [LOCAL] What is documented is the lock-in: the Sony 700 protocol is NDA-only, so nothing else can read or write that paint |
| Master control / MSU, Grass Valley **CCS-ONE** | Fleet-level control, RCP management, LDX camera setup | [FACT] A practitioner wants it opened up: a Companion module for CCS-ONE giving "basic camera shading controls", tally to cameras and RCPs, and **feedback when an RCP button is pressed** so a preview press can drive routing elsewhere ([`companion-module-requests#1918`](https://github.com/bitfocus/companion-module-requests/issues/1918); date not established in this session). The request itself is the verdict: the CCU world does not talk to the rest of the show system |
| ATEM Camera Control Panel / Blackmagic Micro Camera Panel | Shading BMD cameras; wanted as a generic CCU surface | [FACT] Asked for as a Companion device three separate times over three years — [#739](https://github.com/bitfocus/companion-module-requests/issues/739) (1 Mar 2022, stale), [#1792](https://github.com/bitfocus/companion-module-requests/issues/1792) (25 Feb 2025), [#1947](https://github.com/bitfocus/companion-module-requests/issues/1947) (30 Sep 2025). #1792 records the blocker: the panel "does not currently have a publicly available API or control protocol documentation" |
| Bitfocus Companion + Stream Deck (incl. SD+ rotaries) | The mid-market's improvised CCU | [FACT] Used for real paint work — a shader assigning Red Gain / Blue Gain to Stream Deck Plus rotaries ([panasonic-cameras#56](https://github.com/bitfocus/companion-module-panasonic-cameras/issues/56)). Frustration is documented at the variable layer: nulls, stale values, "not planned" closures |
| Camera's own menu / web UI (Canon, Panasonic, BMD) | The only place some parameters exist | [FACT] Changing something there desynchronises every control surface ([canon-ptz#53](https://github.com/bitfocus/companion-module-canon-ptz/issues/53)) |
| Vendor mobile/desktop remote apps (e.g. Panasonic **HC ROP**, Sony Monitor & Control) | Iris/gain/WB/focus on camcorders and cinema bodies | [FACT] Used *grudgingly* — the explicit ask is to get out of the app: "I would love it if companion could control the zoom, iris, gain, WB and focus of the Panasonic HC camera range", from a user who says he currently does this in the HC ROP iOS app ([`companion-module-requests#1001`](https://github.com/bitfocus/companion-module-requests/issues/1001), 19 Dec 2022; still open and marked stale as of this session) |
| Home-built CCU boxes (Arduino/SDI, Android/USB rigs) | Because the commercial answer costs too much or doesn't exist | [FACT] Two independent 2026 projects: [TallyCCUPro](https://github.com/fiverecords/TallyCCUPro) (Arduino + SDI + vMix tally, "full CCU control of Blackmagic cameras") and [`camera-box#808`](https://github.com/zbynekdrlik/camera-box/issues/808) (19 Jul 2026) folding a `bkshading` proof-of-concept into a live rig for "remote control of shading/grading settings", with the honest note *"MVP is not correctly designed (proof-of-concept) but WORKS — concept is confirmed"* |
| WFM / vectorscope, grey card, chip chart | Objective matching reference | No source reachable in this session. **unverified**, though [INFERENCE] the role is unimaginable without them |
| Notebook, Excel, WhatsApp | See the dedicated section below | Evidence is at the production level, not shader-specific — see caveats there |

---

## Time sinks (ranked, with evidence)

Ranked by (my estimate of) cost per production × frequency. [INFERENCE] on the ranking itself;
the individual items carry their own evidence.

### 1. Re-creating the line-up from scratch because paint state cannot be reliably read, stored or restored

- [FACT] Write-only control path on the Blackmagic SDI fleet: settings "cannot be read back",
  and the controller "only knows values that were set through" itself
  ([TallyCCUPro README](https://raw.githubusercontent.com/fiverecords/TallyCCUPro/main/README.md), 2026).
- [FACT] Null / non-updating paint variables on two other vendor paths
  ([bmd-atem#350](https://github.com/bitfocus/companion-module-bmd-atem/issues/350), Jan 2025;
  [panasonic-cameras#56](https://github.com/bitfocus/companion-module-panasonic-cameras/issues/56),
  Feb 2026, closed not-planned).
- [FACT] Storage where it exists is five unnamed slots on an SD card (same README).
- **Frequency: recurring** (three independent vendor paths, three different projects, 2025–2026).
  [INFERENCE] Probably `widespread` in the mid-market; I cannot grade it so without the forum
  layer. **Time cost: hours per show** — a full multi-camera line-up is the single largest block
  of pre-show engineering time in every account I have (**unverified** as a measured figure).

### 2. Typing the same camera identity into six to eight systems

- [SECOND-HAND] Camera numbering "re-typed into CCU, MV and record map"
  (`workflow-chain.md` station 8); a rename must be corrected in drawing, router, MV, tally and
  comms labels — "five places, no link between them" (station 7).
- **Frequency: widespread** (this is asserted as a structural property of the chain, not an
  anecdote). **Time cost: hours per project**, plus a permanent tail of mismatch bugs.

### 3. Hunting the right scene / paint file

- [SECOND-HAND] Which scene file belongs to which position on which show is "institutional
  memory" (`camera-operator.md`).
- [FACT] The device-side reality that makes this hard: unnamed preset slots, no export
  (TallyCCUPro); no readback to reconstruct what was actually loaded.
- **Frequency: recurring. Time cost: minutes to hours per show**, but the failure mode is worse
  than the time: loading last month's paint for a differently-lit room.

### 4. Multi-vendor fleets: one control surface per vendor

- [FACT] The ask, verbatim, for one panel to drive "Sony Visca, Blackmagic cameras, Panasonic
  PTZ, Sony FX6, etc..." — *"It is needed to do shading as a CCU"*
  ([#1947](https://github.com/bitfocus/companion-module-requests/issues/1947), Sep 2025).
- [FACT] Cinema bodies arriving in live shows with no CCU concept at all
  ([#1936](https://github.com/bitfocus/companion-module-requests/issues/1936), Sep 2025).
- [LOCAL] The capability spread is real and asymmetric — the `sony-camera-bridge` truth table
  gives a Panasonic AW PTZ only `iris`, `bars`, `focus`, a VISCA head `iris`, `gain`, `awb`,
  `focus`, while a Blackmagic body exposes the full colour-correction set
  (`packages/web-rcp/src/capabilities.ts`). Matching a fleet whose members expose different
  controls is not a UI problem, it is a physics problem.
- **Frequency: recurring. Time cost: hours per show** [INFERENCE].

### 5. Chasing faults down the camera cable

- [SECOND-HAND] One SMPTE/fibre run carries video, return video, comms, tally, control and power
  ([Church Production/Hitachi](https://www.churchproduction.com/sponsored/hitachi/smpte-fiber-cabling-simplifies-camera-infrastructures-and-op/),
  via `camera-operator.md`), and fibre has a real handling limit — "100–150 mm minimum bend
  radius… roughly 10–15× the outer diameter"
  ([Production Distro](https://productiondistro.com/blog/smpte-fiber-cable-guide/), same caveat).
- **Frequency: recurring. Time cost: minutes to hours**, always at the worst moment.
  [INFERENCE] The specific waste is that the fault history of a given drum or connector exists
  only in the crew's heads, so the same bad drum is deployed again next month.

### 6. Shift and show handover

- [FACT] Even the *machine's* state is hard to hand over: a live team's issue for replacing the
  production notebook enumerates what must be restored — "OBS profiles+scene collections,
  `~/.camera-box`, systemd user units, /opt/obs-genlock markers, netplan, /usr/local/bin
  hand-deploys, dpkg package list, enabled-units listing"
  ([`camera-box#1162`](https://github.com/zbynekdrlik/camera-box/issues/1162), 21 Aug 2026).
  [INFERENCE] If restoring one laptop needs an eight-item checklist written by the person who
  built it, handing a shading position to the next shift with no artefact at all is not a
  process, it is a hope.
- **Frequency: recurring** (inferred). **Time cost: minutes to hours per handover.**

---

## Double data entry

What a shader (or the systems engineer next to them) types more than once. Sources as noted;
[INFERENCE] where the second and third destination is reconstructed from the artefact table
rather than observed.

| Data | Entered in | Entered again in | Evidence |
| --- | --- | --- | --- |
| Camera number / name / position | Camera plan (CAD), cable schedule | CCU/base-station label, RCP assignment, router source list, MV window label, tally/UMD map, switcher input name, ISO record map | [SECOND-HAND] `workflow-chain.md` stations 7–8, artefacts 19–23, 27 |
| Paint values (iris, black, gain, gamma, WB, matrix) | The panel / camera | A notebook or phone photo, then re-dialled next show | [FACT] no export path on write-only fleets (TallyCCUPro); [FACT] unnamed 5-slot storage; [SECOND-HAND] scene-file identity is "institutional memory" |
| Camera↔control mapping (which camera is on which RCP/panel page/Companion page) | Companion page or panel layout | The MV layout and the tally map, again | [FACT] #1918 asks for RCP button presses to be able to drive routing — i.e. today the mapping is duplicated, not shared |
| Which physical body/lens/base station is on which position | Rental/pick list | The camera plan, then verbally on site, then never written back | [SECOND-HAND] `workflow-chain.md` stations 12, 14, 20 |
| ND/shutter/gain/WB per lighting state | The camera menu (some parameters only exist there) | The control surface, which cannot see it | [FACT] [canon-ptz#53](https://github.com/bitfocus/companion-module-canon-ptz/issues/53) |
| Fault notes | Notebook / WhatsApp | (usually nowhere) | [INFERENCE], **unverified** |

---

## Error sources

| Error | Mechanism | Consequence | Evidence / frequency |
| --- | --- | --- | --- |
| **The panel shows a value the camera does not have** | Write-only control path; the surface displays its own last command | Shading is done blind; after a power cycle, body swap or menu touch the numbers are fiction; a camera can go to air visibly mismatched | [FACT] TallyCCUPro README (2026); *recurring* |
| **Scaling mismatch between surface and device** | "If i set lift_luma: 1, the Atem will show luma at 0.5" | Black level lands at half the intended value; the shader compensates by feel and the recorded number is meaningless | [FACT] [bmd-atem#350](https://github.com/bitfocus/companion-module-bmd-atem/issues/350) (Jan 2025); *isolated*, but structurally alarming |
| **Someone changes a parameter on the camera itself** | Camera web UI / menu changes do not push state; polling does not help | Two sources of truth; the next recall silently reverts a deliberate correction | [FACT] [canon-ptz#53](https://github.com/bitfocus/companion-module-canon-ptz/issues/53) (Nov 2024, fixed in that module); *recurring* pattern across modules |
| **Model-dependent capability inside one vendor line** | The action exists in the software, the model ignores it | A control appears to work and does nothing; discovered mid-rehearsal | [FACT] Panasonic HELP.md caveat + [#83](https://github.com/bitfocus/companion-module-panasonic-cameras/issues/83) + [#56](https://github.com/bitfocus/companion-module-panasonic-cameras/issues/56); *recurring* |
| **Shading the wrong camera** | Source identity drifts in IP plants (NDI port reshuffle after a restart → wrong scene labels on receivers) | Correction applied to a camera that was fine; the mismatched one stays mismatched | [FACT] [camera-box#1180](https://github.com/zbynekdrlik/camera-box/issues/1180) (Aug 2026); *isolated* as evidenced, [INFERENCE] common in NDI/SDI-router plants |
| **Auto functions unavailable / unsafe on mixed rigs** | Auto white/black balance command codes undocumented on closed protocols | The one-button rescue (ABB/AWB) that a shader relies on under time pressure is not available through third-party control | [LOCAL] `capabilities.ts` disables AWB/ABB on the Sony CCU backend for exactly this reason |
| **One cable, five symptoms** | SMPTE/fibre carries video, return, comms, tally, control, power | Diagnosis time is spent deciding which department owns the fault | [SECOND-HAND] Church Production/Hitachi via `camera-operator.md`; *recurring* |
| **Stale printed paperwork** | Plans printed before the last change | The shader works to a camera list that no longer matches the floor | [SECOND-HAND] `workflow-chain.md` stations 12–14 |

---

## Paper / Excel / WhatsApp inventory

Honesty note: the corpus evidence for paper/Excel/WhatsApp is production-level, from
`workflow-chain.md`. **Shader-specific** paper artefacts (the shading notebook, the paint sheet)
are the item I most wanted forum evidence for and could not get in this session. They are marked
**unverified [INFERENCE]** and should be confirmed by a single interview before any feature is
built on them.

**Paper**

- Printed camera plan / floor plan, marked up in pen at load-in — [SECOND-HAND, station 14:
  "printed plans on site, marked up in pen"].
- Printed cable schedule in the rack room, plus cable labels — [SECOND-HAND, station 7].
- Camera prep checklists published as PDFs to be printed and worked through — [SECOND-HAND,
  `workflow-chain.md` station 8].
- Running order / camera cards during the show — [SECOND-HAND, station 16].
- **The shading notebook**: per-camera paint values, "cam 4 needs +2 red", the lighting states
  and their settings, which drum is suspect. **unverified [INFERENCE]** — this is the artefact
  the brief asked about and the one I could not evidence.

**Excel**

- Camera / lens / accessory lists — [SECOND-HAND, station 8: "lens lists in Excel"].
- Cable schedules and patch lists — [SECOND-HAND, station 7: "Excel is the common carrier for
  patch lists"].
- IP / VLAN / device address sheets, which the shader needs when a base station or PTZ falls off
  the network — [SECOND-HAND, station 11: "Excel — dominant", "a late device addition means a
  free IP is invented on site and never written back"].
- **A camera-number ↔ CCU ↔ RCP ↔ MV window ↔ tally ↔ ISO mapping sheet.** [INFERENCE] this is
  the sheet the artefact table implies must exist somewhere; **unverified** as an observed
  document.

**WhatsApp / messaging**

- Position changes at load-in are verbal — [SECOND-HAND, station 8].
- Photos of the back of the rack and "where is the fibre drum" — [SECOND-HAND, station 14].
- Load-out queries ("who has the case for the long lens?") — [SECOND-HAND, station 17].
- [INFERENCE] For this role specifically: a phone photo of the RCP or of a camera menu page, sent
  to the next shift, is the most likely real handover format. **unverified.**

**E-mail**

- Running orders, revised plans and client PDFs; the classic failure of an old PDF circulating
  against a newer e-mail — [SECOND-HAND, station 10].

---

## Missing interfaces

Department handovers that break, ranked by how visible the break is on air.

1. **CCU/RCP → the rest of the show system.** [FACT] The single clearest statement: a request
   for CCS-ONE integration wants "feedback capability when RCP buttons are pressed, particularly
   the preview button, to trigger additional Companion actions like routing changes through
   other systems" ([#1918](https://github.com/bitfocus/companion-module-requests/issues/1918)).
   Today the camera-control world is an island; a shader pressing preview on an RCP cannot make
   a multiviewer or a router respond.
2. **Camera → control surface (state readback).** [FACT] Write-only protocols
   (TallyCCUPro), null variables (bmd-atem#350), no push on camera-side changes (canon-ptz#53),
   no feedback on paint parameters (panasonic-cameras#56).
3. **Shading → documentation / project file.** [SECOND-HAND] Camera control is the artefact
   whose crossing format is literally "Set at the device" (`workflow-chain.md` #23). Nothing the
   shader does ends up in the project record.
4. **Shift → shift.** [INFERENCE] No artefact exists to hand over: not the paint, not the fault
   list, not the camera↔panel mapping. The nearest evidenced analogue is the eight-item manual
   state-restoration checklist for one production laptop
   ([camera-box#1162](https://github.com/zbynekdrlik/camera-box/issues/1162)). **unverified.**
5. **Lighting → shading.** [SECOND-HAND] Rehearsal problems include "the room lighting fighting
   the image" ([DCE Productions](https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/),
   via `camera-operator.md`). [INFERENCE] There is no shared object between a lighting cue/state
   and a camera paint state, so "looks fine in state 3, green in state 7" is carried in a human
   head. **unverified** as a stated complaint of this role.
6. **Live → post.** [INFERENCE] Ingest handover bundles carry media reports and camera logs, not
   paint/gamma/matrix state. **unverified.**
7. **Rental/warehouse → shader.** [SECOND-HAND] A substitution made in the warehouse "is on the
   paper and not in the plan; the systems engineer finds out on site"
   (`workflow-chain.md` station 12) — for the shader that means a different body or base station
   than the paint was built for.

---

## What they would want (their own words, from the sources)

These are stated wishes I read this session, not my proposals. All from
`bitfocus/companion-module-requests` and module trackers, 2022–2026.

- **Store and recall shading presets across shows, and sync them across cameras.** Requested
  literally: "Store and recall camera shading presets for consistency across different
  productions" and "Synchronize settings across multiple cameras for uniform color grading"
  ([#1792](https://github.com/bitfocus/companion-module-requests/issues/1792), 25 Feb 2025).
- **One shading surface for a mixed fleet.** "Connect to Companion and be used to control any
  cameras (Sony Visca, Blackmagic cameras, Panasonic PTZ, Sony FX6, etc...). It is needed to do
  shading as a CCU" ([#1947](https://github.com/bitfocus/companion-module-requests/issues/1947),
  30 Sep 2025).
- **Standard CCU controls on cinema bodies.** "ISO/Gain, Iris, Shutter, Zoom, White Balance and
  other standard CCU controls… for remote controlling popular cameras such as Sony's FX6, FX6,
  FX30, Z200" ([#1936](https://github.com/bitfocus/companion-module-requests/issues/1936),
  6 Sep 2025).
- **Get out of the vendor's phone app.** "I would love it if companion could control the zoom,
  iris, gain, WB and focus of the Panasonic HC camera range" — replacing the HC ROP iOS app
  ([#1001](https://github.com/bitfocus/companion-module-requests/issues/1001), 19 Dec 2022,
  still open).
- **Make the CCU world drive the rest of the plant**: shading control, tally to cameras *and*
  RCPs, and RCP button feedback that can trigger routing
  ([#1918](https://github.com/bitfocus/companion-module-requests/issues/1918)).
- **Nudge, don't jump**: incremental actions for Gain/Lift/Offset/Luma, "particularly… Lift Luma
  (also called Black Level)… a frequently-adjusted parameter"
  ([bmd-atem#350](https://github.com/bitfocus/companion-module-bmd-atem/issues/350), Jan 2025).
- **Variables that tell the truth**, including when the change was made on the camera itself
  ([canon-ptz#53](https://github.com/bitfocus/companion-module-canon-ptz/issues/53)) and on paint
  parameters like red/blue gain
  ([panasonic-cameras#56](https://github.com/bitfocus/companion-module-panasonic-cameras/issues/56)).
- **Remote shading at all**, even if it has to be built by hand out of USB and an Android phone
  ([camera-box#808](https://github.com/zbynekdrlik/camera-box/issues/808), Jul 2026).

---

## Implications for AV Planner Suite

Ordered by (evidence strength × fit with what the suite already is). The suite's advantage here
is that it is a *planning and documentation* product with an existing camera bridge — it does not
have to win the control-surface fight to fix the shader's worst problem.

1. **Make the camera control map a first-class planning object.** One record per camera
   position carrying: camera number/name, body, lens, base station/CCU, RCP or panel page,
   fibre/SMPTE run and drum, tally number, MV window, router source, ISO record channel. Then
   *export* it into the systems that today are typed by hand. This attacks the best-evidenced,
   most structural waste in the chain (artefacts 19–23, 27 of `workflow-chain.md`) and it is
   squarely `cable-planner` + `multicam-planner` territory. Highest confidence recommendation in
   this dossier.

2. **A paint/scene-file registry, not a paint editor.** The device stores five unnamed slots;
   the suite should store the *identity* around them: show, date, venue, lighting state, camera
   position, body serial, who shaded it, which slot/file it lives in, and a free-text note.
   Even a registry that holds no values would beat "institutional memory". Where a protocol does
   allow reading values (Blackmagic REST, Panasonic CGI, VISCA inquiries — see the
   `sony-camera-bridge` capability table), store the values too, versioned per show.

3. **Never display a value the system has not confirmed.** Design the data model with an explicit
   `commanded` vs `confirmed` distinction, sourced from the capability table, and render
   unconfirmed values differently. This is the direct product answer to "the Blackmagic SDI
   protocol is write-only" and to null/stale variables in three other vendor paths. It is also a
   trust differentiator: every competing surface in the evidence lies about state at some point.

4. **Model per-model capability, not per-vendor.** `capabilitiesForMode` already does this by
   connection mode; the evidence (AW-UE150A colour temperature, AW-UE160 red/blue gain) says the
   granularity has to go down to the model. A planner that can say "this position's camera cannot
   do remote colour temperature" before the truck leaves is worth more than one that discovers it
   in rehearsal.

5. **Generate the handover document.** Show/shift report: final paint per camera (or "unread —
   protocol is write-only"), camera↔panel mapping, faults observed, which drum/fibre is suspect,
   what changed since the plan. This is the artefact that does not exist anywhere in the
   evidenced chain, and it is cheap for a documentation product to produce.

6. **Attach a fault history to the physical object.** `cable-planner` already models cables and
   drums; a per-drum/per-connector fault log turns "that fibre is dodgy" from crew folklore into
   data, and pays off in exactly the moment (mid-show) when the shader is guessing.

7. **Do not build a competing RCP for the closed tier.** Sony 700 is NDA-only and there is no
   public Grass Valley C2IP or Ikegami implementation on GitHub. The realistic play is:
   documentation and planning layer for tier 1, live bridge control for tiers 2 and 3 (which
   `sony-camera-bridge` already does), and an import/export path so paint that *can* be read is
   captured.

8. **Offline-first is not optional.** The truck and the gallery have no reliable internet, and
   the whole point of the artefact is to be available under pressure. This matches the existing
   architecture of `cable-planner`; do not regress it for a cloud sync feature.

9. **A lighting-state ↔ paint-state link is the speculative one.** It would be valuable
   ([INFERENCE]: it maps "looks green in state 7" onto an object shared with `light-planner`),
   but I found **no** direct user evidence for it in this session. Treat as a hypothesis to test
   in an interview, not a backlog item.

**Research debt this dossier leaves behind.** Before anything in section 2, 5 or 9 is built,
one pass with working search access should confirm (a) whether a shading notebook/paint sheet is
a real, common paper artefact, (b) how tier-1 shops actually name and archive scene files today,
(c) whether shift handover in OB/24-h operations has any existing written form, and (d) German
practice specifically — the entire German-language evidence layer is missing here.

---

## Sources

### Opened and read in this session (github.com / raw.githubusercontent.com only)

- https://github.com/fiverecords/TallyCCUPro
- https://raw.githubusercontent.com/fiverecords/TallyCCUPro/main/README.md
- https://github.com/bitfocus/companion-module-requests/issues/739
- https://github.com/bitfocus/companion-module-requests/issues/1001
- https://github.com/bitfocus/companion-module-requests/issues/1792
- https://github.com/bitfocus/companion-module-requests/issues/1918
- https://github.com/bitfocus/companion-module-requests/issues/1936
- https://github.com/bitfocus/companion-module-requests/issues/1947
- https://github.com/bitfocus/companion-module-bmd-atem/issues/350
- https://raw.githubusercontent.com/bitfocus/companion-module-bmd-atem/main/companion/HELP.md (no camera-control section present)
- https://github.com/bitfocus/companion-module-canon-ptz/issues/53
- https://github.com/bitfocus/companion-module-panasonic-cameras/issues/56
- https://github.com/bitfocus/companion-module-panasonic-cameras/issues (issue list, incl. #83, #92, #93)
- https://raw.githubusercontent.com/bitfocus/companion-module-panasonic-cameras/main/companion/HELP.md
- https://github.com/bitfocus/companion-module-bmd-cameras/issues
- https://github.com/bitfocus/companion/issues
- https://github.com/bitfocus/companion/discussions
- https://raw.githubusercontent.com/bitfocus/companion/main/README.md
- https://github.com/zbynekdrlik/camera-box/issues/808
- https://github.com/zbynekdrlik/camera-box/issues/1162
- https://raw.githubusercontent.com/DelphiForBroadcasting/sony-700ptp-protocol/master/README.md
- GitHub search result pages (titles/dates only): `org:bitfocus camera "white balance"`;
  `org:bitfocus "scene file" OR "paint" OR "CCU"`; `repo:bitfocus/companion-module-requests shading`;
  `repo:bitfocus/companion-module-requests Ikegami OR Hitachi OR "Grass Valley" camera`;
  `repo:zbynekdrlik/camera-box shading OR grading OR "white balance"`; `"camera shading" broadcast`;
  `"scene file" camera shading`
- GitHub API searches via MCP (negative results, used as absence evidence): repositories `c2ip`,
  `ikegami`, `camera control broadcast CCU`; code `"CCdP" atem camera control`

### Local primary documents in this workspace

- `/home/user/sony-camera-bridge/README.md` (per-family protocol status; Sony 700 NDA note)
- `/home/user/sony-camera-bridge/packages/web-rcp/src/capabilities.ts` (per-protocol paint
  capability truth table; AWB/ABB disabled on the Sony CCU backend)
- `/home/user/sony-camera-bridge/docs/live-video.md`
- `/home/user/av-planner-suite/docs/research/workflow-chain.md`
- `/home/user/av-planner-suite/docs/research/roles/camera-operator.md`
- `/home/user/av-planner-suite/docs/research/METHOD.md`
- `/home/user/multicam-planner/README.md`

### Cited second-hand via the sibling dossier — NOT opened in this session

These URLs are quoted by `roles/camera-operator.md`, which collected them in an earlier session
with search access. Every domain below was blocked by the egress proxy here, so I could not
re-verify wording, context or date. Treat as leads, not as evidence I checked.

- https://www.tvtechnology.com/opinions/camera-shading-basics
- https://en.wikipedia.org/wiki/Camera_control_unit
- https://www.oreilly.com/library/view/basic-betacam-camerawork/9780240516042/xhtml/chapter47.html
- https://www.churchproduction.com/sponsored/hitachi/smpte-fiber-cabling-simplifies-camera-infrastructures-and-op/
- https://productiondistro.com/blog/smpte-fiber-cable-guide/
- https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/
- https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/

### Attempted and blocked (recorded so the gap is auditable)

reddit.com, old.reddit.com, duckduckgo.com, lite.duckduckgo.com, mojeek.com, hn.algolia.com,
r.jina.ai, web.archive.org, video.stackexchange.com, controlbooth.com, prosoundweb.com,
film-tv-video.de, tvtechnology.com, grassvalley.com, gitlab.com search (403).
`WebSearch` was unavailable for the entire session (budget exhausted before the first call).
