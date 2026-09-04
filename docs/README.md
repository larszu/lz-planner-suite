# Dokumentation — Übersicht

Inhaltsverzeichnis für `docs/`. Diese Seite existiert, weil am 2026-09-04
gemessen wurde, dass **keines** der 67 Dokumente in diesem Ordner von einer
Einstiegsseite aus verlinkt war — auch nicht die beiden Dokumente, auf denen die
gesamte laufende Arbeit steht, und auch nicht die fünf ADRs. Der Rechercheteil
hatte mit [`research/README.md`](research/README.md) sogar ein sehr gutes eigenes
Inhaltsverzeichnis; es verlinkte nur niemand.

`npm run docs:reachable` hält das jetzt fest und läuft in CI.

## Laufende Arbeit

| Dokument | Was es ist |
| --- | --- |
| [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) | Was in den acht Repos tatsächlich läuft — nach Ausführung belegt, nicht nach Plan. Enthält die Ausführungs-Nachweise (Exit-Codes echter Läufe) und den Stand je Bereich. |
| [`IMPLEMENTATION_BACKLOG.md`](IMPLEMENTATION_BACKLOG.md) | Die offenen Punkte mit Befund, Begründung und Aufwand — plus der Abschnitt „Nicht zu entscheiden ohne den Eigentümer". |

## Architektur-Entscheidungen (ADR)

Jede ADR hält eine Entscheidung samt Befund fest, der sie ausgelöst hat.

- [`ADR-001 — Identitäts-Rückgrat`](decisions/ADR-001-identity-spine.md)
- [`ADR-002 — Geräte-Identität zwischen Plan und Lager`](decisions/ADR-002-device-identity-plan-and-stock.md)
- [`ADR-003 — Bestätigter Zustand`](decisions/ADR-003-confirmed-state.md)
- [`ADR-004 — Dokument-Stempel`](decisions/ADR-004-document-stamp.md)
- [`ADR-005 — Verlustfrei oder laut`](decisions/ADR-005-lossless-or-loud.md)

## Markt- und Nutzer-Recherche

Der Korpus hat ein eigenes, ausführliches Inhaltsverzeichnis:

**→ [`research/README.md`](research/README.md)** — rund 21.000 Zeilen über 16
Marktsegmente, 11 Berufe, die Produktionskette und die acht bestehenden Repos.
Einstieg über [`research/METHOD.md`](research/METHOD.md): dort stehen die
Quellen-Rubrik, die Häufigkeitsstufen jeder Aussage und — wichtig — welche
Quellen in der Umgebung *nicht* erreichbar waren.

Die Repo-Bestandsaufnahme innerhalb des Korpus ist auch für die Entwicklung
relevant:

- [`research/repos/INVENTORY.md`](research/repos/INVENTORY.md) — was die acht
  Repos können, aus dem Quelltext gelesen statt aus den READMEs.
- [`research/repos/DRIFT-REPORT.md`](research/repos/DRIFT-REPORT.md) — die
  gemessene Divergenz zwischen den vendorierten `apps/`-Kopien und den
  Einzel-Repos. **Erzeugt mit `npm run drift:report`**; die maßgeblichen Zahlen
  stehen in `scripts/planner-drift-baseline.json`.
- [`research/repos/CONSOLIDATION-PLAN.md`](research/repos/CONSOLIDATION-PLAN.md)
  — der Stufenplan, mit dem die Divergenz abgebaut wurde.
- [`research/repos/MULTICAM-I18N-ORPHANS.md`](research/repos/MULTICAM-I18N-ORPHANS.md)
  — verwaiste Übersetzungsschlüssel in `multicam-planner`.
