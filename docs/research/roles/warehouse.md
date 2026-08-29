# Warehouse Staff / Lageristen

Research dossier for AV Planner Suite. Compiled 2026-08-29.

> ## Method and evidence caveat — read this first
>
> **What worked in this session:** exactly two channels.
>
> 1. **The GitHub issue-search API** (via MCP), which is *not* repository-scoped: it returns
>    issue titles, full bodies, dates, state, labels, reaction and comment counts from any public
>    repository. Roughly **61 issues** across `grokability/snipe-it`, `frappe/erpnext`,
>    `inventree/InvenTree`, `inventree/inventree-app`, `openboxes/openboxes` and
>    `larszu/cable-planner` were read this way. This is a genuine primary source: practitioner
>    text, written by the person with the problem, with a date attached.
> 2. **The existing research corpus in this repository** —
>    [`workflow-chain.md`](../workflow-chain.md),
>    [`landscape/event-rental-management.md`](../landscape/event-rental-management.md),
>    [`METHOD.md`](../METHOD.md) and the sibling role dossiers. These were compiled in earlier
>    sessions when web search still worked, and they carry their URLs.
>
> **What did not work:** everything else. `WebSearch` was exhausted before this task started
> (200 of 200 calls used). The egress proxy returned `403 / EGRESS_BLOCKED` for every non-GitHub
> host tried this session, verified individually: `reddit.com`, `old.reddit.com`,
> `prosoundweb.com`, `controlbooth.com`, `blue-room.org.uk`, `forum.blackmagicdesign.com`,
> `film-tv-video.de`, `production-partner.de`, `vplt.org`, `wikipedia.org`, `stackoverflow.com`,
> `duckduckgo.com`, `bing.com`, `archive.org`, `web.archive.org`, `news.ycombinator.com`,
> `medium.com`, `youtube.com`, `linkedin.com`, `indeed.com`, and every rental-vendor domain
> including `rentman.io`, `support.rentman.io`, `current-rms.com`, `docs.current-rms.com`,
> `hirehop.com`, `flexrentalsolutions.com`, `helpcenter.flexrentalsolutions.com`, `easyjob.net`.
> Repository *file* reads through the GitHub MCP are additionally scoped to `larszu/*`, so only
> issue **search** results were available for third-party projects, never comment threads.
>
> **The consequences, stated plainly:**
>
> - **Zero forum posts, zero subreddit threads, zero trade-press articles, zero German-language
>   sources, zero job postings and zero YouTube comments were read this session.** The brief asked
>   for all of them. They are not here. Where the corpus already contains such material it is
>   carried forward and labelled, but it was gathered by a previous session and could not be
>   re-verified today.
> - The strongest primary layer is **adjacent-domain**: open-source asset-management and inventory
>   tools (Snipe-IT, InvenTree, ERPNext) rather than AV rental ERPs (Rentman, Current RMS, Flex,
>   easyjob), whose trackers are not public. This transfers well for scanning, kits, check-in/out,
>   labels and audits — the physical warehouse verbs are identical, and several issue authors are
>   explicitly describing camera/audio kit — and transfers **badly** for anything about
>   time-axis availability, sub-hire commercials or truck planning. Each finding says which it is.
>
> **Labels used throughout,** extending [`METHOD.md`](../METHOD.md):
>
> - **[FACT]** — read directly this session. In practice: a GitHub issue body, with its URL, its
>   creation date, its last-updated date and its open/closed state. Also files in this repository.
> - **[SECOND-HAND]** — carried from a sibling dossier in this corpus, with the URL that dossier
>   cites, so it can be re-verified when egress allows. **Not opened this session.**
> - **[INFERENCE]** — my reasoning from the above, flagged as reasoning, not evidence.
> - **unverified** — could not be established. Left visible rather than quietly dropped.
>
> **Frequency grading is deliberately conservative.** `widespread` is used only where the same
> failure appears in more than one independent tracker *and* is corroborated by the corpus, or
> where a vendor ships a feature whose only purpose is to solve it. Several findings that are
> almost certainly widespread in the trade are graded `recurring` because a second independent
> source could not be reached today.

---

## Who they are / where they sit in the production

### The job

The warehouse team is the layer that converts a **promise** into a **physical pile of cases**, and
then converts the pile that comes back into **money or a write-off**. Everything upstream of them
(quote, project, technical plan) is text. Everything downstream (load-in, rehearsal, show) assumes
the right boxes are on the right truck. They are the only people in the chain who touch every item
twice — once going out, once coming back — and the only people whose errors are discovered by
somebody else, somewhere else, usually at the worst possible moment.

Titles vary by market and house size. In German-speaking event technology the role sits under
*Lagerist*, *Lagerlogistiker*, *Materialdisponent* or simply *Lager*; English-language houses say
*warehouse technician*, *prep tech*, *warehouse lead*, *asset manager*. In small houses it is not a
separate job at all — the project manager or a technician preps their own gear.
**unverified** as to exact title distribution: no job postings could be reached this session.

### Where they sit in the chain

The corpus models the production chain as 20 stations. The warehouse owns or co-owns five of them
([`workflow-chain.md`](../workflow-chain.md), **[SECOND-HAND]**):

| Station | What the warehouse does | Who hands them the input |
| --- | --- | --- |
| 12. Packing / prep / QC | pick, test, pack into cases, scan out | project manager's reservation + the technical plan |
| 13. Transport / load list | build the truck sheet, weights, volumes, stacking | pick list + transport plan |
| 17. Load-out | (often) receive back on site or from the driver | crew, at night, in the rain |
| 18. Return / check-in | scan in, count, find missing, assess damage | the pile in the yard |
| 19. Invoice (input to) | report shortages, damage and extras that must be charged | their own check-in findings |

Two structural facts about their position matter more than any individual complaint:

1. **They are downstream of a media break they did not cause.** The technical plan (cable schedule,
   camera plan, rack elevations, lighting plot) lives in CAD, Visio and Excel; the reservation lives
   in the rental ERP; the pick list is generated from the reservation, not from the plan. So the
   warehouse packs what the *commercial* system says, not what the *technical* system says. When
   those disagree — and the corpus's change-propagation case study is precisely about how they come
   to disagree — the warehouse finds out at pack time, or the crew finds out on site
   (**[SECOND-HAND]**, `workflow-chain.md` breaks 1 and 2).
2. **They are the cheapest seats in the building, by vendor design.** Rentman makes warehouse and
   crew "basic users" free and charges only for "power users"; Flex charges **per warehouse
   location with unlimited users** (**[SECOND-HAND]**,
   [`event-rental-management.md`](../landscape/event-rental-management.md), citing
   `rentman.io/pricing` and `flexrentalsolutions.com/plan-pricing/`). That is genuinely good
   commercial design — nobody should be priced out of scanning. **[INFERENCE]:** it also means the
   warehouse is the user group with the least revenue attached per seat, which is a plausible
   explanation for why warehouse-facing UX is consistently the thinnest part of these products.

### Who they are not

They are not stock controllers in a distribution centre. The distinguishing features of an AV
warehouse against a general-goods warehouse are, all **[SECOND-HAND]** from
`event-rental-management.md`:

- **The same physical unit is sold repeatedly over time.** Availability is a question about a date
  range, not a quantity on a shelf.
