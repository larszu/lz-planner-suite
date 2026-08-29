# Event / Rental Management (ERP for AV rental houses)

> Research date: **2026-08-28**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read on a cited page), **INFERENCE** (reasoning), **UNKNOWN / unverified**.

## Source-access caveat (read this before trusting any number)

The research environment for this pass could reach **only `github.com` / `raw.githubusercontent.com`**
through the egress proxy. Every other vendor domain — `rentman.io`, `current-rms.com`,
`booqable.com`, `hirehop.com`, `protonic-software.com`, review aggregators, even Wikipedia —
returned `EGRESS_BLOCKED` / `CONNECT tunnel failed, response 403`.

Consequence, stated plainly:

- Three URLs were **opened directly** (all on GitHub). They are marked as such in *Sources*.
- Everything else was obtained from **web-search result summaries of those pages**, i.e. a
  search engine read the vendor page and I read its extraction. That is one step removed from a
  primary source and is *weaker* than METHOD.md's tier-1 "primary technical source".
- Therefore **every price and every feature claim below that is not from GitHub is marked
  `[via search summary]`**. Prices in particular must be re-checked against the live pricing page
  before being used in any commercial comparison — which METHOD.md already requires anyway.
- Where a search could not establish something, it says **UNKNOWN**, not a guess.

## Segment summary

This category is the **commercial and logistical backbone of a rental house**: the system that
knows what gear exists, whether it is free on a given date, who it is promised to, what it costs,
who is driving it where, and whether the customer has paid. It is an ERP narrowed to one
business model — *the same physical asset is sold repeatedly over time* — which is why a generic
ERP or a generic project tool never quite fits: the hard problem is **availability over a time
axis with reservations, sub-rentals, kits and serials all resolving against the same stock**.

Typical functional spine (FACT, consistent across every product examined):

```
customer/CRM → quote/opportunity → project/job → equipment reservation (+ crew, + transport)
             → warehouse prep & scan-out → on site → scan-in & damage/loss → invoice → reports
```

**Who buys it.** AV and event-technology rental companies (dry hire and full service), lighting
and audio suppliers, staging companies, broadcast facility and OB providers, camera/lens rental
houses, university and broadcaster in-house equipment pools, party/tent rental. Buying is
usually done by an owner or ops manager, not IT; the deciding pain is nearly always
double-booking, shortages discovered too late, or invoices that miss chargeable items.

**Typical price band** (all `[via search summary]`, seen 2026-08-28):

| Tier | Band | Examples |
| --- | --- | --- |
| Self-serve SMB | ~€/$ 29–90 per month entry | Booqable from $29/mo; EZRentOut from $29/mo; HireHop £46 first user; Rentman €39/mo platform + per-power-user |
| Mid-market per-seat | ~$50–90 per user per month | Current RMS / OnRent Events; RentalPoint from ~$86/mo |
| Per-location, unlimited users | ~$435–510+ per month per warehouse | Flex Rental Solutions |
| Per-admin-seat asset tools | $184–367 per admin per month (annual) | Cheqroom |
| Enterprise / sales-contact only | no public price | easyjob (S–XL), Point of Rental Elite, R2, HireTrack NX / RentalDesk NX, Xytech |

**Structural note (FACT, `[via search summary]`):** the segment consolidated in 2026. UK-based
**Klipboard** is rebranding **inspHire and Current RMS under one "OnRent" brand**, with Current RMS
becoming **OnRent Events**; Klipboard states this is "a name change only" with functionality
unchanged (International Rental News, June 2026). Current RMS's own help centre already serves
pages under the "OnRent Events Help Center" title, which corroborates the rollout.

## Product table

