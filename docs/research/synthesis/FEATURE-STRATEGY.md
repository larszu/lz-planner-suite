# AV Planner feature strategy

Derived from the research corpus per section 29. Inputs: `AV-INDUSTRY-SOFTWARE-LANDSCAPE.md`
(all 16 segments), `USER-NEED-DATABASE.md` (150 needs, 11 professions),
`COMPETITOR-PAIN-SYNTHESIS.md` (224 competitor pain points, 16 segments), `FEATURE-MATRIX.md`,
and `../repos/INVENTORY.md` (the eight existing repositories, read from source).

Read `../METHOD.md` for what the research could and could not verify.

## 1. The strategic position

> **The market has excellent runtimes and no design-time layer. AV Planner is the design-time
> layer, and the identity spine that the runtimes render.**

This is not a slogan chosen for it; it is what six independent segment researchers and eight
independent role researchers converged on without seeing each other's work. The market evidence
says no product specifies a show. The user evidence says the cost of that absence is identity
retyped into five to eight systems, every show, by every department.

Section 27 asks where the competitive advantage comes from. The answer the research gives is
sharper than "integration": **we are the only participant that can own the plan, because the
runtimes structurally cannot.** A switcher knows its own inputs. A rental ERP knows its own
assets. Neither can hold the sentence *"camera 4 is an FX6 at position SL-2, on SMPTE drum 12,
into frame input 7, tally TSL address 4, MV window 6, comms channel C, operated by Anna."*
That sentence is the product.

## 2. Prioritisation model

Section 26 defines seven factors. `USER-NEED-DATABASE.md` scores the two measurable ones
(frequency, time saving) mechanically. The remaining five are judgements and are applied here in
the open, each 1–5.

| Factor | What it asks |
| --- | --- |
| **UV** User value | How hard a real problem does it solve? |
| **FR** Frequency | How often does the problem occur? (from the need DB) |
| **TS** Time saving | How much time does it return? (from the need DB) |
| **ER** Error reduction | How many live-show errors does it prevent? |
| **AV** AV relevance | How specific is it to AV/broadcast — i.e. how safe from generic competitors? |
| **IV** Integration value | How many other modules benefit? |
| **CX** Complexity | Build cost. **Subtracted.** |

Score = `UV + FR + TS + ER + AV + IV - CX`.

## 3. The roadmap

| # | Initiative | UV | FR | TS | ER | AV | IV | CX | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **0** | **Consolidate the fork** (enabling, not a feature) | 4 | 5 | 3 | 5 | 1 | 5 | 3 | **20** |
| **1** | **Source identity spine + label projection** | 5 | 5 | 5 | 5 | 5 | 5 | 3 | **27** |
| **2** | **Tally map generated from the plan** | 5 | 4 | 3 | 5 | 5 | 4 | 2 | **24** |
| **3** | **BOM / pick list derived from the technical plan** | 5 | 5 | 5 | 4 | 4 | 5 | 4 | **24** |
| **4** | **Version-stamped print + paper return path** | 4 | 5 | 3 | 4 | 4 | 4 | 2 | **22** |
| **5** | **Change-impact view ("what does this invalidate")** | 5 | 4 | 4 | 5 | 4 | 5 | 5 | **22** |
| **6** | **Intercom plan as data, with vendor export** | 4 | 3 | 3 | 4 | 5 | 4 | 3 | **20** |
| **7** | **Return path: plan vs as-built reconciliation** | 5 | 4 | 4 | 4 | 4 | 5 | 6 | **20** |
| **8** | **Network/IP plan from the same device records** | 4 | 3 | 4 | 4 | 4 | 4 | 4 | **19** |
| **9** | **Delivery/streaming chain as signal flow** | 4 | 3 | 3 | 4 | 4 | 3 | 3 | **18** |
| **10** | **Confirmed-state discipline across every module** | 5 | 4 | 2 | 5 | 5 | 5 | 3 | **23** |
| **11** | **Public device-capability registry** | 4 | 4 | 3 | 4 | 5 | 5 | 3 | **22** |

