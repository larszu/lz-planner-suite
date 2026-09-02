# ADR-005: Verlustfrei oder laut

Status: entschieden · Datum: 2026-09-01 · Betrifft: Design-Regel 2 und Abschnitt 6.2 aus
[`FEATURE-STRATEGY.md`](../research/synthesis/FEATURE-STRATEGY.md).

## Das Problem

Die Strategie führt sechs Design-Regeln, die jedes Feature erfüllen muss. Regel 2 ist die einzige,
die dort mit einem Superlativ steht:

> **Ein Import, der ein Feld nicht bewahren kann, muss verweigern statt es zu verwerfen.** Stiller
> Datenverlust ist der schädlichste Integrationsfehler, der in Rollen- *und* Wettbewerbsrecherche
> genannt wurde.

Abschnitt 6.2 nennt dazu ausdrücklich unseren eigenen Code als Änderungskandidaten: `.avplan` reicht
fremde Domänen als `unknown` durch, und das Format solle „toward explicit refusal rather than opaque
pass-through" gehen.

## Der Befund im eigenen Code

Ein Audit lief über elf Austauschpfade in acht Repositories. **Wichtige Einschränkung vorweg:** die
gegnerische Prüfstufe des Audits brach nach drei von 66 Befunden am Sitzungslimit ab. Die Tabelle
unten führt deshalb **ausschließlich Befunde, die anschließend von Hand im Code nachgelesen wurden.**
Die übrigen 63 liegen als ungeprüfte Hinweise im Workflow-Journal und sind für diesen ADR keine
Tatsachen — sie sind Kandidaten für eine spätere Runde.

| Stelle | Befund |
| --- | --- |
| `multicam-planner/src/store/useStore.ts:951` | **Verstoß, heute, echte Datenverluste.** `avForeign` ist reiner Zustand-Store-State. `saveProject` (Zeile 843) schreibt neun benannte Keys ins `.mcplan` — `avForeign` ist keiner davon. Wer eine `.avplan` importiert, speichert, neu öffnet und exportiert, liefert `domains.lighting` und `domains.cabling` als `undefined` aus: der komplette Licht- und Kabelplan der Nachbar-Apps ist weg. Der Typkommentar in Zeile 145 verspricht wörtlich „beim Export 1:1 wieder mitgibt — damit nichts verloren geht". Das gilt nur innerhalb einer ununterbrochenen Sitzung. |
| `light-planner/src/App.tsx:775` | **Derselbe Verstoß, zweite App.** `preservedDomainsRef` ist ein `useRef`, also RAM. `handleSaveToFile` (Zeile 1138) schreibt `ProjectData` ohne Fremd-Domänen. Import, speichern, neu öffnen, exportieren — `domains.cameras` und `domains.cabling` sind fort. |
| `light-planner/src/App.tsx:826` | **Verstoß gegen eigene Daten.** Beim `.avplan`-Import wird `base` aus `domains.lighting` geladen — das ist light-planners eigener, vollständiger Stand — und danach mit `walls: r.walls` aus der Venue-Projektion überschrieben. Die Projektion führt `id,x1,y1,x2,y2,height,label,cx,cy,reflectance,color`; `Wall.material` und `Wall.windows` führt sie nicht. Fenster tragen `transmittance` und `tint` und gehen in die Lichtrechnung ein. Light-planner zerstört sie beim Öffnen einer Datei, die es selbst geschrieben hat. |
| `cable-planner/src/renderer/lib/avplan.ts` | **Macht es richtig — und zeigt damit den Fix.** `avForeign` liegt im `CablePlannerProject` selbst, überlebt also das native `.cp`-Speichern. Der Dateikopf sagt das ausdrücklich. Was in den beiden anderen Planern fehlt, ist hier bereits gebaut. |
| `cable-planner/src/renderer/lib/sourceMap.ts` | **Halbes Vorbild, und die Hälfte ist die wichtige.** Unbekannte Keys wandern beim Lesen in ein `extra`-Fach (`collectExtra`, Zeile 118), und `mergeSourceMap` meldet jeden davon in `unrepresented` (Zeile 356). Das ist Regel 2 wörtlich: sagen statt still verwerfen. Kein Schreiber gibt `extra` je wieder aus, ein voller Round-Trip bewahrt sie also trotzdem nicht — aber der Nutzer wurde informiert, und das ist der Unterschied, auf den es ankommt. |

Was der ADR **nicht** behauptet: dass alle elf Pfade kaputt seien. Der Audit hat je Pfad auch
gemeldet, was er für sauber hielt; diese Freisprüche sind aus demselben Grund ungeprüft wie die
Befunde und stehen deshalb hier nicht als Entlastung.

## Die Entscheidung

**Verlustfrei oder laut.** Ein Pfad, der ein Feld nicht bewahren kann, hat genau zwei zulässige
Ausgänge: er bewahrt es opak, oder er sagt hörbar, dass er es nicht kann. Der dritte, heutige Ausgang
— es fallenzulassen und weiter „verlustfrei" auf den Dateikopf zu schreiben — ist der einzige, der
ausgeschlossen wird.

Vier Regeln, jede für sich prüfbar:

1. **Was eine App nicht bearbeitet, gehört in ihre Projektdatei, nicht in ihren Speicher.** Fremde
   Domänen im RAM zu halten ist keine Bewahrung, sondern eine Bewahrung bis zum nächsten Neustart.
   Der Test dafür ist mechanisch: importieren, speichern, neu laden, exportieren, vergleichen.
