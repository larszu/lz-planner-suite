import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as haupt from '@avplan/ui'
import * as bruecke from '@avplan/ui/embed'

// ───────────────────────────────────────────────────────────────────────────
// EIN GUARD, DER AUS EINEM ECHTEN FEHLSCHLAG ENTSTANDEN IST (2026-09-07).
//
// `RundownCard.tsx` importierte `type SuiteSeed` aus `@avplan/ui`. Dort steht
// es nicht — es ist im Bruecken-Eintrag `@avplan/ui/embed` zuhause. Lokal ist
// das NICHT aufgefallen, und das ist der eigentliche Befund:
//
//   * `tsc -p apps/shell/tsconfig.json --noEmit` loest `@avplan/ui` ueber die
//     Projekt-Referenzen auf die QUELLEN auf und sieht dabei alles, was
//     irgendwo im Paket steht.
//   * `tsc -b` (das, was `npm run build` und damit CI ausfuehren) loest auf
//     die GEBAUTEN Typen des jeweiligen Eintrags auf — und dort fehlte der
//     Name.
//
// Die lokale Pruefung war also nicht die, die CI faehrt. Ein Guard, der etwas
// anderes prueft als das, was bricht, ist schlimmer als keiner: er gibt gruen
// und man glaubt ihm.
//
// Dieser Test schliesst die Luecke auf der Ebene, auf der sie entstand: er
// liest die Import-Anweisungen der Shell und haelt jeden benannten Import
// gegen das, was der jeweilige Eintrag WIRKLICH exportiert. Reine Typ-Namen
// (`import type`, `type X`) sind zur Laufzeit nicht sichtbar und werden
// deshalb gegen die Quelltexte des Pakets gehalten.
// ───────────────────────────────────────────────────────────────────────────

const SHELL_SRC = join(import.meta.dirname, '..', 'src')
const UI_SRC = join(import.meta.dirname, '..', '..', '..', 'packages', 'ui', 'src')

const dateien = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory()
      ? dateien(join(dir, d.name))
      : /\.tsx?$/.test(d.name)
        ? [join(dir, d.name)]
        : [],
  )

/** Was der Eintrag zur Laufzeit hergibt, plus die Typnamen aus seinem Quelltext. */
const exportiert = (laufzeit: object, eintragsDatei: string): Set<string> => {
  const namen = new Set(Object.keys(laufzeit))
  // Typ-Exporte verschwinden beim Uebersetzen. Sie stehen aber im
  // Eintrags-Quelltext, und der ist die Wahrheit, gegen die `tsc -b` prueft.
  const quelle = readFileSync(join(UI_SRC, eintragsDatei), 'utf8')
  // (1) Inline-Markierung in einer Import-/Export-Liste: `{ …, type X, … }`.
  for (const m of quelle.matchAll(/\btype\s+([A-Za-z0-9_]+)/g)) namen.add(m[1])
  // (2) Ganze Typ-Listen: `export type { A, B } from '…'` — auch mehrzeilig.
  //     Ohne diesen Zweig sah der Guard nur die Namen, die zufaellig auch in
  //     einer Import-Zeile mit `type X` standen; ein Typ, der NUR ueber einen
  //     `export type {…}`-Block herausgeht, galt als nicht exportiert. Der
  //     Guard war damit an einer richtigen Aenderung rot (2026-09-08,
  //     `SeedConflict`/`SeedWriter`) und haette bei der naechsten das Umbauen
  //     der Datei erzwungen statt eines echten Fundes.
  for (const m of quelle.matchAll(/\bexport\s+type\s*\{([^}]*)\}/g)) {
    for (const roh of m[1].split(',')) {
      const name = roh.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()!.trim()
      if (name) namen.add(name)
    }
  }
  return namen
}

/** Alle benannten Importe aus einem Modul-Pfad, ueber alle Shell-Dateien. */
const importeAus = (modul: string): { datei: string; name: string }[] => {
  const out: { datei: string; name: string }[] = []
  const muster = new RegExp(
    `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*['"]${modul.replace('/', '\\/')}['"]`,
    'g',
  )
  for (const datei of dateien(SHELL_SRC)) {
    const inhalt = readFileSync(datei, 'utf8')
    for (const m of inhalt.matchAll(muster)) {
      for (const roh of m[1].split(',')) {
        const name = roh.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
        if (name) out.push({ datei: datei.slice(SHELL_SRC.length + 1), name })
      }
    }
  }
  return out
}

describe('Die Shell importiert nur, was der jeweilige Paket-Eintrag hergibt', () => {
  it('@avplan/ui', () => {
    const vorhanden = exportiert(haupt, 'index.ts')
    const fehlend = importeAus('@avplan/ui').filter((i) => !vorhanden.has(i.name))
    expect(
      fehlend.map((f) => `${f.name} (${f.datei})`),
      'Diese Namen exportiert @avplan/ui nicht — `tsc -b` und damit CI bricht daran, ' +
        'auch wenn `tsc --noEmit` sie ueber die Projekt-Referenzen noch findet',
    ).toEqual([])
  })

  it('@avplan/ui/embed', () => {
    const vorhanden = exportiert(bruecke, 'embed.ts')
    const fehlend = importeAus('@avplan/ui/embed').filter((i) => !vorhanden.has(i.name))
    expect(fehlend.map((f) => `${f.name} (${f.datei})`)).toEqual([])
  })

  it('findet die Importe ueberhaupt — sonst prueft der Guard nichts', () => {
    // Ein Guard, dessen Suche ins Leere geht, ist gruen und wertlos. Genau
    // die Sorte, die in dieser Codebasis schon einmal ein ganzes Repo
    // ungeprueft gelassen hat.
    expect(importeAus('@avplan/ui').length).toBeGreaterThan(10)
    expect(importeAus('@avplan/ui/embed').length).toBeGreaterThan(3)
  })
})
