# Initiative 5, Inkrement 2: was der Impact-Blick wirklich braucht

Inkrement 1 steht (`cable-planner#638`): `changeImpact(before, after)` sagt, welche
registrierten Dokumente eine Änderung überholt, und nennt die nicht beurteilbaren beim Namen.

Dieses Dokument hält fest, warum der naheliegende zweite Schritt **nicht gebaut wurde**, und was
statt seiner nötig wäre. Es ist die gleiche Sorte Notiz wie
[`INITIATIVE-11-SCOPING.md`](INITIATIVE-11-SCOPING.md): der fehlende Teil ist nicht der, den man
zuerst vermutet.

## Der naheliegende Schritt, und warum er nichts trägt

Die Funktion braucht einen Vorzustand. Einer liegt greifbar da: `projectHistory` hält
`past: CablePlannerProject[]`, es fehlt nur ein lesender Zugriff. Zwanzig Zeilen, kein neuer
Zustand, und schon könnte die App sagen „dein letzter Edit hat diese Blätter überholt".

**Gemessen, was das wert wäre: fast nichts.** Der Grund ist die Frage selbst. Der Nutzer will nicht
wissen, ob sein letzter Edit *irgendeine Ableitung* verändert hat — das tut fast jeder Edit. Er
will wissen, ob **die Blätter, die er ausgeteilt hat**, noch stimmen. Zwischen beidem liegt die
ganze Nützlichkeit.

Ein Panel, das nach jedem Tastendruck eine andere Liste zeigt, ist Rauschen. Und Rauschen an dieser
Stelle ist nicht bloß nutzlos: es gewöhnt den Nutzer daran, die Meldung zu überblättern — genau
dann, wenn sie einmal wichtig ist.

Deshalb ist der Zugriff **nicht** entstanden. Ein unbenutzter Zugriff wäre toter Code, und dass
toter Code mit einem Kommentar, der einen Zweck behauptet, teuer wird, hat `cable-planner#636` in
derselben Woche gezeigt.

## Was fehlt: das Gedächtnis für Ausgegebenes

Nachgesehen: **nichts hält fest, dass ein Dokument je ausgegeben wurde.** `documentStamp` baut den
Stempel beim Export und druckt ihn aufs Blatt; danach vergisst die App den Vorgang. Der Rückweg
funktioniert nur, weil der Stand auf dem *Papier* steht — `docStandStatus` in `src/mobile/`
vergleicht ihn gegen den heutigen. Das ist die Rückwärts-Frage, und sie braucht kein Gedächtnis,
weil der Nutzer den Zettel mitbringt.

Die Vorwärts-Frage braucht es. Sie lautet vollständig: *„welches der ausgegebenen Blätter ist
überholt, seit ich es ausgegeben habe?"* — und dafür muss die App wissen, welche es waren und mit
welchem Stand.

## Warum das eine Entscheidung des Eigentümers ist

Der Datensatz selbst ist klein (Dokument-Bezeichner, Stand, Zeitpunkt, vielleicht die Zahl der
Kopien). Die Fragen daran sind es nicht:

1. **Wohin?** In die Projektdatei gehört, was zum Plan gehört. Eine Druck-Historie ist eher
   Arbeitsprotokoll als Plan — und `healProjectPositions` ist laut Repo-Konvention die Stelle für
   neue optionale Plan-Felder, nicht für Protokolle.
2. **Was passiert beim Zusammenführen?** Die Datei wird kollaborativ bearbeitet (CRDT-Modus, siehe
   `collabStore`). Zwei Leute drucken dieselbe Liste an zwei Orten — eine Historie, die dabei
   verschmilzt, behauptet leicht Dinge, die so nie passiert sind.
3. **Wie lange?** Ein Protokoll ohne Verfall wächst mit jedem Ausdruck. Ein Protokoll mit Verfall
   entscheidet, wann eine Warnung aufhört zu warnen.
4. **Und der Kollaborations-Fall überhaupt.** Im CRDT-Modus führt ein `undoDelegate` die Historie,
   `projectHistory.past` ist dort nicht mehr autoritativ. Jede Antwort aus dieser Quelle müsste im
   Kollaborations-Modus `undefined` liefern statt zu raten — dieselbe Regel, mit der
   `documentRegistry.currentStand` für nicht reproduzierbare Dokumente `undefined` liefert.

Keine dieser Fragen ist nebenbei zu beantworten, und drei davon ändern das Dateiformat.

