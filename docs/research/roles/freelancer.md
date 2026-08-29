# AV Freelancers

Research dossier for AV Planner Suite. Compiled 2026-08-29.

> ## Method and evidence caveat — read this first
>
> **The brief asked for 8–15 web searches across Reddit, ProSoundWeb, Blue Room, Control Booth,
> film-tv-video.de, production-partner.de, VPLT, job boards and YouTube. None of that was
> reachable in this session.** Stating that plainly is more useful than papering over it.
>
> - `WebSearch` was already exhausted before this task began (200 of 200 calls used for the
>   session). Every attempt returned the budget message, not results.
> - The egress proxy returned `EGRESS_BLOCKED` / `403 CONNECT` for every non-GitHub host tried,
>   verified individually this session: `old.reddit.com`, `www.prosoundweb.com`, `duckduckgo.com`.
>   The proxy's own failure log additionally showed same-session denials for `wrike.com`,
>   `height.app`, `studiobinder.com`, `yamdu.com`, `setkeeper.com` and `farmerswife.com`.
>
> **What did work — two channels only:**
>
> 1. **The GitHub issue-search API** (via MCP), scoped per repository. Roughly **103 issue
>    records** were read this way — title, full body, creation date, state, labels, comment and
>    reaction counts — across `kimai/kimai`, `invoiceninja/invoiceninja`, `Shelf-nu/shelf.nu`,
>    `bitfocus/companion`, `frappe/hrms`, `frappe/erpnext`, `grokability/snipe-it`,
>    `inventree/InvenTree` and `larszu/cable-planner`. This is genuine primary source material:
>    practitioner text, written by the person with the problem, with a date attached. Note that
>    the *unscoped* semantic index is heavily restricted in this environment — broad queries with
>    no `owner`/`repo` returned zero or one result — so every finding below comes from a
>    repository I named in advance, which is itself a selection bias worth knowing about.
> 2. **The existing research corpus in this repository** — [`workflow-chain.md`](../workflow-chain.md),
>    [`METHOD.md`](../METHOD.md), [`repos/INVENTORY.md`](../repos/INVENTORY.md),
>    [`landscape/event-rental-management.md`](../landscape/event-rental-management.md),
>    [`landscape/broadcast-production-management.md`](../landscape/broadcast-production-management.md)
>    and the sibling role dossiers, chiefly [`production-manager.md`](production-manager.md) and
>    [`warehouse.md`](warehouse.md). These were compiled in earlier sessions when web access
>    worked, and they carry their URLs, so their claims are re-verifiable later — but they were
>    **not** re-opened today.
>
> **Consequences, stated plainly:**
>
> - **Zero forum posts, zero subreddit threads, zero trade-press articles, zero German-language
>   practitioner sources, zero job postings and zero YouTube comments were read this session.**
> - The strongest primary layer is **adjacent-domain**: open-source time-tracking, invoicing and
>   asset-booking tools rather than AV-specific ones. This transfers *well* for the freelancer's
>   back-office half — rates, hours, invoices, e-invoicing, receipts, bookings, custody — because
>   the verbs are identical and several reporters are identifiably from production (one
>   `shelf.nu` reporter writes from a film-company address; several `kimai` reporters describe
>   themselves as freelancers). It transfers *badly* for everything that is specific to standing
>   in a hall at 03:00: the pencil/hold/confirm booking convention, per-diem norms, what actually
>   arrives in the tech pack, and what freelancers refuse to install. Those areas are marked
>   honestly below and several are left as `unverified`.
>
> **Labels used throughout,** extending [`METHOD.md`](../METHOD.md):
>
> - **[READ]** — read directly this session: a GitHub issue body with its URL, date and state, or
>   a file in this repository.
> - **[CORPUS]** — carried from a sibling dossier in this corpus, with the URL that dossier cites.
>   **Not opened this session.** Re-verify when egress returns.
> - **[INFERENCE]** — my reasoning from the above, flagged as reasoning, not evidence.
> - **unverified** — could not be established. Left visible rather than quietly dropped.
>
> **Frequency grading is deliberately conservative.** `widespread` is used only where the same
> failure appears in more than one independent tracker *and* is corroborated by the corpus, or
> where a vendor has shipped a feature whose only purpose is to solve it. Several findings that
> are almost certainly widespread in the trade are graded `recurring` because a second
> independent source could not be reached today.

---

## Who they are / where they sit in the production

The AV freelancer is one person selling days. The specialisation varies — sound, camera, video
engineering, lighting, streaming, technical direction, comms — but the commercial shape is
constant: **several unrelated companies book the same calendar, and none of them can see it.**

Three sub-types, which behave very differently and should not be averaged:

1. **Labour-only day-rate crew.** Turns up, operates someone else's kit, goes home. Their
   commercial artefacts are a confirmation message, a signed timesheet and an invoice. They own
   the least and are onboarded into the most systems.
2. **Freelancer with own kit (small dry-hire).** Sells a day *and* a package — a camera, a comms
   system, a streaming rack. Now carries an inventory, an insurance schedule, a delivery note and
   a rental line on the invoice. [CORPUS] models this variant explicitly: *"Enquiry, quote, plan,
   pack, drive, rig, operate, invoice — all in one head."*
3. **Freelance systems/technical designer.** Sells drawings and configuration before ever
   arriving. Their output is exactly the artefact class this suite makes
   ([`workflow-chain.md`](../workflow-chain.md) stations 13–28).

### Where they sit in the chain

Against the thirty-station enquiry-to-invoice chain in [`workflow-chain.md`](../workflow-chain.md)
[CORPUS], the freelancer appears at **station 4 (crew)** and again across **stations 13–28
(technical design, rig, operate, strike)**, and *owns no record at either end*. The quote
(stations 1–2), the reservation (5), the pick (10–11) and the invoice (30) belong to somebody
else's ERP.

