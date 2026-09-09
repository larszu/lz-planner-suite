import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Sind die Schieberegler zu treffen?
//
// Nutzer-Meldung 2026-09-09: „Passe auch die Ui von allen slidern an sodass
// man sie gut bedienen kann."
//
// GEMESSEN VORHER: fuer `input[type="range"]` stand im geteilten Stilblatt
// (`packages/ui/src/styles.css`) NICHTS. Es blieb beim Standardaussehen des
// Browsers, und dessen Regler ist in WebKit rund 16 px hoch. WCAG 2.2,
// Erfolgskriterium 2.5.8 („Target Size (Minimum)", Stufe AA), nennt 24 px.
//
// WARUM DIE REGEL IM GETEILTEN STILBLATT STEHT und dieser Test sie dort
// sucht: der Regler ist ein Bedienelement des Hauses wie der Knopf daneben.
// Haette ihn jede Anwendung fuer sich gesetzt, waeren es fuenf Zahlen fuer
// eine Regel — und die erste, die jemand vergisst, faellt niemandem auf.
//
// WAS DIESER TEST NICHT KANN: er liest das Stilblatt und die Regler im
// Quelltext. Was `gap`, Zeilenhoehe und ein umgebendes `transform` daraus
// machen, sieht er nicht — dafuer braeuchte es ein gerendertes Fenster.
// Er faengt die beiden Wege ab, auf denen ein Regler wieder schrumpft: die
// Zahl im Stilblatt und ein Inline-Stil an einem einzelnen Regler.
// ---------------------------------------------------------------------------

/** WCAG 2.2 SC 2.5.8, Stufe AA. Eine Norm mit einer Zahl. */
const MINDESTHOEHE = 24
/** Der sichtbare Griff. Kleiner als das findet der Daumen die Bahn nicht. */
const MINDESTGRIFF = 18

const WURZEL = resolve(__dirname, '..')
// Die Kommentare RAUS, bevor gemessen wird: der Kommentar ueber der Regel
// erklaert `height: 24px` und wuerde sonst als Regel gelesen. Ein Test, der
// seine eigene Begruendung wiederfindet, ist gruen auf dem Defekt.
const css = readFileSync(
  resolve(WURZEL, '../../packages/ui/src/styles.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

const block = (selektor: string): string | null => {
  const i = css.indexOf(selektor)
  if (i < 0) return null
  const auf = css.indexOf('{', i)
  const zu = css.indexOf('}', auf)
  return auf < 0 || zu < 0 ? null : css.slice(auf + 1, zu)
}

const px = (rumpf: string | null, eigenschaft: string): number | null => {
  if (!rumpf) return null
  const m = new RegExp(`${eigenschaft}\\s*:\\s*(\\d+(?:\\.\\d+)?)px`).exec(rumpf)
  return m ? Number(m[1]) : null
}

describe('Schieberegler-Trefferflaeche (WCAG 2.2 SC 2.5.8)', () => {
  it('das Element ist mindestens 24 px hoch', () => {
    const hoehe = px(block('input[type="range"] {'), 'height')
    expect(hoehe, 'input[type="range"] hat keine Hoehe in px').not.toBeNull()
    expect(hoehe!).toBeGreaterThanOrEqual(MINDESTHOEHE)
  })

  it('die Bahn bleibt schmal — sonst sprengt sie jede Zeile', () => {
    for (const selektor of [
      'input[type="range"]::-webkit-slider-runnable-track {',
      'input[type="range"]::-moz-range-track {',
    ]) {
      const rumpf = block(selektor)
      expect(rumpf, `${selektor} fehlt`).not.toBeNull()
      expect(px(rumpf, 'height')!).toBeLessThan(MINDESTHOEHE)
    }
  })

  it('der Griff ist in BEIDEN Browser-Familien mindestens 18 px', () => {
    // Ohne den Firefox-Zweig bliebe es dort beim Standardaussehen, und die
    // Messung stuende nur fuer einen Browser.
    for (const selektor of [
      'input[type="range"]::-webkit-slider-thumb {',
      'input[type="range"]::-moz-range-thumb {',
    ]) {
      const rumpf = block(selektor)
      expect(rumpf, `${selektor} fehlt`).not.toBeNull()
      expect(px(rumpf, 'width'), `${selektor} hat keine Breite in px`).not.toBeNull()
      expect(px(rumpf, 'width')!).toBeGreaterThanOrEqual(MINDESTGRIFF)
    }
  })

  it('kein Regler schrumpft sich per Inline-Stil zurueck', () => {
    // Der leisere Weg: das Stilblatt bleibt richtig, aber an EINEM Regler
    // haengt `style={{ height: 4 }}`. Ein Inline-Stil gewinnt gegen jeden
    // Selektor — nur faellt es niemandem auf, weil die anderen stimmen.
    const dateien: string[] = []
    const gehe = (d: string) => {
      for (const e of readdirSync(d)) {
        const p = join(d, e)
        if (statSync(p).isDirectory()) {
          if (e !== 'node_modules') gehe(p)
        } else if (/\.tsx$/.test(e)) dateien.push(p)
      }
    }
    gehe(join(WURZEL, 'src'))

    const treffer: string[] = []
    let gefunden = 0
    for (const datei of dateien) {
      const quelle = readFileSync(datei, 'utf8')
      for (const m of quelle.matchAll(/<input\b[^>]*type="range"[^>]*>/g)) {
        gefunden += 1
        const stil = /style=\{\{([^}]*)\}\}/.exec(m[0])?.[1] ?? ''
        const h = /height:\s*'?(\d+)/.exec(stil)
        if (h && Number(h[1]) < MINDESTHOEHE) treffer.push(`${datei} — ${h[0]}`)
      }
    }
    // Die Gegenprobe zum Test selbst: ohne sie waere ein Lauf, der KEINEN
    // Regler findet, gruen — und genau so sieht ein kaputtes Muster aus.
    expect(gefunden, 'kein einziger `type="range"` in der Shell gefunden').toBeGreaterThan(0)
    expect(treffer).toEqual([])
  })
})
