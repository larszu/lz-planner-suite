// Electron-Hauptprozess der AV Planner Suite (Desktop-Verpackung).
//
// Die Shell ist eine gebündelte Web-App (dist/), die die drei echten Planer als
// iframe-Module einbettet. Damit die *echten* Planer-Renderer im Desktop-Build
// laufen (keine Mock-Vorschau), werden sie mit ins Paket verpackt
// (apps/shell/planners/{signal,cameras,licht}) und hier über eigene,
// privilegierte planner-*://-Protokolle aus dem Dateisystem ausgeliefert.
//
// Warum ein Protokoll statt file://: die Planer sind eigenständige SPAs mit
// relativen Asset-Pfaden und eigenen CSPs — ein standard/secure-Schema gibt
// jedem Planer eine stabile, gleichbleibende Origin (planner-signal://app/…),
// unter der Assets, dynamische Imports und Worker sauber auflösen.
const { app, BrowserWindow, shell, protocol, net } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

// Schema-Slug → Planer-Verzeichnis unter apps/shell/planners/.
const PLANNERS = {
  'planner-signal': 'signal',
  'planner-cameras': 'cameras',
  'planner-licht': 'licht',
}

// Privilegierte Schemata MÜSSEN vor app.whenReady registriert werden. standard:
// Origin/Pfad-Semantik (relative Imports), secure: gilt als sicherer Kontext
// (Worker, Module), supportFetchAPI/corsEnabled: fetch aus dem Renderer.
protocol.registerSchemesAsPrivileged(
  Object.keys(PLANNERS).map((scheme) => ({
    scheme,
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
  })),
)

function registerPlannerProtocols() {
  for (const [scheme, dir] of Object.entries(PLANNERS)) {
    const root = path.resolve(path.join(__dirname, '..', 'planners', dir))
    protocol.handle(scheme, (request) => {
      const url = new URL(request.url)
      // host wird ignoriert (immer „app"); nur der Pfad zählt. Root → index.html.
      let rel = decodeURIComponent(url.pathname)
      if (rel === '/' || rel === '') rel = '/index.html'
      const target = path.resolve(path.join(root, rel))
      // Pfad-Traversal-Schutz: Ziel muss im Planer-Verzeichnis bleiben.
      if (target !== root && !target.startsWith(root + path.sep)) {
        return new Response('Forbidden', { status: 403 })
      }
      return net.fetch(pathToFileURL(target).toString())
    })
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0b0d12',
    title: 'AV Planner Suite',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // target=_blank / window.open → Standardbrowser statt neuem Electron-Fenster.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Dev: laufender Vite-Server (SUITE_DEV_SERVER_URL). Prod: gebautes Bundle.
  const devUrl = process.env.SUITE_DEV_SERVER_URL
  if (devUrl) {
    win.loadURL(devUrl)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  registerPlannerProtocols()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
