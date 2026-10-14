# Gemeinsame Pakete — was ähnlich ist, und welche Fassung gewinnt

**Stand 2026-09-28.** Vier Bestandsaufnahmen über cable-, light-, multicam-, inventory-,
facility-planner, Broadcast-intercom und `packages/*`, jede Zeile mit Dateipfad erhoben. Der
Verteilweg steht in [ADR-015](decisions/ADR-015-pakete-erreichen-die-planer.md).

Regel für jede Zeile: **das Beste aus allen einmal** — nicht die Fassung eines Planers
übernehmen, sondern die stärksten Teile zusammensetzen, und das Paket ist danach die einzige
Stelle.

## Reihenfolge

| # | Paket | Stand | Warum zuerst |
| --- | --- | --- | --- |
| 1 | `@avplan/floorplan` | **gebaut 2026-09-28** | Behebt den gemeldeten Fehler (kein Drag & Drop), vier Lader zu einem |
| 1b | `@avplan/scene3d` | **gebaut 2026-10-13** | Fotorealistische 3D-Ansicht für multicam- und light-planner aus einer Quelle; light-planners Render-Teile (Haze-Kegel, AgX, Bloom, Personen-Lader) sind darin aufgegangen; seit 2026-10-14 Tageszeit und Himmel (`sonne.ts`, `himmel.ts`, braucht `suncalc` im Planer) und prozedurale Kameratechnik (`erzeugeKameraRig`: Cinema-, Studio-, ENG-, spiegellose und PTZ-Kamera, Objektive nach Brennweite, Stativ, Pedestal, Kran, Slider, Dolly, Schulterrig, Wand-/Deckenhalter) im Rig-Koordinatensystem des multicam-planners: Ursprung am Boden unter der Pan-Achse, Optik nach +x, Pan als `rotation.y = -pan`, Tilt um z, `hoeheM` = Hoehe der optischen Achse; Sichtkegel am Knoten `optischeAchse` ansetzen |
| 2 | `@avplan/files` | offen | Fehlerhafter Download-Anker in rund 20 Dateien (Anker nicht eingehängt, sofortiges `revokeObjectURL`) |
| 3 | `@avplan/csv` | offen | `csv.ts` ist in cable und inventory schon zeichengleich; light schreibt nach anderen Regeln |
| 4 | `@avplan/stamp` | offen | Drei Fassungen, Parität nur in der Suite geprüft; cable fehlen die festen Prüfwerte |
| 5 | `@avplan/i18n-core` | offen | Fünf fast gleiche Übersetzer, fünf verschiedene Speicherschlüssel |
| 6 | `@avplan/theme-core` | offen | `thema.ts` viermal, nur der Schlüssel verschieden |
| 7 | `@avplan/print` | offen | 33 HTML-`esc`-Helfer mit verschiedenen Zeichen, vier Druckwege |
| 8 | `@avplan/media` | offen | Drei Verkleinerer, drei Fassungen desselben pdf.js-Laders |
| 9 | `@avplan/inventory-core` erweitern | offen | Zehn Lager-Module in cable und inventory schon gleich; Format-`types.ts` fünfmal verschieden |
| 10 | `@avplan/electron-base` | offen | inventory, facility, intercom ohne CSP; light, inventory, facility öffnen jede URL |
| 11 | `@avplan/persist` | offen | Atomisches Schreiben dreimal, das robusteste (fsync, `.bak`-Rückfall) steht in intercom |
| 12 | `@avplan/scan`, `@avplan/labels` | offen | Drei Scanner, zwei Etikettentabellen mit widersprüchlichen Avery-Maßen |

## 1 · Grundriss — `@avplan/floorplan`

| Teil | Bestes heute | Übernommen |
| --- | --- | --- |
| Maßstab | cable `lib/grundriss/massstab.ts`: Zwei-Punkt **und** Vier-Ecken-Homographie, Ecken-Prüfung, Kalibrierung wandert beim Verschieben mit, getestet | ✓ `massstab.ts` |
| PDF | light `utils/floorPlanLoader.ts`: jede Seite, ~2000 px, weißer Grund; multicam: Größengrenze 50 MB | ✓ `pdfjsRenderer`, Grenze übernommen |
| Verkleinern | cable `GrundrissPanel.tsx`: längste Kante 3000 px, JPEG 0,9 | ✓ `ladePlanDatei` |
| Drag & Drop | **niemand** — Muster aus cable `FotoPortErkennung.tsx` | ✓ neu: `planAblage`, `ziehtDateien`, `planDateienAus` |
| Austauschformat | multicam `utils/venueExchange.ts` (Quelle der drei Kopien) | ✓ Schema und `parseVenueExchange` |
| Kalibrier-Dialog | light `ScaleDialog` (beste Bestätigung) | offen |
| Wände, Messen | light `PlanCanvas` | offen, bleibt vorerst in light |
| Räume in Metern | facility `RaumLage` | offen |

