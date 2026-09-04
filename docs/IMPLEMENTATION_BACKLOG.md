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

* **Status:** offen
* **Befund:** `npm run test:crdt` (Konvergenz) und `npm run test:signaling`
  existieren, sind aber nicht Teil des `verify`-Jobs. Kollaboration ist damit
  die am schlechtesten abgesicherte Funktion des größten Repos.
* **DoD:** beide im CI-Job, oder eine belegte Begründung im Workflow, warum
  nicht (Laufzeit, Flakiness) — dann aber mit Messwert.
* **Aufwand:** klein

---

## Hoch — Nahtstellen, an denen Arbeit verloren geht

### B-5 · Der Rückweg Suite → upstream hat keine Liste

* **Status:** offen
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
* **Aufwand:** mittel (Recherche, kein Code)

---

## Niedrig

### B-12 · `pi-media-station` und `tally-pi` ohne Tests

* **Status:** offen
* **Befund:** Beide Python-Repos haben keine Tests; `tally-pi` prüft in CI nur
  die Syntax. Die reinen Funktionen darin (Adress-Ableitung, Zustandslogik)
  wären ohne Hardware testbar.
* **Aufwand:** mittel

### B-13 · `light-planner`: Sprachschalter ist upstream nicht erreichbar

* **Status:** offen
* **Befund:** Die i18n-Infrastruktur existiert, aber `setLanguage` wird nur in
  `src/components/MenuBar.tsx:77` aufgerufen — und **diese Datei importiert
  niemand**; `App.tsx` rendert `TopBar` + `ToolRail`. Das Drift-Skript der Suite
  führt `components/MenuBar.tsx` selbst unter `DEAD_UPSTREAM`.
* **Folge:** Weitere Strings zu übersetzen ändert nichts, was ein Nutzer sehen
  kann. **Erst den Schalter erreichbar machen, dann übersetzen** — die
  umgekehrte Reihenfolge wäre Arbeit ohne Wirkung.
* **Aufwand:** klein (Schalter), mittel (Abdeckung)

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
| Vier zu pessimistische Roadmap-Zeilen berichtigt | `suite#60` |
