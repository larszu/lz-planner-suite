# ADR-001: Die Identitäts-Spine

Status: entschieden · Datum: 2026-08-29 · Betrifft: Roadmap-Initiative 1 aus
[`FEATURE-STRATEGY.md`](../research/synthesis/FEATURE-STRATEGY.md), Score 27 — der höchste im
gesamten Strategiepapier.

## Das Problem

**Eine Identität, viele Projektionen.** Jedes reale Ding bekommt genau einen Datensatz; jedes
Label, Blatt, Export und jede Geräte-Konfiguration ist eine *Darstellung* davon, nie eine zweite
Wahrheit. Ein Umbenennen kostet eine Bearbeitung.

Acht von elf Berufsgruppen nannten das unabhängig als wichtigsten verbreiteten Schmerzpunkt; die
Wettbewerbs-Recherche bestätigt es von der Gegenseite mit einer wörtlichen Forderung aus dem
Tally-Segment: *„one authoritative, validated, exportable camera-to-input-to-tally-address-to-lamp
map"*.

## Wie entschieden wurde

Vier Entwürfe wurden unabhängig voneinander aus unterschiedlichen Blickwinkeln erstellt und dann
gegeneinander bewertet — gegen die Recherche-Befunde *und* gegen den echten Code:

| Score | Ansatz |
| --- | --- |
| 14 | Projection-first — Identität als reine Ableitungsschicht, kein persistenter Zustand |
| 13 | Minimal — kein neues Entity, nur ein Resolver plus Opt-in-Flag |
| 12 | Zentrales Register — `SourceIdentity` als erstklassiges Entity |
| 11 | Interchange-first — zuerst das Austauschformat, dann die App |

Die Punkte liegen eng beieinander, und jeder Entwurf hat einen belegten Fehler. Deshalb wird
**nicht der Sieger gebaut, sondern synthetisiert** — genau das, was Abschnitt 19 des
Rechercheauftrags verlangt.

## Was übernommen wird, und woher

**Die Eigentumsregel** (aus dem zentralen Register). Gespeichert wird nur, was keine Runtime
besitzt: redaktioneller Name, Nummer, Tally-Adresse, ISO-Präfix, Comms-Kanal. Alles, was eine
Runtime besitzt — ATEM-Source-Id, Videohub-Slot, MV-Fenster — wird über den Bindungsgraphen
*aufgelöst*, nicht gespeichert. Diese Regel entscheidet für jedes einzelne Feld, ob es ins Schema
gehört, und verhindert genau die zweite Wahrheit, die wir dem Markt vorwerfen.

**Die Reihenfolge** (aus projection-first). Inkrement 1 persistiert **nichts**. Die Ableitung ist
eine reine Funktion über ein Fixture-Projekt — kein React, kein Store, kein Electron —, also wird
jede Aussage des Produkts über Identität zu einer Vitest-Assertion, bevor irgendein Schema
festgelegt ist. Erst die Ableitung sagt uns, welche Felder der Graph tatsächlich nicht beantworten
kann; die kommen dann in Inkrement 2 als persistierte Anker.

**Die Engstelle mit Provenienz** (aus minimal). Die Diagnose ist präzise und im Code
nachgeprüft: Es fehlt kein Datensatz, es fehlt ein *Resolver*. `lib/portLabel.ts` bietet bereits
`portDisplayLabel`, aber mehrere Emitter gehen daran vorbei mit eigenen Fallback-Ketten —
`installerLists.ts:22` (`portName`), `cableLabel.ts:19` (`portText`),
`LocationBomDialog.tsx:98` (inline), `exportDevicePdf.ts:76` (roher `otherPort?.name`). Keiner
liefert zurück, *woher* der Text stammt. Eine Engstelle mit Provenienz im Rückgabewert löst das.

**Die Verweigerung statt stillen Verlusts** (aus interchange-first). Provenienz pro Wert
(`planned` / `commanded` / `confirmed`) und eine explizite `unrepresented[]`-Liste statt
stillschweigend fallengelassener Felder. Das setzt zwei Design-Regeln der Strategie direkt um:
niemals einen unbestätigten Wert als Tatsache anzeigen, und ein Import, der ein Feld nicht
erhalten kann, muss sich weigern statt es zu verlieren.

## Der Blocker, den die Bewertung aufgedeckt hat

Der bestplatzierte Entwurf hat einen Fehler, den erst die gegnerische Prüfung fand — belegt aus
dem Code selbst. `lib/exportVideohub.ts` schreibt in seinem eigenen Kommentar:

> *All outputs default to input 0 (slot 1) because the canvas has no routing data yet.*

Der Kreuzpunkt-Zustand liegt nicht im Projekt. In einer echten Regie erreicht die Kamera den
Mischer über den Router — also liefert eine reine Ableitung `ambiguous` für genau die Pläne, auf
die es ankommt. Die geforderte Kamera-zu-Input-zu-Tally-Adresse-zu-Lampe-Kette ist ohne
Routing-Zustand im Projekt **nicht ableitbar**.

Das macht die Routing-Persistenz zur Voraussetzung, nicht zum Risiko.

## Die Reihenfolge

| # | Inkrement | Warum hier |
| --- | --- | --- |
| 0 | Routing-Zustand ins Projekt | Ohne ihn ist die Kette nicht ableitbar. Vom Sieger als Risiko notiert, von der Bewertung als Blocker entlarvt. |
| 1 | Reine Ableitungsschicht + `LabelTargetSpec` | Persistiert nichts, vollständig testbar, deckt auf, was der Graph nicht beantworten kann |
| 2 | Persistierte Anker für genau das | Tally-Adresse, ISO-Präfix, Comms-Kanal — was keine Runtime besitzt |
| 3 | Austauschformat | Erst wenn klar ist, was drinsteht |

`LabelTargetSpec` verdient eine eigene Zeile: Die verstreuten `slice(0,4)`- und
`slice(0,20)`-Aufrufe werden **eine Tabelle von Zeichenbudgets externer Systeme**. Damit wird aus
einer Namenskollision durch Abschneiden ein Befund im vorhandenen `PlanCheckPanel` statt einer
Überraschung auf dem Multiviewer.

## Wo der Code hingehört

**Upstream, nicht in die Suite.** Nach der Konsolidierungsentscheidung sind die eigenständigen
Repos kanonisch; die Suite trägt vendored Kopien. Neue Features in `apps/cable-planner/` zu bauen
würde sofort neuen Drift erzeugen — genau den, dessen Beseitigung die Stufen 2 und 3 gekostet
haben. Der Code entsteht in `larszu/cable-planner`, die Suite zieht nach.

## Was verworfen wurde

- **Identität an `EquipmentItem.id` binden** (minimal). Es gibt dann keinen Ort für eine Adresse:
  kein TSL/UMD-Feld, kein GPIO-Pin, kein ISO-Kanal. Die wörtliche Forderung des Tally-Segments
  wäre nicht aufgeschoben, sondern *unerreichbar*, und Roadmap-Initiative 2 bliebe blockiert.
  Zusätzlich verletzt es Design-Regel 4: Identität muss stabil und von der Position getrennt sein,
  und ein Haupt-/Backup-Paar ist eine Rolle, nicht zwei Geräte.
- **Sofort ein Schema festlegen.** Ohne die Ableitung wissen wir nicht, welche Felder der Graph
  ohnehin beantwortet. Ein zu früh eingefrorenes Schema speichert Redundanz.

## Was die Umsetzung gelehrt hat

### Inkrement 0 — Routing-Zustand ins Projekt (erledigt, `cable-planner#601`)

Die gegnerische Prüfung hatte recht: Der Videohub-Export-Dialog hielt sein Routing in
`localStorage`, der Kommentar im Exporter sagte es sogar selbst. Der Zustand liegt jetzt als
`EquipmentItem.videohubRouting` im Projekt, wird von `healProjectPositions` migriert und normalisiert
(ein falscher Kreuzpunkt geht live auf Sendung — lieber verlieren als raten), Alt-Salvos werden
einmalig aus `localStorage` übernommen.

### Inkrement 1 — Ableitung + `LabelTargetSpec` (erledigt, `cable-planner#602`)

Zwei Regeln haben sich beim Bauen als tragend erwiesen; beide sind im Code als Kommentar
festgehalten, weil sie sonst beim nächsten Anfassen wieder verloren gehen.

**Treue-Regel: ein Kandidat behauptet nur, was der Exporter heute wirklich sendet.** Der erste
Entwurf setzte den aus dem Kabelgraph aufgelösten Quellnamen als ATEM-Label ein — schönerer Text,
aber kein Gerät hätte ihn je gesehen. Der Plan-Check hätte Kollisionen auf Texten gemeldet, die nie
ein Draht erreicht. Die Ableitung spiegelt deshalb exakt `portDisplayLabel` + `shortenForAtem`
(ATEM) bzw. `portDisplayLabel` (Videohub). Dass die Exporter den Resolver übernehmen, ist ein
eigener Schritt — er gehört zu Inkrement 2, nicht als stiller Nebeneffekt hierher.