2. **Eine Projektion darf den vollen Stand nicht überschreiben.** Wo dieselbe Information in zwei
   Auflösungen in derselben Datei liegt, gewinnt die höhere. Der geteilte Raum ist eine Sicht auf die
   Wand, nicht die Wand.
3. **Wer nicht bewahren kann, sagt es an der Stelle, an der es passiert.** `unresolved` /
   `unrepresented` aus dem `.avsourcemap` ist die Form: eine Liste dessen, was nicht mitkam, im
   Ergebnis des Imports — nicht in einem Log, das niemand liest.
4. **Ein Dateikopf, der „verlustfrei" behauptet, ist eine prüfbare Zusage.** Entweder ein Test hält
   sie, oder der Satz kommt raus. Das ist dieselbe Regel wie in ADR-003 für Feldnamen und in ADR-004
   für Revisions-Stempel: kein Text darf mehr behaupten, als der Code hergibt.

## Warum nicht „einfach alles verweigern"

Abschnitt 6.2 verlangt „explicit refusal". Wörtlich genommen wäre das falsch, und zwar teuer:
Verweigerung und Bewahrung beantworten verschiedene Situationen.

**Bewahren**, wenn das unbekannte Feld die App nicht betrifft. Eine `.avplan` mit `domains.audio`
soll der Kabelplaner öffnen können — er muss den Audio-Teil nur unangetastet wieder mitgeben. Eine
Verweigerung wäre hier reiner Schaden: sie macht eine Datei unbenutzbar, die verlustfrei durchgereicht
werden könnte.

**Verweigern**, wenn das unbekannte Feld die App *betrifft* und sie es beim Schreiben zwangsläufig
falsch darstellen würde. Eine Wand mit `windows`, die diese App als solide Wand rendert und als
solide Wand zurückschreibt, hat kein Bewahrungsproblem, sondern ein Wahrheitsproblem.

**Melden**, wenn keins von beidem geht. Das ist der häufigste Fall und der, den `.avsourcemap` schon
kann.

Die Fassung der Regel lautet deshalb nicht „verweigere", sondern: **schweige nie.**

## Was verworfen wurde

**Ein `extra`-Fach in jeden Typ.** Naheliegend, weil `sourceMap` es hat. Aber der schwerste
verifizierte Verlust — RAM statt Datei — hätte davon gar nichts gehabt: die Domänen waren korrekt
geparst und vollständig im Speicher, sie kamen nur nie in die Datei. Ein `extra`-Fach hätte die
Diagnose sogar erschwert, weil es nach getaner Arbeit aussieht.

**Ein gemeinsames Austauschpaket in `packages/`.** Die drei Planer sind vendored Kopien mit
gemessener Drift; ein geteiltes Format-Paket ist Konsolidierungs-Stufe 4 und ein eigenes Vorhaben.
Es hier vorwegzunehmen hieße, eine Abstraktion vor die Fehlerbehebung zu setzen.

**Den Dateikopf abschwächen statt den Code reparieren.** „Weitgehend verlustfrei" wäre in zehn
Minuten geschrieben. Es wäre die ehrliche Beschreibung eines Zustands, den niemand haben will.

## Die Reihenfolge

| # | Inkrement | Warum hier |
| --- | --- | --- |
| 1 | Fremd-Domänen in `multicam-planner` und `light-planner` in die Projektdatei aufnehmen, mit Round-Trip-Test | Der einzige verifizierte Verlust *echter Nutzerdaten heute*. Ein Mechanismus, zwei Apps, und der Fix steht im `cable-planner` schon fertig da |
| 2 | `light-planner`: die Venue-Projektion überschreibt die eigenen vollwertigen Wände nicht mehr | Ebenfalls heute und ebenfalls verifiziert, aber es betrifft eine App und braucht eine Feldzusammenführung statt eines zusätzlichen Feldes |
| 3 | Die 63 ungeprüften Audit-Hinweise nachprüfen, jeden einzeln im Code — **läuft**, siehe Protokoll unten | Sie sind Hinweise, keine Befunde. Sie ungeprüft abzuarbeiten hieße, Arbeit an erfundenen Fehlern zu leisten — genau das, wovor die Regel schützt |
| 4 | Unbekannte `domains.*`-Slots und Wurzel-Keys bewahren (das `extra`-Muster für `.avplan`) | Braucht heute noch keine vierte App. Nach 1–3, weil hypothetischer Verlust nach echtem kommt |
| 5 | Erfundene Werte an der Naht zwischen zwei Apps — `multicam#79`, `light#46` | **Fällt aus der Reihenfolge, weil es aus Inkrement 3 herausgewachsen ist.** Kein hypothetischer Fall: hier steht heute eine falsche Zahl in einer Datei, an der der Nachbar rechnet |

Inkrement 4 bewusst zuletzt: es war die Ausgangshypothese dieses ADRs und stellte sich als der
*harmloseste* der gefundenen Fälle heraus. Das ist selbst ein Ergebnis — siehe unten.

## Was die Untersuchung gelehrt hat

**Die Ausgangshypothese war die schwächste Version des Problems.** Angenommen war ein hypothetischer
vierter Domänen-Slot, der einer künftigen App gehören würde. Gefunden wurde, dass zwei von drei
Planern die Pläne der *existierenden* Nachbar-Apps auf dem normalen Weg — importieren, speichern,
morgen weiterarbeiten — vollständig verlieren. Wer nur nach dem Fall gesucht hätte, den er sich
vorher ausgedacht hat, hätte den echten übersehen.

