# Real-world production workflow and its media breaks

The chain from a customer's first e-mail to the archived project folder, station by station,
with every point where information leaves one system and has to be re-entered somewhere else.

---

## Method and sources

**Search passes.** Twenty-two distinct web searches were run in August 2026, in English and
German, across five families of source: rental/ERP vendor marketing and documentation
(Rentman, Flex Rental Solutions, Current RMS, HireHop, Point of Rental, easyjob, CrewBrain,
Eventworx, Xytech, farmerswife), primary technical documentation (Vectorworks/Lightwright data
exchange, ETC Eos import, grandMA3 show file handling, Clear-Com EHX, Riedel Director, NetBox,
Dante), practitioner-facing trade writing (ProSoundWeb, ControlBooth, Gearspace, tour-manager
and stage-management guides), structured review sites (Capterra), and an academic oral-history
project on UK outside broadcast (ADAPT).

**A hard limitation, stated up front.** Direct page fetching was blocked by this sandbox's
network egress proxy for every domain attempted — reddit, ControlBooth, ProSoundWeb, Rentman,
Flex's help centre, Cheqroom, Wikipedia and ACM all refused. **No page cited in this document
was opened and read in full.** Every factual claim below therefore comes from the search
backend's summary of a page, which is one remove from the source. Under the corpus rubric in
[`METHOD.md`](METHOD.md) this downgrades the entire document: treat it as a **map of where to
look**, not as verified evidence. Any claim that will drive a build decision must be re-read
against the primary page first.

**What this makes thin.** The practitioner voice is the weakest part of this document. Reddit
(r/VIDEOENGINEERING, r/livesound), ControlBooth, Blue Room and ProSoundWeb threads were
surfaced by search but could not be opened, and the search engine repeatedly failed to return
forum threads at all for `site:`-style queries. The result is a document weighted toward
**vendor marketing**, which is reliable for *what exists* and systematically silent on *what is
missing*. Several of the strongest-looking claims below (the JK Veranstaltungstechnik printed
pack lists, the Busylad paper check-in sheets) are vendor case studies — i.e. a vendor
describing a customer's old process in order to sell the fix. They are directionally useful and
motivationally suspect. A second pass with forum access is required before the rankings in this
document are trusted.

**Labels** follow `METHOD.md`:

- **[FACT]** — stated on the cited page, as reported by the search summary of that page.
- **[INFERENCE]** — a conclusion drawn from facts, flagged as reasoning.
- **[UNKNOWN]** — could not be established; left visible.

**Frequency grades** follow `METHOD.md`: `isolated` (one source) / `recurring` (several
independent sources of different types) / `widespread` (a well-known theme, often conceded by
vendors themselves).

**Dates.** Where a source is visibly old it is marked. Notable: the ADAPT outside-broadcast
material documents **1970s** practice and is used only for the *shape* of OB planning, not its
current tooling; the RF Venue coordination post is from **2017**; the David Elkins camera prep
checklist is **2012**; the "Venue Tech Packs" post is **2019**. Vectorworks/Lightwright bug
reports referenced specific versions (VW 2009/2010, pre-2015, 2021) and several are presumably
fixed — they are cited as evidence that *this class of break exists*, not that it exists today.

---

## Variants

The chain is the same shape everywhere. What differs is **how many systems the information has
to cross**, and that — not company size as such — is what determines the cost of a change.

### Freelancer (one person, own kit or dry hire)

Enquiry, quote, plan, pack, drive, rig, operate, invoice — all in one head. Tooling is typically
a spreadsheet inventory, a Word or template-generated quote, a note app, and e-mail
([FACT] freelance quote/invoice templates in Word/Excel/PDF are a large template market —
Refrens, Zoho, QuickBooks, Invoice Simple; *widespread*). The whole chain has perhaps three
artefacts: a quote PDF, a gear list, an invoice.

**The breaks are few but total.** There is no handover, so nothing is lost in translation — but
there is also no redundancy: the plan exists only in the freelancer's memory, and the "system of
record" for what was actually used on site is the pile of cases in the van. When a change comes
in, one person updates one list and re-packs; cost is minutes, not documents. When that person
is ill, the project is unrecoverable. [INFERENCE] The freelancer's real media break is
**memory → nothing**: no as-built, no reusable template for the next identical job, so job
number two costs the same as job number one.

### Small rental house (roughly 2–15 people)

Has an ERP (Rentman, Current RMS, HireHop, Booqable, easyjob at the upper end), and has Excel
everywhere the ERP stops: technical planning, cable lists, RF plans, IP plans, truck loading.
[FACT] Vendor marketing explicitly positions itself against "spreadsheets" as the incumbent
(Booqable's *Equipment Spreadsheets vs Dedicated Rental Software*; NetBox's IPAM pitch; multiple
German *Lagerverwaltung ohne Excel* posts); *widespread*.

Crew scheduling is often a second system or a WhatsApp group. Warehouse work is often still
paper: [FACT] Point of Rental's case study of Busylad Rent-All describes paper loading and
check-in sheets in the warehouse producing duplicate processes and lost paperwork; [FACT] a
Rentman German customer story reports JK Veranstaltungstechnik still packing from **printed**
pack lists (*vendor case studies, treat as motivated*; *recurring*).

**This is the variant with the worst ratio of systems to staff.** One project manager personally
carries information across five or six boundaries, by hand, in the evenings.

### Large rental house (roughly 50+ people, multiple warehouses)

Same ERP, but now with barcode scanning, a real warehouse team, a separate crew system, a
separate finance system, and sub-hire relationships with peers. [FACT] CrewBrain documents a
production API integration with easyjob (protonic) in which projects, jobs and personnel
requirements flow from easyjob to CrewBrain and booking/resource status plus absences flow back,
explicitly so that data does not have to be maintained twice; CrewBrain lists ready-made
interfaces to twelve systems including Eventworx, easyjob, Epirent, Rentman and Jobtura
(*blog post dated July 2025*).

So the commercial half of the chain is genuinely integrated here. **The technical half is not.**
The systems engineer's cable schedule, rack elevations, router configuration, multiviewer layout
and comms plan live in CAD, Visio, Excel and device-proprietary config files that the ERP has
never heard of. [INFERENCE] The large house has solved *quote → warehouse → invoice* and has not
solved *quote → technical design → device configuration*, which is precisely the segment this
suite targets.

### OB / broadcast (OB van, flypack, remote production)

