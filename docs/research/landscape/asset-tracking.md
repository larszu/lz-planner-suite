# Asset Tracking / Barcode / QR / RFID / Maintenance / Cases

> Research date: **2026-08-29** (task brief dated 2026-08-28). Claims labelled per
> [`docs/research/METHOD.md`](../METHOD.md):
> **FACT** (read in a source I actually opened, URL cited), **INFERENCE** (my reasoning from
> those sources), **UNKNOWN / unverified** (could not be checked in this environment).

---

## Source-access caveat — READ THIS FIRST, it bounds everything below

This pass ran under the same research blackout the `crew-scheduling` and `event-rental-management`
dossiers describe, and one new constraint on top:

1. **The session web-search budget was already exhausted** (200 of 200 `WebSearch` calls) before
   this segment began. No search engine was available at any point.
2. **The egress proxy blocks essentially every commercial vendor domain.** Verified by direct
   probe (HTTP `000` = CONNECT refused, checked 2026-08-29):
   `snipeitapp.com`, `cheqroom.com`, `sortly.com`, `assetpanda.com`, `ezofficeinventory.com`,
   `hirehop.com`, `rentman.io`, `docs.rentman.io`, `current-rms.com`, `flexrentalsolutions.com`,
   `shelf.nu`, `gs1.org`, `ref.gs1.org`, `kitcheck.com`, `shure.com`, `blackbox.global`,
   `geartrack.io`, `inventree.org`, `docs.inventree.org`, `homebox.software`, `odoo.com`,
   `erpnext.com`, `en.wikipedia.org`, `iso.org`, `readthedocs.io`, `*.github.io`.
   `github.com` HTML and the GitHub search API are also blocked
   (`sessions are bound to their configured repositories`).

**What *was* reachable, and therefore what this dossier is built from:**

| Channel | Status | What it gave |
| --- | --- | --- |
| `raw.githubusercontent.com` | **fully open, any public repo** | source code, in-repo docs, licences, schemas |
| `git clone https://github.com/...` | **works through the git proxy** | full repository trees (partial/sparse clones used) |
| `registry.npmjs.org` (incl. search API) | open | package metadata + READMEs of vendor API clients |
| `pypi.org` | open | package metadata, full `simple` index for name discovery |
| `hub.docker.com` | open (unused in the end) | — |

**Consequence, stated plainly.** This dossier is unusually strong on *primary technical
sources* — I read the actual database schemas, scanner queue implementations, label renderers,
barcode-parsing engines and API type definitions of six open-source products and two commercial
ones — and unusually weak on *commercial marketing facts*, above all **pricing**.

- **There is not a single verified price in this dossier.** Every vendor pricing page was
  unreachable. Rather than repeat numbers from memory (which METHOD.md forbids and which would be
  worse than useless in a commercial comparison), every price line says **UNKNOWN** and names the
  exact page that must be opened to fix it.
- Where a commercial product's behaviour could be established from an API client, an official SDK
  or a third-party integration synced to the vendor's OpenAPI spec, it is marked
  **FACT (via API client)** and the client's own vintage is given, because an SDK can lag the
  product.
- Several seed products (**GearTrack, InventoryBase, Kit Check, Wireless Workbench asset
  features, Blackbox, Yellowfish/Rentcorp RFID**) produced **no reachable primary source at all**.
  They appear in the product table as **UNKNOWN** rows rather than being quietly dropped or
  quietly invented.

---

## Segment summary

**What the category is for.** This segment answers four questions about physical objects that a
planning tool, an ERP and a spreadsheet all fail to answer reliably:

1. **Which physical thing is this?** — identity: an asset tag, a serial number, a barcode, a QR
   code, an RFID tag. Not "a Sony FX9", but *this* FX9, body number 4 of 7.
2. **Where is it and who has it?** — location, custody, check-out state, and the audit trail of
   how it got there.
3. **What is inside what?** — containment: this lens is in that case, that case is on that truck,
   that truck is at that venue. The **case as a container of assets** is the defining data-model
   problem of the AV/event flavour of this segment, and the thing generic IT asset management
   gets most obviously wrong.
4. **Is it fit to go out again?** — damage reports, maintenance/repair logs, calibration and
   warranty dates, and the "do not rent" flag.

**Who buys it.** Three quite different buyer types share one software category, which is why the
products feel mismatched to AV people:

- **IT / corporate ITAM** — the biggest and richest buyer. Buys Snipe-IT, EZOfficeInventory,
  Asset Panda. Optimises for depreciation, licence compliance and employee hand-over. Cares
  nothing about cases, sub-hire or a load-out at 04:00.
- **Media / education / creative equipment rooms** — Cheqroom's core market, Shelf.nu's stated
  market. Optimises for self-service booking and check-out of camera/audio kit by many casual
  users.
- **Rental / event / broadcast warehouses** — Rentman, Current RMS, HireHop, Flex. Here asset
  tracking is a *module inside an ERP*, not a product: the identity layer feeds availability,
  pricing and invoicing. This is the buyer the AV Planner Suite shares.

**Typical price band. UNKNOWN — see the caveat above.** The only price-shaped facts I could
verify are structural, not numeric:

- **Shelf.nu**: AGPL-3.0, self-hostable; the hosted product has Stripe-backed tiers
  (`TierId = free | tier_1 | tier_2 | custom`) whose limits are enumerated in the schema
  (`canImportAssets`, `canExportAssets`, `maxCustomFields`, `maxOrganizations`,
  `canHideShelfBranding`, `isEnterprise`), and **barcodes are a paid add-on on top of QR**, while
  self-hosters can set `ENABLE_PREMIUM_FEATURES=false` and get everything.
  (FACT — `packages/database/prisma/schema.prisma`, `apps/docs/app-configuration.md`,
  `apps/docs/asset-import.md`.)
- **Snipe-IT**: AGPL-3.0 for the software; a hosted/paid offering exists (the README points at
  `snipeitapp.com`), price **UNKNOWN**. (FACT for the licence — `LICENSE`.)
- **InvenTree**: MIT, no paid tier evidenced in-repo. **Homebox**, **Part-DB**: AGPL-3.0.
- **Cheqroom, Sortly, Asset Panda, EZOfficeInventory, Rentman, Current RMS, HireHop, Flex**:
  subscription, **numbers UNKNOWN**.

**INFERENCE on the shape of the market.** The open-source half of this segment is unusually
strong and unusually current — Shelf.nu, Snipe-IT, InvenTree, Part-DB and Homebox all had commits
within the last eight days of the research date (FACT, from the clones). The commercial half sells
the same core data model plus a mobile app plus support. That means the *technology* here is not
the moat; **the mobile scanning experience and the domain fit of the data model are**.

---

## Product table

