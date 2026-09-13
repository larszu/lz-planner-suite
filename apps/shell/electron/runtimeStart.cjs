// ───────────────────────────────────────────────────────────────────────────
// Die vier Laufzeit-Anwendungen von der Suite aus starten (suite#233).
//
// NUTZER-MELDUNG 2026-09-12: „man muss die tally anwendung lokal starten
// können von der tally seite aus" — und im Kommentar dazu: „ebenso kamerapult,
// intercom und medien muss man lokal starten können wenn noch kein server
// läuft."
//
// Bis hierher stand im Nicht-erreichbar-Zustand der Befehl ALS TEXT. Das war
// ehrlich und half niemandem: wer im Planungsfenster sitzt, soll nicht ein
// Terminal suchen, um zu sehen, was er gerade plant.
//
// ─── WAS HIER BEWUSST NICHT PASSIERT ──────────────────────────────────────
//
// KEINE SHELL. `spawn` bekommt Programm und Argumente getrennt, `shell: false`.
// Ein Kommandotext, der durch eine Shell laeuft, ist eine Einladung: ein
// Verzeichnisname mit einem Semikolon darin wuerde zum zweiten Befehl.
//
// KEIN GERATENER PFAD. Die Suite weiss nicht, wo `tally-pi` auf dieser
// Platte liegt. Sie bekommt das Verzeichnis gesagt und PRUEFT es: in jedem
// Repo gibt es eine Datei, die es eindeutig macht (`run-local.py`,
// `run-local.sh`, `package.json` mit passendem `name`). Fehlt sie, wird nicht
// gestartet — sonst startete ein Klick irgendein `npm run dev` in irgendeinem
// Verzeichnis.
//
// KEINE VERSPRECHEN UEBER DEN ZUSTAND. Dieser Baustein sagt nur, was er
// selbst weiss: ob ER einen Prozess gestartet hat und ob der noch laeuft. Ob
// die Anwendung BEREIT ist, misst weiterhin `RuntimeFrame` mit seinem
// `fetch` — ein laufender Prozess ist noch keine erreichbare Oberflaeche.
// ───────────────────────────────────────────────────────────────────────────
const { spawn } = require('node:child_process')
const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')

const WINDOWS = process.platform === 'win32'

/**
 * Was je Geraet gestartet wird, und woran man sein Verzeichnis erkennt.
 *
 * Die Befehle stehen hier UND in `src/modules/runtimes.ts` als Fliesstext für
 * den Nicht-erreichbar-Zustand. `test/laufzeitStart.test.ts` haelt beide
 * gegeneinander: zwei Orte fuer denselben Befehl driften, und dann startet
 * der Knopf etwas anderes, als danebensteht.
 */
const REZEPTE = {
  tally: {
    repo: 'tally-pi',
    marker: ['run-local.py'],
    programm: WINDOWS ? 'python' : 'python3',
    argumente: ['run-local.py'],
  },
  kamera: {
    repo: 'sony-camera-bridge',
    marker: ['package.json'],
    paketName: 'sony-camera-bridge',
    programm: WINDOWS ? 'npm.cmd' : 'npm',
    argumente: ['run', 'dev'],
  },
  intercom: {
    repo: 'Broadcast-intercom',
    marker: ['package.json'],
    paketName: 'broadcast-intercom',
    programm: WINDOWS ? 'npm.cmd' : 'npm',
    argumente: ['run', 'dev'],
  },
  medien: {
    repo: 'pi-media-station',
    marker: ['run-local.sh', 'main.py'],
    programm: WINDOWS ? 'python' : 'bash',
    argumente: WINDOWS ? ['main.py'] : ['run-local.sh'],
  },
}

/** Laufende Prozesse je Geraet. */
const laufend = new Map()

/** Die letzten Ausgabezeilen — der Grund, wenn etwas sofort wieder aufhoert. */
const AUSGABE_ZEILEN = 40

