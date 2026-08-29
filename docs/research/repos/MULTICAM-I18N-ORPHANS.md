# i18n-Aufraeumen in multicam-planner

Der Drei-Wege-Merge auf den Upstream-Stand ersetzte 42 `t()`-Aufrufe durch hartkodiertes Deutsch,
weil upstream genau die betroffenen Oberflaechen-Teile umgebaut hatte. Dieses Dokument haelt fest,
was daraus wurde.

## Stand

| | Keys |
| --- | --- |
| verwaist direkt nach dem Merge | 46 von 491 |
| **verwaist jetzt** | **10 von 479** |

Die zehn verbliebenen sind an ihren Namen als vorbestehend erkennbar und haben mit dem Merge
nichts zu tun: `sidebar.ai.task.scale/stages/walls`, `sidebar.form.camType.*` (sechs Kamera-Typen)
und `store.unsupportedFormat`.

## Was gemacht wurde

**13 Keys liessen sich unveraendert zurueckschreiben** — dort hatte der Merge lediglich den
`t()`-Aufruf durch das deutsche Literal ersetzt, ohne die Struktur zu aendern.

**16 Sidebar-Keys wurden neu angesetzt.** Der Grund fuer das Nicht-Zurueckschreiben war
strukturell: die alten Keys trugen Komposit-Strings wie `'Focal Length: {v}mm'`, waehrend upstream
auf `<LensSlider label unit>` umgestellt hat, das den Wert selbst rendert. Das Komposit ins
`label` zu setzen haette den Wert doppelt angezeigt. Neue Keys tragen deshalb nur noch das Label:

| alt (Komposit) | neu (nur Label) | DE |
| --- | --- | --- |
| `sidebar.cam.focalLength` | `sidebar.cam.focalLength.label` | Brennweite |
| `sidebar.cam.aperture` | `sidebar.cam.aperture.label` | Blende |
| `sidebar.cam.distance` | `sidebar.cam.distance.label` | Fokusdistanz |
| `sidebar.cam.pan` | `sidebar.cam.pan.label` | Schwenk (Pan) |
| `sidebar.cam.tilt` | `sidebar.cam.tilt.label` | Neigung (Tilt) |
| `sidebar.cam.height` | `sidebar.cam.height.label` | Objektivhoehe |
| `sidebar.cam.track` | `sidebar.cam.track.label` | Fahrweg |
| `sidebar.cam.dofNearFar` | `sidebar.cam.dofNear` + `sidebar.cam.dofFar` | Schaerfe von / bis |
| `sidebar.cam.dofTotal` | `sidebar.cam.dofTotal.label` | Schaerfentiefe gesamt |
| `sidebar.stages` | `sidebar.stages.title` | Buehnen |
| `sidebar.walls` | `sidebar.walls.title` | Waende |
| `sidebar.objectsPersons` | `sidebar.objectsPersons.title` | Objekte & Personen |
| `sidebar.cameras` | `sidebar.cameras.title` | Kameras |
| `sidebar.cam.xM` / `.yM` | `sidebar.cam.position` | Position (m) |

Dazu neu, weil upstream die Steuerung aufgeteilt hat: `sidebar.cam.railLength.label`
(Schienenlaenge) neben `sidebar.cam.track.label` (Fahrweg), und `sidebar.cam.mount.label`.

**Der Header wurde auf das Austausch-Menue umgestellt.** Upstream hat die frueheren Einzel-Buttons
(.avplan, Venue, Cable) in ein Menue gebuendelt. `header.inventory` und `header.inventory.title`
passten exakt auf den Lager-Button und wurden wiederhergestellt; fuer das Menue selbst kamen
`header.exchange`, `header.exchange.title` und drei Abschnitts-Ueberschriften dazu, sowie
`header.foreignLamps.show/hide` fuer die Zeile mit dynamischer Beschriftung.

## Was bewusst nicht gemacht wurde

Achtzehn `header.*`-Keys wurden geloescht statt umgehaengt — die `.desc`-Varianten und die
`.title`-Tooltips der alten Einzel-Buttons. Upstreams Menuezeilen sind einzeilig und tragen weder
Beschreibungs-Unterzeile noch Tooltip. Sie dort einzufuehren waere eine Design-Aenderung an
fremdem Feature-Code gewesen, keine Uebersetzungs-Reparatur.

## Grundsatz

Ein Key mit erfundener Struktur ist schlimmer als ein fehlender: er taeuscht Uebersetzbarkeit vor,
wo keine ist, und die naechste Person haelt die Stelle fuer erledigt. Deshalb wurde in jedem Fall
entweder ein Key angesetzt, der zur neuen Komponenten-Form passt, oder der alte ersatzlos
entfernt.

## Nachzaehlen

```bash
cd apps/multicam-planner/src
# im Code benutzte Keys
grep -rhoE "\bt\(\s*['\"][A-Za-z0-9_.]+" . --include="*.ts*" \
  | grep -v "/i18n/" | sed -E "s/.*['\"]//" | sort -u > /tmp/used.txt
# Keys im Dictionary
grep -rhoE "^\s*'[A-Za-z0-9_.]+'\s*:" i18n/de/ | tr -d " ':" | sort -u > /tmp/dict.txt
comm -13 /tmp/used.txt /tmp/dict.txt   # verwaist
```
