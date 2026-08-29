# Pain points: Visual Workspace / Canvas / Boards

> Research run: **2026-08-29** (commissioning brief dated 2026-08-28). Evidence tiers follow
> [`docs/research/METHOD.md`](../METHOD.md): **FACT** (I opened the page and read it),
> **INFERENCE** (my reasoning from those facts), **UNKNOWN** (an honest gap, with the check that
> would close it).
>
> Companion document: [`landscape/visual-workspace.md`](../landscape/visual-workspace.md), which
> covers what these products *are*. This document covers only what users say is *wrong* with them.

---

## Method

### What was searched, and what was not

| Channel | Status this run |
| --- | --- |
| GitHub issue search (REST, cross-repo) | **Available.** Primary evidence base. 16 queries. |
| `github.com` HTML issue/org pages via fetch | **Available**, but returns the issue *body* only — GitHub renders comment threads client-side, so **comment text was not retrievable**. |
| `raw.githubusercontent.com` (specs, READMEs, source) | **Available.** 3 files read. Highest-quality evidence here. |
| `api.github.com` (for comment bodies) | **403 Forbidden** through the proxy. |
| GitHub MCP `issue_read` (would return comments) | **Denied** — the tool is scoped to this account's own eight repositories only. |
| WebSearch, EN + DE, all queries | **Unavailable** — session budget exhausted (200/200) by earlier segment passes. **Zero searches ran.** |
| Reddit (r/VIDEOENGINEERING, r/AVProfessionals, r/sysadmin, …) | **Blocked** by the egress proxy. |
| Review sites (G2, Capterra, GetApp, TrustRadius, Trustpilot, Software Advice) | **Blocked.** |
| Vendor forums (community.miro.com, forum.obsidian.md) | **Blocked.** |
| Hacker News | **Blocked.** |
| German-language sources (film-tv-video.de, production-partner.de, veranstaltungstechnik forums) | **Not reachable** — no search, domains not on the allowlist. |

Domains confirmed blocked or refused this run: `old.reddit.com`, `www.capterra.com`,
`community.miro.com`, `forum.obsidian.md`, `news.ycombinator.com`, `api.github.com`.

### What that means for this dossier — stated plainly

**Three consequences, and none of them are hidden below.**

1. **The two largest commercial products in the segment — Miro and FigJam — have almost no
   user-complaint evidence here**, because neither runs a public issue tracker and every channel
   where their users complain (review sites, the Miro community forum, Reddit) was blocked. What
   little exists comes from Miro's *own* API client repository, which is a real but narrow window:
   it shows API defects, not board-user frustration. Their sections below say what is genuinely
   known (little) and name the exact page to open first when a session with working search picks
   this up. **Nothing was invented to fill them.**
2. **No pricing complaints could be verified at all.** Every pricing page was unreachable. The
   PRICING PROBLEMS heading appears under each product for structural consistency, and where I
   could not verify a price it says so. The one price-adjacent fact carried over from the
   landscape pass (tldraw's licence tiers, read from the SDK's own docs) is marked as such.
3. **Comment threads were unreadable**, so "51 comments" is a *signal of heat* I can honestly
   report, but I cannot tell you what those 51 people said. Where I quote, I quote an issue
   **body**, which I did read in full. There are no paraphrased comment-thread quotes in this
   document, because I could not read any.

**What this dossier is unusually strong on instead.** Reaction counts, issue ages, and open/closed
state are exactly the data the brief asks for ("long-open feature requests with many thumbs-up"),
and the REST search returns them precisely. Better still, two of the most valuable findings are
from **primary source code and vendor documentation**, not opinion: tldraw's hard performance
ceilings read out of its own `options.ts`, and Nextcloud's published load-test table. Those settle
questions that a hundred forum posts would only gesture at.

### Volume

- **16** GitHub issue searches across **10** repositories, plus 1 repository search.
- **~250** issue records scanned (title, state, dates, reaction and comment counts).
- **~12** issue bodies read in full.
- **3** source/documentation files read (`jsoncanvas/spec/1.0.md`, `whiteboard/README.md`,
  `tldraw/packages/editor/src/lib/options.ts`).
- **11** HTML pages fetched; **6** domains attempted and blocked.

### Bias warning on the evidence that does exist

1. **Open-source skew, and it is severe.** Every product with a public tracker looks worse in this
   document than every product without one, purely because its complaints are visible. Excalidraw
   accumulates the most findings below; it is *not* the worst product in the segment. It is the one
   whose 2,281 open issues I can read. Miro looks clean here only because it is opaque.
2. **Survivorship.** A tracker records complaints from people who stayed long enough to file. The
   evaluator who tried a tool for ten minutes and left is invisible.
3. **Reaction counts measure GitHub-user demand, not market demand.** "Vim Mode" leading Anytype's
   chart with 99 votes tells you about the population that files issues, not about buyers.
