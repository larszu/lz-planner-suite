# Research method and source credibility rubric

This document defines how the AV Planner Suite market research corpus was produced and how
its claims should be read. It exists because the corpus is meant to drive product decisions,
and a product decision built on a single angry forum post is worse than no decision at all.

## Scope

The corpus covers the software landscape a professional AV/broadcast production touches, in
sixteen segments:

| Area | Segments |
| --- | --- |
| Commercial / logistics | event & rental management, crew scheduling, asset tracking & barcode |
| Production | broadcast/OB production management, generic project management, visual workspace |
| Technical planning | cable & signal flow & rack planning, lighting, audio, networking |
| Live operations | camera control (RCP/CCU), intercom, tally, video switching & streaming, media playback, show control |

For each segment the corpus holds two dossiers:

- `landscape/<segment>.md` — what the products are and do: features, data models, standards,
  price models, APIs, offline behaviour.
- `pain-points/<segment>.md` — what users say is wrong with them: weaknesses, missing features,
  UX, performance, pricing, lock-in, offline and integration problems.

Alongside those:

- `roles/<role>.md` — the working reality of eleven AV professions: time sinks, double entry,
  what is still on paper, in Excel, or in WhatsApp.
- `workflow-chain.md` — the enquiry-to-invoice production chain and every media break in it.
- `repos/<repo>.md` — a capability inventory of the eight existing repositories, so the strategy
  is anchored in what actually exists rather than in what the READMEs claim.
- `synthesis/` — the derived artefacts: user need database, feature matrix, feature strategy.

## What is a source

Sources are used in rough order of trust:

1. **Primary technical sources** — vendor API documentation, protocol specifications, manuals,
   release notes and changelogs, open-source code and issue trackers. A changelog is unusually
   honest evidence: what a vendor keeps fixing is what keeps breaking.
2. **Standards documents** — SMPTE, AES, TSL, GDTF/MVR, NMOS, ONVIF and similar. These settle
   questions of interoperability that marketing pages obscure.
3. **Practitioner discussion** — professional forums and subreddits where the participants are
   identifiably working practitioners (r/VIDEOENGINEERING, ProSoundWeb, Blue Room, Control Booth,
   The Light Network), trade press with named technical authors.
4. **Structured reviews** — G2, Capterra, GetApp, TrustRadius, Trustpilot. Useful for volume and
   for the "Cons" field, but incentivised: vendors solicit positive reviews, so the 1-3 star
   band and the free-text cons carry more information than the aggregate score.
5. **Vendor marketing** — feature lists and pricing pages. Reliable for *what exists*, unreliable
   for *how well it works*, and silent on *what is missing*.

## Frequency grading

Every recorded need or complaint carries a frequency grade. This is the single most important
field in the corpus, because it is what separates a product decision from an anecdote.

