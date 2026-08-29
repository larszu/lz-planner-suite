# Production Managers / Produktionsleiter / Projektleiter

Research dossier for AV Planner Suite. Compiled 2026-08-29.

> **Method and evidence caveat — read this first, it changes how every claim below should be weighted.**
>
> This session ran under a hard network restriction. The WebSearch budget was already
> exhausted (200/200 calls) before the first query for this role could be issued, and the
> egress proxy admits **only GitHub hosts** (`github.com`, `api.github.com`,
> `raw.githubusercontent.com`). Every other domain in the research brief was refused at the
> proxy with `EGRESS_BLOCKED` or `403` on CONNECT, verified individually:
> `reddit.com`, `old.reddit.com`, `prosoundweb.com`, `controlbooth.com`, `blue-room.org.uk`,
> `forum.blackmagicdesign.com`, `film-tv-video.de`, `production-partner.de`, `vplt.org`,
> `discuss.frappe.io`, `en.wikipedia.org`, `de.wikipedia.org`, `stackoverflow.com`,
> `gist.githubusercontent.com`. GitHub's own *global* search API is additionally blocked
> ("sessions are bound to their configured repositories"), so repositories could only be
> found through `github.com/topics/*` pages and issues could only be searched
> **within a named repository**.
>
> **What that means.** There is no Reddit, no professional forum, no trade press, no
> YouTube, no job posting and no German-language source read first-hand in this dossier.
> Two corpora were available and they are of very different quality:
>
> | Label | What it means | Weight |
> |---|---|---|
> | **[READ]** | I opened the cited URL in this session and read the page. All such pages are on GitHub. | Tier‑1 under [`METHOD.md`](../METHOD.md): open-source issue trackers — "what a vendor keeps fixing is what keeps breaking". |
> | **[CORPUS]** | Taken from this repository's own earlier research — [`workflow-chain.md`](../workflow-chain.md), [`landscape/event-rental-management.md`](../landscape/event-rental-management.md), [`landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md). Those documents state in their own method sections that **their pages were never opened** — they are search-engine summaries. | Second-hand. A pointer, not evidence. Never on its own a reason to build. |
> | **[INFERENCE]** | My reasoning from the above. | Flagged, not disguised. |
> | **[UNKNOWN]** | Could not be established. Left visible rather than guessed. | — |
>
> **The single biggest distortion to correct for.** The [READ] corpus is *asset-management
> and ERP software*, not *broadcast production management*. Its reporters are equipment
> coordinators, university AV managers, ERP administrators and live-event show callers, not
> Produktionsleiter at an OB provider. Where a finding comes only from that corpus it is
> evidence that **this class of break exists in software of this shape**, and it is
> [INFERENCE] that the same break bites a broadcast production manager. Every such leap is
> marked. Where the [CORPUS] documents are the only support, the claim is explicitly
> downgraded.
>
> **Frequency grading** follows `METHOD.md` (`isolated` / `recurring` / `widespread`), applied
> conservatively here: `widespread` only where **three or more independent reporters across
> two or more years, or three or more independent repositories**, show the same thing;
> `recurring` for two independent reporters or two source types; `isolated` otherwise.
> A `[CORPUS]`-only claim can never be graded above `recurring` in this document, regardless
> of how confident the source document sounded.
>
> **Known blind spots, named rather than filled.** The commercial half of this role —
> quoting mechanics, margin pressure, sub-hire negotiation, insurance, ATA carnets, client
> reporting — is the half this evidence base is *worst* at. A targeted search of a full open
> ERP for `carnet` returned **zero issues** ([READ], see Error sources), which tells us the
> paperwork is invisible to software, not that it is unimportant. Anything in this dossier
> about carnets, insurance certificates, or accommodation booking should be treated as
> `[UNKNOWN]` and re-researched the moment forum and trade-press access returns.

---

## Who they are / where they sit in the production

A production manager is the person who owns **the money and the promises**. Not the signal,
not the rig, not the shot — the commitment that a specific thing will exist in a specific
room at a specific hour for a specific price, and the reconciliation afterwards of what was
promised against what happened.

That is a structurally different job from every other role in this corpus. The technical
director, the video engineer, the lighting tech and the network engineer all own a *system*
whose state can be inspected. The production manager owns a *set of agreements* distributed
across e-mail threads, phone calls, a rental ERP, a crew tool, several spreadsheets and a
WhatsApp group — and there is no screen anywhere that shows all of them at once.

### The five populations, which the evidence keeps conflating

1. **Rental-house project manager / Projektleiter (2–50 staff).** Owns a job from enquiry to
   invoice. Writes the quote, converts it to an order, books crew and transport, sources what
   is short, goes to site or doesn't, and issues the final invoice. [CORPUS] describes this
   variant as having "the worst ratio of systems to staff — one project manager personally
   carries information across five or six boundaries, by hand, in the evenings"
   ([`workflow-chain.md`](../workflow-chain.md)). This is the archetype most of this dossier is
   about.

2. **Disponent (dispatcher) — a German-market split.** In larger German AV houses the role
   splits: the *Projektleiter* owns the customer and the money; the *Disponent* owns
   resources — who is free, what is free, which truck. [CORPUS] names CrewBrain↔easyjob as
   the documented interface between those two worlds, explicitly sold so "data does not have
   to be maintained twice". [INFERENCE] The existence of a commercial product whose entire
   value proposition is *one specific API between two specific German AV tools* is strong
   circumstantial evidence that (a) this boundary is real, (b) it is normally crossed by
   hand, and (c) it is worth money to close. `recurring` (one vendor, two products).

3. **Broadcast / OB production manager.** Books facilities rather than sells rentals: OB van,
   crew, transmission path, edit suites, sometimes against a running service contract rather
   than a one-off quote. [CORPUS] names Xytech MediaPulse (which absorbed ScheduALL),
   farmerswife and Provys as the products. The commercial entry point is a *facilities
   request*, and the technical planning starts earlier and is heavier — camera plan, cable
   schedule, router naming, MV layout, tally map, comms config, contribution booking, ISO
   record map. [CORPUS] estimates roughly twice as many document boundaries as corporate AV.

4. **Event-agency production manager.** Owns the *whole* event; AV is one of eight suppliers
   alongside catering, staging, rigging, security and travel. Their master document is not a
   rental order — it is a **production schedule** and a **supplier matrix**, and neither lives
   in any AV tool. [INFERENCE] from the shape of the artefacts in [CORPUS]'s station table.

