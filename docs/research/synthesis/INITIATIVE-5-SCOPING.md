# Initiative 5, Inkrement 2: was der Impact-Blick wirklich braucht

Inkrement 1 steht (`cable-planner#638`): `changeImpact(before, after)` sagt, welche
registrierten Dokumente eine Änderung überholt, und nennt die nicht beurteilbaren beim Namen.

Dieses Dokument hält fest, warum der naheliegende zweite Schritt **nicht gebaut wurde**, und was
statt seiner nötig wäre. Es ist die gleiche Sorte Notiz wie
[`INITIATIVE-11-SCOPING.md`](INITIATIVE-11-SCOPING.md): der fehlende Teil ist nicht der, den man
zuerst vermutet.

## Der naheliegende Schritt, und warum er nichts trägt

Die Funktion braucht einen Vorzustand. Einer liegt greifbar da: `projectHistory` hält
`past: CablePlannerProject[]`, es fehlt nur ein lesender Zugriff. Zwanzig Zeilen, kein neuer
Zustand, und schon könnte die App sagen „dein letzter Edit hat diese Blätter überholt".

**Gemessen, was das wert wäre: fast nichts.** Der Grund ist die Frage selbst. Der Nutzer will nicht
wissen, ob sein letzter Edit *irgendeine Ableitung* verändert hat — das tut fast jeder Edit. Er
will wissen, ob **die Blätter, die er ausgeteilt hat**, noch stimmen. Zwischen beidem liegt die
ganze Nützlichkeit.

Ein Panel, das nach jedem Tastendruck eine andere Liste zeigt, ist Rauschen. Und Rauschen an dieser
Stelle ist nicht bloß nutzlos: es gewöhnt den Nutzer daran, die Meldung zu überblättern — genau
dann, wenn sie einmal wichtig ist.

Deshalb ist der Zugriff **nicht** entstanden. Ein unbenutzter Zugriff wäre toter Code, und dass
toter Code mit einem Kommentar, der einen Zweck behauptet, teuer wird, hat `cable-planner#636` in
derselben Woche gezeigt.

## Was fehlt: das Gedächtnis für Ausgegebenes

Nachgesehen: **nichts hält fest, dass ein Dokument je ausgegeben wurde.** `documentStamp` baut den
Stempel beim Export und druckt ihn aufs Blatt; danach vergisst die App den Vorgang. Der Rückweg
funktioniert nur, weil der Stand auf dem *Papier* steht — `docStandStatus` in `src/mobile/`
vergleicht ihn gegen den heutigen. Das ist die Rückwärts-Frage, und sie braucht kein Gedächtnis,
weil der Nutzer den Zettel mitbringt.

Die Vorwärts-Frage braucht es. Sie lautet vollständig: *„welches der ausgegebenen Blätter ist
überholt, seit ich es ausgegeben habe?"* — und dafür muss die App wissen, welche es waren und mit
welchem Stand.

## Warum das eine Entscheidung des Eigentümers ist

Der Datensatz selbst ist klein (Dokument-Bezeichner, Stand, Zeitpunkt, vielleicht die Zahl der
Kopien). Die Fragen daran sind es nicht:

1. **Wohin?** In die Projektdatei gehört, was zum Plan gehört. Eine Druck-Historie ist eher
   Arbeitsprotokoll als Plan — und `healProjectPositions` ist laut Repo-Konvention die Stelle für
   neue optionale Plan-Felder, nicht für Protokolle.
2. **Was passiert beim Zusammenführen?** Die Datei wird kollaborativ bearbeitet (CRDT-Modus, siehe
   `collabStore`). Zwei Leute drucken dieselbe Liste an zwei Orten — eine Historie, die dabei
   verschmilzt, behauptet leicht Dinge, die so nie passiert sind.
3. **Wie lange?** Ein Protokoll ohne Verfall wächst mit jedem Ausdruck. Ein Protokoll mit Verfall
   entscheidet, wann eine Warnung aufhört zu warnen.
4. **Und der Kollaborations-Fall überhaupt.** Im CRDT-Modus führt ein `undoDelegate` die Historie,
   `projectHistory.past` ist dort nicht mehr autoritativ. Jede Antwort aus dieser Quelle müsste im
   Kollaborations-Modus `undefined` liefern statt zu raten — dieselbe Regel, mit der
   `documentRegistry.currentStand` für nicht reproduzierbare Dokumente `undefined` liefert.

Keine dieser Fragen ist nebenbei zu beantworten, und drei davon ändern das Dateiformat.

## Was Inkrement 1 unabhängig davon schon leistet

Auch ohne Gedächtnis ist die reine Funktion nicht nutzlos — nur nicht als Dauer-Panel:

- **An der Ausgabe selbst.** Wer eine Liste druckt, könnte im selben Moment sehen, welche *anderen*
  ausgegebenen Blätter derselbe Stand betrifft. Das braucht kein Protokoll, sondern einen zweiten
  Stand, den der Nutzer mitbringt (den Code vom Zettel).
- **Am Vergleich zweier Dateien.** Zwei `.cp`-Stände nebeneinander — „was hat sich zwischen der
  Fassung von gestern und heute an ausgabewirksamen Dingen geändert?" Das ist eine
  Datei-gegen-Datei-Frage und braucht gar keinen Store.

Der zweite Weg ist der billigere und ehrlichere nächste Schritt, falls Inkrement 2 warten soll.
Er entscheidet nichts über das Dateiformat.

## Stand

**Offen, und ausdrücklich beim Eigentümer.** Damit ist es die sechste geparkte Design-Frage; die
anderen fünf stehen in [`../../decisions/ADR-005-lossless-or-loud.md`](../../decisions/ADR-005-lossless-or-loud.md)
und [`CREDENTIALS-IN-TEMPLATES.md`](CREDENTIALS-IN-TEMPLATES.md).
