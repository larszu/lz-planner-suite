import { describe, it, expect } from 'vitest'
import { createRequire } from 'node:module'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { RUNTIMES } from '../src/modules/runtimes'

// ───────────────────────────────────────────────────────────────────────────
// DIE VIER LAUFZEIT-ANWENDUNGEN LASSEN SICH VON HIER AUS STARTEN (suite#233)
//
// NUTZER-MELDUNG 2026-09-12: „man muss die tally anwendung lokal starten
// können von der tally seite aus" — im Kommentar dazu: „ebenso kamerapult,
// intercom und medien muss man lokal starten können wenn noch kein server
// läuft."
//
// Bis hierher stand der Befehl als TEXT im Nicht-erreichbar-Zustand. Das war
// ehrlich und half niemandem.
//
// WAS DIESER LAUF PRUEFT, und warum jede Zeile davon noetig ist:
//
//  1. JEDES der vier Geraete hat ein Rezept. Drei von vier waeren schlimmer
//     als keines: der vierte Knopf fehlte, und niemand wuesste warum.
//
//  2. KEINE SHELL. Ein Kommandotext durch eine Shell ist eine Einladung — ein
//     Verzeichnisname mit Semikolon wuerde zum zweiten Befehl.
//
//  3. DAS VERZEICHNIS WIRD GEPRUEFT, NICHT GEGLAUBT. Gegen echte Ordner im
//     Temp-Verzeichnis: einer ohne Marker, einer mit fremdem package.json,
//     einer richtig. Ohne diese Pruefung startete ein Klick irgendein
//     `npm run dev` irgendwo.
//
//  4. DER BEFEHL STEHT NICHT ZWEIMAL VERSCHIEDEN DA. Das Rezept und der
//     Fliesstext in `runtimes.ts` nennen dasselbe Programm. Zwei Orte fuer
//     denselben Befehl driften, und dann startet der Knopf etwas anderes, als
//     danebensteht.
//
//  5. DER WEG IST VERDRAHTET — Hauptprozess, Bruecke, Oberflaeche.
//
//  6. UND ER IST AN DEN HOST GEBUNDEN. Im Browser-Bau gibt es die Bruecke
//     nicht; der Knopf darf dort nicht erscheinen.
//
// WAS ER NICHT KANN: er startet nichts. Ob `npm run dev` in einem echten
// Repo hochkommt, haengt an dessen Abhaengigkeiten und nicht an dieser Suite.
// Gemessen wurde das von Hand (siehe PR-Text); hier steht die Verdrahtung.
// ───────────────────────────────────────────────────────────────────────────

const require = createRequire(import.meta.url)
const start = require('../electron/runtimeStart.cjs') as {
  REZEPTE: Record<string, { repo: string; marker: string[]; paketName?: string; programm: string; argumente: string[] }>
  passendesVerzeichnis: (id: string, dir: string) => { ok: boolean; grund?: string; fehlt?: string; gefunden?: string }
}

const lies = (p: string): string => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('Jedes Geraet hat ein Start-Rezept', () => {
  it('alle vier, keines mehr', () => {
    expect(Object.keys(start.REZEPTE).sort()).toEqual(RUNTIMES.map((r) => r.id).sort())
  })

  it('und jedes nennt Programm und Argumente getrennt — keine Shell', () => {
    for (const [id, r] of Object.entries(start.REZEPTE)) {
      expect(r.programm, id).toBeTruthy()
      expect(Array.isArray(r.argumente), id).toBe(true)
      // Ein Leerzeichen im Programmnamen hiesse: da steckt eine Befehlszeile
      // drin, die irgendwer zerlegen muss — und das tut dann eine Shell.
      expect(r.programm.includes(' '), id).toBe(false)
      expect(r.marker.length, id).toBeGreaterThan(0)
    }
  })

  it('der Quelltext startet ohne Shell', () => {
    const quelle = lies('electron/runtimeStart.cjs')
    expect(quelle).toContain('shell: false')
    expect(quelle).not.toMatch(/shell:\s*true/)
    expect(quelle).not.toContain('exec(')
  })
})

