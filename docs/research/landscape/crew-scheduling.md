# Crew Scheduling / Freelancer Dispatch / Timesheets

> Research date: **2026-08-28/29**. Claims labelled per `docs/research/METHOD.md`:
> **FACT** (read in a source I actually opened), **INFERENCE** (my reasoning),
> **UNKNOWN / unverified** (could not be checked in this environment).

---

## Source-access caveat — READ THIS FIRST, it limits everything below

This pass ran under a **hard research blackout for commercial vendor websites**. Two independent
limits hit at once:

1. **The web-search budget for the session was already exhausted** (200 of 200 calls used) before
   this segment started. No search engine was available at any point during this research.
2. **The egress proxy blocks essentially every vendor domain.** Verified by direct probe
   (HTTP `000` = CONNECT refused):
   `crewbrain.de`, `papershift.com`, `deputy.com`, `connecteam.com`, `planday.com`,
   `rentman.io`, `lasso.io`, `sling.blue`, `shiftbase.com`, `staffomatic.com`,
   `crewmeister.com`, `humanity.com`, `kimai.org`, `timefold.ai`, `frappe.io`, `odoo.com`,
   `solidtime.io`, `setkeeper.com`, `farmerswife.com`, `ietf.org`, `en.wikipedia.org`.
   The GitHub *search* API is also disabled for this session
   (`"This GitHub API path is not available: sessions are bound to their configured
   repositories"`).

**What was actually reachable**, and therefore what this dossier is built from:

| Channel | Status | What it gave me |
| --- | --- | --- |
| `raw.githubusercontent.com` | working | curated index files |
| Anonymous `git clone` of public GitHub repos | working | **full source of 5 real products** |
| `gitlab.com/api/v4` project search | working | weak discovery only |
| `registry.npmjs.org` search | working | weak discovery only |
| `api.github.com` (repo-scoped only) | partial | no search |

**Consequences, stated plainly:**

- **There is not a single verified price in this dossier.** Not one vendor pricing page was
  reachable. Every price cell says UNKNOWN. Do not let a price appear here later without
  re-checking it against the live page. This is the single biggest gap.
- **The commercial crew-scheduling products in the seed list are largely unverifiable here.**
  For Deputy, Connecteam, Rentman and Planday I could verify *API surface only*, and only
  indirectly — by reading the open-source Pipedream integration components that call those APIs.
  That is a **second-hand but code-level** source: it shows real base URLs, real endpoint paths,
  real auth headers and real sample payloads, because the code would not work otherwise. I mark
  every such claim `[via Pipedream component]`.
- For **CrewLAN, Crew Cloud, Lasso, Humanity, Sling, ShiftBase, Papershift, Crewbrain,
  Crewmeister, staffomatic, Farmerswife, Croo, ProductionPro, Showday, Backstage/StaffCloud,
  EasyRoster, Setkeeper** I could verify **nothing at all** — not features, not prices, not even
  that the vendor still trades. They are listed in a separate, clearly-marked table and are
  **not** used to support any conclusion.
- The **open-source half of this dossier is strong**, because I could clone and read the actual
  source: Kimai, Frappe HR, Ever Gauzy, Timefold Solver quickstarts, and the Pipedream
  components. Those sections are genuine primary-source findings and are the parts worth acting on.

A short honest dossier beats a long fabricated one. The structural analysis below is real; the
commercial-market picture is deliberately thin.

---

## Segment summary

This category answers a different question from the equipment-side ERP covered in
[`event-rental-management.md`](event-rental-management.md). That one asks *"is the gear free?"*
This one asks **"is the person free, are they allowed to do this job, did they say yes, how many
hours did they work, and what do we owe them?"**

The functional spine, consistent across every system I could actually read (FACT):

```
person master data (+ skills, + rates, + employment type)
   → availability (declared by the person, or derived from leave/holidays/existing shifts)
   → demand (shift / call / duty with a required skill and a location)
   → assignment (pushed by a planner, or offered as an open shift and claimed)
   → confirmation / acceptance
   → actuals (check-in, check-out, breaks)
   → timesheet (draft → submitted → approved → locked)
   → payroll export and/or invoice
```

The hard problem is **not** drawing a calendar. It is that the same person is simultaneously a
*constraint set* (rest periods, qualifications, contract limits, declared unavailability), a
*counterparty* (they can decline), and a *cost line* (rate, overtime, travel, per-diem). Rostering
is a genuine combinatorial optimisation problem, which is why a dedicated solver category exists
alongside the SaaS products (see Timefold deep dive).

**Who buys it.** In the broadcast/AV context: OB and facilities providers, production companies,
rental houses that also supply crew, freelancer agencies, and in-house broadcaster resource
departments. Outside it, the same software sells to hospitality, retail, healthcare and security —
which matters, because **the general-purpose shift-work vendors dominate the category by revenue
and the production-specific tools are a niche within a niche** (INFERENCE, from the fact that
Deputy/Connecteam-class products are the ones with mature public APIs and broad integration
coverage, while I could not verify that the production-specific names in the seed list even have
public APIs).

**Typical price band: UNKNOWN.** No pricing page was reachable. The only price-shaped datum
available is second-hand and already flagged as weak: the sibling dossier records Rentman at
"€39/mo platform base + per power user, basic users (warehouse/crew) free", itself marked
`[via search summary]` there — i.e. two steps from a primary source. **Treat it as unverified.**
What I can say structurally (INFERENCE, not price data): the category almost universally prices
*per active person per month*, which makes it structurally expensive for exactly the customer
this segment claims to serve — an outfit with a long tail of freelancers used a few days a year.
The counter-pattern worth noting is Rentman's reported free "basic user" tier for crew, which if
accurate solves precisely that. Verify before relying on it.

---

## Product table