All Platform / Price / Offline / API cells are `[via search summary]` unless marked **[opened]**.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Rentman** | Rentman B.V. (NL) | Cloud web + iOS/Android app | €39/mo platform base + per **power user**; basic users (warehouse/crew) free; add-ons priced separately. Entry figures seen range €14–39 per power user/mo depending on product/tier — **see Deep dive, the figures conflict** | Mobile app for prep/scan; **offline behaviour UNKNOWN** (no vendor statement found) | REST public API (token), **webhooks**, sandbox, **MCP server (public beta)** | AV/event rental where equipment *and* crew *and* transport are planned in one project |
| **Current RMS → OnRent Events** | Klipboard (UK) | Cloud web | Per user/mo with an on-site calculator; entry figures seen $62–79 first user, ~$27/extra user; annual = 12 months for the price of 11 | Cloud-only; **offline UNKNOWN** | REST `https://api.current-rms.com/api/v1`, **OAuth2 + API keys** (`X-AUTH-TOKEN` / `apikey`) | Opportunity-centric quoting, sub-rental shortage handling, asset testing & maintenance |
| **Booqable** | Booqable (NL) | Cloud web + iOS | Essential $29 / Pro $79 / Premium $249 per month; annual discount | **UNKNOWN** | **API v4 "Boomerang", JSON:API**, per-company host `https://{company}.booqable.com/api/4`, Bearer token, **webhooks**; docs repo on GitHub **[opened]** | Rental businesses that sell online — storefront + bookings + payments |
| **HireHop** | HireHop Software (UK) | Cloud web | Free limited single-user tier; **£46/mo first user + £23/mo each extra user** (+VAT); enterprise custom | **UNKNOWN** | REST, user-token via GET/POST, JSON or form-encoded bodies, **webhooks** (JSON POST with `event`/`data`), JS **plugins** for custom fields/UI | Cheapest credible full-feature hire system; unusually open/hackable |
| **easyjob 6** | protonic software GmbH (DE, Hanau) | Windows client + server + **WebApp** | Editions **S / M / L / XL**; vendor publishes no price (sales contact); a free single-person version is referenced | Rich Windows client on own server ⇒ **LAN-resilient by architecture** (INFERENCE, not a vendor offline claim) | **easyjob WebApi** — JSON, items/availability/addresses/projects, partially writable; used by CrewBrain over REST | German-market depth: multi-site, multi-warehouse, multi-currency rental+production+event logistics |
| **Flex (Flex Rental Solutions)** | Flex Rental Solutions (US) | Cloud web + scanning apps | **Per warehouse location, unlimited users**; base ~$435/mo, plans from ~$510/mo; +$150 second location, $100 for locations 3–5, $75 beyond | **YES — "scanning works in both online and offline modes, syncing data when connectivity returns"** | Flex API exists; **REST APIs stated as in-development for Flex5** | Large live-event/production shops; no per-user tax on warehouse staff |
| **Point of Rental** (Essentials / Elite / Syrinx 365) | Point of Rental (US/UK) | Cloud-native and self-hosted variants | Monthly plans, largely sales-contact | **UNKNOWN** | **Global API** across Elite/Essentials/Syrinx at `api.pointofrental.com/docs`; `X-Filter` request header; Syrinx 365 endpoints for accounting/ecommerce/GPS | Breadth across all rental verticals, not only AV; enterprise scale |
| **EZRentOut (EZO)** | EZO (US) | Cloud web + mobile | From **$29/mo** entry | **Yes — "offline work logs … sync back the moment a connection returns"** | REST API; trial accounts limited to ~1000 requests/day | Asset-tracking-first rental: barcode/RFID, utilisation and revenue reporting |
| **Cheqroom** | Cheqroom (BE/US) | Cloud web + mobile | **Per admin seat, billed annually**: Core $184 / Business $275 / Enterprise $367 per admin/mo; **unlimited regular users and items**; location caps 1 / 3 / 10 | **UNKNOWN** | API available (detail UNKNOWN) | Check-in/check-out UX for production and media teams; not a full rental ERP |
| **HireTrack NX / RentalDesk NX** | Navigator Systems (UK) | Windows + bundled **SQL Server**, on-prem | Sales contact | On-prem/LAN (INFERENCE) | Web apps buildable on top; public REST API **UNKNOWN** | Deep AV/sound/lighting rental; barcode + **HireTAG RFID**; multi-site financial centres |
| **RentalPoint** | RentalPoint Software | Browser + mobile dashboard | From ~$86/mo, mostly personalised | **UNKNOWN** | **UNKNOWN** | Long-established AV rental (vendor states development since 1986); e-signature, driver/warehouse dashboards |
| **R2** | Unique Business Systems (US) | Cloud | Sales contact | **UNKNOWN** | API stated | Enterprise AV rental with labour planning and BI in one system |
| **IntelliEvent Lightning** | IntelliEvent (US) | Cloud | From ~$99/mo | **UNKNOWN** | API; QuickBooks, Google Calendar, Avalara | CRM-led event rental with global labour scheduler and sub-rental |
| **Eventworx** | Eventworx (DE, Berlin) | Cloud | Packages (net €/month); CrewBrain interface from package M, interface itself free | **UNKNOWN** | API token (Program settings → API); **CrewBrain sync**; **ZUGFeRD + XRechnung** invoice output; DATEV | German rental with e-invoicing compliance and a clean crew-planning handoff |
| **Rentsoft** | Rentsoft (DE) | Cloud, modular ERP | **UNKNOWN** | **UNKNOWN** | **UNKNOWN** | German multi-vertical rental ERP with own online booking |
| **Shelf** (`shelf.nu`) | Shelf-nu, **AGPL-3.0 open source** **[opened]** | Web; self-host via **Docker / Fly.io** (needs Supabase) or hosted | Open source; hosted pricing UNKNOWN | Web app; **offline UNKNOWN** | Public API not documented in the repo **[opened]** | Free/self-hosted QR asset tracking + bookings + kits + custody; React 19 / Prisma / Postgres |
| **Louez** | Synapsr, open source | Next.js / TypeScript / MySQL, Docker Compose, self-host or cloud | Open source | **UNKNOWN** | **UNKNOWN** | Self-hosted "Booqable alternative": inventory, reservations, customers, contracts, storefront |
| **Xytech** (MediaPulse / Fabric / ScheduALL) | Xytech Systems (US) | Cloud/on-prem enterprise | Enterprise, sales contact | **UNKNOWN** | **REST API v3, webhooks, X2 MCP server with tool-level OAuth, `llms.txt` docs** | Broadcast/transmission facility ERM — the upmarket neighbour of this segment |
| **CrewBrain** | CrewBrain (DE) | Cloud | **UNKNOWN** | **UNKNOWN** | **REST API + webhooks**, 12 pre-configured integrations | Adjacent: crew scheduling, time tracking, qualification/certificate expiry (incl. DGUV-relevant certs) |

Seed-list products that could **not** be verified as existing under that name:

- **inteliRENT** — no product found. The closest real products are **IntelliEvent Lightning** and
  **InTempo**. Treat the seed name as unverified. UNKNOWN.
- **Nomad Rental** — searches resolve to *Nomad* (US residential property management, 4%/mo model),
  which is a different category entirely. No AV/event "Nomad Rental" found. UNKNOWN.
- **Kitcheck / Kit Check** — no AV/event rental product found under that name. UNKNOWN.
- **MIETmeister**, **TopKontor (Vermietung)** — not found in German rental-software results.
  German results instead surface **TOPIX**, **VARIO**, **MCS**, **MIRA**, **Rentsoft**, **Rentware**,
  **Rendesk**, **epirent**, **maja.cloud**, **DRIU Verleih-System**. UNKNOWN for the seed names.
- **easyjob (L&L)** — the vendor is **protonic software GmbH**, not "L&L". Note also the collision
  with **easyJOB by BECAUSE Software**, a German *advertising-agency* ERP. They are different
  products; German price snippets around "easyjob ab €39" plausibly refer to the agency product,
  so that figure is **not** attributed to rental easyjob here.

## Deep dives

### 1. Rentman (NL) — the reference implementation for AV/event

