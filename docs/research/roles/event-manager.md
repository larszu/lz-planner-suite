# Event / Show Managers / Veranstaltungsleiter

Research dossier for AV Planner Suite. Compiled 2026-08-29.

> ## Method and evidence caveat — read this before trusting any claim below
>
> **The network restriction.** This session's `WebSearch` budget was already exhausted
> (200 of 200 calls) before the first query for this role could be issued, and the egress
> proxy admits **only GitHub hosts**. Every other domain in the research brief was refused
> at `CONNECT`, verified individually this session with `curl`:
> `www.reddit.com`, `controlbooth.com`, `www.prosoundweb.com`, `blue-room.org.uk`,
> `www.film-tv-video.de`, `www.production-partner.de`, `www.vplt.org`, `en.wikipedia.org`,
> `de.wikipedia.org`, `duckduckgo.com`, `lite.duckduckgo.com`, `html.duckduckgo.com`,
> `www.bing.com`, `r.jina.ai`. `WebFetch` on `old.reddit.com` returned
> "Claude Code is unable to fetch". Proxy state confirmed via
> `curl -sS "$HTTPS_PROXY/__agentproxy/status"`, whose `recentRelayFailures` list shows
> `403 to CONNECT (policy denial)` for non-GitHub hosts.
>
> **Consequence, stated plainly.** There is **no Reddit thread, no professional forum post,
> no trade-press article, no YouTube comment, no job posting and no German-language page**
> read first-hand in this dossier. The brief asked for all of them. They are not here.
>
> **What *was* read.** Two channels, both genuine:
>
> 1. **The GitHub issue-search API**, scoped per repository. **59 issue bodies** were read in
>    full, with dates and open/closed state, principally from
>    [`cpvalente/ontime`](https://github.com/cpvalente/ontime) — the GPL-3 run-of-show and
>    rundown tool that this exact role operates — plus `frappe/erpnext`,
>    `Sofie-Automation/sofie-core`, `bitfocus/companion` and `larszu/cable-planner`.
>    Under [`METHOD.md`](../METHOD.md) this is a tier-1 source: the people filing these
>    issues are working show callers, event-company owners, festival crew and production
>    assistants describing their own workflow in order to ask for something.
> 2. **This repository's own corpus** — [`workflow-chain.md`](../workflow-chain.md),
>    [`roles/camera-operator.md`](camera-operator.md),
>    [`roles/production-manager.md`](production-manager.md),
>    [`roles/streaming-engineer.md`](streaming-engineer.md),
>    [`landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md),
>    [`landscape/event-rental-management.md`](../landscape/event-rental-management.md).
>    These were compiled in earlier sessions and carry their URLs, **but their own method
>    sections state that their pages were reached through search-engine summaries rather
>    than opened.** They are one remove from the source.
>
> **Labels used throughout:**
>
> | Label | Meaning | Weight |
> |---|---|---|
> | **[READ]** | I opened this URL in this session and read it. In practice: a GitHub issue body with its number, date and state. | Tier-1. |
> | **[CORPUS]** | Carried forward from this repository's earlier research, which itself was search-summary based. | Second-hand. A pointer, not proof. Never on its own a reason to build. |
> | **[INFERENCE]** | My reasoning from the above, flagged rather than disguised. | — |
> | **[BACKGROUND — UNVERIFIED]** | Something I believe to be true from general knowledge but could **not** verify against any source this session. Recorded because the brief explicitly asks about it and its absence would be misleading. **Must be verified before it drives anything.** | Lowest. Treat as a question, not an answer. |
> | **[UNKNOWN]** | Could not be established. Left visible rather than guessed. | — |
>
> **Frequency grading** follows `METHOD.md`, applied conservatively: `widespread` only where
> three or more independent reporters across two or more years, or two independent source
> families, show the same thing; `recurring` for two independent reporters; `isolated`
> otherwise. **A [CORPUS]-only claim is never graded above `recurring`** in this document.
>
> **The single biggest distortion to correct for.** The [READ] layer is one tool's issue
> tracker. Ontime is a *timing and rundown* tool, so its users write about *timing and
> rundowns*. That makes this dossier unusually strong on the running order, the schedule and
> the show-day information problem — which is genuinely the centre of this role — and
> unusually weak on everything the brief also asked about: **supplier coordination, site
> visits, health-and-safety and rigging paperwork, insurance, permits and venue contracts**.
> Those sections are short and honestly labelled. They are the first thing to re-research
> when forum and trade-press access returns.

---

## Who they are / where they sit in the production

The event or show manager is the person who owns **the time axis and the promises made on
it**. Not a system, not a rig, not a signal — the commitment that a named thing will happen
in a named room at a named minute, in front of an audience that will notice if it does not.

This is the structural difference from every other role in this corpus, and it explains most
of what follows. The technical director owns the switcher. The audio engineer owns the
console. The network engineer owns the switch config. Each of them owns **an authoritative
machine**: when the paperwork and the machine disagree, the machine wins and reality can be
recovered by reading it. The production manager, as
[`roles/production-manager.md`](production-manager.md) puts it, owns *a set of agreements*
with no authoritative machine at all.

The event manager owns something different again: **a document that every department reads
and no department owns**. The running order — Ablaufplan, Regieplan, run of show, cue sheet —
is the only artefact in the entire production that lighting, sound, video, stage, catering,
security, the client and the talent all consult. And in the overwhelming majority of cases it
is a spreadsheet, mailed as a PDF, printed, and marked up in pen.

### The five populations the evidence keeps conflating

1. **Event-agency producer / Projektleiter Veranstaltung.** Owns the *whole* event; AV is one
   of eight suppliers alongside staging, rigging, catering, security, travel and print.
   [CORPUS] identifies this population explicitly and notes that "their master document is
   not a rental order — it is a **production schedule** and a **supplier matrix**, and
   neither lives in any AV tool"
   ([`roles/production-manager.md`](production-manager.md), population 4).
   This is the archetype most of this dossier is about.

2. **Show caller / Ablaufregie / stage manager.** Calls the show live from the running order:
   "standby camera 2, go VT, standby lighting cue 40". Their document is the *annotated*
   running order, and their working tools are a headset and a pen. Ontime's issue tracker
   contains this voice directly — one reporter describes themself as "the producer / show
   caller" and describes wanting other sites to *see* the cue sheet without being able to
   *alter* it once the show is live
   ([ontime #1547](https://github.com/cpvalente/ontime/issues/1547), 2025-03-18, [READ]).

3. **Client-side / corporate in-house event manager.** Owns the budget, the stakeholders and
   the agenda; owns no technical knowledge at all. They are the source of the running order's
   *content* and of most of its *changes*. They are also the reason the running order arrives
   as a Word document or a Google Sheet with idiosyncratic column names — see Time sink 1.

4. **Venue-side event manager.** Owns the building's constraints: access times, load-in
   routes, floor loading, rigging points, noise curfews, fire lanes, house rules, and the
   other event in the room the day before. [CORPUS] captures a single instance of this
   boundary in its change-propagation case study: item 14 of 30 is
   "**Venue approval for the riser position (blocks seats / fire lane)** — E-mail,
   sometimes verbal" ([`workflow-chain.md`](../workflow-chain.md)).

5. **Festival / conference programme manager.** Multi-day, multi-room, parallel stages. Their
   problem is not one running order but *n* running orders that must not contradict each
   other, plus public-facing signage derived from all of them. This population is visible in
   the [READ] evidence: multiple stages in one file with "one big cuesheet for the production
   assistant" ([ontime #1328](https://github.com/cpvalente/ontime/issues/1328), 2024-11-13),
   a timeline view where you can "move sessions between room"
   ([ontime #1450](https://github.com/cpvalente/ontime/issues/1450), 2025-01-14), and
   multi-day date support requested by someone running Glastonbury
   ([ontime #1117](https://github.com/cpvalente/ontime/issues/1117), 2024-07-02).

6. **A sixth, German-specific and legally distinct role — flagged, not evidenced.**
   **[BACKGROUND — UNVERIFIED]** In German practice "Veranstaltungsleiter" is not only a job
   title but a **role defined in building/assembly-venue regulation** (Muster-Versammlungs-
   stättenverordnung, MVStättVO), carrying personal responsibility for the safe conduct of
   the event and required to be present during it, working alongside a
   *Verantwortlicher für Veranstaltungstechnik* (the qualified technical responsible person).
   The associated paperwork family that this role signs or commissions —
   **Gefährdungsbeurteilung**, **Sicherheitskonzept**, **Brandschutzordnung**,
   **Bestuhlungsplan/Rettungswegplan**, statics and rigging proofs — is exactly what the
   brief asks about under "health and safety and rigging paperwork".
   **I could not open a single source for any of this in this session.** VPLT, the MVStättVO
   text, DGUV material and every German event-tech publication were blocked. Every noun in
   this paragraph must be treated as a **search term for the next session, not as a finding.**
   The English-language corpus touches the same territory only glancingly, as
   "Risk assessment / method statement (riser, cable crossing a public route) — Word / PDF —
   H&S responsible" ([CORPUS], [`workflow-chain.md`](../workflow-chain.md), case-study item 15).

### The defining structural fact

**The running order is authored by the least technical person in the production and consumed
by the most technical.** That single sentence generates most of the time sinks, most of the
double entry and most of the errors in this dossier.

The evidence for the authorship end is unusually direct. Ontime's own maintainer, writing up
why the Excel importer had to be rebuilt, states the problem in one line:

> the current parser "makes it inflexible for user who receive rundown or event spreadsheets
> **from clients at the last minute** and have to cleanup for Ontime import"
> ([ontime #502](https://github.com/cpvalente/ontime/issues/502), 2023-09-01, [READ])

That is the whole job, compressed: the schedule arrives from outside, late, in someone else's
format, and someone has to make it real before doors.

---

## A day in the life

Chronological. Sources are given per step; unmarked steps are [INFERENCE] from the structure
of the artefacts in [CORPUS] and are labelled as such.

### Weeks out — prep

- **Receive the agenda from the client.** Word, Excel, Google Sheets, or pasted into an
  e-mail body. Column names are whatever the client's assistant chose. [READ] evidence that
  this is the normal inbound shape: the Ontime importer rebuild exists precisely because
  users "receive rundown or event spreadsheets from clients at the last minute and have to
  cleanup for Ontime import" ([#502](https://github.com/cpvalente/ontime/issues/502)).
- **Translate the agenda into a running order.** The client's version has topics and
  speakers. The production version needs durations, transitions, cues, who is on stage, what
  is on screen, and what each department does. This translation is manual and is never
  written down as a mapping — it lives in the event manager's head and in the resulting
  spreadsheet's structure. [INFERENCE].
- **Site visit / recce.** Walk the venue with the AV supplier and the venue's own event
  manager. Capture: access and load-in times, lift dimensions, rigging points, power, sight
  lines, seating, fire lanes, where the FOH position is allowed to be. [CORPUS] documents the
  broadcast version of this ("the core team visiting the location before the trucks arrive…
  power capacity for truck, lighting rig and cameras is checked", from the ADAPT
  outside-broadcast material, which describes **1970s** practice and is used only for shape).
  The corporate-event version is thinner in the corpus: floorplans are "delivered in common
  formats for suppliers and venues (PDF and native files)"
  ([CORPUS], [`roles/camera-operator.md`](camera-operator.md), citing eventprof).
  **What the recce output actually *is* — a phone full of photos, a marked-up PDF, and some
  notes — is [UNKNOWN] from readable sources this session.**
- **Brief and book suppliers.** AV, staging, rigging, catering, security, printers, furniture.
  Each gets a version of the running order and a version of the requirements. [CORPUS] is
  explicit that this boundary stays on e-mail and phone and that "every rental ERP has tried
  to formalise it; it remains e-mail" ([`workflow-chain.md`](../workflow-chain.md)).
- **Chase content.** Speaker slides, videos, name spellings, logos, walk-on music. Deadlines
  are set and ignored. [INFERENCE], though the downstream consequence is [READ] — see the
  signage and lower-third requests in *What they would want*.
- **Re-issue the running order.** Every change produces a new version, a new PDF and a new
  e-mail. The recurrence of this is the single best-attested finding in the dossier — see
  Time sink 1.

### Day before — load-in

- **Be in the room while it is built.** The event manager is the only person who knows both
  what was promised and what is being built, so they are the escalation point for every
  physical surprise.
- **Discover what the drawing did not encode.** [CORPUS] states this as a `widespread` time
  sink in its own right: "lectern in the camera line, confidence monitor misplaced, truss
  across the sightline, no power at the position… Every one of these is a *re-rig*"
  ([`roles/camera-operator.md`](camera-operator.md), time sink 3).
- **Re-time the build schedule as it slips.** A late truck moves every subsequent trade.
  There is no tool for this: the build schedule is a separate spreadsheet from the show
  running order, and neither knows about the other. [INFERENCE], but see Missing interface 2.
- **Print.** The running order, the crew list, the contact sheet. [CORPUS] is blunt that this
  is a requirement rather than a legacy embarrassment: paper "needs no battery, works in any
  weather and in a basement with no connectivity, and both parties can sign it — which is
  exactly the failure profile of a venue load-in"
  ([`workflow-chain.md`](../workflow-chain.md)).

### Show day, morning — rehearsal

- **Run the order with the talent.** Timings collide with reality for the first time. The
  20-minute keynote is 31 minutes. [READ] evidence that this is the normal case and that
  people want the tooling to absorb it automatically: a reporter from a university TV station
  writes "we often have segments (represented by ontime events) that overrun, and then we
  simply move on to the next event once the presenter concludes. It'd be useful if ontime
  were to automatically adjust the start/end times of all following events"
  ([ontime #815](https://github.com/cpvalente/ontime/issues/815), 2024-03-13).
- **Absorb every change into every copy.** The marked-up master, the departments' copies, the
  PDF sent to the client, the version on the foyer screens.
- **Brief the departments on what changed.** Verbally, on comms, and in the group chat.

### Show — the two hours that matter

- **Call the show** from the annotated running order.
- **Hold the schedule.** The event manager is the person who decides whether to cut a segment,
  shorten a break or let it run long. [READ] evidence that practitioners want tools for
  exactly this decision, and that it is currently made by arithmetic in the head:
  a request to "tell ontime to calculate a speed that meets an event's deadline"
  with "an expected finish time before submitting the change"
  ([ontime #191](https://github.com/cpvalente/ontime/issues/191), 2022-08-09, still **open**).
- **Feed information outward under pressure.** To speakers on stage, to backstage, to the
  foyer, to the client sitting in the front row. [READ]: one reporter's collected feedback is
  that "speaker are very busy and stressed on stage and wish strong visual helpers on the
  active speech" ([ontime #371](https://github.com/cpvalente/ontime/issues/371), 2023-04-30);
  another notes that interviewers "are not always listening to intercom while interviewing"
  and asks for an API-settable on-screen message like "Interview NOW!"
  ([ontime #84](https://github.com/cpvalente/ontime/issues/84), 2022-01-05).
- **Absorb the failures nobody else can.** The speaker who does not appear, the video that
  does not play, the client who wants an unscheduled announcement.

### Load-out

- Sign things. Release the venue. Confirm what is damaged or missing. [CORPUS] grades this
  station as paper-dominant: "The load-out list, ticked in the dark, in the rain"
  ([`workflow-chain.md`](../workflow-chain.md), station 17).

### Post

- **Reconcile.** What was ordered against what was delivered against what will be invoiced.
  Every verbal on-site change becomes an argument here. [CORPUS] notes the industry has
  institutionalised this: change-order clauses exist precisely because of it.
- **Report to the client.** Attendance, timings, photos, what to do differently.
- **Archive — or not.** [CORPUS]'s judgement is that this is "the cheapest break to fix and
  the least often fixed, because nobody is paid for the hour after the truck leaves"
  ([`workflow-chain.md`](../workflow-chain.md), break 15). The following year the same event
  is re-planned from the *previous quote*, not from what actually happened.

---

## Tools they actually use

| Tool | For what | How they feel about it |
|---|---|---|
| **Excel / Google Sheets** | The running order itself. The build schedule. The supplier matrix. The budget. The contact list. The rooming list. | The universal substrate, and resented in a specific way: it does not hold a *version*. [CORPUS] records the German practitioner framing that with classic Excel versions "it can happen that not everyone has the same information", while for a live event "every department — direction, vision mixing, graphics, cameras and sound — must be on the same footing" ([`roles/camera-operator.md`](camera-operator.md), citing mindnapped). [READ] corroboration that Sheets is where running orders are *authored*: the Ontime importer exists for spreadsheets arriving from clients ([#502](https://github.com/cpvalente/ontime/issues/502)). |
| **E-mail** | Supplier POs, venue access, client approvals, the audit trail. | Tolerated as the only medium both parties accept as evidence. [CORPUS], [`roles/production-manager.md`](production-manager.md). |
| **WhatsApp / group chat** | Crew coordination, ETAs, "the speaker's train is late", client change requests. | Fastest channel that exists and a black hole. [CORPUS] grades it *dominant* at four stations. Corroborated in the corpus by event-operations writing that group threads "work fine for planning but fall apart on event day when decisions need to happen in seconds" and that on a single channel "critical messages get buried" ([`roles/streaming-engineer.md`](streaming-engineer.md), citing Homerun Entertainment, 2026-07-07). |
| **PDF** | The format the running order is *delivered* in, to clients, crew and venue. | The delivery format nobody argues with and everybody forks. [READ]: users ask for PDF/print export as a core feature, twice, two years apart ([#542](https://github.com/cpvalente/ontime/issues/542), 2023-10-09; [#1327](https://github.com/cpvalente/ontime/issues/1327), 2024-11-09). |
| **Printer and paper** | The running order in hand during the show; contact sheets; sign-off sheets. | A requirement, not nostalgia. [CORPUS] and [`roles/camera-operator.md`](camera-operator.md), which records the explicit German recommendation that "on production day the best solution is still a printed Regieplan into which spontaneous changes are entered by hand". |
| **Ontime** (GPL-3, free; optional paid cloud) | Run-of-show timing: rundown, countdown timers, delays, role-specific views for director / operator / backstage / public signage. | Where adopted, evidently loved — "really do love your tool!" ([#1327](https://github.com/cpvalente/ontime/issues/1327), [READ]); "I have been loving organizing my events with Ontime!" from an operator running "around 65 events per year between Weddings, Corporate events etc" ([#1325](https://github.com/cpvalente/ontime/issues/1325), 2024-11-08, [READ]). [CORPUS] rates it as having "the strongest genuine offline story in the segment" ([`landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md)). |
| **Cuez / Shoflo / Rundown Studio / CuePilot** (commercial, cloud) | Live-synced run of show pushed to every department's screen. | Where deployed, liked; usually bought by the control room rather than by the event manager. [CORPUS] records the ITV Studios case: operators dropped "bundles of printed rundowns" for an iPad each, so "when something is typed in the control room it instantly gets on set" ([`roles/camera-operator.md`](camera-operator.md), citing NewscastStudio, 2026-05-26). **Pricing for all four is sales-contact-only** ([CORPUS], [`landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md)) — which is itself a barrier for a role that often has no software budget line. |
| **Rental ERP** (Rentman, Current RMS/OnRent Events, easyjob, HireHop) | Read-only, usually. The event manager *receives* quotes from it. | Someone else's system. Owns the commercial half and has never heard of the running order. [CORPUS], [`landscape/event-rental-management.md`](../landscape/event-rental-management.md). |
| **Generic project tools** (Trello, Asana, Monday, MS Project) | Task lists and deadlines in the weeks before. | Grudging. The named structural failure is that they do not re-time from actuals: "In real life, there will be changes and the project timelines keep changing… Currently only manual timeline adjust is possible" ([erpnext #54271](https://github.com/frappe/erpnext/issues/54271), 2026-04-14, **open**, [READ]). |
| **Calendar** (Outlook/Google) | Crew call times, venue access windows, their own life. | Fine, and disconnected from every other artefact. |
| **Bitfocus Companion** | Where the event manager also operates. | Relevant here for one thing: page lockout for non-technical operators — "We have volunteers run some of our Productions, and we do not want the getting into some of the more advanced buttons"; the current workaround is hidden buttons requiring a long press, which "still can be found" ([companion #1864](https://github.com/bitfocus/companion/issues/1864), 2022-01-14, still **open**, [READ]). |
| **Static images on screens** | The public/foyer agenda. | The lowest-tech tool in the stack and still in service at scale: one reporter describes "around 10 TV Screens with 'static JPG public view'" showing the day's agenda at a large exhibition ([ontime #1576](https://github.com/cpvalente/ontime/issues/1576), 2025-04-16, [READ]). |

---

## Time sinks (ranked)

Ranked by *cost per occurrence × frequency*. Evidence quality is stated per item.

### 1. Re-issuing the running order after every change — `widespread`, hours per production

The single best-attested finding in this dossier, and the defining cost of the role.

Every change to the schedule — a swapped speaker, a cut segment, a five-minute shift —
produces a new version of a document that has already been e-mailed to twelve people and
printed by four of them. The event manager makes the edit, re-exports, re-mails, re-prints,
and then verbally tells everyone which version is now real.

**[READ] evidence that the inbound side of this is chronic:** Ontime's Excel importer was
rebuilt specifically because users "receive rundown or event spreadsheets from clients **at
the last minute** and have to cleanup for Ontime import"
([#502](https://github.com/cpvalente/ontime/issues/502), 2023-09-01). The same tracker shows a
**nine-year, nine-issue arc** on spreadsheet import/export alone —
[#27](https://github.com/cpvalente/ontime/issues/27) (2021-11),
[#391](https://github.com/cpvalente/ontime/issues/391) (2023-05),
[#502](https://github.com/cpvalente/ontime/issues/502) (2023-09),
[#542](https://github.com/cpvalente/ontime/issues/542) (2023-10),
[#1270](https://github.com/cpvalente/ontime/issues/1270) (2024-10),
[#1293](https://github.com/cpvalente/ontime/issues/1293) (2024-10),
[#1327](https://github.com/cpvalente/ontime/issues/1327) (2024-11) — all [READ]. A tool whose
entire purpose is *replacing* the spreadsheet has spent a decade improving its ability to
**import from and export back to** the spreadsheet. [INFERENCE] That is not a missing feature;
that is the shape of the market. The spreadsheet is not an intermediate step the tool
eliminates — it is the interchange format with the outside world, in both directions.

**[CORPUS] corroboration, and the cost:** "when changes happen frequently and presenters or
clients reorder elements, new versions of the rundown need to be constantly emailed and
printed out. Otherwise the crew will miss their cues, making for awkward pauses and confusion"
([`roles/camera-operator.md`](camera-operator.md), citing Shoflo's event-production guide).
The defensive practice this creates is also recorded: "every time you update your Run of Show,
add a clear date and version number… especially when sharing via email or Slack"
(same file, citing EMRG Media). [INFERENCE] Version numbering is a workaround for a document
format that cannot tell you whether you are holding the current one.

### 2. Re-timing the schedule by hand after it slips — `widespread`, minutes per slip, continuous during the show

When one item overruns, every subsequent start time is wrong. The event manager recalculates
in their head or in the sheet, decides what to cut, and tells everyone.

**[READ], four independent reporters over three years, all asking for the same thing:**

- "It would be useful if ontime were to automatically adjust the start/end times of all
  following events when we advance from an event that's overrunning"
  ([#815](https://github.com/cpvalente/ontime/issues/815), 2024-03-13).
- "For us to use ontime theres a important feature missing which is the option to add overtime
  from a previous event to the start time of the next event" — with a worked example including
  a five-minute changeover gap that must be preserved
  ([#1318](https://github.com/cpvalente/ontime/issues/1318), 2024-11-05).
- "Would be great to have an selectable option that the event duration is adjusted when time
  is manually added/removed during an event. This should also affect all following event
  start-times" ([#331](https://github.com/cpvalente/ontime/issues/331), 2023-04-09).
- A request to compute a timer speed that "meets an event's deadline" and preview the
  resulting finish time before committing
  ([#191](https://github.com/cpvalente/ontime/issues/191), 2022-08-09, still **open**).

The confusion this creates even inside a purpose-built tool is [READ] too: a user in v4.9
reporting that expected end times, group end times and overtime interact incorrectly, and
concluding with a statement of what they expected the *domain* to do — "as soon as you put an
event (like a break) into a rundown that has a defined end time, it should 'smoothen' even an
overtime rundown again" ([#2104](https://github.com/cpvalente/ontime/issues/2104),
2026-06-16). Another reports over/under drifting by *days*
([#1849](https://github.com/cpvalente/ontime/issues/1849), 2025-10-28), and a third finds that
"Make Permanent" on a delay appears to do nothing
([#1230](https://github.com/cpvalente/ontime/issues/1230), 2024-09-30).

**Cross-domain corroboration, [READ]:** the same complaint appears in a general-purpose ERP,
phrased generically — baseline plans exist, "in real life, there will be changes and the
project timelines keep changing… Currently only manual timeline adjust is possible"
([erpnext #54271](https://github.com/frappe/erpnext/issues/54271), 2026-04-14, **open**).
[INFERENCE] Two unrelated software families, four years apart, being asked for
*recalculate-the-schedule-from-what-actually-happened* is good evidence that no widely used
tool does it, and that humans are doing this arithmetic by hand.

### 3. Producing the same schedule again in a different format for each audience — `widespread`, hours per production

One running order has to become: the client's PDF, the crew's call sheet, the departments'
cue sheet, the speakers' personal schedule, the foyer signage, the operator's view, and the
printed copy in the show caller's hand. Each is made by hand from the same rows.

**[READ] evidence, from both ends:**

- Export/print is asked for repeatedly as the thing that makes the tool usable at all:
  "This would allow users to plan their event in ontime and export it as PDF-Table or Excel
  in Order to share it. Alternatively a possibility to print the current rundown would be
  great too!" ([#1327](https://github.com/cpvalente/ontime/issues/1327), 2024-11-09), and
  earlier [#542](https://github.com/cpvalente/ontime/issues/542) (2023-10-09).
- The export needs to be *self-explaining* for the recipient, which is a client-communication
  requirement, not a technical one: "Also an example export you can send out to clients that
  has what each field is **so production does not get confused on what each field is**"
  ([#1293](https://github.com/cpvalente/ontime/issues/1293), 2024-10-24).
- The signage end is still images: ten screens of "static JPG public view" showing the day's
  public agenda, which the reporter wants to replace with a live view that highlights the
  running item and shows a large countdown two minutes before each start
  ([#1576](https://github.com/cpvalente/ontime/issues/1576), 2025-04-16).

### 4. Physical constraints discovered at rehearsal that the plan did not encode — `recurring` in [READ] terms, `widespread` per [CORPUS]

The riser blocks a fire lane. The lectern is in the camera line. There is no power where the
band is standing. Each one is a re-rig inside the only rehearsal window.

[CORPUS] grades this `widespread` and lists the canonical cases — "lectern in the camera line,
confidence monitor misplaced, truss across the sightline, no power at the position… Every one
of these is a *re-rig*: move the position, re-pull the cable, re-patch, re-label, re-shade"
([`roles/camera-operator.md`](camera-operator.md), time sink 3). I found **no [READ] source**
for it this session, so under this document's rules it is capped at `recurring`. It is
recorded here because it is the point where the event manager's two domains — the schedule and
the room — collide, and because the venue-approval hop it triggers is documented in [CORPUS]
as an e-mail, "sometimes verbal" ([`workflow-chain.md`](../workflow-chain.md), case-study
item 14).

### 5. Supplier coordination and reconfirmation — `recurring`, [CORPUS]-only

Eight suppliers, each with their own paperwork, their own confirmation format and their own
idea of what was agreed. [CORPUS] records that the industry has institutionalised the failure
rather than fixed it: change-order clauses, 48-hour late fees, and "the advice to reconfirm
every vendor two days out" ([`workflow-chain.md`](../workflow-chain.md), break 4). It also
concedes the boundary is not closable by software: sub-hire and supplier coordination
"runs on peer relationships, phone calls and PDFs. Every rental ERP has tried to formalise it;
it remains e-mail."

**Evidence quality warning.** This is [CORPUS]-only and the corpus itself is search-summary
based. Grade it as a hypothesis.

### 6. Getting information *out* to non-technical people mid-show — `recurring`

Speakers, presenters and clients are not on comms and cannot read a cue sheet. [READ]:
"speaker are very busy and stressed on stage and wish strong visual helpers on the active
speech… This is one piece of few wishes/requests from our collection what speakers told us
after a event was happen" ([#371](https://github.com/cpvalente/ontime/issues/371),
2023-04-30). And for talent mid-interview: "they are not always listening to intercom while
interviewing", hence the request for API-settable on-screen messages
([#84](https://github.com/cpvalente/ontime/issues/84), 2022-01-05).

### 7. Health-and-safety, rigging and permit paperwork — frequency **[UNKNOWN]**

The brief asks about this explicitly. **I have almost nothing.** The only readable trace this
session is [CORPUS]'s single line item: "Risk assessment / method statement (riser, cable
crossing a public route) — Word / PDF — H&S responsible — PDF"
([`workflow-chain.md`](../workflow-chain.md), case-study item 15), plus its listing of risk
assessments among the documents that are "printed on site, marked up in pen" at load-in.

[INFERENCE] with low confidence, offered as a hypothesis to test: this paperwork is a
**Word-template-and-PDF world with no data model at all**, produced per event by copying last
event's document, and it is the least likely part of this role to be helped by a planning
tool — but the *inputs* it needs (weights, loads, positions, cable routes, power) are exactly
what a technical planning suite already holds. See *Implications*, item 6.

---

## Double data entry

What the event manager types more than once. Rows marked [READ] have direct evidence this
session; rows marked [CORPUS] are carried forward and are weaker.

| # | The fact | Where it gets typed, in order | Evidence |
|---|---|---|---|
| 1 | **The running order itself** — item, start, duration, who, what | Client's Word/Sheet → agency master Excel → show tool (Ontime/Cuez/Shoflo) → exported PDF → printed copy → foyer signage → prompter → operator's own notes | [READ] The import→export→print arc across nine Ontime issues ([#27](https://github.com/cpvalente/ontime/issues/27), [#391](https://github.com/cpvalente/ontime/issues/391), [#502](https://github.com/cpvalente/ontime/issues/502), [#542](https://github.com/cpvalente/ontime/issues/542), [#1270](https://github.com/cpvalente/ontime/issues/1270), [#1293](https://github.com/cpvalente/ontime/issues/1293), [#1327](https://github.com/cpvalente/ontime/issues/1327)); [READ] the JPG signage case ([#1576](https://github.com/cpvalente/ontime/issues/1576)) |
| 2 | **Event identity** — client, dates, venue, contact | Inbound e-mail → CRM → quote → project → shared calendar → call sheet → running order header → invoice → project folder name | [CORPUS], [`roles/production-manager.md`](production-manager.md), which grades the hop count itself as [INFERENCE] |
| 3 | **Times, three incompatible versions** — (a) the *audience* agenda, (b) the *technical* schedule (load-in, sound check, doors), (c) *crew call* times | Client agenda → build schedule spreadsheet → crew tool / WhatsApp → call sheet PDF → venue access form | [CORPUS] stations 4 and 14; [INFERENCE] on the three-way split. **The three never live in one document, and a change to one does not touch the others.** |
| 4 | **Speaker / session data** — name, title, company, session, spelling | Registration or programme system → running order → name supers/lower thirds → signage → printed programme → certificates | [INFERENCE], corroborated indirectly by the lower-third message API request ([#84](https://github.com/cpvalente/ontime/issues/84), [READ]) |
| 5 | **Per-department notes against each item** — what lighting/sound/video does at item 14 | Master running order → each department's own copy → each department's console/show file | [READ] and unusually explicit: users ask for per-department custom-field columns that operators can edit themselves, so "Ontime can be used as a single source of truth for the rundown" ([#1041](https://github.com/cpvalente/ontime/issues/1041), 2024-06-04) |
| 6 | **Room / stage layout** | Venue's CAD or PDF → AV supplier's plan → seating plan → risk assessment → signage/wayfinding | [CORPUS], [`roles/camera-operator.md`](camera-operator.md), which notes tools re-import and rescale the same ground plan yet again |
| 7 | **Multi-room programme** | Master programme → per-room running order → per-room signage → public schedule/app | [READ] the multiple-stages request, whose stated blocker is precisely that splitting into separate instances "would only make it impossible to have one big cuesheet for the production assistant" ([#1328](https://github.com/cpvalente/ontime/issues/1328), 2024-11-13) |
| 8 | **What actually happened** — actual start and end times | Nowhere. It is not captured at all, so the post-event report and next year's plan are both built from the *plan*, not the *outcome* | [CORPUS] break 15; [INFERENCE]. See Missing interface 6 |

[INFERENCE] The pattern: **the running order is copied outward into audience-shaped
renderings, and none of the copies can flow back.** Every rendering is a fork created at the
moment of export.

---

## Error sources

### 1. Version skew — the crew is working from different documents

**What goes wrong.** Printed and e-mailed copies diverge from the master. [CORPUS] states both
halves: version skew across Excel copies is mitigated with shared Sheets and explicit version
naming, "but on production day the best solution is still a printed Regieplan into which
spontaneous changes are entered by hand" ([`roles/camera-operator.md`](camera-operator.md)).
**What it costs.** "Missed cues, awkward pauses and confusion" ([CORPUS], citing Shoflo);
in [CORPUS]'s own general framing, static documents "give no visibility into who has seen the
latest version" ([`workflow-chain.md`](../workflow-chain.md), break 11).
**Frequency.** `recurring` under this document's rules ([CORPUS]-capped); [INFERENCE] it is
actually `widespread`.

### 2. The schedule does not re-time itself, so the arithmetic is done under pressure

**What goes wrong.** See Time sink 2. Four [READ] reporters asking for automatic re-timing;
three [READ] bug reports where a purpose-built tool's own time arithmetic confused
practitioners ([#2104](https://github.com/cpvalente/ontime/issues/2104),
[#1849](https://github.com/cpvalente/ontime/issues/1849),
[#1230](https://github.com/cpvalente/ontime/issues/1230)).
**What it costs.** [INFERENCE] Either the show runs long — the most visible failure an event
manager can have — or a segment is cut in a panic, which is a commercial and political event,
not just a timing one.
**Frequency.** `widespread` (four independent [READ] reporters, 2022–2026, plus one
cross-domain [READ] corroboration).

### 3. Anyone can edit the live document

**What goes wrong.** The document that everyone must read is also the document everyone can
change. [READ], from a producer/show caller: two sites both need to see the cue sheet "so they
can have an overview of the show and what is coming up accross all departments. however as
the producer / show caller I do not want some one else to be able to alter the cue sheet once
we are on site and the show is live"
([#1547](https://github.com/cpvalente/ontime/issues/1547), 2025-03-18). The same concern, from
the other direction: department operators want to add their own notes but the ask is hedged
with "This may lead to issues if someone misclicks"
([#1041](https://github.com/cpvalente/ontime/issues/1041), 2024-06-04).
The analogous problem in the control surface: volunteers must be kept off advanced pages, and
the available workaround — hidden long-press buttons — "still can be found"
([companion #1864](https://github.com/bitfocus/companion/issues/1864), 2022-01-14, **open**).
**What it costs.** [INFERENCE] Either an accidental edit to a live document, or — more often —
the event manager refuses to share the live document at all and reverts to mailing PDFs,
which re-creates error source 1.
**Frequency.** `recurring` (three independent [READ] reporters, two repositories).

### 4. Losing the show document during the show

**What goes wrong.** [READ], verbatim: "There have been three instances now where Ontime seems
to crash, loses all my show data, and comes back up with the demo project"
([#1912](https://github.com/cpvalente/ontime/issues/1912), 2025-12-10, closed).
**What it costs.** [INFERENCE] The show continues from the printed copy — which is exactly why
the printed copy exists, and why no amount of software will remove it. This finding is
argument *for* the paper, not against it.
**Frequency.** `isolated` as reported (one reporter, three occurrences). Recorded because the
consequence class matters more than the count.

### 5. Multi-day and multi-room logic picking the wrong thing

**What goes wrong.** [READ]: automatic (roll) mode "always jumps back to the first day" on
multi-day events because it plays "the first event which schedule matches the current time"
([#1013](https://github.com/cpvalente/ontime/issues/1013), 2024-05-28); the same limitation
reported independently from Glastonbury
([#1117](https://github.com/cpvalente/ontime/issues/1117), 2024-07-02); date support requested
again eighteen months later, with the workaround named as abusing groups to represent days
([#1951](https://github.com/cpvalente/ontime/issues/1951), 2026-01-22).
**What it costs.** [INFERENCE] The public countdown shows yesterday's session.
**Frequency.** `recurring` (three independent [READ] reporters, 2024–2026).

### 6. Verbal approvals that become invoice disputes

**What goes wrong.** [CORPUS]'s change-propagation case study lists "Client approval —
E-mail / WhatsApp — Free text, sometimes verbal only" as item 2 of 30, and venue approval for
a physical position as item 14, also "sometimes verbal"
([`workflow-chain.md`](../workflow-chain.md)).
**What it costs.** [CORPUS]: "Every undocumented change from stations 14–18 is an argument."
**Frequency.** `recurring` ([CORPUS]-capped).

### 7. The general law of change cost

[CORPUS]'s conclusion from its 30-artefact case study deserves restating here, because it is
the event manager who pays it: **"The cost of a change is not proportional to the size of the
change. It is proportional to the number of systems the change has to be re-entered into,
which is fixed per company. Adding one camera and adding four cameras cost nearly the same
amount of paperwork"** ([`workflow-chain.md`](../workflow-chain.md)). [INFERENCE] For the event
manager the equivalent unit is *moving one item in the running order*, and the same law
applies: the cost is the number of renderings that must be regenerated, which is constant.

---

## Paper / Excel / WhatsApp inventory

Specific artefacts. Items resting only on [CORPUS] are marked and should be treated as a
checklist to verify, not as findings.

### Paper — printed, carried, marked up, signed

| Document | Who holds it | Why it stays paper |
|---|---|---|
| **The running order / Ablaufplan / Regieplan**, printed and annotated | Show caller, every department head, stage | The one document nobody will trust to a battery. [CORPUS] states the German recommendation explicitly: "on production day the best solution is still a printed Regieplan into which spontaneous changes are entered by hand" ([`roles/camera-operator.md`](camera-operator.md)). Reinforced by [READ] evidence that show tools do crash and lose data mid-show ([#1912](https://github.com/cpvalente/ontime/issues/1912)) |
| **Call sheet / crew list** | Every crew member | Printed before the update arrives; [CORPUS] names stale call times as the recurring failure |
| **Contact sheet** — every supplier's on-site mobile number | Event manager's clipboard | [INFERENCE]. The one page that must work when the venue wifi does not |
| **Marked-up floor plan / seating plan** | Event manager's clipboard | [CORPUS]: "the only record of what actually got moved — and it goes in the skip" ([`roles/production-manager.md`](production-manager.md)) |
| **Risk assessment / method statement** | H&S file, venue office | Regulatory; needs a signature. [CORPUS] only ([`workflow-chain.md`](../workflow-chain.md) item 15). See the German paperwork family under *Who they are*, item 6 — all **[BACKGROUND — UNVERIFIED]** |
| **Venue access / delivery forms, permits** | Venue, drivers | [CORPUS], via the "venue access forms" listing in [`roles/production-manager.md`](production-manager.md) |
| **Sign-off / handover sheets at load-out** | Event manager and venue | Both parties sign it; it is the evidence. [CORPUS] |
| **The public agenda on the wall** | Foyer | Printed or, at scale, a static JPG on screens — [READ], ten of them at one exhibition ([#1576](https://github.com/cpvalente/ontime/issues/1576)) |

### Excel / Google Sheets — the actual system of record

| Spreadsheet | What it holds | Evidence |
|---|---|---|
| **The running order master** | Item number, start, duration, title, who is on stage, what is on screen, and one column per department | **[READ]** — the Ontime import/export family; and [READ] the explicit request for per-department columns ([#1041](https://github.com/cpvalente/ontime/issues/1041), [#90](https://github.com/cpvalente/ontime/issues/90)). [CORPUS] gives the German column set: number, time, duration, action, people, sound, light ([`roles/camera-operator.md`](camera-operator.md), citing ablaufregisseur.de and mindnapped) |
| **The build / production schedule** | Load-in, trades in order, sound check, doors, load-out — a *different* time axis from the show | [INFERENCE] + [CORPUS] station table. Its separateness from the running order is Missing interface 2 |
| **The supplier matrix** | Who is delivering what, when, contact, confirmed y/n | [CORPUS], [`roles/production-manager.md`](production-manager.md) population 4 |
| **The speaker / session list** | Names, titles, spellings, arrival times, AV needs | [INFERENCE] |
| **The budget** | Estimate vs actual, hand-built side by side | [CORPUS] — recorded as read *by the adjacent role's session*, not by me: [erpnext #34127](https://github.com/frappe/erpnext/issues/34127) via [`roles/production-manager.md`](production-manager.md) |
| **The rooming / travel list** | Hotels, flights, transfers | [CORPUS] |
| **The client's own agenda**, in the client's own column names | The upstream source of everything above | **[READ]** — the reason the importer had to become configurable ([#502](https://github.com/cpvalente/ontime/issues/502)) |

[INFERENCE] Echoing [`roles/production-manager.md`](production-manager.md)'s conclusion, which
holds here too: the common property of these sheets is that **they are calculations and
comparisons, not records**. The running order is a *calculation* — start times derived from
durations. That is precisely why it lives in a spreadsheet and why a database-shaped tool that
cannot recalculate loses to one.

### WhatsApp / group chat / e-mail

| Channel | What travels on it | Evidence |
|---|---|---|
| **Crew WhatsApp group** | Call-time changes, "the truck is 40 minutes out", "we've cut segment 4", photos of the room | [CORPUS] grades messaging the *dominant* carrier at four stations ([`workflow-chain.md`](../workflow-chain.md)); [CORPUS] also records the event-day failure mode — group threads "fall apart on event day when decisions need to happen in seconds", "critical messages get buried" ([`roles/streaming-engineer.md`](streaming-engineer.md), citing Homerun Entertainment 2026-07-07) |
| **Client e-mail thread** | The agenda, its revisions, and approvals | [READ] indirectly: the last-minute client spreadsheet ([#502](https://github.com/cpvalente/ontime/issues/502)) arrives this way |
| **Client WhatsApp / phone** | The change that is never written down | [CORPUS] case-study item 2, "sometimes verbal only" |
| **Supplier e-mail** | POs, confirmations, delivery notes | [CORPUS]: "it remains e-mail" |

---

## Missing interfaces

Department handovers that break, ordered by how much they cost this role.

### 1. Running order ↔ technical plan — **no link exists at all**

The running order says "14:20 — Panel, four chairs, four handhelds, VT roll at 14:31". The
technical plan says which four radio channels, which frequencies, which camera covers the
panel, which cable feeds it. **Nothing connects them.** A change to the running order is
invisible to the cable schedule, the RF plan, the multiviewer layout and the comms plan; a
change to any of those is invisible to the running order.

[CORPUS] documents the technical half of this in detail and is explicit that "no ERP owns it"
([`workflow-chain.md`](../workflow-chain.md)). [INFERENCE] This is the single largest gap for
AV Planner Suite specifically, because the suite already owns the technical side and the
running order is the missing key that would make its objects *scheduled*.

### 2. Show running order ↔ build schedule ↔ crew call times

Three time axes, three documents, three owners, no propagation. [INFERENCE] from the artefact
structure in [CORPUS]; corroborated by [CORPUS]'s observation that a call-time change
"propagates as a *new message*, not a new record; the printed crew list on the truck is now
wrong" ([`workflow-chain.md`](../workflow-chain.md), station 4).

### 3. Master rundown ↔ each department's working copy

The one boundary where the [READ] evidence is direct and the desired shape is precisely
specified by users. See *What they would want*, items 1 and 2: departments want to own a
column, not a document ([#90](https://github.com/cpvalente/ontime/issues/90),
[#1041](https://github.com/cpvalente/ontime/issues/1041)).

### 4. Programme / session data ↔ signage ↔ prompter ↔ name supers

The same speaker's name is typed into four systems, and the spelling diverges. [INFERENCE],
with [READ] partial corroboration from the request to drive on-screen presenter messages via
API so they can be triggered from Companion or the mixer
([#84](https://github.com/cpvalente/ontime/issues/84)).

### 5. Venue constraints ↔ any plan

The venue knows its access times, floor loads, rigging points, curfews and fire lanes. That
knowledge reaches the production as PDFs, e-mails and a conversation during the recce, and it
is re-keyed into every plan that needs it — or not re-keyed, and rediscovered at load-in.
**[UNKNOWN]** in detail; the only readable trace is [CORPUS]'s single case-study line about
e-mailing the venue for riser approval.

### 6. What actually happened ↔ next time

Nothing captures actual start and end times, so the post-event report and next year's plan are
both built from the *plan*. [CORPUS] states the general form: "Next year the same event is
re-planned from the *quote*, not from what was actually built, and every on-site fix is
rediscovered" ([`workflow-chain.md`](../workflow-chain.md), station 20).
[INFERENCE] For this role the loss is more specific and more embarrassing: the event manager
knows the keynote always overruns by ten minutes, and has to re-learn it every year because
the only record of it was in their head.

### 7. Multi-room ↔ one overview

[READ] and explicit: separate instances per stage would work operationally but "would only
make it impossible to have one big cuesheet for the production assistant"
([#1328](https://github.com/cpvalente/ontime/issues/1328)), and the request for a timeline
view where sessions can be dragged between rooms
([#1450](https://github.com/cpvalente/ontime/issues/1450)) is the same gap from the planning
side.

---

## What they would want

**Their words, not mine.** Every item below is a [READ] request written by a practitioner,
paraphrased or quoted, with its issue number and date. This section is deliberately free of
my own product ideas; those are in the next section.

1. **A cue-sheet grid where each role sees only their own columns, edited live like a shared
   spreadsheet.** "if I am the show caller, I want to see all fields, but if I am audio, i
   would hide the video, lighting, etc - columns not relevant to me. I would then edit/input
   my audio cue notes directly into this screen (via browser). The concept here is same as a
   live edit multi-user google sheet" — and it must "reflect the current show status - active
   cue, running/paused, time remaining"
   ([#90](https://github.com/cpvalente/ontime/issues/90), 2022-01-13).

2. **Let each department edit its own note without being able to break anything else.**
   "operators of the various areas (lighting, sound, video, etc.) have the ability to add
   notes to 'their' custom field themselves without needing to resort to the main edit UI…
   This way Ontime can be used as a single source of truth for the rundown and operators can
   always update and view exactly the notes for every event they want to have. **Without
   having to fear altering other details that could impact others**"
   ([#1041](https://github.com/cpvalente/ontime/issues/1041), 2024-06-04).

3. **Read-only views for everyone who needs to watch but must not touch.** From a
   producer/show caller running one show across two locations: both sites want the overview
   "accross all departments. however as the producer / show caller I do not want some one else
   to be able to alter the cue sheet once we are on site and the show is live"
   ([#1547](https://github.com/cpvalente/ontime/issues/1547), 2025-03-18).

4. **Let the client into the itinerary — carefully.** From an operator doing "around 65 events
   per year between Weddings, Corporate events etc": "I was exploring giving my customers the
   option to 'Sign-in' and move the 'Itinerary' objects to their liking"
   ([#1325](https://github.com/cpvalente/ontime/issues/1325), 2024-11-08). [INFERENCE] This is
   the client-collaboration wish stated by a practitioner rather than by a vendor, and it is
   notable that it is framed as *letting the client rearrange*, not as *sending the client a
   PDF*.

5. **Absorb the overrun automatically.** "automatically adjust the start/end times of all
   following events when we advance from an event that's overrunning"
   ([#815](https://github.com/cpvalente/ontime/issues/815), 2024-03-13), and with the
   changeover gap preserved ([#1318](https://github.com/cpvalente/ontime/issues/1318),
   2024-11-05).

6. **Tell me how to get back on schedule, and show me the consequence before I commit.**
   Compute a timer speed that "meets an event's deadline", with "an expected finish time
   before submitting the change" ([#191](https://github.com/cpvalente/ontime/issues/191),
   2022-08-09, still open).

7. **Export something I can send, and label it so the recipient understands it.**
   "an example export you can send out to clients that has what each field is so production
   does not get confused on what each field is"
   ([#1293](https://github.com/cpvalente/ontime/issues/1293), 2024-10-24); PDF and Excel
   export "in Order to share it", plus plain printing
   ([#1327](https://github.com/cpvalente/ontime/issues/1327), 2024-11-09;
   [#542](https://github.com/cpvalente/ontime/issues/542), 2023-10-09).

8. **Replace the static agenda images on the foyer screens** with a live view that highlights
   the running item, shows a big countdown two minutes before each start, and carries the
   client's colours, fonts and logo
   ([#1576](https://github.com/cpvalente/ontime/issues/1576), 2025-04-16).
   [INFERENCE] Note the third requirement: **client branding is a functional requirement, not
   decoration**, because the screen is client-facing.

9. **One file for parallel stages, with one combined cue sheet for the production assistant**
   ([#1328](https://github.com/cpvalente/ontime/issues/1328), 2024-11-13), and a timeline view
   across rooms where you can "drag start and finish" and "move sessions between room"
   ([#1450](https://github.com/cpvalente/ontime/issues/1450), 2025-01-14).

10. **Real dates, because events last more than a day**
    ([#1117](https://github.com/cpvalente/ontime/issues/1117), 2024-07-02;
    [#1951](https://github.com/cpvalente/ontime/issues/1951), 2026-01-22 — the stated
    workaround is "to use groups for multiple days").

11. **Structure the running order hierarchically, so reordering the top level does not mean
    re-ordering everything underneath.** From someone running a music event: "When we change
    the setlist, i have to reorder all events by hand… every song has its cues for intro,
    verse chorus 1,2 and so on. It would make life much easier if i could place these 'in
    song' events under the main song, so i just need to reorder the songs and not all of its
    components" ([#204](https://github.com/cpvalente/ontime/issues/204), 2022-09-15).

12. **Edit many items at once** ([#1221](https://github.com/cpvalente/ontime/issues/1221),
    2024-09-21, still open — with the maintainer noting rundown performance is "fragile" at
    the several-hundred-item scale they test against).

13. **Strong, unmissable visual cues for the person on stage**, including a flashing state
    when time is up: "Speaker are very busy and stressed on stage and wish strong visual
    helpers on the active speech"
    ([#371](https://github.com/cpvalente/ontime/issues/371), 2023-04-30).

14. **A way to message people who are not on comms**, settable from the API so it can be fired
    from Companion or the mixer, e.g. "Interview NOW!" to an interviewer who is not listening
    to talkback ([#84](https://github.com/cpvalente/ontime/issues/84), 2022-01-05).

15. **Password-protect the whole thing when it is reachable beyond the local network**
    ([#1423](https://github.com/cpvalente/ontime/issues/1423), 2025-01-03), and lock
    non-technical operators out of advanced control pages properly rather than by hiding
    buttons that "still can be found"
    ([companion #1864](https://github.com/bitfocus/companion/issues/1864), 2022-01-14).

16. **A shared, editable, clutter-free view for the person running the show**, distinct from
    the setup interface: "A stage manager/script person should be presented with a view (like
    the cue sheet) where they can 'run the show'… the same view should make it easy to edit
    the events, with all 'clutter' taken away"
    ([#137](https://github.com/cpvalente/ontime/issues/137), 2022-05-27).

**What is conspicuously absent from their stated wishes.** Nobody in this evidence base asked
for an integration with a rental ERP, a crew tool, a CRM or an accounting system. They asked,
over and over, for **better import from and export to spreadsheets**, and for **role-shaped
views of one shared document**. [INFERENCE] That is a strong signal about sequencing: the
interchange format people actually want is the one they already have.

---

## Implications for AV Planner Suite

Honest assessment, split into what the evidence supports, what it merely suggests, and what it
contradicts.

### Supported by [READ] evidence

1. **The running order is the missing key that makes the suite's technical objects
   schedulable — and it is the artefact this role will actually open.** The suite already
   models cameras, cables, fixtures, racks and signal paths. What it cannot express is *when*
   any of that is used. A running order object with items, durations and per-item department
   notes would let a camera, a radio channel or a lighting state be **referenced by a
   schedule item**, which is the link Missing interface 1 says does not exist anywhere in the
   market. [INFERENCE] built on [READ] evidence that the running order is the one document
   every department reads.

2. **Import and export must target Excel and Google Sheets, with user-mapped columns, and this
   is a first-class feature rather than a convenience.** The [READ] arc across nine Ontime
   issues over five years shows a purpose-built tool repeatedly rebuilding its spreadsheet
   bridge because **the schedule arrives from the client in the client's own format, late**
   ([#502](https://github.com/cpvalente/ontime/issues/502)). Any planner that cannot ingest a
   messy client sheet with arbitrary column names, show a preview, and let the user confirm
   the mapping will simply not be used at the point the work arrives.
   [CORPUS] reaches the same conclusion independently:
   "even the best open-source systems accept that the source of truth often starts life as a
   spreadsheet. Any planner that cannot import/export a sane sheet will lose"
   ([`landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md)).

3. **Role-shaped views over one document, with per-role write scope, beat separate documents.**
   This is the most precisely specified user request in the whole evidence base
   ([#90](https://github.com/cpvalente/ontime/issues/90),
   [#1041](https://github.com/cpvalente/ontime/issues/1041),
   [#1547](https://github.com/cpvalente/ontime/issues/1547)): one shared object, column
   visibility per role, edit rights scoped to *your* column, read-only for observers, and a
   lock once the show is live. The suite's existing multi-planner shell is well positioned for
   this, and the requirement is stated by users rather than inferred.

4. **Print is a feature, not a fallback, and what is printed must be a rendering of the model
   rather than a fork.** [READ] users ask for print and PDF export directly
   ([#542](https://github.com/cpvalente/ontime/issues/542),
   [#1327](https://github.com/cpvalente/ontime/issues/1327)) and want the export to be
   self-explaining for a non-technical recipient
   ([#1293](https://github.com/cpvalente/ontime/issues/1293)). [READ] evidence that show tools
   crash and lose data mid-show ([#1912](https://github.com/cpvalente/ontime/issues/1912))
   means the paper copy is a *resilience requirement*, not a legacy habit. The design
   consequence: print a version stamp and a change marker, so the person holding paper can
   tell in one second whether they are holding the current one.

5. **"What does this change invalidate?" is more valuable here than automatic propagation.**
   [CORPUS]'s general law — change cost is proportional to the number of systems, not the size
   of the change — applies directly to moving one item in a running order. [INFERENCE] A view
   that *lists* what a change touches (which department notes, which equipment, which printed
   document is now stale) removes the omission failures without pretending to fix the
   downstream systems it cannot reach.

### Suggested, but weakly evidenced — treat as hypotheses

6. **Feed the H&S paperwork rather than trying to own it.** The suite already holds weights,
   loads, positions, cable routes and power draw — the *inputs* to a risk assessment,
   rigging plan or Bestuhlungsplan. Generating a data sheet that a human pastes into their own
   Word template is plausible; building the risk assessment itself is not, and the German
   regulatory frame around it is entirely **[BACKGROUND — UNVERIFIED]** in this dossier.
   **Do not build anything here until the German sources are actually read.**

7. **Capture actuals.** One tap to stamp "item 14 actually started at 14:27" would create the
   dataset that Missing interface 6 says does not exist. [INFERENCE] only. The hard part is
   not the feature but the interaction: [CORPUS] warns that in the last two hours before doors
   "anything that must be captured then has to be capturable in under ten seconds or it will
   not be captured at all" ([`workflow-chain.md`](../workflow-chain.md)).

8. **Offline and LAN-first is the right posture for this role too.** [CORPUS] rates Ontime's
   local/LAN operation as "the strongest genuine offline story in the segment" and notes that
   the cloud-only rundown products are consequently unusable as the primary show-control layer
   at a venue ([`landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md)).
   This aligns with the suite's existing offline-first stance. **Note the tension in the
   [READ] evidence, though:** users also want reachability beyond the LAN (multi-site cue
   sheets, [#1547](https://github.com/cpvalente/ontime/issues/1547)) and immediately ask for
   authentication when they get it ([#1423](https://github.com/cpvalente/ontime/issues/1423)).

### Contradicted, or at least not supported — do not build

9. **Do not build supplier coordination, crew scheduling or invoicing.** [CORPUS] is
   unambiguous that supplier and crew boundaries stay on e-mail and phone and that the market
   already has strong specialised products with APIs; "building a worse version of CrewBrain
   would *create* a media break, not close one"
   ([`workflow-chain.md`](../workflow-chain.md)). Independently, **not one** of the sixteen
   stated wishes in the previous section asks for any of it.

10. **Do not try to replace the group chat or intercept the client's phone call.** [CORPUS]
    lists both as not removable, and rates verbal on-site coordination "the fastest channel
    that exists". The realistic role for software is capturing the *outcome* afterwards.

11. **Do not assume displacing Excel is the goal.** The [READ] evidence points the other way:
    the schedule is a *calculation*, spreadsheets are where calculations live, and a decade of
    a purpose-built tool's issue tracker is dominated by making the spreadsheet bridge better.
    Compete on **re-timing, role views and propagation**, and interoperate on **the sheet**.

### The honest gap in this analysis

Everything above about the *technical* half of the event manager's world is reasonably
grounded. Everything about the **commercial and regulatory** half — supplier contracts,
venue agreements, permits, insurance, H&S sign-off, and the entire German
Veranstaltungsleiter legal frame — rests on [CORPUS] fragments and
**[BACKGROUND — UNVERIFIED]** knowledge. That is not a small omission: for a
*Veranstaltungsleiter* in the regulatory sense, it may be the larger half of the job. It
should be the first target of the next research pass.

---

## Sources

### Opened and read in this session — [READ]

All are GitHub issues, read via the issue-search API, which returns the full issue body, its
number, creation date and open/closed state.

**`cpvalente/ontime`** — run-of-show / rundown tool (GPL-3):

- https://github.com/cpvalente/ontime/issues/24 — roll behaviour on backstage events (2021-11-03)
- https://github.com/cpvalente/ontime/issues/27 — import excel (2021-11-03)
- https://github.com/cpvalente/ontime/issues/84 — API-settable presenter/lower-third messages; "not always listening to intercom while interviewing" (2022-01-05)
- https://github.com/cpvalente/ontime/issues/90 — per-role cue-sheet grid, hide other departments' columns, "same as a live edit multi-user google sheet" (2022-01-13)
- https://github.com/cpvalente/ontime/issues/99 — delay support in roll mode (2022-01-29, open)
- https://github.com/cpvalente/ontime/issues/119 — planner screen (2022-05-19)
- https://github.com/cpvalente/ontime/issues/137 — clutter-free editable view for a stage manager/script person to run the show (2022-05-27)
- https://github.com/cpvalente/ontime/issues/191 — speed up / slow down timers to reach schedule, preview finish time (2022-08-09, open)
- https://github.com/cpvalente/ontime/issues/204 — child events; reordering a setlist means reordering every sub-cue by hand (2022-09-15)
- https://github.com/cpvalente/ontime/issues/331 — adjust duration and all following start times when time is added/removed (2023-04-09)
- https://github.com/cpvalente/ontime/issues/371 — flashing over-time indication; "speakers are very busy and stressed on stage" (2023-04-30)
- https://github.com/cpvalente/ontime/issues/383 — countdown-to-start on viewer/public/backstage screens (2023-05-18)
- https://github.com/cpvalente/ontime/issues/391 — add fields to excel import (2023-05-18)
- https://github.com/cpvalente/ontime/issues/502 — improve excel import; clients send rundown spreadsheets at the last minute (2023-09-01)
- https://github.com/cpvalente/ontime/issues/538 — backstage view layout on iPads (2023-10-09)
- https://github.com/cpvalente/ontime/issues/542 — print view / PDF export (2023-10-09)
- https://github.com/cpvalente/ontime/issues/815 — automatically apply delay for overrunning events (2024-03-13)
- https://github.com/cpvalente/ontime/issues/942 — planned start and end incorrect (2024-05-09)
- https://github.com/cpvalente/ontime/issues/1013 — roll mode context awareness for multi-day events (2024-05-28)
- https://github.com/cpvalente/ontime/issues/1041 — per-department editable custom field; "single source of truth for the rundown" (2024-06-04)
- https://github.com/cpvalente/ontime/issues/1117 — date support, reported from Glastonbury (2024-07-02)
- https://github.com/cpvalente/ontime/issues/1221 — edit multiple events; rundown performance "fragile" (2024-09-21, open)
- https://github.com/cpvalente/ontime/issues/1230 — delay "Make Permanent" has no visible effect (2024-09-30)
- https://github.com/cpvalente/ontime/issues/1270 — export rundown to XLS or CSV (2024-10-17)
- https://github.com/cpvalente/ontime/issues/1293 — import and export excel; labelled example export for clients (2024-10-24)
- https://github.com/cpvalente/ontime/issues/1318 — carry overtime into the next item's start time (2024-11-05)
- https://github.com/cpvalente/ontime/issues/1325 — multi-event / multi-user; letting customers sign in and rearrange the itinerary; "around 65 events per year" (2024-11-08)
- https://github.com/cpvalente/ontime/issues/1327 — export as Excel/PDF to share; printing (2024-11-09)
- https://github.com/cpvalente/ontime/issues/1328 — multiple stages in one file; "one big cuesheet for the production assistant" (2024-11-13)
- https://github.com/cpvalente/ontime/issues/1423 — password protection for non-LAN deployments (2025-01-03)
- https://github.com/cpvalente/ontime/issues/1450 — timeline / NLE view across rooms; move sessions between rooms (2025-01-14)
- https://github.com/cpvalente/ontime/issues/1499 — real timer preview in editor (2025-02-15, open)
- https://github.com/cpvalente/ontime/issues/1547 — read-only views; producer/show caller retaining authority once live (2025-03-18)
- https://github.com/cpvalente/ontime/issues/1576 — foyer/public view replacing ten screens of static JPG agendas (2025-04-16)
- https://github.com/cpvalente/ontime/issues/1849 — over/under drifting by days (2025-10-28)
- https://github.com/cpvalente/ontime/issues/1912 — "Crashing and Losing Data", three occurrences, comes back with the demo project (2025-12-10)
- https://github.com/cpvalente/ontime/issues/1951 — date support; workaround is abusing groups as days (2026-01-22)
- https://github.com/cpvalente/ontime/issues/2104 — v4.9 end-time calculation problems; expectation that a fixed-end break "smoothens" an overrunning rundown (2026-06-16)

**`bitfocus/companion`**:

- https://github.com/bitfocus/companion/issues/1864 — per-page lockout PIN for volunteer operators; hidden long-press workaround "still can be found" (2022-01-14, open)

**`Sofie-Automation/sofie-core`**:

- https://github.com/Sofie-Automation/sofie-core/issues/1316 — RFC (posted on behalf of the BBC) on rundown activation semantics, non-linear vs linear productions and unintended resets (2024-11-11)

**`frappe/erpnext`** — used only for cross-domain corroboration on schedule re-timing:

- https://github.com/frappe/erpnext/issues/54271 — finish-to-start auto-scheduling from actuals; "in real life, there will be changes and the project timelines keep changing" (2026-04-14, open)
- https://github.com/frappe/erpnext/issues/50336 — Gantt dependencies not displayed (2025-11-04, open)
- https://github.com/frappe/erpnext/issues/26664 — Gantt/calendar view for delivery trips (2021-07-27, open)
- https://github.com/frappe/erpnext/issues/2979, /6934, /9117, /1840, /1705, /1694, /1584, /2286, /7080, /7653, /8312, /11829, /13964 — read while surveying project-scheduling complaints; none carried a finding beyond #54271

**`larszu/cable-planner`** — first-party, read while checking for client-facing export requests:

- https://github.com/larszu/cable-planner/issues/322 — patch sheets as a table plus CSV/XLSX export (2026-05-28)
- https://github.com/larszu/cable-planner/issues/109 — patch sheet export; device name, date and time required on every printed page (2026-05-14)
- https://github.com/larszu/cable-planner/issues/74 — single-device export (2026-05-12)

### Repository corpus consulted — [CORPUS]

Read this session as local files. Each was compiled in an earlier session and carries its own
method caveat; none of the external URLs they cite was opened by me.

- `/home/user/av-planner-suite/docs/research/METHOD.md`
- `/home/user/av-planner-suite/docs/research/workflow-chain.md`
- `/home/user/av-planner-suite/docs/research/roles/camera-operator.md`
- `/home/user/av-planner-suite/docs/research/roles/production-manager.md`
- `/home/user/av-planner-suite/docs/research/roles/streaming-engineer.md`
- `/home/user/av-planner-suite/docs/research/roles/audio-engineer.md`
- `/home/user/av-planner-suite/docs/research/roles/lighting-tech.md`
- `/home/user/av-planner-suite/docs/research/roles/warehouse.md`
- `/home/user/av-planner-suite/docs/research/landscape/broadcast-production-management.md`
- `/home/user/av-planner-suite/docs/research/landscape/event-rental-management.md`

### Cited *through* the corpus — not opened by me

These URLs appear in this repository's earlier dossiers. Neither I nor (per their own method
sections) the sessions that recorded them opened the pages in full.

Listed so the next researcher can go straight to them. Treat every one as **unverified**.

- https://info.shoflo.tv/event-production — "new versions of the rundown need to be constantly emailed and printed out"
- https://www.mindnapped.com/wissen/livestream/regieplan-vorlage-excel/ — Excel Regieplan version skew; printed Regieplan on production day
- https://ablaufregisseur.de/regieplan-vorlage/ — Regieplan column set
- https://www.m-regie.de/post/regieplan-veranstaltung — Regieplan guide
- https://www.dachverband-tanz.de/fileadmin/dateien_DTD/Fotos/Fotos_Projekte/Fotos_Qualifizierung/How_to_Regieplan_DTD_01.pdf — "How to Regieplan" (PDF)
- https://www.emrgmedia.com/event-run-of-show-template/ — version-numbering advice for run of show
- https://events.com/blog/run-of-show/ — run-of-show guide
- https://meyerproinc.com/live-event-run-of-show/ — live-event run of show
- https://rundownstudio.app/templates/ — run-of-show templates in Excel/Sheets/Numbers
- https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day — group chats failing on event day
- https://www.phaedrasolutions.com/blog/how-to-use-whatsapp-for-event-planning-without-hassle — WhatsApp for event planning
- https://www.newscaststudio.com/2026/05/26/case-study-itv-studios-uses-cuez-to-manage-back-to-back-shows-from-one-platform/ — ITV Studios dropping "bundles of printed rundowns"
- https://www.tvtechnology.com/production/itv-studios-deploys-cuez-live-production-platform — same deployment
- https://www.eventprof.co.uk/production-management/floorplans/ — floorplans delivered as PDF and native files
- https://www.geoevent.net/event-stage-design-that-works-on-show-day/ — physical conflicts on show day
- https://www.dceproductions.com/corporate-event-av-lighting-and-staging-the-technical-decisions-that-shape-the-room/ — room decisions
- https://filmustage.com/blog/digital-vs-paper-call-sheets/ — paper call sheets working offline, preventing accidental edits
- https://callsheetx.com/resources/call-sheet-template-checklist — stale call times; static PDFs give no visibility into who has the latest
- https://www.popprobe.com/checklist-library/events-entertainment/event-planning/event-site-survey-venue-assessment-checklist — site survey / venue assessment checklist
- https://changeorder.avrentalmiami.com/ — change-order definition covering schedule, equipment list, labour and venue requirements
- https://www.trincoll.edu/lits/technology/av-event-support/ — 48-hour late fee for late AV requests
- https://www.extremegroup.co.uk/blog/how-to-manage-last-minute-changes-before-a-trade-show/ — last-minute changes
- https://www.adapttvhistory.org.uk/outside-broadcast/technical-planning — OB technical recce (documents 1970s practice)
- https://shoflo.tv/ , https://cuez.app/ , https://rundownstudio.app/ , https://docs.getontime.no/ — the commercial and documentation surfaces of the rundown segment
- https://www.planningcenter.com/services — volunteer scheduling with per-service notes (house-of-worship analogue)

### Verified unreachable in this session

`www.reddit.com`, `old.reddit.com`, `controlbooth.com`, `www.prosoundweb.com`,
`blue-room.org.uk`, `www.film-tv-video.de`, `www.production-partner.de`, `www.vplt.org`,
`en.wikipedia.org`, `de.wikipedia.org`, `duckduckgo.com`, `lite.duckduckgo.com`,
`html.duckduckgo.com`, `www.bing.com`, `r.jina.ai`. `WebSearch` budget exhausted at 200/200
before this task began. GitHub repository search and cross-repository issue search are also
restricted; only per-repository issue search was available.
