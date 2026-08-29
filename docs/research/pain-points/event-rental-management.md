# Pain points: Event / Rental Management (ERP for AV rental houses)

Research date: 2026-08-29 (the task brief was dated 2026-08-28; all prices below are
labelled with the date they were seen).
Researcher: automated user-research pass, AV Planner Suite research corpus.

---

## Method

### What was searched

26 distinct web searches were run across the angles required by the brief, in
English and German:

- **Review-site content**: Capterra (US/AU/UK/IN/DE), G2, GetApp (US/UK/ZA),
  Software Advice, TrustRadius, SoftwareConnect, SelectHub, SourceForge,
  Trustpilot, OMR Reviews (DE) — searched for "cons", 1-3 star content,
  and complaint language per product.
- **Reddit / forums**: r/livesound, r/VIDEOENGINEERING, ProSoundWeb, ControlBooth,
  Blue Room, PA-Forum (DE), plus `site:reddit.com` queries.
- **GitHub**: open-source products in the segment and API-client / API-doc
  repositories for the commercial ones.
- **Vendor primary sources**: public roadmaps (Rentman Productboard), API docs
  (Rentman, Current RMS, Booqable Boomerang), changelogs, help centres, pricing
  pages, status pages (StatusGator).
- **German-language**: PA-Forum, softguide.de, event-partner.de, OMR, vt-stage,
  Capterra Deutschland.
- **Adjacent**: AV signal-flow / cable-schedule tooling, to test whether rental
  ERPs cover technical planning at all.

### Serious methodological caveat — read this before trusting anything below

**This session's network egress proxy blocked direct page fetches for almost
every third-party review site, vendor site and forum.** Confirmed blocked
(HTTP 403 at the proxy, or `EGRESS_BLOCKED`): `capterra.com`, `capterra.in`,
`capterra.com.au`, `g2.com`, `trustpilot.com`, `getapp.com`,
`softwareadvice.com`, `softwareconnect.com`, `sourceforge.net` (reachable but
empty), `reddit.com` / `old.reddit.com`, `rentman.io`, `support.rentman.io`,
`portal.productboard.com`, `hirehop.com`, `api.current-rms.com`, `dh7.dev`,
`forums.prosoundweb.com`, `paforum.de`, `omr.com`, `apps.apple.com`,
`frontdeskreview.com`.

Consequences, stated plainly:

1. **Most evidence below is second-hand**: it comes from search-engine
   extractions of those pages (the search tool reads and quotes the page
   content), not from me opening the page. Where that is the case I mark the
   evidence `via search extract of <URL>`. This is weaker than a direct read: I
   cannot see the star rating attached to a given sentence, the reviewer's role,
   or the review date, unless the extract carried it.
2. **I could not verify review dates for most items.** A 2019 complaint and a
   2026 complaint look identical in an extract. Where a date is unknown I say so.
   This materially weakens claims about products that have been rewritten
   (Flex 4 → Flex 5 especially).
3. **Reddit produced essentially nothing.** Neither `site:reddit.com` queries nor
   natural-language queries surfaced usable threads for this segment, and
   reddit.com itself is unreachable. **The Reddit angle of this brief is
   effectively unexecuted.** Treat the absence of Reddit evidence as a gap in the
   method, not as evidence that AV pros do not complain about these tools there.
4. **Pages I actually opened and read directly** (the only fully first-hand
   evidence here): GitHub only —
   `Shelf-nu/shelf.nu` issues and discussions, `bit8bytes/gearberg` README,
   `booqable/api-documentation` issues, `booqable/boomerang-api-documentation`
   issues and CHANGELOG. That is 6 pages.
5. **No direct quotes are reproduced verbatim below.** Everything in the "quotes"
   section is a paraphrase, because I could not open the source page to confirm
   exact wording. Nothing here is invented, but nothing here should be pasted
   into marketing as a quotation.

### Evidence labelling used throughout

- **FACT** — read on a page (directly, or extracted from that page by the search
  tool), with the URL given.
- **INFERENCE** — my reasoning from the facts. Flagged as such.
- **UNKNOWN / unverified** — I could not confirm it and say what would be needed.

Frequency labels: `isolated` = one comment; `recurring` = several independent
sources; `widespread` = a theme visible across many independent sources.

---

## Per-product findings

### Rentman (Rentman B.V., NL)

**STRENGTHS (conceded by critics)**
- Reviewers who complain about setup still call it easy to use and easy to teach
  *once properly configured*, and repeatedly praise support responsiveness and
  willingness to ship requested changes. (FACT, via search extract of
  `capterra.com/p/144616/Rentman/reviews/`)
