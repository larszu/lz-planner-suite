/**
 * Headless-Smoke-Test der gebauten Suite-App.
 *
 * WARUM ES DAS GIBT. Die Release-Fehler dieser Woche waren alle vom Typ
 * „gebaut, aber nicht ausgeliefert" -- und gefunden wurden sie erst am Tag,
 * weil zwischen `npm run build` und dem Installer nichts die App je gestartet
 * hat. `cable-planner` hat dafuer `ui:smoke`; die Suite hatte nichts.
 *
 * WAS ER PRUEFT, und zwar an der laufenden App statt an der Konfiguration:
 *
 *  1. Das Fenster oeffnet und der Shell-Renderer laedt.
 *  2. Jedes `planner-*://`-Protokoll liefert wirklich Inhalt. Das ist der
 *     Mechanismus, der die entpackten Dateien braucht: `main.cjs` holt sie
 *     ueber `net.fetch(pathToFileURL(...))`, und das liest NICHT aus einem
 *     ASAR. Wer `asarUnpack` verkleinert, bekommt einen gruenen Build und
 *     genau hier ein 404.
 *  3. Mit `SUITE_NATIVE_CABLE=1`: dass Cables IPC-Module tatsaechlich
 *     registrieren. `registerCableIpc` faengt pro Modul ab -- ein fehlendes
 *     Paket ist dort eine Zeile im Log und sonst nichts. Dieser Lauf liest das
 *     Log mit und macht daraus einen Fehlschlag.
 *
 *  4. Die tatsaechlichen Aufrufe -- und das ist der Punkt: die Registrierung
 *     allein beweist nicht, dass die Pakete aus #90 da sind. Die beiden
 *     verhalten sich naemlich verschieden, nachgemessen statt angenommen:
 *
 *       `@avplan/lexware-core` haengt an einem statischen Import in
 *       `lexwareService.js` -- fehlt es, meldet sich `lexwareIpc.js` schon
 *       beim Registrieren. Punkt 3 faengt das.
 *
 *       `ws` NICHT: `signalingServer.js:133` macht `require('ws')` erst beim
 *       Start des Relays. Gegengeprobt -- mit entferntem `ws` registrieren
 *       alle zwoelf Module klaglos, und der Fehler faellt erst beim Klick auf
 *       „Zusammenarbeit starten". Punkt 3 sieht ihn nicht.
 *
 *     Der Lauf ruft deshalb `signaling:start` und `lexware:ping` ueber die
 *     echte Cable-View auf -- derselbe Weg wie beim Nutzer -- und
 *     unterscheidet „Modul fehlt" von einem fachlichen Fehler (kein API-Key
 *     ist kein Verpackungsfehler).
 *
 * WAS ER NICHT PRUEFT: das Paket. Er startet die App aus dem Arbeitsverzeichnis,
 * nicht aus dem Installer -- der macOS-Universal-Build braucht einen
 * mac-Runner. Er sagt also „die App und ihre Verdrahtung funktionieren", nicht
 * „das DMG funktioniert".
 *
 * Lauf: `xvfb-run -a node scripts/suite-smoke.mjs` (Linux/headless).
 * Voraussetzung: `npm run build:packages && npm run build --workspace
 * @avplan/shell && npm run build:planners`.
 */
import { _electron as electron } from 'playwright-core'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SHELL = join(ROOT, 'apps', 'shell')
const OUT = process.env.SUITE_SHOTS || join(tmpdir(), 'av-planner-suite-shots')
mkdirSync(OUT, { recursive: true })

const maengel = []
const melde = (zeile) => console.log(`  ${zeile}`)

