# Visual Workspace / Canvas / Boards

Segment dossier for the AV Planner Suite market research corpus.
Research date: **2026-08-29** (the task brief names 2026-08-28; the session clock says 2026-08-29 — all "read on" dates below use the session date).

---

## Research constraints for this dossier — read this first

This dossier was produced under a hard network restriction that materially changes what it can
and cannot claim. Recording it here is not an excuse; it is the information a reader needs to
judge every statement that follows.

**What was reachable.** The session's egress proxy allowed exactly one family of hosts:
`github.com` and `raw.githubusercontent.com`, plus `git clone` over HTTPS to GitHub. Roughly
thirty GitHub pages, specs, licences, issue threads and cloned repositories were opened and
read directly. Web search was unavailable (the session's search budget was exhausted before
this dossier started).

**What was not reachable.** Every vendor website, pricing page, help centre and hosted API
documentation site was blocked by the proxy. Domains that were attempted and refused:
`milanote.com`, `www.excalidraw.com`, `docs.excalidraw.com`, `www.notion.com`, `miro.com`,
`developers.miro.com`, `miroapp.github.io`, `obsidian.md`, `tldraw.dev`, `en.wikipedia.org`,
`www.npmjs.com`.

**The consequence, stated plainly: this dossier contains almost no verified prices.** The brief
asks for every price to carry a date and a source URL. Because no pricing page could be opened,
inventing prices from memory would violate the corpus's first rule. Every commercial product
below therefore carries `unverified` in its price column, together with a note on exactly what
would need to be opened to fix it. The single pricing-adjacent fact that *was* verifiable
(tldraw's licence tiers, read from the SDK's own documentation source) is reported as fact.

**What this dossier is unusually strong on instead.** Because GitHub was open, the primary
sources available were the best kind: file-format specifications, TypeScript type definitions,
OpenAPI specs, licence texts, engineering documentation and issue trackers. So the technical
half of the brief — data models, linking, embedding, offline behaviour, export/lock-in,
interchange formats, and *measured* performance limits on large boards — is verified against
primary sources to a level that a pricing-page sweep would never have reached. The Miro item
model comes from Miro's own OpenAPI document, not from a marketing page. The tldraw shape
ceiling comes from tldraw's own options table, not from a review. That is the trade this
dossier made.

Throughout: **FACT** = read on a page or in a file, URL cited. **INFERENCE** = reasoning from
those facts, labelled. **UNKNOWN / unverified** = not established, with the check that would
establish it.

---

## Segment summary

### What this software category is for

The "visual workspace" segment covers tools whose primary surface is a **pannable, zoomable,
effectively unbounded two-dimensional plane** on which heterogeneous objects — text, images,
files, links, embedded documents, sticky notes, shapes, tables, arrows — are placed by position
rather than by a folder tree or a linear document order. The organising claim of the category is
that **spatial arrangement is itself information**: proximity means relatedness, an arrow means
dependency, a cluster means a topic, and a region means a phase.

The JSON Canvas specification, written by the Obsidian team, states the category's premise more
compactly than any vendor page:

