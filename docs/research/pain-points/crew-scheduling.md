# Pain points: Crew Scheduling / Freelancer Dispatch / Timesheets

> Research date: **2026-08-29**. Claims labelled per [`docs/research/METHOD.md`](../METHOD.md):
> **FACT** (read on a page I actually opened, URL given), **INFERENCE** (my reasoning from those
> facts), **UNKNOWN** (could not be checked in this environment).
> Frequency grades: `isolated` / `recurring` / `widespread`, per the METHOD.md rubric.

---

## Method

### What I could actually reach — read this before trusting any grade below

This pass ran under the same research blackout as the landscape pass for this segment, plus one
new limit:

1. **The session web-search budget was already exhausted** (200 of 200 `WebSearch` calls) before
   this segment started. No search engine was available at any point.
2. **The egress proxy blocks essentially every non-GitHub domain.** Verified by direct probe in
   this session (each returned `EGRESS_BLOCKED`): `duckduckgo.com`, `www.trustpilot.com`,
   `www.capterra.com`, `developer.deputy.com`, `openapi.planday.com`, `www.kimai.org`.
   `www.reddit.com` returned a hard fetch refusal.
3. **What worked:** `github.com` (repo pages, issue lists, issue detail pages, org repo lists,
   `github.com/search?type=issues`), `raw.githubusercontent.com`, and the GitHub search API via
   MCP tooling. Roughly two thirds of the way through, `github.com/search` began returning
   HTTP 429 with `Retry-After: 3600`; the MCP search API kept working.

**Consequences, stated plainly:**

- **Angles 1, 2, 4, 5 and 6 of the brief could not be executed.** No Reddit, no
  G2/Capterra/GetApp/TrustRadius/Trustpilot "Cons" fields, no AV forums (ProSoundWeb, Blue Room,
  Control Booth), no German-language sources (film-tv-video.de, production-partner.de,
  veranstaltungstechnik forums), and no vendor changelogs or status pages — every one of those
  domains is on the wrong side of the proxy.
- **Angle 3 (GitHub issues, discussions, and API-wrapper libraries) was executed fully**, and is
  the entire evidential basis of this dossier. That is a real and unusually honest source class —
  an open issue with a reproduction and a date is stronger evidence than a star rating — but it is
  **one source type**. Per METHOD.md, `recurring` normally wants "several independent sources,
  ideally of different types". I could not get different types. I have therefore graded
  conservatively: a finding is only `recurring` if it appears in **several independent
  repositories or across several years and several issues**, and only `widespread` if it is a
  **structural fact verifiable across multiple vendors** (e.g. an SDK that does not exist in four
  vendor GitHub orgs) or a vendor-acknowledged limitation.
- **There is not one verified price in this dossier.** Not a single pricing page was reachable.
  Every pricing claim below is either an artefact of the source code/licence (which I could read)
  or marked UNKNOWN. Do not let a price appear here later without re-checking the live page.
- **For Deputy, Connecteam and Planday there is almost no user-complaint evidence available in
  this environment at all.** What I *can* report about them is structural, and it is genuinely
  informative — see "The SDK that does not exist" — but it is not user sentiment. Anyone reading
  this to size those three products should treat their sections as near-empty and re-run the
  review-site and Reddit angles when search is available.

### Sources actually opened

**32 distinct pages/queries opened** across 9 repositories and 3 GitHub orgs:

| Source class | Count | Which |
| --- | --- | --- |
| OSS product issue trackers | 6 repos | `kimai/kimai`, `frappe/hrms`, `ever-co/ever-gauzy`, `solidtime-io/solidtime`, `TimefoldAI/timefold-solver`, `TimefoldAI/timefold-quickstarts` |
| Third-party API-wrapper repos | 4 repos | `Alternative-Design-And-Media/rentman-api-connector`, `communityds/deputy-api-wrapper`, `google/deputy-api-python-client`, `Jarvis0p/connectcli`, `at-gmbh/personio-py` |
| Vendor GitHub orgs (existence/SDK check) | 4 | `deputy`, `planday`, `Connecteam`, `rentman` (does not exist) |
| Raw repo files (README, UPGRADING, CHANGELOG) | 4 | Kimai `README.md` + `UPGRADING.md`, rentman-connector `README.md`, deputy-wrapper `README.md` |
| Cross-GitHub issue searches | 6 | `"Deputy API"`, `Planday api`, `"Connecteam" api`, `"Clockify" api rate limit`, `rentman api`, `kimai mobile offline` |
| GitHub Discussions | 1 | `kimai/kimai` discussions |

---

## Per-product findings

### Kimai (2.x, AGPL-3.0 self-hosted + paid cloud)

The best-evidenced product in this segment, because its issue tracker is public, busy and old.

**STRENGTHS (conceded even in complaint threads)**

