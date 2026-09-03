# Initiative 11 (device capability registry) — scoping result

Score 22 in the section-26 model. Scouted before implementation, as section 30 requires,
because the scouting changed what the initiative *is*. This note records that change so
nobody plans against the original description.

**Nothing here is built.** The initiative ends in a design question that belongs to the
user (see "What blocks it", below), and one repository it touches cannot be reached.

## The registry already exists

The initiative was written as "build a device capability registry". There is one.

`cable-planner/src/renderer/lib/deviceTypeRegistry.ts` resolves a stable, version-stable
GUID (GDTF / DIN-SPEC-15800-analogous) to a datasheet template across 15 catalogue
modules, and — where a specialised UI exists — to an authoritative device role. Its own
header states the principle plainly:

> "fuer Katalog-Geraete ist die Rolle eine Datenblatt-Tatsache, kein Regex-Treffer.
> Namens-Heuristik bleibt nur Fallback fuer Geraete OHNE deviceTypeId"

That is the registry, and it already carries the property that matters: identity resolved
from a datasheet fact rather than from a name match.

So the initiative is not "build a registry". Building one would duplicate it.

## What is actually missing: the evidence has no shape

The gap is one level down, and it is the same gap in every repository examined:
**the evidence for each capability exists, and it exists as prose.**

The numbers are better than expected, which is itself the finding:

| Where | State of the evidence |
| --- | --- |
| 9 of 17 cable-planner catalogues | **253 per-entry source URLs**, as `// Quelle: <url>` comments |
| 4 of the remaining 8 | one collective module-header claim ("sourced from official datasheets"), no per-entry attribution |
| `light-planner/src/core/gelLibrary.ts` | "Transmission and mired shift from manufacturer datasheets" — one line, for a table whose numbers feed exposure and colour maths |
| `sony-camera-bridge/.../capabilities.ts` | 12 connection modes x 24 capabilities, with the *reasoning* per row in comments |

No `provenance`, `source`, or `verifiedAt` field exists in any of them. Verified by
search, not assumed.

The sony-camera-bridge file is the clearest case, because there the comment carries
something no URL could:

> "AWB/ABB/Auto-Iris stay disabled deliberately: Sony's 700 protocol is NDA-only and no
> public source documents those auto-setup command codes (verified against the
> DelphiForBroadcasting/sony-700ptp-protocol reference, which only covers framing +
> paint). Enabling them needs a CNA-1 log or RCP traffic capture."

That paragraph states what is known, how it was checked, why the answer is *no*, and what
evidence would change it. It is the best-documented capability decision in the suite —
and it is unreachable by any code, untestable, and invisible to a user who wonders why a
button is greyed out.

**This is the correction to make explicitly:** an earlier reading of this ground reported
that provenance was absent and would have to be gathered. That understated it. The
evidence is largely *there*. What is missing is its shape. That makes the initiative much
cheaper than scored — for 9 catalogues it is mechanical — and changes its character from
research to modelling.

## Why this is ADR-003, one level up

ADR-003 gives a *device instance* a provenance triple: `planned` / `commanded` /
`confirmed` — what we intended, what we sent, what the device told us back.

This initiative asks the same question of a *device type*: is this port count something we
read on a datasheet (and which one, when), something a user typed, or something a name
heuristic guessed? Today all three look identical in the model, and the third is silently
the weakest.

It is therefore not an independent initiative. It is the type-level half of ADR-003, and
it must not be shaped before ADR-003 Increment 2 (provenance in the plan model) is
decided — otherwise the suite gets two different provenance vocabularies for the same
idea, and the second one will be wrong.

## What blocked it — both blockers are gone (2026-09-03)

1. ~~**Parked design question 3**~~ — ADR-003 Increment 2 was a user decision and this
   initiative is downstream of it. It has been decided ("ja, jetzt bauen") and built as
   `cable-planner#643`: `types/provenance.ts` carries the vocabulary
   (`unknown` / `planned` / `commanded` / `confirmed`) and `DECLARED_PROVENANCE` names the
   sites. **That vocabulary is now the one this initiative must reuse** — the whole reason
   for waiting was to avoid inventing a second one for the same idea.
2. ~~**sony-camera-bridge is unreachable**~~ — merge permission was extended to all eight
   repositories on 2026-09-03. PR #8 (licence) and PR #10 (`fix(tally): unbestätigt ist
   nicht aus`) are merged; the repository's `master` is at `a79d988`. The single best
   example of the evidence class — the AWB/ABB comment quoted above — is reachable.

Note what #10 is, because it belongs to this file's argument: it is the *instance*-level
half of the same idea, applied to the tally state. `BridgeTallyState` now carries
`program?/preview?/isoRec?`, and `undefined` means "not confirmed" rather than "off". The
type level, which is what this initiative is about, still has no such distinction: a port
count read off a datasheet and one guessed by a name heuristic remain indistinguishable.

## If it is taken up

In this order — step 1 is now settled, so step 2 is the next actual work:

1. ~~Decide the vocabulary **with** ADR-003 Increment 2, not before it.~~ Done: reuse
   `cable-planner/src/renderer/types/provenance.ts`. Do not invent a second one.
2. Lift the 253 existing `// Quelle:` comments into a field. Mechanical, reversible,
   loses nothing — the comments can stay.
3. Only then the 8 catalogues without per-entry attribution, which is real research and
   the expensive part.
4. `capabilities.ts` last: its comments carry reasoning, not references, and a URL field
   is the wrong container for them.

Step 2 alone would make a claim testable that the suite currently only asserts. That is
ADR-005's fourth rule — a "lossless" claim is testable — applied to a different kind of
claim, and it is the reason this initiative is worth keeping on the list even while it
waits.
