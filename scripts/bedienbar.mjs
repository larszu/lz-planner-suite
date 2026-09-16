// ───────────────────────────────────────────────────────────────────────────
// bedienbar:check — misst im ECHTEN Browser, ob eine Oberflaeche bedienbar
// ist (suite#231).
//
// DER ANLASS. Nutzer-Meldung zu Lager und Gebaeude: „aktuell ist die Ui so
// schlecht das beide module unbrauchbar sind. baue auf den funktionen die im
// hintergrund schon existieren eine intuitive bedienbare ui die responsive
// ist."
//
// WARUM IM BROWSER UND NICHT AM QUELLTEXT. Die Zusagen dieses Laufs lassen
// sich am Quelltext nicht pruefen, weil sie erst beim LAYOUT entstehen:
//
//   * Ob etwas aus dem Fenster ragt, haengt an Polsterung, Kastenmodell und
//     Flex-Schrumpfen zugleich. Der gemessene Ueberlauf im Lager kam aus
//     einem fehlenden `box-sizing: border-box` — im Quelltext steht davon
//     nichts, es ist die ABWESENHEIT einer Regel.
//   * Ob ein Knopf 32 px hoch ist, sagt sein `min-height` nur, solange keine
//     Regel mit mehr Gewicht dazwischenkommt. Genau das war der Fall: eine
//     Klassenregel verlor gegen eine mit zwei Gewichten, und das Mengenfeld
//     lief ueber die halbe Zeile.
//   * Ob ein Feld einen Namen hat, haengt an `<label>`, `aria-label`,
//     `for=`/`id` und daran, welches davon der Browser tatsaechlich
//     zuordnet.
//   * Ob eine Menue-Klappe SICHTBAR ist, haengt daran, ob irgendein Vorfahr
//     sie abschneidet. Beide Regeln sind fuer sich richtig; der Schaden
//     entsteht erst aus ihrem Zusammentreffen. Genau so ging es im
//     `light-planner` (B-77): ein `overflow: hidden`, das die Kopfzeile
//     einzeilig halten sollte, machte aus einer 250 x 505 px grossen
//     Datei-Klappe eine mit 250 x 0 px sichtbarer Flaeche. Vier Menues,
//     kein einziges ging auf — monatelang, und kein Waechter sagte es.
//   * Ob ein Knopf ERREICHBAR ist. Er kann die richtige Groesse haben, im
//     Fenster stehen und trotzdem unter einem anderen Element liegen. Im
//     `light-planner` lag der Ansichts-Umschalter bei 390 px ueber den
//     Menuetiteln: ein Klick auf „File" landete auf dem Umschalter. Nichts
//     ragte dabei hinaus — die Elemente ueberlagerten sich INNERHALB des
//     Fensters, und keine der anderen vier Messungen sieht das.
//
// Ein Waechter, der dafuer Zeichenketten zaehlt, ist auf allen drei Punkten
// gruen, waehrend die Seite kaputt ist. Das ist der Grund, warum die
// gemeldeten Fehler drei Monate unbemerkt blieben: `chrome:parity` misst das
// MARKUP, `ui:smoke` misst, dass die Suite STARTET. Keiner der beiden sieht
// einen Knopf.
//
// WAS DIESER LAUF NICHT MISST, und zwar ausdruecklich:
//
//   * Die vier LAUFZEIT-Module (`tally-pi`, `sony-camera-bridge`,
//     `Broadcast-intercom`, `pi-media-station`). Hier stand, sie haetten
//     „kein statisches dist, sondern je einen eigenen Server". FUER ZWEI VON
//     IHNEN STIMMTE DAS NICHT, und das ist genau die Sorte Begruendung,
//     gegen die dieser Lauf geschrieben ist — eine, die nie nachgesehen hat:
//
//       sony-camera-bridge  packages/web-rcp/dist   eine statische SPA
//       Broadcast-intercom  apps/web/dist           eine statische SPA
//       tally-pi            Flask, serverseitig
//       pi-media-station    Flask, serverseitig
//
//     Der wirkliche Grund ist einfacher: DIE SUITE VENDORIERT SIE NICHT.
//     Sie haengen als Laufzeit-Module an einer Adresse und nicht als
//     `apps/<name>/dist`; dieser Lauf kann nur ausliefern, was im Baum
//     liegt. Die beiden Python-Module muesste man ausserdem STARTEN, und
//     das ist eine andere Sorte Pruefung als diese.
//
//     Die beiden SPAs sind am 2026-09-15 mit genau dieser Sonde gegen ihre
//     eigenen `dist`-Ordner gemessen worden — und beide hatten Befunde
//     (`sony#26`, `intercom#20`). Einen STEHENDEN Waechter haben sie
//     trotzdem nicht; das steht als offene Schuld in B-77 und nicht in
//     einem stillen Kommentar.
//
//   * Die SUITE-SHELL selbst. Gemessen sind die eingebetteten Planer, nicht
//     der Rahmen um sie. Wer den Rahmen misst, braucht einen Lauf, der die
//     Shell startet; dieser hier liefert die `dist/`-Ordner direkt aus und
//     sieht deshalb jede App fuer sich.
//
//     ALLE FUENF BROWSER-PLANER SIND DRIN (Stand 2026-09-13). Drei davon
//     standen hier zeitweise mit einem Vermerk „nicht gemessen" — und ein
//     solcher Vermerk ist immer ein Befund und nie eine Eigenschaft. Was sie
//     vom Lauf trennte, war der Zustand, nicht die Sorte Oberflaeche:
//
//       multicam-planner   22 Bedienpunkte unter 32 px (Zoom: 12 x 12),
//                          9 Elemente ragten bei 390 px hinaus,
//                          1 Feld ohne Namen
//       light-planner      24 Bedienpunkte unter 32 px, 8 Elemente ragten
//                          bis 628 px hinaus, 1 Feld ohne Namen, und jede
//                          Menue-Klappe war 0 px hoch sichtbar
//       cable-planner      sein `dist/` legt die Seite nach
//                          `dist/renderer/index.html` statt in die Wurzel —
//                          das war die ganze Huerde, und sie kostete einen
//                          Eintrag `wurzel: 'apps/cable-planner/dist/renderer'`.
//                          Dahinter lagen zwei Erststart-Dialoge
//                          uebereinander, deren oberer die Klicks des
//                          unteren annahm (cable#864/#865): der Lauf kam an
//                          der App gar nicht vorbei.
//
//   * Ob die Oberflaeche VERSTAENDLICH ist. Ein Formular kann jede Zahl
//     dieses Laufs erfuellen und trotzdem die falschen Fragen stellen.
//
//   * Die Darstellung selbst. Der Lauf misst Kanten und Hoehen, keine Farben,
//     keine Schriftgroessen, keinen Kontrast.
//
//   * Was hinter einem Klick liegt, AUSSER den Reitern und den Menuetiteln.
//     Der Lauf klickt jeden Reiter der Leiste an und misst dessen Ansicht;
//     er oeffnet jeden Menuetitel und misst, dass die Klappe sichtbar ist —
//     aber NICHT, was darin steht. Ein Dialog, ein aufgeklappter Block, ein
//     Untermenue: nicht gemessen.
//
//   * Ob ein Bedienpunkt TUT, was sein Name sagt. Der Lauf klickt, um
//     weiterzukommen, und prueft danach Kanten und Groessen — nicht Wirkung.
//
//   * Die Ansichten MIT Daten. Gemessen wird ein frisches Fenster, also der
//     Leerzustand jeder Ansicht. Dass eine volle Tabelle ebenfalls im Fenster
//     bleibt, ist im Browser von Hand nachgesehen (2026-09-13, fuenf Artikel
//     im Lager und drei Anschlusspunkte im Gebaeude) und steht nicht in
//     diesem Lauf: er muesste dafuer Datensaetze erfinden, und die waeren
//     dann seine und nicht die der App.
// ───────────────────────────────────────────────────────────────────────────
// `playwright-core` und nicht `playwright`: die Suite fuehrt schon das eine
// (`suite-smoke.mjs`), und das zweite brachte denselben Browser ein zweites
// Mal mit. Der Browser kommt aus der Umgebung — in CI aus dem
// Setup-Schritt, hier aus `PLAYWRIGHT_BROWSERS_PATH`.
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { access, readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

/**
 * Die Apps unter dieser Regel.
 *
 * `wurzel`   der Ordner, der ihre `index.html` traegt
 * `reiter`   der Waehler ihrer Ansichts-Leiste — jede Ansicht wird EINZELN
 *            gemessen. Die vier Apps nennen sie verschieden, und das ist
 *            kein Versehen: `.reiter` ist die Leiste aus ADR-007,
 *            `.bc-tabbar button` die Modul-Zeile des MultiCam-Planners,
 *            `.tb-modeswitch button` der 2D/3D/Render-Umschalter des
 *            Light-Planners. Ein gemeinsamer Name waere eine Umbenennung in
 *            fuenf Repos fuer einen Waechter — das waere der Schwanz, der mit
 *            dem Hund wedelt. `null` heisst: diese App hat keine solche
 *            Leiste, ihre eine Ansicht wird einmal gemessen.
 * `wegklicken`  was VOR der Messung weg muss. Drei der fuenf Planer
 *            oeffnen beim ersten Start den Willkommens-Dialog aus
 *            `@avplan/onboarding-core` — ein Schleier ueber der ganzen
 *            Oberflaeche. Eine Sonde, die ihn stehenlaesst, misst NUR IHN:
 *            die Reiter dahinter sieht sie nie, und jeder Klick landet auf
 *            dem Schleier. Der erste Anlauf dieses Laufs tat genau das und
 *            meldete brav „alles gruen" ueber eine App, von der er eine
 *            einzige Ansicht gesehen hatte.
 *
 *            `.avob-x` und nicht `[title="Close"]`: der Titel ist UEBERSETZT.
 *            Im Light-Planner steht dort „Schliessen", und ein Waehler, der
 *            nur auf Englisch trifft, macht den Lauf von der Sprache des
 *            Browsers abhaengig — also von etwas, das mit Bedienbarkeit
 *            nichts zu tun hat.
 *
 *            Nur die VENDORIERTEN Fassungen tragen ihn: die eigenstaendigen
 *            Repos kennen das Paket nicht. Wer diese Sonde dort laufen
 *            laesst, braucht den Eintrag nicht — ein Klick ins Leere kostet
 *            vier Sekunden und meldet nichts.
 *
 * `wurzel` ist beim `cable-planner` `dist/renderer` und nicht `dist`: er
 * baut fuer Electron, und dort ist die Wurzel der Ordner des
 * Renderer-Prozesses. Der Kopf dieser Datei sagt, was ausserhalb
 * dieses Laufs liegt.
 */
const APPS = [
  { id: 'inventory-planner', wurzel: 'apps/inventory-planner/dist', reiter: '.reiter' },
  { id: 'larszu-facility-planner', wurzel: 'apps/larszu-facility-planner/dist', reiter: '.reiter' },
  { id: 'multicam-planner', wurzel: 'apps/multicam-planner/dist', reiter: '.bc-tabbar button', wegklicken: ['.avob-x'] },
  { id: 'light-planner', wurzel: 'apps/light-planner/dist', reiter: '.tb-modeswitch button', wegklicken: ['.avob-x'] },
  {
    id: 'cable-planner',
    // `dist/renderer` und nicht `dist`: diese App ist die einzige mit einem
    // Electron-Bau, und der legt Renderer und Main nebeneinander. Bis B-77
    // stand hier deshalb gar nichts — „sein dist traegt ein anderes Layout"
    // war aber eine Auskunft ueber DIESEN LAUF und keine ueber die App. Ein
    // Ordner tiefer bedient, und sie laeuft.
    wurzel: 'apps/cable-planner/dist/renderer',
    // Diese App fuehrt keine Reiterleiste: sie hat EINE Arbeitsflaeche mit
    // Seitenspalten. Gemessen wird deshalb die eine Ansicht — und das ist
    // hier kein Verlust, sondern die Bauart.
    reiter: null,
    // ZWEI Schleier, zwei Bauarten: der Willkommens-Dialog dieser App ist
    // ihr eigener (`ModalShell`, also `.cp-modal-panel`), die
    // Erste-Schritte-Tour kommt aus `@avplan/onboarding-core` (`.avob-x`).
    // Der Waehler fuer den ersten ist STRUKTURELL und nicht der
    // `aria-label` — der ist uebersetzt, und ein Lauf, der nur auf Englisch
    // trifft, haengt an der Sprache des Browsers statt an der Bedienbarkeit.
    wegklicken: ['.cp-modal-panel .cp-panel-head button', '.avob-x'],
  },
]

/**
 * Menue-Titel und Klappe — in allen vier Apps DIESELBEN zwei Merkmale.
 *
 * Nicht die Klassennamen (`.menue-klappe`, `.tb-dropdown`, eine
 * Tailwind-Kette): die sind je Repo andere. `aria-haspopup="menu"` und
 * `role="menu"` stehen dagegen ueberall, weil sie nicht Gestaltung sind,
 * sondern Bedeutung — und wer sie weglaesst, hat schon dadurch ein Menue
 * gebaut, das ein Screenreader nicht als Menue ansagt.
 */
const MENUE_TITEL = '[aria-haspopup="menu"]'
const MENUE_KLAPPE = '[role="menu"]'

/**
 * Drei Breiten und kein Durchlauf dazwischen: Telefon, Tablet, Schreibtisch.
 * 390 ist die Breite, mit der `cable-planner` seit B-44 rechnet (`mobil:check`).
 */
const BREITEN = [390, 768, 1440]

/** Die Mindesthoehe eines Bedienpunkts. Dieselbe Zahl wie `--ziel` in beiden Apps. */
const ZIEL = 32

const TYP = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

/**
 * Ein Ein-Datei-Server ueber dem gebauten Ordner.
 *
 * `file://` taete es nicht: die Planer laden ihre Baugruppen als ES-Module,
 * und ein Modul von `file://` wird vom Browser als fremde Herkunft abgewiesen.
 * Ein Server ist die kleinere Umstaendlichkeit als ein Browser mit
 * abgeschalteter Herkunftspruefung — der maesse dann etwas anderes als das,
 * was der Nutzer sieht.
 */
const diene = (wurzel) =>
  createServer(async (req, res) => {
    const pfad = decodeURIComponent(req.url.split('?')[0])
    const datei = join(wurzel, normalize(pfad === '/' ? '/index.html' : pfad))
    try {
      const inhalt = await readFile(datei)
      res.writeHead(200, { 'content-type': TYP[extname(datei)] ?? 'application/octet-stream' })
      res.end(inhalt)
    } catch {
      res.writeHead(404)
      res.end()
    }
  })

/**
 * Die Messung im Fenster.
 *
 * Sie laeuft als EINE Funktion im Browser und nicht als drei Aufrufe: jeder
 * Aufruf ueber die Bruecke kostet einen Durchlauf, und drei Durchlaeufe koennen
 * drei verschiedene Zustaende sehen.
 */
const messen = () => {
  const win = window.innerWidth

  /**
   * Ein Element DARF ueber den Rand ragen, wenn ein Vorfahr waagerecht
   * scrollen darf — eine breite Tabelle in ihrem Rahmen, eine Reiterleiste.
   * Ohne diese Unterscheidung meldet der Lauf genau die Loesung als Fehler,
   * die B-44 Teil 3 vorschreibt.
   */
  const imScroller = (el) => {
    for (let a = el.parentElement; a; a = a.parentElement) {
      const o = getComputedStyle(a).overflowX
      if (o === 'auto' || o === 'scroll') return true
    }
    return false
  }

  const raus = []
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (!r.width) continue
    if (r.right > win + 1 && !imScroller(el)) {
      raus.push(`${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]} bis ${Math.round(r.right)} px`)
    }
  }

  const klein = []
  let bedienpunkte = 0
  for (const el of document.querySelectorAll('button, select, input, textarea, summary, [role=button]')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    // Ein Schieberegler ist flach und wird ueber seinen Griff bedient; er
    // faellt unter eine eigene Regel (`slider:check` im light-planner).
    if (el.type === 'range' || el.type === 'checkbox' || el.type === 'radio') continue
    bedienpunkte++
    if (r.height < 32) {
      const wort = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim()
      klein.push(`${el.tagName.toLowerCase()} "${wort.slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`)
    }
  }

  /**
   * VERDECKT: der Knopf ist da, hat die richtige Groesse, steht im Fenster —
   * und ein anderes Element liegt darueber.
   *
   * Gemessen wird mit `elementFromPoint` auf der Mitte: was der Browser dort
   * traefe, wenn jemand klickt. Getroffen werden darf das Element selbst,
   * eines seiner Kinder (ein Sinnbild im Knopf) oder ein Vorfahr (ein
   * `label`, das das Feld umschliesst) — alles andere liegt dazwischen.
   *
   * DER ANLASS: im `light-planner` lag der Ansichts-Umschalter bei 390 px
   * ueber den fuenf Menuetiteln. Nichts ragte hinaus, nichts war zu klein,
   * jedes Feld hatte einen Namen — und ein Klick auf „File" landete auf dem
   * Umschalter. Die vier anderen Messungen dieses Laufs waren alle gruen.
   *
   * AUSGENOMMEN ist, was schlicht WEGGEROLLT ist: liegt die Mitte ausserhalb
   * des Fensters oder ausserhalb eines rollenden Vorfahren, ist der Knopf
   * nicht verdeckt, sondern eine Rollbewegung entfernt. Genau das ist die
   * Loesung, die B-44 Teil 3 vorschreibt; sie hier zu melden hiesse, die
   * Abhilfe als Fehler zu zaehlen.
   */
  const sichtbarAmPunkt = (el) => {
    const r = el.getBoundingClientRect()
    const x = Math.round(r.left + r.width / 2)
    const y = Math.round(r.top + r.height / 2)
    if (x < 0 || y < 0 || x >= win || y >= window.innerHeight) return true
    for (let a = el.parentElement; a; a = a.parentElement) {
      const o = getComputedStyle(a)
      if (o.overflowX === 'visible' && o.overflowY === 'visible') continue
      const ar = a.getBoundingClientRect()
      if (x < ar.left || x > ar.right || y < ar.top || y > ar.bottom) return true
    }
    const treffer = document.elementFromPoint(x, y)
    if (!treffer) return true
    return el.contains(treffer) || treffer.contains(el)
  }

  const verdeckt = []
  for (const el of document.querySelectorAll('button, select, input, textarea, summary, [role=button]')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    if (el.type === 'hidden') continue
    if (!sichtbarAmPunkt(el)) {
      const wort = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim()
      verdeckt.push(`${el.tagName.toLowerCase()} "${wort.slice(0, 24)}"`)
    }
  }

  const ohneNamen = []
  for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const name =
      el.closest('label') ||
      el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby') ||
      (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))
    if (!name) ohneNamen.push(`${el.tagName.toLowerCase()} "${el.getAttribute('placeholder') ?? ''}"`)
  }

  return {
    rumpf: document.documentElement.scrollWidth,
    fenster: win,
    raus: [...new Set(raus)],
    klein,
    bedienpunkte,
    ohneNamen,
    verdeckt: [...new Set(verdeckt)],
  }
}

