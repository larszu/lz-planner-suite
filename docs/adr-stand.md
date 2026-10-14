# Was von den ADRs steht — und was sich widerspricht

**Gemessen am 2026-09-19 am Quelltext, nicht aus dem Gedächtnis.** Entstanden aus zwei Fragen des
Eigentümers: „Wie viel von allen ADRs ist umgesetzt? Und was aus den ADRs widerspricht sich
selbst?"

Ein ADR ist eine Behauptung über den Code und altert genauso. Diese Seite hält die Antwort an
einer Stelle fest, statt sie jedes Mal neu zusammenzusuchen.

## Der Stand, ADR für ADR

| ADR | Stand | Gemessen an |
| --- | --- | --- |
| **001** Identitäts-Spine | **teilweise** | `lib/portLabel.ts` gibt Herkunft im Rückgabewert zurück (`provenance`), und die vier Umgeher aus dem ADR rufen ihn: `installerLists`, `cableLabel`, `exportDevicePdf`. **Innerhalb** des Cable-Planers erfüllt. **Zwischen** den Planern gebrochen — siehe Widerspruch B |
| **002** Geräte-Identität Plan ↔ Lager | **umgesetzt, Eigentumsregel gebrochen** | `InventoryItem.deviceTypeId` steht in `@avplan/inventory-core` (portable v2). Die Eigentumstabelle hält nicht — siehe Widerspruch A |
| **003** Bestätigter Zustand | **umgesetzt** | `types/provenance.ts`, `types/labour.ts`; die drei Herkünfte `planned`/`commanded`/`confirmed` stehen im Typ, nicht in einem Kommentar |
| **004** Dokument-Stempel | **umgesetzt** | `stamp:check` in drei Repos, `stamp:parity` als CI-Gate der Suite |
| **005** Verlustfrei oder laut | **umgesetzt** | R1: `CablePlannerProject.avForeign` hält fremde Slots in der DATEI. R3: `unrepresented`/`unresolved` in `sourceMap.ts` und `graphml/semantics.ts`. R4: `tests/avplan.test.ts` und `tests/avplanUnknownSlots.test.ts` halten die Zusage; `light-planner` fährt `avplan:check` |
| **006** Werkzeug-Schnitt | **teilweise** | Lager (`inventory-planner`) und Gebäude (`larszu-facility-planner`) sind ausgelagert, Ladeplanung nach ADR-010 entschieden und gebaut. **Crew & Geld nicht:** sieben Module liegen weiter in `cable-planner/src/renderer/lib` (`crewBilling`, `crewCalendar`, `crewNetworkSheet`, `labourCost`, `costComparison`, `receiptChain`, `receiptRead`). **Gerätekataloge:** vertagt, Bedingung längst erfüllt, nie wieder angefasst — Widerspruch A |
| **007** Oberflächen-Regeln | **geändert 2026-10-13; Paket und Shell umgesetzt, Planer ziehen nach** | Neue Fassung (neutrale Flächen, Blau nur als Akzent, Hell + Dunkel mit Umschalter, Rundung/Schatten nur über Tokens): `packages/ui/src/brand.ts` (`PALETTE_LIGHT`/`PALETTE_DARK`), `styles.css`, `ThemeSwitch.tsx`, `test/brand.test.ts`; die Shell nutzt sie. Die vendorierten Planer tragen bis zum nächsten Vendoring noch die Fassung vom 2026-09-07. `ci:complete` läuft seit 2026-09-19 überall — Widerspruch E behoben |
| **008** B4-Objektivsteuerung, Ablage | **entschieden, nicht gebaut** | `sony-camera-bridge/packages/` hat `firmware`, nicht `firmware-b4`; kein Lens-Backend unter `packages/bridge/src/cameras/`. Das Quellmaterial liegt wie entschieden in `docs/b4/` |
| **009** ESP-IDF als Laufzeit | **entschieden, nicht gebaut** | Sagt selbst: „Es gibt noch keine Firmware." Die Mitentscheidung zur CI („zunächst nicht") ist eingehalten |
| **010** Ladeplanung im Lager | **umgesetzt** | Modul des `inventory-planner`, einschließlich Fahrzeug-Stammdaten und 3D-Laderaum |
| **011** Ein universelles Gerät | **Stufe 1 von 4** | `packages/ui/src/geraet.ts`; die drei Listen im Seed sind Sichten. Stufen 2–4 stehen im ADR |

**Summe:** fünf ganz umgesetzt (003, 004, 005, 010, und 002 bis auf die Eigentumsregel), vier
teilweise (001, 006, 007 — Planer-Umstellung 2026-10 läuft —, 011), zwei entschieden und bewusst noch nicht gebaut (008, 009).

## Die Widersprüche

### A · ADR-002 gibt dem Katalog das Datenblatt — es gibt aber drei Kataloge

