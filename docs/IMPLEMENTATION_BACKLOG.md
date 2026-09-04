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

### B-16 · Acht von dreizehn Suite-Tabs schalten nichts

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-9)
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
* **Aufwand:** klein (entfernen) / groß (ausbauen)

### B-17 · Die dokumentierte Dev-Einbettung trifft nie einen laufenden Planer

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-10)
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

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-11)
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

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-12)
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

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-13)
* **Befund (nachgeprüft 2026-09-04):** Die SVG-Vorschau
  (`apps/shell/src/shell/previews.tsx`) ist **kein** Platzhalter: jede Form
  wird aus dem übergebenen `SuiteProject` gerechnet — Knotenkarten aus
  Position und Name, Bezier-Kabel aus `from`/`to` mit Typ und Länge,
  FOV-Kegel aus `hfovDeg`, Heatmap-Radius aus `dimmerPct`. Auswahl ist mit
  Bibliothek und Eigenschaften-Panel bidirektional verdrahtet.
* **Zutreffend ist der andere Teil:** die Daten stammen aus
  `apps/shell/src/data/project.ts` — einem **shell-eigenen Parallelmodell**,
  nicht aus den eingebetteten Planern.
* **Schadensweg:** Der Nutzer verkabelt im eingebetteten Cable-Planer, klickt
  „Zur Übersicht" und sieht weiter die Demo-Verkabelung. Nichts an der
  Oberfläche sagt, dass das ein anderes Datenmodell ist.
* **Aufwand:** klein (kennzeichnen) / groß (zusammenführen)

---

### B-21 · Der Versions-Vergleich sieht 6 von 14 Kategorien

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-14)
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

### B-22 · Der Lager-Import kennt kein Abbrechen

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-15)
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
* **Ehrliches Zwischenmaß, falls die Entscheidung wartet:** Escape und
  Hintergrund-Klick dürfen nicht importieren. Solange es keinen dritten
  Ausgang gibt, ist „nichts tun" die richtige Bedeutung für beide Gesten.
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

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-16)
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

* **Status:** offen
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
* **Aufwand:** groß

### B-26 · `sony-camera-bridge`: eine Oberfläche, zwei Sprachen

* **Status:** offen (Entscheidung beim Eigentümer, siehe E-17)
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
| E-9 | Werden die acht wirkungslosen Tabs **entfernt** oder **ausgebaut**? | B-16 — Ausbauen heißt acht neue Views (Rack, 3D ×2, Heatmap-Report, Plan-Checks, Moodboard, 2D-Plan) |
| E-10 | Auf welcher Seite werden die Dev-Ports angeglichen? | B-17 — Planer auf 4181-4183 festnageln berührt cable-planners `dev:electron` und lights Screenshot-Skripte; die Shell umzustellen scheitert an der 5173-Kollision zweier Planer |
| E-11 | Soll der Cross-Link bis **in** die eingebetteten Planer reichen? | B-18 — braucht einen gemeinsamen Id-Raum zwischen Shell-Seed-Modell und den Planer-Projekten |
| E-12 | Wo wohnt Lexware architektonisch — Shell oder Planer? | B-19 — eigene Shell-Domäne (dann braucht Cable es nicht mehr) vs. Preload für den eingebetteten Planer |
| E-13 | Bleibt die Shell-Vorschau ein eigenständiges Übersichtsmodell? | B-20 — wenn ja, fehlt eine sichtbare Kennzeichnung; wenn nein, müssen die Modelle zusammengeführt werden |
| E-14 | Welche Kategorien soll der Versions-Vergleich zeigen, und welche Felder machen darin eine Änderung aus? | B-21 — betrifft acht heute unsichtbare Kategorien; `layers`/`floor`/`sun` sind keine Listen und brauchen eine eigene Vergleichsform |
| E-15 | Wie sieht das **Abbrechen** eines Lager-Imports aus — Drei-Wege-Dialog, Vorschau-Schritt oder Undo für den Lager-Store? | B-22 — heute importieren Escape und Backdrop-Klick still zusammenführend, und der Schreibvorgang ist nicht rücknehmbar |
| E-16 | Werden `PrintDialog` und `TitleBlock` **verdrahtet** oder **gelöscht**? | B-24 — 21 KB Code und 48 übersetzte Zeichenketten, deren Funktion es woanders schon gibt |
| E-17 | Welche Sprache ist die Quellsprache von `sony-camera-bridge`? | B-26 — davon hängt ab, ob 32 Stellen übersetzt oder 140 umgeschrieben werden |

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
| Erste CI + Tests für `pi-media-station` (B-12) | `pi-media-station#3` |
