# Implementierungs-Status — AV Planner Suite

**Stand: 2026-09-04.** Erhoben durch **Ausführung**, nicht durch Lesen von Plänen:
jede Zeile in Abschnitt 2 ist ein tatsächlich gelaufener Befehl mit seinem
Exit-Code. Wo etwas nur aus dem Quelltext gelesen wurde, steht es dabei.

Dieses Dokument wird **fortgeschrieben, nicht überschrieben.** Wer eine Zeile
ändert, ändert sie mit Beleg.

---

## 0. Warum es dieses Dokument gibt

Bis hierher gab es den Stand nur verstreut: in Commit-Titeln, in
`docs/research/synthesis/FEATURE-STRATEGY.md` (Abschnitt 3b), in ADR-Texten und
in Testnamen. Diese Quellen sind an mehreren Stellen **älter als das
Repository** gewesen — am 2026-09-03 hielten vier Zeilen der Roadmap-Tabelle
der Nachmessung nicht stand, und zwar alle vier in dieselbe Richtung: zu
pessimistisch. Ein zentraler, aus der Ausführung erhobener Stand ist die
Antwort darauf.

**Maßstab.** „Code vorhanden" ist nicht „fertig". Verwendete Stufen:

| Stufe | Bedeutung |
| --- | --- |
| `COMPLETE` | verdrahtet, persistiert (wo nötig), durch Test/Zusicherung abgedeckt |
| `IMPLEMENTED` | verdrahtet und funktionsfähig, aber ohne Test |
| `PARTIAL` | Kernweg vorhanden, benannte Teilstücke fehlen |
| `PROTOTYPE` | läuft, erkennbar nicht produktionsreif |
| `UI_ONLY` | Oberfläche vorhanden, dahinter passiert nichts Echtes |
| `PLACEHOLDER` | Stub/TODO, der so tut als gäbe es die Funktion |
| `PLANNED` | nur in Doku/Kommentar vorgesehen, kein Code |
| `MISSING` | vorgesehen, nirgends vorhanden |
| `BROKEN` | vorhanden, nachweislich defekt |

---

## 1. Die acht Repos

| Repo | Version | Umfang | CI |
| --- | --- | --- | --- |
| `cable-planner` | 8.3.2 | ~123.000 LOC, Electron 3-Prozess | 6 Workflows |
| `multicam-planner` | 4.3.2 | ~21.800 LOC | 2 Workflows |
| `light-planner` | 1.0.0 | ~15.800 LOC | 2 Workflows |
| `av-planner-suite` | 1.0.0 | Shell + 4 Pakete + 3 vendorte Planer | 2 Workflows |
| `Broadcast-intercom` | 0.1.0 | ~7.250 LOC (server/web/shared/companion) | 1 Workflow (neu) |
| `sony-camera-bridge` | 1.0.0 | ~11.500 LOC | 1 Workflow (neu) |
| `tally-pi` | — | 2.978 LOC Python, 5 Module | 1 Workflow (`verify.yml`: compileall + `bash -n` + Unit-Tests) |
| `pi-media-station` | — | 638 LOC Python + Electron-Manager | 1 Workflow (`verify.yml`: Deps + compileall + `bash -n` + Unit-Tests) |

---

## 2. Ausführungs-Nachweis (2026-09-04)

Alle Angaben sind Exit-Codes echter Läufe, nicht gefilterte Ausgabe. (Diese
Unterscheidung ist nicht akademisch: am 2026-09-03 wurde ein roter CI-Lauf
übersehen, weil die lokale Prüfung durch ein `grep` lief, das die
Fehlerzeile gar nicht treffen konnte.)

| Repo | build | typecheck | lint | Tests |
| --- | --- | --- | --- | --- |
| `cable-planner` | **0** | **0** (`tsc -p tsconfig.app.json`) | **0 Fehler** (10 Warnungen) | **0** — 1011 Tests + 4 übersprungene in 104 Dateien (die vier laufen nur in der vendorierten Kopie) |
| `multicam-planner` | **0** | in `build` enthalten | **0 Fehler** (49 Warnungen) | **0** — 396 Tests in 29 Dateien |
| `light-planner` | **0** | in `build` enthalten | **0 Fehler** (49 Warnungen) | **0** — 12 Tests + 4 Format-Checks (`avplan`, `venue`, `mvr`, `spec`) |
| `av-planner-suite` | **0** | in `build` enthalten | — | **0** — 36 Shell + 45 Pakete |
| `Broadcast-intercom` | **0** (nach `npm install`, 224 Pakete) | — | — | **0** — **38 Smoke-Tests gegen einen laufenden Kern** |
| `sony-camera-bridge` | — | — | — | **0** — 18 Tests (node:test) in zwei Workspaces: `bridge` 11, Companion-Modul 7 |
| `tally-pi` | `py_compile` OK für alle 5 Module | — | — | **0** — 55 Tests (`python -m unittest discover -s tests`) |
| `pi-media-station` | `py_compile` OK für alle 3 Module | — | — | **0** — 21 Tests (`python -m unittest discover -s tests`) |

