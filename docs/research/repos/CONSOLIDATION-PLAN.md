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

**Stage 2 — harvest the genuinely mechanical cases (done).** The original plan assumed all 63
`only-upstream` and `upstream-ahead` findings were mechanical. Working through them showed that is
not true, in two ways worth recording.

*First, six of them were not drift at all.* `inventory/types.ts`, `inventory/portable.ts`
(multicam and light) and `renderer/types/inventory.ts`, `renderer/lib/inventoryPortable.ts`
(cable) exist upstream and are absent from the suite **because `@avplan/inventory-core` replaced
them** — all three apps import their inventory types and `serializeInventory`/`parseInventory`
from the package. Copying them back would have undone the consolidation. They are now declared in
`REPLACED_BY_PACKAGE` in the drift script and classified `expected-overlay`.

*Second, the remaining `only-upstream` files cannot land on their own.* They are features, and
their wiring lives in files that are two-way:

- cable-planner's NetBox import needs registration in `main/index.ts`, `preload.cts`,
  `projectStore.ts` and the settings tab — all diverged.
- multicam's 43 files (rig control, shotlist) need the `Shot`, `Shotlist` and `RigTake` types,
  which live in `types/index.ts` — two-way, with 157 upstream-only lines.
- light-planner's `MenuBar.tsx` and `Toolbar.tsx` need wiring in `App.tsx` — two-way.

Copying them in isolation would add dead code and a broken build. They move to stage 3.

What *was* mechanical and is now done: the twelve `upstream-ahead` files, where the suite's
content is a strict subset so taking upstream is lossless by definition, plus `types/netbox.ts`
(a dependency of `bridge.ts`, pure types, no wiring). Verified before landing: every relative
import in each copied file resolves in the suite, then `npm run build --workspaces` (exit 0),
`npm run test --workspaces` (317 tests, exit 0) and `npm run lint --workspaces` (exit 0).

Drift after stage 2: **161 → 142.**

**Stage 3 — reconcile the two-way files, and the features that depend on them.**

*A correction to this plan's own numbers first.* The original `two-way` line counts overstated the
work badly, because the classifier compared raw lines. The suite replaces bare German literals
with `t('key', 'Text')` calls, so every translated line counted twice — once as suite-only in its
`t()` form, once as upstream-only in its bare form. A fully reconciled file still looked like heavy
divergence.

The classifier now normalises that transformation away (`t('k','Text')` and
`translate(lang,'k','Text')` both collapse to `'Text'`) before comparing. The effect is large:

| File | claimed before | actual |
| --- | --- | --- |
| `light/components/PropertyPanel.tsx` | 218 / 215 | 37 / 34 |
| `light/components/ScheduleDialog.tsx` | 85 / 72 | 38 / 25 |
| `light/components/TopBar.tsx` | 74 / 55 | 34 / 15 |
| `multicam/components/Sidebar/Sidebar.tsx` | 358 / 718 | 321 / 681 |

With honest numbers the three apps are in very different states, and the reconciliation order
follows from that rather than from file counts:

- **multicam-planner is the real work: 2,149 upstream-only lines** across its two-way files —
  `Sidebar.tsx` (681), `CameraPreview.tsx` (481), `useStore.ts` (193), `types/index.ts` (157).
  This matches the LOC gap (11,964 in the suite against 20,109 upstream). Its 43 `only-upstream`
  files (rig control, shotlist) unlock once `types/index.ts` carries the `Shot`, `Shotlist` and
  `RigTake` types.
- **cable-planner is moderate: 589 upstream-only lines**, concentrated in `IntegrationsTab.tsx`
  (148), `OnboardingTour.tsx` (93) and `WelcomeDialog.tsx` (59), plus the NetBox feature waiting on
  its wiring.
