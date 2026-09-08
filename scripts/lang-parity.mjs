// ───────────────────────────────────────────────────────────────────────────
// Ein Klassifizierer fuer die Quellsprache — und der Guard dagegen, dass es
// drei werden (E-17/E-20).
//
// WORUM ES GEHT. Seit dem 2026-09-08 erklaert jedes Repo seine Quellsprache
// (`package.json` -> `avplan.sourceLanguage`) und MISST sie: ein Lauf liest die
// Fallback-Texte, ordnet jeden einer Sprache zu und faellt bei jedem, der in
// der anderen steht. Drei Repos fuehren dafuer denselben Klassifizierer:
//
//   cable-planner      scripts/quellsprache.mjs        (deutsch-quellig)
//   light-planner      scripts/quellsprache-check.ts   (deutsch-quellig)
//   multicam-planner   scripts/quellsprache-check.mjs  (englisch-quellig)
//
// Sie teilen keinen Quellbaum. Die Suite ist der einzige Ort, an dem alle drei
// Kopien im selben Baum liegen — genau dafuer ist sie da, und genau so haelt
// `spec:vocab` seit Laengerem die `specSource`-Helfer zusammen.
//
// WARUM ES DEN GUARD BRAUCHT — AUS DER ERFAHRUNG NEBENAN, NICHT AUS SORGE.
// Beim `specSource`-Vokabular liefen zwei Kopien keine Stunde nach ihrer
// Entstehung auseinander: `isEstimate` erkannte in der einen „geschaetzt" UND
// „estimate", in der anderen nur „geschaetzt" — und eine englisch formulierte
// Schaetzung ging als Beleg durch.
//
// Hier draeut derselbe Fehler in einer besonders unangenehmen Form: die
// Wortlisten enthalten NUR Woerter, die es in der jeweils anderen Sprache
// nicht gibt. `a`, `an`, `was`, `will`, `also`, `in`, `so`, `man` und `only`
// fehlen mit Absicht — eine fruehe Fassung meldete damit deutsche Zeilen als
// englisch („Was funkt", „gepinnt an"). Wer eines davon in EINER Kopie
// nachtraegt, macht dort Fehlalarme, und Fehlalarme kosten den Waechter:
// jemand schaltet ihn ab, und das Repo verliert die Zusicherung still.
//
// WAS VERGLICHEN WIRD. Die beiden Wortlisten und die Entscheidungslogik von
// `klassifiziere` — Zeichen fuer Zeichen nach dem Entfernen von Kommentaren,
// Typannotationen und Leerraum. NICHT verglichen wird alles Drumherum: die
// Repos lesen verschiedene Wurzeln, nennen ihre zweite Deklarationsstelle
// anders (CLAUDE.md, README.md) und der multicam-Lauf hat einen eigenen Zweig
// fuer „hier ist noch nichts zu messen". Das sind echte Unterschiede und keine
// Drift.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const KOPIEN = [
  { app: 'cable-planner', datei: 'apps/cable-planner/scripts/quellsprache.mjs' },
  { app: 'light-planner', datei: 'apps/light-planner/scripts/quellsprache-check.ts' },
  { app: 'multicam-planner', datei: 'apps/multicam-planner/scripts/quellsprache-check.mjs' },
]

const fehler = []

/** Den Inhalt eines `const NAME = [ … ]` als Wortmenge. */
const liste = (quelle, name) => {
  const m = new RegExp(`const ${name}(?:: string\\[\\])? = \\[([\\s\\S]*?)\\n\\]`).exec(quelle)
  if (!m) return null
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
}

/**
 * Der Rumpf von `klassifiziere`, auf das Wesentliche reduziert.
 *
 * Kommentare und Typannotationen fallen raus, damit eine Kopie in TypeScript
 * und eine in JavaScript vergleichbar bleiben — der Unterschied zwischen
 * `(roh: string)` und `(roh)` ist keine Drift.
 */
