import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// B-22 — „Der Lager-Import kennt kein Abbrechen".
//
// Der Befund im Backlog nennt den Schadensweg genau: In der Suite ist die
// Frage vor dem Lager-Import ein `confirmDialog`, und dessen `false` kommt
// nicht nur vom Zweitknopf, sondern auch von ESCAPE und vom KLICK NEBEN DEN
// DIALOG. Beide Gesten heissen ueberall sonst „nichts tun"; dort schrieben
// sie fremde Artikel in den Bestand. `importSnapshot` ruft `persist` sofort,
// und ein Undo fuer den Lager-Store gibt es nicht — der Stand ist danach
// nicht wiederherstellbar.
//
// Die Ursache ist nicht der Aufrufer, sondern der Rueckgabetyp: `boolean`
// kann „hat nein gesagt" und „hat gar nichts gesagt" nicht auseinanderhalten.
// Fuer neun von zehn Fragen ist das richtig — „Wirklich loeschen?" braucht
// die Unterscheidung nicht. Der Lager-Import ist die Ausnahme, weil sein
// Zweitknopf „Zusammenfuehren" heisst und damit selbst eine Handlung ist.
//
// WARUM DIESER TEST DEN QUELLTEXT LIEST. `choiceDialog` haengt am DOM (es
// mountet einen Dialog und wartet auf eine Geste); was hier gemessen werden
// muss, ist keine Rechnung, sondern eine VERDRAHTUNG: welcher Ausgang welchen
// Wert liefert und was der Aufrufer damit macht. Ein Render-Test wuerde
// dasselbe pruefen, nur mit einer DOM-Umgebung mehr — und die eigentliche
// Zusage („dismissed importiert nicht") steht an zwei Stellen im Aufrufer,
// nicht im Dialog.
//
// STAND 2026-09-08: die beiden LAGER-Aufrufer sind weiter — sie fragen gar
// nicht mehr, sondern zeigen eine Vorschau (E-15). Was `dialog.tsx` zusagt,
// gilt unveraendert und wird hier weiter geprueft; es traegt die zehn
// uebrigen Aufrufer. Der Lager-Teil dieses Waechters prueft jetzt die
// schaerfere Nachfolge-Zusicherung, siehe unten.
//
// GEGENGEPROBT: `onDone('dismissed')` in Escape/Backdrop zurueck auf
// `'cancel'` -> rot; die Vorschau-Verdrahtung in einem der beiden
// Lager-Dialoge zurueckgebaut -> rot.
// ---------------------------------------------------------------------------

const lies = (rel: string): string =>
  readFileSync(resolve(__dirname, '..', '..', '..', rel), 'utf8')

const dialog = readFileSync(resolve(__dirname, '..', 'src', 'dialog.tsx'), 'utf8')

describe('B-22: Weggehen ist keine Antwort', () => {
  it('Escape und Klick daneben liefern `dismissed`', () => {
    expect(dialog).toMatch(/if \(e\.key === 'Escape'\) onDone\('dismissed'\)/)
    expect(dialog).toMatch(/onBackdrop=\{\(\) => onDone\('dismissed'\)\}/)
  })

  it('die beiden Knoepfe liefern weiterhin ihre eigene Absicht', () => {
    expect(dialog).toMatch(/onClick=\{\(\) => onDone\('cancel'\)\}/)
    expect(dialog).toMatch(/onClick=\{\(\) => onDone\('ok'\)\}/)
  })

  it('`confirmDialog` bleibt fuer alle anderen Aufrufer unveraendert', () => {
    // `dismissed` faellt dort bewusst mit `cancel` zusammen: fuer „Wirklich
    // loeschen?" heisst beides nein. Waere das nicht so, muesste jeder der
    // zehn vorhandenen Aufrufer angefasst werden — und genau dabei entstehen
    // die Fehler, die dieser Fix vermeiden soll.
    expect(dialog).toMatch(/await choiceDialog\(title, options\)\) === 'ok'/)
  })

  it('kein Lager-Import fragt noch per Ja/Nein — er zeigt eine Vorschau', () => {
    // ABGELOEST, NICHT AUFGEGEBEN (E-15, light#97 / multicam#111).
    //
    // Hier stand bis 2026-09-08, dass beide Aufrufer `choiceDialog` benutzen
    // und bei `dismissed` abbrechen. Das war das ZWISCHENMASS aus suite#154,
    // und es war fuer genau diesen Tag angekuendigt: „bleibt, bis die
    // Vorschau es abloest." Sie loest es ab, und dieser Waechter wurde an
    // einer RICHTIGEN Aenderung rot.
    //
    // Ein Waechter, der das tut, wird geaendert statt gelesen — aber nicht
    // ersatzlos: die Zusicherung dahinter ist dieselbe geblieben und hier
    // SCHAERFER zu haben. Sie hiess „keine Geste, die ueberall sonst nichts
    // tut, schreibt in den Bestand". Jetzt gilt: das LESEN einer Datei
    // schreibt ueberhaupt nichts. Geschrieben wird nur aus einem eigenen
    // Knopf heraus, den jemand nach den Zahlen drueckt.
    for (const rel of [
      'apps/light-planner/src/inventory/InventoryDialog.tsx',
      'apps/multicam-planner/src/inventory/InventoryDialog.tsx',
    ]) {
      // OHNE KOMMENTARZEILEN. Der Aufrufer erklaert in seinem Kopf, was er
      // ABGELOEST hat, und zitiert dabei `window.confirm`. Ein Waechter, der
      // Prosa liest, ist von einem Satz zu haben — und faellt hier ueber
      // einen, der ausdruecklich sagt, dass es den Aufruf nicht mehr gibt.
      const src = lies(rel)
        .split('\n')
        .filter((z) => !/^\s*(\/\/|\*|\/\*)/.test(z))
        .join('\n')
      // Keine Ja/Nein-Frage mehr, in keiner der beiden Bauformen.
      expect(src, rel).not.toMatch(/await confirmDialog\(/)
      expect(src, rel).not.toMatch(/await choiceDialog\(/)
      expect(src, rel).not.toMatch(/window\.confirm/)

      // Das Lesen legt die Datei nur BEREIT.
      expect(src, rel).toMatch(/setPending\(\{ snap, mode: 'merge' \}\)/)

      // Und geschrieben wird genau einmal, mit dem Modus, den die gezeigte
      // Vorschau gerechnet hat.
      const schreibstellen = [...src.matchAll(/importSnapshot\(/g)].length
      expect(schreibstellen, `${rel}: mehr als eine Schreibstelle`).toBe(1)
      expect(src, rel).toMatch(/importSnapshot\(pending\.snap, pending\.mode\)/)

      // Der Knopf, der sie ausloest, ist ein eigener — und daneben steht
      // einer, der nichts tut.
      expect(src, rel).toMatch(/onClick=\{doImportConfirm\}/)
      expect(src, rel).toMatch(/onClick=\{\(\) => setPending\(null\)\}/)
    }
  })
})
