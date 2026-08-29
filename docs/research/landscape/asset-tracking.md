# Asset Tracking / Barcode / QR / RFID / Maintenance / Cases

> Research date: **2026-08-29** (task brief dated 2026-08-28; all prices labelled with the
> date seen). Claims are labelled per [`docs/research/METHOD.md`](../METHOD.md):
> **FACT** — read in a source, URL cited; **INFERENCE** — my reasoning from those sources;
> **UNKNOWN / unverified** — could not be checked, with a note on what would settle it.

---

## Source-access caveat — read this first, it bounds every claim below

Two different network channels were available in this session, and they have very different
evidentiary weight. The distinction matters enough that every claim below is tagged with which
channel it came from.

| Channel | Status | Evidentiary weight |
| --- | --- | --- |
| **`WebSearch`** | working, ~30 queries run (EN + DE) | Returns a *synthesised summary* of vendor pages with quoted fragments. I did **not** open those pages myself. Good enough to establish that a vendor claims something; **not** good enough to treat a number as audited. |
| **`WebFetch` on `github.com` / `raw.githubusercontent.com`** | working | Genuine primary source. I read actual `composer.json`, directory trees and Atom release feeds. |
| **`WebFetch` on every other domain** | **blocked by the egress proxy** | `cheqroom.com`, `sortly.com`, `snipe-it.readme.io`, `hirehop.com`, `rentman.io`, `docs.rentman.io`, `current-rms.com`, `flexrentalsolutions.com`, `shelf.nu`, `docs.inventree.org`, `impinj.com`, `content-files.shure.com`, `help.protonic-software.com`, `gs1.org`, `capterra.com`, `getapp.com`, `en.wikipedia.org` all refused. Verified individually. |

**What this means in practice, stated plainly:**

1. **Every price in this dossier is second-hand.** It comes from a search engine's extraction of
   a vendor or aggregator page, not from a page I opened. Prices are therefore marked
   **FACT (search-extracted)** rather than **FACT (page read)**, and where two sources disagree
   I print **both numbers and the disagreement** instead of picking one. Do not put any of these
   figures into a customer-facing comparison without re-opening the cited URL.
2. **Where a vendor's marketing claim and its own help-centre article conflict** (this happens
   with "works offline"), I say so. That conflict is itself one of the most useful findings in
   the segment.
3. **The open-source products are documented far better than the commercial ones here**, because
   GitHub was reachable. That is an artefact of the network, not of the products' importance.
4. Two seed products produced **no usable primary source**: **Yellowfish / Rentcorp RFID** (no
   such AV-rental vendor surfaced in any search) and **Blackbox** (`blackbox.global` unreachable;
   searches returned an unrelated GPS tracker vendor and an unrelated UK AV-production company).
   They appear as **UNKNOWN** rows rather than being invented or silently dropped.
5. One seed product, **InventoryBase**, turns out to be **not in this segment at all** — it is
   UK residential-lettings property-inspection software. Documented below as a correction.

---

## Segment summary

**What the category is for.** This software answers four questions about physical objects that
neither a planning tool, nor an ERP, nor a spreadsheet answers reliably:

1. **Which one is this?** — identity of a *unit*, not a *model*. Not "an SDI cable" but
   "cable #A-4471, bought 2023, failed a continuity check in June".
2. **Where is it and who has it?** — custody: on a job, in a case, in a truck, on a shelf, at a
   sub-hire partner, or lost.
3. **Is it fit to go out?** — condition, damage history, and — in the German market especially —
   whether its statutory electrical inspection is still valid.
4. **Is the case complete?** — a case is a container whose contents are themselves tracked
   assets, and "the case went out" must mean "these 41 things went out".

**Who buys it.** Three quite different buyer groups that the vendors serve with the same code:

- **Rental / production houses** (AV, event, broadcast, lighting). Buy the *rental suite*
  (Rentman, Flex, Current RMS, HireHop, easyjob) and get scanning as one module of it. Asset
  tracking is inseparable from availability, quoting and sub-hire.
- **In-house media / broadcast / education teams** who own gear but do not rent it out. Buy a
  *checkout* product (Cheqroom, Shelf, Reftab, Scanlily). No invoicing, no availability pricing —
  just custody and condition.
- **IT/facilities departments** who buy horizontal ITAM (Snipe-IT, Asset Panda,
  EZOfficeInventory, Timly, itemit, AssetTiger). Cheapest per asset, weakest on cases, kits and
  the rental calendar.

**Typical price band** (all figures search-extracted, seen 2026-08-29, details and conflicts in
the product table):

- **Free / open source, self-hosted:** €0 licence — Snipe-IT (AGPLv3), Shelf (AGPL-3.0),
  InvenTree (MIT), Homebox. You pay in ops.
- **Entry SaaS:** roughly **$20–80 / month** for a small estate — AssetTiger (free ≤250 assets,
  then ~$20/mo), itemit (~£21/mo), Snipe-IT managed hosting ($39.99/mo), HireHop (£46/mo first
  user).
- **Mid-market SaaS:** roughly **$50–300 / month** — Sortly, EZO, Asset Panda, Booqable,
  Current RMS, Rentman (modular, from a $39/mo platform fee).
- **Premium per-seat:** **Cheqroom**, reportedly $184–367 *per admin seat per month billed
  annually* — an order of magnitude above the ITAM tools, justified by the checkout workflow.
- **German/DACH enterprise:** **Timly from €185/mo**, larger tiers **from €495/mo**.
- **Rental-suite + RFID:** sales-contact only. Flex sells RFID as a paid add-on module on top of
  the core subscription; no list price is published.
- **Hardware is a separate budget line nobody includes in the SaaS price:** RFID tags, on-metal
  tags, label stock, and Android scanners (Zebra TC22/TC27 class).

---

## Product table

