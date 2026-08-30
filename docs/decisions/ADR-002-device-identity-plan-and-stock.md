# ADR-002: Die Geräte-Identität zwischen Plan und Lager

Status: entschieden · Datum: 2026-08-30 · Betrifft: Roadmap-Initiative 3 aus
[`FEATURE-STRATEGY.md`](../research/synthesis/FEATURE-STRATEGY.md), Score 24 — nach der
abgeschlossenen Identitäts-Spine (ADR-001) die höchste offene Position.

## Das Problem

Initiative 3 verlangt, dass der technische Plan die kaufmännische Stückliste und die Kommissionier-
Liste **erzeugt**, statt dass beide abgetippt werden. Die Recherche nennt das „the single largest
unclaimed piece of value adjacent to the segment"; jedes Rental-ERP der Feature-Matrix steht dort
auf `no`. Produktionsleitung und Lager haben unabhängig voneinander dieselbe Sache verlangt, von
beiden Enden aus.

Dafür braucht es genau eine Verbindung: **welche Lager-Position deckt dieses Plan-Gerät?** Die gibt
es heute nicht.

## Der Befund im Code

Nachgeprüft, nicht vermutet:

- **`EquipmentItem` trägt `name` — den Instanznamen auf dem Canvas** („Kamera 1", „Kamera 2") —
  und **kein** `model`-Feld. Was für ein Gerätemodell dahintersteht, sagt allein die optionale
  `deviceTypeId`: die stabile Datenblatt-GUID aus dem Katalog-Register (444 Einträge,
  `lib/deviceTypeRegistry.ts`). Sie ist die einzige autoritative Typ-Aussage im Plan.
- **`InventoryItem` trägt `model` als freien Text** und **keine** `deviceTypeId`. Die
  Feldliste des eingefrorenen Wire-Contracts `avplan-inventory` (Version 1) bestätigt das.
- **Die einzige vorhandene Brücke ist `inventoryStore.seedFromEquipment`**, und sie verbindet über
  `dedupeKey(model, category)` — wobei `model` der **Gerätename** ist:

  ```ts
  const model = (eq.name ?? '').trim()
  const key = dedupeKey(model, eq.category)
  ```

Die Folge ist mechanisch: „Kamera 1" und „Kamera 2" sind zwei verschiedene Schlüssel, also entstehen
**zwei Lager-Positionen à 1 Stück** für das, was in Wahrheit ein Modell mit Menge 2 ist. Und weil
nichts zurückverlinkt wird, kann später niemand feststellen, welche Position welches Gerät gedeckt
hat.

Das ist exakt der Fehler, den die Strategie dem Markt vorwirft — Identität über Namen statt über
eine Identität —, in unserem eigenen Baum.

## Die Entscheidung

**Das Lager bekommt dieselbe stabile Geräte-Typ-Identität wie der Plan.** `InventoryItem` erhält
ein optionales `deviceTypeId`. Damit wird die Verbindung dort, wo der Katalog greift, eine
**Tatsache statt eines Namensvergleichs** — und dort, wo er nicht greift, ein ausdrücklich offener
Punkt statt einer stillen Fehlzuordnung.

**Die Eigentumsregel aus ADR-001 gilt weiter, Feld für Feld:**

| Wer | besitzt |
| --- | --- |
| Gerätetyp (Katalog) | das Datenblatt: Ports, Maße, Leistung, Hersteller, Modellname |
| Lager-Position | Bestand: Menge, Lagerort, Eigentum, Mietpreis, Einheiten |
| Plan | den Bedarf: welcher Typ, wie oft, wofür |

Kein Feld wird zweimal gespeichert. Die Stückliste ist eine **Projektion** über diese drei, keine
vierte Wahrheit.

## Warum kein Namensabgleich, auch kein guter

Ein Fuzzy-Match über Modell und Hersteller wäre schnell gebaut und in der Mehrzahl der Fälle
richtig. Genau das ist das Problem: Eine Kommissionier-Liste, die in neun von zehn Fällen stimmt,
ist im Lager schlimmer als gar keine, weil sie nicht mehr gelesen, sondern geglaubt wird. Der
zehnte Fall kommt als fehlendes Gerät am Aufbautag heraus.

Der Namensvergleich bleibt deshalb erlaubt — aber nur als **Vorschlag, den ein Mensch einmal
bestätigt**, und die Bestätigung wird als `deviceTypeId` festgeschrieben. Danach ist sie eine
Tatsache und muss nie wieder geraten werden.

## Was verworfen wurde

- **Eine separate Zuordnungstabelle** (`deviceTypeId → inventoryItemId` neben beiden Seiten). Sie
  wäre genau die zweite Wahrheit, gegen die diese Arbeit läuft: Sie kann von beiden Seiten
  unabhängig veralten, und niemand merkt es.
- **Ein `model`-Feld im `EquipmentItem`.** Es würde den Modellnamen neben der `deviceTypeId`
  duplizieren, die ihn bereits autoritativ auflöst — und beim ersten Katalog-Update auseinanderlaufen.
- **Mengen im Plan speichern.** Die Menge ist eine Zählung über die Geräte des Plans, also
  ableitbar. Gespeichert wäre sie sofort widersprüchlich zum Canvas.

## Die Reihenfolge

| # | Inkrement | Warum hier |
| --- | --- | --- |
| 1 | `deviceTypeId` im Lager, Wire-Contract v2 | Ohne den Schlüssel ist alles Weitere Namensraten |
| 2 | Reiner Resolver: Bedarf → Deckung, mit drei Ausgängen | Deckt auf, was der Katalog nicht abdeckt |
| 3 | `seedFromEquipment` auf den Typ umstellen | Hört auf, Instanznamen als Modelle anzulegen |
| 4 | Stückliste + Kommissionier-Liste als Projektion | Erst wenn die Deckung belastbar ist |

