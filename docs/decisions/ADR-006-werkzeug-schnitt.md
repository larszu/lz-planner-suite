# ADR-006: Der Schnitt — welche Funktion bleibt im Planer und was ein eigenes Werkzeug wird

Status: entschieden · Datum: 2026-09-07 · Betrifft: die Größe des `cable-planner` und die
Erweiterbarkeit der Suite

## Das Problem, in einem Satz des Eigentümers

> „Das ist alles sehr unübersichtlich. Durch extrem viele Funktionen werden die Basisfunktionen
> verdeckt."

Und die Richtung, die er vorgibt: die verdeckenden Bereiche in **eigene Repos auslagern**, die
dann — wie `multicam-planner` und `light-planner` — in die Suite integriert werden.

## Was tatsächlich drinsteckt (gemessen, 2026-09-07)

`cable-planner/src/renderer` umfasst **154.941 Zeilen**. Die Rechenschicht (`lib/`) hat **220
Module**; nach Domäne gruppiert:

| Zeilen | Module | Domäne |
| ---: | ---: | --- |
| 12.657 | 55 | **Kabel & Plan** — Kabelgraph, Ports, Label, Namensregeln, Prüfungen |
| 5.614 | 13 | Funk & Audio — Spektrum, Mikrofone, Kanäle, Drum-Micing |
| 5.444 | 15 | Netz & Adressen — Adressplan, Segmente, Multicast, Switch-Ports, PTP |
| 5.171 | 18 | Video/Signal & Geräte — ATEM, Videohub, Tally, Multiviewer, Quellen |
| 4.651 | 26 | **Lager & Logistik** — Bestand, Lagerbaum, Ausgabe, Schäden, Sub-Hire |
| 4.037 | 11 | Gerätekataloge |
| 3.138 | 10 | **Crew & Geld** — Sätze, Stunden, Auslagen, Belege, Kosten |
| 2.843 | 17 | Dokumente & Export |
| 822 | 5 | Zusammenarbeit & Sync |
| 501 | 3 | Integrationen (Rentman, NetBox) |
| 9.397 | 47 | Übriges (Bridge, i18n, Kategorien, Hilfsfunktionen) |

Dazu die Oberfläche, nach Bereich: Canvas 9.173 · Rack 7.494 · Eigenschaften 7.363 · Export 5.994
· Bibliothek 4.968 · Analysen 4.382 · Einstellungen 4.009 · Rentman 3.800 · ATEM 3.657 · **Lager
2.841** · Projekt 2.758.

## Das Kriterium

Nicht „ist es groß", sondern: **Wovon hängt es ab, und wer benutzt es ohne den Plan?**

Ein Bereich wird ein eigenes Werkzeug, wenn

1. er **eigene Stammdaten** führt, die den Plan überdauern (das Lager kennt Geräte, die in keinem
   Projekt stehen),
2. ihn **andere Rollen** bedienen als den Plan (Lagerist, Disponent, Buchhaltung — nicht der
   Planer),
3. er **ohne den Kabelgraph** vollständig ist,
4. und die Verbindung zum Plan sich auf **wenige benannte Fragen** reduzieren lässt.

Wo eine dieser vier Bedingungen fehlt, bleibt der Bereich im Planer — eine Trennung würde dann
nur einen Kabelbaum zwischen zwei Repos legen.

## Die Entscheidung

