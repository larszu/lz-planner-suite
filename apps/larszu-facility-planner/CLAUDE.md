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
npm run lang:check     # Quellsprache (englisch, E-28)

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
- `src/domain/gebaeudeAuskunft.ts` — Auskünfte, die das Werkzeug über seine
  EIGENEN Daten gibt (Schaltherkunft, Trassen, Lagen). Bewusst neben dem
  Vertrag und nicht in ihm: der Plan stellt diese Fragen nicht, und
  `VERTRAG_FRAGEN` bleibt bei sechs.
- `src/ui/` — sieben Sichten. Eine Sicht ruft den Vertrag AUF, statt sich die
  Felder selbst zusammenzusuchen; sonst gäbe es die Auskunft zweimal.
- `src/lib/` — generische Helfer (Speicher-Schlüssel, Grundriss-Massstab).

## Konventionen

- **Quellsprache: `en`** (E-28, entschieden 2026-09-11 vom Eigentümer:
  „Die Standard Sprache muss immer Englisch sein und über i18n muss man auf
  deutsch übersetzen können."). Maschinenlesbar in `package.json` unter
  `avplan.sourceLanguage`, zweite Stelle die README; `lang:check` hält beide
  zusammen. **Hier stand bis dahin `de`.**
- **i18n:** Englisch steht als zweites Argument direkt im JSX —
  `t('bereich.schluessel', 'English text')`. Es gibt **keine `en.ts`**: eine
  englische Wörterbuch-Datei wäre die zweite Wahrheit (ADR-001) und liefe
  beim nächsten Umbau gegen das JSX. Übersetzungen je Sprache in einer
  eigenen Datei unter `src/i18n/` (heute `de.ts`), eingetragen in
  `WOERTERBUECHER` (`src/i18n/index.ts`). **Eine weitere Sprache ist eine
  Datei und ein Eintrag — keine Zeile Logik.**
  Sätze NIE aus mehreren `t()`-Aufrufen zusammensetzen: die Wortstellung
  gehört zur Sprache. Ein Schlüssel, ein ganzer Satz, Platzhalter über
  `format()`.
  **Die Vorgabe ist Englisch und nicht `navigator.language`** — ein deutscher
  Rechner startet englisch, und wer Deutsch will, wählt es einmal in den
  Einstellungen.
  **`t()` immer ausgeschrieben**, nie hinter einem lokalen Helfer: der
  Wächter liest Quelltext, und ein `mit(key, en, name)` machte ihn blind —
  die Schlüssel fielen dann als verwaiste Wörterbuch-Einträge auf, also an
  der falschen Stelle und mit der falschen Begründung.
  Der Vertrag und die Module unter `domain/` nehmen den Übersetzer als
  LETZTEN Parameter mit Vorgabe: `t: Uebersetzen = quelle` aus
  `src/i18n/quelle.ts`. Die Vorgabe liefert die englische Quelle, damit ein
  Test ohne Wörterbuch genau die Rückfallebene misst, die im Betrieb
  erscheint. `quelle.ts` hat **keine Abhängigkeit** — deshalb zieht der
  Vertrag darüber keinen Store mit hoch.
  Beschriftungs-Tabellen gehören in eine **Funktion**, nie in eine
  Modul-Konstante: die wird beim Laden einmal gebaut und bliebe in der
  Sprache stehen, die damals galt.
  **Normbegriffe bleiben, wie sie heissen.** `TN-S`, `RCD Typ B`, `CEE 63`,
  `KNX`, `DALI`, `DGUV V3` sind Namen und keine Beschriftungen; sie zu
  übersetzen hiesse, den Prüfbericht nicht mehr wiederzufinden. Übersetzt
  wird, was das Werkzeug SAGT — nicht, wie die Anlage HEISST.
  Gemessen wird beides: `npm run lang:check` prüft, dass die Quelle englisch
  ist, `uebersetzungVollstaendig.node.test.ts` prüft, dass jeder Schlüssel
  eine deutsche Fassung hat, keine Fassung verwaist ist und die Platzhalter
  beider Seiten übereinstimmen.
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
