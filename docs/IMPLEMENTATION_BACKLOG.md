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

* **Status:** ~~offen~~ **erledigt 2026-09-09** — alle drei Schritte liegen vor: `cable#791` (Schritt 2 und 3: Tastenbelegung im Modell, Export darf sie schreiben) und `cable#792` (Schritt 1: der Slot). **Entschieden war (E-2, 2026-09-08, vom Eigentümer): eigener `.avplan`-Slot für Intercom; Vokabel bleibt das neutrale Format aus B-8.** Der Slot trägt nur, was der Plan nicht hergibt (Kanäle, Key-Gruppen, Beschriftung, Talk/Listen-Matrix); alles Übrige steht darin als Verweis über die Objekt-Id
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
* **Nachgemessen 2026-09-08, bevor gebaut wurde — und der Befund verschiebt
  den Zuschnitt.** Die Zeile oben sagte „was bleibt, ist Bauarbeit". Das
  stimmt für drei der vier Dinge, die der Slot tragen soll, und für das vierte
  nicht.

  * **Kanalzuordnung, Beschriftung, Talk/Listen-Matrix** stehen fertig in
    `types/intercomExchange.ts` (B-8): `IntercomChannel`, `IntercomStation`
    mit `shortName` und `equipmentId`, `IntercomMembership {channelId, talk,
    listen}`. Das ist die Vokabel, die der Slot braucht — sie muss nur aus der
    *Austauschdatei* (mit `format`, `version`, `exportedAt`) in einen
    *Projekt-Slot* getrennt werden. Ein Projekt trägt keinen Format-Marker.
  * **Die Key-Gruppen waren der Haken.** Sie existierten in KEINEM Modell:
    `GreenGoUser` führte `groupIds` — eine ungeordnete MENGE —, und
    `exportGreengo.ts` sagte in seinem eigenen Kommentar, warum das so ist:
    „Der Plan kennt die Tastenpositionen gar nicht." Die Positionen lebten
    ausschliesslich im importierten Roh-Preset und wurden von
    `mergeButtonFunctions` geschützt: „Positionen kommen aus dem Preset und
    werden nie neu vergeben." **Erledigt mit `cable#791`** — siehe Schritt 2
    und 3 unten.

* **Damit ist die erste Frage von E-2 nicht Bauarbeit, sondern eine
  Umkehrung.** Wenn der Slot die Tastenbelegung führt, ist der Plan ab dann
  ihr Eigentümer — und `mergeButtonFunctions` verkörpert heute die
  entgegengesetzte Entscheidung, aus einem benannten Grund: ein Export, der
  Positionen aus der Array-Reihenfolge neu erfand, war der letzte
  Datenverlust im Editor-Weg, und er „fällt nicht am Bildschirm auf, sondern
  in der Probe". Wer den Slot einführt, ohne diese Merge-Regel mitzudrehen,
  baut den Verlust wieder ein.
