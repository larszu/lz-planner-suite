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
| **Festinstallation & Elektro** (Issues #665, #666, #667) | **eigenes Werkzeug, noch nicht gebaut** | Schaltschränke, UP-/AP-Dosen, Wechselschaltungen mit Logikprüfung, KNX/DALI/Crestron. Andere Norm, andere Rolle, anderer Lebenszyklus (Jahre statt Tage). Diese drei Issues **nicht** in den Cable-Planner bauen — sie wären genau der Zuwachs, der die Basisfunktionen verdeckt. |
| Funk & Audio | **bleibt vorerst Kern** | Der Spektrum-Plan liest die Sender aus dem Kabelgraph (Bedarf 95). Eine Trennung bräuchte zuerst eine Sender-Schnittstelle; danach ist es ein Kandidat. |
| Rentman/NetBox/Lexware | **bleibt Kern** | Dünne Adapter, keine eigene Domäne. |

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

### Was als Nächstes ansteht

Schritt 3: `src/renderer/lager/` wird ein eigenes Repo, die Suite bindet es wie die anderen Planer
ein, `scripts/planner-drift.mjs` bekommt seine Wurzel dazu. Der Schnitt selbst ist damit ein
Ordner, den man heraushebt — kein Umbau mehr.

**Was ausdrücklich nicht passiert:** kein „großer Wurf" in einem Schritt. Jeder Bereich wird
einzeln geschnitten, mit grünem CI dazwischen. Der Cable-Planner bleibt in jedem Zwischenstand
lauffähig — er ist das Werkzeug, mit dem gearbeitet wird, nicht ein Umbauprojekt.