- **Serialised units carry history**: maintenance, test dates (DGUV V3 in Germany), damage.
- **Things travel in nested containers** — Rentman calls them *equipment combinations*, and they are
  themselves serialisable; Current RMS calls the physical unit a *stock level*. A case contains
  items; a rack contains devices; a truck contains cases.
- **Some of the stock is not yours**: sub-hire / cross-rental gear must go back, on time, undamaged,
  to somebody else's warehouse.

---

## A day in the life

Chronological, as the brief asks. Structural claims are labelled; the connective tissue is
**[INFERENCE]** from the corpus's station model and should be read as a working hypothesis to test
with a real Lagerist, not as findings.

### Prep (T-2 to T-1 days) — the long shift

**The pull sheet arrives.** In an integrated house it is generated from the reservation and worked
on screen or on a handheld; in most houses it is **printed** and worked through with a pen.
Vendors sell the printed version as a feature — Flex publishes a "Prepping a Pull Sheet" help
article and a "pick lists / pull sheets" product page; Rentman shipped a product update whose whole
subject is *creating pack lists for items that still have to be packed*
(**[SECOND-HAND]**, `helpcenter.flexrentalsolutions.com/hc/en-us/articles/360054924294-Prepping-a-Pull-Sheet`,
`flexrentalsolutions.com/event-rental-software-features/inventory-management/pick-lists-pull-sheets/`,
`rentman.io/de/produktupdates/erstelle-packlisten-fur-items-die-noch-gepackt-werden-mussen`).
A Rentman German customer story reports a house still packing from **printed** pack lists
(`rentman.io/de/kunden/erfahrungsberichte/jk-veranstaltungstechnik`), and a Point of Rental case
study describes paper loading and check-in sheets producing duplicate processes and lost paperwork
(`point-of-rental.com/case-study/...`). Both are vendor case studies — motivated sources — but they
are consistent across two competing vendors, which is the useful part. *recurring to widespread*.