### Die elf Suite-Guards

Alle mit Exit 0 gelaufen:

| Guard | Befehl | Ergebnis |
| --- | --- | --- |
| Herkunfts-Vokabular | `npm run spec:vocab` | 3 Feld-Kopien, 2 Helfer-Kopien gleich |
| Feature-Erreichbarkeit | `npm run features:reachable` | 2 vendorte Kopien erreichbar |
| Doku-Auffindbarkeit | `npm run docs:reachable` | 68 Dokumente, alle von einer Einstiegsseite aus erreichbar |
| Native Dialoge | `npm run dialogs:native` | 663 Dateien, 0 Treffer — Muster seit B-1 vollständig |
| Lizenz der vendorten Apps | `npm run licence:check` | alle Kopien tragen die Lizenz der Suite |
| Laufzeit-Abhängigkeiten im Paket | `npm run deps:check` | jeder nackte Import des mitverpackten Main-Prozesses steht in `apps/shell/package.json` |
| Baubare Release-Artefakte | `npm run release:check` | 2 darwin-Prebuilds gedeckt, keytar bleibt für `lipo`, 3 Ziele mit eigenem Dateinamen |
| Node-Version der Actions | `npm run actions:check` | 5 Action-Referenzen, alle node24 |
| Headless-Smoke der App | `npm run ui:smoke` | Fenster öffnet, 3 Planer-Protokolle liefern, 12 IPC-Module registrieren |
| Vollständigkeit der Guard-Liste | `npm run ci:complete` | 11 von 11 Prüf-Läufen stehen im Workflow |
| Planer-Drift | `npm run drift:check` | unverändert gegen die Baseline (Zahlen: `scripts/planner-drift-baseline.json`) |

`ui:smoke` ist der erste Lauf, der die Suite überhaupt **startet**. Zwischen
`npm run build` und dem Installer hat das bis 2026-09-05 nichts getan — und
genau in dieser Lücke lagen die Release-Fehler dieser Woche. Gemessen am
laufenden Programm: das Fenster öffnet, alle drei `planner-*://`-Protokolle
liefern Inhalt, und mit `SUITE_NATIVE_CABLE=1` registrieren alle zwölf
IPC-Module von Cable.

Der Lauf ruft zusätzlich `signaling:start` und `lexware:ping` über die echte
Cable-View auf, und das ist kein Zierrat: die beiden Pakete aus dem
`deps:check`-Befund verhalten sich verschieden. `@avplan/lexware-core` hängt an
einem statischen Import und fehlt schon beim Registrieren; **`ws` nicht** —
`signalingServer.js:133` lädt es erst beim Start des Relays. Gegengeprobt: mit
entferntem `ws` registrieren alle zwölf Module klaglos, und der Fehler fällt
erst beim Klick auf „Zusammenarbeit starten". Ohne den Aufruf wäre der Smoke-Test
an genau der Lücke vorbeigelaufen, für die es ihn gibt.

Nebenbefund aus demselben Lauf: der native Cable-Modus hängt an
`SUITE_NATIVE_CABLE=1` und ist **per Default aus**. Im ausgelieferten Build
läuft also weder `cableHost` noch irgendein Cable-IPC-Modul, solange die
Variable nicht gesetzt ist — die Planer laufen dort über den iframe-Pfad.

`actions:check` ist am selben Tag aus derselben Form entstanden: die Workflows
liefen fast vollständig auf dem abgekündigten Node 20, und die Kommentare
daneben begründeten das mit einem Stand von Mai 2026, den es nicht mehr gab —
der Satz war nicht bloß veraltet, er war der Grund, nicht nachzusehen. Der Guard
fragt deshalb die `action.yml` jedes Pins, statt eine Liste zu führen, und folgt
eine Ebene in Composite-Actions hinein: `upload-pages-artifact@v3` trug node20
nur im Inneren.

Dabei fiel auf, dass `ci:complete` sich von einem **Kommentar** besänftigen
ließ, der `npm run <lauf>` bloß erwähnte — der Lauf wäre bei keinem Merge
gefahren. Der Text wird jetzt ohne reine Kommentarzeilen gelesen.

