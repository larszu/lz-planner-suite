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
| 3 | Die 63 ungeprüften Audit-Hinweise nachprüfen, jeden einzeln im Code | Sie sind Hinweise, keine Befunde. Sie ungeprüft abzuarbeiten hieße, Arbeit an erfundenen Fehlern zu leisten — genau das, wovor die Regel schützt |
| 4 | Unbekannte `domains.*`-Slots und Wurzel-Keys bewahren (das `extra`-Muster für `.avplan`) | Braucht heute noch keine vierte App. Nach 1–3, weil hypothetischer Verlust nach echtem kommt |

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
