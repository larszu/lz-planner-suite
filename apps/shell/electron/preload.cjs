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

// Der Weg zum tally-pi steht IMMER bereit, nicht nur im nativen Cable-Modus:
// die Tally-Karte kommt ueber den postMessage-Bus aus dem eingebetteten
// Planer, und der laeuft in beiden Betriebsarten. Waere die Bruecke an
// `nativeCable` gebunden, funktionierte der Knopf ausgerechnet in der
// ausgelieferten Standard-Einstellung nicht.
contextBridge.exposeInMainWorld('__suiteTally', {
  read: (basisUrl) => ipcRenderer.invoke('suiteHost:tally:read', basisUrl),
  write: (basisUrl, devices) => ipcRenderer.invoke('suiteHost:tally:write', basisUrl, devices),
})

if (nativeCable) {
  contextBridge.exposeInMainWorld('__suiteNativeHost', {
    cable: {
      show: (bounds) => ipcRenderer.invoke('suiteHost:cable:show', bounds),
      setBounds: (bounds) => ipcRenderer.invoke('suiteHost:cable:setBounds', bounds),
      hide: () => ipcRenderer.invoke('suiteHost:cable:hide'),
    },
  })
}
