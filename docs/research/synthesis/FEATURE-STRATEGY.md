# AV Planner feature strategy

Derived from the research corpus per section 29. Inputs: `AV-INDUSTRY-SOFTWARE-LANDSCAPE.md`
(all 16 segments), `USER-NEED-DATABASE.md` (150 needs, 11 professions),
`COMPETITOR-PAIN-SYNTHESIS.md` (224 competitor pain points, 16 segments), `FEATURE-MATRIX.md`,
and `../repos/INVENTORY.md` (the eight existing repositories, read from source).

Read `../METHOD.md` for what the research could and could not verify.

## 1. The strategic position

> **The market has excellent runtimes and no design-time layer. AV Planner is the design-time
> layer, and the identity spine that the runtimes render.**

This is not a slogan chosen for it; it is what six independent segment researchers and eight
independent role researchers converged on without seeing each other's work. The market evidence
says no product specifies a show. The user evidence says the cost of that absence is identity
retyped into five to eight systems, every show, by every department.

Section 27 asks where the competitive advantage comes from. The answer the research gives is
sharper than "integration": **we are the only participant that can own the plan, because the
runtimes structurally cannot.** A switcher knows its own inputs. A rental ERP knows its own
assets. Neither can hold the sentence *"camera 4 is an FX6 at position SL-2, on SMPTE drum 12,
into frame input 7, tally TSL address 4, MV window 6, comms channel C, operated by Anna."*
That sentence is the product.

## 2. Prioritisation model

Section 26 defines seven factors. `USER-NEED-DATABASE.md` scores the two measurable ones
(frequency, time saving) mechanically. The remaining five are judgements and are applied here in
the open, each 1–5.

| Factor | What it asks |
| --- | --- |
| **UV** User value | How hard a real problem does it solve? |
| **FR** Frequency | How often does the problem occur? (from the need DB) |
| **TS** Time saving | How much time does it return? (from the need DB) |
| **ER** Error reduction | How many live-show errors does it prevent? |
| **AV** AV relevance | How specific is it to AV/broadcast — i.e. how safe from generic competitors? |
| **IV** Integration value | How many other modules benefit? |
| **CX** Complexity | Build cost. **Subtracted.** |

Score = `UV + FR + TS + ER + AV + IV - CX`.

## 3. The roadmap

| # | Initiative | UV | FR | TS | ER | AV | IV | CX | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **0** | **Consolidate the fork** (enabling, not a feature) | 4 | 5 | 3 | 5 | 1 | 5 | 3 | **20** |
| **1** | **Source identity spine + label projection** | 5 | 5 | 5 | 5 | 5 | 5 | 3 | **27** |
| **2** | **Tally map generated from the plan** | 5 | 4 | 3 | 5 | 5 | 4 | 2 | **24** |
| **3** | **BOM / pick list derived from the technical plan** | 5 | 5 | 5 | 4 | 4 | 5 | 4 | **24** |
| **4** | **Version-stamped print + paper return path** | 4 | 5 | 3 | 4 | 4 | 4 | 2 | **22** |
| **5** | **Change-impact view ("what does this invalidate")** | 5 | 4 | 4 | 5 | 4 | 5 | 5 | **22** |
| **6** | **Intercom plan as data, with vendor export** | 4 | 3 | 3 | 4 | 5 | 4 | 3 | **20** |
| **7** | **Return path: plan vs as-built reconciliation** | 5 | 4 | 4 | 4 | 4 | 5 | 6 | **20** |
| **8** | **Network/IP plan from the same device records** | 4 | 3 | 4 | 4 | 4 | 4 | 4 | **19** |
| **9** | **Delivery/streaming chain as signal flow** | 4 | 3 | 3 | 4 | 4 | 3 | 3 | **18** |
| **10** | **Confirmed-state discipline across every module** | 5 | 4 | 2 | 5 | 5 | 5 | 3 | **23** |
| **11** | **Public device-capability registry** | 4 | 4 | 3 | 4 | 5 | 5 | 3 | **22** |

## 3b. Wo die Roadmap wirklich steht (gemessen, 2026-09-03)

Abschnitt 25 macht dieses Papier zum lebenden Dokument und verlangt Neu-Ableitung statt Flickwerk.
Die Tabelle oben ist die ursprüngliche Ableitung und bleibt als solche stehen; dieser Abschnitt
sagt, was davon heute im Code steht. **Aus dem Quellcode gelesen, nicht aus Commit-Titeln** — die
Prosa unten war an mehreren Stellen älter als das Repository.