## Was Inkrement 1 unabhängig davon schon leistet

Auch ohne Gedächtnis ist die reine Funktion nicht nutzlos — nur nicht als Dauer-Panel:

- **An der Ausgabe selbst.** Wer eine Liste druckt, könnte im selben Moment sehen, welche *anderen*
  ausgegebenen Blätter derselbe Stand betrifft. Das braucht kein Protokoll, sondern einen zweiten
  Stand, den der Nutzer mitbringt (den Code vom Zettel).
- **Am Vergleich zweier Dateien.** Zwei `.cp`-Stände nebeneinander — „was hat sich zwischen der
  Fassung von gestern und heute an ausgabewirksamen Dingen geändert?" Das ist eine
  Datei-gegen-Datei-Frage und braucht gar keinen Store.

Der zweite Weg ist der billigere und ehrlichere nächste Schritt, falls Inkrement 2 warten soll.
Er entscheidet nichts über das Dateiformat.

## Stand

**Offen, und ausdrücklich beim Eigentümer.** Damit ist es die sechste geparkte Design-Frage; die
anderen fünf stehen in [`../../decisions/ADR-005-lossless-or-loud.md`](../../decisions/ADR-005-lossless-or-loud.md)
und [`CREDENTIALS-IN-TEMPLATES.md`](CREDENTIALS-IN-TEMPLATES.md).

---

## Nachtrag (2026-09-03): der zweite Weg ist gebaut

`cable-planner#639` hat gebaut, was oben als „der billigere und ehrlichere nächste Schritt" steht:
den **Vergleich zweier gegebener Plan-Stände**. Der Nutzer wählt eine zweite Projektdatei — etwa
die Fassung, die ein Kollege zurückgeschickt hat —, und bekommt beide Antworten nebeneinander:
`planDiff` sagt, *was* anders ist, `changeImpact` sagt, *welche Blätter* damit überholt sind.
Damit hat Inkrement 1 auch seinen ersten Aufrufer; bis dahin war es eine Ableitung ohne Weg zum
Nutzer.