A different chain shape. The commercial entry point is often a **facilities request or a
long-running service contract**, not a one-off quote, and it is scheduled in a facilities/
resource ERP rather than a rental ERP — [FACT] Xytech MediaPulse (which absorbed ScheduALL after
Xytech's acquisition; ScheduALL is discontinued and MediaPulse is the upgrade path) and
farmerswife are the named products for scheduling facilities, crew, rooms and OB vans.

Technical planning is heavier and starts earlier. [FACT] The ADAPT project's account of OB
technical planning describes the core team visiting the location before the trucks arrive: the
producer maps camera positions and the shots wanted from each, briefs microphone positions; the
engineering manager and the truck owner establish which cable types must run from each camera
back to the truck and where cables can physically be fed through the building; power capacity
for truck, lighting rig and cameras is checked (*documents 1970s practice — the shape is
current, the tooling is not*). [FACT] Flypack vendors describe their product as a fully
engineered system with signal paths, power, cooling, cable dressing, labelling and workflow
designed, documented and tested as a unit, and NEP lists concept drawings, system layouts,
camera plans and production room layouts as deliverables.

The extra stations OB adds that the corporate-event chain does not have: **camera plan with
positions and lens packages**, **cable schedule with drum/run allocation**, **router source and
destination naming**, **multiviewer layout**, **tally and UMD map**, **comms/intercom
configuration**, **transmission/contribution path booking**, **record/ISO map**. Each of those is
a separate document in a separate tool. [INFERENCE] OB therefore has roughly twice as many
boundaries as corporate AV, which is why late changes are disproportionately expensive there.

### In-house corporate AV (university, hotel, corporate campus)

The chain starts with a **form or a ticket**, not a quote. [FACT] Institutional AV teams publish
service request forms with lead-time rules — Tufts IT runs an A/V and video conferencing service
request; Trinity College's LITS charges a late fee for services requested less than 48 hours
before an event; room-and-equipment booking platforms let staff book AV gear alongside the room
(*recurring across institutions*).

There is no invoice at the end, or only an internal recharge, so the chain's *commercial* end is
short. But the technical end is long and the inventory is fixed and shared: the same room and the
same kit serve fifty events a month. [INFERENCE] The dominant break here is **request form →
technician's own list**: the form captures "we need a mic and a projector", the technician
translates that into a real setup, and that translation is never written down, so the next
technician for the same recurring meeting starts over. Room-level as-built documentation is the
one thing this variant needs most and produces least.

---

## Station-by-station table

Excel / Paper / Messaging columns: **Y** = commonly the primary carrier; **partly** = used
alongside a system; **rare** = happens, but not the norm.

| Station | Typical software | Excel? | Paper? | Messaging? | Data crossing the boundary | How it crosses | What breaks on change |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **1. Customer enquiry** | E-mail, phone, CRM (rarely), web form; institutional AV: request form / ticket | partly (client's own requirement list) | rare | **Y** — phone and WhatsApp for "can you do the 14th?" | Dates, venue, headcount, a rough wish list, budget hint | Free text in an e-mail body, a forwarded floor plan, a verbal call | Nothing yet — but an unrecorded verbal promise here becomes an unpriced line item at station 19 |
| **2. Quote / proposal** | Rental ERP quoting (Rentman, Current RMS, HireHop, easyjob, Flex); freelancer: Word/template | **Y** for anything the ERP prices badly (labour matrices, travel, complex discounts) | delivered as PDF | **Y** for chasing approval | Priced line items, crew days, delivery; often bundled "packages" | **PDF to the client**; internally the ERP record | Client says "cheaper" → items are cut in the quote, and the technical plan built from the old version is silently wrong |
| **3. Order / project setup** | Same ERP: quote converted to project/order | partly | signed quote or PO, scanned | **Y** — "we're confirmed, go" | The accepted line items become a reservation | One-click inside the ERP (this boundary is *solved*); e-mail/PO from the client is not | Late scope change after conversion means two records (quote vs order) can disagree |
| **4. Crew** | CrewBrain, Rentman crew module, easyjob personnel, farmerswife/Xytech (broadcast); many still Excel + WhatsApp | **Y** in small houses | printed crew list on the truck | **Y — dominant.** Availability, swaps and "who's driving" happen in WhatsApp | Names, roles, call times, hours, qualifications, travel | ERP→crew tool via API where it exists ([FACT] CrewBrain↔easyjob, 12 documented interfaces); otherwise copy-paste and a group chat | A call-time change propagates as a *new message*, not a new record; the printed crew list on the truck is now wrong |
| **5. Equipment / availability / sub-hire** | ERP availability, conflict checking, cross-hire module | **Y** for the shortage list and supplier comparison | supplier delivery notes | **Y** — sub-hire is negotiated by phone/WhatsApp with peers | Item + quantity + period; for sub-hire also supplier, price, pickup | Inside the ERP for own stock; **e-mail + PO + supplier's own paperwork** for sub-hire ([FACT] cross rental = cross hire = sub rental = re-rental; ERPs model it as a PO line against the rental order) | Shortage discovered late → sub-hire chain starts outside the job file; [FACT] without an integrated cross-hire, companies are blind to external shortages and cross-check by hand in separate spreadsheets |
| **6. Technical planning** (system design, racks, power, rigging) | Vectorworks, AutoCAD, Visio, WireCAD, tvCAD, rack tools; venue drawings as PDF/DWG | **Y — heavily.** Equipment lists, power calculations, weight/load | **Y** — printed plans on site, marked up in pen | partly | Rack elevations, power/load figures, rigging points, positions, BOM | **Re-typed** from the quote into a technical list, then **re-typed back** as a corrected BOM | The commercial list and the technical list are two documents; a change to either does not touch the other. This is the single most expensive boundary in the chain |
| **7. Signal planning** (SDI/IP routing, patch, MV, comms) | Visio/CAD, WireCAD, tvCAD, purpose-built planners; router and MV config in device software; comms in Clear-Com EHX or Riedel Director | **Y — dominant** for cable schedules and patch lists ([FACT] Excel is the common carrier for patch lists; cable schedule Excel templates are a template market) | **Y** — printed cable schedule in the rack room, cable labels | rare | Cable ID, source device + port, destination device + port, type, length, signal format, connectors, routing notes ([FACT] AVIXA/integrator practice) | **Typed by hand into device config**: router source/destination names, MV window labels, UMD/tally text, comms panel keys. [FACT] EHX downloads and uploads configurations to the matrix for offline editing or live change | A renamed source has to be corrected in the drawing, the router, the MV, the tally and the comms panel labels — five places, no link between them |
| **8. Camera** | Camera plan in CAD; RCP/CCU assignment at the device; lens lists in Excel; camera prep checklists | **Y** — camera/lens/accessory lists | **Y — strongly.** [FACT] Camera prep checklists are published as PDFs to be printed and worked through (Elkins 2012, Telling) | **Y** — position changes at load-in are verbal | Position, lens, mount, control channel, tally number, ISO record channel | Verbal on site + a marked-up plan; numbering re-typed into CCU, MV and record map | Adding or moving one camera touches plan, cable schedule, router, MV, tally, comms, record map and the pick list — see the case study below |
| **9. Light** | Vectorworks Spotlight (plot), Lightwright (paperwork), console (ETC Eos, grandMA3), previz (Capture, MA3D) | **Y** — still, for gear counts and truck loads | **Y — strongly.** Printed hookup, magic sheet, channel list; marked up during focus | partly | Fixture, position, unit number, channel, address, purpose, colour, accessories | [FACT] A **file-based data exchange** (VW↔LW via an XML file), then an **export/import** into the console ([FACT] Lightwright 6 patches an Eos console from Lightwright data with field-by-field mapping; requires a minimum Eos version) | [FACT] The VW/LW link is documented as fragile: duplicated fixtures producing duplicate UIDs, two open files writing to the wrong XML, Dropbox byte-sync corrupting the exchange file, moving files breaking the link silently, and a reconcile dialog when the two disagree. Changes made **at the console during tech** do not flow back: [FACT] users request exactly this (edit circuit/dimmer info on the console during tech, export CSV, merge into Lightwright) as a *feature request* |
| **10. Audio** | Console offline editor + show file; input list in Excel; stage plot tools; Wireless Workbench for RF | **Y — dominant** for input lists and patch | **Y** — printed input list taped to the stage box; [FACT] a **one-page RF sheet** with channel name, performer/position, pack type and a blank for the final frequency acts as the hub for coordination, rehearsal and handoff to stage management | **Y** — the band's changes arrive by WhatsApp | Channel number, source, mic/DI, phantom, stand, monitor mix, frequency | Client's **tech rider PDF → re-typed** into the house input list → typed into the console; RF plan → **written on the paper RF sheet** → typed into receivers | [FACT] The classic advance failure is a promoter holding an old PDF, a newer e-mail and three band members giving different answers; [FACT] stage crew may have printed the attachment before they see the follow-up e-mail. One inserted channel renumbers everything downstream |
| **11. Network / IP** | Excel; NetBox at the sophisticated end; Dante Controller; switch configs | **Y — dominant** | printed IP sheet in the rack | rare | Subnets, VLANs, device IPs, PTP domain, switch port map | Typed from the spreadsheet into every device by hand | [FACT] Spreadsheet IPAM is described as error-prone and unscalable, with duplication that a data model would prevent. A late device addition means a free IP is invented on site and never written back |
| **12. Packing / prep / QC** | ERP pick list / pull sheet with barcode scanning | partly | **Y — very strongly.** [FACT] Pull sheets are printed and worked through; [FACT] a vendor case study reports a customer still packing from printed pack lists; [FACT] hybrid warehouses with printed pick lists plus end-of-shift data entry are described as a persistent pattern | **Y** — "we're two DMX cables short" | Item, quantity, serial, accessories, case assignment | Barcode scan (good) or **paper ticked in pen and keyed in later** (bad). [FACT] Keyed data is reported at roughly one error per 300 characters versus roughly one per 3 million barcode scans | A substitution made in the warehouse (different model, different connector) is on the paper and not in the plan; the systems engineer finds out on site |
| **13. Transport / load list** | ERP truck sheets; load planning tools; Excel | **Y** | **Y** — printed manifest, delivery note signed by the driver | **Y** — ETAs and delays | Case list, weights, dimensions, stacking order, addresses, times | [FACT] Truck sheets built from pick lists in integrated systems; [FACT] paper manifests are the incumbent that vendors position against | A late addition changes volume and weight; if the truck plan is not re-run the extra case does not fit and travels in a car |
| **14. Load-in / setup / rig** | Printed plans, the ERP's mobile app if there is one | partly | **Y — dominant.** Plans, cable schedules, risk assessments, sign-off sheets | **Y — dominant.** Photos of the rack back, "where is the fibre drum" | Reality: what was actually rigged, where, with what length | **Nothing crosses back.** Changes are made in pen on the printed plan | [FACT] The construction-industry analogue is well documented: redlines are field mark-ups on printed drawings and frequently never get incorporated, so what the owner receives at closeout is the design intent, not the as-built. AV drawings follow the same format and the same failure |
| **15. Rehearsal / tech / soundcheck** | Consoles, show files, note apps; theatre: rehearsal report | partly | **Y** — the notes pad, the marked-up running order | **Y** | Changes: cues, patch, positions, timings, additions | [FACT] In theatre this is formalised: the stage manager writes a rehearsal report recording notes that affect other departments and mails it daily to a distribution list. Outside theatre it is verbal + WhatsApp | The change lands in the console and in someone's head. The plan, the paperwork and the ERP never learn about it |
| **16. Show** | Console/switcher show files, automation, comms | no | **Y** — the running order, the shot list, the RF sheet | **Y** — but discipline says no chat during the show | Show state; ISO records; incident notes | Verbal on comms; nothing is written | A show-time change (a camera dies, a channel is repatched) is recovered by the operator and is invisible to every document |
| **17. Load-out** | ERP mobile scanning, otherwise paper | partly | **Y — dominant.** The load-out list, ticked in the dark, in the rain | **Y** — "who has the case for the long lens?" | What is going back, what is damaged, what is missing | Ticked paper, photos in a chat, a verbal handover to the driver | Anything not written down at 03:00 is discovered days later at check-in and cannot be attributed to a job or a person |
| **18. Return / check-in** | ERP check-in with scanning; damage report forms | partly | **Y** — damage forms, condition checklists | **Y** — photos of damage | Returned quantities, missing items, damage, condition, photos | Scan against the checkout list where scanning exists; otherwise re-keyed from paper. [FACT] Damage reports are expected to carry asset ID/serial, photos from multiple angles and pre-existing damage; short reporting windows (24 h) are common | A discrepancy found here has to be turned into money at station 19; if the load-out list was paper and vague, the loss is unattributable and absorbed |
| **19. Invoice** | ERP invoicing → accounting (Lexware, DATEV, Xero, QuickBooks) | **Y** for anything the ERP cannot compute | invoice PDF, signed delivery notes as evidence | **Y** — chasing approval for extras | Final quantities, extra labour hours, sub-hire costs, damage/loss charges | ERP → accounting export or re-typing; sub-hire supplier invoices arrive as **PDFs by e-mail** and are matched by hand | Every undocumented change from stations 14–18 is an argument. [FACT] Change-order terms exist precisely because of this: a change order is defined as any modification to the approved proposal, estimate, invoice, schedule, equipment list, labour schedule, venue requirements or scope after client approval, with third-party sourcing costs and rush fees passed on |
| **20. Documentation / archive** | Project folder on a server, show files on USB sticks, photos on phones | partly | **Y** — the marked-up printed plans, if anyone keeps them | photos live in the chat and die there | The as-built truth of the job | [FACT] grandMA3 show files live on the internal drive or a USB stick, and a show saved forward into a newer software version cannot be taken back to the old one; [FACT] the recommended practice is periodic save-as under new names and two USB sticks stored separately | Nothing breaks — that is the problem. Next year the same event is re-planned from the *quote*, not from what was actually built, and every on-site fix is rediscovered |

---

## The media breaks, ranked by cost

Ranked by *cost per occurrence × frequency*, with the caveat from the Method section: this
ranking is [INFERENCE] built on vendor-reported and documentation-reported facts, not on
measured field data. "Who pays" is the role that absorbs the unbilled time.

### 1. Commercial quote → technical equipment list

**What is lost:** the quote is priced in commercially convenient units — packages, day rates,
"lighting package", "audio package". [FACT] Industry guidance treats bundled package lines as a
warning sign and expects a 150–300 person corporate event to show 20–40 line items, with fewer
than 15 meaning things are bundled that should not be. The technical plan needs models, counts,
connector types, lengths, spares and the adapters nobody quotes.
**Who pays:** the project manager or systems engineer, rebuilding the list by hand.
**How often:** every project. *widespread*.

### 2. Technical plan → warehouse reservation

**What is lost:** the plan knows the job needs 14 BNC runs of a given length and a specific
converter; the ERP reservation knows "camera package". Cables, adapters, spares, distros and
consumables are the classic omission.
**Who pays:** the warehouse lead, improvising at pack time; then the crew on site.
**How often:** every project. *widespread*. [INFERENCE] — this boundary is not well documented
publicly because no vendor sells both ends of it.

### 3. On-site reality → nothing (the as-built that never happens)

**What is lost:** every substitution, re-route, re-patch and repositioning made between load-in
and show.
**Who pays:** the *next* project team, and the client who is billed for rediscovery.
**How often:** every project. *widespread* by analogy — [FACT] the construction/AV redline
literature states plainly that redlines frequently never make it into the as-builts and that
what owners receive at closeout is the design intent.

### 4. Late change → N documents with no propagation

**What is lost:** the guarantee that all downstream documents agree. See the case study below.
**Who pays:** the project manager, in the evening, and then whoever finds the one document that
was missed, on site.
**How often:** [FACT] the industry has institutionalised it — change-order clauses, 48-hour late
fees, and the advice to reconfirm every vendor two days out. *widespread*.

### 5. Design application → device configuration

**What is lost:** the link between the drawing and the machine. Lighting has the most mature
bridge and it is still a file-based export/import; routers, multiviewers, comms matrices and
network switches are configured by typing.
**Who pays:** the systems engineer / programmer, on site, under time pressure.
**How often:** every technical build. *widespread*. [FACT] Documented for VW↔LW↔Eos; [FACT]
EHX and Director are offline configuration editors that upload to the matrix, i.e. the plan and
the config are different artefacts by design.

### 6. Console / device changes → back upstream

**What is lost:** the changes made at the console during tech never reach the paperwork.
**Who pays:** the assistant/associate re-typing the paperwork after the show, or nobody — in
which case the paperwork is simply wrong forever.
**How often:** every tech rehearsal. *recurring*, and [FACT] visible as an open user request:
console → CSV → merge back into Lightwright is asked for as a missing feature, not described as
existing practice.

### 7. Paper pick / pack / check-in sheet → system

**What is lost:** accuracy and timing. [FACT] Keyed data is reported at ~1 error per 300
characters versus ~1 per 3 million barcode scans; [FACT] order-entry automation vendors claim
2–3 hours per day recovered from re-keying and reconciliation; [FACT] hybrid paper-plus-
end-of-shift-entry warehouses are described as running permanently a few hours behind reality.
**Who pays:** the warehouse team, then the crew who arrive with the wrong case.
**How often:** *widespread* in small and mid houses; *recurring* in large ones. Sources are
vendor case studies (Busylad's paper loading and check-in sheets; JK Veranstaltungstechnik's
printed pack lists) — motivated, but consistent across vendors.

### 8. Rental system ↔ crew system

**What is lost:** who is actually confirmed, and the hours that must be billed.
**Who pays:** the disponent and payroll.
**How often:** *widespread* where no API exists. [FACT] The break is real enough that CrewBrain's
selling proposition is the easyjob API removing duplicate data maintenance, with twelve
documented system interfaces — a vendor conceding the boundary exists across the market.

### 9. Sub-hire / cross-rental leaving the job file

**What is lost:** the shortage, the supplier's confirmation, the price, and the fact that this
item is not yours (so it must go back, on time, undamaged).
**Who pays:** the project manager chasing e-mails, and the finance person reconciling a supplier
invoice against a job months later.
**How often:** *recurring*. [FACT] Cross-hire is described as fundamental to every rental
business, and unintegrated operations as blind to external shortages and dependent on manual
cross-checking in separate spreadsheets.

### 10. Client rider / tech pack PDF → internal patch and plan

**What is lost:** version currency. [FACT] The named failure mode is the promoter holding an old
PDF, a newer e-mail and three conflicting verbal answers; [FACT] stage crew may print the
attachment before the follow-up arrives.
**Who pays:** the FOH/monitor engineer and the stage crew, at soundcheck.
**How often:** *widespread* in touring and event work; *recurring* in corporate.

### 11. Call sheet / running order versions

**What is lost:** which version is current. [FACT] Sending multiple call sheets at once is
described as a high-confusion practice; [FACT] the recurring concrete failure is stale call
times carried over from yesterday's document; [FACT] static PDFs give no visibility into who has
seen the latest version.
**Who pays:** the coordinator, and the crew member who arrives half an hour late.
**How often:** *widespread* in film/TV, *recurring* in events.

### 12. Load-out → check-in → invoice

**What is lost:** attribution. What was damaged, by whom, on which job.
**Who pays:** the rental house, in absorbed losses; [FACT] short damage-reporting windows (24 h
is commonly cited) mean an undocumented load-out becomes an uncharged loss.
**How often:** *recurring*.

### 13. Pick list → truck plan → what is actually on the truck

**What is lost:** volume, weight and stacking order once anything is added late.
**Who pays:** the driver and the load-in crew.
**How often:** *recurring*. [FACT] Integrated systems build truck sheets from pick lists;
paper manifests are the incumbent being displaced.

### 14. RF plan and IP plan → devices, and back

**What is lost:** the actual frequency and the actual address. [FACT] The RF workflow terminates
in a **paper** one-page sheet with a blank for the final frequency — i.e. the authoritative value
is created on paper, on site, after coordination and war-gaming; [FACT] spreadsheet IPAM is
error-prone, unscalable and duplication-prone by the vendor's own framing.
**Who pays:** the RF tech and the network engineer, and the next show that inherits a stale plan.
**How often:** *recurring*.

### 15. Project close → archive

**What is lost:** reusability. Show files on USB sticks, photos in WhatsApp, marked-up plans in a
skip. [FACT] grandMA3 show files live on internal drive or USB with a one-way version migration
(forward only), and the documented best practice is manual save-as discipline and two physically
separated sticks.
**Who pays:** everyone, next year.
**How often:** *widespread*. [INFERENCE] The cheapest break to fix and the least often fixed,
because nobody is paid for the hour after the truck leaves.

---

## Change propagation case study: a camera is added 48 hours before the show

**Scenario.** A mid-size rental house is doing a corporate conference in a hotel ballroom with a
flypack: four cameras, a switcher, a router, a multiviewer, comms, ISO recording. Show is Friday
09:00; load-in Thursday 08:00; the truck packs Wednesday afternoon. On **Wednesday 16:00** the
client asks for a fifth camera — a long lens on a riser at the back of the room for audience
reaction.

This is a small change. It is a **long-lens camera on a new position**, which means a new cable
run, a new control channel, a new tally, a new comms position, a new record channel, a new
riser, and a person to operate it.

**Documents and configurations that must be touched.** Ownership assumes the small/mid rental
house variant; [INFERENCE] the list is modelled from the artefact types evidenced in the station
table, not observed in a single real project. The count is an estimate.

| # | Document / configuration | System | Owner | Format crossing the boundary |
| --- | --- | --- | --- | --- |
| 1 | Change order / revised quote | Rental ERP | Project manager | PDF to client |
| 2 | Client approval | E-mail / WhatsApp | Client | Free text, sometimes verbal only |
| 3 | Order / reservation lines (body, lens, tripod, CCU, cables, riser) | Rental ERP | PM | In-system |
| 4 | Availability check → shortage | Rental ERP | PM | In-system |
| 5 | Sub-hire PO (long lens is not in stock) | ERP + e-mail | PM | PDF PO out, supplier confirmation PDF back |
| 6 | Supplier delivery note + their return date | Paper / PDF | Warehouse | Paper |
| 7 | Pick list / pull sheet — **reprint** | Rental ERP | Warehouse lead | Printed |
| 8 | Case labels / packing list | ERP or label printer | Warehouse | Printed |
| 9 | Truck load plan (volume, weight, stacking) | Excel / load tool | Warehouse | Printed or re-run |
| 10 | Crew plan: one extra camera op | Crew system / Excel | Disponent | In-system or WhatsApp |
| 11 | Crew booking confirmation + travel | WhatsApp / e-mail | Disponent | Message |
| 12 | Call sheet / crew list — **reissue** | PDF | Coordinator | New PDF, old one already printed |
| 13 | Camera plan / floor plan (position, sightlines) | CAD / Visio | Systems engineer | Drawing, re-exported to PDF |
| 14 | Venue approval for the riser position (blocks seats / fire lane) | E-mail | PM ↔ venue | E-mail, sometimes verbal |
| 15 | Risk assessment / method statement (riser, cable crossing a public route) | Word / PDF | H&S responsible | PDF |
| 16 | Cable schedule (new run: length, type, drum, route) | Excel | Systems engineer | Spreadsheet row |
| 17 | Cable labels | Label printer | Crew | Printed |
| 18 | Signal flow drawing | CAD / Visio | Systems engineer | Drawing |
| 19 | Router source list + destination naming + salvos | Router config | Systems engineer | Typed at the device |
| 20 | Multiviewer layout + window labels | MV config | Systems engineer | Typed at the device |
| 21 | Tally / UMD map | Switcher + tally config | Systems engineer | Typed at the device |
| 22 | Switcher input naming, macros, ME assignments | Switcher config | Vision engineer | Typed at the device |
| 23 | Camera control: CCU number, RCP assignment, shading order | CCU / RCP | Vision engineer | Set at the device |
| 24 | Comms: new panel key, camera-op beltpack, talkback group | EHX / Director / wireless comms | Comms engineer | Config file, uploaded to the matrix |
| 25 | RF coordination if the comms pack is wireless | Wireless Workbench + **the paper RF sheet** | RF tech | Recalculated, then written on paper |
| 26 | Power plan / distro (small extra load, plus the riser's practical) | Excel / drawing | Systems engineer | Spreadsheet |
| 27 | ISO record / replay channel map, file naming | Record device | Record op | Set at the device |
| 28 | Running order / camera cards / shot list | Word / PDF | Director / PA | New PDF |
| 29 | Return / check-in list | Rental ERP | Warehouse | In-system, if item 3 was done |
| 30 | Final invoice incl. sub-hire and extra labour | ERP → accounting | Finance | Export or re-typed |

**Roughly 30 artefacts for one camera.** Twelve of them are pure re-typing of information that
already exists somewhere else (items 13, 16, 18–24, 26, 27). Six are documents that had already
been printed or sent and are now stale in someone's hands (7, 8, 12, 15, 28, and the plan of
item 13).

**Which ones actually get missed, and what the audience sees.** [INFERENCE], but each maps to a
documented gap:

- **Multiviewer layout (20)** — camera 5 appears in the wrong window or none. The director calls
  a shot nobody can find.
- **Tally/UMD (21)** — the operator has no red light; talent looks at the wrong camera.
- **Comms (24)** — the fifth operator cannot hear the director. Most visible failure, discovered
  at the first rehearsal, fixed by handing the op a radio and never written down.
- **Cable schedule (16)** — the run is measured by eye, the drum is 20 m short, and someone
  drives back to the warehouse Thursday afternoon.
- **Truck plan (9)** — the riser and the extra case do not fit; they travel in a car, arrive
  after the load-in has passed that point, and cost an hour of standing crew.
- **Check-in list (29)** — if the sub-hired lens was added on paper only, at check-in it is a
  stranger: it either goes back to the wrong supplier, goes back late (billing another week), or
  sits in the warehouse for a month.

**The same change in the other variants:**

- **Freelancer:** three artefacts — the gear list, the invoice line, and their own memory. Cost:
  fifteen minutes and possibly a second trip. The change is cheap because there are no
  boundaries.
- **Large rental house:** the commercial half (items 1–12, 29, 30) is largely handled inside
  integrated systems; the technical half (13–28) is *identical* to the mid-size house, because no
  ERP owns it. [INFERENCE] Scale therefore reduces the cost of the commercial half and not at all
  the cost of the technical half.
- **OB / broadcast:** add transmission path capacity, an extra ISO record channel and its
  storage, an updated RF licence/coordination filing if a wireless camera or link is involved,
  and the truck's own patch documentation. [INFERENCE] roughly 35–40 artefacts. This is why OB
  practice front-loads a formal technical recce and resists late changes with contract language
  rather than with tooling.

**The general law.** The cost of a change is not proportional to the size of the change. It is
proportional to **the number of systems the change has to be re-entered into**, which is fixed
per company. Adding one camera and adding four cameras cost nearly the same amount of
paperwork.

---

## Where a single integrated suite would remove the break

Honest assessment, split three ways.

### Genuinely removed by one shared model

- **Technical plan ↔ BOM ↔ pick list (breaks 1, 2).** If the cable plan, camera plan and light
  plan all draw from one inventory model, the equipment list is a *derived view*, not a
  re-typed document. Cables, adapters and spares appear because the plan knows the runs exist.
  This is the strongest case, and it is the gap no rental ERP fills.
- **Cable schedule → labels → rack documentation (break 5, partly).** One source, three
  renderings. No re-typing.
- **Naming consistency across router / MV / tally / comms (break 5).** If the source name is one
  object, renaming it renames it everywhere the plan can reach. Whether it reaches the *device*
  is a separate question — see below.
- **Change propagation flags (break 4).** A suite that knows camera 5 is referenced by the cable
  plan, the MV layout and the comms plan can *list* what a change invalidates, even when it
  cannot fix it. [INFERENCE] This alone would remove most of the failure modes in the case study,
  because the failures are omissions, not errors.
- **Plan → as-built (break 3), if and only if the on-site edit is faster than a pen.** This is
  an interaction-design problem, not a data problem.

### Reduced, not removed

- **Design app → device configuration.** A suite can *generate* the config (router source lists,
  MV layouts, tally maps, console patch) and it can *import* device state back. It cannot stop
  someone typing directly at the device at 02:00 — the device will always be the fastest place to
  make a change. The realistic goal is **reconciliation**, not authority: show the operator the
  diff between the plan and the machine. [FACT] This is precisely what Lightwright already does
  with Eos (reconcile patch) and what users still ask for more of.
- **Paper.** Printed plans, pull sheets, RF sheets and load-out lists will not go away, and
  should not. [FACT] Paper needs no battery, works in any weather and in a basement with no
  connectivity, and both parties can sign it — which is exactly the failure profile of a venue
  load-in. The achievable win is a **round trip**: print from the model, scan or photograph back,
  and make the paper a rendering of the model rather than a fork of it.
- **Warehouse re-keying.** Scanning solves this and is a solved problem in the ERPs. A planning
  suite should feed the ERP, not replace it.

### Not removed, and it is dishonest to claim otherwise

- **The client boundary.** Clients will send PDFs, Excel sheets and WhatsApp voice notes, and
  will change their minds by phone. No internal tool changes that. The best available outcome is
  fast, low-friction *capture* of an inbound change and an honest record of who asked for it and
  when — which is a change-order feature, not an integration.
- **The supplier boundary.** Sub-hire runs on peer relationships, phone calls and PDFs. Every
  rental ERP has tried to formalise it; it remains e-mail.
- **Crew, payroll, contracts, accounting.** Out of scope, and the market already has strong
  specialised products with APIs ([FACT] CrewBrain↔easyjob). Building a worse version of
  CrewBrain would *create* a media break, not close one. The right posture is an interface.
- **Verbal on-site coordination.** Comms, shouting across a ballroom, and the WhatsApp group are
  the fastest channels that exist and will remain the primary carrier during load-in and show.
  Software's realistic role is to capture the *outcome* afterwards, not to intercept the channel.
- **The last two hours before doors.** No one will open a planning tool. Anything that must be
  captured then has to be capturable in under ten seconds or it will not be captured at all.
- **Adoption.** [FACT] Hybrid paper-plus-late-data-entry warehouses persist even where scanning
  is available. A single source of truth is a *behaviour*, not a feature; a suite that is not
  faster than the pen loses to the pen.

### What this means for AV Planner Suite specifically

The suite in this repository ([`README.md`](../../README.md): a shared shell over Cable Planner
(SDI signal flow), Multicam Planner (cameras/lenses) and Light Planner, on a shared inventory
model) sits **exactly on breaks 1, 2, 3 and 5** — the technical middle of the chain that neither
the rental ERPs nor the crew tools own, and which stays equally expensive at every company size.
[INFERENCE] The highest-value additions implied by this research are, in order: (a) a derived
equipment list that can be exported into a rental ERP's import format; (b) an explicit
"what does this change invalidate" view keyed to the case study above; (c) device
config generation *plus* read-back reconciliation rather than one-way export; (d) a print/
capture round trip so the paper on site is a rendering of the model. Notably absent from that
list: crew, invoicing and warehouse scanning, which are better bought than built.

---

## Sources

All URLs below were surfaced by the searches described in the Method section. **None were opened
directly** — the sandbox's egress proxy blocked every fetch attempt — so each is a pointer for
verification rather than a page that was read. Dates are given where the source or the search
result stated one.

### Rental / event ERP, warehouse and logistics

- https://rentman.io/industries/av-rental-and-production
- https://rentman.io/de/kunden/erfahrungsberichte/jk-veranstaltungstechnik (customer story: printed pack lists)
- https://rentman.io/de/produktupdates/erstelle-packlisten-fur-items-die-noch-gepackt-werden-mussen
- https://rentman.io/de/losungen/materialtracking
- https://rentman.io/solutions/rental-equipment-tracking-software
- https://rentman.io/blog/barcode-vs-rfid-vs-qr-for-av-rental-inventory-tracking
- https://rentman.io/blog/equipment-rental-checklist-free-template
- https://rentman.io/blog/how-to-compare-av-inventory-software-in-2026
- https://www.flexrentalsolutions.com/av-inventory-management-software/
- https://www.flexrentalsolutions.com/event-rental-software-features/inventory-management/pick-lists-pull-sheets/
- https://www.flexrentalsolutions.com/event-rental-software-features/warehouse-logistics/
- https://www.flexrentalsolutions.com/event-rental-software-features/warehouse-logistics/trucking-transportation/
- https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/360054924294-Prepping-a-Pull-Sheet
- https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/360056729133-Free-Scan-Out
- https://www.point-of-rental.com/resources/case-studies/
- https://www.point-of-rental.com/case-study/event-essentials/
- https://www.point-of-rental.com/case-study/epic-rental-decor/
- https://www.eventworx.biz/
- https://hirehop.biz/event-hire-software/
- https://booqable.com/spreadsheets/
- https://booqable.com/barcode-scanning/
- https://innovation-product-documentation.azurewebsites.net/RMS%20Cross%20Rental.html (cross-rental process)
- https://www.capterra.com/p/142401/Current-RMS/reviews/
- https://www.capterra.co.uk/reviews/144616/rentman
- https://www.capterra.com/compare/142401-144616/Current-RMS-vs-Rentman
- https://www.selecthub.com/equipment-rental-software/rentman-vs-hirehop/
- https://www.tapgoods.com/pro/blog/tool-equipment-rental-software/equipment-rental-inventory-tracking/damaged-equipment-report/
- https://www.intemposoftware.com/blog/what-happens-customer-returns-damaged-rental-equipment
- http://support.sharegrid.com/en/articles/733935-what-if-my-equipment-has-visible-damage-or-missing-items
- https://www.softguide.de/programm/rentman
- https://www.rocon.info/blog/lager-4-0

### Warehouse data entry, scanning and error rates

- https://wisys.com/blog/warehouse-scanner-roi-what-the-data-actually-shows (keyed vs scanned error rates)
- https://www.optioryx.com/blog/order-entry-automation (re-keying time)
- https://www.withvector.com/blog/pick-ticket-the-what-why-examples-everything-to-know/
- https://alignops.com/blog/what-is-a-pick-ticket
- https://xorosoft.com/warehouse-picking-errors/
- https://www.netsuite.com/portal/resource/articles/erp/prevent-picking-errors-in-warehouse.shtml
- https://www.dynamicsmobile.com/solutions/warehouse (hybrid paper + end-of-shift entry)
- https://www.fulfillmentapp.biz/features/mobile-scanner
- https://pacificbarcode.com/blog/complete-warehouse-labeling-best-practices-guide-checklist/
- https://camcode.com/blog/how-to-implement-barcodes-in-your-warehouse-a-step-by-step-guide/
- https://base.com/de-DE/blog/lagerverwaltung-optimieren/
- https://www.kmu-erp.at/kontakt-anfrage/blog/lagerverwaltung-ohne-excel-so-vermeiden-kmu-fehlbestaende-und-totes-kapital
- https://www.cosys.de/lagerverwaltungssoftware-fuer-kleine-unternehmen

### Crew, disposition and facility scheduling

- https://www.crewbrain.com/de/features/schnittstellen/easyjob-protonic/
- https://en.blog.crewbrain.com/2025/07/efficient-personnel-planning-the-interface-between-crewbrain-and-easyjob-at-a-glance/ (July 2025)
- https://www.crewbrain.com/de/themen/crewplanung/crewplanung-fuer-die-veranstaltungstechnik/
- https://blog.farmerswife.com/find-out-more-about-the-best-scheduall-alternative
- https://blog.farmerswife.com/the-best-software-for-american-tv-news-stations-farmerswife
- https://postperspective.com/xytechs-mediapulse-2022-adds-scheduall-features/
- https://www.productionhub.com/press/74197/xytech-systems-announces-acquisition-of-scheduall-is-complete-strengthening-facilities-management-transmission-offerings

### Quoting and change orders

- https://procoreproductions.com/av-quote-line-items-decoded-what-every-item-actually-means/
- https://avad3.com/the-essential-guide-to-understanding-av-quotes/
- https://www.clarityexperiences.com/blog/stop-long-av-quotes
- https://www.heroic-productions.com/av-quotes/
- https://changeorder.avrentalmiami.com/ (change-order definition and rush/third-party costs)
- https://www.trincoll.edu/lits/technology/av-event-support/ (48-hour late fee)
- https://thepanaceaco.com/event-production-timelines-how-long-does-a-full-build-take/
- https://avtproductions.com/the-best-time-to-bring-your-av-partner-into-the-conversation/
- https://www.extremegroup.co.uk/blog/how-to-manage-last-minute-changes-before-a-trade-show/

### Signal, cable and AV system documentation

- https://xchange.avixa.org/posts/av-system-documentation-a-comprehensive-overview
- https://www.avixa.org/explore/videos/components-of-an-av-design-package
- https://www.wirecad.com/index.php?route=product%2Fproduct&product_id=151
- https://www.tvcad.tv/
- https://wireflow.live/av-diagram-software
- https://avsyncstudio.wordpress.com/2026/02/27/how-signal-flow-diagrams-integrate-with-rack-and-wiring-diagrams/
- https://pathnovo.com/resources/templates/cable-schedule
- https://www.cableschedules.com/
- https://blog.devilatwork.de/dokumentation-der-gebaeude-verkabelung-mit-excel/ (Excel/Visio cabling documentation, DE)
- https://www.docusnap.com/en/it-documentation/it-cabling-documentation
- https://www.cc-community.net/threads/welches-programm-zum-erstellen-eines-kabelplans.43596/ (DE forum)
- https://arrowavgroup.com/keeping-great-audiovisual-documentation/
- https://pinnacleinfotech.com/what-are-redline-drawings-in-construction/
- https://www.uppteam.com/redline-vs-as-built-drawingsand-why-they-matter-in-construction-projects/
- https://github.com/larszu/cable-planner (the suite's own cable planner, for context)

### Broadcast / OB

- https://www.adapttvhistory.org.uk/outside-broadcast/technical-planning (documents 1970s practice)
- https://www.adapttvhistory.org.uk/outside-broadcast/
- https://www.cheqroom.com/blog/outside-broadcasting-all-you-need-to-know/
- https://www.nepgroup.com/flypacks
- https://www.takeone.tv/what-is-a-flypack-portable-broadcast-control-room/
- https://broadcastmgmt.com/live-production/broadcast-flypack-advantage/
- https://www.clearcom.com/Admin/Resources/ehx-configuration-software
- https://www.riedel.net/fileadmin/user_upload/800-downloads/06.0-Manuals-Intercom/Director_User_Guide_6.70_Vers.3.91__EN_.pdf

### Lighting

- https://www.mckernon.com/supportmenu/vwdataexchange.html
- https://www.mckernon.com/supportmenu/vwdataexchangeaddr.html
- https://www.lightwright.com/lightwright-6/support/vectorworks-data-exchange
- https://www.lightwright.com/docs/user-guide/14-external-integration/01-vectorworks.html
- https://app-help.vectorworks.net/2024/eng/VW2024_Guide/Setup/Spotlight_preferences_Lightwright_pane.htm
- https://app-help.vectorworks.net/2018/eng/VW2018_Guide/Setup/Automated_Import_and_Export_to_Lightwright.htm
- https://forum.vectorworks.net/index.php?/topic/80657-problems-with-lightwright-data-exchange/
- https://support.etcconnect.com/ETC/Consoles/Eos_Family/Software_and_Programming/Importing_Lightwright_Data_Into_Eos_Family_Consoles
- https://www.lightwright.com/kb/eos-console-patch
- https://www.mckernon.com/supportmenu/eosconsolepatch.html
- https://www.mlp-lighting.com/eos/eos-and-lightwright-reconcile-patch/
- https://community.etcconnect.com/control_consoles/eos-family-consoles/i/feature-requests/csv-patch-export-more-info-text-boxes-gobo-scroll-etc (console → Lightwright round trip as a feature request)
- https://www.controlbooth.com/threads/modern-lighting-paperwork-software-recommendations.48855/ (surfaced, not readable)
- https://www.controlbooth.com/threads/team-collaboration-with-vectorworks-and-lightwright.30809/ (surfaced, not readable)
- https://help.malighting.com/grandMA3/2.0/HTML/show_file_management.html

### Audio, riders and RF

- https://gearspace.com/board/live-sound/1151562-tech-spec-channel-list-stage-plot-tech-rider-differences.html
- https://stageplotpro.app/guides/band-technical-rider-template (old-PDF-vs-new-email advance problem)
- https://www.riderforge.app/how-to-create-tech-rider.html
- https://blog.groover.co/en/tips/write-tech-rider-live-shows/
- https://www.shure.com/en-US/insights/all-about-wireless-system-planning-coordination-and-monitoring
- https://www.rfvenue.com/blog/2017/03/31/why-you-should-use-frequency-coordination-software-every-time (2017)
- https://meyerproinc.com/wireless-mic-frequency-planning/ (one-page paper RF sheet)
- https://www.freqcoord.com/
- https://www.prosoundweb.com/the-art-of-saving-showfiles-total-recall-for-a-better-workflow-to-avoid-embarrassment/ (surfaced, not readable)

### Network

- https://netboxlabs.com/ipam/ (spreadsheet IPAM: error-prone, unscalable)
- https://docs.netbox.dev/
- https://netbox.readthedocs.io/en/stable/features/ipam/
- https://github.com/netbox-community/netbox/discussions/17679
- https://livehelp.solidstatelogic.com/Help/DanteSetup.html

### Production paperwork, call sheets, riders, tech packs

- https://www.studiobinder.com/blog/create-better-call-sheet-with-free-call-sheet-template/
- https://www.studiobinder.com/blog/production-call-sheet/
- https://howtofilmschool.com/call-sheet-dos-and-donts/
- https://www.wrapbook.com/blog/call-sheet
- https://callsheetx.com/resources/call-sheet-template-checklist (stale call times, static PDFs)
- https://sites.google.com/site/thecompletestagemanager/rehearsal/the-rehearsal-report
- http://depts.washington.edu/uwdrama/files/stage-management-manual.pdf
- https://up.yalecollege.yale.edu/sites/default/files/files/Appendix%20E-%20Notes%20on%20Notes.pdf
- http://rm.usitt.org/sm.html
- https://production.pro/production-binder
- https://www.gofilmityourself.com/fiy/productionbinder
- https://tourmanager.info/advancing-shows/ (advancing spreadsheets)
- https://www.theefficienthustle.com/blog/2019/3/4/venue-tech-packs (2019)
- https://corporate.themidwaysf.com/wp-content/uploads/The-Midway-Tech-Pack-2024.pdf (2024 example tech pack)
- https://www.popprobe.com/checklist-library/events-entertainment/event-planning/event-site-survey-venue-assessment-checklist

### Camera department

- http://www.davidelkins.com/cam/forms/pdf/c.4_camera_prep_checklist_2012.pdf (2012)
- https://www.theblackandblue.com/2014/03/31/elkins-camera-prep/ (2014)
- https://georgetelling.co.uk/documents/prep_checklist_tvc_digital.pdf
- https://georgetelling.co.uk/documents/prep_checklist_longform_film.pdf

### Paper vs digital in the field

- https://safetyculture.com/blog/going-paperless-the-rise-of-digital-checklists-in-utility-work
- https://novagems.com/free-templates-library/free-security-guard-checklist-templates/ (handover, signatures)
- https://miratag.com/en/blog/digital-checklist-app-going-paperless-guide (offline reality)
- https://www.checkproof.com/challenges/replace-paper-checklists/

### In-house / institutional AV

- https://it.tufts.edu/form/av-and-video-conferencing-service-request
- https://www.yarooms.com/blog/room-and-equipment-booking-software
- https://it.semel.ucla.edu/av-and-multimedia

### Freelancer tooling

- https://www.refrens.com/en/freelance-invoice-templates
- https://quickbooks.intuit.com/ca/resources/invoice-templates/freelancers/
- https://www.invoicesimple.com/invoice-template/freelance-invoice-template/