Zwei weitere Funde kamen aus dem Vendoring selbst, und beide sind der Grund,
warum die Guards mitwandern:

- Der mitvendorierte `macUniversalBuild`-Test bildete den Paketpfad über
  `relative(ROOT/node_modules, …)`. Im Monorepo sind die Abhängigkeiten an die
  Wurzel gehoistet — der Pfad begann mit `../../..`, und der Guard meldete am
  **selben** Code etwas anderes als upstream. Behoben upstream
  (`cable-planner#696`) und nachvendoriert: der Pfad kommt jetzt vom letzten
  `node_modules`-Segment an.
- Die vendorierten `.github/workflows/` der drei Planer standen still. Sie
  laufen im Monorepo nicht, und der Drift-Guard sieht `.github/` überhaupt
  nicht an — deshalb hat es nie jemand gemerkt: `mac-build.yml` lag hier noch,
  obwohl `cable#694` sie gelöscht hat, und alle drei `release.yml` waren auf
  node20. Der erste Lauf des mitvendorierten `actions:check` hat genau das
  gemeldet. Jetzt eins zu eins von upstream, `mac-build.yml` entfernt.

`release:check` ist am 2026-09-05 aus einem Schaden entstanden, nicht aus einer
Vermutung: Tag `v0.1.0` hat **nichts** ans Release gehängt. Der
macOS-Universal-Merge brach an einer in beiden Teil-Builds identischen
Prebuild-Datei ab und riss über `needs: build` die längst fertige Windows-`.exe`
mit; unabhängig davon schrieben NSIS und Portable auf denselben Dateinamen, so
dass im Release ohnehin nur eine der beiden `.exe` gelegen hätte. Beides ist vor
dem Bauen entscheidbar — deshalb entscheidet es jetzt die CI und nicht der
nächste Tag.

### `Broadcast-intercom`: der aussagekräftigste Einzelbefund

Das Repo hat **keine CI** und galt damit als am wenigsten belegt. Gemessen ist
das Gegenteil der Fall: nach `npm install` baut es sauber, und
`scripts/smoke-test.mjs` fährt gegen einen laufenden Kern **38 Prüfungen, alle
grün** — REST-API, Companion-Control-Endpunkt, WebSocket-Protokoll, PTT mit
Auto-Release nach `ActiveTime`, Direktruf mit temporärem Kanal, Anlegen und
Löschen von Kanälen/Gruppen/Nutzern/Geräten.

Der Kern ist also **nicht** Gerüst. Was fehlt, ist nicht Funktion, sondern
**Automatisierung**: diese 38 Prüfungen laufen nie von selbst.

---

## 3. Status je Bereich

### 3.1 `cable-planner` — Kern des Systems

