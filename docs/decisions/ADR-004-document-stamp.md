# ADR-004: Ein Ausdruck sagt seinen Stand

Status: entschieden · Datum: 2026-09-01 · Betrifft: Roadmap-Initiative 4 aus
[`FEATURE-STRATEGY.md`](../research/synthesis/FEATURE-STRATEGY.md), Score 22.

## Das Problem — und die Fehllesung, die teurer wäre

Die naheliegende Lesart der Papier-Beschwerden lautet: *Papier ist das Problem, schaff es ab.* Sie
ist falsch, und sie wäre teuer. Das Rollen-Dossier der Kameraleute ist an dieser Stelle ausdrücklich:
Papier wird **absichtlich** behalten, weil es ohne Akku funktioniert und sich nicht unter der Hand
ändert. Lageristen sagen dasselbe aus ihrer Richtung. Wer den Zettel wegnimmt, nimmt genau die
Eigenschaft weg, wegen der er da ist.

Der tatsächliche Fehler ist ein anderer: **ein Ausdruck veraltet unsichtbar.** Zwei Blätter derselben
Pull-Liste, eine Woche auseinander gedruckt, sehen identisch aus. Auf der Baustelle entscheidet
dann, wer das jüngere Blatt in der Hand hält — und niemand kann es einem Blatt ansehen.

## Der Befund im eigenen Code

Vor dem Entscheiden nachgesehen, wie in ADR-001 bis 003.

| Stelle | Befund |
| --- | --- |
| `pullListCsv`, `terminationListCsv`, `cableScheduleCsv`, `cableBomCsv`, `assetRegisterCsv` | **Keine Stand-Angabe.** Fünf Dokumente, die aufs Papier und in die Halle gehen, tragen nichts als ihre Spalten. Der Dateiname trägt ein Datum (`YYYYMMDD_…`) — das überlebt den Druck nicht. |
| `exportPdf` Titelblock | **Behauptet mehr, als es weiß.** Zeigt `Revision: Rev 2`. Der Wert wird in `commitRevision` gesetzt und bleibt stehen, während der Plan weiterläuft. Auf Papier liest sich „Rev 2" als *dieser Ausdruck ist Rev 2*. Ab der nächsten Änderung stimmt das nicht mehr — und niemand merkt es. |
| `buildHandoverManifest` | **Dieselbe Behauptung** in „Aktuelle Revision". Beim Übergabe-Dokument wiegt sie schwerer: das Blatt geht an den Betreiber und liegt dort jahrelang. |
| `qrPayload` / `parseQrPayload` | **Der Rückweg existiert schon** — für einzelne Datensätze (`cableplanner://cable/C-0001`), tolerant gegenüber nackten IDs und Deep-Links. Für ein *ganzes Dokument* gab es ihn nicht. |
| `exportPdfVector` | **Kein Titelblock**, also auch keine falsche Revisions-Zeile. Die Lücke ist auf den Raster-Pfad begrenzt. |
| `multicam-planner`, `light-planner` | **Nachgesehen, anderer Befund.** Beide kennen gar keinen Revisions-Begriff; multicam hat genau einen Druckweg (Storyboard per iframe), light-planner keinen mit Stand-Angabe. Dort ist also nichts zu korrigieren, sondern etwas zu ergänzen — das ist ein kleineres und ein anderes Inkrement als im `cable-planner`. |

Das Muster ist dasselbe wie in ADR-003, nur auf Papier statt an einer Geräteschnittstelle: ein Wert
wird angezeigt, dessen Geltung niemand geprüft hat.

## Die Entscheidung

**Jedes gedruckte Dokument trägt einen Stempel, der genau eine Frage entscheidbar macht: ist dieses
Blatt noch der aktuelle Stand?** Nicht „ungefähr", nicht „am Projekt wurde seitdem gearbeitet" —
sondern: enthält es dieselben Zeilen, die es heute enthielte.

Daraus folgen vier Regeln:

1. **Der Fingerabdruck läuft über den Inhalt des Dokuments, nicht über das Projekt.** Ein
   verschobener Knoten auf dem Canvas ändert keine Zeile der Pull-Liste. Würde er sie trotzdem als
   veraltet markieren, wäre der Hinweis nach einer Woche Rauschen — und ein Hinweis, den alle
   wegklicken, ist schlimmer als keiner. Für den Plan-*Ausdruck* zählen Positionen dagegen sehr
   wohl: sie sind auf dem Blatt sichtbar. Ein Dokument, zwei Ableitungen, jede über das, was
   tatsächlich auf dem Papier steht.
