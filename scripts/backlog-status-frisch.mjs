#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Die Kopfzeile eines Backlog-Eintrags sagt dasselbe wie sein Rumpf.
//
// WARUM ES DAS GIBT — und der Beleg steht in der geprueften Datei selbst,
// dreimal. `IMPLEMENTATION_BACKLOG.md` haelt fuer B-4, B-15 und B-52 fest,
// dass ihr `Status:` „offen" sagte, waehrend der Bau laengst auf `main` lag.
// Bei B-4 steht die Lehre ausgeschrieben:
//
//   „Ein Backlog-Eintrag ist eine Behauptung ueber den Code und altert
//    genauso wie eine. Vor dem Abhaken jeden Punkt neu am Code pruefen,
//    nicht am eigenen Text."
//
// Und bei B-10:
//
//   „Ein ‚was offen bleibt', das nach dem Bau der Sache nicht angefasst wird,
//    ist schlimmer als kein Eintrag — er schickt jemanden los, etwas zu
//    bauen, das schon steht."
//
// Dreimal dieselbe Form, dreimal von Hand gefunden, dreimal nachtraeglich.
// Genau dafuer schreibt dieses Repo sonst einen Waechter.
//
// WAS GEPRUEFT WIRD, und was ausdruecklich nicht: NICHT, ob ein Eintrag
// stimmt — das kann kein Skript. Nur, ob er sich SELBST widerspricht: eine
// Kopfzeile, die „offen" sagt, waehrend im selben Eintrag ein „ERLEDIGT" oder
// „GEBAUT" steht. Das ist ein rein textlicher Widerspruch, und er ist immer
// ein Fehler — entweder ist der Bau erledigt und die Kopfzeile veraltet, oder
// der Rumpf behauptet einen Bau, den es nicht gibt.
//
// WAS NICHT ALS WIDERSPRUCH ZAEHLT:
//   • „Status: Kern GEBAUT — der Datei-Import offen" (B-47). Hier steht beides
//     in der KOPFZEILE, die Aussage ist also vollstaendig. Der Lauf sieht nur
//     nach, wenn die Kopfzeile „offen" sagt und das „GEBAUT" erst weiter
//     unten kommt.
//   • Durchgestrichenes: `~~offen~~` ist die uebliche Schreibweise dieser
//     Datei fuer „war offen, ist es nicht mehr". Wird vor dem Messen entfernt.
//     GEMESSEN 2026-09-09: dieser Filter traegt heute NICHTS — entfernt man
//     ihn, bleibt der Lauf gruen, weil kein durchgestrichener Eintrag im
//     Rumpf eine GROSSGESCHRIEBENE Fertig-Marke fuehrt. Er steht trotzdem
//     hier, und das ist der ehrliche Grund: die Form gibt es in der Datei
//     (B-1, B-2, B-3 …), sie kann jederzeit auf einen Rumpf mit „ERLEDIGT"
//     treffen, und dann waere jeder korrekt abgehakte Eintrag ein Fehlalarm.
//     Ein Filter, der heute nichts faengt, ist kein toter Code, wenn er die
//     Form kennt, die morgen kommt — er darf nur nicht als Messwert
//     ausgegeben werden.
//
// WARUM DIE FERTIG-MARKE GROSSGESCHRIEBEN GEPRUEFT WIRD, und das ist kein
// Zufall: „ERLEDIGT" und „GEBAUT" in Versalien sind in dieser Datei die
// Auszeichnung; klein geschrieben kommen dieselben Woerter in der Prosa vor.
// Gegengeprobt mit einer Fassung ohne Gross-/Kleinschreibung: sie schlug auf
// B-11 an, wegen des Satzes „gegen die die Belegkette dieses Repos gebaut
// ist". Ein Waechter, der Prosa fuer eine Marke haelt, ist genau der, den man
// nach dem dritten Fehlalarm abschaltet.
//   • Zitierte Nutzerfragen und Rueckblicke im Rumpf. Sie stehen unterhalb der
//     Kopfzeile und aendern nichts daran, dass die Kopfzeile die Zusammen-
//     fassung ist, die jemand ueberfliegt.
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HIER = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DATEI = resolve(HIER, 'docs', 'IMPLEMENTATION_BACKLOG.md')

/** `~~offen~~` heisst „nicht mehr offen" — vor dem Messen weg damit. */
const ohneDurchgestrichenes = (text) => text.replace(/~~[\s\S]*?~~/g, '')

const OFFEN = /\b(offen|noch nicht gebaut|steht aus)\b/i
const FERTIG = /\b(ERLEDIGT|GEBAUT)\b/

const text = readFileSync(DATEI, 'utf8')
const bloecke = text.split(/\n(?=### )/)
const funde = []
let geprueft = 0

for (const block of bloecke) {
  if (!block.startsWith('### ')) continue
  const titel = block.split('\n', 1)[0].replace(/^###\s*/, '')
  // Die Kopfzeile ist der erste Aufzaehlungspunkt „* **Status:** …" bis zum
  // naechsten Punkt derselben Ebene.
  const m = block.match(/^\* \*\*Status:\*\*([\s\S]*?)(?=\n\* )/m)
  if (!m) continue
  geprueft++
  const status = ohneDurchgestrichenes(m[1])
  const rumpf = ohneDurchgestrichenes(block.slice(m.index + m[0].length))
  if (OFFEN.test(status) && !FERTIG.test(status) && FERTIG.test(rumpf)) {
    const beleg = rumpf.match(new RegExp(`[^\\n]*${FERTIG.source}[^\\n]*`))
    funde.push({ titel, status: status.replace(/\s+/g, ' ').trim().slice(0, 120), beleg: beleg?.[0].trim().slice(0, 120) })
  }
}

console.log(`${geprueft} Backlog-Eintraege mit Status-Zeile geprueft.`)
if (funde.length === 0) {
  console.log('Keine Kopfzeile widerspricht ihrem Rumpf.')
  process.exit(0)
}
console.error(`\n${funde.length} Eintrag/Eintraege sagen oben „offen" und unten „gebaut":\n`)
for (const f of funde) {
  console.error(`  ${f.titel}`)
  console.error(`    Kopfzeile: ${f.status}`)
  console.error(`    im Rumpf:  ${f.beleg}`)
}
console.error(
  '\nEntweder ist der Bau erledigt — dann gehoert das in die KOPFZEILE, weil\n' +
    'sie es ist, die jemand ueberfliegt — oder der Rumpf behauptet einen Bau,\n' +
    'den es nicht gibt. Beides ist ein Fehler, und beide Male schickt der\n' +
    'Eintrag jemanden in die falsche Richtung.',
)
process.exit(1)
