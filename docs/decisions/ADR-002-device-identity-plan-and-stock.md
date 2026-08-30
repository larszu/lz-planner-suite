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
nachziehen, die eingefrorenen Key-Listen anpassen. Das Feld ist **additiv und optional**, also
laden v1-Dateien unverändert weiter; die Versionsnummer sagt einem Leser trotzdem, dass es das Feld
jetzt gibt.

Betroffen sind cable-planner, multicam-planner, light-planner und `@avplan/inventory-core` in der
Suite. Nach der Konsolidierungsentscheidung entsteht die Änderung upstream und die Suite zieht nach.