**Befund Gebäude-Planer** (`larszu-facility-planner/src/ui/Grundriss.tsx`): Der Grundriss war ein
getippter Pfad (`quelle`) direkt als `<img src>`. Es gab keinen Drop-Handler, deshalb verschluckte
Electron die abgelegte Datei (`will-navigate` wird verhindert), und der Browser verließ die App.
Ein Dateipfad ist ohne Preload auch gar nicht zu bekommen (`sandbox`, kein `File.path` ab
Electron 32). Zusätzlich lagen die Markierungen bei nicht quadratischen Plänen senkrecht falsch:
Sie werden als Anteil der Bild**breite** gespeichert, aber mit `top: %` gezeichnet, und das bezieht
sich auf die **Höhe**.

## 2 · Dateien und Ausgabe

| Teil | Bestes heute | Paket |
| --- | --- | --- |
| Herunterladen | `@avplan/ui` `herunterladen.ts` (Anker eingehängt, spät freigegeben) + light `fileSave.ts` (Speicherort-Dialog) | `files` |
| Öffnen | light `openTextFile`; cable `pickFile` löst beim Abbrechen nie auf | `files` |
| Plattform-Naht | light `integration/hostAdapter.ts` | `files` |
| CSV schreiben | cable `csv.ts` + `csvFromTable` (RFC 4180 inkl. `\r`, BOM, Stempel) | `csv` |
| CSV lesen | `@avplan/ui` `parseDelimited` (Trenner außerhalb von Anführungszeichen gezählt, Tab) | `csv` |
| Dokumentstempel | cable `documentStamp.ts` (Doku-Code, Register) + light/multicam `stampForStand` (Beschriftung und Wert zusammen) | `stamp` |
| HTML-Blatt | cable `druckblatt.ts` + `printHtml.ts`; multicam `esc` (alle fünf Zeichen) | `print` |
| Tabellen-PDF | light `pdfTable.ts` (durchsuchbar, ohne Abhängigkeit, Stempel je Seite) | `print` |
| Fotos verkleinern | cable `fotoAufnahme.ts` + `fotoMasse.ts` (EXIF-Drehung, Budget) | `media` |
| Fotos außerhalb des Kontingents | cable `fotoSpeicher.ts` (IndexedDB) | `media` |
| Autosave | multicam `store/autosave.ts` (Flush beim Schließen, Wiederherstell-Wächter, getestet) | `persist` |
| Atomisch schreiben | intercom `configStore.ts` (fsync, `.bak`-Rückfall) + cable `atomicWrite.ts` (Sperre, Zufalls-tmp) | `persist` |
| ZIP ohne Abhängigkeit | inventory `zipStore.ts` | `files` |

## 3 · Lager, Racks, Geräte

ADR-006 bleibt: das Lager ist ein eigenes Werkzeug, der Rack-Aufbau Kern des cable-planner, die
Lade- und Case-Planung gehört dem inventory-planner (ADR-010).

| Teil | Bestes heute | Weg |
| --- | --- | --- |
| Inventarformat (`types`, `portable`) | inventory-planner `domain/` (gepflegt, i18n) | `inventory-core` wird Quelle, Kopien per ADR-015 mit Byte-Wächter |
| Zehn gleiche Lager-Module (`storageTree`, `packList`, `containerCheckout`, …) | schon zeichengleich in cable und inventory | nach `inventory-core` |
| Schäden, Versicherung, Inventur, Eigentum | inventory (i18n, neuer) | nach `inventory-core`; cable zieht nach |
| Seriennummern, Sets, Ausgabe/Rücknahme/Unterschrift | **nur cable** hat die Oberfläche | zuerst in inventory-planner bauen, dann in cable entfernen (ADR-006: „der Planer behält seine Kopie, bis das steht") |
| Bedarf und Deckung | dreifach (cable `deriveDemand`/`resolveCoverage`, inventory `BedarfsZeile`, ui `deriveBedarf`) | eine Fassung, braucht einen datierten Nachtrag zu ADR-006 |
| Rack-Belegung | cable schreibt, inventory liest (`avplan-rack-belegung`) | Format nach `inventory-core` |
| Gerätetyp-Identität | `@avplan/device-catalog` | bleibt; multicam/light lesen ihn noch nicht zurück |
| Gerätebibliothek-Client | `av-device-library/clients/` | bleibt dort; Wächter über die Repo-Grenze fehlt |

## 4 · App-Grundgerüst

| Teil | Bestes heute | Paket |
| --- | --- | --- |
| Übersetzen | cable `i18n.ts` (Register, `tr`, `i18nLite`, Wächter) + inventory/facility `quelle.ts` | `i18n-core` |
| Speicherschlüssel | cable `storageKeys.ts` (ein Register, Namensregel, Version) | `i18n-core`/`persist` |
| Hell/Dunkel | `thema.ts` (vierfach) + `@avplan/ui` `brand.ts` | `theme-core` |
| Rückgängig | cable `projectHistory.ts` (Zusammenfassen, Transaktionen, CRDT-Weitergabe) | `history` (später) |
| Befehlspalette | light `menuModel` (Palette = Menü) + `@avplan/ui` Rangfolge | `ui` |
| Electron-Hauptprozess | cable (CSP, Navigationsschutz, Fenster) + intercom (Absender-Prüfung je IPC) | `electron-base` |
| Einführung | `@avplan/onboarding-core` (fertig, nur nicht verteilt) | verteilen |
| Zusammenarbeit (CRDT), MCP | nur cable | bleibt, bis ein zweiter Planer es braucht |
