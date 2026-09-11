import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

// ───────────────────────────────────────────────────────────────────────────
// Die Übersetzung ist vollständig — gemessen, nicht behauptet.
//
// NUTZER-ENTSCHEIDUNG 2026-09-11: „Die Standard Sprache muss immer Englisch
// sein und über i18n muss man auf deutsch übersetzen können."
//
// ─── WOGEGEN DIESER LAUF STEHT ────────────────────────────────────────────
//
// Gegen die Sorte Lücke, die NIEMAND meldet. Ein fehlender Schlüssel ist
// kein Absturz und keine leere Stelle: `translate()` gibt die englische
// Quelle zurück, und die Oberfläche steht dann auf Deutsch mit einer
// englischen Zeile mittendrin. Wer die App gebaut hat, liest darüber hinweg
// — er kennt den Satz ja. Es fällt dem Gebäude-Werkzeugisten auf, und der schreibt
// keinen Fehlerbericht, sondern hört auf, die deutsche Fassung zu benutzen.
//
// `npm run lang:check` misst die andere Richtung: dass die QUELLE englisch
// ist. Beide zusammen halten die Zusage — die eine ohne die andere ist eine
// halbe.
//
// ─── DREI MESSUNGEN ───────────────────────────────────────────────────────
//
//  1. Jeder Schlüssel, der in `src/` aufgerufen wird, hat eine deutsche
//     Fassung.
//  2. Jede deutsche Fassung wird auch aufgerufen. Ein Eintrag ohne Aufrufer
//     ist ein Rest aus einem Umbau — er schadet nicht, aber er lässt das
//     Wörterbuch voller aussehen, als es ist, und beim nächsten Umbau
//     übersetzt jemand ihn nach.
//  3. Die Platzhalter stimmen überein. Das ist die gemeinste der drei: steht
//     in der Quelle `{n} units` und in der Übersetzung `Einheiten`, fehlt in
//     der deutschen Oberfläche STILL die Zahl. Der Satz liest sich richtig,
//     und er sagt etwas anderes.
//
// ─── WAS ER NICHT KANN ────────────────────────────────────────────────────
//
// Er liest Quelltext und prüft keine Bedeutung. Eine deutsche Zeile, die
// etwas anderes sagt als die englische, ist von hier aus nicht zu sehen —
// dagegen hilft nur jemand, der beide Sprachen liest.
//
// Und er sieht nur `t(...)`/`translate(...)` mit einem festen Schlüssel. Wer
// einen Schlüssel zusammenbaut (`t('x.' + art, …)`), entzieht sich der
// Messung; deshalb steht das im Repo nirgends, und deshalb schlägt Messung 2
// an, wenn es doch jemand tut — der zugehörige Eintrag stünde dann als
// verwaist da.
// ───────────────────────────────────────────────────────────────────────────

const SRC = resolve(__dirname, '..', '..')

const dateien = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    // `src/i18n/` selbst bleibt draussen: dort steht das Woerterbuch, und in
    // den Kopfkommentaren daneben stehen BEISPIELE der Form
    // `t('bereich.schluessel', 'English source text')`. Sie als Aufrufer zu
    // lesen hiesse, zwei erfundene Schluessel zu verlangen — ein Waechter,
    // der bei richtigem Code anschlaegt, wird abgeschaltet und nicht gelesen.
    if (statSync(p).isDirectory()) {
      if (!/[\\/]i18n$/.test(p)) dateien(p, out)
    } else if (/\.tsx?$/.test(p) && !/__tests__/.test(p)) out.push(p)
  }
  return out
}

/**
 * `t('key', 'English')`, `translate(lang, 'key', 'English')` — und
 * `uebersetze(...)`.
 *
 * Der dritte Name steht dort, wo eine Sicht ihre Zeilen `t` nennt (die
 * Trassen-Tabelle) und der Übersetzer deshalb einen anderen Namen braucht.
 * Ihn hier zu vergessen wäre die schlimmste Sorte grün: seine Schlüssel
 * fielen als verwaiste Wörterbuch-Einträge auf — also an der falschen
 * Stelle, mit der falschen Begründung.
 */
const AUFRUF = /\b(?:t|translate|uebersetze)\(\s*(?:[A-Za-z][\w.]*\s*,\s*)?'([\w.]+)'\s*,\s*(?:\n\s*)?'((?:[^'\\]|\\.)*)'/g

/** Ein Eintrag im Wörterbuch: `'key': 'Text'`, auch über zwei Zeilen. */
const EINTRAG = /'([\w.]+)':\s*(?:\n\s*)?'((?:[^'\\]|\\.)*)'/g

const platzhalter = (s: string): string[] => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

const quellen = new Map<string, { en: string; wo: string }>()
for (const datei of dateien(SRC)) {
  const text = readFileSync(datei, 'utf8')
  for (const m of text.matchAll(AUFRUF)) {
    quellen.set(m[1], { en: m[2], wo: relative(SRC, datei) })
  }
}

const woerterbuchText = readFileSync(join(SRC, 'i18n', 'de.ts'), 'utf8')
const deutsch = new Map<string, string>()
for (const m of woerterbuchText.matchAll(EINTRAG)) deutsch.set(m[1], m[2])

describe('die deutsche Fassung deckt die Oberfläche', () => {
  it('0. die Gegenprobe zuerst: es wurde überhaupt etwas gefunden', () => {
    // Ohne diese Zeile wäre jede der drei Messungen darunter mit einem
    // kaputten Muster still grün — die schlimmste Sorte grün, weil sie nach
    // Arbeit aussieht. Die Schwellen wandern mit: wer die Oberfläche
    // ausbaut, hebt sie und schreibt die neue Messung dazu (gemessen am
    // 2026-09-11: 200 Aufrufe, 200 Einträge).
    expect(quellen.size, 'kein einziger t()-Aufruf gefunden — Muster kaputt').toBeGreaterThan(120)
    expect(deutsch.size, 'kein einziger Wörterbuch-Eintrag gefunden — Muster kaputt').toBeGreaterThan(120)
  })

  it('1. jeder aufgerufene Schlüssel hat eine deutsche Fassung', () => {
    const fehlend = [...quellen.entries()]
      .filter(([k]) => !deutsch.has(k))
      .map(([k, v]) => `${k} (${v.wo}): "${v.en.slice(0, 60)}"`)
    expect(fehlend, `ohne deutsche Fassung:\n  ${fehlend.join('\n  ')}`).toEqual([])
  })

  it('2. jede deutsche Fassung wird auch aufgerufen', () => {
    const verwaist = [...deutsch.keys()].filter((k) => !quellen.has(k))
    expect(verwaist, `Einträge ohne Aufrufer: ${verwaist.join(', ')}`).toEqual([])
  })

  it('3. die Platzhalter der Übersetzung sind die der Quelle', () => {
    const schief: string[] = []
    for (const [k, { en }] of quellen) {
      const de = deutsch.get(k)
      if (de === undefined) continue
      const a = platzhalter(en)
      const b = platzhalter(de)
      if (a.join(',') !== b.join(',')) {
        schief.push(`${k}: Quelle {${a.join(', ')}} — Übersetzung {${b.join(', ')}}`)
      }
    }
    expect(schief, `Platzhalter laufen auseinander:\n  ${schief.join('\n  ')}`).toEqual([])
  })
})
