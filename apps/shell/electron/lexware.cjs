// ───────────────────────────────────────────────────────────────────────────
// LEXWARE ALS EIGENE SHELL-DOMÄNE (E-12, entschieden 2026-09-08).
//
// „Buchhaltung ist keine Aufgabe eines Verkabelungsplaners — sie hängt am
// Projekt, nicht am Signalfluss, und sie ist für alle Module dieselbe."
//
// ═══════════════════════════════════════════════════════════════════════════
// WAS VORHER DA WAR: EIN WEG, DER IN KEINER AUSLIEFERUNG LIEF (B-19)
// ═══════════════════════════════════════════════════════════════════════════
//
// Der Beleg lief über den eingebetteten Cable-Planer, und dort trafen zwei
// Bedingungen aufeinander, die sich gegenseitig ausschliessen:
//
//   * `connectShellLexware` (die Empfangsseite im Planer) hielt sich absichtlich
//     heraus, wenn die Seite NICHT eingebettet ist — `window.parent === window`
//     ergab ein No-op.
//   * Der Handler dahinter griff auf `window.cablePlanner` zu, die
//     Electron-Preload-Brücke — die es NUR gibt, wenn der Planer nicht
//     eingebettet läuft.
//
//   | Modus                          | eingebettet | Preload | Ergebnis          |
//   |--------------------------------|-------------|---------|-------------------|
//   | iframe (Standard)              | ja          | nein    | Handler wirft     |
//   | WebContentsView (opt-in, aus)  | nein        | ja      | keine Antwort     |
//
// In keiner ausgelieferten Konfiguration entstand ein Beleg. Der Weg läuft
// jetzt hier, im Hauptprozess der Shell — ohne iframe, ohne Brücke, ohne
// geöffneten Planer.
//
// ═══════════════════════════════════════════════════════════════════════════
// EIN SCHLÜSSEL, UND ER BEHÄLT SEINEN NAMEN
// ═══════════════════════════════════════════════════════════════════════════
//
// Der Key liegt im OS-Credential-Store unter `('cable-planner',
// 'lexware-api-key')` — dort hat ihn hinterlegt, wer ihn schon einmal
// eingetragen hat. Diesen Eintrag jetzt umzubenennen, weil die Domäne
// umgezogen ist, wäre die teuerste Art von Aufräumen: der vorhandene Key läge
// weiter im Store, die Anwendung fände ihn nicht mehr und meldete „kein Key
// hinterlegt" — ohne Hinweis, dass sie nur woanders sucht.
//
// Und es darf nur EINER sein. Zwei Einträge beantworteten die Frage „ist ein
// Key hinterlegt?" an zwei Stellen verschieden, und der Nutzer sähe je nach
// Fenster eine andere Antwort.
//
// DER KEY VERLÄSST DIESEN PROZESS NIE. Er wird gelesen, als Bearer-Header
// gesendet und fallengelassen. Nach draussen geht höchstens die TATSACHE, dass
// einer hinterlegt ist — nie sein Wert, auch nicht gekürzt: die ersten vier
// Zeichen eines Schlüssels sind immer noch vier Zeichen eines Schlüssels.
// ───────────────────────────────────────────────────────────────────────────

const KEYTAR_SERVICE = 'cable-planner'
const KEYTAR_ACCOUNT = 'lexware-api-key'

/**
 * keytar wird SPÄT geladen und Fehler werden gemeldet statt geworfen.
 *
 * Es ist ein natives Modul; auf einem Rechner ohne Credential-Store (manche
 * Linux-Sitzungen ohne Schlüsselbund-Dienst) lässt es sich nicht laden. Das
 * darf den Start der Anwendung nicht verhindern — aber es darf auch nicht
 * stillschweigend als „kein Key hinterlegt" durchgehen, denn das sieht aus wie
 * eine Antwort über den Speicher und ist eine über das Modul.
 */
function ladeKeytar() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return { ok: true, keytar: require('keytar') }
  } catch (err) {
    return { ok: false, error: `Kein Zugriff auf den Schlüsselbund: ${err && err.message}` }
  }
}

