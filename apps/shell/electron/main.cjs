// Electron-Hauptprozess der AV Planner Suite (Desktop-Verpackung).
//
// Die Shell ist eine reine Web-App: der Renderer wird von Vite vollständig
// gebündelt (dist/), der Planer-Bridge läuft über postMessage zwischen den
// iframes — es gibt keinen Electron-IPC und daher auch kein Preload. Dieser
// Prozess öffnet nur ein Fenster und lädt das gebaute index.html; externe
// Links (der „In neuem Tab öffnen"-Fallback der eingebetteten Planer) gehen
// in den Standardbrowser.
const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')

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
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