- One of the few event-rental products with integrated RFID tracking. (FACT, via
  search extract of `rent2b.net/de/blog/verleihsoftware-vergleich-2026-de` — note
  this is a competitor's comparison blog, so weigh accordingly.)

**WEAKNESSES**
- Long, slow onboarding. Recurring reviewer language: hard/slow learning curve,
  "the time and patience needed to setup", "as a small company it's not been a
  quick setup". (FACT, recurring, via search extract of Capterra reviews)
- Reporting depth: "not great on the reporting detail"; financial calculations
  need extra manual work outside the system. (FACT, recurring, same source)
- Template editing is difficult — this appears in multiple independent extracts.
  (FACT, recurring)

**MISSING FEATURES (what users request)**
- **Write access to the API** was historically absent. Project-creation endpoints
  (`POST /projects`, `POST /projects/{id}/subprojects`) are described as **BETA**.
  Tasks became readable/creatable via linked-resource endpoints and `/tasks`.
  (FACT, via search extracts of `rentman.io/product-updates/create-projects-in-rentman-with-the-api`
  and the Rentman API changelog). A public roadmap card literally titled
  "API endpoints to write projects" exists. (FACT, URL:
  `portal.productboard.com/rentman/1-rentman-public-roadmap/c/60-api-endpoints-to-write-projects`
  — I could not open it, so vote counts are UNKNOWN.)
- "Public API" is described by Rentman as **one of its most requested features**
  — i.e. the company concedes the gap existed. (FACT, via search extract of
  `portal.productboard.com/rentman/1-rentman-public-roadmap/c/13-public-api`)
- **Creating projects from the mobile app** is "often requested" and still on the
  roadmap. (FACT, via search extract of Rentman roadmap/support content.)
- Improved crew-planner overview when many projects run simultaneously; optimal
  transport planning; crew documents; activities view — all open roadmap cards.
  (FACT, titles only, from `site:portal.productboard.com` search results.)

**UX PROBLEMS**
- The **accessories vs. combinations model is clunky**: accessories cannot be
  presented in the same format as combinations on quotations and lists. This is a
  *data-model* complaint dressed as a UX complaint and is the most specific
  product criticism I found. (FACT, recurring, via search extract of Capterra
  reviews.)
- Android app and browser version have small usability bugs — keystrokes dropped
  when typing fast, app hangs. (FACT, isolated-to-recurring, same source.)
- The planning schedule "moves unexpectedly" and things load slowly. (FACT,
  recurring.)
- German forum posters said they are happy with Rentman **apart from the new
  interface**, which they criticise. (FACT, **isolated** — a single forum thread,
  via search extract of `paforum.de` thread 137007. A 2020 UI refresh is
  documented at `rentman.io/product-updates/launching-an-improved-interface`;
  whether the criticised UI is that one or a later beta is **UNKNOWN**.)

**PERFORMANCE PROBLEMS**
- Slow loading and schedule instability, as above. No evidence found of hard
  limits on project size. Behaviour with very large inventories is **UNKNOWN** —
  would need a trial account with a seeded dataset to test.

**PRICING PROBLEMS**
- Modular, per-power-user pricing that compounds. Figures seen **2026-08-29**,
  from **third-party pricing aggregators, not the vendor page** (rentman.io was
  unreachable), and the extracts mixed `$` and `€` — so treat the currency as
  uncertain:
  - Platform base: **€39/month** (also reported as $39/month).
  - **Power user: €39/user/month** on top. Only power users have full rights;
    non-power users are free but limited.
  - Add-ons reported: Quoting & Invoicing **€9/user/mo**, History Logs
    **€12/user/mo**, **Equipment Tracking €9/user/mo**.
  - Entry points reported as Crew Essential from $14/user/mo, Inventory from
    $19/user/mo. 30-day trial, EUR-native.
  (FACT-as-reported, via search extracts of `trustradius.com`, `zoftwarehub.com`,
  `saasworthy.com`, `frontdeskreview.com`, `capterra.com`. **Marked "as
  advertised by aggregators" — I could not confirm on rentman.io.**)
- **Feature gating that matters for warehouses**: *Equipment Tracking* — the
  barcode/scanning capability — is reported as a **paid add-on**, not base
  functionality. (FACT-as-reported; INFERENCE: this means a rental house pays
  extra for the single feature that most justifies buying rental software.)
- Adding a power user triggers an extra invoice the next day. (FACT, via search
  extract of `support.rentman.io/hc/en-us/articles/360015898239-Managing-Power-Users`)
- Regional price pain: a Hungarian reviewer noted that what is cheap in a Dutch
  market is already expensive in theirs. (FACT, isolated but illustrative.)
- German forum: Rentman regarded as "recht teuer" (quite expensive).
  (FACT, isolated, paforum.de.)
- **Support gated behind paid training**: a reviewer reported support is not very
  useful unless you pay for training, and that they had been unable to produce
  documents essential to their operation. (FACT, isolated but high-signal.)

**LOCK-IN**
- Cloud-only SaaS. Export capability, data-retention window after cancellation,
  and whether a full relational export is offered are **UNKNOWN** — I could not
  reach the vendor's terms. To check: Rentman ToS/DPA and whether the API exposes
  every entity needed for a clean migration.
- INFERENCE: because API *write* coverage only reached beta recently, a
  competitor-built importer can read Rentman well but a customer cannot easily
  round-trip data back in — asymmetric portability that favours staying.

**OFFLINE**
- Cloud-only; the mobile app is a companion to a hosted backend. **No documented
  offline mode was found.** Rentman's own warehouse/mobile marketing pages
  describe scanning and prepping but say nothing about working without
  connectivity, while Flex and EZRentOut market offline explicitly. (FACT of
  absence, from `rentman.io/rentman-mobile-app` and
  `rentman.io/solutions/rental-equipment-tracking-software` as surfaced in search
  vs. competitors' pages. Marked **unverified** — absence in marketing is not
  proof of absence in product; would need to test the app in airplane mode.)

**INTEGRATION PROBLEMS**
- Reviewers report the software "does not integrate with some other programs",
  forcing cumbersome workarounds. (FACT, recurring, Capterra extracts — the named
  programs were not carried in the extract, so **which** integrations are missing
  is UNKNOWN.)
- Rate limiting exists and is under-documented: some endpoints can return 403 due
  to rate limiting without that being listed in the endpoint definition. (FACT,
  via search extract of `boldertechnologies.net/rentman-api-webhook-integration/`
  — a systems-integrator blog, secondary source.) Exact limits: **UNKNOWN**.
- An MCP server is in public beta per the landscape pass (not re-verified here).

---

### Current RMS / OnRent Events (Klipboard, UK)

This product produced the **richest and most consistent complaint set** in the
whole segment.

**STRENGTHS (conceded by critics)**
- Easier learning curve and a more modern UI than Flex — stated by users
  comparing the two. (FACT, recurring, via search extracts of saashub comparison
  pages and G2.)
- Support responsiveness is widely praised ("2nd to none"), with a minority
  reporting inconsistent quality, outdated help articles and long waits. (FACT,
  widespread positive with a recurring negative tail, via search extract of
  `getapp.co.uk/reviews/106623/current-rms`)
- Live availability including accessories, sub-rental shortage flagging, and
  asset testing/maintenance enforced at booking time (from landscape pass).

**WEAKNESSES**
- **Roadmap velocity is the dominant complaint.** Users report development has
  "come to a complete halt"; new features take months to arrive *if at all*; old
  releases sit in Beta needing updates; well-supported wishlist items have waited
  a long time with no sign of implementation; some requests date back **years**.
  Named stalled requests: moving outstanding items to existing opportunities,
  email templates, improved Outlook integration. (FACT, **widespread**, via
  search extracts of `capterra.com/p/142401/Current-RMS/reviews/`,
  `softwareadvice.com/retail/current-rms-profile/reviews/`,
  `getapp.co.uk/reviews/106623/current-rms`. Vendor replies on reviews say the
  features are "high on the roadmap", which reviewers explicitly do not find
  reassuring.)
- **Reporting is BASIC.** No custom reports. Critically: **you can create custom
  fields and lists of values, but you cannot report on them** — which has driven
  users to hire outside developers to solve it through the API. (FACT,
  **widespread**, same sources. This is the single most actionable finding in the
  dossier: the product lets you model your data and then refuses to let you query
  it.)
- **Inventory-check module is bare bones** and "frequently causes headaches"
  during annual inventory checks; the layout makes it very hard to look up the
  status of a specific item mid-check. (FACT, recurring.)

**MISSING FEATURES**
- Custom reports / reporting on custom fields (above).
- Native iOS app. Users ask for one. (FACT, recurring.)
- Email templates, Outlook integration, moving outstanding items between
  opportunities (long-standing wishlist items).

**UX PROBLEMS**
- Mobile web GUI described as clunky on iOS. (FACT, recurring.)
- Inventory-check layout (above).

**PERFORMANCE PROBLEMS**
- **Cloud availability**: StatusGator reports **more than 42 outages affecting
  Current RMS users over the past 5 years**, and **more than 37 outages affecting
  the Current RMS APIs** over the same period; tracking since March 2021; 100%
  uptime over the trailing 30 days at time of checking. (FACT, seen 2026-08-29,
  via search extract of `statusgator.com/services/current-rms` and
  `.../current-rms-apis`.)
- INFERENCE: ~8 outages/year is not catastrophic for back-office work, but for a
  rental house it means the dispatch/check-out system is periodically unavailable
  during load-out — a hard failure mode with no local fallback.

**PRICING PROBLEMS**
- Per-user, per-month, no published tiers. Aggregator figures seen **2026-08-29**
  and **mutually inconsistent**: starting at **$71/user/mo** (SelectHub), **$62/user/mo**
  (another aggregator), **from $79/mo** (a third); additional users from
  **$49/mo**. 30-day trial, no card. (FACT-as-reported by aggregators; the vendor
  page `current-rms.com/pricing` exists but was **not reachable**, so all of this
  is **"requires sales contact / unconfirmed"**, not "as advertised".)
- Some reviewers mention recent price increases; the per-user model is otherwise
  generally called good value with no big upfront investment. (FACT, recurring
  but vague — no amounts or dates captured.)

**LOCK-IN**
- **The API is officially a "supported beta"**, Current RMS provides "very
  limited support" for API queries, and **while in beta it may change without
  notice as a result of product updates**. The API is **not available on trial
  accounts**. (FACT, via search extract of `api.current-rms.com/doc`.)
- **This is not theoretical.** Opportunities API **v2.1 shipped 15 June 2026**.
  URL and query params unchanged, but the response shape changed and on the
  **list** endpoint the associations `opportunity_items`, `item_assets`,
  `return_item_assets` and `participants` are **no longer available** — passing
  them as `include[]` does not work. Integrators who read line items from the
  list response must now fetch each opportunity individually via
  `GET /opportunities/{id}`. (FACT, via search extract of
  `dh7.dev/blog/current-rms-opportunities-v2-1-api-changes`, an independent
  developer's write-up.)
  - INFERENCE: this converts one list call into an N+1 request pattern for any
    integration that needed line items — combined with documented rate limiting,
    that is a real throughput regression imposed on third parties by a vendor
    that reserves the right to change the API without notice.
- **Brand/product churn as lock-in pressure**: Klipboard is rebranding Current RMS
  to **OnRent Events**. The vendor states it is a name change only, with
  features, functionality and service commitments unchanged. (FACT, via search
  extracts of `internationalrentalnews.com` and
  `help.current-rms.com/en/articles/12008464-klipboard-onrent-events`.) I found
  **no evidence** of organised user anger about the rebrand or of a rebrand-linked
  price rise — I looked for it and it was not there. Recording that as a
  **negative finding** so it is not later assumed.

**OFFLINE**
- Cloud-only. No offline mode found. The companion mobile app is a thin client.
  (FACT of absence + INFERENCE.)

**INTEGRATION PROBLEMS**
- Beta API with no-notice breaking changes and limited support (above).
- Rate limiting: the docs warn that looping requests risks being rate limited;
  **exact limits UNKNOWN**.
- **The Current RMS Companion App is reported at a 1.5-star rating and as not
  updated since April 2022.** (Reported via search extract of `marlvel.ai`, an
  AI-generated "intel report" — a **weak, low-trust source**. App stores were
  unreachable, so this is **UNVERIFIED**. To check: open the iOS/Android store
  listing and read the last-updated date. If true it is a strong signal; do not
  cite it until confirmed.)

---

### Flex Rental Solutions (US)

**Important date caveat**: Flex has been migrating from a Flash/Java-era client
to **Flex 5 (HTML), described as in open beta**. Several of the harshest
complaints below are clearly about the *old* platform. I could not date
individual reviews. **Weigh accordingly** — this is the product where
undated evidence is most misleading.

**STRENGTHS (conceded by critics)**
- Robust feature set and deep customisation, acknowledged even in negative
  reviews. (FACT, recurring.)
- Multiple users can work on the same pull sheet simultaneously. (FACT.)
- **The only mainstream product in this segment with documented offline
  scanning**: Flex scanning works in both online and offline modes and syncs when
  connectivity returns. (FACT, via
  `flexrentalsolutions.com/event-rental-software-features/warehouse-scanning/gear-tracking-warehouse-scanning/`
  as surfaced in search — vendor claim, not user-confirmed.)
- One platform covering warehouse logistics, crewing, scheduling, trucking and
  transportation. (Vendor claim.)

**WEAKNESSES / PERFORMANCE PROBLEMS** — this is the core of Flex's complaint set
and it is overwhelmingly about **speed**:
- Described as a Java-based platform that is "slow and dated"; the system
  "incredibly slow"; building quotes "like pulling teeth", ~**7 hours for what
  should take 2-3 hours**; **up to 2 minutes just to add an item to a quote**.
  (FACT, **recurring/widespread**, via search extracts of
  `softwareadvice.com/product/257325-Flex/reviews/`, `getapp.com`, Capterra.
  **Dates unknown; most plausibly the pre-HTML client.**)
- Flash-era reaction times and "irritating bugs"; the HTML migration "has taken
  significantly longer than originally projected". (FACT, recurring.)
- "Frequent lag and long load times." (FACT, recurring.)
- Bugs not addressed; pages need reloading; features described as "half baked",
  incomplete and buggy. (FACT, recurring.)

**UX PROBLEMS**
- Not intuitive; makes you do the same thing by hand several times and still not
  work right; interface called outdated and cluttered, hard for new users.
  (FACT, recurring.)

**SUPPORT PROBLEMS** (severe, and worth flagging separately)
- Support described as rude and as pushing users to figure things out themselves;
  users told most bugs cannot be fixed **because the team is busy writing Flex 5**.
  (FACT, recurring, via search extract of Software Advice / Capterra reviews.
  **Undated** — but the Flex 5 reference dates it to the migration period.)
- INFERENCE: a multi-year rewrite starved the shipping product of maintenance,
  and customers were told so directly. That is the classic "big rewrite" failure
  mode and it is the single best cautionary tale in this dossier.

**PRICING PROBLEMS**
- Per-warehouse pricing with unlimited users, ~$435-510/mo base (landscape pass;
  **not re-verified in this session**).
- Some users dissatisfied with pricing, citing unexpected or high monthly fees.
  (FACT, recurring but non-specific.)

**LOCK-IN**
- Forced platform migration (Flash/Java → Flex 5) is itself the lock-in event:
  customers cannot stay on what they bought. (INFERENCE from the FACTs above.)

**OFFLINE**
- **Best in segment on paper** (offline scanning with sync on reconnect). Whether
  it works well is **UNKNOWN** — I found no user report confirming or denying it.
  Worth a targeted follow-up: this is the feature AV Planner would most directly
  compete with.

---

### Booqable (NL)

**STRENGTHS**
- Storefront/bookings/payments for rental businesses that sell online; cleanest
  API in the segment (v4 "Boomerang", JSON:API, Bearer, webhooks).
- **API documentation is public on GitHub** (`booqable/boomerang-api-documentation`)
  — genuinely good practice. (FACT, opened directly.)

**WEAKNESSES / MISSING FEATURES** (largest *missing-feature* list of any product
here)
- **Contract handling**: users report inability to upload documents, collect
  **electronic signatures**, or include legal terms directly in the system.
  (FACT, recurring.)
- **No security-deposit feature** / confusion and gaps around deposits and
  refunds. (FACT, recurring.)
- No accounting integration (cited as a cost/limitation). (FACT, recurring.)
- Limited contact management; limited roles and permissions; no
  password-protected pages. (FACT, recurring.)
- Cannot upload pictures during scheduling; no email-marketing subscriptions; no
  customer reviews. (FACT, recurring.)
- Data import is challenging. (FACT, recurring.)

**UX PROBLEMS**
- Mobile version consistently described as **less functional than desktop**;
  difficult to send quotes from the mobile app; cannot receive tips via the
  payment portal. (FACT, recurring.)

**PRICING PROBLEMS**
- **Feature gating is the main complaint**: QR codes, multi-user access, and a
  fully platform-hosted website are only on higher plans. Extra fees for delivery
  options. Higher costs for features users regard as essential; limited pricing
  flexibility; upgrades expensive for small businesses. (FACT, **recurring**, via
  search extract of `softwareadvice.com/retail/booqable-profile/reviews/`,
  `getapp.com`, Capterra, `softwarefinder.com`.)
  - INFERENCE: **QR codes behind a paywall** is the same anti-pattern as
    Rentman's paid Equipment Tracking add-on — the scanning workflow, i.e. the
    reason to buy, is upsold.

**PERFORMANCE PROBLEMS**
- None found. Absence of evidence, not evidence of absence.

**LOCK-IN / INTEGRATION**
- Legacy **v1 API still documented alongside v4 Boomerang**; the *Inventory
  levels* and *Inventory level intervals* endpoints are **deprecated** in favour
  of availability-calendar / Inventory-availabilities endpoints. (FACT, via
  `developers.booqable.com` extract.)
- `booqable/api-documentation` (the v1 docs repo) showed **13 open issues** in
  repository metadata but the issues list rendered empty on fetch — contents
  **UNKNOWN**. `booqable/boomerang-api-documentation` has **0 open issues** and
  2 open PRs. (FACT, opened directly 2026-08-29.)
  - INFERENCE: zero open issues on a public API-docs repo means either a
    responsive maintainer or a community that reports elsewhere. Either way there
    is **no pile of angry API issues** here — Booqable's API is not a pain point,
    which is a genuine differentiator in this segment.
- Reporting/analytics occasionally limited; deeper insight requires exporting
  data. (FACT, recurring.)

**OFFLINE**
- Cloud/e-commerce-first. No offline capability found or claimed. (FACT of
  absence.)

---

### HireHop (UK)

**STRENGTHS**
- Cheap and hackable: free limited single-user tier; full API parity with the UI;
  webhooks; JS plugin injection.
- Reviewers call it "a powerhouse" once initial setup is complete, and praise
  overall functionality. (FACT, recurring.)
- Integrates with Xero, QuickBooks, Stripe, Sage 100, Microsoft 365. (FACT, via
  search extracts.)

**WEAKNESSES / UX PROBLEMS**
- **Dated UI** is the consistent theme: "the GUI feels a little dated but it's no
  issue"; "the UI feels a bit dated compared to modern software"; lacking the
  polished feel of modern SaaS, affecting initial user comfort and efficiency.
  (FACT, **recurring**, via search extract of
  `capterra.com.au/reviews/155333/hirehop`, `selecthub.com`, `nerdisa.com`.
  Note the tone: users largely **forgive** this. It is a mild complaint, not a
  deal-breaker.)
- Purchase orders: no convenient way to copy information from a previous order.
  (FACT, isolated.)
- Setting up price structures for rental items is inflexible and not intuitive,
  sometimes needing workarounds. (FACT, isolated-to-recurring.)
- Mobile app "needs more comprehensive features". (FACT, recurring.)

**PRICING** — the clearest pricing in the segment, and a genuine strength
- **£46/month for the first user, £23/month for each additional user, plus VAT**;
  free limited-feature tier for small single users; no setup fees, no card
  required. Seen **2026-08-29**, **as advertised** (via search extract of
  `capterra.com/p/155333/HireHop/pricing/` and `hirehop.biz/pricing/`; the
  vendor's own `hirehop.com` was unreachable, so confirm on
  `hirehop.biz/pricing/` before quoting).
- No evidence found of pricing complaints. Notable: HireHop is the only product
  here where I found **no** pricing grievance.

**LOCK-IN**
- Low, relatively: full API parity with the UI and JS plugin injection mean a
  customer can automate and extract broadly. (INFERENCE from landscape-pass
  facts; API cost/gating **UNKNOWN** — the extracts did not state whether API
  access carries a fee.)

**OFFLINE**
- Cloud. No offline capability found.

---

### easyjob 6 (protonic software GmbH, DE)

Best German-market depth. Evidence base here is **thin and mostly German**; treat
as indicative.

**STRENGTHS**
- Broad, capable solution for rental, production and event-logistics operations
  across trade fair, audio, video, events, congress, stage, touring and tents;
  editions scaled to company size. (FACT, vendor + directory sources.)
- A small single-person version is reportedly free. (FACT, **isolated**, from a
  PA-Forum extract. Unverified — check protonic's edition list.)

**WEAKNESSES**
- **Übersichtlichkeit** (clarity/overview) is explicitly called out as *not* a
  strength of the program, despite its many advantages. (FACT, via search extract
  of `omr.com/en/reviews/product/protonic-software-easyjob`.)
- **Business Intelligence is weak**: deeper evaluations are only possible under
  particular usage preconditions. (FACT, same source.)
- **Post-calculation (Nachkalkulation) of a project "doesn't run smoothly"**
  because cost allocation cannot always be assigned unambiguously. (FACT, same
  source. INFERENCE: this is a data-model problem — costs are not cleanly
  attributable to project objects — and it matters, because job costing is the
  reason a rental house buys an ERP at all.)

**PRICING PROBLEMS**
- **No public pricing.** Four editions (S/M/L/XL), individually scalable;
  vendor communicates no prices publicly. **Requires sales contact.** (FACT,
  seen 2026-08-29.)
- **Additional licence fees when a company relocates** are criticised. (FACT,
  **isolated** but striking — via OMR extract. If accurate, this is a
  node-locked/site-locked licensing model. Worth verifying: it would be a strong
  lock-in datapoint.)

**LOCK-IN / OFFLINE**
- On-premise Windows client + server, plus a WebApp; JSON WebApi. A German
  comparison source frames easyjob as an on-prem solution **only worth it if you
  have special IT requirements or very large data volumes**. (FACT, via search
  extract of `rent2b.net` — a competitor blog, so discount it.)
- INFERENCE: on-prem is the one architecture in this segment that is inherently
  outage-immune and offline-capable on the LAN. That is a real advantage the
  cloud products cannot match, and it is under-marketed.

---

### Point of Rental (Essentials / Elite / Syrinx 365)

**STRENGTHS**
- Breadth across all rental verticals plus enterprise scale; unified Global API
  across all three products (landscape pass). Syrinx 365 targets complex
  multi-branch operations.

**WEAKNESSES / SUPPORT PROBLEMS** — support is the dominant theme, and it is bad
- Slow ticket responses, difficulty reaching support, delays with escalations.
  (FACT, **widespread**.)
- **A $75 phone-assistance fee** is criticised. (FACT, recurring; date of the fee
  **UNKNOWN** — verify before citing.)
- After-hours support "almost non-existent" for a **24-hour business**. (FACT,
  recurring. INFERENCE: rental houses load out at night; support hours that do
  not cover load-out are a structural mismatch with the customer's operating day.)
- Dismissive responses: users report being told "we may look into it for future
  development", and frequently being told the system "can't do that" when they
  want to work slightly differently. (FACT, recurring.)
- Integrated help misses important elements; inconsistent training. (FACT.)

**PERFORMANCE PROBLEMS**
- "Very slow and tedious at times"; **File Maintenance stopping mid-inventory** is
  called out specifically as "down right aggravating". (FACT, recurring.)
- Many quirks that slow you down, plus password/user-ID issues and printing
  issues. (FACT, recurring.)
- **The cloud-based product loses connection on occasion throughout the day.**
  (FACT, recurring. This is the most direct user-stated connectivity complaint in
  the whole dossier.)

**PRICING**
- Point of Rental Essentials reported from **$50/user/month**, with custom pricing
  otherwise; Syrinx 365 enterprise terms **not published**. Seen 2026-08-29, via
  aggregator extracts (`saasworthy.com`, `getapp.com`). **Requires sales contact.**

**OFFLINE**
- No offline mode found; the connection-loss complaints above imply none.

---

### EZRentOut (EZO)

**STRENGTHS**
- Asset-tracking-first; barcode/RFID; utilisation and revenue reporting.
- Users call it user-friendly, highly customisable, easy to navigate; support
  frequently described as responsive. Pricing often praised as "best around" by
  reviewers. (FACT, recurring.)
- **Documented offline work logs that sync on reconnect** — vendor states field
  teams can log activity and update records with limited connectivity, syncing
  automatically when the connection returns. (FACT, vendor claim, via
  `ezo.io/ezrentout/` extracts. One of only two products here that claim this.)

**WEAKNESSES**
- Time-consuming initial setup and customisation; learning curve for complex
  workflows. (FACT, recurring.)
- Occasional bugs and limitations in **reporting**, **order modifications**, and
  advanced features. (FACT, recurring.)
- Documentation gaps; support delays from **time-zone differences**; occasional
  unresolved technical issues during implementation. (FACT, recurring.)
- Mobile app glitches / reduced functionality vs desktop. (FACT, recurring.)

**PRICING PROBLEMS**
- Reported plans seen **2026-08-29**: **Essential $59 / Growth $399 / Premium $499
  per month**, Enterprise custom, with seat counts of roughly **2 / 4 / 6 users**
  respectively. (FACT-as-reported via aggregator extracts; the landscape pass had
  "from $29/mo", which **does not match** — the entry price appears to have
  risen, or the two figures describe different products in the EZO family.
  **Flagged as a discrepancy to resolve on `ezo.io/ezrentout/pricing/`.**)
  - INFERENCE: if accurate, the jump from $59 to $399 between the first two tiers
    is a severe cliff for a growing rental house — and the tiers are seat-capped
    at 2 and 4 users, which is very low for a warehouse operation.
- No price-increase complaints found.

**OFFLINE** — claimed and marketed (above). User confirmation **UNKNOWN**.

---

### Cheqroom (BE/US)

**STRENGTHS**
- Check-in/check-out UX for production and media teams is consistently praised;
  intuitive interface; responsive support. (FACT, widespread.)
- Unlimited regular users and items.
- **Vendor claims the app works offline for field teams with no signal**, with
  mobile checkouts, returns and reservations, barcode/RFID scans and on-device
  signatures. (FACT, vendor claim, `cheqroom.com/features/asset-tracking-software/`
  and `/features/mobile-app/`.)

**PRICING PROBLEMS** — the sharpest pricing complaint in the segment
- Billed **annually per admin seat with minimum admin counts**: **Core $184/mo,
  Business $275/mo, Enterprise $367/mo — per admin**. Seen 2026-08-29 (matches
  the landscape pass). A single admin licence therefore costs **$2,208/year**,
  which one comparison notes is more than some competitors' entire top plan.
  (FACT, via search extracts of `capterra.com/p/140824/CHEQROOM/pricing/`,
  `cheqroom.com/pricing/`, and `itefy.com/compare/cheqroom-alternative` — the last
  is **a competitor's comparison page**, so treat its framing as adversarial even
  though the arithmetic is checkable.)
- **Unpublished add-on pricing** for a long list of capabilities: Maintenance
  Management, Room Management, Consumable Management, Operations Management,
  **RFID below the Enterprise tier**, extra locations and workspaces, asset-label
  services, and a dedicated support manager. (FACT, via the same competitor page —
  **verify on cheqroom.com/pricing before citing**.)
- Users say the yearly price is too expensive for small production houses,
  especially where local video-production rates are below European/American
  averages. "Expensive" recurs as a standalone complaint. (FACT, recurring.)

**WEAKNESSES / UX**
- Search functionality called overly complex. (FACT, recurring.)
- Mobile app interface "not very intuitive". (FACT, recurring.)
- Reporting lacks advanced customisation; third-party integration limited.
  (FACT, recurring.)
- **Direct contradiction to record**: a third-party review summary states
  **"offline access is limited"**, while the vendor markets the app as working
  offline. (FACT of the contradiction, via search extract of
  `research.com/software/reviews/cheqroom` vs `cheqroom.com`. **Unresolved** —
  this is exactly the kind of gap worth testing hands-on.)

**MISSING FEATURES**
- A way to restrict items based on **user skill level** (i.e. only certified
  operators may book certain gear). (FACT, isolated — but a genuinely interesting
  request for broadcast/AV, where competence-gating on expensive kit is a real
  operational need.)

---

### HireTrack NX / RentalDesk NX (Navigator Systems, UK)

**Evidence is thin and skews positive** — the review corpus I could reach is
small and largely favourable, and some of it sits on the vendor's own site.

**STRENGTHS**
- Customer service from Navigator described as outstanding, timely, with
  appropriate solutions. (FACT, but note some of this is from
  `hiretracknx.com/reviews/`, i.e. **vendor-published testimonials** — discount
  heavily.)
- Very extensive with many options; scales from single warehouse to large
  multi-warehouse operations; described as a de facto standard for live event
  jobs and rentals. (FACT, recurring.)

**WEAKNESSES / LOCK-IN**
- Built on **NexusDB running PascalScript**. If you need more than HireTrack NX
  provides out of the box, "prepare to do some learning". Extension is via custom
  web publishing, **ODBC**, and Zapier. (FACT, recurring.)
  - INFERENCE: this is meaningful lock-in. NexusDB + PascalScript is a niche
    proprietary stack with a tiny talent pool; ODBC gives read access but a
    customisation written in PascalScript is not portable anywhere. Compare
    HireHop, where customisation is JavaScript against a documented REST API.

**OFFLINE**
- On-prem deployment available (with bundled SQL Server per the landscape pass),
  which is inherently LAN-resilient. Cloud-server option also offered. Behaviour
  of the barcode/HireTAG RFID workflow without connectivity: **UNKNOWN**.

**PRICING** — **UNKNOWN**. No public pricing found. Requires sales contact.

---

### Shelf (shelf.nu) — open source, AGPL-3.0

The only product where I could read the **actual defect list** first-hand. This
is therefore the highest-confidence, and least flattering-by-construction,
section: every other product's bug list is private.

**STRENGTHS**
- AGPL-3.0, React 19 / Prisma / Postgres, QR asset tags, bookings, kits, custody,
  CSV import/export, Docker/Fly.io self-host. 3,000+ stars, 366 forks. (FACT,
  read directly 2026-08-29.)
- Active issue triage with precisely-written bug reports.

**WEAKNESSES — actual open issues** (read directly at
`github.com/Shelf-nu/shelf.nu/issues`, 129 open issues total, 2026-08-29)
- `#2799` **Asset import can abort mid-run and leave a partially imported
  workspace** — no transactional import. (INFERENCE: this is the single most
  dangerous one for onboarding; a failed import leaves a corrupt inventory.)
- `#2806` Location placements not reconciled when `Asset.quantity` drops.
- `#2821` Assigning a kit to custody concurrently returns a **500** instead of a
  conflict error — concurrency handling gap.
- `#2875` Assets index understates status: shows "Partial custody" while the
  asset page shows "Partially checked out" — inconsistent state display between
  views.
- `#2837` Mobile kits list: unguarded status filter **500s**, and search misses
  barcodes.
- `#2839` Scan records from the mobile app show "Unknown device".
- `#2785` Bulk dialogs reopen showing a stale client-side validation error.
- `#2904` Audit evidence panel renders a captioned upload's photos twice.
- `#2868` `apps/companion` has **no test runner**.

**MISSING FEATURES — open issues and discussions** (read directly)
- `#2831` **Book-by-model: reservations can only be fulfilled by scanning** —
  i.e. you cannot fulfil a model-level reservation without physically scanning.
- `#2786` `BookingModelRequest` fulfilment derived from `Asset.assetModelId`.
- `#2892` User status update by CSV (labelled user-requested).
- Discussions: **Kit bundling — kits within kits** (Feb 2026, 0 replies);
  sorting for kits/locations/categories/tags (Feb 2026); **white-label and
  multi-tenancy** for MSP/service providers (Jan 2025); **Helm chart for
  self-hosted deployment** (Mar 2024); **self-hosted SSO** (Feb 2025, 4 replies);
  deployment options for self-hosted operation (Aug 2024, 6 replies);
  **i18n / support for other languages** (Jul 2023, **9 replies** — the
  longest-running request found).
- "Is this really free to use?" (Dec 2025, 8 replies) — licensing/pricing
  confusion is itself a recurring friction for the OSS option.

**OFFLINE** — no offline mode; it is a Postgres-backed web app. Self-hosting on
the LAN is the closest equivalent.

**INTEGRATION** — Office 365 SMTP email bug discussion (Feb 2025, 10 replies)
suggests email deliverability friction in self-hosted setups.

---

### Xytech (MediaPulse / Fabric / ScheduALL) — adjacent upmarket neighbour

**Evidence: almost none.** No usable user-complaint corpus was found — no
accessible reviews, no forum threads. This is normal for enterprise broadcast
software sold through direct sales.

**LOCK-IN — the one solid finding**
- Xytech acquired **ScheduALL in April 2021**. **MediaPulse is the upgrade path
  for all ScheduALL customers**, and Xytech's releases have been explicitly
  focused on **closing feature gaps between ScheduALL and the Media Operations
  Platform to enable ScheduALL customers to migrate**. (FACT, via search extracts
  of `postperspective.com/xytechs-mediapulse-2022-adds-scheduall-features/` and
  `helpcenter.fabricdata.com` release notes.)
  - INFERENCE: ScheduALL customers are being migrated off a product they chose,
    onto a platform that — by the vendor's own framing — did not yet have all the
    features they were using. A multi-year forced migration with acknowledged
    feature gaps is the strongest lock-in story in this dossier.

**Everything else about Xytech — pricing, performance, UX, offline — is UNKNOWN.**
To research it properly would need IABM/DPP-adjacent industry sources, or direct
conversation with facility engineers.

---

## Cross-product patterns

These repeat across **multiple independent vendors** and are the most valuable
part of this dossier.

### 1. The mobile app is always the weakest surface — widespread
Every single cloud product in this segment has a mobile complaint:
- Booqable: mobile "less functional than desktop", can't easily send quotes.
- Cheqroom: mobile interface "not very intuitive".
- EZRentOut: mobile glitches, reduced functionality vs desktop.
- Current RMS: web GUI clunky on iOS; users asking for a native iOS app; the
  companion app reportedly at 1.5 stars and stale since 2022 (**unverified**).
- Rentman: Android keystroke drops and hangs; **cannot create a project from the
  app**, a long-standing roadmap request.
- HireHop: "mobile app needs more comprehensive features".

INFERENCE: the desktop web app is where the licence revenue is measured
(per-user, per-admin), so the phone — the device actually used in the warehouse
and on the truck — is treated as a companion. **The warehouse is served by the
worst part of every product in this category.** That is the segment's structural
weak point.

### 2. Cloud dependency with no local fallback — widespread
- Current RMS: 42+ outages in 5 years; 37+ API outages (StatusGator, 2026-08-29).
- Point of Rental: users report the cloud product **losing connection throughout
  the day**.
- Only **Flex** and **EZRentOut** document offline scanning with sync on
  reconnect; **Cheqroom** claims offline but a third-party review says offline
  access is limited (unresolved contradiction).
- Rentman, Current RMS, Booqable, Point of Rental, Shelf: **no offline mode found**.

INFERENCE: warehouses are RF-hostile (steel racking, basements, loading bays) and
load-outs happen at venues with no guest WiFi. A cloud-only check-out system
fails exactly where and when it is needed. Three of four vendors have not solved
this, and the two that market it are not confirmed by users.

### 3. Reporting is basic everywhere, and custom fields are a trap — widespread
- Current RMS: reporting "BASIC", no custom reports, **and you cannot report on
  the custom fields the product lets you create** — users hired outside
  developers to work around it via the API.
- easyjob: BI weak; deeper evaluations only under certain preconditions;
  post-calculation cost allocation ambiguous.
- Booqable: reporting limited, deeper insight requires exporting.
- EZRentOut: reporting limitations and bugs.
- Cheqroom: reporting lacks advanced customisation.
- Rentman: "not great on the reporting detail"; financial calculations need extra
  work.

**Six of eleven products, independently.** INFERENCE: these systems are built as
transaction recorders, not as analysis tools, and the custom-field escape hatch
is offered without the query layer that would make it useful. Every vendor lets
you *enter* your data and then makes you leave the product to *ask questions*
about it.

### 4. The API is a second-class citizen, and changes under integrators — recurring
- Current RMS: API is a **"supported beta"** with **"very limited support"** that
  **may change without notice**; **not available on trial accounts**; and it did
  change — v2.1 (15 June 2026) removed four associations from the Opportunities
  list endpoint, forcing N+1 fetches, against documented rate-limiting.
- Rentman: write endpoints only recently in **beta**; "Public API" was one of the
  most-requested features; rate-limit 403s not listed in endpoint definitions.
- Booqable: v1 legacy still alive beside v4 Boomerang; inventory-level endpoints
  deprecated. (But: 0 open issues on the Boomerang docs repo — the healthiest API
  story in the segment.)
- HireHop: **full API parity with the UI** — the outlier, and the reason it is
  described as "hackable".

INFERENCE: except HireHop and Booqable, these vendors treat the API as a
marketing checkbox rather than a contract. For a company planning to *integrate*
with them, that is the central risk: the integration is built on a surface the
vendor does not promise to keep stable, and cannot even be prototyped on a trial
account (Current RMS).

### 5. Pricing upsells the very feature that justifies the purchase — recurring
- Rentman: **Equipment Tracking (scanning) is a paid add-on**; History Logs
  extra; Quoting & Invoicing extra; **€39/power user/mo** on top of the platform.
- Booqable: **QR codes**, multi-user access and hosted website gated to higher
  plans.
- Cheqroom: **per-admin-seat** at $184-367/mo with minimums, plus a long list of
  **unpublished** add-on prices including **RFID below Enterprise**.
- EZRentOut: reported tiers seat-capped at ~2 / 4 / 6 users, with a $59 → $399
  cliff.
- Point of Rental: **$75 phone-support fee**.
- easyjob: no public pricing at all; reportedly **extra licence fees when the
  company relocates**.

INFERENCE: barcode/QR/RFID scanning is the single feature that makes rental
software pay for itself, and three separate vendors put it behind an upgrade.
HireHop (£46 + £23/user, flat, published) is the conspicuous exception and
attracts **no pricing complaints** — which is itself a finding.

### 6. Setup cost is the real cost, and support is often gated — recurring
- Rentman: slow learning curve; "time and patience needed to setup"; support
  reportedly not very useful **unless you pay for training**.
- EZRentOut: time-consuming setup and customisation; documentation gaps;
  time-zone support delays.
- HireHop: "a powerhouse **once the initial setup is complete**".
- Point of Rental: $75 phone fee; after-hours support almost non-existent for a
  24-hour business; inconsistent training.
- Flex: support described as rude, deflecting users to self-service **because the
  team was busy writing the next major version**.

### 7. Feature requests die in public — recurring, and worst at Current RMS
Current RMS is the clearest case: a public wishlist where the most-voted ideas
are supposed to be built first, and users reporting requests **years** old,
"obvious improvements every company would benefit from", still unbuilt — with
vendor replies saying the feature is "high on the roadmap" that reviewers
explicitly do not believe. Point of Rental users report being told "we may look
into it for future development" and, frequently, "it can't do that".
Rentman runs the same public-roadmap model (Productboard) and, to its credit,
visibly shipped the most-requested item (the API).

INFERENCE: a public roadmap converts a private disappointment into a public,
dated, permanently visible one. It builds trust when you ship and corrodes it
faster than silence when you do not.

### 8. Nothing in this segment does technical/signal planning — the AV Planner gap
I searched specifically for rental ERPs that produce signal flow, cable
schedules, patch lists or rack elevations. **None of the eleven products
surfaced in any such search.** That work lives in an entirely separate tool
category — X-DRAW / XTEN-AV, WireFlow, H2R Gear's AV Diagram Maker, Patchify,
SmartDraw — which in turn have **no rental-inventory or availability model**.
(FACT of absence across searches; the diagram tools' existence is FACT via
`xtenav.com`, `wireflow.live`, `h2rgear.com/tools/patch-list/`, `patchify.app`.)

Corroborating friction from the rental side: users report **still keeping
spreadsheets alongside their rental software** to double-check stock and
sub-hires, and manual tracking leading to unbilled cables and unrecorded
sub-hires. (FACT, via `hirehop.com/blog/5-signs-rental-software-holding-you-back/`
— **a vendor's marketing blog**, so it is describing the pain it wants to sell
against. Weigh as directional only.)

INFERENCE (the central strategic finding): the equipment list exists twice — once
in the rental ERP as billable line items, once in a diagram tool as devices with
ports. Nobody joins them. A cable plan cannot tell the ERP it needs 40 more
BNC leads; the ERP cannot tell the cable plan that the router is already
sub-rented for that date. This seam is unoccupied, and it is precisely where AV
Planner Suite sits.

---

## Direct quotes-of-substance

**All paraphrased.** I could not open the underlying review pages directly
(egress-blocked), so no wording below should be presented as a verbatim quote.
Dates are given only where the source carried one.

1. **Current RMS — reporting**: reviewers say the reporting function needs a lot
   of work and is currently basic; there are no custom reports; and although you
   can create custom fields and lists of values, **reporting on those is not
   possible**, which pushed some users to hire outside developers to build
   solutions via the API. — via search extract of
   `https://www.capterra.com/p/142401/Current-RMS/reviews/` and
   `https://www.softwareadvice.com/retail/current-rms-profile/reviews/`. Date: unknown.

2. **Current RMS — roadmap**: users describe development as having come to a
   complete halt, with new features taking months to appear if at all, old
   releases still in beta and badly needing updates, and well-supported wishlist
   items waiting years. — same sources. Date: unknown.

3. **Current RMS — mobile**: the mobile application is described flatly as
   terrible, with long periods where no features ship at all. — same sources.
   Date: unknown.

4. **Current RMS — inventory checks**: the inventory-checking module is called
   very bare bones and a frequent source of headaches during annual inventory
   checks, with a layout that makes it hard to look up a specific item's status
   mid-check. — same sources. Date: unknown.

5. **Flex — speed**: reviewers describe a Java-based platform that is slow and
   dated, quotes taking around seven hours instead of two to three, and up to two
   minutes just to add a single item to a quote. — via search extract of
   `https://www.softwareadvice.com/product/257325-Flex/reviews/`. Date: unknown;
   **most likely the pre-HTML client**.

6. **Flex — support and the rewrite**: users report being told that most bugs and
   problems cannot be fixed because the team is busy writing Flex 5, and describe
   support as pushing them to figure it out themselves. — same source. Date:
   unknown, but the Flex 5 reference places it during the migration.

7. **Point of Rental — support hours**: after-hours support is described as almost
   non-existent for what is a 24-hour business, alongside long hold times and a
   $75 phone-assistance fee. — via search extract of
   `https://www.getapp.com/industries-software/a/point-of-rental-software/reviews/`
   and `https://www.capterra.com/p/29074/Point-of-Rental-Software/reviews/`.
   Date: unknown.

8. **Point of Rental — connectivity**: users report the cloud-based program losing
   connection on occasion throughout the day, and File Maintenance stopping
   mid-inventory. — same sources. Date: unknown.

9. **Rentman — accessories model**: the accessories and combinations feature is
   described as clunky and awkward, with frustration that accessories cannot be
   presented in the same format as combinations on quotations and lists. — via
   search extract of `https://www.capterra.com/p/144616/Rentman/reviews/`. Date:
   unknown.

10. **Rentman — support and training**: a reviewer reports support is not very
    useful unless you pay for training, and that they have been unable to produce
    documents essential to their operation. — same source. Date: unknown.

11. **Rentman — German market**: forum posters say they are satisfied with
    Rentman other than the new interface, which they criticise, and note it is
    quite expensive; one reports testing Jobtura and being enthusiastic. — via
    search extract of
    `https://paforum.de/forum/index.php?thread/137007-software-zum-vermieten-von-technik-fuer-kleine-dienstleister/`.
    Date: unknown. **Single thread — isolated.**

12. **easyjob — post-calculation**: detailed post-calculation of a project does
    not run smoothly because costs cannot always be unambiguously allocated;
    clarity of overview is not the program's strength; and business-intelligence
    depth is only available under certain preconditions. — via search extract of
    `https://omr.com/en/reviews/product/protonic-software-easyjob`. Date: unknown.

13. **Current RMS API — beta status**: the documentation states the API is
    available as a supported beta release, that only very limited support is
    provided for API queries, that while in beta it may change without notice as
    a result of product updates, and that it is not available for trial accounts.
    — via search extract of `https://api.current-rms.com/doc`. Seen 2026-08-29.

14. **Current RMS API — the breaking change**: on the v2.1 Opportunities list
    endpoint the associations `opportunity_items`, `item_assets`,
    `return_item_assets` and `participants` are no longer available and cannot be
    requested via `include[]`; integrators must fetch each opportunity
    individually instead. — via search extract of
    `https://www.dh7.dev/blog/current-rms-opportunities-v2-1-api-changes`.
    **Released 15 June 2026.**

15. **Booqable — contracts**: users report being unable to upload documents,
    collect electronic signatures, or include legal terms directly in the system,
    alongside missing security-deposit handling. — via search extract of
    `https://www.softwareadvice.com/retail/booqable-profile/reviews/`. Date: unknown.

16. **Cheqroom — cost**: reviewers say the yearly price is too expensive for small
    production houses, particularly where local video-production rates sit below
    European or American averages. — via search extract of
    `https://www.capterra.com/p/140824/CHEQROOM/reviews/`. Date: unknown.

17. **Shelf — import safety** (read directly, 2026-08-29): open issue #2799
    states that asset import can abort mid-run and leave a partially imported
    workspace. — `https://github.com/Shelf-nu/shelf.nu/issues`.

18. **Shelf — model bookings** (read directly, 2026-08-29): open issue #2831
    states that book-by-model reservations can only be fulfilled by scanning. —
    same URL.

---

## What I could not establish (open questions)

Recording these so they are not silently assumed later:

1. **Reddit sentiment for this entire segment** — unexecuted, reddit.com
   unreachable. Needs a session with Reddit access or manual browsing.
2. **Whether Rentman, Current RMS or Booqable have any offline capability** —
   inferred absent from marketing silence; needs airplane-mode testing on a trial.
3. **Whether Cheqroom's offline mode actually works**, given the vendor/review
   contradiction.
4. **All Rentman and Current RMS prices** — taken from aggregators, not vendor
   pages. Both vendor pricing pages were unreachable.
5. **EZRentOut's entry price** — landscape pass says from $29/mo, this pass found
   $59/mo Essential. Unresolved.
6. **The Current RMS Companion App's 1.5-star rating and April 2022 last-update**
   — from a low-trust AI-generated aggregator. Do not cite until an app store
   listing confirms it.
7. **easyjob's relocation licence fee** — single German source; would be a strong
   lock-in datapoint if true.
8. **Review dates across the board**, and especially **whether Flex's severe
   performance complaints predate Flex 5**. This is the biggest fairness risk in
   the dossier.
9. **Xytech / HireTrack NX user sentiment** — no accessible corpus.
10. **Data-export and post-cancellation retention terms** for every cloud product
    — the lock-in sections are largely inference because no ToS was reachable.

---

## Sources

Pages **opened and read directly** (first-hand):

- https://github.com/Shelf-nu/shelf.nu/issues
- https://github.com/Shelf-nu/shelf.nu/discussions
- https://github.com/bit8bytes/gearberg
- https://github.com/booqable/api-documentation/issues
- https://github.com/booqable/boomerang-api-documentation/issues
- https://github.com/booqable/boomerang-api-documentation/blob/master/CHANGELOG.md
- https://sourceforge.net/software/product/Current-RMS/ (reachable; contained no reviews)

Pages whose **content reached me through search-engine extraction** (second-hand;
the page itself was egress-blocked):

- https://www.capterra.com/p/144616/Rentman/reviews/
- https://www.capterra.com/p/142401/Current-RMS/reviews/
- https://www.capterra.com/p/29074/Point-of-Rental-Software/reviews/
- https://www.capterra.com/p/140824/CHEQROOM/reviews/
- https://www.capterra.com/p/140824/CHEQROOM/pricing/
- https://www.capterra.com/p/155333/HireHop/pricing/
- https://www.capterra.com.au/reviews/155333/hirehop
- https://www.capterra.in/reviews/135722/flex
- https://www.softwareadvice.com/product/257325-Flex/reviews/
- https://www.softwareadvice.com/retail/current-rms-profile/reviews/
- https://www.softwareadvice.com/retail/booqable-profile/reviews/
- https://www.getapp.co.uk/reviews/106623/current-rms
- https://www.getapp.com/industries-software/a/point-of-rental-software/reviews/
- https://www.getapp.com/industries-software/a/ezrentout/reviews/
- https://www.g2.com/products/flex-rental-solutions-flex/reviews
- https://softwareconnect.com/reviews/ezrentout/
- https://www.selecthub.com/p/equipment-rental-software/hirehop/
- https://www.selecthub.com/p/equipment-rental-software/current-rms/
- https://nerdisa.com/hirehop/
- https://research.com/software/reviews/cheqroom
- https://omr.com/en/reviews/product/protonic-software-easyjob
- https://paforum.de/forum/index.php?thread/137007-software-zum-vermieten-von-technik-fuer-kleine-dienstleister/
- https://paforum.de/forum/index.php?thread/28192-vermietsoftware-easyjob-erfahrungen/
- https://forums.prosoundweb.com/index.php?topic=72528.0
- https://api.current-rms.com/doc
- https://www.dh7.dev/blog/current-rms-opportunities-v2-1-api-changes
- https://developers.booqable.com/
- https://portal.productboard.com/rentman/1-rentman-public-roadmap/c/13-public-api
- https://portal.productboard.com/rentman/1-rentman-public-roadmap/c/47-improvements-to-the-rentman-api
- https://portal.productboard.com/rentman/1-rentman-public-roadmap/c/60-api-endpoints-to-write-projects
- https://portal.productboard.com/rentman/1-rentman-public-roadmap/c/24-improved-overview-in-the-crew-planner
- https://support.rentman.io/hc/en-us/articles/360015898239-Managing-Power-Users
- https://support.rentman.io/hc/en-us/articles/26707946497042-Rentman-API-Changelog
- https://support.rentman.io/hc/en-us/articles/21998749265938-Rentman-Changelog-Explore-the-Latest-Updates
- https://rentman.io/product-updates/create-projects-in-rentman-with-the-api
- https://rentman.io/product-updates/launching-an-improved-interface
- https://rentman.io/rentman-mobile-app
- https://rentman.io/solutions/rental-equipment-tracking-software
- https://www.trustradius.com/products/rentman-av-rental-software/pricing
- https://zoftwarehub.com/products/rentman/pricing
- https://www.saasworthy.com/product/point-of-rental-essentials/pricing
- https://frontdeskreview.com/software/equipment-rental-software/rentman/
- https://frontdeskreview.com/software/equipment-rental-software/ezrentout/
- https://ezo.io/ezrentout/pricing/
- https://ezo.io/ezrentout/
- https://www.cheqroom.com/pricing/
- https://www.cheqroom.com/features/asset-tracking-software/
- https://www.cheqroom.com/features/mobile-app/
- https://www.itefy.com/compare/cheqroom-alternative
- https://hirehop.biz/pricing/
- https://www.hirehop.com/blog/5-signs-rental-software-holding-you-back/
- https://www.flexrentalsolutions.com/event-rental-software-features/warehouse-scanning/gear-tracking-warehouse-scanning/
- https://statusgator.com/services/current-rms
- https://statusgator.com/services/current-rms/current-rms-apis
- https://help.current-rms.com/en/articles/12008464-klipboard-onrent-events
- https://www.internationalrentalnews.com/news/klipboard-to-use-onrent-brand-for-insphire-and-current-rms-software/8122906.article
- https://postperspective.com/xytechs-mediapulse-2022-adds-scheduall-features/
- https://helpcenter.fabricdata.com/hc/en-us/articles/32643722710171-Xytech-2025-Release-Introduction-11-1
- https://www.hiretracknx.com/reviews/visual-elements-review-of-hiretrack-nx/ (vendor-published testimonial)
- https://www.boldertechnologies.net/rentman-api-webhook-integration/
- https://rent2b.net/de/blog/verleihsoftware-vergleich-2026-de (competitor comparison blog)
- https://www.softguide.de/programm/rentman
- https://www.jobtura.de/en/industries/event-technology/
- https://marlvel.ai/intel-report/business/current-rms-companion-app (low-trust, AI-generated)
- https://xtenav.com/x-draw/
- https://wireflow.live/av-diagram-software
- https://h2rgear.com/tools/patch-list/
- https://patchify.app/