Legend for evidence strength:
**[cloned]** = I cloned and read the source. **[via Pipedream]** = verified by reading open-source
integration code that calls the vendor's live API. **[index]** = verified only as an entry in a
curated index file I opened.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **Deputy** | Deputy | Cloud SaaS + mobile | UNKNOWN | UNKNOWN | **Yes** — `https://{tenant}/api/v1`, OAuth Bearer, REST resources + **webhooks** with topics (`Timesheet.Save`) `[via Pipedream]` | Timesheet lifecycle with an unusually complete approval/payroll state machine |
| **Connecteam** | Connecteam | Cloud SaaS + mobile | UNKNOWN | UNKNOWN | **Yes** — `https://api.connecteam.com`, `X-API-KEY` header, versioned per-domain paths (`/scheduler/v1`, `/users/v1`, `/jobs/v1`, `/forms/v1`) `[via Pipedream]` | **Open shifts** (self-service claim) + GPS-anchored shifts + paid/unpaid breaks as first-class data |
| **Rentman** (crew module) | Rentman B.V. (NL) | Cloud SaaS + mobile | UNKNOWN (see caveat above) | UNKNOWN | **Yes** — `https://api.rentman.net/`, Bearer token, `crew` and `crew/{id}/crewavailability` resources `[via Pipedream]` | Crew availability *and* equipment *and* project in one data model — the closest fit to AV/event work |
| **Planday** | Planday (Xero) | Cloud SaaS | UNKNOWN | UNKNOWN | UNKNOWN — a Pipedream app slug exists but its component is an **empty stub** with no endpoints | UNKNOWN |
| **Kimai** | Kimai (community) | Self-hosted PHP/Symfony web | **Free, AGPL-3.0-or-later** `[cloned]` | Server-based; offline UNKNOWN | **Yes** — REST, `Authorization: Bearer` **or** `X-AUTH-TOKEN` header, OpenAPI-annotated `[cloned]` | Best-in-class **timesheet** primitives: rates, billable flag, export lock, CSV/XLSX/PDF/HTML export |
| **Frappe HR** | Frappe | Self-hosted Python + **Ionic/Vue PWA** | **Free, GPL-3.0** `[cloned]` | PWA with Workbox precaching `[cloned]`; true offline behaviour UNKNOWN | **Yes** — whitelisted RPC incl. a dedicated `roster` API `[cloned]` | The **widest verified functional coverage** of the twelve axes: shifts, self-service requests, skills with proficiency, travel+lodging, expenses, payroll |
| **Ever Gauzy** | Ever Co. | Self-hosted Node/Docker | **Free, AGPL-3.0** `[cloned]` | UNKNOWN | Yes (REST; detail UNKNOWN) | **Freelancer/contractor** modelling: bill rates, minimum rate, vetting, marketplace identity |
| **Timefold Solver** | Timefold | Java library (Quarkus/Spring) | **Community Apache-2.0**; separate **Enterprise** artifacts exist `[cloned]` | Library — runs fully local | Library, not a service | **Rostering as constraint optimisation**: skills, rest periods, fairness, home-base return |
| **solidtime** | solidtime | Self-hosted Docker | Free, AGPL-3.0 `[index]` | UNKNOWN | UNKNOWN | Time tracking aimed explicitly at **freelancers and agencies** `[index]` |
| **Traggo** | Traggo | Self-hosted Go/Docker | Free, GPL-3.0 `[index]` | UNKNOWN | UNKNOWN | Tag-based time spans, no task hierarchy `[index]` |
| **TimeTagger** | Almar Klein | Self-hosted Python | Free, GPL-3.0 `[index]` | UNKNOWN | UNKNOWN | Interactive timeline + reporting `[index]` |
| **Clockify** | COING | Cloud SaaS | UNKNOWN | UNKNOWN | Yes — `https://api.clockify.me/api/v1` `[via Pipedream]` | Timesheets at scale |
| **Personio** | Personio (DE) | Cloud SaaS | UNKNOWN | UNKNOWN | Yes — `https://api.personio.de/v1`, OAuth Bearer `[via Pipedream]` | German-market HR master data / the system crew tools export *into* |

### Named in the brief but NOT verifiable in this environment

I could not reach these domains and have no code-level evidence for them. **No feature, price or
capability claim is made about any of them.** They are recorded so the next pass knows what still
needs checking.

| Name (as briefed) | What must be checked when egress allows |
| --- | --- |
| CrewLAN, Crew Cloud, Croo, Showday, ProductionPro, Setkeeper crew | Existence, current vendor, whether a public API exists at all |
| Lasso | Positioning vs Deputy; production-crew specificity; API |
| Humanity, Sling, ShiftBase, Planday, Deputy (pricing), Connecteam (pricing) | Live pricing pages, per-user vs flat, free tiers for casual crew |
| **Papershift, Crewbrain, Crewmeister, staffomatic** (German market) | German labour-law features (ArbZG rest periods, Arbeitszeiterfassung duty), DATEV/LODAS export, AV-Auftragsverarbeitung terms |
| Farmerswife | Broadcast/post facility scheduling; resource+crew model |
| Backstage/StaffCloud, EasyRoster | Event-staffing specificity |

A note on the brief: it lists *"Yoast/Yoyo staffing tools"*. **Yoast is a WordPress SEO plugin
vendor** and almost certainly a transcription slip for something else. I could not determine what
was meant and have not guessed.

---

## Deep dives

### 1. Deputy — the timesheet state machine

**What it does.** General-purpose shift work: rostering, time clock, timesheets, pay rules.
Not production-specific.

**Data model (FACT `[via Pipedream]`).** The sample `Timesheet` payload emitted by the
`Timesheet.Save` webhook is unusually revealing — it is close to the real record shape:

```
Id, Employee, EmployeeHistory, EmployeeAgreement, Date,
StartTime, EndTime, Mealbreak, MealbreakSlots, Slots, TotalTime, Cost,
Roster, EmployeeComment, SupervisorComment, Supervisor,
Disputed, TimeApproved, TimeApprover, Discarded, ValidationFlag,
OperationalUnit, IsInProgress, IsLeave, LeaveId, LeaveRule,
Invoiced, InvoiceComment, PayRuleApproved, Exported, StagingId, PayStaged,
PaycycleId, AccrualState, MarkedPaidUnpaidAt, RealTime,
AutoProcessed, AutoRounded, AutoTimeApproved, AutoPayRuleApproved, ReviewState
```