Legend — **Offline?**: what the *scanning* workflow does with no connectivity.
**API?**: public, documented, machine-readable interface.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Cheqroom** | Cheqroom (BE/US) | Web + iOS/Android | Per **admin seat**, billed annually; unlimited non-admin users & items. Core $184 / Business $275 / Enterprise $367 (per admin/mo, annual — *see conflict note*) | **Claimed yes** — check-in/out without internet, syncs on reconnect (marketing claim, scope unverified) | REST `api.cheqroom.com/api/v2_5`; outbound **webhooks only**, HMAC-SHA256 signed | The checkout loop: reserve → kit → scan out → flag damage → work order. Best damage→maintenance automation in the segment |
| **Rentman** | Rentman (NL) | Web + iOS/Android + Zebra Android | Modular: platform fee ~$39/mo + per-user modules (Inventory from $19/user/mo, Crew from $14/user/mo) + add-ons (Equipment Tracking €9/user/mo, History Logs €12/user/mo). **Warehouse staff are free basic users** | **Unverified** — no vendor statement found either way; support docs describe live sync only | Documented REST API (`api.rentman.net`), OpenAPI spec, `POST /equipment/{id}/serialnumbers` | Cases/containers as sealed, self-tracking units; sub-hire on the same packing slip; per-serial periodic inspections |
| **Flex (Flex Rental Solutions)** | Flex Rental Solutions (US) | Web + mobile + FlexScan Pro handheld | Subscription (sales contact). **RFID is a paid add-on module** on top of core | Unverified | Yes (unverified detail) | Deepest **containers & packages** model; dual-identifier doctrine (barcode *and* RFID on the same unit) |
| **Current RMS** | Current RMS / Kerridge CS (UK) | Web + iOS/Android | Per user/month. $79/user/mo *(one source)* vs Basic $62 first user + $27 additional *(another)* — conflict | Unverified | Yes (public API; docs not opened) | Availability-aware rental asset tracking. **Explicitly barcode/QR only — no RFID** |
| **HireHop** | HireHop (UK) | Web + browser scanning app | £46/mo first user, £23/mo each additional (+VAT). Limited free single-user tier | Unverified | Yes (unverified detail) | Widest identifier support in one product: barcode, QR, **RFID, NFC**, serial, manual count. "Spot Check" warehouse audits |
| **easyjob** | protonic software GmbH (DE) | Windows + Scanner App (Win/Android/iOS, HTML-based) | UNKNOWN — no price found | Bidirectional real-time described; offline behaviour UNKNOWN | UNKNOWN | The German-market incumbent. Barcodes on **articles, devices, projects, jobs, addresses and users** — the broadest barcodable-object model found |
| **Snipe-IT** | Grokability (US) | Self-hosted web (PHP/Laravel) | **AGPLv3, free self-hosted.** Managed: Basic $39.99/mo, Small Business $99.99/mo; dedicated $5k–7.5k/yr | No mobile app of its own; browser-based scanning needs the server | **Yes — full JSON REST `/api/v1/`**, incl. `POST /hardware/{id}/checkout` and `/checkin` | Best free label engine (Avery/Hema sheets; Brother/Dymo/Zebra tapes) and the most honest open licence |
| **Shelf (shelf.nu)** | Shelf (NL) | Hosted `app.shelf.nu` + Docker self-host | **AGPL-3.0**, self-host free (needs external Supabase). Hosted pricing UNKNOWN | Unverified | Unverified | Modern OSS: QR asset tags, **bookings/reservations**, custody, kits, custom fields. The OSS product closest to AV checkout needs |
| **InvenTree** | InvenTree (community) | Self-hosted Django + React, companion mobile app | **MIT**, free | Unverified (mobile app exists) | **Yes** — REST API; `POST /api/barcode/` scan endpoint; **barcode plugin mixin** | The best *extensible* barcode architecture: plugins decode arbitrary barcode data; internal JSON or short formats |
| **Homebox** | sysadminsmedia (community) | Self-hosted Go + SQLite | Free, OSS | Unverified | Unverified | Tiny footprint (runs on a Pi). QR per item **and per location**; bulk label sheets pre-formatted for Avery 5260; CSV/TSV import-export |
| **Sortly** | Sortly (US) | Web + iOS/Android | Free (100 items, 1 user); Advanced $49/mo (or $24/mo annual); Ultra $149/mo (or $74/mo annual); Premium $299; Enterprise custom | **Yes, mobile only — not on web.** Explicitly "only updates inventory levels on your device" | Yes (higher tiers) | Photo-first visual inventory. QR label generation from Advanced, barcode labels from Ultra. **No RFID label creation** |
| **EZOfficeInventory / EZO** | EZO (US) | Web + iOS/Android | Essential $48/mo, Advanced $58/mo, Premium $65/mo — starting prices for **100 tracked items**, unlimited users under fair use *(one source instead reads these as per-user — conflict)* | **Narrow** — help docs describe offline as *adding work logs to work orders*, auto-synced on reconnect. Not offline checkout | Yes | Bulk scanning of barcode, QR **and RFID** from a phone; sibling product EZRentOut for rental |
| **Asset Panda** | Asset Panda (US) | Web + iOS/Android | Starter ~$50/mo (5 users, 1,000 assets); Business+ ~$60/mo/user (10 users, 5,000 assets); Enterprise custom. Third-party: real contracts from ~$3,000/yr + $2,000–15,000 implementation | **Offline mode exists but is tier-gated** — added in "Asset Panda Pro" (launched 2025-09-11); reported as Enterprise-only | Yes | Extreme configurability of the asset record |
| **Timly** | Timly (CH/DE) | Web + mobile | **From €185/mo**; larger tiers **from €495/mo** (defect capture, consumables, GPS, multi-tenant land in the higher tier) | Unverified | Unverified | The DACH-market QR inventory tool; German-language, GDPR-native, sold into Veranstaltungstechnik |
| **itemit** | itemit (UK) | Web + iOS/Android | From ~£21/mo (£20.75 quoted elsewhere); ~£399/yr budget guide. No per-user charge. Asset tags from £149.99 | Unverified | Unverified | QR + barcode + **RFID + GPS trackers** in one cheap product; "QR Quick Audit" |
| **AssetTiger** | MyAssetTag (US) | Web + mobile | **Free up to 250 assets**; paid from $20/mo, **never per user** | Unverified | REST API | Cheapest credible entry point; 80+ report types, depreciation, warranty |
| **Reftab** | Reftab (US) | Web + mobile | Free tier; paid by asset volume | Unverified | Yes | Loan management for schools and equipment-lending teams; automated return reminders |
| **Scanlily** | Scanlily (US) | Web + phone camera (no app needed) | Free / Pro / Business, tiered by **number of items without a Scanlily QR label**; Enterprise 10,000+ custom. Exact figures UNKNOWN | Unverified | "System integrations" at Enterprise | Positions explicitly as the cheap Cheqroom alternative for film/video/broadcast. QR codes are **plain URLs** — scan with any camera, no app install |
| **Booqable** | Booqable (NL) | Web + mobile | 3 editions $29–$149/mo *(another source: "starts at $35")* **plus 1–3% transaction fees** | Unverified | Yes | Rental commerce (webshop) with barcode check-in/out attached |
| **Geartracking** | Geartracking B.V. — **a Rentman subsidiary** | Hardware, not software | Per-item hardware pricing | n/a | n/a | Pre-tested RFID/QR tags and printers **specified for AV rental**; on-metal tags for flight cases, heat-shrink hardtags for cables |
| **Kit Check / Bluesight** | Bluesight (US, healthcare) | RFID scan-station | Sales contact | n/a | UNKNOWN | **Out of segment but the benchmark:** an entire tray of up to ~198 RFID-tagged items read in seconds. The "seal the case, verify contents instantly" ideal |
| **Wireless Workbench 7** | Shure | Windows/macOS desktop, free | Free | Fully offline (desktop app) | No REST API; file-based | RF device inventory as part of a *show file*; exports inventory as CSV/PDF and "show packs". **Not an asset-tracking system** — no custody, no barcodes |
| **GearTrack** | Ambiguous — two vendors share the name: Rec Solutions (`recsolutions.com/geartrack`) and GEARTRACK (`geartrack.pro`) | Web | UNKNOWN | Unverified | Unverified | Rec Solutions' variant logs **number of uses and actual time used** per item for maintenance — an unusual and useful maintenance trigger |
| **InventoryBase** | InventoryBase (UK) | Web + mobile | UNKNOWN | **Yes** — works without internet | Yes (CRM/finance integrations) | **CORRECTION: not in this segment.** Residential-lettings property inspection/inventory reports, not equipment asset tracking. Listed only to close the seed-list loop |
| **Yellowfish / Rentcorp RFID** | — | — | — | — | — | **UNKNOWN — no primary source found.** No AV-rental RFID vendor under either name surfaced in any search. Would need a direct URL from whoever supplied the seed name |
| **Blackbox** | — | — | — | — | — | **UNKNOWN — unreachable.** `blackbox.global` blocked; searches returned an unrelated GPS-tracker vendor and an unrelated UK AV-production firm. Needs a verified URL |