## 3b. Wo die Roadmap wirklich steht (gemessen, 2026-09-03)

Abschnitt 25 macht dieses Papier zum lebenden Dokument und verlangt Neu-Ableitung statt Flickwerk.
Die Tabelle oben ist die ursprüngliche Ableitung und bleibt als solche stehen; dieser Abschnitt
sagt, was davon heute im Code steht. **Aus dem Quellcode gelesen, nicht aus Commit-Titeln** — die
Prosa unten war an mehreren Stellen älter als das Repository.

| # | Initiative | Score | Stand | Belegt durch |
| --- | --- | --- | --- | --- |
| 0 | Fork konsolidieren | 20 | **teilweise** | Drift von 56/72/26 auf **18/19/17** gesenkt, CI-bewacht (`scripts/planner-drift.mjs`). Die Suite vendort weiterhin Kopien — verwaltet, nicht konsolidiert |
| 1 | Identitäts-Spine + Label-Projektion | 27 | **fertig** | ADR-001, alle vier Inkremente, plus `cable-planner#637` (die Exporter gehen durch den Resolver) |
| 2 | Tally-Map aus dem Plan | 24 | **fertig** | `lib/tallyMap.ts` — `buildTallyMap`, `tallyMapCsv`, `toTallyPiDevices` speist `tally-pi`s `devices[]` |
| 3 | Stückliste / Kommissionier-Liste | 24 | **fertig** | `lib/planBom.ts` (ADR-002 Inkrement 4) |
| 4 | Gestempelter Druck + Papier-Rückweg | 22 | **fertig** | ADR-004, `lib/documentStamp.ts`, QR zurück in den Datensatz |
| 10 | Confirmed-State-Disziplin | 23 | **teilweise, alle bekannten Fälle geschlossen** | Nachgezählt 2026-09-03, Zahlen aus dem Quelltext statt aus der Erinnerung. **Zwei Sorten, zwei Register, beide gerechnet statt aufgezählt:** `deviceReadSites` führt 5 Stellen, an denen ein Geräte-Befund den Plan berührt (3 getrennt, 1 additiv, 1 liest-nur); `aiWriteSites` führt 4, an denen eine Maschine Werte erfindet (3 markiert, 1 mit Mensch dazwischen, keine ungedeckt). `specSource` in allen drei Planern, gehalten vom Suite-Guard `spec-source-vocabulary.mjs` (3 Feld-, 2 Helfer-Kopien, in CI). Dazu `sony#10` im Companion-Modul. **Warum nicht „fertig":** siehe Abschnitt 3c — jede der sechs Messrunden fand eine Schicht, die die vorige nicht kannte |
| 11 | Öffentliche Capability-Registry | 22 | **teilweise** | `lib/deviceTypeRegistry.ts` löst Typ-GUIDs intern auf; `INITIATIVE-11-SCOPING.md` hat den fehlenden Teil bestimmt: nicht die Registry, sondern die **Form des Belegs** (253 `// Quelle:`-Kommentare, kein `provenance`-Feld). **Beide dort genannten Blocker sind weg**, und der mechanische Schritt ist getan: die 253 Links stehen als `manufacturerUrl` im Katalog (`cable#649`), und die Eigenschaften-Leiste zeigt den **geerbten** Link mit genannter Herkunft — ohne die zweite Hälfte hätte der Nutzer nichts davon gesehen, weil der `DeviceTypePicker` keine Template-Felder kopiert. Offen bleiben die **8 Kataloge ohne Beleg** (echte Recherche, Schritt 3) und die Publikation selbst |
| 5 | Change-Impact-Sicht | 22 | **fertig** | `lib/changeImpact.ts` (`#638`), `lib/planDiff.ts` + Vergleichs-Dialog (`#639`) und das **Register der ausgegebenen Dokumente** (`#644`). Die Vorwärts-Frage ist damit vollständig: welches ausgeteilte Blatt ist hin |
| 6 | Intercom-Plan als Daten | 20 | **teilweise** | `exportGreengo`/`importGreengo`/`intercomMatrixXlsx`; `#632`/`#633` schärften den Round-Trip, `#645` macht ihn verlustfrei (ein geladenes Preset überlebt den Export). Ein **herstellerneutrales** Austauschformat fehlt weiter — genau die Lücke, die das Segment-Dossier als „no interchange format from anyone" führt |
| 7 | Rückweg: Plan gegen As-built | 20 | **teilweise** | `lib/handoverPackage.ts` baut das As-built-/Closeout-Paket; der **Abgleich** Plan ↔ As-built fehlt |
| 8 | Netz-/IP-Plan | 19 | **teilweise** | `lib/subnet.ts` + IPAM-Übersicht + NetBox-Import; ein aus den Geräte-Datensätzen **abgeleiteter** Adressplan fehlt |
| 9 | Delivery-/Streaming-Kette | 18 | **offen** | nur Katalog-Treffer, kein Signalfluss-Modell |