| Bereich | Wohin | Warum |
| --- | --- | --- |
| Kabel & Plan, Ports, Label, Namensregeln | **bleibt Kern** | Das *ist* der Cable-Planner. |
| Netz & Adressen | **bleibt Kern** | Hängt am Kabelgraph: eine Adresse gehört einer Schnittstelle eines geplanten Geräts. |
| Video/Signal, Tally, Multiviewer | **bleibt Kern** | Wird aus dem Kabelgraph abgeleitet (ADR-001). |
| Gerätekataloge | **bleibt Kern**, langfristig Paket | Reine Daten; ein eigenes Repo lohnt erst, wenn ein zweiter Planer sie schreibt statt nur liest. |
| **Lager & Logistik** | **eigenes Werkzeug** | Alle vier Bedingungen erfüllt. Eigene Stammdaten, eigener Bediener, kein Kabelgraph nötig; die Fragen an den Plan sind gezählt: *Deckt der Bestand den Bedarf? Was steht auf dem Ausgabeschein? Ist das Stück fremdes Material?* `@avplan/inventory-core` gibt es als Paket bereits. |
| **Crew & Geld** | **eigenes Werkzeug** | Sätze, Stunden, Auslagen und Belege gehören der Firma, nicht dem Plan. Der Plan liefert nur den Job-Bezug. |
| **Gebäude-Elektro & Festinstallation** (Issues #665, #666, #667) | **eigenes Werkzeug, noch nicht gebaut** | Schaltschränke, UP-/AP-Dosen, KNX/DALI/Crestron, Prüfprotokolle. Andere Norm, andere Rolle, anderer Lebenszyklus (Jahre statt Tage). **Nicht** in den Cable-Planner bauen — das wäre genau der Zuwachs, der die Basisfunktionen verdeckt. **Die Grenze verläuft aber nicht am Wort „Strom": siehe die Zeile darunter.** |
| **Stromplanung der Show** (B-45, B-52) | **bleibt Kern — nachgetragen 2026-09-09** | **Diese Zeile korrigiert die darüber.** Am 2026-09-07 stand hier „Wechselschaltungen mit Logikprüfung" als Beispiel für das ausgelagerte Werkzeug. Einen Tag später hat der Eigentümer ausdrücklich das Gegenteil verlangt („Zudem fehlen noch die Möglichkeiten für ordentliche Stromplanung … Und auch Lichtschalter und so müssen integrierbar sein"), und `cable#771/#782/#788` haben es gebaut: `types/circuit.ts` und `lib/circuitSolver.ts` mit Einspeisung, Aus-/Wechsel-/Kreuzschalter, Dimmer, Leuchte, Klemmstelle, Verteiler und den sechs Kontakten — samt der Leuchte, die auf dem Plan nur bei richtiger Verkabelung angeht. **Der Code ist richtig, die alte Zeile war es nicht mehr.** Der Grund ist derselbe wie bei „Netz & Adressen": es hängt am Kabelgraph. Ein Powerlock-Satz, eine Einzelader mit Farbe, ein Verteiler mit abgesicherten Abgängen sind Ports an Geräten in **diesem** Plan, für **diese** Show. |
| Funk & Audio | **bleibt vorerst Kern** | Der Spektrum-Plan liest die Sender aus dem Kabelgraph (Bedarf 95). Eine Trennung bräuchte zuerst eine Sender-Schnittstelle; danach ist es ein Kandidat. |
| Rentman/NetBox/Lexware | **bleibt Kern** | Dünne Adapter, keine eigene Domäne. |

### Wo die Grenze zwischen den beiden Strom-Zeilen liegt

Die beiden Zeilen oben sehen aus wie ein Widerspruch, und ohne diesen Absatz
wäre einer daraus geworden — der nächste Leser hätte entweder den
Schaltungs-Rechner unter Berufung auf das ADR wieder ausgebaut oder
Schaltschränke unter Berufung auf B-45 hineingebaut.

Die Grenze ist **nicht** das Wort „Strom", sondern der **Lebenszyklus** und die
**Zugehörigkeit** — dieselben zwei Bedingungen wie überall in dieser Tabelle:

* **Kern:** was für **diese Show** geplant, aufgebaut und wieder abgebaut wird,
  und was an Ports von Geräten **dieses Plans** hängt. Verteiler,
  Steckdosenleiste, Powerlock-Sätze, Einzeladern mit Farbe, die Schaltung
  zwischen Schalter und Leuchte im Aufbau.
