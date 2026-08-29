# AV industry software landscape

The cross-segment synthesis required by section 29 of the research mandate. It summarises what
the market is, and derives the one structural opportunity that the segment dossiers agree on.

Read `../METHOD.md` first for the source rubric and the frequency grading. Per-segment evidence
lives in `../landscape/` and `../pain-points/`; per-role evidence in `../roles/`.

> **Read this first.** The research ran in a sandbox that blocks most of the public web —
> Reddit, G2, Capterra, Wikipedia and nearly every vendor domain were unreachable; GitHub was
> not. Findings sourced from open-source repositories were read directly and are solid; claims
> about commercial products mostly rest on search-engine summaries, and pricing is largely
> unverifiable here. `../METHOD.md` sets out exactly what was reachable and what that does to
> each conclusion below, including this document's central one. Do not quote a figure from this
> corpus commercially without re-checking it on open egress.

Status: complete — all sixteen segments (landscape and pain points) and all eleven roles. The
competitor-side analysis is in `COMPETITOR-PAIN-SYNTHESIS.md`, which adds two findings this
document could not see from the landscape pass alone. **The central finding below is
over-determined** — it was reached independently by every completed segment agent, none of which
could see the others' output.

## The central finding: the market is all runtime and no design time

Eight segment researchers, working independently and without shared context, each arrived at the
same conclusion in their own vocabulary:

| Segment | Verbatim conclusion |
| --- | --- |
| Show control | "Nothing plans the show control; everything only runs it." |
| Media / playback | "Nothing plans the show before the show file exists. Every product in this dossier is a *runtime*." |
| Tally | "Nobody plans tally — they only run it. Every product here is a runtime." |
| Camera control / RCP | "Nobody plans the control topology before the truck loads." |
| Intercom | "They are runtime tools that assume the plan already exists somewhere else." |
| Broadcast production management | "The technical layer is missing entirely. Not one product models a signal path, a patch, a cable, a connector type, a rack unit, an intercom panel key, a tally assignment or a camera position." |
| Event / rental management | "These systems know you have twelve cameras; none knows what plugs into what." |
| Technical planning | "No tool has both a real cable data model and AV signal semantics." |

Six independent agents converging on "this segment has no design-time artefact" is the strongest
signal in the corpus. It is not a gap in one product. It is the shape of the whole market: the
industry has excellent tools for *operating* a show and essentially none for *specifying* one.

The gap has a precise location. Every segment has a runtime that holds the truth while the show
is live, and a commercial system that holds the truth while the show is being sold. Between them
sits the technical specification of the show — and it lives, universally, in Excel, Visio, Word
and printouts.

**The corollary that makes this actionable:** because no design-time artefact exists, no
interchange format exists either. Intercom has "no interchange format — none, from anyone",
against lighting's GDTF/MVR and video's NMOS. Show control has none. Media playback has no cue
interchange. Camera paint has no neutral scene format. There is nothing to be compatible *with*,
which means a design-time format does not have to displace an incumbent. That is unusual and it
lowers the entry cost dramatically.

## The second finding: identity is retyped five to eight times, and everyone knows it

The role research found the same thing from the other end. Four professions, researched
independently, each named identity duplication as their top widespread pain:

| Role | Finding | Cost |
| --- | --- | --- |
| Camera operator | "One camera position identity that flows into every downstream system instead of being retyped" — 11 hand-typed copies | hours per show |
| Video engineer / shader | "Stop typing camera identity into six to eight systems" — CCU label, RCP assignment, router source, MV window, switcher input, tally/UMD map, ISO record map | days per project |
| Technical director | "One source identity that propagates its name everywhere" — 5 to 7 separate UIs | minutes, constantly |
| Audio engineer | "One channel list that projects into every audience view" — rider, patch list, monitor mixes, stage plot, console scene | hours per show |

The consequences are not cosmetic. The tally dossier records the FlexTally war story: camera 1
lived on TSL address 12 because input 1 had died, and the crew found out only by sniffing packets
during a service. The technical-director dossier records multiviewers and tally lying about which
camera is live — two of the highest-consequence errors in a live gallery — both caused by a
hand-maintained mapping table drifting from the switcher.

This is the same defect as the first finding, seen from the user's side. Identity is retyped
*because* there is no design-time record for it to live in.

## The third finding: offline exists, but always for the wrong half

