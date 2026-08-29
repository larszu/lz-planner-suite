# Pain points: Generic Project Management (what actually helps AV, what is bloat)

> Research date: **2026-08-29**. Claim labels follow [`docs/research/METHOD.md`](../METHOD.md):
> **FACT** (read on a page or file I opened, URL cited), **INFERENCE** (my reasoning from those
> facts), **UNKNOWN / unverified** (could not be established this pass).
> Frequency grades: `isolated` / `recurring` / `widespread`.

---

## Method

### What this pass could and could not reach — read this first

This dossier was produced under the same hard network constraint as its sibling
[`landscape/project-management.md`](../landscape/project-management.md), and the constraint
shapes every section below. Stating it plainly is more useful than papering over it.

- **The session's web-search budget was already exhausted (200/200 calls) before this segment
  began.** No search-engine result summaries were available at any point.
- **The egress proxy allowed exactly three hosts**: `raw.githubusercontent.com`,
  `api.github.com` (through the GitHub MCP search tool) and `gitlab.com`. Every other host was
  refused at CONNECT with a 403 policy denial. Probed and refused on 2026-08-29:
  `www.reddit.com`, `old.reddit.com`, `www.g2.com`, `www.capterra.com`, `www.trustradius.com`,
  `stackoverflow.com`, `news.ycombinator.com`, `en.wikipedia.org`, `community.openproject.org`,
  `community.vikunja.io`, `help.nextcloud.com`, `community.nextcloud.com`, `discuss.linear.app`,
  `forum.obsproject.com`, `kolaente.dev`, `codeberg.org`, `www.openproject.org`,
  `3.basecamp-help.com`, `status.asana.com`, `status.notion.so`, `status.airtable.com`,
  `forum.blackmagicdesign.com`.

Consequences, stated as bluntly as they deserve:

1. **The brief's multi-modal search plan could not be executed.** Reddit, G2, Capterra,
   TrustRadius, Trustpilot, avsforum, ProSoundWeb, Blue Room, Control Booth, film-tv-video.de,
   production-partner.de — none were reachable. Where the brief asks for review-site "Cons"
   fields and subreddit threads, this dossier has **nothing**, and says so rather than
   inventing plausible-sounding forum sentiment. **No German-language source was reachable at
   all.**
2. **No price was verified today.** Not one pricing page could be opened. The only price figures
   in this document are ones a *user* stated inside a GitHub issue; they are cited as such, with
   the date, and marked as unverified against the vendor.
3. **What survived is unusually good evidence of a particular kind.** The channel that remained
   open — issue trackers, vendor API specifications, SDK source and READMEs — is the channel
   METHOD.md ranks *highest*. A vendor's own OpenAPI file saying a sync token expires in 24
   hours is a harder fact than any review-site star rating. A pile of 36 "Airtable import failed"
   issues in a competitor's tracker is harder evidence of export pain than one angry tweet.
   So the dossier is strong on **data model, API, offline, lock-in and self-hosted operations**,
   and weak-to-silent on **UX feel, adoption failure, support quality and price**.

### What was actually read

- **18 source files** fetched directly from `raw.githubusercontent.com`: the Asana OpenAPI
  specification (3.15 MB, grepped and read in sections), the Basecamp API reference and three of
  its endpoint sections, the Notion JS SDK README, Airtable's official JS client README and its
  retry source, monday's two SDK repos, the Smartsheet JS SDK README, and the READMEs of
  Nextcloud Deck, the Deck Android client, Vikunja (plus its service worker), Focalboard and Huly.
- **~20 issue-tracker searches** through the GitHub search API across `makeplane/plane`,
  `nextcloud/deck`, `stefan-niedermann/nextcloud-deck`, `Leantime/leantime`, `plankanban/planka`,
  `kanboard/kanboard`, `wekan/wekan`, `go-vikunja/vikunja`, `AppFlowy-IO/AppFlowy`,
  `anyproto/anytype-ts`, `nocodb/nocodb`, `n8n-io/n8n`, `atlassian-api/atlassian-python-api`,
  `Asana/python-asana`, `makenotion/notion-sdk-js`, `mondaycom/*`.
- **~55 individual issues** whose titles, dates, reaction counts and (for the load-bearing ones)
  full bodies I read.
- **Two in-corpus dossiers** re-read as secondary sources with their own cited provenance:
  [`roles/event-manager.md`](../roles/event-manager.md) and
  [`landscape/project-management.md`](../landscape/project-management.md).