| Bereich | Status | Beleg |
| --- | --- | --- |
| Projekt-Persistenz (`project:*`) | `COMPLETE` | `ipc/projectIpc.ts` schreibt über `atomicWriteFile` (tmp → .bak → rename); Schema-Migration `healProjectPositions` läuft auf jedes geladene Projekt |
| Bibliothek (`library:*`) | `COMPLETE` | `ipc/libraryIpc.ts:168` atomar |
| Dokument-Protokoll | `COMPLETE` | `services/documentLog.ts:105/111` atomar |
| Geheimnis-Filter beim Export | `COMPLETE` | `util/stripSecrets.ts`, 10 Tests; `SECRET_KEYS` **und** `OPAQUE_KEYS` (Hersteller-Rohdokumente gehen als Ganzes nicht mit) |
| Dokument-Stempel + Register | `COMPLETE` | `lib/documentStamp.ts`, `lib/documentRegistry.ts`; Aufbaustand im Fingerabdruck (`cable#654`) |
| Adressplan (Initiative 8) | `COMPLETE` | `cable#701`; `lib/addressPlan.ts` leitet aus den Ports ab, welches Geraet eine Adresse braucht, und liefert den Beleg mit. Fuenf nachrechenbare Befunde, keine Vermutungen. Vergibt bewusst KEINE Adressen (E-5 offen) -- ein Test haelt das fest |
| Dokument-Stempel in den anderen beiden Planern | `COMPLETE` | ADR-004 Inkrement 4. `light#70`: alle vier Ausdrucke (Instrument Schedule, Geraeteliste, Farbliste, Plan-PDF), Abweichung gegen den juengsten Versions-Schnappschuss, Guard `stamp:check`. `multicam#91`: Kamerakarte und Storyboard (PNG wie Druck), ohne Revisions-Behauptung, weil `projectVersion` Aenderungen zaehlt statt Staende festzuschreiben; 22 Tests. Die drei Kopien haelt `stamp:parity` in der Suite gegeneinander — ausgefuehrt, nicht textverglichen |
| Änderungs-Auswirkung | `COMPLETE` | `lib/changeImpact.ts`, `lib/planDiff.ts`, Vergleich auch gegen festgeschriebene Revision (`cable#655`) |
| Tally-Datenvertrag | `COMPLETE` | `lib/tallyMap.ts` + `tests/tallyMap.test.ts`; Felder decken sich mit `gpio_watcher.py:79` (`me` fällt bewusst weg, dort Default 1) |
| Weg vom Plan auf die Geraete (B-41) | `COMPLETE` | Alle vier Runtime-Anwendungen sind angeschlossen oder ausgewiesen: Tally (`suite#99`, POST an den Pi mit Abgleich davor), Kamerasteuerung (`sony-camera-bridge#14`, `camera-list` gegen die Slots — mit Beleg je Zuordnung, eindeutig oder gar nicht), Intercom (`Broadcast-intercom#9`, `avplan-intercom` zusammengefuehrt statt ersetzt), Medien-Station (Befund: Bestand statt Konfigurationsziel — der Plan kennt keinen Inhalt fuer Sensor-Zonen) |
| Green-GO Round-Trip | `PARTIAL` | Preset überlebt den Export inkl. `ButtonFunctions` (`cable#653`); ein **herstellerneutrales** Austauschformat fehlt (B-8) |
| Rolle besitzt die Ziel-Labels | `COMPLETE` | `cable#682`; ein Umbenennen der `SourceIdentity` erreicht jetzt auch ATEM-Lang-/Kurzname und die Videohub-Labels — vorher nur UMD, `.avsourcemap` und Tally-CSV, also gerade nicht die zwei Systeme, in die der Name sonst von Hand getippt wird. `roleLabelsByPort` liefert die eine Aufloesung fuer Ableitung und beide Exporter; ein Guard faengt einen neuen Ausgabeweg, der sie nicht liest |
| Ausspielweg (SRT/RTMP/HLS) | `PARTIAL` | `cable#683`; die drei sind vollwertige Signal-Standards mit Bandbreite und zaehlen als **Last** im Netz-Budget, dazu ein Katalog-Kabel. Vorher kam die ganze Delivery-Haelfte im Quelltext nicht vor. Offen: CDN-Modell, ABR-Leiter, Ausspiel-Ziele als Geraetetyp (B-10) |
| Mobile-Share (LAN) | `IMPLEMENTED` | `services/mobileShareServer.ts`, Token pro Sitzung auf allen Schreibwegen; keine automatisierte End-to-End-Prüfung |
| Kollaboration (CRDT/Signaling) | `IMPLEMENTED` | `test:crdt` und `test:signaling` laufen seit `cable#658` in CI; der WebRTC-/Cross-Maschine-Teil bleibt ungeprüft (braucht echte Geräte) |
| Leistungsberechnung | `COMPLETE` | eine Kette in `lib/equipmentSelectors.ts` seit `cable#668`; vorher vier Kopien, von denen zwei den aktiven Betriebsmodus nicht kannten — zu niedrig rechnete ausgerechnet der Stromrechner, aus dessen Summe Phasenverteilung, Generator-kVA und USV-Laufzeit kommen. Guard: `tests/effektiveLeistung.test.ts` |
| Tastenkürzel-Oberfläche | `COMPLETE` | `cable#669`; `Strg+P`/`Strg+A` standen in der Hilfe ohne jeden Handler, `selectAll` und `jumpToPatches` sind jetzt echt gebunden. Zwei Aktionen bleiben bewusst ohne Handler, mit Grund im Guard `tests/tastenkuerzelStimmen.test.ts` |
| Custom-Palette | `COMPLETE` | `cable#669`; zwei der drei Regler waren immer verdrahtet (Canvas + jeder Export), der dritte (`accent`) wurde gespeichert und von nichts gelesen — entfernt statt mit erfundener Bedeutung gefüllt. Guard: `tests/customPaletteWirktWirklich.test.ts` |
| Fenster-/MRU-Zustand | `IMPLEMENTED` | bewusst **nicht** atomar (`main/index.ts:135`, `ipc/projectIpc.ts:37/46`) — beide Leser sind vollständig defensiv und fallen auf Default zurück; kein Nutzerdaten-Pfad |

### 3.2 `av-planner-suite` — Schale und Konsolidierung

