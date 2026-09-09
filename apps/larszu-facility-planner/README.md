# Facility Planner

Das **Gebäude** als eigenes Werkzeug: Anschlusspunkte, Verteilung und Kreise,
die benannten Klinken der Haussteuerung — und der eine Rückweg für Mängel.

**Source language:** `de`

## Warum es dieses Repo gibt

Der Schnitt ist in
[ADR-006 „Der Schnitt"](https://github.com/larszu/av-planner-suite/blob/main/docs/decisions/ADR-006-werkzeug-schnitt.md)
entschieden und begründet, die Issues sind
[cable-planner#665](https://github.com/larszu/cable-planner/issues/665) und
[cable-planner#667](https://github.com/larszu/cable-planner/issues/667).

Ein Gebäude hat einen anderen Lebenszyklus als eine Show: es steht Jahre, es
wird von wechselnden Leuten gepflegt, und es gehört dem Betreiber. Der
Prüfstein aus dem ADR trennt beides sauber:

> *Wird das am Abbautag wieder eingepackt?* Ja → Show-Plan. Nein → hierher.

Schaltschrank, UP-/AP-Dose, fest verlegte Leitung, Bus-Systeme: hierher.
Mehrfachsteckdose, Verteiler, Powerlock-Satz, die Wechselschaltung im Aufbau:
bleiben im `cable-planner`. **`cable-planner#666` zieht deshalb nicht um** —
die Schaltungslogik der Show ist dort gebaut und gehört dorthin.

## Der Vertrag: sechs Fragen, ein Rückweg

`src/domain/vertrag.ts` ist die ausführbare Fassung des ADR-Abschnitts
„Der Vertrag ‚Festinstallation'".

| Frage | wofür |
| --- | --- |
| `einspeisung(punktId)` | Anschlussart, Netzform, Absicherung, RCD-Typ, Dauerleistung |
| `ort(objektId)` | Raum/Etage nach dem Bezeichner **des Hauses** |
| `kreisGeschwister(punktId)` | was am selben RCD hängt |
| `verfuegbarkeit(punktId)` | frei / belegt / geschaltet / gedimmt |
| `steuerklinken()` | KNX/DALI/Crestron: nur die benannten Klinken, nicht das Bus-Modell |
| `hausStrecke(planKabelId)` | gehört diese Strecke dem Haus? |

Der eine Rückweg ist `mangelMelden(hausObjektId, befund)`. Eine Show ändert das
Haus nicht, sie benutzt es; die Ausnahme ist die Aussage eines Menschen über
einen Defekt.

**Die Tür rechnet nicht selbst.** `belastbarkeit()` gibt `watt: null` mit Grund
zurück, wenn das Gebäude keine Dauerleistung angibt. `absicherungA × 230` wäre
die naheliegendste Zeile und die gefährlichste: der Nennstrom ist die
Auslöseschwelle des Schutzschalters, nicht die zulässige Dauerlast.

## Die Grenze zum Show-Plan

**Dieses Repo kennt kein Show-Modell.** Kein `EquipmentItem`, kein
`CablePlannerProject`, und vor allem kein `solveCircuit` — der Schaltbild-Rechner
der Show gehört dem Planer, und ihn hier nachzubauen hiesse, dieselbe Rechnung
zweimal zu führen. `npm run grenze:check` misst das, CI führt es aus.

## Befehle

```bash
npm ci          # Installation — siehe Hinweis unten
npm run dev     # Vite, Port 4185 (fest, strictPort)
npm run build   # tsc -b && vite build
npm run lint
npm test        # vitest + Grenze zum Show-Plan + Quellsprache

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
| Desktop (Windows/macOS) | Tag `v*` → `.github/workflows/release.yml` | Die Aufnahme im Haus, ohne Browser mit der richtigen Adresse |
| Web-Seite | Push auf `main` → `.github/workflows/pages.yml` | Draufschauen, ohne etwas zu installieren |
| Eingebettet in die Suite | `av-planner-suite` vendoriert dieses Repo | Alle Werkzeuge unter einer Oberfläche |

**Sie teilen ihre Aufnahme nicht.** Die Ablage ist `localStorage`, und Electron
hält die in seinem eigenen `userData`-Bereich — Desktop-Fassung und
Browser-Fassung sind zwei Aufnahmen auf demselben Rechner. Das ist keine Panne,
sondern die Eigenschaft der Ablage.

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

Erste Fassung: das Modell (Raum, Anschlusspunkt, Stromkreis, Verteilung,
Steuerklinke, Hausstrecke, Mangel), der Vertrag als reine Funktionen, ein
Speicher und vier Sichten darüber.

**Noch nicht hier:** der Grundriss, Prüfprotokolle nach Norm, die
Wartungshistorie, und die Verbindung zum Show-Plan (der Planer fragt den
Vertrag noch nicht ab). Der Abgleich der sechs Fragen gegen den ADR-Text lebt
in der Suite — dort liegen ADR und Code im selben Baum.
