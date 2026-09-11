# Inventory Planner

Das Lager als eigenes Werkzeug: **Bestand**, **Ausgabescheine**, **Sub-Hire** —
mit einer Bedienung für den Lageristen statt eines Dialogs im Kabelplan.

**Source language:** `en`

Die Oberfläche startet auf Englisch — auch auf einem deutschen Rechner. Deutsch
ist die erste Übersetzung und steht in **Einstellungen → Language**; die Wahl
überlebt den Neustart. Fehlt zu einem Schlüssel die Übersetzung, erscheint der
englische Quelltext: das ist die Rückfallebene und kein Fehler. Eine weitere
Sprache ist eine Datei unter `src/i18n/` plus ein Eintrag in `WOERTERBUECHER` —
keine Zeile Logik.

## Warum es dieses Repo gibt

Der Schnitt ist in
[ADR-006 „Der Schnitt"](https://github.com/larszu/av-planner-suite/blob/main/docs/decisions/ADR-006-werkzeug-schnitt.md)
entschieden und begründet. Die Kurzfassung: das Lager führt eigene Stammdaten,
die den Plan überdauern, es bedient jemand anderes als den Plan, es ist ohne
den Kabelgraph vollständig, und seine Verbindung zum Plan lässt sich auf
**wenige benannte Fragen** reduzieren:

| Frage | Wer antwortet |
| --- | --- |
| Deckt der Bestand den Bedarf? | das Lager — auf einen Bedarf, den der Plan rechnet |
| Was steht auf dem Ausgabeschein? | das Lager |
| Ist das Stück fremdes Material? | das Lager |

## Die Grenze zum Plan

**Dieses Repo kennt kein Plan-Modell.** Kein `EquipmentItem`, kein
`CablePlannerProject`, keine eigene Bedarfsrechnung. Der Plan rechnet seinen
Bedarf selbst und reicht `BedarfsZeile[]` herüber
(`src/domain/types/bedarf.ts`).

Das ist keine Stilfrage: ein Lager, das dem Geräte-Modell des Kabelplans folgen
muss, ist kein eigenes Werkzeug, sondern ein Anhängsel mit einer Repo-Grenze
davor. `npm run grenze:check` misst es, und CI führt es aus.

## Befehle

```bash
npm ci          # Installation — siehe Hinweis unten
npm run dev     # Vite, Port 4184 (fest, strictPort)
npm run build   # tsc -b && vite build
npm run lint
npm test        # vitest
npm run grenze:check   # die Grenze zum Plan
npm run lang:check     # Quellsprache (englisch, E-28)

npm run electron:dev   # Desktop-Fassung lokal starten (baut vorher)
npm run dist:win       # Windows: Setup + Portable nach release/
npm run dist:mac       # macOS: je ein DMG fuer Intel und Apple Silicon
```

**Hinweis zur Installation.** Hier stand, `npm install` breche ab. Das ist zu
pauschal, und die Korrektur steht hier statt einer stillen Änderung, weil der
alte Satz jemanden davon abhielt, das Naheliegende zu versuchen: **mit der
committeten `package-lock.json` läuft `npm install` durch** — also im normalen
Fall nach einem `clone`.

Es bricht mit `Cannot read properties of null (reading 'edgesOut')` ab, sobald
npm den Peer-Graph OHNE Lockdatei neu auflösen muss (Lockdatei gelöscht,
frisches Verzeichnis). Das ist ein Fehler im Auflöser, nicht in diesem Projekt;
dann hilft `npm install --legacy-peer-deps`. `npm ci` fasst die Auflösung nie
an und ist deshalb der Weg, den CI geht.

*Gemessen am 2026-09-09 mit npm 10.9.7, in beiden Fällen und in beiden neuen
Repos: mit Lockdatei grün, ohne Lockdatei rot.*

## Drei Wege, dasselbe Werkzeug zu benutzen

| Weg | Wie er entsteht | Wofür |
| --- | --- | --- |
| Desktop (Windows/macOS) | Tag `v*` → `.github/workflows/release.yml` | Der Rechner im Lager: Fensterstart, keine Adresszeile |
| Web-Seite | Push auf `main` → `.github/workflows/pages.yml` | Draufschauen, ohne etwas zu installieren |
| Eingebettet in die Suite | `av-planner-suite` vendoriert dieses Repo | Alle Werkzeuge unter einer Oberfläche |

**Sie teilen ihren Bestand nicht.** Die Ablage ist `localStorage`, und Electron
hält die in seinem eigenen `userData`-Bereich — Desktop-Fassung und
Browser-Fassung sind zwei Lager auf demselben Rechner. Das ist keine Panne,
sondern die Eigenschaft der Ablage; der Weg dazwischen ist der Export
(`avplan-inventory`), nicht die Erwartung, es sei dasselbe Fenster.

**Die Web-Seite ist noch nicht live.** Eine GitHub-Pages-Site kann nur ein
Mensch in den Repo-Einstellungen anlegen (*Settings → Pages → Source:
**GitHub Actions***); der `GITHUB_TOKEN` darf es nicht. Solange sie fehlt, baut
`pages.yml` trotzdem und überspringt nur das Veröffentlichen — mit einer
Warnung am Lauf statt einer roten Spalte auf `main`. Sobald die Freigabe da
ist, veröffentlicht der nächste Push von selbst; an der Datei ist nichts zu
ändern.

**Keine gekaufte Signatur.** Die macOS-Pakete tragen eine Ad-hoc-Signatur, die
Windows-Installer gar keine. Beim ersten Start meldet sich der jeweilige
Wächter des Betriebssystems; das ist erwartet und kein Zeichen eines defekten
Downloads.

## Stand

Erste Fassung. Übernommen ist die Domäne aus
`cable-planner/src/renderer/lager/` — Bestand, Lagerbaum, serialisierte
Einheiten, Ausgabescheine, Schäden, Sub-Hire — plus eine eigene Oberfläche über
den drei Fragen.

**Noch nicht hier:** der Deckungs-Abgleich gegen einen Plan (er braucht den
Bedarf von der anderen Seite), Scannen, Drucken, und der Umzug der
Cable-Planner-Seite auf dieses Repo. Der Cable-Planner behält seine Kopie,
solange das nicht steht — nach ADR-006 wird einzeln geschnitten, mit grünem CI
dazwischen, und der Planer bleibt in jedem Zwischenstand lauffähig.