ADR-002 führt eine Eigentumstabelle, und ihre erste Zeile lautet: **„Gerätetyp (Katalog) besitzt
das Datenblatt: Ports, Maße, Leistung, Hersteller, Modellname."** Genau ein Eigentümer, das ist
der Sinn der Tabelle.

ADR-006 vertagt den gemeinsamen Katalog mit einer Bedingung: *„Gerätekataloge — bleibt Kern,
langfristig Paket; ein eigenes Repo lohnt erst, wenn ein zweiter Planer sie schreibt statt nur
liest."* Die Bedingung unterstellt, dass die anderen Planer den Katalog des Cable-Planers **lesen**.
Das tun sie nicht und taten sie nie — sie haben eigene gebaut.

Gemessen: `multicam-planner/src/data/cameras.ts` führt **377 Kameramodelle** mit
Datenblatt-Links. Davon tragen **9** eine `deviceTypeId`, die auch im Katalog des Cable-Planers
steht (dort 20 GUIDs auf 23 Einträge). **368 von 377 Kameramodellen der Suite haben im
Cable-Planer keine Identität.** Das Feld, dem ADR-002 genau einen Eigentümer zuweist, hat drei.

Die Vertagung war also nie eine Vertagung, sondern eine Beschreibung eines Zustands, der schon
gegen ADR-002 stand.

**Seit 2026-09-19 gebaut:** `@avplan/device-catalog` führt die Identität eines Modells (Id,
Hersteller, Modell, Kategorie, Datenblatt) für alle Planer. Die fachlichen Fakten bleiben bei dem
Planer, der sie versteht — ein Paket, das Ports führte, zöge den halben Kabelgraph mit und wäre
der Cable-Planer mit anderem Namen.

Beide Quellen sind drin und werden **erzeugt** (`npm run katalog:erzeugen`): 467 Einträge aus den
19 Katalogen des Cable-Planers, 377 Kameramodelle aus der Kameraliste. `katalog:parity` ist als
CI-Gate die Zusicherung, dass sie es bleiben — wer eine Kamera ergänzt und das Erzeugen vergisst,
wird rot.

