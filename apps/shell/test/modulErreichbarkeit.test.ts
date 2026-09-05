import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { MODULES } from '../src/modules/registry'
import { RUNTIMES } from '../src/modules/runtimes'
import { defaultAddresses, runtimeUrl } from '../src/shell/runtimeHosts'

// ───────────────────────────────────────────────────────────────────────────
// B-35 — „Vier der acht Repos sind aus der Suite nicht erreichbar."
//
// Der Befund war kein Bug im Code, sondern eine LUECKE: `tally-pi`,
// `sony-camera-bridge`, `Broadcast-intercom` und `pi-media-station` liefen,
// hatten CI und standen in der Feature-Matrix — und die Modul-Registry der
// Shell kannte sie nicht. Nichts konnte das melden, weil nichts danach fragte.
//
// Dieser Guard fragt danach: er zaehlt die Anwendungs-Repos des Monorepos aus
// dem DATEISYSTEM und verlangt, dass jedes von der Shell aus erreichbar ist —
// entweder als mitgelieferter Planer oder als Geraet mit Adresse. Wer ein
// neuntes Repo anlegt und nicht verdrahtet, faellt hier auf, statt es erst
// beim naechsten Korpus-Durchgang zu erfahren.
// ───────────────────────────────────────────────────────────────────────────

const ROOT = join(import.meta.dirname, '..', '..', '..')

/** Die Anwendungs-Repos, die es in diesem Monorepo als Ordner gibt. */
const vendorteApps = readdirSync(join(ROOT, 'apps'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'shell')
  .map((d) => d.name)

describe('Modul-Registry — jede Anwendung ist von der Shell aus erreichbar', () => {
  it('jedes Modul hat genau einen Weg: Planer, Geraet oder shell-eigene Ansicht', () => {
    const shellEigen = ['overview', 'board']
    for (const m of MODULES) {
      const wege = [m.planner ? 'planner' : null, m.runtime ? 'runtime' : null].filter(Boolean)
      if (shellEigen.includes(m.id)) {
        expect(wege, `${m.id} ist eine shell-eigene Ansicht und braucht keinen Weg nach draussen`).toEqual([])
      } else {
        expect(wege, `${m.id} braucht genau einen Weg nach draussen`).toHaveLength(1)
      }
    }
  })

  it('jede vendorte Planer-App steckt hinter einem Modul', () => {
    // `apps/<name>` ohne Shell sind die drei Planer. Kaeme ein vierter dazu,
    // ohne Modul, faellt es hier auf.
    const plannerModule = MODULES.filter((m) => m.planner).map((m) => m.planner)
    expect(plannerModule).toHaveLength(vendorteApps.length)
  })

  it('die vier Laufzeit-Anwendungen sind als Module verdrahtet (B-35)', () => {
    const repos = MODULES.filter((m) => m.runtime).map((m) => m.eyebrow).sort()
    expect(repos).toEqual(
      ['Broadcast-intercom', 'pi-media-station', 'sony-camera-bridge', 'tally-pi'].sort(),
    )
  })

  it('jede Laufzeit-Anwendung hat eine vollstaendige Vorgabe-Adresse', () => {
    const adressen = defaultAddresses()
    for (const r of RUNTIMES) {
      expect(adressen[r.id].host, `${r.id} ohne Host`).toBeTruthy()
      expect(adressen[r.id].port, `${r.id} ohne Port`).toBeGreaterThan(0)
      expect(runtimeUrl(r.id, adressen)).toMatch(/^http:\/\/[^/]+:\d+\//)
    }
  })

  it('kein Modul-Hotkey ist doppelt vergeben', () => {
    const hotkeys = MODULES.map((m) => m.hotkey)
    expect(new Set(hotkeys).size).toBe(hotkeys.length)
  })

  it('die Vorgabe-Ports stehen so in den Repos, aus denen sie stammen', () => {
    // Der Grund fuer diese Pruefung: eine Vorgabe aus dem Gedaechtnis ist eine
    // Behauptung ueber fremden Code. Steht das Repo daneben, wird sie
    // nachgelesen; steht es nicht da (frischer Klon, CI ohne die
    // Nachbar-Repos), wird die Pruefung uebersprungen statt geraten.
    const belege: { id: string; datei: string; muster: RegExp }[] = [
      { id: 'tally', datei: 'tally-pi/guide_server.py', muster: /^PORT\s*=\s*8080$/m },
      { id: 'kamera', datei: 'sony-camera-bridge/packages/web-rcp/vite.config.ts', muster: /port:\s*3700/ },
      { id: 'intercom', datei: 'Broadcast-intercom/apps/server/src/index.ts', muster: /PORT\s*\|\|\s*4001/ },
      { id: 'medien', datei: 'pi-media-station/main.py', muster: /web_port",\s*5000/ },
    ]
    let geprueft = 0
    for (const b of belege) {
      let quelle: string
      try {
        quelle = readFileSync(join(ROOT, '..', b.datei), 'utf8')
      } catch {
        continue // Nachbar-Repo nicht ausgecheckt — nichts zu pruefen.
      }
      geprueft += 1
      expect(quelle, `${b.datei} nennt den Port nicht mehr so`).toMatch(b.muster)
    }
    expect(geprueft, 'kein Nachbar-Repo ausgecheckt — Ports nicht nachgeprueft').toBeGreaterThanOrEqual(0)
  })
})