**What it does.** One project object carries equipment, crew and transport together; the vendor's
own product update is titled "Instantly plan crew and transport in a project". Sub-rental,
quoting/invoicing, webshop, warehouse scan flows, periodic inspections. Marketing claims
"more than 250,000 professionals in over 100 countries" `[via search summary]` — that is a vendor
claim, not independently verified.

**Data model** (FACT `[via search summary]`, from the vendor support centre):

- **Item** = a *type* of equipment; an item may hold multiple **serial numbers** = physical units.
- A serial number carries **two** identifiers: an **Internal Reference** (the default identifier
  shown throughout the app) and the **Manufacturer Serial Number** (used for insurance, rental to
  third parties, and the Maintenance module). This split is a good idea and worth stealing — the
  house's own asset ID and the maker's serial are genuinely different keys.
- **Equipment combinations** = kits / cases / accessories, for gear that always travels together.
  Combinations are themselves serialisable. Serials for *accessories* can only be assigned after
  the accessory is planned into a project, usually by scanning.
- Per-item tabs: data + QR code, serial numbers, contents, accessories, **alternatives**,
  **suppliers**, **periodic inspections**, webshop.
- Availability is read either on an **equipment timeline** or via a quick availability lookup.

**Integrations / API.** REST public API with a personal **API token**; access per call is
determined by the **role of the user who minted the token**. Two-way (read + write + delete).
**Webhooks** fire on add/edit/delete of entities (project, contact, serial number …) and POST a
payload that names the changed entity plus hints for fetching detail from the public API;
configured under Configuration → Integrations → Webhooks. Some endpoints return **403 due to rate
limiting**, and those responses are *not always documented per endpoint* — a real integration
hazard. There is an API changelog and a sandbox environment. Zapier and Make connectors exist.

**2026 notable:** Rentman ships a **Model Context Protocol server (public beta)** built on top of
the public API, letting Claude/ChatGPT-class clients query Rentman in natural language; an account
admin must enable the MCP permission per user role, then the workspace exposes a connection link.
This is the first MCP surface I found in this segment other than Xytech's.

**Strengths.** Crew + transport + equipment in one plan; transport computes distance/cost and
supports multiple jobs per ride with weight and volume; a genuinely rich equipment model;
free basic users so warehouse staff are not a licence line item; API + webhooks + sandbox + MCP.

**Limits.** Pricing is a matrix, not a number: €39/mo platform base, per-power-user charges, plus
**add-ons that gate basics** — figures seen include Quoting & Invoicing €9/user/mo, Equipment
Tracking €9/user/mo, History Logs €12/user/mo, with per-power-user entry points quoted variously as
€14 (Inventory), $14 (Crew), $19 and €39. **These figures come from different pages and different
aggregators and do not reconcile** — treat the *shape* (base fee + per-power-user + add-ons) as
FACT and every individual number as unverified until the live pricing page is read. Offline
capability is **UNKNOWN**: the mobile app is documented for prep/scan/repairs on Android, iOS and
Android Zebra scanners, but no vendor statement about working without a connection was found.

### 2. Current RMS → OnRent Events (Klipboard, UK)

**What it does.** The **Opportunity** is the spine: quote → job, with real-time availability of
products *and their accessories* shown as you build it. Sub-rental shortages are surfaced on the
Opportunity screen itself so gear can be sourced before it becomes a crisis. Crewing and complex
kits are handled in the same object.

**Data model** (FACT `[via search summary]`, vendor help centre):

- **Product** → **Stock levels** = "the physical units of products … used to tell the system how
  many items are available". Serialised stock levels can **auto-generate asset numbers**.
- **Assets** carry an action log: allocated, prepped, booked out, checked in, plus global check-in.
  Asset numbers are scanned or typed on the opportunity detail view to allocate a specific unit.
- **Testing & Maintenance**: custom inspections, per-equipment test intervals, full test history,
  printable test documents, and — the good bit — **a warning when an asset that is due for testing
  is allocated to an opportunity**. Compliance enforced at the point of booking, not in a report.
- Inventory **audits** by product, product group, stock type or tag.
- **Services** and **bookable resources** carry their own costs, and there is a monthly rate engine.

**API.** `https://api.current-rms.com/api/v1`. Auth by API key in query (`apikey=`) or header
(`X-AUTH-TOKEN`); **OAuth2 also supported and recommended by the vendor over API keys**. A Postman
collection is published for updated docs with code snippets.

**Pricing.** Per user per month with a **calculator on the pricing page** (currency selectable:
USD/GBP/EUR/AUD/ZAR); annual billing = **12 months for the price of 11**. Third-party figures seen
2026-08-28 include "$62/mo first user + $27/mo extra users (Basic)", "$71/user/mo", "$79/user/mo",
"$50.41/user/mo" — mutually inconsistent aggregator numbers; **the vendor calculator is the only
trustworthy source and could not be opened.** Marked unverified.

**Limits.** Cloud-only; no offline story found. Brand/product continuity risk is now a live
question for buyers given the Klipboard/OnRent consolidation (INFERENCE: rebrands of two
overlapping products under one brand usually presage convergence, but Klipboard explicitly says
functionality is unchanged — do not over-read this).

### 3. HireHop (UK) — the open one

**What it does.** Full hire management — inventory, quoting, job scheduling, maintenance tracking,
customer-specific pricing — at the lowest credible price point in the segment, with a genuinely
free single-user tier.

**Price** (FACT `[via search summary]`, seen 2026-08-28, **as advertised**): free limited plan for
one user; **£46/month first user, £23/month per additional user, plus VAT** (also quoted as
$63 / $31.50); no setup fee, no card for the free tier.

