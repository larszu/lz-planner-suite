# AV Planner feature strategy

Derived from the research corpus per section 29. Inputs: `AV-INDUSTRY-SOFTWARE-LANDSCAPE.md`
(all 16 segments), `USER-NEED-DATABASE.md` (150 needs, 11 professions), `FEATURE-MATRIX.md`,
and `../repos/INVENTORY.md` (the eight existing repositories, read from source).

Read `../METHOD.md` for what the research could and could not verify.

## 1. The strategic position

> **The market has excellent runtimes and no design-time layer. AV Planner is the design-time
> layer, and the identity spine that the runtimes render.**

This is not a slogan chosen for it; it is what six independent segment researchers and eight
independent role researchers converged on without seeing each other's work. The market evidence
says no product specifies a show. The user evidence says the cost of that absence is identity
retyped into five to eight systems, every show, by every department.

Section 27 asks where the competitive advantage comes from. The answer the research gives is
sharper than "integration": **we are the only participant that can own the plan, because the
runtimes structurally cannot.** A switcher knows its own inputs. A rental ERP knows its own
assets. Neither can hold the sentence *"camera 4 is an FX6 at position SL-2, on SMPTE drum 12,
into frame input 7, tally TSL address 4, MV window 6, comms channel C, operated by Anna."*
That sentence is the product.

## 2. Prioritisation model

Section 26 defines seven factors. `USER-NEED-DATABASE.md` scores the two measurable ones
(frequency, time saving) mechanically. The remaining five are judgements and are applied here in
the open, each 1–5.

| Factor | What it asks |
| --- | --- |
| **UV** User value | How hard a real problem does it solve? |
| **FR** Frequency | How often does the problem occur? (from the need DB) |
| **TS** Time saving | How much time does it return? (from the need DB) |
| **ER** Error reduction | How many live-show errors does it prevent? |
| **AV** AV relevance | How specific is it to AV/broadcast — i.e. how safe from generic competitors? |
| **IV** Integration value | How many other modules benefit? |
| **CX** Complexity | Build cost. **Subtracted.** |

Score = `UV + FR + TS + ER + AV + IV - CX`.

## 3. The roadmap

| # | Initiative | UV | FR | TS | ER | AV | IV | CX | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **0** | **Consolidate the fork** (enabling, not a feature) | 3 | 5 | 3 | 4 | 1 | 5 | 3 | **18** |
| **1** | **Source identity spine + label projection** | 5 | 5 | 5 | 5 | 5 | 5 | 3 | **27** |
| **2** | **Tally map generated from the plan** | 5 | 4 | 3 | 5 | 5 | 4 | 2 | **24** |
| **3** | **BOM / pick list derived from the technical plan** | 5 | 5 | 5 | 4 | 4 | 5 | 4 | **24** |
| **4** | **Version-stamped print + paper return path** | 4 | 5 | 3 | 4 | 4 | 4 | 2 | **22** |
| **5** | **Change-impact view ("what does this invalidate")** | 5 | 4 | 4 | 5 | 4 | 5 | 5 | **22** |
| **6** | **Intercom plan as data, with vendor export** | 4 | 3 | 3 | 4 | 5 | 4 | 3 | **20** |
| **7** | **Return path: plan vs as-built reconciliation** | 5 | 4 | 4 | 4 | 4 | 5 | 6 | **20** |
| **8** | **Network/IP plan from the same device records** | 4 | 3 | 4 | 4 | 4 | 4 | 4 | **19** |
| **9** | **Delivery/streaming chain as signal flow** | 4 | 3 | 3 | 4 | 4 | 3 | 3 | **18** |

### 0. Consolidate the fork — do this first, it is cheap and it blocks everything

`../repos/INVENTORY.md` establishes that the suite does not consume the planners; it contains
vendored copies of them. `packages/inventory-core/src/types.ts`,
`cable-planner/src/renderer/types/inventory.ts` and `light-planner/src/inventory/types.ts` are
byte-identical (md5 `33e0a5aa32d0150b86c68184b2e880f5`), the standalone repos declare no
`@avplan/*` dependency, and active development lands upstream in the standalone repos.

An identity spine that spans modules cannot be built on top of three hand-synced copies of the
domain model. This is the same defect we are attacking in the market, and fixing it is a
precondition, not a nice-to-have. It is ranked 0 rather than 1 because it delivers no user value
by itself — but nothing after it is safe until it is done.

### 1. Source identity spine + label projection — the product

One record per real-world thing. Every label, sheet, export and device configuration becomes a
*rendering* of that record. A rename costs one edit.

The evidence is the strongest in the corpus: eight of eleven professions named this as their top
widespread need. The consequences are not cosmetic — the technical-director dossier attributes
two of the highest-stakes gallery errors (the multiviewer lying, tally lying) to a hand-maintained
mapping table drifting from the switcher, and the tally dossier records a crew discovering by
packet capture that camera 1 was on TSL address 12.

We are unusually close. `cable-planner` already exports ATEM input labels, Videohub source and
destination labels and ATEM multiviewer layouts, and models ports, cables and equipment. The work
is to make one record own the identity and turn those exports into projections of it, then extend
the projection set to switcher mnemonics, TSL/UMD, ISO naming and console scenes.