/**
 * Die Sichtbarkeit EINES Elements, gegen alles was es abschneiden koennte.
 *
 * Laeuft im Fenster und bekommt den Waehler herein, weil die Klappe erst nach
 * dem Klick existiert.
 *
 * `position: fixed` ist der Sonderfall, und zwar der wichtige: so ein Element
 * wird vom Ueberlauf seiner Vorfahren NICHT beschnitten (nur von einem
 * transformierten Vorfahren, den keine der vier Apps hat). Wer das mitzaehlt,
 * meldet eine offene Klappe als 0 px hoch — beim ersten Anlauf dieses Laufs
 * genau so passiert, und das waere ein Fehlalarm gewesen, der die echte
 * Messung in Verruf bringt.
 */
const klappenMass = (wahl) => {
  const el = document.querySelector(wahl)
  if (!el) return { fehlt: true }
  const b = el.getBoundingClientRect()
  const o = { top: b.top, bottom: b.bottom, left: b.left, right: b.right }
  if (getComputedStyle(el).position !== 'fixed') {
    for (let a = el.parentElement; a; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
      const ar = a.getBoundingClientRect()
      o.top = Math.max(o.top, ar.top)
      o.bottom = Math.min(o.bottom, ar.bottom)
      o.left = Math.max(o.left, ar.left)
      o.right = Math.min(o.right, ar.right)
    }
  }
  o.top = Math.max(o.top, 0)
  o.left = Math.max(o.left, 0)
  o.bottom = Math.min(o.bottom, window.innerHeight)
  o.right = Math.min(o.right, window.innerWidth)
  return {
    voll: { w: Math.round(b.width), h: Math.round(b.height) },
    sichtbar: { w: Math.round(Math.max(0, o.right - o.left)), h: Math.round(Math.max(0, o.bottom - o.top)) },
    fenster: { w: window.innerWidth, h: window.innerHeight },
  }
}