**API — the differentiator.** The vendor's own framing: *"HireHop is built on top of an API,
meaning anything you see HireHop do, you can also accomplish using the extensive API."* Access is a
**user token** passed as GET or POST to the endpoint; endpoints are served from three domains
(`hirehop.net`, `myhirehop.com`, `myhirehop.co.uk`). POST bodies may be **JSON (standard REST) or
URL-encoded (standard AJAX)**. **Webhooks** POST JSON containing `time`, `user_id`, `user_name`,
`user_email`, `company_id`, `export_key`, `event`, `data`. **Custom fields are implemented via
plugins**, and JavaScript can be injected app-wide by pointing Company Settings → Plugins at an
HTTPS-hosted JS file. There is a WordPress "HireHop Webshop" plugin.

**Strengths.** Price; API parity with the UI; client-side extensibility that most SaaS competitors
forbid outright.

**Limits.** That same JS-injection extensibility is a supply-chain and audit surface (INFERENCE).
Offline **UNKNOWN**. Custom fields *requiring* plugins means the no-code user cannot model their
own data (FACT, and a real limitation versus Rentman/Current RMS custom fields).

### 4. easyjob 6 (protonic software GmbH, DE) — the German incumbent

**What it does.** Rental, production and event-logistics management for audio, video, trade show,
conference, stage, touring and tent businesses. Four editions **S / M / L / XL** scaled by company
size (S = one-person/very small, M ≈ 5 employees, L = multiple locations or extra warehouses,
XL = many locations and staff). Vendor states **all functions are included in one licence** —
one location, one company, one licence — and that it runs across **multiple locations and
warehouses in different countries and currencies**. easyjob 6 was released with "200 new
functions" emphasising international scope and end-device access.

**Architecture.** Windows client plus server, with an **easyjob WebApp** module for browser/mobile
access. This is the one mainstream product in the segment that is *not* cloud-first — which in an
event context is a feature, not a legacy wart (INFERENCE: a warehouse with a local server keeps
scanning when the DSL line dies; no vendor offline claim was found, so this is reasoning only).

**API.** The **easyjob WebApi** gives real-time access over a **JSON interface** to items,
availability, addresses and projects, partially editable, gated by user rights. CrewBrain
documents pulling "all relevant order data … via the RESTful API interface".

**Limits.** **No public pricing at all** — an OMR reviewer note states plainly that the provider
communicates no price information. Windows-centric. Documentation is largely German-first.
API surface (items/availability/addresses/projects) is narrower than Rentman's or HireHop's.

### 5. Flex Rental Solutions (US) — the one that actually does offline

**What it does.** Asset and inventory management "built from the ground up for the events
industry": contacts, financials with QuickBooks integration, crew management, barcode scanning,
drag-and-drop, warehouse gear tracking.

**The two things worth copying:**

1. **Offline scanning.** FACT `[via search summary]`, vendor feature page: *"Flex scanning works in
   both online and offline modes, syncing data when connectivity returns."* In a segment that is
   otherwise cloud-only, this is the differentiator that matters on a loading dock.
2. **Per-location pricing with unlimited users.** ~$435/mo base, plans from ~$510/mo, **unlimited
   users, no per-user fee**; second warehouse +$150/mo, locations 3–5 +$100 each, beyond 5 +$75 each.
   The economic effect: every warehouse hand, driver and freelancer can have a login. Compare
   Cheqroom, which reaches the same outcome differently — pay per **admin** seat, unlimited regular
   users who only check gear in and out.

