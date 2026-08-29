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