* **Eigenes Werkzeug:** was dem **Gebäude** gehört und Jahre bleibt.
  Schaltschrank, fest verlegte Leitung, UP-Dose, Bus-Systeme, Prüfprotokoll
  nach Norm.

Ein Prüfstein, der beide Fälle trennt: *Wird das am Abbautag wieder
eingepackt?* Ja → Kern. Nein → eigenes Werkzeug.

## Wie ausgelagert wird — und was dabei nicht passieren darf

Die Suite trägt **vendorte Kopien** der Planer, in beide Richtungen ausgelaufen; der
Drift-Guard (`scripts/planner-drift.mjs`) misst das. Eine Auslagerung, die diese Mechanik
umgeht, erzeugt eine dritte Kopie.

Deshalb in dieser Reihenfolge, je Bereich:

1. **Die Fragen zuerst.** Was fragt der Plan das Werkzeug, wörtlich und abschließend? Diese Liste
   ist der Vertrag; sie steht im ADR, bevor eine Datei umzieht.
2. **Paket vor Repo.** Erst die Domäne in ein `@avplan/*`-Paket schneiden, das der Planer benutzt
   — noch im selben Repo. Bricht dabei etwas, bricht es sichtbar und an einer Stelle.
3. **Dann das Repo.** Erst wenn das Paket steht und der Planer nur noch über den Vertrag
   zugreift, zieht es um; die Suite bindet es wie die anderen Planer ein, der Drift-Guard bekommt
   seine Wurzel dazu.
4. **Nichts wird zweimal gerechnet.** Wo der Plan eine Zahl braucht, holt er sie über den
   Vertrag. Eine zweite Ableitung derselben Zahl auf der Planer-Seite ist der Defekt, gegen den
   ADR-001 geschrieben ist — beim Schnitt entsteht sie besonders leicht.

## Der Vertrag „Lager" — Schritt 1, ausgeschrieben (2026-09-07)

Punkt 1 oben verlangt die Liste, *bevor* eine Datei umzieht. Hier steht sie. Sie ist gemessen und
nicht geschätzt: der vollständige Import-Querschnitt zwischen Planer und Lager, aufgenommen im
Cable-Planner (`cable-planner#761`), und in Code gegossen als `src/renderer/lager/index.ts`.

### Was der Plan das Lager fragt

| Frage | Der Vertrag |
| --- | --- |
| **Deckt der Bestand den Bedarf?** | `deriveDemand`, `resolveCoverage`, `normaliseName` · `buildPlanBom`, `planBomCsv`, `pickListCsv`, `outcomeLabel` · `reconcileErp`, `erpReconcileTable` · Typen `DemandLine`, `CoverageLine`, `CoverageOutcome`, `CoverageResult`, `CoverageSource`, `PlanBom`, `PlanBomRow`, `ErpReport`, `ErpRow`, `ErpLine`, `ErpVerdict`, `ErpBasis` |
| **Was steht auf dem Ausgabeschein?** | `openCheckouts`, `overdueCheckouts` — und die Kehrseite, die der Schein nicht beantwortet: `assessAssetIdentity`, `assetIdentityTable`, `identityAnchors`, `ASSET_FINDING_LABEL`, `IDENTITY_ANCHOR_LABEL`, `unitLabel` samt ihren Typen |
| **Ist das Stück fremdes Material?** | `ownershipNote`, `overdueSubhire`, `subhireStatus`, `isForeign`, `OWNERSHIP_LABEL`, Typen `SubhireStatus`, `OverdueLine` |

Dazu der Bestand selbst, über **vier benannte Haken** statt über rohe Store-Selektoren:
`useBestand` (Artikel), `useEinheiten` (serialisierte Einheiten), `useLagerorte` (der Lagerbaum),
`useAusgaben` (die Scheine). Damit ist die Zustand-Store-Form nicht Teil des Vertrags — nach dem
Umzug wäre sie sonst eine Schnittstelle, die aus einem fremden Repo kommt.

