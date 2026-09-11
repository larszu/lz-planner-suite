import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ───────────────────────────────────────────────────────────────────────────
// ADR-007 der av-planner-suite — die Marken-Palette, Stufe 6.
//
// WARUM DIE WERTE HIER EIN ZWEITES MAL STEHEN. Maschinenlesbar stehen sie in
// `@avplan/ui` (`src/brand.ts`), aber dieses Repo haengt an keinem Paket der
// Suite: es laeuft eigenstaendig und wird vendoriert. Ohne diesen Lauf waere
// der Rueckweg in die rohe slate-Palette eine Zeile, die niemandem auffaellt —
// und genau so hat dieses Repo am 2026-09-09 angefangen.
//
// WAS ER MISST: die Token-Schicht in `src/index.css`, also die Werte, aus
// denen jede Regel darunter ihre Farbe zieht. Er misst NICHT das gerenderte
// Fenster; was Kontrast, Ueberlagerung und ein umgebendes `filter` daraus
// machen, sieht er nicht.
// ───────────────────────────────────────────────────────────────────────────

const css = readFileSync(resolve(__dirname, '..', '..', 'index.css'), 'utf8')

/** Der Wert eines Tokens aus dem `:root`-Block — Kommentare abgeschnitten. */
const OHNE_KOMMENTAR = new RegExp('/\\*[\\s\\S]*?\\*/', 'g')

const token = (name: string): string => {
  const m = new RegExp(name + ':\\s*([^;]+);').exec(css)
  return m ? m[1].replace(OHNE_KOMMENTAR, '').trim() : ''
}

describe('ADR-007: die Flaechen und die Schrift', () => {
  it('der Grund ist Deep Navy, die Flaeche Zumpe Navy', () => {
    expect(token('--bg')).toBe('#132040')
    expect(token('--flaeche')).toBe('#1D324F')
    expect(token('--erhoben')).toBe('#24405F')
  })

  it('Fliesstext ist Eisblau, Gedaempftes Stahlblau', () => {
    // Schiefer waere auf Navy unlesbar — er kommt nur im hellen Theme vor.
    expect(token('--text')).toBe('#E1ECEF')
    expect(token('--leise')).toBe('#8C9CB3')
  })

  it('die Linie ist die Deckung aus dem Handbuch, keine Vollfarbe', () => {
    // Guide S. 17: Struktur entsteht durch Linie und Weissraum, und die Linie
    // liegt ueber dem Grund statt neben ihm.
    expect(token('--rand')).toBe('rgba(246, 245, 240, 0.14)')
  })
})

describe('ADR-007: das Signal ist nicht der Status', () => {
  it('Tally-Rot steht allein', () => {
    expect(token('--signal')).toBe('#D6402E')
  })

  it('die Meldefarben sind die des Handbuchs und NICHT Tally-Rot', () => {
    // Der Punkt dieses Laufs: wer eine Warnung in Tally-Rot setzt, nimmt dem
    // Aufnahmelicht seine Bedeutung. Deshalb wird hier auf Ungleichheit
    // geprueft und nicht nur auf den Wert.
    expect(token('--warn')).toBe('#C8892B')
    expect(token('--gefahr')).toBe('#B04A3F')
    expect(token('--ok')).toBe('#2F7D5C')
    for (const t of ['--warn', '--gefahr', '--ok']) {
      expect(token(t), `${t} darf nicht Tally-Rot sein`).not.toBe('#D6402E')
    }
  })
})

describe('ADR-007: was es nicht gibt', () => {
  it('keine Rundungen, keine Schatten, keine Verlaeufe', () => {
    // Guide S. 10. Gemessen am Stilblatt ohne seine Kommentare — sonst
    // besaenftigt die Begruendung den Waechter, der sie pruefen soll.
    const ohneKommentare = css.replace(OHNE_KOMMENTAR, '')
    expect(/border-radius:\s*(?!0)/.test(ohneKommentare), 'border-radius').toBe(false)
    expect(/box-shadow:\s*(?!none)/.test(ohneKommentare), 'box-shadow').toBe(false)
    expect(/linear-gradient|radial-gradient/.test(ohneKommentare), 'Verlauf').toBe(false)
  })

  it('keine rohen slate-Farben mehr', () => {
    // Die sechs, mit denen dieses Repo angefangen hat. Sie stehen hier als
    // Liste und nicht als Muster: ein Muster wuerde auch die Marken-Werte
    // treffen, und dann waere der Lauf immer rot oder immer gruen.
    for (const alt of ['#0f172a', '#1e293b', '#334155', '#e2e8f0', '#94a3b8', '#f59e0b']) {
      expect(css.toLowerCase().includes(alt), `${alt} steht noch im Stilblatt`).toBe(false)
    }
  })

})

describe('Gegenprobe zum Lauf selbst', () => {
  it('`token` liest wirklich aus dem Stilblatt', () => {
    // Ein Leser, der fuer jeden Namen '' liefert, machte jede Zusicherung
    // oben zu einem Vergleich zweier leerer Zeichenketten — gruen, und ohne
    // Aussage. Deshalb einmal ein Name, den es sicher NICHT gibt, und einer,
    // den es sicher gibt.
    expect(token('--gibt-es-nicht')).toBe('')
    expect(token('--bg')).not.toBe('')
  })
})