/**
 * Warum ein Klick nicht durchkam — und die Antwort NICHT geraten.
 *
 * Playwright meldet beides als Zeitueberschreitung, aber es sind zwei
 * verschiedene Befunde, und nur einer davon ist ein Bedienbarkeits-Fehler:
 *
 *   * „intercepts pointer events" heisst, ein anderes Element liegt darueber.
 *     Der Knopf ist da, und ein Klick darauf trifft etwas anderes.
 *   * Bleibt der Lauf dagegen bei „performing click action" stehen, kam der
 *     Klick AN und die App rechnet. Genau das tut der Render-Umschalter des
 *     Light-Planners: er baut eine fotorealistische Szene auf, und das
 *     dauert laenger als drei Sekunden.
 *
 * Der erste Anlauf schrieb beides als „etwas liegt darueber" — eine
 * Behauptung, die im zweiten Fall schlicht falsch ist. Ein Waechter, der die
 * Ursache raet, schickt den naechsten auf die Suche nach einem Element, das
 * es nicht gibt.
 */
const klickGrund = (e) => {
  const text = String(e)
  if (text.includes('intercepts pointer events')) {
    const wer = text.split('\n').find((l) => l.includes('intercepts pointer events'))
    return `etwas liegt darueber — ${(wer ?? '').trim().replace(/^-\s*/, '').slice(0, 120)}`
  }
  if (text.includes('performing click action')) return 'der Klick kam an, aber die App kam nicht zurueck'
  return text.split('\n')[0].slice(0, 120)
}