| # | Initiative | Score | Stand | Belegt durch |
| --- | --- | --- | --- | --- |
| 0 | Fork konsolidieren | 20 | **teilweise** | Drift von 56/72/26 auf **18/19/17** gesenkt (cable/multicam/light, Stand `scripts/planner-drift-baseline.json`), CI-bewacht (`scripts/planner-drift.mjs`). **Die Zahlen hier veralten bei jedem Vendor-Schritt** — massgeblich ist die Baseline-Datei, nicht diese Zeile. Die Suite vendort weiterhin Kopien — verwaltet, nicht konsolidiert |
| 1 | Identitäts-Spine + Label-Projektion | 27 | **fertig** (nachgemessen 2026-09-06) | Gebaut und erreichbar: `SourceIdentity` als Rolle neben den Geräten, CRUD-Slice, Migration in `healProjectPositions`, Eigenschaften-Sektion an jedem Gerät, `LabelTargetSpec` mit fünf Zeichenbudgets, Kollisions-Befunde im Plan-Check, `.avsourcemap` mit Provenienz, Tally-Tab. **Die beiden in Runde 10 benannten Hälften sind beide zu.** (a) Der Router-Durchgang steht: `feedingInput` liest den persistierten Kreuzpunkt (`device.videohubRouting?.planned`) und läuft durch den Videohub hindurch, statt an ihm abzubrechen — Kamera→Videohub→ATEM löst damit die Kamera auf, nicht den Router. (b) Die Rolle besitzt die beiden Zielsysteme: `exportVideohub` nimmt `roleLabels` aus `roleLabelsByPort` (elf Fundstellen, `cable#682`/B-28), und `AtemDialog` baut Lang- und Kurznamen aus derselben Karte, bevor `shortenForAtem` zuschneidet. Ein Rename ändert damit ATEM- und Videohub-Text, nicht nur UMD, `.avsourcemap` und Tally-CSV. **Was offen bleibt, ist bewusst offen:** ISO-Präfix und Comms-Kanal warten auf ein belegtes Zielsystem in `labelTargets.ts` — Regel *kein Anker ohne Ziel-Spec* |
| 2 | Tally-Map aus dem Plan | 24 | **fertig** (nachgemessen 2026-09-06) | `lib/tallyMap.ts` (`buildTallyMap`, `tallyMapCsv`, `toTallyPiDevices`) ist gebaut, erreichbar über den Export-Dialog und getestet. Die drei in Runde 10 benannten Mängel sind alle behoben: der Wertebereich der Rollen-Id (`cable#674` — die 36-stellige `uuidv4()` fiel gegen `^[A-Za-z0-9_-]{1,32}$` in `guide_server.py:310`, und tally-pi wies die ganze Datei zurück), der fehlende Transport (`suite#99` — die Karte geht per `POST /tally-config` aus dem Main-Prozess an den Pi, mit Abgleich neu/geändert/entfällt davor), und die falsche Eingangsnummer bei Kamera→Videohub→ATEM: `switcherLinkFor` nimmt jetzt nur MISCHER-Senken und in deterministischer Reihenfolge, wo vorher zwei Kopien eines `sources.find()` den ersten besten Router-Eingang griffen. Gibt es keinen Mischer-Link, steht **keine** Zahl da — eine erfundene Pin-Nummer schaltet die falsche Lampe |
| 3 | Stückliste / Kommissionier-Liste | 24 | **fertig** | `lib/planBom.ts` (ADR-002 Inkrement 4) |
| 4 | Gestempelter Druck + Papier-Rückweg | 22 | **teilweise** (berichtigt Runde 10) | ADR-004 Inkremente 1/2 sind gebaut und erreichbar: `lib/documentStamp.ts` stempelt alle sechs Installateur-Dokumente, das Plan-PDF trägt Revision, Stand-Zeile und Dokument-QR, der Rückweg ist beidseitig verdrahtet (QR-Scan **und** acht abgetippte Zeichen im Mobile-Viewer), dazu das Dokument-Register (`#644`) und `checkState` im Fingerabdruck (`#654`); 63 Tests. **Der namensgebende Fall fehlte:** `handlePrintPdf` und der Rentman-Anhang gingen durch denselben Builder **ohne** Stempel — das gedruckte Blatt zeigte ein nacktes „Rev 2" ohne Stand und ohne QR, also genau die falsche Gewissheit, gegen die ADR-004 geschrieben wurde. Die Initiative heißt „gestempelter **Druck**", und der Weg, der „Drucken" heißt, war der eine ohne Stempel. **Behoben in `cable#673`**, samt Guard über alle Aufrufstellen. **Inkrement 4 ist gebaut** (`light#70`, `multicam#91`): der light-planner stempelt alle vier Ausdrucke (Instrument Schedule, Geraeteliste, Farbliste, Plan-PDF) und rechnet die Abweichung gegen den juengsten Versions-Schnappschuss; der multicam-planner stempelt Kamerakarte und Storyboard (PNG wie Druck) und nennt bewusst keine Revision, weil `projectVersion` Aenderungen zaehlt statt Staende festzuschreiben. Die drei Kopien der Ableitung haelt `stamp:parity` in der Suite gegeneinander — ausgefuehrt, nicht textverglichen. **Inkrement 3 ist ebenfalls gebaut** (`cable#702`), aber anders als geplant: der Dokument-Code steht als **Text** in der Fussnote aller fuenf CSV-Listen und im Uebergabe-Dokument, nicht als QR. Ein CSV traegt kein Bild, und der Listen-Ausdruck entsteht aus Excel — jeder dort erzeugte QR ueberlebte den Weg nicht. Damit sind **alle vier Inkremente von ADR-004 erledigt** |
| 10 | Confirmed-State-Disziplin | 23 | **teilweise, alle bekannten Fälle geschlossen** | Nachgezählt 2026-09-03, Zahlen aus dem Quelltext statt aus der Erinnerung. **Zwei Sorten, zwei Register, beide gerechnet statt aufgezählt:** `deviceReadSites` führt 5 Stellen, an denen ein Geräte-Befund den Plan berührt (3 getrennt, 1 additiv, 1 liest-nur); `aiWriteSites` führt 4, an denen eine Maschine Werte erfindet (3 markiert, 1 mit Mensch dazwischen, keine ungedeckt). `specSource` in allen drei Planern, gehalten vom Suite-Guard `spec-source-vocabulary.mjs` (3 Feld-, 2 Helfer-Kopien, in CI). Dazu `sony#10` im Companion-Modul. **Warum nicht „fertig":** siehe Abschnitt 3c — jede der sechs Messrunden fand eine Schicht, die die vorige nicht kannte |
| 11 | Öffentliche Capability-Registry | 22 | **teilweise** | `lib/deviceTypeRegistry.ts` löst Typ-GUIDs intern auf; `INITIATIVE-11-SCOPING.md` hat den fehlenden Teil bestimmt: nicht die Registry, sondern die **Form des Belegs** (253 `// Quelle:`-Kommentare, kein `provenance`-Feld). **Beide dort genannten Blocker sind weg**, und der mechanische Schritt ist getan: die 253 Links stehen als `manufacturerUrl` im Katalog (`cable#649`), und die Eigenschaften-Leiste zeigt den **geerbten** Link mit genannter Herkunft — ohne die zweite Hälfte hätte der Nutzer nichts davon gesehen, weil der `DeviceTypePicker` keine Template-Felder kopiert. Offen bleibt die Publikation selbst — und die Kataloge ohne Beleg, aber **nicht acht, sondern sechs** (3c, Runde 9). Von den 17 `*Catalog.ts` fuehren 8 kein `manufacturerUrl`; zwei davon koennen keins fuehren: `connectorCatalog` haelt Stecker*typen* mit Symbol, `wirelessCatalog` haelt `WirelessDevice` (Handsender-Bodies, Kapseln, Headsets) — beide Typen haben das Feld gar nicht, es sitzt an `EquipmentTemplate` (`equipment.ts:509`). Sie standen nur deshalb in der Liste, weil gezaehlt wurde, was auf `Catalog.ts` endet. Echte Recherche brauchen: `blackmagic`, `camera`, `greengo`, `misc`, `monitor`, `ubiquiti` |
| 5 | Change-Impact-Sicht | 22 | **fertig** | `lib/changeImpact.ts` (`#638`), `lib/planDiff.ts` + Vergleichs-Dialog (`#639`) und das **Register der ausgegebenen Dokumente** (`#644`). Die Vorwärts-Frage ist damit vollständig: welches ausgeteilte Blatt ist hin |
| 6 | Intercom-Plan als Daten | 20 | **teilweise** | `exportGreengo`/`importGreengo`/`intercomMatrixXlsx`; `#632`/`#633` schärften den Round-Trip. **`#645` sagte „verlustfrei" und war es nicht** — `ButtonFunctions` wurde bei jedem Export neu erfunden, also genau die Tastenbelegung der Beltpacks; berichtigt in `#653` (3c, Runde 7). Ein **herstellerneutrales** Austauschformat fehlt weiter — genau die Lücke, die das Segment-Dossier als „no interchange format from anyone" führt |
| 7 | Rückweg: Plan gegen As-built | 20 | **teilweise** | `lib/handoverPackage.ts` baut das As-built-/Closeout-Paket. **Korrektur (3c, Runde 9):** „der Abgleich fehlt" stimmt so nicht mehr. Fuer den Geraetezustand gibt es ihn: `lib/atemLiveCompare.ts` stellt Plan und Live-Auslesung nebeneinander (`compareAssignments`, genutzt in `AtemAudioRouterDialog` und `AtemMvConfigDialog`). Fuer die Verkabelung gibt es die **Datenspur**, aber keinen Vergleich: `checkState.ports` haelt fest, was vor Ort gesteckt wurde, und seit `cable#654` steht dieser Stand auch im Plan-Fingerabdruck. Was fehlt, ist die Gegenueberstellung **Soll-Kabel gegen gesteckte Ports** — und die haengt an einer offenen Eigentuemer-Frage: wo der As-built-Zustand ueberhaupt wohnt |
| 8 | Netz-/IP-Plan | 19 | **gebaut, bis auf die Vergabe** | `lib/subnet.ts` + IPAM-Uebersicht + NetBox-Import, dazu seit `cable#701` der **abgeleitete Adressplan** (`lib/addressPlan.ts`) und seit `cable#704` das Schema darunter: **mehrere Schnittstellen je Geraet** (Bedarf 19 — Dante primaer/sekundaer, ST 2110 rot/blau, getrennte Steuerung). Die Alt-Felder am Geraet sind Schnittstelle 0, `networkInterfaces` haelt 1..n, und die Engstelle `deviceInterfaces` versteckt die Naht; der Adressplan zaehlt seither **je Schnittstelle**, sodass die Doppel-IP-Pruefung nicht mehr die Haelfte eines redundanten Aufbaus uebersieht. Dazu die erzeugte **Switch-Port-Karte** (Bedarf 24) mit Herkunft je Belegung (gepflegte Schnittstelle vs. verlegtes Kabel) und einem einfuegbaren Beschreibungsblock — **kein** Konfigurationskanal, so verlangt es die Quelle —, und der **Abgleich Plan gegen Vorgefundenes** (Bedarf 21, in der Bedarfs-Datenbank „the highest-value item in the dossier“): Datei statt Live-Feed, Zuordnung ueber MAC → IP → Name mit Beleg, eindeutig oder gar nicht, und die Dante-Kollisionsform als eigener Befund. **Dabei fiel ein ausgelieferter Fehler auf:** `NETWORK_CONNECTORS` fuehrte `'RJ45'`/`'etherCON'` — beides existiert in `ConnectorType` nicht, der Anschluss-Rueckfall traf also nie ein echtes Geraet, und die Tests trugen ein Fixture mit demselben Phantasiewert. **Offen bleibt bewusst das Vergeben:** woher Subnetze kommen, ist E-5 |
| 9 | Delivery-/Streaming-Kette | 18 | **fertig, bis auf das CDN** | Die Contribution-Haelfte stand schon (NDI, Dante, AES67, ST 2110 mit Bandbreite und Impedanz, Netz-Budget, ST-2110-ohne-PTP, Impedanz-Bruch, passive Laengengrenze). Die Delivery-Haelfte ist mit `cable#703` gebaut: **die Ausspielung als Datenobjekt** (`types/delivery.ts`) — Plattform, Transport, Ingest, Encoding, Ausweichweg. Die **Paritaetspruefung** haelt die sechs Felder gegeneinander, die YouTube und Castr als identisch verlangen (Aufloesung, Video-Codec, Bitrate, Bildrate, Keyframe-Abstand, Audio-Abtastrate) — driften sie auseinander, bricht der Failover. Der **Transport-Rechner** gibt Formel UND Fundstelle neben jeder Zahl und **beide** Lesarten der SRT-Latenz, weil die Quellen sich widersprechen (3–4× RTT gegen feste 1.500–2.500 ms; bei 20 ms RTT Faktor 19). **Der Stream-Key steht in keinem Projekt** — er liegt via `keytar` unter `stream-key:<id>`, und das Haekchen „hinterlegt“ wird beim Laden nachgefragt statt geglaubt. **Offen bleibt genau ein Stueck:** das CDN als Topologie-Objekt. Die Kette endet am Uplink |

