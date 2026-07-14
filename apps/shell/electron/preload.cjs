// Preload der AV Planner Suite.
//
// Reicht der Renderer-Shell die Paket-URLs der drei mitverpackten Planer-
// Renderer durch. Der Hauptprozess liefert diese über die privilegierten
// planner-*://-Protokolle aus dem Paketverzeichnis aus (siehe main.cjs). Die
// Registry der Shell liest window.__suitePlanners und bettet dann die *echten*
// Planer statt einer Vorschau ein. Fehlt das Objekt (Browser/Dev), fällt die
// Shell auf die VITE_PLANNER_*-Dev-URLs zuruck.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('__suitePlanners', {
  signal: 'planner-signal://app/index.html',
  cameras: 'planner-cameras://app/index.html',
  licht: 'planner-licht://app/index.html',
})

// Nativer Cable-Modus (experimentell): ist er im Hauptprozess aktiv, bekommt
// der Renderer eine Steuer-API für die WebContentsView (Position/Sichtbarkeit
// des echten Cable-Planers im Signal-Feld). Fehlt sie, nutzt der Renderer den
// iframe-Pfad. sendSync ist hier ok — einmalig beim Preload-Start.
let nativeCable = false
try {
  nativeCable = ipcRenderer.sendSync('suiteHost:cable:available') === true
} catch {
  nativeCable = false
}

if (nativeCable) {
  contextBridge.exposeInMainWorld('__suiteNativeHost', {
    cable: {
      show: (bounds) => ipcRenderer.invoke('suiteHost:cable:show', bounds),
      setBounds: (bounds) => ipcRenderer.invoke('suiteHost:cable:setBounds', bounds),
      hide: () => ipcRenderer.invoke('suiteHost:cable:hide'),
    },
  })
}
