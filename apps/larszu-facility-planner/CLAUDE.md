# CLAUDE.md

Anleitung für Claude Code (claude.ai/code) in diesem Repo.

Facility Planner ist das **Gebäude-Werkzeug** der AV-Planner-Suite:
Anschlusspunkte, Verteilung und Kreise, die benannten Klinken der
Haussteuerung, Mängel. React 19 + TypeScript + Zustand + Vite, offline-first,
Ablage in `localStorage`.

## Befehle

```bash
npm ci                 # Installation (CI-Weg). `npm install` geht auch — siehe README
npm run dev            # Vite auf 4185 (fest, strictPort)
npm run build          # tsc -b && vite build — MUSS vor jedem Push sauber sein
npm run lint
npm test               # vitest + grenze:check + lang:check
npm run grenze:check   # die Grenze zum Show-Plan (ADR-006)
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

## Die zwei Regeln, die dieses Repo tragen

**1. Das Gebäude kennt kein Show-Modell.** Kein `EquipmentItem`, kein
`CablePlannerProject`, und vor allem kein `solveCircuit`: der Schaltbild-Rechner
der Show ist Kern des `cable-planner` (ADR-006, Zeile „Stromplanung der Show").
Ihn hier nachzubauen hiesse, dieselbe Rechnung zweimal zu führen — und ein
Gebäude hat schliesslich auch Schalter, die Versuchung ist also echt.
`scripts/plan-grenze-check.ts` misst es.

**2. Die Tür rechnet nicht selbst.** Was das Gebäude nicht angibt, wird nicht
gerechnet und nicht geraten. `belastbarkeit()` ist die Stelle, an der das
sichtbar wird: `watt: null` mit Grund statt `absicherungA × 230`. Der Nennstrom
ist die Auslöseschwelle des Schutzschalters, nicht die zulässige Dauerlast —
und eine hier gerechnete Zahl sähe im Plan aus wie eine Auskunft des Hauses.

Daraus folgt die Form, die alle sechs Vertragsfragen teilen: **„nicht
angegeben" ist nicht „nein".** `{ bekannt: false, grund }` statt einer leeren
Liste, `undefined` statt `false`.

## Aufbau

- `src/domain/modell.ts` — die Typen. Wer hier ein Feld ergänzt, das keine der
  sechs Fragen beantwortet, hat das Werkzeug angefangen und nicht den Vertrag.
- `src/domain/vertrag.ts` — die sechs Fragen und der eine Rückweg, rein.
- `src/domain/store/` — die einzige Stelle, die schreibt. Ein Mangel geht
  **durch** `mangelMelden` und nicht daran vorbei: der Vertrag darf ihn
  ablehnen.
- `src/ui/` — vier Sichten. Eine Sicht ruft den Vertrag AUF, statt sich die
  Felder selbst zusammenzusuchen; sonst gäbe es die Auskunft zweimal.
- `src/lib/` — generische Helfer (Speicher-Schlüssel).

## Konventionen

- **Quellsprache: `de`.** Maschinenlesbar in `package.json` unter
  `avplan.sourceLanguage`, zweite Stelle die README; `lang:check` hält beide
  zusammen.
- **Keine Emojis im Code** außer auf ausdrücklichen Wunsch.
- **Der Abgleich gegen ADR-006 lebt in der Suite**, nicht hier: dort liegen ADR
  und Code im selben Baum. Eine Abschrift der sechs Namen in diesem Repo wäre
  die zweite Wahrheit (ADR-001) und driftete lautlos.

## Git

- Commit-Prefix nach Conventional Commits, erste Zeile ≤ 72 Zeichen, deutsch
  ist in Ordnung. **Keine Trailer** — keine Session-URL, kein
  `Co-Authored-By`. Im PR-Body ist der Generated-with-Hinweis in Ordnung.
- PR-Titel = Zusammenfassung des PRs, nicht der Branch-Slug.
- **Merge-Berechtigung:** der Eigentümer (larszu) hat dauerhaft erlaubt, PRs
  selbst zu mergen — **nur bei grünem CI**.
