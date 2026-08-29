# Verwaiste i18n-Keys in multicam-planner

Beim Drei-Wege-Merge auf den Upstream-Stand (Stufe 3 der Konsolidierung) hat upstream Teile der
Oberflaeche so umgebaut, dass 29 bestehende Uebersetzungs-Keys keine Stelle mehr haben, an die
sie passen. Sie stehen weiterhin im deutschen Dictionary, werden aber von keinem `t()`-Aufruf
mehr benutzt.

**Warum sie nicht einfach zurueckgeschrieben wurden.** Die meisten sind Komposit-Strings, die
Label und Wert in einem trugen (`"Focal Length: {v}mm"`). Upstream hat genau diese Stellen auf
Komponenten umgestellt, die den Wert selbst rendern (`<LensSlider label unit>`,
`<AccordionHeader title count>`). Den alten String ins `label` zu setzen wuerde den Wert doppelt
anzeigen. Ein Key mit erfundener Struktur waere schlimmer als ein fehlender.

**Was das bedeutet.** An diesen Stellen steht derzeit hartkodierter deutscher Text. Die App
bleibt funktionsfaehig, aber diese Labels sind nicht uebersetzbar — was der Konvention
widerspricht, dass Englisch die Quellsprache im JSX ist und Deutsch nur Override.

**Die saubere Nachbesserung** ist pro Zeile: einen Key fuer die neue Komponenten-Form anlegen
(`label={t('sidebar.cam.focalLength.label', 'Focal Length')}`), den deutschen Text unten als
Dictionary-Eintrag setzen und den alten Komposit-Key loeschen.

| Key | Dictionary | Deutscher Text | Warum nicht zurueckgeschrieben |
| --- | --- | --- | --- |
| `header.avplanExport.desc` | `header.ts` | Venue + Kameras + Licht + Verkabelung — verlustfrei über alle drei Apps | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.avplanImport.desc` | `header.ts` | Kameras werden nativ geladen; Licht & Verkabelung bleiben erhalten | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.venueExport.desc` | `header.ts` | Raum, Wände, Bühne & Personen — geteilt mit dem Light-Planner | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.venueImport.desc` | `header.ts` | Ersetzt Raum, Wände, Bühne & Personen; Kameras bleiben erhalten | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.camerasExport.desc` | `header.ts` | Platzierte Kameras werden zu Verkabelungs-Knoten | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.open.desc` | `header.ts` | Gespeichertes MultiCam-Projekt laden | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.export.filesSection` | `header.ts` | Dateien | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.export.imagesSection` | `header.ts` | Bilder (PNG) | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.exportMenu.title` | `header.ts` | Dateien oder Kamera-Ansichten exportieren | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.importMenu` | `header.ts` | Import | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.importMenu.title` | `header.ts` | Projekt- oder Venue-Datei importieren | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.lamps` | `header.ts` | Lampen | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `header.lamps.title` | `header.ts` | Nur-Lese-Lichtgeräte aus dem Light-Planner (.avplan) ein-/ausblenden | Upstream ersetzte das Import-Dropdown durch den "Austausch"-Button (Import UND Export in einem) und machte die Menuezeilen einzeilig — die Beschreibungs-Unterzeile, die diese Keys trugen, existiert nicht mehr. |
| `sidebar.cam.focalLength` | `sidebar.ts` | Brennweite: {v}mm | Komposit-String "Focal Length: {v}mm". Upstream nutzt jetzt <LensSlider label unit>, das den Wert selbst rendert — das Komposit im label wuerde den Wert doppelt anzeigen. |
| `sidebar.cam.aperture` | `sidebar.ts` | Blende: f/{v} | Komposit "Aperture: f/{v}"; jetzt <LensSlider label prefix="f/">. |
| `sidebar.cam.distance` | `sidebar.ts` | Distanz: {v}m | Komposit "Distance: {v}m"; jetzt <LensSlider label unit="m">. |
| `sidebar.cam.pan` | `sidebar.ts` | Schwenk: {v}° | Komposit "Pan: {v}°"; jetzt <ValueSlider label unit="°">. |
| `sidebar.cam.tilt` | `sidebar.ts` | Neigung: {v}° | Komposit "Tilt: {v}°"; jetzt <ValueSlider label unit="°">. |
| `sidebar.cam.height` | `sidebar.ts` | Höhe: {v}m | Komposit "Height: {v}m"; jetzt <ValueSlider label unit="m">. |
| `sidebar.cam.track` | `sidebar.ts` | Fahrweg: {v}m | Komposit "Track: {v}m"; upstream teilte die Steuerung in Schienenlaenge und Fahrweg. |
| `sidebar.stages` | `sidebar.ts` | Bühnen ({n}) | Zaehler im String "Stages ({n})"; <AccordionHeader title count> rendert die Zahl separat. |
| `sidebar.walls` | `sidebar.ts` | Wände ({n}) | Zaehler im String "Walls ({n})"; gleiche AccordionHeader-Aufteilung. |
| `sidebar.objectsPersons` | `sidebar.ts` | Objekte & Personen ({n}) | Zaehler im String; gleiche AccordionHeader-Aufteilung. |
| `sidebar.cameras` | `sidebar.ts` | Kameras ({n}) | Zaehler im String; Kamera-Header ist jetzt Inline-JSX mit eigener Count-Pille. |
| `sidebar.cam.depthOfField` | `sidebar.ts` | Schärfentiefe | War die Ueberschrift einer eigenen DoF-Box, die upstream entfernt hat; die Zeilen liegen jetzt in <Group title="Ergebnis">. |
| `sidebar.cam.dofNearFar` | `sidebar.ts` | Nah: {near} | Fern: {far} | War eine kombinierte Zeile; upstream teilte sie in zwei <Readout>-Zeilen. |
| `sidebar.cam.dofTotal` | `sidebar.ts` | Gesamt: {v} | Komposit "Total: {v}"; jetzt <Readout label value> mit getrennten Props. |
| `sidebar.cam.xM` | `sidebar.ts` | X (m) | War das sichtbare Label ueber dem X-Feld; upstream fasst beide Achsen unter <FieldRow label="Position (m)"> mit reicherem aria-label. |
| `sidebar.cam.yM` | `sidebar.ts` | Y (m) | Wie xM, fuer die Y-Achse. |

## Bestand insgesamt

Ein mechanischer Abgleich aller `t()`-Aufrufe gegen `src/i18n/de/*.ts` zaehlt **46 verwaiste
Keys von 491**. 29 davon stammen aus diesem Merge, die uebrigen 17 sind aelter und unabhaengig
davon entstanden — sie sind hier nicht aufgefuehrt, sollten aber beim Aufraeumen mitgenommen
werden.

Nachzaehlen:

```bash
# benutzte Keys gegen Dictionary-Keys abgleichen
grep -rhoE "\bt\(\s*['\"][A-Za-z0-9_.]+" apps/multicam-planner/src --include="*.ts*" \
  | grep -v "/i18n/" | sed -E "s/.*['\"]//" | sort -u > /tmp/used.txt
```