/** Der Schlüssel — oder eine Auskunft darüber, warum es keinen gibt. */
async function leseKey() {
  const k = ladeKeytar()
  if (!k.ok) return { ok: false, error: k.error }
  try {
    const key = await k.keytar.getPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT)
    if (!key) return { ok: false, error: 'Kein Lexware-API-Key hinterlegt.' }
    return { ok: true, key }
  } catch (err) {
    return { ok: false, error: `Schlüsselbund nicht lesbar: ${err && err.message}` }
  }
}

/**
 * Der geteilte Client aus `@avplan/lexware-core`.
 *
 * Dynamisch importiert, weil das Paket ESM ist und diese Datei CJS bleibt
 * (dieselbe Lösung wie in `cableHost.cjs`). Der Import passiert einmal und
 * wird gemerkt.
 */
let kernPromise = null
function ladeKern() {
  if (!kernPromise) kernPromise = import('@avplan/lexware-core')
  return kernPromise
}

/** Verbindung prüfen. Antwortet immer, wirft nie. */
async function ping() {
  const k = await leseKey()
  if (!k.ok) return { ok: false, error: k.error }
  try {
    const { LexwareClient } = await ladeKern()
    await new LexwareClient({ apiKey: k.key }).ping()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err && err.message) || 'Lexware-Ping fehlgeschlagen.' }
  }
}

/**
 * Einen Beleg anlegen. Antwortet immer, wirft nie.
 *
 * Ein geworfener Fehler wäre hier besonders unangenehm: der Aufrufer steht in
 * einem Dialog, in dem gerade ein Angebot entstehen sollte, und bekäme eine
 * abgebrochene Zusage statt eines Grundes.
 */
async function createDocument(doc) {
  const k = await leseKey()
  if (!k.ok) return { ok: false, error: k.error }
  try {
    const { LexwareClient } = await ladeKern()
    const client = new LexwareClient({ apiKey: k.key })
    const res = await client.createDocument(doc)
    return { ok: true, id: res.id, webUrl: LexwareClient.webUrl(doc && doc.kind, res.id) }
  } catch (err) {
    return { ok: false, error: (err && err.message) || 'Beleg konnte nicht angelegt werden.' }
  }
}

/** Den Schlüssel hinterlegen. Ein leerer Wert löscht ihn NICHT — er wird abgelehnt. */
async function setKey(key) {
  const wert = String(key || '').trim()
  if (!wert) return { ok: false, error: 'Kein Schlüssel eingegeben.' }
  const k = ladeKeytar()
  if (!k.ok) return { ok: false, error: k.error }
  try {
    await k.keytar.setPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT, wert)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: `Schlüsselbund nicht beschreibbar: ${err && err.message}` }
  }
}

/** Den Schlüssel entfernen. Ausdrücklich, damit „löschen" nicht heisst: leer speichern. */
async function deleteKey() {
  const k = ladeKeytar()
  if (!k.ok) return { ok: false, error: k.error }
  try {
    await k.keytar.deletePassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: `Schlüsselbund nicht beschreibbar: ${err && err.message}` }
  }
}

/**
 * Liegt ein Schlüssel vor?
 *
 * DREI Antworten und nicht zwei: `true`, `false` und „konnte nicht
 * nachsehen". Ein nicht lesbarer Schlüsselbund als `false` zu melden hiesse,
 * dem Nutzer zu sagen, sein Key sei weg — dabei weiss die Anwendung es nur
 * nicht.
 */
async function hasKey() {
  const k = ladeKeytar()
  if (!k.ok) return { ok: false, error: k.error }
  try {
    const key = await k.keytar.getPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT)
    return { ok: true, vorhanden: !!key }
  } catch (err) {
    return { ok: false, error: `Schlüsselbund nicht lesbar: ${err && err.message}` }
  }
}

module.exports = { ping, createDocument, setKey, deleteKey, hasKey, KEYTAR_SERVICE, KEYTAR_ACCOUNT }