Read that list carefully — it encodes an entire back-office pipeline as flags on one row:
**two independent approvals** (`TimeApproved` for hours, `PayRuleApproved` for money),
a **dispute** channel (`Disputed`, plus separate employee and supervisor comment fields),
**export/payroll staging** (`Exported`, `StagingId`, `PayStaged`, `PaycycleId`), a **billing**
channel (`Invoiced`, `Cost`), and an **automation audit trail** (`AutoRounded`,
`AutoTimeApproved` — i.e. the system records *that it decided*, separately from the value).
The `Roster` field links the actual back to the plan, which is what makes plan-vs-actual variance
reporting possible.

**Integrations.** OAuth2 bearer; per-tenant base URL `https://{endpoint}/api/v1`; resource-style
paths (`/resource/Company`, `/resource/Webhook`) alongside verb-style ones
(`/supervise/employee`, `/supervise/timesheet/start`). Webhooks are created by POSTing a
`{Topic, Enabled, Type: "URL", Address}` record to `/resource/Webhook` — i.e. **webhooks are
just another resource**, which is a clean design worth copying.

**Strengths.** The approval/dispute/export separation is the most mature thing I saw anywhere.
The `EmployeeAgreement` reference implies contract-terms-aware costing (INFERENCE).

**Limits.** Nothing production-specific: no call sheet, no travel, no per-diem, no
qualification-expiry concept visible in the payload. `Mealbreak` typed as a date-time in the
sample looks like a legacy wart (INFERENCE). Pricing and mobile quality UNKNOWN.

### 2. Connecteam — open shifts and the deskless-worker pattern

**What it does.** Deskless-workforce app: scheduler, jobs, users, forms.

**API shape (FACT `[via Pipedream]`).** Base `https://api.connecteam.com`, auth by
**`X-API-KEY` header** (simple API key, not OAuth), paths versioned per domain:
`/scheduler/v1/schedulers`, `/scheduler/v1/schedulers/{schedulerId}/shifts`,
`/users/v1/users`, `/jobs/v1/jobs`, `/forms/v1/forms/{formId}/form-submissions`.
Pagination is `limit`/`offset` with limit 100. Multiple named "schedulers" exist per account —
i.e. **the scheduler is itself a container**, not a single global calendar.

**Shift creation props (FACT `[via Pipedream]`, mirroring the documented POST body):**

```
startTime, endTime (ISO8601), title, timezone (tz database name),
isPublished, jobId, assignedUserId,
locationData: { gps: { address, latitude, longitude }, isReferencedToJob },
notes[] (HTML allowed),
breaks[]: { name, type: "paid"|"unpaid", startTime, duration },
isOpenShift  → when true, unlocks: isRequireAdminApproval
```

Three things here are directly stealable:

- **`isPublished` as an explicit field.** Draft rosters are invisible to crew until published.
  This is the single most important safety property in crew scheduling and it is a boolean.
- **`isOpenShift` + `isRequireAdminApproval`.** This is the self-service acceptance model in its
  minimal form: post a shift with no assignee, let people claim it, optionally gate the claim on
  admin approval. Two fields, entire feature.
- **Breaks are typed `paid`/`unpaid` and carry their own duration.** Break handling is where
  naive timesheet implementations produce wrong money.

**Limits.** `notes` accepting HTML is an injection surface (INFERENCE). No skills/qualification
field appears in the shift-creation surface I read — matching happens by `jobId` at best, so
**skill matching looks weak or absent** (INFERENCE, from absence in the API; would need the full
API reference to confirm). Travel/per-diem: absent from what I read.

### 3. Rentman crew module — the only verified AV-native crew model

**Why it matters here.** Rentman is the one product where crew scheduling sits in the *same*
data model as equipment and projects — which is exactly the AV Planner Suite's problem shape.

**FACT `[via Pipedream]`.** Base `https://api.rentman.net/`, `Authorization: Bearer {api_token}`.
Item types include `crew`, `crewavailability`, `projects`, `subprojects`, `appointments`,
`costs`, `projectrequests`, `projectrequestequipment`, `equipment`, `stockmovements`,
`contacts`, `contactpersons`, `invoices`, `payments`. Sub-resources are created at
`{parent}/{parentId}/{itemType}` — so crew availability is written to
**`crew/{crewId}/crewavailability`**.

**The `crewavailability` record (FACT `[via Pipedream]`):**

```
crewId, start, end, status, remark,
recurrenceIntervalUnit, recurrenceInterval, recurrenceEnddate
```

with `status` a **three-state enum**, documented in the component's own option labels:

| Value | Meaning (verbatim from the component) |
| --- | --- |
| `B` | "the crew availability status is available" |
| `N` | "the crew availability status is unavailable" |
| `O` | "the crew availability status is **unknown**" |

**This three-state model is the most important single finding in the dossier.** A boolean
available/unavailable is wrong, because "I haven't answered yet" is operationally different from
"no" — it is the state that drives chasing. Ever Gauzy independently reaches a three-state model
(`Available` / `Partial` / `Unavailable`, see below), which is weak convergent evidence that two
states is a design error (INFERENCE).

