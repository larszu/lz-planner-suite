// Kopiert die gebauten Renderer der drei Planer in das Suite-Paket, damit
// electron-builder sie mitverpackt und der Suite-Hauptprozess sie über die
// planner-*://-Protokolle ausliefern kann. Voraussetzung: die Planer-Renderer
// sind bereits gebaut (npm run build:renderer / build im jeweiligen Workspace).
//
// Ziel-Layout:  apps/shell/planners/{signal,cameras,licht}/index.html + assets
import { existsSync, rmSync, cpSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const shellDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appsDir = resolve(shellDir, '..')

// key = Modul-Slug in der Shell-Registry; src = gebautes Renderer-Verzeichnis.
const planners = [
  { key: 'signal', src: join(appsDir, 'cable-planner', 'dist', 'renderer') },
  { key: 'cameras', src: join(appsDir, 'multicam-planner', 'dist') },
  { key: 'licht', src: join(appsDir, 'light-planner', 'dist') },
]

const outRoot = join(shellDir, 'planners')
rmSync(outRoot, { recursive: true, force: true })
mkdirSync(outRoot, { recursive: true })

let ok = true
for (const { key, src } of planners) {
  const indexHtml = join(src, 'index.html')
  if (!existsSync(indexHtml)) {
    console.error(`[copy-planners] FEHLT: ${indexHtml} — bitte den ${key}-Renderer zuerst bauen.`)
    ok = false
    continue
  }
  const dest = join(outRoot, key)
  cpSync(src, dest, { recursive: true })
  console.log(`[copy-planners] ${key}: ${src} → ${dest}`)
}

if (!ok) process.exit(1)
console.log('[copy-planners] fertig.')
