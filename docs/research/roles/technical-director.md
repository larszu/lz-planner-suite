# Technical Directors / Bildregisseure / Bildmischer

Research dossier for AV Planner Suite. Compiled 2026-08-28.

> **Method and evidence caveat — read this first.**
>
> This dossier was produced under a hard network restriction. The session's WebSearch
> budget was already exhausted (200/200 calls) before the first query for this role could
> run, and the egress proxy allows **only GitHub hosts** (`github.com`, `gist.github.com`,
> `raw.githubusercontent.com`, `codeload.github.com`). Every other domain named in the
> research brief was refused at the proxy: reddit.com, forum.blackmagicdesign.com,
> prosoundweb.com, controlbooth.com, film-tv-video.de, youtube.com, wikipedia.org,
> stackoverflow.com, docs.getontime.no, bitfocus.io, and all `*.github.io` documentation
> sites. Proxy denials were verified against `curl -sS "$HTTPS_PROXY/__agentproxy/status"`.
>
> **What that means for the evidence below.** There is no Reddit, no forum, no trade press
> and no German-language source in this dossier. The entire corpus is *one source type*:
> public GitHub issue trackers and repository documentation for the software this role
> actually operates — Bitfocus Companion and its Blackmagic ATEM / Videohub / HyperDeck /
> vMix modules, TallyArbiter, ontime, Sofie (NRK's TV automation system) and its ATEM
> library. Under [`METHOD.md`](../METHOD.md) that is a tier-1 source ("open-source code and
> issue trackers… what a vendor keeps fixing is what keeps breaking") but it is a *single*
> tier-1 source type, so the cross-source corroboration the frequency rubric asks for is
> only ever *within* one family. Frequency grades are therefore assigned conservatively and
> the rule applied was: `widespread` only where the same complaint appears in **three or
> more independent repositories or from three or more independent reporters across
> several years**; `recurring` where two independent reporters or repositories show it;
> `isolated` otherwise.
>
> **Known blind spots.** Anything not visible in a software issue tracker is missing here:
> comms/intercom load, the social dynamics of the gallery, what happens on the phone and in
> WhatsApp, freelance vs staff differences, and the entire German-language market. Those
> are marked as gaps rather than guessed at. Every issue cited below was opened and read
> at its URL; nothing was inferred from a search-result snippet alone unless explicitly
> marked. Labels follow `METHOD.md`: **[FACT]** read on the cited page, **[INFERENCE]**
> reasoning, **[UNKNOWN]** could not be established.

---

## Who they are / where they sit in the production

The technical director is the person who converts a *plan* into *state*: which physical
source is on which switcher input, which input is on program, what the multiviewer shows,
what is recording, what the tally lamps say, and what the crew sees on their monitors. In
German-speaking practice the roles split further — the **Bildmischer** operates the panel,
the **Bildregisseur/in** calls the shots — but on most events below OB-truck scale it is
one person, and on the smallest shows it is the same person who built the rack.

Three populations show up distinctly in the evidence:

1. **Broadcast / newsroom TDs.** Work downstream of a Newsroom Computer System. The rundown
   is authored elsewhere (ENPS, iNEWS) and ingested over MOS; the TD/automation operator
   plays it out. Sofie's own architecture documentation names the split precisely: a
   **Studio** is "things that are related to the 'hardware' or 'rig'… a representation of
   your gallery, with cameras, video playback and graphics systems, external inputs, sound
   mixers, lighting controls and so on", while a **Show Style** is the look and feel of one
   programme, "dictating how data ingested from the NRCS will be interpreted"
   ([Sofie concepts-and-architecture.md](https://raw.githubusercontent.com/Sofie-Automation/sofie-core/main/packages/documentation/docs/user-guide/concepts-and-architecture.md)).
   **[FACT]** That is the cleanest formal statement in the whole corpus of the thing this
   role lives inside: *the rig* and *the show* are two separate objects that must be
   married for every production.

2. **Event / corporate / streaming TDs.** ATEM or vMix, a router if they are lucky, a
   Stream Deck running Companion, a rundown in a spreadsheet. This is the population that
   dominates the issue trackers.

3. **House-of-worship and volunteer-run TDs.** Highly visible in the Companion tracker and
   unusually candid, because their shows repeat weekly and every inefficiency is paid for
   52 times a year. One Companion feature request describes the population exactly: regular
   Sunday services plus "advent, Christmas Eve, Christmas Day, vocal performances", where
   buttons "have similar, yet slightly different functions in that only one or two actions
   may be different compared to several other buttons"
   ([companion#1793](https://github.com/bitfocus/companion/issues/1793), 2021-11-21). **[FACT]**

**The structural fact that drives everything else:** a source has a *physical* identity
(a camera, a cable, a router output), a *technical* identity (a switcher input number, an
aux, a record channel), and an *editorial* identity (a name a human says out loud —
"Kamera 3", "Referentenlaptop", "VT2"). Those three identities are stored in five to seven
different systems, none of which talk to each other, and the TD is the only person who
knows they are the same thing.

---

## A day in the life

*Chronology below is **[INFERENCE]** — a synthesis of the workflows described inside the
cited issues, not a source in itself. The bracketed evidence is what is actually attested.*

### Prep (days to weeks before)

- Receives the rundown. In the evidence it arrives as a **spreadsheet**. Ontime — a rundown
  and cueing application "made by entertainment and broadcast engineers"
  ([README](https://raw.githubusercontent.com/cpvalente/ontime/master/README.md)) — has
  been asked for Excel/Google-Sheets import and export **sixteen separate times between
  2021-11 and 2026-07**
  ([issue search](https://github.com/cpvalente/ontime/issues?q=is%3Aissue+import+export+excel)).
  The reason is stated plainly in the first of them: "we are mostly using Sheets because of
  the easy collaboration with others. A simple import button would be enough for the
  beginning, and a real-time Sync would be the dream scenario"
  ([ontime#194](https://github.com/cpvalente/ontime/issues/194), 2022-08-20). **[FACT]**
  Even NRK's professional automation stack ships a **Spreadsheet Gateway** — a production
  component whose entire job is "piping data between Sofie Server Core and Spreadsheets on
  Google Drive"
  ([SuperFlyTV/spreadsheet-gateway](https://raw.githubusercontent.com/SuperFlyTV/spreadsheet-gateway/master/README.md)). **[FACT]**
- Builds the **input map**: which source lands on which switcher input. Where a router sits
  in front of the switcher this map is many-to-few — one Companion user describes "using an
  SDI router to change which of the 20 sources are plugged in are routed to which of the 8
  inputs on the ATEM Mini Extreme"
  ([companion-module-bmd-atem#154](https://github.com/bitfocus/companion-module-bmd-atem/issues/154), 2021-09). **[FACT]**
- Builds the **control surface**: Companion pages, buttons, macros. This is where prep time
  goes, and it is largely re-typing last show's surface (see *Time sinks* 3 and 5).

### Load-in

- Patch and label. The router's routing table is set. In at least one venue that table
  exists as a **printed sheet**: "I have a paper sheet of routes for our BMD 40x40 that I
  need to manually enter before each change over", for a hall that alternates baseball and
  softball ([companion-module-bmd-videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9),
  opened 2020-10-28, **still open**). **[FACT]**
- Name everything, everywhere: router source/destination labels, switcher input labels
  (short and long form), multiviewer UMD text, tally-system device names, Companion button
  text. Each is a separate typing job in a separate UI.
- Wire the tally. In TallyArbiter the mental model is two independent lists — *sources*
  (switchers, "arbitrates Preview and Program states") and *devices* (the physical cameras)
  — that the operator maps together by hand
  ([TallyArbiter README](https://github.com/josephdadams/TallyArbiter)). **[FACT]** That
  mapping is a third copy of the input map.

### Rehearsal

- Discover the plan is wrong. Sources moved, an input was added, a laptop turned up that
  was not in the rundown. Every downstream copy of the name now has to be re-typed.
- Discover the automation is wrong. Multiviewer window presets do not recall as programmed
  ([bmd-atem#480](https://github.com/bitfocus/companion-module-bmd-atem/issues/480),
  2026-08-19, open); record actions do not fire when the filename is assembled from more
  than one variable, while the button label still looks correct
  ([bmd-hyperdeck#128](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/128),
  2026-06). **[FACT]**

### Show

- Operate, and relabel while operating. A 2026 Companion request complains that the v5 UI
  costs "two extra clicks every time a button label needs to be changed, which adds up very
  quickly to lots of extra time and hassle when changing lots of labels several times a day,
  several days a week" ([companion#4324](https://github.com/bitfocus/companion/issues/4324),
  2026-07-15). **[FACT]** Relabelling the surface *during* the show day is normal, not
  exceptional.
- Last-minute source changes are routed, not re-patched — and then the labels lie. "We use
  Companion to control our VideoHub router and sometimes the source going to an input on our
  switcher will change, but the label on the multiview won't without editing it manually"
  ([bmd-atem#43](https://github.com/bitfocus/companion-module-bmd-atem/issues/43),
  2020-01-08). **[FACT]**

### Load-out and post

- ISO material has to be identified. Naming is manual and per-device: one user increments
  take numbers by hand across **10–16 cameras** through each deck's config page, wanting
  `Take01_Cam_01.mov, Take02_Cam_01.mov, Take03_Cam_01.mov…`
  ([bmd-hyperdeck#40](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/40),
  2021-03-26, **still open**). **[FACT]**
- Getting the files off the decks is its own project; a purpose-built tool exists solely to
  "streamline the management and transfer of recordings" from HyperDecks over the network
  ([hyperporter](https://github.com/josephdadams/hyperporter)). **[FACT]**
- The show state is saved — as a switcher state file, a Companion config export, or nothing
  at all. Restoring it is not reliable (see *Error sources* 4).

---

## Tools they actually use

Feelings are graded from what the evidence supports; where the corpus only shows *that* a
tool is used and not how people feel about it, that is said.

| Tool | For what | How they feel about it |
|---|---|---|
| ATEM switcher + ATEM Software Control | Program switching, MV layout, input labels, macros, ISO record | Trusted as the source of truth for switcher state — a user notes that "saving and restoring the complete switcher state through ATEM Software Control correctly restores all four Multiview windows with independent sources" where remote control does not ([#480](https://github.com/bitfocus/companion-module-bmd-atem/issues/480)). Resented for making labels a manual, per-place chore. |
| Blackmagic Videohub | Getting more sources than inputs into the switcher | Indispensable, and the reason half the naming problems exist. Save/restore of routing tables has been an open request since 2020 ([#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9)). |
| Bitfocus Companion + Stream Deck | The actual operating surface: routing, macros, record, PTZ presets, comms, timers | The tool they build their show in — and the one they most want to stop re-typing into. Config sync across machines open since 2021 ([#1738](https://github.com/bitfocus/companion/issues/1738)); macro/snippet reuse requested repeatedly ([#1954](https://github.com/bitfocus/companion/issues/1954), [#1793](https://github.com/bitfocus/companion/issues/1793), [#1061](https://github.com/bitfocus/companion/issues/1061)). |
| HyperDeck (or equivalent) | ISO / backup recording | Grudging. Naming is manual, automated naming fails silently ([#128](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/128)), take counters are hand-cranked ([#40](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/40)). |
| TallyArbiter (or a vendor tally system) | Tally/UMD across mixed-vendor kit | Valued precisely because the commercial answers are expensive — one user on router-following tally: "all the products that do this on the market cost £££, I would be willing to exchange some money for this feature" ([#293](https://github.com/josephdadams/TallyArbiter/issues/293), 2021-12). |
| vMix / OBS | Software switching, especially streaming and HoW | Used heavily; in the corpus they appear mainly as *sources of naming and state that other systems mis-read* ([TallyArbiter#756](https://github.com/josephdadams/TallyArbiter/issues/756): vMix API "sending NONE" instead of input names; [#846](https://github.com/josephdadams/TallyArbiter/issues/846): OBS scenes containing groups break device detection). |
| ontime | Rundown, timers, cue sheet, department-facing views | Liked; the pain is at its edges — spreadsheet import parsing ([#971](https://github.com/cpvalente/ontime/issues/971)), Google-Sheets sync overwriting manual entries with blanks ([#1663](https://github.com/cpvalente/ontime/issues/1663)), print/PDF export ([#542](https://github.com/cpvalente/ontime/issues/542)). |
| Sofie / NRCS (ENPS, iNEWS) via MOS | Newsroom rundown ingest and playout | Only visible in the broadcast tier. Its architecture concedes the core problem: rundown data changes underneath a live show, so Sofie instantiates parts to protect what is On Air and to keep an "as played" record separate from the "as planned" one ([concepts doc](https://raw.githubusercontent.com/Sofie-Automation/sofie-core/main/packages/documentation/docs/user-guide/concepts-and-architecture.md)). |
| Excel / Google Sheets | The rundown, the input map, the patch list | The universal substrate. Not liked, not replaceable — chosen for "easy collaboration with others" ([ontime#194](https://github.com/cpvalente/ontime/issues/194)). |
| Paper | The routing sheet, the printed rundown | Still load-bearing ([videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9); [ontime#542](https://github.com/cpvalente/ontime/issues/542)). |

---

## Time sinks

Ranked by strength of evidence times plausible recurrence. Duration figures are given only
where a source supports them; everything else is marked as unquantified.

### 1. Typing the same source name into five to seven systems — `widespread`

A source's name has to be entered into: the router source label, the router destination
label, the switcher input label (usually in a short and a long form), the multiviewer UMD,
the tally system's device list, the control-surface button text, and the rundown. The
corpus shows every one of these as a separate manual job, across four repositories and six
years:

- ATEM input labels have to be changed on the switcher by hand when routing changes
  ([bmd-atem#43](https://github.com/bitfocus/companion-module-bmd-atem/issues/43), 2020;
  [#154](https://github.com/bitfocus/companion-module-bmd-atem/issues/154), 2021).
- Even when the switcher label *is* changed, the multiviewer did not follow — a library-level
  bug titled exactly "Updating input name doesn't update multiviewer"
  ([sofie-atem-connection#59](https://github.com/Sofie-Automation/sofie-atem-connection/issues?q=is%3Aissue+label), closed 2022-04-06).
- Router labels were only made settable from a variable in 2024–25
  ([bmd-videohub#43](https://github.com/bitfocus/companion-module-bmd-videohub/issues/43)),
  and a request for short-name variables was declined
  ([#25](https://github.com/bitfocus/companion-module-bmd-videohub/issues?q=is%3Aissue+label), 2022).
- On the control surface the same name is typed once per button: "Now if I want to change
  the name of a preset (e.g. guitar instead of drums), I have to change the names of all
  three buttons one by one" — three pages of PTZ preset buttons
  ([companion#1266](https://github.com/bitfocus/companion/issues/1266), 2022). **[FACT]**
- And the cost is explicitly framed as cumulative: "lots of labels several times a day,
  several days a week" ([companion#4324](https://github.com/bitfocus/companion/issues/4324), 2026).

**Cost:** minutes per change, many changes per show day. **Consequence when skipped:** the
multiviewer lies (see *Error sources* 1).

### 2. Re-entering the patch/routing plan by hand at every changeover — `recurring`

The strongest single artefact in the corpus: a paper routing sheet for a 40x40 router,
manually re-entered before every event changeover, at a venue that alternates two sports
([bmd-videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9),
open since 2020-10). The requested fix — save the routing table to a file, restore it from a
button — has never been built. Corroborated in kind by
[TallyArbiter#293](https://github.com/josephdadams/TallyArbiter/issues/293), where a
production routes sources to multiviewer windows "without repatching" and then has to
"manually configur[e] the output devices" to match.

**Cost:** unquantified in the source; for a 40x40 router, plausibly tens of minutes per
changeover **[INFERENCE]**.

### 3. Rebuilding the control surface for each show variant — `widespread`

Companion users repeatedly ask for the ability to define an action sequence once and call
it from many buttons:

- "A Macro that does Macro name FOO… Then inside of a button I could call FOO and add on to
  it… This is similar to in code whenever you are using an algorithm of actions repeatedly
  we create a function" ([companion#1954](https://github.com/bitfocus/companion/issues/1954), 2022-03). **[FACT]** Closed as not planned.
- The church case: regular services plus holiday variants, buttons that differ by "only one
  or two actions" ([companion#1793](https://github.com/bitfocus/companion/issues/1793), 2021-11, still open).
- "Linked Button Copy" — open since 2020-04
  ([companion#1061](https://github.com/bitfocus/companion/issues/1061)).
- "Editing Buttons from buttons" — open since 2022-12
  ([companion#2233](https://github.com/bitfocus/companion/issues?q=is%3Aissue+macro)).

That four independent requests for the same abstraction have stood open or been declined
across five years is itself the evidence: the work is being done by copy-paste instead.

### 4. Moving the show between machines and operators — `widespread`

There is no shared show file. A user running three Macs with two Stream Decks that "rotate
between systems depending on scheduling needs" asks for cloud config or a master/slave
arrangement, because changes on one instance do not reach the others
([companion#1738](https://github.com/bitfocus/companion/issues/1738), 2021-09, **open**).
The manual workaround — export and import — is itself unreliable (see *Error sources* 4).
Sharing therefore happens as files passed around: a public repository exists purely to
distribute "config files for Companion that I have made that you can readily import into
your setup" ([CompanionConfigs](https://raw.githubusercontent.com/josephdadams/CompanionConfigs/master/README.md)). **[FACT]**

### 5. Getting the rundown out of the spreadsheet and into the show system — `widespread`

Sixteen ontime issues about Excel/CSV/Sheets import-export between 2021 and 2026, plus a
dedicated Google-Sheets sync feature, plus a production-grade Spreadsheet Gateway in the
Sofie stack. The import is where time is lost: durations that will not parse whether given
as `"60"` or `60`, warning times where "15" parses and "10" does not, and Excel's native
booleans failing on checkbox fields so the user must type the strings `"true"`/`"false"`
([ontime#971](https://github.com/cpvalente/ontime/issues/971), 2024-05). **[FACT]**

### 6. Hand-managing ISO record naming — `recurring`

Manual take-number increments across 10–16 camera decks
([bmd-hyperdeck#40](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/40)),
and a cluster of requests for clip-name and filename variables
([#52, #61, #84, #140](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues?q=is%3Aissue+filename))
showing people trying to automate their way out of it. Control of "ISO record all inputs"
from the surface had to be requested as a feature
([bmd-atem#228](https://github.com/bitfocus/companion-module-bmd-atem/issues/228)).

### 7. Multiviewer layout work — `recurring`

MV layout is configured per-show and recalled per-segment, and the remote path is patchy:
windows 2 and 3 recalling the same source
([bmd-atem#480](https://github.com/bitfocus/companion-module-bmd-atem/issues/480), 2026-08,
open), inverted layout feedback ([#332](https://github.com/bitfocus/companion-module-bmd-atem/issues?q=is%3Aissue+multiviewer)),
quadrant control ([#334](https://github.com/bitfocus/companion-module-bmd-atem/issues?q=is%3Aissue+multiviewer)),
label population on small ATEMs ([#307](https://github.com/bitfocus/companion-module-bmd-atem/issues?q=is%3Aissue+multiviewer)).
The reliable path is the switcher's own state save/restore — i.e. a binary blob no other
department can read. **[FACT / INFERENCE]**

---

## Double data entry

What demonstrably gets typed more than once:

| Information | Systems it is typed into | Evidence |
|---|---|---|
| **Source name** ("Kamera 3", "Laptop Referent") | Router source label, router destination label, switcher input label (short + long), multiviewer UMD, tally-system device name, control-surface button text, rundown column | [bmd-atem#43](https://github.com/bitfocus/companion-module-bmd-atem/issues/43), [#154](https://github.com/bitfocus/companion-module-bmd-atem/issues/154), [sofie-atem-connection#59](https://github.com/Sofie-Automation/sofie-atem-connection/issues?q=is%3Aissue+label), [bmd-videohub#43](https://github.com/bitfocus/companion-module-bmd-videohub/issues/43), [companion#1266](https://github.com/bitfocus/companion/issues/1266) |
| **Input map** (source → switcher input) | The switcher, the router routing table, the tally system's source/device mapping, the paper sheet, the rundown | [bmd-videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9), [TallyArbiter README](https://github.com/josephdadams/TallyArbiter) + [#293](https://github.com/josephdadams/TallyArbiter/issues/293) |
| **Rundown / running order** | Excel or Google Sheets (authoring), the rundown app (playout), the printed copy, the switcher operator's own notes | [ontime#194](https://github.com/cpvalente/ontime/issues/194), [#542](https://github.com/cpvalente/ontime/issues/542), [#1327](https://github.com/cpvalente/ontime/issues?q=is%3Aissue+import+export+excel), [spreadsheet-gateway](https://raw.githubusercontent.com/SuperFlyTV/spreadsheet-gateway/master/README.md) |
| **Preset / cue names** | Every button that references the preset, on every page | [companion#1266](https://github.com/bitfocus/companion/issues/1266) — three pages, three edits |
| **Take / clip names** | Each recording deck, individually, per take | [bmd-hyperdeck#40](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/40) |
| **Per-department rundown columns** | The master sheet and the rundown app's custom fields — and the sync between them destroys manual edits | [ontime#1663](https://github.com/cpvalente/ontime/issues/1663): pushing from the app "overwrites my manual entries with empty cells" **[FACT]** |
| **Whole show configuration** | Each machine that runs the surface | [companion#1738](https://github.com/bitfocus/companion/issues/1738) |

The pattern underneath all of these: **there is no identity for a source.** Every system
stores a *string*, and the strings are kept in sync by a human retyping them.

---

## Error sources

### 1. The multiviewer lies after a routing change — `widespread`, high consequence

The single most attested failure in the corpus. Routing changes upstream; the label on the
multiviewer does not ([bmd-atem#43](https://github.com/bitfocus/companion-module-bmd-atem/issues/43));
and when the label *is* changed, the multiviewer may not update
([sofie-atem-connection#59](https://github.com/Sofie-Automation/sofie-atem-connection/issues?q=is%3Aissue+label)).
**Consequence:** the TD, the director calling the shot, and the camera ops all read a
picture that is labelled as something else. The cost is a wrong source on program, which is
unrecoverable in a live show. **[FACT for the mechanism, INFERENCE for the consequence.]**

### 2. Tally shows the wrong camera — `widespread`

Multiple independent, dated reports of tally state not matching switcher state:

- Two cameras lighting red simultaneously from a single PGM change
  ([TallyArbiter#794](https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+tally), 2025-03).
- ATEM source 1 always binding to Aux instead of the selected bus
  ([#990](https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+tally), 2026-06).
- SuperSource: tally stays lit after the box source is changed, and the multiviewer
  indicator and the tally disagree ([#453](https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+tally), 2022-05). **[FACT]**
- vMix returning `NONE` instead of input names for most inputs, intermittently, on two
  machines ([#756](https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+tally), 2024-10).

**Consequence:** a camera operator reframes or walks a live shot, or freezes on a dead one.

### 3. A recording silently does not happen — `recurring`, high consequence

The HyperDeck record action fails when the filename is assembled from more than one
variable — and the *button label renders correctly*, so the surface shows no fault
([bmd-hyperdeck#128](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/128),
2026-06). **[FACT]** Related: on an ATEM Mini Extreme ISO only one input was detected by
the tally layer while the rest reported `None`
([TallyArbiter#890](https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+tally), 2026-01).
**Consequence:** the ISO does not exist, and nobody finds out until post.

### 4. Restoring the show configuration does not restore the show — `recurring`

Companion export/import is the de-facto show-file mechanism, and it has repeatedly failed
in ways that leave a *plausible-looking but non-functional* surface: after import the ATEM
connection "shows 'Connecting' (forever)" and button feedbacks "are NOT preserved" while
the button titles survive ([companion#3104](https://github.com/bitfocus/companion/issues/3104), 2025-01). **[FACT]**
Also: import failures and timeouts in 3.5–3.5.1
([#3256](https://github.com/bitfocus/companion/issues?q=is%3Aissue+%22export%22+config+share)),
surface settings excluded from import/export
([#3329](https://github.com/bitfocus/companion/issues?q=is%3Aissue+%22export%22+config+share)),
a missing "replace current configuration" option
([#3061](https://github.com/bitfocus/companion/issues?q=is%3Aissue+%22export%22+config+share)).
**Consequence:** the buttons look right and do nothing — discovered during rehearsal at
best, on air at worst.

### 5. Rundown data that changes under a live show — `recurring`, architecturally conceded

Sofie's documentation is explicit that this is a designed-for hazard: parts and pieces are
copied into instances before playback specifically to protect the Next and On Air parts,
"preventing accidental changes that could surprise the producer/director", and to make it
possible to inspect the "as played" state independently of the "as planned" state ingested
from the NRCS ([concepts doc](https://raw.githubusercontent.com/Sofie-Automation/sofie-core/main/packages/documentation/docs/user-guide/concepts-and-architecture.md)). **[FACT]**
The same document describes **Buckets** — a place for material created during production
that exists outside the rundown entirely, for "breaking-news formats where quick turnaround
video editing may require circumvention of the regular flow of show assets and programming
via the NRCS". **[FACT]** That is a vendor admitting, in an architecture document, that the
plan and the show diverge and that the system must survive it.

### 6. Spreadsheet round-trips destroy data — `recurring`

Ontime's Google-Sheets push writes empty cells over manual entries in custom fields
([#1663](https://github.com/cpvalente/ontime/issues/1663), 2025-06); import mis-parses
durations, warning times and booleans depending on how Excel stored them
([#971](https://github.com/cpvalente/ontime/issues/971), 2024-05); an export of a rundown
lost its automations entirely ([#2125](https://github.com/cpvalente/ontime/issues?q=is%3Aissue+import+export+excel), 2026-07).
**Consequence:** the department columns other people rely on quietly go blank.

---

## Paper / Excel / WhatsApp inventory

**On paper — attested:**

- **The router patch sheet.** A printed list of routes for a 40x40 Videohub, manually
  re-entered at every changeover ([bmd-videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9)). **[FACT]**
- **The printed rundown.** Requested as a first-class feature: a print view with "white
  background, no / very few colored boxes" for printing or PDF export
  ([ontime#542](https://github.com/cpvalente/ontime/issues/542), delivered 2024-02). The
  request does not say who receives the printout **[UNKNOWN]** — but the design constraint
  (kill the colour so it survives a monochrome printer) tells you it is meant for paper on a
  desk, not a screen. **[INFERENCE]**

**In Excel / Google Sheets — attested:**

- **The rundown / running order.** The dominant authoring medium, chosen for collaboration
  ([ontime#194](https://github.com/cpvalente/ontime/issues/194)); sixteen import/export
  issues 2021–2026; a dedicated Google-Sheets sync; and a production Spreadsheet Gateway in
  the Sofie stack.
- **Per-department columns on the rundown** ("custom fields" in ontime terms), which is how
  audio, graphics, lighting and camera notes ride along on the same document
  ([#1663](https://github.com/cpvalente/ontime/issues/1663),
  [#991, #1729](https://github.com/cpvalente/ontime/issues?q=is%3Aissue+cuesheet+custom+fields)). **[FACT]**
- **The exported rundown as XLS/CSV** for people who will not open the show tool
  ([#1270, #1327, #113](https://github.com/cpvalente/ontime/issues?q=is%3Aissue+import+export+excel)). **[FACT]**

**Over WhatsApp / e-mail:** **[UNKNOWN]** — not observable in this corpus. The closest
attested proxy is that show configurations are distributed as **files people hand each
other** ([CompanionConfigs](https://raw.githubusercontent.com/josephdadams/CompanionConfigs/master/README.md))
and that config does not sync between machines
([companion#1738](https://github.com/bitfocus/companion/issues/1738)) — i.e. the transport
is out-of-band by definition. Which out-of-band channel is used could not be established
here and should be the first thing checked when forum and Reddit access is restored.

---

## Missing interfaces

Handovers that demonstrably break, in the order they hurt:

1. **Router → switcher → multiviewer → tally.** Four systems that each hold their own copy
   of "what is on this input", with no propagation. Requests to close each link exist
   separately and were built late or not at all: label-follows-router
   ([bmd-atem#154](https://github.com/bitfocus/companion-module-bmd-atem/issues/154)),
   label-from-variable ([bmd-videohub#43](https://github.com/bitfocus/companion-module-bmd-videohub/issues/43)),
   tally-follows-router-destination ([TallyArbiter#293](https://github.com/josephdadams/TallyArbiter/issues/293),
   closed *not planned*). **[FACT]**
2. **Rundown → control surface.** No path. The rundown lives in a sheet or a rundown app;
   the buttons are built by hand. A Companion search for rundown integration returns
   effectively nothing ([search](https://github.com/bitfocus/companion/issues?q=is%3Aissue+rundown)),
   while ontime↔Companion issues are exclusively about *timers* — clock-out, aux-timer
   toggling, OSC rundown selection
   ([ontime#1841, #1835, #1484, #2079](https://github.com/cpvalente/ontime/issues?q=is%3Aissue+companion)). **[FACT]**
   The show's *content* never reaches the surface; only its clock does.
3. **Plan → rig.** Nothing carries an input map from a planning document into the devices.
   The one attested transport is a printed sheet and a keyboard
   ([bmd-videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9)).
4. **Rig → other departments.** The reliable representation of switcher state is the
   switcher's own save file ([bmd-atem#480](https://github.com/bitfocus/companion-module-bmd-atem/issues/480)),
   which audio, lighting and the producer cannot read.
5. **Show → post.** ISO clip naming is manual per deck
   ([bmd-hyperdeck#40](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/40)),
   and nothing records which physical source was on which input at which time, so the
   as-played mapping is reconstructed by memory in post. **[INFERENCE]** — the absence of
   any such artefact in the corpus is the evidence.
6. **Operator → operator.** No shared show file across machines
   ([companion#1738](https://github.com/bitfocus/companion/issues/1738)); no multi-user
   editing of the rundown for a house doing ~65 events a year
   ([ontime#1325](https://github.com/cpvalente/ontime/issues/1325), closed unimplemented). **[FACT]**

---

## What they would want

Their own words and their own asks, not ours:

- **Labels that follow the signal.** "I want the labels on the ATEM to update when I change
  sources on the SDI router to match" ([bmd-atem#154](https://github.com/bitfocus/companion-module-bmd-atem/issues/154)).
- **Tally that follows the router.** A device that can "be configured to follow a specific
  router destination, and send the appropriate tally/UMD based on that router's source" —
  with an explicit willingness to pay, because "all the products that do this on the market
  cost £££" ([TallyArbiter#293](https://github.com/josephdadams/TallyArbiter/issues/293)).
- **A routing table as a file, recalled by a button.** Save the current routes to a named
  file, restore them per event type, "so that the router will initialize to a known state
  before each event" ([bmd-videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9)).
- **Functions, not copies.** A named, callable action sequence they can reuse and extend —
  "similar to in code whenever you are using an algorithm of actions repeatedly we create a
  function" ([companion#1954](https://github.com/bitfocus/companion/issues/1954)); or
  "snippets" for the near-identical variants of a weekly show
  ([companion#1793](https://github.com/bitfocus/companion/issues/1793)).
- **One name, many places.** Link buttons so that "when I change the name of one of them,
  all the linked buttons apply this change" ([companion#1266](https://github.com/bitfocus/companion/issues/1266)).
- **Rename fast.** Fewer clicks to change button text, because it happens "several times a
  day, several days a week" ([companion#4324](https://github.com/bitfocus/companion/issues/4324)).
- **The rundown where the rundown already is.** Live two-way sync with Google Sheets, not
  an import — "a real-time Sync would be the dream scenario"
  ([ontime#194](https://github.com/cpvalente/ontime/issues/194); the ask is repeated in
  [#1054](https://github.com/cpvalente/ontime/issues?q=is%3Aissue+google+sheets)).
- **A printable rundown** that survives a black-and-white printer ([ontime#542](https://github.com/cpvalente/ontime/issues/542)).
- **Counters and naming for ISO takes** driven from the surface rather than 16 config pages
  ([bmd-hyperdeck#40](https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/40)).
- **One configuration, many machines** — cloud storage or a master instance others refresh
  from ([companion#1738](https://github.com/bitfocus/companion/issues/1738)).

---

## Implications for AV Planner Suite

Ordered by evidence strength, not by build cost.

1. **Make the source an object with an identity, not a string.** The single most attested
   pain in this dossier is one name being retyped into five to seven systems and drifting.
   Cable Planner already models equipment, cables and signal flow; the leverage is to make
   *one* source record own its physical identity, its switcher input, its router
   source/destination, its short and long label, its tally address and its MV window — and
   to treat every device's label field as a *rendering* of that record. This is exactly what
   the suite's existing ATEM/Videohub label features ([cable-planner#287, #290, #502](https://github.com/larszu/cable-planner/issues/502))
   are reaching for; the research says finish it and make it the spine.
2. **Ship the patch/routing plan as a recallable artefact.** A named routing state that can
   be exported, diffed and pushed to a Videohub answers a request that has stood open in the
   ecosystem since 2020 and today runs on a printed sheet. Per-event-type presets
   ("baseball"/"softball", "Show A"/"Show B") is the shape users asked for.
3. **Push labels outward; never ask for them twice.** Generating ATEM input labels, Videohub
   source/destination labels, multiviewer UMD text and a TSL/tally mapping table *from the
   plan* is a differentiator no competitor in this corpus offers as one operation, and it
   removes the mechanism behind the two highest-consequence errors (multiviewer lies, tally
   lies).
4. **Model "as planned" vs "as built/as played" explicitly.** Sofie treats this as a
   first-class architectural concern, and the field evidence (labels that drift, MV presets
   that do not recall, imports that restore a plausible but broken surface) says the plan
   and the rig diverge constantly. A read-back/verify pass — *the rig currently says X, the
   plan says Y* — is a feature the ecosystem does not have. It also produces the artefact
   post-production currently lacks: what was actually on which input.
5. **Do not try to own the rundown; interoperate with the spreadsheet.** Sixteen issues over
   five years and a dedicated gateway in a broadcaster's stack say the rundown will keep
   living in Excel and Google Sheets. Import that tolerates how humans really fill cells
   (ontime's parsing failures are a checklist of what to get right), export to XLSX/CSV, and
   a print/PDF view that survives a monochrome printer. Never write blanks over a column a
   human filled in ([ontime#1663](https://github.com/cpvalente/ontime/issues/1663) is the
   cautionary tale).
6. **Emit the surface, don't make them build it twice.** A Companion config export generated
   from the plan — buttons pre-labelled with the real source names, macros for the routing
   presets — turns the suite's plan into the operator's working surface, and lands in a
   distribution channel (config files traded between people) that already exists. The
   suite's own intercom already ships a Companion module
   ([broadcast-intercom](https://github.com/larszu/broadcast-intercom)); the same pattern
   applied to the switcher plan is a short path to daily use.
7. **Treat the multiviewer layout as planning data.** MV window assignment is currently a
   per-show hand job whose reliable storage is an opaque switcher state file. The suite
   already loads ATEM MV setup ([cable-planner#288](https://github.com/larszu/cable-planner/issues/288));
   making the MV layout a planned, printable, shareable object — with the labels coming from
   the source records — serves the TD, the camera ops and the director in one artefact.
8. **Give ISO recording a naming plan.** Deck-by-deck, take-by-take manual naming is
   attested, and the automation people build for it fails silently. A per-project naming
   scheme (`<show>_<take>_<sourcename>`), derived from the source records and pushed to the
   decks, is a small feature against a high-consequence failure.
9. **What not to build.** Do not build a rundown/timer application — ontime exists, is well
   regarded, is open source and is already integrated with the same surface layer. Do not
   build a tally engine — TallyArbiter occupies that niche. The suite's advantage is
   upstream of both: owning the *plan* they both consume, and being the only thing that
   knows a source's physical, technical and editorial identity are the same object.

---

## Gaps in this dossier (to fill when the network allows)

- **Comms/intercom load** — the brief asked specifically; nothing usable exists in a GitHub
  issue tracker. Needs ProSoundWeb, Blue Room, r/VIDEOENGINEERING.
- **WhatsApp/e-mail traffic** — unobservable here; needs practitioner forums.
- **German-language practice** — no reachable source. Needs film-tv-video.de,
  production-partner.de, VPLT material, Veranstaltungstechnik forums.
- **Broadcast-tier TDs (OB truck, station gallery)** — under-represented; the corpus skews
  to event, streaming and house-of-worship because those populations file issues on
  open-source tools. Sofie is the only broadcast-tier source used.
- **Time quantification** — almost no source states a duration. Every time figure in this
  dossier is either absent or flagged as inference.

---

## Sources

Every URL below was opened during this research. All are GitHub; no other host was
reachable.

**Bitfocus Companion (control surface)**

- https://github.com/bitfocus/companion/issues/1738 — config sync across machines (2021, open)
- https://github.com/bitfocus/companion/issues/1954 — macro library request (2022, closed not planned)
- https://github.com/bitfocus/companion/issues/1793 — snippets / callable triggers, church workflow (2021, open)
- https://github.com/bitfocus/companion/issues/1266 — synchronise button names across pages (2022)
- https://github.com/bitfocus/companion/issues/4324 — faster button text editing (2026, open)
- https://github.com/bitfocus/companion/issues/3104 — export/import loses feedbacks, ATEM stuck connecting (2025)
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+macro
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+%22export%22+config+share
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+multiviewer
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+rundown
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+csv+import+buttons
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+intercom
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+paper
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+confirm+accidental+press
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+dynamic+button+text+source+name+variable
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+template+different+show+reuse (no results)
- https://github.com/bitfocus/companion/issues?q=is%3Aissue+ontime+timer+rundown+trigger (no results)

**Blackmagic modules (switcher, router, decks)**

- https://github.com/bitfocus/companion-module-bmd-atem/issues/43 — multiview label does not follow router (2020)
- https://github.com/bitfocus/companion-module-bmd-atem/issues/154 — set ATEM input label from Companion, 20 sources into 8 inputs (2021)
- https://github.com/bitfocus/companion-module-bmd-atem/issues/228 — ISO record all inputs control (closed 2024)
- https://github.com/bitfocus/companion-module-bmd-atem/issues/480 — MV windows 2 and 3 recall same source (2026, open)
- https://github.com/bitfocus/companion-module-bmd-atem/issues?q=is%3Aissue+multiviewer
- https://github.com/bitfocus/companion-module-bmd-atem/issues?q=is%3Aissue+macro
- https://github.com/bitfocus/companion-module-bmd-videohub/issues/9 — paper sheet of routes, save/restore routing table (2020, open)
- https://github.com/bitfocus/companion-module-bmd-videohub/issues/43 — label from variable (2024)
- https://github.com/bitfocus/companion-module-bmd-videohub/issues?q=is%3Aissue+label
- https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/40 — manual take counter across 10–16 cameras (2021, open)
- https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues/128 — record fails with multi-variable filename (2026)
- https://github.com/bitfocus/companion-module-bmd-hyperdeck/issues?q=is%3Aissue+filename
- https://github.com/bitfocus/companion-module-studiocoast-vmix/issues?q=is%3Aissue+input+number+changed+name

**Tally / UMD**

- https://github.com/josephdadams/TallyArbiter — README, sources/devices model
- https://github.com/josephdadams/TallyArbiter/issues/293 — tally follows router destination (2021, closed not planned)
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+tally — issues #794, #990, #453, #756, #890, #846, #279, #562, #26 (2020–2026)
- https://github.com/josephdadams/TallyArbiter/issues?q=is%3Aissue+bulk+add+devices+import (no results)
- https://github.com/josephdadams?tab=repositories — the surrounding tool ecosystem (TimeKeeper, midi-relay, PresentationBridge, tsl-tester, CompanionConfigs)
- https://raw.githubusercontent.com/josephdadams/CompanionConfigs/master/README.md — configs distributed as importable files
- https://github.com/josephdadams/hyperporter — HyperDeck recording transfer/management

**Rundown / cueing**

- https://raw.githubusercontent.com/cpvalente/ontime/master/README.md
- https://github.com/cpvalente/ontime/issues/194 — sync with Google Sheets, "easy collaboration" (2022)
- https://github.com/cpvalente/ontime/issues/542 — print view / PDF export (2024)
- https://github.com/cpvalente/ontime/issues/971 — spreadsheet import parsing failures (2024)
- https://github.com/cpvalente/ontime/issues/1325 — multi-event / multi-user, ~65 events a year (2024)
- https://github.com/cpvalente/ontime/issues/1663 — Google sync writes empty cells over manual entries (2025)
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+import+export+excel — 16 issues, 2021–2026
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+google+sheets
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+print+PDF
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+companion
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+cuesheet+custom+fields
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+whatsapp+OR+email+OR+crew
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+paper

**Broadcast automation (Sofie / NRK)**

- https://raw.githubusercontent.com/Sofie-Automation/sofie-core/main/packages/documentation/docs/user-guide/concepts-and-architecture.md — Studio vs Show Style, Rundown/Segment/Part/Piece, AdLibs, Buckets, PartInstances ("as played" vs "as planned")
- https://github.com/Sofie-Automation/sofie-core/tree/main/packages/documentation/docs/user-guide
- https://github.com/Sofie-Automation/sofie-core/issues?q=is%3Aissue+rundown+change+during+on+air
- https://github.com/Sofie-Automation/sofie-core/issues/1768 — BBC-reported part-duration/on-air-line discrepancy (2026)
- https://github.com/Sofie-Automation/sofie-atem-connection/issues?q=is%3Aissue+label — #59 "Updating input name doesn't update multiviewer" (2022)
- https://raw.githubusercontent.com/SuperFlyTV/spreadsheet-gateway/master/README.md — Sofie's Google-Sheets rundown gateway

**Intercom (searched, thin)**

- https://github.com/Eyevinn/intercom-manager — infrastructure only; no operational workflow detail

**First-party (AV Planner Suite repositories, for the implications section)**

- https://github.com/larszu/cable-planner/issues/288 — "MV Setup: Multiviewer setup von Atem laden"
- https://github.com/larszu/cable-planner/issues/502 — "Videohub Control Labels"
- https://github.com/larszu/broadcast-intercom — README (Companion module, show configs, routing matrix)
- multicam-planner README (read locally)

**Blocked and therefore absent:** reddit.com, forum.blackmagicdesign.com, prosoundweb.com,
controlbooth.com, blue-room.org.uk, film-tv-video.de, production-partner.de, tvbeurope.com,
newscaststudio.com, thebroadcastbridge.com, youtube.com, en.wikipedia.org, stackoverflow.com,
docs.getontime.no, bitfocus.io, all `*.github.io` sites. GitHub's own global search
(`github.com/search`) requires authentication for anonymous issue search and returned HTTP 429
after repeated use; repository-scoped issue search remained available and is what was used.