Note also that availability carries **recurrence** natively (weekly unavailability, e.g. a
freelancer's other standing gig) — not modelled as N separate records.

**Limits.** The single-letter enum with `B` meaning "available" is opaque and clearly historical
(INFERENCE — `B` is plausibly Dutch *beschikbaar*, but I could not verify that and am flagging it
as a guess, not a fact). No skills, travel, per-diem or timesheet-approval fields appear in the
crew surface I could read; whether they exist elsewhere in the API is UNKNOWN.

### 4. Frappe HR — the widest verified functional coverage

**What it does.** Full open-source HRMS (GPL-3.0), Python backend, **Ionic/Vue PWA** front end.
It is not a broadcast tool, but it is the only system I could read end-to-end that covers nearly
every axis in the brief.

**Data model (FACT `[cloned]`, field lists extracted from the DocType JSON schemas).**

*Shifts:*

```
Shift Type:        start_time, end_time, holiday_list,
                   determine_check_in_and_check_out, working_hours_calculation_based_on,
                   working_hours_threshold_for_half_day, working_hours_threshold_for_absent,
                   begin_check_in_before_shift_start_time,
                   late_entry_grace_period, early_exit_grace_period,
                   allow_check_out_after_shift_end_time,
                   enable_auto_attendance, enable_late_entry_marking,
                   enable_early_exit_marking, allow_overtime, overtime_type
Shift Assignment:  employee, shift_type, start_date, end_date, status,
                   shift_location, shift_request, shift_schedule_assignment, overtime_type
Shift Request:     employee, shift_type, from_date, to_date, status, approver
Employee Checkin:  employee, log_type, shift, time, device_id, skip_auto_attendance,
                   attendance, shift_start, shift_end, shift_actual_start, shift_actual_end,
                   geolocation, latitude, longitude, offshift, overtime_type
```

Two patterns stand out. First, **`Shift Request` is a separate document from `Shift Assignment`,
with its own `approver` and `status`** — self-service is modelled as a *request object that
becomes an assignment*, not as a mutable flag on the assignment. That is the right shape: it
leaves an audit trail of who asked and who approved. Second, **`shift_actual_start`/
`shift_actual_end` sit alongside `shift_start`/`shift_end` on the check-in record** — plan and
actual are stored on the same row, so variance needs no join.

*Skills (FACT `[cloned]`):*

```
Skill                 (master)
Employee Skill        skill, proficiency: Rating, evaluation_date
Employee Skill Map    employee, designation, employee_skills[], trainings[]
Designation Skill     skill                     (skills expected for a role)
Expected Skill Set    skill, description
Skill Assessment      skill, rating
```

This is a **graded, dated** competency model — `proficiency` is a rating, not a boolean, and
`evaluation_date` means competence can be treated as *stale*. Contrast Timefold, where skills are
plain set membership.

*Travel and expenses (FACT `[cloned]`) — the only verified travel model in the whole segment:*

```
Travel Request:          travel_type, travel_funding, travel_proof, purpose_of_travel,
                         details_of_sponsor, employee, passport_number,
                         personal_id_type, personal_id_number, date_of_birth,
                         itinerary[], costings[], cost_center,
                         name_of_organizer, address_of_organizer
Travel Itinerary:        travel_from, travel_to, mode_of_travel, meal_preference,
                         travel_advance_required, advance_amount,
                         departure_date, arrival_date,
                         lodging_required, preferred_area_for_lodging,
                         check_in_date, check_out_date
Travel Request Costing:  expense_type, sponsored_amount, funded_amount, total_amount
```

`lodging_required` + `check_in_date` + `check_out_date` + `preferred_area_for_lodging` is a
genuine **hotel** model. `travel_advance_required` + `advance_amount`, plus the separate
`Employee Advance` and `Expense Claim` DocTypes, is the closest thing to **per-diem** I could
verify anywhere — though note it is a *generic advance/claim* mechanism, **not** a per-diem rate
table (see white space).

*Roster API (FACT `[cloned]`, `hrms/api/roster.py`).* `get_events(month_start, month_end,
employee_filters, shift_filters)` returns **holidays, leaves and shifts merged into one keyed
event map**. Filters are whitelisted server-side against
`{status, company, department, branch, designation, employee_name}` and
`{shift_type, status, shift_location}`, throwing `frappe.PermissionError` otherwise — a good
security pattern for a filter API. `create_shift_schedule_assignment(...)` takes
`repeat_on_days[]` + `frequency` and materialises concrete shifts, but **only expands eagerly
when the range is ≤ 90 days** (`if not end_date or date_diff(end_date, start_date) <= 90`) —
a pragmatic recurrence-explosion guard worth copying.

**Mobile (FACT `[cloned]`).** `frontend/package.json` declares `@ionic/vue`, `vite-plugin-pwa`,
`workbox-precaching` and **`firebase`**; the backend exposes
`are_push_notifications_enabled()` reading `Push Notification Settings.enable_push_notification_relay`.
So: Ionic PWA + Workbox + FCM push relay. Whether the PWA genuinely works offline is **UNKNOWN** —
Workbox precaching guarantees the shell loads, not that data entry queues.

**Limits.** No DATEV/LODAS export — verified negative: a case-insensitive grep for
`datev|lodas|elster` across Kimai and Frappe HR source returns **only six hits of the variable
name `dateV`**, i.e. zero real matches. Payroll is generic (salary structures, components, income
tax slabs) and India-leaning in its regional modules. Not broadcast-aware.

### 5. Kimai — the timesheet reference implementation

**FACT `[cloned]`.** `kimai/kimai`, **AGPL-3.0-or-later**, version constant `2.66.0` in
`src/Constants.php`.

**Timesheet entity fields (FACT `[cloned]`, from `src/Entity/Timesheet.php`):**

```
id, date, begin, end, timezone, localized, duration, break,
user, activity, project, description,
rate, internalRate, fixedRate, hourlyRate,
exported, billable, billableMode, category, tags[], meta[]
```

The rate design is the notable part: **four separate rate fields**. `rate` (the computed money),
`internalRate` (what the person costs *us* — the margin calculation), and `fixedRate`/`hourlyRate`
as the two mutually exclusive pricing modes. Any system that stores one rate cannot answer
"did we make money on this crew day".

`exported: bool` is a **lock flag**: once a timesheet is exported to payroll/accounting it is
frozen. There is a dedicated endpoint to toggle it — `PATCH /timesheets/{id}/export`. This is the
correct answer to the "someone edited a timesheet after payroll ran" problem, and it costs one
column.

**API (FACT `[cloned]`).** REST with OpenAPI annotations. Auth accepts
**`Authorization: Bearer …`** (matched in `ApiRequestMatcher`) or the legacy
**`X-AUTH-TOKEN`** header (`TokenAuthenticator::HEADER_TOKEN`). Timesheet routes:

```
GET    /timesheets            GET  /timesheets/{id}       POST   /timesheets
PATCH  /timesheets/{id}       DELETE /timesheets/{id}
GET    /timesheets/recent     GET  /timesheets/active
PATCH  /timesheets/{id}/stop           PATCH /timesheets/{id}/restart
PATCH  /timesheets/{id}/duplicate      PATCH /timesheets/{id}/export
PATCH  /timesheets/{id}/meta
```

`/active` and `/stop` mean **running timers are a first-class server-side concept**, not client
state — the right call for a phone that dies mid-shift.

**Export (FACT `[cloned]`).** Renderer factories for **CSV, XLSX, PDF, HTML**; invoice renderers
additionally cover **DOCX and ODS** plus a Twig template path. Templates are user-editable, which
is how it survives contact with local accounting formats.

**Limits.** Kimai is a *timesheet* system, not a scheduler: there is no shift, no roster, no
availability, no assignment in the entity set. It is the back half of the pipeline only.

### 6. Timefold Solver — rostering as constraint optimisation

**FACT `[cloned]`,** `TimefoldAI/timefold-quickstarts`, quickstarts under **Apache-2.0**; the
`employee-scheduling` POM references both `timefold-solver-bom` and a separate
`timefold-solver-enterprise-bom` / `timefold-solver-enterprise-quarkus` — i.e. an **open-core**
model with paid Enterprise artifacts. (Successor to OptaPlanner; the lineage claim is INFERENCE,
I could not open a page confirming it.)

**Domain (FACT `[cloned]`):**

```java
class Employee { String name; Set<String> skills;
                 Set<LocalDate> unavailableDates, undesiredDates, desiredDates; }

@PlanningEntity
class Shift { LocalDateTime start, end; String location; String requiredSkill;
              @PlanningVariable Employee employee; }
```

**Three-tier preference is the key idea**: `unavailableDates` (hard), `undesiredDates` (soft
penalty), `desiredDates` (soft *reward*). Most products model only the first. Encoding "I'd
rather work Saturday" as a reward is what makes a roster feel fair rather than merely legal.

**Constraints (FACT `[cloned]`, `EmployeeSchedulingConstraintProvider`):**

| Constraint | Type | Notes |
| --- | --- | --- |
| `Missing required skill` | hard | set membership: `!employee.skills.contains(shift.requiredSkill)` |
| `Overlapping shift` | hard | penalised **by overlap minutes**, not as a boolean |
| `At least 10 hours between 2 shifts` | hard | penalised by `(10*60) - breakLength` — proportional |
| `Max one shift per day` | hard | |
| `Unavailable employee` | hard | penalised by overlapping minutes with the unavailable date |
| `Undesired day for employee` | soft | penalty ∝ overlapping minutes |
| `Desired day for employee` | soft | **reward** ∝ overlapping minutes |
| `Balance employee shift assignments` | soft | `ConstraintCollectors.loadBalance(...)` → `LoadBalance::unfairness` |

Two patterns to steal. **(a) Violations are scored by magnitude, not counted.** A 9h55m rest gap
scores far better than a 2h gap; a boolean rule cannot express that and produces rosters that are
technically feasible and practically awful. **(b) Fairness is an explicit optimisation term** with
a built-in load-balance collector, and the `.complement(Employee.class, e -> 0L)` call
deliberately includes employees with **zero** shifts in the balance calculation — the classic bug
being that the person who got nothing is invisible to a group-by.

**The `flight-crew-scheduling` quickstart (FACT `[cloned]`)** adds the travel dimension the SaaS
products lack:

```java
class Employee { Airport homeAirport; List<String> skills; List<LocalDate> unavailableDays; }
class Flight   { departureAirport, departureUTCDateTime, arrivalAirport, arrivalUTCDateTime; }
```

with constraints `Transfer between two flights`, `First assignment not departing from home` and
`Last assignment not arriving at home`. That is **geographic continuity**: a person is physically
somewhere at the end of a duty, and must get home. Rendered into AV terms, this is the OB-van
crew problem exactly — and no scheduling *product* I could verify models it.

**Limits.** It is a library. No UI, no persistence, no auth, no mobile, no notifications. All
times are `LocalDateTime` in the employee quickstart (the flight one uses UTC explicitly) —
timezone handling is the integrator's problem. Enterprise features are paid; the split is UNKNOWN.

---

## Capability analysis against the twelve axes in the brief

| Axis | Best verified implementation | Verdict |
| --- | --- | --- |
| **Availability** | Rentman `crewavailability` (3-state + recurrence); Gauzy `AvailabilityStatusEnum` (Available/Partial/Unavailable); Timefold 3-tier preference | **Solved, and the good answer is ≥3 states.** Frappe derives it instead (holidays ∪ leave ∪ shifts) — also valid |
| **Self-service shift acceptance** | Connecteam `isOpenShift` + `isRequireAdminApproval`; Frappe `Shift Request` as a distinct approvable document | **Solved.** Two competing shapes: claim-an-open-shift vs request-and-approve |
| **Qualifications / skills matching** | Frappe (graded `proficiency` + `evaluation_date`, `Designation Skill` for role requirements); Timefold (hard constraint on set membership) | **Partly solved.** Nobody verified combines *graded* skills with *solver* matching; and no expiry/certification-validity concept found anywhere |
| **Travel & hotel** | Frappe `Travel Itinerary` (`lodging_required`, `check_in_date`, `check_out_date`, `mode_of_travel`, `meal_preference`) | **Rare.** Only one verified implementation, and it is not linked to the shift |
| **Per-diem** | Frappe `travel_advance_required`/`advance_amount`, `Employee Advance`, `Expense Claim` | **Not solved.** Generic advances/claims only. No per-diem *rate table* (country/duration bands) found anywhere — see white space |
| **Timesheets & hours** | Kimai (4 rate fields, `break`, `exported` lock, server-side running timers); Deputy (dual approval, dispute, `Mealbreak`) | **Solved, maturely** |
| **Payroll export** | Deputy (`Exported`, `StagingId`, `PayStaged`, `PaycycleId`); Kimai (CSV/XLSX/PDF + DOCX/ODS invoices, editable templates) | **Solved as a generic file/state problem; UNSOLVED for German payroll** — verified negative on DATEV/LODAS in both OSS systems |
| **Mobile app quality** | Frappe: Ionic/Vue + Workbox PWA + Firebase push `[cloned]` | **UNKNOWN as "quality".** I can verify stack, never UX. Commercial mobile apps entirely unverifiable here |
| **Notifications** | Frappe FCM push relay; Deputy webhooks (`Timesheet.Save`); Connecteam `isPublished` gate | **Solved technically.** The interesting design is `isPublished` — controlling *when* crew get told |
| **Freelancer vs employee** | Gauzy: `billRateValue`, `billRateCurrency`, `minimumBillingRate`, `payPeriod`, `isVetted`, `isJobSearchActive`, `upworkId`, `reWeeklyLimit` `[cloned]` | **Weakly solved.** Gauzy models the *marketplace freelancer*; nobody verified models the *European freelance crew* case (own invoice, own insurance, Scheinselbstständigkeit risk) |
| **GDPR** | Verified negative: grep for `gdpr|dsgvo|privacy` across Kimai `src/` + templates hits **only `src/Utils/Parsedown.php`** (a false positive) | **Not addressed in the OSS tools.** And Gauzy ships the opposite: `allowScreenshotCapture`, `trackKeyboardMouseActivity`, `trackAllDisplays` — surveillance fields that are a works-council/Art. 88 minefield in DE |
| **Cost** | — | **UNKNOWN. Zero verified prices.** The one structural observation: per-active-user pricing punishes the long freelancer tail |

---

## Standards & protocols

Honest summary: **this segment has no interchange standard.** That is itself the finding.

**What I verified:**

- **HTTP/JSON REST is the universal wire protocol.** Every commercial API I could inspect is
  JSON over HTTPS. Auth splits three ways: OAuth2 bearer (Deputy, Personio), static API key in a
  custom header (Connecteam `X-API-KEY`, Kimai `X-AUTH-TOKEN`), or bearer token (Rentman, Kimai).
- **Webhooks are the push mechanism**, and Deputy models them as a normal REST resource
  (`POST /resource/Webhook` with `{Topic, Enabled, Type, Address}`), topics named
  `Entity.Verb` e.g. `Timesheet.Save` (FACT `[via Pipedream]`).
- **ISO 8601 for instants, IANA tz database names for zones.** Connecteam's shift API takes
  `startTime`/`endTime` as ISO8601 and a separate `timezone` "in Tz format (e.g.
  America/New_York)" (FACT `[via Pipedream]`). Rentman uses `YYYY-MM-DDTHH:MM:SSSZ`. Note the
  contrast with Timefold's `LocalDateTime` (zone-less) — **a real interop hazard**.