* **Zuschnitt, der daraus folgt** (drei Schritte — alle drei erledigt):
  1. ~~Den Slot anlegen~~ **erledigt 2026-09-09 (`cable#792`).**
     `types/intercomPlan.ts` als Projekt-Slot: Kanäle, Sprechstellen,
     Talk/Listen getrennt, Tastenbelegung neutral als
     `IntercomKey {page, button, channelId}`. Kein `format`, kein `version`,
     kein `exportedAt` — ein Projekt trägt keinen Format-Marker über einen
     seiner Slots. Die Anlagen-Nummern liegen **deklariert** im
     `vendor`-Block (ADR-002), damit dieselbe Anlage nach dem Öffnen nicht
     andere Nummern trägt als vorher; die Austauschdatei vergibt sie
     erklärtermassen neu, und genau deshalb gibt es zwei Übersetzungspaare
     und nicht eines. `healProjectPositions` stellt alte Projekte beim
     **Laden** um und entfernt `greengoConfig`, statt es danebenstehen zu
     lassen.
  2. ~~Die Tastenbelegung ins Modell heben~~ **erledigt 2026-09-09
     (`cable#791`).** `GreenGoKey {page, button, groupId}` und
     `GreenGoUser.keys`; der Import liest `ButtonFunctions` jetzt IMMER statt
     nur im Rückfall, über ALLE Seiten und mit Position. `groupIds` bleibt
     daneben stehen, weil eine Zugehörigkeit ohne Taste ein realer Zustand
     ist („Karte voll"), und ist jetzt die Vereinigung aus Mitgliederliste und
     Tastenbelegung — womit „jede Gruppe auf einer Taste steht in `groupIds`"
     von selbst gilt statt gehofft zu werden.
  3. ~~`mergeButtonFunctions` umdrehen~~ **erledigt im selben PR.** Die Regel
     nimmt `planKenntPositionen`: kennt der Plan die Karte, ist seine Karte
     die Karte — über alle Seiten; kennt er sie nicht (Projekt von vor E-2),
     gilt die alte Regel unverändert. Der Kommentar, der die
     Gegenentscheidung begründete, ist mitgedreht. Was der Import nie als
     Gruppe lesen konnte (`'--'`, Objekte, eine Sonderfunktion späterer
     Firmware), bleibt Wert für Wert stehen — der Teil von ADR-005 Regel 2,
     der weiter gilt.
* **Die Warnung von 2026-09-08 wurde eingehalten — sie bleibt hier stehen,
  weil sie erklärt, warum die Reihenfolge so war.** Sie lautete: Schritt 1
  ohne 2 und 3 auszuliefern. Dann stünde die Zugehörigkeit an zwei Orten — im
  Slot und in `greengoConfig` — und die Tastenbelegung an einem dritten (dem
  Roh-Preset). Gebaut wurde deshalb 2 und 3 zuerst (`cable#791`), und
  Schritt 1 hat danach beides vorgefunden: die Tastenbelegung als eine
  Angabe, und `greengoConfig` wird beim Laden entfernt statt danebengelegt.
* **Die eigentliche Grösse war, wie angekündigt, die Projektion:**
  `greengoConfig` hing an zehn Stellen im Renderer. Die Nachschlage auf dem
  Canvas liest jetzt den Slot **direkt** statt über die Projektion — sie
  läuft je Gerät und Render, und ein Selektor mit neuer Identität je Aufruf
  ist die Defektform, die `MobileShareDialog` und `EquipmentNode` in ihren
  eigenen Kommentaren beschreiben. Dialog, Preset-Bibliothek und
  Beltpack-Leiste projizieren einmal je Slot-Änderung.
* **Was dabei offen geblieben ist** (eigener Punkt, zwei Repos): die
  Austauschdatei `avplan-intercom` trägt in Format-Version 1 **keine**
  Tastenbelegung. Sie zu ergänzen heisst `INTERCOM_FORMAT_VERSION` auf 2 zu
  heben UND `INTERCOM_PLAN_VERSION` in `Broadcast-intercom/packages/shared`
  mit — dessen Leser lehnt eine zu neue Datei ab, statt sie halb zu lesen
  (und das ist dort richtig). Bis dahin sagt der Kopf von
  `lib/intercomPlan.ts`, dass die Datei diesen Teil nicht trägt, statt es zu
  verschweigen (ADR-005).

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

* **Status:** **erledigt 2026-09-08** — `suite#187`. Entschieden (E-12): eigene
  Shell-Domäne; der Planer-Handler entfällt.
* **Gebaut:** `apps/shell/electron/lexware.cjs` als eigene Domäne im
  Hauptprozess, `__suiteLexware` in der Preload-Brücke — **an keine
  Betriebsart gebunden**, wie `__suiteTally` und `__suiteProjectFiles`. Genau
  daran war der alte Weg gescheitert: er hing an „eingebettet" und war deshalb
  im ausgelieferten Standard-Build tot.
* **Die alte Bus-Route ist ENTFERNT, nicht stillgelegt.** `requestLexware`,
  `connectShellLexware` und die beiden Nachrichten-Typen sind aus
  `packages/ui/src/embed.ts` und aus dem Export von `@avplan/ui` verschwunden,
  ebenso `shellLexware.ts` im Planer. Ein Bus-Weg, den niemand fährt, ist
  einer, den jemand später wieder befährt — und dann steht er vor denselben
  zwei Bedingungen.
* **Und der zweite Weg gleich mit:** `cableHost.cjs` registrierte Cables
  `lexwareIpc` im nativen Modus. Das ist raus — sonst gäbe es zwei Wege zu
  derselben API, und der Nutzer hätte je nach Fenster einen anderen unter
  denselben Knöpfen.
* **Der Schlüssel:** genau EIN Eintrag im Schlüsselbund, und er behält seinen
  historischen Namen (`cable-planner` / `lexware-api-key`). Ihn umzubenennen,
  weil die Domäne umgezogen ist, liesse jeden schon hinterlegten Schlüssel
  unauffindbar zurück — die Anwendung meldete „kein Key hinterlegt", ohne zu
  sagen, dass sie nur woanders sucht. Zwei Einträge beantworteten dieselbe
  Frage verschieden. Herausgegeben wird nur die TATSACHE, nie der Wert, auch
  nicht gekürzt.
* **Drei Zustände, nicht zwei:** hinterlegt, nicht hinterlegt, und „konnte
  nicht nachsehen" (kein Schlüsselbund erreichbar). Den dritten als „nicht
  hinterlegt" zu zeigen hiesse, dem Nutzer zu sagen, sein Schlüssel sei weg.
* **Der Dialog nennt jetzt die richtige Abhilfe.** Vorher gab es eine einzige
  Meldung („Signal-Planer öffnen, um zu senden") — die Anleitung zu einem Weg,
  den es nicht gab. Jetzt sind es zwei getrennte Auskünfte, weil sie zwei
  verschiedene Abhilfen haben: fehlende Desktop-Brücke gegen fehlenden
  Schlüssel.
* **Neu erreichbar:** der Schlüssel lässt sich in den Shell-Einstellungen
  eintragen, prüfen und entfernen. Vorher ging das nur in den Einstellungen des
  Cable-Planers — und der Beleg-Weg lief danach trotzdem nicht.
* **Sieben Gegenproben, alle rot** (`apps/shell/test/lexwareShellDomaene.test.ts`).
* **Damit ist Bedarf 99 nicht mehr blockiert** — Mahnketten hängen an dieser
  Domäne, und sie steht jetzt.
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

* **Status:** **ERLEDIGT** (2026-09-08). Gebaut an beiden Fundstellen — `light#97` und `multicam#111` —, die Wächter nachgeschärft in `light#98` und `multicam#112`, in die Suite vendoriert. Entschieden war E-15: Vorschau-Schritt wie beim Ablauf-Import; der Drei-Wege-Dialog und das Undo für den Lager-Store sind damit erledigt, nicht aufgeschoben. Das Zwischenmaß aus `suite#154` (Escape und Hintergrund-Klick führen nicht mehr zusammen) ist abgelöst und samt seiner fünf i18n-Schlüssel entfernt — es war genau dafür angekündigt.
* **Was gebaut wurde:** `src/inventory/importPreview.ts` in beiden Apps, zeichengleich bis auf die Semikolons — so wie `merge.ts` es schon ist. Es rechnet je Sorte (Artikel, Lagerorte, Sets, Einheiten) und je Modus mit **derselben** `mergeDefined`, die der Import danach benutzt. Eine Vorschau, die anders rechnet als der Import, ist schlimmer als keine: sie sieht nach Prüfung aus und ist eine zweite Meinung. Der Dialog zeigt Zahlen je Sorte, schreibt die Zahl der wegfallenden Datensätze aus und hat **drei Ausgänge statt zwei**; Vorbelegung ist `merge`, die harmlose der beiden Antworten.
* **Nicht im Entwurf vorgesehen, vom Wächter gefunden:** die Kategorie `unberuehrt`. Dieselben Datensätze, die `replace` löscht, bleiben bei `merge` stehen — genau darin besteht der Unterschied zwischen den beiden Antworten, und er war sonst nirgends abzulesen. Aufgefallen ist sie an der Rückrichtung der Prüfung (jede Id, die vorher oder nachher existiert, muss in der Vorschau vorkommen); ohne sie hatte die Vorschau eine stille dritte Sorte, und „steht in keiner Liste" ist keine Auskunft, die jemand richtig raten kann.
* **Drei Wächter-Befunde, alle in `light#98`/`multicam#112` behoben:** die Prüfung las Beschriftungen statt Handler und wurde in der i18n-Kopie an einer *richtigen* Änderung rot; `setPending(null)` war unverdient, weil dieselbe Anweisung in `doImportConfirm` steht; und der EN-Wörterbuch-Pfad zeigte auf `src/i18n/index.ts`, während die Suite-Kopie auf `src/i18n/en/*.ts` aufteilt — ein mitvendorierter Wächter, der in der Kopie an einer richtigen Struktur scheitert, wird dort gelöscht statt gelesen.
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

* **Status:** offen — **entschieden (E-20, 2026-09-08): Englisch bleibt Quellsprache.**
  **Deklariert am 2026-09-08 (`multicam#113`):** `package.json` trägt
  `avplan.sourceLanguage: "en"`, die README sagt dasselbe, `npm run lang:check`
  prüft die Übereinstimmung und steht in `ci.yml`. **Offen bleibt der Rückweg
  selbst** — upstream gibt es weiterhin keine i18n. Der Lauf sagt das ausdrücklich
  („Gemessen wurde NICHTS") statt „bestanden" zu melden, und er schaltet sich
  selbst scharf: sobald der erste `t('key', 'Fallback')` in `src/` steht, misst er
  und fällt bei jeder deutschen Zeile.
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

* **Status:** offen — **entschieden (E-17, 2026-09-08): Englisch ist die Quellsprache.**
  **Deklariert und GEDECKELT am 2026-09-08 (`sony#21`):** `package.json` und die
  README nennen `en`, `npm run lang:check` prüft die Übereinstimmung — und misst
  zusätzlich den Sprachmix: **19 mehrwortige deutsche Literale** in
  `packages/web-rcp/src`, namentlich aufgelistet, als GRENZE festgehalten. Sie
  behauptet nicht, das Produkt sei einsprachig; sie sorgt dafür, dass der Mix
  während dieses offenen Punktes nicht WÄCHST. Sie ist in beide Richtungen
  scharf: wer übersetzt und die Grenze nicht heruntersetzt, fällt ebenfalls
  durch — sonst deckte sie ab morgen wieder Zuwachs.
* **Offen bleibt die Übersetzung selbst.** Die 19 Stellen zu drehen ändert
  sichtbaren Produkttext an fünfzehn Stellen und gehört in eine eigene Änderung
  mit eigenem Blick darauf, nicht in den Anhang eines Wächters.
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

### B-42 · „Wo kommt was an?" — Prüfbild, Erwartung, Rückmeldung

* **Status: ERLEDIGT.** Alle Inkremente gebaut — 1 in `cable#772`, 2 in `cable#773`, 2b in `cable#776`, 3 in `cable#774` (und der Schalt-Weg auf alle Hersteller erweitert in `cable#775`, siehe B-43). Der Schaltbild-Teil aus `cable#771` (Strom) ist ebenfalls gebaut und vendoriert. Was offen bleibt, ist ausdrücklich kein Rest dieses Bedarfs, sondern eine Grenze der Anlage: der ATEM kennt bis heute keinen Schnitt-Befehl (`atem:*` kann Namen, Multiviewer und Audio), und ein Live-Videobild im Plan kommt nicht — dafür fehlt nicht die Zeit, sondern der Eingang.
* **Der Wunsch (Eigentümer, 2026-09-08):** „Kann man auch als Quelle
  Testpattern generieren mit dem Namen der Quelle und ner SMPTE bar und dann
  an Displays nen Mini Monitor Feld einfügen, sodass man auch den
  Videomischer und Router quasi in den Plan benutzen und steuern kann, um zu
  sehen wo was ankommt?"
* **Der Befund, der die Bauform bestimmt:** die App hat **keinen
  Videoeingang**. Sie kann kein Bild sehen — nicht vom Mischer (der
  Multiviewer ist ein Videoausgang, kein Datenstrom), nicht vom Router (ein
  Videohub meldet Kreuzpunkte und sonst nichts). Ein Mini-Monitor, der so
  täte, wäre die teuerste Sorte Falschaussage: man erkennt Farbbalken, hält
  sie für eine Rückmeldung und hat in Wahrheit den Plan zweimal gelesen.
* **Warum der NAME auf dem Bild der eigentliche Inhalt ist:** Farbbalken
  allein beantworten nichts — zwei vertauschte Kreuzpunkte sehen mit Balken
  auf beiden Wegen völlig richtig aus. Erst der Name macht daraus einen
  Befund.
* **Inkrement 1 — gebaut:** `lib/testPattern.ts` (Bild mit Namen, Zusatzzeile
  und ADR-004-Stempel), `lib/patternRouting.ts` („wo müsste es ankommen",
  gerechnet mit **derselben** `signalChains`-Traversierung wie Patchliste und
  Mehr-Ebenen-Ansicht), das Erwartungsfeld auf der Geräte-Karte mit
  Pflicht-Beschriftung, der Streifen in der Werkzeugleiste, Export von Bild
  und Prüfblatt. Die gewählte Quelle liegt im nicht persistierten
  `patternStore`. **Invariante 16** hält die Regel fest.
* **Inkrement 2 — die Rückmeldung (gebaut, `cable#773`).** „Stimmt" /
  „falsches Bild, es steht X drauf" / „kein Bild" / „kein Monitor", je
  Ankunftsort, mit Zeitpunkt und Prüfer. Das ist eine **Beobachtung** und
  liegt damit im Projekt (wie `TallyCheck`), anders als die Wahl der Quelle.
  `lib/patternDiagnose.ts` verdichtet die Meldungen zum Befund — allen voran
  `vertauscht`, wenn zwei Ankunftsorte wechselseitig den Namen des jeweils
  anderen zeigen. **Der Gewinn liegt in der zweiten Antwort:** wer „es steht
  KAMERA 3 drauf" meldet, hat die Vertauschung benannt, und der Plan sagt,
  welcher Kreuzpunkt sie erklärt. Der Weg über die Mobile-Ansicht (`/checks`,
  token-gesichert) ist damit vorbereitet, aber noch nicht verdrahtet — das
  ist Inkrement 2b und steht unten.
* **Inkrement 3 — steuern (gebaut, `cable#774`).** Aus dem Plan heraus die
  Kreuzpunkte setzen, über die ein Prüfbild-Weg läuft. Was gebaut wurde und
  warum genau so:
  * **`lib/videohubCrosspoint.ts` baut den Befehl, und zwar NEU statt über
    den vorhandenen `buildVideohubRoutingCommand`.** Das ist der Kern dieses
    Inkrements. Der alte Bauer schreibt eine Zeile für **jeden** Ausgang und
    setzt jeden fehlenden Eintrag auf Eingang 0. Für den vollständigen Export
    ist das richtig — für „schalte Ausgang 7" hiesse es, 39 weitere Ausgänge
    mitzunehmen und alles Unerwähnte schwarzzuschalten, darunter womöglich
    den, auf dem gerade gesendet wird. Der neue Bauer hat deshalb **kein
    `totalOutputs` und keinen Default**: ein Ausgang, über den niemand etwas
    gesagt hat, kommt im Block nicht vor. `tests/hubSwitch.test.ts` hält das
    als Zusicherung fest — mitsamt der Gegenprobe, die belegt, dass der alte
    Bauer genau das täte.
  * **Die Kreuzpunkte werden abgelesen, nicht gesucht.** `signalChains` folgt
    an einer Kreuzschiene ohnehin dem geplanten Kreuzpunkt; das Paar
    (Eingang, Ausgang) steht damit schon in zwei aufeinanderfolgenden
    Schritten der Kette. Es ein zweites Mal aus `videohubRouting.planned` zu
    rechnen wäre die Defektform `zwei-rechnungen`.
  * **Die Bestätigung mit Klartext** steht wie geplant: je Kreuzpunkt ein
    Satz mit Namen und Nummern („Ausgang 3 (Regie links) von Kamera 2 auf
    Eingang 1 (Kamera 1)"), dazu der **wortwörtlich gesendete Text** im
    Dialog und ein Haken, der gesetzt sein muss. Wo der Ist-Zustand nicht
    gelesen wurde, steht dort „vom aktuellen Stand (ungelesen)" und **kein
    aus dem Plan erfundener Vorher-Wert** — der sähe aus wie eine Messung.
  * **Der Eintrag geht NICHT ins Dokument-Register**, anders als diese Zeile
    es bis zum Bau vorsah. Nachgesehen: `documentLog:*` führt, welches
    BLATT mit welchem Planstand ausgegeben wurde, und jeder Eintrag trägt
    einen `stand`, an dem hängt, ob er noch gilt. Ein Kreuzpunkt-Befehl ist
    kein ausgegebenes Dokument; ihn dort einzutragen hiesse, das Register mit
    einer zweiten Bedeutung zu belegen, und die Frage „welches meiner
    ausgeteilten Blätter ist hin?" bekäme Antworten, die keine Blätter sind.
    Stattdessen: `project.hubSwitches` — ein Beleg wie `TallyCheck` und
    `PatternCheck`, angehängt und nie ersetzt, **samt der gescheiterten
    Versuche**, weil „wer hat geschaltet?" auch die beantwortet.
  * **ADR-001 hält:** `videohubRouting.planned` wird beim Schalten nicht
    nachgezogen, auch nicht „zur Sicherheit". Zöge das Senden den Plan mit,
    gäbe es hinterher keine Abweichung mehr zu sehen — und die zu sehen ist
    der Grund, warum der Plan neben der Anlage steht. Der Wächter dafür ist
    eine **negative** Zusicherung über den Dialog (kein `updateEquipment`,
    kein `videohubRouting`, kein `planned`), und die ist per Quelltext
    haltbar: einen Aufruf, den es nicht gibt, kann kein eingeschleustes
    `return` verstecken.
* **Was die Gegenproben gekostet haben, und warum sie dazugehören.** Von neun
  eingeschleusten Fehlern machten sieben den passenden Wächter sofort rot.
  Zwei nicht — und beide waren echte Lücken: einer war ein Fehler in der
  Gegenprobe selbst (die eingefügte Zeile traf die Einrückung nicht), der
  andere eine Zusicherung, die etwas anderes prüfte als behauptet. Der Test
  „ein Anschluss, den es nicht mehr gibt, ergibt keine geratene Nummer" deckte
  in Wahrheit den Fall „die Kette endet hier"; die Nummern-Prüfung selbst ist
  über `patternRouting` gar nicht erreichbar, weil `forwardFrom` einen
  Weiterweg nur über vorhandene Anschlüsse findet. Sie steht trotzdem im Code
  — die Folge ihres Wegfalls wäre eine geratene Nummer, die als Befehl an eine
  laufende Anlage ginge — und wird jetzt **direkt** geprüft. Das ist die Regel
  dahinter: eine Zusicherung, die kein Gegenversuch rot machen kann, ist keine.
* **Inkrement 2b — die Rückmeldung vom Telefon (gebaut, `cable#776`).** Der
  Techniker steht vor dem Monitor, nicht vor dem Rechner. Bisher konnte er nur
  am Canvas melden — also erst hinterher, aus dem Gedächtnis, und genau dabei
  geht die eine Angabe verloren, auf die es ankommt: WELCHER Name auf dem
  falschen Bild stand.
  * **Ein eigener Rückweg, nicht `/checks`.** Der dort geschickte `CheckState`
    ist ein *vollständiger Zustand* und ersetzt den vorigen — richtig für
    Häkchen an Ports, falsch für eine Beobachtung. Eine Sichtprüfung wird
    ANGEHÄNGT; ein Ersetzen löschte „gestern ging es, heute nicht". Also
    `POST /pattern-checks`, an derselben Engstelle wie die drei anderen
    Schreibwege (Token, Schreibmodus, Show-Abgleich).
  * **Die Rechnung bleibt an einer Stelle.** Das Telefon bekommt die fertige
    Liste über `GET /pattern.json`, gebaut im Renderer aus `patternRouting`.
    Eine zweite Traversierung auf dem Gerät liefe bei der ersten Kreuzschiene
    ohne gesetzten Kreuzpunkt auseinander — und dann stünde am Telefon ein
    Ankunftsort, den der Plan am Rechner nicht kennt. Wer davor steht, sucht
    dann einen Fehler in der Anlage, den es nicht gibt.
  * **Kein Zeitstempel vom Telefon.** Dessen Uhr kann beliebig falsch gehen;
    der Renderer stempelt beim Empfang. Ein Beleg mit erfundener Uhrzeit ist
    schlimmer als einer mit der Empfangszeit — während eines Rundgangs ist der
    Unterschied Sekunden.
  * **Invariante 16 gilt auch auf dem kleinen Schirm.** Über der Liste steht,
    dass es der PLAN ist und dass diese App kein Bild sieht; je Ankunftsort
    steht „Laut Plan müsste hier stehen". Das Feld heisst `erwartung` und
    nicht `bild` — ein Telefon, das eine Erwartung wie eine Rückmeldung
    darstellt, ist die gefährlichste Sorte Anzeige.
  * **Die offenen Wege fahren mit**, mit ihrem Grund, und ein „503 statt leer",
    wenn am Rechner keine Quelle gewählt ist: „keine Quelle gewählt" und
    „nirgends erwartet" sind verschiedene Aussagen.
  * Im Nur-Lesen-Modus **sagt** die Seite das, statt die Knöpfe wegzulassen —
    dieselbe Regel wie bei Bedarf 109 auf der Patchliste.
* **Was ausdrücklich NICHT kommt:** ein Live-Videobild im Plan. Dafür fehlt
  nicht die Zeit, sondern der Eingang.

---

### B-43 · Mischer und Kreuzschienen wirklich schalten — alle, nicht nur die zwei

* **Status:** S-1 und S-2 gebaut (`cable#775`), S-3 gebaut (`cable#776`).
  Herstellereigene Treiber über die zwei hinaus sind offen und stehen unten
  mit der Bedingung, unter der sie gebaut werden.
* **Der Auftrag (Eigentümer, 2026-09-08):** „Man braucht ja auch keinen
  Eingang. Man kann ja Kameras und andere Geräte die ein Signal erstellen als
  Quelle benutzen. Aber die Videomischer-Schaltung und so muss trotzdem das
  Signal korrekt weiterleiten. Erstmal beim Atem integrieren, dann aber auch
  bei allen am Markt üblichen Mischern und Kreuzschienen. Funktionsfähig
  machen."
* **Der Befund, der die erste Hälfte bestimmt:** im Plan leitete bis dahin
  **nur ein Videohub** weiter, über eine Tabelle Ausgangs-*Index* auf
  Eingangs-*Index*. Ein Mischer schaltet dieselbe Sorte Kreuzpunkt, aber seine
  Nummern sind andere — beim ATEM ist der Programm-Bus kein Ausgangs-Index,
  sondern ein Mix-Effect. Der Weg „Kamera → Mischer → Aux → Monitor" existierte
  deshalb im Plan gar nicht.

**S-1 — der Mischer leitet weiter (gebaut).** `plannedCrosspoints[outputPortId]
= inputPortId`, herstellerneutral, ausgewertet an **einer** Stelle
(`lib/deviceCrosspoints.ts`) zusammen mit der alten Index-Tabelle. Die
ausdrückliche Angabe gewinnt je *Ausgang*, nicht je Gerät. Ein Mischer ohne
Eintrag bleibt das Ziel — geraten wird nichts, denn ein aus dem Namen
abgeleitetes „Programm liegt auf Eingang 1" ergäbe einen vollständigen Weg zu
einem Monitor, an dem etwas anderes steht.

**S-2 — der ATEM (gebaut).** Drei Schichten: der Plan kennt Anschlüsse,
`lib/controlActions.ts` übersetzt sie in Protokoll-Adressen, ein Treiber je
Protokoll spricht. Beim Videohub *ist* die Position die Nummer (so legt es das
Protokoll fest), beim ATEM nicht — dort steht sie am Anschluss, und fehlt sie,
wird nicht gesendet. Das Protokoll selbst wird **deklariert, nie erkannt**
(ADR-002).

**S-3 — alle übrigen, und warum NICHT ein Treiber je Hersteller (gebaut).**
Der naheliegende Weg wäre gewesen, Ross, Panasonic, Roland, Sony, Evertz,
Grass Valley einzeln nachzubauen. Er wurde aus einem Grund nicht genommen, der
schwerer wiegt als Aufwand: **die verbindliche Beschreibung dieser Protokolle
liegt im Handbuch des jeweiligen Geräts.** Beim Nachsehen war die Quellenlage
eindeutig: die Hersteller-Dokumentationsseiten sind aus dieser Umgebung nicht
erreichbar, und die frei zugänglichen Umsetzungen sind Nachbauten, keine
Spezifikationen. In einer davon hängt der Sender an jeden Befehl ein
Semikolon, das im Befehl schon steht — wer sie abschreibt, schreibt den Fehler
mit ab, und der geht dann an eine laufende Anlage (Invariante 17).

Fast alle diese Protokolle sind aber **zeilenorientierter Text über TCP** und
unterscheiden sich in vier Angaben: Form der Zeile, Zeilenanfang, Zeilenende,
Zählweise. Die stehen im Handbuch, das der Nutzer neben dem Gerät liegen hat.
Also trägt er sie ein (`lib/textProtocol.ts`), die App zeigt vor dem Senden den
Text — Steuerzeichen benannt, weil ein unsichtbares STX der Unterschied
zwischen „verstanden" und „keine Antwort" ist — und schickt genau ihn. Damit
ist **jedes textgesteuerte Gerät bedienbar, auch eines, das es noch nicht
gibt**, ohne dass ein Byte erfunden wird.

Mitgeliefert ist genau **eine** Vorlage (Quartz/Evertz), und sie trägt ihre
Herkunft im Klartext: nach einer verbreiteten Umsetzung, **nicht** nach dem
Herstellerdokument, gegen das Handbuch zu prüfen. Eine Vorlage aus dem
Gedächtnis wäre schlimmer als keine — sie sähe aus wie geprüftes Wissen.

**S-4 — Bitfocus Companion, und damit alle Hersteller (gebaut, `cable#777`).**
Der Eigentümer hat am 2026-09-08 nachgefragt: *„Kannst du nicht bitfocus
companion integrieren dafür? Oder direkt die Hersteller Protokolle?"* — und
das war die bessere Idee als beides einzeln.

Companion ist MIT-lizenziert, kostenlos, läuft auf Windows, macOS und Linux
und pflegt rund **fünfhundert Hersteller-Module**, jedes von Leuten, die das
Gerät auf dem Tisch haben. Das schlägt jeden eigenen Nachbau, und es löst
genau das Problem, an dem S-3 hängen blieb: die Protokolle sind hier nicht
belegbar, dort sind sie erprobt.

* **Wie es angebunden ist.** Companions HTTP-API kann Schaltflächen drücken
  und Custom-Variablen setzen — nachgesehen in
  `companion/lib/Service/HttpApi.ts` (main, 2026-09-08): die Routen sind
  `location/:page/:row/:column/press|down|up|rotate-*|step|style`,
  `custom-variable/:name/value`, `variable/:label/:name/value`,
  `surfaces/rescan` und `connections`. **Eine Route „führe Aktion X mit
  diesen Argumenten aus" gibt es nicht** — daher der Umweg, den die
  Companion-Welt selbst benutzt: EINE Schaltfläche, deren Route-Aktion ihre
  Argumente aus zwei Custom-Variablen zieht. Der Plan setzt die beiden und
  drückt. Eine Schaltfläche je Kreuzpunkt wäre bei 40×40 sechzehnhundert
  Schaltflächen.
* **Die Reihenfolge ist die ganze Zusicherung** (Invariante 19). Schlägt eine
  Variable fehl, darf der Druck nicht passieren — sonst schaltet die
  Schaltfläche den *vorigen* Kreuzpunkt, und es sieht aus wie ein gelungener
  Befehl.
* **`GET /api/connections`** listet, was in der Companion des Nutzers
  eingerichtet ist (Label + Modul-Id). Der Dialog zeigt es beim Einrichten,
  damit niemand Modulnamen abtippt. Die notierte Verbindung ist ausdrücklich
  eine **Notiz** und keine Zusicherung: Companion prüft nicht, ob die
  Schaltfläche zu ihr gehört.
* **Standardport 8000**, belegt in `shared-lib/lib/LaunchOptions.ts`
  (`adminPort`, `default: 8000`); `http_api_enabled` steht in
  `companion/lib/Data/UserConfig.ts` auf `true`.
* **Was ausdrücklich NICHT gemacht wurde: Companion-Module einbetten.** Sie
  liegen nicht auf npm, sondern kommen aus Companions eigenem Modul-Store,
  und sie laufen gegen einen Host, den Companion stellt (`@companion-module/
  base`, MIT, npm). Diesen Host nachzubauen hiesse, Aktionen, Feedbacks,
  Variablen, Presets und Upgrade-Skripte samt ihrer Versionierung
  mitzuschleppen — viel Fläche für einen Weg, den drei HTTP-Aufrufe schon
  gehen. Sollte sich das ändern (etwa weil Companion eine Aktions-Route
  bekommt), gehört das hierher.

**Was offen bleibt, und woran es hängt:**

| Gerät | Was fehlt | Was es entblockt |
| --- | --- | --- |
| Ross (Carbonite, Acuity, Ultrix) | eigener Treiber | **Über Companion bedienbar, sofern dort ein Modul für das Gerät eingerichtet ist** — welche Module es gibt, sagt die eigene Companion-Instanz (`GET /api/connections` listet sie im Dialog); von hier aus war die Modul-Liste nicht abrufbar, deshalb steht hier keine Modul-Kennung. Alternativ das erklärte Text-Protokoll. Ein eigener Treiber bräuchte das Handbuch und hätte wenig Mehrwert. |
| Panasonic (AV-HS/AW) | eigener Treiber | dito — über Companion, sofern dort ein Modul dafür eingerichtet ist. |
| Roland (V-Serie) | eigener Treiber | dito. Die frei zugängliche Umsetzung trägt den oben genannten Semikolon-Fehler und taugt nicht als Vorlage. |
| Sony, Grass Valley, Lawo | SW-P-08 bzw. NMOS IS-05 | **Kein** Text-Protokoll: SW-P-08 ist binär, IS-05 ist HTTP/JSON. Über Companion erreichbar, wo dort ein Modul dafür eingerichtet ist; ein eigener Treiber bräuchte eine erreichbare Spezifikation. |
| ATEM: Schnitt und Übergang | nichts — `atem-connection` kann `cut()` und `autoTransition()` | Ein eigener Bedienweg im Plan. Der Kreuzpunkt-Weg braucht sie nicht: er setzt Program/Preview/Aux direkt. |

* **Die Regel, die daraus wurde:** Invariante 17 in `docs/architecture.md` —
  ein Befehl an eine laufende Anlage nennt nur, was er meint; der Nutzer liest
  vorher den Klartext **und** den wortwörtlichen Befehl; jeder Versuch wird als
  Beleg festgehalten, auch der gescheiterte; und der Plan wird dabei nicht
  nachgezogen, weil sonst die Abweichung unsichtbar wird.

### B-44 · Touch, Schliessen, Umbruch — die Bedienung selbst

* **Status:** ALLE DREI TEILE GEBAUT — Schliessen und Touch `cable#780`,
  Umbruch `cable#784`. **Wunsch des Eigentümers, 2026-09-08:** „Die ganze Anwendung ist auch noch nicht touch
  optimiert. Menüs schließen ist auch nicht immer intuitiv. Oft muss man auf
  ein x klicken und nicht auch in eine leere Fläche. Und auch nicht alles ist
  responsive."

* **Befund 1 — Schliessen (GEMESSEN 2026-09-08, cable-planner).** Es gibt
  `components/shared/ModalShell.tsx`, und der kann es: `closeOnBackdrop`
  steht dort auf `true` als Vorgabe, dazu Escape, Focus-Trap und
  Fokus-Rückgabe über `useDialogA11y`. Benutzt wird er von den grossen
  Dialogen aber nicht — **24 Dateien bauen ihr Overlay selbst** (`fixed
  inset-0`), und **sechs davon hatten keinerlei Behandlung des
  Hintergrund-Drucks**: `LibraryPanel` (zwei Unter-Dialoge),
  `CableLibraryPanel`, `CableDialog`, `RackBuilderDialog`,
  `RackImageCropDialog`, `NewRentmanDeviceWizard`.
* **KORREKTUR zur ersten Fassung dieses Eintrags (2026-09-08).** Hier stand
  **15**, und die Zahl war falsch: das Suchmuster verlangte den Bezeichner
  `onClose`, und die Hälfte der Dialoge nennt ihre Schliessfunktion `close`,
  `onCancel` oder `setOpen(false)`. Sie steht hier trotzdem, weil sie beinahe
  zu einem Rasenmäher-Umbau geführt hätte — und weil die Berichtigung den
  Befund erst scharf macht: **die sechs, die wirklich fehlten, sind ausnahmslos
  Dialoge mit Entwurf.** Genau dort ist ein „schliesst einfach" am
  gefährlichsten, und genau deshalb ist der Schutz unten keine Kür.
  Das ist also **kein fehlendes Bauteil, sondern ein nicht benutztes** — und
  damit die billigste Sorte Reparatur, solange man sie nicht mit dem
  Rasenmäher macht.
* **GEBAUT (`cable#780`).** `hooks/useBackdropClose.ts` ist die eine Stelle,
  an der die Regel steht; `ModalShell` gibt seine eigene Fassung der Bedingung
  dafür auf, sonst wären es `zwei-rechnungen`. Die Entscheidung selbst ist
  eine reine Funktion (`backdropEntscheidung`), damit sie ohne
  Render-Umgebung prüfbar ist. Gehorcht wird auf **`mousedown`, nicht
  `click`** — sonst schliesst eine Textmarkierung, die man über den Rand
  hinauszieht, den Dialog. Ergebnis: alle **26 Overlays in 24 Dateien**
  schliessen auf dem Hintergrund, **sieben** fragen vorher, weil sie einen
  Entwurf halten. Der Wächter (`tests/dialogSchliessen.test.ts`) hält **keine
  Zahl** fest, sondern die Frage — trägt das Element mit `fixed inset-0`
  selbst eine Behandlung? Eine Zahl wäre nach dem nächsten neuen Dialog
  falsch, ohne dass jemand es merkt.
* **Und der Grund, warum ein Rasenmäher hier falsch wäre:** ein Dialog, der
  eine begonnene Eingabe hält, darf bei einem Fehlklick daneben NICHT
  zumachen. Wer im `RackBuilderDialog` zwanzig Höheneinheiten bestückt hat
  oder im `NewRentmanDeviceWizard` auf Seite drei steht, verliert sonst
  Arbeit — und das ist schlimmer als ein Kreuz, das man suchen muss. Die
  Regel muss deshalb lauten: **Hintergrund-Klick schliesst, ausser der Dialog
  hält ungesicherte Eingaben; dann fragt er.** Genau das ist zu bauen, nicht
  ein `onClick={onClose}` an fünfzehn Stellen.
* **Befund 2 — Touch.** Keine einzige Stelle im Renderer fragt
  `pointer: coarse` ab; die einzigen Touch-Behandlungen sind
  `CanvasArea.tsx` (Pan/Zoom, `clientX/Y` für Maus ODER Touch) und
  `PanelWindowMenu.tsx` (`touchAction: 'none'`). Alles andere ist auf Maus
  gebaut: Hover-Menüs, Drag-Griffe von wenigen Pixeln, Kontextmenüs auf
  Rechtsklick. **Zu messen, bevor gebaut wird:** wie viele Bedienelemente
  unter der 44-px-Marke liegen und wo eine Funktion NUR über Hover oder
  Rechtsklick erreichbar ist — eine Funktion ohne Touch-Weg ist auf einem
  Tablet nicht vorhanden.
* **GEMESSEN, dann GEBAUT (`cable#780`).** Die Messung fand **drei**
  Bedienreihen, die nur per `group-hover` erschienen (Bibliotheks-Eintrag,
  Rack-Karte, Gruppen-Karte — dort sitzen „Bearbeiten" und „Löschen"), und
  **drei** Funktionen, die ausschliesslich am Rechtsklick hingen
  (Kabel-Wegpunkt, Ebenen-Chip, Seitenverweis-Knoten). **Ersatz: null.** Diese
  sechs Funktionen waren auf einem Tablet nicht schwer erreichbar, sondern
  nicht vorhanden.
  * `.cp-hover-actions` in `index.css` mit `@media (pointer: coarse)` — die
    Regel steht dort, weil die Abfrage genau die Frage beantwortet, um die es
    geht: *kann dieses Gerät überhaupt schweben?* `:focus-within` bleibt,
    sonst entstünde dieselbe Lücke für die Tastatur.
  * `hooks/useLongPress.ts` — der Rechtsklick für Geräte, die keinen haben.
    Auf `pointerdown` statt `touchstart`, weil ein Stift auf einem
    Grafiktablett genau der Fall ist, in dem jemand zeichnet und kein Menü
    bekommt; die Maus ist ausgenommen, sie hat ihren Rechtsklick. **Zwei
    Bedingungen, beide müssen halten:** ≥ 500 ms gedrückt UND dabei < 10 px
    gewandert — auf einem Canvas ist „gedrückt halten" der Anfang von fast
    allem, und ein Menü, das bei jedem begonnenen Zug aufgeht, ist schlimmer
    als keines. Gemessen wird **schräg** (`Math.hypot`), nicht je Achse: 8 und
    8 sind einzeln unter 10, zusammen 11,3.
  * **Die eine Stelle, die es nicht bekommt,** ist der Kabel-Wegpunkt: dort
    sitzt auf demselben `pointerdown` schon das Ziehen, ein langer Druck
    daneben hiesse „wer zögert, hat gelöscht". Sie steht im Wächter als
    benannte Ausnahme, samt einer Zusicherung, die verlangt, dass die Ausnahme
    gestrichen wird, sobald sie gelöst ist — sonst hält der Nächste eine
    erledigte Sache für offen. Der Weg dorthin ist ein sichtbarer kleiner
    Löschgriff auf grobem Zeiger, und der ist **offen**.
  * **Was die 44-px-Marke angeht:** sie ist NICHT gemessen worden. Eine
    Trefferfläche misst man am gerenderten Element, nicht an Klassennamen —
    `px-1 py-0.5` sagt nichts über die Fläche, solange Zeilenhöhe, Icon-Grösse
    und `gap` mitreden. Hier eine Zahl aus dem Quelltext zu erfinden wäre
    schlimmer als keine: sie sähe aus wie eine Messung. Der Weg dafür ist der
    laufende Renderer (`ui:smoke` treibt ihn ohnehin), und er ist offen.
* **Befund 3 — Umbruch (GEMESSEN 2026-09-08, cable-planner/src/renderer).**
  Der Verdacht stimmt, und in einem Punkt ist es schärfer als vermutet:
  * **63 feste `max-w-*`-Breiten — und KEINE EINZIGE Breakpoint-Fassung
    davon.** `sm:max-w-`, `md:max-w-`, `lg:max-w-`, `xl:max-w-` kommen im
    ganzen Renderer **null** mal vor. Keine dieser Breiten ändert sich also
    jemals mit der Fensterbreite; auf einem schmalen Gerät steht der Dialog
    genau so breit da wie auf dem Desktop.
  * **19 Raster mit `grid-cols-3` bis `-9`**, davon **14 in 13 Dateien ohne
    jede Breakpoint-Fassung**. Die übrigen 17 Dateien haben Umbruchpunkte —
    das Werkzeug ist also da und wird nur nicht durchgehend benutzt, was die
    Reparatur billig macht.
  * Die Mobile-Ansicht (`src/mobile/`) ist davon nicht betroffen — sie ist
    eigenständig gebaut.
  * **KORREKTUR zu einer Zwischenzahl.** In der Sitzung standen zuerst „52
    feste Breiten und 18 Raster". Das war ein anderes Muster (es zählte auch
    `max-w-full`/`-none` nicht mit und griff Dateien statt Vorkommen ab). Die
    Zahlen oben sind die nachgezählten; die alte steht hier, damit niemand die
    Differenz für eine Veränderung am Code hält.
* **ZWEITE KORREKTUR, und diesmal an der FRAGE (2026-09-08, beim Bauen).**
  Die Zahl „63 feste `max-w-*` und keine einzige Breakpoint-Fassung" stimmt —
  aber sie **misst die falsche Eigenschaft**, und der Eintrag las sich
  dadurch dramatischer, als er ist.

  In Tailwind bedeutet `max-w-2xl` *„höchstens so breit"*. Zusammen mit
  `w-full` schrumpft das Element auf schmalen Geräten sehr wohl — genau das
  macht `ModalShell` (`flex max-h-[90vh] w-full ${MAX_WIDTH_CLASS[…]}`).
  Ein fehlender Breakpoint ist dort **kein** Fehler.

  Nachgezählt, jetzt an der richtigen Frage — *kann das Element schmaler
  werden?*:
  * **31 der 63** festen `max-w-*` stehen mit `w-full` im selben
    `className` und schrumpfen damit. Für sie war nie etwas zu tun.
  * **21** stehen ohne `w-full`; die sind einzeln anzusehen.
  * **13 Dateien** haben `grid-cols-3` bis `-9` ohne jeden Umbruchpunkt —
    das bleibt, ein mehrspaltiges Raster ohne Breakpoint läuft über.
  * **9 Dateien** enthalten ein `<table>` ohne **jeden** Scrollbereich. Das
    ist der grösste und konkreteste Befund und stand in der ersten Messung
    überhaupt nicht drin: eine breite Tabelle ohne eigenen Scrollbereich
    schiebt das ganze Blatt zur Seite.
    *(Zwischenstand „23" war zu hoch — er suchte nur nach `overflow-x` und
    übersah `overflow-auto`, das beide Achsen abdeckt. Dieselbe Sorte Fehler
    wie oben, eine Ebene kleiner.)*
  * Genau **eine** Stelle hat eine echte Pixelbreite an einem Dialog-Panel
    (`w-[560px]` in `App.tsx`) — und auch die war **kein** Befund: sie steht
    neben `max-w-[92vw]` und schrumpft. Die übrigen `w-NN`-Treffer sind
    kleine Bedienelemente (`w-14`, `w-12`, `w-28`) und in Ordnung.

  **Warum das hier steht und nicht stillschweigend berichtigt wird:** die
  falsche Zahl ist bereits in einem gemergten Suite-PR und in einer Antwort
  an den Eigentümer gelandet. Wer sie später wiederfindet und die neue
  daneben sieht, muss den Unterschied erklärt bekommen — sonst hält er ihn
  für eine Veränderung am Code. Und der Fehler selbst ist lehrreich: er ist
  dieselbe Form wie die beiden Fehlmessungen davor — ein Muster, das
  *irgendetwas* zählt, statt die Frage zu stellen, um die es geht.
* **Reihenfolge:** (1) Schliessen — ERLEDIGT; (2) Touch — ERLEDIGT, samt dem
  Löschgriff am Kabel-Wegpunkt (`cable#784`, siehe unten); (3) Umbruch —
  ERLEDIGT (`cable#784`).
* **TEIL 3, GEBAUT — und die Regel ist eine andere geworden, als der Befund
  oben sie beschrieb.** Gebaut wurde, was an der richtigen Frage übrig blieb:
  * **`block overflow-x-auto`** an den neun Tabellen ohne Scrollbereich. Eine
    breite Tabelle schiebt sonst das ganze Blatt zur Seite, und die Knöpfe
    rechts sind nicht mehr erreichbar — derselbe Fehler wie seinerzeit beim
    Export-Dialog, nur waagerecht.
  * **`grid-cols-1 sm:grid-cols-N`** an den dreizehn Rastern mit
    Eingabefeldern. Nur mit Eingabefeldern: drei Häkchen dürfen dreispaltig
    bleiben, drei Eingabefelder werden schmal unlesbar. Der Wächter fragt
    also, WAS im Raster steht, statt Raster zu zählen.
  * **`.cp-coarse-only`** und der sichtbare Löschgriff am Kabel-Wegpunkt.
    Damit ist die letzte benannte Ausnahme aus Teil 2 gestrichen — und zwar
    so, wie sie es angekündigt hat: nicht mit dem langen Druck (auf demselben
    `pointerdown` sitzt das Ziehen; wer zögert, hätte gelöscht), sondern mit
    einem sichtbaren Griff.
  * Der Touch-Wächter fragt nicht mehr nach `useLongPress`, sondern nach
    einem **zweiten Weg**. Nach einem Bauteil zu fragen hätte den besseren
    Weg als Lücke gemeldet.
  * `tests/umbruch.test.ts` zählt **keine Breiten** und hält in einer eigenen
    Zusicherung fest, warum: fällt `w-full` aus `ModalShell` heraus, wird die
    Zahl aus Befund 3 auf einmal doch ein Befund — und dann wird der Wächter
    rot.
* **Was offen bleibt:** die 44-px-Trefferfläche, gemessen am gerenderten
  Element statt an Klassennamen. Der Weg dafür ist der laufende Renderer
  (`ui:smoke` treibt ihn ohnehin).
* **Aufwand:** (1) mittel, (2) klein, (3) gross — alle erledigt.

### B-45 · Stromplanung, die diesen Namen verdient

* **Status:** Kern GEBAUT — `cable#782`; die Schalter-Bauarten offen. **Wunsch des Eigentümers, 2026-09-08:** „Zudem fehlen
  noch die Möglichkeiten für ordentliche Stromplanung. Powerlock Kabel zieht
  man einzeln. Die müssen auch die Adern Farben bekommen. Und auch
  Lichtschalter und so müssen integrierbar sein."

* **Was schon steht (gemessen 2026-09-08):**
  * `types/circuit.ts` + `lib/circuitSolver.ts` (aus `cable#771`) kennen
    **Einspeisung, Aus-Schalter, Wechselschalter, Kreuzschalter, Dimmer,
    Leuchte und Klemmstelle**, jeweils mit Klemmennummern am Port statt an
    der Port-Reihenfolge. Bedienbar in
    `components/Properties/sections/CircuitSection.tsx`. **Der Wunsch
    „Lichtschalter und so" ist damit im Kern erfüllt** — was fehlt, ist die
    Fortsetzung: Schütz/Relais, Taster mit Stromstossschalter, Not-Aus,
    Fehlerstrom- und Leitungsschutzschalter als eigene Bauarten.
  * `powerPhase` (L1/L2/L3) am Gerät, `powerConsumptionWatts`,
    `types/powerStandard.ts`, und `Powerlock`, `CEE16/32/63`, `Socapex`,
    `Harting`, `PowerCON`, `Schuko`, `IEC` als Steckertypen.
* **Was fehlt — und das ist der Kern des Wunsches: DIE EINZELADER.** Heute
  ist ein Kabel im Plan **eine** Verbindung von Port zu Port. Powerlock ist
  aber genau das nicht: man zieht **je Leiter ein eigenes Kabel**, und
  welcher Leiter das ist, steht in seiner Farbe. Ein 400-A-Anschluss sind
  fünf einzelne Leitungen — L1, L2, L3, N, PE —, jede mit eigener Länge,
  eigenem Weg und eigenem Steckerpaar. Wer das als „ein Kabel" plant, hat
  weder die richtige Stückliste noch das richtige Gewicht noch die richtige
  Ziehliste; und auf der Baustelle liegen fünf Leitungen, von denen der Plan
  eine kennt.
* **Und die Farbe ist keine Kosmetik.** Sie ist die einzige Angabe, an der
  auf der Baustelle hängt, welcher Leiter wohin gehört. Ein vertauschter
  Aussenleiter dreht ein Drehfeld; ein als N gezogener Aussenleiter ist eine
  Gefahr. Die Farbe gehört deshalb an die Ader, nicht an eine Beschriftung,
  und sie muss auf die Ziehliste, auf das Kabel-Etikett und in die Prüfung.
* **Was zu klären ist, bevor gebaut wird (nicht zu raten):**
  * **Farbnorm.** Welche Zuordnung gilt für dieses Haus? Die deutsche
    Neuinstallation, die alte Farbgebung mit anderen Aussenleiter-Farben und
    die nordamerikanische Zuordnung sind drei verschiedene Sätze, und ein
    falsch voreingestellter kostet mehr, als er spart. **Deshalb: keine
    eingebaute Vorgabe raten** — die Norm wird gewählt, und die Auswahl
    trägt ihre Herkunft im Klartext (dieselbe Regel wie bei den
    Text-Protokoll-Vorlagen, Invariante 18).
  * **Powerlock-Kodierung.** Die Farbringe und die mechanische Kodierung der
    Powerlock-Steckverbinder (Quelle/Senke, Erde-Sonderform) stehen im
    Herstellerdokument. Sie aus dem Gedächtnis einzutragen wäre genau der
    Fehler, den Invariante 18 benennt — bis ein Dokument vorliegt, trägt der
    Nutzer die Kodierung ein.
* **GEBAUT (`cable#782`).** `types/conductor.ts` trägt zwei Bauteile, weil es
  zwei Fragen sind:
  * **Ader** am Kabel (`Cable.adern`) — was führt *diese* Leitung. Ein
    mehradriges Kabel mehrere, eine Powerlock-Leitung genau eine.
  * **Anschluss** im Projekt (`project.anschlussListe`) — welche Leitungen
    bilden zusammen einen Anschluss, und welche Leiter muss er haben. Das
    **Soll** ist der ganze Zweck: ohne es könnte die Prüfung nur zählen, was
    da ist. „Vier gezogene Leitungen bei fünf geplanten" ist der Fehler, den
    ein Plan finden muss — Check 22, `error`.
  * **Keine eingebaute Farbnorm.** `EINGEBAUTE_FARBNORMEN` ist leer, und das
    ist die Entscheidung: eine geratene Vorgabe sähe aus wie eine geprüfte
    Angabe, färbte jede Ader, und die Prüfung bestätigte sie anschliessend
    gegen sich selbst. Die Norm wird eingetragen, `herkunft` ist Pflicht, und
    eine ohne wird beim Laden verworfen (**Invariante 22**).
  * Die Farbe steht auf der **Ziehliste** („L1 (braun)"), nicht nur im Plan.
  * Die Powerlock-Kodierung ist Freitext — sie steht im Herstellerdokument.
* **Was offen bleibt:** die Fortsetzung im Schaltbild-Rechner — Schütz/Relais,
  Taster mit Stromstossschalter, Not-Aus, Fehlerstrom- und
  Leitungsschutzschalter als eigene Bauarten.
* **Aufwand:** gross — der Kern erledigt.

### B-46 · Steck- und Kabeladapter als eigene Objekte

* **Status:** GEBAUT — `cable#781`. **Wunsch des Eigentümers, 2026-09-08:**
  „Ebenso fehlen Steck und Kabeladapter wie zum Beispiel Micro HDMI auf HDMI
  Adapter oder USB C auf DisplayPort."

* **Befund (gemessen 2026-09-08):** Adapter kommen im Code nur als **Text in
  Warnungen** vor — `types/cableSpec.ts` sagt „… need an adapter" und „use a
  matching cable/adapter". Ein Adapter als Objekt gibt es nicht. Damit ist er
  auch nicht in der Stückliste, nicht im Gewicht, nicht in der Kiste und
  nicht auf der Packliste — und genau daran scheitert ein Aufbau: das Kabel
  ist da, der Adapter nicht.
* **KORREKTUR zu diesem Befund (2026-09-08, beim Bauen nachgemessen).** Der
  letzte Satz stimmt nicht. `lib/planDemandExtras.ts` **leitet seit Bedarf 17
  Adapter-Zeilen für die Kommissionierliste ab** — aus `cable.needsConverter`
  und aus ungleichen LWL-Steckertypen. Auf der Packliste stand der Adapter
  also sehr wohl.
  Die Korrektur macht den eigentlichen Befund erst scharf, statt ihn zu
  entkräften: die abgeleitete Zeile heisst „Adapter HDMI ↔ USB-C", **weil
  zwei Steckertypen nicht zusammenpassen**. Sie ist aus dem MANGEL gebaut und
  nicht aus einer Angabe — genau der Schluss, den ADR-002 für folgenreiche
  Entscheidungen ausschliesst. Sie kann deshalb nicht sagen, in welche
  Richtung der Adapter geht, was er durchlässt oder ob er Strom braucht, und
  sie liegt nirgends im Signalweg. Was fehlte, war nicht die Zeile, sondern
  **das Ding**.
* **Und `Micro-HDMI` fehlt sogar als Steckertyp.** `ALL_CONNECTOR_TYPES`
  kennt `HDMI` und `Mini-HDMI`, aber nicht `Micro-HDMI` (Typ D) — das
  Beispiel des Eigentümers lässt sich heute nicht einmal benennen.
* **Warum ein Adapter kein Kabel mit zwei Enden ist.** Er ist eine
  **Wandlung** und trägt drei Aussagen, die ein Kabel nicht trägt:
  1. **Richtung.** USB-C auf DisplayPort geht in genau eine Richtung und nur,
     wenn die Quelle den DisplayPort-Alternate-Mode kann. Ein Adapter, den
     der Plan als „passt" zeichnet, obwohl der Rechner es nicht kann, ist die
     gefährlichste Sorte grüner Haken.
  2. **Grenze.** Ein passiver Adapter kann die Bandbreite begrenzen; ein
     aktiver braucht Strom. Beides gehört an das Objekt, nicht in eine
     Fussnote.
  3. **Er liegt im Weg.** Der Signalweg (`lib/signalChain.ts`) muss ihn als
     Station kennen, sonst rechnet die Formatprüfung an ihm vorbei.
* **GEBAUT (`cable#781`).** `types/adapter.ts` trägt die `AdapterSpec` am
  Gerät (`EquipmentItem.adapter`): die beiden Steckerseiten, Richtung,
  Speisung, die durchgelassene Höchst-Grenze und was der Adapter an der
  Quelle voraussetzt. Damit fallen Stückliste, Packliste, Signalweg und
  Formatprüfung ohne Sonderbehandlung an.
  * **DREI Urteile und nicht zwei** — `passt`, `passt-nicht`, `offen`. Die
    dritte ist die, um die es geht: „trägt nicht" und „ist nicht erklärt"
    sehen auf dem Blatt gleich aus und bedeuten das Gegenteil. Wer sie
    zusammenwirft, macht aus jeder Lücke einen Fehler oder aus jeder Lücke
    ein OK; die zweite Richtung ist die gefährliche. Das steht jetzt als
    **Invariante 21** in `docs/architecture.md`.
  * **Der Fall aus dem Wunsch.** „USB-C auf DisplayPort" arbeitet nur an
    einem Anschluss mit DisplayPort-Alternate-Mode. Das **Quellgerät**
    erklärt das unter `kann`; steht dort nichts, lautet das Urteil `offen`.
    Aus dem Modellnamen darauf zu schliessen wäre der Namensabgleich aus
    ADR-002, und die falsche Antwort ist hier ein grüner Haken auf einer
    Strecke, die schwarz bleibt.
  * **Der halbe Datensatz.** Ohne Heilung ist `spec.richtung === 'unbekannt'`
    bei einem fehlenden Feld schlicht `false`, und die Beurteilung fällt bis
    ans Ende durch — auf `passt`. `normalisiereAdapter` setzt deshalb auf
    `unbekannt` **herunter**, statt stehen zu lassen.
  * **Standards nur innerhalb ihrer Familie.** „Ist HDMI-2.0 mehr als
    DP-1.4?" hat keine Antwort, die stimmt; `vergleicheStandard` sagt dann
    `nicht-vergleichbar`, und die erfundene Zahl steht nicht in einem Befund.
  * **`Micro-HDMI` (Typ D)** ist Steckertyp — vorher stand er nur in einem
    Kommentar. Die `Record<ConnectorType, string>`-Farbtabelle hat die
    fehlende Farbe beim Übersetzen gemeldet, wie sie soll.
  * **Signalweg**: eigene Station `adapter` und nicht `converter` — sonst
    stünde „Wandler" an einer Stelle, an der ein Steckadapter sitzt, und wer
    den Weg abgeht, sucht ein Gerät mit Netzteil.
  * **Packliste**: ein erklärter Adapter verdrängt die geratene Zeile,
    sonst wäre es `zwei-rechnungen` und die Kommissionierung packt zwei.
* **Was offen bleibt:** die Fortsetzung aus der Bauform-Frage — ob ein
  Adapter mit mehr als einem Ausgang (Splitter im Steckergehäuse) eine eigene
  Bauart braucht. Heute endet der Weg dort als `mehrdeutig`, benannt.
* **Aufwand:** mittel — erledigt.

### B-47 · Der Monitor weiss, was er kann — ein virtuelles EDID

* **Status:** Kern GEBAUT — `cable#783`; der Datei-Import offen. **Wunsch des Eigentümers, 2026-09-08:** „Auch sind
  Monitore noch nicht intelligent. Man bräuchte quasi auch ein virtuelles
  EDID."

* **Befund (gemessen 2026-09-08):** Der Begriff EDID kommt im gesamten
  Quelltext nicht vor. Ein Monitor trägt genau **ein** Feld zu dem, was er
  kann: `resolution?: string` — eine Zeichenkette, mit der nichts gerechnet
  wird. `types/videoFormat.ts` kennt Formate und `SdiCapabilities` für die
  SDI-Seite; für Displays gibt es kein Gegenstück.
* **Was ein virtuelles EDID im PLANER leistet — und was nicht.** Es ersetzt
  nicht die Aushandlung am Kabel; die passiert zwischen zwei Geräten und
  nicht in einer Planungssoftware. Es beantwortet die Frage, die man vorher
  stellt: **kommt das Bild dort an, das ich schicken will?** Also: welche
  Timings, Bildwiederholraten, Farbtiefen und HDR-Fassungen die Senke
  erklärt — und ob die Quelle, das Kabel, der Adapter (B-46) und jede
  Zwischenstation auf dem Weg das tragen. Das ist dieselbe Rechnung wie beim
  Prüfbild-Weg (B-42), nur mit Formaten statt mit Kreuzpunkten.
* **Der Fallstrick, den es zu vermeiden gilt.** Ein Feld namens „EDID", das
  eine Zeichenkette hält, sähe nach einer Zusicherung aus und wäre keine. Und
  eine EDID, die die App **rät** (aus dem Modellnamen, aus der Auflösung),
  wäre die Defektform, gegen die dieses Repo an sechs Stellen schon steht:
  eine Vermutung, die als Messung gelesen wird. Also: entweder die
  Fähigkeiten sind **erklärt** (der Nutzer trägt sie ein oder importiert
  eine echte EDID-Datei), oder das Gerät sagt „unbekannt" — und ein Weg zu
  einem unbekannten Ziel ist ein offener Weg, kein grüner.
* **Woher echte Daten kommen könnten:** eine ausgelesene EDID ist eine
  128-Byte-Struktur (mit Erweiterungsblöcken), und Auslesewerkzeuge gibt es
  auf jedem Betriebssystem. Ein Import „Datei rein, Fähigkeiten raus" ist
  damit machbar — **die Feldbedeutungen gehören aber aus der Spezifikation
  belegt und nicht aus dem Gedächtnis** (Invariante 18). Bis dahin: erklärte
  Fähigkeiten von Hand.
* **GEBAUT (`cable#783`).** `types/displayCapability.ts`: ein `Senkenprofil`
  am Gerät sagt, welche Formate es annimmt — in welchen Farbtiefen,
  Farbräumen und Dynamik-Fassungen. `herkunft` ist Pflicht.
  * **Drei Urteile** (`passt` / `passt-nicht` / `offen`), und eine **leere
    Achse** heisst „dazu ist nichts erklärt" → `offen`, nie ein stilles „na
    klar, 8 Bit RGB SDR". Auch die Maske belegt nichts vor.
  * Ein **Befund geht der fehlenden Angabe vor** — sonst meldet der Plan
    „nichts erklärt" und verschweigt, dass die Senke die Farbtiefe
    nachweislich nicht annimmt. Die Gegenprobe dazu kam zuerst grün zurück:
    der erste Test unterschied die Reihenfolge gar nicht.
  * **Kein EDID-Parser.** Ein falsch gelesenes Byte ergibt keine
    Fehlermeldung, sondern eine plausible Zahl. `tests/edid.test.ts` hält
    fest, dass hier nichts entziffert wird (**Invariante 23**).
  * Check 23 springt nur an, wo jemand etwas erklärt hat; ein Namensabgleich
    auf die Kategorie stand kurz drin und ist wieder heraus (ADR-002).
* **Was offen bleibt:** der Import einer echten EDID-Datei — sinnvoll, sobald
  die Feldbedeutungen aus der Spezifikation belegt sind.
* **Aufwand:** gross — der Kern erledigt.

### B-48 · Kabel, die hin und zurück laufen; Pfeile, die schräg ins Gerät stechen

* **Status:** **erledigt 2026-09-08** — `cable#785`. **Nutzer-Meldung,
  2026-09-08:** „die kabel im canvas haben manchmal striche die hin und
  wieder zurück gehen und optisch wie ein strich der vom eigentlichen kabel
  ab geht aussehn. das ist unpraktisch. woran liegt das? zudem sind die
  pfeile manchmal schräg. die müssen immer gerade in die geräte gehen"
* **Wie gemessen wurde — und warum das hier der ganze Punkt ist.** Nicht
  gezählt, wie viele Knicke ein Weg hat. Gefragt wurden die beiden Fragen,
  die in der Meldung stecken: **macht der gezeichnete Streckenzug irgendwo
  eine Kehrtwende** (zwei aufeinanderfolgende Abschnitte auf derselben Achse
  in entgegengesetzter Richtung), und **fährt sein letztes Stück in die
  Richtung, in die der Anschluss zeigt**. Das ist dieselbe Lehre wie bei
  B-44 Befund 3: eine Zählung, die etwas anderes zählt als die Frage,
  belegt nichts.
* **Zwei getrennte Ursachen, beide gross.**
  * Der Zweig **ohne** Stützpunkte legte die Mittellinie stets auf die Mitte
    zwischen die beiden Stummel — ohne zu prüfen, ob diese Mitte überhaupt
    auf der Seite liegt, in die der Stummel zeigt. Zeigt sie es nicht, läuft
    der Weg 18 px hinaus und sofort darüber zurück. Über 4×4 Anschlussseiten
    und 25 Ziellagen: **312 von 400 Fällen mit Kehrtwende.** Das Stück
    Stummel, das hinter dem Pfeil stehenbleibt, ist genau der „Strich, der
    vom eigentlichen Kabel abgeht".
  * Der Zweig **mit** Stützpunkten — und der läuft in der Praxis fast immer,
    weil `#206` die automatische Führung nach dem ersten Rechnen in
    `cable.waypoints` speichert — setzte **gar keinen Stummel**. Das letzte
    Stück war, was der Router zuletzt gelegt hatte: **192 von 256 Fällen**
    fahren nicht in die Richtung, in die der Anschluss zeigt. Der Pfeil
    (`orient="auto-start-reverse"`) folgt der Tangente des letzten
    Abschnitts und sticht dann von oben in eine Buchse, die nach links
    schaut.
* **Die Defektform dahinter ist `zwei-rechnungen`, und sie war schon
  auseinandergelaufen.** Beide Zweige setzten denselben Weg zusammen; nur
  einer kannte den Stummel. Genau deshalb konnte die eine Hälfte richtig
  aussehen, während die andere den Fehler zeigte — und niemandem fiel auf,
  dass es zwei Fassungen sind.
* **Was gebaut wurde:** `src/renderer/lib/cableApproach.ts` legt den ganzen
  Streckenzug; `CableEdge.tsx` macht daraus nur noch Pfad und
  Beschriftungsstelle. Zugesichert: erstes Stück gerade aus der Quelle,
  letztes gerade in das Ziel (darauf sitzt der Pfeil); jeder Abschnitt auf
  einer Achse; ohne Stützpunkte keine Kehrtwende. **Die Form wird gewählt,
  nicht angenommen** — aus einer geordneten Kandidatenliste der erste Weg,
  der rechtwinklig ist und nicht kehrtmacht; die Reihenfolge beginnt mit der
  alten Form, damit sich nichts am Aussehen ändert, wo es schon stimmte.
  Läuft das Kabel rückwärts, legt sich die Bahn um die beiden beteiligten
  Gerätekästen herum statt auf die Höhe der Buchsen und damit quer hindurch.
* **Was ausdrücklich kein Defekt ist:** eine von Hand gezogene Schleife.
  Eine Kehrtwende zwischen zwei Punkten des Nutzers gehört ihm; eine
  zwischen seinem Punkt und einer Ecke, die wir eingeschoben haben, gehört
  uns — nur die wird vermieden. `tests/kabelAnfahrt.test.ts` hält beides
  fest.
* **Zwei Gegenproben kamen zuerst grün zurück, und beide Male lag es am
  Wächter, nicht am Code.** Die richtungsbewusste Ecke war unverdient, weil
  der Stummel die Einfahrtsrichtung ohnehin erzwingt — sie hat jetzt eine
  eigene Begründung (die *eingeschobene* Ecke darf keine Kehrtwende
  erzeugen) und einen eigenen Fall. Und die Bahn-Gegenprobe fragte das
  Falsche: sie prüfte, ob ein **Punkt** im Gerätekasten liegt, statt ob die
  **Linie** hindurchläuft. `pathIsBlocked` stellt genau diese Frage und
  stand schon da.
* **Der eine Fall, der nicht zu lösen ist**, steht mit seinem Ergebnis im
  Test statt stillschweigend übersprungen zu werden: beide Enden auf
  demselben Pixel bei gleicher Anschlussseite — hinaus und hinein zeigen
  dann in dieselbe Richtung.
* **Aufwand:** mittel — erledigt.

### B-49 · Bedarfs-Audit: die siebzehn, die nirgends stehen

* **Status:** Audit **erledigt 2026-09-08**; die daraus folgende Arbeit steht
  unten je Zeile. Anlass: Weisung des Nutzers, „mit allen needs aus den
  GitHub-Docs weiterzumachen" — also
  `docs/research/synthesis/USER-NEED-DATABASE.md`, 150 Bedarfe.

* **DIE ERSTE MESSUNG WAR FALSCH, UND ZWAR AUF DIESELBE ART WIE B-44 BEFUND 3.**
  Gezählt wurde „wie oft steht `Bedarf N` in den beiden Backlog-Dateien" —
  Ergebnis: 66 genannt, **84 offen**. Die Zahl misst die falsche Eigenschaft.
  Ein Bedarf gilt nicht als bearbeitet, weil er in einer Markdown-Datei steht,
  sondern weil im Code etwas dazu passiert ist, und der Vermerk steht oft
  genau dort: `addressTemplate.ts` trägt „BEDARF 20 — die zwei Ebenen
  auflösen" im Kopf und in keinem Backlog. Über **alle acht Repos**, Code und
  Doku, neu gemessen: **133 von 150 sind belegt, 17 stehen nirgends.**
  Die 84 waren nie 84.

* **Warum das Audit überhaupt geschrieben wird, statt nur die Lücken zu
  bauen:** ein Bedarf, der erfüllt ist und nirgends vermerkt, wird beim
  nächsten Durchgang als neu wiederentdeckt und ein zweites Mal gebaut — und
  dann steht dieselbe Sache zweimal im Code (`zwei-rechnungen`). Ein Bedarf,
  der bewusst nicht gebaut wird, wird ohne Vermerk beim nächsten Durchgang
  zum Kandidaten. Beides kostet mehr als die Zeile hier.

| # | Prio | Befund nach Nachsehen im Code |
| --- | --- | --- |
| 18 | P1 | **Erfüllt, nur nicht vermerkt.** Der Bedarf verlangt „network facets on the existing device record rather than a separate IP module". Genau das steht: `EquipmentItem.networkInterfaces`, und `addressPlan.ts`, `networkSegments.ts`, `crewNetworkSheet.ts`, `venueNetworkRequest.ts` leiten **alle** aus `project.equipment` ab. Es gibt kein zweites Netz-Dokument. |
| 44 | P2 | **Vier von fünf Zielen gebaut.** `types/sourceIdentity.ts` + `labelDerivation.ts` (ADR-001, Inkrement 1) leiten Mischer-Eingangslabel, Router-Quelle/-Ziel, MV-UMD und Tally-Name aus EINEM Datensatz ab; `labelTargets.ts` hält die belegten Ziele. Das fünfte Ziel — **der Text auf der Bedienoberfläche** — fehlt und ist genau Bedarf 45. |
| 45 | P2 | **Frei geworden.** Stand in der E-18-Zeile als „hängt an anderer Frage → E-23"; E-23 ist seit `cable#785` entschieden UND gebaut. Wird als nächstes gebaut, siehe B-50. |
| 54 | P2 | **WON'T, bereits entschieden.** Steht in der E-18-Zeile unter „WON'T, weil sie Autorenschaft brauchen": geteilter Ablauf mit Spaltenrechten je Rolle. Der Ablauf wird gelesen, nicht geführt. |
| 56 | P2 | **WON'T, bereits entschieden.** Dieselbe Zeile: Ist-Zeiten mit einem Tipp erfassen setzt Autorenschaft am Ablauf voraus. |
| 93 | P2 | **Blockiert wie E-24, aus demselben Grund.** Der Spektrum-Plan ist gebaut (`spectrumPlan.ts`, Bedarf 95) und gibt eine CSV-Tabelle aus. Was der Bedarf will, ist der Austausch mit Wireless Workbench / WSM / IAS — und deren Dateiformate sind nicht dokumentiert öffentlich. Ein aus dem Gedächtnis gebauter Schreiber wäre eine ungeprüfte Zusicherung (Invariante 18). Sobald eine Beispieldatei vorliegt, ist das dieselbe Bauform wie der Ablauf-Leser. |
| 99 | P3 | **Offen, aber nicht mehr blockiert.** `packages/lexware-core` legt Belege an; Mahnketten mit gesetzlichen Fristen und Verzugszinsen auf dem Dokument gibt es nicht. Hing an E-12 — das ist seit `suite#187` gebaut: die Beleg-Domäne läuft im Hauptprozess der Shell und ist in beiden Betriebsarten erreichbar. Was jetzt fehlt, ist die Mahnstufe selbst; die Fristen sind gesetzlich und gehören ANGEGEBEN, nicht geraten. |
| 117 | P4 | **Offen, und ohne Schema nicht baubar.** Eine Rechnung, die den E-Invoicing-Validator des Kunden besteht, heisst XRechnung oder ZUGFeRD — beides Formate mit Spezifikation, die dieses Repo nicht vorliegen hat. Wie 93: erst die Fundstelle, dann der Schreiber. |
| 118 | P4 | **Erledigt 2026-09-08** — `cable#789`, plus `multicam#114` und `light#100` fürs Format. **Die Zeile hier war falsch:** sie sagte, das Lager-Modul sei „inzwischen ein eigenes Repo" — nachgesehen liegt es weiter in `cable-planner/src/renderer/lager/` (die Auslagerung steht noch aus). Gebaut wurde deshalb dort. **Zwei der drei Artefakte gab es schon:** der Lieferschein ist seit den Bedarfen 15/16/136 der Ausgabeschein samt Quittung. Neu ist die WERT-Hälfte: `InventoryUnit.anschaffung` und `.versicherungswert` (zwei Zahlen, **kein Zeitwert** — die Abschreibungsregel gehört dem Versicherer), `InventoryItem.ursprungsland`, `Geldbetrag` mit Währung am Betrag. Daraus die **Versicherungsliste** (Summe je Währung, und die Einheiten ohne Wert namentlich darunter — eine Summe, die ihre Lücke verschweigt, ist die stille Unterversicherung) und das **Carnet-Datenblatt** (die Spalten, nicht das Zolldokument). Format-Version 3 → 4 in allen drei Repos. Elf Gegenproben. |
| 119 | P4 | **Offen, und der Zuschnitt ist jetzt schaerfer.** Mit Bedarf 120 ist die eine Haelfte da: die Nachweise liegen als Paket vor, samt Deckblatt. Was fehlt, sind die **Stammdaten** (Steuernummer, Bankverbindung) auf demselben Blatt — und genau die sind der Grund, warum hier nicht weitergebaut wurde: Bankdaten in einen localStorage zu legen, den niemand als Tresor angelegt hat, ist eine Entscheidung des Eigentuemers und keine, die beim Bauen nebenbei faellt (dieselbe Frage wie bei den Stream-Keys, die deshalb im keytar liegen). **Der zweite Teil des Bedarfs ist ohnehin nicht baubar:** „ohne weiteres Konto aufgenommen werden" betrifft das System des KUNDEN; diese Anwendung kann dort nichts abschalten. Der Bedarf ist zudem der am schwaechsten belegte des Dossiers — „the forums carrying it were unreachable" — und wurde ausdruecklich heruntergestuft. |
| 120 | P4 | **Erledigt 2026-09-08** — `cable#790`. Die alte Begründung („berührt den Signalfluss nicht") war kein Grund, es nicht zu bauen, sondern nur einer, es nicht in den Plan zu legen: die Nachweise liegen im **eigenen, projektübergreifenden Store** und in keiner `.avplan` — in einer Datei, die an einen Kunden geht, hätte die Versicherungsnummer des Freiberuflers nichts zu suchen. **Die eine gefährliche Stelle** ist ein Eintrag ohne Frist: `NachweisLage` hat deshalb **drei** Werte (`in-frist`, `abgelaufen`, `ohne-frist`) und nicht zwei, und „keine Frist angegeben" ist auf dem Schirm ausdrücklich **nicht grün**. Das Deckblatt lässt nichts weg — auch das Abgelaufene steht drauf, mit seiner Lage, und was ohne benannte Datei ist, sagt es. **Die Vorwarnzeit wird angegeben, nicht vorausgesetzt**: ohne Zahl wird nicht gewarnt (dieselbe Haltung wie `CostPlan.tolerancePercent`). Was die Anwendung **nicht** tut: die Scans speichern — nur ihren Dateinamen. Zehn Gegenproben. |
| 122 | P4 | **Erfüllt, nur nicht vermerkt.** `tallyMap.ts` leitet die Tally-/UMD-Zuordnung aus dem Plan ab — Router eingeschlossen, seit der Korrektur der Eingangsnummer. Keine handgepflegte Tabelle. |
| 123 | P4 | **Erfüllt, nur nicht vermerkt.** Der geteilte Plan zwischen Maschinen läuft über die CRDT-Synchronisation (`sync:*`, `signaling:*`) und nicht über Export/Import von Hand. |
| 124 | P4 | **Erfüllt als REGEL, und die Regel ist stärker als der Bedarf.** ADR-005 „Verlustfrei oder laut": ein Import, der ein Feld nicht bewahren kann, muss verweigern statt es zu verwerfen. Der Bedarf verlangt nur, dass ein Rundlauf keine von Hand gefüllte Spalte zerstört; Bedarf 29 (`cable#711`) hat das für den CSV-Weg eingelöst. |
| 128 | P4 | **Offen, und nachgesehen: es gibt keine einzige `@media print`-Regel im Renderer.** Ein monochrom sicherer Ausdruck ist damit nicht bloss unschön, sondern ungeprüft — ein Plan, dessen Ebenen sich nur durch Farbe unterscheiden, ist auf einem Schwarzweiss-Drucker unlesbar. Kleiner Aufwand, klarer Nutzen. |
| 131 | P4 | **Offen.** Arbeitsschutz-, Rigging- und Bestuhlungs-Papiere mit vorhandenen Daten füttern, ohne die Dokumente zu besitzen. Dieselbe Haltung wie E-18 beim Ablauf; sinnvoll, sobald jemand ein konkretes Blatt benennt. |
| 134 | P4 | **Ist selbst ein WON'T** und wird als solches notiert: „do NOT build supplier coordination, crew scheduling or invoicing". Er steht hier, damit niemand ihn als Bauauftrag liest — ein negativer Bedarf, der nirgends vermerkt ist, sieht beim nächsten Durchgang aus wie eine Lücke. |

* **Aufwand:** klein (Audit) — die daraus folgende Arbeit steht in B-50 und in
  den Zeilen oben.

### B-50 · Bedarf 45 — vom Inhalt des Ablaufs auf die Bedienoberfläche

* **Status:** **erledigt 2026-09-08** — `suite#183`. Freigeworden durch E-23:
  der Bedarf stand in der E-18-Zeile als „bleibt an anderer Frage hängen → E-23",
  und E-23 ist seit `cable#785` entschieden **und** gebaut.
* **Der Befund, an zwei Trackern zugleich belegt:** die Companion-Anbindungen
  von Ontime sind „exclusively timer-related" (#1841, #1835, #1484, #2079), und
  eine Suche nach „rundown" in Companions eigenem Tracker ergibt „effectively
  nothing". **Die Uhr des Ablaufs kommt auf der Oberfläche an, sein Inhalt
  nicht.** Wer die Taste beschriftet, tippt ab — und tippt beim nächsten
  Umbenennen erneut ab.
* **Damit zugleich das fünfte Ziel aus Bedarf 44.** Nachgesehen: vier der fünf
  Ziele jenes Bedarfs stehen (`sourceIdentity` + `labelDerivation`,
  ADR-001 Inkrement 1 — Mischer-Eingangslabel, Router-Quelle/-Ziel, MV-UMD,
  Tally-Name). Das fünfte, **der Text auf der Bedienoberfläche**, fehlte. Er
  ist jetzt eine Ableitung: wird die Kamera im Plan umbenannt, folgt die
  Beschriftung.
* **Was ausdrücklich NICHT ausgegeben wird: eine Companion-Importdatei.** Die
  Grenze steht seit S-4 in `companionControl.ts` und ist dort am Quelltext
  nachgelesen (`companion/lib/Service/HttpApi.ts`, main, 2026-09-08):
  Companions HTTP-Schnittstelle kann Schaltflächen **drücken** und
  Custom-Variablen **setzen** — es gibt keine Aktions-Route. Eine Datei mit
  erfundenen Aktionen sähe importierbar aus und wäre eine ungeprüfte
  Zusicherung (Invariante 18). Ausgegeben wird deshalb ein **Belegungsplan**:
  welche Taste zu welchem Ablauf-Punkt gehört und wie sie heisst. Die Aktion
  legt der Bediener einmal von Hand; die Beschriftung kommt ab dann aus dem
  Plan. Genau dieser Teil fehlt heute überall.
* **Das Raster wird gesagt, nicht angenommen.** Ein Stream Deck hat 15 Tasten,
  ein XL 32, eine Companion-Seite im Browser so viele wie eingestellt. Eine im
  Modul eingebaute Zahl wäre eine Annahme über fremde Hardware, die auf dem
  Blatt wie eine Tatsache aussieht (ADR-002). Der Aufrufer nennt sie; 8×4 ist
  eine **Vorauswahl im Eingabefeld**, und die Stand-Zeile schreibt hin, mit
  welchem Raster gerechnet wurde — ohne das ist ein ausgedrucktes Blatt gegen
  eine andere Oberfläche nicht mehr lesbar.
* **Was keine Taste bekommt, steht da** (Bedarf 65): ein Ablauf-Punkt ohne
  einen einzigen Verweis in den Plan bekommt keine — eine Taste ohne Technik
  dahinter tut nichts, und dreissig davon machen den Plan unlesbar. Gezählt
  und namentlich in der Stand-Zeile. „Kein Punkt ausgelassen" ist ebenfalls
  eine Aussage; ein fehlender Satz ist keine.
* **Ein Blatt, ein CSV-Schreiber.** Die Rückgabe hat die Form `GearSheet`,
  damit `rundownViewCsv` und `rundownViewRows` unverändert weiterlaufen. Ein
  zweiter CSV-Schreiber wäre `zwei-rechnungen`.
* **Sieben Gegenproben, alle rot** — eine davon kam zuerst grün zurück, und
  zwar nicht wegen des Codes: das Suchmuster der Gegenprobe traf die Zeile
  nicht (`join(", ")` gegen `join(', ')`), sie war also ein No-Op. Eine
  Gegenprobe, die nichts ändert, ist keine Gegenprobe.
* **Aufwand:** mittel — erledigt.

### B-52 · Passive Port-Träger: Verteiler, Steckdosenleiste, Durchgangsbuchse — und wo die Patchblende steckt

* **Status:** Befund erhoben und beantwortet 2026-09-08, **Bau offen**.
  **Nutzer-Frage, 2026-09-08:** „es gibt noch keinen guten weg um
  stromverteiler in den plan einzuzeichnen und auch noch keine patchblenden
  und durchgangsbuchsen und keine mehrfachsteckdosen. sollten das geräte
  sein?"

* **Nachgesehen, bevor geantwortet wurde — und der wichtigste Befund war eine
  Korrektur der Frage.** Patchblenden **gibt es**: `isPatchPanel` am Gerät,
  `lib/patchPanel.ts` leitet die positionsweise Durchleitung ab (Issue #664).
  Nur: die **einzige** Stelle, die eine anlegt, ist
  `components/Rack/PatchPanelCreateDialog.tsx`; der andere Weg ist, irgendein
  Gerät anzulegen und in `Properties/sections/DisplayFlagsSection.tsx` ein
  Häkchen zu setzen. **Wer auf dem Canvas plant und den Rack-Builder nie
  öffnet, begegnet ihr nie.** Das ist kein Modell-Problem, sondern ein
  Auffindbarkeits-Problem — und es hätte sich nicht zeigen lassen, ohne
  nachzusehen, wo das Ding entsteht.
* **Was es wirklich nicht gibt:** Stromverteiler und Steckdosenleisten.
  `CircuitKind` kennt `feed`, `switch`, `changeover`, `crossover`, `dimmer`,
  `lamp`, `junction` — keinen Verteiler mit abgesicherten Abgängen, keine
  Leiste. In keinem Gerätekatalog steht ein Strom-Gerät. Die
  Durchgangsbuchse ist signalseitig eine Patchblende der Grösse 1 und hat
  keinen eigenen Begriff.

* **Die Antwort auf „sollten das Geräte sein?": ja — weil alles, was diese
  Anwendung gut kann, an PORTS AM GERÄT hängt.** Kabelwege, Kommissionier-
  liste, Patchliste, Adressplan, Längenrechnung, Rack-Layout: jede dieser
  Rechnungen beginnt an einem Port eines Geräts. Eine Steckdosenleiste ist
  genau „ein Eingang, sechs Ausgänge"; ein Verteiler dasselbe plus
  Absicherung je Abgang. Dass sie passiv sind, spricht nicht dagegen — die
  Patchblende ist es auch, und ihre Durchleitung wird aus der **Bauart**
  abgeleitet statt geschaltet.
* **Die Absicherung gehört an den PORT, nicht in ein neues Objekt.** Sonst
  gibt es zwei Orte für dieselbe Aussage, und beim Umsortieren laufen sie
  auseinander — derselbe Befund, den B-33 für die Port-Nummerierung und
  `circuitTerminal` für die Klemmennummer festhalten.
* **Die Ausnahme:** eine Blind*blende* ohne Buchsen ist **kein** Gerät,
  sondern Rack-Geometrie (`components/Rack/`). Sie taucht in keinem
  Signalfluss auf; sie als Knoten zu führen hiesse, den Plan mit etwas zu
  füllen, das nichts verbindet.

* **Zuschnitt in zwei Teilen, und Teil 1 ist der, nach dem gefragt wurde:**
  1. **Ein Ort auf dem Canvas für passive Port-Träger** — Patchblende,
     Durchgangsbuchse, Steckdosenleiste, Verteiler — aus der Bibliothek
     platzierbar, dort wo man Geräte platziert. Die Patchblende ist dabei
     kein Neubau, sondern ein zweiter Weg zu dem, was
     `PatchPanelCreateDialog` schon kann; ein dritter Ort, der dasselbe
     Gerät anders erzeugt, wäre `zwei-rechnungen`.
  2. **Der Verteiler als Bauart im Schaltbild.** Dafür gilt die Regel aus
     `types/circuit.ts`: die Bauart wird **angegeben, nie aus der Kategorie
     geraten** (ADR-002). Ein neuer `CircuitKind` braucht ein eigenes Feld
     und einen Eintrag in der `satisfies Record<CircuitKind, …>`-Tabelle,
     sonst ist er nicht wählbar, obwohl der Rechner ihn beherrscht. Gehört
     in dieselbe Runde wie die schon vorgemerkten Bauarten aus B-45
     (Schütz, Relais, Taster, Not-Aus, FI, LS).
* **Aufwand:** mittel.

* **TEIL 1 ERLEDIGT 2026-09-08** — `cable#787`. `lib/passiveCatalog.ts`:
  Patchblenden (12/24/48× BNC, 24× RJ45, 24× XLR), Durchgangsbuchsen (BNC,
  XLR, RJ45), Steckdosenleisten (6-/8-fach Schuko, 8-fach IEC) und Verteiler
  (CEE32, CEE63) — aus der Bibliothek platzierbar. Die Blenden tragen
  dasselbe `isPatchPanel` wie die aus dem Rack-Builder und laufen damit durch
  dieselbe Durchleitungs-Ableitung; ein zweiter Blenden-Begriff wäre
  `zwei-rechnungen`. Neu am Port: `absicherungA`. Verdrahtet über die
  Seed-Liste in `runLibraryMigration` mit angehobener `LIB_MIGRATION_VERSION`
  — ohne die wären die Vorlagen gebaut und für bestehende Nutzer unsichtbar.
* **Zwei Wächter haben dabei zugeschlagen, beide zu Recht.** Die
  ASCII-Drift-Prüfung fand „Rueckseite" in einem String-Literal (geändert
  wurde der Wert, nicht der Wächter). Und `catalogSourceUrls` wäre von acht
  auf neun „Kataloge ohne Beleg" gesprungen — das hätte den neuen Katalog als
  **Recherche-Lücke** ausgewiesen, obwohl er absichtlich keinen Hersteller
  behauptet. Statt die Zahl hochzuzählen gibt es jetzt `GENERISCHE_KATALOGE`,
  erklärt statt abgeleitet, plus eine Prüfung, dass darin wirklich keine
  `manufacturerUrl` steht — sonst verdeckte die Ausnahme eine echte Lücke.
* **TEIL 2 ERLEDIGT 2026-09-08** — `cable#788`. Sieben neue `CircuitKind`:
  `distro` (Stromverteiler) sowie `button`, `contactor`, `relay`,
  `emergencyStop`, `rcd`, `mcb`. Der Verteiler ist eine **Klemmstelle mit
  abgesicherten Abgängen** — die Absicherung sitzt am Anschluss
  (`Port.absicherungA` aus Teil 1) und **löst nie aus**: dafür müsste der Plan
  die angeschlossenen Lasten kennen (dieselbe Grenze wie beim
  Router-Kreuzpunkt, ADR-003).
* **Die sechs Kontakte teilen sich EINE Rechnung.** Elektrisch sind Schütz,
  Relais, Taster, Not-Aus, FI und LS dasselbe wie `switch`; sechs eigene
  Zeilen in `INNERE_VERBINDUNG` wären sechsmal dieselbe Rechnung. Der
  Modulkopf des Rechners sagt das seit seiner ersten Fassung („Eine vierte
  Schaltungsart braucht dann eine Zeile in `INNERE_VERBINDUNG` und keinen
  neuen Zweig"); hier wird es eingelöst. Eigene Bauarten sind sie für
  **Beschriftung und Ruhestellung** — „Aus-Schalter" auf einem Not-Aus wäre
  auf einem Blatt schlicht falsch. Die **Spule** eines Schützes (A1/A2) ist
  bewusst nicht abgebildet: sie wäre ein zweiter Stromkreis, der den ersten
  schaltet, und der Rechner hätte eine Rückkopplung zu lösen, die niemand
  angegeben hat.
* **Der eigentliche Befund kam beim Bauen heraus: DREI Ruhestellungen.**
  `VORGABE_STELLUNG` im Rechner, `vorgabe()` im `circuitStore` und die Marke
  am Canvas-Knoten (`stellung ?? (kind === 'feed' ? 1 : undefined)`)
  rechneten alle drei aus, welche Stellung ohne Zutun gilt. Sie stimmten
  überein, weil ausser der Einspeisung alles bei 0 anfing — ein Zufall, der
  genau mit dieser Änderung endete: Not-Aus, FI und LS sind im Ruhezustand
  **geschlossen**. Der Rechner hätte die Leuchte brennen lassen und die Marke
  daneben keine Stellung gezeigt; zwei Antworten auf dieselbe Frage,
  nebeneinander auf dem Schirm. Die Ruhestellung steht jetzt als `ruhe` in
  `CIRCUIT_KIND_INFO`, alle drei lesen sie dort.
* **Die Marke am Knoten wird angegeben statt aus dem Namen geschnitten.** Sie
  war der erste Buchstabe der Beschriftung; mit „Stromverteiler"/„Schütz" und
  „Leuchte"/„Leitungsschutzschalter" kollidiert das. Ausdrücklich **kein**
  Betriebsmittelkennzeichen nach DIN EN 81346 — die Norm vergibt
  Klassen-Buchstaben und zählt innerhalb der Klasse.
* **Zwölf Gegenproben, alle rot** (`tests/schaltbildBauarten.test.ts`). Zwei
  eigene Fehlgriffe dabei: die erste Fassung prüfte nur `solveCircuit` mit
  selbst gesetzter Stellung — dort fällt eine gedrehte Ruhestellung durch kein
  Netz; und die Regel „schaltbar genau dann, wenn es Stellungen gibt" wurde
  zunächst ein zweites Mal geprüft, obwohl sie schon einen Ort hat.
* **Damit ist B-52 abgeschlossen.**

### B-53 · Die vendorierten Doku-Kennzahlen nennen eine Version, die es nicht mehr gibt

* **Status:** ~~offen~~ **erledigt 2026-09-09.** Gebaut in der Variante, die
  der Befund unten als die ehrlichere bezeichnet: das Feld `version` wird beim
  Vendoring mitgezogen, und `planner-drift.mjs` hat dafür die benannte Ausnahme
  vom `package.json`-Ausschluss bekommen.
  * **Nachgemessen beim Beheben** — es war nicht nur der cable-planner:
    `apps/cable-planner` stand auf 8.3.1 gegen upstream 9.0.1,
    `apps/multicam-planner` auf 4.3.0 gegen 4.3.3. Nur `light-planner` stimmte.
    Zwei von drei, und die Doku des cable-planners schrieb es ab.
  * **Der Wächter ist nachsichtig, wo er es sein muss.** Hat upstream seit der
    Baseline erhöht, ist die abweichende Version kein Fehler dieses Repos,
    sondern der fällige Nachzug: sie steht im Bericht und bricht keinen
    fremden Suite-PR — dieselbe Regel, nach der die Drift-Zahl bei bewegtem
    Upstream meldet statt fehlzuschlagen. Steht der Upstream genau da, wo die
    Baseline ihn festhielt, dann IST die Abweichung hier entstanden, und dann
    fällt der Lauf.
  * **Gegengeprobt, dreimal:** Version wieder auseinandergezogen (rot) ·
    dieselbe Abweichung mit ausgehängter Prüfung (grün — die Prüfung ist also
    das, was sie findet) · Abweichung bei bewegtem Upstream (meldet, fällt
    nicht).
* **Der ursprüngliche Befund**, aufgefallen beim Vendoring von `cable#791`
  (E-2 Schritt 2+3) am 2026-09-09.
* **Befund:** `apps/cable-planner/package.json` steht auf `8.3.1`, der
  Upstream auf `9.0.1`. `scripts/update-doc-stats.mjs` liest die Version von
  dort, also schreiben `docs/architecture.md`, `docs/app-structure.html` und
  `docs/comparison.html` in der Suite „Stand: v8.3.1" über einen Quelltext,
  der v9.0.1 ist. Modul-Zahl und LOC daneben stimmen — nur die Version nicht,
  und das ist die unangenehmere Sorte falsch: eine Zahl, die sich richtig
  anfühlt.
* **Warum das nicht einfach ein Vendoring-Loch ist:** `planner-drift.mjs`
  lässt `package.json` mit Absicht draussen („Monorepo und Standalone haben
  unterschiedliche Abhängigkeiten"). Der Ausschluss ist richtig für die
  Abhängigkeiten und schüttet das Versionsfeld mit aus — es hat mit dem
  Monorepo-Zuschnitt nichts zu tun.
* **Abhilfe (nicht im selben PR gemacht, um ihn nicht zu verbreitern):**
  entweder das Feld `version` beim Vendoring mitziehen — dann braucht
  `planner-drift.mjs` eine benannte Ausnahme vom Ausschluss, damit die
  nächste Sitzung nicht wieder darüber stolpert — oder `update-doc-stats.mjs`
  in der Suite die Version aus dem Upstream-Stand lesen lassen. Die erste
  Variante ist die ehrlichere: die vendorierte App IST v9.0.1.
* **Aufwand:** klein.


### B-54 · Der Beleg-Dialog baute den Beleg selbst — geprüft war der andere Weg

* **Status:** ~~offen~~ **erledigt 2026-09-09.** Gefunden beim Abarbeiten von
  **Bedarf 99** („BillingDoc must carry due date and payment terms as
  structured data, not prose").
* **Befund, und er hat zwei Hälften.**
  * `apps/shell/src/data/billing.ts` führt `buildBillingDoc` — die Funktion,
    auf die sich `apps/shell/test/billing.test.ts` bezieht. **Kein
    ausgelieferter Weg rief sie auf.** Der Beleg-Dialog
    (`BillingModal.tsx`) setzte den `BillingDoc` in einem eigenen `useMemo`
    ein zweites Mal zusammen. Die Wächter prüften damit einen Weg, den kein
    Nutzer nimmt, und der Weg, den er nimmt, war ungeprüft — die Defektform
    `zwei-rechnungen` in ihrer unangenehmsten Ausprägung.
  * Der Rückfall in `buildBillingDoc` war ein **fest verdrahteter deutscher
    Satz**: `Zahlbar innerhalb von N Tagen ohne Abzug`. Auf einem Beleg, den
    ein englischsprachiger Nutzer verschickt, eine deutsche Zeile, an der
    keine Übersetzung vorbeikommt. Live wurde sie nicht, weil der Dialog
    seinen eigenen — übersetzten — Satz mitbrachte; sie wartete nur darauf,
    dass jemand den Bauer benutzt.
* **Was gebaut wurde.** Ein Bauer. `BuildDocOptions` nimmt jetzt auch
  Besteuerung, Ein- und Schlusstext, Angebots-Gültigkeit und Zahlungsziel
  entgegen; der Dialog reicht seine Eingaben hinein statt selbst zu bauen.
  Der Satz zum Zahlungsziel bleibt beim Dialog, weil nur die Oberfläche
  übersetzen kann — **das Dokument trägt die Zahl** (`paymentTermDays`), und
  genau das verlangt Bedarf 99. Fehlt der Satz, trägt der Beleg nur die
  Dauer; erfunden wird keiner mehr.
* **`undefined` und leer sind nicht dasselbe.** Bei Ein- und Schlusstext
  heisst `undefined` „nimm die Vorgabe des Projekts" und ein leerer String
  „der Nutzer hat das Feld geleert". Mit `||` fielen die beiden zusammen —
  der gelöschte Schlusstext stünde beim Erzeugen wieder da. Deshalb `??`.
* **Sechs Gegenproben, alle rot** (`apps/shell/test/billing.test.ts`).
* **Was Bedarf 99 ausdrücklich NICHT bekommt:** Mahnketten. Die Antwort in
  der Bedarfsdatenbank sagt es selbst — „Dunning is the accounting tool's
  job - do not rebuild it." Gesetzliche Fristen werden hier nicht modelliert
  und nicht geraten.


### B-55 · Bedarfs-Audit P4-Block 121–150

* **Status:** Audit **abgeschlossen 2026-09-09.** Anlass: von den dreissig
  Zeilen stand genau eine (126) überhaupt im Backlog — „vermutlich gedeckt"
  ist kein Audit.
* **Vorgehen:** je Zeile im Quelltext nach dem Beleg gesucht, nicht nach dem
  Gefühl. Die Prüfer im `light-planner` nennen die Bedarfsnummer in ihrer
  Kopfzeile, im `cable-planner` tun es die Module — daraus lässt sich die
  Deckung ablesen statt sie zu behaupten.

**Gedeckt, mit Fundstelle (24):**

| Bedarf | Wo |
| --- | --- |
| 121 Routing-Zustände als Planungsobjekt | `cable-planner/lib/salvoSheet.ts` |
| 125 Multiviewer-Layout als Planungsobjekt | `cable-planner/lib/mvSheet.ts` |
| 126 Soll gegen Ist, Rückmessung | `cable-planner/lib/asBuilt.ts` |
| 127 Mehrbenutzer / mehrere Shows | `projectStore`, `mobileShareServer`, `shareShow` |
| 128 Einfarbig lesbarer Druck | `CanvasArea`, `ExportDialog` |
| 129 Schrittweise Paint-Befehle | `sony-camera-bridge/protocol/paintNudge.ts` |
| 130 Verlässliche Quell-Identität | `multicam-planner/utils/sourceIdentity.ts` |
| 131 Datenblatt statt Gefährdungsbeurteilung | `lager/lib/insuranceSchedule.ts` (Teil) |
| 132 Ablauf als Baum | `light-planner/scripts/running-order-check.ts` |
| 133 Offline + LAN + Anmeldung | `cable-planner/main/util/lanReach.ts` |
| 136 Ein Schein, eine Unterschrift, symmetrisch zurück | `lager/lib/handoverSignature.ts` |
| 137 Rückweg vom Pult | `light-planner/core/consolePatch.ts` |
| 138 Zwei Kopien zusammenführen | `light-planner/core/rigMerge.ts` |
| 139 Gruppen überleben die Übergabe | `light-planner/scripts/fixture-groups-check.ts` |
| 140 Kabel und Stecker als eigene Daten | `light-planner/core/rigCables.ts` |
| 141 Kreise, Phasen, Last | `light-planner/core/powerDistribution.ts` |
| 142 Vorflug-Prüfung | `light-planner/scripts/preflight-check.ts` |
| 143 Ein Modell, zwölf Blätter | `light-planner/scripts/report-engine-check.ts` |
| 144 Austauschdateien brechen nicht am Namen | `light-planner/core/mvrIdentity.ts` |
| 145 Bestellung aus dem Plan | `light-planner/core/shopOrder.ts` |
| 146 Patch ins Pult schieben | `light-planner/core/consoleExport.ts` |
| 147 Universum = Protokoll + Port-Adresse | `light-planner/scripts/universe-identity-check.ts` |
| 148 Etiketten aus denselben Daten | `light-planner/core/labelSheet.ts` |
| 150 Scannen nie der einzige Weg | `cable#793` |

**Gedeckt, aber ohne Bedarfsnummer im Quelltext (4):**

* **122** Tally-/UMD-Zuordnung aus denselben Datensätzen — `lib/tallyMap.ts`
  (Initiative 2). Es hält auch die zweite Hälfte des Bedarfs ein: „Do not
  build a tally engine" — das Modul liefert die KARTE an `tally-pi` und
  entscheidet nichts.
* **123** Eine Show-Datei über mehrere Rechner — CRDT-Sync (`sync:*`,
  `scripts/crdt-convergence-check.mjs`) plus `healProjectPositions` als das
  vom Bedarf verlangte „verify-on-load".
* **124** Feldweiser, ergänzender Abgleich mit sichtbarem Konflikt —
  `networkReconcile.ts` + `ReconcileDialog`.
* **135** Offline im Lager — offline-first durch die Architektur; das Lager
  läuft im Renderer gegen lokalen Speicher, ohne Server im Rücken.

**Zwei Zeilen sind keine Funktionen, sondern Aussagen — und beide brauchten
eine Antwort:**

* **134 „Do NOT build supplier coordination, crew scheduling or invoicing".**
  Die Suite tut zwei davon: Belege über Lexware (`BillingModal`,
  `@avplan/lexware-core`) und Crew-Planung (`crewCalendar.ts`,
  `crewBilling.ts`). **Das ist kein Versehen und auch kein Widerspruch — es
  ist eine Gegenentscheidung, und sie gehört benannt.** Der Bedarf begründet
  sein „nicht bauen" damit, dass diese Grenzen auf Telefonaten und E-Mail
  laufen und „a worse version of CrewBrain" einen neuen Medienbruch schüfe.
  Was hier gebaut ist, ist bewusst die andere Sorte: **kein
  Koordinations-Werkzeug, sondern eine Ausgabe.** Der Beleg wird an das
  Buchhaltungssystem des Nutzers übergeben (Bedarf 99 sagt es wörtlich:
  „Dunning is the accounting tool's job — do not rebuild it"), und der
  Crew-Teil rechnet Schichten ab und druckt Merkblätter, statt Verfügbarkeiten
  zu verhandeln. Wer künftig anfängt, Zusagen, Absagen oder Nachverhandlungen
  zu modellieren, überschreitet die Linie, die dieser Bedarf zieht.
* **149 „Own the file, offline, without a subscription or a dongle".** Der
  Bedarf ist erfüllt — und **seine eigene Antwortspalte enthielt eine
  überholte Tatsache**: „light-planner is already offline-first, single-file,
  **MIT**". Alle vier Repos tragen seit der Lizenz-Korrektur eine
  PROPRIETARY SOFTWARE LICENCE. Offline-first und Einzeldatei stimmen weiter;
  MIT nicht. Die Zeile in `USER-NEED-DATABASE.md` ist deshalb mit einer
  datierten Korrektur versehen statt umgeschrieben — der ursprüngliche Satz
  bleibt lesbar, weil er erklärt, warum das Positionierungs-Argument gebaut
  wurde. **Der Grund für die Korrektur ist nicht Ordnungsliebe:** wer den
  Satz übernimmt, ohne die Zeile darunter zu lesen, sagt etwas Unwahres über
  die eigene Lizenz — nach aussen.

* **Weiter blockiert, unverändert:** 131 in seiner grösseren Hälfte (die
  deutschen Rechtsquellen sind nicht erreichbar, und das Dossier verbietet
  ausdrücklich, ohne sie zu bauen).


### B-56 · „Upstream changes not yet carried over: None" heisst nicht „nichts fehlt"

* **Status:** Befund erhoben 2026-09-09 beim Vendoring von `cable#793`.
  Behoben ist der konkrete Fall; die Lehre steht hier, weil sie beim nächsten
  Vendoring wieder greift.
* **Was passiert ist.** Nach dem Vendoring meldete `planner-drift.mjs` unter
  „Upstream changes not yet carried over" ein sauberes **None** — und
  `tests/scanNieAllein.test.ts` fehlte in der Suite trotzdem. Fast wäre die
  Baseline mit dieser Lücke neu geschrieben und die Lücke damit als
  Normalzustand festgeschrieben worden.
* **Warum das kein Fehler des Skripts ist.** Der Abschnitt sagt selbst, was er
  misst: „Lines upstream ADDED **since the baseline** … that are missing from
  the suite copy **entirely**." Er vergleicht ZEILEN in Dateien, die es auf
  beiden Seiten gibt. Eine ganze NEUE Datei taucht dort nicht auf — sie steht
  in der Tabelle darüber, in der Spalte **`only-upstream`**.
* **Die Regel fürs nächste Mal:** beim Vendoring wird die Spalte
  `only-upstream` gelesen, nicht der Absatz darunter. `only-upstream: 1` heisst
  „eine Datei ist upstream und hier nicht" — und das ist genau der Fall, den
  ein Drei-Wege-Merge nie zeigt, weil er nur Dateien anfasst, die es beidseits
  gibt. Dasselbe gilt für den Typ-Check: er fand beim Intercom-Slot einen
  suite-eigenen Leser (`shellRevealBridge.ts`), den der Merge ebenfalls nicht
  sehen konnte.
* **Zusammen ergibt das drei Prüfungen nach jedem Vendoring**, und keine
  ersetzt eine andere: die Konflikt-Anzeige des Merges, `only-upstream` in der
  Drift-Tabelle, und `tsc` plus Testlauf IN der vendorierten Kopie.
* **Nachtrag 2026-09-09 — eine vierte kommt dazu, siehe B-57:** *läuft* der
  mitgebrachte Wächter hier überhaupt? Die drei Prüfungen oben beantworten,
  ob die **Datei** angekommen ist. Keine von ihnen fragt, ob sie bei einem
  Merge der Suite je **ausgeführt** wird.

### B-57 · Das Vendoring holt die Datei, nicht ihre Ausführung

* **Status:** Befund erhoben und behoben 2026-09-09, unmittelbar nach dem
  Vendoring von `light#102`.
* **Was passiert ist.** `access:check` kam mit `light#102` in die Suite,
  war grün, und wäre bei keinem Merge gefahren. Nachgemessen betraf das
  **17 Wächter in drei Apps**, darunter `retime:check` — beim Vendoring
  davor auf genau dieselbe Weise hereingetragen und seither still.
* **Warum es niemandem auffiel, obwohl es dafür einen Wächter gibt.** Es gibt
  ihn sogar zweimal, und beide waren aus je eigenem Grund blind:
  * Der `ci:complete` **der Suite** las nur die Wurzel-`package.json`. Ein
    Lauf, der in `apps/light-planner/package.json` steht, kam in seiner Liste
    nie vor — er konnte ihn nicht vermissen.
  * Der `ci:complete` **innerhalb der vendorierten App** vergleicht gegen
    `apps/<app>/.github/workflows/ci.yml`. Das ist eine **Kopie** aus dem
    Upstream-Repo; GitHub liest nur `.github/` der Wurzel, also feuert sie
    nie. Er war grün über einen Workflow, den es hier nicht gibt — und genau
    dieses „grün über nichts" ist die Form, gegen die er erfunden wurde.
* **Wie ein App-Wächter in der Suite wirklich läuft.** Der Workflow der Suite
  fährt `npm run test --workspaces` und `npm run lint --workspaces`. Ein Lauf
  fährt also genau dann mit, wenn das `test`-Skript **seiner App** ihn aufruft
  — nicht, wenn er in der vendorierten Workflow-Kopie steht.
* **Behoben.** `scripts/ci-runs-every-check.mjs` prüft jetzt zusätzlich jede
  App unter `apps/`: jeder Lauf in Namensform `*:check` (und die übrigen
  Prüf-Formen) muss von deren `test`/`lint` aus erreichbar sein — **transitiv**
  gerechnet, damit eine App ihre Kette bündeln darf —, oder in `APP_OHNE_CI`
  mit Grund stehen. Die 13 erreichbaren Läufe hängen jetzt an den
  `test`-Skripten ihrer Apps; **vier** stehen als erklärte Ausnahme: dreimal
  `actions:check` (prüft die inerte Workflow-Kopie; der `actions:check` der
  Suite deckt die Workflows ab, die feuern) und `cable-planner/ui:smoke`
  (braucht Electron-Binary und X-Server, die der Haupt-Job nicht hat; der
  eigene Smoke-Job der Suite deckt dieselbe Frage ab).
* **Gegengeprobt, sechsmal** — ein Wächter, den keine Gegenprobe rot bekommt,
  ist eine Behauptung: Lauf aus dem `test` genommen (rot), Ausnahme gelöscht
  (rot), Ausnahme steht obwohl der Lauf hängt (rot, „überflüssig"),
  Begründung unter 40 Zeichen (rot), Ausnahme nennt einen Lauf, den es nicht
  gibt (rot), und der Scan zeigt auf ein Verzeichnis ohne Apps (rot, beide
  Untergrenzen einzeln nachgewiesen).
* **Die Regel fürs nächste Mal:** ein vendorierter Wächter ist erst
  angekommen, wenn `npm run ci:complete` der Suite ihn als erreichbar meldet.
  „Die Datei ist da" und „der Lauf fährt" sind zwei Tatsachen, und das
  Vendoring liefert nur die erste.


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
| ~~E-11~~ | ~~Soll der Cross-Link bis **in** die eingebetteten Planer reichen?~~ | **entschieden 2026-09-08: JA — und der gemeinsame Id-Raum wird nicht neu erfunden, sondern ist der des Seed-Protokolls.** Der Einwand dieser Zeile („braucht einen gemeinsamen Id-Raum") ist seit E-22 gegenstandslos: `suite-seed` fährt bereits Objekte mit Ids zwischen Shell und eingebettetem Planer, und jede App bildet sie auf ihr natives Modell ab. Der Sprung benutzt dieselben Ids wie der Seed; wo eine App ein Objekt nicht kennt, wechselt sie das Modul und sagt, dass sie es nicht gefunden hat — sichtbar, statt stumm irgendwo zu landen. Ein zweiter Id-Raum wäre die zweite Wahrheit, gegen die ADR-001 geschrieben ist. **GEBAUT 2026-09-08 in `suite#182`.** Gemessen davor: `avplan:navigate` war **deklariert und wurde von niemandem gesendet**, und die Shell warf sein `target`-Feld weg — sie wechselte nur das Modul. Der Querverweis reichte also weder aus einem Planer heraus noch in einen hinein. Jetzt: `avplan:reveal` (Shell → iframe, mit der SEED-Id) und `avplan:revealResult` (iframe → Shell, `found` plus Grund). Die Shell schickt die Bitte beim Auswählen eines Objekts in der Bibliothek — aber nur, wenn ein Planer offen ist; ist keiner da, sagt sie das, statt auf eine Antwort zu warten, die nie kommt. Alle drei Planer sind angeschlossen (`shellRevealBridge.ts` im Cable-Planer und in MultiCam, `useShellReveal.ts` im Licht-Planer, alle drei Suite-Overlays). **Kein Namensabgleich als Rückfallebene:** wer die Id nicht findet, sagt es, statt ein ähnlich heissendes Objekt auszuwählen (ADR-002) — der Nutzer sähe sonst ein anderes Gerät, ohne zu erfahren, dass geraten wurde. **Antworten wird dem Planer nicht überlassen:** `connectShellReveal` schickt die Antwort selbst, auch wenn das Suchen wirft; der Rückgabetyp `{ found, grund? }` ist die Stelle, an der die Auflage im Typsystem steht. `apps/shell/test/querverweis.test.ts` hält das fest, sieben Gegenproben, alle rot — zwei davon kamen zuerst grün zurück: die Gegenprobe lief gegen das gebaute `packages/ui/dist` statt gegen die Quelle, und die Prüfung auf „fragt nur bei offenem Planer" suchte nach der ERWÄHNUNG von `plannerActive` statt nach dem Ausstieg |
| ~~E-12~~ | ~~Wo wohnt Lexware architektonisch — Shell oder Planer?~~ | **entschieden 2026-09-08: eigene Shell-Domäne.** Buchhaltung ist keine Aufgabe eines Verkabelungsplaners — sie hängt am Projekt, nicht am Signalfluss, und sie ist für alle Module dieselbe. In der Shell gibt es sie einmal; im Planer gäbe es sie dreimal oder nur in einem, und die anderen zwei Module hätten keinen Beleg-Weg. Das löst zugleich B-19: die beiden Bedingungen, die sich heute gegenseitig ausschliessen (`connectShellLexware` hält sich im Nicht-Embedded-Fall heraus, der Handler braucht `window.cablePlanner`), verschwinden mitsamt dem Handler — der Beleg-Weg läuft dann im Hauptprozess der Shell, wo der Schlüssel ohnehin liegt |
| ~~E-13~~ | ~~Bleibt die Shell-Vorschau ein eigenständiges Übersichtsmodell?~~ | **entschieden 2026-09-08: JA, sie bleibt eigenständig — und wird als Vorschau KENNTLICH. GEBAUT am selben Tag** (`suite#169`, `PreviewNotice` in `shell/previews.tsx`, gerendert in `TabDeck`): ein Streifen über der Fläche mit drei Aussagen, die ADR-003 an dieser Stelle zusammen verlangt und die einzeln wertlos sind — das Etikett („Vorschau"), der STAND (Projekt-Version plus „ungespeichert"; ein Etikett ohne Datum ist keins) und der Weg in den Planer für das, was sie nicht zeigen kann. Nur bei zugewiesenem Projekt: ohne eines sagt `StandaloneHint` das schon, und zwei Hinweise übereinander heben einander auf. Ein Wächter (`vorschauIstKenntlich.test.ts`) hält die eine Aussage fest, an der die Entscheidung hängt — **wer eine Vorschau-Fläche rendert, rendert auch ihre Kennzeichnung** —, und ausdrücklich nicht, wie der Streifen aussieht: Text und Anordnung dürfen sich ändern, ohne dass eine Zusicherung fällt. Der Fehler, gegen den er steht, ist nicht „jemand baut den Streifen um", sondern „jemand baut eine ZWEITE Stelle mit Vorschau und vergisst ihn dort" — dieselbe Form wie B-35. Gegengeprobt, alle drei rot: Kennzeichnung entfernt · Kennzeichnung ohne Stand · kein Weg in den Planer.** Die Modelle zusammenzuführen hiesse, der Shell das vollständige Planer-Modell zu geben, damit sie ein Vorschaubild zeichnen kann; das ist der teuerste Weg zum kleinsten Nutzen und macht die Shell von jeder Modelländerung abhängig. Was die Vorschau falsch macht, ist nicht ihre Eigenständigkeit, sondern ihr Schweigen darüber: sie zeigt echte Daten in einem anderen Modell und sieht aus wie der Plan. Also bekommt sie, was ADR-003 in solchen Fällen verlangt — eine sichtbare Kennzeichnung samt Stand, und einen Weg ins Modul für alles, was sie nicht zeigen kann |
| ~~E-14~~ | ~~Welche Kategorien soll der Versions-Vergleich zeigen, und welche Felder machen darin eine Änderung aus?~~ | **entschieden 2026-09-08** (`light#95`): **alle vierzehn**, und die Felder sind die, die die Oberfläche ohnehin schon als Eigenschaft eines Objekts führt — da war nichts zu erfinden. Echt zu entscheiden gab es genau einen Fall, und der hat eine richtige Antwort: die Reihenfolge in `fixtureGroups.fixtureIds` bedeutet nichts, also wird **sortiert** verglichen; sonst meldete jede Umsortierung eine Änderung, und das ist derselbe Schaden wie der ursprüngliche Befund, nur andersherum. `layers`/`floor`/`sun` bekamen mit `diffSingle` ihre eigene Vergleichsform — sie sind keine Listen, haben also kein `id`-Paar, sondern genau ein Vorher und ein Nachher. Gegen ein Wiederauftreten steht `ALLE_KATEGORIEN` als einzige Liste (`satisfies` gegen die Schlüssel von `ProjectDiff`) plus ein Rest-Test in `unnamedDifferences`: ein neues Feld im Projekt, das niemand in den Vergleich aufnimmt, meldet sich selbst |
| ~~E-15~~ | ~~Wie sieht das **Abbrechen** eines Lager-Imports aus?~~ | **entschieden 2026-09-08: Vorschau-Schritt** — dieselbe Bauform wie beim Ablauf-Import (`suite#142`), der genau diese Frage schon beantwortet hat: es gibt genau EINEN Weg an die Daten, und der führt über eine bestätigte Vorschau. Der Drei-Wege-Dialog scheidet aus, weil er fragt, bevor der Nutzer sehen kann, worüber er entscheidet („zusammenführen oder ersetzen?" ist ohne die Liste der betroffenen Positionen nicht beantwortbar). Ein Undo für den Lager-Store scheidet aus, weil der Lagerbestand projektübergreifend ist: ein Rückgängig, das zwischen zwei Projekten wirkt, ist keine Aktion mehr, sondern eine Zeitreise. Das Zwischenmass aus `suite#154` (Escape und Hintergrund-Klick brechen ab, statt still zusammenzuführen) bleibt und wird von der Vorschau abgelöst |
| ~~E-16~~ | ~~Werden `PrintDialog` und `TitleBlock` **verdrahtet** oder **gelöscht**?~~ | **entschieden 2026-09-08: gelöscht.** Verdrahten hiesse, eine zweite Druckstrecke neben der zu betreiben, die es schon gibt — und ADR-004 hat für den Stempel genau eine Quelle festgelegt. Zwei Druckwege bedeuten zwei Stellen, an denen der Stempel fehlen kann; `cable#673` hat gezeigt, wie das ausgeht (der Weg, der „Drucken" hiess, war der eine ohne Stempel). 21 KB Code und 48 übersetzte Zeichenketten, die nichts rendern, sind ausserdem genau die Sorte Fund, die B-38 als „gebaut und nicht geliefert" führt. Was an `TitleBlock` inhaltlich fehlt und im gelieferten Weg nicht steht, wird DORT ergänzt, nicht nebenan |
| ~~E-17~~ | ~~Welche Sprache ist die Quellsprache von `sony-camera-bridge`?~~ | **entschieden 2026-09-08: ENGLISCH** — und zwar nach dem Bestand, nicht nach dem Wunsch: 140 englische Stellen gegen 32 deutsche. Die Oberfläche ist ein RCP-Dashboard für Technik, deren Vokabular ohnehin englisch ist (Iris, Gain, ND, Paint). 140 Stellen ins Deutsche umzuschreiben, um dann „Blende" neben `WB` zu setzen, kostet Arbeit und verschlechtert das Ergebnis. Siehe die Konvention unter E-20 |
| ~~E-18~~ | ~~Besetzt die Suite die **Zeitachse** — Ablauf/Rundown als Datenobjekt?~~ | **entschieden 2026-09-07: NUR LESEN.** Der Ablauf wird eingelesen und mit dem technischen Plan verknüpft, aber nicht hier geführt. Die Autorenschaft bleibt in der Tabelle, in der der Ablauf ohnehin lebt. Das teilt die elf anhängenden Bedarfe sauber: **erreichbar** sind 4 (Interoperabilität mit eben dieser Tabelle), 6 (die unordentliche Kundentabelle einlesen), 7 (aus einer Quelle in jedes Format rendern) und 8 (die Verknüpfung Ablauf ↔ technischer Plan — der Kern der Entscheidung). **WON'T, weil sie Autorenschaft brauchen:** 11 (Versionsstand und Änderungsprotokoll über Gewerke), 53 (den Rest automatisch nachziehen), 54 (geteilter Ablauf mit Spaltenrechten je Rolle), 56 (Ist-Zeiten mit einem Tipp erfassen). **Bleibt an anderer Frage hängen:** 45 (Weg vom Ablauf-INHALT zur Bedienoberfläche → E-23) und 10 (der Ablauf live an der Kamera — Verteilung zur Laufzeit, nicht Lesen). **Eigenständig:** 55 (Mehrtägigkeit und Parallelbühnen sind eine Frage des Projektmodells, nicht des Ablaufs). Diese Aufteilung gehört so in die Feature-Matrix — ein WON'T, das nur fehlt, wird beim nächsten Durchgang zum Kandidaten. **GEBAUT 2026-09-07 in `suite#142`**: Bedarf 8 und 6 ganz (`packages/ui/src/rundown.ts` — toleranter Tabellen-Leser, Spalten-Zuordnung, Vorschau mit benannten Übersprüngen, Verknüpfung über Objekt-IDs, `ref-missing` als Antwort auf „was entwertet diese Änderung"), Bedarf 7 ganz (`packages/ui/src/rundownViews.ts` — fünf Empfänger-Sichten als SPALTEN-AUSWAHLEN aus einer Quelle, Feld-Legende und Stand-Zeile im Blatt), Bedarf 4 **halb** (CSV/TSV steht, XLSX offen). Die Entscheidung „nur lesen" ist im Code durch Tests gesichert: es gibt keine Funktion, die einen Ablauf-Punkt anlegt, umsortiert oder seine Zeit setzt, und genau EINEN Weg, an einen Ablauf zu kommen — aus einer bestätigten Vorschau |
| ~~E-20~~ | ~~Welche Sprache ist die **Quellsprache** von `multicam-planner`?~~ | **entschieden 2026-09-08: ENGLISCH**, weil es das faktisch schon ist (482 Schlüssel in 14 Dateien mit deutschem Override) und eine Umkehr ~500 Zeichenketten anfasst, ohne dass ein Nutzer einen Unterschied sähe. **Und daraus die Konvention, die diese Zeile und E-17 gemeinsam beantwortet: die Quellsprache ist eine Eigenschaft des REPOS, nicht der Suite.** cable-planner und light-planner sind deutschsprachige Planungswerkzeuge und bleiben deutsch-quellig; multicam-planner und sony-camera-bridge sind englisch-quellig. Was NICHT bleibt, ist das Stillschweigen darüber: jedes Repo deklariert seine Quellsprache an einer Stelle, und ein Wächter hält sie fest — sonst „berichtigt" der nächste Durchgang die Abweichung und fasst 500 Zeichenketten an, weil `CLAUDE.md` an einer anderen Stelle etwas anderes nahelegt. **GEBAUT 2026-09-08** in `cable#778`, `light#99`, `multicam#113`, `sony#21` und `suite#177`: jedes Repo trägt `avplan.sourceLanguage` in `package.json` UND denselben Wert in Prosa (CLAUDE.md bzw. README), und ein Lauf je Repo (`npm run lang:check`) prüft die Übereinstimmung. Wo es Fallback-Texte gibt, MISST er zusätzlich: cable-planner 2202 deutsch / 0 englisch (fünf englische Fallbacks fielen dabei auf und wurden übersetzt), light-planner 329 / 0. Wo es keine gibt, sagt er das statt „bestanden" zu melden, und schaltet sich beim ersten Fallback selbst scharf (multicam). Im sony-camera-bridge misst er stattdessen den Sprachmix aus B-26 und deckelt ihn bei 19 — in beide Richtungen scharf. Die drei Planer führen denselben Klassifizierer in eigenen Kopien; `suite#177` hält sie mit `npm run lang:parity` zusammen, weil ein nachgetragenes mehrdeutiges Wort in EINER Kopie dort Fehlalarme macht und den Wächter kostet |
| ~~E-22~~ | ~~Wo wohnt die Zuordnung **Kamera → Bedienfeld → Multiviewer → Tally**?~~ | **entschieden 2026-09-07: ein geteiltes Objekt, alle lesen UND schreiben es, `@avplan` reicht es von einem zum anderen.** Damit trägt keiner der beiden Planer die Zuordnung allein, und keiner liest sie nur. Das Vehikel gibt es schon: das Seed-Protokoll (`packages/ui/src/seed.ts`, `suite-seed` v1) fährt über den postMessage-Bus zwischen Shell und eingebettetem Planer und trägt „nur Felder, für die die Shell eine Quelle hat"; die Abbildung auf das native Modell macht jede App selbst, „dort, wo ihr Modell und ihr Geräte-Katalog liegen". Die Zuordnung ist genau so ein Feld. **Was diese Antwort AUFWIRFT, und zwar sofort: E-21.** Solange nur einer schrieb, war „wer gewinnt" eine Randfrage; bei „alle schreiben" ist sie die erste. Ohne Regel überschreibt der zuletzt zurückmeldende Planer die Zuordnung des anderen — und zwar still, weil beide Seiten für sich vollständig aussehen. **E-21 ist damit nicht mehr offen, sondern blockierend:** die Implementierung von Bedarf 49 kann nicht beginnen, bevor die Konfliktregel steht |
| ~~E-23~~ | ~~Spricht die Suite eine **Show-Control-Sprache**?~~ | **entschieden 2026-09-08 vom Eigentümer: AUSGEHEND UND EINGEHEND; die Vokabel bleibt OSC.** Der ausgehende Teil ist unverändert der der Vorentscheidung: der Plan BENENNT je Ausspielziel eine OSC-Adresse bzw. Companion-Position und druckt sie, als Konfiguration. **Neu ist der eingehende Teil, und mit ihm die einzige Bedingung, die diese Entscheidung noch trägt** — sie hat sich vom Umfang auf die ANZEIGE verschoben und ist dort schärfer als vorher: was aus einer eingehenden Nachricht auf den Schirm kommt, ist eine EMPFANGSMELDUNG und nie ein Anlagenzustand. Also: „Cue 12 um 14:22:07 empfangen", mit Alter und Absender — nicht „Kamera 3 bereit", nicht grün/rot über der Anlage. Das ist dieselbe Regel, die ADR-003 für unbestätigten Zustand aufstellt, und sie ist hier der ganze Unterschied zwischen einer brauchbaren Mitschrift und der Entwarnung, für die dieses Repo keinen Beleg hat. **Dazu vier Auflagen für den Port:** er ist aus als Vorgabe, wird je Projekt eingeschaltet, lauscht auf einer Adresse, die der Nutzer nennt (nicht `0.0.0.0` als Vorgabe), und meldet sichtbar, wenn er nicht binden konnte — ein stiller Nicht-Empfang sieht aus wie „keine Cues", und das ist die Entwarnung durch die Hintertür. **Gegenrede (die frühere Fassung, gegen die entschieden wurde):** NUR AUSGEHEND. Die Bedarfs-Datenbank stellt die Massnahme unter eine Bedingung, die sich nicht wegrecherchieren lässt: *„do NOT build a live monitoring dashboard, which would make the suite responsible for a false all-clear"*. Wer Zustand anzeigt, haftet für die Entwarnung — und dieses Repo hat keinen Weg, eine Entwarnung zu verifizieren. **Warum die Umkehr damit vereinbar ist:** die Quelle verbietet ein *monitoring dashboard*, nicht das Zuhören. Empfangen und Anzeigen sind zwei Schritte; der Satz trifft den zweiten. Die Auflage oben verbietet genau den, den er verbietet. Dass Companion sich inzwischen auch AUSLESEN lässt (`CUSTOM-VARIABLE … GET-VALUE`, gemergt 2026-03-04), war schon in der Vorentscheidung vermerkt und ist jetzt der Weg, auf dem der eingehende Teil überhaupt etwas zu lesen bekommt. OSC, weil es die breiteste Anschlussfähigkeit hat. **GEBAUT 2026-09-08 in `cable#785`:** `renderer/types/showControl.ts` (Empfangsmeldung, Alter, Schema-Heilung), `main/services/oscListener.ts` (Socket; gelesen wird NUR die Adresse, die Argumente nur als Länge — eine falsch gelesene Zahl sähe aus wie eine Messung, dieselbe Überlegung wie bei Invariante 23), IPC-Bereich `showControl:*`, und das Empfangs-Panel ohne jede Ampelfarbe. Die vier Auflagen stehen im Code und nicht in der Prosa: `OSC_LAUSCHER_AUS` ist `{ aktiv: false, adresse: '' }`, der Lauscher hängt am Projekt statt an der App, `startOscListener` weist eine leere Adresse zurück, und er liefert IMMER einen Zustand — `nicht-gebunden` mit Grund eingeschlossen. `normalisiereOscLauscher` schaltet auch eine fremde `.avplan` ohne Adresse ab, statt deren Angabe zu glauben. `tests/oscEmpfang.test.ts` löst ausserdem zwei Sätze ein, die anderswo als Zusicherung standen (wer ein Feld `zustand` ergänzt, hat die Entscheidung umgedreht; die Mitschrift erreicht den Projekt-Speicher nicht). Acht Gegenproben, alle rot. **Offen bleibt** der Import eines Companion-Variablenstands als zweite Quelle. **Mit der Auflage aus der Recherche:** wo eine Companion-Adresse steht, schreibt das Blatt dazu, dass deren Schnittstelle opt-in ist — sonst zeigt der Plan einen Weg, den es beim Kunden nicht gibt |
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