Offline capability is not simply missing — it is systematically mis-targeted.

- Rental ERP: where offline exists at all (Flex, EZRentOut) it covers **warehouse scanning**.
  Nobody offers an offline-capable *planning and quoting* client (`landscape/event-rental-management.md`).
- Technical planning: "Offline-first is a self-hosting story, not a laptop story." NetBox,
  Nautobot, RackTables and openDCIM are offline only in the sense that you may run the database
  server yourself. None is a thing an engineer opens on a laptop in a truck with no network.
- Broadcast production management: only Ontime, Ross DashBoard and Bitfocus Companion genuinely
  run with the internet gone. And there is a vocabulary trap worth knowing — **Cinegy uses
  "offline" to mean "not on air"**, not "without internet". Vendors reuse the word; it cannot be
  taken at face value in a feature comparison.

The place where connectivity actually fails — an OB truck in a field, a hall with saturated
Wi-Fi, a basement dimmer room — is precisely where the planning documents are needed and
precisely where the cloud products stop.

## The fourth finding: pricing is opaque, segment-wide

Not one product in the camera-control segment has a verifiable public price; the licensing
document's own answer is "contact support". The intercom researcher could not verify a single
price for a single product, while noting the corroborating signal that several of those vendors
publish complete Companion modules with port numbers and action lists and still no reachable
price.

The consequence is a real user problem, not just an inconvenience for this research: **budget
comparison at planning time is impossible for the buyer.** A planner that can state equipment
cost from its own inventory is doing something the incumbents structurally cannot.

## What the market genuinely does well, and we should not try to beat

Honesty requirement from `METHOD.md`: the failure mode of competitive research is concluding
that everyone is bad. They are not.

- **Rental ERPs are excellent at the commercial chain.** Quote, availability, sub-hire, invoice,
  crew cost, equipment utilisation reporting. Rentman and Current RMS have a decade of edge cases
  in them. We should integrate, not reimplement — cable-planner's existing Rentman client is the
  right posture.
- **Lighting has already solved interchange.** GDTF and MVR are real, adopted standards with a
  fixture library ecosystem behind them. light-planner emitting valid MVR is worth more than any
  proprietary format we could invent.
- **NetBox has the best cable path model in existence** — front/rear ports, path tracing,
  terminations. Its gap is AV semantics (its cable-type enum has no SDI, HDMI, XLR or audio
  type at all), not modelling quality. Borrow the model; add the semantics.
- **Companion is the de-facto integration bus of live production**, free and everywhere.
- **The runtimes are good runtimes.** QLab, Resolume, disguise, grandMA, ATEM, Dante Controller
  are mature and trusted. Nothing here suggests building a competing runtime.

## Where the market's white space maps onto what already exists

The suite is unusually well positioned for this specific gap, because the expensive half is
already built. `cable-planner` alone carries ~113,650 lines including a rental-grade inventory
(cases, storage tree, units, service history, barcode/QR, pack lists), port-and-connector
modelling with compatibility levels, ATEM and Videohub label export, NetBox and Rentman clients,
CRDT collaboration, and atomic local-file persistence. See `../repos/INVENTORY.md`.

The market analysis says the missing piece is not more entities. It is the **spine that connects
them and the projections that come off it**:

1. A design-time record for a production that survives outside any vendor's runtime.
2. One identity per real-world thing, with every device label treated as a *rendering* of that
   identity rather than as its own truth.
3. Export of that identity into the systems that today are typed by hand — switcher mnemonics,
   UMD/TSL names, multiviewer labels, tally maps, router labels, console scenes, patch sheets,
   pack lists, tech riders.
4. Offline, on a laptop, in a truck.

## Caveats

- All sixteen segments are now complete, landscape and pain points both; the later segments did
  not overturn the convergence above. The corpus's real gap is now the *source mix* rather than
  coverage: the pain evidence is GitHub-weighted because review sites and Reddit were blocked,
  which under-represents closed commercial products. See `../METHOD.md`.
- Several pricing and mobile-app questions are recorded as UNKNOWN rather than guessed, notably
  intercom mobile client quality — an explicit analysis target that could not be met and should be
  the first thing re-attempted.
- The claim "no interchange format exists" is a negative, proven by exhaustive absence across the
  sources read. Negatives are weaker than positives. Each dossier states the check that would
  falsify it.