---

## Deep dives

### 1. Cheqroom — the checkout loop, priced as a premium product

**What it does.** Cheqroom is not a rental ERP and deliberately not an ITAM tool. It owns one
loop: reserve → build a kit → scan out → use → flag condition → scan in → repair → back in
rotation. It is sold into film/TV production, broadcast, sports and university media
departments.

**Data model** (FACT, search-extracted). Item-centric with three structures above the item:

- **Item** — unique QR code auto-generated per item *or per kit*; the built-in scanner also reads
  pre-existing third-party barcodes, so you are not forced to re-label an inherited estate.
- **Kit** — a bundle that checks out as a single unit, "every component tracked and any missing
  piece flagged before it leaves". **Locked Kits** forbid partial checkout — the kit is
  all-or-nothing. Returns are checked against the original kit configuration.
- **Flag** — a visual status marker on an asset. The damage flag is the interesting one (below).

**The damage→maintenance automation is the best in the segment** (FACT, search-extracted). When a
user flags an item **Damaged** from the field in the mobile app:

1. Cheqroom **automatically removes the asset from rotation**, blocking any further booking.
2. The user is **required** to supply what happened plus supporting images — the evidence is
   mandatory, not optional.
3. The flag **auto-generates a notification to the maintenance team and creates a repair ticket
   with no manual data entry**; flagged items can be attached to a maintenance work order.

INFERENCE: this is the pattern most worth stealing. The critical design decision is that *the
availability consequence is automatic and immediate* — a tech in a truck park with a cracked
connector does one thing (flag), and the item is out of tomorrow's plan before anyone reads the
report. Most competitors make damage a note that a human must act on.

**Integrations.** REST API at `https://api.cheqroom.com/api/v2_5`; a JavaScript wrapper
(`cheqroom-core` npm). Webhooks are **outbound only** — Cheqroom pushes to you, you cannot push
to Cheqroom via webhook. POSTs carry an `X-CHEQROOM-Signature` header with an HMAC-SHA256 digest
of the payload against a shared secret. Zapier connector exists.

**Notable limits.**

- **Price model punishes warehouses** (INFERENCE from the pricing structure): billing is per
  *admin seat* with minimum admin counts, while regular users and items are unlimited. That is
  excellent for a media team with two managers and 200 borrowers, and hostile to a rental house
  where a dozen warehouse leads all need to change data. A competitor's whole marketing angle is
  "Cheqroom alternative without per-admin pricing".
- **Price conflict, unresolved (FACT: the sources disagree).** One search extraction reads
  "starts at $184/year for the Core plan, Business $275, Enterprise $367". Another reads
  "$184 per admin per month, billed annually ($2,208 per year for one license), Business $275,
  Enterprise $367 on the same basis". These differ by 12×. The second is internally consistent
  (it does the multiplication) and matches the "per admin, per workspace, minimum admin counts"
  language, so INFERENCE favours per-month. **To settle: open `https://www.cheqroom.com/pricing/`
  directly.** Both figures seen 2026-08-29.
- **Offline is a marketing claim I could not scope.** The feature pages say the app "works
  offline for field teams with no signal" and that you can "perform check-ins/check-outs without
  internet access, syncing data once reconnected". I could not open the help centre to learn
  what happens to a *conflicting* checkout made by someone else while you were offline. UNKNOWN.

---

### 2. Rentman + Geartracking — cases as sealed, self-tracking units

**What it does.** Rentman (NL) is the AV/event rental suite most visible in the European market.
Asset tracking is one module among crew, quoting and planning; the pricing is modular to match.

**Data model** (FACT, search-extracted). Three levels of identity, and this three-level split is
the segment's most transferable idea:

1. **Equipment item** — the catalogue model. Has its own QR code.
2. **Serial number** — the unit. Each serial number has **its own, different QR code**, and
   consists of **two data elements: an Internal Reference and a Manufacturer Serial Number**,
   with the Internal Reference as the default identifier. Rentman documents explicitly that
   *"QR codes for equipment items and QR codes for serial numbers are different"*.
3. **Container / physical combination** — the case.

INFERENCE, and it is important: the two-field serial (internal reference + manufacturer serial)
is the right model and most tools get it wrong. The manufacturer's serial is the only stable link
to a warranty claim, a firmware version or a recall; the internal reference is the only thing
short enough to print on a cable tag. Tools that offer one field force a bad choice.

**Containers — the standout feature.** After a container is set up and **sealed** in Rentman:

- You "scan the QR code of your transport case to see what's inside, **without needing to open
  your sealed cases** and manually check their contents" — the pitch is explicitly about cases
  full of adapters and small accessories.
- On pack/load you "scan the QR code of the transport case to move its content from status to
  status, **without needing to scan items individually**".
- Rentman then "automatically tracks the contents (**both serialized and bulk**) during transport
  and even between projects".
- Sealing carries a social contract: "your crew will know that the contents of the case were not
  changed since it was sealed."

FACT: the feature has been reworked — containers were migrated into "physical combinations" under
newer equipment types, with a dedicated support article for users migrating. INFERENCE: that
migration is evidence that modelling "case" correctly is genuinely hard, not that the idea failed.

**Sub-hire.** Sub-rentals are requested from the Shortages module or the project, and — the
useful part — **sub-rented gear appears on the same digital packing slip as owned gear**, so crew
see one list. Rentman accounts can send subrental requests **digitally to another Rentman
account**. Crew also get "a notification when all of your **own** equipment is scanned", so they
know the remainder must come from the sub-hire. INFERENCE: this is the only sub-hire UX I found
that treats "gear I do not own" as a first-class part of the scanning workflow rather than a
line item on an invoice.

**Maintenance / inspections.** Equipment can be marked defective in either the Maintenance or the
Warehouse module, and a repair created from it. **Periodic inspections are planned per serial
number**, with a Maintenance-module list of every serial and when its inspection falls due —
which is exactly the shape a German DGUV V3 regime needs.

**Hardware.** Rentman owns **Geartracking B.V.**, a subsidiary selling RFID/QR tags, scanners and
printers with "100% compatibility with Rentman". This vertical integration is a real competitive
moat: the tags are pre-tested for the failure modes of this industry specifically —
**on-metal tags (RM7 sticker, RM8 hardtag) for aluminium frames and metal cases**, and
**RM2/RM3 hardtags secured with heat-shrink tubing for cables and small items**. Software
scanning runs on phones or on **Zebra TC22/TC27** Android handhelds (SE4710 standard or SE55
advanced-range scan engines).

**Notable limits.**

- **RFID physics is not hidden from the user.** Rentman's own best-practice guidance concedes
  that **metal racking and equipment reduce RFID read range by 30–50%**, and recommends
  **"working in a clear space of around 3×3 metres"** with physical distance between the project
  being scanned and other tagged gear. That is a *workflow constraint imposed by physics on the
  building*, and it is the honest counterweight to the "18× faster" efficiency claim in the same
  material.
- **Offline: UNKNOWN.** Despite targeted searching, I found no Rentman statement that the mobile
  app scans offline. The support articles describe live status updates and "the packing list
  updating in real time" — INFERENCE: that phrasing implies a connected model, but absence of a
  claim is not proof of absence. **To settle: `support.rentman.io` search for "offline".**
