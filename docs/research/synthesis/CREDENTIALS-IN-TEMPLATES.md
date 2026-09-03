# Zugangsdaten in Bibliotheks-Vorlagen: die Messung hinter Design-Frage 5

Dieser Fund ist bei ADR-005 Inkrement 4 nebenbei aufgefallen und gehört nicht
mir. Er wird hier gemessen und beschrieben, **nicht entschieden** — jede
denkbare Abhilfe ändert Verhalten, auf das jemand sich verlassen kann.

## Der Widerspruch in einem Satz

Derselbe Code entfernt Geräte-Passwörter, bevor der Plan an ein Handy im WLAN
geht — und schreibt sie unverändert in den gemeinsamen Ordner des Teams.

## Was gemessen wurde

**1. Vorlagen tragen Zugangsdaten.**
`templateFromEquipment` (`store/slices/templateSlice.ts`) zählt sie
ausdrücklich auf:

```ts
username: item.username,
password: item.password,
```

Der Knopf dahinter ist „Als Standard-Vorlage überschreiben"; sein Tooltip
verspricht „Ports, Netzwerk, SDI-Caps, MV-Config …". `Netzwerk` steht da —
`Passwort` nicht.

**2. Die Workgroup-Bibliothek schreibt sie in den Sync-Ordner.**
`sharedLibrarySync.ts` beschreibt sein Ziel selbst als
*„Dropbox / SMB / Netzlaufwerk"* und pusht `customLibrary` unverändert:

```ts
const writeDevices = unionByName(after.customLibrary, sDevices)
…
devices: writeDevices,
```

Der Erklärtext im Einstellungen-Tab nennt „Geräte-Vorlagen, Gruppen und
Kategorien" — von Zugangsdaten steht dort nichts.

**3. Der andere Weg nach draußen entfernt sie.**
`main/services/mobileShareServer.ts` hält das Gegenstück, mit Begründung:

> Geräte-Passwörter o.ä. werden vor dem Ausliefern via `stripSecrets()` aus
> dem Projekt entfernt. … The mobile viewer never needs them, and the share
> server is reachable by the whole LAN.

```ts
const SECRET_KEYS = new Set(['password', 'passphrase', 'apiKey', 'secret', 'token'])
```

**4. `stripSecrets` gibt es genau einmal.** Es liegt im Mobile-Share-Pfad und
wird von keinem anderen Ausgang benutzt.

> **Stand 2026-09-03 (`cable-planner#640`):** dieser Punkt gilt so nicht mehr.
> Die Regel liegt jetzt in `src/main/util/stripSecrets.ts` und wird von zwei
> Ausgängen benutzt — der Mobile-Ansicht und dem Viewer-Export. Der Rest des
> Dokuments bleibt gültig; siehe den Nachtrag unten.


## Warum das nicht einfach ein Bug ist

Drei Gründe, es *nicht* nebenbei zu reparieren:

- **Der Nutzen ist echt.** Eine Vorlage für ein Gerät mit Werks-Zugangsdaten
  ist brauchbar; wer 24 gleiche Beltpacks oder Konverter ausrollt, will sie
  nicht 24-mal eintippen.
- **Der Sync ist nutzer-ausgelöst.** Er läuft nicht im Hintergrund, sondern
  auf den Knopf „Bibliothek jetzt synchronisieren". Wer ihn drückt, teilt
  bewusst — nur eben nicht wissend, *was* mitgeht.
- **Die Abhilfen sind nicht gleichwertig.** Beim Push strippen (die Vorlage
  bleibt lokal vollständig, das Team bekommt sie ohne Zugangsdaten)? Sie gar
  nicht erst in die Vorlage aufnehmen (dann ist der Ausroll-Nutzen weg)? In
  den OS-Credential-Store legen, wie `CLAUDE.md` es für Rentman-Tokens
  vorschreibt (aufwendig, und ein Credential-Store ist nicht teilbar)? Nur
  warnen, bevor gepusht wird (billig, verlagert die Entscheidung an die
  richtige Stelle)?

## Was benachbart schon einmal geparkt wurde

`healRentmanLibraryFromProject` (`store/projectStore.ts`) hat dieselbe Grenze
schon einmal berührt und ausdrücklich stehen gelassen:

> Bewusst NICHT übernommen: `ipAddress`, `macAddress`, `username`, `password`,
> `gateway`, `vlans` und die übrige Netz-Identität. Die beiden anderen
> Rekonstruktionen tragen sie, aber eine Library-Vorlage mit fest eingebauter
> IP erzeugt beim zweiten Herausziehen einen Adresskonflikt. Ob das dort
> richtig ist, ist eine eigene Frage — sie hier nebenbei mitzuentscheiden wäre
> falsch.

Dieses Dokument ist diese eigene Frage, jetzt mit dem Weg nach draußen daneben.

## Was hier nicht steht

Kein Vorschlag, welche der vier Abhilfen es sein soll. Der billigste Schritt
(ein Satz im Sync-Dialog, der sagt, dass Zugangsdaten mitgehen) wäre schon
eine Verbesserung — aber auch er entscheidet, dass sie mitgehen *dürfen*.

