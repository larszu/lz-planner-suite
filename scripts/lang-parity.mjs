// ───────────────────────────────────────────────────────────────────────────
// Ein Klassifizierer fuer die Quellsprache — und der Guard dagegen, dass es
// drei werden (E-17/E-20).
//
// WORUM ES GEHT. Seit dem 2026-09-08 erklaert jedes Repo seine Quellsprache
// (`package.json` -> `avplan.sourceLanguage`) und MISST sie: ein Lauf liest die
// Fallback-Texte, ordnet jeden einer Sprache zu und faellt bei jedem, der in
// der anderen steht. Drei Repos fuehren dafuer denselben Klassifizierer:
//
//   cable-planner      scripts/quellsprache.mjs
//   light-planner      scripts/quellsprache-check.ts
//   multicam-planner   scripts/quellsprache-check.mjs
//
// Die Klammern hinter den drei Zeilen sind am 2026-09-10 weggefallen, und das
// ist kein Aufraeumen: dort stand „(deutsch-quellig)" fuer die ersten beiden
// und „(englisch-quellig)" fuer den dritten. Seit E-28 (2026-09-09) ist die
// Quellsprache KEINE Eigenschaft des einzelnen Repos mehr — alle drei sind
// englisch-quellig. Eine Zeile, die das Gegenteil sagt, ist schlimmer als
// keine: sie liest sich wie eine Zusicherung und bringt den naechsten dazu,
// deutsche Fallbacks fuer richtig zu halten. Wo die Sprache wirklich steht:
// `package.json` -> `avplan.sourceLanguage`, je Repo gemessen.
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
// WAS VERGLICHEN WIRD.
//   1. Die beiden Wortlisten und die Entscheidungslogik von `klassifiziere`.
//   2. Den SPRACHMIX-Teil (B-61/B-63): `fallbackMuster` (der Ausdruck, an dem
//      die Fallbacks ueberhaupt haengen), die vier Muster `SICHTBARE_ATTRIBUTE`,
//      `JSX_TEXT`, `NACH_CODE`, `RUFE`, den Rumpf von `sichtbareTexte`, den
//      Kommentarfilter `ohneKommentare` und den Textknoten-Filter
//      `ohneAusdruecke` — dazu die feste Probe (`PROBE` und die erwartete
//      Ausbeute), an der jede Kopie ihr Muster prueft.
// Alles Zeichen fuer Zeichen, nach dem Entfernen von Kommentaren,
// Typannotationen und Leerraum.
//
// Punkt 2 kam spaeter dazu, und das Fehlen war eine echte Luecke, keine
// theoretische: als der Sprachmix-Zaehler in alle drei Repos wanderte, lief
// er in einem davon mit einem anderen Rumpf und in einem anderen mit einem
// LOCKEREN JSX-Muster, das Quelltext fuer Beschriftung hielt (35 Fehltreffer
// im cable-planner, 12 im light-planner). Der Guard hier sah nichts davon —
// er verglich nur die Wortlisten. Genau die Bauform von Drift, gegen die er
// gebaut ist, lief unter ihm hindurch.
//
// NICHT verglichen wird alles Drumherum: die Repos lesen verschiedene
// Wurzeln, nennen ihre zweite Deklarationsstelle anders (CLAUDE.md,
// README.md), schliessen ihre Woerterbuecher unterschiedlich aus (`i18n/` vs.
// `i18n`) und der multicam-Lauf hat einen eigenen Zweig fuer „hier ist noch
// nichts zu messen". Auch `MIX_GRENZE` steht bewusst nicht hier: sie ist eine
// MESSUNG DES JEWEILIGEN REPOS und darf sich unterscheiden — heute steht sie
// in allen dreien auf 0, aber das ist ein Ergebnis und keine Zusicherung.
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

/**
 * Ein `const NAME = /muster/flags` als Zeichenkette.
 *
 * Das Literal steht in allen drei Kopien auf einer Zeile — mal direkt hinter
 * dem `=`, mal auf der naechsten (Zeilenlaenge, Hausstil). Beide Formen sind
 * hier dasselbe; ein abschliessendes Semikolon faellt weg, weil der
 * light-planner es setzt und die beiden anderen nicht.
 */
const muster = (quelle, name) => {
  const m = new RegExp(`const ${name}\\s*=\\s*\\n?\\s*(/.*)`).exec(quelle)
  return m ? m[1].trim().replace(/;$/, '') : null
}

/**
 * Der Rumpf einer Pfeilfunktion, auf dieselbe Weise normalisiert wie `rumpf`.
 *
 * ZWEI FORMEN, und beide kommen hier vor: `sichtbareTexte` hat einen Block
 * (`=> { … }`), `ohneKommentare` einen Ausdruck (`=> text.replace(…)`). Wer
 * nur die Block-Form kennt, laeuft beim Ausdruck bis zur naechsten
 * schliessenden Klammer irgendwo weiter unten und vergleicht dann halbe
 * Dateien miteinander — genau das ist in der ersten Fassung passiert.
 */