- Add-on pricing stacks: Equipment Tracking (€9/user/mo) and History Logs (€12/user/mo) are
  *separate* from the Inventory module. History Logs being a paid add-on means audit trail is a
  paywalled feature.

---

### 3. Flex Rental Solutions — containers, packages, and the dual-identifier doctrine

**What it does.** Flex is the heavyweight US rental ERP for AV/event/production, with the deepest
inventory structure of the commercial products surveyed.

**Data model** (FACT, search-extracted). Flex is built on parent/child composition applied
consistently at four different levels — the same mechanism reused, which is unusual discipline:

- **Inventory tree** — parent inventory groups containing child inventory groups.
- **Contents / Accessories** — items in a model's Contents tab "automatically add to the Quote
  when the parent model is added", as a **child item to the parent**.
- **Virtual Items** — place a virtual item on a quote and its Contents come along as children.
  INFERENCE: this is a "kit that is not a physical thing" — the AV equivalent of a
  bill-of-materials line that exists only on paper.
- **Containers and Packages** — "you can **virtually build containers and packages in the same
  way that they are built physically**". The dashboard's parent line is the job, the child lines
  are units scanned to it.

**The dual-identifier doctrine is the single most quotable engineering opinion in this segment**
(FACT, search-extracted): an RFID tag "**isn't a replacement for a barcode, it's a complementary
identifier assigned to each serialized unit**, and in most cases **both a barcode and RFID tag
are recommended**" — RFID for fast bulk scanning in the warehouse, "the barcode provides a
reliable fallback".

INFERENCE: this is the correct architecture and it has a direct data-model consequence — a
serialized unit needs **an array of identifiers of differing types**, not a single `barcode`
string field. Any schema with one identifier column has already lost. Flex's own hardware
reflects it: the **FlexScan Pro** is an all-in-one RFID *and* barcode device with **dedicated
separate triggers for each mode** so switching is instant.

**Commercial shape.** RFID is an **add-on module**; the core subscription covers barcode/QR
scanning and inventory management, and RFID layers on top. There is an "RFID Proof of Concept
Kit & Starter Package" containing a FlexScan Pro and **7 tag types** — INFERENCE: seven tag types
in a starter kit is an admission that no single tag works across an AV inventory (cable, metal
case, plastic housing, fabric, small item all need different tags), which corroborates Rentman's
tag-selection guidance from an independent vendor.

Marketing claims up to **100 tags at once** and "up to 10 times faster than traditional barcode
scanning". UNVERIFIED as measured performance; treat as vendor claim.

**Notable limits.** No published price — `sales@flexrentalsolutions.com` for RFID. Offline
behaviour UNKNOWN. INFERENCE: as a browser-first ERP, offline warehouse scanning is unlikely to
be a strength, but I have no source either way.

---

### 4. Snipe-IT — the free label engine, and why its architecture is worth copying

**What it does.** AGPLv3 IT asset management. Not built for AV, has no case model and no
availability calendar — but it is the most *inspectable* product in the segment, and its label
subsystem is a small piece of excellent design.

**Verified primary facts (I read these files directly):**

- `composer.json`: **PHP `^8.2`**, **Laravel `^12.0`**. Barcode/label stack:
  `bacon/bacon-qr-code ^2.0` (QR), **`tecnickcom/tc-lib-barcode ^1.15`** (1D/2D symbologies),
  `tecnickcom/tcpdf ^6.5` + `tecnickcom/tc-lib-pdf-font ^2.6` (PDF label rendering),
  `intervention/image ^2.5`.
- `app/Models/Labels/` contains `Label.php`, `DefaultLabel.php`, `Field.php`, `FieldOption.php`,
  `Sheet.php`, `RectangleSheet.php`, plus two directories:
  - **`Sheets/`** → `Avery`, `Hema`
  - **`Tapes/`** → `Brother`, `Dymo`, `Generic`, `Zebra`
- Release cadence (from the Atom feed, dates verbatim): **v8.7.2 — 2026-08-19**,
  v8.7.1 — 2026-08-17, **v8.7.0 — 2026-08-11** (major; requires PHP ≥ 8.2). Actively developed
  as of ten days before this research date.

**Why the label architecture matters** (INFERENCE from the directory structure): Snipe-IT does not
treat "a label" as a print stylesheet. It treats it as **a class hierarchy split along the real
physical axis — continuous *tape* (Brother/Dymo/Zebra printers) versus die-cut *sheet* (Avery,
Hema)** — with `Field`/`FieldOption` making the *content* of the label data-driven and separate
from its *geometry*. Adding a new label size is subclassing, not editing a template. Anyone
building label printing should copy this split; the tape/sheet distinction is the one that bites
you later, because tapes have one fixed dimension and unbounded length while sheets have a rigid
grid and margins.

**Barcodes and workflow** (FACT, search-extracted): QR and 1D barcode formats; labels generated
by multi-selecting assets in a list view and choosing "Generate Labels", with size specifications
in Admin → Settings → Labels; a scanned QR opens the asset detail page on the phone. v8.7.0 added
**"Quickscan check-in by serial"**, accepting *either an asset tag or a serial number* — INFERENCE:
a small but telling fix, because in the field people scan whatever sticker is nearest, and a
system that only accepts one identifier class creates dead-end scans.

**API** (FACT, search-extracted): full JSON REST under `/api/v1/`, including
`POST /api/v1/hardware/{id}/checkout` (params `assigned_user`, `assigned_asset`,
`assigned_location`, `checkout_at`, `expected_checkin`, `note`) and
`POST /api/v1/hardware/{id}/checkin`. Note `assigned_asset` — **an asset can be checked out to
another asset**, which is the closest thing Snipe-IT has to a container model.

**Notable limits.** No first-party mobile app — scanning happens in the phone browser against
your server, so **no server, no scanning**; this is the least offline-capable design in the
survey. Bulk audit exists but GitHub issues show long-standing requests around it (updating
location from the audit scan, scanning a *location* barcode to set the audit context, bulk import
of audit data). No case/kit contents, no rental calendar, no sub-hire.

**Pricing** (FACT, search-extracted, seen 2026-08-29): self-hosted is genuinely free with
unlimited assets and users; managed hosting Basic **$39.99/mo**, Small Business **$99.99/mo**,
dedicated servers **$5,000/yr** (medium) and **$7,500/yr** (large).

---

### 5. Shelf (shelf.nu) and InvenTree — two open-source architectures worth studying

**Shelf** (FACT, read directly from the GitHub repo): **AGPL-3.0**. Stack is **React Router 7 +
React 19, PostgreSQL via Supabase, Prisma 6, Tailwind CSS 3, Vite 7 + Turborepo**. Releases are
frequent — **shelf@2.1.4 on 2026-08-20**, 2.1.3 on 2026-08-19, 2.1.2 on 2026-08-17, 2.1.0 on
2026-08-04 (Atom feed, verbatim). Features named in the repo: **QR asset tags** (generate and
print), **bookings and reservations** to prevent double-booking, **custody tracking**,
**built-in barcode scanning with bulk actions**, **kits for bundled assets**, custom fields,
categories, and audit trails. Roles are Owner / Admin / Base / Self Service.