/**
 * Wie lange ein Klick dauern DARF.
 *
 * 15 Sekunden und nicht drei: eine Ansicht, die eine 3D-Szene aufbaut,
 * braucht laenger als eine, die eine Tabelle zeichnet. Das ist eine Frage der
 * Rechenzeit und keine der Bedienbarkeit — dieser Lauf misst Kanten, Groessen
 * und Erreichbarkeit, nicht Geschwindigkeit. Wer hier Geschwindigkeit messen
 * will, braucht eine eigene Zahl und eine eigene Begruendung.
 */
const KLICK_GEDULD = 15000

const fehler = []
let geprueft = 0
let bedienpunkteGesamt = 0
let klappenGesamt = 0

/**
 * Einen Browser finden, ohne einen mitzuliefern.
 *
 * `playwright-core` laedt bewusst keinen herunter (deshalb heisst es `-core`).
 * Dieselbe Suche wie in `cable-planner/scripts/mobil-grenze-check.mjs` — eine
 * zweite, andere Reihenfolge waere derselbe Zweck mit zwei Antworten.
 *
 * Und wenn nichts gefunden wird, sagt der Lauf WELCHE Pfade er abgesucht hat:
 * ein blosses „Browser nicht gefunden" schickt den naechsten auf die Suche.
 */