- **light-planner is essentially caught up.** A per-file merge pass over all sixteen of its
  two-way files concluded that the suite already carries the upstream features and differs only by
  the i18n and shell overlay. The suite copy is in fact *larger* than upstream (15,482 against
  15,272 lines) and additionally holds onboarding, hooks and the English dictionary. Nothing was
  changed, and nothing needed to be.

Each merge should end with the result pushed **upstream**, so the suite copy becomes reproducible
from it.

### Stage 3 result

| App | drift before | after | `only-upstream` before | after |
| --- | --- | --- | --- | --- |
| multicam-planner | 79 | **31** | 45 | **0** |
| cable-planner | 53 | **27** | 9 | **0** |
| light-planner | 29 | 29 | 5 | 3 |

Suite-wide tests went from **317 to 643**, because the vendored copies had been missing whole test
files: sixteen in multicam, five in cable.

*A blind spot in the guard, found while doing this.* The classifier only compared `src/`.
cable-planner keeps its tests in `tests/`, so five missing test files — including
`netboxMapping.test.ts` and `portOccupancy.test.ts`, the tests for the NetBox code being vendored
— were invisible to it. `ROOTS` now covers `src` and `tests`. `scripts/` stays out on purpose:
build scripts may legitimately differ between monorepo and standalone.

Two upstream test files import the modules that `@avplan/inventory-core` replaced
(`inventoryContract.test.ts` in both multicam and cable). Rather than dropping them, their imports
were rewritten to the package — every symbol they need is exported from it — so the wire-format
contract is now checked at app level as well as in the package's own test.

### Stage 3 close-out

Three findings while finishing light-planner, each of which would have made things worse if the
plan had been followed literally:

- **`components/MenuBar.tsx` and `components/Toolbar.tsx` are dead code upstream.** Upstream's own
  `App.tsx` imports `TopBar` and `ToolRail`; a search of the whole upstream tree finds no importer
  for either file. Vendoring them would have imported dead code. They are declared `DEAD_UPSTREAM`.
  The cleaner fix is to delete them upstream.
- **`components/ErrorBoundary.tsx` is package-replaced**, like the inventory modules: both apps
  import `ErrorBoundary` from `@avplan/ui`. Worth recording that the bulk copy in stage 3 had
  already vendored multicam's local copy as dead code; it has been removed again.
- **All 27 `only-suite` files are the intentional overlay** — Lexware and shell bridge in cable,
  hooks plus the German dictionaries in multicam, onboarding plus the English dictionaries in
  light. They are declared `SUITE_OVERLAY` so the drift figure counts only divergence that
  actually needs work.

| | start | after stage 3 |
| --- | --- | --- |
| drift total | 161 | **57** |
| `only-upstream` | 59 | **0** |
| `only-suite` | 27 | **0** |
| suite-wide tests | 317 | **643** |

What is left is 48 `two-way` files whose residual difference is line-level, plus 9 `suite-ahead`
files.

**`suite-ahead` after a reconciliation is the expected steady state, not a to-do list.** An
earlier revision of this plan called those nine files "the better version" and said they should be
pushed upstream. That was wrong, and checking it cost one command: the 131 extra lines in
`cable/renderer/components/Settings/tabs/IntegrationsTab.tsx` are the Lexware API-key UI, added by
the suite's own commit `127a5f7`. Pushing them upstream would put Lexware billing into a
repository that has no Lexware integration.

The mechanics are simply that a correctly merged file contains *upstream ∪ suite overlay*, which
makes upstream a strict subset — so the classifier reports `suite-ahead`. Seeing that label on a
reconciled file is confirmation the merge worked.

A crude grep for "lexware" and "@avplan" flagged only 29 of those 137 extra lines as overlay,
because the rest are ordinary React state and effects (`apiKey`, `setApiKeyValue`, `useEffect`)
inside a Lexware-specific component. The lesson for anyone extending this tooling: overlay cannot
be detected by keyword, only by knowing which feature a block belongs to.

What genuinely remains open is therefore the `two-way` residue and the orphaned i18n keys —
not a batch of files waiting to go upstream.

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
