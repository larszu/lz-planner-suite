// ───────────────────────────────────────────────────────────────────────────
// DER ABRUF für die Link-Vorschau. Liegt im MAIN-Prozess, und zwar aus zwei
// Gründen.
//
// WARUM NICHT IM RENDERER. Ein `fetch` aus dem Fenster scheitert an der
// Same-Origin-Regel: fremde Seiten schicken keinen CORS-Kopf für uns, und
// das ist ihr gutes Recht. Ein Renderer-Abruf könnte also nur Seiten lesen,
// die das ausdrücklich erlauben — also fast keine.
//
// WARUM ER TROTZDEM ENG IST. Hier läuft er mit den Rechten der Anwendung.
// Deshalb:
//
//   * nur `http`/`https` (`abrufbar()` im Paket prüft das, und hier noch
//     einmal — eine Prüfung, die nur auf der anderen Seite steht, ist keine);
//   * ZEITLIMIT, sonst hängt eine Karte an einem Server, der nicht antwortet;
//   * GRÖSSENGRENZE, sonst liest ein 2-GB-Download den Arbeitsspeicher leer,
//     und der Kopf einer Seite ist nach 512 kB ohnehin vorbei;
//   * höchstens drei Weiterleitungen, und jede wird wieder geprüft. Ohne das
//     führt ein `https://kurz.link/x` mit einem `Location: file:///etc/...`
//     genau dorthin;
//   * KEINE Zugangsdaten: keine Kekse, kein Zwischenspeicher. Der Abruf ist
//     anonym, weil eine Vorschau nichts mitzubringen hat.
//
// WAS ER NICHT TUT: Bilder holen. Die Karte zeigt die Bildadresse, und ob
// sie ein Bild lädt, entscheidet sie selbst — ein hier heruntergeladenes und
// eingebettetes Bild wäre eine fremde Datei im Projekt, ohne dass jemand sie
// abgelegt hat.
// ───────────────────────────────────────────────────────────────────────────
const MAX_BYTES = 512 * 1024
const TIMEOUT_MS = 8000
const MAX_REDIRECTS = 3

const erlaubt = (u) => {
  try {
    const x = new URL(u)
    return x.protocol === 'http:' || x.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Den Kopf einer Seite holen.
 *
 * Gibt `{ ok: true, html, url }` oder `{ ok: false, grund }` zurück — nie
 * eine Teilantwort, die wie eine ganze aussieht. `grund` ist maschinenlesbar,
 * damit die Oberfläche „nicht erreichbar" von „keine Webadresse" und von
 * „hat geantwortet, aber kein HTML" unterscheiden kann.
 */
async function hole(url) {
  if (!erlaubt(url)) return { ok: false, grund: 'keine-webadresse' }

  let aktuell = url
  for (let sprung = 0; sprung <= MAX_REDIRECTS; sprung += 1) {
    const abbruch = new AbortController()
    const uhr = setTimeout(() => abbruch.abort(), TIMEOUT_MS)
    let antwort
    try {
      antwort = await fetch(aktuell, {
        redirect: 'manual',
        signal: abbruch.signal,
        credentials: 'omit',
        cache: 'no-store',
        headers: {
          // Ehrlich sagen, wer fragt, und was gebraucht wird.
          'user-agent': 'LZ-Planner-Suite (Link-Vorschau)',
          accept: 'text/html,application/xhtml+xml',
        },
      })
    } catch (e) {
      clearTimeout(uhr)
      return { ok: false, grund: e?.name === 'AbortError' ? 'zeitueberschreitung' : 'nicht-erreichbar' }
    }
    clearTimeout(uhr)

    if (antwort.status >= 300 && antwort.status < 400) {
      const ziel = antwort.headers.get('location')
      if (!ziel) return { ok: false, grund: 'nicht-erreichbar' }
      // Jede Weiterleitung wird NEU geprueft — sonst fuehrt ein Kurzlink
      // genau an der Pruefung vorbei, die oben steht.
      const naechste = new URL(ziel, aktuell).toString()
      if (!erlaubt(naechste)) return { ok: false, grund: 'keine-webadresse' }
      aktuell = naechste
      continue
    }

    if (!antwort.ok) return { ok: false, grund: 'nicht-erreichbar' }

    const typ = antwort.headers.get('content-type') ?? ''
    if (!/text\/html|application\/xhtml/i.test(typ)) return { ok: false, grund: 'kein-html' }

    // Stueckweise lesen und bei der Grenze abbrechen: `text()` laedt erst
    // alles und fragt dann, wie gross es war.
    const leser = antwort.body?.getReader()
    if (!leser) return { ok: false, grund: 'nicht-erreichbar' }
    const teile = []
    let gelesen = 0
    while (gelesen < MAX_BYTES) {
      const { done, value } = await leser.read()
      if (done) break
      gelesen += value.byteLength
      teile.push(value)
    }
    try {
      await leser.cancel()
    } catch {
      /* egal — wir haben, was wir brauchen */
    }
    const html = Buffer.concat(teile.map((t) => Buffer.from(t))).toString('utf8')
    return { ok: true, html, url: aktuell }
  }
  return { ok: false, grund: 'zu-viele-weiterleitungen' }
}

module.exports = { hole, MAX_BYTES, TIMEOUT_MS, MAX_REDIRECTS }