const browserPfad = async () => {
  const kandidaten = []
  if (process.env.AV_CHROMIUM) kandidaten.push(process.env.AV_CHROMIUM)
  try {
    const eigen = await chromium.executablePath()
    if (eigen) kandidaten.push(eigen)
  } catch {
    /* playwright-core ohne abgelegten Browser — dann eben die Systempfade */
  }
  // Playwright legt seine Browser versioniert ab (`chromium-1194/...`). Die
  // Nummer steht nirgends fest; sie wird deshalb gesucht und nicht geraten.
  const ablage = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers'
  try {
    for (const e of await readdir(ablage)) {
      if (e.startsWith('chromium-')) kandidaten.push(join(ablage, e, 'chrome-linux', 'chrome'))
    }
  } catch {
    /* keine Ablage — dann eben die Systempfade */
  }
  kandidaten.push(
    '/opt/pw-browsers/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  )
  for (const k of kandidaten) {
    try {
      await access(k)
      return k
    } catch {
      /* weiter */
    }
  }
  console.error(
    'FEHLER: kein Chromium gefunden. Abgesucht:\n' +
      kandidaten.map((k) => `  · ${k}`).join('\n') +
      '\nEinen Pfad in AV_CHROMIUM setzen oder einen Browser installieren.',
  )
  process.exit(1)
}

const browser = await chromium.launch({ executablePath: await browserPfad(), args: ['--no-sandbox'] })

for (const app of APPS) {
  const wurzel = resolve(process.cwd(), app.wurzel)
  if (!existsSync(join(wurzel, 'index.html'))) {
    fehler.push(`${app.id}: ${app.wurzel}/index.html fehlt — vorher \`npm run build:planners\``)
    continue
  }
  const server = diene(wurzel)
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const port = server.address().port

  for (const breite of BREITEN) {
    const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } })
    const seite = await ctx.newPage()
    const abstuerze = []
    seite.on('pageerror', (e) => abstuerze.push(String(e).slice(0, 120)))
    await seite.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' })
    await seite.waitForTimeout(400)

    // Erst wegraeumen, was ueber allem liegt — sonst misst der Lauf den
    // Schleier und nicht die App (siehe `wegklicken` oben).
    //
    // SOLANGE einer da ist, nicht einmal: der Willkommens-Dialog fuehrt zu
    // einer Erste-Schritte-Tour, und die ist ein ZWEITER Schleier mit
    // derselben Klasse. Ein einzelner Klick raeumte den ersten weg und
    // meldete danach dreissig Mal „der Titel liess sich nicht anklicken" —
    // richtig gemessen, falsch verstanden. Die Obergrenze verhindert eine
    // Endlosschleife, falls ein Dialog sich selbst neu oeffnet.
    // WEGRAEUMEN, SOLANGE ETWAS DA IST — und zwar rundenweise ueber ALLE
    // Waehler, nicht einer nach dem anderen.
    //
    // Die Schleier kommen nacheinander und nicht gleichzeitig: der
    // Willkommens-Dialog schliesst, und ERST DANN haengt die
    // Erste-Schritte-Tour sich ein. Wer je Waehler einmal durchlaeuft, sucht
    // die Tour, waehrend sie noch nicht da ist, findet nichts, geht weiter —
    // und stolpert danach ueber sie. Genau das ist hier passiert: sieben
    // Menuetitel, alle „etwas liegt darueber", alle derselbe `.avob-overlay`.
    //
    // Die Obergrenze verhindert eine Endlosschleife, falls ein Dialog sich
    // selbst neu oeffnet.
    for (let runde = 0; runde < 6; runde++) {
      let getan = false
      for (const wahl of app.wegklicken ?? []) {
        if (!(await seite.$(wahl))) continue
        // ERST MESSEN, DANN WEGRAEUMEN (B-77).
        //
        // Der Willkommens-Dialog ist der ERSTE Bildschirm, den ein neuer
        // Nutzer sieht — und der Lauf klickte ihn weg, ohne ihn je
        // anzusehen. Gemessen, als er einmal hinsah: der Schliessen-Knopf
        // war 21 x 23 px gross, der kleinste Bedienpunkt der ganzen Suite.
        //
        // Ein Waechter, der sein Messobjekt beiseiteraeumt, um an das
        // dahinter zu kommen, ist auf dem Beiseitegeraeumten blind.
        const d = await seite.evaluate(messen)
        geprueft++
        bedienpunkteGesamt += d.bedienpunkte
        const wo = `${app.id} · Startbildschirm (${runde + 1}.) bei ${breite} px`
        if (d.klein.length) {
          fehler.push(`${wo}: ${d.klein.length} Bedienpunkt(e) unter ${ZIEL} px — ${d.klein.slice(0, 3).join(' · ')}`)
        }
        if (d.raus.length) {
          fehler.push(`${wo}: ${d.raus.length} Element(e) ragen hinaus, ohne in einem Scrollbereich zu stehen — ${d.raus.slice(0, 3).join(' · ')}`)
        }
        if (d.ohneNamen.length) {
          fehler.push(`${wo}: ${d.ohneNamen.length} Eingabefeld(er) ohne Namen — ${d.ohneNamen.slice(0, 3).join(' · ')}`)
        }
        let grund = null
        await seite.click(wahl, { timeout: KLICK_GEDULD }).catch((e) => { grund = klickGrund(e) })
        if (grund) {
          fehler.push(`${app.id} bei ${breite} px: ${wahl} liess sich nicht anklicken — ${grund}; der Startbildschirm bleibt stehen und verdeckt die Messung`)
        }
        getan = true
        await seite.waitForTimeout(400)
      }
      if (!getan) break
      // Nach der letzten Schliessung noch einmal Luft holen: der naechste
      // Dialog haengt sich erst im folgenden Durchlauf ein.
      await seite.waitForTimeout(300)
    }
    for (const wahl of app.wegklicken ?? []) {
      if (await seite.$(wahl)) {
        fehler.push(`${app.id} bei ${breite} px: nach sechs Runden liegt immer noch ein Schleier ueber der App (${wahl})`)
      }
    }

    // ── Die Menue-Klappen, EINMAL je Breite ────────────────────────────────
    //
    // Sie haengen an der Kopfzeile und nicht an der Ansicht; sie je Reiter
    // erneut zu oeffnen kostet Zeit und misst dasselbe.
    const menueTitel = await seite.$$(MENUE_TITEL)
    for (let i = 0; i < menueTitel.length; i++) {
      const frisch = await seite.$$(MENUE_TITEL)
      if (!frisch[i]) continue
      const name = ((await frisch[i].textContent()) ?? '').trim() || `#${i}`
      let grund = null
      await frisch[i].click({ timeout: KLICK_GEDULD }).catch((e) => { grund = klickGrund(e) })
      if (grund) {
        fehler.push(`${app.id} · Menue „${name}" bei ${breite} px: der Titel liess sich nicht anklicken — ${grund}`)
        continue
      }
      await seite.waitForTimeout(200)
      const k = await seite.evaluate(klappenMass, MENUE_KLAPPE)
      if (k.fehlt) {
        fehler.push(`${app.id} · Menue „${name}" bei ${breite} px: der Klick oeffnet keine Klappe`)
      } else {
        // Das Fenster DARF deckeln — ein Vorfahr nicht. Deshalb wird gegen
        // das Kleinere von beidem geprueft und nicht gegen die volle Groesse.
        const sollH = Math.min(k.voll.h, k.fenster.h)
        const sollW = Math.min(k.voll.w, k.fenster.w)
        if (k.sichtbar.h < sollH - 2 || k.sichtbar.w < sollW - 2) {
          fehler.push(
            `${app.id} · Menue „${name}" bei ${breite} px: die Klappe ist ${k.voll.w}x${k.voll.h} px gross, ` +
              `davon sichtbar ${k.sichtbar.w}x${k.sichtbar.h} px — ein Vorfahr schneidet sie ab`,
          )
        }
      }
      klappenGesamt++
      await seite.keyboard.press('Escape')
      await seite.waitForTimeout(150)
    }

    // JEDER Reiter, nicht nur der beim Laden offene. Genau dort lag der
    // Unterschied: im Lager hatten vier der sieben Ansichten eigene
    // Stilregeln und drei gar keine — wer nur die erste misst, misst je nach
    // App entweder das Beste oder das Schlechteste und nie beides.
    const reiter = app.reiter ? await seite.$$(app.reiter) : []
    const wieviele = Math.max(1, reiter.length)
    // `reiter: null` heisst „diese App hat keine" und ist eine ANGABE, kein
    // Versehen. Fehlt die Leiste dagegen, obwohl ein Waehler dasteht, hat
    // sich etwas geaendert und der Lauf misst eine Ansicht statt aller —
    // das ist ein Befund.
    if (app.reiter && !reiter.length) {
      fehler.push(`${app.id} bei ${breite} px: keine Ansichts-Leiste gefunden (${app.reiter}) — die Sonde sieht eine Ansicht statt aller`)
    }

    for (let i = 0; i < wieviele; i++) {
      let titel = '(Startansicht)'
      if (reiter.length) {
        // Neu abfragen: der Klick baut den Inhalt neu, und die alten Griffe
        // zeigen danach auf Knoten, die es nicht mehr gibt.
        const knoepfe = await seite.$$(app.reiter)
        if (!knoepfe[i]) continue
        titel = ((await knoepfe[i].textContent()) ?? (await knoepfe[i].getAttribute('aria-label')) ?? `#${i}`).trim() || `#${i}`
        let grund = null
        await knoepfe[i].click({ timeout: KLICK_GEDULD }).catch((e) => { grund = klickGrund(e) })
        if (grund) {
          fehler.push(`${app.id} · Ansicht „${titel}" bei ${breite} px: der Reiter liess sich nicht anklicken — ${grund}`)
          continue
        }
        await seite.waitForTimeout(250)
      }
      const m = await seite.evaluate(messen)
      geprueft++
      bedienpunkteGesamt += m.bedienpunkte
      const wo = `${app.id} · ${titel} bei ${breite} px`

      if (!m.bedienpunkte) fehler.push(`${wo}: kein einziger Bedienpunkt gefunden — die Sonde greift ins Leere`)
      if (m.rumpf > m.fenster + 1) {
        fehler.push(`${wo}: die Seite ist ${m.rumpf} px breit und laesst sich seitlich schieben`)
      }
      if (m.raus.length) {
        fehler.push(`${wo}: ${m.raus.length} Element(e) ragen hinaus, ohne in einem Scrollbereich zu stehen — ${m.raus.slice(0, 3).join(' · ')}`)
      }
      if (m.klein.length) {
        fehler.push(`${wo}: ${m.klein.length} Bedienpunkt(e) unter ${ZIEL} px — ${m.klein.slice(0, 3).join(' · ')}`)
      }
      if (m.ohneNamen.length) {
        fehler.push(`${wo}: ${m.ohneNamen.length} Eingabefeld(er) ohne Namen — ${m.ohneNamen.slice(0, 3).join(' · ')}`)
      }
      if (m.verdeckt.length) {
        fehler.push(`${wo}: ${m.verdeckt.length} Bedienpunkt(e) liegen unter einem anderen Element — ${m.verdeckt.slice(0, 3).join(' · ')}`)
      }
    }
    if (abstuerze.length) fehler.push(`${app.id} bei ${breite} px: die Seite wirft — ${abstuerze[0]}`)
    await ctx.close()
  }
  server.close()
}