- FACT: complaint threads routinely open with praise — issue #4239 opens "just want to say thanks
  for the fantastic product"; #1520 opens "First I would like to say thank you for this project";
  #4239's author frames the midnight problem as a nicety, not a blocker.
  (<https://github.com/kimai/kimai/issues/4239>, <https://github.com/kimai/kimai/issues/1520>)
- FACT: the timesheet rate model is genuinely rich — `rate`, `internalRate`, `hourlyRate`,
  `fixedRate` are all first-class API fields (visible in the 2.66.0 upgrade note that
  permission-gates them). No competitor in this segment verified four rate fields.
  (<https://raw.githubusercontent.com/kimai/kimai/main/UPGRADING.md>)
- FACT: the export lock is real and enforced end-to-end — a whole class of bugs exists *because*
  exported entries are immutable (#5642 "Error on Quick Entry page when there are exported
  times"). A product with no lock would not generate that bug.
  (<https://github.com/kimai/kimai/issues/5642>)

**WEAKNESSES**

- FACT, `recurring`: **upgrades break installations.** The Discussions front page is dominated by
  post-upgrade failure threads — login failures after upgrading to 2.58.0–2.60.0, HTTP 500 after
  update, invoice template images failing to display after an update, and a PHP-version floor
  users tripped over. (<https://github.com/kimai/kimai/discussions>)
- FACT, `recurring`: **breaking API changes remove data from responses without a version bump.**
  `UPGRADING.md` records that in **2.66.0** the `rate`, `internalRate`, `hourlyRate` and
  `fixedRate` fields are *removed from JSON responses* when the caller lacks
  `view_rate_own_timesheet` / `view_rate_other_timesheet`, and that these "should now be treated
  as optional". In **2.65.0** three endpoints (`POST /api/customers/{id}/team`,
  `/projects/{id}/team`, `/activities/{id}/team`) were removed and now return `410 Gone`.
  (<https://raw.githubusercontent.com/kimai/kimai/main/UPGRADING.md>)
  INFERENCE: an integration that reads rates will silently start seeing `undefined` rather than
  an error, which is the worst failure mode for a payroll export.
- FACT, `isolated` but structurally serious: **export totals do not match the sum of the rounded
  entries** — issue #6039, opened 2026-07-09, still open at time of writing.
  (<https://github.com/kimai/kimai/issues/6039>)
- FACT, `isolated`: **export marking interacts badly with rounding settings** — #3633, open since
  2022-11-15, 8 comments, still open. (<https://github.com/kimai/kimai/issues/3633>)
- FACT, `isolated`: **non-billable tasks appear as revenue in reports** — #5920, open since
  2026-04-24. (<https://github.com/kimai/kimai/issues/5920>)
- FACT, `recurring`: **timezone handling is a live defect class** — #5617 "Timezone Bug" open
  since 2025-08-26; #4962 "Document how timezones work (reporting pages)" open since 2024, still
  being commented on in 2025-12. (<https://github.com/kimai/kimai/issues/5617>,
  <https://github.com/kimai/kimai/issues/4962>)
- FACT, `isolated`: **a project's end date blocks back-dated entry** — #5851, "After project end,
  time entry no longer possible, even when dating back", open since 2026-03-02.
  (<https://github.com/kimai/kimai/issues/5851>)
  INFERENCE: for AV this is exactly wrong — crew file their hours *after* the job closes.

**MISSING FEATURES (what users request)**

Ranked by thumbs-up from the GitHub search API, which returns real reaction counts:

| Issue | Title | +1 | Open since |
| --- | --- | --- | --- |
| #5287 | Calendar Integration (Outlook, two-way sync) | 10 (16 reactions total) | 2025-01-08 |
| #1407 | Webhooks integration | 11 | **2020-01-22** |
| #2864 | Lexoffice API connection (German accounting) | 7 | 2021-10-18 |
| #309 | Custom rates for custom time ranges | 4 | **2018-09-13** |
| #3665 | Connect with Payroll provider | 1, 11 comments | 2022-12-01 |
| #1560 | PWA support to allow desktop installation | — | **2020-03-16** |
| #5800 | API token access control for users | 1 | 2026-01-29 |

- FACT: #5287's author wants to "export the timesheet entries into my for instance outlook
  calender. Brilliant would be an direct integration and sync in both directions" (paraphrased
  from the issue body). It is labelled `calendar` + `feature request`, unassigned, no linked PR.
  (<https://github.com/kimai/kimai/issues/5287>)
- FACT: #1407's author wants "notification from kimai in other apps when user starts/stops
  activity", and notes the only alternatives are building a dedicated app or polling the REST API.
  Marked "Planned" on the roadmap board; **unassigned since January 2020**.
  (<https://github.com/kimai/kimai/issues/1407>)
- FACT, `recurring`: calendar sync is requested **five separate times over eight years** — #361
  "Caldav sync" (2018-10-19), #1009 "webcal/ical calendar next to Google Calendar" (2019-08-05),
  #1789 "Calendar subscription" (2020-06-24), #5287 (2025-01-08), plus #1407 as the generic
  integration escape hatch. All still open.
  (<https://github.com/kimai/kimai/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc>)
- FACT, `isolated`: **split entries that cross midnight** — #4239, 2023-08-14. The author runs
  shifts "start at 21:00 day 1, and ends at 03:00 day 2", gets 6 hours attributed to day 1, and
  currently works around it by hand-entering 21:00–23:59 and 00:00–03:00, which also corrupts
  their break deductions and overtime overview.
  (<https://github.com/kimai/kimai/issues/4239>)

**UX PROBLEMS**

- FACT: #5762 "Tiny font on very large timesheet entries" (2026-01-05) — the UI degrades on the
  long entries that a 14-hour shoot day produces. (<https://github.com/kimai/kimai/issues/5762>)
- FACT: #5348 — Quick Entry across multiple projects sets the same start time for every row
  (2025-02-11). (<https://github.com/kimai/kimai/issues/5348>)
- FACT: #5867 — users ask for a **grid-style daily entry across multiple projects**, because the
  current form is one-entry-at-a-time (2026-03-11).
  (<https://github.com/kimai/kimai/issues/5867>)
- FACT: #3993 "No date in form in duration mode" — 26 comments, open since 2023-04-28, one of the
  most-argued issues in the tracker. (<https://github.com/kimai/kimai/issues/3993>)
- FACT: #4865 — a stopped timer still shows as "started" in other browser tabs (2024-05-17).
  (<https://github.com/kimai/kimai/issues/4865>)
- FACT (Discussions): timesheet validation hides recent activities in Quick Entry; markdown is
  interpreted inconsistently. (<https://github.com/kimai/kimai/discussions>)

**PERFORMANCE PROBLEMS**

- FACT: a targeted search for open issues matching `slow OR performance OR timeout OR memory`
  returned **zero open results** — the matches were all closed.
  (<https://github.com/kimai/kimai/issues?q=is%3Aissue+is%3Aopen+slow+OR+performance+OR+timeout+OR+memory>)
  INFERENCE: Kimai is not fighting a scale problem in the open. Per METHOD.md's complaint-bias
  warning, absence of complaints is not proof of speed, but it is a fair read that performance is
  not this product's weak axis.
- FACT: the visible instability is **operational, not algorithmic** — HTTP 500s and login failures
  after upgrade, not slow queries. (<https://github.com/kimai/kimai/discussions>)

**PRICING PROBLEMS**

- FACT: Kimai is AGPL-3.0 and self-hostable for free, but **features have been moved out of the
  free product into a paid plugin**: `UPGRADING.md` for 2.0 records that "Invoice renderers for
  XML, JSON, and TEXT moved to paid Extended Invoicing plugin".
  (<https://raw.githubusercontent.com/kimai/kimai/main/UPGRADING.md>)
  INFERENCE: this is the single sharpest pricing finding available for any product in this
  segment — a machine-readable invoice export was a free feature and became a paid one. For
  anyone building an automated crew-invoice pipeline, that is a direct tax.
- FACT: the README points to a paid cloud (`kimai.cloud`) and a "paid and free plugin
  marketplace". (<https://raw.githubusercontent.com/kimai/kimai/main/README.md>)
- UNKNOWN: every actual figure. `kimai.org` and `kimai.cloud` are proxy-blocked. Nothing about
  seat limits, cloud tiers, or plugin prices could be verified.

**LOCK-IN**

- FACT: low on the licence axis (AGPL-3.0, self-hosted, MySQL/MariaDB behind it), high on the
  **upgrade** axis: 2.0 required deleting and reinstalling every plugin (`rm -r var/plugins/*`)
  and recreating `local.yaml`; `duration_only` tracking mode was removed outright; role names were
  force-uppercased. (<https://raw.githubusercontent.com/kimai/kimai/main/UPGRADING.md>)
- FACT: export formats are CSV/XLSX/PDF/HTML with a `PATCH /timesheets/{id}/export` lock —
  genuinely open — but the XML/JSON invoice renderers are behind the paid plugin (above).

**OFFLINE**

- FACT: **Kimai is browser-only and has no offline mode.** #1560 "PWA Support to allow Desktop
  installation" has been open since **2020-03-16**; #198 "Kimai2 android app" since 2018-07-04.
  (<https://github.com/search?q=kimai+mobile+app+offline&type=issues>)
  INFERENCE: for a crew member in a truck park, a loading dock or a stadium bowl with no signal,
  Kimai is unusable at the moment the hours are actually worked. Hours get written on paper and
  re-keyed later — the exact double-entry the AV Planner Suite research corpus keeps finding.

**INTEGRATION PROBLEMS**

- FACT, `recurring`: the top three open feature requests by reaction count are *all* integration
  requests (calendar #5287, webhooks #1407, Lexoffice #2864), and the payroll connector (#3665)
  has been open since 2022 with 11 comments.
- FACT: the 2.x API-token migration broke callers — #4774 "New API tokens fail with insufficient
  permissions", **24 comments**, opened 2024-04-11. One reporter had "copied the code from the API
  example 1:1 and just inserted my token" and still got "Full authentication is required".
  Resolved via PR #4749. (<https://github.com/kimai/kimai/issues/4774>)
- FACT: #3986 — rates are readable via the API by a user who has no right to see rates in the UI
  (open since 2023-04-25). A permissions leak through the integration surface.
  (<https://github.com/kimai/kimai/issues/3986>)

---

### Frappe HR (`frappe/hrms`, GPL-3.0 self-hosted)

**STRENGTHS**

- FACT: the widest verified functional coverage in the segment (Shift Request as an approvable
  document, graded+dated skills, Travel Itinerary with lodging fields) — established in the
  landscape pass by reading the source, and nothing in the issue tracker contradicts it.
- FACT: the release cadence is high and correctness-focused — v16.13.0 through v16.17.0 all
  carry attendance/shift/payroll fixes. (<https://github.com/frappe/hrms/releases>)

**WEAKNESSES**

- FACT, `recurring`: **the shift model was built one employee at a time and rostering was bolted
  on later.** Issue #7 "Roster Management and Shift Planning" — **11 thumbs-up, the most-reacted
  shift issue in the repo**, opened 2021-11-10, closed only in 2024-12 — states that shift
  management is "designed to run for 1 employee at a time", and asks for bulk assignment beyond
  data import, a visual calendar, capacity/backup tracking, hierarchical shift times
  (company → group → location) instead of per-employee, role-based assignment (cashier, manager,
  …), automated assignment rules, and comparison of actual worked hours against scheduled.
  (<https://github.com/frappe/hrms/issues/7>)
  Corroborated by #1036 "Employee Roster for Shifts" (16 comments, 3 +1, 2023-11-04), where an
  outside contributor offered a roster system they had already built at their own company because
  the product did not have one. (<https://github.com/frappe/hrms/issues/1036>)
- FACT, `recurring`: **auto-attendance mis-marks people.** #3349 "Auto Attendance: Certain Shifts
  being skipped from marking absent" (2025-07-15); #3268 "Auto attendance marking offday as
  absent" (2025-06-20, 5 comments); #4866 "half_day_status automatically changes from Present to
  Absent after saving Half Day Attendance" (2026-07-07); #125 "When more than one shift attendance
  is marked in a day, the salary slip shows zero under Absent days" (2022-06-16, still open).
  INFERENCE: these are payroll-affecting defects, not cosmetic ones.
- FACT: #3298 "Overlapping Shift issue" open since 2025-07-01 — double-booking a person is not
  reliably prevented. (<https://github.com/frappe/hrms/issues/3298>)
- FACT: the releases page shows the roster is still being repaired — v16.14.0 changed cancelled
  shift assignments to be marked Inactive so "roster creates new assignments for next period
  rather than modifying cancelled ones"; v16.17.0 fixed the Monthly Attendance Sheet's half-day
  classification and leave counts. (<https://github.com/frappe/hrms/releases>)
  (Release *years* on that page could not be read reliably; version numbers are exact.)

**MISSING FEATURES**

- FACT: #4087 "Multiple Shift Location" (2026-02-05) — a shift cannot span or address more than
  one location. INFERENCE: directly relevant to AV, where one crew day is load-in at the
  warehouse, then site, then back.
- FACT: #1556 "Break shift feature request" (2024-03-19) and #5001 "HR: Attendance with
  breaktime" (2026-07-25) — typed breaks are still being asked for.
- FACT: #4773 "Employee attendance trackable in hours" — open since **2019-06-18**, last touched
  2026-06-24. Seven years for hour-granular attendance.
- FACT: #3826 "Leave Allocation based on Working Hours" (2025-12-09); #2858 "Make the late
  attendance time deducted from the leaves" (2025-03-12).
- FACT: #5125 "Prevent Future-Dated Attendance Requests" (2026-08-18).

**UX PROBLEMS**

- FACT: #4101 "validation response on the roster is being shown 3 times !!" (2026-02-09) — the
  roster screen fires duplicate validation toasts.
- FACT: #4801 "Unable to manage holiday list Assignment from Roaster" (2026-06-29) — holiday lists
  cannot be driven from the roster view, forcing a context switch.
- FACT: #1794 "Holiday List not getting fetched in Monthly Attendance Report From Shift
  Assignment" — open since 2024-05-20, still being touched 2026-07.
- FACT: #3942 "Employee Self Service Portal Theme Configuration - Mobile" (2026-01-13) and #2818
  "Production Self-Hosting Guide" (2025-02-28) are among the most-engaged open feature requests —
  i.e. the two loudest asks are *mobile presentation* and *how to run it at all*.
  (<https://github.com/frappe/hrms/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>)

**PERFORMANCE PROBLEMS**

- FACT: v16.14.0 improved the "Employee Hours Utilization Based on Timesheet" report "through
  optimized lookups" — i.e. that report was slow enough to need fixing.
  (<https://github.com/frappe/hrms/releases>)
- UNKNOWN: no open issue in this pass documented a scale ceiling with numbers.

**PRICING PROBLEMS**

- FACT: GPL-3.0, self-hostable, no licence fee.
- FACT: the cost has moved to **operations** — #2818 "Production Self-Hosting Guide for Frappe
  HRMS" is one of the most-reacted open issues, opened 2025-02-28 and still open. INFERENCE: for a
  20-person AV company with no sysadmin, Frappe HR's real price is a person, and the community is
  asking the maintainers to reduce it.
- UNKNOWN: Frappe Cloud pricing — `frappe.io` is proxy-blocked.

**LOCK-IN**

- FACT/INFERENCE: low licence lock-in, high **framework** lock-in — Frappe HR is an app on the
  Frappe/ERPNext framework, so its DocTypes, permissions and reports are only portable to another
  Frappe install. This is INFERENCE from the repo structure, not from a user complaint.

**OFFLINE**

- UNKNOWN in this pass. No offline-mode issue surfaced. INFERENCE: it is a server-rendered
  Frappe web app with a mobile PWA-style self-service portal (#3942 concerns its mobile theme),
  which implies online-only, but I did not verify an offline claim either way.

**INTEGRATION PROBLEMS**

- No specific integration complaint surfaced in this pass. UNKNOWN.

---

### Rentman crew module (Rentman B.V., NL — commercial SaaS)

The one AV-native product in this segment, and — unexpectedly — the best-evidenced commercial one,
because a third-party TypeScript connector (`Alternative-Design-And-Media/rentman-api-connector`)
documents the API's real constraints in its README and issue tracker.

**STRENGTHS**

- FACT: the crew data model is deep. Issue #100 lists 22 crew fields that a client library was
  *missing* relative to Rentman's own OpenAPI schema, including `birthdate`, `passport_number`,
  `emergency_contact`, `driving_license`, `contract`, `contract_date`, `bank`, `company_name`,
  `vat_code`, `coc_code`, `default_warehouse`, `external_reference` and `tags`. The issue notes
  "birthdate, passport, and driving license fields are fundamental for HR integrations".
  (<https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/100>)
  INFERENCE: `driving_license` + `default_warehouse` + `emergency_contact` on a crew record is
  exactly the shape an OB-van operation needs, and no other product in this segment has it.
- FACT: the connector exposes `RentmanCrewMember`, `RentmanCrewAvailability` **and**
  `RentmanCrewRate` as distinct typed resources — availability and rates are modelled separately
  from the person. (<https://raw.githubusercontent.com/Alternative-Design-And-Media/rentman-api-connector/main/README.md>)
- FACT: the API is documented by a real OpenAPI spec that third parties can codegen against
  (issues #103 and #113 both reason from "the OAS").

**WEAKNESSES**

- FACT, `recurring`: **the API is a moving target with short notice.** Issue #120 (opened
  2026-07-28) records that Rentman notified users **by email on 2026-07-23** of three changes
  already live in API v1.15.0 (released 2026-07-22), with the old behaviour sunsetting in Q4 2026:
  `/statuses` splits into `/projectstatuses` + `/warehousestatuses`; **offset pagination is
  removed entirely**; status IDs stay shared across the split endpoints.
  (<https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/120>)
  INFERENCE: one day between shipping and telling integrators, and a single quarter to migrate.
- FACT: **the pagination model has a trap that causes silent data loss.** Issue #116
  (2026-06-05) documents `listAll()` / `listAllSubResource()` / `scanAll()` stopping after the
  first page because the client's stop condition used `page.itemCount`, which is the *page* size
  (300), not the collection total. A downstream system "reported fetching exactly 300 equipment
  items from a catalogue of ~9,700 items". The issue's own words: "This is **silent data loss** —
  no error is thrown."
  (<https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/116>)
  **Honest attribution:** the issue explicitly calls this a *client-side bug*, not an API bug. But
  INFERENCE: an API that names a field `itemCount` and means "items on this page" is an API whose
  ergonomics manufacture this bug. It happened to a competent, typed, codegen'd client.
- FACT: cursor pagination is only available when results are **sorted by `id`**; any other sort
  order falls back to offset — and offset is being removed in Q4 2026.
  (<https://raw.githubusercontent.com/Alternative-Design-And-Media/rentman-api-connector/main/README.md>,
  <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/120>)
  INFERENCE: after Q4 2026 you cannot reliably page through a large result set in any order other
  than by ID — so "all crew availability for next month, sorted by date" is not a paginable query.
- FACT: fields marked "GENERATED FIELD" in the OAS **cannot be sorted** when `limit`/`offset` are
  set and **cannot be used as filter keys**.
  (<https://raw.githubusercontent.com/Alternative-Design-And-Media/rentman-api-connector/main/README.md>)
- FACT: custom fields arrive nested in a `custom` object with positional names (`custom_16`), not
  semantic ones. Issue #113 records that codegen rejected `belongs_to: vehicle` and
  `timeregistration` for custom fields "despite OAS confirming custom field support" — i.e. the
  spec and the implementation disagree.
  (<https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/113>)
- FACT: issue #103 exists solely to "Document OAS field name mismatches between TypeScript
  interfaces and schema" — the published schema does not match reality closely enough to trust.

**MISSING FEATURES / what integrators request**

- FACT: #19 — **no `PATCH`**; the connector had to add partial-update support, implying full-object
  PUT semantics against a large crew record.
- FACT: #23 — **no ETag / conditional requests**, so polling for crew availability changes burns
  full payloads every cycle.
- FACT: #26 — a Zod runtime-validation layer was requested because "TypeScript types provide
  compile-time safety, but offer no protection against unexpected API responses at runtime".
  INFERENCE: integrators do not trust the response shape.
- FACT: #22 — concurrent page fetching had to be added client-side to make large listings usable.

**PERFORMANCE / RATE LIMITS**

- FACT, hard numbers: **50,000 requests/day, 10 req/s, max 20 concurrent requests.**
  (<https://raw.githubusercontent.com/Alternative-Design-And-Media/rentman-api-connector/main/README.md>)
- FACT: issue #20 states plainly that "`listAll()` on large collections (e.g. full equipment
  catalogue) can easily exceed 10 req/s and hit the rate limit without any protection in place",
  and that the client throws `429` immediately with the caller left to retry by hand. The issue
  asks for exponential backoff with jitter and respect for `Retry-After`. **Still open.**
  (<https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/20>)
  INFERENCE: a nightly full sync of a mid-size rental catalogue plus crew is already close to the
  ceiling. Combined with no ETag support (#23), the polling cost is structural.
- FACT: default page size 300, maximum 1500.

**PRICING PROBLEMS** — UNKNOWN. `rentman.io` is proxy-blocked. No price verified.

**LOCK-IN**

- FACT: cloud-only SaaS with a token-authenticated REST API; there is **no `rentman` GitHub
  organisation** (a `user:rentman` search returns "The listed users and repositories cannot be
  searched either because the resources do not exist"). Every client is third-party.
- INFERENCE: your data is reachable, but only through an API whose pagination contract changes on
  a quarter's notice and whose full extraction is rate-limited to 10 req/s. Bulk egress is
  possible but slow and fragile.

**OFFLINE** — UNKNOWN, but INFERENCE from cloud-only SaaS + token API: no offline authoring.

**INTEGRATION PROBLEMS** — see above; the whole section is integration problems.

---

### Deputy (commercial SaaS)

**Evidence available in this environment: almost none. Read the Method section.**

**STRENGTHS**

- FACT (from the landscape pass, via the open-source Pipedream component): the timesheet approval
  state machine is unusually complete — dual `TimeApproved`/`PayRuleApproved`, a dispute channel,
  `Exported`/`PayStaged`/`PaycycleId` payroll staging, and `Auto*` automation audit flags.
  Nothing found in this pass contradicts it.

**WEAKNESSES / UX / PERFORMANCE / PRICING** — **UNKNOWN.** Every route to user sentiment
(G2, Capterra, TrustRadius, Trustpilot, Reddit, `deputy.com`, `developer.deputy.com`) is
proxy-blocked. I will not manufacture findings.

**LOCK-IN and INTEGRATION PROBLEMS** — here I do have something, and it is structural:

- FACT: **Deputy publishes no official SDK on GitHub.** The `deputy` org holds exactly **one**
  repository, named `test`, last updated **2017-03-23**.
  (<https://github.com/orgs/deputy/repositories>) — caveat: I could not independently confirm that
  this org is owned by Deputy the vendor; treat the org identity as INFERENCE, the repo contents
  as FACT.
- FACT: the ecosystem that exists is third-party and **abandoned**:
  - `google/deputy-api-python-client` — 9 stars, **archived 2022-12-29**, and its only three
    issues (all still open, all filed 2019-08-28 by the same author on the day of creation) are
    "Document Testing Instructions", "Investigate Pypi packaging / full installation guide" and
    "Create Samples Directory with Example Code". It was never finished.
    (<https://github.com/google/deputy-api-python-client/issues>)
  - `Arizard/go-deputy-api-client` — **archived**.
  - `hr-central/DeputyApi` (.NET) — last updated **2018-09-25**.
  - `communityds/deputy-api-wrapper` (PHP, 5 stars) — the most alive one; its README documents
    OAuth `PermanentToken` + per-tenant `TargetConfig` domain and shows roster examples, but
    **documents no rate limits, no pagination, and no known gotchas**.
    (<https://raw.githubusercontent.com/communityds/deputy-api-wrapper/master/README.md>)
- FACT: a GitHub-wide issue search for `"Deputy API" scheduling timesheet` returns **0 results**.
  (<https://github.com/search?q=%22Deputy+API%22+scheduling+timesheet&type=issues>)
- FACT: in `PipedreamHQ/pipedream`, only four Deputy issues have ever existed, all closed, the
  oldest being "Deputy app uses old logo - please update" (2021-06-09).
  (<https://github.com/PipedreamHQ/pipedream/issues?q=is%3Aissue+deputy>)
- INFERENCE, and the most useful thing in this section: **for a tool with Deputy's market
  presence, an integration surface with no vendor SDK, four abandoned third-party clients and
  zero public issue traffic means integrators are not building against it in the open.** Whatever
  the API can do, the community knowledge to use it does not exist publicly. Anyone integrating
  is on their own with the docs.

**OFFLINE** — UNKNOWN. Cloud SaaS with a mobile app; whether the app queues punches offline was
not verifiable here. This is a high-value question to re-check when search is available.

---

### Connecteam (commercial SaaS)

**Evidence available: very thin, but one finding is sharp.**

**STRENGTHS**

- FACT (landscape pass, via Pipedream component): open shifts as first-class data
  (`isOpenShift` + `isRequireAdminApproval`), `isPublished` draft gating so a roster can be built
  before crew see it, and paid/unpaid typed breaks. The draft-gating in particular is a pattern
  worth stealing.

**LOCK-IN / INTEGRATION PROBLEMS**

- FACT: **Connecteam publishes no SDK.** The `Connecteam` GitHub org has three repos:
  `automation-interview-exec`, `test2`, and `mta-sts` (a DNS record for their mail domain). None
  is a client library. (`user:connecteam` repository search)
- FACT, and this is the sharp one: the one real third-party CLI, `Jarvis0p/connectcli` (Go,
  created 2025-10-19), **does not use the official API at all**. Its README documents
  cookie-based authentication requiring three credentials stored in `~/.connectcli/credentials` —
  a session cookie, a session-token cookie and a CSRF token — and it talks to `app.connecteam.com`
  (the web app), not `api.connecteam.com`.
  (<https://raw.githubusercontent.com/Jarvis0p/connectcli/main/README.md>)
  INFERENCE: a developer who wanted timesheet data out of Connecteam chose to impersonate a
  browser session rather than use the documented API. That is what people do when the official
  API does not expose what they need, or when access to it is gated. It is the strongest
  available signal that the Connecteam API surface is narrower than the product.
- FACT: a GitHub-wide search for `"Connecteam" api` returns 8 issues, none of them a bug report
  against the API; the closest are `Garrett96/openlabor` #1 "no integrations / api"
  (2025-12-22) and `PipedreamHQ/pipedream` "Clockify and Connecteam?" (2022-07-22).
  (<https://github.com/search?q=%22Connecteam%22+api&type=issues>)

**Everything else (weaknesses, UX, performance, pricing, offline) — UNKNOWN.**

---

### Planday (Planday / Xero, commercial SaaS)

**STRENGTHS / WEAKNESSES / UX / PERFORMANCE / PRICING / OFFLINE — UNKNOWN.** No reachable source
says anything about how Planday behaves.

**What *is* verifiable, and it matters:**

- FACT: the `planday` GitHub org exists and publishes **two** repositories: `ReConnect`
  ("Help people leaving ukraine looking for shelter", 2022) and `functional-challenges-public`
  ("Challenges used for recruitment", 2021). **No SDK, no API client, no samples.**
  (`user:planday` repository search)
- FACT: a GitHub-wide issue search for `Planday api` returns 41 results and **not one of them is
  about the Planday product** — they are all unrelated projects that happen to contain a `planDay`
  identifier (fitness apps, training planners).
  (<https://github.com/search?q=Planday+api&type=issues>)
- FACT: the only Planday-adjacent tool found anywhere is `tomasvold/API-Response-Viewer`
  (1 star, created 2024-05-09) — "A Next.js web application to easily query the Planday OpenAPI,
  inspect JSON responses, and **export data directly to Excel**."
  INFERENCE: somebody built a whole web app whose stated purpose is getting Planday data into
  Excel. That is a data-egress workaround, and it is the only public artefact of the Planday
  developer ecosystem I could find.
- This corroborates the landscape pass, which found the Pipedream Planday component to be an
  **empty stub with no endpoints**.

**Bottom line:** Planday remains the biggest hole in this segment's research. Two independent
passes have now failed to verify a single capability. It should be the first target when search
access returns.

---

### Ever Gauzy (AGPL-3.0)

**STRENGTHS**

- FACT (landscape pass): the best freelancer/contractor data model verified anywhere —
  `billRateValue`, `minimumBillingRate`, `payPeriod`, `isVetted`, `isJobSearchActive`, `upworkId`,
  and a 3-state `AvailabilityStatusEnum`.

**WEAKNESSES / PERFORMANCE**

- FACT, `recurring`: **the desktop timer is the unstable part.** #9384 "[BUG] timer suddenly
  logout during stopping timer in desktop timer app" (2026-01-30) and #8159 "Random 400 Bad
  Request Error and Sync Delay After Extended Usage" (2024-09-04, one of the most-reacted open
  issues in the repo) both describe the timer losing its session or desynchronising during long
  sessions.
  (<https://github.com/ever-co/ever-gauzy/issues?q=is%3Aissue+is%3Aopen+offline+OR+desktop+OR+sync>,
  <https://github.com/ever-co/ever-gauzy/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>)
  INFERENCE: being logged out *while stopping a timer* is the failure mode that loses the entry —
  the worst possible moment.
- FACT: #7942 "[Bug] Gauzy UI Timer | Save 'Manual Time'" open since 2024-07-08 — manual time
  entry has persistence problems, i.e. the fallback for when the timer fails is also unreliable.
- FACT: #9516 "[FEAT] Add ability to switch timesheet's project after creation" (2026-02-25) —
  a timesheet's project is effectively immutable, which for AV (job gets re-coded to a different
  production number) is a real correction problem.

**MISSING FEATURES**

- FACT: the most-reacted open issue in the whole repo is **#1601 "Feature: Tests and QA"**, an
  Epic opened **2020-07-04**. (<https://github.com/ever-co/ever-gauzy/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>)
  INFERENCE: when the community's top-voted request is "please add tests", that is a statement
  about perceived reliability.
- FACT: #6411 "make it easy to change product name, logo, and other details" (2023-06-26) —
  white-labelling is manual.

**PRICING** — FACT: AGPL-3.0, self-hostable. INFERENCE: AGPL is a real constraint for anyone
wanting to embed it in a closed product. Cloud pricing UNKNOWN.

**LOCK-IN / OFFLINE / INTEGRATION** — largely UNKNOWN. FACT: the desktop apps are Electron and
distribution is an ongoing problem — #9753 Windows code signing + secure auto-update "for the 6
desktop apps" (2026-06-27), #9613 Scoop installers (2026-03-15), #9741 Snap platform mismatch
(2026-06-19). INFERENCE: six desktop apps is a maintenance surface that shows.

---

### solidtime (AGPL-3.0, aimed at freelancers/agencies)

**STRENGTHS** — FACT: actively maintained; issues filed days before this research were already
triaged (#1230 filed 2026-08-29, the research date itself).

**WEAKNESSES**

- FACT, `recurring`: **timezone correctness is its live defect class**, exactly as in Kimai —
  #1230 "403 in timezone mismatch modal" (2026-08-29) and #1225 "Dashboard shows negative running
  time with non-UTC database timezone" (2026-08-27), filed two days apart.
  (<https://github.com/solidtime-io/solidtime/issues?q=is%3Aissue+is%3Aopen>)
  INFERENCE: a *negative* running time on the dashboard is a signed-arithmetic bug across a
  timezone boundary — the same class as Kimai's midnight-split problem.
- FACT: #1189 "Updating a time entry with only `end` in the payload bypasses validation"
  (2026-08-02) — the API accepts partial updates that produce invalid entries.
- FACT: #894 "Bug: Double import duplicates time entries" (2025-08-16) — imports are not
  idempotent, still open a year later.
- FACT: #208 "Dashboard page time tracking discrepancies" open since 2024-10-16.
- FACT: #1016 "Server unavailable after some time" (2026-02-15) and #1039 "Laravel Octane +
  FrankenPHP segfault on PHP 8.3 ZTS with native extensions" (2026-03-18) — the self-hosted
  runtime falls over.

**UX / EXPORT PROBLEMS**

- FACT, `recurring` within the product: **PDF export is unreliable** — #1162 "A long list of
  elements breaks pie chart in the exported PDF" (2026-07-14) and #465 "Exported PDF Description
  colors do not match backend display" (2025-04-29, open over a year).
  INFERENCE: the PDF is the artefact a client or a payroll office actually receives. A report that
  breaks when the list gets long breaks precisely on the big jobs.
- FACT: #436 "Task selection after a search" (2025-04-01) is the top-reacted open enhancement —
  a basic list-interaction annoyance.

**ONBOARDING / USER MANAGEMENT**

- FACT: #1214 "Imported placeholder users can't be converted to real users except by invitation"
  (2026-08-17) and #1129 "Invited users can't register because registration is disabled"
  (2026-06-22). INFERENCE: importing a freelancer roster and then activating those people is
  broken — which is precisely the freelancer-dispatch onboarding path.
- FACT: #984 "Deactivating an account moves the user to their own organization" (2025-12-09) —
  offboarding a freelancer has a surprising side effect.

**PRICING / LOCK-IN / OFFLINE / INTEGRATION** — UNKNOWN. `solidtime.io` proxy-blocked.

---

### Timefold Solver (Apache-2.0 core, paid Enterprise edition)

**STRENGTHS** — FACT (landscape pass): rostering as constraint optimisation with magnitude-scored
violations, explicit fairness/load-balancing, and 3-tier unavailable/undesired/desired
preferences. The `flight-crew-scheduling` quickstart models `homeAirport` with "First assignment
not departing from home" / "Last assignment not arriving at home" constraints — the OB-van crew
problem, and still unimplemented in any shipping product in this segment.

**WEAKNESSES**

- FACT: it is a **library, not a product**. `timefold-quickstarts` has essentially no user issue
  traffic — the only employee-scheduling issue in the tracker is #1045 "Bug: Employee Scheduling:
  Score Analysis broken", filed by a Timefold employee and closed 2026-03-20.
  (<https://github.com/TimefoldAI/timefold-quickstarts/issues?q=is%3Aissue>)
  INFERENCE: nobody is running the quickstart in anger; anyone using Timefold is writing their
  own domain model, UI and persistence. The scheduling intelligence is available; the
  application around it is entirely your problem.

**PRICING / LOCK-IN — the open-core split**

- FACT: the split is real and visible in the tracker — issue #2291 "Provide downloadable Javadoc
  for **Enterprise Edition** classes" (closed 2026-05-14) exists because Enterprise classes are
  distributed as separate artefacts; multi-threaded solving is repeatedly discussed as an
  edition-tied capability (#2261 "Move evaluation speed should not count non-foraged moves in
  multi-threaded solving", closed 2026-05-11; #1255 "Docs: Improve the description of the
  multi-threading feature", closed 2024-12-10).
  (<https://github.com/TimefoldAI/timefold-solver/issues?q=is%3Aissue+enterprise+OR+license+OR+multithreaded>)
  INFERENCE: the free core solves; the paid edition solves *faster* on multi-core. For a 60-person
  crew roster that is likely irrelevant; for a 600-person multi-venue festival it is the
  difference between a 10-second and a 10-minute solve. Exact Enterprise pricing UNKNOWN
  (`timefold.ai` proxy-blocked).
- FACT: #1172 "Feat: Dynamic Constraint Weight in constraint factory" open since 2024-10-30,
  still labelled needs-triage. INFERENCE: changing a fairness weight at runtime — "this week,
  weight travel time higher than cost" — is not a first-class operation.

**OFFLINE** — FACT/INFERENCE: it is a JVM library, so it runs wherever your process runs,
including fully offline. It is the only thing in this segment for which that is true, and it is
worth noting as a strength.

---

### Clockify (COING, commercial SaaS)

**Evidence: one third-party integration issue, but with hard numbers.**

- FACT: `beeminder/integrations` issues (opened 2024-03-05) record, from an integrator's
  perspective: rate limits of **"50 requests per second per addon per workspace"**, that
  **"Standard API key rate limits are undocumented"**, and that the **"Default page size varies by
  endpoint (commonly 50)"**, with pagination constraints forcing high request volume. Webhook
  support and full-dataset retrieval are listed as gaps.
  (<https://github.com/search?q=%22Clockify%22+api+rate+limit&type=issues>)
  INFERENCE: an undocumented rate limit on the *standard* key is the worst kind — you discover it
  in production. Combined with a 50-item default page size, a full timesheet export for a month
  of a 100-person crew is thousands of requests.
- FACT: `dustinestes/clockify-agent-plugin` #48 is titled "Paid-tier Clockify features: billable
  first", i.e. billability is behind a paid tier for integration purposes.
  INFERENCE (weak, single source): feature gating reaches into the API surface, not just the UI.
- Everything else about Clockify — UNKNOWN.

---

### Personio (Personio, DE — the HR system crew tools export into)

- FACT: **Personio reduced its own API page size and forced every client to rewrite pagination.**
  `at-gmbh/personio-py` issue #41 (2024-11-25) quotes the Personio docs: *"In order to maintain
  system integrity and acceptable performance at V1 GET employees endpoint the maximum page size
  will be reduced to 100 employees per page on an ongoing basis in 2025."* The issue author notes
  they learned the actual deadline **by email**, and that **"The docs do not mention the deadline
  that I have received via email."** The library's `get_employees` used a non-paginating call and
  would simply stop returning everyone.
  (<https://github.com/at-gmbh/personio-py/issues/41>)
  INFERENCE: same failure shape as Rentman #116 — a pagination change that turns a working
  integration into one that silently returns a truncated list. Two different vendors, same trap,
  same year.
- FACT: the client ecosystem is thin — three Personio clients exist on GitHub, the largest
  (`at-gmbh/personio-py`) has 27 stars and 12 open issues; the other two have 0 stars.
- Everything else about Personio — UNKNOWN. `api.personio.de` docs are proxy-reachable only via
  the quotation above.

---

## Cross-product patterns

These repeat across **multiple independent vendors** and are the most valuable output of this
pass.

### 1. No commercial vendor in this segment publishes an SDK — `widespread`

FACT, verified across four vendor GitHub orgs:

| Vendor | GitHub org | Repos | Any SDK? |
| --- | --- | --- | --- |
| Deputy | `deputy` | 1 (`test`, 2017-03-23) | No |
| Planday | `planday` | 2 (Ukraine shelter app; recruitment challenges) | No |
| Connecteam | `Connecteam` | 3 (interview exec; `test2`; MTA-STS DNS record) | No |
| Rentman | *does not exist* | — | No |

Every client library in this segment is third-party, and the ones that exist are small and often
archived (`google/deputy-api-python-client` archived 2022; `Arizard/go-deputy-api-client`
archived; `hr-central/DeputyApi` last touched 2018). One developer gave up on the official API
entirely and drove Connecteam through browser session cookies.

INFERENCE: integration in this segment is a **cost the customer pays**, repeatedly, per vendor,
with no shared community knowledge to amortise it. This is the strongest structural finding in
the dossier and it is the one an AV-native tool can attack directly.

### 2. Pagination changes cause silent truncation, not errors — `recurring`, two vendors, same year

FACT: Rentman `listAll()` returning exactly 300 of ~9,700 items with no error thrown
(connector #116, 2026-06); Personio reducing max page size to 100 and notifying the deadline only
by email, with a client whose `get_employees` did not paginate at all (personio-py #41, 2024-11).
FACT: Kimai's variant is field-level rather than row-level — 2.66.0 removes rate fields from JSON
when permissions are missing, and the upgrade note tells integrators to treat them as optional.

INFERENCE: the shared failure mode is **an integration that keeps returning 200 OK while
returning less than the truth**. For crew data this means a roster export that quietly omits
people, or an invoice that quietly omits a rate. Any tool that consumes these APIs needs an
explicit completeness assertion (compare against a count endpoint, fail loudly on a short read),
because none of these vendors will raise the error for you.

### 3. Timezone and midnight arithmetic is broken everywhere — `recurring`, two vendors

FACT: Kimai #5617 "Timezone Bug" (open since 2025-08); Kimai #4962 asking for the timezone
semantics of reporting pages to be *documented at all* (2024, still discussed 2025-12); Kimai
#4239 — a 21:00→03:00 shift books 6 hours to day 1, worked around by hand-splitting at 23:59, which
then corrupts break deductions; solidtime #1225 "Dashboard shows negative running time with
non-UTC database timezone" (2026-08-27) and #1230 "403 in timezone mismatch modal" (2026-08-29).

INFERENCE, and this is squarely an AV problem: **AV work is disproportionately overnight.**
Get-outs finish at 03:00, OB trucks run through the night, festival shifts cross midnight by
design. The general-purpose products in this segment treat a day as a closed interval and a
shift as something that fits inside one. Every one of them makes the operator do the split by
hand, and the hand-split is what breaks break-time and overtime maths.

### 4. Calendar sync is the most-requested unmet integration — `recurring` (strong within Kimai, corroborated structurally)

FACT: in Kimai it has been asked five times across eight years and never shipped — #361 Caldav
(2018-10), #1009 webcal/ical (2019-08), #1789 calendar subscription (2020-06), #5287 Outlook
two-way (2025-01, top-reacted recent request at 16 reactions), plus #1407 webhooks (2020-01,
11 +1, "Planned", unassigned for six years).

INFERENCE: a freelancer's real scheduling system is their phone calendar. Every crew tool that
does not push into it is asking the freelancer to check a second place, which they will not do —
so the dispatcher ends up confirming by WhatsApp, which is the media break the corpus keeps
recording. Note the honest limit: I can only *prove* this pattern inside Kimai's tracker. The
commercial products' request queues are not public.

### 5. Payroll handoff is the unsolved last mile — `recurring`

FACT: Kimai #3665 "Connect with Payroll provider" open since 2022-12 with 11 comments; Kimai
#2864 "Lexoffice API connection" (7 +1, open since 2021 — a **German** accounting product, so
this is the German-market handoff being asked for explicitly); Kimai's XML/JSON invoice renderers
moved *out* of the free product into a paid plugin in 2.0; Personio's entire relevance to this
segment is being the system others export into, and its pagination contract changed under them.

INFERENCE: the segment can approve a timesheet but cannot hand it to the money system. That gap is
filled by CSV and re-keying.

### 6. Rostering is bolted onto per-person data models — `recurring`

FACT: Frappe HR #7 says the shift system is "designed to run for 1 employee at a time" and asks
for bulk assignment, a visual calendar, capacity/backup tracking and hierarchical
company→group→location shift times (11 +1 — the most-reacted shift issue in that repo); #1036 is
an outsider offering the roster system they had to build themselves; #3298 "Overlapping Shift
issue" and #4101 (triple validation toasts on the roster screen) show the roster UI is young.

INFERENCE: the products that model *a person's shift* well are not the products that model *a
production's crew call* well. An AV crew call is "this job needs 1 EVS, 2 camera ops, 1 sound,
across these three locations, on these dates" — a demand-side object. Everything in this segment
starts supply-side (a person, their availability, their shift) and reconstructs the demand side
by hand.

### 7. Offline is absent — `recurring` (by structure, not by complaint)

FACT: Kimai #1560 (PWA support) open since 2020-03; Kimai #198 (Android app) since 2018.
FACT: Deputy, Connecteam, Planday, Rentman and Clockify are cloud SaaS. FACT: Ever Gauzy's
Electron desktop timer, the nearest thing to an offline client, is the component with the most
sync and session-loss bug reports (#9384, #8159, #7942).
INFERENCE: the only genuinely offline-capable thing in this segment is Timefold, and that is a
library. Note the honest caveat: whether Deputy's or Connecteam's *mobile apps* queue punches
offline is UNKNOWN and could not be checked here — it is a high-value open question, because
"crew clocks in with no signal" is the single most common AV field condition.

### 8. Undocumented and low rate limits make bulk sync fragile — `recurring`, two vendors

FACT: Rentman — 50,000 req/day, **10 req/s**, 20 concurrent, and its own connector's issue #20
states `listAll()` on a full catalogue "can easily exceed 10 req/s" with no backoff implemented;
no ETag/conditional-request support (#23), so every poll is a full payload.
FACT: Clockify — 50 req/s per addon per workspace, but "**Standard API key rate limits are
undocumented**", with a default page size "commonly 50".
INFERENCE: nightly full-sync architectures are on the edge of these budgets today. Anyone building
a bridge should assume delta-sync-or-nothing, and should expect to discover the real limit in
production.

### 9. Export fidelity fails on exactly the big jobs — `recurring`, two vendors

FACT: Kimai #6039 exported total ≠ sum of rounded entries (2026-07, open); Kimai #3633 export
marking vs rounding settings (open since 2022); Kimai #5762 tiny font on very large timesheet
entries; solidtime #1162 long list breaks the pie chart in the exported PDF (2026-07);
solidtime #465 exported PDF colours do not match the UI (open over a year).
INFERENCE: the export is the deliverable — the thing the production accountant receives. These
products' exports degrade as entry counts grow, which is to say they degrade on the jobs where
the money is.

### 10. Geographic and travel continuity is modelled nowhere — `widespread` as an absence

FACT: the only place in the entire segment where "start and end at your home base" is expressed
as a constraint is the Timefold `flight-crew-scheduling` quickstart (`homeAirport`, "First
assignment not departing from home", "Last assignment not arriving at home") — a demo, not a
product. FACT: Frappe HR #4087 "Multiple Shift Location" is an open request from 2026-02.
FACT: Rentman models `default_warehouse` on the crew member but nothing in the availability model
consumes it (from the connector's typed resources).
INFERENCE: no shipping product in this segment can answer "can this person physically get from
the Friday job in Hamburg to the Saturday call in Munich?". Dispatchers answer it in their heads,
and that is where the double-booking comes from.

---

## Direct quotes-of-substance

All paraphrased or quoted from pages I opened. No quote is invented; where I quote verbatim it is
because the wording is load-bearing.

1. **Kimai #4239, 2023-08-14** — a user with shifts that "start at 21:00 day 1, and ends at 03:00
   day 2" reports the duration is booked as 6 hours on day 1, and says the manual fix
   (entering 21:00–23:59 then 00:00–03:00) "can be a hassle" and interferes with their break
   deductions and overtime overview. <https://github.com/kimai/kimai/issues/4239>

2. **Rentman API connector #116, 2026-06-05** — verbatim: "This is **silent data loss** — no error
   is thrown." A downstream system fetched exactly 300 equipment items from a catalogue of ~9,700.
   <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/116>

3. **Rentman API connector #20, 2026-05-13** — verbatim: "`listAll()` on large collections (e.g.
   full equipment catalogue) can easily exceed 10 req/s and hit the rate limit without any
   protection in place." Still open.
   <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/20>

4. **personio-py #41, 2024-11-25** — the author learned of a breaking pagination deadline by
   email and notes verbatim: "The docs do not mention the deadline that I have received via
   email." <https://github.com/at-gmbh/personio-py/issues/41>

5. **Kimai #5287, 2025-01-08** — verbatim: "I would like to export the timesheet entries into my
   for instance outlook calender. Brilliant would be an direct integration and sync in both
   directions." Top-reacted recent request; unassigned, no linked PR.
   <https://github.com/kimai/kimai/issues/5287>

6. **Kimai #1407, 2020-01-22** — verbatim: "I'd like to have way of getting notification from
   kimai in other apps when user starts/stops activity". 11 thumbs-up, marked "Planned", still
   unassigned six and a half years later. <https://github.com/kimai/kimai/issues/1407>

7. **Frappe HR #7, opened 2021-11-10** — the request records that shift management is "designed to
   run for 1 employee at a time", and asks for bulk assignment, a visual roster calendar,
   capacity/backup tracking, and company→group→location shift-time inheritance rather than
   per-employee configuration. 11 thumbs-up. <https://github.com/frappe/hrms/issues/7>

8. **Kimai #4774, 2024-04-11 (24 comments)** — a user reports having "copied the code from the API
   example 1:1 and just inserted my token" and still receiving "Full authentication is required to
   access this resource" after the bearer-token migration.
   <https://github.com/kimai/kimai/issues/4774>

9. **Kimai `UPGRADING.md` (2.66.0)** — rate fields (`rate`, `internalRate`, `hourlyRate`,
   `fixedRate`) are removed from API JSON responses when the caller lacks the rate-view permission,
   and integrators are told these "should now be treated as optional".
   <https://raw.githubusercontent.com/kimai/kimai/main/UPGRADING.md>

10. **Kimai `UPGRADING.md` (2.0)** — "Invoice renderers for XML, JSON, and TEXT moved to paid
    Extended Invoicing plugin." A machine-readable export moved from free to paid.
    <https://raw.githubusercontent.com/kimai/kimai/main/UPGRADING.md>

11. **`Jarvis0p/connectcli` README** — the tool authenticates to `app.connecteam.com` with a
    session cookie, a session-token cookie and a CSRF token stored in `~/.connectcli/credentials`,
    rather than using the documented `api.connecteam.com` API key.
    <https://raw.githubusercontent.com/Jarvis0p/connectcli/main/README.md>

12. **`beeminder/integrations`, 2024-03-05** — records Clockify limits of "50 requests per second
    per addon per workspace" while noting "Standard API key rate limits are undocumented", and a
    default page size "commonly 50".
    <https://github.com/search?q=%22Clockify%22+api+rate+limit&type=issues>

13. **Rentman API connector #120, 2026-07-28** — Rentman emailed integrators on 2026-07-23 about
    changes already shipped in v1.15.0 on 2026-07-22: `/statuses` splits into `/projectstatuses`
    and `/warehousestatuses`, and offset pagination is removed in Q4 2026.
    <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/120>

14. **`google/deputy-api-python-client`** — archived 2022-12-29; its only three issues, all still
    open, were all filed on 2019-08-28 and are "Document Testing Instructions", "Investigate Pypi
    packaging / full installation guide" and "Create Samples Directory with Example Code".
    <https://github.com/google/deputy-api-python-client/issues>

15. **solidtime #1225, 2026-08-27** — the dashboard shows a *negative* running time when the
    database timezone is not UTC. Filed two days before this research.
    <https://github.com/solidtime-io/solidtime/issues?q=is%3Aissue+is%3Aopen>

16. **Ever Gauzy #9384, 2026-01-30** — the desktop timer logs the user out *during* the act of
    stopping the timer. <https://github.com/ever-co/ever-gauzy/issues?q=is%3Aissue+is%3Aopen+offline+OR+desktop+OR+sync>

---

## What this means for AV Planner Suite

Short, because the synthesis pass owns this properly. The defensible openings, ranked by how well
the evidence above supports them:

1. **Overnight-native time model.** Model a work period as an interval that may cross midnight,
   with breaks and overtime computed on the interval, not on the calendar day. Evidence: Kimai
   #4239, solidtime #1225, the general absence of any product that does this.
2. **Demand-side crew calls.** A "call" is a production's requirement (roles × count × location ×
   date), and assignment is matching people to it. Everything in this segment is supply-side.
   Evidence: Frappe HR #7, #4087.
3. **Offline-first capture with loud reconciliation.** The suite is already offline-first Electron;
   this segment is uniformly online-only. Evidence: Kimai #1560 open since 2020; Gauzy's desktop
   timer being its buggiest component.
4. **Completeness-asserting importers.** When syncing from Rentman/Personio/Clockify, compare
   against a count and fail loudly on a short read rather than trusting a 200 OK. Evidence:
   Rentman #116, personio-py #41.
5. **Travel feasibility as a first-class check.** Hamburg Friday → Munich Saturday. Timefold's
   `homeAirport` constraints show the shape; nobody ships it. Evidence: Timefold
   flight-crew-scheduling quickstart, Frappe HR #4087.
6. **Calendar push as table stakes.** ICS/CalDAV out, at minimum one-way, from day one. Evidence:
   five Kimai requests over eight years, none shipped.

---

## Open questions this pass could not answer

Listed so the next pass knows exactly where to spend its search budget:

1. **Planday: everything.** Two passes, zero verified capabilities. Highest priority.
2. **Do Deputy's and Connecteam's mobile apps queue clock-ins offline?** This is the single most
   consequential unknown for AV field use.
3. **Every price in this segment.** Not one was verifiable. Deputy, Connecteam, Planday, Rentman,
   Clockify, Personio, Kimai Cloud, Timefold Enterprise — all UNKNOWN.
4. **Review-site "Cons" fields and Reddit sentiment for Deputy / Connecteam / Planday.** The
   entire user-sentiment axis for the commercial half of this segment is missing.
5. **German-market crew tools** (Crewbrain, Crewmeister, Papershift, StaffCloud, Jobtura) — still
   completely unverified across both passes, and they are the direct competitors in the home
   market.
6. **Rentman's crew availability semantics at scale** — the B/N/O 3-state model and native
   recurrence were verified structurally, but nothing about how they behave with hundreds of
   freelancers over a festival season.

---

## Sources

Every URL below was opened in this session. Nothing is cited that I did not read.

**Open-source product issue trackers**

- <https://github.com/kimai/kimai/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
- <https://github.com/kimai/kimai/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc>
- <https://github.com/kimai/kimai/issues?q=is%3Aissue+is%3Aopen+slow+OR+performance+OR+timeout+OR+memory>
- <https://github.com/kimai/kimai/issues/1407>
- <https://github.com/kimai/kimai/issues/4774>
- <https://github.com/kimai/kimai/issues/5287>
- <https://github.com/kimai/kimai/discussions>
- <https://github.com/frappe/hrms/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
- <https://github.com/frappe/hrms/issues/7>
- <https://github.com/frappe/hrms/issues/1036>
- <https://github.com/frappe/hrms/releases>
- <https://github.com/ever-co/ever-gauzy/issues?q=is%3Aissue+is%3Aopen+offline+OR+desktop+OR+sync>
- <https://github.com/ever-co/ever-gauzy/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
- <https://github.com/solidtime-io/solidtime/issues?q=is%3Aissue+is%3Aopen>
- <https://github.com/solidtime-io/solidtime/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc>
- <https://github.com/TimefoldAI/timefold-solver/issues?q=is%3Aissue+enterprise+OR+license+OR+multithreaded>
- <https://github.com/TimefoldAI/timefold-quickstarts/issues?q=is%3Aissue>

**GitHub search API queries (via MCP), repo-scoped**

- `kimai/kimai` — timesheet/export/rounding; calendar+webhook feature requests sorted by
  reactions; API token/permission issues; midnight/overnight; German-language issues
- `frappe/hrms` — shift/roster/attendance sorted by reactions; travel/per-diem (0 results)
- `ever-co/ever-gauzy` — freelancer/rate/availability (0 results)
- `solidtime-io/solidtime` — export/invoice feature requests
- `Alternative-Design-And-Media/rentman-api-connector` — rate limit / 429 / throttling
- `at-gmbh/personio-py` — pagination / limits — <https://github.com/at-gmbh/personio-py/issues/41>

**Third-party API-wrapper repositories (the API-weakness angle)**

- <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues?q=is%3Aissue>
- <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/100>
- <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/116>
- <https://github.com/Alternative-Design-And-Media/rentman-api-connector/issues/120>
- <https://raw.githubusercontent.com/Alternative-Design-And-Media/rentman-api-connector/main/README.md>
- <https://github.com/google/deputy-api-python-client/issues>
- <https://raw.githubusercontent.com/communityds/deputy-api-wrapper/master/README.md>
- <https://raw.githubusercontent.com/Jarvis0p/connectcli/main/README.md>

**Raw repository files**

- <https://raw.githubusercontent.com/kimai/kimai/main/UPGRADING.md>
- <https://raw.githubusercontent.com/kimai/kimai/main/README.md>
- <https://raw.githubusercontent.com/kimai/kimai/main/CHANGELOG.md> (a stub pointing to the
  releases page; no content)

**Vendor GitHub organisation checks (SDK existence)**

- <https://github.com/orgs/deputy/repositories> — 1 repo, `test`, 2017-03-23
- `user:planday` repository search — 2 repos, neither an SDK
- `user:connecteam` repository search — 3 repos, neither an SDK
- `user:rentman` repository search — org does not exist (search validation error)

**Cross-GitHub issue searches**

- <https://github.com/search?q=%22Deputy+API%22+scheduling+timesheet&type=issues> — 0 results
- <https://github.com/search?q=Planday+api&type=issues> — 41 results, none about the product
- <https://github.com/search?q=%22Connecteam%22+api&type=issues> — 8 results
- <https://github.com/search?q=%22Clockify%22+api+rate+limit&type=issues> — 28 results
- <https://github.com/search?q=rentman+api&type=issues>
- <https://github.com/search?q=kimai+mobile+app+offline&type=issues>
- <https://github.com/PipedreamHQ/pipedream/issues?q=is%3Aissue+deputy>
- <https://github.com/Garrett96/openlabor/issues>
- <https://github.com/muaddibco/RealWorldProblems/issues?q=is%3Aissue+scheduling+OR+crew+OR+staff+OR+shift>

**Repository discovery searches (via MCP)**

- `planday in:name,description`, `deputy in:name,description api rostering OR scheduling OR
  timesheet`, `connecteam in:name,description`, `personio api client`, `deputy api client
  scheduling`, `planday api client`

**Blocked and therefore NOT consulted** (recorded so the gap is auditable):
`duckduckgo.com`, `www.reddit.com`, `www.capterra.com`, `www.trustpilot.com`,
`developer.deputy.com`, `openapi.planday.com`, `www.kimai.org`. The `WebSearch` tool was
unavailable for the entire session (budget exhausted at 200/200 before this segment began).