**The structural fact that explains most of this dossier: in every client system, the freelancer
is an object, not a subject.** That is not a metaphor — it is a design decision vendors write
down. Shelf.nu's own founding issue for its people model states the index of team members "will
be **account-less**", carrying just a name and an e-mail
([Shelf-nu/shelf.nu #219](https://github.com/Shelf-nu/shelf.nu/issues/219), 2023-07-13, closed,
**[READ]**). The crew-scheduling market is the same shape: CrewBrain, the Rentman crew module,
easyjob personnel, farmerswife and Xytech are all **bought by the company**, and CrewBrain's
headline integration story is company-ERP-to-company-crew-tool — projects and personnel
requirements flowing from easyjob into CrewBrain "explicitly so that data does not have to be
maintained twice", with twelve pre-built system interfaces ([CORPUS], citing
[crewbrain.com](https://www.crewbrain.com/de/features/schnittstellen/easyjob-protonic/) and a
July 2025 CrewBrain blog post).

Read that from the freelancer's chair and the conclusion is uncomfortable: **the industry has
solved company-to-company data flow and has not built a single edge that points at the
freelancer.** There is no product whose customer is the person being booked. Twelve interfaces
exist between the systems that book them; zero interfaces exist to the calendar that says whether
they are free. `widespread` [CORPUS] + [INFERENCE].

### Scale of the media break, for this role specifically

[CORPUS] models the freelancer variant as having *"perhaps three artefacts: a quote PDF, a gear
list, an invoice"*, and observes that the breaks are few but total:

> "There is no handover, so nothing is lost in translation — but there is also no redundancy: the
> plan exists only in the freelancer's memory, and the 'system of record' for what was actually
> used on site is the pile of cases in the van. … The freelancer's real media break is
> **memory → nothing**: no as-built, no reusable template for the next identical job, so job
> number two costs the same as job number one."
> — [`workflow-chain.md`](../workflow-chain.md) [CORPUS]

That single sentence is the highest-value claim in this dossier and the one the product should be
aimed at. Everything below is either a cost of it or a symptom of it.

---

## A day in the life

Chronological. Sources are marked per step; where a step rests on no source it says so, because a
plausible narrative is exactly the thing this corpus is supposed to avoid producing.

### T−6 weeks to T−3 days: the availability question, asked N times

The phone buzzes. A production coordinator at company A asks whether they are free on the 14th.
The answer comes out of one place — the phone calendar — and goes back through the channel it
arrived in, which is almost always **WhatsApp**. [CORPUS] grades messaging the *dominant* carrier
at the crew station, specifically for "availability, swaps and 'who's driving'", and notes the
mechanism that makes it expensive: *"A call-time change propagates as a **new message**, not a new
record."*

The freelancer's side of this has three states that no consumer calendar models — **pencil / hold
/ confirm** — and the transitions between them are verbal. **The pencil-to-confirm convention is
`unverified` in this session**: it is trade folklore I could not source today, and it is named
here as the first thing to verify when forum access returns, because a booking product that
models only "busy/free" would be wrong about the single most important object in this role's life.

What *is* evidenced is the shape of the failure. The nearest readable analogue is a booking system
that allowed an extension without a conflict check, described by the reporter with the exact
real-world ending:

> "This issue was discovered when User A had an item checked out, requested and received an
> extension, and then User B arrived to pick up the same item they had previously reserved for
> that time period."
> — [shelf.nu #1761](https://github.com/Shelf-nu/shelf.nu/issues/1761), 2025-05-01, closed, **[READ]**

Substitute "item" for "person" and that is the freelancer's double-booking, exactly: an
uncommunicated extension at one client silently invalidates a confirmed day at another, and
nobody finds out until somebody arrives.

### T−2 weeks: onboarding into a system they will use once

Company A is new. Before they can be paid there is a form: legal name, address, tax number, VAT
status, bank details, insurance certificate, qualification certificates, sometimes a supplier
portal registration. Then a second login for the crew tool, and possibly a third for the asset
system that will list them as a custodian.

**Direct evidence for this step is thin and I will not dress it up.** What can be shown is
structural: vendors *know* the outside person should not need an account (the account-less team
member above, [#219](https://github.com/Shelf-nu/shelf.nu/issues/219), **[READ]**), and workspace
rules differ per client in ways that bite outsiders — booking time restrictions were being applied
to roles they were never meant to apply to
([shelf.nu #2222](https://github.com/Shelf-nu/shelf.nu/issues/2222), 2025-12-01, closed,
**[READ]**). The *count* of logins a working freelancer carries is `unverified`.

### T−1 week: chasing the tech plan

This is the step the brief asked about specifically, and the honest answer is that the plan
usually does not exist yet in a form anybody can send.

[CORPUS] ranks *commercial quote ↔ technical plan* the most expensive break in the whole chain
and states that **no vendor sells both ends of it**; the technical half — cable schedules, rack
elevations, router configuration, multiviewer layout, comms plan — lives "in CAD, Visio, Excel and
device-proprietary config files that the ERP has never heard of". A freelancer asking for the plan
in advance is asking someone to export a document from a tool that has no export, or to send a
drawing that is not finished.

What arrives instead, in descending order of luck: a PDF attached to an e-mail; a photo of a
whiteboard; a WhatsApp voice note; nothing. The *demand* for the missing artefact is readable in
adjacent trackers — a printable booking overview was requested in these words:

> "Option to print out the generated list of assets as a PDF for record keeping and for **a
> physical reference on set**."
> — [shelf.nu #942](https://github.com/Shelf-nu/shelf.nu/issues/942), 2024-04-30, closed, **[READ]**

and the show-caller's version of the same wish is a **live read-only view** for everyone else, so
there is exactly one current version and one person who can change it
([ontime #1547](https://github.com/cpvalente/ontime/issues/1547), 2025-03-18, [CORPUS]).

### T−1 day: packing

Own kit comes out of the shelf against a list that lives in the freelancer's own spreadsheet or
head. Batteries charge overnight. If the job is a dry-hire, this is also when the delivery note
and the insurance value get thought about — or don't.

The readable evidence here is about what a check-out/check-in flow *should* ask and doesn't. A
recurring request across asset tools is a **per-category checklist at check-in** — "Does the
device turn on / Has the charger been returned / Does the charger work"
([snipe-it #10884](https://github.com/grokability/snipe-it/issues/10884), 2022-03-30, closed,
**[READ]**) — and **per-item scan verification** rather than an all-at-once action, requested by a
reporter writing from a film-production address:

> "On checkout and checkin allow to scan each item physically to double check all items were
> commisioned. … On long items lists it isn't just sufficient to checkout all items at once."
> — [shelf.nu #843](https://github.com/Shelf-nu/shelf.nu/issues/843), 2024-03-15, open, **[READ]**

### Load-in

Arrive, park (badly), find the production office, find out that the plan changed. [CORPUS] models
what a single late change does: roughly thirty artefacts, twelve of them re-typings, six already
printed — and names the six that actually get missed, each with its visible consequence
(multiviewer: "the director calls a shot nobody can find"; tally: "talent looks at the wrong
camera"; comms: "the fifth operator cannot hear the director — most visible failure, discovered at
the first rehearsal, **fixed by handing the op a radio and never written down**").

Network credentials, IP ranges and "what not to plug in" are handed over verbally or on a
whiteboard. [CORPUS] records the existence of a crew network-access sheet as *implied* by a
broadcaster's requirement that "all the hundreds of freelancers and staff members understand how
to access the network and prevent problems", while noting that **the form this document takes is
unverified** ([`network-engineer.md`](network-engineer.md), citing
[SVG, 2026-07-07](https://www.sportsvideo.org/2026/07/07/how-fox-built-a-world-class-network-infrastructure-for-the-fifa-world-cups-unique-demands/)).

If the freelancer brought their own control surface, this is when it either works or doesn't.
Bitfocus Companion is the archetype of the tool they carry between clients, and its tracker shows
what portability actually costs:

- a full-config import placed the middle row one position left and the bottom row two, "which
  makes some functions disappear", and the reporter adds: *"Unfortunately 1.4.0 is not available
  for download anymore. If I hadn't left old installer in my drive, I would be doomed now."*
  ([companion #1603](https://github.com/bitfocus/companion/issues/1603), 2021-05-21, closed,
  **[READ]**)
- *"Every month or so I lose the configuration and have to reimport it."*
  ([companion #2755](https://github.com/bitfocus/companion/issues/2755), 2024-02-18, closed,
  **[READ]**)
- an import that set up page 1 and **deleted all other pages**
  ([companion #3063](https://github.com/bitfocus/companion/issues/3063), 2024-10-02, closed,
  **[READ]**)

And the venue-to-venue problem in one sentence, from someone who wanted to stop editing connection
settings by hand at every new site: put **variables in the connection settings** so a camera's IP
can be changed by a button press instead of by editing each connection
([companion #1940](https://github.com/bitfocus/companion/issues/1940), 2022-02-24, closed,
**[READ]**).

### Rehearsal

Where the differences between the plan and the room are discovered. Nothing that is discovered
here gets written back into any document. [CORPUS] calls this **"on-site reality → nothing"** and
ranks it third among all chain breaks, paid for by the *next* project team — which, for a
freelancer who returns to the same annual conference, is themselves twelve months later.

### Show

No paperwork happens during a show. The only capture is photographic: people photograph the back
of the rack, the patch panel and the desk settings on their phone. **This is `unverified` as a
sourced claim** — it is a widely-held belief about the trade that I could not evidence today —
but the *demand* for it is visible in the request for a return-time prompt with "a note and
optional photos" ([shelf.nu #1957](https://github.com/Shelf-nu/shelf.nu/issues/1957), 2025-07-29,
[CORPUS]).

### Load-out

03:00. Paper. [CORPUS] lists the load-out list among the documents that stay on paper precisely
because paper "needs no battery, works in a basement with no connectivity, and both parties can
sign it". Own kit and house kit get separated by memory and by gaffer-tape labels. Damage
discovered here is discovered by whoever unpacks it a week later, at which point it is
unattributable — [CORPUS] cites the request to move damage reporting *into* the checkout window
because today issues are "only discovered after gear returns or when subsequent users identify
damage", and notes that short damage-reporting windows turn an undocumented load-out into an
absorbed loss.

Bookings do not end tidily either. When an overdue booking is checked in, the **actual end date is
never recorded** and the booking can vanish from the CSV export
([shelf.nu #1904](https://github.com/Shelf-nu/shelf.nu/issues/1904), 2025-06-30, closed,
**[READ]**); adjusting dates during check-in can produce a booking whose start is after its end,
and the reporter admits *"I am not even sure how to handle this case, in terms of UX"*
([shelf.nu #1839](https://github.com/Shelf-nu/shelf.nu/issues/1839), 2025-06-10, closed,
**[READ]**).

### Post: hours, receipts, invoice, and then waiting

Three separate pieces of admin, each in a different place.

**Hours.** Written on a paper timesheet on site, signed by someone, then typed into the client's
crew tool *and* into the freelancer's own records. The rate model is where this goes wrong — see
Time sink 4 below.

**Receipts and per diems.** Fuel, parking, food, hotel, the adapter bought at the last minute. The
manual process is described first-hand, and though the reporter is describing an employee expense
claim the mechanics are identical:

> "manually type each expense line item — selecting the **Expense Date**, **Expense Claim Type**,
> typing a **Description**, and entering the **Amount**" for every receipt, then attach receipt
> images separately as file attachments "which are not linked to specific line items". "This is
> tedious, error-prone, and creates significant friction — especially for employees who accumulate
> many small receipts (travel, meals, office supplies). **The problem compounds on mobile.**"
> — [frappe/hrms #4541](https://github.com/frappe/hrms/issues/4541), 2026-05-16, open, **[READ]**

The trip itself has no accounting consequence anywhere: an open request notes there is "no
streamlined way to handle approvals, expenses, and travel logistics", so "employees have to rely
on external tools or manual processes"
([hrms #2836](https://github.com/frappe/hrms/issues/2836), 2025-03-06, open, **[READ]**), and the
older complaint that a travel request "doesn't lead to any accounting transactions" has been open
since 2023 ([hrms #346](https://github.com/frappe/hrms/issues/346), [CORPUS]). Cross-border work
adds another: an expense in a currency other than the company's still displayed in the company
currency after the currency was changed ([hrms #889](https://github.com/frappe/hrms/issues/889),
2023-09-16, closed, **[READ]**).

**Invoice.** Then the part that has changed most recently and most sharply — see Time sink 5.

**Then waiting.** And chasing. See Time sink 6.

---

## Tools they actually use

Feelings are graded honestly: **[READ]** where a cited issue shows the sentiment, **[CORPUS]**
where the earlier corpus asserts it, **[INFERENCE]** where it is my reading of the artefacts.

| Tool | For what | How they feel about it |
|---|---|---|
| **Phone calendar** (Apple / Google / Outlook) | The *only* record of whether they are free. Every booking eventually lands here | Load-bearing and badly served. [CORPUS] calls the calendar "the universal endpoint" for this whole industry and names the current state of the art: users download a static `.ics` per booking, and when "assets are added/removed or dates shift, the calendar event goes stale. Users have to manually re-download" ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390), 2026-03-03, [CORPUS]) |
| **WhatsApp / Signal / SMS** | Booking requests, pencils, confirms, call-time changes, parking, "bring your own comms", photos of the rack, approval to work overtime | **The fastest channel that exists and the one with no memory.** [CORPUS] grades it dominant at four chain stations. Its status as a *business* channel — not a social one — is corroborated by a production-grade ERP carrying an open, assigned feature request for first-party WhatsApp integration ([erpnext #51855](https://github.com/frappe/erpnext/issues/51855), 2026-01-19, [CORPUS]) |
| **E-mail** | Contracts, POs, the tech pack PDF, the invoice, the reminder | The evidence layer, used deliberately because it timestamps and threads. [CORPUS] |
| **Excel / Numbers / Google Sheets** | Own gear inventory with serials and insurance values; the day-rate and travel calculator; the monthly hours-and-per-diem sheet; the German EÜR / tax sheet; "who owes me what" | Relied on, not resented. [CORPUS] argues the common property of every spreadsheet in this industry is that **it is a calculation or a comparison, not a record** — and that until a tool can compare, Excel is not going anywhere and should not be fought |
| **A notebook, or the phone's Notes app** | The patch, the Wi-Fi password, the IP range, the call times, the name of the person with the keys | [INFERENCE]. No source read this session. Listed because the artefacts logically require it and because [CORPUS] documents the same information existing nowhere else |
| **Invoicing / accounting** — Lexware Office, sevDesk, easybill, Invoice Ninja, or a Word template | Turning a job into money and satisfying the tax office | **Grudging, and recently forced.** The German B2B structured-e-invoice requirement from 2025-01-01 turned this from a preference into a compliance problem — see Time sink 5. That named trio (lexoffice, sevDesk, easybill) is not my list: it is what a time-tracking user named as the tools they needed to feed ([kimai #3884](https://github.com/kimai/kimai/issues/3884), 2023-02-28, closed **wontfix**, **[READ]**) |
| **Time tracking** — Kimai and similar | Hours per client, per project, feeding the invoice | Adequate at recording, wrong about money. Its own users say the product "feels like it is made for freelancers only" ([kimai #309](https://github.com/kimai/kimai/issues/309), 2018-09-13, open, **[READ]**) — and the rate model still does not fit AV work. See Time sink 4 |
| **The client's crew tool** — CrewBrain, Rentman crew, easyjob personnel, farmerswife, Xytech | Where their booking, their hours and their certificates live *for that one client* | An island they visit. [CORPUS] for the product set; [INFERENCE] for the feeling. Note that CrewBrain tracks **certificate expiry** including DGUV-relevant certs ([CORPUS]) — for the company, not for the freelancer who owns the certificate |
| **The client's asset system** — Shelf.nu, Snipe-IT, Cheqroom, or a rental ERP | Where they appear as a "custodian" of gear they signed for | They are a name and an e-mail in it, by design ([#219](https://github.com/Shelf-nu/shelf.nu/issues/219), **[READ]**). Custody without an account also breaks: a booking made with no custodian at all could not be checked in — "the only way I can end a checked-out item is to delete it" ([shelf.nu #1510](https://github.com/Shelf-nu/shelf.nu/issues/1510), 2024-12-11, closed, **[READ]**) |
| **Bitfocus Companion + their own Stream Deck** | The one piece of the show they bring, configure and understand | Loved, and fragile across versions and venues. Three independent config-portability failures 2021–2024 ([#1603](https://github.com/bitfocus/companion/issues/1603), [#2755](https://github.com/bitfocus/companion/issues/2755), [#3063](https://github.com/bitfocus/companion/issues/3063), **[READ]**) |
| **PDF viewer on a phone** | How the plan actually arrives, when it arrives | Tolerated. It is the current, bad approximation of a live document — [CORPUS] states the access model this whole industry needs is **read-many, write-one**, and "PDF is the current, bad approximation of it" |
| **A printer, or somebody else's printer** | Call sheet, timesheet, delivery note, load-out list | Not nostalgia — a requirement. [CORPUS]: paper "needs no battery, works in a basement with no connectivity, and both parties can sign it" |
| **The phone camera** | The real as-built: the back of the rack, the patch, the desk | [INFERENCE] / `unverified` as sourced practice. The demand shape is visible at [shelf.nu #1957](https://github.com/Shelf-nu/shelf.nu/issues/1957) ([CORPUS]) |

### What they will not install — and the honest state of that evidence

The brief asked specifically what tools freelancers refuse to install. **I could not source this
directly.** The communities where that opinion is expressed — r/VIDEOENGINEERING, ProSoundWeb,
Blue Room, Control Booth, the German Veranstaltungstechnik forums — were all unreachable. What
follows is therefore three *structural* arguments plus one direct read, and it is labelled as
such rather than dressed up as a finding.

1. **Anything that demands a per-client account.** Structural, and conceded by vendors: the
   account-less team member exists precisely so the outside person does not need a login
   ([#219](https://github.com/Shelf-nu/shelf.nu/issues/219), **[READ]**). `recurring` as a design
   pattern; the *refusal* itself is `unverified`.
2. **Anything cloud-only.** [CORPUS] singles out one product in the entire production-management
   segment as being runnable "on a laptop in a truck, with the venue network down" and calls that
   out as unusual. [INFERENCE] The freelancer's working environment is a basement with a guest
   SSID and a captive portal; a tool that needs the internet to show them their own call time is
   a tool they will not rely on twice.
3. **Anything that must be installed on the client's show machine minutes before a show.** The
   direct read is the Companion cluster above: config loss, config-shifting imports, and an older
   installer no longer available for download ([#1603](https://github.com/bitfocus/companion/issues/1603),
   **[READ]**). [INFERENCE] The lesson a freelancer takes from that is *bring your own hardware,
   change nothing on theirs.*
4. **The direct read:** users ask for the ability to turn a feature *off* and drive it only
   through the API, "for security or automation reasons"
   ([kimai #5817](https://github.com/kimai/kimai/issues/5817), 2026-02-10, open, **[READ]**).
   Thin, but it is evidence that "let me not use your UI" is a stated preference somewhere.

---

## Time sinks (ranked)

Ranked by *cost per occurrence × frequency*. The ranking is [INFERENCE]; each item's evidence
carries its own label and grade.

### 1. Answering the availability question, over and over, by hand

**Frequency: `widespread` [CORPUS] + [INFERENCE]; the mechanism `recurring` [READ].**

Every enquiry from every company is a separate message thread requiring a separate lookup in the
same calendar and a separate manual reply. Nothing accumulates. A hold placed by company A is
invisible to company B, so the freelancer is the only conflict-detection engine in the system, and
they run it from memory while driving.

Two evidenced legs:

- [CORPUS] grades messaging the **dominant** carrier at the crew station specifically for
  availability and swaps, and identifies why it never improves: a change "propagates as a *new
  message*, not a new record".
- The industry's own integration effort points the other way. CrewBrain's flagship interface
  synchronises **company ERP ↔ company crew tool**, with twelve pre-built system interfaces
  ([CORPUS]). [INFERENCE] Twelve interfaces between the systems that book the freelancer; zero
  that read the freelancer's own calendar.

The failure mode, read directly in an adjacent system: an extension approved without a conflict
check produced two valid claims on the same resource for the same period, discovered only when the
second party physically turned up ([shelf.nu #1761](https://github.com/Shelf-nu/shelf.nu/issues/1761),
2025-05-01, **[READ]**).

**Cost:** [UNKNOWN] in hours; [INFERENCE] minutes per enquiry, many enquiries per week, forever.
The occasional cost is a whole lost day plus a damaged relationship.

### 2. Getting the technical plan before arriving on site

**Frequency: `widespread` [CORPUS]; `recurring` [READ] by analogy.**

[CORPUS] ranks *quote ↔ technical plan* the costliest break in the chain, occurring on every
project, and states that **no vendor sells both ends of it** — which is why the freelancer's
request for "the plan" so often cannot be satisfied even by a well-run client. The technical half
of the job lives in CAD, Visio, Excel and device config files that no ERP knows about.

The consequence for the freelancer is specific and different from the production manager's: they
cannot prepare. They cannot pre-build a Companion page, pre-label a loom, pre-load a desk file or
decide what to bring, so preparation that could have happened in a warm room on Tuesday happens on
a flightcase on Thursday.

Corroborating [READ] on the *shape* of what is wanted: a printable overview "for record keeping and
for a physical reference on set" ([shelf.nu #942](https://github.com/Shelf-nu/shelf.nu/issues/942),
2024-04-30, **[READ]**); and a live read-only view so remote participants see the current document
while exactly one person can change it ([ontime #1547](https://github.com/cpvalente/ontime/issues/1547),
[CORPUS]).

**Cost:** [CORPUS]-modelled at "an hour of standing crew" up to a visible on-air error, per missed
change.

### 3. Being onboarded into a different system for every client

**Frequency: `recurring` [INFERENCE]; direct evidence `isolated` [READ].**

Master data, tax and bank details, insurance and qualification certificates, then one login per
client system. None of it is reusable, all of it expires, and all of it must be re-supplied when
the certificate renews.

This is the weakest-evidenced item in the dossier and it is graded accordingly. What is readable:
vendors deliberately model the outside person as account-less
([#219](https://github.com/Shelf-nu/shelf.nu/issues/219), **[READ]**); per-workspace rules apply
inconsistently across roles ([#2222](https://github.com/Shelf-nu/shelf.nu/issues/2222), **[READ]**);
and certificate-expiry tracking is a feature that exists — in the *company's* tool, CrewBrain,
covering DGUV-relevant certs ([CORPUS]). **The freelancer-side experience of this is `unverified`.**

### 4. Making the hours come out right — the rate matrix nobody models

**Frequency: `recurring`→`widespread` within the [READ] product: six issues, six distinct
reporters, 2018–2026.**

This is the best-evidenced finding in the dossier and it is not what I expected to find. AV labour
is not one number times hours. It is a matrix: base rate, overtime tier, night surcharge, weekend,
travel time, a flat call-out, and a different base per client. Time-tracking software models one
number.

| Issue | Date | State | What it says |
|---|---|---|---|
| [kimai #5913](https://github.com/kimai/kimai/issues/5913) | 2026-04-20 | closed | "my standard rate is 50 EUR/hour, while overtime is billed at 55 EUR/hour". 10 h standard + 2 h overtime should be 610; the product computes 12 × 50 = 600. Asks for "separate hourly rates per activity (e.g., standard, overtime, weekend work)" |
| [kimai #3403](https://github.com/kimai/kimai/issues/3403) | 2022-07-07 | **open** | Time-of-day surcharges: 09:00–17:00 at 100 %, 17:00–20:00 +10 %, later +25 % |
| [kimai #5223](https://github.com/kimai/kimai/issues/5223) | 2024-12-13 | closed | A flat amount *on top of* the hourly rate for attending in person: "60 € for 2 hours of work are for remote work and if i go to the client i would like to add 20€ because the 'call'" |
| [kimai #1417](https://github.com/kimai/kimai/issues/1417) | 2020-01-28 | closed | One person, different rates on different projects. The workaround is to "enter the user with 2 different names", and then "a user email address can only be entered once in the system" |
| [kimai #3124](https://github.com/kimai/kimai/issues/3124) | 2022-02-03 | closed | Re-assigning a timesheet to a different customer does **not** update the rate. "This caused some huge confusion … because export and invoces showed different times" |
| [kimai #4435](https://github.com/kimai/kimai/issues/4435) | 2023-11-14 | closed (dup) | "I as a freelancer … bargin with a customer to do something and get a fix price for that no matter how long I need". Fixed price is only available per entry, not per project |

Two more that make the same point about the *shape* of a freelance business rather than the rate:
a request to track time against a **customer with no project** because "I have several clients …
without the need to create a project"
([kimai #3483](https://github.com/kimai/kimai/issues/3483), 2022-08-23, closed **wontfix**,
**[READ]**; repeated at [#4643](https://github.com/kimai/kimai/issues/4643), 2024-02-15, closed,
whose reporter admits the workaround is a "fake" project); and an agency-side request to group a
timesheet by project because one client covers several
([kimai #3460](https://github.com/kimai/kimai/issues/3460), 2022-08-04, closed, **[READ]**).

**Cost:** direct money. Under-billed overtime is invisible until never.

### 5. Making the invoice pass the client's validator

**Frequency: `widespread` in the German market [READ] + [CORPUS]. This is the newest and sharpest
change in the freelancer's admin life and it is well evidenced.**

The regulatory fact, from [CORPUS] (`landscape/event-rental-management.md`): **since 2025-01-01 all
German B2B companies must be able to receive and process structured e-invoices GoBD-compliantly**;
XRechnung and ZUGFeRD are the German de-facto standards; competing event software already emits
both (Eventworx is named).

The practitioner side, read directly this session, is a four-year arc in one tracker:

- **2024-01-17** — a German user explains the coming law and its consequence: xRechnung and ZUGFeRD
  (from 2.0.1) are confirmed conformant, and "If Invocie-Ninja is then unable to meet these
  requirements, the application will become useless for all users operating in the B2B sector"
  ([#9160](https://github.com/invoiceninja/invoiceninja/issues/9160), closed, **[READ]**).
- **2024-04-24** — missing IBAN/BIC fields: "This is urgent for anyone who is sending invoices to
  public customers" ([#9481](https://github.com/invoiceninja/invoiceninja/issues/9481), closed,
  **[READ]**).
- **2024-06-15** — "If Invoiceninja does not support ZUGFeRD from 01.01.2025, it can virtually no
  longer be used for B2B in Germany or it will then violate the law"
  ([#9639](https://github.com/invoiceninja/invoiceninja/issues/9639), closed, **[READ]**).
- **2024-11-11** — the generated XRechnung fails validation because the unit price is written as
  the line total. **The reporter's worked example is a freelance invoice**: 2 hours at an hourly
  rate of 100, line total 200 — and the XML claims an hourly rate of 200
  ([#10241](https://github.com/invoiceninja/invoiceninja/issues/10241), closed, **[READ]**).
- **2025-02-14** — the payment due date exists only as prose in the XML, so "the customer cannot
  read the data automatically"
  ([#10673](https://github.com/invoiceninja/invoiceninja/issues/10673), closed, **[READ]**).
- **2026-04-08** — an element-ordering violation in the CII output. The reporter's impact
  statement: "Every XRechnung CII document generated by Invoice Ninja is **non-conformant** and
  will be **rejected** by any validator or receiving system that performs strict schema validation
  (e.g., Peppol access points, German public procurement portals using ZRE/OZG-RE)"
  ([#11869](https://github.com/invoiceninja/invoiceninja/issues/11869), closed, **[READ]**).

And the mirror-image problem, because the freelancer *receives* e-invoices too: a request to accept
a merged ZUGFeRD PDF+XML as the basis for an expense record, since only separate XML attachments
were handled ([#11151](https://github.com/invoiceninja/invoiceninja/issues/11151), 2025-07-29,
**open**, **[READ]**).

**Cost:** the invoice is silently rejected by the client's AP system; the freelancer finds out when
the money does not arrive; the payment term restarts. [INFERENCE], but it follows directly from
"rejected by any receiving system".

### 6. Chasing payment

**Frequency: `recurring` [READ] — four issues, four reporters, 2020–2025, one still open.**

- Statutory reminder chains are not modelled. A Norwegian reporter explains that each of the first
  two reminders must extend the due date by 14 days with an updated invoice re-issued, and that
  "if not done correctly the 'debt' can in a worst case scenario be deemed void by the court"
  ([#4020](https://github.com/invoiceninja/invoiceninja/issues/4020), 2020-08-27, **still open**,
  **[READ]**).
- Late fees configured on a reminder are not applied to the invoice, the PDF or the e-mail balance
  — and because the invoice locks after sending, a manual late-fee line cannot be added either
  ([#11380](https://github.com/invoiceninja/invoiceninja/issues/11380), 2025-10-29, closed,
  **[READ]**). Manually issuing the reminder does not apply the fee either
  ([#10263](https://github.com/invoiceninja/invoiceninja/issues/10263), 2024-11-15, closed,
  **[READ]**).
- Automated follow-ups for unpaid invoices had to be *asked for*
  ([#10740](https://github.com/invoiceninja/invoiceninja/issues/10740), 2025-03-06, closed,
  **[READ]**).

**Cost:** cash-flow, which for a one-person business is existential rather than annoying.

### 7. Doing the month-end twice: once per client, once in total

**Frequency: `recurring` [READ].**

The freelancer bills several clients on the same cycle and the tooling makes them do it one at a
time:

> "Billing the same customers every month with the timesheets from the employees is a bit tedious.
> … Invoices based on timesheets should be processable in bulk over multiple customers, without
> entering each customer or project individually."
> — [kimai #5512](https://github.com/kimai/kimai/issues/5512), 2025-06-01, **open**, **[READ]**

And getting the evidence out of the time tracker and into the accounting tool is a manual export
per client per month; the API request to automate it — "one timesheet per customer in a defined
period of time, saving it as a pdf in a specific folder and marking it as exported", explicitly to
attach to invoices in **lexoffice, sevDesk or easybill** — was closed **wontfix**
([kimai #3884](https://github.com/kimai/kimai/issues/3884), 2023-02-28, **[READ]**). A related
request for a single monthly PDF split per person has been open since 2021
([kimai #2559](https://github.com/kimai/kimai/issues/2559), **[READ]**), and grouping the export by
project rather than only by date has been open since 2025
([kimai #5678](https://github.com/kimai/kimai/issues/5678), 2025-11-04, **[READ]**).

### 8. Typing receipts

**Frequency: `recurring` [READ].**

Every receipt hand-typed, images attached separately and unlinked, "tedious, error-prone",
"compounds on mobile" ([hrms #4541](https://github.com/frappe/hrms/issues/4541), 2026-05-16, open,
**[READ]**). The mobile route is also where duplicates come from: expense claims created twice from
the HR mobile app ([hrms #2423](https://github.com/frappe/hrms/issues/2423), 2024-11-17, open,
**[READ]**).

### 9. Tracking their own kit across other people's jobs

**Frequency: `recurring` [READ] + [CORPUS].**

The booking systems the freelancer's gear passes through are modelled for a warehouse, not for a
van. The gap is visible in what production users ask for:

> "Ability to create a booking **starting in past**, for items picked up in hurry." … "Ability to
> **edit bookings end date while it's going on** (need to pull stuff for another place early, or to
> extend the booking)." … Rename `check out`/`check in` to `Load out`/`Load in`, and add states
> `Draft → Reserved → Packed → Ongoing → Loaded in → Shelved`.
> — [shelf.nu #907](https://github.com/Shelf-nu/shelf.nu/issues/907), 2024-04-13, **open**, **[READ]**

Recurring jobs must be re-entered by hand — "We have been doing manually this for a while"
([shelf.nu #1916](https://github.com/Shelf-nu/shelf.nu/issues/1916), 2025-07-08, closed,
**[READ]**) — and who took which accessory, needed for cost allocation, is not reportable
([snipe-it #6222](https://github.com/grokability/snipe-it/issues/6222), 2018-09-21, closed,
**[READ]**).

### 10. Rebuilding the same show from memory

**Frequency: `widespread` [CORPUS].**

No as-built, no template, no handover file. [CORPUS], stated as the freelancer variant's defining
break: *"job number two costs the same as job number one."* The generalised version, quoted in
[`production-manager.md`](production-manager.md) from a tool built specifically to solve it: *"a
binder, a half-maintained spreadsheet, and one person who remembers where the Victorian gowns
live. When that person graduates or moves on, the knowledge goes with them."*

For a freelancer the person who moves on is them, every single job.

---

## Double data entry

The organising question: **how many times does one fact get typed?** Each row names the fact and
the systems it crosses. Labels mark which hops are evidenced and which are [INFERENCE].

| The fact | Typed into (in order) | Evidence |
|---|---|---|
| **Their availability for one date** | Own calendar (read) → WhatsApp reply (typed) → client's crew tool (typed by the client's coordinator) → client's shared calendar → the call sheet → their own invoice line | [CORPUS] crew station + WhatsApp dominance; [INFERENCE] on hop count. **The freelancer's own calendar is the only copy nobody else can read** |
| **Their own master data** — legal name, address, tax/VAT number, bank details, insurance, qualifications | One onboarding form per client, forever, plus every renewal | [INFERENCE]; direct evidence `unverified`. Structural support: the account-less team-member model ([#219](https://github.com/Shelf-nu/shelf.nu/issues/219), **[READ]**) and company-side certificate-expiry tracking ([CORPUS]) |
| **Hours worked on one day** | Paper timesheet on site (signed) → client's crew tool → own time tracker → own invoice → own tax records | [CORPUS] crew + invoice stations; the rate-mismatch failures at [kimai #3124](https://github.com/kimai/kimai/issues/3124) and [#5913](https://github.com/kimai/kimai/issues/5913) are **[READ]** |
| **A receipt** | Paper receipt → photo → expense line typed by hand → invoice or tax record; the image attached separately and **not linked to the line** | **[READ]** — [hrms #4541](https://github.com/frappe/hrms/issues/4541) |
| **A trip** | Travel arrangement → expense claim → job cost | **[READ]** — [hrms #2836](https://github.com/frappe/hrms/issues/2836) ("rely on external tools or manual processes"); [CORPUS] — [hrms #346](https://github.com/frappe/hrms/issues/346) (travel request has no accounting consequence) |
| **One invoice** | Time tracker → PDF export → accounting tool (lexoffice / sevDesk / easybill) → structured XRechnung/ZUGFeRD → the client's AP validator | **[READ]** — [kimai #3884](https://github.com/kimai/kimai/issues/3884) names the exact hop and was closed wontfix; the invoiceninja cluster shows what happens at the last step |
| **Their own gear list** | Personal spreadsheet → the client's booking/asset system → a delivery note → an insurance schedule → an invoice line | [CORPUS] for the artefact set; **[READ]** for the booking-model mismatch ([shelf.nu #907](https://github.com/Shelf-nu/shelf.nu/issues/907)) |
| **A device or source name** | The plan → their notebook → the desk / Companion / router → the label printer → the patch sheet | [CORPUS] break 5 — "five to seven typings of the same string, no link between them" |
| **A recurring job** | Last year's booking → re-entered by hand this year | **[READ]** — [shelf.nu #1916](https://github.com/Shelf-nu/shelf.nu/issues/1916) |

**The pattern, and it is different from the production manager's.** [CORPUS] diagnoses double
entry in the PM role as caused by *two unit systems for the same object* (packages vs devices vs
cases vs invoice lines). For the freelancer the cause is different and simpler: **the same fact is
re-entered because the freelancer has no system of their own for it to live in.** They are not
translating between two of their systems; they are supplying the same fact repeatedly to N systems
belonging to other people, none of which will ever give it back.

That distinction matters for product design. A translation problem is solved by an integration. A
*no-system-of-record* problem is solved by giving the person a record.

---

## Error sources

Ordered by consequence, not frequency. Each carries what it costs.

### 1. Double-booking themselves

**What goes wrong.** A pencil at company A hardens into a confirm without a message; a job at
company B overruns by a day; a call time moves and the message is read but not acted on. Two
clients believe they have the same person.

**Evidence.** The convention that produces it (pencil/hold/confirm) is `unverified` this session.
The *mechanism* is read directly in an adjacent system: an extension granted without a conflict
check, discovered when the second claimant arrived in person
([shelf.nu #1761](https://github.com/Shelf-nu/shelf.nu/issues/1761), 2025-05-01, **[READ]**).
[CORPUS] supplies the reason it stays unfixed: the change arrives as a message, not a record.

**What it costs.** A lost day's fee, a client relationship, and — because this trade is small and
runs on reputation — future work. [INFERENCE], and the most expensive single error in the role.

### 2. An invoice that is silently non-conformant

**What goes wrong.** The invoice validates in the freelancer's tool and is rejected by the client's.
Read directly: wrong element order → "rejected by all conformant validators", with the reporter
noting **every** document produced in that format was affected
([#11869](https://github.com/invoiceninja/invoiceninja/issues/11869), 2026-04-08, **[READ]**); unit
price written as line total, caught by a public validator
([#10241](https://github.com/invoiceninja/invoiceninja/issues/10241), 2024-11-11, **[READ]**); due
date present as prose but not as data
([#10673](https://github.com/invoiceninja/invoiceninja/issues/10673), 2025-02-14, **[READ]**).

**What it costs.** The payment clock restarts. [INFERENCE], following directly from the cited
impact statement. `widespread` in the German B2B market since 2025-01-01 [CORPUS] + [READ].

### 3. The wrong rate on the right hours

**What goes wrong.** Overtime billed at the base rate ([kimai #5913](https://github.com/kimai/kimai/issues/5913),
**[READ]**); night and weekend surcharges not representable at all
([#3403](https://github.com/kimai/kimai/issues/3403), open since 2022, **[READ]**); the rate not
following the job when the customer is corrected, so that "export and invoces showed different
times" ([#3124](https://github.com/kimai/kimai/issues/3124), **[READ]**).

**What it costs.** Direct, unrecoverable revenue, and — in the #3124 case — a client-facing
discrepancy between two documents produced by the same system. `recurring`→`widespread` within that
tracker: six reporters, 2018–2026.

### 4. Billing state that drifts after the fact

**What goes wrong.** Two related defects, both **[READ]**: a normal user exporting their own
timesheet silently marks it *exported*, after which they can no longer edit it and — worse — the
entries "can easily be overlooked when invoicing … because by default only non-exported timesheets
will be used in an invoice" ([kimai #4339](https://github.com/kimai/kimai/issues/4339),
2023-10-06, closed). And already-exported times could still be re-assigned to a different project
from the weekly view, so "the exported times will be associated to a different Project/Activity"
after the invoice existed ([kimai #5525](https://github.com/kimai/kimai/issues/5525), 2025-06-04,
closed). Cancelling an invoice does not reopen its entries, so they must be reset by hand
([kimai #3526](https://github.com/kimai/kimai/issues/3526), 2022-09-08, closed **wontfix**).

**What it costs.** Hours that are never billed, or billed against the wrong client. `recurring`.

### 5. Arriving prepared for the previous version of the plan

**What goes wrong.** [CORPUS]: one late change, ~30 artefacts, 12 re-typings, 6 already printed;
the omissions are the multiviewer, tally, comms, the cable schedule, the truck plan and the
check-in list. For the freelancer specifically the loss is the *preparation* — the pre-built
Companion page, the pre-labelled loom, the pre-loaded desk file.

**What it costs.** [CORPUS]: an hour of standing crew up to a visible on-air error. `widespread`
[CORPUS]. [INFERENCE] The mechanism is omission, not mistake, which is why more diligence does not
fix it.

### 6. Their own kit comes back wrong, or does not come back

**What goes wrong.** No condition record at hand-over, no per-item verification at load-out (the
all-at-once check-out complained of at [shelf.nu #843](https://github.com/Shelf-nu/shelf.nu/issues/843),
**[READ]**), no check-in checklist ([snipe-it #10884](https://github.com/grokability/snipe-it/issues/10884),
**[READ]**), and damage "only discovered after gear returns" ([CORPUS], shelf.nu #1957). Overdue
returns lose their actual end date entirely and can drop out of the export
([shelf.nu #1904](https://github.com/Shelf-nu/shelf.nu/issues/1904), **[READ]**).

**What it costs.** Unattributable, therefore unbillable, therefore absorbed by the person who owns
the item — which, here, is the freelancer personally. `recurring`.

### 7. Their portable toolkit breaks on someone else's machine

**What goes wrong.** Config imports that shift rows, delete pages, or need a version of the
software that is no longer downloadable
([#1603](https://github.com/bitfocus/companion/issues/1603),
[#2755](https://github.com/bitfocus/companion/issues/2755),
[#3063](https://github.com/bitfocus/companion/issues/3063), all **[READ]**).

**What it costs.** The rebuild happens during the load-in, in front of the client. `recurring`
within that tracker, 2021–2024.

### 8. Nothing is written down, so the next identical job costs the same

**What goes wrong.** [CORPUS] "on-site reality → nothing", ranked third among all chain breaks.
**What it costs.** Every repeat booking is priced and prepared as if it were new. `widespread`
[CORPUS].

---

## Paper / Excel / WhatsApp inventory

Specific artefacts. Items resting only on [CORPUS] or [INFERENCE] are marked and should be treated
as a checklist to verify, not as findings.

### Paper — printed, carried, marked up, signed

| Document | Why it stays paper | Evidence |
|---|---|---|
| **The call sheet / crew list** | Printed before the last change arrives; carried in a pocket | [CORPUS] names stale call times as the recurring failure |
| **The timesheet / Stundenzettel** | Because it needs a **signature from the client on the day** — that signature is the freelancer's only proof when the hours are queried six weeks later | [INFERENCE]; the underlying need (hours that survive dispute) is evidenced by the billing-state defects at [kimai #4339](https://github.com/kimai/kimai/issues/4339) / [#5525](https://github.com/kimai/kimai/issues/5525) **[READ]** |
| **The delivery note for dry-hired kit** | Both parties sign it; it is the evidence | [CORPUS] |
| **The load-out list** | 03:00, in the rain, no battery, no signal | [CORPUS] |
| **The booking / asset list PDF** | Asked for verbatim as "a physical reference on set" | **[READ]** — [shelf.nu #942](https://github.com/Shelf-nu/shelf.nu/issues/942) |
| **The scribbled patch list** | Written while both hands are busy; thrown away at strike | [INFERENCE]; [CORPUS] documents the marked-up floor plan meeting the same end ("it goes in the skip") |
| **Receipts** — fuel, parking, food, hotel, the emergency adapter | They arrive as paper and are dealt with weeks later | **[READ]** — the manual-typing complaint at [hrms #4541](https://github.com/frappe/hrms/issues/4541) is precisely the downstream cost |
| **The notebook with the Wi-Fi password, the IP range and the name of the person with the keys** | Nothing else on site is allowed to hold it | [INFERENCE] / `unverified`. [CORPUS] records that a crew network-access sheet is *implied* by broadcaster requirements but that its form is unverified |

### Excel — the freelancer's actual back office

| Spreadsheet | What it holds | Evidence |
|---|---|---|
| **The gear list** | Own inventory: item, serial, purchase date, purchase price, insurance value, current location | [CORPUS] — the freelancer variant's three artefacts are "a quote PDF, a **gear list**, an invoice". [CORPUS] also records that rental vendors market directly against spreadsheets as the incumbent inventory system for small operators |
| **The rate calculator** | Day rate, half day, overtime tier, night surcharge, travel time, kilometre rate, kit hire | **[READ]** by negative evidence — this sheet exists *because* the software cannot express it: [kimai #5913](https://github.com/kimai/kimai/issues/5913), [#3403](https://github.com/kimai/kimai/issues/3403), [#5223](https://github.com/kimai/kimai/issues/5223), [#1417](https://github.com/kimai/kimai/issues/1417) |
| **The monthly hours-and-per-diem sheet** | One row per working day per client, with the per-diem tier and the travel | [INFERENCE] + [CORPUS] |
| **The "who owes me what" sheet** | Invoice number, date sent, due date, reminder sent, paid | **[READ]** by negative evidence — automated unpaid-invoice follow-ups had to be requested ([#10740](https://github.com/invoiceninja/invoiceninja/issues/10740)) and statutory reminder chains are unmodelled ([#4020](https://github.com/invoiceninja/invoiceninja/issues/4020), open since 2020) |
| **The tax sheet** (in Germany, the EÜR) | Income and expenses for the year | [INFERENCE]; `unverified` |

[CORPUS] makes the general observation that applies to all of these: the common property of every
spreadsheet in this industry is that **it is a calculation or a comparison, not a record** — and
therefore that Excel should not be fought, only fed.

### WhatsApp — the fastest channel, and the one with no memory

Carried on it, per [CORPUS]'s grading of messaging as *dominant* at the crew, load-in, transport
and load-out stations, plus [INFERENCE] for the freelancer-specific items:

- The booking request, the pencil, and the confirm
- The call time, and every change to it
- The address, the parking, the loading-dock code, "ask for Marco"
- "Can you bring your own comms / your own laptop / a spare SDI"
- Photos of the rack, the patch panel and the desk
- The change at 16:00 that never reaches the printed plan
- **Approval to work overtime — which is the approval that later becomes an invoice line and an
  argument.** [CORPUS] flags exactly this: "this is the expensive part — **approvals** arrive
  here."

[CORPUS] is blunt about what to do with this and I see no reason to soften it: **no tool will win
this channel.** The realistic goal is not interception but *capture of the outcome* — a
ten-second way to turn "yes, do it, invoice us" into a dated record attached to a job.

### E-mail

The contract or PO, the tech pack PDF, the invoice, the reminder, the dispute. Used deliberately
because it timestamps and threads. [CORPUS] calls e-mail "not a legacy habit … the evidence layer".

---

## Missing interfaces

Handovers that break, in the order the year hits them.

### Freelancer's calendar ↔ every client's crew system
The load-bearing gap for this role. No cross-company availability exists anywhere. The
industry's integration effort runs company-to-company (CrewBrain ↔ easyjob and eleven others,
[CORPUS]); nothing points at the person. The one integration point that *would* work is the
calendar, and its current state of the art is a static `.ics` per booking that goes stale on every
change and must be manually re-downloaded ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390),
2026-03-03, [CORPUS]) — with the proposed fix being a subscribable `webcal://` URL, chosen
deliberately to avoid third-party API dependencies. `widespread`.

### Client's technical plan ↔ the freelancer's phone
Nothing. At best a PDF by e-mail, which forks the moment it is sent. [CORPUS] ranks the upstream
break (quote ↔ technical plan) as the costliest in the chain and notes no vendor sells both ends.
`widespread` [CORPUS].

### Signed timesheet ↔ crew tool ↔ own invoice ↔ accounting ↔ tax
Four re-typings of one number. The one automation that would collapse the middle two — a timesheet
PDF per customer per period, dropped into the accounting tool — was requested by name (lexoffice,
sevDesk, easybill) and **closed wontfix**
([kimai #3884](https://github.com/kimai/kimai/issues/3884), **[READ]**). `recurring`.

### Travel ↔ expense ↔ the job it belongs to
Three records, no chain. "No streamlined way to handle approvals, expenses, and travel logistics"
([hrms #2836](https://github.com/frappe/hrms/issues/2836), **[READ]**); the travel request produces
no accounting transaction ([hrms #346](https://github.com/frappe/hrms/issues/346), open since 2023,
[CORPUS]); each receipt hand-typed and its image not linked to its line
([hrms #4541](https://github.com/frappe/hrms/issues/4541), **[READ]**). `recurring`.

### Freelancer's own kit ↔ the client's asset system
The freelancer's gear is a foreign object in every system it passes through. There is no shared
vocabulary for *this item is not yours; it must go back, on time, undamaged.* [CORPUS] establishes
this negatively and strongly: a search of a mature multi-country open-source ERP for `carnet`
returned **zero** issues, and `subcontract` returned ten, **all manufacturing** — none of them
equipment hire. Sub-hire, dry-hire and carnets are not badly supported; they are **absent from
business software's vocabulary**. `widespread` [CORPUS].

### Qualification certificates ↔ each client
Certificate-expiry tracking exists — in CrewBrain, for the company ([CORPUS], including
DGUV-relevant certs). The person who *owns* the certificate has no system, and re-supplies it per
client per renewal. `recurring` [INFERENCE]; freelancer-side experience `unverified`.

### Invoice ↔ the client's AP validator
The rejection comes back as prose in an e-mail, weeks later, if at all. The technical failures are
well documented ([#11869](https://github.com/invoiceninja/invoiceninja/issues/11869),
[#10241](https://github.com/invoiceninja/invoiceninja/issues/10241),
[#10673](https://github.com/invoiceninja/invoiceninja/issues/10673), all **[READ]**); the feedback
path is not. `widespread` in DE since 2025-01-01.

### On-site reality ↔ anything at all
No as-built, no template, no handover. [CORPUS] break 3, ranked third overall. For a freelancer
there is no "next project team" to pay for it — there is only them, next year. `widespread`
[CORPUS].

---

## What they would want

Their words, not mine. Every item is a paraphrase or quotation of a request someone actually
filed; [CORPUS] items are marked as second-hand.

**On rates and hours:**
- Separate rates per activity — standard, **overtime**, weekend — because 10 h at 50 plus 2 h at 55
  must come to 610, not 600 ([kimai #5913](https://github.com/kimai/kimai/issues/5913), 2026-04-20,
  **[READ]**).
- **Time-of-day surcharges**: 09:00–17:00 at 100 %, 17:00–20:00 +10 %, later +25 %
  ([kimai #3403](https://github.com/kimai/kimai/issues/3403), 2022-07-07, **open**, **[READ]**).
- A **flat call-out amount on top of** the hourly rate for attending in person
  ([kimai #5223](https://github.com/kimai/kimai/issues/5223), 2024-12-13, **[READ]**).
- One person, several rates, **without having to invent a second user account with a second name**
  — and without hitting "a user email address can only be entered once in the system"
  ([kimai #1417](https://github.com/kimai/kimai/issues/1417), 2020-01-28, **[READ]**).
- The rate must **follow the customer** when an entry is re-assigned, so the export and the invoice
  agree ([kimai #3124](https://github.com/kimai/kimai/issues/3124), 2022-02-03, **[READ]**).
- A **fixed price for a whole project**, not only per entry, "no matter how long I need"
  ([kimai #4435](https://github.com/kimai/kimai/issues/4435), 2023-11-14, **[READ]**).
- To track time against a **customer with no project**, because several clients simply do not have
  projects ([kimai #3483](https://github.com/kimai/kimai/issues/3483), 2022-08-23, closed wontfix;
  [#4643](https://github.com/kimai/kimai/issues/4643), 2024-02-15, **[READ]**).

**On invoicing and getting paid:**
- E-invoices that **actually validate** — correct element order, correct unit price, a
  machine-readable due date ([#11869](https://github.com/invoiceninja/invoiceninja/issues/11869),
  [#10241](https://github.com/invoiceninja/invoiceninja/issues/10241),
  [#10673](https://github.com/invoiceninja/invoiceninja/issues/10673), **[READ]**).
- To **receive** a merged ZUGFeRD PDF+XML and have it become an expense record automatically
  ([#11151](https://github.com/invoiceninja/invoiceninja/issues/11151), 2025-07-29, **open**,
  **[READ]**).
- **Bulk invoicing across many clients at month end**, filtered and tick-boxed, without opening each
  one ([kimai #5512](https://github.com/kimai/kimai/issues/5512), 2025-06-01, **open**, **[READ]**).
- A **timesheet PDF per customer per period**, exported automatically into lexoffice / sevDesk /
  easybill ([kimai #3884](https://github.com/kimai/kimai/issues/3884), 2023-02-28, closed
  **wontfix**, **[READ]**).
- **Reminder chains that respect the local law** — each reminder extending the due date, re-issuing
  the invoice, so the debt is not voided
  ([#4020](https://github.com/invoiceninja/invoiceninja/issues/4020), 2020-08-27, **still open**,
  **[READ]**).
- Late fees that are actually applied to the document and the balance the client sees
  ([#11380](https://github.com/invoiceninja/invoiceninja/issues/11380), 2025-10-29, **[READ]**).
- Automated follow-ups for unpaid invoices
  ([#10740](https://github.com/invoiceninja/invoiceninja/issues/10740), 2025-03-06, **[READ]**).

**On expenses and travel:**
- **Snap a receipt, get a filled expense line**, with the image linked to *that* line rather than
  dangling on the parent record ([hrms #4541](https://github.com/frappe/hrms/issues/4541),
  2026-05-16, **open**, **[READ]**).
- A trip that produces an accounting consequence instead of being "a data capture"
  ([hrms #2836](https://github.com/frappe/hrms/issues/2836), **[READ]**;
  [hrms #346](https://github.com/frappe/hrms/issues/346), [CORPUS]).

**On gear and bookings:**
- Bookings that can **start in the past**, "for items picked up in hurry", and whose **end date can
  be edited while they are running** — "need to pull stuff for another place early, or to extend"
  ([shelf.nu #907](https://github.com/Shelf-nu/shelf.nu/issues/907), 2024-04-13, **open**,
  **[READ]**).
- The vocabulary of the actual job: **Load out / Load in**, and states
  `Draft → Reserved → Packed → Ongoing → Loaded in → Shelved` (same issue).
- **Per-item verification** at check-out and check-in, because on long lists "it isn't just
  sufficient to checkout all items at once"
  ([shelf.nu #843](https://github.com/Shelf-nu/shelf.nu/issues/843), 2024-03-15, **open**,
  **[READ]**).
- A **check-in checklist per category** — does it turn on, is the charger back, does the charger
  work ([snipe-it #10884](https://github.com/grokability/snipe-it/issues/10884), 2022-03-30,
  **[READ]**).
- **Duplicate a booking** instead of re-typing the recurring one
  ([shelf.nu #1916](https://github.com/Shelf-nu/shelf.nu/issues/1916), 2025-07-08, **[READ]**).
- A **printable PDF** "for record keeping and for a physical reference on set"
  ([shelf.nu #942](https://github.com/Shelf-nu/shelf.nu/issues/942), 2024-04-30, **[READ]**).

**On documents and distribution ([CORPUS], carried from sibling dossiers):**
- A **subscribable calendar** that updates itself rather than a static `.ics` that goes stale
  ([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390)).
- **Read-many, write-one** live views, so everyone sees the current document and exactly one person
  can change it ([ontime #1547](https://github.com/cpvalente/ontime/issues/1547)).
- A **handover file** containing everything, photos included, described as the answer to the
  knowledge walking out of the door
  ([Android-Tipster/stagecloset](https://github.com/Android-Tipster/stagecloset) README).

**What they conspicuously do not ask for.** [INFERENCE], from the absence of such requests across
every tracker read this session: nobody asks for another portal, another login, another app the
client makes them install, or a prettier dashboard. The requests are overwhelmingly for **the same
fact to stop being re-typed**, and for **money to come out right**. That is a derivation-and-export
product, not an authoring product.

---

## Implications for AV Planner Suite

Grounded in what the repositories actually contain, per
[`repos/INVENTORY.md`](../repos/INVENTORY.md) (verified 2026-08-28 by direct source inspection)
and `cable-planner/CLAUDE.md` (**[READ]** this session).

### 0. The freelancer is already the suite's native user, and one package proves it

`@avplan/lexware-core` maps a neutral `BillingDoc` to Lexware Office quotation/invoice payloads
**with §19 handling** ([`repos/INVENTORY.md`](../repos/INVENTORY.md), **[READ]**). §19 UStG is the
German small-business VAT exemption — the *Kleinunternehmerregelung*. Nobody builds §19 handling
for a rental house with fifty staff. **That line of code is aimed squarely at a one-person
business**, and it means the suite has already, perhaps accidentally, taken a position on this
role.

The immediate gap follows from Time sink 5: since **2025-01-01 German B2B firms must be able to
receive and process structured e-invoices** ([CORPUS]), German competitors already emit **ZUGFeRD
and XRechnung** (Eventworx explicitly, [CORPUS]), and the failure mode when you get the format
subtly wrong is *silent rejection by the client's AP system*
([#11869](https://github.com/invoiceninja/invoiceninja/issues/11869), **[READ]**). **Action:
establish exactly what Lexware Office already covers before writing a single line of XML.** If it
covers ZUGFeRD/XRechnung output, this is a documentation task. If it does not, this is table
stakes, not a differentiator — and hand-rolling CII element ordering is demonstrably a way to ship
invoices that every validator rejects.

### 1. Build the freelancer-side record, not another crew scheduler

[CORPUS] is explicit that building a worse CrewBrain would **create** a media break rather than
close one, and that the right posture toward crew, invoicing and warehouse scanning is *an
interface, not a rebuild*. That still holds. But it leaves the actual hole untouched, because
every product in that market is bought by the company.

The unclaimed position is **the freelancer's own single file**: my dates (with pencil / hold /
confirm as first-class states), my kit, my hours, my receipts, my invoices, my certificates — held
locally, offline-first, exportable. The suite's architecture already supports this better than any
cloud competitor: projects are local files, atomic writes with `.bak` rotation, all integrations
opt-in, `healProjectPositions` as a real migration layer
([`repos/INVENTORY.md`](../repos/INVENTORY.md), **[READ]**).

### 2. Ship a subscribable calendar feed, never an `.ics` download

The freelancer's only true integration point is their phone calendar. The current industry state
of the art is a static file that goes stale and is re-downloaded by hand
([shelf.nu #2390](https://github.com/Shelf-nu/shelf.nu/issues/2390), [CORPUS]), and the fix
proposed *in that issue* is a subscribable `webcal://` URL specifically chosen to avoid
third-party API dependencies. That is exactly the right shape for an offline-first, local-file
product: the suite serves the feed; Apple/Google/Outlook poll it; no vendor account is required at
either end.

This is small, unglamorous, and it is the single highest-leverage feature in this dossier for this
role.

### 3. `mobileShareServer` and `src/viewer/` are already the answer to Time sink 2 — point them at people who have no account

`cable-planner` already runs a **mobile share server serving a read/check-only LAN view to
smartphones**, and a separate `src/viewer/` Vite entry producing a read-only web viewer
(`cable-planner/CLAUDE.md`, **[READ]**; corroborated in
[`repos/INVENTORY.md`](../repos/INVENTORY.md)). That is precisely "the plan reaches the freelancer's
phone, in a basement, with no internet" — which is Time sink 2, the second-most-expensive item in
this dossier.

Two increments make it a freelancer feature rather than an internal one:

- **Sharing to a person, not to a user.** The industry has already conceded this model: the outside
  person is a name and an e-mail, account-less by design
  ([#219](https://github.com/Shelf-nu/shelf.nu/issues/219), **[READ]**). A share link with no
  signup is the correct interface for someone who will work for this client once.
- **Read-many, write-one.** [CORPUS] identifies this as the access model this entire industry needs
  and notes PDF is the current bad approximation. The mobile view is already read/check-only, which
  is half the model shipped.

### 4. Whatever computes labour must model the rate matrix, or it will be wrong on job one

If the suite ever prices crew — via `lexware-core` or anywhere else — the minimum viable model is
**not** hours × rate. From the six-reporter, 2018–2026 [READ] cluster: activity-based rates
(standard / overtime / weekend), time-of-day surcharge bands, a flat call-out amount added to an
hourly line, several rates for one person without duplicating the person, and the rate
re-resolving when the customer on an entry changes. A simpler model produces the exact defect a
user reported as "export and invoces showed different times"
([kimai #3124](https://github.com/kimai/kimai/issues/3124), **[READ]**).

### 5. The exports that already exist are the freelancer's back office

`cable-planner` already exports **pack list, asset register, barcode/QR labels, per-device PDF,
group PDF, rack and stage plot** ([`repos/INVENTORY.md`](../repos/INVENTORY.md), **[READ]**). For
this role those are not planning artefacts, they are commercial documents: the pack list is the
load-out list, the asset register is the insurance schedule, the labels are how you tell your kit
from the house's at 03:00, and the group PDF is the dry-hire delivery note. **They need a
signature block and a date, and they become the paper that gets signed.**

### 6. Capture the outcome of the WhatsApp approval

[CORPUS] concludes — and I agree — that no tool wins the messaging channel, and that the achievable
win is "a ten-second way to turn 'yes do it, invoice us' into a dated record attached to the job".
For the freelancer this is the highest-value ten seconds in the whole workflow, because the
approval to work overtime *is* the disputed invoice line. `PendingChange` and `ChangeLogEntry`
already exist in the cable-planner model to hang it on
([`repos/INVENTORY.md`](../repos/INVENTORY.md)).

### 7. The as-built is the freelancer's only compounding asset

[CORPUS]'s defining claim for this variant — "job number two costs the same as job number one" —
is a statement about **templates**. A freelancer who returns to the same annual conference, the
same church, the same client's town hall should open last year's project and see what actually
happened, not what was planned. `ProjectRevision` and `UnitEvent` history already exist
([`repos/INVENTORY.md`](../repos/INVENTORY.md)); what is missing is a deliberate, one-tap
*"what changed on site"* capture at strike, and a way to open last year's file as this year's
starting point.

### 8. What this dossier does *not* license

- **Do not build crew scheduling.** [CORPUS], twice, and I found nothing today to contradict it.
- **Do not build an availability marketplace.** The cross-company availability gap is real and
  `widespread`, but it is a two-sided-network problem, and this suite has no distribution on the
  company side.
- **Do not assume the pencil/hold/confirm model.** It is `unverified` in this session and it is
  load-bearing for anything calendar-shaped. **Verify it first.**

---

## Verification queue (what to check first when web access returns)

Listed explicitly because several claims above are structurally important and rest on [CORPUS] or
[INFERENCE] alone:

1. **The pencil / hold / confirm booking convention** — its states, who may change them, and what
   a "release" looks like. Target sources: Blue Room, ProSoundWeb, r/livesound, German
   Veranstaltungstechnik forums, VPLT material.
2. **Per-diem practice** — German *Verpflegungsmehraufwand* tiers and how freelancers actually
   claim them, versus what clients pay. Nothing readable this session.
3. **How many client logins a working freelancer carries**, and which ones they refuse.
4. **What actually arrives in a tech pack**, and how far in advance. Target: r/VIDEOENGINEERING,
   Control Booth, film-tv-video.de.
5. **The photo-as-as-built practice** — believed widespread, sourced nowhere here.
6. **The quote ↔ technical-plan break**, which [CORPUS] itself flags as its own
   most-important-and-least-verified claim.

---

## Sources

### Read directly this session (GitHub issue bodies, via the GitHub MCP issue-search API)

**kimai/kimai** — time tracking and invoicing
- https://github.com/kimai/kimai/issues/309 (2018-09-13, open)
- https://github.com/kimai/kimai/issues/1417 (2020-01-28, closed)
- https://github.com/kimai/kimai/issues/2559 (2021-05-06, open)
- https://github.com/kimai/kimai/issues/2743 (2021-08-31, open)
- https://github.com/kimai/kimai/issues/3124 (2022-02-03, closed)
- https://github.com/kimai/kimai/issues/3403 (2022-07-07, open)
- https://github.com/kimai/kimai/issues/3460 (2022-08-04, closed)
- https://github.com/kimai/kimai/issues/3483 (2022-08-23, closed wontfix)
- https://github.com/kimai/kimai/issues/3526 (2022-09-08, closed wontfix)
- https://github.com/kimai/kimai/issues/3884 (2023-02-28, closed wontfix)
- https://github.com/kimai/kimai/issues/4042 (2023-05-21, open)
- https://github.com/kimai/kimai/issues/4339 (2023-10-06, closed)
- https://github.com/kimai/kimai/issues/4435 (2023-11-14, closed duplicate)
- https://github.com/kimai/kimai/issues/4643 (2024-02-15, closed)
- https://github.com/kimai/kimai/issues/4679 (2024-03-05, closed duplicate)
- https://github.com/kimai/kimai/issues/5223 (2024-12-13, closed)
- https://github.com/kimai/kimai/issues/5303 (2025-01-16, closed — German)
- https://github.com/kimai/kimai/issues/5512 (2025-06-01, open)
- https://github.com/kimai/kimai/issues/5525 (2025-06-04, closed)
- https://github.com/kimai/kimai/issues/5678 (2025-11-04, open)
- https://github.com/kimai/kimai/issues/5817 (2026-02-10, open)
- https://github.com/kimai/kimai/issues/5913 (2026-04-20, closed)
- Also read in the same result sets, not cited above: #111, #303, #451, #470, #1051, #1323, #2559,
  #3014, #3060, #3355, #3559, #4266, #4285, #4421, #4567, #4593, #4703, #4968, #5054, #5228, #5386,
  #5728

**invoiceninja/invoiceninja** — invoicing, e-invoicing, dunning
- https://github.com/invoiceninja/invoiceninja/issues/4020 (2020-08-27, open)
- https://github.com/invoiceninja/invoiceninja/issues/5467 (2021-04-18, closed)
- https://github.com/invoiceninja/invoiceninja/issues/8639 (2023-07-12, open)
- https://github.com/invoiceninja/invoiceninja/issues/9160 (2024-01-17, closed)
- https://github.com/invoiceninja/invoiceninja/issues/9481 (2024-04-24, closed)
- https://github.com/invoiceninja/invoiceninja/issues/9553 (2024-05-28, closed)
- https://github.com/invoiceninja/invoiceninja/issues/9639 (2024-06-15, closed)
- https://github.com/invoiceninja/invoiceninja/issues/10241 (2024-11-11, closed)
- https://github.com/invoiceninja/invoiceninja/issues/10263 (2024-11-15, closed)
- https://github.com/invoiceninja/invoiceninja/issues/10673 (2025-02-14, closed)
- https://github.com/invoiceninja/invoiceninja/issues/10740 (2025-03-06, closed)
- https://github.com/invoiceninja/invoiceninja/issues/11151 (2025-07-29, open)
- https://github.com/invoiceninja/invoiceninja/issues/11380 (2025-10-29, closed)
- https://github.com/invoiceninja/invoiceninja/issues/11869 (2026-04-08, closed)
- Also read: #3236, #8585

**Shelf-nu/shelf.nu** — asset custody and bookings
- https://github.com/Shelf-nu/shelf.nu/issues/219 (2023-07-13, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/843 (2024-03-15, open)
- https://github.com/Shelf-nu/shelf.nu/issues/907 (2024-04-13, open)
- https://github.com/Shelf-nu/shelf.nu/issues/942 (2024-04-30, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/1510 (2024-12-11, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/1547 (2024-12-30, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/1761 (2025-05-01, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/1839 (2025-06-10, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/1904 (2025-06-30, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/1916 (2025-07-08, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/1999 (2025-08-22, closed)
- https://github.com/Shelf-nu/shelf.nu/issues/2222 (2025-12-01, closed)

**bitfocus/companion** — the portable control surface
- https://github.com/bitfocus/companion/issues/1603 (2021-05-21, closed)
- https://github.com/bitfocus/companion/issues/1940 (2022-02-24, closed)
- https://github.com/bitfocus/companion/issues/2755 (2024-02-18, closed)
- https://github.com/bitfocus/companion/issues/3063 (2024-10-02, closed)

**frappe/hrms** — expenses, travel, per-diem-adjacent
- https://github.com/frappe/hrms/issues/889 (2023-09-16, closed)
- https://github.com/frappe/hrms/issues/1657 (2024-04-12, closed)
- https://github.com/frappe/hrms/issues/2218 (2024-09-19, closed)
- https://github.com/frappe/hrms/issues/2423 (2024-11-17, open)
- https://github.com/frappe/hrms/issues/2836 (2025-03-06, open)
- https://github.com/frappe/hrms/issues/2893 (2025-03-21, open)
- https://github.com/frappe/hrms/issues/3280 (2025-06-26, closed)
- https://github.com/frappe/hrms/issues/3777 (2025-11-26, closed)
- https://github.com/frappe/hrms/issues/4541 (2026-05-16, open)
- Also read: #93, #110

**grokability/snipe-it** — asset check-in/out
- https://github.com/grokability/snipe-it/issues/3436 (2017-03-17, closed)
- https://github.com/grokability/snipe-it/issues/6222 (2018-09-21, closed)
- https://github.com/grokability/snipe-it/issues/6656 (2019-01-29, closed)
- https://github.com/grokability/snipe-it/issues/10884 (2022-03-30, closed)

**frappe/erpnext** — supplier/customer portal and onboarding (weak yield, listed for completeness)
- https://github.com/frappe/erpnext/issues/15197, #35364, #35625, #36470, #49747, #51688, #52344,
  #54246

**larszu/cable-planner** — the product's own tracker
- https://github.com/larszu/cable-planner/issues/57 (2026-05-09, closed — yEd import)
- https://github.com/larszu/cable-planner/issues/73 (2026-05-12, closed — Mobile Version)
- https://github.com/larszu/cable-planner/issues/149 (2026-05-17, closed — mobile.html)
- https://github.com/larszu/cable-planner/issues/151 (2026-05-17, closed — Export)
- https://github.com/larszu/cable-planner/issues/322 (2026-05-28, closed — Patch Sheets)

**inventree/InvenTree** — searched (personal-kit and loan angles); **zero relevant results**, noted
as a null finding rather than omitted.

### Repository files read this session

- `/home/user/av-planner-suite/docs/research/METHOD.md`
- `/home/user/av-planner-suite/docs/research/workflow-chain.md`
- `/home/user/av-planner-suite/docs/research/repos/INVENTORY.md`
- `/home/user/av-planner-suite/docs/research/roles/production-manager.md`
- `/home/user/av-planner-suite/docs/research/roles/warehouse.md`
- `/home/user/av-planner-suite/docs/research/landscape/event-rental-management.md` (grep + excerpts)
- `/home/user/av-planner-suite/docs/research/landscape/broadcast-production-management.md` (excerpts)
- `/home/user/cable-planner/CLAUDE.md`

### Cited via the corpus, carrying the URL the corpus recorded — NOT opened this session

- https://github.com/Shelf-nu/shelf.nu/issues/2390 — stale `.ics`, subscribable calendar proposal
- https://github.com/Shelf-nu/shelf.nu/issues/1957 — damage discovered after return; return-time prompt
- https://github.com/Shelf-nu/shelf.nu/issues/2767, /2831, /1817, /2875, /2724, /2821 — availability and scan-only defects
- https://github.com/cpvalente/ontime/issues/1547 — live read-only view, write-one
- https://github.com/frappe/hrms/issues/346 — travel request has no accounting consequence
- https://github.com/frappe/erpnext/issues/34127 — Excel budget vs actual
- https://github.com/frappe/erpnext/issues/51855 — first-party WhatsApp integration request
- https://github.com/Android-Tipster/stagecloset — the handover-file rationale
- https://www.crewbrain.com/de/features/schnittstellen/easyjob-protonic/
- https://en.blog.crewbrain.com/2025/07/efficient-personnel-planning-the-interface-between-crewbrain-and-easyjob-at-a-glance/
- https://www.crewbrain.com/en/features/interfaces/
- https://www.eventworx.biz/crewbrain/
- https://www.datev.de/web/de/aktuelles/e-rechnung-mit-datev/
- https://www.because-software.com/newsroom/news/e-rechnung/
- https://www.sportsvideo.org/2026/07/07/how-fox-built-a-world-class-network-infrastructure-for-the-fifa-world-cups-unique-demands/
- https://www.refrens.com/en/freelance-invoice-templates
- https://quickbooks.intuit.com/ca/resources/invoice-templates/freelancers/
- https://www.invoicesimple.com/invoice-template/freelance-invoice-template/

### Attempted and blocked this session (recorded so the gap is auditable)

- `old.reddit.com` — Claude Code unable to fetch
- `www.prosoundweb.com` — `EGRESS_BLOCKED`
- `duckduckgo.com` — `403 CONNECT tunnel failed`
- `WebSearch` — budget exhausted (200/200) before this task began
- Additional same-session proxy denials logged for `wrike.com`, `height.app`, `studiobinder.com`,
  `yamdu.com`, `setkeeper.com`, `farmerswife.com`