**Was das für die Reihenfolge heißt.** Keine Initiative mit Score ≥ 22 ist mehr vollständig offen.
**5 (Change-Impact)** war es bis zu diesem Stand und ist als Erstes gebaut worden — Inkrement 1
steht. Ihr zweiter Teil hat dabei die Annahme dieses Abschnitts widerlegt: sie hängt eben doch an
einer Eigentümer-Entscheidung. Die Vorwärts-Frage über zwei *gegebene* Stände ist ableitbar; die
nützlichere Frage — „welche der zwölf ausgedruckten Listen sind jetzt hin" — braucht ein Register
der ausgegebenen Dokumente, und **das führt heute nichts** (`INITIATIVE-5-SCOPING.md` nennt die
vier Fragen, drei davon ändern das Dateiformat).

Damit ist die Tabelle in einem Zustand, den sie vorher nicht hatte: **jede verbleibende Lücke mit
Score ≥ 20 ist entweder geparkt oder ein Teilstück** (6, 7, 8, 10, 11), und das höchstbewertete
freie Feld ist Initiative 9 mit 18. Der eine Rest aus 5, der ohne jede Entscheidung ging — der
Datei-gegen-Datei-Vergleich, kein Store, kein Format-Feld, kein Register — ist mit `#639` gebaut.

**Was beim Eigentümer lag — und was er entschieden hat (2026-09-03).** Alle sieben Fragen sind
beantwortet; keine Initiative wartet mehr auf eine Entscheidung, nur noch auf Bau.

| # | Frage | Entscheidung | Stand |
| --- | --- | --- | --- |
| 1 | Green-GO Generator oder Editor | **beides** — vorhandenes Preset laden und fortschreiben, sonst aus dem Plan erzeugen | **gebaut** — `cable#645` |
| 2 | Modell- vs. Instanz-Felder | **Modell-Eigenschaften hängen immer am Gerät**, in jedem Plan, ob die Anwendung sie abfragt oder nicht | **gebaut** — `cable#646` |
| 3 | ADR-003 Inkrement 2 | **ja, bauen** | **gebaut** — `cable#643` |
| 4 | `.avplan` und unbekannte Slots | **laden, fragen, belegen lassen** | **gebaut** — `cable#641`, `light#52`, `multicam#87` |
| 5 | Zugangsdaten in geteilten Vorlagen | **beim Export fragen** | **gebaut** — `cable#642` |
| 6 | Register der ausgegebenen Dokumente | **getrennte Protokolldatei + einsehbares Log im Menü** | **gebaut** — `cable#644` |
| 7 | Zugangsdaten in `.avplan` | mit 5 zusammen beantwortet | **gebaut** — `cable#642` |

