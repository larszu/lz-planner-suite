# CLAUDE.md

Anleitung für Claude Code (claude.ai/code) in diesem Repo.

Inventory Planner ist das **Lager** der AV-Planner-Suite als eigenes Werkzeug:
Bestand, Ausgabescheine, Sub-Hire. React 19 + TypeScript + Zustand + Vite,
offline-first, Ablage in `localStorage`.

## Befehle

```bash
npm ci                 # Installation (CI-Weg). `npm install` geht auch — siehe README
npm run dev            # Vite auf 4184 (fest, strictPort)
npm run build          # tsc -b && vite build — MUSS vor jedem Push sauber sein
npm run lint
npm test               # vitest
npm run grenze:check   # die Grenze zum Plan (ADR-006)
npm run lang:check     # Quellsprache

npm run electron:dev   # Desktop-Fassung lokal (Electron, electron/main.cjs)
npm run dist:win       # Windows-Installer nach release/
npm run dist:mac       # macOS-DMGs (x64 + arm64) nach release/
```

**Drei Auslieferungen, eine Codebasis.** Desktop kommt aus
`.github/workflows/release.yml` (Tag `v*`), die Web-Seite aus
`.github/workflows/pages.yml` (Push auf `main`), die eingebettete Fassung aus
der Suite. Der Electron-Hauptprozess bringt bewusst KEINE zusaetzliche
Faehigkeit mit — kein IPC, kein Preload, kein Datei-Zugriff. Wer hier einen
zweiten Schreibweg anlegt, hat zwei Fassungen derselben Sache.

## Die eine Regel, die dieses Repo trägt

**Das Lager kennt kein Plan-Modell.** Kein `EquipmentItem`, kein
`CablePlannerProject`, keine eigene Bedarfsrechnung (`deriveDemand`). Der Plan
rechnet seinen Bedarf selbst und reicht `BedarfsZeile[]` herüber
(`src/domain/types/bedarf.ts`); `seedAusBedarf` ist der einzige Schreibweg vom
Plan hierher.

`scripts/plan-grenze-check.ts` misst das, CI führt es aus. Wer hier ein
Plan-Modell braucht, hat die Grenze an der falschen Stelle gezogen — nicht den
Wächter zu streng. Der Grund steht in
[ADR-006](https://github.com/larszu/av-planner-suite/blob/main/docs/decisions/ADR-006-werkzeug-schnitt.md).

## Aufbau

- `src/domain/types/` — Domänen-Typen (Bestand, Ausgabeschein, Umlagerung) plus
  `bedarf.ts`, die Grenze zum Plan.
- `src/domain/lib/` — reine Funktionen. Rechnen, nie speichern.
- `src/domain/store/` — drei Zustand-Stores, jeder mit eigenem
  `localStorage`-Schlüssel (`src/lib/storageKeys.ts`).
- `src/ui/` — die drei Sichten. Eine Sicht rechnet nicht selbst; sie liest aus
  `domain/lib`.
- `src/lib/` — generische Helfer, die nicht dem Lager gehören (CSV,
  `mergeDefined`, Speicher-Schlüssel).

## Konventionen

- **Quellsprache: `de`.** Maschinenlesbar in `package.json` unter
  `avplan.sourceLanguage`, zweite Stelle die README; `lang:check` hält beide
  zusammen. Englische Beschriftungen brechen die Konvention.
- **Keine Emojis im Code** außer auf ausdrücklichen Wunsch.
- **Nichts erfinden.** Fehlt eine Angabe, fehlt sie — keine Vorgabe, die wie
  eine Messung aussieht. Eine Menge ohne Zählung ist nicht null, ein Stück ohne
  Rückgabedatum ist nicht „fällig", ein Artikel ohne Eigentumsangabe ist nicht
  „uns gehörend" (er gilt als eigenes, und das steht mit Grund in `isForeign`).
- **Portables Format nicht brechen.** `domain/lib/inventoryPortable.ts` trägt
  `avplan-inventory`; dasselbe Format liegt byte-gleich in den Planern. Eine
  Änderung daran ist ein Versionssprung in allen Repos, kein Feld nebenbei.

## Git

- Commit-Prefix nach Conventional Commits, erste Zeile ≤ 72 Zeichen, deutsch
  ist in Ordnung. **Keine Trailer** — keine Session-URL, kein
  `Co-Authored-By`; das macht das git-log unleserlich. Im PR-Body ist der
  Generated-with-Hinweis in Ordnung.
- PR-Titel = Zusammenfassung des PRs, nicht der Branch-Slug.
- **Merge-Berechtigung:** der Eigentümer (larszu) hat dauerhaft erlaubt, PRs
  selbst zu mergen — **nur bei grünem CI**.
