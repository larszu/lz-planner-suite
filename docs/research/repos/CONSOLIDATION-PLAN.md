# Fork consolidation plan (roadmap position 0)

Direction decided: **the standalone repositories stay canonical; the suite's `apps/*` copies are
brought back in line and kept there by tooling.**

Rationale from the measurements in `INVENTORY.md`: development demonstrably happens upstream —
cable-planner is 2,721 lines and roughly a month ahead, multicam-planner 8,145 lines ahead. The
suite's copies are stale, not authoritative.

## Why this cannot be a simple sync

The obvious implementation — copy `upstream/<app>/src` over `apps/<app>/src`, keep a list of
suite-only files as an overlay — **would destroy real work**, and this was verified rather than
assumed.

`light-planner/src/App.tsx` is the clearest case. The suite version:

- adds the shell bridge (`connectShellHistory`, `publishShellSetting` from `@avplan/ui/embed`),
- adds an onboarding component,
- has i18n throughout: 93 `t(...)` calls against upstream's 68,

while the upstream version still has `InventoryDialog` and its `inventoryOpen` state, which the
suite deliberately removed in *"Lager-Tool entfernt"* (2026-07-14).

Both sets of changes live in the same file, interleaved. The same pattern holds across 63 files.
A directional copy in either direction loses a feature.

## Current measurement

Produced by `scripts/planner-drift.mjs`, recorded in `DRIFT-REPORT.md`:

| App | drift | only-upstream | only-suite | two-way | upstream-ahead | suite-ahead | expected-overlay |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cable-planner | 53 | 9 | 6 | 26 | 10 | 2 | 3 |
| multicam-planner | 79 | 45 | 11 | 21 | 2 | 0 | 1 |
| light-planner | 29 | 5 | 8 | 16 | 0 | 0 | 1 |

`expected-overlay` is the deliberate `@avplan/*` import rewrite — five files whose only difference
is `import … from '@avplan/inventory-core'` against upstream's `'../types/inventory'`. That is the
consolidation working as intended and is excluded from the drift count.

## Staged path

**Stage 1 — stop the bleeding (done).** `scripts/planner-drift.mjs` measures and classifies the
divergence; `scripts/planner-drift-baseline.json` freezes it; the `planner-drift` CI job fails if
drift grows.

Two things keep the guard from crying wolf, because a guard that produces false failures gets
disabled within a week:

- **Upstream movement is not this repo's fault.** Drift also grows when the standalone repos move
  ahead, which they will — that is the whole point. The baseline therefore records each upstream
  commit SHA, and the check fails *only* when the SHA is unchanged and the drift still grew, i.e.
  when the suite side is what moved. If upstream has advanced, the job reports the new number and
  asks for a baseline refresh, and passes.
- **Missing checkouts skip, they do not fail.** The job needs read access to the three neighbour
  repositories. Without it the script skips the comparison and exits 0, so the guard can never
  block an unrelated PR.

Both paths, plus the genuine-failure path, are verified: baseline unchanged passes; a manipulated
upstream SHA reports and passes; a raised suite-side drift with an unchanged SHA exits 1.

**Stage 2 — harvest the mechanical cases.** 63 findings need no judgement:

- `only-upstream` (59 files) — the suite simply lacks them. Includes the whole NetBox import
  feature in cable-planner and 45 multicam files, ten of them tests.
- `upstream-ahead` (12 files) — the suite's content is a strict subset; take upstream.
- `suite-ahead` (2 files) — upstream's content is a strict subset; the suite's version wins and
  should be pushed upstream.

**Stage 3 — reconcile the 63 two-way files by hand.** Ordered by size in `DRIFT-REPORT.md`. The
heavy ones are `multicam/components/Sidebar/Sidebar.tsx` (358 suite-only lines against 718
upstream-only) and `multicam/components/Preview/CameraPreview.tsx` (171 / 494). Each needs a real
three-way merge, and each should end with the merged result pushed **upstream**, so the suite copy
becomes reproducible from it.

**Stage 4 — make the overlay declarative.** Once the two sides differ only by shell integration
(`shellSettings.ts`, `shellLexware.ts`, `shellHistory.ts`, `isEmbedded.ts`, `lexwareIpc.ts`,
`lexwareService.ts`, the `@avplan/*` import rewrites), that difference can be expressed as a small
patch set and the sync becomes mechanical. Only then is a `sync-planners.mjs` safe to write.

**Stage 5 — decide whether the copies should exist at all.** With the overlay minimal, the
alternatives (submodules, or the suite consuming published packages) become cheap to evaluate.
That decision is deliberately deferred until the divergence is gone, because making it now would
be choosing an architecture to avoid doing a merge.

## Rule while this is open

Every commit that touches `apps/<app>/src` should either be reconciliation work, or be made
upstream first and mirrored. The guard will catch the difference either way.
