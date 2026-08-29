# Generic Project Management (what actually helps AV, what is bloat)

> Research date: **2026-08-29**. Claims labelled per [`docs/research/METHOD.md`](../METHOD.md):
> **FACT** (read on a cited page), **INFERENCE** (reasoning), **UNKNOWN / unverified**.

## Source-access caveat — read this before trusting any number

This pass ran with a hard constraint that shapes the whole dossier, and hiding it would make the
document worse than useless for commercial decisions.

- The web-search budget for the session was **exhausted (200/200 calls) before this segment
  started**. No search summaries were available.
- The egress proxy permitted **only `raw.githubusercontent.com`, `api.github.com` (via the GitHub
  MCP search tools) and `gitlab.com`**. Every vendor domain was refused at CONNECT:
  `monday.com`, `asana.com`, `clickup.com`, `notion.com`, `trello.com`, `linear.app`,
  `airtable.com`, `basecamp.com`, `smartsheet.com`, `wrike.com`, `height.app`,
  `studiobinder.com`, `yamdu.com`, `setkeeper.com`, `farmerswife.com`, plus
  `developer.atlassian.com`, `developers.asana.com`, `developers.notion.com`, Wikipedia, Reddit
  and Stack Overflow. Verified by probe, 2026-08-29.

Consequences, stated plainly:

1. **No price in this dossier was verified today.** Not one pricing page could be opened. Every
   figure below is either (a) carried over from a sibling dossier in this corpus, which itself
   obtained it via search summary, and is marked `[CORPUS, second-hand]`, or (b) marked
   **UNVERIFIED** with the exact URL that must be checked. Per the brief's own rule, prices must
   carry a date and a source URL; where I cannot supply both, I supply neither and say so.
2. **Feature and API claims are strong where they rest on code and specs, weak elsewhere.** The
   GitHub channel turned out to be unusually good for this segment: Asana publishes its complete
   OpenAPI specification, Basecamp publishes its entire API reference and a six-language SDK,
   Monday and Linear publish generated SDKs, and the whole open-source half of the segment is on
   GitHub by definition. Roughly two thirds of the technical claims below were read from a spec
   file, a source file or a vendor-maintained README.
3. **Closed-source SaaS UX claims are the weak spot.** Offline behaviour of the monday.com iOS
   app, for instance, cannot be established from GitHub. Where that is the case the row says
   UNKNOWN rather than guessing.

The one methodological upside: a spec file is a *better* source than a marketing page. When
`asana_oas.yaml` says an allocation has `start_date`, `end_date` and an `effort` percentage and
nothing else, that is a harder fact about what Asana can model than any feature list.

## Segment summary

Generic project management software sells a small set of primitives — a **work item**, a
**container** for work items, a **state machine**, an **assignee**, a **date**, and a **view**
(list, board, table, calendar, timeline) — plus collaboration furniture (comments, mentions,
attachments, notifications) and, increasingly, an automation and AI layer on top.

Its economic model is **per seat per month**, which is the single most important fact about the
category and the source of most of its misfit with AV. The product is sold to a stable salaried
team that logs in every day from a desk. Its unit of work is a *task that takes days*, owned by
*one person*, done *at a computer*, and finished when someone clicks a button.

An AV or broadcast production is almost the inverse: the unit of work is a **shift** with a call
time and a wrap time; it is owned by a *crew*, not a person; it happens in a loading bay, on a
truss, or in an OB truck with no signal; and "done" is asserted by someone with both hands full.
The workforce is substantially freelance, changes every job, and would each need a seat.

**Who buys it in AV.** [INFERENCE, corroborated by [`roles/production-manager.md`](../roles/production-manager.md)]
Almost never the technical department. It arrives one of three ways: the parent broadcaster or
agency already standardised on Jira/Asana/monday and the production is told to use it; a
production coordinator adopts Notion or Airtable personally because the rental ERP models money
and not work; or a facility buys an AV-specific overlay (StudioBinder, Yamdu, SetKeeper, Croo)
that ships the production artefacts — call sheet, breakdown, stripboard — as first-class objects.

