# Abschnitt 15: Nutzermeinung — Versuch, Ergebnis, und warum die Lücke bleibt

Stand: 2026-09-01 · Ergänzt [`METHOD.md`](../METHOD.md) und Abschnitt 7 von
[`FEATURE-STRATEGY.md`](FEATURE-STRATEGY.md).

## Das Ergebnis zuerst: die Lücke ist nicht geschlossen

Diese Runde hat **keinen einzigen belegten Fund** erzeugt. Das ist kein Scheitern der Ausführung,
sondern das Messergebnis, und es gehört an den Anfang, damit niemand dieses Dokument für eine
erledigte Section 15 hält.

Zwölf Segment-Rechercheure liefen, zehn kamen durch, und **alle zehn meldeten dieselbe
Suchqualität: `thin`.** Kein Segment meldete `good`. Die anschließende gegnerische Prüfstufe, die
jeden Rohbefund gegen seine Quelle halten sollte, kam nicht mehr zum Zug — sie brach am
Sitzungslimit ab, bevor sie einen einzigen Befund abschließen konnte. Damit gilt:

> **Von 80 Rohbefunden dieser Runde ist keiner verifiziert. Keiner davon darf in den Korpus.**

Sie ungeprüft zu übernehmen wäre der genaue Fehler, gegen den die Prüfstufe eingebaut war — und in
einem Korpus, aus dem Produktentscheidungen abgeleitet werden, schädlicher als die Lücke selbst.

## Was technisch möglich war

| Weg | Status |
| --- | --- |
| Direktes HTTPS zu `reddit.com`, `g2.com`, `capterra.com` | **Blockiert.** Das Gateway beantwortet CONNECT mit 403 (Policy-Denial), in dieser Sitzung für alle drei geprüft |
| `WebSearch`-Tool | **Verfügbar, aber schwach für diese Frage.** Es liefert Titel und URLs; auf Beschwerde-Formulierungen zugeschnittene Anfragen brachten überwiegend Wikipedia-, Hersteller- und Patentseiten zurück — also genau die Quellenarten, die über Nutzermeinung nichts aussagen |
| `WebFetch` auf eine gefundene URL | Verfügbar, aber nur so gut wie die Trefferliste davor |

Ein Beispiel, stellvertretend für die Ausbeute: eine Suche nach Klagen von Bildingenieuren über
Kamera-Steuersoftware lieferte den Wikipedia-Artikel „Camera control unit", den Wikipedia-Artikel
„Broadcast engineering", ein GitHub-Repo, einen Cisco-Support-Artikel und ein Google-Patent. Keine
dieser Quellen kann eine Aussage darüber tragen, was Nutzer hassen.

## Was das über den bestehenden Korpus sagt

`METHOD.md` hält bereits fest, dass die 224 Schmerzpunkte auf GitHub-Issues plus
Suchzusammenfassungen ruhen und damit **geschlossene kommerzielle Produkte systematisch
unterrepräsentieren** — deren Nutzer legen keine öffentlichen Issues an. Diese Runde konnte diese
Verzerrung **nicht korrigieren.** Sie hat sie bestätigt: dort, wo der Korpus am dünnsten ist, war
auch diese Runde am dünnsten, und aus demselben Grund.

Praktisch heißt das: Schlüsse, die aus *Schweigen* in den Segmenten Event-Rental-ERP,
Broadcast-Production-Management, Kamerasteuerung und Intercom gezogen werden, bleiben schwach.
Nicht falsch — schwach. Sie sollten keine Roadmap-Position allein tragen.

## Bewegt sich das Ranking?

**Nein.** Kein Score in der Roadmap ändert sich, weil kein belegter Fund vorliegt, der eine Änderung
stützen würde. Ein Ranking auf Grundlage unverifizierter Rohbefunde zu verschieben, hieße, die
Prioritäten des Produkts an Material zu hängen, das die eigene Qualitätsstufe nicht bestanden hat.

Das ist ausdrücklich auch dann die richtige Antwort, wenn sie unbefriedigend aussieht: Abschnitt 31
des Auftrags misst das Produkt an vermiedenen Fehlern, nicht an Menge.

## Was eine echte Section 15 bräuchte

Konkret, damit ein nächster Anlauf nicht denselben Weg nimmt:

1. **Egress zu den Meinungsquellen.** Reddit (`r/VIDEOENGINEERING`, `r/livesound`, `r/lightingdesign`,
   `r/CommercialAV`), G2, Capterra, TrustRadius, dazu die Herstellerforen (Blackmagic, Vectorworks,
   ChamSys, Bitfocus) und die Fachforen (Blue Room, Control Booth, LightNetwork, ProSoundWeb). Ohne
   direkte Abrufe bleibt es bei Trefferlisten über Enzyklopädie-Artikel.
2. **Beschwerdeform statt Produktname als Suchanker.** Die produktivsten Anfragen dieser Runde waren
   nicht „Produkt X Probleme", sondern Formulierungen, wie Betroffene sie schreiben — „why does X
   still not", „workaround for", „gave up on". Das gehört in die Methode, nicht in den Zufall.
3. **Die Prüfstufe muss durchlaufen.** Sie ist der Teil, der den Unterschied zwischen Recherche und
   Erfindung macht. Eine Runde, die sie nicht erreicht, hat kein Ergebnis — auch dann nicht, wenn
   Rohbefunde vorliegen.
4. **Ein Zeitbudget, das zur Fächerung passt.** 93 Agenten über 12 Segmente sind mehr, als eine
   Sitzung trägt. Weniger Segmente je Lauf, dafür bis zur Prüfstufe durch.

## Die Rohbefunde

Die 80 unverifizierten Rohbefunde liegen im Workflow-Journal
(`section-15-user-research`, Lauf `wf_b1beb0a2-47a`). Sie sind **Kandidaten für eine Prüfung**, keine
Funde. Wer sie später aufgreift, prüft jeden einzeln gegen seine Quelle, bevor ein Satz daraus in den
Korpus wandert.