4. **Age cuts both ways.** A 2020 issue still open in 2026 is strong evidence of a durable gap
   (Excalidraw #1772). A 2020 *bug* may long since have been fixed around. I give dates throughout
   so the reader can discount accordingly; per METHOD.md, a stale report is weak evidence.

---

## Per-product findings

### Excalidraw (MIT, excalidraw project)

The richest tracker in the segment: **2,281 open issues** at time of reading. Weight accordingly —
see the bias warning above.

**STRENGTHS (what even critics concede)**
- The file format is genuinely open and readable, and the project ships a real embeddable npm
  package. Integration questions in the tracker are about *collaboration*, never about whether the
  editor can be embedded at all — nobody asks "can I use this in my app", they ask "how do I sync
  it". FACT (issue population), INFERENCE (the conclusion).
- The maintainers accept precise, code-level bug reports and the community writes them: issue
  [#11962](https://github.com/excalidraw/excalidraw/issues/11962) is a diagnosis with file, line,
  cause and suggested patch. That is a healthy engineering culture.

**WEAKNESSES**
- **A single-scene browser-storage model is the root of a whole class of data-loss bugs.** This is
  the most important finding about Excalidraw and it is structural, not incidental. See PERFORMANCE
  and OFFLINE below.
- **Rich text does not exist**, and it is the second-largest demand cluster after tables:
  [#5138](https://github.com/excalidraw/excalidraw/issues/5138) "Highlight words in a paragraph"
  (179 +1, open since 2022-05-03), [#1126](https://github.com/excalidraw/excalidraw/issues/1126)
  "Support colors for ranges in text" (142 +1, open since **2020-03-29**),
  [#6678](https://github.com/excalidraw/excalidraw/issues/6678) "Rich Text Editor / Powerful WYSIWYG
  support" (35 +1). Two of the three carry the maintainers' own `richtext` label; #5138 and #1126
  are labelled `Candidate P1`. FACT. Frequency: **widespread**.
- **React-only.** [#6718](https://github.com/excalidraw/excalidraw/issues/6718) asks for Svelte
  compatibility (29 +1); [#1404](https://github.com/excalidraw/excalidraw/issues/1404) asks to use
  it as a Vue component (18 +1, open since 2020-04-12, 31 comments). FACT.

**MISSING FEATURES (what users request)**
- **Tables. This is the single most-demanded feature in the entire segment.**
  [#4847](https://github.com/excalidraw/excalidraw/issues/4847) "Please add a 'table' template" —
  **258 +1, 325 total reactions, 147 comments, opened 2022-02-26, still open, last active
  2026-06-05.** It is the most-reacted open issue in the repository by a wide margin. FACT.
  Frequency: **widespread**.
- Layers: [#7725](https://github.com/excalidraw/excalidraw/issues/7725) (28 +1, open since 2024-02).
- Customisable keybindings: [#3852](https://github.com/excalidraw/excalidraw/issues/3852) (36 +1,
  open since 2021-07).
- A CLI: [#1261](https://github.com/excalidraw/excalidraw/issues/1261) (40 +1, open since 2020-04)
  — i.e. headless render/convert, which is what a build pipeline needs.
- Tabs / multiple scenes in one window:
  [#1543](https://github.com/excalidraw/excalidraw/issues/1543) (85 +1, open since 2020-05-04).
- Library management: [#6217](https://github.com/excalidraw/excalidraw/issues/6217) categorised
  library items (18 +1) and [#8304](https://github.com/excalidraw/excalidraw/issues/8304) search
  and resize the library pane (18 +1). **Directly relevant**: an AV equipment library is exactly a
  large categorised symbol library, and Excalidraw's flat unsearchable one is a known failure at
  that scale. FACT.
- LaTeX rendering: [#5265](https://github.com/excalidraw/excalidraw/issues/5265) (70 +1,
  `Candidate P1`). Code blocks with syntax highlighting:
  [#9456](https://github.com/excalidraw/excalidraw/issues/9456) (25 +1) and
  [#10036](https://github.com/excalidraw/excalidraw/issues/10036) (20 +1).
- **Scale drawings** — [#6198](https://github.com/excalidraw/excalidraw/issues/6198), opened
  2023-02-06, still open. The requester wants unit-aware proportional drawing to lay out rooms and
  furniture, explicitly *not* full CAD. This is the AV/stage-plan use case appearing organically in
  a sketching tool. FACT. Frequency: **isolated** in this tracker, but see Cross-product patterns.
- Autosave: [#2733](https://github.com/excalidraw/excalidraw/issues/2733) (17 +1, open since
  2021-01) — telling, given the data-loss cluster.

**UX PROBLEMS**
- **Snapping and grid behaviour is a persistent sore spot for precision work.** 37 issues match a
  snapping/grid query. Highlights:
  [#4945](https://github.com/excalidraw/excalidraw/issues/4945) "add option to disable snap to grid
  in grid mode" (11 +1, open since 2022-03);
  [#10407](https://github.com/excalidraw/excalidraw/issues/10407) "New snapping behavior breaks
  existing diagrams" (2025-11);
  [#6889](https://github.com/excalidraw/excalidraw/issues/6889) "Grid with no snapping, just for
  visual reference" (3 +1);
  [#8866](https://github.com/excalidraw/excalidraw/issues/8866) copy/paste does not snap correctly;
  [#11223](https://github.com/excalidraw/excalidraw/issues/11223) snap-to-angle breaks when the
  pointer is over another element. FACT. Frequency: **recurring**.
  INFERENCE: the tool is sketch-first, and users doing *precise* diagram work are fighting a model
  built for hand-drawn looseness. That tension is the segment's central UX fault line.
- **Touch and stylus are a known weak area, acknowledged by the maintainers themselves.**
  [#9705](https://github.com/excalidraw/excalidraw/issues/9705) is a meta/collection issue titled
  "Touch Device Support" (41 +1, opened 2025-06-28) carrying `mobile` and `tablet` labels. Live
  examples: [#11981](https://github.com/excalidraw/excalidraw/issues/11981) pen autosmoothing delay,
  [#11973](https://github.com/excalidraw/excalidraw/issues/11973) cannot switch between eraser and
  pen with an external pen, [#11945](https://github.com/excalidraw/excalidraw/issues/11945) the
  eraser cannot delete unlocked freedraw elements. FACT. Frequency: **recurring**.
- Arrowheads cannot be resized: [#6712](https://github.com/excalidraw/excalidraw/issues/6712)
  (21 +1, `arrow-redesign` label, still active 2026-07).
- Accessibility: [#11961](https://github.com/excalidraw/excalidraw/issues/11961) — dialogs carry a
  dangling `aria-labelledby` and therefore have no accessible name. FACT.

**PERFORMANCE PROBLEMS**
- **The renderer has no spatial index.** [#10512](https://github.com/excalidraw/excalidraw/issues/10512)
  (opened 2025-12-14, open, zero comments) reports that `getRenderableElements` calls
  `scene.getNonDeletedElements()` and *then* filters for visibility, making every pan and zoom
  **O(N) in total scene size rather than in visible elements**, so "performance degrades linearly as
  scene size grows". FACT — read in full.
  INFERENCE: this is precisely the architectural gap that the landscape pass credits tldraw with
  having closed (spatial-index culling + LOD). It is the clearest engineering difference between
  the segment's two leading open canvases, and it is confirmed from both sides by primary sources.
- Corroborating user reports: [#7237](https://github.com/excalidraw/excalidraw/issues/7237) "Lag
  with many elements" (open since 2023-11, 11 comments, still active 2026-03);
  [#8273](https://github.com/excalidraw/excalidraw/issues/8273) "Lagging issues on large canvas";
  [#8242](https://github.com/excalidraw/excalidraw/issues/8242) sluggish when zoomed in;
  [#7234](https://github.com/excalidraw/excalidraw/issues/7234) groups inside frames cause a big
  performance hit. Older, now-closed reports go back to 2020 (#628, #1056). Frequency: **recurring**.
- Collaboration has a hard payload ceiling: [#10404](https://github.com/excalidraw/excalidraw/issues/10404)
  records `FirebaseError: The value of property "ciphertext" is longer than 1048487 bytes` — i.e.
  a ~1 MB cap on the encrypted scene blob, beyond which the collaborative session errors. FACT.

**PRICING PROBLEMS**
- The MIT core has no licence fee. Excalidraw+ is the paid hosted tier; **its pricing could not be
  verified** (excalidraw.com blocked). One paid-tier complaint is visible from its title alone:
  [#9890](https://github.com/excalidraw/excalidraw/issues/9890) "excalidraw+ loss of content,
  images, etc." (2025-08). A closed request,
  [#6227](https://github.com/excalidraw/excalidraw/issues/6227) (13 +1), asked for comments for
  external viewers on shared links in Excalidraw+. UNKNOWN otherwise.

**LOCK-IN**
- Low, and this is Excalidraw's genuine competitive strength: MIT licence, documented `.excalidraw`
  JSON, per-element `customData` extension slot (carried from the landscape pass).
- The residual lock-in is *architectural, not legal*: **you are locked into React** (#6718, #1404),
  and you are locked into building your own collaboration layer (below).

**OFFLINE**
- It runs offline as a PWA — and **this is where the most serious defects live.** Four distinct
  reported failure modes, all rooted in one design decision: the app keeps a **single** ad-hoc scene
  in browser `localStorage`.
  1. **Quota exhaustion silently destroys work.**
     [#8411](https://github.com/excalidraw/excalidraw/issues/8411) (open since 2024-08-21) and
     [#8395](https://github.com/excalidraw/excalidraw/issues/8395) both report that exceeding the
     storage quota erases recent work. The #8411 body shows `saveDataStateToLocalStorage` wrapping
     `setItem` in a `try/catch` that only calls `console.error` — the user is never told.
  2. **On Firefox, even the warning that was later added does not fire.**
     [#11962](https://github.com/excalidraw/excalidraw/issues/11962) (2026-08-25) shows the check is
     `error.name === "QuotaExceededError"`, the Chromium spelling; Firefox throws
     `NS_ERROR_DOM_QUOTA_REACHED`. So "the scene silently stops persisting while the user keeps
     drawing. They find out on reload." FACT — read in full, with code.
  3. **Opening a file destroys the unsaved scene.**
     [#7800](https://github.com/excalidraw/excalidraw/issues/7800) (open since 2024-03-21): opening
     a `.excalidraw` file from the file explorer "will clobber all stored ad hoc drawings without
     warning the user."
  4. **Sharing a link can wipe the canvas.**
     [#11762](https://github.com/excalidraw/excalidraw/issues/11762) (2026-07-25).
  FACT throughout. Frequency: **widespread** — 51 issues match a data-loss query, spanning 2020 to
  2026, which is the strongest single pattern in this dossier.
- Offline asset loading is also fragile: [#11567](https://github.com/excalidraw/excalidraw/issues/11567)
  reports the service-worker precache limit (2.3 MB) silently skips larger assets, "which can cause
  the app to fail to load offline". FACT.

**INTEGRATION PROBLEMS**
- **Collaboration is not in the npm package, and integrators repeatedly hit the wall.** Not one
  loud issue but a steady drip:
  [#6390](https://github.com/excalidraw/excalidraw/issues/6390) "What is the right way to build live
  'collaboration'?", [#8193](https://github.com/excalidraw/excalidraw/issues/8193) "Don't succeed to
  integrate collaboration", [#3210](https://github.com/excalidraw/excalidraw/issues/3210)
  "Operations for collaborative editing", [#5447](https://github.com/excalidraw/excalidraw/issues/5447)
  "Self-Hosting documents storage & collaborative" (8 +1),
  [#6612](https://github.com/excalidraw/excalidraw/issues/6612) "Local collaboration demo". FACT.
  Frequency: **recurring**.
- Self-hosting the full stack is a **six-year-old umbrella issue**:
  [#1772](https://github.com/excalidraw/excalidraw/issues/1772), opened 2020-06-15, **142 comments**,
  54 +1 and 57 hearts, still open and active 2026-04. FACT.
- **An embedding hazard worth flagging to any host application**:
  [#11963](https://github.com/excalidraw/excalidraw/issues/11963) reports that `setLanguage()` sets
  `dir` and `lang` on `document.documentElement` — the editor mutates the *whole host page*'s
  direction and language. FACT. Directly relevant to a bilingual DE/EN host app.

---

### tldraw (proprietary licence + public source, tldraw company)

**STRENGTHS (what even critics concede)**
- **It is the only product in the segment that publishes its own performance ceilings as code.**
  From `packages/editor/src/lib/options.ts` (read 2026-08-29): `maxShapesPerPage: 4000`,
  `maxPages: 40`, `maxFilesAtOnce: 100`, and `debouncedZoomThreshold: 500` — the shape count above
  which cached zoom kicks in, documented as "The number of shapes that must be on the page for the
  debounced zoom level to be used." FACT. That is honest engineering, and it makes tldraw the only
  product here you can capacity-plan against before writing code.
- Performance issues get **fixed and closed**, not accumulated: #7425 (culling drops frames above
  1000 shapes), #2905, #3359 (`hitTestPoint` regression), #3357 (rotated shapes), #5156 (drawing lag
  with many strokes), #3436 (Android) are all **closed**. Contrast Excalidraw, where #7237 has been
  open since 2023. FACT.

**WEAKNESSES**
- **The 4000-shape page ceiling is a real design limit**, not just a default. INFERENCE from the
  option name and value: an application whose documents routinely exceed it is outside tldraw's
  intended envelope.
- Open performance defects remain at the edges:
  [#6716](https://github.com/tldraw/tldraw/issues/6716) "Shapes are not de-layerized after drawing,
  causing poor VRAM scaling" (open, `performance` label, 7 comments) and
  [#8586](https://github.com/tldraw/tldraw/issues/8586) "Crash and memory usage spike on iOS when
  interacting with shapes while at a low zoom level" (opened 2026-04-17, open). FACT.

**MISSING FEATURES (what users request)**
- **Tables**, again: [#1780](https://github.com/tldraw/tldraw/issues/1780) "Add table shape type",
  opened **2023-07-30**, 23 +1, `feature`+`sdk` labels, still open and still being discussed
  2026-04. FACT.
- **Arrow routing is the gap that matters most for signal-flow work.**
  [#6664](https://github.com/tldraw/tldraw/issues/6664) asks for "custom waypoints and orthogonal
  routing for arrows"; [#8169](https://github.com/tldraw/tldraw/issues/8169) asks for a spline arrow
  kind with binding support; [#6993](https://github.com/tldraw/tldraw/issues/6993) asks for
  additional drag handles on arrows. All open. FACT. Frequency: **recurring**.
  INFERENCE: tldraw's bindings are excellent as a *data* model but its arrows are visually
  freeform; orthogonal, waypointed cable runs are not a first-class citizen.
- Configurable border radius on basic shapes:
  [#8552](https://github.com/tldraw/tldraw/issues/8552) (open 2026-04).
- Internal object links for navigating a page:
  [#6159](https://github.com/tldraw/tldraw/issues/6159) (open, `keep` label).
- Persist last-used styles across sessions: [#8932](https://github.com/tldraw/tldraw/issues/8932).
- A framework-agnostic core: [#7954](https://github.com/tldraw/tldraw/issues/7954) "Extract
  framework-agnostic editor-core package from editor" — i.e. **tldraw is React-coupled too**, and
  the maintainers know it. FACT.

**UX PROBLEMS**
- Tablet/stylus friction, same theme as Excalidraw:
  [#7372](https://github.com/tldraw/tldraw/issues/7372) copy/paste keyboard shortcuts don't work on
  iPad; [#9924](https://github.com/tldraw/tldraw/issues/9924) the delete-file confirmation dialog
  cannot be clicked with an Apple Pencil; [#6528](https://github.com/tldraw/tldraw/issues/6528)
  drawing-tablet behaves unexpectedly; [#6906](https://github.com/tldraw/tldraw/issues/6906) holding
  the pen tool icon resets the tool. FACT. Frequency: **recurring**.
- [#6763](https://github.com/tldraw/tldraw/issues/6763) the canvas sometimes moves on its own when
  using the middle mouse button.

**PERFORMANCE PROBLEMS**
- Covered above. Net assessment: **the best-engineered renderer in the segment, with a documented
  ceiling and a live mobile-crash bug.** The pattern in the closed issues is instructive — several
  reported that dragging felt sluggish "when there are lots of shapes **on the page (not just on
  screen)**" ([#3436](https://github.com/tldraw/tldraw/issues/3436), closed), which is the exact
  failure mode culling is supposed to eliminate.

**PRICING PROBLEMS**
- Carried from the landscape pass (FACT there, not re-verified here): free in development;
  **production requires a licence key**; a 100-day free trial exists; a commercial licence is
  **quoted by a sales team**, i.e. "requires sales contact", not "as advertised"; a hobby licence
  for non-commercial use requires a "made with tldraw" watermark on the canvas.
- INFERENCE: for a small commercial desktop product, "contact sales for a quote" is itself the
  pricing problem — it makes cost unknowable at evaluation time, which is when the framework
  decision is actually made.

**LOCK-IN**
- **This is tldraw's real risk, and the community has said so loudly — with the voting pattern to
  prove it.** Two 2026 governance changes:
  1. [#7695](https://github.com/tldraw/tldraw/issues/7695) "Contributions policy" (opened
     2026-01-15): the project will "begin **automatically closing pull requests from external
     contributors**", citing an influx of low-engagement AI-generated PRs. Reactions: **192 +1, 88
     hearts, 4 −1** — the community largely *endorsed* this. FACT, and worth reading carefully: the
     sentiment here is approval, not revolt.
  2. [#8082](https://github.com/tldraw/tldraw/issues/8082) "Move tests to closed source repo"
     (opened 2026-02-25): a proposal to relocate ~327 test files out of the public repository.
     Reactions: **81 +1 against 164 −1, plus 15 confused and 19 laugh** — an overwhelmingly hostile
     response, the only strongly-downvoted issue found anywhere in this segment. It carries the
     labels `maybe` and `stale` and was last touched 2026-08-01. FACT.
  INFERENCE: taken together these mark a steady contraction of tldraw's open surface. #7695 is
  defensible and popular; #8082 was not, and appears to have stalled under the pushback. For anyone
  adopting tldraw as a dependency, the trend line — not either single event — is the risk.

**OFFLINE**
- **UNKNOWN in detail.** The SDK is a client-side library and will run offline; whether the licence
  key requires periodic online validation is **not established** and is the single most important
  open question for an offline-first desktop product. To check: `tldraw.dev/legal` and the licence
  key documentation, both blocked this run.

**INTEGRATION PROBLEMS**
- React coupling (#7954, above).
- [#7551](https://github.com/tldraw/tldraw/issues/7551) shows server-side thumbnail generation is
  not built in — it is an open proposal to add a Playwright-based service. Rendering a board to an
  image outside the browser is therefore your problem. FACT.

---

### Nextcloud Whiteboard (AGPL-3.0, Nextcloud)

The AGPL Excalidraw derivative. **Inherits Excalidraw's canvas problems and adds a distributed
systems problem on top.**

**STRENGTHS**
- **The most honest performance documentation in the segment.** The README publishes a real
  load-test table (read 2026-08-29):

  | Concurrent users | CPU | Memory | Server egress | Recommended |
  | --- | --- | --- | --- | --- |
  | 50 | ~10% | ~0.24 GB | ~3.1 Mbps | 2 vCPU / 1 GB |
  | 100 | ~20% | ~0.36 GB | ~12.9 Mbps | 4 vCPU / 2 GB |
  | 500 | ~203% | 3.6–4.5 GB | ~1.2 Gbps | ≥8 vCPU / ≥8 GB + Redis + 2 nodes |

  A single instance **saturates at 500 users with ~30% client dropout**. FACT. Vendors do not
  normally publish their own breaking point.
- The websocket server is optional: "The websocket server is only needed for live collaboration -
  basic whiteboard functionality works without it." FACT.

**WEAKNESSES / PERFORMANCE PROBLEMS**
- **The flagship complaint is that boards do not save.**
  [#238](https://github.com/nextcloud/whiteboard/issues/238) "whiteboard contents are not saved" —
  **51 comments, 14 +1, opened 2024-10-21, still open** and classified high-priority. The body:
  "whatever I draw in them is not saved. If I close the whiteboard, when I go to reopen it, It's
  empty." Maintainer subtasks point at data-management fixes, connectivity verification, and
  **file-locking conflicts returning HTTP 500 where a 409 with retry logic is needed**. FACT.
- Corroborating: [#437](https://github.com/nextcloud/whiteboard/issues/437) "Saving / reopen data
  loss" (5 +1); [#382](https://github.com/nextcloud/whiteboard/issues/382) "Saving Issue with
  Redis". Frequency: **recurring**, and the highest-signal cluster in this repo.
- **Idle CPU burn is a distinct, repeatedly reported operational problem**:
  [#1000](https://github.com/nextcloud/whiteboard/issues/1000) "High CPU usage since AIO v12.5.0"
  (5 +1), [#1058](https://github.com/nextcloud/whiteboard/issues/1058) "Whiteboard consuming
  cpu-load without any todo" (4 +1), [#1033](https://github.com/nextcloud/whiteboard/issues/1033)
  "Whiteboard docker container with a lot of zombie processes" (5 +1), with
  [#1172](https://github.com/nextcloud/whiteboard/issues/1172) proposing `init: true` as the fix.
  FACT. Frequency: **recurring**.

**MISSING FEATURES**
- Mobile apps: [#625](https://github.com/nextcloud/whiteboard/issues/625) (5 +1).
- PDF import/display: [#1014](https://github.com/nextcloud/whiteboard/issues/1014) (3 +1).
- Custom shapes: [#604](https://github.com/nextcloud/whiteboard/issues/604) (2 +1).
- Multiple Nextcloud servers: [#98](https://github.com/nextcloud/whiteboard/issues/98) (13 +1, open
  since 2024-07).
- Binaries so it can run without Docker: [#153](https://github.com/nextcloud/whiteboard/issues/153).

**UX PROBLEMS**
- [#826](https://github.com/nextcloud/whiteboard/issues/826) asks for an *actual* white canvas in
  Nextcloud dark mode (8 +1, still active 2026-08-28) — the dark theme inverts the drawing surface,
  which is wrong for a whiteboard. **Directly relevant** to any app with a light/dark canvas.
- [#384](https://github.com/nextcloud/whiteboard/issues/384) the "Max file size" setting has no
  description and no unit (6 +1).
- [#228](https://github.com/nextcloud/whiteboard/issues/228) the whiteboard sometimes zooms out on
  its own.

**PRICING PROBLEMS** — none; AGPL-3.0, self-hosted. Cost is operational, and the load-test table
above is the honest statement of it.

**LOCK-IN**
- **Fork drift is measurable**: [#938](https://github.com/nextcloud/whiteboard/issues/938) "File
  incompatibility with excalidraw.com" (3 +1, 2026-01) and
  [#724](https://github.com/nextcloud/whiteboard/issues/724) the "Add to Excalidraw" action does not
  import libraries (5 +1). FACT. INFERENCE: an open format is not the same as a *portable* one —
  two implementations of `.excalidraw` have already diverged enough to break round-tripping. This is
  the single most transferable warning in the dossier for anyone planning to adopt an interchange
  format.

**OFFLINE** — works without the websocket server (above); browser IndexedDB holds local state and
syncs to the Nextcloud server. FACT from README.

**INTEGRATION PROBLEMS** — [#27](https://github.com/nextcloud/whiteboard/issues/27) "Integrated sync
backend" reflects that the separate Node websocket server is itself the deployment burden;
[#193](https://github.com/nextcloud/whiteboard/issues/193) wrong websocket path;
[#394](https://github.com/nextcloud/whiteboard/issues/394) asks for Docker secrets for the JWT token.

---

### AFFiNE (MIT core, TOEVERYTHING PTE. LTD.)

**STRENGTHS** — the doc/canvas merge over one CRDT block tree is real and nothing else does it
(landscape). Self-hostable.

**WEAKNESSES / PERFORMANCE PROBLEMS**
- **Sync is the dominant complaint, and it is specifically self-hosted sync.** 131 issues match a
  sync/data-loss query. Open and unresolved:
  [#14164](https://github.com/toeverything/AFFiNE/issues/14164) "Sync doesn't work";
  [#13741](https://github.com/toeverything/AFFiNE/issues/13741) "lost workspaces";
  [#12833](https://github.com/toeverything/AFFiNE/issues/12833) self-hosted workspace content will
  not display on Android (8 comments). Closed but numerous:
  [#14469](https://github.com/toeverything/AFFiNE/issues/14469) "Data Loss and Cloud Confusion",
  [#15236](https://github.com/toeverything/AFFiNE/issues/15236) "the sync function is not working
  and workspace cannot be loaded", [#13272](https://github.com/toeverything/AFFiNE/issues/13272)
  sync stuck at 89%, [#14872](https://github.com/toeverything/AFFiNE/issues/14872) self-hosting
  cannot connect. FACT. Frequency: **widespread**.
- **Upgrading the self-hosted server has lost user data**:
  [#15245](https://github.com/toeverything/AFFiNE/issues/15245) "Missing Tables after update to
  latest affine_server container" (opened 2026-07-14, **open**, 9 comments). FACT.
- Edgeless canvas performance degrades with content volume:
  [#14433](https://github.com/toeverything/AFFiNE/issues/14433) "Edgless board lagging when 3000
  pictures involved" (closed); [#14585](https://github.com/toeverything/AFFiNE/issues/14585) "Page
  Mode loading and editing lag scale with number of embedded frames" (**open**, 2026-03);
  [#10343](https://github.com/toeverything/AFFiNE/issues/10343) page load slow when resizing in
  edgeless mode. FACT. Frequency: **recurring**.
- Local workspaces cannot reliably be deleted:
  [#14731](https://github.com/toeverything/AFFiNE/issues/14731) (open) and
  [#14491](https://github.com/toeverything/AFFiNE/issues/14491) "Local Workspaces are not being
  deleted, and return after refresh".
- [#14793](https://github.com/toeverything/AFFiNE/issues/14793) duplicating/cloning canvas elements
  "works, but awfully" (open).

**MISSING FEATURES**
- **A true local-first mode with optional cloud sync** — the recurring ask:
  [#13285](https://github.com/toeverything/AFFiNE/issues/13285) "Local first mobile app" (4 +1),
  [#15515](https://github.com/toeverything/AFFiNE/issues/15515) "Local workspace with Cloud sync
  instead of Local or Cloud" (closed 2026-08),
  [#14587](https://github.com/toeverything/AFFiNE/issues/14587) sync via S3-compatible storage and
  WebDAV. FACT. INFERENCE: the local/cloud split is binary and users want the middle.
- [#10839](https://github.com/toeverything/AFFiNE/issues/10839) and
  [#8716](https://github.com/toeverything/AFFiNE/issues/8716) "Disable demo workspace" (**44 +1**) —
  admins want control over what ships into a fresh install.

**UX PROBLEMS** — [#14031](https://github.com/toeverything/AFFiNE/issues/14031) own workspaces shown
with a "Joined Workspace" icon; the demo-workspace issue above.

**PRICING PROBLEMS** — **unverified**; affine.pro blocked. Self-hosting is free under MIT, with the
landscape's caveat that `packages/backend` is separately licensed.

**LOCK-IN** — MIT core; `.affine` export exists but
[#13661](https://github.com/toeverything/AFFiNE/issues/13661) reports "Not possible to restore
.affine files" (closed). FACT. INFERENCE: an export you cannot re-import is not an exit.

**OFFLINE** — local workspaces work offline by design, but the bug population above is concentrated
exactly at the offline/online boundary. [#14282](https://github.com/toeverything/AFFiNE/issues/14282)
"Desktop client causes periodic high upload traffic when self-hosted (Web version does not)" and
[#15270](https://github.com/toeverything/AFFiNE/issues/15270) "macOS desktop 0.27.0 loses
self-hosted auth session after restart" are both desktop-specific. FACT.

**INTEGRATION PROBLEMS** — [#14448](https://github.com/toeverything/AFFiNE/issues/14448) requests
MCP server support for edgeless canvas block positioning, i.e. there is no scripting route to place
things on the canvas today.

---

### draw.io / diagrams.net (Apache 2.0, draw.io Ltd + AG)

**STRENGTHS**
- **The tracker itself is the strength.** Only 101 open issues matched a broad query and the
  most-supported has **22 +1** ([#5579](https://github.com/jgraph/drawio/issues/5579), resize the
  right-hand sidebar). Compare Excalidraw's 258. INFERENCE: this is a mature, aggressively triaged
  product where the big gaps were closed years ago — the remaining asks are small and specific.
  That is what a finished tool's backlog looks like.
- Air-gapped desktop operation (landscape, FACT there): "completely isolated from the Internet,
  apart from the update process". **No offline complaints appear in the tracker**, which for a
  segment this riddled with sync failures is a notable negative result.

**WEAKNESSES / UX PROBLEMS**
- **Precision-geometry defects are the visible cluster**, and they matter for technical drawing:
  [#4994](https://github.com/jgraph/drawio/issues/4994) rotated rectangles do not snap to grid
  correctly; [#4826](https://github.com/jgraph/drawio/issues/4826) no way to snap automatic
  orthogonal connector routing to the grid (4 +1);
  [#5683](https://github.com/jgraph/drawio/issues/5683) connection points merge as scale changes;
  [#5470](https://github.com/jgraph/drawio/issues/5470) the grid defaults to "2.5 mm" but that is
  not the actual grid value; [#5454](https://github.com/jgraph/drawio/issues/5454) automatic tree
  layout orders child nodes wrongly. FACT. Frequency: **recurring**.
- [#5637](https://github.com/jgraph/drawio/issues/5637) layer toggling/visibility broke after a
  recent update; [#5671](https://github.com/jgraph/drawio/issues/5671) the colour picker makes the
  PWA window unfocusable.
- [#5261](https://github.com/jgraph/drawio/issues/5261) asks for a live X/Y coordinate readout
  (3 +1) — a basic technical-drawing affordance that is absent.

**MISSING FEATURES** — [#3687](https://github.com/jgraph/drawio/issues/3687) replace a shape with a
grouped shape from the scratchpad or a custom library (2 +1);
[#5058](https://github.com/jgraph/drawio/issues/5058) remember SVG export dialog settings;
[#5439](https://github.com/jgraph/drawio/issues/5439) display a library's shape title in the diagram.

**PERFORMANCE PROBLEMS** — **none surfaced.** No performance issue appeared in the top results.
INFERENCE: mxGraph's SVG renderer is old and well-optimised; this is a genuine strength.

**PRICING PROBLEMS** — Apache 2.0, free. The commercial products are the Atlassian marketplace
plugins, whose pricing is **unverified** (blocked).

**LOCK-IN** — lowest in the segment: Apache 2.0, XML format, offline desktop build.

**INTEGRATION PROBLEMS** — the cloud connectors are the weak spot:
[#5313](https://github.com/jgraph/drawio/issues/5313) "Self-hosted GitLab backend
(GitlabAuthServlet) ignores all configuration and defaults to gitlab.com for token exchange" — a
hard blocker for self-hosted GitLab users. [#3755](https://github.com/jgraph/drawio/issues/3755)
OneDrive/SharePoint share button builds wrong URLs (7 comments, open since 2023);
[#5040](https://github.com/jgraph/drawio/issues/5040) "Save As" misbehaves with SharePoint/OneDrive
folders. [#761](https://github.com/jgraph/drawio/issues/761) Teams chat integration has 36 comments
and has been open since 2020-02. FACT. Frequency: **recurring**.

---

### Obsidian Canvas / JSON Canvas (MIT spec, Obsidian)

Obsidian itself is closed-source with no public issue tracker, and `forum.obsidian.md` was blocked.
**Evidence here is about the specification only**, read from its own repository.

**STRENGTHS** — the segment's only cross-vendor open interchange format; ~2 pages; MIT; a canvas is
a plain file next to your notes. FACT (spec read 2026-08-29).

**WEAKNESSES — what the spec deliberately does not cover.** From `spec/1.0.md`: it defines nodes
(text/file/link/group) and edges with position, size, z-index, colour. It defines **no rendering
instructions, no interactivity, no font/line-thickness/shadow styling, no animation, and no
per-element metadata or versioning**. Preset colour values are "intentionally not defined so that
applications can tailor the presets to their specific brand colors or color scheme." FACT.
INFERENCE: two conformant implementations can render the same file to visibly different pictures.
For a *drawing* that is acceptable; for a *technical document* where colour carries meaning (signal
type, voltage, department) it is a correctness problem, and the spec pushes that responsibility
entirely onto the application.

**MISSING FEATURES (what users request)** — every open issue on the spec repo is a gap report:
- "Ambiguous spec. How is an id constructed?" — no identity rules.
- **"how to handle arbitrary entities and attributes that don't fit in the spec?"** — there is **no
  extension slot**. FACT. INFERENCE: this is the decisive difference from Excalidraw's per-element
  `customData`, and it is fatal for domain data. A JSON Canvas file cannot carry a cable's connector
  type, a device's rack unit, or a channel number without inventing a non-conformant field.
- "Proposal: Shape Node", "Proposal (Venn Diagram)" — no shape primitives at all.
- "Proposal: Edge offset property", "Proposal: Edges additional properties" — edge expressiveness is
  thin, which is exactly where a signal-flow document needs depth.
- "spec: Add an optional `$schema` property at top level" — no machine validation.
- "feature request; align text inside cards" — no text layout.
- "are file nodes always local relative paths?" — path semantics undefined, so portability across
  vaults/machines is unspecified.
- "Proposal: canvasz — a zipped canvas file, which packages the markdown files along with it" — no
  packaging story; a canvas plus its referenced files is not one transportable artefact.
FACT (all titles read from the issue list). Frequency: **recurring** — nine distinct proposals for
one two-page spec.

**PRICING / OFFLINE / LOCK-IN** — the format is MIT and the file is local, so lock-in is minimal
and offline is total; that is the whole point of it. Obsidian's own app pricing is **unverified**.

**PERFORMANCE / UX PROBLEMS** — **UNKNOWN.** No public tracker; the forum was blocked. To check:
`forum.obsidian.md` search for "canvas performance" and "canvas large".

---

### Miro (proprietary, Miro)

**Evidence is thin and I will not pad it.** No public issue tracker; community forum, review sites
and Reddit all blocked. The only window available was Miro's own API client repository, which has
just **7 open issues**.

**STRENGTHS** — enterprise board administration is unmatched: 114-path REST v2, SCIM, audit logs,
data classification, legal hold, eDiscovery (landscape, FACT there, from Miro's own OpenAPI spec).

**INTEGRATION PROBLEMS** — the little that is visible is genuinely diagnostic:
- [#452](https://github.com/miroapp/api-clients/issues/452) (2025-12, **open**): in the official
  Python client, the `Picture` model types `id` as `[StrictFloat, StrictInt]` but **the API returns
  `id` as a string**, so `.get_boards()` fails model validation. FACT. INFERENCE: the clients are
  generated from a spec that does not match the live API — a spec/implementation drift defect, and
  the kind that breaks every generated client at once.
- [#258](https://github.com/miroapp/api-clients/issues/258) "There is no function to use an Item to
  create a new item" — no duplicate/clone helper.
- [#180](https://github.com/miroapp/api-clients/issues/180) shape/widget `style` is inaccessible when
  the item is fetched via a Frame.
- [#408](https://github.com/miroapp/api-clients/issues/408) "[API spec] Dark colors break tags".
Frequency: **isolated** individually; the *pattern* (generated clients drifting from the live API)
is **recurring** across all four.

**WEAKNESSES / UX / PERFORMANCE / PRICING / LOCK-IN / OFFLINE** — **UNKNOWN.** The widely-repeated
claims about Miro (slow large boards, per-seat cost, Enterprise-gated export) could **not be
verified this run and are therefore not asserted here.** To close this gap, open in order:
`community.miro.com` (performance and feature-request categories), `miro.com/pricing`,
`g2.com/products/miro/reviews?order=lowest_rated`, and Miro's Enterprise export-job documentation.

---

### FigJam (proprietary, Figma)

**STRENGTHS** — the only product found with first-class board primitives as API objects (stickies,
stamps, washi tape, sections, connectors) and the only real `TableNode` API in the segment
(landscape, FACT there).

**Everything else: UNKNOWN.** No public tracker; the Figma forum was not reachable. Note the
contrast worth carrying forward: **FigJam has shipped the table primitive that Excalidraw (258 +1,
4½ years) and tldraw (23 +1, 3 years) have not.** That is a FACT about the API surface, and the
best single argument that tables are a genuine segment-wide gap rather than a vocal minority.
To check: `forum.figma.com`, and the FigJam widget/plugin API changelog.

---

### Anytype (Any Source Available Licence, Any association)

Public tracker; 188 open issues matched. The complaint profile is a **PKM tool**, not a canvas tool
— treat its transferability to AV planning as low.

**MISSING FEATURES** — [#247](https://github.com/anyproto/anytype-ts/issues/247) Vim mode (**99 +1**,
open since 2023-09, the repo's top request); [#642](https://github.com/anyproto/anytype-ts/issues/642)
Notion-like formulas (21 +1); [#1490](https://github.com/anyproto/anytype-ts/issues/1490) multi-tab
and multi-window (14 +1); [#1523](https://github.com/anyproto/anytype-ts/issues/1523) image
copy/paste (11 +1); [#935](https://github.com/anyproto/anytype-ts/issues/935) copy link to block
(7 +1); [#1379](https://github.com/anyproto/anytype-ts/issues/1379) commenting on any element.

**WEAKNESSES**
- **No browser access at all**: [#631](https://github.com/anyproto/anytype-ts/issues/631) "Create a
  web interface to access content from browser" (6 +1). FACT. INFERENCE: the P2P/E2EE architecture
  that makes Anytype attractive is the same thing that makes a read-only web share impossible —
  a direct trade-off, and one any offline-first encrypted design will face.
- Internationalisation is weak: [#757](https://github.com/anyproto/anytype-ts/issues/757) automatic
  RTL support (15 +1) and [#1373](https://github.com/anyproto/anytype-ts/issues/1373) "Deep
  Frustration: Lack of Full Arabic Language Support and Auto-Text Direction Issues" (7 +1, 3
  confused, 2 hearts, 3 hooray — an unusually mixed reaction spread);
  [#780](https://github.com/anyproto/anytype-ts/issues/780) Chinese search problems. FACT.
- [#953](https://github.com/anyproto/anytype-ts/issues/953) asks for multiple spaces with *different
  sync methods* (5 +1) — users want per-space choice of local vs synced.

**PRICING / PERFORMANCE / OFFLINE** — **unverified / UNKNOWN**; anytype.io blocked. Offline-first and
P2P by design (landscape).

**LOCK-IN** — source-available but **not OSI open source** (landscape, FACT). INFERENCE: for a
product whose entire pitch is data sovereignty, that licence is the loudest unaddressed objection.

---

### Yjs (MIT, Yjs project)

Not a canvas, but the CRDT substrate under AFFiNE, Nextcloud Whiteboard and much of the segment.
**Its problems become your problems if you build on it.**

**WEAKNESSES / PERFORMANCE PROBLEMS** — the tombstone/garbage-collection cluster, small in count but
serious in kind:
- [#741](https://github.com/yjs/yjs/issues/741) "ydocs with a lot of deleted map entries (tombstones)
  leak memory" — opened 2025-10-21, **still open**, last active 2026-07-11.
- [#541](https://github.com/yjs/yjs/issues/541) "Slow apply when garbage collecting large update"
  — open since 2023-06.
- [#493](https://github.com/yjs/yjs/issues/493) "document object continuously growing with 'deleted'
  items while editing" (closed).
FACT. Frequency: **recurring** (three independent reports of one underlying behaviour across three
years). INFERENCE: **a Yjs document grows monotonically with edit history, not with live content.**
A long-lived, heavily-edited document accumulates tombstones indefinitely. For a project file that
lives for months across many edit sessions — which is exactly what an AV production document is —
this is the failure mode to design against from day one, not to discover in year two.

**PRICING / LOCK-IN / OFFLINE** — MIT, no fee; local-first by design; awareness is the presence
channel (landscape).

---

### CryptPad (AGPL-3.0-or-later, XWiki SAS)

Thin evidence: only 9 issues matched a whiteboard query.

**WEAKNESSES** — the most eloquent finding is a title:
[#1403](https://github.com/cryptpad/cryptpad/issues/1403) "**Whiteboard : replace with better**",
opened 2024-02-02, still open. Earlier closed requests fill in the picture:
[#679](https://github.com/cryptpad/cryptpad/issues/679) "Enhance Whiteboard with Common Basic Tools"
(3 +1), [#743](https://github.com/cryptpad/cryptpad/issues/743) multiple pages,
[#204](https://github.com/cryptpad/cryptpad/issues/204) add undo,
[#512](https://github.com/cryptpad/cryptpad/issues/512) resizing the whiteboard,
[#1330](https://github.com/cryptpad/cryptpad/issues/1330) cannot scroll a long read-only diagram,
[#1297](https://github.com/cryptpad/cryptpad/issues/1297) image size limited when embedding into a
diagram. FACT. Frequency: **isolated-to-recurring**; the volume is too low to grade higher.
INFERENCE: the whiteboard is the weak app in an otherwise respected E2EE suite, and its users know
it. CryptPad's strength is the encryption model ("the server never needs to see" credentials —
landscape), not the canvas.

**PRICING / OFFLINE** — **unverified**; cryptpad.fr blocked. E2EE implies the server cannot help
recover data, which is a durability trade-off worth stating but which I did not see complained about.

---

### Kinopio (proprietary, kinopio-club)

**Almost entirely UNKNOWN, honestly.** The organisation has 12 public repositories and
`kinopio-client` has 880 stars, **but issues are disabled on it** — only `kinopio-help` shows any
open issues (2). FACT (org page read 2026-08-29). There is therefore **no public complaint channel
to mine**, and the blocked review sites and Reddit were the alternatives.

Carried from the landscape (FACT there): it adopted JSON Canvas in both directions, and works
offline via localStorage + IndexedDB with queued API operations. INFERENCE: the queued-operation
design is the right shape for offline-first, and Kinopio is the segment's proof that a
**proprietary** product can still adopt an open interchange format both ways — which undercuts the
assumption that format openness requires an open-source licence.

To check: `kinopio.club` changelog and help site; Reddit/Twitter for user sentiment.

---

## Cross-product patterns

These repeat across multiple independent vendors. Per METHOD.md these are the most valuable
findings in the document.

**1. Tables are the segment's biggest unmet need. (widespread)**
Excalidraw #4847: 258 +1, 147 comments, open **4½ years**. tldraw #1780: open **3 years**. FigJam
has shipped a real `TableNode` API. AFFiNE users lost tables in a server upgrade (#15245) and filed
immediately. Three independent trackers, one gap, and the one product that closed it did so as a
first-class API object. INFERENCE: freeform canvases resist tables because a table is a *layout
constraint*, and these engines are built on absolute positioning. Whoever supports tabular data
natively on a canvas is solving the thing this market has been asking for longest.

**2. Browser-storage persistence causes real, repeated data loss. (widespread)**
Excalidraw: quota exhaustion silently erases work (#8411, #8395), the warning does not fire on
Firefox (#11962), opening a file clobbers the unsaved scene (#7800), sharing a link can wipe the
canvas (#11762) — **51 issues match, spanning 2020–2026**. Nextcloud Whiteboard: "contents are not
saved" (#238, 51 comments, high priority, open since 2024). AFFiNE: lost workspaces, sync stuck at
89%, data loss on container upgrade. INFERENCE: `localStorage` was never a durability layer, and a
single-scene model with no atomic write, no backup rotation and no crash recovery will lose user
work. **This is the strongest pattern in the dossier and the clearest opening for a desktop app
with real file I/O.**

**3. Renderers degrade with total scene size, not visible size. (recurring)**
Excalidraw #10512 documents O(N) full-scene traversal on every viewport update, with no spatial
index. tldraw fixed exactly this (culling, LOD) and its closed issues name the same symptom —
sluggish "when there are lots of shapes **on the page (not just on screen)**" (#3436) — but still
caps a page at **4000 shapes**. AFFiNE lags at 3000 images and scales badly with embedded frames.
INFERENCE: viewport-relative rendering cost is the defining engineering problem of the category,
and only tldraw has convincingly solved it — at the price of a documented ceiling.

**4. Precise work fights sketch-first interaction models. (recurring)**
Excalidraw has 37 snapping/grid issues including "new snapping behavior breaks existing diagrams"
and "add option to disable snap to grid in grid mode" (11 +1). draw.io — a *technical* tool — still
has rotated shapes not snapping, orthogonal connector routing that will not snap to grid, a grid
labelled 2.5 mm that is not the grid value, and no live coordinate readout. Excalidraw #6198 asks
for scale drawings outright. INFERENCE: users doing dimensioned, aligned, real-world-scale work are
using tools designed for loose thinking, and they feel every millimetre of the mismatch.

**5. Arrows are decorative, not routed. (recurring)**
tldraw has three separate open requests for waypoints, orthogonal routing and extra arrow handles
(#6664, #8169, #6993). draw.io cannot snap automatic orthogonal routing to the grid (#4826). JSON
Canvas edges carry almost no properties, with two separate proposals to extend them. INFERENCE: for
a *whiteboard* an arrow is a gesture; for a *signal flow* it is the primary object, carrying type,
direction, length and constraints. No product in this segment treats it that way. **This is the
largest structural gap between the segment and AV/broadcast planning.**

**6. Everything is React, and the maintainers admit it. (recurring)**
Excalidraw has open requests for Svelte (#6718, 29 +1) and Vue (#1404, 18 +1). tldraw has an open
internal issue to "extract framework-agnostic editor-core" (#7954). INFERENCE: framework lock-in is
the segment's quietest but most binding constraint — and, unusually, it is one that *favours* a
React-based host application.

**7. Self-hosting is a first-class demand and a first-class disappointment. (widespread)**
Excalidraw's self-hosting umbrella (#1772) has run **six years** with 142 comments. AFFiNE's
self-hosted sync failures are its single largest bug cluster. draw.io's self-hosted GitLab backend
ignores its own configuration (#5313). Nextcloud Whiteboard needs a separate Node websocket server,
burns idle CPU and spawns zombie processes. INFERENCE: the demand is proven and the execution is
consistently poor, because self-hosting is where cloud-first architectures are stress-tested by
people who cannot file a support ticket.

**8. Stylus and tablet input is broken everywhere. (recurring)**
Excalidraw maintains a *meta-issue* for touch support (#9705, 41 +1) plus live pen bugs. tldraw:
iPad copy/paste shortcuts dead, a dialog unclickable with Apple Pencil, drawing-tablet
misbehaviour, an iOS crash at low zoom. INFERENCE: these are desktop-mouse products with tablet
support retrofitted — relevant for anyone imagining on-site tablet use.

**9. Open format ≠ portable format. (recurring, and under-appreciated)**
Nextcloud Whiteboard files are already incompatible with excalidraw.com (#938) and its Excalidraw
library import is broken (#724) — two implementations of the *same* open format have diverged.
JSON Canvas leaves preset colours undefined **by design** and has no extension slot, so conformant
files can render differently and cannot carry domain data. AFFiNE cannot always restore its own
`.affine` exports (#13661). INFERENCE: publishing a schema is the easy half; a conformance test
suite and an explicit extension mechanism are what make a format actually portable.

**10. CRDT documents grow with history, not content. (recurring)**
Yjs #741 (tombstone memory leak, open), #541, #493. Any long-lived collaboratively-edited document
accumulates deletion tombstones indefinitely. INFERENCE: a production project file edited over
months will bloat unless compaction is designed in from the start.

---

## Direct quotes-of-substance

Paraphrased or quoted from issue **bodies I read in full**. As stated in the Method section,
**no comment-thread text is quoted anywhere in this document**, because GitHub comment threads were
not retrievable this run.

1. **On silent data loss from storage quota** — the reporter says the error is very difficult for a
   user to notice at all, so a lot of work can be lost, and adds that this had happened to them
   several times, which is why they investigated. They show the existing `try/catch` around
   `localStorage.setItem` doing nothing but `console.error`.
   [excalidraw #8411](https://github.com/excalidraw/excalidraw/issues/8411), opened 2024-08-21, open.

2. **On the quota warning failing on Firefox** — the reporter traces the check to
   `error.name === "QuotaExceededError"` (Chromium-only), notes Firefox throws
   `NS_ERROR_DOM_QUOTA_REACHED` instead, and concludes that on Firefox no banner renders, "the scene
   silently stops persisting while the user keeps drawing. They find out on reload."
   [excalidraw #11962](https://github.com/excalidraw/excalidraw/issues/11962), 2026-08-25, open.

3. **On opening a file destroying unsaved work** — if the user has ad-hoc drawings held only in
   browser storage and opens an `.excalidraw` file from the file explorer, a new instance opens and
   "will clobber all stored ad hoc drawings without warning the user." The reporter proposes either
   a warning, a save prompt, or storing multiple sessions in browser storage.
   [excalidraw #7800](https://github.com/excalidraw/excalidraw/issues/7800), 2024-03-21, open.

4. **On the renderer having no spatial index** — the renderer "always iterates over the full scene.
   Visibility filtering happens after the full traversal", making pan and zoom O(N) in scene size, so
   "performance degrades linearly as scene size grows" and there is "noticeable lag during pan and
   zoom operations, even when only a small subset of elements is visible."
   [excalidraw #10512](https://github.com/excalidraw/excalidraw/issues/10512), 2025-12-14, open.

5. **On boards simply not saving** — the reporter connected their Nextcloud instance to a whiteboard
   server, and "whatever I draw in them is not saved. If I close the whiteboard, when I go to reopen
   it, It's empty." Maintainer subtasks cite data-management fixes, connectivity verification, and
   HTTP 500s on locked files where a 409 plus retry logic is needed.
   [nextcloud/whiteboard #238](https://github.com/nextcloud/whiteboard/issues/238), 2024-10-21, open,
   51 comments.

6. **On tldraw closing the door to outside contributors** — the policy states the project will
   "begin automatically closing pull requests from external contributors", justified on the grounds
   that "An open pull request represents a commitment from maintainers: that the contribution will
   be reviewed carefully and considered seriously for inclusion", against a rising tide of
   AI-generated PRs. Reactions ran strongly *in favour*: 192 +1 and 88 hearts against 4 −1.
   [tldraw #7695](https://github.com/tldraw/tldraw/issues/7695), 2026-01-15, open.

7. **On tldraw proposing to close-source its tests** — a plan to move ~327 test files (unit,
   integration, e2e, plus configuration and helpers) to a closed-source repository and remove them
   from the public one. The reaction was the most hostile found in this segment: **81 +1 against
   164 −1**, with 15 confused and 19 laugh. Now labelled `maybe` and `stale`.
   [tldraw #8082](https://github.com/tldraw/tldraw/issues/8082), 2026-02-25, open.

8. **On wanting scale drawings in a sketch tool** — the requester wants unit-less proportional
   scaling ("this line is twice as big as some other line, or that it is *x units* in length") to lay
   out rooms and furniture, replacing a paper-and-scissors workflow, and explicitly says this "does
   not require absolute precision, so it's not verging into CAD territory."
   [excalidraw #6198](https://github.com/excalidraw/excalidraw/issues/6198), 2023-02-06, open.

9. **On the JSON Canvas extension gap** — an open issue asks, in the maintainers' own tracker, "how
   to handle arbitrary entities and attributes that don't fit in the spec?" Alongside it sit
   proposals for shape nodes, edge offsets, additional edge properties, a top-level `$schema`, and a
   zipped `canvasz` package format.
   [jsoncanvas issues](https://github.com/obsidianmd/jsoncanvas/issues), read 2026-08-29.

10. **On the spec declining to define colour** — JSON Canvas 1.0 states that "Specific values for
    the preset colors are intentionally not defined so that applications can tailor the presets to
    their specific brand colors or color scheme."
    [jsoncanvas spec 1.0](https://github.com/obsidianmd/jsoncanvas/blob/main/spec/1.0.md), read
    2026-08-29.

11. **On Miro's generated clients drifting from its live API** — the Python client's `Picture` model
    declares `id` as `[StrictFloat, StrictInt]`, but the API returns `id` as a string, so
    `.get_boards()` fails validation.
    [miroapp/api-clients #452](https://github.com/miroapp/api-clients/issues/452), 2025-12-24, open.

12. **On Nextcloud publishing its own breaking point** — the README's load-test table records a
    single instance at 500 concurrent users consuming ~203% CPU and 3.6–4.5 GB RAM with ~1.2 Gbps
    egress, saturating with roughly 30% client dropout, and states that "The websocket server is only
    needed for live collaboration - basic whiteboard functionality works without it."
    [nextcloud/whiteboard README](https://github.com/nextcloud/whiteboard/blob/main/README.md), read
    2026-08-29.

13. **On tldraw's documented ceilings** — `options.ts` sets `maxShapesPerPage: 4000`, `maxPages: 40`,
    `maxFilesAtOnce: 100`, and `debouncedZoomThreshold: 500`, the last documented as "The number of
    shapes that must be on the page for the debounced zoom level to be used."
    [tldraw options.ts](https://github.com/tldraw/tldraw/blob/main/packages/editor/src/lib/options.ts),
    read 2026-08-29.

14. **On the CryptPad whiteboard, in four words** — an open issue titled simply "Whiteboard :
    replace with better".
    [cryptpad #1403](https://github.com/cryptpad/cryptpad/issues/1403), 2024-02-02, open.

---

## Sources

Every URL below was opened and read this run (2026-08-29), except where marked as an API query.

**Specifications and source files (read in full)**
- https://github.com/obsidianmd/jsoncanvas/blob/main/spec/1.0.md (via raw.githubusercontent.com)
- https://github.com/nextcloud/whiteboard/blob/main/README.md (via raw.githubusercontent.com)
- https://github.com/tldraw/tldraw/blob/main/packages/editor/src/lib/options.ts (via raw.githubusercontent.com)

**Issue and organisation pages (HTML, bodies only — comments not retrievable)**
- https://github.com/excalidraw/excalidraw/issues
- https://github.com/excalidraw/excalidraw/issues/1772
- https://github.com/excalidraw/excalidraw/issues/10512
- https://github.com/tldraw/tldraw/issues/7695
- https://github.com/tldraw/tldraw/issues/8082
- https://github.com/nextcloud/whiteboard/issues/238
- https://github.com/obsidianmd/jsoncanvas/issues
- https://github.com/kinopio-club

**GitHub REST issue-search queries (16, returning structured records: titles, state, dates,
reaction and comment counts, and in 4 cases full issue bodies)**
- `repo:excalidraw/excalidraw is:open sort:reactions-+1` (30 records)
- `repo:excalidraw/excalidraw` — performance/lag/large-scene (14 records)
- `repo:excalidraw/excalidraw` — data loss / localStorage (20 records, 51 total matches)
- `repo:excalidraw/excalidraw` — localStorage quota (4 records **with bodies**)
- `repo:excalidraw/excalidraw` — collaboration integration (15 records)
- `repo:excalidraw/excalidraw` — snapping/grid/alignment (15 records, 37 total matches)
- `repo:excalidraw/excalidraw` — tables (3 records **with bodies**)
- `repo:excalidraw/excalidraw` — file open clobbering scene (3 records **with bodies**)
- `repo:tldraw/tldraw is:open sort:reactions-+1` (30 records)
- `repo:tldraw/tldraw` — performance/shapes/memory (18 records)
- `repo:jgraph/drawio is:open sort:reactions-+1` (25 records)
- `repo:nextcloud/whiteboard is:open sort:reactions-+1` (25 records)
- `repo:toeverything/AFFiNE` — sync/data loss/self-hosted (25 records)
- `repo:toeverything/AFFiNE` — edgeless canvas performance (11 records)
- `repo:anyproto/anytype-ts is:open sort:reactions-+1` (20 records)
- `repo:yjs/yjs` — memory/GC/document growth (4 records)
- `repo:miroapp/api-clients is:open` (7 records)
- `repo:cryptpad/cryptpad` — whiteboard (9 records)
- `repo:obsidianmd/jsoncanvas` — spec gaps (0 records; the issue list was read as HTML instead)
- repository search: `kinopio canvas` (0 records; the org page was read as HTML instead)

**Individual issues cited by number** — all under `github.com/<owner>/<repo>/issues/<n>`:
excalidraw/excalidraw #1010, #1090, #1126, #1261, #1317, #1404, #1543, #1772, #2733, #3210, #3535,
#3762, #3852, #4650, #4847, #4945, #5138, #5166, #5265, #5301, #5319, #5447, #6054, #6198, #6217,
#6390, #6612, #6623, #6672, #6678, #6712, #6718, #6825, #6889, #7204, #7234, #7237, #7291, #7431,
#7725, #7800, #8042, #8193, #8219, #8242, #8252, #8273, #8304, #8395, #8411, #8661, #8686, #8692,
#8817, #8866, #9456, #9515, #9705, #9890, #9955, #10036, #10101, #10296, #10404, #10407, #10480,
#10512, #10684, #10765, #11223, #11348, #11464, #11567, #11710, #11738, #11762, #11945, #11951,
#11952, #11961, #11962, #11963, #11973, #11981 ·
tldraw/tldraw #1780, #2905, #3346, #3357, #3359, #3436, #5134, #5156, #5759, #5776, #5933, #6159,
#6528, #6664, #6716, #6763, #6833, #6906, #6971, #6993, #7011, #7260, #7308, #7372, #7425, #7487,
#7491, #7502, #7551, #7695, #7954, #8082, #8159, #8169, #8552, #8586, #8932, #9060, #9200, #9555,
#9669, #9924, #10522 ·
jgraph/drawio #103, #761, #1311, #3104, #3687, #3755, #4559, #4826, #4931, #4994, #5040, #5058,
#5060, #5234, #5245, #5261, #5313, #5439, #5454, #5470, #5579, #5637, #5671, #5683, #5724 ·
nextcloud/whiteboard #22, #27, #51, #98, #153, #193, #227, #228, #238, #382, #384, #394, #437,
#604, #625, #724, #826, #938, #1000, #1014, #1033, #1039, #1058, #1095, #1172 ·
toeverything/AFFiNE #2004, #2141, #3074, #4694, #7495, #7597, #8716, #10343, #10839, #11968, #12820,
#12833, #13272, #13285, #13661, #13724, #13741, #14031, #14137, #14164, #14282, #14433, #14448,
#14469, #14491, #14585, #14587, #14731, #14793, #14863, #14872, #15236, #15245, #15270, #15404,
#15515 ·
anyproto/anytype-ts #247, #612, #631, #642, #757, #760, #777, #780, #806, #832, #917, #935, #953,
#960, #1310, #1373, #1379, #1490, #1506, #1523 ·
yjs/yjs #117, #493, #541, #741 ·
miroapp/api-clients #180, #254, #258, #407, #408, #451, #452 ·
cryptpad/cryptpad #204, #512, #679, #743, #1100, #1297, #1330, #1403, #1878

**Attempted and blocked (no content retrieved)**
- https://old.reddit.com/r/miro/search (Claude Code cannot fetch reddit)
- https://www.capterra.com/p/152438/Miro/reviews/ (EGRESS_BLOCKED)
- https://community.miro.com/ (EGRESS_BLOCKED)
- https://forum.obsidian.md/c/feature-requests/6 (EGRESS_BLOCKED)
- https://news.ycombinator.com/item?id=38683084 (EGRESS_BLOCKED)
- https://api.github.com/repos/tldraw/tldraw/issues/8082/comments (HTTP 403)

**Carried over from the landscape pass, not re-verified this run** —
[`landscape/visual-workspace.md`](../landscape/visual-workspace.md): tldraw licence tiers,
Excalidraw `customData`, drawio's air-gap claim, Miro's 114-path OpenAPI surface, FigJam's
`TableNode`, Anytype's Any Source Available Licence, Kinopio's offline queueing.
