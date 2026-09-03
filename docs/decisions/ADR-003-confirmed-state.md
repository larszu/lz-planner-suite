# ADR-003: Bestätigter Zustand statt gesendeter Befehl

Status: entschieden · Datum: 2026-08-30 · Betrifft: Roadmap-Initiative 10 aus
[`FEATURE-STRATEGY.md`](../research/synthesis/FEATURE-STRATEGY.md), Score 23.

## Das Problem

Die Pain-Point-Recherche fand fünf Marktsegmente, die unabhängig voneinander dasselbe verlangen:
**den echten Gerätezustand lesen, nicht den zuletzt gesendeten Befehl anzeigen.** Kamera-Panels
driften open-loop, Intercom-Tasten lügen darüber, ob ein Mikro offen ist, Media-Server lassen sich
nicht zurücklesen, Show-Control-Schichten feuern nur Trigger. Das Rollen-Dossier des Bildtechnikers
formuliert die Regel von der anderen Seite: *never display a value the system has not confirmed.*

Es ist dieselbe Regel wie die Provenienz in ADR-001 und „ein Vorschlag ist keine Deckung" in
ADR-002 — nur an der Laufzeit statt am Plan.

## Der Befund im eigenen Code

Vor dem Entscheiden wurde nachgesehen, statt anzunehmen. Das Ergebnis ist differenzierter als der
Marktbefund, und das ist der Grund, warum dieser Abschnitt vor der Entscheidung steht: **Ein
pauschales „unsere Integrationen sind open-loop" wäre schlicht falsch gewesen.**

| Stelle | Befund |
| --- | --- |
| `VideohubExportDialog.handleReadState` | **Verstoß, behoben.** Der Status-Read schrieb den gelesenen Hub-Zustand in dieselbe Variable wie das geplante Routing — und seit ADR-001 wird die persistiert. Ein Klick auf „Status lesen" ersetzte damit die Planungsabsicht still durch die Beobachtung und speicherte sie. Behoben in `cable-planner#610`. |
| `AtemDialog.pushAll` | **Erfüllt die Regel bereits.** Nach `bulkSetInputNames` wird `getState()` gelesen und angezeigt. Was in der Tabelle steht, kommt vom Gerät. |
| `RentmanCableExportDialog.sendBucket` | **Teilweise erfüllt — und dort, wo es zählt, richtig.** Gespeichert wird `lastSyncedQty: bucket.built`, also der lokal gezählte, nicht der von Rentman bestätigte Wert. Die Oberfläche sagt darüber aber bereits die Wahrheit: die Spalte heißt „Bereits gesendet", die Zusammenfassung „bereits gesendet", das EN-Dict „Already sent". Nur der persistierte Feldname behauptet mehr, als der Inhalt hergibt — für den nächsten Entwickler, nicht für den Nutzer. |
| `RentmanImportDialog` (Kabelplan übernehmen) | **Verstoß, und ein anderer als erwartet.** `lastSyncedQty: existingMap?.lastSyncedQty ?? qty` — `qty` ist `cablePlanQty[key] ?? bucket.totalQty`, also die vom Nutzer im Dialog *editierbare Planmenge*, nicht `bucket.totalQty` (die Menge, die Rentman tatsächlich führt). Wer die Zahl beim Import anfasst, schreibt eine **geplante** Menge in das Feld, das der Export-Dialog als **gesendet** liest. Die nächste Differenz ist dann um genau diese Korrektur zu klein — still und kumulativ. |
| `exportGreengo` / `.gg5` | **Grenze, kein Verstoß.** Ein Datei-Export hat keinen Rückkanal; es gibt nichts zu bestätigen. Das gehört benannt, damit niemand es später für eine Lücke hält. |
| `checkState` / Mobile-Rückkanal | **Das gute Muster.** Der Aufbau-Status kommt vom Feld zurück ins Projekt — eine echte Bestätigung, keine Wiederholung des Befehls. |

## Die Entscheidung

**Jeder Wert, den eine Oberfläche als Gerätezustand zeigt, trägt seine Herkunft — oder er wird
nicht als Zustand gezeigt.** Drei Herkünfte, dieselben wie im `.avsourcemap`:

- `planned` — im Plan festgelegt, nie an ein Gerät gegangen.
- `commanded` — gesendet, Empfang nicht geprüft.
- `confirmed` — vom Gerät zurückgelesen.

Daraus folgen drei Regeln, die jede für sich prüfbar sind:

1. **Zwei Herkünfte teilen sich niemals eine Variable.** Ein Status-Read darf den Plan nicht
   verändern — die Differenz wird gezeigt, das Übernehmen ist eine Entscheidung (so jetzt im
   Videohub-Dialog). Und umgekehrt: In ein Feld, das „gesendet" bedeutet, gehört kein geplanter
   Wert, auch nicht als Startwert. Ein Zähler wird mit dem initialisiert, was die Gegenstelle
   führt, oder mit null — nie mit dem, was jemand vorhat.
2. **Ein Feldname darf nicht mehr behaupten, als der Inhalt hergibt.** `lastSyncedQty` ist keine
   Bestätigung, solange niemand zurückgelesen hat. Entweder zurücklesen oder ehrlich benennen.