Offline column = "can a warehouse worker keep scanning when the wifi drops, and is the work
preserved?" — not "can you self-host it".

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Shelf.nu** | Shelf Asset Management (EU) | Web (self-host or hosted) + iOS/Android "companion" app | AGPL-3.0 OSS; hosted tiers via Stripe; **barcodes are a paid add-on**; prices UNKNOWN | **Yes, genuinely** — companion app has a persisted, retrying scan queue with a failed-queue that blocks audit completion | REST + SCIM 2.0 endpoints in-repo; mobile OAuth handoff | QR-native asset tracking with real kits, bookings, custody and the only credible offline audit scanner I could verify anywhere in the segment |
| **Snipe-IT** | Grokability, Inc. (US) | Web (self-host) + paid hosting | AGPL-3.0; hosted price UNKNOWN | **No** | JSON REST, OpenAPI 3.1; `checkinbytag`, `bytag/{tag}/checkout`, `POST /hardware/audit/bulk` | Label printing: Avery/Hema sheets + Brother/Dymo/Zebra/Generic tape definitions, server-rendered PDF; audit-due/overdue reporting |
| **InvenTree** | InvenTree Developers | Web (self-host) + companion mobile app | MIT, free | **No** (no offline support documented anywhere in `docs/`) | REST; `POST /api/barcode/`, `/api/barcode/link/`, `/api/barcode/unlink/`; barcode plugin mixin | The best *barcode architecture* in the segment: internal/external/custom codes, priority-ordered plugin resolution, built-in supplier-barcode parsers |
| **Part-DB** | jbtronics et al. (DE) | Web (self-host, Symfony/PHP) | AGPL-3.0 | **No** | REST + an in-repo MCP server | Scanner *ergonomics*: global scan-anywhere via an `<SOH>` prefix, EIGP114 DataMatrix with non-printable characters, GTIN/EAN + arbitrary user barcodes on a lot |
| **Homebox** | sysadminsmedia | Web (self-host, Go + Nuxt) | AGPL-3.0 | UNKNOWN (no offline code found; not exhaustively searched) | REST, OpenAPI 3.0 + Swagger 2.0 shipped in `docs/public/api/` | Pragmatic label pipeline: built-in label maker **plus** a documented external HTTP label-service hook |
| **Cheqroom** | Cheqroom (BE) | Cloud + iOS/Android | Subscription, **UNKNOWN** | UNKNOWN | REST `api.cheqroom.com/api/v2_5`; official JS wrapper `cheqroom-core` (**last commit 2020-03-03**) | Equipment-room check-out: items, kits, orders, reservations, custody take/release/**transfer**, depreciation, per-item `allowReserve/allowCheckout/allowCustody` flags |
| **Rentman** | Rentman B.V. (NL) | Cloud + "Rentman 4" mobile app | Subscription per module/user, **UNKNOWN** | UNKNOWN (app-side; the *API* has no scan endpoint at all) | REST, OpenAPI v1.7.0–v1.13.0; 63 resources; **50,000 req/day, 10 req/s, 20 concurrent, 1,500 items/page** | The only data model I verified that is **case-aware at the field level**: `quantity_in_cases`, `current_quantity_excl_cases`, `packed_per`, `empty_weight`, plus `/subrentals` for sub-hire and `/repairs` for maintenance |
| **Current RMS / OnRent** | Klipboard (UK) | Cloud | Subscription, **UNKNOWN** | UNKNOWN | REST at `api.current-rms.com/doc` (documented by a third-party Node client) | UNKNOWN in detail — scanning behaviour could not be verified |
| **HireHop** | HireHop Ltd (UK) | Cloud | **UNKNOWN** | **UNKNOWN** | **UNKNOWN** — no npm/PyPI client, no reachable docs | UNKNOWN |
| **Flex Rental Solutions** | Flex (US) | Cloud + mobile | **UNKNOWN** | **UNKNOWN** (the sibling `event-rental-management` dossier records an offline claim, itself unverified) | **UNKNOWN** | UNKNOWN |
| **EZOfficeInventory** | EZO (US) | Cloud + mobile | Subscription, **UNKNOWN** | UNKNOWN | REST asserted by vendor marketing, **not verified here** | UNKNOWN |
| **Asset Panda** | Asset Panda LLC (US) | Cloud + mobile | Subscription, sales-contact, **UNKNOWN** | UNKNOWN | A *public* API exists — evidenced by the vendor's own `assetpanda/pioneer` repo publishing `assetpanda-mcp-kb` | UNKNOWN |
| **Sortly** | Sortly Inc (US) | Cloud + mobile | Self-serve subscription tiers, **UNKNOWN** | UNKNOWN | REST; documented rate limiting; items are a **tree** (`parent_id`, `folder`/`item` types, `include_subtree` on clone) | Nested container-in-container inventory — the closest mainstream model to "case inside truck" |
| **Odoo Inventory + Barcode** | Odoo S.A. (BE) | Web + PWA | Community free / Enterprise paid; **Barcode app is Enterprise**; price UNKNOWN | UNKNOWN (PWA offline claimed by vendor, not verified) | XML-RPC / JSON-RPC | A complete, readable **GS1 nomenclature engine**: AI pattern rules, FNC1 separator handling, GS1 date parsing, UPC↔EAN conversion |
| **ERPNext** | Frappe (IN) | Web | GPL-3.0 | UNKNOWN | REST | A rich `Serial No` doctype: `serial_no`, `asset`, `asset_status`, `location`, `employee`, `warranty_expiry_date`, `amc_expiry_date`, `maintenance_status`, `warehouse`, `batch_no` |
| **NetBox** | NetBox Labs | Web (self-host) + cloud | Apache-2.0 core; cloud price UNKNOWN | **No** | REST + GraphQL | `Device.asset_tag` (unique) + `Device.serial`, and `InventoryItem` — a **tree (MPTT) of serialised sub-components inside a device**. Already integrated by `cable-planner` (`netbox:*` IPC) |
| **Kit Check / Bluesight** | Bluesight (US) | Cloud + RFID readers | **UNKNOWN** | UNKNOWN | UNKNOWN | Adjacent vertical (hospital medication kits, RFID tray scanning). Named in the brief; **no reachable source** |
| **GearTrack** | UNKNOWN | UNKNOWN | **UNKNOWN** | UNKNOWN | UNKNOWN | **UNKNOWN — no primary source reachable.** npm/PyPI searches returned only unrelated packages |
| **InventoryBase** | UNKNOWN | UNKNOWN | **UNKNOWN** | UNKNOWN | UNKNOWN | **UNKNOWN — no primary source reachable** (note: the name is also used by a UK property-inspection product, so even the identity is ambiguous) |
| **Wireless Workbench (asset features)** | Shure | Desktop (Win/macOS) | Free with hardware | UNKNOWN | UNKNOWN | **UNKNOWN — `shure.com` unreachable.** See the `audio` dossier for what could be verified about WWB generally |
| **Blackbox** | UNKNOWN | UNKNOWN | **UNKNOWN** | UNKNOWN | UNKNOWN | **UNKNOWN — no primary source reachable**; the name is heavily overloaded |
| **Yellowfish / Rentcorp RFID** | UNKNOWN | UNKNOWN | **UNKNOWN** | UNKNOWN | UNKNOWN | **UNKNOWN — no primary source reachable.** RFID in AV rental is discussed only at the standards level below |

**To fix the UNKNOWN price cells**, in priority order, open:
`cheqroom.com/pricing`, `rentman.io/pricing`, `sortly.com/pricing`, `ezofficeinventory.com/pricing`,
`snipeitapp.com/pricing`, `current-rms.com/pricing`, `hirehop.com/pricing`,
`assetpanda.com` (sales contact), `flexrentalsolutions.com` (sales contact) — and record the
date-seen and whether the number is advertised or requires a sales call.

---

## Deep dives

### 1. Shelf.nu — the reference implementation, and the only verified offline scanner

**What it does.** Open-source (AGPL-3.0) asset management: assets, categories, tags, custom
fields, locations, custody, bookings, kits, QR labels, barcodes, audits, reminders. React
Router 7 / React 19 / TypeScript / PostgreSQL via Supabase / Prisma 6, deployed on Fly.io, with a
community-maintained Docker path. There is a **React Native (Expo) companion app**, live in the
App Store and Google Play at **1.4.0**, with **1.5.0 cut but not yet submitted** at the time of
reading. (FACT — `README.md`, `COMPANION-RELEASE-STATUS.md`.)

**Data model** (FACT — `packages/database/prisma/schema.prisma`, 2,614 lines, ~90 models/enums).
The parts that matter for this segment:

- **Identity is split three ways, deliberately.**
  - `Qr` — Shelf's *own* code. Carries `version` and `errorCorrection` (`L|M|Q|H`) "based on spec
    from Denso Wave", can be minted **unclaimed** and attached to a `PrintBatch`, and can point at
    an `Asset`, a `Kit`, a `User` or nothing yet.
  - `Barcode` — third-party/1D codes, `@@unique([organizationId, value])`, with
    `BarcodeType = Code128 | Code39 | DataMatrix | ExternalQR | EAN13` and a comment stating the
    names match **zxing format names exactly**.
  - `Asset.preferredBarcodeId` — a per-asset override for which code to display, guarded by a
    deferrable constraint trigger so the chosen barcode must belong to that asset *and* that org.
- **`Kit` is a real container, not a template.** It has its own `qrCodes`, `barcodes`, `status`
  (`AVAILABLE | IN_CUSTODY | CHECKED_OUT`), `location`, `image`, and a **`KitCustody`** row whose
  `inheritedCustody` children cascade-delete when kit custody is released — so assigning a case to
  a person assigns everything in it, and releasing the case releases only the inherited custody,
  leaving operator-assigned custody untouched. `AssetKit` is the pivot, with `quantity`, and a
  trigger `enforce_individual_asset_single_kit` capping individual assets at one kit while
  quantity-tracked assets may sit in several.
- **Placement is a pivot, not a foreign key.** `AssetLocation` carries `quantity` and an
  `assetKitId` discriminator: a NULL means a manual placement, non-NULL means "this asset is here
  *because the kit is here*", read-only in the manual editors and cascade-deleted when the asset
  leaves the kit. Partial unique indexes in raw SQL enforce one manual row per (asset, location)
  and one kit-driven row per `AssetKit`.
- **Two asset kinds.** `AssetType = INDIVIDUAL | QUANTITY_TRACKED`, immutable after creation, with
  `ConsumptionType = ONE_WAY | TWO_WAY` and a `ConsumptionLog` whose
  `ConsumptionCategory = CHECKOUT | RETURN | RESTOCK | ADJUSTMENT | LOSS | CONSUME | DAMAGE`.
  **`DAMAGE` is a first-class, separately-reported category, distinct from `LOSS`.**
- **Partial check-out and partial check-in are separate session tables.** `PartialBookingCheckout`
  stores positionally-aligned `assetIds` / `quantities` / `bookingAssetIds` arrays per scan batch;
  `PartialBookingCheckin` the same for returns. The schema comment on the checkout table is worth
  quoting in full because it is exactly the kind of bug this segment breeds:

  > *"Records sessions and the units they claimed — NOT whether an asset is out. The all-at-once
  > checkout … writes NO row here, so **absence proves nothing** and must never be read as 'was not
  > checked out'. Reading it that way is what let a single later scan mark every button-checked-out
  > asset on a booking as 'never checked out'."*

- **Audits are modelled properly.** `AuditSession` (with `expectedAssetCount`, `foundAssetCount`,
  `missingAssetCount`, `unexpectedAssetCount`), `AuditAssignment` (LEAD/PARTICIPANT),
  `AuditAsset` (`PENDING | FOUND | MISSING | UNEXPECTED`), `AuditScan`, `AuditNote`, `AuditImage`.
  `AuditScan` **snapshots `assetTitle` and `wasExpected` by value at scan time** so that deleting
  an asset later cannot silently rewrite history.
- `Scan` is a global append-only table recording public QR hits and companion scans, with
  `latitude`/`longitude`/`userAgent` and a `rawQrId` string kept even if the QR row is deleted.
- `AssetReminder` handles maintenance/calibration/warranty alerts (`alertDateTime`,
  `activeSchedulerReference`, assigned `teamMembers`).
- `ReportFound` — a public "I found this" form keyed to the QR, for assets and kits.

**Offline scanning — the one implementation I could verify end to end.** (FACT —
`apps/companion/hooks/use-scan-queue.ts`, 207 lines; `apps/companion/components/offline-banner.tsx`.)

- Every audit scan is enqueued locally and drained by `processQueue()`.
- `MAX_QUEUE_RETRIES = 3`, `RETRY_DELAYS = [2_000, 5_000, 15_000]` ms.
- **Nothing is ever dropped.** On retry exhaustion the entry moves to a persisted `failedQueueRef`,
  the scanned item is flagged `syncFailed`, a durability event is sent to Sentry, and — critically —
  **audit completion is blocked while that queue is non-empty**. The code comment names the failure
  it is defending against: *"an asset the worker saw as 'Found' is lost and later marked MISSING on
  completion."*
- State is persisted (`saveAuditScanState`) on **every** branch — success, requeue and failure —
  with an explicit comment that persisting only on success loses scans if the app is killed during
  backoff or if "a sub-2s scanning burst … perpetually resets the debounced saver".
- Connectivity is detected with `@react-native-community/netinfo`; the offline banner is an
  absolutely-positioned overlay so it never reflows the scanning UI.
- Companion 1.5.0 adds: undo a mis-scan during an audit; scanner feedback for cross-workspace
  jumps, repeat scans and kit scans while fulfilling; connecting the app to a **private/self-hosted
  Shelf server**. (FACT — `COMPANION-RELEASE-STATUS.md`.)

**Scanning UX in the web app.** A "scanner drawer" pattern with shared Jotai atoms
(`scannedItemsAtom`, `addScannedItemAtom`, `removeMultipleScannedItemsAtom`, and a derived
`scannedItemIdsAtom` that splits scanned items into `assetIds` / `kitIds`). A scanned item is
typed `{ data?, error?, type?: "asset"|"kit", codeType?: "qr"|"barcode" }` — i.e. **scanning a kit
and scanning an asset are the same gesture**, resolved afterwards. Drawers exist for: add to
booking, add to kit, add to location, assign/release custody, check in/out.
(FACT — `apps/docs/scanner-drawer-development.md`.)

**Integrations.** Supabase Auth incl. SSO (Shibboleth, Google Workspace, Microsoft Entra docs
in-repo), SCIM 2.0 provisioning (`app/routes/api+/scim+/v2+/`), Stripe, pg-boss for scheduled
reminders, CSV import/export with dedicated barcode columns.

**Notable strengths.** The offline queue; the kit-as-container model with inherited custody; the
by-value audit snapshots; the honesty of the schema comments (this is a codebase that has clearly
been burned by exactly the bugs this segment produces); QR codes that can be printed *before* they
mean anything (`PrintBatch` + unclaimed `Qr`).

**Notable limits.** (a) Offline is **audit-only** — the persisted queue lives in the audit flow;
booking check-in/check-out do not obviously share it (INFERENCE from the file layout — I read the
audit queue, not an equivalent booking queue). (b) Barcodes are a **paid add-on** on the hosted
product, so the free/self-hosted default is QR-only. (c) The barcode type system is admitted to be
sprawling: adding one symbology "requires changes in **15+ files**" (FACT —
`apps/docs/barcode-types-development-guide.md`). (d) Supabase is a hard dependency for
self-hosters. (e) No case-dimension/weight/volume data at all — a `Kit` has no `weight`, so it
cannot feed a truck plan.

---

### 2. Snipe-IT — the label printer with an asset database attached

**What it does.** The best-known open-source asset manager (AGPL-3.0, Laravel 12, **v8.7.2** at
read time). Aimed explicitly at IT operations: *"Knowing who has which laptop, when it was
purchased in order to depreciate it correctly, handling software licenses, etc."*
(FACT — `README.md`, `config/version.php`, `LICENSE`.)

**Data model.** `Asset`, `AssetModel`, `Category`, `Manufacturer`, `Supplier`, `Location`,
`Company`, `Department`, plus four *other* checkoutable kinds: `Accessory`, `Component`,
`Consumable`, `License` — each with its own assignment/checkout table. Identity fields on
`Asset` include `asset_tag`, `serial`, `byod`, `last_checkout`, `expected_checkin`,
`last_audit_date`, `next_audit_date`, `checkout_counter`, `checkin_counter`, `requests_counter`.
`Statuslabel` is a three-boolean matrix (`deployable`, `pending`, `archived`) resolved into five
scopes — `deployable / pending / undeployable / archived / not_archived`.
(FACT — `app/Models/Asset.php`, `app/Models/Statuslabel.php`.)

**Maintenance** is a polymorphic `Maintenance` model (`item_id` + `item_type`, with a legacy
`asset_id` mutator kept for API v1 callers) carrying `maintenance_type_id`, `supplier_id`,
`is_warranty`, `start_date`, `expected_completion_date`, `asset_maintenance_time`, `cost`, `url`,
`responsible_party_id`, `completed_at`, `completed_by`; `MaintenanceType` is user-definable with a
`tag_color`. The API exposes `/maintenances/{id}/history`, `/notes` (GET + POST) and `/complete`.
(FACT — `app/Models/Maintenance.php`, `app/Models/MaintenanceType.php`, `routes/api.php`.)

**Kits are templates, not containers.** `PredefinedKit` has `models()`, `licenses()`,
`consumables()`, `accessories()` and `assets()`, with CRUD routes under `kits/{kit_id}/…`. It
describes *what a standard issue looks like*, so it can be checked out in one action. It is **not**
a physical case with its own tag, its own location or its own custody. (FACT —
`app/Models/PredefinedKit.php`, `routes/api.php`.) **This is the single clearest example of the
IT-vs-AV data-model mismatch in the whole segment.**

**Labels — the genuinely strong part.** A full label engine in `app/Models/Labels/`:

- **Sheets**: Avery (`L4736`, `L6009`, `L7162`, `L7163`, `_3490`, `_5267`, `_5520`, plus `_A`/`_B`
  variants) and **Hema** (`_14130046`, `_38310012`).
- **Tapes**: **Brother** (TZe 12/18/24 mm, TZe-241), **Dymo**, **Zebra**, **Generic**.
- Abstract `Label` class exposing `getUnit()` (`pt|mm|cm|in`), `getRotation()`, width/height and
  four margins; `DefaultLabel` composes a 1D barcode strip (`BARCODE1D_SIZE = 0.15`) and a 2D block
  (`BARCODE2D_SIZE = 0.76`) alongside text fields.
- Symbologies actually wired up: **`QRCODE`, `C128`, `PDF417`** (`Helper::barcodeDimensions()`),
  selected per instance via the `label2_1d_type` / `label2_2d_type` settings; `label2_2d_type =
  'none'` disables 2D entirely. Rendering is server-side PDF via `tecnickcom/tcpdf`,
  `tecnickcom/tc-lib-barcode` and `bacon/bacon-qr-code`.
  (FACT — `app/Helpers/Helper.php`, `app/Models/Setting.php`, `app/View/Label.php`, `composer.json`.)

**Scanning.** `routes/api.php` has the tag-first endpoints you would build a scanner against:
`POST /hardware/bytag/{any}/checkout`, `POST /hardware/bytag/{any}/checkin`,
`POST /hardware/checkinbytag`, `POST /hardware/{asset}/audit`, and a **bulk audit**
`POST /hardware/audit/bulk` taking an `ids` array with a per-row envelope response — declared
*before* `{asset}/audit` so the path resolves correctly. There is also a due/overdue reporting
route covering `audit|audits|checkins` × `due|overdue|due-or-overdue`. (FACT — `routes/api.php`.)

**But there is no first-party scanner.** The README states plainly: *"We're currently working on
our own mobile app, but in the meantime, check out these third-party apps"* — and lists four
independent apps (SnipeMate, Snipe-Scan, Snipe-IT Assets Management, AssetX). Snipe-IT's 47 npm
dependencies contain **no** browser barcode/QR library (no zxing, no quagga, no html5-qrcode).
(FACT — `README.md`, `package.json`.) **INFERENCE:** Snipe-IT is designed around *hardware
keyboard-wedge scanners typing into form fields*, and camera scanning is delegated entirely to
third parties. It is therefore **not offline** in any meaningful sense: it is a web app.

**Integrations.** A large third-party ecosystem the README itself catalogues: PowerShell
(`SnipeitPS`), .NET (`SnipeSharp`), Perl, Python, Jamf/Kandji/Mosyle/UniFi/Rudder sync scripts,
a Jira Service Desk plugin, Helm chart, Google Apps Scripts, and multiple MCP servers — one of
which reports **183 tools across an OpenAPI 3.1 spec**, with hand-wrappers for
"checkout/checkin, audits, by-tag/by-serial lookup, bulk checkout". (FACT — `README.md`;
npm `the-real-snipeit-mcp`.)

**Notable strengths.** Label output quality and printer coverage; the by-tag API surface; audit
scheduling with due/overdue reporting; localisation via Crowdin; an unusually large integration
ecosystem.

**Notable limits.** Kits are templates; no containment hierarchy (no "case contains asset");
no booking/availability-over-time model at all; no first-party mobile app; no offline; no
sub-hire concept; maintenance has no damage-photo workflow.

---

### 3. Rentman — the AV-native data model, with the scanning locked in the app

**Why it is in this dossier.** Rentman is the AV/event rental ERP of the DACH+Benelux market and
is already an integration target in `cable-planner` (`rentman:*` IPC domain, tokens in the OS
credential store). Its *asset* layer is the closest thing the segment has to a purpose-built AV
model. Everything below is **FACT (via API client)** from two independent third-party clients
synced to Rentman's own OpenAPI spec — `@alternative-design-and-media/rentman-api-connector`
(**"Synced to OAS v1.7.0 (deployment 2025-11-13)"**, published 2026-08-06) and
`n8n-nodes-rentman` (**targets Rentman OpenAPI v1.8.1**, published 2026-06-02). Neither is
official; both are current.

**The case-aware equipment record.** `RentmanEquipmentItem` carries, among ~60 fields:

```
location_in_warehouse   packed_per            empty_weight
current_quantity        current_quantity_excl_cases        quantity_in_cases
quantity_reserved       quantity_expected     weight  volume  length  width  height
power  current          is_combination        is_physical
serial (bool)           bulk                  stock_management
qrcodes                 qrcodes_of_serial_numbers          can_edit_content_during_planning
```

Three of those are decisive for AV and appear in no other product I read:

- **`quantity_in_cases` and `current_quantity_excl_cases`** — the system knows the difference
  between "we own 40 of these" and "12 of them are already packed in cases". *(FACT.)*
- **`packed_per`** — how many fit in a case. *(FACT.)*
- **`empty_weight`** alongside `weight` — a case's tare weight, so a packed case's weight is
  computable. *(FACT.)*

`is_combination` marks a set/kit; its contents live in `/equipmentsetscontent`
(`parent_equipment`, `equipment`, `quantity`, `order`, `remark`) and — notably — **are writable**
through the API. `qrcodes` and `qrcodes_of_serial_numbers` are marked **GENERATED FIELD**, i.e.
read-only strings.

**Serialisation.** `/serialnumbers` (`equipment`, `serial_number`, `remark`) is fully writable.
`/equipmentassignedserials` links serials to serialised physical combinations, and
`/actualcontent` records the actual serial content of a combination
(`equipment`, `serial`, `quantity`, `combination_serial`) — i.e. *which specific bodies are in this
specific packed set right now*. Both are **read-only**.

**Maintenance and sub-hire.** `/repairs` = `{ equipment, start, end, status, remark }` — read-only
through the API. `/subrentals` = `{ project, contact, status, remark, in, out }` with
`/subrentalequipment` and `/subrentalequipmentgroup` — all **read-only**. Stock lives in
`/stockmovements` (`equipment`, `quantity`, `date`, `type`, `remark`, `stocklocation`) and
`/stocklocations`.

**API characteristics.** JWT bearer token generated under *Configuration → Integrations*, and
**only the most recently generated token is valid** — generating a new one invalidates the
previous one. Cursor pagination via `next_page_url`; `+field`/`-field` sorting; relational and
`isnull` filters; `ID Greater Than` for delta sync; field selection; `Expand` for inlining linked
objects up to 3 levels (requires API ≥ v1.13.0). Limits: **50,000 requests/day, 10 requests/second,
20 concurrent, max 1,500 items per page.** A documented parser quirk: percent-encoding the slash in
a resource-path filter value (e.g. `/equipment/4362`) **breaks Rentman's parser**, so a
preserve-slashes helper exists.

**The decisive limit.** Across 63 documented resources there is **no scan, check-in, check-out or
barcode endpoint of any kind** — I grepped the full operation table for `scan`, `check-in`,
`check-out`, `barcode` and `qr` and got zero hits. `qrcodes` is a generated read-only field;
`/repairs` and `/subrentals` are read-only; `/stockmovements` supports Delete/Get/Update but
**not Create**.

**INFERENCE, and it is a strong one:** Rentman's warehouse scanning lives entirely inside
Rentman's own mobile app. A third party — including the AV Planner Suite — **cannot build a
scanner against Rentman, cannot write a repair/damage record, and cannot post a stock movement.**
You can read what Rentman knows; you cannot tell Rentman what the warehouse just did. Any
suite-side scanning feature must therefore own its own scan ledger and reconcile, not delegate.

---

### 4. Cheqroom — the equipment-room model, seen through its own SDK

**Caveat on vintage.** Everything here is **FACT (via official SDK)** read from
`CHECKROOM/checkroom_core_js`, Cheqroom's own JavaScript wrapper around
`https://api.cheqroom.com/api/v2_5`. **Its last commit is 2020-03-03** (npm `cheqroom-core@1.1.5`,
published 2018, last modified 2022). The live product has certainly moved on; treat the model as
*the shape of the domain as Cheqroom framed it*, not as today's feature list.

**Domain objects** (one module each): `item`, `kit`, `order`, `reservation`, `transaction`,
`conflict`, `availability`, `location`, `category`, `colorLabel`, `contact`, `group`, `template`,
`field` (custom fields), `comment`, `attachment`, `orderTransfer`, `webhook`, `user`, `usersync`,
`permissionHandler`.

**Identity is dual, like Shelf's.** `Base` carries a `barcodes: []` array with `addBarcode()` /
`removeBarcode()`; `Item` and `Kit` each additionally carry `codes: []` — documented as *"the item
qr codes"* — with `addCode()` / `removeCode()`. Helpers `getQRCodeUrl(code, size)` and
`getBarcodeUrl(code, width, height)` render label images from a server-side utility API.

**Item fields:** `name`, `status`, `brand`, `model`, `warrantyDate`, `purchaseDate`,
`purchasePrice`, `residualValue`, `codes`, `location`, `category`, `geo` (lat/lng), `address`,
`order`, `kit`, `custody`, `cover`, `catalog`, and three permission flags —
`allowReserve`, `allowCheckout`, `allowCustody`, each defaulting to `'available'`. So *"this item
may be reserved but never taken into personal custody"* is a per-asset property. Methods include
`getAvailabilities(from, to)`, `changeLocation()`, `changeCategory()`, `updateGeo()`,
`getDepreciation(frequency)`, `expire()` / `undoExpire()` (retire and un-retire), and the custody
triad **`takeCustody(customerId)` / `releaseCustody(locationId)` / `transferCustody(customerId)`**.

**Bulk creation is first-class:** `createMultiple(times, autoNumber, startFrom)` and
`duplicate(times, location, autoNumber, startFrom)` plus `getLastNumber()` — i.e. "create 24 of
these, auto-numbered from 0041". For an AV house buying a batch of identical radio mics, that is
exactly the right primitive.

**Notable strengths.** The permission triad on each asset; custody *transfer* as a first-class
verb (person to person, without a round trip through the warehouse); orders vs reservations as
separate objects with an explicit `conflict` model; `orderTransfer` with its own QR URL, i.e. a
hand-over between locations that is itself scannable.

**Notable limits (as of the SDK vintage).** `Kit` is a flat bag of items with codes — no nesting,
no case weight, no packing metadata. No maintenance/repair object at all: `expire()` is the only
"this is out of service" mechanism, and there is no damage log, no service history, no cost. No
sub-hire concept.

---

### 5. InvenTree — the barcode architecture everyone else should copy

**What it does.** MIT-licensed inventory/stock management for parts and manufacturing (Django +
React, with a Flutter companion app). Not an AV product — but it has the most carefully designed
*barcode subsystem* in this segment, and the design is domain-independent.
(FACT — `docs/docs/barcodes/{index,internal,external,custom}.md`, `docs/docs/app/barcode.md`.)

**Three tiers of barcode, resolved by priority.** A scan is `POST`ed to `/api/barcode/`; each
plugin is offered the payload in a fixed order and **the first to return a result wins**:

1. **Internal** — InvenTree's own codes, in one of two formats, selectable per instance:
   - *JSON style*: `{"stockitem": 123}`, `{"part": 10}`, `{"stocklocation": 1}`.
   - *Short alphanumeric*: `INV-SI123`, `INV-PA10`, `INV-SL1` — a configurable prefix, a two-char
     model code, then the primary key.
   The docs explain **exactly why the second exists**, and the reasoning is directly reusable:
   `{` and `"` force QR *binary* encoding, and variable-length model names blow past QR version
   boundaries — *"a part QR code with the shortest possible id requires 11 chars, while a stock
   location QR code with the same id would already require 20 chars, which already requires QR
   code version 2 and quickly version 3."* They then tabulate capacity by error-correction level
   (v1/M ≈ 10^14 items alphanumeric; v1/H collapses to ~10^4).
2. **External** — arbitrary third-party codes *linked* to a database object via
   `/api/barcode/link/` and `/api/barcode/unlink/`. *"Instead of printing an internal barcode, the
   existing barcode can be scanned and linked."*
3. **Custom** — plugins. Four supplier parsers ship in the box: **DigiKey (DataMatrix), Mouser
   (DataMatrix), LCSC (QR), TME (QR + DataMatrix)**.

Barcodes may be linked to Part, Stock Item, Stock Location, Supplier Part, Purchase Order, Sales
Order, Return Order and Build Order — **not just to "assets"**.

**Scanning surfaces.** Web: webcam, connected scanner, or keyboard entry; a global quick-scan that
navigates straight to the matched object; a dedicated multi-scan action page; and **barcode input
inside ordinary form fields** — any field pointing at a barcode-capable model shows a barcode icon
and accepts a scan (off by default, per-user opt-in). App: camera, or **keyboard-wedge mode**,
with the explicit requirement that *"the scanner must be configured to append an enter (`\n`)
character"*. Context-sensitive actions per screen: assign barcode, transfer stock location, scan
items into location, scan received parts against a purchase order (needing **both** PO number and
supplier SKU in the barcode).

**Formats the app is documented to read:** 1D — Code-39, Code-93, Code-128, ITF; 2D — QR Code,
Data Matrix, Aztec.

**Barcode history** can be enabled to retain recent scans "for debugging or auditing purposes",
viewable in the Admin Center.

**Serial numbers.** A shorthand grammar for bulk assignment that is worth stealing verbatim:
`1,3,5` (list), `1-5` (range), `~` (next), `4+` (fill from), `2+2` (start + length), mixable —
`1 3-5 9+2` → `[1,3,4,5,9,10,11]`. **Stocktake** records periodic snapshots (date, part, number of
stock *items*, total *quantity*, and a value **range** derived from purchase price or part pricing).

**Notable limits.** **No offline support of any kind** — the string "offline" appears exactly once
in the entire documentation tree, in a 0.5.0 release note about background workers, unrelated to
scanning (FACT — grep over `docs/`). No custody/person model, no bookings, no cases. Barcode
scanning in form fields is **off by default**, which is a curious choice for a scanning-first tool.

---

### 6. Part-DB — the scanner ergonomics prize (and the segment's German entry)

AGPL-3.0, Symfony/PHP, German-origin project (`jbtronics`), aimed at electronic components — but
its scanner page is the best-designed input path I read anywhere in this segment.
(FACT — `docs/usage/scanner.md`, `docs/usage/labels.md`, `README.md`, `LICENSE`.)

- **One scan page, three inputs**: type by hand, use an external scanner, or use the device camera.
- **An "Info" toggle**: with it on, a scan *explains* the barcode; with it off, the scan *navigates*
  straight to the matched object. Two modes, one control — a genuinely good idea for a warehouse
  where you sometimes want to inspect and usually want to move.
- **Matching cascade**: Part-DB's own generated code (internal ID) → the part's IPN → a
  user-supplied **GTIN/EAN** stored in part properties → a **user barcode on a part lot**, set
  under "Advanced", explicitly so that *"arbitrary existing barcodes that already exist on the part
  lots (for example, from the manufacturer)"* can be reused → distributor barcodes (DigiKey,
  Mouser) parsed for the distributor part number.
- **Barcode-driven object creation**: if nothing matches, Part-DB can query an information provider
  and open a pre-filled creation form.
- **Non-printable character handling**: scanner fields try to insert the special characters that
  scanners emit as `Alt + key` combinations, *"required for EIGP114 datamatrix codes"*.
- **Scan-from-anywhere**: configure the scanner to emit `<SOH>` (0x01) before the payload and
  Part-DB captures the barcode from any screen and redirects — unless an input field is focused, in
  which case it types normally. **This is the single cheapest high-value trick in the dossier.**
- Labels are Twig templates with `barcode_svg(content, type)` (e.g. `QRCODE`, `CODE128`) and a
  `vendorBarcode` field on lots.

---

## Standards & protocols

This is the part of the segment where a great deal exists on paper and almost none of it is used
in AV.

### Identity: GS1 Application Identifiers

**FACT** — read from the GS1 Barcode Syntax Dictionary
(`gs1/gs1-syntax-dictionary`, `gs1-syntax-dictionary.txt`, 344 lines):

| AI | Name | Syntax | Why it matters here |
| --- | --- | --- | --- |
| `01` | GTIN | `N14,csum` | product-model identity |
| `21` | SERIAL | `X..20` | requires `01`/`03`/`8006` — a serial is meaningless without a GTIN |
| `250` | SECONDARY SERIAL | `X..30` | requires `01+21` |
| **`8003`** | **GRAI — Global Returnable Asset Identifier** | `N1,zero N13,csum [X..16]` | **the standard identifier for a returnable transport item, i.e. a flight case** |
| **`8004`** | **GIAI — Global Individual Asset Identifier** | `X..30` | **the standard identifier for an individual fixed asset, i.e. a camera body** |
| `8006` | ITIP | `N14,csum N4,pieceoftotal` | "piece m of n" — components of a set |
| `10` / `11` / `17` | BATCH/LOT, PROD DATE, EXPIRY | | consumables (gaffer, batteries, pyro) |
| `253` | GDTI | `N13,csum [X..17]` | document identity (delivery notes) |
| `400` | ORDER NUMBER | `X..30` | ties a scan to a job |

**GRAI and GIAI are, on paper, exactly the right identifiers for AV rental**: GIAI for the asset,
GRAI for the reusable case it travels in. **INFERENCE (high confidence):** essentially nobody in AV
uses them. Not one of the products I read — Shelf, Snipe-IT, InvenTree, Part-DB, Homebox, Cheqroom,
Rentman — has a GRAI or GIAI field, or any GS1 AI parsing on the *asset* side. Odoo has a GS1
engine, but it is aimed at goods received from suppliers, not at owned rental assets.

Also verified: the dictionary encodes **`dlpkey`** (GS1 Digital Link primary keys) and
mutually-exclusive/requisite AI associations, so the same data can be expressed as a bracketed
element string, raw scan data, HRI text, or a **GS1 Digital Link URI** — a plain HTTPS URL in a QR
code. That last representation is what Shelf's `BarcodeType.ExternalQR` and Homebox's label `URL`
parameter are informally reinventing.

### Event capture: EPCIS 2.0 and the Core Business Vocabulary

**FACT** — `gs1/EPCIS` README and `JSON-Schema/schemas/bizStep-JSON-Schema.json`. EPCIS 2.0 and
CBV 2.0 are ratified GS1 standards (public review closed 2021-11-11; normative artefacts at
`ref.gs1.org/standards/epcis`, which is unreachable from here). EPCIS models *what happened to
which object, when, where and why*, with JSON/JSON-LD and REST bindings.

The CBV `bizStep` enumeration — read verbatim from the JSON Schema — contains **42 values**,
including:

```
accepting  arriving  assembling  collecting  commissioning  consigning
cycle_counting  decommissioning  departing  disassembling  holding
inspecting  installing  loading  packing  picking  receiving  removing
repairing  replacing  reserving  shipping  staging_outbound  stock_taking
storing  transporting  unloading  unpacking  ...
```

Read that list as an AV person: `packing`, `staging_outbound`, `loading`, `transporting`,
`unloading`, `installing`, `inspecting`, `repairing`, `unpacking`, `cycle_counting`,
`stock_taking`, `reserving`. **The vocabulary for a rental load-out already exists as a ratified
international standard, and the AV industry does not use it.** (FACT for the vocabulary;
INFERENCE for the non-use, but no product I read references EPCIS or CBV anywhere.)

### Symbologies and what actually reads them

- **ZXing** is the de facto reference implementation, and its format names have become an informal
  interchange vocabulary — Shelf's schema comment says its `BarcodeType` enum matches "zxing format
  names exactly" (FACT).
- The **Barcode Detection API** (WICG shape-detection spec) is the browser-native scanning path; the
  `barcode-detector` ponyfill (v3.2.2, published 2026-08-16) backs it with **ZXing-C++ compiled to
  WebAssembly** and enumerates the practical format universe (FACT — npm README): linear —
  `codabar, code_39 (+standard/extended), code_32, pzn, code_93, code_128, databar` (omni,
  stacked, expanded, limited), `dx_film_edge, ean_8, ean_13, itf, upc_a, upc_e`; matrix —
  `aztec (+rune), data_matrix, maxi_code, pdf417 (+compact/micro), qr_code (models 1/2, micro,
  rMQR)`; plus grouped selectors `linear_codes`, `matrix_codes`, `gs1_codes`, `retail_codes`,
  `industrial_codes`, `any`.
- **Practical subset actually used by this segment** (FACT, from the products): Code 128 and
  Code 39 for 1D; QR and DataMatrix for 2D; PDF417 only in Snipe-IT's label renderer; EAN-13 for
  retail-sourced goods.
- **QR versions and error correction are a real design constraint, not a detail.** Shelf stores
  `version` and `errorCorrection (L|M|Q|H)` per QR row; InvenTree's docs quantify the trade-off
  (see the deep dive). For a case label that will be scuffed, `Q` or `H` is the right call and it
  costs capacity — which is precisely why short alphanumeric payloads beat JSON payloads.

### Wire-level and label-level

- **Keyboard wedge** is the universal integration protocol of this segment: the scanner types the
  code plus a terminating Enter into whatever field has focus. InvenTree documents the `\n`
  requirement explicitly; Part-DB documents the `<SOH>` (0x01) prefix convention for
  scan-from-anywhere and Alt-key encoding of non-printables. (FACT.)
- **EIGP 114** — the ECIA labelling standard for DataMatrix on component packaging, referenced by
  name in Part-DB's scanner docs; built on ISO/IEC 15434 / ANSI MH10.8.2 message syntax
  (the ISO/ANSI lineage is **INFERENCE/domain knowledge — unverified here**, `iso.org` unreachable).
- **Label hardware formats** in evidence: Avery and Hema die-cut sheets; **Brother TZe** tape
  (12/18/24 mm), **Dymo**, **Zebra** and generic continuous tape (FACT — Snipe-IT
  `app/Models/Labels/{Sheets,Tapes}`). Zebra's ZPL is the industry print language
  (**unverified here**; a community Snipe-IT tool listed in the README targets a *Zebra ZD410*).
- **Homebox's external label service** is an interesting minimal contract: an HTTP `GET` with
  `TitleText`, `DescriptionText`, `URL`, `QrSize`, `Width`, `Height`, `Dpi`, `Margin`,
  `ComponentPadding`, `DynamicLength`, `AdditionalInformation`; `User-Agent:
  Homebox-LabelMaker/1.0`, `Accept: image/*`; response must be `image/*` within a 30 s default
  timeout and under the upload size cap. (FACT — `external-label-service.mdx`.) That is a
  ten-parameter, printer-agnostic label protocol anyone could implement.
- **GS1 nomenclature parsing in practice** — Odoo's `barcodes_gs1_nomenclature` module is a
  complete, readable reference: `FNC1_CHAR = '\x1D'`, a configurable FNC1 separator regex
  (`(Alt029|#|\x1D)`) because scanners emit the group separator differently, GS1 `yymmdd` date
  decoding with GS1 General Specifications §7.12 century determination, and per-AI pattern rules;
  the base module additionally handles UPC-A ↔ EAN-13 conversion in both directions and check-digit
  validation. (FACT — `addons/barcodes/models/barcode_nomenclature.py`,
  `addons/barcodes_gs1_nomenclature/models/barcode_nomenclature.py`.)

### RFID

**Largely UNKNOWN in this pass.** `gs1.org` and `ref.gs1.org` were unreachable, and no RFID vendor
named in the brief (Yellowfish, Rentcorp, Kit Check) had a reachable primary source. What can be
said honestly:

- The GS1 AI layer above (**GIAI/GRAI**) is the same identity layer EPC RFID tags encode, so an
  RFID rollout and a barcode rollout should share one identifier scheme. (INFERENCE from the
  Syntax Dictionary, which is identifier-carrier-agnostic.)
- **Not one** of the six open-source products I read has any RFID support — no EPC field, no reader
  integration, no bulk-read model. (FACT, by absence, across all six schemas/doc trees.)
- The specific claim that "UHF RFID lets you read a whole case without opening it" is the entire
  commercial premise of RFID in AV rental. **I could not verify a single deployment, price or
  read-rate figure.** To check: GS1 EPC Tag Data Standard and ISO/IEC 18000-63 at `ref.gs1.org`;
  vendor case studies at the vendors' own sites.

---

## What this segment does WELL

Patterns worth stealing, each traced to where I read it.

1. **Split identity from identifier — and allow several identifiers per thing.**
   Shelf has `Qr` *and* `Barcode` as separate tables plus a `preferredBarcodeId` display override;
   Cheqroom has `codes[]` *and* `barcodes[]`; InvenTree has internal *and* external *and* plugin
   barcodes; Part-DB matches internal ID, then IPN, then GTIN/EAN, then a user barcode, then a
   distributor code. **Nobody good assumes one code per asset.** The manufacturer's serial label,
   the previous rental house's sticker and your own QR all coexist and all resolve.

2. **Print codes before they mean anything.** Shelf's `PrintBatch` + unclaimed `Qr` lets you print
   a roll of labels, stick them on gear, and *then* claim each one by scanning it. This inverts the
   painful order (create record → print label → find the asset again).

3. **A scan is a gesture, not a type.** Shelf's `ScanListItem` carries
   `type?: "asset" | "kit"` and `codeType?: "qr" | "barcode"` — the worker scans whatever is in
   front of them and the system works out whether it was a case or an item. Same in InvenTree's
   global quick-scan.

4. **The container is a first-class object with its own tag, status, location and custody.**
   Shelf's `Kit` has QR codes, a `KitStatus`, a `Location` and a `KitCustody` whose inherited
   custody cascades to members. Scanning one case label moves twenty items.

5. **Distinguish kit-driven state from manual state.** Shelf's `AssetLocation.assetKitId`
   discriminator (NULL = manual, non-NULL = "here because the kit is here", read-only in the manual
   editor) is the cleanest solution I saw to "who owns this fact". Same pattern on
   `Custody.kitCustodyId`.

6. **Partial check-out and check-in are the normal case, not an exception.** Shelf models each scan
   batch as a session row with positionally-aligned asset/quantity/slice arrays. Gear comes back in
   three vans over two days; a boolean `returned` flag cannot express that.

7. **Never drop a scan.** Shelf's failed-queue + `syncFailed` flag + *blocked audit completion* is
   the correct answer to the offline problem. The wrong answer — a fire-and-forget POST — produces
   the exact failure its code comments describe: an item the worker saw and counted is later
   reported MISSING.

8. **Snapshot history by value.** `AuditScan.assetTitle` and `AuditScan.wasExpected` are stored at
   scan time so deleting an asset cannot retroactively rewrite last month's audit.

9. **Separate `DAMAGE` from `LOSS`.** Shelf's `ConsumptionCategory` does; the schema comment says
   why — *"items returned but unusable — distinct from LOSS for reporting"*. Most systems collapse
   both into "missing".

10. **Make the identifier short.** InvenTree's `INV-SI123` versus `{"stockitem": 123}` is a
    measured, documented decision about QR version and error-correction budget. On a scuffed case
    label at 22:00 in a loading bay, this is the difference between a scan and a retype.

11. **Scan-from-anywhere with an `<SOH>` prefix** (Part-DB). No modal, no "open the scanner page" —
    the code arrives and the app navigates, unless a field is focused.

12. **Two modes on one control**: Part-DB's "Info" toggle — inspect vs navigate.

13. **A serial-number mini-grammar.** InvenTree's `1 3-5 9+2` and `~+2` beats twenty text fields.

14. **Bulk creation with auto-numbering.** Cheqroom's `createMultiple(times, autoNumber, startFrom)`
    + `getLastNumber()`.

15. **Custody transfer as a verb.** Cheqroom's `transferCustody(customerId)` — gear changes hands
    between two freelancers without a fictional trip through the warehouse.

16. **Per-asset permission flags.** Cheqroom's `allowReserve` / `allowCheckout` / `allowCustody`;
    Shelf's `availableToBook`. "This item exists, is tracked, but may never leave" is a real state.

17. **Barcode input inside ordinary form fields** (InvenTree): any field pointing at a scannable
    model grows a barcode icon. No separate scanning mode to learn.

18. **Publish a label-service contract instead of supporting every printer** (Homebox): ten query
    parameters, `image/*` back, 30 s timeout.

19. **Scheduled audits with due/overdue reporting.** Snipe-IT's `last_audit_date` /
    `next_audit_date` plus a reporting route over `audit|audits|checkins` ×
    `due|overdue|due-or-overdue`, and a bulk audit endpoint that returns a per-row envelope.

20. **Containment as a tree, not a foreign key.** NetBox's `InventoryItem` is an MPTT tree of
    serialised sub-components inside a device; Sortly's items are a `parent_id` tree with
    folder/item types and `include_subtree` on clone. Cases nest.

---

## What NOBODY in this segment solves well

The white space, in rough order of how badly it hurts an AV rental operation.

1. **Offline is a footnote everywhere except one audit screen.**
   Of everything I could verify: **Shelf's companion app has a real offline scan queue — for
   audits.** InvenTree has none (the word "offline" appears once in its entire doc tree,
   unrelated). Snipe-IT has none and no first-party app at all. Part-DB, Homebox: none found.
   Rentman, Cheqroom, Current RMS, Flex, EZO, Sortly, Asset Panda: **UNKNOWN**, and their vendor
   pages were unreachable, so their marketing claims are untested here.
   The realistic warehouse case — a steel-shelved hall with one access point, forty cases going
   out, and check-out (not audit) being the task — is served by **one** verified implementation, and
   only for the wrong workflow.

2. **The case is a container in exactly one product, and even there it has no physics.**
   Shelf's `Kit` is a proper container but has **no weight, no dimensions, no volume, no tare
   weight and no packing rules**. Rentman has the physics (`empty_weight`, `packed_per`,
   `quantity_in_cases`, `volume`, `length/width/height`) but **exposes no scanning API**, so nobody
   can build against it. Snipe-IT's kit is a checkout template. Cheqroom's kit is a flat bag.
   **Nobody ships "this case, with these twenty items, weighing 41 kg packed, going on truck 2".**

3. **Nesting stops at one level.** Item → case works. Case → road box → truck → venue → room does
   not. Only NetBox (`InventoryItem` MPTT) and Sortly (`parent_id` tree) model arbitrary depth, and
   neither is an AV product. In real load-outs, containment is three or four deep and the middle
   levels are exactly what goes missing.

4. **Damage is a text field.** Shelf has a `DAMAGE` consumption category and asset notes; Snipe-IT
   has a maintenance record with a cost and a URL; Rentman has a read-only `/repairs` row with
   `status` and `remark`. **Nobody I read has a structured damage report**: photo at check-in, the
   specific part affected, severity, who signed for it, whether it is chargeable to the client,
   whether the item may still go out. Shelf's `AuditImage` is the closest — and it is scoped to
   audits, not returns.

5. **Sub-hire is invisible to the scanner.** Rentman models `/subrentals` properly — and makes it
   **read-only** through the API, with no scan endpoint. Nobody else models sub-hire at all: not
   Shelf, not Snipe-IT, not Cheqroom, not InvenTree. So the single highest-risk gear on a show —
   somebody else's, on your insurance, due back on a specific date — is tracked in email.

6. **Serial numbers are a string, not an identity.** Shelf has no dedicated serial field beyond
   custom fields and `sequentialId`. Snipe-IT has `Asset.serial`, one per asset. Rentman and ERPNext
   do it properly (`/serialnumbers`, `Serial No` doctype). **Nobody links a serial to a firmware
   version, a calibration record, or a "this specific body has the flaky SDI-2" note** that follows
   the body rather than the model.

7. **The check-out scan and the plan are different universes.** Every product here scans against a
   *booking* or an *order*. None scans against a **technical plan**: a signal-flow drawing, a rack
   elevation, a camera plan. The warehouse cannot verify "the plan says two 50 m SDI drums on
   camera 3; you scanned one". This is the same finding the `synthesis` documents record for the
   suite as a whole — the market is all runtime and no design time — arriving here from the
   warehouse door.

8. **No GS1 identity anywhere.** GRAI (AI 8003) and GIAI (AI 8004) exist precisely for returnable
   and individual assets. Not one product uses them. The consequence is concrete: when gear moves
   between two rental houses, or a sub-hired case arrives, **the two systems cannot recognise the
   same physical object**, so it is retyped. GS1 also defines the compressed Digital Link URI form,
   which would make a scanned label meaningful to a system that has never heard of your database.

9. **No EPCIS-style event log.** Every product has an activity feed; none has an interchangeable
   event record. CBV's `packing / loading / transporting / unloading / installing / inspecting /
   repairing / unpacking` vocabulary is ratified and unused. Two companies working the same show
   cannot merge their scan histories.

10. **Scanning speed is nobody's published metric.** I found no product documenting scans per
    minute, decode latency, or continuous/burst scanning behaviour. The only performance-shaped
    evidence in the whole corpus is indirect: Shelf's comment about "a sub-2s scanning burst"
    perpetually resetting a debounced saver — which tells you real users scan faster than once every
    two seconds, and that the software was not initially built for it. Camera-based scanning of a
    45-case load-out is a fundamentally different problem from scanning one laptop, and nobody
    publishes numbers for it.

11. **Barcode support is monetised at exactly the wrong boundary.** Shelf's hosted product puts
    QR in the free tier and **barcodes behind a paid add-on**. But barcodes are what you need to
    read the *manufacturer's existing label* — i.e. the cheapest possible on-boarding path for a
    warehouse with 3,000 items already labelled by Sony and Sennheiser. The paywall sits across the
    migration path.

12. **Labels assume an office.** Avery sheets, Brother TZe tapes, Dymo. Nobody models the label
    stock an AV house actually needs: solvent-resistant, gaffer-tape-survivable, readable at an
    angle in a dark truck, with a large human-readable asset number *and* a small dense 2D code.
    Snipe-IT gets closest by supporting Zebra tape, and even there the layout is a fixed
    `DefaultLabel` composition.

13. **Multi-tenant reality is ignored.** A freelance engineer works for four rental houses in a
    month and carries their own gear. Every product here is single-workspace-per-org (Shelf's
    `maxOrganizations` defaults to **1** on paid tiers). There is no model for "my kit, on your
    show, tracked in your system, returning to my van".

---

## Relevance to AV Planner Suite

**Primary: `cable-planner`. Secondary: `shell/suite`, `multicam-planner`, `light-planner`.
Not relevant: `broadcast-intercom`, `tally-pi`, `sony-camera-bridge`, `pi-media-station`.**

### Why `cable-planner` is the natural home

Three things already in the repo line up with this segment almost exactly (per `CLAUDE.md`):

1. **`rentman:*` and `netbox:*` IPC domains already exist.** The Rentman findings above are
   directly actionable: `/equipment` (with `quantity_in_cases`, `packed_per`, `empty_weight`,
   `is_combination`), `/equipmentsetscontent` (**writable** — kit contents can be pushed),
   `/serialnumbers` (**writable**), `/repairs` and `/subrentals` (**read-only**),
   `/stockmovements` (**no create**). And the hard limit: **there is no scan/check-in/check-out
   endpoint**, so the suite must own its own scan ledger and reconcile against Rentman, never
   delegate to it. Rate budget to design against: 50,000/day, 10/s, 20 concurrent, 1,500/page,
   token invalidated on regeneration.
   NetBox contributes the containment pattern: `Device.asset_tag` + `Device.serial`, and
   `InventoryItem` as an **MPTT tree of serialised sub-components** — which is the shape
   `cable-planner` needs for case-in-case.

2. **`mobileShareServer` already ships a LAN view to phones (read/check-only).** This is a
   scanner in everything but name. The `barcode-detector` ponyfill (ZXing-C++ via WASM, ~all
   relevant symbologies) runs in a browser with no app-store dependency, and the phone is already
   on the LAN talking to the Electron main process. **A warehouse-scan mode in the existing mobile
   share view is a smaller change than any competitor's mobile app, and it is offline by
   construction** — the "server" is the laptop in the truck, not a cloud.

3. **The suite is offline-first Electron with atomic writes and a schema-migration hook
   (`healProjectPositions`).** The segment's hardest problem — durable local scan state that
   survives an app kill — is a solved problem in this codebase's existing persistence layer, where
   for every competitor it is a bolt-on.

### The specific white space the suite is positioned to take

**Scanning against the plan, not against an order.** Every product in this segment verifies
physical reality against a *commercial* document (a booking, an order, a project). `cable-planner`
holds something none of them do: the **technical** document — the signal flow, the rack elevation,
the cable list with lengths and connector types. The unclaimed capability is:

> Scan a case at the loading bay and be told, *"this is the FOH rack for Studio 2; the plan wants
> two 50 m SDI drums and you have scanned one; the ATEM in this rack is serial 4, and serial 4 has
> an open damage note on SDI-2."*

Nobody sells that, because nobody else has the plan.

### Concrete, evidence-backed recommendations

| # | Recommendation | Source of the pattern |
| --- | --- | --- |
| 1 | **Dual identity from day one**: an internal short code *and* a list of foreign codes per item. Never assume one code per asset. | Shelf `Qr`+`Barcode`; Cheqroom `codes[]`+`barcodes[]`; InvenTree internal/external; Part-DB's 5-step match cascade |
| 2 | **Short alphanumeric payload, not JSON.** Something like `CP-A0041` — fixed prefix, model letter, sequence. Keeps QR at v1 with `Q`/`H` error correction, which is what a scuffed case label needs. | InvenTree `INV-SI123` and its documented version/ECL analysis |
| 3 | **Model the case as a container object with its own code, status, location and custody — and give it physics** (`empty_weight`, packed weight, dimensions, `packed_per`). This is the combination *nobody* ships. | Shelf `Kit`/`KitCustody`/`AssetKit` for the structure; Rentman `empty_weight`/`packed_per`/`quantity_in_cases` for the physics |
| 4 | **Kit-driven vs manual discriminator on placement and custody.** A nullable `assetKitId` on the placement row, read-only when set. | Shelf `AssetLocation.assetKitId`, `Custody.kitCustodyId` |
| 5 | **Nest containers arbitrarily** (item → case → road box → truck → venue → room). Use a tree, not a foreign key. | NetBox `InventoryItem` MPTT; Sortly `parent_id` + `include_subtree` |
| 6 | **Durable scan queue with a failed queue that blocks completion.** Persist on *every* branch, retry `[2s, 5s, 15s]`, never drop, surface the failure. Copy this design; it is the best thing in the segment. | Shelf `use-scan-queue.ts` |
| 7 | **Snapshot audit/scan rows by value** (`assetTitle`, `wasExpected`) so history cannot be rewritten by a later delete. | Shelf `AuditScan` |
| 8 | **Partial check-out / check-in as session rows**, with the explicit warning that absence of a session row proves nothing. | Shelf `PartialBookingCheckout` and its schema comment |
| 9 | **Separate `DAMAGE` from `LOSS`**, and go further than the segment: structured damage report with photo, affected component, severity, chargeable flag, and a blocks-dispatch flag. This is open white space. | Shelf `ConsumptionCategory`; nobody does the structured version |
| 10 | **`<SOH>`-prefix scan-from-anywhere plus an Info/Navigate toggle.** Cheapest high-value scanner ergonomics in the dossier. | Part-DB `docs/usage/scanner.md` |
| 11 | **Serial-number shorthand grammar** for bulk entry (`1 3-5 9+2`, `~+2`) and **bulk create with auto-numbering** (`createMultiple(times, autoNumber, startFrom)`). | InvenTree; Cheqroom |
| 12 | **Print-first labels**: mint unclaimed codes in a print batch, claim by scanning. | Shelf `PrintBatch` + unclaimed `Qr` |
| 13 | **Adopt GS1 GIAI (AI 8004) for assets and GRAI (AI 8003) for cases**, even if only as an optional field. Costs almost nothing, and it is the only path to recognising *someone else's* asset — sub-hire, cross-hire, a case returned to the wrong house. First mover advantage is real here because the field is empty. | GS1 Barcode Syntax Dictionary |
| 14 | **Log scans in an EPCIS-shaped event record** using CBV `bizStep` values (`packing`, `loading`, `unloading`, `inspecting`, `repairing`, `unpacking`, `stock_taking`). Even used purely internally, it gives a stable vocabulary; used externally it makes two companies' logs mergeable. | GS1 CBV `bizStep` enum |
| 15 | **Publish a label-service contract** rather than supporting printers directly: `GET` with title/description/URL/QR-size/dimensions/DPI, return `image/*`. Ship one built-in renderer and let houses with a Zebra/Brother fleet plug in their own. | Homebox `external-label-service.mdx` |
| 16 | **Do not paywall barcodes.** Reading the manufacturer's existing label is the migration path; a paywall across it is a paywall across adoption. | Shelf's barcodes add-on, as a counter-example |
| 17 | **Treat Rentman as read-mostly.** Pull equipment, sets, serials, repairs, subrentals; push serials and set contents where writable; **never assume you can post a scan or a repair.** Own the scan ledger locally and reconcile. | Rentman OAS coverage, verified above |

### For the other repos

- **`shell` / suite**: the asset identity layer belongs at suite level, not inside one planner —
  `multicam-planner` (camera bodies, lens serials) and `light-planner` (fixture serials, lamp hours,
  gel stock) need the same `Asset` / `Kit` / `Serial` / `Damage` objects. Building it inside
  `cable-planner` and lifting it later is the expensive order.
- **`multicam-planner`**: camera bodies are the canonical serial-tracked asset — firmware version,
  shutter/hours, "this body has the flaky SDI-2". The segment's weakest point (§6 above) is this
  repo's natural strength.
- **`light-planner`**: fixtures are serial-tracked and case-packed; lamp hours are a maintenance
  counter that *no* product in this segment models (they all model dates, not usage counters).
- **`broadcast-intercom`, `tally-pi`, `sony-camera-bridge`, `pi-media-station`**: no relevance
  beyond appearing as assets in someone else's inventory.

---

## Sources

Every URL below was actually opened or cloned during this pass. Nothing was cited from memory.

### Opened directly — source code, schemas and in-repo documentation

**Shelf.nu** (cloned `https://github.com/Shelf-nu/shelf.nu`, HEAD 2026-08-28)
- https://raw.githubusercontent.com/Shelf-nu/shelf.nu/main/README.md
- https://raw.githubusercontent.com/Shelf-nu/shelf.nu/main/LICENSE
- https://raw.githubusercontent.com/Shelf-nu/shelf.nu/main/package.json
- `packages/database/prisma/schema.prisma` (2,614 lines — Asset, AssetType, ConsumptionCategory, Qr, Barcode, BarcodeType, PrintBatch, Scan, ReportFound, Kit, KitCustody, AssetKit, AssetLocation, AssetReminder, PartialBookingCheckin/Checkout, MobileAuthCode, AuditSession/Assignment/Asset/Scan/Note/Image, Tier/TierLimit/CustomTierLimit)
- `COMPANION-RELEASE-STATUS.md`
- `apps/companion/hooks/use-scan-queue.ts`
- `apps/companion/components/offline-banner.tsx`
- `apps/companion/.maestro/flows/**` (file listing: audits, bookings, assets scan flows)
- `apps/docs/barcode-types-development-guide.md`
- `apps/docs/scanner-drawer-development.md`
- `apps/docs/app-configuration.md`
- `apps/docs/asset-import.md`
- `apps/docs/index.md`

**Snipe-IT** (cloned `https://github.com/grokability/snipe-it`, HEAD 2026-08-29)
- https://raw.githubusercontent.com/grokability/snipe-it/master/README.md
- https://raw.githubusercontent.com/grokability/snipe-it/master/LICENSE
- https://raw.githubusercontent.com/grokability/snipe-it/master/package.json
- https://raw.githubusercontent.com/grokability/snipe-it/master/composer.json
- `config/version.php` (v8.7.2)
- `app/Models/Asset.php`, `app/Models/Maintenance.php`, `app/Models/MaintenanceType.php`, `app/Models/Statuslabel.php`, `app/Models/PredefinedKit.php`, `app/Models/Setting.php`
- `app/Models/Labels/Label.php`, `app/Models/Labels/DefaultLabel.php`, `app/Models/Labels/Sheets/**`, `app/Models/Labels/Tapes/**`
- `app/Helpers/Helper.php` (`barcodeDimensions`)
- `app/View/Label.php`, `app/Http/Controllers/QrCodeController.php`
- `routes/api.php`

**InvenTree** (cloned `https://github.com/inventree/InvenTree`, HEAD 2026-08-29)
- https://raw.githubusercontent.com/inventree/InvenTree/master/README.md
- https://raw.githubusercontent.com/inventree/InvenTree/master/LICENSE
- `docs/mkdocs.yml`
- `docs/docs/barcodes/index.md`, `internal.md`, `external.md`, `custom.md`
- `docs/docs/app/barcode.md`
- `docs/docs/part/trackable.md`, `docs/docs/part/stocktake.md`

**Homebox** (cloned `https://github.com/sysadminsmedia/homebox`, HEAD 2026-08-21)
- https://raw.githubusercontent.com/sysadminsmedia/homebox/main/LICENSE
- `docs/src/content/docs/en/advanced/external-label-service.mdx`
- `backend/internal/data/ent/schema/maintenance_entry.go`
- repository file listing (`backend/pkgs/labelmaker`, `v1_ctrl_labelmaker.go`, `v1_ctrl_qrcode.go`, `frontend/components/Item/BarcodeModal.vue`, `docs/public/api/openapi-3.0.{json,yaml}`)

**Part-DB** (cloned `https://github.com/Part-DB/Part-DB-server`, HEAD 2026-08-28)
- https://raw.githubusercontent.com/Part-DB/Part-DB-server/master/README.md
- https://raw.githubusercontent.com/Part-DB/Part-DB-server/master/LICENSE
- `docs/usage/scanner.md`
- `docs/usage/labels.md`

**Cheqroom** (cloned `https://github.com/CHECKROOM/checkroom_core_js`, HEAD 2020-03-03)
- `src/core/base.js`, `item.js`, `kit.js`, `helper.js`, `permissionHandler.js`
- module listing (`api, attachment, availability, category, colorLabel, comment, conflict, contact, document, field, group, location, order, orderTransfer, reservation, settings, template, transaction, user, usersync, webhook`)
- `package.json`

**Rentman API** (cloned `https://github.com/Alternative-Design-And-Media/rentman-api-connector`, HEAD 2026-08-07)
- https://raw.githubusercontent.com/Alternative-Design-And-Media/rentman-api-connector/main/llms.txt
- `src/types.ts` (RentmanEquipmentItem, RentmanSerialNumber, RentmanRepair, RentmanStockMovement, RentmanStockLocation, RentmanSubrental, RentmanEquipmentSetContent, RentmanActualContent, RentmanEquipmentAssignedSerial)
- https://raw.githubusercontent.com/huelsevoort/n8n-nodes-rentman/main/README.md (63-resource operation table, API limits)

**Odoo**
- https://raw.githubusercontent.com/odoo/odoo/master/addons/barcodes/models/barcode_nomenclature.py
- https://raw.githubusercontent.com/odoo/odoo/master/addons/barcodes_gs1_nomenclature/models/barcode_nomenclature.py

**NetBox**
- https://raw.githubusercontent.com/netbox-community/netbox/main/netbox/dcim/models/devices.py
- https://raw.githubusercontent.com/netbox-community/netbox/main/netbox/dcim/models/device_components.py

**ERPNext**
- https://raw.githubusercontent.com/frappe/erpnext/develop/erpnext/stock/doctype/serial_no/serial_no.json

### Opened directly — standards

- https://raw.githubusercontent.com/gs1/EPCIS/master/README.md
- https://raw.githubusercontent.com/gs1/EPCIS/master/JSON-Schema/schemas/bizStep-JSON-Schema.json (42-value CBV `bizStep` enum)
- https://github.com/gs1/EPCIS (cloned; CBV/JSON-LD/Ontology file listing)
- https://raw.githubusercontent.com/gs1/gs1-syntax-dictionary/main/README.md
- https://raw.githubusercontent.com/gs1/gs1-syntax-dictionary/main/gs1-syntax-dictionary.txt (AIs 01, 10, 11, 17, 21, 22, 250, 253, 254, 400, 7003, 8003 GRAI, 8004 GIAI, 8006 ITIP, 8018, 8200)

### Opened directly — package registries (vendor API clients)

- https://registry.npmjs.org/cheqroom-core (official Cheqroom JS wrapper; API base `https://api.cheqroom.com/api/v2_5`)
- https://registry.npmjs.org/@alternative-design-and-media/rentman-api-connector
- https://registry.npmjs.org/n8n-nodes-rentman
- https://registry.npmjs.org/@apigrate/sortly (Sortly API connector; item tree, `include_subtree`, rate limiting)
- https://registry.npmjs.org/current-rms (Node client; points at `https://api.current-rms.com/doc`)
- https://registry.npmjs.org/barcode-detector (Barcode Detection API ponyfill, ZXing-C++ WASM, full format table)
- https://registry.npmjs.org/assetpanda-mcp-kb (published from `github.com/assetpanda/pioneer` — evidence of an Asset Panda public API)
- https://registry.npmjs.org/the-real-snipeit-mcp (183 tools over Snipe-IT's OpenAPI 3.1)
- https://registry.npmjs.org/-/v1/search — queries run: `cheqroom`, `rentman`, `current-rms`, `hirehop`, `snipeit`, `asset panda`, `ezofficeinventory`, `sortly`, `ezoffice`, `geartrack`, `flex rental`, `wireless workbench`, `blackbox-av`, `kit check`, `asset tracking rfid`, `equipment rental barcode`
- https://pypi.org/pypi/snipeit/json (Python client, archived per Snipe-IT README)
- https://pypi.org/simple/ (full index, grepped for `hirehop`, `rentman`, `cheqroom`, `ezoffice`, `currentrms`, `current-rms`, `flexrental`, `assetpanda`, `sortly` — **all zero hits**)

### Opened directly — discovery indexes

- https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md (Inventory Management section: HomeBox, InvenTree, Open QuarterMaster, Part-DB, Shelf, Spoolman, Cannery, DVinyl, Inventaire)
- https://raw.githubusercontent.com/awesome-foss/awesome-sysadmin/master/README.md (CMDB section: i-doit, iTop, NetBox)
- `awesome-audiovisual/README.md` (local clone from an earlier pass — only asset-adjacent entry is Rentman)

### Probed and BLOCKED (recorded so the gap is auditable)

`snipeitapp.com`, `cheqroom.com`, `sortly.com`, `assetpanda.com`, `ezofficeinventory.com`,
`hirehop.com`, `rentman.io`, `docs.rentman.io`, `current-rms.com`, `flexrentalsolutions.com`,
`shelf.nu`, `gs1.org`, `ref.gs1.org`, `kitcheck.com`, `shure.com`, `blackbox.global`,
`geartrack.io`, `inventree.org`, `docs.inventree.org`, `homebox.software`, `odoo.com`,
`erpnext.com`, `en.wikipedia.org`, `iso.org`, `inventree.readthedocs.io`, `shelf-nu.github.io`,
`github.com` (HTML), `api.github.com` (repo + search endpoints, session-scoped),
`archive.org`, `gist.githubusercontent.com`, `raw.githack.com`, `sourceforge.net`.

### Not found — no primary source reachable, recorded as UNKNOWN rather than guessed

GearTrack; InventoryBase; Kit Check / Bluesight; Shure Wireless Workbench asset features;
"Blackbox"; Yellowfish and Rentcorp RFID; HireHop's API; Flex Rental Solutions' API and offline
behaviour; EZOfficeInventory's API; **every price in the segment**.