describe('Das Verzeichnis wird geprueft, nicht geglaubt', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'avplan-start-'))

  it('ein leerer Pfad startet nichts', () => {
    expect(start.passendesVerzeichnis('tally', '')).toMatchObject({ ok: false, grund: 'kein-pfad' })
  })

  it('ein Verzeichnis, das es nicht gibt, startet nichts', () => {
    expect(start.passendesVerzeichnis('tally', join(tmp, 'gibt-es-nicht'))).toMatchObject({
      ok: false,
      grund: 'nicht-gefunden',
    })
  })

  it('ein fremdes Verzeichnis startet nichts — und sagt, welche Datei fehlt', () => {
    const leer = join(tmp, 'leer')
    mkdirSync(leer, { recursive: true })
    const r = start.passendesVerzeichnis('tally', leer)
    expect(r.ok).toBe(false)
    expect(r.grund).toBe('kein-repo')
    expect(r.fehlt).toBe('run-local.py')
  })

  it('ein package.json mit fremdem Namen startet nichts', () => {
    // Der gefaehrlichste Fall: die Marker-Dateien SIND da (jedes Node-Projekt
    // hat ein package.json), und ohne den Namensabgleich liefe der Starter in
    // irgendeinem fremden Projekt.
    const fremd = join(tmp, 'fremd')
    mkdirSync(fremd, { recursive: true })
    for (const datei of start.REZEPTE.kamera.marker) writeFileSync(join(fremd, datei), '')
    writeFileSync(join(fremd, 'package.json'), JSON.stringify({ name: 'irgendwas-anderes' }))
    const r = start.passendesVerzeichnis('kamera', fremd)
    expect(r.ok).toBe(false)
    expect(r.grund).toBe('falsches-repo')
    expect(r.gefunden).toBe('irgendwas-anderes')
  })

  it('ein Repo ohne seinen Starter startet nichts', () => {
    // SEIT 2026-09-15 ist der Starter des Repos selbst ein Marker — der Knopf
    // ruft `dev.sh` bzw. `dev.ps1` und nicht mehr `npm run dev`. Fehlt die
    // Datei, ist es entweder ein alter Stand oder das falsche Verzeichnis;
    // beides muss VOR dem `spawn` auffallen und nicht als „command not found"
    // in der Ausgabe.
    const ohne = join(tmp, 'ohne-starter')
    mkdirSync(ohne, { recursive: true })
    writeFileSync(join(ohne, 'package.json'), JSON.stringify({ name: 'sony-camera-bridge' }))
    const r = start.passendesVerzeichnis('kamera', ohne)
    expect(r.ok).toBe(false)
    expect(r.grund).toBe('kein-repo')
    expect(r.fehlt).toBe(process.platform === 'win32' ? 'dev.ps1' : 'dev.sh')
  })

  it('das richtige Verzeichnis geht durch', () => {
    const echt = join(tmp, 'sony-camera-bridge')
    mkdirSync(echt, { recursive: true })
    for (const datei of start.REZEPTE.kamera.marker) writeFileSync(join(echt, datei), '')
    writeFileSync(join(echt, 'package.json'), JSON.stringify({ name: 'sony-camera-bridge' }))
    expect(start.passendesVerzeichnis('kamera', echt)).toMatchObject({ ok: true })
  })
})

