# Camera Operators / Kameraleute

Research dossier for AV Planner Suite. Compiled 2026-08-28.

> **Method and evidence caveat.** In this research environment direct page fetching
> (`WebFetch`) was blocked by the egress proxy for every domain except `github.com`.
> All other evidence below comes from search-engine result summaries that quote or
> paraphrase the linked page. That is weaker than reading the page in full: I can
> vouch that the linked page contains the substance attributed to it, but not for the
> surrounding context, and I could not verify publication dates on most pages.
> Two GitHub issues were fetched in full and are marked as such. Reddit was
> unreachable from this environment, so the "practitioner venting" layer that would
> normally corroborate several of these findings is missing. Frequency labels are
> therefore conservative. Anything I could not corroborate across at least two
> independent sources is marked **(unverified)**.

---

## Who they are / where they sit in the production

A camera operator in live/broadcast AV is a *terminal node* in the information chain:
almost everything they need to do their job is decided by somebody else, in a
different document, and reaches them late.

Three distinct populations, with different pain:

1. **Studio / gallery operators (news, magazine, talk).** Work to a *camera script* —
   a document that "outlines for each camera operator the exact size of shot and
   precise camera moves the director expects throughout the scene", giving "the order
   of shots practiced at rehearsal and cued by the director during recording"
   ([mason.gmu.edu camera script primer](https://mason.gmu.edu/~lsmithg/gtvcs.htm),
   [Prospects TV camera operator profile](https://www.prospects.ac.uk/job-profiles/television-camera-operator/)).
   In unscripted multi-camera they get "blocking or shot notes, indicating where the
   presenters and contributors are going to move… used for rehearsal and amended if
   necessary" ([ScreenSkills](https://www.screenskills.com/job-profiles/browse/unscripted-tv/technical/camera-operator/)).
   Amended is the operative word — see *Time sinks*.

2. **Event / corporate / house-of-worship operators (often freelance or volunteer).**
   Work to a rundown / Regieplan / run-of-show owned by a show caller, plus verbal
   direction over comms. Typical corporate deployment is "three camera operators, a
   live switcher, and a stream engineer"
   ([Corcino Productions livestream guide](https://www.corcinoproductions.com/post/livestream-production-for-corporate-events)).
   Camera-position typology in the German event world is codified: frontal main
   cameras at 90° to stage in two depths for close-up and wide, side cameras for
   medium, hall cameras for audience, plus roaming ENG shoulder cams
   ([Lazi Akademie, Event-Videoproduktion](https://www.lazi-akademie.de/wiki/messe-event/event-videoproduktion/)).

3. **PTZ / remote operators.** One person on several heads, or presets recalled by a
   switcher operator with no camera operator at all. Vendor framing is explicit that
   "a traditional multi-camera setup that might require 3–5 camera operators plus a
   director" can run "with just 1–2 technical directors controlling all cameras"
   ([ikan, PTZ vs traditional](https://ikancorp.com/ptz-vs-traditional-broadcast-cameras-pick-your-perfect-match/)).
   Trade press is more measured — PTZ "complements tradition" rather than replacing it,
   and is a fit "for news, sports, parliamentary coverage, Houses of Worship,
   education, esports and studio talk shows"
   ([TVBEurope](https://www.tvbeurope.com/live-production/complementing-tradition-integrating-ptz-technology-into-modern-studios)).
   A parallel trend removes the dedicated prompter operator from PTZ positions as an
   "operational efficiency with real budget implications"
   ([NewscastStudio, Vinten/Autoscript, 2026-04-24](https://www.newscaststudio.com/2026/04/24/vinten-and-autoscript-bring-unified-answer-to-the-ptz-production-challenge/)).

**The structural fact that drives everything else:** the camera operator's position is
a *physical* object (a spot in a room, a riser, a cable run, a patch number, a switcher
input, a multiviewer tile, a tally lamp, an intercom channel) *and* an *editorial*
object (a coverage assignment, a set of shots, a lens choice). Those two halves live in
completely different documents, owned by different people, and nobody reconciles them.

---

## A day in the life

### Prep (days to weeks before)

- Receives a **call sheet or crew booking**, usually as a PDF by e-mail or messenger.
  For event work the "call sheet ties every crew action to the event timetable —
  when the truck arrives, when rigging starts, when audio lines are checked, when
  rehearsal starts, when room handover happens"
  ([Corcino](https://www.corcinoproductions.com/post/livestream-production-for-corporate-events)).
  In practice most freelancers get a fraction of that.
- Camera positions were decided at a **site survey** they did not attend. Broadcast
  rights manuals require the broadcaster to "advise the maximum potential camera
  positions (including minimum host broadcaster camera positions and optional camera
  positions) at the time of the site visit", with the survey covering "physical
  attributes of the venue… special construction needs, safety considerations, and
  access"
  ([FIS Broadcaster Manual 2021/22, PDF](https://assets.fis-ski.com/f/252177/cf64948a8b/fis-broadcaster-manual-general-part-2122.pdf)).
- The plan itself lives in **CAD**: technical production managers produce floorplans
  and "department-ready documentation including lighting plots, speaker plots,
  patch/cable calls and other technical schedules", drawn in AutoCAD/WYSIWYG with
  layers for AV positions, seating, lighting and risers, and "a section as well as a
  plan from the outset because the sightlines and the riser only resolve in section",
  delivered "in common formats for suppliers and venues (PDF and native files)"
  ([eventprof.co.uk floorplans](https://www.eventprof.co.uk/production-management/floorplans/)).
  The camera operator gets the PDF, if anything.
- German equivalent: a **Regie- und Kameraplan** is drawn up for streamed/hybrid
  events, with "timecodes, camera positions and directing coordinated down to the
  smallest detail"
  ([HD-Event, Streaming & Regieplanung](https://www.hd-event.de/faq-items/streaming-regieplanung/)),
  alongside a **Bühnenplan** — "a detailed CAD plan or sketch showing the positioning
  of all instruments and artists on stage, including technical equipment"
  ([allbuyone Eventlexikon](https://www.allbuyone.com/de/backstage/eventlexikon/buehnenplan.html)).

### Load-in / rig

- Finds the position, discovers what the drawing did not say: house lighting or truss
  in the sightline, a speaker stack, no power, no cable path. Site-planning guidance
  explicitly names this as the thing to check — "where columns or lighting truss may
  interrupt sightlines, where cable runs can go safely, and where the power is
  available", and warns that "if cameras aren't considered in the floor plan, they end
  up in the way of the audience or in positions that compromise the footage"
  ([GeoEvent, stage design that works on show day](https://www.geoevent.net/event-stage-design-that-works-on-show-day/)).
- Cable is pulled by someone else against a length assumption. For a mobile 5-camera
  football setup "the distances between each camera position and the broadcasting
  system are typically within 100 metres", with routing "hugging walls or utilising
  seat gaps", adhesive fixing and cable trays in aisles
  ([Datavideo, 5-camera football](https://datavideo.com/us/article/307/5)).
  On larger jobs runs go far beyond that: triax "around 1500 m for HD but most prefer
  to work within 500 m" versus SMPTE fibre "up to 13,000 feet"
  ([TV Tech, triax vs fibre](https://www.tvtechnology.com/miscellaneous/triax-vs-fiberoptic-cable));
  SMPTE fibre ships on drums from 25 m to 500 m and planners are told to allow
  "100–150 mm minimum bend radius… roughly 10–15× the outer diameter"
  ([Production Distro SMPTE fibre guide](https://productiondistro.com/blog/smpte-fiber-cable-guide/)).
  One SMPTE cable carries "program video and audio, return video, intercom audio,
  tally signals, remote control commands and power"
  ([Church Production / Hitachi, sponsored](https://www.churchproduction.com/sponsored/hitachi/smpte-fiber-cabling-simplifies-camera-infrastructures-and-op/))
  — i.e. one wrong cable length simultaneously kills picture, comms, tally and return.
- Platform/riser: camera risers are a standard rental product with published load
  ratings (e.g. an Intellistage 4'×4' camera platform rated 153 lbs/ft² uniform load,
  heights 8"–32"; other risers rated to 200 kg)
  ([EventStable](https://www.eventstable.com/intellistage-platform-for-camera.html),
  [Proaim riser](https://www.proaim.com/products/proaim-5-7-camera-riser)) — but the
  height/load/access spec is rarely attached to the camera position in any plan the
  operator sees.

### Rehearsal

- Shots get blocked and the operator marks up paper. Rehearsal is exactly where the
  physical conflicts surface: typical rehearsal problems are "the lectern blocking the
  camera line, the confidence monitor sitting in the wrong place, the audio feed being
  late, and the room lighting fighting the image"
  ([DCE Productions](https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/)).
- PTZ operators build and rehearse presets. Advice is to "practise recalling presets in
  the order you'll use them on Sunday morning… so the camera doesn't get stuck or
  behave unexpectedly"
  ([Church Production, 5 PTZ basics](https://www.churchproduction.com/magazine/5-ptz-camera-basics-for-church-techs-and-volunteers/)).
- Vision engineer / shading. "The vision engineer works with the camera operator to
  adjust settings on both the camera and the CCU in tandem", the goal being to make all
  cameras match in colour, brightness, contrast and overall look
  ([TV Tech, camera shading basics](https://www.tvtechnology.com/opinions/camera-shading-basics),
  [Camera control unit, Wikipedia](https://en.wikipedia.org/wiki/Camera_control_unit)).
  The result is stored as a **scene file** — "a method of recording the operational
  settings on a digital camera… removed from the camera with the stored values and then
  loaded back"
  ([Basic Betacam Camerawork, ch. 47](https://www.oreilly.com/library/view/basic-betacam-camerawork/9780240516042/xhtml/chapter47.html)).
  Which scene file belongs to which position on which show is, in most shops,
  institutional memory.

### Show

- The plan changes and reaches the operator by voice. German practice for orchestral
  work: cuts are fixed during rehearsal, "each camera has a schedule of when it has to
  be on what", and the director's channel stays open the whole show so every camera
  hears the director permanently; the failure modes discussed are missed soloists, the
  wrong musician in frame, and video dropouts
  ([slashCAM, Live Event — Kommunikation zwischen Regie und Kamera, Dec 2019](https://www.slashcam.de/info/Live-Event---Kommunikation-zwischen-Regie-und-Kamera-1020977.html)).
- Comms is the single point of failure. "When a camera crew misses cues it is rarely
  due to a lack of skill; it is almost always a failure of communication technology" —
  named causes: cheap analog walkie-talkies with static and cross-talk from nearby
  security, "a camera operator stuck behind a tripod cannot easily step away to swap a
  battery", and gear that makes operators "toggle through menus to find the right
  channel" so they "get lost on the wrong frequency and miss critical instructions"
  ([527 Sounds](https://527sounds.com/why-camera-crew-misses-cues-solution/)).
- And full-duplex partyline degrades under load: it is "convenient in live event
  production but can quickly devolve with many users on the same line"
  ([avad3, client's guide to comms](https://avad3.com/a-clients-guide-to-crew-communication-headsets-a-k-a-comm/));
  partyline means "everyone hears everything, all the time" with "no privacy between
  operators"
  ([TC Furlong, partyline primer](https://tcfurlong.com/demystify-audio-party-line-intercom-systems/)).
- Tally tells them when they are live — "a small signal lamp on professional cameras
  that communicates whether the camera is live", cued to talent and crew
  ([Tally light, Wikipedia](https://en.wikipedia.org/wiki/Tally_light)) — and tally,
  talkback and camera-control data typically ride the program return feed into the
  viewfinder
  ([Blackmagic URSA Broadcast viewfinders](https://www.blackmagicdesign.com/products/blackmagicursabroadcast/viewfinders)).

### Load-out

- Derig, coil, count. Nobody records where anything actually ended up, so next year's
  plan starts from the same stale drawing.

### Post

- Cards and ISOs hand over to edit. Best practice is "clear labelling of camera cards,
  established folder structures, and consistent naming systems that identify camera
  letters, shoot days and card numbers", with a handoff bundle of "verified media
  report, camera and sound logs, folder manifest and production notes"
  ([Imagine Products, ingest workflow](https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/)).
  The perennial rule is not to rename original camera files because it breaks metadata
  and relinking ([Frame.io, file naming conventions, 2018 — older, but the convention
  has not changed](https://blog.frame.io/2018/10/22/file-naming-conventions/)).

---

## Tools they actually use

| Tool | For what | How they feel about it |
|---|---|---|
| Printed rundown / camera script / Regieplan | The thing in their hand during the show; hand-annotated | Trusted precisely because it is dumb. ITV Studios' camera operators carried "bundles of printed rundowns" until 2026 ([NewscastStudio case study](https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/)) |
| Excel / Google Sheets Regieplan | The rundown before it is printed; columns for time, duration, action, people, sound, light, camera ([ablaufregisseur.de](https://ablaufregisseur.de/regieplan-vorlage/), [mindnapped Regieplan-Vorlage](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/)) | Grudging. The stated failure is exactly version skew: with classic Excel versions "it can happen that not everyone has the same information", while for a live event "every department — direction, vision mixing, graphics, cameras and sound — must be on the same footing" (mindnapped) |
| PDF floorplan / camera plot | Where to stand | Fine as a picture, useless as data. Native CAD stays with the production manager ([eventprof](https://www.eventprof.co.uk/production-management/floorplans/)) |
| Intercom (wired beltpack, wireless beltpack, or single-ear headset) | Everything that matters on show day | Love/hate. "The camera operator often requires mobility and will therefore need a wireless setup" ([SYNCO intercom guide](https://www.syncoaudio.com/blogs/news/intercom-system-for-video-production-guide)); large venues need planning "around antenna placement, coverage zones and possible obstructions rather than assumed to work equally well everywhere" ([Stickman Sound](https://stickmansound.com/wireless-comms-for-independent-productions-and-events/)) |
| Tally (lamp, viewfinder, NDI/TSL software tally) | Knowing they are live | Trusted until it lies — see *Error sources* |
| Viewfinder + return/program feed | Seeing what the show is doing | Non-negotiable; the return path also carries talkback and tally ([Blackmagic](https://www.blackmagicdesign.com/products/blackmagicursabroadcast/viewfinders)) |
| PTZ controller / preset recall (joystick panel, Companion, camera app) | Remote positions | Fragile. Presets store "the exact pan, tilt, zoom and focus positions at the time you press save", and the classic failure is "adjusting the camera's position or focus after saving it and then forgetting to overwrite that preset" ([ChurchStreamPro](https://churchstreampro.com/ptzoptics-presets-not-recalling-correctly/), [PTZOptics presets overview](https://ptzoptics.com/ptz-presets/)) |
| WhatsApp / e-mail / messenger group | Call times, "we moved camera 3", parking, last-minute changes | Universally used, universally distrusted. Event-ops writing calls out "spreadsheets, WhatsApp threads, copied PDFs and disconnected documents" as things that "work during early planning but break down when live delivery starts moving" ([Homerun Entertainment, event operations, 2026-07-07](https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day)) |
| Rundown platforms (Shoflo, Cuez, Rundown Creator/Studio) | Live-synced run of show, increasingly on an iPad on the camera | Where deployed, liked — but usually bought by the control room, not the floor ([Shoflo](https://shoflo.tv/), [Cuez](https://cuez.app/)) |
| Volunteer/crew scheduling (Planning Center Services in HOW) | Who is on which camera on which Sunday, plus "notes to store information your volunteers need to be prepared" ([Planning Center](https://www.planningcenter.com/services), [Planning Center matrix walkthrough](https://www.worshipresources.church/how-to-use-planning-center-matrix-to-save-hours-every-month/)) | Fine for rostering, blind to the technical plan |
| Shot-list software (StudioBinder et al.) | Scripted/short-form work | Grudging at best. "The interface is dense, the learning curve is real, and for a director who just wants to break down a short film… it's significantly more software than necessary"; and "for a lot of indie filmmakers, a well-structured spreadsheet is still the most practical shot list tool" ([Storyflow shot-list tool review 2026](https://storyflow.so/blog/best-shot-list-tools-2026)) |

---

## Time sinks (ranked)

**1. Re-reading and re-marking a changed rundown, repeatedly, on show day. (widespread; hours per show)**
The canonical description of the pain: when changes happen frequently and presenters
or clients reorder elements, "new versions of the rundown need to be constantly
emailed and printed out. Otherwise the crew will miss their cues, making for awkward
pauses and confusion"
([Shoflo event-production guide](https://info.shoflo.tv/event-production)).
The scale of the relief when it is fixed is the tell: ITV Studios' operators dropped
"bundles of printed rundowns" for an iPad on each camera, so that "when something is
typed in the control room it instantly gets on set"
([NewscastStudio, 2026-05-26](https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/);
corroborated by [TV Tech](https://www.tvtechnology.com/production/itv-studios-deploys-cuez-live-production-platform)).

**2. Establishing which version of the plan is real. (widespread; minutes to hours per show)**
German event practice states both halves of the problem in one place: version skew
across Excel copies, mitigated with shared Google Sheets and explicit version naming —
"but on production day the best solution is still a printed Regieplan into which
spontaneous changes are entered by hand"
([mindnapped](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/)).
Anglophone event guidance says the same defensively: "every time you update your Run of
Show, add a clear date and version number… especially when sharing via email or Slack"
([EMRG Media run-of-show template](https://www.emrgmedia.com/event-run-of-show-template/)).

**3. Discovering physical conflicts at rehearsal that the drawing did not encode. (widespread; hours per project)**
Lectern in the camera line, confidence monitor misplaced, truss across the sightline,
no power at the position
([DCE Productions](https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/),
[GeoEvent](https://www.geoevent.net/event-stage-design-that-works-on-show-day/)).
Every one of these is a *re-rig*: move the position, re-pull the cable, re-patch,
re-label, re-shade.

**4. Comms setup and comms failure. (widespread; minutes per show, but at the worst moment)**
Wrong channel, flat beltpack battery, dead zone at a far position, and the physical
constraint that an operator behind a tripod cannot leave to swap a battery
([527 Sounds](https://527sounds.com/why-camera-crew-misses-cues-solution/)).
Wireless comms coverage has to be planned per position, not assumed
([Stickman Sound](https://stickmansound.com/wireless-comms-for-independent-productions-and-events/)).

**5. PTZ preset build and rebuild. (recurring, near-universal in HOW/corporate; hours per show)**
Presets go stale the moment anyone nudges the camera or refocuses and forgets to
re-save
([ChurchStreamPro](https://churchstreampro.com/ptzoptics-presets-not-recalling-correctly/)).
The mitigation on offer is *rehearse the whole preset sequence in order*
([Church Production](https://www.churchproduction.com/magazine/5-ptz-camera-basics-for-church-techs-and-volunteers/))
— i.e. spend show-day time re-verifying an undocumented list.

**6. Naming and labelling the same camera in five systems. (widespread; see next section)**

**7. Card labelling, offload and media reports at wrap. (recurring; ~30–60 min per shoot day)**
Camera letter / shoot day / card number labelling plus a media report, camera logs and
a folder manifest at handover
([Imagine Products](https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/)).

---

## Double data entry

What a camera position *is* gets typed in by hand, from scratch, into each of these:

| # | System | What gets typed | Evidence |
|---|---|---|---|
| 1 | CAD floorplan / camera plot | Position, height, sightline, cable path | [eventprof](https://www.eventprof.co.uk/production-management/floorplans/); [CamPlot](https://www.camplot.studio/) imports a ground plan and rescales it to real dimensions — i.e. yet another re-entry of the same room |
| 2 | Rundown / Regieplan (Excel, Sheets, Shoflo, Cuez) | "Cam 2 — wide", coverage per segment | [mindnapped](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/), [Shoflo](https://info.shoflo.tv/event-production) |
| 3 | Cable / patch call | Camera n → drum length → patch panel → CCU/base station | [Datavideo](https://datavideo.com/us/article/307/5), [Production Distro](https://productiondistro.com/blog/smpte-fiber-cable-guide/) |
| 4 | Switcher input mnemonics | "CAM2" | [Ross Carbonite MultiViewer setup](https://help.rossvideo.com/carbonite-02/Tasks/Setup/Video/MV-Setup.html) |
| 5 | Router / UMD / TSL name | "CAM2" again, and possibly differently | Assigning a TSL ID means "the switcher overwrites the source name on the MultiViewer and mnemonics with the TSL name" ([Ross Graphite UMD name setup](https://help.rossvideo.com/graphite-cpc/Tasks/Setup/Video/UMD-NameSetup.html)) |
| 6 | Multiviewer tile labels | "CAM2" a third time. A vendor states the baseline plainly: "normally source names in multiviewers are manually entered" ([TallyEngine features](https://www.tallyengine.com/features/)) |
| 7 | Tally mapping (hardware GPI, TSL, NDI, Companion) | Which input drives which lamp | [TSL/tally/label protocol overview](https://xichtee.com/tsl-broadcast-tally-label-protocol/) |
| 8 | Intercom channel/port labels | "CAM2" a fourth time | partyline/matrix channel naming, [TC Furlong](https://tcfurlong.com/demystify-audio-party-line-intercom-systems/) |
| 9 | Rental / kit order | Body, lens, head, tripod, riser, drum length per position | rental houses "generate custom quotes once they receive the full equipment list", and "recording accurate amendments to equipment lists and informing all relevant parties" is a named duty ([StudioBinder rental guide](https://www.studiobinder.com/blog/video-equipment-rental/), [Camera prep technician standard, Skills England](https://skillsengland.education.gov.uk/apprenticeships/st0900-v1-1)) |
| 10 | Call sheet / crew schedule | Who is on camera n, call time, position | [Corcino](https://www.corcinoproductions.com/post/livestream-production-for-corporate-events); HOW equivalent in [Planning Center](https://www.planningcenter.com/services) |
| 11 | Card / ISO naming for post | Camera letter, day, card number | [Imagine Products](https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/) |

Eleven places, one fact. And the identifiers *diverge*: the CAD says "Kamera 2 (Bühne
links)", the rundown says "Cam L", the switcher says "CAM2", the UMD says "C2", the
comms panel says "Cam 2 Wide", the rental order says "URSA #4", the card says
"B_Day1_003". Nobody owns the mapping, which is precisely why the multiviewer sometimes
disagrees with the director's mouth.

---

## Error sources

**Tally lies, or is invisible.**
Concrete, verifiable, and long-lived:
- False preview tally: OBS-NDI sends a preview tally when a source merely appears in a
  multiview, so operators see a preview indication for a camera that is not in preview.
  Opened 2019-06-17, later **closed as not planned**
  ([DistroAV issue #318 — fetched](https://github.com/DistroAV/DistroAV/issues/318)).
- Unstable tally state: a BirdDog PF120 over NDI "rapidly blinks between red and green"
  when live instead of showing steady red. Opened 2021-09-27, **still open**
  ([DistroAV issue #687 — fetched](https://github.com/DistroAV/DistroAV/issues/687)).
- Panasonic-over-NDI tally fixed only by moving the control/tally port, or by disabling
  tally control on an RP50 remote panel
  ([Vizrt forum thread](https://forum.vizrt.com/index.php?threads/problems-with-tally-in-camera-panasonic-by-ndi.251037/)).
- Visibility: brightness is a product feature, not a given — tally vendors advertise
  dimmable lamps and colour choice "according to the ambient lighting", and one markets
  being visible "with sunglasses on in direct sunlight"
  ([SKAARHOJ tally light](https://shop.us.skaarhoj.com/products/tally-light),
  [StreamGeeks, how tally lights work](https://streamgeeks.us/how-tally-lights-work/)).
  There is an active Blackmagic forum thread specifically titled *Tally Light Visibility
  Options* ([forum.blackmagicdesign.com t=211462](https://forum.blackmagicdesign.com/viewtopic.php?f=4&t=211462) —
  title surfaced in search; thread body not readable from this environment).

  **Cost:** the operator reframes, zooms or wipes the lens while live; or freezes on a
  shot they think is hot and misses the next one. On a single-take live show that is
  unrecoverable.

**Missed cues from comms failure, not skill.**
Static/cross-talk from other radio users, dead beltpack batteries the operator cannot
leave the camera to change, and operators lost on the wrong channel after menu-diving
([527 Sounds](https://527sounds.com/why-camera-crew-misses-cues-solution/)).
**Cost:** "the moment passes and the live stream looks amateurish" (same source);
in the German orchestral case, the missed soloist or the wrong musician in shot
([slashCAM, 2019](https://www.slashcam.de/info/Live-Event---Kommunikation-zwischen-Regie-und-Kamera-1020977.html)).

**Stale PTZ presets.**
Position/focus changed after saving, preset never overwritten
([ChurchStreamPro](https://churchstreampro.com/ptzoptics-presets-not-recalling-correctly/)).
**Cost:** the shot recalled on air is wrong, and unlike a manned camera it cannot be
saved by a human reflex.

**Version skew in the rundown.**
Crew working from different Excel versions
([mindnapped](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/));
"spreadsheets, WhatsApp threads, copied PDFs and disconnected documents… break down
when live delivery starts moving"
([Homerun Entertainment](https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day)).
**Cost:** missed cues, "awkward pauses and confusion"
([Shoflo](https://info.shoflo.tv/event-production)).

**Camera position physically wrong.**
Truss/column/speaker in the sightline, position in the audience's way, no power, no
safe cable path
([GeoEvent](https://www.geoevent.net/event-stage-design-that-works-on-show-day/)).
**Cost:** re-rig during the only rehearsal window; and a cable run redone is video +
comms + tally + return + power all at once
([Church Production/Hitachi](https://www.churchproduction.com/sponsored/hitachi/smpte-fiber-cabling-simplifies-camera-infrastructures-and-op/)).

**Cameras that do not match.**
Shading exists because unmatched cameras produce "jarring differences visible to the
viewer" on the cut
([TV Tech](https://www.tvtechnology.com/opinions/camera-shading-basics)).
The variables in play — filter, white balance, gain, shutter, gamma, black stretch,
matrix — are numerous and camera-specific (same source), and the scene file that
captures them is a per-camera artefact
([Basic Betacam Camerawork ch. 47](https://www.oreilly.com/library/view/basic-betacam-camerawork/9780240516042/xhtml/chapter47.html)).
**Cost:** a colour jump on every cut to that camera, for the whole show.

**Media handover errors.**
Renaming original camera files "can break links to metadata"; the recommendation is to
organise by folder and bin instead
([Imagine Products](https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/),
[Frame.io 2018](https://blog.frame.io/2018/10/22/file-naming-conventions/)).
**Cost:** hours in post reconciling which ISO was which camera.

---

## Paper / Excel / WhatsApp inventory

**Paper (still, deliberately):**
- The **printed rundown / camera script / Regieplan**, hand-annotated during rehearsal.
  Explicit recommendation, not nostalgia: "on production day the best solution is still
  a printed Regieplan into which spontaneous changes are entered by hand"
  ([mindnapped](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/)).
  ITV Studios operators carried *bundles* of them until the 2026 Cuez rollout
  ([NewscastStudio](https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/)).
- **Blocking / shot notes** for unscripted multicam, "used for rehearsal and amended if
  necessary" ([ScreenSkills](https://www.screenskills.com/job-profiles/browse/unscripted-tv/technical/camera-operator/)).
  Shot sizes appear in abbreviated form on scripts and running orders
  ([Bath Spa TV studio training](https://sites.google.com/bathspa.ac.uk/tv-technical-training/tvstudio/tv-studios/studio-floor-a/studio-cameras/camera-shots-framing)).
- **PDF floorplan** printed for load-in ([eventprof](https://www.eventprof.co.uk/production-management/floorplans/)).
- **Printed/PDF call sheet.** The stated advantage over apps is offline robustness:
  "PDF/paper call sheets work offline in dead zones and prevent accidental edits,
  ensuring the schedule doesn't mysteriously change because someone tapped the wrong
  cell on their phone"
  ([Filmustage, digital vs paper call sheets](https://filmustage.com/blog/digital-vs-paper-call-sheets/)).
- **Camera reports / media reports** at wrap
  ([StudioBinder camera report template](https://www.studiobinder.com/blog/camera-report-template-pdf-download/),
  [The Black and Blue camera reports](https://www.theblackandblue.com/2011/12/27/camera-reports/) — old, 2011, but the artefact persists per [Imagine Products](https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/)).

**Excel / Google Sheets:**
- The **Regieplan**, with columns for number, time, duration, action, people, and
  separate columns for sound and light — and cameras as a named department that must be
  in sync ([ablaufregisseur.de](https://ablaufregisseur.de/regieplan-vorlage/),
  [mindnapped](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/),
  [m-regie.de Regieplan guide](https://www.m-regie.de/post/regieplan-veranstaltung),
  [Dachverband Tanz "How to Regieplan", PDF](https://www.dachverband-tanz.de/fileadmin/dateien_DTD/Fotos/Fotos_Projekte/Fotos_Qualifizierung/How_to_Regieplan_DTD_01.pdf)).
- The **shot list**. "For a lot of indie filmmakers, a well-structured spreadsheet is
  still the most practical shot list tool… you control every column, it costs nothing,
  and your crew can access it anywhere"; Google Sheets is named the best free baseline
  ([Storyflow 2026](https://storyflow.so/blog/best-shot-list-tools-2026)).
- The **kit/equipment list** sent to the rental house
  ([StudioBinder rental guide](https://www.studiobinder.com/blog/video-equipment-rental/)).

**WhatsApp / messenger / e-mail:**
- Crew group chat carrying call-time changes, position moves and "we've cut segment 4".
  Named directly as part of the breakage: "spreadsheets, WhatsApp threads, copied PDFs
  and disconnected documents… break down when live delivery starts moving… the team
  still has to hunt for the real answer"
  ([Homerun Entertainment](https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day)).
- E-mailed rundown revisions, which is exactly the practice the version-numbering advice
  is defending against
  ([EMRG Media](https://www.emrgmedia.com/event-run-of-show-template/)) and which
  cloud-rundown vendors position against
  ([Events.com run-of-show guide](https://events.com/blog/run-of-show/),
  [MeyerPro](https://meyerproinc.com/live-event-run-of-show/)).
- In HOW, automated scheduling e-mails and per-service "notes to store information your
  volunteers need to be prepared"
  ([Planning Center](https://www.planningcenter.com/services)).

---

## Missing interfaces

1. **CAD floorplan → camera operator.** The drawing carries layers, sections and
   sightlines ([eventprof](https://www.eventprof.co.uk/production-management/floorplans/));
   the operator gets a flattened PDF and finds out about the truss in rehearsal
   ([GeoEvent](https://www.geoevent.net/event-stage-design-that-works-on-show-day/)).
2. **Camera position → cable/patch call.** Length, drum, bend radius, path and patch
   number are decided by the video engineer against a position that may still move
   ([Datavideo](https://datavideo.com/us/article/307/5),
   [Production Distro](https://productiondistro.com/blog/smpte-fiber-cable-guide/)).
3. **Camera position → labelling chain (switcher / router / UMD / multiviewer /
   tally).** Manual re-entry at every hop, with the switcher able to overwrite the
   multiviewer name from a TSL ID
   ([Ross UMD name setup](https://help.rossvideo.com/graphite-cpc/Tasks/Setup/Video/UMD-NameSetup.html),
   [Ross MV setup](https://help.rossvideo.com/carbonite-02/Tasks/Setup/Video/MV-Setup.html),
   [TallyEngine](https://www.tallyengine.com/features/)).
4. **Rundown → floor.** The gap the Cuez/ITV deployment exists to close: control-room
   edits reaching camera in real time instead of via a reprint
   ([NewscastStudio](https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/)).
5. **Lighting / set / staging → camera.** Lectern, confidence monitor, truss, house
   lighting all get placed without the camera line as a constraint
   ([DCE Productions](https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/)).
   Positive framing of the same gap: coordinate lighting, audio, video, streaming,
   staging and show flow and there are "fewer last-minute surprises and fewer technical
   conflicts" (same source).
6. **Comms design → camera position.** Antenna coverage and channel plan should be
   position-specific ([Stickman Sound](https://stickmansound.com/wireless-comms-for-independent-productions-and-events/));
   in practice the operator finds the dead zone during the show.
7. **Vision engineer → camera operator.** Shading is explicitly a two-person activity
   on camera and CCU in tandem ([TV Tech](https://www.tvtechnology.com/opinions/camera-shading-basics)),
   but the resulting scene file is not tied to a documented position or show.
8. **Camera → post.** Card labelling and the handover bundle are a stated best practice
   ([Imagine Products](https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/)),
   i.e. still a manual discipline rather than a generated artefact.
9. **Crew roster → technical plan.** Scheduling tools know who is on "camera operator"
   but nothing about which position, lens, comms channel or preset list that implies
   ([Planning Center](https://www.planningcenter.com/services),
   [Planning Center matrix](https://www.worshipresources.church/how-to-use-planning-center-matrix-to-save-hours-every-month/)).

---

## What they would want (stated, not inferred)

- **The rundown, live, at the camera.** The ITV Studios outcome is the wish granted:
  operators swapped printed bundles for "a modern iPad attached to each camera
  displaying the synced Cuez Rundown", with control-room typing appearing instantly on
  set, specifically to improve communication "during last-minute production changes"
  ([NewscastStudio](https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/),
  [TV Tech](https://www.tvtechnology.com/production/itv-studios-deploys-cuez-live-production-platform)).
- **One document everyone is on.** Stated as a requirement, in German, for live events:
  every department — direction, vision mixing, graphics, cameras, sound — must be on the
  same footing, which is why the shop moved to shared Sheets with named versions
  ([mindnapped](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/)).
- **…but keep the paper.** From the same source: on production day the printed plan
  with handwritten changes is still the best answer. And the paper-call-sheet argument
  is explicitly about offline reliability and immutability
  ([Filmustage](https://filmustage.com/blog/digital-vs-paper-call-sheets/)).
- **A shot assigned to each moment, with a timestamp.** "Walk through the agenda line by
  line and assign a shot to each important moment — keynote wides, crowd reactions, the
  CEO walking on stage, product reveals — with timestamps so the crew knows when to
  reposition"
  ([Corcino](https://www.corcinoproductions.com/post/livestream-production-for-corporate-events)).
- **Comms that cannot be got wrong.** Full-duplex digital, no channel menus, no dead
  batteries mid-show ([527 Sounds](https://527sounds.com/why-camera-crew-misses-cues-solution/));
  and disciplined channel structure rather than one partyline where "everyone hears
  everything, all the time"
  ([TC Furlong](https://tcfurlong.com/demystify-audio-party-line-intercom-systems/),
  [avad3](https://avad3.com/a-clients-guide-to-crew-communication-headsets-a-k-a-comm/)).
  Church practice codifies the vocabulary itself — accurate, bold, concise, with
  standardised terms "reducing confusion for camera operators"
  ([Church Production, communications](https://www.churchproduction.com/education/good-communications-make-for-better-and-safer-productions/)).
- **Tally you can actually see.** Dimmable, colour-selectable, readable in the ambient
  light you actually have ([SKAARHOJ](https://shop.us.skaarhoj.com/products/tally-light),
  [StreamGeeks](https://streamgeeks.us/how-tally-lights-work/)).
- **Rehearse the preset sequence in order** — the HOW community's own stated remedy for
  PTZ presets going wrong live
  ([Church Production](https://www.churchproduction.com/magazine/5-ptz-camera-basics-for-church-techs-and-volunteers/)).
- **Simpler tools.** The shot-list verdict is that the market leader is "significantly
  more software than necessary" and a spreadsheet is often better
  ([Storyflow](https://storyflow.so/blog/best-shot-list-tools-2026)).

---

## Implications for AV Planner Suite

1. **Make the camera position the primary object, and give it one ID.**
   A `CameraPosition` should own: physical location on the plan (x/y/height, riser
   spec, load, access, power), cable run (type, length, drum, path, bend-radius
   feasibility), patch/input number, switcher mnemonic, UMD/TSL name, multiviewer tile,
   tally target, intercom channel, assigned operator, assigned body + lens, and its
   coverage assignment in the rundown. Today those are 11 hand-typed copies
   (see *Double data entry*). One record, many projections, is the whole product thesis
   for this role.

2. **Export the labelling chain, do not ask people to retype it.**
   If the suite knows CAM2, it should emit switcher mnemonics, TSL/UMD names,
   multiviewer labels and tally mappings. "Normally source names in multiviewers are
   manually entered" ([TallyEngine](https://www.tallyengine.com/features/)) is a direct
   statement of the gap. Cable Planner already models Videohub/ATEM; extending its
   naming to a single authoritative source-name table is a small, high-value step.

3. **Camera-position feasibility checks at plan time, not rehearsal time.**
   Two cheap checks with disproportionate value: (a) *sightline* — does anything on the
   plan (truss, speaker stack, lectern, confidence monitor, column) intersect the line
   from position to subject; (b) *lens reach* — given position-to-subject distance,
   sensor and available lens, is the required framing achievable. Both prevent the
   re-rig described in [DCE Productions](https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/)
   and [GeoEvent](https://www.geoevent.net/event-stage-design-that-works-on-show-day/).

4. **Treat cable length as a first-class output of the camera position.**
   Moving a position must recompute drum length, path and patch, and warn on run limits
   (triax vs SMPTE fibre limits and 10–15× bend radius are documented constraints:
   [TV Tech](https://www.tvtechnology.com/miscellaneous/triax-vs-fiberoptic-cable),
   [Production Distro](https://productiondistro.com/blog/smpte-fiber-cable-guide/)).
   Because one SMPTE run carries video, return, comms, tally and power
   ([Church Production/Hitachi](https://www.churchproduction.com/sponsored/hitachi/smpte-fiber-cabling-simplifies-camera-infrastructures-and-op/)),
   a run error is a five-department error — worth surfacing loudly.

5. **Ship a per-position printed brief, and make it match the live plan.**
   Paper is not a legacy behaviour to be designed away; it is chosen for offline
   robustness and immutability ([Filmustage](https://filmustage.com/blog/digital-vs-paper-call-sheets/))
   and for hand annotation ([mindnapped](https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/)).
   The suite's `print:*` path should produce a one-page **camera card**: position,
   lens, riser, cable/patch, comms channel, tally source, coverage per segment,
   emergency contacts — with a version stamp and change bar so the operator can see at a
   glance whether their printout is stale.

6. **Mobile share is the right shape; aim it at the camera position.**
   The mobile LAN view should default to "my position" — the same camera card, live,
   with changes highlighted. This is the ITV/Cuez outcome
   ([NewscastStudio](https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/))
   reachable without buying a rundown platform. Read-only + check-off matches the
   existing `src/mobile/` design.

7. **Version and change-log the plan, visibly.**
   Named versions and dates are the community's own workaround
   ([EMRG Media](https://www.emrgmedia.com/event-run-of-show-template/)); the suite
   should make "what changed since my printout" a first-class view, not an inference.

8. **Model PTZ presets as documentation, not just device state.**
   A preset list (number → named shot → position) that lives in the project, is
   printable, and can be diffed against the camera answers the documented failure of
   presets silently going stale
   ([ChurchStreamPro](https://churchstreampro.com/ptzoptics-presets-not-recalling-correctly/)).

9. **Attach comms to the position.**
   Which channel, which beltpack, which antenna zone, spare-battery plan. Cheap to
   model, and it addresses the top cause of missed cues
   ([527 Sounds](https://527sounds.com/why-camera-crew-misses-cues-solution/),
   [Stickman Sound](https://stickmansound.com/wireless-comms-for-independent-productions-and-events/)).

10. **Do not build a rundown editor. Build the interface to one.**
    Shoflo and Cuez own that space and the floor-facing problem is already being solved
    there. The suite's differentiator is the *physical* half — positions, cables,
    patches, labels, rigging — which those tools do not model at all. An import/link of
    segment IDs so a camera position can carry "coverage per segment" is enough.

11. **Kit list per position should generate the rental order, not be re-typed into it.**
    Rentman integration already exists in Cable Planner; keying line items to camera
    positions closes the loop between "camera 4 needs a 100× box lens on a heavy head at
    3.2 m" and what actually arrives on the truck.

---

## Sources

Fetched in full (readable in this environment):

- https://github.com/DistroAV/DistroAV/issues/318 — false NDI preview tally when a source appears in multiview; opened 2019-06-17, closed as not planned.
- https://github.com/DistroAV/DistroAV/issues/687 — BirdDog PF120 NDI tally blinking red/green while live; opened 2021-09-27, open.
- https://github.com/bitfocus/companion/issues — issue list (used only to confirm the repo is reachable).
- https://github.com/bitfocus/companion/issues/472 — ProTally / TSL 3.1 support request (2019), example of tally-protocol plumbing.

Read via search-engine summaries of the page (see method note):

- https://527sounds.com/why-camera-crew-misses-cues-solution/
- https://www.slashcam.de/info/Live-Event---Kommunikation-zwischen-Regie-und-Kamera-1020977.html (thread material dated Dec 2019)
- https://www.mediatec.de/studiotechnik/intercom-tally/
- http://www.pmr-funkgeraete.de/forum/threads/pmr-als-intercom-zwischen-kameramann-und-regie.21881/
- https://www.churchproduction.com/education/good-communications-make-for-better-and-safer-productions/
- https://www.churchproduction.com/education/training-volunteer-camera-operators/
- https://www.churchproduction.com/magazine/5-ptz-camera-basics-for-church-techs-and-volunteers/
- https://www.churchproduction.com/sponsored/hitachi/smpte-fiber-cabling-simplifies-camera-infrastructures-and-op/
- https://churchstreampro.com/ptzoptics-presets-not-recalling-correctly/
- https://ptzoptics.com/ptz-presets/
- https://info.shoflo.tv/event-production
- https://shoflo.tv/
- https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day
- https://www.emrgmedia.com/event-run-of-show-template/
- https://events.com/blog/run-of-show/
- https://meyerproinc.com/live-event-run-of-show/
- https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/
- https://www.tvtechnology.com/production/itv-studios-deploys-cuez-live-production-platform
- https://cuez.app/
- https://mason.gmu.edu/~lsmithg/gtvcs.htm
- https://www.screenskills.com/job-profiles/browse/unscripted-tv/technical/camera-operator/
- https://www.prospects.ac.uk/job-profiles/television-camera-operator/
- https://www.linkedin.com/pulse/what-does-studio-camera-operator-do-entertainment-industry-bisbey
- https://sites.google.com/bathspa.ac.uk/tv-technical-training/tvstudio/tv-studios/studio-floor-a/studio-cameras/camera-shots-framing
- https://www.videomaker.com/article/f5/10988-how-to-conduct-a-live-multi-camera-shoot/
- https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/
- https://ablaufregisseur.de/regieplan-vorlage/
- https://www.m-regie.de/post/regieplan-veranstaltung
- https://www.dachverband-tanz.de/fileadmin/dateien_DTD/Fotos/Fotos_Projekte/Fotos_Qualifizierung/How_to_Regieplan_DTD_01.pdf
- https://www.hd-event.de/faq-items/streaming-regieplanung/
- https://www.allbuyone.com/de/backstage/eventlexikon/buehnenplan.html
- https://www.lazi-akademie.de/wiki/messe-event/event-videoproduktion/
- https://www.eventprof.co.uk/production-management/floorplans/
- https://pivotalsl.co.uk/blog/av-system-design-cad-process/
- https://www.camplot.studio/
- https://assets.fis-ski.com/f/252177/cf64948a8b/fis-broadcaster-manual-general-part-2122.pdf
- https://datavideo.com/us/article/307/5
- https://productiondistro.com/blog/smpte-fiber-cable-guide/
- https://www.tvtechnology.com/miscellaneous/triax-vs-fiberoptic-cable
- https://www.tallyengine.com/features/
- https://help.rossvideo.com/graphite-cpc/Tasks/Setup/Video/UMD-NameSetup.html
- https://help.rossvideo.com/carbonite-02/Tasks/Setup/Video/MV-Setup.html
- https://xichtee.com/tsl-broadcast-tally-label-protocol/
- https://forum.vizrt.com/index.php?threads/problems-with-tally-in-camera-panasonic-by-ndi.251037/
- https://support.newtek.com/hc/en-us/articles/360009483974-NDI-Tally-Troubleshooting
- https://streamgeeks.us/how-tally-lights-work/
- https://shop.us.skaarhoj.com/products/tally-light
- https://en.wikipedia.org/wiki/Tally_light
- https://www.blackmagicdesign.com/products/blackmagicursabroadcast/viewfinders
- https://filmustage.com/blog/digital-vs-paper-call-sheets/
- https://sethero.com/blog/best-call-sheet-software-comparison/
- https://storyflow.so/blog/best-shot-list-tools-2026
- https://www.studiobinder.com/blog/video-equipment-rental/
- https://www.studiobinder.com/blog/camera-report-template-pdf-download/
- https://www.theblackandblue.com/2011/12/27/camera-reports/ (2011 — old; cited only for the existence of the camera-report artefact)
- https://skillsengland.education.gov.uk/apprenticeships/st0900-v1-1
- https://www.imagineproducts.com/news/blog/how-to-build-a-reliable-ingest-workflow-for-multi-camera-shoots/
- https://blog.frame.io/2018/10/22/file-naming-conventions/ (2018 — old)
- https://www.tvtechnology.com/opinions/camera-shading-basics
- https://en.wikipedia.org/wiki/Camera_control_unit
- https://www.oreilly.com/library/view/basic-betacam-camerawork/9780240516042/xhtml/chapter47.html
- https://www.tvbeurope.com/live-production/complementing-tradition-integrating-ptz-technology-into-modern-studios
- https://www.newscaststudio.com/2026/04/24/vinten-and-autoscript-bring-unified-answer-to-the-ptz-production-challenge/
- https://ikancorp.com/ptz-vs-traditional-broadcast-cameras-pick-your-perfect-match/
- https://avad3.com/a-clients-guide-to-crew-communication-headsets-a-k-a-comm/
- https://tcfurlong.com/demystify-audio-party-line-intercom-systems/
- https://www.syncoaudio.com/blogs/news/intercom-system-for-video-production-guide
- https://stickmansound.com/wireless-comms-for-independent-productions-and-events/
- https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/
- https://www.geoevent.net/event-stage-design-that-works-on-show-day/
- https://www.corcinoproductions.com/post/livestream-production-for-corporate-events
- https://www.eventstable.com/intellistage-platform-for-camera.html
- https://www.proaim.com/products/proaim-5-7-camera-riser
- https://www.planningcenter.com/services
- https://www.worshipresources.church/how-to-use-planning-center-matrix-to-save-hours-every-month/

Surfaced in search but **not readable** from this environment (titles only — listed for follow-up, not used as evidence):

- https://forum.blackmagicdesign.com/viewtopic.php?f=4&t=211462 — "Tally Light Visibility Options"
- https://soc.org/project/well-do-it-live-the-art-and-craft-of-the-live-operator/ — Society of Camera Operators, "We'll Do it Live: The Art and Craft of the Live Operator"
- https://www.xdcam-user.com/2021/10/sdi-failures-and-what-you-can-do-to-stop-it-happening-to-you/
- https://www.prosoundweb.com/comms-101-a-primer-on-intercom-systems-for-production-work/
- https://www.thebroadcastbridge.com/content/entry/18611/master-control-system-design-part-2-communications
- Reddit (r/VIDEOENGINEERING, r/cinematography, r/livesound) — unreachable; the practitioner-complaint layer is a gap in this dossier.

### Follow-up worth doing when the network allows

Reddit and the trade forums were the intended primary evidence for the "what actually
annoys them" layer and are entirely absent here. Highest-value follow-ups: r/VIDEOENGINEERING
and r/livesound threads on tally and comms; ControlBooth and Blue Room on camera positions
in venues; film-tv-video.de and Veranstaltungstechnik forums for German-language show-day
practice; and Bitfocus Companion / vMix forum threads on PTZ preset and tally handling.