2. **Ohne festgeschriebene Revision behauptet der Stempel keine Abweichung.** `drifted` ist dann
   `false`, weil es nichts gibt, wovon abgewichen werden könnte. Das ist ADR-003 wörtlich: eine
   erfundene Abweichung ist derselbe Schaden wie ein erfundener Zustand.
3. **Der Stand steht neben der Revision, nicht statt ihr.** „Rev 2 + Änderungen" sagt beides: von
   welchem Stand das Blatt ausging und dass es ihn nicht mehr trifft.
4. **Der Stempel ist überall optional.** Ohne ihn erzeugt jeder Bauer wortgleich das bisherige
   Dokument. Ein Test hält das fest, damit die Einführung keine stille Formatänderung ist.

## Warum kein Krypto-Hash

Naheliegend, aber am Zweck vorbei. Der Stempel schützt vor **Verwechslung**, nicht vor Fälschung —
niemand manipuliert eine Pull-Liste, um eine Kollision zu erzwingen. Acht Hex-Zeichen (FNV-1a, 32
Bit) kann ein Mensch am Telefon vorlesen und mit dem Bildschirm vergleichen. Das ist der Rückweg vom
Papier, den die Recherche verlangt, und er funktioniert ohne Scanner, ohne App und ohne Netz —
also unter genau den Bedingungen, unter denen Papier überhaupt gewählt wurde. Ein SHA-256 wäre
64 Zeichen, die niemand vorliest.

## Warum die Fußnote hinten steht

Eine Stempelzeile *vor* der Kopfzeile verschöbe jede Auswertung, die Zeile 1 als Header liest —
Excel-Pivot, Import-Skript, `pandas.read_csv`. Hinten steht sie da, wo eine Fußzeile hingehört: auf
dem Ausdruck unten, in der Tabelle in der letzten Zeile.

## Was verworfen wurde

**Fingerabdruck über das ganze Projekt.** Einfacher zu bauen, aber er würde jede Pull-Liste bei
jeder Canvas-Bewegung als veraltet markieren. Nach zwei Tagen glaubt niemand mehr der Anzeige, und
dann ist auch der echte Fall verloren. Ein Warnsignal ist nur so viel wert wie seine Trefferquote.

**Ein Zeitstempel statt eines Fingerabdrucks.** „Gedruckt am 1.9." beantwortet die Frage nicht: das
Datum sagt, wann gedruckt wurde, nicht ob sich seitdem etwas geändert hat. Genau diese Verwechslung
steht heute schon im Dateinamen.

**Zwangs-Stempel auf jedem Export.** Ein Zwischenexport nach Excel braucht keine Fußnote. Der
Aufrufer entscheidet; die Bauer bleiben pur.

## Die Reihenfolge

| # | Inkrement | Warum hier |
| --- | --- | --- |
| 1 | `documentStamp` + fünf Installateur-CSVs + PDF-Titelblock + Übergabe-Dokument — erledigt in `cable-planner#612` | Die Ableitung und die Stellen, die heute etwas Falsches behaupten. Reine Ableitung, keine Persistenz |
| 2 | Dokument-Code `cableplanner://doc/<id>?s=<stand>`, Register der Ableitungen, Standvergleich im Mobile-Viewer — erledigt in `cable-planner#613` | Braucht Inkrement 1 als Datenquelle; der Record-Rückweg existiert bereits und wird erweitert, nicht ersetzt |
| 3 | Der Stand-Code auf den CSV-/Listen-Ausdrucken selbst (heute trägt nur das Plan-PDF einen QR; die Listen tragen die acht Zeichen als Text) | Erst wenn 2 steht, gibt es etwas zu drucken, das sich prüfen lässt |
| 4 | `multicam-planner` / `light-planner`: Stand-Angabe auf deren Ausdrucke | Andere Apps, eigener Rhythmus — die Ableitung ist teilbar, die Dokumente sind es nicht |

Inkrement 2 bewusst nicht zuerst: ein QR-Code auf einem Dokument, dessen Stand niemand berechnen
kann, wäre ein Bild ohne Inhalt.

## Zum Verhältnis zu ADR-003