**Was das für die Reihenfolge heißt.** Keine Initiative mit Score ≥ 22 ist mehr vollständig offen.
**5 (Change-Impact)** war es bis zu diesem Stand und ist als Erstes gebaut worden — Inkrement 1
steht. Ihr zweiter Teil hat dabei die Annahme dieses Abschnitts widerlegt: sie hängt eben doch an
einer Eigentümer-Entscheidung. Die Vorwärts-Frage über zwei *gegebene* Stände ist ableitbar; die
nützlichere Frage — „welche der zwölf ausgedruckten Listen sind jetzt hin" — braucht ein Register
der ausgegebenen Dokumente, und **das führt heute nichts** (`INITIATIVE-5-SCOPING.md` nennt die
vier Fragen, drei davon ändern das Dateiformat).

Damit ist die Tabelle in einem Zustand, den sie vorher nicht hatte: **jede verbleibende Lücke mit
Score ≥ 20 ist entweder geparkt oder ein Teilstück** (6, 7, 8, 10, 11), und **vollständig offen ist
keine einzige mehr** — auch Initiative 9 nicht, die als letztes freies Feld galt, bis sie
nachgemessen wurde (3c, Runde 9). Der eine Rest aus 5, der ohne jede Entscheidung ging — der
Datei-gegen-Datei-Vergleich, kein Store, kein Format-Feld, kein Register — ist mit `#639` gebaut.

**Was beim Eigentümer lag — und was er entschieden hat (2026-09-03).** Alle sieben Fragen sind
beantwortet; keine Initiative wartet mehr auf eine Entscheidung, nur noch auf Bau.

| # | Frage | Entscheidung | Stand |
| --- | --- | --- | --- |
| 1 | Green-GO Generator oder Editor | **beides** — vorhandenes Preset laden und fortschreiben, sonst aus dem Plan erzeugen | **gebaut** — `cable#645` |
| 2 | Modell- vs. Instanz-Felder | **Modell-Eigenschaften hängen immer am Gerät**, in jedem Plan, ob die Anwendung sie abfragt oder nicht | **gebaut** — `cable#646` |
| 3 | ADR-003 Inkrement 2 | **ja, bauen** | **gebaut** — `cable#643` |
| 4 | `.avplan` und unbekannte Slots | **laden, fragen, belegen lassen** | **gebaut** — `cable#641`, `light#52`, `multicam#87` |
| 5 | Zugangsdaten in geteilten Vorlagen | **beim Export fragen** | **gebaut** — `cable#642` |
| 6 | Register der ausgegebenen Dokumente | **getrennte Protokolldatei + einsehbares Log im Menü** | **gebaut** — `cable#644` |
| 7 | Zugangsdaten in `.avplan` | mit 5 zusammen beantwortet | **gebaut** — `cable#642` |

Die Begründungen stehen dort, wo die Fragen gestellt wurden:
`../../decisions/ADR-005-lossless-or-loud.md`, `CREDENTIALS-IN-TEMPLATES.md`,
`INITIATIVE-5-SCOPING.md`.

**Alle sieben sind entschieden UND gebaut.** Damit ist zum ersten Mal seit dem Anlegen dieses
Papiers **keine Initiative durch eine offene Frage blockiert.** Was bleibt, ist Arbeit.

### 3f. Was gebaut ist, ohne je eine Initiative gewesen zu sein (2026-09-06)

Die Tabelle in 3b fuehrt zwoelf Initiativen. Die Bedarfs-Datenbank fuehrt 145 Bedarfe, und
**der Backlog-Eintrag B-34 hat schon einmal darauf hingewiesen**, dass ein Bedarf ohne
Initiative in dieser Tabelle gar nicht auftaucht — „das ist eine Eigenschaft der Tabelle,
nicht des Bedarfs".

Genau derselbe blinde Fleck wirkt jetzt in die andere Richtung: seit dem 2026-09-06 sind
mehrere P1-Bedarfe **gebaut**, die keiner Initiative zugeordnet waren. Ohne diese Liste
staende in der Roadmap weiter nichts davon, und der naechste Leser baute sie noch einmal.