**Ein abgebrochener Audit ist kein kleiner Audit.** Von 66 Roh-Befunden haben drei die gegnerische
Prüfung erreicht, bevor das Sitzungslimit zuschlug. Die Versuchung, die restlichen 63 als Befundliste
zu übernehmen, ist genau der Fehler, gegen den die Prüfstufe eingebaut war. Sie stehen deshalb als
Inkrement 3 in der Reihenfolge und nicht in der Befundtabelle.

**Das Vorbild im eigenen Haus war halb so gut wie behauptet.** `sourceMap` hebt unbekannte Keys beim
Lesen in ein `extra`-Fach — aber kein Schreiber gibt sie je aus. Der Teil, der wirklich trägt, ist
ein anderer: `unrepresented` sagt dem Nutzer, was nicht mitkam. Beim ersten Hinsehen war das eine
Nebensache neben dem `extra`-Fach; beim Nachlesen ist es die Hauptsache.

## Protokoll der Nachprüfung (Inkrement 3)

Jeder Hinweis wird einzeln im Code nachgelesen, bevor ein Satz daraus zur Tatsache wird. Das
Ergebnis steht hier — auch dann, wenn es „Hinweis hält nicht" lautet, denn ein Freispruch erspart
der nächsten Runde dieselbe Arbeit.

| Hinweis | Ergebnis |
| --- | --- |
| `inventoryStore.importSnapshot` verwirft ganze Entitäten still und meldet nur die Überlebenden | **Bestätigt, behoben** in `cable-planner#614`. Aber anders als behauptet: das *Abweisen* ist richtig — ein Lagerort ohne Namen ist kein Lagerort. Falsch war das Verschweigen. Der Import liefert jetzt einen Bericht mit einem wiederauffindbaren Griff je abgewiesener Zeile, und der Dialog wechselt auf Warnton statt grün zu melden. Der bestehende Test hatte das Schweigen als Sollverhalten festgeschrieben. |
| `rentmanTemplateCache.toTemplateFromEquipment` baut aus 36 benannten Keys neu und verwirft ~50 | **Bestätigt, aber die Zahl trägt nicht.** 97 Felder auf `EquipmentItem`, 36 kopiert, 58 nicht. Der grösste Teil davon *gehört* nicht in ein Template: `assetTag`, `serialNumber`, `qrId`, `installStatus`, `videohubRouting` sind Instanz-Eigenschaften, sie zu kopieren wäre der umgekehrte Fehler. Der echte Schaden ist **ein einziges Feld**: `deviceTypeId`. Behoben in `cable-planner#615`. |
| `netboxMapping` baut den `EquipmentItem` aus benannten Properties, `custom_fields`, `tags`, `comments`, `status`, `tenant` erreichen den Plan nie | **Hinweis hält nicht.** Zwei Gründe. Erstens erreichen die genannten Datenblatt-Felder den Plan sehr wohl: `serial`, `asset_tag`, `description` und Hersteller/Modell wandern in einen quellenbenannten `notes`-Block, das Modell zusätzlich in `subtitle`. Zweitens — und das entscheidet — ist die NetBox-Anbindung **lesend**: der API-Client kennt kein POST, PATCH, PUT oder DELETE, die IPC-Fläche besteht aus Token-Verwaltung, Verbindungstest und Abruf. Es gibt keinen Rückweg, auf dem etwas verloren gehen könnte. NetBox bleibt das führende System; der Plan modelliert einen Ausschnitt. Das ist eine **Grenze, kein Verlust** — dieselbe Unterscheidung wie beim `.gg5`-Export in ADR-003. |