Dieselbe Regel, anderer Ort. ADR-003 sagt: zeige keinen Gerätezustand, den niemand bestätigt hat.
ADR-004 sagt: drucke keinen Planstand, den niemand geprüft hat. In beiden Fällen ist der Schaden
nicht das Fehlen der Information, sondern die **falsche Gewissheit** — ein Wert, der aussieht, als
wüsste ihn jemand.

## Was die Umsetzung gelehrt hat

**Der dritte Ausgang ist der wichtigste.** Der Standvergleich hat `current`, `stale` und `unknown`.
Zwei hätten gereicht, um die Funktion zu schreiben — und wären falsch gewesen: `kabel-bom` lässt
sich nicht reproduzieren, weil sein Inhalt am Reserve-Aufschlag hängt, den der Stempel nicht trägt.
Mit zwei Ausgängen wäre jedes BOM-Blatt „veraltet" gewesen, dauerhaft und fälschlich. Die Auslassung
im Register ist deshalb durch einen Test festgehalten, damit sie später nicht als Lücke „repariert"
wird.

**Ein neues Code-Format braucht einen Riegel im alten Parser.** `parseQrPayload` ist absichtlich
tolerant: was es nicht erkennt, gibt es als Klartext-ID zurück. Eine Dokument-URI fiel damit in den
Datensatz-Lookup und wurde als Kabelnummer gesucht — Ergebnis „unbekannter Code" statt „das ist ein
Dokument-Code". Toleranz an einer Stelle wird zum Fehler, sobald daneben ein zweites Format
entsteht.

**Der Weg ohne Kamera ist der, der zählt.** Acht Hex-Zeichen aus der Fußnote, abgetippt, finden das
Dokument und melden seinen Stand. Das funktioniert am Telefon, in der Halle, ohne App — also unter
genau den Bedingungen, unter denen jemand überhaupt zum Papier gegriffen hat. Ein QR-Code auf dem
Plan-PDF ist die bequeme Variante; die abtippbare ist die belastbare.

## Nachtrag: der Aufbaustand stand nicht im Fingerabdruck

Regel 1 endet mit dem Satz „jede über das, was tatsächlich auf dem Papier steht". Die Umsetzung
hielt ihn für die Listen ein und für den Plan-Ausdruck nur halb: `planFingerprint` deckte Geräte,
Kabel und Orte ab — die Häkchen der bereits gesteckten Ports nicht.

Die stehen aber auf dem Blatt. Der Mobile-Viewer meldet gesteckte Ports zurück, `EquipmentNode`
zeichnet dafür ein Häkchen an den Port, und beide Plan-Export-Wege nehmen es mit: der Raster-Weg
fotografiert das Viewport-DOM, der Vektor-Weg klont es. Ein Ausdruck von gestern Abend meldete sich
damit als aktueller Stand, obwohl seitdem zwölf Ports abgehakt worden waren — auf einem Blatt,
dessen einziger Zweck während des Aufbaus genau dieser Stand ist.

Zwei Dinge sind daran über den Einzelfall hinaus interessant.

**Der Filter ist die eigentliche Entscheidung, nicht die Ergänzung.** Kabel-Haken stehen nur im
Kontextmenü, nie auf der Zeichnung; Haken auf gelöschten Geräten zeichnen nichts, und beim Löschen
räumt niemand `checkState` auf. Beide mitzuzählen hätte eine Abweichung behauptet, die auf dem
Papier niemand sehen kann — nach ADR-003 derselbe Schaden wie ein erfundener Zustand, nur in die
andere Richtung. Regel 1 schneidet also in beide Richtungen: *alles*, was auf dem Blatt steht, und
*nichts*, was nicht darauf steht.

**Eine Fingerabdruck-Änderung entwertet Papier.** Der Haken-Block wird nur angehängt, wenn es Haken
gibt; sonst hätte allein der zusätzliche Trenner jeden bestehenden Wert verschoben und jedes bereits
gedruckte Blatt auf einen Schlag als veraltet gemeldet. Neu ist der Wert genau dort, wo der alte
falsch war. Wer den Fingerabdruck erweitert, erbt diese Pflicht — und braucht dafür einen fest
verdrahteten Regressionsanker, keinen Vorsatz.

Gefunden hat das nicht ein Review, sondern eine Messung gegen den Code, einen Tag nach dem Bau des
Registers. Der ADR war richtig aufgeschrieben; die Umsetzung hatte einen Fall übersehen, den kein
Test verlangte, weil kein Test ihn kannte.