- **Tabular export is the actual integration path.** Kimai renders CSV, XLSX, PDF, HTML (and
  DOCX/ODS for invoices) via swappable, user-editable templates (FACT `[cloned]`). In practice
  payroll integration in this segment is *a spreadsheet with an agreed column order*.
- **Weak signal: no iCalendar anywhere.** A grep for `icalendar|\.ics|VEVENT` across Kimai,
  Frappe HR and the Gauzy contracts returned **zero hits** (FACT, verified negative). Given that
  every one of these systems produces per-person date-ranged events, the absence of ICS export is
  notable — crew cannot subscribe to their own schedule from these systems' core code.

**What I could NOT verify (all UNKNOWN, all worth checking next pass):**

- **RFC 5545 (iCalendar) / RFC 6350 (vCard)** as the crew-facing publish format — the obvious
  candidate, but `ietf.org` was unreachable and I found no in-code usage.
- **DATEV ASCII / DATEV LODAS** — the German payroll interchange formats. Verified absent from
  the two OSS systems; presence in Papershift/Crewbrain/Personio is UNKNOWN and is *the* decisive
  question for the German market.
- **SCIM (RFC 7644)** for user provisioning, **HR Open Standards** (formerly HR-XML) for
  assignment/timecard interchange, **ISO 8601-2 / RFC 5545 RRULE** for the recurrence Rentman
  clearly implements. None verifiable.