Die Begründungen stehen dort, wo die Fragen gestellt wurden:
`../../decisions/ADR-005-lossless-or-loud.md`, `CREDENTIALS-IN-TEMPLATES.md`,
`INITIATIVE-5-SCOPING.md`.

**Alle sieben sind entschieden UND gebaut.** Damit ist zum ersten Mal seit dem Anlegen dieses
Papiers **keine Initiative durch eine offene Frage blockiert.** Was bleibt, ist Arbeit.

### Was die Neu-Ableitung danach ergeben hat

Abschnitt 25 verlangt Neu-Ableitung statt Flickwerk, und die erste nach den sieben Antworten
hat den Stand von Initiative 10 **nicht bestätigt, sondern verschoben**. Die Tabelle führte sie
als „wartet auf Design-Frage 3". Die Frage ist beantwortet und `cable#643` gebaut — aber was
Initiative 10 verlangt, steht eine Ebene höher: *„every displayed value carries provenance
(confirmed by device / last commanded / planned), and the UI must render the difference."*
`cable#643` liefert das Vokabular und zwei erklärte Stellen; `ProvenanceBadge` steht heute an
genau diesen zweien und nirgends sonst — nachgezählt, nicht angenommen.

Die Messung, die daraus folgte, hat die eigentliche Lücke gefunden — und sie lag woanders als
vermutet. Von 18 verschiedenen Lese-Aufrufen an 25 Stellen im Renderer schreiben **drei** ihren Befund in ein persistiertes
Plan-Feld. Einer davon, `VideohubExportDialog`, war in Inkrement 0 bereits geheilt worden und
trug die Begründung im eigenen Kommentar: *„Was der Hub tut, ist eine Beobachtung; was im Plan
steht, eine Absicht."* Die beiden ATEM-Dialoge taten weiter genau das — der Audio-Dialog sogar
ohne jede Rückfrage. Der Multiviewer-Dialog fragte, aber nur bei `sourceId !== 0`: ein bewusst
schwarz geplanter Multiviewer ging still verloren.

Das ist der Marktbefund **in seiner Umkehrung**. Die Segmente verlangen, den echten
Geräte-Zustand zu lesen statt den letzten Befehl anzuzeigen; hier wurde der echte
Geräte-Zustand gelesen und dann zur Absicht erklärt. Beide Richtungen zerstören dieselbe
Unterscheidung, und die zweite ist die leisere.

**Der verbleibende Rest ist damit präzise benennbar**, was er vorher nicht war: die Invariante
gilt als Praxis an vier geprüften Stellen (drei im Renderer, eine im Companion-Modul), nicht als
Regel, die ein neuer Lese-Weg automatisch erbt. Der Guard in `tests/atemLiveCompare.test.ts`
nennt die drei Renderer-Stellen namentlich — er findet keine vierte. Das ist der nächste Schritt
von Initiative 10, und er ist eine Struktur-Frage, keine Feature-Frage.

**Was der Bau an den Entscheidungen selbst gelehrt hat** — dreimal war der eigentliche Befund
nicht die Antwort, sondern etwas, das erst beim Umsetzen sichtbar wurde:

- **Frage 4:** die richtige Antwort war *keine der beiden angebotenen*. Der ADR stellte
  „durchreichen" gegen „ablehnen"; gewählt wurde *bewahren und fragen* — die dritte, die beide
  Regeln zugleich erfüllt.
- **Frage 3:** der Zuschnitt änderte sich durchs Messen. Es sind **zwei** Formen von Provenienz im
  Code, nicht eine, und nur die erste ist das, was ADR-003 meint. Der naheliegende Bau — ein
  Provenienz-Feld je Datensatz — wäre ein zweiter Ort für eine Wahrheit gewesen, die die
  Feldnamen schon tragen. **Keine Schema-Migration nötig.**