| Bedarf | Was er verlangte | Gebaut in |
| --- | --- | --- |
| 2 · 75 · 91 | „opening last year's file as this year's starting point" — Vorlagen | `suite#105` |
| 19 | 2–4 NICs je Geraet statt einer IP-Spalte; **„expensive to fix later"** | `cable#704` |
| 21 | Plan gegen Vorgefundenes — „the highest-value item in the dossier" | `cable#704` |
| 22 | Netz-Dokumente aus EINEM Modell: Rack-Tuer-Blatt, VLAN-Tabelle | `cable#705` |
| 23 | Haus-IT-Anforderungsblatt — „the role's most-cited organisational blocker" | `cable#705` |
| 24 | Switch-Port-Karte erzeugt statt gepflegt; **kein** Konfigurationskanal | `cable#704` |
| 30 · 31 · 34 | Ziel-Register, Primaer/Backup-Paritaet, Transport-Rechner mit Quelle | `cable#703` |
| 37 | Eine Kanalliste, fuenf Sichten — „PROJECTIONS, NOT MORE FIELDS" | `cable#706` |
| 38 | Stage-Plot als Ein-Seiten-Lieferung mit Eingangsliste darauf | `cable#706` |
| 12 | Sichtlinien-Konflikte im Plan statt in der Probe — „cheap geometry, prevents a re-rig" | `multicam#92` |
| 14 | PTZ-Presets als Dokument statt Geraetespeicher: Nummer → Shot → Segment | `multicam#92` |
| 15 | Den Container ausgeben, nicht den Artikel — „a good half hour of repetitive clicking" | `cable#707` |
| 33 | Ablaufblatt fuer den Showtag, Stream-Key als VERWEIS („secrets as references") | `cable#707` |
| 36 | Encoder-Machbarkeit aus belegten Herstellerangaben statt aus Erfahrung | `cable#707` |
| 13 | Geschätzte Längen tragen ihre Herkunft; ein SMPTE-Strang trägt fünf Dienste | `cable#708` |
| 16 | Der Ausgabeschein trägt Etiketten-Codes statt interner IDs — „scannable back in" | `cable#709` |
| 17 | Kabel und die vom Plan verlangten Adapter in DERSELBEN Bedarfsliste | `cable#709` |
| 26 | Die vergessenen Blätter (Tally, Port-Karte, MV-Layout) stehen in der Impact-Liste | `cable#709` |
| 27 | Der Rückweg vom Papier: „gilt dieses Blatt noch?" — war gebaut und unerreichbar | `cable#709` |
| 28 | Plan gegen ERP-Reservierung, in BEIDE Richtungen — „the valuable increment is the diff" | `cable#709` |
| 32 | Der Ausspielweg: Quelle → Encoder → Transport → Ziel, aus dem Kabelgraph abgeleitet | `cable#710` |
| 29 | Kein stiller Verlust beim CSV-Import — was nicht ankommt, hat einen Namen | `cable#711` |
| 3 | Companion-Tasten aus dem Plan statt „52 times a year" abgetippt | `Broadcast-intercom#10` |
| 5 · 9 | Eine Quellen-Identitaet, viele Zielsysteme — ADR-001 (`sourceIdentity` + `labelDerivation`) | `cable#601`–`#640` |
| 18 | Netz-Facetten AM Geraet statt zweites IP-Modul — „one device, one identity, many facets" | `cable#704` |
| 25 | Die kaufmaennische Stueckliste aus dem technischen Plan (`planBom`, ADR-002 Inkrement 4) | frueher, ohne Bedarfs-Bezug |
| 1 | Der geteilte Plan nennt seinen Stand — „the live document, not a PDF fork" | `cable#712` |
| 65 | Jede Mengen-Operation sagt, was sie ausgelassen hat (P2, „cheapest reliability win") | `cable#713` |
| 69 | Wake-Lock beim Scannen; kein Formular-Absenden (P2) | `cable#714` |
| 80 | „Bestand" ist nicht „verfuegbar" — offene Ausgaben zaehlen mit (P2) | `cable#715` |
| 67 · 82 | Herkunft und Rueckgabedatum bis auf Packliste, Etikett und Ausgabeschein (P2) | `cable#716` · `multicam#93` · `light#71` |
| 68 | Schaden mit Zuordnung — „wo geht immer wieder etwas kaputt", aus dem Beleg abgeleitet (P2) | `cable#717` |
| 66 | Inventur mit „am falschen Ort" als eigenem Ergebnis, nicht als Fehlbestand (P2) | `cable#718` |
| 64 | Die Kommissionier-Liste nennt den Grund der Fehlmenge — „which job holds it" (P2) | `cable#719` |
| 76 | Nachschlagen mitten in der Show — Adresse rein, ganze Antwort raus (P2, `widespread`) | `cable#720` |
| 85 | Die Antwort des Hauses neben der Frage, mit dem Haus dazu (P2, zweite Haelfte) | `cable#720` |
| 70 | Etiketten mit lesbarem Code, acht Geometrien, Tippen als Hauptweg (P2) | frueher gebaut, nachgewiesen |

**Zwei Berichtigungen an dieser Tabelle.** Die Zeile zu `cable#703` fuehrte
„28 · 29 · 34". Gebaut wurden dort das Ziel-Register, die Paritaetspruefung und
der Transport-Rechner — das sind die Bedarfe **30 · 31 · 34**. Bedarf 28 (ERP-Diff)
kam erst mit `cable#709`, Bedarf 29 (stiller Verlust beim Import) erst mit
`cable#711`. Stehengelassen haette die Zeile behauptet, beide seien seit Monaten
erledigt — und der naechste Leser haette sie nicht mehr gesucht.

Die drei Zeilen darunter (5 · 9, 18, 25) sind **nicht neu gebaut**, sondern beim
Durchgehen der offenen P1-Bedarfe als bereits gebaut nachgewiesen worden. Sie
fehlten hier aus demselben Grund, aus dem der Abschnitt ueberhaupt entstanden
ist: sie hatten keine Initiative. Bedarf 5 und 9 verlangen ausdruecklich MEHR
Felder an der Kamera-Identitaet (Basisstation, RCP-Seite, ISO-Kanal); ADR-001
haelt das Schema bewusst klein und loest diese Felder ueber den Kabelgraph auf
statt sie zu speichern — das ist eine getroffene Entscheidung, keine Luecke, und
sie steht in `types/sourceIdentity.ts` begruendet.

**Die P1-Ebene ist damit abgearbeitet.** Von 38 P1-Bedarfen sind 30 gebaut
oder als bereits gebaut nachgewiesen. Die restlichen acht sind KEINE offene
Arbeit, sondern zwei benannte Sperren und eine bewusste Nicht-Entscheidung:
Bedarfe 4, 6, 7, 8, 10 und 11 haengen an der Zeitachse (E-18,
Eigentuemer-Entscheidung), Bedarf 20 an der Subnetz-Vergabe (E-5), und
Bedarf 35 steht unten. Die Arbeit ist seither in die P2-Ebene gewandert;
die letzten fuenf Zeilen der Tabelle oben sind ihre ersten Ergebnisse.

**Bedarf 35 bleibt bewusst ungebaut.** Er verlangt den Sendezustand (Stream auf /
Stream ab) als Vokabel der Show-Control-Oberflaeche — und sagt im selben Atemzug:
„do NOT build a live monitoring dashboard, which would make the suite responsible
for a false all-clear". Die Suite hat keine Telemetrie-Quelle fuer diesen Zustand;
eine zu bauen WAERE das Dashboard, das der Bedarf ausschliesst. Wer ihn spaeter
angeht, braucht zuerst eine belegte Quelle (Encoder-API), nicht eine Anzeige.

**Was diese Runde ueber die Roadmap selbst sagt.** Die zwoelf Initiativen sind eine
Zusammenfassung der Bedarfe, keine Obermenge. Wer nur sie abarbeitet, laesst die Haelfte
dessen liegen, was die Rollen-Berichte als P1 fuehren — und merkt es nicht, weil die Tabelle
schweigt. Wer kuenftig einen Bedarf ohne Initiative baut, traegt ihn hier ein.

### Was die Neu-Ableitung danach ergeben hat

Abschnitt 25 verlangt Neu-Ableitung statt Flickwerk, und die erste nach den sieben Antworten
hat den Stand von Initiative 10 **nicht bestätigt, sondern verschoben**. Die Tabelle führte sie
als „wartet auf Design-Frage 3". Die Frage ist beantwortet und `cable#643` gebaut — aber was
Initiative 10 verlangt, steht eine Ebene höher: *„every displayed value carries provenance
(confirmed by device / last commanded / planned), and the UI must render the difference."*
`cable#643` liefert das Vokabular und zwei erklärte Stellen; `ProvenanceBadge` steht heute an
genau diesen zweien und nirgends sonst — nachgezählt, nicht angenommen.

Die Messung, die daraus folgte, hat die eigentliche Lücke gefunden — und sie lag woanders als
vermutet. Von 18 verschiedenen Lese-Aufrufen an 25 Stellen im Renderer schreiben **drei** ihren Befund in ein persistiertes
Plan-Feld. Einer davon, `VideohubExportDialog`, war in Inkrement 0 bereits geheilt worden und
trug die Begründung im eigenen Kommentar: *„Was der Hub tut, ist eine Beobachtung; was im Plan
steht, eine Absicht."* Die beiden ATEM-Dialoge taten weiter genau das — der Audio-Dialog sogar
ohne jede Rückfrage. Der Multiviewer-Dialog fragte, aber nur bei `sourceId !== 0`: ein bewusst
schwarz geplanter Multiviewer ging still verloren.

Das ist der Marktbefund **in seiner Umkehrung**. Die Segmente verlangen, den echten
Geräte-Zustand zu lesen statt den letzten Befehl anzuzeigen; hier wurde der echte
Geräte-Zustand gelesen und dann zur Absicht erklärt. Beide Richtungen zerstören dieselbe
Unterscheidung, und die zweite ist die leisere.

**Der verbleibende Rest ist damit präzise benennbar**, was er vorher nicht war: die Invariante
gilt als Praxis an vier geprüften Stellen (drei im Renderer, eine im Companion-Modul), nicht als
Regel, die ein neuer Lese-Weg automatisch erbt. Der Guard in `tests/atemLiveCompare.test.ts`
nennt die drei Renderer-Stellen namentlich — er findet keine vierte. Das ist der nächste Schritt
von Initiative 10, und er ist eine Struktur-Frage, keine Feature-Frage.

**Was der Bau an den Entscheidungen selbst gelehrt hat** — dreimal war der eigentliche Befund
nicht die Antwort, sondern etwas, das erst beim Umsetzen sichtbar wurde:

- **Frage 4:** die richtige Antwort war *keine der beiden angebotenen*. Der ADR stellte
  „durchreichen" gegen „ablehnen"; gewählt wurde *bewahren und fragen* — die dritte, die beide
  Regeln zugleich erfüllt.
- **Frage 3:** der Zuschnitt änderte sich durchs Messen. Es sind **zwei** Formen von Provenienz im
  Code, nicht eine, und nur die erste ist das, was ADR-003 meint. Der naheliegende Bau — ein
  Provenienz-Feld je Datensatz — wäre ein zweiter Ort für eine Wahrheit gewesen, die die
  Feldnamen schon tragen. **Keine Schema-Migration nötig.**
- **Fragen 1 und 2:** beide legten einen Fehler frei, den keine Frage gestellt hätte. Einer im
  ersten Umsetzungsversuch (der Editor-Weg baute den Verlust wieder ein, den er beheben sollte),
  einer im Bestand (zwei Rekonstruktionen mit entgegengesetztem Urteil über dieselben Felder).

### 0. Consolidate the fork — do this first, it is cheap and it blocks everything

`../repos/INVENTORY.md` establishes that the suite does not consume the planners; it contains
vendored copies, and **those copies have already diverged substantially in both directions.**
Measured at the time of writing: 56 divergent paths in cable-planner, 72 in multicam-planner, 26 in
light-planner. The suite's cable-planner has no NetBox import at all; the standalone cable-planner
has no Lexware billing; the suite's multicam-planner is missing 8,145 lines and ten test files.

> **Stand 2026-09-03:** die Zahlen sind auf **18 / 19 / 17** gesenkt und werden von
> `scripts/planner-drift.mjs` in der CI bewacht; der Rest ist zum grossen Teil deklarierter
> Overlay (`@avplan/*`-Pakete, Shell-Bridge, i18n) statt Auseinanderlaufen. Der Guard beantwortet
> seit einer Nachbesserung auch die zweite Frage — *welche Upstream-Aenderung ist hier noch nicht
> angekommen* —, weil ein uebersprungener Vendoring-Commit an den reinen Drift-Zahlen
> vorbeigerutscht war. Die Suite vendort weiterhin Kopien: verwaltet, nicht konsolidiert.

An identity spine that spans modules cannot be built on three hand-synced copies of the domain
model — still less on three copies that already disagree. This is the same defect we are attacking
in the market, reproduced in our own tree.

It is ranked 0 rather than 1 because it delivers no user value by itself. But it is not hygiene:
two of the three planners currently disagree with themselves about what features they have, and
every initiative below assumes one shared model. Nothing after it is safe until it is done, and
the cost grows with every commit to either side.

### 1. Source identity spine + label projection — the product

> **Entwurf entschieden:** [`../../decisions/ADR-001-identity-spine.md`](../../decisions/ADR-001-identity-spine.md).
> Vier unabhängige Ansätze wurden gegeneinander bewertet (14/13/12/11) und synthetisiert statt
> einen Sieger zu küren. Die gegnerische Prüfung deckte einen Blocker auf, den der bestplatzierte
> Entwurf nur als Risiko geführt hatte: der Videohub-Routing-Zustand liegt nicht im Projekt
> (`lib/exportVideohub.ts` sagt es im eigenen Kommentar), weshalb die geforderte
> Kamera-zu-Tally-Kette ohne ihn nicht ableitbar ist. Er wird damit zu Inkrement 0.

One record per real-world thing. Every label, sheet, export and device configuration becomes a
*rendering* of that record. A rename costs one edit.

The evidence is the strongest in the corpus: eight of eleven professions named this as their top
widespread need. The consequences are not cosmetic — the technical-director dossier attributes
two of the highest-stakes gallery errors (the multiviewer lying, tally lying) to a hand-maintained
mapping table drifting from the switcher, and the tally dossier records a crew discovering by
packet capture that camera 1 was on TSL address 12.

We are unusually close. `cable-planner` already exports ATEM input labels, Videohub source and
destination labels and ATEM multiviewer layouts, and models ports, cables and equipment. The work
is to make one record own the identity and turn those exports into projections of it, then extend
the projection set to switcher mnemonics, TSL/UMD, ISO naming and console scenes.

### 2. Tally map generated from the plan

Highest ratio of value to effort once (1) exists. The tally dossier's finding is blunt: "Nobody
plans tally — they only run it", and address mapping is manual everywhere except NDI. We own a
tally runtime (`tally-pi`) and a camera bridge that already carries `BridgeTallyState`. Emitting a
reviewable, diffable tally map from the plan — and then feeding our own runtime with it — is a
feature no competitor offers, on top of infrastructure we already have.

### 3. BOM and pick list derived from the technical plan

The largest unclaimed square in the feature matrix. Every rental ERP scores `no`; the rental
dossier calls it "the single largest unclaimed piece of value adjacent to the segment". Production
managers asked for exactly this ("the technical plan produces the commercial BOM instead of it
being retyped"), and warehouse staff asked for its other half ("close the technical-plan-to-pick-
list gap").

We are the only entrant already holding both sides: a signal plan with real port modelling and an
inventory with cases, storage tree and units. This is section 28's automation chain made concrete
and it should be built as the first cross-module flow.

### 4. Version-stamped print and a fast return path from paper

Cheap, and it corrects a misreading that would otherwise damage the product. Paper is not legacy
behaviour to be eliminated: the camera-operator research is explicit that it is kept deliberately,
because it works without battery and cannot silently change underneath you. The actual failure is
that a printout goes stale invisibly.

So: stamp every printed artefact with the plan version and a scannable code; make the code a
route back into the record it came from. Production managers and warehouse staff independently
asked for the return path ("make the printed artefact scannable back in"). Because we are already
offline-first and already have a strong print pipeline, this is mostly assembly.

### 10. Confirmed-state discipline — a rule before it is a feature

Added after the pain research, which found five segments independently asking for the same thing:
**read the device's real state, do not just display the last command sent.** Camera panels drift
open-loop, intercom buttons lie about whether a mic is open, media servers cannot be read back,
show-control layers only fire triggers. The `video-engineer-shader` role dossier stated the rule
from the other side: *never display a value the system has not confirmed.*

It scores high because it costs little and touches everything. `sony-camera-bridge` already does
it — `CameraCapabilities` disables unsupported functions rather than failing silently. The work is
to make it a suite-wide invariant: every displayed value carries provenance (confirmed by device /
last commanded / planned), and the UI must render the difference. This is cheap now and very
expensive to retrofit later, which is why it is a rule adopted early rather than a feature
scheduled late.

### 11. Public device-capability registry

Five segments want machine-readable compatibility truth that exists nowhere: which camera model
supports which paint parameter over which transport, which tally lamp talks to which switcher,
which Dante devices actually interoperate, which firmware combinations work. The best artefact the
camera-control researcher could find in the whole segment was a CSV with French headers inside a
documentation repository.

We already hold an unusual amount of this knowledge across `sony-camera-bridge` (eleven camera
families with verified/tuning status per protocol), `cable-planner`'s connector and device
catalogues, and `tally-pi`. Publishing it as a versioned, machine-readable registry is cheap
relative to its value, compounds over time, and is the kind of asset that makes a tool the default
reference in a field that currently has none.

### 5–9

Change-impact analysis answers a question no product in the corpus answers. Intercom planning
fills the segment with *no interchange format from anyone*, and we own an intercom runtime and
already export Green-GO config from `cable-planner`. The return path is the lighting segment's
declared out-of-scope gap and the network segment's plan-versus-found need — high value, highest
complexity, and correctly sequenced last among the identity-dependent items.

### 3d. Zehnte Runde — und diesmal in die andere Richtung (2026-09-04)

Runde 9 hatte vier Zeilen als **zu pessimistisch** entlarvt und daraus die Lehre gezogen, die
Erhebung neige zur Schwarzmalerei. Die zehnte Runde hat jede der zwölf Zeilen einzeln am
Quelltext nachgeprüft — mit einem eigenen Prüfer je Initiative, der ausdrücklich angewiesen war,
das Dokument als **Behauptung** zu behandeln.

**Sechs von zwölf Zeilen hielten nicht, und die drei schwersten Abweichungen gingen in die
umgekehrte Richtung: zu optimistisch.** Die Lehre aus Runde 9 war also selbst zu allgemein.

| Zeile | stand auf | ist | Richtung |
| --- | --- | --- | --- |
| 3 Stückliste | fertig | **fertig** | — |
| 5 Change-Impact | fertig | **fertig** | — |
| 1 Identitäts-Spine | fertig | **teilweise** | zu optimistisch |
| 2 Tally-Map | fertig | **teilweise** | zu optimistisch |
| 4 Gestempelter Druck | fertig | **teilweise** | zu optimistisch |
| 0 Fork konsolidieren | teilweise | teilweise, **Zahlen falsch** | beides |
| 7 Plan gegen As-built | teilweise | teilweise, **Belege falsch** | 3× zu pessimistisch, 1× zu optimistisch |
| 8 Netz-/IP-Plan | teilweise | teilweise, **Belege falsch** | beides |
| 6, 9, 10, 11 | teilweise | teilweise | — |

> **Nachtrag 2026-09-06.** Diese Tabelle ist das Protokoll der zehnten Runde und bleibt so
> stehen — sie sagt, was das Dokument damals behauptete und was der Quelltext damals hergab.
> Was sie nicht sagen kann, ist, was seither gebaut wurde. Drei der hier bemängelten Zeilen
> sind inzwischen zu, und zwar an genau den Stellen, die die Runde benannt hat: **Zeile 1**
> (Router-Durchgang in `feedingInput`, plus ATEM- und Videohub-Labels an der Rolle),
> **Zeile 2** (Wertebereich `cable#674`, Transport `suite#99`, Mischer-statt-Router-Eingang
> über `switcherLinkFor`) und **Zeile 4** (ADR-004, alle vier Inkremente). **Zeile 9** hat sich
> ebenfalls bewegt: die Delivery-Standards sind da, es fehlt nur noch das CDN als
> Topologie-Objekt. Die Belege stehen in der Tabelle in Abschnitt 3b; nachgesehen wurde am
> Quelltext, nicht an dieser Tabelle.

**Der Befund, der am meisten lehrt** (Zeile 2): Die Suite-Doku erklärte den Datenvertrag mit
tally-pi ausdrücklich für „stimmig und getestet". Geprüft worden waren die **Feldnamen** —
`id`, `name`, `input` vorhanden, `me`/`out_gpio` bewusst weggelassen. Dass `id` einen
**Wertebereich** hat, kam nicht vor: `guide_server.py:310` lässt 32 Zeichen zu, eine Rollen-Id
ist ein `uuidv4()` mit 36, und die Prüfung wirft dann **die ganze Datei** zurück. Jede echte
`tally.json` aus dem Planer war unbrauchbar. Dass es niemandem auffiel, liegt am Fixture: die
Tests trugen `identityId: 'r1'` — zwei Zeichen. **Ein Testdatum, das der echten Eingabe nicht
ähnelt, prüft die Stelle nicht, an der es bricht.**

**Der zweitwichtigste** (Zeile 4): Drei PDF-Wege gehen aus derselben Canvas. Einer war
gestempelt, mit einem Kommentar, der die Initiative zitiert — die beiden Nachbarn nicht, darunter
der Knopf, der „Drucken" heißt. Dieselbe Form, die in dieser Sitzung siebenmal aufgetaucht ist:
**eine Zusicherung existiert, ist an ihrer Stelle begründet, und ein Nachbar-Aufrufer kennt sie
nicht.**

**Was die zwölfte Runde mitnehmen sollte.** Zehn von zehn Runden haben eine Schicht gefunden, die
die vorige nicht kannte. Runde 10 fügt zwei Sorten hinzu, die in 3c noch nicht vorkamen:

1. **Ein Vertrag ist mehr als seine Feldnamen.** Wer zwei Seiten abgleicht, muss die Wertebereiche
   mitnehmen — Länge, Zeichensatz, Eindeutigkeit, Einheit.
2. **Ein Fixture, das die Grenze nicht erreicht, ist kein Test der Grenze.** `'r1'` gegen 32
   Zeichen ist keine Prüfung, sondern eine Illustration.

Beide Befunde sind repariert (`cable#673`, `cable#674`), nicht nur notiert. Die übrigen vier
berichtigten Zeilen betreffen Belege und Zahlen, nicht das Urteil.

---

### 3e. Die Gegenrunde zu Runde 10 — vollständig (2026-09-04)

`suite#75` hat offen gelassen, dass die adversariale Gegenprobe — jede der zwölf
Feststellungen von einem **zweiten** Prüfer widerlegen lassen — in ein
Session-Limit gelaufen war. Sie ist inzwischen **vollständig durch**: 12 von 12,
dazu drei Korpus-Durchgänge.

**Zehn von zwölf Feststellungen halten nicht. Und keine einzige hat eine Stufe
verschoben.** Alle zehn bestätigten „teilweise" und widerlegten stattdessen
**Belege**. Das ist ein anderes Ergebnis, als der Aufbau erwartet hatte, und ein
aussagekräftigeres: Nach zehn Runden stimmen die *Urteile*; was weiter wandert,
ist die Begründung darunter.

Gehalten haben nur zwei — Initiative 6 (Intercom-Plan) und 11 (Capability-
Registry), beide mit dem ausdrücklichen Zusatz, dass die gefundenen Abweichungen
den Stand *schlechter* machen, nicht besser.

**Die elfte Sorte Fehler, in zehn Runden nicht vorgekommen.** Der Ertrag lag
nicht im Urteil, sondern in den Belegen — und zwar ausgerechnet in denen, die
die erste Runde als **stark** markiert hatte:

* Zeile 0 führte den CI-Job als Erreichbarkeitsnachweis. Er ist erreichbar und
  tat nichts: die Upstream-Checkouts klonten mit Tiefe 1, der Baseline-Sha
  existiert dort nicht, und die Rückweg-Prüfung meldete „Stand nicht bekannt" —
  in genau dem Fall, für den es sie gibt. **Es gab keinen Weltzustand, in dem
  sie etwas findet.** Das Schweigen im Log war Vakuum, kein Freispruch.
* Zeile 1 führte einen Guard „ohne Ausnahmeliste über alle Renderer-Quellen".
  Der Glob endet vor `src/mobile` — der Oberfläche, die jemand mit einem Stecker
  in der Hand ansieht.
* Zeile 3 führte 31 grüne Tests. Alle 31 Fixtures haben genau **eine**
  Lagerposition; der Fall, den ein Lager täglich hat, kam in keinem vor.

**Ein Beleg, der als besonders tragfähig notiert wurde, ist der, den niemand
mehr nachprüft.** Das unterscheidet sich von allen zehn Sorten davor, und es ist
die unangenehmste: Die Sorgfalt, mit der ein Beleg ausgesucht wird, schützt ihn
danach vor Prüfung.

**Was daraus repariert wurde** — nicht notiert, sondern behoben:

| Befund | Wo | PR |
| --- | --- | --- |
| MIT-Lizenz auf proprietär gestelltem Code (3 Apps) | Suite | `suite#76` |
| Flacher CI-Checkout machte die Rückweg-Prüfung wirkungslos | Suite | `suite#76` |
| Router im Weg ergab eine falsche Mischer-Eingangsnummer | cable | `cable#675` |
| Mobile umging die Port-Label-Engstelle | cable | `cable#675` |
| Lagerbestand wurde über Lagerpositionen nicht summiert | cable | `cable#676` |
| Kommissionier-Liste verschwieg die Fehlmenge | cable | `cable#676` |
| Plan-PDF stand in keinem Dokument-Register | cable | `cable#676` |
| Netz-Budget zählte Link-Kapazität als Last | cable | `cable#676` |
| Vorgabe-Standard war der schmalste statt des breitesten | cable | `cable#676` |
| Übergabe-Stempel deckte nur die halbe Seite | cable | `cable#677` |
| Umsortierung löschte den Port-Herkunftsbeleg | cable | `cable#677` |
| Geräte in Reparatur zählten als gedeckt | cable | `cable#677` |
| Rack-Inhalte fehlten in der Stückliste | cable | `cable#677` |
| Vendoring, vom Guard selbst angeleitet | Suite | `suite#78` |

**Dreizehn Befunde repariert, drei Reste im Backlog** — davon sind zwei
inzwischen abgearbeitet. `drumKit`/`wirelessRig` außerhalb von
`project.equipment` (Rest von B-31) steht seit `cable#678` in der Stückliste.
Die vier aus der Suite unerreichbaren Repos (B-35) hingen an E-19, und die
Frage ist seit `suite#99` entschieden: Teil der Suite, aber als **Geräte über
eine Adresse** statt als mitgelieferte Ansicht — beides zugleich, laufende
Anwendung und Attrappe im Fenster, war die Variante, die es nicht gibt. Der
Weg vom Plan auf diese Geräte (B-41) ist seitdem in allen vier Richtungen
gebaut oder ausgewiesen: Tally (`suite#99`), Kamerasteuerung
(`sony-camera-bridge#14`), Intercom (`Broadcast-intercom#9`) und die
Medien-Station, für die der Befund lautet: Bestand statt Konfigurationsziel —
welches Video in welcher Sensor-Zone läuft, ist Ausstellungs-Inhalt, keine
Signalführung.

Was übrig bleibt, bleibt aus einem Grund: die fehlende Zeitachse (B-34) hängt
an E-18 und wird nicht nebenbei entschieden.

**Zwei Beobachtungen aus dem Reparieren selbst**, beide dieselbe Sorte wie der
Befund, der sie ausgelöst hat:

1. Beim Übergabe-Stempel sollten die As-Built-Zeilen mit in den Fingerabdruck.
   **Ein bestehender Guard hat das gefangen** — und sein Kommentar hatte den
   Fall wörtlich vorhergesagt: der Revisions-Vergleich spannt einen Snapshot
   mit `revisions: []` auf, also hätte *jedes* Übergabe-Blatt sich als überholt
   gemeldet. Der Guard war die einzige Stelle, die das wusste.
2. Der erste Raum-Test für dieselbe Sache **bestand auch gegen den alten
   Code**: ein Raum bei x/y = 0 umschließt das Gerät, `locationOf` ordnet es
   zu, und die Asset-Zeile ändert sich dadurch von selbst. Dieselbe Falle wie
   das `identityId: 'r1'`-Fixture aus Runde 10 — **eine Gegenprobe muss nicht
   nur greifen, sie muss aus dem richtigen Grund greifen.**

**Die drei Korpus-Durchgänge**, zum ersten Mal gegen den Korpus statt gegen die
Roadmap:

1. **Von 38 P1-Bedarfen haben zwölf überhaupt keine Initiative.** Elf davon
   fallen in zwei Cluster: die **Zeitachse fehlt vollständig** (Bedarfe 4, 6, 7,
   8, 10 setzen alle einen Ablauf-/Rundown-Datensatz voraus — in keinem der acht
   Repos gibt es einen; der einzige Zeit-Datensatz ist eine handgetippte
   Flachliste in der Shell ohne Import, Export oder Referenz), und **die zweite
   Hälfte gebauter Sachen** (das Modell steht, die Handlung fehlt: Kabellängen
   werden geschätzt, aber nur per Knopf und als Luftlinie; Shotlisten liegen in
   `localStorage` statt in der Projektdatei; Container bewegen ihren Inhalt, aber
   es gibt keine Aus-/Einbuchung).

   **Stand 2026-09-06 — die zweite Haelfte ist gebaut.** Der Cluster „das Modell
   steht, die Handlung fehlt" ist abgearbeitet: Kabellaengen tragen ihre Herkunft
   und melden das stille Veralten (Bedarf 13, `cable#708`), PTZ-Presets sind
   Projekt-Dokumentation statt Geraetespeicher (Bedarf 14, `multicam#92`),
   Container werden aus- und eingebucht (Bedarf 15, `cable#707`). Der
   Zeitachsen-Cluster (4, 6, 7, 8, 10, 11) steht unveraendert — er haengt an
   E-18 und damit an einer Eigentuemer-Entscheidung, nicht an Arbeit. Die
   Aufzaehlung oben bleibt als Befund vom Tag ihrer Erhebung stehen; sie hier
   umzuschreiben liesse nicht erkennen, was sich seither bewegt hat.
2. **23 Matrix-Zeilen mit Target über Today:** 6 geschlossen, 10 teilweise, 5
   unverändert offen — und **zwei Zellen der Matrix selbst falsch**, beide zu
   pessimistisch (RF-Koordination und Show-Control-SDK; siehe die Korrektur in
   `FEATURE-MATRIX.md`).
3. **Drei vollständig unbesetzte Segmente** (Show-Control-Planung,
   Delivery/Streaming, Running-Order-als-Daten) und ein vierter Befund, der
   schwerer wiegt: **es gibt in keinem der acht Repos ein Zeitmodell.** Die
   Bedarfs-Datenbank nennt genau das selbst „the largest gap for AV Planner Suite
   specifically" — und in der Roadmap-Tabelle in 3b ist es keiner Initiative
   zugeordnet und deshalb dort unsichtbar. Dazu: **vier der acht Repos sind aus
   der Suite gar nicht erreichbar** (die Modul-Registry der Shell führt fünf
   Einträge; Broadcast-intercom, tally-pi, sony-camera-bridge und
   pi-media-station stehen nicht darunter).

**Die zwölfte Sorte, aus Durchgang 2.** Eine `WON'T`-Zeile ist eine Anweisung an
den nächsten Leser, etwas *nicht* zu bauen. Steht sie über etwas, das bereits
ausgeliefert ist, ist sie nicht bloß veraltet — sie führt jemanden dazu,
vorhandene Arbeit zu übersehen oder ein zweites Mal zu machen. **Eine falsche
Absage kostet mehr als eine falsche Zusage**, weil niemand sie nachprüft: eine
Zusage wird eingefordert, eine Absage nicht.

---

### 3c. Neun Messrunden, neun Korrekturen (2026-09-03)

Abschnitt 25 verlangt Neu-Ableitung statt Flickwerk. Der Tag hat gezeigt, warum die Regel nicht
nur für fremde Annahmen gilt: **jede Messrunde hat eine Annahme von mir selbst widerlegt**, und
zwar immer erst, nachdem ich sie bereits aufgeschrieben hatte.

| # | Was ich annahm | Was die Messung ergab |
| --- | --- | --- |
| 1 | 255 `// Quelle:`-Kommentare | **253**, in 9 Dateien — die Zahl stand schon richtig im Scoping-Papier |
| 2 | Die Katalog-Links erreichen den Nutzer, sobald das Feld gefüllt ist | Nein: der `DeviceTypePicker` setzt nur `deviceTypeId` und kopiert keine Template-Felder. Ohne Vererbungs-Anzeige wären 253 Belege aus einem unerreichbaren Kommentar in ein ebenso unerreichbares Feld gewandert |
| 3 | „Eine Idee, ein Vokabular" (so im Commit geschrieben) | `isEstimate` war zwischen `light` und `multicam` **schon auseinandergelaufen**, keine Stunde nach der Entstehung — die englische Hälfte fehlte im light-planner, wo das Datenblatt oft englisch ist |
| 4 | Der `cable-planner` ist für Initiative 10 fertig | Der AI-Port-Vorschlag schrieb **geratene Ports als Tatsache** und brachte Prüfung 18 zum Schweigen — die Prüfung, die einen Menschen zu belegten Daten zwingen soll |
| 5 | Jetzt ist er fertig | Die Plangenerierung tat dasselbe für einen **ganzen Plan**, samt Kabeln |
| 6 | Es sind drei KI-Schreibstellen | Erst fünf (ein grep nach dem Import-Pfad), dann **vier** (das Kriterium fragt nach dem Aufruf). `LibraryPanel` kannte ich nicht, und es brachte eine ganze Quelle mit: `suggestFromWeb` zählt Stecker in einem Wikipedia-Schnipsel |
| 7 | `#645` macht den Green-GO-Round-Trip verlustfrei — so steht es im PR, im Commit und in der Roadmap | `ButtonFunctions` wurde bei **jedem** Export neu erfunden: Tasten positionsweise aus der Array-Reihenfolge, Seite 2 auf Null. Auf einem Beltpack ist das die Tastenbelegung. Zwei eigene Bauteile hatten es verdeckt — die Fixture stand auf `{}` (nichts zu verlieren) und der Paritäts-Guard **verlangte** das Überschreiben. Berichtigt in `cable#653` |
| 8 | Das Dokument-Register aus `#644` beantwortet „gilt dieses Blatt noch?" | Für den Plan-Ausdruck nicht: `planFingerprint` liess `checkState` aus. Die Häkchen der gesteckten Ports zeichnet `EquipmentNode` aber an den Port, und beide PDF-Wege nehmen das DOM mit. Ein Blatt mit dem Aufbaustand von gestern meldete sich als aktueller Stand — auf dem Papier, dessen einziger Zweck waehrend des Aufbaus genau dieser Stand ist. Berichtigt in `cable#654` |
| 9 | Die Roadmap-Tabelle in 3b ist gemessen, also stimmt sie | Vier ihrer Zeilen hielten der Nachmessung nicht stand, und **alle vier in dieselbe Richtung: zu pessimistisch.** 9 („nur Katalog-Treffer") übersah sieben IP-Transporte als vollwertige `SignalStandard`-Mitglieder samt Netz-Budget und drei Prüfungen; 7 („der Abgleich fehlt") übersah `atemLiveCompare`; 11 zählte 8 belegfreie Kataloge, von denen zwei das Feld gar nicht führen können; 0 trug Drift-Zahlen, die jeder Vendor-Schritt veraltet |

**Was daraus folgt, und warum Zeile 10 nicht „fertig" sagt.** Neun von neun Runden fanden
eine Schicht, die die vorige nicht kannte. Eine zehnte anzunehmen ist keine Schwarzmalerei,
sondern die einzige Lesart, die zu den Belegen passt. „Alle bekannten Fälle geschlossen" ist
deshalb die stärkste Aussage, die dieser Stand trägt.

**Runde 9 dreht die Richtung um, und das ist der interessantere Befund.** Die Runden 1 bis 8
korrigierten *zu optimistische* Aussagen — „fertig", „verlustfrei", „drei Stellen". Runde 9
korrigierte vier *zu pessimistische*: die Tabelle führte als fehlend, was gebaut dastand. Beides
ist derselbe Fehler, und es ist der Fehler, gegen den dieses ganze Papier arbeitet — **ein Wert,
den niemand nachgesehen hat, steht als Tatsache da.** Ob er zu gut oder zu schlecht ausfällt,
ist eine Frage des Zufalls, nicht der Sorgfalt. Eine zu pessimistische Zeile ist dabei nicht die
harmlosere Sorte: sie schickt Bauarbeit an eine Stelle, die schon trägt, und lässt die echte
Lücke daneben liegen — bei Initiative 9 wäre exakt das passiert, denn die fehlende Hälfte ist
nicht der Signalfluss, sondern SRT/RTMP/HLS.

**Die Konsequenz ist gebaut, nicht bloss notiert.** Beide Sorten unbestätigter Werte haben
jetzt ein Register, das die Stellen **aus dem Quelltext rechnet** statt sie aufzuzählen:
`tests/deviceReadSites.test.ts` (Geräte-Befunde) und `tests/aiWriteSites.test.ts` (erfundene
Werte). Eine neue Stelle lässt den jeweiligen Test fallen und wird namentlich genannt; wer sie
einträgt, muss dabei beantworten, wo der Wert landet.

Das ist der Unterschied, um den es geht: **eine aufgeschriebene Liste ist der Kenntnisstand
ihres Autors, eine gerechnete ist der Zustand des Programms.** Runde 6 hat genau diesen
Unterschied vorgeführt — dreimal griff ein ad-hoc-Muster daneben, einmal zu weit, einmal zu
eng, einmal wieder zu weit.

**Was ausdrücklich offen ist.** Ob ein vom Modell **erfundenes Kabel** eine Kennzeichnung
tragen soll — und ob eine Markierung dafür überhaupt reicht. `Cable` hat kein `specSource`, und
eine erfundene Verbindung behauptet mehr als eine erfundene Port-Zahl: dass zwei Ports
zusammengehören. Das ist eine Formfrage mit mehreren vertretbaren Antworten und gehört dem
Eigentümer; in `cable#651` ist die Lücke bewusst gelassen und durch einen Test festgehalten,
damit sie als Entscheidung lesbar bleibt und nicht als Versäumnis.

## 4. Cross-module automation (section 28), grounded

The mandate's example chain is right in shape but should be built in the order value arrives, not
end to end. With the identity spine in place, the chain becomes:

```
camera position placed (multicam-planner)
  -> identity created: number, name, position          [spine]
  -> required signals derived                          (cable-planner: ports, cable, length)
  -> BOM + reservation                                 (inventory-core)
  -> pack list by case                                 (StorageNode / LPN)
  -> labels projected                                  (ATEM, Videohub, TSL/UMD, MV)
  -> tally map emitted                                 (tally-pi)
  -> camera bridge binds by identity                   (sony-camera-bridge)
  -> intercom channel assigned                         (Broadcast-intercom)
```

Every arrow above is between two modules we already own. That is the section 27 advantage stated
as an engineering plan rather than a claim.

## 4b. Design rules the research forces

These are not features. They are constraints that every feature must satisfy, each derived from a
widespread, multi-source finding.

1. **Never display an unconfirmed value as fact.** Every value carries provenance: confirmed by
   the device, last commanded, or planned. (Five segments; see initiative 10.)
2. **An import that cannot preserve a field must refuse, not drop it.** Silent data loss is the
   single most damaging integration failure named across both role and competitor research.
3. **Direction and signal type are first-class, everywhere.** The same connector carries different
   things in different directions; a model without direction cannot validate anything.
4. **Identity is stable and separate from position.** A rehearsal-day edit must not silently
   re-point every controller button; a main+backup pair is one role, not two devices.
5. **Every printed artefact is version-stamped and scannable back.** Paper is deliberate, not
   legacy; the failure is that it goes stale invisibly.
6. **The container is the unit of handling.** Cases nest, and their contents and weight follow
   them.

## 5. What we will not build

Section 31 is explicit that the goal is not the most features. Nine deliberate exclusions are
recorded in `FEATURE-MATRIX.md`, block E and C. The principle behind them: **do not compete with a
mature runtime or with a vendor-specific physical model.** grandMA, QLab, ArrayCalc, Soundvision,
Wireless Workbench and the switchers have decades of trust, muscle memory and measured data behind
them. Crew scheduling and payroll are a mature market with heavy compliance cost and almost no AV
differentiation.

Where those tools exist, our job is to *feed* them from the plan — export into Wireless Workbench,
emit MVR for the visualisers, drive Companion — not to replace them.

## 6. Implementation rule (section 30)

Where this research and the existing code disagree, the research does not automatically win, and
neither does the code. Two places where the research should change existing plans:

1. **Read-only mobile is the wrong half.** `cable-planner`'s mobile share is read/check-only. The
   warehouse and freelancer dossiers both need write access on-site and offline. This should be
   reconsidered rather than treated as settled.
2. **`.avplan` currently passes foreign domains through as `unknown`.** That is a sound way to
   avoid data loss today, but the corpus's strongest integration finding is that *silent* field
   loss is the most damaging failure mode. The format should move toward explicit refusal —
   an import that cannot preserve a field must say so — rather than opaque pass-through.

And one where the existing code should win over an obvious market pattern: every competitor is
cloud-first with an offline afterthought. The research says the offline half is the one that
matters and that everyone builds it for the wrong workflow. Our local-file, atomic-write,
offline-first architecture is a genuine advantage and should not be traded for cloud convenience.

## 7. Open questions

- All sixteen segments are researched, landscape and pain points both. Visual workspace, crew
  scheduling, asset tracking and video switching arrived after the matrix was first drafted and
  are represented there only through adjacent segments; folding them in directly is the next
  refresh. The pain research did not move the existing ranking — it confirmed initiatives 2 and 3
  verbatim from the competitor side and added initiatives 10 and 11.
- The section 15 user research (Reddit, G2, Capterra, Trustpilot) could not be performed in this
  environment. The 224 pain points rest on GitHub issues plus search summaries, which
  systematically under-represents closed commercial products whose users never file public issues
  — precisely the expensive, proprietary end of the market. Conclusions drawn from silence in
  those segments are weak and should be redone with open egress.
  **Second attempt, 2026-09-01: still open.** Direct HTTPS to reddit.com, g2.com and capterra.com is
  refused by the gateway (403 on CONNECT, verified). A WebSearch-only sweep across twelve segments
  returned `thin` from all ten segments that completed, and its adversarial verification stage never
  ran — so it produced **zero verified findings and moved no score**. The attempt, what it cost and
  what a real section 15 would need is written up in
  [`SECTION-15-USER-RESEARCH.md`](SECTION-15-USER-RESEARCH.md). The gap is unchanged, and it is now
  measured rather than assumed.
- Pricing across the market is unverified here, so no positioning claim about cost should be made
  from this corpus yet.