**Es ist die Entscheidung des Nutzers.**

---

## Nachtrag (2026-09-03): der vollständige Rundgang, und was er gefunden hat

Dieses Dokument beschrieb einen Widerspruch an **einer** Stelle. Beim Aufzählen
aller 146 Felder von `Cable`/`EquipmentItem` für den Plan-Vergleich
(`cable-planner#639`) tauchte dasselbe Feld-Paar erneut auf — und diesmal wurde
nicht beim zweiten Fund aufgehört, sondern **jeder** Ausgang einmal abgegangen.

**Warum überhaupt messen.** Ein Ausgang, der das ganze `EquipmentItem`
durchreicht, erwähnt `password` nirgends im Quelltext. Eine Textsuche findet ihn
also nicht. Gemessen wurde deshalb mit einem Kanarienvogel-Wert durch jede reine
Ableitung (`cable-planner tests/credentialExits.test.ts`).

| Ausgang | Empfänger | Stand |
| --- | --- | --- |
| `project:save` / `save-as` | der Eigentümer selbst | trägt sie — richtig so |
| CRDT-Sync | Mit-Planer am selben Plan | trägt sie — richtig so |
| `mobileShareServer` | LAN-Ansicht, token-gated | strippt sie |
| `project:export-viewer` (`.cpviewer`) | **externe Reviewer** | trug sie — **geschlossen** in `#640` |
| zehn Dokument-Ableitungen (Pull-Liste … Plan-Vergleich) | Papier / CSV | sauber, jetzt per Test festgehalten |
| `cableToAvPlan` (`.avplan`) | andere Apps, andere Leute | trägt sie — **offen** |
| `templateFromEquipment` → geteilte Bibliothek | das Team | trägt sie — **offen**, dieses Dokument |

### Der eine Fall, der keine Entscheidung war

Der Viewer-Export war keine Abwägung, sondern eine Lücke: die Datei geht
ausdrücklich an externe Reviewer, weder `src/viewer/` noch `src/mobile/` liest
die beiden Felder, und die Regel dagegen gab es bereits nebenan. Es ging nichts
verloren. Er ist deshalb geschlossen worden, ohne zu fragen — und der Grund,
warum er offen war, ist derselbe wie so oft: **die Regel lag als Kopie in einer
Datei statt als gemeinsames Stück.** Sie liegt jetzt an einer Stelle.

### Der neue Fall, der eine Entscheidung IST

`cableToAvPlan` schiebt per Rest-Spread das ganze Projekt nach
`domains.cabling`. Ein Strippen wäre hier kein Gewinn ohne Preis: der Import
liest `domains.cabling` als ganzes Projekt zurück, ein Round-Trip verlöre die
Zugangsdaten also still — **ADR-005 in die andere Richtung**. Genau das
unterscheidet ihn vom Viewer-Fall.

`.avplan` ist zudem das app-übergreifende Austauschformat: die Datei geht
absichtlich an jemanden, der ein anderes Gewerk plant. Ein Lichtplaner braucht
das Passwort des Core-Switches nicht.

Die vier Abhilfen aus dem Hauptteil gelten hier sinngemäß, plus eine fünfte,
die es nur hier gibt: **beim Export fragen** — die `.avplan`-Datei einmal mit
und einmal ohne Zugangsdaten zu können, ist keine Ausrede, sondern die einzige
Antwort, die Round-Trip und Weitergabe gleichzeitig bedient.

### Die Quer-Prüfung: bei den Nachbarn nachgesehen

Dieselbe Frage in `multicam-planner` und `light-planner` gestellt, wie ADR-005
Inkrement 3 es für die Naht-Pfade vorgemacht hat. Ergebnis: **nichts zu
portieren.** Keiner der beiden modelliert Geräte-Netzzugang überhaupt — weder
`password`/`username` noch, als Gegenprobe gesucht, `ipAddress` kommt in ihren
zusammen 171 TS/TSX-Dateien vor.

Das ist kein Nullbefund, sondern eine Eingrenzung: das Problem gehört dem
cable-planner allein, weil nur er Geräte mit Zugangsdaten führt. Wer die Frage
entscheidet, entscheidet sie für ein Repository, nicht für drei — und ein
späteres „das müssen wir noch überall nachziehen" ist damit ausgeschlossen,
gemessen statt vermutet.

### Was das an der Frage ändert

Nichts an ihrer Zuständigkeit — sie bleibt beim Eigentümer. Aber sie ist nicht
mehr die Frage nach *einem* Weg. Es sind **zwei offene Austrittsstellen
desselben Feld-Paars**, und wer eine davon entscheidet, hat gute Gründe, die
andere gleich mitzuentscheiden: beide betreffen eine Datei, die absichtlich
weitergegeben wird, und beide würden von derselben Antwort profitieren
(strippen, fragen, oder ausdrücklich mitgeben und es im Dialog sagen).
