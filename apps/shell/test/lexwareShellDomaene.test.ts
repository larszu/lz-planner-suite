import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// ───────────────────────────────────────────────────────────────────────────
// LEXWARE ALS EIGENE SHELL-DOMAENE (E-12) — und der Weg, der vorher nie lief.
//
// B-19: Der Beleg lief ueber den eingebetteten Cable-Planer, und dort trafen
// zwei Bedingungen aufeinander, die sich gegenseitig ausschliessen. Die
// Empfangsseite hielt sich heraus, wenn die Seite NICHT eingebettet ist; der
// Handler dahinter brauchte die Preload-Bruecke, die es NUR dann gibt. In
// keiner ausgelieferten Konfiguration entstand ein Beleg.
//
// Die Tests hier halten drei Dinge fest, und alle drei sind Wege, auf denen
// derselbe Defekt zurueckkaeme:
//
//   1. Die alte Bus-Route ist WEG und nicht bloss ungenutzt.
//   2. Es gibt genau EINEN Beleg-Weg — nicht zwei je nach Betriebsart.
//   3. Der Schluessel verlaesst den Hauptprozess nicht.
// ───────────────────────────────────────────────────────────────────────────

const WURZEL = join(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(join(WURZEL, p), 'utf8')

const embed = lies('packages/ui/src/embed.ts')
const uiIndex = lies('packages/ui/src/index.ts')
const preload = lies('apps/shell/electron/preload.cjs')
const mainCjs = lies('apps/shell/electron/main.cjs')
const lexwareCjs = lies('apps/shell/electron/lexware.cjs')
const cableHost = lies('apps/shell/electron/cableHost.cjs')
const bridge = lies('apps/shell/src/embed/lexwareBridge.ts')
const billing = lies('apps/shell/src/shell/BillingModal.tsx')
const plannerMain = lies('apps/cable-planner/src/renderer/main.tsx')

/** Kommentarzeilen weg — sonst liest ein Waechter die Prosa, die erklaert,
 *  was es NICHT mehr gibt. */
const ohneKommentare = (src: string): string =>
  src
    .split('\n')
    .filter((z) => !/^\s*(\/\/|\*|\/\*)/.test(z))
    .join('\n')

describe('Die alte Bus-Route ist entfernt, nicht stillgelegt', () => {
  it('kennt der Bus keine Lexware-Nachricht mehr', () => {
    // Ein Weg, den niemand faehrt, ist einer, den jemand spaeter wieder
    // befaehrt — und dann steht er vor denselben zwei Bedingungen.
    const code = ohneKommentare(embed)
    expect(code).not.toMatch(/avplan:lexware/)
    expect(code).not.toMatch(/requestLexware|connectShellLexware/)
  })

  it('exportiert `@avplan/ui` sie nicht mehr', () => {
    expect(ohneKommentare(uiIndex)).not.toMatch(/Lexware/)
  })

  it('ruft der Planer keinen Lexware-Handler mehr auf', () => {
    expect(plannerMain).not.toMatch(/initShellLexware|shellLexware/)
  })
})

describe('Es gibt genau EINEN Beleg-Weg', () => {
  it('haengt er an der Shell-Bruecke und an keiner Betriebsart', () => {
    // Der alte Weg war an „eingebettet" gebunden und deshalb im Standard-Build
    // tot. `__suiteLexware` steht wie `__suiteTally` und `__suiteProjectFiles`
    // ausserhalb jedes `if`.
    const vorNativem = preload.slice(0, preload.indexOf('if (nativeCable)'))
    expect(vorNativem).toContain("exposeInMainWorld('__suiteLexware'")
  })

  it('registriert der native Host Cables Lexware-IPC NICHT mehr', () => {
    // Sonst gaebe es zwei Wege zu derselben API, und der Nutzer haette je nach
    // Fenster einen anderen unter denselben Knoepfen.
    expect(ohneKommentare(cableHost)).not.toMatch(/lexwareIpc/)
  })

  it('sind alle fuenf Handler im Hauptprozess verdrahtet', () => {
    for (const kanal of ['ping', 'create', 'setKey', 'deleteKey', 'hasKey']) {
      expect(mainCjs).toContain(`suiteHost:lexware:${kanal}`)
      expect(preload).toContain(`suiteHost:lexware:${kanal}`)
    }
  })
})

describe('Der Schluessel verlaesst den Hauptprozess nicht', () => {
  it('gibt kein Handler ihn heraus', () => {
    // `hasKey` meldet die TATSACHE — `!!key`, nicht `key`. Wer hier den Wert
    // in die Antwort legt, schickt ihn durch die Bruecke in den Renderer.
    //
    // GEPRUEFT WIRD DIE HANDLER-FUNKTION, nicht die ganze Datei: `leseKey`
    // gibt den Schluessel selbstverstaendlich zurueck — sie ist der interne
    // Leser, den `ping` und `createDocument` benutzen, und verlaesst dieses
    // Modul nie. Die erste Fassung dieses Waechters suchte `return … key …`
    // im ganzen Quelltext und wurde daran rot.
    const hasKeyBody = lexwareCjs.slice(
      lexwareCjs.indexOf('async function hasKey()'),
      lexwareCjs.indexOf('module.exports'),
    )
    expect(hasKeyBody).toMatch(/return \{ ok: true, vorhanden: !!key \}/)
    expect(hasKeyBody).not.toMatch(/vorhanden: key\b/)
    // Und die Aussenseite: was exportiert wird, sind die fuenf Handler — kein
    // Leser.
    const exportiert = lexwareCjs.slice(lexwareCjs.indexOf('module.exports'))
    expect(exportiert).not.toMatch(/\bleseKey\b/)
  })

  it('kennt die Bruecke kein Lesen des Schluessels', () => {
    // `setzeKey` schickt einen hinein, `hatKey` fragt die Tatsache ab — ein
    // `leseKey`/`getKey` gaebe es nicht zu bauen, ohne ihn herauszugeben.
    expect(preload).not.toMatch(/lexware:getKey|leseKey|holeKey/)
    expect(ohneKommentare(bridge)).not.toMatch(/getKey|leseKey|holeKey/)
  })

  it('liegt er in genau EINEM Eintrag des Schluesselbunds', () => {
    // Zwei Eintraege beantworteten „ist einer hinterlegt?" verschieden, je
    // nachdem wer fragt. Der Name bleibt der historische: ihn umzubenennen
    // liesse jeden schon hinterlegten Schluessel unauffindbar zurueck.
    expect(lexwareCjs).toContain("const KEYTAR_SERVICE = 'cable-planner'")
    expect(lexwareCjs).toContain("const KEYTAR_ACCOUNT = 'lexware-api-key'")
    const treffer = lexwareCjs.match(/keytar\.(get|set|delete)Password\(/g) ?? []
    expect(treffer.length).toBeGreaterThan(0)
    // Jeder Zugriff nimmt dieselben zwei Konstanten.
    const mitKonstanten = lexwareCjs.match(/keytar\.(get|set|delete)Password\(KEYTAR_SERVICE, KEYTAR_ACCOUNT/g) ?? []
    expect(mitKonstanten.length).toBe(treffer.length)
  })
})

describe('Der Dialog nennt die richtige Abhilfe', () => {
  it('unterscheidet fehlende Bruecke von fehlendem Schluessel', () => {
    // Zusammengefasst waere es eine Anleitung, die das Problem nicht loest.
    expect(billing).toContain('billing.needDesktop')
    expect(billing).toContain('billing.needKey')
  })

  it('nennt den Signal-Planer nicht mehr als Voraussetzung', () => {
    // „Signal-Planer oeffnen, um zu senden" war die Anleitung zu einem Weg,
    // den es nicht gab.
    expect(billing).not.toContain('billing.needSignal')
    expect(ohneKommentare(bridge)).not.toMatch(/signalPlannerWindow|needSignal/)
  })

  it('meldet der Nicht-Schluesselbund kein „kein Schluessel"', () => {
    // Drei Zustaende, nicht zwei: `null` heisst „konnte nicht nachsehen", und
    // der Knopf bleibt bedienbar, damit der Grund beim Senden ankommt.
    expect(billing).toMatch(/keyVorhanden !== false/)
  })
})