Der Nebeneffekt dieser Strenge ist der eigentliche Gewinn: Zwei Eingänge mit den Portnamen
„1 SDI 3G" und „2 SDI 3G" bekommen im ATEM **beide** den Langnamen „3G". Das ist heute so, in
ausgelieferten Plänen.

**Kein Anker ohne Ziel-Spec.** `unanswered` meldet heute genau ein Feld, die UMD-Adresse. ISO-Präfix
und Comms-Kanal stehen bewusst noch nicht darin: Für beide fehlt ein belegtes Zielsystem in
`labelTargets.ts`, und ein Anker ohne Ziel ist eine Wunschliste, kein Arbeitsvorrat. Sie kommen mit
ihrem Ziel, nicht davor. Dieselbe Disziplin gilt für die Tabelle selbst — Green-GO-Kanalnamen
fehlen, weil für sie kein Limit belegt ist; eine geratene Zahl erzeugt Befunde, die niemand
nachprüfen kann.

**Was die Tests gefunden haben.** `shortenForAtem` verstümmelte „SDI 1" zur nackten „1" — genau der
Fall, den sein eigener Kommentar seit jeher ausschließt. Und die Rückwärtssuche wäre durch den
Genlock-Eingang einer Kamera gelaufen: Eine Kamera mit verkabeltem Referenz-Eingang sieht
strukturell aus wie ein Konverter, eine zählbasierte Regel kann das nicht unterscheiden. Jetzt
entscheidet der Signalbereich (gleicher Steckverbinder, kein Referenz-/Rückweg-/Steuer-Port), und
bei allem Mehrdeutigen hält die Suche an und nennt das Zwischengerät — das sagt weniger, stimmt
aber. Beide Fehler hätte kein Review gefunden, das nur den Diff liest; beide fielen, weil die
Ableitung eine reine Funktion über ein Fixture-Projekt ist. Genau dafür war die Reihenfolge gewählt.

### Inkrement 3 — das Austauschformat (erledigt, `cable-planner#603`)

`.avsourcemap` steht neben dem `.avplan`, nicht in ihm. Der `.avplan` trägt das ganze Projekt und
richtet sich an die Planungs-Apps; der Konsument der *Identität* ist eine **Runtime** — ein
Tally-Rechner, ein UMD-Sender —, und die soll nicht ein komplettes Kabelprojekt parsen müssen, um
zu erfahren, dass „Kamera 1" auf ATEM-Eingang 3 liegt. Geschrieben wird das **Ergebnis** der
Ableitung, nicht ihre Grundlage: Wer die Karte liest, baut den Kabelgraphen nicht nach.

Die beiden Regeln aus dem interchange-first-Entwurf, die ADR-001 übernommen hat, sind hier wörtlich
umgesetzt. **Provenienz pro Wert:** `planned` / `commanded` / `confirmed`, und der Cable-Planner
schreibt ausschließlich `planned` — er plant, er misst nicht. **Verweigerung statt stillen
Verlusts:** offene Anker stehen in `unresolved`, unbekannte Felder einer fremden Datei überleben
als `extra`, und was hier keinen Platz hat, wird beim Namen genannt.

Die tragende Entscheidung steckt im Import: Er **füllt nur Lücken**. Ein abweichender Wert wird
gemeldet, nicht übernommen; eine Adresse außerhalb 0–126 wird verworfen und benannt. Ein Import,
der stillschweigend die Tally-Adresse ändert, ist im Betrieb nicht zurückzuverfolgen — und genau
solche Automatik ist der Grund, warum die Recherche „stille Überschreibung" so oft als Schmerzpunkt
fand.

Ein Plan ohne Rollen exportiert eine leere Liste. Das ist die richtige Antwort, kein Fehler: Das
Format transportiert Identität, und ohne Rolle gibt es keine. Was dabei offen bleibt, steht dann
umso deutlicher in `unresolved`.

## Damit ist ADR-001 umgesetzt

Alle vier Inkremente stehen. Was offen bleibt, ist bewusst offen und in der Regel *kein Anker ohne
Ziel-Spec* begründet: ISO-Präfix und Comms-Kanal warten auf ein belegtes Zielsystem in
`labelTargets.ts`. Der nächste ehrliche Schritt ist nicht, das Schema zu erweitern, sondern die
Exporter den Resolver übernehmen zu lassen — die Treue-Regel aus Inkrement 1 hält sie bis dahin
absichtlich auseinander.