- **ELSTER / SV-Meldung**, German statutory reporting. Unreachable.
- **EN 16931 / ZUGFeRD / XRechnung / Peppol** for freelancer invoices. Only an indirect hint:
  the awesome-selfhosted entry for the `drytrix/TimeTracker` project advertises "multi-currency
  invoicing (PDF, Peppol/ZugFerd e-invoicing)" `[index]` — I did not open that project.

---

## What this segment does WELL — patterns worth stealing

1. **Three-state availability, not boolean.** Rentman `B`/`N`/`O` where `O` is explicitly
   *unknown*; Gauzy `Available`/`Partial`/`Unavailable`. Two independent systems converge on
   ≥3 states. "Not yet answered" is the state your whole chase workflow hangs off.
2. **Availability carries recurrence.** Rentman stores `recurrenceIntervalUnit`,
   `recurrenceInterval`, `recurrenceEnddate` on the availability record — a freelancer's standing
   Tuesday commitment is one row, not fifty.
3. **`isPublished` on the roster.** Connecteam. Draft rosters must be invisible. One boolean
   prevents the worst class of crew-scheduling incident.
4. **Self-service as a request *document*, not a flag.** Frappe's `Shift Request` has its own
   `approver` and `status` and produces a `Shift Assignment`. Audit trail for free.
5. **Plan and actual on the same row.** Frappe `Employee Checkin` carries `shift_start`/`shift_end`
   *and* `shift_actual_start`/`shift_actual_end`; Deputy's timesheet links back via `Roster`.
   Variance reporting with no join.
6. **The export lock.** Kimai's `exported` boolean + `PATCH /timesheets/{id}/export`. Freeze the
   record when money has moved. One column, one endpoint.
