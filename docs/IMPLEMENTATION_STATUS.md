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
| Haus-IT-Anforderungsblatt | `IMPLEMENTED` | Bedarf 23, `cable#705` — „the role's most-cited organisational blocker“. Die Design-Literatur (Crestron, Ruckus) schreibt den Inhalt vor und einen gemeinsamen Testtermin, aber KEIN Dokument; die Ersatzloesung der Branche ist ein monatliches AV-IT-Treffen. **Jede Zeile sagt, ob sie abgeleitet ist oder eine Frage** — VLANs, Adressbereiche, Portzahl, Bandbreite und PoE (wo gefuehrt) mit Zahl; IGMP-Querier, DHCP, QoS und Testtermin als Frage MIT Grund. Der belegte Widerspruch (Audio-Feldrat: IGMP-Snooping aus; ST 2110: braucht es) wird erkannt und NICHT aufgeloest, sondern vor den Aufbau gelegt — und nur, wenn der Plan beide Sorten traegt |
| Rack-Tuer-Blatt und VLAN-Tabelle | `IMPLEMENTED` | Bedarf 22, `cable#705`. Aus demselben Modell („generated from one model“). Das Rack-Tuer-Blatt zeigt bewusst nur, was IST — keine Befunde: der Adressplan zeigt, was fehlt, an der Rack-Tuer hilft eine Zahl |
| Kanalliste mit fuenf Sichten | `IMPLEMENTED` | Bedarf 37, `cable#706`. Band, Haus, Buehne, Pult, Monitor-Wege — aus EINEM Datensatz, wie die Bedarfs-Datenbank es verlangt („PROJECTIONS of one dataset, NOT MORE FIELDS“). Die Pult-Sicht kuerzt auf das belegte Dante-Budget und NENNT die Kuerzung; die Monitor-Sicht zeigt WEGE, nicht Mix-Inhalte — die kennt der Plan nicht |
| Stage-Plot als Ein-Seiten-Lieferung | `IMPLEMENTED` | Bedarf 38, `cable#706`. Der Markt-Standard StagePlotPro ist nicht mehr kaeuflich (21 unabhaengige Nachbauten auf GitHub als Beleg). Die Nummer im Plot ist die KANALNUMMER und nicht mehr die Canvas-Position — zwei Nummern fuer dasselbe Mikro auf einem Blatt sind schlimmer als keine. Eingangsliste und Monitor-Wege stehen auf DEMSELBEN Blatt |
| Encoder-Machbarkeit | `IMPLEMENTED` | Bedarf 36, `cable#707`. Der Plan DARF Qualitaet je Ziel fuehren (Twitch 6.000, YouTube 12.000 kbit/s); was fehlte, ist die Auskunft, ob das WERKZEUG das liefern kann. Zwei Encoder im Katalog, nicht zehn — nur wofuer eine Fundstelle vorliegt: vMix (drei Ziele, Multi-Bitrate aus, sechs Felder muessen gleich sein) und OBS + obs-multi-rtmp (keine belegte Zielgrenze, also wird keine behauptet). „Unbeantwortet" ist ein EIGENER Zustand und kein Nein: die Qualitaetsfrage bei obs-multi-rtmp ist seit 2024-10-26 offen. Gezaehlt werden Primaerwege; unter zwei Zielen schweigt die Pruefung |
| Ablaufblatt fuer den Showtag | `IMPLEMENTED` | Bedarf 33 (der Teil ohne fremdes Schema), `cable#707`. Ziel, Rolle, Transport, Ingest, Bild, Video, Keyframe, Audio — und der Stream-Key als VERWEIS (`Schluesselbund: stream-key:<id>`), nie als Wert. Keine OBS-/vMix-/NOALBS-Datei: von deren Formaten liegt die Feldliste vor, nicht das Schema, und eine Datei mit erfundenen Schluesseln saehe geprueft aus |
| Container ausgeben und zurueckbuchen | `IMPLEMENTED` | Bedarf 15, `cable#707` — „a good half hour of repetitive clicking" (snipe-it#9517, seit 2021 offen). Der Inhalt folgt mit, weil er im LPN-Baum haengt und nicht angefasst wird. Die Ausgabe friert ein, was TATSAECHLICH drin war (nicht die Kit-Vorlage: „Kits contain models, not the specific physical assets"); Einheiten gehen unter eigener Kennung raus. Ein Case IM ausgegebenen Transport-Case darf nicht noch einmal raus. Die Differenz bei der Rueckgabe wird berichtet, nicht geheilt |
| PTZ-Presets als Dokument | `IMPLEMENTED` | Bedarf 14, `multicam#92`. Nummer -> benannter Shot -> Segment, im Seitenstreifen und auf der Kamerakarte (und damit im Fingerabdruck). Der Zustand wird KOPIERT, nicht verlinkt — samt Standort: Pan/Tilt sind Winkel des Koerpers, wird er versetzt, zeigt derselbe Winkel woanders hin. Genau der „nudge" aus dem Befund. Dass ein Preset ANDERE Werte hat als die Kamera gerade, wird NICHT gemeldet: das ist der Normalfall |
| Sichtlinien-Konflikte | `IMPLEMENTED` | Bedarf 12, `multicam#92` — „cheap geometry, prevents a re-rig". Dreidimensional: an der Kreuzungsstelle wird die HOEHE der Linie gegen die des Hindernisses gehalten. Eine reine 2D-Pruefung meldete auf jedem Plan ein Dutzend Treffer, von denen keiner blockiert. Fokusdistanz gilt entlang der optischen Achse, der Standort kommt aus `effectiveCameraPos`, und das Podest unter der Kamera ist ihr Boden. Zuschauerbloecke werden NICHT geprueft: der Planer kennt sie nicht |
| Kabelweg-Befunde | `IMPLEMENTED` | Bedarf 13, `cable#708`. Der Befund nennt das stille Veralten: „a moved position SILENTLY invalidates the cable call". Eine geschaetzte Laenge traegt jetzt ihre HERKUNFT (Geometrie + Massstab); eine von Hand eingetragene traegt sie nicht und wird nicht gegen die Luftlinie gehalten — ein echter Kabelweg wird verlegt, nicht gespannt. Gespeichert wird der GERAETE-URSPRUNG und nicht der Mittelpunkt, weil nur er die Raster-Heilung beim Laden unveraendert uebersteht. Dazu: ein SMPTE-304M/311M-Strang traegt Bild, Rueckbild, Intercom, Tally und Strom — der Befund sagt es woertlich, und die Meldung sagt es mit |
| Ausgabeschein scannbar | `IMPLEMENTED` | Bedarf 16, `cable#709`, und Berichtigung von `cable#707`. Das Blatt druckte die interne `refId` in einer Spalte namens „Kennung" — eine UUID, die auf keinem Case klebt. Ein Blatt, das eine unscannbare Zeichenkette dorthin setzt, ist schlimmer als eines ohne die Spalte: es sieht benutzbar aus. Jetzt der ETIKETTEN-Code (wo keiner klebt: „kein Etikett"), eine leere Spalte fuer den Stift, und ein Rueckweg, der nur ueber den Code trifft — nie ueber die interne Id |
| Kabel und Adapter in der Bedarfsliste | `IMPLEMENTED` | Bedarf 17, `cable#709`. Die Kabel-Stueckliste war ein eigenes Blatt; der Lager-Abgleich las nur die Geraete. Die Adapter standen NIRGENDS, obwohl der Plan an zwei Stellen sagt, dass er welche braucht (`needsConverter`, LWL-Steckertyp-Mismatch). Sie werden benannt („LWL-Adapter LC ↔ SC"); wo die Ports keine Stecker fuehren, bleibt die Zeile unbestimmt — eine erfundene Steckerpaarung sieht bestellbar aus. Der Reserve-Aufschlag bleibt draussen: er ist eine Export-Einstellung |
| Vergessene Blaetter in der Impact-Liste | `IMPLEMENTED` | Bedarf 26, `cable#709`. `changeImpact` kannte nur die Dokumente im Register, und die vom Bedarf genannten standen nicht darin („multiviewer window, comms position, tally, truck plan"). Die Tally-Karte ist jetzt beurteilbar; die Blaetter JE GERAET und die Stueckliste werden als nicht beurteilbar MIT GRUND gefuehrt — sie zu verschweigen sieht in einer Impact-Liste aus wie eine Freigabe |
| Rueckweg vom Papier | `IMPLEMENTED` | Bedarf 27, `cable#709`. Die Antwort war seit ADR-004 gebaut und unerreichbar: `docStandStatus` und `findByStand` beantworten „gilt dieses Blatt noch?", und die einzige Fundstelle ausserhalb ihrer eigenen Dateien war ein KOMMENTAR. Analyse → Blatt pruefen nimmt den ganzen Code, den blossen Stand oder das Abgetippte. Der wichtigste Fall hat einen eigenen Namen: ein gueltiger Stand ohne Gegenstueck heisst „vermutlich ein ueberholter Ausdruck", nicht „nicht gefunden" |
| ERP-Abgleich in beide Richtungen | `IMPLEMENTED` | Bedarf 28, `cable#709` — „the valuable increment is the DIFF, not more export". Reserviert und nicht geplant faellt bei einem reinen Import nie auf, und es ist Geld. Kommentarzeilen, Set-Inhalte und gestrichene Zeilen zaehlen nicht und werden MIT GRUND ausgewiesen. Zuordnung ueber `rentmanId` ist eine Tatsache, ueber den Namen ein Vorschlag; ein Name, der auf EINER der beiden Seiten doppelt vorkommt, ordnet nichts zu |
| Der Ausspielweg als Signalfluss | `IMPLEMENTED` | Bedarf 32, `cable#710` — „signal-flow diagrams stop at the encoder input; […] no artefact shows the delivery path". Seit `cable#703` gab es das Ziel-Register, aber `DeliveryDestination` hatte KEINEN Zeiger in den Plan: kein Geraet, kein Anschluss, kein Kabel. Das Register war damit genau das zweite Dokument, das der Bedarf beklagt, nur in unserer eigenen Anwendung. Die Naht ist EIN Feld (`encoderEquipmentId`); der Programm-Eingang und die Quelle sind ABGELEITET (Rueckwaertssuche im Kabelgraph, ADR-001) und werden nicht gespeichert. Zwei verkabelte Programm-Eingaenge ergeben `feed-ambiguous` und keine Antwort — welcher das Programm fuehrt, ist eine Einsatz-Entscheidung. Ein Backup auf demselben Blech wie sein Primaerweg ist kein Ausweichweg und heisst so. **Mitgefunden:** die Encoder-Machbarkeit zaehlte alle Primaerwege in EINEN Topf und meldete „vier gleichzeitige Ziele, vMix fuehrt drei" auf zwei Maschinen mit je zwei Zielen |
| Kein stiller Verlust beim CSV-Import | `IMPLEMENTED` | Bedarf 29, `cable#711` — „the columns the production office added are the ones that vanish […] loss is discovered by whoever needed the column, when they needed it". Drei stille Verluste in einem Dialog: unbekannte Spalten fielen weg (die Vorschau nannte nur die ZUGEORDNETEN), namenlose Zeilen wurden ungezaehlt uebersprungen, und die Erfolgsmeldung zaehlte uebersprungene (weil vorhandene) Namen als „hinzugefuegt". Jetzt wird der Import DURCHGERECHNET, bevor er passiert, und was nicht ankommt, steht mit Spaltennamen und Zeilennummern daneben. Die unbekannten Spalten fallen ausserdem nicht mehr weg: sie wandern nach `notes` — eine genannte Spalte ist immer noch eine verlorene |
| Companion-Tasten aus dem Plan | `IMPLEMENTED` | Bedarf 3, `Broadcast-intercom#10` — „duplicating and hand-tweaking buttons […] weekly shows pay this 52 times a year". Die acht Vorlagen waren alle mit `device: ''` unausgefuellt, und sie wurden EINMAL in `init()` gesetzt: die Tasten waren die einzige der vier Companion-Definitionslisten, die nach dem Start nie wieder angefasst wurde. Sie konnten also nie etwas ueber den geladenen Plan wissen. Jetzt je Sprechstelle eine fertige PTT- und Mute-Taste, je Kanal eine Sprechtaste FUER JEDE SPRECHSTELLE, DIE DEN KANAL FUEHRT — eine geratene schaltet das falsche Mikrofon auf den falschen Kanal. PTT haelt statt umzuschalten: ein haengendes Toggle ist ein offenes Mikrofon in der Regie |
| Der geteilte Plan nennt seinen Stand | `IMPLEMENTED` | Bedarf 1 (zweites Inkrement), `cable#712` — „make it the live document rather than a PDF fork". Das erste Inkrement (kein Konto) war mit `#143` erledigt; das zweite fehlte an der einzigen Stelle, an der es zaehlt. Der Web-Viewer zeigte den Projektnamen und drei Zahlen, aber NICHT, welche Momentaufnahme er ist — damit war das Geteilte funktional die PDF-Gabelung. Beide Enden standen schon: der Stempel seit ADR-004, die Rueckfrage seit `cable#709`. Jetzt steht die Zahl auf dem, was der Freelancer bekommt, mit einem Satz daneben, was man damit macht. KEIN Druckdatum: das waere der Moment des Oeffnens, also eine Aussage ueber den Leser |
| Mengen-Operationen sagen, was sie auslassen | `IMPLEMENTED` | Bedarf 65, `cable#713` — vom Bedarf selbst „the cheapest reliability win in the whole dossier" genannt. `addCustomTemplates` ueberspringt bestehende Namen (richtig so, Bedarf 96), und es erfuhr niemand: der Library-Import meldete die Zahl aus der DATEI (200 importiert, 3 angelegt, „200" gemeldet), der GraphML-Zweig meldete GAR NICHTS, der CSV-Weg rechnete parallel. Die Auskunft steht jetzt am Engpass; namenlose Eintraege werden gezaehlt statt sich gegenseitig zu ueberschreiben |
| Der Bildschirm bleibt an beim Scannen | `IMPLEMENTED` | Bedarf 69, `cable#714` — „the phone locks mid-scan and has to be double-tapped" (inventree-app#492). Beide Kamera-Scan-Flaechen hielten keine Sperre. Der Teil, den man vergisst, ist nicht das Anfordern: die API gibt sie im Hintergrund von selbst frei und holt sie NICHT zurueck. Ehrlich degradierend wie `barcodeScanner.ts`. Zwei Gegenproben deckten ein Wettrennen beim Freigeben und eine Zusicherung auf, die ihre eigene Behauptung nicht pruefen konnte |
| „Bestand" ist nicht „verfuegbar" | `IMPLEMENTED` | Bedarf 80, `cable#715` — „the PM promises gear they do not have", belegt mit sechs Fehlern von vier Meldern. Seit `cable#707` weiss die Anwendung, welcher Container draussen ist und was drin war; `resolveCoverage` wusste davon nichts und zaehlte Technik mit, die auf einer anderen Show steht. Jetzt drei Zahlen statt einer (`stock`/`committed`/`available`), die Fehlmenge gegen das Verfuegbare, und der Konflikt AM OBJEKT statt als Zahl. Zwei Fallstricke einzeln geprueft: verschachtelte Cases nicht doppelt, Einheiten ueber ihren Artikel aufgeloest |
| Fremdes Material traegt bis aufs Blatt | `IMPLEMENTED` | Bedarfe 67 + 82, `cable#716` (+ `multicam-planner#93`, `light-planner#71` fuer das Wire-Contract-Feld). Bedarf 67 nannte die Aufgabe woertlich: „make sure it survives into every printed pack list, case label and check-in screen" — und keins der drei trug sie. Die Packliste gruppierte nach MODELL ALLEIN, eigenes und fremdes Material desselben Typs fielen in eine Zeile. Bedarf 82 zieht die Grenze („not a supplier portal") und nennt den Schaden: nicht der Verlust, sondern „keeping it three weeks too long". `no-date` ist ein eigener Zustand — undatiertes fremdes Material ist genau das Stueck, das stehenbleibt |
| Schaden mit Zuordnung | `IMPLEMENTED` | Bedarf 68, `cable#717` — „damage gets noticed at check-in and then lives in someone's head". Der Ruecklauf kannte nur „zurueck": `closeCheckout` nahm eine Notiz FUER DEN GANZEN BELEG, nicht fuer das Stueck. Jetzt haengt der Schaden an der Zeile, und die vier Angaben, die ihn auswertbar machen (Job, Person, Container, Zeitpunkt) werden AUS DEM BELEG ABGELEITET statt gespeichert: vier gespeicherte Felder waeren ab der ersten Korrektur am Beleg falsch. `damageTally` haeuft nach Empfaenger — die Frage, die den Bedarf ausloest, ist nicht „was ist kaputt", sondern „wo geht immer wieder etwas kaputt". Unbenanntes heisst `nicht benannt`, fuer Job UND Person; eine Gegenprobe zeigte, dass nur der Job-Fall geprueft war |
| Inventur unterscheidet „fehlt" von „am falschen Ort" | `IMPLEMENTED` | Bedarf 66, `cable#718` — „a stock-take that only says missing is a stock-take you redo by hand". `auditScan` liefert fuenf benannte Ergebnisse statt Treffer/kein Treffer; `wrong-place` ist eines davon und nennt den erwarteten Ort. Der Ort ist das ZWEITE PFLICHT-ARGUMENT, nicht optional: ohne ihn gibt es kein „falsch". `auditRelocations` aendert selbst nichts — es sammelt, was die Uebernahme schreiben WUERDE, und die Uebernahme laeuft ueber `moveUnit`, damit der Umzug in der Historie der Einheit steht statt sie stillschweigend zu ueberschreiben. Ein Ortsetikett im Scanfeld wechselt den Ort, statt als Fehltreffer zu zaehlen; Wake-Lock auf der offenen Inventur |
| Die Kommissionier-Liste nennt den Grund | `IMPLEMENTED` | Bedarf 64, `cable#719` — der Bedarf verlangt woertlich „which job holds it". Seit `cable#715` weiss die Zeile, welche offene Ausgabe das fehlende Stueck haelt; gesagt hat sie es nicht, und der Kommissionierer suchte das fuenfte Stueck im Regal, obwohl es auf einem Truck steht. Die Spalte `Grund` steht NUR auf der Fehlmengen-Zeile — eine Gegenprobe „Grund steht auf jeder Zeile" blieb zunaechst gruen und deckte auf, dass genau das ungeprueft war |
| Nachschlagen mitten in der Show | `IMPLEMENTED` | Bedarf 76, `cable#720` — „what's the IP of X, which switch port, which VLAN". Der Bruch war nicht, dass die Suche fehlte: `CanvasSearch` traf fuenf PROSA-Felder, und wer „10.20.0.14" eintippte, bekam nichts, obwohl der Plan die Adresse kennt. Beide Haelften der Antwort lagen fertig da und wurden nicht erreicht — `deviceInterfaces` (Bedarf 19) und `buildSwitchPortMaps` (Bedarf 24). `lookupInPlan` ist die Engstelle; jeder Treffer nennt das FELD, auf das er traf, weil ein Fund in einer Notiz mit der ALTEN Adresse sonst wie der Adress-Traeger aussieht. Was dranhaengt, kommt aus dem Kabelgraph. **„Is it flowing" wird nicht beantwortet** — ein offline-Planer weiss das nicht, und eine geratene Antwort saehe wie eine Messung aus |
| Die Antwort der Haus-IT | `IMPLEMENTED` | Bedarf 85 (zweite Haelfte), `cable#720` — „the outcome (what was opened, what was refused, what the workaround was) is never recorded". Bedarf 23 hatte die Frage gebaut. Kein Ja/Nein: der haeufigste Ausgang ist „mit Auflage", und beide Kreuze waeren beim naechsten Mal falsch. Drei Faelle mit eigenem Namen — `elsewhere` (die Antwort kommt aus einem anderen Haus; der Ort steht IN der Antwort, beim Schreiben eingefroren wie `CheckoutLine.ownership`, und wird streng verglichen), `stale` (Antwort auf einen Punkt, den der Plan nicht mehr stellt — Auskunft ueber das Haus, kein Muell) und `pending` (gefragt, nichts gehoert). Geraten wird nichts, und nichts wird an die Anforderung zurueckgeschrieben: zwei Herkuenfte, zwei Spalten |
| Etiketten, die das Lager ueberstehen | `IMPLEMENTED` | Bedarf 70 — **nicht neu gebaut, sondern 2026-09-06 als gebaut nachgewiesen.** Die drei Forderungen sind erfuellt: der Code steht als TEXT unter dem Symbol (auch beim QR, nicht nur beim Barcode, `labelSheets.ts`), es gibt acht Geometrien statt der verlangten drei (vier Avery/Zweckform-Boegen aus den Datenblaettern, vier Endlos-Rollen), und das Abtippen ist der HAUPTWEG und nicht die Strafe: beide Scan-Flaechen (Ausgabeschein, Inventur) sind Textfelder, die Kamera ist die Zugabe |
| Die Zeit im Netz-Modell | `IMPLEMENTED` | Bedarf 73, `cable#721` — „PTP domain, grandmaster and boundary-clock topology live nowhere", und der Schaden mit Zahlen: „ST 2059-2 defaults to domain 127 while AES67 commonly uses domain 0". Drei Felder an der SCHNITTSTELLE (ein redundanter 2110-Aufbau faehrt rot und blau bewusst getrennt); `ptpPlan.ts` gruppiert nach Domaene, leitet die Essenz-Familie aus dem KABELGRAPH ab und liefert fuenf benannte Befunde. `unspecified` ist nirgends ein Befund, und kein Feld wird vorbelegt — eine geratene Vorgabe waere genau der Widerspruch, den die Pruefung sucht. Zwei echte Lade-Pfad-Fehler mitrepariert: `interfaceIsEmpty` kannte die Felder nicht (eine Schnittstelle mit NUR einer Domaene galt als leer und flog raus), `normaliseNetworkInterface` uebernahm sie nicht |
| Das Netz-Merkblatt fuer die Crew | `IMPLEMENTED` | Bedarf 77, `cable#721` — „today it is a verbal briefing plus a WhatsApp message". Der Unterschied zur Nachricht liegt NICHT im Inhalt, sondern im Stand: das Blatt ist ein Dokument nach ADR-004 (`crew-netz`), also beantwortet `sheetLookup` (Bedarf 27) die Frage „gilt das noch?". Fuenf Abschnitte aus Quellen, die es ohnehin gibt. Die Regel, die den Inhalt bestimmt: was der Plan nicht weiss, steht als FRAGE drauf und nicht als Luecke — eine leere Zeile liest sich wie „gibt es nicht", und dann steckt jemand ein Kabel. Ohne Geraete-Adressen (dafuer gibt es das Rack-Tuer-Blatt) und nur mit den GRENZEN aus den Haus-Antworten |
| Ein Spektrum-Plan | `IMPLEMENTED` | Bedarf 95, `cable#721` — „one wireless plan, not separate RF and comms features". **Der Befund lag im eigenen Haus:** der Planer rechnete Intermodulation ZWEIMAL und beide Male auf der halben Menge — `deriveRig` ueber die Rig-Kanaele, der RF-Reiter ueber die Kabel-Strecken, mit einer von Hand nachgebauten IM3-Schleife und einer eigenen Konstante. Eine Mikrofonstrecke auf 606,400 MHz und ein Kameralink auf 606,500 MHz begegneten sich in KEINER der beiden. Intermodulation auf der halben Senderliste ist schlimmer als gar keine: keine Rechnung sagt nichts, eine halbe sagt „frei". `spectrumPlan.ts` ist die Engstelle; jeder Sender nennt Herkunft und TRAEGER (der Intercom-Teilnehmer haengt ueber `equipmentId` am Geraet — die Antwort auf „who carries beltpack 7"), und der Umfang der Rechnung steht ueber ihrem Ergebnis |
| Presets ueberschreiben nicht still | `IMPLEMENTED` | Bedarf 96, `cable#721` — „Applying a preset must never silently replace an existing grid; presets must append or prompt and show the resulting row count" (Cryde/musicall#798, geschrieben NACH einem Datenverlust-Fehler). Genau das passierte in `applyTechnique`: wer Mikrofone auf drei Toms gesetzt hatte und auf eine kleinere Technik wechselte, verlor sie wortlos. Jetzt ein Bericht und eine Rueckfrage mit der Zahl DANACH; gemeldet wird nur, was ein MENSCH eingetragen hat. Die uebrigen Import-Wege erfuellen die Regel bereits (`mergeById`/`mergeDefined`, ADR-005 Regel 2; Bedarf 65) |
| Tally fuer entfernte Beitragende | `IMPLEMENTED` | Bedarf 86, `tally-pi#10` — „remote guests have no reliable way to know they are live" (vdo.ninja#569/#654, beide seit Jahren offen). **Die Erreichbarkeit wird bewusst NICHT gebaut** — ein Relay waere ein Cloud-Dienst und widerspraeche der Zusage des Repos; das steht jetzt im README statt offenzubleiben. Gebaut ist, dass die Seite nicht LUEGT: der Herzschlag war ein SSE-Kommentar und damit fuer `onmessage` unsichtbar (eine halboffene NAT-Verbindung liess den letzten Zustand fuer immer stehen), es gab keinen Wachhund, `offline` sah aus wie `safe`, und ein leerer Zustand fiel auf die beruhigende Antwort zurueck. Dazu der hoerbare Alarm aus #654 — und die Seite sagt, ob er wirklich scharf ist |
| Die Aufzeichnung fuer das Archiv | `IMPLEMENTED` | Bedarf 90, `cable#722` — „a dropped or throttled upload degrades the local recording" (obsproject/obs-studio#13147), und die Folge steht im Befund und nicht nur in der Ursache: das Material muss VERWORFEN werden. Der Plan kannte die Ausspielziele, aber nicht die Frage, WORAUF mitgeschnitten wird — also konnte er auch nicht sagen, dass beides an derselben Maschine haengt. `ArchiveRecording` traegt drei Antworten statt eines Hakens: `device` (dieses Geraet), `none-by-choice` (bewusst keine — eine Entscheidung, kein Versaeumnis) und `not-stated` (nicht gefragt; das ist selbst ein Befund und faellt nicht als Leere durch). `assessArchive` nennt vier Faelle, zwei davon aus dem KABELGRAPH abgeleitet und nicht gespeichert: `shares-encoder` (Recorder und Ausspielung sind dasselbe Geraet) und `fed-by-encoder` (der Recorder haengt am Encoder — `reachesForward`, hoechstens vier Spruenge). **Ob der Encoder tatsaechlich ueberlaeuft, sagt der Plan nicht** — das ist eine Messung an der Maschine, und eine geratene Antwort saehe wie eine aus |
| Der Multicast-Adressplan | `IMPLEMENTED` | Bedarf 72, `cable#723` — „Generate the ST 2110 multicast address plan with the standard's and the fabric's rules built in". `collectFlows` leitet die Fluss-Tabelle aus dem Kabelgraph ab, EIN Fluss je SENDE-PORT: fuenf Empfaenger an einer Kamera abonnieren eine Gruppe, nicht fuenf — genau da faellt eine Excel-Tabelle mit einer Zeile je Kabel auseinander. Vier Essenzen, bewusst feiner als `EssenceFamily` im Zeit-Plan (dort geht es um den Takt, hier um Gruppen; ANC ist eine eigene). Fuenf Befunde, darunter die beiden aus den Belegen: `pair-collision` (Adresse und Port zusammen eindeutig, WATCHOUT) und **`mac-alias`** (32 Gruppen auf einer L2-Adresse, Arista) — der Befund nennt beide Adressen UND die geteilte MAC, sonst liest er sich wie ein Fehlalarm, und er nennt die Folge (die Karte des Empfaengers filtert auf L2 und nimmt beide Stroeme an) ohne einen Ausfall zu behaupten. **Die Vergabe vergibt nur NACH** — eine verteilte Adresse steht im Sender, im Empfaenger, im Switch-Filter und auf einem ausgedruckten Blatt. Zwei Lade-Pfad-Fehler mitrepariert: `interfaceIsEmpty` zaehlte die ROLLE nicht mit, also verschwand eine Medien-Schnittstelle, die (waehrend der Planung) nur ihre Rolle trug |
| Das Sicherheitsnetz | `IMPLEMENTED` | Bedarf 89, `cable#724` — „the safety net's characteristic failure is parking the show on a slate while the stream is fine". Der teure Fehler ist ein FALSCH-POSITIV: ein Netz, das nicht ausloest, kostet eine Show; eines, das grundlos ausloest, auch — und niemand sucht den Fehler beim Netz, weil das Netz ja „funktioniert". Beide Belege (NOALBS #178, #119) sind von dieser Sorte. Sechs Befunde: der Namensabgleich gegen die Szenen des Encoders (die Bedarfs-Datenbank nennt ihn selbst „a cheap win", geprueft werden ALLE DREI Szenen), `scenes-unknown` (ohne Szenenliste laeuft er nicht — und das wird GESAGT, ein stiller Durchlauf saehe aus wie „geprueft"), `no-return-path` (#119: einmal umschalten und nie zurueck), `stats-loopback` (#178: `localhost` ist keine Adresse, sondern eine Annahme ueber die Maschine — der Plan kennt beide), und zwei Schwellen-Pruefungen gegen die geplante Bitrate. Das JSON-Geruest ist AUSDRUECKLICH keine einspielbare NOALBS-Datei, und der Hinweis steht IN der Datei; ohne Stream-Key und ohne Ingest-URL |
| Vorlagen mit Haus | `IMPLEMENTED` | Bedarf 91, `cable#725` — „the most valuable document in the role is the one least likely to exist". Die Vorlage gab es schon; sie trug das FALSCHE mit. `saveUserTemplate` strippte die Auftrags-Identitaet (Kunde, Logos, Rentman) und liess alles andere stehen — inzwischen also auch die Genehmigungen EINES Hauses (`venueAnswers`, Bedarf 85), die Multicast-Adressen EINER Show (Bedarf 72), das Schluessel-Haekchen EINES Rechners (Initiative 9) und die Revisionen einer fremden Show. Eine neutrale Vorlage, die die Genehmigungen der Halle A mitbringt, ist schlimmer als eine ohne: die Zeilen sehen aus wie Auskunft. `stripForTemplate` kennt jetzt zwei Umfaenge, und `saveUserTemplate` nimmt den als PFLICHT-PARAMETER OHNE DEFAULT (wie `credentials` bei `syncSharedLibrary`) — der Compiler fand prompt den einen Aufrufer. Gefragt wird nur, wenn etwas dranhaengt. Der Multicast-POOL bleibt (das Schema ist das Wiederverwendbare), die Vergaben gehen. `templateCarryReport` sagt vor dem Laden, ob die Antworten hier gelten, und benutzt dafuer `sameVenue` aus `venueAnswers` — zwei Wahrheiten darueber, was „dasselbe Haus" heisst, waeren hier besonders teuer. **Der geteilte Ordner fehlt bewusst**: Vorlagen liegen weiter im localStorage, `syncSharedLibrary` deckt Geraete und Gruppen ab, und das dort zu ergaenzen ist ein eigenes Inkrement mit eigenem Sperr- und Merge-Verhalten |
| Kiste und Netz-Identitaet | `IMPLEMENTED` | Bedarf 78, `cable#726` — „a last-minute substitution of one identical stagebox for another is invisible to both the IP plan and the Dante subscription set, and only surfaces as a fault during rehearsal". Zwei baugleiche Stageboxen sind IM PLAN dasselbe Kaestchen, IM LAGER zwei Einheiten und IM NETZ zwei verschiedene Geraete — jede mit eigenem eingebranntem Namen und eigener MAC. `EquipmentItem.inventoryUnitId` (neu) sagt, WELCHE Kiste den Platz fuellt; `assetIdentity.ts` meldet sechs Faelle, aber NUR an Plaetzen mit Netz-Identitaet (IP, MAC, Geraete-Name bei vorhandener Schnittstelle, PTP-Domaene) — ein Stativ hat keinen eingebrannten Namen, und es mitzumelden hiesse, den halben Plan zu melden. `serial-mismatch` faengt den Tausch an den beiden Seriennummern und behauptet ausdruecklich NICHT, welche stimmt: der Plan weiss nicht, was im Rack steht, und ein Widerspruch zwischen zwei Listen laesst sich am Schreibtisch aufloesen, eine Behauptung ueber die Wirklichkeit nicht. Bestand und Ausgabescheine werden nur GELESEN. Zwei bestehende Guards forderten das neue Feld sofort ein und hatten beide recht: `modelFields` (Instanz — in einem Template zeigten zwei Plaetze auf dieselbe Kiste) und `planDiff` (substantiell — wer es aendert, hat getauscht) |
| Grundlage der Uebergabe | `IMPLEMENTED` | Bedarf 84, `cable#727` — „next year the same event is re-planned from the QUOTE, not from what was actually built". **Die Datei gab es schon**: die `.avplan` ist verlustfrei (ADR-005), und `handoverPackage.ts` baut das Closeout-Paket. Was fehlte, ist der Satz aus dem Bedarf — das Naechste-Jahr-Problem ist nicht die fehlende Datei, sondern dass die vorhandene den ANGEBOTSSTAND traegt und aussieht wie der Bauzustand. `jobHandover.ts` nennt drei Zustaende: `as-quoted`, `drifted` (ein As-Built liegt vor und der Plan ist seither substantiell weitergezogen -- der teuerste Fall, weil das Blatt das Wort traegt und nicht mehr stimmt) und `as-built`. „Substantiell" kommt aus `planDiff` und wird NICHT selbst gerechnet: zwei Vorstellungen davon faerbten das eine das Blatt, das andere den Diff. `ProjectTemplate.basis` wird BEIM SCHREIBEN eingefroren (wie `VenueAnswer.venue`) und aus dem QUELL-Projekt gelesen — die gestrippte Kopie hat die Revisionen bereits verloren, und aus ihr waere jede Vorlage „wie geplant". **Nicht im Dokument-Register**: der bestehende Guard „keine Ableitung haengt an der Revisionsliste" hat den ersten Wurf gefangen, zu Recht — der Revisions-Vergleich spannt Snapshots ohne diese Liste auf. Es steht in `UNJUDGEABLE_DOCUMENTS`, mit dem Grund |
| Notizen aus der Probe | `IMPLEMENTED` | Bedarf 71, `light#72` — „an open request asks for the opposite: store notes locally rather than in the show file" (cue-note #11/#7). Die LEUCHTEN-Haelfte war gebaut (`focusNote` + `focused`, Fokus-Liste, Plan-Marker); gefehlt haben genau die drei Punkte, an denen der Beleg haengt: MEHRERE Notizen je Ziel (`focusNote` ist ein Feld -- der zweite Zuruf ueberschrieb den ersten), Notizen an der POSITION („Traverse 2 haengt 20 cm zu tief" hat keine Leuchte) und ein AUTOR mit ZEITPUNKT. `focusNote` bleibt daneben stehen: es beschreibt den Fokus und gehoert zur Leuchte wie ihr Aim, eine Arbeits-Notiz ist ein Vorgang. Eine Notiz verschwindet NIE still -- wer eine Leuchte loescht, loescht die Beobachtung nicht (`staleNotes`, im Dialog unter „Ziel entfernt"). Der Kern des Belegs steht als GUARD im CI (`work-notes-check.ts`): am Ergebnis geprueft, dass weder MVR-Export noch Venue-Austausch den Notiztext tragen, plus die Gegenprobe, dass er in der eigenen Liste STEHT |
| Ausspielung (Streaming-Ziele) | `IMPLEMENTED` | Initiative 9, `cable#703`. Plattform, Transport, Ingest, Encoding und Ausweichweg als Datenobjekt; Paritaetspruefung ueber die sechs Felder, die YouTube und Castr als identisch verlangen; Transport-Rechner mit Formel UND Fundstelle und BEIDEN Lesarten der SRT-Latenz, weil die Quellen sich widersprechen. **Der Stream-Key steht in keinem Projekt** — `keytar` unter `stream-key:<id>`, und das Haekchen wird beim Laden nachgefragt statt aus der Datei geglaubt. Erreichbar ueber Werkzeuge -> Ausspielung; CSV mit Dokument-Stempel. Ohne Export in OBS-/vMix-/NOALBS-Format und ohne CDN als Topologie-Objekt |
| Netz-Schnittstellen je Geraet | `IMPLEMENTED` | Bedarf 19, `cable#704`. Die Alt-Felder sind Schnittstelle 0, `networkInterfaces` haelt 1..n, Engstelle `deviceInterfaces`. Der Adressplan zaehlt seither je Schnittstelle — die Doppel-IP-Pruefung uebersah vorher die Haelfte eines redundanten Dante-Aufbaus. Kein Umzug der 95 `ipAddress`-Fundstellen: jede uebersehene laese danach still `undefined` |
| Switch-Port-Karte | `IMPLEMENTED` | Bedarf 24, `cable#704`. Erzeugt aus zwei Quellen (gepflegte Schnittstelle, verlegtes Kabel), Herkunft je Belegung, Widerspruch bleibt sichtbar. Einfuegbarer Beschreibungsblock, **kein** Konfigurationskanal — die Quelle sagt es woertlich. Ohne Dokument-Stempel: das Register fuehrt einen Stand je Bezeichner, hier gibt es eine Karte je Switch |
| Plan gegen Vorgefundenes | `IMPLEMENTED` | Bedarf 21, `cable#704` — in der Bedarfs-Datenbank „the highest-value item in the dossier“. Datei statt Live-Feed (Dantes API ist lizenz-gebunden, die offene Alternative erklaert sich selbst fuer untauglich); `arp -a` (Linux/macOS und Windows), `ip neigh`, CSV mit Spalten-Zuordnung. Zuordnung ueber MAC -> IP -> Name mit Beleg, eindeutig oder gar nicht, Dante-Kollisionsform als eigener Befund. Ohne Dante-Controller-Parser: dessen Format liegt in der Recherche nicht vor, und einen zu erfinden hiesse, ihn geprueft aussehen zu lassen |
| Projekt-Vorlagen | `IMPLEMENTED` | B-39.2. Eine Vorlage ist die Show ohne ihren Termin und ohne ihren Kunden; aus ihr entsteht ein **befuelltes** Projekt (Bedarf 2/75/91 der Bedarfs-Datenbank, P1). Zwei Regeln kommen aus der Recherche: **abgezogen statt aufgezaehlt** (`TEMPLATE-FIELD-MEASUREMENT.md` fand upstream drei Vorlagen-Bauer mit 37/23/15 Feldern, einer davon seit `#335` abgedriftet -- hier kopiert `templateFromProject` das ganze Projekt und zieht eine benannte Liste ab, ein Test spritzt ein unbekanntes Feld ein), und **was nicht mitfaehrt, wird genannt** (Praezedenz Design-Frage 5): Kontakte samt USt-IdNr., Kundennummer und Lexware-Kontakt-Id, ausgestellte Belege, Besteuerung, Termin, Phase, Fortschritt, Call-Zeiten, Ist-Kosten, abgehakte Aufgaben, Ladezeit -- mit Anzahl, angezeigt BEVOR die Vorlage entsteht. Guards: `test/projectTemplate.test.ts` (18 Tests, jede Regel gegengeprobt; die Kundendaten-Probe prueft das Serialisat, nicht das Feld). Ohne Datei-Import/-Export in der Oberflaeche -- das Format steht (`serializeTemplate`/`parseTemplate`, weist eine Projektdatei zurueck), der Knopf dafuer fehlt |
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