3. **Wo es keinen Rückkanal gibt, wird das gesagt statt verschwiegen.** Ein `.gg5`-Export ist eine
   Übergabe, keine Steuerung — und die Oberfläche darf danach nicht so tun, als wüsste sie, was das
   Pult tut.

## Warum nicht „überall zurücklesen"

Naheliegend, aber falsch. Ein Rücklesen kostet einen zusätzlichen Aufruf, und bei Rentman wäre das
ein zweiter API-Call pro Position — bei einem Kabel-Export mit dreißig Zeilen also dreißig
zusätzliche Anfragen gegen ein Rate-Limit, für eine Bestätigung, die in aller Regel nur wiederholt,
was ohnehin geschah. Die Regel verlangt nicht Rücklesen, sondern **Ehrlichkeit über das, was man
weiß.** Ein als `commanded` gekennzeichneter Wert ist vollkommen brauchbar; ein als `confirmed`
ausgegebener Wert, der es nicht ist, ist der Schaden.

## Die Reihenfolge

| # | Inkrement | Warum hier |
| --- | --- | --- |
| 0 | Videohub-Status-Read entkoppeln | War ein aktiver Datenverlust — erledigt in `cable-planner#610` |
| 1 | Rentman-Zähler: Startwert aus Rentmans eigener Menge statt aus der Planmenge, Feld zu `lastSentQty` umbenennen (mit Migration) — erledigt in `cable-planner#611` | Der Startwert ist der eigentliche Fehler; die Umbenennung macht ihn für den nächsten Entwickler unwiederholbar |
| 2 | Provenienz-Anzeige als geteiltes UI-Element — erledigt in `cable-planner#643`, Zuschnitt gemessen statt angenommen (siehe unten) | Erst wenn zwei Stellen sie brauchen, lohnt die Verallgemeinerung |
| 3 | `sony-camera-bridge`: `BridgeTallyState` gegen die Regel prüfen — geprüft, Ergebnis unten | Anderes Repo, eigener Rhythmus |

Inkrement 2 bewusst nicht zuerst: Ein gemeinsames Provenienz-Badge zu bauen, bevor der zweite
Anwendungsfall existiert, wäre eine Abstraktion auf Verdacht.

## Was dieser ADR ausdrücklich nicht behauptet

Nach dem Videohub-Fix hat der `cable-planner` **keinen großen offenen Verstoß mehr** gegen diese
Regel. Was bleibt, ist ein falscher Startwert in einem Zähler und ein Feldname. Das ist die ehrliche
Bilanz, und sie gehört hierhin, weil die Versuchung groß ist, aus einem starken Marktbefund eine
lange Mängelliste im eigenen Code abzuleiten. Der Marktbefund bleibt trotzdem wertvoll — er sagt,
welche Regel beim *nächsten* Feature nicht gebrochen werden darf, nicht dass sie hier schon
flächendeckend gebrochen wäre.

## Was die Umsetzung gelehrt hat

**Der Feldname war nicht das Problem.** Der ADR stand zuerst mit „`lastSyncedQty` behauptet eine
Bestätigung" als Hauptbefund. Beim Nachsehen in der Oberfläche stellte sich heraus: die Spalte heißt
seit jeher „Bereits gesendet", die Zusammenfassung ebenso, das EN-Dict „Already sent". Der Nutzer
wurde nie belogen. Aus einem vermeintlich offenen Verstoß wurde eine Namenskosmetik — und beim
Weitersuchen, unter genau der Prämisse „wo kommt der Wert eigentlich her", der echte Fehler: der
**Startwert** beim Import stammte aus der editierbaren Planmenge. Die Regel hat also nicht dort
gegriffen, wo sie zuerst zu greifen schien.

**Die Provenienz-Frage stellt man an den Schreibern, nicht an den Lesern.** `sendBucket` war der
offensichtliche Kandidat, weil dort „gesendet" draufsteht. Der Fehler saß im zweiten Schreiber,
`RentmanImportDialog`, den niemand als Zustands-Schreiber liest — er heißt Import. Wer ein Feld auf
seine Herkunft prüft, muss **jede** Zuweisung ansehen, nicht die naheliegende.

**Eine Migration darf nicht auf null heilen.** Ein Eintrag ohne Menge bleibt mengenlos. `0` hieße
„nichts gesendet" und stellte die nächste Differenz auf die volle Menge — eine erfundene
Bestätigung, also genau der Schaden, gegen den dieser ADR geschrieben ist.

## Nachtrag: `sony-camera-bridge` (Inkrement 3)

Geprüft wurden `BridgeTallyState` im Companion-Modul und das Tally-Register der Bridge selbst.

**Die Regel ist erfüllt, und aus einem Grund, der benannt gehört: die Bridge ist der *Ursprung*
dieses Werts, kein Spiegel eines fremden Zustands.** Kein Switcher speist das Register (es gibt
keine ATEM-/TSL-Anbindung im Repo), also gibt es nichts zurückzulesen — die Bridge ist die Quelle.
Wo ein Wert entsteht, ist die Frage nach der Bestätigung gegenstandslos. Die Regel gilt für
angezeigten **fremden** Zustand, nicht für ein Register, das das System selbst führt.