Der Resolver in Inkrement 2 kennt **drei** Ausgänge, nie zwei: `matched-by-type` (Tatsache),
`proposed-by-name` (Vorschlag, wartet auf Bestätigung) und `unmatched` (im Lager nicht vorhanden).
Ein Vorschlag darf nie wie eine Deckung aussehen — dieselbe Regel wie die Provenienz im
`.avsourcemap`.

## Zum Wire-Contract

`avplan-inventory` ist eingefroren, aber nicht unveränderlich: `tests/inventoryContract.test.ts`
schreibt das Verfahren selbst vor — Version erhöhen, die identische Änderung in allen drei Repos
nachziehen, die eingefrorenen Key-Listen anpassen.

**Die Versionserhöhung ist hier keine Formsache, sondern die Wahl zwischen lautem und stillem
Fehler.** Naheliegend wäre, sie wegzulassen: Das Feld ist additiv und optional, `parseInventory`
reicht unbekannte Schlüssel durch, und alte Stände könnten die Datei einfach weiterlesen. Die
Prüfung im Code zeigt, warum das falsch wäre — `inventoryStore.healItem` baut jeden Artikel
**Feld für Feld** neu auf:

```ts
return { id: …, model: r.model, manufacturer: …, category: …, quantity: … }
```

Was es nicht kennt, fällt weg. Ein nicht aktualisierter Stand würde eine Datei mit `deviceTypeId`
also anstandslos importieren und beim nächsten Export **stillschweigend ohne das Feld**
zurückschreiben. Mit der Versionserhöhung greift dagegen `f.version > INVENTORY_FORMAT_VERSION` und
der alte Stand **weigert sich** — genau die Regel aus ADR-001: ein Import, der ein Feld nicht
erhalten kann, muss sich weigern, statt es zu verlieren.

In der Richtung, auf die es ankommt, bleibt alles wie es war: Ein neuer Stand liest v1-Dateien
unverändert weiter.

Betroffen sind cable-planner, multicam-planner, light-planner und `@avplan/inventory-core` in der
Suite. Nach der Konsolidierungsentscheidung entsteht die Änderung upstream und die Suite zieht nach.

## Was die Umsetzung gelehrt hat

Alle vier Inkremente sind gebaut (`cable-planner#605`, `#606`, `#607`, dazu die Contract-Änderung
in `multicam-planner#77`, `light-planner#43` und `av-planner-suite#20`). Drei Dinge sind beim Bauen
klarer geworden, als sie beim Entscheiden waren.

### Die Versionserhöhung war eine Entscheidung, keine Formsache

Sie steht oben ausführlich: Der Contract-Test verlangt sie zwar, aber mit dem Zusatz
„Abwärtskompatibilität beachten" — also war zu prüfen, ob sie hier hilft oder schadet. `healItem`
gab die Antwort. Wer eine solche Regel nur befolgt, statt sie am Code zu prüfen, trifft die
richtige Entscheidung aus dem falschen Grund und die falsche beim nächsten Mal.

### Zwei Fehler, die erst die Tests sichtbar gemacht haben

**Der Namens-Fallback verglich die Kategorie mit.** Für eine typisierte Zeile ist das zu streng: Der
Katalogname identifiziert das Modell allein, und Lagerpositionen tragen oft gar keine Kategorie.
Jetzt sucht ein typisierter Bedarf über den Modellnamen allein — aber nur, wenn er **eindeutig**
ist. Bei zwei gleichnamigen Positionen wäre jede Wahl geraten, also wird keine getroffen.

**Ein Namenstreffer mit fremder Identität verschluckte den Bedarf.** Er zählte als Treffer, wurde
wegen der fremden GUID nicht angefasst, und weil er als Treffer galt, entstand auch keine neue
Position — der Bedarf verschwand spurlos. Der erste Test dazu hatte es nicht gemerkt, weil er nur
prüfte, dass die fremde Position unverändert bleibt. Ein Test, der nur die eine Hälfte einer
Wirkung prüft, bestätigt einen Fehler, statt ihn zu finden.

### „Ein Vorschlag muss als Vorschlag erkennbar bleiben" ist eine Bauanweisung

Beim Entscheiden klang der Satz nach einer Frage der Darstellung. Beim Bauen hatte er drei
konkrete Folgen, von denen zwei nichts mit Farben zu tun haben:

1. Die CSV trägt den Zustand im Klartext (`gedeckt` / `VORSCHLAG` / `nicht im Lager`) plus die
   Begründung. Auf Papier gilt dieselbe Unterscheidung wie am Bildschirm — und Papier ist im Lager
   der Normalfall.
2. Ein Vorschlag bekommt **keinen Lagerort**. Ein Regalplatz liest sich wie eine Zusage, und ob es
   diese Position überhaupt ist, steht noch gar nicht fest.
3. Die Kommissionier-Liste enthält **keine** Vorschläge. Wer kommissioniert, soll nicht unterwegs
   entscheiden müssen, ob eine Zuordnung stimmt.

### Was offen bleibt

Der Weg aus `unmatched` heraus ist heute ein Hinweis in der Tabelle („ohne Katalog-Typ"), keine
Aktion. Ein Knopf, der einem Plan-Gerät den Katalog-Typ zuweist und die Bestätigung eines
Vorschlags als `deviceTypeId` festschreibt, wäre der nächste Schritt — dann wandert die Deckung
Zeile für Zeile von *Vorschlag* nach *Tatsache*, und zwar dauerhaft.
