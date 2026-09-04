# AV Planner Suite — market and user research corpus

The research required by the market-research mandate. Roughly 21,000 lines across market
segments, professions, the production workflow and the existing codebase.

**Start with [`METHOD.md`](METHOD.md).** It sets out the source rubric, the frequency grading
every finding carries, and — importantly — the environment limits on what could actually be
verified.

## Synthesis (read these first)

| Document | What it is |
| --- | --- |
| [`synthesis/AV-INDUSTRY-SOFTWARE-LANDSCAPE.md`](synthesis/AV-INDUSTRY-SOFTWARE-LANDSCAPE.md) | Cross-segment summary. The central finding: the market is all runtime and no design time. |
| [`synthesis/USER-NEED-DATABASE.md`](synthesis/USER-NEED-DATABASE.md) | 150 needs from 11 professions, priority-scored, clustered into six themes. |
| [`synthesis/COMPETITOR-PAIN-SYNTHESIS.md`](synthesis/COMPETITOR-PAIN-SYNTHESIS.md) | 224 competitor pain points across 16 segments, with the two findings the landscape pass could not see. |
| [`synthesis/FEATURE-MATRIX.md`](synthesis/FEATURE-MATRIX.md) | Capability comparison, with nine deliberate "won't build" decisions. |
| [`synthesis/FEATURE-STRATEGY.md`](synthesis/FEATURE-STRATEGY.md) | The derived roadmap, prioritised, with the cross-module automation chain. |

## Measurements behind open design questions

These sit under `synthesis/` because they are evidence, not decisions. Each one measures
something an open question depends on and deliberately stops short of deciding it — the
decision belongs to the owner (`IMPLEMENTATION_BACKLOG.md`, section "Nicht zu entscheiden
ohne den Eigentümer").

| Document | What it measures |
| --- | --- |
| [`synthesis/CREDENTIALS-IN-TEMPLATES.md`](synthesis/CREDENTIALS-IN-TEMPLATES.md) | Credentials that travel inside library templates — the measurement behind design question 5. |
| [`synthesis/TEMPLATE-FIELD-MEASUREMENT.md`](synthesis/TEMPLATE-FIELD-MEASUREMENT.md) | Which template fields are model properties and which are instance state — design question 2. |
| [`synthesis/INITIATIVE-5-SCOPING.md`](synthesis/INITIATIVE-5-SCOPING.md) | What the change-impact view actually needs for increment 2. |
| [`synthesis/INITIATIVE-11-SCOPING.md`](synthesis/INITIATIVE-11-SCOPING.md) | Device capability registry: scouting that changed what the initiative *is*, recorded so nobody plans against the original description. |

## Evidence

| Directory | Contents |
| --- | --- |
| [`landscape/`](landscape/) | Per-segment market dossiers: products, data models, standards, prices, APIs, offline behaviour. |
| [`pain-points/`](pain-points/) | Per-segment user complaints, all 16 segments. **See METHOD.md — the review-site and Reddit sources this needs were unreachable, so the evidence is GitHub-weighted.** |
| [`roles/`](roles/) | Eleven professions: time sinks, double entry, what is on paper, in Excel, in WhatsApp. |
| [`repos/`](repos/) | Capability inventory of the eight existing repositories, read from source rather than from READMEs. Includes the measured fork divergence between the suite's vendored copies and the standalone repos. |
| [`workflow-chain.md`](workflow-chain.md) | The enquiry-to-invoice chain and its media breaks. |

Scale: 16/16 market segments (landscape and pain points), 11/11 professions, 8/8 repositories.

## The findings that drive the strategy

1. **The market has no design-time layer.** Six segment researchers, working independently,
   each concluded that every product in their segment is a runtime. Nothing holds the technical
   specification of a show — it lives in Excel, Visio and printouts.
2. **Identity is retyped five to eight times.** Eight of eleven professions independently named
   this as their top widespread pain. It is the same finding as (1), seen from the user's side.
3. **Offline exists, but always for the wrong half.** Where offline capability exists it covers
   warehouse scanning, or means "you may host the server yourself". Nobody offers offline
   planning on a laptop in a truck.
4. **Control is open-loop and the surface lies.** Five segments independently asked to read a
   device's real state rather than see the last command echoed back. The operational twin of (1).
5. **Nobody publishes machine-readable capability truth.** Five segments want to know what a
   device can actually do, over which transport, with which firmware — and no such registry
   exists in any of them.

## Standing obligation

Section 25 makes this corpus a living document rather than a one-off. When a new product,
protocol or feature is found during development it is analysed and added here, and the strategy is
re-derived rather than patched.
