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
    // Der gefaehrlichste Fall: die Marker-Datei IST da (jedes Node-Projekt hat
    // ein package.json), und ohne den Namensabgleich liefe `npm run dev` in
    // irgendeinem fremden Projekt.
    const fremd = join(tmp, 'fremd')
    mkdirSync(fremd, { recursive: true })
    writeFileSync(join(fremd, 'package.json'), JSON.stringify({ name: 'irgendwas-anderes' }))
    const r = start.passendesVerzeichnis('kamera', fremd)
    expect(r.ok).toBe(false)
    expect(r.grund).toBe('falsches-repo')
    expect(r.gefunden).toBe('irgendwas-anderes')
  })

  it('das richtige Verzeichnis geht durch', () => {
    const echt = join(tmp, 'sony-camera-bridge')
    mkdirSync(echt, { recursive: true })
    writeFileSync(join(echt, 'package.json'), JSON.stringify({ name: 'sony-camera-bridge' }))
    expect(start.passendesVerzeichnis('kamera', echt)).toMatchObject({ ok: true })
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