// ───────────────────────────────────────────────────────────────────────────
// DER STARTER DES REPOS UND NICHT `npm run dev` (2026-09-15)
//
// NUTZER-MELDUNG: „intercom und kamerapult muss auch lokal laufen im av
// planner."
//
// GEMESSEN an einem frischen Klon beider Repos, mit genau dem Befehl, der
// hier bis dahin stand:
//
//   Broadcast-intercom   sh: 1: concurrently: not found        EXIT=127
//   sony-camera-bridge   sh: 1: tsx: not found / sh -c vite    EXIT=127
//
// Beide Repos bringen einen Starter mit, der nachinstalliert und den
// hardwarefreien Weg waehlt. Dieser Block haelt fest, dass der Knopf IHN
// ruft — sonst faellt das beim naechsten Umbau still zurueck, und der
// Ausfall sieht wieder aus wie „geht halt nicht".
// ───────────────────────────────────────────────────────────────────────────
describe('Die npm-Geraete starten ueber ihren eigenen Starter', () => {
  const starterDatei = process.platform === 'win32' ? 'dev.ps1' : 'dev.sh'

  it('Kamerapult und Intercom rufen dev.sh bzw. dev.ps1', () => {
    for (const id of ['kamera', 'intercom']) {
      const rezept = start.REZEPTE[id]
      expect(rezept.argumente.join(' ')).toContain(starterDatei)
      // Und die Datei ist zugleich Marker: wer sie nicht hat, wird nicht
      // gestartet.
      expect(rezept.marker).toContain(starterDatei)
    }
  })

  it('und nicht mehr `npm run dev` — der Fall, der gemessen fehlschlug', () => {
    for (const id of ['kamera', 'intercom']) {
      const rezept = start.REZEPTE[id]
      const befehl = `${rezept.programm} ${rezept.argumente.join(' ')}`
      expect(befehl).not.toMatch(/npm(\.cmd)?\s+run\s+dev\b/)
    }
  })

  it('auch die Python-Geraete nehmen auf Windows ihren .bat — mit --server', () => {
    // GEMESSEN wird hier der Quelltext und nicht der Lauf: dieser Container
    // ist Linux, und die Windows-Zweige der Rezepte werden nie ausgefuehrt.
    // Genau deshalb steht es hier — ein Zweig, den keine Messung erreicht,
    // veraltet lautlos.
    //
    // `python run-local.py` war auf Windows ein Fehlgriff: der Interpreter
    // heisst dort meist `py`, und ein Windows ohne Store-Alias hat gar kein
    // `python` im PATH. `--server` ist die zweite Haelfte: ohne ihn oeffnen
    // beide Skripte einen Browser und enden mit `pause` — ein Aufrufer, der
    // auf das Ende des Fensters wartet, wartet auf einen Tastendruck.
    const quelle = lies('electron/runtimeStart.cjs')
    for (const zeile of [
      "WINDOWS ? ['/c', 'run_windows.bat', '--server'] : ['run-local.py']",
      "WINDOWS ? ['/c', 'run_windows.bat', '--server'] : ['run-local.sh']",
    ]) {
      expect(quelle).toContain(zeile)
    }
    expect(quelle).not.toMatch(/WINDOWS \? 'python'/)
  })

  it('das Beenden geht an die ganze Gruppe, nicht nur an das Starter-Skript', () => {
    // `bash dev.sh` startet `npm`, das startet `concurrently`, das startet
    // `tsx` und `vite`. Ein SIGTERM an das `bash` laesst die Enkel auf ihren
    // Ports sitzen, und der naechste Start laeuft in „address in use".
    const quelle = lies('electron/runtimeStart.cjs')
    expect(quelle).toContain('detached: !WINDOWS')
    expect(quelle).toContain('process.kill(-pid')
    expect(quelle).toContain('taskkill')
  })
})

describe('Der Befehl steht nicht zweimal verschieden da', () => {
  it('das Rezept und der Fliesstext nennen dasselbe Programm', () => {
    for (const r of RUNTIMES) {
      const rezept = start.REZEPTE[r.id]
      // `start` ist der Satz, der im Nicht-erreichbar-Zustand steht. Er nennt
      // den Befehl in Prosa; hier steht er als Programm + Argumente. Beide
      // muessen dasselbe meinen.
      const genannt = `${rezept.programm} ${rezept.argumente.join(' ')}`
        .replace(/^python3? /, 'python3 ')
        .replace(/^npm(\.cmd)? run /, 'npm run ')
        .replace(/^bash /, '')
      const erwartet = genannt.replace(/^python3 /, '').trim()
      expect(
        r.start.includes(genannt.trim()) || r.start.includes(erwartet),
        `${r.id}: „${r.start}" nennt nicht „${genannt.trim()}"`,
      ).toBe(true)
      expect(rezept.repo).toBe(r.repo)
    }
  })
})

describe('Der Weg ist verdrahtet', () => {
  it('der Hauptprozess nimmt die Aufrufe an', () => {
    const main = lies('electron/main.cjs')
    for (const kanal of ['runtime:start', 'runtime:stop', 'runtime:state', 'runtime:check']) {
      expect(main).toContain(`suiteHost:${kanal}`)
    }
    // Kein verwaister Server auf dem Port, wenn jemand die Suite schliesst.
    expect(main).toContain('before-quit')
    expect(main).toContain('beendeAlle')
  })

  it('die Bruecke steht im Preload', () => {
    expect(lies('electron/preload.cjs')).toContain("exposeInMainWorld('__suiteRuntime'")
  })

  it('und die Oberflaeche bietet den Knopf an', () => {
    const rahmen = lies('src/embed/RuntimeFrame.tsx')
    expect(rahmen).toContain('kannStarten()')
    expect(rahmen).toContain('starteLokal')
    expect(rahmen).toContain('beendeLokal')
  })

  it('aber nur, wo es die Bruecke wirklich gibt', () => {
    // Im Browser-Bau fehlt `__suiteRuntime`. Ein Knopf, der dort nichts tun
    // kann, waere eine Attrappe — und „hier kannst du es starten" ist genau
    // die Art Zusage, die stimmen muss.
    const rahmen = lies('src/embed/RuntimeFrame.tsx')
    expect(rahmen).toMatch(/\{startbar && \(/)
    expect(lies('src/shell/runtimeLokal.ts')).toMatch(/kannStarten = \(\): boolean => bruecke\(\) !== null/)
  })
})