const rumpf = (quelle) => {
  const m = /klassifiziere\s*=?\s*\(?[^)]*\)?[^{]*\{([\s\S]*?)\n\}/.exec(quelle)
  if (!m) return null
  return m[1]
    .replace(/\/\/[^\n]*/g, '')
    .replace(/:\s*'de'\s*\|\s*'en'\s*\|\s*null/g, '')
    // Semikolons fallen weg: der light-planner setzt sie, die beiden anderen
    // nicht. Das ist Hausstil und keine Drift — der Vergleich soll an einer
    // geaenderten BEDINGUNG anschlagen, nicht an einem Zeichensetzungsstil,
    // sonst ist er nach dem ersten Fehlalarm abgeschaltet.
    .replace(/;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const gelesen = KOPIEN.map(({ app, datei }) => {
  let quelle
  try {
    quelle = readFileSync(join(ROOT, datei), 'utf8')
  } catch {
    fehler.push(`${app}: ${datei} fehlt — die Quellsprachen-Messung ist dort nicht vendoriert.`)
    return null
  }
  const de = liste(quelle, 'DEUTSCH')
  const en = liste(quelle, 'ENGLISCH')
  const logik = rumpf(quelle)
  if (!de) fehler.push(`${app}: die Wortliste DEUTSCH wurde nicht gefunden.`)
  if (!en) fehler.push(`${app}: die Wortliste ENGLISCH wurde nicht gefunden.`)
  if (!logik) fehler.push(`${app}: die Funktion klassifiziere wurde nicht gefunden.`)
  return { app, de, en, logik }
}).filter(Boolean)

if (gelesen.length > 1 && fehler.length === 0) {
  const [erste, ...rest] = gelesen
  for (const andere of rest) {
    for (const [name, a, b] of [
      ['DEUTSCH', erste.de, andere.de],
      ['ENGLISCH', erste.en, andere.en],
    ]) {
      const nurHier = a.filter((w) => !b.includes(w))
      const nurDort = b.filter((w) => !a.includes(w))
      if (nurHier.length || nurDort.length) {
        fehler.push(
          `${name} laeuft auseinander: ${erste.app} hat ${nurHier.length ? nurHier.join(', ') : '—'} ` +
            `zusaetzlich, ${andere.app} hat ${nurDort.length ? nurDort.join(', ') : '—'} zusaetzlich.`,
        )
      }
    }
    if (erste.logik !== andere.logik) {
      fehler.push(
        `klassifiziere laeuft auseinander zwischen ${erste.app} und ${andere.app}:\n` +
          `  ${erste.app}: ${erste.logik}\n` +
          `  ${andere.app}: ${andere.logik}`,
      )
    }
  }
}

/**
 * Und die Gegenprobe zum Vergleich selbst: ohne sie wuerde ein kaputtes
 * Muster oben ueberall `null` finden, jeder Vergleich fiele aus, und dieser
 * Lauf meldete Ruhe. Genau die Sorte stiller Abschaltung, gegen die die
 * Wortlisten hier ueberhaupt verglichen werden.
 */
if (fehler.length === 0) {
  if (gelesen.length !== KOPIEN.length) {
    fehler.push(`Nur ${gelesen.length} von ${KOPIEN.length} Kopien gelesen — der Vergleich ist unvollstaendig.`)
  } else if (gelesen[0].de.length < 30 || gelesen[0].en.length < 30) {
    fehler.push(
      `Die Wortlisten sind auffaellig kurz (${gelesen[0].de.length} deutsch, ` +
        `${gelesen[0].en.length} englisch) — entweder wurden sie geleert oder das Muster ist kaputt.`,
    )
  }
}

if (fehler.length) {
  console.error('Quellsprachen-Klassifizierer laufen auseinander:\n')
  for (const f of fehler) console.error(`  ${f}`)
  console.error(
    '\nDie drei Kopien halten dieselbe Zusicherung. Wer eine Wortliste aendert, ' +
      'aendert sie in allen dreien — sonst meldet ein Repo Fehlalarme (und wird ' +
      'abgeschaltet) oder uebersieht, was die anderen finden.',
  )
  process.exit(1)
}

console.log(
  `lang:parity ok — ${gelesen.length} Kopien des Quellsprachen-Klassifizierers sind ` +
    `wortgleich (${gelesen[0].de.length} deutsche, ${gelesen[0].en.length} englische Marker).`,
)