| Grade | Meaning |
| --- | --- |
| `isolated` | Seen once, or only from one person. Recorded for completeness. Never on its own a reason to build something. |
| `recurring` | Several independent sources, ideally of different types (a forum thread *and* a review *and* an open issue). Worth designing for. |
| `widespread` | A well-known theme, visible across many sources and often acknowledged by the vendor itself (a long-open issue, a documented limitation, a competitor's marketing that attacks it). Strong signal. |

## Known biases in this kind of research, and how they were handled

**Complaint bias.** People post when they are angry, not when a tool works. An absence of
complaints about a feature is not evidence that the feature is good; it may mean nobody uses it.
Counterweight: the landscape pass records strengths independently of the pain-point pass, and
pain-point dossiers are asked to record what even critics concede.

**Recency.** A 2018 complaint about a product rewritten in 2022 is close to worthless. Every
finding is dated where the source allowed it. Findings whose date could not be established are
marked as such.

**Loudest-segment bias.** English-language, US-centric, and hobbyist-adjacent communities are
over-represented online relative to European broadcast staff, who discuss less in public. The
research explicitly searched German-language sources and European vendors to counteract this;
where a finding is only visible in one linguistic market, that is noted.

**Review-site incentives.** Vendors run review campaigns. Aggregate scores across vendors are
therefore not comparable; only the free-text criticism is used, and only when it repeats.

**Self-serving synthesis.** The obvious failure mode of "research your competitors" is to
discover that every competitor is bad and your own architecture is right. Guards used: pain
points are recorded before any AV Planner answer is proposed; the feature matrix is required to
mark where AV Planner is *worse* or where building the feature is not worth it; and the strategy
document carries an explicit "what we should NOT build" section.

## Environment limitation: what could and could not be read

**This is the single most important caveat on the whole corpus and it is stated up front rather
than in footnotes.**

The research ran inside a sandbox whose network egress policy blocks most of the public web.
Verified by direct probe on 2026-08-29:

| Domain | Reachable |
| --- | --- |
| `github.com`, `raw.githubusercontent.com` | **Yes** |
| `rentman.io`, `bitfocus.io`, `qlab.app`, `netbox.dev`, `cyanview.com`, `clearcom.com` | No |
| `reddit.com` | No |
| `g2.com`, `capterra.com` | No |
| `en.wikipedia.org` | No |

Web *search* worked and returned titles, snippets and summaries; opening the resulting pages
mostly did not. The researchers handled this correctly and their dossiers split their source
lists into two explicit groups — "fetched in full (readable in this environment)" and "read via
search-engine summaries of the page". That distinction is load-bearing and must be preserved when
any claim is quoted onward.

### What follows from this

- **Open-source evidence is strong.** Anything sourced from a GitHub repository, issue tracker,
  README or source file was read directly and is FACT. The corpus's best findings are of this
  kind: NetBox's cable-type enum containing no SDI/HDMI/XLR/audio type, GDTF's `SignalType`
  returning zero grep hits for SDI/MADI/Dante/AES67/NDI, Green-GO's OSC documentation stating
  that WAA antennas and WBPX beltpacks are unsupported, Tally Arbiter's own documentation of the
  late-joiner limitation.
- **Commercial vendor claims are weaker.** Feature and platform details for closed products
  generally rest on search summaries, not on the vendor page itself.
- **Pricing is largely unverifiable here.** Where a price appears it came from a search summary
  and must be re-checked before any commercial use. Several segments — camera control, intercom —
  returned no verifiable price at all. Note that this is partly a genuine market property
  (quote-driven pricing) and partly this sandbox; the dossiers distinguish the two where they can,
  and neither should be reported as the other.
- **Section 15 user research is the worst affected.** The mandate names Reddit, G2, Capterra,
  Trustpilot and YouTube comments as primary sources for user complaints. Every one of those is
  blocked. Pain-point findings therefore rest on GitHub issues and discussions (fully readable and
  genuinely valuable — a long-open issue with many reactions is strong evidence) plus search
  summaries of forum threads. **The review-site and Reddit half of the mandated user research
  could not be performed in this environment and should be redone somewhere with open egress.**

### Does this undermine the central finding?

Partly, and the honest answer is worth stating. The corpus's headline conclusion — that the
market has runtimes but no design-time layer — is a *negative* claim, and negatives are the
claim type most weakened by incomplete access: not finding a thing is not proof it is absent.

Two things support it anyway. It was reached independently by six segment researchers who could
not see each other's work, which is hard to explain as a shared artefact of blocked access. And
its sharpest supporting evidence comes from the half of the web that *was* fully readable: the
open-source data models genuinely lack AV signal semantics, and that was verified by reading the
schemas, not by failing to reach a marketing page.

Treat the finding as strong but not closed. The falsification test is cheap: re-run the segment
sweep with open egress and look specifically for a design-time artefact in the commercial tier.

## Verification

Prices, offline capability and API existence are the three classes of claim that are both
decision-relevant and easy to get wrong. They are re-checked in a dedicated verification pass
against primary sources, and each is stamped with the date it was seen. Prices in this corpus
should be treated as indicative and re-checked before being used in any commercial comparison.

## How claims are labelled

- **FACT** — read on a cited page.
- **INFERENCE** — a conclusion drawn from facts, flagged as reasoning rather than evidence.
- **UNKNOWN / unverified** — could not be established. Left visible rather than quietly dropped,
  because an honest gap is more useful than a confident guess.

## Maintenance

Section 25 of the research mandate makes this a standing obligation rather than a one-off:
market analysis continues during development. When a new product, protocol or feature is
discovered mid-implementation, it is analysed, evaluated, and added here; the feature strategy
is then re-derived rather than patched.
