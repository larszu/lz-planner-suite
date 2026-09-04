# Implementierungs-Backlog — AV Planner Suite

**Stand: 2026-09-04.** Gegenstück zu
[`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md): dort steht, was ist —
hier, was fehlt.

**Fortschreiben, nicht überschreiben.** Erledigte Punkte werden abgehakt und
mit dem PR belegt, statt gelöscht zu werden; die Historie der Fehleinschätzungen
ist selbst ein Ergebnis.

**Sortierung: nach echtem Nutzerschaden, nicht nach Aufwand.**

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

* **Status:** offen (Entscheidung beim Eigentümer)
* **Befund:** Der Datenvertrag stimmt und ist getestet — `toTallyPiDevices`
  liefert `{id, name, input}`, `gpio_watcher.py:79` setzt `me` selbst auf 1,
  `guide_server.py:251` fängt `out_gpio`/`gpio` ab. Aber:
  `ExportDialog.tsx:1299` erzeugt eine **Download-Datei**, die jemand von Hand
  nach `/opt/pi-guide/tally.json` kopieren muss.
* **Warum das zählt:** Genau der Medienbruch, gegen den der Auftrag angetreten
  ist („fewest media breaks").
* **Offene Frage an den Eigentümer:** Soll der Planer den Pi direkt beliefern
  (HTTP-POST an `guide_server.py`), oder bleibt die Datei bewusst der Weg, weil
  der Pi im Produktionsnetz nicht erreichbar sein soll? **Das ist eine
  Netz-/Betriebsentscheidung, keine Codefrage.**
* **DoD (falls Direktweg gewünscht):** Endpunkt in `guide_server.py`,
  Token-geschützt wie der Mobile-Share; Planer-seitig ein Ziel in den
  Einstellungen; Fehlerfall sichtbar; End-to-End-Prüfung.
* **Aufwand:** mittel

### B-7 · Intercom-Vokabular existiert zweimal

* **Status:** offen (Entscheidung beim Eigentümer)
* **Befund:** `GreenGoConfig` lebt in `cable-planner`,
  `Broadcast-intercom/packages/shared/src/index.ts` (437 Zeilen, 33 Exporte)
  führt dasselbe Feld unabhängig. Kein gemeinsames Paket, kein Intercom-Slot in
  `.avplan`.
* **Offene Frage:** gemeinsames Paket mit zwei Adaptern, oder `GreenGoConfig`
  als Wahrheit? Die Antwort entscheidet auch, ob `.avplan` einen vierten Slot
  bekommt.
* **Aufwand:** groß

---

## Mittel — benannte Teilstücke

### B-8 · Herstellerneutrales Intercom-Austauschformat

* **Status:** offen
* **Befund:** Der Green-GO-Round-Trip ist seit `cable#653` verlustfrei (Preset
  überlebt inkl. `ButtonFunctions`). Ein **herstellerneutrales** Format fehlt —
  die Lücke, die das Segment-Dossier als „no interchange format from anyone"
  führt.
* **Aufwand:** groß

### B-9 · Plan ↔ As-built für die Verkabelung

* **Status:** offen (hängt an einer Eigentümer-Entscheidung)
* **Befund:** Für den **Gerätezustand** existiert der Abgleich
  (`lib/atemLiveCompare.ts`, genutzt in Audio-Router- und MV-Dialog). Für die
  **Verkabelung** gibt es die Datenspur (`checkState.ports`, seit `cable#654`
  auch im Plan-Fingerabdruck), aber keine Gegenüberstellung Soll-Kabel gegen
  gesteckte Ports.
* **Offene Frage:** Wo wohnt der As-built-Zustand — eigene Spur je Feld, oder
  Plan-Überschreiben mit Revisionen? Entscheidet, ob `Provenance` einen fünften
  Wert braucht.
* **Aufwand:** groß

### B-10 · Delivery-/Streaming-Kette

* **Status:** offen
* **Befund (korrigiert 2026-09-03):** Die Roadmap führte „nur Katalog-Treffer,
  kein Signalfluss-Modell" — das war falsch. NDI, NDI-HX, Dante, AES67 und
  ST2110-20/30/40 sind vollwertige `SignalStandard`-Mitglieder mit Bandbreite
  und Impedanz, samt Netz-Budget und drei Plan-Prüfungen. **Was wirklich fehlt,
  ist die Delivery-Hälfte:** SRT, RTMP, HLS, CDN kommen im Quelltext nirgends
  vor.
* **Aufwand:** groß

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
  **sechsmal 0**.
* **Aufwand:** mittel (Recherche, kein Code)

---

### B-15 · `EquipmentItem.powerWatts` ist ein Schreib-nur-Feld

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-8)
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
* **Aufwand:** klein (Doku) + Entscheidung

---

## Niedrig

### B-12 · `pi-media-station` und `tally-pi` ohne Tests

* **Status:** offen
* **Befund:** Beide Python-Repos haben keine Tests; `tally-pi` prüft in CI nur
  die Syntax. Die reinen Funktionen darin (Adress-Ableitung, Zustandslogik)
  wären ohne Hardware testbar.
* **Nachgeprüft 2026-09-04:** weiterhin offen. `find` nach `test_*.py`,
  `*_test.py` und einem `tests/`-Verzeichnis findet in **beiden** Repos nichts.
* **Aufwand:** mittel

### B-13 · `light-planner`: Sprachschalter ist upstream nicht erreichbar

* **Status:** offen
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

---

## Nicht zu entscheiden ohne den Eigentümer

Diese Punkte sind **bewusst offen** und werden nicht nebenbei entschieden. Sie
sind im Code jeweils durch einen Test oder Kommentar als Entscheidung sichtbar
gehalten, nicht als Versäumnis:

| # | Frage | Was davon abhängt |
| --- | --- | --- |
| E-1 | Trägt ein vom Modell erfundenes **Kabel** eine Kennzeichnung? `Cable` hat kein `specSource` | eine erfundene Verbindung behauptet mehr als eine erfundene Port-Zahl |
| E-2 | Intercom-Vokabular: gemeinsames Paket oder `GreenGoConfig` als Wahrheit? | vierter `.avplan`-Slot (B-7) |
| E-3 | Soll der Techniker vor Ort den **Anlagen-Pincode** über die Mobile-Ansicht bekommen? | `cable#656` hat das Leck geschlossen, die Workflow-Frage nicht beantwortet |
| E-4 | Wo wohnt der **As-built-Zustand**? | B-9, fünfter `Provenance`-Wert |
| E-5 | Woher kommen **Subnetze** — abgeleitet oder projektweiter Pool? | Initiative 8 |
| E-6 | Was zählt als **Beleg** für einen Steckertyp / eine Funkkomponente? | B-11 |
| E-7 | Liefert der Planer den Pi **direkt** oder bleibt die Datei der Weg? | B-6 |
| E-8 | Soll importierte Rentman-Leistung (`powerWatts`) in die Stromrechnung eingehen? | B-15 — ändert die Gesamtlast bestehender Pläne von 0 W auf einen echten Wert |

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