Und **genau ein Schreibweg** vom Plan ins Lager: `useTypBestaetigen(itemId, deviceTypeId)`. Das ist
die Antwort auf `proposed-by-name` — ein Mensch hat gesagt, dass Plan-Gerät und Lager-Position
dasselbe meinen, und diese Aussage gehört an die Lager-Position, sonst wird sie beim nächsten
Abgleich wieder geraten. Menge, Ort und Zustand bleiben Sache des Lagers.

### Was ausdrücklich NICHT zum Lager gehört

Vier Module hätte man mit einem Blick auf den Namen hineinsortiert. Jedes wäre danach aus einem
fremden Repo zu holen gewesen:

- **`pickFile`** — generischer Datei-Dialog mit fünf Aufrufern quer durch den Planer
  (Videohub-Export, Bibliothek, Abgleich, Konfigurationen, Bild-Import). Im Lager-Import
  entstanden, aber keine Lager-Frage.
- **`mergeDefined`** — „Die Regel ist nicht auf das Lager beschränkt" steht wörtlich in ihrem
  eigenen Kommentar; `saveEquipmentAsTemplate` benutzt sie aus demselben Grund. Sie ist deshalb
  nach `lib/mergeDefined.ts` gezogen.
- **`handoverPackage`** — klingt nach Ausgabeschein, ist das Übergabe-/Closeout-Paket der
  Festinstallation, also die andere Domäne dieses ADRs (Issues #665–#667).
- **`actionItems`** — liest das Lager, gehört aber dem Plan: es zählt auch Netz- und Geld-Befunde
  zusammen. Verbraucher des Vertrags, nicht sein Inhalt.

### Wie der Vertrag gehalten wird

`cable-planner/tests/lagerVertrag.test.ts` misst die Einhaltung, statt sie zu behaupten: kein
Modul außerhalb von `lager/` importiert ein Internum; der Ordner ist nicht leer; die vier
Ausnahmen liegen außerhalb; die Tür rechnet nicht selbst (Punkt 4 dieses ADRs); jeder Store-Haken
*ist* ein Selektor und kein frisch gebautes Objekt.

**Die Domäne ist der Ordner**, nicht eine Liste im Wächter. Die erste Fassung zählte 29 Pfade auf —
und ein Tippfehler darin machte den Wächter für genau dieses Modul still wirkungslos. Eine Datei
gehört zum Lager, weil sie darin liegt; wer eine hinzunimmt, verschiebt sie, und das ist ein Diff,
den man sieht.

### Schritt 3 ist gegangen (2026-09-09): `larszu/inventory-planner`

Der Eigentümer hat das Repo angelegt, und das Lager steht darin — mit **eigener Oberfläche**, wie
E-27 es verlangt: drei Sichten für die drei Fragen (Bestand, Ausgabescheine, Sub-Hire), bedienbar
ohne offenen Plan. Genau das war der Punkt: im Cable-Planner war das Lager ein Dialog IM Plan, und
der Lagerist hat keinen Plan offen, sondern ein Regal.

**Die Grenze ist dabei schärfer geworden, als sie im Planer war.** Dort las der Bestands-Store die
Plan-Geräte direkt (`EquipmentItem[]`) und rief `deriveDemand` in sich selbst. Im eigenen Repo wäre
das der Kabelbaum, gegen den dieses ADR geschrieben ist. Jetzt gilt: **das Lager kennt kein
Plan-Modell.** Der Plan rechnet seinen Bedarf selbst und reicht `BedarfsZeile[]` herüber;
`seedAusBedarf` ist der einzige Schreibweg vom Plan hierher. `scripts/plan-grenze-check.ts` misst
es, und `npm test` des Repos fährt den Wächter mit — nicht nur sein Workflow, sonst liefe er in der
vendorten Kopie nie mit (`ci:complete` der Suite hat genau das gemeldet).

Die Suite bindet es ein wie die anderen Planer: vendorte Kopie unter `apps/inventory-planner`,
Modul „Lager" in der Rail (Port 4184, `strictPort`), Drift-Guard, Lizenz-Guard, Dev-Port-Guard.

**Was noch nicht umgezogen ist, und ausdrücklich:** der Deckungs-Abgleich gegen einen Plan (er
braucht den Bedarf von der anderen Seite), Scannen, Drucken — und die Cable-Planner-Seite selbst.
Der Planer behält seine Kopie, solange das nicht steht. Das ist keine Nachlässigkeit, sondern der
letzte Absatz dieses ADRs: einzeln schneiden, mit grünem CI dazwischen, und der Planer bleibt in
jedem Zwischenstand lauffähig.

**Was ausdrücklich nicht passiert:** kein „großer Wurf" in einem Schritt. Jeder Bereich wird
einzeln geschnitten, mit grünem CI dazwischen. Der Cable-Planner bleibt in jedem Zwischenstand
lauffähig — er ist das Werkzeug, mit dem gearbeitet wird, nicht ein Umbauprojekt.

## Der Vertrag „Festinstallation" — Schritt 1, ausgeschrieben (2026-09-09)

Der Eigentümer hat am 2026-09-09 für die Issues #665/#666/#667 „Repo anlegen, Gerüst bauen"
gewählt. Punkt 1 dieses ADRs verlangt die Fragenliste, *bevor* eine Datei umzieht — hier steht
sie.

### Warum diese Liste anders zustande kommt als die für das Lager

Beim Lager war Schritt 1 eine **Messung**: die Domäne lag im Planer, und der Vertrag war der
vollständige Import-Querschnitt zwischen ihr und dem Rest. Hier gibt es nichts zu messen — das
Gebäude steht noch in keiner Zeile Code. Diese Liste ist also **erklärt, nicht gemessen**, und
dieser Unterschied gehört hierher: wer sie später für ein Messergebnis hält, hält eine
Entwurfsentscheidung für einen Befund.

Praktisch heißt das: **die Liste kann sich beim Bauen als zu kurz erweisen** — dann wird sie hier
erweitert, mit Datum, bevor die Erweiterung in Code steht. Was sie nicht darf, ist stillschweigend
wachsen; genau daraus entsteht der Kabelbaum zwischen zwei Repos, gegen den das Kriterium oben
geschrieben ist.

### Was der Plan das Gebäude fragt

Sechs Fragen. Alles, was der Show-Plan von einer Festinstallation braucht, ist eine Auskunft über
**Punkte, die schon da waren, bevor der Plan existierte** — und die noch da sind, wenn er weg ist.

| Frage | Der Vertrag |
| --- | --- |
| **Was gibt dieser Anschlusspunkt her?** | `einspeisung(punktId)` → `{ id, bezeichnung, anschlussart, netzform, absicherungA, charakteristik, rcdTyp, dauerleistungW, raumId }`. Anschlussart aus einer geschlossenen Liste (CEE 63/32/16, Powerlock, Klemme, Schuko), Netzform TN-S/TN-C-S/TT/IT. **Das ist die Zahl, die der Plan nicht ein zweites Mal ableiten darf** (Punkt 4 oben). |
| **Wo ist dieser Punkt?** | `ort(objektId)` → `{ raumId, raumName, etage, hausbezeichner }`. Der Bezeichner **des Hauses** (TIA-606 o. ä.), nicht der des Plans. Der Plan zeigt ihn an und schreibt ihn auf seine Blätter; er erfindet keinen eigenen. |
| **Welche Kreise hängen zusammen?** | `kreisGeschwister(punktId)` → `punktId[]`: was am selben RCD bzw. derselben Absicherung hängt. Ohne diese Auskunft plant man das Rig auf zwei Dosen, die gemeinsam abschalten — und merkt es in der Show. |
| **Was ist hier belegt oder tabu?** | `verfuegbarkeit(punktId)` → `{ frei, belegtDurch?, geschaltet?, gedimmt?, hinweis? }`. „Geschaltet" und „gedimmt" sind hier keine Feinheit: eine Dose, die an einem Dimmer oder an der Hausbeleuchtungs-Schaltung hängt, ist für ein Netzteil kein Stromanschluss. |
| **Welche Klinke hat die Haussteuerung?** | `steuerklinken()` → `{ id, system ('knx'\|'dali'\|'crestron'\|'vissonic'\|…), adresse, richtung ('lesen'\|'schalten'), bedeutung }[]`. **Nur die benannten Klinken, nicht das Bus-Modell.** Der Plan will wissen, was er ansprechen darf und was das bewirkt — nicht, wie die Gruppenadressen des Hauses strukturiert sind. Das ist der Kern von #667. |
| **Gehört diese Strecke dem Haus?** | `hausStrecke(planKabelId)` → `hausStreckeId \| undefined`. Die Antwort auf den Prüfstein „wird das am Abbautag wieder eingepackt?", von der Seite, die es weiß. |

### Der eine Rückweg

Genau **ein** Schreibweg vom Plan ins Gebäude, aus demselben Grund wie `useTypBestaetigen` beim
Lager: `mangelMelden(hausObjektId, befund)`. Wenn beim Aufbau auffällt, dass eine Dose tot ist,
ein RCD auslöst oder eine Klinke nicht das tut, was sie laut Vertrag tut, dann ist das eine
**Aussage eines Menschen über das Gebäude** — sie gehört ans Gebäude, sonst ist sie nach dem
Abbau verloren und die nächste Show findet denselben Fehler noch einmal.

Alles andere fließt nicht zurück. Eine Show ändert das Haus nicht; sie benutzt es. Ein Planer, der
Lasten, Belegungen oder Kreise ins Gebäude zurückschreibt, hat aus dem Werkzeug des Betreibers ein
Anhängsel seiner Show gemacht.

### Zwei Invarianten, die hier besonders leicht brechen

* **ADR-002 — erklärt, nie erschlossen.** Ein `Raum 3` im Plan und ein `Raum 3` im Gebäude sind
  dasselbe, weil ein Mensch das gesagt hat, nicht weil die Zeichenketten gleich sind. Die
  Zuordnung ist ein Feld, kein Namensvergleich.
* **ADR-005 — bewahren, verweigern oder melden.** Was das Gebäude-Werkzeug schickt und der Plan
  nicht versteht, wird nicht verworfen. Der Plan trägt es unverändert weiter (`hausForeign`,
  analog zu `venueForeign`/`avForeign`/`personForeign`) oder sagt, dass er es nicht kann.

### Was ausdrücklich NICHT zum Gebäude-Werkzeug gehört

**Fünf** Module tragen das Wort „Festinstallation" in der eigenen Kopfzeile (gezählt am
2026-09-09: `types/lifecycle.ts`, `lib/assetRegister.ts`, `lib/installerLists.ts`,
`lib/handoverPackage.ts`, `lib/jobHandover.ts`) — und **keines davon zieht um**. Sie sehen aus wie
die neue Domäne, sind aber Sichten auf den Kabelgraph *dieses* Plans; Bedingung 3 des Kriteriums
(„ohne den Kabelgraph vollständig") ist bei allen verletzt. Dazu vier weitere, die das Wort nicht
tragen, aber denselben Verdacht wecken:

- **`types/lifecycle.ts`** — `InstallStatus`, `ServiceRecord`, `ChangeLogEntry`, `PendingChange`
  hängen an Kabeln und Geräten dieses Projekts. Der Lebenszyklus **des Plans** ist nicht der
  Lebenszyklus **des Hauses**.
- **`lib/assetRegister.ts`** — liest `project.equipment`. Ein Register der eigenen Geräte, kein
  Gebäude-Inventar.
- **`lib/installerLists.ts`** — Pull-, Termination- und Kabel-Schedule sind aus dem Kabelgraph
  abgeleitet. Dass Installateure sie lesen, macht sie nicht zum Gebäude.
- **`lib/handoverPackage.ts`** — trägt „Festinstallation" in Zeile 2 und ist trotzdem ein
  Dokument *aus diesem Projekt*. Beim Lager-Vertrag stand es auf der Nicht-Liste mit dem Verweis
  „gehört zur anderen Domäne dieses ADRs"; das ist hiermit präzisiert: es gehört zur
  Festinstallations-**Frage**, aber in den Planer.
- **`lib/asBuilt.ts`, `lib/jobHandover.ts`, `lib/postHandover.ts`** — drei Module mit „Handover"
  bzw. „As-Built" im Namen, drei verschiedene Dinge, keines davon das Gebäude: der Abgleich Plan
  gegen Wirklichkeit, die Frage „woraus wird nächstes Jahr geplant", die Übergabe an die Post.
  Dieselbe Namensfalle wie bei `handoverPackage` im Lager-Vertrag — und der Grund, warum diese
  Liste die Kopfzeilen zählt statt sich auf Dateinamen zu verlassen.
- **`types/circuit.ts` + `lib/circuitSolver.ts`** — siehe die Strom-Zeile oben: Show-Strom ist
  Kern.

Und auf Issue-Ebene, weil der Kommentar an den drei Issues vom 2026-09-07 an einer Stelle
überholt ist:

| Issue | Wohin | Warum |
| --- | --- | --- |
| **#665** Festinstallations-Produkte | **teilt sich** | Schaltschrank, UP-/AP-Dose, feste Schalterstelle → Gebäude-Werkzeug. Mehrfachsteckdose, Verteiler, Patchblende, Durchgangsbuchse → **bleibt Kern**, ist als passiver Port-Träger (B-52) bereits gebaut. |
| **#666** Elektroplanung | **bleibt Kern** | Der Kommentar vom 2026-09-07 nennt „Wechselschaltungen mit Logikprüfung" als ausgelagert. Das war einen Tag später überholt: der Eigentümer hat es ausdrücklich verlangt, `cable#771/#782/#788` haben es gebaut, und die Strom-Zeile oben hält es fest. **Nur Kreise, die dem Haus gehören, gehen ins neue Werkzeug.** |
| **#667** Haussteuerung/Mediensteuerung | **zieht um** | KNX, DALI, Crestron, Vissonic. Der Plan behält davon nur die benannten Klinken aus der Fragenliste. |

### Wie der Vertrag gehalten wird

**Der Wächter misst diesen Abschnitt, nicht eine Abschrift davon.**
`packages/facility-core/test/vertrag.test.ts` liest die Tabelle oben aus dieser Datei, zieht die
Funktionsnamen aus den sechs Zeilen und vergleicht sie mit `VERTRAG_FRAGEN` im Code — in beide
Richtungen. Eine siebte Funktion ohne siebte Zeile ist rot, eine gestrichene Zeile ohne
gestrichene Funktion ebenso. Dasselbe für den einen Rückweg.

Eine zweite Liste im Test hätte genügt und wäre falsch gewesen: sie wäre die zweite Wahrheit, gegen
die ADR-001 geschrieben ist, und sie driftet lautlos von diesem Abschnitt weg — was ein Wächter,
der sie liest, nie bemerken könnte.

Die zweite Hälfte des Wächters ist Punkt 4 (**die Tür rechnet nicht selbst**). Er hängt an der
Stelle, an der es am meisten verlockt: `belastbarkeit()` gibt `watt: null` mit Grund zurück, wenn
das Gebäude keine Dauerleistung angibt. `absicherungA × 230` wäre die naheliegendste Zeile des
Pakets und die gefährlichste — der Nennstrom ist die Auslöseschwelle des Schutzschalters, nicht die
zulässige Dauerlast, und die gerechnete Zahl sähe aus wie eine Auskunft des Hauses. Ein Test
verlangt ausdrücklich, dass sie nirgends auftaucht.

Und die Regel, die alle sechs Fragen teilen: **„nicht angegeben" ist nicht „nein".** Fehlt die
Angabe, kommt `{ bekannt: false, grund }` zurück und keine leere Liste, `undefined` und kein
`false`. Eine leere Geschwister-Liste liest sich als „teilt sich mit niemandem" — eine Zusicherung,
die das Gebäude nie gegeben hat, und danach hängt das Rig auf zwei Dosen an einem RCD.

Zehn Gegenproben, alle rot und zurückgebaut grün: siebte Frage im Code · gestrichene Zeile im ADR ·
`belastbarkeit` rechnet `A × 230` · `geschaltet: p.geschaltet ?? false` · leere Liste statt
„unbekannt" · Namensabgleich als Rückfall in `hausStrecke` · `vonRaumId` als Ort einer Strecke ·
Mangel auf ein unbekanntes Objekt angenommen · `mangelMelden` verändert das übergebene Gebäude ·
`hausForeign` fällt beim Rückweg weg.

### Was als Nächstes ansteht

**Schritt 2 ist gebaut (2026-09-09): `packages/facility-core`.** Das Paket trägt das Modell
(Raum, Anschlusspunkt, Stromkreis, Verteilung/Schaltschrank, Steuerklinke, Hausstrecke, Mangel)
und die sechs Fragen samt Rückweg als reine Funktionen. Es hat noch keinen Aufrufer, und das ist
richtig so: der Vertrag steht vor dem Verbraucher, sonst entsteht er aus dem, was der erste
Aufrufer zufällig braucht.

Zwei Dinge sind im Modell ausdrücklich **nicht** dasselbe wie im Planer, obwohl sie gleich heißen:
der `Stromkreis` des Gebäudes ist nicht der `circuit.ts` der Show (der wird am Abbautag wieder
eingepackt), und der `Anschlusspunkt` fasst Einspeisung und Dose zu einem Typ zusammen, weil der
Plan von beiden dieselben sechs Angaben braucht.

**Schritt 3 ist ebenfalls gegangen (2026-09-09): `larszu/larszu-facility-planner`.** Der Eigentümer
hat das Repo angelegt; `packages/facility-core` ist dorthin umgezogen und in der Suite gelöscht —
ein Paket und ein Repo mit demselben Inhalt wären zwei Wahrheiten gewesen. Dazu gekommen sind ein
Speicher und vier Sichten: Anschlusspunkte, Verteilung, Steuerung, Mängel.

Die Suite bindet es ein wie die anderen: vendorte Kopie unter `apps/larszu-facility-planner`,
Modul „Gebäude" in der Rail (Port 4185, `strictPort`), Drift-Guard, Lizenz-Guard,
Dev-Port-Guard.

**Der ADR-Abgleich ist mit umgezogen, aber nicht ins Werkzeug.** Er liegt jetzt als
`scripts/facility-vertrag-parity.mjs` in der Suite und vergleicht diese Tabelle mit
`apps/larszu-facility-planner/src/domain/vertrag.ts`. Der Grund ist derselbe wie vorher: nur hier
liegen ADR und Code im selben Baum. Eine Abschrift der sechs Namen im Werkzeug wäre die zweite
Wahrheit (ADR-001) — sie driftete von dieser Tabelle weg, und der Test bliebe grün.

**Auf Issue-Ebene abgeschlossen:** `cable#667` ist zu
[`larszu-facility-planner#2`](https://github.com/larszu/larszu-facility-planner/issues/2) umgezogen
und im Planer geschlossen. `cable#665` **bleibt offen und teilt sich**: die Gebäude-Hälfte steht als
[`#1`](https://github.com/larszu/larszu-facility-planner/issues/1) drüben, die Show-Hälfte
(Mehrfachsteckdose, Verteiler, Patchblende) bleibt im Planer. `cable#666` zieht nicht um.

**Was noch nicht hier ist:** Grundriss, Prüfprotokolle nach Norm, Wartungshistorie — und die
Verbindung zum Show-Plan. Der `cable-planner` fragt den Vertrag noch gar nicht ab; bis dahin ist das
Gebäude-Werkzeug für sich benutzbar, aber nicht verbunden.