**Picking.** The list says *what*. It very often does not say *where*. This is the single most
transferable finding from the primary layer: an ERPNext user filed
[#47059](https://github.com/frappe/erpnext/issues/47059) (2025-04-14, open, still labelled "Under
Review" as of 2026-03-09) asking for the rack number to appear on the pick list, with the exact
observation that matters — *"these rack nos can be multiple since one item can be in multiple
racks"* **[FACT]**. In an AV warehouse the same item lives in several places: in a case that is
already packed, on a shelf, in a rack that is on another job, in repair.

**Sub-hire receiving.** Anything short is cross-hired from a peer. The paperwork for that arrives as
**e-mail, a PDF purchase order and the supplier's own delivery note**, which is to say it arrives
outside the job file (**[SECOND-HAND]**, `workflow-chain.md` break 9, which grades this *recurring*
and notes that unintegrated operations are "blind to external shortages" and cross-check in separate
spreadsheets). The warehouse receives a box of somebody else's gear, which must be labelled as
not-ours, kept apart, and returned. The asset-tracking tools have no concept of this: Snipe-IT
[#8478](https://github.com/grokability/snipe-it/issues/8478) *"Support for rented vs. owned
assets"* is open since 2020-09-28, last updated 2025-08-19, 5 up-votes, and the alternatives its
author had already tried are telling — *"Creating 2 companies - one for the rented assets another
for owned"* or per-model custom fields **[FACT]**.

**Packing into cases, and the labelling.** Case labels and asset tags get printed. This is
where a surprising amount of time goes, and the primary layer is unusually specific: Snipe-IT
[#19541](https://github.com/grokability/snipe-it/issues/19541) (2026-08-24, open) asks for multiple
saved label profiles because the organisation currently prints one large label and then
*"manually cut[s] parts of it so that it fits, sometimes trimming very close to the QR code"*
**[FACT]**. [#13433](https://github.com/grokability/snipe-it/issues/13433) (2023-08, open, updated
2025-08) is a label sheet that does not print in the configured grid **[FACT]**.

**Scan-out.** Where scanning exists it is the state transition — prep → checked out — and it is
good. Where it does not, the paper sheet is ticked and typed in at end of shift, and the warehouse
runs *"permanently a few hours behind reality"* (**[SECOND-HAND]**, `workflow-chain.md` break 7,
citing `dynamicsmobile.com/solutions/warehouse`).

**Truck.** The load list, weights, volumes and stacking order. Integrated systems build truck sheets
from pick lists; **which item fits in which case, and how the truck packs, is solved by nobody**
(**[SECOND-HAND]**, `event-rental-management.md`, "What NOBODY in this segment solves well", item 7).
So it is a person, a tape measure and experience.

### Load-in (T-0) — mostly other people's day

Unless they are driving, the warehouse hears about load-in only when something is wrong. The
canonical message is in the corpus verbatim as the WhatsApp column of station 12:
*"we're two DMX cables short"* (**[SECOND-HAND]**). The consequence for the warehouse is an
unplanned pick, an unplanned courier, and an item that leaves the building on nobody's list.

### Rehearsal and show — the chasing window

This is when the warehouse gets asked questions it cannot answer quickly:

- *Where is the second one?* — the item is on the system but its location is stale, because in most
  of these tools **location only changes as a side effect of check-out/check-in**. Snipe-IT
  [#6743](https://github.com/grokability/snipe-it/issues/6743) states it precisely: to move an item
  from one storage area to another *"one must check-out the item to an arbitrary user/location, then
  set the item's location on check-in"* **[FACT]** (filed 2019, closed 2019, still being commented
  on 2026-03-02).
- *Is there another one free?* — needs the time-axis availability engine, which is the rental ERP's
  strongest feature and the asset tools' weakest (**[SECOND-HAND]**).
- *What went out with it?* — needs case contents, which is the kit problem below.

### Load-out — where the data dies

The corpus is blunt about this station: the load-out list is *"ticked in the dark, in the rain"*,
and *"anything not written down at 03:00 is discovered days later at check-in and cannot be
attributed to a job or a person"* (**[SECOND-HAND]**, station 17). Damage evidence at this point is
**photos in a chat**.

### Check-in and post-show — the reckoning

Counting back, finding what is missing, deciding what is damaged, and turning both into either an
invoice line or an absorbed loss. Two hard edges, both **[SECOND-HAND]**:

- Damage reports are expected to carry asset ID/serial, photos from several angles and pre-existing
  damage, and **24-hour reporting windows are commonly cited** — so an undocumented load-out becomes
  an uncharged loss (station 18, citing `tapgoods.com/...damaged-equipment-report/`,
  `intemposoftware.com/blog/what-happens-customer-returns-damaged-rental-equipment`,
  `support.sharegrid.com/en/articles/733935-what-if-my-equipment-has-visible-damage-or-missing-items`).
- The check-in discrepancy has to become money at station 19, and if the load-out list was vague the
  loss is unattributable and absorbed.

Then: re-shelving, repairs, test/inspection due-dates, and the sub-hire items that must go back to
their owner before their own rental clock runs out.

---

## Tools they actually use

Feelings are inferred from the evidence cited in the same row; they are **[INFERENCE]** unless a
quoted issue says otherwise.

| Tool | For what | How they feel about it |
| --- | --- | --- |
| **Rental ERP** — Rentman, Current RMS/OnRent Events, easyjob, Flex, HireHop, Point of Rental | Reservations, pull sheets, prep status, scan in/out, serials, inspections | Accepted as the system of record. The availability engine is genuinely respected. The warehouse-facing screens are the part nobody optimised. **[SECOND-HAND]** for capability; feelings **[INFERENCE]** |
| **The printed pull sheet / pack list** | The actual working document during picking | Trusted more than the screen. Works with gloves, in the dark, with a pen, and does not log you out. It is not nostalgia — it is the only interface with no failure mode **[INFERENCE]** |
| **Handheld scanner (Zebra) or phone camera** | Scan-out, check-in, audits | Loved when it works, and it mostly does — a scan is ~1 error per 3 million versus ~1 per 300 keyed characters (**[SECOND-HAND]**, `wisys.com/blog/warehouse-scanner-roi-what-the-data-actually-shows`). Rentman documents Android and Zebra scanner support (**[SECOND-HAND]**, `support.rentman.io/.../360013478180-Scanner-Options-in-Rentman`) |
| **Label printer + Avery label sheets** | Asset tags, case labels | A recurring, unglamorous time sink: wrong grid on the sheet, one global template for wildly different item sizes, labels cut by hand to fit **[FACT]** ([#13433](https://github.com/grokability/snipe-it/issues/13433), [#19541](https://github.com/grokability/snipe-it/issues/19541)) |
| **In-house asset tools** — Snipe-IT, InvenTree, Shelf, Cheqroom | Equipment pools in broadcasters, churches, schools, universities, small production companies | Good enough to adopt, then fought with. The entire primary layer of this dossier is people who adopted one and then filed the gap **[FACT]** |
| **Excel** | Truck volume/weight plans, sub-hire cross-checks, count sheets, anything the ERP will not hold | The universal escape hatch. Vendors position explicitly against spreadsheets, which is itself evidence that spreadsheets are the incumbent (**[SECOND-HAND]**, `booqable.com/spreadsheets/`, German *Lagerverwaltung ohne Excel* posts) |
| **WhatsApp** | Damage photos, "which case has X", ETAs, shortage calls | The real-time layer. Fast, universal, and completely outside the record **[SECOND-HAND]** |
| **E-mail + PDF** | Sub-hire POs, supplier delivery notes, supplier invoices | Where the sub-hire lifecycle lives, and where it gets lost **[SECOND-HAND]** |
| **The truck sheet / delivery note** | What physically leaves and who signed for it | Paper, signed, and the only evidence in a dispute **[SECOND-HAND]** |

---

## Time sinks

Ranked by my estimate of aggregate cost, with the evidence that supports each. Ranking is
**[INFERENCE]**; the individual items are evidenced.

### 1. Checking out and checking in, one item at a time, things that always travel together

This is the clearest, best-evidenced time sink in the whole primary layer, and it is stated in
minutes by the person losing them.

- Snipe-IT [#9517](https://github.com/grokability/snipe-it/issues/9517) (2021-04-30, **open**, last
  updated 2025-08-18): a user with *"multiple cameras, and a collection of lenses for each, as well
  as audio equipment, storage cards etc, that are intended to travel together at all times"* wants
  to hand over the bag and have its contents follow. Without it, *"it sometimes takes a good half
  hour of repetitive clicking"* **[FACT]**. Note the domain: this is AV kit, described by an AV
  person, in an IT asset tool.
- Snipe-IT [#8539](https://github.com/grokability/snipe-it/issues/8539) *"Predefined Kits - Specific
  Assets"* (2020-10-20, **open**, last updated **2026-08-12**, 10 comments): predefined kits contain
  *models*, not *specific assets*. The workaround is to create a parent asset called "Toolkit 1" and
  check every real asset out to it — which then sends the user only one notification, for the
  parent. *"Checking in kits / large quantities of assets is also currently time consuming"*
  **[FACT]**.
- Snipe-IT [#14466](https://github.com/grokability/snipe-it/issues/14466) (2024-03-20, open, updated
  2025-10-22, 9 comments, 3 up-votes): *"We have to bulk checkout up to 100 devices and it's quite
  annoying in the bulk checkout menu to choose one asset after the other in the multiple select
  field … For the bulk checkin it's there is no feature"* **[FACT]**.
- Snipe-IT [#18230](https://github.com/grokability/snipe-it/issues/18230) (2025-11-21): the same
  complaint for accessories — five separate check-outs for one person's five accessories **[FACT]**.

**Frequency:** *widespread* within the asset-tool population — four independent reports across five
years, three still open, one updated this month. **Transfer risk to AV rental ERPs:** medium. Rentman
and Current RMS *do* model combinations/kits (**[SECOND-HAND]**), so the exact defect may not exist
there; what transfers is the shape of the requirement — **the case is the unit of work, not the
item**.

### 2. Picking without a location

The pick list names the item, not the shelf. ERPNext [#47059](https://github.com/frappe/erpnext/issues/47059)
(2025-04-14, open, under review 2026-03) asks for rack numbers on the pick list *"so that the same
can be carry forwarded to delivery note"*, and notes that one item can be in multiple racks
**[FACT]**. The corpus's second-hand layer on picking errors
(`xorosoft.com/warehouse-picking-errors/`,
`netsuite.com/portal/resource/articles/erp/prevent-picking-errors-in-warehouse.shtml`) sits behind
this. **Frequency:** *recurring* in evidence; **[INFERENCE]** widespread in practice, since the AV
case makes it worse — half the stock is inside other cases.

### 3. Re-keying the paper pull sheet at the end of the shift

Ticked on paper during the pick, typed into the ERP later. The corpus's numbers: keyed data at
roughly **1 error per 300 characters** against roughly **1 per 3 million barcode scans**; order-entry
automation vendors claim **2–3 hours per day** recovered from re-keying and reconciliation; hybrid
paper-plus-end-of-shift warehouses run *"permanently a few hours behind reality"*
(**[SECOND-HAND]**, `workflow-chain.md` break 7). Vendor-sourced numbers, flagged as such.
**Frequency:** *widespread* in small and mid houses, *recurring* in large ones.

### 4. Moving stock without a transaction to hang it on

Re-shelving after check-in, consolidating a bay, moving a case to the outgoing area — real work that
the tools model badly. Snipe-IT [#6743](https://github.com/grokability/snipe-it/issues/6743): you
cannot change an asset's location except through a check-out/check-in pair **[FACT]**. Snipe-IT
[#12893](https://github.com/grokability/snipe-it/issues/12893) (2023-04, open) is the same problem at
creation time: to file a new asset into storage you must check it out to somebody and then check it
back in **[FACT]**. **Frequency:** *recurring*.

### 5. Inventory audits that tell you almost nothing

Snipe-IT [#8095](https://github.com/grokability/snipe-it/issues/8095) (2020-05-28, **open**, updated
2025-06-14, 9 comments) describes a bulk audit by scanning labels where the result list shows only
green (in the database) or red (not in the database): no model, no location, and — the important one
— **no distinct state for "found, but in the wrong place"**. The author's request is that a
wrong-location item be shown in a third colour *and still be recorded as found at the audited
location* **[FACT]**. **Frequency:** *recurring*. **[INFERENCE]:** in an AV warehouse the
wrong-place case is not an exception, it is the normal outcome of every load-out.

### 6. Sub-hire receiving and returning

Receiving somebody else's gear, keeping it separate, getting it back before its own rental period
ends. No native model in the asset tools ([#8478](https://github.com/grokability/snipe-it/issues/8478),
**[FACT]**); in the rental ERPs it is modelled inside one tenant as a PO line, with **no
cross-company availability** — the supplier is a contact, not a system (**[SECOND-HAND]**,
`event-rental-management.md`, "What NOBODY solves well", item 4). **Frequency:** *recurring*.

### 7. Label and tag production

See the tools table. Multiple label sizes hand-cut from one template
([#19541](https://github.com/grokability/snipe-it/issues/19541), 2026-08-24), grids that do not
print ([#13433](https://github.com/grokability/snipe-it/issues/13433)), and no human-readable text
under the 1D barcode ([#18280](https://github.com/grokability/snipe-it/issues/18280), 2025-12-03),
whose author gives the warehouse-floor reason for wanting it: *visual confirmation*, and **manual
entry when the barcode is damaged** **[FACT]**. **Frequency:** *recurring*.

### 8. Scanning micro-frictions that each cost seconds and collectively cost the shift

All **[FACT]**, all from primary trackers:

| Friction | Evidence | Date / state |
| --- | --- | --- |
| Scanner input **submits the whole form** instead of advancing to the next field | Snipe-IT [#17057](https://github.com/grokability/snipe-it/issues/17057) | 2025-05-31, closed 2025-10-27 |
| Scanned value comes back wrong (leading zeros: tag `00007` scans as `000000000079`) | Snipe-IT [#9877](https://github.com/grokability/snipe-it/issues/9877) | 2021-07, closed 2025-08 |
| Scanning on receiving **adds a duplicate row** instead of incrementing the existing one, because rows created from the order carry no barcode | ERPNext [#53589](https://github.com/frappe/erpnext/issues/53589) | 2026-03-18, open |
| Scan picks the **company default warehouse**, not the one the stock is actually in, forcing manual correction on every line | ERPNext [#49267](https://github.com/frappe/erpnext/issues/49267) | 2025-08-21, open |
| The phone **locks mid-scan**; user double-taps the screen to keep it awake | InvenTree app [#492](https://github.com/inventree/inventree-app/issues/492) | 2024-05, fixed 2024-12 |
| No barcode scanning in the **mobile browser** at all | Snipe-IT [#7036](https://github.com/grokability/snipe-it/issues/7036) — **open since 2019-05-17, 34 comments, still updated 2025-08-19** | 6+ years open |

**Frequency:** *widespread*. Six independent frictions, three trackers, and the flagship one has
been open for six years with 34 comments.

### 9. Chasing missing items mid-show

**unverified as to time cost.** No source read this session quantifies it. The corpus establishes
the mechanism (station 17: undocumented load-out → discovered days later, unattributable) but not
the hours. Recorded as a known gap rather than guessed at.

---

## Double data entry

What the warehouse types, or has typed on its behalf, into more than one place. Each row names the
break.

| # | Entered here | Re-entered there | Evidence |
| --- | --- | --- | --- |
| 1 | Technical plan / BOM (cable schedule, camera plan, lighting plot) in CAD, Visio, Excel | Rental ERP reservation → pick list | **[SECOND-HAND]** `workflow-chain.md` breaks 1–2; no Vectorworks ↔ rental-ERP integration was found in the landscape pass — the bridge is a **manual XLSX round-trip** (`event-rental-management.md`) |
| 2 | Paper pull sheet, ticked in pen | ERP, at end of shift | **[SECOND-HAND]** break 7 |
| 3 | Supplier delivery note for sub-hire (paper/PDF) | ERP as received stock, later matched to the supplier's invoice by hand | **[SECOND-HAND]** break 9 |
| 4 | Load-out list on site (paper, or nothing) | Check-in in the ERP | **[SECOND-HAND]** station 17–18 |
| 5 | Damage: photos in WhatsApp + a paper condition form | Damage record in the ERP, then an invoice line | **[SECOND-HAND]** station 18–19 |
| 6 | Warehouse hours / shifts | A second system (CrewBrain, easyjob) — the integration exists **because** the duplication was intolerable | **[SECOND-HAND]** CrewBrain↔easyjob interface, July 2025 blog post, explicitly *"so that data does not have to be maintained twice"* |
| 7 | Rented-in gear | Modelled by **creating a second company** in the asset tool, or per-model custom fields | **[FACT]** Snipe-IT [#8478](https://github.com/grokability/snipe-it/issues/8478) |
| 8 | Asset identity | Two identifiers per unit — the house's own reference and the manufacturer's serial. Rentman splits them deliberately; systems that offer one field make the warehouse choose, and then the insurance/sub-hire case needs the other one | **[SECOND-HAND]** `support.rentman.io/.../360013086279-Manage-Serial-Numbers` |
| 9 | Maintenance/test status (DGUV V3 in DE) | A separate inspection record, unless the ERP enforces it at booking time — Current RMS warns when an asset due for testing is allocated, which is the good pattern | **[SECOND-HAND]** `current-rms.com/features/testing-and-maintenance` |

**[INFERENCE], and the load-bearing one for this project:** rows 1 and 2 are the two entries the
warehouse pays for and did not cause. Row 1 is the gap AV Planner Suite is actually positioned to
close.

---

## Error sources

What goes wrong, and what it costs. Ordered by consequence.

### Silent exclusion during bulk operations

Snipe-IT [#18106](https://github.com/grokability/snipe-it/issues/18106) (2025-10-28, open, on the
maintainers' milestone as of 2026-08-17): in bulk checkout, an asset that is already checked out to
someone else *"does not display any Alerts. Also the Asset is excluded from the list."* The author's
own framing names the warehouse context: *"Especially if scanning multiple items."* **[FACT]**

**Cost:** the case leaves the building one item short, and nobody knows until the crew opens it.
This is the worst class of error in a warehouse because the feedback loop is the length of the job.
**Frequency:** *recurring* in evidence; **[INFERENCE]** the pattern (batch operation, partial
success, no summary of what was dropped) is general.

### The scan writes to the wrong place

ERPNext [#49267](https://github.com/frappe/erpnext/issues/49267): the scan resolves to the company's
default warehouse regardless of where stock actually is, producing an entry against a location with
zero stock; the requested fix includes *scanning a location barcode first to set the context*
**[FACT]**. **Cost:** stock records that are wrong in two places at once — phantom stock where the
item is not, a hole where it is.

### Receiving creates phantom quantity

ERPNext [#53589](https://github.com/frappe/erpnext/issues/53589) (2026-03-18, open): scanning on a
purchase receipt adds duplicate rows instead of incrementing, and quantities are pre-populated from
the order before anything is scanned **[FACT]**. **Cost:** in a rental context this is exactly the
sub-hire receiving path — you believe you have two of something you have one of.

### Keyed transcription

~1 error per 300 characters versus ~1 per 3 million scans (**[SECOND-HAND]**, vendor-sourced).
**Cost:** the error is discovered on site, or never.

### Unattributable damage and loss

The 03:00 load-out with no list, plus 24-hour damage reporting windows, equals an absorbed loss
(**[SECOND-HAND]**, stations 17–18). The primary layer shows the same gap from the tooling side:
Snipe-IT [#13153](https://github.com/grokability/snipe-it/issues/13153) (2023-06, open, updated
2025-10) asks for the maintenance record to log **who the asset was assigned to and where it was**
when the repair was raised, explicitly *"to see whether particular people/locations tend to break
devices more often"* **[FACT]**. **Cost:** the rental house eats it, and the pattern is never
detected.

### Warehouse substitutions that never reach the plan

A different model, a different connector, picked because the first choice was out. It is on the
paper and not in the plan; the systems engineer finds out on site (**[SECOND-HAND]**, station 12).
**Cost:** an adapter hunt at load-in, or a signal path that does not work.

### Late additions that break the truck

Volume and weight change; if the truck plan is not re-run the extra case travels in somebody's car
(**[SECOND-HAND]**, station 13 and the change-propagation case study). **Cost:** a car journey, a
late arrival, and an item outside the manifest.

### Label failure

Barcodes get scuffed, taped over, iced up. Without human-readable text under the code there is no
fallback but the item's own front panel — which is the argument
[#18280](https://github.com/grokability/snipe-it/issues/18280) makes explicitly **[FACT]**.

---

## Paper / Excel / WhatsApp inventory

Named artefacts. Everything here is **[SECOND-HAND]** unless marked, because the documents
themselves live in warehouses, not on GitHub.

### Paper

| Document | What it is | Source |
| --- | --- | --- |
| **Pull sheet / pick list**, printed | The working pick document, ticked in pen | Flex "Prepping a Pull Sheet"; `pick-lists-pull-sheets/` product page |
| **Pack list / Packliste**, printed | What goes in which case | Rentman product update on pack lists for items still to be packed; Rentman DE customer story (JK Veranstaltungstechnik) still packing from printed pack lists |
| **Loading sheet and check-in sheet** | Paper in/out at the dock | Point of Rental case study (Busylad Rent-All): paper loading and check-in sheets, duplicate processes, lost paperwork |
| **Truck manifest / delivery note** | What left, who signed | `workflow-chain.md` station 13 |
| **Load-out list** | Ticked in the dark at 03:00 | station 17 |
| **Damage / condition form** | Asset ID, photos from several angles, pre-existing damage, inside 24 h | station 18, citing TapGoods / InTempo / ShareGrid |
| **Supplier delivery note (sub-hire)** | Somebody else's paperwork, in your warehouse | station 5 / break 9 |
| **Label sheets (e.g. Avery)** | Asset tags and case labels | **[FACT]** Snipe-IT [#13433](https://github.com/grokability/snipe-it/issues/13433) |
| **Camera/kit prep checklists** | Printed PDFs worked through at prep | station 8, citing published prep-checklist PDFs |

### Excel

| Spreadsheet | Why it exists |
| --- | --- |
| **Truck load / volume / weight plan** | Because no product solves what fits in which case or how the truck packs (`event-rental-management.md`) |
| **Sub-hire cross-check sheet** | Because cross-hire is not integrated; companies cross-check by hand in separate spreadsheets (break 9) |
| **The inventory itself**, in freelancer and very small houses | Vendors market directly against it (`booqable.com/spreadsheets/`; German *Lagerverwaltung ohne Excel* posts) |
| **The CAD → ERP round trip** | Vectorworks equipment lists export to a spreadsheet; there is **no** Vectorworks ↔ rental-ERP integration, so the bridge is XLSX by hand |

### WhatsApp / chat

| Traffic | Consequence |
| --- | --- |
| Damage photos from site | The only evidence, held outside the record (station 18) |
| *"We're two DMX cables short"* | An unplanned pick, on nobody's list (station 12) |
| *"Who has the case for the long lens?"* | Mid-show search with no system answer (station 17) |
| Driver ETAs and delays | Transport reality that never reaches the transport plan (station 13) |
| Sub-hire negotiation with peers | The commercial fact starts in a chat and reaches the job file late, or not at all (break 9) |

### E-mail / PDF

Sub-hire POs out, supplier confirmations back, supplier invoices months later, matched by hand
against a job (stations 5 and 19).

---

## Missing interfaces

Handovers that break, in the order they hurt.

1. **Technical plan → warehouse pick list.** The plan says what the show needs; the ERP says what
   was reserved; the pick list is generated from the reservation. Nothing reconciles them. The
   corpus calls this *"the strongest case, and the gap no rental ERP fills"* (**[SECOND-HAND]**).
   Practically: the cable, camera and light plans know exactly which devices, cables, adapters and
   spares the show requires, and that BOM is re-typed by a human into a commercial system.
2. **Case / rack structure ↔ ERP item identity.** A rack is one thing to the warehouse and *n*
   things to the ERP. This project has already hit it head-on: cable-planner
   [#335](https://github.com/larszu/cable-planner/issues/335) (2026-05-29) specifies importing a
   Rentman **physical combination** as a rack while *keeping the individual Rentman equipment IDs of
   its contents*, and adopting the combination name as the rack name **[FACT]**. Sibling issue
   [#227](https://github.com/larszu/cable-planner/issues/227) records the matching identity problem:
   Rentman devices carry no ports, identically named local devices do, and the two must be linkable
   **[FACT]**.
3. **Load-out (site) → check-in (warehouse).** The list that should exist at 03:00 on site is the
   input to the count in the yard. It is usually paper, or absent (**[SECOND-HAND]**).
4. **Warehouse → finance.** A discrepancy found at check-in has to become an invoice line or an
   absorbed loss; the 24-hour window and the missing attribution decide which (**[SECOND-HAND]**).
5. **Warehouse ↔ supplier (sub-hire).** No cross-company availability exists anywhere in the
   segment; the supplier is a contact, and their gear is untracked stock in your building
   (**[SECOND-HAND]** + **[FACT]** Snipe-IT [#8478](https://github.com/grokability/snipe-it/issues/8478)).
6. **Warehouse ↔ crew system.** Solved *where an API exists* — CrewBrain↔easyjob is sold precisely
   on removing duplicate maintenance — and unsolved everywhere else (**[SECOND-HAND]**).
7. **Warehouse ↔ maintenance/compliance.** Best practice exists (Current RMS warns when an asset due
   for testing is allocated); it is not universal (**[SECOND-HAND]**).

---

## What they would want

Their own stated wishes, in their own framing, from issues read this session. Every line is
**[FACT]** with a date; none of it is my product opinion.

| Wish, as stated | Source | Date / state |
| --- | --- | --- |
| Hand over **the bag**, and have the lenses, audio, batteries and cards follow automatically — instead of half an hour of repetitive clicking | Snipe-IT [#9517](https://github.com/grokability/snipe-it/issues/9517) | 2021-04, open |
| Kits that contain **specific physical assets**, not just models — and a way to **check a kit back in** | Snipe-IT [#8539](https://github.com/grokability/snipe-it/issues/8539) | 2020-10, open, updated 2026-08 |
| Select assets from the list and bulk check them out; **give us a bulk check-in at all** | Snipe-IT [#14466](https://github.com/grokability/snipe-it/issues/14466) | 2024-03, open |
| Set the **status** (e.g. "in use", "damaged") during quick scan check-in and bulk check-out, instead of noting the items down and editing them one by one afterwards — *"Not practical"* | Snipe-IT [#14733](https://github.com/grokability/snipe-it/issues/14733) | 2024-05, open, updated 2026-08 |
| **Alert me** when I scan something that is already checked out, instead of silently dropping it | Snipe-IT [#18106](https://github.com/grokability/snipe-it/issues/18106) | 2025-10, open |
| During an audit, show **model and location** next to the scan result, and flag "found but in the wrong place" in a third colour — while still recording it as found | Snipe-IT [#8095](https://github.com/grokability/snipe-it/issues/8095) | 2020-05, open |
| Let me **move an item to another storage area** without faking a check-out and a check-in | Snipe-IT [#6743](https://github.com/grokability/snipe-it/issues/6743) | 2019, discussed into 2026 |
| Put the **rack / bin number on the pick list**, and cope with an item that lives in several racks | ERPNext [#47059](https://github.com/frappe/erpnext/issues/47059) | 2025-04, open |
| Let me **scan the location first** to set the context, then scan items into it | ERPNext [#49267](https://github.com/frappe/erpnext/issues/49267) | 2025-08, open |
| On scan, **advance to the next field** — do not submit the form | Snipe-IT [#17057](https://github.com/grokability/snipe-it/issues/17057) | 2025-05, closed |
| Print the **human-readable code under the barcode**, for visual confirmation and for manual entry when the barcode is damaged | Snipe-IT [#18280](https://github.com/grokability/snipe-it/issues/18280) | 2025-12, open |
| Save **several label profiles** (large / medium / QR-only) because the gear is different sizes — stop making us cut labels with scissors | Snipe-IT [#19541](https://github.com/grokability/snipe-it/issues/19541) | 2026-08, open |
| A **rented-vs-owned flag** with rental period, cost and supplier deposit, instead of inventing a second company | Snipe-IT [#8478](https://github.com/grokability/snipe-it/issues/8478) | 2020-09, open |
| Record **who had it and where it was** when a repair was raised, so damage patterns become visible | Snipe-IT [#13153](https://github.com/grokability/snipe-it/issues/13153) | 2023-06, open |
| A **signature on check-in**, not only on check-out | Snipe-IT [#19114](https://github.com/grokability/snipe-it/issues/19114) | 2026-05, open |
| **One signed document** for a whole bulk handover, not one per asset | Snipe-IT [#19070](https://github.com/grokability/snipe-it/issues/19070) | 2026-05, open |
| Scanning **from the phone browser**, without a native app | Snipe-IT [#7036](https://github.com/grokability/snipe-it/issues/7036) | 2019, open, 34 comments |
| Do not let the **screen lock** while the scanner is open | InvenTree app [#492](https://github.com/inventree/inventree-app/issues/492) | 2024-05, fixed |

The pattern in their own words, stated once: **they want the physical unit of work — the case, the
bag, the rack, the location — to be the unit the software operates on, and they want the software to
tell them loudly when it did not do what they asked.**

---

## Implications for AV Planner Suite

Ordered by leverage. Everything here is **[INFERENCE]** built on the evidence above; the corpus's
existing strategy note applies — do not try to become a rental ERP.

### 1. The case is the object. Build it that way, and keep the ERP's IDs inside it

The single most repeated wish in the primary layer is container-level operation, and this project has
already specified exactly the right semantics in cable-planner
[#335](https://github.com/larszu/cable-planner/issues/335): import a Rentman **physical combination**
as a rack, take the combination's name, and **keep the individual equipment IDs of its contents**.
Generalise that: a container (case, rack, bag, truck) is a first-class node with a stable ID, whose
children keep their own ERP identities and can be resolved individually. Anything else and the
warehouse cannot answer *what is in this case* without opening it.

### 2. Two identifiers per physical unit, decided before there is data to migrate

Rentman splits the **house's internal reference** from the **manufacturer serial** because they are
different keys with different uses (insurance, sub-hire, maintenance). The corpus's relevance table
already flags that `packages/inventory-core` has a single fixed `code` and **no per-unit serial
layer** — and that the per-unit layer is precisely where maintenance history, test due-dates and
damage attach (**[SECOND-HAND]**). Fix the wire format while it is cheap.

### 3. The plan → pick list bridge is the defensible gap, and the warehouse is its beneficiary

No rental ERP fills it and no CAD tool crosses it; the XLSX round trip is the state of the art.
A cable/camera/light plan that can emit a **case-aware, location-aware, connector-aware BOM** —
including adapters and spares, which are exactly what gets forgotten — removes double entry #1 and
the warehouse-substitution error class in one move. This is the suite's actual product claim for this
role.

### 4. Design for print, and design for scan-back

The pack list *will* be printed. Treat that as a requirement rather than a failure: a printed
artefact with a per-case code that can be scanned or photographed back in, so the pen-and-paper pass
is the input to the digital record rather than a second, contradictory record. The corpus already
names this as the achievable win: *a round trip* (**[SECOND-HAND]**).

### 5. Never fail silently on a batch

Snipe-IT #18106 is the cheapest lesson in this dossier. Any operation over a set — scan a case,
import a list, mark a rack packed — must end with an explicit account of what succeeded, what was
skipped, and why, in a form a person can act on while still standing in front of the shelf.

### 6. Offline is not a feature here, it is the operating condition

Only Flex and EZRentOut advertise offline scanning; the rest of the segment is cloud-only with
offline **UNKNOWN**, including Rentman (**[SECOND-HAND]**). The suite is offline-first by
architecture, which is a real and rare advantage for exactly this role — but note the corpus's sharp
observation that where offline exists it always covers *warehouse scanning* and never *planning*.
Ours can cover both.

### 7. Model "not ours"

Sub-hired and borrowed gear needs a first-class ownership flag (`owned / rented / subhire` with a
supplier and a return date), and it needs to be visible on the case, the pick list and the check-in
screen — because the failure mode is not losing it, it is **keeping it three weeks too long**.
`packages/inventory-core` already has `ownership` in the right shape (**[SECOND-HAND]**); make sure
it survives into every printed and scanned artefact.

### 8. Labels: human-readable text, several sizes, and a code that survives

Print the code as text under the barcode. Support at least three label geometries. Assume a
proportion of codes will be unreadable and make manual entry a first-class path, not a punishment.

### 9. Capture damage where and when it happens

Photo, asset, job, person, timestamp — at check-in, on the device that is already in their hand,
against a 24-hour clock. The attribution, not the photo, is the valuable part
(cf. Snipe-IT #13153).

### 10. Do not charge per warehouse seat

The segment has already settled this: Rentman's free basic users, Flex's per-location unlimited
users. A suite that meters warehouse logins would be dead on arrival in this role.

### What we should deliberately *not* build

Availability engines over a time axis, sub-rental commercials, crew costing, transport pricing,
invoicing. Decades of domain logic, already good, and not our claim (**[SECOND-HAND]**, the
landscape pass's own conclusion).

---

## Open questions this session could not answer

Listed so the gaps are visible rather than papered over. All **unverified**.

- **Wi-Fi dead zones in warehouses.** The brief asked specifically. No direct evidence was reachable.
  The only adjacent signals: offline scanning is marketed as a differentiator by two vendors
  (**[SECOND-HAND]**), and a 2017 Snipe-IT issue titled *"Wifi Bar Code Scanning"* exists but has an
  empty template body and was closed the same day — **not evidence**. The hypothesis (steel racking,
  concrete, roller doors and a metal-walled loading bay make coverage patchy, so offline queueing is
  mandatory) is plausible and **untested**.
- **Gloves, cold, one-handed operation, screen glare in a loading bay.** No source read.
- **Shift patterns, overtime and how much of the load-out/check-in cycle happens at night.** No
  source read; the corpus's "03:00" figure is illustrative prose, not measured.
- **German practice specifically** — VPLT material, *Veranstaltungstechnik* forums, DGUV V3 handling
  in the warehouse routine, film-tv-video.de and production-partner.de. All blocked. The German
  layer in this dossier is entirely second-hand from the corpus.
- **RFID in AV rental.** The corpus records HireTAG (Navigator) and EZRentOut RFID support and finds
  **no rental-industry EPC/EPCIS profile** (**[SECOND-HAND]**). Whether portal reads at the dock
  actually work in practice for flight-cased AV gear: unknown.
- **Quantified time cost** for missing-item chasing, damage assessment and re-shelving. Nobody
  measured it in anything I could read.

**Recommended next pass, when egress allows:** r/VIDEOENGINEERING and r/techtheatre threads on
warehouse/prep workflow; Blue Room and ControlBooth prep-and-return threads; Rentman and Flex help
centres read directly (their warehouse-app documentation is the closest thing to a spec for this
role); German *Veranstaltungstechnik* forums and VPLT material; and at least three job postings for
*Lagerist Veranstaltungstechnik* to establish the real toolchain and the real title.

---

## Sources

### Read directly this session (GitHub issue search API — title, body, dates, state)

**`grokability/snipe-it`** — IT/AV asset management; the dominant primary layer of this dossier.

- https://github.com/grokability/snipe-it/issues/9517 — check-in/out of attached assets; *"half an hour of repetitive clicking"*; camera/lens/audio/card kit (2021-04-30, open, updated 2025-08-18)
- https://github.com/grokability/snipe-it/issues/8539 — predefined kits with specific assets; parent-asset workaround; kit check-in time-consuming (2020-10-20, open, updated 2026-08-12)
- https://github.com/grokability/snipe-it/issues/14466 — bulk checkout of 100 devices; no bulk check-in (2024-03-20, open)
- https://github.com/grokability/snipe-it/issues/18230 — bulk checkout of accessories (2025-11-21, open)
- https://github.com/grokability/snipe-it/issues/18087 — check out a predefined kit to an asset, not only a user (2025-10-23, open)
- https://github.com/grokability/snipe-it/issues/17403 — predefined kits ignore company scoping (2025-07-15, open)
- https://github.com/grokability/snipe-it/issues/18106 — bulk checkout silently excludes already-checked-out assets (2025-10-28, open, milestoned 2026-08)
- https://github.com/grokability/snipe-it/issues/14733 — set asset status during quick scan check-in / bulk check-out (2024-05-17, open, updated 2026-08-04)
- https://github.com/grokability/snipe-it/issues/8095 — bulk audit shows only found/not-found; wants model, location, wrong-place state (2020-05-28, open, updated 2025-06-14)
- https://github.com/grokability/snipe-it/issues/6743 — location cannot change without check-out/check-in (2019-02-18, closed, commented into 2026-03)
- https://github.com/grokability/snipe-it/issues/12893 — check in to a location when creating an asset (2023-04-24, open)
- https://github.com/grokability/snipe-it/issues/7036 — barcode scanning in mobile browsers (2019-05-17, **open**, 34 comments, updated 2025-08-19)
- https://github.com/grokability/snipe-it/issues/17057 — scanner submits the form instead of advancing the field (2025-05-31, closed 2025-10-27)
- https://github.com/grokability/snipe-it/issues/9877 — barcode scans back the wrong number (leading zeros) (2021-07-29, closed 2025-08-11)
- https://github.com/grokability/snipe-it/issues/11616 — scan pre-existing ID cards to identify the person at handout (2022-08-04, open)
- https://github.com/grokability/snipe-it/issues/17699 — QR scanner request (2025-08-21, closed as duplicate)
- https://github.com/grokability/snipe-it/issues/19541 — multiple label profiles; labels currently cut by hand (2026-08-24, open)
- https://github.com/grokability/snipe-it/issues/18280 — no human-readable text under the 1D barcode; manual entry when damaged (2025-12-03, open)
- https://github.com/grokability/snipe-it/issues/13433 — label sheet does not print in the configured grid (2023-08-09, open, updated 2025-08)
- https://github.com/grokability/snipe-it/issues/8385 — asset-tag generation schemes (2020-08-28, open, updated 2026-06)
- https://github.com/grokability/snipe-it/issues/8478 — rented vs owned assets; two-companies workaround (2020-09-28, open, updated 2025-08-19)
- https://github.com/grokability/snipe-it/issues/13153 — log who had the asset and where when maintenance was raised (2023-06-12, open, updated 2025-10)
- https://github.com/grokability/snipe-it/issues/17986 — maintenance duration field (2025-10-06, open)
- https://github.com/grokability/snipe-it/issues/14324 — separate fields for fault and work done on maintenance (2024-02-23, open)
- https://github.com/grokability/snipe-it/issues/10282 — consume a consumable during maintenance (2021-11-08, open)
- https://github.com/grokability/snipe-it/issues/19114 — signature on check-in, not only check-out (2026-05-29, open)
- https://github.com/grokability/snipe-it/issues/19070 — one signed document for a bulk handover (2026-05-26, open)
- https://github.com/grokability/snipe-it/issues/17536 — show what is currently checked out to a given asset (2025-08-07, open)
- https://github.com/grokability/snipe-it/issues/18994 — cannot correct a mis-assigned consumable (2026-05-10, open)
- https://github.com/grokability/snipe-it/issues/16154 — asset shows the wrong parent location (2025-01-30, closed)
- https://github.com/grokability/snipe-it/issues/6893 — check out against a booking barcode from another system (2019-04-07, closed)
- https://github.com/grokability/snipe-it/issues/1624 — annual inventory by scanning (2016-01-13, closed)
- https://github.com/grokability/snipe-it/issues/3819 — "Wifi Bar Code Scanning" (2017-08-03, closed same day, **empty body — not usable as evidence**)
- https://github.com/grokability/snipe-it/issues/7033 — network discovery import (2019-05-16, closed) — context only
- https://github.com/grokability/snipe-it/issues/12615, /5524, /2271 — read, not used

**`frappe/erpnext`** — stock, pick list, barcode scanning.

- https://github.com/frappe/erpnext/issues/47059 — rack/bin on the pick list; one item in multiple racks (2025-04-14, open)
- https://github.com/frappe/erpnext/issues/49267 — scan resolves to the wrong warehouse; asks for location-first scanning (2025-08-21, open)
- https://github.com/frappe/erpnext/issues/53589 — scan on receipt duplicates rows instead of incrementing (2026-03-18, open)
- https://github.com/frappe/erpnext/issues/48278 — maintainer's list of pick-list defects and enhancements (2025-06-26, open, updated 2026-08-19)
- https://github.com/frappe/erpnext/issues/17462 — assign parts of an order to individual warehouse staff (2019-05-02, open, updated 2026-08)
- https://github.com/frappe/erpnext/issues/44873 — populate source warehouse by scanning a batch (2024-12-24, open)
- https://github.com/frappe/erpnext/issues/34514, /57858 — read, context only

**`inventree/InvenTree`, `inventree/inventree-app`**

- https://github.com/inventree/inventree-app/issues/492 — prevent the phone locking while the scanner is open (2024-05-15, fixed 2024-12)
- https://github.com/inventree/inventree-app/issues/615 — choose the default scanning camera (2025-02-18, open)
- https://github.com/inventree/inventree-app/issues/649 — scanner reads nothing, no feedback on success/failure (2025-06-04, closed as duplicate)
- https://github.com/inventree/InvenTree/issues/10986 — mobile web access for stock management (2025-12-09, closed wontfix)

**`openboxes/openboxes`** — humanitarian WMS; weak transfer, read for the pick/pack vocabulary.

- https://github.com/openboxes/openboxes/issues/197, /229, /236, /3575

**`larszu/cable-planner`** — this project's own tracker, read directly **[FACT]**.

- https://github.com/larszu/cable-planner/issues/335 — import a Rentman physical combination as a rack while keeping the contents' individual Rentman equipment IDs (2026-05-29)
- https://github.com/larszu/cable-planner/issues/227 — link Rentman devices (no ports) to identically named local devices (with ports) (2026-05-19)
- https://github.com/larszu/cable-planner/issues/167 — Rentman import also carries `powerWatts`, `weightKg`, `depthMm` (2026-05-17)
- https://github.com/larszu/cable-planner/issues/354 — further rental/inventory integrations plus a generic equipment CSV import (2026-05-29)
- https://github.com/larszu/cable-planner/issues/320, /401, /497, /498 — context only

### Read directly this session (files in this repository)

- [`docs/research/METHOD.md`](../METHOD.md)
- [`docs/research/workflow-chain.md`](../workflow-chain.md)
- [`docs/research/landscape/event-rental-management.md`](../landscape/event-rental-management.md)
- [`docs/research/roles/`](.) — sibling dossiers, grepped for warehouse-adjacent findings

### Cited second-hand via the corpus — **not opened this session** (egress blocked)

These URLs are carried from `workflow-chain.md` and `landscape/event-rental-management.md`, where
they were recorded in an earlier session. They are listed so every claim above can be traced and
re-verified when the network allows.

Rental ERP / warehouse product documentation:

- https://rentman.io/de/kunden/erfahrungsberichte/jk-veranstaltungstechnik — customer story: printed pack lists
- https://rentman.io/de/produktupdates/erstelle-packlisten-fur-items-die-noch-gepackt-werden-mussen
- https://rentman.io/de/losungen/materialtracking
- https://rentman.io/solutions/rental-equipment-tracking-software
- https://rentman.io/blog/barcode-vs-rfid-vs-qr-for-av-rental-inventory-tracking
- https://support.rentman.io/hc/en-us/articles/360013478180-Scanner-Options-in-Rentman
- https://support.rentman.io/hc/en-us/articles/360014365179-Rentman-Mobile-App
- https://support.rentman.io/hc/en-us/articles/360013086279-Manage-Serial-Numbers
- https://support.rentman.io/hc/en-us/articles/360013703140-Create-equipment-sets-kits-cases-and-accessories
- https://support.rentman.io/hc/en-us/articles/4402870209682-Equipment-Combinations-and-How-to-Work-with-Them
- https://rentman.io/pricing — free basic users, per-power-user charging
- https://www.flexrentalsolutions.com/event-rental-software-features/inventory-management/pick-lists-pull-sheets/
- https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/360054924294-Prepping-a-Pull-Sheet
- https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/360056729133-Free-Scan-Out
- https://www.flexrentalsolutions.com/event-rental-software-features/warehouse-logistics/
- https://www.flexrentalsolutions.com/event-rental-software-features/warehouse-logistics/trucking-transportation/
- https://www.flexrentalsolutions.com/plan-pricing/ — per-location, unlimited users
- https://www.current-rms.com/features/inventory-management
- https://www.current-rms.com/features/testing-and-maintenance — warning when an asset due for testing is allocated
- https://help.current-rms.com/en/articles/402491-create-stock-levels-for-your-products
- https://www.point-of-rental.com/resources/case-studies/ and https://www.point-of-rental.com/case-study/event-essentials/ — paper loading and check-in sheets
- https://booqable.com/barcode-scanning/, https://booqable.com/blog/barcode-types-rental-equipment/, https://booqable.com/spreadsheets/
- https://ezo.io/ezrentout/ — offline work logs syncing on reconnect
- https://www.hiretracknx.com/product-introduction/hiretrack-nx/ — HireTAG RFID
- https://innovation-product-documentation.azurewebsites.net/RMS%20Cross%20Rental.html — cross-rental process

Damage, returns, warehouse data entry and picking errors:

- https://www.tapgoods.com/pro/blog/tool-equipment-rental-software/equipment-rental-inventory-tracking/damaged-equipment-report/
- https://www.intemposoftware.com/blog/what-happens-customer-returns-damaged-rental-equipment
- http://support.sharegrid.com/en/articles/733935-what-if-my-equipment-has-visible-damage-or-missing-items
- https://wisys.com/blog/warehouse-scanner-roi-what-the-data-actually-shows — keyed vs scanned error rates
- https://www.optioryx.com/blog/order-entry-automation — hours per day lost to re-keying
- https://www.dynamicsmobile.com/solutions/warehouse — hybrid paper plus end-of-shift entry
- https://xorosoft.com/warehouse-picking-errors/
- https://www.netsuite.com/portal/resource/articles/erp/prevent-picking-errors-in-warehouse.shtml
- https://www.withvector.com/blog/pick-ticket-the-what-why-examples-everything-to-know/
- https://alignops.com/blog/what-is-a-pick-ticket
- https://pacificbarcode.com/blog/complete-warehouse-labeling-best-practices-guide-checklist/
- https://camcode.com/blog/how-to-implement-barcodes-in-your-warehouse-a-step-by-step-guide/

German-language (all second-hand; no German source was reachable this session):

- https://www.rocon.info/blog/lager-4-0
- https://base.com/de-DE/blog/lagerverwaltung-optimieren/
- https://www.kmu-erp.at/kontakt-anfrage/blog/lagerverwaltung-ohne-excel-so-vermeiden-kmu-fehlbestaende-und-totes-kapital
- https://www.cosys.de/lagerverwaltungssoftware-fuer-kleine-unternehmen
- https://rentman.io/de/blog/dguv-v3-prufung
- https://www.crewbrain.com/de/features/schnittstellen/easyjob-protonic/ and https://en.blog.crewbrain.com/2025/07/efficient-personnel-planning-the-interface-between-crewbrain-and-easyjob-at-a-glance/

Planning-side boundary (for the plan → pick list gap):

- https://app-help.vectorworks.net/2025/eng/VW2025_Guide/LightingDesign2/Managing_and_reporting_equipment_lists.htm
- https://app-help.vectorworks.net/2022/eng/VW2022_Guide/Export/Exporting%20lighting_device_data.htm
- https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/gs1-barcodes
- https://ararental.org/Standard-Equipment-Taxonomy

### Sibling dossiers referenced

- [`docs/research/METHOD.md`](../METHOD.md)
- [`docs/research/workflow-chain.md`](../workflow-chain.md)
- [`docs/research/landscape/event-rental-management.md`](../landscape/event-rental-management.md)
- [`docs/research/roles/lighting-tech.md`](./lighting-tech.md), [`camera-operator.md`](./camera-operator.md), [`technical-director.md`](./technical-director.md)