await browser.close()

if (fehler.length) {
  console.error('bedienbar:check ROT')
  for (const f of fehler) console.error('  - ' + f)
  process.exit(1)
}

console.log(
  `OK bedienbar: ${APPS.length} App(s), jede Ansicht einzeln, in ${BREITEN.join('/')} px — nichts ragt aus dem Fenster, ` +
    `alle ${bedienpunkteGesamt} gefundenen Bedienpunkte mindestens ${ZIEL} px hoch und keiner davon unter einem anderen Element, ` +
    `jedes Eingabefeld hat einen Namen, und alle ${klappenGesamt} Menue-Klappen gehen sichtbar auf (${geprueft} Ansichten gemessen).`,
)
console.log(
  'NICHT gemessen: die vier Laufzeit-Module — die Suite VENDORIERT sie nicht, sie haengen an einer Adresse, ' +
    'und dieser Lauf kann nur ausliefern, was im Baum liegt. sony-camera-bridge und Broadcast-intercom bauen ' +
    'sehr wohl ein statisches dist und sind am 2026-09-15 in ihren eigenen Repos gemessen worden (B-77); ' +
    'tally-pi und pi-media-station rendern serverseitig (Flask) und muessten dafuer gestartet werden. ' +
    'Die Suite-Shell selbst (dieser Lauf misst die eingebetteten Planer, nicht den Rahmen um sie); ' +
    'ob die Oberflaeche VERSTAENDLICH ist, ob ein Bedienpunkt TUT was sein Name sagt, Farbe und Kontrast, ' +
    'die Ansichten MIT Daten (dieser Lauf sieht ihren Leerzustand), und was IN einer Klappe steht — ' +
    'gemessen ist, dass sie aufgeht und sichtbar ist, nicht ihr Inhalt.',
)
