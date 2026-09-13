// ───────────────────────────────────────────────────────────────────────────
// Die zwei Bausteine, aus denen jede Eintrage-Stelle dieser App besteht
// (suite#231).
//
// DER BEFUND. Vier der sieben Ansichten trugen eigene, gleichlautende Regeln
// fuer `label` und `.zeile` — `.inventur`, `.eingang`, `.bericht`, `.werte`.
// Die uebrigen drei (`Bestand`, `Ausgabescheine`, `Sub-Hire`) hatten keine,
// und ihre Felder standen deshalb nackt nebeneinander. Was hineingehoerte,
// stand im PLATZHALTER, und der verschwindet beim ersten Zeichen: wer ein
// Formular halb ausgefuellt verlaesst und zurueckkommt, sieht Werte ohne
// Fragen.
//
// Die `aria-label` waren da — jedes Feld trug eines. Das heisst: der Name des
// Feldes war BEKANNT und wurde nur niemandem gezeigt, der sehen kann. Eine
// Oberflaeche, die ihre Beschriftungen ausschliesslich an den Screenreader
// gibt, hat sie nicht vergessen, sondern versteckt.
//
// WARUM ZWEI KOMPONENTEN UND NICHT EINE CSS-KLASSE. `.feld` allein taete es
// fuer das Aussehen. Die beiden hier tragen aber je eine Zusage, die man
// nicht in eine Klasse schreiben kann:
//
//   `Feld`     — die Beschriftung steht IM label-Element, das Feld darin.
//                Damit trifft ein Klick auf das Wort das Feld, und der Name
//                ist fuer Auge und Screenreader derselbe. Ein `aria-label`
//                daneben waere eine zweite Fassung desselben Namens.
//   `Anlegen`  — das Ganze ist ein form-Element. Die Eingabetaste legt an;
//                vorher musste man fuer ein Wort zur Maus greifen.
//
// (Die beiden Elementnamen stehen hier ohne spitze Klammern. `lang:check`
// liest den Text zwischen einem schliessenden und einem oeffnenden Zeichen
// als JSX-Text — ein `<label>` im Kommentar macht die Zeilen danach zu
// vermeintlicher Oberflaeche und meldet sie als deutschen Fallback.)
// ───────────────────────────────────────────────────────────────────────────
import type { ReactNode } from 'react'

interface FeldProps {
  /** Der sichtbare Name. Schon uebersetzt — die Ansicht ruft `t()`. */
  name: string
  /** Schmale Felder (Zahlen, Kuerzel) bekommen eine feste, kleine Breite. */
  schmal?: boolean
  children: ReactNode
}

export function Feld({ name, schmal, children }: FeldProps) {
  return (
    <label className={schmal ? 'feld schmal' : 'feld'}>
      {name}
      {children}
    </label>
  )
}

interface AnlegenProps {
  /** Ueberschrift des Blocks, schon uebersetzt. */
  titel: string
  /**
   * Offen, solange es noch nichts gibt — dann ist Anlegen das Einzige, was zu
   * tun ist. Sobald etwas dasteht, klappt der Block zu: wer die Liste oeffnet,
   * will meist nachsehen und nicht eintragen.
   *
   * `key` erzwingt den Wechsel: `open` ist ein Anfangswert, den React an einem
   * schon gerenderten `<details>` nicht nachzieht.
   */
  leer: boolean
  onAbsenden: () => void
  children: ReactNode
}

export function Anlegen({ titel, leer, onAbsenden, children }: AnlegenProps) {
  return (
    <details className="block" open={leer} key={leer ? 'leer' : 'voll'}>
      <summary>{titel}</summary>
      <form
        className="zeile"
        onSubmit={(e) => {
          e.preventDefault()
          onAbsenden()
        }}
      >
        {children}
      </form>
    </details>
  )
}