- **Fragen 1 und 2:** beide legten einen Fehler frei, den keine Frage gestellt hätte. Einer im
  ersten Umsetzungsversuch (der Editor-Weg baute den Verlust wieder ein, den er beheben sollte),
  einer im Bestand (zwei Rekonstruktionen mit entgegengesetztem Urteil über dieselben Felder).

### 0. Consolidate the fork — do this first, it is cheap and it blocks everything

`../repos/INVENTORY.md` establishes that the suite does not consume the planners; it contains
vendored copies, and **those copies have already diverged substantially in both directions.**
Measured at the time of writing: 56 divergent paths in cable-planner, 72 in multicam-planner, 26 in
light-planner. The suite's cable-planner has no NetBox import at all; the standalone cable-planner
has no Lexware billing; the suite's multicam-planner is missing 8,145 lines and ten test files.

> **Stand 2026-09-03:** die Zahlen sind auf **18 / 19 / 17** gesenkt und werden von
> `scripts/planner-drift.mjs` in der CI bewacht; der Rest ist zum grossen Teil deklarierter
> Overlay (`@avplan/*`-Pakete, Shell-Bridge, i18n) statt Auseinanderlaufen. Der Guard beantwortet
> seit einer Nachbesserung auch die zweite Frage — *welche Upstream-Aenderung ist hier noch nicht
> angekommen* —, weil ein uebersprungener Vendoring-Commit an den reinen Drift-Zahlen
> vorbeigerutscht war. Die Suite vendort weiterhin Kopien: verwaltet, nicht konsolidiert.

An identity spine that spans modules cannot be built on three hand-synced copies of the domain
model — still less on three copies that already disagree. This is the same defect we are attacking
in the market, reproduced in our own tree.

It is ranked 0 rather than 1 because it delivers no user value by itself. But it is not hygiene:
two of the three planners currently disagree with themselves about what features they have, and
every initiative below assumes one shared model. Nothing after it is safe until it is done, and
the cost grows with every commit to either side.

### 1. Source identity spine + label projection — the product

> **Entwurf entschieden:** [`../../decisions/ADR-001-identity-spine.md`](../../decisions/ADR-001-identity-spine.md).
> Vier unabhängige Ansätze wurden gegeneinander bewertet (14/13/12/11) und synthetisiert statt
> einen Sieger zu küren. Die gegnerische Prüfung deckte einen Blocker auf, den der bestplatzierte
> Entwurf nur als Risiko geführt hatte: der Videohub-Routing-Zustand liegt nicht im Projekt
> (`lib/exportVideohub.ts` sagt es im eigenen Kommentar), weshalb die geforderte
> Kamera-zu-Tally-Kette ohne ihn nicht ableitbar ist. Er wird damit zu Inkrement 0.

One record per real-world thing. Every label, sheet, export and device configuration becomes a
*rendering* of that record. A rename costs one edit.

The evidence is the strongest in the corpus: eight of eleven professions named this as their top
widespread need. The consequences are not cosmetic — the technical-director dossier attributes
two of the highest-stakes gallery errors (the multiviewer lying, tally lying) to a hand-maintained
mapping table drifting from the switcher, and the tally dossier records a crew discovering by
packet capture that camera 1 was on TSL address 12.

We are unusually close. `cable-planner` already exports ATEM input labels, Videohub source and
destination labels and ATEM multiviewer layouts, and models ports, cables and equipment. The work
is to make one record own the identity and turn those exports into projections of it, then extend
the projection set to switcher mnemonics, TSL/UMD, ISO naming and console scenes.

### 2. Tally map generated from the plan

Highest ratio of value to effort once (1) exists. The tally dossier's finding is blunt: "Nobody
plans tally — they only run it", and address mapping is manual everywhere except NDI. We own a
tally runtime (`tally-pi`) and a camera bridge that already carries `BridgeTallyState`. Emitting a
reviewable, diffable tally map from the plan — and then feeding our own runtime with it — is a
feature no competitor offers, on top of infrastructure we already have.

### 3. BOM and pick list derived from the technical plan