INFERENCE: Shelf is the open-source product closest to AV needs, because it is the only OSS one
with **bookings** — an asset system without a calendar cannot answer "is this free next Tuesday",
which is the question a production actually asks. Self-hosting requires an **external Supabase
instance**, which is a real dependency: it is not a single-binary deploy, and the vendor states
that the "vast majority" of its 3,000+ teams use the hosted version.

**InventTree** (FACT, read directly from the GitHub repo): **MIT** licence — the most permissive
in the segment. Django + Django REST Framework server, React/Mantine client, plugin system, REST
API, and a companion mobile app on both stores.

Its **barcode architecture is the best abstraction found anywhere in this segment** (FACT,
search-extracted from the docs): barcode data is POSTed to a single **`/api/barcode/` endpoint**,
supplied to **all loaded barcode plugins**, and **the first plugin to successfully interpret the
data returns the response**. Internal codes come in two formats — a **JSON barcode** ("human
readable") and a **short barcode** (compact). It also ingests **ECIA barcodes** from electronics
suppliers for purchase-order receiving.

INFERENCE, and this is the design lesson: a chain-of-responsibility over pluggable decoders is
exactly right for AV, where a warehouse contains your own QR codes, a previous owner's Code 128
asset tags, manufacturer serial barcodes, GS1-128 shipping labels and rental-partner stickers all
at once. Everyone else hard-codes "our format or nothing"; InvenTree lets the scan try every
interpreter and take the first hit. The reported scanner configuration (`qrcode` and `code128`)
suggests the mobile app's *camera* decode set is narrower than the plugin architecture allows —
UNVERIFIED, worth checking against current source.

---

## Standards & protocols

**Symbologies (the marks themselves).** All FACT, search-extracted:

| Standard | What it is | Relevance here |
| --- | --- | --- |
| **ISO/IEC 18004** | QR Code — finder patterns, alignment, format/version info, Reed-Solomon ECC | Default choice in every modern product. Readable by an unmodified phone camera, which is why Scanlily and Homebox use plain-URL QR and need no app |
| **ISO/IEC 16022** | Data Matrix — L-shaped finder, clock track, ECC 200 | Better than QR at very small sizes; the right choice for cable tails and connector shells |
| **ISO/IEC 15417** | Code 128 — 107 characters in subsets A/B/C, mandatory check character | The 1D workhorse; what inherited/legacy estates are already labelled with |
| **ISO/IEC 15415** | Print-quality grading for 2D symbols | Matters if labels are printed in-house on cheap stock and must still scan after a tour |
| **GS1-128 / GS1 DataMatrix** | GS1 data carriers with application identifiers | The interoperable option if identifiers are ever to cross company boundaries |

**Identity keys (what goes *in* the mark).** FACT, search-extracted from GS1 material:

- **GIAI — Global Individual Asset Identifier.** For an individual asset "owned and managed by one
  organisation, such as tools, laptops, or equipment that require individual identification
  through their lifecycle". **This is the correct GS1 key for a serialized piece of AV kit.**
- **GRAI — Global Returnable Asset Identifier.** For returnable containers in transit — kegs,
  gas bottles, totes, pallets. INFERENCE: **a flight case is a GRAI.** A case is precisely a
  returnable container that goes out full and comes back to be refilled. Nobody in AV uses this.
- **SGTIN** — serialized GTIN, for individual items in a product line.
- **SSCC** — serial shipping container code; in EPCIS it is the canonical **parent ID** of an
  aggregation.

**Event interchange — EPCIS 2.0 (GS1).** FACT, search-extracted. EPCIS captures the
"what, when, where, why and how" of objects. Its event types are **ObjectEvent,
AggregationEvent, TransformationEvent, AssociationEvent, TransactionEvent**. Aggregation captures
"when an object is combined with other objects"; **DisaggregationEvent is its inverse**; the
crucial field is the **parent ID — the container** (an SSCC).

INFERENCE, and this is the biggest structural finding in the dossier: **EPCIS already is,
precisely and formally, the interchange format for "these 41 things are in this case, and the
case just moved".** AggregationEvent = sealing a case. DisaggregationEvent = unpacking it.
ObjectEvent = scanning an item to a job. The AV rental industry has independently reinvented all
of this — Rentman's Containers, Flex's Containers and Packages — in mutually incompatible
proprietary models, and **no AV product I found mentions EPCIS at all**. Every case manifest in
this industry therefore dies at the company boundary.

**RFID air interface.** FACT, search-extracted:

- **RAIN RFID = EPC Class-1 Gen-2 = ISO/IEC 18000-63**, passive UHF, ~860–960 MHz.
- **Europe (ETSI): 865–868 MHz**, limited channels, ~2 W EIRP depending on country. **US:
  902–928 MHz.** INFERENCE: a tag or reader bought in the US is not necessarily legal or
  performant in the EU — a genuine trap for a German company buying from US-centric vendors.
  Geartracking's own product listing is explicitly "RFID, 865–868 MHz".
- Gen2 anti-collision supports claimed read rates **up to 1,000 tags/second**.
- Real-world silicon in this industry: **Impinj M750** chips, in HID Global's Sentry Cable Tag
  and Sentry Duo Tag, "purpose-built for AV equipment like cables, flight cases, and speakers"
  (from the Rentex deployment).

**NFC / HF.** HireHop lists NFC alongside RFID as a supported identifier. INFERENCE: NFC (13.56 MHz,
NDEF payloads) is the phone-native option — no special reader — but it is single-tag, touch-range,
so it solves "identify this one box" not "inventory this truck".

**File-level interchange — the honest state of it.** CSV and TSV import/export is universal and is
effectively *the* interchange format of this segment (Homebox exports a bill of materials as TSV;
Snipe-IT, AssetTiger, Sortly all do CSV). Shure Wireless Workbench uses proprietary **show files**
and **show packs** and exports inventory to **CSV or PDF**. There is **no** equipment-identity
interchange format in AV comparable to what MVR/GDTF did for lighting fixtures. UNKNOWN whether
any such effort exists; nothing surfaced in searching.

---

## What this segment does WELL — the patterns worth stealing

1. **The case is a first-class container that tracks its own contents.** Rentman: seal a case,
   then scan *the case* to move all its contents between statuses without touching individual
   items, "both serialized and bulk", persisting across projects. Flex: build containers virtually
   "in the same way that they are built physically". This is the single most valuable idea in the
   segment and it is exactly the AV problem — a case of 40 adapters cannot be scanned item by item
   at 6am on a load-in.

2. **Sealing as a social contract, not just a data state.** "By sealing the Container, your crew
   will know that the contents of the case were not changed since it was sealed." The state
   carries a *trust claim* that lets the next person skip a check. INFERENCE: this converts a data
   field into a labour saving, which is the only reason warehouse staff ever adopt a feature.

3. **Damage flagging with an automatic availability consequence.** Cheqroom: flag damaged → asset
   auto-removed from rotation → evidence (description + photos) mandatory → repair ticket
   auto-created. The human does one action; the system does the four consequences.

4. **Multiple identifiers per unit, by design.** Flex's doctrine that RFID complements rather than
   replaces the barcode, with both on the same serialized unit and a scanner with separate
   triggers for each. HireHop supporting barcode, QR, RFID, NFC, serial *and* manual count in one
   product. Snipe-IT's Quickscan accepting an asset tag *or* a serial.

5. **Pluggable barcode decoding.** InvenTree's `/api/barcode/` fan-out to all plugins, first
   successful interpretation wins. The right answer for a warehouse full of other people's labels.

6. **Two-field serial identity.** Rentman's Internal Reference *plus* Manufacturer Serial Number.
   Short printable ID and stable external ID are different jobs and need different fields.

7. **Label geometry as a class hierarchy split tape-vs-sheet.** Snipe-IT's `Labels/Sheets/{Avery,
   Hema}` and `Labels/Tapes/{Brother,Dymo,Generic,Zebra}` with data-driven `Field`/`FieldOption`.

8. **Free seats for the people who only scan.** Rentman makes warehouse staff, technicians and
   freelancers **free basic users**, charging only for "power users" who plan and quote. INFERENCE:
   this is the correct commercial shape for this workflow, and its absence elsewhere (Cheqroom's
   per-admin billing) is a visible market irritation that competitors advertise against.

9. **Audit / spot-check as a named, logged, first-class workflow.** HireHop's "Spot Check" for
   warehouse-wide audits, logged in Asset Status reports with who performed it and when;
   Snipe-IT's bulk audit; itemit's "QR Quick Audit".

10. **Blocking rules at the point of scan.** HireHop prevents equipment with test failures or
    damage from being sent out, prevents an asset being sent to two jobs at once, and stops
    over-sending. INFERENCE: enforcement at the scan is worth more than any report, because it is
    the last moment before the mistake leaves the building.

11. **Vertically integrated, application-specific tag hardware.** Geartracking (Rentman's own
    subsidiary) selling tags pre-tested for cables, aluminium frames and metal cases. The software
    vendor owning the tag failure modes is a genuine moat.

12. **Per-serial periodic inspection scheduling** (Rentman): a Maintenance list of every serial
    number with its next inspection due date — the shape DGUV V3 / PAT regimes require.

---

## What NOBODY in this segment solves well — the white space

1. **Offline is shallow, tier-gated, and dishonestly marketed.** This is the clearest gap. The
   evidence:
   - **EZOfficeInventory**: the help article scopes offline to *adding work logs to work orders*,
     auto-synced on reconnect. That is not offline check-out.
   - **Sortly**: offline is **mobile-only, not on the web app**, and explicitly "only updates
     inventory levels on your device"; disabling sync freezes your view of inventory at that
     moment.
   - **Asset Panda**: offline mode exists but arrived only with "Asset Panda Pro" (2025-09-11) and
     is reported as **gated to the Enterprise tier** — i.e. sold as a premium feature rather than
     assumed as a baseline.
   - **Cheqroom**: claims offline check-in/out on marketing pages; the conflict-resolution
     semantics are undocumented as far as I could reach.
   - **Snipe-IT**: browser-based scanning against a server — structurally cannot work offline.
   - **Rentman**: no offline claim found at all.

   INFERENCE: no product in this survey presents a genuinely **offline-first** model — a local
   authoritative store, an explicit durable operation queue, and a defined conflict-resolution
   policy when two people scanned the same unit to two jobs while both were disconnected. The
   third-party offline-first scanning tools that do exist (Cleverence, Stockria) are generic
   warehouse apps with no AV domain model. **A loading dock is a Faraday cage with a metal roof;
   this is not an edge case, it is Tuesday.**

2. **No interchange format for case contents — despite one existing.** EPCIS 2.0's
   Aggregation/Disaggregation events *are* the standard for "what is in this container and when
   did it change", and the AV industry uses none of it. Every vendor's case model is proprietary,
   so a manifest cannot cross a company boundary — which is exactly what happens on every
   multi-vendor show. Nothing exports "case A-12 contains these 41 serials" in any form another
   system can read.

3. **The plan and the warehouse are different universes.** A cable on a signal-flow drawing, a
   line on a packing list, and a serialized unit with a barcode are three unrelated objects in
   three unrelated tools. Nobody closes the loop from *designed* → *packed* → *scanned* →
   *verified on site*. INFERENCE: this is the largest structural gap and the one most relevant to
   this repository.

4. **Cable-level tracking is economically unsolved.** The tag, the labour to fit it and the
   failure rate of a tag on a coiled, trodden-on, gaffer-taped cable often exceed the cable's
   value. Geartracking's answer is heat-shrink hardtags; Metalcraft/HID's is a purpose-built
   Sentry Cable Tag. Both are hardware answers to what is partly a modelling problem: the industry
   has no accepted middle ground between "track every cable individually" and "track a bag of 20
   cables as one quantity with no identity". UNKNOWN whether any vendor models a *bulk lot with a
   count and a shared tag*.

5. **Sub-hire gear has no identity.** Rentman is the best case found — sub-rentals on the same
   packing slip, digital requests between Rentman accounts — but the sub-hired unit still has no
   durable record in your system. You cannot answer "did *that* specific hired-in monitor come
   back damaged, and is it the same one we had last month". Cross-company identity is the whole
   point of GS1 keys, and the industry does not use them.

6. **Damage evidence is decoupled from technical context.** Photo plus free text plus a flag. No
   product ties a fault to *where in the signal chain the failure showed* — which port, which run,
   which patch. INFERENCE: an intermittent SDI fault is diagnosable from the signal path and
   nearly undiagnosable from a photo of a connector.

7. **RFID's physics is pushed onto the user.** Metal cuts read range by 30–50%; you need a clear
   3×3 m scanning zone; you need seven tag types for one inventory. Nobody has solved *reading
   through a stacked wall of metal road cases*, which is the actual physical situation on a dock.
   The Kit Check benchmark — a sealed tray of ~198 items read in seconds — works because the
   contents are small, non-metallic and inside a controlled scanning box. The AV equivalent does
   not exist. INFERENCE: an **RFID-equipped case with an internal antenna that inventories its own
   contents** is an obvious unbuilt product.

8. **Statutory inspection regimes are a bolt-on, not a model.** German **DGUV V3** requires
   audit-proof per-device inspection records; the ecosystem answering this is largely *separate*
   DGUV-specific tools (ElektroPrüfManager, Wartungsplaner) plus test-instrument exports that must
   be "imported into device management systems". Rentman's per-serial periodic inspections are the
   closest integrated answer found. INFERENCE: a German AV company today runs asset tracking in one
   system and DGUV compliance in another, and reconciles by barcode.

9. **Pricing punishes the actual usage shape.** A rental warehouse has few planners and many
   occasional scanners. Per-admin-seat (Cheqroom) and per-user (Current RMS, HireHop) billing both
   tax exactly the people who need write access at 6am. Only Rentman's free-basic-user model fits,
   and it charges for the audit trail as a separate add-on.

10. **No open QR payload convention.** Every vendor encodes its own scheme — Rentman's separate
    item and serial QR codes, InvenTree's JSON-or-short internal formats, Scanlily's plain URLs,
    Snipe-IT's asset-detail URL. A generic phone camera scanning a competitor's tag gets nothing
    useful. GS1 Digital Link exists to solve exactly this and is absent from this market.

---

## Relevance to AV Planner Suite

**Primary — `cable-planner`.** This is where the segment lands hardest, for four reasons:

- `EquipmentItem` already exists as a domain type (`src/renderer/types/`). The gap between it and a
  *serialized unit* is the gap this whole segment fills. The Rentman two-field pattern
  (**Internal Reference + Manufacturer Serial Number**) and Flex's **array-of-identifiers**
  doctrine should shape that schema before it ossifies — one `barcode: string` field is the
  mistake to avoid. New optional fields belong in `healProjectPositions` per the project's
  migration convention.
- **`LocationFrame` is conceptually adjacent to a case.** The container/aggregation model —
  seal a case, scan the case, contents follow, unseal to disaggregate — maps onto a planner that
  already understands spatial grouping. A "case = container of equipment items" type would let
  cable-planner emit a **packlist** that a warehouse can actually scan against, which is the
  missing link between a plan and a load-out.
- **Offline-first is already the house architecture.** The suite is Electron, explicitly
  offline-first, with atomic writes and CRDT convergence checks in the toolchain
  (`npm run test:crdt`). That is precisely the capability the entire commercial segment lacks. A
  planner that can queue scans durably on a laptop in a truck and converge later is doing
  something Sortly, EZO and Asset Panda demonstrably cannot.
- **DGUV V3.** German market, event technology, per-device audit-proof inspection records, and a
  German-language product. Attaching an inspection date and protocol reference to a serialized
  item is a small feature with disproportionate local value, and the incumbents treat it as a
  bolt-on.

**Secondary — `shell` / suite.** Asset identity is inherently cross-app: the same serialized
camera appears in `multicam-planner`, the same fixture in `light-planner`, the same cable in
`cable-planner`. A **shared asset-identity package** in `packages/` — identifier types, QR/barcode
payload conventions, a case/container model, a scan-event log — is the natural suite-level
concern, and is the thing no competitor can offer because none of them own the planning tools too.
The interchange target should be **EPCIS-shaped events** (Object / Aggregation / Disaggregation
with a parent container ID), even if only used internally at first, because it is the one
standard that already models exactly this and costs nothing to align with early.

**Secondary — `multicam-planner`, `light-planner`.** Same equipment-identity and case needs, one
level less cable-specific. Lighting in particular already has fixture-level interchange culture
(GDTF/MVR), so the identity question there is about mapping a *planned fixture* to a *tagged unit*.

**Low relevance — `broadcast-intercom`, `tally-pi`, `sony-camera-bridge`, `pi-media-station`.**
These are live-operations tools working with devices addressed by network identity, not physical
custody. The one genuine touchpoint (INFERENCE): a device's **serial number is the join key**
between the unit that was scanned out of the warehouse and the unit answering on the network — a
tally or camera bridge that can report the serial of the box it is talking to closes the
plan↔warehouse↔runtime loop that nobody in this segment closes. Worth noting; not worth building
against yet.

**Explicitly not worth pursuing:** competing with rental ERPs on invoicing, availability pricing
or sub-hire finance. Those are Rentman's and Flex's core, defended by decades of accounting
edge-cases. The defensible position is the part they are structurally bad at — **the plan-to-case
link, and working offline.**

---

## Sources

**Pages I opened directly (primary; full content read):**

- https://raw.githubusercontent.com/grokability/snipe-it/master/README.md
- https://raw.githubusercontent.com/grokability/snipe-it/master/composer.json
- https://github.com/grokability/snipe-it/releases
- https://github.com/grokability/snipe-it/releases.atom
- https://github.com/grokability/snipe-it/tree/master/app/Models/Labels
- https://github.com/grokability/snipe-it/tree/master/app/Models/Labels/Sheets
- https://github.com/grokability/snipe-it/tree/master/app/Models/Labels/Tapes
- https://github.com/Shelf-nu/shelf.nu
- https://github.com/Shelf-nu/shelf.nu/releases.atom
- https://github.com/inventree/InvenTree

**Pages cited by search-result extraction (I did NOT open these; the egress proxy blocked them).
Every price and most feature claims above trace to this list and must be re-verified here:**

Cheqroom — https://www.cheqroom.com/pricing/ ·
https://www.cheqroom.com/features/equipment-checkout-software/ ·
https://www.cheqroom.com/features/mobile-app/ · https://www.cheqroom.com/features/process-maintenance/ ·
https://www.cheqroom.com/features/asset-tracking-software/ · https://www.cheqroom.com/solutions/production/ ·
https://www.cheqroom.com/equipment-checkout/ ·
https://knowledge.cheqroom.com/helpcenter/how-do-i-perform-maintenance-and-repair-in-cheqroom ·
https://knowledge.cheqroom.com/helpcenter/how-to-create-and-manage-check-outs-and-check-ins ·
https://help.cheqroom.com/en/articles/721001-using-webhooks-to-notify-other-software ·
https://help.cheqroom.com/en/collections/1365030-api-integrations ·
http://checkroom.github.io/checkroom_core_js/ · https://frontdeskreview.com/software/asset-tracking/cheqroom/ ·
https://www.capterra.com/p/140824/CHEQROOM/pricing/ · https://www.itefy.com/compare/cheqroom-alternative

Rentman / Geartracking — https://rentman.io/pricing · https://rentman.io/pricing/crew ·
https://rentman.io/product-updates/containers · https://rentman.io/solutions/rental-equipment-tracking-software ·
https://rentman.io/solutions/inventory-management · https://rentman.io/solutions/equipment-tracking-software ·
https://rentman.io/product-updates/tell-subrentals-apart-from-your-own-equipment-on-digital-packing-slips ·
https://rentman.io/blog/7-tips-to-successfully-set-up-your-qr-codes-barcodes ·
https://rentman.io/blog/benefits-of-rfid-asset-tracking · https://rentman.io/blog/rfid-101-key-takeaways-from-our-latest-expert-session ·
https://rentman.io/de/blog/dguv-v3-prufung ·
https://support.rentman.io/hc/en-us/articles/360013101260-Set-up-QR-Codes-and-Barcodes ·
https://support.rentman.io/hc/en-us/articles/360013086279-Manage-Serial-Numbers ·
https://support.rentman.io/hc/en-us/articles/360017649020-Are-QR-codes-for-equipment-items-and-QR-codes-for-serial-numbers-different ·
https://support.rentman.io/hc/en-us/articles/27788966430994-Tracking-equipment ·
https://support.rentman.io/hc/en-us/articles/360013478180-Scanner-Options-in-Rentman ·
https://support.rentman.io/hc/en-us/articles/360015609959-Zebra-Scanners ·
https://support.rentman.io/hc/en-us/articles/36515689863186-Using-RFID-in-the-Warehouse-Workflow-and-Best-Practices ·
https://support.rentman.io/hc/en-us/articles/360016429760-Managing-Periodic-Inspections ·
https://support.rentman.io/hc/en-us/articles/360016429680-Handling-Defective-Equipment ·
https://support.rentman.io/hc/en-us/articles/360013845340-Subrent-from-Other-Rentman-Users ·
https://support.rentman.io/hc/en-us/articles/20641324000018-I-Worked-with-Containers-How-Do-I-Get-the-Same-Functionality-with-the-New-Equipment-Types ·
https://support.rentman.io/hc/en-us/articles/26707946497042-Rentman-API-Changelog ·
https://support.rentman.io/hc/en-us/articles/360013767839-The-Rentman-API · https://api.rentman.net/ ·
https://geartracking.com/ · https://geartracking.com/pages/about-us · https://geartracking.com/products/sample-pack-rfid-qr

Flex Rental Solutions — https://www.flexrentalsolutions.com/flex-rfid-tracking-software/ ·
https://www.flexrentalsolutions.com/flex-rfid-tracking-software/rfid-package/ ·
https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/360013969334-Using-RFID-Scanning-in-Flex ·
https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/12053032516503-Containers-and-Packages ·
https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/12053061513239-Virtual-Items ·
https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/4407098821271-Inventory-Dashboard ·
https://helpcenter.flexrentalsolutions.com/hc/en-us/articles/360011449153-Flex4-The-Inventory-Tree ·
https://www.manula.com/manuals/frs/flex-user-manual/1/en/topic/build-containers-and-packages

Snipe-IT / Shelf / InvenTree / Homebox — https://snipeitapp.com/product · https://snipeitapp.com/pricing ·
https://snipe-it.readme.io/docs/barcodes · https://snipe-it.readme.io/docs/asset-labels ·
https://snipe-it.readme.io/reference/api-overview · https://github.com/grokability/snipe-it/issues/4644 ·
https://github.com/grokability/snipe-it/issues/5489 · https://github.com/grokability/snipe-it/discussions/13543 ·
https://www.shelf.nu/solutions/open-source-asset-management · https://www.shelf.nu/solutions/asset-tracking ·
https://www.shelf.nu/alternatives/snipe-it · https://docs.inventree.org/en/stable/barcodes/internal/ ·
https://docs.inventree.org/en/latest/plugins/builtin/inventree_barcode/ ·
https://docs.inventree.org/en/stable/app/barcode/ · https://inventree.org/blog/2023/10/29/barcodes ·
https://sascha-brockel.de/en/homebox-home-inventory-with-qr-codes-maintenance-tracker/

Other vendors — https://www.hirehop.com/en-features/ · https://www.hirehop.com/announcement/08-11-23/ ·
https://www.hirehop.com/updates/ · https://hirehop.biz/pricing/ · https://www.capterra.com/p/155333/HireHop/pricing/ ·
https://www.sortly.com/pricing/ · https://help.sortly.com/hc/en-us/articles/360060638832-Can-I-use-Sortly-in-offline-mode ·
https://help.sortly.com/hc/en-us/articles/6660883031451-Sortly-Mobile-App ·
https://ezo.io/ezofficeinventory/blog/offline-mobile-app/ · https://ezo.io/ezrentout/blog/guide-scanning-ezrentout-mobile-app/ ·
https://ezo.io/ezofficeinventory/mobile-app/ · https://ezo.io/ezrentout/features/ ·
https://costbench.com/software/it-asset-management/ezofficeinventory/ ·
https://frontdeskreview.com/software/asset-tracking/ezofficeinventory/ ·
https://www.capterra.com/p/142562/Asset-Panda/pricing/ · https://airpinpoint.com/compare/asset-panda-alternative ·
https://checkthat.ai/brands/asset-panda/pricing · https://timly.com/en/asset-inventory-software/ ·
https://trusted.de/timly-inventur · https://itemit.com/pricing/ · https://itemit.com/asset-tags/ ·
https://www.assettiger.com/pricing · https://www.scanlily.com/en/pricing · https://www.scanlily.com/en/industries/media ·
https://www.current-rms.com/features/inventory-management · https://www.capterra.com/p/142401/Current-RMS/ ·
https://www.xpay.sh/saas-pricing/current-rms/ · https://booqable.com/barcode-scanning/ ·
https://www.g2.com/products/booqable-rental-software/pricing · https://cloudrent.me/the-ultimate-software-for-sub-rental-or-cross-hire/ ·
https://www.protonic-software.com/de/easytools/scanner/ · https://help.protonic-software.com/de/documentation/easyjob_barcoding_26 ·
https://www.easyjobx.com/manuals/easyjob-scannerapp-de.pdf · https://www.easyjobx.com/manuals/easyjob-barcoding-de.pdf ·
https://www.softguide.de/programm/epirent-vermietungssoftware-fuer-veranstaltungstechnik ·
https://www.eventworx.biz/ · https://verleih-system.de/vermietungssoftware-fuer-veranstaltungstechnik/ ·
https://inventorybase.co.uk/ · http://www.recsolutions.com/geartrack · https://geartrack.pro/

Standards, hardware and case studies — https://www.gs1.org/standards/id-keys/global-individual-asset-identifier-giai ·
https://www.gs1.org/standards/id-keys/grai · https://www.gs1uk.org/knowledge-hub/standards/what-is-a-giai ·
https://www.gs1.org/standards/epcis · https://openepcis.io/docs/epcis/ ·
https://www.ibm.com/support/pages/about-epcis-aggregation-and-disaggregation-events ·
https://ref.gs1.org/standards/gen2/ · https://therainalliance.org/wp-content/uploads/2024/04/RAIN-RFID_System_Design_Guidelines-V2-UPDATED-2.pdf ·
https://www.rfidlabel.com/what-is-rain-rfid-demystifying-gs1-epc-gen2-and-iso-18000-63-global-standards/ ·
https://cipam.com/en/rfid-frequencies-and-standards/ · https://onbarcode.com/qr_code/ ·
https://www.accusoft.com/barcodes/data-matrix-barcodes/ ·
https://www.impinj.com/library/customer-stories/rentex-taps-hid-global-for-av-rental-asset-tracking-with-rain-rfid ·
https://wiot-group.com/think/en/articles/av-equipment-rental-is-sped-up-by-uhf-rfid/ ·
https://www.rfid.com/case_studies/how-rentex-used-rfid-to-streamline-rental-asset-management/ ·
https://www.idplate.com/blog/rfid-for-av-rental-companies-how-it-prevents-loss-and-speeds-up-turnaround/ ·
https://bluesight.com/rfid-medication-management/ · https://www.rfidjournal.com/news/hospital-pharmacy-keeps-emergency-medication-kits-in-check/83880/ ·
https://www.zebra.com/us/en/products/spec-sheets/mobile-computers/handheld/tc22-tc27.html ·
https://content-files.shure.com/Pubs/WWB6/en-US/en-US/c_bcaebf77-bffb-4278-8fe1-f317895a62e7.html ·
https://content-files.shure.com/Pubs/WWB/en-US/en-US/reports.html · https://www.shure.com/en-US/products/software/wwb ·
https://www.esg-gesellschaft.de/pruefleistungen/digitale-pruefprotokolle · https://elektropruefung-software.de/ ·
https://scanbot.io/blog/mobile-offline-barcode-scanner-app/ · https://stockria.com/features/offline-mode ·
https://www.cleverence.com/articles/business-blogs/barcode-scanner-app-2026-4729/

**Open questions a follow-up pass should close (in priority order):**

1. **Cheqroom pricing unit** — per month or per year? Open `cheqroom.com/pricing` directly. A 12×
   error in the headline price of the segment's premium product is not acceptable in a comparison.
2. **Rentman offline scanning** — search `support.rentman.io` for "offline". Currently a total
   blank, and it is the most decision-relevant unknown for this repository.
3. **Cheqroom offline conflict semantics** — what happens when two disconnected users check out
   the same unit.
4. **Shelf hosted pricing** — `shelf.nu` pricing page never opened.
5. **Scanlily's actual tier figures** — the item-count thresholds and prices.
6. **easyjob pricing and offline behaviour** — the two PDF manuals on `easyjobx.com` are public
   and would answer the barcode-format and serial-number questions definitively.
7. **Yellowfish / Rentcorp** — needs a verified URL from whoever supplied the seed name; may not
   exist under that name.
8. **Whether any AV vendor implements EPCIS** — searched, found nothing, but absence of evidence
   at this depth is weak evidence of absence.