| `graphml/semantics` verliert custom node/edge data beim Rebuild | **Hinweis hält nicht, aus demselben Grund wie NetBox.** GraphML ist rein lesend: die einzige IPC-Fläche ist `graphml:open-file`, einen Export gibt es nicht. Die Quelldatei bleibt, wo sie ist, und die importierten Elemente tragen `graphmlId` / `graphmlEdgeId` als Rückverweis. Grenze, kein Verlust. |
| `exportGreengo` rebaut eine importierte `.gg5` aus benannten Properties | **Bestätigt — der schwerste Fall dieser Runde.** Anders als NetBox und GraphML hat Green-GO Importer *und* Exporter, also einen echten Round-Trip. `parseGg5File` liest `Settings`, `Users`, `Groups`; `exportGreengo` schreibt zusätzlich `Channels`, `SpecialChannels`, `ScriptSettings` und `UserSettings` aus **hartkodierten Defaults**. Importieren, eine Gruppe ändern, exportieren — und die Tastenbelegungen einer Intercom-Anlage kommen leer zurück. Der Modulkopf des Importers zählt „Devices, Rooms, Templates, …" sogar selbst auf. Gemeldet in `cable-planner#616`; die *Bewahrung* wartet auf eine Design-Entscheidung (siehe unten). |
| `healProjectPositions` baut jede `sourceIdentity` aus einer festen Feldliste und löscht Rollen still | **Bestätigt, aber heute nicht nachweisbar auslösend.** `normaliseSourceIdentities` verwirft wortlos: eine Rolle ohne Namen, eine mit doppelter Id, und `clearDanglingIdentity` streicht danach die Verweise der Geräte darauf — eine Kamera verliert also ihre TSL-Adresse, ohne dass irgendwo etwas steht. Das ist Code aus ADR-001, und die Regel greift auf ihn genauso. Ausgelöst wird es aber nur von einem hand-editierten Projektfile, einem Merge-Konflikt in einer `.cp` oder einem Stand aus einer künftigen Version; die eigene Oberfläche erzeugt keine namenlose Rolle. Deshalb **nicht** vorgezogen: ADR-005 sortiert nach „real heute und billig", und dieser Fall ist real, aber nicht als heute auftretend belegt. Er braucht ohnehin etwas, das noch fehlt — einen Kanal für Lade-Hinweise, siehe unten. |
| `buildSourceMap` stempelt jeden Wert als `planned`, `mergeSourceMap` liest `provenance` nie | **Bestätigt, gemeldet** in `cable-planner#618`. `.avsourcemap` ist beidseitig, also nach der Triage-Regel ein Kandidat — und der Verlust ist echt: ein von einer Runtime als `confirmed` gemeldeter Wert kommt als `planned` wieder heraus. Der Fund ist aber weniger die Zeile als der Grund, warum die vorhandene Schutzmaschinerie danebengreift: `collectExtra` hebt nur *unbekannte* Schlüssel ins `extra`-Fach, und `provenance` ist bekannt. **Ein Schlüssel, dessen Namen wir kennen und den wir trotzdem nicht halten können, ist schlimmer als ein unbekannter** — der Auffangmechanismus rettet, was er nicht versteht, und lässt fallen, was er benennen kann. Gemeldet statt verweigert: der Wert wird weiter übernommen, ein Test hält das fest. Die *Bewahrung* wäre ADR-003 Inkrement 2 (siehe unten). |
| Kabel-Eimer legt N Rentman-Stammartikel auf eine Id, der Export bucht die volle Menge darauf | **Bestätigt, behoben** in `cable-planner#619` — aber nicht dort, wo der Hinweis zeigte. Rentman nimmt keinen Schaden (POST-only), und der Import-Dialog *sagt* die Zusammenfassung sogar („2 Einträge"). Der Fehler lag daneben: die übrigen Ids wurden beim Import weggeworfen, und der Export-Dialog baut seine Eimer aus dem Projektfile. Er **konnte** im Moment der Buchung strukturell nicht wissen, dass er auf einen von mehreren Artikeln bucht. Der Hinweis steht also dort, wo nichts passiert, und fehlte dort, wo gebucht wird. |
| `healRentmanCableMap` baut jeden Eintrag aus zwei bekannten Schlüsseln neu — „kosmetisch, nur mit einem hypothetischen künftigen Feld" | **Bestätigt, und die Einstufung war der Fund.** Der Fix oben fügt genau dieses Feld hinzu. Damit wird aus der Kosmetik ein Verlust: **ein** altes Projektfile mit `lastSyncedQty` lässt `changed` greifen, und der Neuaufbau nimmt die Zusammenfassung beim nächsten Laden mit. Dieselbe Form steckte in `setMapping` und `sendBucket`, wo schon das erste Umzuordnen gereicht hätte. Lehre: ein „kosmetischer" Befund ist eine **Falle mit Zeitzünder** — er ist genau so lange harmlos, bis jemand das Feld hinzufügt, das ihn scharf macht. |
| `toTemplateFromEquipment` verwirft „~50" Felder | **Bestätigt, behoben** in `cable-planner#620`; die Zahl trägt wieder nicht, die Struktur darunter schon. Drei Funktionen bauen ein Template aus einem `EquipmentItem` — 37, 23 und 15 Felder — und **die beiden kleineren sind echte Teilmengen der größten.** Keine weiss etwas, das der Cache nicht auch weiss; sie sind nicht anders gemeint, sondern ärmer. Weil `upsertCachedRentmanTemplate` *ersetzte*, gewann immer die ärmste Fassung, die zuletzt vorbeikam: „Als Template speichern" auf einem Rentman-Gerät löschte Rack-Höhe, Leistung, Gewicht und Tiefe — in einem projektübergreifenden Cache. Fortschreiben statt Ersetzen, dritte Anwendung derselben Regel. |
| Der Synthese-Zweig in `healRentmanLibraryFromProject` nennt 15 Felder | **Bestätigt, behoben** im selben PR. Hier wird nichts zerstört, sondern zu arm *erzeugt*: die Vorlage entsteht neu (Fall #171 — fremder Rechner, geleerte Library), und wer danach eine zweite Kopie herauszieht, bekommt ein Gerät ohne Leistungsaufnahme, ohne Tiefe, ohne Katalog-Identität. Ergänzt wurden nur Felder, über die der Cache-Pfad in diesem Repo bereits entschieden hat — keine neue Klassifikation, sondern die drei Fassungen in Übereinstimmung gebracht. |
| Der Videohub-Routing-Dump schreibt jeden Ausgang als entsperrt | **Bestätigt, behoben** in `cable-planner#621` — und der erste Befund dieser Runde, bei dem Information nicht verloren, sondern **erfunden** wird. `U` ist im Protokoll keine Leerstelle, sondern die Anweisung *zu entsperren*; der Dump ist zum Weiterverwenden gemacht (Zwischenablage, „Import routing"), und eine Sperre schützt typischerweise einen Live-Weg. Der Plan kennt keine Sperr-Absicht und hat sich eine ausgedacht, und zwar die gefährliche Richtung. |
| Der Rentman-Importer baut für jeden Datensatz ein `raw`-Fach und liest es nie | **Hinweis hält nicht** — dritte Widerlegung, wieder über den Rückweg. `raw` wird an genau einer Stelle geschrieben und an keiner gelesen, erreicht aber nie die Persistenz, und der Export ist POST-only: der Quelldatensatz bleibt in Rentman. Grenze, kein Verlust. Bemerkenswert bleibt die **Umkehrung zum `.avsourcemap`-Fall**: dort ein Schlüssel, dessen Namen wir kennen und den wir nicht halten können; hier eine Tasche, die alles hält und nie geöffnet wird. Beide täuschen Sicherheit vor, aus entgegengesetzten Richtungen. |

Zwischenstand nach zwanzig nachgeprüften Hinweisen: **sechzehn bestätigt, vier widerlegt.** Von den
fünfzehn sind dreizehn behoben (`#614`, `#615`, `#617`, `#619` ×2, `#620` ×2, `#621`,
`multicam#79`, `light#46`, `multicam#80`, `light#47`, `multicam#81`, `multicam#82`, `light#48`)
und zwei gemeldet,
aber noch nicht bewahrt (`#616`, `#618`) — beide, weil die Bewahrung eine Entscheidung braucht, die
diesem Audit nicht gehört. Knapp ein Drittel der geprüften Hinweise hielt der Nachlese nicht stand;
das ist der Grund, warum die 63 nicht ungeprüft in die Befundtabelle durften.

Alle vier Widerlegungen hatten dieselbe Ursache — der fehlende Rückweg. Die Triage-Regel unten hat
sich damit vierfach bewährt und sollte am Anfang jeder weiteren Nachlese stehen.

### Die Triage-Regel, die sich daraus ergibt

Beide Widerlegungen hatten dieselbe Ursache: der Audit hat „der Plan modelliert X nicht" mit „X ging
verloren" verwechselt, weil er nie nach dem **Schreibpfad** gefragt hat.

> **Erste Frage bei jedem verbleibenden Hinweis: gibt es überhaupt einen Rückweg?**
> Ohne Exporter, ohne POST/PATCH, ohne Speichern in dasselbe Format kann nichts verloren gehen — das
> führende System behält seine Daten, und der Plan modelliert einen Ausschnitt. Das ist eine Grenze
> und gehört benannt, nicht repariert.

Angewandt auf die bisher gesehenen Pfade: NetBox lesend, GraphML lesend, Green-GO beidseitig,
native Projektdateien beidseitig, `.avplan` beidseitig, `.avsourcemap` beidseitig. Die Suche nach
echten Verlusten gehört in die zweite Gruppe.

### Der Nachtrag, der aus Inkrement 3 herauswuchs: erfundene Werte an der Naht

Der Videohub-Fund (`cable-planner#621`) war der erste Befund dieser Untersuchung, bei dem nicht
Information *fehlte*, sondern welche **hergestellt** wurde. Die Suche nach weiteren Fällen dieser
Art führte auf ein Paar — und das Paar ist die eigentliche Lehre.

| Fall | Was geschah |
| --- | --- |
| `multicam-planner#79` | MultiCams Bühne ist eine flache 2D-Zone, aber `height` ist im Austauschtyp **Pflicht**. Der Export schrieb deshalb für jede Bühne `height: 0`. Ein 0,6 m hohes Podest aus dem Light-Planner kam nach einem Round-Trip als flacher Boden zurück. Der **Vertrag erzwang die Erfindung** — deshalb der Umweg über Aufheben statt über eine Änderung an `VENUE_EXCHANGE_VERSION` |
| `light-planner#46` | Light modelliert keine Raumgröße und liess `widthM`/`heightM` weg — für sich genommen **richtig**. Aber MultiCams Import setzt für ein fehlendes Mass seinen Standard ein (20 × 12 m). Ein 30 × 18 m grosser Raum schrumpfte bei jedem Round-Trip durch light |
| `multicam-planner#80` | MultiCams `BackgroundPlan` ist eine Bitmap mit Massstab und Versatz — kein Name, kein Sperr-Flag, keine Seitenzahl, keine Quellenangabe. `bgToFloorPlan` schrieb unbedingt `kind: 'image'`. Aus *Seite 3 von 5 eines gesperrten `EG_Grundriss.pdf`* wurde ein namenloses, entsperrtes Bild ohne Seitenbezug |
| `light-planner#47` | Lights `Person` ist eine menschliche Figur; MultiCam kennt an derselben Stelle ein allgemeines Bühnen-Objekt — Schlagzeug, Rednerpult, Stuhl — mit `width`, `objectType`, `color`. Light liess die drei fallen, MultiCam setzt beim Import `objectType: 'person'` und `width: 0.5` ein: aus einem 1,4 m breiten Schlagzeug wurde eine 0,5 m breite Person. **Das Objekt war nicht weg — es war etwas anderes geworden.** Von allen vier Fällen der mit dem schärfsten Symptom: der Plan sieht vollständig aus und ist falsch |

Beide Seiten waren **einzeln vertretbar**: schweigen, wenn man nichts weiss; einen Standard setzen,
wenn nichts dasteht. Regel 3 dieses ADRs verlangt sogar ausdrücklich das erste. Erst die Kombination
lügt.

> Ein Verlust entsteht nicht immer *in* einer App. Er kann in der Naht zwischen zweien entstehen,
> in der beide sich korrekt verhalten.

Daraus folgt auch, wer repariert: **der, der die Information hatte und weggeworfen hat** — nicht
der, der einen Standard braucht. MultiCams `?? 20` für einen wirklich unbekannten Raum bleibt
richtig, und light erfindet weiterhin keine Raumgröße, wenn es keine bekommen hat.

**Die Regel hat sich sofort bewährt.** Die ersten beiden Fälle wurden gefunden, weil ein Hinweis
zufällig darauf zeigte. Der dritte (`multicam#80`, Gebäudeplan) und der vierte (`light#47`,
Bühnen-Objekte) wurden **gezielt gesucht**: dieselbe Konstellation auf dem jeweils nächsten
gemeinsamen Datenpfad. Beide lagen genau dort, wo die Regel sie vorhersagte.

Eine aus zwei Fällen abgeleitete Regel hätte Zufall sein können. **Zwei Treffer bei zwei bewussten
Anwendungen sind ein Beleg** — und der Grund, die restlichen Hinweise nach Datenpfad zu ordnen,
bevor die nächste Runde beginnt.

### Was der erste systematische Pfad-Durchgang ergab

Das Rezept wurde als Nächstes nicht auf einen Hinweis, sondern auf einen ganzen **Datenpfad**
angewandt: die Wände. Ergebnis (`multicam-planner#81`) — **drei verschiedene Fehler übereinander**,
von denen nur einer die Klasse ist, für die das Rezept gedacht war:

| | Fehler | Klasse |
| --- | --- | --- |
| 1 | `importVenueExchange` setzte `walls` im Ganzen neu und löschte damit bei jedem Venue-Import `pattern`, `patternImage`, `patternFit`, `patternRows` — die Wand-Muster des Nutzers | **Regel 2**, derselbe Fehler, den `light#45` für light behob und der in MultiCam noch stand |
| 2 | Light kennt `cx`/`cy` (Krümmung) und `reflectance`, MultiCams Wand ist eine Strecke; beides fiel weg, lights Import setzt danach `reflectance ?? 0.5` | **Naht**, wie vorhergesagt. Eine fehlende Krümmung heisst nicht „unbekannt", sondern *gerade* |
| 3 | `color` modelliert MultiCam **selbst** und schrieb es trotzdem nicht ins Austauschformat, das es auch kennt — blaue Wand, grau zurück | **Schlicht vergessen.** Keine Modellierungslücke, kein Vertragsproblem |

Fehler 1 und 3 hat **kein Audit-Hinweis gemeldet.** Sie fielen auf, weil der Durchgang eine andere
Frage stellt als die Hinweisliste:

> Nicht „stimmt dieser Hinweis?", sondern **„was passiert mit diesem Feld auf dem ganzen Weg?"**

Das ist der eigentliche Ertrag. Die 63 Hinweise waren nie die Landkarte — sie waren der Anlass,
hinzusehen. Wer die Liste abarbeitet, ist fertig, wenn die Liste leer ist; wer die Pfade abgeht,
ist fertig, wenn die Pfade abgegangen sind. Nur das Zweite ist eine Aussage über die Software.

Das gemeinsame Muster aller vier, als Prüfrezept formuliert:

> Nimm ein Feld des Austauschformats. Frage: modelliert es eine der Apps **nicht**? Wenn ja: was
> macht die andere beim Import, wenn es fehlt — nichts, oder einen Standardwert einsetzen? Steht
> dort ein Standardwert, hast du einen Fall.

Und es folgt etwas über die Methode: **ein Audit, das jede App für sich prüft, findet diese Klasse
nie.** Der ursprüngliche Audit hat beide Hälften auch tatsächlich gemeldet — als zwei getrennte,
harmlos klingende Zeilen in zwei verschiedenen Repos. Erst nebeneinander gelegt ergeben sie einen
Fehler. Wer die nächste Runde plant, sollte die Hinweise deshalb **nach Datenpfad** gruppieren, nicht
nach Datei.

### Die Venue-Austausch-Fläche, vollständig abgegangen

Nach dem Wand-Durchgang wurde nicht mehr die Hinweisliste abgearbeitet, sondern **jeder Pfad des
geteilten Raums** — bis keiner mehr offen war. Das Ergebnis:

| Pfad | Ergebnis |
| --- | --- |
| Bühnen-Höhe | `multicam#79` |
| Raum-Maße | `light#46` |
| Gebäudeplan (Herkunft, Seite, Name, Sperre) | `multicam#80` |
| Bühnen-Objekt-Art | `light#47` |
| Wände — Muster (Regel 2), Krümmung + Reflexion (Naht), Farbe (vergessen) | `multicam#81` |
| Pose und Blickrichtung (Naht), eigene Sperre (Regel 2) | `multicam#82` |
| Raum-Name | `light#48` |
| Gebäudeplan, Gegenrichtung | **sauber** — light schreibt und liest alle Felder, die Maßstabs-Umrechnung ist eine exakte Inverse |
| Bühnen, Gegenrichtung | **sauber** — das Austauschformat hat gar kein `type`-Feld; die eine echte Folge hatte `light#45` schon behoben |

**Zwei von neun Pfaden brauchten keinen Fix.** Das gehört mit ins Ergebnis: ein abgegangener Pfad
ohne Fund ist eine Aussage, ein nicht abgegangener ist keine. Ohne diese beiden Zeilen sieht die
nächste Runde dort noch einmal nach.

Drei wiederkehrende Formen, sortiert nach Häufigkeit:

1. **Naht** — eine App modelliert ein Feld nicht, die andere setzt beim Import einen Standardwert
   ein. Sechs Fälle.
2. **Regel 2** — `importVenueExchange` setzte jede Liste im Ganzen neu und löschte damit, was das
   Austauschformat nicht tragen kann (Wand-Muster, Objekt-Sperren). Zwei Fälle, beide in MultiCam,
   beide von derselben Konstruktion. `light#45` hatte dieselbe Stelle in light schon behoben — das
   war der Hinweis, den niemand auf MultiCam übertragen hatte.
3. **Schlicht vergessen** — ein Feld, das beide Seiten modellieren und das trotzdem niemand
   schreibt (`Wall.color`). Ein Fall.

Nur Form 1 stand im Audit. Formen 2 und 3 kamen aus dem Pfad-Durchgang.

### Die Quer-Prüfung: derselbe Fix, im Nachbarn nachgesehen

Der Wand-Durchgang legte offen, dass `light#45` eine Regel-2-Stelle in light behoben hatte, ohne dass
jemand dieselbe Konstruktion in MultiCam nachgesehen hätte — dort stand sie noch, in zwei Varianten.
Daraus die dritte Methode dieser Untersuchung:

> **Wo ein Fix in einer App gemacht wurde, prüfen, ob dieselbe Konstruktion im Nachbarn steht.**

Erste Anwendung, auf `cable-planner#617` (Kanal für Lade-Hinweise, weil `healProjectPositions` still
verwarf):

| App | Ergebnis |
| --- | --- |
| cable-planner | der Ursprungsfall (`#617`) |
| multicam-planner | **Treffer** (`multicam#83`). `dedupeIds` vergibt für jede doppelte Id eine frische — richtig, aber nicht folgenlos: der Modulkopf von `idRepair.ts` hält selbst fest, dass Shots, Takes und Presets an `VenueCamera.id` hängen und der Fokus-Lock an `ReferencePerson.id`. `DedupeResult.repaired` zählte das bereits und wurde **ausserhalb der Tests von keiner Zeile gelesen** |
| light-planner | **sauber.** Der Loader weist ungültige Dateien mit einer Meldung ab, und `handleLoadProject` stellt Feld für Feld mit expliziten Standardwerten wieder her — keine stille Reparatur, kein Verwerfen |

Der MultiCam-Fall ist die unangenehmste Sorte: **der Code kannte die Antwort schon.** Der Kommentar
benannte die Folge, der Zähler war implementiert, die Tests prüften ihn — nur las ihn niemand.

**Ein Umweg, der dazugehört.** Der erste Versuch meldete über `alert`, was dieselbe Funktion zwei
Zeilen weiter oben für den Format-Fehler tut. Das liess einen *bestehenden* Test scheitern: `alert`
gibt es im Test-Kontext nicht, und der alte Aufruf war nur nie aufgefallen, weil er dort nie feuert.
Ein Store darf nicht an einem DOM-Global hängen — `#617` hatte das schon richtig entschieden
(Kanal, nicht Dialog). Gefangen hat es der *volle* Testlauf, nicht der auf die berührte Datei.

### Was daraus als Nächstes zu bauen ist

**Ein Kanal für Lade-Hinweise — gebaut** in `cable-planner#617`. `healProjectPositions` war eine
reine Funktion ohne Weg zur Oberfläche; alles, was sie verwarf, verschwand definitionsgemäß still,
und Regel 3 war auf dem Lade-Pfad damit gar nicht erfüllbar. Der Kanal ist bewusst schmal gehalten:
der Grund steht als **Code, nicht als Satz** (`missing-required`, `duplicate-id`) — der Store kennt
keine Sprache, die Formulierung gehört in die Oberfläche. Der Sammler ist optional; wird er nicht
übergeben, ändert sich kein Verhalten. Der Bericht wandert **nicht** ins Projektfile: er beschreibt
einen Ladevorgang, nicht das Projekt.

Damit ist der Weg für jeden weiteren Fund in `healProjectPositions` offen. Die übrigen
Heilungsschritte sind aber **nicht** blind anzuschliessen — erst ist je Schritt zu prüfen, ob er
überhaupt etwas verwirft. Ein Kanal, der Meldungen über Nicht-Verluste trägt, ist so schädlich wie
gar keiner: er gewöhnt den Nutzer daran, das Banner wegzuklicken.

**Keine der drei Apps reicht eine unbekannte `.avplan`-Domäne durch.** Nachgelesen und nachgezählt:

| App | `avForeign` |
| --- | --- |
| cable-planner | `{ venue?, cameras?, lighting? }` |
| light-planner | `{ cameras?, cabling? }` |
| multicam-planner | `{ lighting?, cabling? }` |

Jede Fassung zählt genau die Slots auf, die sie kennt, und baut `domains` beim Export daraus neu.
Eine `.avplan` mit einem vierten Slot — eine künftige Audio- oder Rigging-Domäne, eine App, die es
noch nicht gibt — verliert ihn in **jeder** der drei Richtungen. Und `parseAvPlan` nimmt eine solche
Datei überall an, statt sie abzulehnen: der Slot wird also weder bewahrt noch verweigert noch
gemeldet — alle drei Auswege aus Regel 3 verfehlt.

Eine frühere Fassung dieses Absatzes behauptete, cable-planner sei die einzige App ohne dieses
Durchreichen und Inkrement 1 und 2 hätten es für die beiden anderen bereits gelöst. **Das war
falsch.** Inkrement 1 (`multicam#78`) und Inkrement 2 (`light#44`) haben dafür gesorgt, dass die
*bekannten* Fremd-Domänen ein natives Speichern überleben — nicht, dass eine *unbekannte* überlebt.
Der Fehler ist derselbe, den dieses Protokoll den Audit-Hinweisen vorwirft: eine plausible
Kausalkette, am Code nicht zu Ende geprüft.

Damit ist das keine Nachzügler-Arbeit an einer App, sondern eine Lücke im geteilten Format. Und
weil `AVPLAN_VERSION = 1` ein eingefrorener Draht-Vertrag ist, ist „unbekannte Slots müssen
überleben" eine Zusage auf Vertragsebene — sie gehört entschieden, nicht in drei Repos nebenbei
eingebaut. Siehe Design-Frage 4.

**Vier Design-Entscheidungen, die dem Eigentümer gehören** und die hier ausdrücklich *nicht*
nebenbei getroffen werden:

1. Bleibt `exportGreengo` ein **Generator** (erzeugt eine frische Konfiguration aus dem Plan) oder
   wird er ein **Editor**, der das importierte Rohdokument behält und nur Geändertes hineinmerged?
   Das entscheidet, ob der `.gg5`-Round-Trip je verlustfrei werden kann.
2. Welche der 57 übrigen Felder in der Template-Rekonstruktion sind **Modell**-Eigenschaften
   (`rentPricePerDay`, `priceEUR`, `powerConsumptionWatts`, `heightMm`, `modes`, `shortName` …) und
   welche **Instanz**-Eigenschaften (`assetTag`, `serialNumber`, `qrId`, `installStatus`,
   `videohubRouting` …)? Die erste Gruppe läuft in Stücklisten weiter; eine falsche Zuordnung
   propagiert still falsche Preise — also genau der Schaden, gegen den dieser ADR geschrieben ist.
3. Soll **ADR-003 Inkrement 2** (Provenienz im Plan-Modell) jetzt gebaut werden? Es wurde dort mit
   der Begründung zurückgestellt, eine Verallgemeinerung lohne erst, wenn *zwei* Stellen sie
   brauchen. Mit dem `.avsourcemap`-Fund liegt die zweite Stelle vor. Das ist die Voraussetzung
   dafür, dass aus der Meldung Bewahrung wird — aber es erweitert das Plan-Modell und gehört als
   solches entschieden, nicht als Nebenwirkung eines Verlust-Audits.
4. Soll `.avplan` zusagen, **unbekannte Domänen-Slots verlustfrei durchzureichen**? Heute tut es
   keine der drei Apps (siehe oben). Die Zusage wäre billig umzusetzen — ein opakes Fach je App —
   aber sie bindet alle drei Implementierungen an eine Eigenschaft, die `AVPLAN_VERSION = 1` bisher
   nicht verspricht. Die Alternative ist ehrlicher Widerspruch: `parseAvPlan` lehnt eine Datei mit
   unbekanntem Slot ab, statt sie stillschweigend zu beschneiden. Beides ist vertretbar, das
   heutige Verhalten — annehmen und wegwerfen — ist es nicht.

**Was das über abgebrochene Audits lehrt.** Über alle zwanzig Nachlesen hält dasselbe Muster: von
den sechzehn bestätigten Hinweisen traf **kein einziger** den richtigen Ort mit der richtigen Begründung.

- Inventar-Import: das Abweisen war richtig, das Schweigen falsch — der Hinweis rügte das Abweisen.
- Template-Rekonstruktion: nicht die Zahl 50 war der Schaden, sondern ein einziges Feld.
- `.avsourcemap`: die verlorene Provenienz war nur der Anlass; der Fund war die Blindstelle im
  Auffangmechanismus.
- Kabel-Eimer: der Hinweis zeigte auf den Import, der die Zusammenfassung sogar anzeigt; der Fehler
  lag im Export, der sie nicht mehr wissen *konnte*.
- Template-Cache: „~50 Felder" war wieder Rauschen; die Teilmengen-Beziehung der drei Fassungen war
  das Argument.

Und die plausibelsten Hinweise waren durchweg die falschen — alle vier Widerlegungen klangen
überzeugender als die Treffer, weil sie eine saubere Kausalkette erzählten, die niemand am
Rückweg geprüft hatte.

> Ein Hinweis sagt zuverlässig, *wo* man nachsehen soll, und unzuverlässig, *was* dort falsch ist.

Wer die Begründung mitübernimmt, baut den Fix für einen Fehler, den es nicht gibt. In dieser Runde
hätte er dabei mehrfach am eigentlichen Schaden vorbeigebaut — und im Fall des Videohub-Dumps sogar
in die falsche Richtung: der naheliegende Fix (den beobachteten Sperrzustand einsetzen) hätte einen
Verlust-Befund gegen einen Provenienz-Verstoss nach ADR-003 getauscht.

**Ein Zusatz, der aus dieser Runde stammt:** eine als *kosmetisch* eingestufte Feststellung ist nicht
erledigt, sondern **terminiert**. `healRentmanCableMap` war genau so lange harmlos, bis jemand das
Feld hinzufügte, das sie scharf machte — und das war derselbe PR, der den Befund darüber behob. Wer
eine solche Zeile abhakt, muss sie beim nächsten Schema-Zuwachs wiederfinden.
