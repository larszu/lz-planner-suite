// ───────────────────────────────────────────────────────────────────────────
// bedienbar:check — misst im ECHTEN Browser, ob eine Oberflaeche bedienbar
// ist (suite#231).
//
// DER ANLASS. Nutzer-Meldung zu Lager und Gebaeude: „aktuell ist die Ui so
// schlecht das beide module unbrauchbar sind. baue auf den funktionen die im
// hintergrund schon existieren eine intuitive bedienbare ui die responsive
// ist."
//
// WARUM IM BROWSER UND NICHT AM QUELLTEXT. Die drei Zusagen dieses Laufs
// lassen sich am Quelltext nicht pruefen, weil sie erst beim LAYOUT
// entstehen:
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
//
// Ein Waechter, der dafuer Zeichenketten zaehlt, ist auf allen drei Punkten
// gruen, waehrend die Seite kaputt ist. Das ist der Grund, warum die
// gemeldeten Fehler drei Monate unbemerkt blieben: `chrome:parity` misst das
// MARKUP, `ui:smoke` misst, dass die Suite STARTET. Keiner der beiden sieht
// einen Knopf.
//
// WAS DIESER LAUF NICHT MISST, und zwar ausdruecklich:
//
//   * Die anderen drei Planer. Sie sind heute NICHT bedienbar in diesem Sinn,
//     und das ist gemessen und nicht vermutet (2026-09-13, dieselbe Sonde):
//
//       multicam-planner   13-23 Bedienpunkte unter 32 px; 9 Elemente
//                          ragen bei 390 px aus dem Fenster
//       light-planner      23-26 Bedienpunkte unter 32 px; der Rumpf ist
//                          890 px breit in einem 390-px-Fenster, 44
//                          Elemente ragen hinaus; 1 Feld ohne Namen
//       cable-planner      nicht gemessen — sein `dist/` traegt das
//                          Electron-Layout (`renderer/index.html`) und
//                          nicht die Wurzel, die dieser Lauf bedient
//
//     Sie stehen deshalb nicht in `APPS`. Sie hier einzutragen hiesse, den
//     Lauf rot zu machen fuer etwas, das suite#231 nicht verlangt — und ein
//     Waechter, der auf Vorrat rot ist, wird abgeschaltet. Der Befund steht
//     im Backlog (B-77) und nicht in einem stillen Kommentar.
//
//   * Ob die Oberflaeche VERSTAENDLICH ist. Ein Formular kann jede Zahl
//     dieses Laufs erfuellen und trotzdem die falschen Fragen stellen.
//
//   * Die Darstellung selbst. Der Lauf misst Kanten und Hoehen, keine Farben,
//     keine Schriftgroessen, keinen Kontrast.
//
//   * Was hinter einem Klick liegt, AUSSER den Reitern. Der Lauf klickt jeden
//     Reiter der Leiste an und misst dessen Ansicht — beide Apps fuehren
//     sieben. Ein Dialog, ein aufgeklappter Block, ein Menue: nicht gemessen.
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
 * Die Apps unter dieser Regel — mit dem Ordner, der ihre `index.html` traegt.
 *
 * Nur die beiden aus suite#231. Der Kopf dieser Datei sagt, was mit den
 * anderen dreien ist und warum sie hier nicht stehen.
 */
const APPS = [
  { id: 'inventory-planner', wurzel: 'apps/inventory-planner/dist' },
  { id: 'larszu-facility-planner', wurzel: 'apps/larszu-facility-planner/dist' },
]

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
  }
}

const fehler = []
let geprueft = 0
let bedienpunkteGesamt = 0

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

    // JEDER Reiter, nicht nur der beim Laden offene. Genau dort lag der
    // Unterschied: im Lager hatten vier der sieben Ansichten eigene
    // Stilregeln und drei gar keine — wer nur die erste misst, misst je nach
    // App entweder das Beste oder das Schlechteste und nie beides.
    const reiter = await seite.$$('.reiter')
    const wieviele = Math.max(1, reiter.length)
    if (!reiter.length) {
      fehler.push(`${app.id} bei ${breite} px: keine Reiterleiste gefunden — die Sonde sieht nur eine Ansicht statt sieben`)
    }

    for (let i = 0; i < wieviele; i++) {
      let titel = '(Startansicht)'
      if (reiter.length) {
        // Neu abfragen: der Klick baut den Inhalt neu, und die alten Griffe
        // zeigen danach auf Knoten, die es nicht mehr gibt.
        const knoepfe = await seite.$$('.reiter')
        titel = ((await knoepfe[i].textContent()) ?? '').trim()
        await knoepfe[i].click()
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
  `OK bedienbar: ${APPS.length} App(s), jeder Reiter einzeln, in ${BREITEN.join('/')} px — nichts ragt aus dem Fenster, ` +
    `alle ${bedienpunkteGesamt} gefundenen Bedienpunkte mindestens ${ZIEL} px hoch, jedes Eingabefeld hat einen Namen (${geprueft} Ansichten gemessen).`,
)
console.log(
  'NICHT gemessen: die anderen drei Planer (multicam und light fallen heute durch, cable-planner traegt ein anderes dist-Layout — Zahlen im Kopf dieser Datei, Eintrag B-77), ' +
    'ob die Oberflaeche VERSTAENDLICH ist, Farbe und Kontrast, die Ansichten MIT Daten (dieser Lauf sieht ihren Leerzustand), ' +
    'und alles hinter einem Klick ausser den Reitern — ein Dialog, ein aufgeklappter Block, ein Menue.',
)
