// Projekte als Dateien (B-39.3).
//
// Geprueft wird der Teil, an dem eine Show verlorengehen kann: das Schreiben.
// Der Dialog selbst gehoert Electron; was hier zaehlt, ist, dass ein
// abgebrochener Schreibvorgang keine halbe Datei hinterlaesst und dass ein
// zweites Speichern dieselbe Datei ersetzt statt danebenzuschreiben.
//
// Dazu zwei Quelltext-Pruefungen. Sie sind kein Ersatz fuer einen Lauf im
// Electron-Fenster, aber sie fangen genau die zwei Faelle, in denen der Weg
// still falsch waere: ein Pfad, der ueber einen Projektwechsel hinweg
// stehenbleibt, und ein Renderer, der den Host nicht anbietet.
import { describe, expect, it } from 'vitest'
import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require_ = createRequire(import.meta.url)
// `dialog` aus Electron wird beim Laden nur destrukturiert, nicht aufgerufen —
// die beiden Funktionen darunter sind ohne Electron-Prozess benutzbar, solange
// kein Dialog noetig ist (also mit `pfad`).
const projectFiles = require_('../electron/projectFiles.cjs') as {
  speichere: (
    fenster: unknown,
    args: { pfad?: string; name: string; inhalt: string },
  ) => Promise<{ ok: boolean; path?: string; canceled?: boolean; error?: string }>
}

const quelle = (p: string) =>
  readFile(new URL(p, import.meta.url), 'utf8')

describe('Schreiben', () => {
  it('legt die Datei an und liefert ihren Pfad', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'avsuite-'))
    const ziel = join(dir, 'Show.avsuite.json')
    const r = await projectFiles.speichere(null, { pfad: ziel, name: 'Show', inhalt: '{"a":1}' })
    expect(r.ok).toBe(true)
    expect(r.path).toBe(ziel)
    expect(await readFile(ziel, 'utf8')).toBe('{"a":1}')
  })

  it('laesst keine Nachbardatei zurueck', async () => {
    // Der Umweg ueber `.tmp` ist der Grund, warum ein abgebrochener Vorgang
    // keine halbe Datei hinterlaesst. Bleibt sie liegen, sammelt sich Muell
    // im Projektordner an — und beim naechsten Mal fragt jemand, was das ist.
    const dir = await mkdtemp(join(tmpdir(), 'avsuite-'))
    await projectFiles.speichere(null, { pfad: join(dir, 'Show.avsuite.json'), name: 'Show', inhalt: '{}' })
    expect(await readdir(dir)).toEqual(['Show.avsuite.json'])
  })

  it('ersetzt eine bestehende Datei vollstaendig', async () => {
    // Der gefaehrliche Fall: kuerzerer Inhalt ueber laengeren. Wer die Datei
    // oeffnet und hineinschreibt, statt sie zu ersetzen, laesst den Rest der
    // alten stehen — und das Ergebnis ist syntaktisch kaputtes JSON.
    const dir = await mkdtemp(join(tmpdir(), 'avsuite-'))
    const ziel = join(dir, 'Show.avsuite.json')
    await writeFile(ziel, '{"lang":"' + 'x'.repeat(500) + '"}', 'utf8')
    await projectFiles.speichere(null, { pfad: ziel, name: 'Show', inhalt: '{}' })
    expect(await readFile(ziel, 'utf8')).toBe('{}')
  })

  it('antwortet mit einem Fehler, statt zu werfen', async () => {
    // Ein Speichervorgang, dessen Ergebnis der Renderer nicht erfaehrt, ist
    // schlimmer als keiner: der Nutzer glaubt, die Show sei auf der Platte.
    const r = await projectFiles.speichere(null, {
      pfad: '/gibt-es-nicht/tief/darunter/Show.avsuite.json',
      name: 'Show',
      inhalt: '{}',
    })
    expect(r.ok).toBe(false)
    expect(typeof r.error).toBe('string')
  })
})

describe('Verdrahtet', () => {
  it('der Dateipfad faellt beim Projektwechsel weg', async () => {
    // Sonst schriebe das naechste „Speichern" das neue Projekt in die Datei
    // des alten, und zwar still.
    const app = await quelle('../src/App.tsx')
    const i = app.indexOf('const commitProject = useCallback')
    expect(i).toBeGreaterThan(-1)
    expect(app.slice(i, i + 700)).toMatch(/setProjectPath\(null\)/)
  })

  it('Speichern schreibt in die Datei, sobald es eine gibt', async () => {
    const app = await quelle('../src/App.tsx')
    expect(app).toMatch(/host\.save\(\{ path: projectPath/)
  })

  it('der Main-Prozess bietet beide Wege an, der Preload reicht sie durch', async () => {
    const main = await quelle('../electron/main.cjs')
    expect(main).toMatch(/suiteHost:project:save/)
    expect(main).toMatch(/suiteHost:project:open/)
    const preload = await quelle('../electron/preload.cjs')
    expect(preload).toMatch(/__suiteProjectFiles/)
  })
})
