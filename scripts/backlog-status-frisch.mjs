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

// „blockiert" gehoert dazu, und der Beleg ist B-60 (gefunden 2026-09-10).
// Seine Kopfzeile sagte „Bau blockiert", waehrend im Rumpf desselben Eintrags
// „**Erledigt am 2026-09-09**" stand — beide Repos waren laengst angelegt.
// Fuer den, der die Statuszeile ueberfliegt, ist „blockiert" dieselbe Aussage
// wie „offen", nur staerker: fang gar nicht erst an. Dass der Waechter das
// Wort nicht kannte, war der Unterschied zwischen einem Eintrag, den man
// abhakt, und einem, der ein Jahr lang jemanden abschreckt.
const OFFEN = /\b(offen|noch nicht gebaut|steht aus|blockiert|geblockt)\b/i

// Die Fertig-Marke im RUMPF: Versalien wie bisher, dazu die fett gesetzte
// Form „**Erledigt" / „**Gebaut". Auch die ist eine Auszeichnung und keine
// Prosa — sie steht am Anfang eines Aufzaehlungspunkts, nicht mitten im Satz.
// Genau in dieser Form stand B-60s Widerspruch, und die reine Versalien-
// Fassung sah ihn nicht.
const FERTIG = /\b(ERLEDIGT|GEBAUT)\b|\*\*(Erledigt|Gebaut)\b/

// In der KOPFZEILE zaehlt „erledigt" oder „gebaut" in JEDER Schreibweise als
// „hier steht schon, dass es fertig ist" — und das ist ausdruecklich nur eine
// ENTSCHULDIGUNG, nie ein Grund zu melden.
//
// Der Unterschied ist der ganze Punkt. Der Kopf dieser Datei erklaert, warum
// die Fertig-Marke sonst nur in Versalien geprueft wird: eine
// gross-/kleinschreibungsblinde Fassung schlug auf B-11s Prosa an („gegen die
// die Belegkette dieses Repos gebaut ist"), und ein Waechter mit Fehlalarmen
// wird abgeschaltet. Hier kann dasselbe Wort keinen Fehlalarm ausloesen,
// sondern hoechstens einen Fund UNTERDRUECKEN — die harmlosere Richtung.
//
// UND NUR IM ERSTEN SATZ, nicht irgendwo in der Kopfzeile. Der Unterschied
// ist beim Bauen aufgefallen und war kein Detail: die erste Fassung suchte
// im ganzen Status-Absatz, und ausgerechnet B-60 — der Eintrag, dessen
// Widerspruch dieser Waechter finden sollte — entkam damit, weil sein
// Absatz weiter unten den Satz „waehrend im Rumpf ... ‚Erledigt am ...'
// stand" fuehrt. Ein Eintrag, der seinen eigenen Fehler beschreibt, machte
// die Pruefung auf sich selbst blind.
//
// Der erste Satz IST das Urteil; alles danach ist Begruendung. Gemessen
// 2026-09-10 ueber 63 Eintraege: kein Fehlalarm.
//
// Was es kostet, steht ehrlich hier: eine Kopfzeile, deren erster Satz das
// Wort „gebaut" nur in Prosa fuehrt, entkommt der Pruefung. Ohne diese
// Einschraenkung meldete der Lauf dagegen B-39 falsch, dessen Kopf
// „erledigt 2026-09-09 — alle fuenf Punkte" sagt.
const KOPF_FERTIG = /\b(erledigt|gebaut)\b/i

/** Der erste Satz einer Kopfzeile — das Urteil, ohne die Begruendung. */
const ersterSatz = (t) => {
  const s = t.trim()
  const m = s.match(/\.(\s|$)/)
  return m ? s.slice(0, m.index + 1) : s
}

const text = readFileSync(DATEI, 'utf8')
const bloecke = text.split(/\n(?=### )/)
const funde = []
const ohneStatus = []
let geprueft = 0
let eintraege = 0

for (const block of bloecke) {
  if (!block.startsWith('### ')) continue
  eintraege++
  const titel = block.split('\n', 1)[0].replace(/^###\s*/, '')
  // Die Kopfzeile ist der erste Aufzaehlungspunkt „* **Status: …" bis zum
  // naechsten Punkt derselben Ebene.
  //
  // ZWEI SCHREIBWEISEN, und die zweite hat den Waechter blind gemacht
  // (gemessen 2026-09-10):
  //
  //     * **Status:** offen — …        die urspruengliche Form
  //     * **Status: ERLEDIGT.** …      das Urteil steht MIT im Fettdruck
  //
  // Die alte Fassung verlangte das schliessende `**` unmittelbar hinter
  // `Status:` und uebersprang die zweite Form STILL. Drei von 63 Eintraegen
  // (B-42, B-60, B-65) fielen so heraus, und der Lauf meldete zufrieden „60
  // geprueft" — eine Zahl, die niemand nachrechnet, weil niemand weiss, dass
  // es 63 sein muessten. Ausgerechnet B-60 war der Eintrag, dessen
  // Widerspruch dieser Waechter finden sollte.
  const m = block.match(/^\* \*\*Status:(?:\*\*)?([\s\S]*?)(?=\n\* )/m)
  if (!m) {
    ohneStatus.push(titel)
    continue
  }
  geprueft++
  const status = ohneDurchgestrichenes(m[1])
  const rumpf = ohneDurchgestrichenes(block.slice(m.index + m[0].length))
  if (OFFEN.test(status) && !KOPF_FERTIG.test(ersterSatz(status)) && FERTIG.test(rumpf)) {
    const beleg = rumpf.match(new RegExp(`[^\\n]*${FERTIG.source}[^\\n]*`))
    funde.push({ titel, status: status.replace(/\s+/g, ' ').trim().slice(0, 120), beleg: beleg?.[0].trim().slice(0, 120) })
  }
}

console.log(`${geprueft} von ${eintraege} Backlog-Eintraegen geprueft.`)

// SELBSTPROBE: jeder Eintrag hat eine Status-Zeile, und dieser Lauf hat sie
// gesehen. Ohne sie ist „60 geprueft" eine Zahl ohne Nenner — und genau so
// hat dieser Waechter drei Eintraege lang nichts gemerkt. Ein uebersprungener
// Eintrag ist kein kleinerer Messbereich, sondern ein blinder Fleck, der
// aussieht wie ein gruener Lauf.
if (ohneStatus.length > 0) {
  console.error(
    `\n${ohneStatus.length} Eintrag/Eintraege ohne erkennbare Status-Zeile:\n`,
  )
  for (const t of ohneStatus) console.error(`  ${t}`)
  console.error(
    '\nEntweder fehlt die Zeile — dann gehoert sie hin, denn sie ist das, was\n' +
      'jemand ueberfliegt — oder sie ist anders geschrieben, als dieser Lauf\n' +
      'sie kennt. Im zweiten Fall ist der Waechter zu eng und nicht der\n' +
      'Eintrag zu frei: er hat schon einmal drei Eintraege still uebersprungen.',
  )
  process.exit(1)
}

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