Das Companion-Modul macht es zudem ausdrücklich richtig: `tallyState` wird **ausschließlich** in
`onTally` geschrieben — also nur aus dem, was die Bridge zurücksendet — nie optimistisch aus dem
Tastendruck. `sendTally` postet und ruft danach `refreshAll()`. Das kostet einen Round-Trip und
sieht wie eine überflüssige Anfrage aus; es ist die Regel in Codeform, und wer sie später
„optimiert", baut genau den open-loop-Zustand ein, den fünf Marktsegmente beklagen.

**Eine Stelle bleibt offen** (`bridge.ts`, `fetchTally`): antwortet die Bridge ohne `tally`-Feld,
setzt das Modul `{program: false, preview: false, isoRec: false}` — es *erfindet* also „alle Lampen
dunkel". Das ist die gefährliche Richtung: eine Kamera, die auf Sendung ist, erschiene als nicht auf
Sendung. Ehrlich wäre, die Antwort ohne Nutzlast wie die anderen Fehlerpfade zu behandeln (werfen →
`ConnectionFailure`), damit der Operator „Bridge antwortet nicht" sieht statt einer falschen
Gewissheit.

Nicht gebaut, und der Grund gehört dazu: der Entwicklungszweig dieses Repos trägt derzeit den noch
offenen Lizenz-PR (`sony-camera-bridge#8`), der eine Entscheidung des Eigentümers braucht. Einen
sachfremden Fix daraufzusetzen würde diese Entscheidung mit fremdem Inhalt vermengen. Der Fix wartet
darauf, dass der Zweig frei ist — er ist klein und hängt an nichts anderem.


## Inkrement 2 — und warum das Messen den Zuschnitt geändert hat

Gebaut in `cable-planner#643`, nachdem der Eigentümer die Zurückstellung aufgehoben hatte.

Die Zurückstellung oben lautete: *„Ein gemeinsames Provenienz-Badge zu bauen, bevor der zweite
Anwendungsfall existiert, wäre eine Abstraktion auf Verdacht."* Vor dem Bau wurden die Stellen
deshalb **gemessen**, statt sie anzunehmen — und das Ergebnis hat den Zuschnitt geändert.

**Es sind zwei Formen, nicht eine.**

| Form | Aussage | Belegte Stellen |
| --- | --- | --- |
| Wert mit Herkunft | „diese Zahl wurde abgeschickt, nicht bestätigt" | Rentman `lastSentQty`, `portsUnknown`, `BridgeTallyState` (sony-camera-bridge) |
| Liste des Nichtbestimmbaren | „das hier kam nicht durch" | `sourceMap.unresolved`, `changeImpact` `unknown`, `planDiff.unclassified` |

Dieser ADR erwartete **eine** Verallgemeinerung. Es sind zwei, und nur die erste ist das, was er
„Provenienz-Anzeige" nennt. Die zweite ist bereits **dreimal unabhängig gebaut** und funktioniert;
sie mit hineinzuziehen wäre genau die Abstraktion auf Verdacht, gegen die die Zurückstellung
geschrieben war. Inkrement 2 bekam deshalb ausdrücklich nur die erste, und ein Test hält den
Zuschnitt fest.

### Warum kein Provenienz-Feld je Datensatz

Der naheliegende Bau wäre `{ value, provenance }` überall gewesen — eine Schema-Migration durch
alle drei Apps. Beim Nachsehen zeigte sich: **die Stellen tragen ihre Herkunft längst**, nur
implizit. `lastSentQty` heißt so, *weil* es abgeschickt wurde; `portsUnknown` *ist* die
Unbekannt-Markierung.

Ein Provenienz-Feld daneben wäre ein **zweiter Ort für dieselbe Wahrheit** gewesen — und zwei Orte
laufen auseinander. Das ist keine Vermutung: der Zugangsdaten-Rundgang derselben Woche
(`cable-planner#640`) hatte genau diesen Fehlermodus als Ursache, weil `stripSecrets` als
ungeprüfte Kopie in zwei Dateien lag.

Gebaut wurde stattdessen ein Vokabular (`unknown | planned | commanded | confirmed`), eine
Deklarationsliste als Daten, und ein Badge, das bei `planned` **nichts** rendert — ein Badge an
jedem Wert wäre dasselbe wie an keinem. **Keine Schema-Migration, kein Format-Eingriff.**

### Inkrement 3 ist damit auch belegt

Der Tally-Fund aus der Zeile darüber ist in `sony-camera-bridge#9` behoben: `BridgeTallyState`
führt `undefined` als eigenen Wert, es gibt ein `tally_unknown`-Feedback für den Fall, den
boolesche Lampen nicht ausdrücken können, und ein Toggle unterbleibt bei unbestätigtem Zustand —
`!undefined` wäre `true` gewesen und hätte die Kamera aus purer Unkenntnis auf Sendung geschaltet.
