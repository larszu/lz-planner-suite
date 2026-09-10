# Sprachdaten für die Texterkennung

Hier gehört **`deu.traineddata.gz`** hinein (rund 1 MB). Ohne sie liest der
Wareneingang keine Beleg-Fotos; er sagt das dann mit Namen und bleibt beim
Weg über eingefügten Text.

## Warum die Datei nicht im Repo liegt

Sie ist Fremd-Material und kommt in keinem npm-Paket mit. Sie hier
einzuchecken hiesse, ein Megabyte Trainingsdaten in die Versionsgeschichte zu
legen, das sich nie ändert und das jeder Klon mitzieht.

## Warum sie nicht zur Laufzeit geladen wird

`tesseract.js` holt sie in der Voreinstellung von
`https://tessdata.projectnaptha.com`. Genau das tut diese App **nicht**:

* Das Lager läuft offline. Ein Nachladen beim ersten Beleg wäre der Knopf,
  der im Keller ins Leere läuft.
* Die Entscheidung für lokales OCR (Eigentümer, 2026-09-10) lautete
  ausdrücklich, dass kein Beleg den Rechner verlässt. Ein stiller Abruf von
  einem fremden Server steht dem entgegen, auch wenn dabei nur Sprachdaten
  fliessen.

## So kommt sie hierher

```bash
curl -L -o public/tessdata/deu.traineddata.gz \
  https://tessdata.projectnaptha.com/4.0.0_fast/deu.traineddata.gz
```

Die Datei ist in `.gitignore` eingetragen. Für eine Auslieferung (Desktop,
Pages, Suite) gehört sie in den Bauschritt — sonst liegt das Feature beim
Nutzer brach.

Andere Sprache gewünscht? `OCR_SPRACHE` in `src/lib/belegOcr.ts` und der
Dateiname hier gehören zusammen.