### 2. Tally map generated from the plan

Highest ratio of value to effort once (1) exists. The tally dossier's finding is blunt: "Nobody
plans tally — they only run it", and address mapping is manual everywhere except NDI. We own a
tally runtime (`tally-pi`) and a camera bridge that already carries `BridgeTallyState`. Emitting a
reviewable, diffable tally map from the plan — and then feeding our own runtime with it — is a
feature no competitor offers, on top of infrastructure we already have.

### 3. BOM and pick list derived from the technical plan

The largest unclaimed square in the feature matrix. Every rental ERP scores `no`; the rental
dossier calls it "the single largest unclaimed piece of value adjacent to the segment". Production
managers asked for exactly this ("the technical plan produces the commercial BOM instead of it
being retyped"), and warehouse staff asked for its other half ("close the technical-plan-to-pick-
list gap").

We are the only entrant already holding both sides: a signal plan with real port modelling and an
inventory with cases, storage tree and units. This is section 28's automation chain made concrete
and it should be built as the first cross-module flow.

### 4. Version-stamped print and a fast return path from paper

Cheap, and it corrects a misreading that would otherwise damage the product. Paper is not legacy
behaviour to be eliminated: the camera-operator research is explicit that it is kept deliberately,
because it works without battery and cannot silently change underneath you. The actual failure is
that a printout goes stale invisibly.

So: stamp every printed artefact with the plan version and a scannable code; make the code a
route back into the record it came from. Production managers and warehouse staff independently
asked for the return path ("make the printed artefact scannable back in"). Because we are already
offline-first and already have a strong print pipeline, this is mostly assembly.

### 5–9

Change-impact analysis answers a question no product in the corpus answers. Intercom planning
fills the segment with *no interchange format from anyone*, and we own an intercom runtime and
already export Green-GO config from `cable-planner`. The return path is the lighting segment's
declared out-of-scope gap and the network segment's plan-versus-found need — high value, highest
complexity, and correctly sequenced last among the identity-dependent items.

## 4. Cross-module automation (section 28), grounded

The mandate's example chain is right in shape but should be built in the order value arrives, not
end to end. With the identity spine in place, the chain becomes:

```
camera position placed (multicam-planner)
  -> identity created: number, name, position          [spine]
  -> required signals derived                          (cable-planner: ports, cable, length)
  -> BOM + reservation                                 (inventory-core)
  -> pack list by case                                 (StorageNode / LPN)
  -> labels projected                                  (ATEM, Videohub, TSL/UMD, MV)
  -> tally map emitted                                 (tally-pi)
  -> camera bridge binds by identity                   (sony-camera-bridge)
  -> intercom channel assigned                         (Broadcast-intercom)
```

Every arrow above is between two modules we already own. That is the section 27 advantage stated
as an engineering plan rather than a claim.

## 5. What we will not build

Section 31 is explicit that the goal is not the most features. Nine deliberate exclusions are
recorded in `FEATURE-MATRIX.md`, block E and C. The principle behind them: **do not compete with a
mature runtime or with a vendor-specific physical model.** grandMA, QLab, ArrayCalc, Soundvision,
Wireless Workbench and the switchers have decades of trust, muscle memory and measured data behind
them. Crew scheduling and payroll are a mature market with heavy compliance cost and almost no AV
differentiation.

Where those tools exist, our job is to *feed* them from the plan — export into Wireless Workbench,
emit MVR for the visualisers, drive Companion — not to replace them.

## 6. Implementation rule (section 30)

Where this research and the existing code disagree, the research does not automatically win, and
neither does the code. Two places where the research should change existing plans:

1. **Read-only mobile is the wrong half.** `cable-planner`'s mobile share is read/check-only. The
   warehouse and freelancer dossiers both need write access on-site and offline. This should be
   reconsidered rather than treated as settled.
2. **`.avplan` currently passes foreign domains through as `unknown`.** That is a sound way to
   avoid data loss today, but the corpus's strongest integration finding is that *silent* field
   loss is the most damaging failure mode. The format should move toward explicit refusal —
   an import that cannot preserve a field must say so — rather than opaque pass-through.

And one where the existing code should win over an obvious market pattern: every competitor is
cloud-first with an offline afterthought. The research says the offline half is the one that
matters and that everyone builds it for the wrong workflow. Our local-file, atomic-write,
offline-first architecture is a genuine advantage and should not be traded for cloud convenience.

## 7. Open questions

- All sixteen segments are researched. Visual workspace, crew scheduling, asset tracking and
  video switching arrived after the ranking was set and have not yet been folded into the matrix
  directly; doing so is the next refresh, and is not expected to move the ranking.
- The section 15 user research (Reddit, G2, Capterra, Trustpilot) could not be performed in this
  environment. The role dossiers partly compensate, but the pain-point half of the mandate should
  be redone with open egress before the roadmap is treated as final.
- Pricing across the market is unverified here, so no positioning claim about cost should be made
  from this corpus yet.