| Bereich | Status | Beleg |
| --- | --- | --- |
| Vendoring der drei Planer | `IMPLEMENTED` | `apps/*`, Drift CI-bewacht, Baseline mit `upstreamSha` (Stand: `scripts/planner-drift-baseline.json`) |
| Drift-Guard | `COMPLETE` | `scripts/planner-drift.mjs`; `--write-baseline` verweigert bei offener uncarried-Liste (`suite#61`) |
| Herkunfts-Vokabular-Guard | `COMPLETE` | `scripts/spec-source-vocabulary.mjs`, in CI |
| Feature-Erreichbarkeits-Guard | `COMPLETE` | `scripts/reachable-features.mjs`, in CI; nennt ausdrücklich, was er **nicht** prüft |
| Native-Dialoge-Guard | `COMPLETE` | `scripts/native-dialogs.mjs`; seit B-1 beide Schreibweisen, Zeichenketten geleert, Gegentest über alle sechs Formen |
| Geteilte Pakete | `IMPLEMENTED` | `inventory-core`, `lexware-core`, `onboarding-core`, `ui`; 45 Tests |
| Versionen & Vergleich (light) | `PARTIAL` | Sichern, Vergleichen und Wiederherstellen sind echt; die Identität ist seit `light#57` stabil, Grundriss und Fremd-Domänen überleben seit `light#58`. Offen: der Vergleich sieht 6 von 14 Kategorien (B-21) |
| Tab-Leiste (13 Tabs) | `PARTIAL` | eigene Views sind echt (`OverviewSurface`, `BoardCanvas`, `previews.tsx`), aber der Tab-**Wechsel** ist ein No-Op: `activeTab` kommt an vier Stellen vor, alle vier nur Anzeige (B-16) |
| Cross-Link Planer → Shell | `MISSING` | `avplan:navigate` existiert dreimal: Empfänger, Typ, Build-Artefakt. Kein Sender, und im Bus fehlt der `post*`-Helfer, den Theme/Settings/Command/Lexware alle haben (B-18) |
| Shell-Oberflaeche zweisprachig | `IMPLEMENTED` | 601 Woerterbuch-Eintraege, 438 erreichbare Schluessel — seit `suite#73` hat **jeder** eine englische Fassung. Vorher fehlten 21, darunter der komplette Projekt-Hub (14): wer auf Englisch stellte, bekam die Projektverwaltung auf Deutsch. Der vorhandene i18n-Test prueft seither Abdeckung statt nur Mechanik |
| Sprachumschaltung Shell → `cable-planner` | `IMPLEMENTED` | Der Sprachschalter sitzt im Planer selbst (Einstellungen → Darstellung). Seit `cable#671` hat **jeder erreichbare Schluessel** eine englische Fassung: 451 englische Zeilen lagen im DEUTSCHEN Woerterbuch (Block „auto-merged") und machten beide Sprachen falsch; dazu 58 neuere Schluessel uebersetzt. `tests/i18nErreichbarkeit.test.ts` haelt es fest |
| Sprachumschaltung Shell → `multicam-planner` | `PARTIAL` | Die Suite-Kopie ist zweisprachig (479 deutsche Overrides, Englisch als Quelle); **upstream gibt es gar keine i18n** — wer dort Englisch waehlt, bekommt Deutsch (B-25). Drei Schluessel trugen deutschen Text als englische Quellsprache, seit `suite#73` behoben. **Der Rueckweg haengt an einer Entscheidung** (E-20): die Suite-Kopie fuehrt Englisch als Quellsprache, `cable-planner` und `light-planner` fuehren Deutsch. Ein Rueckweg "so wie es ist" traegt die umgekehrte Konvention upstream; die Richtung spaeter zu drehen heisst ~500 Zeichenketten erneut anfassen |
| Sprachumschaltung Shell → `light-planner` | `IMPLEMENTED` | Kette vollstaendig: `SettingsModal.tsx:124` → `App.tsx:450` (`{ …, language }`) → `PlannerFrame` → `shellSettings.ts:51` → `uiStore`. Seit `suite#71` haben alle **563** erreichbaren Schluessel eine englische Fassung, `i18n:check` haelt das in CI fest. Bis dahin bekam ein englischer Nutzer den ganzen Lager-Dialog auf Deutsch. Seit `suite#72` ruft **jede** gerenderte Komponente `t()` auf — B-23 erledigt, **711** Schluessel abgedeckt, `i18n:check` meldet keine ungewickelte Komponente mehr. Seit `light#67` ist auch **standalone** die gerenderte Oberflaeche vollstaendig gewickelt (0 Komponenten ohne `t()`, vorher ~365 Textstellen) und der Schalter erreichbar — B-13 erledigt. Ein Guard prueft dort den AUFRUF von `setLanguage` aus einer gerenderten Datei, nicht seine Existenz; in der Suite meldet derselbe Guard `shellSettings.ts`, weil hier der Wirt die Sprache besitzt |
| Lexware — Key + Verbindungstest | `COMPLETE` | bis zum echten HTTPS-Aufruf gegen `api.lexoffice.io` |
| Lexware — Beleg anlegen | `BROKEN` | die Brücke läuft nur im iframe, ihr Handler braucht die Electron-Preload-Bridge — die beiden Bedingungen schließen sich aus (B-19) |
| SVG-Vorschau der Shell | `PARTIAL` | rechnet echte Formen aus echten Daten. Das Parallelmodell bleibt, ist seit `suite#98` aber mit den Planern verbunden: die Shell schiebt es als `suite-seed` hinein und uebernimmt, was zurueckkommt (B-20, B-39) |
| Projekt-Fluss Shell -> Planer | `COMPLETE` | `suite-seed` v1 (`packages/ui/src/seed.ts`): die Shell schiebt Raum, Kameras, Leuchten, Signalknoten und Kabel in den geoeffneten Planer, jeder Planer bildet sie auf sein natives Modell ab. Nichts wird geraten -- ohne eindeutigen Katalog-Treffer wird ein Geraet ohne Ports mit `portsUnknown` angelegt bzw. gar nicht platziert und gemeldet. Gemessen am gebauten Stand: 6 Geraete / 5 Kabel, 3 von 4 Kameras, 4 von 6 Leuchten. Guards: `packages/ui/test/seed.test.ts`, je ein Abbildungs-Test pro Planer, und `ui:smoke` prueft am laufenden Fenster, dass das Projekt im iframe ANKOMMT |
| Vier Laufzeit-Anwendungen als Module | `COMPLETE` | `tally-pi`, `sony-camera-bridge`, `Broadcast-intercom` und `pi-media-station` stehen als Module 6-9 in der Rail (B-35). Nicht mitgeliefert, sondern ueber eine konfigurierbare Adresse (Einstellungen -> „Geraete im Netz"): die vier sind Geraete mit eigenem Server bzw. eigener Hardware, ein mitgeliefertes Abbild waere eine Attrappe. Erreichbarkeit wird gemessen (`fetch`, `no-cors`), nicht am `load`-Ereignis geraten. Laeuft nichts, nennt das Modul Adresse, Zweck und Startbefehl. Guards: `test/modulErreichbarkeit.test.ts` (auch die Vorgabe-Ports gegen die Nachbar-Repos), `ui:smoke` oeffnet alle vier |
| Tally-Karte Plan -> Pi | `IMPLEMENTED` | `POST /tally-config` mit der Quellenliste aus dem Signal-Plan; ATEM-Adresse und GPIO-Verdrahtung bleiben auf dem Pi (`merge_tally_config`). Ueber den Main-Prozess, weil `guide_server.py` keine CORS-Kopfzeilen schickt. Vor dem Senden ein Abgleich (neu/geaendert/entfaellt); ein leerer Plan kann nicht senden, weil das die Liste auf dem Pi nur loeschen wuerde. Gegen einen Stub-Pi mit den ECHTEN merge/validate-Funktionen aus `guide_server.py` gemessen: GPIO und ATEM-Adresse ueberleben, unbekannte Eintraege fallen weg, ein Validierungsfehler kommt woertlich zurueck. Ohne Test am echten Geraet — deshalb IMPLEMENTED, nicht COMPLETE |
| Projekt-Fluss Planer -> Shell | `IMPLEMENTED` | der Planer meldet seine Domaene zurueck (`avplan:seedPatch`), die Shell arbeitet sie ein und laesst die Revision stehen -- das schneidet die Echo-Schleife ab. Der geteilte **Raum** geht bisher nur hin (B-39.1, Entscheidung E-21) |
| Dev-Einbettung der Planer | `BROKEN` | Fallback-Ports 4181-4183, kein Planer hört dort; der dokumentierte Dev-Weg trifft nie einen laufenden Planer (B-17). Nur Entwickler betroffen |
| Rückweg Suite → upstream | `PARTIAL` | der Drift-Bericht **nennt** die suite-ahead-Dateien jetzt (`suite#64`); die Bewertung Overlay/Fix bleibt Handarbeit — gemessene Trefferquote roher Kandidaten: 3 von 9 |

### 3.3 Die übrigen Repos

| Repo | Status | Beleg |
| --- | --- | --- |
| `Broadcast-intercom` Kern | `IMPLEMENTED` | 38 Smoke-Prüfungen grün gegen laufenden Server |
| `Broadcast-intercom` CI | `COMPLETE` | `ci.yml` baut, startet den Kern mit `MOCK_DEVICES=1` und fährt die 38 Smoke-Prüfungen (`#6`, erster Lauf grün) |
| `sony-camera-bridge` | `IMPLEMENTED` | 15 Tests grün in zwei Workspaces, ganz auf ADR-003 ausgerichtet |
| `Broadcast-intercom` i18n | `COMPLETE` | 165 Schluessel, EN und DE vollstaendig — und zwar **vom Typ erzwungen** (`const DE: typeof EN`), ein fehlender Schluessel waere ein Compile-Fehler. Die 29 wertgleichen Eintraege sind echte Gleichwoerter (Monitor, Signal, Sidetone, VOX) |
| `sony-camera-bridge` Oberflaechen-Sprache | `PARTIAL` | 172 sichtbare Textstellen ohne jede i18n, davon **32 deutsch** und der Rest englisch — in denselben Dialogen nebeneinander (B-26) |
| `sony-camera-bridge` CI | `COMPLETE` | `ci.yml` mit `npm ci` + `npm test` (`#11`, grün) |
| `tally-pi` | `IMPLEMENTED` | 5 Python-Module, systemd-Units, `bootstrap.sh`; seit `#7` **55 Tests** in CI (ATEM-Offset, ME-Zählung, `offline` wird nie `safe`) |
| `pi-media-station` | `IMPLEMENTED` | `main.py`/`sensor.py`/`web_ui.py` + Electron-Manager; seit `#3` erste CI (`verify.yml`) und **21 Tests** (Schema-Heilung, Filterfenster, Dummy-Rückfall ohne `gpiozero`) |

### 3.4 Integration über Repo-Grenzen

| Kette | Status | Beleg |
| --- | --- | --- |
| Plan → Tally-Pi | `PARTIAL` | Datenvertrag `COMPLETE` und getestet; **Transport ist manuell** — `ExportDialog.tsx:1299` erzeugt `{devices:[…]}` als Download, den jemand nach `/opt/pi-guide/tally.json` kopiert |
| `.avplan` als Austauschformat | `IMPLEMENTED` | Slots in cable/light/multicam, unbekannte Slots werden geladen und nachgefragt |
| Suite ↔ Planer | `IMPLEMENTED` | Vendoring + geteilte Pakete, drift-bewacht |
| Intercom ↔ Suite | `MISSING` | `GreenGoConfig` lebt in cable-planner, `packages/shared` in Broadcast-intercom; kein gemeinsames Vokabular, `.avplan` hat keinen Intercom-Slot |

---

## 4. Was diese Erhebung strukturell nicht sieht

Ehrlich benannt, damit die Abwesenheit eines Befundes nicht als Freigabe
gelesen wird:

1. **Fast nur `src/` und `tests/`.** Der Drift-Vergleich hatte
   `ROOTS = ['src','tests']`; `docs/`, `.github/`, `electron/`, `package.json`,
   `index.html`, `vite.config.ts` waren nie im Feld. Ausgerechnet der Vorfall,
   der die ganze Rückweg-Untersuchung ausgelöst hat, war ein Eintrag in
   `docs/ux-audit.md`.
   **Seit B-14 teilweise geschlossen:** `ROOT_FILES` nimmt `CLAUDE.md` dazu —
   die Lücke fiel auf, weil die vendorierte `apps/cable-planner/CLAUDE.md`
   unbemerkt 39 Zeilen zurücklag, darunter die Commit- und Merge-Regeln. Der
   Rest der Liste steht weiterhin außerhalb.
2. **Code, der in ein geteiltes Paket ausgewandert ist.** Das upstream-Original
   steht auf `REPLACED_BY_PACKAGE` und hat kein Gegenstück — es fällt aus jedem
   Datei-zu-Datei-Vergleich.
3. **Löschungen und Umbenennungen.** Das Feld besteht aus namensgleichen Paaren.
4. **Fixes, die im Weglassen bestehen.** Ausgewertet wurden „nur Suite"-Zeilen.
5. **Keine laufende Desktop-App geprüft.** Electron-Builds, echte Geräte (ATEM,
   Videohub, Sony-Kamera, Pi-GPIO) und die Drucker-/Plotter-Pfade sind nicht
   ausgeführt worden — nur ihr Code gelesen.

### Zehnte Messrunde (2026-09-04): sechs von zwölf Roadmap-Zeilen widerlegt

Jede der zwölf Initiativen einzeln am Quelltext nachgeprüft, mit einem eigenen Prüfer je Zeile
und der ausdrücklichen Anweisung, das Dokument als Behauptung zu behandeln. Ergebnis: **sechs
Zeilen hielten nicht** — und anders als in Runde 9 gingen die drei schwersten Abweichungen in
Richtung **zu optimistisch**:

| Zeile | stand auf | ist |
| --- | --- | --- |
| 3 Stückliste, 5 Change-Impact | fertig | **fertig** |
| 1 Identitäts-Spine, 2 Tally-Map, 4 Gestempelter Druck | fertig | **teilweise** |
| 0 Fork, 7 As-built, 8 Netz-Plan | teilweise | teilweise, Zahlen/Belege falsch |

Zwei der Befunde waren echte Fehler und sind repariert, nicht nur notiert:

* **`cable#674`** — jede echte `tally.json` wurde von tally-pi zurückgewiesen: 36-stellige
  `uuidv4()` gegen ein Feld, das `guide_server.py:310` auf 32 Zeichen begrenzt. Geprüft worden
  waren die **Feldnamen**, nicht die **Wertebereiche**; das Fixture trug `'r1'`.
* **`cable#673`** — der Druck-Knopf druckte ungestempelt, obwohl die Initiative
  „gestempelter **Druck**" heißt. Drei PDF-Wege, einer gestempelt, die Nachbarn nicht.

Offen als **B-27** (die Ableitung liest den Router-Zustand nicht — Tally-Karte trägt die
Router- statt der ATEM-Eingangsnummer, ohne Befund) und **B-28** (ATEM- und Videohub-Labels
hängen nicht an der Rolle).

### Und ein Befund über die Erhebung selbst

**Die Schweregrade dieses Audits liefen dem Code voraus.** Von den bislang
einzeln nachgeprüften Behauptungen hat **keine** in ihrer ursprünglichen
Einstufung gehalten:

| Behauptung | eingestuft als | tatsächlich |
| --- | --- | --- |
| Leistungsberechnung „vier auseinanderlaufende Fassungen" | `BROKEN` | `PARTIAL` — sie laufen in **einer** Dimension auseinander (aktiver Modus). Widerlegt: zweite Watt→Ampere-Umrechnung, hartkodierte Spannung, abweichender BTU-Faktor, doppelt gezählte Netzteile — nichts davon existiert |
| Settings → Darstellung → Custom-Palette | `UI_ONLY` | `PARTIAL` — **zwei von drei** Reglern wirken bis in den Canvas und jeden Export und werden persistiert; nur `accent` war folgenlos |
| Hilfe → Tastaturkürzel | `UI_ONLY` | `PARTIAL` — gemountet, über drei Wege erreichbar, **16 von 18** Einträgen durch echte Handler gedeckt; zwei waren tot |
| light-planner localStorage „verliert Daten" | `BROKEN` | `PARTIAL` — die Plandaten überleben den Round-Trip vollständig, jedes optionale Feld hat einen Default, Quota ist behandelt; verloren gingen **drei** benannte ADR-005-Felder |

Das ist kein Zufall, sondern die Bauart der Methode: ein Prüfer, der eine Lücke
sucht, findet eine — und schreibt sie so groß, wie sie aus seiner Perspektive
aussieht. **Ein Befund gilt hier deshalb erst, wenn er am Quelltext einzeln
nachgeprüft ist.** Die vier oben waren nach der Nachprüfung immer noch echt und
alle vier sind inzwischen behoben; ihre Einstufung war es nicht.

Umgekehrt gilt dasselbe: `PARTIAL` statt `BROKEN` macht keinen der vier
harmlos. Der Stromrechner rechnete zu niedrig, und zwar in der Ansicht, aus der
die Absicherung abgeleitet wird.

---

## 5. Zusammenfassung

Die vier JavaScript-Hauptprojekte sind **grün über Build, Typecheck, Lint und
Tests** — 1.257 automatisierte Tests plus 38 Smoke-Prüfungen. Der Zustand ist
nicht „halbfertiges Produkt", sondern **reifer Kern mit benannten Lücken**.

Die Lücken sind nicht gleichmäßig verteilt: sie sitzen fast alle an den
**Nahtstellen** — zwischen Suite und upstream, zwischen Plan und Gerät,
zwischen zwei Repos, die dasselbe Vokabular in eigenen Kopien führen. Das ist
kein Zufall, sondern die Bauform: acht Repos, die einzeln funktionieren.

Der offene Backlog steht in [`IMPLEMENTATION_BACKLOG.md`](IMPLEMENTATION_BACKLOG.md).