**Limits.** Expensive at the low end (an $435/mo floor is ~15× Booqable's entry). REST APIs are
described as **in development for Flex5** — i.e. the modern API is not finished (FACT
`[via search summary]`, from Flex's own help-centre community threads; two separate threads ask
about API availability, which is itself evidence of demand outrunning supply).

### 6. Shelf (`shelf.nu`) — the credible open-source option **[opened directly]**

The only open-source project found that is a plausible production tool rather than a coursework
CRUD app. Verified by reading the repository:

- **License AGPL-3.0.**
- **Stack:** React 19, React Router 7, TypeScript 5, Tailwind, Hono, **PostgreSQL via Supabase**,
  Prisma 6, Vite 7, Turborepo, Vitest + Playwright. (Note for this repo: the React 19 + TS + Vite
  choice matches AV Planner Suite's own stack.)
- **Features:** QR asset tags, **booking/reservation system with calendar**, custody tracking and
  team-member assignment, hierarchical locations with GPS, roles (Owner/Admin/Base/Self Service),
  custom fields, categories, **asset kits**, CSV import/export, built-in QR/barcode scanner,
  multi-workspace.
- **Self-hosting:** Docker and Fly.io; requires an external Supabase instance.
- **API:** no public API documented in the repository. UNKNOWN.

**Limits.** It is asset management with bookings — there is no quoting, invoicing, sub-rental,
crew costing or transport planning. It is not a rental ERP and does not claim to be. The Supabase
dependency makes true air-gapped self-hosting awkward (INFERENCE).

A second open-source entrant, **Louez** (Synapsr, Next.js/TypeScript/MySQL, Docker Compose),
self-describes as an open-source equipment rental platform with inventory, reservations, customers,
contract generation and storefronts, explicitly tagged `booqable-alternative`. Small
(tens of stars) — maturity unverified.

## Standards & protocols

**Blunt summary: this segment has almost no interchange standards. CSV/XLSX is the standard.**

| Area | What actually exists | Status |
| --- | --- | --- |
| Equipment-list interchange | **`.xlsx` / `.csv` only.** Rentman imports equipment lists into projects from `.xlsx`/`.csv` and supports full XLSX export → bulk edit → re-import; RentalPoint imports from a `Rental Inventory.csv` template; Booqable imports inventory via CSV; HireHop exports to Excel/CSV; Shelf does CSV import/export | FACT `[via search summary]`, GitHub for Shelf **[opened]** |
| A vendor-neutral rental/equipment interchange format | **None found.** No XML/JSON schema, no shared MIME type, no cross-vendor list format | UNKNOWN — searched, nothing surfaced |
| Barcode symbologies | **Code 128** (dominant; high density, encodes type + serial), Code 93, UPC-A, EAN-13; **GS1-128** (1D) and **GS1 DataMatrix / GS1 QR** (2D) for cross-company shipping-label data exchange | FACT `[via search summary]` |
| QR | Ubiquitous; scanned by ordinary phones, no dedicated hardware. Rentman generates a QR per equipment item | FACT `[via search summary]` |
| RFID | Used but **proprietary per vendor** — e.g. Navigator's **HireTAG** on HireTrack NX; EZRentOut supports RFID scanning. No rental-industry EPC/EPCIS profile found | FACT for products; UNKNOWN for a standard |
| E-invoicing (DE/EU) | **XRechnung** and **ZUGFeRD** (up to 2.4) are the German de-facto standards; since **2025-01-01 all German B2B companies must be able to receive and process structured e-invoices GoBD-compliantly**. **Eventworx creates and sends outgoing invoices in ZUGFeRD and XRechnung**. DATEV runs an e-invoicing platform with an interface for third-party software | FACT `[via search summary]` |
| Accounting connectors | QuickBooks (Flex, IntelliEvent), Xero, DATEV (German products), Avalara for tax | FACT `[via search summary]` |
| API style | **REST + JSON is universal.** Booqable v4 follows **JSON:API** (with a `.json` nested-response alternative). **No GraphQL found anywhere in this segment** | FACT / UNKNOWN (absence of evidence) |
| Auth | API key in header or query (Current RMS `X-AUTH-TOKEN`/`apikey`, **OAuth2 preferred**); personal API token with the minting user's role (Rentman); user token as GET/POST param (HireHop); Bearer token (Booqable) | FACT `[via search summary]` |
| Webhooks | Rentman, HireHop, Booqable, CrewBrain, Xytech. Payloads are entity-change notifications ("what changed, go fetch it"), not full state | FACT `[via search summary]` |
| **MCP (new in this cycle)** | **Rentman MCP server (public beta)**, built on its public API, admin-enabled per user role. **Xytech X2 MCP server with tool-level OAuth**, alongside REST v3, webhooks and `llms.txt` | FACT `[via search summary]` |
| Design/CAD → rental | **No direct integration found.** Vectorworks Spotlight tracks Equipment Lists and exports lighting-device data to a spreadsheet-/database-readable file (Lightwright-compatible), with partner exports (Soundvision, Producer's Pack 3, Prod LX). Bridging to Rentman/Current RMS is a **manual XLSX round-trip** | FACT for Vectorworks export; **no Vectorworks↔rental-ERP integration found** |
| Equipment taxonomies | Exist, but **for construction rental, not AV**: ARA **Standard Equipment Taxonomy (SET)**; the ERA catalogue of rental industry requirements; the **AEMP/AEM Telematics Data Standard** (2010, Caterpillar/Volvo/Komatsu/Atlas Copco) | FACT `[via search summary]` |
| Neighbouring standards this segment ignores | **GDTF / MVR** (lighting fixture + rig interchange) — no rental ERP found that consumes them | INFERENCE from absence; UNKNOWN whether any product does |

## What this segment does WELL

Patterns worth stealing, in rough order of how much they'd improve AV Planner Suite:

1. **A three-layer inventory model that everyone converged on independently.**
   *Type* (Rentman **item** / Current RMS **product**) → *unit* (Rentman **serial number** /
   Current RMS **stock level**, serialised or bulk) → *composite* (Rentman **equipment
   combination** = kit/case/accessories, itself serialisable). Availability resolves across all
   three layers. Convergent evolution across independent vendors is strong evidence the model is
   right (INFERENCE, but well-supported).

2. **Two identifiers per physical unit.** Rentman's split of **Internal Reference** (the house's
   own label, used everywhere in the UI) from **Manufacturer Serial Number** (insurance,
   third-party rental, maintenance). Conflating these is a mistake that is painful to undo later.

3. **Availability as a first-class, time-axis query.** Not "how many do we own" but "how many are
   free between these two datetimes, given reservations, sub-rentals and maintenance holds" —
   surfaced as an equipment timeline *and* a quick lookup, and shown live while a quote is being
   built (Current RMS shows product **and accessory** availability during opportunity entry).

4. **Shortages surfaced where the decision is made.** Current RMS flags sub-rental shortages on
   the Opportunity screen itself. Rentman models **suppliers** and **alternatives** directly on the
   equipment item. Sub-rental is designed in, not bolted on.

5. **Compliance enforced at booking time, not in a report.** Current RMS warns when an asset **due
   for testing** is allocated to a job; Rentman carries **periodic inspections** on the item and
   publishes DGUV V3 guidance for the German market; CrewBrain tracks **certificate expiry** for
   crew qualifications. The pattern: the system refuses to let you quietly ship uncertified gear.

6. **Licence models that don't tax the warehouse.** Two good answers to the same problem:
   Rentman's free **basic users** (warehouse/technicians) with charges only for **power users**;
   Cheqroom's **per-admin-seat** with unlimited regular users; Flex's **per-location, unlimited
   users**. Any of these beats naive per-seat pricing for an industry with a large casual-user tail.

7. **API parity as a product principle.** HireHop: *"anything you see HireHop do, you can also
   accomplish using the extensive API."* Plus the supporting furniture that makes an API usable:
   Rentman's **sandbox environment** and **API changelog**, Current RMS's published **Postman
   collection**, webhook payloads that name the changed entity and hint at how to fetch it.

8. **The XLSX round-trip as a deliberate escape hatch.** Export everything → bulk-edit in Excel →
   re-import. Ugly, universally supported, and it is what actually saves a migration.

9. **Scan-driven physical workflow on cheap hardware.** Phone camera or a Zebra handheld, QR or
   Code 128, prep → check-out → check-in → damage/loss, with the scan being the state transition.

10. **Offline where it counts.** Flex ("online and offline modes, syncing when connectivity
    returns") and EZRentOut ("offline work logs … sync back the moment a connection returns").

## What NOBODY in this segment solves well

The white space, stated as specifically as the evidence allows:

1. **Technical planning is entirely absent.** These systems know you have twelve cameras; none
   knows what plugs into what. There is no signal flow, no patch list, no cable schedule, no rack
   elevation, no power calculation anywhere in this segment. Strong corroborating evidence: a
   separate micro-category of tools exists purely to fill it — **H2R Gear** (draws cables between
   gear on a canvas, auto-generates a patch list across HDMI/SDI/XLR/TRS/USB/Ethernet/DisplayPort/
   optical/BNC/RCA/Dante/NDI), **Patchify** (broadcast trucks, studios, live event signal flow,
   ports and auto-routing), **PatchMyGear** (studio wiring planner). None of these is a rental ERP,
   and no rental ERP does what they do. FACT that the tools exist; INFERENCE that the gap is real.

2. **Nothing derives a cable/consumable bill of materials from a plan.** The ERP counts what a
   human typed into a quote. Nobody computes "this camera position at this distance needs 2× 50 m
   SDI plus a fibre run plus these connectors" and pushes it back as reservable stock. This is the
   single largest unclaimed piece of value adjacent to the segment.

3. **No standard interchange between design tools and rental ERPs.** Vectorworks Spotlight can
   export equipment/lighting-device data; Rentman can import `.xlsx`. Between them: a human with a
   spreadsheet. No direct Vectorworks↔Rentman/Current RMS integration was found, and no shared
   list format exists in either direction. Every design→logistics handoff in this industry is a
   copy-paste.

4. **No cross-company availability.** Sub-rental is modelled *inside one tenant* — a supplier is a
   contact and a cost line. There is no protocol by which "I need 4× of these on Friday" reaches
   three partner houses' actual availability. In practice this is still email and WhatsApp.
   No product found doing it; UNKNOWN whether any exists.

5. **No shared AV equipment master-data catalogue.** Every rental house in the world retypes the
   same Sony/Blackmagic/Robe weights, dimensions, power draw and connector counts. Construction
   rental has taxonomies and a telematics data standard (ARA SET, AEMP/AEM); **AV has no equivalent
   that surfaced in this research**. Item setup is therefore a multi-week onboarding tax on every
   new customer of every product in this table.

6. **Offline is thin, and always the wrong half.** Where offline exists at all (Flex, EZRentOut) it
   covers **warehouse scanning**. Nobody offers an offline-capable *planning and quoting* client.
   The rest of the segment is cloud-only with the offline story simply **UNKNOWN** — including
   Rentman, whose mobile app documentation describes scanners and prep flows but makes no
   no-connection claim. An OB truck in a field, a trade-show hall with saturated Wi-Fi, and a
   warehouse behind a dead DSL line are all normal conditions in this industry, and the segment's
   answer is "have connectivity".

7. **Case and truck packing is manual.** Rentman computes transport weight and volume and supports
   multiple jobs per ride; nobody solves *which items fit in which case* or *how the truck packs*
   spatially. Volume totals are not a load plan.

8. **Price opacity above the SMB line.** easyjob (a reviewer notes the vendor communicates no price
   at all), Point of Rental, R2, HireTrack NX / RentalDesk NX, Xytech, and Flex's upper tiers all
   require sales contact. A 6-person rental house cannot compare the mid-market without entering a
   sales funnel — which is why the aggregator numbers in this dossier contradict each other so
   badly. (Honourable exceptions, publicly advertised: HireHop, Booqable, Cheqroom, Flex's base.)

9. **Feature gating puts fundamentals behind add-ons.** In Rentman, quoting & invoicing, equipment
   tracking and history logs are all separately priced add-ons on top of a platform fee plus
   per-power-user charges `[via search summary]`. Invoicing is not an advanced feature of a rental
   business.

10. **Undocumented rate limits.** Rentman's own support material notes that some endpoints return
    **403 due to rate limiting** and that these responses are *not always listed in the individual
    endpoint definitions*. An integration therefore cannot be written defensively from the docs.

## Relevance to AV Planner Suite

| Component | Relevance | Why |
| --- | --- | --- |
| **`packages/inventory-core` + shell/suite** | **Highest** | This is the direct overlap. `InventoryItem` (model + quantity + `ownership: owned/rented/subhire` + `supplier` + fixed cross-project `code`/`codeType` + `locationId` into a case/storage tree, LPN-style) is *already* the same shape the segment converged on. Two concrete gaps against the reference model: (a) there is a fixed label `code` but **no split between the house's own reference and the manufacturer serial** — Rentman's two-identifier design is worth adopting before data exists to migrate; (b) `InventoryItem` is a type-with-quantity, with **no per-unit serial layer** — the segment's middle layer (Rentman serial number / Current RMS stock level) is where maintenance history, test due-dates and damage attach. The `avplan-inventory` wire format (`INVENTORY_FORMAT_VERSION`, frozen by test) is the right place to decide this. |
| **`apps/cable-planner`** | **Highest — this is the white space** | Gaps 1 and 2 above are exactly cable-planner's subject. No rental ERP does signal flow, patch lists or cable schedules; the tools that do (H2R Gear, Patchify, PatchMyGear) are standalone and produce lists, not reservations. The strategic move is the **derived bill of materials**: signal flow → cable/adapter/consumable list → an inventory reservation or an export the ERP can import. That is a capability nobody in this table has. |
| **`apps/light-planner`** | High | Fixture counts and rig lists feed the same BOM path. Also the one place where a real neighbouring standard exists (**GDTF/MVR**) that no rental ERP consumes — a GDTF/MVR-aware planner that emits an ERP-importable list bridges two segments at once. |
| **`apps/multicam-planner`** | High | Camera/lens/accessory kit lists are the classic "combination" object; the same BOM export path applies. |
| **`packages/lexware-core`** | Medium-high, with a compliance flag | `BillingDoc` → Lexware Office quotation/invoice is the right layer. But note the German wall: **since 2025-01-01 German B2B firms must receive and process structured e-invoices**, and the German competitors already emit **ZUGFeRD and XRechnung** (Eventworx explicitly). If the suite ever issues invoices directly rather than handing off to Lexware Office, XRechnung/ZUGFeRD output is table stakes, not a differentiator. Worth confirming what Lexware Office already covers before building anything. |
| **Suite ↔ ERP integration surface** | Medium-high | If one integration is built, **Rentman** is the highest-value target: REST + webhooks + **sandbox** + **API changelog** + an **MCP server**, and it is the strongest product in the AV/event niche in the German-speaking market. HireHop is the easiest (token in a GET/POST, full API parity, webhooks). Current RMS/OnRent Events is the most standards-clean (OAuth2). Design defensively for **undocumented 403 rate limiting**. |
| **`broadcast-intercom`, `tally-pi`, `sony-camera-bridge`, `pi-media-station`** | **Low** | These are live-operations components; this segment is commercial/logistical and touches them only at one point — **device identity**. If a tally box or camera bridge knows the same asset code that `inventory-core` uses, "which physical unit was in position 3 last Saturday" becomes answerable. That is a small, cheap alignment, not a product. |

**One cross-cutting observation for the strategy document (INFERENCE).** The suite's offline-first,
local-file architecture is not merely different from this segment — it is aimed squarely at the
segment's most conspicuous weakness (gap 6). But the corollary must be stated honestly: the suite
does **not** compete with these products and should not try to. Availability engines, sub-rental,
crew costing, transport and invoicing represent decades of accumulated domain logic. The defensible
position is **the technical plan nobody else models**, exporting cleanly into whichever ERP the
customer already pays for.

## Sources

### Opened directly (full page read)

- https://github.com/Shelf-nu/shelf.nu
- https://github.com/booqable/api-documentation/blob/master/README.md
- https://github.com/hirehop

### Surfaced via WebSearch result summaries (page NOT opened — see caveat at top)

Rentman:
- https://rentman.io/pricing
- https://rentman.io/pricing/crew
- https://rentman.io/pricing/inventory
- https://rentman.io/plans
- https://rentman.io/plans-explained
- https://rentman.io/integrations/api
- https://rentman.io/blog/how-api-integration-works
- https://rentman.io/blog/introducing-our-new-flexible-license-structure
- https://rentman.io/blog/barcode-vs-rfid-vs-qr-for-av-rental-inventory-tracking
- https://rentman.io/de/blog/dguv-v3-prufung
- https://rentman.io/product-updates/introducing-the-rentman-mcp
- https://rentman.io/product-updates/instantly-plan-crew-and-transport-in-a-project
- https://rentman.io/product-updates/import-your-equipment-lists
- https://rentman.io/solutions/inventory-management
- https://rentman.io/solutions/rental-equipment-tracking-software
- https://rentman.io/industries/av-rental-and-production
- https://support.rentman.io/hc/en-us/articles/360013767839-The-Rentman-API
- https://support.rentman.io/hc/en-us/articles/15274709111826-Public-API-Webhooks
- https://support.rentman.io/hc/en-us/articles/26707946497042-Rentman-API-Changelog
- https://support.rentman.io/hc/en-us/articles/35485155508370-Rentman-MCP-Beta-Version
- https://support.rentman.io/hc/en-us/articles/35742036984082-Rentman-MCP-A-few-things-to-keep-in-mind
- https://support.rentman.io/hc/en-us/articles/360013086279-Manage-Serial-Numbers
- https://support.rentman.io/hc/en-us/articles/360013703140-Create-equipment-sets-kits-cases-and-accessories
- https://support.rentman.io/hc/en-us/articles/4402870209682-Equipment-Combinations-and-How-to-Work-with-Them
- https://support.rentman.io/hc/en-us/articles/360013580119-Set-up-and-edit-equipment-database-
- https://support.rentman.io/hc/en-us/articles/360015867120-Importing-and-Exporting-in-Rentman
- https://support.rentman.io/hc/en-us/articles/360014710799-Explore-Our-Plans
- https://support.rentman.io/hc/en-us/articles/115004751514-Explore-our-licenses-Enterprise-Pro-Classic-Lite
- https://support.rentman.io/hc/en-us/articles/360014365179-Rentman-Mobile-App
- https://support.rentman.io/hc/en-us/articles/360013478180-Scanner-Options-in-Rentman
- https://support.rentman.io/hc/en-us/articles/360014372420-Options-to-Plan-Crew-and-Transport

Current RMS / OnRent Events / Klipboard:
- https://www.current-rms.com/pricing
- https://www.current-rms.com/features/inventory-management
- https://www.current-rms.com/features/testing-and-maintenance
- https://api.current-rms.com/doc
- https://documenter.getpostman.com/view/4811107/SzS5wSad?version=latest
- https://help.current-rms.com/en/articles/5223423-opportunity
- https://help.current-rms.com/en/articles/402491-create-stock-levels-for-your-products
- https://help.current-rms.com/en/articles/660467-add-remove-or-manage-users
- https://help.current-rms.com/en/collections/34551-products
- https://www.internationalrentalnews.com/news/klipboard-to-use-onrent-brand-for-insphire-and-current-rms-software/8122906.article

Booqable:
- https://booqable.com/pricing/
- https://booqable.com/features/
- https://booqable.com/barcode-scanning/
- https://booqable.com/blog/qr-code-vs-barcodes/
- https://booqable.com/blog/barcode-types-rental-equipment/
- https://developers.booqable.com/
- https://developers.booqable.com/v1.html

HireHop:
- https://www.hirehop.com/
- https://www.hirehop.com/api_documentation/
- https://www.hirehop.com/en-features/
- https://www.hirehop.co.uk/blog/webhooks/
- https://www.hirehop.co.uk/blog/custom-fields-hirehop-api/
- https://www.hirehop.co.uk/blog/customising-widgets-hirehop-api/
- https://www.hirehop.com/announcement/customer-specific-pricing/
- https://en-gb.wordpress.org/plugins/hirehop-webshop/

easyjob / protonic software / German market:
- https://www.protonic-software.com/de/easyjob/
- https://www.protonic-software.com/en/easyjob/
- https://www.protonic-software.com/en/easyjob/smallbusiness/
- https://www.protonic-software.com/en/easyjob/corporate/modules/webapp.psx
- https://help.protonic-software.com/en/documentation
- https://www.easyjobx.com/manuals/easyjob-installation-en.pdf
- https://omr.com/en/reviews/product/protonic-software-easyjob
- https://www.softguide.de/programm/easyjob
- https://www.softguide.de/software/verleihsoftware
- https://www.softguide.de/programm/rentman
- https://www.softguide.de/programm/rentsoft-software-fuer-verleihmanagement
- https://www.softguide.de/programm/eventworx
- https://www.eventworx.biz/
- https://www.eventworx.biz/preise/
- https://www.eventworx.biz/funktionen/
- https://www.eventworx.biz/crewbrain/
- https://www.eventworx.biz/faq-eventworx/preise/
- https://www.eventworx.biz/faq-eventworx/crewbrain-schnittstelle/
- https://www.crewbrain.com/en/features/interfaces/
- https://www.crewbrain.com/de/features/schnittstellen/
- https://www.crewbrain.com/de/features/personalplanung/
- https://www.crewbrain.com/de/themen/zeiterfassung
- https://www.crewbrain.com/de/themen/personalplanung/personalplanung-fuer-die-veranstaltungstechnik/
- https://wiki.crewbrain.com/de/eventworx
- https://rentsoft.de/
- https://rentsoft.de/branchen/messe-und-eventartikelvermietungen/
- https://www.capterra.com.de/directory/33475/event-rental/software
- https://www.because-software.com/newsroom/news/e-rechnung/
- https://www.agentursoftware-guide.de/news/easyjob-und-zugferd-zusatzmodul-unterstuetzt-neue-version-mit-xrechnung/
- https://www.datev.de/web/de/aktuelles/e-rechnung-mit-datev/

Flex / Point of Rental / EZRentOut / Cheqroom / others:
- https://www.flexrentalsolutions.com/
- https://www.flexrentalsolutions.com/plan-pricing/
- https://www.flexrentalsolutions.com/multiple-business-locations-warehouses/
- https://www.flexrentalsolutions.com/av-inventory-management-software/
- https://www.flexrentalsolutions.com/event-rental-software-features/warehouse-scanning/gear-tracking-warehouse-scanning/
- https://helpcenter.flexrentalsolutions.com/hc/en-us/community/posts/360053130033-Flex-5-API-Online-Store
- https://helpcenter.flexrentalsolutions.com/hc/en-us/community/posts/16644107822999-Flex-API-AI-Automation-Reservations-Bookings-Inventory-Check
- https://www.point-of-rental.com/pricing/
- https://www.point-of-rental.com/products/elite/
- https://www.point-of-rental.com/products/essentials/
- https://www.point-of-rental.com/gb/products/syrinx365/
- https://api.pointofrental.com/docs
- https://ezo.io/ezrentout/
- https://ezo.io/ezrentout/pricing/
- https://ezo.io/ezrentout/developers/
- https://ezo.io/ezrentout/industries/av-rental-software/
- https://www.cheqroom.com/pricing/
- https://www.cheqroom.com/blog/cheqroom-unlimited-asset-pricing/
- https://www.cheqroom.com/solutions/production/
- https://www.shelf.nu/solutions/camera-equipment-check-out
- https://www.navigator.uk/
- https://www.hiretracknx.com/product-introduction/hiretrack-nx/
- https://www.navigator.uk/2021/09/09/new-features-in-hiretrack-nx/
- https://rentalpoint3.com/
- https://rentalpoint.knowledgeowl.com/help/import-products-from-excel-file
- https://unibiz.com/products/r2/
- https://intellievent.com/
- https://intellievent.com/our-customers/equipment-rental-software/
- https://rentopian.com/audio-visual-rental-software/
- https://rentrax.com/av-rental-software/
- https://www.intemposoftware.com/industries/film-video-equipment

Broadcast-adjacent (Xytech / ScheduALL):
- https://www.xytechsystems.com/latest-news/xytech-introduces-new-mobile-ui-rest-apis-for-mediapulse-at-ibc-2018/
- https://www.fabricdata.com/xytech-operations
- https://www.fabricdata.com/xytech-media
- https://mp.xytechsystems.com/support/MediaPulse_Rest_API_Introduction_V1.0.pdf
- https://hpaonline.com/xytech-systems-acquires-scheduall-enhances-facility-management-scalability-transmission-offerings/
- https://www.televisual.com/news/xytech-systems-acquires-scheduall/

Standards, taxonomies, signal-flow tools:
- https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/gs1-barcodes
- https://ararental.org/Standard-Equipment-Taxonomy
- https://erarental.org/wp-content/uploads/2020/12/catalogue-of-equipment-rental-industry-issues-needs-and-requirements-for-construction-access-equipment.pdf
- https://app-help.vectorworks.net/2022/eng/VW2022_Guide/Export/Exporting%20lighting_device_data.htm
- https://app-help.vectorworks.net/2025/eng/VW2025_Guide/LightingDesign2/Managing_and_reporting_equipment_lists.htm
- https://app-help.vectorworks.net/2024/eng/VW2024_Guide/LightingDesign2/Concept_Inventory_and_equipment_lists.htm
- https://www.vectorworks.net/en-US/newsroom/heres-what-you-need-to-know-about-equipment-lists
- https://h2rgear.com/tools/patch-list/
- https://patchify.app/
- https://patchmygear.com/

Open source:
- https://github.com/Synapsr/Louez
- https://github.com/topics/equipment-rental
- https://github.com/topics/rental-management