Was das Zusammenführen dabei zutage gefördert hat, ist selbst ein Befund: **neun echte
Widersprüche** zwischen den beiden Katalogen. Fünfmal nennen sie verschiedene Herstellerseiten für
dasselbe Gerät (US gegen Europa/Asien), viermal heißt dasselbe Modell verschieden („Canon EOS C70"
gegen „C70"). Sie werden **gemeldet und nicht entschieden** — ein Mensch sagt, welche Seite gilt.
Zwölf weitere Meldungen waren keine: „Sony PMW-F5" in einem Feld gegen `manufacturer` + `model`
getrennt ist dieselbe Angabe in zwei Auflösungen, und ADR-005 Regel 2 entscheidet sie ohne Befund.

Der Licht-Planer ist seit demselben Tag drin: 84 Leuchtenmodelle. Seine Fixture-Bibliothek führt
den Herstellerlink als `datasheetUrl` am Profil; 74 von 84 tragen einen (light#132, #133), 10 nicht.
Katalogweit sind 34 Typen ohne Datenblatt. Die Zahlen stehen im Test, damit sie jemand senken
kann.

**Stand: 916 Gerätetypen**, eine Id je Modell. Der Cable-Planer bietet sie zur Auswahl an; was er
nicht als Datenblatt führt, wird als solches benannt („Modell bekannt, Anschlüsse nicht") und
kommt mit `portsUnknown` in den Plan statt mit erfundenen Ports.

Offen: die Planer schreiben ihre Typen noch selbst — MultiCam und Licht lesen den gemeinsamen
Katalog noch nicht zurück.

### B · ADR-001 galt im Planer und nicht dazwischen

ADR-001, erster Absatz: *„Jedes reale Ding bekommt genau einen Datensatz […], nie eine zweite
Wahrheit."* Gebaut wurde das **innerhalb** des Cable-Planers — Quellen-Identität, Port-Labels,
Herkunft im Rückgabewert. **Zwischen** den Planern führte der `suite-seed` drei Listen, und die
Kamera `cam2` und ihr Knoten `n_cam2` waren zwei Datensätze für dasselbe Blech.

Kein Widerspruch zwischen zwei ADRs, sondern zwischen einem ADR und dem eigenen Bau — und er hat
drei Wochen gehalten, weil nichts ihn gemessen hat. ADR-011 hat ihn abgeräumt — alle vier Stufen
gebaut am 2026-09-19: es gibt eine Liste, und ein Plan ist ein Filter darauf.

### C · „Deklariert, nie geraten" gegen „der Nutzer ordnet zu" — aufgelöst, aber stolperfähig

ADR-002 verlangt, dass eine Zuordnung **deklariert** und nie geraten wird. ADR-011 lässt die vom
Nutzer gesetzte Kategorie ein Gerät den Plänen zuordnen. Das sieht aus wie ein Widerspruch und ist
keiner: verboten ist das **Raten**. Aus „Kamera 1" auf eine Kamera zu schließen ist geraten; dass
jemand „Licht" angekreuzt hat, ist gesagt. Der Unterschied steht in ADR-011 ausgeschrieben, weil
der nächste Leser sonst genau hier das Falsche schließt.

### D · ADR-006 widersprach sich selbst — und ist das Muster, wie man es behebt

Zwei Zeilen derselben Tabelle sagten Gegenteiliges über die Stromplanung: die eine schob sie ins
ausgelagerte Gebäude-Werkzeug, die andere hielt sie im Kern. Aufgelöst wurde das **in der Datei
selbst**, mit einem eigenen Abschnitt, der die Grenze benennt (Lebenszyklus und Zugehörigkeit,
nicht das Wort „Strom") und ausdrücklich sagt, welche Zeile die andere korrigiert.

Das ist die Form, in der ein Widerspruch hier behoben gehört: nicht durch stilles Löschen der
älteren Zeile, sondern durch einen Absatz, der beide stehen lässt und sagt, warum.

### E · ADR-007 hat einen Wächter, der nicht überall läuft

ADR-007 baut auf „eine Quelle, drei Fassungen, ein Test dazwischen". Der Test ist da. Was fehlt,
ist die Zusicherung, dass er **gefahren** wird: `ci:complete` — der Wächter, der prüft, dass jeder
`*:check` auch in einem CI-Schritt steht — existierte nur in `light-planner` und in der Suite.
In `multicam-planner` war `slider:check` grün und griff in keinem CI-Schritt.

**Behoben am 2026-09-19:** der Wächter steht jetzt in allen sechs Repos, und `slider:check` ist
ein eigener Schritt. Er hat damit als Erstes den Fall gemeldet, für den er gebaut wurde.

Das ist der Satz aus dem Repo selbst, gegen das Repo gewendet: *„Ein Guard, den niemand fährt, ist
keine Zusicherung, sondern eine Notiz."*

### F · ADR-005 Regel 2 gehört in ADR-011 zitiert

ADR-005 Regel 2: *„Eine Projektion darf den vollen Stand nicht überschreiben. Wo dieselbe
Information in zwei Auflösungen in derselben Datei liegt, gewinnt die höhere."*

Genau diese Lage stellte ADR-011 Stufe 1 her: `geraete` (die hohe Auflösung) und die drei Sichten
(die niedrige) standen im selben Seed. Im Sinn stimmte es überein — die Sichten wurden abgeleitet.
Aber ADR-011 nannte die Regel nicht, und sie ist die, die entscheiden muss, sobald ein Planer eine
Sicht zurückschreibt.

**Mit Stufe 4 ist die Lage weg statt geregelt** (2026-09-19): es gibt im Seed nur noch die hohe
Auflösung, und die Sichten sind Filter, die niemand zurückschreiben kann. Die Fußnote bleibt
trotzdem fällig — nicht für diesen Fall, sondern für den nächsten, der zwei Auflösungen in eine
Datei legt.

## Was daraus folgt

1. **A ist erledigt** (2026-09-19, ADR-012). Das Paket steht, alle vier Listen sind darin — 467
   Cable-Einträge, 377 Kameras, 835 Objektive, 84 Leuchten, zusammen 1751 Typen —, und die
   Planer LESEN es: `SeedGeraet.typId` trägt die Identität durch den Seed, `Geraetetyp.refs` die
   Rückrichtung. Der Namensvergleich steht nur noch unter der Id, für Geräte aus keinem Katalog.
2. **B** ist erledigt (ADR-011, alle vier Stufen gebaut am 2026-09-19).
3. **E** ist erledigt (2026-09-19): `ci:complete` steht jetzt auch in cable-, multicam-,
   inventory- und facility-planner. Im `multicam-planner` hat er sofort geliefert, wofür er
   gebaut ist — `slider:check` stand seit sieben Tagen in package.json und lief bei keinem Merge.
4. **C** und **F** sind erledigt (2026-09-19), nach dem Muster von **D**: ADR-002 hat einen
   Abschnitt „Was ‚geraten' heisst — und was nicht" samt Probe, ADR-011 zitiert ADR-005 Regel 2
   und sagt dazu, dass Stufe 4 die Lage abgeräumt hat und die Fussnote trotzdem stehen bleibt.
5. **Crew & Geld** (ADR-006): Schritte 1 und 2 gebaut am 2026-09-19 — der Vertrag steht in
   ADR-006, das Paket `@avplan/crew-core` steht, der Cable-Planer bezieht die Domäne von dort.
   Schritt 3 (eigenes Repo) ist offen und jetzt als **B-84** geführt statt nur hier. Ein Vorhaben,
   das nur in der Fußzeile eines Audits steht, fällt beim nächsten Aufräumen heraus.
