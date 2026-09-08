# Implementierungs-Backlog — AV Planner Suite

**Stand: 2026-09-08.** Gegenstück zu
[`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md): dort steht, was ist —
hier, was fehlt.

**Fortschreiben, nicht überschreiben.** Erledigte Punkte werden abgehakt und
mit dem PR belegt, statt gelöscht zu werden; die Historie der Fehleinschätzungen
ist selbst ein Ergebnis.

**Sortierung: nach echtem Nutzerschaden, nicht nach Aufwand.**

**Seit 2026-09-08 blockiert keine Eigentümer-Frage mehr.** Die Tabelle
„Eigentümer-Entscheidungen" am Ende ist vollständig entschieden; was dort
steht, ist Begründung, nicht Vorbehalt. Ein Eintrag, der hier „offen" heisst,
ist damit Arbeit — und wo eine Bedingung bleibt, die kein Beschluss aufhebt
(fehlender Netzzugang, fehlende Beispieldatei), steht sie an der Zeile.

---

## Sofort — eine Zusage, die heute falsch ist

### B-1 · Der Native-Dialoge-Guard der Suite ist blind

* **Status:** ~~offen~~ **erledigt 2026-09-04** (`suite#63`) — Muster kennt jetzt
  beide Schreibweisen, Zeichenketten werden vor der Suche geleert, Gegentest über
  alle sechs Formen, XSS-Testtext belegt fehltrefferfrei.
* **Ort:** `scripts/native-dialogs.mjs:125`
* **Befund:** Der Guard sucht `/window\.(confirm|alert|prompt)\s*\(/`. Die
  globalen Funktionen heißen aber `alert`, `confirm`, `prompt` — `window.` ist
  optional und wird üblicherweise weggelassen. Er meldet „0 Treffer in 663
  Dateien", **ohne die häufigere Schreibweise überhaupt zu kennen.**
* **Belegte Schwere:** In `cable-planner` standen genau so drei echte
  `alert(`-Aufrufe hinter demselben grünen Haken, bis `cable#657` es korrigiert
  hat. In der Suite ist die Lücke aktuell **latent** (gemessen: die einzigen
  rohen Treffer sind XSS-Testtexte in Zeichenketten) — die Zusage ist trotzdem
  wertlos, solange sie nicht stimmt.
* **Falle beim Portieren:** Der Guard streicht Kommentare, **aber keine
  Zeichenketten.** `apps/multicam-planner/src/__tests__/shotlist.test.ts:214`
  enthält `'<script>alert(1)</script>'` — mit korrigiertem Muster ein
  Fehltreffer. Einfach-/doppelt-gequotete Zeichenketten müssen mit geleert
  werden; Template-Literale bleiben durchsuchbar, weil in `${…}` echter Code
  stehen kann.
* **DoD:** Muster wie in `cable-planner/tests/nativeDialogs.test.ts` (mit
  optionalem `window.`), Zeichenketten geleert, Gegentest über **alle sechs
  Formen** (`alert(`, `window.alert(`, … ), Fehltreffer-Freiheit über alle 663
  Dateien belegt, `npm run dialogs:native` Exit 0.
* **Aufwand:** klein

---

## Hoch — vorhandene Prüfungen, die nie laufen

### B-2 · `Broadcast-intercom` hat 38 grüne Prüfungen und keine CI

* **Status:** ~~offen~~ **erledigt 2026-09-04** (`Broadcast-intercom#6`) — CI
  startet den gebauten Server mit `MOCK_DEVICES=1`, wartet auf Bereitschaft
  (und bricht ab, sobald der Prozess stirbt) und fährt den Smoke-Test.
* **Befund:** `scripts/smoke-test.mjs` fährt REST, Companion-Control und
  WebSocket gegen einen laufenden Kern — **38 Prüfungen, alle grün** (heute
  gemessen). Es gibt **keine** Workflow-Datei; die Prüfung läuft nur, wenn
  jemand sie von Hand startet.
* **Warum das zählt:** Das ist die einzige belastbare Zusicherung, die dieses
  Repo besitzt. Ohne CI merkt niemand, wenn sie bricht.
* **DoD:** Workflow, der `npm ci`, `npm run build`, dann Server im
  `MOCK_DEVICES=1`-Modus startet, auf Bereitschaft wartet und `test:smoke`
  fährt; rot bei Exit ≠ 0. Auf einem PR nachweislich gelaufen.
* **Aufwand:** klein
* **Randnotiz:** `CLAUDE.md` führt Broadcast-intercom unter „Repos ohne CI",
  bei denen „CI grün" nicht erfüllbar ist. Mit B-2 entfällt diese Ausnahme.

### B-3 · `sony-camera-bridge`: 15 Tests, keine CI

* **Status:** ~~offen~~ **erledigt 2026-09-04** (`sony-camera-bridge#11`)
* **Korrektur:** zunächst als „7 Tests" notiert — das war die Zusammenfassung
  des *letzten* Workspaces, nicht die Summe über beide (8 + 7).
* **Befund:** `npm test` grün (7 Tests, `node:test`), darunter die
  ADR-003-Zusicherung „unbestätigt ist nicht aus" im Companion-Modul. Keine
  Workflow-Datei.
* **DoD:** Workflow mit `npm ci` + `npm test`, auf einem PR gelaufen.
* **Aufwand:** klein

### B-4 · `cable-planner`: CRDT- und Signaling-Prüfung laufen nicht in CI

* **Status:** ~~offen~~ **erledigt** (`cable#658`, Commit `a1fa277`) — beide
  Schritte stehen im `verify`-Job, mit Laufzeit im Workflow-Kopf (`test:crdt`
  ~0,4 s, `test:signaling` ~2,6 s) und der Begründung, warum `ui:smoke` und
  `test:drag` dort **nicht** stehen (die brauchen wirklich einen laufenden
  Renderer).
* **Befund:** `npm run test:crdt` (Konvergenz) und `npm run test:signaling`
  existierten, waren aber nicht Teil des `verify`-Jobs. Kollaboration war damit
  die am schlechtesten abgesicherte Funktion des größten Repos.
* **DoD:** beide im CI-Job, oder eine belegte Begründung im Workflow, warum
  nicht (Laufzeit, Flakiness) — dann aber mit Messwert.
* **Aufwand:** klein

> **Wie dieser Eintrag falsch stehen konnte.** Er stand als „offen" hier,
> während der Fix in derselben Sitzung bereits auf `main` lag. Geschrieben
> wurde er aus einer älteren Lesung des Workflows, nicht aus einer Messung zum
> Zeitpunkt des Schreibens — genau der Fehler, den dieses Audit an anderen
> Stellen misst. Nachgeprüft wurde er erst, als er abgearbeitet werden sollte:
> `git show origin/main:.github/workflows/ci.yml | grep test:crdt` liefert zwei
> Treffer. **Ein Backlog-Eintrag ist eine Behauptung über den Code und altert
> genauso wie eine.** Vor dem Abhaken jeder Punkt neu am Code prüfen, nicht am
> eigenen Text.

---

## Hoch — Nahtstellen, an denen Arbeit verloren geht

### B-5 · Der Rückweg Suite → upstream hat keine Liste

* **Status:** ~~offen~~ **erledigt 2026-09-04** (`suite#64`) — der Drift-Bericht
  hat jetzt einen Abschnitt „Suite-only — nicht nach upstream uebernommen",
  der die Dateien mit Zeilenzahl nennt, analog zur „uncarried"-Liste.
* **Stand der letzten Durchsicht (2026-09-04):** 53 Kandidaten (suite-ahead +
  two-way) wurden einzeln gegen die Upstream-Fassung gelesen. Ergebnis: **41
  von 50 sind bewusste Überlagerung.** Von neun Kandidaten haben nach
  Nachprüfung **drei** gehalten — die drei rohen `alert(`-Aufrufe im
  `cable-planner`, die in `cable#657` portiert wurden. Gefallen sind: vier
  light-planner-i18n-Kandidaten (der Sprachschalter ist upstream **nicht
  erreichbar**, siehe B-13 — Übersetzen änderte dort nichts Sichtbares) und
  drei `bonjour-service`-Typänderungen (upstream compiliert sauber, also kein
  Defekt, sondern eine Suite-Build-Anpassung).
* **Lehre daraus:** die Trefferquote roher Kandidaten lag bei **3 von 9**. Ein
  Guard, der automatisch urteilt, wäre also zu zwei Dritteln falsch gewesen.
  Die Liste vorzulegen ist richtig, sie zu bewerten bleibt Handarbeit.
* **Befund:** `scripts/planner-drift.mjs` **zählt** `suite-ahead` (heute: cable
  8, multicam 1), **listet die Dateien aber in keinem Abschnitt auf.** Nur die
  `two-way`-Dateien werden namentlich genannt. Genau deshalb läuft diese Liste
  niemand.
* **Belegte Folge:** In Suite-PR #1 wurde ein nativer Dialog in `CollabPanel`
  ersetzt; upstream hat den Fix nie bekommen. Der abgehakte Punkt 41 in
  `docs/ux-audit.md` war damit **für den Suite-Code richtig und für den
  cable-Code falsch** — dieselbe Datei, in beide Repos vendort.
* **DoD:** Der Bericht bekommt einen Abschnitt „Suite-only, nicht nach upstream
  übernommen" mit Datei und Zeilenzahl, analog zur bestehenden
  „uncarried"-Liste. Kein Automatismus — die Entscheidung Overlay/Fix bleibt
  menschlich, aber sie wird **vorgelegt** statt verschwiegen.
* **Aufwand:** klein
* **Wichtig:** Ein Guard, der automatisch urteilt, wäre falsch. Gemessen sind
  41 von 50 untersuchten Dateien bewusste Überlagerung (`@avplan/*`,
  Shell-Einbettung, Theme). Die Liste ist eine Vorlage, kein Urteil.

### B-14 · Der Drift-Bericht sah nur `src/` und `tests/`

* **Status:** ~~offen~~ **erledigt 2026-09-04** — `ROOT_FILES` neben `ROOTS`;
  `analyseApp` stuft Einzeldateien der App-Wurzel genauso ein, `uncarried`
  bekommt denselben Pfadfilter.
* **Befund:** `ROOTS = ['src', 'tests']`. `apps/cable-planner/CLAUDE.md` ist
  genauso vendoriert wie der Quelltext, liegt aber in keiner der beiden
  Wurzeln — und driftete deshalb **unbeobachtet**. Gemessen an dem Tag: **39
  Zeilen hinter upstream.**
* **Warum ausgerechnet diese Datei zählt:** Ihr fehlten die Regel „keine
  Trailer in Commit-Messages" und die gesamte **Merge-Berechtigung**. Das ist
  die nächstliegende `CLAUDE.md` für jeden, der unter `apps/cable-planner/`
  arbeitet — die Arbeitsanweisung selbst war veraltet, während der Bericht
  „OK" meldete.
* **Dieselbe Form wie die anderen Befunde dieser Sitzung:** eine Prüfung
  existiert, ist begründet, und lässt genau den einen Eingang aus, für den man
  sie am ehesten bräuchte. Der Kommentar über `ROOTS` erklärte sogar, dass
  `src` allein zu wenig war (`tests/` kam deshalb dazu) — und blieb bei der
  nächsten Lücke stehen.
* **Gegengeprüft:** mit der alten Fassung der Datei meldet der Bericht
  `CLAUDE.md | 4 | 34` und „13 neue Zeile(n) fehlen"; mit der aktuellen keinen
  Befund. `multicam-planner` und `light-planner` haben **weder** in der Suite
  **noch** upstream eine `CLAUDE.md` — ihre unveränderten Zahlen sind also
  korrekt und kein zweiter blinder Fleck.
* **Weiterhin bewusst draußen:** `scripts/` und `package.json` — Monorepo und
  Standalone haben zwangsläufig verschiedene Abhängigkeiten und Build-Skripte.
* **Aufwand:** klein

### B-6 · Plan → Tally-Pi: der Transport ist ein Medienbruch

* **Status:** offen — **die Entscheidung ist gefallen (E-7, 2026-09-08): beides, Datei bleibt Vorgabeweg, Direktweg als einzuschaltendes Ziel.** Was bleibt, ist Bauarbeit
* **Befund:** `toTallyPiDevices` liefert `{id, name, input}`,
  `gpio_watcher.py:79` setzt `me` selbst auf 1, `guide_server.py:251` fängt
  `out_gpio`/`gpio` ab. Aber:
  `ExportDialog.tsx:1299` erzeugt eine **Download-Datei**, die jemand von Hand
  nach `/opt/pi-guide/tally.json` kopieren muss.
* **Berichtigung 2026-09-04 — „der Datenvertrag stimmt" stand hier und stimmte
  nicht.** `toTallyPiDevices` schrieb die Rollen-`uuidv4()` (36 Zeichen) in ein
  Feld, das `guide_server.py:310` gegen `^[A-Za-z0-9_-]{1,32}$` prüft, und bei
  einem Verstoß wirft der Pi **die ganze Datei** zurück. Jede echte
  `tally.json` aus dem Planer war unbrauchbar. Verglichen worden waren hier die
  **Feldnamen**, nicht die **Wertebereiche** — und das Fixture trug `'r1'`, zwei
  Zeichen. Behoben in `cable#674`; der Transport bleibt offen.
* **Warum das zählt:** Genau der Medienbruch, gegen den der Auftrag angetreten
  ist („fewest media breaks").
* ~~**Offene Frage an den Eigentümer:** Soll der Planer den Pi direkt beliefern
  (HTTP-POST an `guide_server.py`), oder bleibt die Datei bewusst der Weg, weil
  der Pi im Produktionsnetz nicht erreichbar sein soll?~~ **Beantwortet (E-7,
  2026-09-08, vom Eigentümer bestätigt): BEIDES, mit Rangfolge.** Die Datei
  bleibt der Vorgabeweg; der Direktweg kommt als ausdrücklich einzuschaltendes
  Ziel dazu. Das DoD unten gilt damit uneingeschränkt — samt seiner letzten
  Zeile, denn ein stiller Fehlschlag wäre schlechter als die Datei.
* **DoD (falls Direktweg gewünscht):** Endpunkt in `guide_server.py`,
  Token-geschützt wie der Mobile-Share; Planer-seitig ein Ziel in den
  Einstellungen; Fehlerfall sichtbar; End-to-End-Prüfung.
* **Aufwand:** mittel

### B-7 · Intercom-Vokabular existiert zweimal

* **Status:** offen — **entschieden (E-2, 2026-09-08, vom Eigentümer): eigener `.avplan`-Slot für Intercom; Vokabel bleibt das neutrale Format aus B-8, in einem gemeinsamen Paket.** Der Slot trägt nur, was der Plan nicht hergibt (Kanäle, Key-Gruppen, Beschriftung, Talk/Listen-Matrix); alles Übrige steht darin als Verweis über die Objekt-Id. Was bleibt, ist Bauarbeit
* **Befund:** `GreenGoConfig` lebt in `cable-planner`,
  `Broadcast-intercom/packages/shared/src/index.ts` (437 Zeilen, 33 Exporte)
  führt dasselbe Feld unabhängig. Kein gemeinsames Paket, kein Intercom-Slot in
  `.avplan`.
* ~~**Offene Frage:** gemeinsames Paket mit zwei Adaptern, oder `GreenGoConfig`
  als Wahrheit? Die Antwort entscheidet auch, ob `.avplan` einen vierten Slot
  bekommt.~~ **Beantwortet (E-2):** gemeinsames Paket mit dem neutralen Format,
  `GreenGoConfig` als Ausgabe-Projektion — und ja, `.avplan` bekommt den vierten
  Slot.
* **Aufwand:** groß

---

## Mittel — benannte Teilstücke

### B-8 · Herstellerneutrales Intercom-Austauschformat

* **Status:** ~~offen~~ **erledigt 2026-09-04** (`cable#684`, in die Suite
  vendoriert mit `suite#86`).
* **Befund war:** Der Green-GO-Round-Trip ist seit `cable#653` verlustfrei
  (Preset überlebt inkl. `ButtonFunctions`). Ein **herstellerneutrales** Format
  fehlte — die Lücke, die das Segment-Dossier als „no interchange format from
  anyone" führt.
* **Was gebaut wurde:** `types/intercomExchange.ts` und
  `lib/intercomExchange.ts` — Format `avplan-intercom`, Version 1, mit
  Sprechstellen, Konferenzen und `IntercomMembership {channelId, talk, listen}`.
  Talk und Listen getrennt, weil genau diese Trennung der Punkt eines
  Intercom-Systems ist und ein Format, das sie zusammenwirft, den Plan nicht
  abbilden kann. Export und Import sitzen im `GreenGoExportDialog` **neben**
  dem `.gg5`-Knopf: der bleibt der Weg IN die Anlage, der neutrale ist der Weg
  aus dem Haus, den auch jemand lesen kann, der Riedel oder Clear-Com aufbaut.
  Ein Format, das nur im Code existiert, ist kein Austauschformat — deshalb
  stehen beide Knöpfe nebeneinander.
* **Versionsschutz:** `parseIntercomExchange` weist eine Datei mit höherer
  `formatVersion` ab, statt sie halb zu lesen. Gedeckt von
  `tests/intercomAustauschformat.test.ts`.

### B-9 · ~~Plan ↔ As-built für die Verkabelung~~

* **Status:** ~~offen (hängt an einer Eigentümer-Entscheidung)~~
  **erledigt** (2026-09-08, `cable#764`).
* **Befund:** Für den **Gerätezustand** existiert der Abgleich
  (`lib/atemLiveCompare.ts`, genutzt in Audio-Router- und MV-Dialog). Für die
  **Verkabelung** gibt es die Datenspur (`checkState.ports`, seit `cable#654`
  auch im Plan-Fingerabdruck), aber keine Gegenüberstellung Soll-Kabel gegen
  gesteckte Ports.
* **Was schon da war, und warum es den Befund nicht erledigte
  (nachgesehen 2026-09-08):** `lib/asBuilt.ts` (Bedarf 126, `cable#712`)
  führt seit Anfang September **vier** Quellen auf einem Blatt zusammen —
  Netz-Scan, Mischer, Kreuzpunkte, Vermietung. Alle vier befragen **Geräte**.
  Keines von ihnen weiß, ob ein Kabel steckt; ein Mischer meldet seine
  Kreuzpunkte, nicht sein SDI-Blech. Die Verkabelung war exakt die fehlende
  fünfte Quelle — und die Ablesung lag die ganze Zeit im Projekt, sie ging
  nur in kein Dokument ein.
* **Gebaut:** `fromCabling(cables, equipment, checkState)` als fünfter
  Zubringer auf **dasselbe** Blatt (ein zweites „As-built (Kabel)" wäre genau
  die Vervielfachung, gegen die das Modul gebaut ist). Drei Urteile, und nur
  drei — `match`, `not-verified`, `unexpected`. `missing` und `differs` sind
  aus einem **binären** Haken nicht herleitbar: `false` heißt „noch nicht
  abgehakt", nicht „nicht gesteckt". Der Fall, der die Arbeit trägt, ist
  `unexpected`: ein Haken an einem Kabel, das der Plan nicht mehr kennt —
  der Plan hat sich geändert, nachdem die Crew losgezogen ist, und draußen
  steckt das Kabel weiterhin.
* **Neues Feld `checkState.receivedAt`:** Das Blatt verlangt zu jeder
  Ablesung einen Zeitpunkt; `checkState` hatte keinen. Gesetzt wird er in
  `mobileSyncSlice.setCheckState`, also beim **Empfang** der Handy-Meldung —
  nicht beim Aufrufer, denn wer ihn setzen darf, kann „nachgesehen"
  behaupten, ohne nachgesehen zu haben. Bewusst **ohne** Default in
  `healProjectPositions`: ein altes Projekt hat Haken, deren Alter niemand
  kennt, und das Blatt sagt dort „nicht nachgesehen" statt eine Zeit zu
  erfinden.
* **Die offene Frage ist beantwortet, und zwar rückwirkend:** Gefragt war,
  wo der As-built-Zustand wohnt — eigene Spur je Feld oder Plan-Überschreiben
  mit Revisionen — und ob `Provenance` einen fünften Wert braucht.
  `lib/asBuilt.ts` hat das entschieden, bevor die Frage hier gestellt wurde:
  der Zustand wohnt in einer **eigenen Spur** (`AsBuiltEntry` mit
  `ReadingSource`), das Blatt stellt Absicht und Beobachtung nebeneinander
  und schreibt nichts in den Plan zurück. `Provenance` sagt, woher eine
  Angabe **im Plan** stammt — eine Ablesung wird nie eine Angabe im Plan.
  **Kein fünfter Wert.**
* **Gegengeprobt** (sechs Eingriffe, alle rot, zurückgebaut grün):
  Port-Haken werden ignoriert · erfundener Zeitpunkt für alte Projekte ·
  `false` gilt als abgehakt · der Dialog stellt den Zeitpunkt selbst ·
  kein Stempel beim Empfang · Verkabelung nicht auf dem Blatt.
* **Aufwand:** ~~groß~~ mittel — der große Teil (das Blatt, die Urteilsregel,
  das Zusammenführen) stand schon; zu bauen war die fünfte Quelle und ihr
  Zeitstempel.

### B-10 · ~~Delivery-/Streaming-Kette~~

* **Status:** ~~offen~~ **erledigt** (2026-09-08) — die zweite Hälfte war
  bereits gebaut, der Eintrag war stehengeblieben. Siehe „Was offen
  blieb" unten.
* **Befund (korrigiert 2026-09-03):** Die Roadmap führte „nur Katalog-Treffer,
  kein Signalfluss-Modell" — das war falsch. NDI, NDI-HX, Dante, AES67 und
  ST2110-20/30/40 sind vollwertige `SignalStandard`-Mitglieder mit Bandbreite
  und Impedanz, samt Netz-Budget und drei Plan-Prüfungen. **Was wirklich fehlt,
  ist die Delivery-Hälfte:** SRT, RTMP, HLS, CDN kommen im Quelltext nirgends
  vor.
* **Erste Hälfte erledigt 2026-09-04** (`cable#683`): `SRT`, `RTMP` und `HLS`
  sind `SignalStandard`-Mitglieder mit Richtwert-Bandbreiten (12 / 6 / 10 Mbps
  für je EINEN 1080p50-Weg, im Kommentar ausdrücklich als Richtwert und nicht
  als Messung markiert), es gibt die Katalog-Spec `stream-uplink-cat6`, und der
  Ausspielweg zählt im Netz-Budget mit
  (`tests/ausspielwegImNetzBudget.test.ts`). Bewusst **nicht** in
  `linkCapacityMbpsForStandard`: ein Ausspielweg ist Last, keine Leitung — die
  Verwechslung genau dieser beiden Begriffe war der Befund hinter
  `tests/netzBudgetLastNichtKapazitaet.test.ts`.
* **Was offen blieb (Stand 2026-09-04):** das **Ziel** jenseits des Hauses.
  Ein CDN oder ein Streaming-Endpunkt ist kein Gerät im Raum, und der Plan
  hatte damals keinen Ort dafür. Das ist ein Datenmodell-Schritt (wo wohnt ein
  Ausspielziel, was steht an ihm, wie erscheint es im Signalfluss) und keine
  weitere Bandbreitenzeile.
* **Nachgesehen 2026-09-08 — das ist inzwischen gebaut, und der Eintrag war
  schlicht veraltet.** Alle drei Teilfragen sind beantwortet, jede an einem
  benennbaren Ort:
  * *Wo wohnt ein Ausspielziel?* — `types/delivery.ts`:
    `DeliveryDestination` mit `DeliveryTransport` (SRT/RTMP/HLS),
    `EncodingProfile`, `SrtMode` und `DeliveryPlatform`. Am Projekt hängt es
    als `project.deliveryDestinations` (`types/project.ts`).
  * *Was steht an ihm?* — Encoder-Profil, Plattform, Modus; der Stream-Key
    ausdrücklich **nicht** (der liegt im OS-Credential-Store, das Projekt
    trägt nur die Tatsache, dass einer hinterlegt ist).
  * *Wie erscheint es im Signalfluss?* — `lib/deliveryPath.ts`: die Naht ist
    ein Feld, `encoderEquipmentId` zeigt auf das Gerät, das ausspielt, und
    von dort läuft die Rückwärtssuche im Kabelgraph (`resolveSignalSource`,
    ADR-001). Ein Ausspielziel ist damit kein zweiter Graph neben dem Plan,
    sondern ein Endpunkt **im** Plan.
  * Dazu die Prüfungen: Machbarkeit des Encoders, Ausweichplan, Parität
    (`deliveryPath`/`deliveryParity`/`encoderFeasibility`/`fallbackPlan`,
    zusammen 101 Tests). Gebaut in `cable#703`, `cable#707`, `cable#710`
    (Bedarfe 30–34, 36).
* **Lehre für diese Datei:** Ein „was offen bleibt", das nach dem Bau der
  Sache nicht angefasst wird, ist schlimmer als kein Eintrag — er schickt
  jemanden los, etwas zu bauen, das schon steht. Wer eine Hälfte erledigt,
  liest die andere Hälfte des Eintrags mit.
* **Aufwand:** ~~groß~~ erledigt

### B-11 · Sechs Kataloge ohne Beleg

* **Status:** offen
* **Befund (korrigiert):** Von 17 `*Catalog.ts` führen 8 kein
  `manufacturerUrl` — davon können zwei es gar nicht (`connectorCatalog` hält
  Steckertypen, `wirelessCatalog` hält `WirelessDevice`; das Feld sitzt an
  `EquipmentTemplate`). Echte Recherche brauchen: `blackmagic`, `camera`,
  `greengo`, `misc`, `monitor`, `ubiquiti`.
* **Nachgeprüft 2026-09-04:** weiterhin offen. `grep -c manufacturerUrl` über
  `blackmagicCatalog.ts`, `cameraCatalog.ts`, `greengoCatalog.ts`,
  `miscCatalog.ts`, `monitorCatalog.ts`, `ubiquitiCatalog.ts` liefert
  **sechsmal 0**. Zusammen sind das **159** Einträge.
* **In dieser Umgebung nicht machbar, und zwar belegt:** Die
  Hersteller-Domänen laufen in den Egress-Filter — gemessen
  `blackmagicdesign.com`, `ui.com` und **`lynx-technik.com`**, dessen URLs
  hier bereits im Code stehen. Weder eine neue noch eine vorhandene Adresse
  lässt sich von hier aus öffnen; die Websuche liefert Händlerseiten (B&H,
  Markertek, Full Compass), keine Hersteller-Produktseiten.
* **Deshalb bleibt es liegen, statt geraten zu werden:** 159 URLs
  einzutragen, die niemand geöffnet hat, wäre genau der Fehler, gegen den die
  Belegkette dieses Repos gebaut ist — ein `manufacturerUrl`, der ins Leere
  zeigt, ist schlechter als ein leeres Feld, weil er Prüfbarkeit behauptet.
* **Was dabei herausfiel:** Von den 253 **vorhandenen** Belegen zeigt einer
  auf einen Händler (Behringer X32 → Markertek), während der Eintrag 25
  Zeilen darunter auf `behringer.com` zeigt. Seit `cable#672` hält ein Guard
  das fest, mit einer begründeten Ausnahme, die von selbst wegfällt.
* **Aufwand:** mittel (Recherche, kein Code) — braucht eine Umgebung mit
  Netzzugang zu den Herstellern

---

### B-15 · `EquipmentItem.powerWatts` ist ein Schreib-nur-Feld

* **Status:** offen — **entschieden (E-8, 2026-09-08): ja, mit genannter Herkunft je Zeile; `powerConsumptionWatts` hat Vorrang**
* **Befund (gemessen 2026-09-04, cable-planner):** `cable-planner` hat **zwei**
  Leistungsfelder am Gerät. `powerConsumptionWatts` (#76) ist laut eigener
  Typ-Doku „Fed into the Power-Consumption calculator and the equipment BOM
  totals row" — das stimmt. `powerWatts` (#167, Rentman-Engineering-Daten) hat
  **8 Fundstellen und keinen einzigen Konsumenten**:

  | | |
  | --- | --- |
  | geschrieben | Rentman-Import (`RentmanImportDialog.tsx:594`, Quelle `rentmanImportHelpers.ts:160` aus `power_consumption`/`power`/`wattage`), Template-Merge (`equipmentSlice.ts:429`) |
  | persistiert / gediffed / gecacht | `projectStore.ts:840`, `planDiff.ts:216` (als `substantive`), `rentmanTemplateCache.ts:68`, `modelFields.ts:86` |
  | gelesen | **nur** `equipmentSelectors.ts:64` — und dessen `powerWatts`-Ergebnis konsumiert niemand; alle vier Aufrufer nehmen ausschließlich `.weightKg` |
  | angezeigt | **nirgends** |
  | summiert | **nirgends** |

* **Die Typ-Doku nennt zwei Konsumenten, die es nicht gibt.** Sie behauptet
  „Werden in den Properties angezeigt und vom 3D-Rack-Builder (#170) für die
  Tiefen-Visualisierung genutzt". Gemessen: keine Properties-Section liest
  `powerWatts` (`PowerConsumptionSection.tsx:22` liest
  `powerConsumptionWatts`), und in `components/Rack/` kommt `powerWatts`
  **kein einziges Mal** vor.
* **Gegenprobe am Zwillingsfeld:** `weightKg` steht im selben Typ-Block, mit
  derselben Herkunft — und hat **34** Fundstellen mit echten Konsumenten. Die
  Asymmetrie ist der Beleg, dass hier etwas liegengeblieben ist und nicht,
  dass das Feld absichtlich stumm wäre.
* **Warum das nicht nebenbei entschieden wird:** `item.powerWatts` in die
  Leistungskette aufzunehmen würde die **Zahlen bestehender Projekte
  verändern** — bei jedem Plan mit Rentman-Import springt die Gesamtlast von
  0 W auf einen echten Wert. Das kann richtig sein (die Daten liegen ja vor)
  oder falsch (die Felder sind bewusst getrennt: Katalogwert vs. gemessene
  Aufnahme). Beides ist vertretbar, und die Entscheidung gehört nicht in einen
  Refactoring-PR.
* **Sichtbar gehalten statt vergessen:** `cable#668` nimmt das Feld
  ausdrücklich **nicht** in die Kette auf und hält das mit einem Test fest
  (`effektiveLeistung.test.ts`: „nimmt `powerWatts` des GERAETS bewusst NICHT
  auf"), plus Begründung am Helfer. Wer die Entscheidung kippt, kippt einen
  benannten Test — nicht aus Versehen.
* **Was auf jeden Fall falsch ist:** die Typ-Doku. Sie nennt Konsumenten, die
  es nicht gibt — unabhängig davon, wie E-8 ausgeht.
* **Doku-Teil erledigt (`cable#681`, 2026-09-04).** Der Satz ist durch den
  gemessenen Stand ersetzt: `weightKg` wird über `categorySchemas.ts`
  („Eigengewicht"), `AnalysisDialog`, `LocationBomDialog`, `InventoryDialog`
  und CSV-Import gelesen, `powerWatts` von nichts; `components/Rack/` nennt
  keines von beiden, die Tiefe kommt aus `depthMm`.
  Festgehalten als **berechnete** Prüfung, nicht als Prosa
  (`tests/effektiveLeistung.test.ts`): eine fällt, sobald `Rack/` eines der
  Felder benutzt — nicht um das zu verbieten, sondern damit die Doku
  mitwandert —, die zweite, wenn der widerlegte Satz zurückkehrt. Beide
  einzeln rot gemacht und wieder zurückgenommen.
  **Die Entscheidung selbst (E-8) bleibt offen**, und dieser Eintrag bleibt es
  deshalb auch. Der Reiz, ihn jetzt abzuhaken, ist genau die Falle, die B-15
  beschreibt: es sähe erledigt aus, und das stumme Feld bliebe stumm.
* **Aufwand:** Doku erledigt; Rest = Entscheidung

---

### B-16 · Acht von dreizehn Suite-Tabs schalten nichts

* **Status:** ~~offen~~ **erledigt 2026-09-05** (`suite#100`) — entfernt, nicht ausgebaut
* **Befund (nachgeprüft 2026-09-04):** `registry.ts` definiert 13 Tabs über
  fünf Module. Die Shell hat sehr wohl **eigene** Views — `OverviewSurface`,
  `BoardCanvas`, `previews.tsx` sind Shell-Code, kein iframe. Der Befund liegt
  woanders: **der Tab-Wechsel selbst ist ein No-Op.** `activeTab` kommt im
  gesamten Shell-Code an genau vier Stellen vor, und **alle vier** sind
  Anzeige:

  ```
  App.tsx:437        activeTab={tabs[moduleId]}      weiterreichen
  TabDeck.tsx:40/58  activeTab                       Prop + Typ
  TabDeck.tsx:101    <Tabs active={activeTab} …>     markieren
  ```

  Kein einziger Lesepfad wählt damit einen Inhalt aus.
* **Schadensweg:** Der Nutzer klickt im Modul „Kameras" auf „3D-Vorschau"
  (oder wählt es in der Befehlspalette). Die Markierung wandert, der Inhalt
  bleibt exakt derselbe 2D-SVG-Plan. Keine Fehlermeldung, kein Hinweis — es
  sieht aus, als sei die 3D-Ansicht kaputt, nicht als gäbe es sie nicht.
* **Entschieden: entfernt (`suite#100`).** Nachgezählt waren es nicht acht von
  dreizehn, sondern **dreizehn von dreizehn** — auch „Zusammenfassung" und
  „Plan-Checks" auf der Übersicht und „Board"/„Moodboard" schalteten nichts.
  Ausbauen hätte geheißen, dreizehn Ansichten zu erfinden, von denen die drei
  Planer-Module ihre eigenen schon mitbringen (der eingebettete Planer hat
  seine Ansichtsleiste). Die Tab-Zeile ist deshalb weg; der Umschalter
  „Zur Übersicht / Im Planer öffnen" bleibt, weil er wirklich umschaltet.
  Damit fallen auch die Tab-Einträge aus der Befehlspalette, die dort dasselbe
  Nichts taten.
* **Aufwand:** ~~klein (entfernen) / groß (ausbauen)~~ erledigt

### B-17 · Die dokumentierte Dev-Einbettung trifft nie einen laufenden Planer

* **Status:** ~~offen~~ **erledigt 2026-09-07** (`cable#763`, `multicam#106`,
  `light#90`, `suite#155`) — die drei Planer pinnen jetzt genau die Ports,
  die Shell und README seit jeher nennen: 4181 / 4182 / 4183, jeweils mit
  `strictPort: true`.

  **`strictPort` ist nicht Beiwerk, sondern die zweite Hälfte des Defekts.**
  Ohne die Angabe rückt Vite bei besetztem Port still weiter; dann stimmt die
  Zahl in der Konfiguration zwar, der laufende Server hört aber woanders — und
  genau dieses stille Weiterrücken war der Grund, warum der zweite gestartete
  Planer nicht mehr gefunden wurde. Ein Startfehler mit Portnummer ist die
  bessere Meldung.

  Der Wächter (`npm run devports:check`, in CI) misst **nicht** gegen die
  README — dann wäre die README die Wahrheit, und die kann veralten, ohne dass
  es auffällt. Er vergleicht zwei Quellen, die beide Code sind: den
  Dev-Fallback in `apps/shell/src/modules/registry.ts` gegen den `server.port`
  in der `vite.config.ts` des jeweiligen Planers, und verlangt `strictPort`.

  E-10 (wo die Dev-URLs herkommen sollen — Manifest, Env oder Fallback) bleibt
  davon unberührt: falsch waren die **Defaults**, nicht der Mechanismus.
* **Befund (nachgeprüft 2026-09-04):** Die Dev-Fallback-URLs der Shell stehen
  auf `4181`/`4182`/`4183` (`registry.ts:73/91/109`, so auch in `README.md`
  Zeile 144-146 dokumentiert). **Kein Planer hört je auf diesen Ports:**
  `multicam-planner/vite.config.ts:18` setzt ausdrücklich `port: 5173`, cable
  und light setzen gar keinen und landen damit auf dem Vite-Default 5173 —
  der zweite gestartete rückt auf 5174 weiter.
* **Es ist nicht der Ausnahmefall, sondern der Normalfall:** wer der README
  Schritt 3+4 wörtlich folgt, sieht sechs Sekunden „wird geladen…" und danach
  „Signal-Flow ist gerade nicht erreichbar".
* **Nicht fest verdrahtet:** `plannerUrl()` (`registry.ts:44-46`) liest zuerst
  ein gebündeltes Manifest, dann `VITE_PLANNER_*`, erst dann den Fallback. Die
  Env-Variablen stehen sogar in der README. Falsch sind die **Defaults**, nicht
  der Mechanismus.
* **Nur Entwickler-Schaden**, kein Endnutzer-Schaden: die ausgelieferte
  Desktop-Suite nimmt den gebündelten Pfad.
* **Aufwand:** klein

### B-18 · Cross-Link: die Shell hört, aber niemand ruft

* **Status:** offen — **entschieden (E-11, 2026-09-08): ja, über den Id-Raum des Seed-Protokolls**
* **Befund (nachgeprüft 2026-09-04):** `avplan:navigate` kommt in der ganzen
  Suite **dreimal** vor, und keine davon ist ein Sender:

  ```
  apps/shell/src/App.tsx:336     if (msg.type === 'avplan:navigate' …)   Empfänger
  packages/ui/src/embed.ts:25    type: 'avplan:navigate'                 Typdefinition
  packages/ui/dist/embed.d.ts:21 (Build-Artefakt derselben Zeile)
  ```

  Der Bus hat für Theme, Settings, Command und Lexware jeweils `post*`/`request*`-Helfer.
  Für Navigate gibt es **keinen** — nur den Typ. Die Richtung Planer → Shell
  ist damit nicht implementiert, nicht bloß ungenutzt.
* **Schadensweg:** Kein Datenschaden. Der Nutzer wählt im Eigenschaften-Panel
  eine Kamera und klickt „Im Signal-Flow zeigen": die Shell wechselt korrekt
  das Modul, aber die Auswahl geht verloren — er muss das Objekt drüben von
  Hand wiederfinden.
* **Aufwand:** klein (Sender ergänzen) — aber siehe E-11: es braucht einen
  gemeinsamen Id-Raum, sonst zeigt der Sprung ins Leere.

### B-19 · Lexware: zwei Bedingungen, die sich gegenseitig ausschließen

* **Status:** offen — **entschieden (E-12, 2026-09-08): eigene Shell-Domäne; der Planer-Handler entfällt**
* **Befund (nachgeprüft 2026-09-04):** Der Key-Weg (hinterlegen + Verbindung
  testen) ist echt und vollständig — bis zum HTTPS-Aufruf gegen
  `api.lexoffice.io`. Der **Beleg-Weg**, über den überhaupt erst ein Angebot
  oder eine Rechnung entsteht, ist durchtrennt, und zwar an einer besonders
  unglücklichen Stelle. `connectShellLexware`
  (`packages/ui/src/embed.ts:327`) hält sich absichtlich heraus, wenn die Seite
  **nicht** eingebettet ist (`window.parent === window` → No-op). Der Handler
  in `apps/cable-planner/src/renderer/lib/shellLexware.ts` greift dagegen auf
  `window.cablePlanner!` zu — die **Electron-Preload-Bridge**.

  | Modus | eingebettet? | `window.cablePlanner`? | Ergebnis |
  | --- | --- | --- | --- |
  | iframe (**Standard**) | ja → Brücke aktiv | **nein**, kein Preload | Handler wirft, Shell bekommt `{ok:false}` |
  | `WebContentsView` (`NATIVE_CABLE`, laut `main.cjs:18` **standardmäßig aus**) | nein → Brücke **No-op** | ja | Shell bekommt **gar keine** Antwort |

  Die beiden Bedingungen sind Spiegelbilder: der Weg läuft genau dort, wo seine
  Voraussetzung fehlt. In keiner ausgelieferten Konfiguration entsteht ein Beleg.
* **Aufwand:** mittel

### B-20 · Die Shell-Vorschau zeigt echte Daten — aus dem falschen Modell

* **Status:** offen — **entschieden (E-13, 2026-09-08): bleibt eigenständig, wird aber als Vorschau kenntlich**
* **Befund (nachgeprüft 2026-09-04):** Die SVG-Vorschau
  (`apps/shell/src/shell/previews.tsx`) ist **kein** Platzhalter: jede Form
  wird aus dem übergebenen `SuiteProject` gerechnet — Knotenkarten aus
  Position und Name, Bezier-Kabel aus `from`/`to` mit Typ und Länge,
  FOV-Kegel aus `hfovDeg`, Heatmap-Radius aus `dimmerPct`. Auswahl ist mit
  Bibliothek und Eigenschaften-Panel bidirektional verdrahtet.
* **Zutreffend ist der andere Teil:** die Daten stammen aus
  `apps/shell/src/data/project.ts` — einem **shell-eigenen Parallelmodell**,
  nicht aus den eingebetteten Planern.
* **Schadensweg (bis `suite#98`):** Der Nutzer verkabelte im eingebetteten
  Cable-Planer, klickte „Zur Übersicht" und sah weiter die Demo-Verkabelung.
  Nichts an der Oberfläche sagte, dass das ein anderes Datenmodell ist.
* **Verbindende Hälfte erledigt (`suite#98`, 2026-09-05).** Das Parallelmodell
  ist nicht mehr abgeschnitten: die Shell schiebt es als neutralen
  `suite-seed` (`packages/ui/src/seed.ts`) in den geöffneten Planer, jeder
  Planer bildet es auf sein natives Modell ab, und was er daraus macht, meldet
  er zurück. Gemessen am gebauten Stand: Signal 6 Geräte / 5 Kabel, Kameras
  3 von 4 platziert (`Sony FR7 PTZ` löst nicht eindeutig auf), Licht 4 von 6
  (`KL Panel XL`, `PAR 64 CP62` fehlen der Bibliothek) — und die Shell zeigt
  danach **3 Kameras** und **4 Fixtures** statt weiter 4 und 6.
* **Was offen bleibt:** die Shell führt weiter ein eigenes, einfacheres Modell.
  Der Seed trägt nur, wofür sie eine Quelle hat; Ports, Datenblatt,
  DMX-Universum, Rigging-Höhe bleiben beim Planer. Ein gemeinsames
  Datenmodell ist das **nicht** — siehe B-39 für die Liste dessen, was der
  Fluss noch nicht abdeckt.
* **Aufwand:** ~~klein (kennzeichnen)~~ verbunden; groß (zusammenführen) bleibt

---

### B-21 · ~~Der Versions-Vergleich sieht 6 von 14 Kategorien~~

* **Status:** ~~offen (Entscheidung beim Eigentümer, siehe E-14)~~
  **erledigt** (2026-09-08) — beide Hälften: `light#91` (Aussage eingrenzen)
  und `light#95` (die acht fehlenden Kategorien).
* **Befund (nachgeprüft 2026-09-04, light-planner):** `diffProjects`
  (`src/core/diff.ts:112-120`) vergleicht genau sechs Kategorien —
  `fixtures`, `persons`, `trusses`, `walls`, `stageElements`, `ceilings`.
  `ProjectData` hat vierzehn inhaltliche: es fehlen `shapes`,
  `customFixtures`, `fixtureGroups`, `scenes`, `cameras`, `layers`, `floor`
  und `sun`.
* **Schadensweg:** Wer nur Formen verschiebt, eine Szene ändert, eine Kamera
  umstellt oder die Sonne dreht, bekommt im Versions-Dialog **„Keine
  Unterschiede zum aktuellen Stand"**. Das ist keine Lücke in der Anzeige,
  sondern eine Falschaussage: der Nutzer verwirft daraufhin eine Version, die
  sich sehr wohl unterscheidet.
* **Warum das nicht nebenbei entschieden wird:** Der Vergleich braucht pro
  Kategorie eine Beschriftungsfunktion und eine Feldliste (`FieldSpec`) —
  welche Felder eine Änderung *ausmachen* und wie sie benannt werden, ist eine
  Produktentscheidung. Für `layers`, `floor` und `sun` kommt hinzu, dass sie
  keine Listen sind und die vorhandene `diffList`-Maschinerie nicht passt.
* **Ehrliches Zwischenmaß, falls die Erweiterung wartet:** die Aussage der
  Oberfläche auf das eingrenzen, was tatsächlich verglichen wurde. „Keine
  Unterschiede" darf nicht mehr behaupten, als der Vergleich abdeckt —
  verlustfrei-oder-laut gilt auch für eine Aussage über einen Vergleich.
* **Aufwand:** klein (Aussage eingrenzen) / mittel (Kategorien ergänzen)
* **Warum die Eigentümer-Entscheidung doch keine war (2026-09-08):** Die
  Produktfrage lautete „welche Felder machen eine Änderung aus". Sie ist
  beantwortbar, ohne zu raten — nämlich aus dem, was die Oberfläche selbst
  schon als Eigenschaft eines Objekts führt. Zu entscheiden gab es nur einen
  echten Fall, und der hat eine richtige Antwort: die Reihenfolge in
  `fixtureGroups.fixtureIds` bedeutet nichts, also wird **sortiert**
  verglichen. Ohne das hätte jede Umsortierung eine Änderung gemeldet —
  eine Falschmeldung, die den ganzen Vergleich unglaubwürdig macht, und
  damit derselbe Schaden wie der ursprüngliche Befund, nur andersherum.
  Die Gegenprobe dazu steht im Wächter.
* **Was tatsächlich gebaut wurde:**
  * Acht neue `FieldSpec`-Sätze; die drei Nicht-Listen (`layers`, `floor`,
    `sun`) über ein eigenes `diffSingle` — sie haben keine Identität über
    eine `id`, sondern genau ein Vorher und ein Nachher.
  * `ALLE_KATEGORIEN` als **die eine Liste**, aus der `total`, die Ansicht
    (`DiffView.tsx`) und die Zusammenfassung ihre Kategorien ziehen. Vorher
    stand in der Ansicht eine handgepflegte Zweitliste mit sechs Einträgen,
    die beim nächsten Zuwachs still veraltet wäre. Ein `satisfies`-Constraint
    bindet die Liste an die Schlüssel von `ProjectDiff`.
  * `unnamedDifferences` rechnet jetzt den **Rest** aus statt zu raten: jeder
    Schlüssel in `ProjectData`, der weder verglichen wird noch in
    `KEINE_KATEGORIE` steht (vier Ausnahmen, je mit geschriebenem Grund).
    Damit meldet sich der Vergleich von selbst, wenn jemand ein neues Feld
    ins Projekt legt und den Vergleich vergisst — der Befund von B-21 kann
    sich nicht ein zweites Mal unbemerkt bilden.
* **Gegengeprobt** (alle vier rot, zurückgebaut grün): Szenen wieder ohne
  Vergleich · eine Kategorie fehlt in `ALLE_KATEGORIEN` · Umsortierung in
  einer Gruppe gilt als Änderung · zweite Kategorie-Liste in der Ansicht.

### B-22 · Der Lager-Import kennt kein Abbrechen

* **Status:** offen — **entschieden (E-15, 2026-09-08, vom Eigentümer bestätigt): Vorschau-Schritt wie beim Ablauf-Import.** Der Drei-Wege-Dialog und das Undo für den Lager-Store sind damit erledigt, nicht aufgeschoben. **Das Zwischenmaß steht** (`suite#154`, 2026-09-07): Escape und Hintergrund-Klick importieren nicht mehr — es bleibt, bis die Vorschau es ablöst.
* **Befund (nachgeprüft 2026-09-04, beide Kopien):** `doImport`
  (`apps/light-planner/src/inventory/InventoryDialog.tsx:69-81`) fragt nach dem
  Einlesen der Datei genau **eine** Ja/Nein-Frage. `true` heißt ersetzen,
  `false` heißt **zusammenführen** — importiert wird in beiden Fällen. Einen
  Weg, den Import an dieser Stelle noch abzubrechen, gibt es nicht.
* **Schadensweg:** In der Suite ist die Frage ein `confirmDialog`; dessen
  `false` kommt nicht nur vom Zweit-Knopf, sondern auch von **Escape** und vom
  **Klick neben den Dialog** (`packages/ui/src/dialog.tsx:113-133`). Beide
  Gesten heißen überall sonst „nichts tun"; hier schreiben sie fremde Artikel
  in den Bestand. `importSnapshot` (`inventory/store.ts:82-101`) ruft
  `persist` sofort, und ein Undo für den Lager-Store existiert nicht — der
  Stand ist danach nicht wiederherstellbar.
* **Warum das nicht neu ist, aber schlimmer wurde:** Upstream fragt mit
  `window.confirm`, und der deutsche Text sagte dort ausdrücklich „Abbrechen =
  zusammenführen". Die Aussage stimmte — die Suite hat den Aufruf durch
  `confirmDialog` mit eigenen Beschriftungen ersetzt, womit der Satz einen
  Knopf beschrieb, den es nicht mehr gibt. Dieser PR zieht den Text nach
  (`Bestehenden Bestand ersetzen?`), die fehlende dritte Möglichkeit bleibt.
* **Warum das nicht nebenbei entschieden wird:** Ein dritter Ausgang passt
  nicht in `confirmDialog` (`Promise<boolean>`). Ob die Antwort ein eigener
  Drei-Wege-Dialog ist, ein vorgeschalteter Vorschau-Schritt („X Artikel, Y
  Lagerorte — übernehmen?") oder ein Undo für den Lager-Store, ist eine
  Produktentscheidung mit sehr unterschiedlichem Aufwand.
* **Ehrliches Zwischenmaß — umgesetzt (`suite#154`).** Escape und
  Hintergrund-Klick importieren nicht mehr. Solange es keinen dritten Ausgang
  gibt, ist „nichts tun" die richtige Bedeutung für beide Gesten.

  Die Ursache lag nicht beim Aufrufer, sondern im **Rückgabetyp**: `boolean`
  kann „hat nein gesagt" und „hat gar nichts gesagt" nicht auseinanderhalten.
  `packages/ui/src/dialog.tsx` hat deshalb ein `choiceDialog` bekommen, das
  `'ok' | 'cancel' | 'dismissed'` liefert; `confirmDialog` ist ein
  Einzeiler darüber (`=== 'ok'`) und damit für alle zehn vorhandenen
  Aufrufer unverändert — für „Wirklich löschen?" heißt `dismissed` weiter
  dasselbe wie `cancel`, und genau deshalb musste dort nichts angefasst
  werden.

  Die beiden Lager-Importe brechen bei `dismissed` ab, ohne zu schreiben; der
  Zweitknopf („Zusammenführen") bleibt eine Absicht und führt weiter zusammen.
  Der Erklärsatz im Dialog beschreibt jetzt, was die Gesten wirklich tun —
  er nannte vorher einen Knopf „Abbrechen", den es nicht gibt.

* **Upstream unverändert:** dort fragt `window.confirm`, dessen Escape
  ebenfalls „zusammenführen" bedeutet. Das lässt sich in einem
  `window.confirm` nicht trennen; der deutsche Text sagt es dort wenigstens
  ausdrücklich. Der Unterschied ist als Suite-Overlay gewollt und im Code
  begründet.
* **Aufwand:** klein (Escape/Backdrop entschärfen) / mittel (dritter Ausgang)

### B-23 · Zwölf Dialoge der Suite sind gar nicht erst gewickelt

* **Status:** **erledigt 2026-09-04** (`light#62`, `light#63`, `suite#72`) —
  `i18n:check` meldet für diese Kopie **keine** gerenderte Komponente ohne
  `t()` mehr.
* **Befund (gemessen 2026-09-04, `i18n:check`):** Die Suite-Kopie ist weit
  gewickelt — `PropertyPanel` 272 `t()`-Aufrufe, `ScheduleDialog` 95,
  `FixtureEditor` 66. **Zwölf** gerenderte Komponenten hatten trotzdem
  **keinen einzigen**: `AreaLightDialog` (~21 sichtbare Stellen),
  `CanvasActions` (~18), `ProjectDialog` (~14), `ThreePointDialog` (~14),
  `ChangesDialog` (~13), `FloorPlanPanel` (~7), `Scene3D` (~7), `ScaleDialog`
  (~5) und vier weitere — zusammen ~110 Stellen.
* **Und zwei Korrekturen an der Messung selbst, beide in dieselbe Richtung:**
  * `Scene3D` (~7) und `PlanCanvas` (~4) standen als Rest auf der Liste. Sie
    haben **keine einzige** deutsche Textstelle — die Heuristik traf
    TypeScript-Vergleiche (`xhr.status >= 200 && xhr.status < 300`).
    Berichtigt in `light#63`, gegengeprüft an den 98 Stellen aus `light#62`:
    97 erkennt die Regel weiter, alle 11 Falschtreffer sind weg.
  * `Onboarding` war mit **einer** Stelle gemeldet und hatte **dreizehn**.
    Die Heuristik liest JSX-Text und vier beschriftende Attribute — nicht
    Zeichenketten in Objekt-Literalen (`title:`, `body:`, `description:`),
    und genau so sind Tour-Schritte und Welcome-Aktionen aufgebaut. Der
    Rahmen dieser Dialoge kam längst übersetzt aus
    `@avplan/onboarding-core`: englische Knöpfe um deutschen Text.
* **Die Zahl bleibt also eine Untergrenze**, und der Check sagt das im
  Kommentar. Sie ist gut genug, um „übersetzt" von „nicht übersetzt" zu
  unterscheiden — nicht, um Arbeit daraus zu planen.
* **Warum das hier schwerer wiegt als upstream:** Der Sprachschalter ist in
  der Suite **erreichbar** (`SettingsModal` → `App.tsx:450` → `PlannerFrame` →
  `shellSettings.ts:51` → `uiStore`). Wer auf Englisch stellt, bekommt diese
  zwölf Dialoge auf Deutsch — kein latenter, sondern ein sichtbarer Zustand.
  Upstream ist derselbe Befund folgenlos, weil der Schalter zu ist (B-13).
* **Warum es kein Beiwerk dieses PRs war:** Wickeln heißt, für jede Stelle
  einen Schlüssel zu vergeben und die deutsche Quellform als Fallback zu
  setzen. Über ~110 Stellen ist das eine eigene, prüfbare Arbeit — mit dem
  Vendoring der englischen Schlüssel vermischt wäre weder das eine noch das
  andere nachvollziehbar geblieben.
* **DoD (erfüllt):** `i18n:check` meldet für die Suite-Kopie **0**
  gerenderte Komponenten ohne `t()`; alle **711** erreichbaren Schlüssel
  haben eine englische Fassung.
* **Aufwand:** war mittel

### B-24 · Zwei übersetzte Dateien in `cable-planner`, die niemand rendert

* **Status:** offen — **entschieden (E-16, 2026-09-08): gelöscht**
* **Befund (gemessen 2026-09-04, `tests/i18nErreichbarkeit.test.ts`):**
  `components/Print/PrintDialog.tsx` (16 KB, **34** `t()`-Aufrufe) und
  `components/Canvas/TitleBlock.tsx` (5 KB, **14**) werden **nirgends**
  importiert — weder statisch noch lazy.
* **Die Funktion fehlt nicht:** Gedruckt wird über `ExportDialog`, das
  `printPdfBlob` selbst aufruft; der Schriftkopf im PDF-Export entsteht in
  `exportPdfVector.ts` (`renderTitleBlock`) aus eigenem Code. Beide Dateien
  sind Doppel, keine Lücken.
* **Warum es trotzdem zählt:** 48 übersetzte Zeichenketten und 21 KB Code, die
  bei jeder Suche mitkommen und bei jeder Übersetzungsrunde mit veranschlagt
  werden. Genau dieselbe Form wie `MenuBar`/`Toolbar` in `light-planner`
  (B-13), wo 40 von 42 englischen Schlüsseln toten Code bedienten.
* **Warum nicht nebenbei gelöscht:** 21 KB Code zu entfernen, den jemand
  vielleicht noch anschließen will, ist keine Aufräumarbeit, sondern eine
  Produktentscheidung.
* **Bis dahin:** Der Test benennt beide bei jedem Lauf und lässt keine
  **dritte** Datei still dazukommen.
* **Aufwand:** klein (löschen) / mittel (verdrahten)

### B-25 · `multicam-planner` upstream hat gar keine i18n

* **Status:** offen — **entschieden (E-20, 2026-09-08): Englisch bleibt Quellsprache; zu tun bleibt, sie zu deklarieren**
* **Befund (gemessen 2026-09-04):** Upstream ist die Oberfläche fest deutsch —
  `grep` findet in `src/` **keinen einzigen** `useTranslation`-Aufruf und kein
  `i18n`-Verzeichnis. Die **Suite-Kopie** dagegen ist zweisprachig aufgebaut
  (Englisch als Quellsprache, deutsches Override-Dict in `src/i18n/de/`,
  479 Schlüssel).
* **Schadensweg:** Die Shell schickt die Sprache an alle drei Planer
  (`App.tsx:450`). Im Standalone-MultiCam gibt es niemanden, der sie
  entgegennimmt — wer dort Englisch wählt, bekommt durchgehend Deutsch.
* **Warum das ein Rückweg-Fall ist (B-5):** Die Arbeit ist getan, nur in der
  falschen Richtung. Die Kopien sind an diesen Dateien allerdings weit
  auseinander (`Sidebar.tsx` 129/104 Zeilen zweiseitig), ein Rückweg ist
  deshalb kein Kopieren.
* **Nachgemessen 2026-09-04, und dabei fiel die eigentliche Frage auf:** Die
  Suite-Kopie ist in **14 Dateien** gewickelt und trägt **482** deutsche
  Override-Schlüssel — aber mit **Englisch als Quellsprache**
  (`t('ns.key', 'English source')`, deutsches Override-Dict). `cable-planner`
  und `light-planner` machen es genau andersherum: **Deutsch ist Quellsprache**,
  Englisch das Override. Ein Rückweg „so wie es ist" trüge also die umgekehrte
  Konvention in ein Repo, dessen zwei Geschwister die andere benutzen — und das
  ist keine Formfrage: Quellsprache ist der Text, der im JSX steht und bei
  fehlendem Schlüssel erscheint. Die Richtung später zu drehen heißt, ~500
  Zeichenketten erneut anzufassen.
* **Deshalb nicht geraten:** siehe E-20. Ohne diese Entscheidung wäre jede
  Richtung eine halbe Tageslast, die man im Zweifel wegwirft.
* **Aufwand:** groß

### B-26 · `sony-camera-bridge`: eine Oberfläche, zwei Sprachen

* **Status:** offen — **entschieden (E-17, 2026-09-08): Englisch ist die Quellsprache; zu tun bleibt, sie zu deklarieren**
* **Befund (gemessen 2026-09-04):** Die Web-RCP (`packages/web-rcp/src`) hat
  **172** sichtbare Textstellen und **keine i18n** — kein `useTranslation`,
  kein Wörterbuch. Davon sind **32 deutsch**, der Rest englisch, in denselben
  Dialogen nebeneinander: `ConnectionPanel` beschriftet „Kamera IP
  (WiFi/LAN)", „– Gerät wählen –" und „Kamera-Nr." zwischen englischen
  Feldern; der `FirstStartWizard` fragt „Welche Kamera möchtest du als erstes
  einrichten?" und listet darunter englische Beschreibungen.
* **Warum das zählt:** Das ist kein Übersetzungsrückstand, sondern ein
  uneinheitliches Produkt. Ein Nutzer kann sich auf keine Sprache verlassen,
  und es gibt keinen Schalter, mit dem er etwas daran ändern könnte.
* **Warum es nicht nebenbei entschieden wird:** Welche Sprache die
  Quellsprache dieses Repos ist, steht nirgends. Die übrigen Planer sind
  deutsch-quellig, `multicam-planner` in der Suite englisch-quellig, die
  Intercom-Web-App zweisprachig per Typ. Erst die Antwort entscheidet, ob
  32 Stellen übersetzt oder 140 umgeschrieben werden.
* **Aufwand:** klein (vereinheitlichen) / mittel (i18n einziehen)

### B-27 · Die Ableitung liest den Router-Zustand nicht

* **Status:** erledigt (`cable#675`)
* **Befund (gemessen 2026-09-04, Runde 10):** `buildGraphContext` nimmt nur
  `equipment` + `cables`; `feedingInput` bricht an jedem Router ab. Der
  Videohub-Kreuzpunkt liegt seit `cable#601` im Projekt (`equipment.ts:456`)
  und wird von der Ableitung **nicht gelesen**.
* **Schadensweg, zweifach:** Bei der Standard-Broadcast-Kette Kamera →
  Videohub → ATEM löst der Plan den **Router** als Quelle auf statt der Kamera
  (Initiative 1). Und die Tally-Karte trägt die **Router**-Eingangsnummer
  statt der ATEM-Nummer (`labelDerivation.ts:327` führt beide Senkenarten
  gleichberechtigt, `tallyMap.ts:105` nimmt den ersten Treffer). **Es wird kein
  Befund erzeugt** — die Karte sieht vollständig aus und ist falsch. Das ist
  die schlimmere der beiden Formen: ein sichtbarer Fehler kostet Zeit, ein
  unsichtbarer kostet die Sendung.
* **Warum das genau hier steht:** ADR-001 hat diesen Fall ausdrücklich zum
  Blocker erklärt und ihn zu Inkrement 0 gemacht. Das Inkrement ist gebaut —
  der Zustand wird persistiert — aber **niemand konsumiert ihn**. Formal
  beseitigt, praktisch unverändert, und von keinem Test gedeckt.
* **Nachtrag aus der Gegenrunde (2026-09-04):** Zwei unabhängige Prüfer haben
  den Befund mit **ausgeführten** Proben gegen den echten Quelltext
  nachgestellt und dabei drei Dinge gefunden, die die erste Messung nicht
  hatte:
  1. **Der Fehler ist nicht „erster Treffer gewinnt", sondern total.**
     `feedingInput` (`labelDerivation.ts:188-189`) gibt für *jedes* Gerät mit
     `DeviceKind` `null` zurück. Bei Kamera → Videohub → ATEM entsteht deshalb
     **gar kein** ATEM-Link für die Kamera — nicht bloß ein späterer. Es gibt
     nichts, wonach ein besserer `find()` suchen könnte.
  2. **Das Ergebnis hängt an der Array-Reihenfolge, nicht am Plan.** Identischer
     Plan, identische Kabel, nur `project.equipment` umsortiert:
     `[cam, vh, atem]` → `input 7`, `[cam, atem, vh]` → `input 3`. Beide ohne
     Befund. Das widerspricht der Zusage des Moduls über sich selbst
     (`tallyMap.ts:205-212`: „Wer die Datei später neu erzeugt, trifft dieselben
     Einträge wieder") — die exportierte Nummer ist eine Funktion des
     Bearbeitungsverlaufs.
  3. **Die `.avsourcemap` trägt denselben Defekt.** `sourceMap.ts:194` macht
     exakt denselben ungeprüften Griff, `:208` schreibt dieselbe Router-Nummer.
     Der Befund betrifft also **beide** Ausgabewege, nicht nur `tally.json`.
  Dazu ein vierter Schadensweg, der vorher unbenannt war: `emitUmd`
  (`labelDerivation.ts:288-295`) feuert nur bei `sink === 'atem'` und bekommt
  dort den *Videohub* als Quelle. In Router-Plänen gibt es deshalb **null**
  UMD-Kandidaten für Kameras, `labelTargetIssues` prüft keinen einzigen
  Kamera-UMD-Text, und der offene Anker lautet wörtlich „Smart Videohub 20x20
  speist ATEM Mini Extreme auf Eingang 1 — ohne gebundene Rolle gibt es keinen
  Ort für die UMD-Adresse". Die App fordert den Nutzer also auf, **dem Router**
  eine Rolle und eine UMD-Adresse zu geben. Das ist keine Nichtaussage, das ist
  eine falsche Anweisung, die vom Fehler wegführt.
* **Warum das die Priorität hebt:** `tallyMap.ts:13-21` schreibt selbst auf,
  warum eine erfundene Nummer schlimmer ist als ein fehlendes Feld — „sie sieht
  aus wie eine Zusage und schaltet die falsche Lampe". Genau das tut das Modul
  heute in jedem Plan mit einem Router im Weg. Es ist Kategorie (c) — der Code
  tut nicht, was er verspricht — und nicht bloß (b).
* **DoD:** `buildGraphContext` bekommt den Routing-Zustand; `feedingInput`
  geht durch einen Router hindurch, wenn ein Kreuzpunkt gesetzt ist; ein Test
  über die Kette Kamera → Videohub → ATEM belegt Quelle **und**
  ATEM-Eingangsnummer. **Und, unabhängig davon, ob der Kreuzpunkt bekannt ist:**
  wo die Kette nicht bis zum Tally-Mischer aufgelöst werden kann, gibt es
  **keine Zahl** und stattdessen einen Befund — in `tally.json` *und* in der
  `.avsourcemap`. Die Auswahl wird deterministisch (kein `find()` über die
  Geräte-Reihenfolge).
* **Aufwand:** mittel

### B-28 · Die Rolle besitzt die Mischer- und Router-Labels nicht

* **Status:** erledigt (`cable#682`) — `roleLabelsByPort` in
  `labelDerivation.ts` liefert je Eingangsport eines Routers/Mischers den
  Namen der gebundenen Rolle, durch Router-Kreuzpunkte hindurch. `deriveLabels`
  und **beide** Exporter (ATEM-Long/Short, Videohub-Labels über .txt,
  Protokoll-Dump, Label-PDF, TCP-Push und die Tabelle im Dialog) lesen
  dieselbe Auflösung — getrennte Kopien hätten die TREUE-REGEL am Kopf von
  `labelDerivation.ts` gebrochen und den Plan-Check Kollisionen auf Texten
  melden lassen, die nie ein Gerät erreichen.
  Router- und ATEM-**Ausgänge** bleiben bewusst beim Portnamen: dort trägt der
  Kreuzpunkt zur Laufzeit das Ziel, nicht die Verkabelung. Der ATEM-Fall ist
  mit einer Marke an der Stelle begründet, und die Marke wird **gezählt**,
  damit der Guard nicht mit Marken zugeschüttet wird.
  Ein bestehender Test (`sourceMap.test.ts`) ist dabei gefallen und wurde
  angefasst statt umgangen — er hatte den Fall im eigenen Kommentar
  vorhergesagt.
* **Vorher:** offen
* **Befund (gemessen 2026-09-04, Runde 10):** Ein Umbenennen der
  `SourceIdentity` ändert den UMD-Text, die `.avsourcemap` und die Tally-CSV —
  aber **nicht** den ATEM-Lang-/Kurznamen und **nicht** die Videohub-Labels.
* **Warum das der Kern der Zusage ist:** Initiative 1 heißt „Rename kostet eine
  Änderung", und die Feature-Matrix führt „Switcher mnemonics generated" und
  „Router source/destination labels generated" als Zielzeilen. Genau die zwei
  Systeme, in die ein Name heute weiterhin von Hand getippt wird, hängen nicht
  an der Rolle. Die Bedarfs-Datenbank nennt das achtmal aus acht Berufen
  (P1 #5, #9): „Stop typing camera identity into six to eight systems."
* **Aufwand:** mittel

### B-29 · Mobile- und Viewer-Ansicht umgehen die Port-Label-Engstelle

* **Status:** erledigt (`cable#675`)
* **Befund (gemessen 2026-09-04, Gegenrunde):** `cable#6xx` hat die
  Port-Beschriftung auf **eine** Stelle zusammengezogen (`lib/portLabel.ts`) und
  einen Guard dazugestellt, der verhindert, dass jemand die Kette nachbaut. Der
  Guard globt `../src/renderer/**/*.{ts,tsx}`
  (`tests/portLabelAdoption.test.ts:236`) — `src/mobile/` und `src/viewer/`
  liegen außerhalb.
* **Wirkung:** `MobileApp.tsx:785` rendert `{p.name}` roh, `:810`
  `{otherPort.name}` roh; `grep` nach `portDisplayLabel|resolvePortLabel|
  portLabelPair` über `src/mobile` und `src/viewer` findet **null** Treffer. Die
  LAN-Ansicht am Telefon zeigt damit `1 SDI 3G PGM (1080p50/60)`, wo Canvas,
  Patchliste, Geräte-PDF und jeder Export `PGM` zeigen.
* **Warum ausgerechnet dort:** Das ist die Oberfläche des Technikers **während
  des Aufbaus** — die einzige, die jemand mit einem Stecker in der Hand ansieht.
  Von allen Stellen, an denen die Beschriftung abweichen darf, ist das die
  teuerste.
* **Warum der Guard es nicht finden kann:** Er sucht mit
  `/contentLabel[^)\n]{0,40}\|\|/` eine *nachgebaute* Kette. `mobile` baut
  nichts nach — es ignoriert `contentLabel` schlicht. Der Guard belegt „keine
  zweite Kopie der Kette", nicht „jede Oberfläche geht durch die Engstelle".
  Das ist derselbe Fehler wie bei `i18n:check`, der nur eine der beiden
  Wörterbuch-Formen las: eine Prüfung, deren Erfassungsbereich enger ist als
  ihre Zusage.
* **DoD:** `src/mobile` und `src/viewer` gehen durch `portDisplayLabel`; der
  Guard-Glob deckt `../src/**/*.{ts,tsx}` statt nur `renderer`; ein zweiter
  Guard belegt positiv, dass keine Oberfläche `port.name` roh rendert.
* **Aufwand:** klein

### B-30 · Serialisierte Einheiten zählen für die Lagerdeckung nicht

* **Status:** erledigt (`cable#677`)
* **Befund (2026-09-04, Gegenrunde):** `buildPlanBom(equipment, items, nodes)`
  und `resolveCoverage(equipment, items)` nehmen `units` **gar nicht entgegen**.
  `types/inventory.ts:185` kennt `UnitCondition = 'ok' | 'defect' | 'inRepair' |
  'retired'`, und `InventoryUnit` trägt einen eigenen `locationId`. Beides ist
  über die Oberfläche gepflegt (`InventoryDialog.tsx:447` Tab „Einheiten",
  `:1258` Zustands-Dropdown, `:1273` `moveUnit`).
* **Schaden:** Vier Geräte im Bestand, zwei davon in Reparatur → die Stückliste
  sagt „gedeckt, Bestand 4", die Kommissionier-Liste schickt jemanden nach vier.
* **Warum das besonders ärgert:** Der Code weiß an anderer Stelle sehr wohl,
  dass der Zustand Lager-Information ist — `packList.ts:69-76` trägt `condition`
  in die Packliste, `inventoryReport.ts:39/83` zählt nach Zustand. Nur die
  Liste, die **ins Lager geht**, nicht.
* **DoD:** `resolveCoverage` bekommt die Einheiten; ein Test mit zwei `inRepair`
  belegt, dass sie nicht als Bestand zählen.
* **Aufwand:** mittel

### B-31 · Bedarf, der außerhalb von `project.equipment` liegt

* **Status:** erledigt — Rack-Hälfte (`cable#677`), `drumKit`/`wirelessRig` (`cable#678`)
* **Befund (2026-09-04, Gegenrunde):** `groupPresetSpawnSlice.ts:197-236` legt
  für ein eingefügtes Rack **genau ein** `EquipmentItem` an (Kategorie `Rack`,
  ohne `deviceTypeId`); die enthaltenen Geräte leben nur im
  `rackInternalSnapshot` (`types/equipment.ts:345-357`: nur
  name/startUnit/rackUnits/rentmanId). `deriveDemand` liest ausschließlich
  `equipment` — `rack`/`rackInternalSnapshot` kommen in `planBom.ts` und
  `inventoryCoverage.ts` kein einziges Mal vor.
* **Schaden:** Ein 12-Geräte-Rack erscheint als „1× FOH Rack (Rack) — nicht im
  Lager", ohne jeden Hinweis, dass zwölf Positionen darunter verschwinden.
  Stiller Unterlauf.
* **Verwandt:** `types/project.ts:222/225` — `drumKit` und `wirelessRig` liegen
  ebenfalls außerhalb von `project.equipment` und tauchen in keiner Stückliste
  auf. Der Funkstrecken-Plan plant Sender-Bodies und Kapseln mit echter
  Katalog-GUID; die Drum-Mikrofonierung hat stattdessen ihre **eigene, zweite**
  Materialliste (`lib/drumMicing.ts:198-229`, nur Zwischenablage, kein CSV,
  kein Lagerabgleich).
* **Was `cable#677` geschlossen hat:** `deriveDemand` sieht die Rack-Inhalte, in
  einer zweiten Phase gegen die vorhandenen Zeilen (sonst hinge das Ergebnis an
  der Array-Reihenfolge). Rack-Inhalte sind **Vorschläge**, weil der Snapshot
  nur einen Namen trägt, und die Zeile nennt das Rack, aus dem sie stammt.
* **Was offen bleibt — und warum es eine eigene Änderung ist:** `drumKit.mics`
  und `wirelessRig.channels` tragen **echte Katalog-GUIDs**, ließen sich also
  als *Tatsachen* zuordnen statt als Vorschläge. Das ist die bessere Lage als
  beim Rack, verlangt aber eine neue Bedarfsquelle in `deriveDemand` und eine
  Entscheidung, wie Positionen ohne Katalog-Typ erscheinen: `deriveDrumBom`
  leitet zusätzlich **Stative, Kessel-Clamps und XLR-Kabel** ab
  (`drumMicing.ts:198-222`), und die gibt es im Gerätekatalog nicht. Sie
  einfach wegzulassen wäre derselbe stille Unterlauf noch einmal.
* **DoD:** `deriveDemand` bekommt `drumKit` und `wirelessRig` als eigene
  Bedarfsquellen; die abgeleiteten Verbrauchsmaterialien erscheinen als eigene,
  als solche erkennbare Zeilen; `deriveDrumBom`/`drumBomToText` gehen durch
  dieselbe Projektion oder verschwinden — heute sind sie eine zweite
  Materialliste, die nur in die Zwischenablage geht und das Lager nie sieht.
* **Aufwand:** mittel

### B-32 · Der Übergabe-Stempel deckt nur die halbe Seite

* **Status:** erledigt (`cable#677`)
* **Befund (2026-09-04, Gegenrunde, von zwei Prüfern unabhängig):** Der
  Fingerabdruck läuft über `handoverTable` = `assetRegisterTable` ∪
  `cableBomTable` (`handoverPackage.ts:38-44`). Gedruckt wird mehr: der
  Commissioning-Abschnitt (`:91-98`) liest `c.installStatus` und `c.testResult`,
  der Umfang-Abschnitt `project.locations`. **Keine dieser Größen geht in den
  Fingerabdruck** — `assetRegisterTable` stammt aus `project.equipment` (Kabel
  kommen dort nicht vor), `cableBomTable` aggregiert nach
  `${c.type}|${len}|${c.isTieLine}`.
* **Schaden, beide Enden UI-erreichbar:** Übergabe drucken → in
  `CableProperties.tsx:248` `setCableInstallStatus` setzen → §3 auf dem Blatt
  ist nachweislich falsch, aber `currentStand('uebergabe', project)` liefert
  unverändert denselben Wert, und der Rückweg meldet grün „aktueller Stand".
* **Warum das die schwerste Stelle ist:** ADR-004 bezeichnet dieses Blatt selbst
  als das schwerste — „das Blatt geht an den Betreiber und liegt dort
  jahrelang". Kein Test deckt es: `documentStamp.test.ts:325-332` weist Drift
  nur über die Kabellänge nach, die in der BOM steht.
* **DoD:** `handoverTable` deckt den gedruckten Inhalt; ein Test ändert
  `installStatus` und belegt, dass der Stand sich bewegt.
* **Aufwand:** klein

### B-33 · Der Beleg für geratene Ports lässt sich durch eine Umsortierung löschen

* **Status:** erledigt (`cable#677`)
* **Befund (2026-09-04, Gegenrunde):** `PortsSection.tsx:33-47` (`applyPorts`)
  löscht bei **jeder** Port-Änderung `specSource.inputs` **und**
  `specSource.outputs`. Auslöser ist jede `PortList`-Änderung — ein Zeichen im
  Namensfeld *eines* Inputs löscht auch den Beleg der Outputs, und
  `handleDragEnd` → `onChange(arrayMove(...))` löscht beide Seiten bei einer
  **Umsortierung, die keinen einzigen Wert ändert**. Danach ist
  `drawingChecks.ts:583` still — genau das Schweigen, gegen das `#650`
  geschrieben wurde.
* **Verschärfend:** `PortAiSuggestButton` rendert nur bei leeren Port-Listen.
  Nach dem Anwenden des Vorschlags ist der Knopf weg; jede weitere Berührung
  läuft zwingend durch den Löscher.
* **Zwei weitere Hälften desselben Befunds:** (a) Der Beleg wird gespeichert und
  **nirgends gezeigt** — 13 Fundstellen für `specSource`, keine liest `.source`
  oder `.value` zur Anzeige; bis zu 160 Zeichen Fundstelle aus dem Web-Weg sind
  schreibgeschützte Deko. (b) `equipment.specSource` fehlt im hauseigenen
  Provenienz-Register (`types/provenance.ts:81-97`), obwohl es der jüngste und
  breiteste Herkunftsträger ist — und `provenance.test.ts` prüft nur die
  Vorwärtsrichtung, nie „jedes herkunftstragende Feld ist deklariert".
* **DoD:** Nur die geänderte Seite verliert ihren Beleg, und nur bei geänderten
  Werten; ein Test fährt `applyPorts` (heute prüft der Guard nur, dass die
  Zeichenkette `delete rest.inputs` im Quelltext steht). `specSource` steht im
  Provenienz-Register, und das Register prüft beide Richtungen.
* **Aufwand:** klein bis mittel

### B-34 · ~~Die Zeitachse fehlt in allen acht Repos~~

* **Status:** ~~offen~~ **erledigt** (2026-09-08) — in zwei Schritten, von
  denen der erste schon lag: `suite#142` (Ablauf einlesen und verknüpfen)
  und der hier (die Umkehrung: wann wird DIESES Objekt gebraucht).
* **Befund (2026-09-04, Korpus-Durchgang):** **Kein Datensatz in keinem der acht
  Repos kann sagen, WANN ein Gerät, eine Kamera oder ein Fixture gebraucht
  wird.** `cable-planner` führt an Projekt und Gerät nur `updatedAt` und
  `handoverDate`, das Inventar keinen Zeitraum, `multicam`s `Shotlist` ist eine
  Reihenfolge ohne Uhr. Der einzige Zeitbezug im ganzen Baum ist eine
  dreispaltige Notizliste in der Suite-Shell
  (`apps/shell/src/data/project.ts:24-28`, `ScheduleItem {time,title,dept}`) —
  ohne Import, ohne Export, ohne eine einzige Referenz auf ein Planer-Objekt.
* **Wie groß das ist:** **Fünf der zwölf P1-Bedarfe ohne Initiative** setzen
  einen Ablauf-/Rundown-Datensatz voraus. Die Bedarfs-Datenbank nennt es selbst
  „the largest gap for AV Planner Suite specifically" (`USER-NEED-DATABASE.md`,
  Bedarf 8). Die gebaute Change-Impact-Sicht beantwortet dieselbe Frage nur
  Plan-gegen-Plan, nie Zeitplan-gegen-Plan.
* **Warum es in der Roadmap unsichtbar ist:** Es ist keiner der zwölf
  Initiativen zugeordnet und taucht in der Tabelle in Abschnitt 3b deshalb gar
  nicht auf. Das ist eine Eigenschaft der Tabelle, nicht des Bedarfs.
* **DoD:** Eigentümer-Entscheidung zuerst (E-18) — ob die Suite die Zeitachse
  überhaupt besetzt. Erst danach ein Datenmodell.
* **E-18 ist seit 2026-09-07 entschieden: NUR LESEN.** Damit war die DoD-Sperre
  weg, und `suite#142` hat das Datenmodell gebaut: `packages/ui/src/rundown.ts`
  (`Rundown`, `RundownItem` mit `startMin`/`durationMin`, `RundownRef` auf
  Seed-Objekte **über deren Id**, `ref-missing` als Befund) plus fünf
  Empfänger-Sichten in `rundownViews.ts`. Der Ablauf wird eingelesen, nicht
  hier geführt — die Autorenschaft bleibt in der Tabelle des Kunden.
* **Was danach noch fehlte, und wonach der Befund wörtlich fragt:** die
  **Umkehrung**. Der eingelesene Ablauf beantwortet die Frage der Regie („was
  passiert um 14:20"). Der Befund fragt die der Technik — „**WANN** wird ein
  Gerät gebraucht" —, und dafür gab es keinen Index: `rundownCoverage` zählt
  nur, **ob** ein Objekt überhaupt vorkommt.
* **Gebaut 2026-09-08:**
  * `rundownSchedule(rundown, seed)` — je Objekt des Plans die Ablauf-Punkte,
    in denen es vorkommt, dazu `firstMin`, `lastMin`, `lastDurationMin` und
    die Zahl der Punkte ohne lesbare Zeit. **Auch für Objekte ohne einen
    einzigen Punkt:** `points: []` ist eine Aussage, ein fehlender Eintrag
    ist keine.
  * `gearSheet(rundown, seed)` — dasselbe als Blatt, mit Legende und
    Stand-Zeile, über denselben CSV-Schreiber wie die fünf Sichten. In der
    Shell als Knopf „Geräte-Zeiten", **abgesetzt** von den fünf: es ist kein
    sechster Empfänger, sondern dieselbe Quelle um neunzig Grad gedreht (eine
    Zeile je Gegenstand statt je Ablauf-Punkt). In die Empfänger-Liste
    gestellt hätte es den Wächter „genau fünf Empfänger, Spalten-Auswahlen
    aus einer Zeilenmenge" stillschweigend weicher gemacht.
* **Drei Dinge, die das Blatt bewusst nicht behauptet:** Es gibt **keine
  Spalte „bis"** — `lastMin` ist der BEGINN des letzten Punktes, und wann ein
  Gerät frei wird, sagt dieser Ablauf nicht; die Dauer eben dieses Punktes
  steht daneben, aufaddiert wird sie nicht. Punkte ohne lesbare Zeit werden
  **gezählt**, nicht übersprungen — ein Gegenstand, der nur in zeitlosen
  Punkten vorkommt, bekommt „ohne Zeit" statt einer erfundenen Spanne. Und es
  meldet **keine Lücke**: dieselbe Begründung wie bei `coverage` — auf einem
  halb eingelesenen Ablauf wäre jede Meldung ein Fehlalarm.
* **Was weiterhin NICHT stimmt und auch nicht soll:** die Planer-Objekte
  selbst tragen weiterhin kein Zeitfenster (`cable-planner`s `EquipmentItem`
  hat keine Bedarfs-Spanne, `multicam`s `Shotlist` keine Uhr). Das ist die
  Folge von E-18 und kein Rest: die Zeit gehört dem Ablauf des Kunden, und
  sie in jedes Planer-Objekt zu kopieren hieße, sie zweimal zu führen — mit
  genau der Gabelung, gegen die Bedarf 7 gebaut ist.
* **Gegengeprobt** (fünf Eingriffe, alle rot, zurückgebaut grün): zeitlose
  Punkte gehen in die Spanne ein · nur verplante Objekte in der Liste ·
  doppelte Nennung zählt doppelt · die Spalte heißt wieder „bis" · die Spanne
  wird aufaddiert statt der Dauer des letzten Punktes.
* **Aufwand:** ~~groß~~ erledigt

### B-35 · Vier der acht Repos sind aus der Suite nicht erreichbar

* **Status:** ~~offen~~ **erledigt 2026-09-05** (`suite#99`)
* **Befund (2026-09-04, Korpus-Durchgang):** Die Modul-Registry der Shell
  (`apps/shell/src/modules/registry.ts:48-134`) führt fünf Einträge.
  `Broadcast-intercom`, `tally-pi`, `sony-camera-bridge` und `pi-media-station`
  stehen nicht darunter.
* **Warum das zählt:** Die Feature-Matrix führt drei davon als **`YES`** — sie
  sind das, was die Suite den Incumbents entgegensetzt. Aus der Suite heraus
  gibt es sie nicht. Das ist derselbe Unterschied wie „Code existiert" gegen
  „Code ist erreichbar", nur eine Ebene höher.
* **DoD:** Entweder in der Registry verdrahtet, oder in der Matrix als bewusst
  eigenständig ausgewiesen — nicht stillschweigend beides.
* **Stand 2026-09-04 — die Ausweisung ist erledigt, die Entscheidung nicht.**
  `FEATURE-MATRIX.md` (Block E) sagt jetzt ausdrücklich, dass diese vier
  eigenständige Anwendungen sind und aus der Shell nicht erreichbar; ein `YES`
  dort heißt „das Repo läuft", nicht „die Suite kann es". Damit behauptet die
  Matrix nicht länger beides gleichzeitig.
* **Verdrahtet (`suite#99`, 2026-09-05).** Alle vier stehen als Module in der
  Rail (Hotkeys 6-9). Nicht mitgeliefert, sondern über eine **Adresse**: die
  vier sind Geräte, keine Zeichenflächen — `tally-pi` und `pi-media-station`
  laufen auf einem Pi und schalten echte Lampen und Sensoren,
  `sony-camera-bridge` und `Broadcast-intercom` brauchen ihren eigenen Server
  (Kamera-Protokolle, WebRTC-Audio). Ein mitgeliefertes Abbild wäre in beiden
  Fällen eine Attrappe.
  Host und Port stehen unter Einstellungen → „Geräte im Netz"; die Vorgaben
  sind aus den Repos gelesen, nicht erinnert (`guide_server.py:16` = 8080,
  `web-rcp/vite.config` = 3700, `server/src/index.ts` = 4001, `main.py:154` =
  5000), und ein Test liest sie dort erneut nach, solange die Nachbar-Repos
  ausgecheckt sind.
  Läuft nichts, zeigt das Modul die versuchte Adresse, was dort laufen müsste
  und wie man es startet — statt eines toten Rahmens. Erreichbarkeit wird
  gemessen (`fetch`, `no-cors`), nicht am `load`-Ereignis geraten: ein iframe
  auf einen toten Host feuert `load` genauso.
* **Mehr als ein Lesezeichen:** die Tally-Karte aus dem Signal-Plan geht über
  dieselbe Adresse an den Pi (siehe B-41).
* **Aufwand:** ~~klein (Ausweisung)~~ erledigt; ~~mittel (Verdrahtung)~~ erledigt

---

## Niedrig

### B-12 · `pi-media-station` und `tally-pi` ohne Tests

* **Status:** ~~offen~~ **erledigt 2026-09-04** (`tally-pi#7`,
  `pi-media-station#3`) — 46 + 21 Tests, beide in CI.
* **Befund:** Beide Python-Repos hatten keine Tests; `tally-pi` prüfte in CI
  nur die Syntax. Die reinen Funktionen darin (Adress-Ableitung,
  Zustandslogik) waren ohne Hardware testbar — genau das ist jetzt geprüft.
* **Was die Tests festhalten:** in `tally-pi` das dokumentierte Offset im
  ATEM-Protokoll und die Umrechnung der 0- gegen 1-basierten ME-Zählung, dazu
  die Zusicherung, dass `offline` niemals zu `safe` wird; in
  `pi-media-station` die Schema-Heilung der Konfiguration (`setdefault` statt
  `update`, Tiefkopie der Vorgaben) und das Fünf-Werte-Filterfenster des
  Sensors. `pi-media-station` hat damit überhaupt zum ersten Mal CI
  (`verify.yml`); `gpiozero` wird dort bewusst **nicht** installiert, damit
  der Dummy-Rückfall mitgeprüft ist.
* **Aufwand:** war mittel

### B-13 · `light-planner`: Sprachschalter ist upstream nicht erreichbar

* **Status:** **erledigt 2026-09-04** (`light#61`, `#62`, `#63`, `#66`, `#67`)
  — die dreistufige Reihenfolge ist zu Ende gegangen: erst wickeln, dann
  übersetzen, dann der Schalter.

  | | vor der Runde | jetzt |
  | --- | --- | --- |
  | gerenderte Komponenten ganz ohne `t()` | 10 (~365 Textstellen) | **0** |
  | erreichbare Schlüssel mit englischer Fassung | 42 | **670** |
  | Sprachschalter erreichbar | nein | **ja** (Topbar-Menü) |

  Der Schalter war das kleinste Stück und musste das letzte sein: vorher
  freigelegt hätte er eine zu ~85 % deutsche Oberfläche auf Englisch gestellt,
  und ein Nutzer hätte die Funktion zu Recht für kaputt gehalten.
  **Ein Guard hält den Zustand fest** (`i18n-reachable-check.ts`, Abschnitt 3):
  geprüft wird nicht, ob `setLanguage` existiert — das war nie das Problem —,
  sondern ob es aus einer *gerenderten* Datei aufgerufen wird. Gegengeprobt in
  beide Richtungen.
  **Nicht erledigt und ausdrücklich offen:** `MenuBar.tsx` / `Toolbar.tsx`,
  36 übersetzte Aufrufe in Dateien, die niemand rendert. Verdrahten oder
  löschen ist eine Eigentümer-Entscheidung (verwandt mit E-16).
* **Vorher:** offen
* **Befund:** Die i18n-Infrastruktur existiert, aber `setLanguage` wird nur in
  `src/components/MenuBar.tsx:77` aufgerufen — und **diese Datei importiert
  niemand**; `App.tsx` rendert `TopBar` + `ToolRail`. Das Drift-Skript der Suite
  führt `components/MenuBar.tsx` selbst unter `DEAD_UPSTREAM`.
* **Korrektur der Reihenfolge (gemessen 2026-09-04):** Ich hatte hier „erst den
  Schalter erreichbar machen, dann übersetzen" stehen. Nachgemessen ist das
  **falsch herum**:

  | | |
  | --- | --- |
  | EN-Wörterbuch | 42 Schlüssel: **24 `menu.*`**, 16 `tool.*`, 2 `about.*` |
  | Tatsächliche `t()`-Aufrufe | 86 Stellen: **32 `inventory.*`**, 24 `menu.*`, 12 `tool.*`, dazu `2d`, `canvas`, `common`, `png`, `pdf`, `jpg` |

  Die 24 `menu.*`-Übersetzungen bedienen **ausschließlich** das nicht
  gerenderte `MenuBar.tsx`. Die größte Gruppe lebendiger Strings — 32
  `inventory.*` — hat **gar keine** englische Fassung.

  Wer jetzt den Schalter freilegt, liefert einen sichtbar halb übersetzten
  Zustand aus: Lager-Dialog komplett deutsch, Werkzeugleiste teils englisch,
  das übersetzte Menü unsichtbar. Das ist **schlechter als kein Schalter** —
  ein Nutzer, der Englisch wählt und Deutsch bekommt, hält die Funktion für
  kaputt, und zwar zu Recht.
* **Richtige Reihenfolge:** erst die erreichbaren Strings übersetzen
  (`inventory`, `canvas`, `2d`, `common`), dann den Schalter freilegen.
* **Nachgeprüft 2026-09-04:** weiterhin offen. `setLanguage` steht unverändert
  nur an `MenuBar.tsx:33/77` (dazu die Definition in `store/uiStore.ts:64` und
  die Weitergabe in `i18n/index.ts:69`), und `grep` findet in `src/` **keinen
  einzigen** Import von `MenuBar` oder `Toolbar`.
* **Aufwand:** mittel (Abdeckung) **vor** klein (Schalter) — nicht umgekehrt.
* **Teilschritt 2026-09-04 (`light#59`, `light#60`, dieser PR):** Jeder
  Schlüssel, den es **gibt**, hat jetzt eine englische Fassung — upstream 34
  von 34, in der Suite 563 von 563, geprüft von `i18n:check` in beiden CIs.
* **Und die Korrektur dazu, noch am selben Tag (`light#61`):** Das ist
  **nicht** dasselbe wie „die Oberfläche ist übersetzt", und ich hatte es hier
  zuerst so notiert. Gemessen sitzen upstream **~496 von ~497** sichtbaren
  Textstellen in Komponenten mit **null** `t()`-Aufrufen — `PropertyPanel`
  (~163), `FixtureEditor` (~67), `TopBar` (~65), `ScheduleDialog` (~60).
  Gewickelt ist im Wesentlichen ein Dialog. Die Abdeckungszahl misst die
  Schlüssel, die existieren, nicht den Text, den der Nutzer sieht; seit
  `light#61` steht die zweite Zahl unter jedem Lauf daneben.
* **Damit bleibt die Reihenfolge, wie sie war:** erst wickeln, dann
  übersetzen, dann den Schalter. Der Schalter ist der kleinste der drei
  Schritte und weiterhin der letzte.
* **Und in der Suite war es kein latenter, sondern ein sichtbarer Schaden.**
  Dort ist der Schalter längst erreichbar: `apps/shell/.../SettingsModal.tsx:124`
  bietet die Sprache an, `App.tsx:450` reicht sie als `{ …, language }` in den
  iframe, `PlannerFrame` sendet sie, und `shellSettings.ts:51` setzt sie im
  `uiStore` des Planers. Ein Nutzer, der in der Suite auf Englisch stellte,
  bekam den kompletten Lager-Dialog und die Beleg-Marken auf Deutsch — und
  `t('common.edit', 'Edit')` zeigte umgekehrt einem deutschen Nutzer Englisch.
  Standalone (`npm run dev:light`) ist der Schalter auch in der Suite-Kopie
  nicht erreichbar; `connectShellSettings` ist dort ein No-op.

---

### B-36 · Der Defektformen-Sweep über die fünf Nicht-cable-Repos

* **Status:** ~~offen~~ **erledigt** (2026-09-08) — alle **fünf Formen** sind durchgearbeitet, **24 bestätigte und behobene Befunde**, jeder gegengeprobt. Der ursprüngliche Lauf (2026-09-04) blieb ausdrücklich **ohne verwertbares Ergebnis**; was ihn ersetzt hat, steht weiter unten unter „Was die Wiederholung methodisch geändert hat“.
* **Was lief (2026-09-04):** ein Sweep über fünf wiederkehrende Defektformen
  dieser Sitzung (`guard-umgangen`, `zwei-rechnungen`, `vertrag-nur-feldnamen`,
  `fixture-erreicht-grenze-nicht`, `zustand-nach-fehler`) in
  `light-planner`, `multicam-planner`, `Broadcast-intercom`, `tally-pi`,
  `pi-media-station`, mit einer adversarialen Gegenprobe je Befund.
* **Wie er endete:** **11 von 62 Läufen fertig, 51 abgebrochen** (Sitzungslimit).
  Fertig wurde ausschließlich die **Suchphase**; **keine einzige Gegenprobe**
  ist zurückgekommen.
* **Warum hier trotzdem keine Liste der neun Roh-Befunde steht.** Genau das
  wäre der Fehler, den diese Sitzung zehn Runden lang gemessen hat: In der
  letzten vollständigen Gegenrunde hielten **10 von 12** Erstbefunden der
  Prüfung *nicht* stand. Eine unbelegte Liste im Backlog liest sich nach zwei
  Wochen wie Arbeitsvorrat, und niemand sieht ihr an, dass sie nie geprüft
  wurde. Ein leerer Eintrag mit dem Grund ist ehrlicher als neun Zeilen, die
  aussehen wie Befunde.
* **Was der Sweep an Substanz ergeben hat:** nichts Bestätigtes. Er ist zu
  wiederholen, nicht auszuwerten.

* **Wiederholt 2026-09-07 — fünf bestätigte Befunde, jeder gegengeprobt und
  behoben.** Diesmal nicht als Liste von Verdachtsmomenten, sondern als
  gemessener Defekt plus die Gegenprobe, die ihn rot macht. Vier von fünf
  gehören zur Form `zustand-nach-fehler`, und sie ähneln einander so stark,
  dass die Form selbst der eigentliche Befund ist: **nach einem Fehler bleibt
  der letzte gültige Zustand stehen und behauptet weiter, gültig zu sein.**

  | Repo | Befund | PR |
  | --- | --- | --- |
  | `pi-media-station` | `SensorThread.distance` startete bei **0.0** — und 0,0 m heißt nicht „noch nichts gemessen", sondern „jemand steht direkt vor dem Sensor". Die Station ging beim Start in die Nah-Szene, und ein Sensor, der gar nicht antwortete, hielt sie dauerhaft dort. Ein gemessener Wert veraltete außerdem nie. | `#6` |
  | `Broadcast-intercom` | `saveConfig` schrieb mit blankem `fs.writeFile` direkt auf die Zieldatei. Ein Absturz dabei hinterließ eine halbe Datei, und `initializeState` hatte keinen Zweig dafür: **der Kern startete nicht mehr.** Geschrieben wird bei jedem übernommenen Plan, also während des Aufbaus. | `#12` |
  | `sony-camera-bridge` | Nach einem Verbindungsverlust blieben Zustand, Herkunft und **Bestätigungszeit** stehen. Auf einem Melde-Weg liest `freshness` daraus dauerhaft „frisch" — die Behauptung, die Bedarf 102 abschaffen sollte, eine Ebene tiefer. Drei Aufräumwege, drei verschiedene Regelungen. | `#20` |
  | `multicam-planner` | Der Lager-Store schrieb über `saveJSON`, dessen `catch` leer ist. Der Import meldete „N Objekte importiert", und der Bestand war beim nächsten Start weg. Das Mittel dagegen (`saveJSONSafe` + `…StorageFull`) gab es im selben Repo — für Shotlisten, nicht für die Stammdaten. | `#107` |
  | `light-planner` | Derselbe Befund, eigener Code (`catch { /* quota */ }`). | `#91` |

  Der fünfte gehört zu `guard-umgangen` und stand vorher als offenes Issue da:
  `tally-pi#2` („Überlastet wenn Buttons dazu kommen?"). Der `BurstTracker`
  legte **pro GPIO-Flanke** einen `threading.Timer` an, und ein Timer ist ein
  Thread; gemessen 200 Flanken → 200 Threads. Genau das, wogegen der Tracker
  gebaut ist (eine verrauschte Leitung liefert „dozens" Flanken je Druck),
  war seine eigene Last. Behoben in `tally-pi#13`.

* **Was die Wiederholung methodisch geändert hat.** Der abgebrochene Lauf
  suchte breit und prüfte nichts. Dieser suchte an *einer* Form entlang durch
  alle fünf Repos und hat jeden Befund sofort gegengeprobt — Regel
  kaputtmachen, Wächter rot sehen, zurückbauen. Von den fünf Befunden hat
  keiner die Gegenprobe verfehlt; zwei **Wächter** dagegen schon, und beide
  Male war der Wächter schuld, nicht der Fix (ein Test, der bei einem
  Fehlschlag am offenen Port hängt statt rot zu werden; eine Zusicherung, die
  schon vom Schritt davor grün war). Beides steht in den PRs.

* **Zweite Form durch: `zwei-rechnungen` (2026-09-07), fünf bestätigte
  Befunde, einer je Repo.** Die Form lautet: *dieselbe Zahl wird an zwei
  Stellen gerechnet.* Was sie so ergiebig macht, ist nicht der Fall, in dem
  die zwei Rechnungen schon heute auseinanderlaufen — das ist der seltenere.
  Es ist der Fall, in dem sie heute übereinstimmen und die zweite Stelle
  niemand kennt.

  | Repo | Befund | PR |
  | --- | --- | --- |
  | `tally-pi` | Die Übersetzung von „die Lampe brennt" auf „der Pin liegt tief" stand an **vier** Stellen. Die zwei im Browser lasen ihre Polarität aus **verschiedenen Quellen** — die Gerätekarte aus dem ungespeicherten Formular, die Diagnose-Tabelle aus dem gespeicherten Stand: zwei Knöpfe für denselben Pin, wenige Zentimeter auseinander, mit entgegengesetzten Kommandos. Und der Browser schickte einen *Pegel* statt eines *Anliegens*, weshalb das Ereignis-Log für jede active-high Lampe das Gegenteil dessen protokollierte, was passiert ist. | `#14` |
  | `pi-media-station` | `get_scene()` setzt die Lautstärke-Vorgaben bereits ein; die Anzeigeseite setzte sie ein zweites Mal — als `scene.master_volume \|\| 100`. **`0 \|\| 100` ist 100.** Der Regler geht bis 0, `web_ui.py` nimmt die 0 an, `get_scene` reicht sie durch — und die Seite machte daraus volle Lautstärke. Es ist der einzige Stumm-Schalter, den eine Station hat, die unbeaufsichtigt in einer Ausstellung steht. | `#7` |
  | `Broadcast-intercom` | `Softclient` und `PhoneClient` sind zwei Ansichten derselben App am selben Kern. `downsampleToInt16` und `int16ToBase64` standen Zeile für Zeile in beiden. Der **Mikrofon-Pegel** wurde aus demselben Signal mit zwei verschiedenen Formeln gerechnet — Spektrum-Mittel gegen Zeitbereichs-RMS —, beide als „%" auf demselben Balken; nachgerechnet 10 % gegen 50 %. Der Softclient vergleicht seine **VOX-Schwelle** gegen diese Zahl. | `#13` |
  | `light-planner` | `footprint()` ist die eine Antwort auf „wie viele DMX-Kanäle belegt diese Einheit". `integration/equipment.ts` stellte dieselbe Frage noch einmal und gab im Nein-Fall eine **andere** Antwort: 1 statt 0. Die 0 ist aber die Kodierung für „konventionelle Leuchte am Dimmer"; der Export an den Kabel-Planer behauptete für sie einen Kanal und hängte ihr eine DMX-Buchse an. Drei Nachrechnungen insgesamt, zwei davon zufällig richtig. | `#92` |
  | `multicam-planner` | `CalculationBreakdown.tsx` ist die Tafel, die dem Nutzer die Formeln vorrechnet, **damit er die Ausgabe nachprüfen kann** — und rechnete Sensordiagonale und Personenhöhe selbst nach, mit dem Kommentar „(matches utils/fov.ts:personHeightInFrame)" daneben. Eine Übereinstimmung, die jemand von Hand pflegen muss, ist keine. Dazu `1.80`, `1080` und `1500` als nackte Literale: der *gezeigte* Rechenweg war von der tatsächlichen Rechnung entkoppelt. | `#108` |

* **Und wieder haben zwei Gegenproben den Wächter erwischt statt den Fix** —
  dieselbe Quote wie beim ersten Durchgang, und beide Male derselbe Grund:
  der Wächter prüfte den **Wert**, wo die Form die **Kennlinie** angreift.
  In `Broadcast-intercom` blieb er grün, als die Wurzel aus der RMS
  verschwand (jeder Einzelwert plausibel, die Kurve quadratisch); in
  `multicam-planner` blieb er grün, als `circleOfConfusion` seine eigene
  `Math.sqrt(…)` zurückbekam (zahlengleich, aber wieder doppelt). Beide
  Wächter prüfen seither das, was die Form angreift: „doppelte Amplitude
  liest sich doppelt so hoch", und „`Math.sqrt` steht an genau einer Stelle".

* **Dritte Form durch: `vertrag-nur-feldnamen` (2026-09-07/08), fünf
  bestätigte Befunde, einer je Repo.** Die Form lautet: *ein Vertrag prüft,
  wie die Felder heißen, und nie, was sie bedeuten.* Alle fünf Fundstellen
  hatten einen Wächter, und alle fünf Wächter waren gründlich — in genau
  einer Richtung.

  | Repo | Befund | PR |
  | --- | --- | --- |
  | `multicam-planner` | `parseCameraList` prüfte Marker, Version und „`cameras` ist ein Array" und gab dann **`data as CameraListExchange`** zurück. Der Cast war die ganze Zusicherung: `cameras: [null, 42, {}, {id: 5, x: "links"}]` kam als wohlgeformte Datei beim Cable-Planner an, der aus jedem Eintrag einen Equipment-Knoten baut. Der Guard daneben heißt „Wire-Contract" und fror die **Feldnamen** ein — auf beiden Seiten, sogar aus dem Interface-Rumpf gelesen. | `#109` |
  | `light-planner` | Dasselbe in `parseVenueExchange` und `parseAvPlan`: `venue: 42` kam durch, weil `!42` falsch ist. Dahinter ist `fromVenueExchange` bei den **optionalen** Feldern sorgfältig (`?? 0.5`, `?? 270`) und vertraut den **Pflicht**-Feldern blind — eine Person ohne `x` wird zu `{ x: undefined }`, und die Lichtrechnung rechnet ab da mit NaN. | `#93` |
  | `pi-media-station` | Der Vertrag war buchstäblich eine Tabelle **Feldname → Typ**. `gpio_trigger: 99`, `threshold_m: -5`, `web_port: 0`, `web_port: true` (`int(True)` ist 1) gingen durch. Der lehrreichste Fall: `gpio_echo == gpio_trigger` — **kein Feld für sich ist falsch**, und ein Feldnamen-Vertrag kann so etwas grundsätzlich nicht sehen. | `#8` |
  | `Broadcast-intercom` | `parseIntercomPlan` prüfte `typeof o.version !== "number"` — Name und Typ — und verglich die Zahl danach **mit nichts**. Alle Schwester-Formate lehnen eine zu neue Version ab; dieses eine nicht, und was hier falsch verstanden wird, sind Sprechberechtigungen. Zweite Hälfte: unlesbare Einträge fielen per `continue` still aus der Liste, und der Abgleich — der genau dafür da ist, vorher zu zeigen was passiert — sagte „nichts zu tun". | `#14` |
  | `tally-pi` | Zwei Listen über **dieselben physischen Leitungen** (`tally.json`, `bindings.json`), zwei ordentliche Wächter, und jeder kennt nur seine eigenen Feldnamen. Eine Companion-Bindung durfte auf dem Pin einer Tally-Lampe sitzen; libgpiod gibt eine Leitung nur einmal heraus, der zweite Dienst bekommt EBUSY und fällt still aus. Beide Oberflächen zeigen ihre Zeile als gespeichert und gültig. | `#15` |

* **Und zum dritten Mal hat eine Gegenprobe den Wächter erwischt statt den
  Fix** (`tally-pi`): der Test gab der Numato-Bindung nur `channel`, kein
  `bcm` — dann greift der `source`-Filter gar nicht, und seine Entfernung
  blieb unbemerkt. Der scharfe Fall ist ein `bcm`, das vom Umstellen im
  Formular stehengeblieben ist. Über drei Formen hinweg ist das jetzt fünf
  Mal passiert, immer nach demselben Muster: **der Wächter prüft den Fall,
  den der Fix herstellt, statt den, den der Defekt braucht.**

* **Ein Widerspruch wurde ausdrücklich NICHT behoben, sondern benannt**
  (`tally-pi`): `USABLE_BCMS` lässt 17 Pins zu, `BCM_TO_PIN` alle 26 — eine
  Bindung darf auf BCM 14 (UART TX) sitzen, ein Tally-Ausgang nicht. Enger zu
  ziehen würde laufende Installationen ungültig machen, die SPI abgeschaltet
  haben und BCM 7..11 zu Recht benutzen. Der Unterschied steht jetzt im
  Quelltext, und ein Test hält fest, dass er bekannt ist.

* **Vierte Form durch: `fixture-erreicht-grenze-nicht` (2026-09-08), vier
  bestätigte Befunde — und eine ehrliche Fehlanzeige.** Die Form lautet: *die
  Prüfung existiert, sie ist sogar sorgfältig — nur reicht das Fixture nicht
  bis an die Grenze, die sie prüfen soll.*

  | Repo | Befund | PR |
  | --- | --- | --- |
  | `light-planner` | `autoPatch` hat genau **einen** interessanten Zweig — den Übergang ins nächste Universe bei 512 Kanälen. Er ist **nie** gelaufen: der einzige Lauf, der `autoPatch` überhaupt aufrief, war ein Entwicklerskript mit einer Handvoll Leuchten, das nicht einmal in `package.json` stand. Beim Hinsehen fiel der zweite Fall auf, den nie jemand erreicht hat: ein Profil mit **mehr** als 512 Kanälen bekam `universe = n, address = 1` und belegte rechnerisch 513…fp eines Universes, das dort aufhört. | `#94` |
  | `tally-pi` | `log_event` dreht das Ereignis-Log bei 1 MB — nie getestet, weil kein Lauf je so viel schrieb. Und weil der Zweig nie lief, ist nie aufgefallen, dass der **Leser ihm nicht folgt**: in dem Moment, in dem die Datei dreht, zeigt das Log-Fenster, in dem gerade jemand 200 Ereignisse las, **eine**. | `#16` |
  | `Broadcast-intercom` | Der Smoke-Test — 58 Prüfungen — berührt keine der Lautstärke-Aktionen. Die Grenze bei −60 dB war deshalb nie erreicht, und dort steckten zwei Fehler: **Stumm war eine Einbahnstraße** (kein `unmute`, für den Eingang auch kein `volume_up` — auf der Companion-Taste nur über die Weboberfläche zu lösen), und **−60 dB hieß zweierlei**: Stumm-Wert *und* unteres Ende des Bereichs. | `#15` |
  | `pi-media-station` | Der Ablauf bewachte den **Zeitstempel**, das **Mittelwertfenster** niemand. Nach einem Ausfall wurde der erste neue Messwert mit vier Werten von *vor* dem Ausfall gemittelt und galt sofort als frisch: aus „leer, dann steht jemand da" wurden 2,5 m. Die vorhandenen Tests lagen bei 0,5 s (weit darunter) und `STALE_AFTER_S + 0,5` (weit darüber) — dazwischen liegt die Grenze. | `#9` |

* **`multicam-planner`: Fehlanzeige, und das ist ein Ergebnis.** Die Grenzen,
  die es dort gibt, werden **an** ihrer Grenze geprüft: `TAKE_MAX_SAMPLES`
  (Liste exakt voll), `PATTERN_ROWS_MAX`, `textureSize(400, 3)` gegen den
  2048-px-Deckel, `clampHeight`/`clampTrack` mit 99 und −99, und der
  `MAX_DT_S`-Fall ist im Test sogar mit dem Tab-Wechsel begründet, der ihn
  auslöst. Nachgesehen wurden außerdem `motionProfile`, `rigLimits`, `uiZoom`,
  `wallSurface` und `storyboard`. Eine erfundene Fundstelle wäre hier
  schlimmer als keine — genau das war die Lehre aus dem abgebrochenen ersten
  Lauf.
  Der PR dort (`#110`) trägt stattdessen einen **Nachzügler der Form
  `zustand-nach-fehler`**: die handgepflegte Bibliothek (eigene Kameras,
  Optiken, Vorlagen) lief weiter über das stille `saveJSON`. Dieselbe Form,
  die dieser Sweep in demselben Repo schon zweimal gefunden hat, eine Ebene
  weiter — und das ist der eigentliche Befund an ihr: **das Mittel dagegen lag
  jedesmal im selben Repo, nur nicht an dieser Stelle.**

* **Die Gegenproben-Bilanz über alle fünf Formen: sieben Mal hat eine
  Gegenprobe den WÄCHTER erwischt statt den Fix**, und immer nach demselben
  Muster — der Wächter prüft den Fall, den der *Fix* herstellt, statt den, den
  der *Defekt* braucht. Zuletzt in `Broadcast-intercom`, wo die erste Fassung
  einen Zweig traf, den es unter dem neuen Umschalter gar nicht mehr gibt: der
  Vorbehalt war unerreichbar und ist raus. Und in `pi-media-station`, wo ein
  Quelltext-Wächter wörtlich `= time.monotonic()` verlangte und bei einer
  folgenlosen Umschreibung rot wurde — ein Wächter, der das tut, wird beim
  nächsten Mal angepasst statt gelesen.

* **Status der fünf Formen:** `zustand-nach-fehler`, `guard-umgangen`,
  `zwei-rechnungen`, `vertrag-nur-feldnamen` und
  `fixture-erreicht-grenze-nicht` sind durchgearbeitet. **Der Sweep ist
  abgeschlossen** — 24 bestätigte und behobene Befunde, jeder gegengeprobt.

* **Aufwand:** ~~mittel (Wiederholung, sobald Kontingent da ist)~~ ~~eine Form
  von fünf ist durch; drei stehen aus~~ ~~zwei Formen von fünf sind durch;
  zwei stehen aus~~ ~~drei Formen von fünf sind durch; eine steht aus~~
  **erledigt**

---

### B-37 · Die Doku nennt ein ICE-/TURN-Feld, das die App nicht hat

* **Status:** ~~offen~~ **erledigt** (`cable#687`, Commit `061cd9e`) —
  nachgemessen 2026-09-07. Der Eintrag stand hier als „offen", obwohl die
  Arbeit längst getan war: `src/renderer/lib/crdt/iceServers.ts` (Parser),
  `iceServers` in `PersistedCollab` und im Store, `peerOpts.config.iceServers`
  in `webrtcProvider.ts`, ein Eingabefeld im `CollabPanel` samt Prüfung der
  ungültigen Zeilen, und `tests/iceServerErreichenDenProvider.test.ts` (9
  Tests, in CI). `docs/self-hosted-relay.md` nennt jetzt „Zusammenarbeit →
  STUN-/TURN-Server" mit dem tatsächlichen Zeilenformat.
* **Was daran zählt, auch wenn nichts mehr zu bauen ist:** Ein Eintrag, der
  fälschlich „offen" sagt, ist nicht harmlos. Er ist die Umkehrung des
  Befunds, den er beschreibt — eine Zusage, die nicht mehr stimmt — und schickt
  den Nächsten los, etwas zu bauen, das es gibt. Derselbe Fehler wie bei B-4,
  und aus demselben Grund hier mit Datum und Beleg nachgetragen statt still
  gestrichen.
* **Befund (gemessen 2026-09-04):** `cable-planner/docs/self-hosted-relay.md:51`
  weist den Nutzer an: „Die TURN-Zugangsdaten trägst du in der App unter
  **Zusammenarbeit → ICE-Server** ein (bzw. via `iceServers`-Feld)." Beides gibt
  es nicht. `grep -rn iceServers src/` in `cable-planner` liefert **null
  Treffer**; `CollabPanel.tsx` hat genau ein Server-Feld, und das ist der
  Signaling-Server. `webrtcProvider.ts:51` reicht an `WebrtcProvider` nur
  `signaling` und `password` durch — kein `peerOpts`, also bleibt es bei den
  Default-STUN-Servern von y-webrtc.
* **Warum das mehr ist als ein Doku-Fehler:** Die Seite existiert für genau den
  Fall, in dem STUN nicht reicht — zwei Standorte hinter symmetrischem NAT. Sie
  erklärt die coturn-Installation vollständig und bricht dann an der Stelle ab,
  an der die Zugangsdaten in die App müssten. Wer der Anleitung folgt, hat einen
  laufenden TURN-Server, den nichts benutzt, und keinen Hinweis darauf, warum
  die Verbindung trotzdem scheitert.
* **Was zu tun ist — nicht die Doku streichen, das Feld bauen.** Der Weg ist
  kurz und vollständig sichtbar: `WebrtcOptions` um `iceServers` erweitern und
  als `peerOpts: { config: { iceServers } }` durchreichen; ein Feld in
  `PersistedCollab` (Rohtext, damit `turns:`-URLs mit Credentials eingebbar
  bleiben) plus Parser; ein Eingabefeld im `CollabPanel` neben dem
  Signaling-Server; Test für den Parser. Erst wenn das steht, stimmt die Seite.
* **Aufwand:** klein bis mittel.

---

### B-38 · 67 von 67 Dokumenten waren unauffindbar — erledigt

* **Status:** ~~offen~~ **erledigt 2026-09-04** (`suite`, `cable#689`).
* **Befund:** Von 67 Dokumenten unter `docs/` war **keines** von einer
  Einstiegsseite aus verlinkt — weder `IMPLEMENTATION_STATUS.md` noch
  `IMPLEMENTATION_BACKLOG.md`, also die beiden Dokumente, auf denen die gesamte
  laufende Arbeit steht, noch die fünf ADRs, noch der Recherchekorpus. In
  `cable-planner` waren es zwölf von dreizehn, darunter
  `docs/self-hosted-relay.md` — ausgerechnet die Seite, die jemand sucht, wenn
  die Zusammenarbeit über Mobilfunk nicht zustande kommt.
* **Warum das kein Kosmetikpunkt ist:** Es ist dieselbe Form wie B-13 (der
  Sprachschalter, der existierte, aber in einer nie gerenderten Datei lag): die
  Sache ist da, sie ist sorgfältig gemacht, und sie liegt außerhalb des Weges,
  der zu ihr führt. Bei einem Recherchekorpus, der Produktentscheidungen tragen
  soll, heißt das: unauffindbare Evidenz wird nicht gelesen, und die
  Entscheidung fällt ohne sie. Der Rechercheteil hatte mit
  `research/README.md` sogar ein sehr gutes eigenes Inhaltsverzeichnis — es
  verlinkte nur niemand.
* **Was gebaut wurde:** `docs/README.md` in beiden Repos als Einstieg, vom
  jeweiligen README aus verlinkt, plus vier Messungen unter
  `research/synthesis/`, die im Korpus-Index fehlten. Der Guard
  (`npm run docs:reachable`, in CI) prüft **nicht** „steht jedes Dokument im
  Index" — dann wäre der Index selbst die Liste, die veraltet — sondern läuft
  den Link-Graphen von den Einstiegsseiten ab. Ein Verzeichnis-Link erschließt
  die Dokumente darin, damit `research/README.md` seine 40 Einzeldossiers nicht
  einzeln aufzählen muss. Tote Links fallen mit auf: sie machen ein Dokument
  genauso unerreichbar wie gar kein Link, sehen im Index aber nach
  Vollständigkeit aus.
* **Was der Guard im ersten Lauf fand:** in `cable-planner` einen toten Link in
  `CONTRIBUTING.md` auf ein `CODE_OF_CONDUCT.md`, das es nicht gab, obwohl der
  Satz daneben „this project ships a Code of Conduct" lautete. Nachgeliefert.
* **Alle acht Repos erledigt** (2026-09-04): `cable-planner#689`/`#690`,
  `multicam-planner#89`, `Broadcast-intercom#7`, `light-planner#68` und dieser
  Suite-PR. `sony-camera-bridge`, `tally-pi` und `pi-media-station` waren
  bereits sauber (ein bzw. kein Dokument ausserhalb der Einstiegsseiten).
* **Was der Guard beim Vendorieren zusätzlich fand** — und was nur in der Suite
  existiert: die IPC-Domäne **`lexware:*`** (Brücke zur Lexware-Office-Anbindung,
  API-Key bleibt in `main`) war nirgends beschrieben. Sie gibt es upstream
  nicht, sie ist Teil des Suite-Overlays, und genau deshalb hat sie kein
  Upstream-Dokument je erwähnt. Nachgetragen in der IPC-Tabelle der
  vendorierten `docs/architecture.md`, ausdrücklich als Suite-only markiert.
  Zweiter Fund derselben Runde: `docs/suite-mockup/` fehlte in der Kopie ganz,
  wodurch der Index der Kopie einen toten Link trug — nachvendoriert.

---

### B-39 · Was der Projekt-Fluss noch nicht trägt

* **Status:** offen (nur noch Punkt 5; 1, 2, 3 und 4 erledigt) — **Punkt 1 ist
  am 2026-09-08 gebaut** (`suite#169`): der Raum geht zurück, und zwar durch
  die Konfliktregel aus E-21 (Eigentum je Feld; geteilte Felder melden den
  Widerspruch als Befund, statt still zu überschreiben)
* **Woher der Eintrag kommt:** `suite#98` hat den Weg Shell → Planer → Shell
  gebaut (siehe B-20). Damit ist der Befund „die Suite ist eine Hülle" erledigt,
  aber nicht alles, was daran hing. Diese Liste steht hier, damit die Reste
  nicht als erledigt durchgehen — nachgezogen am Stand vom 2026-09-05:

  1. ~~**Der Raum geht nur hin, nicht zurück.**~~ **Erledigt (`suite#169`,
     2026-09-08).** Der Befund war zweiteilig, und die zweite Hälfte war die
     wichtigere: `seedToVenue` setzte Maße und Bühne im MultiCam-Planer, wer
     sie dort änderte, änderte sie nicht in der Shell — und der Rückweg fehlte
     nicht aus Versehen, sondern **weil die Regel fehlte**. Zwei Planer
     bearbeiten denselben Raum; ohne Konfliktregel wäre jeder Rückweg ein
     stilles „letzter gewinnt" gewesen. Der Widerspruch war vermieden, indem
     eine Hälfte der Verbindung nicht gebaut wurde.

     Gebaut ist jetzt beides: `SeedPatch` trägt `venue` (jede Domäne darf ihn
     mitschicken), und `mergeSeedPatch`
     (`packages/ui/src/seedOwnership.ts`) entscheidet nach **Eigentum je
     Feld** — `SEED_VENUE_OWNER` als `satisfies Record<keyof SeedVenue, …>`,
     damit ein neues Raum-Feld ohne Regel ein Typfehler ist und keine stille
     Lücke. Wer ein geteiltes Feld zuerst setzt, **hält** es (`SuiteSeed.holds`
     mit Herkunft und Zeitpunkt); eine abweichende Setzung einer anderen Stelle
     wird zu einem **Befund** am Projekt (`SuiteProject.seedConflicts`) und
     nicht zu einer Überschreibung. Der Zeitstempel steht IM Befund und
     entscheidet ihn nicht — „letzter gewinnt" wäre ein Rennen, dessen Ausgang
     von der Netzlaufzeit abhängt.

     Sichtbar wird der Befund als **Streifen** über der Statusleiste
     (`SeedConflictBar`) und nicht nur als Toast: wer einen Widerspruch nur
     3,2 Sekunden lang sieht, hat danach denselben Wissensstand wie beim
     stillen Überschreiben. Zwei Knöpfe — „Übernehmen" verschiebt den Halter
     ausdrücklich, „Verwerfen" nimmt nur die Meldung weg. Ein Hinweis, den man
     nur durch Nachgeben los wird, wäre keine Meldung, sondern eine Erpressung.

     `applySeedPatch` ist dabei **ersetzt und nicht daneben stehen geblieben**:
     ein zweiter, stiller Weg ins selbe Ziel ist genau die Form, an der E-21
     hängt. `mergeSeedPatch` gibt Seed und Befunde als EIN Ergebnis zurück.

     **Damit ist auch Bedarf 49 entblockt** — die Zuordnung aus E-22, die laut
     jener Entscheidung ausdrücklich alle schreiben, hat jetzt die Regel, ohne
     die sie nicht anfangen konnte.

     Auf der Planer-Seite meldet **MultiCam** den Raum jetzt zurück
     (`venueToSeedPatch`, im Overlay `apps/multicam-planner/src/utils/`) —
     Maße und die erste Bühne, den Namen unverändert, weil er der Shell gehört
     und ein geänderter Name ein Vorschlag zu einem fremden Feld wäre. Ein Test
     hält fest, dass Hin- und Rückweg einander umkehren; ohne das meldete jeder
     übernommene Seed sofort einen Widerspruch gegen sich selbst.

     **Was ausdrücklich NOCH NICHT gebaut ist: die Licht-Seite.** Der
     Licht-Planer liest den Raum aus dem Seed heute gar nicht — sein
     `shellSeed.ts` kennt nur Scheinwerfer, und sein eigenes Raum-Modell
     (Boden, Wände, Fenster, Podeste) bildet `venue.widthM/heightM/stage` nicht
     eins zu eins ab. Die Regel trägt ihn bereits (er ist als Schreiber
     `fixtures` vorgesehen, und die Tests decken ihn ab); was fehlt, ist die
     Abbildung in dieser App. Das steht hier als benannter Rest und nicht als
     stille Lücke — sonst liest der nächste Durchgang „Punkt 1 erledigt" und
     wundert sich, warum das Licht den Raum nicht meldet.

     Gegengeprobt (alle acht rot, zurückgebaut grün) — Regel und Shell:
     geteiltes Feld wird still überschrieben · `gleich()` über
     `JSON.stringify` (meldet zwei gleiche Bühnen als verschieden, je nach
     Schlüssel-Reihenfolge) · die Shell schickt die Halter nicht mit · die
     Befunde landen nicht am Projekt · ein Feld fehlt in `SEED_VENUE_OWNER`
     (Typfehler). MultiCam: die letzte statt der ersten Bühne gemeldet ·
     Breite und Höhe vertauscht (Hin-und-Zurück bricht) · Maße gar nicht
     gemeldet.
  2. ~~**Das Demo-Projekt ist weiter hartkodiert.**~~ **Erledigt (`suite#105`).**
     Der Befund war zweiteilig: das Demo-Projekt ist der einzige Weg zu
     befülltem Inhalt, und ein neues Projekt startet leer — ein leerer Seed
     befüllt keinen Planer. Die erste Hälfte hat `suite#103` genommen (eine
     bestehende Show als Datei öffnen), die zweite nimmt der **Vorlagen-Begriff**:
     `data/projectTemplate.ts` leitet aus einem Projekt eine Vorlage ab,
     `data/templateStore.ts` legt sie ab, und der Projekt-Hub bekommt einen
     zweiten Reiter, aus dem heraus ein Projekt **befüllt** entsteht.
     Das Demo-Projekt bleibt im Code — es ist der Startwert eines frischen
     Speichers und als solcher richtig. Was weg ist, ist seine Sonderstellung.

     Der Bedarf dahinter ist P1 und steht in der Bedarfs-Datenbank als Nr. 2
     („opening last year's file as this year's starting point. This is the
     freelancer's only compounding asset"), dazu Nr. 75 für den Truck und
     Nr. 91 für das Haus. Zwei Regeln kommen aus der Recherche, nicht aus dem
     Bauchgefühl:

     - **Abgezogen, nicht aufgezählt.** `TEMPLATE-FIELD-MEASUREMENT.md` hat im
       `cable-planner` drei Vorlagen-Bauer mit 37 / 23 / 15 aufgezählten
       Feldern gefunden, von denen einer seit `#335` unbemerkt abgedriftet
       war. `templateFromProject` kopiert deshalb das ganze Projekt und zieht
       eine benannte Liste ab; ein neues Feld an `SuiteProject` fährt per
       Vorgabe mit. Ein Test spritzt ein unbekanntes Feld ein und fällt um,
       sobald jemand auf Aufzählung zurückbaut.
     - **Was nicht mitfährt, wird genannt.** Design-Frage 5 („Zugangsdaten in
       geteilten Vorlagen") ist mit *beim Export fragen* entschieden. Hier
       hängt dasselbe an Kundendaten: an `Contact` hängen USt-IdNr.,
       Kundennummer und die Lexware-Kontakt-Id, an `ShowDetails` die
       ausgestellten Belege und die Steuer-Voreinstellung. Eine Vorlage, die
       den Kunden des letzten Jahres stillschweigend mitbringt, fällt erst in
       dessen Rechnung auf. `templateFromProject` liefert deshalb `omitted`
       mit Anzahl zurück, und der Dialog zeigt die Liste, **bevor** die
       Vorlage entsteht.
  3. ~~**Persistenz bleibt `localStorage`.**~~ **Erledigt (`suite#103`).**
     Projekte lassen sich im Desktop-Fenster über native Dialoge speichern und
     öffnen; „Speichern" schreibt still an dieselbe Stelle weiter, sobald das
     Projekt eine Datei kennt. Geschrieben wird **atomar** (Nachbardatei →
     `rename`) — ein abgebrochener Vorgang hinterlässt sonst eine halbe
     JSON-Datei, und die hält jeder Leser für ein kaputtes Projekt statt für
     einen abgebrochenen Vorgang. Der lokale Speicher bleibt der Arbeitsstand:
     eine Datei ist der Weg nach draußen, nicht der Ersatz für „die Suite
     öffnet dort, wo ich aufgehört habe". Im Browser bleibt es beim Download
     und beim Datei-Eingabefeld — das ist keine Notlösung, sondern der einzige
     Weg, den ein Browser hat.
  4. ~~**Der Tab-Wechsel schaltet weiterhin nichts.**~~ **Erledigt (`suite#100`):**
     es waren dreizehn wirkungslose Tabs, und sie sind entfernt statt ausgebaut
     (E-9).
  5. **Der Cross-Link hat weiter keinen Sender** (B-18). „Im Signal-Flow
     zeigen" wechselt das Modul, die Auswahl bleibt zurück. **Weiter offen**,
     hängt an E-11 (gemeinsamer Id-Raum).
* **Aufwand:** 1 mittel (Entscheidung nötig), 5 klein

---

### B-41 · Der Weg vom Plan auf die Geräte — was er trägt und was nicht

* **Status:** erledigt (alle drei Wege gebaut oder ausgewiesen)
* **Tally (`suite#99`):** die **Tally-Karte** geht aus dem Signal-Plan an den
  `tally-pi` — `POST /tally-config` mit genau der Quellenliste, die der Plan
  besitzt (Rollen-Id, Name, Mischer-Eingang). ATEM-Adresse und GPIO-Verdrahtung
  gehören dem Pi und werden bewusst nicht mitgeschickt; `merge_tally_config`
  drüben behält jedes Feld, das der POST nicht nennt.
  Der Weg läuft über den **Main-Prozess**, nicht über `fetch` im Renderer:
  `guide_server.py` schickt keine CORS-Kopfzeilen, ein Schreibvorgang aus dem
  Renderer wäre entweder blockiert oder — mit `no-cors` — abgeschickt und
  unlesbar. Ein Schreibvorgang, dessen Ergebnis man nicht erfährt, ist
  schlimmer als keiner.
  **Vor dem Senden steht der Abgleich:** neu / geändert / entfällt. Nötig,
  weil Geräte, die der POST nicht nennt, auf dem Pi verschwinden — richtige
  Semantik, aber keine, die jemand ungefragt auslösen soll. Ein **leerer Plan
  kann gar nicht senden**: gemessen an einem Stub-Pi mit den echten
  `merge_tally_config`/`validate_tally_config` aus `guide_server.py` leerte
  eine Sendung mit null Quellen dessen Geräteliste, während die ATEM-Adresse
  blieb — die Warnung stand da, der Knopf war trotzdem aktiv.

* **B-41.1 Kamerasteuerung (`sony-camera-bridge#14`):** die Brücke liest die
  `camera-list` des MultiCam-Planners und hält sie gegen ihre Slots. Am Pult
  steht danach „CAM 3 — Bühne links" statt einer nackten Nummer.
  **Der Kern ist der Beleg, nicht die Zuordnung.** Bei TCP und seriell kennt
  die Brücke einen Host und einen Port, kein Gerät — ein Abgleich, der dort
  trotzdem etwas behauptet, wäre geraten. Jede Zuordnung trägt deshalb
  `matchedBy`: `model` (Modell gemessen, aus USB-Erkennung oder
  MNC-Discovery), `number` (die Zahl in der Beschriftung — Konvention, auf der
  Kachel mit `?` gekennzeichnet), `manual` (ein Mensch, überschreibt alles und
  überlebt den nächsten Abgleich). **Eindeutig oder gar nicht:** zwei FX9 im
  Rack ergeben keinen Vorschlag, und wo es keinen Beleg gibt, steht der Grund
  im Klartext statt eines Schweigens.

* **B-41.2 Intercom (`Broadcast-intercom#9`):** `Broadcast-intercom` liest das
  herstellerneutrale `avplan-intercom` aus `cable#684` — zwei Endpunkte
  (`/api/plan/preview`, `/api/plan/apply`) und ein Reiter unter Setup.
  **Zusammengeführt wird über den Namen**, nicht über die Id aus der Datei:
  `ch-3` bedeutet auf der Anlage nichts, „PGM" schon, und über die Datei-Id zu
  gehen hieße, beim zweiten Import alles zu verdoppeln. **Gelöscht wird nie** —
  die umgekehrte Entscheidung zum Tally-Weg, und sie fällt anders, weil dieser
  Server Geräte, Antennen, Zuordnungen und Sitzungen besitzt, die ein Plan
  nicht wiederherstellen kann. talk und listen bleiben getrennt; `derivedFrom`
  wird angezeigt, weil eine aus Green-GO abgeleitete Datei beide gesetzt hat
  und das die ärmere Quelle ist, keine Messung.

* **B-41.3 Medien-Station — ausgewiesen, nicht offengelassen.** Nachgesehen in
  `pi-media-station` (README, API-Übersicht, `web_ui.py`): die Station ordnet
  Medien zwei Sensor-Zonen (NAH/FERN) zu und spielt sie ab. Ihr Datenmodell
  sind Zonen, Dateien, GPIO-Pins und Netzwerk. **Es gibt keinen Inhalt, den ein
  AV-Plan ihr geben könnte** — welches Video in welcher Zone läuft, ist
  Ausstellungs-Inhalt, keine Signalführung, und der Plan weiß es nicht und soll
  es nicht wissen.
  Damit ist der Befund aber **nicht „kein Berührungspunkt"**, sondern „ein
  anderer als bei den drei übrigen". Die Station ist ein Gerät im
  Produktionsnetz mit Namen, IP und Dienst auf Port 5000; sie gehört in den
  Plan wie jedes andere Netzgerät — als **Bestand**, nicht als Ziel einer
  Konfiguration. Die Richtung ist umgekehrt: Gerät → Plan statt Plan → Gerät.
  `GET /api/identity` liefert Station-Id und Version und wäre genau der
  Ansatzpunkt, wenn der IP-Plan (Initiative 8) gebaut wird. **Bis dahin ist
  hier nichts zu tun**, und das ist jetzt aufgeschrieben statt vermutet.

---

## Eigentümer-Entscheidungen

**Alle offen gebliebenen Punkte dieser Tabelle sind am 2026-09-08 entschieden
worden** — auf Weisung des Eigentümers („Treffe die Eigentümer-Entscheidungen
sinnvoll und arbeite weiter"). Damit ist keine Zeile mehr blockierend; was
noch nicht gebaut ist, ist Arbeit und keine Frage.

**Danach, am selben Tag, sind acht dieser Zeilen dem Eigentümer noch einmal
vorgelegt worden** — die folgenreichsten, und in der Form, in der er sie
umdrehen konnte. **Fünf hat er bestätigt** (E-7 Datei bleibt Vorgabeweg,
E-12 Lexware in die Shell, E-15 Vorschau-Schritt, E-17/E-20 beide englisch,
E-21 Eigentum je Feld). **Drei hat er umgedreht: E-2, E-3 und E-23.** Die
Begründung, gegen die er entschieden hat, steht in der jeweiligen Zeile weiter
unten — sie ist nicht gelöscht, sondern als *Gegenrede* kenntlich gemacht. Das
ist der Zweck dieser Tabelle: wer eine Entscheidung noch einmal umdreht, findet
hier beide Seiten und nicht nur die zuletzt gewinnende. Was aus einer Umkehr an
Bedingungen folgt (E-3 braucht einen zweiten Token, E-23 braucht eine Regel für
das, was es anzeigen darf), steht ebenfalls dort und gehört zur Entscheidung —
eine Umkehr hebt eine Gefahr nicht auf, sie verlagert sie in den Bau.

Die Tabelle bleibt vollständig stehen, mitsamt der Begründung je Zeile. Eine
Entscheidung ohne ihren Grund ist beim nächsten Durchgang wieder eine Frage —
und die Zeilen E-4, E-5 und E-14 zeigen, dass hier auch schon Entscheidungen
korrigiert worden sind. Wer eine davon umdreht, findet hier, wogegen er
argumentiert.

**Zwei Zeilen tragen eine Bedingung, die kein Beschluss aufhebt** und die
deshalb ausdrücklich zur Entscheidung gehört: E-24 wartet auf eine echte
Beispieldatei (das Format ist unbelegt und liegt hinter dem Egress-Filter) und
E-6 auf denselben Netzzugang wie B-11. Beide sind Tatsachen-Sperren, keine
Meinungen — sie fallen, wenn die Datei bzw. der Zugang da ist, und nicht
vorher. **E-23 stand bis zum 2026-09-08 als dritte in dieser Aufzählung**
(„nur ausgehend, nie ein Laufzeit-Dashboard"); der Eigentümer hat den Umfang
umgedreht. Was von der Bedingung bleibt, ist nicht der Umfang, sondern die
Anzeige-Regel — sie steht in E-23 und ist dort schärfer formuliert als vorher.

| # | Frage | Was davon abhängt |
| --- | --- | --- |
| ~~E-1~~ | ~~Trägt ein vom Modell erfundenes **Kabel** eine Kennzeichnung? `Cable` hat kein `specSource`~~ | **entschieden 2026-09-08: JA — `Cable` bekommt `specSource`, dieselbe `Provenance` wie der Port.** Die Zeile, die hier als offene Frage stand, enthielt die Antwort schon: „eine erfundene Verbindung behauptet mehr als eine erfundene Port-Zahl". Das ist kein Grund zu zögern, sondern der Grund zu kennzeichnen. ADR-003 verlangt, unbestätigten Zustand nie als Tatsache zu zeigen; ein automatisch geroutetes Kabel ist genau das. Ohne Feld sieht der Ausdruck einer geratenen Verbindung aus wie einer, die jemand gesteckt hat — und die Kabelliste geht mit ins Lager |
| ~~E-2~~ | ~~Intercom-Vokabular: gemeinsames Paket oder `GreenGoConfig` als Wahrheit?~~ | **entschieden 2026-09-08 vom Eigentümer: Intercom bekommt einen EIGENEN `.avplan`-Slot** — die Intercom-Konfiguration wird geführt, nicht abgeleitet. Zwei Teile der Vorentscheidung bleiben unverändert gültig, weil der Eigentümer sie nicht bestritten hat: die **Vokabel** ist das herstellerneutrale Format aus B-8 (nicht `GreenGoConfig`), und sie zieht in ein **gemeinsames Paket**, weil es zwei Verbraucher gibt. Umgedreht ist allein die Frage, ob die Konfiguration eine Ableitung oder eine Quelle ist. **Damit ADR-001 nicht verletzt wird, teilt der Slot sauber:** er trägt NUR, was der Plan nicht hergibt — Kanalzuordnung, Key-Gruppen, Beltpack-Beschriftung, die Talk/Listen-Matrix. Alles, was der Plan schon führt (welches Gerät, welcher Port, welche Rolle), steht im Slot als **Verweis über die Objekt-Id**, nicht als Kopie. Ein Slot, der Gerätenamen abschreibt, wäre die zweite Wahrheit; einer, der auf sie zeigt, ist ein eigenes Gewerk. `GreenGoConfig` bleibt die Ausgabe-Projektion dieses Slots. **Gegenrede (die frühere Fassung, gegen die entschieden wurde), damit sie beim nächsten Durchgang nicht als neue Idee auftaucht:** `GreenGoConfig` kann die Wahrheit nicht sein: sie ist die Konfiguration EINES Herstellers, und B-8 hat das neutrale Format bereits gebaut (`cable#684`) — ein Format, das über dem Hersteller steht, danach zur Projektion eines Herstellers zu erklären, wäre eine Rückwärtsbewegung. Zwei Verbraucher gibt es schon (cable-planner und `Broadcast-intercom/packages/shared`, 437 Zeilen), also gibt es auch den Anlass für das Paket. „Kein vierter `.avplan`-Slot: der Plan trägt die Wahrheit bereits (Rollen, Ports, Kanäle); die Intercom-Konfiguration wird daraus ABGELEITET wie die Tally-Karte. Ein eigener Slot machte aus einer Ableitung eine zweite Quelle — genau der Fehler, den ADR-001 benennt." **Warum das nicht durchhält:** die Ableitung stimmt für die Verdrahtung und nicht für die Bedienung. Wer mit wem sprechen darf, welche Taste auf welcher Position liegt und wie ein Beltpack beschriftet ist, steht in keinem Signalfluss — das sind Regie-Entscheidungen, keine Folgen der Verkabelung. Eine Ableitung hätte sie erfinden müssen |
| ~~E-3~~ | ~~Soll der Techniker vor Ort den **Anlagen-Pincode** über die Mobile-Ansicht bekommen?~~ | **entschieden 2026-09-08 vom Eigentümer: JA — aber hinter einem EIGENEN Token, nicht hinter dem des QR-Links.** Der Arbeitsablauf gewinnt, die Speicherregel bleibt: der Pincode liegt weiterhin im OS-Credential-Store (`keytar`), wird **nicht** ins Projekt-File geschrieben und **nicht** geloggt — `CLAUDE.md` ist an dieser Stelle nicht verhandelt worden und wird durch diese Entscheidung nicht berührt. Was sich ändert, ist allein der Abrufweg. **Die vier Bedingungen, ohne die die Entscheidung nicht umsetzbar ist, und die deshalb zu ihr gehören:** (1) **Zweiter Token.** Der Share-Token, der im QR-Code steckt und im WLAN herumliegt, reicht ausdrücklich NICHT — der Abruf braucht einen zweiten, der einzeln und bewusst ausgegeben wird. Sonst hiesse „hinter einem Extra-Token" in der Praxis „hinter dem Link", und die Entscheidung wäre eine andere als die getroffene. (2) **Nicht im ausgelieferten Blatt.** Die Mobile-Ansicht trägt den Code nicht im HTML; sie holt ihn bei Bedarf über einen eigenen Endpunkt. Ein Wert im Blatt ist im Cache, im Verlauf und im Screenshot. (3) **Je Projekt einschaltbar, aus als Vorgabe** — der Normalfall bleibt der von `cable#656`. (4) **Jeder Abruf steht im Dokument-Protokoll** (`documentLog:*`), mit Zeitpunkt und Token-Kennung, nicht mit dem Wert. **Was dadurch nicht entfällt:** die Ansprechpartner-Anzeige aus der Haus-Antwort (Bedarf 85, `lib/venueAnswers.ts`) wird trotzdem gebaut — sie ist der Weg für alle Fälle, in denen niemand einen zweiten Token ausgibt. **Gegenrede (die frühere Fassung, gegen die entschieden wurde):** „NEIN, und zwar nicht als Abwägung, sondern als Regel. Die Mobile-Ansicht wird über einen QR-Link an jedes Telefon im WLAN ausgeliefert — sie ist der denkbar schlechteste Kanal dafür. `cable#656` hat das Leck geschlossen; es wieder zu öffnen, wäre ein Rückschritt mit Bequemlichkeits-Begründung." **Warum die Umkehr trotzdem tragfähig ist:** der Einwand galt dem KANAL, und der Kanal ist hier nicht mehr derselbe. `cable#656` hat den Code aus dem allgemein ausgelieferten Blatt genommen; ein separat ausgegebener Token liefert ihn nicht an „jedes Telefon im WLAN", sondern an das eine, dem jemand ihn gegeben hat. Was der Einwand richtig gesehen hat, steht als Bedingung (1) und (2) oben — er ist damit nicht widerlegt, sondern eingebaut |
| ~~E-4~~ | ~~Wo wohnt der **As-built-Zustand**?~~ | **beantwortet 2026-09-08 — und zwar rückwirkend, durch Code, der die Frage nicht kannte.** `lib/asBuilt.ts` (Bedarf 126, `cable#712`) hatte die Entscheidung längst getroffen: der As-built-Zustand wohnt in einer **eigenen Spur** — `AsBuiltEntry` mit `ReadingSource` und Zeitpunkt —, das Blatt stellt Absicht und Beobachtung nebeneinander, und in den Plan zurück schreibt es ausdrücklich nichts („was der Hub gerade tut, ist eine Beobachtung, was im Plan steht, eine Absicht"). Damit ist auch die Folgefrage beantwortet: **`Provenance` braucht keinen fünften Wert.** `Provenance` sagt, woher eine Angabe IM PLAN stammt; eine Ablesung wird nie eine Angabe im Plan, sie steht daneben. `cable#764` hat die Verkabelung als fünfte Quelle auf dasselbe Blatt gesetzt (`fromCabling`) und dabei nichts am Modell ändern müssen — das ist der Beleg, dass die Spur trägt. **Lehre:** eine als Eigentümer-Frage geführte Entscheidung kann durch Bauarbeit an anderer Stelle beantwortet werden, ohne dass jemand die Tabelle anfasst. Wer eine Frage hier stehen lässt, prüft, ob der Code sie inzwischen entschieden hat |
| ~~E-5~~ | ~~Woher kommen **Subnetze** — abgeleitet oder projektweiter Pool?~~ | **entschieden 2026-09-07: BEIDES, als zwei Typen EINES Modells.** Die Frage war falsch gestellt — „abgeleitet ODER Pool" sind keine Alternativen, sondern zwei Sorten Präfix. Nachgesehen an der Quelle, die dieser Planer ohnehin importiert (NetBox, `netbox:*`-IPC): dort steht über der Hierarchie ein **Aggregate** („the portions of IP space that are interesting to us", überschneidungsfrei), darunter **Prefixes**, die ineinander verschachtelt sind. Ein Prefix mit `status: container` „exists merely as a container for organizing child prefixes" — das ist der ABGELEITETE Fall. Ein Prefix mit `is_pool` macht erste und letzte Adresse nutzbar — das ist der POOL-Fall. Beide tragen dieselben Felder: eine funktionale **Rolle** und optional ein **VLAN** („A VLAN may have multiple prefixes assigned to it"). Darunter liegen **IP Ranges** und einzelne Adressen. Und die für uns wichtigste Zeile: **NetBox vergibt nicht selbst.** Es meldet freien Raum, den ein Mensch oder ein API-Aufruf beansprucht; ein als `populated` markierter Range verbietet sogar das Anlegen einzelner Adressen darin, weil ihn ein DHCP von aussen führt. Genau die Haltung, die `addressPlan.ts` heute schon hat — sie bekommt jetzt nur ein Modell darunter statt einer Leerstelle. Quellen: [prefix.md](https://raw.githubusercontent.com/netbox-community/netbox/main/docs/models/ipam/prefix.md), [aggregate.md](https://raw.githubusercontent.com/netbox-community/netbox/main/docs/models/ipam/aggregate.md), [iprange.md](https://raw.githubusercontent.com/netbox-community/netbox/main/docs/models/ipam/iprange.md). **Nicht** als Vorbild genommen: Cisco Packet Tracer — es übt die VLSM-Arithmetik an einer Aufgabe („design a VLSM addressing scheme given a network address and host requirements"), führt aber keinen Adressraum; es ist ein Lehrsimulator und kein Modell, das man abschreiben kann. **GEBAUT 2026-09-07 in `cable#750`** (`types/addressTemplate.ts`, `lib/addressTemplate.ts`) — mit EINER Berichtigung an dieser Zeile: die Art heisst dort `assignable` und ausdruecklich NICHT `pool`. Der Satz oben („ein Prefix mit `is_pool` … das ist der POOL-Fall") liest NetBox' Flag als „hier wird vergeben", und das ist es nicht. Die Quelle sagt woertlich: *„If selected, the first and last IP addresses within the prefix (normally reserved as the network and broadcast addresses, respectively) will be considered usable."* — also eine Aussage ueber ZWEI ADRESSEN, nicht ueber Vergabe. Dieselbe Wortmarke fuer beide Bedeutungen haette ein Import aus NetBox oder einen Export dorthin auf ein gleichnamiges Feld mit anderer Bedeutung abgebildet; der Fehler faellt dann Jahre spaeter auf. `is_pool` gibt es im Code trotzdem — als `firstLastUsable`, mit der geliehenen Bedeutung und ohne den geliehenen Namen, und ein Test prueft die Typ-Union darauf |
| ~~E-6~~ | ~~Was zählt als **Beleg** für einen Steckertyp / eine Funkkomponente?~~ | **entschieden 2026-09-08: für Geräte die Hersteller-Datenblattseite (`manufacturerUrl`, wie gehabt) — für Steckertypen die NORM.** Ein Steckertyp ist keine Herstellersache: BNC, XLR-3, Speakon und RJ45 sind in IEC/SMPTE-Normen definiert, und die Datenblattseite eines beliebigen Herstellers wäre der schwächere Beleg für dieselbe Aussage. Deshalb bekommt `connectorCatalog` ein eigenes Belegfeld, das eine NORM benennt (Nummer plus Ausgabe), nicht eine Produktseite. Für Funkkomponenten gilt die Geräteregel, mit einem Zusatz: der Beleg muss den **Frequenzbereich der Länderversion** tragen, weil dieselbe Modellbezeichnung je Region ein anderes Band hat — ein Beleg ohne Bandangabe belegt für diesen Katalog nichts |
| ~~E-7~~ | ~~Liefert der Planer den Pi **direkt** oder bleibt die Datei der Weg?~~ | **entschieden 2026-09-08: BEIDES, mit klarer Rangfolge — die Datei bleibt der Vorgabeweg, der Direktweg kommt als ausdrücklich einzuschaltendes Ziel dazu.** „Entweder-oder" war die falsche Frage: Ob der Pi aus dem Büronetz erreichbar ist, entscheidet die Netzarchitektur des jeweiligen Kunden, nicht dieses Repo. Ein Planer, der den Direktweg voraussetzt, ist in getrennten Netzen unbrauchbar; einer, der ihn verbietet, erzwingt den Medienbruch auch dort, wo er unnötig ist. Deshalb: die Download-Datei bleibt, wie sie ist, und ein Ziel in den Einstellungen (Adresse + Token wie beim Mobile-Share) schaltet den HTTP-POST an `guide_server.py` frei. **Bedingung, die zur Entscheidung gehört:** der Fehlerfall muss sichtbar sein — ein stiller Fehlschlag wäre schlimmer als die Datei, weil dann niemand kopiert UND niemand es merkt |
| ~~E-8~~ | ~~Soll importierte Rentman-Leistung (`powerWatts`) in die Stromrechnung eingehen?~~ | **entschieden 2026-09-08: JA — aber mit genannter Herkunft je Zeile, und `powerConsumptionWatts` behält den Vorrang.** Eine Lastrechnung, die eine bekannte Zahl ignoriert, ist nicht vorsichtig, sondern falsch: sie zeigt 0 W für ein Gerät, dessen Leistung im Projekt steht. Die Sorge dieser Zeile („ändert die Gesamtlast bestehender Pläne von 0 W auf einen echten Wert") beschreibt eine BERICHTIGUNG, keinen Schaden. Zwei Bedingungen gehören dazu, und sie sind der eigentliche Inhalt der Entscheidung: (1) wo beide Felder gefüllt sind, gewinnt `powerConsumptionWatts` — es ist die geplante Angabe, `powerWatts` die importierte; (2) das Stromblatt nennt je Zeile, woher die Zahl kommt (geplant / importiert / Katalog), weil eine Summe aus zwei Quellen ohne Herkunft genau die Zahl ist, an der jemand eine Verteilung zusagt |
| ~~E-9~~ | ~~Werden die acht wirkungslosen Tabs **entfernt** oder **ausgebaut**?~~ | **entschieden 2026-09-05** (`suite#100`): entfernt. Es waren dreizehn von dreizehn; die drei Planer bringen ihre Ansichtsleiste selbst mit, und für die übrigen hätte Ausbauen geheißen, Ansichten zu erfinden |
| ~~E-10~~ | ~~Auf welcher Seite werden die Dev-Ports angeglichen?~~ | **entschieden 2026-09-08: die PLANER werden auf 4181–4183 festgenagelt.** Die andere Seite ist nicht wählbar, und das steht in der Zeile selbst: die Shell umzustellen scheitert an der 5173-Kollision zweier Planer — zwei Vite-Instanzen auf demselben Port sind kein Konfigurationsproblem, sondern ein Widerspruch. Der Preis (cable-planners `dev:electron`, lights Screenshot-Skripte) ist mechanisch und einmalig. Ein fester Port je Planer ist zusätzlich die Voraussetzung dafür, dass `devports:check` überhaupt etwas prüfen kann |
| ~~E-21~~ | ~~Wer gewinnt, wenn **MultiCam und Licht denselben Raum** ändern?~~ | **entschieden 2026-09-08: NIEMAND gewinnt still — und die Regel hat zwei Stufen.** (1) **Eigentum je Feld.** Jedes Seed-Feld bekommt genau eine schreibende App; die Schreibung einer anderen ist ein VORSCHLAG, keine Änderung. Damit verschwindet der Konflikt für den grössten Teil der Felder, statt gelöst zu werden — der Raum gehört dem Planer, der ihn vermisst hat, und die anderen lesen ihn. (2) **Für die wenigen echt geteilten Felder** — allen voran die Zuordnung aus E-22, die laut jener Entscheidung ausdrücklich alle schreiben — trägt jeder Eintrag Herkunft und Zeitpunkt, und eine widersprechende Schreibung wird zu einem BEFUND, nicht zu einer Überschreibung. Das ist ADR-003 an dieser Stelle: der zuletzt zurückmeldende Planer „gewinnt" sonst still, und beide Seiten sehen für sich vollständig aus. Ein „letzter gewinnt" mit Zeitstempel wäre die scheinbar einfachste Regel und die schlechteste: sie macht aus einem Widerspruch ein Rennen, dessen Ausgang von der Netzlaufzeit abhängt. **Damit ist Bedarf 49 entblockt** — und **gebaut ist die Regel seit 2026-09-08** (`suite#169`, siehe B-39, Punkt 1): `SEED_VENUE_OWNER` als `satisfies`-Tabelle, `SuiteSeed.holds` mit Herkunft und Zeitpunkt, `SeedConflict` als Ausgabe von `mergeSeedPatch`, Streifen statt Toast. Der Eigentümer hat die Entscheidung am selben Tag ausdrücklich bestätigt |
| ~~E-11~~ | ~~Soll der Cross-Link bis **in** die eingebetteten Planer reichen?~~ | **entschieden 2026-09-08: JA — und der gemeinsame Id-Raum wird nicht neu erfunden, sondern ist der des Seed-Protokolls.** Der Einwand dieser Zeile („braucht einen gemeinsamen Id-Raum") ist seit E-22 gegenstandslos: `suite-seed` fährt bereits Objekte mit Ids zwischen Shell und eingebettetem Planer, und jede App bildet sie auf ihr natives Modell ab. Der Sprung benutzt dieselben Ids wie der Seed; wo eine App ein Objekt nicht kennt, wechselt sie das Modul und sagt, dass sie es nicht gefunden hat — sichtbar, statt stumm irgendwo zu landen. Ein zweiter Id-Raum wäre die zweite Wahrheit, gegen die ADR-001 geschrieben ist |
| ~~E-12~~ | ~~Wo wohnt Lexware architektonisch — Shell oder Planer?~~ | **entschieden 2026-09-08: eigene Shell-Domäne.** Buchhaltung ist keine Aufgabe eines Verkabelungsplaners — sie hängt am Projekt, nicht am Signalfluss, und sie ist für alle Module dieselbe. In der Shell gibt es sie einmal; im Planer gäbe es sie dreimal oder nur in einem, und die anderen zwei Module hätten keinen Beleg-Weg. Das löst zugleich B-19: die beiden Bedingungen, die sich heute gegenseitig ausschliessen (`connectShellLexware` hält sich im Nicht-Embedded-Fall heraus, der Handler braucht `window.cablePlanner`), verschwinden mitsamt dem Handler — der Beleg-Weg läuft dann im Hauptprozess der Shell, wo der Schlüssel ohnehin liegt |
| ~~E-13~~ | ~~Bleibt die Shell-Vorschau ein eigenständiges Übersichtsmodell?~~ | **entschieden 2026-09-08: JA, sie bleibt eigenständig — und wird als Vorschau KENNTLICH. GEBAUT am selben Tag** (`suite#169`, `PreviewNotice` in `shell/previews.tsx`, gerendert in `TabDeck`): ein Streifen über der Fläche mit drei Aussagen, die ADR-003 an dieser Stelle zusammen verlangt und die einzeln wertlos sind — das Etikett („Vorschau"), der STAND (Projekt-Version plus „ungespeichert"; ein Etikett ohne Datum ist keins) und der Weg in den Planer für das, was sie nicht zeigen kann. Nur bei zugewiesenem Projekt: ohne eines sagt `StandaloneHint` das schon, und zwei Hinweise übereinander heben einander auf. Ein Wächter (`vorschauIstKenntlich.test.ts`) hält die eine Aussage fest, an der die Entscheidung hängt — **wer eine Vorschau-Fläche rendert, rendert auch ihre Kennzeichnung** —, und ausdrücklich nicht, wie der Streifen aussieht: Text und Anordnung dürfen sich ändern, ohne dass eine Zusicherung fällt. Der Fehler, gegen den er steht, ist nicht „jemand baut den Streifen um", sondern „jemand baut eine ZWEITE Stelle mit Vorschau und vergisst ihn dort" — dieselbe Form wie B-35. Gegengeprobt, alle drei rot: Kennzeichnung entfernt · Kennzeichnung ohne Stand · kein Weg in den Planer.** Die Modelle zusammenzuführen hiesse, der Shell das vollständige Planer-Modell zu geben, damit sie ein Vorschaubild zeichnen kann; das ist der teuerste Weg zum kleinsten Nutzen und macht die Shell von jeder Modelländerung abhängig. Was die Vorschau falsch macht, ist nicht ihre Eigenständigkeit, sondern ihr Schweigen darüber: sie zeigt echte Daten in einem anderen Modell und sieht aus wie der Plan. Also bekommt sie, was ADR-003 in solchen Fällen verlangt — eine sichtbare Kennzeichnung samt Stand, und einen Weg ins Modul für alles, was sie nicht zeigen kann |
| ~~E-14~~ | ~~Welche Kategorien soll der Versions-Vergleich zeigen, und welche Felder machen darin eine Änderung aus?~~ | **entschieden 2026-09-08** (`light#95`): **alle vierzehn**, und die Felder sind die, die die Oberfläche ohnehin schon als Eigenschaft eines Objekts führt — da war nichts zu erfinden. Echt zu entscheiden gab es genau einen Fall, und der hat eine richtige Antwort: die Reihenfolge in `fixtureGroups.fixtureIds` bedeutet nichts, also wird **sortiert** verglichen; sonst meldete jede Umsortierung eine Änderung, und das ist derselbe Schaden wie der ursprüngliche Befund, nur andersherum. `layers`/`floor`/`sun` bekamen mit `diffSingle` ihre eigene Vergleichsform — sie sind keine Listen, haben also kein `id`-Paar, sondern genau ein Vorher und ein Nachher. Gegen ein Wiederauftreten steht `ALLE_KATEGORIEN` als einzige Liste (`satisfies` gegen die Schlüssel von `ProjectDiff`) plus ein Rest-Test in `unnamedDifferences`: ein neues Feld im Projekt, das niemand in den Vergleich aufnimmt, meldet sich selbst |
| ~~E-15~~ | ~~Wie sieht das **Abbrechen** eines Lager-Imports aus?~~ | **entschieden 2026-09-08: Vorschau-Schritt** — dieselbe Bauform wie beim Ablauf-Import (`suite#142`), der genau diese Frage schon beantwortet hat: es gibt genau EINEN Weg an die Daten, und der führt über eine bestätigte Vorschau. Der Drei-Wege-Dialog scheidet aus, weil er fragt, bevor der Nutzer sehen kann, worüber er entscheidet („zusammenführen oder ersetzen?" ist ohne die Liste der betroffenen Positionen nicht beantwortbar). Ein Undo für den Lager-Store scheidet aus, weil der Lagerbestand projektübergreifend ist: ein Rückgängig, das zwischen zwei Projekten wirkt, ist keine Aktion mehr, sondern eine Zeitreise. Das Zwischenmass aus `suite#154` (Escape und Hintergrund-Klick brechen ab, statt still zusammenzuführen) bleibt und wird von der Vorschau abgelöst |
| ~~E-16~~ | ~~Werden `PrintDialog` und `TitleBlock` **verdrahtet** oder **gelöscht**?~~ | **entschieden 2026-09-08: gelöscht.** Verdrahten hiesse, eine zweite Druckstrecke neben der zu betreiben, die es schon gibt — und ADR-004 hat für den Stempel genau eine Quelle festgelegt. Zwei Druckwege bedeuten zwei Stellen, an denen der Stempel fehlen kann; `cable#673` hat gezeigt, wie das ausgeht (der Weg, der „Drucken" hiess, war der eine ohne Stempel). 21 KB Code und 48 übersetzte Zeichenketten, die nichts rendern, sind ausserdem genau die Sorte Fund, die B-38 als „gebaut und nicht geliefert" führt. Was an `TitleBlock` inhaltlich fehlt und im gelieferten Weg nicht steht, wird DORT ergänzt, nicht nebenan |
| ~~E-17~~ | ~~Welche Sprache ist die Quellsprache von `sony-camera-bridge`?~~ | **entschieden 2026-09-08: ENGLISCH** — und zwar nach dem Bestand, nicht nach dem Wunsch: 140 englische Stellen gegen 32 deutsche. Die Oberfläche ist ein RCP-Dashboard für Technik, deren Vokabular ohnehin englisch ist (Iris, Gain, ND, Paint). 140 Stellen ins Deutsche umzuschreiben, um dann „Blende" neben `WB` zu setzen, kostet Arbeit und verschlechtert das Ergebnis. Siehe die Konvention unter E-20 |
| ~~E-18~~ | ~~Besetzt die Suite die **Zeitachse** — Ablauf/Rundown als Datenobjekt?~~ | **entschieden 2026-09-07: NUR LESEN.** Der Ablauf wird eingelesen und mit dem technischen Plan verknüpft, aber nicht hier geführt. Die Autorenschaft bleibt in der Tabelle, in der der Ablauf ohnehin lebt. Das teilt die elf anhängenden Bedarfe sauber: **erreichbar** sind 4 (Interoperabilität mit eben dieser Tabelle), 6 (die unordentliche Kundentabelle einlesen), 7 (aus einer Quelle in jedes Format rendern) und 8 (die Verknüpfung Ablauf ↔ technischer Plan — der Kern der Entscheidung). **WON'T, weil sie Autorenschaft brauchen:** 11 (Versionsstand und Änderungsprotokoll über Gewerke), 53 (den Rest automatisch nachziehen), 54 (geteilter Ablauf mit Spaltenrechten je Rolle), 56 (Ist-Zeiten mit einem Tipp erfassen). **Bleibt an anderer Frage hängen:** 45 (Weg vom Ablauf-INHALT zur Bedienoberfläche → E-23) und 10 (der Ablauf live an der Kamera — Verteilung zur Laufzeit, nicht Lesen). **Eigenständig:** 55 (Mehrtägigkeit und Parallelbühnen sind eine Frage des Projektmodells, nicht des Ablaufs). Diese Aufteilung gehört so in die Feature-Matrix — ein WON'T, das nur fehlt, wird beim nächsten Durchgang zum Kandidaten. **GEBAUT 2026-09-07 in `suite#142`**: Bedarf 8 und 6 ganz (`packages/ui/src/rundown.ts` — toleranter Tabellen-Leser, Spalten-Zuordnung, Vorschau mit benannten Übersprüngen, Verknüpfung über Objekt-IDs, `ref-missing` als Antwort auf „was entwertet diese Änderung"), Bedarf 7 ganz (`packages/ui/src/rundownViews.ts` — fünf Empfänger-Sichten als SPALTEN-AUSWAHLEN aus einer Quelle, Feld-Legende und Stand-Zeile im Blatt), Bedarf 4 **halb** (CSV/TSV steht, XLSX offen). Die Entscheidung „nur lesen" ist im Code durch Tests gesichert: es gibt keine Funktion, die einen Ablauf-Punkt anlegt, umsortiert oder seine Zeit setzt, und genau EINEN Weg, an einen Ablauf zu kommen — aus einer bestätigten Vorschau |
| ~~E-20~~ | ~~Welche Sprache ist die **Quellsprache** von `multicam-planner`?~~ | **entschieden 2026-09-08: ENGLISCH**, weil es das faktisch schon ist (482 Schlüssel in 14 Dateien mit deutschem Override) und eine Umkehr ~500 Zeichenketten anfasst, ohne dass ein Nutzer einen Unterschied sähe. **Und daraus die Konvention, die diese Zeile und E-17 gemeinsam beantwortet: die Quellsprache ist eine Eigenschaft des REPOS, nicht der Suite.** cable-planner und light-planner sind deutschsprachige Planungswerkzeuge und bleiben deutsch-quellig; multicam-planner und sony-camera-bridge sind englisch-quellig. Was NICHT bleibt, ist das Stillschweigen darüber: jedes Repo deklariert seine Quellsprache an einer Stelle, und ein Wächter hält sie fest — sonst „berichtigt" der nächste Durchgang die Abweichung und fasst 500 Zeichenketten an, weil `CLAUDE.md` an einer anderen Stelle etwas anderes nahelegt |
| ~~E-22~~ | ~~Wo wohnt die Zuordnung **Kamera → Bedienfeld → Multiviewer → Tally**?~~ | **entschieden 2026-09-07: ein geteiltes Objekt, alle lesen UND schreiben es, `@avplan` reicht es von einem zum anderen.** Damit trägt keiner der beiden Planer die Zuordnung allein, und keiner liest sie nur. Das Vehikel gibt es schon: das Seed-Protokoll (`packages/ui/src/seed.ts`, `suite-seed` v1) fährt über den postMessage-Bus zwischen Shell und eingebettetem Planer und trägt „nur Felder, für die die Shell eine Quelle hat"; die Abbildung auf das native Modell macht jede App selbst, „dort, wo ihr Modell und ihr Geräte-Katalog liegen". Die Zuordnung ist genau so ein Feld. **Was diese Antwort AUFWIRFT, und zwar sofort: E-21.** Solange nur einer schrieb, war „wer gewinnt" eine Randfrage; bei „alle schreiben" ist sie die erste. Ohne Regel überschreibt der zuletzt zurückmeldende Planer die Zuordnung des anderen — und zwar still, weil beide Seiten für sich vollständig aussehen. **E-21 ist damit nicht mehr offen, sondern blockierend:** die Implementierung von Bedarf 49 kann nicht beginnen, bevor die Konfliktregel steht |
| ~~E-23~~ | ~~Spricht die Suite eine **Show-Control-Sprache**?~~ | **entschieden 2026-09-08 vom Eigentümer: AUSGEHEND UND EINGEHEND; die Vokabel bleibt OSC.** Der ausgehende Teil ist unverändert der der Vorentscheidung: der Plan BENENNT je Ausspielziel eine OSC-Adresse bzw. Companion-Position und druckt sie, als Konfiguration. **Neu ist der eingehende Teil, und mit ihm die einzige Bedingung, die diese Entscheidung noch trägt** — sie hat sich vom Umfang auf die ANZEIGE verschoben und ist dort schärfer als vorher: was aus einer eingehenden Nachricht auf den Schirm kommt, ist eine EMPFANGSMELDUNG und nie ein Anlagenzustand. Also: „Cue 12 um 14:22:07 empfangen", mit Alter und Absender — nicht „Kamera 3 bereit", nicht grün/rot über der Anlage. Das ist dieselbe Regel, die ADR-003 für unbestätigten Zustand aufstellt, und sie ist hier der ganze Unterschied zwischen einer brauchbaren Mitschrift und der Entwarnung, für die dieses Repo keinen Beleg hat. **Dazu vier Auflagen für den Port:** er ist aus als Vorgabe, wird je Projekt eingeschaltet, lauscht auf einer Adresse, die der Nutzer nennt (nicht `0.0.0.0` als Vorgabe), und meldet sichtbar, wenn er nicht binden konnte — ein stiller Nicht-Empfang sieht aus wie „keine Cues", und das ist die Entwarnung durch die Hintertür. **Gegenrede (die frühere Fassung, gegen die entschieden wurde):** NUR AUSGEHEND. Die Bedarfs-Datenbank stellt die Massnahme unter eine Bedingung, die sich nicht wegrecherchieren lässt: *„do NOT build a live monitoring dashboard, which would make the suite responsible for a false all-clear"*. Wer Zustand anzeigt, haftet für die Entwarnung — und dieses Repo hat keinen Weg, eine Entwarnung zu verifizieren. **Warum die Umkehr damit vereinbar ist:** die Quelle verbietet ein *monitoring dashboard*, nicht das Zuhören. Empfangen und Anzeigen sind zwei Schritte; der Satz trifft den zweiten. Die Auflage oben verbietet genau den, den er verbietet. Dass Companion sich inzwischen auch AUSLESEN lässt (`CUSTOM-VARIABLE … GET-VALUE`, gemergt 2026-03-04), war schon in der Vorentscheidung vermerkt und ist jetzt der Weg, auf dem der eingehende Teil überhaupt etwas zu lesen bekommt. OSC, weil es die breiteste Anschlussfähigkeit hat. **Mit der Auflage aus der Recherche:** wo eine Companion-Adresse steht, schreibt das Blatt dazu, dass deren Schnittstelle opt-in ist — sonst zeigt der Plan einen Weg, den es beim Kunden nicht gibt |
| ~~E-24~~ | ~~Bindet die Suite **CuePilot** und **LiveEdit** an — und wenn ja, in welcher Richtung?~~ | **entschieden 2026-09-08: NUR LESEN (Variante a). (b) und (c) sind damit WON'T** — (c) fällt unter dieselbe Bedingung wie E-23, und (b) setzt ein dokumentiertes Format voraus, das dieses Repo nicht belegen kann. Die Richtung ist damit dieselbe wie bei E-18, und aus demselben Grund: die Autorenschaft bleibt beim Werkzeug, in dem der Cue-Track ohnehin entsteht. **Die Entscheidung ist gefallen, der Bau wartet auf eine Tatsache**, und das ist kein Aufschub, sondern die Bedingung: ohne eine echte Beispieldatei oder eine Formatdoku wäre der Leser geraten. `cuepilot.com`, `liveedit.app` und `cuepilot.zendesk.com` liegen hinter dem Egress-Filter (zuletzt geprüft 2026-09-08). Was der Leser tun soll, steht dagegen fest: einen Cue-Track einlesen und gegen den technischen Plan halten — welche Kamera, welches Kabel, welche Funkstrecke hängt an diesem Cue. Sobald eine Beispieldatei vorliegt, ist das dieselbe Bauform wie der Ablauf-Leser |
| ~~E-19~~ | ~~Sind die vier Runtime-Repos Teil der **Suite** oder bewusst eigenständig?~~ | **entschieden 2026-09-05** (`suite#99`): Teil der Suite, aber als Geräte über eine Adresse statt als mitgelieferte Ansicht. Beides zugleich — laufende Anwendung und Attrappe im Fenster — war die Variante, die es nicht gibt |

---

## Erledigt (2026-09-03/04)

| Punkt | PR |
| --- | --- |
| Green-GO-Tastenkarte überlebt den Export | `cable#653` |
| NetBox-Präfixlänge nicht mehr geraten | `cable#653` |
| Aufbaustand im Plan-Fingerabdruck | `cable#654` |
| Vergleich gegen festgeschriebene Revision | `cable#655` |
| Letzter nativer Dialog in `CollabPanel` | `cable#655` |
| Anlagen-Passwörter verlassen den Rechner nicht mehr | `cable#656` |
| Native-Dialoge-Guard traf nur `window.alert(` | `cable#657` |
| Vendortes Lager in `light-planner` verdrahtet | `suite#61` |
| `--write-baseline` verweigert das Begraben offener Änderungen | `suite#61` |
| Native-Dialoge-Guard über alle vier Apps | `suite#62` |
| Suite-Guard traf nur `window.alert(` (B-1) | `suite#63` |
| CI für `Broadcast-intercom` (B-2) | `Broadcast-intercom#6` |
| CI für `sony-camera-bridge` (B-3) | `sony-camera-bridge#11` |
| Rückweg-Liste im Drift-Bericht (B-5) | `suite#64` |
| Vier zu pessimistische Roadmap-Zeilen berichtigt | `suite#60` |
| CRDT-/Signaling-Pruefung in CI (B-4, war laengst erledigt) | `cable#658` |
| Vendorierung cable #659-#662 + `CLAUDE.md`-Drift (B-14) | `suite#65` |
| Leistungskette vereinheitlicht (vier Kopien, zwei ohne Modus) | `cable#668` |
| `Strg+P`/`Strg+A` ohne Handler; `selectAll`/`jumpToPatches` gebunden | `cable#669` |
| Custom-Palette: folgenloser Akzent-Regler entfernt | `cable#669` |
| ADR-005: „Speichern (Gerät)" verlor die Fremd-Domänen | `light#56` |
| i18n: 40 von 42 englischen Schlüsseln bedienten toten Code | `light#59` |
| `i18n:check` las nur eine der beiden Wörterbuch-Formen | `light#60` |
| Lager-Dialog + Beleg-Marken der Suite englisch (563/563) | `suite#71` |
| `identity:check` war vendoriert, lief aber in keiner Suite-CI | `suite#71` |
| Neun Dialoge/Panels ohne `t()` gewickelt (B-23) | `light#62`, `suite#72` |
| Onboarding-Inhalt gewickelt; B-23 in der Suite bei 0 | `suite#72` |
| 451 englische Zeilen im deutschen Wörterbuch (cable) | `cable#671` |
| 58 neuere Schlüssel in `cable-planner` übersetzt | `cable#671` |
| Deutscher Text als englische Quellsprache (multicam) | `suite#73` |
| `i18n:check` zaehlte TypeScript-Vergleiche als deutschen Text | `light#63` |
| `i18n:check` meldet ungewickelte Komponenten (B-13) | `light#61` |
| Tests + CI für `tally-pi` (B-12) | `tally-pi#7` |
| README/JSON-LD/Generator sagten „open source" gegen die eigene Lizenz | `cable#686` |
| Vier Dokumente mit vier verschiedenen Drift-Ständen | `suite` (dieser PR) |
| ADR-002: 444 statt gemessener 412 Katalog-Einträge | `suite` (dieser PR) |
| `tally-pi`/`pi-media-station` galten als test- und CI-los (55/21 Tests) | `suite` (dieser PR) |
| Doku-Auffindbarkeit: 67 von 67 Dokumenten verwaist (B-38) | `suite` (dieser PR) |
| Herstellerneutrales Intercom-Format (B-8) | `cable#684`, `suite#86` |
| Ausspielweg SRT/RTMP/HLS im Netz-Budget (B-10, erste Hälfte) | `cable#683` |
| Vier eigenständige Repos in der Matrix ausgewiesen (B-35, Ausweisung) | `suite` (dieser PR) |
| Erste CI + Tests für `pi-media-station` (B-12) | `pi-media-station#3` |
| Tally-Id-Vertrag: jede echte `tally.json` wurde abgelehnt | `cable#674` |
| Zehnte Messrunde: 6 von 12 Zeilen widerlegt | `suite#75` |
| MIT-Lizenz auf proprietär gestelltem Code (3 Apps) | `suite#76` |
| Flacher CI-Checkout machte die Rückweg-Prüfung wirkungslos | `suite#76` |
| Router im Weg ergab eine falsche Mischer-Eingangsnummer (B-27) | `cable#675` |
| Mobile umging die Port-Label-Engstelle (B-29) | `cable#675` |
| Lagerbestand über Lagerpositionen nicht summiert | `cable#676` |
| Kommissionier-Liste verschwieg die Fehlmenge | `cable#676` |
| Plan-PDF stand in keinem Dokument-Register | `cable#676` |
| Netz-Budget zählte Link-Kapazität als Last | `cable#676` |
| Zwei WON'T-Zeilen widersprachen ausgeliefertem Code | `suite#77` |
| Vendoring cable#673-#676, vom Guard angeleitet | `suite#78` |
| Übergabe-Stempel deckte nur die halbe Seite (B-32) | `cable#677` |
| Umsortierung löschte den Port-Herkunftsbeleg (B-33) | `cable#677` |
| Geräte in Reparatur zählten als gedeckt (B-30) | `cable#677` |
| Rack-Inhalte fehlten in der Stückliste (B-31, Rack-Hälfte) | `cable#677` |
| `drumKit`/`wirelessRig` fehlten in der Stückliste (B-31, Rest) | `cable#678` |
| Arbeitsweise-Direktive in `cable-planner/CLAUDE.md` | `cable#678` |
| `READS_DEVICE` traf nur Lese-Verben, `TOUCHES_PLAN` zu eng | `cable#679` |
| Dreizehn wirkungslose Tabs entfernt (B-16, E-9) | `suite#100` |
| Ebenen-Schalter der Bibliothek erreichten im Paket nichts | `suite#100` |
| Umfang stand dreimal auf einem Bildschirm | `suite#100` |
| Statusleiste nannte auf jedem Nicht-Canvas-Modul „Uebersicht" | `suite#100` |
| Rail: neun Eintraege flach, „Kameras" neben „Kamera" | `suite#100` |
| Vier Laufzeit-Anwendungen als Module verdrahtet (B-35, E-19) | `suite#99` |
| Tally-Karte geht aus dem Plan an den Pi statt in eine Datei (B-41) | `suite#99` |
| Leere Tally-Sendung haette die Geraeteliste des Pi geleert | `suite#99` |
| Projekt-Fluss Shell -> Planer -> Shell (B-20, verbindende Haelfte) | `suite#98` |
| Erststart-Dialog des Cable-Planers lag ueber dem eingebetteten Plan | `suite#98` |
| Shell-Panels verdeckten den Planer (doppelte Liste + Inspector) | `suite#98` |
| Smoke-Test war gruen, waehrend jeder Planer leer blieb | `suite#98` |
| Pruefung 18 behauptete AI-Vorschlag als einzige Port-Quelle | `cable#700` |
| ADR-004 Inkrement 4: vier Licht-Ausdrucke tragen ihren Stand | `light#70` |
| ADR-004 Inkrement 4: Kamerakarte und Storyboard tragen ihren Stand | `multicam#91` |
| B-41.1: Kamera-Plan gegen die Kameras am Bus, mit Beleg je Zuordnung | `sony-camera-bridge#14` |
| B-41.2: `avplan-intercom` wird gelesen, zusammengefuehrt statt ersetzt | `Broadcast-intercom#9` |
| B-41.3: Medien-Station ausgewiesen — Bestand statt Konfigurationsziel | (Befund, kein Code) |
| B-39.3: Projekte als Dateien statt nur `localStorage` | `suite#103` |
| Initiative 8: abgeleiteter Adressplan, mit Beleg je Zeile | `cable#701` |
| ADR-004 Inkrement 3: Dokument-Code auf allen Listen-Ausdrucken | `cable#702` |
| B-39.2: Vorlagen-Begriff — Projekt aus Vorlage, Kundendaten bleiben zurueck | `suite#105` |
| Initiative 9: Ausspielung als Datenobjekt, Stream-Key im Schluesselbund | `cable#703` |
| Bedarf 19: mehrere Netz-Schnittstellen je Geraet (Dante primaer/sekundaer, 2110 rot/blau) | `cable#704` |
| Bedarf 24: erzeugte Switch-Port-Karte statt gepflegter Excel-Mappe | `cable#704` |
| Bedarf 21: Plan gegen Vorgefundenes, Datei statt Live-Feed | `cable#704` |
| `NETWORK_CONNECTORS` fuehrte Steckertypen, die es in `ConnectorType` nicht gibt | `cable#704` |
| Bedarf 22: Rack-Tuer-Blatt und VLAN-Tabelle aus demselben Modell | `cable#705` |
| Bedarf 23: Haus-IT-Anforderungsblatt — abgeleitet vs. Frage, IGMP-Widerspruch benannt | `cable#705` |
| Bedarf 37: eine Kanalliste, fuenf Sichten statt fuenf Abschriften | `cable#706` |
| Bedarf 38: Stage-Plot als Ein-Seiten-Lieferung, Nummer = Kanal | `cable#706` |
| Bedarf 36: Encoder-Machbarkeit — zwei belegte Encoder, „unbeantwortet" als eigener Zustand | `cable#707` |
| Bedarf 33: Ablaufblatt fuer den Showtag, Stream-Key nur als Verweis | `cable#707` |
| Bedarf 15: Container ausgeben statt Artikel, Differenz bei Rueckgabe berichtet | `cable#707` |
| Bedarf 14: PTZ-Presets als Dokument, Standort beim Speichern mitgeschrieben | `multicam#92` |
| Bedarf 12: Sichtlinien-Konflikte dreidimensional, nicht als 2D-Schnitt | `multicam#92` |
| Bedarf 13: geschaetzte Laengen tragen ihre Herkunft, ein Strang traegt fuenf Dienste | `cable#708` |
| Bedarf 16: Etiketten-Codes auf dem Ausgabeschein, Scan-Rueckweg | `cable#709` |
| Bedarf 17: Kabel und Adapter in derselben Bedarfsliste | `cable#709` |
| Bedarf 26: die vergessenen Blaetter in der Impact-Liste, benannt statt weggelassen | `cable#709` |
| Bedarf 27: „gilt dieses Blatt noch?" — war gebaut, jetzt erreichbar | `cable#709` |
| Bedarf 28: Plan gegen ERP-Reservierung, in beide Richtungen | `cable#709` |
| Bedarf 32: der Ausspielweg als Signalfluss — Quelle, Encoder, Transport, Ziel | `cable#710` |
| Bedarf 29: kein stiller Verlust beim CSV-Import — was faellt, hat einen Namen | `cable#711` |
| Bedarf 3: Companion-Tasten aus dem Plan statt 52-mal im Jahr abgetippt | `Broadcast-intercom#10` |
| Bedarf 1 (2. Inkrement): der geteilte Plan nennt seinen Stand | `cable#712` |
| Bedarf 65: jede Mengen-Operation sagt, was sie ausgelassen hat | `cable#713` |
| Bedarf 69: Wake-Lock beim Scannen, kein Formular-Absenden | `cable#714` |
| Bedarf 80: „Bestand" ist nicht „verfuegbar" — offene Ausgaben zaehlen | `cable#715` |
| Bedarfe 67 + 82: Herkunft und Rueckgabedatum bis aufs Blatt | `cable#716` · `multicam-planner#93` · `light-planner#71` |
| Bedarf 68: Schaden mit Zuordnung, aus dem Ausgabe-Beleg abgeleitet | `cable#717` |
| Bedarf 66: Inventur mit „am falschen Ort" als eigenem Ergebnis | `cable#718` |
| Bedarf 64: die Kommissionier-Liste nennt den Grund der Fehlmenge | `cable#719` |
| Bedarf 76: die Suche findet Adressen und antwortet, statt nur zu springen | `cable#720` |
| Bedarf 85 (2. Haelfte): die Antwort des Hauses steht neben der Frage | `cable#720` |
| Bedarf 70: Etiketten mit lesbarem Code, acht Geometrien, Tippen als Hauptweg | frueher gebaut, 2026-09-06 nachgewiesen |
| Bedarf 73: PTP im Modell, der Domaenen-Widerspruch benannt | `cable#721` |
| Bedarf 77: das Netz-Merkblatt fuer die Crew, als Dokument mit Stand | `cable#721` |
| Bedarf 95: EIN Spektrum-Plan — vorher rechnete der Planer Intermodulation zweimal auf je der halben Senderliste | `cable#721` |
| Bedarf 96: ein Preset darf nie still ueberschreiben (Schlagzeug-Technik) | `cable#721` |
| Bedarf 86: die Tally-Seite luegt nicht, wenn sie die Verbindung verliert | `tally-pi#10` |
| Bedarf 90: die Archiv-Aufzeichnung haengt nicht am selben Encoder wie der Upload | `cable#722` |
| Bedarf 72: EIN Multicast-Adressplan — Adresse+Port eindeutig, und der 32-zu-1-L2-Alias benannt | `cable#723` |
| Bedarf 89: das Sicherheitsnetz einmal erklaert, mit Namensabgleich gegen die Szenen des Encoders | `cable#724` |
| Bedarf 91: eine Vorlage weiss, aus welchem Haus sie kommt — und was NICHT mitgeht | `cable#725` |
| Bedarf 78: welche Kiste den Plan-Platz fuellt — der Tausch am Ladetag wird sichtbar | `cable#726` |
| Bedarf 84: woraus naechstes Jahr geplant wird — Bauzustand oder Angebot, und es steht drauf | `cable#727` |
| Bedarf 71: Arbeits-Notizen aus der Probe — mehrfach, ortsgebunden, und sie bleiben im eigenen Projekt | `light#72` |
| Kundenname im vendorten `miscCatalog.ts`, upstream laengst anonymisiert | `suite#104` |
| Drei Stempel-Kopien nur per Ankerwert gesichert; Verhaltens-Guard fehlte | `suite#101` |
| Inline-Typ-Import liess einen Test als Suite-Abweichung dastehen | `cable#680` |
| `mvr:check` lief bei keinem Merge; berechneter Guard dagegen | `light#64` |
| Vendoring cable#677-#680 + light#64 | `suite#80` |
| Guard meldete fehlenden Workflow als ENOENT statt als Befund | `light#65` |
| `powerWatts`/`weightKg`-Typ-Doku nannte erfundene Konsumenten (B-15, Doku-Teil) | `cable#681` |
| Rolle besitzt Mischer-/Router-Labels (B-28) | `cable#682` |
| Topbar/Statusleiste/Bibliothek/Versionen gewickelt (B-13) | `light#66` |
| Gerenderte Oberfläche vollständig gewickelt + Sprachschalter (B-13) | `light#67` |
