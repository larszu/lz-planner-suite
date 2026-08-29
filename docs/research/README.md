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
| [`synthesis/FEATURE-MATRIX.md`](synthesis/FEATURE-MATRIX.md) | Capability comparison, with nine deliberate "won't build" decisions. |
| [`synthesis/FEATURE-STRATEGY.md`](synthesis/FEATURE-STRATEGY.md) | The derived roadmap, prioritised, with the cross-module automation chain. |

## Evidence

| Directory | Contents |
| --- | --- |
| [`landscape/`](landscape/) | Per-segment market dossiers: products, data models, standards, prices, APIs, offline behaviour. |
| [`pain-points/`](pain-points/) | Per-segment user complaints. **See METHOD.md — the review-site and Reddit sources this needs were unreachable in the research environment.** |
| [`roles/`](roles/) | Eleven professions: time sinks, double entry, what is on paper, in Excel, in WhatsApp. |
| [`repos/`](repos/) | Capability inventory of the eight existing repositories, read from source rather than from READMEs. |
| [`workflow-chain.md`](workflow-chain.md) | The enquiry-to-invoice chain and its media breaks. |

## The three findings that drive the strategy

1. **The market has no design-time layer.** Six segment researchers, working independently,
   each concluded that every product in their segment is a runtime. Nothing holds the technical
   specification of a show — it lives in Excel, Visio and printouts.
2. **Identity is retyped five to eight times.** Eight of eleven professions independently named
   this as their top widespread pain. It is the same finding as (1), seen from the user's side.
3. **Offline exists, but always for the wrong half.** Where offline capability exists it covers
   warehouse scanning, or means "you may host the server yourself". Nobody offers offline
   planning on a laptop in a truck.

## Standing obligation

Section 25 makes this corpus a living document rather than a one-off. When a new product,
protocol or feature is found during development it is analysed and added here, and the strategy is
re-derived rather than patched.
