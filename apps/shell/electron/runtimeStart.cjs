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
/**
 * ─── DER STARTER DES REPOS, NICHT `npm run dev` ──────────────────────────
 *
 * NUTZER-MELDUNG 2026-09-15: „intercom und kamerapult muss auch lokal laufen
 * im av planner."
 *
 * Bis hierher stand hier `npm run dev`. GEMESSEN am 2026-09-15 an einem
 * frischen Klon beider Repos, mit genau diesem Befehl:
 *
 *   Broadcast-intercom   sh: 1: concurrently: not found        EXIT=127
 *   sony-camera-bridge   sh: 1: tsx: not found / sh -c vite    EXIT=127
 *
 * `concurrently`, `tsx` und `vite` liegen in `node_modules/.bin`. Wer eines
 * der Repos frisch klont und auf „Lokal starten" drueckt, bekommt diese
 * Zeile und sonst nichts. Die beiden anderen Geraete waren nicht betroffen,
 * und das ist kein Zufall: `tally-pi` und `pi-media-station` sind Python und
 * brauchen kein `node_modules`. Genau die zwei npm-Geraete hat der Nutzer
 * gemeldet.
 *
 * Jedes Repo bringt einen eigenen Starter mit, und der tut, was `npm run
 * dev` nicht tut:
 *
 *   * fehlende Abhaengigkeiten nachinstallieren,
 *   * den HARDWAREFREIEN Weg waehlen — die Demo-Kamera im Kamerapult,
 *     `MOCK_DEVICES=1` im Intercom. Ohne das kommt die Oberflaeche leer hoch
 *     und jeder Regler ist inert; wer aus dem Planungsfenster darauf
 *     schaut, sieht eine tote App und keinen Hinweis, warum,
 *   * die Node-Fassung pruefen, bevor der Abbruch irgendwo im Bundling
 *     passiert,
 *   * beim Beenden aufraeumen (die Bruecke des Kamerapults bliebe sonst auf
 *     Port 9700 liegen und der naechste Start scheiterte daran).
 *
 * Diese Datei ruft deshalb den Starter auf und baut seine Arbeit nicht nach.
 * Ein zweiter Ort, der dasselbe zu tun versucht, driftet vom ersten weg —
 * und das ist genau der Grund, warum `npm run dev` hier stand: es SAH aus
 * wie der Startbefehl.
 *
 * WINDOWS bekommt `powershell -File dev.ps1` und nicht `npm.cmd`. Beide
 * `.ps1` sind mit diesem Zug entstanden bzw. nachgezogen worden;
 * `-ExecutionPolicy Bypass` gilt nur fuer DIESEN Aufruf und aendert nichts
 * an der Einstellung des Rechners.
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
    marker: ['package.json', WINDOWS ? 'dev.ps1' : 'dev.sh'],
    paketName: 'sony-camera-bridge',
    programm: WINDOWS ? 'powershell' : 'bash',
    argumente: WINDOWS ? ['-ExecutionPolicy', 'Bypass', '-File', 'dev.ps1'] : ['dev.sh'],
  },
  intercom: {
    repo: 'Broadcast-intercom',
    marker: ['package.json', WINDOWS ? 'dev.ps1' : 'dev.sh'],
    paketName: 'broadcast-intercom',
    programm: WINDOWS ? 'powershell' : 'bash',
    argumente: WINDOWS ? ['-ExecutionPolicy', 'Bypass', '-File', 'dev.ps1'] : ['dev.sh'],
  },
  medien: {
    repo: 'pi-media-station',
    marker: WINDOWS ? ['run_windows.bat', 'main.py'] : ['run-local.sh', 'main.py'],
    // `run_windows.bat` und nicht `python main.py`: das Skript sucht den
    // Interpreter (`py`, dann `python`), legt bei Bedarf die virtuelle
    // Umgebung an und installiert die Abhaengigkeiten. `python main.py` auf
    // einem frischen Klon faellt ueber `flask`.
    programm: WINDOWS ? 'cmd.exe' : 'bash',
    argumente: WINDOWS ? ['/c', 'run_windows.bat'] : ['run-local.sh'],
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
      // EIGENE PROZESSGRUPPE (nur POSIX), damit `beende` die ganze Kette
      // erwischt.
      //
      // Hier stand `detached: false` mit der Begruendung, der Prozess haenge
      // dann am Fenster und hinterlasse keinen verwaisten Server. Das war
      // genau verkehrt herum gedacht: `detached` bestimmt die PROZESSGRUPPE,
      // nicht die Lebensdauer. Was wir starten, ist eine Kette —
      //
      //     bash dev.sh → npm run dev:mock → concurrently → tsx + vite
      //
      // — und ein SIGTERM an das `bash` beendet nur das `bash`. Die Enkel
      // liefen weiter und sassen auf 4001/5200 bzw. 3700/9700, sodass der
      // naechste Start in „address in use" lief. Der Kommentar versprach
      // also das Gegenteil dessen, was die Zeile bewirkte.
      //
      // Mit einer eigenen Gruppe geht das Signal an `-pid`, also an alle
      // darin. Dass beim Schliessen der Suite nichts stehenbleibt, leistet
      // `beendeAlle()` an `before-quit` (`main.cjs`) — das ist die Stelle,
      // an der diese Zusage hingehoert, und dort stand sie schon.
      detached: !WINDOWS,
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
  const pid = p.kind.pid
  try {
    if (WINDOWS) {
      // Windows kennt keine Prozessgruppen in diesem Sinn. `taskkill /T`
      // nimmt den Baum unter der PID mit — ohne das bliebe unter
      // `powershell -File dev.ps1` alles darunter stehen.
      spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { shell: false, stdio: 'ignore' })
    } else if (pid) {
      // SIGTERM und nicht SIGKILL: ein Entwicklungsserver raeumt dabei seinen
      // Port ab. Mit SIGKILL bliebe er belegt, und der naechste Start liefe in
      // „address in use".
      //
      // An die GRUPPE (`-pid`) und nicht an den einen Prozess: gestartet wird
      // ein Starter-Skript, das seinerseits startet. Ein Signal an das Skript
      // laesst dessen Enkel auf ihren Ports sitzen.
      process.kill(-pid, 'SIGTERM')
    }
  } catch {
    // Die Gruppe kann schon weg sein — oder es gab nie eine (wenn `spawn`
    // fehlschlug). Dann bleibt der direkte Weg.
    try {
      p.kind.kill('SIGTERM')
    } catch {
      /* schon weg */
    }
  }
  return { ok: true, laeuft: false }
}

function beendeAlle() {
  for (const id of laufend.keys()) beende(id)
}

module.exports = { REZEPTE, passendesVerzeichnis, starte, beende, beendeAlle, zustand }