**Typical price band.** UNVERIFIED for this pass — see the caveat above and the
[Pricing](#pricing-what-could-and-could-not-be-established) section. The structural shape, which
is not a price claim, is: free tier → roughly "cheap" per-seat tier → roughly "double that" tier
with timeline/dependencies/custom fields → enterprise on sales contact. Self-hosted open source
moves the cost from per-seat licence to a server and an administrator.

**The structural asymmetry worth naming up front.** [FACT] A GitHub repository search for
`topic:project-management stars:>2000` returns **33 repositories**, headed by AppFlowy (76,048
stars), Plane (58,486) and Huly (27,485). A search for `callsheet in:name,description` returns
**110 repositories**, of which the highest-starred has **7 stars** and is a localisation-string
repo for a closed-source app; nothing in the result set is a maintained open-source call sheet
tool. (Both searches run 2026-08-29.) Generic project management has one of the largest
open-source ecosystems in software. The document that AV production actually runs on has
essentially none. [INFERENCE] That gap is the commercial opportunity and also the explanation for
why AV teams end up in Excel: for the generic half of the problem there are fifty free tools, and
for the AV-specific half there are none, so the two halves are bridged by a spreadsheet.

## Product table

Generic project management tools. "Offline?" means *can a user read and change data with no
network*, not *does the page load*.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **monday.com** | monday.com (IL) | Web, iOS, Android, desktop wrapper | Per seat/mo; UNVERIFIED (`monday.com/pricing` unreachable). Whether a seat minimum applies is **UNKNOWN** — see Pricing | UNKNOWN | **Yes — GraphQL.** Official SDKs: `monday-sdk-js`, `@mondaydotcomorg/api` (generated TS), Ruby, Python; apps framework with board views and widgets [FACT] | Non-technical teams building a colourful custom tracker without IT |
| **Asana** | Asana (US) | Web, iOS, Android | Per seat/mo, tiered; UNVERIFIED (`asana.com/pricing` unreachable) | UNKNOWN | **Yes — REST, full public OpenAPI 3.0.0 spec: 175 paths, 280 schemas** [FACT, read `defs/asana_oas.yaml`] | The richest *data model* in the mainstream segment: allocations, budgets, out-of-office, custom types, portfolios |
| **ClickUp** | ClickUp (US) | Web, iOS, Android, desktop | Per seat/mo; UNVERIFIED | UNKNOWN | **Yes — REST v2**, but **no official SDK repo found on GitHub**; all located clients are community-built, top result 4 stars [FACT, search 2026-08-29] | Feature breadth; one tool that claims to replace eight |
| **Notion** | Notion Labs (US) | Web, iOS, Android, desktop | Per seat/mo; UNVERIFIED | UNKNOWN (offline mode has been shipped in some form — **not verifiable this pass**) | **Yes — REST.** Official `@notionhq/client`; **versioned API, current default `2025-09-03`, newer `2026-03-11`** [FACT, read SDK README]; automatic retry on 429/529/500/503 | Freeform documents that double as a database; the production wiki |
| **Jira** | Atlassian (AU) | Web, iOS, Android | Per seat/mo + Data Center; UNVERIFIED | No (cloud) [INFERENCE] | Yes — REST; large third-party client ecosystem (`atlassian-python-api`) [FACT, README read] | Rigorous workflow/state machines and audit trails |
| **Trello** | Atlassian (AU) | Web, iOS, Android | Per seat/mo, generous free tier; UNVERIFIED | UNKNOWN | Yes — REST | The lowest-friction shared board; the tool a crew will actually open |
| **Smartsheet** | Smartsheet (US) | Web, iOS, Android | Per seat/mo, licensed-vs-free-collaborator model; UNVERIFIED | UNKNOWN | **Yes — REST, official SDKs** incl. `smartsheet-javascript-sdk` [FACT, README read] | The spreadsheet that people will accept as a system; strong for anyone already living in Excel |
| **Basecamp** | 37signals (US) | Web, iOS, Android | UNVERIFIED (`basecamp.com/pricing` unreachable). 37signals is commonly said to offer a flat per-account tier rather than pure per-seat — **treat as unverified recollection, not a finding** | UNKNOWN | **Yes — REST, best-documented API in the segment.** Six official SDKs (Go, Ruby, TypeScript, Swift, Kotlin, Python); OAuth2 + device flow (RFC 8628); ETag caching; webhooks [FACT, read `bc3-api` + `basecamp-sdk`] | Calm, opinionated coordination; **first-class client-approval objects** |
| **Wrike** | Wrike / Symphony (US) | Web, iOS, Android | Per seat/mo, tiered; UNVERIFIED | UNKNOWN | Yes — REST (docs unreachable). **No public API SDK in the `wrike` GitHub org** — the org is internal tooling only [FACT, org listing read 2026-08-29] | Work-request intake forms and approval routing |
| **Linear** | Linear (US) | Web, macOS/Windows desktop, iOS | Per seat/mo; UNVERIFIED | Partially — client is built on a local sync store [INFERENCE from architecture, **not verified**] | **Yes — GraphQL, official typed SDK generated from schema, MIT** [FACT, `linear/linear` read] | Speed and keyboard-first UX; the benchmark for "feels instant" |
| **Height** | Height (US) | Web, desktop | UNVERIFIED | UNKNOWN | UNKNOWN | **Nothing verifiable this pass** — `height.app` unreachable, no SDK repo found. Listed only because the brief seeded it |
| **Airtable** | Airtable (US) | Web, iOS, Android | Per seat/mo + record/attachment caps; UNVERIFIED | No — network-dependent [INFERENCE] | **Yes — REST, official `airtable.js`**, personal access tokens + OAuth [FACT, README read] | Letting a coordinator model gear, crew and vehicles as tables in an afternoon |
| **Teamwork** | Teamwork.com (IE) | Web, mobile | Per seat/mo; UNVERIFIED | UNKNOWN | Yes (docs unreachable) | Client/agency work with billable time |
| **Nifty** | Nifty (US) | Web, mobile | UNVERIFIED | UNKNOWN | UNKNOWN | Not verifiable this pass |

Open-source and self-hosted — where the technical claims are strongest, because they were read
from source.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **OpenProject** | OpenProject GmbH (**DE, Berlin**) | Web, self-hosted or cloud | AGPL Community Edition free; paid Enterprise add-ons; cloud UNVERIFIED | No for the app; **yes for the calendar** via iCal subscription [FACT] | **Yes — REST (HAL+JSON).** Plus **per-query iCal subscription URLs** with revocable hashed tokens (`Token::ICal`, prefix `opical`, one token per query) [FACT, read `app/models/token/ical.rb`] | Gantt/timeline, dependencies, data sovereignty; the credible Jira/MS-Project replacement for German public bodies |
| **Vikunja** | Vikunja / kolaente (**DE**) | Web (PWA), **Electron desktop**, self-hosted | AGPL-3.0; **Vikunja Pro** paywalls admin panel, audit logs, time tracking; hosted cloud UNVERIFIED | **Shell only — not data.** Service worker precaches assets `StaleWhileRevalidate`, but registers **`NetworkOnly` with `cache:'no-store'` for every `/api/v1/*` route** [FACT, read `frontend/src/sw.ts`] | **Yes — REST, OpenAPI at `/api/v2/docs`. And a real CalDAV server**: emits `VTODO` with `DUE`, `RRULE`, `VALARM`, `RELATED-TO`, `X-APPLE-CALENDAR-COLOR`; implements `sync-collection` and `PROPPATCH` [FACT, read `pkg/caldav/caldav.go`, `pkg/routes/caldav/`] | **Two-way task sync into a phone's native calendar/reminders app** — the best offline story in the segment |
| **Nextcloud Deck** | Nextcloud GmbH (**DE, Stuttgart**) | Nextcloud app; **Android client** | AGPL; free with Nextcloud | **Yes on Android** — the client README lists "**Works offline**" as a headline feature [FACT, read `stefan-niedermann/nextcloud-deck` README] | Yes — REST (`deck.readthedocs.io`) | Self-hosted kanban that genuinely works on a phone with no signal |
| **Plane** | Plane (IN) | Web, self-hosted or cloud | Open-source core + paid tiers; UNVERIFIED | **No** — no service worker found in the repo [FACT, code search returned 0 for `NetworkOnly`/`precacheAndRoute`] | Yes — REST | Self-hosted Jira/Linear replacement with cycles, modules and Gantt |
| **Leantime** | Leantime (US/DE) | Web, self-hosted or cloud | AGPLv3 core, **all listed features in OSS**; enterprise plugins under separate licence | No | **Yes — JSON-RPC.** Plus **iCal export, external calendar subscription and Google Calendar import** [FACT, read `app/Domain/Calendar/**`] | Gantt + milestones + timesheets in one AGPL package; explicitly designed for non-project-managers |
| **Planka** | Planka (open source) | Web, self-hosted | Open source + paid Pro/cloud; UNVERIFIED | No | Yes — REST (Swagger UI published) | Clean Trello replacement with real-time sync |
| **Kanboard** | Kanboard (FR) | Web, self-hosted | MIT, free | No | Yes — JSON-RPC | Minimal, extremely low-resource kanban that runs on anything |
| **WeKan** | WeKan (FI) | Web, Snap/Docker/Sandstorm | MIT, free | No | Yes — REST | Sovereignty-driven deployments; **234 translations**, assessed against the Standard for Public Code [FACT, README] |
| **Huly** | Hardcore Engineering | Web, self-hosted | Open source; **hosted service being shut down** [FACT — README carries a migration banner: "Hosted Huly is shutting down… service shutdown is expected on **July 20**" (no year given); self-hosted unaffected] | No | Yes — typed API client | All-in-one (tracker + HR + CRM + chat) — and a cautionary tale about hosted dependencies |
| **AppFlowy** | AppFlowy (CA) | Windows/macOS/Linux/iOS/Android | AGPLv3; paid cloud | **Yes — local-first by design**, Flutter + Rust core [FACT, README] | Yes | Notion-shaped workspace where the data is genuinely on the device |
| **Anytype** | Any Association | Windows/macOS/Linux + mobile | Source-available (ASAL 1.0) | **Yes — offline-first local storage, optional P2P sync, E2E encrypted** [FACT, README] | Yes — gRPC | The strongest offline/ownership model in the whole segment |
| **Focalboard** | Mattermost community | Desktop app + self-hosted server | Free | **Yes in Personal Desktop edition** (standalone single-user desktop app) [FACT, README] | Yes — REST (Swagger) | Was the best "local Trello"; **now unmaintained — README carries a "not maintained" warning** [FACT] |

AV-specific overlays. These are the products that already ship the artefacts AV production needs.
**Every commercial claim in this table is `[CORPUS, second-hand]`** — carried from
[`landscape/broadcast-production-management.md`](broadcast-production-management.md), which
obtained it via search summary and could not re-verify it today either.

| Product | Vendor | What it adds over generic PM | Price (second-hand, unverified) |
| --- | --- | --- | --- |
| **StudioBinder** | StudioBinder (US) | Breakdown → shooting schedule → **call sheet generated from the schedule**, with weather and nearest hospital auto-filled | from $42/mo Starter, $85/mo Indie, ~$29/seat/mo `[CORPUS]` |
| **Yamdu** | Yamdu (**DE, München**) | Full production office: cast/crew, schedule, docs, props, budget | Flex $45/mo; Core $265/mo for 20 users `[CORPUS]` |
| **SetKeeper** | SetKeeper (FR, Paris) | Studio-vetted secure document distribution, watermarking, eSignature onboarding, audit logs | **from $1,000 per project** `[CORPUS]` |
| **Croo** | Croo (croo.tv) | Production scheduling / crew | UNKNOWN. **Verified today: Croo is a listed collaborator on the Universal Schedule Standard** [FACT, USS README] |
| **farmerswife** | farmerswife (ES/DE) | Resource + project scheduling with cost tracking; the named ScheduALL alternative | Per-user subscription, figures **not public**; **REST API requires ≥ v6.4 and is a licensed paid feature** `[CORPUS]` |
| **Think Crew**, **Set Hero**, **Everyset**, **FilmUStage**, **Scriptation**, **Boom Interactive**, **Cinapse**, **Virtual Production Partners** | various | Scheduling, breakdown, on-set logistics | UNKNOWN — **discovered this pass** as the USS collaborator list [FACT, USS README] |

## Deep dives

### 1. Asana — the richest data model, and exactly where it stops

**What it does.** Mainstream per-seat work management: tasks in projects in teams, with list,
board, timeline and calendar views, custom fields, rules/automation, goals and portfolios.

**Data model (all FACT, read from `Asana/openapi` `defs/asana_oas.yaml`, 3.15 MB, OpenAPI 3.0.0,
Apache-2.0 licensed spec, fetched 2026-08-29).** 175 paths, 280 component schemas. The resources
that matter to AV, and their precise shape:

- **`task`** — has *both* date and datetime fields: `due_on` / `start_on` (`YYYY-MM-DD`) **and**
  `due_at` / `start_at` (ISO 8601 UTC datetime). Also `dependencies` (opt-in), subtasks,
  `custom_fields`, `actual_time_minutes`, `memberships`, `liked`.
- **`assignee`** — a **single** `UserCompact`, nullable. One assignee per task.
- **`allocation`** — `start_date`, `end_date`, and `effort: { type: "hours" | "percent", value }`.
  **Day granularity only. No time of day.**
- **`ooo_entry`** — `start_date`, `end_date`. Nothing else: no reason, no partial day, no
  half-day.
- **`budget`** family — `BudgetEstimate`, `BudgetActual`, `BudgetTotal` as distinct resources.
- **`external`** — a per-task `{ gid, data }` slot for app-specific metadata, and critically the
  documented ability to address the task as `external:custom_gid` **anywhere in the API where the
  native gid would be used**.
- Plus `goal`, `goal_relationship`, `portfolio`, `custom_type`, `audit_log_event`, `batch`.

**Integrations.** OAuth 2.0, webhooks, events stream, batch endpoint, official Node SDK
(`Asana/node-asana`) generated from the spec.

**Notable strengths.**
1. **The `external` field is the single best integration primitive found in this entire pass.**
   A first-class foreign-key slot on every record, usable as an address, means a Cable Planner
   device ID can be *the* handle for an Asana task without a mapping table. Almost nobody else in
   the segment offers this.
2. Publishing the complete OpenAPI spec under Apache-2.0 makes the product auditable by an
   engineer before purchase. Compare Wrike, whose GitHub org contains no API artefact at all, and
   ClickUp, which ships no official SDK.
3. `allocation` and `ooo_entry` mean Asana ships *some* notion of who is available when — more
   than most of the segment.

**Notable limits, and this is the heart of the segment's AV misfit.**
1. **One assignee per task.** "Rig the LED wall" is done by four people. Modelling it needs four
   duplicate tasks, or a task whose assignee is a fiction and whose real crew list is in the
   description. [FACT for the cardinality; INFERENCE for the consequence.]
2. **`allocation` has no time of day.** A crew allocation in AV is `Tuesday, call 06:30, wrap
   19:00, travel 90 min each way, and the same person is on a different job that evening`. Asana
   can express "Tuesday, 50%". The information the production manager actually needs — the call
   time — is not representable in the resource designed to hold it. This is not a UI complaint;
   it is a schema fact.
3. **`ooo_entry` has start and end dates and nothing else.** Freelance availability is not a
   boolean over whole days; it is "pencilled", "confirmed", "first refusal", "available from
   14:00". None of that fits.
4. [INFERENCE] The `goal` / `goal_relationship` / `portfolio` / `custom_type` cluster is a large
   fraction of the schema surface and has **no AV analogue whatsoever**. It is quarterly corporate
   reporting machinery. A production pays for it in seat price and in menu clutter.

### 2. Basecamp — the calmest model, and the only one with a client-approval object

**What it does.** Deliberately restricted coordination: each project ("bucket") carries a fixed
dock of tools rather than infinite configuration.

**Data model (FACT, read from `basecamp/bc3-api` and `basecamp/basecamp-sdk`, 2026-08-29).**
Documented API coverage by category:

| Category | Resources |
| --- | --- |
| Projects | Projects, Templates, Tools, People |
| To-dos | Todos, Todolists, Todosets, TodolistGroups |
| Messages | Messages, MessageBoards, MessageTypes, Comments |
| Chat | Campfires (lines, chatbots) |
| **Scheduling** | **Schedules, Timeline, Lineup, Checkins** |
| Files | Vaults, Documents, Uploads, Attachments |
| **Card Tables** | CardTables, Cards, CardColumns, **CardSteps**, Wormholes |
| **Client Portal** | **ClientApprovals, ClientCorrespondences, ClientReplies** |
| Automation | Webhooks, Subscriptions, Events |
| Reporting | Search, Reports, Timesheets, Recordings |

Mechanics: base URL `https://3.basecampapi.com/{account_id}/`, OAuth 2.0 mandatory, a required
`User-Agent` header identifying the app (missing it returns `400`), JSON only with snake_case and
no root element, **geared pagination** (15/30/50/100 results by page) with RFC 5988 `Link`
headers and an `X-Total-Count` header, and mandatory HTTP freshness headers. "Flat routes"
(`GET /todos/67890.json`) are now canonical, with legacy `/buckets/{project}/…` retained "in
perpetuity". Six official SDKs — Go, Ruby, TypeScript, Swift, Kotlin, Python — with ETag caching,
automatic retry with backoff, webhook verification, and **OAuth device flow (RFC 8628)** for
headless clients.

One precise detail worth stealing: the `schedule` resource has a required
`include_due_assignments` boolean, documented as "whether the schedule should include due dates
from to-dos, cards and steps." **The calendar is a projection over every dated object in the
project, toggleable.** [FACT, read `sections/schedules.md`.]

**Notable strengths.**
1. **`ClientApprovals` is a first-class resource.** The corpus's production-manager dossier
   identifies client approval arriving over WhatsApp and vanishing as one of the expensive,
   recurring failures of AV production. Basecamp is the only product in this pass that models
   "the client said yes" as an object with an ID, an author and a timestamp.
2. **`CardSteps`** — checklist items *inside* a card, addressable via the API and rolled into the
   calendar. That is the correct shape for a prep or load-out checklist.
3. **`Checkins`** — recurring automatic questions ("what are you working on?"). The AV analogue
   is obvious and unbuilt: an automatic 07:00 "are you on the truck?".
4. The API documentation is written for humans, ships copy-as-cURL for every endpoint, and is
   itself in a public Git repository. It is the best API documentation encountered in this pass.

**Notable limits.**
1. No gear, no availability, no rates, no gantt-with-dependencies. Basecamp is deliberately not a
   scheduling engine; `Timeline` and `Lineup` are overviews, not planners.
2. Its virtue — refusing configuration — means a production cannot add the fields it needs. There
   is no custom-field system to bolt gear onto.
3. Offline: UNKNOWN. The SDK feature matrix shows ETag HTTP caching as an *opt-in client* concern,
   which tells us about integrations, not about the mobile app.

### 3. Vikunja — the best offline/mobile answer in the segment, and a precise lesson in what "PWA" does not mean

**What it does.** AGPL-3.0-or-later self-hosted task manager, Go backend + Vue frontend, v2.5.0 at
time of reading, with an Electron desktop wrapper (`desktop/`, GPL-3.0) and a hosted cloud
offering. A "Vikunja Pro" tier paywalls admin panel, audit logs and time tracking. [FACT, README.]

**The CalDAV implementation is the interesting part.** [FACT, read `pkg/caldav/caldav.go` and
`pkg/routes/caldav/`.] Vikunja is a real CalDAV *server*, not an ICS exporter:

- Emits `VTODO` objects inside `VCALENDAR`, with `DUE`, `RRULE` (including
  `FREQ=MONTHLY;BYMONTHDAY=` for monthly repeats and `FREQ=…;INTERVAL=…` for the general case),
  `VALARM` blocks derived from task alarms, and `RELATED-TO` derived from task relations.
- Emits vendor colour properties `X-APPLE-CALENDAR-COLOR`, `X-OUTLOOK-COLOR`, `X-FUNAMBOL-COLOR`
  and `X-PUBLISHED-TTL:PT4H`.
- Implements `sync-collection` (RFC 6578 incremental sync) and `PROPPATCH`, with per-user CalDAV
  tokens managed through a dedicated settings screen and API endpoints
  (`pkg/routes/api/v2/caldav_tokens.go`, `frontend/src/views/user/settings/Caldav.vue`).

**Why that matters more than any feature list.** A CalDAV collection subscribed by iOS Reminders
or an Android CalDAV client is **cached on the device and readable and editable with no signal**,
by the phone's own native app, with no seat licence for the person holding the phone. That is the
only mechanism found in this entire pass that puts a production's dated work into a crew member's
pocket in a way that survives a loading bay.

**And the counter-lesson, which is the most useful single fact in this dossier.** Vikunja ships a
service worker (`frontend/src/sw.ts`) that precaches the app shell with
`StaleWhileRevalidate` for `css|json|js|svg|woff2|png|html|txt|wav` — and then explicitly
registers:

```js
// Always send api requests through the network and bypass the browser's HTTP cache
workbox.routing.registerRoute(
  apiRoutePattern,                       // /api/v1/*
  new workbox.strategies.NetworkOnly({ fetchOptions: { cache: 'no-store' } }),
)
```

[FACT, verbatim from the repository, 2026-08-29.]

So: the *application* installs, launches and paints with no network, and contains **no data
whatsoever**. This is not a criticism of Vikunja specifically — it is the honest default of nearly
every "installable PWA" in this segment, and it is exactly what an AV user experiences as "the app
opened and then just spun". [INFERENCE] When a vendor's marketing says "works offline" and means
"is a PWA", assume this pattern until proven otherwise. The proof is one file.

**Notable limits.** Data offline requires the CalDAV path, not the web app. Time tracking and
audit logs are behind Pro. Server-side, everything is self-hosted, so the offline story is really
"your server plus the crew's phone calendars".

### 4. OpenProject — Gantt, sovereignty, and the revocable calendar feed

**What it does.** AGPL Community Edition plus paid Enterprise add-ons, self-hosted or cloud,
positioned explicitly as the open alternative to "Jira, MS Project, Monday, Asana, YouTrack while
maintaining full control over your data and infrastructure" [FACT, README]. German vendor
(OpenProject GmbH). Lineage is visible in the source headers: **OpenProject is a fork of
ChiliProject, which is a fork of Redmine** [FACT, copyright header in
`app/models/token/ical.rb`] — which is why its work-package/query model feels like Redmine's.

**Capabilities relevant here.** Gantt/timeline with scheduling and dependencies, agile boards,
work packages with a `Relation` model, time and cost tracking with budgets, meeting agendas and
minutes, BCF and IFC support (construction-industry BIM interchange — evidence that the product
already absorbed one vertical's file formats), Nextcloud/GitHub/GitLab integrations, REST API
(HAL+JSON).

**The mechanism worth stealing — per-query iCal subscription with revocable tokens.** [FACT, read
`app/models/token/ical.rb`, `app/contracts/queries/ical_sharing_contract.rb`,
`app/controllers/admin/settings/icalendar_settings_controller.rb`.]

- `Token::ICal < HashedToken`, token prefix `opical`.
- **One token is bound to exactly one query (calendar)** via a required
  `ICalTokenQueryAssignment` — "restrict the usage of one ical token to one query (calendar)".
- Each generated URL mints a **new** token, and the source comments explicitly "Prevent deleting
  previous tokens… the existing ical tokens (and thus urls) should still be valid".
- The tokens are surfaced and revocable in the user's own access-token settings screen, and there
  is an admin settings page gating the feature instance-wide.

[INFERENCE] This is the correct design for AV crew distribution and I have not seen it better
solved anywhere: a saved filter becomes a subscribable URL; the recipient needs no account and no
seat; the URL is per-recipient-per-view so it can be revoked when a freelancer leaves; the feed
lands in the phone's native calendar and therefore works with no signal. The AV translation is
direct: *"my calls on this show"* as a revocable ICS URL per crew member.

**Notable limits.** Heavy to self-host and administer relative to Kanboard or Planka. The web app
has no offline mode. Enterprise add-ons gate a meaningful set of features. Gantt is built for
week-scale project plans, not hour-scale build schedules.

### 5. Airtable and Smartsheet — the two honest answers to "we already do this in Excel"

Grouped because they occupy the same structural position: they are the products AV coordinators
actually reach for when the ERP models money and not work, and they are the direct competitors to
the spreadsheet rather than to Jira.

**Airtable** [FACT, `Airtable/airtable.js` README]: "the Airtable API is your own RESTful API for
your base… you will use your table names to address tables, column names to access data stored in
those columns". Personal access tokens created at `airtable.com/create/tokens`, or OAuth.
Official JS client, browser build available with an explicit warning about exposing keys client-
side. The pitch is precisely that a non-programmer's table becomes an addressable API.

**Smartsheet** [FACT, `smartsheet/smartsheet-javascript-sdk` README]: official Node SDK, token
from Account → Personal Settings → API Access, resource model is `sheets` with rows/columns,
`include` query parameters for attachments and `includeAll` for pagination.

**Why they matter to AV specifically.** [INFERENCE, but grounded in
[`roles/production-manager.md`](../roles/production-manager.md)] The corpus reaches a sharp
conclusion about Excel that applies directly here:

> "The common property of every one of these: **it is a calculation or a comparison, not a
> record.** Rental ERPs are built to store records. Spreadsheets are where anything gets
> *compared* — estimate against actual, requirement against stock, this supplier against that
> one. Until a tool can do comparison, Excel is not going anywhere and should not be fought."

Airtable and Smartsheet are the only mainstream PM products that accept this framing instead of
fighting it. They let the user keep the grid, keep formulas, keep bulk edit — and add relations,
views, an API and permissions. That is why they colonise AV coordination while Jira does not.

**Notable limits.** Both are fully network-dependent [INFERENCE — no offline mechanism found, and
`airtable.com`/`smartsheet.com` were unreachable to confirm]. Both price per seat, which collides
with day crew. And both stop exactly where AV starts: a base can have a `Camera` table, but there
is no availability engine, no conflict detection across bookings, and no call sheet.

### 6. The AV overlays, and the standard they quietly agreed on

The AV-specific layer is where the production artefacts live. The commercial detail is
`[CORPUS, second-hand]` and is tabulated above; what was **verified today** is more interesting
and is covered in full in the next section: a group of these vendors — **Croo, Think Crew, Set
Hero, Everyset, FilmUStage, Scriptation, Boom Interactive, Cinapse, Virtual Production
Partners** — have published and jointly adopted an open JSON interchange format for production
schedules and breakdowns.

The pattern the corpus already identified as the thing to steal from this layer is
StudioBinder's: **the call sheet is generated from the schedule rather than typed**. From
[`landscape/broadcast-production-management.md`](broadcast-production-management.md):

> "**Nobody has done the StudioBinder-call-sheet trick for the** [technical rider]" — derive the
> artefact from the plan instead of retyping it.

## Standards & protocols

This section is where the segment is genuinely poor, with two exceptions that were verified today.

### Verified: Universal Schedule Standard (USS) — the interchange format for production schedules

[FACT, read `UniversalScheduleStandard/UniversalScheduleStandard` README, `docs`, and
`samples/small_sample_schedule.uss`, 2026-08-29. Repo created 2019-12-04, last updated
2026-08-25, 19 stars.]

- **What it is.** "A standardized format to store and transport production schedules and
  breakdowns across the entertainment industry." JSON, file extension `.uss`, licensed
  **CC BY-ND 4.0**, "open standard — no licensing fees — free to use", explicitly designed to work
  "interchangeably as a file and as data in an API call". A validator exists
  (`UniversalScheduleStandard/uss-validator`).
- **The problem statement is verbatim the AV problem.** "An increasing number of software tools
  have been created that either create or consume this schedule data. Unfortunately, the creators
  of these tools and their users found that there was no easy way to transport this data from one
  application to another… This inevitably resulted in a fractured landscape of multiple file
  formats."
- **Root object.** `universalScheduleStandard` with `id`, `author`, `company`, `created`,
  `description`, `episode`, `episodeName`, `name`, `project`, `schedColor`, `schedDate`,
  `scriptColor`, `scriptDate`, `season`, `source`, `ussVersion` (`1.0.0`), and five arrays:
  **`breakdowns`, `categories`, `elements`, `stripboards`, `calendars`**.
- **`breakdowns`** — the strips. Each has `type` (`"scene"` or `"banner"`), `scene`, `scriptPage`,
  `pages` (fractional, e.g. `0.25` for a quarter page), **`duration` in milliseconds**,
  `description`, `comments`, and an `elements` array of element IDs.
- **`categories`** — each carries a `ucid` (see below) plus a user-chosen `name`.
- **`elements`** — the resources. Fields include `category`, `name`, and critically
  **`daysOff`, `isDrop` + `dropDayCount`, `isHold`, `isDood`** (Day Out Of Days), `linkedElements`,
  `events`, `elementId`, `isIdLock`. **Availability is a property of the element.**
- **`stripboards`** — named passes ("Script Order", "First Pass"), each containing boards named
  **`stripboard`** and **`boneyard`**, plus a `calendar` reference. Nested arrays inside
  `breakdownIds` express day groupings.
- **`calendars`** — `events` (typed `start` / `event`, e.g. a `travel` day), and
  **`daysOff: [0, 6]`** (weekend as day-of-week indices).

### Verified: Universal Category Identification (UCID) — a numeric taxonomy of production resources

[FACT, read `UniversalScheduleStandard/UniversalCategoryIdentification` README, CC BY-NC-ND 4.0.]

The premise: "different individuals might refer to 'Cast Members' as 'Cast', 'Actors' or
'Talent'… the Universal Category Identification Standard assigns immutable identification numbers
to each category type." Renaming is allowed; **repurposing is not** — "Maintaining the intent of
the category allows for universal transfer".

Scene categories `0–6`: Set, INT/EXT, Day/Night, Script Day, Unit, Sequence, Location.

Action categories `100+`, including the ones that are literally AV departments:

| UCID | Category | | UCID | Category |
| --- | --- | --- | --- | --- |
| 100 | Cast Members | | 110 | **Camera** |
| 101 | Background Actors | | 111 | **Grip** |
| 102 | Stunts | | 112 | **Electric** |
| 103 | Vehicles | | 113 | **Sound** |
| 104 | Props | | 114 | Music |
| 105 | Special Effects | | 115 | Art Department |
| 106 | Wardrobe | | 119 | **Special Equipment** |
| 107 | Makeup/Hair | | 121 | Visual Effects |
| 108 | Animals | | 122 | Mechanical Effects |
| 109 | Animal Wranglers | | 123–126 | Notes, Comments, Miscellaneous, Other |

Extension rules are explicit: custom scene categories `50–99`, custom action categories from
`500`; `0–49` and `100–499` reserved.

[INFERENCE] **UCID 110/111/112/113/119 is a ready-made, already-agreed department taxonomy that a
cable/lighting/camera planner could map onto without inventing one.** It is the closest thing the
production world has to GDTF's role in lighting, and it is free to adopt.

**Honest assessment of its reach.** 19 stars, 8 stars for UCID, 5 for the validator; adoption
outside the listed collaborator group is UNKNOWN and was not verifiable this pass. CC BY-**ND**
means no derivative versions may be published — a real constraint on forking it. Treat USS as a
credible interchange target to *support*, not as a settled industry standard to *assume*.

### Verified: calendar interchange is the one thing that actually crosses tool boundaries

| Mechanism | Where verified | Note |
| --- | --- | --- |
| **CalDAV** (RFC 4791) + `sync-collection` (RFC 6578) + `PROPPATCH` | Vikunja `pkg/routes/caldav/` [FACT] | Two-way; the only verified path to editable offline tasks on a phone |
| **iCalendar `VTODO`** with `DUE`, `RRULE`, `VALARM`, `RELATED-TO` | Vikunja `pkg/caldav/caldav.go` [FACT] | Task semantics survive the round trip |
| **iCal subscription URL, per-query, revocable token** | OpenProject `Token::ICal` [FACT] | Read-only; no account needed at the receiving end |
| **iCal export + external calendar subscription + Google Calendar import** | Leantime `app/Domain/Calendar/**` [FACT] | Both directions |
| **Vendor colour X-properties** (`X-APPLE-CALENDAR-COLOR`, `X-OUTLOOK-COLOR`) | Vikunja [FACT] | The pragmatic reality of ICS interop |

### The rest, and what is missing

- **REST + JSON with OAuth 2.0** is the segment default. GraphQL for monday.com and Linear.
  OpenAPI 3.0.0 published by Asana; Swagger published by Focalboard and Planka; JSON-RPC for
  Kanboard and Leantime; HAL+JSON for OpenProject; gRPC for Anytype.
- **Webhooks** are near-universal; Basecamp additionally ships signature verification in five of
  six SDKs [FACT].
- **CSV / XLSX import-export** is the actual interchange format in daily use, and the corpus
  documents its failure modes precisely: nine separate ontime issues about spreadsheet round-trip
  (`#786`, `#927`, `#1054`, `#1327`, `#1890` and others), and `shelf.nu#2777` describing an export
  hand-fixed in Excel and re-imported with units stripped and the ID column reinstated.
- **Gantt interchange (MS Project `.mpp` / MSPDI XML, Primavera XER/PMXML)** — I could not verify
  support for any of these in any product this pass. Attempts to read the MPXJ library's
  documentation failed (`joniles/mpxj` README returned 404 on both default branches tried).
  **UNKNOWN.** This matters: it is the classic way a schedule crosses from a planning tool into a
  client's world, and its status here is unestablished.
- **What does not exist, and this is the finding.** There is **no interchange format for a call
  sheet**, none for a crew availability declaration, none for a technical rider, and none for
  "this task consumes these three pieces of gear". USS carries elements and their availability but
  stops at the breakdown; iCalendar carries times but has no notion of equipment; the PM APIs
  carry tasks but have no notion of either.

## What this segment does WELL — the patterns worth stealing

1. **The revocable, per-view calendar subscription URL.** [FACT: OpenProject `Token::ICal`.] A
   saved filter becomes a URL; the recipient needs no seat and no account; it lands in the native
   calendar and therefore works offline; and it can be revoked per recipient. For AV crew
   distribution this is close to a complete answer, and it costs one endpoint.
2. **CalDAV as the offline mobile strategy instead of building a mobile app.** [FACT: Vikunja.]
   Emitting `VTODO` with `DUE`, `VALARM` and `RELATED-TO` gets you an offline, editable,
   push-notifying, natively-integrated mobile client on both platforms that you did not write and
   do not maintain.
3. **A foreign-key slot on every record, addressable as an ID.** [FACT: Asana `external`
   `{gid, data}` plus `external:custom_gid` addressing.] This is how a suite links a task to a
   device without a mapping table.
4. **Modelling client approval as an object.** [FACT: Basecamp `ClientApprovals`,
   `ClientCorrespondences`, `ClientReplies`.] The corpus names approval-by-WhatsApp as an
   expensive recurring failure. Somebody has already built the object that fixes it.
5. **The calendar as a toggleable projection over every dated object.** [FACT: Basecamp
   `include_due_assignments` — "whether the schedule should include due dates from to-dos, cards
   and steps".] One calendar, fed by everything with a date, with an explicit switch.
6. **Checklists as addressable children of a work item.** [FACT: Basecamp `CardSteps`; Basecamp
   to-do completion as its own endpoint — `POST`/`DELETE /todos/{id}/completion.json`.] Making
   completion a *resource* rather than a field is what lets a phone tick a box idempotently and
   what makes an offline queue tractable.
7. **The boneyard.** [FACT: USS `stripboards[].boards[].name == "boneyard"`.] A first-class
   parking area for work that exists but is not yet scheduled. Every AV planner needs this and
   most invent an ad-hoc "unassigned" bucket instead.
8. **Availability as a property of the resource, not of the calendar.** [FACT: USS elements carry
   `daysOff`, `isHold`, `isDrop`/`dropDayCount`, `isDood`.] Gear and people carry their own
   availability, and the schedule resolves against it.
9. **Publishing the machine-readable contract.** [FACT: Asana's Apache-2.0 OpenAPI spec; Basecamp's
   entire API reference as a Git repository with copy-as-cURL for every endpoint.] It converts a
   purchasing decision into an engineering one, and it is cheap.
10. **Generated-artefact-as-product.** [`[CORPUS]`: StudioBinder's call sheet built from the
    schedule with weather and nearest hospital auto-filled.] The document is the deliverable;
    typing it twice is the defect.
11. **Honest self-documented limits.** [FACT: Nextcloud Deck's README states "Deck is not yet
    ready for intensive usage" and computes the failure — 13 boards × ~100 cards × ~5 attachments
    ≈ 6,500 database queries.] Rare, and worth imitating.

## What NOBODY in this segment solves well — the white space

1. **Data offline. Not the app — the data.** The verified pattern is app-shell-only: Vikunja's
   service worker precaches assets and then forces **`NetworkOnly`, `cache:'no-store'`** on every
   API route [FACT]; Plane has no service worker at all [FACT, zero code-search hits]. The
   genuinely offline products in the pass are the ones that gave up on the web: Focalboard
   Personal Desktop (**now unmaintained** [FACT]), AppFlowy, Anytype, and the third-party
   Nextcloud Deck Android client whose README lists "Works offline" [FACT]. **No mainstream
   per-seat SaaS PM tool in this pass has verifiable offline data.** In a venue basement, a
   loading dock, or an OB truck, that is the entire ballgame.
2. **The shift.** Every product models a *task with a date*. AV runs on a *shift with a call time,
   a wrap time, travel, breaks, and a rate*. Asana's dedicated resource for this — `allocation` —
   is `start_date`, `end_date`, `effort {hours|percent}` [FACT]. There is no time of day in it.
   Nothing in the segment models the artefact the industry actually runs on.
3. **The crew, as opposed to the person.** Asana's `assignee` is a single nullable user [FACT].
   Multi-assignee is the norm in AV — a task is done by a department.
4. **Availability with states.** Asana's `ooo_entry` is two dates [FACT]. Freelance reality is
   pencilled / first refusal / confirmed / released, with partial days. USS gets closer with
   `isHold`, `isDrop`, `daysOff` [FACT] but stays inside the breakdown world.
5. **Tasks tied to gear.** Nothing in this segment has an equipment object. A task cannot reserve
   a camera, cannot fail because the camera is on another job, and cannot tell the warehouse what
   to pull. This is the sharpest boundary between generic PM and what AV needs, and no generic
   vendor will cross it because gear is not their market.
6. **The call sheet.** [FACT] 110 repositories match `callsheet` on GitHub; the highest-starred has
   7 stars and is a localisation-string repo. The most operationally important document in
   production has no open tooling and no interchange format. Only the closed AV overlays generate
   it.
7. **Pricing shaped like a production.** Per seat per month assumes stable headcount. A show has
   four staff and twenty freelancers for nine days. [INFERENCE] Either the freelancers get no
   access — which is why the information reaches them by WhatsApp — or the production pays twenty
   monthly seats for nine days of work. Smartsheet's licensed-vs-free-collaborator split and
   Basecamp's historical flat fee are the two shapes in the segment that even gesture at this, and
   neither could be verified this pass.
8. **Comparison.** Per the corpus: spreadsheets survive because they *compare*, and PM tools
   *store*. Estimate against actual, requirement against stock, this supplier against that one.
   Asana ships `BudgetEstimate` and `BudgetActual` as separate resources [FACT] — and the corpus
   records a production manager copying exactly that comparison out of an ERP into Excel by hand
   ([erpnext#34127](https://github.com/frappe/erpnext/issues/34127)). Even where the data exists,
   the comparison view does not.
9. **Chasing.** [FACT, `[CORPUS]`] A user built Excel + Power Automate reminders privately because
   the system of record does not chase ([shelf.nu#1956](https://github.com/Shelf-nu/shelf.nu/issues/1956)).
   Basecamp's `Checkins` is the nearest thing in the segment and is not aimed at this.
10. **Bidirectional spreadsheet round-trip.** [FACT, `[CORPUS]`] Nine ontime issues and
    shelf.nu#2777 document the same failure: export, hand-fix in Excel, re-import, lose the custom
    fields. Everyone exports; nobody makes the return trip safe. Whoever does gets Excel as an ally
    instead of a competitor.
11. **Hosted continuity.** [FACT] Huly's README currently carries a migration banner: the hosted
    service is being discontinued "because its hosting is no longer being funded", with shutdown
    "expected on **July 20**" (the banner gives no year) and users told to export and migrate. Focalboard is unmaintained. In a
    segment sold as infrastructure, the exit plan is a product feature, and almost nobody sells it.

### The specific question: why AV teams still fall back to WhatsApp and Excel

Assembling the verified pieces, the answer is not "AV people are behind". It is that the tools
fail on four axes at once, and the fallbacks succeed on exactly those axes.

| Requirement | Generic PM | WhatsApp / Excel |
| --- | --- | --- |
| **Works with no signal, one-handed, in a loading bay** | App-shell-only at best [FACT: Vikunja `NetworkOnly`; Plane no SW] | WhatsApp queues and sends when signal returns; a printed sheet always works |
| **Reaches twenty freelancers for nine days** | A seat each [INFERENCE from per-seat model] | Free, already installed, already how they talk to each other |
| **Expresses a shift, a crew and a rate** | `allocation` = two dates + a percentage; `assignee` = one user [FACT] | A spreadsheet row expresses anything |
| **Compares two things** | Stores records; `BudgetEstimate`/`BudgetActual` sit in separate resources [FACT] | Comparison is the native operation `[CORPUS]` |

The corpus's conclusion is blunter than mine and I think correct — the messaging channel is not
winnable: *"no tool will win this channel. The realistic goal is not interception but capture of
the outcome — a ten-second way to turn 'yes do it, invoice us' into a dated record attached to the
job."* [`roles/production-manager.md`]

[INFERENCE] The corresponding rule for the spreadsheet is symmetrical and, I would argue, the most
actionable single conclusion of this dossier: **do not try to replace Excel; make the round trip
lossless.** Export with stable IDs, re-import without destroying custom fields, and the
spreadsheet stops being the shadow system of record and becomes a view.

## Pricing — what could and could not be established

**Nothing was verified.** Every pricing page was refused by the egress proxy on 2026-08-29. The
brief requires a date and a source URL for every price; I have neither, so I publish no price as
fact.

Figures carried from the sibling dossier
[`landscape/broadcast-production-management.md`](broadcast-production-management.md), which
obtained them via search summary on 2026-08-28 and which **must be re-checked before any
commercial use**: Yamdu Flex $45/mo and Core $265/mo for 20 users; StudioBinder from $42/mo
Starter, $85/mo Indie, ~$29/seat/mo; SetKeeper from $1,000 per project; farmerswife per-user with
figures not public and a **licensed, paid REST API requiring server ≥ v6.4**.

The check-list for the next pass with working egress — fetch each, record the tier names, the
per-seat figure, the annual-vs-monthly split, any **seat minimum**, and whether the tier is "as
advertised" or "requires sales contact":

`monday.com/pricing` · `asana.com/pricing` · `clickup.com/pricing` · `notion.com/pricing` ·
`atlassian.com/software/jira/pricing` · `trello.com/pricing` · `smartsheet.com/pricing` ·
`basecamp.com/pricing` · `wrike.com/price` · `linear.app/pricing` · `airtable.com/pricing` ·
`teamwork.com/pricing` · `height.app/pricing` · `openproject.org/pricing` · `vikunja.io/pro` ·
`plane.so/pricing` · `planka.app/pricing` · `studiobinder.com/pricing` · `yamdu.com/pricing` ·
`setkeeper.com/pricing` · `croo.tv` · `farmerswife.com/pricing`

Two questions matter more than the headline number and should be answered explicitly:

1. **Is there a free or low-cost "collaborator/viewer/guest" seat?** This decides whether day crew
   can be reached inside the tool at all. Smartsheet historically distinguishes licensed users from
   free collaborators — **UNVERIFIED**, and the single most important pricing question for AV.
2. **Is there a seat minimum?** monday.com is widely believed to enforce one — **UNVERIFIED**. A
   three-seat minimum on a two-person technical department changes the effective price entirely.

## Relevance to AV Planner Suite

Ranked by how much this segment should change what gets built.

### 1. `shell` / suite — high, and this is where the segment lands

The suite shell is the only place in the eight repositories where a *job* exists as a thing with
dates, people and multiple technical domains attached. Everything valuable in this dossier is a
shell concern.

Concretely, in descending order of value-per-effort:

- **Emit an iCal subscription feed per saved view, with per-recipient revocable tokens.** Copy
  OpenProject's `Token::ICal` design directly: one token bound to one query, new URL mints a new
  token, old tokens stay valid, revocable from a settings screen. This is the cheapest possible
  route to "the crew has the call times on their phone, offline, without a seat".
- **Adopt an `external { id, source }` slot on every exported record**, addressable the way Asana
  addresses `external:custom_gid`. The `INVENTORY.md` finding that the suite already carries a
  `.avplan` envelope with `domains: { cameras, lighting, cabling }` makes this natural: the
  envelope is the place to put the foreign key that a monday/Asana/Notion board can hold.
- **Make the CSV/XLSX round trip lossless and test it.** The corpus's Excel evidence is the
  strongest user-need signal in the whole research set, and the failure mode is documented in
  detail (custom fields lost, ID column stripped). A round-trip test in CI is a day of work and
  neutralises the largest competitor in the segment.
- **Model a shift, not a task.** Call time, wrap time, travel, and a crew (plural) rather than an
  assignee. This is the schema-level thing that no generic vendor will build, verified against
  Asana's actual `allocation` and `assignee` definitions.
- **Add a boneyard.** USS's name for it is good and the concept is proven: work items that exist
  but are not yet placed on a day.

### 2. `cable-planner` — high, as the source of the generated artefact

The corpus's standing recommendation is to do "the StudioBinder call-sheet trick for the technical
rider" — generate the document from the plan instead of retyping it. Cable Planner already holds
the device graph, the inventory and the rack layout; the missing move is treating the **pull
list / rider / patch list as a generated projection** with the same status the call sheet has in
film. Basecamp's `include_due_assignments` is the design cue: one output fed by everything, with
an explicit switch.

Second, **UCID is worth mapping to.** Categories 110 Camera, 111 Grip, 112 Electric, 113 Sound,
119 Special Equipment are an already-agreed department taxonomy, free to adopt, with published
extension rules (custom action categories from `500`). Tagging inventory categories with a UCID
costs almost nothing and buys a defensible answer to "how does your data leave your tool".

### 3. `multicam-planner` and `light-planner` — medium, via the same two mechanisms

Both produce dated, crewed work (rig, focus, derig) against gear they already model. They benefit
from the shell's shift model and calendar feed rather than needing their own. `light-planner`
already speaks MVR/GDTF, which is the proof that this suite can absorb a vertical interchange
format — USS is the analogous target on the production-scheduling side, with the caveat that its
adoption outside its collaborator list is UNKNOWN and its CC BY-ND licence forbids publishing
derivatives.

### 4. `broadcast-intercom` — low-to-medium, one specific idea

Basecamp's `Checkins` (recurring automatic questions) and the corpus's "capture the outcome"
principle meet here. An intercom system knows who is on the wire; a ten-second, dated
acknowledgement — *"confirmed, on the truck"* — attached to a job record is the realistic version
of intercepting WhatsApp. Not a project-management feature; a project-management *outcome* captured
by a tool people already have open.

### 5. `tally-pi`, `sony-camera-bridge`, `pi-media-station` — low

Live-device layer. The only contact point is that a job record should know which appliances are
deployed where, which is an inventory concern already served by `cable-planner`. Nothing in this
segment should change their design.

### The one thing not to copy

[INFERENCE] Do not build the goals/OKR/portfolio/retrospective/canvas layer. Asana devotes a large
share of its 280 schemas to `Goal`, `GoalRelationship`, `GoalMetric` and `Portfolio`; Leantime
ships SWOT analysis, Lean Canvas, Business Model Canvas and retrospectives and advertises them as
headline features. In an AV production these have no referent. They are the clearest example in
the segment of features that exist because the buyer is a corporate department rather than a crew
— which is precisely the substitution this suite is positioned against.

## Open questions for the next pass

1. **Every price.** See the check-list above. Nothing in this dossier's pricing is usable until
   re-run with working egress.
2. **Offline behaviour of the mainstream mobile apps** — specifically monday.com, Asana, Notion
   and Trello on iOS/Android. Test method that does not require vendor marketing: install, load a
   board, enable airplane mode, attempt a read and a write, then re-enable and check for conflict
   handling. This is the single highest-value unverified claim in the segment.
3. **Free/guest/viewer seat tiers and seat minimums** — the two pricing facts that decide whether
   any of these tools can reach day crew at all.
4. **Gantt interchange.** Does anything in this segment read or write MS Project MSPDI XML or
   Primavera XER? Start with the MPXJ library (`joniles/mpxj` — my README fetch 404'd on both
   branches tried; find the correct path) and with OpenProject's import documentation.
5. **USS adoption outside its collaborator list.** Does StudioBinder or Yamdu import `.uss`? Check
   each vendor's import/export documentation. If the answer is no, USS is a nine-vendor agreement
   rather than a standard, and should be supported opportunistically rather than designed around.
6. **Nextcloud Deck's CalDAV story.** A code search for CalDAV/Sabre/VTODO in `nextcloud/deck`
   returned zero hits, but GitHub's code index has gaps, so this is UNKNOWN rather than a negative
   finding. It matters because Deck plus its offline Android client plus CalDAV would be a
   near-complete self-hosted answer for German crews.
7. **The German mid-market**, none of which was reachable: awork (Hamburg — an API exists, evidenced
   only by a 1-star community PHP client), factro (Bonn), Zenkit (Karlsruhe), MeisterTask (Munich),
   Stackfield (Munich), Projektron BCS (Berlin), Blue Ant / proventis (Berlin). All are plausible
   incumbents at a German broadcaster or facility and none could be assessed.

## Sources

Every URL below was actually opened during this pass, on **2026-08-29**, unless marked otherwise.

**Standards — Universal Schedule Standard**
- https://raw.githubusercontent.com/UniversalScheduleStandard/UniversalScheduleStandard/main/README.md
- https://raw.githubusercontent.com/UniversalScheduleStandard/UniversalScheduleStandard/main/samples/small_sample_schedule.uss
- https://raw.githubusercontent.com/UniversalScheduleStandard/UniversalCategoryIdentification/main/README.md
- https://github.com/UniversalScheduleStandard/uss-validator (metadata via GitHub repo search)

**Asana**
- https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml (3.15 MB OpenAPI 3.0.0 spec; `AllocationBase`, `OooEntryBase`, `TaskBase`, `TaskResponse`, `external` read directly)
- https://raw.githubusercontent.com/Asana/openapi/master/README.md
- https://raw.githubusercontent.com/Asana/node-asana/master/README.md

**Basecamp**
- https://raw.githubusercontent.com/basecamp/bc3-api/master/README.md
- https://raw.githubusercontent.com/basecamp/bc3-api/master/sections/todos.md
- https://raw.githubusercontent.com/basecamp/bc3-api/master/sections/schedules.md
- https://raw.githubusercontent.com/basecamp/bc3-api/master/sections/card_tables.md
- https://raw.githubusercontent.com/basecamp/bc3-api/master/sections/webhooks.md
- https://raw.githubusercontent.com/basecamp/basecamp-sdk/master/README.md

**monday.com**
- https://raw.githubusercontent.com/mondaycom/monday-sdk-js/master/README.md
- https://raw.githubusercontent.com/mondaycom/monday-graphql-api/main/README.md
- GitHub org listing `org:mondaycom` (39 repositories)

**Notion, Linear, Airtable, Smartsheet, Atlassian, ClickUp, Wrike**
- https://raw.githubusercontent.com/makenotion/notion-sdk-js/main/README.md
- https://raw.githubusercontent.com/linear/linear/master/README.md
- https://raw.githubusercontent.com/linear/linear/master/packages/sdk/README.md
- https://raw.githubusercontent.com/Airtable/airtable.js/master/README.md
- https://raw.githubusercontent.com/smartsheet/smartsheet-javascript-sdk/master/README.md
- https://raw.githubusercontent.com/atlassian-api/atlassian-python-api/master/README.rst
- GitHub repo search `clickup api sdk` (11 results, all community-maintained, top 4 stars)
- GitHub org listing `org:wrike` (29 repositories, no API SDK)
- GitHub org listing `org:linear` (17 repositories)

**OpenProject**
- https://raw.githubusercontent.com/opf/openproject/dev/README.md
- https://raw.githubusercontent.com/opf/openproject/dev/app/models/token/ical.rb
- https://raw.githubusercontent.com/opf/openproject/dev/app/controllers/admin/settings/icalendar_settings_controller.rb
- GitHub code search `ical repo:opf/openproject path:app language:ruby` (157 results)

**Vikunja**
- https://raw.githubusercontent.com/go-vikunja/vikunja/main/README.md
- https://raw.githubusercontent.com/go-vikunja/vikunja/main/pkg/caldav/caldav.go
- https://raw.githubusercontent.com/go-vikunja/vikunja/main/frontend/src/sw.ts
- GitHub code search `caldav repo:go-vikunja/vikunja` (115 results)

**Other open-source project management**
- https://raw.githubusercontent.com/makeplane/plane/preview/README.md
- https://raw.githubusercontent.com/Leantime/leantime/master/README.md
- GitHub code search `ical repo:Leantime/leantime` (260 results; `app/Domain/Calendar/Controllers/Ical.php`, `ExternalCal.php`, `ConnectCalendar.php`, `Tools/GetICalUrlTool.php`)
- https://raw.githubusercontent.com/plankanban/planka/master/README.md
- https://raw.githubusercontent.com/kanboard/kanboard/main/README.md
- https://raw.githubusercontent.com/wekan/wekan/main/README.md
- https://raw.githubusercontent.com/hcengineering/platform/main/README.md (hosted-shutdown banner)
- https://raw.githubusercontent.com/mattermost-community/focalboard/main/README.md (unmaintained warning)
- https://raw.githubusercontent.com/AppFlowy-IO/AppFlowy/main/README.md
- https://raw.githubusercontent.com/anyproto/anytype-ts/main/README.md
- https://raw.githubusercontent.com/Worklenz/worklenz/main/README.md
- https://raw.githubusercontent.com/mark-when/markwhen/main/README.md
- https://raw.githubusercontent.com/nextcloud/deck/master/README.md
- https://raw.githubusercontent.com/stefan-niedermann/nextcloud-deck/master/README.md ("Works offline")
- GitHub code search `Sabre OR CalendarBackend OR VTODO repo:nextcloud/deck` (0 results — inconclusive)

**Ecosystem-shape searches (GitHub repository search, 2026-08-29)**
- `topic:project-management stars:>2000` — 33 results
- `callsheet in:name,description` — 110 results, top result 7 stars
- `topic:film-production` — 95 results
- `nextcloud deck kanban` — 9 results
- `awork api client` — 2 results

**Corpus cross-references (internal, not re-verified this pass)**
- [`docs/research/METHOD.md`](../METHOD.md)
- [`docs/research/landscape/broadcast-production-management.md`](broadcast-production-management.md) — AV overlay pricing and API facts, all second-hand
- [`docs/research/roles/production-manager.md`](../roles/production-manager.md) — Excel/WhatsApp evidence, incl. [erpnext#34127](https://github.com/frappe/erpnext/issues/34127), [erpnext#51855](https://github.com/frappe/erpnext/issues/51855), [shelf.nu#1956](https://github.com/Shelf-nu/shelf.nu/issues/1956), [shelf.nu#2777](https://github.com/Shelf-nu/shelf.nu/issues/2777), [shelf.nu#942](https://github.com/Shelf-nu/shelf.nu/issues/942), the ontime spreadsheet round-trip family ([#786](https://github.com/cpvalente/ontime/issues/786), [#927](https://github.com/cpvalente/ontime/issues/927), [#1054](https://github.com/cpvalente/ontime/issues/1054), [#1327](https://github.com/cpvalente/ontime/issues/1327), [#1890](https://github.com/cpvalente/ontime/issues/1890))
- [`docs/research/repos/INVENTORY.md`](../repos/INVENTORY.md) — `.avplan` envelope and suite structure
- [`docs/research/workflow-chain.md`](../workflow-chain.md)

**Attempted and refused by the egress proxy on 2026-08-29** (listed so the next pass knows these
are unread, not skipped): monday.com, support.monday.com, asana.com, developers.asana.com,
clickup.com, notion.com, developers.notion.com, trello.com, developer.atlassian.com, linear.app,
airtable.com, basecamp.com, smartsheet.com, wrike.com, height.app, studiobinder.com, yamdu.com,
setkeeper.com, farmerswife.com, openproject.org, vikunja.io, docs.vikunja.io, plane.so,
focalboard.com, taiga.io, redmine.org, en.wikipedia.org, de.wikipedia.org, stackoverflow.com,
news.ycombinator.com, reddit.com. Also unreadable: `joniles/mpxj` README (HTTP 404 on `main` and
`master`).