/** Ein Durchlauf; `nativ` schaltet den experimentellen Cable-Host zu. */
async function lauf(nativ) {
  const marke = nativ ? 'nativ' : 'default'
  console.log(`\n--- Durchlauf ${marke} (SUITE_NATIVE_CABLE=${nativ ? '1' : 'aus'}) ---`)

  // Jeder Durchlauf bekommt ein FRISCHES Benutzerverzeichnis. Ohne das lag ein
  // stiller Fehlbefund im Test: der Cable-Planer legt sein Projekt in
  // localStorage ab, und die Pruefung „steht das Projekt im Planer" war beim
  // zweiten Lauf schon durch den Rest des ersten erfuellt. Gegengeprobt, indem
  // die Seed-Nachricht im gebauten Bundle unbrauchbar gemacht wurde: Kameras
  // und Licht fielen, Signal blieb gruen -- aus Resten.
  const profil = mkdtempSync(join(tmpdir(), 'suite-smoke-'))
  const app = await electron.launch({
    cwd: SHELL,
    args: ['.', '--no-sandbox', '--disable-gpu', `--user-data-dir=${profil}`],
    env: { ...process.env, ...(nativ ? { SUITE_NATIVE_CABLE: '1' } : {}) },
  })

  // Das Haupt-Log mitlesen: `registerCableIpc` meldet ein fehlgeschlagenes
  // Modul NUR hierhin. Ohne das waere ein fehlendes Paket unsichtbar.
  const hauptLog = []
  app.process().stdout?.on('data', (d) => hauptLog.push(String(d)))
  app.process().stderr?.on('data', (d) => hauptLog.push(String(d)))

  try {
    const win = await app.firstWindow({ timeout: 45000 })
    await win.waitForLoadState('domcontentloaded')
    await win.waitForTimeout(2500)
    await win.screenshot({ path: join(OUT, `${marke}-01-start.png`) })
    melde(`Fenster offen: ${JSON.stringify(await win.title())}`)

    // 1. Renderer wirklich gerendert (nicht nur leeres Fenster)?
    const koerper = await win.evaluate(() => document.body.innerText.trim().length)
    if (koerper < 10) maengel.push(`${marke}: der Shell-Renderer zeigt nichts (body ${koerper} Zeichen)`)
    else melde(`Renderer gerendert (${koerper} Zeichen Text)`)

    // 2. Die Planer-Protokolle -- der Weg, der die entpackten Dateien braucht.
    const planer = await win.evaluate(async () => {
      const urls = window.__suitePlanners
      if (!urls) return { fehlt: true }
      const ergebnis = {}
      for (const [name, url] of Object.entries(urls)) {
        try {
          const antwort = await fetch(url)
          const text = await antwort.text()
          ergebnis[name] = { status: antwort.status, laenge: text.length, script: text.includes('<script') }
        } catch (err) {
          ergebnis[name] = { fehler: String(err && err.message) }
        }
      }
      return ergebnis
    })
    if (planer.fehlt) {
      maengel.push(`${marke}: window.__suitePlanners fehlt -- das Preload hat nicht geladen.`)
    } else {
      for (const [name, r] of Object.entries(planer)) {
        if (r.status === 200 && r.laenge > 100 && r.script) melde(`planner-${name}: ${r.status}, ${r.laenge} Bytes, mit <script>`)
        else maengel.push(`${marke}: planner-${name} liefert nichts Brauchbares: ${JSON.stringify(r)}`)
      }
    }

    // 2b. Der Projekt-Fluss: kommt das Projekt der Shell in den Planern AN?
    //
    // WARUM DIESE PRUEFUNG DAZUGEHOERT. Punkt 2 sagt „das Protokoll liefert
    // eine Seite aus" -- er waere gruen geblieben, waehrend der Nutzer im
    // Signal-Modul einen leeren Cable-Planer mit Erststart-Dialog sah, links
    // daneben die sechs Geraete des Shell-Projekts. Genau der Zustand, den
    // `suite-seed` behebt, war fuer den Smoke-Test unsichtbar.
    //
    // Gemessen wird IM iframe, nicht in der Shell: `contentDocument` ist
    // wegen der eigenen Protokoll-Herkunft nicht lesbar, der Frame aber sehr
    // wohl ansprechbar. Und gemessen werden BEZEICHNUNGEN aus dem Projekt,
    // nicht Textlaenge -- ein Planer mit leerem Plan zeigt auch Menues,
    // Bibliothek und Tastaturhilfe und kaeme ueber jede Laengen-Schwelle.
    const module = [
      // Im nativen Modus ist Signal KEIN iframe, sondern eine WebContentsView
      // (`NativeSignalRegion`) -- dort gibt es nichts zu finden, und die
      // Abwesenheit des Rahmens waere ein falscher Befund.
      ...(nativ ? [] : [{ klick: 'Signal', protokoll: 'planner-signal://', erwartet: ['CAM 2', 'Videohub'] }]),
      { klick: 'Kameras', protokoll: 'planner-cameras://', erwartet: ['CAM 1'] },
      // Licht zeichnet seinen Plan auf ein Canvas -- im DOM steht dort kein
      // einziger Lampenname (nachgemessen: `svg text` leer, `textContent` nur
      // Menue und Bibliothek). Der Blick in die Geraeteliste ist deshalb kein
      // Umweg, sondern der einzige Ort, an dem der Bestand als Text steht --
      // und derselbe Weg, den ein Nutzer nimmt, der wissen will, was im Plan
      // haengt.
      {
        klick: 'Licht',
        protokoll: 'planner-licht://',
        erwartet: ['Source Four'],
        imRahmen: 'Geräteliste',
      },
    ]
    for (const m of module) {
      const getroffen = await win.evaluate((name) => {
        const el = [...document.querySelectorAll('button,[role="tab"],a')].find(
          (e) => (e.textContent || '').trim().includes(name),
        )
        if (!el) return false
        el.click()
        return true
      }, m.klick)
      if (!getroffen) {
        maengel.push(`${marke}: Modul „${m.klick}" ist in der Shell nicht anklickbar`)
        continue
      }
      await win.waitForTimeout(4000)
      const frame = win.frames().find((f) => f.url().startsWith(m.protokoll))
      if (!frame) {
        maengel.push(`${marke}: ${m.klick} -- kein Rahmen mit ${m.protokoll} gefunden`)
        continue
      }
      if (m.imRahmen) {
        try {
          await frame.evaluate((name) => {
            const el = [...document.querySelectorAll('button,[role="tab"],a')].find(
              (e) => (e.textContent || '').trim().includes(name),
            )
            el?.click()
          }, m.imRahmen)
          await win.waitForTimeout(1500)
        } catch {
          /* der Klick ist Beiwerk -- der Befund kommt aus dem Text darunter */
        }
      }
      let text = ''
      try {
        // `textContent`, nicht `innerText`: die Plaene sind SVG, und
        // `innerText` gibt SVG-Text nicht zurueck -- der Licht-Plan waere
        // damit auch dann leer, wenn jede Lampe drinsteht.
        text = await frame.evaluate(() => document.body.textContent || '')
      } catch (err) {
        maengel.push(`${marke}: ${m.klick} -- Rahmen nicht lesbar: ${(err && err.message) || err}`)
        continue
      }
      const fehlend = m.erwartet.filter((n) => !text.includes(n))
      if (fehlend.length > 0) {
        maengel.push(
          `${marke}: ${m.klick} -- das Projekt der Shell steht nicht im Planer (fehlt: ${fehlend.join(', ')}; ${text.length} Zeichen im Rahmen)`,
        )
      } else {
        melde(`${m.klick}: Projekt angekommen (${m.erwartet.join(', ')} im Planer sichtbar)`)
      }
      await win.screenshot({ path: join(OUT, `${marke}-03-${m.klick.toLowerCase()}.png`) })
    }

    // 2c. Die vier Geraete-Module (B-35). Im CI laeuft keines der Geraete --
    // geprueft wird deshalb der Zustand, den ein Nutzer OHNE Pi im Netz sieht:
    // ein benanntes Modul mit einer Adresse und einer Erklaerung, nicht ein
    // toter Rahmen und nicht eine Attrappe. Der Weg selbst (`__suiteTally`)
    // muss bereitstehen, sonst faellt der Tally-Knopf im Signal-Modul aus.
    // Die Namen stehen in `apps/shell/src/modules/runtimes.ts` (Feld `title`).
    // Wer dort umbenennt, faellt hier auf -- so soll es sein: der Test prueft,
    // dass das Modul SEINEN Namen zeigt, nicht irgendeinen.
    const geraete = [
      { taste: '6', name: 'Tally-Anlage' },
      { taste: '7', name: 'Kamerapult' },
      { taste: '8', name: 'Intercom' },
      { taste: '9', name: 'Medien-Station' },
    ]
    for (const g of geraete) {
      await win.keyboard.press(g.taste)
      await win.waitForTimeout(5000)
      const text = await win.evaluate(() => document.body.innerText || '')
      if (text.includes(g.name) && /nicht erreichbar|not reachable/.test(text)) {
        melde(`${g.name}: Modul da, ehrlicher Zustand ohne Geraet`)
      } else if (text.includes(g.name)) {
        melde(`${g.name}: Modul da (Geraet antwortet offenbar)`)
      } else {
        maengel.push(`${marke}: Geraete-Modul „${g.name}" ist nicht erreichbar oder zeigt nichts`)
      }
    }
    const tallyBruecke = await win.evaluate(() => typeof window.__suiteTally?.write === 'function')
    if (tallyBruecke) melde('__suiteTally: Weg zum Pi steht bereit')
    else maengel.push(`${marke}: __suiteTally fehlt -- der Tally-Weg aus dem Plan waere tot.`)

    // 3. Nativer Cable-Host: ist er da, und registrieren seine IPC-Module?
    const nativVerfuegbar = await win.evaluate(() => Boolean(window.__suiteNativeHost))
    melde(`__suiteNativeHost: ${nativVerfuegbar ? 'da' : 'nicht da'}`)
    if (nativ && !nativVerfuegbar) {
      maengel.push('nativ: __suiteNativeHost fehlt trotz SUITE_NATIVE_CABLE=1 -- Cable-Main nicht gebuendelt?')
    }
    if (nativVerfuegbar) {
      await win.evaluate(() => window.__suiteNativeHost.cable.show({ x: 0, y: 60, width: 900, height: 600 }))
      await win.waitForTimeout(4000)
      await win.screenshot({ path: join(OUT, `${marke}-02-cable.png`) })
      melde('cable.show() aufgerufen')

      // Die lazy geladenen Pakete. Ueber die echte Cable-View, damit der Weg
      // derselbe ist wie beim Nutzer: Renderer -> preload -> IPC -> require.
      const lazy = await app.evaluate(async ({ webContents }) => {
        const view = webContents
          .getAllWebContents()
          .find((wc) => wc.getURL().startsWith('planner-signal://'))
        if (!view) return { keineView: true }
        const ergebnis = {}
        const versuch = async (name, ausdruck) => {
          try {
            await view.executeJavaScript(ausdruck)
            ergebnis[name] = 'ok'
          } catch (err) {
            ergebnis[name] = String((err && err.message) || err)
          }
        }
        await versuch('signaling', 'window.cablePlanner.signaling.start()')
        await versuch('signalingStop', 'window.cablePlanner.signaling.stop()')
        await versuch('lexware', 'window.cablePlanner.lexware.ping()')
        return ergebnis
      })

      if (lazy.keineView) {
        maengel.push(`${marke}: die Cable-View war nicht auffindbar -- show() hat nichts geladen.`)
      } else {
        for (const [name, r] of Object.entries(lazy)) {
          // Nur ein FEHLENDES Modul ist ein Verpackungsfehler. Ein fachlicher
          // Fehler (kein API-Key, kein Netz) sagt nichts ueber das Paket.
          if (/Cannot find module|MODULE_NOT_FOUND|ERR_MODULE_NOT_FOUND/.test(r)) {
            maengel.push(`${marke}: ${name} -- Paket fehlt im Baum: ${r}`)
          } else {
            melde(`${name}: ${r === 'ok' ? 'ok' : `kein Modul-Fehler (${r.slice(0, 80)})`}`)
          }
        }
      }
    }
  } catch (err) {
    // Ein Fehler im Durchlauf ist ein Befund, kein Abbruch -- sonst faellt der
    // Bericht aus und man sieht nur einen Stacktrace.
    maengel.push(`${marke}: Durchlauf abgebrochen -- ${(err && err.message) || err}`)
  } finally {
    await app.close().catch(() => {})
  }

  const log = hauptLog.join('')
  // Der stille Fehlermodus, gegen den #90 den deps:check gebaut hat.
  const fehlgeschlagen = [...log.matchAll(/\[cableHost\] (\S+) konnte nicht registriert werden: (.*)/g)]
  for (const t of fehlgeschlagen) maengel.push(`${marke}: IPC-Modul ${t[1]} nicht registriert -- ${t[2].trim()}`)
  const uebersprungen = [...log.matchAll(/\[cableHost\] (\S+): Export (\S+) fehlt/g)]
  for (const t of uebersprungen) maengel.push(`${marke}: IPC-Modul ${t[1]} ohne Export ${t[2]}`)
  if (nativ && fehlgeschlagen.length === 0 && uebersprungen.length === 0) {
    melde('kein IPC-Modul hat sich beschwert')
  }
  if (/nicht gebündelt|nicht initialisierbar/.test(log)) {
    maengel.push(`${marke}: Haupt-Log meldet einen nicht initialisierbaren Cable-Host.`)
  }
  return log
}

const logs = []
logs.push(await lauf(false))
logs.push(await lauf(true))

console.log(`\nScreenshots: ${OUT}`)
if (maengel.length === 0) {
  console.log('\nOK: die Suite startet, die Planer-Protokolle liefern, der native Cable-Host registriert sauber.')
  process.exit(0)
}
console.error(`\nFEHLER: ${maengel.length} Punkt(e):\n`)
for (const m of maengel) console.error(`  ! ${m}`)
console.error('\n--- Haupt-Log (gekuerzt) ---')
console.error(logs.join('').split('\n').filter((z) => z.trim()).slice(-40).join('\n'))
process.exit(1)