7. **Two independent approvals.** Deputy separates `TimeApproved` (hours are right) from
   `PayRuleApproved` (money is right). Different people, different competence, different timing.
8. **Record that automation decided.** Deputy's `AutoRounded`, `AutoTimeApproved`,
   `AutoPayRuleApproved`, `AutoProcessed` flags. When a dispute arrives you can tell whether a
   human or a rule produced the number.
9. **Score violations by magnitude.** Timefold penalises rest-period breaches by
   `(10*60) - breakLength` minutes and overlaps by overlap-minutes. Booleans make bad rosters.
10. **Fairness as an explicit objective**, including the people with zero assignments
    (Timefold's `.complement(Employee.class, e -> 0L)`).
11. **Preferences as reward, not just penalty.** Timefold's `desiredDates` earns score. Rosters
    people *like* need a positive term.
12. **Graded, dated competence.** Frappe's `Employee Skill.proficiency: Rating` +
    `evaluation_date`, with `Designation Skill` declaring what a role needs.
13. **Guard recurrence expansion.** Frappe materialises shifts eagerly only for ranges ≤ 90 days.
14. **Whitelist filter keys server-side.** Frappe's roster API throws `PermissionError` on any
    filter key outside an explicit allow-list.
15. **Editable export templates.** Kimai's Twig/spreadsheet templates are why it survives contact
    with arbitrary local accounting requirements.

---

## What NOBODY in this segment solves well — the white space

1. **Per-diem as a rate table.** Verified gap. The best implementation I found (Frappe) offers a
   generic *advance* and a generic *expense claim*. Nobody models what German AV production
   actually runs on: statutory **Verpflegungsmehraufwand** bands (the 8h / 24h / arrival-departure
   day structure), country-specific rates, and the meal-provided deductions. This is arithmetic on
   a table plus a shift's start/end — genuinely small to implement, and absent everywhere I looked.
2. **Travel is not linked to the shift.** Frappe has a real `Travel Itinerary` with lodging dates,
   but it hangs off a `Travel Request` document, not off the roster. Nothing I read answers
   "this person is called at 06:00 in Munich and lives in Hamburg, therefore a hotel the night
   before is implied." The *inference from call time + home base to travel need* is unimplemented.
3. **Geographic continuity is in the solver but not in any product.** Timefold's flight-crew
   quickstart models home base, transfers, and returning home. No scheduling *product* I could
   verify knows a person is physically somewhere at the end of a shift. For multi-day OB work this
   is the actual constraint.
4. **Qualification *expiry*.** Frappe grades skills and dates the evaluation, but nothing anywhere
   models a certificate that *lapses* — rigging tickets, first aid, IPAF/PASMA, driving licence
   classes, working-at-height medicals. In AV this is a legal gate, not a preference.
5. **Crew and equipment planned as one constraint.** Rentman is the only verified system with both
   in one model, and even there the crew module and the equipment module are separate resource
   families. Gauzy's `EquipmentSharing` (`REQUESTED`/`APPROVED`/`REFUSED`, employees *or* teams)
   is the closest verified attempt. Nobody answers "this camera package requires an operator with
   this skill, so booking the package books the person."
6. **No open interchange format.** Verified: no ICS anywhere in three OSS codebases; every API is
   a bespoke JSON dialect; every payroll handoff is a bespoke spreadsheet. There is no
   "crew call sheet" exchange format the way there are patch/plot formats on the equipment side.
7. **German statutory compliance is invisible in open source.** Verified negative on DATEV/LODAS.
   Also absent: ArbZG rest-period enforcement as a *rule* (Timefold hard-codes a 10h gap in a
   demo, which is not the same as configurable statutory compliance), and the post-2022
   Arbeitszeiterfassung recording duty.
8. **GDPR is unaddressed and in places actively inverted.** Verified: no privacy/GDPR handling in
   Kimai's source; Gauzy ships `allowScreenshotCapture`, `trackKeyboardMouseActivity`,
   `trackAllDisplays`, `allowAgentAppExit`. A tool with a *stated* data-minimisation posture —
   retention limits, no surveillance telemetry, self-hosting — is differentiating in DE/EU
   (INFERENCE, but a well-founded one).
9. **The long freelancer tail is priced out.** Per-active-user pricing is the norm (INFERENCE from
   the category's shape; no prices verified). A crew pool of 300 people used 3 days a year each
   is the AV reality and the worst possible fit for that model.
10. **Nothing is offline-first.** Every commercial product here is cloud SaaS; the best OSS mobile
    story is a Workbox-precached PWA whose actual offline data behaviour is UNKNOWN. Crew work
    happens in trucks, arenas and basements with no signal.

---

## Relevance to AV Planner Suite

The suite is `apps/{shell, cable-planner, multicam-planner, light-planner}` plus
`packages/{ui, inventory-core, onboarding-core, lexware-core}`, MIT, offline-first Electron.

**Primary relevance: `shell` / suite level.** Crew is *cross-cutting* — the same person is on the
cable job, the camera job and the lighting job. Modelling crew inside one planner would be a
mistake; it belongs beside `inventory-core` as a shared package (INFERENCE, but strongly implied
by the fact that Rentman — the only AV-native verified example — keeps crew, equipment and
projects in one resource family).

Concretely:

- **`packages/inventory-core` → a sibling `crew-core`.** Reuse the three-state availability
  pattern (available / unavailable / **unknown**) with recurrence, verified in Rentman and
  corroborated by Gauzy. This is the highest-confidence, lowest-cost import in the dossier.
- **`packages/lexware-core` is the sharpest strategic hook.** The suite already has a German
  billing integration. The verified white space — **no per-diem rate table anywhere, no
  DATEV/LODAS in open source** — sits exactly on top of it. A crew module that computes German
  Verpflegungsmehraufwand from shift start/end and emits something Lexware can consume would be
  differentiating in a way none of the researched products are. Caveat: whether Lexware Office
  covers payroll (vs. invoicing only) is **UNKNOWN** and must be checked before scoping this.
- **`cable-planner`, `multicam-planner`, `light-planner`** each consume crew rather than own it:
  a job needs *N* people with skill *X* on date *Y*. That "demand" record is the only crew concept
  the individual planners need — mirroring Timefold's `Shift{location, requiredSkill}`, which is
  deliberately tiny.
- **Skills matching maps directly onto existing domain vocabulary.** `light-planner` already knows
  about rigging; a `requiredSkill` on a task plus Frappe's graded+dated proficiency model, plus
  the missing **expiry** field nobody implements, is a small, high-value addition.
- **Offline-first is a genuine differentiator here**, not just a house style. Every product in
  this segment is cloud SaaS; the suite is Electron and local-first by construction. Crew call
  sheets and timesheets captured in a truck with no signal is a real, unserved case (INFERENCE).
- **Not relevant:** `broadcast-intercom`, `tally-pi`, `sony-camera-bridge`, `pi-media-station`.
  These are device/signal-path components with no personnel dimension. (Note: they are named in
  the brief but do not appear in this repo's current `apps/`|`packages/` tree.)

**Scope warning (INFERENCE, and the most important line in this section).** Deputy's timesheet
payload is ~40 fields of approval, dispute, staging and payroll state. Kimai is a 2.66-series
product doing *only* timesheets. Building "crew scheduling" properly means building payroll-grade
record-keeping with legal consequences. The defensible scope for this suite is
**demand + availability + assignment + skills + per-diem/travel arithmetic**, with an *export* to
a real payroll system — not an attempt to replace one.

---

## Sources

**Opened directly (raw file fetch):**

- https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md —
  sections *Human Resources Management (HRM)*, *Time Tracking*, *Booking and Scheduling*,
  *Resource Planning*. Source of licence/language facts for Kimai, Frappe HR, Ever Gauzy,
  solidtime, Traggo, TimeTagger, admidio, MintHCM, Dolibarr, ERPNext, Odoo, and of the verified
  negative that **no dedicated open-source crew-dispatch product is indexed**.

**Cloned and read in full (anonymous git over the session proxy):**

- https://github.com/TimefoldAI/timefold-quickstarts — files read:
  `use-cases/employee-scheduling/src/main/java/org/acme/employeescheduling/domain/Employee.java`,
  `…/domain/Shift.java`, `…/solver/EmployeeSchedulingConstraintProvider.java`,
  `use-cases/flight-crew-scheduling/src/main/java/org/acme/flighcrewscheduling/domain/{Employee,Flight,FlightAssignment}.java`,
  `…/flight-crew-scheduling/src/main/java/org/acme/flighcrewscheduling/solver/*.java`,
  `use-cases/employee-scheduling/pom.xml`, `LICENSE.txt`.
- https://github.com/kimai/kimai — files read: `src/Constants.php`, `src/Entity/Timesheet.php`,
  `src/API/TimesheetController.php`, `src/API/Authentication/{ApiRequestMatcher,TokenAuthenticator}.php`,
  `src/Export/Renderer/*`, `src/Invoice/Renderer/*`, `composer.json`.
- https://github.com/frappe/hrms — files read:
  `hrms/hr/doctype/{shift_type,shift_assignment,shift_request,employee_checkin,travel_request,travel_itinerary,travel_request_costing}/*.json`,
  `hrms/hr/doctype/{employee_skill,employee_skill_map,expected_skill_set,skill_assessment,designation_skill}/*.json`,
  `hrms/api/roster.py`, `hrms/api/__init__.py`, `frontend/package.json`.
- https://github.com/ever-co/ever-gauzy — files read (sparse checkout of
  `packages/contracts/src/lib`): `employee-availability.model.ts`, `availability-slots.model.ts`,
  `employee.model.ts`, `timesheet.model.ts`, `equipment-sharing.model.ts`.
- https://github.com/PipedreamHQ/pipedream — sparse checkout of
  `components/{deputy,planday,connecteam,rentman,personio,clockify}`; files read:
  `deputy/deputy.app.mjs`, `deputy/sources/common/base.mjs`,
  `deputy/sources/new-timesheet-saved/{new-timesheet-saved,test-event}.mjs`,
  `connecteam/connecteam.app.mjs`, `connecteam/common/constants.mjs`,
  `connecteam/actions/create-shift/create-shift.mjs`,
  `rentman/rentman.app.mjs`, `rentman/common/{constants,props}.mjs`,
  `planday/planday.app.mjs` (stub), `clockify/clockify.app.mjs`, `personio/personio.app.mjs`.

**Opened as API endpoints:**

- https://registry.npmjs.org/-/v1/search?text=planday — discovery only; established that
  `@pipedream/planday` exists.
- https://gitlab.com/api/v4/projects?search=shift%20scheduling — discovery only; no product-grade
  result used in this dossier.
- https://api.github.com/rate_limit and https://api.github.com/search/repositories — probed;
  search confirmed **disabled** for this session.

**Repo-internal:**

- `/home/user/av-planner-suite/docs/research/landscape/event-rental-management.md` — read for the
  Rentman price figure, which is second-hand there and remains unverified here.
- `/home/user/av-planner-suite/README.md`, `apps/`, `packages/` — for the relevance section.

**Cited *inside* the sources above but NOT opened by me** (the Pipedream components link to them;
listed so the next pass can go straight there):

- `https://developer.connecteam.com/reference/create_shifts_scheduler_v1_schedulers__schedulerid__shifts_post`
- `https://api.connecteam.com`, `https://api.rentman.net/`, `https://api.clockify.me/api/v1`,
  `https://api.personio.de/v1`

**Probed and confirmed unreachable** (HTTP 000 / CONNECT refused): crewbrain.de, papershift.com,
deputy.com, connecteam.com, planday.com, rentman.io, lasso.io, sling.blue, shiftbase.com,
staffomatic.com, crewmeister.com, humanity.com, kimai.org, timefold.ai, frappe.io, odoo.com,
solidtime.io, setkeeper.com, farmerswife.com, ietf.org, en.wikipedia.org, codeberg.org,
cdn.jsdelivr.net, unpkg.com.
