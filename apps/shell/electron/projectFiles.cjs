// ───────────────────────────────────────────────────────────────────────────
// Projekte als DATEIEN. Liegt im MAIN-Prozess, und zwar aus einem Grund
// (B-39.3).
//
// WAS VORHER FEHLTE. Die Shell hielt jedes Projekt im `localStorage` des
// Browser-Fensters. Das funktioniert, solange niemand danach fragt — und die
// Fragen kommen alle am selben Tag: „schick mir die Show", „zieh das auf den
// zweiten Rechner", „mach ein Backup vor dem Umbau". Ein Projekt, das nur im
// Profilverzeichnis einer Electron-Installation existiert, kann keine davon
// beantworten. Es gab einen Export-Knopf, aber er warf die Datei per
// Browser-Download in den Downloads-Ordner: kein Ort zum Auswaehlen, kein
// Wiederoeffnen, kein zweites Speichern an dieselbe Stelle.
//
// WARUM IM MAIN-PROZESS. Native Speichern-/Oeffnen-Dialoge und Schreibzugriff
// gibt es nur hier. Dasselbe Muster wie beim Tally-Weg nebenan: was der
// Renderer nicht KANN, taeuscht er auch nicht vor.
//
// ATOMAR GESCHRIEBEN. Erst in eine Nachbardatei, dann umbenannt. Ein
// abgebrochener Schreibvorgang (voller Datentraeger, Absturz, gezogener
// USB-Stick) laesst sonst eine halbe JSON-Datei zurueck, und die haelt jeder
// Leser fuer ein kaputtes Projekt statt fuer einen abgebrochenen Vorgang. Die
// Planer machen es an ihren Projektdateien genauso.
// ───────────────────────────────────────────────────────────────────────────
const { dialog } = require('electron')
const fs = require('node:fs/promises')
const path = require('node:path')

const FILTER = [
  { name: 'AV-Planner-Suite-Projekt', extensions: ['avsuite.json', 'json'] },
]

/** Ein Dateiname, den ein Betriebssystem annimmt. */
function saeubere(name) {
  const s = String(name || 'Projekt')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return s || 'Projekt'
}

/**
 * Atomar schreiben: Nachbardatei, fsync, umbenennen.
 *
 * `rename` ist auf demselben Dateisystem atomar — entweder steht die alte
 * Datei da oder die neue, nie eine halbe. Der Umweg ueber `.tmp` im
 * ZIELVERZEICHNIS (nicht in /tmp) ist noetig, weil `rename` ueber
 * Dateisystemgrenzen hinweg kein Umbenennen mehr ist, sondern ein Kopieren.
 */
async function schreibeAtomar(ziel, text) {
  const tmp = path.join(path.dirname(ziel), `.${path.basename(ziel)}.tmp`)
  const fh = await fs.open(tmp, 'w')
  try {
    await fh.writeFile(text, 'utf8')
    await fh.sync()
  } finally {
    await fh.close()
  }
  await fs.rename(tmp, ziel)
}

/**
 * Speichern. Ohne `pfad` mit Dialog („Speichern unter"), mit `pfad` still an
 * dieselbe Stelle.
 *
 * Antwortet immer, wirft nie: `{ ok, path?, canceled?, error? }`. Ein
 * Speichervorgang, dessen Ergebnis der Renderer nicht erfaehrt, waere
 * schlimmer als keiner — er glaubte sonst, die Show sei auf der Platte.
 */
async function speichere(fenster, { pfad, name, inhalt }) {
  let ziel = pfad
  if (!ziel) {
    const vorschlag = `${saeubere(name)}.avsuite.json`
    const antwort = await dialog.showSaveDialog(fenster ?? undefined, {
      title: 'Projekt speichern',
      defaultPath: vorschlag,
      filters: FILTER,
    })
    if (antwort.canceled || !antwort.filePath) return { ok: false, canceled: true }
    ziel = antwort.filePath
  }
  try {
    await schreibeAtomar(ziel, inhalt)
    return { ok: true, path: ziel }
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) }
  }
}

/** Oeffnen mit Dialog. Liefert Pfad und Inhalt, damit der Renderer beides hat. */
async function oeffne(fenster) {
  const antwort = await dialog.showOpenDialog(fenster ?? undefined, {
    title: 'Projekt öffnen',
    filters: FILTER,
    properties: ['openFile'],
  })
  if (antwort.canceled || antwort.filePaths.length === 0) return { ok: false, canceled: true }
  const ziel = antwort.filePaths[0]
  try {
    return { ok: true, path: ziel, content: await fs.readFile(ziel, 'utf8') }
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) }
  }
}

module.exports = { speichere, oeffne }