**An der geparkten Frage ändert das nichts.** Das Register der ausgegebenen Dokumente fehlt
weiterhin, und mit ihm die eigentlich gewünschte Antwort („welches der Blätter, die ich ausgeteilt
habe, ist hin"). Die vier Fragen oben stehen unverändert beim Eigentümer. Was gebaut wurde,
entscheidet keine davon — das war die Bedingung.

### Was der Bau gelehrt hat, und was oben so nicht stand

**Die Klassifizierung ist die Arbeit, nicht der Vergleich.** Ein Vergleich über acht handverlesene
Felder (Endpunkte, Typ, Länge) wäre in einer Stunde fertig gewesen und hätte die anderen 138 der
insgesamt **146** Felder von `Cable`/`EquipmentItem` als „keine Änderung" ausgewiesen. Das ist
nicht die kleine Lösung derselben Sache, sondern die gefährliche Richtung von ADR-005: eine
Falschaussage, die wie eine Freigabe aussieht. Jedes Feld trägt jetzt eine Klasse
(`identity` / `substantive` / `cosmetic` / `bookkeeping` / `sensitive`), und ein Laufzeit-Guard
über die Typ-Quelle bricht, sobald ein neues Feld ohne Klasse dazukommt.

**Zugangsdaten haben einen zweiten Ausgang, und der führt aufs Papier.** Beim Aufzählen der Felder
fiel auf, dass `EquipmentItem` `username` und `password` führt — Geräte-Zugangsdaten, die in der
Projektdatei stehen. Ein Vergleich, der Werte druckt, hätte sie in die CSV geschrieben. Sie sind
deshalb als `sensitive` klassifiziert: die Änderung wird gemeldet, der Wert nie.

Das ist **neuer Beleg für Design-Frage 5** ([`CREDENTIALS-IN-TEMPLATES.md`](CREDENTIALS-IN-TEMPLATES.md)):
dort geht es um dieselben zwei Felder auf dem Weg in ein geteiltes Bibliotheks-Template. Nach zwei
Funden war die Vermutung, dass es weitere gibt, keine Vermutung mehr, sondern eine Aufgabe — und
sie ist in `cable-planner#640` erledigt: **jeder Ausgang einmal abgegangen**, mit einem
Kanarienvogel-Wert statt mit einer Textsuche, weil ein Ausgang, der das ganze Item durchreicht,
`password` nirgends erwähnt.

Ergebnis: zehn Dokument-Ableitungen sauber (jetzt per Test festgehalten), der **Viewer-Export**
trug sie und ist geschlossen, `.avplan` trägt sie und **bleibt offen** — dort wäre Strippen ein
Round-Trip-Verlust, also ADR-005 in die andere Richtung. Die vollständige Tabelle steht im
Nachtrag von `CREDENTIALS-IN-TEMPLATES.md`. Der Rundgang hat damit genau das geliefert, wofür
ADR-005 Inkrement 3 die Naht-Pfade abgegangen ist: eine Lücke geschlossen, eine Entscheidung
sauber vom Bug getrennt.

**Das eigene Werkzeug hatte denselben Fehler wie die Sache, gegen die es schützt.** Der erste
Feld-Auszug für den Guard hat drei Felder still verschluckt — `libraryRef`,
`rackInternalSnapshot`, `atemMvCapabilitiesOverride`, alle drei mit mehrzeiligem Objekt-Typ. 94
statt 97, und ohne Fehlermeldung. Aufgefallen ist es nur, weil die Zahl gegen den Quelltext
gehalten wurde statt geglaubt. Der bestehende `interfaceKeys` bleibt unangetastet: er ist
zeichengleich zur Kopie im multicam-planner, und dieses „wortgleich nachprüfbar" ist mehr wert als
eine Erweiterung.


---

## Gebaut (2026-09-03): das Register steht, Initiative 5 ist ganz

Der Eigentümer hat entschieden: **getrennte Protokolldatei plus einsehbares Log im Menü.**
Gebaut in `cable-planner#644`.

**Die Entscheidung hat drei der vier Fragen oben gegenstandslos gemacht**, statt sie zu
beantworten — und das ist der interessanteste Teil daran:

| Frage | Was aus ihr wurde |
| --- | --- |
| 1. Wohin? | beantwortet: neben die App, nicht in den Plan |
| 2. Was beim Zusammenführen? | **entfällt** — ein Protokoll, das nicht mitreist, wird nie gemerged |
| 3. Wie lange? | bleibt, und ist beantwortet: die jüngsten `MAX_ENTRIES`, mit sichtbarem `dropped`-Zähler |
| 4. Der Kollaborations-Fall | **entfällt** aus demselben Grund wie 2 |

Eine Frage, deren Antwort andere Fragen verschwinden lässt, ist besser als eine, die sie
beantwortet. Das ist hier keine Beobachtung im Nachhinein: die vier standen bewusst *nebeneinander*
in diesem Dokument, damit sichtbar wird, welche Antwort wie viele davon trägt.

**Der Preis, ausdrücklich benannt:** das Register reist nicht mit. Es hält fest, was *diese
Maschine* ausgegeben hat. Wer den Plan weitergibt, gibt seine Druck-Historie nicht mit — und das
ist die richtige Seite des Tauschs, denn die Frage lautet „was habe **ich** ausgeteilt", nicht „was
hat irgendwer".

### Zwei Entscheidungen im Bau, die nicht in der Frage standen

**Aufgezeichnet wird an der einen Engstelle.** `save()` im Doku-Dialog ist der einzige Weg, durch
den alle sechs Dokumente gehen — nicht die sechs `build()`-Funktionen. Ein Protokoll, das an sechs
Stellen geschrieben wird, hat spätestens beim siebten Dokument eine Lücke, und eine Lücke in einem
Register sieht aus wie „nicht ausgegeben".

**Kein Eintrag ohne Stand.** Die Kabel-Stückliste hängt am Reserve-Aufschlag und hat keinen
reproduzierbaren Stand. Ein Eintrag ohne Stand könnte später nie beantworten, ob er noch gilt — er
wäre eine Protokoll-Zeile, die wie eine Aussage aussieht. Entsprechend kennt die Ansicht **drei**
Zustände: aktuell, überholt, und nicht beurteilbar. Dieselbe Regel wie in `changeImpact`.

### Initiative 5 im Ganzen

| Stück | Wo |
| --- | --- |
| Vorwärts-Frage über zwei gegebene Stände | `changeImpact.ts` (`#638`) |
| Datei-gegen-Datei-Vergleich + Dialog | `planDiff.ts`, `PlanCompareDialog` (`#639`) |
| Register der ausgegebenen Dokumente | `documentLog.ts`, `DocumentLogDialog` (`#644`) |

Damit beantwortet die App die Frage, mit der dieses Dokument anfing: *„welches der ausgedruckten
Blätter ist jetzt hin?"*