const pfeilRumpf = (quelle, name) => {
  const block = new RegExp(
    `const ${name} = \\([^)]*\\)[^=]*=>\\s*\\{([\\s\\S]*?)\\n\\s*\\}`,
  ).exec(quelle)
  const ausdruck =
    block ?? new RegExp(`const ${name} = \\([^)]*\\)[^=]*=>\\s*([\\s\\S]*?)\\n\\s*\\n`).exec(quelle)
  const m = ausdruck
  if (!m) return null
  return m[1]
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    // Typannotationen: `(quelle: string, jsx: boolean): string[]` und
    // `const raus: string[] = []` sind dieselbe Anweisung wie ohne. Der
    // Unterschied zwischen TypeScript und JavaScript ist keine Drift.
    .replace(/:\s*string\[\]/g, '')
    .replace(/:\s*(?:string|boolean|number)\b/g, '')
    .replace(/;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Die Zeichenketten einer `const NAME = [ … ]`-Liste, in der Reihenfolge, in
 * der sie dort stehen. Anders als `liste` nimmt das auch doppelt
 * angefuehrte Eintraege mit — die Probe enthaelt beides.
 */
const zeilen = (quelle, name) => {
  const m = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\s*\\]`).exec(quelle)
  if (!m) return null
  return [...m[1].matchAll(/(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g)]
    .map((x) => x[1] ?? x[2])
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

  // Der Sprachmix-Teil. Jedes Stueck einzeln, damit die Meldung sagt, WELCHES
  // auseinanderlaeuft — „die Kopien unterscheiden sich" waere eine Meldung,
  // nach der man erst suchen muss.
  const mix = {}
  for (const name of ['SICHTBARE_ATTRIBUTE', 'JSX_TEXT', 'NACH_CODE', 'RUFE']) {
    mix[name] = muster(quelle, name)
    if (!mix[name]) fehler.push(`${app}: das Muster ${name} wurde nicht gefunden.`)
  }
  // `ohneAusdruecke` kam am 2026-09-10 dazu, und das Fehlen war eine Luecke
  // derselben Bauform, gegen die dieser Lauf ueberhaupt gebaut ist: die
  // Funktion entscheidet, WAS von einem Textknoten uebrigbleibt — die
  // Einsetzung heraus, die HTML-Entitaet heraus, ab der ersten offenen
  // Klammer abgeschnitten. Sie steht im Rumpf von `sichtbareTexte` nur als
  // AUFRUF, und ein Aufruf sieht in allen drei Kopien gleich aus, auch wenn
  // die gerufene Funktion in einer davon etwas anderes tut.
  for (const name of ['ohneKommentare', 'sichtbareTexte', 'ohneAusdruecke']) {
    mix[name] = pfeilRumpf(quelle, name)
    if (!mix[name]) fehler.push(`${app}: die Funktion ${name} wurde nicht gefunden.`)
  }
  mix.PROBE = zeilen(quelle, 'PROBE')
  if (!mix.PROBE) fehler.push(`${app}: die Probe PROBE wurde nicht gefunden.`)

  // DAS MUSTER, AN DEM DIE FALLBACKS HAENGEN — und es fehlte hier bis zum
  // 2026-09-09, obwohl es die Messung traegt, gegen die alles andere
  // gehalten wird.
  //
  // Aufgefallen ist die Luecke von der anderen Seite: `fallbackMuster` kannte
  // nur `t(` und `translate(`, nicht `tr(` — den Uebersetzer, den Module
  // ausserhalb von React rufen (`\bt\(` trifft `tr(` nicht, hinter dem `t`
  // steht ein `r`). Sechs deutsche Import-Fehlermeldungen sind so durch die
  // Sprachdrehung E-28 gegangen, waehrend der Zaehler auf 0 blieb: was der
  // Ausdruck nicht sieht, kann er auch nicht falsch nennen.
  //
  // Waere das Muster hier schon verglichen worden, haette der Fehler
  // wenigstens beim Vendorieren als Drift angeschlagen. Jetzt wird er das.
  mix.fallbackMuster = pfeilRumpf(quelle, 'fallbackMuster')
  if (!mix.fallbackMuster) fehler.push(`${app}: die Funktion fallbackMuster wurde nicht gefunden.`)

  return { app, de, en, logik, mix }
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
    for (const name of Object.keys(erste.mix)) {
      const a = erste.mix[name]
      const b = andere.mix[name]
      const gleich = Array.isArray(a)
        ? Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i])
        : a === b
      if (!gleich) {
        fehler.push(
          `${name} laeuft auseinander zwischen ${erste.app} und ${andere.app}:\n` +
            `  ${erste.app}: ${JSON.stringify(a)}\n` +
            `  ${andere.app}: ${JSON.stringify(b)}`,
        )
      }
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
  } else {
    // Dieselbe Gegenprobe fuer den Sprachmix-Teil: ein Extraktor, der eine
    // leere (aber nicht `null`) Zeichenkette liefert, laesst jeden Vergleich
    // trivial bestehen. Drei leere Werte sind untereinander gleich.
    const m = gelesen[0].mix
    if (m.sichtbareTexte.length < 100) {
      fehler.push(
        `Der Rumpf von sichtbareTexte ist auffaellig kurz (${m.sichtbareTexte.length} Zeichen) — ` +
          'der Extraktor greift nicht mehr, und der Vergleich bestaende dann trivial.',
      )
    }
    if (m.PROBE.length < 6) {
      fehler.push(
        `Die Probe hat nur ${m.PROBE.length} Zeilen — sie soll echte Beschriftungen UND ` +
          'die Fehlformen (Kommentar, Quelltext, gewickelter Fallback) enthalten.',
      )
    }
    if (!m.JSX_TEXT.includes('[^\\s=<!>]')) {
      fehler.push(
        `Das JSX-Muster ist ${m.JSX_TEXT} — ohne die Bedingung vor dem \`>\` trifft es auch ` +
          'Vergleichsoperatoren und haelt Quelltext fuer Beschriftung (gemessen: 35 Fehltreffer ' +
          'im cable-planner, 12 im light-planner).',
      )
    }
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
    `wortgleich (${gelesen[0].de.length} deutsche, ${gelesen[0].en.length} englische Marker), ` +
    `und der Sprachmix-Teil ebenfalls (4 Muster, 4 Funktionen, ${gelesen[0].mix.PROBE.length} Probe-Zeilen).`,
)