The largest unclaimed square in the feature matrix. Every rental ERP scores `no`; the rental
dossier calls it "the single largest unclaimed piece of value adjacent to the segment". Production
managers asked for exactly this ("the technical plan produces the commercial BOM instead of it
being retyped"), and warehouse staff asked for its other half ("close the technical-plan-to-pick-
list gap").

We are the only entrant already holding both sides: a signal plan with real port modelling and an
inventory with cases, storage tree and units. This is section 28's automation chain made concrete
and it should be built as the first cross-module flow.

### 4. Version-stamped print and a fast return path from paper

Cheap, and it corrects a misreading that would otherwise damage the product. Paper is not legacy
behaviour to be eliminated: the camera-operator research is explicit that it is kept deliberately,
because it works without battery and cannot silently change underneath you. The actual failure is
that a printout goes stale invisibly.

So: stamp every printed artefact with the plan version and a scannable code; make the code a
route back into the record it came from. Production managers and warehouse staff independently
asked for the return path ("make the printed artefact scannable back in"). Because we are already
offline-first and already have a strong print pipeline, this is mostly assembly.

### 10. Confirmed-state discipline — a rule before it is a feature

Added after the pain research, which found five segments independently asking for the same thing:
**read the device's real state, do not just display the last command sent.** Camera panels drift
open-loop, intercom buttons lie about whether a mic is open, media servers cannot be read back,
show-control layers only fire triggers. The `video-engineer-shader` role dossier stated the rule
from the other side: *never display a value the system has not confirmed.*

It scores high because it costs little and touches everything. `sony-camera-bridge` already does
it — `CameraCapabilities` disables unsupported functions rather than failing silently. The work is
to make it a suite-wide invariant: every displayed value carries provenance (confirmed by device /
last commanded / planned), and the UI must render the difference. This is cheap now and very
expensive to retrofit later, which is why it is a rule adopted early rather than a feature
scheduled late.

### 11. Public device-capability registry

Five segments want machine-readable compatibility truth that exists nowhere: which camera model
supports which paint parameter over which transport, which tally lamp talks to which switcher,
which Dante devices actually interoperate, which firmware combinations work. The best artefact the
camera-control researcher could find in the whole segment was a CSV with French headers inside a
documentation repository.

We already hold an unusual amount of this knowledge across `sony-camera-bridge` (eleven camera
families with verified/tuning status per protocol), `cable-planner`'s connector and device
catalogues, and `tally-pi`. Publishing it as a versioned, machine-readable registry is cheap
relative to its value, compounds over time, and is the kind of asset that makes a tool the default
reference in a field that currently has none.

### 5–9

Change-impact analysis answers a question no product in the corpus answers. Intercom planning
fills the segment with *no interchange format from anyone*, and we own an intercom runtime and
already export Green-GO config from `cable-planner`. The return path is the lighting segment's
declared out-of-scope gap and the network segment's plan-versus-found need — high value, highest
complexity, and correctly sequenced last among the identity-dependent items.

### 3c. Sechs Messrunden, sechs Korrekturen (2026-09-03)

Abschnitt 25 verlangt Neu-Ableitung statt Flickwerk. Der Tag hat gezeigt, warum die Regel nicht
nur für fremde Annahmen gilt: **jede Messrunde hat eine Annahme von mir selbst widerlegt**, und
zwar immer erst, nachdem ich sie bereits aufgeschrieben hatte.

| # | Was ich annahm | Was die Messung ergab |
| --- | --- | --- |
| 1 | 255 `// Quelle:`-Kommentare | **253**, in 9 Dateien — die Zahl stand schon richtig im Scoping-Papier |
| 2 | Die Katalog-Links erreichen den Nutzer, sobald das Feld gefüllt ist | Nein: der `DeviceTypePicker` setzt nur `deviceTypeId` und kopiert keine Template-Felder. Ohne Vererbungs-Anzeige wären 253 Belege aus einem unerreichbaren Kommentar in ein ebenso unerreichbares Feld gewandert |
| 3 | „Eine Idee, ein Vokabular" (so im Commit geschrieben) | `isEstimate` war zwischen `light` und `multicam` **schon auseinandergelaufen**, keine Stunde nach der Entstehung — die englische Hälfte fehlte im light-planner, wo das Datenblatt oft englisch ist |
| 4 | Der `cable-planner` ist für Initiative 10 fertig | Der AI-Port-Vorschlag schrieb **geratene Ports als Tatsache** und brachte Prüfung 18 zum Schweigen — die Prüfung, die einen Menschen zu belegten Daten zwingen soll |
| 5 | Jetzt ist er fertig | Die Plangenerierung tat dasselbe für einen **ganzen Plan**, samt Kabeln |
| 6 | Es sind drei KI-Schreibstellen | Erst fünf (ein grep nach dem Import-Pfad), dann **vier** (das Kriterium fragt nach dem Aufruf). `LibraryPanel` kannte ich nicht, und es brachte eine ganze Quelle mit: `suggestFromWeb` zählt Stecker in einem Wikipedia-Schnipsel |

**Was daraus folgt, und warum Zeile 10 nicht „fertig" sagt.** Sechs von sechs Runden fanden
eine Schicht, die die vorige nicht kannte. Eine siebte anzunehmen ist keine Schwarzmalerei,
sondern die einzige Lesart, die zu den Belegen passt. „Alle bekannten Fälle geschlossen" ist
deshalb die stärkste Aussage, die dieser Stand trägt.

**Die Konsequenz ist gebaut, nicht bloss notiert.** Beide Sorten unbestätigter Werte haben
jetzt ein Register, das die Stellen **aus dem Quelltext rechnet** statt sie aufzuzählen:
`tests/deviceReadSites.test.ts` (Geräte-Befunde) und `tests/aiWriteSites.test.ts` (erfundene
Werte). Eine neue Stelle lässt den jeweiligen Test fallen und wird namentlich genannt; wer sie
einträgt, muss dabei beantworten, wo der Wert landet.

Das ist der Unterschied, um den es geht: **eine aufgeschriebene Liste ist der Kenntnisstand
ihres Autors, eine gerechnete ist der Zustand des Programms.** Runde 6 hat genau diesen
Unterschied vorgeführt — dreimal griff ein ad-hoc-Muster daneben, einmal zu weit, einmal zu
eng, einmal wieder zu weit.

**Was ausdrücklich offen ist.** Ob ein vom Modell **erfundenes Kabel** eine Kennzeichnung
tragen soll — und ob eine Markierung dafür überhaupt reicht. `Cable` hat kein `specSource`, und
eine erfundene Verbindung behauptet mehr als eine erfundene Port-Zahl: dass zwei Ports
zusammengehören. Das ist eine Formfrage mit mehreren vertretbaren Antworten und gehört dem
Eigentümer; in `cable#651` ist die Lücke bewusst gelassen und durch einen Test festgehalten,
damit sie als Entscheidung lesbar bleibt und nicht als Versäumnis.

## 4. Cross-module automation (section 28), grounded

The mandate's example chain is right in shape but should be built in the order value arrives, not
end to end. With the identity spine in place, the chain becomes:

```
camera position placed (multicam-planner)
  -> identity created: number, name, position          [spine]
  -> required signals derived                          (cable-planner: ports, cable, length)
  -> BOM + reservation                                 (inventory-core)
  -> pack list by case                                 (StorageNode / LPN)
  -> labels projected                                  (ATEM, Videohub, TSL/UMD, MV)
  -> tally map emitted                                 (tally-pi)
  -> camera bridge binds by identity                   (sony-camera-bridge)
  -> intercom channel assigned                         (Broadcast-intercom)
```

Every arrow above is between two modules we already own. That is the section 27 advantage stated
as an engineering plan rather than a claim.

## 4b. Design rules the research forces

These are not features. They are constraints that every feature must satisfy, each derived from a
widespread, multi-source finding.

1. **Never display an unconfirmed value as fact.** Every value carries provenance: confirmed by
   the device, last commanded, or planned. (Five segments; see initiative 10.)
2. **An import that cannot preserve a field must refuse, not drop it.** Silent data loss is the
   single most damaging integration failure named across both role and competitor research.
3. **Direction and signal type are first-class, everywhere.** The same connector carries different
   things in different directions; a model without direction cannot validate anything.
4. **Identity is stable and separate from position.** A rehearsal-day edit must not silently
   re-point every controller button; a main+backup pair is one role, not two devices.
5. **Every printed artefact is version-stamped and scannable back.** Paper is deliberate, not
   legacy; the failure is that it goes stale invisibly.
6. **The container is the unit of handling.** Cases nest, and their contents and weight follow
   them.

## 5. What we will not build

Section 31 is explicit that the goal is not the most features. Nine deliberate exclusions are
recorded in `FEATURE-MATRIX.md`, block E and C. The principle behind them: **do not compete with a
mature runtime or with a vendor-specific physical model.** grandMA, QLab, ArrayCalc, Soundvision,
Wireless Workbench and the switchers have decades of trust, muscle memory and measured data behind
them. Crew scheduling and payroll are a mature market with heavy compliance cost and almost no AV
differentiation.

Where those tools exist, our job is to *feed* them from the plan — export into Wireless Workbench,
emit MVR for the visualisers, drive Companion — not to replace them.

## 6. Implementation rule (section 30)

Where this research and the existing code disagree, the research does not automatically win, and
neither does the code. Two places where the research should change existing plans:

1. **Read-only mobile is the wrong half.** `cable-planner`'s mobile share is read/check-only. The
   warehouse and freelancer dossiers both need write access on-site and offline. This should be
   reconsidered rather than treated as settled.
2. **`.avplan` currently passes foreign domains through as `unknown`.** That is a sound way to
   avoid data loss today, but the corpus's strongest integration finding is that *silent* field
   loss is the most damaging failure mode. The format should move toward explicit refusal —
   an import that cannot preserve a field must say so — rather than opaque pass-through.

And one where the existing code should win over an obvious market pattern: every competitor is
cloud-first with an offline afterthought. The research says the offline half is the one that
matters and that everyone builds it for the wrong workflow. Our local-file, atomic-write,
offline-first architecture is a genuine advantage and should not be traded for cloud convenience.

## 7. Open questions

- All sixteen segments are researched, landscape and pain points both. Visual workspace, crew
  scheduling, asset tracking and video switching arrived after the matrix was first drafted and
  are represented there only through adjacent segments; folding them in directly is the next
  refresh. The pain research did not move the existing ranking — it confirmed initiatives 2 and 3
  verbatim from the competitor side and added initiatives 10 and 11.
- The section 15 user research (Reddit, G2, Capterra, Trustpilot) could not be performed in this
  environment. The 224 pain points rest on GitHub issues plus search summaries, which
  systematically under-represents closed commercial products whose users never file public issues
  — precisely the expensive, proprietary end of the market. Conclusions drawn from silence in
  those segments are weak and should be redone with open egress.
  **Second attempt, 2026-09-01: still open.** Direct HTTPS to reddit.com, g2.com and capterra.com is
  refused by the gateway (403 on CONNECT, verified). A WebSearch-only sweep across twelve segments
  returned `thin` from all ten segments that completed, and its adversarial verification stage never
  ran — so it produced **zero verified findings and moved no score**. The attempt, what it cost and
  what a real section 15 would need is written up in
  [`SECTION-15-USER-RESEARCH.md`](SECTION-15-USER-RESEARCH.md). The gap is unchanged, and it is now
  measured rather than assumed.
- Pricing across the market is unverified here, so no positioning claim about cost should be made
  from this corpus yet.
