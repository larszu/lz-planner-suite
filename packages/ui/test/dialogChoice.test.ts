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
// GEGENGEPROBT: `onDone('dismissed')` in Escape/Backdrop zurueck auf
// `'cancel'` -> rot; die `dismissed`-Rueckkehr in einem der beiden
// Lager-Dialoge entfernt -> rot.
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

  it('beide Lager-Importe brechen bei `dismissed` ab, ohne zu schreiben', () => {
    for (const rel of [
      'apps/light-planner/src/inventory/InventoryDialog.tsx',
      'apps/multicam-planner/src/inventory/InventoryDialog.tsx',
    ]) {
      const src = lies(rel)
      expect(src, rel).toMatch(/const wahl = await choiceDialog\(/)
      // Der Abbruch steht VOR dem Schreiben — sonst importiert er doch.
      const abbruch = src.indexOf("if (wahl === 'dismissed')")
      const schreiben = src.indexOf('importSnapshot(snap')
      expect(abbruch, `${rel}: kein Abbruch bei dismissed`).toBeGreaterThan(-1)
      expect(schreiben, `${rel}: kein Import gefunden`).toBeGreaterThan(-1)
      expect(abbruch, rel).toBeLessThan(schreiben)
      // Und `cancel` schreibt weiterhin zusammenfuehrend — der Zweitknopf ist
      // eine Absicht, kein Abbruch.
      expect(src, rel).toMatch(/importSnapshot\(snap, wahl === 'ok' \? 'replace' : 'merge'\)/)
    }
  })

  it('kein Lager-Import benutzt mehr das zweiwertige confirmDialog', () => {
    for (const rel of [
      'apps/light-planner/src/inventory/InventoryDialog.tsx',
      'apps/multicam-planner/src/inventory/InventoryDialog.tsx',
    ]) {
      expect(lies(rel), rel).not.toMatch(/await confirmDialog\(/)
    }
  })
})