function passendesVerzeichnis(id, verzeichnis) {
  const r = REZEPTE[id]
  if (!r) return { ok: false, grund: 'unbekannt' }
  if (typeof verzeichnis !== 'string' || !verzeichnis.trim()) return { ok: false, grund: 'kein-pfad' }
  if (!existsSync(verzeichnis)) return { ok: false, grund: 'nicht-gefunden' }
  for (const datei of r.marker) {
    if (!existsSync(join(verzeichnis, datei))) return { ok: false, grund: 'kein-repo', fehlt: datei }
  }
  if (r.paketName) {
    try {
      const pkg = JSON.parse(readFileSync(join(verzeichnis, 'package.json'), 'utf8'))
      if (String(pkg.name ?? '').toLowerCase() !== r.paketName) {
        return { ok: false, grund: 'falsches-repo', gefunden: String(pkg.name ?? '') }
      }
    } catch {
      return { ok: false, grund: 'kein-repo', fehlt: 'package.json' }
    }
  }
  return { ok: true }
}

function zustand(id) {
  const p = laufend.get(id)
  if (!p) return { laeuft: false, zeilen: [], code: null }
  return { laeuft: p.kind.exitCode === null && !p.beendet, pid: p.kind.pid, zeilen: p.zeilen.slice(-AUSGABE_ZEILEN), code: p.code ?? null }
}

function starte(id, verzeichnis, melde) {
  const r = REZEPTE[id]
  if (!r) return { ok: false, grund: 'unbekannt' }
  if (zustand(id).laeuft) return { ok: true, schon: true, ...zustand(id) }

  const geprueft = passendesVerzeichnis(id, verzeichnis)
  if (!geprueft.ok) return { ok: false, ...geprueft }

  let kind
  try {
    kind = spawn(r.programm, r.argumente, {
      cwd: verzeichnis,
      shell: false,
      // Der Prozess haengt am Fenster: schliesst jemand die Suite, soll kein
      // verwaister Server auf dem Port sitzen bleiben und den naechsten Start
      // blockieren.
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (e) {
    return { ok: false, grund: 'start-fehlgeschlagen', text: String(e && e.message ? e.message : e) }
  }

  const eintrag = { kind, zeilen: [], beendet: false, code: null }
  laufend.set(id, eintrag)

  const sammle = (puffer) => {
    for (const zeile of String(puffer).split(/\r?\n/)) {
      if (zeile.trim()) eintrag.zeilen.push(zeile.slice(0, 400))
    }
    if (eintrag.zeilen.length > AUSGABE_ZEILEN * 4) eintrag.zeilen.splice(0, eintrag.zeilen.length - AUSGABE_ZEILEN * 4)
    melde(id, zustand(id))
  }
  kind.stdout.on('data', sammle)
  kind.stderr.on('data', sammle)
  kind.on('error', (e) => {
    eintrag.zeilen.push(String(e && e.message ? e.message : e))
    eintrag.beendet = true
    melde(id, zustand(id))
  })
  kind.on('exit', (code, signal) => {
    eintrag.beendet = true
    eintrag.code = code ?? (signal ? `Signal ${signal}` : null)
    melde(id, zustand(id))
  })

  return { ok: true, ...zustand(id) }
}

function beende(id) {
  const p = laufend.get(id)
  if (!p) return { ok: true, laeuft: false }
  try {
    // SIGTERM und nicht SIGKILL: ein Entwicklungsserver raeumt dabei seinen
    // Port ab. Mit SIGKILL bliebe er belegt, und der naechste Start liefe in
    // „address in use".
    p.kind.kill('SIGTERM')
  } catch {
    /* schon weg */
  }
  return { ok: true, laeuft: false }
}

function beendeAlle() {
  for (const id of laufend.keys()) beende(id)
}

module.exports = { REZEPTE, passendesVerzeichnis, starte, beende, beendeAlle, zustand }
