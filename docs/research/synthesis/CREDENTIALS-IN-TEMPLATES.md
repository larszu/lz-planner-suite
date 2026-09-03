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
