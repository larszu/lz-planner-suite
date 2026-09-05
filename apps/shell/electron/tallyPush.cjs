// ───────────────────────────────────────────────────────────────────────────
// HTTP-Weg zum tally-pi. Liegt im MAIN-Prozess, und zwar aus einem Grund:
//
// `guide_server.py` schickt keine CORS-Kopfzeilen (nachgesehen: weder
// `Access-Control-*` noch ein OPTIONS-Zweig). Ein `fetch` aus dem Renderer
// wuerde entweder am Preflight scheitern oder -- mit `mode: 'no-cors'` --
// abgeschickt, aber unlesbar sein. Ein Schreibvorgang, dessen Ergebnis man
// nicht erfaehrt, ist schlimmer als keiner: der Nutzer glaubt, die Karte sei
// auf dem Pi. Node kennt keine Same-Origin-Regel und liefert die echte
// Antwort samt Status.
//
// GELESEN WIRD VOR DEM SCHREIBEN. `merge_tally_config` drueben behaelt jedes
// Feld, das der Post nicht mitbringt (ATEM-Adresse, GPIO-Verdrahtung) -- aber
// GERAETE, die der Post nicht nennt, verschwinden. Das ist die richtige
// Semantik (der Plan besitzt die Quellenliste) und trotzdem eine Wirkung, die
// niemand ungefragt ausloesen soll. Deshalb gibt es beide Wege einzeln: erst
// lesen und vergleichen, dann schreiben.
// ───────────────────────────────────────────────────────────────────────────
const http = require('node:http')

const ANFRAGE_FRIST_MS = 6000

/** Eine HTTP-Anfrage an den Pi. Antwortet immer mit einem Objekt, wirft nie. */
function anfrage(url, methode, koerper) {
  return new Promise((resolve) => {
    let ziel
    try {
      ziel = new URL(url)
    } catch {
      resolve({ ok: false, error: `Keine gültige Adresse: ${url}` })
      return
    }
    if (ziel.protocol !== 'http:') {
      resolve({ ok: false, error: `Nur http:// wird unterstützt (bekommen: ${ziel.protocol}//)` })
      return
    }
    const daten = koerper === undefined ? null : Buffer.from(JSON.stringify(koerper), 'utf8')
    const req = http.request(
      {
        hostname: ziel.hostname,
        port: ziel.port || 80,
        path: `${ziel.pathname}${ziel.search}`,
        method: methode,
        timeout: ANFRAGE_FRIST_MS,
        headers: daten
          ? { 'Content-Type': 'application/json', 'Content-Length': daten.length }
          : {},
      },
      (res) => {
        const stuecke = []
        res.on('data', (c) => stuecke.push(c))
        res.on('end', () => {
          const text = Buffer.concat(stuecke).toString('utf8')
          let json
          try {
            json = JSON.parse(text)
          } catch {
            json = undefined
          }
          const ok = (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300
          resolve({
            ok,
            status: res.statusCode,
            json,
            // Der Rumpf wird gekuerzt mitgegeben: bei einem Fehler steht dort
            // die Begruendung des Pi, und die gehoert vor den Nutzer.
            text: text.slice(0, 2000),
            ...(ok ? {} : { error: (json && json.error) || `HTTP ${res.statusCode}` }),
          })
        })
      },
    )
    req.on('timeout', () => {
      req.destroy()
      resolve({ ok: false, error: `Keine Antwort von ${ziel.host} innerhalb von ${ANFRAGE_FRIST_MS / 1000} s` })
    })
    req.on('error', (err) => resolve({ ok: false, error: err.message }))
    if (daten) req.write(daten)
    req.end()
  })
}

/** Aktuelle `tally.json` des Pi lesen. */
const lese = (basisUrl) => anfrage(new URL('/tally-config', basisUrl).toString(), 'GET')

/**
 * Quellenliste aus dem Plan schreiben. Bewusst NUR `devices`: alles andere
 * gehoert dem Pi und wird drueben aus der alten Datei ergaenzt.
 */
const schreibe = (basisUrl, devices) =>
  anfrage(new URL('/tally-config', basisUrl).toString(), 'POST', { devices })

module.exports = { lese, schreibe }