"Sources read" in the structured result counts distinct URLs whose content I opened, listed in
[Sources](#sources).

### Dead ends worth recording

- **Asana, Basecamp, monday, Linear and OpenProject all publish code on GitHub with issues
  disabled or empty.** `Asana/python-asana` has 2 matching issues in total;
  `Asana/node-asana`, `Asana/openapi`, `basecamp/bc3-api`, `mondaycom/monday-sdk-js`,
  `mondaycom/monday-graphql-api` and `linear/linear` returned zero. `opf/openproject` returned
  zero for every query — OpenProject routes its community to `community.openproject.org`, which
  is blocked. [INFERENCE] For these vendors, GitHub is a publishing channel, not a support
  channel; user complaint lives on forums this session could not reach. **Their "weaknesses"
  sections below are therefore built from what their own specs admit, not from user reports.**
  That is a real asymmetry and it is flagged in each section.
- **Vikunja's GitHub repo is a mirror.** Five issues total; development and discussion live on
  `kolaente.dev`, unreachable. One of those five issues is itself a finding (see Vikunja).
- **`Universal Schedule Standard` has no public GitHub footprint.** A global code search for the
  exact phrase returned **0 files** (2026-08-29). Croo's involvement in it, asserted by the
  brief, could not be corroborated from any reachable source. **UNVERIFIED.**
- **StudioBinder, Yamdu and SetKeeper have no reachable public issue tracker or API repo.**
  Nothing in this dossier about them rests on anything I read today except one carried-over
  corpus citation.

---

## Per-product findings

### Asana

Asana is the only mainstream product in the segment whose complete data model can be inspected
without a login, because it publishes a full OpenAPI 3.0.0 specification under Apache-2.0. That
makes it the one commercial product here where "what it cannot model" is a *fact* rather than an
impression. Everything below marked FACT was read out of `defs/asana_oas.yaml` on 2026-08-29.

**STRENGTHS (what even a hostile reading concedes)**

- The richest data model in the mainstream segment: 175 paths, 280 schemas, including
  Allocations, Portfolios, Goals, Status Updates, custom types, and an addressable `external`
  foreign-key slot for holding your own IDs. [FACT, corroborates
  [`landscape/project-management.md`](../landscape/project-management.md)]
- A real **event stream with sync tokens** (`GET /events`) plus webhooks — most competitors offer
  webhooks only. [FACT, `asana_oas.yaml` line 17348]
- Events "bubble up": subscribing to a project also delivers changes to stories on tasks and even
  subtasks within it, and "requesting events on a resource is faster and subject to higher rate
  limits than requesting the resource itself". [FACT, spec lines 620-630]
- A **batch API** exists. [FACT, spec line ~238]

**WEAKNESSES**

- **A task cannot have a start time.** The spec defines `start_on` (`format: date`) and `due_on`
  (date), and `due_at` (`format: date-time`). A global grep for a `start_at` *property* on any
  schema in the file returns **nothing**. [FACT, `asana_oas.yaml`, verified 2026-08-29]
  So Asana can express "due at 14:00" and "starts on the 15th", but **never "starts at 07:00"**.
  For AV this is not a nuance — a call time *is* a start time of day.
- **A task cannot start and end on the same day.** The spec's own note: `start_on` and `due_on`
  "cannot be the same date". [FACT, spec line ~4807] A single production day — load-in 07:00,
  wrap 19:00, same date — is structurally unrepresentable as one task.
- **Allocations are day-granular percentages, not shifts.** `AllocationBase` carries
  `start_date` and `end_date` at `format: date`, and `effort` described as "The amount of time
  associated with the allocation, represented as a percentage". [FACT, spec lines 1926-1942]
  Asana models "Sam is 50% allocated next week". It does not model "Sam, Tuesday, call 06:30,
  Studio 3, EVS". `frequency: n/a — this is a schema fact, not a complaint`
- **100 MB attachment ceiling**, stated in the spec itself. [FACT, spec line 13101] Fine for
  plans and PDFs, useless for media.

**MISSING FEATURES (what users request)**

Cannot be assessed from Asana's own channels — `Asana/*` GitHub repos carry essentially no
issues, and the Asana forum is unreachable. **UNKNOWN.** The only user-side signal reachable
today is second-hand, from integration authors:

- Filtering tasks by section is not exposed in a way integrators can use
  ([n8n #23168](https://github.com/n8n-io/n8n/issues/23168), 2025-12-12).
- Comments and attachments were absent from a major integration's Asana coverage until 2026
  ([n8n #36273](https://github.com/n8n-io/n8n/issues/36273), 2026-08-14).

**UX PROBLEMS** — **UNKNOWN this pass.** No reachable source. Not guessed at.

**PERFORMANCE PROBLEMS** — **UNKNOWN for the app.** For the API there is one reachable signal:
"Asana node fails to load all tasks from a workspace"
([n8n #10740](https://github.com/n8n-io/n8n/issues/10740), 2024-09-09), and two historical
pagination complaints in the Python client
([#135](https://github.com/Asana/python-asana/issues/135),
[#124](https://github.com/Asana/python-asana/issues/124)). `frequency: isolated`

**PRICING PROBLEMS** — **UNVERIFIED.** `asana.com/pricing` unreachable 2026-08-29. Per-seat
tiering is asserted by the corpus, not by anything read today. To check: open
`https://asana.com/pricing` and record tier names, per-seat monthly figures and any seat minimum.

**LOCK-IN**

- The good news, and it is genuinely good: the OpenAPI spec is **Apache-2.0** and complete, and
  the API exposes **Exports** — graph exports, resource exports, and full organization exports in
  JSON. [FACT, `asana_oas.yaml` "Exports" section] Asana is, on paper, one of the *least*
  lock-in-prone products in the segment.
- The bad news: **the sync token is the lock-in.** See Offline.

**OFFLINE**

- The app: **UNKNOWN**, assumed cloud-only. [INFERENCE]
- The API, and this is the finding that matters: **"Sync tokens always expire after 24 hours, but
  may expire sooner, depending on load on the service."** On expiry you get `412 Precondition
  Failed`, and the spec's own guidance is that "this signals you may need to re-crawl the data".
  Separately, "events are retrievable from the event stream for 24 hours after being processed"
  and "webhooks cannot be replayed once delivered". [FACT, `asana_oas.yaml` lines 620-655]
- [INFERENCE] Consequence for anyone building an offline AV companion on top of Asana: a device
  that is off the network for longer than 24 hours — an OB truck on a two-day away job, a
  festival build weekend — **cannot resume its delta sync**. It must re-crawl the whole
  workspace on reconnect, which is exactly the moment the connection is worst. Any offline layer
  over Asana must therefore keep its own authoritative store and treat Asana as a lossy mirror.

**INTEGRATION PROBLEMS**

- **The batch API gives you no rate-limit relief.** Asana's own words: a batch request "counts
  against *both* the standard rate limiter and the concurrent request limiter as though you had
  made a separate HTTP request for every individual action", and "if any of the actions in a
  batch request would exceed any of the enforced limits, the *entire* request will fail with a
  `429 Too Many Requests`". [FACT, spec lines 238-256] Batching saves round-trips, not quota, and
  turns one over-limit action into a total failure. That is a hostile design for a bulk sync.

---

### Basecamp (37signals)

Basecamp is the counter-example that makes the Asana finding sharp: it is a *less* configurable
product with a *better-shaped* schedule object.

**STRENGTHS**

- **Basecamp can model a shift; Asana cannot.** A schedule entry carries `starts_at` and
  `ends_at` as full ISO-8601 date-times, an `all_day` boolean, and `participant_ids` — an array
  of people, not a single assignee. [FACT, read
  [`sections/schedule_entries.md`](https://github.com/basecamp/bc3-api/blob/master/sections/schedule_entries.md),
  2026-08-29] Call time, wrap time, and a crew rather than an owner. This is the closest thing to
  an AV shift in any mainstream generic PM product examined in this corpus.
- The best-documented API in the segment: full public reference, an OpenAPI spec, six official
  SDKs, OAuth 2.0, ETag/`Last-Modified` caching, RFC 5988 `Link` pagination with an
  `X-Total-Count` header. [FACT, `bc3-api` README]
- Flat routes: every resource addressable by its own ID without knowing its project.
  [FACT, README] Pleasant for integrators.

**WEAKNESSES**

- **Client approvals are read-only over the API.** The `client_approvals` section lists exactly
  two endpoints — "Get client approvals" and "Get a client approval". There is no create, no
  respond, no state transition. [FACT, read
  [`sections/client_approvals.md`](https://github.com/basecamp/bc3-api/blob/master/sections/client_approvals.md),
  2026-08-29] The segment's only first-class client-approval object cannot be driven from
  outside Basecamp. An AV tool can *read* that the client signed off; it cannot *ask* for the
  sign-off.
- **The rate limit is per IP address, not per token.** "The first rate limit you'll commonly
  encounter is currently 50 requests per 10 second period per IP address", with "multiple rate
  limits… for GET vs POST requests and per-second/hour/day limits", "adjusted dynamically".
  [FACT, `bc3-api` README, 2026-08-29] [INFERENCE] Per-IP means a facility behind one NAT, or a
  multi-tenant integration on one server, shares one budget — several productions can starve each
  other without any of them doing anything wrong.
- **Geared pagination**: 15 results on page 1, 30 on page 2, 50 on page 3, 100 from page 4.
  [FACT, README] A first page of 15 makes "show me today's crew" feel slow on first paint.
- Missing `User-Agent` returns **400**; missing `Content-Type` returns **415**. [FACT, README]
  Harmless, but a classic first-integration trap.

**MISSING FEATURES / UX / PERFORMANCE** — **UNKNOWN this pass.** `basecamp.com` and
`3.basecamp-help.com` unreachable; `basecamp/bc3-api` issues not searchable. No user-side
evidence was obtained. Not guessed at.

**PRICING PROBLEMS** — **UNVERIFIED.** The corpus records a recollection that 37signals sells a
flat per-account tier rather than pure per-seat; nothing read today confirms it. To check:
`https://basecamp.com/pricing`. [INFERENCE, if true] A flat-account price is structurally the
best fit in this whole segment for AV, because it decouples cost from crew count — which is the
single thing that makes per-seat PM unusable for freelance-heavy productions.

**LOCK-IN** — Low by API standards: complete documented REST surface, official SDKs, OpenAPI
spec for codegen. Approval objects are the exception (read-only, above).

**OFFLINE** — **UNKNOWN.** No offline claim found in any file read.

**INTEGRATION PROBLEMS** — 37signals mandates HTTP freshness headers ("You must use HTTP
freshness headers") and expects clients to implement 429/5xx backoff from day one. [FACT, README]
That is good engineering hygiene and also a real cost: a naive integration will be throttled.

---

### monday.com

**STRENGTHS** — GraphQL API with officially generated, typed SDKs
(`@mondaydotcomorg/api`, `@mondaydotcomorg/api-types`) in a maintained monorepo, plus an apps
framework. [FACT, read
[`mondaycom/monday-graphql-api` README](https://github.com/mondaycom/monday-graphql-api)]

**WEAKNESSES**

- **The SDK is pinned to an API version and says so.** "All exported types correspond to the
  current version of the API that existed when the NPM package was released". [FACT, read
  [`packages/api/README.md`](https://github.com/mondaycom/monday-graphql-api/blob/main/packages/api/README.md),
  2026-08-29] [INFERENCE] That is a maintenance treadmill: the SDK and the API version must be
  moved in lockstep, and a monday API version rollover becomes your release problem.
- **No usable public complaint channel.** `mondaycom/monday-sdk-js` and
  `mondaycom/monday-graphql-api` returned **zero** issues to every query tried. `mondaydotcomorg/api`
  is not a repository (404 on raw). Integration authors have nowhere public to file API bugs.
  `frequency: n/a — structural observation`

**MISSING FEATURES / UX / PERFORMANCE / PRICING** — **UNKNOWN this pass.** `monday.com`
unreachable. The n8n tracker yielded only four monday-node issues, all old and minor
([#3612](https://github.com/n8n-io/n8n/issues/3612) 2022, [#8531](https://github.com/n8n-io/n8n/issues/8531)
2024). `frequency: isolated`

**LOCK-IN** — GraphQL plus a versioned schema plus vendor-generated types is a *tighter* coupling
than REST-plus-JSON. [INFERENCE] Leaving monday means rewriting queries, not just re-pointing a
base URL.

**OFFLINE** — **UNKNOWN.** Cannot be established from GitHub.

---

### Notion

The best-evidenced commercial product this pass, because Notion's own SDK README documents its
limits and a large integration project publicly logs the breakage.

**STRENGTHS**

- Automatic retry built into the official client for 429 (rate limited), 529 (overloaded) and
  500/503. [FACT, `notion-sdk-js` README, line ~142-150]
- Genuinely useful pagination helpers shipped by the vendor (`collectPaginatedAPI`,
  `iterateAllDataSourceRows`). [FACT, same README]

**WEAKNESSES**

- **A data source query returns at most 10,000 rows, and then lies to you politely.** From the
  vendor's own README: reading beyond "the limit for a single data source query, which is 10,000
  by default. At that limit, `has_more` is `false` and `request_status.type` is `"incomplete"`;
  **ordinary pagination stops**." The official workaround is to sort by `created_time`, re-query
  from the last row's timestamp on each window, and de-duplicate rows by ID — and if a single
  `created_time` value holds more rows than the limit, "the window cannot be narrowed by time
  alone" and you must add a filter. [FACT, read
  [`notion-sdk-js/README.md`](https://github.com/makenotion/notion-sdk-js/blob/main/README.md),
  2026-08-29]
  [INFERENCE] This is the most dangerous failure mode found in any API this pass, because
  `has_more: false` is the *normal* end-of-list signal. A naive integration does not error — it
  silently returns 10,000 of your 14,000 gear items and reports success.
- **Two live API versions with renamed fields.** The SDK supports `2025-09-03` (default) and
  `2026-03-11`. In `2026-03-11`, `position` replaces `after` on `appendBlockChildren`, `in_trash`
  replaces `archived` on pages/blocks/databases/data sources, and `meeting_notes` replaces
  `transcription`. Old names are marked `@deprecated`. [FACT, same README]
- **Version churn breaks real integrations.** n8n's Notion node has an open issue titled
  "Breaking issue: Notion Node does not support latest Notion API (2025-09-03)"
  ([#19489](https://github.com/n8n-io/n8n/issues/19489), opened 2025-09-12, **still open**, 11
  comments). `frequency: recurring`

**MISSING FEATURES (as evidenced by integration gaps)**

- Formula-typed properties cannot be filtered on reliably. Three separate n8n issues over five
  months — [#27420](https://github.com/n8n-io/n8n/issues/27420) (2026-03-23),
  [#30524](https://github.com/n8n-io/n8n/issues/30524) (2026-05-15, closed as fixed), and
  [#34590](https://github.com/n8n-io/n8n/issues/34590) (2026-07-20, "still fails… after 'fix' in
  2.31.0", **open**). `frequency: recurring`
- Creating a standalone page (not a database row) was unsupported in a major integration until
  2026 ([#27723](https://github.com/n8n-io/n8n/issues/27723), 2026-03-29).
- Deleting several blocks at once produces an uncatchable conflict error
  ([notion-sdk-js #265](https://github.com/makenotion/notion-sdk-js/issues/265), 2022-02-28) —
  old, but it is the single issue that repo has on this theme. `frequency: isolated`

**PERFORMANCE PROBLEMS**

- Search on a large workspace times out with a 504, and the `limit` parameter is ignored
  ([n8n #25202](https://github.com/n8n-io/n8n/issues/25202), 2026-02-03, closed).
- The Notion trigger "errors silently on every poll that returns no updated pages"
  ([n8n #30581](https://github.com/n8n-io/n8n/issues/30581), 2026-05-17).
- Pages whose URL contains underscores were rejected outright
  ([n8n #24006](https://github.com/n8n-io/n8n/issues/24006), 2026-01-07).
  `frequency: recurring — three independent failure modes on large or awkward workspaces`

**PRICING PROBLEMS** — **UNVERIFIED.** `notion.com` unreachable.

**LOCK-IN** — The block model is Notion-shaped. There is no standard for a Notion page, and the
10,000-row read ceiling applies to the export path too, since the API *is* the export path for
anything programmatic. [INFERENCE]

**OFFLINE** — Notion has shipped an offline mode in some form; **not verifiable this pass**
(status page and docs unreachable). What the corpus can say is that the *API* is online-only and
the SDK's whole retry design assumes a live connection. [FACT, README]

---

### Airtable

**STRENGTHS** — A coordinator really can model gear, crew and vehicles as tables in an afternoon,
and the base becomes its own REST API. The official JS client is small, documented, and retries
429 with exponential backoff and jitter. [FACT, read
[`src/run_action.ts`](https://github.com/Airtable/airtable.js/blob/master/src/run_action.ts):
`if (resp.status === 429 && !base._airtable._noRetryIfRateLimited)` → `exponentialBackoffWithJitter`]

**WEAKNESSES**

- Rate limiting is routine enough that the vendor's own client ships backoff-with-jitter as
  default behaviour. [FACT, source above] [INFERENCE] Any bulk operation — importing a gear list,
  syncing a crew roster — will hit it.
- The default request timeout is **5 minutes** (`requestTimeout`, default `300000` ms). [FACT,
  `airtable.js` README] [INFERENCE] A five-minute default timeout is a tell: single requests are
  expected to be slow.
- The README's own browser guidance is a security warning in disguise: putting your API key on a
  web page means "Create a separate account and share only one base with it." [FACT, README]
  There is no per-base scoped browser credential story beyond that.

**PERFORMANCE / RELIABILITY (integration-side)**

From the n8n tracker, all Airtable-node issues, spanning 2024-2026:
timeouts ([#32171](https://github.com/n8n-io/n8n/issues/32171), 2026-06-11);
personal access tokens returning 403 ([#17850](https://github.com/n8n-io/n8n/issues/17850),
2025-07-31); number fields silently set to 0 on update
([#13281](https://github.com/n8n-io/n8n/issues/13281), 2025-02-15, **open**);
attachment upload blocked by the typecast option
([#22999](https://github.com/n8n-io/n8n/issues/22999), 2025-12-10);
update matching only working on record ID rather than a chosen field
([#30557](https://github.com/n8n-io/n8n/issues/30557), 2026-05-15).
`frequency: recurring`

**LOCK-IN — this is Airtable's worst area, and it is very well evidenced**

`nocodb/nocodb` — an open-source competitor with a dedicated Airtable importer — carries **36
issues** about importing from Airtable. The pattern across them is that *leaving Airtable loses
your files*:

- "Airtable import skip all attachments except images"
  ([nocodb #10230](https://github.com/nocodb/nocodb/issues/10230), 2025-01-08)
- "PDFs are not getting migrated when airtable migration is happening"
  ([nocodb #9402](https://github.com/nocodb/nocodb/issues/9402), 2024-08-30)
- "attachment based fields in CSV exports, do not import"
  ([nocodb #7645](https://github.com/nocodb/nocodb/issues/7645), 2024-02-18)
- "Link record between Atbl Imported & local table fails"
  ([nocodb #7632](https://github.com/nocodb/nocodb/issues/7632), 2024-02-15)
- plus crashes, duplicate column aliases, long-column-name failures and checkbox-column failures
  ([#4642](https://github.com/nocodb/nocodb/issues/4642),
  [#8798](https://github.com/nocodb/nocodb/issues/8798),
  [#6465](https://github.com/nocodb/nocodb/issues/6465),
  [#6611](https://github.com/nocodb/nocodb/issues/6611))

`frequency: widespread` — 36 issues, 2022 through 2026, multiple independent reporters, one
consistent theme.
[INFERENCE] For AV this is the specific risk: the attachments in an Airtable base are the rider
PDFs, the venue drawings, the insurance certificates and the patch sheets. A CSV export of a base
gives you the text and drops the documents. That is not a migration; that is a partial evacuation.

**OFFLINE** — No. Network-dependent by design. [INFERENCE from architecture; no offline claim
anywhere in the client]

**PRICING PROBLEMS** — **UNVERIFIED.** Airtable's record and attachment caps per base are widely
believed to be the binding constraint rather than the seat price; **not verified this pass**.
To check: `https://airtable.com/pricing`, recording per-base record cap, attachment storage cap
and per-seat figures.

---

### Smartsheet

**STRENGTHS** — Official, actively built SDKs including
[`smartsheet-javascript-sdk`](https://github.com/smartsheet/smartsheet-javascript-sdk) with CI
and coverage badges. [FACT, README read 2026-08-29] The spreadsheet metaphor is the one AV
coordinators already accept.

**WEAKNESSES / EVERYTHING ELSE** — **Almost entirely UNKNOWN this pass.** The JS SDK README
documents only access-token setup; no rate limits, retry policy or quotas are stated in it.
`smartsheet-platform/smartsheet-python-sdk` returned 404 on raw (the org appears to have moved to
`smartsheet/`). No issues were retrievable. The brief's note that Smartsheet's licensed-user vs
free-collaborator split is "the most AV-relevant pricing shape in the segment" remains
**UNVERIFIED** — and it is the single most important thing to check next in this segment, because
if it is true it is the only mainstream product whose licence model survives contact with a
50-person freelance crew. To check: `https://www.smartsheet.com/pricing`, specifically whether a
free collaborator can *edit* a sheet or only view it.

---

### Jira and Trello (Atlassian)

Neither is a product an AV technical department chooses; both arrive because the parent
broadcaster or agency already standardised on them. [INFERENCE, corroborated by
[`landscape/project-management.md`](../landscape/project-management.md)]

**WEAKNESSES — the best-evidenced finding here is that Atlassian breaks integrations on its own
schedule**

The `atlassian-api/atlassian-python-api` tracker records a clean timeline of one removal:

| Date | Issue | What happened |
| --- | --- | --- |
| 2025-01-28 | [#1500](https://github.com/atlassian-api/atlassian-python-api/issues/1500) | "Upcoming Deprecation of Jira Cloud Search APIs" — advance warning filed by users |
| 2025-08-12 | [#1569](https://github.com/atlassian-api/atlassian-python-api/issues/1569) | `HTTPError: The requested API has been removed. Please use the newer, enhanced search-based API instead.` |
| 2025-09-11 | [#1586](https://github.com/atlassian-api/atlassian-python-api/issues/1586) | Same removal, now quoting Atlassian's own migration notice CHANGE-2046 and the new `/rest/api/3/search/jql` path |
| 2026-04-08 | [#1632](https://github.com/atlassian-api/atlassian-python-api/issues/1632) | Users still filing "Jira: Cant get JQL data with…" |

`frequency: widespread` — the single most-used read operation in the Jira API was removed from
under third-party clients, and users were still tripping over it eight months later.

Other recurring integration gaps in the same tracker: `get_all_projects` relying on a deprecated
endpoint ([#1268](https://github.com/atlassian-api/atlassian-python-api/issues/1268)),
`bulk_issue()` not paginating ([#880](https://github.com/atlassian-api/atlassian-python-api/issues/880)),
`jql_get_list_of_tickets` returning only the first page
([#988](https://github.com/atlassian-api/atlassian-python-api/issues/988)), multi-select custom
fields failing on create/update ([n8n #17692](https://github.com/n8n-io/n8n/issues/17692)), and
no way to set a parent/child relationship on update
([n8n #18078](https://github.com/n8n-io/n8n/issues/18078)).
`frequency: recurring`

**LOCK-IN** — [INFERENCE] The lock-in is not the export format; it is the *cadence*. A cloud
vendor that removes a v2 endpoint on its own timetable makes every integration a subscription to
Atlassian's release calendar. For a facility that ships an offline tool alongside, that is an
operational cost with no upper bound.

**OFFLINE** — No for Jira Cloud. [INFERENCE]

**PRICING / UX** — **UNKNOWN this pass.**

---

### Linear

**STRENGTHS** — The segment's speed and keyboard-first benchmark; official typed GraphQL SDK
generated from the schema, MIT-licensed. [FACT, carried from
[`landscape/project-management.md`](../landscape/project-management.md)]

**WEAKNESSES** — `repo:linear/linear` returned **zero** issues to every query; `discuss.linear.app`
is blocked. **UNKNOWN this pass.** The corpus's claim that Linear's client is built on a local
sync store, and therefore partially offline, remains **INFERENCE from architecture, not verified**.
It is worth verifying, because if true Linear is the only mainstream product in the segment with
a genuine local-first client — and the AppFlowy evidence below is a warning about what that costs.

---

### OpenProject

**STRENGTHS**

- The best crew-distribution mechanism found in the entire segment, and it is worth restating
  because it is the design AV Planner Suite should copy: **per-query iCal subscription URLs with
  revocable, hashed tokens** (`Token::ICal`, prefix `opical`, one token per query). [FACT,
  carried from [`landscape/project-management.md`](../landscape/project-management.md), read from
  `app/models/token/ical.rb`]
  [INFERENCE] This is the only mechanism in the segment that gets dates onto a freelancer's phone
  **without giving them a seat, an account, or an app** — and it can be revoked per person when
  the job ends. For a 40-person freelance crew, that is the difference between a licence cost and
  no licence cost.
- AGPL Community Edition, self-hostable, German vendor, credible for public-body procurement.

**WEAKNESSES** — **UNKNOWN this pass, and this is a real gap.** `opf/openproject` on GitHub
returned zero issues for every query tried (they use `community.openproject.org`, blocked). The
corpus records two earlier searches by a sibling dossier that also found nothing:
`is:issue budget` and `is:issue budget actual costs` both returned no results
([`roles/production-manager.md`](../roles/production-manager.md) lines 1045-1046).
[INFERENCE] OpenProject's known reputational weakness is Gantt/work-package page weight on large
projects, but **nothing read today supports that** and it is not asserted here.

**OFFLINE** — The app, no. The **calendar, yes** — that is the whole point of the iCal token
design. [FACT]

**PRICING PROBLEMS** — Community Edition is free; specific capabilities are Enterprise add-ons.
Which ones, and the cloud price, are **UNVERIFIED**.

---

### Vikunja

**STRENGTHS**

- The only verified route in the segment to **editable offline tasks on a crew phone**: a real
  CalDAV server emitting `VTODO` with `DUE`, `RRULE`, `VALARM`, `RELATED-TO`, implementing
  `sync-collection` and `PROPPATCH`. [FACT, carried from the landscape pass, read from
  `pkg/caldav/caldav.go`] A phone's native Reminders/Tasks app holds the data locally and syncs
  when it can — the offline story is delegated to the platform, which is the correct move.
- AGPL-3.0, self-hostable, German. Current release **v2.5.0**. [FACT, README badge, 2026-08-29]

**WEAKNESSES**

- **The PWA is a shell, not an offline app, and the code says so.** `frontend/src/sw.ts`
  precaches build assets with `StaleWhileRevalidate`, and then registers a route with
  `new workbox.strategies.NetworkOnly({ ... cache: 'no-store' ... })`. [FACT, read
  [`frontend/src/sw.ts`](https://github.com/go-vikunja/vikunja/blob/main/frontend/src/sw.ts),
  2026-08-29] With no network the app chrome loads and the data does not. That is arguably worse
  than a clean failure: it looks like it is working.
- **Feature gating.** "If you or your company needs admin panel, audit logs or time tracking,
  check out Vikunja Pro." [FACT, README, 2026-08-29] Time tracking behind a paywall matters for a
  rental/production business where hours are billable.
- **The community is hard to reach.** The GitHub repository is a mirror with five issues total.
  One of them is literally titled "Unable to open a feature request without leaving Github
  platform" ([#169](https://github.com/go-vikunja/vikunja/issues/169), 2022-10-18, closed).
  [INFERENCE] Self-hosted-forge-only development is defensible for the maintainer and a real tax
  on adoption evidence: nobody outside can see how responsive the project is.
- The README discloses that "for the development of Vikunja, we're using LLM-Assisted coding
  tools in various parts of the codebase". [FACT, README, 2026-08-29] Recorded as a fact, not a
  criticism; it is relevant to anyone doing a code-quality due-diligence pass.

**MISSING FEATURES / UX / PERFORMANCE / PRICING** — **UNKNOWN this pass** (tracker unreachable).

---

### Nextcloud Deck (server app + Android client)

The best-evidenced product in this dossier, because Nextcloud develops in the open on GitHub and
the tracker is nine years deep.

**STRENGTHS**

- The Android client's headline feature list literally reads "Works offline" (the original line carries an emoji, removed here), alongside
  multiple accounts, attachments, comments and activity. [FACT, read
  [Deck Android README](https://github.com/stefan-niedermann/nextcloud-deck/blob/master/README.md),
  2026-08-29] It is on F-Droid and Play. An iOS client exists separately
  ([holger-dev/nextdeck](https://github.com/holger-dev/nextdeck)). [FACT, Deck server README]
- Self-hosted, AGPL, German vendor (Nextcloud GmbH, Stuttgart), free with Nextcloud.

**WEAKNESSES / PERFORMANCE PROBLEMS — a nine-year, unresolved performance ceiling**

This is the clearest single-product pattern in the dossier. Independent reports, different years,
different servers:

| Date | Issue | Substance |
| --- | --- | --- |
| 2020-05-02 | [#1780](https://github.com/nextcloud/deck/issues/1780) (**open**, 12 +1, 15 comments) | "Every action take too much time if you have big number of cards" — with **170 cards**. Expectation stated: "Rerender have to be completed in less then one second" |
| 2023-11-06 | [#5259](https://github.com/nextcloud/deck/issues/5259) (**open**, 14 +1, 11 comments) | ~2,400 cards migrated from Trello; board "greatly slowed down"; suspects archived cards are still loaded; deploying Redis had no effect on Deck |
| 2025-11-20 | [#7382](https://github.com/nextcloud/deck/issues/7382) (**open**) | "Performance observation" |
| 2026-07-17 | [#8165](https://github.com/nextcloud/deck/issues/8165) (**open**) | Big shared boards "became unresponsive" after updating to Nextcloud 33.0.6 / Deck 1.17.4; effect visible at "more than 50 cards". Reporter's config identifies a **German municipal deployment** (`nextcloud.sv.rostock.de`, AIO, LDAP, PostgreSQL, Redis) |
| 2026-07-31 | [#8226](https://github.com/nextcloud/deck/issues/8226) (**open**) | Browser goes **out of memory** rendering the "Upcoming cards" view with 4,107 cards; reporter proposes falling back to a plain list above ~200 |

Also: high browser memory use under heavy Deck use
([#4329](https://github.com/nextcloud/deck/issues/4329), 2022, **open**); an admin asking to
disable the upcoming-cards view because it loads "over 10000 cards which I don't want to see"
([#6741](https://github.com/nextcloud/deck/issues/6741), 2025-02-12); autosave permanently
breaking after one 504 ([#2175](https://github.com/nextcloud/deck/issues/2175), 2020).

`frequency: widespread` — six years, at least eight independent reporters, still open, and the
2026 reports are worse than the 2020 one.
[INFERENCE] A production's card count is not optional. One festival with 30 positions × 6 days is
already 180 cards; a season is thousands. Deck's ceiling sits below the size of a real AV job.

**MISSING FEATURES — and the segment's single most-demanded one**

- **"Public board sharing"** — [#14](https://github.com/nextcloud/deck/issues/14), opened
  **2017-02-01**, last touched **2026-08-19**, **still open**, **184 +1 / 260 total reactions /
  42 comments**. The ask, in the opener's words: share a board by generating a public link like
  the Files app, password-protectable, with write permissions toggleable for guest users, showing
  the board without the sidebar and without management-only functionality. [FACT, body read
  2026-08-29]
  This is the highest-signal feature request found anywhere in this segment, and it is exactly
  the AV requirement: **give a freelancer the board without giving them an account.**
  `frequency: widespread`
- **Cards have a due date but no start date and time.**
  [#8040](https://github.com/nextcloud/deck/issues/8040) (2026-06-09, **open**): "enhanced
  compatibility with calendar including having start date and time". [FACT, title read]
  Same structural gap as Asana: due-date thinking, not call-time thinking.
- Clone/copy a card — [#1813](https://github.com/nextcloud/deck/issues/1813), **57 +1**, 44
  comments, opened 2020, closed 2025. `frequency: widespread` [INFERENCE] Recurring shows are
  built by duplication; a tool without card cloning forces retyping every week.
- Link/share a card into another board ([#1261](https://github.com/nextcloud/deck/issues/1261),
  14 +1, **open** since 2019); sprint-like grouping
  ([#855](https://github.com/nextcloud/deck/issues/855), 12 +1, **open** since 2019); list sorting
  ([#6046](https://github.com/nextcloud/deck/issues/6046), 8 +1, **open**); calendar visibility
  not toggleable per board sharee ([#2661](https://github.com/nextcloud/deck/issues/2661), 14 +1,
  **open** since 2020); "Restricted functionality for Guest Accounts"
  ([#1252](https://github.com/nextcloud/deck/issues/1252), **open** since 2019); cannot leave a
  board that was shared with you ([#955](https://github.com/nextcloud/deck/issues/955), 15 +1,
  **open** since 2019).

**OFFLINE — the claim is real, the history is bumpy**

The Android client claims offline operation and largely delivers it, but the tracker records a
long tail of offline-specific defects, most now closed:

- "Creating board when offline gets deleted after next sync"
  ([#438](https://github.com/stefan-niedermann/nextcloud-deck/issues/438), 2020-04-29) — silent
  loss of work done offline, the worst possible failure class
- "Creating stack offline does not work" ([#439](https://github.com/stefan-niedermann/nextcloud-deck/issues/439))
- "Offline ACL changes are not synced when online again" ([#196](https://github.com/stefan-niedermann/nextcloud-deck/issues/196))
- "Assing / Unassign / Assign does not work when offline" ([#197](https://github.com/stefan-niedermann/nextcloud-deck/issues/197))
- "Crash when drag n drop offline" ([#378](https://github.com/stefan-niedermann/nextcloud-deck/issues/378))
- "Not usable if internet connection is unstable" ([#1061](https://github.com/stefan-niedermann/nextcloud-deck/issues/1061), 2021-07-23)
- "SyncOnWifiOnly causes OfflineException on several actions" ([#165](https://github.com/stefan-niedermann/nextcloud-deck/issues/165))
- and continuing sync failures in 2025-2026:
  [#1744](https://github.com/stefan-niedermann/nextcloud-deck/issues/1744) "frequent error 'could
  not synchronize'" (2025-04-03), [#1847](https://github.com/stefan-niedermann/nextcloud-deck/issues/1847)
  (2026-02-25), [#1374](https://github.com/stefan-niedermann/nextcloud-deck/issues/1374) (**open**)

`frequency: recurring`
[INFERENCE] The instructive detail is #1061: the hard case is not *offline*, it is *flaky*. A
truck in a car park with one bar is worse for a sync engine than a truck in a tunnel. Any offline
design for AV must be tested against intermittent connectivity, not against airplane mode.

**INTEGRATION PROBLEMS** — REST API documented at `deck.readthedocs.io` (unreachable this pass).
Comment counts on cards do not refresh without a page reload
([#4082](https://github.com/nextcloud/deck/issues/4082), **open** since 2022) — a small thing that
tells you the client is not fully reactive.

---

### Plane

**STRENGTHS** — The most active self-hosted Jira/Linear replacement; cycles, modules, Gantt;
large and engaged community (795 open issues matched a single broad query).

**WEAKNESSES — the open-core line moved, and users noticed**

- **OIDC was moved behind a paywall between v1 and v2.**
  [#8047](https://github.com/makeplane/plane/issues/8047) (2025-10-31, **open**, 18 +1). The
  filer's account, read in full: in version 1 OIDC was included for self-hosted deployments under
  the free tier; in version 2 it "appears this functionality has been moved behind a paywall",
  leaving organisations facing "a steep $8.00 per seat subscription just to implement a core
  authentication feature in what was previously open source software". They add that the change
  "sends a discouraging signal: features that were once freely available are now gated, making
  the project feel less open and more commercialized". [FACT, issue body read 2026-08-29]
  > **Price caveat:** the `$8.00 per seat` figure is **a user's statement inside a GitHub issue
  > dated 2025-10-31**, not a vendor page. `plane.so` was unreachable on 2026-08-29 and the
  > figure is **UNVERIFIED**. To check: Plane's pricing page.
  `frequency: recurring` — reinforced by
  [#8782](https://github.com/makeplane/plane/issues/8782) (2026-03-21, **open**): OAuth app
  registration endpoints "only exist on Plane Cloud", so self-hosted users have "no multi-user
  auth option" for the MCP server; pointing at a self-hosted instance "just 404s".
- **Self-hosting friction.** "Cannot enter different port number on installation"
  ([#8123](https://github.com/makeplane/plane/issues/8123), 2025-11-16, **open**, 19 comments);
  a React hydration error putting mobile browsers into an error boundary on self-hosted v1.3.0
  ([#8867](https://github.com/makeplane/plane/issues/8867), 2026-04-08, **open**, 12 comments);
  the update checker breaking on a GitHub API response shape change
  ([#8775](https://github.com/makeplane/plane/issues/8775), 2026-03-19, **open**).
  `frequency: recurring`
- MFA still not implemented ([#1212](https://github.com/makeplane/plane/issues/1212), **open**
  since 2023).

**MISSING FEATURES (ranked by reactions)**

| +1 | Issue | Ask |
| --- | --- | --- |
| 85 | [#1495](https://github.com/makeplane/plane/issues/1495) (2023-07-10, **open**) | Gitea integration — i.e. work with a self-hosted forge, not only GitHub |
| 23 | [#5941](https://github.com/makeplane/plane/issues/5941) (2024-11-03, **open**) | Local AI, not cloud AI |
| 22 | [#8147](https://github.com/makeplane/plane/issues/8147) (2025-11-20, **open**) | Mermaid diagrams in Markdown |
| 18 | [#3372](https://github.com/makeplane/plane/issues/3372) (2024-01-15, **open**) | Better sub-tasks |
| 16 | [#8598](https://github.com/makeplane/plane/issues/8598) (2026-01-29, **open**) | Page update API endpoints + MCP tools |
| 15 | [#7319](https://github.com/makeplane/plane/issues/7319) (2025-07-02, **open**) | API endpoints to create and edit Pages |
| 14 | [#1005](https://github.com/makeplane/plane/issues/1005) (2023-05-03, closed) | **iCal calendar exports / links** |
| 12 | [#4866](https://github.com/makeplane/plane/issues/4866) (2024-06-18, **open**) | Move a project between workspaces |
| 12 | [#1280](https://github.com/makeplane/plane/issues/1280) (2023-06-13, closed) | PWA support |
| 11 | [#2733](https://github.com/makeplane/plane/issues/2733) (2023-11-09, **open**) | Bug: cannot move a task to another project |
| 10 | [#4706](https://github.com/makeplane/plane/issues/4706) (2024-06-04, **open**) | Shared master lists of States, Labels, Cycles, Estimates across projects |
| 9 | [#6623](https://github.com/makeplane/plane/issues/6623) (2025-02-17, **open**) | Automated time tracking with a timer |
| 9 | [#5551](https://github.com/makeplane/plane/issues/5551) (2024-09-08, **open**) | Colours on the Gantt view |

[INFERENCE] Two of these are directly AV-shaped and both are still unmet: a **shared master list
of states/labels across projects** (#4706) is precisely "one equipment vocabulary, many shows",
and **moving work between projects** (#2733, #4866) is precisely "this job got rescheduled into
next month's production".

- Calendar egress remains an open ask in 2026:
  [#8794](https://github.com/makeplane/plane/issues/8794) (2026-03-24, **open**), "Google Calendar
  Integration – Sync Work Items, Cycles & Due Dates" — three years after the iCal request.
  `frequency: recurring`

**OFFLINE** — No. PWA support was requested (#1280) and closed; no service worker was found in
the repository by the landscape pass. [FACT, carried]

---

### Leantime

**STRENGTHS** — AGPLv3 with all listed features in the open-source build; Gantt, milestones and
timesheets in one package; iCal export plus external calendar subscription and Google Calendar
import. [FACT, carried from the landscape pass, read from `app/Domain/Calendar/**`] Explicitly
designed for people who are not project managers — which describes an AV production coordinator
exactly.

**WEAKNESSES — the upgrade path is the problem**

A single query for upgrade/500 problems returns **16 issues spanning 2020 to 2026**, and they are
all the same story:

- [#345](https://github.com/Leantime/leantime/issues/345) "Upgrade isssue 2.0 -> 2.1" (2020-10-27)
- [#783](https://github.com/Leantime/leantime/issues/783) "Error 500 after 2.20 update" (2022-07-13)
- [#2034](https://github.com/Leantime/leantime/issues/2034) "ERROR 500 after 2.4.2 update from 2.4.1" (2023-10-25)
- [#2273](https://github.com/Leantime/leantime/issues/2273) "Many 500 errors after update from 2.4.8 to 3.03" (2024-02-02)
- [#3016](https://github.com/Leantime/leantime/issues/3016) "Error 500 upon updating from 3.4.7 to 3.4.11" (2025-04-08)
- [#3033](https://github.com/Leantime/leantime/issues/3033) "Error 500 after updating to 3.5.1" (2025-05-08)
- [#3284](https://github.com/Leantime/leantime/issues/3284) "Migration from 2.4.x to 3.7.1 failed" (2026-02-27)
- [#3706](https://github.com/Leantime/leantime/issues/3706) "Database Update Failure" (2026-07-27)
- plus fresh-install 500s ([#2912](https://github.com/Leantime/leantime/issues/2912), 16 comments;
  [#2974](https://github.com/Leantime/leantime/issues/2974))

`frequency: widespread` — six years, every major version, same failure class.

**MISSING FEATURES** — Multiple dependencies for milestones
([#268](https://github.com/Leantime/leantime/issues/268), 9 +1, **open** since 2020); assigning one
user to multiple clients ([#420](https://github.com/Leantime/leantime/issues/420), **open** since
2021); time-tracking descriptions visible in UI and CSV
([#1480](https://github.com/Leantime/leantime/issues/1480), **open** since 2023); burndown/time-
remaining dashboard reporting ([#658](https://github.com/Leantime/leantime/issues/658), **open**
since 2022, last touched 2026-04). Subtasks were described by one user as "Too limited to utilize"
([#1143](https://github.com/Leantime/leantime/issues/1143), 2022).

---

### Planka

**STRENGTHS** — Clean Trello replacement with real-time sync and a published Swagger UI. [FACT,
carried]

**WEAKNESSES**

- **No mobile support, requested since 2020, still open.**
  [#19](https://github.com/plankanban/planka/issues/19), "[Feature Request] Mobile Support",
  opened 2020-08-12, **21 reactions, 23 comments, still open** on 2026-08-29. [FACT]
  `frequency: recurring`
  [INFERENCE] For AV this alone disqualifies it: the person who needs the board is holding a
  case, not a laptop.
- **Database migrations break on upgrade, repeatedly.** 14 issues on this theme:
  "Migration from 1.x to 2.x **breaks existing data without automatic fix**"
  ([#1697](https://github.com/plankanban/planka/issues/1697), 2026-06-15);
  "DB Migration fails while upgrading Planka from 1.26.2 to the latest version"
  ([#1623](https://github.com/plankanban/planka/issues/1623), 2026-04-01, **open**);
  "The migration directory is corrupt" three separate times
  ([#1518](https://github.com/plankanban/planka/issues/1518),
  [#1281](https://github.com/plankanban/planka/issues/1281),
  [#1701](https://github.com/plankanban/planka/issues/1701));
  "Frontend stuck on loading screen after upgrade – Database errors: missing columns/tables"
  ([#1522](https://github.com/plankanban/planka/issues/1522));
  "Migration issue with Due Date" ([#1519](https://github.com/plankanban/planka/issues/1519)).
  `frequency: widespread`

---

### Kanboard

**STRENGTHS** — MIT, free, extremely low resource use, runs on almost anything, JSON-RPC API.
[FACT, carried]

**WEAKNESSES** — **Largely UNKNOWN this pass.** Only two issues matched any query, both about
responsive layout and both closed a decade ago
([#2814](https://github.com/kanboard/kanboard/issues/2814), 2016;
[#1461](https://github.com/kanboard/kanboard/issues/1461), 2015). [INFERENCE] Either the project
is very stable or its tracker is very tidy; from the outside these look identical. No offline
story; no mobile client found.

---

### WeKan

**STRENGTHS** — MIT, free, 234 translations, assessed against the Standard for Public Code.
[FACT, carried]

**WEAKNESSES — the highest churn of any product examined**

42 issues matched a single query about slowness and broken upgrades; the recent ones are severe:

- "**Missing Data after Upgrade vom v6 to latest Release**"
  ([#6583](https://github.com/wekan/wekan/issues/6583), 2026-08-11, **25 comments**) — note the
  German-language title fragment, so at least one report is from a German-speaking deployment
- "**UI hangs / extremely slow load times (cache-related?) causing data loss in active sessions
  (all 8.x versions)**" ([#6307](https://github.com/wekan/wekan/issues/6307), 2026-04-21,
  **27 comments**)
- "Problem with boards and cards after 10.33 migration"
  ([#6521](https://github.com/wekan/wekan/issues/6521), 2026-07-24)
- "Live and Test System broken after Update to 9.95"
  ([#6468](https://github.com/wekan/wekan/issues/6468), 2026-07-16)
- "DB migration from 8.19 to 8.23 stuck forever"
  ([#6089](https://github.com/wekan/wekan/issues/6089), 2026-01-22)
- "Boards have long loading times on Wekan 8" ([#6146](https://github.com/wekan/wekan/issues/6146), 2026-02-16)
- "Boards missing" ([#5944](https://github.com/wekan/wekan/issues/5944), 2025-10-17)
- "v.7.09 import board from v.6.09 export board ends in 500"
  ([#5132](https://github.com/wekan/wekan/issues/5132), 2023-09-15) — **WeKan's own export cannot
  be imported by the next major version**
- "Public board with many cards inaccessible" ([#2636](https://github.com/wekan/wekan/issues/2636), 2019)

`frequency: widespread`
[INFERENCE] Two of these are disqualifying for production use rather than merely annoying: data
missing after an upgrade, and data loss caused by a slow UI in an active session. The version
numbers moving from 6 to 10 within roughly a year also suggests a release cadence faster than the
migration testing supports.

---

### The discontinued and the de-gated: Focalboard, Huly, Plane

Three separate, verifiable events in the last two years, each a different flavour of the same
risk. **This is a cross-product pattern important enough to name here as well as below.**

- **Focalboard — abandoned.** The repository README opens with:
  "**This repository is currently not maintained. If you're interested in becoming a maintainer
  please let us know here.**" Standalone Focalboard is done; only the Mattermost plugin
  (`mattermost/mattermost-plugin-boards`) continues. [FACT, read
  [Focalboard README](https://github.com/mattermost/focalboard/blob/main/README.md), 2026-08-29]
  Focalboard was widely recommended as *the* self-hosted Trello/Notion/Asana alternative.
- **Huly — hosted service shut down.** The platform README carries an IMPORTANT banner:
  "**Hosted Huly is shutting down — please migrate your data.** The hosted Huly service is being
  discontinued **because its hosting is no longer being funded**… The service shutdown is expected
  on **July 20**." Self-hosted deployments are explicitly unaffected. [FACT, read
  [Huly platform README](https://github.com/hcengineering/platform/blob/main/README.md),
  2026-08-29; the banner gives no year]
- **Plane — feature re-gated.** OIDC moved from the free self-hosted tier to a paid tier between
  v1 and v2 (see Plane above). [FACT, issue #8047 body]

`frequency: recurring — three vendors, three mechanisms, two years`

---

### AppFlowy and Anytype — the local-first products, and the price of local-first

Both are marketed on data ownership and offline operation. Both have a tracker that documents
what that costs when the sync layer is not yet mature. This is the most directly transferable
lesson in the dossier for an offline-first product.

**AppFlowy**

- "[Bug] **Sync is unreliable and leads to data loss**"
  ([#8455](https://github.com/AppFlowy-IO/AppFlowy/issues/8455), 2026-01-26, **open**, 16 comments)
- "[Bug] An extremely malicious bug where restarting cloud services in **Offline Mode /
  Non-logged-in mode causes all save files to be irrecoverably lost**"
  ([#8635](https://github.com/AppFlowy-IO/AppFlowy/issues/8635), 2026-04-05)
- "[BUG] **Local data cannot be loaded after being copied to another computer**"
  ([#8416](https://github.com/AppFlowy-IO/AppFlowy/issues/8416), 2026-01-04, **open**) — the
  ownership promise fails at the one moment ownership matters
- "[Bug] **data lost after launching 0.9.0**"
  ([#7872](https://github.com/AppFlowy-IO/AppFlowy/issues/7872), 2025-04-30, 36 comments)
- "[Bug] Mobile: Syncing from PC to Mobile looses data"
  ([#8207](https://github.com/AppFlowy-IO/AppFlowy/issues/8207), 2025-09-03)
- Requested, still open: "[FR] **Manual sync conflict resolution**"
  ([#5139](https://github.com/AppFlowy-IO/AppFlowy/issues/5139), 2024-04-15) and "[FR] Local
  auto-save and cross-check before cloud sync"
  ([#8722](https://github.com/AppFlowy-IO/AppFlowy/issues/8722), 2026-05-14)

`frequency: recurring — five independent data-loss reports across two years`

**Anytype** — one matching report, same shape: "Local-only sync issue when device performed some
offline editing" ([anytype-ts #2141](https://github.com/anyproto/anytype-ts/issues/2141),
2026-04-11, **open**). `frequency: isolated`

[INFERENCE] The lesson is not "avoid offline". It is that **users of local-first tools ask for
manual conflict resolution**, twice, unprompted (AppFlowy #5139, #8722). They do not want a
clever automatic merge; they want to be shown the conflict and allowed to decide. For an AV tool
where the conflicting edits are "the call time changed" versus "the camera moved", that is
obviously right — and it is a differentiator, not a fallback.

---

### AV overlays: StudioBinder, Yamdu, SetKeeper, Croo

**Nothing about these products was verifiable this pass.** All four vendor domains are blocked;
none has a reachable public issue tracker or API repository; a global GitHub code search for the
exact phrase `Universal Schedule Standard` returned **0 files** (2026-08-29).

The only reachable evidence is one carried-over corpus citation, and it is the relevant one:

> Shot-list and breakdown software is received "grudgingly at best" — the interface is dense, the
> learning curve is real, and for a director who just wants to break down a short film it is
> "significantly more software than necessary"; "for a lot of indie filmmakers, a well-structured
> spreadsheet is still the most practical shot list tool".
> [CORPUS, [`roles/camera-operator.md`](../roles/camera-operator.md) line 217, citing a Storyflow
> shot-list tool review, 2026]

`frequency: isolated as read today` — one review, one dossier, cited honestly as such.

[INFERENCE, and it is the structural point] The landscape pass established the asymmetry by
counting: `topic:project-management stars:>2000` returns **33 repositories**, headed by AppFlowy
(76k stars) and Plane (58k); `callsheet in:name,description` returns **110 repositories** whose
highest-starred has **7 stars** and is a localisation-string repo for a closed-source app. [FACT,
carried from [`landscape/project-management.md`](../landscape/project-management.md), searches run
2026-08-29] Generic project management has one of the largest open-source ecosystems in software.
The document an AV production actually runs on has none. That gap is why AV teams end up in Excel:
for the generic half there are fifty free tools; for the AV-specific half there are none; and the
spreadsheet is the bridge.

---

## Cross-product patterns

These are the complaints and gaps that recur across **multiple independent vendors**. Per
METHOD.md these carry the most weight, because a pattern that appears in a commercial SaaS, a
self-hosted PHP app and a Rust desktop app is a property of the problem, not of a codebase.

### 1. The data model is due-date-shaped; AV work is call-time-shaped — `widespread`

The strongest finding in the dossier, and the only one established from vendor specifications
rather than complaints.

| Product | Can it express "Tuesday, call 06:30, wrap 19:00, crew of four"? | Evidence |
| --- | --- | --- |
| **Asana** | **No.** No `start_at` property exists on any schema. `start_on` is a date. `start_on` and `due_on` "cannot be the same date". Allocations are `format: date` with `effort` as a **percentage**. | [FACT, `asana_oas.yaml`, 2026-08-29] |
| **Nextcloud Deck** | **No.** Users are still asking for "start date and time" in 2026. | [#8040](https://github.com/nextcloud/deck/issues/8040) |
| **Basecamp** | **Yes.** `starts_at` / `ends_at` are ISO-8601 date-times; `all_day` flag; `participant_ids` is an array. | [FACT, `schedule_entries.md`] |
| monday / Notion / Airtable / Smartsheet | **UNKNOWN** — not verifiable this pass | — |

[INFERENCE] This is the precise technical statement of "generic PM is bloat for AV". The
products are not missing *features*; they are missing a *type*. A task has an owner and a
deadline. A shift has a crew, a start time, an end time and a place. You can fake a shift with a
task and three custom fields, and every AV team that has tried has ended up back in a spreadsheet
— because the calendar view, the notification, the mobile card and the export all still treat it
as a deadline.

### 2. Getting dates to a person who does not have a seat is the unsolved problem — `widespread`

- Nextcloud Deck [#14](https://github.com/nextcloud/deck/issues/14) "Public board sharing":
  **184 +1, open since 2017-02-01, still open 2026-08-19.** The single most-reacted issue found
  in this segment.
- Deck [#1252](https://github.com/nextcloud/deck/issues/1252) "Restricted functionality for Guest
  Accounts", open since 2019.
- Plane [#1005](https://github.com/makeplane/plane/issues/1005) iCal exports (2023, 14 reactions)
  and [#8794](https://github.com/makeplane/plane/issues/8794) Google Calendar sync (2026) — the
  same need asked twice, three years apart.
- **OpenProject is the one product that solved it**, with per-query iCal subscription URLs bearing
  revocable hashed tokens. [FACT, carried]
- Vikunja solved a different half of it with CalDAV `VTODO`, which puts *editable* tasks on the
  phone's native app. [FACT, carried]

[INFERENCE] The per-seat business model and the freelance workforce are structurally opposed, and
neither side is going to move. The technical resolution that already exists in this segment is
**tokenised, revocable, per-recipient calendar feeds** — no account, no app, no seat, and it lands
in the calendar the freelancer already looks at. That is the mechanism to copy.

### 3. Cloud vendors break your integration on their schedule — `widespread`

- **Atlassian removed the Jira Cloud search API.** Four issues over 15 months in one client
  library, from advance warning (2025-01) to users still hitting it (2026-04).
- **Notion runs two API versions with renamed fields** (`archived` → `in_trash`,
  `after` → `position`, `transcription` → `meeting_notes`), and a major integration has an open
  issue titled "Breaking issue: Notion Node does not support latest Notion API".
- **monday's SDK types are pinned to the API version current at package release.**
- **Asana's sync tokens expire in 24 hours "or sooner, depending on load on the service"** — the
  vendor reserves the right to force you to re-crawl.

[INFERENCE] For a desktop, offline-first AV tool this is the decisive argument for treating every
cloud PM system as an **optional, resyncable mirror** and never as the source of truth. The
project file has to be the authority, because the API contract is not one you control.

### 4. Leaving is lossy, and the files are what you lose — `widespread`

- **Airtable → anywhere**: 36 issues in NocoDB's tracker; attachments other than images skipped,
  PDFs not migrated, attachment fields absent from CSV export, linked records broken.
- **WeKan → WeKan**: its own board export from v6.09 could not be imported by v7.09
  ([#5132](https://github.com/wekan/wekan/issues/5132)).
- **Planka 1.x → 2.x**: "breaks existing data without automatic fix"
  ([#1697](https://github.com/plankanban/planka/issues/1697)).
- **Counter-example worth crediting**: Asana publishes an Apache-2.0 OpenAPI spec and offers
  organisation-wide JSON export; Basecamp publishes its whole API reference plus an OpenAPI file.
  Openness of the *interface* is not the same as portability of the *content*, but it is the
  precondition.

[INFERENCE] The AV-specific sting: in this industry the attachments *are* the deliverable. Rider
PDFs, patch sheets, venue drawings, insurance certificates, signed call sheets. A migration that
carries the rows and drops the documents has moved the index and left the library.

### 5. Self-hosted upgrades are the second-biggest operational risk after data loss — `widespread`

Four independent products, same failure class, all still occurring in 2026:

| Product | Evidence |
| --- | --- |
| Leantime | 16 issues, 2020-2026, "Error 500 after update" at nearly every version boundary |
| Planka | 14 issues; "migration directory is corrupt" three times; 1.x → 2.x breaks data |
| WeKan | "Missing Data after Upgrade" (2026-08, 25 comments); migration stuck; v6 export unreadable by v7 |
| Nextcloud Deck | Big boards "became unresponsive" *after* updating to Deck 1.17.4 ([#8165](https://github.com/nextcloud/deck/issues/8165), 2026-07) |
| Plane | Self-hosted install cannot take a custom port ([#8123](https://github.com/makeplane/plane/issues/8123), **open**, 19 comments) |

[INFERENCE] The "self-host it and own your data" answer to per-seat pricing carries a hidden
labour cost that lands on whoever in the facility is least able to absorb it — usually the same
engineer who is on a show that week. A desktop application with a versioned, self-healing project
file has no migration night.

### 6. Every board tool has a card-count ceiling, and it is lower than a real production —
`widespread`

- Nextcloud Deck: degradation reported at **170 cards** (2020) and at **"more than 50 cards"**
  after a 2026 update; browser OOM at 4,107; Redis makes no difference.
- WeKan: "slow board with lots of swimlanes/lists"; "public board with many cards inaccessible";
  UI hangs causing data loss.
- Plane: React hydration errors on mobile browsers, self-hosted.
- Notion: **10,000-row hard read ceiling** that reports itself as a clean end-of-list.

[INFERENCE] The ceiling is not exotic. One multi-day festival with thirty positions is already at
Deck's reported degradation point.

### 7. Mobile is where these tools stop being tools — `recurring`

- Planka: mobile support requested 2020-08-12, **still open** in 2026 with 21 reactions.
- Plane: PWA requested and closed; hydration errors break mobile browsers on self-hosted.
- Nextcloud Deck: has the best mobile client in the open-source half, and its offline path has
  a documented history of silently discarding work created offline.
- Kanboard: no mobile client found; the only responsive-layout issues are a decade old.

### 8. Users of local-first tools ask for *manual* conflict resolution — `recurring`

AppFlowy [#5139](https://github.com/AppFlowy-IO/AppFlowy/issues/5139) and
[#8722](https://github.com/AppFlowy-IO/AppFlowy/issues/8722); Anytype
[#2141](https://github.com/anyproto/anytype-ts/issues/2141). Nobody asked for a smarter merge.
They asked to be shown the conflict.

### 9. The thing generic PM cannot do at all: re-time from actuals — `recurring` [CORPUS]

The corpus's event-manager dossier records the structural complaint about Trello / Asana / monday
/ MS Project in AV use: they do not re-time from actuals. "In real life, there will be changes and
the project timelines keep changing… Currently only manual timeline adjust is possible."
[[erpnext #54271](https://github.com/frappe/erpnext/issues/54271), 2026-04-14, **open**, read by
[`roles/event-manager.md`](../roles/event-manager.md)] A show runs eleven minutes long; nothing
downstream moves by itself.

### 10. What is bloat — the honest short list

Answering the segment brief's actual question. Marked INFERENCE throughout; this is judgement
built on the facts above, not a finding.

**Helps AV:** a shift object with start/end date-times and a crew (Basecamp shape); tokenised
revocable calendar feeds (OpenProject shape); CalDAV `VTODO` to the phone's native app (Vikunja
shape); card cloning for recurring shows (Deck #1813, 57 +1); shared master vocabularies across
projects (Plane #4706); a document/approval object with a client-visible state (Basecamp shape);
attachments that survive export.

**Bloat for AV:** portfolios and goals; percentage-based capacity allocation; story points,
cycles, sprints and burndown; automation builders; AI summarisation; per-project custom workflow
state machines; comment-thread notification storms; dependency graphs on tasks whose real
dependency is a truck arriving.

**The dividing line** [INFERENCE]: features that assume *the work is done at the computer where
the tool is* help nobody in AV. Features that assume *the work is done somewhere else and the tool
is a record of it* are the ones worth having.

---

## Direct quotes-of-substance

All paraphrased or quoted from a page I opened on **2026-08-29**. Nothing here is reconstructed
from memory.

1. **On open-core features being re-gated** — a self-hoster on Plane, 2025-10-31: in version 1
   OIDC was included for self-hosted deployments on the free tier; in version 2 it appears to have
   been moved behind a paywall, leaving organisations facing "a steep $8.00 per seat subscription
   just to implement a core authentication feature in what was previously open source software",
   and the change "sends a discouraging signal: features that were once freely available are now
   gated". (18 +1, still open.)
   [https://github.com/makeplane/plane/issues/8047](https://github.com/makeplane/plane/issues/8047)
   *Price figure is the user's claim, unverified against any vendor page.*

2. **On the size a board has to reach before it breaks** — Nextcloud Deck, 2020-05-02:
   "Every action take too much time if you have big number of cards" — on a board with **170
   cards**; the reporter's stated expectation is that a re-render "have to be completed in less
   then one second". Still open in 2026.
   [https://github.com/nextcloud/deck/issues/1780](https://github.com/nextcloud/deck/issues/1780)

3. **On migrating in and finding the tool cannot hold it** — Nextcloud Deck, 2023-11-06: a user
   migrated ~2,400 cards from Trello with a Python script, added a few hundred more, archived some,
   and reports the board is "greatly slowed down" with the impression that archived cards are
   still being loaded; deploying Redis to speed up Nextcloud overall "doesn't seem to have any
   effect on the DECK". Still open.
   [https://github.com/nextcloud/deck/issues/5259](https://github.com/nextcloud/deck/issues/5259)

4. **On a German public-sector deployment degrading after a routine update** — Nextcloud Deck,
   2026-07-17: after updating a Nextcloud AIO instance to 33.0.6 and Deck to 1.17.4, "our big
   shared Desk boards became unresponsive and every action needs some time to load"; the effect is
   visible from "more than 50 cards"; expected behaviour, in the reporter's words, "Snappy
   navigation". The attached configuration identifies a municipal instance.
   [https://github.com/nextcloud/deck/issues/8165](https://github.com/nextcloud/deck/issues/8165)

5. **On the browser giving up entirely** — Nextcloud Deck, 2026-07-31: "the browser goes OOM due
   to high number of Upcoming cards for a user"; it never finishes loading at 4,107 cards; the
   reporter suggests that above ~200 the app should show a simple list of links instead.
   [https://github.com/nextcloud/deck/issues/8226](https://github.com/nextcloud/deck/issues/8226)

6. **On what a freelancer actually needs, asked in 2017 and still open** — Nextcloud Deck #14:
   in addition to sharing with internal users, it should be possible to share a board by generating
   a public link, as the Files app does; the link should be password-protectable, with write
   permission for guest users toggleable; the public view should show the board without the
   sidebar and without management-only functionality. **184 +1, 42 comments, opened 2017-02-01,
   last activity 2026-08-19, open.**
   [https://github.com/nextcloud/deck/issues/14](https://github.com/nextcloud/deck/issues/14)

7. **On a due date not being a call time** — Nextcloud Deck, 2026-06-09, open: request for
   "enhanced compatibility with calendar including having start date and time".
   [https://github.com/nextcloud/deck/issues/8040](https://github.com/nextcloud/deck/issues/8040)

8. **On local-first tools losing data** — AppFlowy, 2026-04-05: a bug report describing restarting
   cloud services while in offline / non-logged-in mode causing "all save files to be irrecoverably
   lost"; the reporter calls the behaviour "extremely malicious".
   [https://github.com/AppFlowy-IO/AppFlowy/issues/8635](https://github.com/AppFlowy-IO/AppFlowy/issues/8635)
   And, still open, 2026-01-26: "Sync is unreliable and leads to data loss" (16 comments).
   [https://github.com/AppFlowy-IO/AppFlowy/issues/8455](https://github.com/AppFlowy-IO/AppFlowy/issues/8455)

9. **On owning your data right up until you move it** — AppFlowy, 2026-01-04, open: "Local data
   cannot be loaded after being copied to another computer."
   [https://github.com/AppFlowy-IO/AppFlowy/issues/8416](https://github.com/AppFlowy-IO/AppFlowy/issues/8416)

10. **On self-hosted upgrades eating your data** — WeKan, 2026-08-11, 25 comments: "Missing Data
    after Upgrade vom v6 to latest Release".
    [https://github.com/wekan/wekan/issues/6583](https://github.com/wekan/wekan/issues/6583)
    And 2026-04-21, 27 comments: "UI hangs / extremely slow load times (cache-related?) **causing
    data loss in active sessions** (all 8.x versions)".
    [https://github.com/wekan/wekan/issues/6307](https://github.com/wekan/wekan/issues/6307)

11. **On a migration that breaks and does not fix itself** — Planka, 2026-06-15: "Migration from
    1.x to 2.x breaks existing data without automatic fix".
    [https://github.com/plankanban/planka/issues/1697](https://github.com/plankanban/planka/issues/1697)

12. **On mobile, asked in 2020 and still open** — Planka #19, "[Feature Request] Mobile Support",
    opened 2020-08-12, 21 reactions, 23 comments, open on 2026-08-29.
    [https://github.com/plankanban/planka/issues/19](https://github.com/plankanban/planka/issues/19)

13. **On Atlassian removing an API out from under its ecosystem** — atlassian-python-api,
    2025-09-11: calling `jira.jql()` now returns "The requested API has been removed. Please
    migrate to the /rest/api/3/search/jql API", pointing at Atlassian changelog CHANGE-2046. The
    same removal produced a warning issue in January 2025 and users were still filing against it
    in April 2026.
    [https://github.com/atlassian-api/atlassian-python-api/issues/1586](https://github.com/atlassian-api/atlassian-python-api/issues/1586)

14. **On a versioned cloud API breaking a major integration** — n8n, opened 2025-09-12, still open:
    "Breaking issue: Notion Node does not support latest Notion API (2025-09-03)".
    [https://github.com/n8n-io/n8n/issues/19489](https://github.com/n8n-io/n8n/issues/19489)

15. **On a read limit that does not announce itself** — Notion's own JS SDK README, on
    `iterateAllDataSourceRows`: it exists to read "beyond the limit for a single data source query,
    which is 10,000 by default. At that limit, `has_more` is `false` and `request_status.type` is
    `"incomplete"`; ordinary pagination stops." The workaround sorts by `created_time`, re-queries
    from the last row's timestamp, and removes duplicate rows by ID.
    [https://github.com/makenotion/notion-sdk-js](https://github.com/makenotion/notion-sdk-js)

16. **On sync tokens and a truck without signal** — Asana's own OpenAPI specification:
    "Sync tokens always expire after 24 hours, but may expire sooner, depending on load on the
    service", and on `412 Precondition Failed` "this signals you may need to re-crawl the data";
    separately, "events are retrievable from the event stream for 24 hours after being processed"
    and "webhooks cannot be replayed once delivered".
    [https://github.com/Asana/openapi](https://github.com/Asana/openapi) (`defs/asana_oas.yaml`)

17. **On batching not being a way round the rate limit** — the same specification: a batch request
    "counts against *both* the standard rate limiter and the concurrent request limiter as though
    you had made a separate HTTP request for every individual action", and if any action would
    exceed a limit "the *entire* request will fail with a `429 Too Many Requests` error".
    [https://github.com/Asana/openapi](https://github.com/Asana/openapi)

18. **On a rate limit shared by everyone behind one router** — Basecamp's API reference: "the first
    rate limit you'll commonly encounter is currently 50 requests per 10 second period per IP
    address", with "multiple rate limits… e.g. for GET vs POST requests and per-second/hour/day
    limits", "adjusted dynamically".
    [https://github.com/basecamp/bc3-api](https://github.com/basecamp/bc3-api)

19. **On an offline PWA that is only a shell** — Vikunja's service worker registers build assets
    with `StaleWhileRevalidate` and then registers a `NetworkOnly` strategy with `cache: 'no-store'`
    for the API routes. The app loads without a network; the data does not.
    [https://github.com/go-vikunja/vikunja/blob/main/frontend/src/sw.ts](https://github.com/go-vikunja/vikunja/blob/main/frontend/src/sw.ts)

20. **On a hosted service ending** — Huly's platform README: "Hosted Huly is shutting down — please
    migrate your data. The hosted Huly service is being discontinued because its hosting is no
    longer being funded… The service shutdown is expected on July 20." Self-hosted deployments are
    unaffected.
    [https://github.com/hcengineering/platform](https://github.com/hcengineering/platform)

21. **On a recommended alternative being abandoned** — Focalboard's README banner: "This repository
    is currently not maintained. If you're interested in becoming a maintainer please let us know
    here." Only the Mattermost plugin continues.
    [https://github.com/mattermost/focalboard](https://github.com/mattermost/focalboard)

22. **On generic PM not re-timing from actuals** — carried from
    [`roles/event-manager.md`](../roles/event-manager.md), which read
    [erpnext #54271](https://github.com/frappe/erpnext/issues/54271) (2026-04-14, open): "In real
    life, there will be changes and the project timelines keep changing… Currently only manual
    timeline adjust is possible."

---

## What to verify next (the honest to-do list)

Ordered by how much a wrong assumption would cost.

1. **Smartsheet's licensed-user vs free-collaborator model.** If a free collaborator can *edit*,
   Smartsheet is the only mainstream product whose licence model survives a freelance crew, and
   that changes the competitive picture. `https://www.smartsheet.com/pricing`
2. **Every price in the segment.** None was verified. Asana, Basecamp, monday, Notion, Airtable,
   Smartsheet, Linear, Plane, Vikunja Cloud, OpenProject Cloud.
3. **Notion's offline mode** — what it actually caches, and whether it is editable offline.
4. **Linear's local sync store** — is the desktop client genuinely offline-capable? If so it is
   the only mainstream product in the segment that is.
5. **monday.com and Airtable offline behaviour on iOS/Android.** Unknowable from GitHub.
6. **Review-site "Cons" fields and the subreddits.** The entire UX / adoption / support / support-
   response dimension of this dossier is missing and cannot be filled from a code forge.
7. **German-language practitioner sources.** Zero were reachable; for a German-market product this
   is the largest single gap in the pass.
8. **StudioBinder / Yamdu / SetKeeper / Croo**, and whether the "Universal Schedule Standard"
   exists in any public form.

---

## Sources

Every URL below was opened on **2026-08-29** and its content read. Grouped by kind. URLs that were
*attempted and refused by the egress proxy* are listed separately at the end, because a blocked
source is part of the method, not a source.

### Vendor specifications, API references and SDK documentation (primary)

- https://github.com/Asana/openapi — `defs/asana_oas.yaml` fetched via
  https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml (3.15 MB); read the
  Events/sync-token section, the batch-API rate-limiting section, `AllocationBase`, task date
  fields, the 100 MB attachment note, the Exports section and the `TooManyRequests` response
- https://github.com/basecamp/bc3-api — README (rate limits, pagination, caching, auth)
- https://github.com/basecamp/bc3-api/blob/master/sections/schedule_entries.md
- https://github.com/basecamp/bc3-api/blob/master/sections/schedules.md
- https://github.com/basecamp/bc3-api/blob/master/sections/client_approvals.md
- https://github.com/makenotion/notion-sdk-js — README (retry policy, 10,000-row data-source
  limit, API versions `2025-09-03` / `2026-03-11` and the renamed fields)
- https://github.com/Airtable/airtable.js — README
- https://github.com/Airtable/airtable.js/blob/master/src/run_action.ts — 429 handling with
  exponential backoff and jitter
- https://github.com/mondaycom/monday-sdk-js — README
- https://github.com/mondaycom/monday-graphql-api — README
- https://github.com/mondaycom/monday-graphql-api/blob/main/packages/api/README.md — SDK types
  pinned to the API version current at release
- https://github.com/smartsheet/smartsheet-javascript-sdk — README

### Project READMEs (primary)

- https://github.com/nextcloud/deck — README (mobile clients, integrations)
- https://github.com/stefan-niedermann/nextcloud-deck — README ("Works offline")
- https://github.com/go-vikunja/vikunja — README (v2.5.0; Vikunja Pro gating; LLM-assisted
  development note)
- https://github.com/go-vikunja/vikunja/blob/main/frontend/src/sw.ts — service worker
- https://github.com/mattermost/focalboard — README (unmaintained banner)
- https://github.com/hcengineering/platform — README (hosted Huly shutdown banner)

### Issue trackers (primary practitioner evidence)

Nextcloud Deck (server): [#14](https://github.com/nextcloud/deck/issues/14) ·
[#855](https://github.com/nextcloud/deck/issues/855) ·
[#955](https://github.com/nextcloud/deck/issues/955) ·
[#1104](https://github.com/nextcloud/deck/issues/1104) ·
[#1252](https://github.com/nextcloud/deck/issues/1252) ·
[#1261](https://github.com/nextcloud/deck/issues/1261) ·
[#1780](https://github.com/nextcloud/deck/issues/1780) ·
[#1813](https://github.com/nextcloud/deck/issues/1813) ·
[#2107](https://github.com/nextcloud/deck/issues/2107) ·
[#2175](https://github.com/nextcloud/deck/issues/2175) ·
[#2661](https://github.com/nextcloud/deck/issues/2661) ·
[#3710](https://github.com/nextcloud/deck/issues/3710) ·
[#4082](https://github.com/nextcloud/deck/issues/4082) ·
[#4329](https://github.com/nextcloud/deck/issues/4329) ·
[#5259](https://github.com/nextcloud/deck/issues/5259) ·
[#6046](https://github.com/nextcloud/deck/issues/6046) ·
[#6741](https://github.com/nextcloud/deck/issues/6741) ·
[#7187](https://github.com/nextcloud/deck/issues/7187) ·
[#7382](https://github.com/nextcloud/deck/issues/7382) ·
[#8040](https://github.com/nextcloud/deck/issues/8040) ·
[#8165](https://github.com/nextcloud/deck/issues/8165) ·
[#8226](https://github.com/nextcloud/deck/issues/8226) ·
[#8282](https://github.com/nextcloud/deck/issues/8282)

Nextcloud Deck (Android): [#22](https://github.com/stefan-niedermann/nextcloud-deck/issues/22) ·
[#165](https://github.com/stefan-niedermann/nextcloud-deck/issues/165) ·
[#196](https://github.com/stefan-niedermann/nextcloud-deck/issues/196) ·
[#197](https://github.com/stefan-niedermann/nextcloud-deck/issues/197) ·
[#378](https://github.com/stefan-niedermann/nextcloud-deck/issues/378) ·
[#438](https://github.com/stefan-niedermann/nextcloud-deck/issues/438) ·
[#439](https://github.com/stefan-niedermann/nextcloud-deck/issues/439) ·
[#1061](https://github.com/stefan-niedermann/nextcloud-deck/issues/1061) ·
[#1374](https://github.com/stefan-niedermann/nextcloud-deck/issues/1374) ·
[#1744](https://github.com/stefan-niedermann/nextcloud-deck/issues/1744) ·
[#1847](https://github.com/stefan-niedermann/nextcloud-deck/issues/1847)

Plane: [#1005](https://github.com/makeplane/plane/issues/1005) ·
[#1212](https://github.com/makeplane/plane/issues/1212) ·
[#1280](https://github.com/makeplane/plane/issues/1280) ·
[#1495](https://github.com/makeplane/plane/issues/1495) ·
[#2733](https://github.com/makeplane/plane/issues/2733) ·
[#3372](https://github.com/makeplane/plane/issues/3372) ·
[#4706](https://github.com/makeplane/plane/issues/4706) ·
[#4866](https://github.com/makeplane/plane/issues/4866) ·
[#5551](https://github.com/makeplane/plane/issues/5551) ·
[#5941](https://github.com/makeplane/plane/issues/5941) ·
[#6623](https://github.com/makeplane/plane/issues/6623) ·
[#7319](https://github.com/makeplane/plane/issues/7319) ·
[#8047](https://github.com/makeplane/plane/issues/8047) ·
[#8123](https://github.com/makeplane/plane/issues/8123) ·
[#8147](https://github.com/makeplane/plane/issues/8147) ·
[#8598](https://github.com/makeplane/plane/issues/8598) ·
[#8775](https://github.com/makeplane/plane/issues/8775) ·
[#8782](https://github.com/makeplane/plane/issues/8782) ·
[#8794](https://github.com/makeplane/plane/issues/8794) ·
[#8867](https://github.com/makeplane/plane/issues/8867)

Planka: [#19](https://github.com/plankanban/planka/issues/19) ·
[#1281](https://github.com/plankanban/planka/issues/1281) ·
[#1518](https://github.com/plankanban/planka/issues/1518) ·
[#1519](https://github.com/plankanban/planka/issues/1519) ·
[#1522](https://github.com/plankanban/planka/issues/1522) ·
[#1623](https://github.com/plankanban/planka/issues/1623) ·
[#1697](https://github.com/plankanban/planka/issues/1697) ·
[#1701](https://github.com/plankanban/planka/issues/1701)

Leantime: [#268](https://github.com/Leantime/leantime/issues/268) ·
[#345](https://github.com/Leantime/leantime/issues/345) ·
[#420](https://github.com/Leantime/leantime/issues/420) ·
[#658](https://github.com/Leantime/leantime/issues/658) ·
[#783](https://github.com/Leantime/leantime/issues/783) ·
[#1143](https://github.com/Leantime/leantime/issues/1143) ·
[#1480](https://github.com/Leantime/leantime/issues/1480) ·
[#2034](https://github.com/Leantime/leantime/issues/2034) ·
[#2273](https://github.com/Leantime/leantime/issues/2273) ·
[#2912](https://github.com/Leantime/leantime/issues/2912) ·
[#2974](https://github.com/Leantime/leantime/issues/2974) ·
[#3016](https://github.com/Leantime/leantime/issues/3016) ·
[#3033](https://github.com/Leantime/leantime/issues/3033) ·
[#3284](https://github.com/Leantime/leantime/issues/3284) ·
[#3706](https://github.com/Leantime/leantime/issues/3706)

WeKan: [#2636](https://github.com/wekan/wekan/issues/2636) ·
[#5132](https://github.com/wekan/wekan/issues/5132) ·
[#5944](https://github.com/wekan/wekan/issues/5944) ·
[#6089](https://github.com/wekan/wekan/issues/6089) ·
[#6146](https://github.com/wekan/wekan/issues/6146) ·
[#6307](https://github.com/wekan/wekan/issues/6307) ·
[#6468](https://github.com/wekan/wekan/issues/6468) ·
[#6521](https://github.com/wekan/wekan/issues/6521) ·
[#6583](https://github.com/wekan/wekan/issues/6583)

Kanboard: [#1461](https://github.com/kanboard/kanboard/issues/1461) ·
[#2814](https://github.com/kanboard/kanboard/issues/2814)

Vikunja: [#169](https://github.com/go-vikunja/vikunja/issues/169)

AppFlowy: [#1310](https://github.com/AppFlowy-IO/AppFlowy/issues/1310) ·
[#5139](https://github.com/AppFlowy-IO/AppFlowy/issues/5139) ·
[#7872](https://github.com/AppFlowy-IO/AppFlowy/issues/7872) ·
[#8207](https://github.com/AppFlowy-IO/AppFlowy/issues/8207) ·
[#8416](https://github.com/AppFlowy-IO/AppFlowy/issues/8416) ·
[#8455](https://github.com/AppFlowy-IO/AppFlowy/issues/8455) ·
[#8635](https://github.com/AppFlowy-IO/AppFlowy/issues/8635) ·
[#8722](https://github.com/AppFlowy-IO/AppFlowy/issues/8722)

Anytype: [#2141](https://github.com/anyproto/anytype-ts/issues/2141)

NocoDB (as evidence about Airtable export/lock-in):
[#4642](https://github.com/nocodb/nocodb/issues/4642) ·
[#5599](https://github.com/nocodb/nocodb/issues/5599) ·
[#6465](https://github.com/nocodb/nocodb/issues/6465) ·
[#6611](https://github.com/nocodb/nocodb/issues/6611) ·
[#7632](https://github.com/nocodb/nocodb/issues/7632) ·
[#7645](https://github.com/nocodb/nocodb/issues/7645) ·
[#8798](https://github.com/nocodb/nocodb/issues/8798) ·
[#9402](https://github.com/nocodb/nocodb/issues/9402) ·
[#10230](https://github.com/nocodb/nocodb/issues/10230)

n8n (as evidence about commercial APIs): Notion —
[#19489](https://github.com/n8n-io/n8n/issues/19489) ·
[#24006](https://github.com/n8n-io/n8n/issues/24006) ·
[#25202](https://github.com/n8n-io/n8n/issues/25202) ·
[#27420](https://github.com/n8n-io/n8n/issues/27420) ·
[#27723](https://github.com/n8n-io/n8n/issues/27723) ·
[#30524](https://github.com/n8n-io/n8n/issues/30524) ·
[#30581](https://github.com/n8n-io/n8n/issues/30581) ·
[#34590](https://github.com/n8n-io/n8n/issues/34590);
Asana — [#10740](https://github.com/n8n-io/n8n/issues/10740) ·
[#23168](https://github.com/n8n-io/n8n/issues/23168) ·
[#27245](https://github.com/n8n-io/n8n/issues/27245) ·
[#36273](https://github.com/n8n-io/n8n/issues/36273);
Airtable — [#13281](https://github.com/n8n-io/n8n/issues/13281) ·
[#17850](https://github.com/n8n-io/n8n/issues/17850) ·
[#22999](https://github.com/n8n-io/n8n/issues/22999) ·
[#30557](https://github.com/n8n-io/n8n/issues/30557) ·
[#32171](https://github.com/n8n-io/n8n/issues/32171);
Jira — [#17692](https://github.com/n8n-io/n8n/issues/17692) ·
[#18078](https://github.com/n8n-io/n8n/issues/18078);
monday — [#3612](https://github.com/n8n-io/n8n/issues/3612) ·
[#8531](https://github.com/n8n-io/n8n/issues/8531)

atlassian-python-api (as evidence about Jira Cloud):
[#880](https://github.com/atlassian-api/atlassian-python-api/issues/880) ·
[#988](https://github.com/atlassian-api/atlassian-python-api/issues/988) ·
[#1268](https://github.com/atlassian-api/atlassian-python-api/issues/1268) ·
[#1500](https://github.com/atlassian-api/atlassian-python-api/issues/1500) ·
[#1569](https://github.com/atlassian-api/atlassian-python-api/issues/1569) ·
[#1586](https://github.com/atlassian-api/atlassian-python-api/issues/1586) ·
[#1632](https://github.com/atlassian-api/atlassian-python-api/issues/1632)

Asana Python client: [#124](https://github.com/Asana/python-asana/issues/124) ·
[#135](https://github.com/Asana/python-asana/issues/135)

Notion JS SDK: [#265](https://github.com/makenotion/notion-sdk-js/issues/265)

### In-corpus secondary sources (each carries its own cited provenance)

- [`docs/research/landscape/project-management.md`](../landscape/project-management.md)
- [`docs/research/roles/event-manager.md`](../roles/event-manager.md) — including its citation of
  [erpnext #54271](https://github.com/frappe/erpnext/issues/54271)
- [`docs/research/roles/camera-operator.md`](../roles/camera-operator.md) — StudioBinder reception
- [`docs/research/roles/production-manager.md`](../roles/production-manager.md) — prior OpenProject
  searches
- [`docs/research/METHOD.md`](../METHOD.md)

### Attempted and refused by the egress proxy on 2026-08-29 (not sources — method)

`www.reddit.com` · `old.reddit.com` · `www.g2.com` · `www.capterra.com` · `www.trustradius.com` ·
`stackoverflow.com` · `news.ycombinator.com` · `en.wikipedia.org` · `community.openproject.org` ·
`www.openproject.org` · `community.vikunja.io` · `kolaente.dev` · `codeberg.org` ·
`help.nextcloud.com` · `community.nextcloud.com` · `discuss.linear.app` · `forum.obsproject.com` ·
`3.basecamp-help.com` · `status.asana.com` · `status.notion.so` · `status.airtable.com` ·
`docs.gitlab.com` · `forum.blackmagicdesign.com`