> "Infinite canvas tools are a way to view and organize information spatially, like a digital
> whiteboard. Infinite canvases encourage freedom and exploration, and have become a popular
> interface pattern across many apps."
> — [jsoncanvas readme.md](https://github.com/obsidianmd/jsoncanvas) (read 2026-08-29)

Within that shared surface the segment splits into four fairly distinct sub-markets, which buy
for different reasons and which a competitive analysis should never blend:

1. **Enterprise collaboration whiteboards** — Miro, Mural, FigJam. Bought by organisations for
   distributed meetings, workshops, retrospectives and diagramming. The product is the
   *simultaneous session*: presence, cursors, timers, voting, facilitation. Priced per member
   per month, sold up through admin, SSO, audit log and eDiscovery tiers.
2. **Personal thinking canvases / PKM** — Obsidian Canvas, Heptabase, Scrintal, Kosmik, Muse,
   Milanote, Kinopio. Bought by individuals for research, writing, and idea development. The
   product is *the artefact you keep*: durability, file ownership, linking into a note corpus.
3. **Hybrid document + canvas workspaces** — Notion, Craft, AFFiNE, Anytype, Logseq. The canvas
   is one view over a block/object database that is also a document, a table, a kanban and a
   calendar. Bought as a general workspace; the canvas is a feature, not the product.
4. **Embeddable canvas engines** — tldraw, Excalidraw, drawio, BlockSuite, Yjs-based stacks.
   Bought (or adopted) by *software teams* who need a canvas inside their own product. Priced
   as an SDK licence or given away under an open-source licence. **This is the sub-market with
   the most direct bearing on the AV Planner Suite**, because it is the one whose output is a
   component rather than an application.

### Who buys it

- **Sub-market 1** is bought by a workplace-tools or IT function for a whole department; the
  buying committee cares about SSO, data residency, admin controls and per-seat cost. Miro's
  own API surface is the tell: of 114 documented endpoints, a large minority are organisation
  administration, SCIM user provisioning, audit logs, data classification, legal hold and
  eDiscovery — the machinery of an enterprise procurement, not of a whiteboard
  ([spec.json](https://github.com/miroapp/api-clients), read 2026-08-29).
- **Sub-market 2** is bought by individuals with their own credit card, and churns on
  durability anxiety: "what happens to my ten years of notes if this company dies?" The whole
  existence of JSON Canvas is a response to that anxiety.
- **Sub-market 3** is bought as a team workspace, often displacing a wiki.
- **Sub-market 4** is not "bought" in the seat sense at all. It is adopted by a developer, and
  the commercial event happens later, at production deployment, if the licence demands it.

### Typical price band

**Honest answer: unverified in this session.** No pricing page was reachable. What can be
stated as fact:

- **tldraw SDK**: free in development; production requires a licence key. A **free 100-day
  trial licence** exists; a **commercial licence is quoted by a sales team** ("our sales team
  will be in touch to learn about your requirements and discuss pricing"); a **hobby licence**
  for non-commercial projects requires the "made with tldraw" watermark on canvas.
  FACT, [tldraw licence docs](https://github.com/tldraw/tldraw/blob/main/apps/docs/content/community/license.mdx),
  read 2026-08-29. This is "requires sales contact", not "as advertised".
- **Open-source options carry no per-seat licence fee at all**, which is a price fact derived
  from a verified licence, not from a pricing page: Excalidraw (MIT), drawio (Apache 2.0),
  Nextcloud Whiteboard (AGPL-3.0), CryptPad (AGPL-3.0-or-later), Logseq (AGPL-3.0), AFFiNE
  (MIT, with a separately licensed `packages/backend` directory), BlockSuite (MPL-2.0), Yjs
  (MIT). Anytype is *not* open source in the OSI sense: it is under the "Any Source Available
  License 1.0".
- Everything else — Miro, Mural, FigJam, Notion, Milanote, Whimsical, Heptabase, Craft,
  Scrintal, Kosmik, Muse, Obsidian's paid tiers — is **unverified**. To fix: open each vendor's
  `/pricing` page and record plan name, amount, currency, billing period and date seen.

INFERENCE (clearly labelled, not a substitute for the check): the enterprise whiteboard
sub-market is conventionally sold per-member-per-month with a free tier limited by board count,
and the PKM sub-market is conventionally sold as a low annual personal subscription or a
one-off licence. Do not quote a number from this dossier.

---

## Product table

Columns: Offline? = does the product work with no network connection. API? = is there a
documented programmatic interface. Cells marked `unverified` could not be checked from a
reachable source in this session.

### Verified against primary sources

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
|---|---|---|---|---|---|---|
| **Excalidraw** | Excalidraw project (legal entity unverified) | Web (PWA), embeddable React package `@excalidraw/excalidraw`, self-hostable | MIT, free. Hosted "Excalidraw+" tier exists; its price is **unverified** | **Yes** — README claims "Local-first support (autosaves to the browser)" and "PWA support (works offline)" | Yes — React component API, `exportToCanvas`/`exportToSvg`/`exportToBlob` utilities, element skeleton API. **No collaboration in the package** | Hand-drawn diagramming; a genuinely open, trivially parseable JSON file format; being embedded in someone else's product |
| **tldraw** | tldraw (a company; country unverified) | Web SDK (React), used by tldraw.com | Free in development; production needs a licence key. Trial = free/100 days; commercial = **sales contact**; hobby = watermark required | **Partly** — `persistenceKey` autosaves to IndexedDB; licence keys "can be used offline"; sync queues changes while offline | Yes — large editor API, shape/tool/binding extension model, `@tldraw/sync` | Engineering rigour on big canvases: culling, LOD, reactive signals, bindings, deep links, documented limits |
| **Obsidian Canvas** | Obsidian (legal entity unverified) | Desktop (Electron) + mobile; local vault | Obsidian app pricing **unverified**; the *format* is MIT | **Yes** — canvases are `.canvas` files inside a local vault | **Format only.** `canvas.d.ts` exposes data interfaces; `obsidian.d.ts` contains **zero** occurrences of "canvas" — no editor API | Owning your data: a canvas is a plain JSON file next to your Markdown, linking directly to notes and headings |
| **Miro** | Miro | Web, desktop, mobile | **unverified** (pricing page blocked) | **unverified** | Yes — REST v2, 114 documented paths, OAuth, Web SDK, webhooks; deep enterprise/admin surface | Enterprise-grade board administration: SCIM, audit logs, data classification, legal hold, eDiscovery, org-wide board export jobs |
| **Notion** | Notion | Web, desktop, mobile | **unverified** | **unverified** | Yes — REST API, versions `2025-09-03` and `2026-03-11`; official JS SDK | Structured databases + documents; the canvas ("Notion Canvas"/whiteboard behaviour) is **unverified** in this session |
| **FigJam** (Figma) | Figma | Web, desktop | **unverified** | **unverified** | Yes — Plugin API and Widget API with FigJam-specific node types | Purpose-built board primitives as first-class API objects: stickies, stamps, washi tape, highlights, sections, code blocks, **tables**, connectors |
| **AFFiNE** | TOEVERYTHING PTE. LTD. (Singapore — INFERENCE from "PTE. LTD.") | Web, desktop, self-host (Docker) | MIT for the community edition (`packages/backend` separately licensed); hosted tier price **unverified** | **Claimed** — "local-first", "you always own your data on your disk, in spite of the cloud" | Yes — self-hostable server; built on BlockSuite | Being the one product that genuinely merges a document editor and an edgeless canvas over one block tree |
| **BlockSuite** | TOEVERYTHING PTE. LTD. | Embeddable editor framework | MPL-2.0 | Yjs-based, so local persistence is available by construction | Yes — block/flavour extension model, snapshot + transformer | A CRDT-native block model that renders as both document and canvas |
| **Anytype** | "Any — a Swiss association" (verbatim from the repo) | Desktop, mobile | "Any Source Available License 1.0" — **not OSI open source** | **Yes** — "Local-first, peer-to-peer & end-to-end-encrypted knowledge OS", "Offline-first, local storage" | Yes — gRPC API; sync via `any-sync`, optional P2P | Offline-first, end-to-end-encrypted personal knowledge base with a user-definable data model |
| **draw.io / diagrams.net** | "draw.io Ltd (previously named JGraph) and draw.io AG" | Web, **Electron desktop**, Confluence/Jira apps | Apache 2.0, free | **Yes, emphatically** — "draw.io Desktop is designed to be completely isolated from the Internet, apart from the update process" | Embedding/integration API; **no real-time collaboration in the OSS version** | Air-gapped, provably offline technical diagramming |
| **Nextcloud Whiteboard** | Nextcloud (`nextcloud` GitHub org; legal entity/country unverified) | Nextcloud server app | AGPL-3.0, free | **Yes for basic use** — "All whiteboard functionality works directly in the browser"; changes saved to IndexedDB; websocket server needed only for real-time collaboration | Nextcloud app APIs; built on Excalidraw | Self-hosted, data-sovereign whiteboarding inside an existing file-server deployment |
| **CryptPad** | XWiki SAS (**France**) | Web, self-host (Docker) | AGPL-3.0-or-later, free | **unverified** (browser-based; offline behaviour not checked) | Self-hostable; API surface unverified | End-to-end encryption where "the server never needs to see" username or password; includes a Whiteboard editor alongside Docs/Sheets/Kanban/Forms |
| **Logseq** | Logseq (entity unverified) | Desktop, mobile | AGPL-3.0, free | **Yes** — local Markdown/Org-mode files | Plugin API | Local plain-text outliner; **caution**: DB version is beta and the repo itself warns "data loss is possible" |
| **Kinopio** | kinopio-club / pketh | Web | **unverified** | **Yes** — localStorage + IndexedDB, "queued API operations that sync when connectivity returns" | Backend API + WebSocket; **imports and exports JSON Canvas** | Idiosyncratic, playful spatial thinking; a rare non-open-source app that adopted an open interchange format |
| **Heptabase** | Heptabase (entity unverified) | Desktop, web, mobile | **unverified** | **unverified** | **unverified**; export produces `All-Data.json` | Card-and-whiteboard research workflow; whiteboards nest and cards are reusable across boards |
| **MURAL** | MURAL (entity unverified) | Web, desktop, mobile | **unverified** | **unverified** | Yes — public API client with OAuth 2.0, plus an embed SDK (`mural-canvas`) and picker components | Facilitated workshops; a supported path to **embed a mural inside a third-party application** |

### Seed products that could not be verified at all in this session

Listed for completeness, with the specific check each one needs. **Nothing in this block should
be treated as evidence.**

| Product | What is needed to verify |
|---|---|
| **Milanote** | Open `milanote.com/pricing` — the free tier is understood to be capped by item count rather than board count, which would be a distinctive limit worth recording; confirm the exact cap and its wording. |
| **Apple Freeform** | No public source, no API, no file-format documentation reachable. Needs Apple's support pages; expect closed format and iCloud-only sync. |
| **Whimsical** | Pricing page and API/export documentation. |
| **Muse** | Vendor site; check whether the iPad/Mac app still ships, its sync model, and its export formats. |
| **Scrintal** | Pricing page; export format (does it emit Markdown? JSON Canvas?). |
| **Kosmik** | Pricing page; whether the canvas is local-first; export formats. |
| **Craft** | Pricing page; whether Craft has a canvas surface at all or only documents + a "spaces" model. |
| **Conceptboard** (German vendor, GDPR/EU hosting positioning) | Not verifiable here; GitHub search returned HTTP 429. Needs `conceptboard.com` — this is the most important gap for the German market question in the brief. |
| **Collaboard** (Swiss vendor, on-premises option) | Same — needs the vendor site. |
| **Klaxoon**, **Stormboard**, **Ideaflip**, **OrgPad**, **Charkoal**, **Flowchart Fun**, **hi-canvas** | The last five are named in the JSON Canvas apps list (FACT, see Standards below) but their vendors, countries and pricing were not verifiable. |

> **German/European market note.** The brief asks specifically for European and German vendors.
> What was verifiable: **CryptPad is French** (XWiki SAS, quoted verbatim from the repo);
> **Anytype is a Swiss association** (quoted verbatim); **draw.io is developed by draw.io Ltd and
> draw.io AG** (an AG being a German- or Swiss-style stock corporation — INFERENCE on country);
> **Nextcloud** is a well-known self-hosting vendor whose whiteboard is AGPL and runs entirely on
> the customer's own server, which is the property German public-sector and Mittelstand buyers
> actually shop for. The named German commercial whiteboards (Conceptboard, Collaboard as
> Swiss, TaskCards) could **not** be verified and are flagged as gaps, not reported as findings.

---

## Deep dives

### 1. Excalidraw — the format everyone can read

**What it does.** An infinite canvas with a deliberately hand-drawn visual style. Shapes,
arrows, freedraw strokes, text, images, frames and embeds. The hosted app at excalidraw.com adds
real-time collaboration with end-to-end encryption; the npm package does not.

FACT — from the README (read 2026-08-29): the feature list includes "Infinite, canvas-based
whiteboard", "End-to-end encryption", "Local-first support (autosaves to the browser)", "PWA
support (works offline)", "Export to PNG, SVG & clipboard", "Open format - export drawings as
an `.excalidraw` json file", and "Arrow-binding & labeled arrows".

**Data model.** This is the part worth studying, because it is unusually clean.

The file is a single JSON object with six top-level keys
([json-schema.mdx](https://github.com/excalidraw/excalidraw/blob/master/dev-docs/docs/codebase/json-schema.mdx)):

| Key | Meaning |
|---|---|
| `type` | `"excalidraw"` |
| `version` | schema version number |
| `source` | originating app URL |
| `elements` | array of element objects |
| `appState` | editor state (e.g. `gridSize`, `viewBackgroundColor`) |
| `files` | image blobs keyed by file id, each with `mimeType`, `id`, `dataURL`, `created`, `lastRetrieved` |

The element union is
`ExcalidrawGenericElement | ExcalidrawTextElement | ExcalidrawLinearElement | ExcalidrawArrowElement | ExcalidrawFreeDrawElement | ExcalidrawImageElement | ExcalidrawFrameElement | ExcalidrawMagicFrameElement | ExcalidrawIframeElement | ExcalidrawEmbeddableElement`
(FACT, `packages/element/src/types.ts` line 206ff, cloned 2026-08-29).

Five fields on the shared element base carry most of the modelling power:

- `groupIds: readonly GroupId[]` — multi-level grouping.
- `frameId: string | null` — frame membership (frames are the "region" primitive).
- `boundElements: readonly BoundElement[] | null` — **the binding index**: how a labelled arrow
  knows it is attached to a rectangle, and how a text element knows it lives inside a container.
- `link: string | null` — every element can carry a hyperlink, including a link to *another
  element in the same scene*.
- `customData?: Record<string, any>` — **an explicitly sanctioned, per-element extension slot**.
- `index: FractionalIndex` (via `Ordered<T>`) — z-order is stored as a fractional index string,
  not an array position.

That last point deserves emphasis. Fractional indexing means two clients can insert an element
between the same pair of neighbours without a coordination round-trip and without renumbering
every sibling — the standard trick for making ordering CRDT-friendly. Excalidraw and tldraw both
do it; it is the segment's quiet consensus.

**Element links.** `packages/element/src/elementLink.ts` builds a deep link by taking the
current URL and setting a query parameter (`ELEMENT_LINK_KEY`) to the element id, and supports
linking to either a single element or a whole selected group
(`getLinkIdAndTypeFromSelection` returns `{ id, type: "element" | "group" }`). So "link to this
specific box on this specific board" is a first-class, URL-shaped operation.

**Frames have an ordering contract.** From `dev-docs/docs/codebase/frames.mdx`: frame children
must appear *before* the frame element itself in the `elements` array. "If not ordered
correctly, the editor will still function, but the elements may not be rendered and clipped
correctly. Further, the renderer relies on this ordering for performance optimizations." This
is a real interoperability trap for anyone generating `.excalidraw` files programmatically.

**Embedding is allow-listed, not general.** `packages/element/src/embeddable.ts` contains
hardcoded regular expressions for the accepted embed providers: YouTube, Vimeo, Figma, GitHub
Gist, Microsoft Forms, Twitter/X, Val Town, Giphy, Reddit, plus a generic
`<iframe>`/`<blockquote>` parser. INFERENCE: you cannot embed an arbitrary internal web
application (a rack elevation viewer, say) without either using the generic iframe path or
patching the list.

**Integrations.** `mermaid-to-excalidraw` converts Mermaid diagram syntax into Excalidraw
elements — a documented package in the same monorepo. That is the segment's most useful
text→canvas bridge.

**Notable strengths.**
- The format is genuinely trivial to read and write. A 12-line sample file is comprehensible at
  a glance. This is why it became the substrate for other products (Nextcloud Whiteboard is
  "Built on Excalidraw", FACT from that repo's README).
- MIT licence with no production restriction — the opposite of tldraw's model.
- `customData` on every element is a sanctioned way to attach domain metadata (e.g. a device id,
  a cable type) without forking the schema.

**Notable limits.**
- **Collaboration is not in the package.** From the package FAQ: "Does this package support
  collaboration? **No**, Excalidraw package doesn't come with collaboration built in, since the
  implementation is specific to each host app." Anyone embedding Excalidraw and wanting
  multi-user editing builds the transport, the presence, and the conflict handling themselves.
- **The renderer has no spatial index.** Open issue
  [#10512](https://github.com/excalidraw/excalidraw/issues/10512) (opened 2025-12-14, still
  open on 2026-08-29) states that `Renderer.getRenderableElements` "retrieves all scene elements
  and then filters for visibility", giving "**O(N) complexity** regardless of visible elements",
  and that "for scenes with thousands of elements, this causes noticeable lag during pan and
  zoom operations, even when only a small subset of elements is visible."
- Corroborating user report: issue
  [#7280](https://github.com/excalidraw/excalidraw/issues/7280) "Excalidraw Performance Degraded
  with Large Drawings" (opened 2023-11-14, labelled `performance`, still open) reports "significant
  lag" at **5000+ elements**, with no maintainer response recorded on the thread.
- Text rendering breaks under Brave's aggressive anti-fingerprinting because `measureText` is
  neutered (documented in the package FAQ) — a reminder that DOM/Canvas text measurement is a
  fragile dependency for any canvas app.

---

### 2. tldraw — the best-engineered canvas, on the least free licence

**What it does.** A React SDK for building infinite-canvas applications, and the engine behind
tldraw.com. Pressure-sensitive drawing, geometric shapes, rich text, arrows, snapping, and
multiplayer via `@tldraw/sync`. Adopted, per the README, by Google, Shopify, BlackRock and
Autodesk. The docs tree in the repo shows releases through **v5.3.0**.

**The licence is the headline, and it is not open source.** FACT, from
`apps/docs/content/community/license.mdx` (read 2026-08-29):

- "Under its default terms, the tldraw SDK license permits use **only in development**."
- Production requires one of three keys: a **trial licence** (free, 100 days, one per commercial
  unit, and during the trial "the SDK collects information about where it is used"); a
  **commercial licence** (request a form, then "our sales team will be in touch to learn about
  your requirements and discuss pricing" — i.e. **requires sales contact**, not advertised); or a
  **hobby licence** for non-commercial projects, under which "the 'made with tldraw' watermark
  must be shown on the canvas."
- "License keys are validated **on the client**. You can use them offline. They can be public.
  The tldraw SDK will not work in production without a valid license key."
- On open source, explicitly: "any source code or packages covered by the tldraw SDK license
  would not be **Open Source** by any definition." Downstream users of an open-source project
  that bundles tldraw "will require their own trial, commercial, or hobby license."
- Data collection: under a commercial or hobby licence "no information is sent to tldraw"; under
  a trial licence the SDK "will ping tldraw's servers with a hash of the license key".

For a project like the AV Planner Suite — offline-first, desktop, shipped to customers — the
combination of client-side key validation and offline operation is technically compatible, but
the licence is a per-deployment commercial commitment that a GPL/MIT-shaped codebase cannot
absorb without a conscious decision.

**Data model.** Records in a reactive store: shapes, bindings, pages, assets, plus per-user
instance state.

- **Bindings are a separate record type**, not a field on the arrow. `TLBaseBinding` is
  `{ id, typeName: 'binding', type, fromId: TLShapeId, toId: TLShapeId, props, meta }`
  (FACT, `sdk-features/bindings.mdx`). The editor "maintains an index of all bindings touching
  each shape", and "the bindings index is a computed value that updates incrementally as
  bindings change. Lookups are fast and never scan all records."
- The lifecycle guarantees are the interesting part, and they are exactly the guarantees a
  cable-planning tool needs: "When a shape is deleted, all its bindings are removed"; "When
  shapes are copied, only bindings between copied shapes are duplicated"; "When shapes are moved
  to different pages, cross-page bindings are automatically removed"; "When both bound shapes are
  copied or duplicated together, the binding is copied with them."
- Bindings are **directional** (`fromId` is the arrow, `toId` is the target), and a
  `BindingUtil` receives `onAfterChangeFromShape` / `onAfterChangeToShape` callbacks so the
  dependent geometry updates when either end moves.
- Arrow binding props store "the normalized anchor point on the target shape and whether the
  attachment is 'precise' or should snap to the shape's edge" — i.e. the segment has already
  solved "connect to a specific point on a device" versus "connect to the device generally".

**Persistence.** Three tiers, documented in `docs/persistence.mdx`:
1. `persistenceKey` prop — automatic IndexedDB save of document *and uploaded assets*, with
   cross-tab sync. "Two editors with the same key share the same document and stay synchronized."
2. `getSnapshot` / `loadSnapshot` — JSON snapshots, explicitly split into `document` (shapes,
   pages, bindings — "you typically save to a server") and `session` (camera, selection, UI
   state — "you keep per-user locally"). **That split is a design idea worth stealing outright.**
3. The raw store, plus a documented migration system for old data.

**Sync.** `@tldraw/sync` is self-hosted for production ("We offer a hosted demo … To use tldraw
sync in production, you will need to host it yourself"). The reference deployment uses
Cloudflare Durable Objects (one WebSocket server per room, room state persisted to the Durable
Object's built-in SQLite) plus R2 for binary assets. Storage backends are pluggable:
`InMemorySyncStorage` (data lost on restart unless you wire an `onChange` callback) and
`SQLiteSyncStorage` (recommended).

Offline behaviour is explicit: "The connection status reflects the WebSocket connection state.
**When offline, changes are queued locally and sync when the connection resumes.**"

Presence is explicit too: "By default, [presence] includes cursor position, selected shapes, and
viewport bounds", customisable via `getUserPresence`. There is a `user-following` feature
(follow another user's viewport) and cursor chat.

A hard operational warning from `docs/sync.mdx`: "You must make sure that the tldraw version in
your client matches the version on the server. We don't guarantee server backwards compatibility
forever… in which case tldraw will display a 'please refresh the page' message." For a desktop
app that customers update on their own schedule, that is a real constraint.

**Performance — the most valuable single document in this segment.** `sdk-features/performance.mdx`
(dated 2026-01-31) and `sdk-features/culling.mdx` document the techniques and, crucially, the
numbers:

| Option | Default | Meaning |
|---|---|---|
| `maxShapesPerPage` | **4000** | Hard ceiling; exceeding it emits a `max-shapes` event and the operation is refused |
| `maxPages` | **40** | Set to 1 to remove multi-page UI entirely |
| `maxFilesAtOnce` | **100** | Files accepted in a single drop |
| `debouncedZoomThreshold` | **500** | Shape count above which zoom values are frozen during camera movement |
| `textShadowLod` | **0.35** | Zoom level below which text shadows are disabled |
| `maxPointsPerShape` (draw) | **600** | Points before a freehand stroke is split into a new shape |

The techniques:
- **Viewport culling via a spatial index.** "The editor maintains a spatial index that tracks
  which shapes are visible, and hides off-screen shapes by setting `display: none`… a canvas
  with 10,000 shapes might only render 50 if the rest are out of view." Culled shapes "stay in
  the store, so they can still be selected, hit-tested, and exported." Selected and
  currently-edited shapes are never culled — a small, humane detail.
- **Reactive signals instead of React state.** "When a shape's props change, only that shape's
  component re-renders — not the entire canvas."
- **Batched store updates**, with `editor.run(() => {...})` to coalesce multi-call operations
  into a single notification.
- **Debounced zoom.** `getEfficientZoomLevel()` returns a *stable* value during camera movement
  once the document exceeds 500 shapes, so stroke-width recalculation does not run every frame.
- **Geometry caching**, invalidated only on prop change.
- **Level of detail.** Images are re-requested at a `steppedScreenScale` (the on-screen/native
  ratio rounded up to the nearest power of two) — "A 4000px-wide photo zoomed out to take up
  200px on screen has a screen scale of 0.05, which steps up to 0.0625, so you'd serve a
  250px-wide image". Sticky notes drop box shadows at low zoom; dashed freehand strokes render
  solid; hatch fills fall back to solid colour.
- **Built-in telemetry.** `editor.performance.on('interaction-end', …)` yields aggregated frame
  time statistics (`fps`, `p95FrameTime`) "with no overhead when no listeners are attached".

**Notable strengths.** It is the only product in the segment that publishes its performance
budget as configuration with defaults, ships a binding system with documented lifecycle
guarantees, and documents its offline queueing behaviour. If you are building a canvas, this
documentation is the reference implementation of the *thinking*, independent of whether you use
the code.

**Notable limits.** The licence (production key required; not open source; commercial price
behind sales). Client/server version lockstep for sync. Self-hosting is mandatory for production
multiplayer. The 4000-shape default ceiling is raiseable but its existence tells you where the
engineering comfort zone ends.

---

### 3. Obsidian Canvas and JSON Canvas — the interchange play

**What it does.** Obsidian Canvas is a canvas view over a local vault. Its distinguishing
property is not the editor; it is that a canvas is **a plain `.canvas` JSON file sitting in the
same folder as your Markdown notes**, and that its nodes can be *the notes themselves*.

**The format — JSON Canvas 1.0, in full.** FACT, from
[spec/1.0.md](https://raw.githubusercontent.com/obsidianmd/jsoncanvas/main/spec/1.0.md)
(read 2026-08-29). Both top-level arrays are optional:

```
{ "nodes": [...], "edges": [...] }
```

Every node requires `id` (string), `type` (string), `x`, `y`, `width`, `height` (integers), and
may carry `color`. Four node types:

| `type` | Required | Optional |
|---|---|---|
| `text` | `text` — plain text with Markdown syntax | — |
| `file` | `file` — a path within the system | `subpath` — a heading or block reference starting with `#` |
| `link` | `url` | — |
| `group` | — | `label`, `background` (image path), `backgroundStyle` (`cover` \| `ratio` \| `repeat`) |

Edges require `id`, `fromNode`, `toNode`, and may carry `fromSide`/`toSide`
(`top`\|`right`\|`bottom`\|`left`), `fromEnd`/`toEnd` (`none`\|`arrow`; `fromEnd` defaults to
`none`, `toEnd` defaults to `arrow`), `color`, and `label`.

Colour is the `canvasColor` type: either a hex string (`"#FF0000"`) or one of six preset numbers
— `"1"` red, `"2"` orange, `"3"` yellow, `"4"` green, `"5"` cyan, `"6"` purple.

The whole specification is about two pages long. That is the point.

**Why it matters.** Two properties make it the segment's only real interchange format:

1. **The `file` node with a `subpath`.** A canvas node can point at a document *and at a heading
   or block inside it*. So the canvas is a **view over a corpus**, not a container that swallows
   content. Deleting the canvas does not delete the notes.
2. **Forward-compatible extension.** Obsidian's own `canvas.d.ts` declares
   `[key: string]: any` on `CanvasData`, `CanvasNodeData` and `CanvasEdgeData`, each annotated
   "Support arbitrary keys for forward compatibility". Vendors can add fields without breaking
   other readers.

**Adoption — the honest count.** The spec repo's own
[docs/apps.md](https://github.com/obsidianmd/jsoncanvas/blob/main/docs/apps.md) lists seven apps
(Obsidian, Kinopio, Flowchart Fun, hi-canvas, OrgPad, Charkoal, Ideaflip), of which two
(Obsidian, Charkoal) use it as *storage* and the rest only import/export. It lists one converter
*into* the format (from Heptabase) and two *out of* it (Mermaid, Property Graph Exchange Format),
plus libraries for Dart, Go, Python, React, Ruby, Rust, TypeScript and Vue.

INFERENCE: that is meaningful traction for a two-year-old format and simultaneously an admission
of its ceiling — **no enterprise whiteboard (Miro, Mural, FigJam) is on the list.** JSON Canvas
is the lingua franca of the personal-canvas sub-market and is absent from the enterprise one.

**The critical limitation for developers.** Obsidian's published API typings ship
`canvas.d.ts` — but it contains **only data interfaces** (`CanvasData`, `CanvasNodeData`,
`CanvasFileData`, `CanvasTextData`, `CanvasLinkData`, `CanvasGroupData`, `CanvasEdgeData`, plus
`CanvasColor`, `NodeSide`, `EdgeEnd`, `BackgroundStyle`). A grep for "canvas" across the 8,498
lines of `obsidian.d.ts` returns **zero matches** (verified by clone, 2026-08-29).

FACT: the public Obsidian plugin API exposes the canvas *file format* and not the canvas *view*.
INFERENCE: a plugin can read and rewrite `.canvas` files on disk, but has no supported way to
drive the open canvas editor — add a node to the live view, hook selection, or render a custom
node type. Every "canvas plugin" therefore either manipulates files behind the editor's back or
reaches into undocumented internals. This is the single largest developer-experience gap in the
otherwise most open product in the segment.

**Limits of the format itself.** No node type for a table. No embedded task or checkbox
semantics. No z-order field (draw order is array order — INFERENCE). No per-node arbitrary
metadata *in the spec* (though `[key: string]: any` permits it in practice). Edges attach to a
*side* of a node, not to a named port or anchor — so "SDI OUT 3 of the switcher" cannot be
expressed; only "the right-hand side of this box" can. For a signal-flow tool that is a decisive
shortfall.

---

### 4. Miro — the enterprise API surface, read from its own OpenAPI document

Miro's pricing page was unreachable, but something better was: the **OpenAPI 3.0.1 specification**
that Miro publishes to generate its own client libraries, at
`packages/generator/spec.json` in [miroapp/api-clients](https://github.com/miroapp/api-clients)
(cloned 2026-08-29). Title: "Miro Developer Platform v2.0". **114 documented paths.**

**Board content model, as exposed by the API.** Each of these is a first-class REST resource
under `/v2/boards/{board_id}/`:

`app_cards`, `cards`, `connectors`, `documents`, `embeds`, `frames`, `groups`, `images`,
`items`, `shapes`, `sticky_notes`, `tags`, `texts` — plus `members` (board-level sharing) and a
bulk endpoint. Under `/v2-experimental/boards/{board_id}/`: `mindmap_nodes` and `code_widgets`.

Two observations that matter:

- **Mind maps are still `v2-experimental` in 2026.** The brief asks about mindmaps; Miro's
  mindmap node type has not been promoted to the stable API.
- **There is no table resource.** Miro renders tables in the UI (INFERENCE from general
  knowledge — unverified), but the API has no `tables` endpoint. Tables are not addressable
  programmatically.

**The connector model is genuinely good.** `ConnectorCreationData` requires `startItem` and
`endItem` (with the constraint, stated in the schema description, that "startItem.id must be
different from endItem.id"), and accepts:

- `shape`: `straight` | `elbowed` | `curved` (default `curved`)
- `captions`: up to **20** caption blocks per connector, each with `content` (max **200**
  characters, "Supports inline HTML tags"), a `position` expressed as a percentage along the
  line ("With 50% value, the text will be placed in the middle"), and `textAlignVertical`
  (`top`/`middle`/`bottom`)
- `style.startStrokeCap` / `style.endStrokeCap`, from a 17-value enum that includes
  `none`, `stealth`, `rounded_stealth`, `diamond`, `filled_diamond`, `oval`, `filled_oval`,
  `arrow`, `triangle`, `filled_triangle`, and the **entity-relationship caps** `erd_one`,
  `erd_many`, `erd_only_one`, `erd_zero_or_one`, `erd_one_or_many`, `erd_zero_or_many`
- `style.fontSize` for captions, 10–288 dp, default 14

Multiple labels at controllable positions along one connector is exactly the primitive a cable
diagram needs (cable number at one end, length in the middle, connector type at the other).

**Shape vocabulary.** `ShapeData.shape` is an enum of 21 values: `rectangle`,
`round_rectangle`, `circle`, `triangle`, `rhombus`, `parallelogram`, `trapezoid`, `pentagon`,
`hexagon`, `octagon`, `wedge_round_rectangle_callout`, `star`, `flow_chart_predefined_process`,
`cloud`, `cross`, `can`, `right_arrow`, `left_arrow`, `left_right_arrow`, `left_brace`,
`right_brace`. Style covers `borderColor`, `borderOpacity` (0.0–1.0), `borderStyle`
(`normal`/`dotted`/`dashed`), `borderWidth` (1–24 dp), text `color`, and a `fillColor` drawn
from a documented palette.

**Rate limiting is a credit economy, not a request count.** FACT, quoted from the spec's own
endpoint descriptions: create operations are "Level 2 … of 100 credits each", so "if you want to
create one sticky note, one card, and one shape item in one call, the rate limiting applicable
will be 300 credits"; Level 1 operations cost 50 credits each, so adding 10 users and removing 5
"will be 750 credits". Levels 1–4 exist. Reads are Level 1, deletes Level 3, some
administrative operations Level 4.

**Bulk creation is capped at 20 items per call**, twice over: "You can add up to 20 items of the
same or different type per create call", and for file uploads "Array of items to create (PDFs,
images, etc.). Maximum of 20 items." The bulk operation "is transactional" — if any item fails,
INFERENCE: the whole batch is rejected.

INFERENCE, and it is a sharp one: **populating a Miro board from an external system of record is
expensive by design.** A 500-item rack-and-cable diagram costs 25 bulk calls and 50,000 credits
at Level 2. Miro's API is built for integration and automation, not for bulk mirroring.

**The enterprise wall.** Many endpoints carry the marker "This API is available only for
**Enterprise plan** users. You can only use this endpoint if you have the role of a Company
Admin", with a link to a Typeform for temporary access. A further set is gated behind an
**Enterprise Guard add-on**: eDiscovery cases, legal holds, content-item export, AI interaction
logs. Also Enterprise-only or admin-only: data classification settings (org, team and board
level), audit logs, SCIM (`/Users`, `/Groups`, `/Schemas`, `/ServiceProviderConfig`), and
`/v2/orgs/{org_id}/boards/export/jobs` — the org-wide board export machinery, with sub-resources
for job status, tasks and per-task export links.

**Export/lock-in reading.** FACT: bulk board export exists but lives at organisation level,
requires the Enterprise plan and a Company Admin role, and runs as an asynchronous job. INFERENCE:
for anyone below Enterprise, getting all your boards out of Miro programmatically is not a
supported operation — you export board by board through the UI. That is the clearest lock-in
mechanic verified anywhere in this segment.

**One more fact with a date on it.** The repository states: "The Miro API client libraries in
this repository are being retired. **No new versions of these clients will be published after
November 1, 2026.**" Miro directs integrators to generate their own clients from the OpenAPI
spec. INFERENCE: the spec is now the contract and the SDKs are not — which is good for anyone
generating a client, and a maintenance surprise for anyone who pinned `@mirohq/miro-api`.

---

### 5. AFFiNE / BlockSuite — the document-and-canvas merge, done properly

**What it does.** AFFiNE describes itself as "an open-source, all-in-one workspace" and "a
better alternative to Notion and Miro" (FACT, README, read 2026-08-29). Its distinguishing claim
is that the *same* content exists as a document ("page mode") and on an infinite canvas
("edgeless mode"): "put any building block on an edgeless canvas — rich text, sticky notes, any
embedded web pages, multi-view databases, linked pages, shapes and even slides."

**Licence.** MIT, held by "TOEVERYTHING PTE. LTD. and its affiliates (2022-present)", with
carve-outs: `packages/backend` and `packages/common/native` are governed by a separate licence
at `packages/backend/server/LICENSE`. FACT, from the LICENSE file. INFERENCE: "PTE. LTD."
is a Singapore private-limited suffix, so the vendor is Singaporean.

**Data model — BlockSuite.** The editor framework underneath ([toeverything/blocksuite](https://github.com/toeverything/blocksuite),
MPL-2.0) is the interesting artefact. FACT, from its README: "It is natively built on the CRDT
library **Yjs**, powering all BlockSuite documents with built-in real-time collaboration and
time-travel capabilities." Content is a **block tree** with pluggable "flavours" (custom blocks
and inline embeds). Persistence is via "block snapshot and transformer", which also provides
"compatibility with various third-party formats (such as markdown and HTML)". Synchronisation is
described as a "document streaming" mechanism supporting "even decentralized data
synchronization".

INFERENCE, and it is the key architectural insight of this dossier: **AFFiNE does not have a
canvas feature bolted onto a document editor. It has one CRDT block tree with two renderers.**
That is why its canvas can contain a live database view and its document can contain a shape —
they are the same records. Every product that instead built a separate "whiteboard" module
(Logseq, Notion, most of the PKM field) ends up with a canvas that cannot see the rest of the
workspace's data.

**Offline.** Claimed: "local-first", "you always own your data on your disk, in spite of the
cloud", with "real-time sync and collaborations on web and cross-platform clients". Self-hosting
is supported via Docker, Render and Sealos, with "freedom to manage, self-host, fork and build
your own AFFiNE". FACT as claims; not tested here.

**Notable limits — from their own issue tracker.** Three open issues on 2026-08-29:
- [#14333](https://github.com/toeverything/AFFiNE/issues/14333) "[Feature Request]: Improve
  performance in edgeless mode for larger documents" (opened 2026-01-28, labelled `story`)
- [#14585](https://github.com/toeverything/AFFiNE/issues/14585) "[Bug]: Page Mode loading and
  editing lag scale with number of embedded frames" (opened 2026-03-06)
- [#13793](https://github.com/toeverything/AFFiNE/issues/13793) "[Feature Request]: Improve the
  rendering files speed, on web interface and application for AFFiNE" (opened 2025-10-22)

INFERENCE: the unified-block-tree design buys enormous expressive power and pays for it in
rendering cost. A block tree is not a spatial index; tldraw's culling architecture has no obvious
analogue in a Yjs document tree without a separate index alongside it.

---

### 6. Nextcloud Whiteboard and CryptPad — the self-hosted, data-sovereign end

These two matter to a German/European reading of the segment more than any commercial vendor
that could not be verified.

**Nextcloud Whiteboard** ([nextcloud/whiteboard](https://github.com/nextcloud/whiteboard),
AGPL-3.0, read 2026-08-29):

- "Built on **Excalidraw**" — so the data model and file format are Excalidraw's, inheriting
  both its openness and its O(N) renderer.
- Architecture is client-first: "All whiteboard functionality works directly in the browser",
  "Changes are immediately saved to browser storage (**IndexedDB**)".
- **The websocket server is optional for single-user work**: "basic whiteboard functionality
  works without it". Real-time collaboration needs it, and "User browsers need HTTP(S) access to
  the websocket server", with a shared JWT secret between Nextcloud and the websocket service.
- It publishes an honest capacity table — a rarity in this segment:

| Concurrent users | CPU | Memory (RSS) | Server egress | Recommended |
|---|---|---|---|---|
| 50 | ~10% (~0.21%/user) | ~0.24 GB | ~23.5 MB | 2 vCPU / 1 GB RAM |
| 100 | ~20% (~0.20%/user) | ~0.36 GB | ~96.6 MB | 4 vCPU / 2 GB RAM |
| 500 | ~203% (2 cores) | ~3.6–4.5 GB | ~9.2 GB | ≥8 vCPU / ≥8 GB + Redis + 2+ nodes |

  with the verbatim finding that the "500-user test saturated a single instance and dropped
  ~30% of simulated clients", and the recommendation of "multiple websocket workers behind a
  sticky load balancer". Session recording additionally requires "a headless Chromium browser
  and ffmpeg".

**CryptPad** ([cryptpad/cryptpad](https://github.com/cryptpad/cryptpad), AGPL-3.0-or-later,
read 2026-08-29):

- Developed by **XWiki SAS, a French company** building open-source software since 2004 —
  the clearest verified European vendor in this dossier.
- The suite includes a **Whiteboard** editor alongside Document, Sheet, Presentation, Form,
  Kanban, Code and Rich Text.
- Encryption model, verbatim: data is encrypted in the browser before transmission; "User
  registration and account access are based on cryptographic keys that are derived from your
  username and password. Hence, **the server never needs to see either**."
- Self-hosting via documented production install and official AMD64/ARM64 Docker images.

INFERENCE: for a German public-sector, broadcaster or Mittelstand buyer with a GDPR/BSI
posture, the realistic shortlist in this segment is not "Miro vs Mural" but "Nextcloud Whiteboard
vs CryptPad vs Conceptboard/Collaboard" — and the first two are free, self-hosted and verified,
while the last two could not be checked here and remain the top research gap.

---

## Standards & protocols

The segment's honest summary: **one real interchange format, one de-facto CRDT wire protocol, a
handful of vendor-proprietary JSON dialects, and rasterised images as the universal fallback.**

### File / interchange formats

| Format | Extension | Owner | Licence | Status |
|---|---|---|---|---|
| **JSON Canvas 1.0** | `.canvas` | Obsidian | MIT | The only cross-vendor open canvas format. 7 apps + 8 language libraries listed (FACT, `docs/apps.md`). Absent from all enterprise whiteboards. |
| **Excalidraw scene** | `.excalidraw` | Excalidraw | MIT (code) | De-facto standard for the drawing sub-market. `{type, version, source, elements, appState, files}`. Also a clipboard dialect, `excalidraw/clipboard`. |
| **Excalidraw library** | `.excalidrawlib` | Excalidraw | MIT | Reusable shape libraries (`ExportedLibraryData` / `ImportedLibraryData` in `data/types.ts`). A genuine "component library" pattern. |
| **tldraw snapshot** | `.tldr` / JSON | tldraw | tldraw licence | `getSnapshot()` yields `{ document, session }`. Documented migration system. Version lockstep required for sync. |
| **mxGraph XML / drawio** | `.drawio`, `.xml`, XML-in-PNG, XML-in-SVG | draw.io Ltd | Apache 2.0 | The oldest and most widely embedded diagram format; XML can be embedded inside the exported PNG/SVG so the raster *is* the source file. |
| **Heptabase `All-Data.json`** | `.json` | Heptabase | proprietary | Structure observed indirectly (see below). |
| **Miro board JSON** | — | Miro | proprietary | Not published as a file format; reachable only through the REST API or Enterprise export jobs. |
| **PNG / SVG / PDF** | — | — | — | The universal export floor. Lossy: geometry survives, structure and links do not. |

**Heptabase's export shape, observed indirectly.** The third-party converter
[link-ding/Heptabase-Export](https://github.com/link-ding/Heptabase-Export) reads a file the
README calls "your `All-Data.json` file … in your Heptabase export folder" and, in `app.py`,
indexes into these top-level keys: `cardList`, `whiteBoardList`, `cardInstances`, `connections`,
`sections`. Cards have `id`, `title`, `isTrashed`; card instances carry `whiteboardId`, `x`, `y`;
connections carry `whiteboardId`; sections carry `whiteboardId`. Inline card embedding uses the
syntax `{{card <uuid>}}`, matched by the regex
`{{card\s([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})}}`.

Two structural points follow. First, Heptabase separates **cards** from **card instances** —
one card can appear on several whiteboards, which JSON Canvas cannot express (a JSON Canvas node
*is* its placement). Second, the tool dates from December 2022, so the schema may have changed;
treat it as evidence of shape, not of current truth. FACT for the file contents; the currency of
the schema is UNKNOWN.

### Wire protocols and collaboration substrate

**Yjs is the segment's de-facto collaboration protocol.** FACT, from
[yjs/yjs](https://github.com/yjs/yjs) (MIT, read 2026-08-29):

- Shared types: `Y.Array`, `Y.Map`, `Y.Text`, `Y.XmlFragment`, `Y.XmlElement`.
- Connection providers: `y-websocket` (with `y-redis` and Hocuspocus backends), `y-webrtc`
  (peer-to-peer with signalling servers), plus managed services (Liveblocks, Velt, SuperViz,
  PartyKit, pluv.io).
- Persistence providers: `y-indexeddb` in the browser; `y-mongodb-provider`, `y-postgresql`,
  `y-fire` on the server.
- Offline: with `y-indexeddb`, "The document is immediately available and only diffs need to be
  synced through the network provider."
- The algorithm uses "lamport timestamps and state vectors for efficient syncing".
- Adopters named in the README include AFFiNE, Cargo, Gitbook, Evernote, Linear, JupyterLab and
  ProtonMail.

**"Awareness" is the presence protocol.** Yjs providers manage "awareness information" — the
ephemeral, non-persisted channel that carries cursors, selections and viewport. It is separate
from the document CRDT, which is why leaving a session does not leave a tombstone in the
document. tldraw implements the same split independently: presence "includes cursor position,
selected shapes, and viewport bounds" and is customisable per user.

**tldraw sync** is a distinct protocol from Yjs: a WebSocket per room with server-side room
state (`TLSocketRoom`), pluggable storage, a 20-second default `clientTimeout`, and explicit
support for serverless hibernation (`onSessionSnapshot` fires "when a session has had no message
activity for about 5 seconds"; `handleSocketResume` restores a session "straight into
`Connected` state" when the object wakes).

**Automerge** exists as the other general-purpose CRDT family (not opened this session —
UNKNOWN beyond its existence; would need `github.com/automerge/automerge`).

**Anytype's `any-sync`** is a third, distinct stack: "Zero-knowledge encryption powered by
any-sync", "optional peer-to-peer sync", with a gRPC API. FACT from the repo README.

### Ordering: fractional indexing

Not a named standard, but a convergent convention worth recording. Excalidraw stores z-order as
`index: FractionalIndex` on `Ordered<ExcalidrawElement>` (`packages/element/src/fractionalIndex.ts`
exists in the tree); tldraw documents `shape-indexing` as a first-class SDK feature. Both replace
"position in an array" with "a sortable string between two neighbours", which is what makes
reordering conflict-free under concurrent edits.

### What is conspicuously absent

- **No canvas equivalent of GDTF/MVR, AAF or NMOS.** There is no industry body, no versioned
  interoperability suite, no conformance test. JSON Canvas is one vendor's good idea that others
  adopted, and it stops at the enterprise boundary.
- **No standard for ports/anchors.** JSON Canvas edges attach to a *side*. Miro connectors attach
  to an item with a position. tldraw bindings store a normalised anchor plus a `precise` flag.
  Excalidraw uses `boundElements` with focus/gap. Four products, four incompatible models of
  "where exactly does this line connect" — and none of them names the connection point.
- **No standard for presence.** Yjs awareness is the closest thing, and it is a library
  convention, not a specification.
- **No standard for comments/annotations** across products.

---

## What this segment does WELL — the patterns worth stealing

These are the transferable engineering and design ideas, each anchored to a verified source.

**1. Culling with a spatial index, and never culling what the user is touching.**
tldraw maintains a spatial index and sets `display: none` on off-screen shapes — "a canvas with
10,000 shapes might only render 50". Culled shapes "stay in the store, so they can still be
selected, hit-tested, and exported", and "Selected shapes and the shape being edited are never
culled." The negative example proves the point: Excalidraw lacks the index, does a full scene
traversal per viewport update, and has an open issue saying so.

**2. Splitting document state from session state at the persistence boundary.**
tldraw's snapshot is `{ document, session }`: the document (shapes, pages, bindings) goes to the
server; the session (camera, selection, UI state) stays per-user and local. This one distinction
prevents an entire class of bug — the one where opening a shared project yanks everyone's
viewport to wherever the last person was looking.

**3. Level of detail keyed to on-screen size, not zoom level.**
tldraw's `steppedScreenScale` is the ratio of a shape's on-screen size to its native size,
rounded up to the nearest power of two, so a 4000px image shown at 200px requests a 250px
variant. Rounding to powers of two is what stops the asset request from thrashing during a zoom
gesture. Alongside it: freeze the zoom value during camera movement once the document exceeds
`debouncedZoomThreshold` (default 500 shapes), and progressively drop shadows, dash patterns and
hatch fills below a zoom threshold.

**4. Bindings as first-class records with lifecycle guarantees.**
A tldraw binding is its own record with `fromId`/`toId` and an incrementally maintained index
("Lookups are fast and never scan all records"). The guarantees are what make it usable:
deleting a shape removes its bindings; copying two bound shapes copies the binding; copying only
one does not; moving a shape to another page removes cross-page bindings. Any tool where "a line
connects two things" is a domain concept should copy this record shape and these four rules
verbatim.

**5. A sanctioned per-element extension slot.**
`customData?: Record<string, any>` on every Excalidraw element; `meta: JsonObject` on every
tldraw binding and shape; `[key: string]: any` "for forward compatibility" on every JSON Canvas
node and edge. Three independent products reached the same conclusion: leave a labelled hole for
someone else's domain data, or they will abuse a field you meant for something else.

**6. Fractional indexing for z-order.**
Insert between two neighbours without renumbering siblings and without a coordination
round-trip. Adopted independently by Excalidraw and tldraw.

**7. Deep links to a specific object, expressed as a URL.**
Excalidraw sets an element-id query parameter and supports linking to an element *or* a group.
tldraw's `deepLinks: true` "serialize[s] editor state into URL-safe strings … individual shapes,
viewport positions, or entire pages". "Send me the link to that box" is a workflow, not a nicety.

**8. Offline queueing stated as a contract, not a hope.**
tldraw: "When offline, changes are queued locally and sync when the connection resumes."
Kinopio: "queued API operations that sync when connectivity returns." Nextcloud Whiteboard:
"basic whiteboard functionality works without" the websocket server. Yjs + `y-indexeddb`: "The
document is immediately available and only diffs need to be synced." The pattern is uniform —
local store is authoritative for the session, the network is a synchroniser.

**9. Presence as an ephemeral channel separate from the document.**
Yjs "awareness"; tldraw's `getUserPresence` carrying cursor, selection and viewport bounds; plus
follow-the-leader viewport following and cursor chat. Presence must never enter the persisted
document, or every abandoned session leaves litter.

**10. Publishing your performance budget as configuration.**
tldraw documents `maxShapesPerPage: 4000`, `maxPages: 40`, `maxFilesAtOnce: 100`,
`debouncedZoomThreshold: 500`, `textShadowLod: 0.35`, and emits a `max-shapes` event when the
ceiling is hit. Nextcloud Whiteboard publishes a load-test table admitting a single instance
drops ~30% of clients at 500 concurrent users. Both are more useful than any marketing claim
about "infinite" canvases, and both build trust.

**11. Multiple positioned labels on one connector.**
Miro allows up to 20 captions per connector, each positioned as a percentage along the line with
vertical alignment. Excalidraw ships "labeled arrows". Wherever a line means something in the
domain, it needs more than one label.

**12. A canvas node that *references* a document rather than containing it.**
JSON Canvas `file` nodes with an optional `subpath` pointing at a heading or block. The canvas
becomes a view over a corpus; deleting the board does not destroy the content.

**13. Air-gapped operation as an explicit product promise.**
draw.io Desktop: "designed to be completely isolated from the Internet, apart from the update
process", "No diagram data is ever sent externally", a CSP that "forbids remotely-loaded
JavaScript and restricts the application's own network connections to itself", and
`DRAWIO_DISABLE_UPDATE=true` to kill even that. For broadcast, this is not a niche — it is the
site network policy.

**14. Text→canvas generation as an import path.**
`mermaid-to-excalidraw` turns Mermaid syntax into editable Excalidraw elements. Generating a
first-draft diagram from structured data and then letting a human arrange it is far more
tractable than perfect automatic layout.

---

## What NOBODY in this segment solves well — the white space

**1. Ports. Nobody has them.**
This is the single largest gap for technical use. Every product connects *shape to shape*:
JSON Canvas edges attach to a side (`top`/`right`/`bottom`/`left`); Miro connectors take a
`startItem`/`endItem` with a position; tldraw bindings store a normalised anchor and a `precise`
flag; Excalidraw uses `boundElements`. **None of them has a named, typed, enumerable connection
point.** You cannot say "SDI OUT 3", you cannot say "this port is 12G-SDI and that one is
HDMI 2.0, so this connection is invalid", and you cannot ask "which ports on this device are
still free". Every technical discipline that uses these tools — AV, network, electrical,
process — reinvents ports as text inside a sticky note.

**2. The canvas has no idea what its objects *are*.**
A rectangle is a rectangle. There is no type system, no schema, no validation, and therefore no
computation. You cannot total the cable lengths on a board, check that every camera has a return
feed, or flag a device drawn twice. Miro's `app_cards` and tldraw's custom shapes are the two
extension points that could support this, and both require you to build the entire domain layer
yourself. INFERENCE: this is precisely the gap that a domain-specific planner exists to fill,
and it is structural — a general canvas cannot close it without ceasing to be general.

**3. Big boards are still slow, and everybody admits it in their own tracker.**
Excalidraw: O(N) scene traversal per viewport update (#10512, open), lag reported at 5000+
elements (#7280, open since 2023). AFFiNE: three open performance issues on edgeless mode and
embedded frames. tldraw: solved it best, and still ships a 4000-shape default ceiling. Nextcloud
Whiteboard: a single instance drops ~30% of clients at 500 concurrent users. Nobody has a canvas
that is genuinely indifferent to document size.

**4. Export is lossy in the direction that matters.**
Everyone exports PNG, SVG and PDF — geometry survives, structure dies. Structural export
(the actual JSON) is fine in the open products and constrained in the commercial ones. Miro's
bulk export is an **Enterprise-plan, Company-Admin, asynchronous job**; below that tier there is
no supported programmatic path to get all your boards out. And structural export is only half
the problem: with no cross-vendor format above JSON Canvas, exported structure is only readable
by the tool that wrote it.

**5. JSON Canvas stops at the enterprise boundary.**
Seven apps, two of which use it as storage, none of them Miro, Mural or FigJam. The format that
solves interchange is adopted only by products that were already open. INFERENCE: interchange
formats are adopted by vendors whose moat is not the data — which is exactly the set of vendors
who did not need a moat.

**6. Tables are second-class or absent.**
FigJam has a real `TableNode` with `numRows`, `numColumns`, `cellAt(row, col)`, `insertRow`,
`insertColumn`, `removeRow`, `removeColumn` — the only proper table API found in this session.
Miro's REST API has **no** table resource at all. JSON Canvas has no table node type. Yet
technical planning is half tabular (device lists, cable schedules, IP plans) and half spatial,
and the two halves do not share a data structure in any product here.

**7. Tasks on a canvas are decoration.**
Nothing verified in this session models a task with an assignee, a due date, a status and a
dependency as a canvas-native object that also appears in a list or a calendar. AFFiNE's
"multi-view databases on an edgeless canvas" is the nearest claim, and it is a claim, not a
verified capability.

**8. Mindmaps are neglected.**
Miro's `mindmap_nodes` is still under `/v2-experimental/` in 2026. JSON Canvas has no
hierarchical node type — a mind map is expressed as ordinary nodes and edges, losing the tree.

**9. Offline is either total or absent, never negotiated.**
The open products are local-first (IndexedDB, local files). The enterprise products are
cloud-first with unverified offline behaviour. What nobody offers is the middle case a
production actually lives in: **an authoritative local copy that syncs opportunistically over a
flaky venue network, with a comprehensible merge story and a visible sync state**. tldraw's
queue-and-resume is the closest verified mechanism, and it depends on a server you must host and
keep in version lockstep with every client.

**10. Version lockstep between client and server is an unsolved operational problem.**
tldraw states it outright: mismatched versions produce a "please refresh the page" message, and
"the backend [must be] updated at the same time as the client". For a browser app that is
awkward; for an installed desktop app updated on the customer's schedule it is a design
constraint that pushes you toward CRDTs with forward-compatible schemas.

**11. Presence stops at the cursor.**
Cursor, selection, viewport. Nothing verified conveys *what a person is doing* — editing which
field, holding which lock, responsible for which region. On a live production board, "who owns
this section right now" matters more than where their arrow is.

**12. No canvas speaks any industry vocabulary.**
No product here imports GDTF/MVR, AAF, NMOS IS-04, a Videohub routing table, or an ATEM
configuration. The canvas is always downstream of the real data and always manually maintained,
which is exactly why it drifts out of date and why people stop trusting it.

---

## Relevance to AV Planner Suite

Ranked by how directly this segment's verified findings should change what gets built.

### cable-planner — HIGH, and directly actionable

cable-planner is already a canvas application: ReactFlow 11 with custom nodes and edges, a
Zustand `projectStore` composed of 15 slices as the single source of truth, `projectHistory`
with a 100-entry undo stack and 200ms coalescing, CRDT sync, and atomic writes. It sits squarely
in sub-market 4 and competes with nothing here — but it should borrow from all of it.

**Borrow immediately:**

1. **The `{ document, session }` persistence split** (tldraw). Map onto the existing
   architecture: `projectStore` is `document` and goes into the project file and into CRDT sync;
   `uiStore` (viewport, panels, editor defaults, device colours) is `session` and stays local
   per user. The CLAUDE.md invariant "`uiStore` — **Keine** Projekt-Daten" already draws this
   line; tldraw's docs are the evidence that the line is load-bearing and not merely tidy. When
   collaborative editing is on, a colleague opening the project must not move your viewport.
2. **Viewport culling with a spatial index.** ReactFlow has `onlyRenderVisibleElements`, but
   tldraw's refinements are the ones that make it pleasant: never cull the selected node or the
   node being edited, and keep culled items fully selectable, hit-testable and exportable.
   Test against a realistic worst case — a multi-camera OB with several hundred devices and a
   thousand-plus cables.
3. **A published performance budget.** Pick and document the cable-planner equivalents of
   `maxShapesPerPage` (4000) and `debouncedZoomThreshold` (500), emit an event when a ceiling is
   hit, and write the numbers into `docs/architecture.md`. Both tldraw and Nextcloud gain
   credibility from publishing limits; vague "handles large projects" claims gain none.
4. **Level of detail below a zoom threshold.** Device nodes that render full port lists, labels
   and colour coding when close, and a filled rectangle with a name when far. Key the switch to
   *on-screen size* (`width * zoom < 50px`), not to the zoom level alone, and freeze the zoom
   value during camera movement above the shape threshold so the transition does not thrash.
5. **Binding lifecycle rules, adopted verbatim.** A cable is a binding between two ports. Copy
   the four tldraw guarantees: delete a device → its cables are removed with an isolation
   callback; copy two connected devices → the cable is copied; copy only one → it is not; move a
   device to another sheet → cross-sheet cables are removed or explicitly re-anchored. These are
   the exact bugs a signal-flow editor generates, and there is a documented answer.
6. **Multiple positioned labels per edge** (Miro: up to 20 captions, positioned by percentage
   along the line, with vertical alignment). A cable edge wants cable number near the source,
   length at the middle, connector type near the destination. One label per edge is not enough.
7. **Fractional indexing for ordering**, if any ordered list in the project is edited
   concurrently. Both Excalidraw and tldraw converged on it precisely because array positions do
   not merge.
8. **Deep links to a node.** A URL or an app-internal link that opens the project at a specific
   device or cable. Excalidraw's model — link to an element *or* to a group — is the right
   granularity for "look at this rack" as well as "look at this device".
9. **`customData` on every domain object.** Already partly present via `healProjectPositions` as
   the migration layer; an explicit, documented extension slot on nodes and edges lets
   integrations (Rentman, NetBox) attach identifiers without schema churn.

**The strategic opening — ports.** The white space above is unusually clean: **no product in
this segment has typed, named connection points.** cable-planner's entire reason to exist is
that a cable runs from *SDI OUT 3* to *SDI IN 1*, that the signal types must match, and that a
port is either free or occupied. This is not a feature to add — it is the moat, and this
research says nobody else is anywhere near it. It should be stated that way in positioning:
not "a nicer whiteboard for AV", but "the canvas that knows what a port is".

**The second opening — computation over the canvas.** Total cable lengths, power draw, unused
ports, devices without a return feed, duplicated device names. `src/renderer/lib/` is already the
home for exactly this. No general canvas can do it, because none of them has a type system.

**On interchange and lock-in.** cable-planner already speaks GraphML (`graphml:*` IPC). Two
cheap additions with real value:
- **JSON Canvas export** (`.canvas`, MIT, ~2 pages of spec, node types `text`/`file`/`link`/
  `group`, edges with `fromSide`/`toSide`/`label`/`color`). It is lossy for ports — but it is
  the format the personal-canvas world reads, and shipping it is a concrete "we do not lock you
  in" claim, backed by an open spec rather than a promise.
- **`.excalidraw` export** for hand-off to non-technical stakeholders, using `customData` on
  each element to preserve device and cable identifiers for a round trip.
Import in the other direction is more valuable still: JSON Canvas or Excalidraw as a *sketch
import* path, so a producer's rough whiteboard becomes a starting layout.

**On offline and sync.** cable-planner is offline-first with CRDT sync and a signaling relay —
which puts it, verified against this segment, ahead of every commercial product here on the axis
that matters for a venue with bad Wi-Fi. Two lessons to internalise: keep presence in a separate
ephemeral channel that never touches the persisted project (Yjs awareness, tldraw
`getUserPresence`); and take tldraw's client/server version-lockstep warning seriously, because
a desktop app updated on the customer's schedule *will* have version skew, so the sync schema
must tolerate forward-compatible unknown fields exactly as JSON Canvas's `[key: string]: any`
does.

### multicam-planner — HIGH

Camera positions, sight lines and coverage are inherently spatial; the canvas patterns transfer
almost unchanged. Specifically: culling and LOD for venue-scale plans, the document/session
split so a camera plan opened by a colleague does not move your view, binding lifecycle for
"camera → position → feed" relationships, and the same port-typing insight applied to
camera outputs and CCU assignments. Cross-repo consistency matters more than novelty here: if
cable-planner and multicam-planner disagree about what a link is, the suite has two data models.

### light-planner — HIGH

Same spatial argument, plus one distinction this segment lacks entirely and lighting already
has: **GDTF/MVR are real, versioned, industry interchange standards with a governing body.**
Nothing in the visual-workspace segment has an equivalent. That asymmetry is worth exploiting —
light-planner can offer genuine interchange with the rest of the lighting toolchain, which no
whiteboard can, while borrowing the canvas segment's rendering discipline (culling, LOD,
published limits) for large rigs.

### shell / suite — MEDIUM-HIGH

Two ideas at suite level:

1. **A cross-tool canvas as a view, not a container.** JSON Canvas's `file` node with a
   `subpath` is the model: a production overview board whose nodes *reference* the cable plan,
   the camera plan and the lighting plan rather than copying them. AFFiNE's architecture is the
   deeper version of the same lesson — one data model, two renderers, rather than a separate
   whiteboard module that cannot see the workspace's data. A suite-level board that duplicates
   project data will drift within a week; one that references it cannot.
2. **A shared canvas kernel across the three planners.** Culling, LOD, snapping, deep links,
   presence, the document/session split and the binding lifecycle should exist once. Note the
   licence constraint discovered here: adopting tldraw for this would require a per-deployment
   commercial licence with pricing behind a sales conversation, and would make the SDK
   non-open-source inside the suite; Excalidraw (MIT) and ReactFlow carry no such condition.
   That is a decision to take deliberately, not by drifting into a dependency.

### broadcast-intercom — LOW-MEDIUM

Intercom panel and party-line assignment is a bipartite mapping, better served by a matrix than
by a free canvas. Two transferable items: the presence/awareness split (who is on which key
right now is ephemeral state, not document state), and multi-label edges if a routing view is
ever drawn.

### tally-pi, sony-camera-bridge, pi-media-station — LOW

These are runtime/device projects with no canvas surface. The only relevant transfer is the
offline-first discipline this segment demonstrates, and draw.io Desktop's air-gap posture as a
model for how to describe a device that must not phone home: "completely isolated from the
Internet, apart from the update process", a CSP restricting the app's own network connections,
and an environment variable to disable even update checks. That is precisely the assurance a
broadcast IT department asks for, and it is worth copying the *wording* as well as the
behaviour.

---

## Open questions and the checks that would answer them

Recorded so the next research pass can close them rather than re-derive them.

| Question | The check |
|---|---|
| Every commercial price in this segment | Open the `/pricing` page of Miro, Mural, FigJam/Figma, Notion, Milanote, Whimsical, Heptabase, Craft, Scrintal, Kosmik, Muse, Obsidian. Record plan name, amount, currency, period, date seen, and whether advertised or sales-gated. |
| The German-market shortlist | `conceptboard.com` and `collaboard.app` — vendor entity, hosting location, on-premises option, GDPR/BSI claims, price. This is the largest single gap. |
| Miro's rate-limit tiers in numbers | `developers.miro.com/reference/rate-limiting#rate-limit-tiers` — the credit costs per level are quoted in the OpenAPI spec, but the per-minute credit *budget* is not. |
| Miro's board item ceiling | Miro help centre — is there a documented maximum number of objects per board? |
| Whether Notion has a real canvas | Unverified here. Notion's API exposes blocks, data sources and views; whether a spatial canvas surface exists and is API-addressable was not established. |
| Apple Freeform's format and sync | Apple support documentation; expect a closed format and iCloud-only sync, but verify. |
| Heptabase's current export schema | Heptabase's own export documentation; the schema recorded here comes from a third-party tool dated December 2022. |
| Whether Obsidian has since shipped a canvas editor API | `docs.obsidian.md` plugin API reference and the developers-API forum category. As of the typings read on 2026-08-29, it had not. |
| tldraw commercial licence pricing | `tldraw.dev/pricing` — the licence document points there and says startup pricing "may be available". |
| Automerge as a Yjs alternative | `github.com/automerge/automerge` — reachable in this session's network policy; simply not opened for time. |

---

## Sources

Every URL below was actually opened during this session on 2026-08-29. Repositories marked
`(cloned)` were fetched with `git clone` and read from disk; the specific files read are named.

**Specifications and file formats**
1. https://github.com/obsidianmd/jsoncanvas — JSON Canvas repository overview
2. https://raw.githubusercontent.com/obsidianmd/jsoncanvas/main/spec/1.0.md — JSON Canvas 1.0 specification (full text)
3. https://github.com/obsidianmd/jsoncanvas (cloned) — `readme.md`, `docs/apps.md`, `spec/1.0.md`, `sample.canvas`
4. https://github.com/obsidianmd/obsidian-api (cloned) — `canvas.d.ts`, `obsidian.d.ts` (8,498 lines, zero "canvas" matches), `README.md`

**Excalidraw**
5. https://github.com/excalidraw/excalidraw — repository overview
6. https://github.com/excalidraw/excalidraw/blob/master/README.md — feature list, E2EE, local-first, PWA offline claims
7. https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/data/types.ts — `ExportedDataState`, library data types
8. https://github.com/excalidraw/excalidraw (cloned, sparse) — `dev-docs/docs/codebase/json-schema.mdx`, `dev-docs/docs/codebase/frames.mdx`, `dev-docs/docs/@excalidraw/excalidraw/faq.mdx`, `dev-docs/docs/@excalidraw/excalidraw/api/utils/export.mdx`, `packages/element/src/types.ts`, `packages/element/src/elementLink.ts`, `packages/element/src/embeddable.ts`
9. https://github.com/excalidraw/excalidraw/issues?q=is%3Aissue+performance+large+number+of+elements — performance issue listing
10. https://github.com/excalidraw/excalidraw/issues/7280 — "Excalidraw Performance Degraded with Large Drawings" (5000+ elements)
11. https://github.com/excalidraw/excalidraw/issues/10512 — "Renderer performance degrades due to full scene traversal on viewport updates"

**tldraw**
12. https://github.com/tldraw/tldraw — repository overview, licence model, sync summary
13. https://github.com/tldraw/tldraw/blob/main/LICENSE.md — licence terms
14. https://github.com/tldraw/tldraw (cloned, sparse `apps/docs/content`) — `community/license.mdx`, `docs/sync.mdx`, `docs/persistence.mdx`, `sdk-features/performance.mdx`, `sdk-features/culling.mdx`, `sdk-features/collaboration.mdx`, `sdk-features/cursors.mdx`, `sdk-features/bindings.mdx`, `sdk-features/deep-links.mdx`, `sdk-features/options.mdx`, `sdk-features/pages.mdx`, `sdk-features/events.mdx`, `sdk-features/assets.mdx`, `sdk-features/default-shapes.mdx`

**Miro**
15. https://github.com/orgs/miroapp/repositories — organisation repository listing
16. https://github.com/miroapp/api-clients — client retirement notice (no new versions after 2026-11-01)
17. https://github.com/miroapp/api-clients (cloned) — `packages/generator/spec.json`, the "Miro Developer Platform v2.0" OpenAPI 3.0.1 document: 114 paths, item resources, `ConnectorCreationData`, `ConnectorStyle`, `Caption`, `ShapeData`, `ShapeStyle`, rate-limit credit levels, Enterprise/Enterprise Guard gating, bulk 20-item limits

**Figma / FigJam**
18. https://github.com/figma/plugin-typings (cloned) — `plugin-api.d.ts`: `StickyNode`, `StampNode`, `TableNode`, `TableCellNode`, `HighlightNode`, `WashiTapeNode`, `ShapeWithTextNode`, `CodeBlockNode`, `ConnectorNode`, `WidgetNode`, `SectionNode`, `ConnectorEndpoint`, `ConnectorStrokeCap`

**Notion**
19. https://github.com/makenotion/notion-sdk-js — API versions 2025-09-03 / 2026-03-11, resources, retry behaviour

**AFFiNE / BlockSuite**
20. https://github.com/toeverything/AFFiNE — positioning, local-first claims, edgeless canvas, self-hosting
21. https://github.com/toeverything/AFFiNE/blob/canary/LICENSE — MIT, TOEVERYTHING PTE. LTD., backend carve-out
22. https://github.com/toeverything/AFFiNE/issues?q=is%3Aissue+edgeless+performance+lag — issues #14333, #14585, #13793
23. https://github.com/toeverything/blocksuite — Yjs-native block model, MPL-2.0, snapshot/transformer

**Self-hosted / European / open source**
24. https://github.com/nextcloud/whiteboard — AGPL-3.0, Excalidraw-based, IndexedDB client-first, benchmark table
25. https://github.com/nextcloud/whiteboard/blob/main/README.md — architecture quotes, capacity table, 500-user saturation finding
26. https://github.com/cryptpad/cryptpad — XWiki SAS (France), AGPL-3.0-or-later, whiteboard app, encryption model
27. https://github.com/jgraph/drawio — Apache 2.0, draw.io Ltd / draw.io AG, no real-time collaboration in this version
28. https://github.com/jgraph/drawio-desktop — air-gap/offline guarantees, CSP, `DRAWIO_DISABLE_UPDATE`
29. https://github.com/anyproto/anytype-ts — "Any — a Swiss association", Any Source Available License 1.0, offline-first, any-sync, gRPC
30. https://github.com/logseq/logseq — AGPL-3.0, Markdown/Org-mode, DB-version beta data-loss warning
31. https://github.com/kinopio-club/kinopio-client — Vue/Pinia, localStorage + IndexedDB, queued offline API operations

**Collaboration substrate**
32. https://github.com/yjs/yjs — MIT, shared types, connection and persistence providers, awareness, adopters

**Other products**
33. https://github.com/link-ding/Heptabase-Export — Heptabase `All-Data.json` structure (`cardList`, `whiteBoardList`, `cardInstances`, `connections`, `sections`), `{{card <uuid>}}` embed syntax; tool dated December 2022
34. https://github.com/link-ding/Heptabase-Export (cloned) — `app.py`, `README.md`
35. https://github.com/orgs/muraldevkit/repositories — MURAL developer organisation listing
36. https://github.com/muraldevkit/mural-integrations-sdk — `mural-picker`, `mural-canvas` (embed), `mural-client` (OAuth 2.0), `mural-account-chooser`

**Attempted and blocked by the egress proxy (not opened, listed for transparency)**
`milanote.com/pricing`, `www.excalidraw.com`, `docs.excalidraw.com`, `www.notion.com/pricing`,
`miro.com/pricing`, `developers.miro.com/docs`, `miroapp.github.io`, `obsidian.md/canvas`,
`tldraw.dev/pricing`, `en.wikipedia.org`, `www.npmjs.com`.
`github.com/search` returned HTTP 429 (rate limited) on the one search attempted.