5. **In-house / institutional / house-of-worship coordinator.** No invoice at the end, or an
   internal recharge. The chain starts with a **form or a ticket**, the inventory is fixed and
   shared, and the same rooms serve fifty events a month. This is the population the [READ]
   corpus actually documents best, because it is the population that adopts open-source asset
   tools: Shelf.nu's own README describes itself as built "for teams that need to know what
   they have, where it is, and who's using it"
   ([README](https://github.com/Shelf-nu/shelf.nu), [READ] 2026-08-29), and its issue reporters
   talk about *students*, *self-service users* and *coordinators*
   ([#1956](https://github.com/Shelf-nu/shelf.nu/issues/1956), [#2831](https://github.com/Shelf-nu/shelf.nu/issues/2831), both [READ]).

### The defining structural fact about this role

Every other role in this corpus has **one authoritative machine**. The TD has the switcher;
the audio engineer has the console; the network engineer has the switch config. When the
paperwork and the machine disagree, the machine wins, and reality is recoverable by reading it.

The production manager has **no authoritative machine**. The nearest thing is the rental ERP,
and the ERP is authoritative only for the commercial half — line items, dates, prices. It has
never heard of the cable schedule, the riser position, the venue's fire-lane rule, the verbal
promise made on the phone on Tuesday, or the substitution the warehouse made at 18:00 because
the third camera body was still out on another job.

[INFERENCE] This is why the failure mode of this role is not *error* but **omission**. Nothing
in their world crashes. It simply is not there when it is needed, and the cost lands on someone
else — the crew standing in a corridor, the client reading an invoice line they do not
recognise, the finance person matching a supplier PDF to a job four months later.

---

## A day in the life

Chronological, as the artefacts move. Ownership and timings follow the rental-house
project-manager variant. Claims are labelled; where the whole beat rests on [CORPUS] it is
marked as such and should be read as a hypothesis to verify.

### T‑6 weeks to T‑2 weeks: enquiry, quote, and the first fork

The enquiry arrives as free text — an e-mail body, a forwarded floor plan, a phone call
("can you do the 14th?"). [CORPUS] Nothing is structured yet, and the first real cost of the
job is incurred here: **a verbal promise made now becomes an unpriced line item at invoicing.**

The quote is written in the rental ERP, in commercially convenient units — "lighting package",
"audio package", day rates, a crew line, a travel line. [CORPUS] cites industry guidance that a
150–300-person corporate event should show 20–40 line items and that fewer than 15 means things
are bundled that should not be. The quote leaves as a **PDF**.

The fork opens here and never closes: the PDF the client approves and the technical plan the
systems engineer will build are two documents with no link. When the client says "cheaper" and
two items are cut, the technical plan built from the previous version is silently wrong.
[CORPUS] ranks this — *commercial quote → technical equipment list* — as **the single most
expensive break in the chain**, occurring on every project.

Meanwhile the production manager is already keeping a shadow spreadsheet, because the ERP
prices some things badly: labour matrices, travel, multi-day discount ladders. [CORPUS];
[INFERENCE] this is the seed of the budget-vs-actuals spreadsheet described below.

### T‑2 weeks: order, crew, and the availability question

The quote converts to a project inside the ERP — the one boundary in the whole chain that is
genuinely solved by a single click. [CORPUS]

Then three parallel chases begin, and none of them lives in the same place:

- **Crew.** Names, roles, call times, qualifications, who is driving. In small houses this is a
  spreadsheet and a WhatsApp group; in larger ones a crew tool with an ERP interface. [CORPUS]
  A call-time change propagates as *a new message*, not a new record.
- **Equipment availability and the shortage list.** The ERP answers "is it free?" — sometimes
  correctly. The [READ] corpus is unusually direct about how partially this works even in
  software built for it: reservations that are **extended** were not checked against other
  people's bookings, so "two users can have a booking for the same asset during overlapping
  time periods" ([shelf.nu #1761](https://github.com/Shelf-nu/shelf.nu/issues/1761), 2025‑05‑01,
  [READ]); conflicts that exist **inside a kit** were blocked but not shown — "the reserve
  button is still blocked and shows the message that there are conflicts that need to be
  resolved, but when looking at the asset/kit list the kit with the conflicts doesn't have any
  label" ([#1817](https://github.com/Shelf-nu/shelf.nu/issues/1817), 2025‑06‑05, [READ]).
- **Sub-hire.** What is short gets sourced from a peer, by phone or e-mail, with the supplier's
  own paperwork. [CORPUS] describes unintegrated operations as "blind to external shortages and
  dependent on manual cross-checking in separate spreadsheets".

### T‑1 week: travel, accommodation, permits, and the paperwork nobody's software owns

Hotels, flights, vans, parking permits, venue access forms, risk assessments, insurance
certificates and — for anything crossing a border — the carnet. [UNKNOWN] for tooling: this
dossier could not read a single source on how AV production managers actually do carnets, and a
search of a full open-source ERP for the term returned **zero issues**
([frappe/erpnext `?q=carnet`](https://github.com/frappe/erpnext/issues?q=is%3Aissue+carnet), [READ]).

What the [READ] corpus *does* show is the shape of the travel gap in software that models it
explicitly. ERPNext's HR module has a Travel Request document, and the standing complaint about
it is that it is "more like a data capture, and doesn't lead to any accounting transactions et
al.", with a suggestion that it should be folded into the richer Expense Claim
([frappe/hrms #346](https://github.com/frappe/hrms/issues/346), 2023‑02‑26, **still open**
2026‑08, [READ]). [INFERENCE] That is precisely the production manager's travel problem stated
in ERP terms: *the thing you plan and the thing you pay for are two unconnected records*, so
the trip is entered once as an intention and again as a cost.

### T‑2 days: the change

The client asks for one more thing. [CORPUS]'s case study — a fifth camera added 48 hours
before a corporate show — models **roughly 30 artefacts** that must be touched for one camera:
change order, client approval, order lines, availability check, sub-hire PO, supplier delivery
note, reprinted pick list, case labels, truck plan, crew plan, crew confirmation, reissued call
sheet, camera plan, venue approval for the riser, risk assessment, cable schedule, cable labels,
signal-flow drawing, router naming, MV layout, tally map, switcher naming, CCU assignment, comms
config, RF coordination, power plan, ISO record map, running order, check-in list, invoice.

Twelve of those are pure re-typing of information that already exists somewhere else; six are
documents already printed or sent that are now stale in someone's hands. [CORPUS]

The law [CORPUS] draws from this is the most useful single sentence in the whole corpus for
this role: **the cost of a change is not proportional to the size of the change; it is
proportional to the number of systems the change has to be re-entered into, which is fixed per
company.** Adding one camera and adding four cost nearly the same paperwork.

### Load-in day

The production manager's job becomes **answering questions and absorbing changes**. Where is
the fibre drum. Who signed for the riser. Is the second truck through. Did the sub-hire lens
arrive and whose is it. Can we get an extra person for tomorrow.

Nothing crosses back into any system. [CORPUS] states it flatly for this station: *"Nothing
crosses back. Changes are made in pen on the printed plan."*

Two [READ] findings show the software-side shape of the same problem:

- **Paper is asked for, explicitly, as a feature.** The stated reason for the Shelf.nu booking
  PDF was "to print out the generated list of assets as a PDF for record keeping and for a
  physical reference on set" ([#942](https://github.com/Shelf-nu/shelf.nu/issues/942),
  2024‑04‑30, [READ]). The system's job here is not to replace paper — it is to *print* it.
- **Availability displays mislead precisely when someone is looking for gear.** The asset index
  shows total stock — "5 pcs" — while the detail page may show "0 available (units in custody +
  bookings reserving more)"; the reporter's words: "A field user reads the index number as
  'available to grab'" ([#2767](https://github.com/Shelf-nu/shelf.nu/issues/2767), 2026‑07‑29,
  [READ]). A near-identical defect was filed three weeks later where the index said "Partial
  custody" (units assigned but on site) while the detail page said "Partially checked out"
  (units gone on a booking), so "a user reviewing the index would incorrectly assume stock
  remains on-site when 5 of 29 units are actually checked out"
  ([#2875](https://github.com/Shelf-nu/shelf.nu/issues/2875), 2026‑08‑17, [READ]).

`recurring` → `widespread` within that product: six independent availability/conflict defects
from four different reporters between May 2025 and August 2026 (#1761, #1817, #2724, #2767,
#2821, #2875, all [READ]). [INFERENCE] The generalisable claim is not "Shelf.nu is buggy" — it
is that **availability is genuinely hard to render honestly**, because "available" is a function
of stock minus custody minus reservations minus over-commitment, computed over a time axis, and
every surface that shows a simplified version of it will mislead someone under pressure.

### Rehearsal and show

The production manager is now mostly out of the loop technically and fully in the loop
commercially: extras get agreed verbally, overtime starts accruing, someone breaks something.

The one [READ] artefact that speaks directly to this hour is a request for **read-only views**
of the running order, and its rationale is worth quoting in full because it is the clearest
statement in the whole corpus of what a production manager wants from shared documents:

> "I have two locations putting on a single show. both sites want to be able to see the cuesheet
> so they can have an overview of the show and what is coming up accross all departments.
> however as the producer / show caller I do not want some one else to be able to alter the cue
> sheet once we are on site and the show is live."
> — [cpvalente/ontime #1547](https://github.com/cpvalente/ontime/issues/1547), 2025‑03‑18, [READ]

**Wide visibility, narrow authorship.** That is the requirement. Not collaboration — *broadcast*.

### Load-out and the 03:00 problem

[CORPUS] is unambiguous here and it matches every practitioner intuition: "Anything not written
down at 03:00 is discovered days later at check-in and cannot be attributed to a job or a
person."

The [READ] corpus contains the exact feature request that this generates. Someone asked for a
return prompt — "Did anything go wrong with this item?" — with quick options (all good, missing
part, damaged/not working), a note field and optional photos, because today "there is currently
no built-in way for users to report equipment issues during a checkout period" and problems are
"only discovered after gear returns or when subsequent users identify damage"
([shelf.nu #1957](https://github.com/Shelf-nu/shelf.nu/issues/1957), 2025‑07‑29, [READ]).

### Post: the week nobody budgets for

Check-in discrepancies, damage attribution, sub-hire supplier invoices arriving as PDFs by
e-mail, crew hours to reconcile, the final invoice, and the argument about the extras. [CORPUS]

And then the chasing. The most quotable [READ] evidence for what this week actually consists of
comes from a late-returns feature request: "Students forget or miss return dates", "Admins must
manually check for what gear is due or overdue, **every single day**", and there is "no
structured or transparent way to follow up on late returns". The reporter had previously built
their own fix — **Excel plus Power Automate** to send timed reminders — which "dramatically
reduced late returns" but was disconnected from the actual system
([shelf.nu #1956](https://github.com/Shelf-nu/shelf.nu/issues/1956), 2025‑07‑29, [READ]).

[INFERENCE] That is the production manager's post-show week in miniature: a daily manual sweep
for things that have not come back, plus a private automation built in a spreadsheet because the
system of record does not do it.

---

## Tools they actually use

Feelings are graded honestly: **[READ]** where a cited issue shows the sentiment, **[CORPUS]**
where the earlier corpus asserts it, **[INFERENCE]** where it is my reading of the artefacts.
Products named only in [CORPUS] were never verified against a vendor page in this session.

| Tool | For what | How they feel about it |
|---|---|---|
| **Rental ERP** — Rentman, Current RMS / OnRent Events, HireHop, easyjob, Flex, Point of Rental [CORPUS] | The commercial spine: customer → quote → project → reservation → pick → scan-out → scan-in → invoice [CORPUS] | Dependent, not fond. It is authoritative for money and dates and blind to everything technical. [INFERENCE] The tell is that the same person maintains a parallel spreadsheet for the parts it prices badly [CORPUS]. |
| **Excel / Google Sheets** | Budget vs actuals, labour matrices, shortage and sub-hire comparison, truck load, crew rota, advancing, cable and input lists received from others | **The honest answer to most questions.** Not resented — *relied on*. The ERPNext user who wrote "I have to go to excel, maintain an task sheet with cost estimate and enter the total estimate in erpnext" was describing a workflow, not complaining about Excel ([erpnext #34127](https://github.com/frappe/erpnext/issues/34127), 2023‑02‑19, [READ]). |
| **E-mail** | Client agreements, supplier POs and confirmations, sub-hire, venue access, the audit trail | Tolerated as the only medium both parties accept as evidence. [INFERENCE] |
| **WhatsApp (or equivalent group chat)** | Crew availability, swaps, "who's driving", ETAs, on-site photos, "we're two DMX cables short", change requests from the client | **Fastest channel that exists, and a black hole.** [CORPUS] grades it the *dominant* carrier at four stations (crew, load-in, load-out, transport). Its status as a business channel is corroborated [READ] by a live ERPNext feature request for first-party WhatsApp integration ([#51855](https://github.com/frappe/erpnext/issues/51855), opened 2026‑01‑19, labelled Under Review, assigned) — though the issue body itself carries no rationale beyond links, so the *why* is [UNKNOWN]. |
| **Accounting** — Lexware / DATEV / Xero / QuickBooks [CORPUS] | Where the invoice actually becomes money | Somebody else's system, entered from theirs. [CORPUS] describes the ERP→accounting step as "export or re-typing". |
| **Crew / disposition tool** — CrewBrain, Rentman crew module, easyjob personnel, farmerswife, Xytech [CORPUS] | Availability, booking, hours, qualifications | Good where it has an API to the ERP, an island where it does not. [CORPUS] |
| **Time / hours tracking** — Kimai and similar | Turning crew hours into cost and into invoice lines | Adequate at recording, weak at *telling you something*. Users ask for the summary they cannot get: hours "for each Client, or each Project, over weekly, monthly or yearly time periods", with pivots and "bar and pie graphs", the current views being "cumbersome" ([kimai #5593](https://github.com/kimai/kimai/issues/5593), 2025‑07‑29, [READ]). |
| **Asset / booking tool** — Shelf.nu, Snipe-IT, Cheqroom | Who has what, where it is, when it is due back. Dominant in in-house/education/HoW; a second system where a rental ERP already exists | Genuinely liked for *custody*; fought with over *availability*. See the six conflict/availability issues cited above [READ]. |
| **Rundown / timing tool** — ontime and similar | The running order on the day, and the countdown on the wall | Liked. But the running order **comes from a spreadsheet and goes back to one** — see the nine-issue import/export family below [READ]. |
| **CAD / Visio / PDF viewer** | Reading the technical plans they commissioned and forwarding them | Consumer, not author. [INFERENCE] The production manager is usually the *distributor* of the drawing and the person who discovers it is out of date. |
| **Shared drive / Dropbox / project folder** | The archive | Trusted right up until it is needed. [CORPUS] notes Dropbox byte-sync corrupting a lighting data-exchange file as a documented failure. |
| **Calendar (Outlook / Google / Apple)** | Where every human actually checks what they are doing | The universal endpoint, and badly served. The stated problem: users download static `.ics` files per booking, and when "assets are added/removed or dates shift, the calendar event goes stale. Users have to manually re-download" ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390), 2026‑03‑03, [READ]). |
| **Printer and paper** | Pick lists, call sheets, running orders, load-out lists, delivery notes, damage forms | Not a legacy embarrassment — a **requirement**. [CORPUS] argues paper needs no battery, works in a basement with no connectivity, and both parties can sign it, which is exactly the load-in failure profile. Corroborated [READ] by the booking-PDF request being justified as "a physical reference on set" ([#942](https://github.com/Shelf-nu/shelf.nu/issues/942)). |
| **A barcode / QR scanner** | Scan-out, scan-in | Loved when it works, a hard blocker when it does not. [READ] evidence that scanner-only design is dangerous: model-based reservations "can only be turned into a concrete asset by **scanning**. There is no way to fulfil one by selecting an asset from a list", and since "model requests must all be fulfilled before checkout", a coordinator without a working scanner is simply blocked ([#2831](https://github.com/Shelf-nu/shelf.nu/issues/2831), 2026‑08‑10, [READ]). |

**Tool count.** [INFERENCE], but the arithmetic is not controversial: a small-house project
manager on a single job routinely touches the ERP, Excel, e-mail, WhatsApp, a calendar, a PDF
viewer, a printer, a shared drive and the accounting export — **nine surfaces minimum**, before
any technical tool, crew tool or supplier portal is counted. [CORPUS] independently arrives at
"five or six boundaries" for the same variant, counting boundaries rather than tools.

---

## Time sinks (ranked)

Ranked by *cost per occurrence × frequency*. The ranking itself is [INFERENCE]; the evidence
under each item carries its own label and grade.

### 1. Re-typing the commercial list into the technical list, and the corrected technical list back into the commercial one

**Frequency: `widespread` ([CORPUS], every project).** The quote is priced in packages and day
rates; the technical plan needs models, counts, connector types, lengths, spares and the
adapters nobody quotes. [CORPUS] ranks this the most expensive break in the entire chain and
notes that no vendor sells both ends of it, which is why it is also the least publicly
documented. Cost: hours per project, absorbed by the production manager or systems engineer.

**Evidence quality warning:** this is a [CORPUS]-only claim in this session. It is also the
claim on which this product's strategy most depends, so it is the **first thing to re-verify**
when forum access returns.

### 2. Rebuilding budget-versus-actual in a spreadsheet, every week, forever

**Frequency: `recurring` [READ] + `widespread` [CORPUS].** The clearest first-hand statement in
the entire corpus, from an ERPNext user in 2023 whose request is still open:

> "I have to go to excel, maintain an task sheet with cost estimate and enter the total estimate
> in erpnext" … "I have to copy the actual cost incurred from erpnext to Excel for a side by
> side comparison of which task has the most delta"
> — [frappe/erpnext #34127](https://github.com/frappe/erpnext/issues/34127), 2023‑02‑19, [READ]

The same issue makes a distinction production managers make constantly and software rarely does:
*"Project estimate is different from a budget. Project estimate is a derived quantity based on
what the task estimate is."* A budget is money allocated; an estimate is money **rolled up from
the work**. Systems that only model the former force the latter into Excel.

Corroborating [READ] from a different product and a different year: users ask to be **alerted**
when a project's time budget is exceeded, because today the only way to find out is "manually
reviewing the reporting/project view page", with no filter for over-budget projects
([kimai #5421](https://github.com/kimai/kimai/issues/5421), 2025‑03‑26); and separately, not to
be *able* to start work on an exhausted budget at all
([kimai #5590](https://github.com/kimai/kimai/issues/5590), 2025‑07‑27, open, [READ] via issue
list). Three independent reporters, two products, 2023–2025 → `recurring`, trending `widespread`.

Cost: [UNKNOWN] in hours. [INFERENCE] weekly, per project, for the life of the project.

### 3. Chasing confirmations across four channels that do not talk

**Frequency: `widespread` [CORPUS]; `recurring` [READ] by analogy.** Crew availability in
WhatsApp, sub-hire on the phone, venue access by e-mail, client approval verbally. Each chase is
minutes; there are dozens per job; none produces a record that any system can query.

The [READ] analogue is the daily manual sweep: "Admins must manually check for what gear is due
or overdue, every single day", with "no structured or transparent way to follow up"
([shelf.nu #1956](https://github.com/Shelf-nu/shelf.nu/issues/1956), 2025‑07‑29). The same
reporter's homemade fix — Excel + Power Automate reminders — is the exact shape of the shadow
automation production managers build. `isolated` as a direct read; `recurring` combined with
[CORPUS]'s four WhatsApp-dominant stations.

### 4. Reissuing documents after every change, and tracking who has the stale one

**Frequency: `widespread` [CORPUS].** Six of the thirty artefacts in the added-camera case study
are documents already printed or sent that are now wrong: pick list, case labels, call sheet,
risk assessment, running order, camera plan. [CORPUS] cites static PDFs giving "no visibility
into who has seen the latest version" and stale call times carried over from yesterday's
document as the recurring concrete failure.

[READ] corroboration of the *underlying* need, from the show-caller quoted earlier: what is
wanted is a **live read-only view** for everyone else, precisely so that there is only one
current version and only one person who can change it
([ontime #1547](https://github.com/cpvalente/ontime/issues/1547), 2025‑03‑18).

### 5. Fighting the availability answer

**Frequency: `widespread` within the [READ] product; `recurring` as a general claim.** Six
independent defects, four reporters, May 2025 – August 2026: double booking on extension
(#1761), invisible kit conflicts (#1817), four divergent availability formulas producing a
negative "Available" that blocks check-out (#2724, closed, Priority: High), index showing total
stock without availability context (#2767), a 500 instead of a conflict error on concurrent kit
custody (#2821), and index/detail status disagreement (#2875). All [READ].

[INFERENCE] Every minute a production manager spends deciding whether the availability number is
true is a minute they are doing the computer's job. The consequence when they guess wrong is
item 2 in Error sources.

### 6. Reconciling receipts, per-diems and travel costs into the job

**Frequency: `recurring` [READ].** The manual process, described by an ERPNext HR user in 2026:
open the Expense Claim form and "manually type each expense line item — selecting the Expense
Date, Expense Claim Type, typing a Description, and entering the Amount" for **every receipt**,
then attach images separately as unlinked files; the request calls it "tedious, error-prone" and
"significant friction — especially for employees who accumulate many small receipts"
([frappe/hrms #4541](https://github.com/frappe/hrms/issues/4541), 2026‑05‑16, [READ]).

Combined with the still-open complaint that Travel Request "doesn't lead to any accounting
transactions" ([hrms #346](https://github.com/frappe/hrms/issues/346), 2023‑02‑26, [READ]), the
picture is: **the trip is planned in one record, paid from another, and charged to the job in a
third.** Two reporters, one product, three years apart → `recurring`.

### 7. Producing the client-facing report

**Frequency: `recurring` [READ].** What is wanted is aggregation the tools do not offer: hours
per client, per project, over week/month/year, with pivots and charts, because the existing
monthly view shows "a row for each project AND activity" which makes client-level analysis
unclear, and monthly reports lack "helpful graphics or added calculations like Percentage
breakdowns" ([kimai #5593](https://github.com/kimai/kimai/issues/5593), 2025‑07‑29, [READ]).

A second, subtler [READ] wish is about making an export *comprehensible to the client*: the
request was to put import and export on the same page, plus "an example export you can send out
to clients that has what each field is so production does not get confused on what each field
is" ([ontime #1293](https://github.com/cpvalente/ontime/issues/1293), 2024‑10‑24, [READ]).
[INFERENCE] That is a production manager asking for a **data dictionary they can forward** —
because half their week is explaining their own columns to other people.

### 8. Shepherding the running order between the spreadsheet and the show tool

**Frequency: `widespread` within the [READ] product.** Nine issues, at least seven distinct
reporters, April 2024 – August 2026, all about the same seam:

| Issue | Date | What it says |
|---|---|---|
| [#786](https://github.com/cpvalente/ontime/issues/786) | 2024‑04‑08 | Google Sheets via docker |
| [#927](https://github.com/cpvalente/ontime/issues/927) | 2024‑04‑29 | Custom fields ignored on xlsx and Google Sheets import — mapped fields "neither displaying in the preview window nor persisting"; manually created custom fields **removed** after import |
| [#1054](https://github.com/cpvalente/ontime/issues/1054) | 2024‑06‑06 | User assumed authenticated sheets meant **bidirectional live sync**; it was manual export/import |
| [#1293](https://github.com/cpvalente/ontime/issues/1293) | 2024‑10‑24 | Unify import/export; ship an annotated example export for clients |
| [#1310](https://github.com/cpvalente/ontime/issues/1310) | 2025‑10 (closed) | Blocks from .xlsx imported as Events |
| [#1327](https://github.com/cpvalente/ontime/issues/1327) | 2025‑10 (closed) | Event export as Excel |
| [#1663](https://github.com/cpvalente/ontime/issues/1663) | 2025‑06‑25 | Sync sends **empty** custom fields; "subsequent syncs overwrite any manual entries with blanks" |
| [#1890](https://github.com/cpvalente/ontime/issues/1890) | 2025‑11‑26 (closed) | Custom fields not storing correctly after Google Sheets import |
| [#2125](https://github.com/cpvalente/ontime/issues/2125) | 2026‑08‑25 (closed) | Exported rundowns do not include automations |

All [READ] (issue list + four individual issues). [INFERENCE] The reason this seam is so busy is
that **the running order is a production-manager document, not a technical one**. It is authored
collaboratively in a spreadsheet by people who will never open the show software, and it must
end up inside the show software without losing the columns the production office added.

### 9. Making exports round-trip

**Frequency: `recurring` [READ].** A worked example of why "just export it, edit it, import it
back" costs an afternoon: the standard export carries the ID column the update-importer needs
but writes quantity as `"10 boxes"`, which the importer rejects because it wants a bare integer,
and three fields "are not export columns at all" and must be added by hand; the *import-ready*
export formats quantities correctly but "has no `id` / `sequentialId` column" for row matching
and uses raw internal keys instead of human labels, so every column is flagged unrecognised
([shelf.nu #2777](https://github.com/Shelf-nu/shelf.nu/issues/2777), 2026‑07‑31, [READ]).

[INFERENCE] Neither export is usable without hand-editing. This is the mechanism by which a
"bulk edit in Excel" — the production manager's fastest tool — becomes a slow, error-prone task.

### 10. Waiting for, and then re-keying, what happened on site

**Frequency: `widespread` [CORPUS].** Substitutions, re-routes, repositions and the sub-hired
item that arrived instead of the one ordered. [CORPUS] calls this "on-site reality → nothing"
and ranks it third in the chain overall, paid for by the *next* project team.

---

## Double data entry

The organising question is: **how many times does one fact get typed?** Below, each row is a
fact and the systems it is typed into. Labels mark which hops are evidenced and which are
[INFERENCE] from the artefact set.

| The fact | Typed into (in order) | Evidence |
|---|---|---|
| **Job identity** — client, dates, venue, contact | Inbound e-mail → CRM/ERP quote → ERP project → crew tool → shared calendar → call sheet → running order header → invoice → project folder name | [CORPUS] station table; [INFERENCE] on the exact hop count |
| **Equipment** — what is going | Quote line → technical plan/BOM → ERP reservation → pick list → truck/load plan → sub-hire PO → check-in list → invoice line | [CORPUS] breaks 1, 2, 9, 12; **the central claim of this dossier** |
| **Crew** — who, when, what rate | Crew plan/Excel → WhatsApp confirmation → call sheet PDF → timesheet → payroll → invoice line | [CORPUS] station 4 + 19 |
| **Estimate vs actual cost** | Excel task sheet → ERP project total → back out to Excel for the side-by-side | **[READ], verbatim** — [erpnext #34127](https://github.com/frappe/erpnext/issues/34127), 2023‑02‑19 |
| **Travel** — trip, hotel, flights | Travel request record → expense claim → project cost/accounting | **[READ]** — [hrms #346](https://github.com/frappe/hrms/issues/346) (travel request "doesn't lead to any accounting transactions"); [hrms #4541](https://github.com/frappe/hrms/issues/4541) (each receipt hand-typed) |
| **Running order / cues** | Google Sheet (production office) → show tool import → operator/cuesheet views → PDF for the desk → sometimes back to the sheet | **[READ]** — nine-issue ontime family above; [#1054](https://github.com/cpvalente/ontime/issues/1054) shows users *expected* bidirectional sync and did not have it |
| **A booking's dates** | Booking system → downloaded `.ics` → each person's calendar; re-downloaded by hand on every change | **[READ]** — [shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390), 2026‑03‑03 |
| **Bulk equipment edits** | System → export → hand-fixed in Excel (units stripped, columns added, headers renamed, ID column reinstated) → re-imported | **[READ]** — [shelf.nu #2777](https://github.com/Shelf-nu/shelf.nu/issues/2777), 2026‑07‑31 |
| **Device/source names** | Plan → router → multiviewer → tally/UMD → comms panel keys → switcher → label printer | [CORPUS] break 5; five to seven typings of the same string, no link between them |
| **Serial numbers** — for insurance, carnet, sub-hire receipt | Inventory record → carnet list → insurance schedule → supplier's delivery note | [UNKNOWN] — **no source in this session**. Listed because the artefacts logically require it; must be verified. |
| **Hours** — crew time | Timesheet → billing → invoice → and, when a credit note is issued, back again | **[READ]** — "Sales Invoice Returns Don't Unbill Timesheets" ([erpnext #51131](https://github.com/frappe/erpnext/issues/51131), closed 2026‑01‑14) is the failure of exactly this hop |

**The pattern.** [INFERENCE] Double entry in this role is not mostly caused by *missing APIs*.
It is caused by **two different unit systems for the same object**: the quote counts packages
and days, the plan counts devices and runs, the warehouse counts cases and serials, the invoice
counts chargeable lines. A translation happens at each boundary, and translation is exactly what
cannot be automated by a naive integration — which is why the boundaries survive even in
companies that have bought every product in the category. [CORPUS] reaches the same conclusion
by a different route: the large rental house has solved *quote → warehouse → invoice* and has
not solved *quote → technical design → device configuration*.

---

## Error sources

Ordered by consequence, not frequency. Each carries what it costs.

### 1. Silent data loss on import/export

**What goes wrong.** Fields that were mapped simply do not arrive, and — worse — the sync
overwrites the good copy with the empty one. Verbatim: custom fields sync as empty cells, and
"subsequent syncs overwrite any manual entries with blanks"
([ontime #1663](https://github.com/cpvalente/ontime/issues/1663), 2025‑06‑25, [READ]). A year
earlier, custom fields were "neither displaying in the preview window nor persisting" after
import, and manually created custom fields were *removed*
([ontime #927](https://github.com/cpvalente/ontime/issues/927), 2024‑04‑29, [READ]).

**What it costs.** [INFERENCE] The columns that get lost are the ones the production office
added — the notes, the responsible person, the client-facing description. They are lost quietly,
and the loss is discovered by whoever needed that column, at the moment they needed it.
Frequency `recurring`→`widespread` within that product (three reporters, 2024–2025).

### 2. Availability that is true in one place and false in another

**What goes wrong.** Index says "5 pcs"; detail says "0 available". Index says "Partial
custody"; detail says "Partially checked out". Both [READ]
([#2767](https://github.com/Shelf-nu/shelf.nu/issues/2767), [#2875](https://github.com/Shelf-nu/shelf.nu/issues/2875)).
A reservation extended without a conflict check produces two valid bookings for the same asset
over the same period ([#1761](https://github.com/Shelf-nu/shelf.nu/issues/1761), [READ]).
Conflicts inside a kit block the reserve button without indicating *which* kit
([#1817](https://github.com/Shelf-nu/shelf.nu/issues/1817), [READ]).

**What it costs.** The production manager promises something they do not have. [INFERENCE] The
cost is asymmetric and back-loaded: the error is made in week one, discovered on the truck in
week four, and paid for as a rush sub-hire, a substitution the client did not agree to, or a
crew standing still.

### 3. The change that reaches N−1 documents

**What goes wrong.** One late change; roughly thirty artefacts; twelve of them re-typings; six
already printed. [CORPUS] models which ones actually get missed and what the audience sees: the
multiviewer layout (the director calls a shot nobody can find), tally (talent looks at the wrong
camera), comms (the new operator cannot hear the director — "most visible failure, discovered at
the first rehearsal, fixed by handing the op a radio and never written down"), the cable
schedule (the drum is 20 m short), the truck plan (the case travels in a car and arrives after
the load-in has passed that point), the check-in list (the sub-hired lens is a stranger at
check-in and goes back late, billing another week).

**What it costs.** [CORPUS] Anywhere from an hour of standing crew to a visible on-air error.
`widespread` [CORPUS]; [INFERENCE] the mechanism is omission, not mistake, which is why more
diligence does not fix it.

### 4. Money errors in the billing chain

**What goes wrong.** [READ], from one product's tracker in one year: value doubling in the
Timesheet Billing Summary report ([erpnext #58276](https://github.com/frappe/erpnext/issues/58276)
/ [#58275](https://github.com/frappe/erpnext/issues/58275), Aug 2026); sales-invoice returns
failing to unbill the timesheets they reversed
([#51131](https://github.com/frappe/erpnext/issues/51131), Jan 2026); base amounts not calculated
consistently between the Python and JavaScript paths
([#50389](https://github.com/frappe/erpnext/issues/50389), Dec 2025).

**What it costs.** [INFERENCE] Either the client is over-billed and disputes it, or hours are
silently billed twice or not at all. This is the category where the production manager's
personal credibility is the asset at risk. `recurring` (three defects, one product, nine months).

### 5. Scanner-only workflows that have no fallback

**What goes wrong.** A design decision that a thing can *only* be done by scanning, on a job
where the scanner is flat, the phone has no signal in the basement, or the label is on the
inside of a flightcase already in the truck. Verbatim: model reservations can only be fulfilled
by scanning, "there is no way to fulfil one by selecting an asset from a list", and since model
requests must all be fulfilled before checkout, the coordinator is blocked outright
([shelf.nu #2831](https://github.com/Shelf-nu/shelf.nu/issues/2831), 2026‑08‑10, [READ]). The
reporter notes "every other booking action has a no-scan alternative".

**What it costs.** [INFERENCE] The truck leaves without the paperwork being right, and the
system permanently disagrees with reality from that moment.

### 6. Damage and loss discovered too late to attribute

**What goes wrong.** There is no way to report a problem *during* a checkout, so issues are
"only discovered after gear returns or when subsequent users identify damage"
([shelf.nu #1957](https://github.com/Shelf-nu/shelf.nu/issues/1957), 2025‑07‑29, [READ]).
[CORPUS] adds that short damage-reporting windows (24 h is commonly cited) mean an undocumented
load-out becomes an uncharged loss.

**What it costs.** Unattributable, therefore unbillable, therefore absorbed. `recurring`.

### 7. Stale derived documents in other people's hands

**What goes wrong.** Static `.ics` files go stale on every change and must be manually
re-downloaded ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390), [READ]).
[CORPUS] says the same of PDF call sheets. [INFERENCE] Anything the production manager *sends*
becomes a fork the moment it is sent.

### 8. The paperwork software has never heard of

**What goes wrong — and the evidence gap.** A targeted search of a mature, full-scope,
multi-country open-source ERP for **`carnet`** returned **zero issues**
([frappe/erpnext](https://github.com/frappe/erpnext/issues?q=is%3Aissue+carnet), [READ],
2026‑08‑29). A search for `subcontract` in the same tracker returned ten issues, **all of them
manufacturing subcontracting** — BOMs, work orders, semi-finished goods, production plans
([READ](https://github.com/frappe/erpnext/issues?q=is%3Aissue+subcontract), 2026‑08‑29) — and
none of them equipment **sub-hire**.

[INFERENCE] These two null results are among the more informative findings in this dossier.
ATA carnets, insurance schedules and equipment sub-hire are not *badly supported* by
general-purpose business software; they are **absent from its vocabulary**. Whatever production
managers do about them, they do outside any system that could check their work.
Actual practice: **[UNKNOWN]** — no readable source in this session.

---

## Paper / Excel / WhatsApp inventory

Specific documents, as far as the evidence allows. Items resting only on [CORPUS] are marked and
should be treated as a checklist to verify, not as findings.

### Paper — printed, carried, marked up, signed

| Document | Who holds it | Why it stays paper |
|---|---|---|
| **Pick list / pull sheet** | Warehouse | Ticked in pen while both hands are in a case. [CORPUS] cites a vendor case study of a customer still packing from *printed* pack lists |
| **Booking / asset list PDF** | Whoever is on set | Asked for explicitly as "a physical reference on set" — [shelf.nu #942](https://github.com/Shelf-nu/shelf.nu/issues/942), [READ] |
| **Call sheet / crew list** | Every crew member, on the truck | Printed before the update arrives; [CORPUS] names stale call times as the recurring failure |
| **Running order / cue sheet** | Show caller, operators, stage | The one document nobody will trust to a battery. [CORPUS] |
| **Delivery notes and supplier paperwork** | Driver, warehouse | Both parties sign it; it is the evidence. [CORPUS] |
| **Load-out list** | Crew, at 03:00, in the rain | [CORPUS] |
| **Damage / condition report** | Warehouse at check-in | [CORPUS]; the [READ] request at [#1957](https://github.com/Shelf-nu/shelf.nu/issues/1957) is an attempt to move it earlier and onto a phone |
| **Risk assessment / method statement** | H&S file, venue | Regulatory; needs a signature. [CORPUS] |
| **The marked-up floor plan** | Production manager's clipboard | The only record of what actually got moved. [CORPUS] — and it goes in the skip |
| **Carnet and customs documents** | Whoever crosses the border | [UNKNOWN] — no readable source |

### Excel / Google Sheets — the actual system of record for everything commercial that is not a line item

| Spreadsheet | What it holds | Evidence |
|---|---|---|
| **The budget sheet** | Task-level cost estimates, the roll-up, and a hand-built side-by-side of estimate vs actual copied out of the ERP | **[READ], verbatim** — [erpnext #34127](https://github.com/frappe/erpnext/issues/34127) |
| **The labour / crew matrix** | Rates by role, day, overtime tier, travel time — the things the ERP prices badly | [CORPUS] |
| **The shortage and sub-hire comparison** | What is missing, who has it, what they want for it | [CORPUS] |
| **The advancing sheet** | Client requirements gathered from riders, e-mails and calls | [CORPUS] |
| **The running order** | Authored in Google Sheets by people who never open the show tool, then imported | **[READ]** — the nine-issue ontime family |
| **The reminder automation** | Excel + Power Automate, built privately because the system of record does not chase | **[READ]** — [shelf.nu #1956](https://github.com/Shelf-nu/shelf.nu/issues/1956) |
| **The bulk-edit workspace** | Exported inventory, hand-fixed, re-imported | **[READ]** — [shelf.nu #2777](https://github.com/Shelf-nu/shelf.nu/issues/2777) |
| **The truck load plan** | Cases, weights, volumes, stacking order | [CORPUS] |
| **Cable / input / IP lists received from technical** | The production manager is not the author, but is the distributor and the version-keeper | [CORPUS] |

[INFERENCE] The common property of every one of these: **it is a calculation or a comparison,
not a record.** Rental ERPs are built to store records. Spreadsheets are where anything gets
*compared* — estimate against actual, requirement against stock, this supplier against that one.
Until a tool can do comparison, Excel is not going anywhere and should not be fought.

### WhatsApp / group chat — the fastest channel, and the one with no memory

[CORPUS] grades messaging as the *dominant* carrier at four stations: crew (availability, swaps,
who is driving), load-in (photos of the rack back, "where is the fibre drum"), transport (ETAs
and delays) and load-out ("who has the case for the long lens?"). Client change requests arrive
here too, and — this is the expensive part — **approvals** arrive here.

The [READ] corroboration that this is a business channel and not a social one is that a
production-grade ERP has an open, assigned, under-review feature request for first-party
WhatsApp integration ([erpnext #51855](https://github.com/frappe/erpnext/issues/51855),
2026‑01‑19). The issue body carries only links, so the stated *why* is [UNKNOWN].

[INFERENCE] and worth stating plainly for product purposes: **no tool will win this channel.**
The realistic goal is not interception but *capture of the outcome* — a ten-second way to turn
"yes do it, invoice us" into a dated record attached to the job. [CORPUS] reaches the same
conclusion and is unusually blunt about it: the client boundary is "not removed, and it is
dishonest to claim otherwise."

### E-mail

Where anything that might later be argued about is deliberately put, precisely because it
timestamps and threads. [INFERENCE] E-mail is not a legacy habit for this role; it is the
evidence layer. Sub-hire POs, supplier confirmations, venue permissions and change orders live
here by choice.

---

## Missing interfaces

Handovers that break, in the order the day hits them.

### Client → job record
Requirements and changes arrive as prose, PDFs and voice notes. There is no structured intake,
so the first act of every job is a human transcription. [CORPUS] states this boundary cannot be
closed by an internal tool and that the achievable win is fast capture with attribution.
`widespread` [CORPUS].

### Quote ↔ technical plan (**the load-bearing gap for this product**)
Priced packages on one side, devices and runs on the other, no link in either direction. A
change to either does not touch the other. [CORPUS] ranks it the most expensive break in the
chain and notes that **no vendor sells both ends of it** — which is simultaneously the market
opportunity and the reason there is so little public evidence about it. `widespread` [CORPUS],
unverified first-hand in this session.

### Technical plan ↔ warehouse reservation
The plan knows fourteen BNC runs of a given length and a specific converter; the reservation
knows "camera package". Cables, adapters, spares, distros and consumables are the classic
omission. [CORPUS] break 2.

### Booking system ↔ personal calendar
Where crew and clients actually look. Today: a static file that goes stale and must be
re-downloaded by hand ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390),
2026‑03‑03, [READ]). The proposed fix in that issue — a subscribable `webcal://` URL that
polling clients refresh — is deliberately chosen to avoid third-party API dependencies.
[INFERENCE] That is the right shape for an offline-first product too.

### Travel plan ↔ expense ↔ job cost
Three records, no chain. The travel request is "more like a data capture" with no accounting
consequence ([hrms #346](https://github.com/frappe/hrms/issues/346), open since 2023‑02‑26,
[READ]); the expense then has to be hand-typed per receipt
([hrms #4541](https://github.com/frappe/hrms/issues/4541), 2026‑05‑16, [READ]).

### Crew tool ↔ ERP ↔ payroll ↔ invoice
Who is confirmed, and the hours that must be billed. [CORPUS] notes this break is real enough
that a commercial product's headline proposition is one specific API that removes duplicate
maintenance, with twelve documented system interfaces — a vendor conceding the boundary exists
across the market. `recurring`.

### Sub-hire supplier ↔ job file
The shortage, the confirmation, the price, and the fact that this item is **not yours** — so it
must go back, on time, undamaged. [CORPUS] break 9. Corroborated negatively and strongly [READ]:
a full ERP's entire `subcontract` vocabulary is manufacturing, not hire. There is no object for
this.

### On-site reality ↔ every document
Nothing crosses back. [CORPUS] break 3, ranked third overall and paid for by the next project.
The [READ] evidence of the demand is the return-time prompt at
[#1957](https://github.com/Shelf-nu/shelf.nu/issues/1957) — the smallest possible version of an
as-built.

### Running order ↔ everyone who needs to read it
The show caller wants two remote sites to see the cuesheet live while remaining the only person
who can change it ([ontime #1547](https://github.com/cpvalente/ontime/issues/1547), 2025‑03‑18,
[READ]). [INFERENCE] Generalised: **read-many, write-one** is the access model this role needs
for nearly every document it owns, and PDF is the current, bad approximation of it.

### Inventory serials ↔ insurance and carnet
[UNKNOWN]. The artefacts logically require it; no readable source exists in this session. Flagged
for a later pass rather than asserted.

---

## What they would want

Their words, not mine. Everything in this section is a paraphrase or quotation from a request
someone actually filed; the [CORPUS] items are marked as second-hand.

**On budgets:**
- Cost estimates **on tasks**, a project estimate **derived** from them, and a report comparing
  actual against estimated — with the explicit distinction that "Project estimate is different
  from a budget. Project estimate is a derived quantity based on what the task estimate is"
  ([erpnext #34127](https://github.com/frappe/erpnext/issues/34127), 2023‑02‑19, [READ]).
- An **alert** when a budget is exceeded, and a way to filter for over-budget projects, rather
  than manually reviewing a page ([kimai #5421](https://github.com/kimai/kimai/issues/5421),
  2025‑03‑26, [READ]).
- To be **prevented** from booking more time against an exhausted budget in the first place
  ([kimai #5590](https://github.com/kimai/kimai/issues/5590), 2025‑07‑27, [READ]).

**On reporting:**
- Hours pivoted by client, project, activity or user, over week/month/year, with multi-select
  filters and "bar and pie graphs" — because the current view has "a row for each project AND
  activity" and no percentage breakdowns
  ([kimai #5593](https://github.com/kimai/kimai/issues/5593), 2025‑07‑29, [READ]).
- **An annotated example export to send to clients**, explaining what each field means, "so
  production does not get confused"
  ([ontime #1293](https://github.com/cpvalente/ontime/issues/1293), 2024‑10‑24, [READ]).

**On availability and gear:**
- Availability shown *where the decision is made*: `5 pcs · 0 available`, or a warning marker on
  over-committed items ([shelf.nu #2767](https://github.com/Shelf-nu/shelf.nu/issues/2767),
  2026‑07‑29, [READ]).
- A **pick-from-list alternative** whenever a scanner is not available, because every other
  action already has one ([shelf.nu #2831](https://github.com/Shelf-nu/shelf.nu/issues/2831),
  2026‑08‑10, [READ]).
- Kit conflicts **labelled on the kit**, not just announced as a blocked button
  ([shelf.nu #1817](https://github.com/Shelf-nu/shelf.nu/issues/1817), 2025‑06‑05, [READ]).

**On chasing and accountability:**
- A dashboard of **action items** — what is due, what is overdue, what is pending — instead of a
  daily manual check; automated reminders "the night before, morning of, and 2 hours before due
  date"; and an escalating strike system
  ([shelf.nu #1956](https://github.com/Shelf-nu/shelf.nu/issues/1956), 2025‑07‑29, [READ]).
- A return-time prompt — *"Did anything go wrong with this item?"* — with quick options (all
  good / missing part / damaged), a note and optional photos, so damaged gear can be quarantined
  before it circulates ([shelf.nu #1957](https://github.com/Shelf-nu/shelf.nu/issues/1957),
  2025‑07‑29, [READ]).
- **OCR receipt scanning** to auto-fill expense lines, because typing each one is "tedious,
  error-prone" and creates "significant friction"
  ([hrms #4541](https://github.com/frappe/hrms/issues/4541), 2026‑05‑16, [READ]).

**On documents and distribution:**
- A **printable PDF** of the booking, "for record keeping and for a physical reference on set"
  ([shelf.nu #942](https://github.com/Shelf-nu/shelf.nu/issues/942), 2024‑04‑30, [READ]).
- A **subscribable calendar** that updates itself instead of a static `.ics` that goes stale
  ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390), 2026‑03‑03, [READ]).
- **Read-only views for everyone else**, so multiple sites see the cuesheet live and only the
  show caller can change it ([ontime #1547](https://github.com/cpvalente/ontime/issues/1547),
  2025‑03‑18, [READ]).

**Two wishes from adjacent roles that generalise unusually well** — both stated as the founding
rationale of a tool someone built rather than as a feature request, which makes them worth more
than their star counts suggest:

- **Tell me the bad news on day one.** SceneSlot's README frames the problem as a stage manager
  spending "a weekend with a spreadsheet", and names the real failure: *"the worst failure is
  silent: you discover in week four that your two leads share no available night."* Its first
  feature is a feasibility report produced before anything else
  ([Android-Tipster/sceneslot README](https://github.com/Android-Tipster/sceneslot), [READ]).
  [INFERENCE] The production-manager translation is: **surface the impossible combination the
  day the constraints arrive, not the week of the show.**
- **A handover file for the next person.** StageCloset's README: *"a binder, a half-maintained
  spreadsheet, and one person who remembers where the Victorian gowns live. When that person
  graduates or moves on, the knowledge goes with them."* Its answer is a single export
  containing everything, photos included — described as "the answer to volunteer turnover"
  ([Android-Tipster/stagecloset README](https://github.com/Android-Tipster/stagecloset), [READ]).
  [INFERENCE] Every freelance production manager's handover is this problem, every time.

**What they conspicuously do *not* ask for.** [INFERENCE], from the absence of such requests
across every tracker read: nobody asks for a better quoting engine, a prettier Gantt chart, or
an AI that writes their e-mails. The requests are overwhelmingly about **being told something
they would otherwise have to go and check** — over budget, overdue, conflicting, damaged,
impossible. That is a notification-and-derivation product, not an authoring product.

---

## Implications for AV Planner Suite

Grounded in what the repositories actually contain, verified by direct source inspection this
session rather than from READMEs.

**What already exists and is directly relevant.** `cable-planner` carries a far more complete
logistics model than its name suggests: `InventoryItem`, `InventoryCase`, `CasePackedItem`,
`StorageNode` (`depot|room|shelf|bin|case|transportCase`), `InventoryUnit` with `UnitEvent`
history, `InventorySet`/`SetComponent`, `UnitCondition` (`ok|defect|inRepair|retired`),
`ServiceRecord`, `CableTestResult`, `ChangeLogEntry`, `PendingChange` and `ProjectRevision`
([`repos/INVENTORY.md`](../repos/INVENTORY.md), verified 2026‑08‑28). It has a Rentman API
client (`src/main/services/rentmanApiClient.ts`, 485 lines) that reads projects, project
equipment, equipment and folders and **writes** equipment groups, project equipment and project
files, including an `exportEquipmentToCablePlannerGroup` path — verified by direct inspection
this session. It has a NetBox client, a `print:*` IPC domain, and a `mobileShareServer` serving a
read/check-only LAN view to phones. The suite carries a `lexware-core` package for billing.

That is an unusually strong starting position for this role, and it changes what should be
built next.

### 1. The suite is already sitting on the most expensive break. Finish it, and make it bidirectional.

[CORPUS] ranks *commercial quote → technical equipment list* as the costliest break in the chain,
occurring on every project, with no vendor selling both ends. The Rentman client is one end of
exactly that bridge, already written.

The valuable increment is **not more export**. It is the **diff**. A production manager's
question is never "what does my plan contain?" — it is *"what does my plan contain that the
Rentman project does not, and vice versa, and which side changed last?"* That is the same
reconciliation posture [CORPUS] identifies as the realistic goal for device configuration
("show the operator the diff between the plan and the machine"), applied to the commercial
boundary instead of the technical one. `PendingChange` and `ProjectRevision` already exist in
the model to hang it on.

### 2. Derive the equipment list; never ask anyone to retype it.

The strongest single claim in this dossier is that the commercial list and the technical list are
two documents maintained by hand. A suite whose cable, camera and light plans all resolve against
one inventory model can make the equipment list a **derived view** — including the cables,
adapters and spares that are the classic omission at [CORPUS] break 2, because the plan knows the
runs exist. This is already the suite's architecture; what is missing is treating the derived
list as a *first-class, exportable, diffable artefact* rather than a report.

### 3. Build the "what does this change invalidate" view. It is the highest-leverage feature in this dossier.

The added-camera case study is the role's defining pain, and its failures are **omissions, not
errors** — the multiviewer window, the comms position, the truck plan, the check-in list. A
system that knows camera 5 is referenced by the cable plan, the MV layout, the comms plan and the
pick list can *list what a change invalidates* even when it cannot fix any of it.

This maps precisely onto the strongest stated wish found in the [READ] corpus — SceneSlot's
"tell me the bad news first" — and onto the general pattern that these users want to be *told*
something rather than to go and check. It requires no integration with anyone. It is buildable
against the existing model today.

### 4. Availability must never be rendered without its context.

Six independent defects across fifteen months in a product built for this, all reducible to one
sentence: a number that means "stock" was read as a number that means "available"
([#1761](https://github.com/Shelf-nu/shelf.nu/issues/1761), [#1817](https://github.com/Shelf-nu/shelf.nu/issues/1817),
[#2724](https://github.com/Shelf-nu/shelf.nu/issues/2724), [#2767](https://github.com/Shelf-nu/shelf.nu/issues/2767),
[#2821](https://github.com/Shelf-nu/shelf.nu/issues/2821), [#2875](https://github.com/Shelf-nu/shelf.nu/issues/2875),
all [READ]). The suite's inventory model has units, conditions and cases, so it *can* compute an
honest figure. The design rule this evidence supports: **every quantity shown anywhere carries
its availability qualifier in the same glyph run** (`5 pcs · 0 available`), and conflicts are
labelled on the object that has them, not announced as a disabled button.

### 5. Print is a feature, and the paper must be a rendering of the model — not a fork of it.

[CORPUS] argues paper survives because it needs no battery, works in a basement, and can be
signed. [READ] corroborates that users request PDFs specifically as "a physical reference on
set". The suite already has a `print:*` IPC domain and a phone-facing `mobileShareServer` in
read/check-only mode.

The gap is the **return path**. [CORPUS]'s recommendation — "print from the model, scan or
photograph back, and make the paper a rendering of the model rather than a fork of it" — is the
right target, and the cheapest first version of it is the one users already asked for elsewhere:
a return-time prompt with three options, a note and a photo
([shelf.nu #1957](https://github.com/Shelf-nu/shelf.nu/issues/1957)). Under ten seconds, or it
will not be used — [CORPUS] is explicit that in the last two hours before doors, nothing that
takes longer gets captured at all.

### 6. Read-many, write-one, subscribable — for every document the suite emits.

The show caller's requirement ([ontime #1547](https://github.com/cpvalente/ontime/issues/1547))
and the calendar complaint ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390))
are the same requirement seen twice: **everyone sees the current version; one person authors it;
nothing that leaves the system becomes a stale fork.** The mobile share server is already the
read-only half. The lesson from #2390 is to prefer a *subscribable* form (a URL that refreshes)
over a *downloadable* one (a file that rots) wherever an offline-first architecture allows it.

### 7. Do not build the ERP, the crew tool, or the accounting system. Do build the comparison.

[CORPUS] is right that crew, payroll, contracts and accounting are better bought than built, and
that a worse CrewBrain would *create* a media break rather than close one. The `lexware-core`
package is the correct posture: an interface, not a replacement.

But note precisely what the [READ] evidence says Excel is used for: **comparison**, not storage.
Estimate against actual ([erpnext #34127](https://github.com/frappe/erpnext/issues/34127)),
requirement against stock, this supplier against that one. ERPs store; spreadsheets compare.
[INFERENCE] The defensible product claim for this suite is therefore *not* "replace your ERP" —
it is **"be the place where the plan and the reality are compared"**, which is a job no product
in this landscape currently holds and which the suite's revision/change-log model is already
shaped for.

### 8. Honest non-goals, so the roadmap does not drift into them

- **The client boundary.** Clients will send PDFs and voice notes and change their minds by
  phone. Capture-with-attribution is achievable; interception is not. [CORPUS]
- **Sub-hire.** Runs on peer relationships and e-mail; every ERP has tried to formalise it and it
  remains e-mail [CORPUS], and a full ERP does not even have a word for it [READ]. The
  achievable win is marking *this item is not ours, it goes back on this date, to this supplier*
  inside the job file — a flag, not a portal.
- **Carnets and insurance.** [UNKNOWN]. Do not design against this dossier's guesses. Re-research
  first.
- **WhatsApp.** Not winnable. See above.

### 9. What to verify before any of this is funded

The two claims this dossier most depends on — that the quote↔plan re-typing is the biggest cost,
and that it is universal — rest entirely on [CORPUS], which never opened its own sources.
Priority verification list for the next pass with forum access:

1. r/VIDEOENGINEERING, ProSoundWeb and Blue Room threads on quoting and equipment-list rebuilds.
2. German sources (film-tv-video.de, production-partner.de, VPLT) on the *Projektleiter /
   Disponent* split and on CrewBrain↔easyjob in practice.
3. Anything at all on carnets and insurance schedules in AV touring.
4. Rentman / Current RMS / easyjob help centres and community forums for what their users say is
   missing between the quote and the warehouse.

---

## Sources

Grouped by how they were used. **[READ]** = opened and read in this session. Everything else is
either a corpus document or a pointer that could not be opened.

### GitHub issues and issue searches — read in this session

Asset booking, availability and field workflow — Shelf.nu:
- https://github.com/Shelf-nu/shelf.nu — README [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+booking [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+conflict [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+print [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+damage [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+export+csv+excel+report [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+reminder+notification+overdue [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+integration+api+sync [READ]
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+agreement+signature [READ] (no results)
- https://github.com/Shelf-nu/shelf.nu/issues?q=is%3Aissue+offline+mobile+scanner+signature [READ] (no results)
- https://github.com/Shelf-nu/shelf.nu/issues/942 — booking PDF "physical reference on set", 2024‑04‑30 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/1761 — double booking on extension, 2025‑05‑01 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/1817 — invisible kit conflicts, 2025‑06‑05 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/1956 — late returns, daily manual check, Excel+Power Automate, 2025‑07‑29 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/1957 — "Did anything go wrong with this item?", 2025‑07‑29 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/2390 — stale `.ics`, calendar subscriptions, 2026‑03‑03 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/2767 — total stock read as availability, 2026‑07‑29 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/2777 — neither export round-trips, 2026‑07‑31 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/2831 — scan-only fulfilment blocks checkout, 2026‑08‑10 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/2875 — index vs detail status disagreement, 2026‑08‑17 [READ]
- https://github.com/Shelf-nu/shelf.nu/issues/2724, /2821 — availability formulas, concurrent kit custody (via issue lists) [READ]

Running order, rundown and spreadsheet round-trip — ontime:
- https://github.com/cpvalente/ontime — README [READ]
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+excel [READ]
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+google+sheet [READ]
- https://github.com/cpvalente/ontime/issues?q=is%3Aissue+cuesheet+operator [READ]
- https://github.com/cpvalente/ontime/issues/927 — custom fields lost on import, 2024‑04‑29 [READ]
- https://github.com/cpvalente/ontime/issues/1054 — expected bidirectional live sync, 2024‑06‑06 [READ]
- https://github.com/cpvalente/ontime/issues/1293 — annotated example export for clients, 2024‑10‑24 [READ]
- https://github.com/cpvalente/ontime/issues/1547 — read-only cuesheet across two sites, 2025‑03‑18 [READ]
- https://github.com/cpvalente/ontime/issues/1663 — sync writes empty custom fields over manual entries, 2025‑06‑25 [READ]
- https://github.com/cpvalente/ontime/issues/786, /1310, /1327, /1890, /2125 — via issue lists [READ]

Budgets, estimates, timesheets, billing — ERPNext / Frappe:
- https://github.com/frappe/erpnext/issues/34127 — Excel estimate sheet and hand-built actual-vs-estimate comparison, 2023‑02‑19 [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+budget+project+actual+cost [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+project+profitability+cost [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+timesheet+billing [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+subcontract — all manufacturing, no sub-hire [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+carnet — **zero results** [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+quotation+revision+version [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+quotation+discount+bundle [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+subcontracting+supplier+rental — zero results [READ]
- https://github.com/frappe/erpnext/issues?q=is%3Aissue+WhatsApp [READ]
- https://github.com/frappe/erpnext/issues/51855 — WhatsApp integration, 2026‑01‑19 [READ]
- https://github.com/frappe/erpnext/issues/38601 — access test [READ]
- https://raw.githubusercontent.com/frappe/erpnext/develop/erpnext/projects/doctype/project/project.json [READ]

Travel, accommodation and expenses — Frappe HR:
- https://github.com/frappe/hrms/issues?q=is%3Aissue+expense+claim+travel [READ]
- https://github.com/frappe/hrms/issues/346 — Travel Request has no accounting consequence, 2023‑02‑26, open [READ]
- https://github.com/frappe/hrms/issues/4541 — every receipt hand-typed; OCR requested, 2026‑05‑16 [READ]

Time tracking, budget alerts and client reporting — Kimai:
- https://github.com/kimai/kimai/issues?q=is%3Aissue+budget [READ]
- https://github.com/kimai/kimai/issues/5421 — alert when budget exceeded, 2025‑03‑26 [READ]
- https://github.com/kimai/kimai/issues/5593 — pivot reporting by client/project, 2025‑07‑29 [READ]
- https://github.com/kimai/kimai/issues/5590 — block timers on exhausted budgets, 2025‑07‑27 (via list) [READ]
- https://raw.githubusercontent.com/kimai/kimai/main/README.md [READ]

Kits, checkout and rental modelling — Snipe-IT, InvenTree, Odoo, Dolibarr, OpenProject:
- https://github.com/snipe/snipe-it/issues?q=is%3Aissue+kit+checkout [READ]
- https://github.com/snipe/snipe-it/issues/18087 — checkout predefined kits to assets, 2025‑10‑23 [READ]
- https://github.com/inventree/InvenTree/issues?q=is%3Aissue+rental — one request, closed *not planned* 2025‑02‑14 [READ]
- https://github.com/odoo/odoo/issues?q=is%3Aissue+rental+availability [READ]
- https://github.com/odoo/odoo/issues/30855 — rental application RFC, 2019‑02‑06; specs behind an unreachable external link [READ]
- https://github.com/Dolibarr/dolibarr/issues?q=is%3Aissue+project+margin+budget [READ]
- https://github.com/opf/openproject/issues?q=is%3Aissue+budget — no results [READ]
- https://github.com/opf/openproject/issues?q=is%3Aissue+budget+actual+costs — no results [READ]
- https://github.com/TimefoldAI/timefold-solver/issues?q=is%3Aissue+shift+scheduling+employee [READ]

Practitioner-built tools whose READMEs state the problem first-hand:
- https://github.com/Android-Tipster/sceneslot — "a weekend with a spreadsheet"; silent infeasibility [READ]
- https://github.com/Android-Tipster/stagecloset — binder + half-maintained spreadsheet; handover file [READ]
- https://github.com/KanadeK/cueproof — proving backstage moves feasible before tech [READ]
- https://github.com/javitatay/Tarimeo — offline festival stage layout planning [READ]
- https://github.com/Synapsr/Louez — open-source equipment rental platform; README + issues [READ]
- https://github.com/johncoronado/show-pi — corporate live-event Pi toolkit [READ]

Repository discovery (GitHub topic pages, global search being blocked):
- https://github.com/topics/rental-management [READ]
- https://github.com/topics/equipment-rental [READ]
- https://github.com/topics/event-management [READ]
- https://github.com/topics/crew-scheduling [READ]
- https://github.com/topics/production-management [READ]
- https://github.com/topics/stage-management [READ]
- https://github.com/topics/live-events [READ]
- https://github.com/topics/film-production [READ]
- https://github.com/topics/broadcast [READ]
- https://github.com/topics/veranstaltungstechnik [READ]
- https://github.com/topics/audiovisual [READ]

Own repositories (context for the Implications section):
- https://github.com/larszu/av-planner-suite — issues (none open) [READ]
- https://github.com/larszu/cable-planner — issues (all technical/UI) [READ]
- Local source inspection: `cable-planner/src/main/ipc/` (14 domains incl. `rentmanIpc`, `netboxIpc`, `printIpc`, `mobileShareIpc`), `cable-planner/src/main/services/rentmanApiClient.ts` (485 lines), `av-planner-suite/packages/` (`inventory-core`, `lexware-core`, `onboarding-core`, `ui`)

### Corpus documents used as second-hand evidence

These were read in full, but *their* sources were never opened by the pass that produced them:
- [`docs/research/workflow-chain.md`](../workflow-chain.md) — station table, media-break ranking, added-camera case study
- [`docs/research/landscape/event-rental-management.md`](../landscape/event-rental-management.md)
- [`docs/research/landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md)
- [`docs/research/repos/INVENTORY.md`](../repos/INVENTORY.md)
- [`docs/research/METHOD.md`](../METHOD.md)

Pointer URLs inherited from `workflow-chain.md` that are relevant to this role but **were not
opened in this session and are not evidence** — listed so the next pass knows where to start:
rentman.io customer stories and product pages; flexrentalsolutions.com pick-list and warehouse
pages; point-of-rental.com case studies; crewbrain.com easyjob interface pages (incl. the July
2025 blog post); hirehop.biz; booqable.com/spreadsheets; capterra reviews for Current RMS and
Rentman; changeorder.avrentalmiami.com; trincoll.edu 48-hour late fee; adapttvhistory.org.uk OB
technical planning; callsheetx.com and studiobinder call-sheet material; xytechsystems and
farmerswife scheduling pages.

### Domains confirmed blocked in this session

Verified individually by `curl` and/or WebFetch, all refused: `reddit.com`, `old.reddit.com`,
`prosoundweb.com`, `controlbooth.com`, `blue-room.org.uk`, `forum.blackmagicdesign.com`,
`film-tv-video.de`, `production-partner.de`, `vplt.org`, `discuss.frappe.io`,
`en.wikipedia.org`, `de.wikipedia.org`, `stackoverflow.com`, `gist.githubusercontent.com`.
GitHub's global search API additionally returns "sessions are bound to their configured
repositories".
